import React from 'react';
import { useThemedColors, Theme, Box, Text } from '@repo/ui';
import { Globe } from 'lucide-react-native';
import type { 
    PerspectiveViewProps 
} from '@repo/graphics';

/**
 * TerraView.web  The "Geographical" Perspective (Web Placeholder).
 * 
 * In a real implementation, this would use a Leaflet or Mapbox WebView.
 * For now, it provides a high-fidelity placeholder that maintains 
 * the Sanctuary aesthetic on web.
 */
export const TerraView: React.FC<PerspectiveViewProps> = ({
    data,
}) => {
    const colors = useThemedColors();

    return (
        <Box className="flex-1 bg-[#1A1610] items-center justify-center">
            <Box className="items-center p-10 max-w-[500px]">
                <Globe size={64} color={colors.action} opacity={0.5} />
                <Text className="text-2xl font-extrabold mt-5 text-center" style={{ color: colors.textSecondary }}>
                    Strategic Geographical Mapping
                </Text>
                <Text className="text-sm mt-2 text-center" style={{ color: colors.textTertiary }}>
                    Web version is currently being ritualized with Leaflet integration.
                </Text>
                
                {/* Simulated Region List */}
                <Box className="flex-row flex-wrap justify-center gap-2 mt-8">
                    {data.nodes.filter(n => n.geo).map(node => (
                        <Box key={node.id} className="px-3 py-1.5 rounded-full border" style={{ backgroundColor: colors.secondary, borderColor: colors.action }}>
                            <Text className="text-xs" style={{ color: colors.text }}>{node.label} ({node.geo?.lat.toFixed(2)}, {node.geo?.lng.toFixed(2)})</Text>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};


