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
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);

  const newContent = content.replace(/from\s+['"]@\/(.*?)['"]/g, (_match, importPath) => {
    const absoluteImportPath = path.resolve(CORE_SRC, importPath);
    let relativePath = path.relative(dir, absoluteImportPath).replace(/\\/g, '/');

    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }

    return `from '${relativePath}'`;
  });

  if (content !== newContent) {
    console.log(`Updated ${path.relative(CORE_SRC, filePath)}`);
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
});
