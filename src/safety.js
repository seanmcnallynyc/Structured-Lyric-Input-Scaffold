import { URGENT_SUPPORT_RESOURCES } from "./constants.js?v=20260428a";
import { getCrisisResources } from "./mapping.js?v=20260428a";

const CRISIS_PATTERNS = [
  /\b(kill myself|end my life|suicide|want to die)\b/i,
  /\b(hurt myself|self[- ]harm|cut myself)\b/i,
  /\b(i am going to (die|hurt myself|end it))\b/i,
];

const URGENT_SUPPORT_PATTERNS = [
  /\b(domestic violence|abusive relationship|abuse at home)\b/i,
  /\b(he hit me|she hit me|they hit me|someone hit me)\b/i,
  /\b(he hurt me|she hurt me|they hurt me)\b/i,
  /\b(sexual assault|rape|molested)\b/i,
  /\b(i'm scared to go home|i am scared to go home|i'm afraid of him|i'm afraid of her)\b/i,
];

const GRAPHIC_PATTERNS = [
  /\b(gore|graphic violence|blood everywhere)\b/i,
  /\b(brutal attack|torture)\b/i,
];

const DISCRIMINATION_PATTERNS = [
  /\b(hate (women|men|immigrants|disabled people|gay people|trans people))\b/i,
  /\b(inferior (race|gender|group))\b/i,
  /\b(racist|sexist) slur\b/i,
];

const IDENTIFIER_PATTERNS = [
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}\b/g,
  /@\w+/g,
  /\b\d{1,5}\s+[A-Za-z0-9.\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln)\b/gi,
  /\bmy name is\s+[A-Za-z][A-Za-z'-]{1,30}\b/gi,
];

function buildUserText(intake) {
  return [
    intake.core_realization,
    intake.imagery_detail,
    ...Object.values(intake.reflection_summary || {}),
  ]
    .filter(Boolean)
    .join(" ");
}

export function containsCrisisIntent(text) {
  const value = String(text || "");
  return CRISIS_PATTERNS.some((pattern) => pattern.test(value));
}

export function containsUrgentSupportConcern(text) {
  const value = String(text || "");
  return URGENT_SUPPORT_PATTERNS.some((pattern) => pattern.test(value));
}

export function containsGraphicContent(text) {
  const value = String(text || "");
  return GRAPHIC_PATTERNS.some((pattern) => pattern.test(value));
}

export function containsDiscrimination(text) {
  const value = String(text || "");
  return DISCRIMINATION_PATTERNS.some((pattern) => pattern.test(value));
}

export function anonymizeText(text) {
  let cleaned = String(text || "");
  for (const pattern of IDENTIFIER_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[redacted]");
  }
  return cleaned.trim();
}

function containsAvoidTopic(text, avoidTopics) {
  const normalized = String(text || "").toLowerCase();
  for (const topic of avoidTopics || []) {
    const value = String(topic || "").toLowerCase();
    if (!value || value === "discrimination / hate") {
      continue;
    }
    if (normalized.includes(value)) {
      return true;
    }
  }
  return false;
}

export function safetyPrecheck(intake, options = {}) {
  const userText = buildUserText(intake);
  if (containsCrisisIntent(userText)) {
    return {
      blocked: true,
      reason: "crisis",
      message:
        "This sounds like it may involve immediate self-harm risk. Prompt generation is paused so we can show crisis support.",
      resources: getCrisisResources(options.locale || "US"),
    };
  }

  if (containsUrgentSupportConcern(userText)) {
    return {
      blocked: true,
      reason: "urgent_support",
      message:
        "This sounds like it may involve abuse, coercion, or immediate safety concerns. Prompt generation is paused so we can show support resources.",
      resources: [...URGENT_SUPPORT_RESOURCES],
    };
  }

  if (containsGraphicContent(userText)) {
    return {
      blocked: true,
      reason: "graphic",
      message:
        "Graphic content is outside this reflective songwriting flow. Remove graphic details and try again.",
      resources: [],
    };
  }

  return {
    blocked: false,
    reason: null,
    message: "",
    resources: [],
  };
}

export function safetyPostcheck(promptBlock, intake) {
  const content = String(promptBlock || "");
  const policyCheckContent = content.replace(/Avoid(?: topics)?:[^\n]*/gi, "");

  if (containsDiscrimination(policyCheckContent)) {
    throw new Error("Output blocked by anti-discrimination safety policy.");
  }

  if (containsGraphicContent(policyCheckContent)) {
    throw new Error("Output blocked due to graphic content.");
  }

  if (containsAvoidTopic(policyCheckContent, intake.avoid_topics)) {
    throw new Error("Output blocked due to avoid-topic policy.");
  }

  return anonymizeText(content);
}
