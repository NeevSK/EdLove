---
title: Group member management native oRPC cutover
status: implemented
created: 2026-07-30
updated: 2026-07-30
author: Codex
tags: [orpc, community, authorization]
---

# Group member management native oRPC cutover

Group-member listing, role changes, and bulk pending-member approval now use the native community oRPC router. The server returns explicit member DTOs and keeps group membership authorization behind the shared Cedar gate plus ZenStack predicates.

The community package maps the DTOs into its existing UI-facing types, so the management screen does not query `community_group_members` directly. Role changes use the deployed `role` column; the previous wrapper’s `capacity` terminology is retained only at the UI compatibility boundary.
