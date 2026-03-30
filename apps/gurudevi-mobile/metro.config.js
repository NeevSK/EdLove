const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Note: babel.config.js sets `unstable_transformImportMeta: true` in
// babel-preset-expo.  This is required because zustand@5 (and similar
// packages) ship pre-compiled code that uses `import.meta.env.MODE` for
// dev/prod detection.  Metro serves the web bundle as a classic <script// (no type="module"), so any bare `import.meta` reference causes:
//   SyntaxError: Cannot use 'import.meta' outside a module
// The babel option rewrites every `import.meta` \u2192 `globalThis.__ExpoImportMetaRegistry`,
// autumn Expo's winter runtime initialises before the app boots.
const config = getSentryExpoConfig(projectRoot, { isCSSEnabled: true });

// Add support for WASM files (required by expo-sqlite on web)
config.resolver.assetExts.push('wasm');

// 1. Watch all files in the monorepo
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// 2. Resolve node_modules from the app root first, then workspace root.
//    This ensures a SINGLE copy of react/react-native is used.
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. CRITICAL: Disable hierarchical lookup so Metro does NOT walk up into
//    packages/*/node_modules and find react/react-native via a different path.
//    This is a BREAKING CHANGE to Metro's module resolution behaviour in the monorepo.
//    Any updates to this setting MUST be mirrored in the documentation:
//      - apps/gurudevi-mobile/README.md ("Metro configuration" section)
//      - docs/migrations/metro-disable-hierarchical-lookup.md
//    so that other developers understand why hierarchical lookup is disabled and
//    how it impacts adding packages or debugging resolution issues.
config.resolver.disableHierarchicalLookup = true;

// 4. Aggressive blockList to ensure Metro NEVER follows paths into package-level React.
config.resolver.blockList = [
    /packages\/.*\/node_modules\/react\/.*/,
    /packages\/.*\/node_modules\/react-native\/.*/,
    /packages\/.*\/node_modules\/@react-native-async-storage\/.*/,
];

// 5. Explicitly alias singleton packages so that ANY require('react') anywhere
//    in the bundle resolves to exactly ONE file path in the app's node_modules.
config.resolver.extraNodeModules = {
    'react': path.resolve(projectRoot, 'node_modules/react'),
    '@react-native-async-storage/async-storage': path.resolve(projectRoot, 'node_modules/@react-native-async-storage/async-storage'),
};

// 5b. Platform-aware react-native alias
// Note: On web, we MUST allow Expo's default aliasing to react-native-web.
// On native, we force it to the app's node_modules to ensure singleton behavior.
const isWeb = process.argv.find(arg => arg.includes('platform=web'));
if (!isWeb) {
    config.resolver.extraNodeModules['react-native'] = path.resolve(projectRoot, 'node_modules/react-native');
}

// 6. Web-only shims: redirect native-only packages to no-op web implementations
//    when Metro is bundling for the 'web' platform.
//    This allows App.tsx and packages to import these packages unconditionally
//    while keeping the web bundle free of native bridge calls.
//
//    Shim files live in src/shims/ and mirror the subset of the API used in
//    this codebase. If you add a new usage of a shimmed package, update the
//    matching shim file in src/shims/.
// 6. Platform-aware Shims
//
// Web-only shims redirect native-only packages to no-op web implementations.
// Universal shims (The "Firewall") redirect Node.js built-ins or Node-only packages 
// to safe implementations on ALL platforms (web and native).
const WEB_SHIMS = {
    '@sentry/react-native': path.resolve(projectRoot, 'src/shims/sentry-web.js'),
    'posthog-react-native': path.resolve(projectRoot, 'src/shims/posthog-web.js'),
    'react-native-get-random-values': path.resolve(projectRoot, 'src/shims/get-random-values-web.js'),
    'react-native-url-polyfill/auto': path.resolve(projectRoot, 'src/shims/url-polyfill-web.js'),
    '@react-native-ml-kit/text-recognition': path.resolve(projectRoot, 'src/shims/ml-kit-text-recognition-web.js'),
    '@react-native-ml-kit/barcode-scanning': path.resolve(projectRoot, 'src/shims/ml-kit-barcode-scanning-web.js'),
    'expo-file-system': path.resolve(projectRoot, 'src/shims/expo-file-system-web.js'),
    'expo-sharing': path.resolve(projectRoot, 'src/shims/expo-sharing-web.js'),
    'expo-sqlite': path.resolve(projectRoot, 'src/shims/expo-sqlite-web.js'),
    'expo-av': path.resolve(projectRoot, 'src/shims/expo-av-web.js'),
    'expo-video': path.resolve(projectRoot, 'src/shims/expo-video-web.js'),
    'expo-audio': path.resolve(projectRoot, 'src/shims/expo-audio-web.js'),
    'expo-haptics': path.resolve(projectRoot, 'src/shims/expo-haptics-web.js'),
    'expo-device': path.resolve(projectRoot, 'src/shims/expo-device-web.js'),
    'expo-image-picker': path.resolve(projectRoot, 'src/shims/expo-image-picker-web.js'),
    'expo-location': path.resolve(projectRoot, 'src/shims/expo-location-web.js'),
    'expo-secure-store': path.resolve(projectRoot, 'src/shims/expo-secure-store-web.js'),
    'expo-application': path.resolve(projectRoot, 'src/shims/expo-application-web.js'),
    'expo-updates': path.resolve(projectRoot, 'src/shims/expo-updates-web.js'),
    'expo-image-manipulator': path.resolve(projectRoot, 'src/shims/expo-image-manipulator-web.js'),
    'react-native-mmkv': path.resolve(projectRoot, 'src/shims/mmkv-web.js'),
    'react-native-nitro-modules': path.resolve(projectRoot, 'src/shims/nitro-modules-web.js'),
    'react-native-worklets': path.resolve(projectRoot, 'src/shims/worklets-web.js'),
    'react-native-reanimated': path.resolve(projectRoot, 'src/shims/reanimated-web.js'),
    'react-native-gesture-handler': path.resolve(projectRoot, 'src/shims/gesture-handler-web.js'),
    'react-native-screens': path.resolve(projectRoot, 'src/shims/screens-web.js'),
    'react-native-svg': path.resolve(projectRoot, 'src/shims/svg-web.js'),
    'lucide-react-native': path.resolve(projectRoot, 'src/shims/lucide-react-native-web.js'),
    '@shopify/react-native-skia': path.resolve(projectRoot, 'src/shims/skia-web.js'),
    'react-native-wgpu': path.resolve(projectRoot, 'src/shims/wgpu-web.js'),
    'expo-camera': path.resolve(projectRoot, 'src/shims/expo-camera-web.js'),
    '@maplibre/maplibre-react-native': path.resolve(projectRoot, 'src/shims/maplibre-web.js'),
    // Internal Monorepo Shims
    '@intuitui-labs/lk-edu-geo': path.resolve(projectRoot, 'src/shims/lk-edu-geo-web.js'),
    'srilankan-postalcode-backend': path.resolve(projectRoot, 'src/shims/postalcode-backend-web.js'),
    '@repo/scanner-kit': path.resolve(projectRoot, 'src/shims/mmkv-web.js'),
};

const UNIVERSAL_SHIMS = {
    '@repo/database': path.resolve(projectRoot, 'src/shims/database-shim.js'),
    '@nishansanjuka/srilanka_geographics': path.resolve(projectRoot, 'src/shims/srilanka-geographics-web.js'),
    // Node.js Module Shims (Firewall against Node-only packages leaking into Native bundle)
    'events': path.resolve(projectRoot, 'src/shims/events-web.js'),
    'net': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'tls': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'dns': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'string_decoder': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'assert': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'zlib': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'http': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'https': path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
    'path': path.resolve(projectRoot, 'src/shims/path-web.js'),
    'fs': path.resolve(projectRoot, 'src/shims/fs-web.js'),
    'os': path.resolve(projectRoot, 'src/shims/os-web.js'),
    'util': path.resolve(projectRoot, 'src/shims/util-web.js'),
    'crypto': path.resolve(projectRoot, 'src/shims/crypto-web.js'),
    'stream': path.resolve(projectRoot, 'src/shims/stream-web.js'),
    'vm': path.resolve(projectRoot, 'src/shims/stream-web.js'),
};

// 7. Platform Firewall (Universal Resolver)
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // A. Metadata Protection: Never redirect internal package metadata (package.json) 
    // to JavaScript shims. This prevents "JSON Parse error: Unexpected end of input".
    if (moduleName.endsWith('.json') || moduleName.endsWith('.wasm')) {
        if (defaultResolveRequest) return defaultResolveRequest(context, moduleName, platform);
        return context.resolveRequest(context, moduleName, platform);
    }

    // B. Universal Shims (Apply to all platforms including native)
    for (const shimKey in UNIVERSAL_SHIMS) {
        if (moduleName === shimKey || moduleName.startsWith(shimKey + '/')) {
            console.log(`[Metro-Firewall] \uD83D\uDEE1\uFE0F UNIVERSAL Intercept: ${moduleName} -> ${shimKey}`);
            return { filePath: UNIVERSAL_SHIMS[shimKey], type: 'sourceFile' };
        }
    }

    // C. Web-Only Shims
    if (platform === 'web') {
        for (const shimKey in WEB_SHIMS) {
            if (moduleName === shimKey || moduleName.startsWith(shimKey + '/')) {
                console.log(`[Metro-Firewall] \uD83D\uDEE1\uFE0F WEB Intercept: ${moduleName} -> ${shimKey}`);
                return { filePath: WEB_SHIMS[shimKey], type: 'sourceFile' };
            }
        }
    }

    // Delegate to original/default resolver
    if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};


// 7. ESM package exports resolution
//
// Packages like i18next v23+, react-i18next v14+, and @tanstack/react-query v5
// are "ESM-first": they ship pre-compiled ESM that uses TypeScript's
// `Object.defineProperty(exports, 'default', { get: () => X })` pattern.
// When Metro's CJS wrapper then tries to write exports.default = interop(Y)
// it throws: "Cannot set property default of #<object> which has only a getter".
//
// Fix: enable package.json `exports` field resolution and prefer the `require`
// (CJS) condition over `import` (ESM) on every platform.  This makes Metro
// pick e.g. `i18next/dist/cjs/i18next.js` instead of the ESM entry, which is
// a plain CJS file that Metro can wrap without hitting the getter conflict.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = isWeb 
    ? ['browser', 'require', 'default'] 
    : ['react-native', 'require', 'default'];

module.exports = config;
