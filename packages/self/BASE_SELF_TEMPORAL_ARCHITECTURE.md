---
title: "BASE SELF TEMPORAL ARCHITECTURE"
status: "active"
created: 2026-04-08
updated: 2026-04-08
author: "Naveen"
scribe: "opencode"
tags: [packages, self]
---

## BaseSelf Temporal Architecture

### Problem
`BaseSelf` needs to support two different jobs without collapsing them into one noisy interface:

1. present-oriented feature discovery and action
2. reflective access to temporal history across ranges

The original mobile carousel and web dashboard both work well for the first job. The temporal layer should support the second job without replacing the sanctuary feel.

### Core Decision
Keep `BaseSelf` primarily present-oriented.

- Mobile keeps the colored feature carousel.
- Web keeps the grouped dashboard by feature type/domain.
- Temporal access becomes a shared secondary layer owned by the shell.

### Shell Model
The shell coordinates four pieces of state:

- active domain
- active feature
- temporal mode: `spotlight` or `timeline`
- temporal scale: `day | week | month | year | custom`

`spotlight` means the user is working in the present-facing sanctuary.

`timeline` means the user is asking the sanctuary to reveal history or longitudinal context.

### Content Contract
Each domain and feature can opt into temporal support gradually.

#### Domain
- `content`: present-facing domain content
- `historyContent`: optional domain-level history content
- `supportedScales`: optional range hints for future enforcement

#### Feature
- `content`: present-facing feature UI
- `historyContent`: optional history UI for the same feature
- `supportedScales`: optional range hints for future enforcement

If a feature or domain has no `historyContent`, the shell keeps the layout intact and shows a gentle “history scaffold” state instead of failing or hiding the feature.

### UX Rules
- Default mode is `spotlight`.
- Temporal controls stay visible but visually secondary.
- Range chips should matter most in `timeline` mode.
- Present-mode interaction must remain fast and quiet.
- Timeline mode should feel reflective, not analytical or dashboard-heavy.

### Near-Term Rollout
Start with infrastructure plus a few high-value history surfaces:

- journey overview
- mood
- journal / decision journal
- goals / progress

Other features can remain present-only until their repositories expose richer temporal slices.

### Long-Term Direction
The temporal shell should make future work easier:

- richer feature-specific timelines
- compare views across ranges
- “what changed since last week” summaries
- audit-style or event-stream views where appropriate

This keeps `Self` as a sanctuary with depth, rather than turning it into a classroom/community-style canvas.
