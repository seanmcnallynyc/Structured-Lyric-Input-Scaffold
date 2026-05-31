import test from "node:test";
import assert from "node:assert/strict";

import { generatePromptSet } from "../src/generator.js";
import {
  SESSION_STORAGE_KEYS,
  clearStoredSession,
  persistCopyEvent,
  persistCrisisEvent,
  persistGeneration,
} from "../src/store.js";

function createFakeStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function validInput(overrides = {}) {
  return {
    song_function: "process a relationship",
    branch_focus: "repair",
    emotional_signal: ["trust", "fear"],
    story_emotions: ["openness", "vulnerability", "warmth"],
    core_realization: "I want this song to make room for repair",
    directed_listener: "our relationship",
    song_perspective: 'shared voice, like "we"',
    imagery_category: "Water / Reflection",
    imagery_detail: "ripples in a still lake",
    musical_tone: "gentle and grounded",
    genre: "piano ballad",
    avoid_topics: ["graphic violence"],
    reflection_summary: {},
    ...(overrides || {}),
  };
}

test("generated output now includes therapist snapshot plus Suno fields", () => {
  const result = generatePromptSet(validInput());
  assert.equal(result.status, "success");
  assert.ok(result.output.therapistSummary.includes("Session purpose:"));
  assert.ok(result.output.lyricsPrompt.includes("Purpose:"));
  assert.ok(result.output.stylesPrompt.includes("Mood:"));
});

test("clearStoredSession wipes any legacy local session keys", () => {
  const storage = createFakeStorage();
  const result = generatePromptSet(validInput());
  assert.equal(result.status, "success");

  persistGeneration(storage, result.intake, result.telemetry);
  persistCopyEvent(storage, { target: "lyrics-prompt" });

  const crisis = generatePromptSet(
    validInput({
      core_realization: "I want to hurt myself",
    })
  );
  assert.equal(crisis.status, "crisis");
  persistCrisisEvent(storage, crisis.intake);

  for (const key of SESSION_STORAGE_KEYS) {
    const maybeValue = storage.getItem(key);
    if (key === "suno_prompt_scaffolder_ratings") {
      assert.equal(maybeValue, null);
    } else {
      assert.notEqual(maybeValue, null);
    }
  }

  clearStoredSession(storage);

  for (const key of SESSION_STORAGE_KEYS) {
    assert.equal(storage.getItem(key), null);
  }
});
