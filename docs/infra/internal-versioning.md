# Sovereign Internal Versioning (Changesets)

> [!IMPORTANT]
> **CURRENT MODE: ALPHA (Pre-release)**
> The monorepo is currently in `alpha` mode. Versions will increment as `1.0.x-alpha.y`.

## The Developer Workflow

We have two ways to manage changesets: **Smart Mode** (Automated) and **Manual Mode** (Interactive).

### 1. Smart Mode (Recommended)
If you use **Conventional Commits** (`feat:`, `fix:`, `feat!:`), the platform can automatically "guess" what version bump you need.
```powershell
pnpm change:smart
```
- **How it works**: It looks at your most recent commit, detects which packages you touched, and decides:
    - `fix:` -> Patch
    - `feat:` -> Minor
    - `!` (Breaking) -> Major

### 2. Manual Mode (Interactive)
Use this if you need to manually group multiple packages or provide a more detailed description than your commit message.
```powershell
pnpm change
```

### 3. Release/Version Bump
Periodically (usually before a release branch or every few days), run:
```powershell
pnpm version:all
```
This command will consume all smart/manual changesets and update your `package.json` files to the next `-alpha.x` version.

---

## Technical Lifecycle

- **Pre-release Mode**: Enabled via `pnpm dlx changeset pre enter alpha`. 
- **Internal Linking**: Since we use `workspace:*`, Changesets ensures that when `@repo/core` versions up, dependent packages like `@repo/ui` are notified if they need a bump as well.
- **Traceability**: Every version bump is tied to a summary of changes in the `CHANGELOG.md`.
