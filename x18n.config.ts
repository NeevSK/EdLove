/**
 * Anthony Fu's x18n Configuration (https://x18n.dev / https://github.com/x18n-dev/x18n)
 * Universal, framework-agnostic toolkit for linting and managing i18n resources.
 */
export default {
  locales: ['en', 'si', 'ta'],
  defaultLocale: 'en',
  files: [
    'packages/core/src/logic/i18n/locales/{locale}.json',
    'apps/gurudevi-mobile/src/i18n/locales/{locale}.json',
  ],
  framework: 'react',
  lint: {
    rules: {
      'missing-keys': 'error',
      'unused-keys': 'warn',
      'placeholder-mismatch': 'error',
    },
  },
};
