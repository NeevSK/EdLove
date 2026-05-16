# Legacy-Free Agentic MCP SSOT

## Purpose

This document is the long-term architectural source of truth for Gurudevi Mobile.
It defines how we move from legacy `role` / `authority` thinking to a pure,
relationship-first system that can support human users, AI agents, and MCP tools
without preserving old identity vocabulary in runtime code.

## North Star

The platform should end in a legacy-free model where:

- `Bond` is the atomic unit of relationship identity.
- `Capacity` is the canonical expression of what a user can be in context.
- `Perspective` is the active lens the app uses at runtime.
- `ReBAC` is the source of human relational truth.
- `POA` is the contract and policy boundary.
- `CASL` is the ability engine that evaluates concrete actions.
- `MCP` exposes tools and resources for delegated execution.
- `AI` assists and executes within policy, but never becomes authority.

The final system must not depend on `role` or `authority` as runtime sources of
truth.

## Core Principle

Human meaning and machine meaning are not the same thing.

- Human meaning: "This person is a teacher, principal, founder, parent, or staff member."
- Machine meaning: "This bond, in this entity, with this capacity, currently has this perspective and these abilities."

The job of the architecture is to preserve the human meaning while removing the
legacy machine labels.

## Canonical Concepts

### Bond

A bond is the relationship between a user and an entity.

Typical fields:

- `id`
- `userId`
- `entityId`
- `entityType`
- `capacity`
- `status`
- `validFrom`
- `validUntil`
- `metadata`

Bond answers: who is this user in relation to what entity?

### Capacity

Capacity is the canonical runtime expression of the user's contextual function.

Examples:

- `student`
- `teacher`
- `principal`
- `admin`
- `founder`
- `staff`
- `member`

Capacity answers: what is this user allowed to be in this relationship?

### Perspective

Perspective is the currently active bond and the set of available bonds.

Perspective answers: which relationship is the app currently acting through?

### Identity State

Identity state is separate from authorization.

Examples:

- `anonymous`
- `onboarded`
- `verified`

Identity state answers: what lifecycle state is the session in?

### Citizenship

Citizenship describes participation depth and product experience tier.
It is not a permission model.

Citizenship answers: how deeply is the user participating in the ecosystem?

### Ability

Ability is the executable permission result derived from context.

Ability answers: can this action happen on this subject in this context?

## What Gets Purged

These must disappear from runtime truth:

- `user.role`
- `profile.role`
- `context.role`
- `user.authority`
- `profile.authority`
- `context.authority`
- role arrays used as permission sources
- fallback chains that treat `role` or `authority` as source of truth

These can exist only in narrow compatibility boundaries during migration:

- adapter code
- backfill scripts
- import/export translators
- temporary data repair jobs

## Layer Responsibilities

### ReBAC

Owns the real relationship model.

Allowed to own:

- bonds
- capacities
- perspective selection inputs
- relationship status
- valid date windows

Must never own:

- UI labels
- route decisions
- business policy semantics
- agent tool authorization by itself

### POA

Owns the contract boundary between intent and execution.

Allowed to own:

- route metadata
- action/subject contracts
- policy gates
- audit metadata

Must never own:

- raw relationship storage
- legacy role fallback logic
- direct UI business branching

### CASL

Owns permission derivation.

Allowed to own:

- action and subject evaluation
- condition-based gating
- contextual ability composition

Must never own:

- identity storage
- transport auth
- bond persistence
- UI state

### MCP

Owns tool exposure.

Allowed to own:

- tool definitions
- resource access
- delegated execution
- structured input/output contracts

Must never own:

- unlimited backend access
- implicit admin privilege
- hidden identity logic
- policy bypass

### AI / Agents

Own delegated work, not authority.

Allowed to own:

- drafting
- summarizing
- proposing
- orchestrating approved steps
- calling tools inside scope

Must never own:

- permanent authority
- unscoped database access
- hidden role upgrades
- policy bypass

## Human And Agent Flow

### Human Flow

1. User authenticates.
2. Identity state is resolved.
3. Bonds are loaded.
4. Perspective is selected.
5. Capacity is derived from the active bond.
6. CASL computes abilities.
7. POA guards routes and contracts.
8. UI renders only from derived context.

### Agent Flow

1. Human delegates a task.
2. System issues a scoped grant.
3. Agent receives only approved tools and resources.
4. Every tool call is checked against POA and CASL.
5. The action is audited with human principal, active perspective, and scope.

## MCP Trust Model

MCP must be treated as a tool boundary, not as a permission bypass.

Required MCP fields and controls:

- principal identity
- active perspective
- tool scope
- expiry
- audit trail
- action trace

Every tool invocation must answer:

- who delegated this?
- what scope was granted?
- which perspective was active?
- which tool was called?
- what changed?

## Legacy-Free UI Rule

UI components must only read:

- `activeBond`
- `availableBonds`
- `capacity`
- `primaryCapacity` only when a fallback is necessary
- `identityState`
- derived abilities

UI components must never read:

- `role`
- `authority`
- any legacy compatibility field

## AI-Era Direction

The future architecture should be:

- relationship-first
- policy-explicit
- ability-derived
- agent-delegated
- audit-complete
- legacy-free

AI should help people and accelerate work, but it should never become the source
of truth for authority.

