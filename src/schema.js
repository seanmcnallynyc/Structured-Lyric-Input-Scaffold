import {
  DIRECTED_LISTENER_OPTIONS,
  EMOTION_FAMILY_OPPOSITES,
  EMOTIONAL_SIGNAL_OPTIONS,
  GENRE_OPTIONS,
  MUSICAL_TONE_OPTIONS,
  SONG_FUNCTION_OPTIONS,
  SONG_PERSPECTIVE_OPTIONS,
} from "./constants.js?v=20260428a";
import { getBranchOptionsForFunction } from "./branching.js?v=20260428a";
import {
  IMAGERY_CATEGORIES,
  getStoryEmotionOptions,
} from "./decisionTreeData.js?v=20260428a";

export function createInitialIntake() {
  return {
    song_function: "",
    branch_focus: "",
    emotional_signal: [],
    story_emotions: [],
    core_realization: "",
    directed_listener: "",
    song_perspective: "",
    imagery_category: "",
    imagery_detail: "",
    musical_tone: "",
    genre: "",
    avoid_topics: [],
    reflection_summary: {},
    computed: {
      reflection_summary: {},
      emotional_arc: "",
      arc_target: "",
      branch_guidance: "",
      production_palette: [],
      prompt_bias: "",
    },
  };
}

function normalizeString(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return value
      .split(/[,\n;]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

export function countSentences(value) {
  const text = normalizeString(value);
  if (!text) {
    return 0;
  }
  const chunks = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
  return chunks.length || 1;
}

function normalizeSummary(summary) {
  const source = summary && typeof summary === "object" ? summary : {};
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    const normalized = normalizeString(value);
    if (normalized) {
      result[key] = normalized.slice(0, 240);
    }
  }
  return result;
}

export function normalizeIntake(rawIntake) {
  return {
    song_function: normalizeString(rawIntake.song_function),
    branch_focus: normalizeString(rawIntake.branch_focus),
    emotional_signal: normalizeArray(rawIntake.emotional_signal).map(normalizeString).slice(0, 2),
    story_emotions: normalizeArray(rawIntake.story_emotions).map(normalizeString).slice(0, 3),
    core_realization: normalizeString(rawIntake.core_realization).slice(0, 180),
    directed_listener: normalizeString(rawIntake.directed_listener),
    song_perspective: normalizeString(rawIntake.song_perspective),
    imagery_category: normalizeString(rawIntake.imagery_category),
    imagery_detail: normalizeString(rawIntake.imagery_detail).slice(0, 180),
    musical_tone: normalizeString(rawIntake.musical_tone),
    genre: normalizeString(rawIntake.genre),
    avoid_topics: normalizeArray(rawIntake.avoid_topics).map(normalizeString).filter(Boolean).slice(0, 12),
    reflection_summary: normalizeSummary(rawIntake.reflection_summary),
  };
}

function isAllowedValue(value, allowed) {
  return allowed.includes(value);
}

export function validateIntake(rawIntake) {
  const intake = normalizeIntake(rawIntake);
  const errors = [];

  if (!isAllowedValue(intake.song_function, SONG_FUNCTION_OPTIONS)) {
    errors.push("Choose the purpose of the song for today.");
  }

  const validBranchOptions = getBranchOptionsForFunction(intake.song_function);
  if (!intake.branch_focus) {
    errors.push("Choose the part of the song purpose that feels most important.");
  } else if (!validBranchOptions.includes(intake.branch_focus)) {
    errors.push("Choose a valid branch focus for the selected song goal.");
  }

  if (intake.emotional_signal.length < 1 || intake.emotional_signal.length > 2) {
    errors.push("Pick 1 to 2 emotional cues.");
  }
  for (const signal of intake.emotional_signal) {
    if (!isAllowedValue(signal, EMOTIONAL_SIGNAL_OPTIONS)) {
      errors.push("Emotional signal contains an invalid option.");
      break;
    }
  }

  if (!isAllowedValue(intake.directed_listener, DIRECTED_LISTENER_OPTIONS)) {
    errors.push("Choose who or what the song is for.");
  }

  if (intake.story_emotions.length < 1 || intake.story_emotions.length > 3) {
    errors.push("Choose 1 to 3 second-layer feelings.");
  }
  const validStoryEmotionOptions = getStoryEmotionOptions(intake.emotional_signal);
  const validValencedOptions = intake.emotional_signal.flatMap((signal) => EMOTION_FAMILY_OPPOSITES[signal] || []);
  for (const feeling of intake.story_emotions) {
    if (!isAllowedValue(feeling, validStoryEmotionOptions) && !isAllowedValue(feeling, validValencedOptions)) {
      errors.push("Selected feelings must come from the chosen core emotion families.");
      break;
    }
  }

  if (!intake.core_realization) {
    errors.push("Add the truth or feeling the song should hold.");
  }

  if (!isAllowedValue(intake.song_perspective, SONG_PERSPECTIVE_OPTIONS)) {
    errors.push("Choose one song perspective.");
  }

  const validCategories = Object.keys(IMAGERY_CATEGORIES);
  if (!isAllowedValue(intake.imagery_category, validCategories)) {
    errors.push("Choose one imagery category.");
  }

  const validImageryOptions = IMAGERY_CATEGORIES[intake.imagery_category] || [];
  if (!intake.imagery_detail) {
    errors.push("Choose or add an imagery detail.");
  } else if (!validImageryOptions.includes(intake.imagery_detail)) {
    if (validImageryOptions.length && intake.imagery_detail.length > 180) {
      errors.push("Custom imagery should stay concise.");
    }
  }

  if (!isAllowedValue(intake.musical_tone, MUSICAL_TONE_OPTIONS)) {
    errors.push("Choose one musical tone.");
  }

  if (!isAllowedValue(intake.genre, GENRE_OPTIONS)) {
    errors.push("Choose one genre.");
  }

  return {
    value: intake,
    valid: errors.length === 0,
    errors,
  };
}
