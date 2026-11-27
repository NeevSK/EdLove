---
title: "API foundation research, 2026-11-26"
status: "active"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology, decisions]
---

# API foundation research, 2026-11-26

Everything one working session produced on the Gurudevi API foundation, in the order it happened. The decision that closes it is
[decisions/2026-11-26-gurudevi-tool-selection.md](../../decisions/2026-11-26-gurudevi-tool-selection.md).
The live Claude Docs stay the originals; these files are Markdown exports (diagrams survive as their text only).

| # | Document | Status | What it settles |
| --- | --- | --- | --- |
| 1 | [01-api-contract-and-backend-direction.md](01-api-contract-and-backend-direction.md) | superseded by 6 | TypeScript stays; Rust only as Wasm on a trigger; why the API is slow (cross-region DB, ~12 round trips) |
| 2 | [02-production-gaps-and-spec-layer.md](02-production-gaps-and-spec-layer.md) | superseded by 6 | Production gaps; first TypeSpec proposal |
| 3 | [03-typespec-evaluation-rounds-1-2.md](03-typespec-evaluation-rounds-1-2.md) | evidence | TypeSpec→OpenAPI→Hey API→oRPC vs oRPC-first vs Sovereign: all correct; cost is scattering across files, not spec language; Hey API stalled |
| 4 | [04-api-from-zero-top-down.md](04-api-from-zero-top-down.md) | draft, open questions for Neev | Users → areas → capabilities → rules → TypeSpec; Level 0 ontology |
| 5 | [05-ontology-tools-tested-on-one-case.md](05-ontology-tools-tested-on-one-case.md) | evidence | LinkML, SHACL, OWL/ROBOT, OntoUML, Alloy 6, TLA+, XState, CUE, KCL, Pkl, Nickel, Dhall on one case |
| 6 | [../../decisions/2026-11-26-gurudevi-tool-selection.md](../../decisions/2026-11-26-gurudevi-tool-selection.md) | decision | One tool per layer, what is left out, missing layers, build order |
| 7 | [06-cold-start-notes-step-1.md](06-cold-start-notes-step-1.md) | notes | Where the docs were enough, and unclear, for a fresh agent building step 1 |

## Build progress

- Step 1, the ontology folder: [`ontology/`](../../../ontology/README.md).

## Evidence (runnable inputs and raw results)

- `evidence/round1-typespec-eval/` — round 1 kit: three approaches × three tasks, generated OpenAPI, Protobuf semantics checks.
- `evidence/round2-real-repo/` — round 2 kit (tasks, hidden tests, scoring scripts), `scores.txt`, `tokens.txt`; `runs-full.tgz` holds all 16 agent runs.
- `evidence/ontology-prototype/` — Level 0 LinkML prototype (`gurudevi.yaml`, `generate.py`, outputs).
- `evidence/topdown-typespec/` — TypeSpec library with Gurudevi decorators and one area that compiles.
- `evidence/ontolab/` — the shared-case models: `model/` (LinkML, SHACL rules, data), `cue/`, `kcl/`, `pkl/`, `nickel/`, `dhall/`, `alloy/`, `tla/`, `ontouml05/`, `ontouml/statechart.mjs`, `out/` (generated OWL, SHACL, reasoner output, Alloy receipts).

Tool versions used: LinkML 1.12.1, pySHACL 0.40.2, ROBOT 1.9.8, ontouml-js 0.5.0, Alloy 6.2.0, TLA+ tools 1.8.0, XState 5.33.4, CUE 0.14.2, KCL 0.11.2, Pkl 0.29.1, Nickel 1.13.0, Dhall 1.42.2, TypeSpec 1.18.0, ZenStack 3.10.3.
