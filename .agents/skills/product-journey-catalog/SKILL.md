---
name: product-journey-catalog
description: Use the Product and Journey Catalog to discover, specify, implement, trace, and verify product features and user journeys against existing behavior and evidence.
---

# Product and Journey Catalog

Read `docs/architecture/product-journey-catalog.md` and the relevant existing catalog records. Use the documented CLI to list, inspect, trace and check the relevant IDs. A gap, link, route or declared evidence is not proof of working behavior.

Before proposing or editing a feature, load [brownfield-feature-integration](../brownfield-feature-integration/SKILL.md); for user-facing journeys also load [user-journey-orchestration](../user-journey-orchestration/SKILL.md) and applicable domain skills. Establish the user's actual intent and authority, inspect existing implementations and contracts, and distinguish source facts, product decisions, assumptions and unverified claims. Preserve existing behavior and ask only when a material unresolved decision cannot be grounded.

Define or update stable feature, intent, journey, requirement, scenario and binding records as appropriate. Classify requirements as product, functional, quality or constraint and record their origin. Include interaction and feedback, setup and everyday contexts where relevant, domain invariants, failure and recovery. Implement the authorized task end to end using existing seams; record evidence only with its tier, revision, environment, substitutions and limitations. Query and validate the resulting records, run relevant checks, inspect the diff and report missing or unverified work. Never treat PJC declarations as authorization or as proof that runtime behavior exists.

Organize version 2 records as feature → actor intent → journey in feature modules listed by `packages/core/src/flows/pjc/catalog.v2.json`. A feature can serve many intents and an intent can have many journeys. Attach requirements, architecture, implementation bindings, scenarios and evidence to the relevant journey. Use explicit shared references for shared intents, journeys and authorities. Record ordered paths through transitions and evidence per scenario. From the repository root, use `pnpm exec tsx --tsconfig packages/core/tsconfig.json scripts/pjc.ts journey <journey-id>` to review the complete journey thread; shared authorities remain links to existing contracts, not duplicated source truth. Version 1 and mixed-format inputs are rejected.

Identify existing behavior, impacted callers and platform differences during brownfield discovery. Record journey-owned `observations`, `impacts` and `platformDifferences` with stable IDs, provenance and links to relevant source bindings. Report unknown analysis as a gap; a declaration is not automatically verified behavior or impact analysis.
