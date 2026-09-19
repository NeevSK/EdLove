import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

// Telemetry is an external boundary, not part of visual state rendering.
vi.mock('@repo/core/monitoring', () => ({ trackEvent: vi.fn() }));
vi.mock('../components/BrandPulse', () => ({ BrandPulse: () => null }));
vi.mock('../components/BrandedEmptyState', () => ({ BrandedEmptyState: () => null }));
vi.mock('../components/ErrorState', () => ({
  ErrorState: ({ children }: { children?: ReactNode }) => children ?? null,
}));

import { FeatureStateBoundary } from '../components/FeatureStateBoundary';

const snapshot = (state: Parameters<typeof FeatureStateBoundary>[0]['snapshot']['state']) => ({
  state,
  lastKnownGoodAt: null,
  pendingMutationCount: 0,
  canRetry: state === 'retryable_error',
  canEdit: true,
  isSensitive: false,
  safeMessage: `State: ${state}`,
});

describe('FeatureStateBoundary runtime contract', () => {
  it('keeps content usable when stale offline data is the last known good state', async () => {
    const screen = await render(
      <FeatureStateBoundary snapshot={snapshot('offline_stale')}>
        <Text>Last known reflection</Text>
      </FeatureStateBoundary>,
    );

    expect(screen.getByText('State: offline_stale')).toBeTruthy();
    expect(screen.getByText('Last known reflection')).toBeTruthy();
  });

  it('exposes a real retry control only when the shared state allows recovery', async () => {
    const onRetry = vi.fn();
    const screen = await render(
      <FeatureStateBoundary onRetry={onRetry} snapshot={snapshot('retryable_error')}>
        <Text>Hidden while recovery is needed</Text>
      </FeatureStateBoundary>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Hidden while recovery is needed')).toBeNull();
  });

  it('does not render a feature after its lifecycle is disposed', async () => {
    const screen = await render(
      <FeatureStateBoundary snapshot={snapshot('disposed')}>
        <Text>Disposed content</Text>
      </FeatureStateBoundary>,
    );

    expect(screen.queryByText('Disposed content')).toBeNull();
  });
});
