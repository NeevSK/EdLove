---
title: "Expo Router Audit 2"
status: "active"
created: 2026-05-27
updated: 2026-05-27
author: "Naween"
tags: [reorganized]
---

# Expo Router Audit 2

## Updated conclusions after capacity clarification

- **Workspace is the only place where capacity switches.**
- **Workspace capacity is store-backed and URL-stable.**
- **Self is layered and identity-resolved, not workspace-capacity-resolved.**
- **Community, Library, and Profile remain undivided shells.**
- **Cedar remains the server authority; CASL is the client-side mirror.**

## What changes from the earlier audit

### Capacity in the URL
Do **not** encode Workspace capacity in the URL.

So these are no longer appropriate:
- `/workspace/[capacity]`
- `/workspace?capacity=teacher`

Workspace should remain:
- `/workspace`

### Self architecture
Self is not one undivided layer.
It is:
- Base Self
- Role Self layers for every role the identity holds

Self is resolved from identity context, not from Workspace active capacity.

### CASL recomputation
CASL should recompute when store capacity changes, not when route changes.

### Cold start behavior
Workspace cold start should be:
1. Resolve identity
2. Read primary capacity
3. Set active capacity in store
4. Mount `/workspace`

### Switching capacity
Switching capacity in Workspace should:
- update store state only
- re-render Workspace
- recompute CASL
- not affect any other tab

## Revised Expo Router target structure

```txt
app/
  _layout.tsx
  index.tsx

  (auth)/
    _layout.tsx
    welcome.tsx
    login.tsx
    onboarding.tsx
    invitation-welcome.tsx
    qr.tsx
    public-form/
      [slug].tsx
    thuthimal-claim.tsx

  (app)/
    _layout.tsx

    (tabs)/
      _layout.tsx

      self/
        _layout.tsx
        index.tsx
        ai-assistant.tsx

      workspace/
        _layout.tsx
        index.tsx
        classroom/
          index.tsx
          attendance.tsx
          gradebook.tsx
          timetable.tsx
          student-profile/
            [studentId].tsx
          content-library.tsx
        admin/
          index.tsx
          dashboard.tsx
          incident-queue.tsx
          tenant-detail/
            [tenantId].tsx
          authority-repair.tsx
          job-control.tsx
          audit-log.tsx
          release-control.tsx
        founder/
          index.tsx
          dashboard.tsx
          school/
            [schoolId].tsx
          school-creation.tsx
          school-forest.tsx
          principal-dashboard/
            [schoolId].tsx
        guardian/
          index.tsx
          dashboard.tsx
          students.tsx
          student-detail/
            [studentId].tsx
          notifications.tsx
          events.tsx
          communication-bridge.tsx

      community/
        _layout.tsx
        index.tsx
        announcements.tsx
        groups/
          [groupId].tsx
        chat/
          [conversationId].tsx
        direct-messages.tsx
        profile/
          [id].tsx

      library/
        _layout.tsx
        index.tsx
        map.tsx
        collections/
          [id].tsx
        document/
          [resourceId].tsx
        video/
          [resourceId].tsx
        review.tsx

      profile/
        _layout.tsx
        index.tsx
        full/
          [id].tsx
        settings.tsx
        privacy-ledger.tsx
        mute-hub.tsx
        public/
          [id].tsx

    modal/
      _layout.tsx
      create-group.tsx
      create-post.tsx
      social-shield.tsx
      comment-sheet.tsx
      breathing-reset.tsx
      app-settings.tsx
      notifications.tsx
```

## Layout guard placement

- `app/_layout.tsx`: providers and session bootstrap only
- `app/(auth)/_layout.tsx`: login, onboarding, invite flows
- `app/(app)/_layout.tsx`: authenticated app shell and primary capacity resolution
- `app/(app)/(tabs)/_layout.tsx`: tab chrome and tab visibility
- `app/(app)/(tabs)/workspace/_layout.tsx`: workspace capacity switch provider and CASL recomputation
- `app/(app)/(tabs)/community/_layout.tsx`: undivided community shell
- `app/(app)/(tabs)/library/_layout.tsx`: library shell
- `app/(app)/(tabs)/profile/_layout.tsx`: profile shell
- `app/(app)/modal/_layout.tsx`: route-based modal presentation

## Package mapping

- `packages/self` -> `app/(app)/(tabs)/self/*`
- `packages/community` -> `app/(app)/(tabs)/community/*`
- `packages/library` -> `app/(app)/(tabs)/library/*`
- `packages/profile` -> `app/(app)/(tabs)/profile/*`
- `packages/classroom` -> `app/(app)/(tabs)/workspace/classroom/*`
- `packages/admin` -> `app/(app)/(tabs)/workspace/admin/*`, `founder/*`, `guardian/*`

## Final recommendation

Expo Router migration should be treated as a routing boundary rewrite:
- URL for route identity
- store for Workspace capacity
- identity context for Self layering
- layouts for auth and policy guards
- domain packages remain route-agnostic
