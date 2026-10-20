---
title: "Post-onboarding Android Input Freeze Investigation"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [android, entry, onboarding, growthbook, input, evidence]
---

# Post-onboarding Android Input Freeze Investigation

## Scope and history

Restore functional app entry and touch interaction on the connected Galaxy A52
(`R58T33Y0E3M`, Android 14) using the existing admitted local guest. Preserve local
data, admission rules, flag defaults, targeting, and the native dependency pins.

The September 3 [entry RCA](../architecture/2026-09-03-entry-flow-fishbone-rca.md)
records the same visible blank-surface symptom without proving its cause. The
October 17 [entry execution plan](./2026-10-17-entry-system-pristine-execution-plan.md)
explicitly lacked physical entry proof. A matching symptom alone does not prove
that all earlier failures had the cause identified below.

## Confirmed mechanism

The admitted app mounts `FeatureProvider`; onboarding does not mount this service.
The GrowthBook rollout adapter's renderer called `resolveFlags(context)`, which
called `growthbook.setAttributes(attributes)`. Installed GrowthBook 1.8.0 invokes
its renderer from `setAttributes()`, restarting this chain indefinitely.

Physical observations before repair:

- Admission resolves to `/self`, `decision: app`, with completed local guest admission.
- The native tree retains the recovery screen while the tabs attempt to render.
- The feature store repeatedly changes `flags` and `snapshot`.
- Android `top -H` reports the JavaScript thread at 100% of one CPU core and
  process resident memory around 1.5 GB in the sampled failing run.
- JavaScript inspection requests and in-app taps do not complete, while Expo's
  native Tools control still responds.

Git blame traces the recursive renderer callback to June 22, 2026. This is a
consumer callback error; the investigation has not established a Router or RNGH
version incompatibility as its cause.

## Repair and invariant

Keep context/attribute updates in `resolveFlags`. Extract the existing snapshot
evaluation into `readSnapshot` and call that from the renderer. The renderer must
not write attributes. Clear the renderer on unsubscribe. Existing key mapping,
remote updates, cache fallback, and access-control boundaries remain in place.

## Verification record

G1 boundary / Vitest 5.0.5 with real GrowthBook 1.8.0:
`growthbook.subscription.test.ts` reproduces four attribute writes from one
request before the repair, bounded to avoid hanging the runner. After repair,
it proves one attribute write, payload-driven notification, and unsubscribe.
Together with the existing adapter tests, 4/4 tests pass across two
test files. SDK initialization/network, local storage, and analytics are
substituted. This does not prove native touch handling.

G0 TypeScript: core typecheck remains blocked by existing errors in other
adapters and packages; it reports no error in the changed adapter or new test.

`expo-doctor`: 15/20 checks pass. Reported issues include Metro overrides,
duplicate package installations, legacy unimodules, local EAS CLI, and patch
drift. These findings are follow-up work and are not proof that any one caused
this freeze. No dependency upgrades were made during the repair.

The default `audit:device-evidence` command audits a built-in fixture. Its success
is not physical proof for this journey. Device interaction evidence must be
observed and recorded separately.

After the clean Metro rebuild, the physical Self screen appeared and selecting
Wellbeing changed the visible category contents. A subsequent feature screen
also rendered. This proves those observed interactions, not all app flows.

The Library tab exposed a separate oRPC error: a getter-only `status` prototype
shim conflicts with the installed 1.15.7 constructor's assignment. The obsolete
shim was removed in the working tree, preserving native SDK error status and
serialization. A constructor-assignment regression fails before this removal
and succeeds afterward. G1 boundary / Vitest: 13/13 tests across five files cover
GrowthBook, oRPC errors, PowerSync connection lifecycle and single-account
runtime ownership. Network/storage/native DB behavior is substituted; this
does not prove the oRPC repair on the physical app or release performance.

Further implementation and device launches paused when the operator requested
a complete hardware-oriented startup review. See the draft
[low-end startup architecture audit](../architecture/2026-10-19-low-end-startup-architecture-audit.md).
The preceding bug repairs do not certify 2 GB device suitability.
