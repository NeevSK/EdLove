# Gurudevi Web Hard Cutover Plan

**Status:** approved direction, ready for implementation sequencing  
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
   reduced motion, 44–48 px controls, mobile navigation, form controls, empty,
   error, and loading patterns.
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

1. Rebuild session detection, sign-in, callback handling, account recovery,
   logout, and browser-safe persistence using the real authentication provider.
2. Port onboarding and role resolution from their existing state machines and
   contracts; do not reproduce native navigation mechanically.
3. Implement the canonical sanctuary shell, authorization boundary, and error
   states.
4. Test anonymous, authenticated, expired-session, and denied-capability cases.

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
