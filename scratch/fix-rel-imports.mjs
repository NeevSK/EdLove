import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_SRC = path.resolve(__dirname, '../packages/core/src');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(CORE_SRC).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix relocated imports
  // lib/supabase -> native/supabase
  // api/auth -> native/auth
  // api/identity -> native/identity

  // Example: import ... from '../lib/supabase' -> '../native/supabase'
  // But wait, if the file IS in native, it should be './supabase'

  const replacements = [
    {
      from: /from\s+['"].*?\/lib\/supabase['"]/g,
      to: (match) => {
        const absoluteSupabase = path.resolve(CORE_SRC, 'native/supabase');
        let rel = path.relative(path.dirname(filePath), absoluteSupabase).replace(/\\/g, '/');
        if (!rel.startsWith('.')) rel = './' + rel;
        return `from '${rel}'`;
      },
    },
    {
      from: /from\s+['"].*?\/api\/auth['"]/g,
      to: (match) => {
        const absolute = path.resolve(CORE_SRC, 'native/auth');
        let rel = path.relative(path.dirname(filePath), absolute).replace(/\\/g, '/');
        if (!rel.startsWith('.')) rel = './' + rel;
        return `from '${rel}'`;
      },
    },
    {
      from: /from\s+['"].*?\/api\/identity['"]/g,
      to: (match) => {
        const absolute = path.resolve(CORE_SRC, 'native/identity');
        let rel = path.relative(path.dirname(filePath), absolute).replace(/\\/g, '/');
        if (!rel.startsWith('.')) rel = './' + rel;
        return `from '${rel}'`;
      },
    },
  ];

  replacements.forEach((r) => {
    const newContent = content.replace(r.from, r.to);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  if (changed) {
    console.log(`Updated imports in ${path.relative(CORE_SRC, filePath)}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
