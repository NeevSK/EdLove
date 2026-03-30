/**
 * Web-compatible shim for codegenNativeComponent.
 * 
 * Packages using the React Native New Architecture (Fabric) use this utility
 * to generate native components. On the web, where Fabric doesn't exist, we
 * simply shim it to return a basic View-like component or identity function
 * to prevent runtime crashes when native-focused libraries are bundled for web.
 */
const { View } = require('react-native');

function codegenNativeComponent(name, options) {
  // Return a generic View that can handle props passed to the native component
  return View;
}

module.exports = codegenNativeComponent;
