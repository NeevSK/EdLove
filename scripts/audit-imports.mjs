import fs from 'fs';
import path from 'path';

const workspaceRoot = process.cwd();

// Regex to find external imports (not starting with . or /)
const importRegex = /from\s+['"]([^./][^'"]+)['"]|require\(['"]([^./][^'"]+)['"]\)/g;

function walkFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist') && !filePath.includes('.expo')) {
                walkFiles(filePath, fileList);
            }
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            // Skip platform-specific files that are NOT web-capable
            if (!filePath.endsWith('.native.tsx') && !filePath.endsWith('.native.ts') && !filePath.endsWith('.ios.tsx') && !filePath.endsWith('.android.tsx')) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

const sourceFiles = [
    path.join(workspaceRoot, 'apps/gurudevi-mobile/src'),
    path.join(workspaceRoot, 'packages/core/src'),
    path.join(workspaceRoot, 'packages/ui/src'),
    path.join(workspaceRoot, 'packages/library/src'),
    path.join(workspaceRoot, 'packages/self/src'),
    path.join(workspaceRoot, 'packages/classroom/src'),
    path.join(workspaceRoot, 'packages/community/src'),
].filter(dir => fs.existsSync(dir)).flatMap(dir => walkFiles(dir));

const allExternalImports = new Set();
const importMap = {}; // pkg -> [files]

sourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const pkg = match[1] || match[2];
        // Only care about the base package name (e.g., 'expo-location/build/Location' -> 'expo-location')
        // Special case for scoped packages: '@org/pkg/path' -> '@org/pkg'
        let basePkg = pkg;
        if (pkg.startsWith('@')) {
            const parts = pkg.split('/');
            basePkg = parts.slice(0, 2).join('/');
        } else {
            basePkg = pkg.split('/')[0];
        }

        allExternalImports.add(basePkg);
        if (!importMap[basePkg]) importMap[basePkg] = new Set();
        importMap[basePkg].add(path.relative(workspaceRoot, file));
    }
});

// Read metro.config.js to find what's already shimmed
const metroConfigPath = path.join(workspaceRoot, 'apps/gurudevi-mobile/metro.config.js');
let shimmedPackages = [];
if (fs.existsSync(metroConfigPath)) {
    const metroContent = fs.readFileSync(metroConfigPath, 'utf8');
    const webShimsMatch = metroContent.match(/const WEB_SHIMS = {([\s\S]*?)};/);
    if (webShimsMatch) {
        const lines = webShimsMatch[1].split('\n');
        lines.forEach(line => {
            const keyMatch = line.match(/^\s*'([^']+)'\s*:/);
            if (keyMatch) shimmedPackages.push(keyMatch[1]);
        });
    }
}

// Known web-safe packages (incomplete, but helps filter noise)
const WEB_SAFE_PACKAGES = [
    'react', 'react-dom', 'react-native-web', 'react-i18next', 'i18next',
    'lucide-react-native', '@repo/ui', '@repo/core', '@repo/library', '@repo/self',
    '@repo/classroom', '@repo/community', '@repo/profile', '@repo/scanner-kit',
    '@tanstack/react-query', 'zustand', 'date-fns', 'lodash', 'axios',
    '@react-navigation/native', '@react-navigation/native-stack', '@react-navigation/bottom-tabs',
    'expo-router', 'expo-constants', 'expo-linking', 'expo-status-bar', 'expo-font',
    'expo-asset', 'expo-image', 'expo-blur', 'expo-linear-gradient', 'expo-clipboard',
    'expo-localization', 'expo-web-browser', 'expo-auth-session',
    'react-native-reanimated', 'react-native-gesture-handler', 'react-native-safe-area-context',
    'react-native-screens', 'react-native-svg', '@gluestack-ui/themed', '@gluestack-style/react',
    '@gluestack-ui/config', 'buffer', 'uuid', 'inline-style-prefixer', 'jsqr', 'qrcode', 'jpeg-js'
];

console.log(`\n\x1b[36mAudit Report: ${allExternalImports.size} unique external packages imported in web-capable files\x1b[0m`);

const potentialLeaks = [];

allExternalImports.forEach(pkg => {
    if (shimmedPackages.includes(pkg)) return;
    if (WEB_SAFE_PACKAGES.includes(pkg)) return;

    // Additional heuristics: 
    // - Starts with expo- and not in WEB_SAFE
    // - starts with react-native- and not in WEB_SAFE
    // - contains 'native' in name
    if (pkg.startsWith('expo-') || pkg.startsWith('react-native-') || pkg.includes('native') || pkg.startsWith('@react-native')) {
        potentialLeaks.push(pkg);
    }
});

if (potentialLeaks.length > 0) {
    console.log(`\n\x1b[31m🚨 POTENTIAL NATIVE LEAKS DETECTED (${potentialLeaks.length})\x1b[0m`);
    potentialLeaks.sort().forEach(pkg => {
        console.log(`\nPackage: \x1b[33m${pkg}\x1b[0m`);
        console.log(`Used in:`);
        Array.from(importMap[pkg]).slice(0, 5).forEach(file => {
            console.log(`  - ${file}`);
        });
        if (importMap[pkg].size > 5) {
            console.log(`  - ... and ${importMap[pkg].size - 5} more files`);
        }
    });
} else {
    console.log(`\n\x1b[32m✅ No obvious native leaks found! (Checked against web-safe list and current shims)\x1b[0m`);
}
