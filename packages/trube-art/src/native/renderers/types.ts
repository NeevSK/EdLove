import type { TrubeStageSpec, TrubeRenderPlan, ResolvedTrubeSurface } from '../../core/types';

export interface TrubeRendererProps {
  width: number;
  height: number;
  surface: ResolvedTrubeSurface;
  stage: TrubeStageSpec;
  plan: TrubeRenderPlan;
}
