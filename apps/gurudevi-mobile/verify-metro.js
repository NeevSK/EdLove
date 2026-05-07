const path = require("node:path");
const fs = require("node:fs");

const _projectRoot =
	"c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile";
const workspaceRoot = "c:/Users/Naween/projects/polymath-platform";

// 1. DISCOVERY LOGIC
const INTERNAL_PACKAGE_MAPPINGS = {};
const packagesDir = path.resolve(workspaceRoot, "packages");
if (fs.existsSync(packagesDir)) {
	fs.readdirSync(packagesDir).forEach((dir) => {
		const pkgJsonPath = path.join(packagesDir, dir, "package.json");
		if (fs.existsSync(pkgJsonPath)) {
			try {
				const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
				if (pkgJson.name) {
					INTERNAL_PACKAGE_MAPPINGS[pkgJson.name] = path.resolve(
						packagesDir,
						dir,
					);
				}
			} catch (e) {
				console.warn(`[Verification] ⚠️ Failed for ${dir}:`, e.message);
			}
		}
	});
}

console.log("--- Internal Package Mappings Discovered ---");
const testPkgs = ["@repo/core", "@repo/ui", "@intuitui-labs/lk-edu-geo"];
testPkgs.forEach((pkg) => {
	console.log(`${pkg} -> ${INTERNAL_PACKAGE_MAPPINGS[pkg] || "NOT FOUND"}`);
});

console.log("\n--- Resolution Examples ---");
// Mocking how Metro would respond given these extraNodeModules
const mockResolve = (moduleName) => {
	for (const pkgName in INTERNAL_PACKAGE_MAPPINGS) {
		if (moduleName === pkgName) return INTERNAL_PACKAGE_MAPPINGS[pkgName];
		if (moduleName.startsWith(`${pkgName}/`)) {
			const sub = moduleName.slice(pkgName.length + 1);
			return path.join(INTERNAL_PACKAGE_MAPPINGS[pkgName], sub);
		}
	}
	return "EXTERNAL_OR_NOT_FOUND";
};

console.log("@repo/core ->", mockResolve("@repo/core"));
console.log(
	"@repo/core/workspace/layout ->",
	mockResolve("@repo/core/workspace/layout"),
);
console.log(
	"@intuitui-labs/lk-edu-geo ->",
	mockResolve("@intuitui-labs/lk-edu-geo"),
);
