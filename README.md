# Collaborative Songwriting Guide

A structured intake tool for music therapists using AI music generation (Suno) in clinical sessions.

## What it does

Music therapists using Suno face a blank-prompt problem: translating a live clinical session into a usable AI music prompt requires real-time synthesis of emotional content, musical intent, and client context. This tool solves that.

The therapist guides the client through a short structured flow — purpose, emotions, imagery, and musical direction — and the app generates three outputs:

- **Therapist snapshot** — a plain-language session summary to review before generating music
- **Suno Lyrics prompt** — ready to paste into Suno's lyrics field
- **Suno Styles prompt** — ready to paste into Suno's style field

The prompts are deterministic: same inputs produce the same structural guidance every time, which matters for session-to-session consistency and documentation.

## Who it's for

Music therapists integrating AI-assisted song creation into individual or group therapy sessions. The tool is designed around clinical use — it includes safety filters for crisis content, PII anonymization, and topic avoidance controls.

## The problem it solves

Suno produces strong results when given specific, emotionally precise prompts. Generic prompts produce generic music. Therapists don't have 10 minutes mid-session to craft a high-quality prompt from scratch. This tool reduces that to a 3–5 minute guided flow with no blank-page friction.

## Running locally

No build step or bundler required. Open `index.html` directly in a browser. The app uses native ES modules.

```
open index.html
```

To run tests (Node 18+):

```
node --test
```

## Deployed version

[suno.seanmcnallyusa.com](https://suno.seanmcnallyusa.com)

## Architecture

All logic is in `src/` as ES modules with no framework dependencies. `index.html` loads `src/app.js`, which owns all UI state and rendering. The rest of `src/` is pure logic — fully testable in Node.

```
src/
  app.js              — UI state, rendering, event wiring
  decisionTreeData.js — question flow definition
  branching.js        — song function → branch options mapping
  mapping.js          — intake → computed production state
  schema.js           — intake normalization and validation
  generator.js        — orchestrates the full intake → output pipeline
  templates.js        — assembles the three output blocks
  safety.js           — crisis detection, PII anonymization, content filtering
  constants.js        — all option arrays and crisis resource strings
  store.js            — localStorage wrapper (telemetry, ratings infrastructure)
```

Data flow: `UI answers → validateIntake → safetyPrecheck → computeMappedState → buildContext → renderTherapistSummary / renderSunoLyricsPrompt / renderSunoStylesPrompt → safetyPostcheck`

## Safety design

- **Crisis precheck**: blocks generation if self-harm or domestic violence language is detected; shows crisis resources instead
- **Postcheck**: runs on every output block — blocks discriminatory content, graphic content, and user-specified avoid topics
- **PII anonymization**: strips email addresses, phone numbers, @handles, addresses, and "my name is X" patterns from all output

## Design decisions

Each architectural decision is documented in `openspec/changes/structured-lyric-input-scaffold/` as a spec with explicit rationale, alternatives considered, and risk/trade-off analysis.
This tool is built as a portfolio artifact. Each architectural and design decision is documented in `openspec/changes/suno-anxiety-downshift-scaffolder/` as a product spec with explicit rationale, alternatives considered, and risk/trade-off analysis.

Key decisions documented there:
- Deterministic rule-first mapping (vs. free-form LLM inference)
- Layered safety pipeline (precheck + postcheck)
- Privacy-minimized storage defaults
- Two-pass anonymization strategy

## Known gaps / backlog

- `persistGeneration` in `store.js` is wired but not called — telemetry infrastructure exists but is intentionally held pending PHI disclosure strategy resolution
- GitHub Issues tracks the active bug and feature backlog
