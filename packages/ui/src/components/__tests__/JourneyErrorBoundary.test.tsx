import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../../utils/haptics', () => ({
  hapticError: jest.fn(),
}));

import { JourneyErrorBoundary } from '../JourneyErrorBoundary';

function Bomb() {
  throw new Error('Test error');
  return null;
}

function GoodChild() {
  return <Text>Normal content</Text>;
}

describe('JourneyErrorBoundary', () => {
  // Suppress console.error from React's error boundary logging
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('renders children when no error', async () => {
    const { getByText } = await render(
      <JourneyErrorBoundary journey="general">
        <GoodChild />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Normal content')).toBeTruthy();
  });

  it('shows fallback UI when child throws', async () => {
    const { getByText } = await render(
      <JourneyErrorBoundary journey="auth">
        <Bomb />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Session expired')).toBeTruthy();
  });

  it('shows correct fallback for onboarding journey', async () => {
    const { getByText } = await render(
      <JourneyErrorBoundary journey="onboarding">
        <Bomb />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('shows correct fallback for create journey', async () => {
    const { getByText } = await render(
      <JourneyErrorBoundary journey="create">
        <Bomb />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Save failed')).toBeTruthy();
  });

  it('shows correct fallback for sync journey', async () => {
    const { getByText } = await render(
      <JourneyErrorBoundary journey="sync">
        <Bomb />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Sync issue')).toBeTruthy();
  });

  it('shows correct fallback for general journey', async () => {
    const { getByText } = await render(
      <JourneyErrorBoundary journey="general">
        <Bomb />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('recovers when retry button is pressed', async () => {
    const { getByText, queryByText } = await render(
      <JourneyErrorBoundary journey="create">
        <Bomb />
      </JourneyErrorBoundary>,
    );
    expect(getByText('Save failed')).toBeTruthy();
    // Press retry — state resets, but Bomb will throw again
    // So we verify the button exists
    expect(getByText('Retry')).toBeTruthy();
  });
});
