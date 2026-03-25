import React from 'react';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';
import { EVENING_SKY_SOUL } from '../../core/soul/EveningSkySoul';

export function EveningSkyRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={EVENING_SKY_SOUL} />;
}
