---
title: "Workspace and Navigation Philosophy"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, navigation, workspace, UX]
---

# Workspace and Navigation Philosophy

This document outlines the design, architecture, and structural philosophy of navigation and workspaces within Gurudevi Mobile.

---

## 1. Expo Router Integration

We use **Expo Router** as our file-based navigation engine. Navigation routes are declared statically inside the `app/` folder, which serves as the absolute route graph source of truth.

* **Domain Separation**: Domain packages under `packages/` (e.g. `@repo/self`, `@repo/classroom`) own the business logic, hooks, and feature screen components.
* **Composition**: The `app/` route files import and mount these domain screens. This structure keeps features modular and isolated, while routing configuration is kept centralized.

---

## 2. The Five Ecological Circles (Tab Structure)

The core interface is organized around five stable, ecological circles representing different facets of educational life:

1. **`self`**: The user's inner sanctuary. A private reflection space, wellness journaling, and personal settings (high-trust boundary).
2. **`workspace`**: The daily operational canvas for role-specific tasks.
3. **`community`**: Shared social spaces (bulletin boards, messaging, feeds).
4. **`library`**: Curated resources, curriculum assets, and lesson plan templates.
5. **`profile`**: Settings, role/perspective selector, and Thuthimal status indicators.

---

## 3. The "Workspace" Tab Nuance

Under the hood, the tab is mapped to `/app/(tabs)/workspace.tsx` (which renders the classroom/operational shell), but it is dynamically labeled in the UI based on the user's **Active Perspective** or **Capacity**:

| Role Capacity | Dynamic Tab Label | Rationale |
| :--- | :--- | :--- |
| **Founder** | **School** | Focuses on institutional multi-school parameters. |
| **Principal** | **My School** | Focuses on the holistic operations of their institution. |
| **Section Head** | **Section** | Focuses on the primary/secondary boundaries. |
| **Grade Head** | **Grade** | Focuses on coordinated grade levels. |
| **Teacher / Student** | **Classroom** | Focuses on student-teacher daily activities. |

This dynamic mapping realizes the philosophy of **"One Reality, Different Views"**—all users see the same underlying database, but interact with it using titles and dashboards that match their current relationship scope.

---

## 4. Personal Sanctuary vs. Institutional Workspace

* **Sanctuary Concept**: Every user has a default base home (Personal Sanctuary) tied to their primary capacity chosen during onboarding.
* **Institutional Bonds**: School or classroom bonds are layered on top of this personal base.
* **`PERSONAL_CLASSROOM`**: Serves as a legacy compatibility bridge. It acts as the default fallback workspace for users who do not have an institutional school or classroom bond yet (such as guests or new signups), ensuring the workspace tab doesn't break.
