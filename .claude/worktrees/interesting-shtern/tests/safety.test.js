import test from "node:test";
import assert from "node:assert/strict";

import {
  anonymizeText,
  containsCrisisIntent,
  containsDiscrimination,
  containsUrgentSupportConcern,
  safetyPrecheck,
} from "../src/safety.js";

test("crisis precheck blocks self-harm intent", () => {
  const result = safetyPrecheck({
    core_realization: "I want to end my life tonight",
    imagery_detail: "",
    avoid_topics: [],
    reflection_summary: {},
  });
  assert.equal(result.blocked, true);
  assert.equal(result.reason, "crisis");
  assert.ok(result.resources.length > 0);
});

test("urgent support precheck blocks abuse indicators", () => {
  assert.equal(containsUrgentSupportConcern("he hit me and I'm scared to go home"), true);

  const result = safetyPrecheck({
    core_realization: "he hit me and I'm scared to go home",
    imagery_detail: "",
    avoid_topics: [],
    reflection_summary: {},
  });

  assert.equal(result.blocked, true);
  assert.equal(result.reason, "urgent_support");
});

test("discrimination detector blocks hateful text", () => {
  assert.equal(containsDiscrimination("I hate women"), true);
  assert.equal(containsDiscrimination("gentle and kind wording only"), false);
});

test("anonymization strips common identifiers", () => {
  const cleaned = anonymizeText(
    "my name is Jamie. email me at jamie@example.com or @jamie and call 212-555-1212"
  );
  assert.doesNotMatch(cleaned, /jamie@example.com/i);
  assert.doesNotMatch(cleaned, /@jamie/i);
  assert.doesNotMatch(cleaned, /212-555-1212/i);
  assert.equal(containsCrisisIntent(cleaned), false);
});
