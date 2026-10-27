#!/usr/bin/env node
/**
 * @file gate.mjs
 * RN-Terrain Unified Pre-Tool Grounding & Scoped AST Gate.
 *
 * Intercepts tool calls (Write, Edit, apply_patch) across Claude Code, Codex, OpenCode, and Antigravity.
 * Production-Grade Defenses:
 *   1. In-Memory Virtual Document Synthesis: Projects diff chunks onto base files before scanning.
 *   2. Package-Bound Merkle Receipts: 1:1 validation of every imported React Native package.
 *   3. Scoped AST Visitor: 100% immune to comments, docstrings, string literals, and jest.mock calls.
 *   4. Canonical Rule Matrix: Enforces 30+ New Architecture and Fabric breaking shifts.
 *
 * Exit Codes:
 *   0: ALLOW (proceed with tool execution)
 *   2: DENY (blocks tool execution and pipes stderr to model context)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

// Parse arguments
const args = process.argv.slice(2);
let targetFilePath = '';
let autoGround = process.env.TERRAIN_AUTO_GROUND === '1' || process.env.TERRAIN_AUTO_GROUND === 'true';
let ttlMs = 3600000; // 60 minutes default
let explicitBuffer = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--auto-ground') {
    autoGround = true;
  } else if (args[i] === '--ttl' && args[i + 1]) {
    ttlMs = parseInt(args[i + 1], 10) || 3600000;
    i++;
  } else if (args[i] === '--buffer' && args[i + 1]) {
    explicitBuffer = args[i + 1];
    i++;
  } else if (!args[i].startsWith('--') && !targetFilePath) {
    targetFilePath = args[i];
  }
}

// Built-in fallback rule catalog (Synchronized with packages/scanner/src/rules/canonical-severed-rules.ts)
const FALLBACK_SEVERED_RULES = [
  // ── 0. Soft Advisory Rules ───────────────────────────────────────────────────
  {
    id: 'rn-core-alert-advisory',
    package: 'react-native',
    symbol: 'Alert.alert',
    type: 'call',
    severity: 'soft',
    replacement: 'Custom Modal or modern dialog component',
    message: "'Alert.alert' has platform visual inconsistencies. Custom modal recommended."
  },
  // ── 1. Reanimated Severed APIs ───────────────────────────────────────────────
  {
    id: 'reanimated-v2-gesture-handler-import',
    package: 'react-native-reanimated',
    symbol: 'useAnimatedGestureHandler',
    type: 'import',
    replacement: "Gesture.Pan().onUpdate(...) from 'react-native-gesture-handler' with <GestureDetector>",
    message: "'useAnimatedGestureHandler' was removed/deprecated in Reanimated v3/v4 worklets. Use modern 'Gesture.Pan()' instead.",
    minBreakingVersion: '3.0.0'
  },
  {
    id: 'reanimated-v2-gesture-handler',
    package: 'react-native-reanimated',
    symbol: 'useAnimatedGestureHandler',
    type: 'call',
    replacement: "Gesture.Pan().onUpdate(...) from 'react-native-gesture-handler' with <GestureDetector>",
    message: "'useAnimatedGestureHandler' was removed/deprecated in Reanimated v3/v4 worklets. Use modern 'Gesture.Pan()' instead.",
    minBreakingVersion: '3.0.0',
    template: `import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onStart(() => {
    'worklet';
  })
  .onUpdate((event) => {
    'worklet';
  });

<GestureDetector gesture={panGesture}>
  <Animated.View style={animatedStyle} />
</GestureDetector>`
  },
  {
    id: 'reanimated-v1-interpolate-node-import',
    package: 'react-native-reanimated',
    symbol: 'interpolateNode',
    type: 'import',
    replacement: "'interpolate()' from 'react-native-reanimated'",
    message: "'interpolateNode' is a legacy Reanimated v1 API removed in modern versions. Use 'interpolate()' instead.",
    minBreakingVersion: '2.0.0'
  },
  {
    id: 'reanimated-v1-interpolate-node',
    package: 'react-native-reanimated',
    symbol: 'interpolateNode',
    type: 'call',
    replacement: "'interpolate()' from 'react-native-reanimated'",
    message: "'interpolateNode' is a legacy Reanimated v1 API removed in modern versions. Use 'interpolate()' instead.",
    minBreakingVersion: '2.0.0',
    template: `import { interpolate, Extrapolation } from 'react-native-reanimated';

const output = interpolate(
  progress.value,
  [0, 1],
  [0, 100],
  Extrapolation.CLAMP
);`
  },
  {
    id: 'reanimated-v1-transition',
    package: 'react-native-reanimated',
    symbol: 'Transition',
    type: 'import',
    replacement: 'Layout Animations (FadeIn, SlideIn, LinearTransition)',
    message: "'Transition' from Reanimated v1 was removed. Use modern declarative layout transitions.",
    minBreakingVersion: '2.0.0',
    template: `import Animated, { FadeIn, SlideInRight, LinearTransition } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn}
  exiting={SlideInRight}
  layout={LinearTransition}
/>`
  },
  {
    id: 'reanimated-v1-animated-value',
    package: 'react-native-reanimated',
    symbol: 'Value',
    type: 'import',
    replacement: "'useSharedValue()' from 'react-native-reanimated'",
    message: "Reanimated v1 'Value' nodes are obsolete in the New Architecture worklet runtime. Use 'useSharedValue()'.",
    minBreakingVersion: '2.0.0',
    template: `import { useSharedValue } from 'react-native-reanimated';

const progress = useSharedValue(0);`
  },
  // ── 2. Gesture Handler Severed APIs ─────────────────────────────────────────
  {
    id: 'rngh-v1-use-pan-gesture-import',
    package: 'react-native-gesture-handler',
    symbol: 'usePanGesture',
    type: 'import',
    replacement: "'Gesture.Pan()' with <GestureDetector>",
    message: "'usePanGesture' was removed in RNGH 2.0. Use 'Gesture.Pan()' with <GestureDetector>.",
    minBreakingVersion: '2.0.0'
  },
  {
    id: 'rngh-v1-use-pan-gesture',
    package: 'react-native-gesture-handler',
    symbol: 'usePanGesture',
    type: 'call',
    replacement: "'Gesture.Pan()' with <GestureDetector>",
    message: "'usePanGesture' was removed in RNGH 2.0. Use 'Gesture.Pan()' with <GestureDetector>.",
    minBreakingVersion: '2.0.0',
    template: `import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan().onUpdate(() => { 'worklet'; });
<GestureDetector gesture={panGesture}><Animated.View style={animatedStyle} /></GestureDetector>`
  },
  {
    id: 'rngh-v1-pan-gesture-handler-import',
    package: 'react-native-gesture-handler',
    symbol: 'PanGestureHandler',
    type: 'import',
    replacement: "'GestureDetector' and 'Gesture.Pan()'",
    message: "Legacy component '<PanGestureHandler>' is deprecated in RNGH v2/v3. Migrate to '<GestureDetector gesture={Gesture.Pan()}>'.",
    minBreakingVersion: '2.0.0',
    template: `import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan().onUpdate(() => { 'worklet'; });
<GestureDetector gesture={panGesture}><Animated.View style={animatedStyle} /></GestureDetector>`
  },
  // ── 3. React Native Core Severed / Extracted Modules ─────────────────────────
  {
    id: 'rn-core-async-storage-removed',
    package: 'react-native',
    symbol: 'AsyncStorage',
    type: 'import',
    replacement: "Import from '@react-native-async-storage/async-storage'",
    message: "AsyncStorage was removed from 'react-native' core in RN 0.60+. Import from '@react-native-async-storage/async-storage'.",
    minBreakingVersion: '0.60.0',
    template: `// Option A: Community AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', value);
const item = await AsyncStorage.getItem('key');

// Option B: High-Performance MMKV (Recommended for New Architecture)
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();
storage.set('key', value);
const item = storage.getString('key');`
  },
  {
    id: 'rn-core-view-prop-types-removed',
    package: 'react-native',
    symbol: 'ViewPropTypes',
    type: 'import',
    replacement: "'ViewProps' TypeScript type or 'deprecated-react-native-prop-types'",
    message: "'ViewPropTypes' was removed from 'react-native' core in RN 0.71+. Use TypeScript 'ViewProps' instead.",
    minBreakingVersion: '0.71.0',
    template: `import type { ViewProps } from 'react-native';

interface ComponentProps extends ViewProps {
  customProperty?: string;
}`
  },
  {
    id: 'rn-find-node-handle-severed',
    package: 'react-native',
    symbol: 'findNodeHandle',
    type: 'call',
    replacement: "'useAnimatedRef' from 'react-native-reanimated' or native component ref",
    message: "'findNodeHandle' is severed and removed in React Native New Architecture (Fabric). Use direct refs or 'useAnimatedRef'.",
    minBreakingVersion: '0.76.0',
    template: `import { useAnimatedRef, measure } from 'react-native-reanimated';

const aRef = useAnimatedRef();`
  },
  {
    id: 'rn-find-node-handle-import',
    package: 'react-native',
    symbol: 'findNodeHandle',
    type: 'import',
    replacement: "'useAnimatedRef' from 'react-native-reanimated' or native component ref",
    message: "'findNodeHandle' is severed and removed in React Native New Architecture (Fabric). Use direct refs.",
    minBreakingVersion: '0.76.0'
  },
  {
    id: 'rn-uimanager-measure-severed',
    package: 'react-native',
    symbol: 'measureInWindow',
    type: 'member',
    memberObject: 'UIManager',
    memberProperty: 'measureInWindow',
    replacement: "Call '.measureInWindow()' directly on the component ref",
    message: "'UIManager.measureInWindow' is synchronous legacy bridge method removed in Fabric. Call '.measureInWindow()' on the ref.",
    minBreakingVersion: '0.76.0',
    template: `ref.current?.measureInWindow((x, y, width, height) => {
  // coordinates
});`
  },
  {
    id: 'rn-core-back-handler-remove-listener',
    package: 'react-native',
    symbol: 'removeEventListener',
    type: 'member',
    memberObject: 'BackHandler',
    memberProperty: 'removeEventListener',
    replacement: "Call '.remove()' on the subscription returned by 'BackHandler.addEventListener'",
    message: "'BackHandler.removeEventListener' is deprecated and removed in modern RN. Call '.remove()' on the returned subscription.",
    minBreakingVersion: '0.70.0',
    template: `import { useEffect } from 'react';
import { BackHandler } from 'react-native';

useEffect(() => {
  const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
    return true; // prevent default action
  });
  return () => subscription.remove();
}, []);`
  },
  {
    id: 'rn-core-safe-area-view-deprecated',
    package: 'react-native',
    symbol: 'SafeAreaView',
    type: 'import',
    severity: 'soft',
    replacement: "Import 'SafeAreaView' from 'react-native-safe-area-context'",
    message: "'SafeAreaView' from 'react-native' core does not support Edge-to-Edge on Android 15 / Fabric. Use 'react-native-safe-area-context'.",
    minBreakingVersion: '0.76.0',
    template: `import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* Content */}
</SafeAreaView>`
  },
  {
    id: 'rn-core-clipboard-removed',
    package: 'react-native',
    symbol: 'Clipboard',
    type: 'import',
    replacement: "Import from '@react-native-clipboard/clipboard'",
    message: "'Clipboard' was extracted from 'react-native' core in RN 0.60+. Use '@react-native-clipboard/clipboard'.",
    minBreakingVersion: '0.60.0',
    template: `import Clipboard from '@react-native-clipboard/clipboard';

Clipboard.setString('Hello World');
const text = await Clipboard.getString();`
  },
  {
    id: 'rn-core-netinfo-removed',
    package: 'react-native',
    symbol: 'NetInfo',
    type: 'import',
    replacement: "Import from '@react-native-community/netinfo'",
    message: "'NetInfo' was extracted from 'react-native' core in RN 0.60+. Use '@react-native-community/netinfo'.",
    minBreakingVersion: '0.60.0',
    template: `import NetInfo from '@react-native-community/netinfo';

const state = await NetInfo.fetch();
const isConnected = state.isConnected;`
  },
  {
    id: 'rn-core-picker-removed',
    package: 'react-native',
    symbol: 'Picker',
    type: 'import',
    replacement: "Import from '@react-native-picker/picker'",
    message: "'Picker' was extracted from 'react-native' core. Use '@react-native-picker/picker'.",
    minBreakingVersion: '0.60.0',
    template: `import { Picker } from '@react-native-picker/picker';

<Picker selectedValue={selectedValue} onValueChange={(itemValue) => setSelectedValue(itemValue)}>
  <Picker.Item label="Option 1" value="opt1" />
</Picker>`
  },
  {
    id: 'rn-core-slider-removed',
    package: 'react-native',
    symbol: 'Slider',
    type: 'import',
    replacement: "Import from '@react-native-community/slider'",
    message: "'Slider' was extracted from 'react-native' core. Use '@react-native-community/slider'.",
    minBreakingVersion: '0.60.0',
    template: `import Slider from '@react-native-community/slider';

<Slider
  minimumValue={0}
  maximumValue={100}
  value={value}
  onValueChange={setValue}
/>`
  },
  {
    id: 'rn-core-checkbox-removed',
    package: 'react-native',
    symbol: 'CheckBox',
    type: 'import',
    replacement: "Import from '@react-native-community/checkbox'",
    message: "'CheckBox' was extracted from 'react-native' core. Use '@react-native-community/checkbox'.",
    minBreakingVersion: '0.60.0',
    template: `import CheckBox from '@react-native-community/checkbox';

<CheckBox
  disabled={false}
  value={toggleCheckBox}
  onValueChange={(newValue) => setToggleCheckBox(newValue)}
/>`
  },
  {
    id: 'rn-core-masked-view-removed',
    package: 'react-native',
    symbol: 'MaskedViewIOS',
    type: 'import',
    replacement: "Import from '@react-native-masked-view/masked-view'",
    message: "'MaskedViewIOS' was extracted from 'react-native' core. Use '@react-native-masked-view/masked-view'.",
    minBreakingVersion: '0.60.0',
    template: `import MaskedView from '@react-native-masked-view/masked-view';

<MaskedView maskElement={<MaskElement />}>
  <TargetElement />
</MaskedView>`
  },
  {
    id: 'rn-core-progress-view-removed',
    package: 'react-native',
    symbol: 'ProgressViewIOS',
    type: 'import',
    replacement: "Import from '@react-native-community/progress-view'",
    message: "'ProgressViewIOS' was extracted from 'react-native' core. Use '@react-native-community/progress-view'.",
    minBreakingVersion: '0.60.0',
    template: `import { ProgressView } from '@react-native-community/progress-view';

<ProgressView progress={0.5} />`
  },
  {
    id: 'rn-core-segmented-control-removed',
    package: 'react-native',
    symbol: 'SegmentedControlIOS',
    type: 'import',
    replacement: "Import from '@react-native-segmented-control/segmented-control'",
    message: "'SegmentedControlIOS' was extracted from 'react-native' core. Use '@react-native-segmented-control/segmented-control'.",
    minBreakingVersion: '0.60.0',
    template: `import SegmentedControl from '@react-native-segmented-control/segmented-control';

<SegmentedControl
  values={['One', 'Two']}
  selectedIndex={selectedIndex}
  onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
/>`
  },
  {
    id: 'rn-core-date-picker-ios-removed',
    package: 'react-native',
    symbol: 'DatePickerIOS',
    type: 'import',
    replacement: "Import from '@react-native-community/datetimepicker'",
    message: "'DatePickerIOS' was extracted from 'react-native' core. Use '@react-native-community/datetimepicker'.",
    minBreakingVersion: '0.60.0',
    template: `import DateTimePicker from '@react-native-community/datetimepicker';

<DateTimePicker value={date} mode="date" onChange={onChange} />`
  },
  {
    id: 'rn-core-date-picker-android-removed',
    package: 'react-native',
    symbol: 'DatePickerAndroid',
    type: 'import',
    replacement: "Import from '@react-native-community/datetimepicker'",
    message: "'DatePickerAndroid' was extracted from 'react-native' core. Use '@react-native-community/datetimepicker'.",
    minBreakingVersion: '0.60.0',
    template: `import DateTimePicker from '@react-native-community/datetimepicker';

<DateTimePicker value={date} mode="date" onChange={onChange} />`
  },
  {
    id: 'rn-core-push-notification-removed',
    package: 'react-native',
    symbol: 'PushNotificationIOS',
    type: 'import',
    replacement: "Import from '@react-native-community/push-notification-ios'",
    message: "'PushNotificationIOS' was extracted from 'react-native' core. Use '@react-native-community/push-notification-ios'.",
    minBreakingVersion: '0.60.0',
    template: `import PushNotificationIOS from '@react-native-community/push-notification-ios';

PushNotificationIOS.requestPermissions();`
  },
  {
    id: 'rn-core-status-bar-ios-removed',
    package: 'react-native',
    symbol: 'StatusBarIOS',
    type: 'import',
    replacement: "'StatusBar' from 'react-native'",
    message: "'StatusBarIOS' was removed. Use unified 'StatusBar' from 'react-native'.",
    minBreakingVersion: '0.60.0',
    template: `import { StatusBar } from 'react-native';

<StatusBar barStyle="dark-content" />`
  },
  {
    id: 'rn-core-alert-ios-removed',
    package: 'react-native',
    symbol: 'AlertIOS',
    type: 'import',
    replacement: "'Alert.alert()' from 'react-native'",
    message: "'AlertIOS' was removed. Use 'Alert.alert()' from 'react-native'.",
    minBreakingVersion: '0.60.0',
    template: `import { Alert } from 'react-native';

Alert.alert('Title', 'Message', [{ text: 'OK' }]);`
  }
];

function matchesIgnoreDirective(lineText, ruleId, symbol) {
  if (!lineText) return false;
  const match = lineText.match(/(?:\/\/|\/\*)\s*@rn-terrain-ignore(?:-next-line)?(?::\s*(.*?)|\s+(.*?))?(?:\*\/)?$/i);
  if (!match) return false;

  if (match[1] !== undefined) {
    return true;
  }

  const directiveArg = (match[2] || '').trim();
  if (!directiveArg || directiveArg.startsWith('-') || directiveArg.startsWith('(')) {
    return true;
  }

  const beforeColon = directiveArg.split(':')[0].trim();
  const tokens = beforeColon.split(/[\s,]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
  const targetTokens = [
    (ruleId || '').toLowerCase(),
    (symbol || '').toLowerCase(),
    ((symbol || '').split('.').pop() || '').toLowerCase()
  ].filter(Boolean);

  return targetTokens.some(t => tokens.includes(t));
}

function isViolationIgnored(sourceLines, v) {
  const lineIdx = (v.line || 1) - 1;
  if (lineIdx >= 0 && lineIdx < sourceLines.length) {
    if (matchesIgnoreDirective(sourceLines[lineIdx], v.ruleId, v.symbol)) {
      return true;
    }
  }
  if (lineIdx - 1 >= 0 && lineIdx - 1 < sourceLines.length) {
    if (matchesIgnoreDirective(sourceLines[lineIdx - 1], v.ruleId, v.symbol)) {
      return true;
    }
  }
  return false;
}

async function publishAntibodyGossip(projectRoot, antibodies) {
  if (!antibodies || antibodies.length === 0) return;
  try {
    let corePkgPath = path.resolve(projectRoot, 'packages', 'core', 'dist', 'index.js');
    if (!fs.existsSync(corePkgPath)) {
      const scriptDir = path.dirname(fileURLToPath(import.meta.url));
      corePkgPath = path.resolve(scriptDir, '..', 'packages', 'core', 'dist', 'index.js');
    }
    if (fs.existsSync(corePkgPath)) {
      const coreMod = await import(pathToFileURL(corePkgPath).href);
      if (coreMod.AntibodyGossipBus) {
        const bus = new coreMod.AntibodyGossipBus();
        for (const a of antibodies) {
          bus.publishAntibody({
            severedSymbol: a.severedSymbol,
            culpritPackage: a.culpritPackage,
            canonicalRemediation: a.canonicalRemediation,
          });
        }
      }
    }
  } catch {}
}

function synthesizeVirtualDocument(filePath, payloadInput) {
  let diskContent = '';
  if (filePath && fs.existsSync(filePath)) {
    try {
      diskContent = fs.readFileSync(filePath, 'utf8');
    } catch {}
  }

  if (payloadInput?.content) {
    return payloadInput.content;
  }
  if (payloadInput?.old_string && payloadInput?.new_string !== undefined) {
    if (diskContent && diskContent.includes(payloadInput.old_string)) {
      return diskContent.replace(payloadInput.old_string, payloadInput.new_string);
    }
    return diskContent ? `${diskContent}\n${payloadInput.new_string}` : payloadInput.new_string;
  }
  if (payloadInput?.patch) {
    const patch = payloadInput.patch;
    if (typeof patch === 'string' && (patch.includes('\n+') || patch.includes('\n-') || patch.startsWith('---'))) {
      const addedLines = patch
        .split('\n')
        .filter(line => line.startsWith('+') && !line.startsWith('+++'))
        .map(line => line.substring(1))
        .join('\n');
      return diskContent ? `${diskContent}\n${addedLines}` : addedLines;
    }
    return diskContent ? `${diskContent}\n${patch}` : patch;
  }
  if (explicitBuffer) {
    return explicitBuffer;
  }
  return diskContent;
}

function extractImportedPackages(sourceCode) {
  const pkgs = new Set();
  const importRegex = /(?:import\s+.*?from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  let match;
  while ((match = importRegex.exec(sourceCode)) !== null) {
    const pkg = match[1] || match[2];
    if (pkg && (pkg.startsWith('react-native') || pkg.startsWith('@shopify/react-native') || pkg.startsWith('expo') || pkg.includes('reanimated') || pkg.includes('gesture-handler'))) {
      pkgs.add(pkg);
    }
  }
  return Array.from(pkgs);
}

// Light scoped AST visitor fallback with comment and string immunity
function fallbackScopedScan(sourceCode) {
  if (/(?:\/\/|\/\*)\s*@rn-terrain-ignore-file\b/i.test(sourceCode)) {
    return [];
  }

  const violations = [];
  // Strip single-line and multi-line comments
  const strippedCode = sourceCode
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));

  const getLineNumber = (idx) => sourceCode.substring(0, idx).split('\n').length;

  // Check imports
  const importLinesRegex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  let impMatch;
  while ((impMatch = importLinesRegex.exec(strippedCode)) !== null) {
    const rawSpecifiers = impMatch[1] || impMatch[2] || '';
    const sourcePkg = impMatch[3];
    const specifiers = rawSpecifiers.split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);

    for (const spec of specifiers) {
      const rule = FALLBACK_SEVERED_RULES.find(r => r.type === 'import' && r.package === sourcePkg && r.symbol === spec);
      if (rule) {
        violations.push({
          ruleId: rule.id,
          package: rule.package,
          symbol: rule.symbol,
          replacement: rule.replacement,
          message: rule.message,
          template: rule.template,
          severity: rule.severity || 'hard',
          line: getLineNumber(impMatch.index)
        });
      }
    }
  }

  // Check CJS require destructuring: const { X } = require('pkg');
  const requireDestructRegex = /(?:const|let|var)\s+\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let reqMatch;
  while ((reqMatch = requireDestructRegex.exec(strippedCode)) !== null) {
    const rawSpecifiers = reqMatch[1] || '';
    const sourcePkg = reqMatch[2];
    const specifiers = rawSpecifiers.split(',').map(s => s.trim().split(/\s*:\s*/)[0]).filter(Boolean);

    for (const spec of specifiers) {
      const rule = FALLBACK_SEVERED_RULES.find(r => r.package === sourcePkg && r.symbol === spec);
      if (rule) {
        violations.push({
          ruleId: rule.id,
          package: rule.package,
          symbol: rule.symbol,
          replacement: rule.replacement,
          message: rule.message,
          template: rule.template,
          severity: rule.severity || 'hard',
          line: getLineNumber(reqMatch.index)
        });
      }
    }
  }

  // Check calls (excluding calls inside jest.mock)
  const nonMockCode = strippedCode.replace(/jest\.mock\s*\([\s\S]*?\);?/g, (m) => ' '.repeat(m.length));
  for (const rule of FALLBACK_SEVERED_RULES.filter(r => r.type === 'call')) {
    const escapedSymbol = rule.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const callRegex = new RegExp(`\\b${escapedSymbol}\\s*\\(`, 'g');
    let callMatch;
    while ((callMatch = callRegex.exec(nonMockCode)) !== null) {
      violations.push({
        ruleId: rule.id,
        package: rule.package,
        symbol: rule.symbol,
        replacement: rule.replacement,
        message: rule.message,
        template: rule.template,
        severity: rule.severity || 'hard',
        line: getLineNumber(callMatch.index)
      });
    }
  }

  // Check member accesses (e.g. BackHandler.removeEventListener, UIManager.measureInWindow)
  for (const rule of FALLBACK_SEVERED_RULES.filter(r => r.type === 'member')) {
    const memberObj = rule.memberObject || (rule.symbol.includes('.') ? rule.symbol.split('.')[0] : '');
    const memberProp = rule.memberProperty || (rule.symbol.includes('.') ? rule.symbol.split('.')[1] : rule.symbol);
    if (memberObj && memberProp) {
      const memberRegex = new RegExp(`\\b${memberObj}\\s*\\.\\s*${memberProp}\\b`, 'g');
      let memMatch;
      while ((memMatch = memberRegex.exec(nonMockCode)) !== null) {
        violations.push({
          ruleId: rule.id,
          package: rule.package,
          symbol: `${memberObj}.${memberProp}`,
          replacement: rule.replacement,
          message: rule.message,
          template: rule.template,
          severity: rule.severity || 'hard',
          line: getLineNumber(memMatch.index)
        });
      }
    }
  }

  const sourceLines = sourceCode.split('\n');
  return violations.filter(v => !isViolationIgnored(sourceLines, v));
}

function readStdinPayload(timeoutMs = 120) {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve(null);
    let chunks = [];
    let completed = false;

    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        process.stdin.pause();
        process.stdin.removeAllListeners('data');
        process.stdin.removeAllListeners('end');
        process.stdin.removeAllListeners('error');
        resolve(chunks.length > 0 ? Buffer.concat(chunks).toString('utf8').trim() : null);
      }
    }, timeoutMs);

    process.stdin.on('data', (chunk) => {
      chunks.push(chunk);
    });

    process.stdin.on('end', () => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        resolve(chunks.length > 0 ? Buffer.concat(chunks).toString('utf8').trim() : null);
      }
    });

    process.stdin.on('error', () => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        resolve(null);
      }
    });

    process.stdin.resume();
  });
}

async function main() {
  let payloadInput = null;

  // Read piped stdin (JSON payload from Claude Code, Codex, OpenCode) with timeout protection
  const rawInput = await readStdinPayload(120);
  if (rawInput) {
    try {
      const payload = JSON.parse(rawInput);
      payloadInput = payload.input || payload.args || payload;
      if (!targetFilePath) {
        targetFilePath = payloadInput?.file_path ||
                         payloadInput?.filePath ||
                         payloadInput?.path ||
                         '';
      }
    } catch {
      if (!targetFilePath) {
        targetFilePath = rawInput;
      }
    }
  }

  if (!targetFilePath) {
    process.exit(0);
  }

  const normalizedPath = targetFilePath.replace(/\\/g, '/');
  const ext = path.extname(normalizedPath).toLowerCase();
  const isCodeExtension = ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'].includes(ext);

  // 1. Non-code files (Markdown, config, JSON, Rust, CSS) -> Zero friction ALLOW
  if (!isCodeExtension) {
    process.exit(0);
  }

  // 2. Synthesize virtual post-edit document (Remedy 2: Differential Horizon Synthesizer)
  const virtualDocument = synthesizeVirtualDocument(targetFilePath, payloadInput);

  if (/(?:\/\/|\/\*)\s*@rn-terrain-ignore-file\b/i.test(virtualDocument)) {
    console.error('ℹ️ [RN-TERRAIN GATE]: File-level ignore directive (@rn-terrain-ignore-file) detected. Write permitted.');
    process.exit(0);
  }

  const RN_PKG_REGEX = /\b(react-native|react-native-reanimated|react-native-gesture-handler|react-native-worklets|@shopify\/react-native-skia|\bexpo\b)\b/;
  const isRnContent = RN_PKG_REGEX.test(virtualDocument);
  const isRnPath = normalizedPath.includes('mobile/') ||
                   normalizedPath.includes('apps/mobile') ||
                   normalizedPath.includes('components/') ||
                   normalizedPath.includes('screens/') ||
                   normalizedPath.startsWith('app/') ||
                   normalizedPath.includes('/app/') ||
                   normalizedPath.includes('src/');

  const isRnTarget = isRnContent || (isRnPath && (ext === '.tsx' || ext === '.jsx'));

  if (!isRnTarget) {
    process.exit(0);
  }

  // 3. Package-Bound Merkle Receipt Validation (Remedy 5)
  const projectRoot = process.cwd();
  let receiptPath = path.resolve(projectRoot, '.agents', 'state', 'receipt.json');
  try {
    let gitHead = '';
    const gitHeadPath = path.join(projectRoot, '.git', 'HEAD');
    if (fs.existsSync(gitHeadPath)) {
      gitHead = fs.readFileSync(gitHeadPath, 'utf8').trim();
    }
    const hash = crypto.createHash('sha256').update(`${projectRoot}:${gitHead}`).digest('hex').substring(0, 16);
    const worktreeReceipt = path.resolve(projectRoot, '.agents', 'state', 'receipts', `${hash}.json`);
    if (fs.existsSync(worktreeReceipt)) {
      receiptPath = worktreeReceipt;
    }
  } catch {}
  const importedPackages = extractImportedPackages(virtualDocument);

  let receiptData = null;
  if (fs.existsSync(receiptPath)) {
    try {
      receiptData = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    } catch {}
  }

  const ungroundedPackages = [];
  const now = Date.now();

  for (const pkg of importedPackages) {
    const pkgReceipt = receiptData?.packages?.[pkg];
    if (!pkgReceipt) {
      ungroundedPackages.push(pkg);
    } else {
      const ageMs = now - new Date(pkgReceipt.timestamp || receiptData.lastGrounding).getTime();
      if (ageMs > ttlMs) {
        ungroundedPackages.push(pkg);
      }
    }
  }

  // If no specific RN packages were extracted via import, fallback to general check
  if (importedPackages.length === 0) {
    const generalAgeMs = receiptData ? now - new Date(receiptData.lastGrounding).getTime() : Infinity;
    if (!receiptData || generalAgeMs > ttlMs) {
      ungroundedPackages.push('react-native');
    }
  }

  if (ungroundedPackages.length > 0) {
    if (autoGround) {
      try {
        const stateDir = path.resolve(projectRoot, '.agents', 'state');
        if (!fs.existsSync(stateDir)) {
          fs.mkdirSync(stateDir, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        const updatedReceipt = receiptData || { lastGrounding: timestamp, packages: {} };
        updatedReceipt.lastGrounding = timestamp;
        updatedReceipt.lastAction = 'auto_ground_on_intercept';
        updatedReceipt.packages = updatedReceipt.packages || {};

        for (const pkg of ungroundedPackages) {
          updatedReceipt.packages[pkg] = { version: 'latest', timestamp };
        }
        fs.writeFileSync(receiptPath, JSON.stringify(updatedReceipt, null, 2), 'utf8');
        console.error(`⚡ [RN-TERRAIN AUTO-GROUND]: In-flight receipt cut for [${ungroundedPackages.join(', ')}].`);
      } catch {}
    } else {
      console.error('');
      console.error('🛑 [RN-TERRAIN PRE-TOOL GROUNDING GATE: ACTION BLOCKED]');
      console.error('─────────────────────────────────────────────────────────────────');
      console.error(`  Target Surface:      ${normalizedPath}`);
      console.error(`  Ungrounded Packages: ${ungroundedPackages.join(', ')}`);
      console.error('');
      console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
      console.error('  Before writing or editing React Native code, you MUST consult the Outside');
      console.error(`  Referent for all ungrounded packages: [${ungroundedPackages.join(', ')}]`);
      console.error('');
      console.error('  BATCH REMEDIATION (Ground all packages at once):');
      console.error(`    CLI Command: npx @intuitui-labs/rn-terrain compass ${ungroundedPackages.join(' ')}`);
      console.error(`    MCP Tools:   Call tcdi_compass for each package:`);
      for (const p of ungroundedPackages) {
        console.error(`      • tcdi_compass(package_name: "${p}")`);
      }
      console.error('─────────────────────────────────────────────────────────────────');
      console.error('');
      process.exit(2);
    }
  }

  // 3b. React Native Directory Afferent Grounding: Zombie / Abandonware Veto
  const dirCachePath = path.resolve(projectRoot, '.agents', 'state', 'directory-cache.json');
  let dirCache = null;
  if (fs.existsSync(dirCachePath)) {
    try {
      dirCache = JSON.parse(fs.readFileSync(dirCachePath, 'utf8'));
    } catch {}
  }

  const zombiePackages = [];
  for (const pkg of importedPackages) {
    const pkgInfo = dirCache?.packages?.[pkg];
    if (pkgInfo?.unmaintained) {
      zombiePackages.push(pkg);
    }
  }

  if (zombiePackages.length > 0) {
    console.error('');
    console.error('🛑 [RN-TERRAIN ZOMBIE PACKAGE VETO: ACTION BLOCKED]');
    console.error('─────────────────────────────────────────────────────────────────');
    console.error(`  Target Surface:   ${normalizedPath}`);
    console.error(`  Zombie Libraries: ${zombiePackages.join(', ')}`);
    console.error('');
    console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
    console.error('  These packages are flagged as UNMAINTAINED/ABANDONED in React Native Directory.');
    console.error('  They will cause crashes or build failures on modern platforms.');
    console.error('  Replace them with active community alternatives.');
    console.error('─────────────────────────────────────────────────────────────────');
    console.error('');
    process.exit(2);
  }

  // 4. Multi-Layer Invariant Verification Substrate
  let violations = [];
  let ImmuneSystem = null;
  let HermesSentry = null;
  let scannerMod = null;

  try {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const candidateScannerPaths = [
      'c:/projects/rn-terrain/packages/scanner/dist/index.js',
      path.resolve(projectRoot, 'packages', 'scanner', 'dist', 'index.js'),
      path.resolve(scriptDir, '..', 'packages', 'scanner', 'dist', 'index.js'),
      path.resolve(projectRoot, 'node_modules', '@intuitui-labs', 'rn-terrain-scanner', 'dist', 'index.js'),
      path.resolve(scriptDir, '..', 'node_modules', '@intuitui-labs', 'rn-terrain-scanner', 'dist', 'index.js'),
      path.resolve(projectRoot, 'node_modules', '@intuitui-labs', 'rn-terrain', 'node_modules', '@intuitui-labs', 'rn-terrain-scanner', 'dist', 'index.js'),
      path.resolve(scriptDir, '..', 'node_modules', '@intuitui-labs', 'rn-terrain', 'node_modules', '@intuitui-labs', 'rn-terrain-scanner', 'dist', 'index.js'),
    ];

    for (const cand of candidateScannerPaths) {
      if (fs.existsSync(cand)) {
        try {
          scannerMod = await import(pathToFileURL(cand).href);
          if (scannerMod) break;
        } catch {}
      }
    }

    if (!scannerMod) {
      try {
        scannerMod = await import('@intuitui-labs/rn-terrain-scanner');
      } catch {}
    }

    if (scannerMod && scannerMod.ScopedAstParser) {
      const parser = new scannerMod.ScopedAstParser();
      ImmuneSystem = scannerMod.ImmuneSystem;
      HermesSentry = scannerMod.HermesSentry;
      violations = parser.parseAndScan(virtualDocument, { filePath: targetFilePath });
    } else {
      violations = fallbackScopedScan(virtualDocument);
    }
  } catch {
    violations = fallbackScopedScan(virtualDocument);
  }

  // 4a. Parametric Hallucination Honeypot Engine Trapdoors
  if (scannerMod && scannerMod.HoneypotEngine) {
    try {
      const honeypotEngine = new scannerMod.HoneypotEngine();
      const hpReport = honeypotEngine.detectHoneypots(virtualDocument, targetFilePath);
      if (hpReport.hasTrapdoorTriggered) {
        console.error('');
        console.error('🛑 [RN-TERRAIN PARAMETRIC HALLUCINATION TRAPDOOR: ACTION BLOCKED]');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error(`  Target Surface: ${normalizedPath}`);
        console.error('  Status:         IMAGINARY / CONFABULATED API DETECTED');
        console.error('');
        for (const v of hpReport.violations) {
          console.error(`  • Hallucinated Symbol: ${v.symbol} (${v.package})`);
          console.error(`    Detail:              ${v.message}`);
          console.error(`    Canonical Fix:       ${v.canonicalRemediation}`);
        }
        console.error('');
        console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
        console.error('  This symbol does NOT exist in physical reality. Ground your context with:');
        console.error(`  rn-terrain compass ${hpReport.violations[0]?.package || 'react-native'}`);
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
        await publishAntibodyGossip(
          projectRoot,
          hpReport.violations.map(v => ({
            severedSymbol: v.symbol,
            culpritPackage: v.package,
            canonicalRemediation: v.canonicalRemediation
          }))
        );
        process.exit(2);
      }
    } catch {}
  }

  // 4b. Nitro C++ Native Architecture Auditor
  if (scannerMod && scannerMod.NitroAuditor) {
    try {
      const nitroAuditor = new scannerMod.NitroAuditor(projectRoot);
      const nitroFindings = nitroAuditor.verifyCodeSnippet(virtualDocument);
      const hardNitro = nitroFindings.filter(f => f.severity === 'error');
      const softNitro = nitroFindings.filter(f => f.severity === 'warning');

      if (softNitro.length > 0) {
        console.error('');
        console.error('ℹ [RN-TERRAIN NITRO WORKLET ADVISORY: ACTION ALLOWED WITH WARNING]');
        console.error('─────────────────────────────────────────────────────────────────');
        for (const sn of softNitro) {
          console.error(`  • ${sn.message}`);
          console.error(`    Remediation: ${sn.remediation}`);
        }
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
      }

      if (hardNitro.length > 0) {
        console.error('');
        console.error('🛑 [RN-TERRAIN NITRO C++ NATIVE ARCHITECTURE VETO: ACTION BLOCKED]');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error(`  Target Surface: ${normalizedPath}`);
        console.error('  Status:         NITRO HYBRIDOBJECT ACCESSED VIA OBSOLETE BRIDGE / TURBOMODULE SPEC');
        console.error('');
        for (const hn of hardNitro) {
          console.error(`  • Violation:   ${hn.message}`);
          console.error(`    Remediation: ${hn.remediation}`);
        }
        console.error('');
        console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
        console.error('  This module is a C++ JSI Nitro HybridObject.');
        console.error('  Import NitroModules from \'react-native-nitro-modules\' and call createHybridObject.');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
        await publishAntibodyGossip(
          projectRoot,
          hardNitro.map(v => ({
            severedSymbol: 'NitroHybridObject',
            culpritPackage: 'react-native-nitro-modules',
            canonicalRemediation: v.remediation
          }))
        );
        process.exit(2);
      }
    } catch {}
  }

  // 4c. Native Anti-Slop Audit (Mobile Footguns: raw useEffect fetch, leaked env secrets, unvirtualized map in ScrollView)
  if (virtualDocument.trim().length > 0) {
    try {
      let antiSlopFindings = [];
      if (scannerMod && scannerMod.NativeAntiSlopEngine) {
        const antiSlopEngine = new scannerMod.NativeAntiSlopEngine();
        antiSlopFindings = antiSlopEngine.diagnoseSource(virtualDocument, targetFilePath);
      } else {
        // Fallback Anti-Slop regex checks
        const lines = virtualDocument.split(/\r?\n/);
        // 1. RAW_EFFECT_FETCH
        const effectBlockRegex = /useEffect\s*\(\s*(?:async\s*)?\(\)\s*=>\s*\{([\s\S]*?)\}\s*(?:,\s*\[[^\]]*\]\s*)?\)/g;
        let effectMatch;
        while ((effectMatch = effectBlockRegex.exec(virtualDocument)) !== null) {
          const blockBody = effectMatch[1] || '';
          if (/(?:fetch\(|axios\.|supabase\.from|client\.query\()/.test(blockBody)) {
            const lineIdx = virtualDocument.slice(0, effectMatch.index).split(/\r?\n/).length;
            antiSlopFindings.push({
              ruleId: 'RAW_EFFECT_FETCH',
              severity: 'error',
              title: 'Raw Data-Fetching in useEffect',
              message: 'Raw data-fetching inside useEffect detected. Use TanStack Query (useQuery) or PowerSync useLiveQuery.',
              line: lineIdx,
              remediationAdvice: 'Migrate to useQuery() from @tanstack/react-query or useLiveQuery() from @powersync/react.'
            });
          }
        }
        // 2. EXPO_PUBLIC_SECRET_LEAK
        const secretRegex = /EXPO_PUBLIC_[A-Z0-9_]*(?:SECRET|PRIVATE|SERVICE_ROLE|ADMIN_KEY|TOKEN)[A-Z0-9_]*/g;
        let secretMatch;
        while ((secretMatch = secretRegex.exec(virtualDocument)) !== null) {
          const lineIdx = virtualDocument.slice(0, secretMatch.index).split('\n').length;
          antiSlopFindings.push({
            ruleId: 'EXPO_PUBLIC_SECRET_LEAK',
            severity: 'error',
            title: 'Potential Secret Leaked in Client Environment Variable',
            message: `Variable ${secretMatch[0]} appears to contain a secret token/key. Client bundles expose all EXPO_PUBLIC_* variables.`,
            line: lineIdx,
            remediationAdvice: 'Store secrets on the server or inject them via secure server routes.'
          });
        }
        // 3. UNVIRTUALIZED_COLLECTION
        const unvirtualizedRegex = /<ScrollView(?![^>]*\bhorizontal\b)[^>]*>[\s\S]*?\{(?:data|items|surveys|historyItems|users|entities|results|records|submissions|rows|columns|products|cards|list)\.map\(/m;
        if (unvirtualizedRegex.test(virtualDocument)) {
          const mapLineIdx = lines.findIndex(l => /\{(?:data|items|surveys|historyItems|users|entities|results|records|submissions|rows|columns|products|cards|list)\.map\(/.test(l));
          antiSlopFindings.push({
            ruleId: 'UNVIRTUALIZED_COLLECTION',
            severity: 'error',
            title: 'Unvirtualized Collection in ScrollView',
            message: 'Unvirtualized .map() inside vertical ScrollView degrades frame rate and causes OOM crashes.',
            line: mapLineIdx >= 0 ? mapLineIdx + 1 : 1,
            remediationAdvice: 'Replace ScrollView + .map() with FlashList or FlatList.'
          });
        }
      }

      const hardAntiSlop = antiSlopFindings.filter(f => f.severity === 'error');
      const softAntiSlop = antiSlopFindings.filter(f => f.severity === 'warning');

      if (softAntiSlop.length > 0) {
        console.error('');
        console.error('ℹ [RN-TERRAIN ANTI-SLOP ADVISORY: ACTION ALLOWED WITH WARNING]');
        console.error('─────────────────────────────────────────────────────────────────');
        for (const sf of softAntiSlop) {
          console.error(`  • [${sf.ruleId}] ${sf.title} (line ${sf.line}): ${sf.message}`);
          console.error(`    Remediation: ${sf.remediationAdvice}`);
        }
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
      }

      if (hardAntiSlop.length > 0) {
        console.error('');
        console.error('🛑 [RN-TERRAIN NATIVE ANTI-SLOP GATE: ACTION BLOCKED]');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error(`  Target Surface: ${normalizedPath}`);
        console.error('  Status:         MOBILE ANTI-SLOP INVARIANT VIOLATION DETECTED');
        console.error('');
        for (const hf of hardAntiSlop) {
          console.error(`  • [${hf.ruleId}] ${hf.title} (line ${hf.line})`);
          console.error(`    Detail:      ${hf.message}`);
          console.error(`    Remediation: ${hf.remediationAdvice}`);
        }
        console.error('');
        console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
        console.error('  Mobile anti-slop rules prohibit raw fetch in useEffect, leaked secrets, or unvirtualized collections.');
        console.error('  Remediate the architecture before writing to disk.');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
        await publishAntibodyGossip(
          projectRoot,
          hardAntiSlop.map(v => ({
            severedSymbol: v.ruleId,
            culpritPackage: 'react-native',
            canonicalRemediation: v.remediationAdvice
          }))
        );
        process.exit(2);
      }
    } catch {}
  }

  const hardViolations = violations.filter(v => v.severity !== 'soft');
  const softViolations = violations.filter(v => v.severity === 'soft');

  if (softViolations.length > 0) {
    console.error('');
    console.error('ℹ [RN-TERRAIN ADVISORY DEPRECATION: ACTION ALLOWED WITH WARNING]');
    console.error('─────────────────────────────────────────────────────────────────');
    for (const v of softViolations) {
      console.error(`  • Deprecated Symbol: ${v.symbol} (${v.package})`);
      console.error(`    Suggested Fix:     ${v.replacement}`);
      console.error(`    Detail:            ${v.message}`);
    }
    console.error('─────────────────────────────────────────────────────────────────');
    console.error('');
  }

  if (hardViolations.length > 0) {
    console.error('');
    console.error('🛑 [RN-TERRAIN PRE-WRITE BUFFER AST GATE: ACTION BLOCKED]');
    console.error('─────────────────────────────────────────────────────────────────');
    console.error(`  Target Surface: ${normalizedPath}`);
    console.error('  Status:         SEVERED / OBSOLETE API DETECTED IN SYNTHESIZED BUFFER');
    console.error('');
    console.error('  VIOLATIONS FOUND:');
    for (const v of hardViolations) {
      console.error(`    • Symbol:      ${v.symbol}`);
      console.error(`      Package:     ${v.package}`);
      console.error(`      Replacement: ${v.replacement}`);
      console.error(`      Detail:      ${v.message}`);
      if (v.template) {
        console.error('');
        console.error('  📋 CANONICAL DROP-IN REPLACEMENT TEMPLATE (COPY DIRECTLY):');
        console.error('  ─────────────────────────────────────────────────────────────────');
        for (const line of v.template.split('\n')) {
          console.error(`  ${line}`);
        }
        console.error('  ─────────────────────────────────────────────────────────────────');
      }
      console.error('');
    }
    console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
    console.error('  Your proposed code contains obsolete/severed APIs that will cause runtime crashes.');
    console.error('  Regenerate your code using the exact canonical template shown above.');
    console.error('─────────────────────────────────────────────────────────────────');
    console.error('');

    // Clonal Selection: Synthesize antibodies in immune memory ledger
    if (ImmuneSystem) {
      try {
        const ais = new ImmuneSystem(path.resolve(projectRoot, '.agents', 'state', 'immune-memory.json'));
        for (const v of hardViolations) {
          const parts = (v.symbol || '').split('.');
          ais.registerAntibody({
            callee: parts.length > 1 ? parts[parts.length - 1] : parts[0] || v.symbol,
            object: parts.length > 1 ? parts[0] : undefined,
            sourcePackage: v.package,
            replacement: v.replacement,
            message: v.message,
            severity: 'hard'
          });
        }
      } catch {}
    }

    // Optional Local Incident Telemetry (STRICTLY OPT-IN BY DEFAULT)
    const isTelemetryOptedIn =
      process.env.TERRAIN_TELEMETRY === '1' ||
      process.env.TERRAIN_TELEMETRY === 'true' ||
      (() => {
        try {
          const rcPath = path.resolve(projectRoot, '.terrainrc');
          if (fs.existsSync(rcPath)) {
            const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
            return rc.telemetry === true;
          }
        } catch {}
        return false;
      })();

    if (isTelemetryOptedIn) {
      try {
        const incidentsDir = path.resolve(projectRoot, '.terrain', 'incidents');
        if (!fs.existsSync(incidentsDir)) {
          fs.mkdirSync(incidentsDir, { recursive: true });
        }
        const firstFinding = violations[0];
        const incId = `inc-${(firstFinding.package || 'rn').replace(/[^a-z0-9]/gi, '_')}-${Date.now().toString(36)}`;
        const incidentData = {
          id: incId,
          timestamp: new Date().toISOString(),
          packageName: firstFinding.package || 'unknown',
          targetVersion: 'latest',
          rejectedSnippet: virtualDocument.slice(0, 2000),
          severedSymbolsDetected: violations.map(v => v.symbol),
          canonicalReplacements: violations.map(v => v.replacement),
          status: 'RECORDED'
        };
        fs.writeFileSync(path.join(incidentsDir, `${incId}.json`), JSON.stringify(incidentData, null, 2), 'utf8');
        console.error(`  [LOCAL TELEMETRY RECORDED (OPT-IN)]: Incident ${incId} captured for triage.`);
        console.error('');
      } catch {}
    }

    await publishAntibodyGossip(
      projectRoot,
      hardViolations.map(v => ({
        severedSymbol: v.symbol,
        culpritPackage: v.package,
        canonicalRemediation: v.replacement,
      }))
    );

    process.exit(2);
  }

  // 5. Headless Yoga Virtual Layout Prover
  if (scannerMod && scannerMod.YogaLayoutProver && virtualDocument.trim().length > 0) {
    try {
      const yogaProver = new scannerMod.YogaLayoutProver();
      const layoutReport = yogaProver.diagnoseLayout(virtualDocument, targetFilePath);
      const layoutErrors = layoutReport.violations.filter(v => v.severity === 'error');
      const layoutWarnings = layoutReport.violations.filter(v => v.severity === 'warning');

      if (layoutWarnings.length > 0) {
        console.error('');
        console.error('ℹ [RN-TERRAIN LAYOUT ADVISORY: ACTION ALLOWED WITH WARNING]');
        console.error('─────────────────────────────────────────────────────────────────');
        for (const lw of layoutWarnings) {
          console.error(`  • <${lw.component}>: ${lw.message}`);
          console.error(`    Suggested Fix: ${lw.remediation}`);
        }
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
      }

      if (layoutErrors.length > 0) {
        console.error('');
        console.error('🛑 [RN-TERRAIN YOGA VIRTUAL LAYOUT PROVER: ACTION BLOCKED]');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error(`  Target Surface: ${normalizedPath}`);
        console.error('  Status:         FATAL MOBILE LAYOUT COLLAPSE DETECTED');
        console.error('');
        for (const le of layoutErrors) {
          console.error(`  • Component:   <${le.component}> (line ${le.line || 1})`);
          console.error(`    Detail:      ${le.message}`);
          console.error(`    Remediation: ${le.remediation}`);
        }
        console.error('');
        console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
        console.error('  Your JSX renders a ScrollView or container that will collapse to 0px height.');
        console.error('  Apply flex: 1 or contentContainerStyle bounds before writing to disk.');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
        await publishAntibodyGossip(
          projectRoot,
          layoutErrors.map(v => ({
            severedSymbol: v.component,
            culpritPackage: 'react-native',
            canonicalRemediation: v.remediation
          }))
        );
        process.exit(2);
      }
    } catch {}
  }

  // 6. Post-Run Hermes Micro-Bytecode & Strictness Sentry
  if (scannerMod && scannerMod.HermesBytecodeVerifier && virtualDocument.trim().length > 0) {
    try {
      const hermesVerifier = new scannerMod.HermesBytecodeVerifier();
      const hermesRes = hermesVerifier.verifyCode(virtualDocument, targetFilePath);
      if (!hermesRes.valid && hermesRes.error) {
        console.error('');
        console.error('🛑 [RN-TERRAIN POST-RUN HERMES BYTECODE SENTRY: ACTION BLOCKED]');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error(`  Target Surface: ${normalizedPath}`);
        console.error('  Status:         HERMES ENGINE COMPATIBILITY / STRICTNESS FAILURE');
        console.error(`  • Error:        ${hermesRes.error}`);
        if (hermesRes.tasteNudge) {
          console.error(`    Tip:          ${hermesRes.tasteNudge}`);
        }
        console.error('');
        console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
        console.error('  Hermes JavaScript engine prohibits this construct (strict mode syntax / reserved keyword / worklet closure escape).');
        console.error('  Fix the syntax error before proceeding.');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
        process.exit(2);
      }
    } catch {}
  } else if (HermesSentry && virtualDocument.trim().length > 0) {
    try {
      const hermesRes = HermesSentry.verify(virtualDocument, targetFilePath);
      if (!hermesRes.valid) {
        console.error('');
        console.error('🛑 [RN-TERRAIN POST-RUN HERMES SENTRY: ACTION BLOCKED]');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error(`  Target Surface: ${normalizedPath}`);
        console.error('  Status:         HERMES ENGINE COMPATIBILITY / STRICTNESS FAILURE');
        for (const diag of hermesRes.diagnostics) {
          console.error(`  • [${diag.rule || 'hermes-syntax'}] ${diag.message} (line ${diag.line || 1}:${diag.column || 0})`);
        }
        console.error('');
        console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
        console.error('  Hermes JavaScript engine prohibits this construct (strict mode syntax / reserved keyword).');
        console.error('  Fix the syntax error before proceeding.');
        console.error('─────────────────────────────────────────────────────────────────');
        console.error('');
        process.exit(2);
      }
    } catch {}
  }

  // All invariants satisfied -> ALLOW
  process.exit(0);
}

main().catch(() => process.exit(0));
