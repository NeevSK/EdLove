# CI/CD & Pipeline Synchronization Playbook (gh-fix-ci)

Core instructions for debugging failing GitHub Actions pipelines, fixing monorepo build-graph errors, and resolving CI check blockers.

---

## 1. Context & Operational Scope
Use this skill when checking or fixing files in the `.github/workflows/` directory, resolving build failures on CI, or fixing lint/test regressions before merging.

### Target Workflows:
*   `quality-gate.yml`: The central type-checking and unit-testing pipeline.
*   `pr-guard.yml`: Pull request sanity and check validations.
*   `web-deploy.yml`: Static asset compile and CDN sync actions.

---

## 2. Debugging Strategy
When a CI step fails:
1.  **Retrieve CI logs**: Do not guess what failed. Inspect the output or run the specific compiler step locally.
2.  **Reproduce locally**: Run the identical turbo task inside the workspace:
    ```powershell
    pnpm run build --filter=<affected-package>
    ```
3.  **Audit the Build Graph**: If a module resolution failure occurs, verify `package.json` exports and dependency versions in `pnpm-workspace.yaml`.

---

## 3. Resolving TypeScript & Linting Blockers
> [!IMPORTANT]
> Never bypass type checking or disable compiler rules in CI configurations. Fix the underlying type safety issues or resolve pathing discrepancies directly in code.

*   **Type Failures (`TS2307`, `TS2882`)**: Verify imports are mapped correctly inside `tsconfig.json`. Ensure absolute path aliases are cleanly resolved under Node ESM.
*   **Unused Imports / Variables**: Run our monorepo linter locally to catch unused variables before committing:
    ```powershell
    pnpm run lint --fix
    ```
*   **Turbo Cache Poisoning**: If local builds pass but CI fails with mysterious cached artifacts, clear caches locally:
    ```powershell
    pnpm exec turbo clean
    ```
