import React, { useState, useEffect } from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    ScrollView, 
    Pressable, 
    ScreenWrapper,
    GlobalHeader
} from '@repo/ui';
import { multiTenantAnalyticsAPI, type TenantMetrics, type LiveMetrics } from '@repo/analytics';

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
  onMetricDrillDown
}) => {
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadLiveMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [tenantId, selectedTimeRange]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const timeRange = getTimeRange(selectedTimeRange);
      const tenantMetrics = await multiTenantAnalyticsAPI.aggregateTenantMetrics([tenantId], timeRange);
      setMetrics(tenantMetrics[0] || null);
    } catch (error) {
      console.error('Failed to load analytics dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveMetrics = async () => {
    try {
      const live = await multiTenantAnalyticsAPI.getLiveMetrics(tenantId);
      setLiveMetrics(live);
    } catch (error) {
      console.error('Failed to load live metrics:', error);
    }
  };

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
      endDate: now.toISOString()
    };
  };

  const getMetricColor = (value: number, metric: string) => {
    const thresholds = {
      attendance_rate: { good: 95, warning: 85 },
      grade_average: { good: 85, warning: 75 },
      parent_engagement: { good: 70, warning: 50 },
      operational_efficiency: { good: 85, warning: 70 },
      compliance_score: { good: 90, warning: 80 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-phaseText-secondary';

    if (value >= threshold.good) return 'text-phase-interactive';
    if (value >= threshold.warning) return 'text-phase-warning';
    return 'text-phase-danger';
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-phase-interactive';
      case 'warning': return 'text-phase-warning';
      case 'critical': return 'text-phase-danger';
      default: return 'text-phaseText-secondary';
    }
  };

  const getChangeIndicator = (metric: string) => {
    const trends: Record<string, string> = {
      attendance_rate: '↑ 2.3%',
      grade_average: '↑ 1.8%',
      parent_engagement: '↓ 0.5%',
      operational_efficiency: '↑ 3.2%',
      compliance_score: '→ 0.0%'
    };
    
    return trends[metric] || '→ 0.0%';
  };

  const formatValue = (value: number, key: string) => {
    const formatted = typeof value === 'number' ? value.toFixed(1) : (value || 0);
    const suffix = key.includes('rate') || key.includes('engagement') || key.includes('efficiency') || key.includes('score') ? '%' : '';
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

  const renderLiveMetricCard = (title: string, value: string | number, subtitle: string, colorClass: string) => (
    <Box
      key={title}
      className="bg-phase-surface p-4 rounded-3xl border border-phase-border flex-1 min-w-[140px] mb-3 items-center"
    >
      <Text className="text-[10px] font-black uppercase tracking-wider text-phaseText-muted mb-2">
        {title}
      </Text>
      <Text className={`text-xl font-black ${colorClass}`}>
        {value}
      </Text>
      <Text className="text-[10px] font-bold text-phaseText-muted/50 mt-1">
        {subtitle}
      </Text>
    </Box>
  );

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-10 bg-phase-canvas">
          <Text className="text-phaseText-muted font-bold italic">Loading analytics dashboard...</Text>
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
                <HStack className="flex-wrap justify-between">
                    {metrics && Object.entries(metrics.metrics).map(([key, value]) => {
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
                        compliance_score: 'Compliance'
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
                        compliance_score: '✅'
                    };
                    
                    return renderMetricCard(
                        key, 
                        value as number, 
                        metricTitles[key] || key,
                        metricIcons[key] || '📊'
                    );
                    })}
                </HStack>
            </VStack>

            {liveMetrics && (
            <VStack className="gap-4">
                <Heading className="text-base font-black text-phaseText-primary uppercase tracking-widest opacity-40">
                    Live System Health
                </Heading>
                <HStack className="flex-wrap gap-4">
                    {renderLiveMetricCard('Active Users', liveMetrics.active_users, 'Currently online', 'text-phase-interactive')}
                    {renderLiveMetricCard('API Reqs/m', liveMetrics.api_requests_per_minute, 'Last 60s', getSystemHealthColor(liveMetrics.system_health))}
                    {renderLiveMetricCard('Error Rate', `${liveMetrics.error_rate.toFixed(1)}%`, 'Last 60s', liveMetrics.error_rate > 5 ? 'text-phase-danger' : 'text-phase-interactive')}
                    {renderLiveMetricCard('Health', liveMetrics.system_health.toUpperCase(), `Updated ${new Date(liveMetrics.timestamp).toLocaleTimeString()}`, getSystemHealthColor(liveMetrics.system_health))}
                </HStack>
            </VStack>
            )}
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AnalyticsDashboardScreen;

