import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ROOT_DIR } from "../utils/constants.js";
import { findSurgicalReport, readReport } from "../utils/pathUtils.js";

export class MaintenanceService {
  handleCreateCheckpoint(args: { message: string, stage_all?: boolean }) {
    console.error(`Creating checkpoint: ${args.message}`);
    const stageAll = args.stage_all !== false;
    const tempMsgPath = path.join(ROOT_DIR, ".checkpoint_msg.txt");

    try {
      if (stageAll) execSync("git add .", { cwd: ROOT_DIR });
      const staged = execSync("git diff --cached --name-only", { cwd: ROOT_DIR }).toString().trim();
      if (!staged) return { content: [{ type: "text" as const, text: "Nothing to commit." }] };

      try {
        execSync(`node scripts/smart-changeset.mjs --staged "${args.message.replace(/"/g, '\\"')}"`, { cwd: ROOT_DIR });
        execSync("git add .changeset/*.md", { cwd: ROOT_DIR });
      } catch (e) {}

      fs.writeFileSync(tempMsgPath, args.message, "utf-8");
      try {
        execSync(`powershell -ExecutionPolicy Bypass -File scripts/commit-ledger.ps1 -CommitMsgFile "${tempMsgPath}"`, { cwd: ROOT_DIR });
      } catch (e) {}

      const output = execSync(`git commit -F "${tempMsgPath}" --no-verify`, { cwd: ROOT_DIR }).toString();
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);

      return { content: [{ type: "text" as const, text: output }] };
    } catch (error: any) {
      if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);
      return { content: [{ type: "text" as const, text: error.message }], isError: true };
    }
  }

  handleHealCodebase(args: { files: string[] }) {
    console.error(`Healing files: ${args.files.join(", ")}`);
    const fileList = args.files.map(f => `"${f}"`).join(" ");
    const output = execSync(`powershell -ExecutionPolicy Bypass -File scripts/heal-codebase.ps1 ${fileList}`, { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleNormalizeImports(args: { target?: string }) {
    const target = args.target || ".";
    const output = execSync(`powershell -ExecutionPolicy Bypass -File scripts/normalize-imports.ps1 -Target "${target}"`, { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleSyncIdentity() {
    const output = execSync("node scripts/check-identity-alignment.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleAuditDependencyHealth() {
    const output = execSync("powershell -ExecutionPolicy Bypass -File scripts/audit-dependency-health.ps1", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
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
    const output = execSync("node scripts/generate-growth-signals.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleBridgeSchemaZod(args: { input: string, output: string }) {
    console.error(`Bridging Schema: ${args.input} to ${args.output}`);
    const output = execSync(`node scripts/bridge-schema-zod.mjs "${args.input}" "${args.output}"`, { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleTestSleekness() {
    console.error("Testing core sleekness (import purity)...");
    const output = execSync("npx ts-node --esm scripts/test-sleekness.ts", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }
}
