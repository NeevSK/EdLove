import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, "..");

const PACKAGE_DIRS = ["packages", "apps"];

function getPackages() {
	const packages = {};
	for (const dir of PACKAGE_DIRS) {
		const fullDir = path.join(ROOT_DIR, dir);
		if (!fs.existsSync(fullDir)) continue;

		const items = fs.readdirSync(fullDir);
		for (const item of items) {
			const pkgPath = path.join(fullDir, item, "package.json");
			if (fs.existsSync(pkgPath)) {
				try {
					const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
					packages[pkg.name] = {
						name: pkg.name,
						dir: dir,
						folder: item,
						dependencies: Object.keys(pkg.dependencies || {}),
						devDependencies: Object.keys(pkg.devDependencies || {}),
					};
				} catch (e) {
					// Skip invalid package.json
				}
			}
		}
	}
	return packages;
}

function generateMermaid(packages) {
	let mermaid = "graph TD\n";
	const internalNames = Object.keys(packages);

	// Define Styles
	mermaid += "  classDef app fill:#e1f5fe,stroke:#01579b,stroke-width:2px;\n";
	mermaid += "  classDef core fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;\n";
	mermaid += "  classDef ui fill:#fff3e0,stroke:#e65100,stroke-width:2px;\n";
	mermaid +=
		"  classDef violation stroke:#f44336,stroke-width:4px,stroke-dasharray: 5 5;\n";

	for (const pkgName of internalNames) {
		const pkg = packages[pkgName];
		const shortName = pkgName.replace("@repo/", "");
		const safeId = shortName.replace(/[^a-zA-Z0-9]/g, "_");

		// Assign classes
		if (pkg.dir === "apps") {
			mermaid += `  ${safeId}["📱 ${shortName}"]:::app\n`;
		} else if (shortName === "ui" || shortName === "graphics") {
			mermaid += `  ${safeId}["🎨 ${shortName}"]:::ui\n`;
		} else {
			mermaid += `  ${safeId}["⚙️ ${shortName}"]:::core\n`;
		}

		const allDeps = [...pkg.dependencies, ...pkg.devDependencies];
		for (const dep of allDeps) {
			if (internalNames.includes(dep)) {
				const depShortName = dep.replace("@repo/", "");
				const depSafeId = depShortName.replace(/[^a-zA-Z0-9]/g, "_");

				// Check for boundary violations
				// Violation: Core depending on UI
				const isCore =
					pkg.dir === "packages" && !["ui", "graphics"].includes(shortName);
				const isUIDep = ["ui", "graphics"].includes(depShortName);

				if (isCore && isUIDep) {
					mermaid += `  ${safeId} -- "❌ VIOLATION" --> ${depSafeId}\n`;
					mermaid += `  class ${safeId} violation\n`;
				} else {
					mermaid += `  ${safeId} --> ${depSafeId}\n`;
				}
			}
		}
	}

	return mermaid;
}

const packages = getPackages();
const mermaid = generateMermaid(packages);

console.log("# Sovereign Skeleton Lens");
console.log("Visualizing monorepo boundaries and dependency flow.");
console.log("\n```mermaid");
console.log(mermaid);
console.log("```");

console.log("\n## 🧐 Lens Interpretation");
console.log("- **📱 Blue**: Applications (Consumer Layer)");
console.log("- **⚙️ Purple**: Core Logic / Services (Headless Layer)");
console.log("- **🎨 Orange**: UI / Graphics (Presentation Layer)");
console.log(
	"- **❌ Red Dashed**: Boundary Violation (Circular or Illegal dependency)",
);

console.log("\n## 🛡️ Sovereign Rules");
console.log("1. **Apps** can depend on anything.");
console.log("2. **Core** can only depend on other Core packages.");
console.log("3. **UI** can depend on Core, but never vice-versa.");
