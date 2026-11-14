---
name: growthbook
description: "End-to-end feature management, feature flags lifecycle, A/B experiments, and metric exploration using GrowthBook. Trigger when creating, toggling, ramping, reviewing, or cleaning flags, or when designing, launching, and analyzing experiments."
---

# GrowthBook Suite Director

Hierarchical director for all GrowthBook operations across feature flags, experiments, and metrics.

## Progressive Disclosure Router

Consult the targeted domain reference based on your task intent:

| Task Intent | Target Reference | Key Workflows & Triggers |
| :--- | :--- | :--- |
| **Flags Lifecycle** | [`references/flags-lifecycle.md`](./references/flags-lifecycle.md) | Create, toggle, ramp rollouts, targeting rules, prerequisites, schedule, cleanup |
| **A/B Experiments** | [`references/experiments.md`](./references/experiments.md) | Hypothesis brainstorm, experiment design, launch, variant analysis, declare winner |
| **Metrics & Fact Tables** | [`references/metrics.md`](./references/metrics.md) | Search metrics, audit fact tables, query assignment exposures |
| **Setup & Credentials** | [`references/setup.md`](./references/setup.md) | API key configuration, ~/.config/growthbook/.env setup, gb-call test |

## Tools & Scripts
All API interactions use `scripts/gb-call`:
```bash
# Run API queries via bundled helper
./scripts/gb-call GET /api/v1/features
```
