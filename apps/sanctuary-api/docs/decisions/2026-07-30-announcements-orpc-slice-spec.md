---
title: Announcements native oRPC slice specification
status: implemented
created: 2026-07-30
updated: 2026-07-30
author: Codex
tags: [orpc, community, announcements]
---

# Announcements native oRPC slice specification

Announcements are school-scoped read operations and authenticated school-authorized mutations. The server derives `author_id`; callers may not provide an author identity. The existing deployed `announcements` table is modeled in ZModel and returned through an explicit DTO.

The legacy manager/repository remains available for historical non-HTTP callers, but first-party announcement API callers use the native oRPC client. This slice does not change notification delivery or realtime subscriptions.
