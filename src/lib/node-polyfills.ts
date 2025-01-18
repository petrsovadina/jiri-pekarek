import { webcrypto } from 'node:crypto';

// Polyfill pro crypto modul
if (!window.crypto) {
  (window as any).crypto = webcrypto;
}
