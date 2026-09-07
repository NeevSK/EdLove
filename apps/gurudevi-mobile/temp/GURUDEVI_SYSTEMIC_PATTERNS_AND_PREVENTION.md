# Gurudevi Systemic Patterns and Prevention Checklist

This document deliberately steps back from individual files. Each pattern must
be addressed at the shared-contract level, then monitored so new instances are
caught before release.

## Pattern checklist

### P-01 — failure paths are not part of the user-facing contract

Observed shapes: `console.error` only, unhandled rejection, silent empty list,
spinner reset without explanation, and raw native `alert()` assumptions.

- [ ] Define one error-feedback contract for mutations and loads.
- [ ] Require every async boundary to specify loading, success, failure, and
  retry/recovery behavior.
- [ ] Distinguish `empty` from `error` in query/view models.
- [ ] Add a review rule: console logging is telemetry, never the only UX.
- [ ] Add tests for rejected promises, offline mode, and soft falsy failures.

### P-02 — false success is more dangerous than visible failure

Observed shapes: modal closes in `finally`, recording reset after failed save,
clipboard toast without clipboard write, hardcoded streak, and success audit
event before network success.

- [ ] Make success UI reachable only from an acknowledged success result.
- [ ] Keep user data recoverable until durable persistence succeeds.
- [ ] Test that failed actions preserve the input and do not emit success events.
- [ ] Add semantic assertions for clipboard, upload, save, and sign-out effects.

### P-03 — shared infrastructure exists but feature code bypasses it

Observed shapes: `useSafeMutation`, `handleAPIError`, shared toast, clipboard,
shared UI primitives, and canonical logout code each have correct examples while
nearby features hand-roll weaker versions.

- [ ] Publish a short “preferred path” matrix by operation type.
- [ ] Search for raw alternatives (`alert`, direct clipboard, console-only catch,
  local heading wrappers) in CI.
- [ ] Make shared hooks easy to import and document their guarantees.
- [ ] Add architecture tests for package boundaries and forbidden APIs.

### P-04 — platform behavior is modeled as a branch, not a complete capability

Observed shapes: native delete without confirmation, native clipboard no-op,
shared settings component with missing navigation, and web/native re-export files
that do not actually supply distinct contracts.

- [ ] Define platform capability adapters for confirmation, clipboard, navigation,
  notifications, and storage.
- [ ] Test every capability on web and native, including failure behavior.
- [ ] Avoid “toast-only” native fallbacks for operations that claim to complete.
- [ ] Make required route dependencies explicit in types rather than `any`.

### P-05 — lifecycle and sequencing are implicit

Observed shapes: many independent startup effects, auth fetch/subscription race,
irreversible logout before network sign-out, and multi-step sync behavior.

- [ ] Represent startup/logout flows as explicit state machines or phases.
- [ ] Document which steps are reversible, idempotent, or authoritative.
- [ ] Add cancellation, retry, and rollback tests around network boundaries.
- [ ] Record audit events after the operation they describe, not before.

### P-06 — local and server schemas drift

Observed shape: PowerSync local tables exceed the server model map, causing
batch-wide rollback for one unsupported table.

- [ ] Generate or validate the client/server table coverage matrix.
- [ ] Fail CI when a syncable local table has no server handler.
- [ ] Test mixed batches and unknown-table behavior explicitly.
- [ ] Decide whether unsupported records are quarantined, skipped, or rejected.

### P-07 — stack truth has multiple competing authorities

Observed shape: root manifest, mobile manifest, lockfile, installed packages,
and generated stack docs disagree about React/React Native versions.

- [ ] Define which manifest owns shared React/React Native versions.
- [ ] Add a CI check comparing declared, locked, and installed versions.
- [ ] Regenerate stack-map docs after dependency changes.
- [ ] Require package/version changes to update the dependency annotations.

## Proactive detection checklist

- [ ] Static scan for raw `alert(` in mobile/shared native-capable packages.
- [ ] Static scan for async handlers containing `catch` with only logging.
- [ ] Static scan for success toasts/events outside success branches.
- [ ] Static scan for `finally` blocks that close/reset user input after writes.
- [ ] Static scan for `setInterval` polling without stale/error state.
- [ ] Static scan for platform branches whose native branch does not invoke a
  real capability.
- [ ] Type-level check forbidding `any` navigation props on shared screens.
- [ ] Integration test that exercises every settings entry route.
- [ ] Integration test for multi-account logout and query-cache isolation.
- [ ] Sync schema coverage test comparing local tables to server handlers.
- [ ] Dependency consistency check for root/app manifests, lockfile, and runtime.
- [ ] Freshness check that fails when generated stack docs lag package changes.

## Review protocol for future audits

For every candidate finding:

1. Locate the exact current source line and caller chain.
2. Reproduce or test the failure path where feasible.
3. Record counterexamples where the shared pattern is implemented correctly.
4. Classify as confirmed, likely, lead, or disproven.
5. Fix the smallest shared contract that prevents recurrence.
6. Add a regression test or automated detector before closing the item.
