---
title: "ðŸ›¡ï¸ Sovereign Engineering Philosophy"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, platform-mcp]
---

# 🛡️ Sovereign Engineering Philosophy

## 1. Zero-Legacy Principle
We aim for a state where code does not rot. Every "Legacy" component (e.g. Gluestack, old React Native primitives) is a security and productivity liability. Our tools are designed to hunt and replace these patterns automatically.

## 2. Content Over Containers
We prioritize the purity of business logic. Logic should be platform-agnostic, living in `packages/core` or `packages/ai`, and "sleek" enough to run anywhere without leakage from native/web-specific drivers.

## 3. The Sovereign Control Plane (MCP)
The MCP is not just a "shell". it is an **Orchestrated Intelligence Layer**.
- **Audit**: Detection of drift.
- **Discovery**: Understanding complex intent.
- **Maintenance**: Healing and normalization.

## 4. The 100-Tool Limit & Modular Growth
By using Gateways, we respect the cognitive and technical limits of the LLM. We group functionality by **intent**, not by **script name**. This allows the monorepo to grow to thousands of scripts while keeping the user interface clean and understandable.

## 5. Tool Budgeting
- **High-Value Tools**: Should be exposed as top-level actions (e.g. `grep`, `scout`).
- **Low-Frequency/Plumbing**: Should be grouped under `maintenance` or `audit`.
- **Experimental**: Kept in scripts until proven worthy of a gateway action.
