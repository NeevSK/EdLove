#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const roots = [
  'apps/gurudevi-mobile/src',
  'packages/self/src',
  'packages/community/src',
  'packages/scanner-kit/src',
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

const regex = /\bt\(\s*['"][^'"]+['"]\s*,\s*['"]/g;
const violations = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, 'utf8');
    if (regex.test(src)) violations.push(file);
  }
}

if (violations.length) {
  console.error(`Inline i18n fallbacks found in ${violations.length} file(s):`);
  for (const f of violations) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('No inline i18n fallback defaults found.');
