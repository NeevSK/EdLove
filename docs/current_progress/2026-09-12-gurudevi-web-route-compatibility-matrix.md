# Gurudevi Web Route and Deep-Link Compatibility Matrix

**Status:** migration baseline - not a production redirect configuration  
**Date:** 2026-09-12  
**Owner:** Gurudevi web migration

## Purpose

This matrix makes the browser cutover explicit. It records where a legacy
marketing or React Native Web (RNW) link should lead once its replacement is
real in `apps/gurudevi-web`. It is a planning contract, not authorization to
change DNS, deploy a redirect, or remove a legacy route.

The canonical web app owns public routes at `gurudevi.app` and, once its
authentication boundary is production-ready, authenticated routes at
`sanctuary.gurudevi.app`. During implementation, `/sanctuary` is a temporary
route in the Next application; it is not evidence that the subdomain is live.

## Rules for every entry

- Preserve meaningful path parameters and safe query parameters. Never put
  tokens or secrets into a redirect target or analytics event.
- Return an anonymous visitor to an appropriate sign-in entry, then resume the
  requested authorized destination only after validation.
- Use a permanent redirect only after the target is accepted and the legacy URL
  is intentionally retired. Until then, use a reversible redirect or leave the
  legacy surface live.
- A route is eligible for legacy removal only when its replacement has browser
  evidence at phone width, plus relevant authenticated, denied, empty, loading,
  and failure states.
- Native deep links remain owned by `apps/gurudevi-mobile`; this matrix covers
  browser equivalents and cross-platform handoff intent, not a change to the
  native URL scheme.

## Public marketing routes

Source: `apps/gurudevi-marketingWeb/src/pages`. The target paths are canonical
paths in the Next application, not implemented-route claims.

| Legacy route | Canonical Next route | Access | Wave | Cutover and redirect note |
| --- | --- | --- | --- | --- |
| `/` | `https://gurudevi.app/` | Public | 1 | Rebuild the primary narrative and sanctuary entry first. Cut over only with title, metadata, and mobile browser evidence. |
| `/about` | `https://gurudevi.app/about` | Public | 1 | Preserve public purpose and structured metadata. |
| `/privacy` | `https://gurudevi.app/privacy` | Public | 1 | Legal copy must be reviewed for current operator and domain before cutover. |
| `/terms` | `https://gurudevi.app/terms` | Public | 1 | Legal copy must be reviewed before cutover. |
| `/delete-account` | `https://gurudevi.app/delete-account` | Public; authenticated action may follow | 1 | Preserve the account-deletion policy and provide a safe sign-in handoff when identity is required. |
| `/support` | `https://gurudevi.app/support` | Public | 2 | Verify the existing support submission endpoint and privacy behavior before porting. |
| `/faq` | `https://gurudevi.app/faq` | Public | 2 | Preserve stable anchors if external links use them. |
| `/thuthimal` | `https://gurudevi.app/thuthimal` | Public | 2 | Confirm current product ownership and content before migration. |
| `/journal` | `https://gurudevi.app/journal` | Public | 2 | Static content route; preserve pagination and canonical metadata if present. |
| `/journal/<slug...>` | `https://gurudevi.app/journal/<slug...>` | Public | 2 | Preserve the complete catch-all slug and canonical article URL. |
| `/authors/<id>` | `https://gurudevi.app/authors/<id>` | Public | 2 | Preserve stable author IDs and associated article links. |
| `/journal/feed.xml` | `https://gurudevi.app/journal/feed.xml` | Public / machine | 3 | Implement as a Next route handler before redirecting feed subscribers. |
| `/robots.txt` | `https://gurudevi.app/robots.txt` | Public / machine | 3 | Generate for the actual production host only. |
| `/llms.txt` | `https://gurudevi.app/llms.txt` | Public / machine | 3 | Preserve only reviewed, current product facts. |
| `/knowledge.json` | `https://gurudevi.app/knowledge.json` | Public / machine | 3 | Preserve schema only after consumers and privacy implications are known. |
| `/font-lab` | No production replacement by default | Internal / experimental | Retire | Do not redirect publicly unless a real supported experience is approved; remove after confirming it has no external audience. |

## High-value RNW product routes

Source: `apps/gurudevi-mobile/app` and the Metro RNW shell. These routes are
the compatibility input for a browser-native rebuild, not a requirement to
replicate Expo Router topology or UI.

| Legacy RNW route | Canonical Next route | Access | Wave | Cutover and deep-link note |
| --- | --- | --- | --- | --- |
| `/` | `https://gurudevi.app/` when anonymous; authorized sanctuary entry when signed in | Contextual | 3 | The current session gate owns resolution. The new server/client boundary must resolve safely without exposing a signed-in landing to an anonymous request. |
| `/welcome` | `https://gurudevi.app/` | Public | 3 | Fold welcome narrative into the public root; preserve intentional guest and sign-in choices. |
| `/auth` | `https://sanctuary.gurudevi.app/sign-in` | Public | 3 | Implement real browser authentication before redirecting. Return URL must be allow-listed. |
| `/auth/callback` | `https://sanctuary.gurudevi.app/auth/callback` | Callback-only | 3 | Register the web callback with the identity provider. Never redirect opaque callback parameters through a public route. |
| `/account-recovery` | `https://sanctuary.gurudevi.app/account-recovery` | Public | 3 | Preserve recovery, sign-out, and failure handling as an end-to-end browser flow. |
| `/onboarding?entry=guest` | `https://sanctuary.gurudevi.app/onboarding?entry=guest` | Session / guest policy required | 3 | Keep only validated, non-sensitive query state. Define guest access deliberately rather than copying native behavior. |
| `/invitation-welcome` | `https://sanctuary.gurudevi.app/invitations/welcome` | Invitation context | 3 | Define a signed, expiring invitation contract before cutover; no raw invite token in a logged URL. |
| `/public-form/<slug>` | `https://gurudevi.app/forms/<slug>` | Public or form-defined | 4 | Preserve slug; validate schema, submission failure, and confirmation. Do not make a public form require an app shell. |
| `/library` | `https://sanctuary.gurudevi.app/library` | Authorized | 4 | Rebuild browse and access controls with real data. |
| `/library/collections/<id>` | `https://sanctuary.gurudevi.app/library/collections/<id>` | Authorized | 4 | Preserve the collection ID only after authorization; a missing or denied collection needs an intentional result. |
| `/library/resource/<resourceId>` | `https://sanctuary.gurudevi.app/library/resources/<resourceId>` | Authorized | 4 | Use a plural resource namespace; map old singular deep links during cutover. |
| `/library/document/<resourceId>` | `https://sanctuary.gurudevi.app/library/documents/<resourceId>` | Authorized | 4 | Rebuild browser viewing/download behavior; do not assume native file APIs. |
| `/library/video/<resourceId>` | `https://sanctuary.gurudevi.app/library/videos/<resourceId>` | Authorized | 4 | Implement web playback and entitlement states before redirecting. |
| `/workspace` | `https://sanctuary.gurudevi.app/workspace` | Authorized / role-resolved | 5 | Keep role resolution server-authorized. This target may redirect internally to a role workspace after permissions are known. |
| `/workspace/classroom` | `https://sanctuary.gurudevi.app/workspace/classroom` | Authorized | 5 | Establish classroom selection, denied, and empty states before cutover. |
| `/workspace/classroom/<classroomId>` | `https://sanctuary.gurudevi.app/workspace/classroom/<classroomId>` | Authorized | 5 | Preserve classroom ID only after authorization. |
| `/workspace/classroom/<classroomId>/attendance` | `https://sanctuary.gurudevi.app/workspace/classroom/<classroomId>/attendance` | Authorized teacher/staff | 5 | Requires real classroom and attendance contracts, including write failure recovery. |
| `/workspace/classroom/<classroomId>/gradebook` | `https://sanctuary.gurudevi.app/workspace/classroom/<classroomId>/gradebook` | Authorized teacher/staff | 5 | Requires real grading contracts and role-based authorization. |
| `/workspace/classroom/reflect` | `https://sanctuary.gurudevi.app/workspace/classroom/reflect` | Authorized | 5 | Confirm whether reflection is classroom-scoped before finalizing the path. |
| `/workspace/classroom/student/<classroomId>` | `https://sanctuary.gurudevi.app/workspace/classroom/<classroomId>/student` | Authorized student | 5 | Preserve student-specific authorization; do not expose teacher projections. |
| `/workspace/principal` | `https://sanctuary.gurudevi.app/workspace/principal` | Authorized principal | 5 | Migrate only after principal contract and data boundary are verified. |
| `/workspace/guardian` | `https://sanctuary.gurudevi.app/workspace/guardian` | Authorized guardian | 5 | Migrate only after guardian relationship authorization is verified. |
| `/workspace/founder` | `https://sanctuary.gurudevi.app/workspace/founder` | Authorized founder | 5 | Treat as a privileged role; explicit audit and authorization evidence required. |
| `/workspace/commercial/<batchId>` | `https://sanctuary.gurudevi.app/workspace/commercial/<batchId>` | Authorized commercial role | 5 | Preserve batch ID only after authorization. |
| `/profile` | `https://sanctuary.gurudevi.app/profile` | Authorized | 6 | Rebuild profile settings and privacy controls as browser-native forms. |
| `/profile/public/<id>` | `https://gurudevi.app/people/<id>` or no public replacement | Policy-dependent | 6 | Decide visibility and indexing policy before preserving a public profile URL. |
| `/profile/full/<id>` | `https://sanctuary.gurudevi.app/people/<id>` | Authorized | 6 | Preserve privacy and relationship checks; do not alias to the public route by default. |
| `/profile/privacy-ledger` | `https://sanctuary.gurudevi.app/profile/privacy-ledger` | Authorized | 6 | Preserve data-subject access protections and audit semantics. |
| `/settings` | `https://sanctuary.gurudevi.app/settings` | Authorized | 6 | Consolidate with profile settings only after an ownership decision; current RNW ownership is inconsistent. |
| `/notifications` | `https://sanctuary.gurudevi.app/notifications` | Authorized | 6 | Browser push is optional; inbox view must work independently. |
| `/self` | `https://sanctuary.gurudevi.app/self` | Authorized | 6 | Retain role-aware route resolution without copying the native tab shell. |
| `/self/wisdom/<id>` | `https://sanctuary.gurudevi.app/self/wisdom/<id>` | Authorized | 6 | Preserve ID and access checks. |
| `/community` | `https://sanctuary.gurudevi.app/community` | Authorized | 6 | Migrate after community permissions and moderation model are verified. |
| `/community/groups/<groupId>` | `https://sanctuary.gurudevi.app/community/groups/<groupId>` | Authorized | 6 | Preserve group membership authorization. |
| `/community/chat/<conversationId>` | `https://sanctuary.gurudevi.app/community/conversations/<conversationId>` | Authorized | 6 | Map old chat deep links to the normalized conversation path; require membership before load. |
| `/community/direct-messages/<conversationId>` | `https://sanctuary.gurudevi.app/community/conversations/<conversationId>` | Authorized | 6 | Consolidate duplicate conversation concepts only after the message contract is verified. |

## Explicitly deferred or native-only routes

The following routes have browser implications but are not migration promises.
They need a separate capability decision before they receive a Next destination:

| Legacy route family | Decision needed |
| --- | --- |
| `/qr` | Browser camera, payload verification, and web-to-native handoff design. |
| `/library/document-scanner`, `/library/tools/ocr` | Browser capability and privacy review; no silent native API substitute. |
| `/library/map` | Web map provider, consent, and cost decision. |
| `/library/tools/*` | Define which file transforms are browser-safe and which require a service. |
| `/a-i-assistant`, `/durable-agents` | Product, data-access, and model safety scope before route design. |
| `/thuthimal-claim` | Confirm product ownership and claim-token contract. |
| `/(modal)/create-post`, `/(modal)/create-group` | Fold into parent sanctuary routes only after community write permissions are verified. |

## Cutover evidence record

Before marking any row as cut over, record the following adjacent to the
implementation or release change:

1. Source and target route, including dynamic parameter handling.
2. Redirect status and rollback method.
3. Browser evidence at 360 px and 390 px, plus relevant wider layout evidence.
4. Authenticated, anonymous, unauthorized, loading, empty, and error outcomes
   applicable to the route.
5. Metadata, canonical URL, and indexing decision for public routes.
6. Confirmation that the native deep link still behaves as intended where a
   native equivalent exists.

## Relationship to the execution plan

This document satisfies the Phase 0 route-matrix deliverable in
`2026-09-12-gurudevi-web-hard-cutover-plan.md`. It intentionally lists target
URLs ahead of implementation so route ownership, compatibility, and access
decisions can be reviewed before code or deployment changes begin.
