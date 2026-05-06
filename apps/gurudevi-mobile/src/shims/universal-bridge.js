/* eslint-disable */
/**
 * Universal Web Compatibility Bridge Factory
 *
 * Creates "Self-Healing" shims that prevent "TypeError: Cannot read properties of undefined"
 * by using a recursive Proxy.
 *
 * Satisfies both CommonJS (require) and ESM (import) interop requirements.
 */

const createProxyShim = (name, baseMock = { __esModule: true }) => {
	// Use a blank function as the target.
	// This ensures 'typeof proxy === "function"', making it a valid React component.
	const target = function MockComponent() {
		return null;
	};

	// Copy baseMock properties to the function
	Object.assign(target, baseMock);

	const proxy = new Proxy(target, {
		get: (obj, prop) => {
			if (prop === "default") return proxy;
			if (prop === "__esModule") return true;
			if (prop === "$$typeof") return undefined; // Nuclear: Don't trick React into thinking this is a built-in element
			if (prop === "prototype") return undefined; // Nuclear: Don't trick class inheritance

			if (prop === "Provider" || prop === "Consumer") {
				// If something.Provider is accessed, return a mock Context object
				return { $$typeof: Symbol.for("react.provider"), _context: proxy };
			}

			if (prop in obj) return obj[prop];
			if (typeof prop === "symbol") return obj[prop];

			// If we are on web and someone requests a common native-only property, return safety
			if (prop === "addListener" || prop === "removeListeners") return () => {};

			// SELF-HEALING: return a new proxy for anything missing.
			const propStr = String(prop);
			const child = createProxyShim(`${name}.${propStr}`, {});
			obj[prop] = child; // cache it
			return child;
		},
	});
	return proxy;
};

const bridge = (name, baseMock) => {
	return createProxyShim(name, baseMock);
};

// Export as Pure CommonJS for maximum interop flexibility
module.exports = bridge;
module.exports.bridge = bridge;
module.exports.createProxyShim = createProxyShim;
module.exports.default = bridge;
