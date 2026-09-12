import { act, render, screen, waitFor } from '@testing-library/react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LiveMetrics, TenantMetrics } from '@repo/analytics';

const analyticsApi = vi.hoisted(() => ({
  aggregateTenantMetrics: vi.fn(),
  getLiveMetrics: vi.fn(),
}));

vi.mock('@repo/analytics', () => ({ multiTenantAnalyticsAPI: analyticsApi }));

vi.mock('@repo/ui/components/GlobalHeader', async () => {
  const React = await import('react');
  const { Text } = await import('react-native');
  return {
    default: ({ subtitle, title }: { subtitle?: string; title?: string }) =>
      React.createElement(Text, undefined, `${title ?? ''} ${subtitle ?? ''}`.trim()),
  };
});

vi.mock('@repo/ui/components/ScreenWrapper', async () => {
  const React = await import('react');
  const { View } = await import('react-native');
  return {
    default: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, undefined, children),
  };
});

vi.mock('@repo/ui/primitives', async () => {
  const { Pressable, ScrollView, Text, View } = await import('react-native');
  return {
    Box: View,
    Heading: Text,
    HStack: View,
    Pressable,
    ScrollView,
    Text,
    VStack: View,
  };
});

import { AnalyticsDashboardScreen } from '../../screens/AnalyticsDashboardScreen';

const tenantMetrics: TenantMetrics = {
  id: 'tenant-1',
  metrics: { attendance_rate: 96 },
};

const liveMetrics: LiveMetrics = {
  active_users: 17,
  api_requests_per_minute: 52,
  error_rate: 1.2,
  resource_usage: { cpu: 30, memory: 44, storage: 58 },
  system_health: 'healthy',
  timestamp: '2026-09-07T00:00:00.000Z',
};

describe('AnalyticsDashboardScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.useFakeTimers();
    analyticsApi.aggregateTenantMetrics.mockResolvedValue([tenantMetrics]);
    analyticsApi.getLiveMetrics.mockResolvedValue(liveMetrics);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderScreen = async () =>
    await render(
      <AnalyticsDashboardScreen
        onMetricDrillDown={vi.fn()}
        onReportPress={vi.fn()}
        tenantId="tenant-1"
        tenantName="Test Academy"
        userRole="admin"
      />,
    );

  it('preserves the last live data and announces staleness when a poll fails', async () => {
    await renderScreen();

    await waitFor(() => expect(screen.getByText('17')).toBeTruthy());
    analyticsApi.getLiveMetrics.mockRejectedValueOnce(new Error('network unavailable'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    await waitFor(() => expect(screen.getByText('Last update may be stale')).toBeTruthy());
    expect(screen.getByText('17')).toBeTruthy();
  });

  it('announces unavailable live metrics when the initial fetch fails', async () => {
    analyticsApi.getLiveMetrics.mockRejectedValueOnce(new Error('network unavailable'));
    await renderScreen();

    await waitFor(() => {
      expect(
        screen.getByText('Live metrics are temporarily unavailable. Showing the last successful update.'),
      ).toBeTruthy();
    });
  });

  it('announces when institutional metrics are not connected', async () => {
    analyticsApi.aggregateTenantMetrics.mockRejectedValueOnce(
      new Error('Institutional analytics are unavailable until data sources are connected.'),
    );

    await renderScreen();

    await waitFor(() => {
      expect(
        screen.getByText('Institutional analytics are unavailable until data sources are connected.'),
      ).toBeTruthy();
    });
  });
});
