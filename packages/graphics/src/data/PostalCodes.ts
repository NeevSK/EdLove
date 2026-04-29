import * as LKEduGeo from '@intuitui-labs/lk-edu-geo';
import {
  getMnemonicForDistrict,
  inferFromPostalCode as inferInternal,
} from '@intuitui-labs/lk-edu-geo';

/**
 * Validates and Infers location details from a Sri Lankan postal code.
 *
 * BREAKING CYCLES: This now uses the centralized @intuitui-labs/lk-edu-geo
 * data engine instead of hardcoded prefix maps or untyped external backends.
 */
export function inferFromPostalCode(code: string) {
  if (!code) return null;

  const inferred = inferInternal(code);
  if (!inferred) return null;

  return {
    isValid: true,
    // Map official ID (D_11) back to mnemonic (CO) for core compatibility
    districtId: getMnemonicForDistrict(inferred.districtId),
    city: inferred.city,
  };
}
