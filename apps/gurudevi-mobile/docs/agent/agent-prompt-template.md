---
title: "Gurudevi Agent Prompt Template"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi Agent Prompt Template
*MANDATORY: Copy this entire file for every Gemini Flash / Implementation Agent task. Never deviate.*

---

## 🏗 THE STACK CONTEXT
- **Core**: Node 24 current (Node 26 LTS pending Oct 2026).
- **Monorepo**: pnpm, Turborepo, Biome, Vitest.
- **Backend**: Supabase (Postgres), ZenStack v3 (POA), Inngest.
- **Frontend**: Expo React Native (New Arch enabled), React Navigation 7.
- **Values**: Sovereignty, dignity, offline-readiness, 2GB device focus.

## 📋 TASK SPECIFICATION
[PASTE DETAILED TASK HERE]

## 🛠 CONSTRAINTS & RULES
1. **pnpm only**: NEVER use `npm` or `npx`. Use `pnpm add`, `pnpm run`, etc.
2. **2GB Android Focus**: No heavy blurs, no extreme shadows, use `FlashList`.
3. **Zod as SSOT**: No manual TS interfaces for domain entities. Derive from `@repo/types`.
4. **Resonance Engineering**: If UI code isn't elegant, it is rejected.
5. **No DB Drift**: Every change must have a migration or ZenStack model update if needed.

## 📝 OUTPUT REQUIREMENTS
1. **Vertical Stack Analysis**: List files changed from DB to UI.
2. **Resonance Check**: How does this impact performance on low-end devices?
3. **Implementation Plan**: High-level steps before code.
4. **Execution**: The actual code blocks.

---
// Use with: "hey follow the template at docs/agent/agent-prompt-template.md"
