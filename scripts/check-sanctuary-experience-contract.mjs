import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repositoryRoot = process.cwd();
const sourceRoots = [
  'apps/gurudevi-mobile/app',
  'packages/core/src',
  'packages/self/src',
  'packages/community/src',
  'packages/library/src',
  'packages/profile/src',
  'packages/classroom/src',
  'packages/ui/src',
];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const ignoredPathSegments = new Set(['archive', '__tests__', 'test-shims']);

const rules = [
  {
    name: '@ts-nocheck in a live Sanctuary source file',
    expression: /@ts-nocheck/,
    allowedFiles: new Set([
      'packages/self/src/features/selfCanvasStore.ts',
      'packages/self/src/screens/SelfScreen.unified.tsx',
    ]),
  },
  {
    name: 'PanResponder in new Sanctuary code',
    expression: /\bPanResponder\b/,
    allowedFiles: new Set([
      'packages/ui/src/components/LotusPetalFAB.tsx',
      'packages/ui/src/components/TemporalScrubber.tsx',
      'packages/ui/src/primitives.ts',
    ]),
  },
  {
    name: 'JS-thread Animated.event in new Sanctuary code',
    expression: /\bAnimated\.event\b/,
    allowedFiles: new Set(['packages/ui/src/components/TemporalScrubber.tsx']),
  },
  {
    name: 'deprecated RNGH Gesture builder in new Sanctuary code',
    expression: /\bGesture\.(?:Pan|Pinch|LongPress|Tap|Simultaneous)\s*\(/,
    allowedFiles: new Set(['packages/ui/src/components/visualization/AstroView.tsx']),
  },
  {
    name: 'InteractionManager in new Sanctuary code',
    expression: /\bInteractionManager\b/,
    allowedFiles: new Set(['packages/core/src/hooks/useAppLifecycle.ts']),
  },
  {
    name: 'Reanimated compatibility runOnJS import',
    expression:
      /import\s*\{[^}]*\brunOnJS\b[^}]*\}\s*from\s*['\"]react-native-reanimated['\"]/s,
    allowedFiles: new Set(),
  },
  {
    name: 'broad ESLint disable in a live Sanctuary source file',
    expression: /\/\*\s*eslint-disable\s*\*\//,
    allowedFiles: new Set(['packages/ui/src/components/workspace/DraggableCanvasSurface.tsx']),
  },
];

const permittedArchitectureTestExclusions = new Set([
  'src/__tests__/architecture/AppPerformance.test.tsx',
  'src/__tests__/architecture/classroom-surface-entrypoints.test.ts',
  'src/__tests__/architecture/founder-stack-boundaries.test.ts',
]);

function walk(relativeDirectory) {
  const absoluteDirectory = path.join(repositoryRoot, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) return [];

  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) {
      return ignoredPathSegments.has(entry.name) ? [] : walk(relativePath);
    }
    return sourceExtensions.has(path.extname(entry.name)) ? [relativePath] : [];
  });
}

const violations = [];
for (const relativePath of sourceRoots.flatMap(walk)) {
  const source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  for (const rule of rules) {
    if (rule.expression.test(source) && !rule.allowedFiles.has(relativePath)) {
      violations.push(`${relativePath}: ${rule.name}`);
    }
  }
}

const mobileVitestConfigPath = 'apps/gurudevi-mobile/vitest.config.mts';
const mobileVitestConfig = fs.readFileSync(path.join(repositoryRoot, mobileVitestConfigPath), 'utf8');
const architectureTestExclusions = new Set(
  [...mobileVitestConfig.matchAll(/['\"](src\/__tests__\/architecture\/[^'\"]+)['\"]/g)].map(
    (match) => match[1],
  ),
);
for (const excludedTest of architectureTestExclusions) {
  if (!permittedArchitectureTestExclusions.has(excludedTest)) {
    violations.push(`${mobileVitestConfigPath}: unapproved architecture test exclusion (${excludedTest})`);
  }
}
for (const permittedExclusion of permittedArchitectureTestExclusions) {
  if (!architectureTestExclusions.has(permittedExclusion)) {
    violations.push(`${mobileVitestConfigPath}: expected exclusion missing from reviewed baseline (${permittedExclusion})`);
  }
}

if (violations.length > 0) {
  console.error('Sanctuary experience contract failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('Sanctuary experience contract passed.');
