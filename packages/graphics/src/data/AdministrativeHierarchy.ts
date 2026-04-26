import type { DSDivision, GNDivision } from '@intuitui-labs/lk-edu-geo';
import * as LKEduGeo from '@intuitui-labs/lk-edu-geo';
import { SRI_LANKAN_DISTRICTS, SRI_LANKAN_PROVINCES } from '@repo/core';

export interface AdminUnit {
  id: string;
  en: string;
  si: string;
  ta: string;
}

/**
 * Universal Drilling Utility using @repo/lk-edu-geo.
 *
 * This replaces the previous Node-only @nishansanjuka/srilanka_geographics
 * implementation which crashed on native due to fs/path dependencies.
 */
export const Drilldown = {
  getProvinces: () => SRI_LANKAN_PROVINCES,

  getDistricts: (provinceId: string) =>
    SRI_LANKAN_DISTRICTS.filter((d) => d.provinceId === provinceId),

  /**
   * Retrieves cities for a given district.
   */
  getCities: async (districtId: string) => {
    // We use district ID for lookups in lk-edu-geo
    return LKEduGeo.getPostalUnitsByDistrict(districtId).map((p) => ({
      id: p.id,
      en: p.city || '',
      si: '', // No city_si in PostalUnit yet
      ta: '', // No city_ta in PostalUnit yet
    }));
  },

  /**
   * Retrieves all provinces with full detail
   */
  getAllProvincesDetailed: async () => {
    return LKEduGeo.getProvinces().map((p) => ({
      id: p.id,
      en: p.name,
      si: p.name_si || '',
      ta: p.name_ta || '',
    }));
  },

  /**
   * Synchronous stubs for UI-layer drilling.
   */
  getDSDivisions: (districtId: string): DSDivision[] => {
    return LKEduGeo.getDSDivisionsByDistrict(districtId);
  },
  getGNDivisions: (dsDivisionId: string): GNDivision[] => {
    return LKEduGeo.getGNDivisionsByDSDivision(dsDivisionId);
  },
};

export const DISTRICT_TO_DS_DIVISIONS = {}; // Placeholder for custom DS logic if needed
export const DS_TO_GN_DIVISIONS = {}; // Placeholder
