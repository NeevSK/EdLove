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
        !file.includes('\\archive\\'),
    );
    if (filteredFiles.length === 0) return [];
    const chunks = chunkArray(filteredFiles, 10);
    const commands = [];
    for (const chunk of chunks) {
      const chunkStr = chunk.map((f) => `"${f}"`).join(' ');
      commands.push(`oxlint --fix ${chunkStr}`);
      // Temporarily disabled due to ESLint 10/typescript-eslint compatibility runtime crash
      // commands.push(`eslint --fix ${chunkStr}`);
      commands.push(`biome check --write --no-errors-on-unmatched ${chunkStr}`);
      commands.push(`node scripts/surgical-check.mjs ${chunkStr}`);
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
