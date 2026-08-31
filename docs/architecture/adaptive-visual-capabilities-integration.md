# Gurudevi adaptive capabilities integration

Status: active architecture decision  
Created: 2026-08-31

Production failure-state requirements and remaining hardening work are tracked in [adaptive-capabilities-production-hardening-plan.md](./adaptive-capabilities-production-hardening-plan.md).

## Decision

Gurudevi uses two specialized policy tracks over one runtime-facts boundary:

```text
Native runtime signals
        ↓
RealityProvider / worker runtime adapters
        ↓
Normalized runtime conditions
        ├── VisualCapabilities resolver
        │     └── visual components
        └── EfficiencyPolicy resolver
              └── background, storage, network operations
```

This is one integrated efficiency program, not two independent implementations. The visual and operational resolvers remain separate because their decisions have different safety and product semantics.

## Visual track

`useVisualCapabilities()` is the only policy surface visual components should use. It resolves:

- artwork loading and decode behavior;
- ambient effects, blur, and rich animation;
- celebration particle limits;
- visual prefetch behavior;
- Auto, Low, and High fidelity;
- reduced-motion accessibility overrides.

Visual components must not inspect memory, device models, battery state, network type, or PixelRatio directly. Approved artwork remains available at every tier.

## Operational track

`evaluateEfficiency()` is the policy surface for non-urgent work. It returns `allow`, `defer`, or `reduce` for:

- background synchronization;
- storage maintenance and cache writes;
- analytics;
- media prefetching;
- retry and cleanup work.

It must defer or reduce work when the device is offline, critically low on storage, low on battery, or using a constrained network. User-initiated actions are not delayed by these background safeguards.

## Enforcement rules

1. Runtime facts are collected once per active UI tree and freshly sampled at worker boundaries.
2. Device-tier thresholds and network/battery semantics must not be recreated in individual components.
3. High fidelity can override visual hardware heuristics, but cannot override reduced-motion accessibility or operational safety policy.
4. Cache policy is explicit per asset class. A component may have a documented disk-only exception, but it must not silently contradict the resolved policy.
5. Every expensive visual component must consume resolved permissions. No local PixelRatio or model-name fallback is allowed.
6. Durable user data, pending mutations, and offline state are never disposable cache material.

## Current implementation state

- `RealityProvider`, `FidelityProvider`, and `useVisualCapabilities()` provide the visual facts and resolver.
- Mascot artwork loading uses the resolved image cache and decode policies.
- Aura rendering and celebration density are capability-gated.
- `EfficiencyPolicy` is enforced at background-sync and storage-maintenance boundaries.
- Unknown or invalid runtime signals fail conservatively: stale last-known UI values are retained, background sync defers, and storage maintenance skips rather than running a full compaction.
- The legacy `DeviceUtils` model-based tier helper has been removed because it duplicated the memory-based resolver.

## Follow-up

- Extend the shared runtime-conditions module with disk and battery snapshots when the native adapters expose stable cross-platform values.
- Add static checks for direct device-tier, PixelRatio, and uncontrolled prefetch decisions in visual components.
- Add release-device profiling before changing global list, cache, native trim, or R8 policies.
