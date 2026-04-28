import React from 'react';
import { WATERFALL_SOUL } from '../../core/soul/WaterfallSoul';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';

export function WaterfallRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATERFALL_SOUL} />;
}
