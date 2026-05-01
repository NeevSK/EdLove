import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const TARGET_PKG = 'packages/ui';
const SRC_ROOT = path.join(TARGET_PKG, 'src');
const SHOULD_HEAL = process.argv.includes('--heal');

const masterMap = new Map();

function parseExports(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const baseDir = path.dirname(filePath);

  const namedFromRegex = /export\s+\{\s*([\s\S]+?)\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = namedFromRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    const source = match[2];
    const absSource = path.resolve(baseDir, source);
    for (const name of names) { masterMap.set(name, absSource); }
  }

  const localNamedRegex = /export\s+\{\s*([\s\S]+?)\s*\}\s*(?!from)/g;
  while ((match = localNamedRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    for (const name of names) { if (!masterMap.has(name)) masterMap.set(name, filePath); }
  }

  const declRegex = /export\s+(?:const|function|interface|type|enum|class)\s+([a-zA-Z0-9_$]+)/g;
  while ((match = declRegex.exec(content)) !== null) {
    const name = match[1];
    if (name && !masterMap.has(name)) masterMap.set(name, filePath);
  }

  const starRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = starRegex.exec(content)) !== null) {
    const source = match[1];
    let absSource = path.resolve(baseDir, source);
    let target = absSource;
    if (fs.existsSync(absSource) && fs.statSync(absSource).isDirectory()) {
      target = path.join(absSource, 'index.ts');
      if (!fs.existsSync(target)) target = path.join(absSource, 'index.tsx');
    } else {
      if (fs.existsSync(target + '.ts')) target += '.ts';
      else if (fs.existsSync(target + '.tsx')) target += '.tsx';
    }
    if (fs.existsSync(target)) parseExports(target);
  }
}

console.log('🔍 Building symbol map...');
parseExports(path.join(SRC_ROOT, 'gluestack', 'index.tsx'));
parseExports(path.join(SRC_ROOT, 'primitives.ts'));
parseExports(path.join(SRC_ROOT, 'components', 'index.ts'));

console.log(`📦 Mapped ${masterMap.size} symbols.`);

const globPath = SRC_ROOT.replace(/\\/g, '/') + '/**/*.{ts,tsx}';
const files = globSync(globPath);
console.log(`📂 Scanning ${files.length} files...`);

let totalFixes = 0;

const BARREL_PATHS = [
  '../gluestack', '../../gluestack', '../../../gluestack',
  '../primitives', '../../primitives', '../../../primitives',
  '../components', '../../components', '../../../components',
  '../index', '../../index', '../../../index',
  '@repo/ui/gluestack', '@repo/ui/primitives', '@repo/ui/components'
];

for (const file of files) {
  const absFile = path.resolve(file);
  if (path.basename(absFile).includes('index') || absFile.includes('primitives.ts')) continue;

  let content = fs.readFileSync(absFile, 'utf-8');
  let modified = false;
  let fileFixes = [];

  for (const barrelPath of BARREL_PATHS) {
    const escaped = barrelPath.replace(/\./g, '\\.').replace(/\//g, '\\/');
    const regex = new RegExp(`import\\s+\\{([\\s\\S]+?)\\}\\s+from\\s+['"]${escaped}['"]`, 'g');
    
    content = content.replace(regex, (match, importClause) => {
      const imports = importClause.split(',').map(i => i.trim()).filter(Boolean);
      const movedImports = new Map();
      const keptImports = [];

      for (const item of imports) {
        const [originalName] = item.split(/\s+as\s+/);
        if (masterMap.has(originalName)) {
          const absTarget = masterMap.get(originalName);
          const currentDir = path.dirname(absFile);
          if (absTarget === absFile) { keptImports.push(item); continue; }

          let relPath = path.relative(currentDir, absTarget).replace(/\\/g, '/');
          relPath = relPath.replace(/\.tsx?$/, '');
          if (!relPath.startsWith('.')) relPath = './' + relPath;

          if (!movedImports.has(relPath)) movedImports.set(relPath, []);
          movedImports.get(relPath).push(item);
        } else {
          keptImports.push(item);
        }
      }

      if (movedImports.size > 0) {
        modified = true;
        let replacement = '';
        if (keptImports.length > 0) replacement += `import { ${keptImports.join(', ')} } from '${barrelPath}';\n`;
        for (const [source, items] of movedImports) {
          replacement += `import { ${items.join(', ')} } from '${source}';\n`;
          fileFixes.push(`${items.join(', ')} -> '${source}'`);
        }
        return replacement.trim();
      }
      return match;
    });
  }

  if (modified) {
    totalFixes++;
    if (SHOULD_HEAL) {
      fs.writeFileSync(absFile, content);
      console.log(`✅ Healed: ${path.relative(SRC_ROOT, absFile)}`);
    } else {
      console.log(`🔍 Violation in ${path.relative(SRC_ROOT, absFile)}:`);
      fileFixes.forEach(f => console.log(`   ${f}`));
    }
  }
}

console.log(`\n🏁 Done. Total violations: ${totalFixes}`);
