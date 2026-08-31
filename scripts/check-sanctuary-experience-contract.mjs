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

const feedbackComponentContracts = [
  {
    file: 'packages/ui/src/components/BrandPulse.tsx',
    required: /<Mascot\b/,
    forbidden: /react-native-svg|<Svg\b/,
    description: 'loading must use the configurable mascot rather than an embedded logo asset',
  },
  {
    file: 'packages/ui/src/components/BrandedEmptyState.tsx',
    required: /<FireflyFeedbackScene\b/,
    forbidden: /FireflyMascot/,
    description: 'empty states must use the shared feedback scene',
  },
  {
    file: 'packages/ui/src/components/ErrorState.tsx',
    required: /<FireflyFeedbackScene\b/,
    forbidden: /FireflyMascot/,
    description: 'error states must use the shared feedback scene',
  },
  {
    file: 'packages/library/src/screens/ResourceHubScreen.tsx',
    required: /if\s*\(!resourceId\)[\s\S]{0,800}<BrandedErrorState\b/,
    forbidden: /if\s*\(!resourceId\)[\s\S]{0,800}<BrandedEmptyState\b/,
    description: 'an invalid resource route must remain a recoverable error, not an empty library',
  },
  {
    file: 'packages/library/src/screens/LibraryScreen.tsx',
    required: /const handleBookmark[\s\S]{0,900}catch[\s\S]{0,240}hapticError\(\)[\s\S]{0,240}showToast\(/,
    forbidden: /const handleBookmark[\s\S]{0,900}catch[\s\S]{0,240}console\.(?:error|warn)\(/,
    description: 'native bookmark failures must remain visible and tactile rather than console-only',
  },
  {
    file: 'packages/library/src/screens/LibraryScreen.tsx',
    required: /const handleAddToCollection[\s\S]{0,900}catch[\s\S]{0,240}hapticError\(\)[\s\S]{0,240}showToast\(/,
    forbidden: /const handleAddToCollection[\s\S]{0,900}catch[\s\S]{0,240}console\.(?:error|warn)\(/,
    description: 'native collection failures must remain visible and tactile rather than console-only',
  },
  {
    file: 'packages/library/src/screens/LibraryScreen.tsx',
    required: /const onRefresh[\s\S]{0,1200}catch[\s\S]{0,240}hapticError\(\)[\s\S]{0,240}showToast\(/,
    forbidden: /const onRefresh[\s\S]{0,1200}catch[\s\S]{0,240}console\.(?:error|warn)\(/,
    description: 'native refresh failures must remain visible and tactile rather than console-only',
  },
  {
    file: 'packages/library/src/screens/LibraryScreen.web.tsx',
    required: /const handleOpenResource[\s\S]{0,1000}catch[\s\S]{0,240}showToast\(/,
    forbidden: /const handleOpenResource[\s\S]{0,1000}catch[\s\S]{0,240}console\.(?:error|warn)\(/,
    description: 'web external-link failures must remain visible rather than console-only',
  },
  {
    file: 'packages/library/src/screens/LibraryScreen.tsx',
    required: /SET_FALLBACK_ERROR[\s\S]{0,220}Public collections could not be loaded[\s\S]{0,16000}retryPublicCollectionsFallback/,
    forbidden: /\.catch\(\(_err: any\) => \{[\s\S]{0,180}MARK_FALLBACK_ATTEMPTED[\s\S]{0,180}\}\)/,
    description: 'native public-collection fallback failures must remain visible and retryable rather than masquerading as empty',
  },
  {
    file: 'packages/library/src/screens/LibraryScreen.web.tsx',
    required: /SET_FALLBACK_ERROR[\s\S]{0,220}Public collections could not be loaded[\s\S]{0,16000}retryPublicCollectionsFallback/,
    forbidden: /\.catch\(\(_err: Error\) => \{[\s\S]{0,180}MARK_FALLBACK_ATTEMPTED[\s\S]{0,180}\}\)/,
    description: 'web public-collection fallback failures must remain visible and retryable rather than masquerading as empty',
  },
  {
    file: 'packages/self/src/components/SelfCanvas.web.tsx',
    required: /function SortableSelfCanvasCard[\s\S]{0,1200}aria-label=\{`Reorder \$\{props\.feature\.label\}`\}/,
    forbidden: /WebDraggableCanvasSurface|@ts-ignore.*dnd-kit/,
    description: 'web Self cards must use a typed dedicated accessible drag handle, not a card-wide sensor',
  },
];

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

for (const contract of feedbackComponentContracts) {
  const source = fs.readFileSync(path.join(repositoryRoot, contract.file), 'utf8');
  if (!contract.required.test(source) || contract.forbidden.test(source)) {
    violations.push(`${contract.file}: ${contract.description}`);
  }
}

if (violations.length > 0) {
  console.error('Sanctuary experience contract failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('Sanctuary experience contract passed.');
