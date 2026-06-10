#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIRS = [
  'apps/gurudevi-mobile/src',
  'packages/self/src',
  'packages/community/src',
  'packages/scanner-kit/src',
];

const LOCALE_FILES = {
  en: 'apps/gurudevi-mobile/src/i18n/locales/en.json',
  si: 'apps/gurudevi-mobile/src/i18n/locales/si.json',
  ta: 'apps/gurudevi-mobile/src/i18n/locales/ta.json',
};

const SOURCE_FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const TRANSLATION_CALL_REGEX = /\bt\(\s*(['"])((?:\\.|(?!\1).)+)\1/g;

function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    console.error(`i18n audit error: source directory does not exist: ${dirPath}`);
    process.exit(1);
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, files);
      continue;
    }

    if (SOURCE_FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function collectUsedTranslationKeys() {
  const usedKeys = new Set();

  for (const sourceDir of SOURCE_DIRS) {
    for (const filePath of walkFiles(sourceDir)) {
      const source = fs.readFileSync(filePath, 'utf8');
      for (const match of source.matchAll(TRANSLATION_CALL_REGEX)) {
        usedKeys.add(match[2]);
      }
    }
  }

  return [...usedKeys].sort();
}

function flattenLocaleKeys(localeNode, currentPath = '', output = new Set()) {
  if (!localeNode || typeof localeNode !== 'object' || Array.isArray(localeNode)) {
    return output;
  }

  for (const [key, value] of Object.entries(localeNode)) {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenLocaleKeys(value, nextPath, output);
    } else {
      output.add(nextPath);
    }
  }

  return output;
}

function findMissingByLocale(usedKeys) {
  const missingByLocale = {};

  for (const [locale, localePath] of Object.entries(LOCALE_FILES)) {
    const localeJson = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    const localeKeys = flattenLocaleKeys(localeJson);
    missingByLocale[locale] = usedKeys.filter((key) => !localeKeys.has(key));
  }

  return missingByLocale;
}

function printReportAndExit(missingByLocale) {
  let hasMissing = false;

  for (const [locale, missingKeys] of Object.entries(missingByLocale)) {
    if (missingKeys.length === 0) {
      continue;
    }

    hasMissing = true;
    console.error(`\n[${locale}] Missing ${missingKeys.length} translation key(s):`);
    for (const key of missingKeys) {
      console.error(`  - ${key}`);
    }
  }

  if (hasMissing) {
    process.exitCode = 1;
    return;
  }

  console.log('✅ i18n audit passed: all used t(...) keys exist in en/si/ta locales.');
}

const usedKeys = collectUsedTranslationKeys();
const missingByLocale = findMissingByLocale(usedKeys);
printReportAndExit(missingByLocale);
