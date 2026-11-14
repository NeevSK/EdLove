import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const symbols = [
  'auth',
  'authz',
  'community',
  'deepLink',
  'deviceIdentity',
  'educational',
  'featureFlags',
  'growth',
  'identity',
  'notification',
  'profile',
  'pushNotification',
  'cryptoManager',
  'DeepLinkType',
];

function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.expo', 'dist', 'build', '.turbo', '.git'].includes(entry.name)) continue;
      checkDir(full);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('@repo/core/logic')) {
        for (const s of symbols) {
          // match import { ... s ... } from '@repo/core/logic'
          const importMatch = new RegExp(`import\\s*\\{[^}]*\\b${s}\\b[^}]*\\}\\s*from\\s*['"]@repo/core/logic['"]`).test(content);
          if (importMatch) {
            console.log(`MATCH: "${s}" imported in ${path.relative(ROOT_DIR, full)}`);
          }
        }
      }
    }
  }
}

console.log('--- Checking apps/gurudevi-web ---');
checkDir(path.join(ROOT_DIR, 'apps/gurudevi-web'));

console.log('--- Checking apps/gurudevi-mobile ---');
checkDir(path.join(ROOT_DIR, 'apps/gurudevi-mobile'));

console.log('--- Checking apps/sanctuary-api ---');
checkDir(path.join(ROOT_DIR, 'apps/sanctuary-api'));

console.log('--- Checking packages (excluding packages/core) ---');
for (const p of fs.readdirSync(path.join(ROOT_DIR, 'packages'), { withFileTypes: true })) {
  if (p.isDirectory() && p.name !== 'core') {
    checkDir(path.join(ROOT_DIR, 'packages', p.name));
  }
}
