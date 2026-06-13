const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');
const path = require('node:path');
const fs = require('node:fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

function resolvePnpmPackageRuntime(packageName, runtimeFile) {
  const pnpmRoot = path.resolve(workspaceRoot, 'node_modules/.pnpm');
  const pkgDir = fs
    .readdirSync(pnpmRoot)
    .find((entry) => entry.startsWith(`${packageName.replace('/', '+')}@`));

  if (!pkgDir) {
    throw new Error(`Unable to locate ${packageName} in pnpm store at ${pnpmRoot}`);
  }

  return path.resolve(pnpmRoot, pkgDir, 'node_modules', packageName, runtimeFile);
}

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
  /packages[/\\].*[/\\]node_modules[/\\]react[/\\].*/,
  /packages[/\\].*[/\\]node_modules[/\\]react-native[/\\].*/,
  /packages[/\\].*[/\\]node_modules[/\\]@react-native-async-storage[/\\].*/,
  /apps[/\\].*[/\\]node_modules[/\\]\.vite[/\\].*/,
  /apps[/\\].*[/\\]\.expo[/\\].*/,
];

const SINGLETON_OVERRIDES = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  '@babel/runtime': path.resolve(projectRoot, 'node_modules/@babel/runtime'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
  '@react-navigation/core': path.resolve(projectRoot, 'node_modules/@react-navigation/core'),
  '@react-native-async-storage/async-storage': path.resolve(
    projectRoot,
    'node_modules/@react-native-async-storage/async-storage',
  ),
  effect: path.resolve(projectRoot, 'node_modules/effect'),
  '@effect/platform': path.resolve(projectRoot, 'node_modules/@effect/platform'),
  styleq: path.resolve(projectRoot, 'node_modules/styleq'),
  '@react-native-community/slider': path.resolve(
    projectRoot,
    'node_modules/@react-native-community/slider',
  ),
  'react-native-webview': path.resolve(projectRoot, 'node_modules/react-native-webview'),
  'react-native-maps': path.resolve(projectRoot, 'node_modules/react-native-maps'),
  'react-native-linear-gradient': path.resolve(
    projectRoot,
    'node_modules/react-native-linear-gradient',
  ),
  xstate: path.resolve(projectRoot, 'node_modules/xstate'),
  '@casl/react': path.resolve(projectRoot, 'node_modules/@casl/react'),
  'fast-deep-equal': path.resolve(projectRoot, 'node_modules/fast-deep-equal'),
  'hoist-non-react-statics': path.resolve(projectRoot, 'node_modules/hoist-non-react-statics'),
  scheduler: path.resolve(projectRoot, 'node_modules/scheduler'),
  'color-name': path.resolve(projectRoot, 'node_modules/color-name'),
  'react-is': path.resolve(projectRoot, 'node_modules/react-is'),
};

// 5. Dynamic Package Discovery (Internal & Pnpm Transitives)
// We scan the packages/ directory and the pnpm virtual store to proactively
// map all dependencies to their physical paths. This eliminates the need for
// manual elevation of transitive dependencies in package.json.
const INTERNAL_PACKAGE_MAPPINGS = {};
const packagesDir = path.resolve(workspaceRoot, 'packages');
if (fs.existsSync(packagesDir)) {
  fs.readdirSync(packagesDir).forEach((dir) => {
    const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.name) {
          INTERNAL_PACKAGE_MAPPINGS[pkgJson.name] = path.resolve(packagesDir, dir);
        }
      } catch (e) {
        console.warn(`[Metro-Config] ⚠️ Failed to parse package.json in ${dir}:`, e.message);
      }
    }
  });
}

const PNPM_FALLBACK_MAPPINGS = {};
const pnpmRoot = path.resolve(workspaceRoot, 'node_modules/.pnpm');
if (fs.existsSync(pnpmRoot)) {
  // We scan the virtual store for every package it contains.
  // This is the "Sovereign Proactive Resolver": it handles truncated directory names
  // and ensures Metro can find every transitive dependency without hierarchical lookup.
  fs.readdirSync(pnpmRoot).forEach((dir) => {
    const virtualNodeModules = path.resolve(pnpmRoot, dir, 'node_modules');
    if (fs.existsSync(virtualNodeModules)) {
      try {
        fs.readdirSync(virtualNodeModules).forEach((pkgName) => {
          if (pkgName.startsWith('@')) {
            const scopePath = path.resolve(virtualNodeModules, pkgName);
            fs.readdirSync(scopePath).forEach((subPkg) => {
              const fullName = `${pkgName}/${subPkg}`;
              if (!SINGLETON_OVERRIDES[fullName] && !INTERNAL_PACKAGE_MAPPINGS[fullName]) {
                PNPM_FALLBACK_MAPPINGS[fullName] = path.resolve(scopePath, subPkg);
              }
            });
          } else {
            if (!SINGLETON_OVERRIDES[pkgName] && !INTERNAL_PACKAGE_MAPPINGS[pkgName]) {
              PNPM_FALLBACK_MAPPINGS[pkgName] = path.resolve(virtualNodeModules, pkgName);
            }
          }
        });
      } catch (_e) {
        // Skip inaccessible or non-directory entries
      }
    }
  });
}

// Ensure react-native is a singleton on native platforms
const isWeb = process.argv.find((arg) => arg.includes('platform=web'));
if (!isWeb) {
  SINGLETON_OVERRIDES['react-native'] = path.resolve(projectRoot, 'node_modules/react-native');
}

config.resolver.extraNodeModules = {
  ...PNPM_FALLBACK_MAPPINGS,
  ...SINGLETON_OVERRIDES,
  ...INTERNAL_PACKAGE_MAPPINGS,
};

// 6. Platform Firewall & Deterministic Resolver
const WEB_SHIMS = {
  '@sentry/react-native': path.resolve(projectRoot, 'src/shims/sentry-web.js'),
  'posthog-react-native': path.resolve(projectRoot, 'src/shims/posthog-web.js'),
  'react-native-get-random-values': path.resolve(projectRoot, 'src/shims/get-random-values-web.js'),
  'react-native-url-polyfill/auto': path.resolve(projectRoot, 'src/shims/url-polyfill-web.js'),
  '@react-native-ml-kit/text-recognition': path.resolve(
    projectRoot,
    'src/shims/ml-kit-text-recognition-web.js',
  ),
  '@react-native-ml-kit/barcode-scanning': path.resolve(
    projectRoot,
    'src/shims/ml-kit-barcode-scanning-web.js',
  ),
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
  '@intuitui-labs/lk-edu-geo': path.resolve(projectRoot, 'src/shims/lk-edu-geo-web.js'),
  'srilankan-postalcode-backend': path.resolve(projectRoot, 'src/shims/postalcode-backend-web.js'),
};

const UNIVERSAL_SHIMS = {
  '@repo/database': path.resolve(projectRoot, 'src/shims/database-shim.js'),
  '@nishansanjuka/srilanka_geographics': path.resolve(
    projectRoot,
    'src/shims/srilanka-geographics-web.js',
  ),
  events: path.resolve(projectRoot, 'src/shims/events-web.js'),
  net: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  tls: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  dns: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  string_decoder: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  assert: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  zlib: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  http: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  https: path.resolve(projectRoot, 'src/shims/node-net-shim.js'),
  path: path.resolve(projectRoot, 'src/shims/path-web.js'),
  fs: path.resolve(projectRoot, 'src/shims/fs-web.js'),
  os: path.resolve(projectRoot, 'src/shims/os-web.js'),
  util: path.resolve(projectRoot, 'src/shims/util-web.js'),
  crypto: path.resolve(projectRoot, 'src/shims/crypto-web.js'),
  stream: path.resolve(projectRoot, 'src/shims/stream-web.js'),
  vm: path.resolve(projectRoot, 'src/shims/stream-web.js'),
};

const CSS_INTEROP_RUNTIME_SHIMS = {
  'react-native-css-interop/jsx-runtime': path.resolve(
    resolvePnpmPackageRuntime('react-native-css-interop', 'dist/runtime/jsx-runtime.js'),
  ),
  'react-native-css-interop/jsx-dev-runtime': path.resolve(
    resolvePnpmPackageRuntime('react-native-css-interop', 'dist/runtime/jsx-dev-runtime.js'),
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // A. Asset & Metadata Bypass
  // This allows .json and .wasm to use Metro's native loaders directly.
  if (moduleName.endsWith('.json') || moduleName.endsWith('.wasm')) {
    return (defaultResolveRequest || context.resolveRequest)(context, moduleName, platform);
  }

  if (moduleName === '@repo/workforce/WorkforceShell') {
    return {
      filePath: path.resolve(workspaceRoot, 'packages/workforce/src/WorkforceShell.tsx'),
      type: 'sourceFile',
    };
  }

  // B. (Removed) Manual Internal Resolver
  // Logic moved to dynamic extraNodeModules mapping for native 'exports' support.

  // C. Universal Shims (The Firewall)
  for (const shimKey in UNIVERSAL_SHIMS) {
    if (moduleName === shimKey || moduleName.startsWith(`${shimKey}/`)) {
      console.log(`[Metro-Firewall] 🛡️ UNIVERSAL Intercept: ${moduleName} -> ${shimKey}`);
      return { filePath: UNIVERSAL_SHIMS[shimKey], type: 'sourceFile' };
    }
  }

  for (const shimKey in CSS_INTEROP_RUNTIME_SHIMS) {
    if (moduleName === shimKey || moduleName.startsWith(`${shimKey}/`)) {
      console.log(`[Metro-Firewall] 🛡️ CSS Interop Intercept: ${moduleName} -> ${shimKey}`);
      return {
        filePath: CSS_INTEROP_RUNTIME_SHIMS[shimKey],
        type: 'sourceFile',
      };
    }
  }

  // D. Web-Only Shims
  if (platform === 'web') {
    for (const shimKey in WEB_SHIMS) {
      if (moduleName === shimKey || moduleName.startsWith(`${shimKey}/`)) {
        console.log(`[Metro-Firewall] 🛡️ WEB Intercept: ${moduleName} -> ${shimKey}`);
        return { filePath: WEB_SHIMS[shimKey], type: 'sourceFile' };
      }
    }
  }

  // Delegate to original/default resolver for everything else
  return (defaultResolveRequest || context.resolveRequest)(context, moduleName, platform);
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

// 8. Condition Names & Priority
// We prefer CJS ('require') over ESM ('import') to avoid getter conflicts
// in modern packages like i18next and tanstack/react-query.
config.resolver.unstable_conditionNames = isWeb
  ? ['browser', 'require', 'default']
  : ['react-native', 'require', 'default'];

// 9. Source Extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// 10. Main Field Priority
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, {
  input: '../../packages/ui/src/global.css',
  configPath: path.resolve(__dirname, 'tailwind.config.js'),
});
