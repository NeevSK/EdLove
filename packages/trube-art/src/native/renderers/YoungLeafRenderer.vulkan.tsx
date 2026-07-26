import { YOUNG_LEAF_SOUL } from '@/core/soul/YoungLeafSoul';
import type { TrubeRendererProps } from '@/native/renderers/types';
import { NativeSubstrateRenderer } from '@/native/renderers/NativeSubstrateRenderer';

export function YoungLeafRendererVulkan(props: TrubeRendererProps) {
  return <NativeSubstrateRenderer {...props} soul={YOUNG_LEAF_SOUL} />;
}
