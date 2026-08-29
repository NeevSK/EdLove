# Sanctuary experience engineering standard

**Status:** proposed baseline for new Sanctuary work  
**Applies to:** Self, Workspace, Community, Library, Profile, and shared UI/core packages

## Purpose

The Sanctuary should be configurable and calm without making behavior implicit. This standard prevents a passing import check, a hidden feature flag, or a platform-specific implementation from being mistaken for production readiness.

It is one cross-cutting standard, not a separate policy for haptics, gestures, transitions, errors, or state. Feature plans link to this document and add only their product-specific decisions.

## Production screen contract

Every user-visible remote or persisted screen defines which of these states apply and renders each deliberately:

| State | Required behavior |
| --- | --- |
| Loading | Branded skeleton or pulse; preserve layout where practical; no indefinite spinner without context. |
| Ready | Current data and the permitted actions are visible. |
| Empty | Explain why it is empty and offer the next meaningful action. |
| Recoverable error | Plain-language failure, retained safe data/input where possible, retry action, telemetry. |
| Offline or queued | Identify local/queued state, time/sync status, and what will happen on reconnect. |
| Permission denied | Explain the boundary without leaking protected data; offer a valid route out. |
| Mutation pending/success/failure | Prevent duplicate submission, provide visible status, rollback/reconcile on failure, preserve the draft when appropriate. |

The state model belongs in typed domain/controller contracts. Do not substitute `any`, a silent `catch`, console-only logging, or an untyped global store for a state.

For the common blocking decision, use `@repo/ui/state/screenState`: it renders an error before an empty/loading placeholder only when there is no safe content, preventing a failed refresh from erasing usable local data.

## Interaction and feedback contract

| Concern | Mobile | Web |
| --- | --- | --- |
| Primary actions | 44+ point target, visible pressed/disabled/pending state; haptic only when it adds meaning. | Semantic button/link, visible focus ring, keyboard Enter/Space behavior. |
| Navigation | Native tab/stack behavior; selection remains visible; haptic is optional. | URL is the source of shareable/back-forward state; links support standard browser expectations. |
| Gesture | Gesture Handler hook API and UI-thread animation; drag uses a dedicated handle and has cancel/release behavior. | Pointer and keyboard equivalents, drag announcements, focus restoration, and a non-drag alternative. |
| Animation | Tokenized duration/easing; honor reduced motion; never hide a state change only in animation. | Same intent, with CSS/DOM affordances where appropriate; no hover-only action. |
| Success/error | Visible text/status plus optional haptic/toast. | Visible text/status plus focus management; never depend on haptics. |

`PanResponder`, JS-thread `Animated.event`, deprecated RNGH builder gestures, and Reanimated compatibility imports are legacy patterns for new code. Existing uses have a migration item and a cancellation/accessibility test before modification.

## State and customization contract

1. A user configuration has an explicit scope: user, device, role, workspace, or session.
2. Its schema is versioned and validates before persistence.
3. A change has optimistic UI only with a visible rollback/retry path.
4. Conflict strategy is chosen explicitly: merge by surface ID, prompt, or last-write-wins.
5. Feature-flagged experiences have flag-on and flag-off test coverage; a fallback never loses access to the legacy journey.

## Dependency and platform posture

The supported release train is Expo 57 / RN 0.86.2. New code should be ready for the RN 0.87 migration without claiming that migration has happened:

- use public React Native exports and strict types; avoid deep/internal imports;
- do not introduce `InteractionManager`, `ImageBackground`, legacy RNGH handlers/builders, or Reanimated `runOnJS` imports;
- use the installed, resolved version graph as truth, not a package range copied from another package;
- dependency upgrades are a dedicated change: Expo SDK first, then RN-compatible RNGH/Reanimated/Worklets as one tested set, with device builds.

Expo 58/RN 0.87 remains a compatibility target, not a current dependency target. It becomes an implementation plan only after stable Expo support and a compatibility decision record.

## Test evidence pyramid

| Layer | Purpose | Examples |
| --- | --- | --- |
| Pure contracts | Deterministic domain rules | role resolution, layout migration, reorder target, route params, mutation state reducer |
| Component/controller | Observable state and recovery | loading/error/empty/offline/denied, retry, preserved draft, rollback |
| Integration | Real route and persistence boundary | route consumes params, flag-on/off fallback, queued write/reconnect |
| Browser/device | Actual affordances | tab/rail keyboard navigation, focus, screen reader labels, pointer/keyboard drag, iOS/Android long press and cancel |
| Release | Operational evidence | production-like build, observability dashboards, kill switch/rollback drill |

Source-contract tests are allowed only for durable structural rules that cannot be observed cheaply (for example, a known obsolete native API). They are not evidence that a screen renders correctly or feels good. Every required test must run in the package's configured runner; exclusions require an issue, an owner, and an expiry.

## Enforced baseline

Run `pnpm run check:sanctuary-experience`. It is required in pull-request and scheduled quality workflows. The check rejects new use of the obsolete native/gesture APIs listed above, broad ESLint suppression, and new live `@ts-nocheck` files. It also rejects unreviewed exclusions of mobile architecture tests. Its small explicit allowlist is technical debt already present in the application; changing it requires a migration decision and a corresponding test, rather than silently normalizing another exception.

## Delivery checklist for every feature

- [ ] Product job, platform affordance, and configuration scope are stated.
- [ ] State contract covers the applicable states above.
- [ ] Mutation/retry/rollback and telemetry behavior are defined.
- [ ] Mobile and web interaction alternatives are designed.
- [ ] Accessibility and reduced-motion behavior are tested.
- [ ] The actual configured unit/component runner and relevant E2E runner execute the tests.
- [ ] Flag-on/off and migration behavior are verified where relevant.
- [ ] No prohibited legacy API or untyped escape is introduced.
