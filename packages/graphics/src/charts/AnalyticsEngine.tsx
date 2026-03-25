import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';
import { marksToGPA } from '@repo/analytics';

interface AnalyticsEngineProps {
  data: any[];
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
  showRealTime?: boolean;
}

export function AnalyticsEngine({
  data,
  title,
  showFilters = true,
  showExport = true,
  showRealTime = false
}: AnalyticsEngineProps) {
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    if (!data || data.length === 0) return {
      totalItems: 0,
      averageValue: 0,
      trendDirection: 'stable' as 'up' | 'down' | 'stable',
      topPerformers: [],
      distribution: {},
      insights: []
    };

    const numericData = data.filter(item => typeof item.value === 'number');
    const totalItems = numericData.length;
    const averageValue = numericData.reduce((sum, item) => sum + item.value, 0) / totalItems;
    
    // Calculate trend
    const sortedData = [...numericData].sort((a, b) => b.value - a.value);
    const midPoint = Math.floor(sortedData.length / 2);
    const trendDirection = sortedData.length > 1 ? 
      (sortedData[midPoint].value > sortedData[midPoint - 1].value ? 'up' : 'down') : 'stable';

    // Get top performers
    const topPerformers = sortedData.slice(0, 5).map(item => ({
      id: item.id,
      name: item.name,
      value: item.value
    }));

    // Calculate distribution
    const distribution = numericData.reduce((acc, item) => {
      const grade = marksToGPA(item.value).grade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    // Generate insights
    const insights = [
      `Total of ${totalItems} items analyzed`,
      `Average value: ${averageValue.toFixed(2)}`,
      `Trend: ${trendDirection}`,
      `Top performer: ${topPerformers[0]?.name || 'N/A'}`,
      `Distribution: ${Object.keys(distribution).length} categories`
    ];

    return {
      totalItems,
      averageValue,
      trendDirection,
      topPerformers,
      distribution,
      insights
    };
  }, [data]);

  const handleExport = useCallback(() => {
    const exportData = {
      title: title || 'Analytics Report',
      date: new Date().toISOString(),
      metrics: analytics,
      data: data
    };
    
    // In real app, this would save to file or share
    console.log('Exporting analytics:', exportData);
  }, [analytics, title]);

  const filteredData = useMemo(() => {
    if (selectedMetric === 'all') return data;
    return data.filter(item => {
      const grade = marksToGPA(item.value).grade;
      return selectedMetric === grade;
    });
  }, [data, selectedMetric]);

  return (
    <Card style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      {/* Filters */}
      {showFilters && (
        <View style={styles.filters}>
          <HStack space="md">
            <VStack flex={1}>
              <Text style={styles.filterLabel}>Metric</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="sm">
                  {['all', 'A', 'B', 'C', 'S', 'F'].map(grade => (
                    <Text
                      key={grade}
                      style={[
                        styles.filterOption,
                        selectedMetric === grade && styles.selectedFilter
                      ]}
                      onPress={() => setSelectedMetric(grade)}
                    >
                      {grade === 'all' ? 'All' : grade}
                    </Text>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
            
            <VStack flex={1}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="sm">
                  {['week', 'month', 'quarter', 'year'].map(range => (
                    <Text
                      key={range}
                      style={[
                        styles.filterOption,
                        dateRange === range && styles.selectedFilter
                      ]}
                      onPress={() => setDateRange(range)}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
          </HStack>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel}>Search</Text>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search analytics..."
        />
      </View>

      {/* Analytics Summary */}
      <View style={styles.summary}>
        <VStack space="md">
          <HStack style={styles.summaryRow}>
            <VStack flex={1} alignItems="center">
              <Text style={styles.summaryValue}>{analytics.totalItems}</Text>
              <Text style={styles.summaryLabel}>Total Items</Text>
            </VStack>
            
            <VStack flex={1} alignItems="center">
              <Text style={styles.summaryValue}>{analytics.averageValue.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Average</Text>
            </VStack>
            
            <VStack flex={1} alignItems="center">
              <Text style={[
                styles.summaryValue,
                { color: analytics.trendDirection === 'up' ? Theme.colors.success : 
                         analytics.trendDirection === 'down' ? Theme.colors.error : Theme.colors.warning }
              ]}>
                {analytics.trendDirection === 'up' ? '↑' : 
                 analytics.trendDirection === 'down' ? '↓' : '→'}
              </Text>
              <Text style={styles.summaryLabel}>Trend</Text>
            </VStack>
          </HStack>
        </VStack>
      </View>

      {/* Export Button */}
      {showExport && (
        <View style={styles.exportContainer}>
          <Text style={styles.exportButton} onPress={handleExport}>
            📤 Export Report
          </Text>
        </View>
      )}

      {/* Data Visualization */}
      <ScrollView style={styles.dataContainer}>
        <VStack space="md">
          {filteredData.map((item, index) => (
            <View key={item.id} style={styles.dataItem}>
              <HStack justifyContent="space-between">
                <VStack flex={1}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemValue}>{item.value}</Text>
                </VStack>
                <Text style={styles.itemGrade}>
                  {marksToGPA(item.value).grade} ({item.value}%)
                </Text>
              </HStack>
            </View>
          ))}
        </VStack>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  filters: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.corners.comfortable,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  filterOption: {
    fontSize: 14,
    color: Theme.colors.text,
    padding: Theme.spacing.sm,
    borderRadius: Theme.corners.tight,
    marginRight: Theme.spacing.xs,
  },
  selectedFilter: {
    backgroundColor: Theme.colors.gurudeviBlue,
    color: Theme.colors.background,
  },
  searchContainer: {
    marginBottom: Theme.spacing.md,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.corners.comfortable,
    padding: Theme.spacing.sm,
    fontSize: 14,
    color: Theme.colors.text,
  },
  summary: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.corners.comfortable,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  dataContainer: {
    flex: 1,
  },
  dataItem: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.gurudeviBlue,
  },
  itemGrade: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  exportContainer: {
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  exportButton: {
    backgroundColor: Theme.colors.gurudeviBlue,
    color: Theme.colors.background,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.corners.comfortable,
    fontSize: 16,
    fontWeight: '600',
  },
});
