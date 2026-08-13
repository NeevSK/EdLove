import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = existsSync(path.join(process.cwd(), 'pnpm-workspace.yaml'))
  ? process.cwd()
  : path.resolve(process.cwd(), '../..');
const appDir = path.join(repoRoot, 'apps', 'gurudevi-mobile');
const outputDir = path.join(appDir, 'reports', 'route-bundles');
const fixtures = [
  ['community-feed', 'app/(tabs)/community/index.tsx'],
  ['community-chat', 'app/(tabs)/community/direct-messages.tsx'],
  ['classroom-overview', 'app/(tabs)/workspace/classroom/index.tsx'],
  ['library-browse', 'app/(tabs)/library/index.tsx'],
];

mkdirSync(outputDir, { recursive: true });
const results = [];

for (const [name, entryFile] of fixtures) {
  const tempDir = path.join(os.tmpdir(), `gurudevi-route-${name}`);
  mkdirSync(tempDir, { recursive: true });
  const bundle = path.join(tempDir, `${name}.android.bundle`);
  const map = path.join(tempDir, `${name}.android.bundle.map`);

  try {
    execFileSync(
      process.platform === 'win32' ? 'pnpm' : 'pnpm',
      [
        '--filter',
        'gurudevi-mobile',
        'exec',
        'expo',
        'export:embed',
        '--platform',
        'android',
        '--entry-file',
        entryFile,
        '--dev',
        'false',
        '--minify',
        'true',
        '--bundle-output',
        bundle,
        '--sourcemap-output',
        map,
      ],
      { cwd: repoRoot, env: { ...process.env, NODE_ENV: 'production', EXPO_NO_DOCTOR: '1' }, stdio: 'inherit', shell: process.platform === 'win32' },
    );

    const sourceMap = JSON.parse(readFileSync(map, 'utf8'));
    results.push({
      name,
      entryFile,
      status: 'ready',
      modules: sourceMap.sources?.length ?? 0,
      bundleBytes: statSync(bundle).size,
      sourcemapBytes: statSync(map).size,
    });
  } catch (error) {
    results.push({ name, entryFile, status: 'failed', error: String(error) });
  }
}

const report = { generatedAt: new Date().toISOString(), fixtures: results };
const reportPath = path.join(outputDir, 'route-bundle-report.json');
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (!existsSync(reportPath)) process.exitCode = 1;
