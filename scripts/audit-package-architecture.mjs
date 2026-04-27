import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const targetPackage = args.filter(a => !a.startsWith('--'))[0];

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
  console.error(`Package.json not found at ${pkgJsonPath} or any parent directory up to ${ROOT_DIR}`);
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
  }
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
  const normalize = (line) => (line ? line.replace(/\\/g, '/') : '');
  
  const runAuditRg = (pattern, globInclude, globExclude = []) => {
    try {
      const excludeFlags = globExclude.map((g) => `-g "!${g}"`).join(' ');
      const includeFlags = `-g "{${globInclude}}/**"`;
      const cmd = `rg "${pattern}" "." ${includeFlags} ${excludeFlags} -g "**.ts" -g "**.tsx" --with-filename --no-heading --line-number`;
      const output = execSync(cmd, { cwd: srcDir, encoding: 'utf-8' });
      return output.split('\n').filter((l) => l.trim());
    } catch (e) {
      return [];
    }
  };

  const isIgnored = (line) => line.includes('@sovereign-ignore') || line.includes('architecture-ignore');

  // 2a. Logic -> UI leaks
  const uiMatches = runAuditRg(
    'from.*\\b(@repo/ui|components|screens|ui)\\b',
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
  const nativePattern = 'from.*\\b(react-native|expo-\\w+|@react-native-\\w+|@react-native-community\\/\\w+)\\b';
  const nativeMatches = runAuditRg(nativePattern, 'logic,services,utils,lib,api,hooks', ['adapters/**', 'native/**']);
  nativeMatches.forEach((line) => {
    const normalizedLine = normalize(line);
    if (normalizedLine.includes('/native/') || normalizedLine.includes('/adapters/')) return;
    if (isIgnored(line)) return;
    
    const parts = normalizedLine.split(':');
    addViolation('NATIVE POLLUTION', parts[0], parts.slice(1).join(':').trim(), 'N/A');
  });

  // 3. UUID Consistency Check
  try {
    const v4Match = execSync(`rg "uuid.*v4" "${srcDir}" -l`, { encoding: 'utf-8' }).split('\n').filter(Boolean).length;
    const v7Match = execSync(`rg "uuid.*v7" "${srcDir}" -l`, { encoding: 'utf-8' }).split('\n').filter(Boolean).length;
    if (v4Match > 0 && v7Match > 0) {
      addWarning(`Mixed UUID versions detected: v4 (${v4Match} files) and v7 (${v7Match} files). Standardize on v7.`);
    } else if (v4Match > 0) {
      addWarning('Using legacy UUID v4. Consider upgrading to v7 for sortability.');
    }
  } catch (e) {}

  // 4. Zero-Legacy & State Management
  const legacyPrimitives = runAuditRg(
    'from.*\\b(react-native|@gluestack-ui/themed)\\b.*\\b(View|Text|Pressable|ScrollView|FlatList|TextInput|Button)\\b',
    'components,screens,context,features',
    ['components-legacy/**', 'gluestack-legacy/**', '**/index.ts', '**/index.tsx'],
  );
  legacyPrimitives.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation('LEGACY UI', parts[0], parts.slice(1).join(':').trim(), 'apps/gurudevi-mobile/docs/Core/ui-development-guide.md');
  });

  // 4b. State Density
  try {
    const stateCounts = execSync(`rg "useState" "${srcDir}" --count --with-filename`, { encoding: 'utf-8' }).split('\n').filter(Boolean);
    stateCounts.forEach((countLine) => {
      const lastColon = countLine.lastIndexOf(':');
      if (lastColon === -1) return;
      const file = countLine.substring(0, lastColon);
      const count = parseInt(countLine.substring(lastColon + 1).trim());
      if (count > 2) {
        const relFile = path.isAbsolute(file) ? path.relative(srcDir, file) : file;
        addViolation('STATE DENSITY', normalize(relFile), `Has ${count} useState hooks.`, 'packages/ui/docs/state-management-guide.md');
      }
    });
  } catch (e) {}

  // 4c. Store Selector Integrity
  const missingSelectors = runAuditRg('const.*=.*use.*Store\\(\\)', '.');
  missingSelectors.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation('SUBSCRIPTION', parts[0], 'Missing atomic selector.', 'N/A');
  });

  // 4d. Memory Sinkholes
  const anonymousSinks = runAuditRg('onPress=\\{[^}]*=>', '.');
  anonymousSinks.forEach((line) => {
    if (isIgnored(line)) return;
    const parts = normalize(line).split(':');
    addViolation('MEM SINK', parts[0], 'Inline anonymous function in JSX.', 'N/A');
  });

  // 5. Tree-Shaking Hygiene
  try {
    const indices = execSync(`rg -g "**/index.ts" -g "**/index.tsx" --files "${srcDir}"`, { encoding: 'utf-8' }).split('\n').filter(Boolean);
    indices.forEach((idxPath) => {
      const fullPath = path.isAbsolute(idxPath) ? idxPath : path.join(srcDir, idxPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.match(/^export\s+\*\s+from/m)) {
        addWarning(`Wildcard export in ${normalize(path.relative(pkgBase, fullPath))}`);
      }
    });
  } catch (e) {}
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
  report.warnings.forEach(w => mdSections.push(`- ${w}`));
  mdSections.push('');
}

if (report.violations.length > 0) {
  mdSections.push('## ❌ Architectural Violations');
  mdSections.push('| Type | File | Issue | Documentation |');
  mdSections.push('| :--- | :--- | :--- | :--- |');
  report.violations.forEach(v => {
    const docLink = v.ref !== 'N/A' ? `[Guide](${v.ref})` : 'N/A';
    mdSections.push(`| **${v.type}** | \`${v.file}\` | ${v.message} | ${docLink} |`);
  });
  mdSections.push('');
} else {
  mdSections.push('## ✅ Architecture Compliance');
  mdSections.push('No architectural violations detected. Codebase reflects 2026 Sovereign Standards.');
  mdSections.push('');
}

const finalMarkdown = mdSections.join('\n');

// Write Report
const reportDir = path.join(ROOT_DIR, 'reports');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
const reportFileName = `audit-${pkgName.replace('@repo/', '').replace('@app/', '')}-architecture.md`;
const reportPath = path.join(reportDir, reportFileName);
fs.writeFileSync(reportPath, finalMarkdown, 'utf-8');

// Final Console Output
if (report.stats.violationCount > 0) {
  console.log(`\n\x1b[31m>>> Audit Failed: ${report.stats.violationCount} violations found.\x1b[0m`);
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

