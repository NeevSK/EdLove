import { Pressable, Text, View } from '@repo/ui/primitives';
import type { ReactNode } from 'react';

export type DerivedHistoryMode = 'now' | 'history';

export type DerivedHistoryPoint = {
  id: string;
  label: string;
  value: number;
  detail?: string;
};

export type DerivedHistoryEntry = {
  id: string;
  title: string;
  timestamp: string;
  description?: string;
  kind?: 'reflection' | 'milestone' | 'event';
};

export type DerivedHistoryViewProps = {
  mode: DerivedHistoryMode;
  onModeChange: (mode: DerivedHistoryMode) => void;
  summary?: string;
  points?: DerivedHistoryPoint[];
  entries?: DerivedHistoryEntry[];
  reinforcement?: ReactNode;
  emptyHistoryLabel?: string;
  testID?: string;
};

const pointHeight = (value: number): `${number}%` => `${Math.max(12, Math.min(100, value))}%`;

/**
 * Shared presentation for derived temporal data.
 *
 * The component deliberately accepts read models instead of fetching domain
 * data. Self, Profile, Classroom, and governance surfaces can therefore use
 * the same Now/History interaction while keeping their domain adapters and
 * privacy rules separate.
 */
export function DerivedHistoryView({
  mode,
  onModeChange,
  summary,
  points = [],
  entries = [],
  reinforcement,
  emptyHistoryLabel = 'No history has been recorded yet.',
  testID,
}: DerivedHistoryViewProps) {
  return (
    <View testID={testID} className="gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <View className="flex-row items-center justify-between">
        <View accessibilityRole="tablist" className="flex-row rounded-full bg-white/[0.06] p-1">
          {(['now', 'history'] as const).map((item) => {
            const selected = mode === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className={`rounded-full px-3 py-1.5 ${selected ? 'bg-phase-accent/20' : ''}`}
                onPress={() => onModeChange(item)}
              >
                <Text
                  className={`text-xs font-semibold capitalize ${selected ? 'text-phase-accent' : 'text-white/60'}`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {summary ? (
          <Text className="ml-3 flex-1 text-right text-xs text-white/60">{summary}</Text>
        ) : null}
      </View>

      {mode === 'now' ? (
        <View className="gap-3">
          {points.length > 0 ? (
            <View
              className="h-28 flex-row items-end justify-between gap-2"
              accessibilityRole="image"
            >
              {points.map((point) => (
                <View key={point.id} className="flex-1 items-center gap-2">
                  <View className="w-full flex-1 justify-end rounded-t-md bg-white/[0.04]">
                    <View
                      accessibilityLabel={`${point.label}: ${point.value}`}
                      className="w-full rounded-t-md bg-phase-accent"
                      style={{ height: pointHeight(point.value) }}
                    />
                  </View>
                  <Text className="text-[11px] text-white/60">{point.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-white/60">No derived signal is available yet.</Text>
          )}
          {reinforcement ? (
            <View className="rounded-xl bg-phase-accent/10 p-3">{reinforcement}</View>
          ) : null}
        </View>
      ) : (
        <View className="gap-3">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <View key={entry.id} className="flex-row gap-3">
                <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-phase-accent" />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-baseline justify-between gap-2">
                    <Text className="flex-1 text-sm font-semibold text-white">{entry.title}</Text>
                    <Text className="text-[11px] text-white/50">{entry.timestamp}</Text>
                  </View>
                  {entry.description ? (
                    <Text className="text-xs text-white/60">{entry.description}</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text className="text-sm text-white/60">{emptyHistoryLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}
