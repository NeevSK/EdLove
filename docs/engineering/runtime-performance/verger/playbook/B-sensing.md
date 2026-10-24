---
title: "Verger playbook, phase B: the remaining sensing (storage, input delay, web pressure)"
status: active
created: 2026-10-24
owners: [Naveen]
tags: [verger, playbook, sensing]
---

# Phase B: the remaining sensing

Read [README.md](README.md) first, then [sensing.md](../sensing.md) ("What complete means for
each signal"). Each signal lands with: its event in the reducer's vocabulary, its sensor flag
(`SensorId` in `activation.ts`, `SENSORS`, `parseActivationPatch`), its estimator account, the
deaf-sensor invariant extended (`invariants.ts`), contract fixtures if native, and a test.

## B4. Storage

Android: `StatFs(filesDir).availableBytes` once a minute (verify in the installed SDK). Event
`storage` with free bytes; account `storage` (today always unknown); lever field
`whenStorageLow` with a config threshold. The retention scheduler keeps its own VACUUM space
check (it needs room to rebuild the database); it may read verger's reading later.
Mobile JS fallback: expo-file-system `getFreeDiskStorageAsync` as a `signal`.

## B7. Input delay

React Native's `PerformanceObserver` with `event` entries: verify the entry type exists in the
installed React Native (open `node_modules/react-native` sources, do not assume). Web: Event
Timing API (`event` entries; check support). Feed as `dispatch` (it is an app event, like long
tasks), event type `input-delay` with duration; contention reads it.

## Web: Compute Pressure

`PressureObserver` (Chromium 125+, secure contexts) reports CPU pressure states (nominal, fair,
serious, critical) that blend utilisation and thermal state. It is not the platform thermal
status: give it its own event and sensor id, and let the estimator weigh it with low
confidence. Feature-detect; most browsers lack it.

## Web: device class without memory

Firefox and Safari hide `deviceMemory`, so the class is `unknown` (no floor). The old hook used
"4 cores or fewer means low". Whether to bring a cores heuristic back is a chair: ask Naveen.

## Pitfalls

- Adding a `SensorId` touches activation presets, the patch parser, the property generators in
  `verger.invariants.test.ts` (add the event to `eventArb`) and `sensorOf`. Miss one and the
  deaf-sensor relation silently stops covering it.
- Every new snapshot field goes into `outputsEqual`, or React will not re-render on it.
