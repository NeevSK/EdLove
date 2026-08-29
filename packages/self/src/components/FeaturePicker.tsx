import { Box, Text, Pressable } from '@repo/ui/primitives';
import { SettingsGroup } from '@repo/ui/components/SettingsGroup';
import type { SelfFeatureDefinition } from '@repo/self/features/featureCatalog';
import React, { useDeferredValue, useMemo, useState } from 'react';
import { TextInput } from 'react-native';

export interface FeaturePickerProps {
  catalog: Record<string, SelfFeatureDefinition>;
  selectedIds: string[];
  hiddenIds: string[];
  onToggleSelected: (id: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
}

export function FeaturePicker({ catalog, selectedIds, hiddenIds, onToggleSelected, onToggleHidden }: FeaturePickerProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const all = Object.values(catalog) as SelfFeatureDefinition[];
    if (!q) return all;
    return all.filter((f) => f.label.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [catalog, deferredQuery]);

  return (
    <SettingsGroup title="Pick your spaces" subtitle="Select, search, and prioritize. Selected stays first.">
      <Box className="gap-3">
        <Box className="rounded-xl border border-border bg-white px-3 py-2">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search spaces, e.g. pulse, rhythm, journey"
            accessibilityLabel="Search spaces"
            style={{ color: '#1f1b16', fontSize: 14, paddingVertical: 4 }}
          />
        </Box>
        {filtered.map((feature) => {
          const isSelected = selectedIds.includes(feature.id);
          const isHidden = hiddenIds.includes(feature.id);
          return (
            <Box key={feature.id} className="rounded-xl border border-border p-3 bg-phase-surface gap-2">
              <Box className="flex-row justify-between items-center gap-2">
                <Box className="flex-row items-center gap-2 flex-1">
                  <Text className="text-base">{feature.emoji}</Text>
                  <Box className="flex-1">
                    <Text className="text-sm font-bold text-ink" numberOfLines={1}>
                      {feature.label}
                    </Text>
                    <Text className="text-xs text-ink/50" numberOfLines={1}>
                      {feature.category} · {feature.domain} · {feature.defaultZone}
                    </Text>
                  </Box>
                </Box>
                <Pressable
                  onPress={() => onToggleSelected(feature.id)}
                  accessibilityRole="button"
                  className={`px-3 py-1.5 rounded-full border ${isSelected ? 'bg-ink border-ink' : 'bg-white border-border'}`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-ink'}`}>{isSelected ? 'Selected' : 'Add'}</Text>
                </Pressable>
              </Box>
              <Box className="flex-row gap-1">
                <Pressable
                  onPress={() => onToggleHidden(feature.id, !isHidden)}
                  className={`px-3 py-1 rounded-full border ${isHidden ? 'bg-amber-100 border-amber-300' : 'bg-white border-border'}`}
                >
                  <Text className="text-xs font-bold text-ink">{isHidden ? 'Hidden' : 'Hide'}</Text>
                </Pressable>
                <Box className="px-2 py-1 rounded-full bg-ink/5">
                  <Text className="text-[10px] font-bold text-ink/50">{feature.defaultZone}</Text>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </SettingsGroup>
  );
}
