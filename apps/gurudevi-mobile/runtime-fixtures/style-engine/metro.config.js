const path = require('node:path');
const fs = require('node:fs');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../../../../');
const appRoot = path.resolve(projectRoot, '../..');
const config = getDefaultConfig(projectRoot);
const uiSourceRoot = path.join(workspaceRoot, 'packages', 'ui', 'src');

// The fixture is deliberately outside the app package, so Metro cannot use
// pnpm's normal workspace symlink traversal. Recreate the app's deterministic
// fallback mapping for this disposable renderer fixture instead of adding
// fixture-only dependencies to production package manifests.
const pnpmFallbacks = {};
const internalPackages = {};
for (const packageDir of fs.readdirSync(path.join(workspaceRoot, 'packages'))) {
  const packageRoot = path.join(workspaceRoot, 'packages', packageDir);
  const packageJsonPath = path.join(packageRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) continue;
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.name) internalPackages[packageJson.name] = packageRoot;
}
const pnpmRoot = path.join(workspaceRoot, 'node_modules', '.pnpm');
for (const storeEntry of fs.readdirSync(pnpmRoot)) {
  const storeNodeModules = path.join(pnpmRoot, storeEntry, 'node_modules');
  if (!fs.existsSync(storeNodeModules)) continue;
  for (const packageEntry of fs.readdirSync(storeNodeModules)) {
    if (packageEntry.startsWith('@')) {
      const scopeRoot = path.join(storeNodeModules, packageEntry);
      if (!fs.statSync(scopeRoot).isDirectory()) continue;
      for (const scopedPackage of fs.readdirSync(scopeRoot)) {
        const packagePath = path.join(scopeRoot, scopedPackage);
        if (fs.statSync(packagePath).isDirectory()) {
          pnpmFallbacks[`${packageEntry}/${scopedPackage}`] = packagePath;
        }
      }
    } else {
      const packagePath = path.join(storeNodeModules, packageEntry);
      if (fs.statSync(packagePath).isDirectory()) pnpmFallbacks[packageEntry] = packagePath;
    }
  }
}

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.join(appRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  ...pnpmFallbacks,
  ...internalPackages,
  '@repo/ui': path.join(workspaceRoot, 'packages', 'ui'),
  react: path.join(appRoot, 'node_modules', 'react'),
  'react-native': path.join(appRoot, 'node_modules', 'react-native'),
  'react-native-web': path.join(appRoot, 'node_modules', 'react-native-web'),
  'tailwindcss-safe-area': path.join(
    workspaceRoot,
    'node_modules',
    '.pnpm',
    'tailwindcss-safe-area@1.3.0_tailwindcss@4.3.0',
    'node_modules',
    'tailwindcss-safe-area',
  ),
  '@react-native/normalize-colors': path.join(
    workspaceRoot,
    'node_modules',
    '.pnpm',
    '@react-native+normalize-colors@0.74.89',
    'node_modules',
    '@react-native',
    'normalize-colors',
  ),
  fbjs: path.join(
    workspaceRoot,
    'node_modules',
    '.pnpm',
    'fbjs@3.0.5',
    'node_modules',
    'fbjs',
  ),
  'postcss-value-parser': path.join(
    workspaceRoot,
    'node_modules',
    '.pnpm',
    'postcss-value-parser@4.2.0',
    'node_modules',
    'postcss-value-parser',
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@repo/')) {
    const separator = moduleName.indexOf('/', '@repo/'.length);
    const packageName = separator === -1 ? moduleName : moduleName.slice(0, separator);
    const relativePath = separator === -1 ? '' : moduleName.slice(separator + 1);
    const packageRoot = internalPackages[packageName];
    const sourceRoot = packageRoot && path.join(packageRoot, 'src');
    const basePath = sourceRoot && path.join(sourceRoot, relativePath);
    if (!basePath) return (defaultResolveRequest || context.resolveRequest)(context, moduleName, platform);
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.jsx`,
      path.join(basePath, 'index.ts'),
      path.join(basePath, 'index.tsx'),
      path.join(basePath, 'index.js'),
      path.join(basePath, 'index.jsx'),
    ];
    const filePath = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (filePath) return { filePath, type: 'sourceFile' };
  }
  return (defaultResolveRequest || context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativewind(config);
