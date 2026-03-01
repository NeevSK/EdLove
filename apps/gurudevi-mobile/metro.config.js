const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Note: babel.config.js sets `unstable_transformImportMeta: true` in
// babel-preset-expo.  This is required because zustand@5 (and similar
// packages) ship pre-compiled code that uses `import.meta.env.MODE` for
// dev/prod detection.  Metro serves the web bundle as a classic <script>
// (no type="module"), so any bare `import.meta` reference causes:
//   SyntaxError: Cannot use 'import.meta' outside a module
// The babel option rewrites every `import.meta` → `globalThis.__ExpoImportMetaRegistry`,
// which Expo's winter runtime initialises before the app boots.
const config = getSentryExpoConfig(projectRoot, { isCSSEnabled: true });

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
config.resolver.disableHierarchicalLookup = false;

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
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
    '@react-native-async-storage/async-storage': path.resolve(projectRoot, 'node_modules/@react-native-async-storage/async-storage'),
};

// 6. Web-only shims: redirect native-only packages to no-op web implementations
//    when Metro is bundling for the 'web' platform.
//    This allows App.tsx and packages to import these packages unconditionally
//    while keeping the web bundle free of native bridge calls.
//
//    Shim files live in src/shims/ and mirror the subset of the API used in
//    this codebase. If you add a new usage of a shimmed package, update the
//    matching shim file in src/shims/.
const WEB_SHIMS = {
    '@sentry/react-native': path.resolve(projectRoot, 'src/shims/sentry-web.js'),
    'posthog-react-native': path.resolve(projectRoot, 'src/shims/posthog-web.js'),
    'react-native-get-random-values': path.resolve(projectRoot, 'src/shims/get-random-values-web.js'),
    'react-native-url-polyfill/auto': path.resolve(projectRoot, 'src/shims/url-polyfill-web.js'),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web' && moduleName in WEB_SHIMS) {
        return { filePath: WEB_SHIMS[moduleName], type: 'sourceFile' };
    }
    // If a previous resolver was registered (e.g. by another Expo plugin), delegate
    // to it first so its logic is preserved.
    // Otherwise fall through to context.resolveRequest — Metro's own built-in resolver.
    // NOTE: context.resolveRequest is NOT this function; it is Metro's internal default
    // resolver so calling it here is safe and will NOT recurse.
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
config.resolver.unstable_conditionNames = ['browser', 'require', 'default'];

module.exports = config;
