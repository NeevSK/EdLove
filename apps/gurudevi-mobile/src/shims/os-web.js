/**
 * Universal Shim for Node.js 'os' module.
 */

const osShim = {
  platform: () => 'web',
  arch: () => 'browser',
  release: () => '0.0.0',
  type: () => 'browser',
  uptime: () => 0,
  cpus: () => [],
  networkInterfaces: () => ({}),
  endianness: () => 'LE',
  tmpdir: () => '/tmp',
  homedir: () => '~',
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
osShim.default = osShim;
osShim.__esModule = true;

if (typeof module !== 'undefined') {
  module.exports = osShim;
}
