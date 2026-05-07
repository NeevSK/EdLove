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
			if (typeof prop === "symbol") return obj[prop];

			// 1. React 19 Compatibility: Explicitly handle internal checks
			const reactInternals = new Set([
				"$$typeof",
				"prototype",
				"displayName",
				"childContextTypes",
				"contextTypes",
				"contextType",
				"propTypes",
				"getDerivedStateFromProps",
				"getSnapshotBeforeUpdate",
			]);
			if (reactInternals.has(prop)) return obj[prop];

			// 2. ESM/Module Interop
			if (prop === "default") return proxy;
			if (prop === "__esModule") return true;

			// 3. Special React Native Bridge Mocks
			if (prop === "Provider" || prop === "Consumer") {
				return { $$typeof: Symbol.for("react.provider"), _context: proxy };
			}
			if (prop === "addListener" || prop === "removeListeners") return () => {};

			// 4. Return existing mocks or cached children
			if (prop in obj) return obj[prop];

			// 5. SELF-HEALING: return a new proxy for anything missing.
			// Only heal PascalCase properties (Icons/Components) or camelCase (methods)
			// Avoid healing internal lowercase/underscore props that might be logic checks.
			const propStr = String(prop);
			const isLikelyMethodOrComp = /^[a-zA-Z]/.test(propStr);
			
			if (!isLikelyMethodOrComp) return undefined;

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
