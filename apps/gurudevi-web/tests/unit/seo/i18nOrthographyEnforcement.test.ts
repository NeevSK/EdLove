import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_LOCALES } from '../../../lib/locales';
import { generateOrganizationJsonLd } from '../../../lib/schema-org';
import { GET as getKnowledgeJson } from '../../../app/knowledge.json/route';

/**
 * ZERO-TOLERANCE ORTHOGRAPHY & PHILOSOPHY TEST SUITE
 *
 * Enforces the sacred linguistic invariants of the Gurudevi Platform:
 * 1. Sinhala Name: Must be short-vowel "ගුරුදෙවි" (divine teacher).
 *    FORBIDDEN: Long-vowel "ගුරුදේවි" or "ගුරුදේවී" (means female goddess/queen).
 * 2. Tamil Name: Must be short-vowel "குருதெவி" (divine teacher).
 *    FORBIDDEN: Long-vowel "குருதேவி" or "குருதேவீ".
 * 3. Sinhala Tagline: Must be "සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම"
 *    (samoDhanitha = holistic/integrated with Mahaprana ධා; supasan = serene/tranquil).
 *    FORBIDDEN: "සුරක්ෂිත කෙම්බිම", "සමෝධානික", "සමෝදානිත".
 */
describe('Gurudevi Linguistic & Orthographic Invariants', () => {
  const WEB_APP_DIR = path.resolve(__dirname, '../../../app');
  const WEB_LIB_DIR = path.resolve(__dirname, '../../../lib');

  const FORBIDDEN_PATTERNS = [
    {
      name: 'Sinhala long-vowel name',
      regex: /ගුරුදේවි|ගුරුදේවී/g,
      expected: 'ගුරුදෙවි',
      reason: 'Short-vowel "ගුරුදෙවි" means divine teacher. Long-vowel "ගුරුදේවි" refers to a goddess/queen and is strictly forbidden.',
    },
    {
      name: 'Tamil long-vowel name',
      regex: /குருதேவி|குருதேவீ/g,
      expected: 'குருதெவி',
      reason: 'Short-vowel "குருதெவி" means divine teacher. Long-vowel "குருதேவி" is strictly forbidden.',
    },
    {
      name: 'Sinhala incorrect security-term in sanctuary tagline',
      regex: /සුරක්ෂිත කෙම්බිම/g,
      expected: 'සුපසන් කෙම්බිම',
      reason: 'The sanctuary tagline requires "සුපසන් කෙම්බිම" (supasan = serene, tranquil sanctuary), not "සුරක්ෂිත කෙම්බිම" (surakshitha = security/defense).',
    },
    {
      name: 'Sinhala misspelled samoDhanitha in tagline',
      regex: /සමෝධානික අධ්‍යාපනය|සමෝදානිත අධ්‍යාපනය|සමාධානිත අධ්‍යාපනය/g,
      expected: 'සමෝධානිත අධ්‍යාපනය',
      reason: 'The canonical tagline spelling is "සමෝධානිත" (samoDhanitha with Mahaprana ධා).',
    },
  ];

  function getFiles(dir: string, extSet = new Set(['.ts', '.tsx', '.json', '.html'])): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getFiles(full, extSet));
      } else if (extSet.has(path.extname(entry.name))) {
        results.push(full);
      }
    }
    return results;
  }

  describe('Locale dictionary invariants', () => {
    it('enforces exact short-vowel Sinhala brand and canonical tagline in locales.ts', () => {
      expect(PUBLIC_LOCALES.si.brand).toContain('ගුරුදෙවි');
      expect(PUBLIC_LOCALES.si.brand).not.toMatch(/ගුරුදේවි|ගුරුදේවී/);

      expect(PUBLIC_LOCALES.si.tagline).toBe('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');
      expect(PUBLIC_LOCALES.si.seoTitle).toContain('ගුරුදෙවි');
      expect(PUBLIC_LOCALES.si.seoTitle).toContain('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');
      expect(PUBLIC_LOCALES.si.seoDescription).toContain('සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');
    });

    it('enforces exact short-vowel Tamil brand in locales.ts', () => {
      expect(PUBLIC_LOCALES.ta.brand).toContain('குருதெவி');
      expect(PUBLIC_LOCALES.ta.brand).not.toMatch(/குருதேவி|குருதேவீ/);

      expect(PUBLIC_LOCALES.ta.seoTitle).toContain('குருதெவி');
      expect(PUBLIC_LOCALES.ta.seoDescription).toContain('குருதெவி');
    });
  });

  describe('Metadata and API routes', () => {
    it('enforces canonical orthography in Schema.org JSON-LD', () => {
      const org = generateOrganizationJsonLd();
      expect(org.alternateName).toContain('ගුරුදෙවි');
      expect(org.alternateName).toContain('குருதெவி');

      const serialized = JSON.stringify(org);
      expect(serialized).not.toMatch(/ගුරුදේවි|ගුරුදේවී/);
      expect(serialized).not.toMatch(/குருதேவி|குருதேவீ/);
    });

    it('enforces canonical orthography in knowledge.json route', async () => {
      const res = getKnowledgeJson();
      const body = await res.json();
      const serialized = JSON.stringify(body);

      // Verify required short vowels and canonical tagline
      expect(serialized).toContain('ගුරුදෙවි | සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම');
      expect(serialized).toContain('குருதெவி');

      // Verify no forbidden forms
      expect(serialized).not.toMatch(/ගුරුදේවි|ගුරුදේවී/);
      expect(serialized).not.toMatch(/குருதேவி|குருதேவீ/);
      expect(serialized).not.toMatch(/සුරක්ෂිත කෙම්බිම/);
      expect(serialized).not.toMatch(/සමෝධානික/);
    });
  });

  describe('Repository AST & file scanner gate', () => {
    it('verifies ZERO violations of orthographic invariants across all web app files', () => {
      const allFiles = [...getFiles(WEB_APP_DIR), ...getFiles(WEB_LIB_DIR)];
      const violations: string[] = [];

      for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
          const line = lines[lineNum];
          if (!line) continue;
          for (const rule of FORBIDDEN_PATTERNS) {
            rule.regex.lastIndex = 0;
            if (rule.regex.test(line)) {
              violations.push(
                `\n[${rule.name}] ${path.relative(process.cwd(), filePath)}:${lineNum + 1}\n` +
                  `  Found:    "${line.trim()}"\n` +
                  `  Expected: "${rule.expected}"\n` +
                  `  Reason:   ${rule.reason}`,
              );
            }
          }
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `FATAL: Found ${violations.length} orthographic invariant violation(s) in apps/gurudevi-web:\n` +
            violations.join('\n'),
        );
      }

      expect(violations).toHaveLength(0);
    });
  });
});
