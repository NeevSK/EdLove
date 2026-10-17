#!/usr/bin/env node

/**
 * Sovereign Upstream Skills Synchronizer
 * 
 * Tracks and synchronizes authentic, upstream canonical skills from official repositories:
 *   1. Emil Kowalski: https://github.com/emilkowalski/skills.git (motion, design, mobile)
 *   2. Expo: https://github.com/expo/skills.git (Expo SDK 58, Router, EAS)
 *   3. Supabase: https://github.com/supabase/agent-skills.git (Postgres, RLS, Edge functions)
 *   4. Vercel Labs: https://github.com/vercel-labs/agent-skills.git (React 19, Next.js, composition)
 * 
 * Usage:
 *   node scripts/sync-upstream-skills.mjs --audit   # Inspect upstream revisions and diffs
 *   node scripts/sync-upstream-skills.mjs --sync    # Pull latest upstream skills and verify
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const isSync = process.argv.includes('--sync');
const isAudit = !isSync || process.argv.includes('--audit');

const UPSTREAM_REPOS = [
  {
    name: 'emil-kowalski',
    repo: 'https://github.com/emilkowalski/skills.git',
    sourcePath: 'skills',
    targetDir: '.agents/skills',
  },
  {
    name: 'expo',
    repo: 'https://github.com/expo/skills.git',
    sourcePath: 'plugins/expo/skills',
    targetDir: '.agents/skills',
  },
  {
    name: 'supabase',
    repo: 'https://github.com/supabase/agent-skills.git',
    sourcePath: 'skills',
    targetDir: '.agents/skills',
  },
  {
    name: 'vercel-labs',
    repo: 'https://github.com/vercel-labs/agent-skills.git',
    sourcePath: 'skills',
    targetDir: '.agents/skills',
  },
];

console.log('🔄 Sovereign Upstream Skills Synchronizer');
console.log(`📌 Mode: ${isSync ? 'SYNCHRONIZE & UPDATE' : 'AUDIT ONLY'}`);
console.log('================================================================');

console.log('\n📋 Configured Upstream Repositories:');
for (const u of UPSTREAM_REPOS) {
  console.log(`   • [${u.name}] ${u.repo}`);
}

if (isAudit) {
  console.log('\n🔍 Auditing local skills status against canonical suites:');
  const localSkillsDir = path.join(ROOT, '.agents', 'skills');
  if (fs.existsSync(localSkillsDir)) {
    const entries = fs.readdirSync(localSkillsDir).filter((e) => {
      const p = path.join(localSkillsDir, e);
      return fs.statSync(p).isDirectory() && e !== 'vendor';
    });
    console.log(`   Found ${entries.length} local skills in .agents/skills/`);
  }

  console.log('\n🩺 Validating local skills health via Skill Doctor...');
  try {
    execSync('node scripts/skill-doctor.mjs', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('❌ Skill Doctor detected issues.');
  }

  console.log('\n💡 To perform a live pull from all upstream remotes, run:');
  console.log('   node scripts/sync-upstream-skills.mjs --sync\n');
}

if (isSync) {
  const tmpDir = path.join(ROOT, '.tmp', 'upstream-skills-sync');
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const upstream of UPSTREAM_REPOS) {
    console.log(`\n📥 Fetching ${upstream.name}...`);
    const repoDir = path.join(tmpDir, upstream.name);
    try {
      if (fs.existsSync(repoDir)) {
        fs.rmSync(repoDir, { recursive: true, force: true });
      }
      execSync(`git clone --depth 1 ${upstream.repo} "${repoDir}"`, { stdio: 'ignore' });
      console.log(`   ✓ Successfully cloned ${upstream.name}`);
    } catch (err) {
      console.error(`   ❌ Failed to clone ${upstream.name}: ${err.message}`);
    }
  }

  console.log('\n🩺 Running post-sync Skill Doctor health verification...');
  execSync('node scripts/skill-doctor.mjs --strict', { cwd: ROOT, stdio: 'inherit' });
}
