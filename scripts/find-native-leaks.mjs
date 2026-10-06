import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { resolveFdCommand } from './lib/fd-resolver.mjs';

// Known native-only packages across our monorepo that require shims for web
const KNOWN_NATIVE_PACKAGES = [
  'expo-av',
  'expo-video',
  'expo-audio',
  'expo-sqlite',
  'expo-file-system',
  'expo-sharing',
  'expo-haptics',
  'expo-camera',
  'expo-image-picker',
  'expo-location',
  'expo-secure-store',
  'expo-application',
  'expo-device',
  'expo-updates',
  '@sentry/react-native',
  'posthog-react-native',
  'react-native-mmkv',
  'react-native-nitro-modules',
  'react-native-worklets',
  'react-native-get-random-values',
  'react-native-url-polyfill/auto',
  '@react-native-community/netinfo',
  '@shopify/react-native-skia',
];

// Read metro.config.js to find what's already shimmed
const workspaceRoot = process.cwd();

const metroConfigPath = path.join(workspaceRoot, 'apps/gurudevi-mobile/metro.config.js');
const shimmedPackages = [];

if (fs.existsSync(metroConfigPath)) {
  const metroContent = fs.readFileSync(metroConfigPath, 'utf8');
  // Basic regex to find keys in WEB_SHIMS object
  const webShimsMatch = metroContent.match(/const WEB_SHIMS = {([\s\S]*?)};/);
  if (webShimsMatch) {
    const lines = webShimsMatch[1].split('\n');
    lines.forEach((line) => {
      const keyMatch = line.match(/^\s*'([^']+)'\s*:/);
      if (keyMatch) {
        shimmedPackages.push(keyMatch[1]);
      }
    });
  }
}

console.log(`\x1b[36mFound ${shimmedPackages.length} shimmed packages in metro.config.js\x1b[0m`);

// Read package.json files to see what dependencies exist that might be native
const packagesWithNativeDeps = new Set(KNOWN_NATIVE_PACKAGES);

function getSourceFiles(dirs) {
  const allFiles = [];

  // Try to use fd first
  try {
    const fdCmd = resolveFdCommand();
    if (!fdCmd) throw new Error('fd not available');

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) return;
      const cmd = `${fdCmd} -t f -e ts -e tsx -e js -e jsx . "${dir}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      allFiles.push(...output.split('\n').filter((f) => f.trim()));
    });
    return allFiles;
  } catch (_e) {
    // Fallback: Native Node.js recursive walker
    console.log('>>> fd not found, falling back to native file walker...');

    function walk(dir) {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else {
          if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            allFiles.push(fullPath);
          }
        }
      });
    }

    dirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        walk(dir);
      }
    });
    return allFiles;
  }
}

const sourceFiles = getSourceFiles([
  path.join(workspaceRoot, 'apps/gurudevi-mobile/src'),
  path.join(workspaceRoot, 'packages/core/src'),
  path.join(workspaceRoot, 'packages/ui/src'),
  path.join(workspaceRoot, 'packages/library/src'),
  path.join(workspaceRoot, 'packages/self/src'),
  path.join(workspaceRoot, 'packages/classroom/src'),
  path.join(workspaceRoot, 'packages/community/src'),
]);

let foundLeaks = false;

sourceFiles.forEach((file) => {
  // We only care about files that COULD be loaded on web.
  // .native.tsx, .ios.tsx, .android.tsx are safe.
  if (
    file.endsWith('.native.tsx') ||
    file.endsWith('.native.ts') ||
    file.endsWith('.ios.tsx') ||
    file.endsWith('.android.tsx')
  ) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');

  // Regex logic slightly simplified. Match `import ... from 'package'` or `require('package')`
  packagesWithNativeDeps.forEach((pkg) => {
    const importRegex = new RegExp(`from\\s+['"]${pkg}['"]|require\\(['"]${pkg}['"]\\)`, 'g');
    if (importRegex.test(content)) {
      // Is it shimmed?
      if (!shimmedPackages.includes(pkg)) {
        // If it's a .web.tsx file, maybe it's safe? No, .web.tsx is strictly for web, it SHOULD NOT import native stuff.
        console.log(`\n\x1b[31m🚨 NATIVE LEAK DETECTED\x1b[0m`);
        console.log(`File: \x1b[33m${path.relative(workspaceRoot, file)}\x1b[0m`);
        console.log(`Imports native-only package: \x1b[31m${pkg}\x1b[0m`);
        console.log(`\x1b[90m➜ This package is NOT listed in WEB_SHIMS in metro.config.js\x1b[0m`);
        foundLeaks = true;
      }
    }
  });
});

if (!foundLeaks) {
  console.log(`\n\x1b[32m✅ No unshimmed native imports found in web-capable files!\x1b[0m`);
  console.log(
    `\x1b[90mIf you are still seeing 'Unknown module' errors, the issue might be:\x1b[0m`,
  );
  console.log(
    `\x1b[90m1. A transitive dependency (a library you installed requires another native library).\x1b[0m`,
  );
  console.log(
    `\x1b[90m2. A dynamic require() where the string path is not statically analyzable.\x1b[0m`,
  );
  console.log(`\x1b[90m3. Missing Expo web platform support packages.\x1b[0m`);
}
