import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();

// Find all package.json files
const files = execSync('fd -g "**/package.json"', { encoding: 'utf8' })
  .split('\n')
  .map(f => f.trim())
  .filter(f => f && !f.includes('node_modules'));

console.log(`Found ${files.length} package.json files.`);

for (const file of files) {
  const fullPath = path.join(root, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Pattern 1: Legacy powershell wrapper
  // "lint": "powershell -File ../../scripts/audit-wrapper.ps1 -Cmd \"pnpm exec eslint .\" -Log \"reports/lint.txt\""
  content = content.replace(/powershell -File (?:\.\.\/)*scripts\/audit-wrapper\.ps1 -Cmd \\"(.*?)\\" -Log \\".*?\\"/g, '$1');

  // Pattern 2: Corrupted replacement from previous attempt
  // "lint": "\"pnpm exec eslint .\"\"reports/lint.txt\""
  content = content.replace(/\\"(.*?)\\"\\"reports\/.*?\.txt\\"/g, '$1');

  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${file}`);
  }
}
