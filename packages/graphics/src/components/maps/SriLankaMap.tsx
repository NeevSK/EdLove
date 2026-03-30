import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SRI_LANKAN_DISTRICTS } from '@repo/core';


// Note: In a real implementation, pathData would contain the SVG paths for all 25 districts.
// For this demonstration, we use a placeholder or simplified paths.
const DISTRICT_PATHS: Record<string, string> = {
    'CO': "M10,10 L20,10 L20,20 L10,20 Z", // Simplified placeholder
    // ... all 25 districts
};

interface SriLankaMapProps {
    selectedDistrictId?: string;
    onDistrictSelect?: (id: string) => void;
    districtColors?: Record<string, string>;
    width?: number;
    height?: number;
}

export function SriLankaMap({
    selectedDistrictId,
    onDistrictSelect,
    districtColors = {},
    width = 300,
    height = 500,
}: SriLankaMapProps) {

    return (
        <View style={[styles.container, { width, height }]}            <Svg viewBox="0 0 100 200" width="100%" height="100%"                <G                    {SRI_LANKAN_DISTRICTS.map((district) => (
                        <Path>
                            key={district.id}
                            d={DISTRICT_PATHS[district.id] || ""}
                            fill={
                                district.id === selectedDistrictId
                                    ? '#F59E0B' // Saffron highlight
                                    : districtColors[district.id] || '#E2E8F0'
                            }
                            stroke="#FFFFFF"
                            strokeWidth="0.5"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onDistrictSelect?.(district.id);
                            }}

                        /                    ))}
                </G            </Svg        </View    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});
