import { execSync } from 'node:child_process';

const symbol = process.argv[2];
if (!symbol) {
  console.error('Usage: node simulate-impact.mjs <symbol>');
  process.exit(1);
}

function runGrep(sym) {
  try {
    return execSync(`git grep -n "${sym}" -- ":(exclude)node_modules" ":(exclude)dist"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (_e) {
    return '';
  }
}

console.log(`# Sovereign Impact Simulation: "${symbol}"`);

const grepOutput = runGrep(symbol);
const lines = grepOutput.split('\n').filter(Boolean);

if (lines.length === 0) {
  console.log(
    `\n✅ **Zero Impact Detected.** The symbol "${symbol}" is not used in the scanned codebase.`,
  );
  process.exit(0);
}

const consumers = {};
const affectedPackages = new Set();

lines.forEach((line) => {
  const parts = line.split(':');
  const file = parts[0];
  const lineNo = parts[1];
  const content = parts.slice(2).join(':').trim();

  // Definition vs Usage heuristic
  if (
    content.includes(`export const ${symbol}`) ||
    content.includes(`export function ${symbol}`) ||
    content.includes(`interface ${symbol}`)
  ) {
    return; // Skip the definition
  }

  // Identify package
  const pkgMatch = file.match(/(?:^|\.|[\\/])(packages|apps)[\\/]([^\\/]+)/);
  const pkg = pkgMatch ? pkgMatch[2] : 'root';
  affectedPackages.add(pkg);

  if (!consumers[pkg]) consumers[pkg] = [];
  consumers[pkg].push({ file, lineNo, content });
});

const totalUsages = Object.values(consumers).flat().length;

// Risk Calculation
let risk = 'LOW';
if (totalUsages > 10) risk = 'MODERATE';
if (totalUsages > 30) risk = 'HIGH';
if (affectedPackages.size > 3) risk = 'SYSTEMIC (EXTREME)';

console.log(`\n## ☢️ Blast Radius: ${risk}`);
console.log(`- **Total References Found**: ${totalUsages}`);
console.log(`- **Affected Domains**: ${affectedPackages.size}`);

console.log('\n### 📈 Impacted Domains');
Object.entries(consumers).forEach(([pkg, usages]) => {
  console.log(`- **${pkg}**: ${usages.length} references`);
});

// Mermaid Visualization
console.log('\n```mermaid');
console.log('graph LR');
console.log(`  Source["💎 ${symbol}"]:::source`);
console.log('  classDef source fill:#f3e5f5,stroke:#4a148c,stroke-width:4px;');
console.log('  classDef consumer fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;');

affectedPackages.forEach((pkg) => {
  console.log(`  Source --> ${pkg.replace(/[^a-zA-Z0-9]/g, '_')}["📦 ${pkg}"]:::consumer`);
});
console.log('```');

console.log('\n## 🔮 Strategic Remediation Scenarios');
if (totalUsages > 30 || affectedPackages.size > 3) {
  console.log('### Scenario A: Tactical Patch (❌ DISCOURAGED)');
  console.log(`- **Action**: Direct modification of "${symbol}".`);
  console.log(
    `- **Risk**: High probability of breaking ${affectedPackages.size} domains. Requires massive regression testing.`,
  );

  console.log('\n### Scenario B: Sovereign Refactor (✅ RECOMMENDED)');
  console.log(
    `- **Action**: Create a versioned or scoped alias for the change, or move to a shared bridge package.`,
  );
  console.log('- **Benefit**: Zero ripple effect. Allows incremental migration of consumers.');
} else {
  console.log(
    `- **Action**: Direct modification is safe but verify the ${totalUsages} references listed above.`,
  );
}

console.log('\n## 🧐 Senior Dev Advice');
if (totalUsages > 30 || affectedPackages.size > 3) {
  console.log(
    '- ⚠️ **SYSTEMIC CHANGE DETECTED.** This symbol is a "Project Pillar." Any change here will ripple across the entire platform. Full CI/CD validation and visual regression are mandatory.',
  );
} else {
  console.log('- ✅ **LOCALIZED IMPACT.** Change is safe to proceed with standard unit testing.');
}
