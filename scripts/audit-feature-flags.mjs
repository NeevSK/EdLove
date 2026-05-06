import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const enginePath = path.join(
	rootDir,
	"packages/core/src/logic/permissions/feature-engine.ts",
);

async function auditFlags() {
	if (!fs.existsSync(enginePath)) {
		console.error(`❌ Feature engine not found at ${enginePath}`);
		process.exit(1);
	}

	const content = fs.readFileSync(enginePath, "utf8");

	// 1. Extract the FeatureFlags interface
	const interfaceMatch = content.match(
		/export interface FeatureFlags {([\s\S]*?)}/,
	);
	if (!interfaceMatch) {
		console.error("❌ Could not find FeatureFlags interface.");
		process.exit(1);
	}

	const flags = interfaceMatch[1]
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("//"))
		.map((line) => line.split(":")[0].trim());

	console.log(`🔍 Found ${flags.length} potential feature flags.`);

	// 2. Identify "Stable" flags (defaulted to true in resolveFeatureFlags)
	const resolveMatch = content.match(
		/const flags: FeatureFlags = {([\s\S]*?)};/,
	);
	const defaults = {};
	if (resolveMatch) {
		resolveMatch[1].split("\n").forEach((line) => {
			const match = line.match(/(\w+):\s*(true|false),?/);
			if (match) defaults[match[1]] = match[2] === "true";
		});
	}

	const staleFlags = [];
	for (const flag of flags) {
		const isDefaultTrue = defaults[flag] === true;

		// Check if there are any KILL_SWITCHES or ENV overrides that turn it false
		const hasKillSwitch = content.includes(
			`KILL_SWITCH_${flag.toUpperCase().replace(/IS|ENABLED/g, "")}`,
		);
		const hasEnvOverride = content.includes(
			`process.env.EXPO_PUBLIC_ENABLE_${flag.toUpperCase().replace(/IS|ENABLED/g, "")}`,
		);

		if (isDefaultTrue && !hasKillSwitch && !hasEnvOverride) {
			staleFlags.push(flag);
		}
	}

	console.log("\n--- 🚩 Stale Feature Flag Report ---");
	if (staleFlags.length === 0) {
		console.log("✅ No stale flags found. All flags appear dynamic.");
	} else {
		console.log(
			`⚠️ Found ${staleFlags.length} flags that are hardcoded to TRUE and lack remote kill-switches:`,
		);
		staleFlags.forEach((f) => console.log(`  - ${f}`));
		console.log(
			"\nRecommendation: Consider removing these flags and making the features permanent.",
		);
	}
}

auditFlags().catch((err) => {
	console.error(`❌ Failure: ${err.message}`);
	process.exit(1);
});
