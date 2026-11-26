// packages/core/src/spatial/types.ts
// Multi-Scale Spatial Contracts for EdLove Foundation & Gurudevi Platform

export type CoordinatePrecisionTier = 'ground_truthed' | 'tentative_centroid' | 'approximate_zone';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SpatialBoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface SchoolMapPoint {
  id?: string;
  censusNo: string;
  name: string;
  nameSi?: string | null;
  nameTa?: string | null;
  lat: number;
  lng: number;
  category?: string;
  type?: string;
  district: string;
  province?: string;
  totalStudents: number;
  precision: CoordinatePrecisionTier;
  cariScore: number;
  ratioTheaterDelta: number;
  attunementProbability?: number;
  hasMiddayMeal: boolean;
  zone?: string;
  division?: string;
  groundTruthedAt?: string;
  groundTruthedBy?: string;
}

export interface DistrictSpatialSummary {
  id: string; // e.g. 'D_11'
  code: string; // e.g. 'CO'
  name: string;
  nameSi: string;
  nameTa: string;
  provinceId: string;
  provinceName: string;
  centroid: LatLng;
  bounds: SpatialBoundingBox;
  totalSchools: number;
  totalStudents: number;
  avgOfficialStr: number;
  avgRoomDensity: number;
  avgRatioTheaterDelta: number;
  avgCariScore: number;
  shadowTuitionMonthlyPerChildLkr: number;
  middayMealCoveragePct: number;
  sdsCapitalSharePct: number;
}

export interface ProvinceSpatialSummary {
  id: string; // e.g. 'P_1'
  code: string; // e.g. 'WP'
  name: string;
  nameSi: string;
  nameTa: string;
  centroid: LatLng;
  totalSchools: number;
  totalStudents: number;
  avgRatioTheaterDelta: number;
  avgCariScore: number;
  districts: string[]; // district codes
}

export interface GlobalCountrySpatialSummary {
  isoCode: string; // e.g. 'LKA', 'FIN', 'SGP', 'KOR', 'DEU', 'USA'
  name: string;
  region: string;
  centroid: LatLng;
  publicEducationSpendPctGdp: number;
  shadowEducationPrevalencePct: number;
  pisaMathScore?: number;
  pisaReadingScore?: number;
  primarySchoolStr: number;
  keyEdTechModel: string;
  epistemicParadigm: string;
  notablePlatforms: string[];
  flagEmoji?: string;
}

export interface MapClusterNode {
  id: string;
  lat: number;
  lng: number;
  count: number;
  district?: string;
  points: SchoolMapPoint[];
}

export type AtlasMapScaleLens = 'global' | 'national' | 'zonal' | 'local';
