import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const selfRoot = path.join(repoRoot, "packages", "self", "src");
const allowedSupabaseFiles = new Set([
	path.join(selfRoot, "api", "dailyContent.ts"),
	path.join(selfRoot, "api", "self.ts"),
	path.join(selfRoot, "api", "selfFeatureRepository.ts"),
	path.join(selfRoot, "api", "selfInsightsRepository.ts"),
	path.join(selfRoot, "api", "wellbeingRepository.ts"),
]);

const violations = [];

function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath);
			continue;
		}
		if (!/\.(ts|tsx)$/.test(entry.name)) continue;

		const source = fs.readFileSync(fullPath, "utf8");

		if (source.includes("core/src") || source.includes("packages/core/src")) {
			violations.push({
				file: path.relative(repoRoot, fullPath),
				reason: "Cross-package deep import into core internals.",
			});
		}

		const hasDirectSupabase = /\bsupabase\.(from|channel|storage)\b/.test(
			source,
		);
		if (hasDirectSupabase && !allowedSupabaseFiles.has(fullPath)) {
			violations.push({
				file: path.relative(repoRoot, fullPath),
				reason:
					"Direct Supabase usage outside the self API/repository boundary.",
			});
		}
	}
}

walk(selfRoot);

if (violations.length > 0) {
	console.error(JSON.stringify({ ok: false, violations }, null, 2));
	process.exitCode = 1;
} else {
	console.log(JSON.stringify({ ok: true }, null, 2));
}
