# The Architect's Playbook: polymath-platform

Welcome to the **Master Strategy** for the `polymath-platform` monorepo. This document codifies our standards for architecture, health, and scalability. Every tool here exists to protect the speed and quality of development.

---

## 🛡️ The Project Hygiene Suite (The Immune System)

We use a layered approach to health checks. These tools ensure that "Rot" never settles into the codebase.

### 1. Biome (Formatting & Speed)
*   **Purpose**: Replaces Prettier and basic ESLint for ultra-fast formatting and linting.
*   **Philosophy**: Speed is a feature. If formatting takes 5 seconds, people skip it. If it takes 20ms, it's invisible.
*   **Command**: `pnpm run format` (Repair) | `pnpm run biome:audit` (Analyze).

### 2. TSC (The Source of Truth)
*   **Purpose**: Absolute type safety.
*   **Philosophy**: If the types don't match, the code doesn't exist.
*   **Command**: `pnpm run check-types`.

### 3. Knip (Dead Code Pruning)
*   **Purpose**: Finds unused files, types, and dependencies.
*   **Philosophy**: A small codebase is a fast codebase. Remove what you don't use.
*   **Command**: `pnpm run check:unused`.

### 4. Dependency Cruiser (Border Patrol)
*   **Purpose**: Enforces architectural layers (L0-L4).
*   **Philosophy**: Logic should flow **downward**. Never allow a UI primitive to import a Screen.
*   **Command**: `pnpm run check:circular`.

---

## 🏛️ Empire-Level Guardrails (Professional Standards)

These tools are common in world-class engineering teams to ensure consistency across large teams.

### 1. Commitlint (Git Hygiene)
*   **Standard**: [Conventional Commits](https://www.conventionalcommits.org/)
*   **Requirement**: Every commit message must have a prefix:
    *   `feat:` (New feature)
    *   `fix:` (Bug fix)
    *   `refactor:` (Code change that neither fixes a bug nor adds a feature)
    *   `chore:` (Updating build tasks, etc.)
*   **Why**: Automated changelogs, easier history searching, and robotic versioning.

### 2. Size-Limit (Performance Budgeting)
*   **Purpose**: Prevents accidentally adding 50MB libraries to a small package.
*   **Action**: If a core package (like `@repo/ui`) exceeds its size budget, the check fails.

---

## 🤖 Robotic Refactoring (Codemods Theory)

### What is a Codemod?
A Codemod is a script that transforms your source code by manipulating its **Abstract Syntax Tree (AST)**. 

### Why architects use them:
Imagine we rename `IdentityCard` to `UserCard`. If that component is used in 400 places across 5 different apps, a manual search-and-replace is dangerous.
*   **Manual**: High risk of breaking imports or missing edge cases.
*   **Codemod**: The script "understands" that the variable is a Component export and renames it safely everywhere, including its usage and imports.

### The Workflow:
1.  **Parse**: Turn the code into a Tree (AST).
2.  **Transform**: Target specific "Nodes" (like VariableDeclarators) and change them.
3.  **Print**: Turn the Tree back into code.

*Architect's Pro-Tip: Never do manually what you can script once.*

---

## 📊 Orchestration & Reporting

All audit results are captured into the `reports/` folder:
- [biome_audit.txt](file:///c:/Users/Naween/projects/polymath-platform/reports/biome_audit.txt)
- [check-types.txt](file:///c:/Users/Naween/projects/polymath-platform/reports/check-types.txt)

> [!TIP]
> **For AI Agents**: Always check the `reports/` folder first to understand the current "Health delta" of the workspace before suggesting changes.
