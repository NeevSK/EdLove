import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const targetDir = path.join(ROOT, 'packages/admin/src');

function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules') walk(fullPath);
    } else if (/\.tsx?$/.test(file.name)) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Replace const { ... } = useStore() with atomic selectors
  const hooks = ['useStore', 'useTemporalStore', 'useUIStore', 'useFeatureStore', 'useAuthStore'];

  hooks.forEach((hook) => {
    const regex = new RegExp(`const\\s+{\\s*([^}]+)\\s*}\\s*=\\s*${hook}\\(\\);`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, (_match, props) => {
        const propList = props
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);
        // Handle potential renaming like { user: currentUser }
        const replacements = propList.map((p) => {
          if (p.includes(':')) {
            const [orig, alias] = p.split(':').map((x) => x.trim());
            return `const ${alias} = ${hook}(s => s.${orig});`;
          }
          return `const ${p} = ${hook}(s => s.${p});`;
        });
        return replacements.join('\n  ');
      });
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Healed subscriptions: ${path.relative(ROOT, filePath)}`);
  }
}

walk(targetDir);
