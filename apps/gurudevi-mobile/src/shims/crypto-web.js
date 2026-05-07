/**
 * Universal Shim for Node.js 'crypto' module.
 */

const cryptoShim = {
	getRandomValues: (buf) => globalThis.crypto.getRandomValues(buf),
	randomBytes: (size) => {
		const buf = new Uint8Array(size);
		globalThis.crypto.getRandomValues(buf);
		return buf;
	},
	createHash: () => ({
		update: () => ({ digest: () => "" }),
	}),
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
cryptoShim.default = cryptoShim;
cryptoShim.__esModule = true;

if (typeof module !== "undefined") {
	module.exports = cryptoShim;
}
