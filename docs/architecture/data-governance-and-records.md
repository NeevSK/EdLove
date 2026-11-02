---
title: "Data Governance and Records"
status: "active"
created: 2026-11-02
updated: 2026-11-02
author: "Naveen"
scribe: "Claude"
tags: [architecture, privacy, audit, retention, records, governance, minors, reference]
---

# Data Governance and Records

How every record in Gurudevi is owned, shared, changed, audited, kept, deleted and
taken out. These are platform rules: every domain uses the same mechanisms and only
chooses its classes. A domain card names its classes; it never invents its own
mechanism.

Most users are children. Records may need to stay meaningful for 13 years (a student's
school life) or 40 (a teacher's career). Both facts shape everything below.

## 1. Every record has an owner kind

| Owner kind | Examples | Who controls it |
| --- | --- | --- |
| Person | Journal, mood, personal notes, AI memory, drafts | The person (or their guardian while they are a minor) |
| Institution | Enrolment, attendance, grades, fees, staff records | The institution, through bonds and policy |
| Shared | A note a student shares with a teacher, a group post | The author owns it; the grant decides who sees it |
| Public | A published library resource, a public commons article | The author or curator; anyone may read |
| Operational | Audit trail, receipts, delivery attempts | The platform, under its own rules |

## 2. Private by default, shared by grant

Nothing a person creates is visible to anyone else until they share it. Sharing is a
**grant**: a record that says who may see or do what with one thing.

- Audiences: one person, a bond group (a classroom, a school's staff), an institution,
  or the public.
- Grants have a lifecycle (given, changed, revoked, expired) and are themselves audited.
- Revoking a grant stops future access. It can't unsee what was seen, so the audit
  keeps who saw it.
- Cedar evaluates grants together with bonds. The client may hide things; it never
  decides.
- Institutional records are the reverse: visible to the institution by default, and
  to the person they are about. They are shared outward (to a guardian, to another
  school) by policy and consent.

## 3. Each fact has a mutation kind

The subdomain card picks one per fact.

| Kind | Meaning | Examples |
| --- | --- | --- |
| Editable | The latest value replaces the old one. No history needed | Display preferences, drafts |
| Versioned | Every change is kept; the latest is current | Notes, lesson materials, profile text |
| Corrected | The original is never changed. A correction record with a reason and an author supersedes it | Grades, attendance, fees, official notices |
| Append-only | Records are only ever added | Rewards ledger, audit trail, receipts |

Grades, attendance and money are always **corrected**, never edited.

## 4. Deleting has four meanings

| Kind | What happens | Reversible? |
| --- | --- | --- |
| Soft delete | The record is hidden and marked deleted, with who, when and why. It stays restorable for a window | Yes, within the window |
| Erasure | A person's data is removed on their request or at account deletion, except what law or a legitimate institutional duty requires keeping | No |
| Retention expiry | The record is removed because its retention period ended | No |
| Anonymisation | Identity is removed; aggregate meaning stays | No |

Rules:

- A **legal hold** (a dispute, an investigation, a safeguarding concern) blocks every
  kind of deletion until it is lifted.
- Ending a bond deletes nothing. The student who leaves a school keeps their personal
  data, and the school keeps its institutional record about them.
- Erasure reaches backups when those backups expire. That delay must be stated, not
  hidden.
- Soft-deleted records are excluded from every normal query by the data layer, not by
  each caller remembering to filter.

## 5. Audit

The audit trail answers: who did it, as whom, through what, to what, when, why, and
what happened.

| Field | Meaning |
| --- | --- |
| Actor | The canonical account |
| As | The bond and capacity used (teacher of 10-B, guardian of a named child) |
| Via | Channel, device and trust level, and the agent and its delegator if an agent acted |
| Action | The capability (command name) and the target fact's identifier |
| When | Server time, plus client time for offline writes |
| Why | Required reason for corrections, overrides and access to sensitive records |
| Outcome | Accepted, denied (with the policy that denied it), failed, uncertain |

Rules:

- Append-only and tamper-evident (each entry chained to the previous by hash).
- Every command is audited. Reads of sensitive records are audited too: grades,
  wellbeing, safeguarding, anything about a minor read by someone other than them or
  their guardian.
- The audit holds identifiers and reasons, not content. A journal's text never enters
  the audit.
- Reading the audit is itself audited.
- Audit is not telemetry. Logs and traces have different retention and can be sampled;
  audit can't.

## 6. Retention

Each record class has a retention rule, set on its subdomain card and approved by the
owner. The platform enforces it; it never picks the number.

- **Horizon** is how long the record must stay meaningful (13 years for a student's
  school record, a career for a teacher's).
- **Retention** is how long it must or may be kept after its purpose ends. It comes
  from law and institutional duty, not from engineering preference.
- No retention period is invented in code. Where the law or the owner hasn't decided,
  the card says "undecided" and the record is kept, with that recorded as an open
  question.

## 7. Minors

- Age, and who the guardian is, are facts in authority, not UI checks.
- Consent for a minor's data comes from a verified guardian where the law requires it.
- When a person comes of age, control moves to them. Guardian access ends or changes
  by policy, and the person is told.
- Community features with minors have moderation, reporting and blocking from the
  start.
- AI features that remember things about a minor need guardian-visible settings.

## 8. Taking data out

A person can export everything they own, and what institutions hold about them, in
open formats. An institution can export its records. This is a platform service
(exports), not a feature of each domain. Formats are mapped to education standards
where they exist; see
[data portability and education standards](../../apps/sanctuary-api/docs/architecture/api-foundations/data-portability-and-education-standards.md).

## 9. Security of stored data

- Encryption at rest everywhere; stronger protection (field-level or separate keys) for
  wellbeing, safeguarding and anything a person marks private.
- Least privilege for operators. Support access is a channel with break-glass rules,
  reasons and audit.
- Secrets stay in Doppler, never in files or chat logs.

## <a id="decades"></a>10. Decades

- Identifiers are permanent (UUIDv8 accounts, UUIDs for facts) and never reused.
- Stored records carry the version of their shape, so a record written in 2026 can
  still be read and exported in 2050.
- Time is stored in UTC with the institution's time zone and academic year recorded
  alongside, because "Grade 7, term 2, 2026" must still mean something later.
- History survives schema changes: migrations transform old records; they never drop
  history to make a change easier.

## 11. Law

Design to a high, general baseline (purpose limitation, minimisation, consent, access,
correction, erasure, portability, breach notice), so any applicable law is met without
redesign.

Sri Lanka's Personal Data Protection Act, No. 9 of 2022 applies. Its main parts were
due to start on 18 March 2025, per the
[Data Protection Authority](https://www.dpa.gov.lk/est.php). The Amendment Act,
No. 22 of 2025 changed how commencement works, and a later report says the main parts
start on 1 January 2027
([summary](https://en.wikipedia.org/wiki/Personal_Data_Protection_Act_(Sri_Lanka)),
[amendment analysis](https://www.fjgdesaram.com/news-insights/dissecting-the-provisions-of-the-amendment-bill-amending-the-personal-data-protection-act)).
These sources conflict, and none of these dates was confirmed against the Gazette
itself on 2026-11-02. **The owner checks the Gazette** before any compliance claim. A
lawyer, not this document, decides retention periods and the age of consent.

## What the platform must build

These are horizontal layers. Their order and status are in the
[API engineering playbook](../../apps/sanctuary-api/docs/architecture/api-engineering-playbook.md#horizontal-layers-the-base-every-domain-stands-on).

- Grants (sharing) evaluated with bonds in Cedar
- Audit trail (append-only, chained) with read auditing for sensitive classes
- Records lifecycle: versions, corrections, soft delete with restore window, legal
  hold, retention jobs, erasure
- Export service with standard and open formats
- Minor and guardian rules in authority
