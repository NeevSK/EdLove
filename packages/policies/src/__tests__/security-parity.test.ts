import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUTHORIZATION_ACTIONS, AUTHORIZATION_RESOURCES } from '../authorizationRegistry';

/**
 * Explicit mapping between high-level Cedar action nouns and physical ZenStack models.
 * If a resource exists in Cedar/AuthorizationRegistry without a direct 1:1 name match
 * in schema.zmodel, it MUST be registered here with its underlying physical backing model(s)
 * or explicit domain boundary rationale.
 */
const RESOURCE_TO_ZMODEL_MAP: Record<string, string[] | string> = {
  Student: ['ClassroomStudent', 'User'],
  ClassroomEchoFeedback: 'ClassroomLegacyRecord',
  FireJournal: 'FireJournalEntry',
  Ledger: 'LedgerEntry',
  Accounting: ['FinancialTransaction', 'Budget'],
  Payments: ['PaymentIntent', 'Invoice', 'Receipt'],
  Guardian: ['StudentGuardianRelationship', 'GuardianIdentity', 'GuardianBond'],
  JoyMoments: 'ThoughtRecord',
  GratitudeEntries: 'GratitudeGift',
  EnergyForecasts: 'UserEnergyBalance',
  AIAssistant: 'AiMessage',
  Library: ['LibraryResource', 'LibraryCollection'],
  FormTemplate: 'ClassroomNote',
  Wellbeing: 'MoodLog',
  Staff: ['User', 'StaffLeave'],
  DailyContent: 'DailyAttendance',
  Calendar: ['CalendarEvent', 'SchoolEvent'],
  Announcement: 'Notification',
  EditorialSubmission: 'SanctuaryManifesto',
  EditorialWork: 'SanctuaryManifesto',
  EditorialRightsAgreement: 'SanctuaryManifesto',
  EditorialAuthor: 'User',
  Manifesto: 'SanctuaryManifesto',
  UserRewards: ['UserEnergyBalance', 'AdRewardTransaction'],
  OperationReceipt: 'Receipt',
};

const RESOURCE_TO_SQL_TABLE: Record<string, { table: string; migration: string }> = {
  PrivacyLedgerEntry: {
    table: 'privacy_ledger_entries',
    migration:
      '../../../../apps/gurudevi-mobile/supabase/migrations/20260306000000_privacy_ledger.sql',
  },
};

const APPROVED_DOMAIN_ACTIONS = new Set<string>([...AUTHORIZATION_ACTIONS, 'grade', 'publish']);

function getAllFiles(
  dirPath: string,
  filter: (file: string) => boolean,
  arrayOfFiles: string[] = [],
): string[] {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, filter, arrayOfFiles);
    } else if (filter(file)) {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

describe('Authorization vocabulary and storage authorities', {
  tags: ['policies', 'security', 'fast'],
}, () => {
  const policiesDir = path.resolve(__dirname, '../policies');
  const zmodelPath = path.resolve(__dirname, '../../../schema/schema.zmodel');

  it('verifies that schema.zmodel exists and contains valid model definitions', () => {
    expect(fs.existsSync(zmodelPath)).toBe(true);
    const zmodelContent = fs.readFileSync(zmodelPath, 'utf-8');
    const modelMatches = [...zmodelContent.matchAll(/model\s+(\w+)/g)].map((m) => m[1]);
    expect(modelMatches.length).toBeGreaterThan(50);
  });

  it('enforces that every Cedar policy references only registered AUTHORIZATION_RESOURCES', () => {
    const cedarFiles = getAllFiles(policiesDir, (f) => f.endsWith('.cedar'));
    expect(cedarFiles.length).toBeGreaterThan(0);

    const validResources = new Set<string>(AUTHORIZATION_RESOURCES);
    const discoveredCedarResources = new Set<string>();

    for (const file of cedarFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Match `resource is ModelName`
      const isMatches = [...content.matchAll(/resource\s+is\s+(\w+)/g)].map((m) => m[1]);
      for (const res of isMatches) {
        if (res) discoveredCedarResources.add(res);
      }

      // Match `resource.type == "ModelName"`
      const typeMatches = [...content.matchAll(/resource\.type\s*==\s*"(\w+)"/g)].map((m) => m[1]);
      for (const res of typeMatches) {
        if (res) discoveredCedarResources.add(res);
      }
    }

    const unmappedCedarResources: string[] = [];
    for (const res of discoveredCedarResources) {
      if (!validResources.has(res as any)) {
        unmappedCedarResources.push(res);
      }
    }

    expect(
      unmappedCedarResources,
      `The following resources used in Cedar policies are missing from AUTHORIZATION_RESOURCES in authorizationRegistry.ts: ${unmappedCedarResources.join(', ')}`,
    ).toEqual([]);
  });

  it('enforces that all Cedar policy actions belong to AUTHORIZATION_ACTIONS or approved domain actions', () => {
    const cedarFiles = getAllFiles(policiesDir, (f) => f.endsWith('.cedar'));
    const discoveredActions = new Set<string>();

    for (const file of cedarFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Match `action == Action::"actionName"`
      const eqMatches = [...content.matchAll(/action\s*==\s*Action::"(\w+)"/g)].map((m) => m[1]);
      for (const act of eqMatches) {
        if (act) discoveredActions.add(act);
      }

      // Match `action in [Action::"actionName", ...]`
      const inMatches = [...content.matchAll(/Action::"(\w+)"/g)].map((m) => m[1]);
      for (const act of inMatches) {
        if (act) discoveredActions.add(act);
      }
    }

    const unapprovedActions: string[] = [];
    for (const act of discoveredActions) {
      if (!APPROVED_DOMAIN_ACTIONS.has(act)) {
        unapprovedActions.push(act);
      }
    }

    expect(
      unapprovedActions,
      `The following actions used in Cedar policies are not approved actions: ${unapprovedActions.join(', ')}`,
    ).toEqual([]);
  });

  it('requires a model or explicit SQL migration authority for registered resources', () => {
    const zmodelContent = fs.readFileSync(zmodelPath, 'utf-8');
    const zmodelModels = new Set([...zmodelContent.matchAll(/model\s+(\w+)/g)].map((m) => m[1]));

    const unmappedResources: string[] = [];

    for (const resource of AUTHORIZATION_RESOURCES) {
      const hasDirectModel = zmodelModels.has(resource);
      const hasExplicitMapping = resource in RESOURCE_TO_ZMODEL_MAP;
      const sqlAuthority = RESOURCE_TO_SQL_TABLE[resource];

      if (!hasDirectModel && !hasExplicitMapping && !sqlAuthority) {
        unmappedResources.push(resource);
      }

      if (sqlAuthority) {
        const migrationPath = path.resolve(__dirname, sqlAuthority.migration);
        const migration = fs.readFileSync(migrationPath, 'utf8');
        expect(migration).toContain(`CREATE TABLE IF NOT EXISTS public.${sqlAuthority.table}`);
        expect(migration).toContain(
          `ALTER TABLE public.${sqlAuthority.table} ENABLE ROW LEVEL SECURITY`,
        );
      }

      if (hasExplicitMapping) {
        const mapped = RESOURCE_TO_ZMODEL_MAP[resource];
        const targets = Array.isArray(mapped) ? mapped : [mapped];
        for (const target of targets) {
          expect(
            zmodelModels.has(target),
            `Mapping for ${resource} points to non-existent model ${target} in schema.zmodel`,
          ).toBe(true);
        }
      }
    }

    expect(
      unmappedResources,
      `The following AUTHORIZATION_RESOURCES have no model mapping or SQL migration authority: ${unmappedResources.join(', ')}`,
    ).toEqual([]);
  });
});
