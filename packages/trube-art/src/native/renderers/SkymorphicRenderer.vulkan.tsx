import React from 'react';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';
import { SKYMORPHIC_SOUL } from '../../core/soul/SkymorphicSoul';

export function SkymorphicRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SKYMORPHIC_SOUL} />;
}
