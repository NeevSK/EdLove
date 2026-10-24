---
title: "Verger: how it differs from the old governor (the drift record)"
status: active
created: 2026-10-24
updated: 2026-10-24
owners: [Naveen]
tags: [verger, cut-off, verification]
---

# Verger: how it differs from the old governor

Before the old governor (`packages/ui/src/context`: `RealityProvider`, `visualPolicy`,
`experiencePolicy`, `applyVisualSafeMode`; `packages/core/src/efficiency/workAdmission`) was
retired, a drift test used it as a differential oracle (pipeline phase E2). Every input it
distinguished was enumerated: six phone sizes (2, 3, 4, 6, 8 and 12 GB, at the memory they
report), fidelity, battery saver, reduce motion, five network qualities, sound, haptics, quiet
mode and safe mode: 5,760 cases. Each went to both the old governor and verger's static
decision read through Gurudevi's view (`experienceOf`). Every field that differed had to be
named with its cause, and every named cause had to explain something. When it was retired the
test was green with no open difference, and it had caught every planted mutant.

The test lived at `packages/ui/src/context/__tests__/vergerDrift.test.ts` (last version in
commit `6bc9aab`); it was retired with its oracle. This page keeps its findings.

## The differences, all intended

| Cause | When | What changed | Why |
|---|---|---|---|
| 4 GB phones are low | a 4 GB phone | low floors instead of the old medium tier | Decided 2026-10-24: the hardware is the ceiling; 4 GB and below are low end (`lowCapacityBelowBytes`, 5 GiB) |
| 8 GB phones are mid | an 8 GB phone (the A52) | mid floors instead of everything | Decided 2026-10-24: 8 GB is the middle (`midCapacityBelowBytes`, 9 GiB); a phone earns quality back by measurement |
| Low fidelity is honoured | fidelity low | ambient stilled and the rest one step down, also on a high-memory phone; prefetch has one answer | The old governor kept "rich" motion on a high-memory phone set to low, and answered prefetch two ways |
| Reduce motion keeps blur | reduce motion on | blur stays | Blur is not motion; the old governor tied blur to rich animation |
| Battery saver stills ambient | battery saver | ambient motion still, not slowed | An ambient animation is energy spent for nothing asked for |
| Battery saver stops prefetch | battery saver | no prefetch | Prefetch is optional energy work |
| Low phone blur named refined | a low phone, fidelity not high | the level is "refined" (reduced radius), not "essential" | Both allow no full blur; verger lowers blur one step |
| Weak links wait | a 3G-class ("fair") network | no prefetch | Decided 2026-10-24: be resilient; optional data waits on slow links and for a minute after the network returns |
| The image cache is memory, not data | a poor or absent network | the memory image cache is kept | The old governor inferred "data saver" from the network and dropped a memory cache for it |
| Safe mode respects the user | safe mode, haptics off or quiet mode | haptics stay off | The old safe mode turned haptics back on |

A 6 GB phone gets exactly what the old medium tier gave it.

## What did not move, and why

- `@repo/core/efficiency`'s memory tier, visual budget, wallpaper presentation, network
  normalisation and efficiency policy stay: the web app (`apps/gurudevi-web`) uses the first
  three, and the mobile background sync and retention tasks, which run without verger, use the
  last two. They move when `verger-web` exists and when background work has a verger reading.
- The user's settings stay where they were: fidelity (`FidelityProvider`), sound, haptics and
  quiet (`SensoryProvider`), and the emergency safe-mode flag (`isVisualSafeModeEnabled`).
  Verger reads them; it does not own them.
- Online status (the core store's `isOnline`), which `RealityProvider` also published, is
  published by `NetworkStatusSync`.
