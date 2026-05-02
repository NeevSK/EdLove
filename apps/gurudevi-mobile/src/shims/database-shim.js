/**
 * Universal Shim for '@repo/database' inside the mobile app.
 * Since mobile cannot connect directly to Postgres via ZenStack/pg,
 * this shim provides a no-op implementation to prevent bundling errors.
 */

const noop = () => {};

const databaseShim = {
	// Matches packages/database/src/client.ts
	getPool: noop,
	createZenStackDb: () => {
		console.warn(
			"[Database-Shim] \uD83D\uDEE1\uFE0F createZenStackDb called on non-supported platform.",
		);
		return new Proxy(
			{},
			{
				get: () => noop,
			},
		);
	},
	canUseZenStackDb: () => false,
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
databaseShim.default = databaseShim;
databaseShim.__esModule = true;

if (typeof module !== "undefined") {
	module.exports = databaseShim;
}
