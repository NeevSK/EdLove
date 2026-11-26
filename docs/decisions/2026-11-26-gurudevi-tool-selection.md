---
title: "Gurudevi tool selection"
status: "active"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology]
source: "https://claude.ai/artifact/SKDa7Q5j14BCeCwkfxFvAL"
---

> Markdown export of the Claude Doc at https://claude.ai/artifact/SKDa7Q5j14BCeCwkfxFvAL (exported 2026-11-26 21:00 Colombo). The live doc may have newer edits; diagrams appear as their text only.

# Gurudevi tool selection

Nov 26, 2026 · @Neev

## Decision

Gurudevi uses **one hand-written source** for what exists and how it changes: a **LinkML** file, which we call the ontology. A small **generator of our own** turns it into everything the code needs: the database model, the API spec, the permission schema, the lifecycle machines and the checks.

Three more languages are hand-written, each for one job:

- **CUE** for capability obligations.

- **Cedar** policies for who may act.

- **TypeSpec** for the shape of each API call.

Two verifiers guard the design: **Alloy 6** for lifecycle rules and **TLA+** for offline sync. Execution stays as already settled: TypeScript, Hono with oRPC v2, ZenStack, Postgres, Zod.

Every other tool from the research is left out or kept as a reference, for the reasons below. The evidence is in Ontology and specification tools, tested on one case.

## One tool per layer

Each layer has exactly one owner. _Written_ means a person or agent edits it. _Generated_ means nobody edits it, and CI fails if it drifts.

|#|Layer|Question it answers|Tool|Written or generated|Gurudevi use cases|
|---|---|---|---|---|---|
|1|Meaning (ontology)|What exists, and what kind of thing is it?|**LinkML**with UFO kind annotations (kind, role, relator, phase, mode)|Written: `ontology/gurudevi.yaml`|Person, Institution, Bond, Enrollment, Authority, Classroom, Assignment, Submission; mappings to OneRoster and schema.org|
|2|Meaning check|Is the model sound?|**OntoUML rules** (ontouml-js 0.5) on a model our generator emits|Generated input, CI check|Roles only through bonds; no kind under a role; relator subtypes typed right|
|3|Ontogeny (lifecycles)|How does each thing come to be and change?|**LinkML** **lifecycle** **section**, emitted as **XState** machines|Written in LinkML; machines generated|Bond invited, active, suspended, ended; Assignment draft, published, closed; one guard and one path test per transition|
|4|Time|When was it true, and when did we learn it?|**Valid time and** **recorded time** slots in LinkML, mapped to PROV-O|Written once as a mixin; columns generated|Bond and authority intervals; offline marks checked at their own time; history and audit views|
|5|Rules across things|Which combinations can never happen?|**Rules section in** **LinkML**, emitted to Alloy, CUE, Zod and SQL checks|Written once; four outputs generated|An authority never outlives its bond; capacity decides powers; an enrollment is always a student bond|
|6|Design verification|Can the rules break over time?|**Alloy 6**|Skeleton generated; a few properties written|Orphan authority; double active bonds; a student never marks|
|7|Offline protocol|Is sync safe when devices are offline?|**TLA+**(TLC)|Written, kept to a few specs|Offline marks versus ended bonds; later attendance and grade sync|
|8|Capability obligations|What must every capability of this kind satisfy?|**CUE**|Base obligations written; one entry per capability generated|Commands need a transaction, audit and an idempotency key; queries are paged; timeout at most 5000 ms. Also Placid's registry|
|9|Authority to act|Who may perform this action, here?|**Cedar**|Schema generated; policies written|Teacher marks only in own classroom; principal enrols at own school; guardian views own child|
|10|Interface|How do clients call it?|**TypeSpec**, with our emitter to oRPC + Zod and OpenAPI|Operations written; models generated from LinkML|One operation per capability id; problem errors; paging|
|11|Persistence|How is it stored?|**ZenStack** **zmodel**to Postgres migrations|Generated from LinkML; migrations generated from zmodel (your 18:01 decision)|Tables, enums, timestamptz, valid-time ranges, row policies|
|12|Execution|What actually runs?|**TypeScript**: Hono, oRPC v2, Effect inside procedures, pg/ZenStack|Written handlers only|Each capability's handler; everything around it generated|
|13|Clients|How do web and phone use it?|Generated oRPC client and Zod, plus the same XState machines|Generated|Phone and web share lifecycle guards, so a button is hidden when the transition is not allowed|
|14|Change control|What changed, and does it break anyone?|`oasdiff`for the API, our ontology diff, ZenStack migration diff, `buf breaking` only if Protobuf is used|Generated reports in each pull request|A renamed field or a removed state is flagged before merge|
|15|Views for people|Can a person see the model?|Mermaid state and ER diagrams from the generator|Generated|Docs pages; review of a lifecycle in a pull request|

## How the layers connect

The layers are joined by names, not by copies. Every lifecycle transition gets a **capability id** , such as `enrollment.approve` . The same id is used everywhere:

- the transition in LinkML;

- the CUE obligation entry;

- the Cedar action;

- the TypeSpec operation;

- the oRPC procedure;

- the handler file;

- the XState event.

The generator refuses an id that exists in one place but not another.

A change flows in one direction:

1. Edit `gurudevi.yaml` : a class, a slot, a state, a transition or a rule.

2. The generator checks the ontogeny first: unknown states, unreachable states, transitions without an actor, and capability ids without an operation. It stops on any error.

3. It writes the generated outputs: zmodel, TypeSpec models, the Cedar schema, XState machines, CUE entries, the Alloy skeleton, OntoUML JSON, Zod and SQL rule checks, and Mermaid diagrams.

4. A person or agent writes only what is left: the TypeSpec operation, the Cedar policy and the handler body.

5. CI runs the checks: OntoUML rules, `cue vet` , Alloy, TLC, `tsp compile` , `zenstack check` , Cedar validate, the path tests and the diff reports.

For one new capability, an agent touches three hand-written files and one line in the ontology. The rest comes from the generator.

## Left out, and why

|Tool|Status|Reason|
|---|---|---|
|OWL reasoning (HermiT)|Optional output, not a guard|It passed data with 7 known defects, because of the open world. We emit OWL with gUFO only if a partner needs linked data|
|ROBOT|Optional, with OWL|`robot diff`is good, but our own ontology diff covers pull requests|
|SHACL / pySHACL|Left out|It caught 7 of 7, but needs RDF data. CUE and the generated Zod and SQL checks cover the same rules on the data we actually have|
|Protégé, WebVOWL,|Left out|Viewers and stores for OWL. The|
|GraphDB||Mermaid diagrams cover viewing|
|BFO, DOLCE, GFO, SUMO|Left out|Upper ontologies for science and engineering. UFO fits social things like bonds and authority|
|OntoUML editors (Visual Paradigm plugin)|Left out|We generate the OntoUML model; nobody draws it by hand|
|KCL|Left out|Merging was silent and order- dependent (3000 or 4000, depending on file order). It also cannot compare strings|
|Pkl|Left out|`amends`overrides by design. Good language, wrong model for obligations|
|Nickel|Reserve|Behaved like CUE on conflicts. The fallback if CUE fails us|
|Dhall|Left out|Safe, but rules are type-level asserts. Too hard for cheap agents|
|Jsonnet, HCL, Nix|Left out|Configuration templating, not constraints|
|Smithy|Left out|JVM toolchain, and it wants to own the server. TypeSpec covers the interface|
|Protobuf|Only on a named trigger|Kept for a non-TypeScript client or a binary need. Not a default|
|GraphQL SDL, Thrift, WIT|Left out|No consumer needs them|
|Hey API|Left out|The oRPC v2 plugin stalled at a September `next`build. Our own TypeSpec emitter replaces it|
|Rego / OPA|Left out|Cedar already decides authority, and is analysable|
|CEL|Reserve|For small embedded expressions, if a rule ever needs to run inside a client config|

|Tool||Status|Reason|
|---|---|---|---|
|DMN / FEEL, Datalog||Left out for now|No decision tables yet. Grading rules may bring DMN back|
|OPM / OPCloud||Workshop only|Good for talking through a process. It does not feed code|
|iStar, KAOS, piStar||Workshop only|Goals are captured as one `why`line per capability instead (see below)|
|BPMN, Temporal, Petri Event Calculus|nets,|Left out|XState covers lifecycles. A long- running workflow engine is not needed yet|
|Z3, Lean||Left out|Alloy and TLA+ cover our verification at far lower cost|
|XTDB and other bitem databases|poral|Left out|Valid-time and recorded-time columns in Postgres are enough|
|Palantir Foundry||Reference only|Its object types, link types and actions map to our classes, relations and capabilities. We take the pattern, not the product|
|Schema Automator||Left out|It would import the existing schema, and the redesign starts top-down from zero|
|ayers that were he research lists had Missing layer|miss seven g Why it|ing aps. Each one now has a matters|n owner. How it is covered|
|Rules across things|Each t retype Alloy, f|ool needed the same rules d: SHACL, CUE, KCL and our times|One rules section in LinkML, emitted to every target|
|Time|TLA+ s must b time|howed offline actions e checked at their own|A valid-time and recorded-time mixin on bonds, enrollments, authorities and marks|

## Layers that were missing

### The research lists had seven gaps. Each one now has an owner.

|Missing layer|Why it matters|How it is covered|
|---|---|---|
|Purpose (intent)|Agents add capabilities without knowing which goal they serve|One `why`line per capability, written in plain words|
|Words in three languages|You supply Sinhala and Tamil words; they should live beside the English term|LinkML labels per language ( `en`, `si`, `ta`), feeding UI strings and docs. Never guessed|
|Spec versus code|CUE can say a command needs a transaction, but not prove the handler opens one|Generated conformance tests per capability, plus a code check that the handler runs inside the transaction helper. This is Placid's job|
|Changing the ontology itself|Renaming a state or splitting a class must migrate real data|Ontology diff, generated migration and a recorded decision per breaking change|
|The UI catalog|AppCatalog lists room features and could drift from capabilities|AppCatalog stays its own source for rooms and floors, but each feature names the capability ids it uses. The generator checks they exist|

## Rules that keep it deterministic

1. **One fact, one place.** A fact is written in exactly one layer. Anything else that needs it is generated, and CI fails on drift.

2. **Generated files are never edited.** They carry a header saying so, and the check regenerates them and compares.

3. **Conflicts fail; nothing silently overrides.** CUE unification refuses incompatible obligations in any file order.

4. **Same input, same output.** The generator is pure: no clock, no network, sorted output. Two runs give identical bytes.

5. **Capability ids are the join key.** An id missing from any layer is an error, not a warning.

6. **Your words only.** Terms come from you and the existing code. New terms need your yes before they enter the ontology.

7. **Pinned versions.** LinkML 1.12.1, CUE 0.14.2, Alloy 6.2.0, TLA+ tools 1.8.0, TypeSpec 1.18.0, ZenStack 3.10.3, Cedar as already pinned, and ontouml-js 0.5.0.

## What gets built, in order

Nothing here touches the running API until step 6. Each step ends in a pull request you can review.

1. **Ontology folder in the repo.** Add `ontology/gurudevi.yaml` with the shared case: Person, Institution, Bond, Enrollment, Authority, the time mixin, lifecycles and the rules section. Add the pinned tools to CI.

2. **Generator core.** Port the Level 0 prototype, add the rules section and capability-id checks, and make output byte-stable.

3. **Emitters for checks.** CUE entries, the Alloy skeleton, OntoUML JSON, then the first CI run with all checks green.

4. **Emitters for runtime.** zmodel, TypeSpec models, Cedar schema, XState machines and Zod and SQL rule checks.

5. **TLA+ offline spec** for marks and bonds in the repo, with TLC in CI.

6. **First real capability** end to end through the chain, such as `bond.accept` , built topdown per the levels in the top-down API doc.

**Still open for you:** the level 1 to 4 answers in the top-down doc, and the Sinhala and Tamil words for Bond, capacity, Authority and Enrollment.
