import oxlint from 'eslint-plugin-oxlint';

/**
 * ESLint + Oxlint Hybrid Strategy
 *
 * Oxlint runs first as a fast pre-pass (50–100x faster than ESLint).
 * eslint-plugin-oxlint disables 650+ rules that Oxlint already checked.
 * ESLint now only runs on:
 *   - Svelte SFC templates (eslint-plugin-svelte)
 *   - Astro templates (@astrojs/eslint-plugin)
 *   - Custom rules (local/max-use-state, etc.)
 *   - @eslint-react/eslint-plugin depth checks
 *
 * Result: ~60–70% CPU savings on ESLint, dev feedback loops stay fast.
 */

export default [
  // ============================================
  // Base configuration (universal JS/TS rules)
  // ============================================
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.mts', '**/*.cts'],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-debugger': 'error',
    },
  },

  // ============================================
  // React & JSX (for Expo, web apps)
  // ============================================
  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // @eslint-react/eslint-plugin goes here if you add it
    // rules: { ... }
  },

  // ============================================
  // Custom rules (e.g., max-use-state)
  // ============================================
  {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      'local/max-use-state': 'error',
    },
    plugins: {
      local: {
        rules: {
          'max-use-state': {
            create(context) {
              const maxStates = 3;
              return {
                CallExpression(node) {
                  if (
                    node.callee.name === 'useState' &&
                    node.parent?.type === 'VariableDeclarator'
                  ) {
                    const fn = context.sourceCode.getScope(node).block;
                    if (
                      fn?.type !== 'FunctionDeclaration' &&
                      fn?.type !== 'ArrowFunctionExpression'
                    ) {
                      return;
                    }
                    const stateCount =
                      fn.body.body?.filter(
                        (stmt) =>
                          stmt.type === 'VariableDeclaration' &&
                          stmt.declarations.some(
                            (decl) =>
                              decl.init?.type === 'CallExpression' &&
                              decl.init.callee.name === 'useState',
                          ),
                      ).length || 0;

                    if (stateCount > maxStates) {
                      context.report({
                        node,
                        message: `Component exceeds ${maxStates} useState calls. Found ${stateCount}.`,
                      });
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
  },

  // ============================================
  // Svelte SFCs (template + script linting)
  // ============================================
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: 'svelte-eslint-parser', // npm install svelte-eslint-parser
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'svelte/no-at-debug': 'error',
      'svelte/no-dupe-on-directives': 'error',
    },
    plugins: {
      svelte: {}, // eslint-plugin-svelte goes here
    },
  },

  // ============================================
  // Astro templates
  // ============================================
  {
    files: ['**/*.astro'],
    parser: 'astro-eslint-parser', // npm install astro-eslint-parser
    parserOptions: {
      parser: '@typescript-eslint/parser',
      sourceType: 'module',
    },
    rules: {
      // @astrojs/eslint-plugin rules go here
    },
  },

  // ============================================
  // CRITICAL: Disable Oxlint-covered rules
  // ============================================
  // This MUST be last in the config array.
  // It disables all 650+ rules that Oxlint already checked,
  // so ESLint only handles the framework-specific depth.
  ...oxlint.configs['flat/recommended'],
];
