import type { ResolvedTrubeSurface, TrubeRenderPlan, TrubeStageSpec } from '@repo/trube-art/core/types';

export interface TrubeRendererProps {
  width: number;
  height: number;
  surface: ResolvedTrubeSurface;
  stage: TrubeStageSpec;
  plan: TrubeRenderPlan;
}
