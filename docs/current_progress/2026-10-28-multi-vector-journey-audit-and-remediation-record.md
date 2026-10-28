---
title: "Multi-Vector User Journey Audit & End-to-End Remediation Record"
status: "active"
created: 2026-10-28
updated: 2026-10-28
author: "Naveen"
scribe: "Antigravity"
tags: [audit, remediation, user-journeys, deep-links, router, admission-guards, flow-dag]
---

# Multi-Vector User Journey Audit & End-to-End Remediation Record

> **Executive Summary:**  
> This document records the exhaustive audit of multi-vector screen entry points, deep-link routing, navigation stack transitions, ghost/unwired screens, and scaffold persistence across the Gurudevi & EdLove monorepo (`apps/gurudevi-mobile`, `apps/gurudevi-web`, `@repo/core`, `@repo/ui`). It details all identified defects, root causes, and code remediation actions applied to achieve zero-regression, deterministic navigation.

---

## 1. Audit Findings & Root Cause Analysis

### Finding 1: The Broken Mobile Invitation Screen Seam
- **Severity:** High (Broken User Journey)
- **Defect:** `apps/gurudevi-mobile/app/invitation-welcome.tsx` was implemented with `InvitationWelcomeScreen` to give invited students, teachers, and guardians a warm, dedicated onboarding experience. However, `apps/gurudevi-mobile/app/+native-intent.tsx` hardcoded incoming `classroomInvite` URLs (`gurudevi://invite/claim?code=...`) to route to `/community?inviteCode=...`.
- **Root Cause:** Inbound deep link classifier bypassed the dedicated invitation welcome route, leaving `invitation-welcome.tsx` as an unreachable ghost screen.
- **Remediation:** Update `+native-intent.tsx` to route `classroomInvite` intents to `/invitation-welcome?code=${intent.inviteCode}` and preserve this destination in `pendingIntentStore` across authentication hydration.

### Finding 2: Web Invite Code Parameter Dropping
- **Severity:** High (Functional Disconnect)
- **Defect:** On web, the short-link vanity page [`apps/gurudevi-web/app/(sanctuary)/c/[code]/page.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/c/[code]/page.tsx) forwards users to `/community?inviteCode=${code}`. However, [`apps/gurudevi-web/app/(sanctuary)/community/page.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/community/page.tsx) did not accept or inspect `searchParams`.
- **Root Cause:** Next.js Server Component page lacked typed `searchParams` props to capture and pass `inviteCode` to `CommunityFeedFloor`.
- **Remediation:** Add `searchParams` prop to `CommunityPage`, extract `inviteCode`, and pass it to the community feed and invitation redemption modal.

### Finding 3: Android Hardware Back-Button Trap
- **Severity:** Medium-High (Usability Defect)
- **Defect:** After completing sign-in or guest onboarding on Android, pressing the system hardware back button in the workspace floor would return the user to the Welcome/Login screen.
- **Root Cause:** In [`apps/gurudevi-mobile/app/welcome.tsx`](file:///c:/x/apps/gurudevi-mobile/app/welcome.tsx), transitions into auth and onboarding used `router.push('/auth')` and `router.push('/onboarding?entry=guest')`. Even though `SessionRouteGate` used `router.replace` to land on `/workspace`, `/welcome` remained at the root of the navigation stack.
- **Remediation:** Change `router.push` calls at lifecycle milestone boundaries in `welcome.tsx` to `router.replace()`, preventing `/welcome` from persisting under authenticated workspace sessions.

### Finding 4: Web Scaffold Persistence Drift
- **Severity:** Medium (UX Regression)
- **Defect:** On web ([`apps/gurudevi-web/app/(sanctuary)/welcome/WelcomeStage.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/welcome/WelcomeStage.tsx)), introductory modals and onboarding steps relied on ephemeral `window.sessionStorage.setItem('gurudevi_museum_modal_dismissed', 'true')`. Every time a user closed the browser tab or opened a new session, onboarding scaffolding re-rendered.
- **Root Cause:** Web lacked integration with `@repo/core`'s persistent `StorageManager` / `useScaffoldDismissal`.
- **Remediation:** Integrate `useScaffoldDismissal` or persistent storage so dismissed onboarding and tour states survive browser tab reloads.

### Finding 5: Missing Entry Flow Registrations in FlowDAG
- **Severity:** High (Governance & Verification Gap)
- **Defect:** While feature flows like `teacherRollCall` and `studentClaimPass` were registered in `FLOW_REGISTRY` (`packages/core/src/flows`), the entry journeys for Mobile and Web Sanctuary were never codified into `.flow.ts` specifications. Consequently, `scripts/audit-flow-dag.mjs` could not validate entry routes against broken links.
- **Remediation:** Create `mobileEntry.flow.ts` and `webSanctuaryEntry.flow.ts` under `packages/core/src/flows/entry/` and register them in `FLOW_REGISTRY`.

### Finding 6: Account Recovery & Lifecycle Inactive Disconnect (Web vs Mobile Parity)
- **Severity:** Critical (Bidirectional Flow Disparity & Dead-End State)
- **Defect:** 
  1. On Mobile, `account-recovery` serves server-confirmed inactive/deactivated accounts: `app/account-recovery.tsx` renders `AccountRecoveryScreen` with lifecycle timestamps, retry logic (`refreshProfile`), and device sign-out (`deviceAccounts.signOutCurrentAccount`). In contrast, on Web, `/account-recovery` previously 404'd or redirected to `/recovery`, which is strictly for unauthenticated password resets (`resetPasswordForEmail`).
  2. Authenticated web users whose account was server-marked as `inactive` hit dead-end inline cards on `/workspace`, `/community`, `/settings`, `/profile`, and `/self` with no button to sign out or switch accounts, trapping them in an infinite redirect loop back to `/welcome`.
- **Root Cause:** Conflation of Credential Recovery (unauthenticated password reset) with Account Lifecycle Status (authenticated inactive account review), and lack of a dedicated Web Account Recovery floor.
- **Remediation:**
  1. Built [`AccountRecoveryFloor.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/account-recovery/AccountRecoveryFloor.tsx) on Web with "Try again" (page refresh/re-evaluation) and "Sign out on this browser" (`executeSovereignSignOut('/welcome')`).
  2. Upgraded [`AccountRecoveryPage`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/account-recovery/page.tsx) to inspect `resolveAuthorizedEntry`: if `inactive`, renders `AccountRecoveryFloor`; if `ready`, forwards to `/workspace`; if `signed-out`, forwards to `/recovery`.
  3. Updated protected sanctuary pages (`workspace`, `community`, `profile`, `settings`, `self`, `library`) to route `entry.kind === 'inactive'` directly to `/account-recovery`, matching mobile `bootstrapRoutes` exactly.

---

## 2. Verification & Completion Matrix

| Finding ID | Component / File | Remediation Action | Verification Step |
|---|---|---|---|
| **FIND-01** | `apps/gurudevi-mobile/app/+native-intent.tsx` | Route invite intent to `/invitation-welcome?code=...` | Unit test / Deep link classifier test |
| **FIND-02** | `apps/gurudevi-web/app/(sanctuary)/community/page.tsx` | Accept `searchParams` and wire `inviteCode` | TypeScript build / Next.js type check |
| **FIND-03** | `apps/gurudevi-mobile/app/welcome.tsx` | Use `router.replace()` across milestone boundaries | Back-stack inspection |
| **FIND-04** | `apps/gurudevi-web/app/(sanctuary)/welcome/WelcomeStage.tsx` | Use `router.replace()` & persistent scaffold | Tab reload persistence |
| **FIND-05** | `packages/core/src/flows/entry/*` | Codify entry DAGs & register in `FLOW_REGISTRY` | `node scripts/audit-flow-dag.mjs` (0 findings) |
| **FIND-06** | `apps/gurudevi-web/app/(sanctuary)/account-recovery/*` | Create `AccountRecoveryFloor` & route inactive accounts | `pnpm --filter gurudevi-web exec tsc --noEmit` |
