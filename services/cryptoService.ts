// Helper functions to convert between ArrayBuffer and Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

const ENCRYPTION_KEY_NAME = 'gemini-wallpaper-enc-key';
const ENCRYPTED_API_KEY_NAME = 'gemini-wallpaper-api-key-encrypted';

/**
 * Retrieves the encryption key from localStorage, or generates and stores a new one.
 */
async function getEncryptionKey(): Promise<CryptoKey> {
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (storedKey) {
        const jwk = JSON.parse(storedKey);
        return window.crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    }

    const newKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exportedKey = await window.crypto.subtle.exportKey('jwk', newKey);
    localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));
    return newKey;
}

/**
 * Encrypts the API key and saves it to localStorage.
 * @param apiKey The plaintext API key.
 */
export async function saveApiKey(apiKey: string): Promise<void> {
    try {
        const key = await getEncryptionKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(apiKey);

        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encodedData
        );

        const encryptedData = {
            iv: arrayBufferToBase64(iv),
            data: arrayBufferToBase64(encryptedContent),
        };

        localStorage.setItem(ENCRYPTED_API_KEY_NAME, JSON.stringify(encryptedData));
    } catch (error) {
        console.error("API 키 저장 실패:", error);
        throw new Error("API 키를 암호화하여 저장하는 데 실패했습니다.");
    }
}

/**
 * Loads and decrypts the API key from localStorage.
 * @returns The decrypted API key, or null if not found or on error.
 */
export async function loadAndDecryptApiKey(): Promise<string | null> {
    const storedData = localStorage.getItem(ENCRYPTED_API_KEY_NAME);
    if (!storedData) {
        return null;
    }

    try {
        const key = await getEncryptionKey();
        const { iv: ivBase64, data: encryptedDataBase64 } = JSON.parse(storedData);

        const iv = base64ToArrayBuffer(ivBase64);
        const encryptedData = base64ToArrayBuffer(encryptedDataBase64);

        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );

        return new TextDecoder().decode(decryptedContent);
    } catch (error) {
        console.error("API 키 로드 실패:", error);
        // If decryption fails, clear the corrupted key
        await clearApiKey();
        return null;
    }
}

/**
 * Removes the stored API key from localStorage.
 */
export async function clearApiKey(): Promise<void> {
    localStorage.removeItem(ENCRYPTED_API_KEY_NAME);
}
