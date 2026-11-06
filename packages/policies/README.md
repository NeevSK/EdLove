---
title: "@repo/policies"
status: "active"
created: 2026-08-30
updated: 2026-10-15
author: "EdLove Foundation & Intuitui Labs"
tags: [packages, policies, authz]
---

# @repo/policies

The access control and authorization policy definitions for the **Gurudevi** platform.

---

## Purpose

Enforces principled, privacy-respecting access boundaries across classrooms, student journals, teacher workspaces, and school governance.

---

## What It Owns

* **Cedar Policies**: Formal policy specifications for role-based and relationship-based access control (ReBAC).
* **Policy Decision Point (PDP) Helpers**: Client-side and server-side policy evaluation helpers.

## Local Cedar checks

Install the [Cedar CLI](https://github.com/cedar-policy/cedar/releases) (the current workspace uses Cedar WASM 4.14.0), then run `pnpm --filter @repo/policies audit:cedar`. Set `CEDAR_CLI` to the executable path if `cedar` is not on PATH. The audit validates every policy file against the shared schema, prints the CLI version and a diagnostic summary, and exits nonzero on validation errors. Add `--verbose` for all diagnostics, or `--deny-warnings` to fail on warnings. It does not change policies or make authorization decisions.

For individual requests use `cedar authorize --help`; for scenario fixtures use `cedar run-tests --help`. CLI validation is not proof that the application supplies correct entities, enforces a decision, or has up-to-date policy data.

Run `node packages/policies/scripts/audit-cedar.mjs --scenarios` to check `platform/ai.cedar` in isolation. This file is not currently listed by the server evaluator; these scenarios establish its standalone behavior, not that the application enforces it.

The developer gateway exposes the same checks through `sovereign_audit` actions `cedar` and `cedar_scenarios`. Its process must have `cedar` on PATH or `CEDAR_CLI` configured.

For MCP tool descriptions, run `pnpm --filter @repo/platform-mcp cedar:mcp-schema tools.json` with a JSON tool array or a `tools/list` response. An optional second argument supplies a Cedar schema stub with `@mcp_principal` and `@mcp_resource` annotations. The output is a generated schema, not a policy or an enforcement mechanism. For connected downstream servers, `sovereign_discovery` action `cedar_mcp_schema` accepts `params: { "server": "name" }` and uses the original downstream descriptions with gateway-prefixed names. Only already-connected servers are available; the gateway registers them asynchronously. Generic or incomplete input schemas produce incomplete policy models, so inspect generated output and test it before use.
