import banUseStore from './rules/ban-use-store.js';
import maxUseState from './rules/max-use-state.js';
import noRestrictedSyntax from './rules/no-restricted-syntax.js';

export const rules = {
  'no-restricted-syntax': noRestrictedSyntax,
  'max-use-state': maxUseState,
  'ban-use-store': banUseStore,
};

export const configs = {
  recommended: {
    plugins: ['polymath'],
    rules: {
      'polymath/no-restricted-syntax': 'error',
      'polymath/max-use-state': ['error', { max: 3 }],
      'polymath/ban-use-store': 'error',
    },
  },
};

export default { rules, configs };
