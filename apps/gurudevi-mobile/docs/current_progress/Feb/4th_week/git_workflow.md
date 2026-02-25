# Git Promotion Workflow

This document defines the 5-tier branching strategy for the Polymath Platform, as established during the 4th Week Senior Dev Audit.

## Branch Hierarchy

| Tier | Branch Name | Purpose | Stability |
| :--- | :--- | :--- | :--- |
| 1 | `main-innovate` | **Sandbox**: Experimental features, radical refactors, and R&D. | Volatile |
| 2 | `main-dev` | **Development**: Merged from innovate once a feature is "dev-stable". | Semi-Stable |
| 3 | `main-QA` | **Staging/Audit**: Merged from dev for rigorous testing and security audits. | Stable |
| 4 | `main-preview` | **Release Candidate**: Beta testing for selected schools/principals. | Production-Ready |
| 5 | `main` | **Production**: The gold standard. Public-facing release. | Mission-Critical |

## Promotion Rules

### 1. `innovate` -> `dev`
*   **Trigger**: Feature implementation complete.
*   **Gate**: Basic manual testing and linting pass.
*   **Action**: `git checkout main-dev && git merge main-innovate`.

### 2. `dev` -> `QA`
*   **Trigger**: Feature set stable for version milestone.
*   **Gate**: `pnpm check-all` pass (Lints, Types, i18n, A11y).
*   **Gate**: Automated tests pass in CI.
*   **Action**: `git checkout main-QA && git merge main-dev`.

### 3. `QA` -> `preview`
*   **Trigger**: QA testing complete, security audit (Senior Dev) approved.
*   **Gate**: Critical bugs resolved.
*   **Action**: `git checkout main-preview && git merge main-QA`.

### 4. `preview` -> `main`
*   **Trigger**: Beta feedback integrated.
*   **Gate**: Final deployment approval.
*   **Action**: `git checkout main && git merge main-preview`.

## Emergency Hotfixes
Hotfixes should ideally be branched off `main`, tested in `QA`, and then merged back into `main` and propagated down to `dev` and `innovate` to avoid drift.
