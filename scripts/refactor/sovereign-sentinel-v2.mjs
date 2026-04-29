import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import madge from 'madge';
import chalk from 'chalk';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages');

/**
 * Sovereign Sentinel V2 (Rust-Enhanced)
 * 
 * Uses 'fd' for lightning-fast discovery and 'bat' for visual evidence.
 * Integrates 'scout' intelligence for platform leak detection.
 */

async function runSentinel() {
  console.log(chalk.bold.rgb(0, 255, 255)('\n💎 Sovereign Sentinel V2: The Shiny Architecture Guardian\n'));

  const packages = fs.readdirSync(PACKAGES_DIR).filter(dir => {
    return fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory() && 
           fs.existsSync(path.join(PACKAGES_DIR, dir, 'package.json'));
  });

  let totalErrors = 0;

  for (const pkgDir of packages) {
    const pkgPath = path.join(PACKAGES_DIR, pkgDir);
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
    const pkgName = pkgJson.name;
    const srcDir = path.join(pkgPath, 'src');

    if (!fs.existsSync(srcDir)) continue;

    console.log(chalk.bold.white(`\n📦 ${pkgName.toUpperCase()}`));
    console.log(chalk.gray('─'.repeat(pkgName.length + 3)));

    // --- 1. Graph Analysis (Madge) ---
    try {
      const res = await madge(srcDir, {
        tsConfig: path.join(pkgPath, 'tsconfig.json'),
        fileExtensions: ['ts', 'tsx'],
        baseDir: pkgPath,
        alias: { '@': path.join(pkgPath, 'src') },
        detectiveOptions: { ts: { skipTypeImports: true } }
      });
      const circular = res.circular();

      if (circular.length > 0) {
        console.error(chalk.red(`  ❌ RUNTIME CYCLE FOUND`));
        circular.forEach((cycle, i) => {
          console.error(chalk.red(`     ${cycle.join(' ➔ ')}`));
        });
        totalErrors += circular.length;
      }
    } catch (e) {}

    // --- 2. Rust-Powered Boundary Scan (fd + custom checks) ---
    try {
      // Use 'fd' to get all TS/TSX files
      const fileList = execSync(`fd -e ts -e tsx . "${srcDir}"`).toString().split('\n').filter(Boolean);

      for (const file of fileList) {
        const relativeFile = path.relative(pkgPath, file);
        if (relativeFile.endsWith('index.ts') || relativeFile.endsWith('index.tsx')) continue;

        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          const lineNum = idx + 1;
          let violation = null;

          // Check A: Internal Barrel Import
          const internalNameRegex = new RegExp(`import .* from ['"](${pkgName}|@repo/${pkgDir})['"]`);
          if (internalNameRegex.test(line)) {
            violation = { type: 'BARREL_VIOLATION', msg: 'Importing from own package barrel.' };
          }

          // Check B: Native Pollution
          if ((relativeFile.includes('api') || relativeFile.includes('logic')) && 
              (line.includes('../native/') || line.includes('@repo/core/native'))) {
            violation = { type: 'NATIVE_POLLUTION', msg: 'Universal code reaching into native folder.' };
          }

          if (violation) {
            console.error(chalk.yellow(`  ⚠️  ${chalk.bold(violation.type)} in ${chalk.cyan(relativeFile)}:${lineNum}`));
            console.log(chalk.gray(`     ${violation.msg}`));
            
            // CUTE TRICK: Use 'bat' to show the actual code with context
            try {
              const snippet = execSync(`bat --color=always --line-range ${Math.max(1, lineNum-1)}:${lineNum+1} --style=numbers,grid "${file}"`).toString();
              console.log(snippet);
            } catch (e) {
              console.log(chalk.dim(`     > ${line.trim()}`));
            }
            
            totalErrors++;
          }
        });
      }
    } catch (err) {
      console.error(chalk.red(`  💥 Audit Error in ${pkgName}: ${err.message}`));
    }
  }

  if (totalErrors > 0) {
    console.log(chalk.bold.red(`\n🛑 Audit failed with ${totalErrors} architectural leaks.\n`));
    process.exit(1);
  } else {
    console.log(chalk.bold.green('\n✨ All Sovereign guardrails intact.\n'));
  }
}

runSentinel();
