---
title: "Harness & Affordances Forensic Audit and Remediation Architecture Spec"
status: "active"
date: "2026-10-09"
author: "Naveen & Antigravity"
tags: [harness-engineering, agent-affordances, forensic-audit, workflows, agents-md, remediation-spec]
---

# Harness & Affordances Forensic Audit and Remediation Architecture Spec

## 1. Forensic Investigation: The Disappearance & Recovery of `AGENTS.md`

### 1.1 The Anomaly
In commit [`146fa2fdb`](file:///c:/x) (*"chore: checkpoint deep linking, autonomous architecture docs, onboarding client, and harness updates"*), the primary repository policy file [`AGENTS.md`](file:///c:/x/AGENTS.md) was deleted from the workspace root alongside a corrupted glyph filename `"\357\201\234"`.

### 1.2 The Root Cause & Forensic Timeline
By excavating the local agent session transcripts in the brain store (`~/.gemini/antigravity-ide/brain/`), the sequence of events was reconstructed:

1. **Session `4fd37bb4-4168-47a8-836e-8e4cd2f6df54` (Oct 8, ~19:40 IST):**
   - The user and agent collaboratively refactored `AGENTS.md` from a legacy 558-line monolith into a modular, 231-line policy document.
   - Rule 5 (*Source-Code Grounding Over Memory*) and Rule 12 (*No memory-hallucinated API replacements*) were added at step 1566.
   - At step 1683, `git status` clearly showed `M AGENTS.md` (modified, tracked, and intact).
2. **The Glyph Renaming Incident (~19:42 IST):**
   - Between the end of session `4fd37bb4` and session `b75ef70d`, an external editor or shell glitch generated a stray Unicode character `\uF05C` (represented in UTF-8 octal as `\357\201\234`).
   - `git` interpreted this as `D AGENTS.md` and an untracked/staged artifact.
3. **Session `b75ef70d-253c-4014-a220-fb09e97300fa` (Oct 8, ~19:44 IST):**
   - The session booted with `D AGENTS.md` already present in `git status`.
   - The agent read all 231 lines of `c:\x\AGENTS.md` at step 33 and step 35 into memory.
4. **Session `da8dc177-e5c4-4233-b050-ddfcabf03fae` & Commit `146fa2fdb`:**
   - A batch staging command (`git add .` or `git add -A`) was run across 116 files.
   - Because `AGENTS.md` was flagged as `D`, the deletion was swept into the checkpoint commit unprompted.

### 1.3 Recovery Status: 100% Intact
The complete 231-line `AGENTS.md` text was extracted verbatim from steps 33 and 35 of transcript `b75ef70d-253c-4014-a220-fb09e97300fa` and has been restored to [`c:\x\AGENTS.md`](file:///c:/x/AGENTS.md).

---

## 2. Audit of Outdated Workflows & Harness Artifacts

While the architecture doctrine progressed into 2026 concepts (Tri-Modal operation, Substrate/Harness/Reasoner decoupling), the actual workflow files in [`.agents/workflows/`](file:///c:/x/.agents/workflows) remained frozen in legacy paradigms.

### 2.1 The Issues with [`.agents/workflows/code-execution.md`](file:///c:/x/.agents/workflows/code-execution.md)
* **The "Halt-on-Everything" Bottleneck:**
  Line 5 enforces: `CRITICAL RULE: YOU ARE FORBIDDEN FROM WRITING OR MODIFYING ANY IMPLEMENTATION CODE UNTIL A PLAN IS APPROVED.`
  This creates severe friction for fast iterative coding, simple bugfixes, and autonomous agent tasks.
* **Philosophical Obsolescence:**
  References early "Resonance Engineering" and obsolete files (`TAIL_FIN.md`, `AGENT_RESONANCE.md`, `gurudevi-design-retina.md`) rather than the active `@repo/ui/tokens`, `@repo/core`, and Expo 58 / Next.js 16 architecture.
* **Token Hardcoding:**
  Instructs agents on raw hex strings (`#F5EDD6`, `#D4843A`) in the text, which directly encourages agents to output hardcoded hexes rather than importing design tokens.

### 2.2 The Issues with [`.agents/workflows/sovereign-quality-gate.md`](file:///c:/x/.agents/workflows/sovereign-quality-gate.md)
* **The Fiction vs. Velocity Reality:**
  The doc claims that `sovereign_maintenance(checkpoint)` strictly executes the Surgical Sentinel (TSC + Biome + ESLint). In reality, the user and harness intentionally prioritize **developer velocity over accuracy** during rapid iterations by utilizing `--no-verify`.
* **Dogmatic Refusal Protocol:**
  The "Senior Refusal Protocol" mandates flat rejection of user requests if certain arbitrary rules are met, causing conversational gridlock instead of constructive alternatives.

---

## 3. Remediation Blueprint: Where Treatment is Needed & What Shape It Takes

The remediation does not require inventing more tools. It requires **streamlining the harness into two explicit operational tracks** and updating the workflows to reflect modern practice.

### Track A: The Dual-Loop Velocity & Verification Model
* **The Inner Loop (Velocity First - Unblocked):**
  - Staging and committing code must remain lightweight and fast.
  - Using `--no-verify` locally during active flow is an intentional design choice for rapid iteration.
  - Commits capture atomic checkpoints without triggering a 2-minute lint gauntlet on every save.
* **The Outer Loop (Verification Asynchronous / On-Demand):**
  - Verification is run on-demand or pre-push using lightweight scanners:
    - [`node scripts/audit-4-pillars.mjs`](file:///c:/x/scripts/audit-4-pillars.mjs) (complete monorepo health scan in 2s).
    - `pnpm run check:anti-slop` / `pnpm run check:version-drift`.
  - Type integrity is proved via targeted package checks (`scripts/surgical-check.mjs`) rather than repo-wide blocking gates.

### Track B: Modernization of `code-execution.md`
* **Target Treatment:**
  Transform `code-execution.md` from a rigid pre-compilation questionnaire into a **Tri-Modal Dispatcher**:
  1. **Vibe Mode (Spike/Prototype):** Unblocked. Immediate code execution. No formal plan approval required.
  2. **Implement Mode (Feature/Contract):** Lightweight spec outline (invariants + files touched) -> direct implementation.
  3. **Maintain Mode (Code >3k lines):** Impact check + Deletion Veto -> minimal additive patch.
* **Integration Points:**
  - Embed the **Cognitive Order of Operations** (Terrain -> Architecture -> Existing Terms -> Minimal Seam -> Verify).
  - Explicitly route design decisions to `@repo/ui/tokens` instead of quoting raw hex codes.

### Track C: Modernization of `sovereign-quality-gate.md`
* **Target Treatment:**
  - Update the commit protocol to document the **Velocity Track (`--no-verify`)** as the standard flow for iterative checkpoints.
  - Reserve comprehensive quality gates (Full Sentinel) for milestone boundaries, release candidates, and PR creation.
  - Replace dogmatic refusal protocols with constructive architectural migration patterns.

### Track D: Tool & Script Consolidation
* **Target Treatment:**
  - Group the 40+ ad-hoc healing scripts in `scripts/` into a secondary maintenance namespace or archive.
  - Keep `audit-4-pillars.mjs` and package-scoped checks as the primary diagnostic affordances.
