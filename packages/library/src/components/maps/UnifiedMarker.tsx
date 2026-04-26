import React from 'react';
import { Marker } from 'react-native-maps';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { useMap } from './MapProvider';
import { Box, Text } from '@repo/ui';

interface UnifiedMarkerProps {
    id?: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title?: string;
    description?: string;
    onPress?: () => void;
    pinColor?: string;
    children?: React.ReactNode;
}

export const UnifiedMarker: React.FC<UnifiedMarkerProps> = ({
    id,
    coordinate,
    title,
    description,
    onPress,
    pinColor,
    children,
}) => {
    const { provider } = useMap();

    if (provider === 'maplibre') {
        return (
            <MapLibreGL.PointAnnotation
                id={id || `marker-${coordinate.latitude}-${coordinate.longitude}`}
                coordinate={[coordinate.longitude, coordinate.latitude]}
                onSelected={onPress}
            >
                {(children as React.ReactElement) || (
                    <Box 
                        className="w-[15px] h-[15px] rounded-full border-2 border-white" 
                        style={{ backgroundColor: pinColor || '#FF0000' }} 
                    />
                )}
                <MapLibreGL.Callout>
                    <Box className="p-2.5 bg-white rounded-lg min-w-[100px] shadow-sm">
                        <Text className="font-bold text-sm text-[#000000]">{title}</Text>
                        {description && <Text className="text-[12px] text-[#666666]">{description}</Text>}
                    </Box>
                </MapLibreGL.Callout>
            </MapLibreGL.PointAnnotation>
        );
    }

    return (
        <Marker
            coordinate={coordinate}
            title={title}
            description={description}
            onPress={onPress}
            pinColor={pinColor}
        >
            {children}
        </Marker>
    );
};
