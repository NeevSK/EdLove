---
title: "Domain Healing Tasks"
status: "active"
created: 2026-05-16
updated: 2026-05-16
author: "Naveen"
scribe: "opencode"
tags: [packages, core]
---

# Domain Healing Tasks

## Completed
- [x] Refactor `attendanceAPI` to Sanctuary RPC.
- [x] Refactor `staffManagementAPI` to Sanctuary RPC.
- [x] Refactor `communityAPI` (Comments, Polls, Posts) to Sanctuary RPC.
- [x] Refactor `classroomNotesAPI` to Sanctuary RPC.
- [x] Fix `createSovereignClient` Hono type constraints.
- [x] Fix `poaProxy.ts` method mapping (Internal vs Contract).
- [x] Fix `temporalPOAProxy.ts` return types (T -> any).
- [x] Update `comment.hooks.ts` to new signatures.
- [x] Update `poll.hooks.ts` to new signatures.
- [x] Update `community.hooks.ts` to new signatures.
- [x] Fix `mockData.ts` capacity naming (grade_head -> gradeHead).
- [x] Final `tsc` validation for `packages/core`.

## Remaining
- [ ] **Mobile Alignment**: Verify `apps/gurudevi-mobile` compiles against the new Core API.
- [ ] **Auth Siphoning**: Ensure `identityAPI.identifyActiveCitizen()` is used globally instead of `supabase.auth.getUser()`.
- [ ] **Mocks Cleanup**: Refactor remaining `any` casts in `mockData.ts` to use explicit DTO interfaces.
- [ ] **Siphoning Social API**: Move Resonance and Notifications to the Sanctuary RPC gateway.
