---
title: "Verger playbook, phase D: loops 2 and 3 (seeing, judging, adapting itself)"
status: active
created: 2026-10-24
owners: [Naveen]
tags: [verger, playbook, telemetry, dev-lab, second-order]
---

# Phase D: loops 2 and 3

Read [README.md](README.md) first, then [second-order-loop.md](../second-order-loop.md). Built so
far: the outcome ledger (`outcomes.ts`, read with `Verger.outcomes()`), the flight recorder, the
session ledger, telemetry events (no sink connected), `replayVerger`.

## D1. Session recording (do first: everything else reads it)

Record every event verger receives and every snapshot it publishes into a bounded ring buffer
(the flight recorder pattern), exportable as JSON in development builds. `replayVerger(options,
events, policy)` must reproduce the recorded snapshots exactly: that is the test. Device-only:
no personal data, no upload unless a sink is configured by the host.

## D2. The dev lab (Naveen wants every layer visible and tunable in development)

A development-only screen on mobile (and a page on web) that shows: the snapshot, the envelope
(after C1), the accounts (`estimateAccounts`), the outcome ledger summary, the activation in
force; and controls for `Verger.configure(patch)` and `Verger.tune(patch)`. Read verger with
`useVerger()`; never add a provider. The "local" activation layer (a patch the lab saves) is not
in `resolveVergerLaunch` yet: add a `localPatch` input between the build preset and the remote
patch, stored in verger's store. Never ship the lab in a release build.

## D3. Self-cost meter (B5)

What verger itself costs: reducer time per event (`performance.now()` around `reduce`, in the
controller, not the pure reducer), events per minute, wakeups (scheduler calls), and natively its
own threads' CPU (the procfs sampler already reads per-thread time). Publish as a snapshot or
session field; the self-budget rule (D4) reads it. Measure on a phone before setting a budget.

## D4. Self-adapting rules (loop 2)

Rules are data, versioned with the policy, each with a test and a reason string:
- a lever that does not relieve its account (`notRelieved` over N judged moves) is not used for
  that account for the rest of the session;
- flapping (compress and return repeatedly) lengthens the return wait;
- a failed expansion (after C3) backs off;
- verger over its own cost budget lowers its own sensing cadence, and in the end switches itself
  to the floors, which is the doctrine's "reduce itself".
Every rule must be visible in the outcome ledger and in the snapshot's reasons.

## D5. Loop 3: compare (people decide)

A script (not a test) that replays recordings through p4, p5 and the floors only (verger off),
and reports strain, quality given up and agility per policy. Its output is what Naveen decides
the release preset and default policy from.

## Telemetry

Event names are `verger_*` (`telemetry.ts`). No sink is connected; connecting one is Naveen's
call (no new paid service). Never send device fingerprints or personal data.

## Pitfalls

- Recording must not change behaviour or timing; bounded memory always.
- Self-rules must never cross a limit or gate critical work.
- `configure` and `tune` validate input; the lab must show the error, not swallow it.
