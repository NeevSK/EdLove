import React from 'react';
import { View, Text } from 'react-native';
import { measurePerformance } from 'reassure';

// A simple component to benchmark
const SimpleCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      <Text>{description}</Text>
    </View>
  );
};

describe('App Performance Benchmarks', () => {
  it('measures rendering performance of SimpleCard', async () => {
    // Reassure measurePerformance mounts the component multiple times 
    // to calculate mean render duration and render counts.
    await measurePerformance(
      <SimpleCard title="Test Lesson" description="Learning React Native Performance" />
    );
  });
});
