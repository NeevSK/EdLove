import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(packageRoot, 'src');
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const boundaryConfig = readFileSync(join(packageRoot, 'vitest.config.mts'), 'utf8');
const runtimeConfig = readFileSync(join(packageRoot, 'vitest.native.config.mts'), 'utf8');
const inventoryPath = join(packageRoot, 'docs', 'architecture', 'ui-test-evidence-inventory.md');

function collectTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTests(path);
    return /\.(test|spec)\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const tests = collectTests(sourceRoot);
const rendered = tests.filter((path) =>
  /render\(|renderHook\(|fireEvent|userEvent/.test(readFileSync(path, 'utf8')),
);
const explicitBoundary = tests.filter((path) =>
  /vi\.mock|jest\.mock|mockImplementation|mockReturnValue|mockResolvedValue|mockRejectedValue|react-native-css|nativewind/.test(
    readFileSync(path, 'utf8'),
  ),
);

const errors = [];
const evidenceLevels = new Set(['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'R1']);
const testScripts = Object.entries(packageJson.scripts).filter(
  ([name]) => name === 'test' || name.startsWith('test:'),
);

for (const [name, command] of testScripts) {
  if (name === 'test:governance') continue;
  const level = command.match(/--evidence-level\s+(G[0-5]|R1)\b/)?.[1];
  const delegatesToLevelledScript =
    name === 'test' && /pnpm\s+run\s+test:(boundary|runtime|native)\b/.test(command);
  if (!level && !delegatesToLevelledScript) {
    errors.push(`${name} must declare --evidence-level or delegate to a levelled test script`);
  }
  if (level && !evidenceLevels.has(level)) {
    errors.push(`${name} declares unsupported evidence level ${level}`);
  }
}

if (!packageJson.scripts['test:boundary']?.includes('vitest.config.mts')) {
  errors.push('test:boundary must use vitest.config.mts');
}
if (!packageJson.scripts['test:runtime']?.includes('vitest.native.config.mts')) {
  errors.push('test:runtime must use vitest.native.config.mts');
}
if (!boundaryConfig.includes("engine: 'mock'")) {
  errors.push('vitest.config.mts must declare the boundary engine explicitly');
}
if (!runtimeConfig.includes("engine: 'native'")) {
  errors.push('vitest.native.config.mts must declare the real native engine explicitly');
}
if (runtimeConfig.includes('src/**/*.{test,spec}.{ts,tsx}')) {
  errors.push(
    'vitest.native.config.mts must not promote the entire mock-oriented suite to the runtime lane',
  );
}
if (
  packageJson.scripts.test?.includes('vitest run') &&
  !packageJson.scripts.test.includes('test:boundary')
) {
  errors.push('test must remain an explicit compatibility alias, not an unlabeled Vitest lane');
}
if (!existsSync(inventoryPath)) {
  errors.push('ui-test-evidence-inventory.md is required for G1/G2 classification');
}

const inventory = existsSync(inventoryPath) ? readFileSync(inventoryPath, 'utf8') : '';
for (const primitive of [
  'Button',
  'Input/TextInput',
  'FormField',
  'Dialog/Modal',
  'Sheet/Actionsheet',
  'Select/Combobox',
  'Tabs',
  'Toast',
  'Checkbox',
  'Radio',
  'Switch',
  'Progress',
  'Popover',
]) {
  if (!inventory.includes(`| ${primitive} |`)) {
    errors.push(`evidence inventory is missing Tier-1 primitive: ${primitive}`);
  }
}

console.log(
  `UI evidence audit: ${tests.length} test files; ${rendered.length} render; ${explicitBoundary.length} explicit boundary/mock references.`,
);
console.log(
  'The default render suite is boundary evidence until it runs through a non-mock configuration.',
);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exitCode = 1;
}

for (const path of explicitBoundary) {
  console.log(`BOUNDARY: ${relative(packageRoot, path)}`);
}
