import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const rootPackageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
);
const appRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const appRequire = createRequire(path.join(appRoot, 'package.json'));
const workspaceRoot = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const expoModulesAutolinkingPackage = appRequire.resolve('expo-modules-autolinking/package.json', {
  paths: [path.join(appRoot, 'node_modules/expo')],
});
const output = execFileSync(
  process.execPath,
  [
    path.join(path.dirname(expoModulesAutolinkingPackage), 'bin/expo-modules-autolinking.js'),
    'resolve',
    '--platform',
    'android',
    '--json',
  ],
  { cwd: appRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
);
const resolved = JSON.parse(output);
const modules = new Map(resolved.modules.map((module) => [module.packageName, module]));
const reactNativeConfig = JSON.parse(
  execFileSync(
    process.execPath,
    [path.join(appRoot, 'node_modules/react-native/cli.js'), 'config'],
    { cwd: appRoot, encoding: 'utf8' },
  ),
);
const androidNativeModules = Object.entries(reactNativeConfig.dependencies).filter(
  ([, dependency]) => dependency.platforms?.android?.sourceDir,
);
const expoDeclaration = packageJson.dependencies?.expo ?? packageJson.devDependencies?.expo;
const expectedSdkMajor = Number(String(expoDeclaration).match(/\d+/)?.[0]);
if (!Number.isInteger(expectedSdkMajor)) {
  throw new Error(`Unable to determine Expo SDK major from app declaration: ${expoDeclaration}`);
}

const errors = [];

for (const [name] of androidNativeModules) {
  if (!packageJson.dependencies?.[name]) {
    errors.push(`${name}: Android native module must be a direct mobile app dependency`);
  }
}

if (!reactNativeConfig.dependencies['@maplibre/maplibre-react-native']?.platforms?.android) {
  errors.push('@maplibre/maplibre-react-native: missing Android autolinking configuration');
}

const manifestFiles = [];
const walkForManifests = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('dist'))
      continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkForManifests(fullPath);
    else if (entry.isFile() && entry.name === 'package.json') manifestFiles.push(fullPath);
  }
};
walkForManifests(workspaceRoot);

for (const manifestFile of manifestFiles) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  } catch {
    continue;
  }
  const packageName = manifest.name ?? path.relative(workspaceRoot, manifestFile);
  for (const section of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    for (const [name, version] of Object.entries(manifest[section] ?? {})) {
      if (!/^(@expo\/|expo(?:-|$)|eslint-config-expo$)/.test(name)) continue;
      if (/^(?:[~^=\s]*)56\./.test(String(version))) {
        errors.push(`${packageName}: stale SDK 56 Expo declaration ${name}@${version}`);
      }
    }
  }
}

const appVersion = (name) =>
  packageJson.dependencies?.[name]?.replace(/^[~^=]/, '') ??
  packageJson.devDependencies?.[name]?.replace(/^[~^=]/, '') ??
  rootPackageJson.dependencies?.[name]?.replace(/^[~^=]/, '') ??
  rootPackageJson.devDependencies?.[name]?.replace(/^[~^=]/, '') ??
  null;
const moduleVersion = (name) => modules.get(name)?.packageVersion ?? null;

for (const name of ['expo', 'expo-task-manager', 'expo-background-task', 'expo-modules-core']) {
  const declared = appVersion(name);
  const resolvedVersion = moduleVersion(name);
  if (!declared) errors.push(`${name}: missing direct app dependency`);
  if (!resolvedVersion) errors.push(`${name}: missing from Android autolinking output`);
  if (
    declared &&
    resolvedVersion &&
    declared.split('.').slice(0, 2).join('.') !== resolvedVersion.split('.').slice(0, 2).join('.')
  ) {
    errors.push(`${name}: app declares ${declared}, autolinking resolves ${resolvedVersion}`);
  }
}

const loader = modules.get('unimodules-app-loader');
const taskManager = modules.get('expo-task-manager');
const loaderVersion = loader?.packageVersion ?? null;
const taskManagerPackage = taskManager?.projects?.[0]?.sourceDir;
if (!loaderVersion) errors.push('unimodules-app-loader: missing from Android autolinking output');
if (!taskManagerPackage) errors.push('expo-task-manager: missing Android source project');

if (loaderVersion && Number(loaderVersion.split('.')[0]) !== expectedSdkMajor) {
  errors.push(
    `unimodules-app-loader: expected Expo SDK ${expectedSdkMajor}, resolved ${loaderVersion}`,
  );
}
if (
  taskManager?.packageVersion &&
  Number(taskManager.packageVersion.split('.')[0]) !== expectedSdkMajor
) {
  errors.push(
    `expo-task-manager: expected Expo SDK ${expectedSdkMajor}, resolved ${taskManager.packageVersion}`,
  );
}

const nativeExpoModules = [...modules.entries()].filter(
  ([name]) => name === 'expo' || name.startsWith('expo-'),
);
for (const [name, module] of nativeExpoModules) {
  if (
    module.packageVersion &&
    Number(module.packageVersion.split('.')[0]) !== expectedSdkMajor
  ) {
    errors.push(
      `${name}: expected Expo SDK ${expectedSdkMajor}, resolved ${module.packageVersion}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      expo: moduleVersion('expo'),
      taskManager: moduleVersion('expo-task-manager'),
      backgroundTask: moduleVersion('expo-background-task'),
      modulesCore: moduleVersion('expo-modules-core'),
      appLoader: loaderVersion,
      nativeExpoModuleCount: nativeExpoModules.length,
      androidReactNativeModuleCount: androidNativeModules.length,
      maplibreAndroidAutolinked: Boolean(
        reactNativeConfig.dependencies['@maplibre/maplibre-react-native']?.platforms?.android,
      ),
    },
    null,
    2,
  ),
);

if (errors.length) {
  console.error('Expo native graph audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`PASS: Expo native graph is aligned to SDK ${expectedSdkMajor}.`);
