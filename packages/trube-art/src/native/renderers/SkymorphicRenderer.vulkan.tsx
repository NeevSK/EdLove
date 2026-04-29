import { SKYMORPHIC_SOUL } from '../../core/soul/SkymorphicSoul';
import type { TrubeRendererProps } from '../renderers/types';
import { NativeSubstrateRenderer } from './NativeSubstrateRenderer';

export function SkymorphicRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SKYMORPHIC_SOUL} />;
}
