import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const MANAGERS_DIR = path.join(ROOT_DIR, 'packages/core/src/logic/managers');

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'android',
  'ios',
  '.expo',
  'reports',
  'coverage',
]);

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allCoreFiles = walk(path.join(ROOT_DIR, 'packages/core/src'));
const allAppFiles = [
  ...walk(path.join(ROOT_DIR, 'apps/gurudevi-web')),
  ...walk(path.join(ROOT_DIR, 'apps/gurudevi-mobile')),
  ...walk(path.join(ROOT_DIR, 'apps/sanctuary-api/src')),
];

const managerEntries = fs.readdirSync(MANAGERS_DIR, { withFileTypes: true });
const auditResults = [];

for (const entry of managerEntries) {
  if (entry.isDirectory() || entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
  
  const filePath = path.join(MANAGERS_DIR, entry.name);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const loc = lines.length;
  
  const baseName = entry.name.replace(/\.ts$/, '');
  
  // Find callers
  const importRegex = new RegExp(`from\\s+['"][^'"]*${baseName}['"]|import\\s*\\(['"][^'"]*${baseName}['"]\\)`, 'g');
  
  const coreCallers = [];
  for (const f of allCoreFiles) {
    if (f === filePath || f.includes('__tests__') || f.includes('.test.')) continue;
    const text = fs.readFileSync(f, 'utf8');
    if (importRegex.test(text)) {
      coreCallers.push(path.relative(ROOT_DIR, f).replace(/\\/g, '/'));
    }
  }
  
  const appCallers = [];
  for (const f of allAppFiles) {
    if (f.includes('__tests__') || f.includes('.test.')) continue;
    const text = fs.readFileSync(f, 'utf8');
    if (importRegex.test(text)) {
      appCallers.push(path.relative(ROOT_DIR, f).replace(/\\/g, '/'));
    }
  }
  
  // Analyze contamination type
  const isFactory = entry.name.endsWith('.factory.ts');
  const isManager = entry.name.endsWith('Manager.ts');
  const hasConstructorRepo = /constructor\s*\([^)]*(?:repo|repository)/i.test(content);
  const passThroughMethods = (content.match(/return\s+this\.repo\.[a-zA-Z0-9_]+\(/g) || []).length;
  
  let classification = 'Clean Utility';
  let reason = '';
  
  if (isFactory) {
    if (appCallers.length === 0) {
      classification = 'DEADWEIGHT FACTORY';
      reason = 'Instantiates a global singleton that is never imported by any mobile or web application.';
    } else {
      classification = 'OOP FACTORY';
      reason = 'Manual DI factory instantiation in TypeScript module.';
    }
  } else if (hasConstructorRepo && passThroughMethods > 0 && appCallers.length === 0) {
    classification = 'USELESS PASS-THROUGH WRAPPER';
    reason = `Class with ${passThroughMethods} pass-through method(s) forwarding to this.repo with 0 application callers. Pure Spring Boot ceremony.`;
  } else if (isManager && appCallers.length === 0) {
    classification = 'ORPHANED OOP MANAGER';
    reason = 'Heavyweight OOP class with 0 application callers. UI apps bypassed it for reactive stores.';
  } else if (entry.name === 'StorageManager.ts') {
    classification = 'HEXAGONAL DISPATCHER';
    reason = 'Active platform abstraction layer multiplexing in-memory and native MMKV storage.';
  } else {
    classification = 'ACTIVE MANAGER';
    reason = `Active manager with ${appCallers.length} app callers.`;
  }
  
  auditResults.push({
    file: entry.name,
    loc,
    classification,
    reason,
    totalCallers: appCallers.length + coreCallers.length,
    appCallersCount: appCallers.length,
    coreCallersCount: coreCallers.length,
    appCallers,
    coreCallers,
    passThroughMethods,
  });
}

// Summary stats
const uselessPassThrough = auditResults.filter(r => r.classification === 'USELESS PASS-THROUGH WRAPPER').length;
const deadweightFactories = auditResults.filter(r => r.classification === 'DEADWEIGHT FACTORY').length;
const orphanedManagers = auditResults.filter(r => r.classification === 'ORPHANED OOP MANAGER').length;
const totalWithZeroAppCallers = auditResults.filter(r => r.appCallersCount === 0).length;

const report = {
  totalAnalyzed: auditResults.length,
  totalWithZeroAppCallers,
  uselessPassThrough,
  deadweightFactories,
  orphanedManagers,
  contaminationRate: Math.round((totalWithZeroAppCallers / auditResults.length) * 100),
  files: auditResults.sort((a, b) => b.loc - a.loc),
};

const outPath = path.join(ROOT_DIR, 'reports/java-contamination-audit.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

console.log('=== JAVA CONTAMINATION AUDIT COMPLETE ===');
console.log(`Analyzed: ${auditResults.length} files in packages/core/src/logic/managers`);
console.log(`Zero App Callers: ${totalWithZeroAppCallers} / ${auditResults.length} (${report.contaminationRate}%)`);
console.log(`Useless Pass-Through Wrappers: ${uselessPassThrough}`);
console.log(`Deadweight Factories: ${deadweightFactories}`);
console.log(`Orphaned OOP Managers: ${orphanedManagers}`);
console.log(`Report written to: ${outPath}`);
