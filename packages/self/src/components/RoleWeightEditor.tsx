import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';
import { SettingsGroup } from '@repo/ui/components/SettingsGroup';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface RoleWeightEditorProps {
  roles: SelfViewRole[];
  weights: Partial<Record<SelfViewRole, number>>;
  onChange: (weights: Partial<Record<SelfViewRole, number>>) => void;
}

const PRESETS: Array<{ label: string; weights: Partial<Record<SelfViewRole, number>> }> = [
  { label: 'Balanced', weights: {} },
  { label: '70% teacher / 30% guardian', weights: { teacher: 70, guardian: 30 } },
  { label: 'Teacher focus', weights: { teacher: 100 } },
  { label: 'Guardian focus', weights: { guardian: 100 } },
];

export function RoleWeightEditor({ roles, weights, onChange }: RoleWeightEditorProps) {
  return (
    <SettingsGroup title="Role emphasis" subtitle="You hold multiple roles. Adjust prioritization.">
      <View className="gap-3">
        <Text className="text-xs text-ink/60">
          Detected roles: {roles.join(' + ') || 'student'}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Pressable
              key={preset.label}
              onPress={() => onChange(preset.weights)}
              className="px-3 py-2 rounded-full border bg-white border-border"
            >
              <Text className="text-xs font-semibold text-ink">{preset.label}</Text>
            </Pressable>
          ))}
        </View>
        {roles.map((role) => (
          <View
            key={role}
            className="flex-row items-center justify-between rounded-xl border border-border p-3 bg-phase-surface"
          >
            <Text className="text-sm font-bold capitalize text-ink">{role}</Text>
            <View className="flex-row gap-1">
              {[0, 30, 70, 100].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => onChange({ ...weights, [role]: v })}
                  className={`px-3 py-1 rounded-full border ${weights[role] === v ? 'bg-ink border-ink' : 'bg-white border-border'}`}
                >
                  <Text
                    className={`text-xs font-bold ${weights[role] === v ? 'text-white' : 'text-ink'}`}
                  >
                    {v}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SettingsGroup>
  );
}

export default RoleWeightEditor;
