---
title: "Gurudevi API from zero, top down"
status: "draft"
created: 2026-11-26
updated: 2026-11-26
author: "Neev"
scribe: "Claude"
tags: [api, architecture, ontology]
source: "https://claude.ai/artifact/4Q16Wf7dUzaevQiuFG3ga5"
---

> Markdown export of the Claude Doc at https://claude.ai/artifact/4Q16Wf7dUzaevQiuFG3ga5 (exported 2026-11-26 21:00 Colombo). The live doc may have newer edits; diagrams appear as their text only.

# Gurudevi API from zero, top down

Nov 26, 2026 · @Neev

## How to read this

This builds the Gurudevi API from the top: start from people, end at code. Each level is decided before the next one starts, and each level only uses words from the level above it. Nothing here is taken as settled because it already exists in the repo. Where existing work is useful, it is named as _input to check_ , never as a given.

1. **People and purpose:** who uses Gurudevi and what they come to do.

2. **Areas:** the parts of the API, each answering to some of those purposes.

3. **Capabilities:** what each area lets a person do, who may, and what can go wrong.

4. **Rules:** what every capability follows, whatever its area.

5. **Writing it down:** one TypeSpec source, and what is generated from it.

6. **Worked example:** one area taken through all five levels.

Each level ends with the questions only you can answer. Answering them is what turns a level from draft into decided. Until a level is decided, the levels under it stay drafts.

## Level 0: the ontology, so nobody explains twice

Levels 1 and 2 are not only prose. They are written once as an **ontology** (what exists: people, bonds, capacities, entities, facts and their owners) with its **ontogeny** (how each thing comes into being and changes: a bond goes invited, active, ended, kept). The ontology is a file a machine checks, and everything else is generated from it. Explaining Gurudevi then means correcting the ontology, and every downstream piece follows.

ontology at the root · 6 generated outputs

**The tool: LinkML** (version 1.12.1), a modelling language made for exactly this: one schema, many generated artefacts. Why it, over writing the ontology in TypeSpec:

- It models what _exists_ (classes, inheritance, enums, relationships), not API operations.

- It maps each class to education standards, such as OneRoster `Class` and schema.org `School` , which your platform map asks for.

- It ships generators for TypeScript, SQL, JSON Schema, OWL, SHACL, Protobuf and diagrams, and it has a linter.

- It is plain YAML, so you and low-cost agents can edit it and the linter catches mistakes.

The cost is a Python tool in the build (development only; nothing Python ships).

**Ontogeny is written inside it.** Each class that changes over time declares its lifecycle:

- the field that holds the state;

- the entity the permissions are checked on;

- the starting state;

- each transition: from, to, by which act, and who may.

Our generator then checks the ontogeny deterministically. It refuses a transition to a state that doesn't exist, a state nothing can reach, or a lifecycle that is named but not written.

**Tried today on a first slice:** Person, School, Classroom, Family, Bond and its lifecycle, Assignment and its lifecycle, Submission. In half a second the generator produced:

- a ZenStack model, which ZenStack 3.10.3 validates;

- TypeSpec models plus one command per lifecycle transition (for example `bond_end` , for principal or founder), which compiles;

- a Cedar entity schema;

- lifecycle guards for the server and phone;

- state diagrams.

LinkML's own off-the-shelf generators were too generic. They typed capacities as plain strings and stored time without a time zone, so Gurudevi needs its own generators for storage, API and Cedar. That is the same lesson as Hey API.

Prototype files: `gurudevi-api/ontology-prototype/` in the project files.

## Level 1: people and purpose

**What Gurudevi is for** , from your platform map (input to check): a person-centred place for a whole life with learning. That covers a person's own wellbeing, their learning and work in schools and institutes, their community, the knowledge they read and make, and the record of who they became, with AI help across all of it. It is local first and mobile first, and data belongs to the person or the institution, never to the platform.

**The person is the root.** One account lasts a whole life. A person joins an entity (a school, a classroom, an institute, a family) through a **bond** , and each bond carries a **capacity** . A bond has a life: invited, active, ended and kept. The API never asks "which school does this user belong to". It asks "through which bond is this person acting right now".

**Who comes, and what they come to do.** The rooms are the tabs of the Sanctuary. The Workspace room is named after the capacity in the active bond.

|Person (capacity)|Comes mostly to|Rooms they live in|
|---|---|---|
|Anyone, for|Look after their own mood,|Self, Profile|
|themselves|journal, goals, notes; keep their own record||
|Student|Follow classes, do and hand in work, see marks and feedback, ask for help|Learning (Workspace), Community, Library|
|Teacher, tutor, marker|Run a classroom: lessons, assignments, attendance, marking, notes on students|Classroom (Workspace), Community, Library|
|Guardian|See and support their child's learning and wellbeing, as far as the child and school allow|Family (Workspace), Community|
|Principal, section and grade heads|Run the school: structure, staff, enrolment, timetables, notices, policies|School (Workspace), Community|
|Tuition institute founder|Run a commercial institute: classes, students, fees|Institute (Workspace)|
|Platform staff|Operate and support Gurudevi itself|Platform (Workspace)|
|An AI agent acting for a person|Do what that person delegated, never more|Every room, through the companion|

**What this level fixes for every level below:** every request arrives as _a person, through a bond, in a capacity, on a device, possibly through an agent_ . Every fact belongs to either _the person_ (journals, mood, personal notes) or _an institution_ (enrolment, attendance, grades, fees), and nothing belongs to the platform.

### **Questions for you (level 1):**

1. Is this list of people complete? For example, are school counsellors, alumni or examiners first-class people here, or later?

2. For each person, is "comes mostly to" right, and in your words?

3. Who owns a fact that is about a child but written by a teacher, such as a classroom note: the institution, the child, or both with different rights?

## Level 2: areas

An **area** is the owner of a set of facts. The rule that decides areas is the one from your platform map: **every fact has exactly one owner** . Rooms do not own facts. A room shows facts from several areas, which is why the API is never shaped like the tabs. A grade shows up for a student, a teacher and a guardian, but only Learning owns it.

three layers · rooms, areas, platform

Each area, in one sentence of what it owns:

|Area|Owns|Owner of the facts|
|---|---|---|
|Wellbeing|A person's mood, energy, journals, reflections, practices and goals|The person|
|Learning|Classrooms, who teaches whom, lessons, assignments and submissions, assessments, grades, classroom notes|The institution|
|Institution operations|Schools and their structure, enrolment, timetables, attendance, staff, welfare, fees, events, tuition institutes|The institution|
|Family|Guardian links, their verification, and what a guardian may see|Shared: institution verifies, family holds|
|Community|Groups, posts, conversations, official notices, moderation|Whoever wrote it, within the group's rules|
|Library|Resources, collections, authoring and review, media, the public commons|The author or the institution|
|Journey|Profile, the life record, achievements, portfolio, transitions between schools|The person|
|Rewards|The points and recognition ledger|Open: the person, or part of Journey|
|AI and agents|Assistance, agent runs and their proposals, delegation grants, agent memory|The person who delegated|

The **platform** layer under them owns no business meaning. It gives every area the same identity, bonds and authority, consent, audit, records lifecycle, notifications, files, search, calendar, entitlements, integrations and export.

### **Questions for you (level 2):**

1. Is attendance Learning (a teacher marks it in class) or Institution operations (the school reports it)? It can have only one owner.

2. Is Rewards its own area or part of Journey?

3. Who owns a guardian link: Family, or Institution operations because the school verifies it?

4. Which areas come first? Of the 65–70% not built, the order decides what the first worked areas teach us.

## Level 3: capabilities

A **capability** is one thing a person can ask an area to do, where the server decides whether they may. The API is just the list of capabilities, nothing else. Each one is named `area.module.verb` , for example `learning.assignments.submit` .

Every capability answers the same seven questions before anyone writes code:

1. **Purpose:** which level-1 need it serves, in one sentence.

2. **Kind:** a _query_ reads facts; a _command_ changes them.

3. **Who may:** which capacities, through a bond on which entity, and whether an agent acting for them may.

4. **Takes and gives:** the input and the result, in plain words first.

5. **What changes:** which facts, and which event other areas hear about.

6. **What can go wrong:** each error by name, and when it happens.

7. **Offline:** can the phone do it without a connection and sync later, or must it reach the server?

A first sketch for a few areas, to show the shape. These are _drafts to correct_ , not decisions:

|Capability|Kind|Who may|What changes|What can go wrong|
|---|---|---|---|---|
|`wellbeing.mood.record`|command|The person only, never an institution|A mood entry, private to the person|Invalid input|
|`learning.classrooms.mine`|query|Any bond on a classroom|Nothing|None beyond sign-in|
|`learning.assignments.create`|command|Teacher of that classroom|An assignment; event _assignment published_|Not your classroom; due date in the past|
|`learning.assignments.submit`|command|Student enrolled in that classroom, or an agent they delegated|A submission; event_work submitted_|Closed for submissions; already submitted|
|`learning.grading.grade`|command|Teacher or marker of that classroom|A grade; event _graded_|Submission not found; grade outside the scale|
|`ops.attendance.mark`|command|Teacher of the class at that time|Attendance marks for a session|Session closed; student not enrolled|
|`family.access.childOverview`|query|Guardian with a verified link|Nothing|Link not verified; the school limits what guardians see|
|`ops.institutions.createInviteCode`|command|Principal or founder of that school|An invite code|Not your school|

The same capability serves every room and channel that needs it. A teacher's Classroom room, a bot and an agent tool all call `learning.assignments.create` . None of them gets its own version.

### **Questions for you (level 3):**

1. Are these seven questions the right card, or is something missing, such as cost, rate limits or what the person is told?

2. For the first area you pick at level 2, will you list its capabilities in your words? I'll turn them into cards.

## Level 4: rules every capability follows

These are decided once and then hold for every capability in every area. They are what makes 200 capabilities behave like one API. A missing rule here is exactly the kind of gap the real code showed: errors thrown without being declared, and authorization in three places that disagree.

|Rule|What it says|Why|
|---|---|---|
|One owner|A capability lives in the area that owns the facts it changes|Rooms and channels never grow their own API|
|Who may, in one place|The "who may" of level 3 is written once, beside the capability. The server check, the policy engine (Cedar) and the docs all read that one place|Today the model, the handler and Cedar each say something different|
|Declared errors|A capability can only fail with errors it names. Common ones (not signed in, not allowed, unavailable, too many requests, invalid input) are shared|Clients can show the right thing; nothing surprises them|
|Null is not omission|In a change, a missing field means _keep it_; `null`means_clear it_|A guardian clearing a phone number must not look like "no change"|
|Retry-safe commands|A command that creates something takes an idempotency key; the same key returns the first result|Phones on poor networks send twice|
|Time|Timestamps are ISO 8601 with offset; days are dates in the school's own time zone|Attendance at 7:45 in Colombo is not 2:15 in UTC|
|Money and marks|Exact decimals carried as strings, never floating point|Fees and grades must add up|
|Lists|Every list pages the same way (cursor, limit) and an empty list is `[]`|One way to page, everywhere|
|Privacy|Person-owned facts never enter an institution's data; what a guardian or agent sees is decided by consent, not by the screen|Your platform map's person- centred rule|
|Offline|Each capability says whether the phone may do it first and sync later; the signed permission snapshot lets the phone check offline|Local first, mobile first|
|Agents|An agent acts only through a delegation grant, and every result it proposes is visible as the agent's|AI help without hidden actions|
|Audit|Every command records who, through which bond and capacity, on which device, via which agent|Records that last a 13-year bond|
|Change|A capability can grow but never silently break; breaking needs a new version, checked automatically|Old phones keep working|

### **Questions for you (level 4):**

1. Is any rule here wrong for Gurudevi, or missing? Examples: language (Sinhala, Tamil, English) in error messages, rate limits per capacity, quiet hours.

2. Should agents be allowed to run commands directly, or only to propose them for the person to approve?

## Level 5: writing it down

Levels 1 to 4 are decisions in words. Level 5 is where they are written once, in a form a machine can check. **TypeSpec is that form** , one file per area. Each capability card from level 3 becomes an operation, and each rule from level 4 becomes something the spec enforces:

**Who may** becomes a decorator on the operation, such as

- `@requiresBond("CLASSROOM", ["teacher"])` or `@delegable` .

- **Declared errors** become part of the return type, such as `Submission | NotFound | Closed` . An undeclared error cannot exist.

- **Kind and offline** become `@query` / `@command` and `@offline` .

- **Null versus omission, decimals, time and paging** become shared types: `Decimal` , `SchoolDate` , `Page<T>` .

generation · 1 source, 6 outputs

**Why our own emitter.** Round 1 showed that the off-the-shelf bridge (Hey API) is two months stale and drops errors, metadata and strictness. TypeSpec has an emitter framework for writing generators. A Gurudevi emitter of a few hundred lines writes exactly what we need and nothing we don't, and it moves with us instead of with someone else's release schedule.

**Where the data model fits.** TypeSpec describes what the API _says_ , in the words of levels 1 to 4. The ZenStack model describes how facts are _stored_ . They are deliberately separate: storage can change (a column split, a table moved) without the API changing. The handler is the only place that maps one to the other, and migrations are generated from the model, as you already decided.

**What a person writes for a new capability:** one operation in the area's TypeSpec file, one handler, and its behaviour test. Everything else is generated, so there are no hand-kept lists to forget.

## Level 6: one area, top to bottom

Assignments, taken through every level. This is new, not copied from existing code.

1. **People and purpose:** a teacher sets work for a classroom; a student hands it in, often on a phone with a poor connection.

2. **Area:** Learning owns it, inside `learning.assignments` . The institution owns the facts, and the student is the author of their submission.

### 3. **Capabilities:**

   - `create` is a command for the classroom's teacher. An agent may only _propose_ it.

   - It publishes the event _assignment published_ .

   - `list` is a query for the teacher and students of that classroom. It works offline,

   - and an agent may run it.

   - `submit` is a command for an enrolled student. It works offline, an agent may only

   - _propose_ it, and it fails with _closed_ or _already submitted_ .

4. **Rules applied:**

   - `create` and `submit` take an idempotency key, because phones send twice. `maxScore` is an exact decimal, carried as text.

   - `dueAt` is a date-time with an offset, and `null` means no due date.

   - The list pages the shared way.

5. **Written down,** in TypeSpec. This compiles today with TypeSpec 1.18 and our own decorators:

```
namespace Learning.Assignments;
model Assignment {
  id: Id;
  classroomId: Id;
  title: string;
  /** null: no due date. */
  dueAt: offsetDateTime | null;
  maxScore: Decimal;
}
alias Closed = Problem<"SUBMISSIONS_CLOSED">;
alias AlreadySubmitted = Problem<"ALREADY_SUBMITTED">;
```

```
/** A teacher sets work for their classroom. Event: assignment published. */
@command @idempotent
@requiresBond("CLASSROOM", #["teacher"])
@delegable("propose")
op create(classroomId: Id, @minLength(1) @maxLength(200) title: string,
          dueAt?: offsetDateTime | null, maxScore: Decimal): Assignment |
NotFound;
```

```
/** What is set in a classroom, newest first. */
@query @offline
@requiresBond("CLASSROOM", #["teacher", "student"])
@delegable("run")
op list(classroomId: Id, cursor?: string, @minValue(1) @maxValue(100) limit?:
int32):
  Page<Assignment> | NotFound;
/** A student hands in work, even without a connection. Event: work
submitted. */
@command @idempotent @offline
@requiresBond("CLASSROOM", #["student"])
@delegable("propose")
op submit(assignmentId: Id, @maxLength(20000) answer: string):
  { submissionId: Id; submittedAt: offsetDateTime } | NotFound | Closed |
AlreadySubmitted;
```

Everything a client, a policy or a reviewer needs is in those lines: who may, what can fail, what works offline, what an agent may do. From here the emitter writes the oRPC contract and Zod for the phone, web and server. It also writes the OpenAPI document, the Cedar actions, the catalog entry and test skeletons. The person then writes three handlers and their behaviour tests.

The shared pieces ( `Id` , `Decimal` , `Page<T>` , `Problem<Code>` , and the decorators) live in one Gurudevi library file that every area imports.

## What happens next, and to existing code

**Order of work.** Decide level 1, then 2, then the rules at 4, then one area at 3. Only then does code start: the Gurudevi TypeSpec library and emitter, then that first area end to end (spec, generated contract, handlers, behaviour tests against a real database). The second area tests whether the levels hold. Agents, including low-cost ones, work from level 3 cards and the TypeSpec. Round 2 showed they write correct handlers when the expected behaviour is that clearly stated.

**Existing code is input, not foundation.** The 15 capabilities in today's v1 contract (identity, authority, ops.institutions) stay running for the app as they are. Each is re-decided topdown when its area comes up, and then replaced through the generated contract. Nothing is migrated wholesale, and nothing is deleted without your yes. Your platform map, domain index and module cards are the best starting text for levels 1 and 2, which is why this doc quotes them, but each line is yours to confirm or change.

### **The questions, all in one place:**

1. Level 1: are the people complete, are their purposes right, and who owns facts written by a teacher about a child?

2. Level 2: does attendance belong to Learning or Operations? Is Rewards its own area? Who owns guardian links? Which area comes first?

3. Level 3: is the seven-question card right? Then list the first area's capabilities in your words.

4. Level 4: which rules are wrong or missing? May agents run commands, or only propose them?

Answer any of these here as comments, in any order. Each answer moves its level from draft to decided.
