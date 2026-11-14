import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const CORE_SRC = path.join(ROOT_DIR, 'packages/core/src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(full.replace(/\\/g, '/'));
    }
  }
  return results;
}

const allCoreFiles = walk(CORE_SRC);

// Group by immediate top-level folder
const folderMap = new Map();

for (const filePath of allCoreFiles) {
  const rel = path.relative(CORE_SRC, filePath).replace(/\\/g, '/');
  const parts = rel.split('/');
  const topFolder = parts[0];
  const subFolder = parts.length > 2 ? `${parts[0]}/${parts[1]}` : parts[0];

  if (!folderMap.has(topFolder)) {
    folderMap.set(topFolder, {
      name: topFolder,
      files: [],
      subFolders: new Set(),
      loc: 0,
      hooks: [],
      stores: [],
      types: [],
      schemas: [],
      adapters: [],
      components: [],
      importsReact: 0,
      importsZustand: 0,
      importsEffect: 0,
    });
  }

  const fMeta = folderMap.get(topFolder);
  if (parts.length > 2) fMeta.subFolders.add(parts[1]);

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');
  fMeta.loc += lines.length;

  const baseName = path.basename(filePath);
  const isHook = baseName.startsWith('use') && (baseName.endsWith('.ts') || baseName.endsWith('.tsx'));
  const isStore = (baseName.includes('Store') || raw.includes('create<') || raw.includes('create(')) && !baseName.endsWith('.test.ts');
  const hasReact = raw.includes("from 'react'") || raw.includes('from "react"');
  const hasZustand = raw.includes("from 'zustand'") || raw.includes('from "zustand"');
  const hasEffect = raw.includes("from 'effect'") || raw.includes('from "effect"');
  const hasZod = raw.includes("from 'zod'") || raw.includes('from "zod"');

  if (isHook) fMeta.hooks.push(rel);
  if (isStore) fMeta.stores.push(rel);
  if (hasReact) fMeta.importsReact++;
  if (hasZustand) fMeta.importsZustand++;
  if (hasEffect) fMeta.importsEffect++;

  fMeta.files.push({
    relPath: rel,
    loc: lines.length,
    isHook,
    isStore,
  });
}

// Format analysis into sorted array
const folderAudit = Array.from(folderMap.values()).map(f => {
  let primaryRole = 'Domain Logic';
  let smellNotes = [];

  if (f.stores.length > 0 && f.importsZustand > 0) {
    primaryRole = 'State Management (Zustand Stores)';
  } else if (f.hooks.length > 0 && f.importsReact > 0) {
    primaryRole = 'React Hooks & Orchestration';
  } else if (f.name === 'types') {
    primaryRole = 'Type Contracts & Interfaces';
  } else if (f.name === 'adapters') {
    primaryRole = 'Infrastructure Adapters (Hexagonal)';
  } else if (f.name === 'api') {
    primaryRole = 'API Transports & Clients';
  } else if (f.name === 'flows') {
    primaryRole = 'End-to-End User Journey Flows';
  } else if (f.name === 'native') {
    primaryRole = 'Platform/Native Bindings';
  }

  // Detect overlaps & smells
  if (f.name === 'native' && f.files.some(fi => fi.relPath.includes('guestScope.ts'))) {
    smellNotes.push('Contains platform-agnostic session shims (guestScope.ts) with 0 native deps');
  }
  if (f.name === 'lib' && folderMap.has('utils')) {
    smellNotes.push('Redundant utility sprawl: lib/ and utils/ and shared/ have overlapping roles');
  }
  if (f.hooks.length > 0 && f.name !== 'hooks' && f.name !== 'store') {
    smellNotes.push(`Scattered hooks: ${f.hooks.length} hooks located outside hooks/ and store/`);
  }
  if (f.importsReact > 0 && (f.name === 'logic' || f.name === 'lib')) {
    smellNotes.push(`Framework leak: React imported inside ${f.name}/ (${f.importsReact} files)`);
  }

  return {
    folder: f.name,
    fileCount: f.files.length,
    loc: f.loc,
    hookCount: f.hooks.length,
    storeCount: f.stores.length,
    reactFiles: f.importsReact,
    zustandFiles: f.importsZustand,
    effectFiles: f.importsEffect,
    subFolderCount: f.subFolders.size,
    subFolders: Array.from(f.subFolders),
    primaryRole,
    smells: smellNotes,
  };
});

folderAudit.sort((a, b) => b.fileCount - a.fileCount);

console.log('=================================================================');
console.log(`PACKAGES/CORE/SRC FOLDER ONTOLOGY AUDIT (${allCoreFiles.length} Total Files)`);
console.log('=================================================================');

for (const fa of folderAudit) {
  console.log(`\n📁 ${fa.folder}/ (${fa.fileCount} files, ${fa.loc} LOC)`);
  console.log(`   Role: ${fa.primaryRole}`);
  console.log(`   Primitives: ${fa.hookCount} Hooks, ${fa.storeCount} Stores, ${fa.reactFiles} React, ${fa.zustandFiles} Zustand, ${fa.effectFiles} Effect`);
  if (fa.smells.length > 0) {
    fa.smells.forEach(s => console.log(`   ⚠️ SMELL: ${s}`));
  }
}

// Save detailed report
fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/folder-ontology-audit.json'),
  JSON.stringify(folderAudit, null, 2)
);
console.log('\nSaved full folder ontology audit to reports/folder-ontology-audit.json');
