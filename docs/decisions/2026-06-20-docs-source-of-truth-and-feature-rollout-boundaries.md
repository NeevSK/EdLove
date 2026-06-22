---
title: "Docs Source of Truth and Feature Rollout Boundaries"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Antigravity"
tags: [docs, architecture, feature-flags, sanctuary, source-of-truth]
---

# Docs Source of Truth and Feature Rollout Boundaries

## Purpose

This document resolves the documentation tension around feature rollout, permissions, offline storage, and the role of the June 19 architecture docs.

The goal is not to restate every prior document. The goal is to define how the docs should be read together so implementation can proceed without mixing older code mental models with the newer sanctuary architecture.

---

## 1. Reading Order and Authority

The current documentation set has multiple layers of authority:

1. The June 19 and June 20 sanctuary documents are the newest primary references for feature rollout, authorization, and data flow.
2. The June 15 sanctuary documents remain valid where they are not contradicted by the newer June 19 material.
3. The codebase may still reflect older implementation patterns and must not be treated as the authoritative architecture if it conflicts with the newer docs.

### Current authority rule

- A newer document can clarify a previous one.
- A newer document cannot silently override an older one unless it explicitly supersedes it or the two are clearly in the same decision chain.
- If a code path conflicts with the newer docs, the docs win and the code is treated as stale mental model residue until reconciled.

This rule matters because the repository contains both current architecture intent and older implementation artifacts that were correct for an earlier phase but are no longer the target.

---

## 2. The June 19 ADR Is Supplementary, Not Absolute

The June 19 ADR is valid on its own terms and should be used where it adds precision. It is supplementary to the broader sanctuary architecture, not a replacement for it.

It is especially useful for:

- clarifying that CASL is retired
- distinguishing Shape 1 and Shape 2 authorization
- identifying offline write authorization as an unresolved gap

It should not be used to erase the broader architecture around:

- the three gates
- the feature-flag rollout split
- the storage and sync lifecycle
- the account-scoped SQLite model

### Practical interpretation

- Use the June 19 ADR when you need a sharper decision on authorization mechanics.
- Use the broader sanctuary and data-state docs when you need the system model.
- If the ADR feels narrower than the system model, treat it as a detail inside the larger model, not as a replacement for the whole model.

---

## 3. What We Now Treat As Settled

The docs collectively settle the following points:

- Each account has its own SQLite file.
- Zone A, Zone B, and Zone C are different sync classes.
- Feature rollout is not the same thing as authorization.
- `permissionsMap` is not the feature rollout system.
- `useSanctuaryFeature` is the intended UI-facing composition point.
- Cedar remains the structural authz engine.
- Feature rollout needs a real offline cache path.
- Supabase is not, by itself, an offline store.

These are architectural decisions, not implementation preferences.

---

## 4. What Must Not Be Confused

### A. Feature rollout vs authorization

Feature rollout answers whether a code path is operationally active for a cohort.
Authorization answers whether a principal is structurally allowed to act on a resource.

They may both be involved in one screen, but they are not the same check.

### B. Offline cache vs reactive state

Zustand is reactive runtime state.
It is not sufficient as the only durable offline source.

`storage` is the unified small-value persistence abstraction.
It can bootstrap the app and hold cached rollout state, but it is not a structured database.

SQLite is the durable structured store.
It is the correct place when the cache needs to survive restart and participate in richer querying or lifecycle management.

### C. Shape 1 vs Shape 2

- Shape 1: coarse authz, currently associated with `permissionsMap`
- Shape 2: per-record permissions attached at fetch time

UI code should not re-derive either shape at render time.

---

## 5. Implementation Reading Rule

When code and docs differ, use this hierarchy:

1. The newest relevant ADR or guide.
2. The supporting data/state lifecycle doc.
3. The agent execution guide for mechanical steps.
4. Existing code only as an implementation clue, not as a source of truth.

This keeps the team from accidentally preserving old assumptions just because they are already in the code.

---

## 6. Direct Implications For Feature Rollout Work

Before implementation, we should hold these implications constant:

- GrowthBook is the intended primary rollout engine.
- A local offline cache is required.
- Supabase may support sync or fallback workflows, but it does not replace a local cache.
- `permissionsMap` should not be expanded into rollout flags.
- `useSanctuaryFeature` should become the main composition surface for UI checks.

---

## 7. Conclusion

The documentation set is not contradictory when read with the correct hierarchy. The newer June 19/20 docs refine the older sanctuary architecture, and the codebase should be audited against those documents rather than treated as the final authority.

This document exists to make that reading order explicit so implementation can move forward without accidental regression to older mental models.
