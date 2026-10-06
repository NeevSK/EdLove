import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['apps', 'packages'].map((directory) => path.join(root, directory));
const sourceExtensions = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const ignoredDirectories = new Set([
  'node_modules',
  'dist',
  'dist-dev',
  '.expo',
  '.turbo',
  '.vercel',
  'archives',
  'coverage',
  'android',
  'ios',
  '.gradle',
  'build',
  '.git',
  '.next',
  'powersync',
  'rust-lab',
]);

function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];

  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...filesIn(absolute));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

const violations = [];
for (const file of sourceRoots.flatMap(filesIn)) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative.includes('/__tests__/') || relative.includes('/__mocks__/')) continue;

  const content = fs.readFileSync(file, 'utf8');
  const runtimeContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  if (/\bEffect\.promise\s*\(/.test(runtimeContent)) {
    violations.push(`${relative}: use Effect.tryPromise instead of Effect.promise`);
  }

  if (relative.startsWith('apps/gurudevi-mobile/') && /from ['"]effect['"]/.test(runtimeContent)) {
    violations.push(`${relative}: keep Effect imports inside packages/core, not mobile UI`);
  }

  if (
    relative.startsWith('packages/core/src/logic/') &&
    !relative.includes('/__tests__/') &&
    /\bEffect\.runPromise\s*\(/.test(runtimeContent)
  ) {
    violations.push(`${relative}: expose an Effect workflow and run it at the Promise boundary`);
  }
}

if (violations.length > 0) {
  console.error('❌ Effect boundary violations found:');
  for (const violation of violations) console.error(`   - ${violation}`);
  process.exit(1);
}

console.log('✅ Effect source hygiene is enforced: no Effect.promise usage in runtime source.');
