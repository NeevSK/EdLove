# Navigation mental model

Date: 2026-11-13. Layer L9 of the [client runtime plan](2026-11-12-client-runtime-foundation-plan.md).

Navigation in Gurudevi uses four separate ideas. Most of the confusion in the code comes from mixing
them together.

| Idea | What it is | Where it lives | Who owns it |
| --- | --- | --- | --- |
| **Place** | A screen that exists, addressed by a route | File trees: `apps/gurudevi-mobile/app` (39 routes), `apps/gurudevi-web/spa/routes` (69 routes, TanStack Router) | The router (expo-router, TanStack Router) |
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
     mobile: useRouter().push / replace / dismissTo     web: router.navigate({ href, replace, viewTransition })
                                                      unavailable → captureException('flow-navigator')
```

Every resolution ends in exactly one outcome, the same rule that applies to operations. If the
result is `unavailable`, nothing navigates and the failure is reported. A broken link is never
silent and never takes the user to a 404.

## The pieces

| File | Tier | Role |
| --- | --- | --- |
| `scripts/route-catalog.mjs` | tooling | Reads the expo-router file tree and TanStack's generated `spa/generated/routeTree.gen.ts` (`$id` → `[id]`) and writes `routing/routeCatalog.generated.ts`. Run `--check` in CI. |
| `core/flows/navigationPolicy.ts` | T2 | **Every taste decision in one object**: presentation by purpose, panels and their stand-in, completion op, sheet look, prefetch, view transitions. Change a value there to reverse a decision. |
| `core/routing/routeMatch.ts` | T2 | `findRoute`, `routeExists` and `fillRoute`. Groups are optional; `[p]`, `[...p]` and `[[...p]]` are handled; static segments win. |
| `core/flows/flowRoutes.ts` | T2 | `checkFlowRoutes(flow)` finds every step, fallback and completion route that has no screen. |
| `core/flows/navigator.ts` | T2 | `sizeClassOf`, `DEFAULT_PRESENTATION`, `presentationOf`, `resolveFlowStep`, `nextStepOf`, `resolveFlowCompletion`. |
| `core/types/domainEntry.ts` | L0 (additive) | `FlowPresentationSchema` and an optional `presentation {compact?, regular?}` on a step. |
| `mobile/src/navigation/useFlowNavigator.ts` | app | `open`, `next`, `prefetch`, `back` on expo-router 58's `useRouter()` (SDK 58 prefers it to the module-level `router`). Size class from `useWindowDimensions`. |
| `mobile/src/navigation/sheetScreen.ts` | app | `SHEET_SCREEN`: the `formSheet` options a layout spreads onto a route that a `sheet` step lands on. |
| `web/lib/navigation/useFlowNavigator.ts` | app | The same API on TanStack Router: `navigate({ href, replace, viewTransition })`, `preloadRoute`, `useCanGoBack`. Size class from `matchMedia` via `useSyncExternalStore`. |

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
This table lives in `NAVIGATION_POLICY.presentation`.

## Presentation is a property of the route, not the call

expo-router 58 has no API for opening a route as a sheet from the call site. A route is a sheet when
its **layout** declares it, for example:

```
<Stack.Screen name="confirm" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 1] }} />
```

So when the navigator returns `presentation: 'sheet'`, the destination's layout has to say so too.
The navigator reports the intent, and the layout carries it out. The web has the same split: a panel or
modal there is a nested outlet, or a TanStack `mask` (one URL is shown while another route renders), chosen by the layout.

The kit's in-screen `Sheet`, `Dialog` and `Popover` are a different thing. They show transient UI
**inside** a place, such as a picker or a confirm prompt, and have no URL, no back entry and no
deep link. Use them when the content isn't worth an address. Use a route sheet when the content
should survive a deep link, back, or state restoration.

## Measured facts (2026-11-13)

- **46 broken route references** across the 15 flows. These are steps, fallbacks or completions
  that point at screens which don't exist. They are listed in `flowRoutes.test.ts` as
  `KNOWN_BROKEN`. The test fails if a new one appears, and it also fails if a listed one is fixed
  but not removed from the list. The list can only shrink.
- Direct router use on mobile: 52 `router.push`, `router.replace` and `router.navigate` calls. The
  web moved off Next, and its links are typed against the route tree. None of these calls goes
  through the navigator yet.
- `routing/routeManifest.ts` is the deep-link allowlist. It is a separate list from the catalogue
  and isn't checked against it yet.

## Evidence

- G1 / Vitest, `routeMatch`, `flowRoutes`, `navigator` (core): 20/20 passed against the real
  `FLOW_REGISTRY` and the generated catalogue.
- G3 / Vitest with a substituted router: mobile `useFlowNavigator` and web `useFlowNavigator`
  (TanStack) 6/6 passed, covering push, completion, unavailable, prefetch and back.
- These tests do not prove:
  - real native sheet presentation;
  - device back handling;
  - TanStack masked or nested-outlet panels;
  - that any screen calls the navigator yet.

## Decisions taken as defaults

Each was an open question. Each is now a default in `NAVIGATION_POLICY`, chosen to be safe, and
reversed by changing one value.

| Question | Default | Why | To reverse |
| --- | --- | --- | --- |
| Typed routes | **Web: on** (TanStack Router types every `<Link to>` and `navigate({ to })` against the route tree). **Mobile: off for now.** | Turning on expo-router `experiments.typedRoutes` would flag all 52 existing hand-written hrefs at once. Flow steps are already checked by the catalogue. | Set `experiments.typedRoutes: true` in `app.json` once the call sites go through the navigator. |
| Sheets | A route that a `sheet` step lands on declares `SHEET_SCREEN` (`formSheet`, detents ½ and full, grabber) in its layout | expo-router 58 decides presentation in the layout, not at the call | Change `NAVIGATION_POLICY.sheet`, or a step's own `presentation` |
| Panels | `panels: { mobile: false, web: false }`, so a panel opens as a **push** | No domain has a split layout yet (`expo-router/unstable-split-view` on tablets, a nested outlet on the web) | Set `panels.<platform>: true` when the layout exists |
| Finishing a flow | `completion: 'dismissTo'` | `dismissTo` goes back to the landing screen if it's in the history, or replaces the current screen, so the flow's screens never stay behind it. On the web it's a replace. | `completion: 'replace'` |
| A broken step | `onUnavailable: 'report'`: never navigate, report it, return the reason | The 46 broken references need someone to build or re-point each one, and guessing at runtime would hide them | Fix the reference and remove it from `KNOWN_BROKEN` |
| Warming the next screen | Mobile `prefetchOnIntent: true` (`router.prefetch`); web `preloadRoute`, plus the app's `defaultPreload: 'intent'` | It removes the blank frame between a tap and the next screen | Set the flag to `false` |
| Route changes on the web | `viewTransitions: true` | Uses the browser's View Transitions; browsers without it navigate as usual | Set `web.viewTransitions: false` |

## Router capabilities in use, and the ones held back

Checked against the installed packages (`expo-router` 58.0.30, `@tanstack/react-router` 1.170 on
router-core 1.171) and the SDK 57→58 migration guide.

| Capability | Status | Note |
| --- | --- | --- |
| `useRouter()` bound to the root | Used | SDK 58: the module-level `router` throws before the first render and can't tell apart multiple router roots. |
| `push`, `navigate` | `push` is used | `navigate` has been an alias of `push` since Router v4. |
| `dismissTo` | Used for completion | Goes back to the href if it's in the history, otherwise replaces. |
| `prefetch` | Used (`prefetch`) | Warms a route before the person commits. |
| Complete hrefs | Required | In SDK 58, `screen`, `params` and `initial` are plain params. Flows already give complete hrefs. |
| `withAnchor`, `unstable_settings.anchor` | Next | Puts a stack's anchor under a deep-linked screen, so back has somewhere to go. |
| `Stack.Protected guard redirectTo` | Next | The native way to gate account steps; it lines up with flow fallbacks. |
| `formSheet` with detents | Ready (`SHEET_SCREEN`) | Layouts adopt it route by route. |
| `Link.Preview`, zoom transition, `Stack.Toolbar`, `NativeTabs` | Held back | Product and visual choices for the L8 motion layer. They are listed here so nobody rebuilds them by hand. |
| `setTransitionMode`, `inTransition` | Held back | Marked experimental in 58. The default (`preload-only`) stays. |
| TanStack `href` navigation, `preloadRoute`, `viewTransition`, `useCanGoBack` | Used | Web adapter. |
| TanStack `mask`, `useBlocker` | Next | Masked URLs for a panel or modal, and confirm-before-leaving for forms with unsaved changes. |

## What comes next

1. A codemod that moves the mobile `router.push` and `router.replace` call sites that match flow steps
   onto `useFlowNavigator`. Then a ratchet on direct router use outside the two adapters, and
   typed routes on mobile.
2. Join workbench tasks to flow steps. An active task would record `(flowId, stepId, params)`, so
   resuming work is the same thing as resolving a step.
3. Add `prefetch` (L5 `queryOptions`) and `transition` (L8) to steps. The navigator would call
   `router.prefetch` and `queryClient.prefetchQuery` on intent.
4. Check `routeManifest` (deep links) against the catalogue.
