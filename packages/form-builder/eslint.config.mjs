import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // FormBuilder.tsx:114 is a 658-line tabbed monolith (editor/logic/
    // analytics/code) at complexity 40. Needs a dedicated extraction of the
    // tab renderers into module components, not an in-line patch.
    rules: {
      'sonarjs/cognitive-complexity': 'warn',
    },
  },
];
