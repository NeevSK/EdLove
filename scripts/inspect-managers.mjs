import fs from 'node:fs';
import path from 'node:path';

const dir = 'packages/core/src/logic/managers';
const files = fs.readdirSync(dir);
console.log('Files in packages/core/src/logic/managers:', files);

files.forEach(f => {
  const fullPath = path.join(dir, f);
  if (fs.statSync(fullPath).isDirectory()) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n=== ${f} (${lines.length} lines) ===`);
  console.log(lines.slice(0, 25).join('\n'));
});
