const fs = require('node:fs');
const path = require('node:path');

function repairFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Fix broken object assignments: const obj: Type => { ... } -> const obj: Type = { ... }
  const objectRegex =
    /(\bconst\s+[a-zA-Z0-9_]+:\s*[a-zA-Z0-9_|[\]<> ,]+)\s*=>\s*(?=\n|\s*async|\s*[a-zA-Z0-9_]+\()/g;
  content = content.replace(objectRegex, (_match, g1) => {
    changed = true;
    return `${g1} = {`;
  });

  // 2. Fix broken functional components: const Comp = (props) => ( => const Comp = (props) => (
  // Handle the case where the regex added an extra => (
  const arrowRegex = /=>\s*=>\s*\(/g;
  if (arrowRegex.test(content)) {
    content = content.replace(arrowRegex, '=> (');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'generated') {
        walk(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      repairFile(fullPath);
    }
  });
}

['packages/admin', 'apps/gurudevi-mobile', 'packages/core'].forEach((dir) => {
  if (fs.existsSync(dir)) walk(dir);
});
