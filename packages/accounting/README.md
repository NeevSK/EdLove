---
title: "@repo/accounting"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, accounting]
---

# @repo/accounting

## Purpose
`@repo/accounting` is the financial records and ledger domain for future Gurudevi ERP expansion.

## Owns
- accounting contracts, ledger logic, budgeting flows, and finance-oriented screens when they become active
- package-local web/native accounting variants

## Does Not Own
- payment gateway orchestration
- app shell routing
- generic admin governance that is not accounting-specific

## Collaborates With
- `@repo/core` for permissions and tenancy
- `@repo/payments` for collection-side workflows
- `@repo/admin` for institutional reporting surfaces

## Web Placement
When accounting screens arrive, dense browser-first accounting views belong here rather than in the app layer.

## App Adapter Rule
The app may register routes, but accounting ownership belongs here.
