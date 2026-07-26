import { WATER_SURFACE_SOUL } from '@/core/soul/WaterSurfaceSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

export function WaterSurfaceRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATER_SURFACE_SOUL} />;
}
