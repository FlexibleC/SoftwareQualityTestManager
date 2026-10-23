/**
 * VERCEL SERVERLESS FUNCTION: /api/auth/me
 * API Xác thực phiên làm việc hiện tại từ JWT Token / Cookie
 */

const { handleCors, sendJson } = require('../_lib/response');
const { extractToken, verifyToken } = require('../_lib/crypto-auth');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Phương thức không được hỗ trợ. Vui lòng dùng GET.' });
  }

  const token = extractToken(req);
  if (!token) {
    return sendJson(res, 401, { authenticated: false, error: 'Chưa có phiên đăng nhập hợp lệ.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return sendJson(res, 401, { authenticated: false, error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
  }

  return sendJson(res, 200, {
    authenticated: true,
    user: {
      id: payload.id,
      username: payload.username,
      name: payload.name,
      role: payload.role
    }
  });
};
