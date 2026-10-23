/**
 * VERCEL SERVERLESS FUNCTION: /api/projects
 * Quản trị danh mục Dự án phần mềm độc lập khép kín (Multi-Project Portfolio)
 * Bảo mật: Chỉ Quản trị viên (Admin) và Trưởng nhóm (Lead) mới có quyền tạo/sửa/xóa dự án.
 */

const fs = require('fs');
const path = require('path');
const { handleCors, sendJson, parseBody } = require('./_lib/response');
const { authenticateRequest } = require('./_lib/auth-guard');
const supabaseAdmin = require('./_lib/supabase-admin');

const LOCAL_DATA_PATH = path.join(process.cwd(), 'data', 'projects_state.json');

// Đọc dữ liệu dự phòng từ đĩa nếu Database không khả dụng
function getLocalProjectsFallback() {
  try {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
      const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (parsed.projects || []);
    }
  } catch (e) {}
  return [];
}

// Lưu dữ liệu dự phòng xuống đĩa
function saveLocalProjectsFallback(projects) {
  try {
    const dir = path.dirname(LOCAL_DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      LOCAL_DATA_PATH,
      JSON.stringify({ updatedAt: new Date().toISOString(), totalProjects: projects.length, projects }, null, 2),
      'utf8'
    );
  } catch (e) {}
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method.toUpperCase();

  // 1. GET: Lấy danh sách dự án
  if (method === 'GET') {
    try {
      const dbProjects = await supabaseAdmin.query('projects', '?select=*&order=created_at.desc');
      if (Array.isArray(dbProjects)) {
        // Đồng bộ cache đĩa cục bộ (kể cả khi mảng rỗng [] do đã xóa hết dự án)
        saveLocalProjectsFallback(dbProjects);
        return sendJson(res, 200, {
          success: true,
          source: 'database',
          count: dbProjects.length,
          projects: dbProjects
        });
      }
    } catch (err) {
      console.warn('Lỗi đọc dự án từ Database, dùng fallback đĩa:', err.message);
    }

    // Fallback chỉ khi Database bị ngắt kết nối
    const fallbackProjects = getLocalProjectsFallback();
    return sendJson(res, 200, {
      success: true,
      source: 'local_disk',
      count: fallbackProjects.length,
      projects: fallbackProjects
    });
  }

  // 2. POST / PUT: Tạo mới hoặc cập nhật dự án (Yêu cầu quyền Admin hoặc Lead)
  if (method === 'POST' || method === 'PUT') {
    const user = authenticateRequest(req, res, ['admin', 'project_lead', 'lead']);
    if (!user) return; // Đã xử lý response 401/403

    try {
      const body = await parseBody(req);
      const incomingList = Array.isArray(body) ? body : (body.projects !== undefined ? body.projects : [body]);

      if (!Array.isArray(incomingList)) {
        return sendJson(res, 400, { error: 'Dữ liệu dự án không hợp lệ.' });
      }

      if (incomingList.length === 0) {
        saveLocalProjectsFallback([]);
        return sendJson(res, 200, {
          success: true,
          message: 'Đã cập nhật danh mục dự án (0 dự án).',
          count: 0,
          projects: []
        });
      }

      // Chuẩn hóa định dạng trước khi lưu vào PostgreSQL
      const formattedProjects = incomingList.map(p => ({
        id: String(p.id || `PRJ-${Date.now()}`),
        code: String(p.code || 'PRJ').toUpperCase().trim(),
        name: String(p.name || 'Dự án mới').trim(),
        description: p.description || '',
        active_version: p.activeVersion || p.active_version || '',
        versions: p.versions || [],
        modules: p.modules || [],
        test_cycles: p.testCycles || p.test_cycles || [],
        status: p.status || 'ACTIVE',
        updated_at: new Date().toISOString()
      }));

      let dbSaved = false;
      try {
        // Upsert qua PostgREST với Prefer: resolution=merge-duplicates
        await supabaseAdmin.upsert('projects', formattedProjects, 'id');
        dbSaved = true;
      } catch (dbErr) {
        console.warn('Không thể upsert dự án vào Supabase, lưu fallback đĩa:', dbErr.message);
      }

      // Luôn lưu bản sao bền vững trên đĩa máy chủ
      saveLocalProjectsFallback(formattedProjects);

      return sendJson(res, 200, {
        success: true,
        message: `Đã lưu thành công ${formattedProjects.length} dự án.`,
        persistedToDatabase: dbSaved,
        count: formattedProjects.length,
        projects: formattedProjects
      });
    } catch (err) {
      console.error('Lỗi API Projects POST:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi lưu trữ dự án.' });
    }
  }

  // 3. DELETE: Xóa dự án (Chỉ Admin hoặc Lead)
  if (method === 'DELETE') {
    const user = authenticateRequest(req, res, ['admin', 'project_lead', 'lead']);
    if (!user) return;

    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const projectId = urlObj.searchParams.get('id');

      if (!projectId) {
        return sendJson(res, 400, { error: 'Vui lòng cung cấp projectId cần xóa (?id=...)' });
      }

      try {
        await supabaseAdmin.remove('projects', `?id=eq.${encodeURIComponent(projectId)}`);
      } catch (dbErr) {
        console.warn('Lỗi xóa dự án trên Supabase bảng projects:', dbErr.message);
      }

      try {
        const sessionRows = await supabaseAdmin.query('test_sessions', '?id=eq.system_projects');
        if (Array.isArray(sessionRows) && sessionRows.length > 0 && sessionRows[0].notes) {
          const prjs = JSON.parse(sessionRows[0].notes);
          const filtered = prjs.filter(p => p.id !== projectId);
          await supabaseAdmin.update('test_sessions', '?id=eq.system_projects', {
            notes: JSON.stringify(filtered),
            updated_at: new Date().toISOString()
          });
        }
      } catch (sessErr) {
        console.warn('Lỗi cập nhật test_sessions khi xóa dự án:', sessErr.message);
      }

      // Cập nhật lại đĩa
      const current = getLocalProjectsFallback().filter(p => p.id !== projectId);
      saveLocalProjectsFallback(current);

      return sendJson(res, 200, {
        success: true,
        message: `Đã xóa dự án ${projectId} thành công.`
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 405, { error: `Phương thức ${method} không được hỗ trợ.` });
};
