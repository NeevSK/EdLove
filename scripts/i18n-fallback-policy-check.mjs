import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const scanRoots = [path.join(projectRoot, 'apps'), path.join(projectRoot, 'packages')];

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const allowPathPattern = /(__tests__|\.test\.|\.spec\.|\/debug\/|\/dev\/|\/stories\/)/i;
const forbiddenPattern = /\bt\(\s*['"][^'"]+['"]\s*,\s*['"][\s\S]*?['"]/g;

const walk = async (dir) => {
  const files = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        ['node_modules', 'dist', 'build', 'coverage', '.expo', 'android', 'ios', 'docs'].includes(
          entry.name,
        )
      ) {
        continue;
      }
      files.push(...(await walk(full)));
      continue;
    }

    if (
      sourceExtensions.has(path.extname(entry.name)) &&
      full.includes(`${path.sep}src${path.sep}`)
    ) {
      files.push(full);
    }
  }

  return files;
};

const violations = [];
const files = (await Promise.all(scanRoots.map((root) => walk(root)))).flat();
for (const file of files) {
  if (allowPathPattern.test(file)) {
    continue;
  }

  const content = await readFile(file, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const match of content.matchAll(forbiddenPattern)) {
    const before = content.slice(0, match.index);
    const line = before.split(/\r?\n/).length;
    violations.push({
      file: path.relative(projectRoot, file),
      line,
      snippet: lines[line - 1]?.trim() || '',
    });
  }
}

if (violations.length > 0) {
  console.error(
    '❌ i18n fallback policy check failed. Do not use inline default text in t(key, defaultText).',
  );
  violations.slice(0, 80).forEach(({ file, line, snippet }) => {
    console.error(`- ${file}:${line}`);
    if (snippet) {
      console.error(`  ${snippet}`);
    }
  });
  if (violations.length > 80) {
    console.error(`...and ${violations.length - 80} more violation(s).`);
  }
  process.exit(1);
}

console.log('✅ i18n fallback policy check passed.');
