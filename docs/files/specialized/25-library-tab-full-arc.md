---
title: "Library Tab â€” UI Operationalization & Full Arc"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Library Tab — UI Operationalization & Full Arc

Fourth application of the method. Library's real persona structure, checked directly rather than assumed: **reader and contributor share one screen; curator has a genuinely separate one.**

## Real structure

`LibraryScreen.tsx` — **1279 lines, the largest single screen file found across this entire exploration** — handles reading/browsing *and* contribution in one file, gated inline by two `FeatureGuard` checks (`isLibraryManagementEnabled`, action `create`) rather than branching into a distinct flow. `CuratorReviewScreen.tsx` (325 lines) is a real, dedicated, separate screen for moderation.

## What to protect

**The curator having a dedicated screen is the correct architectural choice, not incidental.** Reviewing/moderating submitted content is a genuinely different cognitive task from browsing — focused, evaluative, one-item-at-a-time — and giving it its own space rather than squeezing it into the reader's screen matches the "one primary task per screen" discipline already established as correct elsewhere in this exploration.

## A real concern worth naming directly

**1279 lines in one file combining two genuinely different user intents (browse vs. contribute) is a maintainability and design-quality risk, not just a large-file inconvenience.** This is very likely doing too much in one place — list rendering, map rendering, filters, search, resource cards, and a contribute flow, all co-located. Per `17`/`18`'s leverage theory, this is exactly the kind of monolith that should decompose into composed pieces the way Self decomposed into sections and Workspace into surfaces — not because "small files are good practice" in the abstract, but because a file this size is genuinely harder for anyone (human or agent) to reason about safely, and harder to keep the reader experience protected from contributor-flow changes made independently.

**Concrete recommendation: contribution deserves its own flow, matching curator's already-correct pattern, not a modal bolted onto the reader screen.** Two genuinely different intents (I'm here to find something / I'm here to add something) currently share one screen; only moderation was given the separation it needed.

## Creative synthesis, per persona — grounded in what's actually unique to this tab

**Reader — the spatial/map model (`07-library-media.md`'s knowledge-atlas finding) enables something genuinely novel, not available to any other tab.** Rather than a precise "you are here" map dot, the reader's exploration could work more like actual animal wayfinding — accumulated landmark familiarity rather than GPS precision. Territory a person has genuinely explored reads as clear; unexplored territory stays softly obscured, more like fog-of-war than a fully-rendered map from the start. This is Pattern 2 (relative, not absolute) applied *spatially* rather than temporally — a real extension of a principle already established elsewhere in this exploration, into a dimension only this tab has.

**Reader, second addition — reinforcement (Pattern 5) protects "trending" from a single spike.** A resource shouldn't surface as popular/trending from one or two views — only from genuine, sustained engagement over time, the same discipline already applied to concern-flagging in wellbeing and attendance.

**Contributor — visual consistency is a trust question, not just an aesthetic one.** Per `18`'s corrected leverage finding (ease-of-use and usefulness dominate overall experience, but aesthetics drive fast, first-impression *trust*), a contributed resource that looks visually inconsistent with curated content doesn't just look worse — it can undermine trust in the whole library, not just that one item. The "logical DNA consistency" principle from `15` (consistent stroke weight, consistent card treatment) applies directly here: contributed and curated content should render through the same components, not visually distinguishable ones.

**Curator — a more precise biomimetic parallel than the attendance pattern, worth being exact about the distinction.** The attendance "at-risk" pattern (`10`) is reinforcement from *one entity's* repeated state (a student absent twice). Content moderation has a better-fitting biological analogue: **quorum sensing itself is specifically about multiple independent agents converging on the same signal**, not one agent repeating. A resource flagged by several different readers independently is a materially stronger, more precise signal than the same person reporting it twice — worth modeling curator escalation on *distinct-reporter count*, not raw report count.

**Curator queue ordering — pure chronological (oldest-first) risks backlog anxiety and treats all submissions as equally uncertain.** A queue weighted by real signals (an established contributor's track record earning lighter-touch, faster review; genuine risk signals from the multi-reporter pattern above surfacing urgently) is both more humane for the curator and more protective of readers — though this needs real care to avoid unfair bias against new, first-time contributors, who need a fair first review, not automatic deprioritization.

## Technical guidance

**Decompose `LibraryScreen.tsx` into the browse experience and a separate contribute flow**, mirroring Self's section pattern or Workspace's surface pattern — whichever composition style fits better is a real design decision, not resolved here, but the decomposition itself is the clear, actionable first step regardless of which shape it takes.

**Keystone check:** resource cards almost certainly render in both the reader's browse view and the curator's review screen — confirming (or creating) one shared resource-card component is the actual highest-leverage single fix here, same logic as every other keystone-component recommendation in this exploration.

**Fog-of-war map rendering** is a real, buildable idea, not just evocative language — a straightforward opacity/desaturation treatment keyed to a person's own visit history per map region, no procedural generation or shader work required, consistent with the crafted-asset-over-procedural-noise principle already established in `15`.

## Open Questions / Not Yet Resolved

- Whether resource cards are already shared between `LibraryScreen` and `CuratorReviewScreen`, or independently implemented — not verified
- The actual contribute-flow UI (modal vs. inline form) within the current 1279-line file — not traced in detail
- Real per-region visit-history data availability for the fog-of-war idea — the spatial fields (`map_x`/`map_y`/`island_id`) are confirmed to exist, but whether visit/view history is tracked per-region specifically wasn't checked
- Whether `map.tsx`'s route (the dedicated map view) shares logic with `LibraryScreen.tsx`'s main view or is a fully separate implementation
