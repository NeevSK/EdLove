import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyDrift,
  loadIgnorePatterns,
  loadStructuredIgnoreManifest,
  parseZModelAst,
  renderDriftReport,
} from '../lib/database-drift-ast.mjs';

test('parseZModelAst extracts models and excludes relations', async () => {
  const fixture = `
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model User {
  id String @id
  email String?
  posts Post[]
  @@map("users")
}

model Post {
  id String @id
  title String
  author User @relation(fields: [authorId], references: [id])
  authorId String
  @@map("posts")
}
`;

  const fs = await import('node:fs');
  const tempFile = `${process.cwd()}/scripts/tests/.tmp-schema.zmodel`;
  fs.writeFileSync(tempFile, fixture, 'utf8');

  try {
    const parsed = await parseZModelAst(tempFile);
    assert.equal(parsed.success, true);
    assert.ok(parsed.models.users);
    assert.ok(parsed.models.posts);
    assert.ok(parsed.models.users.fields.email);
    assert.ok(!parsed.models.posts.fields.author);
    assert.ok(parsed.models.posts.fields.authorId);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
});

test('parseZModelAst honors mapped database column names', async () => {
  const fs = await import('node:fs');
  const tempFile = `${process.cwd()}/scripts/tests/.tmp-mapped-schema.zmodel`;
  fs.writeFileSync(
    tempFile,
    `datasource db { provider = "postgresql" url = env("DATABASE_URL") }\nmodel Grade { id String @id number Int @map("grade_number") }`,
    'utf8',
  );

  try {
    const parsed = await parseZModelAst(tempFile);
    assert.equal(parsed.success, true);
    assert.equal(parsed.models.Grade.fields.number.dbName, 'grade_number');
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
});

test('classifyDrift detects missing tables, extra tables, and lockout', () => {
  const models = {
    users: { name: 'User', fields: { id: { dbName: 'id', isOptional: false } } },
    posts: { name: 'Post', fields: { id: { isOptional: false }, title: { isOptional: false } } },
  };
  const dbSchema = {
    users: { id: { isNullable: false }, extra_col: { isNullable: true } },
    audit_logs: { id: { isNullable: false } },
  };
  const dbTablesRows = [
    { tablename: 'users', rowsecurity: true },
    { tablename: 'audit_logs', rowsecurity: false },
  ];
  const dbPolicies = { users: [] };

  const result = classifyDrift(models, dbSchema, dbTablesRows, dbPolicies, []);
  assert.equal(result.stats.TABLE_MISSING, 1);
  assert.equal(result.stats.EXTRA_TABLE_IN_DB, 1);
  assert.equal(result.stats.EXTRA_COLUMN_IN_DB, 1);
  assert.equal(result.stats.RLS_LOCKOUT, 1);
  assert.ok(result.structuralDrifts.some((d) => d.type === 'TABLE_MISSING'));
  assert.ok(result.policyDrifts.some((d) => d.type === 'RLS_LOCKOUT'));
});

test('classifyDrift treats @map database names as modeled columns', () => {
  const result = classifyDrift(
    { grades: { name: 'Grade', fields: { number: { dbName: 'grade_number', isOptional: false } } } },
    { grades: { grade_number: { isNullable: false } } },
    [{ tablename: 'grades', rowsecurity: false }],
    {},
    [],
  );
  assert.equal(result.stats.COLUMN_MISSING_IN_DB, 0);
  assert.equal(result.stats.EXTRA_COLUMN_IN_DB, 0);
});

test('classifyDrift distinguishes unmodeled views from unmodeled tables', () => {
  const result = classifyDrift(
    {},
    {
      active_classrooms: { classroom_id: { isNullable: false } },
      legacy_records: { id: { isNullable: false } },
    },
    [
      { tablename: 'active_classrooms', relkind: 'v', rowsecurity: false },
      { tablename: 'legacy_records', relkind: 'r', rowsecurity: false },
    ],
    {},
    [],
  );
  assert.equal(result.stats.EXTRA_VIEW_IN_DB, 1);
  assert.equal(result.stats.EXTRA_TABLE_IN_DB, 1);
  assert.equal(result.structuralDrifts.find((d) => d.table === 'active_classrooms').severity, 'low');
});

test('renderDriftReport includes provenance and snapshot links', () => {
  const report = renderDriftReport({
    today: '2026-06-27',
    score: 92,
    counts: {
      zmodelTables: 2,
      dbTables: 3,
      ignoredTables: 1,
      totalChecks: 10,
      passedChecks: 9,
    },
      stats: {
      TABLE_MISSING: 1,
      EXTRA_TABLE_IN_DB: 0,
      EXTRA_VIEW_IN_DB: 0,
      COLUMN_MISSING_IN_DB: 0,
      EXTRA_COLUMN_IN_DB: 0,
      NULLABILITY_MISMATCH: 0,
      RLS_LOCKOUT: 0,
    },
    structuralDrifts: [],
    policyDrifts: [],
    snapshotPath: 'apps/gurudevi-mobile/reports/db-drift/snapshot.json',
    summaryPath: 'apps/gurudevi-mobile/reports/db-drift/summary.json',
  });

  assert.match(report, /Provenance/);
  assert.match(report, /Snapshot JSON/);
  assert.match(report, /Summary JSON/);
  assert.match(report, /TABLE_MISSING/);
});

test('loadIgnorePatterns parses wildcards', async () => {
  const fs = await import('node:fs');
  const tempFile = `${process.cwd()}/scripts/tests/.tmp-driftignore`;
  fs.writeFileSync(tempFile, 'audit_*\n# comment\n', 'utf8');
  try {
    const patterns = loadIgnorePatterns(tempFile);
    assert.equal(patterns.length, 1);
    assert.equal(patterns[0].regex.test('audit_logs'), true);
    assert.equal(patterns[0].regex.test('users'), false);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
});

test('loadStructuredIgnoreManifest flags missing metadata and broad globs', async () => {
  const fs = await import('node:fs');
  const tempFile = `${process.cwd()}/scripts/tests/.tmp-driftignore.ast.json`;
  fs.writeFileSync(
    tempFile,
    JSON.stringify({
      version: 1,
      entries: [
        {
          table: 'audit_*',
          mode: 'glob',
          reason: 'test glob',
          owner: 'Test',
          reviewedAt: '2026-06-27',
          reviewer: 'Tester',
        },
        {
          table: 'missing_reason',
          mode: 'exact',
          owner: 'Test',
          reviewedAt: '2026-06-27',
          reviewer: 'Tester',
        },
      ],
    }),
    'utf8',
  );

  try {
    const manifest = loadStructuredIgnoreManifest(tempFile);
    assert.equal(manifest.entries.length, 2);
    assert.ok(manifest.warnings.some((w) => w.includes('Broad glob ignore pattern')));
    assert.ok(manifest.warnings.some((w) => w.includes('missing reason')));
    assert.equal(manifest.entries[0].regex.test('audit_logs'), true);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
});
