/**
 * Universal Shim for Node.js 'util' module.
 */

const utilShim = {
  inherits: (ctor, superCtor) => {
    if (superCtor) {
      ctor.super_ = superCtor;
      Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
    }
  },
  promisify: (fn) => {
    return (...args) => new Promise((resolve, reject) => {
      fn(...args, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  inspect: (obj) => JSON.stringify(obj, null, 2),
  deprecate: (fn) => fn,
  isFunction: (arg) => typeof arg === 'function',
  isObject: (arg) => arg !== null && typeof arg === 'object',
  isString: (arg) => typeof arg === 'string',
  isNumber: (arg) => typeof arg === 'number',
  isBoolean: (arg) => typeof arg === 'boolean',
  isUndefined: (arg) => typeof arg === 'undefined',
};

// \uD83D\uDED1 EXTREMELY IMPORTANT: Satisfy both ESM (Babel interop) and CJS
utilShim.default = utilShim;
utilShim.__esModule = true;

if (typeof module !== 'undefined') {
  module.exports = utilShim;
}
