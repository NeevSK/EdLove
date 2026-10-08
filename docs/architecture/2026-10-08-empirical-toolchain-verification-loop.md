---
title: "Empirical Toolchain Verification Loop: Dynamic Introspection and Pre-Completion Diff Engineering"
status: "active"
date: "2026-10-08"
author: "Naveen & Antigravity"
tags: [architecture, verification-engineering, diff-analysis, cognitive-loops, hostile-reviewer]
---

# Empirical Toolchain Verification Loop: Dynamic Introspection and Pre-Completion Diff Engineering

## 1. Generator $\ne$ Verifier

The defining principle of modern agentic engineering is that **a generative model cannot verify its own output without an empirical execution step**. 

When an agent generates code, it is acting as a probabilistic synthesizer. To be robust, the agent must be bound by a hostile verification loop that treats its own generated output with skepticism.

---

## 2. Dynamic Contract Introspection (Zero Guesswork)

Agents frequently hallucinate CLI arguments, configuration schemas, and flags because they guess based on syntax patterns.

### The Introspection Rule
Before calling or configuring any tool:
1. **Discover Binary Entrypoints**:
   ```bash
   npm view <pkg> bin
   ```
2. **Extract Machine-Readable Contracts**:
   ```bash
   npx <pkg> --help
   npx <pkg> --json
   ```
3. **Verify Type Contracts**:
   Jump to definition in `.d.ts` or parse exports rather than assuming method signatures.

---

## 3. The Devin Closed-Loop Verification State Machine

Rather than linear "think $\rightarrow$ write code $\rightarrow$ claim done", the agent operates in an autonomous empirical loop:

```
                       ┌────────────────────────────────────────────────────────┐
                       │          1. HYPOTHESIS & MINIMAL SPIKE                 │
                       │   Propose minimal change bounded to blast radius       │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │          2. EMPIRICAL EXECUTION GATE                   │
                       │   Run compiler, typechecker, or test suite:            │
                       │   `check-types`, `pnpm run check:anti-slop`, `smoke`   │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                                 ┌─────────────────┴─────────────────┐
                          FAIL (Exit != 0)                    PASS (Exit 0)
                                 │                                   │
                                 ▼                                   ▼
                       ┌──────────────────┐                ┌──────────────────┐
                       │ 3. TRACE REPAIR  │                │ 4. DIFF AUDIT    │
                       │ Feed compiler    │                │ Run `git diff`   │
                       │ error traceback  │                │ Inspect every    │
                       │ into targeted fix│                │ deleted line (-) │
                       └────────┬─────────┘                └────────┬─────────┘
                                │                                   │
                                └─────────────── Loop ──────────────┘
```

---

## 4. Mandatory Pre-Completion Diff Analysis

The fatal trap of AI code modification is **silent deletion**: an agent rewrites a function or file, inadvertently removing fallbacks, error handling, security checks, or operational rules.

### The Deletion Veto Protocol
Before declaring any task complete or committing changes:
1. **Execute `git diff`**: Never trust the internal mental model of what was written; inspect the raw unified diff output.
2. **Read Deletions First**: Audit every line prefixed with `-`.
   - Was a guard removed?
   - Was a fallback swallowed?
   - Was a documented rule lost?
3. **The Non-Negotiable Gate**:
   Every removed line of working code must either:
   - (a) Be fully preserved in an extracted domain skill or substrate document, or
   - (b) Receive explicit, documented user sign-off via the Deletion Veto protocol.
