import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    plugins: {
      react: {
        rules: {
          'react-compiler': {
            create() { return {}; }
          }
        }
      }
    }
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '../gluestack-legacy',
              message: "Please use the hardened primitives in '../gluestack' instead.",
            },
            {
              name: '../components-legacy',
              message:
                "Please use the hardened primitives in '../gluestack' or modern components in '../components' instead.",
            },
            {
              name: '@gluestack-ui/themed',
              message:
                "Legacy Gluestack themed components are deprecated. Use '@repo/ui/gluestack' or NativeWind classes.",
            },
          ],
          patterns: [
            {
              group: ['**/gluestack-legacy/**', '**/components-legacy/**'],
              message:
                'Usage of legacy components is restricted. Please migrate to the hardened UI foundation.',
            },
            {
              group: ['@gluestack-ui/*', '!@gluestack-ui/nativewind-utils'],
              message:
                "Direct use of @gluestack-ui/* is restricted. Use the hardened primitives in '@repo/ui/gluestack'.",
            },
          ],
        },
      ],
    },
  },
];
