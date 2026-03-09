import fs from 'fs';
import path from 'path';

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
    '@react-native-ml-kit/text-recognition',
    '@react-native-ml-kit/barcode-scanning',
    'react-native-mmkv',
    'react-native-nitro-modules',
    'react-native-worklets',
    'react-native-get-random-values',
    'react-native-url-polyfill/auto',
    '@react-native-community/netinfo',
    '@shopify/react-native-skia'
];

// Read metro.config.js to find what's already shimmed
const workspaceRoot = process.cwd();
const metroConfigPath = path.join(workspaceRoot, 'apps/gurudevi-mobile/metro.config.js');
let shimmedPackages = [];

if (fs.existsSync(metroConfigPath)) {
    const metroContent = fs.readFileSync(metroConfigPath, 'utf8');
    // Basic regex to find keys in WEB_SHIMS object
    const webShimsMatch = metroContent.match(/const WEB_SHIMS = {([\s\S]*?)};/);
    if (webShimsMatch) {
        const lines = webShimsMatch[1].split('\n');
        lines.forEach(line => {
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

// Recursively find .ts, .tsx files
function walkFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist')) {
                walkFiles(filePath, fileList);
            }
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const sourceFiles = [
    ...walkFiles(path.join(workspaceRoot, 'apps/gurudevi-mobile/src')),
    ...walkFiles(path.join(workspaceRoot, 'packages/core/src')),
    ...walkFiles(path.join(workspaceRoot, 'packages/ui/src')),
    ...walkFiles(path.join(workspaceRoot, 'packages/library/src')),
    ...walkFiles(path.join(workspaceRoot, 'packages/self/src')),
    ...walkFiles(path.join(workspaceRoot, 'packages/classroom/src')),
    ...walkFiles(path.join(workspaceRoot, 'packages/community/src')),
];

let foundLeaks = false;

sourceFiles.forEach(file => {
    // We only care about files that COULD be loaded on web.
    // .native.tsx, .ios.tsx, .android.tsx are safe.
    if (file.endsWith('.native.tsx') || file.endsWith('.native.ts') || file.endsWith('.ios.tsx') || file.endsWith('.android.tsx')) {
        return;
    }

    const content = fs.readFileSync(file, 'utf8');

    // Regex logic slightly simplified. Match `import ... from 'package'` or `require('package')`
    packagesWithNativeDeps.forEach(pkg => {
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
    console.log(`\x1b[90mIf you are still seeing 'Unknown module' errors, the issue might be:\x1b[0m`);
    console.log(`\x1b[90m1. A transitive dependency (a library you installed requires another native library).\x1b[0m`);
    console.log(`\x1b[90m2. A dynamic require() where the string path is not statically analyzable.\x1b[0m`);
    console.log(`\x1b[90m3. Missing Expo web platform support packages.\x1b[0m`);
}
