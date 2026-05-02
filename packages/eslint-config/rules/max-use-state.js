/**
 * Custom rule to limit the number of useState hooks in a single component.
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "limit the number of useState hooks per component",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyStateHooks:
        "Component has too many useState hooks ({{count}}). Limit is {{max}}. Consider using useReducer or a state machine for complex state.",
    },
  },
  create(context) {
    const max = context.options[0]?.max || 3;
    let stateCounts = new Map();

    return {
      "CallExpression[callee.name='useState']"(node) {
        // Find the enclosing function/component
        let parent = node.parent;
        while (parent && !/Function/.test(parent.type)) {
          parent = parent.parent;
        }

        if (parent) {
          const count = (stateCounts.get(parent) || 0) + 1;
          stateCounts.set(parent, count);

          if (count > max) {
            context.report({
              node,
              messageId: "tooManyStateHooks",
              data: {
                count,
                max,
              },
            });
          }
        }
      },
    };
  },
};
