---
title: "Screen Reading Method â€” Job-Counting, Not Existence-Checking"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, files]
---

# Screen Reading Method — Job-Counting, Not Existence-Checking

A standing method, not scoped to one tab. Every prior per-tab operationalization doc (`20`, `21`, `24`, `25`) used component-enumeration — grep for tag names, list what exists. That method reliably confirms *whether* something exists, but cannot detect redundancy, because redundant elements have different names and different code, and a name-based search never connects them. This doc names the method that does, so it doesn't need re-deriving each time, and so it can be applied retroactively to screens already audited.

## The core distinction

**Existence-checking asks: "does X exist?"** Answered by grep, by a file listing, by "I found a history toggle." This is necessary and was correctly used throughout this exploration to confirm real features exist — but it cannot see relationships between things, only their presence.

**Job-counting asks: "how many things on this screen are doing the same underlying job?"** Only answerable by reading the actual render tree in order and labeling each element by *function*, not by *name*. This is what surfaced `BaseSelfView.tsx`'s real problem — a date navigator, a mode toggle, and a scale selector, three different components, three different files, each individually working correctly, all quietly answering some version of "when." Existence-checking would confirm all three "exist and work." Only job-counting reveals they're the same job, done three times.

## The protocol

1. **Read the JSX in render order, top to bottom — not by grepping component names.** Order and nesting carry real information that a flat list of matched tag names discards.
2. **For each element, write its conceptual job, not its name.** "Navigates time," "selects what's shown," "displays content," "takes an action" — a small, generic vocabulary, not component identifiers.
3. **Group everything by job.** If two or more elements share a job label, that's a redundancy worth investigating — regardless of how different their code or names are.
4. **Walk the interaction, not just the layout.** For each tappable element: what happens to the *rest* of the screen when it's pressed? Does it reveal, hide, or restructure something else? This is how a three-control redundancy like the temporal-navigation stack actually gets felt by a real person, not just observed in code.
5. **Do the cold-read test.** What would a first-time user need to already understand to make sense of this screen, given only what's actually visible? This catches problems neither existence-checking nor job-counting alone will — implicit assumptions baked into the layout.

## Correction — job-counting alone still isn't enough, demonstrated directly

Job-counting (the protocol above) found the three redundant temporal controls in `22`. It did not find a fourth redundant instance, or a real emoji-as-chrome problem — both only became visible by extracting actual layout properties (size, position, badge-stacking) from the code and reconstructing the element at real scale, not just reading render order with function labels attached. **Render order, even done carefully, still isn't spatial reconstruction — flex direction, absolute positioning, and stacked badges on a small element carry real visual-density information that a sequential, labeled reading of JSX order does not surface.**

**Step 6, added to the protocol above: for any small or information-dense element (icons, badges, compact controls), extract the actual size and every layer stacked on it, and reconstruct it at real scale — literally build it, don't just reason about it in the abstract.** This is what found both the redundant per-icon history badge and the emoji-as-functional-chrome problem in `BaseSelfView.tsx`'s feature icons (documented in `26`) — neither was visible from job-counting alone, since both were about *density on one small element*, not *redundant elements across the screen*.

## Correction — job-counting and spatial reconstruction still aren't enough; navigation tracing found a third class of bug

Neither job-counting nor real-scale spatial reconstruction would have found `21`'s classroom-selection bug — a navigation call carrying `classroomId`/`classroomName` params, where nothing downstream ever reads them, silently discarding a real user choice. **Step 7, added to the protocol: for any tappable element that navigates somewhere, follow it all the way to its actual destination and confirm the destination consumes whatever was sent — not just that the destination exists and renders successfully.** A screen "existing and working" is a different, weaker claim than "correctly receiving what a specific tap intended to send it."

## Applying this retroactively

This method wasn't used in `20`, `21`, `24`, or `25` — those docs correctly confirmed real structures exist (Self's accordion, Workspace's canvas, Profile's sections, Library's persona split) but never job-counted across the full rendered screen the way this conversation just did for `BaseSelfView.tsx`. **Every tab's primary screen is a real candidate for the same kind of finding** — worth a dedicated pass applying this protocol specifically, treating the existing docs as confirming *what exists*, not as confirming *there's no redundancy*.

## Open Questions / Not Yet Resolved

- This protocol has been applied fully to exactly one screen (`BaseSelfView.tsx`) so far — Workspace's canvas, Library's 1279-line screen, and Community's feed are all strong candidates for the same treatment, given their own complexity already noted elsewhere
- Whether a lighter-weight version of this check (a fixed checklist an agent runs before calling any screen "done") is worth formalizing into `16`'s agent-ready spec directly, rather than staying a separate method doc
