import { getViteConfig } from 'astro/config';

// Astro's own Vite config, so tests resolve modules and `import.meta.env` the way the build does.
export default getViteConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
