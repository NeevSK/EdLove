/**
 * Web shim for expo-video.
 *
 * We use native <video> elements on web, so this shim provides no-ops
 * for any transitive references to expo-video JSI modules.
 */

const _React = require('react');

const Video = {
  VideoView: () => null,
  useVideoPlayer: () => ({
    play: () => {},
    pause: () => {},
    replace: () => {},
    seekBy: () => {},
    currentTime: 0,
    duration: 0,
    status: 'idle',
  }),
};

module.exports = Video;
