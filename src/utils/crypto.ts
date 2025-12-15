/**
 * Cryptographic utility functions for secure token generation
 */

/**
 * Generates a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32 bytes = 64 hex characters)
 * @returns Hex-encoded random token string
 */
export function generateSecureToken(length: number = 32): string {
  // Generate cryptographically secure random bytes
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Convert to hex string
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a URL-safe secure token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Base64URL-encoded random token string
 */
export function generateUrlSafeToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Convert to base64url (RFC 4648 §5)
  const base64 = btoa(String.fromCharCode(...array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Validates that a string is a valid hex token
 * @param token - Token string to validate
 * @param expectedLength - Expected length in bytes (default: 32)
 * @returns True if valid hex token of expected length
 */
export function isValidToken(token: string, expectedLength: number = 32): boolean {
  const expectedHexLength = expectedLength * 2;
  const hexRegex = /^[0-9a-f]+$/i;

  return (
    token.length === expectedHexLength &&
    hexRegex.test(token)
  );
}
