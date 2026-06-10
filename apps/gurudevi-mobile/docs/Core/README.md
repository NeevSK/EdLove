# GURUDEVI CORE DOCUMENTATION
*The Source of Truth for the Educational Ecology*

This directory contains the fundamental blueprints and directives for the Gurudevi project. All developers (human and AI) must treat these documents as the primary source of truth.

## 🗺️ Documentation Hierarchy

### 📋 Product Specification & Vision Vault (Product Manager)
* [Educational Ecology and Philosophy](./educational-ecology-philosophy.md): Theoretical grounding (concentric circles, holons, autopoiesis).
* [Domain Context and User Roles](./domain-and-users.md): Perspectives, active bonds, and role mappings.
* [Product Footprint: Web vs Mobile](./product-footprint-web-vs-mobile.md): User experience splits between mobile, web platform, and Astro site.
* [Complete PRD](./GURUDEVI_COMPLETE_PRD.md): living requirements specification.

### 📐 Technical Architecture & Specifications Vault (Solution Architect)
* [Technical Stack](./tech-stack.md): Standard engineering specifications (Expo, Hono, Supabase).
* [Workspace and Navigation Philosophy](./workspace-navigation-philosophy.md): Tab logic and Expo Router static mapping.
* [Technical Architecture and Constraints](./technical-architecture-constraints.md): Multi-tenant RLS, offline-first sync (PowerSync), device/session boundaries.
* [Identity and Access Management (IAM)](./identity-and-access-management.md): Cedar-style ReBAC, active bonds, offline attributes, and device trust.
* [Security and Data Integrity](./security-and-data-integrity.md): PostgreSQL RLS, explicit sovereignty grants (ADR-002), HMAC signatures.
* [Offline-Online Synchronization Spec](./offline-online-sync-spec.md): PowerSync queue execution, idempotency, Last-Write-Wins, and soft deletes.
* [Web-Native Compatibility Guide](./web-native-compatibility-guide.md): Platform resolutions, native package web shims, and layout responsive shells.
* [Sanctuary API and Backend Spec](./sanctuary-api-and-backend-spec.md): Dynamic Hono routes, ZenStack Zod v4 schemas, and MCP hosts.

### 2. [TRUTH_AI_CONTEXT.md](./TRUTH_AI_CONTEXT.md)
Essential directives for AI agents. Correct monorepo paths, coding rules, and development protocols.

### 3. [TRUTH_DESIGN_SYSTEM.md](./TRUTH_DESIGN_SYSTEM.md)
Visual tokens, palettes, and motion laws. Ensures the "Sanctuary" aesthetic remains consistent.

### 4. [TRUTH_DOMAIN_MODELS.md](./TRUTH_DOMAIN_MODELS.md)
(Placeholder) Definitive database schema and entity relations.

---

## 📚 Supporting Context
- [NORTH_STAR.md](./NORTH_STAR.md): The project's vision and "Why."
- [GURUDEVI_COMPLETE_PRD.md](./GURUDEVI_COMPLETE_PRD.md): Detailed product requirements and feature specs.
- [GETTING_STARTED.md](./GETTING_STARTED.md): Environment setup and developer onboarding.

## 📦 [Archive](./archive/)
Historical documents, outdated sprint trackers, and superseded architecture plans. Reference only for historical context; do not use for implementation truth.
