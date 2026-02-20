import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";
import globals from "globals";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const reactNativeA11y = require("eslint-plugin-react-native-a11y");

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
        plugins: {
            "react-native-a11y": reactNativeA11y,
        },
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
        rules: {
            ...reactNativeA11y.configs.all.rules,
            // Optional: soften strict errors to warnings initially
            // "react-native-a11y/has-valid-accessibility-ignores-invert-colors": "warn",
        },
    },
];
