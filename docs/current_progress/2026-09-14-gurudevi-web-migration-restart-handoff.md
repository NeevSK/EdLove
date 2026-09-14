---
title: "Gurudevi Next.js Web Migration Restart Handoff"
status: "active"
created: 2026-09-14
updated: 2026-09-14
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, nextjs, migration, handoff, multi-agent]
---

# Gurudevi Next.js Web Migration Restart Handoff

## Purpose

Resume the migration from the legacy React Native Web (RNW) and Astro browser
surfaces to the canonical Next.js App Router application at
`apps/gurudevi-web`, without restarting completed work or treating existing
implementation as production evidence.

## Canonical decisions

- `apps/gurudevi-web` owns the browser product.
- `gurudevi.app` is the public origin; `sanctuary.gurudevi.app` is the future
  authenticated origin. `/sanctuary` is the temporary route until host routing
  is ready.
- Android and iOS remain in `apps/gurudevi-mobile`.
- RNW and the Astro marketing application remain live legacy surfaces until
  equivalent browser journeys are accepted. Do not delete or redirect them
  prematurely.
- Browser UI is semantic HTML and CSS. Do not import Expo, React Native,
  React Native Web, PowerSync, or mobile lifecycle modules into
  `apps/gurudevi-web`.
- The legacy tab shell and browser-specific domain screens are the functional
  migration source. Rebuild their user-visible behavior and task flows, not
  their renderer or dependency graph. See
  `docs/decisions/2026-09-14-gurudevi-web-sanctuary-functional-migration-and-navigation.md`.
- Public exploration is a first-class local browser session, not a separate
  preview or an automatic anonymous cloud account. See
  `docs/decisions/2026-09-14-sanctuary-explore-access-and-persistence.md`.
- The real product uses the existing shared canvas model and domain-owned floors
  before Explore, guest-cloud, or durable-account adapters. Those sessions swap
  plumbing below one domain feature tree; they do not fork it. See
  `docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`.

Read these first, in this order:

1. `AGENTS.md`
2. `apps/gurudevi-web/AGENTS.md`
3. `docs/decisions/2026-09-12-gurudevi-web-canonical-platform.md`
4. `docs/current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md`
5. `docs/current_progress/2026-09-12-gurudevi-web-route-compatibility-matrix.md`
6. This handoff

## Observed checkpoint on 2026-09-14

This is an inventory observation, not acceptance evidence. No build, type
check, lint, browser, API, or production verification was run for this handoff.

Already present in `apps/gurudevi-web`:

- Next.js App Router application, public and sanctuary route groups, global
  styling, sitemap, robots, SEO, feed, and knowledge routes.
- Public marketing, about, legal, FAQ, support, Thuthimal, journal, and author
  routes.
- Browser authentication screens for sign-in, sign-up, callback, password
  reset, and recovery.
- A Sanctuary entry route that verifies Supabase claims and calls the
  authoritative Sanctuary identity endpoint before showing its entry state.
- Public exports for `@repo/core/web-auth` and
  `@repo/core/web-authorized-entry`.

Important reconciliation: `apps/gurudevi-web/CONTEXT.md` still says there is
no authentication or production data. That description is stale relative to
the files above. Do not declare the replacement complete: authenticate and
authorized-entry behavior must be tested against actual configuration and the
Sanctuary API.

## Operating model

Use a hybrid approach: establish a thin, durable horizontal web foundation,
then deliver vertical product slices that deepen only the shell they truly
need.

### Horizontal foundation

- Public shell: marketing header, footer, mobile navigation, typography,
  metadata, and legal/editorial route behavior.
- Sanctuary shell: authenticated frame, mobile navigation, account controls,
  route-state treatment, focus management, and responsive layouts.
- Sanctuary IA: Self, Workspace, Community, and Library are the primary work
  domains; Profile, Notifications, and Settings are persistent account controls;
  Advanced is development-only. Evaluate the documented rail-island and
  global-header-island variants before broad implementation.
- Sanctuary uses an adaptive canvas contract: the shell owns only the frame,
  navigation, and plumbing; each domain owns its own responsive canvas/floor
  and the furniture arranged on it.
- Each domain also owns its documented spatial atmosphere and transition intent;
  the shell must remain quiet rather than flattening them into a single dashboard
  theme.
  Compact browsers use bottom tabs for the four primary domains; do not treat
  old viewport bands as a device-classification system.
- Web primitives: semantic form controls, buttons, loading, empty, error,
  unavailable, and reduced-motion patterns.
- Security boundaries: return-path validation, browser session handling,
  server-derived authorization context, and configuration failure states.

Do not build a speculative universal dashboard, role switcher, tab system, or
all workspace menus before a real accepted journey needs them.

### Vertical slices, in dependency order

1. Authorized entry and minimal onboarding.
2. Public form read and submit.
3. Read-only library: browse, collection/resource, document/video delivery.
4. One teacher classroom loop: selection, attendance read/write, retry or
   conflict outcome.
5. Independently accepted profile/settings, self, community, and messaging
   slices.

Native-only capabilities, including scanner, QR, OCR, some document tooling,
and device-native integrations, require an explicit browser replacement or
unavailability design before they receive a web route.

## Phased restart plan

### Phase R0 - Reconciliation and acceptance baseline

Goal: determine factual status without changing product behavior.

- Compare every existing Next route to the route matrix; label each as
  scaffolded, implemented but unverified, accepted, deferred, or intentionally
  unsupported.
- Trace imports from `apps/gurudevi-web` to prove no prohibited mobile runtime
  dependencies cross the browser boundary.
- Run the scoped type and lint commands, then inspect their output.
- Start the app only after configuration is available and collect browser
  evidence at 360 px, 390 px, 768 px, and desktop for the existing public and
  auth foundations.
- Test anonymous, configured-but-unavailable, and return-path safety behavior.

Exit: one factual scorecard, one prioritized blocker list, and no unsupported
claim that existing code is production-ready.

### Phase R1 - Complete the thin web spine

Goal: make public and Sanctuary shells coherent without speculative product
chrome.

- Audit the existing public header/footer/navigation and responsive behavior.
- Inventory the legacy tab shell, all current tab routes, relevant `.web.tsx`
  screens, and their domain packages before defining a Next component boundary.
- Define the minimum Sanctuary shell around real authorized entry: navigation,
  sign-out/account affordance, route frame, keyboard/focus rules, and state
  presentation.
- Reuse only shared tokens and platform-neutral contracts; create browser CSS
  components where needed.
- Add route-level browser evidence for the foundation and its failure states.
- Define the public `/explore` route family and its browser-safe local
  persistence contract before admitting guest or sandbox behavior into the
  durable `/sanctuary` boundary.

Exit: a coherent phone-first public and authenticated frame that real slices
can extend.

### Phase R2 - Prove authorized entry and onboarding

Goal: establish the first trusted browser product boundary.

- Verify Supabase redirect URLs, browser persistence, callback exchange, API
  origin, CORS/cookie behavior, and Sanctuary identity procedure availability.
- Test signed-out, authenticated ready, inactive/onboarding-required, expired,
  malformed, and API-unavailable cases.
- Build browser onboarding only after its server-owned command and invitation
  policy are proven; do not infer capacity from auth metadata.

Exit: a real browser user reaches only the server-authorized sanctuary result.

### Phase R3 - Deliver vertical slices

Goal: add valuable work without reintroducing mobile assumptions.

- Deliver forms, then library, then the teacher attendance loop in the order
  above.
- Each slice includes the relevant loading, empty, denied, not-found,
  validation, failure, and responsive states.
- Extend the Sanctuary shell only where the slice proves a navigation or
  information-architecture need.

Exit per slice: canonical route, documented legacy mapping, real authorized
data, G0/G2/G4 evidence, and explicit limitations.

### Phase R4 - Production cutover

Goal: retire legacy browser surfaces only after evidence and operations exist.

- Run route-by-route compatibility and redirect tests on a production
  candidate.
- Configure production host routing and HTTPS only when the auth boundary is
  ready.
- Observe errors, conversion, and support signals through an agreed window.
- Archive and remove legacy deployments and RNW files only in separate,
  reviewable changes after acceptance.

## Multi-agent arrangement

Project configuration enables up to ten concurrent spawned agents after Codex
is restarted. Terra and Luna profiles use low reasoning effort by default to
control token use; request a higher effort only for a specific difficult
architecture, security, or integration decision. Use the hierarchy only for
independent work:

```text
Root: migration architect and final integrator
|- Terra: public shell and SEO workstream
|  `- Luna workers: bounded audit or implementation tasks
|- Terra: Sanctuary/auth boundary workstream
|  `- Luna workers: contract, browser, or component tasks
`- Terra: active product-slice workstream
   `- Luna workers: narrowly owned route or test tasks
```

- Terras are reserved for real implementation workstreams, recurring execution,
  and integration: they own the contract, file-ownership map, acceptance
  criteria, integration review, and escalations. Do not spend a Terra on a
  simple document read, codebase search, or one-off exploration.
- Lunas handle bounded reconnaissance, documentation audits, read-only source
  archaeology, small mechanical tasks, and isolated implementation with a clear
  file boundary. They should not edit shared shell files unless that ownership
  is explicit.
- The root agent enforces this split at dispatch time. When a task expands from
  investigation into cross-cutting implementation or recurring ownership, stop
  and reassign it to a Terra rather than silently stretching a Luna brief.
- Parallelize reconnaissance, tests, documentation, and isolated routes first.
  Serialize changes to shared layouts, auth/session code, global CSS, package
  configuration, and redirects.
- Do not use all concurrency merely because it is available; subagents consume
  additional tokens and parallel writes create conflicts.

Custom roles live in `.codex/agents/gurudevi-web-terra.toml` and
`.codex/agents/gurudevi-web-luna.toml`.

## Required verification reporting

Follow the repository test-claim protocol. A passing command alone is not a
product acceptance claim. For every reported test result, state the exact
command/configuration, evidence level, engine/runtime, scenarios and counts,
what it proves, and what it does not prove.

Use the project quality gates for implementation changes, including scoped
type/lint/test work and `pnpm run check:anti-slop`. Never weaken a test or a
quality gate to obtain a passing result.

## Restart prompt

Use this in the new Codex task after restarting:

```text
Resume the Gurudevi RNW/Astro-to-Next.js migration from
docs/current_progress/2026-09-14-gurudevi-web-migration-restart-handoff.md.
Read `docs/current_progress/2026-09-14-gurudevi-sanctuary-web-implementation-plan.md`,
especially “Continuation checkpoint: parallel work and integration order.”
Start with the five read-only Luna domain/core audits. Do not extend Explore
scaffolding or invent a generic browser canvas. Build the real account-backed
domain behavior first, using the existing core canvas model and a
domain-owned floor; add Explore only as an adapter to that accepted component
and command contract.
```
