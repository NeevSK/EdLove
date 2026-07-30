---
title: "Profile Social Links oRPC Cutover"
status: "implemented"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
tags: [decision, api, orpc, profile, authorization]
---

# Profile Social Links oRPC Cutover

## Decision

Profile social-link reads and mutations now use the native profile oRPC contract. The server derives `context.user.id`; callers cannot choose another user as the mutation owner. The response is an explicit social-link DTO with serialized timestamps.

## Tradeoff

The existing client method signatures retain `userId` temporarily for compatibility, but the value is intentionally ignored by the transport boundary. This keeps UI churn small while moving authorization and persistence behind the shared context and ZenStack path.

## Verification

The profile oRPC integration test covers list, upsert, and delete through Hono, Cedar, the request-scoped database mock, and output validation. API typecheck passes. Real database unique/index behavior remains part of the real-database acceptance profile.
