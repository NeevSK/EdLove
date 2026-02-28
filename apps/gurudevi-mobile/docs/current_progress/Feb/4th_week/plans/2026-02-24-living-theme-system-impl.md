# Living Theme System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Implement the 6-phase × 2-theme Living Theme System so the entire Sanctuary shifts mood from a single token matrix — no hardcoded colors anywhere downstream.

**Architecture:** Extend `packages/ui/src/theme/Theme.ts` with a `phases` matrix and `resolve()` function. Add a `useTheme()` hook that all components call. Animated gradient background rendered once at navigator level. Device tier gates animation complexity via existing `useEnvironment()`. All glass/glow/accent tokens are semantic — components never reference raw hex.

**Tech Stack:** React Native, Expo, `expo-linear-gradient`, `react-native-reanimated` v3 (worklets), `expo-blur`, TypeScript strict, existing `EnvironmentContext` + `useEnvironment()`.

**Design spec:** `docs/plans/2026-02-24-living-theme-system-design.md`

---

## Phase map (for reference)

```
6-phase            Hours    World   4-phase fallback
──────────────     ──────   ─────   ────────────────
predawn            4–6 am   dark    dawn
dawn               6–9 am   light   dawn
morning            9–12 pm  light   day
afternoon          12–5 pm  light   day
dusk               5–8 pm   dark    evening  ← was 'evening'
night              8–4 am   dark    night
```

---

## Task 1: Extend TemporalPhase type (4 → 6)

**Files:**
- Modify: `packages/ui/src/context/types.ts:11`
- Modify: `packages/ui/src/context/utils.ts:17-36`

**Step 1: Update the type**

In `packages/ui/src/context/types.ts`, replace line 11:

```typescript
// BEFORE
export type TemporalPhase = 'dawn' | 'day' | 'evening' | 'night';

// AFTER
export type TemporalPhase = 'predawn' | 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

/** Maps 6-phase to 4-phase for legacy consumers */
export const PHASE_FALLBACK: Record<TemporalPhase, 'dawn' | 'day' | 'evening' | 'night'> = {
    predawn:   'dawn',
    dawn:      'dawn',
    morning:   'day',
    afternoon: 'day',
    dusk:      'evening',
    night:     'night',
};
```

**Step 2: Update `getTemporalPhase()` in utils.ts**

Replace the function body (lines 17–29):

```typescript
export function getTemporalPhase(): TemporalPhase {
    const hour = new Date().getHours();
    if (hour >= 4  && hour < 6)  return 'predawn';
    if (hour >= 6  && hour < 9)  return 'dawn';
    if (hour >= 9  && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
}
```

**Step 3: Update `shouldUseDarkTheme()` in utils.ts**

Replace lines 34–36:

```typescript
export function shouldUseDarkTheme(phase: TemporalPhase): boolean {
    return phase === 'predawn' || phase === 'dusk' || phase === 'night';
    // dawn, morning, afternoon → light world
}
```

**Step 4: Run TypeScript check**

```bash
cd C:\Users\Naween\projects\polymath-platform
npx tsc -p packages/ui/tsconfig.json --noEmit
```

Expected: errors on any consumer of `TemporalPhase` that used `'day'` or `'evening'` — fix each by mapping:
- `'day'` → check if it should be `'morning'` or `'afternoon'`
- `'evening'` → `'dusk'`

Search for consumers:
```bash
grep -r "temporalPhase\|TemporalPhase\|'evening'\|'day'" packages/ui/src apps/gurudevi-mobile/src --include="*.ts" --include="*.tsx" -l
```

Fix each file. Most common fix: `phase === 'day'` → `phase === 'morning' || phase === 'afternoon'`.

**Step 5: Commit**

```bash
git add packages/ui/src/context/types.ts packages/ui/src/context/utils.ts
git commit -m "feat(theme): extend TemporalPhase from 4 to 6 phases; add PHASE_FALLBACK map"
```

---

## Task 2: Add Phase Token Matrix to Theme.ts

**Files:**
- Modify: `packages/ui/src/theme/Theme.ts` (add after existing exports)

This is the **single source of truth** for all phase+theme colors. Change here → entire app shifts.

**Step 1: Add the `PhaseTokens` interface after the existing color block**

At the end of `Theme.ts`, add:

```typescript
// ============================================================================
// PHASE TOKEN MATRIX — The Living Theme System
// ============================================================================
// These are the ONLY color values that phase-aware components should use.
// Consume via useTheme() hook, never reference phases directly in components.

export interface GlassTokens {
    surface:  { bg: string; opacity: number; blurAmount: number; border: string };
    modal:    { bg: string; opacity: number; blurAmount: number; border: string };
    interact: { bg: string; opacity: number; blurAmount: number; border: string };
}

export interface GlowTokens {
    soft:    { color: string; radius: number; opacity: number };
    primary: { color: string; radius: number; opacity: number };
    action:  { color: string; radius: number; opacity: number };
    reward:  { color: string; radius: number; opacity: number };
}

export interface AccentTokens {
    action:  string;   // Primary interactive — buttons, links, active chips
    reward:  string;   // Achievements, celebrations, milestones
    danger:  string;   // Destructive actions
    muted:   string;   // Disabled / secondary states
}

export interface TextTokens {
    primary:   string;
    secondary: string;
    inverse:   string;  // Text on accent backgrounds
    muted:     string;
}

export interface PhaseTokens {
    gradientNodes: [string, string, string];  // AnimatedGradientMesh color nodes
    glass: GlassTokens;
    glow: GlowTokens;
    accent: AccentTokens;
    text: TextTokens;
}

/** Full matrix: phase → themeMode → resolved tokens */
export const phaseMatrix: Record<TemporalPhase, { dark: PhaseTokens; light: PhaseTokens }> = {

    predawn: {
        dark: {
            gradientNodes: ['#020617', '#0A0F1E', '#1E1B4B'],
            glass: {
                surface:  { bg: 'rgba(10,15,30,0.72)',  opacity: 0.72, blurAmount: 16, border: 'rgba(255,255,255,0.08)' },
                modal:    { bg: 'rgba(2,6,23,0.85)',    opacity: 0.85, blurAmount: 24, border: 'rgba(255,255,255,0.06)' },
                interact: { bg: 'rgba(30,27,75,0.40)',  opacity: 0.40, blurAmount: 8,  border: 'rgba(255,255,255,0.10)' },
            },
            glow: {
                soft:    { color: '#6D28D9', radius: 12, opacity: 0.15 },
                primary: { color: '#6D28D9', radius: 20, opacity: 0.35 },
                action:  { color: '#6D28D9', radius: 16, opacity: 0.50 },
                reward:  { color: '#B45309', radius: 24, opacity: 0.60 },
            },
            accent: { action: '#7C3AED', reward: '#B45309', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#94A3B8', inverse: '#0F172A', muted: '#475569' },
        },
        light: {
            gradientNodes: ['#E8EAF6', '#F3F4F6', '#DDD6FE'],
            glass: {
                surface:  { bg: 'rgba(255,255,255,0.55)', opacity: 0.55, blurAmount: 16, border: 'rgba(0,0,0,0.08)' },
                modal:    { bg: 'rgba(255,255,255,0.70)', opacity: 0.70, blurAmount: 24, border: 'rgba(0,0,0,0.06)' },
                interact: { bg: 'rgba(255,255,255,0.35)', opacity: 0.35, blurAmount: 8,  border: 'rgba(0,0,0,0.10)' },
            },
            glow: {
                soft:    { color: '#7C3AED', radius: 10, opacity: 0.10 },
                primary: { color: '#7C3AED', radius: 18, opacity: 0.25 },
                action:  { color: '#7C3AED', radius: 14, opacity: 0.35 },
                reward:  { color: '#D97706', radius: 20, opacity: 0.45 },
            },
            accent: { action: '#7C3AED', reward: '#D97706', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#475569', inverse: '#FFFFFF', muted: '#94A3B8' },
        },
    },

    dawn: {
        dark: {
            gradientNodes: ['#0F172A', '#1E293B', '#312E81'],
            glass: {
                surface:  { bg: 'rgba(30,41,59,0.70)',  opacity: 0.70, blurAmount: 16, border: 'rgba(255,255,255,0.10)' },
                modal:    { bg: 'rgba(15,23,42,0.82)',   opacity: 0.82, blurAmount: 24, border: 'rgba(255,255,255,0.08)' },
                interact: { bg: 'rgba(49,46,129,0.35)',  opacity: 0.35, blurAmount: 8,  border: 'rgba(255,255,255,0.12)' },
            },
            glow: {
                soft:    { color: '#E67E22', radius: 12, opacity: 0.18 },
                primary: { color: '#E67E22', radius: 20, opacity: 0.40 },
                action:  { color: '#E67E22', radius: 16, opacity: 0.55 },
                reward:  { color: '#DB7093', radius: 24, opacity: 0.60 },
            },
            accent: { action: '#E67E22', reward: '#DB7093', danger: '#EF4444', muted: '#334155' },
            text:   { primary: '#F8FAFC', secondary: '#CBD5E1', inverse: '#0F172A', muted: '#64748B' },
        },
        light: {
            gradientNodes: ['#FFF7ED', '#FFFBF5', '#FDE68A'],
            glass: {
                surface:  { bg: 'rgba(255,247,237,0.65)', opacity: 0.65, blurAmount: 16, border: 'rgba(234,88,12,0.15)' },
                modal:    { bg: 'rgba(255,251,245,0.78)', opacity: 0.78, blurAmount: 24, border: 'rgba(234,88,12,0.10)' },
                interact: { bg: 'rgba(253,230,138,0.30)', opacity: 0.30, blurAmount: 8,  border: 'rgba(234,88,12,0.20)' },
            },
            glow: {
                soft:    { color: '#EA580C', radius: 10, opacity: 0.12 },
                primary: { color: '#EA580C', radius: 20, opacity: 0.30 },
                action:  { color: '#EA580C', radius: 16, opacity: 0.40 },
                reward:  { color: '#E11D48', radius: 22, opacity: 0.45 },
            },
            accent: { action: '#EA580C', reward: '#E11D48', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#1C0A00', secondary: '#78350F', inverse: '#FFFFFF', muted: '#A16207' },
        },
    },

    morning: {
        dark: {  // Fallback only — morning is a light phase
            gradientNodes: ['#0F172A', '#134E4A', '#064E3B'],
            glass: {
                surface:  { bg: 'rgba(6,78,59,0.50)',  opacity: 0.50, blurAmount: 16, border: 'rgba(255,255,255,0.12)' },
                modal:    { bg: 'rgba(15,23,42,0.80)',  opacity: 0.80, blurAmount: 24, border: 'rgba(255,255,255,0.10)' },
                interact: { bg: 'rgba(20,83,45,0.35)',  opacity: 0.35, blurAmount: 8,  border: 'rgba(255,255,255,0.15)' },
            },
            glow: {
                soft:    { color: '#16A34A', radius: 12, opacity: 0.20 },
                primary: { color: '#16A34A', radius: 20, opacity: 0.45 },
                action:  { color: '#16A34A', radius: 16, opacity: 0.55 },
                reward:  { color: '#EA580C', radius: 24, opacity: 0.65 },
            },
            accent: { action: '#16A34A', reward: '#EA580C', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#86EFAC', inverse: '#0F172A', muted: '#6EE7B7' },
        },
        light: {
            gradientNodes: ['#F0F9FF', '#E0F2FE', '#DCFCE7'],
            glass: {
                surface:  { bg: 'rgba(240,249,255,0.68)', opacity: 0.68, blurAmount: 16, border: 'rgba(22,163,74,0.15)' },
                modal:    { bg: 'rgba(255,255,255,0.80)',  opacity: 0.80, blurAmount: 24, border: 'rgba(22,163,74,0.10)' },
                interact: { bg: 'rgba(220,252,231,0.45)',  opacity: 0.45, blurAmount: 8,  border: 'rgba(22,163,74,0.20)' },
            },
            glow: {
                soft:    { color: '#16A34A', radius: 10, opacity: 0.12 },
                primary: { color: '#16A34A', radius: 20, opacity: 0.28 },
                action:  { color: '#16A34A', radius: 16, opacity: 0.38 },
                reward:  { color: '#EA580C', radius: 22, opacity: 0.50 },
            },
            accent: { action: '#16A34A', reward: '#EA580C', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#166534', inverse: '#FFFFFF', muted: '#6B7280' },
        },
    },

    afternoon: {
        dark: {  // Fallback only
            gradientNodes: ['#0F172A', '#1E3A5F', '#0C4A6E'],
            glass: {
                surface:  { bg: 'rgba(14,36,95,0.55)',  opacity: 0.55, blurAmount: 16, border: 'rgba(255,255,255,0.12)' },
                modal:    { bg: 'rgba(15,23,42,0.82)',   opacity: 0.82, blurAmount: 24, border: 'rgba(255,255,255,0.10)' },
                interact: { bg: 'rgba(2,132,199,0.30)',  opacity: 0.30, blurAmount: 8,  border: 'rgba(255,255,255,0.15)' },
            },
            glow: {
                soft:    { color: '#0284C7', radius: 12, opacity: 0.20 },
                primary: { color: '#0284C7', radius: 20, opacity: 0.45 },
                action:  { color: '#0284C7', radius: 16, opacity: 0.55 },
                reward:  { color: '#D97706', radius: 24, opacity: 0.65 },
            },
            accent: { action: '#0284C7', reward: '#D97706', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#BAE6FD', inverse: '#0F172A', muted: '#7DD3FC' },
        },
        light: {
            gradientNodes: ['#FAFAFA', '#F1F5F9', '#E0F2FE'],
            glass: {
                surface:  { bg: 'rgba(255,255,255,0.72)', opacity: 0.72, blurAmount: 16, border: 'rgba(2,132,199,0.12)' },
                modal:    { bg: 'rgba(255,255,255,0.85)', opacity: 0.85, blurAmount: 24, border: 'rgba(2,132,199,0.08)' },
                interact: { bg: 'rgba(224,242,254,0.50)', opacity: 0.50, blurAmount: 8,  border: 'rgba(2,132,199,0.18)' },
            },
            glow: {
                soft:    { color: '#0284C7', radius: 10, opacity: 0.10 },
                primary: { color: '#0284C7', radius: 18, opacity: 0.25 },
                action:  { color: '#0284C7', radius: 14, opacity: 0.35 },
                reward:  { color: '#D97706', radius: 20, opacity: 0.48 },
            },
            accent: { action: '#0284C7', reward: '#D97706', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#475569', inverse: '#FFFFFF', muted: '#94A3B8' },
        },
    },

    dusk: {
        dark: {
            gradientNodes: ['#0C1A2E', '#0E2A4A', '#134E7A'],
            glass: {
                surface:  { bg: 'rgba(14,42,74,0.70)',  opacity: 0.70, blurAmount: 16, border: 'rgba(14,165,233,0.15)' },
                modal:    { bg: 'rgba(12,26,46,0.85)',  opacity: 0.85, blurAmount: 24, border: 'rgba(14,165,233,0.10)' },
                interact: { bg: 'rgba(20,78,122,0.40)', opacity: 0.40, blurAmount: 8,  border: 'rgba(14,165,233,0.20)' },
            },
            glow: {
                soft:    { color: '#0EA5E9', radius: 14, opacity: 0.20 },
                primary: { color: '#0EA5E9', radius: 22, opacity: 0.45 },
                action:  { color: '#0EA5E9', radius: 18, opacity: 0.60 },
                reward:  { color: '#F97316', radius: 26, opacity: 0.70 },
            },
            accent: { action: '#0EA5E9', reward: '#F97316', danger: '#EF4444', muted: '#334155' },
            text:   { primary: '#F0F9FF', secondary: '#BAE6FD', inverse: '#0C1A2E', muted: '#7DD3FC' },
        },
        light: {  // Fallback only — dusk is a dark phase
            gradientNodes: ['#FFF7ED', '#FEE2E2', '#FECACA'],
            glass: {
                surface:  { bg: 'rgba(255,247,237,0.65)', opacity: 0.65, blurAmount: 16, border: 'rgba(249,115,22,0.15)' },
                modal:    { bg: 'rgba(255,255,255,0.78)',  opacity: 0.78, blurAmount: 24, border: 'rgba(249,115,22,0.10)' },
                interact: { bg: 'rgba(254,226,226,0.40)',  opacity: 0.40, blurAmount: 8,  border: 'rgba(249,115,22,0.20)' },
            },
            glow: {
                soft:    { color: '#F97316', radius: 10, opacity: 0.12 },
                primary: { color: '#F97316', radius: 20, opacity: 0.30 },
                action:  { color: '#F97316', radius: 16, opacity: 0.40 },
                reward:  { color: '#0EA5E9', radius: 22, opacity: 0.45 },
            },
            accent: { action: '#F97316', reward: '#0EA5E9', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#9A3412', inverse: '#FFFFFF', muted: '#6B7280' },
        },
    },

    night: {
        dark: {
            gradientNodes: ['#020617', '#0F172A', '#1E1B4B'],
            glass: {
                surface:  { bg: 'rgba(15,23,42,0.72)',  opacity: 0.72, blurAmount: 16, border: 'rgba(253,217,37,0.08)' },
                modal:    { bg: 'rgba(2,6,23,0.88)',    opacity: 0.88, blurAmount: 24, border: 'rgba(253,217,37,0.06)' },
                interact: { bg: 'rgba(30,27,75,0.42)',  opacity: 0.42, blurAmount: 8,  border: 'rgba(253,217,37,0.12)' },
            },
            glow: {
                soft:    { color: '#FDD925', radius: 14, opacity: 0.18 },
                primary: { color: '#FDD925', radius: 24, opacity: 0.42 },
                action:  { color: '#FDD925', radius: 18, opacity: 0.58 },
                reward:  { color: '#8B5CF6', radius: 28, opacity: 0.70 },
            },
            accent: { action: '#FDD925', reward: '#8B5CF6', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#E2E8F0', inverse: '#020617', muted: '#64748B' },
        },
        light: {  // Fallback only — night is a dark phase
            gradientNodes: ['#1E1B4B', '#312E81', '#4338CA'],
            glass: {
                surface:  { bg: 'rgba(49,46,129,0.30)', opacity: 0.30, blurAmount: 16, border: 'rgba(253,217,37,0.20)' },
                modal:    { bg: 'rgba(30,27,75,0.45)',  opacity: 0.45, blurAmount: 24, border: 'rgba(253,217,37,0.15)' },
                interact: { bg: 'rgba(67,56,202,0.25)', opacity: 0.25, blurAmount: 8,  border: 'rgba(253,217,37,0.25)' },
            },
            glow: {
                soft:    { color: '#FDD925', radius: 12, opacity: 0.15 },
                primary: { color: '#FDD925', radius: 22, opacity: 0.35 },
                action:  { color: '#FDD925', radius: 16, opacity: 0.45 },
                reward:  { color: '#8B5CF6', radius: 24, opacity: 0.55 },
            },
            accent: { action: '#FDD925', reward: '#8B5CF6', danger: '#EF4444', muted: '#6B7280' },
            text:   { primary: '#F8FAFC', secondary: '#C7D2FE', inverse: '#1E1B4B', muted: '#818CF8' },
        },
    },
};

/** The single resolver — this is what all components call via useTheme() */
export function resolvePhaseTokens(
    phase: TemporalPhase,
    isDark: boolean
): PhaseTokens {
    return phaseMatrix[phase][isDark ? 'dark' : 'light'];
}
```

**Step 2: Add `TemporalPhase` import to Theme.ts**

At the top of `Theme.ts` add:
```typescript
import type { TemporalPhase } from '../context/types';
```

**Step 3: TypeScript check**

```bash
npx tsc -p packages/ui/tsconfig.json --noEmit
```
Expected: PASS (or only pre-existing errors unrelated to this task).

**Step 4: Commit**

```bash
git add packages/ui/src/theme/Theme.ts
git commit -m "feat(theme): add 6-phase × 2-theme token matrix and resolvePhaseTokens() to Theme.ts"
```

---

## Task 3: Create `useTheme()` hook

**Files:**
- Create: `packages/ui/src/hooks/useTheme.ts`
- Modify: `packages/ui/src/index.ts`

This is the **only** interface components use. They never touch `phaseMatrix` directly.

**Step 1: Create the hook**

Create `packages/ui/src/hooks/useTheme.ts`:

```typescript
/**
 * useTheme — Primary interface for phase-aware design tokens.
 *
 * Returns resolved tokens for the current temporal phase + theme mode.
 * This is the ONLY way components should access phase-specific colors.
 *
 * Usage:
 *   const { accent, glass, glow, text, gradientNodes, isDark } = useTheme();
 */
import { useEnvironment } from '../context/EnvironmentContext';
import { resolvePhaseTokens, PhaseTokens } from '../theme/Theme';

export interface UseThemeReturn extends PhaseTokens {
    isDark: boolean;
    phase: import('../context/types').TemporalPhase;
    /** Whether animations should run (based on device tier + fidelity) */
    animationsEnabled: boolean;
    /** Whether blur effects should be used */
    blurEnabled: boolean;
}

export function useTheme(): UseThemeReturn {
    const { temporalPhase, isDark, reality, effectiveFidelity } = useEnvironment();

    const tokens = resolvePhaseTokens(temporalPhase, isDark);

    const animationsEnabled = effectiveFidelity === 'high';
    const blurEnabled = effectiveFidelity === 'high' && reality.deviceTier !== 'low';

    return {
        ...tokens,
        isDark,
        phase: temporalPhase,
        animationsEnabled,
        blurEnabled,
    };
}
```

**Step 2: Export from index.ts**

In `packages/ui/src/index.ts`, add:
```typescript
export * from './hooks/useTheme';
```

**Step 3: TypeScript check**

```bash
npx tsc -p packages/ui/tsconfig.json --noEmit
```
Expected: PASS.

**Step 4: Write a quick logic test**

Create `packages/ui/src/__tests__/useTheme.test.ts`:

```typescript
import { resolvePhaseTokens } from '../theme/Theme';

describe('resolvePhaseTokens', () => {
    it('returns dark tokens for night/dark', () => {
        const tokens = resolvePhaseTokens('night', true);
        expect(tokens.gradientNodes[0]).toBe('#020617');
        expect(tokens.accent.action).toBe('#FDD925');
    });

    it('returns light tokens for morning/light', () => {
        const tokens = resolvePhaseTokens('morning', false);
        expect(tokens.accent.action).toBe('#16A34A'); // leaf green
        expect(tokens.accent.reward).toBe('#EA580C'); // saffron
    });

    it('returns dark tokens for dusk/dark', () => {
        const tokens = resolvePhaseTokens('dusk', true);
        expect(tokens.accent.action).toBe('#0EA5E9'); // teal
    });

    it('sanctuarySaffron appears in every phase as reward or action', () => {
        const phases = ['predawn','dawn','morning','afternoon','dusk','night'] as const;
        phases.forEach(phase => {
            const light = resolvePhaseTokens(phase, false);
            const dark  = resolvePhaseTokens(phase, true);
            // Saffron (#EA580C, #E67E22, #D97706, #FDD925) must appear somewhere
            const saffronPresent = (t: typeof light) =>
                Object.values(t.accent).some(v =>
                    ['#EA580C','#E67E22','#D97706','#FDD925','#F97316'].includes(v)
                );
            expect(saffronPresent(light)).toBe(true);
            expect(saffronPresent(dark)).toBe(true);
        });
    });
});
```

**Step 5: Run test**

```bash
cd C:\Users\Naween\projects\polymath-platform
npx jest packages/ui/src/__tests__/useTheme.test.ts --no-coverage
```
Expected: 4 tests PASS.

**Step 6: Commit**

```bash
git add packages/ui/src/hooks/useTheme.ts packages/ui/src/__tests__/useTheme.test.ts packages/ui/src/index.ts
git commit -m "feat(theme): add useTheme() hook — single interface for phase-aware tokens"
```

---

## Task 4: Create SanctuaryBackground

**Files:**
- Create: `packages/ui/src/components/SanctuaryBackground.tsx`
- Modify: `packages/ui/src/components/index.ts` (or wherever components are barrel-exported)

**Step 1: Create the component**

Create `packages/ui/src/components/SanctuaryBackground.tsx`:

```typescript
/**
 * SanctuaryBackground
 *
 * The living backdrop of the app. Rendered ONCE at TabNavigator level,
 * behind all tab screens (which are transparent over it).
 *
 * High/Mid: Animated gradient mesh — 2 LinearGradient layers crossfading.
 * Low/Battery: Static LinearGradient snapshot — same palette, zero animation cost.
 *
 * Phase transitions: 2s crossfade between palettes.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

export function SanctuaryBackground() {
    const { gradientNodes, animationsEnabled, phase } = useTheme();

    // Two gradient layers for crossfade transition
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const prevNodes = useRef<[string, string, string]>(gradientNodes);
    const currentNodes = useRef<[string, string, string]>(gradientNodes);

    useEffect(() => {
        if (!animationsEnabled) {
            // Static — just update immediately
            prevNodes.current = gradientNodes;
            currentNodes.current = gradientNodes;
            fadeAnim.setValue(1);
            return;
        }

        // Crossfade: prev layer stays, new layer fades in over 2s
        prevNodes.current = currentNodes.current;
        currentNodes.current = gradientNodes;

        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]); // Re-run only when phase changes

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {/* Layer 0: Previous phase (fades out) */}
            <LinearGradient
                colors={prevNodes.current}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Layer 1: Current phase (fades in) */}
            <Animated.View
                style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
                pointerEvents="none"
            >
                <LinearGradient
                    colors={currentNodes.current}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>
        </View>
    );
}
```

**Step 2: Export from components barrel**

Find `packages/ui/src/components/index.ts` (or wherever components are exported). Add:
```typescript
export { SanctuaryBackground } from './SanctuaryBackground';
```

**Step 3: TypeScript check**

```bash
npx tsc -p packages/ui/tsconfig.json --noEmit
```
Expected: PASS.

**Step 4: Commit**

```bash
git add packages/ui/src/components/SanctuaryBackground.tsx
git commit -m "feat(theme): add SanctuaryBackground — phase-crossfading animated gradient backdrop"
```

---

## Task 5: Wire SanctuaryBackground into TabNavigator

**Files:**
- Modify: `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx`

**Step 1: Import and render**

In `TabNavigator.tsx`, import:
```typescript
import { SanctuaryBackground } from '@repo/ui';
```

Find the root `View` that wraps the tab navigator. Add `SanctuaryBackground` as the first child, absolutely positioned:

```typescript
// The TabNavigator root should look like this:
return (
    <View style={{ flex: 1 }}>
        {/* Living backdrop — renders behind all tabs */}
        <SanctuaryBackground />

        <Tab.Navigator
            // ... existing props
            screenOptions={{
                // ... existing screenOptions
                // Make tab backgrounds transparent so SanctuaryBackground shows through
                tabBarStyle: {
                    backgroundColor: 'transparent', // glass handled by tokens
                    // ... existing tabBarStyle
                },
            }}
        >
            {/* ... existing tabs */}
        </Tab.Navigator>
    </View>
);
```

**Step 2: Make tab screens transparent**

All tab screens should have `backgroundColor: 'transparent'` in their root `<View>` or `<ScreenWrapper>`. Check `ScreenWrapper.tsx` in `packages/ui/src/components/` — if it sets a background color, update it to read from `useTheme()`:

```typescript
// In ScreenWrapper.tsx, if it has hardcoded background:
// BEFORE: backgroundColor: isDark ? Theme.colors.voidIndigo : Theme.colors.creamSilence
// AFTER:  backgroundColor: 'transparent'  (SanctuaryBackground handles the bg)
```

**Step 3: Verify on device/simulator**

Start Metro:
```bash
cd C:\Users\Naween\projects\polymath-platform
node node_modules/expo/bin/cli start apps/gurudevi-mobile
```

Open Expo Go → navigate between tabs → background should show as a consistent gradient across all screens.

**Step 4: Commit**

```bash
git add apps/gurudevi-mobile/src/navigation/TabNavigator.tsx
git commit -m "feat(theme): render SanctuaryBackground in TabNavigator; transparent tab screen backgrounds"
```

---

## Task 6: Update SanctuaryCard to use useTheme()

**Files:**
- Modify: `packages/ui/src/components/SanctuaryCard.tsx`

**Step 1: Replace `useColorScheme` with `useTheme`**

In `SanctuaryCard.tsx`:
```typescript
// REMOVE:
import { useColorScheme } from 'react-native';
import { IS_LOW_POWER_MODE } from '../utils/DeviceUtils';

// ADD:
import { useTheme } from '../hooks/useTheme';
```

**Step 2: Replace the isDark + glass logic**

```typescript
// REMOVE:
const isDark = useColorScheme() === 'dark';
const useGlass = !IS_LOW_POWER_MODE && variant === 'glass' && Platform.OS !== 'android';

// ADD:
const { isDark, glass, glow, blurEnabled } = useTheme();
const useGlass = blurEnabled && variant === 'glass';
```

**Step 3: Update style references**

Replace any hardcoded glass/color values in the component's styles:

```typescript
// Replace hardcoded glass values with resolved tokens:
backgroundColor: useGlass ? glass.surface.bg : (isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)'),
borderColor: glass.surface.border,
// Shadow:
shadowColor: glow.soft.color,
shadowOpacity: glow.soft.opacity,
shadowRadius: glow.soft.radius,
```

**Step 4: TypeScript check + verify**

```bash
npx tsc -p packages/ui/tsconfig.json --noEmit
```

**Step 5: Commit**

```bash
git add packages/ui/src/components/SanctuaryCard.tsx
git commit -m "feat(theme): SanctuaryCard uses useTheme() — glass/glow from phase tokens"
```

---

## Task 7: Update SanctuaryButton to use useTheme()

**Files:**
- Modify: `packages/ui/src/components/SanctuaryButton.tsx`

**Step 1: Import useTheme**

```typescript
import { useTheme } from '../hooks/useTheme';
```

**Step 2: Replace hardcoded action colors**

```typescript
// ADD at top of component:
const { accent, glass } = useTheme();

// REPLACE getBgColor():
const getBgColor = () => {
    if (variant === 'outline' || variant === 'ghost' || variant === 'link') return 'transparent';
    switch (action) {
        case 'primary':  return accent.action;   // Phase-aware primary
        case 'secondary': return glass.surface.bg; // Glassy secondary
        case 'negative':  return accent.danger;
        case 'positive':  return accent.reward;
        default:          return accent.action;
    }
};
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/SanctuaryButton.tsx
git commit -m "feat(theme): SanctuaryButton uses useTheme() accent tokens for phase-aware colors"
```

---

## Task 8: Update GlobalHeader to use useTheme()

**Files:**
- Modify: `packages/ui/src/components/GlobalHeader.tsx`

**Step 1: Import useTheme**

```typescript
import { useTheme } from '../hooks/useTheme';
```

**Step 2: Replace color references**

```typescript
const { glass, text, accent, isDark, blurEnabled } = useTheme();

// Header background → glass.modal
// Title text → text.primary
// Subtitle → text.secondary
// Active icon → accent.action
// Notification dot → accent.action (or accent.reward)
// Blur → blurEnabled controls BlurView usage
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/GlobalHeader.tsx
git commit -m "feat(theme): GlobalHeader uses useTheme() — glass.modal backdrop, phase-aware text/icons"
```

---

## Task 9: Update SanctuaryChip and SanctuaryInput

**Files:**
- Modify: `packages/ui/src/components/SanctuaryChip.tsx`
- Modify: `packages/ui/src/components/SanctuaryInput.tsx`

**Step 1: SanctuaryChip**

```typescript
const { accent, glass, text } = useTheme();

// Idle chip:    bg=glass.interact.bg  border=glass.interact.border  text=text.secondary
// Selected:     bg=accent.action      border=none                   text=text.inverse
```

**Step 2: SanctuaryInput**

```typescript
const { accent, glass, text } = useTheme();

// Idle:    bg=glass.surface.bg  border=glass.surface.border
// Focused: bg=glass.surface.bg  border=accent.action
// Text:    text.primary
// Placeholder: text.muted
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/SanctuaryChip.tsx packages/ui/src/components/SanctuaryInput.tsx
git commit -m "feat(theme): SanctuaryChip and SanctuaryInput use useTheme() tokens"
```

---

## Task 10: FAB — apply useTheme() phase-aware glow (emoji FABs only)

> **Decision (2026-02-24):** Keep the per-section emoji FABs (`packages/ui/src/components/LotusPetalFAB.tsx`, 56px emoji).
> Do NOT enable `apps/gurudevi-mobile/src/components/shared/LotusPetalFAB.tsx` (lotus image, 72px) — it remains `disabled=true` and kept as a future option.
>
> **Rationale:** Emoji FABs are section/tab-aligned, less cluttered, and already working. The lotus image FAB is preserved in code but undecided — enabling it felt screen-cluttered. Community and Library FABs may occasionally be shadowed by the bottom navbar — that is acceptable for now.

**Files:**
- Modify: `packages/ui/src/components/LotusPetalFAB.tsx` (apply `useTheme()` glow tokens only — no structural changes)

**Step 1: Apply glow token to emoji FAB**

```typescript
import { useTheme } from '../hooks/useTheme';

// Inside the FAB component:
const { glow, accent } = useTheme();
// Apply to the TouchableOpacity / Animated.View:
// shadowColor: glow.primary.color
// shadowRadius: glow.primary.radius
// shadowOpacity: glow.primary.opacity
// backgroundColor tint: accent.action at 15% opacity
```

**Step 2: Commit**

```bash
git add packages/ui/src/components/LotusPetalFAB.tsx
git commit -m "feat(theme): apply phase-aware glow tokens to emoji LotusPetalFAB; lotus image FAB remains disabled"
```

---

## Task 11: AppSettingsScreen — expose theme mode + phase override

**Files:**
- Modify: `apps/gurudevi-mobile/src/screens/AppSettingsScreen.tsx`

**Step 1: Add theme mode selector**

In the settings screen, add a row for **Theme**:
```typescript
// Options: Auto | Light | Dark
// Calls: setThemeMode(mode) from useEnvironment()
```

**Step 2: Add phase override (dev/power-user option)**

```typescript
// Optional: show current temporal phase
// Allow manual pin (stored as override in AsyncStorage)
// Label: "Time of day (auto)" with current phase shown
```

**Step 3: Commit**

```bash
git add apps/gurudevi-mobile/src/screens/AppSettingsScreen.tsx
git commit -m "feat(theme): add theme mode selector and phase display to AppSettingsScreen"
```

---

## Task 12: Full app TypeScript check + smoke test

**Step 1: TypeScript check entire app**

```bash
cd C:\Users\Naween\projects\polymath-platform
npx tsc -p apps/gurudevi-mobile/tsconfig.json --noEmit 2>&1 | head -50
```

Fix any remaining type errors from the `TemporalPhase` extension. Common patterns:
- `phase === 'day'` → `phase === 'morning' || phase === 'afternoon'`
- `phase === 'evening'` → `phase === 'dusk'`

**Step 2: Run all unit tests**

```bash
npx jest --testPathPattern="packages/ui" --no-coverage
```
Expected: All PASS.

**Step 3: Start app and verify visually**

```bash
node node_modules/expo/bin/cli start apps/gurudevi-mobile
```

Visual checklist:
- [ ] Background gradient visible across all tabs
- [ ] Cards show glass surface (not flat opaque)
- [ ] Buttons show phase-aware accent color (saffron/green/teal/gold depending on time)
- [ ] GlobalHeader has glass backdrop
- [ ] LotusFAB is visible and glowing
- [ ] Manually change device time to different hour → restart app → palette shifts
- [ ] AppSettingsScreen: switch to Light mode → background and components shift to light palette

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(theme): Living Theme System complete — 6-phase × 2-theme, single token matrix, all core components updated"
```

---

## Verification commands summary

```bash
# TypeScript
npx tsc -p packages/ui/tsconfig.json --noEmit
npx tsc -p apps/gurudevi-mobile/tsconfig.json --noEmit

# Tests
npx jest packages/ui/src/__tests__/useTheme.test.ts -v

# Start app
node node_modules/expo/bin/cli start apps/gurudevi-mobile

# Find any remaining hardcoded hex (should return 0 results after completion)
grep -r "'#[0-9a-fA-F]\{6\}'" packages/ui/src/components --include="*.tsx" --include="*.ts"
```

---

## Critical file reference

| File | Role |
|---|---|
| `packages/ui/src/context/types.ts:11` | `TemporalPhase` type definition |
| `packages/ui/src/context/utils.ts:17` | `getTemporalPhase()` — hour → phase |
| `packages/ui/src/theme/Theme.ts` | `phaseMatrix` + `resolvePhaseTokens()` |
| `packages/ui/src/hooks/useTheme.ts` | `useTheme()` — the only hook components use |
| `packages/ui/src/components/SanctuaryBackground.tsx` | Animated gradient backdrop |
| `apps/gurudevi-mobile/src/navigation/TabNavigator.tsx` | Renders SanctuaryBackground once |
| `packages/ui/src/context/EnvironmentContext.tsx` | `temporalPhase` + `isDark` state |
