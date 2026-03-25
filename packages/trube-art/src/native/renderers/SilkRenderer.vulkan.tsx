import React from 'react';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';
import { SILK_SOUL } from '../../core/soul/SilkSoul';

export function SilkRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SILK_SOUL} />;
}
