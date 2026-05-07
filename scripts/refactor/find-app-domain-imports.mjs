import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const appSrcDir = path.join(repoRoot, "apps", "gurudevi-mobile", "src");
const packagePattern = /from\s+['"](@repo\/[^'"]+)['"]/g;
const forbiddenCorePattern =
	/from\s+['"]@repo\/core['"][\s\S]*?\b(supabase|api|growthSignalsAPI|impactRipplesAPI)\b|from\s+['"][^'"]*supabase[^'"]*['"]/g;

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) return walk(fullPath);
		if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) return [fullPath];
		return [];
	});
}

const report = walk(appSrcDir).map((filePath) => {
	const source = fs.readFileSync(filePath, "utf8");
	const packages = new Set();
	let match;
	while ((match = packagePattern.exec(source))) {
		packages.add(match[1]);
	}
	return {
		file: path.relative(repoRoot, filePath).replace(/\\/g, "/"),
		packages: [...packages].sort(),
		importsLowLevelDomainClient: forbiddenCorePattern.test(source),
	};
});

console.log(JSON.stringify(report, null, 2));
