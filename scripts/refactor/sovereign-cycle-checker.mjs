import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import madge from 'madge';

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const ROOT_DIR = path.resolve(__dirname, '../../');
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages');

/**
 * Sovereign Proactive Sentinel
 *
 * An advanced architectural auditor designed to catch "Metro-style" runtime failures
 * before they happen.
 */

async function runSentinel() {
  console.log(chalk.bold.magenta('\n🛡️  Sovereign Proactive Sentinel: Architectural Guardrails\n'));

  const packages = fs.readdirSync(PACKAGES_DIR).filter((dir) => {
    return (
      fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory() &&
      fs.existsSync(path.join(PACKAGES_DIR, dir, 'package.json'))
    );
  });

  let totalErrors = 0;
  const totalWarnings = 0;

  for (const pkgDir of packages) {
    const pkgPath = path.join(PACKAGES_DIR, pkgDir);
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
    const pkgName = pkgJson.name;
    const srcDir = path.join(pkgPath, 'src');

    if (!fs.existsSync(srcDir)) continue;

    console.log(chalk.cyan(`📦 Package: ${chalk.bold(pkgName)}`));

    // --- 1. Deep Cycle Detection (Value vs Type sensitivity) ---
    const madgeConfig = {
      tsConfig: path.join(pkgPath, 'tsconfig.json'),
      fileExtensions: ['ts', 'tsx'],
      baseDir: pkgPath,
      alias: { '@': path.join(pkgPath, 'src') },
      detectiveOptions: {
        ts: { skipTypeImports: true }, // Value-only cycles are the "Metro Killers"
      },
    };

    try {
      const res = await madge(srcDir, madgeConfig);
      const circular = res.circular();

      if (circular.length > 0) {
        console.error(
          chalk.red(
            `  ❌ RUNTIME RISK: Found ${circular.length} Value-level circular dependencies:`,
          ),
        );
        circular.forEach((cycle, i) => {
          console.error(chalk.red(`    [!] Cycle ${i + 1}: ${cycle.join(' -> ')}`));
          suggestFix('circular', cycle);
        });
        totalErrors += circular.length;
      }

      // --- 2. Advanced Boundary & Pollution Audit ---
      const files = getAllFiles(srcDir);
      files.forEach((file) => {
        const relativeFile = path.relative(pkgPath, file);
        if (
          file.endsWith('index.ts') ||
          file.endsWith('index.tsx') ||
          relativeFile.includes('__tests__') ||
          relativeFile.includes('.test.') ||
          relativeFile.includes('.spec.')
        )
          return;

        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, lineIdx) => {
          // Check 2A: Internal Barrel Import (Alias or Package Name)
          const internalNameRegex = new RegExp(
            `import .* from ['"](${pkgName}|@repo/${pkgDir})['"]`,
          );
          if (internalNameRegex.test(line)) {
            logViolation(
              'Boundary violation',
              relativeFile,
              lineIdx + 1,
              'Importing from own package barrel.',
            );
            suggestFix('barrel', relativeFile);
            totalErrors++;
          }

          // Check 2B: Native Pollution (Universal code importing from /native/)
          // Metro fails when Web code tries to load JSI/Native modules.
          if (
            relativeFile.includes('api') ||
            relativeFile.includes('logic') ||
            relativeFile.includes('lib')
          ) {
            if (line.includes('../native/') || line.includes('@repo/core/native')) {
              logViolation(
                'Native Pollution',
                relativeFile,
                lineIdx + 1,
                'Universal code importing from /native/ directory.',
              );
              suggestFix('pollution', relativeFile);
              totalErrors++;
            }
          }

          // Check 2C: Side-Effect Pollution
          if (line.trim().startsWith("import '") || line.trim().startsWith('import "')) {
            const forbiddenSideEffects = [
              'react-native-url-polyfill',
              'react-native-get-random-values',
            ];
            if (forbiddenSideEffects.some((se) => line.includes(se))) {
              logViolation(
                'Side-Effect Leak',
                relativeFile,
                lineIdx + 1,
                'Native-only side effect found in universal file.',
              );
              suggestFix('side-effect', relativeFile);
              totalErrors++;
            }
          }
        });
      });
    } catch (err) {
      console.error(chalk.red(`  💥 Analysis Error: ${err.message}`));
      totalErrors++;
    }
    console.log('');
  }

  summarize(totalErrors, totalWarnings);
}

function logViolation(type, file, line, msg) {
  console.error(chalk.yellow(`  ⚠️  ${chalk.bold(type)} at ${chalk.bold(file)}:${line}`));
  console.error(chalk.gray(`     ${msg}`));
}

function suggestFix(type, context) {
  console.log(chalk.blue('     💡 Proactive Fix:'));
  switch (type) {
    case 'circular':
      console.log(
        chalk.blue(
          `        Extract the shared members from '${context[0]}' and '${context[1]}' into a new leaf file (e.g. types.ts or constants.ts).`,
        ),
      );
      break;
    case 'barrel':
      console.log(
        chalk.blue(
          `        Replace the package-name import with a direct relative path to the source file.`,
        ),
      );
      break;
    case 'pollution':
      console.log(
        chalk.blue(
          `        Extract the required logic to 'src/api' or wrap it in a Sovereign Adapter/Manager (Port/Adapter pattern).`,
        ),
      );
      break;
    case 'side-effect':
      console.log(
        chalk.blue(
          `        Move this side-effect to the entry point (apps/gurudevi-mobile/index.ts) or a platform-specific bootstrap file.`,
        ),
      );
      break;
  }
}

function summarize(errors, warnings) {
  if (errors > 0) {
    console.log(chalk.bold.red(`\n🛑 Sentinel Audit failed with ${errors} critical violations.\n`));
    process.exit(1);
  } else {
    console.log(
      chalk.bold.green('\n✨ All architectural guardrails cleared. No runtime risks detected.\n'),
    );
  }
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

runSentinel();
