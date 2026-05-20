module.exports = {
  '*.{js,ts,tsx}': (files) => [
    `biome check --write --no-errors-on-unmatched ${files.join(' ')}`,
    `eslint --fix ${files.join(' ')}`,
    `node scripts/surgical-check.mjs ${files.join(' ')}`,
  ],
  '*.json': (files) => [`biome check --write --no-errors-on-unmatched ${files.join(' ')}`],
};
