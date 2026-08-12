const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '../../../../');
const pnpmRoot = path.join(workspaceRoot, 'node_modules', '.pnpm');
const expoPresetDir = fs
  .readdirSync(pnpmRoot)
  .find((entry) => entry.startsWith('babel-preset-expo@'));

if (!expoPresetDir) {
  throw new Error('Unable to locate babel-preset-expo in the workspace pnpm store');
}

module.exports = (api) => {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache.using(() => isWeb);

  return {
    presets: [
      [
        path.join(pnpmRoot, expoPresetDir, 'node_modules', 'babel-preset-expo'),
        { unstable_transformImportMeta: true, reactCompiler: true },
      ],
    ],
  };
};
