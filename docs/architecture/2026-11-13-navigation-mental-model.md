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

## One checked way to move (mobile)

Every native screen change, in the app and in the shared packages, goes through `useNavigator()` from `@repo/ui/components/native/navigation`. That is its own export path, so importing it doesn't load the whole kit. `useFlowNavigator` (mobile) and `<GoTo>` are built on it. It has the expo-router method names, so moving a screen onto it is a one-line change.

| Call | For | Checked by |
| --- | --- | --- |
| `push('/settings')`, `replace(...)`, `dismissTo(...)` | hrefs written in code | the compiler (`AppHref`, from the catalogue) and `checkInternalHref` at runtime |
| `push({ pathname: '/self/wisdom/[id]', params })` | dynamic routes | `RoutePattern` at compile time; `buildHref` encodes the segments and sends other params to the query |
| `follow(raw, source, op?)` | strings that only exist at runtime: notification payloads, the entry gate's target, registry data | `checkInternalHref` at runtime, with `source` named in the report |
| `back(fallback?)` | back; at the root, replaces to the fallback | `fallback` is typed |
| `prefetch(to)`, `warm(raw)` | warming a screen before the person commits | silent when refused |
| `<GoTo href>` | redirecting during render | the same check |

**`checkInternalHref`** (`packages/core/src/routing/internalHref.ts`) is the floor that every destination passes. Deep links pass it too, after their own host and prefix allowlist. It accepts an href only if all of these hold:
- it is an absolute in-app path: no scheme, no host, no `//`, no `/\`;
- it has no markup, quote, `;`, backslash or control characters, and none of them percent-encoded;
- it has no `.` or `..` segments, decoded or not;
- it has no unfilled `[param]`;
- it is at most 8 KB long;
- it lands on a screen in the route catalogue.

A refused destination never reaches the router. It is reported with its path only, never its query, because the query can carry codes or personal data. The reason comes back so the screen can respond.

**Typed hrefs** (`packages/core/src/routing/routeHref.ts`) are template-literal types over the generated catalogue, so a link to a screen that doesn't exist fails the type check. expo-router's own generated route types are not used. On SDK 58 here, `regenerateDeclarations` writes `.expo/types/router.d.ts`, but its `declare module 'expo-router'` augments a namespace that `expo-router` only re-exports (`export type * from './typed-routes/types'`), so `__routes` stays empty and any string type-checks. A probe confirmed it.

**Deep links** (`app/+native-intent.tsx`) keep their allowlist. An allowed prefix must also land on a real screen, otherwise the link fails closed to `/` without stashing a pending intent. Failures are reported instead of logged.

**Ratchets** (`tooling/ratchet.json`, both only go down):
- `directRouterUse` counts expo-router `router`, `useRouter` and `<Redirect>` imports outside the kit's navigation folder. It is **14**: the retired `@repo/self` family, left alone; the old `safeBack` helper in `@repo/ui/utils/navigation`, now used only by `.web` reference files; and live `.web` files. The app and the live package screens have 0.
- `uncheckedWebNavigation` counts web `navigate({ href: value })` calls outside `lib/navigation`. It is **2**, both in the private `components/workbench` playground.

## Access and the back stack (mobile)

**The router enforces access.** The root Stack (`EntryShell`'s `EntryStack`) puts the tabs, their modals and every top-level app screen inside `Stack.Protected`. Its `guard` is `admitsAppRoutes(decision)` from `logic/auth/bootstrapRoutes`: open for `app`, and while `booting` (the gate covers the screen, and a launch deep link must not bounce); closed for `public`, `inactive-account` and `onboarding`.

A refused route is swapped for a redirect before the screen mounts: on sign-out, or for an inactive account, protected screens never render. The redirect goes where the gate is already sending the person, if that passes `checkInternalHref`, otherwise to `/onboarding` or `/welcome` (`entryAccessFor`). Every app screen is declared in the guard, because a Stack also mounts undeclared routes, outside it.

`SessionRouteGate` still owns the splash handoff, the restoring and transition surfaces, and replaying a pending deep link after sign-in. It publishes its decision; it doesn't enforce it.

**Back always has somewhere to go.**
- The Self and Workspace stacks anchor to their overview (`unstable_settings.anchor = 'index'`), and the tabs anchor to `self`. A deep link into `/workspace/inventory` has Workspace under it.
- The navigator passes `withAnchor` on `push` (`NAVIGATION_POLICY.mobile.withAnchor`), so arriving in a stack from elsewhere does the same.
- The root stack is unanchored on purpose: its anchor would be the protected tabs, put under public deep links.
- `navigation/anchors.test.ts` checks that every navigator with an overview anchors to a screen it has.

## Places, not screen names

Code that sends someone to a place names the place (`Place`, in `types/Place.ts`), and `PLACE_ROUTES` (`logic/places/placeRoutes.ts`) says where it is on each platform. The table is typed against both route catalogues and tested to land on a real screen. The workspace switcher's targets used to be React Navigation screen names (`'FounderDashboard'`, `'Classroom'`). They are now `{ kind: 'place', place: 'workspace' }`: switching a perspective chooses the floor Workspace shows, one per capacity (`workspaceCatalog`). The mobile shell's overview map uses the same table.

## expo-router runs on React Navigation; app code doesn't speak it

expo-router is built on React Navigation. It ships its own copy (`expo-router/react-navigation`), and since SDK 56 apps must not import `@react-navigation/*` themselves. That engine stays: stacks, tabs, `useFocusEffect`, `useIsFocused`, `usePreventRemove`, and `useNavigation()` for events and options (the SDK 58 guide keeps it for those). What is retired is the React Navigation style in app code: screen names, `navigation.navigate('Name', { screen, params })` and nested-state params. In SDK 58 `screen`, `params` and `initial` are ordinary params. None remain. The shared settings screen's `navigation` prop, which no caller passed, is gone with its `navigate('Community', { screen: 'UserProfile' })` branches.

## The web

Literal links use TanStack Router's typed `<Link to>` and `navigate({ to })`. A destination known only at runtime (a workspace task's route, a feature's href, a sign-in `returnTo`) goes through `useNavigator().follow(raw, source, op)` in `apps/gurudevi-web/lib/navigation`. That is the same `checkInternalHref` (web catalogue), with the same path-only reports and view transitions by policy. The web `useFlowNavigator` is built on it. `safeReturnPath` keeps the deep-link allowlist and now also requires a page that exists.

**Tests resolve like Metro.** The mobile vitest config sets `resolve.dedupe: ['expo-router']`. Metro resolves one copy from the app (`disableHierarchicalLookup`), but a shared package would otherwise resolve its own copy in tests, and the test's mock would miss it.

**Found while moving call sites** (the app first, then the packages: the profile `full`, `public`, `privacy-ledger` and `mute-hub` screens, five `/library/tools/*` screens, `/community/chat/[groupId]` and `/trube-lab` have no mobile screen; each now goes through `follow`, refused and reported until its screen exists):
- The workspace switcher pushes React Navigation screen names (`'FounderDashboard'`, `'Classroom'`) as paths. They never resolved under expo-router; now they are refused and reported instead of opening the unmatched screen. Mapping each to a route is product data.
- The push-notification handler navigated to the payload's path behind `as Href`. It now goes through `follow(..., 'notification')`.
- The entry gate replayed pending intents to `/qr`, which no longer exists on mobile, and to arbitrary paths. Both are now checked.
- 12 `as any`, `as never` and `as Parameters<…>` casts on hrefs were removed. Every literal href in the app now type-checks against real screens.

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
- Direct router use: 0 in the mobile app (all 52 calls moved onto `useNavigator`), and 35 imports
  in the shared packages, ratcheted. The web is typed against its route tree.
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
| Typed routes | **Web: on** (TanStack Router types every `<Link to>` and `navigate({ to })` against the route tree). **Mobile: on, through the catalogue** (`AppHref`, `RoutePattern`). | expo-router's generated types don't reach `Href` on SDK 58 here (see above) | Use `follow` for a destination that can't be typed |
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
| `withAnchor`, `unstable_settings.anchor` | Used | The Self and Workspace stacks anchor to their overview; `push` passes `withAnchor`. |
| `Stack.Protected guard redirectTo` | Used | App routes are behind it; the guard is the entry gate's decision. |
| `formSheet` with detents | Ready (`SHEET_SCREEN`) | Layouts adopt it route by route. |
| `Link.Preview`, zoom transition, `Stack.Toolbar`, `NativeTabs` | Held back | Product and visual choices for the L8 motion layer. They are listed here so nobody rebuilds them by hand. |
| `setTransitionMode`, `inTransition` | Held back | Marked experimental in 58. The default (`preload-only`) stays. |
| TanStack `href` navigation, `preloadRoute`, `viewTransition`, `useCanGoBack` | Used | Web adapter. |
| TanStack `mask`, `useBlocker` | Next | Masked URLs for a panel or modal, and confirm-before-leaving for forms with unsaved changes. |

## What comes next

1. Done for the app: every mobile call site uses `useNavigator`, and `directRouterUse` is ratcheted.
   Next is moving the navigator into a shared native package, so the 35 package sites can follow,
   and re-pointing call sites that are really flow steps onto `useFlowNavigator`.
2. Join workbench tasks to flow steps. An active task would record `(flowId, stepId, params)`, so
   resuming work is the same thing as resolving a step.
3. Add `prefetch` (L5 `queryOptions`) and `transition` (L8) to steps. The navigator would call
   `router.prefetch` and `queryClient.prefetchQuery` on intent.
4. Check `routeManifest` (deep links) against the catalogue.
