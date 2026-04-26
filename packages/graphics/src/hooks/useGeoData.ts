import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// This would typically come from an environment config
const SUPABASE_URL = 'https://qzoawolfkuwiuyaoiybz.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Placeholder

export interface GeoFeature {
  id: string;
  dataset_id: string;
  geom: any; // GeoJSON geometry from PostGIS
  properties: Record<string, any>;
  admin_id?: string;
}

export interface GeoDataset {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * A hook to fetch GIS data directly from the dynamic Supabase GIS infrastructure.
 * This enables the "Map for Everyone" capability by allowing any dataset to be loaded.
 */
export function useGeoData(datasetId: string) {
  const [data, setData] = useState<GeoFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGeoData() {
      try {
        setLoading(true);
        // Using common supabase client pattern
        // Note: In actual implementation, we use the shared supabase client from the app
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/geo_features?dataset_id=eq.${datasetId}&select=*,geom:geom.geojson()`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          },
        );

        if (!response.ok) throw new Error('Failed to fetch GIS data');

        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (datasetId) fetchGeoData();
  }, [datasetId]);

  return { data, loading, error };
}
