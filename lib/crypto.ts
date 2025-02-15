const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  console.error("Warning: NEXT_PUBLIC_ENCRYPTION_KEY is not set")
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer) as any))
}

// Helper function to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export function getEncryptionKey(): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("NEXT_PUBLIC_ENCRYPTION_KEY is not set. Please configure the environment variable.")
  }
  return ENCRYPTION_KEY
}

// Fallback encryption function using XOR
function xorEncrypt(text: string, key: string): string {
  let result = ""
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(result)
}

// Fallback decryption function using XOR
function xorDecrypt(encryptedText: string, key: string): string {
  const text = atob(encryptedText)
  let result = ""
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

export async function encrypt(text: string): Promise<string> {
  const key = getEncryptionKey()

  try {
    if (!crypto.subtle) {
      console.warn("Web Crypto API not available, falling back to XOR encryption")
      return xorEncrypt(text, key)
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "AES-GCM" }, false, ["encrypt"])

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, data)

    const encryptedArray = new Uint8Array(encrypted)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv)
    combined.set(encryptedArray, iv.length)

    return arrayBufferToBase64(combined.buffer)
  } catch (error) {
    console.error("Encryption error:", error)
    console.warn("Falling back to XOR encryption")
    return xorEncrypt(text, key)
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  const key = getEncryptionKey()

  try {
    if (!crypto.subtle) {
      console.warn("Web Crypto API not available, falling back to XOR decryption")
      return xorDecrypt(encryptedText, key)
    }

    const combined = new Uint8Array(base64ToArrayBuffer(encryptedText))
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "AES-GCM" }, false, [
      "decrypt",
    ])

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, encrypted)

    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error("Decryption error:", error)
    console.warn("Falling back to XOR decryption")
    return xorDecrypt(encryptedText, key)
  }
}

