## Context

The v1 product is a self-guided wellbeing wizard that turns a short intake into two Suno-ready prompt pairs for anxiety/stress downshift. The core challenge is balancing creativity with deterministic reproducibility and strict safety constraints. The design therefore treats rule mapping and safety as first-class components, with model generation constrained by structured templates rather than free-form prompting.

The user journey is:
1) complete a 10-screen wizard in 3-6 minutes,
2) generate two output options (A safe/simple, B creative/bold),
3) optionally regenerate using directional knobs,
4) copy outputs and submit lightweight ratings.

Architecture flow:

```text
Wizard UI
  -> Intake Validator
  -> Safety Precheck (self-harm, boundary sanity)
  -> Deterministic Rule Engine
      -> computed variables
  -> Template Composer (A lyrics/music + B lyrics/music)
  -> LLM/Renderer
  -> Safety Postcheck (anonymization, disallowed content)
  -> Results UI (copy + knobs + ratings)
```

## Goals / Non-Goals

**Goals:**
- Implement the exact 10-screen intake contract and selection limits.
- Guarantee deterministic mapping for distress term, BPM band, lyrical stance, and imagery guidance.
- Always return two Suno-ready option pairs on non-crisis flows.
- Enforce anonymity, anti-discrimination policy, avoid-topic boundaries, and self-harm interruption.
- Support regeneration knobs that reuse original intake and apply only directional deltas.
- Persist minimal structured data and lightweight ratings.

**Non-Goals:**
- Medical diagnosis, treatment recommendations, or therapeutic claims.
- Long-term identity-linked user profiling in v1.
- Unbounded creative generation without constraint templates.
- Advanced international crisis routing beyond static fallback messaging.

## Decisions

### Decision: Canonical intake schema with explicit computed block
- Rationale: A canonical object prevents drift between wizard UI, rules engine, and generator input.
- Implementation shape: store user-entered fields and a `computed` object with `user_term_for_distress`, `bpm_range`, and `instrument_palette`.
- Alternative considered: Infer computed values inside template logic ad hoc.
- Why not alternative: Harder to test and causes hidden coupling.

### Decision: Deterministic rules run before template composition
- Rationale: Rule-first architecture guarantees mapping behavior and allows targeted tests for threshold/branch logic.
- Rules encoded:
  - activation band -> BPM/arrangement/repetition behavior
  - approach -> lyrical stance
  - lyrics style -> metaphor/directness behavior
  - metaphor picks -> imagery bank
  - distress term precedence (stress first, then anxiety, else stress)
- Alternative considered: Let model infer mapping from narrative instructions.
- Why not alternative: Non-deterministic outputs and weaker safety guarantees.

### Decision: Two fixed template families with strict heading contracts
- Rationale: Fixed structure ensures Suno-ready consistency and predictable user outcomes.
- Option A contract:
  - Lyrics headings: Verse 1, Chorus, Verse 2, Chorus, Bridge, Final Chorus
  - Chorus contains one anchor line repeated twice
  - Music guidance prioritizes soft palette and anti-harsh constraints
- Option B contract:
  - Lyrics headings: Verse, Refrain, Verse, Refrain, Bridge, Final Refrain
  - One signature sonic element selected from a fixed list
  - Slightly more vivid imagery while preserving downshift safety
- Alternative considered: Single template with style toggles.
- Why not alternative: Reduced clarity and weaker A/B differentiation.

### Decision: Layered safety pipeline (precheck + postcheck)
- Rationale: Precheck handles crisis interruption and invalid inputs; postcheck catches generation leakage.
- Precheck responsibilities:
  - self-harm intent detection,
  - avoid-topic policy preparation,
  - validate selection limits and required fields.
- Postcheck responsibilities:
  - strip identifying details,
  - reject discriminatory/hate content,
  - enforce avoid-topic constraints on final text.
- Alternative considered: One-pass filtering only after generation.
- Why not alternative: Generates unsafe interim outputs and wastes calls.

### Decision: Crisis interruption is a terminal response state
- Rationale: Requirement is to stop prompt generation if self-harm intent appears.
- Behavior:
  - do not return A/B prompts,
  - return crisis resources and immediate-help guidance,
  - preserve dignity and non-judgmental tone.
- Alternative considered: Return prompts plus safety warning.
- Why not alternative: Violates product safety contract.

### Decision: Regeneration knobs use deterministic deltas
- Rationale: Knobs must feel controllable and reproducible, not random.
- Delta examples:
  - calmer -> lower tempo within band, fewer drums, simpler lines
  - grounded -> more sensory anchors/present tense
  - hopeful -> gentle harmonic uplift wording
  - repetition -> shorter lines plus anchor reuse
  - acoustic/lo-fi -> deterministic palette substitutions
  - metaphor/direct -> directness weighting adjustment
- Alternative considered: Re-run generation with the same prompt and "vibe" hint.
- Why not alternative: Inconsistent outcomes and weak explainability.

### Decision: Minimal persistence defaults
- Rationale: Lowers privacy risk for wellbeing use cases.
- Storage policy:
  - required structured fields are retained only when needed for function/analytics,
  - free text is optional and minimized unless explicit opt-in exists,
  - ratings are de-identified and linked to generation event metadata.
- Alternative considered: Full transcript storage for tuning.
- Why not alternative: Higher privacy burden than MVP requires.

## Risks / Trade-offs

- [Risk] High false-positive crisis detection blocks benign users -> Mitigation: conservative classifier threshold, transparent retry path, and clear escalation language.
- [Risk] Strict deterministic rules reduce perceived creativity -> Mitigation: dedicated creative Option B and knob-based controlled variation.
- [Risk] Postcheck over-filtering may flatten emotional tone -> Mitigation: policy tuning with golden-set examples and manual review loop.
- [Risk] Genre preferences conflict with downshift safety -> Mitigation: activation-based BPM and anti-harsh constraints remain hard bounds.
- [Risk] Custom metaphor text introduces sensitive details -> Mitigation: anonymization pass and identifier stripping before final output.

## Migration Plan

1. Add feature flag for wizard + generation pipeline.
2. Implement canonical schema and deterministic rules with unit tests.
3. Add template composer for Option A and Option B.
4. Integrate layered safety checks and crisis terminal state.
5. Enable copy, knobs, and ratings UI.
6. Roll out to limited traffic and monitor safety/quality metrics.
7. Promote to general availability after threshold metrics are met.
8. Rollback by disabling feature flag while preserving collected ratings data.

## Open Questions

- Should v1 crisis resources include locale-aware links or a static international fallback beyond US 988 guidance?
- Should boundary enforcement for custom avoid topics use lexical matching only, semantic matching, or both?
