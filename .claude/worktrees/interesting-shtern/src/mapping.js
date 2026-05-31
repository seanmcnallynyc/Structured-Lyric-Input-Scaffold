import {
  CRISIS_RESOURCES_INTL_FALLBACK,
  CRISIS_RESOURCES_US,
} from "./constants.js?v=20260321c";

const PERSPECTIVE_GUIDANCE = {
  "first person, like my own voice":
    "Write in first person and keep the language personal, emotionally honest, and grounded.",
  "second person, like speaking to someone":
    "Address the listener directly and keep the emotional stakes specific.",
  "third person, like telling a story":
    "Use storytelling distance, but keep the emotional details concrete and human.",
  'shared voice, like "we"':
    'Use a shared "we" perspective so the lyric feels collaborative, connected, and steady.',
  "like a letter or reflection":
    "Let the lyric read like a warm reflection or letter, direct enough to feel personal without overexplaining.",
};

const MUSICAL_TONE_MAP = {
  "gentle and grounded": {
    mood: "gentle, grounded, steady, emotionally present",
    arrangement: "light rhythm, organic instruments, uncluttered arrangement, close vocal",
    tempo: "slow to mid-slow tempo",
  },
  "powerful and rising": {
    mood: "strong, rising, emotionally expansive without losing humanity",
    arrangement: "clear dynamic lift, fuller texture later, grounded vocal at the center",
    tempo: "mid tempo with upward momentum",
  },
  "calm and reassuring": {
    mood: "steady, calm, reassuring, emotionally safe",
    arrangement: "soft pads, gentle rhythm, uncluttered arrangement, warm tonal center",
    tempo: "slow tempo",
  },
  "reflective and spacious": {
    mood: "reflective, spacious, open, emotionally breathable",
    arrangement: "ambient texture, soft pulse, roomy reverb, patient movement",
    tempo: "slow tempo with a floating pulse",
  },
  "warm and hopeful": {
    mood: "warm, hopeful, heart-forward, gently uplifting",
    arrangement: "soft acoustic or piano base, supportive lift, clear melodic center",
    tempo: "mid-slow tempo with light lift",
  },
  "tender and intimate": {
    mood: "tender, intimate, close, emotionally honest",
    arrangement: "minimal arrangement, warm vocal, sparse acoustic or piano support",
    tempo: "slow to slow-mid tempo",
  },
  "bright and uplifting": {
    mood: "bright, open, affirming, emotionally alive",
    arrangement: "clean pulse, lifted chorus, light rhythmic support, warm harmonic color",
    tempo: "mid tempo",
  },
  "haunting and sparse": {
    mood: "haunting, sparse, spacious, emotionally exposed",
    arrangement: "lots of space, minimal accompaniment, strong atmosphere, restrained movement",
    tempo: "slow tempo with long sustains",
  },
};

const GENRE_PRODUCTION_MAP = {
  "acoustic singer-songwriter": ["acoustic guitar", "light piano support", "close vocal"],
  "indie folk": ["fingerpicked guitar", "soft percussion", "earthy harmonies"],
  "piano ballad": ["felt piano", "subtle strings", "intimate vocal"],
  "cinematic ambient": ["pads", "textural swells", "ambient piano"],
  "pop emotional": ["clean drums", "piano or synth bed", "wide chorus lift"],
  "country storytelling": ["acoustic guitar", "light rhythm section", "story-forward vocal"],
  alternative: ["moody guitars", "restrained rhythm section", "atmospheric layers"],
  "indie rock": ["guitar-driven arrangement", "live drums with restraint", "dynamic lift"],
  "lo-fi indie": ["soft beat", "tape texture", "dreamy guitar or keys"],
};

function hashText(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function formatList(values, conjunction = "and") {
  const list = (values || []).filter(Boolean);
  if (!list.length) {
    return "";
  }
  if (list.length === 1) {
    return list[0];
  }
  if (list.length === 2) {
    return `${list[0]} ${conjunction} ${list[1]}`;
  }
  return `${list.slice(0, -1).join(", ")}, ${conjunction} ${list[list.length - 1]}`;
}

function createBranchMeta(overrides) {
  return {
    purpose_phrase: "shape the song around what matters most today",
    arc_target: "greater clarity",
    branch_guidance: "Keep the lyric specific, singable, and emotionally coherent.",
    prompt_bias: "therapist_session_general",
    style_motion: "steady, emotionally clear, and singable",
    production_hint: "restrained dynamics",
    vocal_guidance: "human, grounded, and believable",
    ...overrides,
  };
}

function getBranchMeta(songFunction, branchFocus) {
  switch (songFunction) {
    case "support calm":
      return createBranchMeta({
        purpose_phrase: `support calm through ${branchFocus}`,
        arc_target: "steadiness",
        branch_guidance: `Keep the lyric grounded in ${branchFocus}. Favor breath, warmth, and simple language over complexity.`,
        prompt_bias: `calm_${branchFocus}`,
        style_motion: "settling, steady, and lightly soothing",
        production_hint: "soft pulse and uncluttered arrangement",
        vocal_guidance: "calm, close, and reassuring",
      });
    case "make sense of something":
      return createBranchMeta({
        purpose_phrase: `make sense of ${branchFocus}`,
        arc_target: "meaning",
        branch_guidance: `Treat ${branchFocus} as the center of the song. Let the lyric piece it together without flattening it.`,
        prompt_bias: `meaning_${branchFocus}`,
        style_motion: "measured, reflective, and gradually clarifying",
        production_hint: "support narrative lift without overselling the climax",
        vocal_guidance: "reflective and grounded",
      });
    case "process a relationship":
      return createBranchMeta({
        purpose_phrase: `process a relationship through ${branchFocus}`,
        arc_target: "tender perspective",
        branch_guidance: `Keep the emotional focus on ${branchFocus}. Let the song hold complexity without becoming melodramatic.`,
        prompt_bias: `relationship_${branchFocus}`,
        style_motion: "tender, suspended, and emotionally precise",
        production_hint: "space around the vocal and unresolved harmonic color",
        vocal_guidance: "close, human, and emotionally exposed",
      });
    case "reconnect with strength":
      return createBranchMeta({
        purpose_phrase: `reconnect with strength through ${branchFocus}`,
        arc_target: "renewed strength",
        branch_guidance: `Let the lyric rediscover strength through ${branchFocus}. Keep it grounded rather than slogan-like.`,
        prompt_bias: `strength_${branchFocus}`,
        style_motion: "steady, grounded, and gradually lifting",
        production_hint: "credible lift with a grounded rhythm",
        vocal_guidance: "clear, warm, and quietly assured",
      });
    case "hold onto something good":
      return createBranchMeta({
        purpose_phrase: `hold onto ${branchFocus}`,
        arc_target: "kept close",
        branch_guidance: `Stay close to ${branchFocus}. Let the lyric preserve the feeling instead of overexplaining it.`,
        prompt_bias: `hold_good_${branchFocus}`,
        style_motion: "warm, open, and gently lifting",
        production_hint: "light lift, warm tone, and steady support",
        vocal_guidance: "warm, present, and open-hearted",
      });
    case "let something go":
      return createBranchMeta({
        purpose_phrase: `let go of ${branchFocus}`,
        arc_target: "release",
        branch_guidance: `Favor breath, repetition, and space around ${branchFocus}. Let the song loosen rather than push.`,
        prompt_bias: `release_${branchFocus}`,
        style_motion: "loosening, exhale-driven, and uncluttered",
        production_hint: "minimal percussion and softer attacks",
        vocal_guidance: "steady, soothing, and believable",
      });
    default:
      return createBranchMeta({});
  }
}

function buildPurposeSummary(intake) {
  return getBranchMeta(intake.song_function, intake.branch_focus).purpose_phrase;
}

function buildMusicDirection(intake) {
  return `${intake.musical_tone}, ${intake.genre}`;
}

export function buildReflectionSummary(intake) {
  return {
    purpose: buildPurposeSummary(intake),
    core_emotions: formatList(intake.emotional_signal),
    feelings: formatList(intake.story_emotions),
    song_for: intake.directed_listener,
    anchor: intake.core_realization,
    imagery: intake.imagery_detail,
    music_direction: buildMusicDirection(intake),
  };
}

export function mergeReflectionSummary(baseSummary, overrides) {
  const merged = { ...(baseSummary || {}) };
  for (const [key, value] of Object.entries(overrides || {})) {
    if (String(value || "").trim()) {
      merged[key] = String(value).trim();
    }
  }
  return merged;
}

function buildEmotionalTone(intake) {
  return formatList([...intake.emotional_signal.slice(0, 2), ...intake.story_emotions.slice(0, 3)]);
}

function buildProductionPalette(genre, musicalTone, branchMeta) {
  const base = GENRE_PRODUCTION_MAP[genre] || ["intimate instruments", "clear vocal", "restrained dynamics"];
  const tone = MUSICAL_TONE_MAP[musicalTone] || MUSICAL_TONE_MAP["gentle and grounded"];
  return [...new Set([...base, branchMeta.production_hint, tone.arrangement])];
}

function buildStyleAnchor(genre, musicalTone, branchMeta) {
  const tone = MUSICAL_TONE_MAP[musicalTone] || MUSICAL_TONE_MAP["gentle and grounded"];
  return `${genre}, ${tone.mood}, ${branchMeta.style_motion}`;
}

function buildSeed(intake, summary) {
  return [
    intake.song_function,
    intake.branch_focus,
    intake.directed_listener,
    intake.core_realization,
    intake.genre,
    intake.musical_tone,
    summary.imagery,
  ].join("::");
}

function choosePrimarySignal(signals) {
  return (signals || [])[0] || "emotion";
}

function chooseSignalArc(signals, intake) {
  const opening = formatList(signals) || choosePrimarySignal(signals);
  const meta = getBranchMeta(intake.song_function, intake.branch_focus);
  return `${opening} toward ${meta.arc_target}`;
}

export function getPerspectiveGuidance(perspective) {
  return PERSPECTIVE_GUIDANCE[perspective] || PERSPECTIVE_GUIDANCE["first person, like my own voice"];
}

export function getMusicalToneGuidance(musicalTone) {
  return MUSICAL_TONE_MAP[musicalTone] || MUSICAL_TONE_MAP["gentle and grounded"];
}

export function getCrisisResources(locale = "US") {
  if (String(locale).toUpperCase() === "US") {
    return [...CRISIS_RESOURCES_US];
  }
  return [...CRISIS_RESOURCES_INTL_FALLBACK];
}

export function computeMappedState(intake) {
  const reflectionSummary = buildReflectionSummary(intake);
  const tone = getMusicalToneGuidance(intake.musical_tone);
  const branchMeta = getBranchMeta(intake.song_function, intake.branch_focus);
  const productionPalette = buildProductionPalette(intake.genre, intake.musical_tone, branchMeta);
  const emotionalTone = buildEmotionalTone(intake);
  const seed = buildSeed(intake, reflectionSummary);

  return {
    reflection_summary: reflectionSummary,
    emotional_arc: chooseSignalArc(intake.emotional_signal, intake),
    emotional_tone: emotionalTone,
    perspective_guidance: getPerspectiveGuidance(intake.song_perspective),
    branch_guidance: branchMeta.branch_guidance,
    prompt_bias: branchMeta.prompt_bias,
    arc_target: branchMeta.arc_target,
    style_motion: branchMeta.style_motion,
    vocal_guidance: branchMeta.vocal_guidance,
    processing_focus: intake.branch_focus,
    musical_guidance: tone,
    production_palette: productionPalette,
    style_anchor: buildStyleAnchor(intake.genre, intake.musical_tone, branchMeta),
    cadence_hint: hashText(seed) % 2 === 0 ? "plainspoken and vivid" : "lyrical but grounded",
  };
}
