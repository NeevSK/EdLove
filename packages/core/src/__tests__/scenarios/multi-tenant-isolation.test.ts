import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from '../../lib/storage';
import { createTenantStorageScope } from '../../lib/tenantStorage';

describe('Disaster Suite 5: Institutional & Multi-Tenant Partition Isolation', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('1. Tenant Isolation: guarantees strict separation between Personal and Institutional storage scopes', () => {
    const userId = 'dr_john_doe';
    const personalKey = 'draft_journal_entry';
    const institutionalOrgId = 'stanford_medical_org';

    // 1. Write personal draft
    storage.set(personalKey, JSON.stringify({ title: 'My Personal Notes' }));

    // 2. Create institutional storage scope
    const institutionalStorage = createTenantStorageScope(institutionalOrgId, userId);

    // 3. Write institutional patient record with same key name
    institutionalStorage.set(personalKey, JSON.stringify({ title: 'Stanford Patient Case #402' }));

    // 4. Verify no overwrite or cross-pollution
    const personalValue = JSON.parse(storage.getString(personalKey)!);
    const institutionalValue = JSON.parse(institutionalStorage.getString(personalKey)!);

    expect(personalValue.title).toBe('My Personal Notes');
    expect(institutionalValue.title).toBe('Stanford Patient Case #402');
  });

  it('2. Multi-Tenant Switching: guarantees multiple institutional orgs on same device do not bleed state', () => {
    const userId = 'consultant_expert';
    const orgAStorage = createTenantStorageScope('org_oxford', userId);
    const orgBStorage = createTenantStorageScope('org_cambridge', userId);

    orgAStorage.set('clearance_level', 'LEVEL_TOP_SECRET');
    orgBStorage.set('clearance_level', 'LEVEL_STANDARD');

    expect(orgAStorage.getString('clearance_level')).toBe('LEVEL_TOP_SECRET');
    expect(orgBStorage.getString('clearance_level')).toBe('LEVEL_STANDARD');
  });
});
