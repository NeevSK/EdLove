import { type LiveMetrics, multiTenantAnalyticsAPI, type TenantMetrics } from '@repo/analytics';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Heading, HStack, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

interface AnalyticsDashboardScreenProps {
  tenantId: string;
  tenantName: string;
  userRole: string;
  onReportPress: (report: any) => void;
  onMetricDrillDown: (metric: string, data: any) => void;
}

export const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardScreenProps> = ({
  tenantId,
  tenantName,
  userRole,
  onReportPress,
  onMetricDrillDown,
}) => {
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [liveMetricsError, setLiveMetricsError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, _setSelectedTimeRange] = useState<
    'week' | 'month' | 'quarter' | 'year'
  >('month');

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setMetricsError(null);
      const timeRange = getTimeRange(selectedTimeRange);
      const tenantMetrics = await multiTenantAnalyticsAPI.aggregateTenantMetrics(
        [tenantId],
        timeRange,
      );
      setMetrics(tenantMetrics[0] || null);
    } catch (error) {
      console.error('Failed to load analytics dashboard:', error);
      setMetrics(null);
      setMetricsError(
        error instanceof Error
          ? error.message
          : 'Institutional analytics are temporarily unavailable.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange, tenantId]);

  const loadLiveMetrics = useCallback(async () => {
    try {
      const live = await multiTenantAnalyticsAPI.getLiveMetrics(tenantId);
      setLiveMetrics(live);
      setLiveMetricsError(null);
    } catch (error) {
      console.error('Failed to load live metrics:', error);
      setLiveMetricsError(
        'Live metrics are temporarily unavailable. Showing the last successful update.',
      );
    }
  }, [tenantId]);

  useEffect(() => {
    void loadDashboard();
    void loadLiveMetrics();
    const interval = setInterval(() => void loadLiveMetrics(), 30000);
    return () => clearInterval(interval);
  }, [loadLiveMetrics, loadDashboard]);

  const getTimeRange = (range: string) => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const getMetricColor = (value: number, metric: string) => {
    const thresholds = {
      attendance_rate: { good: 95, warning: 85 },
      grade_average: { good: 85, warning: 75 },
      parent_engagement: { good: 70, warning: 50 },
      operational_efficiency: { good: 85, warning: 70 },
      compliance_score: { good: 90, warning: 80 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-phaseText-secondary';

    if (value >= threshold.good) return 'text-phase-interactive';
    if (value >= threshold.warning) return 'text-phase-warning';
    return 'text-phase-danger';
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-phase-interactive';
      case 'warning':
        return 'text-phase-warning';
      case 'critical':
        return 'text-phase-danger';
      default:
        return 'text-phaseText-secondary';
    }
  };

  const getChangeIndicator = (metric: string) => {
    const trends: Record<string, string> = {
      attendance_rate: '↑ 2.3%',
      grade_average: '↑ 1.8%',
      parent_engagement: '↓ 0.5%',
      operational_efficiency: '↑ 3.2%',
      compliance_score: '→ 0.0%',
    };

    return trends[metric] || '→ 0.0%';
  };

  const formatValue = (value: number, key: string) => {
    const formatted = typeof value === 'number' ? value.toFixed(1) : value || 0;
    const suffix =
      key.includes('rate') ||
      key.includes('engagement') ||
      key.includes('efficiency') ||
      key.includes('score')
        ? '%'
        : '';
    return `${formatted}${suffix}`;
  };

  const renderMetricCard = (key: string, value: number, title: string, icon: string) => (
    <Pressable
      key={key}
      onPress={() => onMetricDrillDown(key, { value, title })}
      className="bg-phase-surface p-4 rounded-3xl border border-phase-border w-[47%] mb-3 active:scale-95"
    >
      <VStack className="items-center gap-2">
        <Text className="text-2xl">{icon}</Text>
        <Text className="text-[10px] font-black uppercase tracking-wider text-phaseText-muted text-center">
          {title}
        </Text>
        <Text className={`text-2xl font-black ${getMetricColor(value, key)}`}>
          {formatValue(value, key)}
        </Text>
        <Text className="text-[10px] font-bold text-phaseText-muted/50">
          {getChangeIndicator(key)}
        </Text>
      </VStack>
    </Pressable>
  );

  const renderLiveMetricCard = (
    title: string,
    value: string | number,
    subtitle: string,
    colorClass: string,
  ) => (
    <Box
      key={title}
      className="bg-phase-surface p-4 rounded-3xl border border-phase-border flex-1 min-w-[140px] mb-3 items-center"
    >
      <Text className="text-[10px] font-black uppercase tracking-wider text-phaseText-muted mb-2">
        {title}
      </Text>
      <Text className={`text-xl font-black ${colorClass}`}>{value}</Text>
      <Text className="text-[10px] font-bold text-phaseText-muted/50 mt-1">{subtitle}</Text>
    </Box>
  );

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-10 bg-phase-canvas">
          <Text className="text-phaseText-muted font-bold italic">
            Loading analytics dashboard...
          </Text>
        </Box>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noTopInset={true}>
      <GlobalHeader title="Analytics" subtitle={tenantName} />

      <ScrollView
        className="flex-1 bg-phase-canvas"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack className="gap-8">
          <VStack className="gap-4">
            <Heading className="text-base font-black text-phaseText-primary uppercase tracking-widest opacity-40">
              Key Performance Metrics
            </Heading>
            {metricsError ? (
              <Box
                accessibilityRole="alert"
                className="rounded-2xl border border-phase-warning/30 bg-phase-warning/10 p-4"
              >
                <Text className="text-sm font-bold text-phaseText-primary">{metricsError}</Text>
              </Box>
            ) : null}
            <HStack className="flex-wrap justify-between">
              {metrics &&
                Object.entries(metrics.metrics).map(([key, value]) => {
                  const metricTitles: Record<string, string> = {
                    attendance_rate: 'Attendance',
                    grade_average: 'Grades',
                    enrollment_count: 'Enrollment',
                    staff_turnover: 'Turnover',
                    resource_utilization: 'Resources',
                    parent_engagement: 'Engagement',
                    document_processing_time: 'Doc Speed',
                    revenue_per_student: 'Revenue',
                    operational_efficiency: 'Efficiency',
                    compliance_score: 'Compliance',
                  };

                  const metricIcons: Record<string, string> = {
                    attendance_rate: '📊',
                    grade_average: '🎯',
                    enrollment_count: '👥',
                    staff_turnover: '🔄',
                    resource_utilization: '📦',
                    parent_engagement: '👨‍👩‍👧‍👦',
                    document_processing_time: '📄',
                    revenue_per_student: '💰',
                    operational_efficiency: '⚡',
                    compliance_score: '✅',
                  };

                  return renderMetricCard(
                    key,
                    value as number,
                    metricTitles[key] || key,
                    metricIcons[key] || '📊',
                  );
                })}
            </HStack>
          </VStack>

          {liveMetrics && (
            <VStack className="gap-4">
              <HStack className="items-center justify-between gap-3">
                <Heading className="text-base font-black text-phaseText-primary uppercase tracking-widest opacity-40">
                  Live System Health
                </Heading>
                {liveMetricsError ? (
                  <Text
                    accessibilityRole="alert"
                    className="flex-1 text-right text-[10px] font-bold text-phase-warning"
                  >
                    Last update may be stale
                  </Text>
                ) : null}
              </HStack>
              <HStack className="flex-wrap gap-4">
                {renderLiveMetricCard(
                  'Active Users',
                  liveMetrics.active_users,
                  'Currently online',
                  'text-phase-interactive',
                )}
                {renderLiveMetricCard(
                  'API Reqs/m',
                  liveMetrics.api_requests_per_minute,
                  'Last 60s',
                  getSystemHealthColor(liveMetrics.system_health),
                )}
                {renderLiveMetricCard(
                  'Error Rate',
                  `${liveMetrics.error_rate.toFixed(1)}%`,
                  'Last 60s',
                  liveMetrics.error_rate > 5 ? 'text-phase-danger' : 'text-phase-interactive',
                )}
                {renderLiveMetricCard(
                  'Health',
                  liveMetrics.system_health.toUpperCase(),
                  `Updated ${new Date(liveMetrics.timestamp).toLocaleTimeString()}`,
                  getSystemHealthColor(liveMetrics.system_health),
                )}
              </HStack>
            </VStack>
          )}

          {liveMetricsError && !liveMetrics ? (
            <Box
              accessibilityRole="alert"
              className="rounded-2xl border border-phase-warning/30 bg-phase-warning/10 p-4"
            >
              <Text className="text-sm font-bold text-phaseText-primary">{liveMetricsError}</Text>
            </Box>
          ) : null}
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AnalyticsDashboardScreen;
