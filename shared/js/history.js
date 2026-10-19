/**
 * SMARTVMS QA HUB - TEST EXECUTION HISTORY & SESSIONS MODULE (JS)
 * Standard Compliance: ISO 9001:2015 Clause 7.5 & 8.5.2 | ISO/IEC/IEEE 29119-3:2021 Clause 7
 * Real-time Execution Audit Trail, Session Tracking, Multi-criteria Filtering & Personal Test Reporting
 */

let currentFilteredLogs = [];
let activeDetailLog = null;

function initHistoryModule() {
  initCoreState();
  const u = getCurrentUser();
  if (!u) return;

  populateHistoryProjectSelect();
  populateHistoryModuleFilter();
  populateHistorySessionFilter();
  renderHistorySessionBanner();
  renderHistoryLogs();
}

function populateHistoryProjectSelect() {
  const sel = document.getElementById('hist-project-select');
  if (!sel) return;
  sel.innerHTML = '';
  const u = getCurrentUser();
  const prjs = getAccessibleProjects(u);
  prjs.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (p.id === state.activeProjectId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function populateHistoryModuleFilter() {
  const sel = document.getElementById('filter-hist-module');
  if (!sel) return;
  const u = getCurrentUser();
  const mods = getAccessibleModulesForUser(u, state.activeProjectId);
  sel.innerHTML = `<option value="">Tất cả phân hệ (${mods.length})</option>`;
  mods.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `[${m.id}] ${m.name}`;
    sel.appendChild(opt);
  });
}

function populateHistorySessionFilter() {
  const sel = document.getElementById('filter-hist-session');
  if (!sel) return;
  const logs = state.executionLogs || [];
  const sessionNames = Array.from(new Set(logs.map(l => l.sessionName).filter(Boolean)));
  sel.innerHTML = '<option value="">Tất cả các phiên kiểm thử</option>';
  if (state.session?.name && !sessionNames.includes(state.session.name)) {
    sessionNames.unshift(state.session.name);
  }
  sessionNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `🎯 ${name}`;
    sel.appendChild(opt);
  });
}

function renderHistorySessionBanner() {
  const s = state.session || {};
  const elName = document.getElementById('hist-session-name');
  const elOwner = document.getElementById('hist-session-owner');
  const elVer = document.getElementById('hist-session-version');
  const elNotes = document.getElementById('hist-session-notes');

  if (elName) elName.textContent = s.name || 'Sprint 1 - Regression Test';
  if (elOwner) elOwner.textContent = s.owner || 'Nguyễn Văn Huy (QA Lead)';
  if (elVer) elVer.textContent = s.version || 'v2.0';
  if (elNotes) elNotes.textContent = s.notes || 'Kiểm thử toàn diện 12 phân hệ nghiệp vụ';
}

function renderHistoryLogs() {
  const tbody = document.getElementById('hist-logs-tbody');
  if (!tbody) return;

  const u = getCurrentUser();
  const logs = getTesterExecutionLogs(u.role === 'admin' ? null : u.username, state.activeProjectId);

  const modFilter = document.getElementById('filter-hist-module')?.value || '';
  const statusFilter = document.getElementById('filter-hist-status')?.value || '';
  const sessionFilter = document.getElementById('filter-hist-session')?.value || '';
  const q = (document.getElementById('filter-hist-search')?.value || '').toLowerCase().trim();

  currentFilteredLogs = logs.filter(log => {
    if (modFilter && log.module !== modFilter) return false;
    if (statusFilter && (log.status || '').toUpperCase() !== statusFilter.toUpperCase()) return false;
    if (sessionFilter && log.sessionName !== sessionFilter) return false;
    if (q) {
      const matchId = (log.tcId || '').toLowerCase().includes(q);
      const matchName = (log.tcName || '').toLowerCase().includes(q);
      const matchAct = (log.actualResult || '').toLowerCase().includes(q);
      const matchFail = (log.failReason || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchAct && !matchFail) return false;
    }
    return true;
  });

  // Calculate Metrics
  const total = currentFilteredLogs.length;
  let pass = 0, fail = 0, blocked = 0, skip = 0;
  currentFilteredLogs.forEach(l => {
    const s = (l.status || '').toUpperCase();
    if (s === 'PASS' || s === 'PASSED') pass++;
    else if (s === 'FAIL' || s === 'FAILED') fail++;
    else if (s === 'BLOCKED') blocked++;
    else if (s === 'SKIP') skip++;
  });

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setVal('kpi-hist-total', total);
  setVal('kpi-hist-pass', pass);
  setVal('kpi-hist-fail', fail);
  setVal('kpi-hist-skip', skip + blocked);
  setVal('hist-log-count', total);

  if (currentFilteredLogs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:36px 16px; color:var(--text-muted)">
          <div style="font-size:26px; margin-bottom:8px">📜</div>
          <div style="font-weight:700; color:var(--text-primary); font-size:13px">Chưa có nhật ký kiểm thử nào được ghi nhận</div>
          <div style="font-size:11.5px; margin-top:4px">Sau khi thực thi kịch bản trên Bàn Thực Thi và bấm <strong>💾 Lưu kết quả</strong>, nhật ký sẽ tự động xuất hiện tại đây theo chuẩn ISO/IEC/IEEE 29119-3.</div>
          <div style="margin-top:12px">
            <a href="execution.html" class="btn btn-primary btn-sm">▶️ Mở Bàn Thực Thi Ngay</a>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = currentFilteredLogs.map((log, index) => {
    const dateStr = log.executedAt ? new Date(log.executedAt).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    }) : '--';

    const s = (log.status || 'Pass').toUpperCase();
    let badgeClass = 'badge-pass';
    let icon = '✅';
    let label = 'Pass (Đạt)';
    if (s === 'FAIL' || s === 'FAILED') { badgeClass = 'badge-fail'; icon = '❌'; label = 'Fail (Lỗi)'; }
    else if (s === 'BLOCKED') { badgeClass = 'badge'; icon = '⛔'; label = 'Blocked (Bị chặn)'; }
    else if (s === 'SKIP') { badgeClass = 'badge-skip'; icon = '⏭'; label = 'Skip (Bỏ qua)'; }

    const isAdhoc = log.isAdhoc || (log.tcId && log.tcId.startsWith('INC-'));
    const idHtml = isAdhoc 
      ? `<span class="badge" style="background:#ea580c; color:#fff; font-size:10px; font-weight:800; font-family:monospace">${log.tcId}</span>`
      : `<span style="font-family:monospace; font-weight:800; color:var(--primary)">[${log.tcId}]</span>`;
    const adhocBadge = isAdhoc
      ? `<span class="badge" style="background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-size:9.5px; margin-left:4px">🐞 Lỗi Ngoài Kịch Bản</span>`
      : '';

    return `
      <tr style="${isAdhoc ? 'background:rgba(234,88,12,0.03)' : ''}">
        <td style="font-size:11.5px; color:var(--text-muted); white-space:nowrap">${dateStr}</td>
        <td>${idHtml}</td>
        <td style="text-align:center">
          <span class="badge badge-nr" style="font-size:10.5px">${log.module || 'M01'}</span>
        </td>
        <td>
          <strong style="color:var(--text-primary); font-size:12.5px">${escapeHtml(log.tcName || log.tcId)}</strong>${adhocBadge}
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px">🎯 Phiên: <em>${escapeHtml(log.sessionName || 'Sprint 1')}</em></div>
        </td>
        <td style="text-align:center">
          <span class="badge ${badgeClass}" style="${s === 'BLOCKED' ? 'background:#fee2e2;color:#991b1b;border:1px solid #f87171' : ''}">${icon} ${label}</span>
        </td>
        <td style="font-size:12px; line-height:1.4">
          <div style="color:var(--text-primary)">${escapeHtml(log.actualResult || 'Đã ghi nhận kết quả thực thi.')}</div>
          ${log.failReason ? `<div style="font-size:11px; color:#dc2626; margin-top:3px; font-weight:600">🐞 <strong>Lỗi:</strong> ${escapeHtml(log.failReason)}</div>` : ''}
          ${log.skipReason && s === 'SKIP' ? `<div style="font-size:11px; color:#b45309; margin-top:3px">⏭ <strong>Lý do bỏ qua:</strong> ${escapeHtml(log.skipReason)}</div>` : ''}
          ${log.defectCategory ? `<div style="margin-top:3px"><span style="font-size:10px; font-weight:700; padding:1px 6px; border-radius:3px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1">🏷️ ${escapeHtml(log.defectCategory)}</span></div>` : ''}
        </td>
        <td style="text-align:center">
          ${log.evidenceCount > 0 ? `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:10.5px">📸 ${log.evidenceCount} ảnh</span>` : '<span style="color:var(--text-muted); font-size:11px">-</span>'}
        </td>
        <td style="text-align:center; white-space:nowrap">
          <button type="button" class="btn btn-outline btn-xs" onclick="viewLogDetail('${log.id}')" title="Xem chi tiết nhật ký">👁️ Xem</button>
          <a href="execution.html?tc=${log.tcId}" class="btn btn-primary btn-xs" style="text-decoration:none" title="Chạy lại kịch bản này">▶️ Retest</a>
        </td>
      </tr>
    `;
  }).join('');
}

function resetHistoryFilters() {
  const elMod = document.getElementById('filter-hist-module');
  const elSt = document.getElementById('filter-hist-status');
  const elSess = document.getElementById('filter-hist-session');
  const elQ = document.getElementById('filter-hist-search');

  if (elMod) elMod.value = '';
  if (elSt) elSt.value = '';
  if (elSess) elSess.value = '';
  if (elQ) elQ.value = '';

  renderHistoryLogs();
}

function viewLogDetail(logId) {
  const log = (state.executionLogs || []).find(l => l.id === logId);
  if (!log) return;
  activeDetailLog = log;

  const tc = getAllTcs().find(t => t.id === log.tcId) || {};
  const evidences = state.evidences[log.tcId] || [];

  const body = document.getElementById('modal-hist-body');
  if (body) {
    body.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; background:var(--bg-surface); padding:12px; border-radius:8px; border:1px solid var(--border)">
        <div>
          <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700">Mã Nhật Ký Audit (ISO 29119-3)</div>
          <div style="font-size:13px; font-weight:800; color:var(--primary); font-family:monospace">${log.id}</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700">Thời Điểm Ghi Nhận</div>
          <div style="font-size:13px; font-weight:700">${new Date(log.executedAt).toLocaleString('vi-VN')}</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700">Phiên Kiểm Thử</div>
          <div style="font-size:12.5px; font-weight:700">🎯 ${escapeHtml(log.sessionName || 'Sprint 1')}</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700">Tester Thực Hiện</div>
          <div style="font-size:12.5px; font-weight:700">👤 ${escapeHtml(log.testerName || log.testerUsername)}</div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px">
          <span style="font-family:monospace; font-weight:800; font-size:13px; color:var(--primary)">[${log.tcId}]</span>
          <span class="badge badge-nr">${log.module || 'M01'}</span>
          <span class="badge ${log.status === 'Pass' ? 'badge-pass' : (log.status === 'Fail' ? 'badge-fail' : 'badge-skip')}">${log.status}</span>
        </div>
        <div style="font-size:14px; font-weight:800; color:var(--text-primary)">${escapeHtml(log.tcName || log.tcId)}</div>
        ${tc.reqId ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:2px">📌 Yêu cầu SRS: <code>${tc.reqId}</code></div>` : ''}
      </div>

      <div style="margin-bottom:12px">
        <label style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:4px">👁️ Kết quả thực tế quan sát được (Actual Result):</label>
        <div style="font-size:12.5px; line-height:1.45; background:var(--bg-body); padding:10px 12px; border-radius:6px; border:1px solid var(--border)">
          ${escapeHtml(log.actualResult || 'Không có mô tả chi tiết.')}
        </div>
      </div>

      ${log.failReason ? `
        <div style="margin-bottom:12px; background:#fff1f2; border:1.5px solid #fecdd3; border-radius:8px; padding:10px 12px">
          <div style="font-size:11.5px; font-weight:800; color:#e11d48; margin-bottom:4px">🐞 Sự Cố Phát Hiện (Defect Report):</div>
          <div style="font-size:12.5px; color:#be123c; font-weight:600">${escapeHtml(log.failReason)}</div>
          <div style="display:flex; gap:12px; font-size:11px; color:#9f1239; margin-top:6px; flex-wrap:wrap">
            <span><strong>Phân loại:</strong> ${log.defectCategory || 'Logic nghiệp vụ'}</span>
            <span><strong>Mức nghiêm trọng:</strong> ${log.severity || 'Critical'}</span>
            ${log.assignedDev ? `<span><strong>Dev phụ trách:</strong> ${log.assignedDev}</span>` : ''}
          </div>
        </div>
      ` : ''}

      ${log.skipReason ? `
        <div style="margin-bottom:12px; background:#fffbeb; border:1.5px solid #fde68a; border-radius:8px; padding:10px 12px">
          <div style="font-size:11.5px; font-weight:800; color:#b45309; margin-bottom:4px">⏭️ Lý Do Bỏ Qua Kịch Bản:</div>
          <div style="font-size:12px; color:#92400e">${escapeHtml(log.skipReason)}</div>
        </div>
      ` : ''}

      <div>
        <label style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:6px">📸 Bằng chứng ảnh đính kèm (${evidences.length}):</label>
        ${evidences.length > 0 ? `
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:8px">
            ${evidences.map(ev => `
              <img src="${ev.url}" alt="Evidence" style="width:100%; height:90px; object-fit:cover; border-radius:6px; border:1px solid var(--border); cursor:pointer" onclick="openLightbox('${ev.url}', 'Bằng chứng [${log.tcId}]')" />
            `).join('')}
          </div>
        ` : `
          <div style="font-size:11.5px; color:var(--text-muted); font-style:italic">Không có ảnh bằng chứng nào được đính kèm ở lượt test này.</div>
        `}
      </div>
    `;
  }

  const btnRetest = document.getElementById('btn-modal-retest');
  if (btnRetest) {
    btnRetest.onclick = () => {
      window.location.href = `execution.html?tc=${log.tcId}`;
    };
  }

  openModal('modal-hist-detail');
}

function printHistory() {
  window.print();
}

function exportHistoryHtml() {
  const u = getCurrentUser();
  const prj = getActiveProject();
  const logs = currentFilteredLogs.length > 0 ? currentFilteredLogs : (state.executionLogs || []);

  let rows = logs.map((l, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${l.executedAt ? new Date(l.executedAt).toLocaleString('vi-VN') : '--'}</td>
      <td><strong>[${l.tcId}]</strong> ${escapeHtml(l.tcName)}</td>
      <td>${l.module}</td>
      <td style="text-align:center; font-weight:bold; color:${l.status === 'Pass' ? '#16a34a' : (l.status === 'Fail' ? '#dc2626' : '#d97706')}">${l.status}</td>
      <td>${escapeHtml(l.actualResult || '')} ${l.failReason ? '<br/><span style="color:red">Lỗi: ' + escapeHtml(l.failReason) + '</span>' : ''}</td>
      <td>${escapeHtml(l.sessionName || '')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8"/>
      <title>Nhật Ký Thực Thi Kiểm Thử - ${prj?.name || 'SmartVMS'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
        h1 { font-size: 20px; color: #1e3a8a; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #64748b; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>NHẬT KÝ THỰC THI KIỂM THỬ (TEST EXECUTION AUDIT LOG)</h1>
      <div class="meta">
        <div><strong>Tiêu chuẩn áp dụng:</strong> ISO 9001:2015 Clause 7.5 & 8.5.2 | ISO/IEC/IEEE 29119-3:2021 Clause 7</div>
        <div><strong>Dự án:</strong> ${prj?.name} (${prj?.id}) | <strong>Phiên test:</strong> ${state.session?.name}</div>
        <div><strong>Tester thực hiện:</strong> ${u.name} (${u.username}) | <strong>Ngày xuất:</strong> ${new Date().toLocaleString('vi-VN')}</div>
        <div><strong>Tổng số lượt test:</strong> ${logs.length} bản ghi</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40px; text-align:center">STT</th>
            <th style="width:140px">Thời Gian</th>
            <th>Kịch Bản Kiểm Thử</th>
            <th style="width:70px">Phân Hệ</th>
            <th style="width:80px; text-align:center">Đánh Giá</th>
            <th>Kết Quả Thực Tế / Ghi Chú Lỗi</th>
            <th style="width:160px">Phiên Test</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NhatKyKiemThu_${u.username}_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('⬇️ Đã xuất file Nhật ký thực thi kiểm thử (HTML)!', 'success');
}
