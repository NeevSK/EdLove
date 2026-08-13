# Self Tab — UI Operationalization (Pilot)

The first of five planned per-tab docs connecting `15`/`16`/`17`/`18`'s theory to the actual, composed code — not inferred from file listings, but read directly from the screens that render. This establishes the method; equivalent docs for the remaining tabs would follow the same approach.

## Correction to `14-profile-domain-exploration.md`'s growth-metaphor-stacking claim

**That earlier finding was speculative, inferred from the `self` package's file listing, and never verified against a real composed screen.** Now verified: `TeacherSelfView.tsx` (the primary framed persona) does **not** stack Bhumi/Banyan/River/Crystal stages, `AchievementGallery`, `ThuthimalBadge`, or `ProgressTree` together at all — none of them appear in this view. **The earlier concern doesn't hold as originally stated.** What's actually there is different and real: nine distinct components (`PulseDashboard`, `MoodLotus`, `MoodSection`, `JournalSection`, `MoodPickerCard`, `JoyJar`, `DecisionJournalSection`, `WarmMirrorCard`, `ImpactRipplesCard`) — but organized through a genuine, deliberate information architecture, not a flat stack.

## The real structure — sections containing grouped features, not a flat list

```
{ id, title, accentColor, features: [{ id, label, content, historyContent? }] }
```
Named sections ("Journey Overview," "Inner Pulse") each contain a small set of related features, almost certainly rendered as an accordion or tabbed structure with progressive disclosure — not all nine components visible simultaneously. **This correctly respects `16`'s chunk-limit rule (~4 visible at once) through structure, not reduction** — the same outcome the earlier, incorrect "consolidate to one growth metaphor" recommendation was reaching for, already achieved by a different, arguably better mechanism (progressive disclosure rather than deletion). **This is a real, good pattern worth protecting and citing as the reference implementation** when applying `16`'s Calm-tier chunk rule to other tabs — "organize into named sections with progressive disclosure" is the concrete technique, not just "show fewer things."

## Mobile vs. web — a real, concrete difference, following the pattern already established in Profile

**Mobile (`TeacherSelfView.tsx`):** everything appears to live inside the section/accordion structure — full progressive disclosure, nothing rendered flat outside it.

**Web (`TeacherSelfView.web.tsx`):** several "headline" components render flat and immediately visible *before* the same accordion structure appears for the rest — `JourneyHistoryCard`, `ImpactRipplesCard`, `WarmMirrorCard`, `JournalSection`, `MoodSection`, `MoodPickerCard` all appear early, unstructured, then `PulseDashboard`/`MoodLotus`/`JoyJar`/`DecisionJournalSection` still live inside the deeper accordion.

**This is the same "web has room to show more up front" logic already established for Profile (`14`), arrived at independently by whoever built this screen — real, convergent evidence, not a coincidence.** Worth stating as an explicit, reusable rule rather than something each screen re-derives: **on Calm-tier screens specifically, web may promote 2–4 of the most emotionally load-bearing components to always-visible, flat placement, while mobile keeps the full set behind progressive disclosure.** Which components get promoted should follow `18`'s leverage logic — the ones carrying the most emotional/functional weight (mood, impact, presence) are exactly what got promoted here, not an arbitrary subset.

## The method, for scaling to the other four tabs

1. Open the tab's actual router/dispatcher screen first (here, `SelfScreen.tsx`) — check whether it's a role/context dispatcher before assuming a single, flat screen exists at all.
2. Open the real, rendered view for the primary persona (here, `TeacherSelfView.tsx`) and list the actual composed components — not the package's file listing, which includes everything ever built, used or not.
3. Check for existing IA structure (sections, accordions, tabs) before assuming a flat chunk-limit violation exists — the fix may already be present, just not visually obvious from a file listing.
4. Diff `.tsx` against `.web.tsx` directly for the *specific* divergence pattern, rather than assuming convergence work is needed uniformly — some divergence may already be correct, deliberate, and consistent with principles established elsewhere.
5. Correct any earlier, file-listing-based inference honestly once real composition is checked — as this doc does for `14`.

## Full-arc extension — behavioral synthesis and mechanics, tested against this tab

Applying `22`'s full-arc method (protect → creative synthesis → mechanics → technical) to Self specifically, beyond the structural correction above.

**A genuinely new lever the structural correction alone didn't surface: which section opens by default.** Relative-to-self baseline (Pattern 2) can drive this directly — if mood entries have been sparse against this person's own recent rhythm, "Inner Pulse" pre-expands on load; otherwise it stays collapsed. Different mechanism from Workspace's zone-reordering (`22`) — here it's default-open-state, not spatial arrangement. Gated by the same reinforcement discipline already established in `09`: one low entry never auto-expands anything, only a real, repeated pattern does.

**A precise, non-obvious mechanics finding: animated transitions are correct here, where `22` found them wrong for Workspace's smart zone — same underlying research, opposite conclusion.** The change-blindness caution in `22` applies specifically to system-driven, silent changes a person didn't initiate. A section expanding because someone tapped it is a deliberate, user-initiated action — animating that is honest feedback, not concealment. The variable that determines which rule applies is *who initiated the change*, not the UI pattern itself (accordion vs. dashboard) — worth stating as a general principle for any future tab, not just these two.

**The one permitted filigree location (`16`) has a determinable right answer, not an arbitrary choice: the top-level entry point, not a buried sub-feature** — following directly from the aesthetic-usability effect (`18`), since first-impression aesthetic judgment happens in seconds and the one decorative investment should sit where that impression actually forms.

**Technical note carried forward:** default-expand state should be computed fresh at load, never persisted as a stored flag — the same non-persistence principle as Workspace's smart zone (`22`), for the same reason: it's a live read of current pattern, not a saved preference.

## Open Questions / Not Yet Resolved

- Whether the section/accordion structure is genuinely progressive-disclosure (one open at a time) or just visually grouped while still fully expanded — the JSX structure implies the former but wasn't confirmed against the actual rendering component
- The other five persona views (`FounderSelfView`, `AdminSelfView`, `PrincipalSelfView`, `GuardianSelfView`, `StudentSelfView`) — not checked; the growth-metaphor components (Bhumi/Banyan/River/Crystal, `AchievementGallery`, `ThuthimalBadge`, `ProgressTree`) must render *somewhere*, since they exist in the package — possibly in `StudentSelfView` or a dedicated profile/growth screen, not yet located
- This same method has not yet been applied to Workspace, Community, Library, or Profile's own screens — `16`'s tier assignments for those tabs remain theoretical until checked the same way this doc checked Self
