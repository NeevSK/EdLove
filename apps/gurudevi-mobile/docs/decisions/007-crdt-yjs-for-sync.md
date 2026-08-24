---
title: "ADR-007: CRDT Yjs for Sync"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# ADR-007: CRDT Yjs for Sync

## Status
Accepted

## Context
Future-proofing the shared-document features (Lesson plans, Timetables).

## Decision
We chose **Yjs** for CRDT synchronization. It handles structure automatically; domain-level semantic conflicts are handled in the application layer.

## Date: 2026-04-22
