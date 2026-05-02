import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginDeprecation from "eslint-plugin-deprecation";
import turboPlugin from "eslint-plugin-turbo";
import pluginImport from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	pluginImport.flatConfigs.recommended,
	pluginImport.flatConfigs.typescript,
	{
		plugins: {
			turbo: turboPlugin,
			deprecation: pluginDeprecation,
		},
		languageOptions: {
			parserOptions: {
				project: true,
			},
		},
		rules: {
			"turbo/no-undeclared-env-vars": "warn",
			"deprecation/deprecation": "off",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-explicit-any": "error",
			"import-x/no-cycle": ["error", { maxDepth: 5 }],
			"no-restricted-syntax": [
				"error",
				{
					selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
					message: "Math.random() is non-deterministic and causes hydration mismatches in 2026. Use useId() for IDs or generate random values outside the render cycle.",
				},
				{
					selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
					message: "Date.now() is non-deterministic during hydration. Use a stable timestamp prop or wrap in useEffect.",
				},
			],
		},
	},
	{
		ignores: ["dist/**"],
	},
	{
		files: ["**/*.d.ts"],
		rules: {
			"deprecation/deprecation": "off",
		},
	},
];
