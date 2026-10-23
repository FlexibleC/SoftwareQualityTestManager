/**
 * VERCEL SERVERLESS FUNCTION: /api/state
 * Quản trị trạng thái đợt kiểm thử (Test Cycles) & Phân công (Assignments)
 * Bảo mật: Chỉ Admin và Lead có quyền cập nhật phân công và đợt kiểm thử.
 */

const fs = require('fs');
const path = require('path');
const { handleCors, sendJson, parseBody } = require('./_lib/response');
const { authenticateRequest } = require('./_lib/auth-guard');
const supabaseAdmin = require('./_lib/supabase-admin');

const LOCAL_STATE_PATH = path.join(process.cwd(), 'data', 'app_state.json');

function getLocalStateFallback() {
  try {
    if (fs.existsSync(LOCAL_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_STATE_PATH, 'utf8'));
    }
  } catch (e) {}
  return { assignments: [], results: {}, testCycles: [], comments: {}, updatedAt: new Date().toISOString() };
}

function saveLocalStateFallback(data) {
  try {
    const dir = path.dirname(LOCAL_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_STATE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method.toUpperCase();

  // 1. GET: Lấy trạng thái công việc
  if (method === 'GET') {
    const fallback = getLocalStateFallback();
    return sendJson(res, 200, {
      success: true,
      source: 'state_store',
      ...fallback
    });
  }

  // 2. POST: Cập nhật trạng thái phân công / đợt test (Chỉ Admin hoặc Lead)
  if (method === 'POST') {
    const user = authenticateRequest(req, res, ['admin', 'project_lead', 'lead']);
    if (!user) return;

    try {
      const parsed = await parseBody(req);
      parsed.updatedAt = new Date().toISOString();
      parsed.lastModifiedBy = `@${user.username}`;

      // 1. Lưu bản sao trên đĩa
      saveLocalStateFallback(parsed);

      // 2. Nếu có danh sách testCycles, đồng bộ vào bảng test_runs trong Database
      if (Array.isArray(parsed.testCycles) && parsed.testCycles.length > 0) {
        try {
          const testRunsToUpsert = parsed.testCycles.map(c => ({
            id: c.id,
            project_id: c.projectId || null,
            name: c.name || c.title || 'Đợt kiểm thử',
            target_version: c.version || 'v1.0',
            scope_type: c.scope || 'ALL',
            status: c.status || 'ACTIVE',
            created_by: c.createdBy || user.username,
            notes: c.description || c.notes || ''
          }));
          await supabaseAdmin.insert('test_runs', testRunsToUpsert);
        } catch (dbErr) {
          console.warn('Lỗi đồng bộ test_runs vào Supabase:', dbErr.message);
        }
      }

      return sendJson(res, 200, {
        success: true,
        message: `Trạng thái đã được lưu trữ thành công bởi @${user.username}`,
        updatedAt: parsed.updatedAt
      });
    } catch (err) {
      console.error('Lỗi API State POST:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi lưu trữ trạng thái.' });
    }
  }

  return sendJson(res, 405, { error: `Phương thức ${method} không được hỗ trợ.` });
};
