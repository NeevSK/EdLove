// Web shim for react-native-mmkv V4
// This provides a Map-backed implementation for web builds
import React from 'react';

export function createMMKV(options = {}) {
  const store = new Map();

  return {
    set: (key, value) => {
      store.set(key, value);
      return true;
    },
    getString: (key) => {
      const value = store.get(key);
      return typeof value === 'string' ? value : null;
    },
    getNumber: (key) => {
      const value = store.get(key);
      return typeof value === 'number' ? value : null;
    },
    getBoolean: (key) => {
      const value = store.get(key);
      return typeof value === 'boolean' ? value : false;
    },
    getBuffer: (key) => {
      const value = store.get(key);
      return value instanceof ArrayBuffer ? value : null;
    },
    contains: (key) => store.has(key),
    delete: (key) => store.delete(key),
    remove: (key) => store.delete(key),
    getAllKeys: () => Array.from(store.keys()),
    clearAll: () => store.clear(),
    addOnValueChangedListener: () => ({ remove: () => {} }),
    trim: () => {},
    get byteSize() {
      return 0;
    },
    checkContentChanged: () => false,
  };
}

// V4 hooks — simplified web implementations
export function useMMKVString(key, instance) {
  const [value, setValue] = React.useState(() => instance?.getString(key) ?? null);
  return [
    value,
    (v) => {
      instance?.set(key, v);
      setValue(v);
    },
  ];
}

export function useMMKVNumber(key, instance) {
  const [value, setValue] = React.useState(() => instance?.getNumber(key) ?? null);
  return [
    value,
    (v) => {
      instance?.set(key, v);
      setValue(v);
    },
  ];
}

export function useMMKVBoolean(key, instance) {
  const [value, setValue] = React.useState(() => instance?.getBoolean(key) ?? false);
  return [
    value,
    (v) => {
      instance?.set(key, v);
      setValue(v);
    },
  ];
}

export function useMMKVBuffer(key, instance) {
  const [value, setValue] = React.useState(() => instance?.getBuffer(key) ?? null);
  return [
    value,
    (v) => {
      instance?.set(key, v);
      setValue(v);
    },
  ];
}
