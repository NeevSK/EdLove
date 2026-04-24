# Dependency Lifecycle & Maintenance (Expo SDK 55)

## 1. Compliance Strategy: "The Cautious Audit"

Because this repository is built on a specific Expo SDK version (v55), standard `pnpm update` commands are **prohibited** for core platform libraries. We follow a "Validated first, Updated second" approach.

### The "Dry Run" Check
Before any update, run the Expo validator to ensure we aren't drifting from the SDK's tested peers.

```bash
# Verify compliance without modifying package.json
pnpm --filter gurudevi-mobile exec expo install --check
```

### Discovery of Safe Patches
Standard `pnpm outdated` is used to find security patches, but results must be filtered.

```bash
# Check all dependencies for updates
pnpm --filter gurudevi-mobile outdated
```

**Rule of Thumb:**
- **EXPO-* packages**: Do NOT update unless `expo install --check` recommends it.
- **Peer Dependencies (React, React Native)**: Do NOT update. These are managed by the Expo SDK.
- **Generic Utilities (date-fns, lodash)**: Safe for manual minor/patch updates after CI verification.

---

## 2. Automated Lifecycle (Future)

We utilize the **Polymath Platform MCP** and (future) **Renovate** to automate the discovery of safe updates.

### Infrastructure Health Checks
The following hygiene scripts are used to ensure that dependency updates don't introduce architectural decay (e.g., circular imports or leaked native modules).

1. **Hygiene Audit**: `pnpm run check:hygiene`
2. **Circular Deps**: `pnpm run check:circular`
3. **Unused Code**: `pnpm run check:unused`

---

## 3. Dependency Roles

- **Fixed Packages**: Native modules that require specific build-time shims (e.g., `react-native-reanimated`, `gluestack-ui`).
- **Flexible Packages**: Pure TS/JS logic libraries that can be safely patched for security.

## 4. Normalization of Imports

All internal package references must use the `@repo/*` workspace protocol. 
- **DO NOT** use relative paths to cross package boundaries (e.g., `import {X} from "../../../packages/core"`).
- **DO** use `@repo/core`.

Managed by: `platform-mcp:audit_monorepo_hygiene`

---

## 5. Internal Versioning
For information on how to bump versions for our internal `@repo/*` packages, see the [Sovereign Internal Versioning Guide](../../../docs/infra/internal-versioning.md).
