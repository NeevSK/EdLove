/**
 * Universal Shim for Node.js 'stream' module.
 */

const streamShim = {
	Readable: class {},
	Writable: class {},
	Duplex: class {},
	Transform: class {},
	PassThrough: class {},
	Stream: class {},
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
streamShim.default = streamShim;
streamShim.__esModule = true;

if (typeof module !== "undefined") {
	module.exports = streamShim;
}
