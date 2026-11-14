import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { scanDirectory } from '../check-identity-alignment.mjs';

function removeFixture(directory) {
  const absolute = path.resolve(directory);
  assert.equal(path.dirname(absolute), path.resolve(os.tmpdir()));
  assert.match(path.basename(absolute), /^identity-(audit|source)-/);
  fs.rmSync(absolute, { recursive: true, force: true });
}

test('dangling and cyclic links cannot hide an identity violation', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-audit-'));
  t.after(() => removeFixture(root));
  const source = path.join(root, 'source');
  fs.mkdirSync(source);
  fs.writeFileSync(path.join(source, 'identity.ts'), 'supabase.auth.getUser();');
  fs.symlinkSync(path.join(root, 'missing'), path.join(root, 'dangling'), 'junction');
  fs.symlinkSync(root, path.join(source, 'cycle'), 'junction');
  fs.symlinkSync(source, path.join(root, 'linked'), 'junction');

  const results = scanDirectory(root, [], root);
  assert.equal(results.length, 1);
  assert.equal(results[0].patternId, 'DIRECT_SUPABASE_GET_USER');
  assert.equal(results[0].priority, 'HIGH');
});

test('valid linked source outside the root is scanned and non-link I/O errors fail', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-audit-'));
  t.after(() => removeFixture(root));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-source-'));
  t.after(() => removeFixture(outside));
  fs.writeFileSync(path.join(outside, 'linked.ts'), 'supabase.auth.getUser();');
  fs.symlinkSync(outside, path.join(root, 'linked'), 'junction');

  assert.equal(scanDirectory(root, [], root)[0].priority, 'HIGH');
  assert.throws(() => scanDirectory(path.join(root, 'absent'), [], root), { code: 'ENOENT' });
});

test('minified source snippets stay bounded without suppressing findings', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-audit-'));
  t.after(() => removeFixture(root));
  fs.writeFileSync(path.join(root, 'bundle.js'), 'supabase.auth.getUser();' + 'x'.repeat(100000));
  const results = scanDirectory(root, [], root);
  assert.equal(results.length, 1);
  assert.equal(results[0].priority, 'HIGH');
  assert.equal(results[0].snippet.length, 240);
});
