# Changelog

All notable changes to the Polymath Platform (EdLove / Gurudevi) will be documented in this file.

This project uses [Changesets](https://github.com/changesets/changesets) for changelog management. Individual packages and apps have their own `CHANGELOG.md` files; this document aggregates significant monorepo-wide changes.

## [Unreleased]

### Added
- OSS readiness: Added `.env.example` files for all apps to support contributors without Doppler access
- OSS readiness: Enhanced README.md with badges, project status, and contributor guidance
- OSS readiness: Enhanced CONTRIBUTING.md with first-time contributor onboarding section
- OSS readiness: Enhanced SECURITY.md with git history note about historical key leak
- OSS readiness: Added OSS issue/PR templates (question.yml, enhanced bug_report, feature_request)
- OSS readiness: Created gurudevi-web README and .env.example
- OSS readiness: Added deprecation notice for gurudevi-marketingWeb (migrating to gurudevi-web)
- Documentation: Updated READMEs to reflect web platform consolidation (gurudevi-web as canonical platform)

### Changed
- Updated gurudevi-marketingWeb status to deprecated (migrating to Next.js canonical platform)
- Updated root README to reflect unified web platform architecture

### Fixed
- N/A

## [1.0.0] - 2026-XX-XX

### Added
- Initial public release of Polymath Platform monorepo
- Gurudevi mobile app (React Native/Expo 57)
- Sanctuary API (Node.js/Hono)
- Gurudevi web (Next.js 16)
- EdLove web (Astro)
- Shared packages: core, ui, database, policies, and domain packages

## Changelog Workflow

For contributors:

1. **Add a changeset** when making a change:
   ```bash
   pnpm change
   ```
   This will prompt you to describe the change and choose the version bump type (major/minor/patch).

2. **For monorepo-wide changes** (OSS readiness, architecture decisions, etc.):
   - The changeset will be added to `.changeset/` directory
   - When you're ready to release, run `pnpm version:all` to update all package versions
   - Changesets will automatically generate/update individual package CHANGELOG.md files

3. **For package-specific changes**:
   - Changesets will update only the affected package's CHANGELOG.md
   - Use `pnpm change` in the package directory or specify the package

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on the development workflow.
