import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ROOT_DIR } from "../utils/constants.js";
import { findSurgicalReport, readReport, normalizeTarget } from "../utils/pathUtils.js";
import { executeSovereignTool } from "../utils/execution.js";

function execUtf8(command: string) {
  try {
    const stdout = execSync(command, { cwd: ROOT_DIR, encoding: "utf8", shell: true } as any);
    return { ok: true as const, stdout };
  } catch (error: any) {
    const stdout =
      typeof error?.stdout === "string"
        ? error.stdout
        : Buffer.isBuffer(error?.stdout)
          ? error.stdout.toString("utf8")
          : "";
    const stderr =
      typeof error?.stderr === "string"
        ? error.stderr
        : Buffer.isBuffer(error?.stderr)
          ? error.stderr.toString("utf8")
          : "";

    const message = typeof error?.message === "string" ? error.message : String(error);
    const combined = [message, stderr, stdout].filter(Boolean).join("\n");
    return { ok: false as const, stdout: combined || message };
  }
}

function toMcpText(stdout: string, isError?: boolean) {
  return { content: [{ type: "text" as const, text: stdout }], isError: Boolean(isError) };
}

export class MaintenanceService {
  handleCreateCheckpoint(args: { message: string, stage_all?: boolean }) {
    console.error(`Creating checkpoint: ${args.message}`);
    const stageAll = args.stage_all !== false;
    const tempMsgPath = path.join(ROOT_DIR, ".checkpoint_msg.txt");

    try {
      if (stageAll) execUtf8("git add .");
      
      const staged = execSync("git diff --cached --name-only", { cwd: ROOT_DIR, shell: true, encoding: "utf8" } as any)
        .trim();
        
      if (!staged) return toMcpText("Nothing to commit.");

      // Try tools, ignore errors as they are non-critical optimizations
      execUtf8(`node scripts/smart-changeset.mjs --staged "${args.message.replace(/"/g, '\\"')}"`);
      execUtf8("git add .changeset/*.md");

      fs.writeFileSync(tempMsgPath, args.message, "utf-8");
      
      execUtf8(`powershell -ExecutionPolicy Bypass -File scripts/commit-ledger.ps1 -CommitMsgFile "${tempMsgPath}"`);

      const commitResult = execUtf8(`git commit -F "${tempMsgPath}" --no-verify`);
      
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);

      return toMcpText(commitResult.stdout, !commitResult.ok);
    } catch (error: any) {
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);
      return toMcpText(error?.message ?? String(error), true);
    }
  }

  handleHealCodebase(args: { files: string[] }) {
    console.error(`Healing files: ${args.files.join(", ")}`);
    const fileList = args.files.map(f => `"${f}"`).join(" ");
    const result = execUtf8(
      `powershell -ExecutionPolicy Bypass -File scripts/heal-codebase.ps1 ${fileList}`
    );
    return toMcpText(result.stdout, !result.ok);
  }

  handleNormalizeImports(args: { target?: string }) {
    const target = normalizeTarget(args.target || ".");
    const result = execUtf8(
      `node scripts/normalize-imports.mjs "${target}"`
    );
    return toMcpText(result.stdout, !result.ok);
  }

  handleNormalizeInputs(args: { target: string }) {
    const normalized = normalizeTarget(args.target);
    return toMcpText(normalized);
  }

  handleSyncIdentity() {
    const result = execUtf8("node scripts/check-identity-alignment.mjs");
    return toMcpText(result.stdout, !result.ok);
  }

  handleAuditDependencyHealth() {
    const result = execUtf8(
      "powershell -ExecutionPolicy Bypass -File scripts/audit-dependency-health.ps1"
    );
    return toMcpText(result.stdout, !result.ok);
  }

  handleCheckTypes(args: { package?: string }) {
    const rawTarget = args.package || "";
    const cleanTarget = rawTarget.replace(/^@repo\/|^@app\/|^\/|^\.\\|^.\//, "");
    
    if (cleanTarget) {
      const rootSummary = path.join(ROOT_DIR, `audit-${cleanTarget}-summary.txt`);
      if (fs.existsSync(rootSummary)) fs.unlinkSync(rootSummary);

      try {
        const output = execSync(`powershell -ExecutionPolicy Bypass -File scripts/audit-errors.ps1 -Target "${cleanTarget}" -LocalOnly`, { cwd: ROOT_DIR }).toString();
        const summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
        return { content: [{ type: "text" as const, text: output }, { type: "text" as const, text: summary }] };
      } catch (e: any) {
        const summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
        return { content: [{ type: "text" as const, text: e.message }, { type: "text" as const, text: summary }], isError: true };
      }
    } else {
      try {
        const output = execSync(`powershell -ExecutionPolicy Bypass -File scripts/audit-wrapper.ps1 -Cmd "pnpm turbo run check-types" -Log "reports/check-types.txt"`, { cwd: ROOT_DIR }).toString();
        const report = readReport("check-types.txt");
        return { content: [{ type: "text" as const, text: output }, { type: "text" as const, text: report }] };
      } catch (e: any) {
        const report = readReport("check-types.txt");
        return { content: [{ type: "text" as const, text: e.message }, { type: "text" as const, text: report }], isError: true };
      }
    }
  }

  handleGenerateGrowthSignals() {
    const result = execUtf8("node scripts/generate-growth-signals.mjs");
    return toMcpText(result.stdout, !result.ok);
  }

  handleBridgeSchemaZod(args: { input: string, output: string }) {
    console.error(`Bridging Schema: ${args.input} to ${args.output}`);
    const result = execUtf8(
      `node scripts/bridge-schema-zod.mjs "${args.input}" "${args.output}"`
    );
    return toMcpText(result.stdout, !result.ok);
  }

  handleTestSleekness() {
    console.error("Testing sleekness...");
    const result = execUtf8("npx tsx scripts/test-sleekness.ts");
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
    const target = args.target || ".";
    console.error(`Shielding unicode for: ${target}`);
    const result = execUtf8(`node scripts/unicode-shield.mjs "${target}"`);
    return toMcpText(result.stdout, !result.ok);
  }

  handleAuditDependencyDuplication() {
    console.error("Auditing dependency duplication...");
    const result = execUtf8("node scripts/audit-deps.js");
    return toMcpText(result.stdout, !result.ok);
  }

  handleCheckSchemaDrift() {
    const result = executeSovereignTool(
      "check_schema_drift",
      "node scripts/check-schema-drift.mjs"
    );
    return toMcpText(result.output, result.status !== "success");
  }

  handlePurgeStaleArtifacts(args: { ageDays?: number, dryRun?: boolean }) {
    const age = args.ageDays || 7;
    const dryRun = args.dryRun ? "--dry-run" : "";
    const result = execUtf8(`node scripts/purge-stale-artifacts.mjs --age=${age} ${dryRun}`);
    return toMcpText(result.stdout, !result.ok);
  }
}


