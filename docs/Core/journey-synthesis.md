# The Working Model — Distilled

For architecting local-first, multi-device, multi-tenant systems under low-connectivity, low-end-device constraints (and generally, for reasoning about any deeply layered technical system).

---

## The core realization

You don't hold a full stack in your head. You hold **two orthogonal classifiers** and **one hard constraint principle**. Everything else generated in the exploration was either a piece of these three, or a metaphor that got discarded because it only captured a piece.

## 1. Cynefin — what kind of problem is this part, right now?

For any given layer, seam, or decision, ask which regime it's actually in:

| Regime | Cause → effect | What to do |
|---|---|---|
| **Obvious** | Fixed, known in advance | Apply best practice directly |
| **Complicated** | Knowable, needs expertise | Bring in the right specialist vocabulary; analyze |
| **Complex** | Only knowable in retrospect | Probe, sense, respond — don't over-plan |
| **Chaotic** | No discernible cause → effect | Act to stabilize first, diagnose after |

**Why it matters:** most of the earlier metaphor-search (gears vs. basins vs. bang-bang) was actually reaching for the *wrong* vocabulary for a *given layer* — gears/mechanical language fits Obvious/Complicated layers; basin/threshold language fits Complex layers. The mismatch, not a missing metaphor, was the real source of "almost fits, not quite."

### The demarcation question: what actually separates Complicated from Complex?

**The official Cynefin line:** Complicated = a right answer exists and is knowable in advance by an expert, even if real analysis is needed to find it. Complex = no right answer is knowable in advance at all — the causal relationship can only be understood *after acting and observing*. The line is about **predictability in advance**, not about how many layers or parts are involved.

**First working guess (Wittgenstein-ladder style): "within one layer/context = Complicated, crossing between two layers = Complex."** Intuitive, and correlated with the real thing often enough to feel right — layer boundaries are usually also scale/speed boundaries (RAM in nanoseconds, network in hundreds of milliseconds), which is exactly Panarchy's territory of different-speed layers meeting. So cross-layer interaction *does* skew Complex more often than within-layer behavior does.

**Where that guess breaks:** taken literally, it proves too much. Nothing runs without crossing layers — app calls OS calls silicon, always — so "crosses a layer" as the trigger collapses to "everything is Complex," which discriminates nothing. It would also misclassify a genuinely Complex single-layer problem (e.g., a large cache's eviction behavior under adversarial load, no cross-layer interaction needed) as merely Complicated just because it's "within one context."

**The corrected, still-practical demarcation:** it isn't *whether* layers cross, it's **whether the interaction's conditions are stable/specified or uncertain/variable at runtime**:
- Stable, documented contract across layers (an API call, a file-write syscall) → **Complicated**, even though it's cross-layer.
- Interaction where the lower layer's runtime state is uncertain (network quality, battery level, concurrent device state, storage availability) → **Complex**.

This keeps the useful part of the original instinct (cross-layer interaction is a good place to *slow down and check*) without the failure mode (everything being cross-layer doesn't mean everything is Complex).

### Applied demarcation examples

- Multi-tenant isolation and RBAC → **Complicated** (solved territory, standard SaaS patterns, stable contracts).
- Local-first sync of historical, insight-bearing data across multiple devices under flaky networks → **Complex** (runtime state — network quality, device state, arrival order — is genuinely uncertain in advance).

### Working heuristic — bugs

A common misread is "confusing bug = Chaotic." Usually wrong. Most bugs are Complicated — cause-effect exists, it just hasn't been traced yet:

- Reproducible, traceable bug → **Complicated**, even if it takes real effort to find.
- Tangled bug, unclear cause, but nothing actively burning → **Complex** — probe, add logging, form hypotheses, sense-make.
- Active incident, unclear cause, ongoing damage, no time to investigate first → **Chaotic** — stabilize first (rollback, kill traffic), diagnose after.

## 2. Panarchy — how does this part move, across scale and time?

Systems don't sit still, and different layers move at different speeds:

- **Growth → conservation → collapse → reorganization** — the phase a given layer is cycling through.
- **"Remember"** — slow, large, foundational layers constrain what fast, small layers can do (Polanyi's boundary conditions, same mechanism).
- **"Revolt"** — a fast, small layer's failure can propagate upward and collapse a slow, large layer that looked stable and well-understood.

**Why it matters:** this is what explains why a battery/storage/network failure isn't "a small local bug" — it can cascade upward through sync logic, into server-side conflict handling, into institutional trust, collapsing layers that were individually Complicated-and-solved into Chaotic.

## 3. Polanyi's dual control — the hard-constraint principle

Lower material layers (battery, storage, RAM, network, screen) don't determine what the upper layers (business logic, RBAC, insights) *do* — but they set **boundary conditions** on what the upper layers can *achieve*. The upper layer has real autonomy; the lower layer has veto power under failure.

**Practical translation:** design as if the boundary conditions are a first-class part of the architecture, not an edge case to patch in later — the same way a building is designed inside gravity, not around it.

## 4. Supporting vocabulary (use where the primary three don't have a word yet)

These aren't separate models — they're refinements that live *inside* Complex-regime, Panarchy-transition situations:

- **Coupling** (tight/loose) — how much changing one parameter forces reconsidering another.
- **Damping / slack** — how much a disturbance at one layer reaches the next layer undiminished vs. gets absorbed. Missing damping = fragile system (small jitters propagate everywhere).
- **Bang-bang vs. hysteresis vs. proportional control** — three ways to handle a threshold: snap sharply (simple, causes flip-flop jank at the edge), snap with a buffer zone (prevents flip-flop), or blend continuously (smooth, harder to reason about).
- **Attractor basin / bifurcation** — within a range, behavior stays qualitatively stable; cross a threshold, and it's a different regime entirely, not a worse version of the same one.
- **Quantization** — every layer carves something continuous into discrete units (bit width, batch size, page size); the unit choice is invisible until scale exposes it.
- **Defaults as frozen assumptions** — every default was tuned for an assumed context; it's dangerous to change alone because other defaults may silently depend on it staying fixed.

## 5. The three-question scaffold (use this on any real decision)

1. **What's finite here, shared across competing demands?**
2. **What context was assumed when the current default was set?**
3. **What's the cost of being wrong, and who pays — now, later, or someone else?**

## 6. The one architectural conclusion this produced, applied

For local-first + multi-device + multi-tenant + historical wellbeing data with derived insights:

**Use event-sourcing as the source of truth.** Immutable, append-only observations, not mutable records.

- Multi-device conflict mostly dissolves — two devices appending different events to the same timeline don't conflict, they merge by union, ordered by timestamp + device id.
- Insights are **recomputable derived views** over the event log, not stored mutable state — recompute on new logic instead of carrying stale derived numbers.
- Tenant isolation and account/ReBAC access control become a separate authorization layer over the event log — decoupled from the sync/conflict problem itself.
- This is specifically safer under Polanyi-style material failure: a half-written *append* is detectable and discardable; a half-written *overwrite* can silently corrupt the only copy of the truth.

## 7. What this model is for, and what it isn't

This scaffold is an **advance organizer** — useful precisely because it gives new specific facts a place to land, making them faster to absorb and connect. It is not itself the understanding. Per the way advance organizers actually work: it only produces real transfer if followed promptly by contact with specific, real decisions — schemas, numbers, actual failure cases in Gurudevi. Left untested, it goes stale or becomes something performable rather than something load-bearing.

**Next real step:** take one concrete seam in Gurudevi — e.g., the boundary between local SQLite state and server sync for a single wellbeing entry — and run it through Cynefin (what regime is it in), Panarchy (what phase, what's it coupled to at what speed), and Polanyi (what material boundary conditions bound it) explicitly, with real field names, real sizes, real failure cases. That's the first point where this document either proves useful or reveals what's still missing.
