import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import ML from '@maplibre/maplibre-react-native';
import { useMap } from './MapProvider';
import { View, Text, StyleSheet } from 'react-native';

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
            <ML.PointAnnotation
                id={id || `marker-${coordinate.latitude}-${coordinate.longitude}`}
                coordinate={[coordinate.longitude, coordinate.latitude]}
                onSelected={onPress}
            >
                {(children as React.ReactElement) || (
                    <View style={[styles.dot, { backgroundColor: pinColor || '#FF0000' }]} />
                )}
                <ML.Callout>
                    <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>{title}</Text>
                        {description && <Text style={styles.calloutDesc}>{description}</Text>}
                    </View>
                </ML.Callout>
            </ML.PointAnnotation>
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

const styles = StyleSheet.create({
    dot: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    callout: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        minWidth: 100,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    calloutDesc: {
        fontSize: 12,
        color: '#666',
    },
});
