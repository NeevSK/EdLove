import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const localeDir = path.join(projectRoot, 'apps', 'gurudevi-mobile', 'src', 'i18n', 'locales');
const sourceRoots = [
  path.join(projectRoot, 'apps', 'gurudevi-mobile', 'src'),
  path.join(projectRoot, 'packages'),
];

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

const flattenKeys = (obj, prefix = '') => {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
};

const walk = async (dir) => {
  const result = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return result;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', 'coverage', '.expo', 'android', 'ios', 'docs'].includes(entry.name)) {
        continue;
      }
      result.push(...await walk(full));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      result.push(full);
    }
  }

  return result;
};

const localeFiles = (await readdir(localeDir)).filter((file) => file.endsWith('.json')).sort();
if (localeFiles.length === 0) {
  console.error('No locale files found for i18n coverage check.');
  process.exit(1);
}

const localeKeysMap = new Map();
for (const file of localeFiles) {
  const localeName = path.basename(file, '.json');
  const contents = await readFile(path.join(localeDir, file), 'utf8');
  const json = JSON.parse(contents);
  localeKeysMap.set(localeName, new Set(flattenKeys(json)));
}

const [baseLocale, ...otherLocales] = [...localeKeysMap.keys()];
const baseKeys = localeKeysMap.get(baseLocale);

const missingByLocale = [];
for (const locale of otherLocales) {
  const keys = localeKeysMap.get(locale);
  const missing = [...baseKeys].filter((key) => !keys.has(key));
  if (missing.length > 0) {
    missingByLocale.push({ locale, missing });
  }
}

const sourceFiles = (await Promise.all(sourceRoots.map((dir) => walk(dir)))).flat();
const keyPattern = /\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"]/g;
const usedKeys = new Set();
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(keyPattern)) {
    usedKeys.add(match[1]);
  }
}

const missingFromBase = [...usedKeys].filter((key) => !baseKeys.has(key));

if (missingByLocale.length || missingFromBase.length) {
  console.warn('⚠️ i18n key coverage audit found gaps.');

  for (const issue of missingByLocale) {
    console.error(`- Locale "${issue.locale}" is missing ${issue.missing.length} key(s).`);
    issue.missing.slice(0, 20).forEach((key) => console.error(`  • ${key}`));
    if (issue.missing.length > 20) {
      console.error(`  • ...and ${issue.missing.length - 20} more`);
    }
  }

  if (missingFromBase.length) {
    console.error(`- Base locale "${baseLocale}" is missing ${missingFromBase.length} key(s) referenced in source.`);
    missingFromBase.slice(0, 20).forEach((key) => console.error(`  • ${key}`));
    if (missingFromBase.length > 20) {
      console.error(`  • ...and ${missingFromBase.length - 20} more`);
    }
  }

  console.warn('Coverage audit completed with warnings (non-blocking).');
  process.exit(0);
}

console.log(`✅ i18n key coverage check passed (${localeFiles.length} locales, ${usedKeys.size} used keys).`);
