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
   - `nextImportFiles`: files in `app/` and `lib/` importing `next/*` (183 today).
   - `exploreBackendClients`: backend client code found in the Explore bundle. Target: none.
5. **A codemod does the predictable part** (`node scripts/codemods/web-migrate.mjs`, dry run by
   default; `--write --segment=explore` writes routes and never overwrites one). It sorts every page
   (explore-ready, explore-review, client-wrap, server-data, astro-static, astro-island) and lifts each
   page's `if (isExplore)` block into a route. First run, 12 Nov: 15 Explore routes generated; all 16
   Explore routes open in a 390 px Chrome page with no console errors and no backend requests.
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
2. Explore: add routes until every Explore journey runs in the Vite build; remove the backend clients
   from its bundle (the ratchet list reaches empty); point `explore.gurudevi.app` at it.
3. Sanctuary: per journey, move server-side data loading to the v1 API through TanStack Query, the
   login gate to a client route guard (the API stays the enforcer), and add the app shell service
   worker and the outbox for the writes that need it (levels W1, W2, W4 in
   `client-state-and-web-offline-capability-canon.md`).
4. Remove Next, the stand-ins in `spa/next`, `proxy.ts` host routing and its cookie stripping, and
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
one reference route to copy (`spa/routes/self.tsx`), typecheck in CI, and a lint ban on the old APIs
when the first one appears. A client app also removes the server/client boundary, the most common
source of agent mistakes in the App Router.

React Router v7 was the alternative: more training data, weaker types, and frequent v5/v6/v7 mixing
by agents.

## Found and fixed while verifying

- Contact emails: `seo.ts` used `@gurudevi.lk` addresses while `@repo/core/site` and the 12 Sep ADR use
  `@gurudevi.app`. `seo.ts` is gone; every page reads `CONTACT_EMAILS` from core.
- `llms.txt` advertised `/llms-full.txt`, which did not exist; it now does, with every journal essay.
- `next build` stopped on a test importing that missing route; the test moved with the files it tests
  and passes.
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
- `components/intro/IntroClient.tsx` in the public site is not used by any page (it was not used in
  Next either). Removing it needs the owner's sign-off.
- `tests/unit/supportHub.test.ts` "serves own support page directly on explore" fails on the base
  branch as well.

## Open product questions (the owner decides; the design keeps both open)

- **Safe try for signed-in people:** inside sanctuary, or by sending them to Explore. Built as a data
  mode the app can switch into, either placement uses the same mechanism.
- **Back and forth between Explore and sanctuary:** what moves when someone keeps Explore work. The
  origins differ, so storage is not shared; a handoff (`postMessage` from Explore to a sanctuary tab,
  then sanctuary imports after sign-in) keeps Explore free of the API whatever is decided.
- **Which writes get an outbox on the web, and whether private wellbeing data is stored in a browser**
  (shared school computers).
