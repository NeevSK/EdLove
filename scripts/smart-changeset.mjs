import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Smart Changeset Generator
 * Uses staged changes and current intent to automate versioning.
 */

const args = process.argv.slice(2);
const isStagedMode = args.includes("--staged");
const manualMessage = args.find((a) => !a.startsWith("--"));

console.log("🤖 Discovery: Analyzing impact for Smart Changeset...");

// 1. Determine which commit/changes to analyze
// If --staged, we check current staged changes. Otherwise, we check the last commit.
const diffCmd = isStagedMode
	? "git diff --name-only --cached"
	: "git diff --name-only HEAD~1";
const changedFiles = execSync(diffCmd, { encoding: "utf8" })
	.split("\n")
	.filter(Boolean);

// 2. Determine the "Intent" (message)
const intentMessage =
	manualMessage ||
	(isStagedMode
		? "Work in progress"
		: execSync('git log -1 --pretty=format:"%s"', { encoding: "utf8" }));

// 3. Identify which packages were touched
const packagesTouched = new Set();
changedFiles.forEach((file) => {
	if (file.startsWith("packages/")) {
		const pkg = file.split("/")[1];
		packagesTouched.add(`@repo/${pkg}`);
	} else if (file.startsWith("apps/")) {
		const app = file.split("/")[1];
		packagesTouched.add(app);
	}
});

if (packagesTouched.size === 0) {
	console.log("ℹ️ No internal packages touched. Skipping versioning intent.");
	process.exit(0);
}

// 4. Determine Bump Type from Message
let bumpType = "patch";
if (intentMessage.startsWith("feat")) bumpType = "minor";
if (intentMessage.includes("!") || intentMessage.includes("BREAKING CHANGE"))
	bumpType = "major";

console.log(`📝 Detected Bump: ${bumpType.toUpperCase()}`);
console.log(`📦 Target Packages: ${Array.from(packagesTouched).join(", ")}`);

// 5. Generate Changeset File
const timestamp = Date.now();
const changesetPath = path.join(
	process.cwd(),
	".changeset",
	`smart-${timestamp}.md`,
);

const changesetContent = `---
${Array.from(packagesTouched)
	.map((pkg) => `"${pkg}": ${bumpType}`)
	.join("\n")}
---

${intentMessage}
`;

fs.writeFileSync(changesetPath, changesetContent);
console.log(`✅ Smart Changeset created: .changeset/smart-${timestamp}.md`);
