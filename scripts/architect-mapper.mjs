import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, "..");

const targetPath = process.argv[2] || ".";
const absoluteTarget = path.resolve(ROOT_DIR, targetPath);

if (!fs.existsSync(absoluteTarget)) {
	console.error(`Target path not found: ${targetPath}`);
	process.exit(1);
}

const TIMESTAMP = new Date().toISOString();

// Rule Definitions & Remedies
const RULES = [
	{
		id: "SOVEREIGN_CORE",
		name: "Sovereign Core Purity",
		description: "Logic folders must not import UI or Native-specific modules.",
		pattern: /from\s+['"](react-native|expo-.*?)['"]/,
		folders: ["logic", "services", "utils", "api"],
		remedy:
			'Move platform-specific logic to an Adapter or Runtime layer. Ensure the Core remains "Headless."',
		severity: "CRITICAL",
	},
	{
		id: "ATOMIC_UI",
		name: "Atomic UI Adherence",
		description:
			"Avoid using raw React Native primitives (View, Text) in feature folders.",
		pattern: /import\s+.*?\{.*?(View|Text).*?\}\s+from\s+['"]react-native['"]/,
		folders: ["screens", "features", "ManagementStation"],
		remedy:
			"Replace raw primitives with @repo/ui components (Box, HStack, Center, Typography).",
		severity: "HIGH",
	},
	{
		id: "POA_FLOW",
		name: "POA Implementation Gap",
		description:
			"Domains should have a clearly defined Contract and POA Proxy.",
		check: (dir) => {
			const isDomain = dir.includes("domains/");
			if (!isDomain) return null;
			const hasContract = fs.existsSync(path.join(dir, "contracts"));
			const files = fs.readdirSync(dir);
			const hasProxy = files.some(
				(f) => f.includes("poaProxy") || f.includes("Proxy"),
			);
			if (!hasContract || !hasProxy) {
				return `Missing ${!hasContract ? "contracts/" : ""} ${!hasProxy ? "POA Proxy" : ""}`;
			}
			return null;
		},
		remedy:
			"Consult docs/architecture/POA_IMPLEMENTATION_GUIDE.md to establish the required layers.",
		severity: "HIGH",
	},
	{
		id: "LIST_PERFORMANCE",
		name: "Performance Regressions",
		description: "Legacy FlatList found in a data-rich registry.",
		pattern: /import\s+.*?\{.*?(FlatList).*?\}\s+from\s+['"]react-native['"]/,
		folders: ["screens", "features"],
		remedy:
			"Migrate to @shopify/flash-list for superior performance and reduced memory footpint.",
		severity: "MEDIUM",
	},
];

function scanFile(filePath) {
	const content = fs.readFileSync(filePath, "utf-8");
	const relativePath = path.relative(ROOT_DIR, filePath);
	const violations = [];

	for (const rule of RULES) {
		if (!rule.pattern) continue;

		const isInTargetFolder =
			!rule.folders || rule.folders.some((f) => relativePath.includes(f));
		if (!isInTargetFolder) continue;

		if (content.match(rule.pattern)) {
			violations.push({
				ruleId: rule.id,
				ruleName: rule.name,
				description: rule.description,
				remedy: rule.remedy,
				severity: rule.severity,
			});
		}
	}
	return violations;
}

function auditPackage(dirPath) {
	const report = {
		summary: {
			critical: 0,
			high: 0,
			medium: 0,
			totalFiles: 0,
			score: 100,
		},
		violations: [],
	};

	function walk(curr) {
		const items = fs.readdirSync(curr);
		for (const item of items) {
			const fullPath = path.join(curr, item);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				if (item === "node_modules" || item === ".git") continue;

				// Rule-based directory checks
				for (const rule of RULES) {
					if (rule.check) {
						const error = rule.check(fullPath);
						if (error) {
							report.violations.push({
								file: path.relative(ROOT_DIR, fullPath),
								ruleId: rule.id,
								ruleName: rule.name,
								message: error,
								remedy: rule.remedy,
								severity: rule.severity,
							});
							report.summary[rule.severity.toLowerCase()]++;
						}
					}
				}
				walk(fullPath);
			} else if (stat.isFile() && item.match(/\.(ts|tsx)$/)) {
				report.summary.totalFiles++;
				const fileViolations = scanFile(fullPath);
				fileViolations.forEach((v) => {
					report.violations.push({
						file: path.relative(ROOT_DIR, fullPath),
						...v,
					});
					report.summary[v.severity.toLowerCase()]++;
				});
			}
		}
	}

	walk(dirPath);

	// Simple scoring logic
	const deduction =
		report.summary.critical * 10 +
		report.summary.high * 5 +
		report.summary.medium * 2;
	report.summary.score = Math.max(0, 100 - deduction);

	return report;
}

const audit = auditPackage(absoluteTarget);

// Formatting Output
console.log(`# Sovereign Architecture Analysis`);
console.log(`**Timestamp:** ${TIMESTAMP}`);
console.log(`**Target:** \`${targetPath}\``);
console.log(`\n## 📊 Analysis Summary`);
console.log(`- **Architectural Maturity Score:** ${audit.summary.score}/100`);
console.log(`- **Total Files Audited:** ${audit.summary.totalFiles}`);
console.log(`- **Critical Violations:** ${audit.summary.critical}`);
console.log(`- **High Severity:** ${audit.summary.high}`);
console.log(`- **Medium Severity:** ${audit.summary.medium}`);

console.log(`\n## 🔍 Top Misalignments & Remedies`);

const grouped = audit.violations.reduce((acc, v) => {
	if (!acc[v.ruleId])
		acc[v.ruleId] = { name: v.ruleName, remedy: v.remedy, files: [] };
	acc[v.ruleId].files.push(v.file);
	return acc;
}, {});

Object.keys(grouped).forEach((id) => {
	const g = grouped[id];
	console.log(`\n### [${id}] ${g.name}`);
	console.log(`> **Remedy:** ${g.remedy}`);
	console.log(`\n**Affected Files (${g.files.length}):**`);
	g.files.slice(0, 10).forEach((f) => console.log(`- \`${f}\``));
	if (g.files.length > 10)
		console.log(`- *...and ${g.files.length - 10} more*`);
});

if (audit.violations.length === 0) {
	console.log(
		"\n✅ **Zero-Legacy Alignment Detected.** This package fully satisfies the mapped architectural goals.",
	);
}

console.log(
	`\n---\n*Report generated by Platform-MCP Sovereign Architect Mapper*`,
);
