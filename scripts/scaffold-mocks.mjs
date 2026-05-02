import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const targetArg = process.argv[2];
if (!targetArg) {
	console.error("Usage: node scripts/scaffold-mocks.mjs <file_path>");
	process.exit(1);
}

const targetPath = path.isAbsolute(targetArg)
	? targetArg
	: path.join(rootDir, targetArg);

async function scaffoldMocks() {
	if (!fs.existsSync(targetPath)) {
		console.error(`❌ Target file not found: ${targetPath}`);
		process.exit(1);
	}

	const content = fs.readFileSync(targetPath, "utf8");
	const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;

	let match;
	const mocks = [];

	while ((match = importRegex.exec(content)) !== null) {
		const importPath = match[1];

		// Scaffolding mocks for internal packages or relative domain logic
		if (importPath.startsWith("@repo/") || importPath.startsWith(".")) {
			mocks.push(importPath);
		}
	}

	if (mocks.length === 0) {
		console.log("ℹ️ No internal or relative imports found to mock.");
		return;
	}

	const mockContent = `/**\n * AUTO-GENERATED MOCK SCAFFOLD\n * Based on: ${path.relative(rootDir, targetPath)}\n */\n\nimport { vi } from 'vitest';\n\n${mocks.map((m) => `vi.mock('${m}', () => ({\n  // TODO: Add mocked exports for ${m}\n}));`).join("\n\n")}\n`;

	const fileName = path
		.basename(targetPath)
		.replace(/\.(ts|tsx|js|jsx)$/, ".mock.ts");
	const outputPath = path.join(path.dirname(targetPath), fileName);

	fs.writeFileSync(outputPath, mockContent);
	console.log(
		`✅ Mock scaffold created at ${path.relative(rootDir, outputPath)}`,
	);
}

scaffoldMocks().catch((err) => {
	console.error(`❌ Failure: ${err.message}`);
	process.exit(1);
});
