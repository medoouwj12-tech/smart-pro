import { createCipheriv, createHash, randomBytes } from 'node:crypto';

function encryptionKey(): Buffer {
  const dedicatedKey = process.env.CAMERA_CREDENTIALS_KEY;
  if (dedicatedKey) {
    const key = /^[0-9a-f]{64}$/i.test(dedicatedKey) ? Buffer.from(dedicatedKey, 'hex') : Buffer.from(dedicatedKey, 'base64');
    if (key.length !== 32) throw new Error('مفتاح تشفير بيانات الكاميرات غير صالح.');
    return key;
  }
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) throw new Error('يلزم مفتاح تشفير كاميرات أو AUTH_SECRET آمن على الخادم.');
  return createHash('sha256').update('smartguard-pro/camera-credentials/v1\0').update(authSecret).digest();
}

export function encryptCameraPassword(password: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}
