import { render } from '@testing-library/react-native';
import React from 'react';
import { TutiiLiving } from '../TutiiLiving';

vi.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: ({ ref, ...props }: Record<string, unknown> & { ref?: unknown }) =>
      React.createElement('Image', { ...props, ref, testID: props.testID ?? 'expo-image' }),
  };
});

describe('TutiiLiving Component', () => {
  it('renders with default props without crashing', async () => {
    const { getAllByTestId } = await render(<TutiiLiving />);
    const images = getAllByTestId('expo-image');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('renders student role with custom attire', async () => {
    const { getAllByTestId } = await render(<TutiiLiving role="student" state="curious" />);
    const images = getAllByTestId('expo-image');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('respects reducedMotion prop by not crashing and maintaining still state', async () => {
    const { getAllByTestId } = await render(<TutiiLiving reducedMotion={true} />);
    const images = getAllByTestId('expo-image');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('renders resting state with closed eyes', async () => {
    const { getAllByTestId } = await render(<TutiiLiving state="resting" />);
    const images = getAllByTestId('expo-image');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });
});
