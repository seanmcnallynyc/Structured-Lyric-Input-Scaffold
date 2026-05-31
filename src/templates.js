function truncateText(value, maxLength) {
  const text = String(value || "").trim();
  if (!text || text.length <= maxLength) {
    return text;
  }
  const clipped = text.slice(0, maxLength).trim();
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 24 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

function formatAvoidTopics(avoidTopics, options = {}) {
  const list = Array.isArray(avoidTopics) ? avoidTopics.filter(Boolean) : [];
  const compact = Boolean(options.compact);
  const maxItems = options.maxItems || list.length;

  if (!list.length) {
    return compact ? "standard safety defaults" : "none beyond built-in safety defaults";
  }

  const shortened = list.slice(0, maxItems).map((item) => truncateText(item, compact ? 28 : 60));

  if (compact && list.length > maxItems) {
    return `${shortened.join(", ")}, and other listed topics`;
  }

  return shortened.join(", ");
}

function compactPalette(values, maxItems = 4) {
  return (values || [])
    .filter(Boolean)
    .slice(0, maxItems)
    .join(", ");
}

export function renderTherapistSummary(context) {
  return `Session purpose: ${context.reflection_summary.purpose}
Core emotions: ${context.reflection_summary.core_emotions}
Selected feelings: ${context.reflection_summary.feelings}
Song is for: ${context.reflection_summary.song_for}
Anchor truth or feeling: ${context.reflection_summary.anchor}
Imagery anchor: ${context.reflection_summary.imagery}
Music direction: ${context.reflection_summary.music_direction}`;
}

export function renderSunoLyricsPrompt(context) {
  const anchor = context.reflection_summary.anchor;
  return `Write a ${context.effective_genre || context.genre} song.
Core truth this song must carry: "${anchor}" — return to this in the chorus or refrain.
Purpose: ${context.reflection_summary.purpose}.
Specific angle: ${context.processing_focus}.
Song is for: ${context.reflection_summary.song_for}.
Perspective: ${context.song_perspective}.
Core emotions: ${context.reflection_summary.core_emotions}.
Selected feelings: ${context.reflection_summary.feelings}.
Use ${context.reflection_summary.imagery} as a recurring concrete image.
Emotional arc: ${context.emotional_arc}.
Writing guidance:
- ${context.branch_guidance}
- ${context.perspective_guidance}
- The anchor truth ("${anchor}") should appear in its own line or as a repeated phrase — do not bury it.
- Keep the lyric emotionally specific, concrete, and singable.
- Avoid generic platitudes, forced rhymes, and vague inspirational language.
- Let the song feel human, collaborative, and grounded rather than theatrical.
- Avoid topics: ${formatAvoidTopics(context.avoid_topics)}.
- Voice and cadence: write in a ${context.cadence_hint} style — let this shape syllable flow, line length, and word choice.
`;
}

export function renderSunoStylesPrompt(context) {
  const opening = context.emotional_signal[0] || "restraint";

  return `Create music for ${context.effective_genre || context.genre}.
Mood: ${truncateText(context.musical_guidance.mood, 90)}.
Tempo: ${context.musical_guidance.tempo}.
Story motion: ${truncateText(`${opening} toward ${context.arc_target}`, 70)}.
Lyric theme: ${truncateText(context.reflection_summary.purpose, 96)}.
Focus: ${truncateText(context.processing_focus, 48)}.
Emotion: ${truncateText(context.emotional_tone, 100)}.
Imagery cue: ${truncateText(context.reflection_summary.imagery, 70)}.
Movement: ${truncateText(context.style_motion, 72)}.
Arrangement: ${truncateText(context.musical_guidance.arrangement, 90)}.
Palette: ${compactPalette(context.production_palette, 3)}.
Vocals: ${truncateText(context.vocal_guidance, 70)}.${context.music_relationship ? `\nListener context: ${truncateText(context.music_relationship, 140)}.` : ""}
Musical avoids: no bombast, no harsh synths, no novelty FX.${context.avoid_topics && context.avoid_topics.length ? `\nContent avoids: no reference to ${formatAvoidTopics(context.avoid_topics, { compact: true, maxItems: 4 })} — absent from arrangement mood and lyric direction.` : ""}`;
}
