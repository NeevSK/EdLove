import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type ColorPalette, GeoThematicEngine } from '@repo/graphics/algorithms/GeoThematicEngine';
import { SriLankaMap } from '@repo/graphics/components/maps/SriLankaMap';

interface GeographicPerspectiveProps {
  title: string;
  description?: string;
  data: Record<string, number>; // Mapping of District ID to numerical value
  palette?: ColorPalette;
  onDistrictSelect?: (id: string) => void;
}

/**
 * GeographicPerspective: A reusable high-level component for custom map creation.
 * Any package can "create a map" by providing a data record and a palette.
 */
export function GeographicPerspective({
  title,
  description,
  data,
  palette = 'saffron',
  onDistrictSelect,
}: GeographicPerspectiveProps) {
  const districtColors = useMemo(
    () => GeoThematicEngine.generateChoropleth(data, palette),
    [data, palette],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <SriLankaMap
        districtColors={districtColors}
        onDistrictSelect={onDistrictSelect}
        width={350}
        height={550}
      />
      <View style={styles.legend}>
        <Text style={styles.legendText}>Low</Text>
        <View
          style={[
            styles.legendBar,
            {
              backgroundColor:
                Object.keys(districtColors).length > 0
                  ? districtColors[Object.keys(districtColors)[0] as string]
                  : '#eee',
            },
          ]}
        />
        <Text style={styles.legendText}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendBar: {
    height: 8,
    width: 100,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
