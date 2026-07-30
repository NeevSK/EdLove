import { AURORA_SOUL } from '@repo/trube-art/core/soul/AuroraSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

/**
 * AuroraRendererVulkan  Tier 1 path leveraging the NativeSubstrateRenderer base.
 */
export function AuroraRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={AURORA_SOUL} />;
}
