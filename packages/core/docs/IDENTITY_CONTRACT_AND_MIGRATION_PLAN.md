# Identity Contract and Migration Plan

This document defines the long-term identity model for `gurudevi-mobile` and the migration path from the current mixed naming/guest semantics to a cleaner, stable architecture.

## Goals

- Separate temporary guest state from domain role.
- Make display naming explicit and stable.
- Keep structured name fields for profile completeness and formal use cases.
- Preserve backward compatibility during migration.
- Ensure onboarding, profile completion, auth bootstrap, DB triggers, and UI all follow the same contract.

## Core Principle

The platform currently mixes three different concepts:

- **Session state**: anonymous vs authenticated
- **Display identity**: the name shown in the app
- **Domain identity**: the user’s working role/capacity in the platform

These must be treated as separate axes.

## Canonical Identity Model

### 1. Session State

Purpose: answers whether the user is still a temporary guest or a durable account.

Recommended field:

- `identity_state`: `anonymous | onboarded | verified`

Existing compatibility field:

- `is_anonymous: boolean`

Rules:

- `guest` is a session state, not a role.
- anonymous users may exist without a finalized domain role.
- session state must never be inferred from `capacity`.

### 2. Display Identity

Purpose: answers what the app should call the user in UI surfaces.

Recommended field:

- `display_name`

Current compatibility field:

- `full_name`

Rules:

- onboarding owns display name collection.
- display name is what appears in greetings, cards, headers, and avatars.
- `full_name` may remain as a compatibility alias until migration is complete.

### 3. Structured Identity

Purpose: answers the user’s structured/profile name data.

Fields:

- `first_name`
- `last_name`

Rules:

- profile completion owns these fields.
- these fields are used for profile completeness, exports, and formal presentation.
- do not use them as a proxy for session state or role.

### 4. Public Handle

Purpose: answers how the user can be referenced publicly.

Field:

- `username`

Rules:

- optional during onboarding.
- unique when present.
- lowercase normalized handle, not a display name.
- should not be substituted for `display_name`.

### 5. Domain Capacity

Purpose: answers what the user can do in the domain model.

Field:

- `capacity`

Examples:

- `student`
- `teacher`
- `principal`
- `admin`

Rules:

- capacity is a real persona, not a temporary auth placeholder.
- `guest` should not be a normal capacity in the long-term model.
- guest state should be represented by `identity_state` / `is_anonymous`.

## What Should Own What

### Auth bootstrap

Owns:

- `is_anonymous`
- `identity_state`
- initial auth metadata

Should not own:

- display name as final canonical truth
- structured profile fields
- long-term capacity defaults

### Onboarding

Owns:

- `display_name`
- initial role/capacity selection
- initial bond creation

Should not own:

- structured first/last name
- public handle

### Profile completion

Owns:

- `first_name`
- `last_name`
- `username`
- remaining profile completeness fields

Should not own:

- guest state
- temporary auth bootstrap logic

### Database triggers

Own:

- backfilling and mirroring compatibility fields
- enforcing normalization during auth updates

Should not:

- invent conflicting semantics
- independently choose a different meaning for display name vs structured name

### UI

Owns:

- showing the correct field labels
- placing each field in the correct step
- never exposing legacy confusion to the user

Should not:

- treat `full_name` as a handle
- treat `guest` as a role

## Migration Plan

### Phase 1: Introduce explicit fields

Add or standardize:

- `display_name`
- `first_name`
- `last_name`
- `identity_state`

Keep compatibility:

- `full_name`
- `is_anonymous`
- `username`
- `capacity`

### Phase 2: Make the new fields authoritative

Update flows so that:

- onboarding writes `display_name`
- profile completion writes `first_name`, `last_name`, and `username`
- auth bootstrap writes only temporary guest/session metadata
- capacity is selected as a real persona, not a guest placeholder

### Phase 3: Backfill and mirror

Database and adapters should:

- backfill `display_name` from `full_name`
- derive `full_name` from `display_name` only for compatibility
- compose `display_name` from `first_name` + `last_name` when needed
- keep `username` unique and optional

### Phase 4: Remove legacy ambiguity

Deprecate:

- guest-as-capacity logic
- full_name-as-handle logic
- role bootstrap that depends on guest state

### Phase 5: Tighten validation

Add tests and schema checks for:

- anonymous onboarding
- display-name-only onboarding
- structured profile completion
- handle uniqueness
- profile completeness calculations

## Recommended Field Semantics

- `display_name`: what the app shows by default
- `full_name`: compatibility mirror during migration
- `first_name` / `last_name`: structured identity
- `username`: public handle
- `is_anonymous` / `identity_state`: guest/session state
- `capacity`: real domain role

## Decision Rules

If there is a conflict:

1. `identity_state` wins over any role-like guess.
2. `display_name` wins over `full_name` for UI.
3. `first_name` + `last_name` win for structured identity.
4. `capacity` wins for permissions and domain actions.
5. `username` is never used as a fallback display name.

## Rollout Checklist

- Update schema and migrations.
- Update auth bootstrap and triggers.
- Update onboarding copy and data writes.
- Update profile completion screens and hooks.
- Update profile editor surfaces.
- Update completion scoring labels.
- Update tests for identity state and naming behavior.
- Audit any remaining `full_name` assumptions.

## Open Questions

- Should `display_name` replace `full_name` immediately, or should the two coexist for one release?
- Should anonymous users be allowed to pick a real capacity before account verification?
- Should `username` be optional forever or become required for public profile surfaces?

## Suggested Next Step

Implement `display_name` as the new canonical UI field, keep `full_name` as a compatibility mirror, and remove `guest` from any future capacity decisions.
