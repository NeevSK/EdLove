import React from 'react';
import { View, Text } from 'react-native';
import { measureRenders } from 'reassure';
// Direct import to check module resolution
import { render } from '@testing-library/react-native';

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
    // Assert that we can resolve testing-library successfully
    expect(render).toBeDefined();
    
    await measureRenders(
      <SimpleCard title="Test Lesson" description="Learning React Native Performance" />
    );
  });
});
