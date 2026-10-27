---
title: "Browser security credential controls"
status: active
created: 2026-10-25
updated: 2026-10-26
author: Codex
tags: [auth, security, verification]
---

# Feature spec: browser security credential controls

## Blast Zone: AMBER

## Target files

The existing `app/(sanctuary)/profile/security` page/view, a browser-only
security adapter and operation hook in `lib/sanctuary`, and focused boundary
and component tests. No native imports or root provider changes.

## Reuses

Authorized-entry canonical account/credential subject, browser Supabase client,
secure HTTP transport, strict shared inventory/unlink contracts, existing Query
provider and canonical scoped-query keys, and provider TOTP list/verification.

## Invariants

- Replace hardcoded session rows, trust score and fake revocation/passkey
  success with live credentials/factors and explicit unavailable capability
  descriptions. This replacement is within the user's authorized preproduction
  break/fix scope; those prior handlers never called a security service.
- Inventory is private, uncached by HTTP, account-scoped in memory, explicitly
  invalidated on auth transition, and never accepted for another subject/account.
- TOTP verification reports only that operation's result. It does not imply a
  permanent trusted environment or bypass Sanctuary's recent-assurance checks.
- Unlink requires explicit selection and confirmation, recent authenticator
  verification, and a matching server receipt. No optimistic credential removal,
  automatic retry or provider SDK fallback. Refresh inventory after confirmation.
- Account switch/unmount invalidates pending UI completion and secret inputs.
  Failure preserves inputs for correction, with fixed safe error messages.

## Verification

G1 HTTP/auth boundary cases and G3 mounted browser components, strict browser
types/bundling, raw diff review and explicit unresolved live-provider limits.
Individual operation functions should stay below cognitive complexity 15.
Actual device/session inventory, passkeys, authenticator enrollment and real
Google ceremonies remain required admissions, not simulated page behavior.

## Implementation and evidence (October 26)

The page now receives the canonical account and separate credential subject
from authorized entry. Its browser adapter verifies session/claim continuity,
reads Sanctuary's strict credential inventory, and projects verified TOTP
factors and the current assurance level. Query reads use the existing canonical
scoped-key contract, zero retained cache lifetime after unmount, no automatic
retry, and cancellation that discards late transport results. SDK factor and
assurance reads remain provider adaptation; they do not authorize mutation.

Google unlink has explicit target selection and confirmation. The browser sends
only the credential identity UUID to Sanctuary, accepts only a matching strict
receipt, then removes the confirmed target from local inventory and refreshes.
Failures retain the credential; there is no optimistic removal or SDK fallback.
Known server correction codes map to fixed messages. The controller clears
secrets/results and removes its cache on auth subject change or sign-out,
invalidates late completions, and supports React Strict Mode effect replay.
The server-rendered view is keyed by both canonical account and auth subject.

Removed behavior was the prior hardcoded device list, trust score, unverified
cookie/storage claims and local-state-only success notices for revoke/passkey
actions. None called a security service. Those capabilities now have explicit
unavailable copy. Actual device revocation/passkey support remains open work;
this page must not advertise completed security operations before then.

- G1 / Vitest with HTTP/auth substituted: 15 browser-adapter cases succeeded.
  Includes foreign claims/receipt rejection, no caller-selected account,
  cancellation before/during transport, changed session, safe provider errors,
  explicit TOTP verification and recovery-credential denial without retry.
- G3 / Testing Library + jsdom with auth/HTTP substituted: eight mounted page
  cases succeeded. Includes inventory failure/retry, failed TOTP draft
  retention, explicit unlink confirmation, no removal before acknowledgment,
  account-switch cache/result teardown, late completion, unmount and Strict
  Mode replay. This is not a real Google, hosted-browser or device ceremony.
- G0 / browser TypeScript and Core declaration build succeeded. Scoped Biome
  formatting/import, enabled cognitive-complexity and raw unified diff checks
  succeeded. Initial validation found an undeclared Zod import; schemas now
  live in Core's existing credential contract, and no dependency was added.
- Broader Vitest selection: six files / 44 cases completed successfully across
  security, authorized entry, sign-out, callback completion and deletion routes,
  using their configured auth/HTTP substitutions.
- G4 / Next.js 16.4.2 Turbopack optimized build completed, including its type
  check and 88 generated static pages. This proves bundle construction, not an
  authenticated session through the security page.
- Broad anti-slop still exits 1 at the same 48 native findings in the shared
  change set. No suppression or gate threshold changed.

No hosted configuration, database migration or deployment changed. Actual
credential linking/enrollment, browser password/recovery UI, verified email
delivery, lost-factor recovery, session inventory/revocation, hosted Google
ceremonies and actual client sync isolation remain programme obligations.

## Follow-up spec: browser password recovery (October 26)

AMBER targets: existing reset form, browser security client/controller and their
tests. Reuse password schemas, canonical owner checks, provider TOTP/code-request
primitives and Sanctuary's password command. Replace direct SDK password updates;
preserve failed drafts and clear on owner change/success. Request codes explicitly.
Accept only a matching server receipt. Preserve validated return navigation with
a post-success link. No implicit enrollment or lost-factor/MFA bypass. Verify
failed saves/retry, account transitions, receipts, optional confirmation transport,
and static/bundle contracts. Individual handlers remain below complexity 15.

## Browser recovery implementation

The reset form resolves canonical account/credential subject from verified
claims and rechecks its SDK session. It reuses the security controller's live
inventory, explicit TOTP verification, account-transition invalidation and
receipt checks. Password submission calls Sanctuary after TOTP; raw provider
password mutation is no longer a browser reset path. Current-password and
provider nonce inputs are forwarded only when entered. Corrective errors use
the closed shared contract. Failed verification/mutation keeps the form and
draft available; confirmed completion removes secret fields and offers the
validated return destination. An ordinary authenticated session may also use
this password-change screen, subject to the same server MFA policy; the screen
does not establish email ownership merely by being opened.

Recovery initiation retains the existing provider PKCE email primitive and
callback destination. It blocks repeated pending submissions synchronously,
handles rejected and thrown provider failures with fixed neutral messages,
keeps failed drafts retryable and ignores completion after unmount. It reports
only that a recovery link was requested. The server callback now carries the
validated internal post-reset destination through `/reset-password`; external
destinations normalize to the existing safe default. Code-only callback
classification, issuer exchange and response-cookie handling remain intact.

G1 browser-adapter selection now has 26 successful cases, including owner
resolution, password receipt/confirmation transport and safe corrective errors.
G3 mounted reset form has eight successful scenarios with auth/HTTP substituted;
recovery request has four. Existing security-page scenarios remain eight.
These counts establish substituted client contracts, not real mail delivery,
link expiry/replay, native/browser provider sessions or lost-factor recovery.
Browser typing and explicit complexity/format/import checks succeeded. The
final production build after the initiation/callback changes succeeded under
Next.js 16.4.2 Turbopack, including TypeScript and 88 generated static pages.
The combined eight-file auth/security browser selection completed 68 cases
with its configured substitutions. Neither result establishes a real hosted
authenticated recovery ceremony.
The broad anti-slop gate still reports the same 48 native findings.
