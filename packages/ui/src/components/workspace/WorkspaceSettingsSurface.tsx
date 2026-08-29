import { Box, Text, Pressable } from '@repo/ui/primitives';
import { SettingsGroup } from '@repo/ui/components/SettingsGroup';
import React from 'react';

export interface WorkspaceSettingsSurfaceProps {
  hiddenIds: string[];
  allIds: { id: string; label: string; zone: string }[];
  zones: string[];
  onToggleHidden: (id: string, hidden: boolean) => void;
  onChangeZone: (id: string, zone: string) => void;
  onReset: () => void;
  pinnedIds: string[];
}

export function WorkspaceSettingsSurface({ hiddenIds, allIds, zones, onToggleHidden, onChangeZone, onReset, pinnedIds }: WorkspaceSettingsSurfaceProps) {
  return (
    <SettingsGroup title="Workspace settings" subtitle="Show, hide, move zones, or reset.">
      <Box className="gap-3">
        {allIds.map((item) => {
          const isHidden = hiddenIds.includes(item.id);
          const isPinned = pinnedIds.includes(item.id);
          return (
            <Box key={item.id} className="rounded-xl border border-border p-3 bg-phase-surface gap-2">
              <Box className="flex-row justify-between items-center">
                <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
                  {item.label} {isPinned ? '· pinned' : ''}
                </Text>
                <Pressable
                  onPress={() => onToggleHidden(item.id, !isHidden)}
                  accessibilityRole="button"
                  className={`px-3 py-1.5 rounded-full border ${isHidden ? 'bg-amber-100 border-amber-300' : 'bg-white border-border'}`}
                >
                  <Text className="text-xs font-bold text-ink">{isHidden ? 'Hidden' : 'Visible'}</Text>
                </Pressable>
              </Box>
              <Box className="flex-row gap-1 flex-wrap">
                {zones.map((zone) => (
                  <Pressable
                    key={zone}
                    onPress={() => onChangeZone(item.id, zone)}
                    className={`px-3 py-1 rounded-full border ${item.zone === zone ? 'bg-ink border-ink' : 'bg-white border-border'}`}
                  >
                    <Text className={`text-xs font-semibold ${item.zone === zone ? 'text-white' : 'text-ink'}`}>{zone}</Text>
                  </Pressable>
                ))}
              </Box>
            </Box>
          );
        })}
        <Pressable onPress={onReset} className="mt-2 self-start px-4 py-2 rounded-full bg-ink">
          <Text className="text-xs font-bold text-white">Reset to defaults</Text>
        </Pressable>
      </Box>
    </SettingsGroup>
  );
}
