# Ontology harvest

What the repository already says exists, gathered from schemas, code and design docs, and
checked against `../gurudevi.yaml`. The harvest **decides nothing**: it shows where the
sources agree and disagree so Neev can settle each conflict once, in the ontology.

## How it runs

| Step | Who | Deterministic | Output |
| --- | --- | --- | --- |
| 1. Code and schemas: `harvest_code.py` parses `packages/schema/schema.zmodel`, `supabase/migrations/*.sql`, domain TypeScript lists (`export const … = [...]`, `export type … = 'a' \| 'b'`, `z.enum` in the v1 contract) and Mermaid ER blocks in `docs/` | script | yes, byte-stable | `out/claims-code.yaml` |
| 2. Design docs: 7 small Haiku agents each read a batch of the 39 docs in `docs.txt` and record only explicit claims, with file, line and a verbatim quote, following `INSTRUCTIONS.md` | Haiku agents | no; then checked | raw claims |
| 3. Check: every doc claim's quote is searched for in its file; line numbers are corrected; claims whose quote is not found are kept but marked `verified: false` and left out of the report | script | yes | `out/claims-docs.yaml` |
| 4. Align and compare: `reconcile.py` groups names by `concepts.yaml` and compares capacities, names and state lists | script | yes, byte-stable | `out/conflicts.md`, `out/concepts-seen.yaml` |

`concepts.yaml` is the one hand-written judgement: which names mean which ontology concept.
It is a proposal for Neev to check.

To regenerate steps 1 and 4 (step 2 only when the docs change):

```sh
python -I ontology/harvest/harvest_code.py . ontology/harvest/out/claims-code.yaml
python -I ontology/harvest/reconcile.py ontology/harvest
```

## First run, 2026-11-27

3,428 claims from 98 files (2,426 from docs, 1,002 from code). 42 doc claims (1.7%) were left out
because their quote was not in the file; 97 had their line number corrected.

The biggest conflicts, all with sources in `out/conflicts.md`:

1. **A bond is stored six ways.** `Bond`, `SchoolMembership`, `GuardianBond`,
   `StudentGuardianRelationship`, `AcademicCycleLeadershipAssignment` and
   `GradeClassTeacherAssignment` each hold "a person joined something in some capacity",
   each with its own status list.
2. **Bond states disagree with the docs.** `authority-model.md` and
   `domains/platform/authority.md` say invited, active, suspended, ended (kept), which matches
   the ontology. The `Bond` table says active, archived, revoked. `GuardianBond` says pending,
   verified, revoked. The assignment tables say active, completed, ended.
3. **Capacities: 5 in the ontology, about 25 real ones in the sources.** `admin` is the
   most used capacity in the zmodel policies (over 120 places) and is not in the ontology.
   `section_head` and `grade_head` each have three spellings (`section_head`, `sectionHead`,
   `section-head`). `parent` and `guardian` are both used. Tuition uses `lead_tutor`,
   `assistant_tutor`, `paper_marker`. The v1 contract allows `teacher, student, guardian` for
   new bonds and `teacher, student, staff, guardian` as roles. The institutional-structure
   decision lists 12 school positions (deputy principal, class teacher, relief teacher...).
4. **Enrollment has two shapes.** `ClassroomStudent` (active, left, suspended) and
   `StudentGradeClassEnrollment` (active, completed, withdrawn); neither has invited.
5. **Institution has many names.** `School`, `EduSchool`, `SchoolRegistry`,
   `TuitionInstitute`, `Org`, `Entity`, `Institution`.
6. **Authority vs grant.** `data-governance-and-records.md` gives a grant the states given,
   changed, revoked, expired; the ontology has held, ended.
7. **Invitations are not in the ontology yet** but exist five ways: `InviteCode`,
   `SchoolInviteCode`, `ClassroomJoinRequest`, `SchoolJoinRequest`, `SchoolRegistryClaim`.

Section 5 of the report lists 770 rules stated in docs, as candidates for the rules section.

## Limits

- Only 39 of 351 Markdown files with domain words were read (the model, decision and domain
  docs). Progress logs, atlases and research papers were not.
- Code values come from comments where the schema stores strings (`status String // a, b`);
  a comment can be stale.
- The tools researched for this are in `TOOLS.md`.
