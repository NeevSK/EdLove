import type { RuleContext, RuleListener } from '../types.js';

/** @type {import('oxlint').Rule} */
const rule = {
  name: 'max-use-state',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce maximum number of useState hooks per component',
      recommended: false,
    },
    messages: {
      maxExceeded:
        'Component has {{count}} useState hooks, maximum allowed is {{max}}. Consider using useReducer or extracting state.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 1,
            default: 3,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: RuleContext) {
    const options = context.options[0] || {};
    const max = options.max ?? 3;

    let useStateCount = 0;
    let inComponent = false;

    /** @type {RuleListener} */
    const listener = {
      FunctionDeclaration(node) {
        if (isComponent(node)) {
          inComponent = true;
          useStateCount = 0;
        }
      },
      FunctionExpression(node) {
        if (isComponent(node)) {
          inComponent = true;
          useStateCount = 0;
        }
      },
      ArrowFunctionExpression(node) {
        if (isComponent(node)) {
          inComponent = true;
          useStateCount = 0;
        }
      },
      'FunctionDeclaration:exit'(node) {
        if (inComponent && isComponent(node)) {
          if (useStateCount > max) {
            context.report({
              node,
              messageId: 'maxExceeded',
              data: { count: useStateCount, max },
            });
          }
          inComponent = false;
          useStateCount = 0;
        }
      },
      'FunctionExpression:exit'(node) {
        if (inComponent && isComponent(node)) {
          if (useStateCount > max) {
            context.report({
              node,
              messageId: 'maxExceeded',
              data: { count: useStateCount, max },
            });
          }
          inComponent = false;
          useStateCount = 0;
        }
      },
      'ArrowFunctionExpression:exit'(node) {
        if (inComponent && isComponent(node)) {
          if (useStateCount > max) {
            context.report({
              node,
              messageId: 'maxExceeded',
              data: { count: useStateCount, max },
            });
          }
          inComponent = false;
          useStateCount = 0;
        }
      },
      CallExpression(node) {
        if (inComponent && node.callee.type === 'Identifier' && node.callee.name === 'useState') {
          useStateCount++;
        }
      },
    };

    return listener;
  },
};

function isComponent(node: any): boolean {
  if (node.id && node.id.type === 'Identifier') {
    const name = node.id.name;
    return /^[A-Z]/.test(name);
  }
  if (node.parent?.type === 'VariableDeclarator' && node.parent.id.type === 'Identifier') {
    const name = node.parent.id.name;
    return /^[A-Z]/.test(name);
  }
  return false;
}

export default rule;
