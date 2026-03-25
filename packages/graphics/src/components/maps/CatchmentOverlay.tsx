import React from 'react';
import { Circle, Marker } from 'react-native-maps';
import { CatchmentAnalysis, Point } from '../../algorithms/CatchmentAnalysis';


interface CatchmentOverlayProps {
    center: Point;
    radiusKm: number;
    color?: string;
    title?: string;
}

/**
 * CatchmentOverlay: Visualizes a school's zone or radius.
 * Pairs with CatchmentAnalysis for the logic.
 */
export function CatchmentOverlay({ 
    center, 
    radiusKm, 
    color = 'rgba(245, 158, 11, 0.3)', // Saffron translucent
    title = 'Catchment Area' 
}: CatchmentOverlayProps) {
    return (
        <>
            <Circle
                center={{ latitude: center.lat, longitude: center.lng }}
                radius={radiusKm * 1000} // Convert to meters
                fillColor={color}
                strokeColor={color.replace('0.3', '1')}
                strokeWidth={2}
            />
            <Marker
                coordinate={{ latitude: center.lat, longitude: center.lng }}
                title={title}
                pinColor="#F59E0B"
            />
        </>
    );
}
