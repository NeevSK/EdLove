import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

export function BrokenAdversarialComponent() {
  // 1. Remediated Hermes Bytecode: Safe arithmetic token evaluation without forbidden dynamic code execution
  const calculateScore = (expr: string): number => {
    const match = expr.match(/^(\d+)\s*\+\s*(\d+)$/);
    if (match) {
      return parseInt(match[1]!, 10) + parseInt(match[2]!, 10);
    }
    return 0;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 2. Remediated Yoga Layout Physics: Explicit flex: 1 and flexGrow content bounds */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text>Properly sized content with healthy Yoga bounds</Text>
        
        {/* 3. Remediated Touch Target: Meets 44x44pt Apple HIG & Material touch target standard */}
        <Pressable
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => calculateScore('1 + 2')}
          accessibilityRole="button"
          accessibilityLabel="Add score"
        >
          <Text>+</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

