import React from 'react';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';
import { MIST_SOUL } from '../../core/soul/MistSoul';

/**
 * MistRendererVulkan  Tier 1 path leveraging the NativeSubstrateRenderer base.
 */
export function MistRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={MIST_SOUL} />;
}
