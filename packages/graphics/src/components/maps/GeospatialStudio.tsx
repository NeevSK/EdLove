import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GeographicPerspective } from './maps/GeographicPerspective';
import { useGeoData } from '../../hooks/useGeoData';

interface GeospatialStudioProps {
  datasetId: string;
}

/**
 * A demonstration component that connects the dynamic Supabase GIS data
 * to the GeographicPerspective visualization engine.
 */
export const GeospatialStudio: React.FC<GeospatialStudioProps> = ({ datasetId }) => {
  const { data, loading, error } = useGeoData(datasetId);

  if (loading) return <ActivityIndicator size="large" color="#F5A623" />;
  if (error) return <Text style={{ color: 'red' }}>Error: {error}</Text>;

  // Transform geo_features into the format expected by GeoThematicEngine/GeographicPerspective
  // If the data is point-based, we can map properties. If it's linked to admin_id, we can do choropleths.
  const districtData: Record<string, number> = {};
  data.forEach(feature => {
    if (feature.admin_id) {
      districtData[feature.admin_id] = feature.properties.viability_score || 0;
    }
  });

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        Thematic Insights Studio
      </Text>
      
      <GeographicPerspective 
        dataset={districtData}
        palette="socioeconomic"
        title="School Viability Analysis"
        legendLabel="Score (0-1)"
      />

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Dataset Features:</Text>
        {data.map(f => (
          <Text key={f.id} style={{ fontSize: 12 }}>
            • {f.properties.school_name}: {f.properties.viability_score}
          </Text>
        ))}
      </View>
    </View>
  );
}
