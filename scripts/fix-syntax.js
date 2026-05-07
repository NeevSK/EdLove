const fs = require("node:fs");
const path = require("node:path");

const targetDirs = [
	"packages/admin/src",
	"apps/gurudevi-mobile/src",
	"packages/self/src",
];

function fixFile(filePath) {
	let content = fs.readFileSync(filePath, "utf8");
	const original = content;

	// 1. Fix => > corruption
	content = content.replace(/=>\s+>/g, "=>");

	// 2. Fix missing spaces in imports/types
	content = content.replace(/\}from/g, "} from");

	// 3. Fix double =>
	content = content.replace(/=>\s*=>/g, "=>");

	if (content !== original) {
		fs.writeFileSync(filePath, content);
		console.log(`[FIXED] ${filePath}`);
	}
}

function processDir(dir) {
	if (!fs.existsSync(dir)) return;
	const files = fs.readdirSync(dir);
	files.forEach((file) => {
		const fullPath = path.join(dir, file);
		const stats = fs.statSync(fullPath);
		if (stats.isDirectory()) {
			processDir(fullPath);
		} else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
			fixFile(fullPath);
		}
	});
}

targetDirs.forEach(processDir);
console.log("Syntax fix complete.");
