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
      <Text style={{ color: '#fff' }}>Navigation Migrating to Expo Router</Text>
    </View>
  );
}
