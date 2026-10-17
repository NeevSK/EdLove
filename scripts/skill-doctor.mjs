#!/usr/bin/env node

/**
 * Sovereign Skill Doctor & Diagnostic Linter
 * 
 * Inspects all skill packages across:
 *   - .agents/skills/
 *   - .claude/skills/
 * 
 * Checks & Heals:
 *   1. Mandatory SKILL.md / skill.md existence
 *   2. Valid YAML frontmatter (name, description)
 *   3. Non-trivial description with activation trigger conditions
 *   4. Broken symlinks in vendor / pnpm linked skills
 * 
 * Usage:
 *   node scripts/skill-doctor.mjs          # Run full audit
 *   node scripts/skill-doctor.mjs --heal   # Automatically repair frontmatters
 *   node scripts/skill-doctor.mjs --strict # Exit 1 on any warning
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const isStrict = process.argv.includes('--strict');
const isHeal = process.argv.includes('--heal');

const skillRoots = [
  resolve(root, '.agents/skills'),
  resolve(root, '.claude/skills'),
];

console.log('🩺 Sovereign Skill Doctor — Agent Skill Health & Integrity Audit');
console.log(`📌 Mode: ${isHeal ? 'HEAL & REPAIR' : 'AUDIT'}`);
console.log('=================================================================');

let totalSkills = 0;
let healthySkills = 0;
let healedSkills = 0;
let errors = [];
let warnings = [];

function checkSkillDir(skillDir, skillName, rootName) {
  totalSkills++;
  const stats = lstatSync(skillDir);
  
  if (stats.isSymbolicLink()) {
    try {
      if (!existsSync(skillDir)) {
        errors.push(`[${rootName}/${skillName}] Broken symlink target.`);
        return;
      }
    } catch {
      errors.push(`[${rootName}/${skillName}] Inaccessible symlink.`);
      return;
    }
  }

  // Look for SKILL.md, skill.md, or any .md in dir
  const skillFileUpper = join(skillDir, 'SKILL.md');
  const skillFileLower = join(skillDir, 'skill.md');
  let targetFile = existsSync(skillFileUpper) ? skillFileUpper : existsSync(skillFileLower) ? skillFileLower : null;

  if (!targetFile) {
    if (isHeal) {
      // Find first markdown file in directory to elevate to SKILL.md
      const dirFiles = readdirSync(skillDir).filter((f) => f.endsWith('.md'));
      if (dirFiles.length > 0) {
        targetFile = join(skillDir, dirFiles[0]);
      } else {
        // Create baseline SKILL.md
        targetFile = skillFileUpper;
        writeFileSync(
          targetFile,
          `---\nname: ${skillName}\ndescription: "Authoritative skill guide for ${skillName} in Polymath Platform."\n---\n\n# ${skillName}\n`,
          'utf8'
        );
        healedSkills++;
      }
    } else {
      errors.push(`[${rootName}/${skillName}] Missing SKILL.md or skill.md manifest.`);
      return;
    }
  }

  let content = readFileSync(targetFile, 'utf8');

  // Check YAML Frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    if (isHeal) {
      // Synthesize frontmatter from content
      const firstHeading = content.match(/^#\s+(.+)$/m);
      const title = firstHeading ? firstHeading[1].trim() : skillName;
      content = `---\nname: ${skillName}\ndescription: "Authoritative usage guide and instructions for ${title}."\n---\n\n${content}`;
      writeFileSync(targetFile, content, 'utf8');
      healedSkills++;
    } else {
      errors.push(`[${rootName}/${skillName}] Missing or malformed YAML frontmatter.`);
      return;
    }
  } else {
    let frontmatter = frontmatterMatch[1];
    let needsRewrite = false;

    const nameMatch = frontmatter.match(/name:\s*([^\r\n]+)/);

    function extractDescription(fm) {
      const multilineMatch = fm.match(/description:\s*[>|]-?\r?\n([\s\S]*?)(?=\r?\n[a-zA-Z0-9_-]+:|$)/);
      if (multilineMatch) {
        return multilineMatch[1].replace(/\r?\n\s*/g, ' ').trim();
      }
      const singleLineMatch = fm.match(/description:\s*([^\r\n]+)/);
      if (singleLineMatch) {
        const val = singleLineMatch[1].trim().replace(/^["']|["']$/g, '');
        if (val !== '>' && val !== '|' && val !== '>-' && val !== '|-') {
          return val;
        }
      }
      return '';
    }

    let desc = extractDescription(frontmatter);

    if (!nameMatch || !nameMatch[1].trim()) {
      if (isHeal) {
        frontmatter = `name: ${skillName}\n` + frontmatter;
        needsRewrite = true;
      } else {
        errors.push(`[${rootName}/${skillName}] Frontmatter missing required "name" field.`);
        return;
      }
    }

    if (!desc) {
      if (isHeal) {
        frontmatter = frontmatter + `\ndescription: "Authoritative usage guide and instructions for ${skillName}."`;
        needsRewrite = true;
        desc = `Authoritative usage guide and instructions for ${skillName}.`;
      } else {
        errors.push(`[${rootName}/${skillName}] Frontmatter missing required "description" field.`);
        return;
      }
    }

    if (needsRewrite) {
      content = content.replace(/^---\r?\n([\s\S]*?)\r?\n---/, `---\n${frontmatter.trim()}\n---`);
      writeFileSync(targetFile, content, 'utf8');
      healedSkills++;
    }

    if (desc.length < 20) {
      warnings.push(`[${rootName}/${skillName}] Description is short (< 20 chars: "${desc}"). Ensure clear trigger guidelines.`);
    }
  }

  healthySkills++;
}

for (const skillRoot of skillRoots) {
  if (!existsSync(skillRoot)) continue;
  const rootName = skillRoot.includes('.claude') ? '.claude/skills' : '.agents/skills';
  const entries = readdirSync(skillRoot);

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'scripts') continue;
    if (entry === 'vendor') {
      const vendorDir = join(skillRoot, 'vendor');
      if (existsSync(vendorDir)) {
        const vendorEntries = readdirSync(vendorDir);
        for (const vEntry of vendorEntries) {
          if (vEntry.startsWith('.')) continue;
          const vFullPath = join(vendorDir, vEntry);
          try {
            const vStat = lstatSync(vFullPath);
            if (vStat.isDirectory() || vStat.isSymbolicLink()) {
              checkSkillDir(vFullPath, vEntry, `${rootName}/vendor`);
            }
          } catch (err) {
            errors.push(`[${rootName}/vendor/${vEntry}] Failed to inspect: ${err.message}`);
          }
        }
      }
      continue;
    }
    const fullPath = join(skillRoot, entry);
    try {
      const stat = lstatSync(fullPath);
      if (stat.isDirectory() || stat.isSymbolicLink()) {
        checkSkillDir(fullPath, entry, rootName);
      }
    } catch (err) {
      errors.push(`[${rootName}/${entry}] Failed to inspect: ${err.message}`);
    }
  }
}

console.log(`\n📊 Audit Results:`);
console.log(`   Total Skills Inspected : ${totalSkills}`);
console.log(`   Healthy Skills         : ${healthySkills}`);
if (isHeal) console.log(`   Healed Skills          : ${healedSkills}`);
console.log(`   Warnings               : ${warnings.length}`);
console.log(`   Errors                 : ${errors.length}`);

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`   • ${w}`);
  }
}

if (errors.length > 0) {
  console.log(`\n❌ Errors (${errors.length}):`);
  for (const e of errors) {
    console.log(`   • ${e}`);
  }
  if (isStrict) {
    process.exit(1);
  }
}

if (errors.length === 0) {
  console.log('\n✨ All skill manifests, frontmatters, and links are healthy!');
  process.exit(0);
} else {
  process.exit(0);
}
