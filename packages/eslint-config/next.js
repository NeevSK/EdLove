import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "./base.js";
import maxUseStateRule from "./rules/max-use-state.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [
	...baseConfig,
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	pluginJsxA11y.flatConfigs.recommended,
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
	{
		...pluginReact.configs.flat.recommended,
		languageOptions: {
			...pluginReact.configs.flat.recommended.languageOptions,
			globals: {
				...globals.serviceworker,
			},
		},
	},
	{
		plugins: {
			"@next/next": pluginNext,
		},
		rules: {
			...pluginNext.configs.recommended.rules,
			...pluginNext.configs["core-web-vitals"].rules,
		},
	},
	{
		plugins: {
			"react-hooks": pluginReactHooks,
			local: {
				rules: {
					"max-use-state": maxUseStateRule,
				},
			},
		},
		settings: { react: { version: "detect" } },
		rules: {
			...pluginReactHooks.configs.recommended.rules,
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "error",
			"local/max-use-state": ["error", { max: 3 }],
			// React scope no longer necessary with new JSX transform.
			"react/react-in-jsx-scope": "off",
			"no-restricted-syntax": [
				"error",
				{
					selector:
						"JSXOpeningElement[name.name='Button'] > JSXAttribute[name.name='onPress'] > JSXExpressionContainer > :matches(ArrowFunctionExpression[async=true], FunctionExpression[async=true])",
					message:
						"Unsafe async handler detected on Button. This can lead to idempotency bugs (double-clicks). Use <SafeButton onSafePress={...} /> or the useSafeAction() hook instead.",
				},
			],
		},
	},
];
