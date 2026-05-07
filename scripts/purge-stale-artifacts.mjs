import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AlchemistExecution } from "./utils/execution.mjs";

/**
 * SOVEREIGN PURGE: Stale Artifact Cleaner
 *
 * Purpose: Keeps the monorepo sleek by removing old reports, logs, and temp files.
 * Logic:
 *  - Targets specific "Volatile" directories.
 *  - Cleans based on age (default: 7 days) and file extension.
 *  - Preservation: Skips white-listed files and persistent docs.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const execution = new AlchemistExecution("purge_stale_artifacts");

const CONFIG = {
	targets: [
		{ dir: "reports", extensions: [".json", ".md", ".txt", ".log"] },
		{ dir: "logs", extensions: [".log", ".txt"] },
		{ dir: "tmp", extensions: ["*"] },
		{ dir: "scripts/reports", extensions: [".json", ".md", ".txt"] },
	],
	whitelist: [".gitkeep", "README.md", "summary.md"],
	maxAgeDays: 7,
};

async function run() {
	execution.start();

	const isDryRun = process.argv.includes("--dry-run");
	const customAge = process.argv
		.find((arg) => arg.startsWith("--age="))
		?.split("=")[1];
	const maxAge =
		(customAge ? parseInt(customAge, 10) : CONFIG.maxAgeDays) *
		24 *
		60 *
		60 *
		1000;

	const results = {
		deleted: [],
		savedSize: 0,
		errors: [],
		dryRun: isDryRun,
	};

	try {
		const now = Date.now();

		for (const target of CONFIG.targets) {
			const targetPath = path.join(ROOT, target.dir);
			if (!fs.existsSync(targetPath)) continue;

			const files = fs.readdirSync(targetPath);
			for (const file of files) {
				if (CONFIG.whitelist.includes(file)) continue;

				const filePath = path.join(targetPath, file);
				const stats = fs.statSync(filePath);

				if (stats.isDirectory()) continue;

				const isExpired = now - stats.mtimeMs > maxAge;
				const matchesExt =
					target.extensions.includes("*") ||
					target.extensions.includes(path.extname(file));

				if (isExpired && matchesExt) {
					if (!isDryRun) {
						fs.unlinkSync(filePath);
						results.deleted.push({
							file: path.join(target.dir, file),
							size: stats.size,
						});
					} else {
						results.deleted.push({
							file: path.join(target.dir, file),
							size: stats.size,
							status: "dry-run",
						});
					}
					results.savedSize += stats.size;
				}
			}
		}

		console.log(`\n🧹 Sovereign Purge ${isDryRun ? "(DRY RUN)" : ""}`);
		console.log(`-------------------------------------------`);
		console.log(`🗑️  Files Removed: ${results.deleted.length}`);
		console.log(
			`💾 Space Reclaimed: ${(results.savedSize / 1024).toFixed(2)} KB`,
		);
		console.log(`📅 Age Threshold: ${maxAge / (24 * 60 * 60 * 1000)} days\n`);

		if (results.deleted.length > 0) {
			console.log(`Recent Purges:`);
			results.deleted
				.slice(0, 10)
				.forEach((d) =>
					console.log(`- ${d.file} (${(d.size / 1024).toFixed(2)} KB)`),
				);
		}

		await execution.complete(results);
	} catch (error) {
		console.error(error);
		await execution.fail(error);
		process.exit(1);
	}
}

run();
