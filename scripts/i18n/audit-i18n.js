#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const roots = [
  'apps/gurudevi-mobile/src',
  'packages/self/src',
  'packages/community/src',
  'packages/scanner-kit/src',
];
const localeFiles = {
  en: 'apps/gurudevi-mobile/src/i18n/locales/en.json',
  si: 'apps/gurudevi-mobile/src/i18n/locales/si.json',
  ta: 'apps/gurudevi-mobile/src/i18n/locales/ta.json',
};

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

function flatten(obj, prefix = '', out = new Set()) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

const keyRegex = /\bt\(\s*['"]([^'"]+)['"]/g;
const used = new Map();
for (const root of roots) {
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(keyRegex)) {
      const key = m[1];
      if (!used.has(key)) used.set(key, []);
      used.get(key).push(file);
    }
  }
}

const localeKeySets = Object.fromEntries(
  Object.entries(localeFiles).map(([lang, file]) => {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return [lang, flatten(json)];
  }),
);

let hasError = false;
const allUsed = [...used.keys()].sort();
for (const [lang, keys] of Object.entries(localeKeySets)) {
  const missing = allUsed.filter((k) => !keys.has(k));
  if (missing.length) {
    hasError = true;
    console.error(`\n[${lang}] missing ${missing.length} key(s):`);
    for (const key of missing) console.error(`  - ${key} (${used.get(key)[0]})`);
  }
}

if (hasError) process.exit(1);
console.log(`i18n audit passed: ${allUsed.length} used keys covered by en/si/ta.`);
