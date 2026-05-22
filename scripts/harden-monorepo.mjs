import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const STANDARD_SCRIPTS = {
  lint: 'pnpm run lint:biome && pnpm run lint:eslint',
  'lint:biome': 'biome check .',
  'lint:eslint': 'eslint .',
  format: 'biome format --write .',
  'check-cycles': 'node ../../scripts/refactor/sovereign-cycle-checker.mjs',
  'check-types': 'pnpm exec tsc --noEmit',
  test: 'vitest run',
  'test:watch': 'vitest',
  'test:ui': 'vitest --ui',
  clean: 'rm -rf .turbo node_modules dist',
};

const STANDARD_DEV_DEPS = {
  '@repo/eslint-config': 'workspace:^',
  '@repo/typescript-config': 'workspace:*',
  vitest: '^2.1.9',
  'vite-tsconfig-paths': '^6.1.1',
  typescript: '^5.9.3',
  eslint: '^9.38.0',
};

const VITEST_CONFIG_TEMPLATE = `import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
  },
});
`;

const ESLINT_CONFIG_TEMPLATE = `import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [...config];
`;

async function harden() {
  console.log('🚀 Hardening Monorepo Packaging & Tooling...');

  const packageDirs = ['packages', 'apps'];
  const allPackages = [];

  for (const dir of packageDirs) {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) continue;

    const subs = fs.readdirSync(fullDir);
    for (const sub of subs) {
      const pkgPath = path.join(fullDir, sub);
      if (fs.statSync(pkgPath).isDirectory() && fs.existsSync(path.join(pkgPath, 'package.json'))) {
        allPackages.push(pkgPath);
      }
    }
  }

  console.log(`Found ${allPackages.length} packages to harden.`);

  for (const pkgPath of allPackages) {
    const pkgJsonPath = path.join(pkgPath, 'package.json');
    const pkgName = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name;

    if (pkgName === '@repo/eslint-config' || pkgName === '@repo/typescript-config') {
      continue;
    }

    console.log(`\n📦 Processing ${pkgName}...`);

    // 1. Update package.json
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.scripts = { ...pkgJson.scripts, ...STANDARD_SCRIPTS };

    // Ensure devDependencies exist
    pkgJson.devDependencies = pkgJson.devDependencies || {};
    for (const [dep, version] of Object.entries(STANDARD_DEV_DEPS)) {
      if (!pkgJson.devDependencies[dep] && !pkgJson.dependencies?.[dep]) {
        pkgJson.devDependencies[dep] = version;
      }
    }

    fs.writeFileSync(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
    console.log(`  ✅ Updated package.json scripts & devDeps`);

    // 2. Ensure vitest.config.ts
    const vitestPath = path.join(pkgPath, 'vitest.config.ts');
    if (!fs.existsSync(vitestPath) && !fs.existsSync(path.join(pkgPath, 'vitest.config.js'))) {
      fs.writeFileSync(vitestPath, VITEST_CONFIG_TEMPLATE);
      console.log(`  ✅ Created vitest.config.ts`);
    }

    // 3. Ensure eslint.config.mjs
    const eslintPath = path.join(pkgPath, 'eslint.config.mjs');
    if (
      !fs.existsSync(eslintPath) &&
      !fs.existsSync(path.join(pkgPath, 'eslint.config.js')) &&
      !fs.existsSync(path.join(pkgPath, '.eslintrc.js')) &&
      !fs.existsSync(path.join(pkgPath, '.eslintrc.json'))
    ) {
      fs.writeFileSync(eslintPath, ESLINT_CONFIG_TEMPLATE);
      console.log(`  ✅ Created eslint.config.mjs`);
    }

    // 4. Fix tsconfig.json to extend base
    const tsconfigPath = path.join(pkgPath, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      let tsconfig = fs.readFileSync(tsconfigPath, 'utf8');
      if (!tsconfig.includes('typescript-config/base.json')) {
        // We don't want to blindly overwrite, but we can try to inject if it's simple
        // For now, let's just log it or do a simple replace if it has an "extends"
        if (tsconfig.includes('"extends":')) {
          tsconfig = tsconfig.replace(
            /"extends":\s*".*?"/,
            '"extends": "../../packages/typescript-config/base.json"',
          );
        } else {
          // Inject at the top
          tsconfig = tsconfig.replace(
            '{',
            '{\n  "extends": "../../packages/typescript-config/base.json",',
          );
        }
        fs.writeFileSync(tsconfigPath, tsconfig);
        console.log(`  ✅ Aligned tsconfig.json`);
      }
    }
  }

  console.log('\n✨ Hardening complete! Running pnpm install to sync...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
  } catch (_e) {
    console.error('❌ pnpm install failed, please run it manually.');
  }
}

harden().catch(console.error);
