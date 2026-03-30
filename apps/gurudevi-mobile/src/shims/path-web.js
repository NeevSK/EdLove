/**
 * Lightweight browser-compatible implementation of the Node.js 'path' module.
 * Satisfies both ESM and CommonJS import styles via the Universal Shim pattern.
 */

const normalizeArray = (parts, allowAboveRoot) => {
  const res = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p || p === '.') continue;
    if (p === '..') {
      if (res.length > 0 && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }
  return res;
};

const normalize = (path) => {
  const isAbsolute = path.charAt(0) === '/';
  const trailingSlash = path.substr(-1) === '/';
  let newPath = normalizeArray(path.split('/'), !isAbsolute).join('/');
  if (!newPath && !isAbsolute) newPath = '.';
  if (newPath && trailingSlash) newPath += '/';
  return (isAbsolute ? '/' : '') + newPath;
};

const resolve = (...args) => {
  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : '/';
    if (!path) continue;
    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
};

const join = (...args) => {
  let path = '';
  for (let i = 0; i < args.length; i++) {
    const segment = args[i];
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }
  return normalize(path);
};

const dirname = (path) => {
  if (path.length === 0) return '.';
  const parts = path.split('/');
  if (parts.length === 1) return '.';
  parts.pop();
  const dir = parts.join('/');
  if (dir === '') return path.charAt(0) === '/' ? '/' : '.';
  return dir;
};

const basename = (path, ext) => {
  let f = path.split('/').pop();
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

const extname = (path) => {
  const startDot = path.lastIndexOf('.');
  if (startDot === -1 || startDot === 0) return '';
  return path.substr(startDot);
};

const relative = (from, to) => {
  const fromParts = normalize(from).split('/').filter(Boolean);
  const toParts = normalize(to).split('/').filter(Boolean);
  const length = Math.min(fromParts.length, toParts.length);
  let samePartsLength = length;

  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  let outputParts = [];
  for (let i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join('/');
};

const pathShim = {
  resolve,
  join,
  dirname,
  basename,
  extname,
  relative,
  sep: '/',
  delimiter: ':',
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
// This prevents "Uncaught TypeError: import_path.default.resolve is not a function"
pathShim.default = pathShim;
pathShim.__esModule = true;

if (typeof module !== 'undefined') {
  module.exports = pathShim;
}
