module.exports = {
  "**/*.{ts,tsx}": () => [
    "pnpm turbo run check-types",
    "node scripts/refactor/check-barrel-imports.mjs",
    "pnpm run identity:check",
    "pnpm --filter gurudevi-mobile doctor"
  ]
};
