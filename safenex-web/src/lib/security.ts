/**
 * Cryptographic PIN Security Manager matching SafeNex Android SecurityManager architecture.
 * Uses Web Crypto API with SHA-256 + 16-byte random salt + constant-time comparison.
 * The raw PIN is NEVER stored in plain text.
 */

const STORAGE_KEY_PIN_HASH = 'safenex_auth_pin_hash';
const STORAGE_KEY_PIN_SALT = 'safenex_auth_pin_salt';
const DEFAULT_INITIAL_PIN = '1234';

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function computeSaltedHash(pin: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const pinBytes = new TextEncoder().encode(pin);
  const combined = new Uint8Array(salt.length + pinBytes.length);
  combined.set(salt, 0);
  combined.set(pinBytes, salt.length);
  return await crypto.subtle.digest('SHA-256', combined);
}

function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export const securityManager = {
  async initDefaultPinIfUnset(): Promise<void> {
    const existingHash = localStorage.getItem(STORAGE_KEY_PIN_HASH);
    if (!existingHash) {
      await this.setPin(DEFAULT_INITIAL_PIN);
    }
  },

  async verifyPin(candidatePin: string): Promise<boolean> {
    try {
      const storedHashB64 = localStorage.getItem(STORAGE_KEY_PIN_HASH);
      const storedSaltB64 = localStorage.getItem(STORAGE_KEY_PIN_SALT);

      if (!storedHashB64 || !storedSaltB64) {
        // Fallback to default if not yet seeded
        return candidatePin === DEFAULT_INITIAL_PIN;
      }

      const salt = base64ToBuffer(storedSaltB64);
      const expectedHash = base64ToBuffer(storedHashB64);
      const candidateHashBuf = await computeSaltedHash(candidatePin, salt);
      const candidateHash = new Uint8Array(candidateHashBuf);

      return constantTimeCompare(expectedHash, candidateHash);
    } catch (e) {
      console.warn('PIN verification cryptographic failure:', e);
      return false;
    }
  },

  async setPin(newPin: string): Promise<boolean> {
    try {
      if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        return false;
      }
      const salt = new Uint8Array(16);
      crypto.getRandomValues(salt);

      const hashBuf = await computeSaltedHash(newPin, salt);
      const hashB64 = bufferToBase64(hashBuf);
      const saltB64 = bufferToBase64(salt);

      localStorage.setItem(STORAGE_KEY_PIN_HASH, hashB64);
      localStorage.setItem(STORAGE_KEY_PIN_SALT, saltB64);
      return true;
    } catch (e) {
      console.warn('Error setting cryptographic PIN:', e);
      return false;
    }
  },

  isPinConfigured(): boolean {
    return !!localStorage.getItem(STORAGE_KEY_PIN_HASH);
  }
};

