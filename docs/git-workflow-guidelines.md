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
