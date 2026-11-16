---
title: "Radar shared feedback clarification"
status: "active"
created: 2026-11-16
updated: 2026-11-16
author: "Codex"
tags: [radar, owner-intent, feedback]
---

The owner asked to inspect and reuse shared empty/loading treatments, soulful Tutii,
and world-shaped feedback instead of relying on plain text. This expands the shared
presentation work; it does not select a measure, disclosure policy, or business API.

Existing owned `WorldLoading` supplies the world's waiting sign. Owned `EmptyState`
and `ErrorState` supplied the perch without Tutii. The older `FireflyMascot` and
`FireflyFeedbackScene` contain the static fallback drawing. The artwork manifest
still says `awaiting-vector-master-approval`; the new owned ports reuse that
fallback geometry without claiming approved artwork or importing frozen legacy UI.

The radar uses shared loading, empty and error components. Other callers of shared
empty/error states gain the same decorative fallback; their messages and actions
remain intact. Access denial remains distinct in wording and has no invented access
or retry action. The presentation prototype uses synthetic examples only.
