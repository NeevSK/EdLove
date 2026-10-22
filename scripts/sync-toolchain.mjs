#!/usr/bin/env node

/**
 * Sovereign Toolchain Synchronizer
 * Single Source of Truth:
 *   - Node.js: .nvmrc & package.json (engines.node)
 *   - pnpm: package.json (packageManager)
 *   - TypeScript: package.json (devDependencies.typescript) & AGENTS.md Section 2
 *   - Bun: mise.toml ([tools].bun)
 *   - Turbo: package.json (devDependencies.turbo)
 *
 * Automatically synchronizes downstream files:
 *   mise.toml, .devcontainer/Dockerfile, .devcontainer/devcontainer.json,
 *   dagger.ts, scripts/setup-wsl-native.sh, scripts/check-shiny-tools.mjs,
 *   .github/ISSUE_TEMPLATE/security_advisory.yml.
 *
 * Usage:
 *   node scripts/sync-toolchain.mjs          # Synchronize and write updates
 *   node scripts/sync-toolchain.mjs --check  # Verify zero drift (exits 1 on drift)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const isCheckMode = process.argv.includes('--check');

// 1. Read Canonical Single Sources of Truth (SSoT)
const packageJsonRaw = readFileSync(resolve(root, 'package.json'), 'utf8');
const packageJson = JSON.parse(packageJsonRaw);
const nvmrcPath = resolve(root, '.nvmrc');
const expectedNode = existsSync(nvmrcPath) ? readFileSync(nvmrcPath, 'utf8').trim() : '22.23.2';
const nodeMajor = expectedNode.split('.')[0] || '22';

if (!packageJson.packageManager) {
  console.error('❌ FATAL: root package.json missing "packageManager" field.');
  process.exit(1);
}

const pnpmMatch = packageJson.packageManager.match(/^pnpm@(.+)$/);
if (!pnpmMatch) {
  console.error(`❌ FATAL: packageManager must follow pnpm@<version> format. Found: ${packageJson.packageManager}`);
  process.exit(1);
}
const expectedPnpm = pnpmMatch[1];

// TypeScript SSoT (Sacred Pin in AGENTS.md / root package.json / pnpm-workspace.yaml catalog)
let rawTs = packageJson.devDependencies?.typescript || '7.0.2';
if (rawTs === 'catalog:') {
  const wsYaml = readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf8');
  const catMatch = wsYaml.match(/typescript:\s*['"]?([^'"\r\n]+)['"]?/);
  rawTs = catMatch ? catMatch[1].trim() : '7.0.2';
}
const expectedTs = rawTs.replace(/^[\^~]/, '');

// Bun SSoT (mise.toml)
const misePath = resolve(root, 'mise.toml');
let expectedBun = '1.3.14';
if (existsSync(misePath)) {
  const miseContent = readFileSync(misePath, 'utf8');
  const bunMatch = miseContent.match(/bun\s*=\s*"([^"]+)"/);
  if (bunMatch) expectedBun = bunMatch[1];
}

// Turbo SSoT
const expectedTurbo = (packageJson.devDependencies?.turbo || '2.10.12').replace(/^[\^~]/, '');

// Rust SSoT (rust-toolchain.toml)
const rustPath = resolve(root, 'rust-toolchain.toml');
let expectedRust = '1.85.0';
if (existsSync(rustPath)) {
  const rustContent = readFileSync(rustPath, 'utf8');
  const rustMatch = rustContent.match(/channel\s*=\s*"([^"]+)"/);
  if (rustMatch) expectedRust = rustMatch[1];
}

const toolchain = {
  node: expectedNode,
  nodeMajor,
  pnpm: expectedPnpm,
  typescript: expectedTs,
  bun: expectedBun,
  turbo: expectedTurbo,
  rust: expectedRust,
};

console.log(
  `🔍 Sovereign Toolchain SSoT: Node ${toolchain.node} (v${toolchain.nodeMajor}) | ` +
  `pnpm@${toolchain.pnpm} | TS@${toolchain.typescript} | Bun@${toolchain.bun} | Turbo@${toolchain.turbo} | Rust@${toolchain.rust}`
);

let driftDetected = false;

function syncFile(filePath, transformFn, label) {
  const fullPath = resolve(root, filePath);
  if (!existsSync(fullPath)) {
    console.warn(`⚠️ Warning: ${filePath} does not exist, skipping.`);
    return;
  }

  const originalContent = readFileSync(fullPath, 'utf8');
  const updatedContent = transformFn(originalContent, toolchain);

  if (originalContent !== updatedContent) {
    driftDetected = true;
    if (isCheckMode) {
      console.error(`❌ Toolchain Drift in ${filePath} (${label})`);
    } else {
      writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`✅ Synchronized ${filePath} (${label})`);
    }
  } else if (!isCheckMode) {
    console.log(`✓ Up-to-date: ${filePath} (${label})`);
  }
}

// Target 1: mise.toml (Node, pnpm, Bun)
syncFile('mise.toml', (content, tools) => {
  return content
    .replace(/pnpm\s*=\s*"[^"]+"/g, `pnpm = "${tools.pnpm}"`)
    .replace(/node\s*=\s*"[^"]+"/g, `node = "${tools.node}"`)
    .replace(/bun\s*=\s*"[^"]+"/g, `bun = "${tools.bun}"`);
}, 'mise');

// Target 2: .devcontainer/Dockerfile (Node, pnpm, TypeScript)
syncFile('.devcontainer/Dockerfile', (content, tools) => {
  return content
    .replace(/ARG NODE_VERSION=\d+/g, `ARG NODE_VERSION=${tools.nodeMajor}`)
    .replace(/ARG PNPM_VERSION=[^\r\n]+/g, `ARG PNPM_VERSION=${tools.pnpm}`)
    .replace(/# Base image with Node\.js \d+, pnpm [^,]+,/g, `# Base image with Node.js ${tools.nodeMajor}, pnpm ${tools.pnpm},`)
    .replace(/typescript@[^\s\r\n\\]+/g, `typescript@${tools.typescript}`);
}, 'devcontainer dockerfile');

// Target 3: .devcontainer/devcontainer.json (Node, pnpm)
syncFile('.devcontainer/devcontainer.json', (content, tools) => {
  return content
    .replace(/"NODE_VERSION":\s*"[^"]+"/g, `"NODE_VERSION": "${tools.nodeMajor}"`)
    .replace(/"PNPM_VERSION":\s*"[^"]+"/g, `"PNPM_VERSION": "${tools.pnpm}"`);
}, 'devcontainer json');

// Target 4: dagger.ts (pnpm)
syncFile('dagger.ts', (content, tools) => {
  return content.replace(/pnpm@\d+(\.\d+)*/g, `pnpm@${tools.pnpm}`);
}, 'dagger pipeline');

// Target 5: scripts/setup-wsl-native.sh (Node, pnpm)
syncFile('scripts/setup-wsl-native.sh', (content, tools) => {
  return content
    .replace(/setup_\d+\.x/g, `setup_${tools.nodeMajor}.x`)
    .replace(/Installing Node\.js \d+ & PNPM/g, `Installing Node.js ${tools.nodeMajor} & PNPM`)
    .replace(/pnpm@\d+(\.\d+)*/g, `pnpm@${tools.pnpm}`);
}, 'wsl setup script');

// Target 6: scripts/check-shiny-tools.mjs (pnpm)
syncFile('scripts/check-shiny-tools.mjs', (content, tools) => {
  return content.replace(/pnpm@\d+(\.\d+)*/g, `pnpm@${tools.pnpm}`);
}, 'shiny tools audit');

// Target 7: .github/ISSUE_TEMPLATE/security_advisory.yml (pnpm)
syncFile('.github/ISSUE_TEMPLATE/security_advisory.yml', (content, tools) => {
  return content.replace(/- pnpm:\s*[^\r\n]+/g, `- pnpm: ${tools.pnpm}`);
}, 'issue template');

// Target 8: All GitHub Workflows (.github/workflows/*.yml) (Node matrix)
const workflowsDir = resolve(root, '.github/workflows');
if (existsSync(workflowsDir)) {
  const workflowFiles = readdirSync(workflowsDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  for (const wf of workflowFiles) {
    syncFile(`.github/workflows/${wf}`, (content, tools) => {
      return content
        .replace(/node-version:\s*\['\d+'\]/g, `node-version: ['${tools.nodeMajor}']`)
        .replace(/node-version:\s*"\d+"/g, `node-version: "${tools.nodeMajor}"`)
        .replace(/node-version:\s*\d+/g, `node-version: ${tools.nodeMajor}`);
    }, `workflow ${wf}`);
  }
}

if (isCheckMode) {
  if (driftDetected) {
    console.error('\n❌ Toolchain check failed: files have drifted from SSoT definitions.');
    console.error('👉 Run "pnpm run toolchain:sync" to automatically synchronize all targets.');
    process.exit(1);
  } else {
    console.log('\n✨ Zero toolchain drift detected across all monorepo environments.');
  }
} else {
  console.log('\n✨ Toolchain synchronization complete.');
}
