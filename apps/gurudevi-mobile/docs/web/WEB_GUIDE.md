# Gurudevi Web Architecture Guide

This document clarifies the distinction between the two web environments in the Polymath Platform and provides instructions on how to run them.

## 1. The Environments

| Feature | `apps/gurudevi-mobile` (Platform Web App) | `apps/gurudevi-marketingWeb` (Marketing Site) |
| :--- | :--- | :--- |
| Purpose | The "real app" (Library, Map, Profile, etc.) | Public landing page, FAQ, About, Privacy |
| Technology | React Native Web (Expo) + Metro | Astro + Svelte + Tailwind |
| Developer experience | High-fidelity app shell, auth, data | SEO optimized, static content |
| Domain | `platform.gurudevi.edlove.org` (GitHub Pages) | `gurudevi.edlove.org` (eventually `gurudevi.lk`) |

Notes:

- Deployment for the **platform web app** is handled by `.github/workflows/web-deploy.yml` which exports `apps/gurudevi-mobile/dist/` and deploys to GitHub Pages.
- Web-specific behavior is implemented via `*.web.tsx` files (and web-only utilities like `*.web.ts`).

---

## 2. How to run locally

### A. Run the platform web app (web version of mobile)

This is where the **Library**, **Map**, and other "real app" surfaces live.

1. Open a terminal in the repo root (or `apps/gurudevi-mobile`).
2. Run:
   ```bash
   pnpm --filter gurudevi-mobile web
   ```
3. This starts the Expo dev server and opens the app in your browser (typically `http://localhost:8081`).

### B. Run the marketing site (Astro)

1. Open a terminal in the repo root (or `apps/gurudevi-marketingWeb`).
2. Run:
   ```bash
   pnpm --filter apps-gurudevi-marketing-web dev
   ```
3. This starts the Astro dev server (typically `http://localhost:4321`).

---

## 3. Key files for web developers (platform app)

- Global styles: [packages/ui/src/components/SanctuaryGlobalStyles.tsx](../../../../packages/ui/src/components/SanctuaryGlobalStyles.tsx) (CSS variables, scrollbars)
- Library web: [packages/library/src/screens/LibraryScreen.web.tsx](../../../../packages/library/src/screens/LibraryScreen.web.tsx) (desktop-native grid)
- Map web: [packages/library/src/screens/MapScreen.web.tsx](../../../../packages/library/src/screens/MapScreen.web.tsx) (D3 knowledge map)
- Location shim: [packages/ui/src/utils/SanctuaryLocation.web.ts](../../../../packages/ui/src/utils/SanctuaryLocation.web.ts) (native browser APIs)

---

## 4. Current web strategy: "Idealistic Web"

We are moving away from "stretched mobile" shims towards native web standards:

- CSS Grid instead of Flexbox for desktop layouts.
- Native `<a>` tags for better SEO and ergonomics (open in new tab).
- IndexedDB (Dexie) for local searching to ensure high performance.
- Glassmorphism (`backdrop-blur`) for a premium desktop feel.

---

## 5. Troubleshooting: "Unable to deserialize cloned data"

If you see this error in your terminal, it means the Metro bundler cache is corrupted (common after large code changes).

Fix:

1. Stop the running dev server (`Ctrl+C`).
2. Re-run with:
   ```bash
   pnpm --filter gurudevi-mobile web --clear
   ```

