import fs from 'node:fs';
import path from 'node:path';

const targetPkg = process.argv[2] || 'packages/scanner-kit';
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (['node_modules', 'dist', '.git', '.turbo', '.next'].includes(ent.name)) continue;
      walk(path.join(dir, ent.name));
    } else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
      files.push(path.join(dir, ent.name));
    }
  }
}

walk(targetPkg);

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /from\s+['"](@repo\/ui(?:\/[^'"]*)?)['"]/g;
  let match;
  const found = [];
  while ((match = regex.exec(content)) !== null) {
    found.push(match[1]);
  }
  if (found.length > 0) {
    console.log(f.replace(/\\/g, '/'), found);
  }
}
