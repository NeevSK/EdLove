---
title: "Wellbeing · Growth (can-do records)"
status: proposed
owner: Naveen
created: 2026-11-14
scribe: "Claude"
tags: [architecture, domains, wellbeing, growth, competence, card]
---

# Wellbeing · Growth (can-do records)

`wellbeing.growth` keeps what a person has come to be able to do, in their own words, with the
evidence and the people who saw it. It is how competence (feeling effective, the strongest
predictor of self-determined motivation in self-determination theory) becomes something the
person can see without the system turning it into a score.

It follows the upstream rule that **existence is deterministic, meaning is not**. The system
notices facts. The person decides what they mean. Relations witness them. The evidence behind
this design is in the project doc `claude/learning-that-works.md`.

**Status: proposed.** This is a new subdomain. Admitting it adds `wellbeing.growth` to the
[domain index](../README.md) and the API module catalog in the same change. That, the
`schema.zmodel` models and the generated Zod are Neev's L0. Nothing here is encoded yet.

## Is this a new subdomain?

| Question | Answer |
| --- | --- |
| Owns facts no one else owns? | Yes. Claimed can-do moments, their evidence and witnesses. Attempts stay in `learning.assessments`, journals in `wellbeing.journal`. |
| Its own lifecycle? | Yes. A moment is offered or declared, then claimed, witnessed, shared, or withdrawn. |
| Its own invariants? | Yes. Only the person claims; nothing is computed into a level. |
| A different authority? | Yes. The person alone. A witness can confirm but never create a claim for someone else. |
| A different privacy class? | Yes. Person-private by default, shared moment by moment. |

## Facts it owns

- **Can-do moment.** It holds:
  - one person;
  - a statement in their words ("I can solve two-step fraction problems on my own");
  - an area the person chose (one of their own areas, below), or none;
  - its origin: `noticed` (offered from a journal fact), `declared` (written by the person) or `given` (a note from someone in a relation, accepted by the person);
  - for `noticed`, the deterministic fact it came from (for example "part q7 answered alone on 14 Nov; on 20 Oct it took two hints"), with links to the attempts;
  - optional evidence: a photo, a voice note, an attempt, or a library item;
  - its time and place;
  - its state: `offered` → `claimed` → (`shared`)* · `withdrawn`, or `offered` → `let_pass`.
- **Witness.** On a moment: the witnessing person, the relation they share, a short note, and the time.
- **Area.** The person's own areas of growth: a name, and an optional link to a syllabus outcome or to nothing at all. The defaults offered are suggestions; the person keeps, renames or removes them.
- **Self-rating** (optional). The person's own rating of an area, 0 to 1, with its time. Kept as a history, so "then" and "now" can be shown side by side.

## Invariants

1. Only the person creates a claim. A `noticed` moment is an offer until the person claims it, and letting it pass leaves no mark beyond the offer.
2. Nothing computes a level, rank, prediction or label about the person. Counts of claimed moments and self-ratings are the person's own facts, shown to them.
3. Outside the syllabus counts the same. An area need not map to any curriculum.
4. A witness confirms; a witness never edits the statement.
5. Sharing is per moment and per audience (a teacher in a relation, a guardian), and can be withdrawn.
6. Every fact carries its time and place.

## Authority, privacy and sync

- **Authority:** the person. A teacher or guardian sees a moment only when it is shared with them, or when they are its witness.
- **Privacy:** person-private by default. For minors, sharing with a guardian follows the consent module (Gate 7).
- **Sync:** local-first and append-only, with ids made on the device. Which tables reach PowerSync, and when, is Neev's decision.

## Commands and queries (on admission)

| Command | What it does |
| --- | --- |
| `wellbeing.growth.claim` | Claims an offered moment, or declares a new one. |
| `wellbeing.growth.letPass` | Lets an offered moment pass. |
| `wellbeing.growth.share` / `unshare` | Shares a moment with a relation or guardian, or stops. |
| `wellbeing.growth.witness` | A person in a relation confirms a moment shared with them. |
| `wellbeing.growth.rateArea` | Adds a self-rating to an area. |

| Query | What it returns |
| --- | --- |
| `wellbeing.growth.mine` | My moments, by area and time. |
| `wellbeing.growth.areas` | My areas, each with its claimed-moment count and self-rating history, for the radar. |
| `wellbeing.growth.sharedWithMe` | Moments shared with me, for a teacher or guardian. |

## How the pieces connect

| Piece | Where | Role |
| --- | --- | --- |
| The journal | `@repo/form-builder/activity` | The facts a `noticed` moment comes from (help that faded, a sure-and-right answer) |
| The moments engine | `@repo/core/flows/moments` | Decides when to offer a moment, with consent, caps and quiet hours |
| The flow navigator | `@repo/core/flows` | Opens the offer as a step in a journey |
| The radar | `@repo/ui/components/{native,web}/Radar` | Shows the person's areas: claimed moments or self-rating, then and now |
| PJC | `feature:learning.loops` | Holds the why, the evidence links and the fidelity checks |

## Open questions

- **Default areas.** Which areas are offered at first, and in which words (si/ta/en)? _Default:_ none pre-filled for adults; a short starter set for students that they can change.
- **What the radar shows.** Self-rating, claimed-moment count, or both? _Default:_ self-rating when the person has rated; otherwise claimed moments in the last term.
- **Guardian view.** Do guardians see shared moments in Family or in messaging? _Default:_ in Family, as a conversation starter.
- **Teacher notes.** Can a teacher's note become a moment directly, or only through the person accepting it? _Default:_ only when the person accepts it.
