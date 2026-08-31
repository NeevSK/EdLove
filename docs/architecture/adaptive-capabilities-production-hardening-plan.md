# Adaptive capabilities production-hardening plan

Status: active implementation plan  
Created: 2026-08-31

## Objective

Ensure memory, visual, storage, battery, and network adaptation remains safe when runtime signals are missing, malformed, stale, contradictory, or fail during lifecycle transitions.

## Failure-state contract

- Invalid memory values classify as medium, never high.
- Unknown network state is represented as unknown and non-urgent network work defers.
- A failed signal refresh retains the last known value instead of replacing the complete state with optimistic defaults.
- A newer refresh cannot be overwritten by an older, slower refresh.
- Unknown battery state defers non-urgent work.
- Unknown free-disk state defers background storage maintenance.
- Storage maintenance never fails open into a full compaction.
- User actions remain available; only non-urgent work is constrained.
- Durable data and pending mutations are never removed as a fallback.

## Implemented in this slice

1. Added finite-value validation to shared memory normalization.
2. Added shared unknown-network normalization.
3. Hardened `RealityProvider` with `Promise.allSettled`, last-known-value retention, and refresh sequencing.
4. Hardened `EfficiencyPolicy` for invalid battery and unavailable free-disk state.
5. Changed storage-maintenance state-read failure from fail-open to conservative skip.
6. Added tests for invalid memory, unknown network, invalid battery, and unavailable disk state.
7. Added consent-compatible, low-cardinality efficiency-decision telemetry with one-minute burst deduplication.
8. Added adversarial cache-index/path-safety tests and architecture checks that prevent visual consumers from bypassing the shared capability API.

## Remaining production work

### Observability

- Add privacy-safe counters for signal failures, policy deferrals, and recovery events.
- Include policy reason and operation class in diagnostics, never raw device identifiers.

### Lifecycle and cancellation

- Abort in-flight prefetch/download work on screen loss and app backgrounding.
- Add idempotency and cancellation tests around background task retries.
- Verify listener cleanup under provider remount and hot reload.

### Storage safety

- Replace broad `any` storage queue parsing with a validated schema.
- Add atomic write/finalization and recovery for interrupted cache operations.
- Test disk-full, locked-database, corrupted-index, and interrupted-compaction paths.

### Release verification

- Exercise cold start, offline transition, battery transition, low storage, background/foreground, and rapid refresh races on release builds.
- Run memory, battery, network, and storage regression gates on at least one low-end and one capable Android device.

### Host-side validation status

- Native signal aggregation is isolated in `realitySignals.ts` and covered by mobile Vitest integration tests for synchronous throws, asynchronous failures, partial success, optional power support, offline derivation, and last-known-state retention.
- Full React-provider mounting still belongs in the Expo/Jest harness; the current provider graph is too broad for reliable mobile Vitest execution. This does not block testing the signal contract, but it remains a release-test item.
