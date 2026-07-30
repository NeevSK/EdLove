import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowlist = new Set([
  path.normalize(path.join(root, 'packages', 'ui', 'src', 'lucide-shims.d.ts')),
]);
const filePattern = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const matches = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === '.expo' ||
      entry.name === '.tmp' ||
      entry.name === 'archives'
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!filePattern.test(entry.name)) continue;
    const normalized = path.normalize(full);
    if (normalized.includes(`${path.sep}docs${path.sep}`)) continue;
    if (allowlist.has(normalized)) continue;
    const text = fs.readFileSync(full, 'utf8');
    if (text.includes('lucide-react-native/dist/esm/icons/')) {
      matches.push(path.relative(root, full));
      continue;
    }
    if (
      (text.includes("from 'lucide-react-native'") ||
        text.includes('from "lucide-react-native"')) &&
      normalized !== path.normalize(path.join(root, 'packages', 'ui', 'src', 'icons.native.ts'))
    ) {
      matches.push(path.relative(root, full));
    }
  }
}

for (const candidate of ['apps', 'packages']) {
  const dir = path.join(root, candidate);
  if (fs.existsSync(dir)) walk(dir);
}

if (matches.length > 0) {
  console.error('Direct Lucide imports found outside the icon bridge:');
  for (const file of matches) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log('Icon bridge contract verified.');
