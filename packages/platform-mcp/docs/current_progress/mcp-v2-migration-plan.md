---
title: "Polymath Platform MCP V2 Migration & Upgrade Plan"
status: "active"
created: 2026-08-03
updated: 2026-08-03
author: "Naveen"
scribe: "Antigravity"
tags: [mcp, v2, migration, polymath, platform, upgrade]
---

# Polymath Platform MCP V2 Migration & Upgrade Plan

## Overview

This plan outlines the specific requirements, service refactoring strategy, and proposed tool additions for migrating `@repo/platform-mcp` from `@modelcontextprotocol/sdk@1.x` to the MCP TypeScript SDK V2 architecture.

---

## 🔍 What is Needed for Polymath Platform

Our `@repo/platform-mcp` package serves as the **Sovereign Control Plane** for AI agents across the workspace. It currently exposes multi-domain capabilities split into specialized services:

1. **`AuditService`**: Workspace hygiene, linting, typechecking, cycle checking.
2. **`DiscoveryService`**: Architecture inspection, search, Jina embeddings, package discovery.
3. **`DocumentService`**: Dossier rendering, markdown formatting, analysis reporting.
4. **`HelpService`**: Core documentation, tool inventory, agentic instructions.
5. **`MaintenanceService`**: Git checkpoints, Turbo builds, script execution, env diagnostics.
6. **`ScoutService`**: Codebase mining, intelligence gathering.

---

## 🛠️ Step-by-Step Migration Requirements

### Phase 1: Dependency & Transport Refactoring
- Update `package.json` dependency to `@modelcontextprotocol/sdk@^2.0.0`.
- Replace raw `Server` instantiation in `src/index.ts` with `McpServer`.
- Retain stdio protection proxy (`process.stdout.write` redirection to `stderr`) to protect JSON-RPC transport integrity during boot.

### Phase 2: Service & Tool Registration Conversion
Convert manual `ListToolsRequestSchema` and `CallToolRequestSchema` handlers into modular `server.tool(...)` registrations:

```typescript
// Example V2 Migration for Audit Tool
server.tool(
  "polymath_audit_run",
  "Executes linting, typechecking, and cycle checks for a target package or application",
  {
    target: z.string().optional().describe("Package or app name (e.g., 'gurudevi-mobile', '@repo/core')"),
    fix: z.boolean().optional().describe("Automatically apply safe fixes where supported")
  },
  async ({ target, fix }) => {
    const result = await auditService.handleAudit({ target, fix });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);
```

### Phase 3: Long-Running Task & Streaming Progress Integration
- Utilize V2 `extra.sendProgress` inside `MaintenanceService` (e.g. during pnpm builds or Expo prebuild checks) to report progress to Antigravity IDE and Claude Desktop in real time.
- Attach `extra.signal` to child process execution (`spawnSync`/`execa`) for cancellation support when an agent cancels a tool run.

---

## 💡 Potential New Additions & Tool Upgrades

1. **`polymath_workspace_health`**: Unified diagnostic tool combining build status, git dirty status, circular dependency checks, and outdated lockfiles in a single call.
2. **`polymath_task_stream`**: Background process executor utilizing V2 task streaming for long builds (`expo prebuild`, `turbo run build`).
3. **`polymath_knowledge_query`**: Direct interface to search local Antigravity KIs and `.agents/skills` dynamically.
4. **`polymath_schema_guard`**: Real-time schema drift checker for ZenStack, Prisma, and Supabase migrations.

---

## 📋 Migration Verification Checklist

- [x] Fix TypeScript import path aliases (`@repo/platform-mcp/*` -> relative paths) in `src/`.
- [x] Verify successful build via `pnpm --filter @repo/platform-mcp build`.
- [x] Test stdio process boot cleanly without `ERR_MODULE_NOT_FOUND`.
- [ ] Upgrade `@modelcontextprotocol/sdk` to `2.x`.
- [ ] Refactor `src/index.ts` to `McpServer` builder pattern.
- [ ] Convert tool schemas from raw JSON schemas to Zod objects.
- [ ] Add progress streaming for long-running maintenance tools.
- [ ] Execute full workspace end-to-end tool invocation tests.
