import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const workspaceRoot = process.cwd();

// Use fd for lightning-fast file discovery
function getSourceFiles() {
    const searchDirs = [
        'apps/gurudevi-mobile/src',
        'packages/core/src',
        'packages/ui/src',
        'packages/library/src',
        'packages/self/src',
        'packages/classroom/src',
        'packages/community/src',
    ].filter(dir => fs.existsSync(path.join(workspaceRoot, dir)));

    let allFiles = [];
    searchDirs.forEach(dir => {
        try {
            // Find .ts, .tsx, .js, .jsx files, exclude platform-specific ones (.native, .ios, .android)
            const cmd = `fd -t f -e ts -e tsx -e js -e jsx -E "*.native.*" -E "*.ios.*" -E "*.android.*" . "${path.join(workspaceRoot, dir)}"`;
            const output = execSync(cmd, { encoding: 'utf-8' });
            allFiles = allFiles.concat(output.split('\n').filter(f => f.trim()));
        } catch (e) {
            console.error(`Error searching in ${dir}: ${e.message}`);
        }
    });
    return allFiles;
}

const sourceFiles = getSourceFiles();
const allExternalImports = new Set();
const importMap = {}; // pkg -> [files]

console.log(`>>> Auditing imports in ${sourceFiles.length} web-capable source files...`);

// Use ripgrep to find all imports in bulk - much faster than iterating in Node!
sourceFiles.forEach(file => {
    try {
        // Find lines matching import/require patterns
        const cmd = `rg "from\\s+['\\"]([^./][^'\\"]+)['\\"]|require\\(['\\"]([^./][^'\\"]+)['\\"]\\)" --only-matching --no-line-number "${file}"`;
        const output = execSync(cmd, { encoding: 'utf-8' });
        const matches = output.split('\n').filter(m => m.trim());
        
        matches.forEach(match => {
            // Extract the package name from the match (e.g., "from 'pkg'" -> "pkg")
            let pkg = match.replace(/from\s+['"]|require\(['"]|['"]\)/g, '').trim();
            if (!pkg) return;

            let basePkg = pkg;
            if (pkg.startsWith('@')) {
                const parts = pkg.split('/');
                basePkg = parts.slice(0, 2).join('/');
            } else {
                basePkg = pkg.split('/')[0];
            }

            allExternalImports.add(basePkg);
            const relPath = path.relative(workspaceRoot, file);
            if (!importMap[basePkg]) importMap[basePkg] = new Set();
            importMap[basePkg].add(relPath);
        });
    } catch (e) {
        // rg returns exit code 1 if no matches found, which execSync treats as error
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

console.log(`\n\x1b[36mAudit Report: ${allExternalImports.size} unique external packages analyzed\x1b[0m`);

const potentialLeaks = [];
allExternalImports.forEach(pkg => {
    if (shimmedPackages.includes(pkg)) return;
    if (WEB_SAFE_PACKAGES.includes(pkg)) return;

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
    console.log(`\n\x1b[32m✅ No obvious native leaks found!\x1b[0m`);
}
