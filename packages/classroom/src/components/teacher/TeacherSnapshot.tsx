import { MapPin } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import React from 'react';
import { Text, View } from 'react-native';

interface SnapshotItem {
  time: string;
  activity: string;
  location: string;
}

interface TeacherSnapshotProps {
  items: SnapshotItem[];
}

export const TeacherSnapshot: React.FC<TeacherSnapshotProps> = ({ items }) => {
  const { tokens } = useWorld();

  if (items.length === 0) {
    return (
      <View className="rounded-[32px] border border-sanctuary-border bg-sanctuary-surface-secondary/30 p-8">
        <View className="gap-2">
          <Text className="text-sm font-black text-sanctuary-text tracking-tight">
            No temporal moments are surfaced yet.
          </Text>
          <Text className="text-xs leading-relaxed text-sanctuary-text-tertiary">
            Snapshot context will appear here as the day gathers more classroom signal.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-6">
      {items.map((item, index) => (
        <View key={`${item.time}-${index}`} className="gap-4 flex-row items-start">
          <View className="rounded-2xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/20 px-3 py-2.5 shrink-0 min-w-[70px] items-center">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
              {item.time}
            </Text>
          </View>
          <View className="flex-1 rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-6">
            <View className="gap-3">
              <Text className="text-sm font-black text-sanctuary-text tracking-tight">
                {item.activity}
              </Text>
              <View className="flex-row items-center gap-2">
                <MapPin size={12} color={tokens.inkFaint} />
                <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-sanctuary-text-tertiary">
                  {item.location}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default TeacherSnapshot;
