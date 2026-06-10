/**
 * Universal Shim for Node.js networking modules ('net', 'tls', 'dns', etc).
 * Focus on providing enough structure to satisfy the bundler without crashing
 * on property access.
 */

const noop = () => {};

// Self-healing proxy that returns itself/no-ops for any property access
const proxyBase = new Proxy(
  () => {
    return proxyBase;
  },
  {
    get: (_target, prop) => {
      if (prop === 'default' || prop === '__esModule') return true;
      return proxyBase;
    },
  },
);

const nodeNetShim = {
  connect: () => proxyBase,
  createConnection: () => proxyBase,
  createServer: () => proxyBase,
  isIP: () => 0,
  isIPv4: () => false,
  isIPv6: () => false,
  lookup: noop,
  resolve: noop,
  ...proxyBase,
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
nodeNetShim.default = nodeNetShim;
nodeNetShim.__esModule = true;

if (typeof module !== 'undefined') {
  module.exports = nodeNetShim;
}
