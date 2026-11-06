#!/usr/bin/env node

/**
 * Fails closed when the shared authorization vocabulary drifts from Cedar,
 * ZenStack, or declared SQL authorities. Generated ORM output is derivative.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

export function validateSqlAuthorities(repositoryRoot, records, knownResources = []) {
  const failures = [];
  const byResource = new Map();
  const validIdentifier = /^[a-z_][a-z0-9_]*$/;
  const removeSqlComments = (sql) =>
    sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\r\n]*/g, ' ');
  const readSource = (relative, resource, field) => {
    if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) {
      failures.push(`${resource}: invalid ${field} migration path`);
      return '';
    }
    const absolute = path.resolve(repositoryRoot, relative);
    const relativeToRoot = path.relative(repositoryRoot, absolute);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      failures.push(`${resource}: ${field} migration path escapes repository root`);
      return '';
    }
    try {
      return fs.readFileSync(absolute, 'utf8');
    } catch {
      failures.push(`${resource}: missing ${field} migration source "${relative}"`);
      return '';
    }
  };

  if (!Array.isArray(records)) return ['SQL authority metadata must be an array'];
  for (const record of records) {
    if (!record || typeof record.resource !== 'string' || !record.resource) {
      failures.push('SQL authority record is missing a resource name');
      continue;
    }
    if (byResource.has(record.resource)) {
      failures.push(`${record.resource}: duplicate SQL authority record`);
      continue;
    }
    byResource.set(record.resource, record);
    if (knownResources.length && !knownResources.includes(record.resource)) {
      failures.push(`${record.resource}: SQL authority is absent from authorization registry`);
    }
    if (!validIdentifier.test(record.table ?? '')) {
      failures.push(`${record.resource}: invalid SQL table identifier`);
      continue;
    }
    if (!['server-owned', 'legacy-not-admitted'].includes(record.admission)) {
      failures.push(`${record.resource}: invalid API admission classification`);
    }
    if (!['default-deny', 'owner'].includes(record.policyMode)) {
      failures.push(`${record.resource}: invalid SQL policy mode`);
    }
    if (typeof record.requireClientRevoke !== 'boolean') {
      failures.push(`${record.resource}: client-role revoke expectation must be explicit`);
    }
    if (record.admission === 'server-owned' && record.policyMode !== 'default-deny') {
      failures.push(`${record.resource}: server-owned SQL authorities must be default-deny`);
    }
    if (record.admission === 'legacy-not-admitted' && record.policyMode !== 'owner') {
      failures.push(`${record.resource}: legacy SQL authority must declare its owner policy mode`);
    }

    const tableSql = removeSqlComments(readSource(record.tableSource, record.resource, 'table'));
    const securitySql = removeSqlComments(
      readSource(record.securitySource, record.resource, 'security'),
    );
    const rlsSql = record.rlsSource
      ? removeSqlComments(readSource(record.rlsSource, record.resource, 'RLS'))
      : securitySql;
    const qualifiedTable = `public\\.${record.table}`;
    const createTable = new RegExp(
      `\\bcreate\\s+table(?:\\s+if\\s+not\\s+exists)?\\s+${qualifiedTable}\\b`,
      'i',
    );
    if (!createTable.test(tableSql)) {
      failures.push(`${record.resource}: table source does not create public.${record.table}`);
    }
    const enableRls = new RegExp(
      `\\balter\\s+table\\s+${qualifiedTable}\\s+enable\\s+row\\s+level\\s+security\\b`,
      'i',
    );
    if (!enableRls.test(rlsSql)) {
      failures.push(
        `${record.resource}: RLS activation source does not enable RLS on public.${record.table}`,
      );
    }
    if (record.requireClientRevoke) {
      const clientRevoke = new RegExp(
        `\\brevoke\\s+all\\s+on\\s+(?:table\\s+)?${qualifiedTable}\\s+from\\s+([^;]*);`,
        'i',
      );
      const revokedRoles = securitySql.match(clientRevoke)?.[1] ?? '';
      if (!/\banon\b/i.test(revokedRoles) || !/\bauthenticated\b/i.test(revokedRoles)) {
        failures.push(
          `${record.resource}: security source is missing anon/authenticated table revoke`,
        );
      }
    }
    if (record.policyMode === 'owner') {
      if (!Array.isArray(record.policies) || record.policies.length === 0) {
        failures.push(`${record.resource}: owner policy metadata is empty`);
      } else {
        for (const policy of record.policies) {
          const escape = (value) => String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const policyStart = new RegExp(
            `\\bcreate\\s+policy\\s+"${escape(policy.name)}"\\s+on\\s+${qualifiedTable}\\b[^;]*;`,
            'i',
          );
          const statement = securitySql.match(policyStart)?.[0] ?? '';
          const predicate = new RegExp(
            `\\bfor\\s+${escape(policy.command)}\\b[^;]*\\b${escape(policy.predicate)}\\b[^;]*\\b${escape(policy.identity)}\\s*\\(\\s*\\)`,
            'i',
          );
          if (!statement || !predicate.test(statement)) {
            failures.push(
              `${record.resource}: security source is missing owner policy "${policy.name}" for public.${record.table}`,
            );
          }
        }
      }
    } else if (record.policies !== undefined) {
      failures.push(`${record.resource}: policy metadata requires owner policy mode`);
    }
  }
  for (const resource of knownResources) {
    if (byResource.has(resource)) continue;
    if (
      [
        'EditorialSubmission',
        'EditorialWork',
        'EditorialRightsAgreement',
        'EditorialAuthor',
        'UserRewards',
        'OperationReceipt',
      ].includes(resource)
    ) {
      failures.push(`${resource}: missing explicit SQL authority classification`);
    }
  }
  return failures;
}

function runAudit() {
  const registry = read('packages/policies/src/authorizationRegistry.ts');
  const zmodel = read('packages/schema/schema.zmodel');
  const cedar = read('packages/policies/src/schema/schema.cedarschema');
  const snapshotGenerator = read('packages/policies/src/snapshot/generator.ts');
  const localEvaluator = read('packages/core/src/logic/permissions/localEvaluator.native.ts');
  const snapshotTypes = read('packages/policies/src/snapshot/types.ts');
  const powerSyncSchema = read('packages/core/src/adapters/powersync/schema.ts');
  const snapshotMigration = read(
    'apps/gurudevi-mobile/supabase/migrations/20260726000001_entity_scoped_permission_snapshots.sql',
  );
  const citizenshipMigration = read(
    'apps/gurudevi-mobile/supabase/migrations/20260726000002_canonicalize_citizenship_default.sql',
  );
  const supabaseConfig = read('apps/gurudevi-mobile/supabase/config.toml');
  const authManager = read('packages/core/src/logic/managers/AuthManager.ts');

  const parseArray = (name) => {
    const match = registry.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`));
    if (!match) throw new Error(`Missing ${name} in authorization registry`);
    return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
  };

  const actions = parseArray('AUTHORIZATION_ACTIONS');
  const resources = parseArray('AUTHORIZATION_RESOURCES');
  const failures = [];
  const sqlAuthorities = JSON.parse(read('packages/policies/src/authorizationAuthorities.json'));
  const sqlAuthorityResources = new Set(sqlAuthorities.map((record) => record.resource));
  failures.push(...validateSqlAuthorities(root, sqlAuthorities, resources));

  for (const action of actions) {
    if (!cedar.includes(`"${action}"`)) failures.push(`Cedar is missing action "${action}"`);
  }

  for (const resource of resources) {
    if (!cedar.includes(`entity ${resource} {`)) {
      failures.push(`Cedar is missing resource entity "${resource}"`);
    }
    if (!snapshotGenerator.includes('const resourceTypes = AUTHORIZATION_RESOURCES')) {
      failures.push(`Snapshot generator is missing resource "${resource}"`);
    }
  }

  const zmodelAliases = {
    Student: null,
    GratitudeGift: 'GratitudeGift',
    PrivacyLedgerEntry: null,
    ClassroomEchoFeedback: null,
    FireJournal: 'FireJournalEntry',
    Ledger: 'LedgerEntry',
    Accounting: null,
    Payments: null,
    MappingTopology: 'MappingTopology',
    InventoryItem: 'InventoryItem',
    InventoryRequest: 'InventoryRequest',
    Guardian: 'StudentGuardianRelationship',
    JoyMoments: null,
    GratitudeEntries: null,
    EnergyForecasts: null,
    AIAssistant: null,
    Library: null,
    FormTemplate: null,
    Wellbeing: null,
    Staff: null,
    DailyContent: null,
    Calendar: 'CalendarEvent',
    PrincipalNote: null,
    Announcement: null,
    UserBlock: null,
    DirectConversation: null,
    DirectMessage: null,
    Manifesto: 'SanctuaryManifesto',
    ManifestoEndorsement: 'ManifestoEndorsement',
  };
  for (const resource of resources) {
    if (sqlAuthorityResources.has(resource)) continue;
    const model = Object.hasOwn(zmodelAliases, resource) ? zmodelAliases[resource] : resource;
    if (model && !new RegExp(`model\\s+${model}\\s*\\{`).test(zmodel)) {
      failures.push(`ZenStack is missing model "${model}" for resource "${resource}"`);
    }
  }

  const bondStart = zmodel.indexOf('model Bond');
  const bondModel = bondStart >= 0 ? zmodel.slice(bondStart, zmodel.indexOf('\n}', bondStart)) : '';
  for (const field of ['user_id', 'entity_id', 'entity_type', 'capacity']) {
    if (!new RegExp(`\\b${field}\\b`).test(bondModel)) {
      failures.push(`Bond is missing canonical relationship field "${field}"`);
    }
  }

  if (!localEvaluator.includes('EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR')) {
    failures.push('Local evaluator must keep dynamic Cedar behind an explicit opt-in');
  }
  if (!localEvaluator.includes('permissionSnapshots.findFirst')) {
    failures.push('Local evaluator must verify the signed snapshot contract');
  }
  for (const field of ['activeEntityId', 'activeEntityType']) {
    if (!snapshotTypes.includes(field)) failures.push(`Snapshot type is missing ${field}`);
  }
  for (const field of ['active_entity_id', 'active_entity_type']) {
    if (!powerSyncSchema.includes(field))
      failures.push(`PowerSync snapshot schema is missing ${field}`);
    if (!snapshotMigration.includes(field)) failures.push(`Snapshot migration is missing ${field}`);
  }
  if (!zmodel.includes('@default("THIRD_CLASS")')) {
    failures.push('ZenStack User.citizenship must default to THIRD_CLASS');
  }
  if (!citizenshipMigration.includes("SET citizenship = 'THIRD_CLASS'")) {
    failures.push('Citizenship migration must canonicalize legacy WANDERER values');
  }
  if (!/enable_anonymous_sign_ins\s*=\s*true/.test(supabaseConfig)) {
    failures.push('Supabase anonymous sign-ins must be enabled for the onboarding guest path');
  }
  if (!authManager.includes('this.authPort.signInAnonymously()')) {
    failures.push('AuthManager must preserve the Supabase anonymous onboarding path');
  }

  if (failures.length) {
    console.error('Authorization parity audit failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Authorization parity audit passed (${resources.length} resources, ${actions.length} actions; ZenStack/Cedar/snapshot checks plus ${sqlAuthorities.length} SQL migration classifications, without live privilege verification).`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runAudit();
