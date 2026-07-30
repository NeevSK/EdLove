---
title: "Community Group Messaging oRPC Cutover"
status: "implemented"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
tags: [decision, api, orpc, community, messaging]
---

# Community Group Messaging oRPC Cutover

## Decision

Group message reads and sends now use the native community oRPC contract. The circle client retains its existing method signatures, but no longer builds Supabase queries or derives authorship locally. The server uses the authenticated principal and ZenStack's group-membership policy.

## Verification

The community integration suite covers message listing and sending through the in-memory Fetch → Hono → oRPC → Cedar → ZenStack handler path. API typecheck passes. Real membership and PostgreSQL behavior remain part of the real-database acceptance profile.
