---
title: "Citizenship & Identity Architecture"
status: "active"
created: 2026-04-18
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Citizenship & Identity Architecture

This document describes the current canonical identity model for `gurudevi-mobile`.
It is intentionally aligned with the identity contract in `packages/core/docs/IDENTITY_CONTRACT_AND_MIGRATION_PLAN.md`.

## Core Model

The platform treats identity as separate axes:

- session mode: no session, Supabase anonymous session, or non-anonymous session
- onboarding state: whether the user has completed the mandatory setup
- citizenship: registration/verification level (`THIRD_CLASS`, `SECOND_CLASS`, `FIRST_CLASS`)
- `display_name`: the name shown in app UI
- `first_name` / `last_name`: structured profile identity
- `capacity`: the user’s real domain role in ReBAC

## Key Rules

- Supabase anonymous sessions are valid onboarding identities, not public-only visitors.
- Anonymous users use the normal Cedar policy surface; there is no guest Cedar policy.
- A valid authenticated session is not the same as a verified account.
- `guest` is not a capacity, role, citizenship level, or bond type.
- `display_name` is the user-facing name.
- `full_name` is a compatibility mirror only.
- `username` is a public handle, not a display name or role.
- `capacity` must represent a real persona such as `student`, `teacher`, `principal`, `admin`, or `member`.

## Citizenship Lifecycle

Citizenship still describes participation depth, but it is separate from guest state:

| Level | Name | Meaning |
| :--- | :--- | :--- |
| 3 | Third Class | Anonymous or lowest authenticated registration state |
| 2 | Second Class | Verified email/provider account |
| 1 | First Class | Explicitly granted elevated registration/institutional status |

This lifecycle is about participation and data residency, not about role.

## What Onboarding Owns

Onboarding owns:

- `display_name`
- explicit primary capacity selection
- creation of the initial personal-sanctuary bond

Onboarding does not own:

- `first_name`
- `last_name`
- `username`
- guest state

## What Profile Completion Owns

Profile completion now owns:

- `first_name`
- `last_name`
- `username`

## What Auth Bootstrap Owns

Auth bootstrap owns:

- session mode and token validity
- routing to onboarding when the onboarding contract is incomplete

It should not invent a guest role or a guest capacity.

## What the Database Owns

Database triggers and migrations should:

- normalize `display_name`
- mirror `full_name` only for compatibility
- preserve `first_name`, `last_name`, and `username`
- keep `is_anonymous`, onboarding completion, and citizenship as separate persisted facts

## What UI Should Show

- Show `display_name` in greetings, cards, and headers.
- Show `first_name` / `last_name` in profile completion and structured forms.
- Show `username` as the public handle.
- Never surface `guest` as a role choice.

## Relationship to Citizenship

Citizenship is still useful as a participation model:

- Third Class: anonymous or lowest authenticated registration
- Second Class: verified email/provider account
- First Class: explicit elevated/institutional status

But citizenship is not the same thing as role, and it is not the same thing as session state.

## Decision Summary

- session mode wins for runtime authentication state.
- onboarding completion wins for app-entry readiness.
- citizenship wins for registration/verification access requirements.
- `display_name` wins for visible UI name.
- `first_name` + `last_name` win for structured identity.
- `capacity` wins for permissions and domain behavior.
- `username` wins for public handle references.

## Current Architectural Direction

The implementation now follows a pure model:

- no guest capacity
- no guest role
- no guest capacity, role, citizenship, or bond type
- anonymous users may be onboarded and use a personal-sanctuary bond
- onboarding collects display name and primary capacity
- structured identity is completed later
