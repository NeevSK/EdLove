import crypto from 'node:crypto';

// Use a 32-byte secret derived from env, or a stable fallback for development
const SECRET = (
  process.env.BYOK_ENCRYPTION_SECRET || 'default-32-character-secret-key-12345'
).substring(0, 32);
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function encryptKey(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:encryptedText:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decryptKey(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0]!, 'hex');
  const encrypted = parts[1]!;
  const authTag = Buffer.from(parts[2]!, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
