#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * STRICT LINGUISTIC & PHILOSOPHICAL ORTHOGRAPHY SENTINEL
 *
 * Enforces the Gurudevi naming invariant across all code, content, and metadata:
 * - Sinhala: MUST be short-vowel "ගුරුදෙවි" (divine teacher / presence in the encounter).
 *   FORBIDDEN: Long-vowel "ගුරුදේවි" or "ගුරුදේවී" (distorts meaning to female goddess/queen).
 * - Tamil: MUST be short-vowel "குருதெவி" (divine teacher).
 *   FORBIDDEN: Long-vowel "குருதேவி" or "குருதேவீ".
 */

const TARGET_DIRECTORIES = [
  'apps/gurudevi-web/app',
  'apps/gurudevi-web/lib',
  'apps/gurudevi-web/tests',
  'apps/gurudevi-mobile/src',
  'apps/gurudevi-mobile/app',
  'apps/edlove-web/src',
  'packages/core/src',
  'packages/classroom/src',
];

const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.json',
  '.astro',
  '.html',
  '.md',
]);

// Files explicitly allowed to mention forbidden strings because they define the rules/tests
const EXEMPT_FILES = new Set([
  path.normalize('packages/core/src/__tests__/i18n-orthography.test.ts'),
  path.normalize('apps/gurudevi-web/tests/unit/seo/i18nOrthographyEnforcement.test.ts'),
  path.normalize('apps/gurudevi-web/tests/unit/seo/badgeAndOgEdge.test.ts'),
  path.normalize('scripts/i18n/check-orthography.mjs'),
]);

const FORBIDDEN_RULES = [
  {
    lang: 'Sinhala',
    pattern: /ගුරුදේවි|ගුරුදේවී/g,
    correct: 'ගුරුදෙවි',
    explanation: 'Short-vowel "ගුරුදෙවි" means divine teacher. Long-vowel "ගුරුදේවි" / "ගුරුදේවී" alters the meaning to female goddess and is strictly forbidden.',
  },
  {
    lang: 'Tamil',
    pattern: /குருதேவி|குருதேவீ/g,
    correct: 'குருதெவி',
    explanation: 'Short-vowel "குருதெவி" means divine teacher. Long-vowel "குருதேவி" / "குருதேவீ" alters the meaning and is strictly forbidden.',
  },
  {
    lang: 'Sinhala Tagline',
    pattern: /සුරක්ෂිත කෙම්බිම/g,
    correct: 'සුපසන් කෙම්බිම',
    explanation: 'The official Sinhala tagline is "සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම" (supasan = serene, tranquil sanctuary). "සුරක්ෂිත කෙම්බිම" is forbidden in taglines.',
  },
  {
    lang: 'Sinhala Tagline',
    pattern: /සමෝධානික අධ්‍යාපනය|සමෝදානිත අධ්‍යාපනය|සමාධානිත අධ්‍යාපනය/g,
    correct: 'සමෝධානිත අධ්‍යාපනය',
    explanation: 'The official Sinhala tagline is strictly "සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම" (samoDhanitha with Mahaprana ධා). Variations like "සමෝධානික", "සමෝදානිත", or "සමාධානිත" are forbidden.',
  },
];

function walk(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('🔍 Auditing Sinhala and Tamil orthography across codebase...\n');

let violationsCount = 0;
const violations = [];

for (const relDir of TARGET_DIRECTORIES) {
  const absDir = path.resolve(REPO_ROOT, relDir);
  const files = walk(absDir);

  for (const filePath of files) {
    const relativeToRepo = path.relative(REPO_ROOT, filePath);
    if (EXEMPT_FILES.has(path.normalize(relativeToRepo))) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const rule of FORBIDDEN_RULES) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(line)) {
          violationsCount++;
          violations.push({
            file: relativeToRepo,
            line: i + 1,
            lang: rule.lang,
            content: line.trim(),
            correct: rule.correct,
            explanation: rule.explanation,
          });
        }
      }
    }
  }
}

if (violationsCount > 0) {
  console.error('\n' + '='.repeat(80));
  console.error('❌ FATAL ERROR: GURUDEVI ORTHOGRAPHIC & PHILOSOPHICAL INVARIANT VIOLATED');
  console.error('='.repeat(80));
  console.error(`Found ${violationsCount} forbidden transliteration(s):\n`);

  for (const v of violations) {
    console.error(`  [${v.lang}] ${v.file}:${v.line}`);
    console.error(`  Offending line: "${v.content}"`);
    console.error(`  Expected:       "${v.correct}"`);
    console.error(`  Rationale:      ${v.explanation}\n`);
  }

  console.error('='.repeat(80));
  console.error('Fix the above violations immediately. Long-vowel transliterations are strictly banned.');
  console.error('='.repeat(80) + '\n');
  process.exit(1);
}

console.log('✅ All Sinhala and Tamil names adhere strictly to short-vowel "ගුරුදෙවි" and "குருதெவி" invariants.\n');
