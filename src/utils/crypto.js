// // src/utils/crypto.js
import CryptoJS from 'crypto-js';

const secretKey = 'your-secret-key'; // Use a secure, unique secret key

export const encryptText = (text) => {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

export const decryptText = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};