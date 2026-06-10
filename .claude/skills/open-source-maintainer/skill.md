# Monorepo Integrity & Release Readiness Playbook (open-source-maintainer)

Core operational manuals for maintaining package boundaries, synchronizing dependencies, resolving schema drifts, and verifying release-readiness.

---

## 1. Context & Operational Scope
Use this skill when auditing imports across workspaces, reorganizing packages, running dependency syncs, or performing pre-release sanity checks across the monorepo.

---

## 2. Monorepo Boundaries & Dependency Management
*   **Syncpack Discipline**: Every workspace dependency must match identical version structures to prevent caching compilation errors on Turbo.
*   **Import Boundaries**: App packages (`apps/*`) must never import directly from nested folders of other app directories. Shared primitives must live in `packages/*` and be imported as clean workspace packages.
*   **Package Manifest Rules**: Ensure all package dependencies are declared inside their specific `package.json` configurations (rather than relying on root hoist allocations).

---

## 3. The Release Readiness Audit
> [!IMPORTANT]
> Before proposing a pull request merge, execute a full verification suite to ensure zero regressions are introduced.

1.  **Compile sanity check**: Build the entire workspace to check for module export conflicts:
    ```powershell
    pnpm run build
    ```
2.  **Linting & Style Checks**: Ensure code meets all standards by running biome / eslint rules:
    ```powershell
    pnpm run lint
    ```
3.  **Syncpack Audits**: Run dependency checks to catch any mismatched third-party packages:
    ```powershell
    pnpm syncpack list
    ```
