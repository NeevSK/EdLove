import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['apps', 'packages'].map((directory) => path.join(root, directory));
const sourceExtensions = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const ignoredDirectories = new Set([
  'node_modules',
  'dist',
  '.expo',
  '.turbo',
  '.vercel',
  'archives',
  'coverage',
]);

const ownership = [
  {
    name: 'Sentry',
    pattern: /(?:from\s+|import\s*\(|require\s*\(\s*)['"](?:@sentry\/|sentry-expo)/,
    allowed: (file) =>
      file.includes('/packages/core/src/adapters/native/SentryTelemetryAdapter.') ||
      file.includes('/packages/core/src/adapters/web/SentryTelemetryAdapter.') ||
      file.includes('/__tests__/') ||
      file.includes('/__mocks__/') ||
      file.endsWith('/jest-setup.ts') ||
      file.endsWith('/jest.config.js') ||
      file.endsWith('/vitest.config.ts') ||
      file.endsWith('/metro.config.js') ||
      file.includes('/src/shims/'),
  },
  {
    name: 'PostHog',
    pattern:
      /(?:from\s+|import\s*\(|require\s*\(\s*)['"](?:posthog-js|posthog-react-native|posthog-node)/,
    allowed: (file) => file.includes('/packages/analytics/src/') || file.includes('/__tests__/'),
  },
  {
    name: 'OpenTelemetry',
    pattern: /(?:from\s+|import\s*\(|require\s*\(\s*)['"]@opentelemetry\//,
    allowed: (file) =>
      file.includes('/apps/sanctuary-api/src/telemetry/') ||
      file.endsWith('/apps/sanctuary-api/src/telemetry.ts') ||
      file.includes('/apps/sanctuary-api/src/__tests__/'),
  },
];

const filesIn = (directory) => {
  const files = [];
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...filesIn(absolute));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
};

const isNonRuntimeFile = (file) =>
  file.includes('/__tests__/') ||
  file.includes('/__mocks__/') ||
  file.includes('/scripts/') ||
  file.endsWith('/jest-setup.ts') ||
  file.endsWith('/jest.config.js') ||
  file.endsWith('/vitest.config.ts') ||
  file.endsWith('/metro.config.js') ||
  file.includes('/src/shims/');

const violations = [];
for (const file of scanRoots.flatMap(filesIn)) {
  const relative = `/${path.relative(root, file).replaceAll(path.sep, '/')}`;
  const content = fs.readFileSync(file, 'utf8');
  for (const rule of ownership) {
    if (rule.pattern.test(content) && !rule.allowed(relative)) {
      violations.push(`${rule.name} SDK import outside its adapter boundary: ${relative}`);
    }
  }

  if (!isNonRuntimeFile(relative)) {
    const importsSentry = ownership[0].pattern.test(content);
    const importsPostHog = ownership[1].pattern.test(content);
    const importsOpenTelemetry = ownership[2].pattern.test(content);

    if (importsOpenTelemetry && (importsSentry || importsPostHog)) {
      violations.push(`Runtime module mixes OpenTelemetry with Sentry/PostHog SDKs: ${relative}`);
    }
    if (importsSentry && importsPostHog) {
      violations.push(`Runtime module mixes Sentry and PostHog SDKs: ${relative}`);
    }
  }
}

if (violations.length > 0) {
  console.error('❌ Observability boundary violations found:');
  for (const violation of violations) console.error(`   - ${violation}`);
  process.exit(1);
}

console.log(
  '✅ Observability boundaries are enforced: Sentry, PostHog, and OpenTelemetry ownership is isolated.',
);
