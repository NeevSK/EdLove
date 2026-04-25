#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const keyword = process.argv[2];
if (!keyword) {
    console.error('Usage: node scaffold-feature-context.mjs <keyword>');
    process.exit(1);
}

const ROOT = process.cwd();
const searchPaths = [
    'packages/core/src/logic',
    'packages/ui/src',
    'packages/database/zenstack',
    'apps'
].filter(p => fs.existsSync(path.join(ROOT, p)));

console.log(`🔍 Shiny Scouting feature context for: "${keyword}"`);

let matches = [];

searchPaths.forEach(sp => {
    try {
        // Use rg -l to list files with matches. This is lightning fast.
        const cmd = `rg -l -i "${keyword}" "${path.join(ROOT, sp)}" -g "**.ts" -g "**.tsx" -g "**.mjs" -g "**.js" -g "**.json" -g "**.zmodel" --glob "!node_modules" --glob "!dist" --glob "!.turbo"`;
        const output = execSync(cmd, { encoding: 'utf-8' });
        const files = output.split('\n').filter(f => f.trim());
        matches = matches.concat(files.map(f => ({
            file: path.relative(ROOT, f),
            type: path.extname(f)
        })));
    } catch (e) {
        // rg returns 1 if no matches, which is fine
    }
});

// Deduplicate and group
const grouped = matches.reduce((acc, match) => {
    const parts = match.file.split(path.sep);
    const domain = parts[0] === 'packages' ? parts[1] : parts[0];
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(match.file);
    return acc;
}, {});

console.log('\n--- 🗺️  Context Map ---');
Object.entries(grouped).forEach(([domain, files]) => {
    console.log(`\n## Domain: ${domain}`);
    [...new Set(files)].slice(0, 10).forEach(f => console.log(`- [ ] ${f}`));
    if (files.length > 10) console.log(`  ... and ${files.length - 10} more files.`);
});

if (matches.length === 0) {
    console.log('\nNo existing context found. You are starting with a blank canvas! 🎨');
}
