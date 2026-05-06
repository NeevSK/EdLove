import { config } from "./packages/eslint-config/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
	...config,
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			"**/.astro/**",
			"**/.turbo/**",
			"**/reports/**",
			"**/legacy/**",
			"**/*-legacy/**",
			"**/*_archive/**",
			"apps/gurudevi-mobile/archives/**",
			"docs/archive/**",
		],
	},
	{
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "warn",
		},
	},
];
