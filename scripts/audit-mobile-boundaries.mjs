import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const scanRoots = [
  path.join(repoRoot, 'apps', 'gurudevi-mobile'),
  path.join(repoRoot, 'packages'),
  path.join(repoRoot, 'scripts'),
];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const errors = [];
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (
      ['node_modules', '.git', 'dist', 'archives', 'docs', 'android', 'ios', 'trube-art'].includes(
        entry.name,
      )
    ) {
      continue;
    }
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(fullPath);
  }
}

for (const root of scanRoots) walk(root);

const clientBoundary = /(?:from|import\(|require\()\s*['"]@repo\/core\/api['"]/g;
const featureRootBoundary = /(?:from|import\(|require\()\s*['"]@repo\/(community|classroom|library|profile|self|ai|admin)['"]/g;
const serverBoundary = /(?:from|import\(|require\()\s*['"]@repo\/core\/api\/server['"]/g;
const relativeJsonImport = /(?:from|require\()\s*['"](\.[^'"]+\.json)['"]/g;

for (const file of files) {
  const relative = path.relative(repoRoot, file);
  const contents = readFileSync(file, 'utf8');

  if (clientBoundary.test(contents)) {
    errors.push(`${relative}: imports the removed broad @repo/core/api barrel; use /api/client or a domain entry point`);
  }
  clientBoundary.lastIndex = 0;

  const isMobileActiveSource = relative.startsWith('apps\\gurudevi-mobile\\app\\') ||
    relative.startsWith('apps\\gurudevi-mobile\\src\\');
  const isCompatibilityTest = relative.includes('apps\\gurudevi-mobile\\src\\__tests__\\architecture\\');
  if (isMobileActiveSource && !isCompatibilityTest && featureRootBoundary.test(contents)) {
    errors.push(`${relative}: active mobile source imports a broad feature root; use a capability entry point`);
  }
  featureRootBoundary.lastIndex = 0;

  const isServerSource = relative.startsWith('packages\\core\\src\\api\\handlers\\');
  if (!isServerSource && serverBoundary.test(contents)) {
    errors.push(`${relative}: imports server-only @repo/core/api/server from a client-capable source tree`);
  }
  serverBoundary.lastIndex = 0;

  let match;
  while ((match = relativeJsonImport.exec(contents))) {
    const assetPath = path.resolve(path.dirname(file), match[1]);
    if (!existsSync(assetPath)) errors.push(`${relative}: missing runtime asset ${match[1]}`);
  }
  relativeJsonImport.lastIndex = 0;
}

if (errors.length) {
  console.error('Mobile boundary audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`PASS: mobile boundaries and relative JSON assets are valid (${files.length} files scanned).`);
