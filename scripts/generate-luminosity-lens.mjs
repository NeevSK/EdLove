import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = process.argv[2] || 'packages/ui';

function runGrep(pattern) {
  try {
    return execSync(`git grep -n "${pattern}" -- "${TARGET_DIR}"`, {
      encoding: 'utf-8',
    });
  } catch (_e) {
    return '';
  }
}

console.log(`# Sovereign Luminosity Lens: ${TARGET_DIR}`);
console.log(`Auditing UI components for Skia/Phase system alignment.\n`);

const skiaUsage = runGrep('<Canvas');
const lines = skiaUsage.split('\n').filter(Boolean);

const results = [];
const componentsSeen = new Set();

lines.forEach((line) => {
  const [file, _lineNumber] = line.split(':');
  if (componentsSeen.has(file)) return;
  componentsSeen.add(file);

  const content = fs.readFileSync(file, 'utf-8');

  const hasPhaseProp =
    content.includes('phase:') || content.includes('phase =') || content.includes('PHASE_');
  const hasHardcodedColors =
    (content.match(/color=["']#(?:[0-9a-fA-F]{3}){1,2}["']/g) || []).length > 0;
  const hasRgba = (content.match(/rgba\(/g) || []).length > 0;

  let status = '✅ ALIGNED';
  let score = 100;
  const issues = [];

  if (!hasPhaseProp) {
    status = '⚠️ DIM';
    score -= 40;
    issues.push('Missing phase-aware logic (hardcoded luminosity).');
  }

  if (hasHardcodedColors || hasRgba) {
    // Only a warning if it doesn't also have phase logic
    if (!hasPhaseProp) {
      status = '❌ DULL';
      score -= 30;
      issues.push('Hardcoded colors detected inside Skia canvas.');
    }
  }

  results.push({ file, status, score, issues });
});

// Sort by lowest score
results.sort((a, b) => a.score - b.score);

console.log('| Component | Status | Score | Issues |');
console.log('| :--- | :--- | :--- | :--- |');

results.forEach((res) => {
  const relPath = path.relative(process.cwd(), res.file);
  console.log(`| ${relPath} | ${res.status} | ${res.score} | ${res.issues.join(', ') || 'None'} |`);
});

console.log('\n## 🧐 Lens Interpretation');
console.log('- **✅ ALIGNED**: Component correctly responds to time/phase transitions.');
console.log('- **⚠️ DIM**: Skia component with static lighting.');
console.log('- **❌ DULL**: Hardcoded colors violate the "Living Surface" principle.');

console.log('\n## 🛡️ Sovereign Rule');
console.log(
  'UI components in the Gurudevi ecosystem must be "Luminous" (Phase-Aware) to maintain the Sanctuary aesthetic.',
);
