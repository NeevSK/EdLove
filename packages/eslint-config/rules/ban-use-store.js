/**
 * Warn when application code reaches for the legacy global store facade.
 * Domain-specific hooks or the focused store slices should be preferred so
 * subscriptions and ownership stay explicit.
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'discourage imports of the legacy global useStore facade',
      recommended: false,
    },
    schema: [],
    messages: {
      legacyStore:
        'Avoid the legacy useStore facade; use a focused store selector or domain hook instead.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== '@repo/core/store/useStore') return;
        const useStoreImport = node.specifiers.find(
          (specifier) => specifier.type === 'ImportSpecifier' && specifier.imported.name === 'useStore',
        );
        if (useStoreImport) context.report({ node: useStoreImport, messageId: 'legacyStore' });
      },
    };
  },
};
