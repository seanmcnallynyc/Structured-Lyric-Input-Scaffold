## ADDED Requirements

### Requirement: Wizard SHALL implement the full 10-screen intake contract
The system SHALL provide exactly 10 wizard screens in the defined order with the specified prompts, controls, and selection limits:
1) Intention (single select with "Other" free text)
2) Activation slider (0-10)
3) Support approach (single select)
4) Boundaries (checkbox list plus optional free text)
5) User free text (optional, 1-3 sentences)
6) Metaphor palette (choose up to 3 plus optional custom metaphor)
7) Musical style (choose 1-2 genres plus optional other text)
8) Energy and tempo preference (two sliders)
9) Voice + lyrics style (two single selects)
10) Anchor line + include words (yes/no anchor, anchor style when enabled, include words up to 6)

#### Scenario: User completes all required inputs
- **WHEN** the user reaches screen 10 and submits valid selections
- **THEN** the system accepts the intake and enables generation

#### Scenario: User exceeds selection limits
- **WHEN** the user attempts to select more than 3 metaphors, more than 2 genres, or more than 6 include words
- **THEN** the system prevents submission and shows a validation message

### Requirement: Wizard option vocabularies SHALL match defined product copy
The system SHALL expose the defined selectable options for each screen:
- Screen 1 intention options: Calm my body, Quiet racing thoughts, Help me feel safe/grounded, Help me release pressure, Help me feel hopeful, Other
- Screen 3 approach options: Gentle reassurance, Grounding and steady, Encouraging and empowering, Reflective and validating, Light and playful distraction
- Screen 4 boundary options: Discrimination/hate, Violence, Death/dying, Religion/spirituality, Family/relationships, Medical language, Other topics to avoid
- Screen 6 metaphor options: Weather (storm -> clearing), Ocean/tide, Mountains/trail, Fire -> embers, Night -> sunrise, City noise -> quiet room, Garden/roots, Breath/heartbeat, My own metaphor
- Screen 7 genre options: acoustic singer-songwriter, lo-fi/chillhop, ambient/soundscape, indie pop, folk, piano ballad, soft R&B, cinematic, other
- Screen 9 vocal options: instrumental only, soft sung, spoken word, gentle duet, airy choir
- Screen 9 lyrics style options: mostly metaphor, balanced, more direct
- Screen 10 anchor styles: I am..., Right now..., Let it..., You can...

#### Scenario: Wizard renders fixed options
- **WHEN** the user opens each selection screen
- **THEN** the UI presents the defined option list for that screen in product copy

### Requirement: Boundaries SHALL always enforce anti-discrimination protection
The system SHALL enforce protection against discriminatory or hate content toward marginalized groups regardless of user boundary selections, and SHALL also respect the user's selected avoid-topic boundaries.

#### Scenario: User leaves discrimination checkbox unselected
- **WHEN** the user does not explicitly select "Discrimination / hate"
- **THEN** the system still enforces anti-discrimination blocking during generation

#### Scenario: User selects additional avoid topics
- **WHEN** the user selects violence, death/dying, religion/spirituality, family/relationships, medical language, and/or custom avoid topics
- **THEN** both output options avoid those topics

### Requirement: System SHALL use privacy-minimized intake and computed state
The system SHALL represent generation state using the minimum data model fields:
`intention`, `activation`, `approach`, `avoid_topics`, optional `user_free_text`, `metaphors`, optional `custom_metaphor`, `genres`, `energy`, `tempo_pref`, `vocal_style`, `lyrics_style`, `anchor_enabled`, optional `anchor_style`, `include_words`, and computed fields `user_term_for_distress`, `bpm_range`, `instrument_palette`.

#### Scenario: Intake is transformed into computed generation state
- **WHEN** the user submits the wizard
- **THEN** the system computes `user_term_for_distress`, `bpm_range`, and `instrument_palette` before template rendering

#### Scenario: Raw text retention is not explicitly enabled
- **WHEN** storage occurs for analytics or ratings
- **THEN** optional free text is omitted or minimized by default

### Requirement: Distress language SHALL match user wording rules
The system SHALL select distress wording using this precedence:
1) If the user uses "stress", use "stress"
2) Else if the user uses "anxiety", use "anxiety"
3) Else default to "stress"

#### Scenario: User uses stress wording
- **WHEN** user free text includes "stress"
- **THEN** generated prompts use "stress"

#### Scenario: User uses anxiety wording but not stress
- **WHEN** user free text includes "anxiety" and not "stress"
- **THEN** generated prompts use "anxiety"

#### Scenario: User uses neither stress nor anxiety
- **WHEN** neither distress term is present in intake text
- **THEN** generated prompts use "stress"

### Requirement: Lyrics style SHALL control metaphor vs direct language
The system SHALL apply lyrical directness behavior deterministically:
- mostly metaphor: metaphor-first language and no clinical wording unless user already used it
- balanced: allow at most one gentle mention of the user's distress term when the user used it
- more direct: allow explicit stress/anxiety wording while remaining kind and non-graphic

#### Scenario: Mostly metaphor style selected
- **WHEN** lyrics style is mostly metaphor
- **THEN** generated prompts avoid clinical or diagnostic wording unless user input already contains it

#### Scenario: Balanced style selected
- **WHEN** lyrics style is balanced and user used a distress term
- **THEN** generated prompts include no more than one gentle distress-term mention

#### Scenario: More direct style selected
- **WHEN** lyrics style is more direct
- **THEN** generated prompts can use stress/anxiety language without graphic or harsh phrasing

### Requirement: Activation SHALL map to BPM and arrangement constraints
The system SHALL apply exact activation mapping rules:
- activation >= 7: 55-75 BPM, sparse arrangement, minimal percussion, higher repetition, shorter lyric lines
- activation 4-6: 65-90 BPM, gentle groove allowed, moderate repetition
- activation <= 3: 70-100 BPM with soft and uncluttered dynamics

#### Scenario: Activation high band
- **WHEN** activation is 7 or above
- **THEN** both music prompts constrain tempo to 55-75 BPM and emphasize sparse/minimal rhythmic intensity

#### Scenario: Activation medium band
- **WHEN** activation is between 4 and 6 inclusive
- **THEN** both music prompts constrain tempo to 65-90 BPM and may include gentle groove elements

#### Scenario: Activation low band
- **WHEN** activation is 3 or below
- **THEN** both music prompts constrain tempo to 70-100 BPM with soft uncluttered dynamics

### Requirement: Support approach SHALL map to lyrical stance
The system SHALL map approach selections to deterministic lyrical guidance:
- Gentle reassurance -> second-person warmth, permission, and safety cues
- Grounding and steady -> present-tense sensory anchors (breath/feet/room)
- Encouraging and empowering -> "I can / we can" movement without aggressive intensity
- Reflective and validating -> acceptance language and non-judgment
- Light and playful distraction -> lighter soothing imagery and small-joy framing

#### Scenario: Grounding and steady selected
- **WHEN** approach is grounding and steady
- **THEN** lyric prompts include present-tense sensory grounding cues

#### Scenario: Reflective and validating selected
- **WHEN** approach is reflective and validating
- **THEN** lyric prompts include acceptance and non-judgment framing

### Requirement: Metaphor palette SHALL drive imagery bank
The system SHALL build imagery guidance from selected palette items and optional custom metaphor text:
- Weather -> storm/clouds/clearing/sunlight
- Ocean/tide -> tide/waves/shore/floating
- Mountains/trail
- Fire -> embers
- Night -> sunrise
- City noise -> quiet room/softened edges
- Garden/roots -> soil/seasons/roots/growth
- Breath/heartbeat
- Custom metaphor (when provided)

#### Scenario: User provides custom metaphor
- **WHEN** custom metaphor text is present
- **THEN** generation includes custom imagery in the metaphor bank

#### Scenario: No metaphor selected
- **WHEN** the user selects none of the preset metaphors
- **THEN** the system still produces metaphor-forward imagery using neutral downshift-safe defaults

### Requirement: Option A SHALL produce safe/simple Suno-ready prompt pair
The system SHALL produce Option A with two prompt blocks:
- Lyrics prompt instructing exact structure headings:
  Verse 1, Chorus, Verse 2, Chorus, Bridge, Final Chorus
- Music prompt instructing genres, computed BPM range, calm grounded mood, vocal style, soft instrument palette, intimate mix, and non-aggressive arrangement arc

#### Scenario: Option A lyrics structure and anchor line
- **WHEN** Option A lyrics prompt is rendered
- **THEN** chorus instructions include exactly one anchor line repeated twice

#### Scenario: Option A music safety constraints
- **WHEN** Option A music prompt is rendered
- **THEN** it instructs no aggressive drums, no harsh synths, no distortion, and no chaotic transitions

### Requirement: Option B SHALL produce creative-but-safe Suno-ready prompt pair
The system SHALL produce Option B with two prompt blocks:
- Lyrics prompt instructing exact structure headings:
  Verse, Refrain, Verse, Refrain, Bridge, Final Refrain
- Music prompt instructing genre blend with one adjacent influence, computed BPM range, calm spacious mood, one signature element, gentle refrains lift, and no intensity spikes

#### Scenario: Option B signature element selection
- **WHEN** Option B music prompt is rendered
- **THEN** exactly one signature element is selected from felt piano, distant choir pad, tape wobble, soft synth bell, or brushed snare

#### Scenario: Option B bridge vocal handling
- **WHEN** vocal style allows spoken word
- **THEN** bridge instructions permit spoken-word bridge; otherwise bridge instructions require sung bridge

### Requirement: Generated prompts SHALL be concise, actionable, and reproducible
The system SHALL render prompts that are immediately copy/paste usable in Suno, concise in wording, and explicit enough that repeated runs with identical inputs and settings produce equivalent structural guidance.

#### Scenario: Repeated generation with identical inputs
- **WHEN** generation is run multiple times with the same intake, mapping state, and knob state
- **THEN** each output preserves the same required structure, constraints, and deterministic control directives

### Requirement: Self-harm intent SHALL interrupt generation and show crisis resources
The system SHALL not produce prompts when self-harm intent is detected and SHALL return a crisis-support response with immediate-help language and contact pathways.

#### Scenario: Self-harm intent detected
- **WHEN** safety checks detect self-harm intent in user text
- **THEN** the system returns only crisis resources and suppresses Option A/Option B outputs

### Requirement: Regeneration knobs SHALL preserve intake and apply directional modifiers
The system SHALL support these knob actions using original intake state: make it calmer, more grounded, more hopeful, more repetition, more acoustic, more lo-fi, and more metaphor/more direct.

#### Scenario: User applies calmer knob
- **WHEN** the user selects "Make it calmer"
- **THEN** regeneration lowers tempo within computed band, reduces percussion emphasis, and simplifies lyric guidance

#### Scenario: User applies more direct knob
- **WHEN** the user selects "More direct"
- **THEN** regeneration increases explicitness while preserving kindness and safety guardrails

### Requirement: Results UI SHALL support copy and lightweight feedback
The system SHALL expose copy controls for each prompt block and collect post-generation ratings using enjoyment (0-10), conveyed-my-idea (0-10), and optional comment.

#### Scenario: User copies one prompt block
- **WHEN** copy is pressed for any one of the four blocks
- **THEN** only that block text is copied to clipboard

#### Scenario: User submits ratings
- **WHEN** the user submits feedback
- **THEN** the system records both numeric ratings and optional comment tied to the generation event
