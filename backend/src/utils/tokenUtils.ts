import crypto from "crypto";

/**
 * Token expiration times in milliseconds
 */

export const TOKEN_EXPIRATION = {
  EMAIL_CONFIRMATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hour
};

// Types
interface Token {
  token: string;
  hash: string;
  expiresAt: Date;
}
/**
 * Generates a cryptographically secure random token
 * @returns An object containing the raw token and its hash
 */
export const generateToken = (): Omit<Token, "expiresAt"> => {
  // Generate a random 32-byte (256-bit) token
  const buffer = crypto.randomBytes(32);

  // Convert to a hexadecimal string for easier handling
  const token = buffer.toString("hex");

  // Create a hash of the token for storage in the database
  // This is a security measure so we never store the raw token in the database
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hash };
};

/**
 * Creates a token with an expiration date
 * @param expiresInMs Time until token expires in milliseconds
 * @returns Object with token info (token, hash, and expiration date)
 */

export const createToken = (
  expiresInMs: number = TOKEN_EXPIRATION.EMAIL_CONFIRMATION
): Token => {
  const { token, hash } = generateToken();
  // Create expiration date by adding the specified time to the current date
  const expiresAt = new Date(Date.now() + expiresInMs);
  return { token, hash, expiresAt };
};

/**
 * Hashes a raw token using SHA-256
 * @param token The raw token to hash
 * @returns The hashed token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Verifies if a token hash matches the provided raw token
 * @param rawToken The raw token to verify (from user input)
 * @param storedHash The hash stored in the database
 * @returns Boolean indicating if the token is valid
 */
export const verifyToken = (rawToken: string, storedHash: string): boolean => {
  // Hash the raw token using the same algorithm
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Compare the computed hash with the stored hash
  return hash === storedHash;
};

/**
 * Checks if a token has expired
 * @param tokenExpiration The token's expiration date
 * @returns Boolean indicating if the token has expired
 */
export const isTokenExpired = (tokenExpiration: Date): boolean => {
  return Date.now() > tokenExpiration.getTime();
};
