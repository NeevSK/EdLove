const bridge = require('./universal-bridge');

const ImageManipulator = {
  manipulate: (source) =>
    bridge('ImageManipulator.context', {
      resize: () => ImageManipulator.manipulate(source),
      rotate: () => ImageManipulator.manipulate(source),
      flip: () => ImageManipulator.manipulate(source),
      crop: () => ImageManipulator.manipulate(source),
      extent: () => ImageManipulator.manipulate(source),
      renderAsync: async () => ({
        saveAsync: async () => ({ uri: source, width: 0, height: 0 }),
        release: () => {},
      }),
      release: () => {},
    }),
};

module.exports = bridge('expo-image-manipulator', {
  __esModule: true,
  default: { manipulate: ImageManipulator.manipulate },
  manipulateAsync: async (uri) => ({ uri, width: 0, height: 0 }),
  useImageManipulator: () => ({ manipulate: ImageManipulator.manipulate }),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
  FlipType: { Vertical: 'vertical', Horizontal: 'horizontal' },
});
module.exports.default = module.exports;
