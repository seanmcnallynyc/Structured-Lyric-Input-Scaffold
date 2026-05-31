# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running and testing

Open `index.html` directly in a browser — no build step, no bundler. The `src/` modules are loaded via native ES module `import` with cache-busting version strings (e.g. `?v=20260321c`).

Run all tests:
```
node --test
```

Run a single test file:
```
node --test tests/generator.test.js
```

Tests use Node's built-in `node:test` runner. No Jest, no Vitest.

## Architecture

This is a multi-file ES module app (no framework) with a single HTML entry point. `index.html` imports `src/app.js`, which owns all rendering and UI state. The rest of `src/` is pure logic with no DOM dependencies, making it fully testable in Node.

### Data flow: intake → generation

```
UI answers (state.answers)
  → buildRawIntakeFromFlow()       [app.js]
  → validateIntake()               [schema.js]  — normalizes + validates
  → safetyPrecheck()               [safety.js]  — crisis/urgent-support block
  → computeMappedState()           [mapping.js] — derives emotional arc, branch meta, production palette
  → buildContext()                 [generator.js]
  → renderTherapistSummary()       [templates.js]
  → renderSunoLyricsPrompt()       [templates.js]
  → renderSunoStylesPrompt()       [templates.js]
  → safetyPostcheck() × 3         [safety.js]  — discrimination/graphic/avoid-topic block + anonymize
  → state.generation → renderApp()
```

### Key modules

- **`app.js`** — all UI state, rendering, and event wiring. One plain `state` object; every interaction calls `renderApp()` which does a full innerHTML re-render. No virtual DOM, no diffing.
- **`decisionTreeData.js`** — the question tree: `FLOW_QUESTIONS` array defines each question's id, `responseType`, `dependsOn`, `required`, `maxSelect`, and `otherTrigger`. Options for branching questions (`branch_focus`, `story_emotions`, `imagery_detail`) are dynamically resolved from the current answers via helper functions (`getBranchFocusOptions`, `getStoryEmotionOptions`, `getImageryOptionsForCategory`).
- **`branching.js`** — maps `song_function` values to their valid `branch_focus` options and prompt labels.
- **`mapping.js`** — derives all computed fields: `emotional_arc`, `branch_guidance`, `production_palette`, `style_anchor`, etc. from `MUSICAL_TONE_MAP` and `GENRE_PRODUCTION_MAP` lookup tables plus `getBranchMeta()` which switches on `song_function`.
- **`schema.js`** — `normalizeIntake()` sanitizes raw form data; `validateIntake()` enforces all field constraints against the allowed values from `constants.js`.
- **`safety.js`** — two passes: `safetyPrecheck()` blocks generation entirely on crisis/urgent-support/graphic patterns; `safetyPostcheck()` runs on each output block to block discrimination, graphic content, and avoid-topics, then calls `anonymizeText()` to strip PII patterns (emails, phone numbers, addresses, `@handles`, `my name is X`).
- **`templates.js`** — string template functions that assemble the three output blocks (therapist summary, Suno lyrics prompt, Suno styles prompt) from the context object.
- **`store.js`** — thin localStorage wrapper. Session data is cleared on app load (`clearStoredSession` called in `app.js` init). Persistence functions (`persistGeneration`, `persistRating`, etc.) exist but are not called from `app.js` in the current build — they are wired for future use.
- **`constants.js`** — all allowed option arrays (`SONG_FUNCTION_OPTIONS`, `GENRE_OPTIONS`, etc.) and crisis resource strings.

### Question visibility and gating

`getVisibleQuestions()` walks `FLOW_QUESTIONS` in order and stops at the first required unanswered question, so the form gates on each required step. `QUESTION_BLOCKS` in `app.js` defines render pairs (some questions render as "compound" parent+child blocks, e.g. `listener_perspective` pairs `directed_listener` + `song_perspective`).

### Cache-busting pattern

All `import` paths include `?v=BUILD_ID` query strings. When updating `BUILD_ID` in `app.js`, update it in all import paths across all `src/` files to match.
