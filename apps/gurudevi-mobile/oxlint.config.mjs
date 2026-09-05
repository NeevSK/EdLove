import { defineConfig } from "oxlint";
import expoConfig from "expo-config-oxlint";
import { reactNativeConfig } from "expo-config-oxlint";

const native = expoConfig;

export default defineConfig({
  ...native,
  plugins: [
    ...(native.plugins || []),
    "react-perf",
    "vitest",
    "jest"
  ],
  jsPlugins: [
    ...(native.jsPlugins || []),
    ...reactNativeConfig.jsPlugins
  ],
  rules: {
    ...(native.rules || {}),
    ...reactNativeConfig.rules,
    "react/react-in-jsx-scope": "off",
    "react/no-array-index-key": "warn",
    "jsx-a11y/no-autofocus": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    "jsx-a11y/prefer-tag-over-role": "warn",
    "react-perf/jsx-no-new-array-as-prop": "off",
    "react-perf/jsx-no-new-function-as-prop": "off",
    "react-perf/jsx-no-new-object-as-prop": "off",
    "react-perf/jsx-no-jsx-as-prop": "off",
    "no-await-in-loop": "off",
    "import/no-unassigned-import": "off",
    "react/style-prop-object": "off",
    "oxc/no-map-spread": "off",
    "promise/no-multiple-resolved": "off"
  },
  ignorePatterns: [
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
    "**/*.d.ts"
  ],
  overrides: [
    {
      "files": [
        "*.cjs",
        "**/*.config.js",
        "**/*.config.cjs",
        "scripts/**/*.js",
        "scripts/**/*.cjs",
        "**/plugins/**/*.js"
      ],
      "rules": {
        "unicorn/prefer-module": "off",
        "import/no-commonjs": "off",
        "typescript/no-require-imports": "off",
        "import/unambiguous": "off"
      }
    }
  ],
  settings: {
    ...(native.settings || {}),
    "react": { "version": "19" },
    "import": { "ignore": ["node_modules"] },
    "rn-expo": { "appRoots": ["src"] }
  }
});