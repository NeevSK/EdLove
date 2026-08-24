---
title: "@repo/profile"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, profile]
---

# @repo/profile

## Purpose
`@repo/profile` is the identity-expression domain for people and school-facing presence. It owns profile rendering, social presentation, completion, and profile-linked public views.

## Owns
- **Individual Story (Individual Holon)**
- Personal growth metrics (Nature Paths: Lotus, Banyan, River, Crystal)
- Private journey tracking (Whispered Moments, Living Journey)
- Social identity-expression (Avatar, Bio, Social Links, Thuthimal rewards)
- Profile rendering and profile-linked public views

## Does Not Own
- **Institutional Duty (The "Member")**
- Staff attendance, presence, and leave tracking (moves to `@repo/people`)
- School-wide ecosystem health metrics (moves to `@repo/people`)
- Auth/session control
- App shell routing and linking
- Classroom or admin domain governance

## Collaborates With
- `@repo/core` for identity data and entity access
- `@repo/ui` for shared surfaces
- `@repo/scanner-kit` for QR presentation

## Web Placement
`*.web.tsx` files are allowed inside `src/screens` and `src/components` when profile experiences need browser-native layouts.

## App Adapter Rule
The app layer may keep route adapters for profile routes, but profile-specific composition and web rendering should live in this package.
