import { MIST_SOUL } from '@repo/trube-art/core/soul/MistSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

/**
 * MistRendererVulkan  Tier 1 path leveraging the NativeSubstrateRenderer base.
 */
export function MistRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={MIST_SOUL} />;
}
