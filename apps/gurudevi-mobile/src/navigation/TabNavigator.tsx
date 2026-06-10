import React from 'react';
import { Text, View } from 'react-native';

export default function TabNavigator({
  onTabChange: _onTabChange,
}: {
  onTabChange?: (tabName: string) => void;
}) {
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}
    >
      <Text style={{ color: '#fff', textAlign: 'center', paddingHorizontal: 24 }}>
        Archived React Navigation tab shell placeholder. Use Expo Router routes under `app/`.
      </Text>
    </View>
  );
}
