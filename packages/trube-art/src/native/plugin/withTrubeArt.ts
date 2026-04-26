import {
  type ConfigPlugin,
  createRunOncePlugin,
  withAndroidManifest,
  withDangerousMod,
  withPlugins,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

const pkg = require('../../package.json');

/**
 * Adds Nitro Modules and GPU driver requirements to the AndroidManifest.xml
 */
const withAndroidGPUDriver: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      // Ensure we have the hardware acceleration enabled for Vulkan/WebGPU
      mainApplication.$['android:hardwareAccelerated'] = 'true';
    }
    return config;
  });
};

/**
 * Adds ProGuard rules for Nitro Modules to prevent stripping C++ bridges.
 */
const withNitroProGuard: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.projectRoot,
        'android',
        'app',
        'proguard-rules.pro',
      );
      if (fs.existsSync(proguardPath)) {
        const rules = `
# Trube-Art Nitro Modules Protection
-keep class com.margelo.nitro.** { *; }
-keep class com.repo.trubeart.** { *; }
`;
        const content = fs.readFileSync(proguardPath, 'utf8');
        if (!content.includes('Trube-Art Nitro Modules Protection')) {
          fs.writeFileSync(proguardPath, content + rules);
        }
      }
      return config;
    },
  ]);
};

/**
 * Expo Config Plugin to set up Tr\u00FCbe-Art for a React Native app.
 * Handles native dependencies (Vulkan, Metal) and Nitro module initialization.
 */
const withTrubeArt: ConfigPlugin = (config) => {
  return withPlugins(config, [
    withAndroidGPUDriver,
    withNitroProGuard,
    // iOS specific Metal/Nitro config can be added here as needed
  ]);
};

export default createRunOncePlugin(withTrubeArt, pkg.name, pkg.version);
