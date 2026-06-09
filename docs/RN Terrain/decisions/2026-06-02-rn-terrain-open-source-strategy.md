---
title: "RN Terrain - Open Source Strategy"
status: "active"
created: 2026-06-02
updated: 2026-06-02
author: "Neev"
tags: [rn-terrain, decisions, strategy, open-source]
---
# RN Terrain â€” Open Source Strategy
## Why Everything Is Public and How to Do It Right

---

# THE DECISION

Everything is open source. Not just the code.
The blueprint. The founder doc. The agent guide.
The integrity spec. And eventually â€” Conceptual Topology itself.

This is not a reluctant decision. It is the strategy.

---

# WHY OPEN SOURCE IS THE RIGHT MOVE

## 1. Neutrality Requires Transparency

RN Terrain's entire trust moat is neutrality.
A neutral tool that is closed source is not neutral â€”
it just claims to be.

An open source tool where anyone can read the scoring weights,
the vendor priors, the ground truth corpus, the integrity spec â€”
that is verifiably neutral. Developers can audit the logic.
They can see that Software Mansion packages don't get
special treatment. They can see that Expo packages
get vendor priors because the logic is documented and fair.

Open source makes the neutrality claim real, not just stated.

## 2. The Event Log Is the Moat, Not the Code

The code is replicable. Anyone can fork it.
The event log â€” the append-only history of every
ecosystem event since Day 1 â€” is not replicable.
It grows every day. A new entrant cannot recreate it.

Open source the code freely.
The data is the asset. The history is the moat.

## 3. Community Contributions = Better Data

The hardest part of RN Terrain is data quality.
Manual curation of 300+ packages is enormous work.
Open source means the community can submit PRs:
- Add missing packages
- Correct wrong classifications
- Add known conflicts
- Improve the ground truth corpus
- Add new key persons to the radar

Every contributor makes the data better.
Better data = more trustworthy verdicts.
More trustworthy verdicts = more adoption.
More adoption = more contributors.
This is the flywheel.

## 4. The Blueprint as Community Document

The full blueprint and architecture is the most
compelling README the RN community has ever seen.
It shows that this tool was designed from first principles,
not hacked together. It invites serious contributors â€”
the kind who read deeply before they commit.

A detailed architecture document says:
"This is a real project with a real vision.
 Not a weekend side project."

## 5. Conceptual Topology Is a Gift to the Community

Sharing Conceptual Topology publicly as the theoretical
backbone of RN Terrain does something powerful:
it elevates the conversation.

Instead of "here's a package checker," you are saying:
"Here is a framework for thinking about ecosystem health,
 and here is an implementation of that framework."

That is the kind of project that gets cited at conferences.
That is the kind of project that Evan Bacon tweets about.
That is the kind of project that Nicola Corti references
in a talk about ecosystem sustainability.

The philosophy is the differentiator.
Open source it fully.

---

# WHAT TO OPEN SOURCE

## Repository 1 â€” `rn-terrain` (the main tool)

```
Open source: EVERYTHING
License:     MIT

What's included:
  packages/core         â€” the evaluation engine
  packages/cli          â€” the CLI tool
  packages/mcp          â€” the MCP server
  supabase/migrations   â€” the full schema
  supabase/seed         â€” initial package data
  INTEGRITY.md          â€” the data integrity spec
  ARCHITECTURE.md       â€” links to full blueprint
  CONTRIBUTING.md       â€” how to add packages/corrections
  docs/                 â€” all the blueprint documents

What's NOT included:
  .env files            â€” never commit secrets
  Your Supabase keys    â€” each deployment has their own
  The live event log    â€” the database content is yours
                          Schema is open. Data stays sovereign.
```

## Repository 2 â€” `conceptual-topology` (the philosophy)

```
Open source: EVERYTHING
License:     Creative Commons Attribution 4.0
             (share freely, always credit Neev)

What's included:
  conceptual_topology_v2.md    â€” the full framework
  README.md                    â€” how it applies to software ecosystems
  examples/                    â€” applied to RN Terrain
                                 applied to package evaluation
                                 applied to the tool itself
  APPLICATIONS.md              â€” how others can use this framework

This becomes a standalone intellectual contribution.
Not just "the theory behind RN Terrain" â€”
a general framework for navigating complex domains.
```

---

# HOW TO STRUCTURE THE OPEN SOURCE RELEASE

## The README Is the First Impression

The main `rn-terrain` README should do five things:

```markdown
1. ONE LINE â€” what it is
   "RN Terrain is the live intelligence layer for the
    React Native ecosystem."

2. SHOW DON'T TELL â€” a terminal screenshot
   Show npx rn-eval react-native-reanimated output.
   The VitalityCard printed beautifully.
   No words needed. Developers understand immediately.

3. THE WHY â€” one paragraph
   The swamp metaphor. Entropy. Orientation.
   Link to Conceptual Topology for the full philosophy.

4. QUICK START â€” three commands
   npx rn-eval react-native-reanimated
   npx rn-eval scan
   npx rn-eval compare reanimated skia

5. LINKS â€” everything else
   Full architecture doc
   Integrity spec
   Contributing guide
   Web surface
   MCP configuration
```

## The Contributing Guide

```markdown
# Contributing to RN Terrain

Three ways to contribute:

## 1. Add or correct a package
   Most valuable contribution.
   Edit supabase/seed/packages.ts
   Follow the schema in INTEGRITY.md
   Run the calibration tests
   Open a PR with your reasoning

## 2. Improve the scoring
   Read INTEGRITY.md first â€” especially the weights section.
   All scoring changes require:
   - Reasoning documented in PR
   - Ground truth corpus still passing
   - Neev review before merge

## 3. Add to the ground truth corpus
   If you know a package is definitively ADOPT or HOLD,
   add it to the calibration test suite.
   The more ground truth, the more trustworthy the scores.
```

## The Integrity of Open Source Itself

The integrity spec applies to the open source process too.

```
Versioned weights:
  Every change to scoring weights is a git commit.
  The git history is the audit trail.
  Developers can see exactly when a verdict changed and why.

Signed releases:
  npm packages are published with provenance.
  Developers can verify the CLI they install
  matches the source code they can read.

Public calibration runs:
  The ground truth corpus test results are published
  on every release in the GitHub release notes.
  "All 23 calibration tests passing" = visible proof.

Dependency transparency:
  We track our own dependencies with rn-eval.
  Our package.json is evaluated by our own tool.
  We publish our own vitality score.
  Recursive integrity.
```

---

# THE COMMUNITY FLYWHEEL

```
Open source release
        â”‚
        â–¼
RN developers read the architecture
        â”‚
        â–¼
Some contribute packages / corrections
        â”‚
        â–¼
Data quality improves
        â”‚
        â–¼
Verdicts become more trustworthy
        â”‚
        â–¼
More developers use the tool
        â”‚
        â–¼
Key persons notice + reference it
        â”‚
        â–¼
Conference mention / blog post
        â”‚
        â–¼
More developers read the architecture
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              (flywheel accelerates)
```

The open source release is not a launch event.
It is the beginning of the flywheel.
The flywheel only stops if the tool stops being useful.

---

# THE CONCEPTUAL TOPOLOGY RELEASE

## How to Frame It

Not as "the philosophy behind an npm tool."
As a standalone intellectual contribution
to the question of how to navigate complex domains.

```markdown
# Conceptual Topology
## A Framework for Navigating Complex Domains

by Neev, University of Moratuwa

---

Conceptual Topology is a framework for understanding
any domain of human knowledge by mapping its
permanent structure â€” the shape that doesn't change
even as the contents do.

It was developed while trying to understand why
navigating the React Native ecosystem feels like
wandering in a shifting swamp â€” and what it would
take to give developers a reliable map.

The framework has since been applied to:
- Evaluating open source package health (RN Terrain)
- Understanding ecosystem decay and syntropy
- Designing tools that remain useful as the terrain shifts

This document is the full framework.
Use it. Extend it. Build on it.
Always credit the original.

â†’ See it applied: RN Terrain (github.com/neev/rn-terrain)
```

## Why This Matters Beyond the Tool

Conceptual Topology as a public document:

- Establishes Neev as a systems thinker, not just a tool builder
- Creates a citation anchor for any future work
- Attracts contributors who think at the conceptual level
- Distinguishes RN Terrain from every other package tool
  ("this was designed from a first-principles framework")
- Builds reputation at UoM and beyond as original intellectual work
- The kind of thing that gets you invited to speak
  at App.js Conf or Chain React

A tool without philosophy is a utility.
A tool with published philosophy is a contribution.

---

# TIMELINE FOR OPEN SOURCE RELEASE

```
BEFORE OPEN SOURCE:
  âœ“ Bloom 1 working (npx rn-eval produces real output)
  âœ“ At least 50 packages in the database with real data
  âœ“ Ground truth corpus tests passing
  âœ“ INTEGRITY.md in the repo
  âœ“ Basic CONTRIBUTING.md

  Reason: don't open source a skeleton.
  Open source something that works.
  The first impression is permanent.

AT OPEN SOURCE LAUNCH:
  â†’ GitHub repo public
  â†’ npm package published (@rn-terrain/core, @rn-terrain/cli)
  â†’ README with terminal screenshot
  â†’ Tweet from @neev linking to it
  â†’ Post in r/reactnative
  â†’ Post in Expo Discord #tools channel
  â†’ Post in Callstack Discord if available

AFTER OPEN SOURCE:
  â†’ Watch for first external contributor
  â†’ That moment is a milestone â€” celebrate it publicly
  â†’ "First community contribution to RN Terrain â€”
     thank you @contributor for improving the data"
  â†’ Every public acknowledgment brings more contributors

CONCEPTUAL TOPOLOGY RELEASE:
  â†’ After Bloom 1 is live and stable
  â†’ Separate GitHub repo: github.com/neev/conceptual-topology
  â†’ Link from RN Terrain README
  â†’ Can be submitted to academic/conference venues
    if that path interests Neev
```

---

# THE ONE RISK TO NAME HONESTLY

Open sourcing everything means someone can fork it
and build a competing closed product using your architecture.

The defense:
- The event log history stays in your database
- The community trust is yours â€” it follows the original
- The Lindy score of the original grows every day
- Forks start at Lindy = 0
- The philosophy is attributed to Neev
- "Built on RN Terrain concepts" is very different
  from "is RN Terrain"

Historically, open source tools that get forked into
commercial products almost always result in the original
maintainer benefiting â€” through job offers, consulting,
conference invitations, or the commercial fork eventually
contributing back.

The risk of not open sourcing â€” staying unknown,
building in private, missing the flywheel â€” is
larger than the risk of being forked.

Open source fully. Own the original. Build the Lindy.

---

*Open source is not giving away your work.*
*It is making your work impossible to ignore.*



---

# THE APPRECIATION ECONOMY

## Open Source Has a Human Cost â€” Name It Publicly

RN Terrain is the first package tool that explicitly
names the open source sustainability crisis as a
first-class concern. That positioning is strategic
as much as it is ethical.

The Marak incident (colors.js / faker.js) and
the Aaron Swartz story are known to every serious
developer. They represent the wound in the ecosystem.
RN Terrain is the first tool to say:
we see this, we track it, we act on it.

That resonates. Especially with solo developers,
open source maintainers, and anyone who has felt
the weight of giving without reciprocity.

## The Open Source Strategy Includes Sustainability

When RN Terrain launches:
  â†’ The tool has a GitHub Sponsors link on day one
  â†’ The README includes: "Built by one developer.
     If this saved you time, consider sponsoring."
  â†’ The web surface shows RN Terrain's own VitalityCard
     including Bus Factor = 1 and Lindy = N months
  â†’ The ðŸ†˜ signal for unfunded solo maintainers
     is present from Bloom 1

This is not asking for charity.
It is modeling the behavior the tool encourages.
RN Terrain cannot ask developers to support
solo maintainers if it doesn't apply that
standard to itself first.

## The Appreciation CTA as Community Signal

Every time a developer uses the CTA to thank
a maintainer â€” that is community building.
It is also distribution: the maintainer who
got an appreciation message via RN Terrain
becomes an organic advocate for the tool.

This is the flywheel nobody else has:
  Tool surfaces appreciation need
  â†’ Developer sends thanks
  â†’ Maintainer experiences tool as positive
  â†’ Maintainer mentions tool publicly
  â†’ More developers discover tool
  â†’ More appreciation flows through tool
  â†’ Ecosystem gets slightly more human

That flywheel costs nothing. It compounds indefinitely.


