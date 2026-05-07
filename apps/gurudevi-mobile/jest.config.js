// https://docs.expo.dev/guides/testing-with-jest/
module.exports = {
	// jest-expo/web uses react-native-web which avoids Expo SDK 55's winter runtime
	// (installGlobal.ts / runtime.native.ts) that breaks with Jest's CJS dynamic-import restrictions.
	preset: "jest-expo/web",
	setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
	transformIgnorePatterns: [
		// pnpm stores real files at: node_modules/.pnpm/<PKG@VER>/node_modules/<PKG>/
		// jest follows symlinks so it sees the REAL .pnpm path, not the hoisted symlink.
		//
		// Single regex that handles BOTH flat (npm/yarn) and pnpm nested layouts:
		//   - flat:  node_modules/<PKG>/...
		//   - pnpm:  node_modules/.pnpm/<PKG@VER>/node_modules/<PKG>/...
		//
		// The optional group (\\.pnpm/[^/]*/node_modules/)? absorbs the pnpm prefix
		// so the negative lookahead always sees the bare package name in both cases.
		"node_modules/(?!(\\.pnpm/[^/]*/node_modules/)?(?:(jest-)?react-native|@react-native(-community)?|expo[^/]*|@expo[^/]*/|@expo-google-fonts/|react-navigation|@react-navigation/|@unimodules/|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui/|@gluestack-style/|lucide-react-native|moti|@motify/|react-native-mmkv|react-native-nitro-modules|react-native-web|uuid|fbjs|@tanstack/|@testing-library/|apca-w3|culori))",
	],
	moduleFileExtensions: [
		"ts",
		"tsx",
		"native.js",
		"native.ts",
		"native.tsx",
		"js",
		"jsx",
		"json",
		"node",
	],
	testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
	moduleNameMapper: {
		// @repo/* packages resolve directly from workspace sources
		"^@repo/(.*)$": "<rootDir>/../../packages/$1/src/index.ts",
		// @gluestack-ui/themed AND all its build/components/* sub-paths use one mock.
		// Packages import from deep paths like '@gluestack-ui/themed/build/components/Box'
		// which bypass a jest.mock('@gluestack-ui/themed') (only matches root).
		"^@gluestack-ui/themed(.*)$": "<rootDir>/__mocks__/gluestack-themed.js",
		// EnvironmentContext uses native APIs; provide a jest-friendly stub.
		"^.+/context/EnvironmentContext(\\.tsx)?$":
			"<rootDir>/__mocks__/EnvironmentContext.js",
		// Native packages with JSI/C++ requirements get manual mocks
		"^react-native-reanimated$":
			"<rootDir>/__mocks__/react-native-reanimated.js",
		"^react-native-worklets$": "<rootDir>/__mocks__/react-native-reanimated.js",
		"^@sentry/react-native$": "<rootDir>/__mocks__/@sentry/react-native.js",
		"^@shopify/react-native-skia$":
			"<rootDir>/__mocks__/@shopify/react-native-skia.js",
		// expo-camera and expo-image-picker have dedicated manual mocks
		"^expo-camera$": "<rootDir>/__mocks__/expo-camera.js",
		"^expo-image-picker$": "<rootDir>/__mocks__/expo-image-picker.js",
	},
};
