---
title: "Production Delight System — Operating Procedure"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [ui, motion, delight, sop, primitives]
---

# Production Delight System — Operating Procedure

> Companion to [`delight-system-audit.md`](./delight-system-audit.md). Defines
> the durable contract for the motion/interaction primitives that make the
> product feel calm, acknowledged, and recoverable. Follows the blueprint's
> principles: **motion as feedback, never decoration; reduced motion first;
> deterministic cleanup; performance preserved on low-end devices.**

## 1. Stack discipline (mandatory)

- **Reanimated** is the only motion engine. Gesture Handler for gestures.
  NativeWind for static styles + design tokens. Expo modules (haptics, image,
  blur) only where a measured product need exists.
- **Never** add Moti / React Native Ease just to shorten animation code.
  A smaller API is not a healthier production stack (blueprint) — violates
  AGENTS.md rule #3 if it duplicates `motion.ts` tokens.
- All durations/easing/scale come from `@repo/ui` `components/motion.ts`.
  Convention: purpose-first names (`transition`, `meaningful`), never
  value-first (`ms240`).

## 2. Primitive contract (new primitives must satisfy)

Every animated primitive in `@repo/ui` implements:

1. **Intent-first API** — props express *what*, not *how*
   (`activeScale={0.96}`), and reuse `motion.ts` tokens as defaults.
2. **Reduced-motion path** — when reduced motion is active, replace movement
   with opacity/color or no-op. Follow `useReduceMotion` /
   `isReduceMotionEnabled` (see `@repo/ui hooks/useAccessibility`).
3. **Deterministic cleanup** — tear down shared values, `withRepeat` loops,
   and timers on unmount/recycle (list rows).
4. **No interaction blocking** — a decorative animation must never delay the
   next user action.
5. **Platform parity** — `.web.tsx`/`.native.tsx` variants where behavior
   must differ (focus rings, hover); shared semantics single source.

## 3. Motion QA bar (test contract)

Add a test for each primitive covering:

1. **mount** — appears without crash; initial state correct.
2. **update** — prop change animates/re-settles; no stuck state.
3. **interrupt** — a new gesture/state change interrupts a running animation
   deterministically.
4. **unmount** — no pending timers/loops/frame leaks (Jest fake timers).
5. **reduced motion** — motion reduced → visible output is opacity/color/no-op.

See `@repo/ui/src/__tests__/` for existing `Toast`, `Button`, `Modal` tests as
the style template.

## 4. Adding a primitive

1. Check the audit + `@repo/ui` exports first — no duplicate.
2. Implement in `packages/ui/src/components/<Name>.tsx` (+ `.web.tsx` if
   platform-specific) importing from `./motion`.
3. Export from `packages/ui/src/index.ts` + `index.web.ts`.
4. Add the 5-point QA test.
5. Run `pnpm --filter @repo/ui check-types` + `pnpm --filter @repo/ui test`.

## 5. Adopting in screens

- Prefer the new primitives in **new** code and GREEN-zone screens (high
  autonomy).
- AMBER/RED files: adopt only as part of the journey hardening workstream with
  a feature-spec, not silently.

## 6. Reduced-motion & accessibility rule of thumb

A product that feels calm and predictable to assistive-technology users is
usually better designed for everyone. If a transition lacks a semantic reason
(input <-> confirmation, continuity, status), it is decoration — remove it or
gate it behind reduced-motion off.

## 7. Telemetry / instrumentation

For the new primitives, usage should be observable without a new analytics
pipeline:

- Repeated taps on the same control within N seconds → debug/analytics signal
  (likely failing to acknowledge) — align with Sentry/PostHog patterns.
- Time from action to first state change (time-to-feedback) where already
  instrumented.
- Loading-duration / undo usage can be added to existing event names without a
  new provider.

Add these as follow-up, not required to ship a primitive.