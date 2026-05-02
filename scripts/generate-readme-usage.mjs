import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const packagePath = process.argv[2] || ".";
const absolutePackagePath = path.isAbsolute(packagePath)
	? packagePath
	: path.join(rootDir, packagePath);

async function generateUsage() {
	const indexPaths = [
		path.join(absolutePackagePath, "src/index.ts"),
		path.join(absolutePackagePath, "src/index.tsx"),
		path.join(absolutePackagePath, "index.ts"),
	];

	const indexPath = indexPaths.find((p) => fs.existsSync(p));
	if (!indexPath) {
		console.error(`❌ No entry point found in ${absolutePackagePath}`);
		process.exit(1);
	}

	const content = fs.readFileSync(indexPath, "utf8");
	const readmePath = path.join(absolutePackagePath, "README.md");

	if (!fs.existsSync(readmePath)) {
		console.error(`❌ No README.md found in ${absolutePackagePath}`);
		process.exit(1);
	}

	// Simple Regex for exports with JSDocs
	// This matches: /** jsdoc */ export (const|function|class) Name
	const exportRegex =
		/\/\*\*([\s\S]*?)\*\/[\r\n\s]*export\s+(?:const|function|class|interface|type)\s+(\w+)/g;

	let match;
	const usageSections = [];

	while ((match = exportRegex.exec(content)) !== null) {
		const doc = match[1].replace(/\n\s*\* ?/g, "\n").trim();
		const name = match[2];
		usageSections.push(`### \`${name}\`\n${doc}\n`);
	}

	if (usageSections.length === 0) {
		// Try matching exports without JSDocs as backup
		const simpleExportRegex =
			/export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
		while ((match = simpleExportRegex.exec(content)) !== null) {
			const name = match[1];
			if (!usageSections.some((s) => s.includes(`\`${name}\``))) {
				usageSections.push(`### \`${name}\`\n*No documentation provided.*\n`);
			}
		}
	}

	const usageMarkdown = `## Usage\n\n${usageSections.join("\n")}`;
	let readmeContent = fs.readFileSync(readmePath, "utf8");

	if (readmeContent.includes("## Usage")) {
		// Replace existing section
		readmeContent = readmeContent.replace(
			/## Usage[\s\S]*?(?=\n##|$)/,
			usageMarkdown,
		);
	} else {
		// Append to end
		readmeContent += `\n\n${usageMarkdown}`;
	}

	fs.writeFileSync(readmePath, readmeContent);
	console.log(
		`✅ Updated ${path.relative(rootDir, readmePath)} with ${usageSections.length} API entries.`,
	);
}

generateUsage().catch((err) => {
	console.error(`❌ Failure: ${err.message}`);
	process.exit(1);
});
