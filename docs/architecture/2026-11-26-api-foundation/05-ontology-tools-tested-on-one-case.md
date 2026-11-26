---
title: "Ontology and specification tools, tested on one case"
status: "active"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology]
source: "https://claude.ai/artifact/QeHhuztdTk48mdWrcjgUgh"
---

> Markdown export of the Claude Doc at https://claude.ai/artifact/QeHhuztdTk48mdWrcjgUgh (exported 2026-11-26 21:00 Colombo). The live doc may have newer edits; diagrams appear as their text only.

# Ontology and specification tools, tested on one case

Nov 26, 2026 · @Neev

## Verdict

No single tool covers everything. Each tool answers one question well, and the chain only stays deterministic if exactly **one file is the source** and everything else is generated from it. The runs today point to this split:

|Question|Owner|Why it earned the job today|
|---|---|---|
|What exists (meaning)|**LinkML**, with UFO kinds as annotations|Plain YAML that cheap agents can write. It generated OWL, SHACL, JSON Schema, Pydantic and ER diagrams from one 73- line file|
|Is the meaning sound|**OntoUML check**(ontouml-js), run on a model generated from LinkML|Caught a kind placed under a role and a relator subtype typed wrong. These are mistakes no schema tool sees|
|How things come to be (ontogeny)|**Lifecycles in LinkML**, turned into**XState**machines|Each lifecycle became a machine plus 4 generated path tests with no hand work|
|Can the rules ever break over time|**Alloy 6**, for design checks|Found the orphan-authority bug in a 3-step trace. With the fix, no counterexample up to 10 steps|
|Is the offline protocol safe|**TLA+**, for a few hand-written specs|Showed which server rule for offline marks is right (more on this below)|
|What a capability must satisfy|**CUE**|Only CUE and Nickel refused conflicting obligations in any file order. KCL and Pkl let the last file win|
|Who may do it|**Cedar**(already in the Level 0 prototype)|Unchanged|
|How clients call it|**TypeSpec**(already in the top- down doc)|Unchanged|
|Is this data valid|Generated**Zod**in the app, plus **SHACL**or**CUE**at the edges|Both caught 7 of 7 planted defects|

OWL with ROBOT is useful for publishing and diffing the meaning, but it should not guard data. It reasoned well, yet it passed data with 7 known defects, because OWL assumes missing facts may exist elsewhere. OPM and iStar are good for workshops, not for the pipeline.

The biggest finding is not a tool. It is a design rule that TLA+ proved: **the server must check a teacher's authority against the time the action happened, not the time it synced.** That needs valid time on every bond, so bitemporal fields belong in the ontology from day one.

## The shared case

Every tool modelled the same five things, in your words:

- **Person** : one human, one account for life.

- **Institution** : a school, tuition institute or other organisation.

- **Bond** : how a person joins an institution in one capacity (student, teacher, principal, guardian, founder). States: invited, active, suspended, ended. It carries valid time (when it was true in the world) and recorded time (when Gurudevi learned it).

- **Enrollment** : a bond in the student capacity, with grade 1 to 13 and an academic year.

- **Authority** : a power a bond grants (mark, enrol, invite, view reports). A teacher bond grants mark; a principal bond grants enrol, invite and view reports.

The central question for every tool: _can an authority survive after the bond that granted it has ended?_

The same seven defects were planted in the sample data:

1. An authority still open after its bond ended.

2. A teacher bond granting enrol.

3. An enrollment in the teacher capacity.

4. A grade of 14.

5. An ended enrollment with no end date.

6. A bond state that does not exist (archived).

7. A bond with no person (or an unknown person).

Defects 1, 2 and 5 cross objects or time. That is where most tools need help.

## Results

Every row was run here today, except OPM and iStar. Lines count non-blank, noncomment lines; tokens are characters divided by 4.

|Tool (version)|Expresses|Infers|Validates (7 planted defects)|Transforms / generates|Size of the case|
|---|---|---|---|---|---|
|LinkML 1.12.1|Classes, enums, ranges, mappings, our lifecycle annotations|Nothing itself|3 of 7 via generated SHACL (enum, required, range)|OWL, SHACL, JSON Schema, Pydantic, ER diagram; our generator adds zmodel, TypeSpec, Cedar, XState|73 lines, ~810 tokens|
|SHACL (pySHACL 0.40.2)|Shapes plus SPARQL rules|No|7 of 7 (3 generated + 4 hand rules, 27 lines)|No|~465 tokens of rules|
|OWL + ROBOT 1.9.8 (HermiT)|Classes, disjointness, gUFO alignment|Yes: an Enrollment is a Bond; Bond and Person together is inconsistent|0 of 7: open world passes them all|`robot diff`, `robot report`|generated|
|OntoUML (ontouml-js 0.5.0)|Kinds, roles, relators, phases, modes|Rule checks|Model checks, not data: caught 2 of 2 planted modelling errors, missed an unmediated role|gUFO OWL (159 lines)|31 lines of JS|
|Alloy 6.2.0|Relations plus time (var sigs)|Finds counterexamples|Buggy bond end: counterexample in 4 states. Fixed: 3 assertions hold up to 10 steps|No|44 lines, ~680 tokens|
|TLA+ (TLC 1.8.0)|State machines, concurrency, offline order|Explores every state|3 sync rules: 2 broken, 1 safe (1,252 states)|No|32 lines, ~475 tokens|
|XState 5.33.4 + @xstate/graph 3.0.4|Statecharts|Reachable paths|Runtime guards|Machine JSON + 4 shortest- path tests per lifecycle|generated|
|CUE 0.14.2|Types, values and constraints as one thing|Unification|7 of 7|JSON/YAML export; imports LinkML JSON Schema; OpenAPI export failed on enums|47 lines, ~375 tokens|
|KCL 0.11.2|Schemas, inheritance, check blocks|No|7 of 7, after a date- comparison helper|YAML/JSON|45 lines, ~400 tokens|
|Pkl 0.29.1|Classes, typed constraints, amends|No|Composition test only|JSON, YAML; codegen for Java, Kotlin, Swift, Go|~73 tokens (capability test)|
|Nickel 1.13.0|Records, contracts, merge priorities|No|Composition test only|JSON, YAML, TOML|~167 tokens (capability test)|
|Dhall 1.42.2|Total functional records, type- level asserts|No|Composition test only|JSON, YAML|~134 tokens (capability test)|
|OPM, iStar|Process-object and goal models|No|Not run; their tools (OPCloud, piStar) are web apps|No|on paper|

## What each tool showed

**LinkML.** It is the easiest root to write and it generates the most. Three limits showed up. It cannot express rules across objects or across time, so 4 of 7 defects needed hand-written SHACL. `gen-owl` silently dropped `disjoint_with` . And two generators disagreed on the same file: `gen-owl` accepted a fixed capacity on Enrollment, while `gen-shacl` refused it. So we keep LinkML as the source but write our own generators for anything that matters, as the Level 0 prototype already does.

**SHACL.** It caught all 7 defects with readable messages, such as "Authority outlives the bond that grants it". But it needs data as RDF, and Gurudevi's data lives in Postgres. It is best as a test harness for the rules, not a runtime guard.

**OWL and ROBOT.** HermiT inferred that every Enrollment is a Bond. With a gUFO alignment it flagged a thing typed both Bond and Person as inconsistent. It passed the data with 7 defects, which is correct OWL behaviour: a missing person is "not known yet", not "wrong". `robot diff` gave a clear axiom-level change list between two versions, which is useful in pull requests.

**OntoUML.** ontouml-js 1.0.0 has lost the checks, so version 0.5.0 was used. The good model passed once Enrollment and the bond phases were marked as relator types. It caught a Classroom kind placed under the Teacher role (two rules broken). It did not catch the Guardian role with no bond mediating it. The gUFO export typed Authority as a kind rather than a mode. The checker is useful, but it is a small, ageing library.

**Alloy 6.** The model asked whether authority can survive the end of its bond. With an "end" that forgets authorities, Alloy produced the trace: accept a principal bond, grant enrol, end the bond, and the authority is still held. With the cascade fix, three assertions held up to 4 atoms and 10 steps (no orphan authority, only allowed powers, students never mark). A run also confirmed a teacher can actually reach marking.

**TLA+.** A teacher marks offline; a principal ends the bond on the server; marks sync later. Three server rules were checked:

- _Trust the device_ : an authority outlives its bond (a mark made after the end is accepted).

- _Check the bond as it is now_ : honest work is lost (a mark made before the end is rejected).

- _Check the bond at the mark's own time_ : both properties hold across all 1,252 states.

**XState.** Our generator read the Bond lifecycle from LinkML and produced a machine with 4 states and 6 transitions, plus 4 shortest-path tests (invited, active, ended, suspended) and 6 simple paths, without hand work.

**OPM and iStar.** In OPM's sentence form: _Principal handles Approving. Approving changes Enrollment from invited to active. Approving requires Authority._ In iStar: the goal _Student is learning at Institution_ depends on the principal's task _approve enrollment_ . Both help a workshop. Neither feeds code, so neither enters the pipeline.

## CUE against KCL, Pkl, Nickel and Dhall

CUE is the right choice for capability obligations. It is the only one of the five that both refused every conflict in any file order and validated the full case. The test was the one from your message. A security file says every capability is authenticated, has a timeout of at most 5000 ms, and every command needs a transaction and audit. A domain file declares `enrollment.approve` as a command. A deploy file sets the timeout to 3000. Then three intrusions were tried.

|Intrusion|CUE|Nickel|Dhall ( `/\`)|Pkl ( `amends`)|KCL ( `:`merge)|
|---|---|---|---|---|---|
|Agent sets `transaction:`|Refused|Refused|Refused (collision)|Refused (constraint)|Refused (check)|
|`false`||||||
|Deploy sets timeout 8000|Refused|Refused|Refused (collision)|Refused (constraint)|Refused (check)|
|Two deploy files say|**Refused**|**Refused**|**Refused**|Last file wins|**Last file wins; swap**|
|3000 and 4000||||(4000)|**the order and you** **get 3000**|
|Same output in any|Yes (same|Yes|Yes|Order is fixed by|No|
|file order|SHA-256)|||the amends chain||

What each costs:

- **CUE** validated all 7 data defects in 47 lines. Weak spots: the orphan rule needed a workaround, a single bad bond produced noisy cascading errors, and there is no TypeScript generator. It imported LinkML's JSON Schema cleanly, so LinkML can stay the source.

- **Nickel** behaves like CUE on conflicts, with explicit `default` and `force` priorities. It is the closest alternative, with a smaller community.

- **Dhall** is safe and always terminates, but rules can only be type-level asserts, and `Kind` is a reserved word. It is hard for cheap agents.

- **Pkl** reads well and has good constraints, but `amends` is override by design.

- **KCL** reads like Python and caught all 7 defects. But it cannot compare strings, so dates needed a helper. Its silent, order-dependent merge rules it out for obligations agents add to.

None of them can check that the TypeScript actually opens a transaction. That still needs code checks and tests, as your message says.

## Recommended toolchain

One LinkML file stays the only place where meaning and lifecycles are written. Everything else is generated from it, except two small hand-written sets.

recommended chain · 1 source, 3 kinds of output

What we build ourselves, all inside the one generator:

1. The emitters that matter: zmodel, TypeSpec, Cedar, XState, CUE definitions, Alloy skeletons, OntoUML JSON. The stock LinkML generators are too generic and, as shown above, sometimes disagree.

2. A **rules section** in LinkML for cross-object and time rules, such as "an authority never outlives its bond" and "capacity decides the powers". Today those rules were typed four times (SHACL, CUE, KCL, Alloy). Written once and emitted to each, they cannot

drift.

3. **Valid time and recorded time** on bonds, enrollments and authorities, because the offline rule depends on them.

What we do not adopt: KCL, Pkl and Dhall (beaten by CUE on composition), OWL as a data guard, and OPM or iStar tooling.

## Open risks and next tests

- **Cost for cheap agents is not measured yet.** The chain adds three languages (LinkML, CUE, Alloy). The next test is a bake-off: a Flash-class agent adds one new capability through the chain, against plain TypeScript, scored on tokens, repairs and correctness.

- **One rules section, emitted four ways, is still unbuilt.** It is the piece that prevents drift between SHACL, CUE and Alloy. The next step is to prove it on the two rules above.

- **The OntoUML checker is old.** ontouml-js 1.0.0 dropped the checks; 0.5.0 works but missed an unmediated role. We may need a few UFO rules of our own in the generator. **Words.** Bond, capacity, Authority and Enrollment are used as in this case. Tell me if any should change before they spread into generated code.

All files (LinkML case, SHACL rules, CUE, KCL, Pkl, Nickel, Dhall, Alloy, TLA+, OntoUML and XState scripts, outputs) are in `gurudevi-api/ontolab-2026-11-26/ontolab.tgz` in the project files.
