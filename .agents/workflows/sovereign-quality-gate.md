# Workflow: Sovereign AI Agent Quality Protocol

This workflow defines the mandatory quality gates that an AI agent must pass before proposing a commit or marking a task as complete in the `polymath-platform`.

## 🛡️ The "No Impurity" Mandate
In this repository, architecture and quality take precedence over velocity. No code shall be merged if it violates the Sovereign principles.

## 🛂 Mandatory Audit Steps (MCP)
Before asking the USER to commit or concluding a task, you MUST run the following MCP tools:

### 1. Hook Hygiene Audit
Check for state management violations (e.g., >3 useState hooks) and React 19 compatibility.
- **Tool**: `sovereign_audit(action: 'hooks')`

### 2. Monorepo Hygiene Audit
Check for circular dependencies, unused code, and architectural boundary violations.
- **Tool**: `sovereign_audit(action: 'hygiene')`

### 3. Architecture Integrity
Verify that platform-agnostic packages remain pure and native shims are correctly implemented.
- **Tool**: `sovereign_audit(action: 'architecture')`

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
