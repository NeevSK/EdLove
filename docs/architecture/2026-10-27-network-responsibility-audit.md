---
title: "Network responsibility audit and containment plan"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Codex
tags: [network, architecture, verger, audit]
---

# Network responsibility audit

Implementation follow-up: [shared observation and World/Verger integration](../current_progress/2026-10-27-network-world-verger-followup.md). The findings below describe the initial audit; the follow-up records the implementation and remaining limits.

The platform already has a shared connectivity model. The main drift is in browser consumers that independently interpret connection hints and service probes. Consolidate observation and terminology before moving transport, cache, and sync code.

## Current ownership

| Responsibility | Existing owner | Contract to preserve |
| --- | --- | --- |
| Device connectivity snapshot | `packages/core/src/logic/managers/NetworkManager.ts`, `logic/interfaces/network.port.ts` | Stable subscription snapshot; `unknown`, `online`, `offline`; source and metering metadata |
| Platform observation | `adapters/native/NativeNetworkAdapter.ts`, `adapters/WebNetworkAdapter.ts` | Native reachability uncertainty stays unknown; browser navigator state is a hint |
| Shared consumers | `offline/useOfflineStatus.ts`, `adapters/NetworkBusAdapter.ts` | Hooks and bus derive transitions from the same manager |
| Query scheduling | `apps/gurudevi-mobile/src/lib/queryClient.ts` | Unknown permits scheduling; this is deliberately different from `NetworkManager.isConnected()` requiring confirmed online |
| Native adaptive signals | `apps/gurudevi-mobile/src/runtime/deviceSignals.ts` | Live Verger signals subscribe to the manager; background one-shot sampling has a separate lifetime |
| Browser adaptive signals | `packages/verger-web/src/signals.ts`, `VergerBrowser.tsx` | Standalone package directly observes browser events; no current host network-injection prop |
| Authenticated requests | `api/clientRuntime.ts`, `api/orpcClient.ts` | Account/session binding, retries, batching exclusions, and request identity |
| Transport security | `api/transportSecurity.ts` | HTTPS/TLS guards; separate from connectivity |
| Offline data | `offline/resilience.ts` and domain sync/outbox owners | Stale cache, replay, and idempotency remain domain responsibilities |
| Browser status display | `apps/gurudevi-web/app/(sanctuary)/components/SyncStatusPill.tsx` | Owns navigator estimates and a timed page probe; currently labels probe failure offline |

## Concrete overlaps and risks

1. **Page reachability is presented as connection status.** The status pill uses a credential-free `HEAD` with `mode: no-cors` to the public sanctuary URL. A fulfilled opaque response does not expose HTTP health or authenticate the account. A failed probe can reflect a service outage or timeout while the device remains connected. It does not establish sync progress.
2. **Browser network observation has several owners.** WebNetworkAdapter, standalone Verger browser signals, and the status pill each observe browser hints. This can produce different initial states, recovery timing, and labels. Separate generic-package portability from host-level observation ownership.
3. **Bootstrap is partly hidden in a hook.** `useOfflineStatus` installs the browser adapter when the source is `none` and starts the network bus while subscribing. Native bootstrap also owns setup. Preserve lazy initialization until an explicit web host bootstrap covers every entry path and SSR.
4. **Unknown has purpose-specific treatment.** Query scheduling permits it; strict network permission does not. Replacing all checks with one boolean would change behavior.
5. **Retry policies can multiply.** Request transport, queries, and sync replay have different semantics. Audit end-to-end attempt counts and idempotency before consolidating retry configuration.

## Bounded next changes

1. Define display semantics for device connection, service reachability, and actual sync state. Keep the tri-state connectivity contract. Use existing service/sync evidence where available; inspect endpoint contracts before adding probes.
2. Adapt the status pill to shared connectivity plus separately named service evidence. Preserve visibility gating, timeout, overlap suppression, cancellation, and event cleanup. A 503 or failed page probe must not become global device-offline state.
3. Add an optional host signal seam to generic Verger browser bindings if the host needs shared observation. Preserve standalone browser sampling as the default and avoid importing platform core into the generic package.
4. Make browser bootstrap explicit only after testing all client entry points and subscription cleanup. Keep the existing hook path until replacement coverage is demonstrated.
5. Verify disconnect/reconnect, unknown reachability, captive portal/service failure, auth expiry, background/foreground, remount cleanup, and retry amplification before accepting runtime changes.

No network runtime behavior was changed for this audit. G1 boundary / Vitest 5.0.5: 24/24 cases across NetworkManager, networkAdapters, Verger network, and capacity/network tests. This establishes configured snapshot and mapping contracts, not real radio behavior, authenticated service health, browser visual fidelity, or device proof.

## Local verifier contribution and repository gates

The local rn-terrain contribution is recorded in `C:/projects/rn-terrain/docs/architecture/2026-10-27-hermes-compiler-evidence.md`. It discovers the installed Hermes compiler and distinguishes native bytecode output from static-only acceptance. The C:/x launcher preserves argument boundaries and nonzero exit codes without a shell. G0 scanner/CLI builds, 41/41 G1 rn-terrain cases, and real Windows compiler success/rejection/unavailable scenarios were verified.

The broad C:/x `check:anti-slop` run exited 1 at aislop: 37 errors and 1,192 warnings across 4,208 files in the existing checkout. CNG, native-slop (review findings only), and hollow-stub stages completed before that failure; later chained stages were not reached. The separately executed version-drift gate exited 1 on three existing deprecated usages in useComposerLogic and DraggableCanvasSurface. Device-evidence and test-evidence metadata audits exited 0. Those metadata checks do not establish new physical-device execution. No gate or budget was weakened.

## External grounding

- [MDN navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine): connectivity reporting is a heuristic and does not establish service availability.
- The implementation conclusions above come from the named local source files, inspected on 2026-10-27.
