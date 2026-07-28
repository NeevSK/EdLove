# Biomimicry Principles — Temporal Architecture for Gurudevi

Source material for how biological systems handle time, memory, and information encoding — abstracted into design principles. This file is the shared foundation; `01-data-architecture.md`, `02-ui-visual-design.md`, and `03-ux-interaction-design.md` each reference back to these.

## The Core Inversion

> Nature encodes time as a relative, decaying, distributed **texture** that the system itself is shaped by — never as an absolute, centralized, faithfully-retrieved **record**.

Software defaults to "store everything precisely, retrieve on demand." Nature defaults to "let time reshape the structure, read meaning off the shape." This is the load-bearing idea underneath everything below.

## The Nine Patterns

**1. Structure IS memory — not stored separately, but incorporated.**
Tree rings, coral bands, engrams-as-synaptic-modification, plant habituation-as-changed-disposition, mycelium's structure-is-the-memory. The past becomes a permanent alteration of present structure, not a fact in a retrievable slot.
→ Some history doesn't need a queryable row — it can quietly shift the system's default sensitivity going forward.

**2. Relative, not absolute — everything reads against its own local baseline.**
Coral "stress signature" = deviation from that colony's own texture, not a fixed global threshold. Time-cell scale invariance = the same shape, rescaled — logarithmic, not linear.
→ "Concerning pattern" should mean deviation from *this user's* baseline, never a fixed number applied to everyone.

**3. Decay is a tuned knob, not a leak to patch.**
Pheromone half-life, habituation rate, memorylessness in waiting-time distributions. Forgetting is designed, and the rate is adjusted by context (density, resource scarcity, stakes).
→ Relevance-decay should be tunable per data type and context, not "keep everything forever" by default.

**4. Rate and rhythm carry meaning independent of content.**
Quorum-sensing pulse frequency encodes cell state before any threshold is crossed.
→ How often someone logs something can be as informative as what they logged.

**5. Threshold = reinforcement-within-a-window, not a single instance.**
Venus flytrap's two-touches-in-30-seconds. Quorum sensing's population vote. A lone event is noise; count-within-a-bounded-window is signal — and unreinforced signals silently expire.
→ Don't flag from one data point; flag from repetition within a window, and let it expire cleanly if unreinforced.

**6. Sparse and distributed — never one canonical source of truth.**
Sparse neural coding beats grandmother-cell and dense coding. Lashley never found a single seat for a memory — meaning is distributed. Stigmergy puts the record in the shared environment, not any one agent.
→ Resist a single `daily_summary` row that claims to "be" the day. Let meaning live distributed and overlapping.

**7. Local containment over global broadcast.**
Mycelium's calcium-stress response stays within ~1,500 μm and arrests-and-resumes locally.
→ Most disturbances shouldn't cascade. A rough day in one domain shouldn't destabilize every other domain's summary.

**8. Collective, simultaneous resolution — not gradual reveal.**
Quorum ignition doesn't creep from a hotspot; the whole population approaches readiness in parallel and flips together.
→ Summaries can accumulate invisibly and appear whole when ready, rather than dribbling out.

**9. One substrate, many channels, differentiated by shape not separate plumbing.**
Two pheromones (explore vs. exploit), action vs. variation potentials in plants — same medium, different decay/shape.
→ One event substrate, differentiated by how each kind of event decays and propagates — not separate infrastructure per domain.

## Evidence-Quality Calibration (from the perceptual-biology rounds)

A general heuristic for weighing any future design claim: **fast + automatic + present in infancy/other primates + mechanistically explained = strong. Slow + culturally mediated + inconsistent across studies = weak.**

- **Strong tier:** occlusion/depth cues, Gestalt grouping (esp. connectedness > proximity > similarity), split-attention effect, preattentive processing, pareidolia/face detection (~80-100ms, present in infants and other primates)
- **Weak tier:** hue-specific emotion associations (red=anger is contested; brightness/saturation-as-valence is the part that actually replicates cross-culturally)
- **Mechanical-but-real tier (not evolutionary, but solid physics/biomechanics):** Fitts's Law, Hick's Law, thumb-zone ergonomics — true and useful, just a different evidentiary category from perceptual biology

## Where Biology Stops Being a Useful Guide

Typography (type scale ratios, whitespace rhythm) is closer to print-history/cultural convention than biology — forcing a nature-parallel there would overreach. Named honestly rather than papered over.
