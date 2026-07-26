import { WATERFALL_SOUL } from '@/core/soul/WaterfallSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

export function WaterfallRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATERFALL_SOUL} />;
}
