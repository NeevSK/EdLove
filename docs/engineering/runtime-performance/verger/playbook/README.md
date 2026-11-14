---
title: "Verger playbook: start here (for any agent continuing the work)"
status: active
created: 2026-10-24
updated: 2026-10-25
owners: [Naveen]
tags: [verger, playbook, agents, guardrails]
---

# Verger playbook: start here

Written for any agent, including small or free-tier models, that continues verger after
2026-10-24. Read this page fully before touching code, then only the guide for your phase.
If something here conflicts with your instinct, this page wins; if it conflicts with the code,
**stop and ask Naveen** (the code may have moved on).

## 1. What verger is, in five lines

1. One regulator per app process. It senses the phone or browser, decides how much each part of
   the app may spend, and publishes a **snapshot**. Everything else reads the snapshot.
2. It **compresses** under strain and (from verger-p5) **expands** when resources allow, inside
   an envelope it never leaves ([stage-and-chairs.md](../stage-and-chairs.md)).
3. It watches its own moves (the outcome ledger) and will adapt itself (loop 2); people change
   its rules (loop 3) ([second-order-loop.md](../second-order-loop.md)).
4. It runs on Android natively (`@repo/verger-android`), and in JavaScript on the web
   (`@repo/verger-web`); React reads it without a provider (`@repo/verger-react`).
5. Gurudevi is its first host: levers, workloads, view and launch rule live in
   `packages/core/src/verger` (`@repo/core/verger`).

The map of packages: [everywhere.md](../everywhere.md). The tracker (what is done, what is
next): [pipeline.md](../pipeline.md). Verification doctrine: [verification.md](../verification.md).

## 2. Remaining work, in order of leverage

| Order | Phase | Guide | Needs |
|---|---|---|---|
| 1 | **F. Phones**: first Gradle build, dev client on real phones, measured thresholds, then fit the simulator's phones to recordings (F6) | [F-phones.md](F-phones.md) | Naveen's laptop and phones |
| 2 | **B3. Data budget**: accounting (B3.1) and the limit (B3.2) are built; the allowance is a chair, then B3.3 night window | [B3-data-budget.md](B3-data-budget.md) | Naveen's allowance |
| — | B. Web sensing, Compute Pressure: built 2026-10-25 (R10) | [B-sensing.md](B-sensing.md) | — |
| — | **P. Control layer** (simulator, stability suite, hysteresis, relief check, gains): built 2026-10-25; read before changing any decision rule | [P-control.md](P-control.md) | nothing; pure TypeScript |
| — | C. Envelope (verger-p5), D. Loops 2 and 3, B4 and B7: built; their guides stay as reference | [C-envelope.md](C-envelope.md), [D-loops.md](D-loops.md), [B-sensing.md](B-sensing.md) | — |
| — | Open items and known hazards | [open-items.md](open-items.md) | read before any phase |

Why F first: every result so far is G0 to G3 (types, mocks, jsdom). Nothing has run on a phone,
the Android Kotlin that imports the SDK has never been compiled, and every threshold is
provisional. One afternoon on real phones is worth more than any further design.

## 3. Rules that are never broken

1. **Run `pnpm verger:check` before every commit.** Commit only on `ALL_PASS=1`. Never chain
   `git commit` after a test command without checking its result (this mistake was made once).
2. **Never weaken a test to make it pass.** No deleting assertions, no `.skip`, no loosening a
   number. If a test fails, the code or your understanding is wrong; find out which.
3. **Never delete working behaviour silently** (AGENTS.md Deletion Veto). Removing code needs
   Naveen's sign-off with: what, why, the risk.
4. **No `any`, no `as unknown as`, no unnecessary `as`.** Model the type.
5. **One source per threshold.** Every number lives in `DEFAULT_VERGER_CONFIG`
   (`packages/verger-core/src/config.ts`) or in a lever's declaration; never a literal copy.
6. **Verger-core stays pure.** No React, React Native, Expo, browser or Node APIs in
   `packages/verger-core`. Time is injected (`at`, `now`); never call `Date.now()` in a reducer.
7. **The reducer names no lever.** Rules are declared on levers (`whenMetered`,
   `whenMidCapacity`, `requires`, ...) or workloads; `reducer.ts` never contains `'blur'` and so on
   (a test enforces this).
8. **Do not decide open chairs in code.** The release preset, calibrated thresholds, which levers
   ship governed, the data budget amounts: these are Naveen's ([stage-and-chairs.md](../stage-and-chairs.md),
   "Open chairs"). Make them configuration with a provisional default, and say so.
9. **No paid services.** Stryker locally only (never its dashboard); Maestro CLI only (never
   Maestro Cloud); no new SaaS.
10. **Ground every platform API in the installed `.d.ts` or official docs**, never memory
    (AGENTS.md prime directive). Write in the doc where you checked it.
11. **Commit format:** `HUSKY=0 git commit --no-verify`, push `git push -u origin
    feat/adaptive-runtime --no-verify`; end messages with the attribution lines in the repo's
    recent commits; report evidence by level (G0 to G5) and what it does not prove.
12. **Stay in scope.** Do not fix unrelated failures you meet (record them in
    [open-items.md](open-items.md)); do not refactor outside your phase.

## 4. The workflow for any change

1. Read the phase guide, then the files it names. Run `pnpm verger:check` first: it must pass
   before you start, or you are not starting from green (write down what fails and stop).
2. Write the smallest change that does one thing. Add or extend a test **in the same change**
   (golden mean: tests protect the behaviour you added, not every line).
3. For a policy change, run the deep property run: `VERGER_RUNS=3000 pnpm verger:check`, and
   the closed-loop matrix before and after (`pnpm --filter @repo/verger-core simulate`; see
   [P-control.md](P-control.md)). The stability suite runs in the gate; never loosen its bounds.
4. Update the tracker row in [pipeline.md](../pipeline.md) (state and evidence) in the same commit.
5. Commit, push, and say what is proven and what is not.

## 5. Nuances that trip agents (read all)

**Vocabulary collision: "floor".** In the doctrine's envelope, the *floor* is the worst quality
allowed. In the code, `staticFloors` and "floors" are minimum *levels*, where a higher level is
*less* quality: a level floor is a quality **ceiling**. Lever level 0 is full quality; `maxLevel`
is the cheapest. Read every "floor" twice.

**Unknown is never a limit.** A missing reading (`null`) never lowers quality and never counts as
offline, low battery, or a low-memory phone. Unknown memory classes as `'unknown'` (no floor).

**Metered is home.** Most teachers are always on prepaid mobile data. A metered network limits
nothing by default (`meteredOptionalConcurrency` is a host choice). Data Saver, offline and weak
links are limits; the data budget (B3) is where cost belongs.

**Weak links wait.** Slow (`slowNetworkKbps`) or back from offline under `networkSettleMs` is a
limit for optional data only. Critical work (an attendance save) is never gated.

**`dispatch` versus `signal`.** `Verger.dispatch` is for app events (app state, touches,
preferences, long tasks). `Verger.signal` is for device readings taken in JavaScript (NetInfo,
expo-battery, browser APIs): the floors always hear them; a running verger hears them only if the
platform does not sense that sensor natively (`VergerPlatform.senses`). Never route a device
reading through `dispatch`, or it will overwrite the native one.

**The floors run when verger is off.** Mode off, kill switch, rung 4, a launch error: the
snapshot is the host policy under `FLOORS_ACTIVATION`, fed by JS facts and signals. So
`getSnapshot()` is non-null inside a shell. Components must work with the floors alone.

**No providers.** Hooks (`useVergerSnapshot`, `useLeverLevel`, `useVerger`) read the process's
bound verger. Shells bind it: `VergerRoot` (React Native), `VergerBrowser` (web). Do not add a
Context. On the web, verger is created only in the browser (`typeof window`), never on the server.

**Snapshot identity.** `useSyncExternalStore` needs `getSnapshot` to return the same object until
something changes. Never build a new snapshot object per call.

**A new policy version restarts the recovery ladder** on every device (the ladder key contains
the policy key, `verger-p4`). That is intended; changing the key format needs a migration
(`canonicalLadderKey`).

**Golden fixtures** (`packages/verger-core/src/__fixtures__/*.expected.json`): when you add a
config field, add it **by hand** to both files. Never run `UPDATE_GOLDEN=1`: it rewrites the
inputs and the formatting.

**Property tests are random.** `packages/core/src/verger/verger.invariants.test.ts` draws new
cases each run. A failure is a counterexample: keep the full output (fast-check prints the seed
and the shrunk case), pin it as an example in the test, then fix the code. Never re-run until green.

**Deaf-sensor invariant.** Any new sensor or snapshot field derived from a sensor must stay
neutral when that sensor is off; extend `checkSnapshot` (`invariants.ts`) when you add one.

**Lever joins only when a consumer applies it.** The mobile and web hosts govern exactly the
levers `experienceOf` reads (`EXPERIENCE_LEVER_IDS`) plus verger's built-ins. Adding a lever to
`GURUDEVI_APP_LEVERS` does nothing until a component reads it through the view.

**Pre-existing failures are not yours.** The repo has known failures (ui: 1 test in 2 files;
mobile: 20 tests in 8 files; web: about 30; type errors: core 20 forms adapters, ui 88, mobile 38,
web 1). Compare against a stashed baseline before claiming a regression: `git stash push -u`,
run, `git stash pop`.

**Heat has hysteresis, and lowering does not wait for it.** `snapshot.thermal` is the held level
(it steps down only after `thermalDwellMs` past an exit band); lowering under heat acts on the
raw reading. A test that cools the phone and expects raises at once now needs the dwell.

**The frames loop can stop itself.** After two steps that did not bring frames toward the budget
it says "not relieved by levers" and waits for calm (P8). A test feeding constant stress sees two
steps, not a walk down the ladder; feed frames that answer the levers to test the order.

**The pilot freeze.** The teacher pilot (2026-10-26) runs a build not from this branch. Nothing
from `feat/adaptive-runtime` merges before Naveen says so.

## 6. How to report

```
G1 boundary / Vitest - <suite>: N/N passed.
Proves: <the named contract>.
Does not prove: <real device, real browser, production>.
```
Never write "tests pass" without the level, the count and what it does not prove.
