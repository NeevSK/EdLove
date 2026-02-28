const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot, { isCSSEnabled: true });

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
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web' && moduleName in WEB_SHIMS) {
        return { filePath: WEB_SHIMS[moduleName], type: 'sourceFile' };
    }
    // Fall through to the previously registered resolver (if any), then to
    // Metro's built-in default via context.resolveRequest.
    // NOTE: context.resolveRequest is Metro's own internal resolver and does NOT
    // point back to this function — calling it is safe and will not recurse.
    if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
