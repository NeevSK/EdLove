# ZenStack v3 Migration & Sovereign Siphoning Notes

## 1. Why ZenStack "Failed" (The v2 vs v3 Gap)
During the Astro v6 migration, the ZenStack generation process appeared to fail (silent skipping of Zod plugins) because of the transition from **Static Generation** (v2) to **Dynamic Derivation** (v3).

### Key Findings:
- **Plugin Consolidation**: In ZenStack v3, the `@zenstackhq/zod` plugin is optimized for the `createSchemaFactory` API. Instead of writing dozens of `.ts` files to disk (static), it generates a single `schema.ts` metadata file.
- **Silent Defaults**: If a `plugin orm` is not configured or specifically pointed, ZenStack v3 may default to paths that are invisible in a monorepo structure.
- **Provider String Mismatch**: Version 3 strictly requires the `@zenstackhq/orm` and `@zenstackhq/zod` providers to be correctly referenced in the `schema.zmodel`.

### Prevention Checklist:
1. **Explicit Output**: Always use the `--output` CLI flag or the `output` property in `plugin orm` to point to `@repo/core`.
2. **SSOT Redirection**: Never generate artifacts inside the `database` package if you intend to use them in Expo or Astro. Generate them in the **Sovereign Core** (L0).
3. **Factory Adoption**: Use the `factory.makeModelSchema('Model')` pattern instead of importing static files. This ensures your Zod schemas are always in sync with the metadata.

## 2. Sovereign Core vs. Framework Contamination
As identified in the `structural_integrity_audit.md`, the `@repo/core` package is currently "Mixed." To achieve the goal of "making version changes low friction in the endless future," we must separate the **Sovereign Brain** from the **Framework Hands**.

### The Siphoning Strategy (L0 Resolution):
- **Layer 0 (Pure Domain)**: Contains the `generated` schemas, `factory.ts`, and pure business logic. **ZERO** imports from `react`, `react-native`, or `supabase`.
- **Layer 0.5 (Framework Bridge)**: Contains the Supabase clients, Zustand stores, and React Query hooks. These are the parts that will "oscillate" with Astro/Node updates.

### Current Implementation State:
- [x] Redirect ZenStack SSOT to `@repo/core/generated`.
- [x] Standardize Zod v4 and ZenStack v3 peer dependencies.
- [ ] **Next Step**: Audit and move `core/src/lib/supabase.ts` and `core/src/api/hooks` to a separate layer or package to prevent leakages into the Pure Brain.
