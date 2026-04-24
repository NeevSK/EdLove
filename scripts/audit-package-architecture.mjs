import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const targetPackage = process.argv[2];

if (!targetPackage) {
    console.error('Please specify a package path (e.g. packages/core).');
    process.exit(1);
}

const pkgBase = path.join(ROOT_DIR, targetPackage);
const pkgJsonPath = path.join(pkgBase, 'package.json');

if (!fs.existsSync(pkgJsonPath)) {
    console.error(`Package.json not found at ${pkgJsonPath}`);
    process.exit(1);
}

console.log(`\x1b[36m>>> Auditing Package Architecture: ${targetPackage}\x1b[0m`);

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

// 1. Check Subpath Exports
console.log('\n--- Subpath Exports Check ---');
if (pkgJson.exports) {
    console.log('✅ Exports map found.');
    const subpaths = Object.keys(pkgJson.exports);
    console.log(`   Found ${subpaths.length} subpaths: ${subpaths.join(', ')}`);
} else {
    console.log('❌ No "exports" map found in package.json. Tree-shaking may be suboptimal.');
}

// 2. Logic Separation & Platform Agnosticism
console.log('\n--- Boundary Violation Check (Logic vs UI) ---');

function scanDirectory(dir) {
    const results = {
        logicFiles: [],
        uiFiles: [],
        violations: []
    };

    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir, { recursive: true });
    
    for (const file of files) {
        const fullPath = path.join(dir, file.toString());
        if (!fs.statSync(fullPath).isFile()) continue;
        if (!file.toString().match(/\.(ts|tsx)$/)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativeFile = path.relative(pkgBase, fullPath);

        const isLogic = relativeFile.includes('logic/') || relativeFile.includes('services/') || relativeFile.includes('utils/');
        const isUI = relativeFile.includes('components/') || relativeFile.includes('screens/') || relativeFile.includes('ui/');

        if (isLogic) {
            // Check if logic imports UI
            if (content.match(/from\s+['"].*?(components|screens|ui).*?['"]/)) {
                results.violations.push(`[LOGIC -> UI] ${relativeFile}: Logic file imports UI component.`);
            }
            // Check if logic imports native-only
            if (content.match(/from\s+['"](react-native|expo-.*?)['"]/)) {
                results.violations.push(`[NATIVE POLLUTION] ${relativeFile}: Pure logic file imports native-only module.`);
            }
        }
    }
    return results;
}

const auditResults = scanDirectory(path.join(pkgBase, 'src'));

if (auditResults.violations.length > 0) {
    auditResults.violations.forEach(v => console.log(`❌ ${v}`));
} else {
    console.log('✅ No obvious boundary violations found in src/ folder.');
}

console.log('\n--- Tree-Shaking Hygiene ---');
const srcIndex = path.join(pkgBase, 'src', 'index.ts');
if (fs.existsSync(srcIndex)) {
    const content = fs.readFileSync(srcIndex, 'utf-8');
    if (content.match(/export\s+\*\s+from/)) {
        console.log('⚠️  Wildcard exports found in src/index.ts. Consider named exports for better tree-shaking.');
    } else {
        console.log('✅ Explicit exports found in root barrel file.');
    }
}
