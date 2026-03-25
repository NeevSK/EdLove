import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');

/**
 * List of modules that are considered "native" and should not be imported
 * directly in .web.tsx or .web.ts files unless they are properly shimmed
 * or are part of the allowed list.
 */
const FORBIDDEN_NATIVE_IMPORTS = [
    'react-native', // We should check which components are used.
    'expo-file-system',
    'expo-sharing',
    'expo-sqlite',
    'expo-av',
    'expo-video',
    'expo-audio',
    'expo-haptics',
    'expo-device',
    'expo-image-picker',
    'expo-location',
    'expo-secure-store',
    'expo-application',
    'expo-updates',
    'react-native-mmkv',
    'react-native-nitro-modules',
    '@react-native-community/netinfo',
    '@shopify/react-native-skia',
    '@sentry/react-native',
    'posthog-react-native',
    'react-native-get-random-values',
    'react-native-url-polyfill',
    '@react-native-ml-kit/text-recognition',
    '@react-native-ml-kit/barcode-scanning',
];

/**
 * Components from react-native that ARE allowed on web (via react-native-web).
 */
const ALLOWED_RN_COMPONENTS = [
    'View', 'Text', 'StyleSheet', 'TouchableOpacity', 'TouchableWithoutFeedback',
    'ScrollView', 'FlatList', 'TextInput', 'Image', 'ActivityIndicator',
    'Platform', 'Dimensions', 'Animated', 'PixelRatio', 'Pressable'
];

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const leaks = [];

    // Simple regex for imports: import ... from 'module' or require('module')
    const importRegex = /(?:import\s+.*\s+from\s+['"](.*)['"]|require\(['"](.*)['"]\))/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const moduleName = match[1] || match[2];
        if (!moduleName) continue;

        if (FORBIDDEN_NATIVE_IMPORTS.some(forbidden => moduleName === forbidden || moduleName.startsWith(forbidden + '/'))) {
            // Special case for react-native: check if only allowed components are imported
            if (moduleName === 'react-native') {
                const rnMatch = /import\s+\{(.*)\}\s+from\s+['"]react-native['"]/.exec(match[0]);
                if (rnMatch) {
                    const components = rnMatch[1].split(',').map(c => c.trim().split(/\s+as\s+/)[0]);
                    const forbiddenComponents = components.filter(c => !ALLOWED_RN_COMPONENTS.includes(c));
                    if (forbiddenComponents.length > 0) {
                        leaks.push(`react-native (${forbiddenComponents.join(', ')})`);
                    }
                } else {
                    // Default export or wildcard import is suspicious
                    leaks.push(`react-native (full import)`);
                }
            } else {
                leaks.push(moduleName);
            }
        }
    }

    return leaks;
}

function findWebFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            if (item !== 'node_modules' && item !== '.expo' && item !== 'dist') {
                findWebFiles(fullPath, files);
            }
        } else if (fullPath.endsWith('.web.tsx') || fullPath.endsWith('.web.ts')) {
            files.push(fullPath);
        }
    }
    return files;
}

console.log('🔍 Scanning for native leaks in .web files...');
const webFiles = findWebFiles(SRC_ROOT);
let totalLeaks = 0;

webFiles.forEach(file => {
    const leaks = checkFile(file);
    if (leaks.length > 0) {
        const relativePath = path.relative(PROJECT_ROOT, file);
        console.log(`❌ ${relativePath}:`);
        leaks.forEach(leak => console.log(`   - ${leak}`));
        totalLeaks += leaks.length;
    }
});

if (totalLeaks === 0) {
    console.log('✅ No native leaks found! Your web sanctuary is pure. 🌿');
    process.exit(0);
} else {
    console.log(`\nFound ${totalLeaks} potential native leak(s).`);
    process.exit(1);
}
