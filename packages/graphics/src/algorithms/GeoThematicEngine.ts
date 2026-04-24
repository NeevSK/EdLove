/**
 * GeoThematicEngine: "Soul" contribution for Gurudevi.
 * Provides logic for Thematic Coloring (Choropleths) and Spatial Insight.
 */
export type ColorPalette = 'saffron' | 'emerald' | 'ocean' | 'fire' | 'socioeconomic' | 'viability';

const PALETTES: Record<ColorPalette, [string, string]> = {
    saffron: ['#FFFBEB', '#F59E0B'],
    emerald: ['#ECFDF5', '#10B981'],
    ocean: ['#F0F9FF', '#0EA5E9'],
    fire: ['#FEF2F2', '#EF4444'],
    socioeconomic: ['#F5F3FF', '#7C3AED'], // Purple scale
    viability: ['#FFF7ED', '#EA580C'], // Orange/Terra scale
};


export const GeoThematicEngine = {
    /**
     * Generates a color based on a value's position between min and max.
     * Perfect for student population or school performance heatmaps.
     */
    getColorForValue: (value: number, min: number, max: number, palette: ColorPalette = 'saffron'): string => {
        const [low, high] = PALETTES[palette];
        const ratio = (value - min) / (max - min || 1);
        const clampedRatio = Math.max(0, Math.min(1, ratio));

        // Simple hex interpolation (simplified for demonstration)
        return clampedRatio > 0.5 ? high : low; 
    },

    /**
     * Map a dataset of { districtId: value } to a Record<districtId, color     */
    generateChoropleth: (data: Record<string, number>, palette: ColorPalette = 'saffron'): Record<string, string> => {
        const values = Object.values(data);
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        const colors: Record<string, string> = {};
        for (const [id, val] of Object.entries(data)) {
            colors[id] = GeoThematicEngine.getColorForValue(val, min, max, palette);
        }
        return colors;
    }
};
