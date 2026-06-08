import fs from 'node:fs';
import path from 'node:path';

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');
const TARGET_PACKAGES = fs
  .readdirSync(PACKAGES_DIR)
  .filter((dir) => fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory())
  .map((dir) => {
    const pkgJsonPath = path.join(PACKAGES_DIR, dir, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) return null;
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    return {
      name: pkgJson.name,
      dir: path.join('packages', dir, 'src'),
      ignore: ['index.ts', 'index.tsx'],
    };
  })
  .filter((pkg) => pkg && fs.existsSync(path.resolve(process.cwd(), pkg.dir)));

let hasErrors = false;

function checkPackage(pkg) {
  console.log(`Checking ${pkg.name} for internal barrel imports...`);
  const files = getFiles(pkg.dir);

  files.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    if (pkg.ignore.some((ignored) => file.endsWith(ignored))) return;

    const content = fs.readFileSync(file, 'utf8');
    const importRegex = new RegExp(`(?:import|export).*from ['"]${pkg.name}['"]`, 'g');

    if (importRegex.test(content)) {
      console.error(`❌ Error: File ${relativePath} imports from its own barrel ${pkg.name}`);
      console.error(
        `   Internal files should use relative imports to avoid circular dependencies.`,
      );
      hasErrors = true;
    }
  });
}

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat?.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

TARGET_PACKAGES.forEach(checkPackage);

if (hasErrors) {
  process.exit(1);
} else {
  console.log('✅ No internal barrel imports found.');
}
