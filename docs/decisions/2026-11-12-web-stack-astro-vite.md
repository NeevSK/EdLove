---
title: "Web stack: Astro for public pages, Vite + TanStack Router for the app"
status: "accepted (engineering); product questions open, see the last section"
created: 2026-11-12
author: "Naveen"
scribe: "Claude"
supersedes: "2026-10-14-web-platform-standardization-nextjs-16-over-tanstack-start.md"
keeps: "2026-09-12-gurudevi-web-canonical-platform.md (leaving React Native Web), 2026-09-14-sanctuary-explore-access-and-persistence.md (Explore is the real app on local data)"
tags: [adr, web, astro, vite, tanstack-router, nextjs, explore, sanctuary, offline]
---

# Web stack: Astro for public pages, Vite + TanStack Router for the app

## Decision

| Site | Job | Built with | Where it lives |
| --- | --- | --- | --- |
| `gurudevi.app` | Public pages: the same for every visitor, read by search engines and AI agents | **Astro**, static, React islands only where a page needs interaction | `apps/gurudevi-public` |
| `edlove.org` | The wider EdLove site, separate from Gurudevi | **Astro** (unchanged) | `apps/edlove-web` |
| `explore.gurudevi.app` | The real app on local sample data: no account, no API, no database | **Vite + React + TanStack Router**, built with `--mode explore` | `apps/gurudevi-web` (`spa/`) |
| `sanctuary.gurudevi.app` | The real app for signed-in people, talking to the v1 API | **The same Vite app**, account build | `apps/gurudevi-web` (`spa/`) |
| Android, iOS | Native app | Expo (unchanged) | `apps/gurudevi-mobile` |

Next.js leaves the repository once the last journey has moved. Until then it keeps building and
serving everything it serves today. `apps/gurudevi-marketingWeb` stays deprecated and is removed
only with the owner's sign-off once `apps/gurudevi-public` covers its pages.

## Why, in one rule: where does the page's content come from?

| Content comes from | What that needs | Here |
| --- | --- | --- |
| The author, at publish time | HTML built once, served as files | Public pages, edlove.org, public library catalogue pages |
| The person's device and the API, after sign-in | A client app: download once, the browser builds each screen | Explore, sanctuary |
| The server, fresh for each request, before any JavaScript | Server rendering | Nothing in Gurudevi needs this |

Next.js is built mainly for the third row. Gurudevi's public site is the first row and its app is
the second.

### Server rendering versus client app, concretely

- **Server-rendered page:** the browser asks; the server runs the components, fetches data, sends
  finished HTML plus the JavaScript to make it interactive. Every navigation asks the server again.
  With no network, the page does not open.
- **Static page:** the same work happens once at deploy. The browser gets a file. Fastest and
  cheapest, but only for content that is the same for everyone.
- **Client app:** the browser downloads the app once (cached by a service worker). Every screen is
  built in the browser from data it already has or fetches from the API. The app still opens offline
  and shows what it last had.

**"Server app" is about where the screen is built, not where the data lives.** LMS, ERP and library
data live on the server (Postgres, object storage) in every option. Gmail's mail lives on Google's
servers and Gmail is a client app. The client app reads and writes through the API; the API and the
database stay the authority (`authority-model.md`: the server decides, the device only hides).

What each side does:

| Concern | Server (API, Postgres, Cedar) | Client app (browser) |
| --- | --- | --- |
| Who may do what | Decides and enforces | Hides what is not allowed |
| Records (grades, fees, enrolment) | Owns them, validates every command | Shows them, queues commands (outbox) |
| Screens, taps, animation, worlds | Not involved | Builds them |
| Drafts, unsent work | Not involved | Keeps them on the device until sent |
| Offline | Not reachable | Opens, shows last data, keeps writes queued |

### What `'use client'` meant

In the Next App Router every component runs on the server unless marked `'use client'`. Anything
interactive (taps, state, Zustand, storage, animation) must be marked. In `app/(sanctuary)` 171 of
257 files carry the mark: the app is a client app inside a server-first framework.

## What the code showed (12 Nov 2026, branch `integrate/nov-consolidation`)

- **The Next app renders 91 of its 98 routes on the server per request.** The root layout reads
  `cookies()` for the language, which makes every page dynamic, marketing included.
- **Sanctuary pages fetch on the server.** 41 of 66 pages create a server Supabase client; 48 gate
  login on the server. So the web sanctuary cannot open offline today.
- **Explore is an `if` inside each page.** 19 pages check the host or `?mode=explore` and render a
  hard-coded guest. The Explore ADR forbids a separate demo branch; the Vite build replaces the check
  with a build mode.
- **Next is not used for its strengths.** 2 API routes and 1 server action.
- **The 14 Oct ADR's reasons do not hold:** it says `edlove-web` is Next (it is Astro); it makes
  COOP/COEP headers an invariant (they are not in `next.config.ts`); it relies on
  `experimental.useOffline`, which is not enabled and which Next documents as experimental and not
  for production; and its "two bundlers" objection misses that Vite is already in the repo (Vitest
  and Astro run on it).

## Measured: the same home page, Next versus Astro

Same content (13 headings, about 540 words). Next 16.4.5 production build served with `next start`;
Astro 7.4 static build. Sizes from the built files; gzip is what crosses the network.

| What a phone downloads | Next today | Astro |
| --- | --- | --- |
| HTML | 1,545 KB (156 KB gzip) | 48 KB (10 KB gzip) |
| JavaScript | 920 KB in 12 files (274 KB gzip) | **0** (the language picker island loads only at 640 px and wider) |
| World styles | 719 KB inlined in the HTML and repeated in the React payload, on every page | `worlds.css`, 70 KB gzip, cached after the first visit |
| Built | per request on a server | once at deploy, about 4 s for 3 locales |
| Hosting | a Node server | any static host |

Fair reading: most of Next's weight comes from one fixable choice (inlining every world's CSS) and
from the cookie read that makes pages dynamic. Next could be brought closer with work; Astro is lean
by default. On a 2G or 3G connection the difference is seconds per page.

## How the move works without breaking anything

1. **Nothing is removed until its replacement is proven.** Next keeps building from `app/`. The Vite
   build (`apps/gurudevi-web/vite.config.ts`, routes in `spa/routes`) runs the *existing* screens.
2. **Stand-ins, not rewrites.** `spa/next/{link,navigation,image}` replace `next/link`,
   `next/navigation` and `next/image` in the Vite build, so a screen runs in both builds unchanged.
   Each screen drops its `next/*` imports when it moves; then the stand-ins go.
3. **Shared code moved, not copied.** The web dictionaries, locales and site constants now live in
   `@repo/core` (`logic/i18n/web-*`, `site.ts`) and are read by Next, Astro and Vite alike.
4. **Gates that only go down** (`node scripts/check-web-stack.mjs`, in the quality gate; numbers in
   `tooling/web-stack-ratchet.json`):
   - `nextImportFiles`: screens and libraries in `app/` and `lib/` importing `next/*`. Next's own
     route files (`page.tsx`, `layout.tsx`, `route.ts`, ...) are not counted: they go with Next. 84 on
     12 Nov.
   - `exploreBackendClients`: backend client code found in the Explore bundle. Target: none.
   - `directDatabaseCalls` and `surfaceBranches`: below, under *Data* and *One app*.
5. **A codemod does the predictable part** (`node scripts/codemods/web-migrate.mjs`, dry run by
   default; `--write --segment=explore` writes routes and never overwrites one). It sorts every page
   (explore-ready, explore-review, client-wrap, server-data, astro-static, astro-island) and lifts each
   page's signed-in floor into a route that reads the session. Second run, 12 Nov: 43 of 67 sanctuary
   pages generated; the rest (entry flows, redirects, pages with their own data or a capacity gate)
   were written by hand, because the codemod lifts only a page's last return and would have dropped
   the gates and the personal-bond state in between.
6. **Each route moves as a journey,** with browser evidence (phone-size screenshot, no console
   errors, no backend requests on Explore) before the Next route retires.

### Order of work

1. **Public site: done (12 Nov).** Every public page now lives in `apps/gurudevi-public`: home, about,
   FAQ, thuthimal, status, intro, journal, journal entries, authors, the four legal documents, and the
   Sinhala and Tamil sections. Also `robots.txt`, the sitemap, `llms.txt`, `llms-full.txt`,
   `knowledge.json` and the journal RSS feed. The Next `(marketing)` routes and `app/si`, `app/ta` are
   gone; `/support` is an app page and moved to `app/(sanctuary)/(support)`. Content pages ship no
   JavaScript; `/status` and `/intro` are islands. `gurudevi.app` must point at this build when the
   branch is deployed.
2. **Routes: done (12 Nov).** Every Explore and sanctuary page is a route in `spa/routes`, served by
   both builds. Checked in Chrome: 52 Explore paths render or redirect as intended; on the sanctuary
   build a signed-out visitor to any app path lands on `/welcome?returnTo=…` with the full path and
   query, email links finish at `/auth/complete`, and `?dev=true` previews a capacity in development.
   Next still serves these pages until the hosts point at the Vite builds.
3. Explore: remove the backend clients from its bundle (the ratchet list reaches empty); point
   `explore.gurudevi.app` at it.
4. Sanctuary: per journey, move each floor's data to a `Source` answered by the v1 API, and add the
   app shell service worker and the outbox for the writes that need it (levels W1, W2, W4 in
   `client-state-and-web-offline-capability-canon.md`). Point `sanctuary.gurudevi.app` at it.
5. Remove Next, the stand-ins in `spa/next`, `proxy.ts` host routing and its cookie stripping, and
   the codemod in `scripts/codemods`.

### Where shared code lives

| What | Home | Read by |
| --- | --- | --- |
| Site constants, contact emails, crawler rules | `@repo/core/site` | public site, app, mobile |
| Web dictionaries and locales | `@repo/core/logic/i18n/web-*` | public site, app |
| Fonts, Tailwind theme, worlds, script typography | `@repo/ui/theme/web/base.css` | each site's entry stylesheet |
| Journal, localized copy, intro story | `apps/gurudevi-public/src/content` | public site only |

### What does not change

- `@repo/ui`, the worlds, tokens and every shared package: none imports Next.
- 315 of 498 files in `apps/gurudevi-web` do not import Next and move as they are; 117 CSS modules
  work in Vite unchanged.
- The mobile app.

## One app, two surfaces

Explore and sanctuary are **one web app**, never two sites that could drift. Every route, screen and
component is shared; Explore is a public place to try Gurudevi with no account. What differs is only
what the surface plugs in at the root (`spa/main.tsx`):

| Plugged in | Explore | Sanctuary |
| --- | --- | --- |
| **Session** (`spa/surface/session.tsx`): who is here | a visitor and the persona they chose (teacher by default), kept on the device | the signed-in account and its authority |
| **Sources** (`spa/surface/sources.ts`): where each query is answered | sample data in the browser (`spa/surface/explore.tsx`) | the v1 API (`v1.….queryOptions()`) |
| **Storage** | the browser only | the API, with the outbox for writes |

Rules that keep it one app:
- A route reads `useSession()` and runs `useSuspenseQuery(sources.x())`; its loader prefetches the same
  query with `ensureQueryData`. Routes never ask which surface they are on.
- Routes sit in three pathless groups. `_app` holds the places; it settles access (signed out, needs
  onboarding, inactive, unavailable, ready) and mounts the shell once, from the session, so it stays
  in place while people move between places. `_account` holds sign-in, recovery, onboarding and the
  email-link routes; where accounts live elsewhere (`accountHome`: Explore) it opens the same address
  on sanctuary. `_dev` holds labs and the kit, which are not found in a production build.
- What a person is offered follows [places, roles and features](../architecture/places-roles-and-features.md):
  each capacity has its own Workspace floor (`@repo/core/logic/places/workspaceCatalog`), every menu
  lists that floor, and `FloorGate` in `_app` sends a link to another floor's feature to the
  person's own Workspace. Nothing on screen says a place is not for someone. The API is what
  enforces access; this decides what the screen offers.
- A new kind of data gets a `Source` in `Sources`, with an Explore answer and an API answer, before a
  screen reads it.
- `check-web-stack` counts the screens that still ask (`isExplore`, `mode === 'explore'`, ...): 147 on
  12 Nov. 132 are inside floors that pick sample data themselves; 15 are routes handing those floors
  a `mode` or `isExplore` prop (until the move they sat in uncounted `page.tsx` files). The number
  only goes down; each floor moves its data behind a `Source`, and its route stops passing the prop.

## Data, state and links in the web app

**No database from the web, ever.** The browser reaches data only through the v1 API (oRPC v2 client
from `@repo/core/api/v1`), and the API and Postgres stay the authority. `check-web-stack` counts direct
database calls in web code (`.from('table')`, `.rpc(`, storage, realtime): 17 on 12 Nov, in five
files; the number may only go down, to 0.

**State follows the same model as mobile** (`2026-11-11-product-shape-and-tool-ownership.md`); only
the storage adapters differ:

| Kind of state | Tool | Web adapter |
| --- | --- | --- |
| Server data | TanStack Query over the oRPC client; keys include account and bond | memory, cleared on account switch |
| Writes that must survive a drop | the outbox in `@repo/core` (idempotency key, receipt) | IndexedDB; one tab replays (Web Locks) |
| What the person may do | one authority read over the signed snapshot | same |
| Small shared client state | Zustand slices from `@repo/core`, versioned `persist` | `localStorage` through the storage port |
| Long, recoverable flows | XState 6 | same |
| One screen | React state | same |

The synced SQLite replica (PowerSync) stays on mobile; the web stays at W1, W2 and W4.

**Links are the state you can share.**
- Routes are files in `spa/routes`; path params name the thing (`/library/reader/$bookId`).
- View state someone may send (tab, filter, page, an open sheet) lives in typed search params
  (`validateSearch` with the Zod schema), so a copied link opens the same view.
- The host serves `index.html` for every unknown path, so a shared link or a refresh opens directly.
- A signed-out visitor to a sanctuary link goes to sign-in with the target in the URL and returns to it.
- Public pages carry Open Graph and JSON-LD from Astro; app pages are private and share one preview.
- `/.well-known/` files on both domains let a link open the mobile app when it is installed.

## Router choice and agents

TanStack Router keeps file-based routing (`spa/routes/*.tsx` generate `spa/generated/routeTree.gen.ts`)
and types every path, param and search key, so a wrong link is a type error. It has less training
data than Next and its API changed before v1, so weaker models may write beta-era code. Guards:
one reference route to copy (`spa/routes/_app/notifications.tsx`), typecheck in CI, and a lint ban on the old APIs
when the first one appears. A client app also removes the server/client boundary, the most common
source of agent mistakes in the App Router.

React Router v7 was the alternative: more training data, weaker types, and frequent v5/v6/v7 mixing
by agents.

## Found and fixed while verifying

- Contact emails: they were defined in three places with two domains. The owner chose `@gurudevi.lk` as
  the official addresses (12 Nov); `@repo/core/site` now reads them from `@repo/core/config/publicUrls`.
- `llms.txt` advertised `/llms-full.txt`, which did not exist; it now does, with every journal essay.
- `next build` stopped on a test importing that missing route; the test moved with the files it tests
  and passes.
- Two infinite loops, both from earlier code, appeared once the shell stayed mounted:
  - Opening a workspace task at the task limit changed nothing, but the workbench still announced a
    change; every store rehydrated, re-rendered and opened the task again. The store now stays silent
    when nothing changed (a test covers it), and `LayeredDeckHeader` measures with a `ResizeObserver`
    instead of on every render.
  - `<Navigate>` restarts whenever its props change, and a `returnTo` read from the location during
    that navigation nested the destination inside itself until the tab ran out of memory. Access
    redirects use `GoTo` (`spa/surface/navigation.tsx`), which goes once with the address the person
    was on.
- `SyncStatusPill` probed `sanctuary.gurudevi.app` every 30 seconds, including on Explore. It is no
longer rendered in Explore mode (there is nothing to sync). Verified in a 390 px Chrome page:
no requests to the sanctuary host.

## Known follow-ups (engineering)

- Five brand files (mark, favicon, flag, two Tutii cutouts) are in both sites' `public/`; they should
  become imports from `@repo/ui` assets.
- Fonts come from Google on every site. Self-hosting needs the worlds' font definitions
  (`Fraunces-VF`, `Newsreader-VF`) and the CSS fallbacks to agree on family names first; then the
  policies drop both Google origins.
- Pre-authentication rate limiting: Cloudflare rules in front of the API (its threat model has them).
- The build-time env names still say `NEXT_PUBLIC_*` (shared with `@repo/core`); rename across core,
  web and the deploy job together.
- The library reader's demo document (`/sample-curriculum.pdf`) does not exist, so its frame shows
  nothing (it did under Next too).
- Fonts load from Google Fonts on every site; self-host them so pages work offline and on a first
  visit without a third party.
- `worlds.css` carries every world (718 KB raw). Serve the active world, load others on change.
- An Explore runtime check in CI (headless browser, fail on any backend request); the bundle
  ratchet cannot see a request to a URL that also appears in a link.
- `components/intro/IntroClient.tsx` is not used by a page yet; the owner keeps it for a better intro
  (out of scope here).
- `@repo/ui/utils/urls.ts` duplicates `@repo/core/config/publicUrls` (and has diverged: it validates
  URLs). One should re-export the other.
- `tests/unit/supportHub.test.ts` "serves own support page directly on explore" fails on the base
  branch as well.

## The next shape of the seam: one client, two implementations of the contract

Today the surfaces differ in a hand-written list of `Sources`, and 146 places inside floors still
pick sample data themselves. Both are a second description of the API that can drift from it.

The v1 API is contract-first already: `appContract` lives in `@repo/core/api/v1/contract.ts` and the
server is `implement(appContract)`. So Explore can be **a second implementation of the same
contract**, a sample school that runs in the browser, and the app gets one client of one type
(`AppContractClient`) on both surfaces:

| | Sanctuary | Explore |
| --- | --- | --- |
| Client | `createORPCClient(RPCLink)` over HTTPS | `createRouterClient(sampleSchool)` in the page |
| Who is here | `identity.entry` from the API | `identity.entry` from the sample school (the four personas are its bonds) |
| Data | Postgres, through the API | sample data, kept in IndexedDB |
| Screens | `v1.x.queryOptions()` | the same line |

What it buys:
- **Drift cannot compile.** `implement(appContract).router({...})` requires every procedure, so a
  procedure added to the contract fails the Explore build until the sample school answers it, and
  the contract's own schemas validate every input and output on Explore too.
- **The surface collapses to one value:** the client. Sources, `accountHome`-style switches and the
  floors' sample-data branches go; the session comes from `identity.entry` on both, so the access
  ladder is the same code too.
- **Mobile can use it** for a no-account mode: the sample school lives in `@repo/core`.
- **Isolation by construction.** A visitor's account id is minted with the `nonProduction` origin
  (`edloveUuidV8`), so no real API accepts it; Explore cannot sign an authority snapshot, so nothing
  it produces verifies anywhere.

Measured with a spike on 13 Nov (removed afterwards): the sample school implementing `appContract`
type-checks as an `AppContractClient`, validates through the contract (an empty display name is
rejected), runs in a browser bundle with no Node built-ins, and adds about 7 KB gzipped beyond the
oRPC client and Zod the app already ships.

The same pattern exists elsewhere: tRPC's `localLink` calls a router in-process without HTTP, and
oRPC documents `createRouterClient` for the same purpose. Products that offer a no-account mode
(Actual Budget runs fully in the browser with no server) keep one codebase and swap where the data
lives. Two lessons from others: Stripe moved from a test mode that shared settings with live mode
to fully isolated sandboxes, because shared state leaked between them; and demos built by patching
`fetch` (MSW, mock routers) drift from the real API, since nothing checks them against it. A
contract implementation is checked by the compiler.

Order: the contract grows as v1 procedures land (only identity and authority exist today); each new
procedure gets its sample-school answer in the same change, and a floor moves from local sample
data to the query when both exist. Until then `Sources` stays as the bridge.

## Security review (13 Nov)

Fixed now:
- **The Vite builds sent no security headers.** Next's proxy set the CSP (which is what made the
  browser refuse any Explore connection to the backend), framing protection and HSTS; a static build
  has no proxy. The headers are now one definition (`lib/security/responseHeaders.ts`) used by the
  proxy and written by each Vite build to `_headers`, with `_redirects` for direct links. Explore's
  CSP allows connections to its own origin only. The Vite builds have no inline scripts, so their
  `script-src` drops `'unsafe-inline'`, stricter than Next. Checked in Chrome with those headers:
  no violations on seven Explore places; the only outside requests are Google Fonts.
- **Sign-out could not complete in the client build:** it asked a Next route to clear server cookies.
  The client build has none (the browser client holds the session and clears it); it now skips that
  step there and still refuses to finish while the local session remains (two tests).
- **Verger Lab** was open in production after the move (its page was development-only); it is in
  `_dev` again.

Checked and sound:
- Explore's build blanks every backend setting; the dev preview's reader is not in the production
  bundle; no sourcemaps ship; return paths go through `safeReturnPath`; the API re-checks the bond
  named in every command, so the client's bond cookie only selects.

Open (engineering):
- The Explore bundle still contains backend client code (`supabaseClient` in `@repo/core` creates a
  client with a placeholder URL in the browser). The CSP now stops it from connecting; the code
  should still leave the bundle (the ratchet list reaches empty).
- The session token is readable by page script (Supabase browser cookies), as in every SPA using
  bearer tokens. The CSP is the main defence against script injection; keep third-party script at
  zero, self-host fonts, and keep access tokens short-lived.
- Shared school computers: sign-out clears the session and `sessionStorage`, not account data in
  `localStorage` (workbench, appearance). Which data may stay is the open product question below.
- The headers need a host that reads `_headers` (Cloudflare Pages does, and already serves the mobile
  web build; GitHub Pages does not). No workflow deploys the Vite builds yet; the one that does must
  publish them to such a host, and a check after deploy should read the live headers back.
- `@orpc/*` is a beta (2.0.0-beta.50) in production paths; pin it and read its changelog per bump.

## Security and router review after Next (13 Nov, evening)

Using what TanStack Router, Vite and Astro provide, rather than code of our own:

- **Route-level error and not-found screens.** Next's `error.tsx` and `not-found.tsx` left with Next
  and the Vite app had none (a failure showed the router's default). `defaultErrorComponent` and
  `defaultNotFoundComponent` (`spa/surface/boundaries.tsx`, from the kit's `ErrorState` and
  `EmptyState`) now cover every route; "Try again" resets the route and reloads its data.
- **A tab on the previous release.** Each build names its files by content, so after a deploy an
  open tab can ask for a chunk that no longer exists. Vite's `vite:preloadError` and the error
  screen reload once into the new build (`lib/runtime/staleBuild.ts`, at most once a minute).
- **Scroll.** `scrollRestoration` with `scrollToTopSelectors: ['#sanctuary-main']`: the shell's
  scroll area outlives pages, so a new page used to open scrolled to wherever the last one was. Now
  a new page starts at its top and Back returns to the exact place (checked in Chrome).
- **Typed search everywhere it is read.** Exam lockdown (`?exam`, `?lockdown`) and the Workspace
  task (`?task=attendance`) are validated by their routes and passed down; screens no longer parse
  `window.location`. Typing the parent route surfaced three links carrying parameters their pages
  never read (founder → school, classroom → gradebook, activity → events); they were dropped, with
  behaviour unchanged.
- **Explore's route tree has no account routes.** The router plugin builds Explore's tree without
  `_account` (`routeFileIgnorePattern`); the root route forwards those addresses to sanctuary
  (`ACCOUNT_PATHS`, kept equal to the routes by a test). The Supabase and API clients are still in
  Explore's bundle because shared floors import them directly; they leave with the data migration
  (the 17 direct calls and 142 surface branches).
- **Development tools out of production builds.** The capacity preview and Self's perspective
  switcher are gated by `import.meta.env.DEV`, so production builds drop them; `?dev` in a URL no
  longer turns perspective switching on in a production account.
- **The public site's policy.** Astro's `security.csp` hashes each page's inline scripts and styles
  into a per-page policy (no `'unsafe-inline'`), with the shared directives from
  `@repo/core/security/responseHeaders` (moved from the web app so all three hosts use one
  definition). Framing and transport headers go to `_headers`. The status page may reach exactly
  the API it reports on. Checked on the Pages runtime: no violations on eight pages, islands included.
- **Explore checked in a browser.** `apps/gurudevi-web/scripts/check-explore-offline.mjs` opens
  Explore's places and fails on any request off its origin; the deploy workflow runs it on each
  Explore deployment, after `scripts/check-live-headers.mjs` (now also for the public site).

Corrected: the API **does** limit requests per account (a PostgreSQL bucket,
`API_ACCOUNT_REQUESTS_PER_MINUTE`, default 120, applied to every authenticated call, including
account deletion) and bounds concurrent authentication work per instance. What it lacks is a limit
before authentication; its threat model recommends Cloudflare rate-limiting rules in front of it.

## Next removed (13 Nov)

The web app is Vite + React + TanStack Router only; Next, its pages, proxy and server routes are
gone, and `check-web-stack` refuses any `next` import. What Next's server did moved to its home:

| Next did | Now |
| --- | --- |
| `/auth/complete` (code exchange, cookies) | the client route `/auth/complete`; the browser keeps the session |
| `/auth/signout` (clear session cookies) | nothing to clear: no server sets session cookies; sign-out revokes through the API and clears the browser session |
| `/auth/deletion` (account deletion request) | v1 API `identity.deletion.{status,request,cancel}` over the same database functions, run as the account (`withAccountData`); the web calls it through the surface's `commands` |
| `/.well-known/*` (app links) | written by each build from `lib/appLinks.ts`, served as JSON |
| `robots.txt` | one `robotsTxt()` in `@repo/core/site`, written by each build and served by the public site |
| `/api/og`, `/badge.svg` | `renderShareImage`, `renderSchoolBadge` in the public site, prerendered at `/share/<world>/<lang>.svg` and `/badge/<world>/<lang>.svg` |
| `/api/architecture/source` and its server action | one reader, served by the dev server only (`lib/dev/architectureSource.ts`) |
| proxy security headers | `_headers` from `lib/security/responseHeaders.ts`; checked live by `scripts/check-live-headers.mjs` |
| root layout: saved world, light, phase, density, consent before paint | `lib/runtime/savedPreferences.ts`, run before the first render |
| root layout: privacy consent banner | the root route |
| page `metadata` titles | each route's `head`, read by `<HeadContent />` |

Every `next/link`, router hook and `next/image` became the router's own (`Link` with typed `to`,
`params` and `search`; `useNavigate`/`useRouter`; `<img>`). Typing links against the routes found
links to pages that never existed (`/self/attendance`, `/qr`), an invite link carrying a code nothing
read, and in-app links to public-site pages; each now goes where it was meant to, and the QR
shortcut is gone because the web has no scanner. Menus hold `linkOptions`, so a stale destination
fails the type check.

**Owner decision pending:** school subdomains (`<school>.gurudevi.app` opening that school's page,
badge and share card) were routed by Next's proxy. `lib/host-routing.ts` keeps that routing as the
specification; serving it needs a Cloudflare Worker on the wildcard host. Until then the school
page is `/school/<id>` on sanctuary and Explore, and the badge and card exist without a school
name.

## Decided by the owner (13 Nov)

- **Explore is for the people a school is made of:** teacher, student, principal and guardian. The
  founder and researcher personas are gone. A visitor sees their persona's Workspace floor, as an
  account sees its capacity's; a link to another floor's feature opens their own Workspace.
- **Every capacity has its own Workspace floor** (owner, 13 Nov), developers and section heads
  included; founder, principal and teacher come first. Self features are for everyone for now.
- **Every contact address is `@gurudevi.lk`,** including the mobile help sheet, which now reads the
  shared definition. EdLove's own addresses (`@edlove.org`) belong to that site and are unchanged.

## Open product questions (the owner decides; the design keeps both open)

- **Safe try for signed-in people:** inside sanctuary, or by sending them to Explore. Built as a data
  mode the app can switch into, either placement uses the same mechanism.
- **Back and forth between Explore and sanctuary:** what moves when someone keeps Explore work. The
  origins differ, so storage is not shared; a handoff (`postMessage` from Explore to a sanctuary tab,
  then sanctuary imports after sign-in) keeps Explore free of the API whatever is decided.
- **Which writes get an outbox on the web, and whether private wellbeing data is stored in a browser**
  (shared school computers).
