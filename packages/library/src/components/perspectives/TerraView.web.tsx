import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useThemedColors, Theme } from '@repo/ui';
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
        <View style={styles.container}>
            <View style={styles.placeholder}>
                <Globe size={64} color={colors.action} opacity={0.5} />
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                    Strategic Geographical Mapping
                </Text>
                <Text style={[styles.subtext, { color: colors.textTertiary }]}>
                    Web version is currently being ritualized with Leaflet integration.
                </Text>
                
                {/* Simulated Region List */}
                <View style={styles.regionList}>
                    {data.nodes.filter(n => n.geo).map(node => (
                        <View key={node.id} style={[styles.pill, { backgroundColor: colors.secondary, borderColor: colors.action }]}>
                            <Text style={{ color: colors.text, fontSize: 12 }}>{node.label} ({node.geo?.lat.toFixed(2)}, {node.geo?.lng.toFixed(2)})</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1610',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        alignItems: 'center',
        padding: 40,
        maxWidth: 500,
    },
    text: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 20,
        textAlign: 'center',
    },
    subtext: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    regionList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    }
});
