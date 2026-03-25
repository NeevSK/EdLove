/**
 * CatchmentAnalysis: "Soul" contribution for Gurudevi.
 * Handles spatial relationships like "Nearby Schools" and "School Zones".
 */
export interface Point {
    lat: number;
    lng: number;
}

export const CatchmentAnalysis = {
    /**
     * Haversine formula to calculate distance between two points on Earth.
     */
    getDistanceKm: (p1: Point, p2: Point): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLng = (p2.lng - p1.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    /**
     * Checks if a point is within a circular catchment zone.
     */
    isWithinCatchment: (point: Point, center: Point, radiusKm: number): boolean => {
        return CatchmentAnalysis.getDistanceKm(point, center) <= radiusKm;
    },

    /**
     * Filter a list of locations based on a search center and radius.
     */
    findNearby: <T extends Point>(locations: T[], center: Point, radiusKm: number): T[] => {
        return locations.filter(loc => CatchmentAnalysis.isWithinCatchment(loc, center, radiusKm));
    },

    /**
     * Official Sri Lankan Admission Distance Rules
     */
    ADMISSION_RULES: {
        PRIMARY_ZONE_KM: 2.0,      // Proximate / standard catchment
        SECONDARY_ZONE_KM: 5.0,    // Extended catchment for specific school types
        PERMISSIBLE_MARGIN_KM: 0.1 // Tolerance for GPS inaccuracies
    }
};

