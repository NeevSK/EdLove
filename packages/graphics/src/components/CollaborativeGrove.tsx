import { Theme } from '@repo/ui/theme';

import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SanctuaryCanvas } from '@repo/graphics/components/SanctuaryCanvas';

// Define types locally to avoid analytics dependency
interface TenantMetrics {
  engagement: number;
  growth: number;
}

// Mock API function to avoid analytics dependency
const mockTenantMetricsAPI = {
  aggregateTenantMetrics: async (tenantIds: string[], _range: string): Promise<TenantMetrics[]> => {
    // Return mock data instead of calling analytics API
    return tenantIds.map(() => ({
      engagement: 0.5 + Math.random() * 0.5,
      growth: 0.5 + Math.random() * 0.5,
    }));
  },
};

export const CollaborativeGrove: React.FC<{ tenantIds: string[] }> = ({ tenantIds }) => {
  const { data: metrics } = useQuery({
    queryKey: ['tenant-metrics', tenantIds],
    queryFn: () => mockTenantMetricsAPI.aggregateTenantMetrics(tenantIds, 'last_24h'),
  });

  return (
    <SanctuaryCanvas style={styles.container}>
      <View style={styles.groveContainer}>
        {tenantIds.map((id, index) => {
          const m = metrics?.[index] || { engagement: 0.5, growth: 0.5 };
          return (
            <View key={id} style={styles.treeContainer}>
              {/* Simple geometric tree that grows based on data */}
              <View
                style={[
                  styles.canopy,
                  {
                    height: 40 + (m.engagement || 0) * 60,
                    width: 40 + (m.engagement || 0) * 40,
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    opacity: 0.6 + (m.growth || 0) * 0.4,
                  },
                ]}
              />
              <View style={styles.trunk} />
            </View>
          );
        })}
      </View>
      <Text style={styles.label}>Collaborative Knowledge Grove</Text>
    </SanctuaryCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  groveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  canopy: {
    borderRadius: 50,
    marginBottom: -5,
  },
  trunk: {
    width: 8,
    height: 20,
    backgroundColor: '#5D4037',
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
