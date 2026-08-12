import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const rootPackageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
);
const workspaceRoot = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const output = execFileSync(
  pnpm,
  ['exec', 'expo-modules-autolinking', 'resolve', '--platform', 'android', '--json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], shell: process.platform === 'win32' },
);
const resolved = JSON.parse(output);
const modules = new Map(resolved.modules.map((module) => [module.packageName, module]));

const errors = [];

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

if (loaderVersion && !/^57\.0\./.test(loaderVersion)) {
  errors.push(`unimodules-app-loader: expected Expo 57, resolved ${loaderVersion}`);
}
if (taskManager?.packageVersion && !/^57\.0\./.test(taskManager.packageVersion)) {
  errors.push(`expo-task-manager: expected Expo 57, resolved ${taskManager.packageVersion}`);
}

const nativeExpoModules = [...modules.entries()].filter(
  ([name]) => name === 'expo' || name.startsWith('expo-'),
);
for (const [name, module] of nativeExpoModules) {
  if (module.packageVersion && /^56\./.test(module.packageVersion)) {
    errors.push(`${name}: stale SDK 56 native module ${module.packageVersion}`);
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

console.log('PASS: Expo native graph is aligned to one SDK 57 patch line.');
