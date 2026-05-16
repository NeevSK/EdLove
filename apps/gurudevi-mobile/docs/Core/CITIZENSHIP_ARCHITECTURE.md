# Citizenship & Identity Architecture

This document describes the current canonical identity model for `gurudevi-mobile`.
It is intentionally aligned with the identity contract in `packages/core/docs/IDENTITY_CONTRACT_AND_MIGRATION_PLAN.md`.

## Core Model

The platform now treats identity as four separate axes:

- `identity_state`: whether the session is `anonymous`, `onboarded`, or `verified`
- `display_name`: the name shown in app UI
- `first_name` / `last_name`: structured profile identity
- `capacity`: the user’s real domain role in ReBAC

## Key Rules

- `identity_state` is the only guest/anonymous marker.
- `guest` is not a capacity or role in the canonical model.
- `display_name` is the user-facing name.
- `full_name` is a compatibility mirror only.
- `username` is a public handle, not a display name or role.
- `capacity` must represent a real persona such as `student`, `teacher`, `principal`, `admin`, or `member`.

## Citizenship Lifecycle

Citizenship still describes participation depth, but it is separate from guest state:

| Level | Name | Meaning |
| :--- | :--- | :--- |
| 0 | Wanderer | Anonymous session, local-first or pre-onboarding state |
| 1 | 2nd Class | Authenticated user with private cloud sync |
| 2 | 1st Class | Authenticated user with institutional bonds |

This lifecycle is about participation and data residency, not about role.

## What Onboarding Owns

Onboarding now owns:

- `display_name`
- initial bond / capacity selection

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

Auth bootstrap now owns:

- `identity_state`
- initial auth metadata

It should not invent a guest role or a guest capacity.

## What the Database Owns

Database triggers and migrations should:

- normalize `display_name`
- mirror `full_name` only for compatibility
- preserve `first_name`, `last_name`, and `username`
- keep `identity_state` authoritative for anonymous vs onboarded state

## What UI Should Show

- Show `display_name` in greetings, cards, and headers.
- Show `first_name` / `last_name` in profile completion and structured forms.
- Show `username` as the public handle.
- Never surface `guest` as a role choice.

## Relationship to Citizenship

Citizenship is still useful as a participation model:

- Wanderer: anonymous session
- 2nd Class: authenticated, personal cloud
- 1st Class: authenticated, institution-bound

But citizenship is not the same thing as role, and it is not the same thing as session state.

## Decision Summary

- `identity_state` wins for anonymous/onboarded/verified state.
- `display_name` wins for visible UI name.
- `first_name` + `last_name` win for structured identity.
- `capacity` wins for permissions and domain behavior.
- `username` wins for public handle references.

## Current Architectural Direction

The implementation now follows a pure model:

- no guest capacity
- no guest role
- no guest bond type
- anonymous users are modeled by `identity_state`
- onboarding collects display name first
- structured identity is completed later

