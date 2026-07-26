import { MIST_SOUL } from '@/core/soul/MistSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

/**
 * MistRendererVulkan  Tier 1 path leveraging the NativeSubstrateRenderer base.
 */
export function MistRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={MIST_SOUL} />;
}
