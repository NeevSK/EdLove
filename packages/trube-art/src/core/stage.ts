import type { TrubeStageLayer, TrubeStageSpec } from '@/core/types';

export function stage(layers: TrubeStageLayer[], background?: string): TrubeStageSpec {
  return {
    kind: 'trube-stage',
    background,
    layers,
  };
}
