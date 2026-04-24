import fs from 'node:fs';
import path from 'node:path';

/**
 * Polymath Monorepo - Import Normalizer
 * Logic:
 * 1. Discover all packages in packages/* and apps/*
 * 2. Map relative paths to @repo/* aliases
 * 3. Replace in .ts/.tsx files
 * 4. Special Rule: Prevent circular barrel imports (a package importing from itself)
 */

const ROOT = process.cwd();
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetInput = args.filter(a => !a.startsWith('--'))[0] || '.';
const targetPath = path.isAbsolute(targetInput) ? targetInput : path.join(ROOT, targetInput);

console.error(`>>> Normalizing Imports in: ${targetPath}${isDryRun ? ' (DRY RUN)' : ''}`);

// 1. Discover packages
function getWorkspaces() {
    const workspaces = [];
    const pkgDirs = ['packages', 'apps'];
    
    for (const dirName of pkgDirs) {
        const fullDir = path.join(ROOT, dirName);
        if (!fs.existsSync(fullDir)) continue;
        
        const entries = fs.readdirSync(fullDir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            
            const pkgPath = path.join(fullDir, entry.name);
            const pkgJsonPath = path.join(pkgPath, 'package.json');
            
            if (fs.existsSync(pkgJsonPath)) {
                const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                workspaces.push({
                    name: pkgJson.name,
                    path: pkgPath,
                    alias: pkgJson.name.startsWith('@repo/') ? pkgJson.name : null
                });
            }
        }
    }
    return workspaces;
}

const workspaces = getWorkspaces();
const aliasToPath = new Map();
workspaces.forEach(w => {
    if (w.alias) aliasToPath.set(w.alias, w.path);
});

// 2. Scan and fix files
function walk(dir, callback) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            if (file.name !== 'node_modules' && !file.name.startsWith('.')) {
                walk(fullPath, callback);
            }
        } else if (/\.(ts|tsx)$/.test(file.name)) {
            callback(fullPath);
        }
    }
}

let changedCount = 0;

walk(targetPath, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Detect which package this file belongs to
    const currentPkg = workspaces.find(w => filePath.startsWith(w.path));

    // Handle relative imports to @repo/* aliases
    // Pattern: from '../packages/core/...' or from '../../packages/core'
    const relativeToAliasRegex = /from\s+['"](\.\.?\/)+(?:packages|apps)\/([^'"]+)['"]/g;
    content = content.replace(relativeToAliasRegex, (match, dots, relativePath) => {
        const parts = relativePath.split('/');
        const pkgName = parts[0];
        const subPath = parts.slice(1).join('/');
        
        const fullAlias = `@repo/${pkgName}`;
        const workspace = workspaces.find(w => w.name === fullAlias);
        
        if (workspace) {
            changed = true;
            return `from '${fullAlias}${subPath ? '/' + subPath : ''}'`;
        }
        return match;
    });

    // Special Rule: Prevent a package from importing its own barrel
    // Example: in packages/core/src/logic/foo.ts, "import { x } from '@repo/core'" is circular at runtime if not careful
    if (currentPkg && currentPkg.alias) {
        const selfImportRegex = new RegExp(`from\\s+['"]${currentPkg.alias}(/[^'"]*)?['"]`, 'g');
        if (selfImportRegex.test(content)) {
            // Check if this file IS the index. If it is, self-barrel import is a definite no-no for internal files.
            // If it's NOT the index, it should use relative paths to siblings to avoid cycles.
            content = content.replace(selfImportRegex, (match, subPath) => {
                const isIndex = filePath.endsWith('index.ts') || filePath.endsWith('index.tsx');
                if (!isIndex) {
                    console.error(`[Circular Danger] File ${path.relative(ROOT, filePath)} imports from own package barrel '${currentPkg.alias}'.`);
                    // We don't auto-fix this easily without knowing the EXACT relative path, but we flag it.
                }
                return match;
            });
        }
    }

    if (changed) {
        if (!isDryRun) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.error(`✅ Normalized: ${path.relative(ROOT, filePath)}`);
        } else {
            console.error(`🔍 [DRY RUN] Would normalize: ${path.relative(ROOT, filePath)}`);
        }
        changedCount++;
    }
});

console.log(`\nImport normalization complete.`);
console.log(`Scanned: ${targetPath}`);
console.log(`Changed: ${changedCount} files.`);
