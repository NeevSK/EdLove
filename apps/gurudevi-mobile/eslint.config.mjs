import { createRequire } from "module";
import globals from "globals";

const require = createRequire(import.meta.url);

const tseslint = require("typescript-eslint");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const reactNativePlugin = require("eslint-plugin-react-native");
const reactNativeA11yPlugin = require("eslint-plugin-react-native-a11y");
const sonarjsPlugin = require("eslint-plugin-sonarjs");
const importXPlugin = require("eslint-plugin-import-x");
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");

const browserGlobals = Object.fromEntries(Object.keys(globals.browser).map(k => [k, "readonly"]));
const nodeGlobals = Object.fromEntries(Object.keys(globals.node).map(k => [k, "readonly"]));

export default [
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".expo",
      ".turbo",
      "coverage",
      "*.config.ts",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      "*.cjs",
      "**/*.cjs",
      "scripts",
      "**/archive/**",
      "**/plugins/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.d.ts",
      "**/*.js",
      "**/*.jsx",
      "index.ts",
      "jest-setup.ts",
      "vitest-*.ts",
      "runtime-fixtures/**",
      "supabase/**"
    ]
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
        document: "writable",
        window: "writable",
        globalThis: "writable",
        __DEV__: "readonly",
        Platform: "readonly",
        NativeModules: "readonly",
        DeviceEventEmitter: "readonly",
        AppRegistry: "readonly"
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-native": reactNativePlugin,
      "react-native-a11y": reactNativeA11yPlugin,
      sonarjs: sonarjsPlugin,
      "import-x": importXPlugin,
      "@typescript-eslint": typescriptEslintPlugin
    },
    settings: {
      react: { version: "19" },
      "import-x": {
        extensions: [".ts", ".tsx", ".cts", ".mts", ".js", ".jsx", ".cjs", ".mjs"],
        externalModuleFolders: ["node_modules", "node_modules/@types"],
        parsers: {
          "@typescript-eslint/parser": [".ts", ".tsx", ".cts", ".mts"]
        }
      },
      import: { ignore: ["node_modules"] }
    },
    rules: {
      "react-native/no-color-literals": "off",
      "react-native/no-inline-styles": "off",
      "react-native/no-unused-styles": "off",
      "react-native/no-single-element-style-arrays": "off",
      "react-native-a11y/has-accessibility-hint": "warn",
      "react-native-a11y/has-accessibility-props": "warn",
      "react-native-a11y/has-valid-accessibility-actions": "warn",
      "react-native-a11y/has-valid-accessibility-component-type": "warn",
      "react-native-a11y/has-valid-accessibility-descriptors": "warn",
      "react-native-a11y/has-valid-accessibility-ignores-invert-colors": "warn",
      "react-native-a11y/has-valid-accessibility-live-region": "warn",
      "react-native-a11y/has-valid-accessibility-role": "warn",
      "react-native-a11y/has-valid-accessibility-state": "warn",
      "react-native-a11y/has-valid-accessibility-states": "warn",
      "react-native-a11y/has-valid-accessibility-traits": "warn",
      "react-native-a11y/has-valid-accessibility-value": "warn",
      "react-native-a11y/has-valid-important-for-accessibility": "warn",
      "react-native-a11y/no-nested-touchables": "warn",
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-duplicate-string": ["warn", { "threshold": 5, "ignoreStrings": "application/json" }],
      "sonarjs/no-identical-functions": ["warn", 3],
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "no-restricted-syntax": "off",
      "local/max-use-state": "off",
      "polymath/ban-use-store": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "import-x/no-cycle": "off",
      "import-x/no-unresolved": "off",
      "import/no-cycle": "off",
      "import/no-unresolved": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "no-unused-vars": "off",
      "no-var": "off",
      "prefer-const": "off"
    }
  },
  {
    files: ["*.cjs", "**/*.config.js", "**/*.config.cjs", "scripts/**/*.js", "scripts/**/*.cjs", "**/plugins/**/*.js"],
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...nodeGlobals
      }
    },
    rules: {
      "unicorn/prefer-module": "off",
      "import/no-commonjs": "off",
      "typescript/no-require-imports": "off",
      "import/unambiguous": "off",
      "import-x/no-commonjs": "off",
      "import-x/unambiguous": "off"
    }
  }
];