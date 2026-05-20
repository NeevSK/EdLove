import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

while (!fs.existsSync(pkgJsonPath) && pkgBase !== ROOT_DIR && pkgBase !== path.dirname(pkgBase)) {
  pkgBase = path.dirname(pkgBase);
  pkgJsonPath = path.join(pkgBase, 'package.json');
}

if (!fs.existsSync(pkgJsonPath)) {
  console.error(`Package.json not found at ${pkgJsonPath}`);
  process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const pkgName = pkgJson.name || path.basename(pkgBase);
const srcDir = path.join(pkgBase, 'src');

const report = {
  title: `🏛️ sovereign_audit:architecture - ${pkgName}`,
  packageName: pkgName,
  timestamp: new Date().toISOString(),
  target: targetPackage,
  violations: [],
  warnings: [],
  stats: { subpaths: 0, violationCount: 0, warningCount: 0 },
};

const addViolation = (type, file, message, ref = 'N/A') => {
  report.violations.push({ type, file, message, ref });
  report.stats.violationCount++;
};

const addWarning = (message) => {
  report.warnings.push(message);
  report.stats.warningCount++;
};

console.error(`>>> Shiny Auditing: ${pkgName} [${targetPackage}]`);

if (pkgJson.exports) {
  report.stats.subpaths = Object.keys(pkgJson.exports).length;
} else {
  addWarning('No "exports" map found in package.json.');
}

if (fs.existsSync(srcDir)) {
  // SHINY OPTIMIZATION: Run one big rg pass for multiple patterns
  // We'll use --json to parse results efficiently
  const patterns = [
    {
      id: 'LOGIC -> UI',
      regex: 'import.*from.*\\b(@repo/ui|components|screens|ui)\\b',
      glob: '{logic,services,utils,lib,api,hooks,store}/**',
    },
    {
      id: 'NATIVE POLLUTION',
      regex:
        'from.*\\b(react-native|expo-\\w+|@react-native-\\w+|@react-native-community\\/\\w+)\\b',
      glob: '{logic,services,utils,lib,api,hooks}/**',
    },
    {
      id: 'LEGACY UI',
      regex:
        'from.*\\b(react-native|@gluestack-ui/themed)\\b.*\\b(View|Text|Pressable|ScrollView|FlatList|TextInput|Button)\\b',
      glob: '{components,screens,context,features}/**',
    },
    {
      id: 'MEM SINK',
      regex: '\\b(onPress|onRefresh|onSearch|onAction|onSelect)=\\{[^\\}]*=>',
      glob: '{components,screens,features}/**',
    },
    {
      id: 'HOOK VIOLATION',
      regex: '\\buseLayoutEffect\\(',
      glob: '{components,screens,features}/**',
    },
  ];

  for (const p of patterns) {
    try {
      const cmd = `rg --pcre2 "${p.regex}" "." -g "${p.glob}" -g "**.ts" -g "**.tsx" --with-filename --no-heading --line-number`;
      const output = execSync(cmd, { cwd: srcDir, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      output
        .split('\n')
        .filter(Boolean)
        .forEach((line) => {
          const [file, ln, ...msgParts] = line.split(':');
          if (line.includes('@sovereign-ignore')) return;
          addViolation(p.id, file, msgParts.join(':').trim());
        });
    } catch (e) {}
  }

  // State Density Check (Fast)
  try {
    const output = execSync(`rg "useState" "." --count --with-filename`, {
      cwd: srcDir,
      encoding: 'utf-8',
    });
    output
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        const [file, count] = line.split(':');
        if (parseInt(count) > 3) {
          // Slightly relaxed
          addViolation('STATE DENSITY', file, `Has ${count} useState hooks. Max recommended is 3.`);
        }
      });
  } catch (e) {}
}

// Generate Output
const violationsList = report.violations
  .map(
    (v) =>
      `- **${v.type}** in [${v.file}](file:///${path.join(srcDir, v.file).replace(/\\/g, '/')}) : ${v.message}`,
  )
  .join('\n');

const finalMarkdown = `# ${report.title}\n\n## Summary\n- Total Violations: ${report.stats.violationCount}\n- Subpaths: ${report.stats.subpaths}\n\n## Detailed Violations\n${violationsList}`;

if (isJson) {
  process.stdout.write(
    '---BEGIN_JSON_REPORT---\n' + JSON.stringify(report, null, 2) + '\n---END_JSON_REPORT---\n',
  );
} else {
  process.stdout.write(
    '---BEGIN_MARKDOWN_REPORT---\n' + finalMarkdown + '\n---END_MARKDOWN_REPORT---\n',
  );
}
