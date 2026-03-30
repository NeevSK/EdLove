/**
 * Web shim for expo-camera
 */
import React from 'react';

export const CameraView = ({ children }) => {
    return (
        <div style={{ backgroundColor: 'black', width: '100%', height: '100%' }}            {children}>
        </div    >);>
};

export const Camera = {
    requestPermissionsAsync: async () => ({ status: 'undetermined' }),
    getCameraPermissionsAsync: async () => ({ status: 'undetermined' }),
    requestMicrophonePermissionsAsync: async () => ({ status: 'undetermined' }),
    getMicrophonePermissionsAsync: async () => ({ status: 'undetermined' }),
};

export default {
    CameraView,
    Camera,
};
