# Sovereign Form Builder — Architecture

> Built for Gurudevi. Architected for sovereignty.

---

## 1. The Central Insight

The reason no one has built a universal cross-platform form builder is not lack of capability — it is lack of constraints. The problem is too wide when aimed at everyone. Aimed at Gurudevi — Sri Lankan schools, offline-first, multi-tenant, web and mobile — the problem becomes solvable. We build for our clearing. The jungle can have the rest.

---

## 2. The Three-Layer Mental Model

```
┌─────────────────────────────────────────────┐
│              PLATFORM UI LAYER              │
│   @repo/form-builder/web (React + dnd-kit)  │
│   @repo/form-builder/native (RN + DraggableFlatList) │
└─────────────────┬───────────────────────────┘
                  │ consumes
┌─────────────────▼───────────────────────────┐
│               ENGINE LAYER                  │
│         @repo/form-builder/engine           │
│   Pure TypeScript. Zero platform deps.      │
│   Zod schemas. Adapter interfaces only.     │
└─────────────────┬───────────────────────────┘
                  │ implemented by
┌─────────────────▼───────────────────────────┐
│             ADAPTER LAYER                   │
│   @repo/form-builder/supabase               │
│   @repo/form-builder/sqlite                 │
│   (others can write their own)              │
└─────────────────────────────────────────────┘
```

**Why this matters:** Platform choice is purely a UI rendering decision. All logic — validation, conditionals, analytics, offline — lives in the engine and is inherited by both platforms for free.

---

## 3. The Engine (Heart of Everything)

The engine is intentionally dependency-free except for Zod. It defines interfaces — not implementations.

### What lives here:
- `FormSchema` — the versioned JSON structure describing a form
- `FormManager` — state machine: values, dirty fields, validation errors
- `FormHydrator` — converts a JSON blob from DB into a live FormManager
- `ValidationEngine` — Zod-powered, single source of truth
- `ConditionalEngine` — if/then/else field logic (JSONLogic-based, Wall 2 solution)
- `AnalyticsEngine` — response aggregation logic
- Adapter interfaces: `FormStorage`, `FormAnalytics`, `FormSync`

### What does NOT live here:
- Any React or React Native import
- Supabase, SQLite, or any infrastructure
- dnd-kit or any gesture library
- Any platform-specific assumption

### The Adapter Pattern (Why Others Can Use This Too)

```typescript
// The engine only knows about interfaces
interface FormStorage {
  save(form: FormSchema): Promise<void>
  load(id: string): Promise<FormSchema>
  list(tenantId: string): Promise<FormSchema[]>
  delete(id: string): Promise<void>
}

interface FormAnalytics {
  record(formId: string, response: FormResponse): Promise<void>
  aggregate(formId: string): Promise<AggregatedStats>
  export(formId: string): Promise<CSVData>
}

interface FormSync {
  push(form: FormSchema): Promise<void>
  pull(since: Date): Promise<FormSchema[]>
  resolveConflict(local: FormSchema, remote: FormSchema): FormSchema
}
```

Gurudevi implements these with Supabase + SQLite. Someone else can implement them with Firebase + MMKV. The engine never knows the difference.

---

## 4. The Versioned JSON Schema

Every form is a versioned JSON object. This is the single source of truth for structure.

```typescript
interface FormSchema {
  v: "1.0"
  id: string
  tenantId: string
  title: string
  description?: string
  pages: FormPage[]
  settings: FormSettings
  createdAt: string
  updatedAt: string
}

interface FormPage {
  id: string
  title?: string
  fields: FormField[]
  conditions?: PageCondition[]
}

interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  validation?: ZodSchema  // serialized
  conditions?: FieldCondition[]
  order: number
  config: FieldConfig  // type-specific config
}
```

**Why versioned?** When a form changes mid-year, old responses still reference the old schema. `v: "1.0"` lets us run local migration scripts without breaking historical data. Wall 5 (multi-tenancy data integrity) solved.

---

## 5. The Platform Split — Why and How

### The Problem (Native Pollution)

If `@repo/form-builder` imports both `@dnd-kit` (DOM-dependent) and `react-native-draggable-flatlist` (RN-dependent) in the same package, bundlers get confused, bundle sizes bloat, and runtime crashes occur. This is the native pollution wall.

### The Solution

```
@repo/form-builder/engine     — zero platform deps
@repo/form-builder/web        — engine + @dnd-kit/core + @dnd-kit/sortable
@repo/form-builder/native     — engine + react-native-draggable-flatlist (FlashList-based)
```

Each platform package imports engine. Never the reverse. Never cross-imports between web and native.

### Rendering Philosophy

Web and native render differently by design. We do not chase a "universal renderer." `NativeForm.tsx` claiming to serve both is a smell — it should split into `WebForm.tsx` and `NativeForm.tsx`, each consuming the same engine state.

---

## 6. The Hard Walls and How We Solve Them

### Wall 1: Rendering model is fundamentally different
**Solution:** Package split. Web renderer and native renderer are separate packages consuming the same engine. No shared rendering code.

### Wall 2: JSON schema becomes a programming language
**Solution:** JSONLogic as the conditional engine. JSONLogic is a published standard, not something we invent. Conditions are stored as JSONLogic expressions in the schema. The engine evaluates them. Complex but bounded.

```typescript
// Example condition stored in schema
{
  "if": [{ "==": [{ "var": "field_001" }, "yes"] }, "show", "hide"]
}
```

### Wall 3: Validation in three places simultaneously
**Solution:** Zod as single source of truth — already our decision. Schema-level Zod definitions get serialized into the JSON schema. FormManager deserializes and runs them client-side. The Hono API layer runs the same Zod schema server-side. One definition. Three enforcement points. No drift.

### Wall 4: Visual builder eating itself
**Solution:** Strict separation of builder (creator experience) and renderer (responder experience). The builder manipulates a `FormSchema` JSON object. The renderer consumes it. They never share component trees — only the schema object.

### Wall 5: Multi-tenancy and data ownership
**Solution:** Every `FormSchema` and `FormResponse` carries `tenantId`. Supabase RLS enforces boundaries at the database layer. For analytics at scale: client-side SQLite aggregation handles school-level queries. Supabase JSONB aggregation handles cross-school institutional queries. Old responses carry schema version; migration scripts handle evolution.

### Wall 6: Offline (The Sri Lanka Wall)
**Solution:** SQLite on-device via the SQLite adapter. Form definitions are cached locally on first load. Partial responses survive app kills. Sync conflict resolution follows last-write-wins for drafts, with a merging strategy for published forms. This is deferred to post-Phase-1 but architecturally designed for from the start.

---

## 7. Dependency Choices and Bus Factors

### Form State Engine
**TanStack Form** — framework-agnostic, headless, TypeScript-first. Part of the TanStack ecosystem (Query, Router, Table) with strong institutional backing. Grows with complexity. Works in both React and React Native since it does not touch the DOM.

*Why not React Hook Form:* RHF relies on DOM refs internally, making true RN support awkward. For a cross-platform engine, TanStack Form's controlled-only, headless architecture is the correct choice.

### Validation
**Zod** — already confirmed as single source of truth. No change.

### Web DND
**@dnd-kit/core + @dnd-kit/sortable** — actively maintained, lightweight (10kb core, zero deps), fully customizable. Used in production by Puck editor and many others. Accessible by default. The right choice for a form builder's sortable field list.

### Native DND
**react-native-reanimated-dnd** — newer library built on Reanimated 4 and Gesture Handler. More actively maintained than `react-native-draggable-flatlist` (which was last published over a year ago). Supports sortable lists, FlashList performance, variable heights, and drag handles — exactly what a form builder field list needs.

*Note on react-native-draggable-flatlist:* Last published a year ago. 36 dependents. Bus factor concern is real. react-native-reanimated-dnd is the safer choice.

### Hono (API Layer)
Cloudflare-backed. Yusuke Wada as primary maintainer. Institutional support significantly reduces bus factor compared to community-only projects.

---

## 8. What We Are NOT Building

- A universal form builder for everyone (that hut is not ours to maintain)
- A visual drag-and-drop builder with pixel-perfect layout (scope creep)
- A replacement for Google Forms (different market, different constraints)
- A form builder that requires internet (Sri Lanka demands offline-first)

The jungle can have these. We keep the clearing we need.

---

## 9. Standalone Extraction Path (The Shopify Pattern)

When the engine is clean and adapters are well-defined, extraction to a standalone npm package is straightforward:

```
@gurudevi/form-engine  →  published as  →  @sovereign/form-engine
```

The Supabase and SQLite adapters ship as optional peer packages. Others bring their own. This is how Shopify extracted Polaris, how Radix extracted primitives, how shadcn extracted components — internal pain, clean abstraction, open source.

This is not the goal now. It is the architectural affordance we preserve by building correctly.

---

*Document version: May 2026*
*Built for Gurudevi — a multi-tenant School ERP/LMS for Sri Lanka*
