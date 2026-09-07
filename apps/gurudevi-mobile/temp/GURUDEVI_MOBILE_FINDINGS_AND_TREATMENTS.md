# Gurudevi Mobile — Findings & Treatments
**Structural audit (the "atoms" layer) — snapshot 2026-08-31**

This document covers the *static/structural* pass: what exists, what's
duplicated, what's slow to boot, what's mis-wired at the file level. It does
**not** cover sequencing/timing/experience-over-time — that's the companion
doc, `GURUDEVI_TEMPORAL_FLOW_AUDIT.md`, which is the audit you actually asked
for. Read this one for the concrete, fixable, mostly-independent items;
read that one for how things behave *together, over time*.

Every finding below is grounded in a specific file/line/package from the
`EdLove-expo-57-merge-ui-dev1.zip` snapshot (2026-08-31) — not general
best-practice guessing. Where your own repo's docs already found the same
thing, that's cited instead of re-diagnosing it.

---

## 0. Headline

You already have a dated, structured internal plan — **"Beast Master Plan"**
(`docs/current_progress/2026-08-28-beast-master-plan.md`), written 3 days
before this snapshot — that targets cold-start TTI, bundle size, and several
of the redundancies below. It hasn't been executed (baseline still `TBD`).
**The single highest-leverage next action is running its P0 baseline
measurement**, not writing a new plan. Everything below either sharpens
that plan or adds items it missed.

---

## 1. Initialization / Cold-Start (TTI)

**Finding:** `app/_layout.tsx` is 781 lines. It mounts **13 nested
providers** and fires **13 `useEffect`s** on boot.

**Already fixed (real, dated, working):** Sentry + PostHog init are
deferred via `requestIdleCallback`, with an inline comment claiming
*"saves 80–150ms on cold start."* This is genuine prior optimization —
don't undo it.

**Still on/near the critical path (not yet addressed):**
| Item | Where | Why it matters |
|---|---|---|
| `warmCedarWasm()` | `app/_layout.tsx` (AppContent effect) | Loads a WASM authorization engine before the permission system is trustworthy |
| `refreshPermissionSnapshotOnServer()` | same | A **network round-trip** at cold start |
| `coreRuntime.asset.loadAsync(fontAssets)` | same | Blocking font load |
| PowerSync bootstrap + `SyncManager` mount | same | Local-DB connection setup |

**Treatment:**
1. Run Beast Plan P0 now — get real T1 (cold-start TTI) numbers via `eas observe:metrics-summary`. Right now every claim about "slow boot" (including mine) is inference from code shape, not measurement.
2. Once measured, apply the same idle-defer pattern already proven for Sentry/PostHog to `warmCedarWasm()` and `refreshPermissionSnapshotOnServer()` — neither needs to block first paint if the UI can render in a provisional "checking permissions…" state.
3. Font loading: switch to `expo-font`'s async hook pattern with a suspense boundary instead of blocking the whole layout.

**Effort:** S for P0 baseline run (it's already written, just needs executing). M for the idle-defer changes.

---

## 2. Dependency Redundancy ("AI piling different things")

Verified directly against `apps/gurudevi-mobile/package.json` — not the
docs, which under-count two of these three.

### 2.1 Three SQLite engines simultaneously present
```
@journeyapps/wa-sqlite    ^1.7.2   (WASM SQLite — PowerSync web/legacy path)
@op-engineering/op-sqlite ^17.2.0  (native SQLite — PowerSync's newer backend)
expo-sqlite               ~57.0.2  (Expo's own SQLite)
```
Your own Beast Plan debt map only names **two** ("dual SQLite `wa-sqlite`
+ `op-sqlite`"). The third, `expo-sqlite`, is untracked. If any feature
uses `expo-sqlite` directly instead of going through PowerSync, that's a
**separate, unsynced data store** living alongside your offline-first one.

**Treatment:** Audit every import of `expo-sqlite` — if nothing genuinely
needs it standalone, remove it. Then decide *one* PowerSync backend
(`op-sqlite` is the modern, native, faster choice per PowerSync's own
2026 guidance) and drop `wa-sqlite`. This is a P1-scope item already, just
incomplete in scope.

### 2.2 Five icon packages
```
@react-native-vector-icons/lucide  13.1.2
lucide-react-native                ^1.37.0
lucide-react                       ^1.37.0
phosphor-react-native               3.0.6
react-native-nano-icons            ^0.1.8
```
Beast Plan only tracks "dedupe lucide/phosphor" (2 of 5).
`react-native-nano-icons` isn't mentioned anywhere in the debt map —
it's a fully untracked addition, almost certainly from a session that
didn't check what already existed.

**Treatment:** You already have the right instinct documented —
`decisions/2026-07-16-icon-bridge-contract.md` establishes `@repo/ui/icons`
as the contract. Enforce it: grep for direct imports of any of the five
packages outside `@repo/ui/icons`, redirect them, then remove the unused
packages from `package.json` entirely (not just stop using — actually
remove, or the next agent will "discover" and reuse them again).

### 2.3 Triple web styling engine, one leg unstable
```
nativewind            5.0.0-preview.4   ← a PREVIEW build, shipped in prod deps
react-native-css      3.0.7
react-native-css-interop 0.1.22
```
Beast Plan flags this as a known triple ("collapse only if `audit:css-interop`
proves bloat"). Worth elevating in priority: shipping a `-preview` package
version in production dependencies is a stability risk independent of the
redundancy question.

**Treatment:** Run the `audit:css-interop` script that's already referenced
in your own docs — it exists, just hasn't been run per the Beast baseline
being TBD. Decide the winner, pin a non-preview version.

---

## 3. A Real Bug, Not Just Clutter: AI Assistant Paywall Bypass

Two route files serve the same feature:

- **`app/a-i-assistant.tsx`** (oddly hyphenated — almost certainly renamed
  to dodge a route collision rather than fixing the underlying duplication)
  — has the premium gate (`usePremiumStatus`), an error boundary, and a
  loading fallback.
- **`app/(tabs)/self/ai-assistant.tsx`** — a one-line re-export of the
  exact same underlying component, **with none of that**:
  ```ts
  export { AIAssistantScreen as default } from '@repo/ai/assistant';
  ```

**Impact:** whichever path a user or a deep link resolves to determines
whether they hit the premium paywall at all. This is a monetization leak,
not a style nit.

**Treatment:** Delete one of the two routes. Make the tab route the
re-export target for the *gated* version (i.e. have
`app/(tabs)/self/ai-assistant.tsx` re-export the same `AIAssistantRoute`
wrapper component from `a-i-assistant.tsx`, not the raw
`@repo/ai/assistant` screen). Then rename `a-i-assistant.tsx` to something
sane — the hyphenation exists only to route around a name it was afraid to
collide with the tab route; once one of them stops directly exporting the
raw screen, the collision reason disappears.

**Effort:** XS (this is a 10-minute fix once you decide which file is
canonical) — but flag it as a priority, it's currently live product
behavior, not a docs gap.

---

## 4. Documentation/Architecture Churn (context for "why everywhere feels different")

Not a bug — a pattern that explains the *texture* of the Frankenstein
feeling:

- Core architecture doc: **v2 → v4 → v4-updated → v5**
  (`docs/Core/archive/GURUDEVI_ARCHITECTURE_v2_0.md` →
  `..._v5_0.md` → `docs/Support/GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md`)
- UI kit (gluestack) migrated **v2 → v3 → v5**
  (`GLUESTACK_V3_MIGRATION_AUDIT_2026.md`,
  `infra/2026-07-14-gluestack-v5-migration-report.md`)
- Reanimated/worklets, RNGH v3, TypeScript 6→7 — each got a full
  migration-analysis doc, meaning each was a genuine breaking upgrade, not
  a routine bump.

Three full UI-layer rewrites (architecture, gluestack, and the styling
triple in §2.3) in roughly six months is a very plausible reason different
screens *feel* like they came from different apps — because, structurally,
they were built against different versions of the same foundational
libraries at different points in time.

**Treatment:** Nothing to "fix" here directly — this is diagnostic context,
not a bug. But it argues for a **UI consistency pass being its own
tracked phase** (Beast Plan's P7 "Polish" already covers some of this) —
specifically an audit of which screens were last touched *before* vs
*after* the gluestack v5 migration, since those are the ones most likely
to visually/behaviorally disagree with each other.

---

## 5. Routing Structure Itself — Checked, Came Back Clean

Explicitly checked for the classic Expo Router failure mode (a flat file
and a folder with the same name colliding), because it was the most
obvious candidate for "Frankenstein":

- `community/direct-messages.tsx` (list) + `direct-messages/[conversationId].tsx`
  (detail) — valid list+detail pattern, not a collision.
- `community/chat/[conversationId].tsx` → `GroupChatScreen`, vs
  `community/direct-messages/[conversationId].tsx` → `DirectMessageScreen`
  — correctly separate (group chat vs. 1:1 DM), not duplicated.

**Conclusion:** the file-based route tree is not where your coherence
problem lives. It's the dependency layer (§2) and the bootstrap sequence
(§1) that are. Don't spend time restructuring `app/` — it isn't broken.

---

## 6. Priority Order (if you fix things from this doc alone)

1. **§3 AI-assistant paywall bug** — XS effort, live revenue impact.
2. **§1 Beast P0 baseline run** — S effort, unblocks every future perf claim with real numbers instead of inference.
3. **§2.2 Icon dedup** — S–M effort, contract already exists, just needs enforcement.
4. **§2.1 SQLite consolidation** — M effort, higher risk (touches persistence), do after P0 baseline so you can measure the before/after.
5. **§2.3 Style engine collapse** — M effort, `audit:css-interop` already exists to inform the decision.
6. **§4 UI consistency pass** — L effort, ongoing, fold into Beast Plan P7.
