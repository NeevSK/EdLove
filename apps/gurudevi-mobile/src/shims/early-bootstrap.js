// This file MUST be pure CJS with ZERO imports so that Hermes evaluates
// global primitives before any transpiled ESM modules or polyfills are loaded.
const g =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : {};

if (typeof g.SharedArrayBuffer === 'undefined') {
  g.SharedArrayBuffer = ArrayBuffer;
}

if (typeof g.FinalizationRegistry === 'undefined') {
  g.FinalizationRegistry = class FinalizationRegistry {
    register() {}
    unregister() { return false; }
  };
}

if (typeof g.WeakRef === 'undefined') {
  g.WeakRef = class WeakRef {
    constructor(target) {
      this._target = target;
    }
    deref() {
      return this._target;
    }
  };
}

// webidl-conversions@8 reads these modern getters at module evaluation time.
// Hermes on older Android devices has neither, and calling `.get` on the
// missing property crashes the route loader before the app can render.
if (!Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'resizable')) {
  Object.defineProperty(ArrayBuffer.prototype, 'resizable', {
    configurable: true,
    get: () => false,
  });
}
if (!Object.getOwnPropertyDescriptor(g.SharedArrayBuffer.prototype, 'growable')) {
  Object.defineProperty(g.SharedArrayBuffer.prototype, 'growable', {
    configurable: true,
    get: () => false,
  });
}

if (typeof g.__dirname === 'undefined') {
  g.__dirname = '/';
}

if (typeof g.setImmediate === 'undefined') {
  g.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
if (typeof g.clearImmediate === 'undefined') {
  g.clearImmediate = (id) => clearTimeout(id);
}

if (typeof g.structuredClone === 'undefined') {
  g.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

if (typeof g.process === 'undefined') {
  g.process = {
    env: { NODE_ENV: 'development' },
    nextTick: (fn) => setTimeout(fn, 0),
    browser: true,
    platform: 'browser',
  };
} else {
  if (typeof g.process.env === 'undefined') g.process.env = { NODE_ENV: 'development' };
  if (typeof g.process.nextTick === 'undefined') g.process.nextTick = (fn) => setTimeout(fn, 0);
  if (typeof window !== 'undefined') g.process.browser = true;
}

if (typeof g.HMRClient === 'undefined') {
  g.HMRClient = {
    setup: () => {},
    enable: () => {},
    disable: () => {},
    registerBundle: () => {},
    log: () => {},
  };
}

