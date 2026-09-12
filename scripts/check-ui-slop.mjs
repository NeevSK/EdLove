import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const sourceExtensions = new Set(['.tsx', '.ts', '.jsx', '.js', '.astro', '.css']);
const ignoredParts = new Set([
  'node_modules',
  '.git',
  '.next',
  '.astro',
  '.expo',
  '.turbo',
  '.vercel',
  '.cache',
  'android',
  'ios',
  'dist',
  'dist-debug',
  'build',
  'output',
  'coverage',
  'reports',
  'temp',
]);
const highConfidenceRules = [
  { name: 'generic-purple-ai-gradient', pattern: /linear-gradient\([^\n]*(#8b5cf6|violet)[^\n]*(#f59e0b|saffron)/i, message: 'purple-to-warm gradient is an AI-product default without visible semantic context' },
  { name: 'generic-bounce', pattern: /animate-bounce|animation:\s*[^;]*bounce/i, message: 'bouncing motion needs explicit interaction meaning' },
];
const reviewRules = [
  { name: 'black-shadow', pattern: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,|shadow-black\//i, message: 'black shadow/overlay bypasses semantic depth tokens' },
  { name: 'universal-glass', pattern: /backdrop-blur-(?:md|lg|xl|2xl)|backdrop-filter:\s*blur\(/i, message: 'glass/blur requires a material and layer rationale' },
  { name: 'oversized-rounding', pattern: /rounded-\[(?:32|40|48)px\]|border-radius:\s*(?:32|40|48)px/i, message: 'oversized rounding is a common generated-card signal' },
  { name: 'generic-entry-motion', pattern: /animate-in\s+fade-in|slide-in-from-(?:bottom|top)/i, message: 'entry motion needs a state or continuity rationale' },
  { name: 'equal-card-language', pattern: /rounded-(?:2xl|3xl).*border.*bg-(?:white|slate|phase)/i, message: 'repeated rounded bordered surfaces may fragment a continuous process' },
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredParts.has(entry.name) || entry.name.startsWith('dist-')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function changedFiles() {
  try {
    const output = execFileSync('git', ['diff', '--name-only', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.split(/\r?\n/).filter(Boolean).map((file) => path.join(root, file));
  } catch (error) {
    console.error('Unable to determine changed files for UI slop scan.', error);
    process.exitCode = 2;
    return [];
  }
}

const all = process.argv.includes('--all');
const reportOnly = process.argv.includes('--report-only');
const files = (all ? walk(path.join(root, 'apps')).concat(walk(path.join(root, 'packages'))) : changedFiles())
  .filter((file) => sourceExtensions.has(path.extname(file)) && fs.existsSync(file));

const findings = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of highConfidenceRules) {
      if (rule.pattern.test(line)) findings.push({ severity: 'BLOCK', rule: rule.name, message: rule.message, file: path.relative(root, file), line: index + 1 });
    }
    for (const rule of reviewRules) {
      if (rule.pattern.test(line)) findings.push({ severity: 'REVIEW', rule: rule.name, message: rule.message, file: path.relative(root, file), line: index + 1 });
    }
  });
}

console.log(`UI slop scan: ${files.length} source files, ${findings.length} findings`);
for (const finding of findings) console.log(`${finding.severity} ${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`);

if (!findings.length) console.log('No configured UI slop signals found. Human design review is still required.');
if (!reportOnly && findings.some((finding) => finding.severity === 'BLOCK')) process.exitCode = 1;
