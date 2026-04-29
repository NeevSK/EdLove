import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const repoRoot = process.cwd();
const uiRoot = path.join(repoRoot, 'packages', 'ui', 'src');
const sourceRoots = [path.join(repoRoot, 'packages'), path.join(repoRoot, 'apps')];
const sourceExts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const skippedPathParts = new Set([
  'archive',
  'archives',
  'build',
  'dist',
  'docs',
  'node_modules',
  'reports',
]);

const explicitMap = new Map([
  ['ResolvedWorkspaceSurface', '@repo/core/types'],
  ['WorkspaceLayout', '@repo/core/types'],
  ['WorkspaceSurfaceDefinition', '@repo/core/types'],
  ['WorkspaceZoneId', '@repo/core/types'],
  ['useTranslation', 'react-i18next'],
  ['Animated', 'react-native-reanimated'],
  ['FadeInDown', 'react-native-reanimated'],
  ['FadeInUp', 'react-native-reanimated'],
  ['FadeOutDown', 'react-native-reanimated'],
  ['FadeOutUp', 'react-native-reanimated'],
  ['SlideInDown', 'react-native-reanimated'],
  ['SlideInUp', 'react-native-reanimated'],
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skippedPathParts.has(entry.name)) continue;
      walk(fullPath, files);
      continue;
    }

    if (!sourceExts.has(path.extname(entry.name))) continue;
    if (entry.name.endsWith('.d.ts')) continue;
    if (entry.name.endsWith('.bak')) continue;
    files.push(fullPath);
  }
  return files;
}

function normalizeSpecifier(specifier) {
  return specifier.replace(/\\/g, '/');
}

function resolveModulePath(fromFile, moduleSpecifier) {
  const base = path.resolve(path.dirname(fromFile), moduleSpecifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.web.ts`,
    `${base}.web.tsx`,
    `${base}.native.ts`,
    `${base}.native.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function publicSpecifierFor(filePath, fallback) {
  const relative = normalizeSpecifier(path.relative(uiRoot, filePath));
  if (relative === 'primitives.ts') return '@repo/ui/primitives';
  if (relative === 'icons.ts') return '@repo/ui/icons';
  if (relative === 'theme/Theme.ts') return '@repo/ui/theme';
  if (relative.startsWith('hooks/')) return '@repo/ui/hooks';
  if (relative.startsWith('providers/')) return '@repo/ui/providers';
  if (relative.startsWith('context/')) return '@repo/ui/context';
  if (relative.startsWith('utils/')) return '@repo/ui/utils';

  const noExt = relative.replace(/\.(web|native)\.(t|j)sx?$/, '.$1').replace(/\.(t|j)sx?$/, '');
  if (noExt.startsWith('components/')) {
    return `@repo/ui/${normalizeSpecifier(noExt)}`;
  }
  if (noExt.startsWith('screens/')) {
    return `@repo/ui/${normalizeSpecifier(noExt)}`;
  }

  return fallback;
}

function collectExportNames(entryFile, targetSpecifier, visited = new Set()) {
  const cacheKey = `${entryFile}::${targetSpecifier}`;
  if (visited.has(cacheKey)) return new Map();
  visited.add(cacheKey);

  const sourceText = fs.readFileSync(entryFile, 'utf8');
  const sourceFile = ts.createSourceFile(entryFile, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const exportsMap = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    const moduleSpecifier = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
      ? statement.moduleSpecifier.text
      : null;

    if (statement.exportClause && ts.isNamedExports(statement.exportClause) && moduleSpecifier) {
      const resolved = resolveModulePath(entryFile, moduleSpecifier);
      if (!resolved) continue;
      const publicSpecifier = publicSpecifierFor(resolved, targetSpecifier);

      for (const element of statement.exportClause.elements) {
        exportsMap.set(element.name.text, publicSpecifier);
      }
      continue;
    }

    if (!statement.exportClause && moduleSpecifier) {
      const resolved = resolveModulePath(entryFile, moduleSpecifier);
      if (!resolved) continue;
      const publicSpecifier = publicSpecifierFor(resolved, targetSpecifier);

      if (
        publicSpecifier === '@repo/ui/hooks' ||
        publicSpecifier === '@repo/ui/providers' ||
        publicSpecifier === '@repo/ui/context' ||
        publicSpecifier === '@repo/ui/utils' ||
        publicSpecifier === '@repo/ui/theme' ||
        publicSpecifier === '@repo/ui/primitives'
      ) {
        const nested = collectLocalExports(resolved);
        for (const name of nested) exportsMap.set(name, publicSpecifier);
        continue;
      }

      const nested = collectExportNames(resolved, publicSpecifier, visited);
      for (const [name, specifier] of nested) exportsMap.set(name, specifier);
    }
  }

  return exportsMap;
}

function collectLocalExports(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = new Set();

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement) && statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of statement.declarationList.declarations) {
        collectBindingNames(declaration.name, names);
      }
      continue;
    }

    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      statement.name
    ) {
      names.add(statement.name.text);
      continue;
    }

    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        names.add(element.name.text);
      }
    }
  }

  return names;
}

function collectBindingNames(name, out) {
  if (ts.isIdentifier(name)) {
    out.add(name.text);
    return;
  }
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) {
        collectBindingNames(element.name, out);
      }
    }
  }
}

const exportMap = new Map(explicitMap);
for (const [name, specifier] of collectLocalExports(path.join(uiRoot, 'primitives.ts'))) {
  exportMap.set(name, '@repo/ui/primitives');
}
const componentMap = collectExportNames(path.join(uiRoot, 'components', 'index.ts'), '@repo/ui/components');
for (const [name, specifier] of componentMap) exportMap.set(name, specifier);
const screenMap = collectExportNames(path.join(uiRoot, 'screens', 'index.ts'), '@repo/ui/screens');
for (const [name, specifier] of screenMap) exportMap.set(name, specifier);
for (const name of collectLocalExports(path.join(uiRoot, 'theme', 'Theme.ts'))) {
  exportMap.set(name, '@repo/ui/theme');
}
for (const [name, specifier] of collectExportNames(path.join(uiRoot, 'hooks', 'index.ts'), '@repo/ui/hooks')) {
  exportMap.set(name, '@repo/ui/hooks');
}
for (const [name, specifier] of collectExportNames(path.join(uiRoot, 'providers', 'index.ts'), '@repo/ui/providers')) {
  exportMap.set(name, '@repo/ui/providers');
}
for (const [name, specifier] of collectExportNames(path.join(uiRoot, 'context', 'index.ts'), '@repo/ui/context')) {
  exportMap.set(name, '@repo/ui/context');
}
for (const [name, specifier] of collectExportNames(path.join(uiRoot, 'utils', 'index.ts'), '@repo/ui/utils')) {
  exportMap.set(name, '@repo/ui/utils');
}

function isLikelyIcon(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function formatImport(moduleSpecifier, members, typeOnly = false) {
  const sorted = [...members].sort((a, b) => a.localeCompare(b));
  const importKind = typeOnly ? 'import type' : 'import';
  return `${importKind} { ${sorted.join(', ')} } from '${moduleSpecifier}';`;
}

const files = sourceRoots.flatMap((root) => walk(root));
const unresolved = [];
const updated = [];

const moduleMaps = new Map([
  ['@repo/ui', exportMap],
  ['@repo/ui/components', componentMap],
  ['@repo/ui/screens', screenMap],
]);

function rewriteClauses(sourceFile, text, statements, kind, sourceModule) {
  const mapping = moduleMaps.get(sourceModule);
  if (!mapping?.size) return { text, changed: false };

  const grouped = new Map();
  let blocked = false;

  for (const statement of statements) {
    if (kind === 'import') {
      const importClause = statement.importClause;
      if (
        !importClause ||
        importClause.name ||
        (importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings))
      ) {
        unresolved.push(
          `${normalizeSpecifier(path.relative(repoRoot, sourceFile.fileName))}: unsupported default/namespace import from ${sourceModule}`,
        );
        blocked = true;
        break;
      }

      if (!importClause.namedBindings || !ts.isNamedImports(importClause.namedBindings)) continue;

      for (const element of importClause.namedBindings.elements) {
        const importedName = element.propertyName?.text ?? element.name.text;
        let moduleSpecifier = mapping.get(importedName);

        if (sourceModule === '@repo/ui' && !moduleSpecifier && isLikelyIcon(importedName)) {
          moduleSpecifier = '@repo/ui/icons';
        }

        if (!moduleSpecifier) {
          unresolved.push(`${normalizeSpecifier(path.relative(repoRoot, sourceFile.fileName))}: ${importedName}`);
          blocked = true;
          continue;
        }

        const alias = element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text;
        const key = `${moduleSpecifier}::${element.isTypeOnly || importClause.isTypeOnly ? 'type' : 'value'}::import`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            moduleSpecifier,
            typeOnly: element.isTypeOnly || importClause.isTypeOnly,
            members: new Set(),
            kind: 'import',
          });
        }
        grouped.get(key).members.add(alias);
      }
      continue;
    }

    if (kind === 'export') {
      if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
        unresolved.push(
          `${normalizeSpecifier(path.relative(repoRoot, sourceFile.fileName))}: unsupported export syntax from ${sourceModule}`,
        );
        blocked = true;
        break;
      }

      for (const element of statement.exportClause.elements) {
        const exportedName = element.propertyName?.text ?? element.name.text;
        const moduleSpecifier = mapping.get(exportedName);
        if (!moduleSpecifier) {
          unresolved.push(`${normalizeSpecifier(path.relative(repoRoot, sourceFile.fileName))}: ${exportedName}`);
          blocked = true;
          continue;
        }

        const alias = element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text;
        const key = `${moduleSpecifier}::${element.isTypeOnly || statement.isTypeOnly ? 'type' : 'value'}::export`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            moduleSpecifier,
            typeOnly: element.isTypeOnly || statement.isTypeOnly,
            members: new Set(),
            kind: 'export',
          });
        }
        grouped.get(key).members.add(alias);
      }
    }
  }

  if (blocked) return { text, changed: false };

  const replacement = [...grouped.values()]
    .sort((a, b) => a.moduleSpecifier.localeCompare(b.moduleSpecifier) || Number(a.typeOnly) - Number(b.typeOnly))
    .map((entry) => {
      const sorted = [...entry.members].sort((a, b) => a.localeCompare(b));
      if (entry.kind === 'export') {
        return `${entry.typeOnly ? 'export type' : 'export'} { ${sorted.join(', ')} } from '${entry.moduleSpecifier}';`;
      }
      return formatImport(entry.moduleSpecifier, entry.members, entry.typeOnly);
    })
    .join('\n');

  let next = text;
  const sortedStatements = [...statements].sort((a, b) => b.getStart(sourceFile) - a.getStart(sourceFile));
  for (let index = 0; index < sortedStatements.length; index += 1) {
    const statement = sortedStatements[index];
    const start = statement.getStart(sourceFile);
    const end = statement.getEnd();
    const fragment = index === sortedStatements.length - 1 ? replacement : '';
    next = `${next.slice(0, start)}${fragment}${next.slice(end)}`;
  }

  return { text: next, changed: next !== text };
}

for (const filePath of files) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes("@repo/ui")) continue;

  let next = original;
  let changed = false;

  for (const sourceModule of moduleMaps.keys()) {
    const sourceFile = ts.createSourceFile(filePath, next, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const importStatements = sourceFile.statements.filter(
      (statement) =>
        ts.isImportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text === sourceModule,
    );
    if (importStatements.length) {
      const result = rewriteClauses(sourceFile, next, importStatements, 'import', sourceModule);
      next = result.text;
      changed ||= result.changed;
    }

    const exportStatements = sourceFile.statements.filter(
      (statement) =>
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text === sourceModule,
    );
    if (exportStatements.length) {
      const result = rewriteClauses(sourceFile, next, exportStatements, 'export', sourceModule);
      next = result.text;
      changed ||= result.changed;
    }
  }

  next = next.replace(/\n{3,}/g, '\n\n');

  if (changed && next !== original) {
    fs.writeFileSync(filePath, next);
    updated.push(normalizeSpecifier(path.relative(repoRoot, filePath)));
  }
}

console.log(JSON.stringify({ updatedCount: updated.length, unresolvedCount: unresolved.length, unresolved }, null, 2));
