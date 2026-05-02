import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const shouldSuppress = args.includes("--suppress");

console.log(
	"🧹 Step 1: Running ESLint and Prettier to auto-fix stylistic & basic type errors...",
);
try {
	// Attempt to automatically fix everything it can
	execSync("pnpm run lint -- --fix", { stdio: "inherit" });
	execSync("pnpm run format", { stdio: "inherit" });
} catch (_e) {
	console.log(
		"⚠️ Some lint errors could not be auto-fixed by ESLint, moving on to TypeScript check...",
	);
}

console.log("\n🔍 Step 2: Running TypeScript strict check...");
let tscOutput = "";
try {
	// We run turbo check-types to leverage caching and workspace configuration
	tscOutput = execSync("pnpm run check-types", { encoding: "utf8" });
	console.log("✅ TypeScript check passed! No errors found.");
	process.exit(0);
} catch (e) {
	tscOutput = e.stdout || e.message;
	console.log("❌ Found TypeScript errors.");
}

// Save output specifically encoded in UTF-8 per user's global rule
writeFileSync("tsc-errors.txt", tscOutput, "utf8");
console.log('📄 Errors saved to "tsc-errors.txt" encoded in utf-8.');

if (!shouldSuppress) {
	console.log("\n🛑 PIPELINE PAUSED:");
	console.log(
		'1. You can now prompt me (Antigravity): "Fix the errors in tsc-errors.txt fully."',
	);
	console.log(
		"2. OR, if you are completely blocked and need to push NOW, run:",
	);
	console.log("   pnpm run ai:fix --suppress");
	process.exit(1);
}

// Step 3: Only run suppression if explicitly requested
console.log(
	"\n☢️ Step 3: --suppress flag detected. Running automated TS suppressions as a last resort...",
);
try {
	// Runs the suppression script on the entire workspace to get you unblocked
	execSync("pnpm dlx ts-migrate-scripts ts-ignore .", { stdio: "inherit" });
	console.log(
		"✅ All remaining errors have been suppressed with // @ts-expect-error",
	);
	console.log("🚀 You are unblocked to commit!");
} catch (_e) {
	console.error(
		"⚠️ Failed to run suppression script. You may need to run: pnpm install -D ts-migrate-scripts",
	);
	process.exit(1);
}
