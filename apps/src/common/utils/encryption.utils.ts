import * as crypto from 'crypto';

/**
 * Encryption utility for data-at-rest encryption using AES-256-GCM
 * Ensures sensitive data (attachments, etc.) are encrypted before database storage
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment or generate for development
 * CRITICAL: In production, this MUST be from a secure secrets manager
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required in production. ' +
        'Generate with: openssl rand -hex 32'
      );
    }
    
    // Development fallback - NOT SECURE FOR PRODUCTION
    console.warn(
      '⚠️  Using default encryption key for development. ' +
      'Set ENCRYPTION_KEY environment variable for production.'
    );
    return Buffer.from('0'.repeat(64), 'hex'); // 32 bytes = 64 hex chars
  }
  
  const keyBuffer = Buffer.from(key, 'hex');
  
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters). ` +
      `Generate with: openssl rand -hex 32`
    );
  }
  
  return keyBuffer;
}

/**
 * Encrypts data using AES-256-GCM
 * Returns base64-encoded encrypted data with IV and auth tag prepended
 * 
 * Format: [IV:16bytes][AuthTag:16bytes][EncryptedData:variable]
 * 
 * @param plaintext - Data to encrypt (string or Buffer)
 * @returns Base64-encoded encrypted data with metadata
 */
export function encrypt(plaintext: string | Buffer): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const plaintextBuffer = Buffer.isBuffer(plaintext)
      ? plaintext
      : Buffer.from(plaintext, 'utf-8');
    
    const encrypted = Buffer.concat([
      cipher.update(plaintextBuffer),
      cipher.final(),
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Combine: IV + AuthTag + Encrypted Data
    const combined = Buffer.concat([iv, authTag, encrypted]);
    
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts data encrypted with encrypt() function
 * 
 * @param encryptedData - Base64-encoded encrypted data with IV and auth tag
 * @returns Decrypted data as Buffer
 */
export function decrypt(encryptedData: string): Buffer {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error('Invalid encrypted data format');
    }
    
    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Decrypts data and returns as UTF-8 string
 * 
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Decrypted string
 */
export function decryptToString(encryptedData: string): string {
  return decrypt(encryptedData).toString('utf-8');
}

/**
 * Encrypts a base64 data URL (e.g., "data:image/png;base64,...")
 * Preserves the data URL format for easier handling
 * 
 * @param dataUrl - Base64 data URL to encrypt
 * @returns Encrypted version maintaining data URL structure
 */
export function encryptDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL format');
  }
  
  const [metadata, base64Data] = dataUrl.split(',');
  
  if (!base64Data) {
    throw new Error('Invalid data URL: missing base64 data');
  }
  
  // Encrypt the base64 portion
  const encrypted = encrypt(base64Data);
  
  // Return with encrypted: prefix to identify encrypted data URLs
  return `encrypted:${metadata},${encrypted}`;
}

/**
 * Decrypts an encrypted data URL back to standard base64 data URL
 * 
 * @param encryptedDataUrl - Encrypted data URL
 * @returns Original base64 data URL
 */
export function decryptDataUrl(encryptedDataUrl: string): string {
  if (!encryptedDataUrl.startsWith('encrypted:')) {
    throw new Error('Invalid encrypted data URL format');
  }
  
  // Remove encrypted: prefix
  const dataUrl = encryptedDataUrl.substring('encrypted:'.length);
  const [metadata, encryptedData] = dataUrl.split(',');
  
  if (!encryptedData) {
    throw new Error('Invalid encrypted data URL: missing encrypted data');
  }
  
  // Decrypt back to base64
  const decryptedBase64 = decryptToString(encryptedData);
  
  return `${metadata},${decryptedBase64}`;
}

/**
 * Validates that encryption key is properly configured
 * Call this on application startup
 */
export function validateEncryptionSetup(): {
  configured: boolean;
  keyLength: number;
  environment: string;
} {
  try {
    const key = getEncryptionKey();
    
    // Test encryption/decryption
    const testData = 'test_encryption_setup';
    const encrypted = encrypt(testData);
    const decrypted = decryptToString(encrypted);
    
    if (decrypted !== testData) {
      throw new Error('Encryption test failed: decrypted data does not match');
    }
    
    return {
      configured: !!process.env.ENCRYPTION_KEY,
      keyLength: key.length,
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    throw new Error(`Encryption setup validation failed: ${error.message}`);
  }
}

/**
 * Generates a new encryption key (for initial setup)
 * DO NOT use this in production code - use external key generation
 * 
 * @returns Hex-encoded encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
