import type { AccessibleFeature } from '@repo/self/features/accessPolicy';
import { SelfFeatureRenderer } from '@repo/self/components/SelfFeatureRenderer';
import { SettingsGroup } from '@repo/ui/components/SettingsGroup';
import { Box, Text, Pressable } from '@repo/ui/primitives';
import React, { useCallback } from 'react';
import { hapticLight } from '@repo/ui/utils/haptics';

export type SelfCanvasViewMode = 'carousel' | 'tiled';

type ZoneId = 'today' | 'private' | 'shared';

const ZONE_LABELS: Record<ZoneId, string> = {
  today: 'Today',
  private: 'Private',
  shared: 'Shared',
};

const ZONE_DESCRIPTIONS: Record<ZoneId, string> = {
  today: 'What you use daily — use the controls to reorder, pin, or hide.',
  private: 'Personal rhythms and reflections.',
  shared: 'Growth visible to your circles.',
};

export interface SelfCanvasProps {
  features: AccessibleFeature[];
  byZone: Record<ZoneId, AccessibleFeature[]>;
  viewMode: SelfCanvasViewMode;
  onViewModeToggle: () => void;
  onReorder: (orderedIds: string[]) => void;
  onToggleHidden: (featureId: string, hidden: boolean) => void;
  onTogglePin: (featureId: string) => void;
  pinnedIds: string[];
  hiddenIds: string[];
  userId?: string;
  onFeaturePress?: (feature: AccessibleFeature) => void;
}

function ZoneSection({
  zoneId,
  features,
  pinnedIds,
  hiddenIds,
  userId,
  onToggleHidden,
  onTogglePin,
  onFeaturePress,
  onMove,
}: {
  zoneId: ZoneId;
  features: AccessibleFeature[];
  pinnedIds: string[];
  hiddenIds: string[];
  userId?: string;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onTogglePin: (id: string) => void;
  onFeaturePress?: (feature: AccessibleFeature) => void;
  onMove: (featureId: string, dir: -1 | 1) => void;
}) {
  if (features.length === 0) return null;

  return (
    <SettingsGroup title={ZONE_LABELS[zoneId]} subtitle={ZONE_DESCRIPTIONS[zoneId]}>
      {features.map((feature) => {
        const isPinned = pinnedIds.includes(feature.id);
        const isHidden = hiddenIds.includes(feature.id);
        return (
          <Box
            key={feature.id}
            className="rounded-2xl border border-border bg-phase-surface p-3 mb-3"
            accessibilityLabel={`${feature.emoji} ${feature.label}${isPinned ? ', pinned' : ''}${isHidden ? ', hidden' : ''}`}
          >
            <Box className="flex-row justify-between items-center mb-2">
              <Box className="flex-row items-center gap-2 flex-1">
                <Text className="text-base">{feature.emoji}</Text>
                <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
                  {feature.label}
                </Text>
                {feature.isGeneral ? (
                  <Box className="px-2 py-0.5 rounded-full bg-ink/5">
                    <Text className="text-[10px] font-bold text-ink/50">GENERAL</Text>
                  </Box>
                ) : null}
              </Box>
              <Box className="flex-row gap-1 items-center">
                <Pressable onPress={() => { hapticLight(); onMove(feature.id, -1); }} className="w-7 h-7 rounded-full bg-white border border-border items-center justify-center" accessibilityLabel={`Move ${feature.label} up`}>
                  <Text className="text-xs font-bold text-ink">↑</Text>
                </Pressable>
                <Pressable onPress={() => { hapticLight(); onMove(feature.id, 1); }} className="w-7 h-7 rounded-full bg-white border border-border items-center justify-center" accessibilityLabel={`Move ${feature.label} down`}>
                  <Text className="text-xs font-bold text-ink">↓</Text>
                </Pressable>
                <Pressable
                  onPress={() => { hapticLight(); onTogglePin(feature.id); }}
                  accessibilityRole="button"
                  accessibilityLabel={isPinned ? `Unpin ${feature.label}` : `Pin ${feature.label}`}
                  className={`px-3 py-1.5 rounded-full border ${isPinned ? 'bg-ink border-ink' : 'bg-white border-border'}`}
                >
                  <Text className={`text-xs font-bold ${isPinned ? 'text-white' : 'text-ink'}`}>{isPinned ? 'Pinned' : 'Pin'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => { hapticLight(); onToggleHidden(feature.id, !isHidden); }}
                  accessibilityRole="button"
                  accessibilityLabel={isHidden ? `Show ${feature.label}` : `Hide ${feature.label}`}
                  className="px-3 py-1.5 rounded-full bg-white border border-border"
                >
                  <Text className="text-xs font-bold text-ink">{isHidden ? 'Show' : 'Hide'}</Text>
                </Pressable>
              </Box>
            </Box>
            <Box className="rounded-xl bg-phase-canvas/50 p-2">
              <SelfFeatureRenderer componentId={feature.componentId} featureId={feature.id} userId={userId} compact />
            </Box>
            {onFeaturePress ? (
              <Pressable
                onPress={() => { hapticLight(); onFeaturePress(feature); }}
                className="mt-2 self-start"
                accessibilityRole="button"
                accessibilityLabel={`Open ${feature.label} detail`}
              >
                <Text className="text-xs font-semibold text-phase-interactive">Open →</Text>
              </Pressable>
            ) : null}
          </Box>
        );
      })}
    </SettingsGroup>
  );
}

export function SelfCanvas({ features, byZone, viewMode, onViewModeToggle, onReorder, onToggleHidden, onTogglePin, pinnedIds, hiddenIds, userId, onFeaturePress }: SelfCanvasProps) {
  const zones: ZoneId[] = ['today', 'private', 'shared'];
  const handleMove = useCallback(
    (featureId: string, dir: -1 | 1) => {
      const idx = features.findIndex((f) => f.id === featureId);
      if (idx === -1) return;
      const next = idx + dir;
      if (next < 0 || next >= features.length) return;
      const ids = features.map((f) => f.id);
      const tmp = ids[idx]!;
      ids[idx] = ids[next]!;
      ids[next] = tmp;
      onReorder(ids);
    },
    [features, onReorder],
  );

  return (
    <Box className="gap-4">
      <Box className="flex-row gap-2">
        <Pressable onPress={() => { hapticLight(); onViewModeToggle(); }} className="px-3 py-1.5 rounded-full border bg-white border-border">
          <Text className="text-xs font-bold text-ink">{viewMode === 'tiled' ? 'Tiled' : 'Carousel'} — toggle</Text>
        </Pressable>
      </Box>
      {zones.map((zoneId) => (
        <ZoneSection
          key={zoneId}
          zoneId={zoneId}
          features={byZone[zoneId] ?? []}
          pinnedIds={pinnedIds}
          hiddenIds={hiddenIds}
          userId={userId}
          onToggleHidden={onToggleHidden}
          onTogglePin={onTogglePin}
          onFeaturePress={onFeaturePress}
          onMove={handleMove}
        />
      ))}
    </Box>
  );
}
