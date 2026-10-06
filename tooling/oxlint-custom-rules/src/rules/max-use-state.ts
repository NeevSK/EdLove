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

    interface FunctionScope {
      isComp: boolean;
      useStateCount: number;
    }
    const stack: FunctionScope[] = [];

    function handleEnter(node: any) {
      stack.push({
        isComp: isComponent(node),
        useStateCount: 0,
      });
    }

    function handleExit(node: any) {
      const scope = stack.pop();
      if (scope?.isComp && scope.useStateCount > max) {
        context.report({
          node,
          messageId: 'maxExceeded',
          data: { count: scope.useStateCount, max },
        });
      }
    }

    /** @type {RuleListener} */
    const listener = {
      FunctionDeclaration: handleEnter,
      FunctionExpression: handleEnter,
      ArrowFunctionExpression: handleEnter,
      'FunctionDeclaration:exit': handleExit,
      'FunctionExpression:exit': handleExit,
      'ArrowFunctionExpression:exit': handleExit,
      CallExpression(node: any) {
        const current = stack[stack.length - 1];
        if (current && current.isComp && node.callee.type === 'Identifier' && node.callee.name === 'useState') {
          current.useStateCount++;
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
