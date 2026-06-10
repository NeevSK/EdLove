---
title: "RN Terrain - Founder Operationalization Doc"
status: "active"
created: 2026-06-02
updated: 2026-06-02
author: "Neev"
tags: [rn-terrain, philosophy, orientation]
---
# RN Terrain â€” Founder Operationalization Doc
## The Conceptual & Directional Guide
*For Neev â€” the architect, the product mind, the decision maker*

---

> This document is not a task list.
> It is your north star, your decision frame,
> and your reality check â€” all in one.
> Read it when you're lost. Read it when you're tempted
> to add too much. Read it when an agent gives you
> something that feels wrong but you can't name why.

---

# PART ONE â€” WHAT YOU'RE BUILDING AND WHY

## The Single True Purpose

RN Terrain exists to give React Native developers
**powerful orientation** at the exact moment a dependency
decision must be made.

Not information. Orientation.
Not data. Intelligence.
Not a dashboard. A nervous system.

Every feature decision filters through this:
*Does this give the developer more powerful orientation?*
If yes â†’ build it.
If no â†’ cut it.

---

## The Three Promises to the Developer

**Promise 1 â€” I will tell you what this package actually is.**
Not just what it does. Where it sits in the ecosystem.
What layer. What health. What trajectory. What it costs.

**Promise 2 â€” I will tell you at the right moment.**
At discovery. At install. At update. Not after.
Not when you're debugging a broken app at 2am.

**Promise 3 â€” I will show you the reasoning.**
The score is a signal. The breakdown is the knowledge.
You always see why. You always decide.

---

## What This Is NOT

- Not a security scanner (that's Snyk/Socket)
- Not a general npm tool (that's taze, npm-check)
- Not a visual dashboard to stare at (that's Expo Atlas)
- Not another newsletter (that's This Week in React)
- Not a package registry (that's RN Directory)

It is the **intelligence layer above all of these.**
It consumes them. It enriches them. It synthesizes them.
It delivers the result at the moment it matters.

---

# PART TWO â€” THE PRODUCT STAGES
## How This Blooms

Think of this in three blooms, not phases.
Each bloom is independently valuable.
Each bloom makes the next bloom possible.

---

## BLOOM 1 â€” THE SEED
### "Does this package deserve my trust?"
*Target: Solo developers, early adopters, CLI users*

**What exists after Bloom 1:**
```
npx rn-eval react-native-reanimated
â†’ VitalityCard printed in terminal
â†’ Score + full breakdown
â†’ Verdict (ADOPT/TRIAL/ASSESS/HOLD)
â†’ V1 readiness
â†’ Links to every source
â†’ Any warnings surfaced clearly

npx rn-eval scan
â†’ Full project audit from package.json
â†’ Summary + per-package cards
â†’ What changed since last scan

MCP Server running
â†’ Claude Code / Cursor can call audit_package
â†’ Agent install intercept working
```

**What the developer feels:**
"I can trust this decision. I know why."

**Database at this stage:**
Top 300 RN packages seeded manually.
Daily sync running on volatile fields.
Event log initialized.

**Success signal:**
10 developers use it daily.
One of them tweets about it.

---

## BLOOM 2 â€” THE ROOTS
### "Show me the full terrain."
*Target: Teams, serious RN builders, VS Code users*

**What exists after Bloom 2:**
```
VS Code Extension live
â†’ Hover cards in package.json
â†’ Inline vitality badges
â†’ V1 readiness per dependency

Web surface live
â†’ rnterrain.dev/package/:name
â†’ Package cards indexed by Google
â†’ Public API endpoint
â†’ llms.txt for AI crawlers

Ecosystem Explorer v1
â†’ Category topology map
â†’ Filter by verdict / New Arch / Expo / V1
â†’ Side-by-side comparison

Weekly Digest
â†’ Email subscription
â†’ Personalized to your packages
â†’ "The week in RN â€” through your lens"

Event Alerts live
â†’ Subscribe to a package
â†’ Get notified when something changes
```

**What the developer feels:**
"I am aware of the terrain without having to monitor it."

**Database at this stage:**
600+ packages tracked.
Event-triggered pipeline running.
Key person radar active.
Source monitoring (blogs, YouTube titles, GitHub releases).

**Success signal:**
500 weekly digest subscribers.
Package card pages showing up in Google for
"react-native-X review" searches.

---

## BLOOM 3 â€” THE CANOPY
### "I understand the ecosystem as a living thing."
*Target: The whole RN community, vendors, conference speakers*

**What exists after Bloom 3:**
```
Full Ecosystem Intelligence
â†’ ThoughtWorks radar visual (ADOPT/TRIAL/ASSESS/HOLD)
â†’ Gartner-inspired quadrant per category
â†’ Roadmap.sh-style learning paths
â†’ Ecosystem health trend over time
â†’ V1 readiness dashboard for whole ecosystem

Vendor Intelligence Dashboard
â†’ Expo, SWM, Callstack, Meta â€” direction feeds
â†’ Key person radar fully live
â†’ Conference radar (App.js, Chain React, RN EU)

DX Tools Map
â†’ Full tooling terrain mapped
â†’ IDEs, CLI, testing, debugging, build, AI tools
â†’ Same vitality signals as packages

Living Articles
â†’ "Best navigation packages for Expo 2026"
â†’ Live queries â€” never go stale
â†’ SEO distribution engine

ESLint Plugin
â†’ Lint-time package intelligence
â†’ CI/CD integration
```

**What the developer feels:**
"I don't need to follow 20 Twitter accounts and
read 5 newsletters anymore. The terrain comes to me."

**Success signal:**
Referenced by Expo, Callstack, or SWM in a blog post.
Used by a conference talk as a data source.
1000+ weekly digest subscribers.

---

# PART THREE â€” YOUR JOB AS FOUNDER

## What Only You Can Do

The agent writes code.
The agent does not make product decisions.
These are yours:

**1. The score weights**
How much does bus factor matter vs architectural safety?
How much does V1 readiness weight in 2026 vs 2027?
These are judgment calls. You make them.
Start with the weights in the blueprint. Adjust from real data.

**2. The verdict thresholds**
When does a package move from ASSESS to HOLD?
Is 180 days without a commit always HOLD?
What if it's a small, stable utility that doesn't need updates?
You decide the nuance. Agents don't feel nuance.

**3. The CÃ— profile design**
What questions do you ask a developer to build their profile?
How do you make it feel like orientation, not a form?
This is UX philosophy. Yours.

**4. The weekly digest curation**
What makes something worth surfacing this week?
The algorithm suggests. You tune it.
The digest should feel like a smart friend, not a feed.

**5. The key person list**
Who are the ~20 people whose signals matter most?
Start with the list in the blueprint. You'll feel who to add.

**6. What goes in Bloom 1 vs Bloom 2**
Scope creep will happen. The agent will build things
you didn't ask for. Your job is to hold the line.
Bloom 1 is the CLI + MCP. That is it.
Everything else waits.

---

## Your Decision Framework

When you're unsure about a feature, ask:

```
1. Which bloom does this belong to?
   â†’ If it's not Bloom 1, it waits.

2. Does it give the developer more powerful orientation?
   â†’ If no, cut it.

3. Does it break the "score is signal, breakdown is knowledge"
   philosophy?
   â†’ If yes, redesign it.

4. Does it require the developer to leave their workflow?
   â†’ If yes, reconsider. CLI and MCP first. Always.

5. Is this me building something I think is cool,
   or something a developer genuinely needs?
   â†’ Be honest. Both are valid but name which one it is.
```

---

## The Temptations to Resist

**Temptation 1 â€” The beautiful dashboard**
You will want to build a gorgeous web UI early.
Resist. CLI and MCP first. The web is Bloom 2.
A dashboard nobody reaches is worse than a CLI
tool that 10 developers use daily.

**Temptation 2 â€” Tracking everything**
You'll find another data source and want to add it.
The signal universe is already large.
Each new source is a maintenance cost forever.
Only add if it changes a verdict meaningfully.

**Temptation 3 â€” Perfect data before launch**
300 packages manually seeded is enough for Bloom 1.
Not 3000. Not perfect. Just enough to be useful.
Ship Bloom 1 ugly and real. Improve from feedback.

**Temptation 4 â€” Building for everyone**
RN developers first. Expo managed workflow first.
CÃ— filter exists because context matters.
But you need a primary user. Start with the developer
who uses Expo managed, cares about New Arch,
is solo or small team, and hates doing manual audits.
That developer is you. Build for you first.

---

## The Milestone That Matters Most

Before any other milestone â€” before 100 users,
before web launch, before VS Code extension â€”
there is one milestone that matters:

**The first time an agent prevents a bad install.**

The moment Claude Code calls `audit_package`,
gets back a HOLD verdict with a clear reason,
and suggests an alternative instead â€”
that is proof the nervous system is alive.

Everything else is decoration until that moment happens.

---

# PART FOUR â€” STACK DECISIONS

## What to Use and Why

```
Language:       TypeScript throughout
                Agents are best at it. Ecosystem is in it.
                No exceptions.

Database:       Supabase (Postgres)
                Free tier is generous.
                GitHub Education gives you more.
                SQL is readable and auditable.
                Row-level security for future multi-user.

Sync jobs:      Inngest (event-driven) or simple cron
                Start with cron. Move to Inngest when
                event-triggered speed matters (Bloom 2).

MCP:            @modelcontextprotocol/sdk (official)
                Stdio transport for local.
                HTTP transport for remote (Bloom 2 web).

CLI:            citty or cac (lightweight, Anthony Fu style)
                Terminal output: consola + chalk
                Aim for taze-level elegance.

Web (Bloom 2):  Next.js (App Router) + Tailwind
                ISR for package card pages (fresh daily).
                Agents handle this well.

Package:        Monorepo from day one
                packages/core     â€” the engine
                packages/cli      â€” the terminal adapter
                packages/mcp      â€” the agent adapter
                apps/web          â€” the web surface (Bloom 2)
                Tooling: pnpm workspaces
```

## What to Consume Directly (Don't Rebuild)

```
RN Directory API  reactnative.directory/api/libraries
                  Free. Public. Already has the baseline signals.
                  Call it. Cache it. Enrich it.

taze source       github.com/antfu-collective/taze (MIT)
                  Study the version resolution logic.
                  Import or adapt â€” don't rewrite.

bundle-visualizer github.com/callstack/react-native-bundle-visualizer
                  (MIT) â€” open source bundle size data.
                  Integrate as a signal source.

GitHub API        api.github.com
                  Authenticated. Free tier: 5000 req/hour.
                  GitHub Education may give you more.
                  This is your richest signal source.

npm registry API  registry.npmjs.org/:package
                  Free. No auth needed for public packages.
                  Download counts, version history, metadata.
```

---

# PART FIVE â€” THE NORTH STAR METRICS

## How You Know It's Working

**Bloom 1 health:**
- Daily active CLI users (target: 10 â†’ 50 â†’ 100)
- MCP calls per day (target: first 10 â†’ 100)
- Verdicts that changed a developer's decision
  (qualitative â€” ask in Discord/Twitter)

**Bloom 2 health:**
- Weekly digest open rate (target: >40%)
- Package card page organic search traffic
- VS Code extension installs

**Bloom 3 health:**
- Referenced by major RN vendors in content
- Used as data source by community
- Digest subscriber count (target: 1000+)

**The one metric that matters above all:**
*Did a developer make a better decision because of this?*

Ask people. Directly. Often.

---

# PART SIX â€” THE PERSONAL CONTEXT

## Why You Are the Right Person to Build This

You felt the friction firsthand.
Exploring Expo and RN packages â€” it was hard to analyze,
understand, orient. That friction is the product spec.

You have the conceptual frame (Conceptual Topology)
that gives this tool a permanent skeleton.
Most tools are built on vibes. This one is built on
invariant principles. That's the difference between
something that gets rebuilt every year and something
that compounds.

You're building in the agentic era with agents as hands.
That means a solo student at UoM can build what
previously required a funded team.

The CÃ— filter works in your favor:
- Free infrastructure (Supabase, GitHub Education)
- Agent-assisted development (Claude Code, Cursor)
- Deep domain knowledge (you've lived the problem)
- The blueprint already exists (this document)

The only thing left is to start.

---

*This document is your compass.*
*The terrain changes. The shape does not.*
*You know the shape.*



---

# PART SEVEN â€” RSS, CLUSTERS & HONEST SELF-ASSESSMENT

## RSS is Your Monitoring Backbone

You don't need to scrape the internet.
Almost every source you care about publishes RSS.
Expo blog, RN blog, SWM blog, Callstack blog,
GitHub releases, Reddit, YouTube channels â€” all RSS.

YouTube RSS specifically solves the problem you named:
seeing Expo Agent announced two months late.
Every YouTube channel has a feed at:
`youtube.com/feeds/videos.xml?channel_id=ID`
New video published â†’ your system knows within 15 minutes.
Title + description is enough signal for classification.
No API key. No scraping. Free.

The monitoring pipeline is mostly just:
poll RSS â†’ classify â†’ insert to event log â†’ trigger alerts.
Lightweight. Reliable. No rate limits.

## People Clusters â€” How to Think About Them

Don't track 20 individuals. Track 5 clusters.
Each cluster has a signal type and a weight.

When someone in the Meta/RN Core cluster posts
about Legacy Architecture removal â€” that's a tier-1
signal that affects every package with native code.
You don't need to know *who* in the cluster said it.
You need to know *which cluster* and *what they said*.

New people join by cluster assignment, not by individual
weight negotiation. If someone new becomes influential
in the Expo ecosystem, they join the Expo cluster.
Simple. Scalable.

The clusters:
- RN Core (Meta) â€” architecture + V1 direction
- Expo â€” managed workflow + SDK + agent
- Software Mansion â€” animation + gesture + Radon
- Callstack â€” enterprise + bundle + performance
- Independent Innovators â€” emerging patterns + L4 signals

## Your Own Bus Factor is 1 â€” Own It

The tool that warns developers about Bus Factor = 1 packages
is itself a Bus Factor = 1 project at launch.

This is not a flaw to hide. It is a truth to publish.

Put your own VitalityCard on the website.
Show the honest score. Show the Bus Factor = 1.
Show the Lindy Age = 0 months at launch.
Show how the score will improve as Blooms ship
and contributors join.

This is the most powerful trust signal you can give.
No other tool in this space does this.
It says: we apply our own framework to ourselves.
We have nothing to hide.
We believe in what we built enough to be judged by it.

## The Competitive Landscape â€” Your Real Position

The sites that do adjacent things (npmtrends, moiva,
reactnative.directory, reactscript) are all doing
one or two signals from your full L1.
None synthesize. None go RN-deep. None have agents.
None have the push layer. None have the event log.

The real risks aren't those sites.
The real risks are Expo, Software Mansion,
or Callstack building this for their own ecosystem.

Your defense is a single word: neutrality.

You have no vendor allegiance.
You will surface a Callstack package over an Expo one
if the vitality score says so.
Expo won't do that. SWM won't do that.
Callstack won't do that.

Only you will. And developers will trust you for it.

The event log is your compounding moat.
Every day you run, you accumulate ecosystem history
a new entrant cannot recreate.
Lindy is earned, not purchased.

Start Bloom 1. The clock starts then.



---

# PART EIGHT â€” THE EXPERT THINKING PRINCIPLE

## The Deepest Form of Developer Empowerment

The difference between a junior and senior developer
evaluating a package is not access to information.
It is knowing which questions to ask.

A senior developer asks:
- What is the thread model? (not just "is it fast")
- What breaks if I pair this with X?
- What is the cascade risk if this breaks?
- What does performance look like at scale?
- Is the capability ceiling high enough for where
  this app is going in 12 months?

A junior developer asks:
- Does it work?
- How many stars does it have?

RN Terrain bridges this gap by asking the expert
questions automatically â€” and surfacing the answers
at the right disclosure layer.

The developer who has never thought to ask
"what is the thread model" gets that signal
because the tool considers it on their behalf.
They don't just get better data.
They get a better mental model of what matters.

That is the product's deepest value.
Not the score. Not the breakdown.
The implicit education in what the tool measures.

**This principle should guide every feature decision:**
Does this feature teach a developer to think
more like an expert about the ecosystem?
If yes â†’ build it.
If it just adds data without adding insight â†’ reconsider.

---

## The Progressive Disclosure Principle

Information overload is as harmful as information absence.

The same package card serves five different intents.
A developer browsing a list of alternatives needs 2 seconds.
A developer about to commit to a package in production
needs 2 minutes. Serving both with the same amount of
information fails both.

Progressive disclosure is the permanent design principle:

```
Default:   Layer 1 â€” enough to decide quickly
On demand: Layer 2 â€” enough to decide carefully
On demand: Layer 3 â€” everything, sourced, complete
Always:    Layer 4 â€” raw JSON for machines and experts
```

**The rule for every new feature:**
What layer does this information belong to?
If it belongs at Layer 3, it must never appear at Layer 1.
If it belongs at Layer 1, it must be in the terminal
default output, the MCP response, and the VS Code hover.

Never flood. Never hide. Disclose progressively.

---

## The WASM Nuance Principle

Technical nuance is not noise. It is the signal.

WASM available in Hermes V1 â€” true.
WASM performant without thread consideration â€” false.

A package can have WASM compiled code and still
block the JS thread entirely, providing zero performance
benefit over pure JS while adding bundle cost.

The same package using RN Worklets 8.0+ shareables
to offload WASM computation to a separate thread â€”
completely different capability profile.

Same binary. Same package. Completely different verdict
depending on thread model.

This is the kind of nuance that:
- Doesn't appear in any current tool
- Separates expert from non-expert evaluation
- Changes real decisions in production apps
- Is exactly what RN Terrain exists to surface

**The principle:** When a technology has a nuanced
story (WASM, New Architecture, JSI, multithreading)
â€” capture the nuance explicitly in the schema.
Never collapse it to a boolean.

WASM: true/false is a boolean.
WASM thread model: a first-class signal.

---

## The Compatibility Matrix Principle

Positive compatibility is as important as conflict detection.

Most tools only track what breaks together.
Developers also need to know what composes together.

A developer's question at Gate 2 is not just:
"Does this conflict with anything I have?"
It is also:
"Does this work well with what I already have?"

Both are first-class questions.
Both deserve first-class signals.

The compatibility matrix answers the second question.
It is populated with the same evidence tiers as
everything else â€” official, maintainer confirmed,
community confirmed, untested, incompatible.

Untested is the honest default.
Absence of incompatibility reports â‰  compatible.
This integrity rule never bends.



---

# PART NINE â€” THE HUMAN LAYER

## On Marak, Aaron Swartz, and Why This Matters

Marak Squires built two packages used billions of times.
Fortune 500 companies extracted that value freely.
He asked for a six-figure contract or a fork.
Nobody responded. He broke his own tools.
GitHub suspended him. The README asked:
"What really happened with Aaron Swartz?"

Aaron Swartz built RSS at 14, co-founded Reddit,
gave everything to the commons, faced federal prosecution
for downloading academic papers, died at 26.

The open source sustainability crisis is not abstract.
It is the human cost underneath every Bus Factor = 1
package in your vitality score. It is what happens
when the gap between effort and recognition becomes
unbearable. It happens quietly, then suddenly.

RN Terrain is the first package tool that names this
explicitly and does something about it.

## The Appreciation Layer Is First-Class

Not a footer. Not a nice-to-have.
The appreciation CTA for unfunded solo maintainers
sits prominently on every VitalityCard where it applies.

"The syntropic energy behind this package
 deserves to be seen."

That line stays. It is the tool's most human sentence.

## You Might Become Marak One Day

You said this yourself. Honestly. Clearly.
INFJ 4w5 anxious avoidant building alone â€”
the entanglement of the work and the wound
is real and it is a design constraint.

So RN Terrain's own sustainability is designed in
from day one. Not as an afterthought. Not after
burnout arrives. Now.

GitHub Sponsors on launch day.
Your own VitalityCard published with Bus Factor = 1 shown.
The integrity dashboard showing your Lindy growing.
The weekly digest building community around the tool.

The Marak scenario starts with isolation.
Design against isolation from the beginning.

## The Gratitude Infrastructure

Every package that appreciates a maintainer
through RN Terrain's CTA is a small act of
syntropy against the entropy of the ecosystem.

Even one developer stopping to say
"your work matters" to a solo maintainer â€”
that changes something. It changes the calculus
that broke Marak. It is not naive. It is necessary.

Build it in. Keep it there. Never remove it
in the name of "clean design" or "minimal UI."
The human layer is not decoration.
It is the reason this tool is different from all others.

---

# PART TEN â€” THE SYMBOL SYSTEM PRINCIPLE

## Symbols Are a Language, Not Decoration

The symbol system is not about making the CLI pretty.
It is about maximum orientation in minimum space.

A developer running `npx rn-eval scan` on 23 packages
needs to scan a list and immediately know:
- Which packages need attention
- Which maintainers need support
- Which packages are architecturally sound
- Which are V1 ready

Symbols compress all of this into a glanceable line.

```
âœ“89 ðŸ—âš¡ðŸ’›  react-native-reanimated
âœ—12 âš™ï¸ðŸ’€ðŸ†˜  react-native-camera
â—Ž62 ðŸ¦€âš¡     mopro-ffi
```

Three lines. An expert developer reads this in 2 seconds.
A junior developer sees the same signal and asks:
"What does ðŸ†˜ mean?" â€” and learns what to ask about.

The symbols teach expert thinking by being present.
That is the deepest form of progressive disclosure:
the symbol exists at Layer 0, the explanation at Layer 2.

## Symbols for Human Signals Matter Most

The architecture symbols (ðŸ— ðŸ¦€ ðŸŒ‰) tell you about code.
The human symbols (ðŸ’› ðŸ‘¤ ðŸ†˜ â¤ï¸â€ðŸ”¥) tell you about people.

Both are first-class. Neither is decoration.

A package with ðŸ†˜ is not just a technical risk.
It is a human situation that deserves acknowledgment.
The tool makes that visible by giving it a symbol
at the same level as the architecture signals.

This is what makes RN Terrain different from Snyk,
Bundlephobia, npm trends, or any other package tool.
They see code. We see people behind the code too.


