import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const targetPackage = process.argv[2];

if (!targetPackage) {
  console.error('Please specify a package path (e.g. packages/core).');
  process.exit(1);
}

const pkgBase = path.isAbsolute(targetPackage) ? targetPackage : path.join(ROOT_DIR, targetPackage);
const pkgJsonPath = path.join(pkgBase, 'package.json');

if (!fs.existsSync(pkgJsonPath)) {
  console.error(`Package.json not found at ${pkgJsonPath}`);
  process.exit(1);
}

console.log(`\x1b[36m>>> Shiny Auditing Package Architecture: ${targetPackage}\x1b[0m`);

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

// 1. Check Subpath Exports
console.log('\n--- Subpath Exports Check ---');
if (pkgJson.exports) {
  console.log('✅ Exports map found.');
  const subpaths = Object.keys(pkgJson.exports);
  console.log(`   Found ${subpaths.length} subpaths: ${subpaths.join(', ')}`);
} else {
  console.log('❌ No "exports" map found in package.json. Tree-shaking may be suboptimal.');
}

// 2. Logic Separation & Platform Agnosticism using ripgrep
console.log('\n--- Boundary Violation Check (Logic vs UI) ---');

const srcDir = path.join(pkgBase, 'src');
if (fs.existsSync(srcDir)) {
  // Helper to normalize paths for consistent reporting
  const normalize = (line) => line.replace(/\\/g, '/');

  // Improved Boundary Check Helper
  const runAuditRg = (pattern, globInclude, globExclude = []) => {
    try {
      const excludeFlags = globExclude.map((g) => `-g "!${g}"`).join(' ');
      // Anchor to the start of the relative path from srcDir
      const includeFlags = `-g "{${globInclude}}/**"`;
      const cmd = `rg "${pattern}" "." ${includeFlags} ${excludeFlags} -g "**.ts" -g "**.tsx" --with-filename --no-heading --line-number`;
      const output = execSync(cmd, { cwd: srcDir, encoding: 'utf-8' });
      return output.split('\n').filter((l) => l.trim());
    } catch (e) {
      return [];
    }
  };

  const isIgnored = (line) =>
    line.includes('@sovereign-ignore') || line.includes('architecture-ignore');

  let violationCount = 0;

  // 2a. Logic -> UI leaks
  const uiMatches = runAuditRg(
    'from.*\\b(components|screens|ui)\\b',
    'logic,services,utils,lib,api,hooks,store',
    ['adapters/**'],
  );
  uiMatches.forEach((line) => {
    // Filter out false positives in JS
    if (
      line.includes('.slice') ||
      line.includes('.store') ||
      line.includes('uiStore') ||
      line.includes('ui.slice')
    ) {
      return;
    }
    if (isIgnored(line)) return;

    violationCount++;
    console.log(`❌ [LOGIC -> UI] ${normalize(line)}`);
  });

  // 2b. Native pollution
  const nativePattern =
    'from.*\\b(react-native|expo-\\w+|@react-native-\\w+|@react-native-community\\/\\w+)\\b';
  const nativeMatches = runAuditRg(nativePattern, 'logic,services,utils,lib,api,hooks', [
    'adapters/**',
    'native/**',
  ]);
  nativeMatches.forEach((line) => {
    // Explicitly filter out legitimate native holders that might have matched the logic pattern
    // e.g. a hook specifically for native that is in a native subfolder
    const normalizedLine = normalize(line);
    if (normalizedLine.includes('/native/') || normalizedLine.includes('/adapters/')) {
      return;
    }
    if (isIgnored(line)) return;

    violationCount++;
    console.log(`❌ [NATIVE POLLUTION] ${normalizedLine}`);
  });

  if (violationCount === 0) {
    console.log('✅ No boundary violations detected.');
  }

  // 3. UUID Consistency Check (Utility)
  console.log('\n--- UUID Version Consistency ---');
  try {
    const v4Match = execSync(`rg "uuid.*v4" "${srcDir}" -l`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean).length;
    const v7Match = execSync(`rg "uuid.*v7" "${srcDir}" -l`, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean).length;
    if (v4Match > 0 && v7Match > 0) {
      console.log(
        `⚠️  Mixed UUID versions detected: v4 (${v4Match} files) and v7 (${v7Match} files). Consider standardizing on v7.`,
      );
    } else if (v7Match > 0) {
      console.log('✅ Standardized on UUID v7.');
    } else if (v4Match > 0) {
      console.log('⚠️  Using legacy UUID v4. Consider upgrading to v7 for sortability.');
    }
  } catch (e) {
    /* No UUIDs */
  }
} else {
  console.log('⚠️  src/ folder not found.');
}

console.log('\n--- Tree-Shaking Hygiene ---');
try {
  const indices = execSync(`rg -g "**/index.ts" --files "${srcDir}"`, { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);
  indices.forEach((idxPath) => {
    const fullPath = path.isAbsolute(idxPath) ? idxPath : path.join(srcDir, idxPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const wildcardMatch = content.match(/^export\s+\*\s+from/m);
    const relPath = path.relative(pkgBase, fullPath);
    if (wildcardMatch) {
      console.log(`⚠️  Wildcard exports in ${relPath}. Consider named exports.`);
    } else {
      console.log(`✅ Named exports in ${relPath}.`);
    }
  });
} catch (e) {
  console.log('⚠️  Could not check tree-shaking hygiene.');
}
