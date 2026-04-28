import React from 'react';
import { MIST_SOUL } from '../../core/soul/MistSoul';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';

/**
 * MistRendererVulkan  Tier 1 path leveraging the NativeSubstrateRenderer base.
 */
export function MistRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={MIST_SOUL} />;
}
