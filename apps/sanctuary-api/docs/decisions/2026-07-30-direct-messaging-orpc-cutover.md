---
title: Direct messaging native oRPC cutover
status: accepted
date: 2026-07-30
owners:
  - sanctuary-api
---

# Direct messaging native oRPC cutover

## Decision

Direct conversations and messages use the `messaging` branch of the canonical oRPC contract. The server derives message authorship from the authenticated context. Clients do not send an author identity.

The deployed `direct_conversations` and `direct_messages` tables are now modeled in ZModel so ZenStack enforces participant access in addition to the Cedar procedure gate. Responses are explicit DTOs.

## Transport boundary

The shared core messaging API and community package delegate request/response data to native oRPC. Mobile and web screens use those methods for conversation context, history, and event hydration.

Supabase Realtime remains only as a live-insert notification adapter. Its event handler rehydrates through the native messaging client; it does not query Supabase directly. Direct messaging remains online-only until a durable PowerSync write model is designed.

## Tradeoffs and verification

Modeling existing tables adds the missing server access boundary without a new database migration. Rehydrating realtime events through oRPC adds a request, but preserves one DTO and authorization path. Focused contract/HTTP tests cover list, create-or-get, read, send, and malformed input. Node and Bun API suites pass after the cutover.
