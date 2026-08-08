# Workspace Canvas — Redesign Synthesis

Full synthesis of a multi-round design conversation following `21-workspace-tab-ui-operationalization.md`'s discovery of the canvas/surface paradigm. Structured top-down: what to protect, what to change, then how to actually build it.

## Correction, running the `ui-screen-audit` skill against the real canvas component directly

Applying the skill's Stage 1/4 properly — actually opening `ClassroomWorkspaceCanvas.tsx` and its shared primitives, rather than reasoning from the surrounding hooks alone — surfaced two real, previously-unverified findings.

**The zone-move interaction is a repeated-tap cycle, not a picker or drag: "Move to {nextZone}" cycles through every zone in sequence, one tap at a time, with no preview of the destination until you land on it.** Concretely awkward if there are more than two or three zones — moving from zone 1 to zone 4 costs three taps of a label that changes each time.

**Pin/Unpin and the zone-cycle button render with identical styling** (same pill shape, same color, same weight) despite being fundamentally different action types — a binary toggle and a rotating multi-step action look visually indistinguishable, which risks implying equivalent importance where none exists.

**A more significant correction to this doc's own recommendation: real surface rearrangement already uses genuine freeform 2D drag, not zone-based or list-reorder.** `DraggableCanvasSurface.tsx` implements `Gesture.Pan()` with full `{x, y}` translation, explicitly commented "fluid rearrangement," built on Reanimated 4 + `react-native-gesture-handler` — confirmed wired into all three renderers (Mobile, Tablet, Web) via `CanvasZoneColumn.tsx`. **This is exactly the pattern originally recommended against below**, on real grounds (Hick's Law, accessibility, engineering risk) — but those grounds were reasoned abstractly, without having verified what actually exists. The tap-to-cycle button found above is very plausibly the accessible fallback for this drag gesture, not a separate, lesser mechanism — meaning the system may already have both an expressive primary interaction *and* a non-drag alternative, closer to sound than the original assumption gave credit for.

**Honest, unresolved tension, not smoothed over:** the original reasoning against freeform drag was real (collision detection is the genuinely hard, bug-prone part of this pattern) — but whether that risk has actually materialized here wasn't checked in this pass; only the gesture *setup* was confirmed, not how dropped-position collisions actually resolve. This needs direct verification before either "simplify to list-reorder" or "the existing freeform system is fine" can be stated with confidence — right now, neither conclusion is earned.

## Resolution — the real, elegant solution, not a patch, and it genuinely differs by platform

**The core insight: mobile and web/tablet don't need different solutions by preference — they need different solutions because their actual spatial geometry is different, and the right interaction should follow the real layout, not be forced uniform.**

### Mobile — one continuous vertical drag, not two mechanisms

On mobile, zones render as full-width sections stacked vertically — there is no "horizontal" for a 2D gesture to mean anything in. Given that, the elegant fix isn't constraining the gesture to match a broken drop handler — it's recognizing that **"reorder within a zone" and "move to a different zone" were never actually separate problems on this axis; they're the same continuous vertical drag, crossing different boundaries.** If a card is dragged far enough up to leave its own zone's Y-range and enter the zone above it, it should simply land there — no separate tap-cycle button required as the primary path.

**What this needs, structurally, not just a one-line fix:** the boundary-awareness currently trapped inside each `CanvasZoneColumn` (which only knows about its own cards) needs to move up to the parent mobile canvas renderer, which measures every zone section's absolute Y-range via `onLayout` and owns the single source of truth for "which zone is the current drag position inside." `onDragEnd` then does one unified computation — which zone contains the drop Y-position, and what index within that zone's existing cards — rather than the current logic, which only ever considers reordering within the zone a card started in.

### Web/Tablet — the existing 2D gesture is already correct; finish it, don't remove it

Zone columns sit side by side here — this is exactly the context where the already-built full `{x, y}` Pan gesture earns its real complexity, rather than being over-engineered. **The actual fix is to finally read `translation.x` for what it's clearly meant for:** crossing from one column's X-range into an adjacent column's X-range changes the target zone, live, during the drag — while vertical position within whichever column is currently "active" continues to determine reorder index, exactly as it does today. This needs the same structural change as mobile — column boundaries lifted to the parent web/tablet renderer, measured via `onLayout`, checked on every drag-frame update, not just at drop.

**A genuine UX improvement this unlocks, not just a bug fix:** live visual feedback of the target zone while dragging — highlighting or subtly emphasizing whichever column the drag currently sits over, so the person sees where a card will land *before* releasing it, rather than the current tap-cycle experience of no preview at all until you commit.

### What happens to the tap-cycle button, on both platforms

**It stays — repositioned as the accessibility fallback, not the primary mechanism.** Anyone using a screen reader, switch control, or any non-drag input method still needs an explicit way to move a surface between zones; the button is the right tool for that, exactly the same "list-reorder needs a non-drag alternative" principle already established earlier in this doc. What changes is its role — from "the only way to cross zones" to "the accessible path for people who can't perform the drag gesture at all."



The canvas/surface paradigm — a screen the *person*, not the designer, arranges — is the only screen in this app built this way, and it's a direct expression of "polycentric, not hierarchical" (a stated core design commitment, per `/areas/gurudevi.md`). A redesign that replaced this with a fixed, centrally-designed dashboard would be regressive even if visually cleaner on day one. **The problem isn't the concept — it's that self-configuration currently has no guardrails and no behavioral intelligence, so it can degrade into an overwhelming, static mess over time.**

## The interaction model — zone/list-reorder, not freeform 2D

Real spectrum, from most to least engineering risk and decision cost: freeform 2D drag-and-drop (continuous position, collision detection — genuinely hard to build well, poor accessibility) → zone-based (a small number of discrete drop targets — what the current `setSurfaceZone` implementation already does) → single-axis list-reorder (simplest, most solved) → toggle-visibility-only with algorithmic ordering (simplest of all).

**Hick's Law applies directly here** (per `03-ux-interaction-design.md`): more positional freedom is decision cost, not free flexibility, and this is a Dense-tier functional screen, not a place for delight-through-freedom. **Recommendation: single-axis list-reorder within a constrained zone structure, not freeform.** This is also the more accessible choice by direct consequence — list-reorder has a well-established non-drag alternative (explicit "move up"/"move down" actions), which freeform positioning does not.

## The core structural recommendation — three zones, not one configurable pool

Mixing algorithmic reordering and manual arrangement in the same pool creates a real, direct usability violation: a person arranges something, it quietly moves again on its own, and the canvas stops feeling predictable. **Resolve this by never letting intelligence and manual control touch the same surfaces:**

1. **Fixed/structural zone** — always present, never hideable, never reorderable, no configuration UI shown at all. `classroom-registry`, `primary-actions` — things that are simply always relevant regardless of the day. This also **shrinks the amount of code needing drag/persistence engineering rigor** by removing surfaces that never needed flexibility in the first place — a direct instance of the restraint principle applied to scope, not just visuals.
2. **User-arranged zone** — the person drag-reorders this list; it stays exactly where placed, forever, until they move it again. The system never touches ordering here algorithmically. This is where trust lives, and it must stay inviolable.
3. **Smart/contextual zone, explicitly labeled** (e.g., "Today") — content and prominence here are behavior-driven, and the label itself sets the expectation that it changes, so movement is never surprising. This is where the biomimicry-derived behavioral policy applies:
   - **Relative relevance (Pattern 2):** a surface's prominence reflects deviation from *this teacher's* own normal rhythm — attendance not yet taken today makes that surface more prominent today, without ever needing to have been pinned.
   - **Decay on disuse (Pattern 3):** content unused for a long stretch quietly softens rather than persisting at full prominence — atrophy, not deletion, and never applied to the fixed or user-arranged zones.
   - **Reinforcement before promotion (Pattern 5):** something navigated to repeatedly *without* being manually arranged earns a suggestion to promote it — only after real, repeated demand, never offered speculatively on day one.
   - **Resolve at natural boundaries, not mid-session (Pattern 8):** the smart zone's arrangement should settle on app-open or day-start, never reshuffle while someone is actively using the screen.

## Layout mechanics

**Mobile:** a vertical stack of the three zones in fixed order (structural → user-arranged → smart, or reasoned reverse — this is a real product decision, not resolved here) — forced by width, and consistent with everything already established about single-column mobile ergonomics elsewhere in this exploration.

**Web:** a two-column split (main flow + a narrower side rail) is reasonable given confirmed screen-space affordance differences (the same "web shows more, given more room" pattern already found independently in Profile and Self) — likely structural zone in the main column, user-arranged and smart content distributed between main flow and rail based on real usage testing, not guessed upfront.

## Interaction mechanics for the user-arranged zone

Long-press to pick up, drag along the single vertical axis only, haptic feedback on pickup and on drop (already an established pattern elsewhere in this app). This mirrors iOS's well-worn home-screen-reorder interaction — low-risk, immediately familiar, no novel interaction language to teach.

## Two edge cases that would otherwise quietly undermine the smart zone

**Cold start:** no usage history exists on day one for Pattern 5's reinforcement logic to work from — the smart zone needs a sensible, static default ordering as an explicit fallback, not an empty state waiting for data that will never retroactively appear. Same caution as the coral-banding principle from `00-biomimicry-principles.md` — don't assume a pattern readable from history that isn't there yet.

**Instant transitions, not animated ones, when smart-zone content changes.** Directly grounded in the change-blindness research from the original UI biomimicry exploration (`02-ui-visual-design.md`): gradual, animated changes were measured to be missed *more often* than instant ones (64% vs. 42%). If "Today" genuinely changed since last opened, showing that plainly at the natural reopen boundary is both more honest and more perceptible than smoothing the transition in.

## The keystone fix

Every surface almost certainly renders through one shared wrapper component. That wrapper — not any individual surface — is the actual highest-leverage single fix available (`18-leverage-applied-to-ui.md`'s keystone-component principle): get its spacing, its zone-appropriate affordance (no controls for fixed, drag-handle for user-arranged, none for smart), and its relevance-indicator treatment right once, and every current and future surface inherits it automatically.

---

## Technical guidance

**Data model — three zones need distinct treatment, not one flat array differentiated only by a `zone` field.** The existing `useClassroomWorkspaceLayout`'s `setSurfaceHidden`/`setSurfacePinned`/`setSurfaceZone` API currently implies uniform controls across all surfaces — this needs restructuring so the *available actions* differ by zone type: fixed surfaces expose none of these; user-arranged surfaces expose reorder (and possibly hide); smart surfaces expose none, since the system owns their state entirely.

**Persistence split, directly consequential:** the user-arranged zone's order must persist per-user (already what the current layout hook does). **The smart zone's computed order must never persist as a stored position** — it should be recomputed fresh at each natural resolution boundary (app open / day start) from live signals (today's attendance status, recent navigation frequency), consistent with Pattern 8 above. Persisting a "smart" position would silently turn it into a second, confusing manually-arranged zone.

**Reorder interaction — build on what's already in the stack, don't add a new package.** Reanimated v4 + `react-native-gesture-handler` (both confirmed in the current stack) directly support single-axis list-reorder via a `Pan` gesture combined with Reanimated's shared values and layout animations for the reordering-in-progress visual feedback — this is a well-documented, low-risk pattern with these exact tools (the kind of interaction Shopify's and other teams' open-source reorderable-list implementations demonstrate), meaningfully simpler to get right than 2D freeform collision detection would have required. No new dependency needed.

**Instant transition, technically:** when the smart zone's content changes, avoid wrapping the change in Reanimated's `FadeIn`/`Layout` transition APIs — a plain, synchronous re-render is the correct implementation of the "instant over animated" finding above, not an oversight to fix later.

**Cold-start default:** a static, hardcoded ordering config (e.g., `pulse` → `temporal-context` → `classroom-registry`-adjacent smart content) shipped as the literal fallback when no usage history exists — not a loading state, not an empty state, a real, considered default a person would find reasonable on day one.

## Open Questions / Not Yet Resolved

- Implementation only, not design: measuring and maintaining live zone-boundary rectangles via `onLayout` for both the mobile (Y-range per section) and web/tablet (X-range per column) cases — the approach is specified above, not yet built
- Exact visual treatment for the live target-zone preview during drag (highlight color, timing) — a real design decision, not resolved here
- Whether `cardHeight`'s current hardcoded approximation (180) should become a measured value per-card now that boundary-tracking is being built properly anyway, rather than staying an estimate
- Whether the tap-cycle button's visual styling should be revised now that its role is clarified as accessibility-specific rather than general-purpose, per the earlier Pin/zone-cycle visual-identical-styling finding


- Which surfaces belong in fixed vs. user-arranged vs. smart specifically — this doc establishes the three-zone architecture and the assignment principle, not a final mapping of every existing surface
- Mobile zone ordering (structural-first vs. smart-first) — a real product decision, not resolved here
- Web's specific main-column/side-rail assignment — needs real usage data, not a guess
- Whether the existing `useClassroomWorkspaceLayout` implementation is close enough to this three-zone model to refactor incrementally, or needs a fuller rewrite — not assessed against the actual current code in this pass
