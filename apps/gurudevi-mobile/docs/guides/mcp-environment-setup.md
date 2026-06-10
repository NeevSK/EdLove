---
title: "Sovereign Environment Setup Guide"
status: "active"
created: 2026-04-26
updated: 2026-04-26
author: "Naween"
tags: [reorganized]
---

# Sovereign Environment Setup Guide

This guide explains how to set up and manage environment variables for the **Polymath Sovereign MCP** toolchain.

## The Problem
MCP configuration files (like `mcp_config.json` in Antigravity or Claude Desktop) are local to your machine but often contain sensitive secrets like GitHub tokens or Supabase keys. Hardcoding these secrets in the JSON file is insecure and makes it difficult to share generic configurations with other developers.

## The Sovereign Solution: Bridge Proxy
We use a custom bridge proxy (`scripts/mcp-proxy.mjs`) that acts as a secure wrapper for MCP servers. 

### Benefits:
- **No Hardcoding**: Secrets stay in a git-ignored `.env` file.
- **Runtime Injection**: The proxy loads the environment and injects it into the MCP server process.
- **Portability**: The `mcp_config.json` can now use generic paths and placeholders.

---

## 🚀 Setup Instructions

### 1. Initialize your .env file
Secrets are stored in `packages/platform-mcp/.env`. This file is git-ignored and will not be shared.

```powershell
# Copy the template to create your local environment
cp packages/platform-mcp/.env.example packages/platform-mcp/.env
```

### 2. Fill in your Secrets
Open `packages/platform-mcp/.env` and provide your personal tokens:

```env
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
SUPABASE_ACCESS_TOKEN=sbp_your_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_key_here
```

### 3. Update your MCP Configuration
In your IDE's `mcp_config.json` (e.g., in Antigravity's settings or `%AppData%\Roaming\...\mcp_config.json`), use the proxy command instead of the direct package call.

**Example for Supabase:**
```json
"supabase": {
  "command": "node",
  "args": [
    "C:\\path\\to\\polymath-platform\\scripts\\mcp-proxy.mjs",
    "pnpm",
    "dlx",
    "@supabase/mcp-server-supabase",
    "--access-token",
    "${env.SUPABASE_ACCESS_TOKEN}"
  ]
}
```

**Note:** The proxy will automatically replace `${env.VARIABLE_NAME}` with the value from your `.env` file.

---

## 🛠 Adding New Variables
If you need to add a new secret for a different tool:
1.  **Add to `.env`**: Add the key-value pair to `packages/platform-mcp/.env`.
2.  **Update `.env.example`**: Add the empty key to `packages/platform-mcp/.env.example` so other developers know it's required.
3.  **Use in Config**: Reference it in `mcp_config.json` using the `${env.KEY}` syntax.

##  Troubleshooting
- **Missing Variable**: If the proxy cannot find a variable, it will print a warning: `⚠️ Warning: Environment variable 'NAME' not found`.
- **Absolute Paths**: Ensure the path to `mcp-proxy.mjs` in your `mcp_config.json` is an absolute path.
