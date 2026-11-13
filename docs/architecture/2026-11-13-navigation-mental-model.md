# Navigation mental model

Date: 2026-11-13. Layer L9 of the [client runtime plan](2026-11-12-client-runtime-foundation-plan.md).

Navigation in Gurudevi uses four separate ideas. Most of the confusion in the code comes from mixing
them together.

| Idea | What it is | Where it lives | Who owns it |
| --- | --- | --- | --- |
| **Place** | A screen that exists, addressed by a route | File trees: `apps/gurudevi-mobile/app` (39 routes), `apps/gurudevi-web/app` (84 pages) | The router (expo-router, Next) |
| **Journey** | An ordered job: steps, fallbacks, completion | `packages/core/src/flows`, registered in `FLOW_REGISTRY` (15 flows) | Core |
| **Open work** | Tasks the user has in progress inside a domain (the task strip) | `logic/workbench/activeTasks.ts`, `useActiveSubTabsStore` | Core plus the workbench screens |
| **Presentation** | How a step appears: push, replace, sheet, modal, panel | Decided by the navigator for each step and size class | The navigator adapter |

The rules are as follows:

- The router is a passive projection. It knows places, not jobs.
- A screen asks for a **step**, not a route: `open(flowId, stepId, params)`.
- The navigator turns the step into a route and an operation.
- Presentation is chosen in one place, not at each call site.

## The pipeline

```
screen ──open(flowId, stepId, params)──▶ useFlowNavigator (app adapter)
                                           │  size class: compact < 768 ≤ regular
                                           ▼
                               resolveFlowStep (core, pure)
                                 1. find the step in FLOW_REGISTRY
                                 2. a condition that matches a fallback → replace to the fallback
                                 3. pick the platform route, fill [params]
                                 4. check that the route exists in the generated catalogue
                                 5. presentation = step override ?? purpose default
                                           ▼
                 go {href, op, presentation} │ fallback │ unavailable {reason}
                                           ▼
                 router.push / router.replace        captureException('flow-navigator')
```

Every resolution ends in exactly one outcome, the same rule that applies to operations. If the
result is `unavailable`, nothing navigates and the failure is reported. A broken link is never
silent and never takes the user to a 404.

## The pieces

| File | Tier | Role |
| --- | --- | --- |
| `scripts/route-catalog.mjs` | tooling | Reads both file trees and writes `routing/routeCatalog.generated.ts`. Run `--check` in CI. |
| `core/routing/routeMatch.ts` | T2 | `findRoute`, `routeExists` and `fillRoute`. Groups are optional; `[p]`, `[...p]` and `[[...p]]` are handled; static segments win. |
| `core/flows/flowRoutes.ts` | T2 | `checkFlowRoutes(flow)` finds every step, fallback and completion route that has no screen. |
| `core/flows/navigator.ts` | T2 | `sizeClassOf`, `DEFAULT_PRESENTATION`, `presentationOf`, `resolveFlowStep`, `nextStepOf`, `resolveFlowCompletion`. |
| `core/types/domainEntry.ts` | L0 (additive) | `FlowPresentationSchema` and an optional `presentation {compact?, regular?}` on a step. |
| `mobile/src/navigation/useFlowNavigator.ts` | app | Uses expo-router `router`. Gets the size class from `useWindowDimensions`. |
| `web/lib/navigation/useFlowNavigator.ts` | app | Uses Next `useRouter`. Gets the size class from `matchMedia` through `useSyncExternalStore`; on the server it is `regular`. |

### Default presentation, by step purpose

| Purpose | Compact (phone) | Regular (tablet, web) |
| --- | --- | --- |
| `on_ramp` | push | push |
| `input_form` | push | push |
| `preview_confirm` | sheet | modal |
| `sub_detail` | push | panel |
| `terminal_success` | replace | replace |

A step can override either column. The operation is `replace` only when the presentation is
`replace`. Every other presentation is a `push`, and the destination route decides how it looks.

## Presentation is a property of the route, not the call

expo-router 58 has no API for opening a route as a sheet from the call site. A route is a sheet when
its **layout** declares it, for example:

```
<Stack.Screen name="confirm" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 1] }} />
```

So when the navigator returns `presentation: 'sheet'`, the destination's layout has to say so too.
The navigator reports the intent, and the layout carries it out. Next has the same split: a panel or
modal there is a parallel or intercepting route (`@slot`, `(.)route`) chosen by the layout.

The kit's in-screen `Sheet`, `Dialog` and `Popover` are a different thing. They show transient UI
**inside** a place, such as a picker or a confirm prompt, and have no URL, no back entry and no
deep link. Use them when the content isn't worth an address. Use a route sheet when the content
should survive a deep link, back, or state restoration.

## Measured facts (2026-11-13)

- **46 broken route references** across the 15 flows. These are steps, fallbacks or completions
  that point at screens which don't exist. They are listed in `flowRoutes.test.ts` as
  `KNOWN_BROKEN`. The test fails if a new one appears, and it also fails if a listed one is fixed
  but not removed from the list. The list can only shrink.
- Direct router use: `router.push` 82 times in 42 files, `router.replace` 22 times in 14 files,
  `useRouter` in 51 files, `next/navigation` in 44 files, and `<Modal>` in 26 files. None of these
  goes through the navigator yet.
- `routing/routeManifest.ts` is the deep-link allowlist. It is a separate list from the catalogue
  and isn't checked against it yet.

## Evidence

- G1 / Vitest, `routeMatch`, `flowRoutes`, `navigator` (core): 20/20 passed against the real
  `FLOW_REGISTRY` and the generated catalogue.
- G3 / Vitest with a substituted router: mobile `useFlowNavigator` 5/5 and web `useFlowNavigator`
  4/4 passed.
- These tests do not prove:
  - real native sheet presentation;
  - device back handling;
  - Next intercepting routes;
  - that any screen calls the navigator yet.

## Decisions for Neev

1. **Typed routes on.** This means expo-router `experiments.typedRoutes` and Next 16 `typedRoutes`
   (stable). It gives a compile-time check that routes exist across all 42 or more files that call
   the router. It is free and covers what the catalogue covers at runtime.
2. **Layouts declare sheets.** Agree the convention that any route used by a `sheet` step sets
   `presentation: 'formSheet'` in its layout. A check could compare the steps with the layouts.
3. **Panels.** On mobile tablets this needs a split layout (master and detail) in the domain stack.
   On web it is a parallel route. Until then the adapter treats a panel as a push.
4. **The 46 broken references.** For each one: build the screen, point the reference at an existing
   one, or mark the step `fallback`. This is product work, which is why it is ratcheted and not fixed.

## What comes next

1. A codemod that moves `router.push` and `router.replace` call sites that match flow steps onto
   `useFlowNavigator`. Then a ratchet on direct router use outside the two adapters.
2. Join workbench tasks to flow steps. An active task would record `(flowId, stepId, params)`, so
   resuming work is the same thing as resolving a step.
3. Add `prefetch` (L5 `queryOptions`) and `transition` (L8) to steps. The navigator would call
   `router.prefetch` and `queryClient.prefetchQuery` on intent.
4. Check `routeManifest` (deep links) against the catalogue.
