# Gurudevi Mobile Navigation Architecture

This document is the shared mental model for navigation in `gurudevi-mobile`.

## Core Idea

Expo Router owns the live route graph, and `app/` is the source of truth.
React Navigation remains only as an internal dependency of Expo Router and a few legacy compatibility surfaces outside the live shell.

The domain model still matters, but it now maps onto route files and route groups.

This app is also a sanctuary/ecosystem, not just a set of screens.
The route shell should reflect that ecosystem rather than flattening everything into one generic navigator.

## Mental Model Bridge

### Old model

- Domain-oriented packages own screens, hooks, components, and flows.
- `packages/core`, `packages/ui`, `packages/self`, `packages/community`, `packages/classroom`, `packages/library`, `packages/profile`, `packages/admin`, and `packages/workforce` still own the feature logic.
- `app/` is now the live shell and route graph.

### Historical evolution

The navigation model changed in phases:

- Phase 1: the app was effectively teacher-first.
- Phase 2: `self`, `classroom`, and `community` became the primary tabs.
- Phase 3: principal and student experiences were added, while the tab label and content for `classroom` began to vary by role.
- Phase 4: the app moved toward Cedar-style ReBAC plus ABAC, so users could hold multiple relationships instead of one fixed role.
- Phase 5: the current model treats the whole app as the sanctuary/ecosystem, with one primary/default bond and several possible bonds.

That history matters because a lot of older code still reflects the earlier phases.
When reading old docs or old route names, prefer the latest intent over the legacy wording.

### New Expo Router model

- `app/` defines the URL and screen tree.
- Route files decide which domain package renders inside the route.
- Layout files define structural shells:
  - root shell
  - tabs shell
  - modal shell
  - nested stacks when needed

## Route Ownership Rules

- Keep screens in domain packages when they are reusable business views.
- Put route composition in `app/`.
- Put cross-cutting shell logic in `app/_layout.tsx`.
- Put tab composition in `app/(tabs)/_layout.tsx`.
- Put modal composition in `app/(modal)/_layout.tsx`.

## Identity And Nav Vocabulary

These terms are easy to blur, so this doc should own the definitions.

- `Bond`: a stored relationship fact between the user and an entity.
- `availableBonds`: the set of bonds the user can currently act through.
- `activePerspective`: the chosen identity lens for the session.
- `activeBond`: the currently selected bond that drives permissions and screen behavior.
- `capacity`: the human-readable capability/role label derived from the active bond.

The code still has some overlap in how these terms are used, so treat this section as the canonical reading guide.

### Workspace selection versus active perspective

`activePerspective` is best understood as the state that drives workspace switching and identity lens changes.
It is not just a generic auth flag.

In current code, `setPerspective()` updates the selected bond, and the workspace switcher uses that selected context to decide which operational surface should open.
So the clean reading is:

- onboarding chooses the default bond
- workspace switching changes the active perspective
- active perspective selects the active bond used by permissions and UI

That is why `activePerspective` belongs closest to workspace switching, even though it is stored in auth state.

## Current Route Intent

### Tabs

The main mobile tabs are:

- `self`
- `workspace`
- `community`
- `library`
- `profile`

These represent the primary ecological circles of the app and should stay stable.

### What each tab means

- `self`: the user’s base sanctuary identity space, with the current bond plus other bonds surfaced inside the screen.
- `workspace`: the operational canvas for role-specific daily work. On mobile today, this route renders the classroom shell, but the deeper workspace concept is larger than classroom alone.
- `community`: shared social surfaces such as groups, DMs, and feed. This stays combined because role switching inside community would create unnecessary friction.
- `library`: shared learning/resource surfaces. It is currently mostly role-agnostic, but it may become role-aware later.
- `profile`: identity, account, and personal settings. On mobile, settings currently live here because the surface area is tighter.

### Sanctuary, personal sanctuary, and onboarding

The sanctuary is the app/web itself: the full ecosystem shell.
It is the always-present home that every user enters first.

The clean model is:

- every user gets access to the sanctuary app shell
- onboarding chooses the user’s primary bond
- that primary bond determines the type of the user’s personal sanctuary entity
- institutional bonds can be added later without removing the sanctuary

We should think of the sanctuary as the full platform shell and the user’s personal sanctuary as the first owned entity inside it.
That personal sanctuary is not the user themselves, and it is not the institution either.
It is the user’s default home surface, shaped by the primary bond chosen in onboarding.

If we model the personal sanctuary explicitly, the onboarding-selected primary bond becomes the seed for that entity’s first bond and type.
That means:

- a student onboarding creates a student-typed personal sanctuary
- a teacher onboarding creates a teacher-typed personal sanctuary
- a parent onboarding creates a parent-typed personal sanctuary

This also implies a clear mapping between the user record and the personal sanctuary record:

- `user.uuid` identifies the person
- `personalSanctuary.uuid` identifies the user-owned sanctuary entity
- the two are linked, but they are not the same thing
- the bond connects the user to that sanctuary entity and gives it its initial capacity/type

The first bond becomes the default bond the whole app treats as primary until the user intentionally switches to another bond.

### After onboarding

The intended flow is:

1. user finishes onboarding
2. onboarding writes or resolves the user’s default capacity
3. the system creates or resolves the personal sanctuary entity for that capacity
4. a default bond is attached to that entity
5. the default bond becomes the primary bond for app startup
6. later institutional bonds can be added without changing the existence of the sanctuary

This gives us a stable "home first" model while still allowing institutional identities to join later.

### What the app should do with the default bond

Once onboarding has chosen the default bond:

- `availableBonds` should include it
- `activeBond` should start from it
- `activePerspective` should treat it as the initial working lens
- the whole app should treat it as the user’s primary bond until explicitly changed

That means the app should not force the user to choose between “being a person” and “being a teacher/student/parent”.
The sanctuary is the base identity layer, and institutional membership is added on top.

### What happens to `PERSONAL_CLASSROOM`

`PERSONAL_CLASSROOM` can be retained as a transitional implementation detail, but its meaning should shift.

Recommended interpretation:

- it is the technical bridge for the user’s personal sanctuary
- it is created from the onboarding-selected capacity
- it gives the app a concrete entity to attach the first bond to
- it is not the conceptual end state

So the flow becomes:

1. onboarding captures the user’s initial capacity
2. the backend creates or resolves the user’s personal sanctuary entity
3. a default bond is attached to that entity
4. the app boots into that bond as the primary home context
5. later institutional bonds can coexist with that personal base

### Canonical target model

If we decide to make this explicit in the data model, the preferred shape is:

- `sanctuary` as the app-wide home concept
- `personalSanctuary` as the user-owned entity inside that home
- `primaryBond` as the onboarding-selected default bond
- `primaryBondType` as the capacity/type that defines the personal sanctuary experience
- `activeBond` as the currently selected relationship to that entity
- `availableBonds` as the set of all relationships the user can switch to
- `activePerspective` as the current working lens over those bonds

That keeps the platform, the user’s personal base, and institutional participation separate without losing the "one home first" philosophy.

### Workspace nuance

`workspace` is both:

- a top-level route tab in `app/(tabs)/workspace.tsx`
- a deeper domain concept in `packages/core/src/logic/workspace/*`

The route currently renders `ClassroomScreen`, but the workspace domain can switch between operational dashboards and surfaces:

- founder workspace
- admin workspace
- principal operations
- teacher workspace
- student workspace
- guardian workspace

That switcher exists so we can separate concerns:

- the tab answers: “which high-level ecological circle am I in?”
- the workspace switcher answers: “which operational dashboard inside that circle am I using right now?”

### Profile and settings

- On mobile, settings live with profile because the screen budget is tight.
- On web, settings can be separated more cleanly because the layout has more space.
- Expo Router handles this by route structure, not by a custom tab navigator.

### Notifications

- On mobile, notifications can be treated as a modal or a top-level route depending on the UX need.
- On web, notifications can be a first-class route or panel because there is more surface area.

### Auth and onboarding

- `welcome`, `auth`, and `onboarding` are gating routes.
- They belong near the root shell because they decide whether the user enters the app or not.

### Deep links

- Deep links should map directly to routes when possible.
- If a deep link needs a payload, pass it through route params.
- Avoid an imperative navigation ref unless there is no route-first alternative.

## Expo Router Rules We Are Following

- Use `useRouter()` for imperative route changes.
- Use `router.replace()` for auth gates and redirects.
- Use `router.push()` for normal forward navigation.
- Use `<Link />` for declarative navigation.
- Use `<Redirect />` for immediate route decisions.
- Avoid `NavigationContainer` in Expo Router app code.
- Avoid `createBottomTabNavigator` and `createNativeStackNavigator` in live route composition.
- Keep React Navigation-specific imports out of shared packages that render inside the live route tree.

## Why This Fits The Domain Packages

The app is still domain-driven:

- `packages/self` owns self-space screens and logic.
- `packages/community` owns community flows.
- `packages/classroom` owns classroom/workspace flows.
- `packages/library` owns resource flows.
- `packages/profile` owns profile flows.
- `packages/ui` owns shared UI and lightweight generic screens.
- `packages/core` owns identity, permissions, and workspace switching logic.

Expo Router does not replace that architecture.
It only changes where the route decision lives.

## Practical Mapping

- Domain package exports screen components.
- Route files in `app/` import those screens.
- Layout files decide where the screen sits in the route hierarchy.
- Shared route-gating logic stays close to the root layout.
- Identity selection should happen in the core layer, not inside route files.
- Route files should read the selected identity state and render the right domain package, rather than reimplementing identity logic themselves.

## What The Code Currently Shows

### Current route files

- `app/(tabs)/self.tsx` renders `SelfScreen`.
- `app/(tabs)/workspace.tsx` renders `ClassroomScreen`.
- `app/(tabs)/profile.tsx` renders `ProfileScreen`.
- `app/(tabs)/community.tsx` and `app/(tabs)/library.tsx` should stay aligned with the same route-first model.

### Current identity store

- `packages/core/src/logic/store-slices/auth.slice.ts` stores `activeBond`, `availableBonds`, and `perspective`.
- `setAvailableBonds()` currently defaults `activeBond` to the first available bond.
- `setPerspective()` currently updates `activeBond` from `perspective?.activeBond`.

### Current onboarding and identity bootstrap

- `packages/core/src/api/handlers/identity.ts` resolves the current identity payload and includes `activeBond`, `availableBonds`, and `personalClassroom`.
- For anonymous users, it fabricates a guest bond on the `PLATFORM` entity.
- For signed-in users with no institutional bonds, it can fabricate a `PERSONAL_CLASSROOM` bond so the app still has a usable default workspace context.
- `packages/core/src/adapters/supabaseIdentity.adapter.ts` follows the same idea and maps the server payload into `activeBond` and `availableBonds`.

This is the part that currently carries the “personal classroom” workaround.
It is useful as a bridge, but it is not the cleanest long-term model if we want sanctuary to be the universal default and institutional access to be layered later.

### Current permissions usage

- `packages/core/src/logic/permissions/hooks/usePermissions.ts` builds the canonical `UserContext`.
- `activeBond` drives `capacity`, `schoolId`, `classroomId`, and `hasGlobalAccess`.
- `availableBonds` is surfaced as `bonds` and also provides `primaryCapacity`.
- `packages/core/src/lib/permissions.ts` still prefers `activeBond` for capacity resolution.

### Current workspace switching

- `packages/core/src/logic/workspace/workspaceSwitcher.ts` resolves the higher-order dashboard targets.
- It distinguishes founder, admin, principal, teacher, student, and guardian workspace modes.
- Teacher and student currently collapse into the classroom tab destination, while founder/admin/principal/guardian are separate operational routes.
- `Perspective` in [`packages/core/src/types/Identity.ts`](C:/Users/Naween/projects/polymath-platform/packages/core/src/types/Identity.ts) still models `activeBond` plus `availableBonds`, which means the “workspace lens” and the “identity selection” are still partly merged in the type system.

### Current UI surfaces

- `packages/ui/src/components/workspace/CanvasSurfaceCard.tsx` treats workspace as a rendered operational surface, not just a tab label.
- The owner labels there show that workspace content belongs to multiple packages, not only classroom.

## What To Do With Personal Classroom

The current `PERSONAL_CLASSROOM` idea is understandable, but it is doing too much work.

It is currently acting as:

- the user's default sanctuary
- the first workspace-like surface
- a fallback when no school/classroom exists

That makes it confusing because it mixes two separate things:

- a personal default home
- an institutional operational container

The cleaner target model should separate them:

- `sanctuary`: the user’s default base home, always present
- `institutional workspace`: opened when the user has school/classroom context
- `activePerspective`: selects which of those operational spaces is active

If we keep `PERSONAL_CLASSROOM` at all, it should be documented as a temporary compatibility bridge, not as the conceptual core.

## Multiple Dashboards For The Same Role

If a role needs both a personal and an institutional dashboard, the role itself is not enough to select the surface.
We would need the perspective to carry the target scope as well.

For example:

- teacher + personal sanctuary dashboard
- teacher + institutional classroom dashboard

In that model, `capacity` says what the user can do, while `activePerspective` says where they are doing it.

That is the cleanest way to keep the same role from splintering into confusing route logic.

## Important Notes

- Route names should be stable and simple.
- Route group names like `(tabs)` and `(modal)` are structural, not URL segments.
- If a screen starts feeling too complex to fit in one route file, keep the route file thin and move behavior back into the domain package.
- If we need to explain a flow more than once, add it here instead of repeating it in chat.
- If a legacy document says "classroom" but the intent is actually the broader workspace or school-operational surface, prefer the broader current meaning.

## Suggested Next Additions

- A route map table from old React Navigation names to Expo Router paths, kept only for archive reference.
- A section for deep-link payload conventions.
- A section for web-vs-mobile divergence, especially settings and notifications.
- A route ownership matrix for each domain package.
- A glossary section for bond/perspective/capacity with examples from the code.
- A migration note that marks `PERSONAL_CLASSROOM` as legacy if we decide to move fully to sanctuary-first semantics.
