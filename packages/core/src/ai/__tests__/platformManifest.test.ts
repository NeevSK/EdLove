import { describe, expect, it } from 'vitest';
import {
  buildPlatformAwarenessPrompt,
  PLATFORM_CAPABILITY_MANIFEST,
  resolveAgePedagogyProfile,
  sanitizeCompanionMemories,
} from '../platformManifest';

describe('Platform Self-Awareness & Age/Persona Pedagogy Lens (@repo/core)', () => {
  it('resolves age-appropriate pedagogy profiles across grades and roles', () => {
    const youngChild = resolveAgePedagogyProfile('student', undefined, 3);
    expect(youngChild.band).toBe('early_years_6_9');
    expect(youngChild.safeSearchStrict).toBe(true);
    expect(youngChild.maxSentenceTarget).toBeLessThanOrEqual(3);

    const middleStudent = resolveAgePedagogyProfile('student', undefined, 7);
    expect(middleStudent.band).toBe('middle_years_10_13');

    const seniorStudent = resolveAgePedagogyProfile('student', undefined, 11);
    expect(seniorStudent.band).toBe('adolescent_14_18');

    const guardian = resolveAgePedagogyProfile('guardian');
    expect(guardian.band).toBe('adult_guardian');

    const principal = resolveAgePedagogyProfile('principal');
    expect(principal.band).toBe('adult_leader');

    const teacher = resolveAgePedagogyProfile('teacher');
    expect(teacher.band).toBe('adult_educator');
  });

  it('allows explicit ageBand override when user selects a learning lens', () => {
    const profile = resolveAgePedagogyProfile('teacher', 'early_years_6_9');
    expect(profile.band).toBe('early_years_6_9');
  });

  it('sanitizes companion memory items and blocks sacred private keywords', () => {
    const cleaned = sanitizeCompanionMemories([
      {
        id: '1',
        category: 'subject',
        fact: 'Studying Grade 10 Science and Sinhala literature',
      },
      {
        id: '2',
        category: 'context',
        fact: 'From self.fire_journal: secret entry',
      },
      {
        id: '3',
        category: 'context',
        fact: 'Contains safeguarding case details',
      },
      {
        id: '4',
        category: 'goal',
        fact: '   ',
      },
    ]);

    expect(cleaned).toHaveLength(1);
    expect(cleaned[0]?.fact).toBe('Studying Grade 10 Science and Sinhala literature');
  });

  it('builds a platform self-awareness prompt highlighting the active Sanctuary domain', () => {
    expect(PLATFORM_CAPABILITY_MANIFEST.length).toBeGreaterThanOrEqual(5);
    const prompt = buildPlatformAwarenessPrompt('student', 'library');
    expect(prompt).toContain('PLATFORM SELF-AWARENESS');
    expect(prompt).toContain('Library (Epistemic Commons & Knowledge Atlas)');
    expect(prompt).toContain('(USER IS CURRENTLY HERE)');
    expect(prompt).toContain('/(tabs)/library');
  });
});
