/**
 * SQTM BACKEND AUTH GUARD MIDDLEWARE
 * Kiểm tra quyền hạn (Role-based Access Control - RBAC) cho các Serverless API
 */

const { extractToken, verifyToken } = require('./crypto-auth');
const { sendJson } = require('./response');

/**
 * Kiểm tra xác thực và phân quyền cho request
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {Array<string>} allowedRoles - Danh sách role được phép (VD: ['admin', 'project_lead', 'lead'])
 * @returns {object|null} - User payload nếu hợp lệ, ngược lại trả về null (đã tự động gửi response 401/403)
 */
function authenticateRequest(req, res, allowedRoles = []) {
  const token = extractToken(req);
  if (!token) {
    sendJson(res, 401, { error: 'Yêu cầu xác thực. Vui lòng đăng nhập để tiếp tục.' });
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    sendJson(res, 401, { error: 'Phiên làm việc đã hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại.' });
    return null;
  }

  // Chuẩn hóa role (lead và project_lead là tương đương)
  const userRole = user.role === 'project_lead' ? 'lead' : user.role;
  const normalizedAllowed = allowedRoles.map(r => r === 'project_lead' ? 'lead' : r);

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole) && userRole !== 'admin') {
    sendJson(res, 403, {
      error: `Truy cập bị từ chối. Thao tác này yêu cầu quyền [${allowedRoles.join(', ')}], vai trò hiện tại của bạn là [${user.role}].`
    });
    return null;
  }

  return user;
}

module.exports = {
  authenticateRequest
};
