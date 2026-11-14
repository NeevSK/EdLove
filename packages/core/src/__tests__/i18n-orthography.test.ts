import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Enforces strict Sinhala and Tamil orthographic standards for "Gurudevi"
 * based on the philosophy spec (short-vowel devi / divine teacher):
 * - Sinhala MUST use short-vowel "ගුරුදෙවි" (NEVER long vowels "ගුරුදේවි" or "ගුරුදේවී").
 * - Tamil MUST use short-vowel "குருதெவி" (NEVER long vowels "குருதேவி" or "குருதேவீ").
 */
describe('i18n Orthography & Phonetic Consistency Gate', () => {
  const localePaths = [
    {
      lang: 'si',
      filePath: path.resolve(__dirname, '../logic/i18n/locales/si.json'),
      forbiddenPatterns: [/ගුරුදේවි/g, /ගුරුදේවී/g],
      requiredPattern: /ගුරුදෙවි/,
    },
    {
      lang: 'ta',
      filePath: path.resolve(__dirname, '../logic/i18n/locales/ta.json'),
      forbiddenPatterns: [/குருதேவி/g, /குருதேவீ/g],
      requiredPattern: /குருதெவி/,
    },
    {
      lang: 'mobile-si',
      filePath: path.resolve(
        __dirname,
        '../../../../apps/gurudevi-mobile/src/i18n/locales/si.json',
      ),
      forbiddenPatterns: [/ගුරුදේවි/g, /ගුරුදේවී/g],
      requiredPattern: /ගුරුදෙවි/,
    },
    {
      lang: 'mobile-ta',
      filePath: path.resolve(
        __dirname,
        '../../../../apps/gurudevi-mobile/src/i18n/locales/ta.json',
      ),
      forbiddenPatterns: [/குருதேவி/g, /குருதேவீ/g],
      requiredPattern: /குருதெவி/,
    },
    {
      lang: 'web-locales',
      filePath: path.resolve(
        __dirname,
        '../../../../apps/gurudevi-web/lib/locales.ts',
      ),
      forbiddenPatterns: [/ගුරුදේවි/g, /ගුරුදේවී/g, /குருதேவி/g, /குருதேவீ/g, /සුරක්ෂිත කෙම්බිම/g, /සමෝධානික/g, /සමෝදානිත/g],
      requiredPattern: /ගුරුදෙවි/,
    },
  ];

  for (const { lang, filePath, forbiddenPatterns, requiredPattern } of localePaths) {
    it(`should enforce correct short-vowel transliteration in ${lang} (${path.basename(filePath)})`, () => {
      expect(fs.existsSync(filePath), `File exists: ${filePath}`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');

      // 1. Must contain valid short-vowel representation
      expect(requiredPattern.test(content)).toBe(true);

      // 2. Must NEVER contain forbidden long-vowel patterns
      for (const pattern of forbiddenPatterns) {
        const matches = content.match(pattern);
        expect(
          matches,
          `Found forbidden long-vowel orthography "${pattern}" in ${lang} locale!`,
        ).toBeNull();
      }
    });
  }
});
