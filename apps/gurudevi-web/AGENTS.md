<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gurudevi web rules

- This app is Gurudevi itself: `sanctuary.gurudevi.app` (signed in) and `explore.gurudevi.app` (no account, local sample data, never the backend). The public site `gurudevi.app` is `apps/gurudevi-public` (Astro).
- **Explore and sanctuary are one app.** Routes and screens never check which surface they are on: read `useSession()` (`spa/surface/session.tsx`) and query through the surface's `sources` (`spa/surface/sources.ts`). A new kind of data gets a `Source` with an Explore answer and an API answer. `check-web-stack` counts surface branches and the count only goes down.
- **Moving to Vite + TanStack Router** ([decision](../../docs/decisions/2026-11-12-web-stack-astro-vite.md)). The client build lives in `spa/` (`pnpm build:explore`); copy `spa/routes/self.tsx` for a new route. Public pages move to `apps/gurudevi-public` (Astro). Don't add new `next/*` imports: `node scripts/check-web-stack.mjs` only lets their count go down, and Explore must never contact the backend.
- In local development, test surfaces via `http://localhost:3000`, `http://sanctuary.localhost:3000`, and `http://explore.localhost:3000` (RFC 6761) without modifying system hosts files.
- Data reaches the app only through the v1 API. Never query the database from web code (`.from('table')`, `.rpc(`, storage, realtime): `node scripts/check-web-stack.mjs` counts them and the count only goes down.
- Build web UI with semantic HTML and browser-native behavior. Do not import React Native UI components or React Native Web into this app.
- Share only platform-neutral contracts, validation, repositories, the theme (`@repo/ui/theme`, `@repo/ui/theme/web`) and tokens with `gurudevi-mobile`. UI components come from `@repo/ui/components/web`.
- Design from the 360-430 px browser viewport upward. Desktop enhancement must not alter the primary phone journey.
- Every changed user journey needs browser evidence before it can replace a Metro web route.
