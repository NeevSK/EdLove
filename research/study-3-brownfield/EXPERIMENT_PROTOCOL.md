# Experiment Protocol & Governance Matrix (Phases 3, 4, 5)

**Study:** Study 3 — Longitudinal Brownfield Evolution  
**Subsystem:** Offline Permission Evaluation & Authorization Snapshot Verification  
**Repository Target:** `EdLove` (`c:\x`)  
**Baseline Anchor:** Commit `252bec65f746c362fec12472999cccfba187d0b9`  

---

## 1. Experimental Controls & Worktree Isolation (Phase 3)

To ensure scientific repeatability and prevent contamination across experimental runs:

1. **Immutable Baseline Anchor:**
   All experimental branches branch strictly from `252bec65f746c362fec12472999cccfba187d0b9`.
2. **Worktree Directory Structure:**
   Each condition and evolution step operates in an isolated worktree created via:
   ```bash
   git worktree add -b exp/<condition>/<step> .worktrees/<condition>-<step> 252bec65f746c362fec12472999cccfba187d0b9
   ```
   *Rule:* The primary repository working directory is NEVER modified directly during the trials.
3. **Pre-Implementation Acceptance Tests:**
   For each evolution step ($E_1$ through $E_4$), independent behavioral acceptance tests must be committed to an isolated test path (`research/study-3-brownfield/acceptance-tests/`) *before* the implementation agent begins.
   *Rule:* The implementation agent is strictly forbidden from editing or redefining the acceptance test suite.

---

## 2. Experimental Conditions (Phase 4)

Four equivalent conditions will be executed sequentially through steps $E_1 \rightarrow E_4$:

| Condition ID | Description | Tooling & Constraints Provided to Agent |
| :--- | :--- | :--- |
| **Condition A** | **Conventional Coding Agent** | Base LLM with file read/edit and test execution tools. Zero custom linters, zero anti-slop rules, zero mandatory pre-commit gates. |
| **Condition B** | **Agent + Deterministic Verification** | Condition A tools + mandatory execution of `check-authorization-parity.mjs`, `check:anti-slop`, `check-types`, and all Vitest unit suites before completion claims. |
| **Condition C** | **Agent + Selective Impact Verification** | Condition A tools + selective, impact-based testing using the monorepo AST dependency graph (`sovereign_discovery(action: "simulate")` and scoped package test runs). |
| **Condition D** | **Human-Led Development Reference** | Experienced human engineer implementing the sequence using standard pair-programming idioms, recorded as the comparative benchmark. |

*Protocol Invariant:* All conditions receive identical task prompts, identical starting commits, and identical acceptance criteria.

---

## 3. Measurement Matrix & Metrics (Phase 5)

For each step ($E_i$) under each condition ($C_j$), the following metrics are recorded in `RESULTS.csv`:

1. **Behavioral Acceptance ($Pass / Fail$):** Did the implementation pass the pre-written independent acceptance test suite?
2. **Existing Test Health ($Pass / Fail$):** Did all 26 baseline permission tests continue to pass?
3. **Mutation Detection Score ($%$):** Proportion of injected synthetic and semantic mutations rejected by the post-evolution test suite.
4. **False Alarm Rate ($Count$):** Number of times a deterministic check failed on a valid, contract-preserving change (e.g. string grep breakages).
5. **Escaped Defects ($Count$):** Known regressions that passed all active gates.
6. **Human Interventions ($Count$):** Number of manual prompts or corrections required to unblock the agent.
7. **Context & Token Consumption ($Tokens$):** Total prompt tokens, completion tokens, and turn count for each task.
8. **Wall-Clock Duration ($Seconds$):** Total elapsed time from task dispatch to final passing state.
9. **Rework & Churn ($Diff Lines$):** Total lines added, deleted, and refactored during trial completion.
10. **Governance Drift ($Ratio$):** Effort spent repairing or updating checkers vs. effort spent implementing functional logic.
