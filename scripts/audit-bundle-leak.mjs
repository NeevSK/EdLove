#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const heavyLibs = [
    'lucide-react', // Often causes bloat if not tree-shaken
    'recharts',
    'lodash',       // If not using lodash-es
    'moment',
    'framer-motion',
    'react-native-svg' // Leaky to web if not careful
];

const sleekPackages = ['@repo/core', '@repo/form-builder', '@repo/mcp-client'];

console.log('📦 Auditing Bundle Leakage (Transitive Bloat)...');

const results = [];

function checkDir(dir, pkgName) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['node_modules', 'dist'].includes(entry.name)) continue;
            checkDir(fullPath, pkgName);
        } else if (entry.isFile() && /\.(ts|tsx|js)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            heavyLibs.forEach(lib => {
                if (content.includes(`from '${lib}'`) || content.includes(`from "${lib}"`)) {
                    results.push({
                        package: pkgName,
                        file: path.relative(ROOT, fullPath),
                        leak: lib
                    });
                }
            });
        }
    }
}

sleekPackages.forEach(pkg => {
    const pkgPath = path.join(ROOT, 'packages', pkg.replace('@repo/', ''));
    if (fs.existsSync(pkgPath)) {
        checkDir(pkgPath, pkg);
    }
});

if (results.length === 0) {
    console.log('✅ Bundle Health: EXCELLENT. No heavy transitive leaks detected in sleek packages.');
} else {
    console.log(`\n⚠️  Found ${results.length} potential bundle leaks:\n`);
    results.forEach(r => {
        console.log(`[BLOAT] ${r.package} -> ${r.file} includes "${r.leak}"`);
    });
    console.log('\nRecommendation: Use subpath exports or dynamic imports for these heavy libraries.');
}
