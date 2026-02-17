// Manual mock for expo-image-picker
module.exports = {
    launchImageLibraryAsync: jest.fn(() => Promise.resolve({
        canceled: false,
        assets: [{
            uri: 'mock-image-uri',
            width: 100,
            height: 100,
        }],
    })),
    launchCameraAsync: jest.fn(() => Promise.resolve({
        canceled: false,
        assets: [{
            uri: 'mock-camera-uri',
            width: 100,
            height: 100,
        }],
    })),
    MediaTypeOptions: {
        All: 'All',
        Videos: 'Videos',
        Images: 'Images',
    },
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({
        granted: true,
        canAskAgain: true,
        status: 'granted',
    })),
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({
        granted: true,
        canAskAgain: true,
        status: 'granted',
    })),
};
