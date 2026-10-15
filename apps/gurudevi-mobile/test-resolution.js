const path = require('node:path');
const fs = require('node:fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');

const resolvePackage = (name, parentPaths = []) => {
  const searchPaths = [projectRoot, workspaceRoot, ...parentPaths];
  try {
    // 1. Try standard resolution (works if package.json is exported)
    return path.dirname(require.resolve(`${name}/package.json`, { paths: searchPaths }));
  } catch {
    try {
      // 2. Fallback: resolve entry point and discover root by walking up the tree.
      const entryPoint = require.resolve(name, { paths: searchPaths });
      let currentDir = path.dirname(entryPoint);
      while (currentDir !== path.dirname(currentDir)) {
        if (fs.existsSync(path.join(currentDir, 'package.json'))) {
          return currentDir;
        }
        currentDir = path.dirname(currentDir);
      }
    } catch (e) {
      console.error('Error in fallback:', e.message);
    }
    return null;
  }
};

console.log('Resolving @repo/core:', resolvePackage('@repo/core'));
console.log('Resolving @repo/core/package.json:', resolvePackage('@repo/core/package.json'));
