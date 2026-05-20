import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const repoRoot = process.cwd();
const uiRoot = path.join(repoRoot, 'packages', 'ui', 'src');
const sourceRoots = [path.join(repoRoot, 'packages'), path.join(repoRoot, 'apps')];
const sourceExts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const skipped = new Set([
  'archive',
  'archives',
  'build',
  'dist',
  'docs',
  'node_modules',
  'reports',
  'scripts',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipped.has(entry.name)) continue;
      walk(full, files);
      continue;
    }
    if (!sourceExts.has(path.extname(entry.name))) continue;
    if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.bak')) continue;
    files.push(full);
  }
  return files;
}

function parse(filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function resolveModule(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.web.ts`,
    `${base}.web.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function publicSpecifierFor(filePath) {
  const rel = path
    .relative(uiRoot, filePath)
    .replace(/\\/g, '/')
    .replace(/\.(tsx|ts|jsx|js)$/, '');
  return `@repo/ui/${rel}`;
}

function collectNamedExports(filePath, names = new Set(), visited = new Set()) {
  if (visited.has(filePath)) return names;
  visited.add(filePath);
  const source = parse(filePath);
  for (const stmt of source.statements) {
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause) && !stmt.moduleSpecifier) {
        for (const element of stmt.exportClause.elements) {
          names.add(element.name.text);
        }
        continue;
      }
      if (stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const resolved = resolveModule(filePath, stmt.moduleSpecifier.text);
        if (!resolved) continue;
        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
          for (const element of stmt.exportClause.elements) {
            names.add(element.name.text);
          }
        } else {
          collectNamedExports(resolved, names, visited);
        }
        continue;
      }
      if (!stmt.exportClause) {
        continue;
      }
      continue;
    }
    if (
      ts.isVariableStatement(stmt) &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of stmt.declarationList.declarations) {
        collectBindingNames(declaration.name, names);
      }
      continue;
    }
    if (
      (ts.isFunctionDeclaration(stmt) ||
        ts.isClassDeclaration(stmt) ||
        ts.isInterfaceDeclaration(stmt) ||
        ts.isTypeAliasDeclaration(stmt) ||
        ts.isEnumDeclaration(stmt)) &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      stmt.name
    ) {
      names.add(stmt.name.text);
    }
  }
  return names;
}

function collectBindingNames(name, names) {
  if (ts.isIdentifier(name)) {
    names.add(name.text);
    return;
  }
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) collectBindingNames(element.name, names);
    }
  }
}

function collectBarrelMeta(barrelPath, visited = new Set()) {
  if (visited.has(barrelPath)) return new Map();
  visited.add(barrelPath);
  const source = parse(barrelPath);
  const meta = new Map();

  for (const stmt of source.statements) {
    if (
      !ts.isExportDeclaration(stmt) ||
      !stmt.moduleSpecifier ||
      !ts.isStringLiteral(stmt.moduleSpecifier)
    )
      continue;
    const resolved = resolveModule(barrelPath, stmt.moduleSpecifier.text);
    if (!resolved) continue;
    const publicSpecifier = publicSpecifierFor(resolved);

    if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const element of stmt.exportClause.elements) {
        meta.set(element.name.text, {
          moduleSpecifier: publicSpecifier,
          importKind: element.propertyName?.text === 'default' ? 'default' : 'named',
        });
      }
      continue;
    }

    const nestedNames = collectNamedExports(resolved);
    for (const name of nestedNames) {
      meta.set(name, { moduleSpecifier: publicSpecifier, importKind: 'named' });
    }
  }

  return meta;
}

const primitiveNames = collectNamedExports(path.join(uiRoot, 'primitives.ts'));
const componentMeta = collectBarrelMeta(path.join(uiRoot, 'components', 'index.ts'));
const screenMeta = collectBarrelMeta(path.join(uiRoot, 'screens', 'index.ts'));

function buildImport({ defaultImport, namedImports, moduleSpecifier }) {
  const named = [...namedImports].sort((a, b) => a.localeCompare(b));
  if (defaultImport && named.length) {
    return `import ${defaultImport}, { ${named.join(', ')} } from '${moduleSpecifier}';`;
  }
  if (defaultImport) {
    return `import ${defaultImport} from '${moduleSpecifier}';`;
  }
  return `import { ${named.join(', ')} } from '${moduleSpecifier}';`;
}

function buildExport({ defaultExport, namedExports, moduleSpecifier }) {
  const named = [...namedExports].sort((a, b) => a.localeCompare(b));
  if (defaultExport && named.length) {
    return `export { default as ${defaultExport}, ${named.join(', ')} } from '${moduleSpecifier}';`;
  }
  if (defaultExport) {
    return `export { default as ${defaultExport} } from '${moduleSpecifier}';`;
  }
  return `export { ${named.join(', ')} } from '${moduleSpecifier}';`;
}

function appendNamedImport(target, moduleSpecifier, importKind, importText) {
  if (!target.has(moduleSpecifier)) {
    target.set(moduleSpecifier, {
      defaultImport: null,
      namedImports: new Set(),
    });
  }
  const entry = target.get(moduleSpecifier);
  if (importKind === 'default') {
    entry.defaultImport = importText;
    return;
  }
  entry.namedImports.add(importText);
}

const files = sourceRoots.flatMap((root) => walk(root));
let updatedCount = 0;

for (const filePath of files) {
  let text = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const phase of ['icons-imports', 'direct-imports', 'direct-exports']) {
    const source = ts.createSourceFile(
      filePath,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const edits = [];

    for (const stmt of source.statements) {
      if (
        phase === 'icons-imports' &&
        ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        stmt.moduleSpecifier.text === '@repo/ui/icons'
      ) {
        const clause = stmt.importClause;
        if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
        const iconNames = new Set();
        const groupedImports = new Map();
        for (const element of clause.namedBindings.elements) {
          const importedName = element.propertyName?.text ?? element.name.text;
          const alias = element.propertyName
            ? `${element.propertyName.text} as ${element.name.text}`
            : element.name.text;
          if (primitiveNames.has(importedName)) {
            appendNamedImport(groupedImports, '@repo/ui/primitives', 'named', alias);
            continue;
          }
          const component = componentMeta.get(importedName);
          if (component) {
            appendNamedImport(
              groupedImports,
              component.moduleSpecifier,
              component.importKind,
              element.name.text,
            );
            continue;
          }
          iconNames.add(alias);
        }
        const parts = [];
        if (iconNames.size)
          parts.push(`import { ${[...iconNames].sort().join(', ')} } from '@repo/ui/icons';`);
        for (const [moduleSpecifier, entry] of [...groupedImports.entries()].sort((a, b) =>
          a[0].localeCompare(b[0]),
        )) {
          parts.push(
            buildImport({
              defaultImport: entry.defaultImport,
              namedImports: entry.namedImports,
              moduleSpecifier,
            }),
          );
        }
        edits.push({
          start: stmt.getStart(source),
          end: stmt.getEnd(),
          text: parts.join('\n'),
        });
      }

      if (
        phase === 'direct-imports' &&
        ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        /^@repo\/ui\/(components|screens)\//.test(stmt.moduleSpecifier.text)
      ) {
        const metaSource = stmt.moduleSpecifier.text.startsWith('@repo/ui/components/')
          ? componentMeta
          : screenMeta;
        const clause = stmt.importClause;
        if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
        const defaultImports = [];
        const namedImports = new Set();
        let untouched = false;
        for (const element of clause.namedBindings.elements) {
          const importedName = element.propertyName?.text ?? element.name.text;
          const meta = metaSource.get(importedName);
          if (!meta || meta.moduleSpecifier !== stmt.moduleSpecifier.text) {
            untouched = true;
            break;
          }
          if (meta.importKind === 'default') {
            defaultImports.push(element.name.text);
          } else {
            namedImports.add(
              element.propertyName
                ? `${element.propertyName.text} as ${element.name.text}`
                : element.name.text,
            );
          }
        }
        if (untouched || defaultImports.length > 1) continue;
        edits.push({
          start: stmt.getStart(source),
          end: stmt.getEnd(),
          text: buildImport({
            defaultImport: defaultImports[0],
            namedImports,
            moduleSpecifier: stmt.moduleSpecifier.text,
          }),
        });
      }

      if (
        phase === 'direct-exports' &&
        ts.isExportDeclaration(stmt) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        /^@repo\/ui\/components\//.test(stmt.moduleSpecifier.text)
      ) {
        if (!stmt.exportClause || !ts.isNamedExports(stmt.exportClause)) continue;
        if (stmt.isTypeOnly) continue;
        const defaultExports = [];
        const namedExports = new Set();
        let untouched = false;
        for (const element of stmt.exportClause.elements) {
          const exportedName = element.propertyName?.text ?? element.name.text;
          const meta = componentMeta.get(exportedName);
          if (!meta || meta.moduleSpecifier !== stmt.moduleSpecifier.text) {
            untouched = true;
            break;
          }
          if (meta.importKind === 'default') {
            defaultExports.push(element.name.text);
          } else {
            namedExports.add(
              element.propertyName
                ? `${element.propertyName.text} as ${element.name.text}`
                : element.name.text,
            );
          }
        }
        if (untouched || defaultExports.length > 1) continue;
        edits.push({
          start: stmt.getStart(source),
          end: stmt.getEnd(),
          text: buildExport({
            defaultExport: defaultExports[0],
            namedExports,
            moduleSpecifier: stmt.moduleSpecifier.text,
          }),
        });
      }
    }

    if (!edits.length) continue;
    edits.sort((a, b) => b.start - a.start);
    for (const edit of edits) {
      text = `${text.slice(0, edit.start)}${edit.text}${text.slice(edit.end)}`;
    }
    changed = true;
  }

  if (changed) {
    text = text.replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(filePath, text);
    updatedCount += 1;
  }
}

console.log(JSON.stringify({ updatedCount }, null, 2));
