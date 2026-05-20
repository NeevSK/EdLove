/**
 * No-op shim for the Node.js 'fs' module.
 * This prevents runtime crashes in the browser when libraries attempt to
 * perform file system operations.
 */

const readFileSync = (path, _options) => {
  console.warn(`[Shim] fs.readFileSync is a no-op matching path: ${path}`);
  return '';
};

const writeFileSync = (path, _data, _options) => {
  console.warn(`[Shim] fs.writeFileSync is a no-op matching path: ${path}`);
};

const existsSync = (path) => {
  console.warn(`[Shim] fs.existsSync always returns false for path: ${path}`);
  return false;
};

const mkdirSync = (path, _options) => {
  console.warn(`[Shim] fs.mkdirSync is a no-op for path: ${path}`);
};

const readdirSync = (path, _options) => {
  console.warn(`[Shim] fs.readdirSync always returns [] for path: ${path}`);
  return [];
};

const statSync = (path, _options) => {
  console.warn(`[Shim] fs.statSync is a no-op for path: ${path}`);
  return {
    isDirectory: () => false,
    isFile: () => false,
    size: 0,
  };
};

const lstatSync = statSync;

const promises = {
  readFile: async () => '',
  writeFile: async () => {},
  readdir: async () => [],
  mkdir: async () => {},
  stat: async () => statSync(),
  lstat: async () => statSync(),
};

const fs = {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  lstatSync,
  promises,
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
fs.default = fs;
fs.__esModule = true;

export {
  existsSync,
  lstatSync,
  mkdirSync,
  promises,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
};
export default fs;

if (typeof module !== 'undefined') {
  module.exports = fs;
}
