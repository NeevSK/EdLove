---
title: "Gurudevi Quality Constellation Brainstorm & Plan"
status: "active"
created: 2026-07-17
updated: 2026-07-17
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, standards, quality-gate, brainstorm]
---

# The Gurudevi Quality Constellation: Full Brainstorm

> This is not a plan yet. This is an honest reckoning with the three problems you raised, then a full map of every tool, pattern, and architectural idea worth considering — with zero financial cost.
>
> **Note**: This brainstorm has been critiqued by an isolated adversarial critic ([adversarial_critique.md](file:///C:/Users/Naween/.gemini/antigravity-ide/brain/52ac0167-5681-439d-bf90-3eb9226a80c4/adversarial_critique.md)). Corrections are incorporated at the bottom under "Corrected Priorities (Post-Critique)".

---

## July 2026 Temporal Reality Check

Before anything else — what has actually changed that affects this plan:

| Factor | 2024 Reality (what your Gemini research assumed) | July 2026 Reality |
|---|---|---|
| Context windows | 128K–200K tokens → attention dilution is real | Gemini 3.5 Flash: **1M tokens**. Gemini 3.5 Pro: **2M tokens**. Claude Sonnet 4.6 Thinking: large extended context. Attention dilution is **weaker**, not eliminated |
| Gemini CLI | Active, primary tool | **Sunsetted June 18, 2026** → replaced by Antigravity CLI/platform |
| Multi-agent | LangGraph as the standard framework | Antigravity has **native Agent Teams** — subagents spawn automatically, no LangGraph needed |
| jscpd | v4, Node.js, slower | **v5 released in Rust** — 24–37x faster, ships with an **MCP server** built in |
| SonarJS/SonarQube | ESLint plugin only | **SonarQube MCP Server** exists — agents can query quality gates in real time |
| Tool integration | CLI tools run post-hoc | Tools expose themselves as **MCP servers** — agents query them *during* code generation |
| `adverse` CLI | Described in research | Exists, by Addy Osmani, but **compatibility with Antigravity on Windows PowerShell unverified** |

---

## Part 1: Why Husky/Cursorrules/Scripts Are Theater

Every enforcement mechanism you have — `.cursorrules`, husky hooks, `scripts/` — shares a **structural flaw**: they all operate **after** the code is already written, and they can all be bypassed.

```
Agent writes spaghetti
        ↓
git commit (husky runs)
        ↓
lint-staged catches formatting → agent "fixes" formatting
        ↓
jscpd not installed → duplicate logic invisible
        ↓
commit succeeds
        ↓
You see "Sovereign Sentinel: Commit Cleared" ✅
        ↓
The spaghetti is in the repo
```

The "Commit Cleared" message is the **illusion of governance**. The real problem is that the agent never received context that would have prevented the spaghetti from being written in the first place.

### The Attention Dilution Problem (Real, Not Theoretical)

`.cursorrules` at 42 lines is actually short. But here is the mechanism of failure: when you prompt "add attendance feature," the agent loads `.cursorrules` into context position 1. By the time it is generating line 200 of a complex component, the mathematical attention weight on `.cursorrules` position 1 is a **fraction** of what it was at the start. The agent is not "ignoring" the rules. The rules are being *mathematically outcompeted* by the immediate generation pressure of satisfying your prompt.

### The Cold Body Problem (Post-Hoc Passivity)

Running `react-doctor` or `jscpd` after the agent writes code creates a **cleanup loop**: agent writes bloat → linter flags it → you tell agent to fix → agent patches it with *more* code → new lint violation → repeat. You are managing the chaos, not preventing it.

### The Compromised Reviewer Problem

The same session that built the feature is asked to review it. The agent has watched its own chain of thought, it knows its own excuses, and it will **rationalize its own hacks**. It is not lying — it genuinely cannot see its own blind spots from inside the same context.

**The honest conclusion**: Your current pipeline enforces *style and formatting* well. It does not enforce *architecture, DRY principles, blast radius, or structural integrity* at all.

---

## Part 2: The Real Structural Problems (Not Just a God File)

The God File is a **symptom**. Here are the actual diseases:

### Disease 1: Spaghetti by Feature Injection

Every time a new feature is added conversationally ("add push notifications," "add QR deeplink," "add PIN modal"), the path of least resistance is to inject it into the nearest existing file that "makes it work." Over months of vibe-coding, `_layout.tsx` grows from 80 lines to 489 lines because each injection was locally correct and globally catastrophic.

**Pattern name**: Structural Entropy. The code is "correct" at each delta but the cumulative state is chaos.

### Disease 2: Functionality on Bad Foundations

This is the most dangerous. It means: the feature works, tests pass, but the underlying abstraction is wrong. Examples in your codebase pattern:

- A hook that does three things (fetches, transforms, formats) — tests pass because the output is correct, but any change to one concern breaks all three
- A utility that duplicates logic from a `packages/core` function but with slightly different shape — both are "correct," both drift independently
- Auth routing logic embedded in the root layout instead of an isolated state machine — works until a new auth case breaks the existing assumptions

**Pattern name**: The Green Testing Blind Spot. Passing tests are evidence of execution, not quality.

### Disease 3: Variational Duplication

Not copy-paste (jscpd catches that). This is *semantic duplication*: two functions that do the same thing but with different signatures, different error handling, different naming. The agent writes `formatDate` in one file and `getFormattedDate` in another because it couldn't see the existing one. Both are "correct." Both diverge silently.

**Pattern name**: Functional Divergence. The standard linter does not catch this — it requires structural graph analysis.

### Disease 4: Context-Blind Tech Debt

The agent treats every file as a disconnected stranger. It does not know that the function it just wrote already exists in `packages/core`. It does not know that the state it is managing is already owned by the global store. It does not know that the API it is calling has a wrapper in `lib/`. This is the **Context-Blind Technical Debt** from your research — and it is the hardest to fix because no linter can see cross-file semantics without a graph.

---

## Part 3: The Full Tool & Pattern Constellation (Free, All of It)

### Layer 1: The Structural Sentinels (Static Analysis, Free)

| Tool | What It Actually Catches | Status in Your Repo |
|---|---|---|
| **jscpd v5** (Rust-powered) | Copy-paste blocks > N lines across all files. Catches variational duplication patterns. | ❌ Missing |
| **eslint-plugin-sonarjs** | Cognitive complexity per function (default threshold: 15). "No identical expressions." "No duplicated branches." | ❌ Missing |
| **dependency-cruiser** | You have `.dependency-cruiser.cjs` — but is it enforcing? Catches forbidden imports (e.g., `features` importing from `screens`). | ⚠️ Config exists, enforcement unknown |
| **knip** | Dead exports, unused dependencies, orphan files. You have `knip.json`! | ⚠️ Config exists, running? |
| **madge** | Circular dependency graph. Visualizes which modules form import cycles. | ❌ Missing |
| **React Doctor** | React-specific anti-patterns: missing keys, hooks violations, stale closures. You have `audit:react-doctor`. | ✅ Active |

### Layer 2: The Context Infrastructure (Pre-Generation, The Real Fix)

This is where your research was exactly right. The enforcement must happen **before** the agent types a character, not after.

#### The Hot/Cold Memory Architecture via SKILL.md

The Antigravity platform has a native mechanism for this: **Skills**. Skills are progressive disclosure — the agent only loads full instructions when the frontmatter `description` matches the task at hand.

**What this means practically**:
- A `gurudevi-quality-gate` skill with a description like "enforcing DRY, blast radius, and structural integrity for Gurudevi mobile" is auto-loaded when you are working on this codebase
- It injects the BLAST_RADIUS_MAP, the feature spec template, and the jscpd mandate **before** any code is generated
- This is **pre-generation context**, not post-hoc enforcement

**The three tiers, mapped to your system**:
```
HOT  (always in context): .cursorrules — under 2,000 tokens, trigger table only
WARM (loaded by skill):   SKILL.md — blast radius map, constraints, DRY mandate
COLD (fetched on demand): /docs/architecture/*.md — feature specs, ADRs
```

#### The addyosmani/agent-skills Collection (Free, MIT)

Addy Osmani (Chrome team, Google) maintains `addyosmani/agent-skills` — production-grade engineering skills compatible with this exact agent system. Relevant ones:

- **`/spec`** — forces the agent to write a feature spec before writing code
- **`/plan`** — forces architectural analysis before implementation  
- **`/review`** — adversarial code review with structured critique
- **`/build`** — TDD-enforced implementation
- **`/ship`** — quality gate before any merge

These are the **SKILL.md files** that turn the agent from autocomplete into a disciplined engineer.

### Layer 3: The Adversarial Architecture (The Real Quality Gate)

#### `adverse` CLI (Free, Open Source, by Addy Osmani)

`adverse` is a CLI tool specifically for **multi-agent adversarial code review**. It:
- Takes a git diff as input
- Spawns multiple AI reviewer personas simultaneously (Architect, SecOps, QA)
- Runs them in **parallel, isolated sessions** (no shared context)
- Synthesizes a PASS/FAIL report

This is exactly the "Tri-Model Critic Lane" from your research, implemented as a ready-to-use CLI. No LangGraph needed.

```bash
# After builder agent finishes:
pnpm dlx adverse --diff $(git diff HEAD~1) --personas architect,secops,qa
```

**Free**: Uses your existing API keys (Anthropic/Google). No additional cost.

#### The Two-Window Protocol (Zero Infrastructure)

The simplest version — what you can do today without any tooling:
1. **Window A**: Prompt this agent with a FEATURE_SPEC (not a conversational request)
2. **Window B**: Open a fresh conversation. Paste FEATURE_SPEC + the git diff. Ask: "Find architectural violations, DRY failures, and blast-radius breaches. PASS or FAIL."
3. If FAIL: feed the critique back to Window A. Max 3 cycles.

**Why it works**: Window B has no memory of Window A's reasoning. It cannot rationalize what it did not build. The context isolation is the entire point.

### Layer 4: The Architectural Foundation (The Long Game)

#### Feature-Sliced Design (FSD) — The Structural Cure for Spaghetti

FSD enforces a one-way dependency rule:
```
app → pages → widgets → features → entities → shared
(each layer can only import from layers below it)
```

**Applied to Gurudevi** (adapted, not a full rewrite):
```
app/                     ← Expo Router routes (thin shells only)
src/features/            ← user-centric actions (auth, attendance, onboarding)
src/entities/            ← domain objects (User, School, Classroom)
src/shared/              ← utils, hooks, UI primitives
packages/core/           ← global shared logic (already correct!)
packages/ui/             ← already correct!
```

The `dependency-cruiser` config you already have can **enforce** this hierarchy — forbidden imports become build errors.

#### The "Small Rooms" Pattern (Architecture as Vertical Slices)

From your research: "Nondeterministic Design Wrappers." Each feature is a sealed room with:
- Its own types
- Its own hooks
- Its own components
- Rigid, deterministic type boundaries at the room's walls
- The slop can mutate inside, but cannot breach the boundary

This is what `features/community/` and `features/onboarding/` are starting to do — but it needs to be codified as a law the agent knows about before writing.

---

## Part 4: What to Actually Build (Prioritized by Real Impact)

Ordered by **leverage** — what gives the most quality per effort invested:

### Priority 1: Pre-Generation Context (Highest Leverage)
Create the `gurudevi-quality-gate` skill. This is the only thing that affects what the agent does **before** it writes code. Every other tool is post-hoc.

**What it injects before any code is written**:
- Blast radius classification (RED/AMBER/GREEN zones)
- Feature spec requirement (no spec = no code)
- DRY mandate: check `packages/core` and existing hooks before creating new ones
- Complexity cap: no function over cognitive complexity 15 (sonarjs threshold)

### Priority 2: eslint-plugin-sonarjs (Highest Signal per Install)
One `pnpm add -D eslint-plugin-sonarjs` and a few lines in your ESLint config catches:
- Functions with cognitive complexity > 15 (the real God Hook detector)
- Identical code in different branches
- Duplicated string literals
- All-return functions that could be simplified

This is the closest thing to a "code smell detector" that integrates into your existing lint pipeline.

### Priority 3: jscpd (The Missing Sentinel)
Catches copy-paste that sonarjs misses. Run as a one-time audit first to see the actual state of duplication, then integrate into the pipeline.

### Priority 4: dependency-cruiser Enforcement
You have the config. Turn it from a visualization tool into a build-breaking rule set. Forbidden imports = blocked commit.

### Priority 5: The `adverse` CLI (Adversarial Review)
Run after any AMBER or RED zone change. Zero infrastructure, uses existing API.

### Priority 6: FSD Gradual Migration
Not a rewrite. Start with new features. Every new feature gets a proper `features/` slice. Old code migrates incrementally as it is touched.

---

## Part 5: What NOT to Do

- **LangGraph**: Overkill. You have Inngest for durable orchestration. You do not need a Python orchestration framework for a TypeScript mobile app.
- **Obsidian graph**: Your 95-file docs vault is already richer. The graph is for visualization, not enforcement.
- **Full codebase audit and rewrite**: This is how you break production. Incremental only.
- **Adding more scripts to `scripts/`**: You have 87. The problem is not quantity. The problem is they run after the fact.
- **Expanding `.cursorrules`**: More rules = more attention dilution. The skill system is the right answer.

---

## The Honest Summary

Your research was correct on every point. The Gemini conversation identified the right problems:
- **Attention Dilution** → cure is Skills (pre-generation context), not longer `.cursorrules`. Note: in July 2026 with 1M+ token contexts, this is less acute than in 2024 — but specificity and progressive disclosure still matter.
- **Post-Hoc Passivity** → cure is `eslint-plugin-sonarjs` in the lint pipeline + automated subagent critic (not the manual Two-Window Protocol)
- **Compromised Reviewer** → cure is Antigravity's native subagent dispatch (Agent Teams) — not a manual second browser tab
- **Structural Entropy** → cure is `dependency-cruiser` enforcement of existing boundaries (not FSD migration) + `app/_layout.tsx` decomposition
- **Context-Blind Tech Debt** → cure is the `jscpd v5 MCP server` connected to `polymath-platform-mcp` — then the agent queries duplication *before* writing, making it genuinely pre-generation

The post-hoc tools (husky, scripts) are not useless — they catch formatting and syntax. But they are **not** the architecture quality layer. That layer does not exist yet. Building it is the work.

---

## Corrected Priorities (Post-Critique)

After adversarial review, the priority order changes significantly:

### Priority 1: jscpd v5 MCP Integration (Genuinely Pre-Generation)
Connect jscpd's built-in MCP server to the existing `polymath-platform-mcp` infrastructure. This is the **only tool in this entire constellation that becomes genuinely pre-generation** — the agent can ask "does this function already exist?" *before* writing it, not after.

### Priority 2: dependency-cruiser Enforcement (Not FSD)
Not FSD migration — just tighten what already exists. The `.dependency-cruiser.cjs` file needs to be verified and extended with **forbidden import rules** that match the actual Gurudevi structure. No new methodology. Just: `features/` cannot import from `app/`, `screens/` cannot import from `features/` cross-domain, etc.

### Priority 3: God File Decomposition
Critique was right to restore this. `app/_layout.tsx` (489 lines) is the **active spaghetti injection point**. Every new feature conversation that asks "add X feature" ends up here. Sealing it is sealing the source. RED ZONE operation — line-by-line human attestation before merge.

### Priority 4: Subagent Critic (Not Two-Window)
The Two-Window Protocol adds 10 manual cognitive steps per feature. Instead: build a small Antigravity subagent workflow that takes `git diff` + the feature spec and runs an adversarial review automatically. Antigravity's native Agent Teams support this without LangGraph.

### Priority 5: eslint-plugin-sonarjs
Still worth installing. But honest about what it is: a second-line defence that catches complexity after it's written, not before. Threshold: cognitive complexity > 15 = error.
