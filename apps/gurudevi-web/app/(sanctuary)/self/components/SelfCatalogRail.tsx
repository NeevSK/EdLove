'use client';

import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import type { WorkbenchTaskDescriptor } from '@repo/core/types';
import type { SelfFeatureManifestItem } from '@repo/self/features/catalog';
import { SELF_FEATURE_MANIFEST, type useSelfCanvas } from '../../../../lib/canvas/useSelfCanvas';
import { QuickAccessRail } from '../../components/workbench/QuickAccessRail';

export function SelfCatalogRail({
  canvas,
  focusedTask,
  onOpenFeature,
  visible,
}: Readonly<{
  canvas: ReturnType<typeof useSelfCanvas>;
  focusedTask: WorkbenchTaskDescriptor | null;
  onOpenFeature: (feature: SelfFeatureManifestItem) => void;
  visible: boolean;
}>) {
  return (
    <QuickAccessRail
      domain="self"
      activeId={focusedTask?.featureId}
      items={SELF_FEATURE_MANIFEST.all.map((feature) => ({
        id: feature.id,
        label: feature.label,
        emoji: feature.emoji,
      }))}
      onOpen={(item) => {
        const feature = SELF_FEATURE_MANIFEST.all.find((candidate) => candidate.id === item.id);
        if (feature) onOpenFeature(feature);
      }}
      onTogglePin={canvas.togglePin}
      pinnedIds={canvas.pinnedIds}
      pinLimit={getMaxPinnedForWorkspace('self')}
      visible={visible}
    />
  );
}
