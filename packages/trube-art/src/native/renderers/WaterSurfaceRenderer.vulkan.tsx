import { WATER_SURFACE_SOUL } from '@repo/trube-art/core/soul/WaterSurfaceSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

export function WaterSurfaceRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATER_SURFACE_SOUL} />;
}
