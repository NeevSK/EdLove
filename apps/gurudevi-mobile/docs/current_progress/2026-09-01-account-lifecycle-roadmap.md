---
title: "Account Lifecycle Roadmap — Universal, Local-First"
status: "active"
created: 2026-09-01
owners: [identity, mobile, web, product, privacy]
tags: [account-lifecycle, local-first, multi-account, devices, powersync, parity]
---

# Account Lifecycle Roadmap — Universal, Local-First

This is the durable sequence for account lifecycle work. It is the source of
direction for future slices; individual progress notes record evidence, not
new policy. The app supports multiple remembered accounts locally, while the
server remains authoritative for identity, relationships, account status, and
remote sessions.

## Lifecycle model

```text
active
  ├─ sign out current device ──> remembered / signed-out locally
  ├─ revoke remote session ────> session revoked
  ├─ request deactivation ─────> deactivation_requested
  └─ request deletion ─────────> deletion_requested

deactivation_requested ──approved──> deactivated ──policy window──> active
deletion_requested ─────verified───> deletion_scheduled
deletion_scheduled ─────worker─────> deleted or anonymized
```

The client must distinguish local sign-out, remote-session revocation,
deactivation, and deletion. A local cache being cleared is never evidence that
the server account or its associated records were deleted. Every unavailable,
denied, pending, failed, and completed command has an explicit result and user
feedback.

## Foundation boundaries

### Local-first and multi-account

- `@repo/core` owns the lifecycle command contract and command-state
  controller.
- The device account registry owns remembered identities and the selected
  local account; it must not invent server account status.
- PowerSync active-database cleanup happens before local destructive cleanup.
- Reload, offline mode, storage failure, and a second remembered account are
  acceptance cases on web and native.

### Sessions and devices

- Current-device sign-out is a local command with a server sign-out step where
  available.
- Remote sessions/devices are shown only from a server-backed adapter; local
  remembered accounts are not presented as remote device inventory.
- Revocation failure must be visible and retryable. It must not silently claim
  that another device was signed out.
- PIN protection is a native capability; web must explain its unavailable
  boundary rather than emulate it with an insecure browser fallback.

### Deletion and retention

- Public and in-app entry points submit a request; neither performs hard
  deletion.
- A verified request may later be soft-deactivated and scheduled by a
  privileged worker. The request migration is not the purge worker.
- Final deletion/anonymization requires an approved category-by-category
  retention, custody, school-record, safeguarding, security, support, payment,
  backup, and vendor-data matrix.
- Policy text must identify the current public policy version. Until legal and
  institutional owners approve exact periods and operating responsibility,
  docs must remain explicitly marked as draft and store readiness must remain
  blocked.

### Deactivation and reactivation

Deactivation is a reversible account-status operation, separate from deletion.
It needs a server-authoritative reason, actor/authority check, effective time,
and an explicit reactivation window or review path. The client must preserve a
pending state and explain what access is limited. Reactivation must not restore
data that has already entered an approved deletion workflow.

### Guardian and child relationships

Guardian/child is a separate domain boundary, not a special account flag. Its
future contract must model invitation, consent, custody/authority, expiry,
revocation, historical relationship, and school/institution review. A child
account deletion request must not remove guardian, safeguarding, or official
institutional records without the approved policy and authority path.

## Delivery order

1. **Phase 1 — local command foundation:** typed lifecycle results, local
   account switching/removal, PowerSync cleanup, and explicit web/native
   capability parity.
2. **Phase 2 — lifecycle UX:** one controller adopted by Profile, Device
   Security, logout, deletion, and recovery; browser/native runtime validation
   remains a release gate.
3. **Phase 3 — server request boundary:** request/status functions, policy
   versioning, legacy hard-delete revocation, and truthful public policy pages.
4. **Phase 4 — authoritative status:** deactivation/reactivation, fresh-auth
   and authority checks, remote-session adapters, and notification/error
   semantics.
5. **Phase 5 — relationship-aware deletion:** guardian/child and institutional
   custody matrix, review workflow, and retained-record boundaries.
6. **Phase 6 — purge operations:** idempotent privileged
   deletion/anonymization worker, audit evidence, retry/recovery behavior,
   backup/vendor handling, and store declaration review.

Internal feature screens follow these foundations. Each screen adopts the
existing contracts incrementally; no mass rewrite or parallel lifecycle
implementation is permitted.

### Current Phase 4 boundary

The first Phase 4 slice is a read-only `get_account_lifecycle_status` server
contract. It can distinguish an active account, a deletion request state, a
soft-deactivated account, and a policy-blocked response without changing any
state. The app routes a server-confirmed inactive identity only to the local
account-recovery screen, which permits retry and current-device sign-out; it
does not offer reactivation, cancellation, or deletion. The status and request
RPCs resolve the authenticated subject through `public.get_my_id()` because
the auth subject and public-user identifiers are not interchangeable.

Reactivation and all lifecycle mutations remain intentionally absent: they
require approved authority, fresh-authentication, retention, and custody
rules. Browser/native and applied-database validation of the recovery path is
still required before treating this as release-ready.

## Universal acceptance gates

No phase is complete from unit tests alone. The relevant gate must include:

- browser widths 375, 768, and 1440 with keyboard/pointer interaction;
- native smoke coverage for the same command and navigation outcomes;
- two accounts, reload, offline, failed storage, and PowerSync recovery;
- authenticated and anonymous server responses, duplicate submissions, denied
  authority, stale/fresh authentication, and retry paths;
- explicit status/feedback for pending, unavailable, cancelled, failed, and
  successful operations;
- evidence that no client or browser role can invoke legacy hard deletion;
- policy-owner review for public language and a real-database test run before
  any store-readiness claim.

Current evidence and blockers are tracked in:

- `2026-09-01-account-lifecycle-integration-phase-2.md`;
- `2026-09-01-account-lifecycle-experience-phase-3.md`;
- `2026-09-01-account-deletion-store-readiness.md`;
- `2026-09-01-guardian-child-lifecycle-boundary.md`.

Those documents intentionally retain `needs-runtime-validation` or
`blocked-on-policy-and-runtime-validation` until their stated evidence exists.
