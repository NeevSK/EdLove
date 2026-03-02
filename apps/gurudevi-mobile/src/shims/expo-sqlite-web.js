/**
 * Web shim for expo-sqlite.
 *
 * expo-sqlite uses WebAssembly (wa-sqlite) on web, which requires specific
 * security headers (COOP/COEP) that are often unavailable on static hosts
 * like GitHub Pages.
 *
 * Since this application only uses SQLite for native offline search and
 * defaults to Supabase on web, we shim the entire module to no-ops on web.
 * This prevents the large .wasm file from being loaded and avoids runtime
 * errors about SharedArrayBuffer or security headers.
 */

const SQLite = {
    openDatabaseAsync: async () => ({
        execAsync: async () => { },
        prepareAsync: async () => ({
            executeAsync: async () => { },
            finalizeAsync: async () => { },
        }),
        getAllAsync: async () => [],
        getFirstAsync: async () => null,
        runAsync: async () => { },
        withTransactionAsync: async (callback) => {
            if (typeof callback === 'function') await callback();
        },
        closeAsync: async () => { },
    }),
    deleteDatabaseAsync: async () => { },
    // Legacy support if needed
    openDatabase: () => ({
        transaction: (callback) => { if (typeof callback === 'function') callback({ executeSql: () => { } }); },
    }),
};

module.exports = SQLite;
