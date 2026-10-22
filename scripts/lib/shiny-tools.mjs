/**
 * 🦀 Sovereign Shiny Tools Manager & Runtime Sentinel
 *
 * Provides detection, interactive permission prompts, auto-installation,
 * and high-performance Rust execution with graceful pure-JS fallbacks.
 *
 * Tools managed:
 * - rg (ripgrep)       - Sub-millisecond text search
 * - fd (fd-find)       - Instant file discovery
 * - sd (sd)            - Fast atomic search-and-replace
 * - bat (bat)          - Syntax-highlighted viewer
 * - delta (git-delta)  - Syntax-highlighting git pager
 * - sg (ast-grep)      - Structural AST pattern search and rewrite
 * - gitleaks           - Secret leakage firewall
 */

import { execSync, spawnSync } from 'node:child_process';
import readline from 'node:readline';
import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

export const SHINY_TOOLS = {
  rg: {
    name: 'rg',
    binary: 'rg',
    checkCmd: 'rg --version',
    purpose: 'Sub-millisecond text search (ripgrep)',
    wingetId: 'BurntSushi.ripgrep.MSVC',
    npmPkg: null,
    choco: 'ripgrep',
    scoop: 'ripgrep',
  },
  fd: {
    name: 'fd',
    binary: 'fd',
    checkCmd: 'fd --version',
    purpose: 'Instant file discovery (fd-find)',
    wingetId: 'sharkdp.fd',
    npmPkg: null,
    choco: 'fd',
    scoop: 'fd',
  },
  sd: {
    name: 'sd',
    binary: 'sd',
    checkCmd: 'sd --version',
    purpose: 'Fast find-and-replace (sd)',
    wingetId: 'chmln.sd',
    cargo: 'sd',
    scoop: 'sd',
  },
  bat: {
    name: 'bat',
    binary: 'bat',
    checkCmd: 'bat --version',
    purpose: 'Syntax-highlighted file viewer (bat)',
    wingetId: 'sharkdp.bat',
    choco: 'bat',
    scoop: 'bat',
  },
  delta: {
    name: 'delta',
    binary: 'delta',
    checkCmd: 'delta --version',
    purpose: 'Syntax-highlighting git diff pager (git-delta)',
    wingetId: 'dandavison.delta',
    choco: 'delta',
    scoop: 'delta',
  },
  sg: {
    name: 'sg',
    binary: 'sg',
    checkCmd: 'sg --version',
    altCheckCmd: 'ast-grep --version',
    purpose: 'AST structural search and codemods (ast-grep)',
    wingetId: 'ast-grep.ast-grep',
    npmPkg: '@ast-grep/cli',
    cargo: 'ast-grep',
  },
  gitleaks: {
    name: 'gitleaks',
    binary: 'gitleaks',
    checkCmd: 'gitleaks version',
    purpose: 'Hardcoded secrets and API token scanner',
    wingetId: 'Gitleaks.Gitleaks',
    choco: 'gitleaks',
    scoop: 'gitleaks',
  },
};

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

/**
 * Check if the current process is running in an interactive terminal.
 */
export function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY && !process.env.CI);
}

/**
 * Check if a specific shiny tool is installed on PATH.
 */
export function checkShinyTool(key) {
  const tool = SHINY_TOOLS[key];
  if (!tool) {
    return { installed: false, version: '', error: `Unknown tool key: ${key}` };
  }

  // Primary check
  try {
    const output = execSync(tool.checkCmd, { stdio: 'pipe', encoding: 'utf8', timeout: 3000 });
    const version = output.trim().split('\n')[0];
    return { installed: true, version, binary: tool.binary };
  } catch (_err) {
    // Check alternate command if specified (e.g. ast-grep vs sg)
    if (tool.altCheckCmd) {
      try {
        const output = execSync(tool.altCheckCmd, { stdio: 'pipe', encoding: 'utf8', timeout: 3000 });
        const version = output.trim().split('\n')[0];
        return { installed: true, version, binary: 'ast-grep' };
      } catch {
        // Fall through
      }
    }

    // Windows fallback: Check WinGet default packages directory if PATH hasn't refreshed
    if (process.platform === 'win32' && process.env.LOCALAPPDATA && tool.wingetId) {
      const wingetDir = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(wingetDir)) {
        try {
          const matched = fs.readdirSync(wingetDir).find((d) => d.toLowerCase().startsWith(tool.wingetId.toLowerCase()));
          if (matched) {
            const candidateBin = path.join(wingetDir, matched, `${tool.binary}.exe`);
            if (fs.existsSync(candidateBin)) {
              const output = execSync(`"${candidateBin}" --version`, { stdio: 'pipe', encoding: 'utf8', timeout: 3000 });
              const version = output.trim().split('\n')[0];
              return { installed: true, version, binary: candidateBin };
            }
          }
        } catch {
          // Fall through
        }
      }
    }
  }

  return { installed: false, version: '', binary: tool.binary };
}

/**
 * Determine the optimal installation command on Windows.
 */
function getWindowsInstallCommand(tool) {
  if (tool.wingetId) {
    return {
      manager: 'winget',
      cmd: 'winget',
      args: ['install', '--id', tool.wingetId, '-e', '--accept-package-agreements', '--accept-source-agreements'],
      display: `winget install --id ${tool.wingetId} -e`,
    };
  }
  if (tool.npmPkg) {
    return {
      manager: 'npm',
      cmd: 'npm',
      args: ['install', '-g', tool.npmPkg],
      display: `npm install -g ${tool.npmPkg}`,
    };
  }
  if (tool.choco) {
    return {
      manager: 'choco',
      cmd: 'choco',
      args: ['install', tool.choco, '-y'],
      display: `choco install ${tool.choco} -y`,
    };
  }
  return null;
}

/**
 * Interactively prompt user for permission to install a missing shiny tool.
 */
export async function promptToInstallTool(key) {
  const tool = SHINY_TOOLS[key];
  if (!tool) return false;

  const installPlan = getWindowsInstallCommand(tool);
  if (!installPlan) {
    console.log(`${colors.yellow}⚠️  No automated installer mapped for ${tool.name}.${colors.reset}`);
    return false;
  }

  if (!isInteractive()) {
    console.log(
      `${colors.dim}[Shiny Tools] Notice: '${tool.name}' is missing. Run '${installPlan.display}' to install.${colors.reset}`,
    );
    return false;
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      `\n${colors.bold}${colors.cyan}🦀 [Shiny Tools] Performance Upgrade Available${colors.reset}`,
    );
    console.log(
      `Tool: ${colors.bold}${tool.name}${colors.reset} (${tool.purpose}) is not currently on PATH.`,
    );
    console.log(`Automated Install: ${colors.green}${installPlan.display}${colors.reset}`);

    rl.question(
      `Would you like to download and install '${tool.name}' now? [Y/n] `,
      (answer) => {
        rl.close();
        const trimmed = (answer || '').trim().toLowerCase();
        if (trimmed === '' || trimmed === 'y' || trimmed === 'yes') {
          console.log(`\n${colors.cyan}📦 Executing: ${installPlan.display}...${colors.reset}\n`);
          try {
            const spawnResult = spawnSync(installPlan.cmd, installPlan.args, {
              stdio: 'inherit',
              shell: process.platform === 'win32',
            });

            if (spawnResult.status === 0) {
              console.log(
                `\n${colors.green}✅ '${tool.name}' installed successfully!${colors.reset}\n`,
              );
              // Re-check
              const recheck = checkShinyTool(key);
              resolve(recheck.installed);
              return;
            } else {
              console.log(
                `\n${colors.yellow}⚠️  Installer exited with status ${spawnResult.status}.${colors.reset}`,
              );
              resolve(false);
              return;
            }
          } catch (err) {
            console.log(
              `\n${colors.red}❌ Failed to execute installer: ${err.message}${colors.reset}`,
            );
            resolve(false);
            return;
          }
        } else {
          console.log(`${colors.dim}Proceeding without '${tool.name}'...${colors.reset}`);
          resolve(false);
        }
      },
    );
  });
}

/**
 * Ensure a shiny tool is available, prompting if interactive or falling back.
 */
export async function ensureShinyTool(key, options = {}) {
  const status = checkShinyTool(key);
  if (status.installed) return true;

  // Attempt interactive prompt
  const installed = await promptToInstallTool(key);
  if (installed) return true;

  if (options.required) {
    throw new Error(
      `Required shiny tool '${key}' is missing. Install with: ${SHINY_TOOLS[key]?.wingetId ? `winget install ${SHINY_TOOLS[key].wingetId}` : 'see docs'}`,
    );
  }

  return false;
}

/**
 * Audit all shiny tools, returning a comprehensive report and optionally prompting for missing ones.
 */
export async function auditAllShinyTools({ autoPrompt = false } = {}) {
  const results = {};
  for (const [key, tool] of Object.entries(SHINY_TOOLS)) {
    const status = checkShinyTool(key);
    results[key] = {
      ...tool,
      ...status,
    };
  }

  if (autoPrompt && isInteractive()) {
    for (const [key, res] of Object.entries(results)) {
      if (!res.installed) {
        const newlyInstalled = await promptToInstallTool(key);
        if (newlyInstalled) {
          results[key] = {
            ...results[key],
            ...checkShinyTool(key),
          };
        }
      }
    }
  }

  return results;
}
