import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [bundlePath, sourcemapPath, reportPath] = process.argv.slice(2);

if (!bundlePath || !sourcemapPath || !reportPath) {
  console.error(
    'Usage: node scripts/report-mobile-bundle-packages.mjs <bundle> <sourcemap> <report>',
  );
  process.exit(2);
}

if (!existsSync(bundlePath) || !existsSync(sourcemapPath)) {
  const report = {
    status: 'missing',
    bundle: { path: path.resolve(bundlePath), bytes: 0 },
    sourcemap: { path: path.resolve(sourcemapPath), bytes: 0 },
    modules: 0,
    packages: [],
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const sourceMap = JSON.parse(readFileSync(sourcemapPath, 'utf8'));
const sources = Array.isArray(sourceMap.sources) ? sourceMap.sources : [];
const contents = Array.isArray(sourceMap.sourcesContent) ? sourceMap.sourcesContent : [];

function packageName(source) {
  const normalized = source.replaceAll('\\', '/');
  const pnpmMatch = normalized.match(/node_modules\/.pnpm\/([^/]+)\/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (pnpmMatch) return pnpmMatch[2];

  const nodeModulesMatch = normalized.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (nodeModulesMatch) return nodeModulesMatch[1];

  const workspaceMatch = normalized.match(/(?:^|\/)packages\/([^/]+)/);
  if (workspaceMatch) return `workspace:${workspaceMatch[1]}`;

  return 'app';
}

const packageStats = new Map();
let sourceBytes = 0;

for (let index = 0; index < sources.length; index += 1) {
  const content = typeof contents[index] === 'string' ? contents[index] : '';
  const bytes = Buffer.byteLength(content, 'utf8');
  sourceBytes += bytes;

  const name = packageName(sources[index]);
  const current = packageStats.get(name) ?? { name, modules: 0, sourceBytes: 0 };
  current.modules += 1;
  current.sourceBytes += bytes;
  packageStats.set(name, current);
}

const packages = [...packageStats.values()]
  .map((entry) => ({
    ...entry,
    estimatedSourceShare: sourceBytes ? Number((entry.sourceBytes / sourceBytes).toFixed(4)) : 0,
  }))
  .sort((left, right) => right.sourceBytes - left.sourceBytes);

const report = {
  status: 'ready',
  generatedAt: new Date().toISOString(),
  bundle: { path: path.resolve(bundlePath), bytes: statSync(bundlePath).size },
  sourcemap: { path: path.resolve(sourcemapPath), bytes: statSync(sourcemapPath).size },
  modules: sources.length,
  sourceBytes,
  note: 'sourceBytes and estimatedSourceShare are attribution estimates from Metro sourcesContent, not minified output sizes',
  packages,
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, packages: packages.slice(0, 30) }, null, 2));
