import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Theme, useThemedColors } from '@repo/ui';
import type { 
    PerspectiveViewProps, 
    GraphNode 
} from '@repo/graphics';

/**
 * TerraView — The "Geographical" Perspective (Native).
 * 
 * Renders nodes on a real-world map using react-native-maps.
 * Features custom dark-mode styling for the "Sanctuary" aesthetic.
 */
export const TerraView: React.FC<PerspectiveViewProps> = ({
    data,
    onNodePress,
}) => {
    const colors = useThemedColors();
    const mapRef = useRef<MapView>(null);

    // Filter nodes with geo data
    const geoNodes = useMemo(() => data.nodes.filter(n => n.geo), [data.nodes]);

    // Initial region focusing on Sri Lanka if no data, or on nodes if present
    const initialRegion = useMemo(() => {
        if (geoNodes.length === 0) {
            return {
                latitude: 7.8731,
                longitude: 80.7718,
                latitudeDelta: 3.0,
                longitudeDelta: 3.0,
            };
        }
        
        const lats = geoNodes.map(n => n.geo!.lat);
        const lngs = geoNodes.map(n => n.geo!.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(0.1, (maxLat - minLat) * 1.5),
            longitudeDelta: Math.max(0.1, (maxLng - minLng) * 1.5),
        };
    }, [geoNodes]);

    // Dark Map Style (Sanctuary Ink / Obsidian)
    const mapStyle = [
        { "elementType": "geometry", "stylers": [{ "color": "#1A1610" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1A1610" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#8C8273" }] },
        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#F6BF8C" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#8C8273" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#2A2318" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#3D3528" }] },
        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1A1610" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#6A6358" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0F172A" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#2563EB" }] }
    ];

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                customMapStyle={mapStyle}
                showsUserLocation={false}
                showsMyLocationButton={false}
                rotateEnabled={false}
            >
                {geoNodes.map((node) => (
                    <Marker
                        key={node.id}
                        coordinate={{
                            latitude: node.geo!.lat,
                            longitude: node.geo!.lng,
                        }}
                        title={node.label}
                        description={node.type}
                        onPress={() => onNodePress?.(node)}
                        pinColor={node.type === 'school' ? Theme.colors.sanctuarySaffron : colors.action}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1A1610',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
