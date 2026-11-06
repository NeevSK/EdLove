import React from 'react';
import { Text, View } from 'react-native';

interface TeachingHistoryTimelineProps {
  userId: string;
}

export function TeachingHistoryTimeline({ userId }: TeachingHistoryTimelineProps) {
  void userId;

  return (
    <View className="p-6 rounded-3xl border border-dashed border-white/10">
      <Text className="text-sm text-mistGray/60">
        Professional history is unavailable in the current API foundation.
      </Text>
    </View>
  );
}

export default TeachingHistoryTimeline;
