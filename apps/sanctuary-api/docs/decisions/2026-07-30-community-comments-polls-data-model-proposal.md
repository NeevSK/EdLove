---
title: "Community Comments and Polls oRPC Data Model Proposal"
status: "implemented"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
scribe: "Codex"
tags: [api, orpc, community, zenstack, cedar, proposal]
---

# Community Comments and Polls oRPC Data Model Proposal

## Context

Community groups, posts, reactions, comments, polls, and reports now use native oRPC. The comment, upvote, poll-vote, and report tables already existed in the deployed SQL baseline; ZenStack models and policies were added to make them available through the online enforcement boundary.

Completing this slice through a raw SQL or direct Supabase handler would bypass the required ZenStack online enforcement boundary and would create a second authorization path. That is not an acceptable completion of the oRPC cutover.

## Required model surface

Add authoritative server models for:

- `CommunityComment`: post, author, content, anonymous flag, official-answer flag, timestamps;
- `CommunityCommentUpvote`: comment, user, unique compound key;
- `CommunityPollVote`: post, option, user, unique compound key;
- poll option/status representation, either as a typed post payload with validated schema or a normalized poll model.

Each model needs ZenStack policies for tenant scope, public/member reads, author mutations, moderator/admin moderation, and user-owned vote/upvote toggles. Cedar entities/actions must be added only when the ZenStack predicates and DTOs are defined.

## oRPC procedures to add

`community.getComments`, `createComment`, `deleteComment`, `toggleCommentUpvote`, `markOfficialAnswer`, `getPollStatus`, and `voteInPoll`, each with strict input/output DTOs, typed errors, audit metadata, and idempotency behavior for toggles/votes.

## Gate

Implementation is complete for this slice. `zenstack check` and `zenstack generate` pass, and the native HTTP tests cover the handlers. The deployed database still needs to be included in the real-database acceptance profile before production cutover is declared.
