---
title: "Running App → Production Evidence Plan"
status: "active"
created: 2026-09-21
author: "Naveen"
scribe: "Codex"
tags: [roadmap, user-journey, release, production-evidence, hardening]
---

# Running App → Production Evidence Plan

## Release truth

This plan changes the organizing question from “what infrastructure should we
harden?” to “can a real person use the running app safely and recover when it
fails?” The [Foundation Hardening Ledger](foundation-hardening-ledger.md)
remains the inventory; the [single-account auth release
slice](2026-09-21-single-account-auth-session-release-slice.md) remains the
implementation contract for Layer 1.

The host and mobile-identity cutover is defined in the [Sanctuary Domain and
Mobile Identity Cutover](2026-09-22-sanctuary-domain-and-mobile-identity-cutover-plan.md):
`gurudevi.app` is marketing and `sanctuary.gurudevi.app` is the authenticated
web app and new native identity.

**Known:** code and limited G0–G3 evidence exist for portions of auth, route
intent, and mutation safety. **Unproven:** the complete journey in a deployed
browser and installed Android app. Native iOS distribution is explicitly
deferred. The current state is integration in
progress, not production-hardened.

The first honest claim after Layer 1 is: one person can access one account,
enter, recover or sign out safely, and request/cancel deletion on the
supported platforms, with named browser/device evidence and diagnosable
failures. It is not a claim of multi-account, browser offline, final erasure,
or whole-platform hardening.

## Level 0 — desired outcome

A new or returning person can arrive, establish exactly one active identity,
reach a safe entry state, use one authorized useful action, leave safely, and
receive a recoverable outcome when a step fails.

“Running” means a deployed web candidate and installed mobile candidate use
real configuration—not a mock, static export, Storybook, or local server with
substituted identity/storage.

## Level 1 — journey layers and priority

| Layer | User question | Promotion result | Current state |
| --- | --- | --- | --- |
| 1. Entry and one-account identity | Can I get in, return, recover, and leave without becoming the wrong person? | Auth/session has G4 browser and G5 Android proof; iOS native is deferred. | In progress. |
| 2. Authority and first useful action | Can I safely do the first thing I came here to do? | One sensitive read and one primary mutation prove tenant/role enforcement and recovery. | Not assessed end-to-end. |
| 3. Return, interruption, and sync | What happens when signal, app, or retry fails? | Mobile survives tested interruption without duplicate or cross-account effects. | Foundation code in progress; device proof absent. |
| 4. Operate and promote | Can the team release, see harm, and reverse it? | Versioned rollout, health thresholds, alerts, support, and tested rollback. | Not assessed. |

Layers are gates, not a waterfall. Do not expand feature breadth to make the
app look complete before Layer 1 is proven.

# Layer 1 — exhaustive run-the-app plan

## Scope

In scope: web and mobile password sign-in/up, enabled passwordless/OAuth,
code-only callback, refresh/return, onboarding versus authenticated entry,
sign-out, recovery, and deletion request/status/cancel. Also in scope are
accessible error/retry states and privacy-safe diagnostics.

Out of scope: account chooser/switching UX, passkeys, immediate deletion,
export/retention, browser offline persistence, multi-device conflict UX, QR
association, tenant authorization, payments, AI, and general deployment
hardening. Passkeys are unsupported until hosted WebAuthn is enabled and
validated.

## Completion contract

1. One browser profile/app installation has one active session; a callback
   cannot silently replace it with another person.
2. Only a valid, one-time code callback can establish a session. Token URLs,
   malformed callbacks, replays, and expired attempts fail closed.
3. Expired/unauthenticated people do not see protected content; they get a
   clear recovery route.
4. Authoritative identity reaches exactly one destination: onboarding or the
   authenticated shell.
5. Sign-out and relaunch/reload do not restore the prior protected view.
6. Recovery and deletion outcomes are clear; “delete” means server request,
   status, or cancel—not a promise of immediate erasure.
7. Failure is visible and operable; tokens, passwords, raw callback URLs, and
   unnecessary identity data never enter UI, logs, or telemetry.

## Preflight: do this before the first user run

| ID | Action | Record | Stop promotion if |
| --- | --- | --- | --- |
| L1-P1 | Freeze a candidate commit; fresh-context review RED auth changes. | SHA, reviewed diff, reviewer, deferred risks. | Auth changes remain moving/unreviewed. |
| L1-P2 | Declare supported hosts, browsers, devices/OS, and enabled login methods. | Environment/build matrix. | An enabled path has no declared return host. |
| L1-P3 | Verify linked production auth settings: redirect allowlist, confirmation mode, provider values, deletion RPCs, passkey status. | Sanitized checklist only. | Configuration differs from contract. |
| L1-P4 | Deploy exact web candidate; create/install exact mobile candidate. Debug APK is default; release only when explicitly required. | URL, SHA, build IDs, install time. | Runtime is local-only or build is unidentified. |
| L1-P5 | Create disposable least-privilege test accounts: A new, B existing. | Secure aliases/cleanup owner/date. | Personal/admin/shared accounts are used. |
| L1-P6 | Prepare browser network view, server/client errors, Supabase logs, support contact, and redaction rule. | Run-sheet links and correlation format. | Failure cannot be diagnosed safely. |

## Supported-path matrix

Every row is recorded as pass, safe failure, product defect, environment
defect, or unsupported. “Not tested” never means pass.

| ID | Platform/state | Run | Required result |
| --- | --- | --- | --- |
| L1-W1 | Chrome/Edge, signed out, A new | sign up → confirmation → callback | One code exchange, one session, onboarding; reload retains only A. |
| L1-W2 | Chrome/Edge, signed out, B existing | password sign-in | Authenticated shell/onboarding with no stale A content. |
| L1-W3 | Chrome/Edge, signed out | each enabled passwordless/OAuth path | Approved return URL, code consumed once, safe destination. |
| L1-W4 | Chrome/Edge, A signed in | reload, close/reopen, refresh | Session resolves without protected-content flash or duplicate callback. |
| L1-W5 | Chrome/Edge, A signed in | sign out → back/reload | Guest/sign-in state; protected data does not return. |
| L1-W6 | Chrome/Edge, signed in/out as required | recovery | No account enumeration; completes or safely retries. |
| L1-W7 | Chrome/Edge, A signed in | deletion status → request → cancel if eligible | Server-authoritative status and honest copy. |
| L1-W8 | Firefox, Safari desktop, Safari iOS | repeat W2/W4/W5 | Correct redirect/cookie behavior in supported privacy modes. |
| L1-M1 | Android clean install, A new | sign up → callback → cold start | Native code-only callback, one session, authoritative entry. |
| L1-M2 | Android, B existing | password sign-in → background/resume | No stale person, lost callback, or protected flash. |
| L1-M3 | Android, A signed in | sign out → force stop → launch | A does not reappear in protected UI. |
| L1-M4 | Android, A signed in | recovery and deletion lifecycle | Web-equivalent meaning plus usable retry/error. |
| L1-I1–I4 | iPhone | Deferred: no paid Apple Developer/TestFlight distribution in this release. | Do not claim native iOS support or G5 iOS evidence. |

## Hostile and recovery matrix

| ID | Fault/action | Required safe outcome | Target proof |
| --- | --- | --- | --- |
| L1-A1 | Missing/malformed/oversized/encoded callback fields | No exchange/navigation; neutral retry; no raw URL telemetry. | G0/G1 + G4/G5 spot check |
| L1-A2 | Replay a completed callback URL | Cannot replace session or re-act. | G1 + real browser/device |
| L1-A3 | Expired code/provider denial | Explain restart; no token/partial identity retained. | G1 + G4/G5 |
| L1-A4 | Start A callback, sign in B before return | A rejected/safely restarted; B remains active. | G2/G3 + G4/G5 |
| L1-A5 | Network loss/timeout on callback, refresh, recovery, deletion | Honest retry/pending state; no duplicate action. | G1 + G4/G5 normal/poor/offline |
| L1-A6 | Close/background during callback | Safe resume/retry; no phantom sign-in. | G4/G5 |
| L1-A7 | Expire/revoke session in protected UI | Safe re-entry; no retained authorized view. | G2/G3 + G4/G5 |
| L1-A8 | Cookie/storage/private-mode limitation | Explicit supported fallback; no false authenticated shell. | G1 + G4 |
| L1-A9 | Duplicate taps/retries | UI/server resolves to one clear outcome. | G1/G2 + G4/G5 |
| L1-A10 | Keyboard/screen reader/font scale/reduced motion | Errors, loading, retry, and deletion confirmation are operable. | G4/G5 accessibility run |

## Evidence ladder and promotion decision

| Level | Minimum evidence | Proves | Does not prove |
| --- | --- | --- | --- |
| G0 | Pure state/policy tests | Deterministic rules. | Host behavior. |
| G1 | Mocked adapter/route tests | Declared boundary behavior. | Deployment, cookies, devices. |
| G2 | Real app/core composition with external substitutes | Cross-module lifecycle contract. | Actual host behavior. |
| G3 | Actual Next/Expo composition with local non-mock adapters | Visible composition states. | Target browser/device and hosted auth. |
| G4 | W1–W8 on deployed HTTPS | Target-browser identity journey. | Native behavior/long-term health. |
| G5 | M1–M4 on installed Android, normal/constrained networks | Named Android build behavior. | iOS, all Android devices/tenants, and long-term health. |

Layer 1 becomes **promotion-ready for web and Android** only after every
supported web/Android path has G4/G5 evidence, fresh-context review accepts
the packet, and each waiver has owner and expiry. Native iOS is excluded from
this claim until a paid Apple Developer distribution path and device proof
exist. It becomes **production-observed** only after monitoring the target
release. It becomes **production-hardened for this stated scope** only after
the matrix, operator recovery, and rollback are exercised.

## Triage and run record

- P0 / stop: wrong-account access, token exposure, callback replay changing a
  session, protected data after sign-out/expiry, duplicate deletion effect, or
  no safe recovery.
- P1 / fix before pilot: supported path cannot complete, reload/cold start
  breaks identity, recovery misleads, or diagnostics cannot locate failure.
- P2 / bounded waiver: safe workaround only; record owner and expiry.

For every run record candidate SHA/build, platform/OS/browser, account alias,
network condition, path ID, outcome, redacted correlation ID, defect/owner,
and retest. Redact email addresses, tokens, and personal content in captures.

## Layer 1 exit packet

1. Candidate SHA, deployed URLs, build IDs, and supported-path matrix.
2. Exact commands with G-level, runtime/substitutions, passed/failed counts,
   and limits.
3. Completed path and hostile matrices with redacted results.
4. Open defects/waivers, impact, owner, expiry, and explicit decision.
5. Logs/dashboards, alert/support owner, and one tested operator response.
6. Fresh-context review of the auth/route diff and this packet.

## Layers 2–4: next, but deliberately not expanded yet

Layer 2 chooses one real post-entry useful action. It must map read,
validation, mutation, receipt, tenant/role enforcement, and recovery; prove A
cannot read/mutate B’s tenant; and prove duplicate/offline retry has one
outcome. The choice is a product decision.

Layer 3 takes that action through offline, restart, retry, duplicate tap,
lease contention, account boundary, and conflict. Web remains online-only for
this release; recovery UI precedes wider offline claims.

Layer 4 makes release operation real: configuration check, immutable candidate,
staged/internal rollout, health thresholds, privacy-safe signals, alert owner,
support procedure, and tested rollback.

## Immediate next action

Complete L1-P1–L1-P6, then W1–W7 on deployed web and M1–M4 on one physical
Android device. Record failures before changing more code. Choose Layer 2 only
after that first real-user journey is evidenced.
