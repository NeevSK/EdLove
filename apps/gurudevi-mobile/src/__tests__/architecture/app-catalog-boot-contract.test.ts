import { getAllDomains } from '@repo/core/logic/registry/appCatalog';
import { registerAppCatalog } from '@/boot/registerAppCatalog';
import { describe, expect, it } from 'vitest';

const EXPECTED_DOMAIN_IDS = [
  'ai-assistant',
  'archive',
  'circles',
  'curator',
  'form-builder',
  'grade-head',
  'guardian-workspace',
  'hearth',
  'hub',
  'inventory',
  'messages',
  'principal',
  'section-head',
  'staff-management',
  'student',
  'teacher',
  'trust',
  'working',
  'leadership',
  'journey',
  'pulse',
  'growth',
  'care',
  'reflection',
  'workspace-shell',
  'workforce',
  'accounting',
] as const;

describe('production AppCatalog boot contract', () => {
  it('registers the complete production registry inventory', () => {
    registerAppCatalog();

    const domains = getAllDomains();
    expect(domains).toHaveLength(EXPECTED_DOMAIN_IDS.length);
    expect(domains.map((domain) => domain.id).sort()).toEqual(
      [...EXPECTED_DOMAIN_IDS].sort(),
    );
    expect(new Set(domains.map((domain) => domain.id)).size).toBe(domains.length);
  });

  it('keeps every production entry structurally complete after boot', () => {
    registerAppCatalog();

    for (const domain of getAllDomains()) {
      expect(domain.ownerPackage).toBeTruthy();
      expect(domain.tabDomain).toBeTruthy();
      expect(domain.surfaceId).toBeTruthy();
      expect(domain.analyticsKey.startsWith(`${domain.tabDomain}.`)).toBe(true);
      expect(domain.lifecycle.owner).toBe(domain.ownerPackage);
      if (domain.state === 'beta') expect(domain.flagKey).toBeTruthy();
      if (domain.flagKey) expect(domain.lifecycle.flagClass).toBeTruthy();
    }
  });
});
