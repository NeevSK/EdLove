# Tools for harvesting an ontology, and their viewers

Research done 2026-11-27. "Not found" means the official pages checked did not show it.

## Extraction and alignment

| Tool | What it does | Latest | Fit for us |
| --- | --- | --- | --- |
| NVIDIA **txt2kg** (DGX Spark playbooks) | Prose (md, txt, csv) to subject-predicate-object triples via a local LLM, stored in ArangoDB or Neo4j, shown in a web UI. This is the closest NVIDIA product; no NVIDIA "auto ontology" tool for schemas or code was found | playbook, no release listed | Poor. Needs an NVIDIA GPU box, reads no zmodel, SQL, Mermaid or LikeC4, outputs a graph, not LinkML |
| LinkML **Schema Automator** | Imports SQL databases, JSON Schema/OpenAPI, OWL, RDFS, SHACL, XSD, TSV into LinkML | 0.5.7, 2026-08-27, BSD-3 | Good for SQL only. Our schema lives in zmodel, and `supabase/migrations` has 5 files, so this is a second opinion, not the main source |
| **OntoGPT / SPIRES** | Extracts instances from text into an existing LinkML schema with an LLM (works with local Ollama) | 1.2.0, 2026-09-09, BSD-3 | Secondary. Could fill a schema from the docs; does not build the schema |
| **AutoSchemaKG** (HKUST) | Text to triples, then induces a type schema | MIT, no release | Weak. Built for web-scale prose |
| **LLMs4OL** | A research benchmark for LLM ontology learning | n/a | None, ideas only |
| **OAK `lexmatch`** (INCAtools oaklib) | Lexical matching between two ontologies, writes SSSOM mappings | 0.7.4, 2026-08-03, Apache-2.0 | Optional. Cheap fuzzy "same thing, different name" pairs after `gen-owl` |
| **SSSOM** | A table format for mappings between terms | spec | The right format to record alignment decisions later |
| LogMap, AgreementMakerLight | OWL matchers (Java) | not checked | Overkill for ~120 classes, loses enums and lifecycles |

No tool flags "different state or capacity lists for the same thing". That needs our own diff,
which is `reconcile.py`.

What we do instead, in `ontology/harvest/`:

1. `harvest_code.py` parses zmodel, SQL, TypeScript lists and Mermaid ER deterministically.
2. Small Haiku agents read the design docs and record only explicit claims, with file, line
   and a verbatim quote (`INSTRUCTIONS.md`).
3. `reconcile.py` aligns names through `concepts.yaml` and writes `out/conflicts.md`.

## Viewers and dashboards of the pinned tools

| Tool | Own viewer | What it shows |
| --- | --- | --- |
| LinkML | `gen-doc` (static docs site), `gen-erdiagram` (Mermaid ER), `gen-plantuml` | Classes, slots, enums, ER diagram. No live dashboard |
| CUE | Playground at cuelang.org/play; VS Code extension | Evaluates CUE in the browser |
| Alloy 6 | Analyzer visualizer (desktop) | Instances and counterexamples as graph, table, tree; step-by-step traces for temporal models |
| TLA+ | Toolbox (desktop IDE), VS Code extension | TLC runs and error traces state by state, with changed variables marked |
| TypeSpec | Playground at typespec.io/playground; VS Code extension | Compiles a spec and shows the emitted OpenAPI |
| ZenStack 3 | ZenStack Studio (`zen studio` or studio.zenstack.dev) | Table and query editor over live data. No ERD or schema preview found |
| Cedar | VS Code extension | Validation, formatting, tests. No playground found on the pages checked |
| XState | Stately Inspector, Stately Studio | Live machine and sequence diagrams; visual editor |
| ontouml-js | None | A library. The OntoUML editors are a Visual Paradigm plugin and Menthor |

None of them is a dashboard over the whole chain. Recommendation: no combined dashboard yet.
Publish one static page generated from the chain (LinkML `gen-doc`, the Mermaid lifecycles,
`conflicts.md` and the check results). Build a real dashboard only if the conflict list stays
large enough that people need to triage it.
