import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PACKAGE_DIRS = ['packages', 'apps'];

function runCommand(cmd, args = []) {
  try {
    const fullCmd = `${cmd} ${args.join(' ')}`;
    return execSync(fullCmd, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (e) {
    return '';
  }
}

function getPackages() {
  const packages = [];
  for (const dir of PACKAGE_DIRS) {
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;

    const items = fs.readdirSync(fullDir);
    for (const item of items) {
      const pkgPath = path.join(fullDir, item, 'package.json');
      if (fs.existsSync(pkgPath)) {
        packages.push({
          name: item,
          path: path.join(dir, item),
          fullPath: path.join(fullDir, item),
        });
      }
    }
  }
  return packages;
}

function analyzePackage(pkg) {
  const todoCount = (runCommand('rg', ['-c', '"TODO|FIXME"', pkg.fullPath]).match(/\d+/g) || []).reduce((a, b) => a + parseInt(b), 0);
  
  // Get LOC and file count using tokei if available, fallback to simple find
  let sloc = 0;
  try {
    const tokeiOutput = JSON.parse(runCommand('tokei', ['--output', 'json', pkg.fullPath]));
    sloc = tokeiOutput.Total?.code || 0;
  } catch (e) {
    sloc = (runCommand('wc', ['-l', `$(find ${pkg.fullPath} -name "*.ts" -o -name "*.tsx")`]).match(/\d+/g) || [0])[0];
  }

  // Calculate a "Debt Score"
  // Score = (TODOs * 5) + (SLOC / 100)
  const score = (todoCount * 10) + (sloc / 50);

  return {
    name: pkg.name,
    path: pkg.path,
    todoCount,
    sloc,
    score: Math.round(score),
  };
}

const packages = getPackages();
const analyses = packages.map(analyzePackage).sort((a, b) => b.score - a.score);

console.log('# Sovereign Debt Lens');
console.log('Visualizing Technical Debt and Cognitive Load across the monorepo.');

console.log('\n## ☢️ Debt Heatmap (Top 15 Most Tiresome Packages)');
console.log('| Package | Debt Score | TODOs | SLOC | Risk Level |');
console.log('| :--- | :--- | :--- | :--- | :--- |');

analyses.slice(0, 15).forEach(a => {
  let risk = '🟢 LOW';
  if (a.score > 100) risk = '🟡 MEDIUM';
  if (a.score > 300) risk = '🟠 HIGH';
  if (a.score > 500) risk = '🔴 CRITICAL';
  
  console.log(`| \`${a.path}\` | **${a.score}** | ${a.todoCount} | ${Math.round(a.sloc)} | ${risk} |`);
});

console.log('\n## 🧐 Lens Interpretation');
console.log('- **Debt Score**: A weighted metric combining TODO/FIXME density and raw code volume.');
console.log('- **Risk Level**: Indicates how likely the package is to harbor "Silent Failures" or high maintenance cost.');

console.log('\n## 🛡️ Recommended Actions');
console.log('1. **🔴 CRITICAL**: Immediate refactor or "Healing" required. High risk of architectural drift.');
console.log('2. **🟠 HIGH**: Plan a "Sovereign Sprint" to resolve TODOs and reduce SLOC density.');
console.log('3. **🟡 MEDIUM**: Routine maintenance should focus on cleanup before adding new features.');
