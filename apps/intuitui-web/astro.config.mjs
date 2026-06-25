// @ts-check

import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://intuituilabs.edlove.org',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      alias: {
        'react-native/Libraries/Utilities/codegenNativeComponent': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/TurboModule/TurboModuleRegistry': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/Renderer/shims/ReactFabric': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/StyleSheet/processColor': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/Image/resolveAssetSource': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/NativeComponent/NativeComponentRegistry': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/NativeComponent/ViewConfigIgnore': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native/Libraries/ReactNative/AppContainer': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native-reanimated': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native-screens/experimental': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native-screens': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'expo-modules-core': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        '@shopify/react-native-skia': new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url).pathname,
        'react-native': new URL('../../packages/ui/src/shims/react-native-web-shim.ts', import.meta.url).pathname,
      },
    },
  },
  integrations: [svelte(), sitemap()],
});
