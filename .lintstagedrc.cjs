const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

module.exports = {
  '*.{js,ts,tsx}': (files) => {
    const filteredFiles = files.filter(
      (file) =>
        !file.includes('/archives/') &&
        !file.includes('\\archives\\') &&
        !file.includes('/archive/') &&
        !file.includes('\\archive\\') &&
        !file.includes('/.astro/') &&
        !file.includes('\\.astro\\') &&
        !file.endsWith('.d.ts'),
    );
    if (filteredFiles.length === 0) return [];
    const chunks = chunkArray(filteredFiles, 10);
    const commands = [];
    for (const chunk of chunks) {
      const chunkStr = chunk.map((f) => `"${f}"`).join(' ');
      // Primary: Oxlint (fast, general-purpose linting)
      commands.push(`oxlint --fix ${chunkStr}`);
      // Secondary: ESLint (TypeScript, React Native, Expo specific rules)
      commands.push(`eslint --fix ${chunkStr}`);
      // Formatter: Biome (formatting + import organization)
      commands.push(`biome check --write --no-errors-on-unmatched ${chunkStr}`);
      // Custom validation
      commands.push(`node scripts/surgical-check.mjs ${chunkStr}`);
      // Duplicate detection: catches copy-paste spaghetti before it enters the repo.
      // --min-lines 8: ignores short repeated patterns (imports, type declarations).
      // Scoped to changed files only — fast enough for pre-commit.
      commands.push(`jscpd ${chunkStr} --min-lines 8 --min-tokens 50 --reporters console --exitCode 1`);
    }
    return commands;
  },
  '*.json': (files) => {
    const chunks = chunkArray(files, 10);
    return chunks.map(
      (chunk) =>
        `biome check --write --no-errors-on-unmatched ${chunk.map((f) => `"${f}"`).join(' ')}`,
    );
  },
};
