---
title: "Platform MCP Guidelines"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [mcp, developer-guidance, tooling]
---

# Platform MCP: The Sovereign Control Plane

The `@repo/platform-mcp` package acts as the centralized control plane for the `polymath-platform` monorepo. It exposes developer and agent tools that automate linting, type-checking, code healing, architectural boundaries validation, accessibility audits, and repository search.

---

## 🛠️ Core Tool categories

### 1. Code & Asset Discovery
*   **`grep_code`**: Fast structural search powered by `ripgrep`. Filters by file extensions and ignores third-party artifacts.
*   **`shiny_find`**: Quick filename lookup powered by `fd`.
*   **`structural_search`**: Semantic pattern matcher powered by `GritQL` (e.g. matching specific import styles or syntax patterns).
*   **`sovereign_scout`**: Compiles an intelligence dossier about any component or keyword by aggregating docs, imports, and file heatmaps.
*   **`search_docs`**: Target documentation and guide search.

### 2. Code Quality & Type Safety
*   **`check_package_types`**: Runs local or global `tsc` checks. Supports targeted packages (e.g., `@repo/ui`) to save compilation time.
*   **`lint_package`**: Lint check utilizing Biome and ESLint.
*   **`heal_codebase`**: Automatically attempts to resolve compiler and syntax corruption in TypeScript or TSX files.
*   **`normalize_imports`**: Automatically converts relative imports (e.g. `../../components/Button`) to workspace path aliases.

### 3. Architecture & Boundary Enforcements
*   **`audit_package_architecture`**: Ensures code remains platform-agnostic, checking for native/web leakage and directory boundaries.
*   **`audit_monorepo_hygiene`**: Aggregates unused code (Knip), circular dependencies (Dependency Cruiser), and architectural boundary violations into reports.
*   **`audit_export_integrity`**: Analyzes package barrel files to detect and prevent deep-import bypasses.
*   **`audit_bundle_leak`**: Flags when heavy dependency libraries leak into lightweight shared core packages.
*   **`check_classroom_boundaries` / `check_self_boundaries`**: Asserts domain isolation rules across packages.

### 4. UI, Accessibility & Design Audits
*   **`audit_accessibility`**: Audits target components for proper ARIA tags, labels, and accessibility properties.
*   **`check_contrast`**: Evaluates color schemes using WCAG and APCA algorithms.
*   **`audit_colors`**: Audits colors across UI components to enforce standard theme guidelines.
*   **`audit_ui_components`**: Automatically extracts APIs and generates props documentation for React packages.

### 5. Git & Utilities
*   **`create_checkpoint`**: Atomically stages, runs lint checking, and commits files to Git with a structured commit message.
*   **`purge_stale_artifacts`**: Cleans up old build reports and logs to keep the repository directories clean.
*   **`shiny_spellcheck`**: Spellchecks codebase using `typos`.

---

## 🏃 How to Run Platform-MCP

### Developer Usage
To launch or interact with the platform MCP server:
```bash
# Start the MCP Gateway server
pnpm --filter @repo/platform-mcp start
```

### Agent Protocol
If you are an AI assistant, you should prioritize executing these tools using your Model Context Protocol (MCP) capabilities. For example:
*   Use `check_package_types` for incremental compilation checks before submitting PRs.
*   Use `audit_monorepo_hygiene` or `audit_package_architecture` to verify there are no dependency violations in new package additions.
