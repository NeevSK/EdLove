import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateSqlAuthorities } from '../check-authorization-parity.mjs';

const repositoryRoot = process.cwd();
const authorities = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, 'packages/policies/src/authorizationAuthorities.json'),
    'utf8',
  ),
);
const resources = authorities.map(({ resource }) => resource);

function withFixture(files, run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'authorization-authorities-'));
  try {
    for (const [relative, contents] of Object.entries(files)) {
      const target = path.join(root, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents);
    }
    run(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const receiptAuthority = {
  resource: 'OperationReceipt',
  table: 'operation_receipts',
  tableSource: 'migrations/table.sql',
  securitySource: 'migrations/security.sql',
  admission: 'server-owned',
  policyMode: 'default-deny',
  requireClientRevoke: true,
};

const receiptFiles = {
  'migrations/table.sql': 'CREATE TABLE public.operation_receipts (id uuid primary key);',
  'migrations/security.sql':
    'ALTER TABLE public.operation_receipts ENABLE ROW LEVEL SECURITY; REVOKE ALL ON TABLE public.operation_receipts FROM anon, authenticated;',
};

test('current SQL authorities reference their declared table and security migrations', () => {
  assert.deepEqual(validateSqlAuthorities(repositoryRoot, authorities, resources), []);
});

test('accepts a server-owned SQL table with RLS enabled and client roles revoked', () => {
  withFixture(receiptFiles, (root) => {
    assert.deepEqual(validateSqlAuthorities(root, [receiptAuthority], ['OperationReceipt']), []);
  });
});

test('rejects a table source that creates a different SQL table', () => {
  withFixture(
    { ...receiptFiles, 'migrations/table.sql': 'CREATE TABLE public.other_table (id uuid);' },
    (root) => {
      assert.ok(
        validateSqlAuthorities(root, [receiptAuthority], ['OperationReceipt']).some((failure) =>
          failure.includes('does not create public.operation_receipts'),
        ),
      );
    },
  );
});

test('does not accept commented SQL as table or RLS evidence', () => {
  withFixture(
    {
      'migrations/table.sql': '-- CREATE TABLE public.operation_receipts (id uuid);',
      'migrations/security.sql':
        '-- ALTER TABLE public.operation_receipts ENABLE ROW LEVEL SECURITY; REVOKE ALL ON TABLE public.operation_receipts FROM anon, authenticated;',
    },
    (root) => {
      const failures = validateSqlAuthorities(root, [receiptAuthority], ['OperationReceipt']);
      assert.ok(
        failures.some((failure) => failure.includes('does not create public.operation_receipts')),
      );
      assert.ok(failures.some((failure) => failure.includes('does not enable RLS')));
      assert.ok(
        failures.some((failure) => failure.includes('missing anon/authenticated table revoke')),
      );
    },
  );
});

test('rejects missing RLS activation and missing client revocation separately', () => {
  withFixture(
    {
      ...receiptFiles,
      'migrations/security.sql':
        'REVOKE ALL ON TABLE public.operation_receipts FROM anon, authenticated;',
    },
    (root) => {
      assert.ok(
        validateSqlAuthorities(root, [receiptAuthority], ['OperationReceipt']).some((failure) =>
          failure.includes('does not enable RLS'),
        ),
      );
    },
  );
  withFixture(
    {
      ...receiptFiles,
      'migrations/security.sql': 'ALTER TABLE public.operation_receipts ENABLE ROW LEVEL SECURITY;',
    },
    (root) => {
      assert.ok(
        validateSqlAuthorities(root, [receiptAuthority], ['OperationReceipt']).some((failure) =>
          failure.includes('missing anon/authenticated table revoke'),
        ),
      );
    },
  );
  withFixture(
    {
      ...receiptFiles,
      'migrations/security.sql':
        'ALTER TABLE public.operation_receipts ENABLE ROW LEVEL SECURITY; REVOKE ALL ON TABLE public.operation_receipts FROM anon;',
    },
    (root) => {
      assert.ok(
        validateSqlAuthorities(root, [receiptAuthority], ['OperationReceipt']).some((failure) =>
          failure.includes('missing anon/authenticated table revoke'),
        ),
      );
    },
  );
});

test('rejects missing migration files and missing SQL authority classifications', () => {
  withFixture({ 'migrations/security.sql': receiptFiles['migrations/security.sql'] }, (root) => {
    const failures = validateSqlAuthorities(
      root,
      [receiptAuthority],
      ['OperationReceipt', 'EditorialWork'],
    );
    assert.ok(failures.some((failure) => failure.includes('missing table migration source')));
    assert.ok(failures.some((failure) => failure.includes('EditorialWork: missing explicit')));
  });
});

test('owner authority requires each declared policy to bind to canonical identity', () => {
  const authority = {
    ...receiptAuthority,
    resource: 'UserRewards',
    table: 'user_rewards',
    tableSource: 'migrations/table.sql',
    securitySource: 'migrations/policies.sql',
    rlsSource: 'migrations/rls.sql',
    admission: 'legacy-not-admitted',
    policyMode: 'owner',
    requireClientRevoke: false,
    policies: [
      {
        name: 'Users can view own rewards',
        command: 'SELECT',
        predicate: 'USING',
        identity: 'get_my_id',
      },
      {
        name: 'Users can insert own rewards',
        command: 'INSERT',
        predicate: 'WITH CHECK',
        identity: 'get_my_id',
      },
      {
        name: 'Users can update own rewards',
        command: 'UPDATE',
        predicate: 'USING',
        identity: 'get_my_id',
      },
    ],
  };
  const files = {
    'migrations/table.sql': 'CREATE TABLE public.user_rewards (id uuid primary key);',
    'migrations/rls.sql': 'ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;',
    'migrations/policies.sql': [
      'CREATE POLICY "Users can view own rewards" ON public.user_rewards FOR SELECT USING (user_id = get_my_id());',
      'CREATE POLICY "Users can insert own rewards" ON public.user_rewards FOR INSERT WITH CHECK (user_id = get_my_id());',
      'CREATE POLICY "Users can update own rewards" ON public.user_rewards FOR UPDATE USING (user_id = get_my_id());',
    ].join('\n'),
  };
  withFixture(files, (root) => {
    assert.deepEqual(validateSqlAuthorities(root, [authority], ['UserRewards']), []);
    const incomplete = {
      ...files,
      'migrations/policies.sql': files['migrations/policies.sql'].replaceAll(
        'get_my_id()',
        'auth.uid()',
      ),
    };
    withFixture(incomplete, (incompleteRoot) => {
      const failures = validateSqlAuthorities(incompleteRoot, [authority], ['UserRewards']);
      assert.equal(
        failures.filter((failure) => failure.includes('missing owner policy')).length,
        3,
        JSON.stringify(failures),
      );
    });
  });
});
