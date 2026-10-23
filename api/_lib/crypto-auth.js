/**
 * SQTM BACKEND AUTH UTILITY (ZERO-DEPENDENCY)
 * Mã hóa mật khẩu & Ký / Xác thực Token JWT chuẩn bảo mật HMAC-SHA256
 */
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'sqtm-enterprise-super-secret-key-2026';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 giờ

// Băm mật khẩu bằng SHA-256 chuẩn
function hashPassword(plainText) {
  return crypto.createHash('sha256').update(String(plainText || '')).digest('hex');
}

// So khớp mật khẩu
function verifyPassword(plainText, hash) {
  if (!plainText || !hash) return false;
  return hashPassword(plainText) === hash.toLowerCase();
}

// Mã hóa Base64 URL-safe
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Giải mã Base64 URL-safe
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Ký tạo Token
function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY_MS
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Xác thực & Giải mã Token
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) {
    return null; // Chữ ký không hợp lệ
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Token hết hạn
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Trích xuất Token từ Authorization header hoặc Cookie
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = req.headers['cookie'] || req.headers['Cookie'];
  if (cookieHeader) {
    const match = cookieHeader.match(/sqtm_token=([^;]+)/);
    if (match) return match[1].trim();
  }
  return null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  extractToken
};
