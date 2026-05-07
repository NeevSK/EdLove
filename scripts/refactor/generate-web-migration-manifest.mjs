import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const appScreensDir = path.join(
	repoRoot,
	"apps",
	"gurudevi-mobile",
	"src",
	"screens",
);
const manifestPath = path.join(
	repoRoot,
	"apps",
	"gurudevi-mobile",
	"docs",
	"school_erp",
	"web-mobile-package-migration.manifest.json",
);

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(fullPath));
			continue;
		}
		if (entry.isFile() && /\.web\.(ts|tsx)$/.test(entry.name)) {
			files.push(fullPath);
		}
	}
	return files;
}

function normalize(filePath) {
	return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function guessOwner(filePath) {
	const normalized = normalize(filePath);
	if (normalized.includes("/self/")) return "@repo/self";
	if (normalized.includes("/profile/")) return "@repo/profile";
	if (normalized.includes("/library/")) return "@repo/library";
	if (normalized.includes("/classroom/FormBuilder"))
		return "@repo/form-builder";
	if (normalized.includes("/classroom/PublicForm")) return "@repo/form-builder";
	if (
		normalized.includes("/classroom/views/principal/") ||
		normalized.includes("PrincipalSchoolView.web.tsx")
	) {
		return "@repo/admin";
	}
	if (normalized.includes("/classroom/views/Teacher")) return "@repo/classroom";
	return "REVIEW_REQUIRED";
}

const reviewedManifest = fs.existsSync(manifestPath)
	? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
	: { entries: [] };

const reviewedEntries = new Map(
	(reviewedManifest.entries ?? []).map((entry) => [entry.source, entry]),
);

const report = walk(appScreensDir).map((filePath) => {
	const source = normalize(filePath);
	const existing = reviewedEntries.get(source);
	return {
		source,
		reviewed: !!existing,
		ownerPackage: existing?.ownerPackage ?? guessOwner(filePath),
		target: existing?.target ?? "",
		adapterRequired: existing?.adapterRequired ?? true,
		codemodStatus: existing?.codemodStatus ?? "pending",
	};
});

console.log(JSON.stringify(report, null, 2));
