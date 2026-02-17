// Manual mock for expo-camera to prevent Worker errors in tests
module.exports = {
    CameraView: 'CameraView',
    CameraType: {
        back: 'back',
        front: 'front',
    },
    useCameraPermissions: () => [
        {
            granted: true,
            canAskAgain: true,
            status: 'granted',
            expires: 'never',
        },
        jest.fn(), // Request permission function
    ],
};
