---
title: "ðŸ““ The Sovereign Mistake Ledger"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, platform-mcp, historical]
---

# 📓 The Sovereign Mistake Ledger
### "Errors are the portals of discovery." — James Joyce

This ledger tracks architectural dead-ends, failed patterns, and "hard-won" lessons to ensure future agents (and humans) do not repeat them.

---

## 🚫 1. Relative Import Chaos
- **Mistake**: Using deep relative paths (e.g., `../../../components`) in a monorepo.
- **Consequence**: Moving a file breaks everything; opaque dependency graph.
- **The Sovereign Way**: Use workspace-level aliases or canonical package names (e.g., `@repo/ui`).
- **Learning**: \`sovereign_maintenance(action: 'normalize')\` is your best friend.

## 🚫 2. The "UI in Core" Pollution
- **Mistake**: Importing React components or hooks into "Headless Core" services.
- **Consequence**: Breaking SSR, breaking CI/CD, and making services non-portable.
- **The Sovereign Way**: Core should be pure logic. UI should depend on Core, never the reverse.
- **Learning**: Use \`sovereign_discovery(action: 'lens')\` (Skeleton Lens) to flag these early.

## 🚫 3. Ghost State Leakage
- **Mistake**: Creating `setInterval` or `addEventListener` in components without cleanup.
- **Consequence**: Massive memory sinks and battery drain on mobile.
- **The Sovereign Way**: Every side effect must have a termination logic.
- **Learning**: \`sovereign_audit(action: 'memory_sinks')\` tracks these.

## 🚫 4. The "God File" Anti-pattern
- **Mistake**: Creating files larger than 1000 lines that handle everything.
- **Consequence**: High cognitive load, impossible to unit test, and LLM context saturation.
- **The Sovereign Way**: Atomic, single-responsibility files.
- **Learning**: Monitor \`sovereign_audit(action: 'cognitive_load')\` scores.

## 🚫 5. The "Ad-Hoc Tool Island" Anti-pattern (Bypassing Sovereign Platform MCP)
- **Mistake**: Creating isolated scratch test scripts, ad-hoc API wrappers, or standalone MCP server blocks in client configs instead of inspecting and leveraging the existing `@repo/platform-mcp` gateway.
- **Consequence**: Fragmented tooling, credential leaks outside Doppler, zero governance, and cognitive drift across agent sessions.
- **The Sovereign Way**: Ground in existing substrate first. Multiplex new tools into `@repo/platform-mcp` (`DownstreamServerSpec`), manage secrets in Doppler, build the package, and codify the capability into `AGENTS.md`.
- **Learning**: Respect the Sovereign Gateway multiplexer before writing any single-off script.

---
*Add your own mistakes here. Every failure documented is a step towards Absolute God Mode.*
