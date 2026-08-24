---
title: "Polymath Platform (EdLove / Gurudevi)"
status: "active"
created: 2025-11-03
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [platform, monorepo]
---

# Polymath Platform (EdLove / Gurudevi)

A single monorepo for the EdLove education ecosystem:

- **EdLove**: the umbrella foundation/house for education philosophy + ecosystem coordination.
- **Gurudevi**: the flagship "Education Ecology Support System" product (mobile-first).


## Where to start (internal/dev)

- Ecosystem navigator: [apps/00_ECOSYSTEM_INDEX.md](./apps/00_ECOSYSTEM_INDEX.md)
- Openness/licensing decision: [docs/decisions/2026-08-24-openness-and-reuse-strategy.md](./docs/decisions/2026-08-24-openness-and-reuse-strategy.md) + [docs/decisions/2026-08-24-license-tradeoffs.md](./docs/decisions/2026-08-24-license-tradeoffs.md)
- Branch pipeline (solo, scalable): [docs/infra/git-branching-model.md](./docs/infra/git-branching-model.md)
- Root configuration map (what every root config file does): [docs/engineering/root-configuration-map.md](./docs/engineering/root-configuration-map.md)
- Documentation SOP (frontmatter contract, doc tiers): [apps/gurudevi-mobile/docs/docs-sop.md](./apps/gurudevi-mobile/docs/docs-sop.md)
- Doppler-centered engineering toolchain: [docs/infra/doppler-toolchain.md](./docs/infra/doppler-toolchain.md)

App contexts (read before working in an app):

- [apps/edlove-web/CONTEXT.md](./apps/edlove-web/CONTEXT.md)
- [apps/gurudevi-mobile/README.md](./apps/gurudevi-mobile/README.md)
- [apps/gurudevi-marketingWeb/CONTEXT.md](./apps/gurudevi-marketingWeb/CONTEXT.md)

## Gurudevi: two web environments

- Public marketing site (Astro): `apps/gurudevi-marketingWeb` (domain: `gurudevi.edlove.org`, eventually `gurudevi.lk`)
- Platform web app (React Native Web via Expo/Metro): `apps/gurudevi-mobile` (domain: `platform.gurudevi.edlove.org`, GitHub Pages)
- Toolchain authority and CI/free-first integrations: [docs/infra/doppler-toolchain.md](./docs/infra/doppler-toolchain.md) and [docs/infra/github-student-pack-toolchain.md](./docs/infra/github-student-pack-toolchain.md)
- Testing and performance lanes: [docs/infra/testing-and-performance-toolchain.md](./docs/infra/testing-and-performance-toolchain.md)

Web guide: [apps/gurudevi-mobile/docs/web/WEB_GUIDE.md](./apps/gurudevi-mobile/docs/web/WEB_GUIDE.md)

## Repo layout

- `apps/*`: end-user applications (websites + mobile app + web app build)
- `packages/*`: shared domain packages (Gurudevi pillars + shared core/ui/tooling)

## Quick commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm check-types
pnpm audit:secrets
```

This repo uses `pnpm` workspaces + `turbo` to orchestrate tasks across apps/packages.

