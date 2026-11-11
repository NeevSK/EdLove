---
title: "Learning · Teaching relations"
status: draft
owner: Naveen
created: 2026-11-11
scribe: "Claude"
tags: [architecture, domains, learning, relations, card]
---

# Learning · Teaching relations

`learning.relations` records that two people meet through something they work on together: a
teacher and a learner through a subject, or a class teacher and a learner through care
of the class. It also records the thread of what passes between them. The rest of the
system has no other place where person-to-person relations exist. Today they are only
inferred from containers (classrooms and grade classes), so the container becomes the
source of truth about people.

The upstream this card inherits is in the Gurudevi project's start-here doc and the
[vision map](https://claude.ai/artifact/8hgoWUNeaLznxvUpPXxpSF):

1. The individual exists first.
2. A relation exists only between individuals and through its content.
3. Learning and teaching happen in relations.
4. Containers are relations that last.
5. Everything exists in a time and a place.

The features that read from it are _Shared to a relation_, _My learners_, _Moment
capture_, _Quiz as perturbation_ and _The day as periods_ in the
[feature cards](https://claude.ai/artifact/7Cs6uq8houty5o3eRsa7SW).

## Is this a new subdomain?

| Question                     | Answer                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Owns facts no one else owns? | Yes. Membership in a class is person-to-container. This is person-to-person, with content.                          |
| Its own lifecycle?           | Yes. A relation can outlive a class change, and can begin outside any class (a mentor, a club).                     |
| Its own invariants?          | Yes. Two distinct people, at least one content binding, a time interval, and items visible only to the two of them. |
| A different authority?       | Yes. The two parties decide what passes between them. No institutional capacity reads the thread.                   |
| A different privacy class?   | Yes. Thread items are private to the relation, which is stricter than class records.                                |

## Facts it owns

- **Relation.** Two persons, each with their side (teaches, learns). One or more
  content bindings: a subject in an academic cycle, or an activity (`homeroom`, a club).
  It also holds the place (institution, optional), `valid_from`, `valid_to`, and its
  origin (a teaching assignment and an enrolment, or opened directly).
- **Thread item.** It belongs to a relation and has an author (one of the two
  parties). Its kind is `share`, `moment`, `question` or `answer`. It holds a body, or a
  reference to content owned elsewhere: a note, a library resource, a quiz attempt or a
  shared reflection. It also has `occurred_at`, an optional timetable period, a
  visibility (`author` or `both`) and an optional `withdrawn_at`.

It owns no content itself. A shared note stays in `learning.notes` or `library`, and a
quiz
attempt stays in `learning.assessments`. The thread holds references and a per-relation
access grant.

## Invariants

1. Both parties are real persons. No relation points at a name without a person. A learner
   without an account is an unclaimed person in identity, which they claim later. That
   person is never a `full_name` field on a class row.
2. The two parties are distinct, and a relation has at least one content binding.
3. `valid_from` is required, and `valid_to` is null or not earlier than it. Every item's
   `occurred_at` falls inside the relation's interval.
4. Only the two parties can read thread items. Holding a capacity on the institution
   grants nothing: not admin, not principal, not platform staff. Guardians see what a
   party sends them, through Family.
5. Items are never edited in place. An author corrects an item by adding a version,
   withdraws it by setting `withdrawn_at`, and history stays.
6. Ending a relation sets `valid_to`. Nothing is deleted, and each party keeps their
   side of the thread.
7. No score, flag, prediction or category is stored on a relation or an item. Anything
   like "not heard from since" is computed at read time from dates and shown only to
   the party asking.

## Lifecycle

| Fact                     | States                                     | Who moves it                                                                                                                                              |
| ------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relation from a school   | `active` → `ended`                         | Opened when a teaching assignment and an enrolment overlap in the same grade class and subject. Ended when either one ends. The teacher may end it early. |
| Relation opened directly | `offered` → `active` → `ended`             | Either party offers. For a minor, the guardian accepts. Either party ends it.                                                                             |
| Thread item              | `written` → (`corrected`)* → (`withdrawn`) | The author only.                                                                                                                                          |

## Authority

- The principal of every check is a person, never a capacity. Cedar permits an action
  when the principal is one of `resource.relation.parties`.
- Opening a relation from a school needs the teacher's active teacher bond with that
  school, plus the enrolment and teaching assignment facts from `ops`.
- The existence of a school relation is an institutional fact, so its metadata is
  visible to the school: who teaches whom, which subject and when. The content of the
  thread is not.
- Agents act only through a party's delegation, and never write into a thread unless
  that party sends the draft.

## Privacy and visibility class

- **Relation metadata:** institution-visible.
- **Thread items:** relation-private, the strictest class after person-private
  wellbeing data.
- **Minors:** guardians get only what a party sends through Family.

## Mutation kind per fact

- **Relation:** versioned, so dates and bindings are corrected with history.
- **Thread item:** append-only, with corrections and withdrawals as new versions.

## Retention class and horizon

Items are kept while either party keeps their record. Deleting an account withdraws the
items that person authored from the other party's view. The other party keeps their own
items. The horizon for minors' data is set with the data-protection review in Gate 7 of
[the road to v1](../../road-to-v1.md).

## Commands

| Command                          | What it does                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `learning.relations.open`        | Opens a relation from assignment and enrolment events, or offers one directly.     |
| `learning.relations.accept`      | Accepts a directly offered relation (the learner, or the guardian for a minor).    |
| `learning.relations.end`         | Sets `valid_to`.                                                                   |
| `learning.relations.correct`     | Corrects dates or bindings, keeping history.                                       |
| `learning.relations.share`       | Adds a `share` item referencing authored content, with access for the other party. |
| `learning.relations.noteMoment`  | Adds a `moment`, private to the author by default.                                 |
| `learning.relations.ask`         | Adds a `question` or an `answer`.                                                  |
| `learning.relations.reveal`      | Changes an item's visibility from `author` to `both`.                              |
| `learning.relations.withdraw`    | Withdraws an item.                                                                 |
| `learning.relations.correctItem` | Adds a corrected version of an item.                                               |

## Queries

| Query                          | What it returns                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `learning.relations.listMine`  | My relations, filtered by subject, cycle or active state, with the date of the last item from each side. |
| `learning.relations.thread`    | One relation's items visible to me, newest first.                                                        |
| `learning.relations.forPeriod` | The relations in one timetable period. It backs _The day as periods_ and roll call.                      |

## Events it publishes

`learning.relation.opened`, `learning.relation.ended`, `learning.relation.itemAdded` and
`learning.relation.itemWithdrawn`. Events carry identifiers, never item bodies.

## What it reads from other subdomains

| Subdomain                             | What it reads                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ops.enrolment`                       | Enrolment events (a learner in a grade class, with effective dates).                       |
| `ops.institutions`                    | Teaching assignments (a teacher, a grade class, a subject or `homeroom`, effective dates). |
| `ops.timetables`                      | Periods, for `forPeriod`.                                                                  |
| `learning.assessments`                | Quiz attempts, by reference.                                                               |
| `learning.notes`                      | Notes, by reference.                                                                       |
| `library.resources`                   | Resources, by reference.                                                                   |
| `wellbeing.reflection`                | Reflections a learner chooses to share, by reference.                                      |
| Identity and consent platform modules | Persons, including unclaimed persons, and consent.                                         |

## Standards it maps to

- **OneRoster.** Relations project to enrolments for export. OneRoster has classes and
  enrolments, not person-to-person relations, so the projection is lossy by design.
- **xAPI.** Thread events can be expressed as xAPI statements. This is optional, for
  exchange only.

## Admission questions

From the
[API domain and channel model](../../../../apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md#ownership-discovery-and-admission):

1. **Owner of the fact.** This subdomain, for relations and items. Content stays with
   its own owners.
2. **What authorizes an action.** Being a party to the relation. For school relations,
   also the teacher bond and the `ops` facts. Consent covers shares that a minor's
   guardian has restricted.
3. **What commits together.** A relation and its first binding. An item and its access
   grant. Corrections are made by the author for items, and by the teacher or school for
   relation dates.
4. **Schemas and enforcement.** These are to be written in `@repo/core/api/v1` on
   admission, with Cedar policies in `packages/policies/src/modules/learning.cedarschema`.
5. **Channels.** The app first. SMS and messaging carry only items a party sends, after
   Gate 4.
6. **Receipts, retries and audit.** Every command is idempotent by key and audited.
   Reading items is a sensitive read and is audited too (Gate 3).
7. **Scenario evidence.** Each of these needs a scenario:
   - a principal is denied reading a thread;
   - a class change keeps the relation;
   - a withdrawn item disappears for the other party;
   - an unclaimed learner claims their account and keeps their relations;
   - an offline moment syncs into the right relation.

## What this means for the current schema

Checked against `packages/schema/schema.zmodel` on 2026-11-11:

| Finding                                                                                                                                | Breaks             | Change on admission                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `ClassroomStudent.student_id` is optional, with `full_name`                                                                            | Invariant 1        | Unclaimed persons in identity. Retire `full_name`.                                                 |
| No person-to-person relation table exists                                                                                              | Axiom 2            | Add `TeachingRelation`, `RelationBinding` and `RelationItem` (with versions).                      |
| `GradeClassTeacherAssignment.subject_id` is optional                                                                                   | Invariant 2        | Require it unless `role` is `homeroom`.                                                            |
| `ClassroomNote` is readable by the whole school when its visibility isn't `private`, and the default is `teacher`                      | Invariant 4        | Observations about a learner become moments on the relation. Class notes keep author-only reading. |
| Two generations hold the same facts (`Classroom`, `ClassroomStudent`, `AttendanceRecord`, `Grade`, and the October `GradeClass` layer) | One owner per fact | Relations read only from the October layer. Retire the old layer as its callers move.              |
| `StudentGuardianRelationship` has no validity period                                                                                   | Axiom 5            | Family's card, not this one. Noted here because guardians receive what relations send.             |

## Open questions

- **Peer relations.** Can two learners have a relation? The shape allows it, and the
  authority and moderation rules for minors would come from Community.
  _Default:_ not in the first slice.
- **One relation or several.** Does a teacher who teaches a learner two subjects have
  one relation with two bindings, or two relations? _Default:_ one relation, two
  bindings, because it is the same two people meeting.
- **Unclaimed persons.** Do they need their own card in identity? _Default:_ yes, before
  this card is admitted.
