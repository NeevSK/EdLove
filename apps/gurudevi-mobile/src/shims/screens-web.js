const bridge = require('./universal-bridge');

const featureFlags = {
  experiment: {
    iosPreventReattachmentOfDismissedScreens: false,
    // add any future flags here as false
  }
};

module.exports = bridge('react-native-screens', {
  __esModule: true,
  featureFlags,
  // rest is proxied by bridge
});
module.exports.featureFlags = featureFlags;
module.exports.default = module.exports;
