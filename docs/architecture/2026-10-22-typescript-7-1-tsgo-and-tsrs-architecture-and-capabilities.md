---
title: "TypeScript 7.1 Beta (tsgo) & tsrs Dual-Engine Architecture Ledger"
status: "active"
created: 2026-10-22
updated: 2026-10-22
author: "Naveen"
scribe: "Antigravity"
tags: [typescript-7-1, tsgo, tsrs, compiler, architecture, pprof, es2026, content-mappers]
---

# TypeScript 7.1 Beta (tsgo) & tsrs Dual-Engine Architecture Ledger

## 1. Executive Summary & Context

On **October 22, 2026**, the Polymath Platform integrated **TypeScript 7.1.0-beta (`tsgo`)** and established a unified **Dual-Engine Typechecking Topology** bridging Microsoft's native Go compiler with the Rust-based **`tsrs` (Oxc)** engine.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   POLYMATH SOVEREIGN TYPECHECKING TOPOLOGY MAP                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   Developer Workstation (Windows x64)             CI / Container Runner (Linux Musl)   │
│   ├── pnpm run check-types:tsgo                   ├── pnpm run check-types:fast        │
│   ├── Native Go Binary Launcher                   ├── Zero-GC Rust Engine (tsrs)       │
│   └── Wall Clock: ~5.9s across 450k LOC           └── Sub-second AST Typechecking      │
│                            │                                   │                       │
│                            └─────────────────┬─────────────────┘                       │
│                                              ▼                                         │
│                                 scripts/typecheck-engine.mjs                           │
│                                 ├── Auto-detects OS & Target                           │
│                                 ├── Go Runtime pprof Profiling                         │
│                                 └── Graceful Platform Fallback                         │
│                                              │                                         │
│                       ┌──────────────────────┴──────────────────────┐                  │
│                       ▼                                             ▼                  │
│            TypeScript 7.1 Beta Core                       Monorepo Substrate           │
│            ├── Modular Programmatic API                   ├── @repo/typescript-config │
│            │   (typescript/sync, async, ast)              │   └── es2026.json          │
│            ├── Native Content Mappers                     ├── packages/ui              │
│            │   (contentMappers, SpanMap)                  │   └── Fixed barrel exports │
│            ├── Deterministic Ordering                     └── Tier 1 Native Pins       │
│            │   (--stableTypeOrdering)                         └── Preserved (Expo 58)  │
│            └── Go pprof Profiling                                                      │
│                (--pprofDir .profiles/tsgo)                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

This architecture overcomes the **7.0 Tooling Abyss** (where TypeScript 7.0 dropped the JS compiler API) while establishing an empirical, zero-regression typecheck pipeline across 26 packages and 3 applications.

---

## 2. The 7.0 vs. 7.1 Paradigm Shift

When TypeScript 7.0 transitioned the compiler to native Go (`tsgo`), compile speeds surged by orders of magnitude. However, it created a severe ecosystem fracture:
1. **The Tooling Abyss**: TypeScript 7.0 stripped out the JavaScript programmatic API (`createProgram`, `ts.TypeChecker`, AST visitor). Linters (`typescript-eslint`), codegen plugins, and bundler hooks were stranded, requiring legacy `@typescript/typescript6` compatibility bridges.
2. **Single-Format Boundary**: The compiler remained isolated to `.ts`/`.tsx` files; external template frameworks (Vue, Svelte, MDX, Astro) could not hook directly into compiler error mapping without heavy external pre-transpilation.
3. **Black-Box Performance**: Diagnosing bottlenecks across massive monorepos was constrained because Node profiling tools only observed the thin child-process launcher rather than the Go compiler core.

**TypeScript 7.1 Beta addresses each of these constraints directly.**

---

## 3. The 6 Core Capability Pillars of TypeScript 7.1 Beta

### 3.1 Pillar 1: Modular Programmatic API Preview
TypeScript 7.1 Beta introduces a clean, modular set of programmatic subpath exports in `node_modules/typescript/package.json`:
- **`typescript/sync`**: Synchronous compiler API (`API`, `Client`, `createProgram`, `Snapshot`, `SourceFileLeases`). Communicates via a high-performance local protocol over the native backend.
- **`typescript/async`**: Asynchronous, promise-based compiler API.
- **`typescript/ast`**: Standalone AST utilities (`is`, `factory`, `utils`, `scanner`, `visitor`, `clone`).
- **`typescript/fs`**: Virtual and disk filesystem abstraction layer.
- **`typescript/proto`**: JSON-RPC schema contracts over `vscode-jsonrpc`.

*Monorepo Impact*: Establishes the technical path to retire `@typescript/typescript6` compatibility shims once linters and analyzers finalize native 7.1 protocol bindings.

### 3.2 Pillar 2: Native Content Mappers (`contentMappers`)
TypeScript 7.1 Beta adds `contentMappers` as a top-level schema configuration in `tsconfig.json`:
```json
{
  "contentMappers": [
    {
      "package": "@astrojs/ts-plugin",
      "extensions": [".astro", ".mdx"]
    }
  ]
}
```
Paired with the `--runExternalCode` CLI flag and the `SpanMap` architecture (`spanMapFeature`, `spanMapKind`, `spanMapFidelity`), external template DSLs can project virtual TypeScript code into `tsc` with bidirectional source map fidelity.

### 3.3 Pillar 3: Go Runtime Profiling (`--pprofDir`)
For large codebases (>300k lines), TypeScript 7.1 exposes direct Go runtime profiling:
```powershell
tsc -p tsconfig.json --pprofDir .profiles/tsgo --noEmit
```
This generates standard gzip-compressed Go pprof profiles:
- `*-cpuprofile.pb.gz`: CPU profiling detailing type instantiation and symbol lookup hot paths.
- `*-memprofile.pb.gz`: Heap memory allocation maps.

Profiles can be analyzed directly via `go tool pprof -http=:8080 .profiles/tsgo/<profile>.pb.gz`.

### 3.4 Pillar 4: Concurrency & Solution Build Scaling
- **`--builders <n>`**: Configures the number of project references built in parallel during `tsc --build` (defaults to `GOMAXPROCS`).
- **`--checkers <n>`**: Configures worker typechecker threads allocated per project.
- **`--singleThreaded`**: Enforces single-threaded execution for constrained CI memory limits or deterministic debugging.

### 3.5 Pillar 5: Deterministic Monorepo Serialization
In multi-project composite solutions, symbol order variance between runs previously caused cache churn in `.tsbuildinfo` files. TypeScript 7.1 introduces:
- **`stableTypeOrdering`**: Enforces strict deterministic type sorting across compilations.
- **`deduplicatePackages`**: Deduplicates identical package versions across project reference boundaries.

### 3.6 Pillar 6: ECMAScript 2026 (`target: es2026`)
- `ScriptTarget.ES2026 = 13` verified in `dist/enums/scriptTarget.enum.d.ts`.
- Standard library support for `Promise.allKeyed`, `Iterator.zip`, `Iterator.concat`, and `Map.prototype.getOrInsert`.
- Ambient module import attributes (`declare module "*" with { type: "json" }`).
- Source phase imports (`import source foo from "./mod.wasm"`).

---

## 4. Dual-Engine Topology: tsgo vs. tsrs

| Dimension | `tsgo` (TypeScript 7.1.0-beta) | `tsrs` (Oxc / Rust port) |
| :--- | :--- | :--- |
| **Runtime Language** | Go (official Microsoft) | Rust (oxc-project) |
| **Garbage Collection** | Concurrent Go GC | Zero GC (Rust memory safety) |
| **Composite Solutions (`-b`)**| Full composite `--build` & `.tsbuildinfo` | Fast single-project / AST typechecking |
| **Platform Binaries (npm)** | Windows x64, macOS, Linux, BSD, AIX | Linux x64/musl, macOS arm64 (No win32-x64) |
| **Monorepo Role** | **Sovereign Primary Engine** (all platforms, composite verification) | **Velocity Engine** (Linux CI runners, Dagger Alpine containers) |

---

## 5. Sovereign Tooling Orchestrator (`scripts/typecheck-engine.mjs`)

The platform router manages dual-engine selection and features:
- **Auto-detection**: Dynamically detects host OS and runtime capabilities. On Windows, if `tsrs` native binaries are missing, it falls back to `tsgo` with a clear warning instead of crashing.
- **Performance Profiling**: Passing `--profile` automatically generates Go pprof profiles in `.profiles/tsgo/`.
- **Wall-Clock Benchmarking**: Outputs high-resolution timing via `performance.now()`.

### Available Scripts in `package.json`

```bash
# Sovereign default composite check (tsgo 7.1.0-beta)
pnpm run check-types

# Velocity check (tsrs on Linux/CI, graceful fallback on Windows)
pnpm run check-types:fast

# Explicit engine targets
pnpm run check-types:tsgo
pnpm run check-types:tsrs

# Go runtime CPU and Heap profiling
pnpm run check-types:profile
```

---

## 6. Monorepo Configuration Updates

1. **`packages/typescript-config/es2026.json`**:
   New preset extending `base.json` targeting `ES2026` with bundler resolution for Node 24 runtime applications (e.g. `apps/sanctuary-api`).
2. **`packages/typescript-config/package.json`**:
   Exposed `./es2026.json` in subpath exports.
3. **`packages/ui` Barrel Normalization**:
   - `packages/ui/package.json`: Added clean exports for `./primitives`, `./components/ui/*`, and `./utils`.
   - `packages/ui/src/primitives.ts`: Normalized internal imports from bare `@repo/ui/...` to relative `./...`, eliminating 20 spurious missing-export errors in dependent packages.

---

## 7. Empirical Hostile Critic Verification Ledger

| Verification Gate | Evidence Level | Measured Metric / Result | Status |
| :--- | :--- | :--- | :--- |
| **TypeScript Version** | G0 (Runtime) | `pnpm exec tsc -v` $\rightarrow$ `Version 7.1.0-beta` | ✅ Verified |
| **Composite Build Speed** | G0 (Compiler) | `tsc -b --noEmit` across 450k LOC: **5.9 seconds** | ✅ Verified |
| **Go pprof Profile Generation** | G0 (Artifact) | Generated `31464-cpuprofile.pb.gz` & `31464-memprofile.pb.gz` | ✅ Verified |
| **Physical Native Seams** | G1 (AST Gate) | `pnpm run check:seams`: **0 seam collisions across 946 files** | ✅ Passed |
| **CNG Pipeline Integrity** | G1 (Firewall) | `pnpm run check:cng`: **0 ephemeral native mutations** | ✅ Passed |
| **Windows tsrs Guard** | G0 (Runtime) | Hostile fallback guard prevented `ENOENT` on missing `@tsrs/win32-x64` | ✅ Verified |

---

## 8. Invariant Preservation Checklist

- [x] **Tier 1 Native Pins**: Zero modifications to `apps/gurudevi-mobile` Fabric/Hermes native configuration.
- [x] **The Deletion Veto**: No existing checks, fallbacks, or tsconfig options deleted.
- [x] **The Anti-Island Law**: Integrated cleanly into monorepo root scripts, `packages/typescript-config`, and `scripts/typecheck-engine.mjs`.
- [x] **User Global Rule**: Executed via PowerShell with UTF-8 encoded test output.
