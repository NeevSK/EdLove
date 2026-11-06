#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schema = join(root, 'src', 'schema', 'schema.cedarschema');
const policyRoot = join(root, 'src', 'policies');
const binary = process.env.CEDAR_CLI || 'cedar';
const verbose = process.argv.includes('--verbose');
const denyWarnings = process.argv.includes('--deny-warnings');

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? filesIn(path)
      : entry.isFile() && entry.name.endsWith('.cedar')
        ? [path]
        : [];
  });
}

function run(args) {
  const result = spawnSync(binary, args, { encoding: 'utf8' });
  if (result.error) {
    console.error(
      `Cannot run Cedar CLI (${binary}): ${result.error.message}. Install Cedar or set CEDAR_CLI to its executable.`,
    );
    process.exit(2);
  }
  return result;
}

const version = run(['--version']);
if (version.status !== 0) {
  console.error(version.stderr || 'Could not determine Cedar CLI version.');
  process.exit(2);
}
console.log(version.stdout.trim());
if (process.argv.includes('--scenarios')) {
  const result = run([
    'run-tests',
    '--schema',
    schema,
    '--policies',
    join(policyRoot, 'platform', 'ai.cedar'),
    '--tests',
    join(root, 'src', '__tests__', 'fixtures', 'ai.cedar-tests.json'),
    '--error-format',
    'plain',
  ]);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 2);
}
const files = filesIn(policyRoot).sort();
if (files.length === 0) {
  console.error('No Cedar policy files found.');
  process.exit(2);
}
let failed = 0;
for (const file of files) {
  const result = run([
    'validate',
    '--schema',
    schema,
    '--policies',
    file,
    ...(denyWarnings ? ['--deny-warnings'] : []),
    '--error-format',
    'plain',
  ]);
  console.log(`${result.status === 0 ? 'PASS' : 'FAIL'} ${relative(root, file)}`);
  if (result.status !== 0) {
    failed++;
    const diagnostic = (result.stderr || result.stdout).trim();
    console.error(verbose ? diagnostic : diagnostic.split('\n').slice(0, 4).join('\n'));
  } else {
    const diagnostic = `${result.stdout}\n${result.stderr}`.trim();
    if (diagnostic.includes('Diagnostic severity: warning')) {
      console.warn(`WARN ${relative(root, file)}: Cedar reported validation warnings.`);
      if (verbose) console.warn(diagnostic);
    }
  }
}
console.log(
  `Validated ${files.length} policy files: ${files.length - failed} passed, ${failed} failed.`,
);
if (failed && !verbose) console.log('Use --verbose to see all diagnostics.');
process.exitCode = failed ? 1 : 0;
