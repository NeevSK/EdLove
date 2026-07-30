import { YOUNG_LEAF_SOUL } from '@repo/trube-art/core/soul/YoungLeafSoul';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';
import { NativeSubstrateRenderer } from '@repo/trube-art/native/renderers/NativeSubstrateRenderer';

export function YoungLeafRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={YOUNG_LEAF_SOUL} />;
}
