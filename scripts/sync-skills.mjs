import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

async function syncWorkspaceSkillsToAntigravity() {
  const homedir = os.homedir();
  const localSkillsDir = path.join(workspaceRoot, '.claude', 'skills');
  const globalKiDir = path.join(homedir, '.gemini', 'antigravity', 'knowledge');
  const globalCodexSkillsDir = path.join(homedir, '.codex', 'skills');

  if (!fs.existsSync(localSkillsDir)) {
    fs.mkdirSync(localSkillsDir, { recursive: true });
  }
  if (!fs.existsSync(globalKiDir)) {
    fs.mkdirSync(globalKiDir, { recursive: true });
  }

  const playbooks = new Map();

  // A. Read local playbooks
  if (fs.existsSync(localSkillsDir)) {
    const localSkills = fs.readdirSync(localSkillsDir);
    for (const skillName of localSkills) {
      const skillPath = path.join(localSkillsDir, skillName);
      if (!fs.statSync(skillPath).isDirectory()) continue;

      const localSkillMdPath = path.join(skillPath, 'skill.md');
      if (fs.existsSync(localSkillMdPath)) {
        const content = fs.readFileSync(localSkillMdPath, 'utf8');
        playbooks.set(skillName, { sourcePath: localSkillMdPath, content });
      }
    }
  }

  // B. Read global Codex playbooks
  if (fs.existsSync(globalCodexSkillsDir)) {
    const globalSkills = fs.readdirSync(globalCodexSkillsDir);
    for (const skillName of globalSkills) {
      if (skillName.startsWith('.')) continue;

      const skillPath = path.join(globalCodexSkillsDir, skillName);
      if (!fs.statSync(skillPath).isDirectory()) continue;

      let codexSkillMdPath = path.join(skillPath, 'SKILL.md');
      if (!fs.existsSync(codexSkillMdPath)) {
        codexSkillMdPath = path.join(skillPath, 'skill.md');
      }

      if (fs.existsSync(codexSkillMdPath)) {
        if (!playbooks.has(skillName)) {
          const content = fs.readFileSync(codexSkillMdPath, 'utf8');
          playbooks.set(skillName, { sourcePath: codexSkillMdPath, content });

          // Auto-import to workspace
          const targetWorkspaceSkillDir = path.join(localSkillsDir, skillName);
          if (!fs.existsSync(targetWorkspaceSkillDir)) {
            fs.mkdirSync(targetWorkspaceSkillDir, { recursive: true });
          }
          fs.writeFileSync(path.join(targetWorkspaceSkillDir, 'skill.md'), content, 'utf8');
          console.log(`Auto-Imported: Global Codex skill "${skillName}" copied into workspace.`);
        }
      }
    }
  }

  let consolidatedInstructions = `# Unified Developer Copilot Instructions\n\nGenerated automatically by the Polymath Platform Gateway. Do not edit directly.\n\n`;

  // Prepend root .cursorrules if available
  const cursorRulesPath = path.join(workspaceRoot, '.cursorrules');
  if (fs.existsSync(cursorRulesPath)) {
    consolidatedInstructions += `\n<!-- START SYSTEM RULES (.cursorrules) -->\n\n${fs.readFileSync(cursorRulesPath, 'utf8')}\n\n<!-- END SYSTEM RULES -->\n\n---\n`;
  }

  for (const [skillName, details] of playbooks.entries()) {
    consolidatedInstructions += `\n<!-- START SKILL: ${skillName} -->\n\n${details.content}\n\n<!-- END SKILL: ${skillName} -->\n`;

    // 1. Sync globally to Gemini/Antigravity KIs
    const targetSkillDir = path.join(globalKiDir, skillName);
    const targetArtifactsDir = path.join(targetSkillDir, 'artifacts');

    if (!fs.existsSync(targetSkillDir)) {
      fs.mkdirSync(targetSkillDir, { recursive: true });
    }
    if (!fs.existsSync(targetArtifactsDir)) {
      fs.mkdirSync(targetArtifactsDir, { recursive: true });
    }

    const metadata = {
      title: `${skillName
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')} Skill`,
      summary: `Workspace-bounded engineering playbook for ${skillName} integrated into the Polymath Platform.`,
      tags: [skillName, 'sovereign', 'monorepo', 'playbook'],
      updatedAt: new Date().toISOString(),
      references: [
        {
          title: `Workspace Playbook`,
          path: path.join(localSkillsDir, skillName, 'skill.md'),
        },
      ],
    };

    fs.writeFileSync(
      path.join(targetSkillDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8',
    );

    fs.writeFileSync(path.join(targetArtifactsDir, 'skill.md'), details.content, 'utf8');
    console.log(`Synced skill "${skillName}" globally to Antigravity.`);

    // 2. Sync back to Codex
    if (fs.existsSync(globalCodexSkillsDir)) {
      const targetCodexSkillDir = path.join(globalCodexSkillsDir, skillName);
      if (!fs.existsSync(targetCodexSkillDir)) {
        fs.mkdirSync(targetCodexSkillDir, { recursive: true });
        fs.writeFileSync(path.join(targetCodexSkillDir, 'SKILL.md'), details.content, 'utf8');
        console.log(`Synced skill "${skillName}" back to global Codex.`);
      }
    }
  }

  const githubDir = path.join(workspaceRoot, '.github');
  if (!fs.existsSync(githubDir)) {
    fs.mkdirSync(githubDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(githubDir, 'copilot-instructions.md'),
    consolidatedInstructions,
    'utf8',
  );
  console.log(
    'Successfully consolidated all playbooks and rules into .github/copilot-instructions.md.',
  );
}

syncWorkspaceSkillsToAntigravity().catch(console.error);
