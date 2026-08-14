const fs = require('node:fs');
const path = require('node:path');

// Metro transform workers on Windows do not reliably inherit Doppler's
// EXPO_PUBLIC_* environment variables. metro.config.js writes this file only
// after resolving the public Expo config, and removes it when the process
// exits. Reading it here lets babel-preset-expo inline the same values into
// the web manifest without putting them in source control.
const publicRuntimePath = path.join(__dirname, '.expo', 'gurudevi-public-runtime.json');
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  try {
    const publicRuntime = JSON.parse(fs.readFileSync(publicRuntimePath, 'utf8'));
    if (publicRuntime.supabaseUrl && publicRuntime.supabasePublishableKey) {
      process.env.EXPO_PUBLIC_SUPABASE_URL = publicRuntime.supabaseUrl;
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = publicRuntime.supabasePublishableKey;
    }
  } catch {
    // Leave the environment untouched; the runtime credential guard remains
    // responsible for rejecting an actually missing configuration.
  }
}

module.exports = (api) => {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache.using(() => isWeb);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // unstable_transformImportMeta: true
          unstable_transformImportMeta: true,
          reactCompiler: true,
        },
      ],
    ],
    plugins: [require('react-native-worklets/plugin')],
  };
};
