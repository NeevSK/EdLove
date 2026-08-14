#!/usr/bin/env node

/**
 * Inventory the data-access boundary. The Sanctuary HTTP app must use its
 * server repository/ZenStack ports; client-side legacy adapters are reported
 * separately so their migration can be planned instead of being mistaken for
 * API implementation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function collect(directory, includeTests = false) {
  const findings = [];
  for (const file of filesIn(directory)) {
    if (!includeTests && /(^|[\\/])(__tests__|.*\.(test|spec))([\\/]|\.)/.test(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    const lines = source.split(/\r?\n/);
    const fileName = path.relative(root, file);
    const addFinding = (index, text) =>
      findings.push({
        file: fileName,
        line: index + 1,
        text: text.trim(),
      });

    lines.forEach((line, index) => {
      if (/from ['"]@supabase|createClient\(/.test(line)) addFinding(index, line);
    });

    // Match fluent calls even when the client and method are split across
    // lines. The former line-only check silently undercounted legacy access.
    const directAccess =
      /\bsupabase(?:Client)?\s*(?:\.\s*schema\s*\([^)]*\)\s*)?\.\s*(?:from|rpc|functions\s*\.\s*invoke)\s*\(/g;
    for (const match of source.matchAll(directAccess)) {
      const line = source.slice(0, match.index).split(/\r?\n/).length - 1;
      addFinding(line, lines[line] ?? match[0]);
    }
  }
  return findings;
}

function collectPackageApiBoundaries() {
  const packagesRoot = path.join(root, 'packages');
  if (!fs.existsSync(packagesRoot)) return [];
  return fs.readdirSync(packagesRoot, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || entry.name === 'core') return [];
    return collect(path.join(packagesRoot, entry.name, 'src', 'api'));
  });
}

const report = {
  sanctuaryApi: collect(path.join(root, 'apps', 'sanctuary-api', 'src')),
  legacyCoreApi: collect(path.join(root, 'packages', 'core', 'src', 'api')),
  firstPartyPackageApis: collectPackageApiBoundaries(),
  generatedAt: 'deterministic-source-audit',
};

const outputPath = path.join(root, 'docs', 'architecture', 'api-data-boundary-inventory.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Sanctuary API direct Supabase findings: ${report.sanctuaryApi.length}`);
console.log(`Legacy core API direct Supabase findings: ${report.legacyCoreApi.length}`);
console.log(`Other first-party package API findings: ${report.firstPartyPackageApis.length}`);
console.log(`Inventory: ${outputPath}`);

if (report.sanctuaryApi.length > 0) {
  console.error(
    'Data-boundary audit failed: the Sanctuary HTTP app contains direct Supabase callers.',
  );
  process.exitCode = 1;
}
