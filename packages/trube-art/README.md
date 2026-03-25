# @repo/trube-art

`@repo/trube-art` is a living-surface engine for React Native built on Skia.

It is designed around three artistic layers:

- `surface`: atmospheric light behavior
- `ornament`: micro-detail and overtone structure
- `motif`: authored line-based forms such as lotus, branch, or tide

On top of those primitives, Trube-Art also ships `score` presets: composed scenes that can be used directly in products.

## Package shape

Core exports:

- `surface(...)`
- `stage(...)`
- `ornament(...)`
- `motif(...)`
- `getSurfacePreset(...)`
- `getScorePreset(...)`
- `getScoresForExperience(...)`
- `getExperienceGuidance(...)`
- `getCanonicalScores(...)`
- `getScoreCollections(...)`
- `getCollectionScores(...)`
- `getScoresByReviewState(...)`
- `getProductionReadyScores(...)`

Native exports:

- `TrubeCanvas`
- `TrubeView`
- `TrubeStage`
- `TrubeOrnament`
- `TrubeMotif`

## Installation

Install peer dependencies in the consuming app:

```bash
pnpm add react react-native @shopify/react-native-skia
pnpm add @repo/trube-art
```

## Quick start

```tsx
import { surface } from '@repo/trube-art';
import { TrubeCanvas } from '@repo/trube-art/native';

export function HeroBackdrop() {
  return (
    <TrubeCanvas
      style={{ flex: 1 }}
      surface={surface('aurora', {
        light: 'night',
        motion: 'gentle',
        intensity: 'balanced',
        grain: 'rich',
      })}
    />
  );
}
```

## Composed stage

```tsx
import { stage, surface } from '@repo/trube-art';
import { TrubeStage } from '@repo/trube-art/native';

const scene = stage([
  {
    id: 'body',
    role: 'body',
    surface: surface('young-leaf', { light: 'morning' }),
    opacity: 0.92,
  },
  {
    id: 'air',
    role: 'air',
    surface: surface('mist', { light: 'morning', intensity: 'subtle' }),
    opacity: 0.24,
    quality: 'efficient',
  },
]);

export function LivingCardSurface() {
  return <TrubeStage stage={scene} style={{ flex: 1, borderRadius: 24 }} cornerRadius={24} />;
}
```

## Score presets

Trube-Art includes higher-level authored presets:

- `goethe-night-study`
- `lotus-dawn`
- `branch-wind`
- `tidal-memory`
- `beethoven-dawn`
- `lotus-vigil`
- `shoreline-reverie`
- `vellum-prayer`
- `sanctuary-air`

```tsx
import { getScorePreset } from '@repo/trube-art';
import { TrubeStage } from '@repo/trube-art/native';

const score = getScorePreset('goethe-night-study');

export function ScoreBackdrop() {
  return <TrubeStage stage={score.stage} style={{ flex: 1 }} />;
}
```

## Design intent

Trube-Art is not a theme system and not a static wallpaper library.

It aims to make screens feel:

- spatial rather than flat
- rewarding under attention
- emotionally tuned through rhythm and detail
- reusable across apps without leaking app-specific semantics into the core

## Experience modes

Scores are curated into three experience modes:

- `quiet`: reserved, breathable, and suited for reading or utility-heavy screens
- `ambient`: living atmosphere for home surfaces and mood-carrying layouts
- `ceremonial`: signature moments that should be used sparingly and deliberately

```tsx
import { getScoresForExperience } from '@repo/trube-art';

const ceremonialScores = getScoresForExperience('ceremonial');
```

## Curated offerings

The package also groups scenes into taste-led collections so products can adopt them as families:

- `daily-rhythm`
- `sacred-ceremony`
- `peripheral-air`

## Production guidance

Use Trube-Art as a composed layer under UI, not as a replacement for UI.

Recommended adoption order:

1. Add a single backdrop or hero card.
2. Validate performance on real devices.
3. Promote successful compositions into score presets.
4. Reuse those presets across screens and apps.

Current technical reality:

- Tier 1 contract: `webgpu-future` plus `reanimated-future`
- Tier 2 contract: Skia-based live rendering
- Compatibility contract: static, non-Skia fallback for older, hot, or low-power devices

This keeps low-end devices from being forced through the same rendering path as premium hardware while the full Soul and Time layer upgrade is underway.

## Taste guardrails

Trube-Art should create presence, not noise.

- Prefer three memorable presets over twenty decorative ones.
- Use ceremonial scenes only at emotionally meaningful moments.
- Do not layer strong Trube scenes behind dense feeds, heavy cards, or noisy illustration.
- If a scene competes with reading, input, or wayfinding, reduce it to a quieter score.

## Placement guidance

Each score carries placement metadata so products can decide where content should sit, not just what the scene looks like.

- `focalZone`: where the visual gravity naturally lands
- `safeOverlayZone`: where text or controls should be safest
- `textDensity`: how much foreground content the score can tolerate

Canonical Gurudevi standard:

- `lotus-dawn`
- `goethe-night-study`
- `lotus-vigil`

## Review workflow

Each score now carries:

- `review.state`: `approved`, `in-review`, or `experimental`
- `lineage`: doctrine, Gurudevi dialect, and temperament notes
- `placement`: composition guidance for overlay and content density

This keeps the package usable as a production library instead of a pile of pretty scenes with no governance.

## Export artifacts

Approval state is exported as versioned artifacts during `build`:

- `artifacts/approval-manifest.json`: machine-readable release manifest
- `artifacts/approval-snapshots.md`: human-readable snapshot report for review and diffing

Useful commands:

```bash
pnpm --filter @repo/trube-art build
pnpm --filter @repo/trube-art export:artifacts
```
