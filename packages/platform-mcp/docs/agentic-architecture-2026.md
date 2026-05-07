# Agentic Architecture 2026: The Sovereign Strategy

## 1. Executive Summary
As of April 2026, the shift from "Chat-First AI" to "Agent-First Architecture" is complete. The **Polymath Platform** adopts the **Sovereign Agentic Pattern**, where AI agents are not mere sidecars but core orchestrators of business logic, governed by strict architectural restraints.

---

## 2. Core Pillars of the 2026 Stack

### I. Model Context Protocol (MCP) as the "USB-C for Tools"
MCP is no longer optional. Every service in the Polymath ecosystem (Attendance, Gradebook, Classroom) must expose its capabilities as MCP Tools.
- **Trend**: Moving logic out of prompts and into **MCP Resource Templates**.
- **Best Practice**: Use **Session-Bound MCP**. Agents should never have more permissions than the active user. Use the `X-MCP-Context` header to pass user identity through the tool chain.

### II. The "Governor" Pattern (Orchestration)
We move away from simple loops to a **Reason-Act-Verify** cycle.
- **Framework**: Use **LangGraph** for complex cyclical workflows (e.g., "Draft, Review, Correct, Publish").
- **SDK**: **Vercel AI SDK v4** is the standard for streaming UI.
- **Limits**: Every agent interaction MUST have a `maxSteps` (default: 5-10) to prevent token-burn spirals.

### III. Durable Execution (Temporal.io)
For workflows that take longer than a standard HTTP timeout (e.g., generating an end-of-year school report), we use **Durable Agents**.
- **Resilience**: If a server crashes mid-workflow, the agent resumes exactly where it stopped.
- **Pattern**: `AI-SDK` + `Temporal` integration. The "Plan" is a Temporal Workflow; the "Action" is a Temporal Activity.

---

## 3. The 2026 Developer Toolkit

### Precision Timing: Temporal API (Node 26)
With the release of **Node 26**, the legacy `Date` object is officially deprecated in favor of the **Temporal API**.
- **Rule**: Use `Temporal.PlainDate` for school calendars and `Temporal.ZonedDateTime` for event scheduling.
- **Why**: Immutability by default. No more timezone-offset nightmares in the Sri Lankan context.

```typescript
// 2026 Pattern: Precise School Scheduling
const schoolStart = Temporal.ZonedDateTime.from('2026-04-28T08:00:00[Asia/Colombo]');
const firstPeriodEnd = schoolStart.add({ minutes: 40 });
// Immutable, DST-aware, and precise.
```

### Prompt Engineering: "Constraints-as-Code"
Stop writing long prompt instructions for guardrails. Use **Zod Schemas** as the primary source of truth for tool calling.
- **Why**: LLMs are 40% more reliable when tool inputs are strictly schematized rather than described in prose.

---

## 4. Agentic UI Principles
The UI in 2026 is **Fluid and Generative**.
- **Generative UI**: Use the AI SDK's `render` capability to stream real React components (from `@repo/ui`) instead of Markdown.
- **Socratic Fallbacks**: When the network is down or the model is "thinking," the UI remains responsive using **Local-First Agents** (e.g., Phi-4 running via Wasm/WebGPU).

---

## 5. Security & Sovereignty
The "Sovereignty Rule" is absolute for Gurudevi:
1. **Aggregated Data**: External APIs (Claude 4, Gemini 2.5) are acceptable.
2. **Individual Student Data**: **Local/Self-Hosted inference only**.
3. **Auditability**: Every tool call is logged by the `DiscoveryService` in a tamper-proof audit trail.

---

## 6. Implementation Roadmap for Gurudevi
- **Phase 1 (Now)**: Refactor `useAIAgent` to use `maxSteps` and Zod-validated tool calls.
- **Phase 2 (Q2 2026)**: Bridge the mobile app internal state to a **Local MCP Server**.
- **Phase 3 (Q3 2026)**: Deploy the **Agentic Command Center** for multi-agent coordination.

---
*Created: 2026-04-28 | Status: Architectural Blueprint*
