# Plan 2: Feature Untangling (Layer 2)

*Objective: Untangle the horizontal "Spaghetti" inside L2 features (Classroom, Admin, People, Community, Profile).*

## 1. The L2 Rule
Packages in Layer 2 (e.g., accessed via a major App Tab) **MUST NOT** import each other directly. 

*If they do, changing an Admin hook could break the Classroom bundle, creating uncacheable, slow build structures and logical side-effects.*

## 2. Decoupling Classroom from Admin & People
*   **The Problem**: The `@repo/classroom` feature directly imports `@repo/admin` and `@repo/people` to interact with principal logic or user details.
*   **The Fix**: Use the **Slot & Protocol Pattern**.
    *   **Slot**: Instead of Classroom importing an `<AdminSettingsButton>`, Classroom exposes a slot: `adminSlot?: React.ReactNode`. The App Shell (`apps/gurudevi-mobile`) imports both and passes `AdminSettingsButton` into Classroom's slot.
    *   **Protocol (Hooks)**: If Classroom needs to know if the user is an Admin, it doesn't query the admin package. It queries `@repo/core` (`useGlobalAuth().role === 'ADMIN'`). 
    *   **Protocol (Events)**: To navigate to an Admin page from Classroom, Classroom fires an intent `nav:admin:dashboard`, which the Shell App router listens and responds to.

## 3. The `EntityView` Registry
Packages frequently need to display snippets of other packages (e.g., Profile showing Community Badges).
*   **The Fix**: The App Shell maintains a `ComponentRegistry`.
    *   When `@repo/profile` wants to show badges, it renders `<Slot name="CommunityBadges" userId={id} />` from `@repo/core`.
    *   The App Shell registers the actual `CommunityBadges` component into that core slot during initialization.
    *   This breaks the hard file-system import cycle entirely.

## 4. Verification
Run `npx madge --circular packages/classroom packages/admin packages/people packages/community packages/profile` to guarantee isolated silos.
