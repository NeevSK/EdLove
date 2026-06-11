---
title: "Expo MCP and Stdio Pollution Troubleshooting Runbook"
status: "active"
created: 2026-06-11
updated: 2026-06-11
author: "Naveen"
scribe: "Antigravity"
tags: [mcp, infrastructure, authentication, troubleshooting]
---

# Expo MCP and Stdio Pollution Troubleshooting Runbook

This document details the chronological investigation, diagnosis, and resolution of critical stdio stream corruption and authentication issues encountered when running the Polymath Platform MCP Gateway on Windows.

---

## 1. Chronological Timeline & Symptoms

### Phase 1: Stream Corruption (`invalid character 'â'`)
* **Symptom**: During the boot cycle of the Master Gateway, the IDE client (e.g. Cursor or Claude Desktop) immediately crashed during initialization with the following error:
  ```text
  calling "initialize": invalid character 'â' looking for beginning of value
  ```
* **Implication**: The MCP protocol specifies that the standard output (`stdout`) of a server must contain **only** valid JSON-RPC payloads. Any non-JSON-RPC text on `stdout` corrupts the stream and crashes the client.
* **Diagnosis**:
  1. The diamond bullet character `◇` used by logs was encoded in UTF-8 as `\xe2\x97\x87`. On non-UTF-8 Windows consoles (e.g., CP1252), `\xe2` maps directly to `â`.
  2. The standard `dotenv` package (recently updated in dependencies to v17+) now includes a default startup welcome banner log pointing to `dotenvx` (`◇ injected env (6) from...`). This banner was printed directly to `stdout` upon initialization of the gateway, corrupting the stream.
  3. Preloaded global libraries in the host shell (e.g. `@dotenvx/dotenvx` injected via `NODE_OPTIONS`) were also running on spawned downstream processes (like Supabase) and printing identical welcome banners directly to their stdout.

### Phase 2: Expo `mcp-remote` Authentication Failures
* **Symptom**: The downstream client for `expo` repeatedly failed to authorize, hanging when trying to open the browser for OAuth validation in background execution.
* **Diagnosis**:
  1. Spawning the remote server via `npx -y mcp-remote` caused npm to print update checks and install status logs on `stdout` during startup, leading to further stdio corruption.
  2. Spawning child processes on Windows via `cmd.exe /c` stripped outer double quotes from headers (e.g. `--header "Authorization: Bearer <TOKEN>"`), mangling the authorization header format.
  3. `mcp-remote` calculates a cache path hash in `~/.mcp-auth/` based on the exact combination of the URL *and the custom headers passed*. 
  4. In `mcp-remote`, the custom command-line headers were incorrectly given precedence in request helpers and would overwrite the fresh OAuth tokens generated in the callback loop. If an invalid or expired token was present in `.env`, the server would always get a 401 on connection, forcing an infinite browser verification loop.

---

## 2. Technical Resolutions

To tackle these issues permanently and ensure industrial-grade robustness, the following changes were implemented:

### A. Bulletproof Stdio Protection (Gateway-wide)
We implemented active stdout interception at the entrypoint of the gateway ([packages/platform-mcp/src/index.ts](file:///c:/Users/Naween/projects/polymath-platform/packages/platform-mcp/src/index.ts)):

1. **Stdout Hijacking**: At the very first line of the gateway script, we redirect all `process.stdout.write` calls to `process.stderr.write`:
   ```typescript
   const originalStdoutWrite = process.stdout.write;
   process.stdout.write = function (chunk: any, encoding?: any, callback?: any) {
     return process.stderr.write(chunk, encoding, callback);
   } as any;
   ```
2. **Channel Restoration**: We restore the original `stdout.write` only right before connecting to the stdio transport:
   ```typescript
   process.stdout.write = originalStdoutWrite;
   await this.server.connect(transport);
   ```
3. **Environment Filtering**: We filter out `NODE_OPTIONS` from `process.env` when spawning downstream child processes to prevent preloaded packages (like `dotenvx`) from executing inside children.
4. **Quiet Configuration**: Configured `dotenv.config({ quiet: true })` to suppress the v17 welcome banner entirely.

### B. Offline Execution & Shell Bypass (mcp-remote)
1. **Local Dependency**: Installed `mcp-remote` as a local devDependency in the gateway project (`packages/platform-mcp/package.json`) to run the proxy entirely offline, avoiding `npx` download overhead and stdout noise.
2. **Direct Spawning**: Spawn `mcp-remote`'s JS entry point (`node_modules/mcp-remote/dist/proxy.js`) directly using `node` and bypass `cmd.exe /c` entirely on Windows.
3. **Header Simplification**: Removed the `--header` arguments from the spawned server arguments in `packages/platform-mcp/src/index.ts` to rely on the standard OAuth cache.

---

## 3. Operations & Runbook Guide

If you need to re-authenticate or clear credentials for the Expo MCP server:

1. **Clear Stale Cache**:
   ```powershell
   Remove-Item -Recurse -Force C:\Users\Naween\.mcp-auth
   ```
2. **Perform One-time Terminal Authorization**:
   Run the proxy manually once in a standard terminal. This will automatically open the browser, prompt for approval, and cache a long-lived `refresh_token`:
   ```powershell
   node packages/platform-mcp/node_modules/mcp-remote/dist/proxy.js https://mcp.expo.dev/mcp
   ```
3. **Automatic Lifecycle**:
   Subsequent launches of your IDE/gateway will automatically read from `~/.mcp-auth/` and refresh the access token silently in the background. No further manual action is required.
