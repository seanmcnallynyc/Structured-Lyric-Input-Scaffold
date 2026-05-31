# Product Context: Anxiety Downshift Scaffolder

## The problem this feature solves

### For patients

The blank page is a real barrier in music therapy songwriting sessions.

Patients commonly say: *"I don't know what I want my song to be about." "I don't know what to say." "I'm not sure where to start."*

This isn't a preference gap — it's a clinical presentation. The same avoidance and overwhelm that brings someone into therapy often shows up again the moment they're asked to express something. Structure isn't just convenience here; it's scaffolding. A guided intake does some of the work that would otherwise fall entirely on the patient.

This feature is designed with oncology populations in mind (patients navigating a cancer diagnosis) but the problem is not population-specific. Anywhere a patient lacks access to what they want to say, a structured intake helps.

### For therapists

Music therapists know what questions to ask — who, what, where, when, why, how, and feelings. But running that process live while simultaneously tracking responses, shaping them into a usable prompt, and staying present with the patient is three jobs at once.

The result is inconsistent sessions: different questions each time, nothing systematically documented, and high cognitive load on the therapist every time they try to use AI music generation.

## Why this feature, over other options

**Option considered: Have the therapist write the prompt freehand**
The problem is blank-page friction shifts from patient to therapist. Prompt quality varies by the therapist's comfort with AI tools, not by clinical intent.

**Option considered: Let the patient interact with Suno directly**
Suno's interface provides no clinical scaffolding. The blank text field is the same blank page problem in a different interface. It also removes the therapist from the process entirely, which is clinically inappropriate for the populations this tool targets.

**Option considered: Generic AI songwriting assistants**
Existing tools are not built around clinical constructs. They don't distinguish between emotional signal families, song function, therapeutic perspective, or avoid topics. The specificity of this intake is a differentiator — the questions reflect music therapy practice, not general creative writing.

**Why this approach works:**
- The intake flow is itself a therapeutic intervention, not just data collection. The questions create structured reflection time.
- Output is plain text — it works with any text-to-music platform, now and as the platform landscape shifts.
- The therapist reviews the session snapshot before generating anything, which creates a natural checkpoint for clinical judgment.

## Target user

**Primary:** Music therapists facilitating individual or group songwriting sessions with clients who have expressed difficulty initiating or articulating what they want to say.

**Secondary:** Music therapists who want consistent, documentable session structure for AI-assisted songwriting regardless of patient presentation.

## Success metrics

### Pre-generation (measurable in-tool, v1)

The post-Suno feedback loop — use tool, generate music, return and rate — is not viable in a clinical session context. Drop-off will be near-total. Success metrics must be collectible at the moment of highest intent.

**1. Intake completion rate**
% of sessions that reach "Generate prompts" vs. abandoned mid-flow. A high abandonment rate at a specific question signals friction or confusion in the intake design.

**2. Time-to-generate**
Median time from first question to prompt generation. A proxy for cognitive load. Target: under 5 minutes for a therapist-facilitated session.

**3. Snapshot satisfaction (primary quality signal)**
A single prompt shown to the therapist immediately after the session snapshot renders, before they copy to Suno: *"Does this capture what you wanted to say?"* — Yes / Somewhat / No.

This is the right moment: the therapist is already reading the snapshot to evaluate it. Capturing that judgment is low friction and has high ecological validity. It measures whether the intake-to-output mapping is working, independent of what Suno produces.

### Post-session (research context only, not v1 in-tool)

- Therapist-reported: "Did the generated prompt reflect the client's intended expression?" (binary, collected by researcher post-session)
- Session documentation quality: whether therapists report using the snapshot as a session note or reference

## Key constraints

- **Clinical context:** The tool is used during a live session with a patient present. Any friction that requires the therapist to context-switch away from the patient is a product failure.
- **Privacy:** The intake captures emotionally sensitive content. Even de-identified fields are subject to clinical privacy standards. No data is stored by default in v1.
- **Platform agnosticism:** Output must not couple to Suno specifically. The text-to-music platform landscape is evolving; the intake and output format should outlast any single platform.

## What success looks like at launch

A music therapist can complete the intake flow in a live session, review the snapshot, and paste the output into Suno — without breaking the therapeutic presence of the session. The client leaves having participated in a structured creative process. The therapist has a replicable, documentable artifact of that process.

---

## Implementation status: snapshot satisfaction metric

The "Does this output capture what you wanted to say?" widget is built and live (Yes / Somewhat / No, shown below the generated output). The UI is complete.

**What exists today:**
- The rating is captured in client-side state (`state.snapshotRating`) and shown as confirmed feedback once selected.
- The response resets when the session is cleared or a new generation is run.

**What needs to happen before this metric is useful:**

1. **Persistence** — Ratings currently live only in memory and are lost on page reload. `persistRating()` in `src/store.js` is already implemented and stores the rating in `localStorage` with a timestamp. It needs to be called when the user selects a rating. This is a one-line wire-up, intentionally held pending the broader PHI/consent decision (see [GitHub Issue #4](https://github.com/seanmcnallynyc/Structured-Lyric-Input-Scaffold/issues/4)).

2. **Export or retrieval** — `localStorage` data is per-device and per-browser. A therapist can't review aggregate ratings without an export mechanism or a backend. Options in order of complexity:
   - **Export to CSV button** (lowest lift): read `suno_prompt_scaffolder_ratings` from localStorage, serialize to CSV, trigger a download. No backend required. Suitable for a single therapist running their own sessions.
   - **Anonymous backend log** (medium lift): POST de-identified ratings to a lightweight endpoint (e.g. a free-tier form backend or serverless function). Enables aggregate analysis across sessions and devices.
   - **Research database** (highest lift): required if this is used in a formal clinical research context with IRB oversight.

3. **Connecting rating to intake fields** — The satisfaction rating is only actionable if it can be correlated with what was answered in the intake. For example: do sessions with `song_function = "support calm"` rate higher than `"make sense of something"`? This requires the telemetry event (already built in `buildTelemetryEvent` in `src/generator.js`) to be stored alongside the rating. The data shape is already defined — it's a wiring and consent decision, not a design problem.

4. **Sample size and validity** — A 3-point in-tool rating is a sentiment signal, not a clinical outcome measure. It tells you whether the prompt felt right to the therapist at the moment of generation, not whether the resulting song was therapeutically effective. For research purposes, this would need to be paired with a validated instrument or a structured post-session observation protocol. Defining that is out of scope for the tool itself but relevant to any IRB submission.

**Decision needed before wiring persistence:** Does the tool need explicit consent language ("This session's structured data may be recorded to improve the tool") displayed before the rating is stored? That framing decision should come before the technical wire-up, not after.
