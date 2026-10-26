---
title: "Verger playbook, phase B3: the data budget"
status: active
created: 2026-10-24
owners: [Naveen]
tags: [verger, playbook, network, prepaid, data]
---

# Phase B3: the data budget

Read [README.md](README.md) first, then [sensing.md](../sensing.md) section "Data cost where
most users are always metered" (the design, already agreed in outline).

## The problem

Most teachers are on prepaid mobile data, so "metered" says nothing useful: verger treats
metered as home. What protects their money is a **budget**: optional data work (prefetch,
warming, background extras) spends from a daily allowance of bytes. Critical work (an
attendance save and its upload) is never gated.

## Steps

**B3.1 Count this app's bytes (Android).** *Built 2026-10-26 (R11):* `DataUsage.kt`, the
`dataUsage` contract cases, `onDataUsage` mapped to `data-usage`, and the ledger folded and
stored by `createVerger` (`dataAllowanceBytes` turns it into the budget). Original brief: `android.net.TrafficStats.getUidRxBytes(uid)` and
`getUidTxBytes(uid)`: bytes since boot, or `TrafficStats.UNSUPPORTED` (-1). Verify the API level
and semantics in the installed SDK's docs before use. Sample on the existing slow poll (do not
add a new timer), emit only when the day's total crosses a bucket (for example every 512 KiB).
Add the event to `contract/native-events.json` with cases, a Kotlin mapping in a pure file
(like `NetworkSignals.kt`), a JVM contract test, and the TypeScript mapping and test
(`packages/verger-android/src/mapping.ts`). Counters reset at reboot: keep the day's baseline in
verger's store, not in memory.

**B3.2 The budget in the reducer.** Config (all provisional chairs): `dailyDataBudgetMeteredBytes`,
`dailyDataBudgetUnmeteredBytes`, an option to treat unmetered as free (default off: a "Wi-Fi"
may be a hotspot). A new network limit value, or a separate snapshot field `dataBudget`
(`'within' | 'spent' | 'unknown'`); unknown is never a limit. Levers declare
`whenDataBudgetSpent` (Gurudevi: prefetch 2). `admitWork` holds deferrable network work when
spent. Extend the deaf-sensor invariant.

**B3.3 Cheaper times.** A night window (configurable hours) where large optional downloads may
run. Dialog prepaid publishes a night rate, but hours and prices change: configuration only,
never hard-coded.

**B3.4 The user's say.** Android's "Treat as metered" already reaches verger through the metered
flag. An app setting ("my data is free", "spend at most N MB a day") is a later chair; leave a
config seam.

**Web.** There is no per-site byte counter in browsers. Resource Timing `transferSize` can
approximate what the page downloaded (verify browser support before use). Treat as a later step.

## Tests

- Contract: Kotlin and TypeScript agree on every case in `native-events.json`.
- Reducer: spent budget stops `whenDataBudgetSpent` levers and deferrable network work; never
  critical work; unknown changes nothing; a new day resets.
- Property: the deaf-sensor relation extended to the byte counter.

## Pitfalls

- Never gate the attendance upload or any `critical` workload.
- Bytes since boot go backwards after a reboot: detect and rebase, never subtract into negatives.
- Do not count other apps' bytes (`getMobileRxBytes` is the whole phone).
