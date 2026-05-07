import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = process.cwd();
const coreSrc = path.join(repoRoot, "packages", "core", "src");
const packageJson = JSON.parse(
	fs.readFileSync(
		path.join(repoRoot, "packages", "core", "package.json"),
		"utf8",
	),
);

// 1. Build a map of subpaths from package.json
const subpathMap = new Map();
for (const [subpath, target] of Object.entries(packageJson.exports || {})) {
	if (subpath === "." || subpath === "./package.json") continue;
	// target can be a string or an object { import: ..., types: ... }
	const targetPath =
		typeof target === "string" ? target : target.import || target.types;
	if (targetPath) {
		const absoluteTargetPath = path.resolve(
			path.join(repoRoot, "packages", "core"),
			targetPath,
		);
		subpathMap.set(absoluteTargetPath, subpath.replace("./", "@repo/core/"));
	}
}

console.log("Subpath Map:", Array.from(subpathMap.entries()));

// 2. Parse packages/core/src/index.ts to map exports to subpaths
const barrelPath = path.join(coreSrc, "index.ts");
const sourceFile = ts.createSourceFile(
	barrelPath,
	fs.readFileSync(barrelPath, "utf8"),
	ts.ScriptTarget.Latest,
	true,
);

const exportMap = new Map(); // name -> subpath

function resolveModule(fromFile, specifier) {
	const base = path.resolve(path.dirname(fromFile), specifier);
	const candidates = [
		`${base}.ts`,
		`${base}.tsx`,
		`${base}.js`,
		`${base}.jsx`,
		path.join(base, "index.ts"),
		path.join(base, "index.tsx"),
	];
	return candidates.find((f) => fs.existsSync(f)) || null;
}

function collectNamedExports(filePath, names = new Set(), visited = new Set()) {
	if (visited.has(filePath)) return names;
	visited.add(filePath);
	const source = ts.createSourceFile(
		filePath,
		fs.readFileSync(filePath, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	for (const stmt of source.statements) {
		if (ts.isExportDeclaration(stmt)) {
			if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
				for (const element of stmt.exportClause.elements) {
					names.add(element.name.text);
				}
			} else if (
				stmt.moduleSpecifier &&
				ts.isStringLiteral(stmt.moduleSpecifier)
			) {
				const resolved = resolveModule(filePath, stmt.moduleSpecifier.text);
				if (resolved) collectNamedExports(resolved, names, visited);
			}
		} else if (
			ts.isVariableStatement(stmt) &&
			stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
		) {
			for (const decl of stmt.declarationList.declarations) {
				if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
			}
		} else if (
			(ts.isFunctionDeclaration(stmt) ||
				ts.isClassDeclaration(stmt) ||
				ts.isInterfaceDeclaration(stmt) ||
				ts.isTypeAliasDeclaration(stmt)) &&
			stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
			stmt.name
		) {
			names.add(stmt.name.text);
		}
	}
	return names;
}

for (const stmt of sourceFile.statements) {
	if (
		ts.isExportDeclaration(stmt) &&
		stmt.moduleSpecifier &&
		ts.isStringLiteral(stmt.moduleSpecifier)
	) {
		const resolved = resolveModule(barrelPath, stmt.moduleSpecifier.text);
		if (!resolved) continue;

		let bestSubpath = "@repo/core";
		for (const [absPath, sub] of subpathMap.entries()) {
			if (
				resolved === absPath ||
				resolved.startsWith(absPath.replace(/index\.tsx?$/, ""))
			) {
				bestSubpath = sub;
				break;
			}
		}

		if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
			for (const element of stmt.exportClause.elements) {
				exportMap.set(element.name.text, bestSubpath);
			}
		} else if (!stmt.exportClause) {
			const names = collectNamedExports(resolved);
			for (const name of names) {
				exportMap.set(name, bestSubpath);
			}
		}
	}
}

// Add some manual mappings for common ones that might be missed or are 'export *'
// (I'll refine this as I go, but for now let's use the automated ones)

console.log("Export Map Size:", exportMap.size);

// 3. Process all files in the repo
const sourceRoots = [
	path.join(repoRoot, "packages"),
	path.join(repoRoot, "apps"),
];
const sourceExts = new Set([".ts", ".tsx", ".js", ".jsx"]);
const skipped = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	"reports",
	"scripts",
	"archive",
]);

function walk(dir, files = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name.startsWith(".")) continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (skipped.has(entry.name)) continue;
			walk(full, files);
			continue;
		}
		if (!sourceExts.has(path.extname(entry.name))) continue;
		files.push(full);
	}
	return files;
}

const allFiles = sourceRoots.flatMap((root) => walk(root));
let updatedCount = 0;

for (const filePath of allFiles) {
	if (filePath === barrelPath) continue;
	let text = fs.readFileSync(filePath, "utf8");
	let changed = false;

	const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
	const edits = [];

	for (const stmt of sf.statements) {
		if (
			ts.isImportDeclaration(stmt) &&
			ts.isStringLiteral(stmt.moduleSpecifier) &&
			stmt.moduleSpecifier.text === "@repo/core"
		) {
			const clause = stmt.importClause;
			if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings))
				continue;

			const grouped = new Map(); // subpath -> Set of names
			const unmatched = new Set();

			for (const element of clause.namedBindings.elements) {
				const name = element.name.text;
				const subpath = exportMap.get(name);
				if (subpath && subpath !== "@repo/core") {
					if (!grouped.has(subpath)) grouped.set(subpath, new Set());
					grouped
						.get(subpath)
						.add(
							element.propertyName
								? `${element.propertyName.text} as ${name}`
								: name,
						);
				} else {
					unmatched.add(
						element.propertyName
							? `${element.propertyName.text} as ${name}`
							: name,
					);
				}
			}

			if (grouped.size > 0) {
				const newImports = [];
				if (unmatched.size > 0) {
					newImports.push(
						`import { ${Array.from(unmatched).sort().join(", ")} } from '@repo/core';`,
					);
				}
				for (const [sub, names] of Array.from(grouped.entries()).sort()) {
					newImports.push(
						`import { ${Array.from(names).sort().join(", ")} } from '${sub}';`,
					);
				}

				edits.push({
					start: stmt.getStart(sf),
					end: stmt.getEnd(),
					text: newImports.join("\n"),
				});
				changed = true;
			}
		}
	}

	if (changed) {
		edits.sort((a, b) => b.start - a.start);
		for (const edit of edits) {
			text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
		}
		fs.writeFileSync(filePath, text);
		updatedCount++;
		console.log(`✅ Updated ${path.relative(repoRoot, filePath)}`);
	}
}

console.log(`\n✨ Finished. Updated ${updatedCount} files.`);
