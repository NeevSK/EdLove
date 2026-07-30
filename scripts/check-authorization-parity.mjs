#!/usr/bin/env node

/**
 * Fails closed when the shared authorization vocabulary drifts from Cedar or
 * the ZenStack source model. This is intentionally source-based: generated
 * ORM output is a derivative and cannot become a second policy authority.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

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
  FireJournal: 'FireJournalEntry',
  Ledger: 'LedgerEntry',
  Guardian: 'StudentGuardianRelationship',
  JoyMoments: null,
  GratitudeEntries: null,
  EnergyForecasts: null,
  AIAssistant: null,
};
for (const resource of resources) {
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
  `Authorization parity audit passed (${resources.length} resources, ${actions.length} actions; ZenStack source + Cedar schema + local snapshot checks).`,
);
