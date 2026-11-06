import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

const args = process.argv.slice(2);
const isFull = args.includes('--full');
const isStrict = args.includes('--strict');
const isDelta = args.includes('--delta') || (!isFull && !isStrict);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'android',
  'ios',
  '.expo',
  'reports',
  'coverage',
  '.git',
]);

const LEGACY_RATCHET_DIRS = [
  'packages/ui/src/components/ui', // grandfathered gluestack kit
  'packages/ui/primitives',
];

function isGrandfathered(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  // RN Web (*.web.tsx) is migration source only, tracked under ui-legacy-ratchet.json
  if (norm.endsWith('.web.tsx')) return true;
  return LEGACY_RATCHET_DIRS.some((dir) => norm.includes(dir));
}

function isTestOrDoc(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  return (
    norm.includes('__tests__') ||
    norm.includes('.test.') ||
    norm.includes('.spec.') ||
    norm.includes('/test-shims/') ||
    norm.includes('-mock.') ||
    norm.includes('/docs/') ||
    norm.endsWith('.md')
  );
}

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Strip block comments, single-line comments, and template string examples for clean AST/regex inspection
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length))
    .replace(/\/\/.*/g, '');
}

// Source file filter
const isSourceFile = (p) =>
  (p.startsWith('apps/') || p.startsWith('packages/')) &&
  (p.endsWith('.ts') || p.endsWith('.tsx')) &&
  !p.includes('node_modules');

function getChangedFiles() {
  try {
    const diffNames = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD', '--'], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/\\/g, '/'))
      .filter(isSourceFile);

    const untracked = execFileSync(
      'git',
      ['ls-files', '--others', '--exclude-standard', '--', 'apps', 'packages'],
      { cwd: ROOT_DIR, encoding: 'utf8' },
    )
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/\\/g, '/'))
      .filter(isSourceFile);

    return Array.from(new Set([...diffNames, ...untracked])).map((p) => path.join(ROOT_DIR, p));
  } catch {
    return [];
  }
}

function harvestAllFiles() {
  try {
    const output = execFileSync(
      'fd',
      ['-e', 'ts', '-e', 'tsx', '-E', 'node_modules', '-E', '.next', '-E', '.turbo', '-E', 'dist', '-E', 'build', '-E', 'android', '-E', 'ios', '-E', '.expo', '.', 'packages', 'apps'],
      { cwd: ROOT_DIR, encoding: 'utf8' }
    );
    return output.split(/\r?\n/).filter(Boolean).map((p) => path.join(ROOT_DIR, p));
  } catch {
    return [
      ...walk(path.join(ROOT_DIR, 'packages')),
      ...walk(path.join(ROOT_DIR, 'apps')),
    ];
  }
}

// Harvest files based on mode
const allMonorepoFiles = harvestAllFiles();

const targetFiles = isDelta && !isFull ? getChangedFiles() : allMonorepoFiles;

const allAppFiles = allMonorepoFiles.filter((f) => {
  const norm = f.replace(/\\/g, '/');
  return (
    (norm.includes('/apps/gurudevi-web/') ||
      norm.includes('/apps/gurudevi-mobile/') ||
      norm.includes('/apps/sanctuary-api/src/')) &&
    !isTestOrDoc(norm)
  );
});

// Cache monorepo file contents for caller lookups
const rawFileContents = new Map();
const strippedFileContents = new Map();

for (const f of allMonorepoFiles) {
  try {
    const raw = fs.readFileSync(f, 'utf8');
    rawFileContents.set(f, raw);
    strippedFileContents.set(f, stripComments(raw));
  } catch {
    // ignore
  }
}

// In-degree helper
function getAppCallers(baseName) {
  const importRegex = new RegExp(`from\\s+['"][^'"]*${baseName}['"]|import\\s*\\(['"][^'"]*${baseName}['"]\\)`, 'g');
  const callers = [];
  for (const appFile of allAppFiles) {
    const text = rawFileContents.get(appFile);
    if (text && importRegex.test(text)) {
      callers.push(path.relative(ROOT_DIR, appFile).replace(/\\/g, '/'));
    }
  }
  return callers;
}

const violations = [];
const debtItems = [];
const filteredFalsePositives = [];

for (const filePath of targetFiles) {
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const rawContent = rawFileContents.get(filePath) ?? (fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '');
  const cleanContent = strippedFileContents.get(filePath) ?? stripComments(rawContent);
  const rawLines = rawContent.split('\n');
  const baseName = path.basename(filePath).replace(/\.(ts|tsx)$/, '');
  const isGrandfatheredLegacy = isGrandfathered(filePath);
  const isTest = isTestOrDoc(filePath);

  // -------------------------------------------------------------
  // DOMAIN 1: JAVA OOP CONTAMINATION
  // -------------------------------------------------------------

  if (!isTest) {
    // Check 1: GoF Static getInstance() Singleton
    const hasGetInstance = /static\s+getInstance\s*\([^)]*\)/.test(cleanContent);
    const hasStaticInstance = /private\s+static\s+(?:instance|instance\s*:)/.test(cleanContent);
    if (hasGetInstance && hasStaticInstance) {
      const lineNum = rawLines.findIndex((l) => /static\s+getInstance/.test(l)) + 1;
      violations.push({
        domain: 'JAVA_OOP',
        rule: 'JAVA_GOF_SINGLETON',
        severity: 'CRITICAL',
        path: relPath,
        line: lineNum,
        detail: 'Class uses GoF private static instance + getInstance(). Modern TypeScript modules are native singletons.',
        cure: 'Export a module const instance: `export const instance = new Engine();` or export plain functions.',
      });
    }

    // Check 2: Java Static Container Class (Class with ONLY static methods, no instance)
    const classMatch = /export\s+class\s+([A-Za-z0-9]+)\b/.exec(cleanContent);
    if (classMatch && !relPath.includes('test')) {
      const className = classMatch[1];
      const methodMatches = [...cleanContent.matchAll(/(?:public\s+|private\s+|protected\s+)?(static\s+)?(?:async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*:\s*(?:Promise<[^>]+>|[a-zA-Z0-9_<>]+)\s*\{/g)];
      if (methodMatches.length >= 2) {
        const allStatic = methodMatches.every((m) => m[1] !== undefined);
        const hasInstanceFields = /private\s+(?!static)[a-zA-Z0-9_]+|this\.[a-zA-Z0-9_]+/.test(cleanContent);
        if (allStatic && !hasInstanceFields && !cleanContent.includes('Context.Service') && !cleanContent.includes('Context.Tag')) {
          const lineNum = rawLines.findIndex((l) => l.includes(`class ${className}`)) + 1;
          violations.push({
            domain: 'JAVA_OOP',
            rule: 'JAVA_STATIC_CONTAINER_CLASS',
            severity: 'MEDIUM',
            path: relPath,
            line: lineNum,
            detail: `Class ${className} is purely a static container holding only static functions with no instance state. In TypeScript, standalone functions should be exported directly from the module.`,
            cure: `Replace \`class ${className}\` with exported standalone functions: \`export async function ${methodMatches[0]?.[2]}(...) { ... }\``,
          });
        }
      }
    }

    // Check 3: Useless Pass-Through Class (Spring Boot @Service -> @Repository)
    if (!isGrandfatheredLegacy) {
      const hasConstructorRepo = /constructor\s*\([^)]*(?:repo|repository|adapter)/i.test(cleanContent);
      const passThroughMatches = cleanContent.match(/return\s+this\.(?:repo|repository|adapter)\.[a-zA-Z0-9_]+\s*\(/g) || [];
      const publicMethods = cleanContent.match(/(?:async\s+)?[a-zA-Z0-9_]+\s*\([^)]*\)\s*:\s*(?:Promise<[^>]+>|[a-zA-Z0-9_<>]+)\s*\{/g) || [];

      if (hasConstructorRepo && passThroughMatches.length >= 2 && passThroughMatches.length >= publicMethods.length * 0.7) {
        const appCallers = getAppCallers(baseName);
        if (appCallers.length === 0) {
          violations.push({
            domain: 'JAVA_OOP',
            rule: 'JAVA_USELESS_PASS_THROUGH',
            severity: 'HIGH',
            path: relPath,
            line: 1,
            detail: `Class forwards ${passThroughMatches.length} calls directly to this.repo with 0 application callers. Pure Spring Boot ceremony.`,
            cure: 'Liquidate wrapper class and let callers import the underlying repository or adapter port directly.',
          });
        }
      }
    }

    // Check 4: Orphaned Manager Class
    const managerClassMatch = /class\s+([A-Za-z0-9]+Manager)\b/.exec(cleanContent);
    if (managerClassMatch) {
      const managerClassName = managerClassMatch[1];
      // False positive guards
      if (cleanContent.includes('Context.Service') || cleanContent.includes('Context.Tag')) {
        filteredFalsePositives.push({
          rule: 'JAVA_ORPHANED_MANAGER',
          path: relPath,
          reason: `Legitimate Effect-TS Context Service / Tag identifier (${managerClassName})`,
        });
      } else if (['StorageManager', 'TelemetryManager', 'CryptoManager', 'NetworkManager', 'DeviceIdentityManager', 'AuthManager', 'GrowthManager'].includes(baseName)) {
        filteredFalsePositives.push({
          rule: 'JAVA_ORPHANED_MANAGER',
          path: relPath,
          reason: `Legitimate Hexagonal Cross-Platform Dispatcher with external store subscription (${managerClassName})`,
        });
      } else {
        const appCallers = getAppCallers(baseName);
        if (appCallers.length === 0) {
          const lineNum = rawLines.findIndex((l) => l.includes(`class ${managerClassName}`)) + 1 || 1;
          violations.push({
            domain: 'JAVA_OOP',
            rule: 'JAVA_ORPHANED_MANAGER',
            severity: 'HIGH',
            path: relPath,
            line: lineNum,
            detail: `Manager class ${managerClassName} has 0 application callers across web and mobile. UI code bypassed it.`,
            cure: 'Quarantine and strangle. Migrate any remaining state to Zustand/TanStack Query.',
          });
        }
      }
    } else if (baseName.endsWith('Manager') && (filePath.endsWith('.tsx') || /export\s+(?:default\s+)?function\b/.test(cleanContent))) {
      filteredFalsePositives.push({
        rule: 'JAVA_ORPHANED_MANAGER',
        path: relPath,
        reason: 'Functional React Component / Headless hook with "Manager" naming; not an OOP class.',
      });
    }

    // Check 5: Deadweight Factory
    if (relPath.endsWith('.factory.ts') || /class\s+[A-Za-z0-9]+Factory\b/.test(cleanContent)) {
      const appCallers = getAppCallers(baseName);
      if (appCallers.length === 0) {
        violations.push({
          domain: 'JAVA_OOP',
          rule: 'JAVA_DEADWEIGHT_FACTORY',
          severity: 'MEDIUM',
          path: relPath,
          line: 1,
          detail: `Factory file has 0 application callers. Pointless Java-style instantiation ceremony.`,
          cure: 'Delete factory. Export module singletons or composable functions directly.',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // DOMAIN 2: LEGACY REACT 18 PATTERNS
  // -------------------------------------------------------------

  // Check 6: React.forwardRef / forwardRef
  const forwardRefMatch = cleanContent.match(/\b(?:React\.)?forwardRef\s*(?:<[^>]*>)?\s*\(/);
  if (forwardRefMatch) {
    const lineNum = rawLines.findIndex((l) => /\b(?:React\.)?forwardRef\b/.test(l)) + 1;
    if (isGrandfatheredLegacy) {
      debtItems.push({
        domain: 'REACT_18_LEGACY',
        rule: 'REACT_FORWARD_REF_GRANDFATHERED',
        path: relPath,
        line: lineNum,
        detail: 'Legacy forwardRef in grandfathered UI kit (tracked in ratchet).',
      });
    } else if (isTest) {
      filteredFalsePositives.push({
        rule: 'REACT_FORWARD_REF',
        path: relPath,
        reason: 'Test shim or vitest mock',
      });
    } else {
      violations.push({
        domain: 'REACT_18_LEGACY',
        rule: 'REACT_FORWARD_REF',
        severity: 'CRITICAL',
        path: relPath,
        line: lineNum,
        detail: 'React.forwardRef is deprecated in React 19. Pass `ref` directly as a standard component prop.',
        cure: 'Remove forwardRef wrapper; add `ref?: React.Ref<...>` to props interface and accept `{ ref, ...props }`.',
      });
    }
  }

  // Check 7: useFormState (React 19 removed; replaced by useActionState)
  if (!isTest && /\buseFormState\s*\(/.test(cleanContent)) {
    const lineNum = rawLines.findIndex((l) => /\buseFormState\b/.test(l)) + 1;
    violations.push({
      domain: 'REACT_18_LEGACY',
      rule: 'REACT_USE_FORM_STATE',
      severity: 'CRITICAL',
      path: relPath,
      line: lineNum,
      detail: 'useFormState is deprecated/removed in React 19. Use `useActionState` from "react".',
      cure: 'import { useActionState } from "react";',
    });
  }

  // Check 8: defaultProps on Functional Components
  if (!isTest && /\.[a-zA-Z0-9_]+\.defaultProps\s*=/.test(cleanContent)) {
    const lineNum = rawLines.findIndex((l) => /\.defaultProps\s*=/.test(l)) + 1;
    violations.push({
      domain: 'REACT_18_LEGACY',
      rule: 'REACT_DEFAULT_PROPS',
      severity: 'HIGH',
      path: relPath,
      line: lineNum,
      detail: 'Component.defaultProps is removed in React 19 for functional components.',
      cure: 'Use ES6 default parameters in component destructuring: `function MyComponent({ title = "Default" })`',
    });
  }

  // Check 9: Zustand Full Store Subscription (Missing atomic selector)
  if (!isTest && !isGrandfatheredLegacy) {
    const cleanLines = cleanContent.split('\n');
    for (let i = 0; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      if (/codeSample:|codeSnippet:|example:/.test(rawLines[i] ?? '')) continue;
      
      const match = /\b(use[A-Za-z0-9]+Store)\s*\(\s*\)/.exec(line);
      if (match) {
        violations.push({
          domain: 'REACT_18_LEGACY',
          rule: 'ZUSTAND_FULL_STORE_SUBSCRIPTION',
          severity: 'HIGH',
          path: relPath,
          line: i + 1,
          detail: `${match[1]}() called without a selector. Causes component to re-render on any store mutation.`,
          cure: `Use atomic selector: \`const user = ${match[1]}((s) => s.user);\``,
        });
      }
    }
  }

  // Check 10: React Native Forbidden Legacy Gestures / Reanimated
  if (!isTest && !isGrandfatheredLegacy && (relPath.startsWith('apps/gurudevi-mobile') || relPath.startsWith('packages/ui'))) {
    const cleanLines = cleanContent.split('\n');
    for (let i = 0; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      if (/\bPanGestureHandler\b/.test(line)) {
        violations.push({
          domain: 'REACT_18_LEGACY',
          rule: 'RN_LEGACY_PAN_GESTURE',
          severity: 'CRITICAL',
          path: relPath,
          line: i + 1,
          detail: '<PanGestureHandler> is forbidden in RNGH 3.4+. Use `Gesture.Pan()` with `<GestureDetector>`.',
          cure: 'import { Gesture, GestureDetector } from "react-native-gesture-handler";',
        });
      }
      if (/\buseAnimatedGestureHandler\b/.test(line)) {
        violations.push({
          domain: 'REACT_18_LEGACY',
          rule: 'RN_LEGACY_ANIMATED_GESTURE_HANDLER',
          severity: 'CRITICAL',
          path: relPath,
          line: i + 1,
          detail: 'useAnimatedGestureHandler is deprecated in RNGH 3.4+. Use Gesture API.',
          cure: 'Use Gesture.Pan().onUpdate(...).onEnd(...)',
        });
      }
      if (/\brunOnJS\b/.test(line) && /from\s+['"]react-native-(?:reanimated|worklets)['"]/.test(cleanContent)) {
        violations.push({
          domain: 'REACT_18_LEGACY',
          rule: 'RN_REANIMATED_DEPRECATED_RUN_ON_JS',
          severity: 'CRITICAL',
          path: relPath,
          line: i + 1,
          detail: 'runOnJS is deprecated in Reanimated 4 & Worklets 0.13. Use `scheduleOnRN`.',
          cure: 'import { scheduleOnRN } from "react-native-worklets";',
        });
      }
    }
  }
}

// Group findings
const violationsByDomain = {
  JAVA_OOP: violations.filter((v) => v.domain === 'JAVA_OOP'),
  REACT_18_LEGACY: violations.filter((v) => v.domain === 'REACT_18_LEGACY'),
};

console.log('='.repeat(80));
console.log('🏛️  POLYMATH SOVEREIGN ARCHITECTURAL CONTAMINATION AUDITOR');
console.log('='.repeat(80));
console.log(`Mode:                        ${isDelta && !isFull ? 'DELTA GATE (Changed Files)' : 'FULL MONOREPO AUDIT'}`);
console.log(`Scanned:                     ${targetFiles.length} files`);
console.log(`Java OOP Violations:         ${violationsByDomain.JAVA_OOP.length}`);
console.log(`React 18 / Legacy Violations: ${violationsByDomain.REACT_18_LEGACY.length}`);
console.log(`Total Violations:            ${violations.length}`);
console.log(`Grandfathered Legacy Debt:   ${debtItems.length} (in legacy ratchet)`);
console.log(`Filtered False Positives:    ${filteredFalsePositives.length} (Effect tags, dispatchers, components, shims)`);
console.log('='.repeat(80));

if (violations.length > 0) {
  console.log('\n--- ACTIVE VIOLATIONS ---');
  for (const v of violations) {
    console.log(`[${v.severity}] [${v.domain}] ${v.rule}`);
    console.log(`  File: ${v.path}:${v.line}`);
    console.log(`  Issue: ${v.detail}`);
    console.log(`  Cure:  ${v.cure}\n`);
  }
} else {
  console.log('\n✅ PASS: No architectural contamination detected in target files.');
}

if (filteredFalsePositives.length > 0 && !isDelta) {
  console.log('\n--- FILTERED FALSE POSITIVES (Safety Proof) ---');
  for (const fp of filteredFalsePositives) {
    console.log(`[PROTECTED] ${fp.rule} in ${fp.path}`);
    console.log(`            Reason: ${fp.reason}`);
  }
}

if (isFull || !isDelta) {
  const report = {
    scannedFiles: targetFiles.length,
    timestamp: new Date().toISOString(),
    violationsCount: violations.length,
    javaViolationsCount: violationsByDomain.JAVA_OOP.length,
    reactViolationsCount: violationsByDomain.REACT_18_LEGACY.length,
    debtCount: debtItems.length,
    falsePositivesCount: filteredFalsePositives.length,
    violations,
    debtItems,
    filteredFalsePositives,
  };

  fs.writeFileSync(
    path.join(ROOT_DIR, 'reports/architectural-contamination.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );
  console.log('\nAudit written to reports/architectural-contamination.json');
}

// Exit code gating:
// If Delta mode or Strict mode has violations, fail with code 1.
if ((isDelta || isStrict) && violations.length > 0) {
  console.error(`\n❌ Gate Veto: ${violations.length} architectural contamination violation(s) detected in changed files.`);
  process.exit(1);
}
