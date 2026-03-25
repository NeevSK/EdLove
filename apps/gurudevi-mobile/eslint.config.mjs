import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...reactInternalConfig,
    {
        ignores: [
            "*.config.js",
            ".expo/**",
            "android/**",
            "assets/**",
            "dist/**",
            "node_modules/**",
            "web-build/**",
            "coverage/**"
        ]
    },
    {
        languageOptions: {
            globals: {
                ...globals.reactNative,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                }
            },
        },
    },
];
