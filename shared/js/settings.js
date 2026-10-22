/**
 * SMARTVMS QA HUB - SYSTEM SETTINGS & ENTERPRISE GOVERNANCE MODULE (JS)
 * Project Management, User & Access Control (RBAC), Module Catalog, Session & Storage.
 */

let selectedUserRoleFilter = '';
let userSearchTerm = '';
let selectedCycleVersionFilter = null; // null means auto-sync with active version of project

function initSettingsModule() {
  initCoreState();
  loadSessionSettings();
  renderProjectsTab();
  renderUsersTab();
  renderModulesTable();
  renderStorageStats();

  // Check URL params or hash for initial tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab') || window.location.hash.replace('#', '');
  if (tabParam && ['projects', 'users', 'modules', 'session', 'storage', 'cloud'].includes(tabParam)) {
    switchSettingsTab(tabParam);
  }
}

function switchSettingsTab(subtab) {
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
  });
  document.querySelectorAll('.settings-tab-pane').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`settings-pane-${subtab}`);
  if (target) target.classList.add('active');

  if (subtab === 'projects') renderProjectsTab();
  else if (subtab === 'users') renderUsersTab();
  else if (subtab === 'modules') renderModulesTable();
  else if (subtab === 'storage') renderStorageStats();
  else if (subtab === 'cloud') renderCloudTabStats();
}

function renderCloudTabStats() {
  const pill = document.getElementById('tab-cloud-pill');
  const countEl = document.getElementById('tab-cloud-count');
  const count = Object.keys(state.results || {}).length;
  if (countEl) countEl.textContent = `(${count} bản ghi trên hệ thống)`;
  if (pill && typeof initCloudSync === 'function') {
    pill.className = 'badge badge-pass';
    pill.textContent = '🟢 Đã kết nối Realtime';
  }
}

// ================================================================
// 1. PROJECT MANAGEMENT TAB
// ================================================================
function renderProjectsTab() {
  const grid = document.getElementById('settings-projects-cards-grid');
  if (!grid) return;

  const projects = getAllProjects();
  const activePrj = getActiveProject();

  if (!projects || projects.length === 0) {
    grid.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; border: 2px dashed var(--border); background: var(--bg-card)">
        <div style="font-size: 44px; margin-bottom: 12px">🏢</div>
        <h3 style="margin-bottom: 8px; font-size: 17px; font-weight: 800; color: var(--text-primary)">
          Chưa Có Dự Án Nào Trong Cơ Sở Dữ Liệu (0 Dự Án)
        </h3>
        <p style="color: var(--text-secondary); max-width: 520px; margin: 0 auto 20px auto; font-size: 13px">
          Toàn bộ các dự án cũ đã được làm sạch 100%. Bạn có thể bắt đầu tạo dự án mới từ đầu. Mọi dự án tạo ra sẽ được lưu trữ và đồng bộ hóa trực tiếp lên Cloud Database.
        </p>
        <button type="button" class="btn btn-primary" onclick="openAddProjectModal()" style="font-weight: 700; padding: 10px 22px; font-size: 14px">
          ➕ Thêm Dự Án Mới
        </button>
      </div>
    `;
    renderActiveProjectVersions();
    renderActiveProjectCycles();
    return;
  }

  grid.innerHTML = projects.map(p => {
    const isCurrent = activePrj && p.id === activePrj.id;
    const versions = p.versions || [];
    const validVerSet = new Set(versions.map(v => ((v.version || v) || '').trim().toLowerCase()));
    const tcCount = versions.length === 0 ? 0 : (p.testCases || []).filter(tc => validVerSet.has(((tc.version || '')).trim().toLowerCase())).length;
    const modCount = versions.length === 0 ? 0 : (p.modules || []).length;
    const verCount = versions.length;
    const cycleCount = getTestCyclesForProject(p.id).length;
    const activeVer = p.activeVersion || (versions[0]?.version) || '';

    // Calculate pass rate from results
    const results = state.results || {};
    let passed = 0;
    (p.testCases || []).forEach(tc => {
      if (results[tc.id]?.status === 'Pass') passed++;
    });
    const pct = tcCount > 0 ? Math.round((passed / tcCount) * 100) : 0;

    return `
      <div class="project-card ${isCurrent ? 'active-project' : ''}">
        <div class="project-card-header">
          <span class="project-card-code">${escapeHtml(p.code || p.id)}</span>
          ${isCurrent ? '<span class="badge badge-pass" style="font-weight:700">● ĐANG CHỌN</span>' : ''}
        </div>
        <h4 class="project-card-title">${escapeHtml(p.name)}</h4>
        <div class="project-card-domain">${escapeHtml(p.domain || 'Hệ thống phần mềm')}</div>

        <div class="project-card-stats" style="grid-template-columns: repeat(4, 1fr)">
          <div>
            <div class="project-card-stats-val">${tcCount}</div>
            <div class="project-card-stats-lbl">Kịch bản</div>
          </div>
          <div>
            <div class="project-card-stats-val">${modCount}</div>
            <div class="project-card-stats-lbl">Phân hệ</div>
          </div>
          <div>
            <div class="project-card-stats-val">${verCount}</div>
            <div class="project-card-stats-lbl">Phiên bản</div>
          </div>
          <div>
            <div class="project-card-stats-val" style="color:var(--primary)">${cycleCount}</div>
            <div class="project-card-stats-lbl">Đợt test</div>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px">
            <span style="color:var(--text-muted)">Tiến độ (${activeVer}):</span>
            <strong>${pct}%</strong>
          </div>
          <div class="table-progress-bar">
            <div class="table-progress-track" style="max-width:100%; width:100%">
              <div class="table-progress-fill" style="width:${pct}%; background:${pct >= 80 ? 'var(--success)' : 'var(--primary)'}"></div>
            </div>
          </div>
        </div>

        <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px">
          👤 <strong>PM/Lead:</strong> ${escapeHtml(p.lead || 'QA Lead')}
        </div>

        <div class="project-card-footer" style="flex-wrap:wrap; gap:6px">
          <div style="display:flex; gap:6px; flex-wrap:wrap">
            <button type="button" class="btn btn-outline btn-xs" onclick="openEditProjectModal('${p.id}')" title="Sửa thông tin dự án">✏️ Sửa</button>
            <button type="button" class="btn btn-outline btn-xs" onclick="openAssignProjectStaffModal('${p.id}')" style="background:rgba(124,58,237,0.08); color:#7c3aed; border-color:rgba(124,58,237,0.3); font-weight:700" title="Phân bổ nhân sự (Leader, Tester, Dev) vào dự án này">👥 Phân bổ nhân sự</button>
            <button type="button" class="btn btn-outline btn-xs btn-delete" onclick="deleteProjectHandler('${p.id}')" title="Xóa dự án" style="color:#ef4444; border-color:rgba(239,68,68,0.3)">🗑️ Xóa</button>
          </div>
          <div style="display:flex; gap:6px; align-items:center">
            ${window.location.pathname.includes('/admin/') ? 
              `<a href="project-detail.html?id=${p.id}" class="btn btn-primary btn-xs" title="Xem tổng quan chi tiết dự án">🔍 Xem chi tiết</a>` : 
              (isCurrent ? 
                '<span style="font-size:12px; font-weight:700; color:var(--success)">✓ Dự án hiện tại</span>' : 
                `<button type="button" class="btn btn-primary btn-xs" onclick="switchProject('${p.id}')">👉 Chọn dự án</button>`
              )
            }
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderActiveProjectVersions();
  renderActiveProjectCycles();
}

function renderActiveProjectVersions() {
  const tbody = document.getElementById('project-versions-tbody');
  const titleEl = document.getElementById('active-proj-versions-title');
  if (!tbody) return;

  const p = getActiveProject();
  if (!p) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-muted)">Chưa có dự án nào</td></tr>';
    return;
  }

  if (titleEl) titleEl.textContent = `📦 Quản Lý Phiên Bản Phần Mềm: ${p.name}`;

  const versions = p.versions || [];
  if (versions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-muted)">Chưa có phiên bản nào được cấu hình</td></tr>';
    return;
  }

  tbody.innerHTML = versions.map(v => {
    const isActive = v.version === p.activeVersion;
    const statusBadge = v.status === 'RELEASED' ? 
      '<span class="badge badge-pass">RELEASED</span>' : 
      v.status === 'IN_QA' ? 
      '<span class="badge badge-p1">IN_QA (Đang test)</span>' : 
      '<span class="badge badge-nr">IN_DEV (Phát triển)</span>';

    return `
      <tr style="${isActive ? 'background:rgba(37,99,235,0.06); font-weight:600' : ''}">
        <td style="font-family:monospace; font-weight:700; color:var(--primary)">${escapeHtml(v.version)}</td>
        <td><strong>${escapeHtml(v.label || v.version)}</strong></td>
        <td style="text-align:center">${statusBadge}</td>
        <td style="text-align:center; font-size:12px; color:var(--text-muted)">${escapeHtml(v.targetDate || 'Chưa định')}</td>
        <td style="font-size:12.5px; color:var(--text-secondary)">${escapeHtml(v.changelog || 'Không có ghi chú')}</td>
        <td style="text-align:center">
          ${isActive ? 
            '<span class="badge badge-pass">● Đang kích hoạt</span>' : 
            `<button type="button" class="btn btn-outline btn-xs" onclick="switchProjectVersionHandler('${v.version}')">Kích hoạt</button>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

function filterCyclesByVersion(ver) {
  selectedCycleVersionFilter = ver;
  renderActiveProjectCycles();
}

function renderActiveProjectCycles() {
  const tbody = document.getElementById('project-cycles-tbody');
  const titleEl = document.getElementById('active-proj-cycles-title');
  const filterContainer = document.getElementById('cycles-version-filter-container');
  if (!tbody) return;

  const p = getActiveProject();
  if (!p) {
    if (titleEl) titleEl.innerHTML = '🎯 Quản Lý Các Đợt Kiểm Thử (Test Cycles)';
    if (filterContainer) filterContainer.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:16px; color:var(--text-muted)">Chưa có dự án nào</td></tr>';
    return;
  }

  const allProjectCycles = getTestCyclesForProject(p.id);
  const versions = p.versions || [];

  // Default filter to the project active version if null
  if (selectedCycleVersionFilter === null) {
    selectedCycleVersionFilter = p.activeVersion || '';
  }

  const currentVer = selectedCycleVersionFilter;

  // Filter cycles
  let cycles = allProjectCycles;
  if (currentVer) {
    cycles = allProjectCycles.filter(c => c.version === currentVer || (c.version && c.version.startsWith(currentVer)) || currentVer.startsWith(c.version));
  }

  // Render Version Filter Toolbar
  if (filterContainer) {
    filterContainer.innerHTML = `
      <div class="filter-toolbar" style="padding:10px 16px; background:var(--bg-surface); border-bottom:1px solid var(--border-light); margin-bottom:0">
        <div class="filter-group">
          <span style="font-size:12px; font-weight:700; color:var(--text-muted)">Lọc theo phiên bản:</span>
          <button type="button" class="btn btn-xs ${!currentVer ? 'btn-primary' : 'btn-outline'}" onclick="filterCyclesByVersion('')">
            🔘 Tất cả (${allProjectCycles.length})
          </button>
          ${versions.map(v => {
            const vCycles = allProjectCycles.filter(c => c.version === v.version || (c.version && c.version.startsWith(v.version)) || v.version.startsWith(c.version));
            const isSel = currentVer === v.version;
            const isAct = v.version === p.activeVersion;
            return `
              <button type="button" class="btn btn-xs ${isSel ? 'btn-primary' : 'btn-outline'}" onclick="filterCyclesByVersion('${v.version}')" style="${isAct ? 'border-color:var(--primary); font-weight:700' : ''}">
                📦 ${escapeHtml(v.version)} (${vCycles.length} đợt) ${isAct ? '<span style="font-size:10px; color:' + (isSel ? '#fff' : 'var(--primary)') + '; margin-left:3px">● Kích hoạt</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>
        <div style="font-size:12px; color:var(--text-muted)">
          Đang hiển thị: <strong style="color:var(--primary)">${cycles.length}</strong> / ${allProjectCycles.length} đợt kiểm thử
        </div>
      </div>
    `;
  }

  if (titleEl) {
    titleEl.innerHTML = `🎯 Quản Lý Các Đợt Kiểm Thử (Test Cycles): <strong>${escapeHtml(p.name)}</strong> ${currentVer ? `<span class="badge badge-pass" style="font-size:11px; margin-left:8px">Phiên bản: ${escapeHtml(currentVer)}</span>` : '<span class="badge badge-nr" style="font-size:11px; margin-left:8px">Tất cả phiên bản</span>'}`;
  }

  if (!cycles || cycles.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:28px; color:var(--text-muted)">
          <div style="font-size:13px; margin-bottom:6px">
            ${currentVer ? `Phiên bản <strong>${escapeHtml(currentVer)}</strong> hiện chưa có đợt kiểm thử nào.` : 'Chưa có đợt kiểm thử nào được cấu hình cho dự án này.'}
          </div>
          <div style="margin-top:10px">
            <button type="button" class="btn btn-primary btn-xs" onclick="openAddCycleModal('${currentVer}')">➕ Thêm Đợt Mới Cho ${escapeHtml(currentVer || 'Dự Án')}</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cycles.map(c => {
    const isCurrent = c.id === state.activeCycleId;
    const statusBadge = c.status === 'ACTIVE' ?
      '<span class="badge badge-pass">🟢 ACTIVE (Đang mở)</span>' :
      c.status === 'CLOSED' ?
      '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1">🔒 CLOSED (Đã đóng)</span>' :
      '<span class="badge badge-nr">⏳ PLANNED (Kế hoạch)</span>';

    const suiteBadge = getSuiteLabel(c.targetSuite);
    const cycleTcs = getTestCasesForCycle(c.id);
    const totalProjVerTcs = getAllTcs(c.version, p.id).length;
    const stats = getCycleExecutionStats(c.id);
    const isCustomScope = Array.isArray(c.testCaseIds) && c.testCaseIds.length > 0;

    return `
      <tr style="${isCurrent ? 'background:rgba(37,99,235,0.06); font-weight:600' : ''}">
        <td style="text-align:center">
          <span class="badge" style="background:rgba(37,99,235,0.1); color:var(--primary); border:1px solid rgba(37,99,235,0.25); font-family:monospace; font-weight:700">
            ${escapeHtml(c.code || c.id)}
          </span>
        </td>
        <td>
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:2px">
            ${escapeHtml(c.name)}
          </div>
          <div style="font-size:12px; color:var(--text-secondary); line-height:1.3">
            ${escapeHtml(c.description || 'Chưa có mô tả mục tiêu')}
          </div>
        </td>
        <td style="text-align:center">
          <span class="badge badge-outline" style="font-family:monospace; font-weight:700">
            ${escapeHtml(c.version || 'v1.0')}
          </span>
        </td>
        <td style="text-align:center">
          ${suiteBadge}
        </td>
        <td style="text-align:center">
          <div style="display:inline-flex; flex-direction:column; align-items:center; gap:4px">
            <span class="badge" style="background:rgba(37,99,235,0.08); color:var(--primary); border:1px solid rgba(37,99,235,0.25); font-weight:700; font-size:11.5px">
              🎯 ${cycleTcs.length} / ${totalProjVerTcs} bài
            </span>
            <button type="button" class="btn btn-outline btn-xs" onclick="openCycleScopeModal('${c.id}')" title="Cấu hình danh mục bài test cụ thể cho đợt này" style="color:var(--primary); font-weight:700; border-color:rgba(37,99,235,0.3)">
              ⚙️ Chọn kịch bản
            </button>
          </div>
        </td>
        <td style="text-align:center">
          <div style="padding:2px 4px; min-width:130px">
            <div style="font-size:11px; margin-bottom:3px; display:flex; justify-content:space-between">
              <span style="font-weight:800; color:${stats.passRate >= 80 ? 'var(--success)' : stats.passRate > 40 ? 'var(--primary)' : 'var(--warning)'}">Pass: ${stats.passRate}%</span>
              <span style="color:var(--text-muted); font-size:10.5px">${stats.passed}/${stats.total}</span>
            </div>
            <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; display:flex">
              <div style="width:${stats.passRate}%; background:var(--success)" title="Pass: ${stats.passed}"></div>
              <div style="width:${stats.total > 0 ? (stats.failed/stats.total*100) : 0}%; background:var(--danger)" title="Fail/Blocked: ${stats.failed}"></div>
            </div>
            <div style="font-size:10.5px; color:var(--text-muted); margin-top:3px; display:flex; justify-content:center; gap:6px">
              <span>✅ ${stats.passed}</span>
              <span>❌ ${stats.failed}</span>
              <span>⏳ ${stats.pending}</span>
            </div>
          </div>
        </td>
        <td style="text-align:center; font-size:12px; color:var(--text-muted)">
          ${escapeHtml(c.startDate || '—')} ➔ ${escapeHtml(c.endDate || '—')}
        </td>
        <td style="text-align:center">
          ${statusBadge}
        </td>
        <td style="text-align:center">
          <div style="display:inline-flex; gap:4px; align-items:center; flex-wrap:wrap; justify-content:center">
            ${isCurrent ? 
              '<span class="badge badge-pass" style="font-weight:700">● ĐANG CHỌN</span>' : 
              `<button type="button" class="btn btn-outline btn-xs" onclick="switchActiveCycleHandler('${c.id}')" title="Kích hoạt làm đợt kiểm thử tác nghiệp">👉 Chọn Đợt</button>`
            }
            <button type="button" class="btn btn-outline btn-xs" onclick="openCycleScopeModal('${c.id}')" title="Cấu hình danh mục bài test của đợt này">🎯 Phạm vi</button>
            <button type="button" class="btn btn-outline btn-xs" onclick="openEditCycleModal('${c.id}')" title="Sửa thông tin đợt test">✏️ Sửa</button>
            <button type="button" class="btn btn-outline btn-xs" onclick="toggleCycleStatusHandler('${c.id}')" title="${c.status === 'ACTIVE' ? 'Đóng đợt kiểm thử' : 'Mở lại đợt kiểm thử'}">
              ${c.status === 'ACTIVE' ? '🔒 Đóng' : '🔓 Mở'}
            </button>
            ${allProjectCycles.length > 1 ? `
              <button type="button" class="btn btn-outline btn-xs btn-delete" onclick="deleteCycleHandler('${c.id}')" title="Xóa đợt test" style="color:#ef4444; border-color:rgba(239,68,68,0.3)">🗑️</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getSuiteLabel(suite) {
  const s = (suite || 'REGRESSION').toUpperCase();
  switch (s) {
    case 'REGRESSION':
      return '<span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:11px">🔄 Hồi quy (Regression)</span>';
    case 'SMOKE':
      return '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:11px">💨 Smoke (Khảo sát)</span>';
    case 'SANITY':
      return '<span class="badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:11px">🧪 Sanity (Vá lỗi)</span>';
    case 'PERF_STRESS':
      return '<span class="badge" style="background:#faf5ff; color:#6b21a8; border:1px solid #e9d5ff; font-size:11px">⚡ Tải & Hiệu năng</span>';
    case 'SECURITY_FRAUD':
      return '<span class="badge" style="background:#fff1f2; color:#be123c; border:1px solid #fecdd3; font-size:11px">🛡️ An ninh & Bảo mật</span>';
    case 'INTEGRATION_HW':
      return '<span class="badge" style="background:#f0fdfa; color:#115e59; border:1px solid #99f6e4; font-size:11px">🔌 Tích hợp thiết bị</span>';
    case 'FAILOVER_OFFLINE':
      return '<span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:11px">📶 Chịu lỗi Offline</span>';
    case 'ACCEPTANCE_UAT':
      return '<span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:11px">🏆 Nghiệm thu Go-Live</span>';
    default:
      return `<span class="badge badge-nr" style="font-size:11px">${escapeHtml(suite)}</span>`;
  }
}

function openAddCycleModal(defaultVer) {
  const p = getActiveProject();
  if (!p) return;

  const targetVer = (typeof defaultVer === 'string' && defaultVer) ? defaultVer : (selectedCycleVersionFilter || p.activeVersion || 'v1.0');
  const projectCycles = getTestCyclesForProject(p.id, targetVer);
  const nextSeq = projectCycles.length + 1;

  document.getElementById('modal-cycle-title').textContent = `➕ Thêm Đợt Kiểm Thử Mới (${targetVer})`;
  document.getElementById('cf-id').value = '';
  document.getElementById('cf-code').value = `ROUND-${nextSeq}`;
  document.getElementById('cf-name').value = `Đợt ${nextSeq} — Kiểm thử ${targetVer} ROUND-${nextSeq}`;
  
  // Populate versions dropdown
  const verSelect = document.getElementById('cf-version');
  const versions = p.versions || [{ version: p.activeVersion || 'v1.0' }];
  verSelect.innerHTML = versions.map(v => 
    `<option value="${escapeHtml(v.version)}" ${v.version === targetVer ? 'selected' : ''}>${escapeHtml(v.version)} ${v.label ? `(${v.label})` : ''}</option>`
  ).join('');

  document.getElementById('cf-suite').value = 'REGRESSION';
  document.getElementById('cf-status').value = 'ACTIVE';
  document.getElementById('cf-start-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('cf-end-date').value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  document.getElementById('cf-description').value = '';

  openModal('modal-cycle-form');
}

function openEditCycleModal(cycleId) {
  const c = getCycleById(cycleId);
  if (!c) return;

  const p = getActiveProject();
  document.getElementById('modal-cycle-title').textContent = '✏️ Chỉnh Sửa Đợt Kiểm Thử';
  document.getElementById('cf-id').value = c.id;
  document.getElementById('cf-code').value = c.code || '';
  document.getElementById('cf-name').value = c.name || '';

  // Populate versions dropdown
  const verSelect = document.getElementById('cf-version');
  const versions = p?.versions || [{ version: c.version }];
  verSelect.innerHTML = versions.map(v => 
    `<option value="${escapeHtml(v.version)}" ${v.version === c.version ? 'selected' : ''}>${escapeHtml(v.version)} ${v.label ? `(${v.label})` : ''}</option>`
  ).join('');

  document.getElementById('cf-suite').value = c.targetSuite || 'REGRESSION';
  document.getElementById('cf-status').value = c.status || 'ACTIVE';
  document.getElementById('cf-start-date').value = c.startDate || '';
  document.getElementById('cf-end-date').value = c.endDate || '';
  document.getElementById('cf-description').value = c.description || '';

  openModal('modal-cycle-form');
}

function confirmSaveCycle() {
  const id = document.getElementById('cf-id')?.value.trim();
  const code = document.getElementById('cf-code')?.value.trim().toUpperCase();
  const name = document.getElementById('cf-name')?.value.trim();
  const version = document.getElementById('cf-version')?.value.trim();
  const targetSuite = document.getElementById('cf-suite')?.value;
  const status = document.getElementById('cf-status')?.value;
  const startDate = document.getElementById('cf-start-date')?.value;
  const endDate = document.getElementById('cf-end-date')?.value;
  const description = document.getElementById('cf-description')?.value.trim();

  if (!code || !name) {
    showToast('⚠️ Vui lòng nhập đầy đủ Mã đợt và Tên đợt test!', 'error');
    return;
  }

  try {
    if (id) {
      updateTestCycle(id, { code, name, version, targetSuite, status, startDate, endDate, description });
      showToast(`✅ Đã cập nhật đợt test "${name}"`, 'success');
    } else {
      const p = getActiveProject();
      addTestCycle({
        projectId: p.id,
        code,
        name,
        version,
        targetSuite,
        status,
        startDate,
        endDate,
        description
      });
      showToast(`🎉 Đã thêm đợt test mới thành công: "${name}"`, 'success');
    }
    selectedCycleVersionFilter = version;
    closeModal('modal-cycle-form');
    renderProjectsTab();
    loadSessionSettings();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function switchActiveCycleHandler(cycleId) {
  setActiveCycle(cycleId);
  const cycle = getCycleById(cycleId);
  showToast(`🎯 Đã kích hoạt đợt kiểm thử tác nghiệp: ${cycle?.name || cycleId}`, 'info');
  renderActiveProjectCycles();
  loadSessionSettings();
}

function toggleCycleStatusHandler(cycleId) {
  const updated = toggleTestCycleStatus(cycleId);
  if (updated) {
    showToast(`🔄 Trạng thái đợt test "${updated.name}" chuyển sang: ${updated.status}`, 'info');
    renderActiveProjectCycles();
  }
}

function deleteCycleHandler(cycleId) {
  const c = getCycleById(cycleId);
  if (!c) return;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa đợt kiểm thử "${c.name}"?`)) return;

  try {
    deleteTestCycle(cycleId);
    showToast(`🗑️ Đã xóa đợt kiểm thử "${c.name}"`, 'info');
    renderProjectsTab();
    loadSessionSettings();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

// ================================================================
// TEST CYCLE SCOPE CONFIGURATION MODAL CONTROLLER
// ================================================================
// ================================================================
// TEST CYCLE SCOPE CONFIGURATION MODAL CONTROLLER (ADVANCED 2-PANE)
// ================================================================
let currentScopeCycleId = null;
let selectedScopeTcIds = new Set();
let scopeActiveModuleId = ''; // '' means [Tất cả phân hệ]

/**
 * Tổng hợp thông tin lịch sử thực thi của Test Case ở các đợt test trước
 */
function getTcPriorExecutionSummary(tcId, currentCycleId, projectId) {
  const pId = projectId || state.activeProjectId;
  const history = typeof getTestCaseCycleHistory === 'function' ? getTestCaseCycleHistory(tcId, pId) : [];
  const cycleResults = state.cycleResults || {};

  // Lọc các đợt test trước hoặc khác đợt hiện tại có ghi nhận kết quả
  const priorRuns = history.filter(h => h.cycleId !== currentCycleId && h.result && h.result.status);

  let lastStatus = 'UNTESTED';
  let lastCycleCode = '';
  let lastCycleName = '';
  let lastFailReason = '';
  let lastActualResult = '';
  let lastRunAt = '';
  let lastTester = '';

  if (priorRuns.length > 0) {
    const latestPrior = priorRuns[priorRuns.length - 1];
    const s = (latestPrior.result.status || '').toUpperCase();
    lastCycleCode = latestPrior.cycleCode || latestPrior.cycleId;
    lastCycleName = latestPrior.cycleName || lastCycleCode;
    lastFailReason = latestPrior.result.failReason || '';
    lastActualResult = latestPrior.result.actualResult || '';
    lastRunAt = latestPrior.result.runAt || '';
    lastTester = latestPrior.result.tester || '';
    if (s === 'FAIL' || s === 'FAILED') lastStatus = 'FAIL';
    else if (s === 'BLOCKED') lastStatus = 'BLOCKED';
    else if (s === 'PASS' || s === 'PASSED') lastStatus = 'PASS';
  }

  // Đánh dấu nếu từng có bất kỳ đợt nào bị lỗi
  const hadFailure = priorRuns.some(h => {
    const s = (h.result?.status || '').toUpperCase();
    return s === 'FAIL' || s === 'FAILED' || s === 'BLOCKED';
  });

  return {
    lastStatus,
    lastCycleCode,
    lastCycleName,
    lastFailReason,
    lastActualResult,
    lastRunAt,
    lastTester,
    hadFailure,
    priorRunsCount: priorRuns.length,
    currentRun: (cycleResults[currentCycleId] || {})[tcId] || null
  };
}

function openCycleScopeModal(cycleId) {
  const c = getCycleById(cycleId);
  if (!c) return;

  currentScopeCycleId = cycleId;
  scopeActiveModuleId = ''; // Mặc định mở Tất cả phân hệ
  const p = (state.projects || []).find(pr => pr.id === c.projectId) || getActiveProject();
  if (!p) return;

  // Lấy danh mục kịch bản đã chọn
  if (Array.isArray(c.testCaseIds) && c.testCaseIds.length > 0) {
    selectedScopeTcIds = new Set(c.testCaseIds);
  } else {
    selectedScopeTcIds = new Set(getTestCasesForCycle(c.id).map(t => t.id));
  }

  // Header Title, Status & Suite Badges
  const titleEl = document.getElementById('modal-scope-title');
  if (titleEl) {
    titleEl.innerHTML = `🎯 Cấu Hình Phạm Vi: <span style="color:var(--primary); margin-left:4px">[${escapeHtml(c.code)}] ${escapeHtml(c.name)}</span>`;
  }

  const stBadge = document.getElementById('modal-scope-status-badge');
  if (stBadge) {
    stBadge.innerHTML = c.status === 'ACTIVE' ?
      '<span class="badge badge-pass" style="font-size:11px">🟢 ACTIVE</span>' :
      c.status === 'CLOSED' ?
      '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-size:11px">🔒 CLOSED</span>' :
      '<span class="badge badge-nr" style="font-size:11px">⏳ PLANNED</span>';
  }

  const suBadge = document.getElementById('modal-scope-suite-badge');
  if (suBadge) {
    suBadge.innerHTML = getSuiteLabel(c.targetSuite);
  }

  const verBadge = document.getElementById('modal-scope-version-badge');
  if (verBadge) {
    verBadge.textContent = c.version;
  }

  const datesBadge = document.getElementById('modal-scope-dates-badge');
  if (datesBadge) {
    datesBadge.textContent = `🕒 ${c.startDate || '—'} ➔ ${c.endDate || '—'}`;
  }

  // Reset Bộ lọc tìm kiếm
  if (document.getElementById('scope-search-kw')) document.getElementById('scope-search-kw').value = '';
  if (document.getElementById('scope-filter-prio')) document.getElementById('scope-filter-prio').value = '';
  if (document.getElementById('scope-filter-selection')) document.getElementById('scope-filter-selection').value = '';
  if (document.getElementById('scope-filter-history')) document.getElementById('scope-filter-history').value = '';

  renderCycleScopeUI();
  openModal('modal-cycle-scope');
}

/**
 * Điều phối render toàn bộ giao diện 2 Pane của Scope Modal
 */
function renderCycleScopeUI() {
  if (!currentScopeCycleId) return;
  const c = getCycleById(currentScopeCycleId);
  if (!c) return;
  const p = (state.projects || []).find(pr => pr.id === c.projectId) || getActiveProject();
  if (!p) return;

  const allVerTcs = getAllTcs(c.version, p.id);
  const mods = getModules(c.version, p.id);

  // 1. Cập nhật thống kê KPIs trên Header (Sleek Ribbon)
  updateScopeKPIs(allVerTcs, c, p);

  // 2. Render Left Pane (Danh mục phân hệ)
  renderScopeModulesList(mods, allVerTcs, c, p);

  // 3. Lọc danh sách test cases
  const filteredTcs = getFilteredScopeTestCases(allVerTcs, c, p);

  // 4. Render Right Pane Header
  renderScopeActiveModHeader(mods, allVerTcs, filteredTcs, c);

  // 5. Render Right Pane Table (Danh mục Test Cases)
  renderCycleScopeTable(filteredTcs, c, p);
}

function updateScopeKPIs(allVerTcs, cycle, project) {
  const totalCount = allVerTcs.length;
  const selCount = selectedScopeTcIds.size;
  const pct = totalCount > 0 ? Math.round((selCount / totalCount) * 100) : 0;

  let passPriorCount = 0;
  let failPriorCount = 0;
  let untestedCount = 0;

  allVerTcs.forEach(t => {
    const summary = getTcPriorExecutionSummary(t.id, cycle.id, project.id);
    if (summary.lastStatus === 'FAIL' || summary.lastStatus === 'BLOCKED' || summary.hadFailure) {
      failPriorCount++;
    } else if (summary.lastStatus === 'PASS') {
      passPriorCount++;
    } else {
      untestedCount++;
    }
  });

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Sleek Stats Ribbon
  setVal('scope-stat-selected', `${selCount} / ${totalCount} (${pct}%)`);
  setVal('scope-stat-fail', `${failPriorCount} lỗi cần Re-test`);
  setVal('scope-stat-pass', `${passPriorCount} đã Pass`);
  setVal('scope-stat-untested', `${untestedCount} chưa test`);

  // Footer counters
  const badgeEl = document.getElementById('scope-footer-count-badge');
  if (badgeEl) badgeEl.textContent = `${selCount} / ${totalCount} kịch bản được kích hoạt`;
  const rateEl = document.getElementById('scope-footer-rate-text');
  if (rateEl) rateEl.textContent = `(chiếm ${pct}% kịch bản của ${cycle.version})`;

  // Count active modules
  const mods = getModules(cycle.version, project.id);
  const activeModsCount = mods.filter(m => {
    const mTcs = allVerTcs.filter(t => t.module === m.id);
    return mTcs.some(t => selectedScopeTcIds.has(t.id));
  }).length;

  const modSumEl = document.getElementById('scope-footer-modules-summary');
  if (modSumEl) {
    modSumEl.textContent = `| Phủ trên ${activeModsCount} / ${mods.length} phân hệ nghiệp vụ`;
  }
}

function renderScopeModulesList(mods, allVerTcs, cycle, project) {
  const container = document.getElementById('scope-modules-list');
  const countBadge = document.getElementById('scope-mod-total-badge');
  if (!container) return;
  if (countBadge) countBadge.textContent = mods.length;

  // Tính tổng số bài lỗi ở đợt trước trên toàn phiên bản
  let totalFailInVersion = 0;
  allVerTcs.forEach(t => {
    const s = getTcPriorExecutionSummary(t.id, cycle.id, project.id);
    if (s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure) totalFailInVersion++;
  });

  const isAllActive = scopeActiveModuleId === '';
  const allSelCount = selectedScopeTcIds.size;
  const isAllChecked = allVerTcs.length > 0 && allSelCount === allVerTcs.length;

  let html = `
    <!-- Item 0: TẤT CẢ PHÂN HỆ -->
    <div class="scope-module-item ${isAllActive ? 'active' : ''}" onclick="selectScopeModule('')">
      <div style="display:flex; align-items:center; min-width:0; flex:1">
        <input type="checkbox" class="scope-module-checkbox" ${isAllChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleAllModulesScope(this.checked)" title="Chọn/Bỏ chọn toàn bộ kịch bản phiên bản" />
        <div style="display:flex; flex-direction:column; min-width:0">
          <div style="display:flex; align-items:center; gap:6px">
            <span style="font-weight:700; font-size:12.5px; color:var(--text-primary)">📁 [Tất cả phân hệ]</span>
          </div>
          <div style="font-size:11px; color:var(--text-muted); line-height:1.2">Toàn bộ 100% kịch bản của ${escapeHtml(cycle.version)}</div>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px; flex-shrink:0">
        <span class="badge ${allSelCount > 0 ? 'badge-pass' : 'badge-nr'}" style="font-size:11px; font-weight:700">
          ${allSelCount}/${allVerTcs.length}
        </span>
        ${totalFailInVersion > 0 ? `<span class="badge badge-fail" style="font-size:9.5px; font-weight:700">⚠️ ${totalFailInVersion} lỗi</span>` : ''}
      </div>
    </div>
  `;

  // Render từng Phân hệ
  mods.forEach(m => {
    const modTcs = allVerTcs.filter(t => t.module === m.id);
    const modSelCount = modTcs.filter(t => selectedScopeTcIds.has(t.id)).length;
    let modFailCount = 0;
    modTcs.forEach(t => {
      const s = getTcPriorExecutionSummary(t.id, cycle.id, project.id);
      if (s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure) modFailCount++;
    });

    const isModActive = scopeActiveModuleId === m.id;
    const isModChecked = modTcs.length > 0 && modSelCount === modTcs.length;

    html += `
      <div class="scope-module-item ${isModActive ? 'active' : ''}" onclick="selectScopeModule('${m.id}')">
        <div style="display:flex; align-items:center; min-width:0; flex:1; padding-right:8px">
          <input type="checkbox" class="scope-module-checkbox" ${isModChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleModuleScopeAll('${m.id}', this.checked)" title="Chọn/Bỏ chọn toàn bộ ${modTcs.length} bài của [${m.id}]" />
          <div style="display:flex; flex-direction:column; min-width:0">
            <div style="display:flex; align-items:center; gap:5px">
              <span class="scope-mod-id" style="font-family:monospace; font-weight:800; font-size:11.5px; color:var(--primary)">[${m.id}]</span>
              <span style="font-size:12px; font-weight:600; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</span>
            </div>
            <div style="font-size:11px; color:var(--text-muted); line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(m.desc || m.name)}</div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px; flex-shrink:0">
          <span class="badge ${modSelCount > 0 ? (modSelCount === modTcs.length ? 'badge-pass' : 'badge-outline') : 'badge-nr'}" style="font-size:10.5px; font-weight:700">
            ${modSelCount}/${modTcs.length}
          </span>
          ${modFailCount > 0 ? `<span class="badge badge-fail" style="font-size:9.5px; font-weight:700">⚠️ ${modFailCount} lỗi</span>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function selectScopeModule(modId) {
  scopeActiveModuleId = modId;
  renderCycleScopeUI();
}

function renderScopeActiveModHeader(mods, allVerTcs, filteredTcs, cycle) {
  const headerEl = document.getElementById('scope-active-mod-header');
  if (!headerEl) return;

  if (!scopeActiveModuleId) {
    headerEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px">
        <span style="font-size:16px">📁</span>
        <div>
          <div style="font-weight:700; font-size:13.5px; color:var(--text-primary)">
            Tất Cả Các Phân Hệ Nghiệp Vụ (${mods.length} phân hệ)
          </div>
          <div style="font-size:11.5px; color:var(--text-muted)">
            Đang lọc được <strong>${filteredTcs.length}</strong> bài test • Đã chọn <strong>${selectedScopeTcIds.size} / ${allVerTcs.length}</strong> kịch bản toàn phiên bản
          </div>
        </div>
      </div>
      <div style="display:flex; gap:6px">
        <button type="button" class="btn btn-outline btn-xs" onclick="toggleAllModulesScope(true)">☑️ Chọn tất cả (${allVerTcs.length})</button>
        <button type="button" class="btn btn-outline btn-xs" onclick="toggleAllModulesScope(false)">⬜ Bỏ chọn tất cả</button>
      </div>
    `;
  } else {
    const curMod = mods.find(m => m.id === scopeActiveModuleId) || { id: scopeActiveModuleId, name: scopeActiveModuleId };
    const modTcs = allVerTcs.filter(t => t.module === curMod.id);
    const modSelCount = modTcs.filter(t => selectedScopeTcIds.has(t.id)).length;

    headerEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px">
        <span class="badge" style="background:rgba(37,99,235,0.1); color:var(--primary); font-family:monospace; font-weight:800; font-size:12.5px; padding:4px 8px">[${curMod.id}]</span>
        <div>
          <div style="font-weight:700; font-size:13.5px; color:var(--text-primary)">
            ${escapeHtml(curMod.name)}
          </div>
          <div style="font-size:11.5px; color:var(--text-muted)">
            ${escapeHtml(curMod.desc || 'Phân hệ kiểm thử chức năng')} • Đang hiển thị <strong>${filteredTcs.length}</strong> bài test • Đã kích hoạt <strong>${modSelCount} / ${modTcs.length}</strong> bài
          </div>
        </div>
      </div>
      <div style="display:flex; gap:6px">
        <button type="button" class="btn btn-outline btn-xs" onclick="toggleModuleScopeAll('${curMod.id}', true)">☑️ Chọn hết phân hệ [${curMod.id}] (${modTcs.length})</button>
        <button type="button" class="btn btn-outline btn-xs" onclick="toggleModuleScopeAll('${curMod.id}', false)">⬜ Bỏ chọn phân hệ này</button>
      </div>
    `;
  }
}

function getFilteredScopeTestCases(allVerTcs, cycle, project) {
  const kw = (document.getElementById('scope-search-kw')?.value || '').trim().toLowerCase();
  const prioFilter = document.getElementById('scope-filter-prio')?.value || '';
  const selFilter = document.getElementById('scope-filter-selection')?.value || '';
  const histFilter = document.getElementById('scope-filter-history')?.value || '';

  return allVerTcs.filter(t => {
    // Lọc theo module đang click ở sidebar trái (nếu có)
    if (scopeActiveModuleId && t.module !== scopeActiveModuleId) return false;

    // Lọc theo độ ưu tiên
    if (prioFilter && t.priority !== prioFilter) return false;

    // Lọc theo trạng thái chọn
    if (selFilter === 'SELECTED' && !selectedScopeTcIds.has(t.id)) return false;
    if (selFilter === 'UNSELECTED' && selectedScopeTcIds.has(t.id)) return false;

    // Lọc theo tình trạng ở đợt test trước
    if (histFilter) {
      const summary = getTcPriorExecutionSummary(t.id, cycle.id, project.id);
      if (histFilter === 'FAIL' && summary.lastStatus !== 'FAIL' && summary.lastStatus !== 'BLOCKED' && !summary.hadFailure) return false;
      if (histFilter === 'PASS' && summary.lastStatus !== 'PASS') return false;
      if (histFilter === 'UNTESTED' && summary.lastStatus !== 'UNTESTED') return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (kw) {
      const mId = (t.id || '').toLowerCase().includes(kw);
      const mTitle = (t.title || t.name || '').toLowerCase().includes(kw);
      const mDesc = (t.description || t.objective || '').toLowerCase().includes(kw);
      if (!mId && !mTitle && !mDesc) return false;
    }

    return true;
  });
}

function renderCycleScopeTable(filteredTcs, cycle, project) {
  const tbody = document.getElementById('modal-scope-tbody');
  const countEl = document.getElementById('scope-filtered-count');
  if (countEl) countEl.textContent = filteredTcs.length;
  if (!tbody) return;

  // Cập nhật checkbox chọn tất cả bài đang hiển thị
  const chkAll = document.getElementById('scope-select-all-filtered');
  if (chkAll) {
    chkAll.checked = filteredTcs.length > 0 && filteredTcs.every(t => selectedScopeTcIds.has(t.id));
  }

  if (filteredTcs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted)">
          <div style="font-size:24px; margin-bottom:8px">🔍</div>
          <div style="font-size:13.5px; font-weight:600">Không tìm thấy kịch bản nào phù hợp với bộ lọc hiện tại.</div>
          <div style="margin-top:8px">
            <button type="button" class="btn btn-outline btn-xs" onclick="resetScopeFilters()">🔄 Đặt lại bộ lọc</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredTcs.map(t => {
    const isChecked = selectedScopeTcIds.has(t.id);
    const summary = getTcPriorExecutionSummary(t.id, cycle.id, project.id);

    // Xây dựng cell hiển thị Tình trạng ở các Đợt test trước
    let historyHtml = '';
    if (summary.lastStatus === 'FAIL' || summary.lastStatus === 'BLOCKED' || summary.hadFailure) {
      historyHtml = `
        <div style="display:flex; flex-direction:column; gap:3px">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap">
            <span class="scope-history-badge scope-history-fail">
              [${escapeHtml(summary.lastCycleCode || 'Đợt 1')}] ❌ FAIL
            </span>
            <span class="badge badge-fail" style="font-weight:800; font-size:10px">⚠️ CẦN RE-TEST</span>
          </div>
          ${summary.lastFailReason ? `<div style="font-size:11px; color:#dc2626; line-height:1.25; max-width:290px" title="${escapeHtml(summary.lastFailReason)}">Lỗi: ${escapeHtml(summary.lastFailReason)}</div>` : ''}
          ${summary.lastTester ? `<div style="font-size:10px; color:var(--text-muted)">Tester: ${escapeHtml(summary.lastTester)}</div>` : ''}
        </div>
      `;
    } else if (summary.lastStatus === 'PASS') {
      historyHtml = `
        <div style="display:flex; flex-direction:column; gap:2px">
          <div style="display:flex; align-items:center; gap:6px">
            <span class="scope-history-badge scope-history-pass">
              [${escapeHtml(summary.lastCycleCode || 'Đợt 1')}] ✅ PASS
            </span>
            <span style="font-size:11px; color:var(--success); font-weight:600">Ổn định</span>
          </div>
          ${summary.lastActualResult ? `<div style="font-size:10.5px; color:var(--text-muted); line-height:1.2; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(summary.lastActualResult)}</div>` : ''}
        </div>
      `;
    } else {
      historyHtml = `
        <div style="display:flex; align-items:center; gap:4px">
          <span class="scope-history-badge scope-history-untested">⚪ Chưa từng test (Bài mới)</span>
        </div>
      `;
    }

    const prioColor = t.priority === 'P1' ? 'var(--danger)' : t.priority === 'P2' ? 'var(--warning)' : 'var(--text-secondary)';

    return `
      <tr style="${isChecked ? 'background:rgba(37,99,235,0.04); font-weight:500' : ''}" onclick="toggleCycleTcSelectionRow('${t.id}')">
        <td style="text-align:center" onclick="event.stopPropagation()">
          <input type="checkbox" class="scope-module-checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCycleTcSelection('${t.id}', this.checked)" style="margin:0" />
        </td>
        <td style="text-align:center">
          <span class="tc-badge-id" style="font-weight:700">${escapeHtml(t.id)}</span>
        </td>
        <td style="text-align:center">
          <span class="badge" style="background:#f1f5f9; color:#334155; font-family:monospace; font-weight:700; font-size:11px">[${escapeHtml(t.module || 'M01')}]</span>
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-primary); margin-bottom:2px">
            ${escapeHtml(t.title || t.name)}
          </div>
          <div style="font-size:11.5px; color:var(--text-muted); line-height:1.3">
            ${escapeHtml(t.description || t.objective || 'Mục tiêu kiểm thử')}
          </div>
        </td>
        <td style="text-align:center">
          <span class="badge badge-outline" style="color:${prioColor}; border-color:${prioColor}; font-weight:800; font-size:11px">
            ${escapeHtml(t.priority || 'P2')}
          </span>
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-secondary)">
          ${escapeHtml(t.type || 'Chức năng')}
        </td>
        <td style="padding:8px 10px">
          ${historyHtml}
        </td>
      </tr>
    `;
  }).join('');
}

function handleScopeFilterChange() {
  renderCycleScopeUI();
}

function resetScopeFilters() {
  if (document.getElementById('scope-search-kw')) document.getElementById('scope-search-kw').value = '';
  if (document.getElementById('scope-filter-prio')) document.getElementById('scope-filter-prio').value = '';
  if (document.getElementById('scope-filter-selection')) document.getElementById('scope-filter-selection').value = '';
  if (document.getElementById('scope-filter-history')) document.getElementById('scope-filter-history').value = '';
  renderCycleScopeUI();
}

function toggleCycleTcSelectionRow(tcId) {
  const isChecked = selectedScopeTcIds.has(tcId);
  toggleCycleTcSelection(tcId, !isChecked);
}

function toggleCycleTcSelection(tcId, isChecked) {
  if (isChecked) {
    selectedScopeTcIds.add(tcId);
  } else {
    selectedScopeTcIds.delete(tcId);
  }
  renderCycleScopeUI();
}

function toggleModuleScopeAll(modId, isChecked) {
  const c = getCycleById(currentScopeCycleId);
  if (!c) return;
  const p = (state.projects || []).find(pr => pr.id === c.projectId) || getActiveProject();
  if (!p) return;

  const allVerTcs = getAllTcs(c.version, p.id);
  const modTcs = allVerTcs.filter(t => t.module === modId);

  modTcs.forEach(t => {
    if (isChecked) selectedScopeTcIds.add(t.id);
    else selectedScopeTcIds.delete(t.id);
  });

  renderCycleScopeUI();
}

function toggleAllModulesScope(isChecked) {
  const c = getCycleById(currentScopeCycleId);
  if (!c) return;
  const p = (state.projects || []).find(pr => pr.id === c.projectId) || getActiveProject();
  if (!p) return;

  const allVerTcs = getAllTcs(c.version, p.id);
  if (isChecked) {
    selectedScopeTcIds = new Set(allVerTcs.map(t => t.id));
    showToast(`⚡ Đã chọn toàn bộ ${selectedScopeTcIds.size} kịch bản của ${c.version}`, 'info');
  } else {
    selectedScopeTcIds.clear();
    showToast('❌ Đã bỏ chọn toàn bộ kịch bản', 'info');
  }

  renderCycleScopeUI();
}

function handleToggleSelectAllFiltered(isChecked) {
  const c = getCycleById(currentScopeCycleId);
  if (!c) return;
  const p = (state.projects || []).find(pr => pr.id === c.projectId) || getActiveProject();
  if (!p) return;

  const allVerTcs = getAllTcs(c.version, p.id);
  const filteredTcs = getFilteredScopeTestCases(allVerTcs, c, p);

  filteredTcs.forEach(t => {
    if (isChecked) selectedScopeTcIds.add(t.id);
    else selectedScopeTcIds.delete(t.id);
  });

  renderCycleScopeUI();
}

function applyScopePreset(presetType) {
  const c = getCycleById(currentScopeCycleId);
  if (!c) return;
  const p = (state.projects || []).find(pr => pr.id === c.projectId) || getActiveProject();
  if (!p) return;

  const allVerTcs = getAllTcs(c.version, p.id);

  if (presetType === 'ALL') {
    selectedScopeTcIds = new Set(allVerTcs.map(t => t.id));
    showToast(`⚡ Đã chọn toàn bộ ${selectedScopeTcIds.size} kịch bản của ${c.version}`, 'info');
  } else if (presetType === 'SMOKE') {
    const p1s = allVerTcs.filter(t => t.priority === 'P1');
    selectedScopeTcIds = new Set(p1s.map(t => t.id));
    showToast(`💨 Đã chọn bộ Smoke Test: ${selectedScopeTcIds.size} kịch bản ưu tiên P1`, 'info');
  } else if (presetType === 'REGRESSION') {
    const p12 = allVerTcs.filter(t => t.priority === 'P1' || t.priority === 'P2');
    selectedScopeTcIds = new Set(p12.map(t => t.id));
    showToast(`🔄 Đã chọn bộ Regression Test: ${selectedScopeTcIds.size} kịch bản (P1 + P2)`, 'info');
  } else if (presetType === 'FAILED_RECENT') {
    const fails = allVerTcs.filter(t => {
      const summary = getTcPriorExecutionSummary(t.id, c.id, p.id);
      return summary.hadFailure || summary.lastStatus === 'FAIL' || summary.lastStatus === 'BLOCKED';
    });
    if (fails.length === 0) {
      showToast('ℹ️ Không có kịch bản nào từng ghi nhận lỗi (Fail/Blocked) ở các đợt trước.', 'info');
    } else {
      selectedScopeTcIds = new Set(fails.map(t => t.id));
      showToast(`⚠️ Đã kích hoạt nhanh ${fails.length} kịch bản từng bị lỗi để Re-test vá lỗi!`, 'info');
    }
  } else if (presetType === 'CLEAR') {
    selectedScopeTcIds.clear();
    showToast('❌ Đã bỏ chọn toàn bộ kịch bản', 'info');
  }

  renderCycleScopeUI();
}

function confirmSaveCycleScope() {
  if (!currentScopeCycleId) return;
  const c = getCycleById(currentScopeCycleId);
  if (!c) return;

  if (selectedScopeTcIds.size === 0) {
    if (!confirm('⚠️ Đợt kiểm thử chưa có kịch bản nào được chọn! Bạn có chắc muốn lưu danh sách rỗng?')) {
      return;
    }
  }

  setCycleTestCases(currentScopeCycleId, Array.from(selectedScopeTcIds));
  closeModal('modal-cycle-scope');
  showToast(`✅ Đã lưu phạm vi ${selectedScopeTcIds.size} kịch bản cho đợt [${c.code || c.id}] ${c.name}`, 'success');
  renderActiveProjectCycles();
  renderProjectsTab();
}

function openAddProjectModal() {
  const titleEl = document.getElementById('modal-project-title') || document.getElementById('modal-proj-title');
  if (titleEl) titleEl.textContent = '➕ Thêm dự án mới';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal('pf-id', '');
  setVal('pf-code', '');
  const codeEl = document.getElementById('pf-code');
  if (codeEl) codeEl.removeAttribute('readonly');

  setVal('pf-name', '');
  setVal('pf-domain', 'Hệ thống phần mềm');
  setVal('pf-desc', '');
  setVal('pf-version', 'v1.0');
  setVal('pf-standards', 'ISO/IEC 25010, ISO/IEC/IEEE 29119');

  populateProjectLeadDropdown('');
  openModal('modal-project-form');
}

function openEditProjectModal(projId) {
  const p = (state.projects || []).find(x => x.id === projId);
  if (!p) {
    showToast('⚠️ Không tìm thấy thông tin dự án!', 'error');
    return;
  }

  const titleEl = document.getElementById('modal-project-title') || document.getElementById('modal-proj-title');
  if (titleEl) titleEl.textContent = '✏️ Chỉnh sửa thông tin dự án';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal('pf-id', p.id);
  setVal('pf-code', p.code || p.id);
  const codeEl = document.getElementById('pf-code');
  if (codeEl) codeEl.setAttribute('readonly', 'true');

  setVal('pf-name', p.name || '');
  setVal('pf-domain', p.domain || 'Hệ thống phần mềm');
  setVal('pf-desc', p.desc || p.description || '');
  setVal('pf-version', p.activeVersion || (p.versions && p.versions[0]?.version) || 'v1.0');
  setVal('pf-standards', Array.isArray(p.standards) ? p.standards.join(', ') : (p.standards || 'ISO/IEC 25010'));

  populateProjectLeadDropdown(p.leadUsername || p.lead || '');
  openModal('modal-project-form');
}

function populateProjectLeadDropdown(selectedLead) {
  const sel = document.getElementById('pf-lead-select');
  if (!sel) return;

  const users = typeof getAllUsers === 'function' ? getAllUsers() : (state.users || []);
  const leads = users.filter(u => u.role === 'project_lead' || u.role === 'admin');

  sel.innerHTML = leads.map(u => `
    <option value="${u.username}" ${u.username === selectedLead ? 'selected' : ''}>
      👑 ${escapeHtml(u.name)} (@${escapeHtml(u.username)})
    </option>
  `).join('');
}

function confirmSaveProject() {
  const getVal = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  const id = getVal('pf-id');
  const code = getVal('pf-code').toUpperCase();
  const name = getVal('pf-name');
  const domain = getVal('pf-domain') || 'Hệ thống phần mềm';
  const desc = getVal('pf-desc');
  const leadSelect = document.getElementById('pf-lead-select');
  const lead = leadSelect ? leadSelect.value : (getVal('pf-lead') || 'lead');
  const activeVersion = getVal('pf-version') || '';
  const rawStandards = getVal('pf-standards');
  const standards = rawStandards ? rawStandards.split(',').map(s => s.trim()).filter(Boolean) : ['ISO/IEC 25010'];

  if (!code || !name) {
    showToast('⚠️ Vui lòng nhập đầy đủ Mã dự án và Tên dự án!', 'error');
    return;
  }

  try {
    if (id) {
      // Edit
      updateProject(id, { name, code, domain, desc, lead, leadUsername: lead, activeVersion, standards });
      showToast(`✅ Đã cập nhật dự án "${name}"`, 'success');
    } else {
      // Add
      addProject({ code, name, domain, desc, lead, leadUsername: lead, activeVersion, standards });
      showToast(`🎉 Đã thêm dự án mới thành công: "${name}"`, 'success');
    }
    closeModal('modal-project-form');
    renderProjectsTab();
    if (typeof window.initCockpit === 'function') {
      window.initCockpit();
    }
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

/**
 * Mở modal phân bổ nhân sự (Leader, Tester, Dev) cho một dự án cụ thể
 */
function openAssignProjectStaffModal(projectId) {
  const p = (state.projects || []).find(x => x.id === projectId);
  if (!p) {
    showToast('⚠️ Không tìm thấy dự án!', 'error');
    return;
  }

  const titleEl = document.getElementById('asg-staff-modal-title');
  if (titleEl) {
    titleEl.textContent = `👥 Phân bổ nhân sự: [${p.code || p.id}] ${p.name}`;
  }

  const idInput = document.getElementById('asg-staff-prj-id');
  if (idInput) idInput.value = p.id;

  const allUsers = typeof getAllUsers === 'function' ? getAllUsers() : (state.users || []);

  // 1. Leaders Checkboxes (Hỗ trợ phân bổ một hoặc nhiều Leader/Quản trị viên)
  const leadsContainer = document.getElementById('asg-staff-leads-box');
  const leads = allUsers.filter(u => u.role === 'project_lead' || u.role === 'admin');
  if (leadsContainer) {
    leadsContainer.innerHTML = leads.map(u => {
      const isMember = (p.members || []).some(m => m.username === u.username && (m.projectRole === 'lead' || m.projectRole === 'admin'));
      const isAssigned = (u.assignedProjects || []).includes(p.id);
      const isLead = u.username === p.leadUsername || (p.leadUsernames || []).includes(u.username);
      const isChecked = isMember || isAssigned || isLead;
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer; padding:3px 0">
          <input type="checkbox" name="asg-staff-lead-cb" value="${u.username}" ${isChecked ? 'checked' : ''} />
          <span>👑 <strong>${escapeHtml(u.name)}</strong> (@${escapeHtml(u.username)}) — <span style="font-size:11px; color:var(--text-muted)">${escapeHtml(u.roleTitle || u.role)}</span></span>
        </label>
      `;
    }).join('');
  }

  // Fallback dropdown nếu giao diện cũ còn dùng
  const leadSel = document.getElementById('asg-staff-lead-select');
  if (leadSel) {
    leadSel.innerHTML = leads.map(u => `
      <option value="${u.username}" ${u.username === p.leadUsername ? 'selected' : ''}>
        👑 ${escapeHtml(u.name)} (@${escapeHtml(u.username)})
      </option>
    `).join('');
  }

  // 2. Testers Checkboxes
  const testersContainer = document.getElementById('asg-staff-testers-box');
  if (testersContainer) {
    const testers = allUsers.filter(u => u.role === 'tester');
    testersContainer.innerHTML = testers.map(u => {
      const isMember = (p.members || []).some(m => m.username === u.username && m.projectRole === 'tester');
      const isAssigned = (u.assignedProjects || []).includes(p.id);
      const isChecked = isMember || isAssigned;
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer; padding:3px 0">
          <input type="checkbox" name="asg-staff-tester-cb" value="${u.username}" ${isChecked ? 'checked' : ''} />
          <span>🧪 <strong>${escapeHtml(u.name)}</strong> (@${escapeHtml(u.username)})</span>
        </label>
      `;
    }).join('');
  }

  // 3. Devs Checkboxes
  const devsContainer = document.getElementById('asg-staff-devs-box');
  if (devsContainer) {
    const devs = allUsers.filter(u => u.role === 'developer' || u.role === 'dev');
    devsContainer.innerHTML = devs.map(u => {
      const isMember = (p.members || []).some(m => m.username === u.username && m.projectRole === 'dev');
      const isAssigned = (u.assignedProjects || []).includes(p.id);
      const isChecked = isMember || isAssigned;
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer; padding:3px 0">
          <input type="checkbox" name="asg-staff-dev-cb" value="${u.username}" ${isChecked ? 'checked' : ''} />
          <span>💻 <strong>${escapeHtml(u.name)}</strong> (@${escapeHtml(u.username)})</span>
        </label>
      `;
    }).join('');
  }

  openModal('modal-assign-project-staff');
}

/**
 * Lưu kết quả phân bổ nhân sự cho dự án
 */
function confirmSaveProjectStaff() {
  const prjId = document.getElementById('asg-staff-prj-id')?.value;
  if (!prjId) return;

  let selectedLeads = Array.from(document.querySelectorAll('input[name="asg-staff-lead-cb"]:checked')).map(el => el.value);
  const fallbackLead = document.getElementById('asg-staff-lead-select')?.value;
  if (selectedLeads.length === 0 && fallbackLead) {
    selectedLeads.push(fallbackLead);
  }

  const selectedTesters = Array.from(document.querySelectorAll('input[name="asg-staff-tester-cb"]:checked')).map(el => el.value);
  const selectedDevs = Array.from(document.querySelectorAll('input[name="asg-staff-dev-cb"]:checked')).map(el => el.value);

  if (selectedLeads.length === 0) {
    showToast('⚠️ Vui lòng chỉ định ít nhất một Trưởng dự án hoặc Quản trị viên phụ trách!', 'error');
    return;
  }

  try {
    if (typeof assignStaffToProject === 'function') {
      assignStaffToProject(prjId, { 
        leadUsername: selectedLeads[0], 
        leadUsernames: selectedLeads, 
        testerUsernames: selectedTesters, 
        devUsernames: selectedDevs 
      });
    }
    closeModal('modal-assign-project-staff');
    showToast('✅ Đã phân bổ nhân sự cho dự án thành công!', 'success');

    // Cập nhật lại UI
    if (typeof renderProjectsTab === 'function') renderProjectsTab();
    if (typeof renderUsersTab === 'function') renderUsersTab();
    if (typeof renderWorkloadHeatmap === 'function') renderWorkloadHeatmap();
    if (typeof window.initCockpit === 'function') window.initCockpit();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function deleteProjectHandler(projId) {
  const p = (state.projects || []).find(x => x.id === projId);
  if (!p) return;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa dự án "${p.name}"? Toàn bộ kịch bản và phân công của dự án này sẽ bị gỡ bỏ.`)) return;

  try {
    deleteProject(projId);
    showToast(`🗑️ Đã xóa dự án "${p.name}"`, 'info');
    renderProjectsTab();
    if (typeof window.initCockpit === 'function') window.initCockpit();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function openAddVersionModal() {
  const p = getActiveProject();
  if (!p) return;
  document.getElementById('vf-tag').value = '';
  document.getElementById('vf-label').value = '';
  document.getElementById('vf-date').value = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  document.getElementById('vf-changelog').value = '';
  openModal('modal-version-form');
}

function confirmAddVersion() {
  const p = getActiveProject();
  if (!p) return;

  const version = document.getElementById('vf-tag').value.trim();
  const label = document.getElementById('vf-label').value.trim() || version;
  const status = document.getElementById('vf-status').value;
  const targetDate = document.getElementById('vf-date').value;
  const changelog = document.getElementById('vf-changelog').value.trim();

  if (!version) {
    showToast('⚠️ Vui lòng nhập mã phiên bản (VD: v2.1)!', 'error');
    return;
  }

  try {
    addProjectVersion(p.id, { version, label, status, targetDate, changelog });
    closeModal('modal-version-form');
    showToast(`✅ Đã thêm phiên bản ${version} cho dự án ${p.name}`, 'success');
    renderActiveProjectVersions();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function switchProjectVersionHandler(ver) {
  const p = getActiveProject();
  if (!p) return;
  setProjectActiveVersion(p.id, ver);

  // Tự động chuyển bộ lọc đợt test sang phiên bản vừa kích hoạt
  selectedCycleVersionFilter = ver;

  // Tự động chuyển activeCycleId sang đợt test của phiên bản này nếu có
  const verCycles = getTestCyclesForProject(p.id, ver);
  if (verCycles && verCycles.length > 0) {
    const act = verCycles.find(c => c.status === 'ACTIVE') || verCycles[0];
    state.activeCycleId = act ? act.id : null;
    saveCoreState();
  }

  showToast(`⚡ Đã kích hoạt phiên bản [${ver}] và đồng bộ ${verCycles.length} đợt test tương ứng!`, 'success');
  renderActiveProjectVersions();
  renderActiveProjectCycles();
  renderProjectsTab();
  loadSessionSettings();
}

// ================================================================
// 2. USER & ACCESS CONTROL (RBAC) TAB
// ================================================================
function renderUsersTab() {
  const users = getUsers();
  const tasks = state.assignments || [];

  // Update Stats Counters
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl('usr-stat-total', users.length);
  setEl('usr-stat-admin', users.filter(u => u.role === 'admin').length);
  setEl('usr-stat-tester', users.filter(u => u.role === 'tester').length);
  setEl('usr-stat-dev', users.filter(u => u.role === 'developer').length);
  setEl('usr-stat-locked', users.filter(u => u.status === 'LOCKED').length);

  const tbody = document.getElementById('users-table-body') || document.getElementById('users-tbody');
  if (!tbody) return;

  let filtered = users;
  if (selectedUserRoleFilter) {
    if (selectedUserRoleFilter === 'LOCKED') {
      filtered = filtered.filter(u => u.status === 'LOCKED');
    } else {
      filtered = filtered.filter(u => u.role === selectedUserRoleFilter);
    }
  }

  if (userSearchTerm) {
    const q = userSearchTerm.toLowerCase();
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.username.toLowerCase().includes(q) || 
      (u.email && u.email.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted)">Không tìm thấy người dùng phù hợp bộ lọc</td></tr>';
    return;
  }

  const projMap = new Map(getAllProjects().map(p => [p.id, p.code || p.id]));

  tbody.innerHTML = filtered.map(u => {
    const isLocked = u.status === 'LOCKED';
    let roleBadge = '<span class="badge badge-nr">💻 Lập trình viên</span>';
    if (u.role === 'admin') {
      roleBadge = '<span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700">🛡️ Quản trị viên cấp cao</span>';
    } else if (u.role === 'project_lead') {
      roleBadge = '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-weight:700">👑 Trưởng dự án</span>';
    } else if (u.role === 'tester') {
      roleBadge = '<span class="badge badge-pass">🧪 Kiểm thử viên</span>';
    }

    const myPrjIds = new Set(u.assignedProjects || []);
    (state.projects || []).forEach(p => {
      if (p.leadUsername === u.username || (p.leadUsernames || []).includes(u.username)) {
        myPrjIds.add(p.id);
      }
      if ((p.members || []).some(m => m.username === u.username)) {
        myPrjIds.add(p.id);
      }
    });

    const projBadges = Array.from(myPrjIds).map(pid => 
      `<span class="tc-badge-id" style="margin-right:4px; font-size:11px">${escapeHtml(projMap.get(pid) || pid)}</span>`
    ).join('') || '<span style="color:var(--text-muted); font-size:12px; font-style:italic">Chưa phân bổ</span>';

    const userTasks = tasks.filter(t => t.assigneeUsername === u.username);
    const activeTasks = userTasks.filter(t => t.status !== 'DONE' && t.status !== 'PASSED');
    const isInsideAdmin = window.location.pathname.includes('/admin/');
    const taskCol = u.role === 'tester' ? 
      (isInsideAdmin ? 
        `<span style="font-weight:700; color:var(--primary)">${activeTasks.length} bài</span> <span style="font-size:11.5px; color:var(--text-muted)">(${userTasks.length} tổng)</span>` : 
        `<a href="assignments.html" style="font-weight:700; color:var(--primary); text-decoration:underline" title="Xem chi tiết phân công">${activeTasks.length} bài đang test</a> (${userTasks.length} tổng)`
      ) : 
      '<span style="color:var(--text-muted); font-size:12px">—</span>';

    const avatarLetter = (u.name || u.username).trim().charAt(0).toUpperCase();

    return `
      <tr style="${isLocked ? 'opacity:0.65; background:rgba(0,0,0,0.02)' : ''}">
        <td>
          <div style="display:flex; align-items:center">
            <div class="user-avatar-circle">${avatarLetter}</div>
            <div>
              <strong>${escapeHtml(u.name)}</strong>
              <div style="font-size:11.5px; color:var(--text-muted)">${escapeHtml(u.email || 'Chưa có email')}</div>
            </div>
          </div>
        </td>
        <td><code>${escapeHtml(u.username)}</code></td>
        <td>${roleBadge}</td>
        <td>${projBadges}</td>
        <td style="text-align:center">${taskCol}</td>
        <td style="text-align:center">
          ${isLocked ? 
            '<span class="badge badge-fail">🔒 Tạm khóa</span>' : 
            '<span class="badge badge-pass">● Hoạt động</span>'
          }
        </td>
        <td style="text-align:center">
          <div style="display:inline-flex; gap:4px">
            <button type="button" class="btn btn-outline btn-xs" onclick="openEditUserModal('${u.id}')" title="Sửa thông tin">✏️ Sửa</button>
            ${u.username !== 'admin' ? `
              <button type="button" class="btn btn-outline btn-xs" onclick="toggleLockUserHandler('${u.id}')" title="${isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}" style="color:${isLocked ? 'var(--success)' : '#d97706'}">
                ${isLocked ? '🔓 Mở' : '🔒 Khóa'}
              </button>
            ` : ''}
            <button type="button" class="btn btn-outline btn-xs" onclick="openResetPasswordModal('${u.id}')" title="Đổi mật khẩu người dùng">🔑 Đổi MK</button>
            ${u.username !== 'admin' && state.currentUser?.username !== u.username ? `
              <button type="button" class="btn btn-outline btn-xs btn-delete" onclick="deleteUserHandler('${u.id}')" title="Xóa tài khoản" style="color:#ef4444; border-color:rgba(239,68,68,0.3)">🗑️</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterUsersByRole(role) {
  selectedUserRoleFilter = role;
  document.querySelectorAll('.user-role-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-role') === role);
  });
  renderUsersTab();
}

function handleUserSearch(val) {
  userSearchTerm = val.trim();
  renderUsersTab();
}

function openAddUserModal() {
  document.getElementById('modal-user-title').textContent = '➕ Thêm Người Dùng & Phân Quyền Mới';
  document.getElementById('uf-id').value = '';
  document.getElementById('uf-name').value = '';
  document.getElementById('uf-username').value = '';
  document.getElementById('uf-username').removeAttribute('readonly');
  document.getElementById('uf-password').value = '123';
  document.getElementById('uf-role').value = 'tester';
  document.getElementById('uf-email').value = '';
  renderUserProjectCheckboxes([]);
  openModal('modal-user-form');
}

function openEditUserModal(userId) {
  const u = getUserById(userId);
  if (!u) return;

  document.getElementById('modal-user-title').textContent = '✏️ Chỉnh Sửa Thông Tin Người Dùng';
  document.getElementById('uf-id').value = u.id;
  document.getElementById('uf-name').value = u.name || '';
  document.getElementById('uf-username').value = u.username || '';
  document.getElementById('uf-username').setAttribute('readonly', 'true');
  document.getElementById('uf-password').value = u.password || '123';
  document.getElementById('uf-role').value = u.role || 'tester';
  document.getElementById('uf-email').value = u.email || '';

  renderUserProjectCheckboxes(u.assignedProjects || []);
  openModal('modal-user-form');
}

function renderUserProjectCheckboxes(selectedProjectIds) {
  const container = document.getElementById('uf-projects-checkboxes');
  if (!container) return;

  const projs = getAllProjects();
  container.innerHTML = projs.map(p => {
    const isChecked = selectedProjectIds.includes(p.id);
    return `
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12.5px; padding:4px 0">
        <input type="checkbox" name="uf-proj-item" value="${p.id}" ${isChecked ? 'checked' : ''} />
        <span><strong>${escapeHtml(p.code || p.id)}</strong> — ${escapeHtml(p.name)}</span>
      </label>
    `;
  }).join('');
}

function confirmSaveUser() {
  const id = document.getElementById('uf-id').value.trim();
  const name = document.getElementById('uf-name').value.trim();
  const username = document.getElementById('uf-username').value.trim();
  const password = document.getElementById('uf-password').value.trim();
  const role = document.getElementById('uf-role').value;
  const email = document.getElementById('uf-email').value.trim();

  if (!name || !username || !password) {
    showToast('⚠️ Vui lòng nhập đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!', 'error');
    return;
  }

  const selectedProjects = Array.from(document.querySelectorAll('input[name="uf-proj-item"]:checked')).map(cb => cb.value);

  try {
    if (id) {
      // Edit
      updateUser(id, { name, role, email, password, assignedProjects: selectedProjects });
      showToast(`✅ Đã cập nhật thông tin người dùng: ${name}`, 'success');
    } else {
      // Add
      addUser({ name, username, password, role, email, assignedProjects: selectedProjects });
      showToast(`🎉 Đã thêm thành công người dùng mới: ${name}`, 'success');
    }
    closeModal('modal-user-form');
    renderUsersTab();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function toggleLockUserHandler(userId) {
  try {
    const u = toggleUserLock(userId);
    showToast(`${u.status === 'LOCKED' ? '🔒 Đã tạm khóa' : '🔓 Đã mở khóa'} tài khoản "${u.name}"!`, 'info');
    renderUsersTab();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function openResetPasswordModal(userId) {
  const u = getUserById(userId);
  if (!u) return;
  document.getElementById('pwd-user-id').value = u.id;
  document.getElementById('pwd-user-name').textContent = `${u.name} (@${u.username})`;
  document.getElementById('pwd-new-val').value = '123';
  openModal('modal-reset-password');
}

function confirmResetPassword() {
  const userId = document.getElementById('pwd-user-id').value;
  const newPwd = document.getElementById('pwd-new-val').value.trim();
  if (!newPwd) {
    showToast('⚠️ Mật khẩu mới không được để trống!', 'error');
    return;
  }

  try {
    const u = resetUserPassword(userId, newPwd);
    closeModal('modal-reset-password');
    showToast(`🔑 Đã cấp lại mật khẩu thành công cho tài khoản "${u.name}"!`, 'success');
    renderUsersTab();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

function deleteUserHandler(userId) {
  const u = getUserById(userId);
  if (!u) return;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa tài khoản "${u.name}" (@${u.username}) khỏi hệ thống?`)) return;

  try {
    deleteUser(userId);
    showToast(`🗑️ Đã xóa người dùng "${u.name}"`, 'info');
    renderUsersTab();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

// ================================================================
// 3. MODULES CATALOG TAB (SYNCHRONIZED BY PROJECT & VERSION)
// ================================================================
let selectedModuleProjectId = null;
let selectedModuleVersion = null;

function switchModuleContextProject(projId) {
  selectedModuleProjectId = projId;
  const p = (state.projects || []).find(pr => pr.id === projId) || getActiveProject();
  selectedModuleVersion = p?.activeVersion || (p?.versions && p.versions[0]?.version) || 'v1.0';
  renderModulesTable();
}

function switchModuleContextVersion(ver) {
  selectedModuleVersion = ver;
  renderModulesTable();
}

function renderModulesTable() {
  const tbody = document.getElementById('settings-modules-tbody');
  const toolbar = document.getElementById('settings-modules-toolbar');
  const titleEl = document.getElementById('settings-modules-title');
  if (!tbody) return;

  const allProjects = getAllProjects();
  const activePrj = getActiveProject();

  if (!selectedModuleProjectId) {
    selectedModuleProjectId = activePrj?.id || 'PRJ-SMARTVMS';
  }

  const p = (state.projects || []).find(pr => pr.id === selectedModuleProjectId) || activePrj;
  if (!p) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted)">Chưa có dự án nào</td></tr>';
    return;
  }

  const versions = p.versions || [{ version: p.activeVersion || 'v1.0' }];
  if (!selectedModuleVersion || !versions.some(v => v.version === selectedModuleVersion)) {
    selectedModuleVersion = p.activeVersion || versions[0]?.version || 'v1.0';
  }

  const curVer = selectedModuleVersion;
  const mods = getModules(curVer, p.id);
  const totalVerTcs = getAllTcs(curVer, p.id).length;
  const catalog = window.SMARTVMS_DEFAULT_CATALOG || window.SMARTVMS_TEST_CATALOG;

  // Update title
  if (titleEl) {
    titleEl.innerHTML = `📁 Danh Mục <strong>${mods.length} Phân Hệ Nghiệp Vụ</strong>: <span>${escapeHtml(p.name)}</span> <span class="badge badge-pass" style="font-size:11.5px; margin-left:8px">Phiên bản: ${escapeHtml(curVer)}</span>`;
  }

  // Render Toolbar with Project dropdown and Version pills
  if (toolbar) {
    toolbar.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px 18px; background:var(--bg-surface); border-bottom:1px solid var(--border-light)">
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px">
          <div style="display:flex; align-items:center; gap:6px">
            <span style="font-size:12px; font-weight:700; color:var(--text-muted)">Dự án:</span>
            <select class="form-control" onchange="switchModuleContextProject(this.value)" style="font-size:12.5px; font-weight:700; padding:4px 10px; border-radius:var(--radius-md); border:1px solid var(--border); color:var(--text-primary)">
              ${allProjects.map(pr => `<option value="${pr.id}" ${pr.id === p.id ? 'selected' : ''}>${escapeHtml(pr.name)}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex; align-items:center; gap:6px">
            <span style="font-size:12px; font-weight:700; color:var(--text-muted)">Phiên bản:</span>
            <div style="display:inline-flex; gap:4px">
              ${versions.map(v => {
                const isSel = curVer === v.version;
                const isAct = v.version === p.activeVersion;
                return `
                  <button type="button" class="btn btn-xs ${isSel ? 'btn-primary' : 'btn-outline'}" onclick="switchModuleContextVersion('${v.version}')" style="${isAct ? 'font-weight:700; border-color:var(--primary)' : ''}">
                    📦 ${escapeHtml(v.version)} ${isAct ? '●' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        <div style="font-size:12px; color:var(--text-muted)">
          Áp dụng: <strong style="color:var(--primary)">${mods.length}</strong> phân hệ | <strong style="color:var(--primary)">${totalVerTcs}</strong> kịch bản kiểm thử
        </div>
      </div>
    `;
  }

  if (mods.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted)">Phiên bản <strong>${escapeHtml(curVer)}</strong> chưa có phân hệ nào được cấu hình.</td></tr>`;
    return;
  }

  tbody.innerHTML = mods.map((m, idx) => {
    const modTcs = getTestCasesForModule(m.id, curVer, p.id);
    const count = modTcs.length;
    let desc = m.desc;
    if ((!desc || desc === m.name) && catalog && catalog.modules) {
      const catM = catalog.modules.find(cm => cm.id === m.id);
      if (catM && catM.desc) desc = catM.desc;
    }
    if (!desc || desc === m.name) desc = `Phân hệ kiểm thử chức năng ${m.name}`;

    const verBadge = m.versions && Array.isArray(m.versions) ?
      m.versions.map(v => `<span class="badge ${v === curVer ? 'badge-pass' : 'badge-outline'}" style="font-size:10px; margin:1px">${escapeHtml(v)}</span>`).join('') :
      '<span class="badge badge-nr" style="font-size:10.5px">Tất cả</span>';

    return `
      <tr>
        <td style="text-align:center; font-weight:700">${idx + 1}</td>
        <td style="text-align:center"><span class="tc-badge-id">[${escapeHtml(m.id)}]</span></td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td><span style="font-size:12px; color:var(--text-secondary); line-height:1.4">${escapeHtml(desc)}</span></td>
        <td style="text-align:center">${verBadge}</td>
        <td style="text-align:center">
          <span class="badge ${count > 0 ? 'badge-pass' : 'badge-nr'}" style="font-weight:700; font-size:11.5px">
            ${count} bài test
          </span>
        </td>
        <td style="text-align:center">
          <button type="button" class="btn btn-outline btn-xs" onclick="deleteModule('${m.id}')" style="color:#ef4444; border-color:rgba(239,68,68,0.3)">🗑️ Xóa</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddModuleModal() {
  const p = (state.projects || []).find(pr => pr.id === selectedModuleProjectId) || getActiveProject();
  const nextNum = (getModules(selectedModuleVersion, p?.id).length + 1).toString().padStart(2, '0');
  document.getElementById('new-mod-id').value = `M${nextNum}`;
  document.getElementById('new-mod-name').value = '';
  document.getElementById('new-mod-desc').value = '';
  openModal('modal-add-module');
}

function confirmAddModule() {
  const id = document.getElementById('new-mod-id')?.value.trim().toUpperCase();
  const name = document.getElementById('new-mod-name')?.value.trim();
  const desc = document.getElementById('new-mod-desc')?.value.trim();

  if (!id || !name) {
    showToast('⚠️ Vui lòng nhập đầy đủ mã và tên phân hệ!', 'error');
    return;
  }

  const p = (state.projects || []).find(pr => pr.id === selectedModuleProjectId) || getActiveProject();
  if (!p) return;
  if (!p.modules) p.modules = [];

  const curVer = selectedModuleVersion || p.activeVersion || 'v1.0';
  p.modules.push({ id, name, desc, versions: [curVer] });
  saveCoreState();
  closeModal('modal-add-module');
  showToast(`✅ Đã thêm phân hệ mới [${id}] ${name} cho phiên bản ${curVer}`, 'success');
  renderModulesTable();
}

function deleteModule(modId) {
  if (!confirm(`Bạn có chắc muốn xóa phân hệ [${modId}]?`)) return;
  const p = (state.projects || []).find(pr => pr.id === selectedModuleProjectId) || getActiveProject();
  if (!p) return;
  p.modules = (p.modules || []).filter(m => m.id !== modId);
  saveCoreState();
  showToast(`🗑️ Đã xóa phân hệ [${modId}]`, 'info');
  renderModulesTable();
}

// ================================================================
// 4. SESSION SETTINGS TAB
// ================================================================
function loadSessionSettings() {
  const s = state.session || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('setting-session-name', s.name);
  setVal('setting-session-owner', s.owner);
  setVal('setting-session-version', s.version);
  setVal('setting-session-notes', s.notes);

  const curCycle = getActiveCycle();
  const descEl = document.getElementById('setting-session-active-cycle-desc');
  if (descEl) {
    if (curCycle) {
      descEl.innerHTML = `<strong>${escapeHtml(curCycle.name)}</strong> (Mã: <code style="color:var(--primary); font-weight:700">${escapeHtml(curCycle.code)}</code> | Phiên bản: <code>${escapeHtml(curCycle.version)}</code> | Trạng thái: <span class="badge ${curCycle.status === 'ACTIVE' ? 'badge-pass' : 'badge-nr'}">${curCycle.status}</span>)`;
    } else {
      descEl.textContent = 'Chưa có đợt kiểm thử nào được chọn';
    }
  }
}

function saveSessionSettings() {
  state.session = {
    name: document.getElementById('setting-session-name')?.value || 'Sprint 1 - Regression Test',
    owner: document.getElementById('setting-session-owner')?.value || (state.currentUser?.name || 'QA Lead'),
    version: document.getElementById('setting-session-version')?.value || 'v2.0',
    notes: document.getElementById('setting-session-notes')?.value || ''
  };
  saveCoreState();
  showToast('💾 Đã lưu cấu hình phiên kiểm thử!', 'success');
}

// ================================================================
// 5. STORAGE & BACKUP TAB
// ================================================================
function renderStorageStats() {
  const tcs = getAllTcs();
  const asgs = state.assignments || [];
  const results = Object.keys(state.results || {}).length;
  const rawSize = (localStorage.getItem(STATE_STORAGE_KEY) || '').length;
  const kb = (rawSize / 1024).toFixed(1);

  const setT = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setT('stat-storage-projects', getAllProjects().length);
  setT('stat-storage-users', getUsers().length);
  setT('stat-storage-modules', getModules().length);
  setT('stat-storage-tcs', tcs.length);
  setT('stat-storage-asgs', asgs.length);
  setT('stat-storage-results', results);
  setT('stat-storage-size', `${kb} KB`);
}

function exportFullBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartVMS_FullState_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  showToast('📥 Đã tải xuống file sao lưu toàn bộ hệ thống!', 'success');
}

function importFullBackup(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.projects) {
        state = { ...state, ...imported };
        saveCoreState();
        showToast('✅ Khôi phục dữ liệu sao lưu thành công!', 'success');
        window.location.reload();
      } else {
        showToast('⚠️ Định dạng tệp sao lưu không hợp lệ!', 'error');
      }
    } catch (err) {
      showToast('❌ Lỗi khi đọc tệp JSON sao lưu!', 'error');
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (!confirm('⚠️ CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu kiểm thử, kết quả và phân công. Hệ thống sẽ khởi tạo lại từ đầu. Bạn có chắc chắn muốn tiếp tục?')) return;
  localStorage.removeItem(STATE_STORAGE_KEY);
  localStorage.removeItem('smartvms_theme');
  showToast('🔄 Đã xóa sạch dữ liệu hệ thống!', 'info');
  setTimeout(() => {
    window.location.reload();
  }, 350);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
