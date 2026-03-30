import {
  REFLECTION_SUMMARY_FIELDS,
  REVIEW_ACTIONS,
  SCREEN_PROMPTS,
} from "./constants.js?v=20260321c";
import {
  FLOW_QUESTIONS,
  REVIEW_ACTION_TARGETS,
  getBranchFocusOptions,
  getCoreRealizationOptions,
  getFlowQuestionById,
  getImageryOptionsForCategory,
  getStoryEmotionGroups,
  getStoryEmotionOptions,
} from "./decisionTreeData.js?v=20260321c";
import { getBranchPromptForFunction } from "./branching.js?v=20260321c";
import { generatePromptSet } from "./generator.js?v=20260321c";
import {
  buildReflectionSummary,
  mergeReflectionSummary,
} from "./mapping.js?v=20260321c";
import { normalizeIntake } from "./schema.js?v=20260321c";
import {
  clearStoredSession,
  getStorage,
} from "./store.js?v=20260321c";

const BUILD_ID = "20260321c";
const appEl = document.getElementById("app");
const storage = getStorage();
clearStoredSession(storage);

const state = {
  answers: {},
  summaryOverrides: {},
  generation: null,
  errors: [],
};

const HOW_IT_WORKS_PHASES = [
  {
    label: "SET THE PURPOSE",
    description:
      "Therapist and client begin by naming what the song is for in this session.",
    mechanisms: [
      "session focus",
      "externalized reflection",
      "shared goal setting",
    ],
    action: "Choose the song purpose and the part of it that matters most today.",
  },
  {
    label: "MAP THE EMOTIONS",
    description:
      "The flow uses core emotions and second-layer feelings to give the song an emotional center.",
    mechanisms: [
      "core emotion families",
      "mixed-state support",
      "emotion naming",
    ],
    action: "Pick up to 2 core emotions, then up to 3 related feelings.",
  },
  {
    label: "SHAPE THE SONG",
    description:
      "Listener, imagery, tone, and genre choices turn the reflection into song direction.",
    mechanisms: [
      "narrative direction",
      "imagery anchors",
      "musical translation",
    ],
    action: "Choose who the song is for, what it should hold, and how the music should carry it.",
  },
  {
    label: "REVIEW TOGETHER",
    description:
      "The therapist-facing session snapshot gives a quick way to review the direction before using Suno.",
    mechanisms: ["shared review", "session snapshot", "prompt shaping"],
    action: "Adjust the summary until it feels clear enough to become a draft.",
  },
  {
    label: "GENERATE AND USE",
    description:
      "The app creates a brief therapist snapshot plus Lyrics and Styles text for Suno.",
    mechanisms: [
      "Suno readiness",
      "low-friction drafting",
      "listen and revise",
    ],
    action: "Paste Lyrics and Styles into Suno, listen, and refine together.",
  },
];

const HOW_IT_WORKS_ARTIFACT = {
  label: "SESSION SNAPSHOT + SUNO DRAFT",
  description: "A brief therapist reflection summary plus Lyrics and Styles prompts for Suno.",
  effects: [
    "less blank-page friction",
    "shared language in session",
    "faster prompt drafting",
    "cleaner handoff into Suno",
  ],
};

const REQUIRED_QUESTIONS = FLOW_QUESTIONS.filter((question) => question.required);
const QUESTION_BLOCKS = [
  "song_function",
  "branch_focus",
  "emotional_signal",
  "story_emotions",
  "core_realization",
  { id: "listener_perspective", parentId: "directed_listener", childId: "song_perspective" },
  { id: "imagery_pair", parentId: "imagery_category", childId: "imagery_detail" },
  { id: "music_pair", parentId: "musical_tone", childId: "genre" },
  "avoid_topics",
];
const REQUIRED_BLOCKS = QUESTION_BLOCKS.filter((block) => {
  if (typeof block === "string") {
    return Boolean(getFlowQuestionById(block)?.required);
  }
  return Boolean(getFlowQuestionById(block.parentId)?.required || getFlowQuestionById(block.childId)?.required);
});

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAnswer(questionId) {
  return state.answers[questionId];
}

function setAnswer(questionId, value) {
  state.answers[questionId] = value;
}

function getOtherAnswer(questionId) {
  return state.answers[`${questionId}__other`] || "";
}

function setOtherAnswer(questionId, value) {
  state.answers[`${questionId}__other`] = value;
}

function clearGeneratedOutput() {
  state.generation = null;
}

function resetBranchAnswers() {
  setAnswer("branch_focus", "");
  setAnswer("core_realization", "");
  setOtherAnswer("core_realization", "");
}

function clearSessionState() {
  state.answers = {};
  state.summaryOverrides = {};
  state.generation = null;
  state.errors = [];
}

function getSelectedStoryEmotionGroups() {
  return getStoryEmotionGroups(getAnswer("emotional_signal"));
}

function syncStoryEmotionSelections() {
  const allowed = new Set(getStoryEmotionOptions(getAnswer("emotional_signal")));
  const current = Array.isArray(getAnswer("story_emotions")) ? getAnswer("story_emotions") : [];
  const filtered = current.filter((value) => allowed.has(value));
  if (filtered.length !== current.length) {
    setAnswer("story_emotions", filtered);
  }
}

function hasSessionData() {
  return (
    Object.values(state.answers).some((value) => isAnswerFilled(value)) ||
    Object.keys(state.summaryOverrides).length > 0 ||
    Boolean(state.generation)
  );
}

function startNewSession() {
  clearSessionState();
  clearStoredSession(storage);
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function isAnswerFilled(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return Boolean(String(value || "").trim());
}

function parseAvoidTopics(value) {
  return String(value || "")
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function getQuestionOptions(question) {
  if (question.id === "branch_focus") {
    return getBranchFocusOptions(getAnswer("song_function"));
  }
  if (question.id === "core_realization") {
    return getCoreRealizationOptions(getAnswer("song_function"));
  }
  if (question.id === "story_emotions") {
    return getStoryEmotionOptions(getAnswer("emotional_signal"));
  }
  if (question.id === "imagery_detail") {
    return getImageryOptionsForCategory(getAnswer("imagery_category"));
  }
  return question.options || [];
}

function getQuestionLabel(question) {
  if (question.id === "branch_focus") {
    const songFunction = getAnswer("song_function");
    if (songFunction && getQuestionOptions(question).length) {
      return getBranchPromptForFunction(songFunction);
    }
  }
  return question.label;
}

function isCustomSelectOption(question, option) {
  return question.otherTrigger === option && String(option || "").toLowerCase().startsWith("write my own");
}

function isQuestionAvailable(question) {
  if (!question.dependsOn) {
    return true;
  }
  return isAnswerFilled(getAnswer(question.dependsOn));
}

function isQuestionSatisfied(question) {
  if (!isQuestionAvailable(question)) {
    return false;
  }

  const answer = getAnswer(question.id);
  if (!isAnswerFilled(answer)) {
    return false;
  }

  if (question.maxSelect && Array.isArray(answer) && answer.length > question.maxSelect) {
    return false;
  }

  if (question.otherTrigger) {
    const usesOther = Array.isArray(answer)
      ? answer.includes(question.otherTrigger)
      : answer === question.otherTrigger;
    if (usesOther) {
      return isAnswerFilled(getOtherAnswer(question.id));
    }
  }

  return true;
}

function getVisibleQuestions() {
  const visible = [];

  for (const question of FLOW_QUESTIONS) {
    if (!isQuestionAvailable(question)) {
      continue;
    }

    visible.push(question);

    if (question.required && !isQuestionSatisfied(question)) {
      break;
    }
  }

  return visible;
}

function getVisibleBlocks() {
  const visibleQuestionIds = new Set(getVisibleQuestions().map((question) => question.id));

  return QUESTION_BLOCKS.flatMap((block) => {
    if (typeof block === "string") {
      const question = getFlowQuestionById(block);
      return question && visibleQuestionIds.has(block) ? [{ type: "single", question }] : [];
    }

    if (!visibleQuestionIds.has(block.parentId)) {
      return [];
    }

    const parentQuestion = getFlowQuestionById(block.parentId);
    const childQuestion = visibleQuestionIds.has(block.childId)
      ? getFlowQuestionById(block.childId)
      : null;

    return parentQuestion
      ? [
          {
            type: "compound",
            id: block.id,
            parentQuestion,
            childQuestion,
          },
        ]
      : [];
  });
}

function isBlockSatisfied(block) {
  if (typeof block === "string") {
    const question = getFlowQuestionById(block);
    return Boolean(question && isQuestionSatisfied(question));
  }

  const parentQuestion = getFlowQuestionById(block.parentId);
  const childQuestion = getFlowQuestionById(block.childId);
  return Boolean(
    parentQuestion &&
      childQuestion &&
      isQuestionSatisfied(parentQuestion) &&
      isQuestionSatisfied(childQuestion)
  );
}

function getAnsweredRequiredCount() {
  return REQUIRED_BLOCKS.filter((block) => isBlockSatisfied(block)).length;
}

function areRequiredQuestionsComplete() {
  return getAnsweredRequiredCount() === REQUIRED_BLOCKS.length;
}

function resolveAnswerValue(questionId) {
  const question = getFlowQuestionById(questionId);
  const answer = getAnswer(questionId);
  if (!question) {
    return answer;
  }

  if (question.otherTrigger && answer === question.otherTrigger) {
    return getOtherAnswer(questionId).trim();
  }

  return answer;
}

function buildRawIntakeFromFlow() {
  return {
    song_function: resolveAnswerValue("song_function"),
    branch_focus: resolveAnswerValue("branch_focus"),
    emotional_signal: Array.isArray(getAnswer("emotional_signal")) ? getAnswer("emotional_signal") : [],
    story_emotions: Array.isArray(getAnswer("story_emotions")) ? getAnswer("story_emotions") : [],
    core_realization: resolveAnswerValue("core_realization"),
    directed_listener: resolveAnswerValue("directed_listener"),
    song_perspective: resolveAnswerValue("song_perspective"),
    imagery_category: resolveAnswerValue("imagery_category"),
    imagery_detail: resolveAnswerValue("imagery_detail"),
    musical_tone: resolveAnswerValue("musical_tone"),
    genre: resolveAnswerValue("genre"),
    avoid_topics: parseAvoidTopics(getAnswer("avoid_topics")),
    reflection_summary: { ...state.summaryOverrides },
  };
}

function buildPreviewSummary() {
  const intake = normalizeIntake(buildRawIntakeFromFlow());
  const summary = buildReflectionSummary(intake);
  return mergeReflectionSummary(summary, state.summaryOverrides);
}

function validateBeforeGenerate() {
  const errors = [];

  for (const question of REQUIRED_QUESTIONS) {
    if (!isQuestionSatisfied(question)) {
      errors.push(`One more step: ${getQuestionLabel(question)}`);
      break;
    }
  }

  return errors;
}

function renderProgress() {
  const answered = getAnsweredRequiredCount();
  const percent = Math.round((answered / REQUIRED_BLOCKS.length) * 100);

  return `
    <section class="question-panel compact-panel">
      <p class="subtle">Session progress: ${answered}/${REQUIRED_BLOCKS.length} sections complete.</p>
      <div class="progress-wrap">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
    </section>
  `;
}

function renderSingleQuestionField(question, labelText) {
  const answer = getAnswer(question.id) || "";
  const options = getQuestionOptions(question);
  const showOtherInput = answer === question.otherTrigger;

  return `
    <label class="field">
      <span class="question-label">${escapeHtml(labelText)}${question.required ? " *" : ""}</span>
      <select class="question-select${isCustomSelectOption(question, answer) ? " custom-selected" : ""}" data-question-id="${question.id}">
        <option value="">Pick one...</option>
        ${options
          .map(
            (option) => `<option value="${escapeHtml(option)}" ${
              answer === option ? "selected" : ""
            }${isCustomSelectOption(question, option) ? ' style="font-style: italic;"' : ""}>${escapeHtml(option)}</option>`
          )
          .join("")}
      </select>
    </label>
    ${
      question.otherTrigger && showOtherInput
        ? `<label class="field followup-field">
            <span>${escapeHtml(question.otherLabel || "Add your own answer")}</span>
            <input
              class="question-other-input"
              data-question-id="${question.id}"
              type="text"
              value="${escapeHtml(getOtherAnswer(question.id))}"
              placeholder="${escapeHtml(question.otherPlaceholder || "") }"
              maxlength="180"
            >
          </label>`
        : ""
    }
  `;
}

function renderSingleQuestion(question, index) {
  const label = `${index}. ${getQuestionLabel(question)}`;

  return `
    <div class="question-group" id="question-${escapeHtml(question.id)}">
      ${renderSingleQuestionField(question, label)}
    </div>
  `;
}

function renderStoryEmotionQuestion(question, index) {
  const answers = Array.isArray(getAnswer(question.id)) ? getAnswer(question.id) : [];
  const groups = getSelectedStoryEmotionGroups();

  return `
    <div class="question-group" id="question-${escapeHtml(question.id)}">
      <p class="question-label">${index}. ${escapeHtml(getQuestionLabel(question))}${question.required ? " *" : ""}</p>
      <div class="emotion-groups">
        ${groups.map(
          (group) => `
            <section class="emotion-group">
              <p class="emotion-group-label">${escapeHtml(group.label)}</p>
              <div class="emotion-grid">
                ${group.options
                  .map((option) => {
                    const checked = answers.includes(option) ? "checked" : "";
                    const selectedClass = checked ? " selected" : "";
                    return `<label class="emotion-card${selectedClass}">
                      <input
                        class="question-checkbox"
                        data-question-id="${question.id}"
                        data-max-select="${question.maxSelect || ""}"
                        type="checkbox"
                        value="${escapeHtml(option)}"
                        ${checked}
                      >
                      <span>${escapeHtml(option)}</span>
                    </label>`;
                  })
                  .join("")}
              </div>
            </section>
          `
        ).join("")}
      </div>
      ${question.maxSelect ? `<p class="hint">Pick up to ${question.maxSelect} across the selected emotion families.</p>` : ""}
    </div>
  `;
}

function renderMultiQuestion(question, index) {
  if (question.id === "story_emotions") {
    return renderStoryEmotionQuestion(question, index);
  }

  const answers = Array.isArray(getAnswer(question.id)) ? getAnswer(question.id) : [];
  const options = getQuestionOptions(question);
  const label = getQuestionLabel(question);

  return `
    <div class="question-group" id="question-${escapeHtml(question.id)}">
      <p class="question-label">${index}. ${escapeHtml(label)}${question.required ? " *" : ""}</p>
      <div class="choice-list">
        ${options
          .map((option) => {
            const checked = answers.includes(option) ? "checked" : "";
            return `<label class="choice">
              <input
                class="question-checkbox"
                data-question-id="${question.id}"
                data-max-select="${question.maxSelect || ""}"
                type="checkbox"
                value="${escapeHtml(option)}"
                ${checked}
              >
              ${escapeHtml(option)}
            </label>`;
          })
          .join("")}
      </div>
      ${question.maxSelect ? `<p class="hint">Pick up to ${question.maxSelect}.</p>` : ""}
    </div>
  `;
}

function renderTextQuestionField(question, labelText) {
  const answer = String(getAnswer(question.id) || "");
  return `
    <label class="field">
      <span class="question-label">${escapeHtml(labelText)}</span>
      <textarea
        class="question-textarea"
        data-question-id="${question.id}"
        rows="3"
        maxlength="${question.maxLength || 400}"
        placeholder="${escapeHtml(question.placeholder || "") }"
      >${escapeHtml(answer)}</textarea>
    </label>
  `;
}

function renderTextQuestion(question, index) {
  const label = `${index}. ${getQuestionLabel(question)}`;
  return `
    <div class="question-group" id="question-${escapeHtml(question.id)}">
      ${renderTextQuestionField(question, label)}
    </div>
  `;
}

function renderCompoundQuestion(parentQuestion, childQuestion, index) {
  const childMarkup = childQuestion
    ? childQuestion.responseType === "text"
      ? renderTextQuestionField(childQuestion, getQuestionLabel(childQuestion))
      : renderSingleQuestionField(childQuestion, getQuestionLabel(childQuestion))
    : "";

  return `
    <div class="question-group question-compound" id="question-${escapeHtml(parentQuestion.id)}">
      ${renderSingleQuestionField(parentQuestion, `${index}. ${getQuestionLabel(parentQuestion)}`)}
      ${
        childMarkup
          ? `<div class="question-followup" id="question-${escapeHtml(childQuestion.id)}">
              ${childMarkup}
            </div>`
          : ""
      }
    </div>
  `;
}

function renderQuestion(question, index) {
  if (question.responseType === "multi") {
    return renderMultiQuestion(question, index);
  }
  if (question.responseType === "text") {
    return renderTextQuestion(question, index);
  }
  return renderSingleQuestion(question, index);
}

function renderQuestionsPanel() {
  const visibleBlocks = getVisibleBlocks();

  return `
    <section class="question-panel">
      <h3>Guide the session</h3>
      <p class="subtle">Use this with a client to turn reflection into a song draft you can carry into Suno together.</p>
      <p class="support-note">Nothing is stored by default. Short answers are enough, and you can start a new session at any time.</p>
      <div class="form-stack">
        ${visibleBlocks
          .map((block, index) =>
            block.type === "compound"
              ? renderCompoundQuestion(block.parentQuestion, block.childQuestion, index + 1)
              : renderQuestion(block.question, index + 1)
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderReviewPanel() {
  if (!areRequiredQuestionsComplete()) {
    return `
      <section class="question-panel">
        <h3>Therapist Session Snapshot</h3>
        <p class="subtle">Finish the visible sections and this review step will open before prompt generation.</p>
      </section>
    `;
  }

  const summary = buildPreviewSummary();
  const errorMarkup = state.errors.length
    ? `<div class="errors action-feedback" id="action-feedback">${state.errors
        .map((error) => `<p>${escapeHtml(error)}</p>`)
        .join("")}</div>`
    : "";

  return `
    <section class="question-panel review-panel">
      <h3>Therapist Session Snapshot</h3>
      <p class="subtle">This snapshot helps the therapist and client review the song direction together before building the Suno draft.</p>
      <div class="summary-grid">
        ${REFLECTION_SUMMARY_FIELDS.map(
          (field) => `
            <label class="field summary-field">
              <span class="question-label">${escapeHtml(field.label)}</span>
              <textarea
                class="summary-input"
                data-summary-key="${field.id}"
                rows="2"
                maxlength="240"
              >${escapeHtml(summary[field.id] || "")}</textarea>
            </label>
          `
        ).join("")}
      </div>
      <div class="question-group">
        <p class="question-label">${escapeHtml(SCREEN_PROMPTS.reflectionCheck)}</p>
        <div class="summary-actions">
          ${REVIEW_ACTIONS.map((action) =>
            action.id === "generate"
              ? `<button id="generate-btn" class="primary">${escapeHtml(action.label)}</button>`
              : `<button class="adjust-btn" data-action-id="${action.id}">${escapeHtml(action.label)}</button>`
          ).join("")}
        </div>
      </div>
      ${errorMarkup}
    </section>
  `;
}

function renderPromptBlock(id, title, subtitle, value) {
  if (!value) {
    return "";
  }
  return `
    <article class="prompt-block">
      <h4>${escapeHtml(title)}</h4>
      ${subtitle ? `<p class="prompt-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <textarea id="${id}" rows="${id === "therapist-summary" ? 10 : 18}">${escapeHtml(value)}</textarea>
      <button class="copy-btn" data-copy-target="${id}">Copy</button>
    </article>
  `;
}

function renderSunoHelp() {
  return `
    <section class="suno-help">
      <h4>How to paste this into Suno</h4>
      <ol>
        <li>Open Suno and start a song. If you need one, create a free account first.</li>
        <li>Click <strong>Advanced</strong> to show the <strong>Lyrics</strong> and <strong>Styles</strong> fields.</li>
        <li>Paste the Lyrics prompt into <strong>Lyrics</strong> and the Styles prompt into <strong>Styles</strong>.</li>
        <li>In the Lyrics box, choose <strong>Edit Lyrics</strong>, then type <strong>go</strong> in the new box to turn the prompt into lyrics.</li>
      </ol>
      <p class="suno-help-note">The therapist session snapshot is for review or notes only. Paste only the Lyrics and Styles blocks into Suno.</p>
    </section>
  `;
}

function renderMechanismList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderFrameworkPhase(phase) {
  return `
    <article class="framework-box">
      <p class="framework-phase-label">${escapeHtml(phase.label)}</p>
      <p class="framework-description">${escapeHtml(phase.description)}</p>
      <div class="framework-meta">
        <p class="framework-meta-label">Mechanisms</p>
        <ul class="framework-list">
          ${renderMechanismList(phase.mechanisms)}
        </ul>
      </div>
      <div class="framework-meta">
        <p class="framework-meta-label">Example session step</p>
        <p class="framework-action">${escapeHtml(phase.action)}</p>
      </div>
    </article>
  `;
}

function renderHowItWorks() {
  return `
    <details class="how-it-works-panel">
      <summary>How It Works</summary>
      <div class="how-it-works-body">
        <h4>From session reflection to Suno draft</h4>
        <p class="subtle">
          A simple map of how a therapist and client can move from reflection to a usable Suno starting point.
        </p>
        <div class="framework-rail" role="img" aria-label="Five-step flow from session purpose to therapist snapshot and Suno draft">
          ${HOW_IT_WORKS_PHASES.map(
            (phase, index) => `
              ${renderFrameworkPhase(phase)}
              ${
                index < HOW_IT_WORKS_PHASES.length - 1
                  ? '<div class="framework-arrow" aria-hidden="true">-&gt;</div>'
                  : ""
              }
            `
          ).join("")}
          <div class="framework-arrow" aria-hidden="true">-&gt;</div>
          <article class="framework-box artifact-box">
            <p class="framework-phase-label">${escapeHtml(HOW_IT_WORKS_ARTIFACT.label)}</p>
            <p class="framework-description">${escapeHtml(HOW_IT_WORKS_ARTIFACT.description)}</p>
            <div class="framework-meta">
              <p class="framework-meta-label">Secondary effects</p>
              <ul class="framework-list">
                ${renderMechanismList(HOW_IT_WORKS_ARTIFACT.effects)}
              </ul>
            </div>
          </article>
        </div>
        <section class="framework-feedback">
          <div class="framework-feedback-line" aria-hidden="true"></div>
          <div class="framework-feedback-copy">
            <p class="framework-meta-label">ITERATION</p>
            <p class="framework-description">
              Therapist and client can revise the wording, regenerate, or swap a few choices together.
            </p>
            <p class="framework-action">
              The goal is a useful shared draft, not a perfect first pass.
            </p>
          </div>
        </section>
        <p class="framework-subtext">
          This tool supports reflection and songwriting in session. It does not provide therapy or clinical judgment.
        </p>
      </div>
    </details>
  `;
}

function renderResults() {
  if (!state.generation) {
    return "";
  }

  if (state.generation.status === "crisis") {
    return `
      <section class="results warning">
        <h3>Pause and Get Support</h3>
        <p>${escapeHtml(state.generation.message)}</p>
        <ul>
          ${state.generation.resources.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  if (state.generation.status !== "success") {
    return "";
  }

  return `
    <section class="results">
      <h3>Session Outputs</h3>
      <p class="subtle">Review the therapist snapshot, then use the Lyrics and Styles prompts in Suno. All three blocks are editable.</p>
      <div class="prompt-grid">
        ${renderPromptBlock("therapist-summary", "Therapist Reflection Summary", "Brief session snapshot, not for Suno", state.generation.output.therapistSummary)}
        ${renderPromptBlock("lyrics-prompt", "Lyrics", "", state.generation.output.lyricsPrompt)}
        ${renderPromptBlock("styles-prompt", "Styles", "Music or Genre", state.generation.output.stylesPrompt)}
      </div>
      ${renderSunoHelp()}
      ${renderHowItWorks()}
    </section>
  `;
}

function renderApp() {
  appEl.innerHTML = `
    <main class="panel">
      <header class="app-header">
        <div>
          <h1>Music Therapy Session Prompt Guide</h1>
          <p class="subtle">A structured session tool for helping a music therapist and client move from reflection to a Suno-ready song draft.</p>
          <p class="support-note header-note">Use this to support reflection and songwriting in session. It does not provide therapy or clinical judgment, and nothing is stored by default.</p>
        </div>
        <div class="header-actions">
          <button id="clear-session-btn">Start New Session</button>
          <p class="subtle">Build ${BUILD_ID}</p>
        </div>
      </header>
      ${renderProgress()}
      ${renderQuestionsPanel()}
      ${renderReviewPanel()}
      ${renderResults()}
    </main>
  `;

  attachEvents();
}

function syncMultiAnswer(questionId) {
  const checked = [
    ...document.querySelectorAll(`.question-checkbox[data-question-id="${questionId}"]:checked`),
  ].map((element) => element.value);
  setAnswer(questionId, checked);
}

function runGeneration() {
  try {
    const result = generatePromptSet(buildRawIntakeFromFlow(), { locale: "US" });

    if (result.status === "invalid") {
      state.generation = null;
      state.errors = result.errors || ["Unable to generate prompts. Review your answers and try again."];
      return false;
    }

    state.generation = result;
    state.errors = [];
    return true;
  } catch (error) {
    state.generation = null;
    state.errors = [
      error instanceof Error ? error.message : "Unable to generate prompts. Review your answers and try again.",
    ];
    return false;
  }
}

async function copyToClipboard(value) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const temp = document.createElement("textarea");
  temp.value = value;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  temp.remove();
}

function scrollToQuestion(questionId) {
  document.getElementById(`question-${questionId}`)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function attachEvents() {
  document.querySelectorAll(".question-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      const questionId = event.target.getAttribute("data-question-id");
      const question = getFlowQuestionById(questionId);
      const nextValue = event.target.value;

      setAnswer(questionId, nextValue);

      if (question?.otherTrigger && nextValue !== question.otherTrigger) {
        setOtherAnswer(questionId, "");
      }

      if (questionId === "song_function") {
        resetBranchAnswers();
      }

      if (questionId === "imagery_category") {
        setAnswer("imagery_detail", "");
        setOtherAnswer("imagery_detail", "");
      }

      if (questionId === "emotional_signal") {
        syncStoryEmotionSelections();
      }

      clearGeneratedOutput();
      state.errors = [];
      renderApp();
    });
  });

  document.querySelectorAll(".question-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const questionId = event.target.getAttribute("data-question-id");
      const maxSelect = Number(event.target.getAttribute("data-max-select") || 0);

      syncMultiAnswer(questionId);
      const answers = Array.isArray(getAnswer(questionId)) ? getAnswer(questionId) : [];

      if (maxSelect && answers.length > maxSelect) {
        event.target.checked = false;
        syncMultiAnswer(questionId);
        state.errors = [`Pick up to ${maxSelect} options for this section.`];
        renderApp();
        return;
      }

      if (questionId === "emotional_signal") {
        syncStoryEmotionSelections();
      }

      clearGeneratedOutput();
      state.errors = [];
      renderApp();
    });
  });

  document.querySelectorAll(".question-other-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const questionId = event.target.getAttribute("data-question-id");
      setOtherAnswer(questionId, event.target.value);
      clearGeneratedOutput();
    });
    input.addEventListener("change", () => {
      state.errors = [];
      renderApp();
    });
  });

  document.querySelectorAll(".question-textarea").forEach((textarea) => {
    textarea.addEventListener("input", (event) => {
      const questionId = event.target.getAttribute("data-question-id");
      setAnswer(questionId, event.target.value);
      clearGeneratedOutput();
    });
  });

  document.querySelectorAll(".summary-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const summaryKey = event.target.getAttribute("data-summary-key");
      const nextValue = String(event.target.value || "").trim();

      if (nextValue) {
        state.summaryOverrides[summaryKey] = nextValue;
      } else {
        delete state.summaryOverrides[summaryKey];
      }

      clearGeneratedOutput();
    });
  });

  document.getElementById("generate-btn")?.addEventListener("click", () => {
    state.errors = validateBeforeGenerate();
    if (state.errors.length) {
      renderApp();
      requestAnimationFrame(() => {
        document.getElementById("action-feedback")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    const generated = runGeneration();
    renderApp();

    requestAnimationFrame(() => {
      const target = generated ? document.querySelector(".results") : document.getElementById("action-feedback");
      target?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  document.querySelectorAll(".adjust-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const actionId = button.getAttribute("data-action-id");
      const targetQuestionId = REVIEW_ACTION_TARGETS[actionId];
      if (targetQuestionId) {
        scrollToQuestion(targetQuestionId);
      }
    });
  });

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const source = document.getElementById(targetId);
      if (!source) {
        return;
      }
      await copyToClipboard(source.value);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1000);
    });
  });

  document.getElementById("clear-session-btn")?.addEventListener("click", () => {
    if (!hasSessionData()) {
      startNewSession();
      return;
    }

    const confirmed = window.confirm("Start a new session and clear the current answers and outputs?");
    if (confirmed) {
      startNewSession();
    }
  });
}

renderApp();
