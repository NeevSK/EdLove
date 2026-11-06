import { describe, expect, it } from 'vitest';
import {
  CANONICAL_NAME_PROMPTS,
  extractCandidateName,
  extractFirstName,
  PREFERRED_NAME_MAX_LENGTH,
  validatePreferredName,
} from '../PreferredName';

describe('PreferredName domain logic', () => {
  describe('extractCandidateName', () => {
    it('returns empty string for null, undefined, or empty objects', () => {
      expect(extractCandidateName(null)).toBe('');
      expect(extractCandidateName(undefined)).toBe('');
      expect(extractCandidateName({})).toBe('');
      expect(extractCandidateName({ other: 123 })).toBe('');
    });

    it('extracts direct display_name property', () => {
      expect(extractCandidateName({ display_name: 'Dr. Devika' })).toBe('Dr. Devika');
      expect(extractCandidateName({ displayName: 'Sister Margaret' })).toBe('Sister Margaret');
    });

    it('extracts full_name from user_metadata', () => {
      const user = {
        user_metadata: {
          full_name: 'Ananda Silva',
        },
      };
      expect(extractCandidateName(user)).toBe('Ananda Silva');
    });

    it('extracts name object with firstName and lastName', () => {
      const user = {
        user_metadata: {
          name: {
            firstName: 'Kusum',
            lastName: 'Perera',
          },
        },
      };
      expect(extractCandidateName(user)).toBe('Kusum Perera');
    });

    it('extracts given_name and family_name', () => {
      const user = {
        user_metadata: {
          given_name: 'Nimal',
          family_name: 'Fernando',
        },
      };
      expect(extractCandidateName(user)).toBe('Nimal Fernando');
    });

    it('cleans email local-part into title-cased name when no metadata present', () => {
      const user = { email: 'ananda.silva123@school.edu.lk' };
      expect(extractCandidateName(user)).toBe('Ananda Silva');

      const userDash = { email: 'sunil-kumara@sanctuary.org' };
      expect(extractCandidateName(userDash)).toBe('Sunil Kumara');
    });

    it('extracts name from nested profile sub-object', () => {
      const user = {
        profile: {
          display_name: 'Principal Wijesinghe',
        },
      };
      expect(extractCandidateName(user)).toBe('Principal Wijesinghe');
    });
  });

  describe('extractFirstName', () => {
    it('extracts first word of display name', () => {
      expect(extractFirstName('Ananda Silva')).toBe('Ananda');
      expect(extractFirstName('Dr. Devika Sharma')).toBe('Dr.');
      expect(extractFirstName('Kusum')).toBe('Kusum');
    });

    it('returns fallback if empty or missing', () => {
      expect(extractFirstName('')).toBe('there');
      expect(extractFirstName('   ', 'friend')).toBe('friend');
    });
  });

  describe('validatePreferredName', () => {
    it('rejects empty or whitespace-only names', () => {
      expect(validatePreferredName('').valid).toBe(false);
      expect(validatePreferredName('   ').valid).toBe(false);
    });

    it('rejects names exceeding max length', () => {
      const tooLong = 'A'.repeat(PREFERRED_NAME_MAX_LENGTH + 1);
      const result = validatePreferredName(tooLong);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(`${PREFERRED_NAME_MAX_LENGTH}`);
    });

    it('accepts valid preferred names', () => {
      expect(validatePreferredName('Ananda').valid).toBe(true);
      expect(validatePreferredName('Teacher Sam').valid).toBe(true);
    });
  });

  describe('CANONICAL_NAME_PROMPTS', () => {
    it('defines consistent prompt copy', () => {
      expect(CANONICAL_NAME_PROMPTS.title).toBe('What should we call you?');
      expect(CANONICAL_NAME_PROMPTS.placeholder).toBe('e.g. Ananda or Teacher Sam');
      expect(CANONICAL_NAME_PROMPTS.titleWithDetected('Ananda')).toBe('Welcome, Ananda');
      expect(CANONICAL_NAME_PROMPTS.callMeAction('Ananda')).toBe('Call me Ananda →');
    });
  });
});
