import type { RuleContext, RuleListener } from '../types.js';

/** @type {import('oxlint').Rule} */
const rule = {
  name: 'ban-use-store',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ban useStore from zustand - use typed selectors instead',
      recommended: false,
    },
    messages: {
      banned:
        'useStore is banned. Use typed selectors with useShallow or select individual values: useStore(state => state.value). See @repo/core/store for patterns.',
    },
    schema: [],
  },
  create(context: RuleContext) {
    /** @type {RuleListener} */
    const listener = {
      ImportDeclaration(node) {
        const source = String(node.source.value ?? '');
        if (source === 'zustand' || source === '@repo/core/store' || source.endsWith('/store')) {
          for (const spec of node.specifiers) {
            if (
              spec.type === 'ImportSpecifier' &&
              spec.imported.type === 'Identifier' &&
              spec.imported.name === 'useStore'
            ) {
              context.report({
                node: spec,
                messageId: 'banned',
              });
            }
          }
        }
      },
    };

    return listener;
  },
};

export default rule;
