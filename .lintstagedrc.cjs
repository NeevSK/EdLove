const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const isProductSource = (file) => {
  const norm = file.replace(/\\/g, '/');
  // Must be in apps/ or packages/
  const inWorkspace = norm.startsWith('apps/') || norm.includes('/apps/') || norm.startsWith('packages/') || norm.includes('/packages/');
  if (!inWorkspace) return false;

  // Exclude non-product, plugins, scripts, and build artifacts
  if (
    norm.includes('/archive/') ||
    norm.includes('/.astro/') ||
    norm.includes('/plugins/') ||
    norm.includes('/scripts/') ||
    norm.includes('/supabase/') ||
    norm.includes('/reports/') ||
    norm.includes('/diagnostics/') ||
    norm.endsWith('.d.ts') ||
    norm.endsWith('.config.js') ||
    norm.endsWith('.config.ts') ||
    norm.endsWith('.config.mjs') ||
    norm.endsWith('.config.cjs')
  ) {
    return false;
  }

  // Must be within src, app, or test directories
  return (
    norm.includes('/src/') ||
    norm.includes('/app/') ||
    norm.includes('/__tests__/') ||
    norm.includes('/tests/')
  );
};

module.exports = {
  '*.{js,ts,tsx}': (files) => {
    const productFiles = files.filter(isProductSource);
    const otherFiles = files.filter((f) => !isProductSource(f) && !f.endsWith('.d.ts') && !f.includes('/archive/'));

    const commands = [];

    // Product source files: comprehensive quality gate
    if (productFiles.length > 0) {
      const chunks = chunkArray(productFiles, 10);
      for (const chunk of chunks) {
        const chunkStr = chunk.map((f) => `"${f}"`).join(' ');
        commands.push(`oxlint --fix ${chunkStr}`);
        commands.push(`eslint --fix --no-warn-ignored ${chunkStr}`);
        commands.push(`biome check --write --no-errors-on-unmatched ${chunkStr}`);
        commands.push(`node scripts/surgical-check.mjs ${chunkStr}`);
        commands.push(`jscpd ${chunkStr} --min-lines 15 --min-tokens 50 --reporters console --exit-code 1`);
      }
    }

    // Auxiliary / build / tool files: lightweight format & syntax check only
    if (otherFiles.length > 0) {
      const chunks = chunkArray(otherFiles, 10);
      for (const chunk of chunks) {
        const chunkStr = chunk.map((f) => `"${f}"`).join(' ');
        commands.push(`biome check --write --no-errors-on-unmatched ${chunkStr}`);
      }
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
