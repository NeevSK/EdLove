import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT_DIR } from "./constants.js";

interface ExecutionResult {
	tool: string;
	timestamp: string;
	durationMs: number;
	status: "success" | "failure";
	output: string;
	metadata?: any;
}

export interface CommandRunResult {
	ok: boolean;
	stdout: string;
	stderr: string;
	combined: string;
	exitCode: number | null;
	command: string;
	args: string[];
}

export interface PowerShellAvailability {
	available: boolean;
	binary: string | null;
	guidance?: string;
}

function normalizeOutput(value: unknown): string {
	if (typeof value === "string") return value;
	if (Buffer.isBuffer(value)) return value.toString("utf8");
	return "";
}

export function quoteShellArg(value: string): string {
	if (value.length === 0) return '""';
	return `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

export function commandExists(command: string): boolean {
	const check = process.platform === "win32" ? "where" : "which";
	const result = spawnSync(check, [command], {
		cwd: ROOT_DIR,
		encoding: "utf8",
		shell: false,
	});
	return result.status === 0;
}

export function getPowerShellAvailability(): PowerShellAvailability {
	if (commandExists("pwsh")) {
		return { available: true, binary: "pwsh" };
	}

	if (process.platform === "win32" && commandExists("powershell")) {
		return { available: true, binary: "powershell" };
	}

	const guidance =
		process.platform === "win32"
			? "PowerShell was not found. Install PowerShell 7 (pwsh) or ensure Windows PowerShell is on PATH."
			: "PowerShell was not found. Install PowerShell 7 (`pwsh`) to run this tool on macOS/Linux.";

	return { available: false, binary: null, guidance };
}

export function runCommand(
	command: string,
	args: string[] = [],
	options?: { cwd?: string; shell?: boolean; input?: string },
): CommandRunResult {
	const result = spawnSync(command, args, {
		cwd: options?.cwd ?? ROOT_DIR,
		encoding: "utf8",
		shell: options?.shell ?? false,
		input: options?.input,
	});

	const stdout = normalizeOutput(result.stdout);
	const stderr = normalizeOutput(result.stderr);
	const combined = [stdout, stderr].filter(Boolean).join("\n").trim();

	return {
		ok: result.status === 0,
		stdout,
		stderr,
		combined,
		exitCode: result.status,
		command,
		args,
	};
}

export function runShellCommand(
	command: string,
	cwd = ROOT_DIR,
): CommandRunResult {
	try {
		const stdout = execSync(command, {
			cwd,
			shell: true,
			encoding: "utf8",
			maxBuffer: 10 * 1024 * 1024,
		} as any);
		return {
			ok: true,
			stdout,
			stderr: "",
			combined: stdout.trim(),
			exitCode: 0,
			command,
			args: [],
		};
	} catch (error: any) {
		const stdout = normalizeOutput(error?.stdout);
		const stderr = normalizeOutput(error?.stderr);
		const message =
			typeof error?.message === "string" ? error.message : String(error);
		const combined = [message, stdout, stderr]
			.filter(Boolean)
			.join("\n")
			.trim();
		return {
			ok: false,
			stdout,
			stderr,
			combined,
			exitCode: typeof error?.status === "number" ? error.status : null,
			command,
			args: [],
		};
	}
}

export function runPowerShellScript(
	scriptPath: string,
	scriptArgs: string[] = [],
	options?: { cwd?: string },
): CommandRunResult {
	const availability = getPowerShellAvailability();
	if (!availability.available || !availability.binary) {
		const message = [
			`PowerShell script unavailable: ${scriptPath}`,
			availability.guidance,
		]
			.filter(Boolean)
			.join("\n");

		return {
			ok: false,
			stdout: "",
			stderr: message,
			combined: message,
			exitCode: null,
			command: availability.binary ?? "pwsh",
			args: scriptArgs,
		};
	}

	const binary = availability.binary;
	const args =
		binary === "powershell"
			? ["-ExecutionPolicy", "Bypass", "-File", scriptPath, ...scriptArgs]
			: ["-NoProfile", "-File", scriptPath, ...scriptArgs];

	return runCommand(binary, args, { cwd: options?.cwd ?? ROOT_DIR });
}

/**
 * Standardized Execution Layer for Sovereign Tools
 */
export function executeSovereignTool(
	toolName: string,
	command: string,
	metadata: any = {},
): ExecutionResult {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();
	const shellResult = runShellCommand(command, ROOT_DIR);
	const durationMs = Date.now() - startTime;

	const result: ExecutionResult = {
		tool: toolName,
		timestamp,
		durationMs,
		status: shellResult.ok ? "success" : "failure",
		output: shellResult.combined,
		metadata,
	};

	const reportDir = path.join(ROOT_DIR, "reports");
	if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

	const reportFileName = `${toolName}_${timestamp.replace(/[:.]/g, "-")}.json`;
	fs.writeFileSync(
		path.join(reportDir, reportFileName),
		JSON.stringify(result, null, 2),
		"utf-8",
	);

	return result;
}

export function getPlatformDescriptor() {
	return {
		os: process.platform,
		release: os.release(),
		arch: process.arch,
		powerShell: getPowerShellAvailability(),
	};
}
