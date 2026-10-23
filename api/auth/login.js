/**
 * VERCEL SERVERLESS FUNCTION: /api/auth/login
 * API Xác thực Đăng nhập Hệ thống & Cấp phát Token JWT an toàn
 */

const { handleCors, sendJson, parseBody } = require('../_lib/response');
const { verifyPassword, signToken, hashPassword } = require('../_lib/crypto-auth');
const supabaseAdmin = require('../_lib/supabase-admin');

// Danh sách tài khoản dự phòng khi chưa chạy file SQL migration trên Database
const FALLBACK_USERS = [
  { id: 'usr_001', username: 'admin', passwordHash: hashPassword('123'), name: 'Nguyễn Văn Huy', role: 'admin', roleTitle: 'Quản trị viên Cấp cao (Super Admin)', email: 'huy.nv@smartvms.local' },
  { id: 'usr_006', username: 'lead', passwordHash: hashPassword('123'), name: 'Hoàng Hải Đăng', role: 'project_lead', roleTitle: 'Quản trị viên dự án (QA Lead)', email: 'dang.hh@smartvms.local' },
  { id: 'usr_002', username: 'tester', passwordHash: hashPassword('123'), name: 'Nguyễn Văn Nam', role: 'tester', roleTitle: 'Kiểm thử viên 1', email: 'nam.nv@smartvms.local' },
  { id: 'usr_003', username: 'tester2', passwordHash: hashPassword('123'), name: 'Trần Thị Lan', role: 'tester', roleTitle: 'Kiểm thử viên 2', email: 'lan.tt@smartvms.local' },
  { id: 'usr_004', username: 'tester3', passwordHash: hashPassword('123'), name: 'Lê Hoàng Minh', role: 'tester', roleTitle: 'Kiểm thử viên 3', email: 'minh.lh@smartvms.local' },
  { id: 'usr_005', username: 'dev', passwordHash: hashPassword('123'), name: 'Trần Quốc Tuấn', role: 'developer', roleTitle: 'Lập trình viên (Developer)', email: 'tuan.tq@smartvms.local' }
];

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Phương thức không được hỗ trợ. Vui lòng dùng POST.' });
  }

  try {
    const body = await parseBody(req);
    const username = (body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return sendJson(res, 400, { error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
    }

    let authenticatedUser = null;
    let isFromDatabase = false;

    // 1. Kiểm tra tài khoản từ bảng app_users trong Supabase Database
    try {
      const records = await supabaseAdmin.query('app_users', `?username=eq.${encodeURIComponent(username)}&limit=1`);
      if (Array.isArray(records) && records.length > 0) {
        const dbUser = records[0];
        if (dbUser.status === 'LOCKED') {
          return sendJson(res, 403, { error: 'Tài khoản này đang bị khóa. Vui lòng liên hệ Quản trị viên.' });
        }
        if (verifyPassword(password, dbUser.password_hash)) {
          authenticatedUser = {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.name,
            role: dbUser.role,
            roleTitle: dbUser.role_title,
            email: dbUser.email,
            assignedProjects: dbUser.assigned_projects || []
          };
          isFromDatabase = true;
        }
      }
    } catch (dbErr) {
      // Bảng app_users chưa tồn tại hoặc kết nối mạng lỗi -> chuyển sang fallback
      console.warn('Cảnh báo: Không thể truy vấn app_users từ Database, dùng fallback:', dbErr.message);
    }

    // 2. Nếu Database chưa có bảng app_users, dùng danh mục dự phòng chuẩn hóa
    if (!authenticatedUser) {
      const fallback = FALLBACK_USERS.find(u => u.username.toLowerCase() === username);
      if (fallback && verifyPassword(password, fallback.passwordHash)) {
        authenticatedUser = {
          id: fallback.id,
          username: fallback.username,
          name: fallback.name,
          role: fallback.role,
          roleTitle: fallback.roleTitle,
          email: fallback.email,
          assignedProjects: []
        };
      }
    }

    // 3. Nếu thông tin không khớp
    if (!authenticatedUser) {
      return sendJson(res, 401, { error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    // 4. Ký cấp phát Token JWT
    const token = signToken({
      id: authenticatedUser.id,
      username: authenticatedUser.username,
      name: authenticatedUser.name,
      role: authenticatedUser.role
    });

    // 5. Trả về Token và thông tin User
    const cookieHeader = `sqtm_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
    return sendJson(
      res,
      200,
      {
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        isFromDatabase,
        user: authenticatedUser
      },
      { 'Set-Cookie': cookieHeader }
    );
  } catch (err) {
    console.error('Lỗi API Login:', err);
    return sendJson(res, 500, { error: 'Lỗi máy chủ nội bộ trong quá trình đăng nhập.' });
  }
};
