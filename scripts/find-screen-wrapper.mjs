import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.turbo', '.next'].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) files = files.concat(walk(p));
    else if (/\.(tsx?|jsx?)$/.test(f.name)) files.push(p);
  }
  return files;
}

const targets = walk('.').filter(p => {
  const c = fs.readFileSync(p, 'utf8');
  return c.includes('ScreenWrapper');
});
console.log('Found', targets.length, 'files importing or mentioning ScreenWrapper:');
targets.forEach(t => console.log(' ', t));
