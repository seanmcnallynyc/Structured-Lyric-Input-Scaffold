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
