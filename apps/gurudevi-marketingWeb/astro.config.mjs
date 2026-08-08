// @ts-check

import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://gurudevi.edlove.org',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      alias: {
        '@': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
        '@cedar-policy/cedar-wasm/web': fileURLToPath(
          new URL('./src/shims/cedar-web.ts', import.meta.url),
        ),
        'react-native/Libraries/Utilities/codegenNativeComponent': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/TurboModule/TurboModuleRegistry': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/Renderer/shims/ReactFabric': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/StyleSheet/processColor': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/Image/resolveAssetSource': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/NativeComponent/NativeComponentRegistry': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/NativeComponent/ViewConfigIgnore': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native/Libraries/ReactNative/AppContainer': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native-reanimated': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native-screens/experimental': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'react-native-screens': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'expo-modules-core': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        '@shopify/react-native-skia': fileURLToPath(
          new URL('../../packages/ui/src/shims/native-web-stub.ts', import.meta.url),
        ),
        'expo-linear-gradient': fileURLToPath(
          new URL('./src/shims/expo-linear-gradient.tsx', import.meta.url),
        ),
        'react-native-get-random-values': fileURLToPath(
          new URL('./src/shims/react-native-get-random-values.ts', import.meta.url),
        ),
        'react-native': fileURLToPath(
          new URL('../../packages/ui/src/shims/react-native-web-shim.ts', import.meta.url),
        ),
      },
    },
  },
  integrations: [svelte(), sitemap()],
  adapter: vercel({
    webAnalytics: { enabled: false }
  }),
});
