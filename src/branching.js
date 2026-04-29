export const CUSTOM_REALIZATION_OPTION = "write my own realization...";

export const SONG_FUNCTION_BRANCHES = {
  "support calm": {
    branchPrompt: "What kind of calm does this song need to support?",
    branchOptions: [
      "slowing down",
      "feeling steady",
      "making room to breathe",
      "coming back to the body",
      "settling after something intense",
      "finding safety in the moment",
    ],
    realizationOptions: [
      "I can come back to steady ground",
      "this moment can soften without disappearing",
      "I can breathe and stay here",
      "calm can be something I return to",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
  "make sense of something": {
    branchPrompt: "What are we trying to make sense of?",
    branchOptions: [
      "a recent moment",
      "something that changed me",
      "a transition",
      "a memory that still lingers",
      "something unresolved",
      "what happened between then and now",
    ],
    realizationOptions: [
      "I am still piecing this together",
      "this meant more than I knew at the time",
      "I am trying to understand what remains",
      "something in this still needs language",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
  "process a relationship": {
    branchPrompt: "What do you want the song to hold about this relationship?",
    branchOptions: [
      "the care I have for them",
      "the distance between us",
      "wanting to repair things",
      "how much I miss them",
      "saying goodbye",
      "something that still needs to be said",
    ],
    realizationOptions: [
      "this relationship still matters to me",
      "there is more tenderness here than anger",
      "something in this still wants to be heard",
      "I want to make room for what is true here",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
  "reconnect with strength": {
    branchPrompt: "What kind of strength are we reconnecting with?",
    branchOptions: [
      "getting through the day",
      "trusting myself",
      "speaking up",
      "staying soft",
      "starting again",
      "remembering what is still here",
    ],
    realizationOptions: [
      "there is still something steady in me",
      "I have made it through hard things before",
      "strength can sound gentle too",
      "I can begin again from here",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
  "hold onto something good": {
    branchPrompt: "What kind of good feeling are we trying to hold onto?",
    branchOptions: [
      "joy",
      "calm",
      "love",
      "gratitude",
      "pride",
      "a meaningful moment",
    ],
    realizationOptions: [
      "this moment deserves to stay with me",
      "good things are worth making space for",
      "I want to remember how this feels",
      "this feeling belongs in the song",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
  "let something go": {
    branchPrompt: "What is the song helping us loosen?",
    branchOptions: [
      "pressure",
      "self-blame",
      "overthinking",
      "anger",
      "fear",
      "something I do not need to carry",
    ],
    realizationOptions: [
      "I do not need to carry this the same way anymore",
      "some of this can soften now",
      "I can make room for release",
      "this does not need such a tight grip on me",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
  "say something important": {
    branchPrompt: "What is closest to what you want to say?",
    branchOptions: [
      "a reminder",
      "something unseen or unheard",
      "a legacy",
      "the truth about something",
      "what I never got to say",
      "a message for the future",
    ],
    realizationOptions: [
      "this needed to be said out loud",
      "some things are worth carrying forward",
      "I want this to be heard, even if only by me",
      "this is what I want to leave behind",
      CUSTOM_REALIZATION_OPTION,
    ],
  },
};

export const SONG_FUNCTION_OPTIONS = Object.keys(SONG_FUNCTION_BRANCHES);

export function getBranchConfig(songFunction) {
  return SONG_FUNCTION_BRANCHES[songFunction] || null;
}

export function getBranchPromptForFunction(songFunction) {
  return getBranchConfig(songFunction)?.branchPrompt || "What part of that feels most important?";
}

export function getBranchOptionsForFunction(songFunction) {
  return [...(getBranchConfig(songFunction)?.branchOptions || [])];
}

export function getRealizationOptionsForFunction(songFunction) {
  return [...(getBranchConfig(songFunction)?.realizationOptions || [CUSTOM_REALIZATION_OPTION])];
}

export function isValidBranchFocus(songFunction, branchFocus) {
  return getBranchOptionsForFunction(songFunction).includes(branchFocus);
}
