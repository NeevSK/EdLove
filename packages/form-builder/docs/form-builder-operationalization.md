# Sovereign Form Builder — Operationalization

> Sequential agent prompts. One wall at a time.

---

## How to Use This Document

Each phase is a contained unit of work. Give your agent the prompt exactly as written, with the audit output and architecture doc as context. Verify before moving to the next phase. Never skip ahead.

The rule: **audit → implement → verify → next.**

---

## Current Reality (May 2026 Audit)

- `@repo/form-builder` — functional skeleton, tightly coupled to `@repo/core`
- `form-manager.ts` — state machine exists, works
- `FormHydrator` — exists, converts JSON to logic
- `analytics.ts` — client-side aggregation, CSV/XLSX export works
- `NativeForm.tsx` — claims to be universal renderer, needs to split
- `FormBuilder.tsx` — builder UI exists, no drag-and-drop
- QR distribution — works
- Persistence — local storage, works
- Drag-and-drop — absent
- Conditional logic — placeholder only
- Platform package split — not done (native pollution risk)

---

## Phase 0 — Extract the Engine

**What this does:** Pulls pure logic out of `@repo/form-builder` into a new `@repo/form-builder/engine` package. No platform deps. No Supabase. No SQLite. Just TypeScript and Zod.

**Why first:** Every subsequent phase depends on this. Build on polluted foundation and all future work inherits the pollution.

---

### Agent Prompt — Phase 0

```
I need you to refactor the form builder in our Gurudevi monorepo. 
Do not change any functionality. Only move and reorganize.

GOAL: Create a new package at @repo/form-builder/engine that contains 
only pure logic with zero platform dependencies.

STEP 1 — AUDIT FIRST:
- Read the current @repo/form-builder package fully
- Read @repo/core/src/logic/forms/ fully
- List every import in form-manager.ts, dynamic-loader.ts, analytics.ts
- Identify which imports are platform-specific vs pure TypeScript
- Report before making any changes

STEP 2 — CREATE ENGINE PACKAGE:
Create packages/form-builder-engine/ with this structure:
  src/
    schema/
      FormSchema.ts        — versioned JSON schema types
    manager/
      FormManager.ts       — state machine (values, errors, dirty)
    hydrator/
      FormHydrator.ts      — JSON blob → FormManager
    validation/
      ValidationEngine.ts  — Zod-powered validation
    analytics/
      AnalyticsEngine.ts   — aggregation logic
    adapters/
      interfaces.ts        — FormStorage, FormAnalytics, FormSync interfaces
    index.ts               — public exports

STEP 3 — DEFINE ADAPTER INTERFACES:
In adapters/interfaces.ts, define these TypeScript interfaces exactly:

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

STEP 4 — VERSIONED SCHEMA:
The FormSchema must be versioned:
{ v: "1.0", id, tenantId, title, pages: [], settings: {}, createdAt, updatedAt }

STEP 5 — MOVE LOGIC:
Move form-manager.ts, dynamic-loader.ts, analytics.ts logic into the 
engine package. Remove any @repo/core or platform-specific imports. 
If something cannot be moved without a platform dep, flag it — do not force it.

STEP 6 — VERIFY:
The engine package must have zero imports from:
- react, react-native, expo
- @repo/core, @repo/ui
- supabase, sqlite, any database
Only allowed external dep: zod

Report what you moved, what you left behind, and why.
```

**Verify before proceeding:** `@repo/form-builder/engine` builds with zero platform deps.

---

## Phase 1 — Supabase + SQLite Adapters

**What this does:** Implements the engine's adapter interfaces for Gurudevi's specific infrastructure.

**Why this order:** Engine must exist before adapters can implement its interfaces.

---

### Agent Prompt — Phase 1

```
The form builder engine now has adapter interfaces defined in 
@repo/form-builder/engine/src/adapters/interfaces.ts

Create two adapter packages:

PACKAGE 1: @repo/form-builder-supabase
Implements FormStorage and FormAnalytics using Supabase.
- FormStorage.save() → upsert to forms table with tenantId
- FormStorage.load() → select by id, RLS handles tenant isolation
- FormStorage.list() → select all for tenantId
- FormAnalytics.record() → insert response row
- FormAnalytics.aggregate() → Supabase JSONB aggregation query
- FormAnalytics.export() → query + CSV transform

PACKAGE 2: @repo/form-builder-sqlite  
Implements FormStorage and FormSync using SQLite (on-device).
- FormStorage — local form schema cache
- FormSync.push() — queue local changes for upload
- FormSync.pull() — fetch remote changes since date
- FormSync.resolveConflict() — last-write-wins on updatedAt timestamp

Each package imports from @repo/form-builder/engine for the interfaces.
Each package imports its own infrastructure (supabase-js or expo-sqlite).
They must never import from each other.

Use the existing Supabase client already configured in the monorepo.
Use expo-sqlite for the SQLite adapter.

Report the table schemas you need created in Supabase for forms and responses.
```

**Verify before proceeding:** Both adapters compile. Supabase adapter can save and load a test form.

---

## Phase 2 — Web UI Package

**What this does:** Builds the web form builder UI consuming the engine, with drag-and-drop field reordering.

---

### Agent Prompt — Phase 2

```
Create @repo/form-builder-web package.

This package is for WEB ONLY. It must never import react-native.

Dependencies allowed:
- @repo/form-builder/engine (for all logic)
- @dnd-kit/core and @dnd-kit/sortable (for drag-and-drop)
- @repo/ui (for web components only)
- react (web)

COMPONENTS TO BUILD:

1. WebFormBuilder.tsx
   The creator experience. A teacher opens this to build a form.
   - Left panel: field type palette (Text, Number, Select, Likert, Slider, Date)
   - Center panel: sortable field list using @dnd-kit/sortable
   - Right panel: selected field property editor (label, required, validation)
   - Top bar: form title, save button, preview toggle
   - Each field in the list has a drag handle (grip icon), edit, and delete

2. WebFormRenderer.tsx  
   The responder experience. A student or parent fills this out.
   - Renders fields from FormSchema using engine's FormHydrator
   - Validates using engine's ValidationEngine
   - Submits response via FormAnalytics.record()
   - No drag-and-drop (responders don't reorder)

3. useDragAndDrop.ts hook
   Wraps @dnd-kit logic for field reordering.
   On drag end: updates field order numbers in FormSchema.
   Calls FormManager to update state.

DRAG AND DROP RULES:
- Use SortableContext with verticalListSortingStrategy
- Drag handle on left side of each field row
- Animate with CSS transitions only (no heavy animations)
- Update field.order numbers after each reorder

Do not build conditional logic UI yet. 
The Logic tab can remain a placeholder.

Show me the component structure before writing any code.
```

**Verify before proceeding:** A teacher can add fields, reorder them via drag, edit labels, and save. Preview shows the rendered form.

---

## Phase 3 — Native UI Package

**What this does:** Builds the React Native form builder UI consuming the same engine.

---

### Agent Prompt — Phase 3

```
Create @repo/form-builder-native package.

This package is for REACT NATIVE ONLY. It must never import 
DOM-specific libraries like @dnd-kit.

Dependencies allowed:
- @repo/form-builder/engine (for all logic)
- react-native-reanimated-dnd (for drag-and-drop, built on Reanimated 4)
- @repo/ui (for native components only)
- react-native, expo

COMPONENTS TO BUILD:

1. NativeFormBuilder.tsx
   The creator experience on mobile/tablet.
   - Scrollable sortable field list using react-native-reanimated-dnd
   - Tap field to open bottom sheet property editor
   - FAB button to add new field
   - Long press to activate drag handle

2. NativeFormRenderer.tsx
   The responder experience on mobile.
   - Renders fields from FormSchema
   - Uses native input components (TextInput, Picker, Slider)
   - Keyboard-aware scrolling
   - Validates on submit via engine's ValidationEngine
   - Works offline — queues response in SQLite if no connection

3. useSortableFields.ts hook
   Wraps react-native-reanimated-dnd for field reordering.
   Same interface as web's useDragAndDrop hook — different implementation.

The engine integration must be identical to the web package.
Same FormSchema. Same FormManager. Same ValidationEngine.
Only the rendering layer differs.

Show me the component structure before writing any code.
```

**Verify before proceeding:** On a native device, teacher can add fields, reorder by long-press drag, and the rendered form is fillable offline.

---

## Phase 4 — Conditional Logic Engine

**What this does:** Implements if/then/else field visibility and page branching using JSONLogic.

**Why deferred:** Logic does not block Phase 1 use. Schools can use basic forms immediately. Conditionals are enhancement, not foundation.

---

### Agent Prompt — Phase 4

```
Implement conditional logic in @repo/form-builder/engine.

USE JSONLogic as the conditional expression format.
Install: npm install json-logic-js @types/json-logic-js

CONDITIONS ARE STORED IN THE SCHEMA:
Each FormField and FormPage can have a conditions array:
{
  conditions: [
    {
      action: "show" | "hide" | "require",
      rule: { "==": [{ "var": "field_001" }, "yes"] }
    }
  ]
}

IMPLEMENT in ConditionalEngine.ts:
- evaluateFieldVisibility(field, currentValues) → boolean
- evaluatePageVisibility(page, currentValues) → boolean  
- evaluateRequirement(field, currentValues) → boolean

These functions take current form values and JSONLogic rules.
They return what the UI should do.

UPDATE FormManager to:
- Track which fields are currently visible
- Recompute visibility on every value change
- Pass visibility state to the UI layer

UPDATE WebFormRenderer.tsx and NativeFormRenderer.tsx to:
- Check field visibility before rendering
- Show/hide fields smoothly based on engine state

For the builder UI (Phase 2 and 3):
- Replace the Logic tab placeholder with a simple condition builder
- Allow: "Show this field if [field] [equals/contains/is not empty] [value]"
- Store the resulting JSONLogic expression in field.conditions

Keep it simple. One condition per field for now. AND/OR logic is future.
```

---

## Phase 5 — Server-Side Analytics

**What this does:** Offloads aggregation to Supabase for institutional-scale data.

**Why deferred:** Client-side analytics works fine for small schools. Server-side matters at scale.

---

### Agent Prompt — Phase 5

```
Upgrade the Supabase analytics adapter for server-side aggregation.

CURRENT STATE: analytics.ts does client-side aggregation.
PROBLEM: Degrades with thousands of responses.
SOLUTION: PostgreSQL JSONB queries via Supabase.

In @repo/form-builder-supabase, update FormAnalytics.aggregate():

For each field type, write a Supabase RPC function:
- Text fields: count responses, find most common values
- Number fields: avg, min, max, percentile distribution
- Select/Likert fields: count per option, percentage breakdown
- Slider fields: avg, distribution histogram

The RPC functions run in Postgres, return only final stats.
The client receives a small AggregatedStats object, not raw responses.

Also implement response pagination:
FormAnalytics.export() should stream responses in batches of 500,
not load all into memory at once.

Write the Supabase migration SQL for the RPC functions.
Show the SQL before running anything.
```

---

## Phase 6 — Offline Sync (The Sri Lanka Wall)

**What this does:** Full offline-first capability. Form definitions cached locally. Responses queued when offline. Sync when connection returns.

**Why last:** Most complex. Requires all other phases stable first.

---

### Agent Prompt — Phase 6

```
Implement offline sync in @repo/form-builder-sqlite.

REQUIREMENTS:
1. Form definitions cached in SQLite on first load
2. Partial responses survive app kills (auto-saved every 30 seconds)  
3. Completed responses queued in SQLite when offline
4. Background sync uploads queued responses when connection returns
5. Conflict resolution: last-write-wins on updatedAt for form schemas

IMPLEMENT:

OfflineQueue.ts in the SQLite adapter:
- enqueue(response: FormResponse) — saves to local queue table
- processQueue() — uploads all queued responses to Supabase
- getQueueSize() — how many responses are waiting

FormCache.ts:
- cacheForm(schema: FormSchema) — saves schema to SQLite
- getCachedForm(id: string) — loads from SQLite
- invalidateCache(id: string) — marks stale
- getCacheAge(id: string) — how old is the cached version

SyncManager.ts:
- Listens for network connectivity changes (use @react-native-community/netinfo)
- When online: calls processQueue(), then pulls schema updates
- When offline: routes all storage calls to SQLite cache
- Exposes sync status for UI (syncing, synced, pending: N)

The NativeFormRenderer must show a sync status indicator:
- Green: all responses synced
- Yellow: N responses pending (offline)
- Never block form submission when offline — always queue

Test scenario to verify:
1. Load a form while online
2. Turn off network
3. Submit 3 responses
4. Turn network back on
5. Verify all 3 responses appear in Supabase
```

---

## Verification Checklist (End of All Phases)

Before declaring the form builder production-ready for Gurudevi:

- [ ] A teacher can create a form on web without touching code
- [ ] The same form schema renders correctly on iOS and Android
- [ ] A student can fill and submit a form with no internet connection
- [ ] Responses sync automatically when connection returns
- [ ] Conditional logic shows/hides fields correctly
- [ ] Analytics display correctly for 1000+ responses
- [ ] Different schools cannot see each other's forms (RLS verified)
- [ ] Form schema migration works when fields are added/removed
- [ ] The engine package builds with zero platform dependencies
- [ ] Web and native packages have zero cross-imports

---

## What We Are Not Building (Stay Focused)

- Pixel-perfect visual layout editor
- File upload fields (Phase 2 scope)
- Multi-page forms with progress bar (Phase 2 scope)
- Form themes and branding (Phase 2 scope)
- Public form embedding (Phase 2 scope)
- The universal form builder for everyone (never — that hut is not ours)

---

*Document version: May 2026*
*Built for Gurudevi — a multi-tenant School ERP/LMS for Sri Lanka*
