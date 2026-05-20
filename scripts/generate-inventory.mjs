import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const target = process.argv[2] || '.';
const maxDepth = parseInt(process.argv[3] || '2', 10);
const format = process.argv[4] || 'smart'; // 'text', 'markdown', or 'smart'
const verbose = process.argv[5] !== 'false';

const IGNORE = [
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  '.next',
  '.expo',
  'build',
  'out',
  'coverage',
  '.gemini',
  '.nx',
  '.agents',
  'reports',
  'scratch',
  'patches',
  'tmp',
  '.vscode',
  '.idea',
];

function getTree(dir, depth = 0) {
  if (depth > maxDepth) return null;

  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) return null;

  const name = path.basename(dir);
  if (IGNORE.includes(name)) return null;

  let totalFiles = 0;
  let totalSize = 0;

  const children = fs
    .readdirSync(dir)
    .map((child) => {
      const childPath = path.join(dir, child);
      try {
        const childStats = fs.statSync(childPath);
        if (childStats.isDirectory()) {
          const subtree = getTree(childPath, depth + 1);
          if (subtree) {
            totalFiles += subtree.count || 0;
            totalSize += subtree.size || 0;
            return subtree;
          }
          return null;
        }
        totalFiles += 1;
        totalSize += childStats.size;
        return { name: child, type: 'file', size: childStats.size };
      } catch (_e) {
        return null;
      }
    })
    .filter(Boolean);

  return {
    name,
    type: 'directory',
    children,
    count: totalFiles,
    size: totalSize,
  };
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function renderText(node, prefix = '') {
  if (!node) return '';
  const meta = verbose ? ` (${node.count} files, ${formatSize(node.size)})` : '';
  let result = `${prefix}${node.name}/${meta}\n`;
  const children = node.children || [];
  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    const _newPrefix = prefix + (isLast ? '    ' : '│   ');
    if (child.type === 'directory') {
      result += renderText(child, prefix + marker);
    } else {
      result += `${prefix}${marker}${child.name}\n`;
    }
  });
  return result;
}

function renderMarkdown(node, depth = 0) {
  if (!node) return '';
  const meta = verbose ? ` *(${node.count} files, ${formatSize(node.size)})*` : '';
  let result = `${'  '.repeat(depth)}- **${node.name}/**${meta}\n`;
  if (node.children) {
    node.children.forEach((child) => {
      if (child.type === 'directory') {
        result += renderMarkdown(child, depth + 1);
      } else {
        result += `${'  '.repeat(depth + 1)}- ${child.name}\n`;
      }
    });
  }
  return result;
}

function renderSmart(node, depth = 0, isSub = false) {
  if (!node) return '';
  let result = '';
  const indent = '  '.repeat(depth);

  if (depth === 0 && !isSub) {
    const meta = verbose ? ` (${node.count} total files, ${formatSize(node.size)})` : '';
    result += `>>> Smart Inventory: ${node.name}${meta}\n`;
  }

  if (node.children) {
    const dirs = node.children.filter((c) => c.type === 'directory');
    const files = node.children.filter((c) => c.type === 'file');

    if (dirs.length > 0) {
      result += `${indent}Dirs: ${dirs.map((d) => `${d.name}/`).join(', ')}\n`;
      // Selective recursion for high-value folders
      if (depth < 2) {
        dirs.forEach((d) => {
          const val = [
            'src',
            'components',
            'logic',
            'services',
            'ui',
            'apps',
            'packages',
            'screens',
          ].includes(d.name.toLowerCase());
          if (val) {
            result += `${indent}  [${d.name}/ contents]:\n`;
            result += renderSmart(d, depth + 2, true);
          }
        });
      }
    }
    if (files.length > 0) {
      result += `${indent}Files: ${files.map((f) => f.name).join(', ')}\n`;
    }
  }
  return result;
}

function listPackages() {
  const pkgs = [];
  ['packages', 'apps'].forEach((group) => {
    const groupPath = path.join(ROOT_DIR, group);
    if (fs.existsSync(groupPath)) {
      fs.readdirSync(groupPath).forEach((name) => {
        const pkgJson = path.join(groupPath, name, 'package.json');
        if (fs.existsSync(pkgJson)) {
          const data = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
          pkgs.push({
            name: data.name,
            path: `${group}/${name}`,
            version: data.version,
          });
        }
      });
    }
  });
  return pkgs;
}

const targetPath = path.isAbsolute(target) ? target : path.join(ROOT_DIR, target);
if (!fs.existsSync(targetPath)) {
  console.error(`Target not found: ${targetPath}`);
  process.exit(1);
}

const tree = getTree(targetPath);

if (format === 'markdown') {
  const _packages = listPackages();
  console.log(`# Inventory: ${path.basename(targetPath)}`);
  console.log(`\n## Structure\n${renderMarkdown(tree)}`);
} else if (format === 'smart') {
  console.log(renderSmart(tree));
} else {
  console.log(renderText(tree));
}
