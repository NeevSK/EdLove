module.exports = {
  "**/*.{ts,tsx}": () => [
    "pnpm turbo run check-types",
    "node scripts/refactor/check-barrel-imports.mjs",
    "pnpm run identity:check"
  ],
  "apps/gurudevi-mobile/**": () => [
    "pnpm --filter gurudevi-mobile doctor"
  ],
  "package.json": () => [
    "pnpm --filter gurudevi-mobile doctor"
  ],
  "pnpm-lock.yaml": () => [
    "pnpm --filter gurudevi-mobile doctor"
  ]
};
