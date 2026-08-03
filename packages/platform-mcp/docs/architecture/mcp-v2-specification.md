---
title: "MCP TypeScript SDK V2 Architectural Specification"
status: "active"
created: 2026-08-03
updated: 2026-08-03
author: "Naveen"
scribe: "Antigravity"
tags: [mcp, v2, sdk, architecture, specification]
---

# MCP TypeScript SDK V2 Architectural Specification

## Executive Summary

The Model Context Protocol (MCP) TypeScript SDK V2 represents a major architectural upgrade for agentic tool servers, multiplexers, and client integrations. Moving beyond raw low-level schema handler registrations (`CallToolRequestSchema`, `ListToolsRequestSchema`), SDK V2 introduces first-class declarative tool definitions, type-safe Zod schema inference, unified task streaming, structured error boundaries, and enhanced transport flexibility.

This document serves as the formal architectural reference for Model Context Protocol SDK V2 capabilities, breaking changes, and protocol mechanics.

---

## 🚀 Key Capabilities & Architectural Shift

### 1. High-Level Declarative Server API (`McpServer`)
In V1 SDK (`@modelcontextprotocol/sdk@1.x`), servers required manually instantiating a `Server` instance and writing imperative request handlers for tool listing and tool invocation.

In V2, the SDK introduces `McpServer` which encapsulates tool, resource, and prompt registration in a single declarative builder pattern with automatic input validation via Zod schemas:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "polymath-platform-mcp",
  version: "2.0.0"
});

// Declarative Tool Registration with Automatic Zod Type Inference
server.tool(
  "run_audit",
  "Executes polymath workspace architectural audit",
  {
    target: z.string().optional().describe("Target workspace package or app path"),
    fix: z.boolean().optional().describe("Auto-apply safe lint/formatting fixes")
  },
  async ({ target, fix }, extra) => {
    // Handler body returning strongly typed content array
    return {
      content: [{ type: "text", text: "Audit results..." }]
    };
  }
);
```

### 2. Native Long-Running Asynchronous Tasks & Streaming Progress
V2 formalizes progress reporting and task cancellation mechanisms across stdio and HTTP/SSE transports using native `ProgressTracker` tokens in the `extra` argument context:

- **Token-based Progress Updates**: `extra.sendProgress({ progress: 50, total: 100 })` streams status back to the host client without blocking execution.
- **Cancellation Signal**: Native support for `AbortSignal` passed directly via `extra.signal`.

### 3. Unified Error Architecture & JSON-RPC Protocol Hardening
- V2 enforces structured error codes (`McpError`, `ErrorCode.InvalidParams`, `ErrorCode.InternalError`).
- Built-in schema validation failures return standardized RPC errors before invoking the application tool logic, removing boilerplate parameter validation inside handlers.

---

## ⚠️ Breaking Changes Matrix (V1.x → V2.x)

| Feature / Subsystem | V1.x Pattern (`@modelcontextprotocol/sdk@1.29`) | V2.x Pattern (`@modelcontextprotocol/sdk@2.x`) | Migration Impact |
|---|---|---|---|
| **Server Initialization** | `new Server({ name, version }, { capabilities })` | `new McpServer({ name, version }, { capabilities })` | Core instantiation update |
| **Tool Handler Setup** | `server.setRequestHandler(ListToolsRequestSchema, ...)` and `server.setRequestHandler(CallToolRequestSchema, ...)` | `server.tool(name, description, schema, handler)` | High simplification; eliminates manual router dispatch loops |
| **Schema Validation** | Raw JSON schema objects (`inputSchema: { type: "object", properties: ... }`) | Native Zod Object Schemas (`{ prop: z.string() }`) | Type safety at compile and runtime |
| **Response Format** | Raw array of content objects | `{ content: [...] }` with validated return types | Handlers return structured result objects |
| **Client Transport API** | Separate client transport class configurations | Modular transport adapter interfaces (`StdioServerTransport`, `SSEServerTransport`, `WebSocketsTransport`) | Cleaner transport abstraction |

---

## 🏛️ Transport Topologies

MCP V2 standardizes three primary transport mechanisms:

1. **Stdio (`StdioServerTransport`)**: Ideal for local agent processes (Claude Desktop, Antigravity IDE, VS Code Extension). Standard output is strictly reserved for JSON-RPC messages while standard error is reserved for diagnostics.
2. **SSE Stream (`SSEServerTransport`)**: Enables remote web applications and microservices to communicate with MCP servers over standard HTTP SSE channels.
3. **HTTP WebSockets / Streamable**: Support for bi-directional real-time agentic tool invocation across decoupled infrastructure.

---

## 📚 Standard References
- Model Context Protocol Official Specification: `https://modelcontextprotocol.io`
- Repository Package: `@repo/platform-mcp`
