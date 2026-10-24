---
title: "Verger playbook, phase C: the envelope (verger-p5)"
status: active
created: 2026-10-24
owners: [Naveen]
tags: [verger, playbook, policy, envelope]
---

# Phase C: the envelope (verger-p5)

Read [README.md](README.md) first, then [stage-and-chairs.md](../stage-and-chairs.md) section
"The purpose: adapt both ways, inside the envelope". Pure TypeScript; no device needed.

## What exists (verger-p4, `packages/verger-core/src/reducer.ts`)

- **Limits** as level floors: `staticFloors` (settings, battery saver, network, battery low,
  capabilities, visibility, and the capacity class).
- **Compression** by measured pressure (`lower`), and **return** to where the phone started
  (`raiseOne`, last in first out). Nothing ever goes better than the start.
- **Growth across sessions**: `capacityGrant` (0, 1, 2) relaxes the low and mid class floors on a
  phone that proved itself (`recovery.ts`, `planLaunch`).
- **A learned start**: `initialPressure` from the last session (`prior`).

## What p5 adds

| Atom | Definition | In code today |
|---|---|---|
| Limit | best quality allowed, never crossed | settings, OS, capability and network floors |
| Ceiling | best quality earned: expansion stops here | the capacity-class floor, lowered by the grant |
| Home | where a lever starts and settles | class floor plus the learned prior |
| Floor (doctrine) | worst quality allowed | `maxLevel`; critical work's essential level (registry) |

Remember: in code a higher **level** is **less** quality. The ceiling is a *minimum level*.

## Steps (one commit each, `pnpm verger:check` green each time)

**C1. Make the envelope visible, change nothing.** Split `staticFloors` into `limitFloors`
(everything except the capacity class) and `classFloors` (the class, after the grant). Publish
`envelope: Record<leverId, { limit, ceiling, home, floor }>` on the snapshot (levels). Levels
must be **identical** before and after: prove it with the existing property suite and goldens.
Add the field to `outputsEqual`, and to `checkSnapshot`: `limit >= 0`, `ceiling >= limit`,
`home >= ceiling`, `floor >= home`, published level between `limit` and `floor`.

**C2. Policy p5 beside p4.** A second `VergerPolicy` (`VERGER_POLICY_P5`, version 5) in its own
module. p4 stays the default; a host opts in through `defineHost({ policy })`. A new policy
version restarts every device's ladder (intended).

**C3. In-session expansion.** While every account a lever relieves is `ample` with confidence of
at least `expandConfidence` (config, provisional 0.7) for `expandAfterMs` (config), lower that
lever one step from home toward its ceiling: one lever at a time, ornamental first. At the first
strain on its accounts, withdraw at once (the outcome ledger already judges `withdrawn`). Cut
fast, return slow, probe gently.

**C4. Learn home and ceiling across sessions.** Generalise `capacityGrant` (one integer for the
low class) into per-class steps the recovery record keeps; an OS update (build fingerprint
changes) resets them, as the profile already does.

**C5. Compare before switching.** Replay the same streams through p4 and p5 (`replayVerger`
takes any policy) and report strain and quality given up per policy. p5 becomes the default only
on Naveen's word.

## Invariants to add (property tests, `packages/core/src/verger/verger.invariants.test.ts`)

- The limit is never crossed, by any generated stream, activation or grant.
- **No expansion without evidence:** with every sensor deaf, p5 publishes exactly what p4 does.
- Expansion never happens with `activation.grow` false.
- A withdrawn expansion is never retried within its back-off.
- Determinism and time shift hold for p5 (reuse the existing relations).
- A mutant p5 that ignores the ceiling must be caught (add it to the mutation block).

## Open chairs (ask, do not decide)

- Whether expansion may ever probe above the class ceiling within a session (default: no).
- `expandAfterMs`, `expandConfidence`, the back-off after a failed expansion.
- Whether critical work has an essential level per lever (the doctrine's floor) or only per
  workload.

## Pitfalls

- Do not delete p4 or its tests; p5 is beside it.
- Do not put lever names in the policy; expansion order comes from lever declarations
  (`visualImpact`, `ambient`, workload classes).
- `nextTimedChangeAt` must include every timed expansion, or the controller never wakes for it.
