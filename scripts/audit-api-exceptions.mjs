import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inventoryPath = path.join(root, 'docs/architecture/api-data-boundary-inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const findings = inventory.legacyCoreApi ?? [];

// Deliberate exceptions are reviewed architecture decisions, not an escape
// hatch. Any change requires updating the backlog and its product/security
// decision explicitly.
const expected = new Map([
  ['packages/core/src/api/classroom.ts', { count: 5, reason: 'unmodeled historical records' }],
  ['packages/core/src/api/deviceTrust.ts', { count: 6, reason: 'native/security adapter' }],
  ['packages/core/src/api/rewards.ts', { count: 11, reason: 'deprecated compatibility surface' }],
]);

const actual = new Map();
for (const finding of findings) {
  const file = finding.file.replaceAll('\\', '/');
  actual.set(file, (actual.get(file) ?? 0) + 1);
}

const errors = [];
for (const [file, count] of actual) {
  const rule = expected.get(file);
  if (!rule) errors.push(`Unexpected legacy Core API exception: ${file} (${count} findings).`);
  else if (rule.count !== count)
    errors.push(`Exception count changed for ${file}: expected ${rule.count}, found ${count}.`);
}
for (const file of expected.keys()) {
  if (!actual.has(file))
    errors.push(`Expected classified exception disappeared from inventory: ${file}.`);
}

const total = [...actual.values()].reduce((sum, count) => sum + count, 0);
console.log(
  `API exception audit: ${total} classified legacy Core findings across ${actual.size} surfaces.`,
);
for (const [file, rule] of expected) console.log(`- ${file}: ${rule.count} (${rule.reason})`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log('All remaining legacy Core findings match the reviewed exception ledger.');
}
