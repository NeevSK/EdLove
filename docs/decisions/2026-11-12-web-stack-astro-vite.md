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
- A floor that only some capacities may open is wrapped in `CapacityGate` with a named rule from
  `lib/sanctuary/capacityAccess.ts`. Explore shows every floor as the visitor's persona; the API is
  what enforces access.
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

- Five brand files (mark, favicon, flag, two Tutii cutouts) are in both sites' `public/`. Once Next is
  gone they become imports from `@repo/ui` assets.
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

## Open product questions (the owner decides; the design keeps both open)

- **Which pages Explore serves.** Next served only `/welcome` and `/self` on `explore.gurudevi.app` in
  production (everything else returned 404) to keep session-carrying server pages off the demo host.
  The Vite Explore build has no such pages and serves every floor, following the one-app rule. If
  some floors should stay off Explore, that is a list in one place, not a branch per page.
- **Capacity gates in Explore.** Explore shows gated floors (tuition, kiosk, founder command, ...) to
  every persona, as the old Explore pages did. Applying the gates to the persona is one line in
  `CapacityGate`.

- **Safe try for signed-in people:** inside sanctuary, or by sending them to Explore. Built as a data
  mode the app can switch into, either placement uses the same mechanism.
- **Back and forth between Explore and sanctuary:** what moves when someone keeps Explore work. The
  origins differ, so storage is not shared; a handoff (`postMessage` from Explore to a sanctuary tab,
  then sanctuary imports after sign-in) keeps Explore free of the API whatever is decided.
- **Which writes get an outbox on the web, and whether private wellbeing data is stored in a browser**
  (shared school computers).
