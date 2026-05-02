import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "./base.js";
import maxUseStateRule from "./rules/max-use-state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [
	...baseConfig,
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReactHooks.configs.flat.recommended,
	pluginJsxA11y.flatConfigs.recommended,
	...compat.extends("plugin:react-native-a11y/all"),
	{
		languageOptions: {
			globals: {
				...globals.serviceworker,
				...globals.browser,
			},
		},
	},
	{
		plugins: {
			local: {
				rules: {
					"max-use-state": maxUseStateRule,
				},
			},
		},
		settings: { react: { version: "detect" } },
		rules: {
			// React scope no longer necessary with new JSX transform.
			"react/react-in-jsx-scope": "off",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "error",
			"local/max-use-state": ["error", { max: 3 }],
			"no-restricted-syntax": [
				"warn",
				{
					selector:
						"CallExpression[callee.name='t'][arguments.length=2][arguments.1.type='Literal'], CallExpression[callee.name='t'][arguments.length=2][arguments.1.type='TemplateLiteral']",
					message:
						"Avoid inline default text in t('key', 'default'). Define fallback text in locale files and use i18n fallbackLng.",
				},
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
