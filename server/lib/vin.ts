/**
 * VIN utility functions for normalization and validation
 */

/**
 * Normalizes a VIN by converting to uppercase and removing whitespace
 * @param raw - Raw VIN string
 * @returns Normalized VIN string
 */
export function normalizeVIN(raw: string): string {
  return (raw || '').toUpperCase().replace(/\s+/g, '');
}

/**
 * Validates that a VIN is exactly 17 characters after normalization
 * @param vin - VIN to validate
 * @returns true if valid, false otherwise
 */
export function isValidVIN(vin: string): boolean {
  const normalized = normalizeVIN(vin);
  return normalized.length === 17;
}