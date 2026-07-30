import { SILK_SOUL } from '@repo/trube-art/core/soul/SilkSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

export function SilkRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SILK_SOUL} />;
}
