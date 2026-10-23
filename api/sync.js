/**
 * VERCEL SERVERLESS FUNCTION: /api/sync
 * Đồng bộ hóa kết quả kiểm thử thời gian thực (Atomic Test Results Sync)
 * Bảo mật: Yêu cầu Token JWT của Tester, Lead hoặc Admin để ghi nhận kết quả kiểm thử.
 */

const fs = require('fs');
const path = require('path');
const { handleCors, sendJson, parseBody } = require('./_lib/response');
const { authenticateRequest } = require('./_lib/auth-guard');
const supabaseAdmin = require('./_lib/supabase-admin');

const LOCAL_SYNC_PATH = path.join(process.cwd(), 'data', 'lan_sync_state.json');

function getLocalSyncFallback() {
  try {
    if (fs.existsSync(LOCAL_SYNC_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_SYNC_PATH, 'utf8'));
    }
  } catch (e) {}
  return { results: {}, updatedAt: new Date().toISOString() };
}

function saveLocalSyncFallback(data) {
  try {
    const dir = path.dirname(LOCAL_SYNC_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_SYNC_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method.toUpperCase();

  // 1. GET: Lấy kết quả kiểm thử
  if (method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    const runId = urlObj.searchParams.get('runId') || 'run_001';
    const projectId = urlObj.searchParams.get('projectId');

    try {
      let queryStr = `?run_id=eq.${encodeURIComponent(runId)}&select=*`;
      if (projectId) {
        queryStr += `&project_id=eq.${encodeURIComponent(projectId)}`;
      }

      const dbResults = await supabaseAdmin.query('test_results', queryStr);
      if (Array.isArray(dbResults)) {
        const resultMap = {};
        dbResults.forEach(r => {
          resultMap[r.tc_id] = {
            tcId: r.tc_id,
            status: r.status,
            tester: r.tester,
            assignedTo: r.assigned_to,
            runAt: r.run_at,
            defectStatus: r.defect_status,
            severity: r.severity,
            assignedDev: r.assigned_dev,
            fixVersion: r.fix_version,
            failReason: r.fail_reason,
            note: r.note,
            evidences: r.evidences || []
          };
        });

        return sendJson(res, 200, {
          success: true,
          source: 'database',
          count: Object.keys(resultMap).length,
          runId,
          results: resultMap
        });
      }
    } catch (err) {
      console.warn('Lỗi đọc test_results từ Supabase, dùng fallback đĩa:', err.message);
    }

    const fallback = getLocalSyncFallback();
    return sendJson(res, 200, {
      success: true,
      source: 'local_disk',
      count: Object.keys(fallback.results || {}).length,
      ...fallback
    });
  }

  // 2. POST: Ghi nhận kết quả test (Tester, Lead, Admin)
  if (method === 'POST') {
    const user = authenticateRequest(req, res, ['tester', 'lead', 'project_lead', 'admin']);
    if (!user) return;

    try {
      const payload = await parseBody(req);
      const runId = payload.runId || 'run_001';
      const projectId = payload.projectId || null;

      const rowsToUpsert = [];
      const localCurrent = getLocalSyncFallback();
      if (!localCurrent.results) localCurrent.results = {};

      if (payload.tcId && payload.record) {
        // Cập nhật 1 bài đơn lẻ
        const tcId = payload.tcId;
        const rec = payload.record;
        localCurrent.results[tcId] = { ...rec, tester: rec.tester || user.name || user.username };

        rowsToUpsert.push({
          run_id: runId,
          tc_id: tcId,
          project_id: projectId,
          status: rec.status || 'Not Run',
          tester: rec.tester || user.name || user.username,
          assigned_to: rec.assignedTo || null,
          run_at: rec.runAt || new Date().toISOString(),
          defect_status: rec.defectStatus || 'None',
          severity: rec.severity || null,
          assigned_dev: rec.assignedDev || null,
          fix_version: rec.fixVersion || null,
          fail_reason: rec.failReason || null,
          note: rec.note || null,
          evidences: rec.evidences || []
        });
      } else if (payload.results && typeof payload.results === 'object') {
        // Cập nhật hàng loạt (Batch results)
        for (const [tcId, rec] of Object.entries(payload.results)) {
          if (!rec) continue;
          localCurrent.results[tcId] = { ...rec, tester: rec.tester || user.name || user.username };
          rowsToUpsert.push({
            run_id: runId,
            tc_id: tcId,
            project_id: projectId,
            status: rec.status || 'Not Run',
            tester: rec.tester || user.name || user.username,
            assigned_to: rec.assignedTo || null,
            run_at: rec.runAt || new Date().toISOString(),
            defect_status: rec.defectStatus || 'None',
            severity: rec.severity || null,
            assigned_dev: rec.assignedDev || null,
            fix_version: rec.fixVersion || null,
            fail_reason: rec.failReason || null,
            note: rec.note || null,
            evidences: rec.evidences || []
          });
        }
      }

      // 1. Lưu vào Database
      let dbSaved = false;
      if (rowsToUpsert.length > 0) {
        try {
          await supabaseAdmin.insert('test_results', rowsToUpsert);
          dbSaved = true;
        } catch (dbErr) {
          console.warn('Lỗi ghi test_results vào Supabase, dùng fallback đĩa:', dbErr.message);
        }
      }

      // 2. Lưu bản sao đĩa
      localCurrent.updatedAt = new Date().toISOString();
      saveLocalSyncFallback(localCurrent);

      return sendJson(res, 200, {
        success: true,
        message: `Đã ghi nhận ${rowsToUpsert.length} kết quả kiểm thử bởi @${user.username}.`,
        persistedToDatabase: dbSaved,
        count: rowsToUpsert.length
      });
    } catch (err) {
      console.error('Lỗi API Sync POST:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi ghi nhận kết quả.' });
    }
  }

  // 3. DELETE: Xóa hoặc reset kết quả test (Chỉ Admin hoặc Lead)
  if (method === 'DELETE') {
    const user = authenticateRequest(req, res, ['admin', 'project_lead', 'lead']);
    if (!user) return;

    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const runId = urlObj.searchParams.get('runId');
      const tcId = urlObj.searchParams.get('tcId');

      if (runId && tcId) {
        await supabaseAdmin.remove('test_results', `?run_id=eq.${encodeURIComponent(runId)}&tc_id=eq.${encodeURIComponent(tcId)}`);
      } else if (runId) {
        await supabaseAdmin.remove('test_results', `?run_id=eq.${encodeURIComponent(runId)}`);
      }

      // Reset cache đĩa
      const local = getLocalSyncFallback();
      if (tcId) {
        delete local.results[tcId];
      } else {
        local.results = {};
      }
      local.updatedAt = new Date().toISOString();
      saveLocalSyncFallback(local);

      return sendJson(res, 200, { success: true, message: 'Đã xóa kết quả thành công.' });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 405, { error: `Phương thức ${method} không được hỗ trợ.` });
};
