# UX — Interaction & Behavioral Design Reference

The person's cognitive/behavioral relationship to the system over time: what they're trying to accomplish, what mental model forms, what decisions the flow enables. Distinct from UI (visual material — see `02-ui-visual-design.md`). Test: a UX decision is answerable without a single pixel.

## Reflection Theory (Personal Informatics field)

The actual academic field studying "people reviewing their own logged data over time." Core model: collection → integration → **reflection** → action.

- Two distinct reflection modes exist, and most apps only build one: **interactive/exploratory** (person actively digs in, asks their own questions) vs. **dashboard/glance** (system surfaces a summary, passively received). Most shipped apps stop at glance.
- Good reflection UX doesn't just show history — it lets the person *reinterpret* their own past data (re-tag, re-contextualize), not treat it as fixed. (See Activity River research: forward-shifting, backward-shifting, activity-replacement as reflection patterns.)
- **Design target, stated precisely:** don't design for "user checks their stats" (answers questions they already had). Design for "user notices something they didn't already know" (generates a new question). These require different flows.
- Worth reading directly before designing reflection screens: Bentley et al., "Four Data Visualization Heuristics to Facilitate Reflection in Personal Informatics."

## Semantic Zoom & Timeline Navigation

- **Semantic zoom** (real HCI term, Ben Shneiderman) — zoom changes *what's displayed*, not just its size: zoomed-out shows aggregate/titles, zoomed-in reveals full detail, without switching to a different widget.
- **Scroll and zoom are separate, independently-controllable axes** — scroll moves *which* period is in view, zoom controls *how much detail* for that period. Build them separable from the start; retrofitting later is painful.
- **Detail-on-demand / progressive disclosure** — cluster overlapping events at low zoom into expandable summary chips, rather than rendering everything flat.
- No RN/Expo package implements this ready-made — compose from Reanimated (zoom/scale transitions) + FlashList or similar (clustered rendering) + react-native-gesture-handler (pinch+pan split). Genuinely bespoke work.

## Cognitive Constraints — Real, Numbered Limits

- **Working memory:** ~4 (±1) chunks when chunking is disallowed (Cowan), not the popular "7±2" (Miller's own number was a rough estimate/rhetorical device, not a hard limit). A "chunk" = strong internal association + weak external association — a *visual* group (via Gestalt proximity/connectedness) isn't automatically a *cognitive* chunk unless it has real conceptual cohesion.
- Converges with **subitizing** (see UI doc): instant perception caps around 3–4 items too. Two independently-measured limits landing on the same number is a stronger evidentiary signal than either alone.
- Design implication: don't target "show max 7 items." Target ~4 genuinely-cohesive chunks, where each chunk is something the person's own familiarity has already bound together (their wellbeing trend as one chunk, not four separate numbers).

**Cognitive Load Theory — three types, only one is yours to reduce:**
- **Intrinsic** — innate task difficulty, not reducible by presentation, only matchable to the person's experience level
- **Extraneous** — comes from poor presentation/environment; this is the one a designer actually controls
- **Germane** — the *useful* effortful work of connecting new info to what's known — don't eliminate this, it's the good kind
- **Split-attention effect** (directly, literally applicable): physically integrating related information (rather than separating it across cards/tabs/screens) produces measurably better outcomes — the viewer otherwise pays a real cognitive tax holding one piece in memory while mentally rejoining it to another. Directly relevant to the multi-domain (wellbeing/notes/admin) same-day view problem.
- **Inverted-U warning:** performance degrades at *both* extremes — over-simplifying past the point of useful engagement can genuinely underload and hurt outcomes, not just feel boring.

## Change Blindness

- Real evolutionary basis: visual system optimized for a world where change = motion; strip the motion cue (instant cut, blink, glance-away) and detection has nothing to latch onto.
- **Counterintuitive, numeric finding:** gradual changes are missed *far* more than instant ones (64% missed vs. 42% missed in controlled comparison; instant+undisrupted changes detected 97% of the time). A smoothly-animating stat may be *hiding* the update from awareness, not gently introducing it.
- Competing simultaneous changes cancel each other's visibility — one change "wins" the eye and blocks detection of the other. Make one change at a time, or group simultaneous changes in the same screen region.
- **Ethical flag specific to this app's purpose:** change blindness can be deliberately exploited to hide updates from users. Don't let "gentle UI" become a mechanism for softening a concerning change so it doesn't alarm someone — that undermines the honest self-awareness a reflection tool is supposed to support.

## Decision-Making Under Choice Load

**Hick's Law** — decision time grows *logarithmically* with number of choices (grounded in Shannon information theory, not just a UX truism).
- Real, important caveat: breaks down with highly *familiar*/practiced choices and very large sets. The slowdown-per-option shrinks measurably with practice (memory-retrieval-interference model, not pure bit-processing).
- **Sharper design instruction than "keep menus short":** keep *frequent, everyday* choices (which day, which view, quick-log actions) small and *stable* — familiarity erodes the law's cost. Rare/occasional screens (admin config) can tolerate more raw option count.

## Motor / Touch Interaction

**Fitts's Law** — `MT = a + b·log2(2D/W)`. Bigger + closer targets are faster; relationship is logarithmic (doubling distance doesn't double time). FFitts (touch-specific refinement) accounts for finger-occlusion error that the classical formula misses. Practical numbers: finger pad ~10-14mm meeting ~7mm (44pt) targets; keep ≥8dp spacing between targets. Treat as a floor/constraint, not a full interaction spec — real thumb-reach testing across hand sizes matters more than computing an index-of-difficulty number.

**Thumb-zone ergonomics** — thumb moves in an arc anchored at the wrist, not freely. Green zone (bottom-center, easy), yellow (mid-screen sides, stretch), red (top corners, grip-change required). ~49% one-handed use, ~75% of interactions thumb-driven — this is majority behavior, not an edge case. Hand size genuinely changes the zone (large-thumb users cover >50% of screen naturally; small/medium cover ~30%) — don't calibrate only on your own hand. Swipe gestures naturally start near the lower screen edge.

**On "solving" reachability system-wide — tested and rejected (see below).** Whole-screen shrink/shift (Apple Reachability, Samsung/Android one-handed mode) has a structural flaw: the thumb's reachable zone is a fixed physical size, so required shrinking/shifting *increases* as screens get bigger — the fix worsens exactly as the problem it solves worsens. Documented as breaking third-party app compositionality and inconsistent OEM implementation. Alternative approaches (cursor-projection, back-of-device sensors) exist but score worse in user preference testing than simple *control relocation*. **Conclusion adopted for Gurudevi: don't attempt a system-level reachability mode. Design-time discipline instead — put frequent actions (day-switching, quick-log, primary nav) in the bottom green zone from the start; accept that rare actions (deep settings, admin config) may cost a second hand or deliberate reach.**

## Design Principle Index (cross-reference to `00-biomimicry-principles.md`)

| UX decision | Biomimicry pattern | 
|---|---|
| Reflection lets user re-interpret past entries | Pattern 1 (structure is memory) |
| "Concerning pattern" = deviation from own baseline | Pattern 2 (relative not absolute) |
| Notification/flag urgency decays over time, tunable per type | Pattern 3 (decay as tuned knob) |
| Logging *frequency* itself is a signal | Pattern 4 (rate/rhythm carries meaning) |
| Flag only after repeated occurrence within a window | Pattern 5 (reinforcement-within-window) |
| Don't let one domain's rollup auto-update from another's write | Pattern 7 (local containment) |
| Weekly/monthly summary appears complete when ready, not progressively | Pattern 8 (collective resolution) |
