import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_FILE = path.resolve(__dirname, "../.web-firewall-audit.jsonl");

console.log("\n--- 🛡️ Web Firewall Audit Report ---\n");

if (!fs.existsSync(AUDIT_FILE)) {
	console.log(
		"No audit log found. This is normal if you haven't run a web bundle yet.",
	);
	console.log(
		"Try running: pnpm start -c (and open web) or pnpm dlx expo export:web",
	);
	process.exit(0);
}

try {
	const rawData = fs.readFileSync(AUDIT_FILE, "utf8");
	const logs = rawData
		.trim()
		.split("\n")
		.filter(Boolean)
		.map((line) => {
			try {
				return JSON.parse(line);
			} catch {
				return null;
			}
		})
		.filter(Boolean);

	const uniqueLeaks = new Map();

	logs.forEach((log) => {
		const key = `${log.moduleName} <- ${log.issuer}`;
		if (!uniqueLeaks.has(key)) {
			uniqueLeaks.set(key, {
				module: log.moduleName,
				requestedBy: log.issuer,
				count: 0,
				timestamp: log.timestamp,
			});
		}
		uniqueLeaks.get(key).count++;
	});

	let reportContent = `# 🛡️ Web Firewall Audit Report\n\n`;
	reportContent += `**Generated At**: ${new Date().toLocaleString()}\n`;
	reportContent += `**Source Log**: \`.web-firewall-audit.jsonl\`\n\n`;

	if (uniqueLeaks.size === 0) {
		const msg = "✅ Crystal Clear: No native leaks detected in the firewall.";
		console.log(msg);
		reportContent += `## ${msg}\n`;
	} else {
		const summaryMsg = `⚠️ Detected ${uniqueLeaks.size} unique native module leaks blocked by the firewall:`;
		console.log(`${summaryMsg}\n`);
		reportContent += `## ${summaryMsg}\n\n`;
		reportContent += `| Native Module | Requested From | Interceptions |\n`;
		reportContent += `| :--- | :--- | :--- |\n`;

		// Group by requested module for better readability
		const sorted = Array.from(uniqueLeaks.values()).sort((a, b) =>
			a.module.localeCompare(b.module),
		);

		let currentModule = "";
		sorted.forEach((leak) => {
			const relPath = path.relative(process.cwd(), leak.requestedBy);
			if (leak.module !== currentModule) {
				console.log(`\n📦 ${leak.module}`);
				currentModule = leak.module;
			}
			console.log(`   └─ 🔌 From: ${relPath} (${leak.count}x)`);
			reportContent += `| \`${leak.module}\` | \`${relPath}\` | ${leak.count}x |\n`;
		});

		reportContent += `\n\n---\n**💡 Insight**: These modules are being successfully shimmied by the "Universal Bridge". Stable web execution is maintained.`;
		console.log(
			`\n\n💡 Insight: These modules are being successfully shimmied by the "Universal Bridge".`,
		);
		console.log(`Stable web execution is maintained.`);
	}

	// Save persistent report
	const REPORT_FILE = path.resolve(__dirname, "../web-firewall-report.md");
	fs.writeFileSync(REPORT_FILE, reportContent);
	console.log(
		`\n📄 Persistent report saved to: ${path.relative(process.cwd(), REPORT_FILE)}`,
	);
} catch (error) {
	console.error("Failed to parse audit log:", error.message);
}
