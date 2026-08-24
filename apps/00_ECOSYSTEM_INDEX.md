# EdLove Web Ecosystem Index

Welcome to the EdLove ecosystem monorepo.

This ecosystem consists of one main "House" (EdLove.org) and several satellites/subdomains.
Each application is independent but philosophically connected.

## Navigator

### 1) The Main House

- App: `edlove-web`
- Identity: Educational Transformation Ecosystem (hub)
- Context (read first): [edlove-web/CONTEXT.md](./edlove-web/CONTEXT.md)
- Status: Active construction (Phase 1)

### 2) Satellites

#### Gurudevi Public Site (Marketing)

- App: `gurudevi-marketingWeb`
- Identity: Public landing / marketing / information site
- Context: [gurudevi-marketingWeb/CONTEXT.md](./gurudevi-marketingWeb/CONTEXT.md)
- Relation: Public-facing pages (About, FAQ, Privacy, etc.). Not the operational platform web app.

#### Gurudevi Platform (Web App)

- App: `gurudevi-mobile` (web build via Metro resolution)
- Identity: The "real app" on web (React Native Web)
- Context: [gurudevi-mobile/README.md](./gurudevi-mobile/README.md)
- Web guide: [gurudevi-mobile/docs/web/WEB_GUIDE.md](./gurudevi-mobile/docs/web/WEB_GUIDE.md)
- Relation: Built from `apps/gurudevi-mobile` using `*.web.tsx` overrides.
- Domain/hosting: `platform.gurudevi.edlove.org` via GitHub Pages (build output: `apps/gurudevi-mobile/dist/`)

#### Gurudevi Mobile

- App: `gurudevi-mobile`
- Identity: Operational engine (teachers, principals, students)
- Context: [gurudevi-mobile/README.md](./gurudevi-mobile/README.md)
- Relation: Primary product; pillar packages live under `../packages/*`.

> `intuitui-web` (Systems Intelligence Studio) and `neevsk-web` (Personal Digital
> Archive) were extracted into standalone private repos:
> [NeevSK/intuitui-web](https://github.com/NeevSK/intuitui-web),
> [NeevSK/neevsk-web](https://github.com/NeevSK/neevsk-web).

---

## Agent instructions

1. Always identify which app you are working on.
2. Read that app's `CONTEXT.md` (or `gurudevi-mobile/README.md`) before starting major work.
3. Respect the design constraints defined in the context docs.

---

Last updated: 20 March 2026

