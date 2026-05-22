import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/**
 * Sovereign Repair Engine
 *
 * Automatically maps internal barrel imports to specific subpaths
 * based on the 'exports' defined in package.json files.
 */

const REPO_ROOT = process.cwd();
const INTERNAL_PACKAGES = [
  { name: '@repo/core', path: 'packages/core' },
  { name: '@repo/ui', path: 'packages/ui' },
  { name: '@repo/graphics', path: 'packages/graphics' },
];

const _subpathMap = new Map(); // Absolute File Path -> Subpath (e.g. @repo/core/api)
const exportMap = new Map(); // Exported Name -> Subpath

function resolveModule(fromFile, specifier) {
  if (specifier.startsWith('@repo/')) {
    const pkgName = specifier.split('/')[1];
    const pkg = INTERNAL_PACKAGES.find((p) => p.name === `@repo/${pkgName}`);
    if (pkg) {
      const subpath = specifier.substring(`@repo/${pkgName}`.length);
      const pkgPath = path.join(REPO_ROOT, pkg.path);
      if (subpath === '') {
        return path.join(pkgPath, 'src/index.ts');
      }
      // Check if it's a subpath in package.json exports
      const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
      const target = pkgJson.exports?.[`.${subpath}`];
      if (target) {
        const targetFile = typeof target === 'string' ? target : target.import || target.types;
        return path.resolve(pkgPath, targetFile);
      }
      // Fallback to src directory if no export found (e.g. legacy structure)
      return path.resolve(pkgPath, 'src', subpath.substring(1));
    }
  }
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ];
  return candidates.find((f) => fs.existsSync(f)) || null;
}

function collectNamedExports(filePath, names = new Set(), visited = new Set()) {
  if (visited.has(filePath)) return names;
  visited.add(filePath);
  if (!fs.existsSync(filePath)) return names;
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const stmt of source.statements) {
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const element of stmt.exportClause.elements) {
          names.add(element.name.text);
        }
      } else if (stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
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

// 1. Build the Global Export Map
for (const pkg of INTERNAL_PACKAGES) {
  const pkgPath = path.join(REPO_ROOT, pkg.path);
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
  const barrelPath = path.join(pkgPath, 'src/index.ts');

  if (!fs.existsSync(barrelPath)) continue;

  const localSubpathMap = new Map();
  for (const [sub, target] of Object.entries(pkgJson.exports || {})) {
    if (sub === '.' || sub === './package.json' || sub.includes('*')) continue;
    const targetFile = typeof target === 'string' ? target : target.import || target.types;
    if (targetFile) {
      const absPath = path.resolve(pkgPath, targetFile);
      localSubpathMap.set(absPath, `${pkg.name}${sub.substring(1)}`);
    }
  }

  const barrelSource = ts.createSourceFile(
    barrelPath,
    fs.readFileSync(barrelPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const stmt of barrelSource.statements) {
    if (
      ts.isExportDeclaration(stmt) &&
      stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier)
    ) {
      const resolved = resolveModule(barrelPath, stmt.moduleSpecifier.text);
      if (!resolved) continue;

      let bestSubpath = pkg.name;
      for (const [absPath, sub] of localSubpathMap.entries()) {
        if (resolved === absPath || resolved.startsWith(absPath.replace(/index\.tsx?$/, ''))) {
          bestSubpath = sub;
          break;
        }
      }

      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const element of stmt.exportClause.elements) {
          exportMap.set(element.name.text, {
            pkg: pkg.name,
            subpath: bestSubpath,
          });
        }
      } else if (!stmt.exportClause) {
        const names = collectNamedExports(resolved);
        for (const name of names) {
          exportMap.set(name, { pkg: pkg.name, subpath: bestSubpath });
        }
      }
    }
  }
}

console.log(
  `🚀 Sovereign Repair Engine: Loaded ${exportMap.size} exports from ${INTERNAL_PACKAGES.length} packages.`,
);

function getFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.next' && file !== '.turbo') {
        getFiles(name, allFiles);
      }
    } else if (
      name.endsWith('.ts') ||
      name.endsWith('.tsx') ||
      name.endsWith('.js') ||
      name.endsWith('.jsx')
    ) {
      allFiles.push(name);
    }
  }
  return allFiles;
}

// 2. Scan and Repair
const appsDir = path.join(REPO_ROOT, 'apps');
const packagesDir = path.join(REPO_ROOT, 'packages');
const files = [...getFiles(appsDir), ...getFiles(packagesDir)];

let updatedCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (!INTERNAL_PACKAGES.some((p) => content.includes(p.name))) continue;

  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  let modified = false;

  const transformer = (context) => (rootNode) => {
    function visit(node) {
      // 1. Dynamic Imports: import('@repo/core') or require('@repo/core')
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const arg = node.arguments[0];
        const pkg = INTERNAL_PACKAGES.find((p) => arg.text === p.name);
        if (pkg) {
          if (arg.text === '@repo/core') {
            modified = true;
            return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
              ts.factory.createStringLiteral('@repo/core/api'),
            ]);
          }
        }
      }

      // 1c. jest.mock('@repo/core')
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'jest' &&
        node.expression.name.text === 'mock' &&
        node.arguments.length >= 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const arg = node.arguments[0];
        const pkg = INTERNAL_PACKAGES.find((p) => arg.text === p.name);
        if (pkg && arg.text === '@repo/core') {
          modified = true;
          const newArgs = [...node.arguments];
          newArgs[0] = ts.factory.createStringLiteral('@repo/core/api');
          return ts.factory.updateCallExpression(
            node,
            node.expression,
            node.typeArguments,
            newArgs,
          );
        }
      }

      // 1b. Type Imports: import('@repo/core').Symbol
      if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        const pkg = INTERNAL_PACKAGES.find((p) => node.argument.literal.text === p.name);
        if (pkg) {
          let bestSubpath = pkg.name;
          if (node.qualifier && ts.isIdentifier(node.qualifier)) {
            const name = node.qualifier.text;
            const mapping = exportMap.get(name);
            if (mapping && mapping.pkg === pkg.name) {
              bestSubpath = mapping.subpath;
            }
          } else if (!node.qualifier) {
            // If no qualifier, maybe it's used as import('@repo/core') which is rare for types
            bestSubpath = `${pkg.name}/api`;
          }

          if (bestSubpath !== pkg.name) {
            modified = true;
            return ts.factory.updateImportTypeNode(
              node,
              ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(bestSubpath)),
              node.attributes,
              node.qualifier,
              node.typeArguments,
              node.isTypeOf,
            );
          }
        }
      }

      // 2. Static Imports/Exports
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const pkg = INTERNAL_PACKAGES.find((p) => node.moduleSpecifier.text === p.name);
        if (pkg) {
          const namedBindings = ts.isImportDeclaration(node)
            ? node.importClause?.namedBindings
            : node.exportClause;

          if (
            (namedBindings && ts.isNamedImports(namedBindings)) ||
            (ts.isExportDeclaration(node) && namedBindings && ts.isNamedExports(namedBindings))
          ) {
            const importsBySubpath = new Map();
            const remainingNames = [];
            const elements = ts.isImportDeclaration(node)
              ? node.importClause.namedBindings.elements
              : node.exportClause.elements;

            for (const specifier of elements) {
              const originalName = specifier.propertyName
                ? specifier.propertyName.text
                : specifier.name.text;
              const mapping = exportMap.get(originalName);
              if (mapping && mapping.pkg === pkg.name && mapping.subpath !== pkg.name) {
                if (!importsBySubpath.has(mapping.subpath))
                  importsBySubpath.set(mapping.subpath, []);
                importsBySubpath.get(mapping.subpath).push(specifier);
              } else {
                remainingNames.push(specifier);
              }
            }

            if (importsBySubpath.size > 0) {
              modified = true;
              const newNodes = [];

              if (remainingNames.length > 0) {
                if (ts.isImportDeclaration(node)) {
                  newNodes.push(
                    ts.factory.updateImportDeclaration(
                      node,
                      node.modifiers,
                      ts.factory.updateImportClause(
                        node.importClause,
                        node.importClause.isTypeOnly,
                        node.importClause.name,
                        ts.factory.createNamedImports(remainingNames),
                      ),
                      node.moduleSpecifier,
                      node.attributes,
                    ),
                  );
                } else {
                  newNodes.push(
                    ts.factory.updateExportDeclaration(
                      node,
                      node.modifiers,
                      node.isTypeOnly,
                      ts.factory.createNamedExports(remainingNames),
                      node.moduleSpecifier,
                      node.attributes,
                    ),
                  );
                }
              }
              for (const [subpath, elements] of importsBySubpath.entries()) {
                if (ts.isImportDeclaration(node)) {
                  newNodes.push(
                    ts.factory.createImportDeclaration(
                      undefined,
                      ts.factory.createImportClause(
                        false,
                        undefined,
                        ts.factory.createNamedImports(elements),
                      ),
                      ts.factory.createStringLiteral(subpath),
                      undefined,
                    ),
                  );
                } else {
                  newNodes.push(
                    ts.factory.createExportDeclaration(
                      undefined,
                      node.isTypeOnly,
                      ts.factory.createNamedExports(elements),
                      ts.factory.createStringLiteral(subpath),
                      undefined,
                    ),
                  );
                }
              }
              return newNodes;
            }
          }
        }
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(rootNode, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const transformedSourceFile = result.transformed[0];

  if (modified) {
    const newContent = printer.printFile(transformedSourceFile);
    fs.writeFileSync(file, newContent);
    console.log(`✅ Repaired: ${file}`);
    updatedCount++;
  }
}

console.log(`\n✨ Finished. Repaired ${updatedCount} files.`);
