import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const workspaceRoot = path.resolve(appRoot, '../..');
const uiRoot = path.join(workspaceRoot, 'packages/ui');
const libraryRoot = path.join(workspaceRoot, 'packages/library');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const readText = (file) => fs.readFileSync(file, 'utf8');
const appPackage = readJson(path.join(appRoot, 'package.json'));
const uiPackage = readJson(path.join(uiRoot, 'package.json'));
const libraryPackage = readJson(path.join(libraryRoot, 'package.json'));
const metro = readText(path.join(appRoot, 'metro.config.js'));
const globalCss = readText(path.join(uiRoot, 'src/global.css'));
const gluestackConfig = readJson(path.join(uiRoot, 'gluestack-ui.json'));
const postcssConfigPath = path.join(appRoot, 'postcss.config.mjs');
const workspaceConfig = readText(path.join(workspaceRoot, 'pnpm-workspace.yaml'));

const errors = [];
const warnings = [];

const dependency = (pkg, name) => pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
const sameDependency = (name) => {
  const appVersion = dependency(appPackage, name);
  const uiVersion = dependency(uiPackage, name);
  if (!appVersion || !uiVersion) {
    errors.push(`${name} must be declared in both gurudevi-mobile and @repo/ui`);
    return;
  }
  if (appVersion !== uiVersion) {
    errors.push(`${name} differs: app=${appVersion}, ui=${uiVersion}`);
  }
};

const productDependency = (pkg, packageName, name) => {
  const version = dependency(pkg, name);
  if (!version) errors.push(`${packageName} must declare ${name}`);
  return version;
};

for (const name of ['nativewind', 'react-native-css', 'react-native-css-interop', 'tailwindcss']) {
  sameDependency(name);
}

for (const [name, expected] of [
  ['nativewind', '5.0.0-preview.4'],
  ['tailwindcss', '4.3.0'],
]) {
  for (const [packageName, pkg] of [
    ['gurudevi-mobile', appPackage],
    ['@repo/ui', uiPackage],
    ['@repo/library', libraryPackage],
  ]) {
    const version = productDependency(pkg, packageName, name);
    if (version && version !== expected) {
      errors.push(`${packageName} ${name} must be pinned to ${expected}; found ${version}`);
    }
  }
}

if (dependency(appPackage, 'tailwindcss') !== '4.3.0') {
  errors.push(
    'gurudevi-mobile runtime Tailwind CSS must remain pinned to 4.3.0 during bridge hardening',
  );
}

if (appPackage.devDependencies?.tailwindcss) {
  warnings.push(
    `app has a second Tailwind declaration in devDependencies: ${appPackage.devDependencies.tailwindcss}`,
  );
}

if (gluestackConfig.engine !== 'nativewind') {
  errors.push(`gluestack-ui.json engine changed unexpectedly: ${gluestackConfig.engine}`);
}

for (const [label, source, required] of [
  ['Metro NativeWind wrapper', metro, 'withNativewind'],
  ['Metro CSS interop runtime shim', metro, 'react-native-css-interop/jsx-runtime'],
  ['Shared global CSS theme import', globalCss, '@import "tailwindcss/theme.css"'],
  ['Shared NativeWind theme import', globalCss, '@import "nativewind/theme"'],
]) {
  if (!source.includes(required)) {
    errors.push(`${label} is missing required marker: ${required}`);
  }
}

if (!fs.existsSync(postcssConfigPath)) {
  errors.push('postcss.config.mjs is missing from the Expo app');
} else if (!readText(postcssConfigPath).includes('@tailwindcss/postcss')) {
  errors.push('postcss.config.mjs does not register @tailwindcss/postcss');
}

if (!/^(?:\s*)lightningcss:\s*['"]1\.30\.1['"]\s*$/m.test(workspaceConfig)) {
  errors.push('pnpm-workspace.yaml must pin lightningcss to 1.30.1 for NativeWind v5');
}

const webCssDir = path.join(appRoot, 'dist/_expo/static/css');
if (fs.existsSync(webCssDir)) {
  const cssFiles = fs.readdirSync(webCssDir).filter((name) => name.endsWith('.css'));
  const cssBytes = cssFiles.reduce(
    (total, name) => total + fs.statSync(path.join(webCssDir, name)).size,
    0,
  );
  if (cssFiles.length > 0 && cssBytes === 0) {
    errors.push('latest Expo Web export contains CSS files but all CSS artifacts are empty');
  }
}

const componentRoots = [
  path.join(uiRoot, 'src/components/ui'),
  path.join(uiRoot, 'src/components-legacy'),
];
let cssInteropCount = 0;
let cssInteropRegistrationCount = 0;
for (const root of componentRoots) {
  if (!fs.existsSync(root)) continue;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const source = readText(fullPath);
        cssInteropCount += (source.match(/cssInterop/g) ?? []).length;
        cssInteropRegistrationCount += (source.match(/cssInterop\s*\(/g) ?? []).length;
      }
    }
  }
}

warnings.push(
  `cssInterop textual references remain in source-owned components: ${cssInteropCount}; actual registrations: ${cssInteropRegistrationCount}`,
);

const productSourceRoots = [
  path.join(uiRoot, 'src/components/ui'),
  path.join(libraryRoot, 'src'),
  path.join(appRoot, 'src'),
];
for (const root of productSourceRoots) {
  if (!fs.existsSync(root)) continue;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const source = readText(fullPath);
        if (/cssInterop\s*\(/.test(source)) {
          errors.push(
            `product source still registers cssInterop: ${path.relative(workspaceRoot, fullPath)}`,
          );
        }
      }
    }
  }
}
console.log('  Lightning CSS policy: root pnpm override -> 1.30.1');

console.log('Style-stack hardening audit');
console.log(`  app NativeWind: ${dependency(appPackage, 'nativewind')}`);
console.log(`  ui  NativeWind: ${dependency(uiPackage, 'nativewind')}`);
console.log(`  app react-native-css: ${dependency(appPackage, 'react-native-css')}`);
console.log(`  ui  react-native-css: ${dependency(uiPackage, 'react-native-css')}`);
console.log(`  legacy cssInterop package: ${dependency(appPackage, 'react-native-css-interop')}`);
console.log(`  cssInterop textual references: ${cssInteropCount}`);
console.log(`  cssInterop registrations: ${cssInteropRegistrationCount}`);

for (const warning of warnings) console.log(`  WARN: ${warning}`);
for (const error of errors) console.error(`  ERROR: ${error}`);

if (errors.length) {
  console.error(`\nFAIL: ${errors.length} hardening invariant(s) failed.`);
  process.exitCode = 1;
} else {
  console.log(
    '\nPASS: bridge invariants are aligned; reported debt still requires deliberate follow-up.',
  );
}
