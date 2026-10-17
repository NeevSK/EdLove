// packages/core/src/spatial/geoMath.ts
// Pure, zero-dependency spatial mathematics and clustering

import type { LatLng, MapClusterNode, SchoolMapPoint, SpatialBoundingBox } from './types';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Calculates Great-Circle distance in meters.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return Math.round(haversineDistanceKm(lat1, lon1, lat2, lon2) * 1000);
}

/**
 * Verifies if coordinate is within a bounding box.
 */
export function isPointInBounds(point: LatLng, bounds: SpatialBoundingBox): boolean {
  return (
    point.lat >= bounds.minLat &&
    point.lat <= bounds.maxLat &&
    point.lng >= bounds.minLng &&
    point.lng <= bounds.maxLng
  );
}

/**
 * Calculates centroid of a set of coordinates.
 */
export function computeCentroid(points: LatLng[]): LatLng {
  if (points.length === 0) return { lat: 7.8731, lng: 80.7718 }; // Default: Sri Lanka center
  let sumLat = 0;
  let sumLng = 0;
  for (const p of points) {
    sumLat += p.lat;
    sumLng += p.lng;
  }
  return {
    lat: Number((sumLat / points.length).toFixed(6)),
    lng: Number((sumLng / points.length).toFixed(6)),
  };
}

/**
 * Fast spatial grid clustering for viewport rendering without WebGL or native overhead.
 */
export function clusterSchoolPoints(
  points: SchoolMapPoint[],
  gridStepDegrees = 0.2,
): MapClusterNode[] {
  const grid = new Map<string, SchoolMapPoint[]>();

  for (const p of points) {
    const gridX = Math.floor(p.lng / gridStepDegrees);
    const gridY = Math.floor(p.lat / gridStepDegrees);
    const key = `${gridY}:${gridX}`;

    const existing = grid.get(key);
    if (existing) {
      existing.push(p);
    } else {
      grid.set(key, [p]);
    }
  }

  const clusters: MapClusterNode[] = [];
  let clusterIdx = 0;

  for (const [key, clusterPoints] of grid.entries()) {
    clusterIdx += 1;
    const centroid = computeCentroid(clusterPoints);
    clusters.push({
      id: `cluster-${key}-${clusterIdx}`,
      lat: centroid.lat,
      lng: centroid.lng,
      count: clusterPoints.length,
      district: clusterPoints[0]?.district,
      points: clusterPoints,
    });
  }

  return clusters;
}

/**
 * Finds the nearest schools to a user's location, sorted by distance.
 * Supports both (userLat, userLng, points, limit) and (points, userLat, userLng, limit) signatures.
 */
export function findNearestSchools(
  a: number | SchoolMapPoint[],
  b: number,
  c: SchoolMapPoint[] | number,
  d = 10,
): Array<SchoolMapPoint & { distanceKm: number }> {
  let userLat: number;
  let userLng: number;
  let points: SchoolMapPoint[];
  const limit: number = d;

  if (Array.isArray(a)) {
    points = a;
    userLat = b;
    userLng = typeof c === 'number' ? c : 0;
  } else {
    userLat = a;
    userLng = b;
    points = Array.isArray(c) ? c : [];
  }

  return points
    .map((p) => ({
      ...p,
      distanceKm: haversineDistanceKm(userLat, userLng, p.lat, p.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
