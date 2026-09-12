import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = ['packages', 'apps'];
const violations = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) walk(path);
      continue;
    }
    if (entry.name !== 'package.json') continue;

    const packageJson = JSON.parse(readFileSync(path, 'utf8'));
    for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
      if (name !== 'test' && !name.startsWith('test:')) continue;
      if (name === 'test:governance') continue;

      const level = command.match(/--evidence-level\s+(G[0-5]|R1)\b/)?.[1];
      const delegatesToLevelledScript =
        name === 'test' && /pnpm\s+run\s+test:(boundary|runtime|native)\b/.test(command);
      if (!level && !delegatesToLevelledScript) {
        violations.push(`${relative(process.cwd(), path)} :: ${name} :: ${command}`);
      }
    }
  }
}

for (const root of roots) walk(root);

if (violations.length > 0) {
  console.error(
    `Test evidence audit failed: ${violations.length} test scripts have no explicit evidence level.`,
  );
  for (const violation of violations) console.error(`UNLEVELLED: ${violation}`);
  console.error(
    'Add --evidence-level G0|G1|G2|G3|G4|G5|R1 to the shared test runner command, or classify the direct runner before reporting its result.',
  );
  process.exit(1);
}

console.log(
  'Test evidence audit passed: every package/app test script declares an evidence level.',
);
