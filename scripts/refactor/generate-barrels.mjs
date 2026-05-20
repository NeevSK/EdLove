#!/usr/bin/env node
/**
 * Auto-generate barrel files (index.ts) for package screens
 *
 * Usage: node scripts/refactor/generate-barrels.mjs [package-name]
 * Example: node scripts/refactor/generate-barrels.mjs classroom
 *
 * If no package name provided, processes all packages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const repoRoot = process.cwd();
const packagesDir = path.join(repoRoot, 'packages');

// Packages that need barrel generation
const TARGET_PACKAGES = [
  'classroom',
  'admin',
  'profile',
  'library',
  'core',
  'ui',
  'community',
  'self',
  'form-builder',
];

/**
 * Generate barrel file for a screens directory
 */
function generateScreensBarrel(packagePath) {
  const screensDir = path.join(packagePath, 'src', 'screens');

  if (!fs.existsSync(screensDir)) {
    console.log(`  ℹ️  No screens directory found`);
    return false;
  }

  // Find all .tsx files (excluding .web.tsx variants for now to avoid duplicates in default exports)
  const files = globSync('*.tsx', { cwd: screensDir })
    .filter((f) => !f.endsWith('.d.ts'))
    .sort();

  if (files.length === 0) {
    console.log(`  ℹ️  No screen files found`);
    return false;
  }

  // Generate imports and exports
  const imports = [];
  const exports = [];
  const processedBaseNames = new Set();

  for (const file of files) {
    const baseName = path.basename(file, '.tsx');
    const isWeb = baseName.endsWith('.web');
    const cleanName = isWeb ? baseName.slice(0, -4) : baseName;

    // Skip if we've already processed this base name (prefer web version for export naming)
    if (processedBaseNames.has(cleanName)) {
      continue;
    }
    processedBaseNames.add(cleanName);

    // Determine import style based on naming convention
    if (
      baseName.includes('Screen') ||
      baseName.includes('Dashboard') ||
      baseName.includes('View') ||
      baseName.includes('Panel')
    ) {
      // Named exports for screens
      const importName = cleanName;
      const exportName = cleanName;

      if (file.startsWith(`${cleanName}.web`)) {
        imports.push(`import ${importName}Web from './${cleanName}.web';`);
        exports.push(`${exportName}Web`);
      } else if (files.some((f) => f === `${cleanName}.web.tsx`)) {
      } else {
        imports.push(`import ${importName} from './${cleanName}';`);
        exports.push(exportName);
      }
    } else {
      // Default exports for other components
      const importName = cleanName;
      const exportName = cleanName;

      if (file.startsWith(`${cleanName}.web`)) {
        imports.push(`import ${importName}Web from './${cleanName}.web';`);
        exports.push(`${exportName}Web`);
      } else if (files.some((f) => f === `${cleanName}.web.tsx`)) {
      } else {
        imports.push(`import ${importName} from './${cleanName}';`);
        exports.push(exportName);
      }
    }
  }

  // Generate the barrel content
  const barrelContent = `${imports.join('\n')}

export {
${exports.map((e) => `    ${e},`).join('\n')}
};
`;

  const barrelPath = path.join(screensDir, 'index.ts');
  fs.writeFileSync(barrelPath, barrelContent, 'utf8');
  console.log(`  ✅ Generated ${path.relative(repoRoot, barrelPath)} (${exports.length} exports)`);
  return true;
}

/**
 * Process a single package
 */
function processPackage(packageName) {
  const packagePath = path.join(packagesDir, packageName);

  if (!fs.existsSync(packagePath)) {
    console.error(`❌ Package not found: ${packageName}`);
    return false;
  }

  console.log(`\n📦 Processing @repo/${packageName}`);
  return generateScreensBarrel(packagePath);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const targetPackage = args[0];

  console.log('🛢️  Auto-generating barrel files...\n');

  if (targetPackage) {
    // Process single package
    processPackage(targetPackage);
  } else {
    // Process all target packages
    let successCount = 0;
    for (const pkg of TARGET_PACKAGES) {
      if (processPackage(pkg)) {
        successCount++;
      }
    }
    console.log(`\n✅ Processed ${successCount} packages`);
  }

  console.log('\n🎉 Done! Run this script after adding new screens to auto-update barrels.');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
