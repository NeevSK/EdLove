import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('react-native-external-keyboard', () => ({
  K: {
    Pressable: (props: any) => {
      const React = require('react');
      return React.createElement('Pressable', props);
    },
  },
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
  useKeyboardHandler: jest.fn(() => {}),
}));

import { FocusRing } from '../FocusRing';

describe('FocusRing', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <FocusRing>
        <Text>Focusable item</Text>
      </FocusRing>,
    );
    expect(getByText('Focusable item')).toBeTruthy();
  });

  it('accepts custom ring color', async () => {
    const { getByText } = await render(
      <FocusRing ringColor="#FF0000">
        <Text>Focusable item</Text>
      </FocusRing>,
    );
    expect(getByText('Focusable item')).toBeTruthy();
  });

  it('accepts enabled prop', async () => {
    const { getByText } = await render(
      <FocusRing enabled={false}>
        <Text>Focusable item</Text>
      </FocusRing>,
    );
    expect(getByText('Focusable item')).toBeTruthy();
  });
});
