---
name: user-journey-orchestration
description: >
  Master engineering playbook for multi-vector screen entry, admission guards,
  branched flow DAGs, and journey governance across Gurudevi & EdLove.
  Enforces the Actor-Authority/Passive Router pattern, Intent Resolution pipelines,
  and FlowDAG verification. Activate when creating, modifying, or reviewing any user-facing screen,
  auth gate, onboarding wizard, deep link handler, or navigation transition.
---

# User Journey Orchestration & Multi-Vector Screen Architecture

You are operating inside the **Gurudevi & EdLove multi-platform ecosystem** (Next.js 16 Web + Expo 58 React Native).
This skill provides the definitive engineering framework to ensure screens and user journeys never rot, drift, or break across ingress vectors.

---

## 1. Cardinal Law: The Router Is a Passive Projection

In our architecture, **the router does not make journey or security decisions**.
- `expo-router` (`app/*.tsx`) and Next.js App Router (`app/(sanctuary)/*`) are strictly **passive view displays**.
- Journey logic, preconditions, step sequences, and branching decisions belong in **Declarative Flow DAGs** (`packages/core/src/flows`).
- Screens must NEVER call ad-hoc `router.push('/some-other-screen')` based on component-local assumptions without verifying the flow contract.

---

## 2. The 4 Dimensions of Every Screen

Before authoring or editing any screen component, evaluate the 4 topological dimensions:

```
[1. Inbound Ingress Vectors]
   ├── Cold OS Boot (app launch)
   ├── Deep Link / Universal Link (gurudevi://, https://...)
   ├── Push Notification Tap
   ├── Optical QR Scan (sneakernet / camera)
   ├── In-App Nav (Tabs / Breadcrumb / Command Palette)
   └── Auth / OAuth Callback

[2. Admission Preconditions (Guards)]
   ├── Auth Guard (Has valid session? If not -> stash intent in redirect buffer -> bounce to /auth)
   ├── Role/Bond Guard (Has capacity? Student != Teacher != Principal -> fail closed if unauthorized)
   └── Data Prerequisite (Has active tenant/school? If not -> render Day-0 Empty Scaffold)

[3. Branched Pathways (Internal DAG)]
   ├── Primary Happy Path
   ├── Demo / Guest Exploration (Tutii companion mode, zero-write mock state)
   └── Offline / Failure Mode (Outbox pending queue, retry prompt)

[4. Terminal Convergence (Exit State)]
   ├── Active Circadian Floor (/(tabs)/workspace or /(sanctuary)/workspace)
   ├── Sensory Profile (Tutii glow, chime, haptics)
   └── Reactive Scaffold Dismissal (useScaffoldDismissal auto-dismisses Day-0 UI)
```

---

## 3. Real-World Lessons & Common Pitfalls (What to Avoid)

| Pitfall / Anti-Pattern | Why It Breaks | Required Implementation Pattern |
|---|---|---|
| **Deep Link Crash on Cold Boot** | Leaf screen queries data before Auth session hydrates. | Use `PendingIntentQueue`. Hold deep link until `authSession.status === 'ready'`. |
| **Back-Button Trap on Android** | Pushing (`router.push`) through onboarding steps traps users in an infinite back loop. | Always use `router.replace()` across lifecycle milestone boundaries (e.g. Auth $\to$ Onboarding $\to$ Workspace). |
| **OAuth Callback Form Loss** | User fills out half a school registration, leaves for Google OAuth, and returns to a wiped form. | Persist in-flight draft to `StorageManager` before initiating external OAuth redirect. |
| **Ghost Route / Unwired Screen** | Screen file exists in `app/`, but has no trigger, button, or deep link leading to it. | Every screen in `app/` must be registered in a `FeatureJTBDGraph` in `packages/core/src/flows/`. |
| **Zombie Onboarding Banners** | Experienced users still see "Welcome, create your first class!" after 6 months. | Use `useScaffoldDismissal(key, threshold)` from `@repo/core`. Automatically dismisses upon 1st completed mutation. |
| **Inactive Account Dead-End Loop** | Inactive accounts on Web are trapped on inline error cards with no sign-out, or sent to password reset. | Separate Credential Recovery (`/recovery`) from Account Lifecycle Recovery (`/account-recovery`). Provide sovereign sign-out and retry actions. |

---

## 4. Operational Workflow for Creating or Modifying Screens

### Step 0: Ground the existing product

Before defining a journey, designing a screen, or writing code, load [brownfield-feature-integration](../brownfield-feature-integration/SKILL.md). Classify the domain, surface and supporting systems separately; trace the user's existing intent, roles, authority, lifecycle, flows and implementations. A new web page can still be a brownfield migration of an existing mobile feature. Record confirmed behavior, integration points, invariants and unresolved questions in the journey contract where supported. Do not infer that a personal account or selected personal scope grants a personal institutional role.

When the Product and Journey Catalog is requested or contains the relevant feature, load [product-journey-catalog](../product-journey-catalog/SKILL.md) to inspect its intent, implementation links and evidence. A PJC record does not replace the flow contract or server authorization.

### Step 1: Declare or Update the Flow Contract
Before touching JSX or routing code:
1. Locate or create `packages/core/src/flows/<domain>/<feature>.flow.ts`.
2. Define the `FeatureJTBDGraph`:
   - `triggers`: Inbound buttons, deep link regex, notifications.
   - `nodes`: Steps, titles, `mobileRoute`, `webRoute`, `primaryAction`, and `fallbacks`.
   - `completion`: Sensory profile, `scaffoldDismissalKey`.
3. Register the flow in `packages/core/src/flows/index.ts` under `FLOW_REGISTRY`.

### Step 2: Validate the Flow DAG
Run the monorepo FlowDAG audit:
```powershell
node scripts/audit-flow-dag.mjs
```
Ensure:
- 0 route mismatches.
- 0 broken fallback edges.
- At least one terminal success node exists.

Inspect the audit implementation and report before making those claims: the current script inventories routes and flow files and does not establish route matching, fallback integrity, cycles or reachability. Validate the particular contract and behavior with applicable tests; do not interpret an empty findings array as proof. Preserve any existing user-modified audit report when running the script.

### Step 3: Implement the Screen UI
- In the screen component, connect to the declared flow step.
- Protect admission using central guards (`useAuth`, `usePermissions`).
- On completing actions, increment the scaffold counter:
  ```typescript
  const { incrementAction } = useScaffoldDismissal('my_feature_scaffold', 1);
  await handleSave();
  incrementAction();
  ```

