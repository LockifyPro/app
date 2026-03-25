// Crypto utilities for client-side encryption
// Uses Web Crypto API for AES-GCM encryption

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Derive encryption key from master password
export async function deriveKey(masterPassword, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    const saltBuffer = salt ? hexToBuffer(salt) : crypto.getRandomValues(new Uint8Array(16));
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );
    
    // Derive AES key using PBKDF2
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
    
    return { key, salt: bufferToHex(saltBuffer) };
}

// Encrypt data with AES-GCM
export async function encryptData(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        dataBuffer
    );
    
    return {
        encrypted: bufferToHex(new Uint8Array(encryptedBuffer)),
        iv: bufferToHex(iv)
    };
}

// Decrypt data with AES-GCM
export async function decryptData(encryptedHex, ivHex, key) {
    const encryptedBuffer = hexToBuffer(encryptedHex);
    const iv = hexToBuffer(ivHex);
    
    try {
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            encryptedBuffer
        );
        
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedBuffer);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data. Invalid master password?');
    }
}

// Helper: Buffer to hex string
function bufferToHex(buffer) {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Helper: Hex string to buffer
function hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

// Store encryption key in session (NOT localStorage for security)
let sessionKey = null;
let sessionSalt = null;

export function setSessionKey(key, salt) {
    sessionKey = key;
    sessionSalt = salt;
}

export function getSessionKey() {
    return { key: sessionKey, salt: sessionSalt };
}

export function clearSessionKey() {
    sessionKey = null;
    sessionSalt = null;
}

export function hasSessionKey() {
    return sessionKey !== null;
}
