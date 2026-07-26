import { SKYMORPHIC_SOUL } from '@/core/soul/SkymorphicSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

export function SkymorphicRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SKYMORPHIC_SOUL} />;
}
