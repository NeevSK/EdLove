import fs from 'node:fs';
import path from 'node:path';
import madge from 'madge';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages');

async function checkExternalCycles() {
  console.log('🔍 Checking for external circular dependencies between packages...');

  // Get all packages
  const packages = fs.readdirSync(PACKAGES_DIR).filter((dir) => {
    return (
      fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory() &&
      fs.existsSync(path.join(PACKAGES_DIR, dir, 'package.json'))
    );
  });

  const aliases = {};
  packages.forEach((pkgDir) => {
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(PACKAGES_DIR, pkgDir, 'package.json'), 'utf8'),
    );
    aliases[pkgJson.name] = path.join(PACKAGES_DIR, pkgDir, 'src');
  });

  const config = {
    fileExtensions: ['ts', 'tsx'],
    baseDir: ROOT_DIR,
    alias: aliases,
    excludeRegExp: [/node_modules/, /dist/],
    detectiveOptions: {
      ts: { skipTypeImports: true },
    },
  };

  try {
    const srcDirs = packages
      .map((pkg) => `packages/${pkg}/src`)
      .filter((dir) => fs.existsSync(path.join(ROOT_DIR, dir)));
    const res = await madge(srcDirs, config);
    const circular = res.circular();

    if (circular.length > 0) {
      console.log(`❌ Found ${circular.length} circular dependencies across the workspace:`);
      circular.forEach((cycle, i) => {
        console.log(`[!] Cycle ${i + 1}: ${cycle.join(' -> ')}`);
      });
    } else {
      console.log('✅ No cross-package circular dependencies found.');
    }
  } catch (err) {
    console.error('💥 Error checking global cycles:', err);
  }
}

checkExternalCycles();
