# Workflow: Sovereign AI Agent Quality Protocol

This workflow defines the mandatory quality gates that an AI agent must pass before proposing a commit or marking a task as complete in the `polymath-platform`.

## 🛡️ The "No Impurity" Mandate
In this repository, architecture and quality take precedence over velocity. No code shall be merged if it violates the Sovereign principles.

## 🛂 Mandatory Audit & Commit Flow (MCP)
Agents MUST NOT use raw `git` commands for committing. You must use the platform's orchestrated tools to ensure the "Intelligence Layer" remains active.

### 1. The Audit Loop
Before any submission, run:
- `sovereign_audit(action: 'hooks')` -> Check React/State hygiene.
- `sovereign_audit(action: 'hygiene')` -> Check architecture/boundaries.

### 2. The Checkpoint (Commit)
- **Tool**: `sovereign_maintenance(action: 'checkpoint', params: { message: 'feat: ...' })`
- **Why**: This triggers the **Surgical Sentinel** (TSC + ESLint + Biome) and provides a structured failure report if any "Impurities" are found.

### 3. The Push (Remote Sync)
- **Manual Gate**: Usually, pushing is left to the USER after reviewing the Agent's checkpoints.
- **Automated Gate**: If authorized, the `pre-push` hook will execute the **Full Sovereign Audit**. If it fails, read `reports/push_audit.md` and heal the issues.

## 🚀 Local Validation
In addition to MCP tools, you MUST verify that your changes pass the local gates:

1. **Linting**: `pnpm run lint` (ESLint + Biome)
2. **Types**: `pnpm run check-types` (TSC)

## ❌ Senior Refusal Protocol
If a change requires violating a Sovereign principle (e.g., adding a 4th `useState` to a component), you must:
1. Refuse the change.
2. Propose an architectural alternative (e.g., moving state to a specialized hook or using `useReducer`).
3. Document why the original request was non-compliant.

---
> [!IMPORTANT]
> Failure to run these audits before submission is considered a violation of the Sovereign Engineering goals.
