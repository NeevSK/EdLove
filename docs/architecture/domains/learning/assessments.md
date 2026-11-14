---
title: "Learning · Assessments and practice"
status: draft
owner: Naveen
created: 2026-11-13
scribe: "Claude"
tags: [architecture, domains, learning, assessments, card]
---

# Learning · Assessments and practice

`learning.assessments` records a person's attempts at something they can try and get
feedback on: a form-builder quiz, an H5P activity, or a set of questions imported from
QTI. It also records each step inside an attempt, including **what help the person had at
that step**. That last fact is the reason this card exists. Without it, an attempt only
shows what the person could do, and never what they could do with help, which is the
distance Vygotsky called the zone of proximal development.

It inherits the upstream in the Gurudevi project's start-here doc, and sits under
[teaching relations](relations.md). The integrate-or-build map that led here is the
project doc `claude/lms-integrate-vs-build.md`.

**Who encodes it.** L0 (the `schema.zmodel` models, the generated Zod and the API contract)
is Neev's, per the [client runtime plan](../../2026-11-12-client-runtime-foundation-plan.md).
This card proposes the facts. The tools that produce attempts (`@repo/form-builder`'s quiz
runner and `@repo/library/h5p`) keep their own output shapes, which aren't stored, and a
thin adapter maps them onto these facts once they exist.

## Is this a new subdomain?

It is already in the [domain index](../README.md) as a skeleton. These answers confirm it:

| Question                     | Answer                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Owns facts no one else owns? | Yes. Attempts and their steps. Grades (`learning.grading`) are made from attempts, and are not the attempts.   |
| Its own lifecycle?           | Yes. An attempt starts, may be resumed offline over days, is submitted, marked, and may be re-marked.         |
| Its own invariants?          | Yes. One real person per attempt, append-only steps, and every step's time and assistance.                     |
| A different authority?       | Yes. Self-practice is the person's own. Only attempts made inside a relation are visible to the other party.   |
| A different privacy class?   | Yes. Practice is person-private, unlike classroom records.                                                     |

## Facts it owns

- **Attempt.** It holds:
  - one person (the learner);
  - an activity reference: its kind (`form`, `h5p` or `qti`), its id and the exact version
    tried. The activity itself stays with its owner: form definitions with the form builder,
    packages in `library.resources`;
  - an optional relation (a `learning.relations` id, when the activity was set or shared
    inside one);
  - a mode (`practice`, `check` or `exam`);
  - the device-made `attempt_id` (so resending is safe), `started_at`, `submitted_at`;
  - the place (the institution, when there is one, and the device);
  - the answers as marked (kept for re-marking), and the markings: score, maximum and the
    scale used.
- **Step.** It belongs to an attempt. It holds:
  - the part (a form field, or an H5P `subContentId`);
  - what happened: `answered`, `retried`, `hint_opened`, `example_viewed`, `help_asked` or
    `help_given`;
  - the response, and whether it was right when the part can be marked;
  - **assistance**: `none`, `hint` (with its level on the ladder), `worked_example`, `peer`,
    `teacher`, `guardian` or `ai`, plus the helping person when the help came from one;
  - `occurred_at` from the device and `received_at` from the server.
- **Review state** (optional, see open questions). For spaced practice (FSRS through
  `ts-fsrs`): one row per person and item, holding when it is next due and the scheduler's
  state.

## Invariants

1. An attempt belongs to exactly one real person. There are no class attempts; class and
   school views are read-time aggregates.
2. Attempts and steps are append-only. Re-marking adds a marking version. A withdrawn
   attempt is marked withdrawn and kept.
3. Every step falls inside its attempt's interval and carries its device time. The server
   time is a separate fact and never overwrites it.
4. Assistance is recorded as a fact, never as a penalty. Whether help changes marks is a
   policy, with the default that it doesn't.
5. Nothing stores a ranking, a prediction, an ability estimate or a label about the person.
   Scores are facts about one attempt, not about the person.
6. In `exam` mode, answers are sealed until submission, and the device-leaving count is
   shown, never penalised (this is already how the quiz runner behaves).

## Lifecycle

| Fact     | States                                                            | Who moves it                                                                            |
| -------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Attempt  | `in_progress` → `submitted` → `marked` → (`remarked`)* · `withdrawn` | The learner starts and submits. Marking is automatic or by the teacher in the relation. |
| Step     | `recorded`                                                        | The device, as the learner works.                                                       |
| Marking  | versions                                                          | The automatic marker, then the teacher.                                                 |

## Authority

- The principal is a person. The learner owns their attempts.
- A teacher reads an attempt only when it was made inside a relation they are party to.
  Holding a capacity in the school grants nothing over practice attempts.
- Exam results feed `learning.grading`, which carries its own institutional authority. The
  steps and assistance under an exam are not passed on unless a policy says so.
- Guardians see what Family carries for them.
- Agents (an AI tutor) record `help_given` steps only through the learner's delegation, and
  only after `safeguard-core` exists (see the gap map in the project).

## Privacy and visibility class

- **Practice attempts:** person-private.
- **Attempts in a relation:** visible to both parties.
- **Exam attempts:** results are visible to the institution through grading; the steps
  stay relation-private.
- **Minors:** as the consent module decides (Gate 7 of the road to v1).

## Mutation kind and sync

- Append-only, keyed by ids made on the device, so an attempt that is resent, or that
  arrives twice from two devices, is the same attempt.
- It is local-first. Whether attempts travel as PowerSync row uploads or as outbox
  commands follows the [data stack mental model](../../2026-11-13-data-stack-mental-model.md),
  which reserves the outbox for commands that are not row writes. Neev decides when
  attempts are added to the sync rules.

## Commands

| Command                              | What it does                                                 |
| ------------------------------------ | ------------------------------------------------------------ |
| `learning.assessments.start`         | Starts an attempt with a device-made id.                      |
| `learning.assessments.recordSteps`   | Appends a batch of steps (idempotent by step id).             |
| `learning.assessments.submit`        | Submits, with the answers and the automatic marking.          |
| `learning.assessments.remark`        | Adds a marking version (a teacher in the relation).           |
| `learning.assessments.withdraw`      | The learner withdraws an attempt.                             |

## Queries

| Query                                | What it returns                                                      |
| ------------------------------------ | -------------------------------------------------------------------- |
| `learning.assessments.mine`          | My attempts, by activity, mode or relation.                          |
| `learning.assessments.attempt`       | One attempt with its steps, for a party who may read it.             |
| `learning.assessments.forRelation`   | Attempts made inside one relation, for either party.                 |

## Where the tools' output goes

| Tool output                                          | Becomes                                                      | Gap today                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `QuizAttempt` (`packages/form-builder/src/quiz/grade.ts`) | An attempt with `kind: form`, its answers and marking         | `GradeQuizInput.hintsUsed` and `attemptsByField` go in, but the attempt drops them, so assistance is lost. The engine work adds steps to the output. |
| `H5PEvent` (`packages/library/src/h5p/h5pEvents.ts`) | A step (`answered` with a `subContentId`), and the attempt submitted on the top-level `completed` | The host component that runs the player is not built yet.                                      |
| QTI 3 import                                         | An activity in the library, tried through the form builder   | Not built.                                                                                     |

## Standards it maps to

- **xAPI 2.0 (IEEE 9274.1.1-2023).** A step exports as a statement, with assistance as a
  context extension under a Gurudevi IRI. The export is lossless for steps and is used for
  exchange only.
- **QTI 3.0.** For importing and exporting activities, through the library, not this
  subdomain.
- **cmi5.** Not adopted unless a partner requires it.

## Scenario evidence needed on admission

- A practice attempt done offline over two days syncs as one attempt with its steps in order.
- A teacher outside the relation is denied the attempt; the teacher inside it reads it.
- An attempt resent after a timeout is stored once.
- A hint opened on question 3 appears as `hint` assistance on that step, and doesn't change
  the marks by default.
- Re-marking keeps the first marking.

## What this means for the current schema

Checked against `packages/schema/schema.zmodel` on 2026-11-13: there is no attempt or step
model. `AssignmentSubmission` and `GradeMark` exist, and `GradeMark` is per student and per
assignment, which fits as a consumer of attempts. Adding `AssessmentAttempt`,
`AssessmentStep` and `AssessmentMarking` is Neev's L0 change on admission.

## Open questions

- **Who sees assistance.** The learner, the teacher in the relation, or both? _Default:_ both
  parties, because it is relation content.
- **Assistance and marks.** Does help change marks in `check` mode? _Default:_ no.
- **Review state.** Is the spaced-practice state stored on the server, or only on the
  device? It is a computed estimate of memory, which the upstream treats with care.
  _Default:_ device only, person-private, used only to schedule the person's own review.
- **H5P attempt boundary.** Is a whole H5P package one attempt, or each top-level
  completion? _Default:_ one attempt per opening, ended by the top-level `completed`.
