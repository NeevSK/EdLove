import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

const args = process.argv.slice(2);
const isUnwrap = args.includes('--unwrap');

// Find all package.json files in the monorepo
function getPackageJsonPaths() {
  const paths = [join(ROOT_DIR, 'package.json')];
  
  const scanDirs = ['apps', 'packages'];
  for (const dirName of scanDirs) {
    const fullDir = join(ROOT_DIR, dirName);
    try {
      const children = readdirSync(fullDir);
      for (const child of children) {
        const childPath = join(fullDir, child);
        if (statSync(childPath).isDirectory()) {
          const pkgJson = join(childPath, 'package.json');
          try {
            if (statSync(pkgJson).isFile()) {
              paths.push(pkgJson);
            }
          } catch {}
        }
      }
    } catch {}
  }
  return paths;
}

// Check if a script should be skipped (e.g., installer hooks, shell commands, or the wrapper itself)
function shouldSkipScript(name, command) {
  const skipNames = ['preinstall', 'postinstall', 'prepare', 'run:report', 'biome:audit', 'wrap:reports', 'unwrap:reports'];
  if (skipNames.includes(name)) return true;
  if (command.includes('run-and-report.ps1') || command.includes('sovereign-audit.mjs') || command.includes('audit-wrapper.ps1')) return true;
  return false;
}

function processPackages() {
  const pkgPaths = getPackageJsonPaths();
  console.log(`🔍 Found ${pkgPaths.length} package.json files.`);

  for (const pkgPath of pkgPaths) {
    const pkgName = relative(ROOT_DIR, pkgPath) || 'root';
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

    if (isUnwrap) {
      // UNWRAP MODE
      if (pkg._originalScripts) {
        pkg.scripts = { ...pkg._originalScripts };
        delete pkg._originalScripts;
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log(`✅ Unwrapped all scripts in ${pkgName}`);
      } else {
        console.log(`ℹ️ No wrapped scripts found in ${pkgName}, skipping.`);
      }
    } else {
      // WRAP MODE
      if (!pkg.scripts) continue;
      
      const original = pkg._originalScripts || { ...pkg.scripts };
      const wrapped = {};
      let wrapCount = 0;

      // Determine relative path to the scripts directory
      const pkgDir = dirname(pkgPath);
      const relativeToRoot = relative(pkgDir, ROOT_DIR);
      const scriptPath = relativeToRoot 
        ? join(relativeToRoot, 'scripts', 'run-and-report.mjs').replace(/\\/g, '/')
        : './scripts/run-and-report.mjs';
      const cleanCwd = relativeToRoot ? relativeToRoot.replace(/\\/g, '/') : '.';

      for (const [name, command] of Object.entries(original)) {
        if (shouldSkipScript(name, command)) {
          wrapped[name] = command; // keep as is
        } else {
          // Wrap the command using node run-and-report.mjs
          const escapedCommand = command.replace(/"/g, '\\"');
          const cleanName = `${pkgName.replace('/package.json', '').replace('\\package.json', '')}-${name}`.replace(/[^a-zA-Z0-9_\-]/g, '_');
          wrapped[name] = `node ${scriptPath} --cmd "${escapedCommand}" --name "${cleanName}"`;
          wrapCount++;
        }
      }

      if (wrapCount > 0) {
        pkg._originalScripts = original;
        pkg.scripts = wrapped;
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log(`✅ Wrapped ${wrapCount} scripts in ${pkgName}`);
      } else {
        console.log(`ℹ️ No eligible scripts to wrap in ${pkgName}.`);
      }
    }
  }
}

processPackages();
