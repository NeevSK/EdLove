import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

console.log(`\x1b[36m>>> Shiny Auditing Package Architecture: ${targetPackage}\x1b[0m`);

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

// 2. Logic Separation & Platform Agnosticism using ripgrep
console.log('\n--- Boundary Violation Check (Logic vs UI) ---');

const srcDir = path.join(pkgBase, 'src');
if (fs.existsSync(srcDir)) {
    // Check Logic files for UI leaks - using shell-safe patterns
    try {
        const logicPattern = '{logic,services,utils}';
        // Simplified pattern for shell safety
        const uiImportMatch = 'from.*(components|screens|ui)';
        const cmd = `rg "${uiImportMatch}" "${srcDir}" -g "**/$logicPattern/**" -g "**.ts" -g "**.tsx" --with-filename`;
        const output = execSync(cmd, { encoding: 'utf-8' });
        output.split('\n').filter(l => l.trim()).forEach(line => {
            console.log(`❌ [LOGIC -> UI] ${line}`);
        });
    } catch (e) { /* No matches */ }

    // Check Logic files for Native pollution
    try {
        const logicPattern = '{logic,services,utils}';
        const nativeImportMatch = 'from.*(react-native|expo-)';
        const cmd = `rg "${nativeImportMatch}" "${srcDir}" -g "**/$logicPattern/**" -g "**.ts" -g "**.tsx" --with-filename`;
        const output = execSync(cmd, { encoding: 'utf-8' });
        output.split('\n').filter(l => l.trim()).forEach(line => {
             console.log(`❌ [NATIVE POLLUTION] ${line}`);
        });
    } catch (e) { /* No matches */ }
} else {
    console.log('⚠️  src/ folder not found.');
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
