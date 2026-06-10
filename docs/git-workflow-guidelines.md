---
title: "Git Hooks & Quality Gates"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [git, husky, quality-gates, developer-guidance]
---

# Git Quality Gates & Verification Pipeline

To maintain architectural integrity, type safety, and code consistency across the monorepo, `polymath-platform` enforces strict quality gates on commit and push operations.

These gates are managed via **Husky** hooks located in the [.husky/](file:///c:/Users/Naween/projects/polymath-platform/.husky) directory.

---

## 🛡️ Pre-Commit Hook: Surgical Sentinel

Whenever you execute a `git commit`, the pre-commit hook runs to ensure the staged code is clean and error-free before saving it.

*   **File**: [.husky/pre-commit](file:///c:/Users/Naween/projects/polymath-platform/.husky/pre-commit)
*   **Action**: Runs `lint-staged --concurrent false`.
*   **Staged Configuration** ([.lintstagedrc.cjs](file:///c:/Users/Naween/projects/polymath-platform/.lintstagedrc.cjs)):
    1.  **Formatting & Linting**: Calls `biome check --write` to automatically format files and lint code.
    2.  **Lint Enforcement**: Calls `eslint --fix` for legacy ESLint coverage.
    3.  **Surgical Type-checking**: Calls [scripts/surgical-check.mjs](file:///c:/Users/Naween/projects/polymath-platform/scripts/surgical-check.mjs) which parses the list of modified files, determines which workspace packages they belong to, and executes `pnpm exec turbo run check-types` on *only* those affected packages. This keeps type checks extremely fast.

### Configuration Variables
You can customize the pre-commit checks using the `AUDIT_MODE` environment variable:
```powershell
# Run the default (TSC check + Biome formatting/linting)
git commit -m "feat: commit description"

# Skip TSC checks; run Biome formatting & linting only
$env:AUDIT_MODE="hooks"; git commit -m "feat: fast commit"

# Run only TSC checks; skip formatting
$env:AUDIT_MODE="tsc"; git commit -m "feat: typecheck only commit"
```

---

## 🚀 Pre-Push Hook: Sovereign Gate

Before pushing code to a remote branch, it must pass a comprehensive quality audit to ensure the remote branch is never broken.

*   **File**: [.husky/pre-push](file:///c:/Users/Naween/projects/polymath-platform/.husky/pre-push)
*   **Action**: Executes [scripts/sovereign-audit.mjs](file:///c:/Users/Naween/projects/polymath-platform/scripts/sovereign-audit.mjs) with a suite of verification checks, and outputs results into `reports/push_audit.md`.

### Execution Modes
The pre-push behavior is configured via the `PUSH_MODE` environment variable:

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Full** | `git push` | Runs Commitlint, full Biome/ESLint check, global TSC verification, architecture boundaries check, profile schema validations, and localization fallback policies check. |
| **Min** | `$env:PUSH_MODE="min"; git push` | **For emergency or speed runs.** Runs only Commitlint, global Linting, and global TSC. Skips architecture, profile, and i18n checks. |

> [!CAUTION]
> Using `git push --no-verify` is highly discouraged as it bypasses type-safety checks and may result in build failures on CI/CD. Use `$env:PUSH_MODE="min"` instead when you need to skip architectural and secondary check layers.

---

## ⚙️ Monorepo Tuning & Troubleshooting (Node 24 Memory & Concurrency)

When developing in `polymath-platform` under **Node.js 24+**, V8's revised garbage collection (GC) and RSS memory allocation schemes can cause parallel compilation tasks to exhaust virtual memory/commit limits. 

We have tuned the monorepo configuration with the following guidelines and overrides:

### 1. Concurrency Control (`--concurrency=1`)
* **Problem**: Parallel execution of multiple TypeScript compilers (`tsc`) concurrently eats up host virtual memory, leading to crashes like `FATAL ERROR: Zone Allocation failed` or `Committing semi space failed. Allocation failed - JavaScript heap out of memory` at low heap sizes (around ~360MB).
* **Workaround**: Global scripts like `check-types` and `lint` in the root [package.json](file:///c:/Users/Naween/projects/polymath-platform/package.json) are run with `--concurrency=1` to ensure sequential task execution.
* **Heap Limits**: Intensive compilers (like `@repo/ui` and `@intuitui-labs/lk-edu-geo`) run `tsc` with `node --max-old-space-size=4096` to provide a higher memory allocation ceiling.

### 2. Surgical Scope Optimization (`SURGICAL_PUSH_COMMIT`)
By default, the pre-push hook audits all modified files in changed packages compared to the remote tracking branch. If your branch has multiple commits with historical lint/compilation issues in other packages, you can narrow the pre-push sentinel's focus:
* **Usage**: Set the `SURGICAL_PUSH_COMMIT` environment variable to define a custom starting commit for the diff:
  ```powershell
  # Audit and verify changes in the last commit only
  $env:SURGICAL_PUSH_COMMIT="HEAD~1"; git push
  ```

### 3. Turborepo Dependency Isolation (`--only`)
* **Tradeoff**: In [scripts/surgical-push-check.mjs](file:///c:/Users/Naween/projects/polymath-platform/scripts/surgical-push-check.mjs), we run `turbo run check-types` with the `--only` flag. 
* **Effect**: This bypasses package dependency chains (like `dependsOn: ["^lint"]` defined in `turbo.json`), meaning we only run audits on the specific packages changed in our commit range. This prevents pre-existing, unchanged dependencies with unrelated lint issues from polluting our push verification results.

---

## 🔍 Deep-Dive: How Different Quality Checks Work & Their Tradeoffs

### 1. Verification Layers & How They Work

To ensure stability across the monorepo, the pre-commit and pre-push hooks execute specialized check layers:

*   **Type Safety (`tsc`)**:
    *   *Mechanism*: Runs `tsc --noEmit` at the individual package level.
    *   *Tuning*: Runs with `node --max-old-space-size=4096` in packages containing extensive typings (e.g., `@repo/ui` and `@intuitui-labs/lk-edu-geo`).
    *   *Tradeoff*: Provides complete type safety across API boundaries. However, running sequential checking (`--concurrency=1`) increases gate time relative to parallelized execution.
*   **Hygiene & Style (Biome & ESLint)**:
    *   *Mechanism*: **Biome** acts as the primary formatter and linter (executing in milliseconds). **ESLint** runs as a secondary pass with specialized plugins for legacy or custom rules.
    *   *Configuration Gotchas*:
        *   **Biome**: Does not support standard ignore lists. Exclusions must be manually specified as negated paths (prefixed with `!!`) within `files.includes`.
        *   **ESLint**: Flat configurations (`eslint.config.mjs`) must explicitly define global ignores (e.g., `{ ignores: ["scripts/**/*"] }`) for non-source scripts, otherwise `typescript-eslint` will crash trying to map them to the project's source `tsconfig.json`.
*   **Monorepo Boundaries Check (`check-monorepo-boundaries.mjs`)**:
    *   *Mechanism*: Scans imports within each package and validates them against core architectural rules (e.g., `@repo/core` cannot import from `apps/`; packages must declare all dependencies in their `package.json`).
    *   *Tradeoff*: Prevents circular dependencies and loose isolation. The strictness can sometimes require restructuring code when moving utility functions to shared packages.
*   **Schema Drift (`check-schema-drift.mjs`)**:
    *   *Mechanism*: Audits database models, API contracts, and client bridge definitions to confirm they are synchronized.
    *   *Tradeoff*: Guarantees database-to-client fidelity. Requires updating and compiling definitions immediately when database shapes change.
*   **Localization Alignment (`i18n-fallback-policy-check.mjs`)**:
    *   *Mechanism*: Verifies translation files for matching keys and validates i18n fallback policies to avoid missing text at runtime.
    *   *Tradeoff*: Ensures a seamless internationalized user experience, but requires matching changes in fallback bundles.

---

### 2. Pipeline Optimization Tradeoffs

Adjusting gate behavior using environment variables involves several technical tradeoffs:

| Control | Mechanism | Pros | Cons (Risks) |
| :--- | :--- | :--- | :--- |
| **`PUSH_MODE="min"`** | Skips architectural, schema drift, and i18n verification. | Significantly speeds up hotfixes and emergency pushes. | Bypasses schema compatibility checks, which can lead to runtime crashes or broken clients. |
| **Turborepo `--only`** | Runs tasks directly on target packages without executing dependent tasks (`dependsOn: ["^lint"]` or build steps). | Prevents unrelated lint or test errors in untouched dependencies from blocking your push. | **Breaking API changes** in a library (e.g., `@repo/core`) might not trigger type errors in consuming apps (e.g., `apps/admin`) because those apps are skipped in the current check run. |
| **`SURGICAL_PUSH_COMMIT`** | Diff-limits the audited files (e.g. `SURGICAL_PUSH_COMMIT="HEAD~1"` compares only the latest commit). | Restricts verification to exactly what you just worked on, minimizing check time. | If historical commits on the branch contain unverified compile errors, they will not be audited, shifting the burden of failure onto the CI/CD pipeline. |
| **`--concurrency=1`** | Restricts Turborepo tasks to sequential execution. | Resolves OOM and virtual memory allocation crashes on Node 24+ under Windows/macOS. | Increases overall audit execution duration. |

---

## ✍️ Commit Message Hook: Commitlint

Every commit message must follow the **Conventional Commits** specification to enable automatic changelog generation and structured release versioning.

*   **File**: [.husky/commit-msg](file:///c:/Users/Naween/projects/polymath-platform/.husky/commit-msg)
*   **Config**: [commitlint.config.cjs](file:///c:/Users/Naween/projects/polymath-platform/commitlint.config.cjs)
*   **Pattern**: `<type>(<optional scope>): <description>`
*   **Common Types**:
    *   `feat`: A new feature
    *   `fix`: A bug fix
    *   `refactor`: A code change that neither fixes a bug nor adds a feature
    *   `chore`: Changes to build process, dependency updates, or auxiliary tools
    *   `docs`: Documentation changes
