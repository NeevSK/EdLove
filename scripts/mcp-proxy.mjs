import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Sovereign Bridge Proxy: A runtime harness for environment-aware MCP servers.
 * Loads the platform engineering environment and injects it into the target server.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const ENV_PATH = join(ROOT_DIR, 'packages', 'platform-mcp', '.env');

// 1. Heritage: Load Environment Definitions
if (existsSync(ENV_PATH)) {
  const content = readFileSync(ENV_PATH, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0) {
      const varName = key.trim();
      if (process.env[varName] === undefined) {
        process.env[varName] = vals.join('=').trim();
      }
    }
  });
}

// 2. Extraction: Identify Target Server Command
const [, , command, ...args] = process.argv;

if (!command) {
  console.error('❌ Error: No server command provided to mcp-proxy.');
  console.error('Usage: node mcp-proxy.mjs <command> [args...]');
  process.exit(1);
}

// 3. Transformation: Resolve Placeholders in Arguments
const finalArgs = args.map((arg) => {
  return arg.replace(/\${env\.(.*?)}/g, (_, name) => {
    const value = process.env[name];
    if (!value) {
      console.warn(
        `⚠️  Warning: Environment variable '${name}' not found for placeholder in argument.`,
      );
      return '';
    }
    return value;
  });
});

// On Windows, use ComSpec (cmd.exe) only for batch files/scripts to avoid DEP0190 security warnings.
// For executable binaries (like node), spawn directly to avoid command line argument parsing bugs (e.g. quote stripping).
const isWin = process.platform === 'win32';
const isBatch =
  command.endsWith('.cmd') ||
  command.endsWith('.bat') ||
  ['npm', 'npx', 'pnpm', 'yarn', 'bun'].includes(command);
const spawnArgs =
  isWin && isBatch
    ? [process.env.ComSpec || 'cmd.exe', ['/c', command, ...finalArgs]]
    : [command, finalArgs];

if (process.env.DEBUG_MCP_PROXY) {
  process.stderr.write(`[MCP-PROXY] Spawning: ${command} ${finalArgs.join(' ')}\n`);
}

const child = spawn(...spawnArgs, {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_NO_WARNINGS: '1',
  },
});

// 5. Lifecycle Management
child.on('error', (err) => {
  console.error(`💥 Failed to start MCP server: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle termination signals
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
