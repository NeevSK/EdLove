/**
 * Node-isms for the Web
 *
 * Defines global.__dirname and global.process to avoid crashes in browser
 * when bundling Node.js libraries.
 *
 * Aggressively shims core Node.js modules to prevent "TypeError: ... is not a function"
 */

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

// 1. Basic Globals
if (typeof g.__dirname === 'undefined') {
  g.__dirname = '/';
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
  // Only mark as browser if we're actually in a browser-like environment
  if (typeof window !== 'undefined') g.process.browser = true;
}

// 2. Module Globals (Attaching Universal Shims to Global Scope)
// We use try-catch or conditional imports if possible, but in Metro/Babel,
// static imports are safer as they are always processed.
import { Buffer } from 'buffer';
import crypto from './crypto-web';
import fs from './fs-web';
import os from './os-web';
import path from './path-web';
import stream from './stream-web';
import util from './util-web';

if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}

// Attach shims to global for legacy libraries if they don't already exist
const shims = { path, fs, os, util, crypto, stream };

Object.keys(shims).forEach((key) => {
  if (typeof g[key] === 'undefined') {
    g[key] = shims[key];
  }
});

if (__DEV__) {
  console.log('[Shim] Node-globals-shim initialized safe-mode');
}
