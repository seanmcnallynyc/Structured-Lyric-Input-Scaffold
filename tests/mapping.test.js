import test from "node:test";
import assert from "node:assert/strict";

import {
  buildReflectionSummary,
  computeMappedState,
  mergeReflectionSummary,
} from "../src/mapping.js";

function validInput(overrides = {}) {
  return {
    song_function: "hold onto something good",
    branch_focus: "gratitude",
    emotional_signal: ["happy", "trust"],
    story_emotions: ["gratitude", "belonging", "warmth"],
    core_realization: "this moment deserves to stay with me",
    directed_listener: "this moment in life",
    song_perspective: "first person, like my own voice",
    imagery_category: "Light Breaking Through",
    imagery_detail: "the first warm day of spring",
    musical_tone: "warm and hopeful",
    genre: "indie folk",
    avoid_topics: [],
    reflection_summary: {},
    ...overrides,
  };
}

test("reflection summary turns structured intake into a therapist-facing session snapshot", () => {
  const summary = buildReflectionSummary(validInput());
  assert.match(summary.purpose, /hold onto gratitude/i);
  assert.equal(summary.core_emotions, "happy and trust");
  assert.match(summary.feelings, /gratitude/);
  assert.equal(summary.song_for, "this moment in life");
  assert.equal(summary.anchor, "this moment deserves to stay with me");
  assert.equal(summary.imagery, "the first warm day of spring");
  assert.equal(summary.music_direction, "warm and hopeful, indie folk");
});

test("summary overrides replace only the edited snapshot lines", () => {
  const base = buildReflectionSummary(validInput());
  const merged = mergeReflectionSummary(base, {
    anchor: "good things are worth making space for",
    imagery: "sunrise through curtains",
  });

  assert.equal(merged.anchor, "good things are worth making space for");
  assert.equal(merged.imagery, "sunrise through curtains");
  assert.equal(merged.song_for, base.song_for);
});

test("mapped state derives branch-aware production guidance deterministically", () => {
  const first = computeMappedState(validInput());
  const second = computeMappedState(validInput());

  assert.deepEqual(first, second);
  assert.equal(first.arc_target, "kept close");
  assert.match(first.branch_guidance, /gratitude/i);
  assert.match(first.style_anchor, /indie folk/i);
  assert.match(first.style_motion, /warm|lifting/i);
  assert.match(first.production_palette.join(", "), /fingerpicked guitar|earthy harmonies/i);
});

test("support-calm branch maps to steadier guidance", () => {
  const mapped = computeMappedState(
    validInput({
      song_function: "support calm",
      branch_focus: "slowing down",
      emotional_signal: ["fear", "trust"],
      story_emotions: ["anxiety", "safety", "warmth"],
      core_realization: "I can come back to steady ground",
    })
  );

  assert.equal(mapped.arc_target, "steadiness");
  assert.match(mapped.branch_guidance, /slowing down/i);
  assert.match(mapped.style_motion, /steady|settling/i);
  assert.match(mapped.vocal_guidance, /calm|reassuring/i);
});
