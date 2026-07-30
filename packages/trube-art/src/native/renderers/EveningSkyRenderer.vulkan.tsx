import { EVENING_SKY_SOUL } from '@repo/trube-art/core/soul/EveningSkySoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

export function EveningSkyRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={EVENING_SKY_SOUL} />;
}
