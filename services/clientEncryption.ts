/**
 * Client-Side Encryption Service
 *
 * Implements Snowden's protocol-level protection:
 * "Design your app so there will never be a head the state can point a gun at."
 *
 * - Keys generated and stored CLIENT-SIDE only (localStorage)
 * - Data encrypted BEFORE leaving the browser
 * - Server (Firebase) only sees ciphertext
 * - Even Xela Studio cannot decrypt client data
 */

// --- Key Management ---

export interface EncryptionKeyPair {
  id: string;           // Key fingerprint (first 8 chars of hash)
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
  createdAt: number;
}

/**
 * Generate a new AES-GCM 256-bit key for symmetric encryption.
 * Stored in localStorage — never sent to server.
 */
export const generateClientKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable — so we can export for backup
    ['encrypt', 'decrypt']
  );
};

/**
 * Export key to storable format (JWK)
 */
export const exportKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return await crypto.subtle.exportKey('jwk', key);
};

/**
 * Import key from stored JWK format
 */
export const importKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Get or create the client's encryption key.
 * Stored in localStorage under 'xela-vault-key'.
 * Returns null if no key exists and createIfMissing is false.
 */
export const getClientKey = async (createIfMissing: boolean = true): Promise<CryptoKey | null> => {
  const stored = localStorage.getItem('xela-vault-key');
  if (stored) {
    try {
      const jwk = JSON.parse(stored);
      return await importKey(jwk);
    } catch {
      // Corrupted key — regenerate if allowed
      if (createIfMissing) {
        localStorage.removeItem('xela-vault-key');
        return getClientKey(true);
      }
      return null;
    }
  }
  if (!createIfMissing) return null;

  const key = await generateClientKey();
  const jwk = await exportKey(key);
  localStorage.setItem('xela-vault-key', JSON.stringify(jwk));
  return key;
};

/**
 * Get key fingerprint (first 16 hex chars of SHA-256 hash of key material)
 */
export const getKeyFingerprint = async (key: CryptoKey): Promise<string> => {
  const jwk = await exportKey(key);
  const data = new TextEncoder().encode(JSON.stringify(jwk));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
};

// --- Encryption / Decryption ---

/**
 * Encrypt any JSON-serializable data.
 * Returns a base64 string containing IV + ciphertext.
 */
export const encryptData = async (data: any, key: CryptoKey): Promise<string> => {
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  // Concatenate IV + ciphertext, then base64 encode
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypt data that was encrypted with encryptData.
 * Returns the original JSON object.
 */
export const decryptData = async <T = any>(encryptedBase64: string, key: CryptoKey): Promise<T> => {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
};

// --- Key Backup ---

/**
 * Export key as a downloadable backup file.
 * User MUST save this — it's the only way to recover their data.
 */
export const exportKeyBackup = async (): Promise<{ content: string; filename: string } | null> => {
  const key = await getClientKey(false);
  if (!key) return null;

  const jwk = await exportKey(key);
  const fingerprint = await getKeyFingerprint(key);

  const backup = {
    _type: 'xela-vault-key-backup',
    _warning: 'This is your encryption key. Keep it safe. Without it, your encrypted data cannot be recovered.',
    fingerprint,
    key: jwk,
    exportedAt: new Date().toISOString()
  };

  return {
    content: JSON.stringify(backup, null, 2),
    filename: `xela-vault-key-${fingerprint}.json`
  };
};

/**
 * Import a key from a backup file.
 */
export const importKeyBackup = async (backupJson: string): Promise<{ success: boolean; fingerprint: string }> => {
  const backup = JSON.parse(backupJson);
  if (backup._type !== 'xela-vault-key-backup') {
    throw new Error('Invalid key backup file');
  }

  const key = await importKey(backup.key);
  const jwk = await exportKey(key);
  localStorage.setItem('xela-vault-key', JSON.stringify(jwk));
  const fingerprint = await getKeyFingerprint(key);

  return { success: true, fingerprint };
};

// --- Deletion Proof ---

/**
 * Generate cryptographic proof that data was deleted.
 * Returns a hash chain entry: SHA-256(previous_hash + deleted_data_hash + timestamp)
 */
export const generateDeletionProof = async (
  dataToDelete: any,
  previousProofHash?: string
): Promise<{ hash: string; timestamp: string; previousHash: string | null }> => {
  const timestamp = new Date().toISOString();
  const dataHash = await hashData(JSON.stringify(dataToDelete));

  const proofInput = `${previousProofHash || 'GENESIS'}:${dataHash}:${timestamp}`;
  const proofHash = await hashData(proofInput);

  return {
    hash: proofHash,
    timestamp,
    previousHash: previousProofHash || null
  };
};

/**
 * SHA-256 hash helper
 */
const hashData = async (data: string): Promise<string> => {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- Status ---

/**
 * Check if encryption is set up for this client
 */
export const isEncryptionEnabled = (): boolean => {
  return localStorage.getItem('xela-vault-key') !== null;
};
