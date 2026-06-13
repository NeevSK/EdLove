---
title: "Workspace and Navigation Philosophy"
status: "active"
created: 2026-06-09
updated: 2026-06-11
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, navigation, workspace, UX, expo-router, react-navigation]
---

# Workspace and Navigation Philosophy

This document outlines the design, architecture, and structural philosophy of navigation and workspaces within Gurudevi Mobile. It specifies how the core operational canvas is modeled and dispatched across different user capacities.

---

## 1. Expo Router Integration

We use **Expo Router** as our file-based navigation engine. Navigation routes are declared statically inside the `app/` folder, which serves as the absolute route graph source of truth.

*   **Domain Separation**: Domain packages under `packages/` (e.g. `@repo/classroom`, `@repo/admin`, `@repo/workforce`) own the business logic, hooks, and feature screen components.
*   **Composition**: The `app/` route files import and mount these domain screens. This structure keeps features modular and isolated, while routing configuration is kept centralized.

---

## 2. The Five Ecological Circles (Tab Structure)

The core interface is organized around five stable, ecological circles representing different facets of educational life:

1.  **`self`**: The user's inner sanctuary. A private reflection space, wellness journaling, and personal settings (high-trust boundary).
2.  **`workspace`**: The daily operational canvas for role-specific tasks. (Formerly the legacy `Classroom` tab in React Navigation).
3.  **`community`**: Shared social spaces (bulletin boards, messaging, feeds).
4.  **`library`**: Curated resources, curriculum assets, and lesson plan templates.
5.  **`profile`**: Settings, role/perspective selector, and Thuthimal status indicators.

### Product Rule: Workspace Is the Hub

`workspace` is the primary operational home, not a thin wrapper around classroom pages.

*   It should behave like a **dashboard / content hub** where users discover and launch the tools, features, and surfaces they need.
*   Classroom, admin, guardian, and other role-specific experiences are **workspace surfaces** or **workspace destinations**, not separate competing app homes.
*   If a user lands directly on a deep route, the fallback should generally resolve back to the relevant workspace hub, not to a generic browser-style previous page.
*   Mobile should still feel native, but the navigation meaning stays the same: workspace is the anchor, and the deeper screens are tools inside it.

> [!NOTE]
> For historical comparison and behavior verification, refer to the archived legacy React Navigation tab shell files:
> *   Native Shell: [TabNavigator.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/archives/navigation/TabNavigator.tsx)
> *   Web Shell: [TabNavigator.web.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/archives/navigation/TabNavigator.web.tsx)

---

## 3. The "Workspace" Tab Nuance: "One Reality, Different Views"

Under the hood, the workspace tab is mapped to `/app/(tabs)/workspace` as the directory root. However, the tab is dynamically labeled in the UI based on the user's **Active Perspective** or **Capacity**:

| Role Capacity | Dynamic Tab Label | Primary Dashboard Component | Target Route |
| :--- | :--- | :--- | :--- |
| **Founder** | **School** / **Platform** | `FounderDashboard` (`@repo/admin`) | `/workspace/founder` |
| **Principal** | **My School** | `PrincipalDashboard` (`@repo/admin`) | `/workspace/principal` |
| **Section Head** | **Section** | `SectionHeadDashboard` (`@repo/admin`) | `/workspace/section-head` |
| **Grade Head** | **Grade** | `GradeHeadDashboard` (`@repo/admin`) | `/workspace/grade-head` |
| **Teacher** | **Classroom** | `ClassroomScreen` (`@repo/classroom`) | `/workspace/classroom` |
| **Student** | **Classroom** | `StudentDashboard` (`@repo/classroom`) | `/workspace/classroom/student` |
| **Guardian** | **Workspace** | `GuardianDashboard` (`@repo/admin`) | `/workspace/guardian` |

> The label may still say "Classroom" for some capacities, but the routing philosophy stays anchored in `workspace` as the canonical home. Classroom is a surface inside the workspace model, not a separate navigation root.

### Perspective Dispatcher & Switching Pattern
To support these dynamic dashboards without polluting the route tree with conditional navigator hacks, the system implements a two-fold approach:

1. **The Dispatcher (`app/(tabs)/workspace/index.tsx`)**: Reads the active capacity from the ReBAC permission context (`usePermissions()`) and dynamically redirects the user:
```tsx
import { Redirect } from 'expo-router';
import { usePermissions } from '@repo/core/logic';
import { Spinner, Center } from '@repo/ui/primitives';

export default function WorkspaceDispatcher() {
  const { context, loading } = usePermissions();

  if (loading) {
    return (
      <Center className="flex-1 bg-obsidian">
        <Spinner />
      </Center>
    );
  }

  const capacity = context.activeBond?.capacity || context.primaryCapacity;

  if (capacity === 'founder') return <Redirect href="/workspace/founder" />;
  if (capacity === 'principal') return <Redirect href="/workspace/principal" />;
  if (capacity === 'gradeHead') return <Redirect href="/workspace/grade-head" />;
  if (capacity === 'sectionHead') return <Redirect href="/workspace/section-head" />;
  if (capacity === 'student') return <Redirect href="/workspace/classroom/student" />;
  if (capacity === 'guardian') return <Redirect href="/workspace/guardian" />;
  
  return <Redirect href="/workspace/classroom" />;
}
```

2. **The Perspective Switcher Component (`<PerspectiveSwitcher />`)**:
   For users possessing multiple institutional bonds (e.g. a user who is both a **Principal** and a **Teacher** at the same school), a switcher selector is rendered in the header or top bar of the active Workspace.
   *   **Logic**: It reads `availableBonds` from the global store. If `availableBonds.length > 1`, it renders a dropdown trigger showing the active perspective name.
   *   **Interaction**: Tapping it displays a clean bottom sheet or dropdown containing other available bonds.
   *   **State Mutation**: Choosing an option updates the active bond state (`useStore.setState({ activeBond })`), triggering a recalculation of permissions and forcing the Perspective Dispatcher to re-route to the newly selected dashboard path automatically.

---

## 4. Workforce Tab vs. Workspace Tab

It is critical not to confuse the **Workspace** tab with the **Workforce** feature:
*   **Workspace Tab**: The primary, multi-role tab containing the classrooms, dashboard logs, and administration operations. It is supplied by `@repo/classroom` and `@repo/admin`.
*   **Workforce Feature**: An experimental institutional human-capital tool (`@repo/workforce`). In the legacy navigation shell, this was a conditional 6th tab gated behind the `isDevelopingWorkforce` feature flag. In Expo Router, if enabled, it can be mounted as a sub-path (e.g. `/workspace/workforce`) or dynamic screen option rather than hijacking the main workspace root directory.

---

## 5. Personal Sanctuary vs. Institutional Workspace

*   **Sanctuary Concept**: Every user has a default base home (Personal Sanctuary) tied to their primary capacity chosen during onboarding.
*   **Institutional Bonds**: School or classroom bonds are layered on top of this personal base.
*   **`PERSONAL_CLASSROOM`**: Serves as a legacy compatibility bridge. It acts as the default fallback workspace for users who do not have an institutional school or classroom bond yet (such as guests or new signups), ensuring the workspace tab doesn't break.

---

## 6. Workspace Canvas & Presentation Layer Separation

To achieve rearrangeable and customizable dashboards, we utilize the **Workspace Canvas** (`<WorkspaceCanvas />` / `ResponsiveWorkspaceCanvas` from `@repo/ui`) components. It is critical to separate the concerns of routing from the concerns of layout presentation:

*   **Routing (Expo Router)**: Resolves **which** dashboard route to open based on the URL and active role (e.g. `/workspace/principal`).
*   **Presentation (Workspace Canvas)**: Dictates **how** that specific dashboard renders its internal content widgets (e.g. list of classes, logs, analytics cards) and allows the user to rearrange them on their screen.
*   **Independence**: The drag-and-drop panel rearrangement logic lives entirely inside the presentation component layer in `@repo/ui` and does not affect the Expo Router filesystem routes. Dashboard routes simply mount their respective screen packages, which leverage the `WorkspaceCanvas` to lay out their dashboard panels.
