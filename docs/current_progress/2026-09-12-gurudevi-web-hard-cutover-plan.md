# Gurudevi Web Hard Cutover Plan (Superseded Implementation Sequence)

**Status:** superseded for implementation sequencing by
`2026-09-14-gurudevi-sanctuary-web-implementation-plan.md`; retained as route,
boundary, and cutover reference.
**Date:** 2026-09-12  
**Decision:** new browser work belongs only in `apps/gurudevi-web`.

## Outcome

Deliver one real, browser-native Gurudevi product at `gurudevi.app`, with the
future authenticated product hosted at `sanctuary.gurudevi.app`. The current
marketing site and React Native Web target are migration sources, not continuing
web platforms. `apps/gurudevi-mobile` remains the native iOS and Android app.

“Hard cutover” means the architectural direction changes immediately: no new
browser features land in `gurudevi-marketingWeb` or in `*.web.tsx`. It does not
mean deleting a live route before its replacement has browser evidence and a
redirect. Deletion is the final cutover operation.

## Styling and component boundary

Use **Tailwind CSS v4** in `apps/gurudevi-web`, with semantic DOM and a small
amount of component-local CSS only where utilities make the intent less clear.
Do not introduce StyleX: it is not currently installed or used in this
repository, and a Tailwind–StyleX mix would make a new styling system without a
product need.

`@repo/ui` is not the new web component library. It is React Native / NativeWind
oriented, including its `.web.tsx` files. Reuse only platform-neutral values and
logic:

- candidate shared design values: colors, typography, spacing, radii,
  breakpoints, motion, and touch-target policy;
- shareable product code after review: schemas, API clients, types, validators,
  reducers, and state machines;
- migration-only assets: RNW JSX/markup, page copy, visual assets, route intent,
  and accessibility behavior.

Keep the shared layer physically within `packages/ui`, but expose it as an
explicit dependency-free subpath such as `@repo/ui/tokens` rather than a vague
`common` dumping ground. It must have no React, React Native, Tailwind, or DOM
dependency. Both native and web may consume those values. Build web components in
`apps/gurudevi-web` first; extract a `@repo/ui/web` subpath only after repeated,
proven usage.

## Inventory-backed migration sources

### Marketing source: `apps/gurudevi-marketingWeb`

The application is Astro/Svelte with Tailwind v4. Migrate the public route map
and content, not its components or framework configuration.

| Priority | Existing routes | Target responsibility |
| --- | --- | --- |
| P0 | `/`, `/about` | Public product narrative and entry to sanctuary |
| P0 | `/privacy`, `/terms`, `/delete-account` | Legal/account obligations before public cutover |
| P1 | `/support`, `/faq`, `/thuthimal` | Support and informational surface |
| P1 | `/journal`, journal articles, authors | Editorial content and discoverability |
| P2 | feed, robots, llms, knowledge endpoints | Search and machine-readable publishing |

Reuse public assets, Markdown journal and author content, and reviewed facts from
`src/lib/site.ts`. Convert Astro metadata, collection APIs, islands, and scripts
to Next metadata, content loading, route handlers, and React client components.
The current support form's external endpoint must be verified before porting it.
Do not carry stale `gurudevi.edlove.org` or `platform.gurudevi.edlove.org` URLs
forward.

### Product source: `apps/gurudevi-mobile`

The confirmed web shell is `app/(tabs)/_layout.web.tsx`; the actual entry
decision sits in `SessionRouteGate`, not `app/index.tsx`. Treat existing Expo
routes and `appNavigation` as a compatibility input, not the new URL design.

The migration is functional rather than mechanical. Read the legacy shell,
route dispatchers, `.web.tsx` screens, and domain packages to recover the
product's navigation, visible states, and task flow. Then rebuild that behavior
with semantic browser components in Next. Do not import legacy UI trees or
their Expo/React Native/PowerSync dependencies. The authoritative navigation
decision, route-inventory protocol, and navigation experiment are recorded in
`docs/decisions/2026-09-14-gurudevi-web-sanctuary-functional-migration-and-navigation.md`.

| Wave | Existing source journey | New web outcome |
| --- | --- | --- |
| 1 | welcome → auth → onboarding → role resolution | Browser session, callback, onboarding, and a real sanctuary entry |
| 2 | `public-form/[slug]` | Shareable browser form journey |
| 2 | library → collection/resource/video/document | Read/browse resources; scanner, map, OCR, and export remain explicit adapter work |
| 3 | classroom → attendance / gradebook / reflection | Authenticated teacher workflow |
| 4 | profile, self, community, messaging, settings | Product-slice migrations after their contracts are verified |

Some web variants, particularly authentication and onboarding, already use useful
HTML-like structure and Tailwind-style class intent. Lift clean markup, copy, and
flow contracts selectively. Never import their `@repo/ui`, Expo Router, native
storage, haptics, or React Native Web dependency graph into Next.

## Phased execution

### Phase 0 — Freeze and make the boundary enforceable

1. Record this plan and the canonical platform ADR.
2. Mark `gurudevi-marketingWeb` and the RNW target as migration-only for new
   browser feature work.
3. Add a route/deep-link compatibility matrix: current URL, owning source,
   new canonical URL, redirect behavior, authentication requirement, and
   acceptance evidence.
4. Identify the live deployment owners and DNS configuration; do not switch DNS
   yet.

**Exit:** a named owner and target exist for every public/deep link that will be
affected by cutover.

### Phase 1 — Web foundation and design contract

1. Configure Tailwind v4 in `gurudevi-web` using CSS-first theme tokens.
2. Compare the marketing palette and native token values; deliberately choose one
   canonical value for each semantic token.
3. Extract the approved values to `@repo/design-tokens`, then generate CSS custom
   properties for web consumption.
4. Build the small web foundation: document shell, typography, focus styles,
   reduced motion, 44–48 px controls, compact-browser bottom tabs, global
   account controls, and the adaptive canvas boundary. The shell is structure
   and plumbing only; each domain canvas owns its own floor and the furniture
   arranged on it, rather than inheriting a generic dashboard layout.
5. Establish browser tests at 360 px, 390 px, 768 px, and desktop widths.

**Exit:** the foundation contains no React Native Web imports, works with keyboard
and touch, and has G4 browser evidence for the foundation routes.

### Phase 2 — Public web parity

1. Port P0 public and legal routes first, then support and FAQ.
2. Port journal/authors using a chosen Next content loader and static generation.
3. Recreate SEO, structured data, robots, sitemap, feed, and consent behavior
   with an explicit privacy review.
4. Move public assets under the Next public asset policy; ensure the canonical
   domain is configured at deployment time rather than hard-coded early.

**Exit:** every public marketing route has a Next replacement, metadata, and a
tested redirect plan.

### Phase 3 — Functional sanctuary baseline

1. Complete the route-and-behavior inventory for Self, Workspace, Community,
   Library, Profile, Notifications, Settings, and development-only advanced
   routes before writing the shared Sanctuary shell.
2. Prototype and evaluate the two documented desktop navigation variants before
   broad domain-slice implementation; do not use a generic Sanctuary home or
   placeholder dashboard as the baseline.
3. Rebuild session detection, sign-in, callback handling, account recovery,
   logout, and browser-safe persistence using the real authentication provider.
4. Port onboarding and role resolution from their existing state machines and
   contracts; do not reproduce native navigation mechanically.
5. Implement the canonical sanctuary shell, authorization boundary, and error
   states.
6. Test anonymous, authenticated, expired-session, and denied-capability cases.

**Exit:** a user can complete a real browser auth/onboarding journey and enter
their authorized sanctuary—not a mocked screen.

### Phase 4 — First useful product loops

1. Deliver public forms end-to-end with real schema, validation, submission,
   failure, and confirmation behavior.
2. Deliver library browse → resource/collection/document/video read journeys.
3. Add only the browser adapters those journeys need. Defer scanner, OCR, maps,
   and native-only capabilities behind explicit unavailability or replacement
   design.

**Exit:** users can accomplish two valuable product tasks in a browser with real
data and failure behavior.

### Phase 5 — Role workspaces and remaining product slices

1. Rebuild the classroom teacher workflow: classroom selection, attendance,
   gradebook, and reflection.
2. Migrate profile/settings, then self/community/messaging in independently
   accepted vertical slices.
3. Maintain a capability matrix so native-only features never appear as broken
   web controls.

**Exit:** every supported browser role has a clear, real task path; unsupported
capabilities are intentionally designed, not accidental regressions.

### Phase 6 — Production cutover and removal

1. Run route-by-route redirect and deep-link tests against the production
   candidate.
2. Host public routes at `gurudevi.app`; enable `sanctuary.gurudevi.app` only
   after its authentication boundary and HTTPS hosting are ready.
3. Observe error, conversion, and support signals through an agreed monitoring
   window.
4. Archive then remove the marketing deployment and RNW web deployment only after
   all compatibility entries are accepted. Remove dead RNW files in dedicated,
   reviewable changes.

**Exit:** one browser product is live, legacy URLs resolve safely, and no active
deployment depends on RNW or the old marketing application.

## Non-negotiable implementation rules

- No new browser feature work in legacy web targets after Phase 0.
- No direct `@repo/ui` imports from Next.
- No Tailwind + StyleX hybrid.
- No automatic port of a `.web.tsx` component based solely on its extension.
- No legacy route deletion before a tested Next destination and redirect.
- Every migrated vertical slice must include loading, error, empty, unauthorized,
  and mobile-browser behavior—not just its happy path.

## Hexagonal boundary for the browser sanctuary

The public site remains a static delivery surface; introducing ports and adapters
there would be ceremony without a changing external boundary. The authenticated
sanctuary follows hexagonal boundaries instead:

- pure identity, route-policy, and onboarding rules remain in `@repo/core` logic;
- `@repo/core/web-auth` is the browser adapter composition boundary: it registers
  browser persistence before constructing the Supabase client and exposes only a
  discriminated session bootstrap result to Next;
- `@repo/core/web-authorized-entry` is the adjacent application port for the
  first authenticated decision. Its adapter must return an authoritative ready,
  onboarding-required, inactive, or unavailable result; malformed identity data
  is denied rather than inferred. The browser must not query guessed tables or
  reuse mobile ORPC/device state to manufacture this result;
- Next routes and client components are delivery adapters. They may depend on
  `@repo/core/web-auth`, but must not import Expo, React Native, PowerSync, or
  mobile lifecycle modules;
- Supabase URL and publishable-key configuration are supplied at the Next client
  edge through `NEXT_PUBLIC_*` variables. Secrets remain server-only and are never
  embedded in browser route code;
- tests verify the port/adapter contract independently from browser UI evidence.

### Passwordless production prerequisites

- Supply the existing Doppler `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values to the Next build. The Next
  configuration maps them to its browser-safe names, so they are one existing
  project and one existing credential pair; no value is committed or duplicated.
- In the hosted Supabase project, set `https://gurudevi.app/auth/callback` and
  `https://sanctuary.gurudevi.app/auth/callback` as permitted redirect URLs before
  enabling the corresponding host. Keep local development callbacks separately
  allow-listed.
- Configure Google and Apple in Supabase Auth using provider-owned credentials.
  Provider client secrets remain in the Supabase provider configuration, never in
  browser variables or source control. The implemented browser controls report a
  friendly failure until each provider connection has been verified in that
  dashboard.
- Configure production email delivery and templates before relying on magic links.
  The client supports passwordless creation, but delivery, redirect allow-list,
  and provider credentials are deployment state rather than application code.

## Product parity evidence and implementation order

**Evidence date:** 2026-09-12. This section is based on the actual Expo route
tree in `apps/gurudevi-mobile/app`, its route imports, and the direct API/port
contracts in `packages/core`; it is not a promise that every mobile screen can
be reused on the web.

### Route and capability matrix

| Mobile journey family | Mobile source evidence | Browser classification | Earliest web slice | Boundary or blocker |
| --- | --- | --- | --- | --- |
| Entry, welcome, auth, callback, recovery | `app/index.tsx`, `welcome.tsx`, `auth.tsx`, `auth/callback.tsx`, `account-recovery.tsx` | Browser-native | Completed foundation; needs authorized entry next | Supabase SSR claims work, but profile/capacity facts must come from the authorized-entry port. |
| Onboarding and invitation | `onboarding.tsx`, `invitation-welcome.tsx`, `@repo/community/onboarding` | Browser-native candidate | Slice A | Requires authoritative profile mutation, active-bond creation, and signed/expiring invite contract; do not copy guest native state. |
| Public form | `public-form/[slug].tsx`, `@repo/form-builder`, `formTemplatesAPI`, `forms.contract.ts` | Browser-native candidate | Slice B | Published-template read and response submit contracts exist; browser renderer and an explicit anonymous/public authorization decision are still required. |
| Library browse, resource, collection | `library/index.tsx`, `resource/[resourceId].tsx`, `collections/[id].tsx`, `libraryAPI` | Browser-native candidate | Slice C | Direct oRPC resource/collection reads exist; web needs authenticated transport, server policy results, and no guessed storage URLs. |
| Document and video reading | `library/document/[resourceId].tsx`, `video/[resourceId].tsx` | Browser-native candidate | Slice C extension | Requires browser viewer/player, download/CSP policy, and entitlement/denied states. |
| Library tools: image-to-PDF | `library/tools/image-to-pdf.tsx` | Browser-native candidate | Later | Browser File/Blob implementation and memory/error limits required. |
| Library scanner, QR, OCR | `document-scanner.tsx`, `qr.tsx`, `OCRScannerBridge` | Mobile-only until redesigned | Defer | Native camera/scanner bridge; web needs an intentional upload/capture replacement, not a broken control. |
| Library map, review, PDF editor, spreadsheet, cloud export | corresponding `library/*` routes | Defer | Defer | Need dedicated browser interaction, document, and external-provider contracts. |
| Classroom overview, teacher/student dashboards | `workspace/classroom/*`, `@repo/classroom/*` | Browser-native candidate | Slice D | Requires server-authorized classroom selection and role/capacity resolution. |
| Attendance and gradebook | `attendance.tsx`, `gradebook.tsx`, `AttendanceScreen.web.tsx`, `GradebookScreen.web.tsx` | Browser-native candidate | Slice D extension | Existing web-specific screens are reference evidence only; writes need real conflict, retry, and authorization handling. |
| Classroom reflection | `workspace/classroom/reflect.tsx` | Browser-native candidate | Slice D extension | Requires reflection persistence and role-aware data policy. |
| Guardian workspace | `workspace/guardian/*`, admin guardian screens | Browser-native candidate | Later | Guardian-to-student bond and privacy authorization must be server-owned. |
| Principal, workforce, editorial workspaces | `workspace/principal.tsx`, `workforce-role.tsx`, `editorial.tsx` | Browser-native candidate | Later | School-level permission, perspective selection, and authoritative API adapter required. |
| Founder, commercial, fee/payment | `workspace/founder.tsx`, `commercial/[batchId].tsx`, `demo-fee.tsx` | Defer | Defer | Elevated authorization and/or non-production payment semantics make these unsafe early targets. |
| Self and wisdom | `self/index.tsx`, `self/wisdom/[id].tsx`, `@repo/self` | Browser-native candidate | Later | Personal data and content contracts required. |
| AI assistant, durable agents | `self/ai-assistant.tsx`, `a-i-assistant.tsx`, `durable-agents.tsx` | Defer | Defer | Streaming, agent API, session, and failure/approval design not yet established for web. |
| Community feed, profiles, notifications | `community/*`, `notifications.tsx`, `profile/*` | Browser-native candidate | Later | Feed/profile visibility and notification repository; messaging has a server-owned participant boundary. |
| Community chat and direct messages | `community/chat/*`, `direct-messages/*` | Browser-native candidate | Later | Realtime transport and participant authorization are prerequisites. |
| Settings, privacy ledger, mute hub | `settings.tsx`, `profile/privacy-ledger.tsx`, `mute-hub.tsx` | Browser-native candidate | Later | Browser storage, privacy-ledger API, and moderation policy required. |
| UI showcase and icon lab | `ui-showcase.tsx`, `icon-lab*.tsx` | Internal only | Retire/defer | Not a product-parity target. |

The native tab shell (`app/(tabs)/_layout.web.tsx`) is useful route-intent
evidence but not a web shell to import: it couples PowerSync, native-oriented
repositories, notification/reward hydration, perspective state, and Cedar
permission state. Browser routes must use semantic DOM and independently chosen
web adapters.

### Reusable contracts and data boundaries

| Need | Existing evidence | Web reuse decision |
| --- | --- | --- |
| Session verification | `@repo/core/web-auth`; Next SSR client and `proxy.ts` | Reuse browser authentication semantics; server routes verify with `getClaims()`, never authorize with `getSession()`. |
| Route policy | `logic/auth/bootstrapContract.ts`, `bootstrapRoutes.ts`, `identityState.ts` | Reuse as pure decision rules after a browser adapter supplies authoritative inputs. |
| Identity/profile/capacity | `identityORPCContract`, `IdentitySchema`, `ClassroomCapacitySummarySchema`, `resolveAuthProfile` | Reuse schemas and pure mapping only. Existing `identityAPI` imports native guest state and global mobile clients, so it is not a Next adapter. |
| Onboarding | `onboardingORPCContract`, `logic/domains/profile/onboarding.ts` | Reuse state semantics and server command intent; do not send a browser-chosen subject ID or capacity. |
| Forms | `forms.contract.ts`, `formTemplatesAPI` | Reuse request/response schemas after an explicit browser transport and public-read policy are accepted. |
| Library | `libraryAPI`, oRPC library procedures | Reuse server-owned resource contracts after browser authenticated transport exists; no direct table/storage access. |
| Classroom and sync | `DATA_HIGHWAYS.workspace_sync`, PowerSync adapters | Defer replication. Web starts with direct authoritative reads/writes; PowerSync is not a prerequisite for the first browser task. |

### First vertical slices

**Slice A — authorized entry and minimal onboarding.** Build the browser adapter
behind `@repo/core/web-authorized-entry`, then `/sanctuary` and `/onboarding`
around its authoritative `ready`, `onboarding-required`, `inactive`, and
`unavailable` results. This is the first mandatory slice: no role workspace is
allowed to infer a profile or capacity from auth metadata.

**Slice B — public form read and submit.** Deliver one published form at
`/forms/[slug]` using real template retrieval, validation, submission,
confirmation, unavailable, and duplicate/failure behavior. It is valuable
without requiring a full role shell, but cannot begin until the public form
policy and browser-safe renderer are confirmed.

**Slice C — read-only library.** Deliver browse → resource/collection →
document/video read, with actual server authorization, empty/denied/not-found
states, and browser-native viewers. Do not bring scanner, OCR, maps, or cloud
export along with it.

**Slice D — one teacher classroom loop.** After capacity resolution works,
deliver classroom selection → attendance read/write → retry/conflict outcome.
Gradebook and reflection are follow-on loops, not automatic scope.

### Strict parity acceptance criteria

A slice may be called parity-ready only when all of the following are true:

1. It has a canonical Next URL and a documented legacy mapping; parameters and
   safe return paths are preserved without forwarding opaque auth/invite tokens.
2. It uses real provider/API data and server authorization. Fixtures may test a
   boundary but cannot be offered as the product path.
3. It has explicit loading, unavailable, signed-out, inactive/denied, empty,
   not-found, validation, and mutation-failure states applicable to the task.
4. It has semantic HTML, keyboard access, visible focus, 44 px minimum controls,
   and verified phone layouts at 360 px and 390 px plus tablet/desktop review.
5. G0 contract tests cover pure mapping/validation; G2 covers the API boundary;
   G4 browser evidence covers the actual route and its key failure path. Test
   reports must state engine, passed count, substitutions, and limitations.
6. It imports neither Expo/React Native/React Native Web/PowerSync nor the
   mobile lifecycle. Shared schemas and pure logic are allowed only after import
   review.
7. A legacy route is not redirected or removed until this evidence exists.

### Hard blockers before product parity

1. `@repo/core/web-authorized-entry` has a dependency-free source contract but
   needs its public package export and a real browser/server adapter. The adapter
   must normalize the existing identity/capacity contracts into one authoritative
   result and keep `completeOnboarding()` server-owned.
2. The current core direct-API clients rely on global token and active-bond
   resolvers in `api/clientRuntime.ts`, registered by mobile runtime behavior.
   Next needs a per-request/server-side authenticated transport using verified
   claims and a server-derived active context; importing mobile registration is
   prohibited.
3. The deployed Sanctuary API origin, browser-to-server trust, CORS/cookie
   behavior, and identity procedure availability have not been proven from the
   Next runtime. `NEXT_PUBLIC_API_URL` is configuration, not evidence that the
   API accepts a browser flow.
4. Form contracts identify published template retrieval, but the browser-safe
   renderer and explicit anonymous/public submission policy remain unverified.
5. Resource/document/video browser delivery requires entitlement, signed URL or
   download policy, and CSP/media behavior; existing mobile viewers do not prove
   these browser boundaries.
