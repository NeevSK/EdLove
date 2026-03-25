import dataRaw from './data/lk-edu-data.json' assert { type: 'json' };
import { LKEduData, School, Province, District, PostalUnit, Zone, Division, DSDivision, GNDivision } from './types.js';

const data = dataRaw as unknown as LKEduData;

/**
 * ADMINISTRATIVE QUERIES (Layer 1 - Hierarchy Drilling)
 */

export const getProvinces = (): Province[] => data.provinces;

export const getProvinceById = (id: string): Province | undefined =>
  data.provinces.find(p => p.id === id);

/**
 * Filtered Drilling: Get children by Parent ID
 */
export const getDistrictsByProvince = (provinceId: string): District[] =>
  data.districts.filter(d => d.province_id === provinceId);

export const getDSDivisionsByDistrict = (districtId: string): DSDivision[] =>
  data.dsDivisions.filter(ds => ds.district_id === districtId);

export const getGNDivisionsByDSDivision = (dsId: string): GNDivision[] =>
  data.gnDivisions.filter(gn => gn.ds_division_id === dsId);

/**
 * Flat Accessors (Optional use)
 */
export const getAllDistricts = () => data.districts;
export const getAllDSDivisions = () => data.dsDivisions;
export const getAllGNDivisions = () => data.gnDivisions;

/**
 * POSTAL QUERIES
 */

export const getPostalUnitsByDistrict = (districtId: string): PostalUnit[] =>
  data.postalUnits.filter(pu => pu.district_id === districtId);

export const getPostalUnitById = (id: string): PostalUnit | undefined =>
  data.postalUnits.find(pu => pu.id === id);

/**
 * EDUCATIONAL QUERIES (Layer 2)
 */

export const getZonesByProvince = (provinceId: string): Zone[] =>
  data.zones.filter(z => z.province_id === provinceId);

export const getDivisionsByZone = (zoneId: string): Division[] =>
  data.divisions.filter(d => d.zone_id === zoneId);

export const getZoneById = (id: string): Zone | undefined =>
  data.zones.find(z => z.id === id);

/**
 * SCHOOL DISCOVERY ENGINE
 */

export interface SchoolFilter {
  provinceId?: string;
  districtId?: string;
  zoneId?: string;
  divisionId?: string;
  dsDivisionId?: string;
  gnDivisionId?: string;
  type?: string;
  category?: string;
}

/**
 * Versatile school discovery with multi-vector filtering
 */
export const getSchools = (filter?: SchoolFilter): School[] => {
  if (!filter) return data.schools;
  return data.schools.filter(s => {
    if (filter.provinceId && s.location.province_id !== filter.provinceId) return false;
    if (filter.districtId && s.location.district_id !== filter.districtId) return false;
    if (filter.zoneId && s.jurisdiction.zone_id !== filter.zoneId) return false;
    if (filter.divisionId && s.jurisdiction.division_id !== filter.divisionId) return false;
    if (filter.dsDivisionId && s.location.ds_division_id !== filter.dsDivisionId) return false;
    if (filter.gnDivisionId && s.location.gn_division_id !== filter.gnDivisionId) return false;
    if (filter.type && s.type !== filter.type) return false;
    if (filter.category && s.category !== filter.category) return false;
    return true;
  });
};

export const getSchoolByCensusNo = (censusNo: string): School | undefined =>
  data.schools.find(s => s.census_no === censusNo);

/**
 * SEARCH & AUTOCOMPLETE (Context-Aware)
 */

export interface SearchOptions {
  districtId?: string;
  dsId?: string;
  zoneId?: string;
  limit?: number;
}

/**
 * Optimized search for postal towns / areas
 */
export const searchPostalTowns = (query: string, options?: SearchOptions): PostalUnit[] => {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  return data.postalUnits.filter(pu => {
    if (options?.districtId && pu.district_id !== options.districtId) return false;
    return (pu.city?.toLowerCase() || '').includes(normQuery) || (pu.postal_code || '').includes(normQuery);
  }).slice(0, options?.limit || 20);
};

/**
 * Search for schools (Name or Census No)
 */
export const searchSchools = (query: string, options?: SearchOptions): School[] => {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  return data.schools.filter(s => {
    if (options?.districtId && s.location.district_id !== options.districtId) return false;
    if (options?.zoneId && s.jurisdiction.zone_id !== options.zoneId) return false;
    return (s.name?.toLowerCase() || '').includes(normQuery) || (s.census_no || '').includes(normQuery);
  }).slice(0, options?.limit || 20);
};

/**
 * Contextual Autocomplete for GN Divisions (Multilingual SI/TA)
 */
export const searchGNDivisions = (query: string, options?: SearchOptions): GNDivision[] => {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];
  return data.gnDivisions.filter(gn => {
    if (options?.dsId && gn.ds_division_id !== options.dsId) return false;
    if (options?.districtId && gn.district_id !== options.districtId) return false;
    return (gn.name?.toLowerCase() || '').includes(normQuery) ||
           (gn.name_si || '').includes(normQuery) ||
           (gn.name_ta || '').includes(normQuery) ||
           (gn.p_code || '').includes(normQuery);
  }).slice(0, options?.limit || 20);
};

/**
 * BREADCRUMBS & CONTEXT UTILITIES
 */

/**
 * Resolves the full path for a school for display in summaries or breadcrumbs
 */
export const getSchoolContext = (censusNo: string) => {
  const school = data.schools.find(s => s.census_no === censusNo);
  if (!school) return null;

  return {
    school,
    province: data.provinces.find(p => p.id === school.location.province_id),
    district: data.districts.find(d => d.id === school.location.district_id),
    zone: data.zones.find(z => z.id === school.jurisdiction.zone_id),
    division: data.divisions.find(div => div.id === school.jurisdiction.division_id),
    postalTown: data.postalUnits.find(pu => pu.id === school.location.postal_unit_id)
  };
};

/**
 * Metadata & Diagnostics
 */
export const getMetadata = () => data.metadata;
