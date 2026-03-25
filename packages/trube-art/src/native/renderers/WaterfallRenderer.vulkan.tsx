import React from 'react';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';
import { WATERFALL_SOUL } from '../../core/soul/WaterfallSoul';

export function WaterfallRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATERFALL_SOUL} />;
}
