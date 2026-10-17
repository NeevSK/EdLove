// packages/core/src/spatial/__tests__/geoMath.test.ts
import { describe, expect, it } from 'vitest';
import { SRI_LANKA_DISTRICTS, SRI_LANKA_NATIONAL_BOUNDS } from '../districtCentroids';
import {
  clusterSchoolPoints,
  computeCentroid,
  findNearestSchools,
  haversineDistanceKm,
  haversineDistanceMeters,
  isPointInBounds,
} from '../geoMath';
import type { SchoolMapPoint } from '../types';

describe('Spatial GeoMath Engine', () => {
  it('accurately computes Haversine distances for Sri Lankan benchmarks', () => {
    // Colombo to Kandy (~95-116 km depending on exact points)
    const colombo = { lat: 6.9271, lng: 79.8612 };
    const kandy = { lat: 7.2906, lng: 80.6337 };
    const dist = haversineDistanceKm(colombo.lat, colombo.lng, kandy.lat, kandy.lng);
    expect(dist).toBeGreaterThan(90);
    expect(dist).toBeLessThan(125);

    // Meters conversion
    const meters = haversineDistanceMeters(colombo.lat, colombo.lng, kandy.lat, kandy.lng);
    expect(meters).toBe(Math.round(dist * 1000));

    // Zero distance
    expect(haversineDistanceKm(colombo.lat, colombo.lng, colombo.lat, colombo.lng)).toBe(0);
  });

  it('correctly verifies if coordinates lie within national bounds', () => {
    const colombo = { lat: 6.9271, lng: 79.8612 };
    expect(isPointInBounds(colombo, SRI_LANKA_NATIONAL_BOUNDS)).toBe(true);

    const london = { lat: 51.5074, lng: -0.1278 };
    expect(isPointInBounds(london, SRI_LANKA_NATIONAL_BOUNDS)).toBe(false);
  });

  it('computes accurate centroids for point sets', () => {
    const points = [
      { lat: 6.0, lng: 80.0 },
      { lat: 8.0, lng: 80.0 },
      { lat: 10.0, lng: 80.0 },
    ];
    const centroid = computeCentroid(points);
    expect(centroid.lat).toBe(8.0);
    expect(centroid.lng).toBe(80.0);
  });

  it('clusters school points into spatial grid nodes', () => {
    const mockPoints: SchoolMapPoint[] = [
      {
        censusNo: '01001',
        name: 'Royal College',
        lat: 6.9056,
        lng: 79.8617,
        category: 'National',
        type: '1AB',
        district: 'Colombo',
        province: 'Western',
        totalStudents: 8000,
        precision: 'ground_truthed',
        cariScore: 55.0,
        ratioTheaterDelta: 28.0,
        attunementProbability: 2.1,
        hasMiddayMeal: false,
      },
      {
        censusNo: '01002',
        name: 'Dharmapala Vidyalaya',
        lat: 6.8456,
        lng: 79.9217,
        category: 'National',
        type: '1AB',
        district: 'Colombo',
        province: 'Western',
        totalStudents: 4890,
        precision: 'ground_truthed',
        cariScore: 55.9,
        ratioTheaterDelta: 31.2,
        attunementProbability: 2.1,
        hasMiddayMeal: false,
      },
      {
        censusNo: '18042',
        name: 'Warleigh T.V',
        lat: 6.9123,
        lng: 80.6123,
        category: 'Type 3',
        type: 'Provincial',
        district: 'Nuwara Eliya',
        province: 'Central',
        totalStudents: 29,
        precision: 'tentative_centroid',
        cariScore: 86.1,
        ratioTheaterDelta: 0.0,
        attunementProbability: 7.1,
        hasMiddayMeal: true,
      },
    ];

    const clusters = clusterSchoolPoints(mockPoints, 0.5);
    expect(clusters.length).toBeGreaterThanOrEqual(1);
    const totalCount = clusters.reduce((acc, c) => acc + c.count, 0);
    expect(totalCount).toBe(3);
  });

  it('ranks nearest schools based on user coordinates', () => {
    const colomboUser = { lat: 6.93, lng: 79.85 };
    const mockPoints: SchoolMapPoint[] = [
      {
        censusNo: '01001',
        name: 'Royal College (Close)',
        lat: 6.9056,
        lng: 79.8617,
        category: 'National',
        type: '1AB',
        district: 'Colombo',
        province: 'Western',
        totalStudents: 8000,
        precision: 'ground_truthed',
        cariScore: 55.0,
        ratioTheaterDelta: 28.0,
        attunementProbability: 2.1,
        hasMiddayMeal: false,
      },
      {
        censusNo: '18042',
        name: 'Warleigh T.V (Far)',
        lat: 6.9123,
        lng: 80.6123,
        category: 'Type 3',
        type: 'Provincial',
        district: 'Nuwara Eliya',
        province: 'Central',
        totalStudents: 29,
        precision: 'tentative_centroid',
        cariScore: 86.1,
        ratioTheaterDelta: 0.0,
        attunementProbability: 7.1,
        hasMiddayMeal: true,
      },
    ];

    const nearest = findNearestSchools(colomboUser.lat, colomboUser.lng, mockPoints, 5);
    expect(nearest[0]?.censusNo).toBe('01001');
    expect(nearest[0]?.distanceKm).toBeLessThan(nearest[1]?.distanceKm ?? 999);
  });

  it('validates all 25 Sri Lankan district centroids lie within national bounds', () => {
    expect(SRI_LANKA_DISTRICTS.length).toBe(25);
    for (const d of SRI_LANKA_DISTRICTS) {
      expect(isPointInBounds(d.centroid, SRI_LANKA_NATIONAL_BOUNDS)).toBe(true);
      expect(d.totalSchools).toBeGreaterThan(0);
      expect(d.totalStudents).toBeGreaterThan(0);
    }
  });
});
