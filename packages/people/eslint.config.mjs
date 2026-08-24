import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // The v7 compiler linter flags any setState reachable from an
    // effect-invoked callback, including post-await calls in standard
    // fetch-on-mount hooks (useStaffPresence). That data-loading idiom is
    // legitimate until React Compiler adoption restructures it.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
