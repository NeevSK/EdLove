import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ANANDA_PROFILE,
  schoolHexagonalService,
} from '../../lib/domain/adapters/school/schoolHexagonalService';

describe('Hexagonal Domain Integration: School Profile & National Census Fact', () => {
  it('retrieves canonical Ananda College profile with verified census and Roll of Honor', async () => {
    const profile = await schoolHexagonalService.getSchoolProfile('school-ananda-colombo');

    expect(profile.fact.id).toBe('school-ananda-colombo');
    expect(profile.fact.name).toBe('Ananda College');
    expect(profile.fact.handle).toBe('ananda-college');
    expect(profile.census.censusNo).toBe('0101001');
    expect(profile.census.provinceName).toBe('Western');
    expect(profile.census.districtName).toBe('Colombo');
    expect(profile.census.isGroundTruthed).toBe(true);

    // Roll of Honor
    expect(profile.rollOfHonor.length).toBeGreaterThanOrEqual(4);
    const incumbent = profile.rollOfHonor.find((h) => h.isCurrent);
    expect(incumbent).toBeDefined();
    expect(incumbent?.roleTitle).toContain('Principal');

    // QR Payload
    expect(profile.qrPayload).toContain('action=join_school');
    expect(profile.qrPayload).toContain('school_id=school-ananda-colombo');
  });

  it('generates a consistent dynamic profile for any recognized school ID or census number', async () => {
    const profile = await schoolHexagonalService.getSchoolProfile('0611016');

    expect(profile.fact.id).toBe('0611016');
    expect(profile.census.censusNo).toBe('0611016');
    expect(profile.vitals.totalStudents).toBeGreaterThan(0);
    expect(profile.qrPayload).toContain('school_id=0611016');
  });

  it('updates school profile facts with optimistic cache persistence', async () => {
    const testSchoolId = 'test-school-colombo-north';
    const initial = await schoolHexagonalService.getSchoolProfile(testSchoolId);

    const updated = await schoolHexagonalService.updateSchoolProfile(testSchoolId, {
      name: 'Colombo North Model Sanctuary',
      motto: 'Wisdom Through Compassion',
      contactEmail: 'sanctuary@colombonorth.edu.lk',
    });

    expect(updated.fact.name).toBe('Colombo North Model Sanctuary');
    expect(updated.fact.motto).toBe('Wisdom Through Compassion');
    expect(updated.fact.contactEmail).toBe('sanctuary@colombonorth.edu.lk');

    // Retrieve again to ensure persistent storage retrieval
    const refetched = await schoolHexagonalService.getSchoolProfile(testSchoolId);
    expect(refetched.fact.name).toBe('Colombo North Model Sanctuary');
  });

  it('searches pre-seeded national schools across names, census numbers, and districts', async () => {
    const results = await schoolHexagonalService.searchNationalSchools('ananda');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]?.censusNo).toBe('0101001');

    const galleResults = await schoolHexagonalService.searchNationalSchools('galle');
    expect(galleResults.length).toBeGreaterThanOrEqual(2);
    expect(galleResults.some((s) => s.censusNo === '0611016')).toBe(true);
  });

  it('resolves vanity handles ananda and ananda-college to canonical profile', async () => {
    const fromHandle = await schoolHexagonalService.getSchoolProfile('ananda');
    expect(fromHandle.fact.id).toBe('school-ananda-colombo');
    expect(fromHandle.fact.name).toBe('Ananda College');

    const fromCollege = await schoolHexagonalService.getSchoolProfile('ananda-college');
    expect(fromCollege.fact.id).toBe('school-ananda-colombo');
  });
});
