---
title: "RN Terrain Phase 1 & 2 Implementation Plan"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Antigravity"
tags: [rn-terrain, architecture, implementation-plan]
---

# Implementation Plan - Phase 1 (Remaining) & Phase 2: CLI & Sync Automation

This plan outlines the final steps to fully complete Phase 1 (Bloom 1) and operationalize Phase 2 (Bloom 2) for **RN Terrain**.

---

## User Review Required

> [!IMPORTANT]
> 1. **Daily Sync Scheduling**: We plan to implement the Sync Engine script in `@rn-terrain/core`. For Phase 1/2, it can be run manually or triggered via a background task/scheduler.
> 2. **Taze Version Lag Resolution**: We will integrate standard npm version resolution (similar to `taze` logic) to compare package versions dynamically when running CLI diagnostics.

---

## Open Questions

> [!NOTE]
> 1. Do we want to populate the remaining 130 packages (for the top 150 target) via an automated ingestion script using the GitHub/NPM search APIs, or should we use a JSON-based list of package names to seed them and let the sync engine fetch the rest?

---

## Proposed Changes

### Component 1: Daily Sync Engine & Data Expansion (Phase 1 Remaining)

#### [NEW] [sync-daily.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/rn-terrain-core/src/sync-daily.ts)
Implement a daily sync script that:
- Queries all packages in the Supabase database.
- Fetches update metrics from the npm registry (e.g., download counts, latest version).
- Queries the GitHub API for activity signals (stars delta, commits count, last commit date, bus factor).
- Integrates with the React Native Directory API to check platform support signals.
- Computes and updates the vitality score, deprecation radar, and v1 readiness.

---

### Component 2: Version Lag & Bundle Size Analysis (Phase 2 / Bloom 2)

#### [MODIFY] [queries.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/rn-terrain-core/src/queries.ts)
- Add utility methods to fetch dynamic package version information directly from npm when auditing, to calculate version lag accurately.
- Add support for querying bundle size metadata from `react-native-directory` or bundle analyzer caches.

#### [MODIFY] [index.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/rn-terrain-cli/src/index.ts)
- Implement a dedicated `v1-check` command to evaluate the V1.0 compatibility status of the entire project.
- Integrate the `--maturity-period` check (flagging updates younger than a safety threshold).
- Render beautiful, color-coded tabular summaries of outdated dependencies.

---

## Verification Plan

### Automated Tests
- Run TS checks on all packages:
  ```powershell
  pnpm check-types
  ```

### Manual Verification
- Execute `npx rn-eval v1-check` on a target project's `package.json` to verify compatibility checks.
- Run the sync script manually to ensure it refreshes database rows and populates events:
  ```powershell
  pnpm dlx tsx packages/rn-terrain-core/src/sync-daily.ts
  ```
