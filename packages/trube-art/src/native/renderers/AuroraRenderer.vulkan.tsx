import { AURORA_SOUL } from '@/core/soul/AuroraSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

/**
 * AuroraRendererVulkan  Tier 1 path leveraging the NativeSubstrateRenderer base.
 */
export function AuroraRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={AURORA_SOUL} />;
}
