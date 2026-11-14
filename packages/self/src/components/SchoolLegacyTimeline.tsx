import React from 'react';
import { Text, View } from 'react-native';

interface SchoolLegacyTimelineProps {
  schoolId: string;
}

export function SchoolLegacyTimeline({ schoolId }: SchoolLegacyTimelineProps) {
  void schoolId;

  return (
    <View className="p-6 rounded-3xl border border-dashed border-white/10">
      <Text className="text-sm text-mistGray/60">
        Institutional history is unavailable in the current API foundation.
      </Text>
    </View>
  );
}

export default SchoolLegacyTimeline;
