---
title: "ADR-006: Storage Strategy"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# ADR-006: Storage Strategy

## Status
Accepted

## Context
Handling images, documents, and library assets in a multi-tenant environment. Storage must be cost-effective, high-performance, and resilient to account suspension.

## Options Considered
1. **Cloudinary**: High performance but strict quota suspension (Vetoed).
2. **Supabase Storage**: Integrated but higher egress costs for high-volume content.
3. **ImageKit (Public)** + **Supabase (Private)**: Hybrid model.

## Decision
We chose the **Hybrid Model**.
- **ImageKit**: For images, library resources, and anything requiring high-performance CDN delivery (Free 20GB/mo tier).
- **Supabase Storage**: For private, institutional documents (Attendance reports, Financial docs) that don't need CDN.
- **URLs in DB**: Database only stores references; provider remains swappable.

## Consequences
- Cost optimization: Leverage ImageKit free tier.
- Resilience: ImageKit doesn't suspend on quota breach; performance is high for rural clients.

## Date: 2026-04-22
