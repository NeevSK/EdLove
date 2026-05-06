/**
 * Web shim for @react-native-ml-kit/text-recognition.
 *
 * This is a native-only JSI module. Its TypeScript-compiled output defines
 * `exports.default` using Object.defineProperty with a getter, which causes
 * Metro's web bundler to throw:
 *   "Cannot set property default of #<object> which has only a getter"
 * when it tries to wrap the module.
 *
 * On web the OCR pipeline gracefully degrades: ScannerModal.web.tsx shows a
 * manual-entry fallback, so recognise() is never called in a browser context.
 * This shim keeps the web bundle free of the native module.
 */

const TextRecognition = {
	recognize: async () => ({ text: "", blocks: [] }),
};

module.exports = TextRecognition;
module.exports.default = TextRecognition;
