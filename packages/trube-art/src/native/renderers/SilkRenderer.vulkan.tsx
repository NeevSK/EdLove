import { SILK_SOUL } from '@/core/soul/SilkSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

export function SilkRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={SILK_SOUL} />;
}
