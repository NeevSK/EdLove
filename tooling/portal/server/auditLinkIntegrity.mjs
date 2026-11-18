import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const viewDir = path.join(rootDir, 'tooling', 'portal', 'ui', 'views');

const viewFiles = fs.readdirSync(viewDir).filter(f => f.endsWith('.js'));
let totalDataPaths = 0;
let brokenDataPaths = [];

for (const vf of viewFiles) {
  const content = fs.readFileSync(path.join(viewDir, vf), 'utf8');
  const matches = [...content.matchAll(/data-path=["']([^"']+)["']/g)];
  for (const m of matches) {
    const p = m[1];
    if (!p.includes('${')) {
      totalDataPaths++;
      const full = path.resolve(rootDir, p);
      if (!fs.existsSync(full)) {
        brokenDataPaths.push({ view: vf, path: p, error: 'File not found on disk' });
      }
    }
  }
}

console.log(`\n=== Portal View Static Link Audit ===`);
console.log(`Audited static data-paths: ${totalDataPaths}`);
console.log(`Broken static paths found: ${brokenDataPaths.length}`);
if (brokenDataPaths.length > 0) {
  console.log(JSON.stringify(brokenDataPaths, null, 2));
}

// Now let's audit data served by APIs:
// 1. /api/walkthrough
// 2. /api/crosswire
// 3. /api/files
// 4. /api/drift
// 5. /api/matrix
console.log(`\n=== Portal API Data-Link Audit ===`);

async function auditApiEndpoints() {
  const endpoints = ['walkthrough', 'crosswire', 'files', 'drift', 'matrix', 'dag', 'erd', 'permissions'];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:4242/api/${ep}`);
      if (!res.ok) {
        console.log(`⚠️ /api/${ep} returned HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const stringified = JSON.stringify(data);
      // Find all file path candidates ending in extensions
      const pathMatches = [...stringified.matchAll(/([a-zA-Z0-9_\-./]+\.(?:ts|tsx|js|mjs|json|md|c4|yaml|yml))/g)];
      let checked = 0;
      let missing = [];
      for (const pm of pathMatches) {
        const candidate = pm[1];
        if (candidate.startsWith('http://') || candidate.startsWith('https://')) continue;
        if (candidate.includes('node_modules')) continue;
        if (!candidate.includes('/')) continue; // skip bare names like package.json or single words
        checked++;
        const full = path.resolve(rootDir, candidate);
        if (!fs.existsSync(full)) {
          missing.push(candidate);
        }
      }
      console.log(`/api/${ep}: ${checked} path references checked, ${missing.length} missing.`);
      if (missing.length > 0) {
        console.log(`  Missing in /api/${ep}:`, missing.slice(0, 5));
      }
    } catch (e) {
      console.log(`❌ Error testing /api/${ep}: ${e.message}`);
    }
  }
}

auditApiEndpoints();
