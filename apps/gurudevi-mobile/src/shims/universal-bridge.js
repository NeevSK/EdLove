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
  const noop = (...args) => createProxyShim(`${name}.result`, {});
  const target = Object.assign(noop, baseMock);
  
  const proxy = new Proxy(target, {
    get: (obj, prop) => {
      if (prop === 'default') return proxy;
      if (prop === '__esModule') return true;
      if (prop in obj) return obj[prop];
      if (typeof prop === 'symbol') return obj[prop];
      
      // NUCLEAR: never return undefined  always a new proxy
      // this means .featureFlags.experiment.anything is always safe
      const child = createProxyShim(`${name}.${String(prop)}`, {});
      obj[prop] = child; // cache it so same prop always returns same object
      return child;
    },
    set: (obj, prop, value) => {
      obj[prop] = value; // allow setting like featureFlags.experiment.x = true
      return true;
    }
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
