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
5. **Each route moves as a journey,** with browser evidence (phone-size screenshot, no console
   errors, no backend requests on Explore) before the Next route retires.

### Order of work

1. Public: move the remaining `(marketing)` pages to `apps/gurudevi-public`; point `gurudevi.app` at
   it; retire `(marketing)` in Next.
2. Explore: add routes until every Explore journey runs in the Vite build; remove the backend clients
   from its bundle (the ratchet list reaches empty); point `explore.gurudevi.app` at it.
3. Sanctuary: per journey, move server-side data loading to the v1 API through TanStack Query, the
   login gate to a client route guard (the API stays the enforcer), and add the app shell service
   worker and the outbox for the writes that need it (levels W1, W2, W4 in
   `client-state-and-web-offline-capability-canon.md`).
4. Remove Next, the stand-ins, `proxy.ts` host routing and its cookie stripping.

### What does not change

- `@repo/ui`, the worlds, tokens and every shared package: none imports Next.
- 315 of 498 files in `apps/gurudevi-web` do not import Next and move as they are; 117 CSS modules
  work in Vite unchanged.
- The mobile app.

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

`SyncStatusPill` probed `sanctuary.gurudevi.app` every 30 seconds, including on Explore. It is no
longer rendered in Explore mode (there is nothing to sync). Verified in a 390 px Chrome page:
no requests to the sanctuary host.

## Known follow-ups (engineering)

- Fonts load from Google Fonts on every site; self-host them so pages work offline and on a
  first visit without a third party.
- `worlds.css` carries every world (718 KB raw). Serve the active world, load others on change.
- An Explore runtime check in CI (headless browser, fail on any backend request); the bundle
  ratchet cannot see a request to a URL that also appears in a link.
- `tests/unit/seo/seoAndAgenticDiscovery.test.ts` imports a removed route and fails type-check on
  the base branch as well; `next build` stops on it.

## Open product questions (the owner decides; the design keeps both open)

- **Safe try for signed-in people:** inside sanctuary, or by sending them to Explore. Built as a data
  mode the app can switch into, either placement uses the same mechanism.
- **Back and forth between Explore and sanctuary:** what moves when someone keeps Explore work. The
  origins differ, so storage is not shared; a handoff (`postMessage` from Explore to a sanctuary tab,
  then sanctuary imports after sign-in) keeps Explore free of the API whatever is decided.
- **Which writes get an outbox on the web, and whether private wellbeing data is stored in a browser**
  (shared school computers).
