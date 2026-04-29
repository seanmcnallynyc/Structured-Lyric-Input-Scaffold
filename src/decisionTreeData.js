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
  STORY_EMOTION_OPTIONS,
} from "./constants.js?v=20260428a";
import {
  CUSTOM_REALIZATION_OPTION,
  getBranchOptionsForFunction,
  getRealizationOptionsForFunction,
} from "./branching.js?v=20260428a";

export const CUSTOM_IMAGERY_OPTION = "write my own image...";

export const IMAGERY_CATEGORIES = {
  "Night / Quiet Moments": [
    "empty kitchen tables",
    "streetlights after midnight",
    "a quiet apartment window",
  ],
  "Nature / Weather": [
    "ocean waves in the dark",
    "storm clouds breaking",
    "wind through tall grass",
  ],
  "Roads / Distance": [
    "headlights on a long highway",
    "a train leaving the station",
    "driving through the desert",
  ],
  "Memory / Time": [
    "fading photographs",
    "an old voicemail recording",
    "dust on a forgotten piano",
  ],
  "Fire / Rebuilding": [
    "ashes after a fire",
    "sparks in the dark",
    "rebuilding a burned house",
  ],
  "Light Breaking Through": [
    "sunrise through curtains",
    "light after a storm",
    "the first warm day of spring",
  ],
  "Urban / City Life": [
    "neon signs in the rain",
    "late night subway rides",
    "a bar closing at 2am",
  ],
  "Water / Reflection": [
    "ripples in a still lake",
    "rain on the windshield",
    "reflections in a river",
  ],
};

export const FLOW_QUESTIONS = [
  {
    id: "song_function",
    label: SCREEN_PROMPTS.songFunction,
    responseType: "single",
    required: true,
    options: SONG_FUNCTION_OPTIONS,
  },
  {
    id: "branch_focus",
    label: SCREEN_PROMPTS.branchFocus,
    responseType: "single",
    required: true,
    dependsOn: "song_function",
    options: [],
  },
  {
    id: "emotional_signal",
    label: SCREEN_PROMPTS.emotionalSignal,
    responseType: "multi",
    required: true,
    maxSelect: 2,
    options: EMOTIONAL_SIGNAL_OPTIONS,
  },
  {
    id: "story_emotions",
    label: SCREEN_PROMPTS.emotionalDifferentiation,
    responseType: "multi",
    required: true,
    dependsOn: "emotional_signal",
    maxSelect: 3,
    options: STORY_EMOTION_OPTIONS,
  },
  {
    id: "core_realization",
    label: SCREEN_PROMPTS.coreRealization,
    responseType: "single",
    required: true,
    dependsOn: "song_function",
    options: [],
    otherTrigger: CUSTOM_REALIZATION_OPTION,
    otherLabel: "Add your own truth",
    otherPlaceholder: "A short truth you want the song to hold",
  },
  {
    id: "directed_listener",
    label: SCREEN_PROMPTS.directedListener,
    responseType: "single",
    required: true,
    options: DIRECTED_LISTENER_OPTIONS,
  },
  {
    id: "song_perspective",
    label: SCREEN_PROMPTS.songPerspective,
    responseType: "single",
    required: true,
    options: SONG_PERSPECTIVE_OPTIONS,
  },
  {
    id: "imagery_category",
    label: SCREEN_PROMPTS.imageryCategory,
    responseType: "single",
    required: true,
    options: Object.keys(IMAGERY_CATEGORIES),
  },
  {
    id: "imagery_detail",
    label: "Which image feels closest?",
    responseType: "single",
    required: true,
    dependsOn: "imagery_category",
    options: [],
    otherTrigger: CUSTOM_IMAGERY_OPTION,
    otherLabel: "Add your own image",
    otherPlaceholder: "A concrete image or moment",
  },
  {
    id: "musical_tone",
    label: SCREEN_PROMPTS.musicalTone,
    responseType: "single",
    required: true,
    options: MUSICAL_TONE_OPTIONS,
  },
  {
    id: "genre",
    label: SCREEN_PROMPTS.genre,
    responseType: "single",
    required: true,
    options: GENRE_OPTIONS,
  },
  {
    id: "avoid_topics",
    label: SCREEN_PROMPTS.avoidTopics,
    responseType: "text",
    required: false,
    placeholder: "Optional. Separate with commas, for example: graphic violence, explicit abuse details",
    maxLength: 240,
  },
];

export const REVIEW_ACTION_TARGETS = {
  adjust_emotions: "story_emotions",
  adjust_imagery: "imagery_category",
  adjust_musical_tone: "musical_tone",
};

function titleCase(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

export function getImageryOptionsForCategory(category) {
  const baseOptions = IMAGERY_CATEGORIES[category] || [];
  return [...baseOptions, CUSTOM_IMAGERY_OPTION];
}

export function getBranchFocusOptions(songFunction) {
  return getBranchOptionsForFunction(songFunction);
}

export function getCoreRealizationOptions(songFunction) {
  return getRealizationOptionsForFunction(songFunction);
}

export function getStoryEmotionGroups(selectedSignals) {
  const signals = Array.isArray(selectedSignals) ? selectedSignals : [];
  return signals
    .filter((signal) => EMOTION_FAMILY_DETAILS[signal])
    .map((signal) => ({
      id: signal,
      label: titleCase(signal),
      options: [...EMOTION_FAMILY_DETAILS[signal]],
    }));
}

export function getStoryEmotionOptions(selectedSignals) {
  return [...new Set(getStoryEmotionGroups(selectedSignals).flatMap((group) => group.options))];
}

export function getFlowQuestionById(questionId) {
  return FLOW_QUESTIONS.find((question) => question.id === questionId) || null;
}

export function getReviewActionById(actionId) {
  return REVIEW_ACTIONS.find((action) => action.id === actionId) || null;
}
