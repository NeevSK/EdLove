const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativewind } = require('nativewind/metro');
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

function resolvePnpmPackageRoot(packageName) {
  const pnpmRoot = path.resolve(workspaceRoot, 'node_modules/.pnpm');
  const pkgDir = fs
    .readdirSync(pnpmRoot)
    .find((entry) => entry.startsWith(`${packageName.replace('/', '+')}@`));

  if (!pkgDir) {
    throw new Error(`Unable to locate ${packageName} in pnpm store at ${pnpmRoot}`);
  }

  return path.resolve(pnpmRoot, pkgDir, 'node_modules', packageName);
}

// Note: babel.config.js sets `unstable_transformImportMeta: true` in
// babel-preset-expo.  This is required because zustand@5 (and similar
// packages) ship pre-compiled code that uses `import.meta.env.MODE` for
// dev/prod detection.  Metro serves the web bundle as a classic <script// (no type="module"), so any bare `import.meta` reference causes:
//   SyntaxError: Cannot use 'import.meta' outside a module
// The babel option rewrites every `import.meta` \u2192 `globalThis.__ExpoImportMetaRegistry`,
// autumn Expo's winter runtime initialises before the app boots.
const config = getSentryExpoConfig(projectRoot, { isCSSEnabled: true });

// Expo CLI resolves the dynamic app config before Metro starts its transform
// workers. On some Windows + pnpm + Doppler runs, those workers do not inherit
// the two public variables even though `expo config --json` resolved them
// correctly. Re-hydrate the worker environment from the already-resolved
// public Expo config so babel-preset-expo can inline both the web manifest and
// direct EXPO_PUBLIC_* references. These are public client values; private
// service credentials must never be placed here.
const { getConfig: getExpoConfig } = require('expo/config');
const { exp: resolvedExpoConfig } = getExpoConfig(projectRoot, {
  skipSDKVersionRequirement: true,
});
const publicRuntime = resolvedExpoConfig.extra?.publicRuntime;
const publicRuntimePath = path.join(projectRoot, '.expo', 'gurudevi-public-runtime.json');
// Never let a previous interrupted build supply configuration to a new one.
if (!publicRuntime?.supabaseUrl || !publicRuntime?.supabasePublishableKey) {
  // expo-doctor evaluates this config statically without Doppler env vars.
  // Only block actual Metro bundle/serve runs, not the doctor health check.
  const isExpoDoctor = process.argv.some((arg) => arg.includes('expo-doctor'));
  if (isExpoDoctor) {
    console.warn(
      '[metro.config] Supabase runtime config missing — expected when running expo-doctor without Doppler. Skipping env rehydration.',
    );
  } else {
    throw new Error(
      'Missing public Supabase runtime config during Metro setup. Run the app/export through Doppler with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    );
  }
} else {
  process.env.EXPO_PUBLIC_SUPABASE_URL = publicRuntime.supabaseUrl;
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = publicRuntime.supabasePublishableKey;
  fs.mkdirSync(path.dirname(publicRuntimePath), { recursive: true });
  const publicRuntimeContents = JSON.stringify({
    supabaseUrl: publicRuntime.supabaseUrl,
    supabasePublishableKey: publicRuntime.supabasePublishableKey,
  });
  if (!fs.existsSync(publicRuntimePath) || fs.readFileSync(publicRuntimePath, 'utf8') !== publicRuntimeContents) {
    fs.writeFileSync(publicRuntimePath, publicRuntimeContents, 'utf8');
  }
}
process.once('exit', () => {
  try {
    fs.rmSync(publicRuntimePath, { force: true });
  } catch {
    // Best-effort cleanup; the next Metro setup removes stale generated data.
  }
});

// Add support for WASM files (required by expo-sqlite on web)
config.resolver.assetExts.push('wasm');

// 1. Use Metro's fallback watcher on Windows. Watchman's subscription startup
//    can hang on this workspace, leaving Metro's dependency graph incomplete
//    and causing every device bundle request to fail with HTTP 500.
config.useWatchman = false;
// Expo SDK 57 resolves external workspace files on demand. Pre-crawling the
// entire packages directory exceeds Metro's watcher startup window on Windows.
// Shared-package edits require a Metro restart until a reliable narrow-watch
// policy is established, but bundle resolution remains available.
config.watchFolders = [];
config.resetCache = false;
config.maxWorkers = 2;





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
  // The workspace root is watched for internal packages, but Git metadata
  // contains ephemeral Codex checkpoint refs that can disappear while Metro
  // is registering filesystem watchers.
  /(?:^|[/\\])\.git(?:[/\\]|$)/,
  /packages[/\\].*[/\\]node_modules[/\\]react[/\\].*/,
  /packages[/\\].*[/\\]node_modules[/\\]react-native[/\\].*/,
  /packages[/\\].*[/\\]node_modules[/\\]@react-native-async-storage[/\\].*/,
  /apps[/\\].*[/\\]node_modules[/\\]\.vite[/\\].*/,
  /apps[/\\].*[/\\]\.expo[/\\].*/,
];

const SINGLETON_OVERRIDES = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  nativewind: path.resolve(projectRoot, 'node_modules/nativewind'),
  'react-native-css': path.resolve(projectRoot, 'node_modules/react-native-css'),
  'react-native-css-interop': path.resolve(projectRoot, 'node_modules/react-native-css-interop'),
  '@babel/runtime': path.resolve(projectRoot, 'node_modules/@babel/runtime'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
  // These packages are a coordinated runtime. Pin their Metro resolution to
  // the app dependency graph so the pnpm fallback scan cannot select a stale
  // transitive Worklets/Reanimated copy during a web bundle.
  'react-native-gesture-handler': path.resolve(
    projectRoot,
    'node_modules/react-native-gesture-handler',
  ),
  'react-native-reanimated': path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
  'react-native-worklets': path.resolve(projectRoot, 'node_modules/react-native-worklets'),
  'react-native-screens': path.resolve(projectRoot, 'node_modules/react-native-screens'),
  '@react-navigation/core': path.resolve(projectRoot, 'node_modules/@react-navigation/core'),
  '@react-native-async-storage/async-storage': path.resolve(
    projectRoot,
    'node_modules/@react-native-async-storage/async-storage',
  ),
  effect: path.resolve(projectRoot, 'node_modules/effect'),
  '@effect/platform': path.resolve(projectRoot, 'node_modules/@effect/platform'),
  styleq: resolvePnpmPackageRoot('styleq'),
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
  '@sentry/browser': resolvePnpmPackageRoot('@sentry/browser'),
  '@growthbook/growthbook': resolvePnpmPackageRoot('@growthbook/growthbook'),
  '@powersync/common': resolvePnpmPackageRoot('@powersync/common'),
  'fast-json-patch': resolvePnpmPackageRoot('fast-json-patch'),
  'fast-base64-decode': resolvePnpmPackageRoot('fast-base64-decode'),
  'abort-controller': resolvePnpmPackageRoot('abort-controller'),
  'event-target-shim': resolvePnpmPackageRoot('event-target-shim'),
};

// 5. Resolution is limited to the declared app graph. Scanning the entire
// pnpm store and choosing its highest version created competing runtime
// singletons and made startup depend on store history.

// Ensure react-native is a singleton on native platforms
// Expo invokes web builds as either `-p web`, `--platform web`, or
// `platform=web` depending on the command surface. The previous check only
// recognized the last form, which could make a web export resolve native
// React Native instead of React Native Web.
const isWeb =
  process.env.EXPO_PLATFORM === 'web' ||
  process.argv.some(
    (arg, index) =>
      arg === 'web' ||
      arg === '--web' ||
      arg.includes('platform=web') ||
      (arg === '-p' && process.argv[index + 1] === 'web') ||
      (arg === '--platform' && process.argv[index + 1] === 'web'),
  );
if (isWeb) {
  SINGLETON_OVERRIDES['react-native'] = path.resolve(projectRoot, 'node_modules/react-native-web');
} else {
  delete SINGLETON_OVERRIDES['react-native'];
}

const workspacePackagesDir = path.resolve(workspaceRoot, 'packages');
if (fs.existsSync(workspacePackagesDir)) {
  for (const entry of fs.readdirSync(workspacePackagesDir)) {
    const pkgJsonPath = path.join(workspacePackagesDir, entry, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.name && !SINGLETON_OVERRIDES[pkgJson.name]) {
          SINGLETON_OVERRIDES[pkgJson.name] = path.join(workspacePackagesDir, entry);
        }
      } catch {}
    }
  }
}

const candidateA11yPaths = [
  path.resolve('/home/nsk/projects/packages/a11y-gate'),
  path.resolve('C:/projects/packages/a11y-gate'),
  path.resolve(workspaceRoot, '../packages/a11y-gate'),
];
const a11yGateExternalPath = candidateA11yPaths.find((p) => fs.existsSync(p));
if (a11yGateExternalPath) {
  SINGLETON_OVERRIDES['@intuitui-labs/a11y-gate'] = a11yGateExternalPath;
  if (!config.watchFolders.includes(a11yGateExternalPath)) {
    config.watchFolders.push(a11yGateExternalPath);
  }
}

const pnpmStoreRoot = path.resolve(workspaceRoot, 'node_modules/.pnpm');
const pnpmFallbackPackageRoots = new Map();

function getPackageName(moduleName) {
  const segments = moduleName.split('/');
  return moduleName.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
}

function resolvePnpmFallbackPackageRoot(packageName) {
  if (pnpmFallbackPackageRoots.has(packageName)) {
    return pnpmFallbackPackageRoots.get(packageName);
  }

  if (!fs.existsSync(pnpmStoreRoot)) {
    return null;
  }

  const packageRoot = fs
    .readdirSync(pnpmStoreRoot)
    .map((entry) => path.resolve(pnpmStoreRoot, entry, 'node_modules', packageName))
    .find((candidate) => fs.existsSync(candidate));

  if (packageRoot && fs.existsSync(packageRoot)) {
    pnpmFallbackPackageRoots.set(packageName, packageRoot);
    return packageRoot;
  }

  return null;
}

config.resolver.extraNodeModules = {
  ...SINGLETON_OVERRIDES,
};

// 6. Platform Firewall & Deterministic Resolver
const WEB_SHIMS = {
  '@stripe/stripe-react-native': path.resolve(projectRoot, 'src/shims/stripe-web.js'),
  '@sentry/react-native': path.resolve(projectRoot, 'src/shims/sentry-web.js'),
  'posthog-react-native': path.resolve(projectRoot, 'src/shims/posthog-web.js'),
  'react-native-get-random-values': path.resolve(projectRoot, 'src/shims/get-random-values-web.js'),
  'react-native-url-polyfill/auto': path.resolve(projectRoot, 'src/shims/url-polyfill-web.js'),
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
  'react-native-svg': path.resolve(projectRoot, 'src/shims/svg-web.js'),
  'lucide-react-native': path.resolve(projectRoot, 'src/shims/lucide-react-native-web.js'),
  '@shopify/react-native-skia': path.resolve(projectRoot, 'src/shims/skia-web.js'),
  'react-native-wgpu': path.resolve(projectRoot, 'src/shims/wgpu-web.js'),
  'expo-camera': path.resolve(projectRoot, 'src/shims/expo-camera-web.js'),
  '@maplibre/maplibre-react-native': path.resolve(projectRoot, 'src/shims/maplibre-web.js'),
  '@intuitui-labs/lk-edu-geo': path.resolve(projectRoot, 'src/shims/lk-edu-geo-web.js'),
  'srilankan-postalcode-backend': path.resolve(projectRoot, 'src/shims/postalcode-backend-web.js'),
  'react-native-ease': path.resolve(projectRoot, 'src/shims/ease-web.js'),
};

const UNIVERSAL_SHIMS = {
  '@repo/database': path.resolve(projectRoot, 'src/shims/database-shim.js'),
  '@nishansanjuka/srilanka_geographics': path.resolve(
    projectRoot,
    'src/shims/srilanka-geographics-web.js',
  ),
  '@zip.js/zip.js': path.resolve(projectRoot, 'src/shims/zip-js-shim.js'),
  '@zip.js/zip.js/lib/zip.js': path.resolve(projectRoot, 'src/shims/zip-js-shim.js'),
  '@zip.js/zip.js/index.js': path.resolve(projectRoot, 'src/shims/zip-js-shim.js'),
  'zip.js': path.resolve(projectRoot, 'src/shims/zip-js-shim.js'),
  'pdfjs-dist': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
  'pdfjs-dist/build/pdf.js': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
  'pdfjs-dist/build/pdf.min.js': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
  'pdfjs-dist/build/pdf.worker.mjs': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
  'pdfjs-dist/build/pdf.worker.js': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
  'pdf-parse': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
  '@huggingface/transformers': path.resolve(projectRoot, 'src/shims/pdfjs-dist-shim.js'),
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

  // Workspace packages are mapped to their source roots below. That mapping
  // intentionally bypasses package `exports`, so resolve conditional native
  // adapters explicitly before delegating to Metro.
  if (moduleName === '@repo/core/native/webPush') {
    return {
      filePath: path.resolve(
        workspaceRoot,
        'packages/core/src/native',
        platform === 'web' ? 'webPush.web.ts' : 'webPush.native.ts',
      ),
      type: 'sourceFile',
    };
  }

  if (moduleName === '@repo/core/native/webSentryAdapter') {
    return {
      filePath: path.resolve(
        workspaceRoot,
        'packages/core/src/native',
        platform === 'web' ? 'webSentryAdapter.web.ts' : 'webSentryAdapter.native.ts',
      ),
      type: 'sourceFile',
    };
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
    if (
      moduleName === shimKey ||
      moduleName.startsWith(`${shimKey}/`) ||
      moduleName === `node:${shimKey}` ||
      moduleName.startsWith(`node:${shimKey}/`)
    ) {
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
  // NOTE: react-native -> react-native-web is handled via SINGLETON_OVERRIDES in
  // extraNodeModules (type:'package' resolution that follows the main field).
  // Do NOT intercept 'react-native' here with type:'sourceFile' pointing at a directory —
  // that causes Metro to try to SHA-1 hash a directory, crashing the bundler.
  if (platform === 'web') {
    for (const shimKey in WEB_SHIMS) {
      if (moduleName === shimKey || moduleName.startsWith(`${shimKey}/`)) {
        console.log(`[Metro-Firewall] 🛡️ WEB Intercept: ${moduleName} -> ${shimKey}`);
        return { filePath: WEB_SHIMS[shimKey], type: 'sourceFile' };
      }
    }
  }

  // Delegate to original/default resolver for everything else
  try {
    return (defaultResolveRequest || context.resolveRequest)(context, moduleName, platform);
  } catch (err) {
    const packageName = getPackageName(moduleName);
    const fallbackPackageRoot =
      !moduleName.startsWith('.') && !moduleName.startsWith('/') && !moduleName.includes(':')
        ? resolvePnpmFallbackPackageRoot(packageName)
        : null;

    if (fallbackPackageRoot) {
      return (defaultResolveRequest || context.resolveRequest)(
        {
          ...context,
          extraNodeModules: {
            ...context.extraNodeModules,
            [packageName]: fallbackPackageRoot,
          },
        },
        moduleName,
        platform,
      );
    }

    if (!moduleName.startsWith('.') && !moduleName.startsWith('/') && !moduleName.includes(':')) {
      try {
        return (defaultResolveRequest || context.resolveRequest)(
          { ...context, originModulePath: path.resolve(projectRoot, 'index.ts') },
          moduleName,
          platform,
        );
      } catch {
        // Fall through to throw original error
      }
    }
    throw err;
  }
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

module.exports = withNativewind(config);
