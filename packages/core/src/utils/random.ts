/**
 * Sovereign Random Utility (2026)
 *
 * Provides deterministic and secure randomness.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a stable, unique ID using UUID v4.
 * Use this instead of Math.random() for entity IDs.
 */
export const generateDeterministicId = () => {
  return uuidv4();
};

/**
 * Generates a cryptographically secure random value.
 * Uses Web Crypto API if available.
 */
export const secureRandom = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return array[0]! / (0xffffffff + 1);
  }
  // Fallback to Math.random() ONLY if crypto is unavailable (node < 19 without polyfill)
  // eslint-disable-next-line no-restricted-syntax
  return Math.random();
};

/**
 * Generates a random integer between min and max (inclusive).
 */
export const getRandomInt = (min: number, max: number) => {
  const range = max - min + 1;
  return Math.floor(secureRandom() * range) + min;
};

/**
 * Generates a random string of specified length.
 */
export const generateRandomString = (length: number, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(secureRandom() * characters.length));
  }
  return result;
};
