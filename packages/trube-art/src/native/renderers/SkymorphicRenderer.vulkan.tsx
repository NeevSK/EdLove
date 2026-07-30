import { SKYMORPHIC_SOUL } from '@repo/trube-art/core/soul/SkymorphicSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

export function SkymorphicRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SKYMORPHIC_SOUL} />;
}
