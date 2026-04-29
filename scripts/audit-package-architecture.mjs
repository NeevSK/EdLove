import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const targetPackage = args.filter((a) => !a.startsWith('--'))[0];

if (!targetPackage) {
  console.error('Please specify a package path (e.g. packages/core).');
  process.exit(1);
}

let pkgBase = path.isAbsolute(targetPackage) ? targetPackage : path.join(ROOT_DIR, targetPackage);
let pkgJsonPath = path.join(pkgBase, 'package.json');

// Traverse upwards to find package.json if not in current target
while (!fs.existsSync(pkgJsonPath) && pkgBase !== ROOT_DIR && pkgBase !== path.dirname(pkgBase)) {
  pkgBase = path.dirname(pkgBase);
  pkgJsonPath = path.join(pkgBase, 'package.json');
}

if (!fs.existsSync(pkgJsonPath)) {
  console.error(
    `Package.json not found at ${pkgJsonPath} or any parent directory up to ${ROOT_DIR}`,
  );
  process.exit(1);
}

console.log(`\x1b[36m>>> Shiny Auditing Package Architecture: ${targetPackage}\x1b[0m`);

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const pkgName = pkgJson.name || path.basename(pkgBase);

const report = {
  title: `🏛️ sovereign_audit:architecture - ${pkgName}`,
  packageName: pkgName,
  timestamp: new Date().toISOString(),
  target: targetPackage,
  packageRoot: pkgBase,
  sections: [],
  violations: [],
  warnings: [],
  stats: {
    subpaths: 0,
    violationCount: 0,
    warningCount: 0,
  },
};

const addViolation = (type, file, message, ref) => {
  report.violations.push({ type, file, message, ref });
  report.stats.violationCount++;
};

const addWarning = (message) => {
  report.warnings.push(message);
  report.stats.warningCount++;
};

console.log(`\x1b[36m>>> Sovereign Auditing Package Architecture: ${pkgName}\x1b[0m`);

// 1. Check Subpath Exports
const exportsSection = { title: '📦 Subpath Exports Check', lines: [] };
if (pkgJson.exports) {
  const subpaths = Object.keys(pkgJson.exports);
  report.stats.subpaths = subpaths.length;
  exportsSection.lines.push(`✅ Exports map found with ${subpaths.length} subpaths.`);
  exportsSection.lines.push(`   Subpaths: ${subpaths.join(', ')}`);
} else {
  addWarning('No "exports" map found in package.json. Tree-shaking may be suboptimal.');
  exportsSection.lines.push('❌ No "exports" map found in package.json.');
}
report.sections.push(exportsSection);

// 2. Logic Separation & Platform Agnosticism
const srcDir = path.join(pkgBase, 'src');
if (fs.existsSync(srcDir)) {
  const normalize = (line) => (line ? String(line).replace(/\\/g, '/') : '');

  const runAuditRg = (pattern, globInclude, globExclude = []) => {
    try {
      const excludeFlags = globExclude.map((g) => `-g "!${g}"`).join(' ');
      const includeFlags = `-g "{${globInclude}}/**"`;
      const cmd = `rg --pcre2 "${pattern}" "." ${includeFlags} ${excludeFlags} -g "**.ts" -g "**.tsx" --with-filename --no-heading --line-number`;
      const output = execSync(cmd, { cwd: srcDir, encoding: 'utf-8' });
      return output.split('\n').filter((l) => l.trim());
    } catch (e) {
      return [];
    }
  };

  const isIgnored = (line) =>
    line.includes('@sovereign-ignore') || line.includes('architecture-ignore');

  // 2a. Logic -> UI leaks
  const uiMatches = runAuditRg(
    '^\\s*import.*from.*\\b(@repo/ui|components|screens|ui)\\b',
    'logic,services,utils,lib,api,hooks,store',
    ['adapters/**'],
  );
  uiMatches.forEach((line) => {
    const normalizedLine = normalize(line);
    if (normalizedLine.includes('/index.ts') || normalizedLine.includes('/index.tsx')) return;

    const parts = normalizedLine.split(':');
    const file = parts[0];
    const message = parts.slice(1).join(':').trim();

    const filePath = path.join(srcDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('import React') || content.includes('<')) return;
    }

    if (isIgnored(line)) return;
    addViolation('LOGIC -> UI', file, message, 'N/A');
  });

  // 2b. Native pollution
  const nativePattern =
    'from.*\\b(react-native|expo-\\w+|@react-native-\\w+|@react-native-community\\/\\w+)\\b';
  const nativeMatches = runAuditRg(nativePattern, 'logic,services,utils,lib,api,hooks', [
    'adapters/**',
    'native/**',
  ]);
  nativeMatches.forEach((line) => {
    const normalizedLine = normalize(line);
    if (normalizedLine.includes('/native/') || normalizedLine.includes('/adapters/')) return;
    if (isIgnored(line)) return;

    const parts = normalizedLine.split(':');
    addViolation('NATIVE POLLUTION', parts[0], parts.slice(1).join(':').trim(), 'N/A');
  });

  // 3. UUID Consistency Check
  try {
    const v4Match = execSync(`rg "uuid.*v4" "${srcDir}" -l`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean).length;
    const v7Match = execSync(`rg "uuid.*v7" "${srcDir}" -l`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean).length;
    if (v4Match > 0 && v7Match > 0) {
      addWarning(
        `Mixed UUID versions detected: v4 (${v4Match} files) and v7 (${v7Match} files). Standardize on v7.`,
      );
    } else if (v4Match > 0) {
      addWarning('Using legacy UUID v4. Consider upgrading to v7 for sortability.');
    }
  } catch (e) {}

  // 4. Zero-Legacy & State Management
  const legacyPrimitives = runAuditRg(
    '^\\s*import.*from.*\\b(react-native|@gluestack-ui/themed)\\b.*\\b(View|Text|Pressable|ScrollView|FlatList|TextInput|Button)\\b',
    'components,screens,context,features',
    ['components-legacy/**', 'gluestack-legacy/**', '**/index.ts', '**/index.tsx'],
  );
  legacyPrimitives.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation(
      'LEGACY UI',
      parts[0],
      parts.slice(1).join(':').trim(),
      'apps/gurudevi-mobile/docs/Core/ui-development-guide.md',
    );
  });

  // 4b. State Density
  try {
    const stateCounts = execSync(`rg "useState" "${srcDir}" --count --with-filename`, {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(Boolean);
    stateCounts.forEach((countLine) => {
      const lastColon = countLine.lastIndexOf(':');
      if (lastColon === -1) return;
      const file = countLine.substring(0, lastColon);
      const count = parseInt(countLine.substring(lastColon + 1).trim());
      if (count > 2) {
        const relFile = path.isAbsolute(file) ? path.relative(srcDir, file) : file;
        addViolation(
          'STATE DENSITY',
          normalize(relFile),
          `Has ${count} useState hooks.`,
          'packages/ui/docs/state-management-guide.md',
        );
      }
    });
  } catch (e) {}

  // 4c. Store Selector Integrity
  const missingSelectors = runAuditRg('const.*=.*use.*Store\\(\\)', '.');
  missingSelectors.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation(
      'SUBSCRIPTION',
      parts[0],
      'Missing atomic selector.',
      'packages/ui/docs/state-management-guide.md#iii-the-facade-trap',
    );
  });

  // 4d. Memory Sinkholes
  const anonymousSinks = runAuditRg(
    '\\b(onPress|onRefresh|onSearch|onAction|onSelect)=\\{[^\\}]*=>',
    '.',
  );
  anonymousSinks.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation(
      'MEM SINK',
      parts[0],
      'Inline anonymous function in JSX.',
      'packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink',
    );
  });

  // 5. Tree-Shaking Hygiene
  try {
    const indices = execSync(`rg -g "**/index.ts" -g "**/index.tsx" --files "${srcDir}"`, {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(Boolean);
    indices.forEach((idxPath) => {
      const fullPath = path.isAbsolute(idxPath) ? idxPath : path.join(srcDir, idxPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.match(/^export\s+\*\s+from/m)) {
        addWarning(`Wildcard export in ${normalize(path.relative(pkgBase, fullPath))}`);
      }
    });
  } catch (e) {}

  // 6. Accessibility Compliance (A11Y)
  const interactiveExpr =
    '\\b(Pressable|TouchableOpacity|TouchableHighlight|Button|Image|AvatarImage|SanctuaryButton)\\b';
  const interactiveMatches = runAuditRg(interactiveExpr, 'components,screens,features');
  interactiveMatches.forEach((line) => {
    if (isIgnored(line)) return;
    const hasLabel = line.includes('accessibilityLabel') || line.includes('alt=');
    const hasRole = line.includes('accessibilityRole');
    const hasHint = line.includes('accessibilityHint');

    const parts = normalize(line).split(':');
    const file = parts[0];

    if (!hasLabel && (line.includes('onPress') || line.includes('Image'))) {
      addViolation(
        'A11Y',
        file,
        'Component missing accessibilityLabel or alt text.',
        'apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility',
      );
    } else if (hasLabel && !hasHint && !line.includes('Image')) {
      addWarning(
        `A11Y Hint Missing in ${file}: Interactive elements with labels should have hints for clarity.`,
      );
    }
  });

  // 7. React Hook Integrity
  const hookViolations = runAuditRg('\\buseLayoutEffect\\(', 'components,screens,features');
  hookViolations.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation(
      'HOOK VIOLATION',
      parts[0],
      'Use of useLayoutEffect detected. Prefer useEffect or logic-agnostic design.',
      'packages/ui/docs/state-management-guide.md',
    );
  });

  const excessiveEffects = runAuditRg('useEffect\\(\\(.*\\) => \\{', '.');
  excessiveEffects.forEach((line) => {
    if (line.includes('useEffect') && !line.includes('[]') && !line.includes(',')) {
      if (line.endsWith('})') || line.endsWith('});')) {
        const parts = normalize(line).split(':');
        addViolation(
          'HOOK VIOLATION',
          parts[0],
          'Effect missing dependency array.',
          'packages/ui/docs/state-management-guide.md#2-memory-management-the-referential-tissue',
        );
      }
    }
  });

  // 7b. Action-Based Opportunity
  const manualFormStates = runAuditRg('useState\\(false\\).*\\bloading\\b', '.');
  manualFormStates.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addWarning(
      `Manual loading state in ${parts[0]}. Consider upgrading to useActionState or useTransition.`,
    );
  });

  // 7c. Effect Sync Detection
  const syncEffects = runAuditRg('useEffect\\(\\(.*\\) => \\{\\s+set', '.');
  syncEffects.forEach((line) => {
    if (isIgnored(line) || line.includes('setLoading(false)')) return; // Ignore final cleanup
    const parts = normalize(line).split(':');
    addViolation(
      'SYNC EFFECT',
      parts[0],
      'Effect used for state synchronization or synchronous triggering. Use Derived State or call in handler.',
      'packages/ui/docs/state-management-guide.md#4-best-practices-checklist',
    );
  });

  // 7d. Conditional/Late Hooks (React Compiler Prep)
  const allHooks = [
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useTransition',
    'useActionState',
  ];
  try {
    const tsFiles = execSync(`find "${srcDir}" -name "*.ts" -o -name "*.tsx"`, {
      encoding: 'utf-8',
    })
      .split('\n')
      .filter(Boolean);
    tsFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      let foundReturn = false;
      lines.forEach((line, index) => {
        if (line.match(/^\s*return\s+[(<;]/)) {
          foundReturn = true;
        }
        if (foundReturn) {
          allHooks.forEach((hook) => {
            if (line.includes(`${hook}(`) && !isIgnored(line)) {
              addViolation(
                'CONDITIONAL HOOK',
                normalize(path.relative(srcDir, file)),
                `Hook '${hook}' called after return statement at line ${index + 1}.`,
                'N/A',
              );
            }
          });
        }
      });
    });
  } catch (e) {
    // If find fails, fallback to simple grep for return...useState
    allHooks.forEach((hook) => {
      const lateHooks = runAuditRg(`return.*;\\s*.*${hook}\\(`, '.');
      lateHooks.forEach((line) => {
        const parts = normalize(line).split(':');
        addViolation('CONDITIONAL HOOK', parts[0], `Late ${hook} usage detected.`, 'N/A');
      });
    });
  }

  // 8. Boundary Enforcement
  const isAppImport = runAuditRg('from.*\\b@app/\\b', '.');
  isAppImport.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation(
      'BOUNDARY',
      parts[0],
      'Packages must not import from apps. Use shared packages.',
      'N/A',
    );
  });

  const featurePackages = ['admin', 'classroom', 'community', 'people'];
  const currentBaseName = path.basename(pkgBase);

  if (currentBaseName === 'core' || currentBaseName === 'ui') {
    featurePackages.forEach((feature) => {
      const matches = runAuditRg(`from.*\\b(@repo/${feature})\\b`, '.');
      matches.forEach((line) => {
        if (isIgnored(line)) return;
        const parts = normalize(line).split(':');
        addViolation(
          'BOUNDARY',
          parts[0],
          `Fundamental package (${currentBaseName}) cannot import from feature package (${feature}).`,
          'N/A',
        );
      });
    });
  } else if (featurePackages.includes(currentBaseName)) {
    featurePackages
      .filter((f) => f !== currentBaseName)
      .forEach((otherFeature) => {
        const matches = runAuditRg(`from.*\\b(@repo/${otherFeature})\\b`, '.');
        matches.forEach((line) => {
          if (isIgnored(line)) return;
          const parts = normalize(line).split(':');
          addViolation(
            'BOUNDARY',
            parts[0],
            `Feature package isolation breach: ${currentBaseName} imported from ${otherFeature}.`,
            'N/A',
          );
        });
      });
  }

  // 9. Platform Sovereignty (Web Leakage & Shim Integrity)
  const webApiPattern =
    '(?<![\\.\'"])\\b(window|document|localStorage|sessionStorage|navigator)\\b(?![\\\'":])';
  const webApiLeaks = runAuditRg(webApiPattern, '.');
  webApiLeaks.forEach((line) => {
    const normalizedLine = normalize(line);
    const parts = normalizedLine.split(':');
    const file = parts[0];
    const text = parts.slice(1).join(':').trim();

    // Ignore type/interface definitions
    if (text.includes('type ') || text.includes('interface ')) return;

    // Only ignore if the word is the property name in an object or a parameter (already handled by regex lookahead)
    // Extra guard: Ignore if it's a local variable declaration of THAT specific word
    if (text.match(new RegExp(`^(const|let|var|readonly)\\s+${webApiPattern}\\s*=`))) return;

    if (!file.includes('.web.') && !isIgnored(line)) {
      addViolation(
        'PLATFORM LEAK',
        file,
        `Web-only API usage detected in mobile/shared file: ${text}`,
        'N/A',
      );
    }
  });

  // 9b. Detecting DOM-like HTML tags in non-web components
  const htmlTagPattern = '<(div|span|p|img|button|section|ul|li|a)\\b';
  const htmlLeaks = runAuditRg(htmlTagPattern, 'components,screens,features');
  htmlLeaks.forEach((line) => {
    const normalizedLine = normalize(line);
    const parts = normalizedLine.split(':');
    const file = parts[0];
    const text = parts.slice(1).join(':').trim();

    if (!file.includes('.web.') && !isIgnored(line)) {
      // Filter out common false positives in TSX (like 'div' in generics or other props)
      if (text.includes('import ') || text.includes('@repo/ui')) return;
      addViolation(
        'PLATFORM LEAK',
        file,
        `HTML tag leakage detected in mobile component: ${text}`,
        'N/A',
      );
    }
  });

  // 9c. Detecting Platform Branching (Should use shims)
  // We explicitly allow Platform.select as it is a modern best practice for medium-complexity values.
  const platformBranching = runAuditRg(
    'Platform\\.OS === ([\'"]web[\'"]|[\'"]ios[\'"]|[\'"]android[\'"])',
    'logic,services,utils,hooks',
  );
  platformBranching.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation(
      'SHIM DEBT',
      parts[0],
      'Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation.',
      'N/A',
    );
  });

  // 10. Web Sovereignty (Native Overflow in Web Files)
  const nativeInWebPattern = '\\b(NativeModules|NativeEventEmitter|RTN\\w+)\\b';
  const nativeInWebLeaks = runAuditRg(nativeInWebPattern, '.');
  nativeInWebLeaks.forEach((line) => {
    const normalizedLine = normalize(line);
    const parts = normalizedLine.split(':');
    const file = parts[0];
    const text = parts.slice(1).join(':').trim();

    if (file.includes('.web.') && !isIgnored(line)) {
      addViolation('WEB OVERFLOW', file, `Native-only API used in web file: ${text}`, 'N/A');
    }
  });

  // 10b. Web SEO Hygiene (Heuristic for screens)
  const webScreens = runAuditRg('export default', 'screens', ['**.web.tsx']);
  webScreens.forEach((line) => {
    const parts = normalize(line).split(':');
    const file = parts[0];
    // Check if the file calls DocumentService.setTitle (very loose heuristic)
    try {
      const content = fs.readFileSync(path.join(pkgBase, file), 'utf-8');
      if (!content.includes('setTitle') && !content.includes('useDocumentMetadata')) {
        // addViolation('WEB HYGIENE', file, 'Web screen might be missing SEO/Document title management.', 'N/A');
      }
    } catch (e) {}
  });
}

// --- Report Generation ---
const mdSections = [
  `# ${report.title}`,
  `> **Timestamp:** ${report.timestamp}`,
  `> **Target Path:** \`${report.target}\``,
  `> **Audit Score:** ${report.stats.violationCount === 0 ? '🏆 PERFECT' : report.stats.violationCount < 5 ? '🟡 STABLE' : '🔴 ACTION REQUIRED'}`,
  '',
  '## 📊 Executive Summary',
  '| Metric | Value |',
  '| :--- | :--- |',
  `| **Total Violations** | ${report.stats.violationCount} |`,
  `| **Hygiene Warnings** | ${report.stats.warningCount} |`,
  `| **Subpath Exports** | ${report.stats.subpaths} subpaths |`,
  '',
];

if (report.warnings.length > 0) {
  mdSections.push('## ⚠️ Hygiene Warnings');
  report.warnings.forEach((w) => mdSections.push(`- ${w}`));
  mdSections.push('');
}

if (report.violations.length > 0) {
  mdSections.push('## ❌ Architectural Violations');
  mdSections.push('| Type | File | Issue | Documentation |');
  mdSections.push('| :--- | :--- | :--- | :--- |');
  report.violations.forEach((v) => {
    const docLink = v.ref !== 'N/A' ? `[Guide](${v.ref})` : 'N/A';
    mdSections.push(`| **${v.type}** | \`${v.file}\` | ${v.message} | ${docLink} |`);
  });
  mdSections.push('');
} else {
  mdSections.push('## ✅ Architecture Compliance');
  mdSections.push(
    'No architectural violations detected. Codebase reflects 2026 Sovereign Standards.',
  );
  mdSections.push('');
}

const finalMarkdown = mdSections.join('\n');

// Write Report
const reportDir = path.join(ROOT_DIR, 'reports');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
const cleanPkgName = String(pkgName || 'unknown').replace('@repo/', '').replace('@app/', '').replace(/[^\w-]/g, '_');
const reportFileName = `audit-${cleanPkgName}-architecture.md`;
const reportPath = path.join(reportDir, reportFileName);
fs.writeFileSync(reportPath, finalMarkdown, 'utf-8');

// Final Console Output
if (report.stats.violationCount > 0) {
  console.log(
    `\n\x1b[31m>>> Audit Failed: ${report.stats.violationCount} violations found.\x1b[0m`,
  );
} else {
  console.log('\n\x1b[32m>>> Audit Passed: Architecture is pristine.\x1b[0m');
}
console.log(`>>> Report generated: \x1b[33m${reportPath}\x1b[0m\n`);

// Output structured data if requested
if (isJson) {
  console.log('---BEGIN_JSON_REPORT---');
  console.log(JSON.stringify(report, null, 2));
  console.log('---END_JSON_REPORT---');
} else {
  // Output Markdown to stdout for the MCP service to capture
  console.log('---BEGIN_MARKDOWN_REPORT---');
  console.log(finalMarkdown);
  console.log('---END_MARKDOWN_REPORT---');
}
