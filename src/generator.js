import {
  computeMappedState,
  mergeReflectionSummary,
} from "./mapping.js?v=20260428a";
import { validateIntake } from "./schema.js?v=20260428a";
import {
  anonymizeText,
  safetyPostcheck,
  safetyPrecheck,
} from "./safety.js?v=20260428a";
import {
  renderTherapistSummary,
  renderSunoLyricsPrompt,
  renderSunoStylesPrompt,
} from "./templates.js?v=20260428a";

// When the therapist edits the snapshot's music_direction field, derive genre from that
// value so the Suno prompts reflect the edit rather than the original pill selection.
// Format is "${musical_tone}, ${genre}" — if the override starts with the known tone prefix
// we strip it; otherwise we treat the whole override as the genre description.
function resolveEffectiveGenre(intake) {
  const overriddenDir = intake.reflection_summary?.music_direction;
  if (!overriddenDir) return intake.genre;
  const prefix = intake.musical_tone + ", ";
  if (intake.musical_tone && overriddenDir.startsWith(prefix)) {
    return overriddenDir.slice(prefix.length).trim() || intake.genre;
  }
  return overriddenDir.trim() || intake.genre;
}

function buildContext(intake, mapped) {
  const reflectionSummary = Object.fromEntries(
    Object.entries(
      mergeReflectionSummary(mapped.reflection_summary, intake.reflection_summary)
    ).map(([key, value]) => [key, anonymizeText(value)])
  );

  return {
    ...intake,
    ...mapped,
    reflection_summary: reflectionSummary,
    core_realization: anonymizeText(intake.core_realization),
    imagery_detail: anonymizeText(intake.imagery_detail),
    effective_genre: resolveEffectiveGenre(intake),
  };
}

function buildOutput(context) {
  return {
    therapistSummary: renderTherapistSummary(context),
    lyricsPrompt: renderSunoLyricsPrompt(context),
    stylesPrompt: renderSunoStylesPrompt(context),
  };
}

function applyPostChecks(output, intake) {
  return {
    therapistSummary: safetyPostcheck(output.therapistSummary, intake),
    lyricsPrompt: safetyPostcheck(output.lyricsPrompt, intake),
    stylesPrompt: safetyPostcheck(output.stylesPrompt, intake),
  };
}

export function generatePromptSet(rawIntake, options = {}) {
  const validation = validateIntake(rawIntake);
  if (!validation.valid) {
    return {
      status: "invalid",
      errors: validation.errors,
    };
  }

  const intake = validation.value;
  const precheck = safetyPrecheck(intake, { locale: options.locale || "US" });
  if (precheck.blocked) {
    return {
      status: "crisis",
      reason: precheck.reason,
      message: precheck.message,
      resources: precheck.resources,
      intake,
    };
  }

  const mapped = computeMappedState(intake);
  const context = buildContext(intake, mapped);
  const output = buildOutput(context);
  const safeOutput = applyPostChecks(output, intake);

  return {
    status: "success",
    intake,
    computed: {
      reflection_summary: context.reflection_summary,
      emotional_arc: context.emotional_arc,
      arc_target: context.arc_target,
      branch_guidance: context.branch_guidance,
      production_palette: context.production_palette,
      prompt_bias: context.prompt_bias,
    },
    output: safeOutput,
    telemetry: buildTelemetryEvent(context),
  };
}

export function buildTelemetryEvent(context) {
  return {
    generated_at: new Date().toISOString(),
    song_function: context.song_function,
    branch_focus: context.branch_focus,
    genre: context.genre,
    musical_tone: context.musical_tone,
    crisis_blocked: false,
  };
}
