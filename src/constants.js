import { SONG_FUNCTION_OPTIONS as BRANCHED_SONG_FUNCTION_OPTIONS } from "./branching.js?v=20260321c";

export const SCREEN_PROMPTS = {
  songFunction: "What is the purpose of this song today?",
  branchFocus: "What part of that feels most important?",
  emotionalSignal: "Which core emotions are most present?",
  directedListener: "Who or what is this song for?",
  emotionalDifferentiation: "Which feelings are part of it?",
  coreRealization: "What truth or feeling should the song hold?",
  songPerspective: "How should the song speak?",
  imageryCategory: "What kind of image fits best?",
  musicalTone: "How should the music hold this?",
  genre: "What style feels like the right home for it?",
  avoidTopics: "Anything this song should avoid? (optional)",
  reflectionCheck: "Does this feel ready enough to turn into a draft?",
};

export const SONG_FUNCTION_OPTIONS = BRANCHED_SONG_FUNCTION_OPTIONS;

export const EMOTIONAL_SIGNAL_OPTIONS = [
  "happy",
  "sad",
  "surprise",
  "anticipation",
  "disgust",
  "trust",
  "angry",
  "fear",
];

export const DIRECTED_LISTENER_OPTIONS = [
  "myself",
  "a specific person",
  "our relationship",
  "my past self",
  "my future self",
  "a group or community",
  "the feeling itself",
  "this moment in life",
];

export const EMOTION_FAMILY_DETAILS = {
  happy: ["joy", "gratitude", "delight", "playfulness", "pride"],
  sad: ["grief", "disappointment", "loneliness", "heaviness", "tenderness"],
  surprise: ["wonder", "amazement", "curiosity", "disbelief", "awakening"],
  anticipation: ["hope", "readiness", "eagerness", "longing", "momentum"],
  disgust: ["aversion", "discomfort", "resentment", "distance", "resistance"],
  trust: ["safety", "warmth", "belonging", "appreciation", "openness"],
  angry: ["frustration", "hurt", "protest", "irritation", "protectiveness"],
  fear: ["anxiety", "worry", "vulnerability", "uncertainty", "overwhelm"],
};

export const STORY_EMOTION_OPTIONS = [...new Set(Object.values(EMOTION_FAMILY_DETAILS).flat())];

export const SONG_PERSPECTIVE_OPTIONS = [
  "first person, like my own voice",
  "second person, like speaking to someone",
  "third person, like telling a story",
  'shared voice, like "we"',
  "like a letter or reflection",
];

export const MUSICAL_TONE_OPTIONS = [
  "gentle and grounded",
  "powerful and rising",
  "calm and reassuring",
  "reflective and spacious",
  "warm and hopeful",
  "tender and intimate",
  "bright and uplifting",
  "haunting and sparse",
];

export const GENRE_OPTIONS = [
  "acoustic singer-songwriter",
  "indie folk",
  "piano ballad",
  "cinematic ambient",
  "pop emotional",
  "country storytelling",
  "alternative",
  "indie rock",
  "lo-fi indie",
];

export const REFLECTION_SUMMARY_FIELDS = [
  { id: "purpose", label: "Song purpose today" },
  { id: "core_emotions", label: "Core emotions" },
  { id: "feelings", label: "Selected feelings" },
  { id: "song_for", label: "Song is for" },
  { id: "anchor", label: "Anchor truth or feeling" },
  { id: "imagery", label: "Imagery anchor" },
  { id: "music_direction", label: "Music direction" },
];

export const REVIEW_ACTIONS = [
  { id: "generate", label: "build session outputs" },
  { id: "adjust_emotions", label: "adjust feelings" },
  { id: "adjust_imagery", label: "adjust imagery" },
  { id: "adjust_musical_tone", label: "adjust music" },
];

export const CRISIS_RESOURCES_US = [
  "If you might hurt yourself or someone else, call 911 now.",
  "Call or text 988 for immediate crisis support in the United States.",
  "If you are not in immediate danger, consider reaching out to a trusted person who can stay with you right now.",
];

export const CRISIS_RESOURCES_INTL_FALLBACK = [
  "If you are in immediate danger, contact local emergency services now.",
  "Use a local crisis hotline or emergency mental health service in your country.",
  "If possible, contact a trusted person who can stay with you right now.",
];

export const URGENT_SUPPORT_RESOURCES = [
  "If you are in immediate danger, call 911 or your local emergency number now.",
  "If someone is hurting you or controlling your safety, contact a local domestic violence or sexual assault support service.",
  "If you can, reach out to a trusted person who can help you stay safe right now.",
];
