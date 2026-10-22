/**
 * SMARTVMS QA HUB - TESTCASES REPOSITORY MODULE (JS)
 * Standard Compliance: ISO 9001:2015 Clause 7.5 & 8.5.2 | ISO/IEC/IEEE 29119-3:2021 | ISO/IEC 25010:2023
 * Handles testcase catalog browsing, search/filter, CRUD, Cloning, Override/Reset, and JSON import/export.
 */

function initTestcasesModule(skipResetState = false) {
  if (!skipResetState) {
    initCoreState();
  }
  const p = getActiveProject();

  // Check URL params for deep-linking
  const urlParams = new URLSearchParams(window.location.search);
  const urlCycleId = urlParams.get('cycleId');
  const urlVersion = urlParams.get('version');

  // Populate version filter
  const verFilter = document.getElementById('filter-version');
  if (verFilter && p) {
    const versions = (Array.isArray(p.versions) && p.versions.length > 0)
      ? p.versions
      : [{ version: p.activeVersion || 'v1.0', label: 'Bản phát hành chuẩn' }];
    
    let targetVer = urlVersion || p.activeVersion || versions[0]?.version || '';
    verFilter.innerHTML = `<option value="">-- Tất cả phiên bản --</option>` +
      versions.map(v => `<option value="${escapeHtml(v.version)}" ${v.version === targetVer ? 'selected' : ''}>${escapeHtml(v.version)} (${escapeHtml(v.label || 'Bản phát hành')})</option>`).join('');
    verFilter.value = targetVer;
  }

  // Populate cycle filter
  populateTcCycleFilter(p?.id, verFilter?.value || '', urlCycleId);

  // Populate module filter
  const modFilter = document.getElementById('filter-module');
  if (modFilter) {
    const user = getCurrentUser();
    const mods = p ? getAccessibleModulesForUser(user, state.activeProjectId) : [];
    modFilter.innerHTML = `<option value="">Tất cả phân hệ (${mods.length} phân hệ)</option>` +
      mods.map(m => `<option value="${m.id}">[${m.id}] ${m.name}</option>`).join('');
  }

  // Populate assignee filter
  const asgFilter = document.getElementById('filter-assignee');
  if (asgFilter) {
    const allUsers = typeof getUsers === 'function' ? getUsers() : [];
    const testers = allUsers.filter(u => u.role === 'tester' || (p?.members || []).some(m => m.username === u.username));
    asgFilter.innerHTML = `
      <option value="">-- Tất cả người kiểm thử --</option>
      <option value="__UNASSIGNED__">⚠️ Chưa phân công</option>
      <option value="__ASSIGNED__">👤 Đã phân công</option>
      ${testers.map(t => `<option value="${t.username}">👤 ${escapeHtml(t.name || t.username)}</option>`).join('')}
    `;
  }

  // Populate module select in Add/Edit modal if present
  const modalMod = document.getElementById('tc-form-module');
  if (modalMod) {
    const mods = getModules();
    modalMod.innerHTML = mods.map(m => `<option value="${m.id}">[${m.id}] ${m.name}</option>`).join('');
  }

  // Hook up header checkbox if present
  const headCheckbox = document.querySelector('.tc-table thead input[type="checkbox"]');
  if (headCheckbox && !headCheckbox.__bound) {
    headCheckbox.__bound = true;
    headCheckbox.addEventListener('change', function() {
      toggleSelectAllTcs(this.checked);
    });
  }

  updateQuickAsgButton();
  renderTestcasesTable();
  if (typeof renderAdminAdhocSection === 'function') {
    renderAdminAdhocSection();
  }
}

function populateTcCycleFilter(projectId, version, selectCycleId) {
  const cycleFilter = document.getElementById('filter-cycle');
  if (!cycleFilter) return;
  const pId = projectId || state.activeProjectId;
  let cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(pId, version) : [];
  if (cycles.length === 0 && version) {
    cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(pId) : [];
  }

  cycleFilter.innerHTML = `<option value="">-- Tất cả đợt kiểm thử (${cycles.length}) --</option>` +
    cycles.map(c => {
      const scopeTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(c.id) : [];
      return `<option value="${c.id}" ${c.id === selectCycleId ? 'selected' : ''}>
        ${c.status === 'ACTIVE' ? '🟢' : '⏳'} ${escapeHtml(c.name)} (${scopeTcs.length} bài)
      </option>`;
    }).join('');

  if (selectCycleId && cycles.some(c => c.id === selectCycleId)) {
    cycleFilter.value = selectCycleId;
  }
}

function handleVersionFilterChange() {
  const p = getActiveProject();
  const v = document.getElementById('filter-version')?.value || '';
  populateTcCycleFilter(p?.id, v);
  updateQuickAsgButton();
  renderTestcasesTable();
}

function updateQuickAsgButton() {
  const btn = document.getElementById('btn-quick-goto-asg');
  if (!btn) return;
  const p = getActiveProject();
  const cycleId = document.getElementById('filter-cycle')?.value || state.activeCycleId || '';
  const ver = document.getElementById('filter-version')?.value || '';
  let url = `assignments.html?projectId=${encodeURIComponent(p ? p.id : '')}`;
  if (cycleId) url += `&cycleId=${encodeURIComponent(cycleId)}`;
  if (ver) url += `&version=${encodeURIComponent(ver)}`;
  btn.href = url;
}

function renderTestcasesTable() {
  const tbody = document.getElementById('tc-table-body');
  if (!tbody) return;

  const p = getActiveProject();
  const verFilter = document.getElementById('filter-version')?.value || '';
  const cycleFilter = document.getElementById('filter-cycle')?.value || '';
  const modFilter = document.getElementById('filter-module')?.value || '';
  const prioFilter = document.getElementById('filter-priority')?.value || '';
  const statusFilter = document.getElementById('filter-status')?.value || '';
  const asgFilterVal = document.getElementById('filter-assignee')?.value || '';
  const typeFilter = document.getElementById('filter-type')?.value || '';
  const suiteFilter = document.getElementById('filter-suite')?.value || '';
  const q = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

  updateQuickAsgButton();

  // Tính danh sách ID kịch bản thuộc phạm vi đợt kiểm thử nếu có chọn cycle
  let cycleScopeSet = null;
  if (cycleFilter) {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(cycleFilter) : [];
    cycleScopeSet = new Set(cycleTcs.map(t => t.id));
  }

  const user = getCurrentUser();
  const allTcs = getAccessibleTcsForUser(user, state.activeProjectId);
  const filtered = allTcs.filter(tc => {
    // 1. Lọc theo Phiên bản
    if (verFilter) {
      const tcVer = (tc.version || '').trim().toLowerCase();
      const targetVer = verFilter.trim().toLowerCase();
      if (tcVer) {
        if (tcVer !== targetVer) return false;
      } else {
        const vers = p?.versions || [];
        if (vers.length === 1 && (vers[0].version || vers[0] || '').trim().toLowerCase() === targetVer) {
          // OK cho dự án chỉ có 1 phiên bản duy nhất
        } else {
          return false;
        }
      }
    }

    // 2. Lọc theo Đợt kiểm thử (Cycle Scope)
    if (cycleScopeSet && !cycleScopeSet.has(tc.id)) {
      return false;
    }

    // 3. Lọc theo Phân hệ
    if (modFilter && tc.module !== modFilter) return false;

    // 4. Lọc theo Mức độ ưu tiên
    if (prioFilter) {
      const tcPrio = (tc.priority || '').toUpperCase();
      const targetPrio = prioFilter.toUpperCase();
      if (targetPrio === 'CRITICAL' && tcPrio !== 'P1' && tcPrio !== 'CRITICAL') return false;
      if (targetPrio === 'HIGH' && tcPrio !== 'P2' && tcPrio !== 'HIGH') return false;
      if (targetPrio === 'MEDIUM' && tcPrio !== 'P3' && tcPrio !== 'MEDIUM') return false;
      if (targetPrio === 'LOW' && tcPrio !== 'P4' && tcPrio !== 'LOW') return false;
      if (targetPrio !== 'CRITICAL' && targetPrio !== 'HIGH' && targetPrio !== 'MEDIUM' && targetPrio !== 'LOW') {
        if (tcPrio !== targetPrio) return false;
      }
    }

    // 5. Lọc theo Trạng thái kết quả
    const r = state.results[tc.id] || {};
    const s = r.status || 'Not Run';
    if (statusFilter && s !== statusFilter) return false;

    // 6. Lọc theo Phân công (Assignee)
    if (asgFilterVal && p) {
      const tcAsgs = (state.assignments || []).filter(a => 
        a.projectId === p.id && a.tcId === tc.id && (!cycleFilter || a.cycleId === cycleFilter || !a.cycleId)
      );
      if (asgFilterVal === '__UNASSIGNED__' && tcAsgs.length > 0) return false;
      if (asgFilterVal === '__ASSIGNED__' && tcAsgs.length === 0) return false;
      if (asgFilterVal !== '__UNASSIGNED__' && asgFilterVal !== '__ASSIGNED__') {
        if (!tcAsgs.some(a => a.assigneeUsername === asgFilterVal)) return false;
      }
    }

    // 7. Lọc theo loại và suite
    if (typeFilter) {
      const tcType = tc.type || 'Chức năng';
      if (!tcType.toLowerCase().includes(typeFilter.toLowerCase())) return false;
    }
    if (suiteFilter) {
      const tcSuite = tc.suite || 'REGRESSION';
      if (tcSuite !== suiteFilter) return false;
    }

    // 8. Tìm kiếm từ khóa
    if (q) {
      const matchId = (tc.id || '').toLowerCase().includes(q);
      const matchName = ((tc.name || tc.title) || '').toLowerCase().includes(q);
      const matchDesc = (tc.description || '').toLowerCase().includes(q);
      const matchData = (tc.testData || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchDesc && !matchData) return false;
    }
    return true;
  });

  // Update counts in both admin and tester view
  const countBadge = document.getElementById('tc-total-count');
  if (countBadge) countBadge.textContent = `${filtered.length} / ${allTcs.length} kịch bản`;
  const countSpan = document.getElementById('tc-count');
  if (countSpan) countSpan.textContent = filtered.length;

  if (!state.projects || state.projects.length === 0) {
    if (countBadge) countBadge.textContent = '0 kịch bản';
    if (countSpan) countSpan.textContent = '0';
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:48px 20px; color:var(--text-muted)">
      <div style="font-size:38px; margin-bottom:12px">🏢</div>
      <div style="font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:6px">Chưa có dự án nào trong hệ thống (0 dự án)</div>
      <div style="font-size:13px; color:var(--text-secondary); margin-bottom:20px; max-width:550px; margin-left:auto; margin-right:auto">
        Toàn bộ dữ liệu dự án đã được làm sạch 100%. Vui lòng tạo dự án mới hoặc nạp trực tiếp file Excel kịch bản để hệ thống tự động khởi tạo dự án và đồng bộ lên Database Cloud.
      </div>
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap">
        <button type="button" class="btn btn-primary btn-sm" onclick="window.location.href=(window.location.pathname.includes('/lead/') ? 'index.html' : '../admin/settings.html?tab=projects')" style="font-weight:700">
          🏢 Quay về danh mục dự án
        </button>
        <label class="btn btn-outline btn-sm" style="cursor:pointer; font-weight:700; color:#16a34a; border-color:#16a34a">
          📗 Nhập kịch bản từ Excel
          <input type="file" accept=".xlsx, .xls" style="display:none" onchange="importCatalogFromExcel(this)" />
        </label>
      </div>
    </td></tr>`;
    return;
  }

  if (allTcs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:48px 20px; color:var(--text-muted)">
      <div style="font-size:38px; margin-bottom:12px">📭</div>
      <div style="font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:6px">Dự án đang ở trạng thái sạch (0 kịch bản)</div>
      <div style="font-size:13px; color:var(--text-secondary); margin-bottom:20px; max-width:550px; margin-left:auto; margin-right:auto">
        Toàn bộ dữ liệu cũ đã được xóa sạch sẽ. Bạn có thể nạp file Excel hoặc JSON kịch bản mới tinh của dự án lên hệ thống ngay tại đây:
      </div>
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap">
        <label class="btn btn-primary btn-sm" style="cursor:pointer; font-weight:700">
          📗 Nhập kịch bản từ Excel
          <input type="file" accept=".xlsx, .xls" style="display:none" onchange="importCatalogFromExcel(this)" />
        </label>
        <button type="button" class="btn btn-outline btn-sm" onclick="downloadExcelTemplate()">📑 Tải tệp Excel mẫu</button>
        <label class="btn btn-outline btn-sm" style="cursor:pointer">
          📁 Nhập JSON
          <input type="file" accept=".json" style="display:none" onchange="importCatalogFromJson(this)" />
        </label>
      </div>
    </td></tr>`;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:36px; color:var(--text-muted)">🔍 Không tìm thấy kịch bản nào phù hợp bộ lọc.</td></tr>`;
    return;
  }

  // Determine whether this page is Tester view or Admin view based on the table header
  const isTesterTable = !document.querySelector('.tc-table thead input[type="checkbox"]');

  if (isTesterTable) {
    // Tester Table Columns: [Mã Kịch Bản | Phân Hệ | Tiêu Đề | Ưu Tiên | Loại kịch bản | Số Bước | Kết Quả Gần Nhất | Thao Tác]
    tbody.innerHTML = filtered.map(tc => {
      const r = state.results[tc.id] || {};
      const s = r.status || 'Not Run';
      const tcName = tc.name || tc.title;
      const stepCount = (tc.steps && Array.isArray(tc.steps)) ? tc.steps.length : 1;

      return `
        <tr>
          <td style="width:120px; font-weight:700">
            <span class="tc-badge-id" onclick="viewTcDetailModal('${tc.id}')" title="Xem chi tiết đặc tả ISO 29119">[${tc.id}]</span>
          </td>
          <td style="width:80px; text-align:center; font-family:monospace; font-weight:700; color:var(--primary)">[${tc.module}]</td>
          <td>
            <div style="font-weight:700; color:var(--text-primary); cursor:pointer" onclick="viewTcDetailModal('${tc.id}')" title="${tcName}">
              ${tcName}
            </div>
            ${tc.testData ? `<div style="font-size:11px; color:var(--text-muted); font-family:monospace; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">Dữ liệu: ${tc.testData}</div>` : ''}
          </td>
          <td style="width:115px; text-align:center">${priorityBadge(tc.priority)}</td>
          <td style="width:130px; text-align:center">
            ${getTestTypeBadge(tc.type)}
          </td>
          <td style="width:85px; text-align:center; font-size:12px; color:var(--text-muted)">${stepCount} bước</td>
          <td style="width:115px; text-align:center">${statusBadge(s)}</td>
          <td style="width:105px; text-align:center">
            <div style="display:inline-flex; align-items:center; gap:4px">
              <button type="button" class="btn-tc-icon" onclick="viewTcDetailModal('${tc.id}')" title="Xem chi tiết">👁️</button>
              <button type="button" class="btn-tc-icon" style="background:#2563eb; color:#fff" onclick="jumpToExecution('${tc.id}')" title="Chạy kiểm thử">▶️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    // Lead / Admin Table Columns: [Checkbox | Mã kịch bản | Ưu tiên | Phân hệ | Loại & Suite | Tên kịch bản & Mục tiêu | Trạng thái | Phân công (Tester) | Thao tác]
    tbody.innerHTML = filtered.map(tc => {
      const r = state.results[tc.id] || {};
      const s = r.status || 'Not Run';
      const mod = getModuleName(tc.module);
      const shortMod = mod.split(']')[0] ? mod.split(']')[0] + ']' : `[${tc.module}]`;
      const tcName = tc.name || tc.title;
      const isOverridden = isOverriddenTc(tc.id);
      const isCustom = isCustomTc(tc.id);

      let tagBadges = '';
      if (isCustom) tagBadges += '<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:9.5px; margin-left:4px">✨ Tự tạo</span>';
      if (isOverridden) tagBadges += '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:9.5px; margin-left:4px">✏️ Đã hiệu đính</span>';

      const suiteLabel = getTestSuiteLabel(tc.suite).split('(')[0].trim();

      // Đồng bộ thông tin phân công nhiệm vụ từ state.assignments
      const tcAsgs = (state.assignments || []).filter(a => 
        a.projectId === p?.id && a.tcId === tc.id && (!cycleFilter || a.cycleId === cycleFilter || !a.cycleId)
      );

      let assigneeHtml = '';
      if (tcAsgs.length > 0) {
        assigneeHtml = tcAsgs.map(a => `
          <div style="font-size:11.5px; font-weight:700; color:var(--text-primary); margin-bottom:2px" title="${escapeHtml(a.assigneeName)}">
            👤 ${escapeHtml(a.assigneeName.split('(')[0].trim())}
          </div>
        `).join('');
      } else if (r.tester) {
        assigneeHtml = `
          <span style="font-size:12px; color:var(--text-secondary)">👤 ${escapeHtml(r.tester)}</span>
        `;
      } else {
        assigneeHtml = `
          <span class="badge badge-draft" style="font-size:10px">Chưa giao</span>
        `;
      }

      return `
        <tr>
          <td style="width:36px; text-align:center">
            <input type="checkbox" class="tc-row-checkbox" value="${tc.id}" style="cursor:pointer" />
          </td>
          <td style="width:115px; text-align:center">
            <span class="tc-badge-id" onclick="viewTcDetailModal('${tc.id}')" title="Xem chi tiết đặc tả">[${tc.id}]</span>
          </td>
          <td style="width:90px; text-align:center">${priorityBadge(tc.priority)}</td>
          <td style="width:105px; text-align:center; font-family:monospace; font-weight:700; color:var(--primary)">${shortMod}</td>
          <td style="width:125px; text-align:center">
            ${getTestTypeBadge(tc.type)}
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px">${escapeHtml(suiteLabel)}</div>
          </td>
          <td>
            <div style="font-weight:700; color:var(--text-primary); cursor:pointer" onclick="viewTcDetailModal('${tc.id}')" title="${tcName}">
              ${tcName} ${tagBadges}
            </div>
            ${tc.testData ? `<div style="font-size:11px; color:var(--text-muted); font-family:monospace; margin-top:2px">📊 ${tc.testData}</div>` : ''}
          </td>
          <td style="width:110px; text-align:center">${statusBadge(s)}</td>
          <td style="width:145px">
            ${assigneeHtml}
          </td>
          <td style="width:160px; text-align:center">
            <div style="display:flex; align-items:center; justify-content:center; gap:4px">
              <button type="button" class="btn-tc-icon" onclick="viewTcDetailModal('${tc.id}')" title="Xem chi tiết">👁️</button>
              <button type="button" class="btn-tc-icon" onclick="jumpToExecution('${tc.id}')" title="Chạy kiểm thử">▶️</button>
              <a href="assignments.html?projectId=${encodeURIComponent(p?.id || '')}${cycleFilter ? '&cycleId=' + encodeURIComponent(cycleFilter) : ''}" class="btn-tc-icon" title="Giao việc hoặc chuyển sang Kế hoạch giao việc">🚀</a>
              <button type="button" class="btn-tc-icon" onclick="openCloneTcModal('${tc.id}')" title="Nhân bản kịch bản">📋</button>
              <button type="button" class="btn-tc-icon" onclick="openEditTcModal('${tc.id}')" title="Chỉnh sửa / Hiệu đính">✏️</button>
              ${isOverridden ? `<button type="button" class="btn-tc-icon" onclick="resetBuiltinTc('${tc.id}'); renderTestcasesTable()" title="Khôi phục nguyên bản gốc" style="color:#d97706">🔄</button>` : ''}
              <button type="button" class="btn-tc-icon btn-delete" onclick="deleteTc('${tc.id}')" title="Xóa kịch bản kiểm thử">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function toggleSelectAllTcs(checked) {
  document.querySelectorAll('.tc-row-checkbox').forEach(cb => {
    cb.checked = checked;
  });
}

function resetFilters() {
  resetTcFilters();
}

function resetTcFilters() {
  if (document.getElementById('filter-search')) document.getElementById('filter-search').value = '';
  if (document.getElementById('filter-version')) document.getElementById('filter-version').value = '';
  if (document.getElementById('filter-cycle')) document.getElementById('filter-cycle').value = '';
  if (document.getElementById('filter-module')) document.getElementById('filter-module').value = '';
  if (document.getElementById('filter-priority')) document.getElementById('filter-priority').value = '';
  if (document.getElementById('filter-status')) document.getElementById('filter-status').value = '';
  if (document.getElementById('filter-assignee')) document.getElementById('filter-assignee').value = '';
  if (document.getElementById('filter-type')) document.getElementById('filter-type').value = '';
  if (document.getElementById('filter-suite')) document.getElementById('filter-suite').value = '';
  const p = getActiveProject();
  populateTcCycleFilter(p?.id, '');
  updateQuickAsgButton();
  renderTestcasesTable();
}

function jumpToExecution(tcId) {
  window.location.href = `execution.html?tc=${tcId}`;
}

// ================================================================
// MODAL: CHI TIẾT KỊCH BẢN (ISO 29119-3 & ISO 9001:2015 8.5.2)
// ================================================================
let currentDetailTcId = null;

function viewTcDetailModal(tcId) {
  currentDetailTcId = tcId;
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const r = state.results[tc.id] || {};
  const isCustom = isCustomTc(tcId);
  const isOverridden = isOverriddenTc(tcId);

  const titleEl = document.getElementById('modal-tc-title');
  const bodyEl = document.getElementById('modal-tc-body');

  if (titleEl) {
    titleEl.innerHTML = `
      <span style="font-family:monospace; color:var(--primary)">[${tc.id}]</span> 
      ${tc.name || tc.title}
    `;
  }

  if (bodyEl) {
    const stepsArray = (tc.steps && Array.isArray(tc.steps)) ? tc.steps : (tc.steps ? [tc.steps] : []);
    const expectedArray = (tc.expected && Array.isArray(tc.expected)) ? tc.expected : (tc.expected ? [tc.expected] : []);

    bodyEl.innerHTML = `
      <!-- Header Badges Bar (ISO Traceability) -->
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; flex-wrap:wrap">
        ${priorityBadge(tc.priority)}
        <span class="badge badge-nr">${getModuleName(tc.module)}</span>
        ${statusBadge(r.status)}
        ${getTestTypeBadge(tc.type)}
        <span class="badge" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1">🎯 ${getTestSuiteLabel(tc.suite)}</span>
        ${tc.platform ? `<span class="badge" style="background:#e0e7ff; color:#3730a3">💻 ${tc.platform}</span>` : ''}
        ${tc.reqId ? `<span class="badge" style="background:#fef3c7; color:#92400e">📌 SRS: ${tc.reqId}</span>` : ''}
        ${isCustom ? '<span class="badge" style="background:#dcfce7; color:#166534">✨ Kịch bản tự tạo</span>' : ''}
        ${isOverridden ? '<span class="badge" style="background:#fef3c7; color:#b45309">✏️ Đã hiệu đính</span>' : ''}
      </div>

      <!-- Objective Section -->
      <div style="background:var(--bg-surface); padding:12px 14px; border-radius:8px; border:1px solid var(--border); margin-bottom:12px">
        <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px">🎯 Mục tiêu và đặc tả kịch bản:</div>
        <div style="font-size:13.5px; font-weight:600; color:var(--text-primary)">${tc.name || tc.title}</div>
        ${tc.description && tc.description !== tc.name ? `<div style="font-size:12.5px; color:var(--text-muted); margin-top:4px">${tc.description}</div>` : ''}
      </div>

      <!-- Precondition -->
      ${tc.precondition ? `
        <div style="background:rgba(37,99,235,0.05); padding:12px 14px; border-radius:8px; border:1px solid rgba(37,99,235,0.2); margin-bottom:12px">
          <div style="font-size:11px; font-weight:800; color:var(--primary); text-transform:uppercase; margin-bottom:4px">⚙️ Điều kiện tiên quyết:</div>
          <div style="font-size:12.5px; color:var(--text-primary)">${tc.precondition}</div>
        </div>
      ` : ''}

      <!-- Test Data (ISO 29119-3 Inputs) -->
      ${tc.testData ? `
        <div style="background:var(--bg-surface); padding:12px 14px; border-radius:8px; border:1px solid var(--border); margin-bottom:12px">
          <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px">📊 Dữ liệu kiểm thử:</div>
          <div style="font-family:monospace; font-size:12.5px; background:var(--bg-card); padding:8px 10px; border-radius:6px; border:1px solid var(--border-light); white-space:pre-wrap; word-break:break-word">${escapeHtml(tc.testData)}</div>
        </div>
      ` : ''}

      <!-- Steps -->
      <div style="margin-bottom:12px">
        <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px">📝 Các bước thực hiện:</div>
        ${stepsArray.length > 0 ? stepsArray.map((s, idx) => `
          <div style="padding:6px 0; border-bottom:1px dashed var(--border-light); font-size:12.5px; display:flex; gap:8px">
            <span style="font-weight:700; color:var(--primary); min-width:65px">Bước ${idx + 1}:</span>
            <span style="color:var(--text-primary)">${s.replace(/^[0-9]+\.\s*/, '')}</span>
          </div>
        `).join('') : '<div style="font-size:12.5px; color:var(--text-muted)">Thực hiện theo quy trình chuẩn.</div>'}
      </div>

      <!-- Expected Results -->
      <div style="background:rgba(34, 197, 94, 0.06); padding:12px 14px; border-radius:8px; border:1.5px solid #86efac; margin-bottom:12px">
        <div style="font-size:11px; font-weight:800; color:#15803d; text-transform:uppercase; margin-bottom:4px">✅ Kết quả mong đợi:</div>
        <div style="font-size:12.5px; color:#166534; font-weight:600">
          ${expectedArray.length > 0 ? expectedArray.map(e => `<div>✓ ${e}</div>`).join('') : 'Thực hiện thành công theo thiết kế.'}
        </div>
      </div>

      <!-- Actual Results & Execution History (ISO 29119-3 Log) -->
      ${r.runAt ? `
        <div style="background:var(--bg-surface); padding:12px 14px; border-radius:8px; border:1px solid var(--border); margin-bottom:12px">
          <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px">📊 Nhật ký thực thi gần nhất:</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px">
            <div><strong>Người kiểm thử:</strong> ${r.tester || '--'}</div>
            <div><strong>Thời gian:</strong> ${new Date(r.runAt).toLocaleString('vi-VN')}</div>
            <div><strong>Trạng thái:</strong> ${statusBadge(r.status)}</div>
            ${r.actualResult ? `<div style="grid-column:1/-1; color:var(--primary)"><strong>Kết quả thực tế:</strong> ${r.actualResult}</div>` : ''}
            ${r.failReason ? `<div style="grid-column:1/-1; color:#dc2626"><strong>Lý do lỗi:</strong> ${r.failReason}</div>` : ''}
            ${r.note ? `<div style="grid-column:1/-1"><strong>Ghi chú:</strong> ${r.note}</div>` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Actions Bar in Modal -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:16px; pt:8px; border-top:1px solid var(--border-light)">
        <button type="button" class="btn btn-primary" onclick="jumpToExecution('${tc.id}')">▶️ Chạy kịch bản này</button>
        <button type="button" class="btn btn-outline" onclick="copyTcId('${tc.id}')">📋 Sao chép mã kịch bản</button>
        <button type="button" class="btn btn-outline" onclick="closeModal('modal-tc-detail'); openCloneTcModal('${tc.id}')">📋 Nhân bản</button>
        <button type="button" class="btn btn-outline" onclick="closeModal('modal-tc-detail'); openEditTcModal('${tc.id}')">✏️ ${isCustom ? 'Sửa' : 'Hiệu đính'}</button>
        <button type="button" class="btn btn-outline" style="color:#dc2626; border-color:rgba(220,38,38,0.35); font-weight:700" onclick="closeModal('modal-tc-detail'); deleteTc('${tc.id}')">🗑️ Xóa kịch bản</button>
        ${isOverridden ? `<button type="button" class="btn btn-outline" onclick="closeModal('modal-tc-detail'); resetBuiltinTc('${tc.id}'); renderTestcasesTable();" style="color:#d97706">🔄 Khôi phục gốc</button>` : ''}
      </div>
    `;
  }

  openModal('modal-tc-detail');
}

// Support alias for tester page
function viewTcDetail(tcId) {
  viewTcDetailModal(tcId);
}

function runTcFromDetail() {
  if (currentDetailTcId) {
    jumpToExecution(currentDetailTcId);
  }
}

function copyTcId(tcId) {
  navigator.clipboard.writeText(tcId).then(() => {
    showToast(`📋 Đã copy mã [${tcId}] vào clipboard!`, 'info');
  }).catch(() => {
    showToast(`Mã kịch bản: ${tcId}`, 'info');
  });
}

// ================================================================
// CRUD: ADD, EDIT, CLONE, SAVE, DELETE (ISO 9001:2015 7.5)
// ================================================================
function openAddTcModal() {
  const p = getActiveProject();
  if (!p) return;

  const titleEl = document.getElementById('modal-tc-form-title');
  if (titleEl) titleEl.textContent = '➕ Thêm Test Case Mới (ISO 29119-3)';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  const selMod = document.getElementById('filter-module')?.value || 'M01';
  const nextId = generateNextTcId(selMod);

  setVal('tc-form-mode', 'add');
  setVal('tc-form-orig-id', '');
  setVal('tc-form-id', nextId);
  const idEl = document.getElementById('tc-form-id');
  if (idEl) idEl.disabled = false;

  setVal('tc-form-module', selMod);
  setVal('tc-form-priority', 'P2');
  setVal('tc-form-platform', 'Giao diện Web Trực ban');
  setVal('tc-form-type', 'Chức năng');
  setVal('tc-form-suite', 'REGRESSION');
  setVal('tc-form-req-id', '');
  setVal('tc-form-name', '');
  setVal('tc-form-testdata', '');
  setVal('tc-form-precondition', '');
  setVal('tc-form-steps', '');
  setVal('tc-form-expected', '');
  setVal('tc-form-notes', '');

  openModal('modal-tc-form');
}

function openEditTcModal(tcId) {
  const p = getActiveProject();
  if (!p) return;
  const tc = (p.testCases || []).find(t => t.id === tcId);
  if (!tc) return;

  const isCustom = isCustomTc(tcId);
  const titleEl = document.getElementById('modal-tc-form-title');
  if (titleEl) {
    titleEl.textContent = isCustom 
      ? `✏️ Chỉnh sửa kịch bản tự tạo: [${tc.id}]` 
      : `✏️ Hiệu đính kịch bản: [${tc.id}]`;
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('tc-form-mode', isCustom ? 'edit' : 'override');
  setVal('tc-form-orig-id', tc.id);
  setVal('tc-form-id', tc.id);
  const idEl = document.getElementById('tc-form-id');
  if (idEl) idEl.disabled = true;

  setVal('tc-form-module', tc.module || 'M01');
  setVal('tc-form-priority', tc.priority || 'P2');
  setVal('tc-form-platform', tc.platform || 'Giao diện Web Trực ban');
  setVal('tc-form-type', tc.type || 'Chức năng');
  setVal('tc-form-suite', tc.suite || 'REGRESSION');
  setVal('tc-form-req-id', tc.reqId || '');
  setVal('tc-form-name', tc.name || tc.title || '');
  setVal('tc-form-testdata', tc.testData || '');
  setVal('tc-form-precondition', tc.precondition || '');
  
  const stepsStr = Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || '');
  const expectedStr = Array.isArray(tc.expected) ? tc.expected.join('\n') : (tc.expected || '');
  setVal('tc-form-steps', stepsStr);
  setVal('tc-form-expected', expectedStr);
  setVal('tc-form-notes', tc.notes || '');

  openModal('modal-tc-form');
}

function openCloneTcModal(tcId) {
  const p = getActiveProject();
  if (!p) return;
  const tc = (p.testCases || []).find(t => t.id === tcId);
  if (!tc) return;

  const titleEl = document.getElementById('modal-tc-form-title');
  if (titleEl) titleEl.textContent = `📋 Nhân bản từ: [${tc.id}]`;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('tc-form-mode', 'add');
  setVal('tc-form-orig-id', '');
  setVal('tc-form-id', `${tc.id}-COPY`);
  const idEl = document.getElementById('tc-form-id');
  if (idEl) idEl.disabled = false;

  setVal('tc-form-module', tc.module || 'M01');
  setVal('tc-form-priority', tc.priority || 'P2');
  setVal('tc-form-platform', tc.platform || 'Giao diện Web Trực ban');
  setVal('tc-form-type', tc.type || 'Chức năng');
  setVal('tc-form-suite', tc.suite || 'REGRESSION');
  setVal('tc-form-req-id', tc.reqId || '');
  setVal('tc-form-name', `[Bản sao] ${tc.name || tc.title || ''}`);
  setVal('tc-form-testdata', tc.testData || '');
  setVal('tc-form-precondition', tc.precondition || '');

  const stepsStr = Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || '');
  const expectedStr = Array.isArray(tc.expected) ? tc.expected.join('\n') : (tc.expected || '');
  setVal('tc-form-steps', stepsStr);
  setVal('tc-form-expected', expectedStr);
  setVal('tc-form-notes', tc.notes ? `${tc.notes} (Nhân bản từ ${tc.id})` : `Nhân bản từ ${tc.id}`);

  openModal('modal-tc-form');
}

function saveTcForm() {
  const mode = document.getElementById('tc-form-mode')?.value || 'add';
  const origId = document.getElementById('tc-form-orig-id')?.value || '';
  const id = (document.getElementById('tc-form-id')?.value || '').trim().toUpperCase();
  const module = document.getElementById('tc-form-module')?.value || 'M01';
  const priority = document.getElementById('tc-form-priority')?.value || 'P2';
  const platform = document.getElementById('tc-form-platform')?.value || 'Giao diện Web Trực ban';
  const type = document.getElementById('tc-form-type')?.value || 'Chức năng';
  const suite = document.getElementById('tc-form-suite')?.value || 'REGRESSION';
  const reqId = (document.getElementById('tc-form-req-id')?.value || '').trim();
  const name = (document.getElementById('tc-form-name')?.value || '').trim();
  const testData = (document.getElementById('tc-form-testdata')?.value || '').trim();
  const precondition = (document.getElementById('tc-form-precondition')?.value || '').trim();
  const stepsRaw = (document.getElementById('tc-form-steps')?.value || '').trim();
  const expectedRaw = (document.getElementById('tc-form-expected')?.value || '').trim();
  const notes = (document.getElementById('tc-form-notes')?.value || '').trim();

  if (!id) {
    showToast('⚠️ Vui lòng nhập mã kịch bản!', 'error');
    document.getElementById('tc-form-id')?.focus();
    return;
  }

  if (!name) {
    showToast('⚠️ Vui lòng nhập tên kịch bản kiểm thử!', 'error');
    document.getElementById('tc-form-name')?.focus();
    return;
  }

  const steps = stepsRaw ? stepsRaw.split('\n').map(s => s.trim()).filter(Boolean) : ['Thực hiện kiểm thử theo quy trình.'];
  const expected = expectedRaw ? expectedRaw.split('\n').map(e => e.trim()).filter(Boolean) : ['Hệ thống phản hồi thành công theo thiết kế.'];

  const p = getActiveProject();
  if (!p) return;
  if (!p.testCases) p.testCases = [];

  const currentUser = getCurrentUser();

  if (mode === 'add') {
    // Check duplication
    if (p.testCases.some(t => t.id === id)) {
      showToast(`⚠️ Mã kịch bản [${id}] đã tồn tại trong dự án!`, 'error');
      return;
    }
    const newTc = {
      id,
      module,
      priority,
      name,
      title: name,
      platform,
      type,
      suite,
      reqId,
      testData,
      precondition,
      steps,
      expected,
      notes,
      isCustom: true,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString()
    };
    p.testCases.push(newTc);
    showToast(`✅ Đã thêm mới kịch bản [${id}] thành công!`, 'success');
  } else if (mode === 'edit') {
    const idx = p.testCases.findIndex(t => t.id === origId);
    if (idx !== -1) {
      p.testCases[idx] = {
        ...p.testCases[idx],
        module,
        priority,
        name,
        title: name,
        platform,
        type,
        suite,
        reqId,
        testData,
        precondition,
        steps,
        expected,
        notes,
        updatedBy: currentUser.name,
        updatedAt: new Date().toISOString()
      };
      showToast(`✅ Đã cập nhật kịch bản [${origId}] thành công!`, 'success');
    }
  } else if (mode === 'override') {
    const idx = p.testCases.findIndex(t => t.id === origId);
    if (idx !== -1) {
      p.testCases[idx] = {
        ...p.testCases[idx],
        priority,
        name,
        title: name,
        platform,
        type,
        suite,
        reqId,
        testData,
        precondition,
        steps,
        expected,
        notes,
        isOverridden: true,
        updatedBy: currentUser.name,
        updatedAt: new Date().toISOString()
      };
      showToast(`✏️ Đã hiệu đính kịch bản chuẩn [${origId}] theo ISO 9001 7.5.3!`, 'success');
    }
  }

  saveCoreState();
  closeModal('modal-tc-form');
  renderTestcasesTable();
}

function deleteTc(tcId) {
  if (!tcId) return;
  const p = getActiveProject();
  if (!p) return;
  const tc = (p.testCases || []).find(t => t.id === tcId);
  const tcTitle = tc ? (tc.title || tc.name || tc.id) : tcId;

  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn kịch bản [${tcId}] — "${tcTitle}" khỏi dự án?\n\nToàn bộ phân công và kết quả liên quan đến kịch bản này cũng sẽ được dọn dẹp sạch sẽ.`)) {
    return;
  }

  // 1. Xóa khỏi p.testCases
  p.testCases = (p.testCases || []).filter(t => t.id !== tcId);

  // 2. Dọn dẹp phân công
  if (Array.isArray(state.assignments)) {
    state.assignments = state.assignments.filter(a => a.tcId !== tcId);
  }

  // 3. Dọn dẹp kết quả
  if (state.results && state.results[tcId]) {
    delete state.results[tcId];
  }
  if (state.cycleResults) {
    Object.keys(state.cycleResults).forEach(key => {
      if (key.startsWith(`${tcId}_`) || key.includes(`_${tcId}_`)) {
        delete state.cycleResults[key];
      }
    });
  }

  // 4. Dọn dẹp phạm vi đợt test
  (p.testCycles || []).forEach(c => {
    if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => id !== tcId);
    if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => id !== tcId);
  });
  (state.testCycles || []).forEach(c => {
    if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => id !== tcId);
    if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => id !== tcId);
  });

  saveCoreState();
  if (typeof syncProjectsToLanServer === 'function') {
    syncProjectsToLanServer(state.projects);
  }
  if (typeof pushProjectsToCloud === 'function') {
    pushProjectsToCloud(state.projects);
  }

  showToast(`🗑️ Đã xóa thành công kịch bản [${tcId}]!`, 'success');
  renderTestcasesTable();
}

/**
 * Xóa hàng loạt kịch bản đang được tích chọn qua ô checkbox
 */
function batchDeleteTcs() {
  const checkedBoxes = Array.from(document.querySelectorAll('.tc-row-checkbox:checked'));
  const ids = checkedBoxes.map(cb => cb.value);
  if (ids.length === 0) {
    showToast('⚠️ Vui lòng tích chọn ít nhất một kịch bản kiểm thử để xóa!', 'warning');
    return;
  }
  const p = getActiveProject();
  if (!p) return;

  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn ${ids.length} kịch bản kiểm thử đã chọn?\n\nToàn bộ dữ liệu phân công và kết quả liên quan sẽ được dọn dẹp sạch sẽ.`)) {
    return;
  }

  const idSet = new Set(ids);

  // 1. Xóa khỏi p.testCases
  p.testCases = (p.testCases || []).filter(t => !idSet.has(t.id));

  // 2. Dọn dẹp phân công
  if (Array.isArray(state.assignments)) {
    state.assignments = state.assignments.filter(a => !idSet.has(a.tcId));
  }

  // 3. Dọn dẹp kết quả
  if (state.results) {
    ids.forEach(id => delete state.results[id]);
  }
  if (state.cycleResults) {
    Object.keys(state.cycleResults).forEach(key => {
      ids.forEach(id => {
        if (key.startsWith(`${id}_`) || key.includes(`_${id}_`)) {
          delete state.cycleResults[key];
        }
      });
    });
  }

  // 4. Dọn dẹp phạm vi đợt test
  (p.testCycles || []).forEach(c => {
    if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => !idSet.has(id));
    if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => !idSet.has(id));
  });
  (state.testCycles || []).forEach(c => {
    if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => !idSet.has(id));
    if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => !idSet.has(id));
  });

  const masterCb = document.querySelector('.tc-table thead input[type="checkbox"]');
  if (masterCb) masterCb.checked = false;

  saveCoreState();
  if (typeof syncProjectsToLanServer === 'function') {
    syncProjectsToLanServer(state.projects);
  }
  if (typeof pushProjectsToCloud === 'function') {
    pushProjectsToCloud(state.projects);
  }

  showToast(`🗑️ Đã xóa thành công ${ids.length} kịch bản kiểm thử!`, 'success');
  renderTestcasesTable();
}

function generateNextTcId(moduleCode) {
  const p = getActiveProject();
  if (!p) return `TC-${moduleCode}-001`;
  const mShort = (moduleCode || 'M01').replace('M', '');
  const prefix = `TC-M${mShort}`;
  const count = (p.testCases || []).filter(t => t.module === moduleCode || t.id.startsWith(prefix)).length;
  return `${prefix}-${(count + 1).toString().padStart(3, '0')}`;
}

// ================================================================
// EXPORT / IMPORT JSON (ISO 9001 7.5 DOCUMENTED INFORMATION)
// ================================================================
function exportCatalogJson() {
  const p = getActiveProject();
  if (!p) return;
  const exportPayload = {
    schema: "https://smartvms.local/schemas/test-catalog-v4.json",
    standardCompliance: ["ISO 9001:2015 Clause 7.5 & 8.5.2", "ISO/IEC/IEEE 29119-3:2021", "ISO/IEC 25010:2023"],
    projectId: p.id,
    projectName: p.name,
    exportedAt: new Date().toISOString(),
    exportedBy: getCurrentUser().name,
    totalTestCases: (p.testCases || []).length,
    testCases: p.testCases || []
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${p.id}_TestCatalog_ISO29119_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  showToast('📥 Đã xuất tệp JSON danh mục kịch bản chuẩn ISO!', 'success');
}

function importCatalogJson(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      const importedTcs = data.testCases || (Array.isArray(data) ? data : null);
      if (!importedTcs || !Array.isArray(importedTcs)) {
        showToast('⚠️ Định dạng tệp JSON không hợp lệ! Thiếu mảng testCases.', 'error');
        return;
      }
      const p = getActiveProject();
      if (!p) return;
      if (confirm(`Tìm thấy ${importedTcs.length} kịch bản kiểm thử. Bạn có muốn nạp vào dự án [${p.name}]?`)) {
        // Normalize names
        importedTcs.forEach(t => {
          if (!t.title) t.title = t.name;
          if (!t.name) t.name = t.title;
        });
        p.testCases = importedTcs;
        saveCoreState();
        showToast(`✅ Đã nạp thành công ${importedTcs.length} kịch bản kiểm thử!`, 'success');
        renderTestcasesTable();
      }
    } catch (err) {
      showToast('❌ Lỗi khi đọc tệp JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ================================================================
// ADMIN AD-HOC INCIDENTS REVIEW & 1-CLICK CONVERSION (ISO 29119-3)
// ================================================================
function renderAdminAdhocSection() {
  const container = document.getElementById('admin-adhoc-container');
  const content = document.getElementById('admin-adhoc-content');
  const badge = document.getElementById('admin-adhoc-badge');
  if (!container || !content) return;

  const incidents = getAdhocDefects(state.activeProjectId);
  if (incidents.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  const pendingCount = incidents.filter(i => i.status === 'PENDING_REVIEW').length;
  if (badge) {
    badge.textContent = `${pendingCount} sự cố chờ duyệt / ${incidents.length} tổng số`;
    badge.style.background = pendingCount > 0 ? '#ea580c' : '#16a34a';
  }

  content.innerHTML = `
    <table class="tc-table" style="font-size:12px; margin:0">
      <thead>
        <tr style="background:var(--bg-surface)">
          <th style="width:130px">Mã sự cố</th>
          <th style="width:100px; text-align:center">Phân hệ</th>
          <th>Tiêu đề & Nội dung sự cố ngoài kịch bản</th>
          <th style="width:170px">Phân loại lỗi (ISO 25010)</th>
          <th style="width:110px; text-align:center">Nghiêm trọng</th>
          <th style="width:140px">Người phát hiện</th>
          <th style="width:120px; text-align:center">Trạng thái</th>
          <th style="width:200px; text-align:center">Hành động QA Lead</th>
        </tr>
      </thead>
      <tbody>
        ${incidents.map(inc => {
          let statusBadge = '<span class="badge badge-fail" style="background:#fff7ed; color:#c2410c; border:1px solid #fdba74">⏳ Chờ duyệt</span>';
          if (inc.status === 'CONVERTED_TO_TC') {
            statusBadge = '<span class="badge badge-pass" style="background:#f0fdf4; color:#15803d; border:1px solid #86efac">✅ Đã tạo Test Case</span>';
          } else if (inc.status === 'ASSIGNED_DEV') {
            statusBadge = `<span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd">👨‍💻 Đã giao: ${escapeHtml(inc.assignedDev || 'Dev')}</span>`;
          }

          const sevColor = inc.severity?.includes('S1') ? '#dc2626' : (inc.severity?.includes('S2') ? '#ea580c' : '#ca8a04');

          return `
            <tr>
              <td style="font-family:monospace; font-weight:800; color:#c2410c">${inc.id}</td>
              <td style="text-align:center"><span class="badge badge-nr">${inc.module}</span></td>
              <td>
                <div style="font-weight:700; color:var(--text-primary); font-size:12.5px">${escapeHtml(inc.title)}</div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px; line-height:1.4">
                  <strong>Thực tế:</strong> ${escapeHtml(inc.actualResult?.slice(0, 85) || '')}${inc.actualResult?.length > 85 ? '...' : ''}
                </div>
              </td>
              <td><span style="font-size:11px; font-weight:600; color:#475569">${escapeHtml(getDefectTypeLabel(inc.defectType))}</span></td>
              <td style="text-align:center"><span style="font-weight:700; font-size:11.5px; color:${sevColor}">${inc.severity || 'S2'}</span></td>
              <td>
                <div style="font-size:11.5px; font-weight:600">${escapeHtml(inc.reporterName || inc.reporterUsername)}</div>
                <div style="font-size:10.5px; color:var(--text-muted)">${inc.reportedAt ? new Date(inc.reportedAt).toLocaleDateString('vi-VN') : ''}</div>
              </td>
              <td style="text-align:center">${statusBadge}</td>
              <td style="text-align:center">
                <div style="display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:center">
                  <button type="button" class="btn btn-primary btn-xs" onclick="convertAdhocToTcModal('${inc.id}')" title="Bốc toàn bộ thông tin tạo thành Test Case mới" style="background:#ea580c; border:none; font-weight:700">
                    ➕ Chuyển thành Test Case
                  </button>
                  <button type="button" class="btn btn-outline btn-xs" onclick="assignDevToIncident('${inc.id}')" title="Giao Developer sửa lỗi">👨‍💻 Giao Dev</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function assignDevToIncident(incidentId) {
  const defect = (state.adhocDefects || []).find(d => d.id === incidentId);
  if (!defect) return;
  const devName = prompt('Nhập tên Developer được phân công sửa lỗi này:', 'Trần Quốc Tuấn (Dev Backend)');
  if (devName && devName.trim()) {
    updateAdhocDefectStatus(incidentId, 'ASSIGNED_DEV', { assignedDev: devName.trim() });
    showToast(`✅ Đã giao sự cố ${incidentId} cho ${devName.trim()}!`, 'success');
    renderAdminAdhocSection();
  }
}
