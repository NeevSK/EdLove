/**
 * Web shim for expo-av.
 * 
 * Since SDK 55 removes expo-av and we use native web elements for media,
 * this shim provides no-ops for any transitive references to expo-av APIs.
 */

const noop = () => { };

const AV = {
    Video: () => null,
    Audio: {
        Sound: {
            createAsync: async () => ({ sound: { playAsync: noop, pauseAsync: noop, stopAsync: noop, unloadAsync: noop } }),
        },
        setIsEnabledAsync: async () => { },
        setAudioModeAsync: async () => { },
    },
    ResizeMode: {
        CONTAIN: 'contain',
        COVER: 'cover',
        STRETCH: 'stretch',
    },
};

module.exports = AV;
