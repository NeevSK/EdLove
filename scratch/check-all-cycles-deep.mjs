import fs from 'node:fs';
import path from 'node:path';
import madge from 'madge';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages');

async function checkAllCycles() {
  console.log('🔍 Checking for ALL circular dependencies (including types)...');

  const packages = fs.readdirSync(PACKAGES_DIR).filter((dir) => {
    return (
      fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory() &&
      fs.existsSync(path.join(PACKAGES_DIR, dir, 'package.json'))
    );
  });

  for (const pkgDir of packages) {
    const pkgPath = path.join(PACKAGES_DIR, pkgDir);
    const srcDir = path.join(pkgPath, 'src');
    if (!fs.existsSync(srcDir)) continue;

    console.log(`📦 Checking ${pkgDir}...`);

    const config = {
      tsConfig: path.join(pkgPath, 'tsconfig.json'),
      fileExtensions: ['ts', 'tsx'],
      baseDir: pkgPath,
      alias: { '@': srcDir },
      detectiveOptions: {
        ts: { skipTypeImports: false }, // Catch EVERYTHING
      },
    };

    try {
      const res = await madge(srcDir, config);
      const circular = res.circular();

      if (circular.length > 0) {
        console.log(`❌ Found ${circular.length} cycles in ${pkgDir}:`);
        circular.forEach((cycle, i) => {
          console.log(`[!] Cycle ${i + 1}: ${cycle.join(' -> ')}`);
        });
      }
    } catch (_err) {
      // console.error(`💥 Error checking ${pkgDir}:`, err.message);
    }
  }
}

checkAllCycles();
