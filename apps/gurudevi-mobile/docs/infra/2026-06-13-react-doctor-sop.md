---
title: "React Codebase Health Diagnostics SOP (React Doctor)"
status: "active"
created: 2026-06-13
updated: 2026-06-13
author: "Naveen"
scribe: "Antigravity"
tags: [standards, diagnostics, quality]
---

# React Codebase Health Diagnostics SOP (React Doctor)

This document establishes standard practices and execution policies for running **React Doctor** diagnostics across the Polymath Platform workspace. 

---

## 1. Diagnostic Policy

React Doctor scans the React component tree and hooks configuration to detect runtime performance regressions, build anomalies, security hazards, and code quality issues. 

All scans must adhere to the following configurations:
1. **Target Live Directories Only**: Exclude legacy sandbox configurations, temporary test dumps, and historical components stored in `/archives/` or `/temp/` directories.
2. **Deterministic CLI Target Scope**: Use explicit project scopes to prevent deep recursive caching anomalies when execution is performed inside monorepo workspaces.
3. **Fail-on-Error Thresholds**: Treat critical JSX crashes (e.g. undefined JSX elements, raw text outside of `<Text>` tags in React Native) as blocking criteria.

---

## 2. Command Execution Standard

To perform a clean diagnostic validation run on active workspace projects without telemetry delays:

```bash
npx react-doctor --project packages/ui,packages/core,apps/gurudevi-mobile --no-telemetry --verbose
```

### Option Parameters Guide
* `--project <paths>`: Limits scanning strictly to the active workspace projects (`packages/ui`, `packages/core`, `apps/gurudevi-mobile`). This bypasses standard package workspace prompts and ignores the legacy archives.
* `--no-telemetry`: Disables outbound crash and telemetry reports, preventing execution delays in isolated development cycles.
* `--verbose`: Emits details for all matched diagnostic rules instead of summarizing only the top 3.
* `--blocking error`: Restricts workspace build validation checks to fail strictly on error-level diagnostics (e.g., raw text JSX bugs).

---

## 3. Configuration Management

Add a `reactDoctor` configuration object to `package.json` or create a `doctor.config.ts` in the workspace root to permanently exclude archive paths:

```json
{
  "reactDoctor": {
    "projects": [
      "packages/ui",
      "packages/core",
      "apps/gurudevi-mobile"
    ],
    "exclude": [
      "**/archives/**",
      "**/dist/**",
      "**/.expo/**"
    ]
  }
}
```
