---
title: "Hostile Review Gate for Public Opening and Funding"
status: "active"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
tags: [review, hostile-review, security, governance, release-gate]
---

# Hostile Review Gate for Public Opening and Funding

Before a visibility change, external contribution intake, material funding
acceptance, or rewarded-ad release, the reviewer must try to disprove readiness.

## Questions that must have evidence-backed answers

1. What happens when the network drops, the provider times out, or the API
   returns 503? Does the user retain safe local work without false credits?
2. Can an unauthenticated caller read another user's balance or mint capacity?
3. Can a forged, replayed, reordered, or delayed sponsor callback mint Energy?
4. Can a child, classroom, group, or direct-message surface encounter sponsor
   media or be pressured to view it?
5. Does any funder, advertiser, contributor, or dependency gain control of the
   core direction, private data, or essential access?
6. Did the delta delete a fallback, route, test, guard, or storage path? If so,
   stop and obtain explicit approval under the Deletion Veto.
7. Can a fresh contributor install and verify the project without private
   credentials, an author-machine path, or undocumented tribal knowledge?
8. Are all public claims true for the checked commit, rather than aspirational?

## Required review artifacts

- Raw `git diff` reviewed with deletions first.
- Changed-path list compared to the declared impact set.
- Secret/history scan output.
- Focused tests for the changed boundary.
- Fresh-clone or CI evidence for contributor-critical commands.
- Funding/support record, if external support is involved.
- Explicit disposition for every unresolved risk: fixed, deferred with owner,
  or release-blocking.

## Automatic stop conditions

Stop the release when there is an unknown secret, unreviewed child data,
unauthenticated cross-user access, client-only reward minting, missing signature
verification, an unprotected default branch, an unverified public claim, or a
dirty release candidate.
