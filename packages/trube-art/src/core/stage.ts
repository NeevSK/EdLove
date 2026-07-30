import type { TrubeStageLayer, TrubeStageSpec } from '@repo/trube-art/core/types';

export function stage(layers: TrubeStageLayer[], background?: string): TrubeStageSpec {
  return {
    kind: 'trube-stage',
    background,
    layers,
  };
}
