import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getSecret(): Buffer {
  const configured = process.env.BYOK_ENCRYPTION_SECRET;
  if (!configured || configured.length < 32) {
    throw new Error('BYOK_ENCRYPTION_SECRET must be at least 32 characters before encrypting keys');
  }

  return Buffer.from(configured.substring(0, 32), 'utf8');
}

export function encryptKey(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecret(), iv);

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

  const decipher = crypto.createDecipheriv(ALGORITHM, getSecret(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
