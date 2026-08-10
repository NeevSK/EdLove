---
title: "Local-First Architecture Principles"
status: "active"
created: 2026-08-11
updated: 2026-08-11
author: "Naween"
tags: [architecture, local-first, event-sourcing, cynefin]
---

# Local-First Architecture Principles

Engineering conclusions distilled from personal exploration of layered systems
(journey-synthesis / journey-chronological / decision-architecture-framework are
the personal originals). Keep the principles; the journey is optional reading.

---

## 1. Event-Sourcing as the Source of Truth

For local-first, multi-device, multi-tenant systems holding historical wellbeing
data that must support derived insights: **use event-sourcing as the source of
truth** — immutable, append-only observations, not mutable records.

Why it wins here:

- **Multi-device conflict mostly dissolves.** Two devices appending different
  events to the same timeline don't conflict — they merge by union, ordered by
  timestamp + device id.
- **Insights are recomputable derived views** over the event log, not stored
  mutable state. Recompute on new logic instead of carrying stale derived numbers.
- **Tenant isolation and access control become a separate authorization layer**
  over the event log — decoupled from the sync/conflict problem itself.
- **Safer under material failure.** A half-written *append* is detectable and
  discardable; a half-written *overwrite* can silently corrupt the only copy of
  the truth. (Polanyi boundary-condition reasoning — see §3.)

## 2. Classify the Problem Before Fixing It (Cynefin)

For any layer, seam, or decision, ask which regime it's actually in:

| Regime | Cause → effect | What to do |
|---|---|---|
| **Obvious** | Fixed, known in advance | Apply best practice directly |
| **Complicated** | Knowable, needs expertise | Bring in the right specialist vocabulary; analyze |
| **Complex** | Only knowable in retrospect | Probe, sense, respond — don't over-plan |
| **Chaotic** | No discernible cause → effect | Act to stabilize first, diagnose after |

### The demarcation line (Complicated vs Complex)

It is **predictability in advance**, not layer count or number of parts. A stable,
documented contract across layers (an API call, a file-write syscall) is
**Complicated** even though it's cross-layer. An interaction whose runtime
conditions are uncertain (network quality, battery level, concurrent device
state, storage availability) is **Complex**.

Working heuristics:

- Multi-tenant isolation and RBAC → **Complicated** (solved territory, standard
  SaaS patterns, stable contracts).
- Local-first sync of historical, insight-bearing data across devices under
  flaky networks → **Complex** (runtime state genuinely uncertain in advance).
- Confusing bug ≠ Chaotic. Reproducible/traceable → **Complicated**, even if
  it takes real effort. Tangled but nothing burning → **Complex** (probe, log,
  hypothesize). Active incident, ongoing damage, no time → **Chaotic**
  (rollback/stabilize first, diagnose after).

## 3. Design Inside the Boundary Conditions (Polanyi's Dual Control)

Lower material layers (battery, storage, RAM, network, screen) don't determine
what upper layers (business logic, RBAC, insights) *do* — but they set **boundary
conditions** on what the upper layers can *achieve*. Upper layer has real
autonomy; lower layer has veto power under failure.

**Practical translation:** design as if the boundary conditions are a first-class
part of the architecture, not an edge case patched later — the way a building is
designed inside gravity, not around it.

Applied:

- Local writes must be safe under sudden power/storage loss (atomic/resumable).
- Event-sourcing (append, not overwrite) is safer under this failure mode than
  mutable-record updates.
- A battery/storage/network failure isn't "a small local bug" — it can cascade
  upward through sync logic, into server-side conflict handling, into
  institutional trust. Slow, foundational layers constrain what fast, small
  layers can do; a fast, small layer's failure can propagate upward and collapse
  a slow, large layer (Panarchy "remember"/"revolt").

## 4. The Three-Question Scaffold (any real decision)

1. **What's finite here, shared across competing demands?**
2. **What context was assumed when the current default was set?** (Every default
   was tuned for an assumed context; changing one alone is dangerous because
   other defaults may silently depend on it.)
3. **What's the cost of being wrong, and who pays — now, later, or someone else?**

## 5. Supporting Vocabulary

- **Coupling** (tight/loose) — how much changing one parameter forces
  reconsidering another.
- **Damping / slack** — how much a disturbance at one layer reaches the next
  undiminished vs. gets absorbed. Missing damping = fragile system.
- **Bang-bang vs. hysteresis vs. proportional control** — snap sharply at a
  threshold (causes flip-flop jank at the edge), snap with a buffer zone
  (prevents flip-flop), or blend continuously (smooth, harder to reason about).
  Examples: TCP congestion control, battery charging cutoffs, mobile OS
  low-storage process killing, naive online/offline detection causing sync
  mode-flips.
- **Attractor basin / bifurcation** — behavior stays qualitatively stable within
  a range; cross a threshold and it's a different regime entirely.
- **Quantization** — every layer carves something continuous into discrete units
  (bit width, batch size, page size); invisible until scale exposes it.
