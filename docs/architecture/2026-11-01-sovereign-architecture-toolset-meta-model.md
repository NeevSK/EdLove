---
title: "Sovereign Architecture Toolset & Meta-Model Manual"
status: "active"
date: "2026-11-01"
author: "Antigravity Pair Programming"
tags: [architecture, tools, meta-model, code-erd, archaeology, seams, bypasses, overlaps]
---

# Sovereign Architecture Toolset & Meta-Model Manual

## 1. Executive Purpose: Why This Meta-Model Exists

In fast-paced, multi-agent development environments, codebase complexity grows non-linearly. Without formal tools to inspect the physical substrate, agents and developers succumb to **Accretive Local Optimization**:
- Piling helper functions onto bedrock files (`identityState.ts` grew from 43 to 156 lines).
- Bypassing intermediate facades (Layer 12 importing Layer 6 *and* Layer 2 *and* Layer 0).
- Re-inventing existing concepts under slightly different names (6 different guest/anonymous checkers).
- Scattering hooks and stores across 29 folders with no coherent boundary rules.

To make monorepo maintenance deterministic, reproducible, and transparent, we created the **Sovereign Architecture Intelligence Suite**—a meta-model of five computational engines operating at different depths of the codebase.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              SOVEREIGN ARCHITECTURE INTELLIGENCE SUITE (META-MODEL)             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [1. Code-ERD Topological Engine] ──► Extracts AST, maps layers down to bedrock │
│  [2. Bedrock Archaeology Tracker] ──► Traces git churn, birth dates, & 4 eras   │
│  [3. Seam & Bypass Detector]      ──► Detects diamond leaks & layer bypasses    │
│  [4. Folder Ontology Auditor]     ──► Audits 29 folders, hook/store dispersion  │
│  [5. Semantic Overlap Scanner]    ──► Isolates duplicate functions & components │
│                                                                                 │
│  [Interactive Web DevTools Hub]   ──► http://localhost:3000/architecture        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Five Sovereign Engines (Reference & Usage)

### Engine 1: Code-ERD & Topological Layer Engine
* **Script**: [`scripts/code-erd.mjs`](file:///c:/x/scripts/code-erd.mjs)
* **Problem It Solves**: In a monorepo, developers cannot manually track which files are bedrock vs intermediate vs top-level. Circular imports and ambiguous barrels hide true dependencies.
* **Algorithm**:
  1. Recursively walks import trees from any entry point (defaults to `packages/ui/src/components/SanctuaryGuard.tsx` or `useSanctuaryFeature.ts`).
  2. Resolves canonical TypeScript paths, handling barrels (`/index.ts`, `/index.tsx`).
  3. Extracts internal AST symbols: declared functions, types, interfaces, constants, and exports.
  4. Computes topological layers: files with internal out-degree $0$ become **Layer 0 (Bedrock)**. Each importing layer is computed as $\max(\text{depLayers}) + 1$.
  5. Automatically synchronizes both a standalone HTML viewer and the Next.js DevTools JSON data (`architectureData.json`) with embedded 0ms raw file source code.
* **CLI Command**:
  ```powershell
  node scripts/code-erd.mjs [--target <file_or_directory>]
  ```
* **Output Artifacts**:
  - `reports/code-erd-explorer.html` (Interactive browser-native Code-ERD)
  - `apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json`

---

### Engine 2: Bedrock Archaeology & Accretion Tracker
* **Script**: [`scripts/audit-layer-chronology.mjs`](file:///c:/x/scripts/audit-layer-chronology.mjs)
* **Problem It Solves**: Why does a file look like a Frankenstein? When was it born, what was its original purpose, and which commits accreted ceremonies into it?
* **Algorithm**:
  1. Runs `git log --follow --format="%h|%ad|%s"` on every node in the subsystem graph.
  2. Extracts first commit (birth date and birth commit), latest commit, and total commit churn.
  3. Maps files into **Four Historical Eras**:
     - *Era 1 (Feb–June 2026)*: Legacy Bootstrap (minimal wrappers).
     - *Era 2 (July–Aug 2026)*: CASL & Permissions Accretion (`defineRulesFor`, `usePermissions`).
     - *Era 3 (Sept 2026)*: Agentic Race Accretion (generation counters, `suggestDisplayName`, `isLocalOnly`).
     - *Era 4 (Oct–Nov 2026)*: Canonical ReBAC & Modernization (UUIDv8 account cutover, pure Bond Citizenship).
  4. Evaluates whether each Bedrock (Layer 0) file is an Invariant, a Hexagonal Port, or an Accretive/Zombie candidate.
* **CLI Command**:
  ```powershell
  node scripts/audit-layer-chronology.mjs
  ```
* **Output Artifacts**:
  - `reports/bedrock-chronology-audit.md`
  - `reports/bedrock-chronology.json`

---

### Engine 3: Seam Clustering & Transitive Bypass Detector
* **Script**: [`scripts/analyze-seams-and-bypasses.mjs`](file:///c:/x/scripts/analyze-seams-and-bypasses.mjs)
* **Problem It Solves**: Detects **Diamond Dependencies / Transitive Bypasses** where an upper-layer module imports an intermediate Facade/Store, but *also* directly imports lower-layer internal building blocks from the exact same seam.
* **Algorithm**:
  1. Groups nodes into 7 domain seams (Feature Rollout, ReBAC Identity, Cedar Authz, Entitlements, Perspective, Auth Session, UI Presentation).
  2. For every directed edge $U \rightarrow V$, runs BFS to check if an alternate path $U \rightarrow W \rightarrow \dots \rightarrow V$ exists (where length $\ge 2$).
  3. If an alternate path exists and $U, V$ belong to the same seam, flags it as a **Critical Same-Seam Diamond Leak**.
* **CLI Command**:
  ```powershell
  node scripts/analyze-seams-and-bypasses.mjs
  ```
* **Output Artifacts**:
  - `reports/seams-and-bypasses-audit.json`

---

### Engine 4: Folder Ontology & Dispersion Auditor
* **Script**: [`scripts/audit-folder-ontology.mjs`](file:///c:/x/scripts/audit-folder-ontology.mjs)
* **Problem It Solves**: In a monorepo of 841 core files, folders organized by technical buzzwords (`store`, `lib`, `native`) become accidental dumping grounds where hooks, stores, and utilities scatter chaotically.
* **Algorithm**:
  1. Crawls all 29 top-level directories in `packages/core/src`.
  2. Extracts primitives breakdown: React Hooks (`use*`), Zustand Stores (`create(...)`), Effect programs, Zod Schemas, and Types.
  3. Measures **Layer Span**: $\max(\text{Layer}) - \min(\text{Layer})$ for files inside each folder.
  4. Flags architectural smells:
     - *Scattered Hooks*: Hooks located outside `hooks/` and `store/`.
     - *Utility Sprawl*: Overlapping `lib/`, `utils/`, and `shared/`.
     - *Pseudo-Native Modules*: Pure TypeScript helpers misplaced in `native/`.
     - *Framework Bleed*: React imported inside domain logic.
* **CLI Command**:
  ```powershell
  node scripts/audit-folder-ontology.mjs
  ```
* **Output Artifacts**:
  - `reports/folder-ontology-audit.json`

---

### Engine 5: Semantic Overlap & Redundancy Scanner
* **Script**: [`scripts/audit-semantic-overlaps.mjs`](file:///c:/x/scripts/audit-semantic-overlaps.mjs)
* **Problem It Solves**: Detects when different engineers/agents created duplicate functions answering the exact same domain question (e.g. 6 guest checkers, 5 button components, 6 storage wrappers).
* **Algorithm**:
  1. Scans all 4,057 exported symbols across `@repo/core` and `@repo/ui`.
  2. Clusters symbols by entity nouns (`User`, `Account`, `Bond`, `Button`, `Storage`) and verbs (`is*`, `get*`, `resolve*`).
  3. Identifies functional convergence (identical return types and inputs).
  4. Maps redundancies against the **One Canonical SSOT**.
* **CLI Command**:
  ```powershell
  node scripts/audit-semantic-overlaps.mjs
  ```
* **Output Artifacts**:
  - `reports/semantic-overlaps-audit.json`

---

### Meta-Model Bundler
* **Script**: [`scripts/bundle-tools-metamodel.mjs`](file:///c:/x/scripts/bundle-tools-metamodel.mjs)
* **Problem It Solves**: Combines the output of all 5 engines into a unified JSON schema consumed by the web DevTools portal.
* **CLI Command**:
  ```powershell
  node scripts/bundle-tools-metamodel.mjs
  ```
* **Output Artifact**:
  - `apps/gurudevi-web/app/(sanctuary)/architecture/toolsMetaModelData.json`

---

## 3. The Interactive Web DevTools Portal (`/architecture`)

The DevTools portal at `http://localhost:3000/architecture` unifies all 5 engines into an interactive dashboard:

```
[🕸️ Spotlight Graph]   [📑 Code-ERD View]   [🧱 14-Layer Matrix]   [🛠️ Toolset & Meta-Model]
```

* **Spotlight Graph**: Real interactive SVG directed curves with arrowheads connecting Callers $\rightarrow$ Center $\rightarrow$ Direct Imports $\rightarrow$ Bedrock leaf nodes.
* **Code-ERD View**: Compartmentalized database-style schema boxes showing exported functions, types, and imports.
* **14-Layer Matrix**: Complete vertical monorepo view grouped by architectural tiers.
* **🛠️ Toolset & Meta-Model Explorer**:
  - Interactive browser view of the 5 Sovereign Engines.
  - Drill-down tables for the 40 Transitive Bypasses (with clickable jump-to-file).
  - Semantic Overlap Hotspots (Guest Checkers, Buttons, Storage Wrappers).
  - Folder Ontology metrics (29 folders, hook/store dispersion).
  - Bedrock Archaeology Timeline across the 4 historical eras.
* **0ms Source Inspector**: Instant slide-over and full-screen drawer displaying raw file source code with in-file search and symbol line jumping.
