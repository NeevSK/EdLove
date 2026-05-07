/**
 * Web shim for expo-file-system.
 *
 * expo-file-system is a native-only module with no web implementation.
 * It is imported in PDFViewerScreen.tsx, but on web Metro resolves
 * PDFViewerScreen.web.tsx instead  so this module is never actually
 * called in a browser context.
 *
 * However, Metro still resolves ALL imports in every file it encounters while
 * building the dependency graph.  If another file (transitively) imports
 * expo-file-system and is NOT shimmed by a .web.tsx counterpart, the native
 * module init would crash the web build.
 *
 * This shim provides no-op stubs for every function used in this codebase
 * so those paths compile and run gracefully on web (they just do nothing).
 */

module.exports = {
	// Properties
	cacheDirectory: null,
	documentDirectory: null,
	bundleDirectory: null,
	bundledAssets: null,

	// Functions  all return safe default values
	getInfoAsync: async () => ({
		exists: false,
		isDirectory: false,
		uri: "",
		size: 0,
		modificationTime: 0,
	}),
	readAsStringAsync: async () => "",
	writeAsStringAsync: async () => {},
	deleteAsync: async () => {},
	moveAsync: async () => {},
	copyAsync: async () => {},
	makeDirectoryAsync: async () => {},
	readDirectoryAsync: async () => [],
	createDownloadResumable: () => ({
		downloadAsync: async () => null,
		pauseAsync: async () => null,
		resumeAsync: async () => null,
		savable: () => null,
	}),
	downloadAsync: async () => null,
	uploadAsync: async () => null,
	EncodingType: { UTF8: "utf8", Base64: "base64" },
	FileSystemSessionType: { BACKGROUND: "background", FOREGROUND: "foreground" },
	FileSystemUploadType: { BINARY_DATA: "binaryData", MULTIPART: "multipart" },
};
