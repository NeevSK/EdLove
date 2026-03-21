# Internal Project Map (Polymath / EdLove / Gurudevi)

This document is for **internal/dev navigation**: what the ecosystem is, what each app/package is for, and how it maps to domains/subdomains and pillar packages.

## Ecosystem diagram

```mermaid
flowchart TB
  Neev["Neevsk (Person)\nCreator / Architect"]:::person

  EdLove["EdLove (Foundation)\nEducation umbrella / 'Main House'"]:::foundation
  Intuitui["Intuitui Labs (Company)\nBuilds/operates products & infrastructure"]:::company

  Gurudevi["Gurudevi (Flagship Product)\nEducation Ecology Support System"]:::product

  EdLoveWeb["edlove-web\nMain hub site"]:::app
  GurudeviMobile["gurudevi-mobile\nPrimary product (Expo RN)"]:::app
  GurudeviPlatform["gurudevi-mobile (web)\nPlatform web app (React Native Web)"]:::app
  GurudeviMarketing["gurudevi-marketingWeb\nPublic site (marketing)"]:::app
  IntuituiWeb["intuitui-web\nStudio site"]:::app
  NeevskWeb["neevsk-web\nPersonal archive site"]:::app

  Neev --> EdLove
  Neev --> Intuitui
  Neev --> NeevskWeb

  EdLove --> EdLoveWeb
  EdLove --> Gurudevi
  EdLove --> GurudeviMarketing
  EdLove --> IntuituiWeb

  Intuitui -. "builds/operates" .-> GurudeviMobile
  Intuitui -. "builds/operates" .-> GurudeviPlatform
  Intuitui -. "builds/operates" .-> GurudeviMarketing
  Intuitui -. "builds/operates" .-> EdLoveWeb

  Gurudevi --> GurudeviMobile
  Gurudevi --> GurudeviPlatform
  Gurudevi --> GurudeviMarketing

  classDef foundation fill:#fff7cc,stroke:#b59b00,color:#111;
  classDef company fill:#e8f2ff,stroke:#2b6cb0,color:#111;
  classDef product fill:#e6fffa,stroke:#0f766e,color:#111;
  classDef app fill:#f8fafc,stroke:#334155,color:#111;
  classDef person fill:#f3e8ff,stroke:#6d28d9,color:#111;
```

## Apps (what / where / status)

Owner for all apps is currently **Neevsk** (single-person build); "built/operated by" is noted where relevant.

| App | Folder | Purpose | Status | Current domain | Target domain |
|---|---|---|---|---|---|
| EdLove Web | `apps/edlove-web` | Main "House" / central hub site | Phase 1 active construction | `edlove.org` (TBD) | `edlove.org` |
| Gurudevi Mobile | `apps/gurudevi-mobile` | Primary product (teachers/principals/students) | Active dev; "production-ready after critical fixes" | App stores / EAS builds (TBD) | Play Store / App Store (TBD) |
| Gurudevi Platform (Web App) | `apps/gurudevi-mobile` | The "real app" on web (React Native Web via Expo/Metro) | Active dev | `platform.gurudevi.edlove.org` (GitHub Pages) | `platform.gurudevi.edlove.org` (TBD) |
| Gurudevi Public Site | `apps/gurudevi-marketingWeb` | Public landing/marketing/information site | Phase 2/3 build | `gurudevi.edlove.org` | `gurudevi.lk` |
| Intuitui Web | `apps/intuitui-web` | Studio site (services/portfolio/gateway) | Phase 2/3 build | `intuitui.edlove.org` | `intuituilabs.lk` |
| Neevsk Web | `apps/neevsk-web` | Personal archive / portfolio | Phase 2/3 build | `neevsk.edlove.org` | `neevsk.edlove.org` (TBD) |

## Gurudevi pillars (domain packages)

Gurudevi's product surface is organized around **five pillars**, and the monorepo mirrors this with packages.

| Pillar | Package | Primary surfaces |
|---|---|---|
| SELF | `packages/self` | Mobile + web platform (`*.web.tsx` where needed) |
| CLASSROOM | `packages/classroom` | Mobile tab + classroom workflows |
| LIBRARY | `packages/library` | Mobile + web platform (web-native screens in `*.web.tsx`) |
| COMMUNITY | `packages/community` | Mobile tab + community features |
| PROFILE | `packages/profile` | Mobile tab + identity/profile features |

Cross-cutting shared packages:

- `packages/core`: shared engine/state/storage/api foundations (used by pillar packages).
- `packages/ui`: shared UI components/theme primitives across apps/packages.
- `packages/graphics`: visual/graphics utilities (used by library and UI).
- `packages/scanner-kit`: scanning utilities (used by classroom/community).
- `packages/eslint-config`, `packages/typescript-config`, `packages/types-shim`: tooling/types infra for the monorepo.

## Navigation

- Ecosystem index: [apps/00_ECOSYSTEM_INDEX.md](../apps/00_ECOSYSTEM_INDEX.md)
- App-specific context docs: `apps/*/CONTEXT.md` (and [apps/gurudevi-mobile/README.md](../apps/gurudevi-mobile/README.md)).
- Gurudevi web environments (marketing vs platform web app): [apps/gurudevi-mobile/docs/web/WEB_GUIDE.md](../apps/gurudevi-mobile/docs/web/WEB_GUIDE.md)

