#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const keyword = process.argv[2];
if (!keyword) {
    console.error('Usage: node scaffold-feature-context.mjs <keyword>');
    process.exit(1);
}

const ROOT = process.cwd();
const searchPaths = [
    { name: 'Schemas (@repo/core)', path: 'packages/core/src/logic' },
    { name: 'Components (@repo/ui)', path: 'packages/ui/src' },
    { name: 'ZenStack Model (SSOT)', path: 'packages/database/zenstack' },
    { name: 'Services/Apps', path: 'apps' }
];

const results = {
    keyword,
    matches: []
};

function search(dir, pattern) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['node_modules', '.turbo', 'dist', 'build'].includes(entry.name)) continue;
            search(fullPath, pattern);
        } else if (entry.isFile()) {
            if (!/\.(ts|tsx|mjs|js|json|zmodel)$/.test(entry.name)) continue;
            
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes(pattern.toLowerCase())) {
                results.matches.push({
                    file: path.relative(ROOT, fullPath),
                    type: path.extname(entry.name)
                });
            }
        }
    }
}

console.log(`🔍 Scouting feature context for: "${keyword}"`);

searchPaths.forEach(sp => {
    const absPath = path.join(ROOT, sp.path);
    if (fs.existsSync(absPath)) {
        search(absPath, keyword);
    }
});

// Deduplicate and group
const grouped = results.matches.reduce((acc, match) => {
    const domain = match.file.split(path.sep)[0] === 'packages' 
        ? match.file.split(path.sep)[1] 
        : match.file.split(path.sep)[0];
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(match.file);
    return acc;
}, {});

console.log('\n--- 🗺️  Context Map ---');
Object.entries(grouped).forEach(([domain, files]) => {
    console.log(`\n## Domain: ${domain}`);
    [...new Set(files)].slice(0, 5).forEach(f => console.log(`- [ ] ${f}`));
    if (files.length > 5) console.log(`  ... and ${files.length - 5} more files.`);
});

if (results.matches.length === 0) {
    console.log('\nNo existing context found. You are starting with a blank canvas! 🎨');
}
