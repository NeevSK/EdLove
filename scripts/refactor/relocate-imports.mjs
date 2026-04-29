/**
 * Polymath - Import Relocation Codemod
 *
 * Usage: node relocate-imports.mjs --from @repo/core --to @repo/ui --include "packages/classroom"
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const from = args[args.indexOf('--from') + 1];
const to = args[args.indexOf('--to') + 1];
const include = args[args.indexOf('--include') + 1] || '.';

if (!from || !to) {
  console.error('Usage: node relocate-imports.mjs --from <old-path> --to <new-path>');
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), include);

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      relocateImportsInFile(fullPath);
    }
  }
}

function relocateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Regex for: import { ... } from 'from'; or import ... from 'from';
  // Matches internal package imports
  const importRegex = new RegExp(`from ['"]${from}['"]`, 'g');
  content = content.replace(importRegex, `from '${to}'`);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated imports in ${path.relative(process.cwd(), filePath)}`);
  }
}

console.log(`🚀 Relocating imports from ${from} to ${to} in ${targetDir}...`);
processDirectory(targetDir);
console.log('✨ All done.');
