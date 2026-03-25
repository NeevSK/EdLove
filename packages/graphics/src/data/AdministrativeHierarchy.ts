import * as SLGeo from '@nishansanjuka/srilanka_geographics';
import { SRI_LANKAN_PROVINCES, SRI_LANKAN_DISTRICTS } from '@repo/core';

export interface AdminUnit {
    id: string;
    en: string;
    si: string;
    ta: string;
}

/**
 * Enhanced Drilling Utility using @nishansanjuka/srilanka_geographics
 */
export const Drilldown = {
    getProvinces: () => SRI_LANKAN_PROVINCES,
    
    getDistricts: (provinceId: string) => 
        SRI_LANKAN_DISTRICTS.filter(d => d.provinceId === provinceId),
    
    /**
     * Retrieves cities for a given district. 
     * In the context of Sri Lankan administration, Cities/Towns are often 
     * used as proxy for DS/GN divisions in lighter UX flows.
     */
    getCities: async (districtName: string) => {
        // @nishansanjuka uses names for lookup
        return SLGeo.GetCities(districtName);
    },

    /**
     * Retrives all provinces with full detail
     */
    getAllProvincesDetailed: async () => {
        return SLGeo.GetAllProvinces();
    }
};

export const DISTRICT_TO_DS_DIVISIONS = {}; // Placeholder for custom DS logic if needed
export const DS_TO_GN_DIVISIONS = {}; // Placeholder
