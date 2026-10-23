/**
 * VERCEL SERVERLESS FUNCTION: /api/catalog
 * Quản trị danh mục Kịch bản kiểm thử (Test Cases Catalog) & Phân hệ (Modules)
 * Bảo mật: Chỉ Admin và Lead có quyền cập nhật danh mục kịch bản.
 */

const fs = require('fs');
const path = require('path');
const { handleCors, sendJson, parseBody } = require('./_lib/response');
const { authenticateRequest } = require('./_lib/auth-guard');
const supabaseAdmin = require('./_lib/supabase-admin');

const LOCAL_CATALOG_PATH = path.join(process.cwd(), 'data', 'smartvms_test_catalog.json');
const LOCAL_CATALOG_JS = path.join(process.cwd(), 'data', 'smartvms_test_catalog.js');

function getLocalCatalogFallback() {
  try {
    if (fs.existsSync(LOCAL_CATALOG_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_CATALOG_PATH, 'utf8'));
    }
  } catch (e) {}
  return { modules: [], testCases: [] };
}

function saveLocalCatalogFallback(data) {
  try {
    const dir = path.dirname(LOCAL_CATALOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_CATALOG_PATH, JSON.stringify(data, null, 2), 'utf8');
    fs.writeFileSync(LOCAL_CATALOG_JS, 'window.SMARTVMS_DEFAULT_CATALOG = ' + JSON.stringify(data, null, 2) + ';', 'utf8');
  } catch (e) {}
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method.toUpperCase();

  // 1. GET: Lấy danh mục kịch bản
  if (method === 'GET') {
    try {
      const dbCases = await supabaseAdmin.query('test_cases_custom', '?select=*&limit=5000');
      if (Array.isArray(dbCases) && dbCases.length > 0) {
        return sendJson(res, 200, {
          success: true,
          source: 'database',
          count: dbCases.length,
          testCases: dbCases.map(c => ({
            id: c.tc_id,
            module: c.module,
            name: c.name,
            priority: c.priority,
            precondition: c.precondition,
            steps: c.steps,
            expected: c.expected
          }))
        });
      }
    } catch (err) {
      console.warn('Lỗi đọc test_cases từ Supabase, dùng fallback đĩa:', err.message);
    }

    const fallback = getLocalCatalogFallback();
    return sendJson(res, 200, {
      success: true,
      source: 'local_disk',
      ...fallback
    });
  }

  // 2. POST: Cập nhật danh mục kịch bản (Chỉ Admin và Lead)
  if (method === 'POST') {
    const user = authenticateRequest(req, res, ['admin', 'project_lead', 'lead']);
    if (!user) return;

    try {
      const parsed = await parseBody(req);
      const tcs = parsed.testCases || parsed;
      const fullCatalog = {
        schema: 'https://sqtm.local/schemas/test-catalog-v4.json',
        title: parsed.title || 'Software Quality & Test Management System — Test Catalog',
        version: parsed.version || '3.0.0',
        exportedAt: new Date().toISOString(),
        totalTestCases: Array.isArray(tcs) ? tcs.length : 0,
        modules: parsed.modules || [],
        testCases: tcs
      };

      saveLocalCatalogFallback(fullCatalog);

      return sendJson(res, 200, {
        success: true,
        message: `Đã cập nhật danh mục ${fullCatalog.totalTestCases} kịch bản bởi @${user.username}`,
        count: fullCatalog.totalTestCases
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Lỗi cập nhật danh mục kịch bản.' });
    }
  }

  return sendJson(res, 405, { error: `Phương thức ${method} không được hỗ trợ.` });
};
