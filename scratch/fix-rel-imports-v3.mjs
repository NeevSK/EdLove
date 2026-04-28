import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_SRC = path.resolve(__dirname, '../packages/core/src');

function getAllFiles(dirPath, arrayOfFiles = []) {
  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(CORE_SRC).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

const relocationMap = [
  {
    old: /from\s+['"].*?\/permissions\/schemas\/role\.schema['"]/g,
    newBase: 'logic/schemas/role.schema',
  },
  {
    old: /from\s+['"].*?\/permissions\/schemas\/user\.schema['"]/g,
    newBase: 'logic/schemas/user.schema',
  },
  { old: /from\s+['"].*?\/api\/schemas\/(.*?)['"]/g, newBase: 'logic/schemas/$1' },
  { old: /from\s+['"].*?\/lib\/workspace\/(.*?)['"]/g, newBase: 'logic/workspace/$1' },
  { old: /from\s+['"].*?\/lib\/supabase['"]/g, newBase: 'native/supabase' },
  { old: /from\s+['"].*?\/api\/auth['"]/g, newBase: 'native/auth' },
  { old: /from\s+['"].*?\/api\/identity['"]/g, newBase: 'native/identity' },
  { old: /from\s+['"].*?\/api\/types['"]/g, newBase: 'types/API' },
  { old: /from\s+['"].*?\/lib\/guestDataSync['"]/g, newBase: 'native/guestDataSync' },
  { old: /from\s+['"].*?\/lib\/guestDataManager['"]/g, newBase: 'native/guestDataManager' },
  { old: /from\s+['"].*?\/lib\/flows\/FlowResolver['"]/g, newBase: 'native/flows/FlowResolver' },
];

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  relocationMap.forEach((r) => {
    content = content.replace(r.old, (match, captured) => {
      let dest = r.newBase;
      if (captured) dest = dest.replace('$1', captured);

      // Remove extension if present in import
      dest = dest.replace(/\.ts$/, '').replace(/\.tsx$/, '');

      const absoluteDest = path.resolve(CORE_SRC, dest);
      let rel = path.relative(path.dirname(filePath), absoluteDest).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;

      changed = true;
      return `from '${rel}'`;
    });
  });

  if (changed) {
    console.log(`Updated imports in ${path.relative(CORE_SRC, filePath)}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
