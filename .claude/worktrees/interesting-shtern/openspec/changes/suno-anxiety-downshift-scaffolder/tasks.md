## 1. Wizard Contract Implementation

- [x] 1.1 Implement screens 1-3 (intention, activation slider 0-10, support approach) with exact prompt labels and option sets.
- [x] 1.2 Implement screens 4-6 (boundaries, optional free text, metaphor palette) including custom text inputs and limits.
- [x] 1.3 Implement screens 7-10 (genre 1-2 selection, energy/tempo sliders, vocal+lyrics style, anchor settings and include words).
- [x] 1.4 Add client-side validation for limits (metaphors <= 3, genres <= 2, include words <= 6, free text guidance 1-3 sentences).
- [x] 1.5 Add snapshot/contract tests asserting fixed option vocab and prompt labels on all 10 screens.

## 2. Canonical Data Model and Intake Processing

- [x] 2.1 Implement canonical intake schema matching the MVP JSON model.
- [x] 2.2 Implement computed field derivation (`user_term_for_distress`, `bpm_range`, `instrument_palette`) after intake submit.
- [x] 2.3 Add normalization for custom text fields (trim, dedupe include words, enforce anonymous defaults).

## 3. Deterministic Mapping Engine

- [x] 3.1 Implement activation band mappings with exact BPM/arrangement/repetition behavior.
- [x] 3.2 Implement support-approach to lyrical-stance mappings for all five approaches.
- [x] 3.3 Implement lyrics-style logic (mostly metaphor, balanced with one gentle term mention, more direct but kind).
- [x] 3.4 Implement metaphor imagery bank mapping including custom metaphor merge behavior.
- [x] 3.5 Implement anchor line generation based on anchor style and include words.

## 4. Template Composer and Prompt Generation

- [x] 4.1 Implement Option A lyrics template contract with exact headings and chorus anchor repetition rule.
- [x] 4.2 Implement Option A music template contract with downshift-safe mix/arrangement constraints.
- [x] 4.3 Implement Option B lyrics template contract with exact headings and bridge vocal behavior.
- [x] 4.4 Implement Option B music template contract with adjacent influence and single signature element selection.
- [x] 4.5 Implement generation action returning exactly four blocks (A lyrics/music, B lyrics/music) on success.

## 5. Safety and Crisis Interruption

- [x] 5.1 Implement pre-generation self-harm intent detection and terminal crisis-response state.
- [x] 5.2 Implement anti-discrimination filtering that is always enforced independent of user boundary selection.
- [x] 5.3 Implement avoid-topic enforcement across both options, including custom avoid topics.
- [x] 5.4 Implement post-generation anonymization and safety postcheck before results render.
- [x] 5.5 Implement crisis resources content path and suppress prompt outputs during crisis state.

## 6. Results Experience and Iteration Controls

- [x] 6.1 Implement copy controls for each of the four generated prompt blocks.
- [x] 6.2 Implement regeneration knobs (calmer, grounded, hopeful, repetition, acoustic, lo-fi, metaphor/direct) using original intake state.
- [x] 6.3 Implement deterministic knob delta behavior so repeated regenerations are controllable and reproducible.
- [x] 6.4 Implement ratings capture (enjoyment 0-10, conveyed-my-idea 0-10, optional comment).

## 7. Privacy and Persistence

- [x] 7.1 Implement minimal persistence strategy for intake and ratings.
- [x] 7.2 Ensure optional free text is omitted/minimized by default unless explicit retention opt-in exists.
- [x] 7.3 Add telemetry fields for output quality review without storing identifying details.

## 8. Verification and Quality Gates

- [x] 8.1 Add unit tests for distress-term precedence and lyrics-style branching behavior.
- [x] 8.2 Add unit tests for activation thresholds and BPM band mapping edge cases.
- [x] 8.3 Add tests for exact Option A/Option B heading contracts and required anchor behavior.
- [x] 8.4 Add safety tests for anti-discrimination enforcement, avoid-topic blocking, and anonymization.
- [x] 8.5 Add crisis interruption tests ensuring zero prompt output when intent is detected.
- [x] 8.6 Add integration test for full wizard-to-generation happy path including copy and ratings events.
- [x] 8.7 Add determinism tests to verify equivalent structural guidance across repeated runs with identical intake and knob state.
- [x] 8.8 Run `openspec validate suno-anxiety-downshift-scaffolder --strict` and resolve any issues.
