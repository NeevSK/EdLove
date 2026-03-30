import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useTheme } from '@repo/ui';
import { FadeInDown } from 'react-native-reanimated';
import { multiTenantAnalyticsAPI, type TenantMetrics, type LiveMetrics, type CustomReportConfig } from '@repo/analytics';

interface AnalyticsDashboardScreenProps {
  tenantId: string;
  tenantName: string;
  userRole: string;
  onReportPress: (report: any) => void;
  onMetricDrillDown: (metric: string, data: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardScreenProps> = ({
  tenantId,
  tenantName,
  userRole,
  onReportPress,
  onMetricDrillDown
}) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const isDesktop = screenWidth > 1024;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

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
      Alert.alert('Error', 'Failed to load analytics dashboard');
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
    // Define thresholds for each metric
    const thresholds = {
      attendance_rate: { good: 95, warning: 85 },
      grade_average: { good: 85, warning: 75 },
      parent_engagement: { good: 70, warning: 50 },
      operational_efficiency: { good: 85, warning: 70 },
      compliance_score: { good: 90, warning: 80 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return theme.text.secondary;

    if (value >= threshold.good) return theme.accent.action;
    if (value >= threshold.warning) return theme.accent.reward;
    return theme.accent.danger;
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return theme.accent.action;
      case 'warning': return theme.templeGold;
      case 'critical': return theme.accent.danger;
      default: return theme.text.secondary;
    }
  };

  const renderMetricCard = (key: string, value: number, title: string, icon: string) => (
    <TouchableOpacity>
      key={key}
      style={[
        styles.metricCard,>
        {
          backgroundColor: theme.glass.surface.bg,
          borderColor: theme.glass.surface.border,
          borderWidth: 1,
        }
      ]}
      onPress={() => onMetricDrillDown(key, { value, title })}
          <View style={styles.metricHeader}        <Text >
          style={[
            styles.metricIcon,>
            { 
              color: theme.accent.action,
              fontSize: isDesktop ? 24 : 20
            }
          ]}
                  {icon}
        </Text        <Text 
          style={[
            styles.metricTitle,
            { 
              color: theme.text.secondary,
              fontFamily: 'System',
              fontSize: isDesktop ? 12 : 10
            }
          ]}
                  {title}
        </Text      </View      
      <Text >
        style={[
          styles.metricValue,>
          { 
            color: getMetricColor(value, key),
            fontFamily: 'System',
            fontWeight: '700',
            fontSize: isDesktop ? 28 : 24
          }
        ]}
              {typeof value === 'number' ? value.toFixed(1) : (value || 0)}
        {key.includes('rate') || key.includes('engagement') || key.includes('efficiency') || key.includes('score') ? '%' : ''}
      </Text      >
      <Text >
        style={[
          styles.metricChange,>
          { 
            color: theme.text.muted,
            fontFamily: 'System',
            fontSize: isDesktop ? 11 : 9
          }
        ]}
              {getChangeIndicator(key)}
      </Text    </TouchableOpacity  );

  const getChangeIndicator = (metric: string) => {
    // Placeholder for trend indicators
    const trends = {
      attendance_rate: '\u2191 2.3%',
      grade_average: '\u2191 1.8%',
      parent_engagement: '\u2193 0.5%',
      operational_efficiency: '\u2191 3.2%',
      compliance_score: '\u2192 0.0%'
    };
    
    return trends[metric as keyof typeof trends] || '\u2192 0.0%';
  };

  const renderLiveMetricCard = (title: string, value: string | number, subtitle: string, color: string) => (
    <View>
      key={title}
      style={[
        styles.liveMetricCard,>
        {
          backgroundColor: theme.glass.surface.bg,
          borderColor: theme.glass.surface.border,
          borderWidth: 1,
        }
      ]}
          <Text >
        style={[
          styles.liveMetricTitle,>
          { 
            color: theme.text.secondary,
            fontFamily: 'System',
            fontSize: isDesktop ? 12 : 10
          }
        ]}
              {title}
      </Text      <Text 
        style={[
          styles.liveMetricValue,
          { 
            color,
            fontFamily: 'System',
            fontWeight: '700',
            fontSize: isDesktop ? 20 : 16
          }
        ]}
              {value}
      </Text      <Text 
        style={[
          styles.liveMetricSubtitle,
          { 
            color: theme.text.muted,
            fontFamily: 'System',
            fontSize: isDesktop ? 10 : 8
          }
        ]}
              {subtitle}
      </Text    </View  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeSelector}      {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
        <TouchableOpacity>
          key={range}
          style={[
            styles.timeRangeButton,>
            {
              backgroundColor: selectedTimeRange === range ? theme.accent.action : theme.glass.surface.bg,
              borderColor: selectedTimeRange === range ? theme.accent.action : theme.glass.surface.border,
              borderWidth: 1,
            }
          ]}
          onPress={() => setSelectedTimeRange(range)}
                  <Text >
            style={[
              styles.timeRangeText,>
              { 
                color: selectedTimeRange === range ? theme.text.inverse : theme.text.primary,
                fontFamily: 'System',
                fontWeight: '500',
                fontSize: isDesktop ? 14 : 12
              }
            ]}
                      {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text        </TouchableOpacity      ))}
    </View  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}        <Text style={[styles.loadingText, { color: theme.text.secondary }]}          Loading analytics dashboard...>
        </Text      </View    );>
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}      {/* Header */}>
      <View style={[styles.header, { borderBottomColor: theme.glass.surface.border }]}        <View style={styles.headerLeft}          <Text >
            style={[
              styles.title,>
              { 
                color: theme.text.primary,
                fontFamily: 'System',
                fontWeight: '700',
                fontSize: isDesktop ? 32 : 24
              }
            ]}
                      Analytics Dashboard
          </Text          ><Text 
            style={[
              styles.subtitle,
              { 
                color: theme.text.secondary,
                fontFamily: 'System',
                fontSize: isDesktop ? 16 : 14
              }
            ]}
                      {tenantName}
          </Text        </View        
        {renderTimeRangeSelector()}
      </View>
      <ScrollView >
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.contentContainerDesktop>
        ]}
        showsVerticalScrollIndicator={false}
              {/* Key Metrics */}
        <View style={styles.section}          <Text >
            style={[
              styles.sectionHeader,>
              { 
                color: theme.text.primary,
                fontFamily: 'System',
                fontWeight: '700',
                fontSize: isDesktop ? 20 : 16
              }
            ]}
                      Key Performance Metrics
          </Text          >
          <View style={[>
            styles.metricsGrid,
            isDesktop && styles.metricsGridDesktop>
          ]}            {metrics && Object.entries(metrics.metrics).map(([key, value]) => {
              const metricTitles = {
                attendance_rate: 'Attendance Rate',
                grade_average: 'Grade Average',
                enrollment_count: 'Total Enrollment',
                staff_turnover: 'Staff Turnover',
                resource_utilization: 'Resource Utilization',
                parent_engagement: 'Parent Engagement',
                document_processing_time: 'Doc Processing Time',
                revenue_per_student: 'Revenue per Student',
                operational_efficiency: 'Operational Efficiency',
                compliance_score: 'Compliance Score'
              };
              
              const metricIcons = {
                attendance_rate: '\uD83D\uDCCA',
                grade_average: '\uD83C\uDFAF',
                enrollment_count: '\uD83D\uDC65',
                staff_turnover: '\uD83D\uDD04',
                resource_utilization: '\uD83D\uDCE6',
                parent_engagement: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66',
                document_processing_time: '\uD83D\uDCC4',
                revenue_per_student: '\uD83D\uDCB0',
                operational_efficiency: '\u26A1',
                compliance_score: '\u2705'
              };
              
              return renderMetricCard(
                key, 
                value, 
                metricTitles[key as keyof typeof metricTitles] || key,
                metricIcons[key as keyof typeof metricIcons] || '\uD83D\uDCCA'
              );
            })}
          </View        </View
        {/* Live System Metrics */}
        {liveMetrics && (
          <View style={styles.section}            <Text >
              style={[
                styles.sectionHeader,>
                { 
                  color: theme.text.primary,
                  fontFamily: 'System',
                  fontWeight: '700',
                  fontSize: isDesktop ? 20 : 16
                }
              ]}
                          Live System Metrics
            </Text            >
            <View style={[>
              styles.liveMetricsGrid,
              isDesktop && styles.liveMetricsGridDesktop>
            ]}              {renderLiveMetricCard(
                'Active Users',
                liveMetrics.active_users,
                'Currently online',
                theme.sageGreen
              )}
              {renderLiveMetricCard(
                'API Requests/min',
                liveMetrics.api_requests_per_minute,
                'Last 60 seconds',
                getSystemHealthColor(liveMetrics.system_health)
              )}
              {renderLiveMetricCard(
                'Error Rate',
                `${liveMetrics.error_rate.toFixed(1)}%`,
                'Last 60 seconds',
                liveMetrics.error_rate > 5 ? theme.accent.danger : theme.sageGreen
              )}
              {renderLiveMetricCard(
                'System Health',
                liveMetrics.system_health.toUpperCase(),
                `Updated ${new Date(liveMetrics.timestamp).toLocaleTimeString()}`,
                getSystemHealthColor(liveMetrics.system_health)
              )}
            </View          ></View        )}

        {/* Resource Usage */}
        {liveMetrics && (
          <View style={styles.section}            <Text >
              style={[
                styles.sectionHeader,>
                { 
                  color: theme.text.primary,
                  fontFamily: 'System',
                  fontWeight: '700',
                  fontSize: isDesktop ? 20 : 16
                }
              ]}
                          Resource Usage
            </Text            >
            <View style={styles.resourceUsageContainer}              <View style={styles.resourceItem}                <Text >
                  style={[
                    styles.resourceLabel,>
                    { 
                      color: theme.text.secondary,
                      fontFamily: 'System',
                      fontSize: isDesktop ? 12 : 10
                    }
                  ]}
                                  CPU Usage
                </Text                ><View style={styles.resourceBar}                  <View 
                    style={[
                      styles.resourceFill,
                      { 
                        width: `${liveMetrics.resource_usage.cpu}%`,
                        backgroundColor: liveMetrics.resource_usage.cpu > 80 ? theme.accent.danger : theme.sageGreen
                      }
                    ]}
                  /                ></View                <Text 
                  style={[
                    styles.resourceValue,
                    { 
                      color: theme.text.primary,
                      fontFamily: 'System',
                      fontWeight: '600',
                      fontSize: isDesktop ? 14 : 12
                    }
                  ]}
                                  {liveMetrics.resource_usage.cpu.toFixed(1)}%
                </Text              </View              
              <View style={styles.resourceItem}                <Text >
                  style={[
                    styles.resourceLabel,>
                    { 
                      color: theme.text.secondary,
                      fontFamily: 'System',
                      fontSize: isDesktop ? 12 : 10
                    }
                  ]}
                                  Memory Usage
                </Text                <View style={styles.resourceBar}                  <View 
                    style={[
                      styles.resourceFill,
                      { 
                        width: `${liveMetrics.resource_usage.memory}%`,
                        backgroundColor: liveMetrics.resource_usage.memory > 85 ? theme.accent.danger : theme.sageGreen
                      }
                    ]}
                  /                ></View                <Text 
                  style={[
                    styles.resourceValue,
                    { 
                      color: theme.text.primary,
                      fontFamily: 'System',
                      fontWeight: '600',
                      fontSize: isDesktop ? 14 : 12
                    }
                  ]}
                                  {liveMetrics.resource_usage.memory.toFixed(1)}%
                </Text              </View              
              <View style={styles.resourceItem}                <Text >
                  style={[
                    styles.resourceLabel,>
                    { 
                      color: theme.text.secondary,
                      fontFamily: 'System',
                      fontSize: isDesktop ? 12 : 10
                    }
                  ]}
                                  Storage Usage
                </Text                <View style={styles.resourceBar}                  <View 
                    style={[
                      styles.resourceFill,
                      { 
                        width: `${liveMetrics.resource_usage.storage}%`,
                        backgroundColor: liveMetrics.resource_usage.storage > 90 ? theme.accent.danger : theme.accent.action
                      }
                    ]}
                  /                </View                <Text 
                  style={[
                    styles.resourceValue,
                    { 
                      color: theme.text.primary,
                      fontFamily: 'System',
                      fontWeight: '600',
                      fontSize: isDesktop ? 14 : 12
                    }
                  ]}
                                  {(liveMetrics.resource_usage.storage || 0).toFixed(1)}%
                </Text              </View            </View          </View        )}
      </ScrollView    </View  );
};

// Mobile-first responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeRangeText: {
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerDesktop: {
    padding: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  
  // Metrics Grid
  metricsGrid: {
    gap: 16,
  },
  metricsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    marginBottom: 4,
  },
  metricTitle: {
    textAlign: 'center',
  },
  metricValue: {
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 10,
  },
  
  // Live Metrics
  liveMetricsGrid: {
    gap: 16,
  },
  liveMetricsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  liveMetricCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  liveMetricTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  liveMetricValue: {
    marginBottom: 4,
  },
  liveMetricSubtitle: {
    textAlign: 'center',
  },
  
  // Resource Usage
  resourceUsageContainer: {
    gap: 16,
  },
  resourceItem: {
    marginBottom: 16,
  },
  resourceLabel: {
    marginBottom: 8,
  },
  resourceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  resourceFill: {
    height: '100%',
    borderRadius: 4,
  },
  resourceValue: {
    textAlign: 'right',
  },
  
  // Loading and Error States
  loadingText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
});

export default AnalyticsDashboardScreen;
