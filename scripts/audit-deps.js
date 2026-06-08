const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const APPS_DIR = path.join(ROOT_DIR, 'apps');

function getPackageJsons(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .map((subdir) => path.join(dir, subdir, 'package.json'))
    .filter((p) => fs.existsSync(p));
}

const allPackageJsons = [...getPackageJsons(PACKAGES_DIR), ...getPackageJsons(APPS_DIR)].filter(
  (p) => {
    // Exclude web related apps as requested
    const isWeb = p.includes('-web') || p.includes('Web');
    return !isWeb;
  },
);

const dependencyMap = {};

allPackageJsons.forEach((pkgPath) => {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const pkgName = pkg.name || pkgPath;

    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    Object.entries(deps).forEach(([depName, version]) => {
      if (!dependencyMap[depName]) {
        dependencyMap[depName] = [];
      }
      dependencyMap[depName].push({
        consumer: pkgName,
        version: version,
        path: path.relative(ROOT_DIR, pkgPath),
      });
    });
  } catch (e) {
    console.error(`Error reading ${pkgPath}: ${e.message}`);
  }
});

console.log('# Dependency Duplication Report\n');

const duplicates = Object.entries(dependencyMap).filter(
  ([_name, consumers]) => consumers.length > 1,
);

let foundIssues = false;

duplicates
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([name, consumers]) => {
    const versions = new Set(consumers.map((c) => c.version));

    if (versions.size > 1) {
      foundIssues = true;
      console.log(`## \u26A0\uFE0F VERSION MISMATCH: ${name}`);
      consumers.forEach((c) => {
        console.log(`- **${c.version}** in \`${c.consumer}\` (${c.path})`);
      });
      console.log('');
    } else if (consumers.length > 3) {
      // High frequency - maybe a candidate for a shared config or @repo/core?
      console.log(`## \u2139\uFE0F HIGH FREQUENCY: ${name}`);
      console.log(`Used by ${consumers.length} packages at version **${[...versions][0]}**`);
      console.log('');
    }
  });

if (!foundIssues) {
  console.log('No critical version mismatches found in non-web components.');
}
