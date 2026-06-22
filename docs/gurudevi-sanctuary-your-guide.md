# Gurudevi — Sanctuary Permission System: Your Guide
> June 2026
> Not for agents. For you — what to hold, what to watch, what to question.

---

## The Shape to Hold

Three gates. One function. One guard.

```
citizenship → entitlement → Cedar → feature flag
```

That order is the architecture. If you ever see permission logic that doesn't fit this sequence — something checking pricing inside Cedar, something checking role inside feature flags, something checking citizenship inside the entitlement port — that's drift. Name it immediately and fix it before it compounds.

The four axes are independent. A feature can be:
- `beta: true` AND require `PRO` entitlement
- Available to `WANDERER` AND require a Cedar structural check
- Require `FIRST_CLASS` citizenship AND be in `development` flag state

They never imply each other. When something feels tangled, ask: which axis does this belong to?

---

## The Citizenship Model — Hold This Precisely

```
1 — WANDERER     Guest. Supabase anon. Exploring.
2 — SECOND_CLASS Signed up. Personal use. Not in a school.
3 — FIRST_CLASS  In a school. The intended user.
```

Citizenship is NOT pricing. A `SECOND_CLASS` user can be `PRO` tier on a personal workspace. A `FIRST_CLASS` user can be `FREE` tier in a school. They're independent axes that agents will constantly try to collapse. Watch for this.

The citizenship → prompt mapping matters for UX:
- `WANDERER` failing → "Create an account"
- `SECOND_CLASS` failing → "Join a school"
- Never show an upgrade prompt for citizenship failure. It's not a money question.

---

## Cedar Is the Capacity/Role System

There is no separate "role check" or "capacity check" in the permission pipeline. Cedar already knows the principal's bond capacity (teacher, student, parent, principal, founder, admin) as an entity attribute. It evaluates structural relationships.

When an agent proposes adding a capacity check before Cedar — "first check if they're a teacher, then run Cedar" — that's redundant. Cedar does the teacher check. Push back.

The only things before Cedar are citizenship (is this user real enough?) and entitlement (has the tenant paid?). Both are cheaper than WASM and both can prevent unnecessary Cedar evaluation.

---

## What SanctuaryFeature Actually Does

`sanctuaryFeature()` is a pure function. No React, no side effects, fully testable. It takes a context (already evaluated citizenship, Cedar decision, etc.) and a requirement, and returns a typed result.

`useSanctuaryFeature()` is the hook. It reads from Zustand and calls `checkLocalPermission` against the Cedar snapshot, then calls the pure function.

`can()` is kept as a boolean shorthand. It's a one-liner that calls `useSanctuaryFeature`. It exists so existing call sites don't all need to change at once. Over time, components that need to know *why* something is denied will migrate to calling `useSanctuaryFeature` directly.

`SanctuaryGuard` is the component. It renders children or the appropriate gate UI based on the reason. You never need to think about which prompt to show — the guard handles it.

---

## Warning Signs to Watch For in Agent Output

**Pricing tier inside Cedar policies:**
```
// RED FLAG — agent wrote this:
when { context.subscription_tier == "PRO" }
```
Cedar sees structural attributes only. Pricing is resolved before Cedar runs. Tell the agent to remove it and handle it in `IEntitlementPort`.

**`isPro` or `isProMember` in feature flags:**
```typescript
// RED FLAG:
resolveFeatureFlags({ pricing_tier: 'PRO', ... })
// returns: { isPro: true, isInventoryEnabled: true }
```
Feature flags describe deployment state. Entitlement describes what's paid for. These are never the same question.

**Citizenship check inside Cedar:**
```
// RED FLAG:
when { principal.citizenship == "FIRST_CLASS" }
```
Citizenship is a pre-Cedar gate. By the time Cedar runs, citizenship has already passed. Cedar doesn't need to know it.

**`permissionsMap` anywhere:**
```typescript
// RED FLAG:
permissionsMap[subject][action]
```
This is the deleted CASL shim. If an agent produces this, they're using old context. Show them the agent execution guide.

**`can()` reading from a flat map:**
```typescript
// RED FLAG:
const isAllowed = someMap[subject]?.[action]
```
`can()` calls `useSanctuaryFeature` after the refactor. No flat map. No cached result from an external system.

**Hybrid guard component:**
```tsx
// RED FLAG:
<FeatureGuard feature="isProMember" action="manage" subject="Attendance">
```
`FeatureGuard` is deleted. `SanctuaryGuard` handles everything. Flags and Cedar are not checked in the same component prop.

**Silent `false` on initialization failure:**
```typescript
// RED FLAG:
if (!permissionsMap) return false
```
Initialization failure is `{ permitted: false, reason: 'not_initialized' }`. It's explicit, named, and renders a loading state — not a silent permission denial.

---

## What's Intentionally Deferred

**Route-level guards in Expo Router.** Currently all gating is component-level. This is fine for now. When Expo Router middleware becomes stable and you have clear route-protection requirements, `SanctuaryGuard` logic can be lifted to the route level without rewriting — the evaluation function is pure and portable.

**`can()` call site migration.** After the refactor, `can()` still exists as a boolean shorthand. Components that only need `true/false` don't need to change. Only components that need to render different UI based on the *reason* for denial should migrate to `useSanctuaryFeature` directly. Don't force-migrate everything at once.

**GrowthBook full integration.** `IFeatureRolloutPort` is the port. The adapter pointing to GrowthBook SDK is wired in when GrowthBook is confirmed as the tooling. Until then, the port exists and the adapter is a stub that reads from `storage` (MMKV flag cache). The evaluation pipeline doesn't change when the adapter is swapped.

**Per-resource Cedar evaluation in the UI.** Currently `useSanctuaryFeature` evaluates against the subject type, not a specific resource instance. For most UI gating (show/hide a button) this is correct — you're asking "can this user manage attendance at all", not "can they manage attendance for classroom X". The capability token system (see ADR-004) handles specific resource permission in the write path. Don't conflate UI visibility checks with write-path authorization.

---

## How This Connects to the Data Lifecycle

The permission system shares infrastructure with the data layer. These are the connections to remember:

**Cedar snapshot = Zone A SQLite.** The same snapshot that gates UI visibility via `useSanctuaryFeature` is the same snapshot that gates writes via `SecureDrizzleProxy`. They're never out of sync because they're the same file, same row, same data.

**Policy version = Zone A PowerSync sync.** When server policies change, PowerSync propagates the change in real time. The UI re-evaluates immediately. Capability tokens are invalidated. This happens automatically — you don't need to trigger it.

**Pricing manifest = Zone A SQLite.** Same pattern as Cedar snapshot — server-signed, locally cached, version-invalidated. `IEntitlementPort` reads from this table. Never from a hardcoded TypeScript object.

**WANDERER can't create outbox entries.** Citizenship gate runs before the Zone B/C write flow too. A guest user who somehow reaches the write path will be caught at citizenship level 1. The outbox is only for users who have enough citizenship to actually send things.

**Boot sequence matters.** Cedar snapshot loads at step 5 of boot hydration. Until it loads, `useSanctuaryFeature` returns `not_initialized`. The UI shows a loading state — not a permission denial, not a crash. Agents will sometimes try to short-circuit this with a default state. Don't allow it.

---

## The Question to Ask When Something Feels Wrong

> "Which gate does this belong to, and is it in the right place?"

Citizenship, entitlement, Cedar, or feature flag. One of four. If the answer is unclear, that's the signal to pause and figure it out before writing code. The tangle you're cleaning up came from not asking this question consistently.

---

*Keep this close during the refactor. The agent guides are for agents. This is for the architect.*
