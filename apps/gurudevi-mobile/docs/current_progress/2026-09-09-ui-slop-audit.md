---
title: "UI Slop Audit"
status: "active"
created: 2026-09-09
updated: 2026-09-09
author: "Naveen"
tags: [ui, audit, anti-slop, design]
---

# UI Slop Audit - 2026-09-09

This is the first evidence-based audit against the external-world design canon. It is a source-level audit, not a substitute for screenshots, task observation, or real-device review.

## High-confidence findings

### Form-builder climate sensing

[ClimateSensingScreen.web.tsx](../../../../packages/form-builder/src/screens/ClimateSensingScreen.web.tsx:193) uses a centered white surface with `rounded-[40px]`, oversized generic shadow, slate background, and automatic fade/slide entry. The same visual structure is repeated across multiple states. This is the generated modern-SaaS form pattern and does not yet express climate sensing as a human activity.

### Authentication

[AuthScreen.web.tsx](../../../../packages/ui/src/screens/AuthScreen.web.tsx:94) combines `backdrop-blur-2xl`, very large rounding, nested translucent surfaces, pills, `shadow-2xl`, generic entry transitions, and a floating violet blur shape. Trust and arrival are being expressed through a generic premium material stack rather than through a clear arrival process.

### AI assistant gradient

[AIAssistantScreen.web.tsx](../../../../packages/ai/src/screens/AIAssistantScreen.web.tsx:363) uses a violet-to-saffron gradient for assistant content. This is a high-risk AI-product convention. It should remain only if the gradient communicates a specific state or provenance that cannot be expressed more clearly through semantic color and typography.

### Fire journal motion

[FireJournal.web.tsx](../../../../packages/self/src/components/FireJournal.web.tsx:129) uses a bouncing fire emoji with additional pulse motion. The fire metaphor is meaningful, but the bounce is likely ornamental. The action should be evaluated as a transformation or settling trace rather than generic attention motion.

### Cosmos scenarios

[cosmos/index.astro](../../../../apps/edlove-web/src/pages/cosmos/index.astro:102) presents three equal rounded translucent cards with hover transitions. A future-scenarios experience would more naturally use a horizon, branching path, or comparative landscape. The equal-card grid currently gives all futures identical weight and weakens the spatial metaphor.

## Review findings

There is a systemic combination across the workspace:

```text
large rounding + translucent white + backdrop blur + soft shadow + hover transition
```

This appears in authentication, marketing, community, library, and dashboard surfaces. It is not automatically wrong, but it must not be treated as the house language by default.

## Intentional candidates requiring rationale

- `LivingCard` and `TemporalGlass` may be valid material primitives if their layer and state contracts are explicit.
- Loading pulses and skeleton animations are functional when they communicate waiting.
- Celebration particles may be valid after a meaningful completion, subject to visual-safety and reduced-motion behavior.
- Gradients tied to artwork or a named environmental scene may be valid when they are not interchangeable decoration.

## Enforcement

`pnpm run check:ui-slop` scans changed UI source files and blocks high-confidence generic signals such as purple-to-warm AI gradients and generic bounce motion. Black shadows and other token violations are reported for review because they may be legacy or functional rather than AI-generated. `pnpm run audit:ui-slop` scans all application and package UI source and reports both blocking and review findings without failing.

The checker is deliberately conservative. It cannot decide whether a screen supports a human process, whether a metaphor is culturally appropriate, or whether a material feels truthful. Those decisions remain subject to the [anti-slop enforcement policy](../Core/design/gurudevi-anti-slop-enforcement.md).
