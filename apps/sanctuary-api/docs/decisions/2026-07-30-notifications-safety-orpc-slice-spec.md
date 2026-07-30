---
title: Notifications and social safety oRPC slice specification
status: implemented
created: 2026-07-30
updated: 2026-07-30
author: Codex
tags: [orpc, notifications, safety, architecture]
---

# Notifications and social safety oRPC slice specification

## Blast zone

RED for the ZModel additions and server authorization boundary; AMBER for the shared client and community callers.

## Scope

Move user-owned notification reads/acknowledgements and user block operations behind a native `social` oRPC contract. The server derives the current user for every user-owned operation. Notification creation remains a server-side trigger/service concern and is not exposed as a client mutation.

## Reuses

- the existing shared oRPC client factory;
- the existing request context, Cedar gate, and ZenStack client;
- the existing community and core social API method names where possible;
- the existing notification and block database tables and RLS semantics.

## Does not

- change push-token registration or realtime notification subscriptions;
- introduce offline writes for notifications or blocks;
- expose raw notification or block database rows;
- change the existing user-facing notification type vocabulary.

## Quality constraints

- explicit response DTOs only;
- no client-supplied `user_id` or `blocker_id` for self-owned operations;
- ZenStack predicates remain authoritative for row ownership;
- focused contract and HTTP tests must be added before the full API suite is rerun.
