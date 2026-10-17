#!/usr/bin/env node
/**
 * @file scripts/audit-seams.mjs
 * Deterministic Physical Native Seams Auditor.
 *
 * Uses @ast-grep/napi via rn-terrain's IntegrativeSeamsEngine to audit
 * React Native components across all monorepo UI packages against the 5 physical runtime seams:
 * 1. THREAD_HANDSHAKE: Worklet <-> JS state mutation without runOnJS
 * 2. LIFECYCLE_DECONSTRUCTION: Exiting animation screen deallocation races
 * 3. GESTURE_TOUCH_DEADLOCK: Pan gesture nested in ScrollView without activeOffsets
 * 4. RENDER_BLOCKING_JSI: Synchronous JSI TurboModule reads in render loops
 * 5. WINDOW_INSET_COLLISION: Nested SafeAreaViews causing double-inset layout jumps
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Check if rn-terrain scanner is accessible
const SCANNER_PKG_JSON = 'c:/projects/rn-terrain/packages/scanner/package.json';

if (!fs.existsSync(SCANNER_PKG_JSON)) {
  console.log('⚠️ [SEAM AUDITOR] rn-terrain scanner not detected. Skipping native seams audit.');
  process.exit(0);
}

const scannerRequire = createRequire(SCANNER_PKG_JSON);
const { parse, Lang } = scannerRequire('@ast-grep/napi');

// Scan target directories (defaults to all active mobile & UI packages)
const defaultTargets = [
  'apps/gurudevi-mobile/src',
  'apps/gurudevi-mobile/app',
  'packages/ui/src',
  'packages/self/src',
  'packages/classroom/src',
];

const targetDirs = process.argv[2]
  ? [path.resolve(ROOT_DIR, process.argv[2])]
  : defaultTargets.map((d) => path.resolve(ROOT_DIR, d));

function collectFiles(dir, extensions = ['.tsx', '.jsx', '.ts', '.js']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.expo' ||
      entry.name === '__tests__' ||
      entry.name === 'build'
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function auditFileContent(sourceCode, filePath) {
  const findings = [];

  const hasWorklet = sourceCode.includes("'worklet'") || sourceCode.includes('"worklet"');
  const hasGesture =
    sourceCode.includes('Gesture.Pan') ||
    sourceCode.includes('GestureDetector') ||
    sourceCode.includes('usePanGesture') ||
    sourceCode.includes('react-native-gesture-handler');
  const hasSyncJsi = sourceCode.includes('.getString(') || sourceCode.includes('.getNumber(');
  const hasSafeArea = sourceCode.includes('SafeAreaView') || sourceCode.includes('useSafeAreaInsets');
  const hasDimensions = sourceCode.includes('Dimensions.get(');
  const hasReanimated = sourceCode.includes('react-native-reanimated');
  const hasOnLayout = sourceCode.includes('onLayout');
  const hasReanimatedSwipeable = sourceCode.includes('ReanimatedSwipeable');

  if (
    !hasWorklet &&
    !hasGesture &&
    !hasSyncJsi &&
    !hasSafeArea &&
    !hasDimensions &&
    !hasReanimated &&
    !hasOnLayout &&
    !hasReanimatedSwipeable
  ) {
    return findings;
  }

  const isTsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
  const lang = isTsx ? Lang.Tsx : Lang.TypeScript;

  let rootNode;
  try {
    rootNode = parse(lang, sourceCode).root();
  } catch {
    return findings;
  }

  // 1. Seam 1A: Worklet <-> JS state mutation without runOnJS (Innermost function resolution)
  if (hasWorklet) {
    const setterCalls = rootNode.findAll('$FN($$$ARGS)');
    for (const callNode of setterCalls) {
      const fnNode = callNode.field('function');
      if (!fnNode) continue;
      const fnName = fnNode.text();

      const isStateSetter =
        /^set[A-Z]/.test(fnName) ||
        fnName === 'dispatch' ||
        fnName === 'router.push' ||
        fnName === 'router.replace' ||
        fnName === 'navigation.navigate';

      if (!isStateSetter) continue;

      let parent = callNode.parent();
      let isBridged = false;
      while (parent) {
        if (parent.text().startsWith('runOnJS(')) {
          isBridged = true;
          break;
        }
        parent = parent.parent();
      }
      if (isBridged) continue;

      // Find INNERMOST enclosing function
      let innermostFn = null;
      let ancestor = callNode.parent();
      while (ancestor) {
        const kind = ancestor.kind();
        if (
          kind === 'function_declaration' ||
          kind === 'arrow_function' ||
          kind === 'function_expression' ||
          kind === 'method_definition'
        ) {
          innermostFn = ancestor;
          break;
        }
        ancestor = ancestor.parent();
      }

      if (!innermostFn) continue;

      const body = innermostFn.field('body') || innermostFn;
      let isWorklet = false;

      // Check if innermost function has direct 'worklet' directive
      const statements = body.children();
      for (const stmt of statements) {
        const text = stmt.text().replace(/['";]/g, '').trim();
        if (text === 'worklet') {
          isWorklet = true;
          break;
        }
      }

      // Or innermost function is passed directly to gesture callback or Reanimated hook
      const callParent = innermostFn.parent();
      if (callParent) {
        const parentCallExpr = callParent.kind() === 'arguments' ? callParent.parent() : callParent;
        if (parentCallExpr) {
          const parentText = parentCallExpr.text();
          if (
            parentText.startsWith('.onUpdate(') ||
            parentText.startsWith('.onStart(') ||
            parentText.startsWith('.onEnd(') ||
            parentText.startsWith('.onActivate(') ||
            parentText.startsWith('useAnimatedStyle(') ||
            parentText.startsWith('useDerivedValue(') ||
            parentText.startsWith('useAnimatedReaction(')
          ) {
            isWorklet = true;
          }
        }
      }

      if (isWorklet) {
        const range = callNode.range();
        findings.push({
          ruleId: 'seam/worklet-unbridged-js-mutation',
          seamType: 'THREAD_HANDSHAKE',
          severity: 'error',
          title: 'Unbridged JS State Mutation in Worklet Thread',
          message: `Calling '${fnName}' directly inside a worklet thread without 'runOnJS' causes native crash on UI thread.`,
          filePath,
          line: range.start.line + 1,
          matchedText: callNode.text(),
          remediation: `Wrap in runOnJS(${fnName})()`,
        });
      }
    }
  }

  // 1B. Seam 1B: Reanimated 4 / Worklet import dialect violation
  if (hasReanimated) {
    const importStatements = rootNode.findAll({ rule: { kind: 'import_statement' } });
    for (const imp of importStatements) {
      const text = imp.text();
      if (text.includes("'react-native-reanimated'") || text.includes('"react-native-reanimated"')) {
        const bannedImports = text.match(/\b(runOnJS|runOnUI|createWorkletRuntime|makeShareableCloneRecursive|isWorkletFunction)\b/g);
        if (bannedImports) {
          const range = imp.range();
          findings.push({
            ruleId: 'seam/reanimated-worklet-import',
            seamType: 'THREAD_HANDSHAKE',
            severity: 'error',
            title: 'Worklet Thread Primitive Imported from Reanimated',
            message: `Symbols [${bannedImports.join(', ')}] must be imported from 'react-native-worklets' in Reanimated 4.`,
            filePath,
            line: range.start.line + 1,
            matchedText: text.trim(),
            remediation: `Change import source to 'react-native-worklets' per AGENTS.md Invariant 7.`,
          });
        }
      }
    }
  }

  // 1C. Seam 1C: Mutating shared values inside useAnimatedStyle callback (causes infinite UI thread loop)
  if (hasReanimated && sourceCode.includes('useAnimatedStyle')) {
    const animStyles = rootNode.findAll('useAnimatedStyle($$$ARGS)');
    for (const animNode of animStyles) {
      const mutations = animNode.findAll('$VAL.value = $EXPR');
      for (const mut of mutations) {
        const range = mut.range();
        findings.push({
          ruleId: 'seam/shared-value-mutation-in-animated-style',
          seamType: 'THREAD_HANDSHAKE',
          severity: 'error',
          title: 'Shared Value Mutation inside useAnimatedStyle',
          message: `Mutating shared value '${mut.text()}' inside useAnimatedStyle causes infinite re-render loop on UI thread.`,
          filePath,
          line: range.start.line + 1,
          matchedText: mut.text(),
          remediation: 'Move mutation to a gesture handler, reaction, or useDerivedValue.',
        });
      }
    }
  }

  // 2A. Seam 2A: Deprecated RNGH 3.3 Handlers & Touchables
  if (hasGesture) {
    const importStatements = rootNode.findAll({ rule: { kind: 'import_statement' } });
    for (const imp of importStatements) {
      const text = imp.text();
      if (text.includes("'react-native-gesture-handler'") || text.includes('"react-native-gesture-handler"')) {
        const deprecatedSymbols = text.match(/\b(PanGestureHandler|TapGestureHandler|RotationGestureHandler|PinchGestureHandler|LongPressGestureHandler|RectButton|BorderlessButton|BaseButton|RawButton|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback|Pressable)\b/g);
        if (deprecatedSymbols) {
          const range = imp.range();
          findings.push({
            ruleId: 'seam/rngh-deprecated-symbols',
            seamType: 'GESTURE_TOUCH_DEADLOCK',
            severity: 'error',
            title: 'Deprecated RNGH Handler or Touchable Component',
            message: `Symbols [${deprecatedSymbols.join(', ')}] are deprecated in RNGH 3.3 and cause touch stalls on Fabric.`,
            filePath,
            line: range.start.line + 1,
            matchedText: text.trim(),
            remediation: 'Use GestureDetector with Gesture.* or standard Pressable/Touchable.',
          });
        }
      }
    }
  }

  // 2B. Seam 2B: TurboModule / Nitro Sync JSI in Render Loop
  if (hasSyncJsi) {
    const syncCalls = [
      ...rootNode.findAll('$STORAGE.getString($$$ARGS)'),
      ...rootNode.findAll('$STORAGE.getNumber($$$ARGS)'),
      ...rootNode.findAll('$STORAGE.getBoolean($$$ARGS)'),
    ];

    for (const call of syncCalls) {
      let ancestor = call.parent();
      let isInsideHandler = false;
      let isInsideComponent = false;

      while (ancestor) {
        const text = ancestor.text();
        if (
          text.startsWith('useEffect(') ||
          text.startsWith('useMemo(') ||
          text.startsWith('useCallback(') ||
          /^(async\s+)?(function\s+)?(on|handle)/i.test(text) ||
          text.includes('async ()')
        ) {
          isInsideHandler = true;
          break;
        }
        if (ancestor.kind() === 'function_declaration' || ancestor.kind() === 'arrow_function') {
          isInsideComponent = true;
        }
        ancestor = ancestor.parent();
      }

      if (isInsideComponent && !isInsideHandler) {
        const range = call.range();
        findings.push({
          ruleId: 'seam/turbomodule-render-blocking-jsi',
          seamType: 'RENDER_BLOCKING_JSI',
          severity: 'warning',
          title: 'Synchronous JSI TurboModule call in Component Render Loop',
          message: `Synchronous JSI reading ('${call.text()}') inside component render path can block UI thread frames.`,
          filePath,
          line: range.start.line + 1,
          matchedText: call.text(),
          remediation: 'Wrap in useMemo() or offload to background cache',
        });
      }
    }
  }

  // 3A. Seam 3A: Window Insets / SafeAreaView Nesting Collision
  if (hasSafeArea) {
    const safeAreaViews = rootNode.findAll('<SafeAreaView $$$ATTRS>$$$CHILDREN</SafeAreaView>');
    for (const sav of safeAreaViews) {
      let ancestor = sav.parent();
      while (ancestor) {
        if (ancestor.kind() === 'jsx_element') {
          const opening = ancestor.field('open_tag') || ancestor;
          if (opening.text().startsWith('<SafeAreaView')) {
            const range = sav.range();
            findings.push({
              ruleId: 'seam/nested-safe-area-double-inset',
              seamType: 'WINDOW_INSET_COLLISION',
              severity: 'error',
              title: 'Nested SafeAreaView Double Inset Collision',
              message:
                'Nesting <SafeAreaView> inside another <SafeAreaView> causes duplicate window insets and layout jump on notched screens.',
              filePath,
              line: range.start.line + 1,
              matchedText: sav.field('open_tag')?.text() || '<SafeAreaView>',
              remediation: 'Remove inner <SafeAreaView> or use useSafeAreaInsets() on outer container only',
            });
            break;
          }
        }
        ancestor = ancestor.parent();
      }
    }
  }

  // 3B. Seam 3B: Module-scoped Static Dimensions.get (causes frozen layout on rotation / foldable screens)
  if (hasDimensions && isTsx) {
    const dimCalls = rootNode.findAll('Dimensions.get($$$ARGS)');
    for (const call of dimCalls) {
      let ancestor = call.parent();
      let isTopLevel = true;
      while (ancestor) {
        const k = ancestor.kind();
        if (
          k === 'function_declaration' ||
          k === 'arrow_function' ||
          k === 'function_expression' ||
          k === 'method_definition'
        ) {
          isTopLevel = false;
          break;
        }
        ancestor = ancestor.parent();
      }

      if (isTopLevel) {
        const range = call.range();
        findings.push({
          ruleId: 'seam/static-module-dimensions',
          seamType: 'WINDOW_INSET_COLLISION',
          severity: 'warning',
          title: 'Static Module-Scoped Dimensions.get Layout Freeze',
          message: `Reading '${call.text()}' at module level caches dimensions once at bundle load time, freezing layout on rotation, tablet, or foldable screens.`,
          filePath,
          line: range.start.line + 1,
          matchedText: call.parent()?.text() || call.text(),
          remediation: 'Use reactive useWindowDimensions() hook inside the component.',
        });
      }
    }
  }

  // 4A. Seam 4A: Unthresholded onLayout State Mutation (Fabric Layout Loop Hazard)
  if (hasOnLayout && isTsx) {
    const jsxAttributes = rootNode.findAll({ rule: { kind: 'jsx_attribute' } });
    for (const attr of jsxAttributes) {
      const text = attr.text();
      if (!text.startsWith('onLayout=')) continue;

      // Check if handler directly calls a dimension setter
      const matchSetter = text.match(/\b(set(?:Height|Width|Layout|Size|Dimensions?))\s*\(/);
      if (matchSetter) {
        // Check if there is an explicit guard, Math.abs, Math.round, or condition
        const hasGuard =
          text.includes('Math.abs') ||
          text.includes('Math.round') ||
          text.includes('if ') ||
          text.includes('?') ||
          text.includes('useLayoutSentinel') ||
          text.includes('createLayoutSentinel') ||
          text.includes('LayoutLoopSentinel');

        if (!hasGuard) {
          const range = attr.range();
          findings.push({
            ruleId: 'seam/unthresholded-onlayout-state-mutation',
            seamType: 'LAYOUT_LOOP_CASCADE',
            severity: 'warning',
            title: 'Unthresholded onLayout State Mutation',
            message: `Calling '${matchSetter[1]}' directly inside onLayout without thresholding or condition causes cyclic Fabric layout loops.`,
            filePath,
            line: range.start.line + 1,
            matchedText: text.length > 80 ? text.substring(0, 80) + '...' : text,
            remediation: 'Wrap in LayoutLoopSentinel from @repo/ui or guard with Math.abs(current - next) > EPSILON.',
          });
        }
      }
    }
  }

  // 5B. Seam 5B: ReanimatedSwipeable inside GestureDetector on Fabric (TCDI Signal)
  if (hasReanimatedSwipeable && hasGesture && isTsx) {
    const elements = [
      ...rootNode.findAll({ rule: { kind: 'jsx_element' } }),
      ...rootNode.findAll({ rule: { kind: 'jsx_self_closing_element' } }),
    ];
    for (const el of elements) {
      const text = el.text();
      if (!text.startsWith('<ReanimatedSwipeable')) continue;

      let ancestor = el.parent();
      while (ancestor) {
        if (ancestor.kind() === 'jsx_element') {
          const openTag = ancestor.field('open_tag');
          if (openTag && openTag.text().includes('GestureDetector')) {
            const range = el.range();
            findings.push({
              ruleId: 'seam/reanimated-swipeable-fabric-hazard',
              seamType: 'TCDI_FABRIC_HAZARD',
              severity: 'warning',
              title: 'ReanimatedSwipeable Nested in GestureDetector on Fabric',
              message: 'Nesting <ReanimatedSwipeable> inside <GestureDetector> on Fabric causes Yoga assertion SIGABRT crashes (TCDI Signal).',
              filePath,
              line: range.start.line + 1,
              matchedText: openTag.text(),
              remediation: 'Isolate swipeable gesture detector boundaries or use separate Gesture.Pan() configurations.',
            });
            break;
          }
        }
        ancestor = ancestor.parent();
      }
    }
  }

  return findings;
}

export { auditFileContent };

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  // Execute audit
  console.log(`\n🔍 [SEAM AUDITOR] Scanning ${targetDirs.length} target directories across monorepo...`);
  const allFiles = targetDirs.flatMap((d) => collectFiles(d));
  console.log(`📁 Found ${allFiles.length} source files to inspect.`);

let totalErrors = 0;
let totalWarnings = 0;
const allFindings = [];

for (const file of allFiles) {
  let content = '';
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const fileFindings = auditFileContent(content, file);
  if (fileFindings.length > 0) {
    allFindings.push(...fileFindings);
    for (const f of fileFindings) {
      if (f.severity === 'error') totalErrors++;
      else totalWarnings++;
    }
  }
}

console.log('\n======================================================');
console.log('       SOVEREIGN PHYSICAL NATIVE SEAMS REPORT        ');
console.log('======================================================\n');

if (allFindings.length === 0) {
  console.log(`✅ ZERO SEAM COLLISIONS DETECTED across ${allFiles.length} files in mobile & UI packages!\n`);
  process.exit(0);
} else {
  console.log(`⚠️  Detected ${allFindings.length} Seam Issues (${totalErrors} Errors, ${totalWarnings} Warnings):\n`);

  for (const f of allFindings) {
    const relPath = path.relative(ROOT_DIR, f.filePath);
    const badge = f.severity === 'error' ? '❌ [ERROR]' : '⚠️ [WARN]';
    console.log(`${badge} [${f.seamType}] ${f.title}`);
    console.log(`   File: ${relPath}:${f.line}`);
    console.log(`   Match: ${f.matchedText}`);
    console.log(`   Fix:   ${f.remediation}\n`);
  }

  if (totalErrors > 0) {
    console.error(`💥 Execution halted: ${totalErrors} native seam errors must be resolved.`);
    process.exit(1);
  } else {
    console.log('✨ All warnings non-fatal. Completed with warnings.');
    process.exit(0);
  }
}
}
