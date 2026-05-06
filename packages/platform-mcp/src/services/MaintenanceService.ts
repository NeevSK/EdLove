import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "../utils/constants.js";
import {
	executeSovereignTool,
	getPlatformDescriptor,
	runCommand,
	runPowerShellScript,
	runShellCommand,
} from "../utils/execution.js";
import { describeTarget, normalizeTarget } from "../utils/pathUtils.js";

function toMcpText(stdout: string, isError?: boolean) {
	return {
		content: [{ type: "text" as const, text: stdout }],
		isError: Boolean(isError),
	};
}

export class MaintenanceService {
	handleCreateCheckpoint(args: { message: string; stage_all?: boolean }) {
		console.error(`Creating checkpoint: ${args.message}`);
		const stageAll = args.stage_all !== false;
		const tempMsgPath = path.join(ROOT_DIR, ".checkpoint_msg.txt");

		try {
			if (stageAll) runCommand("git", ["add", "."]);

			const stagedResult = runCommand("git", [
				"diff",
				"--cached",
				"--name-only",
			]);
			const staged = stagedResult.stdout.trim();
			if (!staged) return toMcpText("Nothing to commit.");

			const msg = String(args.message || "chore: maintenance checkpoint");
			runCommand("node", ["scripts/smart-changeset.mjs", "--staged", msg]);
			runShellCommand("git add .changeset/*.md");

			fs.writeFileSync(tempMsgPath, msg, "utf-8");

			const ledgerResult = runPowerShellScript("scripts/commit-ledger.ps1", [
				"-CommitMsgFile",
				tempMsgPath,
			]);
			const commitResult = runCommand("git", [
				"commit",
				"-F",
				tempMsgPath,
				"--no-verify",
			]);

			if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);

			const finalMessage = [
				ledgerResult.ok ? "" : ledgerResult.combined,
				commitResult.combined,
			]
				.filter(Boolean)
				.join("\n\n");
			return toMcpText(finalMessage, !commitResult.ok);
		} catch (error: any) {
			if (fs.existsSync(tempMsgPath)) fs.unlinkSync(tempMsgPath);
			return toMcpText(error?.message ?? String(error), true);
		}
	}

	handleHealCodebase(args: { files: string[] }) {
		console.error(`Healing files: ${args.files.join(", ")}`);
		const result = runPowerShellScript("scripts/heal-codebase.ps1", args.files);
		return toMcpText(result.combined, !result.ok);
	}

	handleHealArchitecture(args: { target?: string; dryRun?: boolean }) {
		const target = normalizeTarget(args.target || ".");
		console.error(`Healing architecture for: ${target}`);
		const result = runCommand("node", [
			"scripts/heal-architecture.mjs",
			target,
			...(args.dryRun ? ["--dry-run"] : []),
		]);
		return toMcpText(result.combined, !result.ok);
	}

	handleNormalizeImports(args: { target?: string }) {
		const target = normalizeTarget(args.target || ".");
		const result = runCommand("node", [
			"scripts/normalize-imports.mjs",
			target,
		]);
		return toMcpText(result.combined, !result.ok);
	}

	handleNormalizeInputs(args: { target: string }) {
		const info = describeTarget(args.target);
		return toMcpText(
			JSON.stringify(
				{
					...info,
					platform: getPlatformDescriptor(),
				},
				null,
				2,
			),
		);
	}

	handleSyncIdentity() {
		const result = runCommand("node", ["scripts/check-identity-alignment.mjs"]);
		return toMcpText(result.combined, !result.ok);
	}

	handleAuditDependencyHealth() {
		const result = runPowerShellScript("scripts/audit-dependency-health.ps1");
		return toMcpText(result.combined, !result.ok);
	}

	handleLintFix(args: { target?: string }) {
		const target = normalizeTarget(args.target || ".");
		console.error(`Sovereign Maintenance: Fixing lint violations in ${target}`);
		const result = runCommand("npx", ["biome", "check", "--write", target], {
			shell: process.platform === "win32",
		});
		return toMcpText(result.combined, !result.ok);
	}

	handleGenerateGrowthSignals() {
		const result = runCommand("node", ["scripts/generate-growth-signals.mjs"]);
		return toMcpText(result.combined, !result.ok);
	}

	handleBridgeSchemaZod(args: { input: string; output: string }) {
		console.error(`Bridging Schema: ${args.input} to ${args.output}`);
		const result = runCommand("node", [
			"scripts/bridge-schema-zod.mjs",
			args.input,
			args.output,
		]);
		return toMcpText(result.combined, !result.ok);
	}

	handleTestSleekness() {
		console.error("Testing sleekness...");
		const result = runCommand("npx", ["tsx", "scripts/test-sleekness.ts"], {
			shell: process.platform === "win32",
		});
		return toMcpText(result.combined, !result.ok);
	}

	handleGenerateReadmeUsage(args: { package_path: string }) {
		console.error(`Generating README usage for: ${args.package_path}`);
		const result = runCommand("node", [
			"scripts/generate-readme-usage.mjs",
			args.package_path,
		]);
		return toMcpText(result.combined, !result.ok);
	}

	handleScaffoldMocks(args: { file_path: string }) {
		console.error(`Scaffolding mocks for: ${args.file_path}`);
		const result = runCommand("node", [
			"scripts/scaffold-mocks.mjs",
			args.file_path,
		]);
		return toMcpText(result.combined, !result.ok);
	}

	handleShieldUnicode(args: { target?: string }) {
		const target = normalizeTarget(args.target || ".");
		console.error(`Shielding unicode for: ${target}`);
		const result = runCommand("node", ["scripts/unicode-shield.mjs", target]);
		return toMcpText(result.combined, !result.ok);
	}

	handleAuditDependencyDuplication() {
		console.error("Auditing dependency duplication...");
		const result = runCommand("node", ["scripts/audit-deps.js"]);
		return toMcpText(result.combined, !result.ok);
	}

	handleCheckSchemaDrift() {
		const result = executeSovereignTool(
			"check_schema_drift",
			"node scripts/check-schema-drift.mjs",
		);
		return toMcpText(result.output, result.status !== "success");
	}

	handlePurgeStaleArtifacts(args: { ageDays?: number; dryRun?: boolean }) {
		const age = args.ageDays || 7;
		const result = runCommand("node", [
			"scripts/purge-stale-artifacts.mjs",
			`--age=${age}`,
			...(args.dryRun ? ["--dry-run"] : []),
		]);
		return toMcpText(result.combined, !result.ok);
	}

	handleRefactorReplace(args: {
		find: string;
		replace: string;
		target?: string;
	}) {
		const targetInfo = describeTarget(args.target || ".");
		const target = targetInfo.normalized;
		console.error(
			`Shiny Refactor: ${args.find} -> ${args.replace} in ${target}`,
		);

		if (!targetInfo.exists) {
			return toMcpText(`Target does not exist: ${target}`, true);
		}

		const ignoreDirs = new Set([
			".git",
			"node_modules",
			"dist",
			"build",
			".turbo",
			".next",
			".expo",
		]);
		const touched: string[] = [];
		let replacements = 0;

		const walk = (currentPath: string) => {
			const stats = fs.statSync(currentPath);
			if (stats.isDirectory()) {
				for (const entry of fs.readdirSync(currentPath, {
					withFileTypes: true,
				})) {
					if (entry.isDirectory() && ignoreDirs.has(entry.name)) continue;
					walk(path.join(currentPath, entry.name));
				}
				return;
			}

			const original = fs.readFileSync(currentPath, "utf-8");
			if (!original.includes(args.find)) return;

			const updated = original.split(args.find).join(args.replace);
			const count = original.split(args.find).length - 1;
			fs.writeFileSync(currentPath, updated, "utf-8");
			replacements += count;
			touched.push(path.relative(ROOT_DIR, currentPath));
		};

		walk(target);

		if (replacements === 0) {
			return toMcpText(`No matches found for "${args.find}" in ${target}.`);
		}

		return toMcpText(
			[
				`Replaced ${replacements} occurrence(s) of "${args.find}" with "${args.replace}".`,
				`Files changed (${touched.length}):`,
				...touched.map((file) => `- ${file}`),
			].join("\n"),
		);
	}

	handleGenerateRunbyteConfig(args: {
		includeFilesystem?: boolean;
		transport?: "stdio" | "http";
		serverName?: string;
	}) {
		const workspace = ROOT_DIR;
		const serverName = args.serverName?.trim() || "platform";
		const includeFilesystem = args.includeFilesystem !== false;
		const transport = args.transport || "stdio";
		const platformCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
		const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

		const config = {
			mcpServers: {
				[serverName]: {
					command: platformCommand,
					args: ["--filter", "@repo/platform-mcp", "start"],
					cwd: workspace,
				},
				...(includeFilesystem
					? {
							filesystem: {
								command: npxCommand,
								args: [
									"-y",
									"@modelcontextprotocol/server-filesystem",
									workspace,
								],
							},
						}
					: {}),
			},
			...(transport === "http" ? { server: { port: 3000, timeout: 30 } } : {}),
		};
		return toMcpText(JSON.stringify(config, null, 2));
	}
	handleSovereignPush() {
		console.error("Sovereign Maintenance: Initiating Push Gate...");
		const auditCmd =
			"pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check";

		const auditResult = runCommand("node", [
			"scripts/sovereign-audit.mjs",
			"--cmd",
			auditCmd,
			"--log",
			"reports/push_audit.md",
		]);

		if (!auditResult.ok) {
			return toMcpText(
				`❌ PUSH REJECTED: Sovereign Quality Gate failed.\n\n${auditResult.combined}`,
				true,
			);
		}

		console.error("Quality gate passed. Executing git push...");
		const pushResult = runCommand("git", ["push"]);
		return toMcpText(
			`✅ GATE PASSED: Push successful.\n\n${pushResult.combined}`,
			!pushResult.ok,
		);
	}
}
