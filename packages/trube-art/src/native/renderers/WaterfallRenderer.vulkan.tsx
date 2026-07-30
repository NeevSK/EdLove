import { WATERFALL_SOUL } from '@repo/trube-art/core/soul/WaterfallSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

export function WaterfallRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={WATERFALL_SOUL} />;
}
