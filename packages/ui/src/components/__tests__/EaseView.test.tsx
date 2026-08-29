import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { EaseView } from '../EaseView';

describe('EaseView', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <EaseView>
        <Text>Hello</Text>
      </EaseView>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies initialAnimate values', async () => {
    const { getByText } = await render(
      <EaseView initialAnimate={{ opacity: 0.5, scale: 0.8 }}>
        <Text>Faded</Text>
      </EaseView>,
    );
    expect(getByText('Faded')).toBeTruthy();
  });

  it('applies animate values with timing transition', async () => {
    const { getByText } = await render(
      <EaseView
        initialAnimate={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 300, easing: 'easeInOut' }}
      >
        <Text>Animated</Text>
      </EaseView>,
    );
    expect(getByText('Animated')).toBeTruthy();
  });

  it('applies spring transition', async () => {
    const { getByText } = await render(
      <EaseView
        initialAnimate={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 120 }}
      >
        <Text>Spring</Text>
      </EaseView>,
    );
    expect(getByText('Spring')).toBeTruthy();
  });

  it('applies none transition (instant)', async () => {
    const { getByText } = await render(
      <EaseView
        initialAnimate={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'none' }}
      >
        <Text>Instant</Text>
      </EaseView>,
    );
    expect(getByText('Instant')).toBeTruthy();
  });

  it('accepts transformOrigin prop', async () => {
    const { getByText } = await render(
      <EaseView
        initialAnimate={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transformOrigin={{ x: 0.25, y: 0.75 }}
      >
        <Text>Origin</Text>
      </EaseView>,
    );
    expect(getByText('Origin')).toBeTruthy();
  });

  it('applies loop: reverse for breathing animation', async () => {
    const { getByText } = await render(
      <EaseView
        initialAnimate={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'timing', duration: 1500, loop: 'reverse' }}
      >
        <Text>Breathing</Text>
      </EaseView>,
    );
    expect(getByText('Breathing')).toBeTruthy();
  });

  it('applies custom style alongside animated values', async () => {
    const { getByText } = await render(
      <EaseView style={{ padding: 10 }} animate={{ opacity: 1 }}>
        <Text>Styled</Text>
      </EaseView>,
    );
    expect(getByText('Styled')).toBeTruthy();
  });
});
