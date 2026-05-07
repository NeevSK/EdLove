/**
 * jest-native-setup.js  runs BEFORE any test module is loaded.
 *
 * Expo SDK 55 installs a __ExpoImportMetaRegistry global (expo/src/winter/installGlobal.ts)
 * that uses dynamic import() for module resolution. Jest runs in CJS mode and throws:
 *   "You are trying to import a file outside of the scope of the test code."
 *
 * Stubbing the global before any Expo module loads prevents this error.
 */
global.__ExpoImportMetaRegistry = new Proxy(
	{},
	{
		get: () => undefined,
		set: () => true,
		has: () => false,
	},
);
