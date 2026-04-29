// @ts-ignore - package does not ship declarations
import * as SLPostal from 'srilankan-postalcode-backend';

/**
 * Validates and Infers location details from a Sri Lankan postal code.
 */
export function inferFromPostalCode(code: string) {
  if (!code) return null;

  // The backend package provides robust validation and data
  const isValid = SLPostal.validate(code);
  if (!isValid) return null;

  // Use internal mapping for known core IDs based on the code prefix
  // Sri Lankan postal codes first 2 digits often represent the district/region.
  const regionPrefix = code.substring(0, 2);

  // Map of prefix to core District IDs
  const prefixMap: Record<string, string> = {
    '00': 'CO',
    '10': 'CO',
    '11': 'GA',
    '12': 'KL',
    '20': 'KY',
    '21': 'MT',
    '22': 'NE',
    '30': 'KU',
    '31': 'KU',
    '32': 'PU',
    '40': 'JA',
    '41': 'KI',
    '42': 'MN',
    '43': 'VA',
    '44': 'MU',
    '50': 'AN',
    '51': 'PO',
    '60': 'BD',
    '61': 'MO',
    '70': 'RG',
    '71': 'KE',
    '80': 'GL',
    '81': 'MA',
    '82': 'HA',
  };

  return {
    isValid: true,
    districtId: prefixMap[regionPrefix] || '',
    city: '', // Placeholder as exact city requires full lookup
  };
}
