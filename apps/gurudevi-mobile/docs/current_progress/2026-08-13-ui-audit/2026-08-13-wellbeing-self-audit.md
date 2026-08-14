---
title: "Gurudevi Mobile Wellbeing / Self UI and Emotional Safety Audit"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Codex"
tags: [mobile, ui-audit, wellbeing, self, emotional-safety, privacy, temporal]
---

# Gurudevi Mobile Wellbeing / Self UI and Emotional Safety Audit

## Scope and evidence limits

This audit covers the live Self route, wellbeing/self feature composition, emotional safety, privacy cues, reflection burden, temporal/history comprehension, and mobile-versus-web composition. Imported documents were treated as hypotheses and checked against repository code.

The canonical live chain is:

`apps/gurudevi-mobile/app/(tabs)/self/index.tsx` → `packages/self/src/screens/SelfScreen.tsx` → `packages/self/src/screens/self/roleResolution.ts` → role-specific `packages/self/src/screens/self/*SelfView.tsx` → `packages/self/src/components/BaseSelfView.tsx`.

The web chain is the platform-specific counterpart ending in `packages/self/src/components/BaseSelfView.web.tsx`. Files under `apps/gurudevi-mobile/archives/` were excluded from live findings. No running app, device, emulator, or runtime screenshots were available in this pass. Spatial findings therefore reconstruct layout from source rather than inspect pixels. Accessibility, actual scroll behavior, animation comfort, microphone permissions, and production database behavior require runtime validation.

## Executive verdict

Self has a promising emotional vocabulary and several good safety intentions, but the current composition is not yet a safe, coherent reflection experience. The principal issue is architectural and redesign-level: a large catalogue of capabilities is being presented as one sanctuary surface, with a single temporal mode applied across unlike features. This makes the person choose among product concepts before they understand today’s emotional job, and it risks turning self-reflection into a dashboard of self-surveillance.

The mobile presentation is closer to a focused spotlight, but it still exposes a horizontally scrolling strip of roughly 20 capabilities, uses 9px labels, and adds multiple indicators to small targets. Web uses a 1/2/3-column card grid and a URL-hash-focused detail view. That divergence is directionally reasonable for available space, but neither surface yet establishes a calm, role-independent primary journey. The Self experience needs a redesign around a small set of consentful moments—check in, release, reflect, understand—before incremental card polish.

## Canonicality and composition trace

### Verified evidence

- The route exports the package Self screen directly: `apps/gurudevi-mobile/app/(tabs)/self/index.tsx`.
- `SelfScreen.tsx` resolves a role from capacity and authorization, then renders one of six role views. A missing role falls back to `StudentSelfView`, which is a potentially surprising emotional-context fallback rather than a neutral unavailable state: `packages/self/src/screens/SelfScreen.tsx:14-48`.
- The teacher view is a useful representative because it composes the broadest wellbeing set. It passes five domains—Journey Overview, Inner Pulse, Personal Sanctuary, Physical Rhythm, Working Rhythm—into `BaseSelfView`: `packages/self/src/screens/self/TeacherSelfView.tsx:105-245`.
- Native `BaseSelfView` flattens every feature into one horizontally scrollable feature strip, selects an active feature, and renders only that feature’s content below it: `packages/self/src/components/BaseSelfView.tsx:52-121`, `packages/self/src/components/BaseSelfView.tsx:270-316`.
- Web `BaseSelfView.web.tsx` renders domain sections and feature cards in responsive grids, then uses a URL hash to open one focused feature: `packages/self/src/components/BaseSelfView.web.tsx:86-151`, `packages/self/src/components/BaseSelfView.web.tsx:303-350`.
- Native and web both expose `Now`/`History`, but with different presentation mechanics. Native has a compact control bar and active-feature content; web has a sticky hub, navigator, mode controls, and a large focused card: `packages/self/src/components/BaseSelfView.tsx:235-316`, `packages/self/src/components/BaseSelfView.web.tsx:154-248`.

### Inference

The source confirms the operationalization document’s core claim that mobile is progressive-disclosure-like and web promotes more content. It weakens any claim that this is already a fully calm experience: mobile progressive disclosure is feature selection inside a long carousel, not a small number of emotionally coherent choices. The same feature registry also mixes private release, mood logging, physical rhythm, reminders, professional history, and social reflection; the UI does not clearly distinguish “for me,” “about my work,” and “visible to others.”

## Spatial-first UI audit

### Stage 1: layout and color

**Evidence.** Native composition is: global header → temporal navigator → Now/History controls → offline/history notices → horizontal feature strip → one active content region → optional rituals and anonymous invitation. The feature strip uses 72px item widths on phones and 104px on tablets, with 64px circular targets, 20px horizontal padding, and 9px labels on phones: `packages/self/src/components/BaseSelfView.tsx:145-207`, `packages/self/src/components/BaseSelfView.tsx:270-283`. The active content region has a nominal minimum height of 400px. The native view uses direct hex values and utility classes together, including `#FFF7ED`, `#F5F3FF`, `#DEF2E8`, `#EBE5FA`, `#29A17D`, and `#5B3FD6`: `packages/self/src/components/BaseSelfView.tsx:123-130`, `packages/self/src/components/BaseSelfView.tsx:353-375`.

Web creates a 960px desktop / 720px tablet frame, 3/2/1-column grids, large gaps, glass hub, colored left borders, emoji, and large focused cards: `packages/self/src/components/BaseSelfView.web.tsx:31-37`, `packages/self/src/components/BaseSelfView.web.tsx:154-235`, `packages/self/src/components/BaseSelfView.web.tsx:263-301`.

**Inference.** The native stage is compact but visually dense at the top: three control jobs (global navigation, temporal navigation, temporal mode) precede a strip of many competing destinations. The web stage has more breathing room but turns a personal sanctuary into a catalogue/grid. Both rely on accent colors to classify domains, yet the domain colors themselves carry emotional implication—green journey, violet pulse, red personal, amber physical—without a clear explanation of whether color means mood, urgency, data type, or feature family.

**Severity: high.** For wellbeing, the first spatial read should lower pressure and clarify agency. The current first read is “many things to manage.” This is a redesign issue, not an isolated spacing defect.

### Stage 2: typography, density, and job count

**Evidence.** Feature labels are uppercase and 9px on phone, 11px on tablet; web card labels are 14px with uppercase tracking and generic copy (“Engage with this sanctuary capability”): `packages/self/src/components/BaseSelfView.tsx:199-206`, `packages/self/src/components/BaseSelfView.web.tsx:335-346`. The teacher composition contains at least 17 named capabilities before counting side-bar reflections and reminders: mood, wisdom, pulse, fire, voice, joy, gratitude, energy, wind-down, sleep, daily rhythm, tomorrow prep, reminders, decisions, professional history, plus journey and reflections: `packages/self/src/screens/self/TeacherSelfView.tsx:105-245`.

**Inference.** The screen’s conceptual job count is much higher than the four-ish cohesive chunks supported by the UX reference. The labels also require the person to learn metaphor vocabulary (“Mood Lotus,” “Fire Journal,” “Resonance,” “Sadhana”) before knowing the action. That raises reflection burden and choice cost at the exact moment the experience should be emotionally permissive.

**Severity: high.** Reduce the primary surface to a few jobs, with the rest discoverable behind a clearly named “More ways to reflect” area. This is not a request to delete domain capability; it is a request to change the information architecture.

### Stage 3: container-job fit

**Evidence.** Web uses discrete cards for features and a large card for focused content. Native uses circular feature containers for all capabilities and a single content container. The temporal shell can substitute `historyContent`, or a generic `HistoryScaffold` when none exists: `packages/self/src/components/BaseSelfView.tsx:214-231`, `packages/self/src/components/BaseSelfView.web.tsx:125-149`.

**Inference.** Cards and circular selectors are acceptable for independent tools, but history, reflection, and a person’s longitudinal story are continuity jobs. Treating each as an isolated capability encourages “open another card” behavior instead of helping the person notice a pattern. The generic scaffold explicitly says analytics will surface “as data builds,” which exposes product incompleteness rather than giving a meaningful, bounded reflection state.

**Severity: high.** Redesign history as a continuous personal narrative/timeline with semantic zoom or a small number of meaningful periods. Keep cards for independent actions only.

### Stage 4–5: tappables and placement

**Evidence.** Native feature items are `Pressable`, with long press pinning and a separate pin badge; Now, History, scale chips, TemporalNavigator controls, feature info, and content controls are also tappable: `packages/self/src/components/BaseSelfView.tsx:153-210`, `packages/self/src/components/BaseSelfView.tsx:336-380`. A feature can simultaneously show active state, pin state, history badge, emoji, domain border, and label. The history badge is rendered whenever `historyContent` exists: `packages/self/src/components/BaseSelfView.tsx:149-191`.

**Inference.** This is indicator stacking on small targets. A person must infer that a circular item is a capability, that long press changes pinning, that a pin is a saved preference, and that an hourglass means history is available—even though the global History control already changes the mode. The frequent action “log mood” is not guaranteed to occupy the first or most reachable primary position; it is one item among many, even though teacher view’s default selection heuristics only prefer `daily_pulse` or `mood_checkin`: `packages/self/src/components/BaseSelfView.tsx:112-120`.

**Severity: medium-high.** Preserve ≥44dp touch targets, but remove redundant history badges, make pinning explicit rather than long-press-only, and place the primary check-in/release action in the lower thumb zone. Do not make the person hunt through a horizontal catalogue for the emotionally relevant action.

## Emotional safety and user agency

### Agency and reflection burden

**Evidence.** Mood check-in offers six emoji options, an optional note, and a latest score shown as `/5`: `packages/self/src/components/MoodPickerCard.tsx:123-167`, `packages/self/src/components/MoodPickerCard.tsx:171-225`. Decision Journal asks “What decision is weighing on you today?” and uses “Seal Decision”; Fire Journal says “Release what no longer serves you” and “Burn and Release”: `packages/self/src/components/DecisionJournalSection.tsx:67-104`, `packages/self/src/components/FireJournal.tsx:196-290`. Web’s Voice Sanctuary uses “The void is listening…” and “Speak your truth, let it go,” while its audio controller is explicitly a mock and confirmation returns `mock-uri`: `packages/self/src/components/VoiceJournaling.tsx:32-44`, `packages/self/src/components/VoiceJournaling.tsx:133-220`.

**Inference.** The language is warm but sometimes prescriptive and spiritually loaded. “Burn,” “release,” “seal,” and “the void is listening” imply a desired emotional ritual rather than offering neutral choices. A user in distress may experience a forced catharsis metaphor as pressure to disclose or purge. Voice has a particularly serious agency gap: the visible affordance implies recording and saving, while the implementation is a mock and no clear retention/permission explanation is present.

**Severity: high.** Replace ritual language with optional, plain-language explanations at the action boundary: “Write privately,” “Discard without saving,” “Save reflection,” and “Record a voice note.” Make the emotional metaphor an optional layer, not the only instruction. Do not ship a voice affordance as a real journal until recording, storage, playback, cancellation, permission denial, and deletion are implemented and explained.

### Privacy and safety

**Evidence.** `MoodLog`, `FireJournalEntry`, and `UserPreferences` have user-scoped ZenStack policies, with a platform-admin exception: `packages/schema/schema.zmodel:892-937`. Database migrations also apply user-owned RLS to mood and fire journal tables: `apps/gurudevi-mobile/supabase/migrations/20260211170000_master_baseline.sql:216-232`, `apps/gurudevi-mobile/supabase/migrations/20260211170000_master_baseline.sql:444-445`. The Fire Journal UI promises words are “never shared or stored beyond this moment,” but the repository writes a preview record and queues full content for `burnJournal`: `packages/self/src/components/FireJournal.tsx:279-305`, `packages/self/src/api/wellbeingRepository.ts:178-210`. The Privacy Ledger is a read-own table and screen, but it is not visibly linked from the Self entry surface in the traced chain: `apps/gurudevi-mobile/supabase/migrations/20260306000000_privacy_ledger.sql:6-31`, `packages/self/src/screens/PrivacyLedgerScreen.tsx`.

**Inference.** The RLS posture is a positive foundation, but the Fire Journal copy overclaims privacy unless the server definitively discards full content after processing. The presence of a preview and outbox queue contradicts “never stored beyond this moment” at least at the client/repository boundary. The platform-admin exception may be legitimate operational access, but a safety-oriented UI should disclose the actual boundary rather than imply absolute secrecy. Tier-2 tables and Tier-3 scaffolds from the imported audit further mean that privacy guarantees cannot be inferred uniformly across all Self tools.

**Severity: critical for release of sensitive features.** No cathartic or voice feature should present an absolute privacy promise until the full data path, retention, queue behavior, storage policy, and deletion semantics are verified. Add a just-in-time “where this goes” disclosure and a reachable privacy control/ledger entry point.

### Empty, error, offline, and incomplete states

**Evidence.** Native shows an offline notice stating that saved resonance is shown and new entries wait for connection, and a history notice saying the view is read-only: `packages/self/src/components/BaseSelfView.tsx:255-267`. Feature-level render failures are isolated by `FeatureErrorBoundary`, which says the feature could not be shown while other surfaces remain available: `packages/self/src/components/FeatureErrorBoundary.tsx:22-51`. Mood has an empty state, but several repository reads throw directly on errors; reminders return `null` while loading and errors only reach `console.error`: `packages/self/src/components/MoodPickerCard.tsx:220-225`, `packages/self/src/components/RemindersManager.tsx:84-99`, `packages/self/src/components/RemindersManager.tsx:187-189`, `packages/self/src/api/selfFeatureRepository.ts:35-110`.

**Inference.** The shell’s offline copy is reassuring but too generic for a sensitive write: “will wait” does not tell the person whether the private entry is encrypted locally, queued, retrying, or safe to leave the device. Several feature-level failures are silent or visually absent. The imported audit’s Tier-3 finding is confirmed for the repository shape: reminders, sleep, wind-down, and voice writes target tables not declared in `schema.zmodel`; the code shown here does not consistently guard missing-table errors. This is a domain readiness gap, not just a UI error-state gap.

**Severity: high.** Every sensitive write needs an explicit state machine: not saved, saved locally, queued privately, synced, failed with retry, and discarded. Do not silently render no reminders or a mock voice success.

## Temporal and history comprehension

**Evidence.** The imported operationalization correctly identifies the global Now/History door. Code confirms Native `BaseSelfView` supplies the mode and day/week/month/year scale controls, and feature history falls back to a generic scaffold when absent: `packages/self/src/components/BaseSelfView.tsx:43-44`, `packages/self/src/components/BaseSelfView.tsx:214-219`, `packages/self/src/components/BaseSelfView.tsx:336-380`. Mood history is fetched with a flat 30-row limit and score normalization; `useTemporalStore` controls viewing phase but the repository contains no relative baseline or reinforcement logic in this path: `packages/self/src/api/wellbeingRepository.ts:20-83`, `packages/self/src/hooks/useMoodLogs.ts:24-92`.

**Inference.** “History” currently changes retrieval/presentation mode, but not the meaning of time. A person sees records, not a comprehensible personal rhythm. A single low mood can be displayed with equal visual weight to a repeated pattern, and the `/5` score invites self-judgment without context. This directly conflicts with the wellbeing reference’s stronger principle: compare against the person’s own baseline, gate concerning patterns through repetition, and let the person reinterpret past data.

**Severity: high.** History needs a separate reflection model: personal baseline, repeated-pattern gating, event-to-period aggregation, and detail-on-demand. Never label a single outlier as a concern. Let users annotate or reinterpret an entry without rewriting the original record.

## Domain gaps versus UI gaps

### Domain / product readiness gaps

- Fire Journal’s true retention and deletion guarantee is unresolved because full content enters the burn request/outbox path while the UI promises no storage: `packages/self/src/api/wellbeingRepository.ts:178-210`.
- Voice journaling is a mock controller and returns a mock URI; it is not a real privacy-safe domain capability: `packages/self/src/components/VoiceJournaling.tsx:32-44`, `packages/self/src/components/VoiceJournaling.tsx:122-126`.
- The imported audit’s Tier-2/Tier-3 schema drift is material: `joy_moments`, `gratitude_entries`, `daily_prep_items`, `timetable`, and `wisdom_notes` are absent from `packages/schema/schema.zmodel`, while `sleep_logs`, `student_goals`, `wind_down_rituals`, `voice_journals`, `decision_journals`, and `reminders` are described as absent from migrations. Current repository functions still target several of those tables: `packages/self/src/api/selfFeatureRepository.ts:35-110`, `packages/self/src/api/selfFeatureRepository.ts:263-345`.
- Mood semantics are non-bijective: six mood labels are mapped into a 1–5 score, so “sad” cannot round-trip correctly. This is a domain/data-model issue with a direct emotional interpretation risk: `packages/self/src/api/wellbeingRepository.ts:20-42`.
- No safety escalation, crisis-sensitive copy, or “pause/leave without saving” model is visible in the traced Self composition. This audit does not infer a clinical duty from that absence, but the product should explicitly define what it does when a person records distress.

### UI / interaction gaps

- The primary screen asks the person to navigate a catalogue before presenting one calm, obvious next action.
- Native small labels, stacked indicators, long-press pinning, and a large mixed-domain strip create discoverability and motor/cognitive burden.
- Web’s generic card descriptions do not help a person decide which reflection job fits their current state.
- Offline/error states are shell-level and generic; sensitive writes lack user-visible lifecycle status.
- History mode is globally discoverable but semantically flat; generic scaffolds expose missing capability rather than helping a person reflect.
- Emotional copy sometimes turns optional metaphors into the only action framing.

## Redesign recommendation

This needs a redesign of the Self information architecture, not a polish pass.

Recommended direction:

1. Make the entry surface a calm “today” moment with at most three primary jobs: check in, release privately, and reflect on recent rhythm. Keep role/work context below a boundary or in a separate mode.
2. Treat “More ways to reflect” as a secondary library of capabilities. Use clear verbs and one-line summaries; do not require metaphor knowledge to start.
3. Use one continuous personal timeline for history. Add semantic zoom, personal-baseline comparison, repeated-pattern gating, and detail-on-demand. Preserve original entries while allowing user annotations/reinterpretation.
4. Make privacy a first-class affordance at every sensitive write: retention, sync status, audience, deletion, and whether content is queued. Link the Privacy Ledger from Self and show the actual Fire Journal lifecycle.
5. Separate domain readiness from UI exposure. Hide or mark unready features until their schema, repository error handling, offline semantics, and deletion behavior are complete. A graceful empty state is not a substitute for a missing table.
6. Define responsive variants deliberately: mobile = one primary moment plus bottom-reachable action; tablet = two-column “today / reflection” split; web = spacious two-column sanctuary with history alongside the current moment, not a 3-column feature catalogue. Keep the same jobs and safety language across variants, while changing density and placement.
7. Replace or soften coercive ritual copy. Offer “You can skip this,” “Nothing will be saved,” and “You can delete this later” where true. Use biomimicry warmth as atmosphere, not as a substitute for clear consent.

## Prioritized implementation plan for integration

| Priority | Work | Type | Exit evidence |
|---|---|---|---|
| P0 | Verify Fire Journal and voice retention, queues, storage, deletion, and permissions; remove absolute privacy claims until verified | Domain + safety | Data-flow test and user-visible lifecycle states |
| P0 | Gate schema-scaffolded features and add visible failure states; stop silent `console.error`-only failure paths | Domain + UI | Offline, missing-table, retry, and discard tests |
| P0 | Correct mood vocabulary/score semantics | Domain | Round-trip tests for every mood and accessible labels |
| P1 | Prototype the three-job Self entry experience for native and web | Redesign | Screenshot review on phone, tablet, and desktop |
| P1 | Replace feature strip/grid as the primary IA; move capability catalogue behind progressive disclosure | Redesign | Four-or-fewer primary chunks; reachable primary action |
| P1 | Rebuild history around personal rhythm and repeated-pattern gating | Domain + UI | User can compare periods, inspect detail, and reinterpret entries |
| P2 | Remove redundant history badges and hidden long-press pinning; normalize tokens and emotional copy | UI | Touch/a11y review and token audit |
| P2 | Link Privacy Ledger and explain audience/retention at the moment of entry | Safety UI | User study can answer “who can see this and when is it deleted?” |

## Limits and unresolved checks

- No runtime screenshots or device/emulator session were available; spatial findings are source reconstructions.
- No production Supabase inspection was performed; migration/code evidence does not prove the currently deployed schema or server burn behavior.
- The accordion/progressive-disclosure behavior in every role view was not runtime-confirmed.
- Only the teacher role was deeply composed; student, guardian, principal, founder, and admin views require the same full pass before declaring cross-role parity.
- Accessibility labels, focus order, screen-reader announcements, reduced-motion behavior, touch hit slop, microphone permission handling, and actual tablet layout remain unverified.
- This is an independent wellbeing/self audit, not an integrated implementation plan. Its P0/P1/P2 priorities are intended as inputs to the multi-agent integration pass.
