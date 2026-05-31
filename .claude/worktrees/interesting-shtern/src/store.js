function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}

export const SESSION_STORAGE_KEYS = [
  "suno_prompt_scaffolder_events",
  "suno_prompt_scaffolder_last_intake",
  "suno_prompt_scaffolder_ratings",
  "suno_prompt_scaffolder_copy_events",
];

export function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return createMemoryStorage();
}

function readJson(storage, key, fallback) {
  const raw = storage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

export function clearStoredSession(storage) {
  if (!storage || typeof storage.removeItem !== "function") {
    return;
  }
  for (const key of SESSION_STORAGE_KEYS) {
    storage.removeItem(key);
  }
}

export function persistGeneration(storage, intake, telemetry) {
  const events = readJson(storage, "suno_prompt_scaffolder_events", []);
  events.push({
    generated_at: telemetry.generated_at,
    song_function: intake.song_function,
    branch_focus: intake.branch_focus,
    genre: intake.genre,
    musical_tone: intake.musical_tone,
    crisis_blocked: false,
  });
  writeJson(storage, "suno_prompt_scaffolder_events", events);

  const snapshot = {
    song_function: intake.song_function,
    branch_focus: intake.branch_focus,
    emotional_signal: intake.emotional_signal,
    directed_listener: intake.directed_listener,
    story_emotions: intake.story_emotions,
    song_perspective: intake.song_perspective,
    imagery_category: intake.imagery_category,
    musical_tone: intake.musical_tone,
    genre: intake.genre,
    avoid_topics: intake.avoid_topics,
  };

  writeJson(storage, "suno_prompt_scaffolder_last_intake", snapshot);
}

export function persistCrisisEvent(storage, intake) {
  const events = readJson(storage, "suno_prompt_scaffolder_events", []);
  events.push({
    generated_at: new Date().toISOString(),
    song_function: intake.song_function,
    branch_focus: intake.branch_focus,
    genre: intake.genre,
    musical_tone: intake.musical_tone,
    crisis_blocked: true,
  });
  writeJson(storage, "suno_prompt_scaffolder_events", events);
}

export function persistRating(storage, rating) {
  const ratings = readJson(storage, "suno_prompt_scaffolder_ratings", []);
  ratings.push({
    submitted_at: new Date().toISOString(),
    enjoyment: Number(rating.enjoyment),
    conveyed_my_idea: Number(rating.conveyed_my_idea),
    comment: String(rating.comment || "").slice(0, 500),
  });
  writeJson(storage, "suno_prompt_scaffolder_ratings", ratings);
}

export function persistCopyEvent(storage, payload) {
  const events = readJson(storage, "suno_prompt_scaffolder_copy_events", []);
  events.push({
    copied_at: new Date().toISOString(),
    target: String(payload.target || ""),
  });
  writeJson(storage, "suno_prompt_scaffolder_copy_events", events);
}
