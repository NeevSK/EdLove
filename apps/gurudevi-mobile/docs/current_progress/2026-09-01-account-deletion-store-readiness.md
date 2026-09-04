---
title: "Account Deletion Store Readiness"
status: "blocked-on-policy-and-runtime-validation"
created: 2026-09-01
owners: [identity, privacy, legal, mobile, web]
tags: [account-deletion, retention, app-store, google-play, privacy]
---

# Account Deletion Store Readiness

The broader local-first lifecycle, device/session, relationship, and parity
sequence is maintained in
`2026-09-01-account-lifecycle-roadmap.md`. This document remains the focused
deletion/store gate and does not expand compliance claims.

## Delivered boundary

The mobile migration `20260901100000_account_deletion_request_policy.sql`
creates an account-deletion request, records the public policy version shown to
the requester, and prevents the old authenticated hard-delete RPC from being
called. A privileged reviewer may soft-deactivate a verified request and set a
future retention deadline. None of these operations claim that data has been
permanently deleted.

The public request route is `https://gurudevi.edlove.org/delete-account`, with
the retention section at `https://gurudevi.edlove.org/privacy#retention-and-deletion`.

## Store-facing requirements

| Requirement | Evidence now | Release state |
| --- | --- | --- |
| Accessible in-app account-deletion request path | Profile submits the request-only RPC and reports an existing pending/scheduled request instead of offering a duplicate flow | Needs authenticated browser/native proof |
| Public web deletion-request path | `/delete-account` provides an email request path and names Gurudevi | Ready after marketing-site deployment |
| Truthful privacy/retention disclosure | `/privacy#retention-and-deletion` explains request, soft deactivation, final deletion/anonymization, and exceptions | Draft pending legal review |
| Final deletion/anonymization after retention | No worker is enabled | Not ready |
| Retained-data categories and durations | Only component-level technical retention documents exist | Not ready |
| Store console declarations | No review or publication evidence | Not ready |

## Required policy matrix before enabling the purge worker

The operating entity and counsel must approve a matrix that states, for every
data category: purpose, owner, deletion/anonymization action, minimum
retention period, legal/institutional basis, custody/guardian constraint, and
reviewer. At minimum it must cover:

- account identity and authentication records;
- school memberships, classroom records, assessment records, and official
  institutional history;
- guardian/student consent and custody relationships;
- security, device, fraud, and privacy-audit records;
- support, safety, moderation, payment, and tax records;
- synced local copies, backups, and vendor-held data.

## Non-negotiable release gate

Do not describe the app as deletion-policy compliant or enable the Profile
request action until all of the following are complete:

1. deploy and verify the migration in a non-production Supabase environment;
2. exercise request, anonymous rejection, duplicate request, soft
   deactivation, reactivation, retained-data, and final purge cases against a
   real database;
3. approve the matrix above and have the public policy reviewed by the
   responsible legal and institutional owners;
4. implement an idempotent privileged purge/anonymization worker from that
   matrix, with immutable operational audit evidence;
5. verify the in-app and web request routes at the final production URLs, then
   complete accurate Google Play Data Safety and Apple App Review materials.
