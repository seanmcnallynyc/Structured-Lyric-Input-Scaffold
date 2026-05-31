import test from "node:test";
import assert from "node:assert/strict";

import {
  DIRECTED_LISTENER_OPTIONS,
  EMOTION_FAMILY_DETAILS,
  EMOTIONAL_SIGNAL_OPTIONS,
  GENRE_OPTIONS,
  MUSICAL_TONE_OPTIONS,
  REVIEW_ACTIONS,
  SCREEN_PROMPTS,
  SONG_FUNCTION_OPTIONS,
  SONG_PERSPECTIVE_OPTIONS,
} from "../src/constants.js";
import {
  CUSTOM_REALIZATION_OPTION,
  getBranchOptionsForFunction,
  getBranchPromptForFunction,
  getRealizationOptionsForFunction,
} from "../src/branching.js";
import {
  FLOW_QUESTIONS,
  IMAGERY_CATEGORIES,
  getStoryEmotionGroups,
} from "../src/decisionTreeData.js";

test("screen prompts match the therapist-led songwriting flow", () => {
  assert.equal(SCREEN_PROMPTS.songFunction, "What is the purpose of this song today?");
  assert.equal(SCREEN_PROMPTS.emotionalSignal, "Which core emotions are most present?");
  assert.equal(SCREEN_PROMPTS.coreRealization, "What truth or feeling should the song hold?");
  assert.equal(SCREEN_PROMPTS.situationAnchor, undefined);
  assert.equal(
    SCREEN_PROMPTS.reflectionCheck,
    "Does this feel ready enough to turn into a draft?"
  );
});

test("option vocabularies match the therapist session contract", () => {
  assert.deepEqual(SONG_FUNCTION_OPTIONS, [
    "support calm",
    "make sense of something",
    "process a relationship",
    "reconnect with strength",
    "hold onto something good",
    "let something go",
  ]);

  assert.deepEqual(EMOTIONAL_SIGNAL_OPTIONS, [
    "happy",
    "sad",
    "surprise",
    "anticipation",
    "disgust",
    "trust",
    "angry",
    "fear",
  ]);

  assert.deepEqual(DIRECTED_LISTENER_OPTIONS, [
    "myself",
    "a specific person",
    "our relationship",
    "my past self",
    "my future self",
    "a group or community",
    "the feeling itself",
    "this moment in life",
  ]);

  assert.deepEqual(SONG_PERSPECTIVE_OPTIONS, [
    "first person, like my own voice",
    "second person, like speaking to someone",
    "third person, like telling a story",
    'shared voice, like "we"',
    "like a letter or reflection",
  ]);

  assert.deepEqual(MUSICAL_TONE_OPTIONS, [
    "gentle and grounded",
    "powerful and rising",
    "calm and reassuring",
    "reflective and spacious",
    "warm and hopeful",
    "tender and intimate",
    "bright and uplifting",
    "haunting and sparse",
  ]);

  assert.deepEqual(GENRE_OPTIONS, [
    "acoustic singer-songwriter",
    "indie folk",
    "piano ballad",
    "cinematic ambient",
    "pop emotional",
    "country storytelling",
    "alternative",
    "indie rock",
    "lo-fi indie",
  ]);

  assert.deepEqual(REVIEW_ACTIONS.map((action) => action.label), [
    "build session outputs",
    "adjust feelings",
    "adjust imagery",
    "adjust music",
  ]);
});

test("branch config drives the follow-up question and anchor options", () => {
  assert.equal(
    getBranchPromptForFunction("hold onto something good"),
    "What kind of good feeling are we trying to hold onto?"
  );
  assert.deepEqual(getBranchOptionsForFunction("hold onto something good"), [
    "joy",
    "calm",
    "love",
    "gratitude",
    "pride",
    "a meaningful moment",
  ]);
  assert.deepEqual(getRealizationOptionsForFunction("hold onto something good"), [
    "this moment deserves to stay with me",
    "good things are worth making space for",
    "I want to remember how this feels",
    "this feeling belongs in the song",
    CUSTOM_REALIZATION_OPTION,
  ]);
});

test("emotion families expose a second layer without using the outer wheel", () => {
  assert.deepEqual(EMOTION_FAMILY_DETAILS.happy, [
    "joy",
    "gratitude",
    "delight",
    "playfulness",
    "pride",
  ]);
  assert.deepEqual(EMOTION_FAMILY_DETAILS.trust, [
    "safety",
    "warmth",
    "belonging",
    "appreciation",
    "openness",
  ]);

  assert.deepEqual(getStoryEmotionGroups(["happy", "trust"]), [
    {
      id: "happy",
      label: "Happy",
      options: ["joy", "gratitude", "delight", "playfulness", "pride"],
    },
    {
      id: "trust",
      label: "Trust",
      options: ["safety", "warmth", "belonging", "appreciation", "openness"],
    },
  ]);
});

test("imagery and flow order preserve the guided intake structure", () => {
  assert.deepEqual(Object.keys(IMAGERY_CATEGORIES), [
    "Night / Quiet Moments",
    "Nature / Weather",
    "Roads / Distance",
    "Memory / Time",
    "Fire / Rebuilding",
    "Light Breaking Through",
    "Urban / City Life",
    "Water / Reflection",
  ]);

  assert.deepEqual(
    FLOW_QUESTIONS.slice(0, 5).map((question) => question.id),
    ["song_function", "branch_focus", "emotional_signal", "story_emotions", "core_realization"]
  );

  const storyEmotionQuestion = FLOW_QUESTIONS.find((question) => question.id === "story_emotions");
  assert.equal(storyEmotionQuestion.dependsOn, "emotional_signal");

  const imageryDetailQuestion = FLOW_QUESTIONS.find((question) => question.id === "imagery_detail");
  assert.equal(imageryDetailQuestion.dependsOn, "imagery_category");
  assert.equal(imageryDetailQuestion.otherTrigger, "write my own image...");

  assert.equal(FLOW_QUESTIONS.some((question) => question.id === "situation_anchor"), false);
  assert.equal(FLOW_QUESTIONS.some((question) => question.id === "narrative_focus"), false);
});
