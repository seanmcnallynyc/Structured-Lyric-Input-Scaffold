# Product Context

## What this is

A structured intake tool for music therapists who use AI music generation (Suno, Udio, or similar platforms) in clinical sessions.

The therapist guides the client through a short guided flow — about 3–5 minutes — and the app produces three outputs: a therapist-facing session snapshot, and two prompts formatted for immediate paste into a text-to-music platform.

## The problem

When a music therapist uses AI music generation in a session, two things are true at once:

**There is no standard intake structure.** Nothing in clinical training or existing tools tells a therapist how to translate a live session into a text-to-music prompt. Every therapist improvises this differently, every session. The output quality depends entirely on how well they can synthesize emotional content, musical intent, and client context in real time.

**The therapist's job is to be present.** Anything that pulls attention toward prompt engineering or documentation competes with that presence. The therapeutic relationship requires the therapist to be in the room, not composing text.

The result: AI music generation is underused or used poorly in clinical settings, not because therapists lack interest, but because the handoff from session to prompt has no structure.

## What this tool does

It provides that structure as a clinical product decision, not a technical one.

The questions in the intake flow — what the song should do, who it's for, what emotions are present, what imagery fits, what the music should feel like — are derived from music therapy practice. The order they appear in, which are multi-select vs. free text, what the output looks like: each of these is a product decision documented in this repository.

The therapist focuses on the client. The tool handles the synthesis.

## PM decisions in this repo

Every design choice here is a product decision with a rationale:

- **Question selection and order** — what clinical constructs matter for song creation (emotion families, song function, imagery, perspective) and in what sequence they become useful
- **Response type per question** — multi-select limits attention-splitting; free text is reserved for questions where constraint would lose signal
- **Output format** — three blocks (therapist snapshot, lyrics prompt, styles prompt) so the therapist can review before generating, and copy each block independently
- **Safety design** — crisis detection, PII anonymization, and topic avoidance controls are product requirements in a clinical tool, not engineering add-ons
- **Handoff friction** — output is plain text, platform-agnostic, and copy-ready; no account, no login, no export step

## Who this is for

Music therapists integrating AI-assisted song creation into individual or group sessions. The tool is designed to work in the room, during a session, with a real client present.

It is not designed for patients to use independently. The intake questions assume a therapist is facilitating.

## What's not in scope (yet)

- **Session data storage and telemetry** — the infrastructure exists (see `src/store.js`) but is intentionally unwired. Before storing any session data, even de-identified, a PHI disclosure and consent strategy is required. This is a product decision pending resolution, tracked in [GitHub Issues](https://github.com/seanmcnallynyc/Structured-Lyric-Input-Scaffold/issues/4).
- **Multi-session continuity** — v1 clears session state on load. Returning to a previous session or building across sessions is a future capability.
- **Platform integration** — output is copy/paste only. A direct API integration with Suno or similar would reduce handoff friction further, but couples the tool to a platform with an uncertain roadmap.

## Future direction

The primary open question is whether and how to store session data. Even de-identified intake fields (song function, emotional signal, genre) constitute a usage signal worth capturing for product improvement. The tradeoff is privacy burden in a clinical context. That decision will shape whether this tool remains a stateless utility or becomes a longitudinal session record.
