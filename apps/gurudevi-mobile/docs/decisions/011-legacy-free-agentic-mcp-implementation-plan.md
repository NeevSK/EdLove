# Decision 011: Legacy-Free Agentic MCP Implementation Plan

## Status

Proposed

## Context

Gurudevi Mobile has moved through three identity eras:

- `role` era: static labels and direct branching
- POA era: policy and capability boundaries
- ReBAC era: relationship-first identity via bonds, capacities, and perspective

We now want a final target state with:

- no runtime `role`
- no runtime `authority`
- `capacity` as the SSOT for contextual identity meaning
- `bond` as the SSOT for relationship identity
- `perspective` as the SSOT for active runtime context
- MCP support for delegated agent execution

The implementation can be breaking during migration, but the final result must be
legacy-free.

## Decision

We will use a staged cutover to replace legacy identity terms and behavior with
the canonical ReBAC + POA + CASL + MCP stack.

The target runtime contract is:

- ReBAC resolves the person-in-context
- POA defines the contract and boundary
- CASL computes the allowed action
- MCP exposes tools under scoped delegation
- agents execute only within approved scope

## Implementation Phases

### Phase 1: Canonicalize Identity

Goals:

- make `capacity`, `bond`, and `perspective` the only runtime identity terms
- ensure `identity_state` is separate from authorization
- preserve `citizenship` as participation depth only

Tasks:

- define the final `Bond` schema
- define the final `Perspective` schema
- ensure `UserContext` is derived, not manually invented
- remove legacy fallback logic from new code paths

Exit criteria:

- runtime types expose canonical fields only
- new code does not add `role` or `authority` dependencies

### Phase 2: Remove Legacy Runtime Reads

Goals:

- stop UI and business logic from reading legacy fields
- route all behavior through derived context

Tasks:

- replace `role` checks with `capacity` or abilities
- replace `authority` checks with derived policy and capability logic
- replace direct profile branching with bond-driven context
- remove compatibility aliases from UI and navigation

Exit criteria:

- `role` and `authority` are no longer used by runtime screens
- fallback behavior uses canonical fields only

### Phase 3: Harden ReBAC and Perspective

Goals:

- make the ReBAC model self-sufficient
- ensure active perspective selection is deterministic

Tasks:

- formalize active bond selection rules
- handle multiple bonds consistently
- define bond validity and status handling
- ensure permissions derive from current context

Exit criteria:

- perspective selection is predictable
- abilities are derived only from valid canonical context

### Phase 4: Add MCP Delegation Layer

Goals:

- expose tools for humans and agents without leaking authority
- constrain every tool invocation with scope and audit data

Tasks:

- define tool contracts
- add delegation grants
- attach expiry and scope to agent tasks
- make every invocation policy-checkable

Exit criteria:

- agents can act only through scoped grants
- tool calls are auditable and attributable

### Phase 5: Purge Legacy Compatibility

Goals:

- delete temporary adapters and bridge logic
- enforce the pure canonical model

Tasks:

- remove `role` and `authority` from runtime schemas
- delete fallback chains that use legacy fields
- update docs, tests, and examples to the new vocabulary
- add checks that fail when legacy runtime usage reappears

Exit criteria:

- no runtime legacy identity reads remain
- repo docs describe only the canonical model

### Phase 6: Lock The New Contract

Goals:

- prevent drift back to legacy concepts

Tasks:

- add lint or grep gates
- add seam tests for permission, navigation, and agent delegation
- document ownership of each layer

Exit criteria:

- CI blocks legacy reintroduction
- architecture stays pure after migration

## Recommended Order Of Work

1. Canonicalize identity types and store shape.
2. Update `usePermissions` and navigation to consume only canonical context.
3. Remove UI/runtime legacy reads.
4. Harden ReBAC and perspective selection.
5. Add MCP delegation and audit scaffolding.
6. Delete legacy bridges and lock the repo.

## Risks

- Some screens may break during cutover.
- Existing adapters may still depend on old data shape.
- Agent tooling can become a hidden authority layer if scope is not enforced.
- The app can drift if docs remain legacy-named while code is canonical.

## Success Criteria

We are done only when all of the following are true:

- `role` is gone from runtime identity decisions
- `authority` is gone from runtime identity decisions
- `capacity` is the canonical contextual identity term
- `bond` is the canonical relationship object
- `perspective` is the canonical active runtime lens
- MCP tools are delegated and scoped
- every action is attributable and auditable
- docs, code, and tests all describe the same model

## Notes

This plan accepts temporary breakage during migration.
The final state must be elegant, legacy-free, and stable enough to serve as the
platform SSOT for human users and agents alike.

