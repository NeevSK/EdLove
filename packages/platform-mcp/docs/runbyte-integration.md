# Runbyte Integration Guide

## Recommendation
Runbyte is a good fit for `@repo/platform-mcp`, but as an **outer orchestration layer**, not as a direct runtime dependency inside this package.

That means:
- Keep `@repo/platform-mcp` focused on its own gateway tools and services.
- Place Runbyte in front of it when you want lower token usage and code-execution style orchestration across multiple MCP servers.
- Treat Runbyte as an optional operator mode, not as the core identity of this package.

## Why This Fits
`platform-mcp` already compresses many internal scripts behind a small gateway surface:
- `sovereign_audit`
- `sovereign_discovery`
- `sovereign_maintenance`
- `sovereign_guide`

Runbyte solves a different problem:
- It lets the agent discover downstream MCP servers as typed TypeScript modules.
- It lets the agent do filtering, looping, joining, and transformation inside a sandbox before returning a small answer.
- It reduces context pressure when the agent needs to compose several MCP servers in one flow.

These two approaches complement each other:
- `platform-mcp` reduces tool sprawl by grouping actions behind gateways.
- Runbyte reduces orchestration overhead when many MCP servers are active at once.

## Recommended Architecture
Use this order:

1. Your MCP client connects to Runbyte.
2. Runbyte connects downstream to `platform-mcp` and any other MCP servers you want.
3. The agent imports only the server modules it needs from Runbyte's virtual filesystem.
4. The agent executes TypeScript that calls `platform-mcp` gateway actions only when needed.

Suggested mental model:
- `platform-mcp` = sovereign control plane for the monorepo
- Runbyte = token-efficient execution shell around multiple MCP servers

## When Runbyte Helps Most
Use Runbyte when:
- the agent needs to coordinate `platform-mcp` with GitHub, filesystem, browser, docs, or database MCP servers
- the workflow involves large intermediate payloads that should be filtered before reaching the model
- the task needs loops, branching, retries, joins, or aggregation across servers

Runbyte is less important when:
- the agent only calls one or two gateway actions
- the workflow is simple and already efficient through direct MCP tool calls
- you want the smallest possible operational footprint

## Tradeoffs
Benefits:
- smaller tool-context footprint
- better multi-server composition
- natural code-first orchestration
- easier data shaping before model re-entry

Costs:
- one more moving part to configure
- extra operational complexity for local setup
- another abstraction layer to debug when transports fail

## Implementation Decision For This Package
For `@repo/platform-mcp`, the right move is:
- do **not** vendor Runbyte source code into this package
- do **not** add Runbyte as an npm dependency here
- do document Runbyte as a supported deployment pattern
- do keep `platform-mcp` transport-agnostic and clean as a downstream MCP server

## Example Runbyte Config
This example makes Runbyte expose `platform-mcp` alongside another MCP server:

```json
{
  "mcpServers": {
    "platform": {
      "command": "pnpm",
      "args": ["--filter", "@repo/platform-mcp", "start"],
      "cwd": "/absolute/path/to/polymath-platform"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/absolute/path/to/polymath-platform"]
    }
  }
}
```

On Windows, using `pnpm.cmd` can be more reliable than `pnpm` in some MCP hosts:

```json
{
  "mcpServers": {
    "platform": {
      "command": "pnpm.cmd",
      "args": ["--filter", "@repo/platform-mcp", "start"],
      "cwd": "C:\\Users\\Naween\\projects\\polymath-platform"
    }
  }
}
```

## Example Agent Usage Through Runbyte
Once Runbyte exposes the downstream server, the agent can compose calls in code instead of loading everything into prompt context:

```ts
import * as platform from "./servers/platform";

export async function exec() {
  const architecture = await platform.sovereign_guide({
    action: "architecture",
  });

  const hygiene = await platform.sovereign_audit({
    action: "hygiene",
  });

  return {
    architecture,
    hygiene,
  };
}
```

## Operational Guidance
- Start with direct `platform-mcp` usage first.
- Add Runbyte after the gateway surface feels stable.
- Keep `platform-mcp` as the authoritative place for domain-specific actions and docs.
- Let Runbyte handle orchestration and token-efficiency, not business logic.

## Bottom Line
Runbyte is a strong addition if your real goal is **multi-server orchestration with lower token cost**.

For this repository, the best integration is:
- **yes** to Runbyte as a supported wrapper around `platform-mcp`
- **no** to embedding Runbyte into `platform-mcp` itself

## Built-in MCP Support
`platform-mcp` now exposes two related entry points:
- `sovereign_guide(action: 'runbyte')` for the architectural guidance
- `sovereign_maintenance(action: 'runbyte_config')` for a generated workspace-specific Runbyte config
