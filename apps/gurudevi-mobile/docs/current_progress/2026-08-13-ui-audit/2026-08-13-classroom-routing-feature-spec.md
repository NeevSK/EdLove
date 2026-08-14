---
title: "Classroom Selection Routing Feature Spec"
status: "draft"
created: 2026-08-13
updated: 2026-08-13
author: "Codex"
tags: [gurudevi, classroom, routing, regression, feature-spec]
---

# FEATURE SPEC: Classroom Selection Routing Contract

## Blast Zone

AMBER — `packages/classroom/src/screens/` and workspace navigation helpers.

## Target Files

- `apps/gurudevi-mobile/app/(tabs)/workspace/index.tsx`
- `packages/classroom/src/screens/StudentDashboard.tsx`
- `packages/classroom/src/screens/TeacherDashboard.tsx`
- `apps/gurudevi-mobile/src/__tests__/architecture/student-workspace-classroom-id-regression.test.ts`

## Reuses

- Expo Router absolute route references.
- `useLocalSearchParams` in destination dashboard screens.
- Existing `classroomId` and `classroomName` route parameter contract.
- Existing classroom entrypoint architecture tests.

## Does Not

- Change database schemas, permissions, or sync behavior.
- Add inline authentication checks.
- Redesign the workspace canvas.
- Change native build artifacts or dependency versions.

## Acceptance Criteria

1. A selected classroom ID is passed from the list action to the route.
2. The dispatcher preserves that ID for teacher and student destinations.
3. Destination screens consume the ID through route params.
4. A regression test proves classroom A and classroom B do not collapse into the same destination data.
5. Existing route architecture tests remain green.

## Complexity Budget

Keep the implementation under 80 changed lines and cognitive complexity below 15 per function.
