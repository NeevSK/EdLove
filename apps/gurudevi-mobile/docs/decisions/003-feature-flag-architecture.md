# ADR-003: Feature Flag Architecture

## Status
Accepted

## Context
Gurudevi is a complex OS with features scheduled for V2, V3, and "Wild" experiments. Deploying unfinished or region-specific code without gating risks system instability.

## Options Considered
1. **Branch-based gating**: Merge code only when ready (Rejected - merge hell).
2. **Dynamic Gating (Feature Flags)**: All code is merged; availability is controlled via DB/RPC.

## Decision
We chose **Dynamic Feature Flags**. We initialize a `feature_flags` table and a server RPC `evaluate_feature()`.
- **`useFeature(key)` hook**: Front-end entry point.
- **`platform.*` namespace**: Global infrastructure flags.
- **`classroom.*`, `wellbeing.*` etc**: Domain specific flags.

## Consequences
- Every unfinished V2/V3 feature must be gated. 
- Flags allow Kill Switche capabilities for broken features.
- Minor latency for flag evaluation (cached for 5 mins).

## Date: 2026-04-22
