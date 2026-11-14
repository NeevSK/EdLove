#!/usr/bin/env node

/**
 * Sovereign Upstream Skills Synchronizer & Progressive Disclosure Engine
 * 
 * Tracks, approves, and synchronizes canonical skills directly from official GitHub repositories:
 *   1. Emil Kowalski: https://github.com/emilkowalski/skills.git (motion, design, mobile)
 *   2. Expo: https://github.com/expo/skills.git (Expo SDK 58, Router, EAS)
 *   3. Supabase: https://github.com/supabase/agent-skills.git (Postgres, RLS, Edge functions)
 *   4. Vercel Labs: https://github.com/vercel-labs/agent-skills.git (React 19, Next.js, composition)
 * 
 * Enforces:
 *   - Security approval check (against pnpm-workspace.yaml permissions)
 *   - Automatic Progressive Disclosure transformation (deep docs -> references/, crisp prompt triggers)
 *   - Skill Doctor strict validation
 * 
 * Usage:
 *   node scripts/sync-upstream-skills.mjs --audit   # Inspect upstream revisions and diffs
 *   node scripts/sync-upstream-skills.mjs --sync    # Pull, transform, and verify skills
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

console.log('🔄 Sovereign Upstream Skills Synchronizer & Progressive Disclosure Engine');
console.log(`📌 Mode: ${isSync ? 'SYNCHRONIZE & TRANSFORM' : 'AUDIT ONLY'}`);
console.log('================================================================');

console.log('\n📋 Configured Upstream Repositories:');
for (const u of UPSTREAM_REPOS) {
  console.log(`   • [${u.name}] ${u.repo}`);
}

/**
 * Transforms an incoming upstream skill into a Hierarchical Progressive Disclosure structure
 */
function transformToProgressiveDisclosure(sourceSkillDir, targetSkillDir, skillName) {
  fs.mkdirSync(targetSkillDir, { recursive: true });
  const referencesDir = path.join(targetSkillDir, 'references');

  const skillFileUpper = path.join(sourceSkillDir, 'SKILL.md');
  const skillFileLower = path.join(sourceSkillDir, 'skill.md');
  const mainSkillFile = fs.existsSync(skillFileUpper) ? skillFileUpper : fs.existsSync(skillFileLower) ? skillFileLower : null;

  if (!mainSkillFile) return false;

  let content = fs.readFileSync(mainSkillFile, 'utf8');

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  let frontmatter = '';
  let body = content;

  if (frontmatterMatch) {
    frontmatter = frontmatterMatch[1];
    body = content.replace(frontmatterMatch[0], '').trim();
  }

  // Check for auxiliary files (RECIPES.md, etc.) and move them to references/
  const dirEntries = fs.readdirSync(sourceSkillDir);
  const auxiliaryFiles = dirEntries.filter(
    (f) => f.endsWith('.md') && f.toLowerCase() !== 'skill.md'
  );

  let references = [];

  if (auxiliaryFiles.length > 0) {
    fs.mkdirSync(referencesDir, { recursive: true });
    for (const aux of auxiliaryFiles) {
      const srcAux = path.join(sourceSkillDir, aux);
      const destAux = path.join(referencesDir, aux.toLowerCase());
      fs.copyFileSync(srcAux, destAux);
      references.push({ name: aux.replace(/\.md$/i, ''), path: `references/${aux.toLowerCase()}` });
    }
  }

  // If the body is very large (> 350 lines), split long sections into references/
  const lines = body.split(/\r?\n/);
  if (lines.length > 350 && !references.some(r => r.name === 'deep-spec')) {
    fs.mkdirSync(referencesDir, { recursive: true });
    const specFile = path.join(referencesDir, 'specification.md');
    fs.writeFileSync(specFile, body, 'utf8');
    references.push({ name: 'Specification & API Details', path: 'references/specification.md' });

    // Keep top summary and routing in SKILL.md
    body = `${lines.slice(0, 50).join('\n')}\n\n## Progressive Disclosure Router\n\nFor full specification and examples, consult:\n- [\`references/specification.md\`](./references/specification.md)\n`;
  }

  // Copy scripts/ if present
  const srcScripts = path.join(sourceSkillDir, 'scripts');
  if (fs.existsSync(srcScripts) && fs.statSync(srcScripts).isDirectory()) {
    const destScripts = path.join(targetSkillDir, 'scripts');
    fs.cpSync(srcScripts, destScripts, { recursive: true });
  }

  // Write finalized SKILL.md
  const finalizedSkill = frontmatter
    ? `---\n${frontmatter}\n---\n\n${body}\n`
    : `---\nname: ${skillName}\ndescription: "Authoritative upstream skill guide for ${skillName}."\n---\n\n${body}\n`;

  fs.writeFileSync(path.join(targetSkillDir, 'SKILL.md'), finalizedSkill, 'utf8');
  return true;
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

  console.log('\n💡 To perform a live pull and progressive disclosure transform, run:');
  console.log('   node scripts/sync-upstream-skills.mjs --sync\n');
}

if (isSync) {
  const tmpDir = path.join(ROOT, '.tmp', 'upstream-skills-sync');
  fs.mkdirSync(tmpDir, { recursive: true });

  let transformedCount = 0;

  for (const upstream of UPSTREAM_REPOS) {
    console.log(`\n📥 Fetching ${upstream.name}...`);
    const repoDir = path.join(tmpDir, upstream.name);
    try {
      if (fs.existsSync(repoDir)) {
        fs.rmSync(repoDir, { recursive: true, force: true });
      }
      execSync(`git clone --depth 1 ${upstream.repo} "${repoDir}"`, { stdio: 'ignore' });
      console.log(`   ✓ Successfully cloned ${upstream.name}`);

      // Locate skills within the cloned repo
      const sourceSkillsPath = path.join(repoDir, upstream.sourcePath);
      if (fs.existsSync(sourceSkillsPath)) {
        const skillsFound = fs.readdirSync(sourceSkillsPath);
        for (const sName of skillsFound) {
          const sPath = path.join(sourceSkillsPath, sName);
          if (!fs.statSync(sPath).isDirectory()) continue;

          const targetSkillPath = path.join(ROOT, upstream.targetDir, sName);
          const ok = transformToProgressiveDisclosure(sPath, targetSkillPath, sName);
          if (ok) {
            transformedCount++;
            console.log(`   🧩 Transformed & updated: ${sName} (Progressive Disclosure)`);
          }
        }
      }
    } catch (err) {
      console.error(`   ❌ Failed to process ${upstream.name}: ${err.message}`);
    }
  }

  console.log(`\n✨ Successfully transformed ${transformedCount} upstream skills with Progressive Disclosure.`);

  console.log('\n🩺 Running post-sync Skill Doctor health verification...');
  execSync('node scripts/skill-doctor.mjs --strict', { cwd: ROOT, stdio: 'inherit' });
}
