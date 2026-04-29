import test from "node:test";
import assert from "node:assert/strict";

import { generatePromptSet } from "../src/generator.js";

function buildValidIntake(overrides = {}) {
  return {
    song_function: "hold onto something good",
    branch_focus: "gratitude",
    emotional_signal: ["happy", "trust"],
    story_emotions: ["gratitude", "appreciation", "warmth"],
    core_realization: "good things are worth making space for",
    directed_listener: "this moment in life",
    song_perspective: "like a letter or reflection",
    imagery_category: "Light Breaking Through",
    imagery_detail: "sunrise through curtains",
    musical_tone: "warm and hopeful",
    genre: "folk",
    avoid_topics: ["graphic violence"],
    reflection_summary: {},
    ...overrides,
  };
}

test("generator returns therapist summary plus lyrics and styles prompts", () => {
  const result = generatePromptSet(buildValidIntake());
  assert.equal(result.status, "success");
  assert.ok(result.output.therapistSummary.length > 140);
  assert.ok(result.output.lyricsPrompt.length > 220);
  assert.ok(result.output.stylesPrompt.length > 180);
});

test("therapist summary captures the live session snapshot", () => {
  const result = generatePromptSet(buildValidIntake());
  assert.equal(result.status, "success");

  const summary = result.output.therapistSummary;
  assert.match(summary, /Session purpose:/);
  assert.match(summary, /Core emotions: happy and trust/i);
  assert.match(summary, /Selected feelings: gratitude, appreciation, and warmth/i);
  assert.match(summary, /Music direction: warm and hopeful, folk/i);
});

test("lyrics prompt contains the revised synthesis fields", () => {
  const result = generatePromptSet(buildValidIntake());
  assert.equal(result.status, "success");

  const prompt = result.output.lyricsPrompt;
  assert.match(prompt, /Purpose:/);
  assert.match(prompt, /Song is for:/);
  assert.match(prompt, /Core emotions:/);
  assert.match(prompt, /Selected feelings:/);
  assert.match(prompt, /Anchor truth or feeling:/);
  assert.match(prompt, /Use sunrise through curtains as a recurring concrete image/i);
});

test("styles prompt contains music guidance for the session draft", () => {
  const result = generatePromptSet(buildValidIntake());
  assert.equal(result.status, "success");

  const prompt = result.output.stylesPrompt;
  assert.match(prompt, /Create music for/i);
  assert.match(prompt, /Mood:/);
  assert.match(prompt, /Tempo:/);
  assert.match(prompt, /Story motion:/);
  assert.match(prompt, /Focus:/);
  assert.match(prompt, /Palette:/);
});

test("styles prompt stays under 1000 characters even with long custom inputs", () => {
  const result = generatePromptSet(
    buildValidIntake({
      imagery_detail:
        "sunrise through curtains across a quiet living room while the floor warms slowly and the air feels still enough to notice each breath",
      avoid_topics: [
        "graphic violence",
        "medical procedures described in detail",
        "specific family conflict details",
        "religious judgment language",
      ],
    })
  );

  assert.equal(result.status, "success");
  assert.ok(result.output.stylesPrompt.length <= 1000);
});

test("summary overrides flow through into all generated outputs", () => {
  const result = generatePromptSet(
    buildValidIntake({
      reflection_summary: {
        anchor: "this kindness deserves a song",
        imagery: "the first warm day of spring",
      },
    })
  );

  assert.equal(result.status, "success");
  assert.match(result.output.therapistSummary, /this kindness deserves a song/i);
  assert.match(result.output.lyricsPrompt, /this kindness deserves a song/i);
  assert.match(result.output.stylesPrompt, /the first warm day of spring/i);
});

test("crisis input suppresses prompt output", () => {
  const result = generatePromptSet(
    buildValidIntake({
      core_realization: "I want to kill myself",
    })
  );
  assert.equal(result.status, "crisis");
  assert.equal(result.output, undefined);
});
