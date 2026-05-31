## Why

People under stress often need a fast, safe way to create calming music prompts without overthinking wording or structure. This change defines a deterministic, safety-first scaffold that reliably turns a short intake into two Suno-ready prompt pairs for anxiety/stress downshift.

## What Changes

- Add a 10-screen wizard flow for intention, activation, support style, boundaries, free text, metaphor selection, genre, energy/tempo preference, vocal/lyrics style, and anchor-line options.
- Define exact screen-level labels, option sets, and validation limits (including up-to-3 metaphor picks, up-to-2 genre picks, and up-to-6 include words).
- Add deterministic mapping logic from intake to prompt controls (BPM range, arrangement density, lyrical stance, language style, and imagery bank).
- Define deterministic template contracts for all four output blocks:
  - Option A lyrics prompt
  - Option A music prompt
  - Option B lyrics prompt
  - Option B music prompt
- Add generation that always returns two options:
  - Option A: safe/simple (predictable structure and high fit)
  - Option B: creative/bold (more vivid imagery, still downshift-safe)
- Add strong safety guardrails:
  - anonymous by default
  - anti-discrimination enforcement
  - avoid-topics enforcement
  - self-harm intent interruption with crisis resources
- Add copy actions for each generated prompt block.
- Add regeneration knobs that preserve intake and adjust output direction.
- Add lightweight post-generation ratings capture.
- Add minimum data model and data-minimization defaults for privacy-safe storage.

## Capabilities

### New Capabilities

- `anxiety-downshift-scaffolder`: Collect wellbeing intake via wizard, apply deterministic downshift mappings, and generate two safe Suno-ready prompt pairs with copy/regeneration/rating support.

### Modified Capabilities

- None.

## Impact

- Affected code:
  - New wizard and results UI surfaces.
  - New prompt-generation orchestration layer (rules + templating).
  - New safety and crisis-interruption middleware/policy checks.
  - New lightweight feedback persistence path.
- APIs/systems:
  - LLM generation endpoint contract for structured inputs/outputs.
  - Optional persistence for de-identified ratings/intake fields.
- Dependencies:
  - No required external dependency change; crisis resource content can be static configuration in v1.
