import { webAppConfig } from '@repo/eslint-config/web-app';

export default [
  {
    ignores: [
      '.wrangler/**',
      'dist/**',
      'dist-sanctuary/**',
      'dist-explore/**',
      '.turbo/**',
      '.vercel/**',
    ],
  },
  ...webAppConfig,
];
