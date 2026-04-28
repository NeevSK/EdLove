import React from 'react';
import { WATER_SURFACE_SOUL } from '../../core/soul/WaterSurfaceSoul';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';

export function WaterSurfaceRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATER_SURFACE_SOUL} />;
}
