/**
 * Web shim for react-native-maps
 */
import React from 'react';

export const MapView = ({ children }) => <div style={{ backgroundColor: '#111', width: '100%', height: '100%' }}>{children}</div>;
export const Marker = () => null;
export const Polyline = () => null;
export const Polygon = () => null;
export const Circle = () => null;
export const Callout = () => null;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export default MapView;
