import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../utils/constants.js';
import { executeSovereignTool } from '../utils/execution.js';
import { findSurgicalReport, normalizeTarget, readReport } from '../utils/pathUtils.js';

function execUtf8(command: string) {
  try {
    const stdout = execSync(command, { cwd: ROOT_DIR, encoding: 'utf8', shell: true } as any);
    return { ok: true as const, stdout };
  } catch (error: any) {
    const stdout =
      typeof error?.stdout === 'string'
        ? error.stdout
        : Buffer.isBuffer(error?.stdout)
          ? error.stdout.toString('utf8')
          : '';
    const stderr =
      typeof error?.stderr === 'string'
        ? error.stderr
        : Buffer.isBuffer(error?.stderr)
          ? error.stderr.toString('utf8')
          : '';

    const message = typeof error?.message === 'string' ? error.message : String(error);
    const combined = [message, stderr, stdout].filter(Boolean).join('\n');
    return { ok: false as const, stdout: combined || message };
  }
}

function toMcpText(stdout: string, isError?: boolean) {
  return { content: [{ type: 'text' as const, text: stdout }], isError: Boolean(isError) };
}

export class MaintenanceService {
  handleCreateCheckpoint(args: { message: string; stage_all?: boolean }) {
    console.error(`Creating checkpoint: ${args.message}`);
    const stageAll = args.stage_all !== false;
    const tempMsgPath = path.join(ROOT_DIR, '.checkpoint_msg.txt');

    try {
      if (stageAll) execUtf8('git add .');

      const staged = execSync('git diff --cached --name-only', {
        cwd: ROOT_DIR,
        shell: true,
        encoding: 'utf8',
      } as any).trim();

      if (!staged) return toMcpText('Nothing to commit.');

    // Try tools, ignore errors as they are non-critical optimizations
    const msg = args.message || 'chore: maintenance checkpoint';
    execUtf8(`node scripts/smart-changeset.mjs --staged "${msg.replace(/"/g, '\\"')}"`);
    execUtf8('git add .changeset/*.md');

    fs.writeFileSync(tempMsgPath, msg, 'utf-8');

      execUtf8(
        `powershell -ExecutionPolicy Bypass -File scripts/commit-ledger.ps1 -CommitMsgFile "${tempMsgPath}"`,
      );

      const commitResult = execUtf8(`git commit -F "${tempMsgPath}" --no-verify`);

      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);

      return toMcpText(commitResult.stdout, !commitResult.ok);
    } catch (error: any) {
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);
      return toMcpText(error?.message ?? String(error), true);
    }
  }

  handleHealCodebase(args: { files: string[] }) {
    console.error(`Healing files: ${args.files.join(', ')}`);
    const fileList = args.files.map((f) => `"${f}"`).join(' ');
    const result = execUtf8(
      `powershell -ExecutionPolicy Bypass -File scripts/heal-codebase.ps1 ${fileList}`,
    );
    return toMcpText(result.stdout, !result.ok);
  }

  handleHealArchitecture(args: { target?: string; dryRun?: boolean }) {
    const target = normalizeTarget(args.target || '.');
    const dryRunFlag = args.dryRun ? '--dry-run' : '';
    console.error(`🏰 Healing architecture for: ${target} ${dryRunFlag}`);
    const result = execUtf8(`node scripts/heal-architecture.mjs "${target}" ${dryRunFlag}`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleNormalizeImports(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    const result = execUtf8(`node scripts/normalize-imports.mjs "${target}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleNormalizeInputs(args: { target: string }) {
    const normalized = normalizeTarget(args.target);
    return toMcpText(normalized);
  }

  handleSyncIdentity() {
    const result = execUtf8('node scripts/check-identity-alignment.mjs');
    return toMcpText(result.stdout, !result.ok);
  }

  handleAuditDependencyHealth() {
    const result = execUtf8(
      'powershell -ExecutionPolicy Bypass -File scripts/audit-dependency-health.ps1',
    );
    return toMcpText(result.stdout, !result.ok);
  }

  handleLintFix(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Sovereign Maintenance: Fixing lint violations in ${target}`);
    const result = execUtf8(`npx biome check --write "${target}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleGenerateGrowthSignals() {
    const result = execUtf8('node scripts/generate-growth-signals.mjs');
    return toMcpText(result.stdout, !result.ok);
  }

  handleBridgeSchemaZod(args: { input: string; output: string }) {
    console.error(`Bridging Schema: ${args.input} to ${args.output}`);
    const result = execUtf8(`node scripts/bridge-schema-zod.mjs "${args.input}" "${args.output}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleTestSleekness() {
    console.error('Testing sleekness...');
    const result = execUtf8('npx tsx scripts/test-sleekness.ts');
    return toMcpText(result.stdout, !result.ok);
  }

  handleGenerateReadmeUsage(args: { package_path: string }) {
    console.error(`Generating README usage for: ${args.package_path}`);
    const result = execUtf8(`node scripts/generate-readme-usage.mjs "${args.package_path}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleScaffoldMocks(args: { file_path: string }) {
    console.error(`Scaffolding mocks for: ${args.file_path}`);
    const result = execUtf8(`node scripts/scaffold-mocks.mjs "${args.file_path}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleShieldUnicode(args: { target?: string }) {
    const target = args.target || '.';
    console.error(`Shielding unicode for: ${target}`);
    const result = execUtf8(`node scripts/unicode-shield.mjs "${target}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleAuditDependencyDuplication() {
    console.error('Auditing dependency duplication...');
    const result = execUtf8('node scripts/audit-deps.js');
    return toMcpText(result.stdout, !result.ok);
  }

  handleCheckSchemaDrift() {
    const result = executeSovereignTool(
      'check_schema_drift',
      'node scripts/check-schema-drift.mjs',
    );
    return toMcpText(result.output, result.status !== 'success');
  }

  handlePurgeStaleArtifacts(args: { ageDays?: number; dryRun?: boolean }) {
    const age = args.ageDays || 7;
    const dryRun = args.dryRun ? '--dry-run' : '';
    const result = execUtf8(`node scripts/purge-stale-artifacts.mjs --age=${age} ${dryRun}`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleRefactorReplace(args: { find: string; replace: string; target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Refactor: ${args.find} -> ${args.replace} in ${target}`);
    // sd is much safer and faster than sed
    const command = `fd -t f "${target}" | xargs sd "${args.find}" "${args.replace}"`;
    const result = execUtf8(command);
    return toMcpText(result.stdout || 'Replacement completed successfully.', !result.ok);
  }
}
