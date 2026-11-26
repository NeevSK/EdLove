---
title: "Cold start notes: ontology build step 1"
status: "active"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology, process]
---

# Cold start notes: ontology build step 1

Build step 1 of the [tool selection decision](../../decisions/2026-11-26-gurudevi-tool-selection.md)
was done by an agent that started fresh, with only the repository's docs. Neev asked for this
to see how a cold start compares with an agent that carries the research context. These are
the places where the docs were enough, and where they were not. The result is in
[`ontology/`](../../../ontology/README.md).

## What was enough

- The decision's layer table and "What gets built, in order" made the scope of step 1 clear.
- The shared case and its seven planted defects (doc 05) were a ready-made test set. They
  became `ontology/examples/`.
- The evidence folder is runnable. The Level 0 generator, the CUE grants table, the SHACL
  rules and the Alloy model answered most "what did they mean" questions.

## Where the docs were unclear or missing

1. **Two different slices, no winner named.** Step 1 says "the shared case", but the Level 0
   prototype (doc 04) and the shared case (doc 05) differ: School/Classroom/Family/Assignment
   against Institution/Enrollment/Authority; bond states with `kept` against states with
   `suspended`; ten capacities against five. The shared case was used, and the differences
   are listed as open questions in `ontology/README.md`.
2. **No format for the rules section or the time mixin.** The decision says what they are for,
   not how they are written. The format in `gurudevi.yaml` (rule kinds, `Bitemporal` mixin)
   was designed in this step.
3. **The lifecycle format is older than the decision.** The prototype's lifecycle has no
   creation act, no link to powers, no cascade and no `why` line, though the decision relies
   on all four. It is also a YAML string; LinkML 1.12.1 accepts structured annotations only
   under `value:`.
4. **The example capability id has no lifecycle.** `enrollment.approve` is the decision's
   example of the join key, but no document defines who approves an enrollment or from which
   state.
5. **"Add the pinned tools to CI" had no how.** Nothing said where pins live (mise, pnpm, a
   script), whether Python needs a lock, or that ZenStack and Cedar are already pinned in the
   workspace (Cedar "as already pinned" meant finding `@cedar-policy/cedar-wasm` 4.15.0 in
   `packages/policies`).
6. **XState version mismatch.** The evidence used XState 5.33.4; the repository uses
   `6.0.0-beta.5`. The step 4 emitter must target 6, and no doc says so.
7. **Evidence paths in doc 05 point to project files** (`gurudevi-api/ontolab-2026-11-26/ontolab.tgz`),
   which a repo-only agent cannot open. The same files are in `evidence/ontolab/`; only the
   README index says so.
8. **The Markdown export of the decision has broken tables.** In "Left out, and why", rows
   are merged and words are cut ("ayers that were he research lists had Missing layer"). The
   "Layers that were missing" section says seven gaps and lists five.
9. **AGENTS.md does not mention the API foundation.** An agent starting from AGENTS.md would
   not find the decision. A pointer was added in this step.
10. **No base branch named for build work.** The coordinator's note named it; the docs do not.

## Suggestions for the next steps

- Fix items 1, 4 and 8 in the decision itself, since every later step reads it.
- Keep `ontology/README.md` as the format reference; the generator (step 2) should refuse
  anything it does not describe.
