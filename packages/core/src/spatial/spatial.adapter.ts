// packages/core/src/spatial/spatialService.ts
// Dynamic Supabase Spatial Service for Sri Lanka Education Atlas & School Gate Ground Truth
// Replaces static hardcoding with live PostgreSQL / PostGIS database queries.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoordinatePrecisionTier, SchoolMapPoint } from './types';

export interface FetchSpatialSchoolsOptions {
  districtId?: string | null;
  search?: string | null;
  limit?: number;
}

export interface GatePingResult {
  success: boolean;
  censusNo: string;
  deltaMeters: number;
  newPrecision: CoordinatePrecisionTier;
}

/**
 * Dynamically queries schools with active PostGIS coordinates, C-ARI indices,
 * and Ratio Theater deltas directly from Supabase.
 */
export async function fetchSpatialSchoolsFromSupabase(
  supabase: SupabaseClient,
  options: FetchSpatialSchoolsOptions = {},
): Promise<SchoolMapPoint[]> {
  const { districtId, search, limit = 100 } = options;

  try {
    const { data, error } = await supabase.rpc('get_spatial_schools', {
      p_district_id: districtId || null,
      p_search: search?.trim() ? search.trim() : null,
      p_limit: limit,
    });

    if (error) {
      console.warn('[spatialService] RPC get_spatial_schools error:', error.message);
      return [];
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      censusNo: row.census_no,
      name: row.name,
      lat: Number(row.latitude),
      lng: Number(row.longitude),
      type: row.type || 'Provincial',
      category: row.category || 'School',
      district: row.district_id,
      province: row.province_id,
      totalStudents: Number(row.total_students || 0),
      precision: (row.coord_precision || 'tentative_postal_centroid') as CoordinatePrecisionTier,
      cariScore: Number(row.cari_score || 50),
      ratioTheaterDelta: Number(row.theater_delta || 10),
      hasMiddayMeal: Boolean(row.has_midday_meal),
    }));
  } catch (err) {
    console.warn('[spatialService] Unexpected error querying Supabase schools:', err);
    return [];
  }
}

/**
 * Pings high-accuracy device GPS coordinates to verify a physical school gate in Supabase.
 */
export async function recordSchoolGatePingInSupabase(
  supabase: SupabaseClient,
  params: {
    censusNo: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    userRole?: string;
  },
): Promise<GatePingResult | null> {
  const {
    censusNo,
    latitude,
    longitude,
    accuracyMeters = 5.0,
    userRole = 'field_surveyor',
  } = params;

  try {
    const { data, error } = await supabase.rpc('record_school_gate_ping', {
      p_census_no: censusNo,
      p_latitude: latitude,
      p_longitude: longitude,
      p_accuracy_meters: accuracyMeters,
      p_user_role: userRole,
    });

    if (error) {
      console.error('[spatialService] RPC record_school_gate_ping error:', error.message);
      return null;
    }

    return {
      success: Boolean(data?.success),
      censusNo: data?.census_no || censusNo,
      deltaMeters: Number(data?.delta_meters || 0),
      newPrecision: (data?.new_precision || 'ground_truthed') as CoordinatePrecisionTier,
    };
  } catch (err) {
    console.error('[spatialService] Failed to record school gate ping:', err);
    return null;
  }
}
