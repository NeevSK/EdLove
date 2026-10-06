# Gurudevi Web / Native Separation Inventory and Migration Plan

**Status:** active, discovery complete; no runtime retirement approved yet  
**Decision:** `apps/gurudevi-web` is the canonical Gurudevi browser application. `apps/gurudevi-mobile` is the future Android/iOS-only application. `apps/edlove-web` remains an independent Edlove product and is out of scope.

## Safety rule

The current Expo web implementation is live, not dead configuration. Do not remove its routes, shims, scripts, PWA assets, dependencies, or deployment workflows until the corresponding Next.js route has passed explicit parity and cutover acceptance.

## Target ownership

| Surface | Owner | Hosts / scope |
| --- | --- | --- |
| Public marketing and editorial content | `apps/gurudevi-web` | `gurudevi.app` |
| Authenticated Sanctuary browser application | `apps/gurudevi-web` | `sanctuary.gurudevi.app` |
| Android and iOS application | `apps/gurudevi-mobile` | native schemes and store distributions |
| API | `apps/sanctuary-api` | `api.gurudevi.app` when deployed |
| Edlove | `apps/edlove-web` | `edlove.org`; unchanged |

`apps/gurudevi-marketingWeb` is an Astro migration source only until the Next marketing routes are accepted. It still contains stale old-host configuration, which is a later, isolated migration task.

## Inventory conclusions

### Mobile currently owns a complete web runtime

`apps/gurudevi-mobile` contains Expo web build scripts, Playwright web tests, PWA static assets, a web tabs shell, browser-auth branches, web PowerSync/OPFS storage, browser Google flow, desktop screens, and a Metro web resolver/shim firewall. Its direct dependencies include browser packages such as `react-dom`, `react-native-web`, `lucide-react`, and `@powersync/web`.

High-risk web coupling includes:

- `apps/gurudevi-mobile/metro.config.js`: web platform detection, React Native Web aliases, web shims, and universal shims.
- `apps/gurudevi-mobile/src/providers/PowerSyncProvider.web.tsx`: browser-only OPFS/WASQLite storage.
- `apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx` and web-only screen/component implementations.
- `apps/gurudevi-mobile/public/` and the Expo `web` configuration in `app.json`.

### Shared packages currently hide platform selection

`packages/ui` is the main coupling center. It has browser/default conditional exports and 46 web-specific files, while feature packages such as `self`, `classroom`, `library`, `community`, `admin`, and `profile` expose browser/native screens through shared import paths. This allows runtime resolution to decide architecture and is the source of Metro/Next fragility.

The icon failure exposed a specific version of this problem: Node accepted several Lucide aliases that Metro could not load as physical native modules. The native icon bridge and checker have been corrected as a tactical guard, but icons should later become explicit `web` and `native` entry points.

### Next is the intended destination, with one important gap

`apps/gurudevi-web` already has public marketing routes and Sanctuary routes for sign-in, onboarding, self, workspace, community, library, profile, notifications, settings, and QR. It uses Next/Supabase browser and server adapters.

It does not yet enforce host ownership: if both domains target the same deployment, route groups alone do not prevent a Sanctuary route on the public host or vice versa. Host routing is a prerequisite before shared production deployment.

## Six-stage migration sequence

### 1. Freeze and measure

Create machine-readable inventories for routes, app entry points, direct browser dependencies, platform-specific source files, and shared-package import edges. Add report-only CI checks first. No deletion or behavior change.

**Exit evidence:** a route-to-owner matrix; dependency graphs for Expo native, Expo web, and Next; a list of every generic import that can resolve differently by platform.

### 2. Establish explicit package contracts

Additive public surfaces only:

- `@repo/<feature>/domain` for types, use cases, schemas, and API contracts.
- `@repo/<feature>/native` for React Native screens/adapters.
- `@repo/<feature>/web` for Next/browser screens/adapters.

Keep current package roots as compatibility facades until all callers migrate. Do not bulk rewrite conditional exports.

**First seams:** `@repo/ui/icons/native` and `/web`; analytics, permissions, device trust, push, PowerSync, and browser/native storage adapters.

### 3. Make the Next host boundary real

Implement and test hostname policy in `apps/gurudevi-web` before DNS cutover:

- `gurudevi.app` permits marketing/legal/editorial routes.
- `sanctuary.gurudevi.app` permits authenticated application routes and auth callbacks.
- Unknown or cross-host routes follow an explicit redirect/not-found policy.

Keep actual DNS, Vercel mappings, Supabase redirect URLs, and API host changes separate from this code decision and verify them before changing external state.

### 4. Migrate browser features by vertical slice

For each feature, move its Next route, browser UI, browser adapter, auth/session behavior, and end-to-end test together. Preserve the Expo native route throughout. Start with low-risk shared-browser slices, then complete Sanctuary features, then marketing routes.

**Per-slice acceptance:** Next production build; route and auth behavior; failure/offline behavior appropriate to web; no regression in the native bundle; explicit user acceptance before traffic cutover.

### 5. Retire Expo web incrementally

Only after the matching Next slice is accepted, remove its Expo-web route, implementation, test, shim, static asset, and dependency edge. Reduce `metro.config.js` one proven web concern at a time. Do not make a big-bang Metro rewrite.

The final step is removal of Expo web scripts, web deployment workflows, PWA assets, React Native Web/browser dependencies, and the obsolete Gurudevi web deployment targets. Edlove files and deployment must not be touched.

### 6. Enforce the finished boundary

Turn report-only checks into CI gates:

- Mobile cannot introduce `react-dom`, `react-native-web`, `lucide-react`, `posthog-js`, `@powersync/web`, browser-only files, or web scripts.
- Native entry points cannot resolve a `.web.*` implementation or browser-only dependency.
- Next builds must not resolve native-only modules.
- Package exports must declare platform contracts deliberately.
- Each migrated slice must have both native bundle evidence and Next runtime evidence.

## Immediate next deliverables

1. Generate the route/ownership/dependency inventory artifacts in report-only mode.
2. Define the compatibility contract and migration specification for the first low-risk adapter slice.
3. Audit `apps/gurudevi-web` hostname routing and write its acceptance tests before any domain cutover.
4. Do not remove Expo web code yet.

