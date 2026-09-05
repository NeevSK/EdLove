import type { RuleContext, RuleListener } from '../types.js';

const MESSAGE_IDS = {
  asyncOnPress: 'asyncOnPress',
  i18nNoHardcodedText: 'i18nNoHardcodedText',
  mathRandom: 'mathRandom',
  dateNow: 'dateNow',
} as const;

/** @type {import('oxlint').Rule} */
const rule = {
  name: 'no-restricted-syntax',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow specific syntax patterns (architectural guards)',
      recommended: false,
    },
    messages: {
      asyncOnPress:
        'Unsafe async handler detected on Button. This can lead to idempotency bugs (double-clicks). Use <SafeButton onSafePress={...} /> or the useSafeAction() hook instead.',
      i18nNoHardcodedText:
        "Avoid inline default text in t('key', 'default'). Define fallback text in locale files and use i18n fallbackLng.",
      mathRandom:
        'Math.random() is non-deterministic and causes hydration mismatches in 2026. Use useId() for IDs or generate random values outside the render cycle.',
      dateNow:
        'Date.now() is non-deterministic during hydration. Use a stable timestamp prop or wrap in useEffect.',
    },
    schema: [],
  },
  create(context: RuleContext) {
    /** @type {RuleListener} */
    const listener = {
      CallExpression(node) {
        // async onPress on Button
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Button' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'onPress' &&
          node.arguments.length > 0
        ) {
          const arg = node.arguments[0];
          if (
            (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') &&
            arg.async === true
          ) {
            context.report({
              node,
              messageId: MESSAGE_IDS.asyncOnPress,
            });
          }
        }

        // t('key', 'default') with literal default
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 't' &&
          node.arguments.length === 2 &&
          (node.arguments[1].type === 'Literal' || node.arguments[1].type === 'TemplateLiteral')
        ) {
          context.report({
            node: node.arguments[1],
            messageId: MESSAGE_IDS.i18nNoHardcodedText,
          });
        }

        // Math.random()
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Math' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'random'
        ) {
          context.report({
            node,
            messageId: MESSAGE_IDS.mathRandom,
          });
        }

        // Date.now()
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Date' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'now'
        ) {
          context.report({
            node,
            messageId: MESSAGE_IDS.dateNow,
          });
        }
      },
    };

    return listener;
  },
};

export default rule;
