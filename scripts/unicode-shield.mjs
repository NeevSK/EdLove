#!/usr/bin/env node
/**
 * Unicode Shield: A utility to prevent mojibake/encoding corruption.
 * Replaces non-ASCII characters with stable \uXXXX escape sequences.
 */
import fs from "node:fs";
import path from "node:path";

function escapeNonAscii(text) {
	return text.replace(/[^\x00-\x7F]/g, (char) => {
		const hex = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
		return `\\u${hex}`;
	});
}

function processDirectory(dirPath) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			if (
				["node_modules", ".git", "dist", "build", ".next"].includes(entry.name)
			)
				continue;
			processDirectory(fullPath);
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name);
			if ([".tsx", ".ts", ".js", ".mjs", ".json", ".md"].includes(ext)) {
				const content = fs.readFileSync(fullPath, "utf8");
				const escaped = escapeNonAscii(content);

				if (content !== escaped) {
					console.log(`🛡️ Escaped: ${path.relative(process.cwd(), fullPath)}`);
					fs.writeFileSync(fullPath, escaped, "utf8");
				}
			}
		}
	}
}

const target = process.argv[2] || ".";
const absoluteTarget = path.resolve(process.cwd(), target);

if (!fs.existsSync(absoluteTarget)) {
	console.error(`❌ Path does not exist: ${target}`);
	process.exit(1);
}

const stats = fs.statSync(absoluteTarget);

if (stats.isFile()) {
	const content = fs.readFileSync(absoluteTarget, "utf8");
	const escaped = escapeNonAscii(content);
	if (content !== escaped) {
		console.log(`🛡️ Escaped: ${path.relative(process.cwd(), absoluteTarget)}`);
		fs.writeFileSync(absoluteTarget, escaped, "utf8");
	}
} else {
	console.log(`🛡️ Shielding non-ASCII in directory: ${absoluteTarget}`);
	processDirectory(absoluteTarget);
}

console.log("✅ Shielding complete.");
