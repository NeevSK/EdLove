#!/usr/bin/env node
/**
 * Forward-recovery helper for "missing special characters" corruption.
 *
 * Strategy:
 * - Run `tsc` for apps/gurudevi-mobile (noEmit, no incremental).
 * - Parse TypeScript diagnostics.
 * - Pick top files by *parse/syntax* errors.
 * - Apply high-confidence, local textual repairs:
 *   - Merge orphan lines that are only `>` or `/>` into the previous line.
 *   - Insert missing `>` / `/` tokens at the reported position for TS1005.
 *   - Self-close JSX tags for "no corresponding closing tag" when the file contains no `</Tag>`.
 *
 * This intentionally does NOT try to solve "type" errors; it focuses on getting the code to parse.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = process.cwd();
const appDir = path.join(repoRoot, "apps", "gurudevi-mobile");

function usageAndExit(code = 1) {
	console.error(
		[
			"Usage:",
			"  node scripts/recovery/fix-gurudevi-mobile-parse.mjs [--max-files 75] [--dry-run]",
			"    [--only-files pathA,pathB] [--only-web] [--skip-regex <regex>]",
			"    [--max-fixes-per-file 10] [--max-total-fixes 200]",
			"",
			"Notes:",
			"  - Runs `pnpm -C apps/gurudevi-mobile exec tsc --noEmit --pretty false --incremental false`.",
			"  - Edits only the files it chooses to fix in that pass.",
			"  - Use --only-files to heal files one-by-one (recommended).",
		].join("\n"),
	);
	process.exit(code);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) usageAndExit(0);

function getArgValue(flag, fallback) {
	const idx = args.indexOf(flag);
	if (idx === -1) return fallback;
	const v = args[idx + 1];
	if (!v || v.startsWith("-")) return fallback;
	return v;
}

const maxFiles = Number.parseInt(getArgValue("--max-files", "75"), 10);
if (!Number.isFinite(maxFiles) || maxFiles <= 0) {
	console.error(`Invalid --max-files: ${getArgValue("--max-files", "")}`);
	process.exit(1);
}
const dryRun = args.includes("--dry-run");
const onlyWeb = args.includes("--only-web");
const onlyFilesArg = getArgValue("--only-files", "");
const onlyFiles = onlyFilesArg
	? onlyFilesArg
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
	: null;
const skipRegexRaw = getArgValue("--skip-regex", "");
const skipRegex = skipRegexRaw ? new RegExp(skipRegexRaw) : null;

const maxFixesPerFile = Number.parseInt(
	getArgValue("--max-fixes-per-file", "10"),
	10,
);
if (!Number.isFinite(maxFixesPerFile) || maxFixesPerFile <= 0) {
	console.error(
		`Invalid --max-fixes-per-file: ${getArgValue("--max-fixes-per-file", "")}`,
	);
	process.exit(1);
}
const maxTotalFixes = Number.parseInt(
	getArgValue("--max-total-fixes", "200"),
	10,
);
if (!Number.isFinite(maxTotalFixes) || maxTotalFixes <= 0) {
	console.error(
		`Invalid --max-total-fixes: ${getArgValue("--max-total-fixes", "")}`,
	);
	process.exit(1);
}

function runTsc() {
	const pnpmArgs = [
		"-C",
		appDir,
		"exec",
		"tsc",
		"--noEmit",
		"--pretty",
		"false",
		"--incremental",
		"false",
	];

	const logPath = path.join(
		os.tmpdir(),
		`tsc-gurudevi-mobile-${Date.now()}.log`,
	);
	const fd = fs.openSync(logPath, "w");
	const res = spawnSync("pnpm", pnpmArgs, {
		stdio: ["ignore", fd, fd],
		env: process.env,
		shell: true,
		cwd: repoRoot,
	});
	fs.closeSync(fd);
	if (res.error) {
		return { exitCode: 1, output: String(res.error) };
	}
	const output = fs.readFileSync(logPath, "utf8");
	return { exitCode: res.status ?? 1, output };
}

function parseDiagnostics(tscOutput) {
	const diags = [];
	const lines = tscOutput.split(/\r?\n/);

	// Patterns:
	//   src/foo.tsx(10,5): error TS1005: '>' expected.
	//   C:/path/src/foo.tsx(10,5): error TS1005: ...
	const re = /^(.*)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.*)$/;

	for (const line of lines) {
		const m = line.match(re);
		if (!m) continue;
		const [, rawFile, rawLine, rawCol, rawCode, message] = m;
		const file = rawFile.trim();
		const lineNum = Number.parseInt(rawLine, 10);
		const colNum = Number.parseInt(rawCol, 10);
		const code = Number.parseInt(rawCode, 10);
		if (
			!file ||
			!Number.isFinite(lineNum) ||
			!Number.isFinite(colNum) ||
			!Number.isFinite(code)
		)
			continue;
		diags.push({
			file,
			line: lineNum,
			col: colNum,
			code,
			message: message.trim(),
		});
	}

	return diags;
}

const parseLikeCodes = new Set([
	1002, 1003, 1005, 1009, 1011, 1109, 1110, 1117, 1127, 1128, 1135, 1136, 1161,
	1434, 17008,
]);

function isParseLike(diag) {
	if (parseLikeCodes.has(diag.code)) return true;
	// Heuristic: many syntax errors are in the low 1xxx range; keep the filter conservative.
	if (diag.code >= 1000 && diag.code <= 2000) return true;
	if (diag.message.includes("has no corresponding closing tag")) return true;
	if (diag.message.includes("JSX expressions must have one parent element"))
		return true;
	return false;
}

function indexFromLineCol(text, oneBasedLine, oneBasedCol) {
	let line = 1;
	let col = 1;
	for (let i = 0; i < text.length; i++) {
		if (line === oneBasedLine && col === oneBasedCol) return i;
		const ch = text[i];
		if (ch === "\n") {
			line++;
			col = 1;
		} else {
			col++;
		}
	}
	return text.length;
}

function mergeOrphanAngleLines(text) {
	const lines = text.split(/\r?\n/);
	let changed = false;

	for (let i = 1; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (trimmed !== ">" && trimmed !== "/>") continue;

		// Find a reasonable "previous line" to merge into.
		let j = i - 1;
		while (j >= 0 && lines[j].trim() === "") j--;
		if (j < 0) continue;

		const prev = lines[j];
		const lastLt = prev.lastIndexOf("<");
		if (lastLt === -1) continue;
		const hasGtAfterLastLt = prev.indexOf(">", lastLt) !== -1;
		if (hasGtAfterLastLt) continue;

		lines[j] = prev + trimmed;
		lines.splice(i, 1);
		i--;
		changed = true;
	}

	return { text: lines.join("\n"), changed };
}

function fixMissingJsxAngles(text, maxOps = Number.POSITIVE_INFINITY) {
	const lines = text.split(/\r?\n/);
	let changed = false;
	let ops = 0;

	// Remove clearly-stray `>` that got inserted into object-literal props lines.
	// Example: `maxWidth: 400>` should be `maxWidth: 400`
	for (let i = 0; i < lines.length; i++) {
		if (ops >= maxOps) break;
		const line = lines[i];
		if (!line.trimEnd().endsWith(">")) continue;
		if (line.includes("<")) continue;
		if (!line.includes(":")) continue;
		if (/=>\s*$/.test(line)) continue;
		// avoid touching HTML strings
		const trimmed = line.trimEnd();
		// only when the trailing `>` is the last non-space char
		lines[i] = trimmed.slice(0, -1);
		changed = true;
		ops++;
	}

	// Remove stray `>` from lines that are clearly *not* JSX tags (common after naive token insertion).
	// Example: `}>` should usually be `}` inside JSX expressions.
	for (let i = 0; i < lines.length; i++) {
		if (ops >= maxOps) break;
		const line = lines[i];
		const trimmed = line.trimEnd();
		if (!trimmed.endsWith(">")) continue;
		if (line.includes("<")) continue;
		if (!/^\s*[}\])]/.test(trimmed)) continue;
		lines[i] = trimmed.slice(0, -1);
		changed = true;
		ops++;
	}

	// Fix *inline* split JSX tags on a single line where a `>` was stripped and two tags got jammed together.
	// Example:
	//   <Toast ... <ToastTitle>...</ToastTitle></Toast>
	// becomes:
	//   <Toast ...><ToastTitle>...</ToastTitle></Toast>
	// Keep this conservative: only on lines that start with a JSX tag.
	for (let i = 0; i < lines.length; i++) {
		if (ops >= maxOps) break;
		const line = lines[i];
		const trimmed = line.trimStart();
		if (!trimmed.startsWith("<")) continue;
		if (!/[<][A-Za-z]/.test(trimmed)) continue;
		if (trimmed.startsWith("</")) continue;

		let nextLine = line;
		let localOps = 0;
		// Insert `>` before a subsequent `<` or `</` when the first tag hasn't closed yet.
		// Limit repetitions to avoid runaway changes.
		for (let k = 0; k < 4; k++) {
			if (ops + localOps >= maxOps) break;
			const before = nextLine;
			nextLine = nextLine.replace(
				/(<[A-Za-z][\w.]*\b[^<>]*?)(\s+)(<\/*[A-Za-z])/g,
				"$1>$3",
			);
			if (nextLine === before) break;
			localOps++;
		}

		// Close `</Tag` when it is immediately followed by punctuation and no `>`.
		// Example: `</Toast                ),` -> `</Toast>),`
		for (let k = 0; k < 4; k++) {
			if (ops + localOps >= maxOps) break;
			const before = nextLine;
			nextLine = nextLine.replace(
				/(<\/[A-Za-z][\w.]*)(\s+)([),;\]])/g,
				"$1>$3",
			);
			if (nextLine === before) break;
			localOps++;
		}

		if (localOps > 0) {
			lines[i] = nextLine;
			changed = true;
			ops += localOps;
		}
	}

	// Fix single-line opening JSX tags that are missing the closing `>`.
	// Example:
	//   <VStack space="sm"
	//     <Text ...>
	// becomes:
	//   <VStack space="sm">
	for (let i = 0; i < lines.length; i++) {
		if (ops >= maxOps) break;
		const line = lines[i];
		const trimmed = line.trim();
		if (!/^\s*<[A-Za-z][\w.]*\b/.test(line)) continue;
		if (trimmed.startsWith("</")) continue;
		if (line.includes(">")) continue;
		if (trimmed.endsWith("{")) continue; // likely multiline props object start
		if (trimmed.endsWith("{{")) continue;

		let j = i + 1;
		while (j < lines.length && lines[j].trim() === "") j++;
		const next = j < lines.length ? lines[j].trim() : "";
		if (next === "") continue;

		const nextLooksLikeChild =
			next.startsWith("<") ||
			next.startsWith("{") ||
			next.startsWith("}") ||
			next.startsWith("return") ||
			next.startsWith("(") ||
			next.startsWith("[") ||
			next.startsWith(")") ||
			next.startsWith(";") ||
			/^[A-Za-z0-9'"]/.test(next);

		if (!nextLooksLikeChild) continue;

		lines[i] = `${line}>`;
		changed = true;
		ops++;
	}

	// 1) Fix obvious closing tags missing `>`: `</Text` -> `</Text>`
	for (let i = 0; i < lines.length; i++) {
		if (ops >= maxOps) break;
		const line = lines[i];
		const trimmed = line.trim();
		if (!trimmed.startsWith("</")) continue;
		if (trimmed.includes(">")) continue;
		// Avoid touching TS/JS generics like `</` in comments/strings; keep this very conservative.
		if (!/^\s*<\/[A-Za-z][\w.]*\s*$/.test(line)) continue;
		lines[i] = `${line}>`;
		changed = true;
		ops++;
	}

	// 2) Fix multiline opening tags whose closing `>` has been stripped.
	// We only close when the *next non-empty line* looks like it starts JSX children/new JSX/return close.
	let inTag = false;
	for (let i = 0; i < lines.length; i++) {
		if (ops >= maxOps) break;
		const line = lines[i];
		const trimmed = line.trim();

		if (!inTag) {
			// Start of an opening tag on this line?
			// Example: `<Box sx={{`
			// Avoid: `<` inside expressions by requiring line to start with optional whitespace then `<Ident`.
			if (!/^\s*<[A-Za-z][\w.]*\b/.test(line)) continue;
			if (trimmed.startsWith("</")) continue;
			if (line.includes(">")) continue;
			inTag = true;
			continue;
		}

		// We're in a tag continuation; if we already see `>` then we are done.
		if (line.includes(">")) {
			inTag = false;
			continue;
		}

		// If this line clearly closes an object-literal prop (common `sx={{ ... }}` pattern),
		// prefer closing the JSX tag *here*.
		if (/^\s*}}[),]*\s*$/.test(line)) {
			lines[i] = `${line}>`;
			changed = true;
			ops++;
			inTag = false;
			continue;
		}

		// Find next non-empty line (or end).
		let j = i + 1;
		while (j < lines.length && lines[j].trim() === "") j++;
		const next = j < lines.length ? lines[j] : "";
		const nextTrimmed = next.trim();

		const nextLooksLikeChildOrNewElement =
			nextTrimmed.startsWith("<") ||
			nextTrimmed.startsWith("{") ||
			nextTrimmed.startsWith(")") ||
			nextTrimmed.startsWith(";") ||
			nextTrimmed.startsWith("return");

		if (!nextLooksLikeChildOrNewElement) continue;

		// Close the tag on the current line.
		if (!trimmed.endsWith(">") && !trimmed.endsWith("/>")) {
			lines[i] = `${line}>`;
			changed = true;
			ops++;
		}
		inTag = false;
	}

	return { text: lines.join("\n"), changed, ops };
}

function insertAt(text, idx, insert) {
	return text.slice(0, idx) + insert + text.slice(idx);
}

function tryFixJsxSelfClose(text, diag) {
	const tagMatch = diag.message.match(
		/JSX element '([^']+)' has no corresponding closing tag/,
	);
	if (!tagMatch) return { text, changed: false };
	const tagName = tagMatch[1];
	if (!tagName) return { text, changed: false };
	if (text.includes(`</${tagName}`)) return { text, changed: false };

	const idx = indexFromLineCol(text, diag.line, diag.col);
	const searchStart = Math.max(0, idx - 200);
	const searchEnd = Math.min(text.length, idx + 800);
	const window = text.slice(searchStart, searchEnd);

	// Find the nearest `<TagName` before the diagnostic window end.
	const needle = `<${tagName}`;
	const relStart = window.lastIndexOf(needle);
	if (relStart === -1) return { text, changed: false };
	const absStart = searchStart + relStart;

	// Find the first `>` after `<TagName` within a limited range.
	const gt = text.indexOf(">", absStart);
	if (gt === -1) return { text, changed: false };
	if (gt - absStart > 800) return { text, changed: false };

	// Skip if already self-closed.
	const beforeGt = text.slice(Math.max(absStart, gt - 2), gt + 1);
	if (beforeGt.includes("/>")) return { text, changed: false };
	if (text[gt - 1] === "/") return { text, changed: false };

	return { text: insertAt(text, gt, " /".trimStart()), changed: true };
}

function tryFixMissingToken(text, diag) {
	if (diag.code !== 1005) return { text, changed: false };

	const msg = diag.message;
	const idx = indexFromLineCol(text, diag.line, diag.col);

	if (msg.includes("'>' expected")) {
		// Only insert `>` when we're plausibly inside a JSX tag (avoid making non-JSX worse).
		const searchStart = Math.max(0, idx - 400);
		const before = text.slice(searchStart, idx);
		const lastLt = before.lastIndexOf("<");
		if (lastLt === -1) return { text, changed: false };
		const afterLastLt = before.slice(lastLt);
		if (afterLastLt.includes(">")) return { text, changed: false };
		if (afterLastLt.includes("\n\n")) return { text, changed: false };
		return { text: insertAt(text, idx, ">"), changed: true };
	}

	if (msg.includes("'/' expected")) {
		// Try to insert `/` right after the nearest `<` before the diagnostic.
		const searchStart = Math.max(0, idx - 200);
		const before = text.slice(searchStart, idx);
		const relLt = before.lastIndexOf("<");
		if (relLt === -1) return { text, changed: false };
		const absLt = searchStart + relLt;
		if (text[absLt + 1] === "/") return { text, changed: false };
		return { text: insertAt(text, absLt + 1, "/"), changed: true };
	}

	return { text, changed: false };
}

function scrubInvalidChars(text) {
	const cleaned = text.replace(/\u0000/g, "");
	return { text: cleaned, changed: cleaned !== text };
}

function normalizeDiagPath(diagFile) {
	// tsc from appDir emits paths like `src/foo.tsx`; turn them into repo-absolute paths.
	if (path.isAbsolute(diagFile)) return diagFile;
	return path.join(appDir, diagFile);
}

function applyFixesToFile(absPath, diagsForFile) {
	const original = fs.readFileSync(absPath, "utf8");
	let text = original;
	let changed = false;
	let fixCount = 0;

	const scrub = scrubInvalidChars(text);
	if (scrub.changed) {
		text = scrub.text;
		changed = true;
		fixCount++;
	}
	if (fixCount >= maxFixesPerFile) {
		if (!changed) return { changed: false, fixCount: 0 };
		if (dryRun) return { changed: true, fixCount };
		fs.writeFileSync(absPath, text, "utf8");
		return { changed: true, fixCount };
	}

	const jsxAngles = fixMissingJsxAngles(text, maxFixesPerFile - fixCount);
	if (jsxAngles.changed) {
		text = jsxAngles.text;
		changed = true;
		fixCount += jsxAngles.ops;
	}
	if (fixCount >= maxFixesPerFile) {
		if (!changed) return { changed: false, fixCount: 0 };
		if (dryRun) return { changed: true, fixCount };
		fs.writeFileSync(absPath, text, "utf8");
		return { changed: true, fixCount };
	}

	const merged = mergeOrphanAngleLines(text);
	if (merged.changed) {
		text = merged.text;
		changed = true;
		fixCount++;
	}
	if (fixCount >= maxFixesPerFile) {
		if (!changed) return { changed: false, fixCount: 0 };
		if (dryRun) return { changed: true, fixCount };
		fs.writeFileSync(absPath, text, "utf8");
		return { changed: true, fixCount };
	}

	// Apply token insertions from bottom-to-top so earlier indices remain valid more often.
	const diagsSorted = [...diagsForFile].sort(
		(a, b) => b.line - a.line || b.col - a.col,
	);
	for (const d of diagsSorted) {
		if (fixCount >= maxFixesPerFile) break;
		const selfClose = tryFixJsxSelfClose(text, d);
		if (selfClose.changed) {
			text = selfClose.text;
			changed = true;
			fixCount++;
			continue;
		}

		if (fixCount >= maxFixesPerFile) break;
		const tokenFix = tryFixMissingToken(text, d);
		if (tokenFix.changed) {
			text = tokenFix.text;
			changed = true;
			fixCount++;
		}
	}

	// One more merge pass after insertions (common when `>` sits alone due to a split tag).
	const merged2 = mergeOrphanAngleLines(text);
	if (merged2.changed) {
		text = merged2.text;
		changed = true;
		fixCount++;
	}

	if (!changed) return { changed: false, fixCount: 0 };
	if (dryRun) return { changed: true, fixCount };

	fs.writeFileSync(absPath, text, "utf8");
	return { changed: true, fixCount };
}

function groupByFile(diags) {
	const map = new Map();
	for (const d of diags) {
		const abs = normalizeDiagPath(d.file);
		if (!map.has(abs)) map.set(abs, []);
		map.get(abs).push(d);
	}
	return map;
}

function printTop(diags, limit = 20) {
	const parseDiags = diags.filter(isParseLike);
	const grouped = groupByFile(parseDiags);
	const ranked = [...grouped.entries()]
		.map(([f, list]) => ({ file: f, count: list.length }))
		.sort((a, b) => b.count - a.count);

	console.log(
		`Parse-like diagnostics: ${parseDiags.length} across ${grouped.size} files`,
	);
	console.log(`Top ${Math.min(limit, ranked.length)} files:`);
	for (const item of ranked.slice(0, limit)) {
		console.log(
			`  ${item.count.toString().padStart(4, " ")}  ${path.relative(repoRoot, item.file)}`,
		);
	}
	return { ranked, grouped };
}

function main() {
	// Sanity: ensure we are in the repo root.
	if (
		!fs.existsSync(appDir) ||
		!fs.existsSync(path.join(appDir, "tsconfig.json"))
	) {
		console.error(`Expected gurudevi-mobile at: ${appDir}`);
		process.exit(1);
	}

	const { exitCode, output } = runTsc();
	const diags = parseDiagnostics(output);
	if (diags.length === 0 && exitCode !== 0 && output.trim().length > 0) {
		console.log("No diagnostics parsed; raw output (first 40 lines):");
		console.log(output.split(/\r?\n/).slice(0, 40).join("\n"));
	}
	const { ranked, grouped } = printTop(diags, 25);

	if (exitCode === 0) {
		console.log("TypeScript check passed; nothing to fix.");
		process.exit(0);
	}

	const appSrcPrefix = path.join(appDir, "src") + path.sep;
	const appRanked = ranked.filter((r) => r.file.startsWith(appSrcPrefix));

	// Always prioritize fixing gurudevi-mobile app source files, even if they aren't top-ranked,
	// because a single broken app entrypoint can block bundling even when deps improve.
	const targets = [];
	const candidates = onlyFiles
		? onlyFiles.map((p) => path.resolve(repoRoot, p))
		: null;

	function shouldConsiderFile(absPath) {
		const rel = path.relative(repoRoot, absPath);
		if (skipRegex?.test(rel)) return false;
		if (onlyWeb && !/\.web\.(t|j)sx?$/.test(rel)) return false;
		if (candidates) return candidates.includes(absPath);
		return true;
	}

	for (const r of appRanked) {
		if (targets.length >= maxFiles) break;
		if (!shouldConsiderFile(r.file)) continue;
		targets.push(r.file);
	}
	for (const r of ranked) {
		if (targets.length >= maxFiles) break;
		if (!shouldConsiderFile(r.file)) continue;
		if (targets.includes(r.file)) continue;
		targets.push(r.file);
	}
	if (targets.length === 0) {
		console.log("No parse-like diagnostics found to target in this pass.");
		process.exit(1);
	}

	let filesChanged = 0;
	let totalFixes = 0;
	for (const f of targets) {
		if (totalFixes >= maxTotalFixes) break;
		if (!fs.existsSync(f)) continue;
		const fileDiags = grouped.get(f) ?? [];
		const res = applyFixesToFile(f, fileDiags);
		if (res.changed) {
			filesChanged++;
			totalFixes += res.fixCount;
		}
	}

	console.log(
		[
			"",
			dryRun ? "[DRY RUN]" : "[WRITE]",
			`Targets attempted: ${targets.length}`,
			`Files changed: ${filesChanged}`,
			`Fix operations: ${totalFixes}`,
		].join("\n"),
	);

	process.exit(1);
}

main();
