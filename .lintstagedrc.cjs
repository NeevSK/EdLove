module.exports = {
  '**/*': () => ['pnpm run check-types', 'pnpm run check:hygiene', 'pnpm run identity:check'],
};
