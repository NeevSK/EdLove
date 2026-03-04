# Gurudevi Web Architecture Guide

This document clarifies the distinction between the two web environments in the Polymath Platform and provides instructions on how to run them.

## 1. The Environments

| Feature | `apps/gurudevi-mobile` (App Web) | `apps/gurudevi-web` (Marketing) |
| :--- | :--- | :--- |
| **Purpose** | The "Real" Application (Library, Map, Profile, etc.) | Public Landing Page, FAQ, About, Privacy |
| **Technology** | React Native Web (Expo) + Tailwind | Astro + Svelte + Tailwind |
| **Developer Experience** | High-Fidelity App Shell, Auth, Data | SEO Optimized, Static Content |
| **URL Path** | `/` (typically handles app routing) | `/` (marketing content) |

---

## 2. How to Run Locally

### A. To run the Application (Web version of Mobile)
This is where the **Library**, **Map Screen**, and **Vault** live.
1. Open a terminal in the root or `apps/gurudevi-mobile`.
2. Run:
   ```bash
   pnpm --filter gurudevi-mobile web
   ```
3. This will start the Expo dev server and open the app in your browser (typically `localhost:8081`).

### B. To run the Marketing Site (Astro)
This is for the public-facing content.
1. Open a terminal in the root or `apps/gurudevi-web`.
2. Run:
   ```bash
   pnpm --filter apps-gurudevi-web dev
   ```
3. This will start the Astro dev server (typically `localhost:4321`).

---

## 3. Key Files for Web Developers

If you are looking to modify the "Real App" experience on web:
- **Global Styles**: [SanctuaryGlobalStyles.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/components/SanctuaryGlobalStyles.tsx) (CSS Variables, Scrollbars).
- **Library Web**: [LibraryScreen.web.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/library/src/screens/LibraryScreen.web.tsx) (Desktop-native Grid).
- **Map Web**: [MapScreen.web.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/library/src/screens/MapScreen.web.tsx) (D3 Knowledge Map).
- **Location Shim**: [SanctuaryLocation.web.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/ui/src/utils/SanctuaryLocation.web.ts) (Native Browser APIs).

---

## 4. Current Web strategy: "Idealistic Web"
We are moving away from "stretched mobile" shims towards native web standards:
- **CSS Grid** instead of Flexbox for desktop layouts.
- **Native `<a>` tags** for better SEO and user ergonomics (Open in New Tab).
- **IndexedDB (Dexie)** for local searching to ensure high performance.
- **Glassmorphism** (`backdrop-blur`) for a premium desktop feel.

---

---

## 6. Troubleshooting: "Unable to deserialize cloned data"
If you see this error in your terminal, it means the **Metro Bundler cache** is corrupted (common after large code changes).

### Fix:
1. Stop the current running terminal (`Ctrl+C`).
2. Run the command with the `--clear` flag:
   ```bash
   pnpm --filter gurudevi-mobile web --clear
   ```
   *Note: This will rebuild the cache and may take a minute or two.*
