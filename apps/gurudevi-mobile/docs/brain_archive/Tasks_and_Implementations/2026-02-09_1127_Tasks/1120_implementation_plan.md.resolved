# Implementation Plan - Update Documentation

The goal represents the initialization of subdomain apps (`gurudevi-web`, `intuitui-web`, `neevsk-web`) with basic configuration mirroring `apps/edlove-web` to support the documentation's strategy.

## User Review Required

> [!NOTE]
> I will be creating new folders in `apps/` and adding basic configuration files. This will technically create new packages in your monorepo. You may need to run `pnpm install` after this to link them.

## Proposed Changes

### Subdomain Apps (New)

#### [NEW] `apps/gurudevi-web`
- **package.json**: Basic Astro + Svelte + Tailwind dependencies (matching edlove-web).
- **astro.config.mjs**: Standard configuration.
- **tsconfig.json**: Standard TypeScript configuration.
- **src/pages/index.astro**: Placeholder landing page.
- **src/styles/global.css**: Basic styles.

#### [NEW] `apps/intuitui-web`
- Same structure as `gurudevi-web` but with specific branding.

#### [NEW] `apps/neevsk-web`
- Same structure as `gurudevi-web` but with specific branding.

## Verification Plan

### Manual Verification
- **File Check**: Verify that directories and files are created.
- **Dependency Check**: Run `pnpm install` (via command if possible or instruct user) to ensure pnpm maps the workspace correctly.
- **Build Check**: Try `pnpm build` in one of the new apps to ensure it compiles (optional, as I might not install dependencies fully).
- **Structure Check**: Compare with `03_TECH.md` requirements.
