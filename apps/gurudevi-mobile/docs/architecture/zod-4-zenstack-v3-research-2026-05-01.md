---
title: "Zod 4 & ZenStack v3 Research Notes (Updated: 2026-05-01)"
status: "active"
created: 2026-05-02
updated: 2026-05-02
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Zod 4 & ZenStack v3 Research Notes (Updated: 2026-05-01)

## 1. Zod 4: The Performance & Tree-Shaking Era

### Core Architectural Shifts
Zod 4 is a major evolution focused on reducing bundle size through a functional, tree-shakable API.

#### Key Breaking Changes & Deprecations
- **Method-to-Function Migration (CRITICAL)**: Format helpers like `.email()`, `.uuid()`, `.url()`, `.datetime()` on `z.string()` are deprecated.
    - **Old**: `z.string().email()`
    - **New**: `z.email()`
    - **ISO Datetime**: Use `z.iso.datetime()` (the modern standard for ISO 8601 strings).
    - **Note**: Functional patterns enable better tree-shaking and are required to avoid `ts(6385)` deprecation warnings.
- **Unified Error Customization**: Deprecated `message`, `required_error`, and `invalid_type_error` in favor of a single `error` parameter.
    - **New**: `z.string({ error: "custom error" })`
- **Object Handling**: Deprecated `.passthrough()`, `.strict()`, and `.strip()`.
    - **New**: Use `z.looseObject()`, `z.strictObject()`, or `.catchall()`.
- **Enums**: `z.nativeEnum()` is deprecated; use the overloaded `z.enum()`.
- **Records**: `z.record()` now requires explicit schemas for both keys and values.

#### New Patterns & Features
- **@zod/mini**: A lightweight alternative for environments where every byte counts.
- **Native Recursive Types**: Improved support for mutual recursion without mandatory `z.lazy()`.
- **Built-in JSON Schema**: Native `.toJSONSchema()` support.
- **Registry System**: `z.registry()` for associating typed metadata with schemas.

---

## 2. ZenStack v3: The Kysely Engine & Dynamic Derivation

### Core Architectural Shifts
ZenStack v3 moves away from Prisma's Rust-based engine to a native TypeScript engine built on **Kysely**.

#### Key Breaking Changes & Deprecations
- **Plugin Consolidation**: The Zod plugin now generates a single `schema.ts` metadata file instead of dozens of static files.
- **Relation Exclusion (v3.6.0+)**: By default, `makeModelSchema` **excludes all relation fields**.
    - **Impact**: If your application relies on relation fields being present in the generated Zod schemas, you must explicitly include them using the new options or configuration.
- **API Shift**: Standardize on `factory.makeModelSchema('Model')` instead of importing static model files.
- **Improved Evaluation**: Evaluation of policies now uses `EXISTS` instead of `COUNT`/`SUM`, improving performance for large datasets.
- **v3.6.4 Stability**: The `3.6.4` release is the recommended baseline for Polymath, providing the most stable Kysely engine integration.

#### New Patterns & Features
- **Dynamic Derivation**: Schemas are derived at runtime from metadata, ensuring they stay in sync with the model without constant file writes.
- **Mixins with Relations**: You can now declare relations on mixins and share them across models.
- **Enhanced Policy Engine**: Deeper integration with the Kysely-based ORM for better performance in complex queries.

---

## 3. Anti-Patterns to Avoid

### Zod Anti-Patterns
1. **Method Chaining for Formats**: Continuing to use `z.string().uuid()` prevents tree-shaking and triggers deprecation warnings.
2. **Complex Lazy Wrappers**: Using `z.lazy()` for simple recursive structures where Zod 4 can now handle them natively.
3. **Implicit Error Objects**: Using the old separate error parameters instead of the unified `error` object.

### ZenStack Anti-Patterns
1. **Static Import Dependency**: Importing `UserSchema` from a generated file instead of using the `ModelSchemaFactory`.
2. **Mixed Layers (L0/L1 Leakage)**: Generating ZenStack artifacts into packages that contain framework-specific code (e.g., React components).
3. **Ignoring Relation Defaults**: Assuming `makeModelSchema` includes everything it used to in v2.

---

## 4. Implementation Checklist for Polymath Monorepo

1. **Sovereign Siphoning**: Ensure all ZenStack artifacts are generated into `@repo/core/src/logic/generated`. (Verified successful generation with v3.6.4).
2. **Factory Adoption**: Refactor all manual schema usages to use the `makeModelSchema` factory.
    - **Pattern**: `const AppSchema = makeModelSchema('Model').extend({ app_field: z.string() })`.
3. **Functional Refactor**: Convert all remaining method-chained validators to top-level functions. (Completed for `packages/core/logic/schemas`).
4. **Unified Errors**: Update custom error messages to the new `error` parameter syntax.
5. **Timestamp Verification**: Confirmed that `zen generate` correctly updates artifacts in `@repo/core/src/logic/generated`.
