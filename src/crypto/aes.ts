import {
  createCipher,
  createDecipher,
  randomBytes,
  pbkdf2Sync,
} from 'node:crypto';

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface DecryptionInput {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Generates a cryptographically secure random key
 */
export function generateKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a cryptographically secure random IV for GCM
 */
export function generateIV(): Buffer {
  return randomBytes(12); // GCM uses 12-byte IV
}

/**
 * Derives a key from a password using PBKDF2
 */
export function deriveKey(password: string, salt: string): Buffer {
  return pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

/**
 * Generates a cryptographically secure salt
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Encrypts data using AES-256-GCM
 * Note: Using deprecated API for compatibility, should be migrated to CipherGCM in future versions
 */
export function encrypt(data: string, key: Buffer): EncryptionResult {
  const iv = generateIV();
  // eslint-disable-next-line node/no-deprecated-api
  const cipher = createCipher('aes-256-gcm', key);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypts data using AES-256-GCM
 * Note: Using deprecated API for compatibility, should be migrated to DecipherGCM in future versions
 */
export function decrypt(input: DecryptionInput, key: Buffer): string {
  // eslint-disable-next-line node/no-deprecated-api
  const decipher = createDecipher('aes-256-gcm', key);
  decipher.setAuthTag(Buffer.from(input.authTag, 'hex'));

  let decrypted = decipher.update(input.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Securely wipes a buffer from memory
 */
export function secureWipe(buffer: Buffer): void {
  if (buffer && buffer.length > 0) {
    buffer.fill(0);
  }
}

/**
 * Validates that a string is a valid hex key
 */
export function isValidHexKey(key: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(key);
}
