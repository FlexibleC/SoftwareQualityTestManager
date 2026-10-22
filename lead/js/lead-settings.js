/**
 * LEAD MODULE: PROJECT INTERNAL SETTINGS (lead-settings.js)
 * Quản trị chuyên biệt cấu hình nội bộ dự án:
 * 1. Phiên bản phần mềm (Software Versions)
 * 2. Đợt kiểm thử (Test Cycles)
 * 3. Phân hệ nghiệp vụ (Modules)
 * 4. Đội ngũ nhân sự dự án (Staffing Roster)
 */

const LeadSettings = {
  currentTab: 'versions',
  selectedCycleVersionFilter: '',
  activeScopeCycleId: null,
  activeScopeModId: null,
  tempScopeSelectedIds: new Set(),

  init() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['versions', 'cycles', 'modules', 'roster'].includes(tabParam)) {
      this.switchTab(tabParam);
    } else {
      this.renderVersions();
      this.renderCycles();
      this.renderModules();
      this.renderTeamRoster();
    }
  },

  switchTab(tabKey) {
    this.currentTab = tabKey;
    document.querySelectorAll('.lead-settings-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });
    document.querySelectorAll('.lead-settings-tab-pane').forEach(pane => {
      const isTarget = pane.id === `lead-pane-${tabKey}`;
      pane.classList.toggle('active', isTarget);
      pane.style.display = isTarget ? 'block' : 'none';
    });

    if (tabKey === 'versions') this.renderVersions();
    if (tabKey === 'cycles') this.renderCycles();
    if (tabKey === 'modules') this.renderModules();
    if (tabKey === 'roster') this.renderTeamRoster();
  },

  // ==================== 1. SOFTWARE VERSIONS ====================
  renderVersions() {
    const p = getActiveProject();
    if (!p) return;

    const tbody = document.getElementById('lead-versions-tbody');
    if (!tbody) return;

    const versions = p.versions || [{ version: p.activeVersion || 'v1.0', label: 'Bản phát hành chuẩn', status: 'ACTIVE' }];
    const cycles = typeof getTestCyclesForProject === 'function' 
      ? getTestCyclesForProject(p.id) 
      : (p.testCycles || (state.testCycles || []).filter(c => c.projectId === p.id));

    tbody.innerHTML = versions.map(v => {
      const isActive = v.version === p.activeVersion;
      const statusBadge = v.status === 'ACTIVE' 
        ? '<span class="badge badge-pass">Đang phát hành</span>' 
        : '<span class="badge badge-draft">Kế hoạch</span>';

      const verTcsCount = getTestCasesForVersion(p.id, v.version).length;
      const verCyclesCount = cycles.filter(c => c.version === v.version).length;

      return `
        <tr style="${isActive ? 'background:rgba(217,119,6,0.06); font-weight:600' : ''}">
          <td style="font-family:monospace; font-weight:800; color:var(--text-primary)">
            ${v.version} ${isActive ? '<span class="badge badge-info" style="font-size:10px; margin-left:4px">● Hiện hành</span>' : ''}
          </td>
          <td><strong>${v.label || v.version}</strong></td>
          <td style="text-align:center">
            <span class="badge badge-info">📋 ${verTcsCount} bài</span>
          </td>
          <td style="text-align:center">
            <span class="badge badge-outline">🎯 ${verCyclesCount} đợt</span>
          </td>
          <td style="text-align:center">${statusBadge}</td>
          <td style="text-align:center; font-size:12px; color:var(--text-muted)">${v.targetDate || 'Chưa đặt'}</td>
          <td style="font-size:12px; color:var(--text-secondary)">${v.changelog || 'Chưa có ghi chú'}</td>
          <td style="text-align:center">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px">
              ${!isActive ? `
                <button type="button" class="btn btn-outline btn-xs" onclick="LeadSettings.activateVersion('${v.version}')" title="Kích hoạt phiên bản này cho dự án">
                  ⚡ Kích hoạt
                </button>
              ` : '<span style="font-size:11px; color:#16a34a; font-weight:700">✓ Đang dùng</span>'}
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadSettings.deleteVersion('${v.version}')" style="color:#dc2626; border-color:rgba(220,38,38,0.3)" title="Xóa phiên bản này">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  deleteVersion(ver) {
    const p = getActiveProject();
    if (!p) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa phiên bản [${ver}] khỏi dự án? Thao tác này không thể hoàn tác!`)) return;

    if (typeof deleteProjectVersion === 'function') {
      deleteProjectVersion(p.id, ver);
    } else {
      p.versions = (p.versions || []).filter(v => (v.version || v) !== ver);
      p.testCases = (p.testCases || []).filter(tc => tc.version !== ver);
      p.testCycles = (p.testCycles || []).filter(c => c.version !== ver);
      if (p.activeVersion === ver) {
        p.activeVersion = p.versions.length > 0 ? (p.versions[0].version || p.versions[0]) : '';
      }
      saveCoreState();
      if (window.pushProjectsToCloud) window.pushProjectsToCloud(state.projects);
      if (window.pushCyclesToCloud) window.pushCyclesToCloud(state.testCycles);
    }

    showToast(`🗑️ Đã xóa phiên bản [${ver}]!`, 'success');
    this.renderVersions();
    this.renderCycles();
    if (window.LeadContext) LeadContext.renderCompactProjectBar();
  },

  openAddVersionModal() {
    document.getElementById('vf-tag').value = '';
    document.getElementById('vf-label').value = '';
    document.getElementById('vf-date').value = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
    document.getElementById('vf-changelog').value = '';
    openModal('modal-version-form');
  },

  confirmAddVersion() {
    const p = getActiveProject();
    if (!p) return;

    const version = (document.getElementById('vf-tag').value || '').trim();
    const label = (document.getElementById('vf-label').value || '').trim() || version;
    const status = document.getElementById('vf-status').value;
    const targetDate = document.getElementById('vf-date').value;
    const changelog = (document.getElementById('vf-changelog').value || '').trim();

    if (!version) {
      showToast('⚠️ Vui lòng nhập mã phiên bản (VD: v2.1)!', 'error');
      return;
    }

    if (!p.versions) p.versions = [];
    if (p.versions.some(v => v.version === version)) {
      showToast(`⚠️ Phiên bản ${version} đã tồn tại trong dự án!`, 'error');
      return;
    }

    p.versions.push({ version, label, status, targetDate, changelog });
    saveCoreState();
    closeModal('modal-version-form');
    showToast(`✅ Đã thêm phiên bản [${version}] cho dự án!`, 'success');
    this.renderVersions();
    LeadContext.renderCompactProjectBar();
  },

  activateVersion(ver) {
    const p = getActiveProject();
    if (!p) return;
    p.activeVersion = ver;
    saveCoreState();
    showToast(`⚡ Đã kích hoạt phiên bản [${ver}] cho dự án ${p.name}!`, 'success');
    this.renderVersions();
    this.renderCycles();
    LeadContext.renderCompactProjectBar();
  },

  // ==================== 2. TEST CYCLES ====================
  renderCycles() {
    const p = getActiveProject();
    if (!p) return;

    const tbody = document.getElementById('lead-cycles-tbody');
    if (!tbody) return;

    let cycles = typeof getTestCyclesForProject === 'function'
      ? getTestCyclesForProject(p.id)
      : (p.testCycles || (state.testCycles || []).filter(c => c.projectId === p.id));

    if (!cycles || cycles.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted)">
            Chưa có đợt kiểm thử nào được cấu hình cho dự án này.
            <div style="margin-top:8px">
              <button type="button" class="btn btn-primary btn-xs" onclick="LeadSettings.openAddCycleModal()">➕ Thêm Đợt Kiểm Thử Đầu Tiên</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = cycles.map(c => {
      const isRunning = c.status === 'ACTIVE' || c.status === 'IN_PROGRESS' || !c.status;
      const statusBadge = isRunning 
        ? '<span class="badge badge-pass">🟢 Đang chạy</span>' 
        : '<span class="badge badge-draft">⚪ Đã kết thúc</span>';

      const cycleVer = c.version || p.activeVersion || 'v1.0';
      const verTcs = getTestCasesForVersion(p.id, cycleVer);
      const totalVerTcs = verTcs.length;
      const hasCustomScope = Array.isArray(c.scopeTcIds) && c.scopeTcIds.length > 0;
      const scopeCount = hasCustomScope 
        ? c.scopeTcIds.length 
        : (Array.isArray(c.testCaseIds) && c.testCaseIds.length > 0 ? c.testCaseIds.length : totalVerTcs);
      const percent = totalVerTcs > 0 ? Math.round((scopeCount / totalVerTcs) * 100) : 100;

      return `
        <tr>
          <td style="font-family:monospace; font-weight:800; text-align:center; color:var(--primary)">
            ${c.code || c.id}
          </td>
          <td>
            <strong>${c.name}</strong>
            <div style="font-size:11.5px; color:var(--text-muted)">${c.description || 'Chưa có mô tả'}</div>
          </td>
          <td style="text-align:center"><span class="badge badge-outline">${cycleVer}</span></td>
          <td style="text-align:center"><span class="badge badge-info">${c.suite || c.type || 'FUNCTIONAL'}</span></td>
          <td style="text-align:center">
            <span class="badge" style="background:rgba(37,99,235,0.08); color:#2563eb; font-weight:700" title="${hasCustomScope ? 'Phạm vi đã tuyển chọn riêng cho đợt này' : 'Mặc định toàn bộ phiên bản'}">
              🎯 ${scopeCount} / ${totalVerTcs} (${percent}%)
            </span>
          </td>
          <td style="text-align:center; font-size:12px; color:var(--text-muted)">
            ${c.startDate || 'Bắt đầu'} ➔ ${c.endDate || 'Hạn chót'}
          </td>
          <td style="text-align:center">${statusBadge}</td>
          <td style="text-align:center">
            <div style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap">
              <button type="button" class="btn btn-outline btn-xs" style="color:var(--primary); font-weight:700" onclick="LeadSettings.openCycleScopeModal('${c.id}')" title="Cấu hình danh mục kịch bản (Scope) cho đợt test">
                🎯 Phạm vi
              </button>
              <a href="assignments.html?projectId=${encodeURIComponent(p.id)}&cycleId=${encodeURIComponent(c.id)}" class="btn btn-primary btn-xs" style="padding:2px 8px; font-weight:700" title="Giao việc cho kiểm thử viên trong đợt này">
                🚀 Giao việc
              </a>
              <a href="testcases.html?projectId=${encodeURIComponent(p.id)}&cycleId=${encodeURIComponent(c.id)}" class="btn btn-outline btn-xs" style="padding:2px 8px" title="Xem danh mục kịch bản thuộc đợt này">
                📋 Kịch bản
              </a>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadSettings.openEditCycleModal('${c.id}')" title="Sửa thông tin đợt test">
                ✏️
              </button>
              <button type="button" class="btn btn-outline btn-xs" style="color:#dc2626; border-color:rgba(220,38,38,0.3)" onclick="LeadSettings.deleteCycle('${c.id}')" title="Xóa đợt test">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddCycleModal() {
    const p = getActiveProject();
    if (!p) return;

    document.getElementById('cf-id').value = '';
    document.getElementById('cf-code').value = `ROUND-${(p.testCycles || []).length + 1}`;
    document.getElementById('cf-name').value = '';
    document.getElementById('cf-description').value = '';
    document.getElementById('cf-start-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('cf-end-date').value = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

    const verSel = document.getElementById('cf-version');
    if (verSel) {
      const versions = p.versions || [{ version: p.activeVersion || 'v1.0' }];
      verSel.innerHTML = versions.map(v => `
        <option value="${v.version}" ${v.version === p.activeVersion ? 'selected' : ''}>
          ${v.version} (${v.label || 'Phiên bản'})
        </option>
      `).join('');
    }

    document.getElementById('modal-cycle-title').textContent = '➕ Thêm Đợt Kiểm Thử Mới';
    openModal('modal-cycle-form');
  },

  openEditCycleModal(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const c = (p.testCycles || []).find(x => x.id === cycleId) || (typeof getCycleById === 'function' ? getCycleById(cycleId) : null);
    if (!c) return;

    document.getElementById('cf-id').value = c.id;
    document.getElementById('cf-code').value = c.code || c.id;
    document.getElementById('cf-name').value = c.name;
    document.getElementById('cf-description').value = c.description || '';
    document.getElementById('cf-start-date').value = c.startDate || '';
    document.getElementById('cf-end-date').value = c.endDate || '';
    if (document.getElementById('cf-suite')) document.getElementById('cf-suite').value = c.suite || 'REGRESSION';
    if (document.getElementById('cf-status')) document.getElementById('cf-status').value = c.status || 'ACTIVE';

    const verSel = document.getElementById('cf-version');
    if (verSel) {
      const versions = p.versions || [{ version: p.activeVersion || 'v1.0' }];
      verSel.innerHTML = versions.map(v => `
        <option value="${v.version}" ${v.version === (c.version || p.activeVersion) ? 'selected' : ''}>
          ${v.version} (${v.label || 'Phiên bản'})
        </option>
      `).join('');
    }

    document.getElementById('modal-cycle-title').textContent = '✏️ Chỉnh Sửa Đợt Kiểm Thử';
    openModal('modal-cycle-form');
  },

  confirmSaveCycle() {
    const p = getActiveProject();
    if (!p) return;

    const id = document.getElementById('cf-id').value;
    const code = (document.getElementById('cf-code').value || '').trim();
    const name = (document.getElementById('cf-name').value || '').trim();
    const version = document.getElementById('cf-version').value;
    const suite = document.getElementById('cf-suite').value;
    const status = document.getElementById('cf-status').value;
    const startDate = document.getElementById('cf-start-date').value;
    const endDate = document.getElementById('cf-end-date').value;
    const description = (document.getElementById('cf-description').value || '').trim();

    if (!code || !name) {
      showToast('⚠️ Vui lòng nhập Mã và Tên đợt kiểm thử!', 'error');
      return;
    }

    if (!p.testCycles) p.testCycles = [];
    if (!state.testCycles) state.testCycles = [];

    if (id) {
      // Edit: Cập nhật đồng thời cả p.testCycles và state.testCycles
      const c = p.testCycles.find(x => x.id === id);
      if (c) {
        c.code = code;
        c.name = name;
        c.version = version;
        c.suite = suite;
        c.status = status;
        c.startDate = startDate;
        c.endDate = endDate;
        c.description = description;
      }
      const cs = state.testCycles.find(x => x.id === id);
      if (cs) {
        cs.code = code;
        cs.name = name;
        cs.version = version;
        cs.suite = suite;
        cs.status = status;
        cs.startDate = startDate;
        cs.endDate = endDate;
        cs.description = description;
      } else if (c) {
        state.testCycles.push({ ...c, projectId: p.id });
      }
      showToast(`✅ Đã cập nhật đợt kiểm thử [${code}]!`, 'success');
    } else {
      // Add: Thêm đồng thời cả p.testCycles và state.testCycles
      const newId = `CYC-${(p.id || 'PRJ').replace('PRJ-', '')}-${Date.now().toString().slice(-4)}`;
      const newCycleObj = {
        id: newId,
        projectId: p.id,
        code,
        name,
        version,
        suite,
        status,
        startDate,
        endDate,
        description,
        scopeTcIds: [],
        testCaseIds: []
      };
      p.testCycles.push(newCycleObj);
      state.testCycles.push(newCycleObj);
      showToast(`✅ Đã khởi tạo đợt kiểm thử [${code}]!`, 'success');
    }

    saveCoreState();
    closeModal('modal-cycle-form');
    this.renderCycles();
    LeadContext.renderCompactProjectBar();
  },

  deleteCycle(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    if (!confirm('Bạn có chắc chắn muốn xóa đợt kiểm thử này khỏi dự án?')) return;

    p.testCycles = (p.testCycles || []).filter(c => c.id !== cycleId);
    if (state.testCycles) {
      state.testCycles = state.testCycles.filter(c => c.id !== cycleId);
    }
    saveCoreState();
    showToast('🗑️ Đã xóa đợt kiểm thử!', 'info');
    this.renderCycles();
    LeadContext.renderCompactProjectBar();
  },

  // ==================== 3. MODULES ====================
  renderModules() {
    const p = getActiveProject();
    if (!p) return;

    const tbody = document.getElementById('lead-modules-tbody');
    if (!tbody) return;

    const mods = p.modules || [];
    const tcs = p.testCases || [];

    if (mods.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:32px; color:var(--text-muted)">
            Chưa có phân hệ nghiệp vụ nào được định nghĩa cho dự án này.
            <div style="margin-top:8px">
              <button type="button" class="btn btn-primary btn-xs" onclick="LeadSettings.openAddModuleModal()">➕ Thêm Phân Hệ Đầu Tiên</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = mods.map(m => {
      const modTcsCount = tcs.filter(t => t.module === m.id).length;

      return `
        <tr>
          <td style="font-family:monospace; font-weight:800; color:var(--primary)">[${m.id}]</td>
          <td><strong>${m.name}</strong></td>
          <td style="font-size:12px; color:var(--text-secondary)">${m.desc || m.description || 'Chưa có mô tả'}</td>
          <td style="text-align:center">
            <span class="badge badge-info">📋 ${modTcsCount} kịch bản</span>
          </td>
          <td style="text-align:center">
            <button type="button" class="btn btn-outline btn-xs" style="color:#dc2626; border-color:rgba(220,38,38,0.3)" onclick="LeadSettings.deleteModule('${m.id}')" title="Xóa phân hệ">
              🗑️ Xóa
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddModuleModal() {
    document.getElementById('new-mod-id').value = '';
    document.getElementById('new-mod-name').value = '';
    document.getElementById('new-mod-desc').value = '';
    openModal('modal-add-module');
  },

  confirmAddModule() {
    const p = getActiveProject();
    if (!p) return;

    const id = (document.getElementById('new-mod-id').value || '').trim();
    const name = (document.getElementById('new-mod-name').value || '').trim();
    const desc = (document.getElementById('new-mod-desc').value || '').trim();

    if (!id || !name) {
      showToast('⚠️ Vui lòng nhập Mã và Tên phân hệ!', 'error');
      return;
    }

    if (!p.modules) p.modules = [];
    if (p.modules.some(m => m.id === id)) {
      showToast(`⚠️ Mã phân hệ [${id}] đã tồn tại trong dự án!`, 'error');
      return;
    }

    p.modules.push({ id, name, desc });
    saveCoreState();
    closeModal('modal-add-module');
    showToast(`✅ Đã thêm phân hệ [${id}] ${name}!`, 'success');
    this.renderModules();
  },

  deleteModule(modId) {
    const p = getActiveProject();
    if (!p) return;

    if (!confirm(`Xác nhận xóa phân hệ [${modId}]? Các kịch bản trực thuộc sẽ cần được cập nhật phân hệ.`)) return;

    p.modules = (p.modules || []).filter(m => m.id !== modId);
    saveCoreState();
    showToast(`🗑️ Đã xóa phân hệ [${modId}]!`, 'info');
    this.renderModules();
  },

  // ==================== 4. TEAM ROSTER ====================
  renderTeamRoster() {
    const p = getActiveProject();
    if (!p) return;

    const tbody = document.getElementById('lead-roster-tbody');
    if (!tbody) return;

    const members = getProjectMembers(p.id);

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted)">
            Dự án này chưa được Super Admin phân bổ nhân sự chính thức.
            <div style="font-size:12px; margin-top:4px">
              Liên hệ Quản trị viên cấp cao (Super Admin) qua cổng Enterprise Console để được cấp thêm nhân lực.
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = members.map((m, idx) => {
      let roleBadge = '<span class="badge badge-info">Kiểm thử viên (Tester)</span>';
      if (m.role === 'developer') roleBadge = '<span class="badge badge-draft">Kỹ sư Dev</span>';
      if (m.role === 'project_lead' || m.role === 'admin') roleBadge = '<span class="badge badge-pass" style="background:#d97706">Quản trị Dự án</span>';

      return `
        <tr>
          <td style="text-align:center; color:var(--text-muted)">${idx + 1}</td>
          <td>
            <strong>${m.name || m.username}</strong>
            <div style="font-size:11px; color:var(--text-muted)">User: ${m.username}</div>
          </td>
          <td style="font-size:12px; color:var(--text-secondary)">${m.email || 'Chưa đăng ký'}</td>
          <td style="text-align:center">${roleBadge}</td>
          <td style="font-size:12px; color:var(--text-muted)">${m.specialty || 'Phụ trách chung'}</td>
          <td style="text-align:center"><span class="badge badge-pass">Đang tham gia</span></td>
        </tr>
      `;
    }).join('');
  },

  // ==================== 5. CYCLE SCOPE SELECTION (MASTER-DETAIL WORKSTATION) ====================
  openCycleScopeModal(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' 
      ? getTestCyclesForProject(p.id) 
      : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId) || (typeof getCycleById === 'function' ? getCycleById(cycleId) : null);
    if (!c) {
      showToast('⚠️ Không tìm thấy đợt kiểm thử!', 'error');
      return;
    }

    this.activeScopeCycleId = cycleId;
    this.selectedScopeModuleId = ''; // default all modules
    const cycleVer = c.version || p.activeVersion || 'v1.0';
    this.currentCycleVersionTcs = getTestCasesForVersion(p.id, cycleVer);

    // Khởi tạo tập hợp ID được chọn
    if (Array.isArray(c.scopeTcIds) && c.scopeTcIds.length > 0) {
      this.tempScopeSelectedIds = new Set(c.scopeTcIds);
    } else if (Array.isArray(c.testCaseIds) && c.testCaseIds.length > 0) {
      this.tempScopeSelectedIds = new Set(c.testCaseIds);
    } else {
      // Mặc định chọn tất cả
      this.tempScopeSelectedIds = new Set(this.currentCycleVersionTcs.map(t => t.id));
    }

    // Modal Header tags
    const titleEl = document.getElementById('mcs-title');
    if (titleEl) titleEl.textContent = `🎯 Cấu Hình Danh Mục Kịch Bản: ${c.name} (${c.code || c.id})`;
    const subEl = document.getElementById('mcs-subtitle');
    if (subEl) subEl.textContent = `Đợt test thuộc phiên bản [${cycleVer}] — Tổng kho phiên bản: ${this.currentCycleVersionTcs.length} kịch bản — Phân loại ISO/IEC/IEEE 29119`;
    const verBadge = document.getElementById('mcs-version-badge');
    if (verBadge) verBadge.textContent = cycleVer;
    const typeBadge = document.getElementById('mcs-cycle-type-badge');
    if (typeBadge) typeBadge.textContent = c.suite || c.type || 'REGRESSION';

    // Reset filters
    const searchInput = document.getElementById('mcs-search');
    if (searchInput) searchInput.value = '';
    const prioFilter = document.getElementById('mcs-filter-prio');
    if (prioFilter) prioFilter.value = '';
    const histFilter = document.getElementById('mcs-filter-history');
    if (histFilter) histFilter.value = '';
    const suiteFilter = document.getElementById('mcs-filter-suite');
    if (suiteFilter) suiteFilter.value = '';

    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
    openModal('modal-cycle-scope');
  },

  updateScopeKpiAndCounters() {
    const p = getActiveProject();
    if (!p) return;
    const all = this.currentCycleVersionTcs || [];
    const totalTcs = all.length;
    const selectedTcs = this.tempScopeSelectedIds.size;
    const percent = totalTcs > 0 ? Math.round((selectedTcs / totalTcs) * 100) : 0;

    let failedCount = 0;
    let highPrioCount = 0;
    let smokeCount = 0;
    let notRunCount = 0;

    all.forEach(t => {
      const summary = typeof getTcPriorExecutionSummary === 'function' 
        ? getTcPriorExecutionSummary(t.id, this.activeScopeCycleId, p.id)
        : {};
      const isFail = summary.lastStatus === 'FAIL' || summary.hadFailure || ((state.results || {})[t.id]?.status || '').toLowerCase().includes('fail');
      if (isFail) failedCount++;
      if (t.priority === 'P1' || t.priority === 'P2' || t.priority === 'Critical' || t.priority === 'High') highPrioCount++;
      if ((t.suite || '').toUpperCase() === 'SMOKE' || (t.type || '').toLowerCase().includes('smoke')) smokeCount++;
      const isUntested = summary.lastStatus === 'UNTESTED' && (!state.results || !state.results[t.id] || state.results[t.id].status === 'Not Run');
      if (isUntested) notRunCount++;
    });

    const usedModIds = Array.from(new Set(all.map(t => t.module).filter(Boolean)));
    const activeModIds = new Set(
      all.filter(t => this.tempScopeSelectedIds.has(t.id)).map(t => t.module).filter(Boolean)
    );

    // Effort estimate: ~20 mins per test case => ~0.35 hours
    const effortHours = Math.round(selectedTcs * 0.35);

    // Update KPI elements
    const kpiSel = document.getElementById('mcs-kpi-selected');
    if (kpiSel) kpiSel.textContent = `${selectedTcs} / ${totalTcs}`;
    const kpiPct = document.getElementById('mcs-kpi-percent');
    if (kpiPct) kpiPct.textContent = `${percent}%`;
    const kpiFail = document.getElementById('mcs-kpi-failed');
    if (kpiFail) kpiFail.textContent = failedCount;
    const kpiHigh = document.getElementById('mcs-kpi-high-prio');
    if (kpiHigh) kpiHigh.textContent = highPrioCount;
    const kpiMods = document.getElementById('mcs-kpi-modules');
    if (kpiMods) kpiMods.textContent = `${activeModIds.size} / ${usedModIds.length}`;
    const kpiEffort = document.getElementById('mcs-kpi-effort');
    if (kpiEffort) kpiEffort.textContent = `~${effortHours}h`;

    // Progress Bar
    const progBar = document.getElementById('mcs-progress-bar');
    if (progBar) {
      progBar.style.width = `${percent}%`;
      progBar.style.background = percent === 100 ? '#16a34a' : (percent > 0 ? '#2563eb' : '#94a3b8');
    }
    const progText = document.getElementById('mcs-progress-text');
    if (progText) progText.textContent = `${percent}%`;

    // Preset count indicators
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('mcs-preset-all-cnt', totalTcs);
    setEl('mcs-preset-fail-cnt', failedCount);
    setEl('mcs-preset-high-cnt', highPrioCount);
    setEl('mcs-preset-smoke-cnt', smokeCount > 0 ? smokeCount : Math.min(25, Math.round(totalTcs * 0.15)));
    setEl('mcs-preset-notrun-cnt', notRunCount);

    // Footer summary
    const footerCount = document.getElementById('mcs-footer-count');
    if (footerCount) footerCount.textContent = `${selectedTcs} / ${totalTcs} (${percent}%)`;
    const footerEffort = document.getElementById('mcs-footer-effort');
    if (footerEffort) footerEffort.textContent = `~${effortHours}h`;
  },

  renderScopeSidebar() {
    const p = getActiveProject();
    if (!p) return;
    const ul = document.getElementById('mcs-modules-list');
    if (!ul) return;

    const all = this.currentCycleVersionTcs || [];
    const pMods = p.modules || [];
    const usedModIds = Array.from(new Set(all.map(t => t.module).filter(Boolean))).sort();

    const isAllActive = !this.selectedScopeModuleId;
    const totalSelected = this.tempScopeSelectedIds.size;
    const totalCount = all.length;
    const allChecked = totalCount > 0 && totalSelected === totalCount;

    let itemsHtml = `
      <li class="asg-mod-item ${isAllActive ? 'active' : ''}" onclick="LeadSettings.selectScopeModule('')">
        <div style="display:flex; align-items:center; gap:8px; overflow:hidden">
          <input type="checkbox" ${allChecked ? 'checked' : ''} onclick="event.stopPropagation(); LeadSettings.toggleModuleScope('', this.checked)" title="Chọn/Bỏ chọn tất cả phân hệ" style="cursor:pointer" />
          <div style="overflow:hidden">
            <div style="font-size:12px; font-weight:700; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap">
              🌐 Tất Cả Phân Hệ
            </div>
            <div style="font-size:10.5px; color:var(--text-muted)">
              Đã chọn: <strong style="color:var(--primary)">${totalSelected}</strong> / ${totalCount} bài
            </div>
          </div>
        </div>
        <span class="badge ${totalSelected === totalCount && totalCount > 0 ? 'badge-pass' : 'badge-outline'}" style="font-size:10.5px">
          ${Math.round(totalCount > 0 ? (totalSelected / totalCount * 100) : 0)}%
        </span>
      </li>
    `;

    usedModIds.forEach(mId => {
      const modObj = pMods.find(m => m.id === mId);
      const modName = modObj ? modObj.name : `Phân hệ ${mId}`;
      const modTcs = all.filter(t => t.module === mId);
      const modTotal = modTcs.length;
      const modSelected = modTcs.filter(t => this.tempScopeSelectedIds.has(t.id)).length;
      const isChecked = modTotal > 0 && modSelected === modTotal;
      const isActive = this.selectedScopeModuleId === mId;
      const pct = modTotal > 0 ? Math.round((modSelected / modTotal) * 100) : 0;

      let badgeColor = 'badge-draft';
      if (pct === 100) badgeColor = 'badge-pass';
      else if (pct > 0) badgeColor = 'badge-info';

      itemsHtml += `
        <li class="asg-mod-item ${isActive ? 'active' : ''}" onclick="LeadSettings.selectScopeModule('${mId}')">
          <div style="display:flex; align-items:center; gap:8px; overflow:hidden">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); LeadSettings.toggleModuleScope('${mId}', this.checked)" title="Chọn/Bỏ chọn toàn bộ phân hệ [${mId}]" style="cursor:pointer" />
            <div style="overflow:hidden">
              <div style="font-size:12px; font-weight:700; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap">
                [${mId}] ${escapeHtml(modName)}
              </div>
              <div style="font-size:10.5px; color:var(--text-muted)">
                Đã chọn: <strong style="color:var(--primary)">${modSelected}</strong> / ${modTotal} bài
              </div>
            </div>
          </div>
          <span class="badge ${badgeColor}" style="font-size:10.5px">
            ${pct}%
          </span>
        </li>
      `;
    });

    ul.innerHTML = itemsHtml;
  },

  selectScopeModule(moduleId) {
    this.selectedScopeModuleId = moduleId;
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  toggleModuleScope(moduleId, isChecked) {
    const all = this.currentCycleVersionTcs || [];
    const targetTcs = moduleId ? all.filter(t => t.module === moduleId) : all;
    targetTcs.forEach(t => {
      if (isChecked) this.tempScopeSelectedIds.add(t.id);
      else this.tempScopeSelectedIds.delete(t.id);
    });
    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  renderScopeTcTable() {
    const p = getActiveProject();
    if (!p) return;
    const tbody = document.getElementById('mcs-tbody');
    if (!tbody) return;

    const q = (document.getElementById('mcs-search')?.value || '').toLowerCase().trim();
    const prioFilter = document.getElementById('mcs-filter-prio')?.value || '';
    const histFilter = document.getElementById('mcs-filter-history')?.value || '';
    const suiteFilter = document.getElementById('mcs-filter-suite')?.value || '';
    const modId = this.selectedScopeModuleId;

    // Filter test cases
    const all = this.currentCycleVersionTcs || [];
    const filtered = all.filter(tc => {
      if (modId && tc.module !== modId) return false;
      if (prioFilter && tc.priority !== prioFilter) return false;
      if (suiteFilter) {
        const s = (tc.suite || '').toUpperCase();
        if (s !== suiteFilter) return false;
      }
      if (histFilter) {
        const summary = typeof getTcPriorExecutionSummary === 'function' 
          ? getTcPriorExecutionSummary(tc.id, this.activeScopeCycleId, p.id)
          : {};
        if (histFilter === 'FAIL' && !(summary.lastStatus === 'FAIL' || summary.hadFailure)) return false;
        if (histFilter === 'PASS' && summary.lastStatus !== 'PASS') return false;
        if (histFilter === 'UNTESTED' && summary.lastStatus !== 'UNTESTED') return false;
      }
      if (q) {
        const idMatch = (tc.id || '').toLowerCase().includes(q);
        const titleMatch = (tc.title || '').toLowerCase().includes(q);
        const modMatch = (tc.module || '').toLowerCase().includes(q);
        const stepsMatch = (tc.steps || '').toLowerCase().includes(q);
        if (!idMatch && !titleMatch && !modMatch && !stepsMatch) return false;
      }
      return true;
    });

    // Update table header context
    const modTitleEl = document.getElementById('mcs-current-mod-title');
    if (modTitleEl) {
      if (!modId) {
        modTitleEl.textContent = '🌐 Toàn bộ kịch bản dự án';
      } else {
        const modObj = (p.modules || []).find(m => m.id === modId);
        modTitleEl.textContent = `📦 [${modId}] ${modObj ? modObj.name : 'Phân hệ ' + modId}`;
      }
    }
    const modBadgeEl = document.getElementById('mcs-current-mod-badge');
    if (modBadgeEl) {
      const selectedInFiltered = filtered.filter(t => this.tempScopeSelectedIds.has(t.id)).length;
      modBadgeEl.textContent = `${selectedInFiltered} / ${filtered.length} kịch bản đã chọn`;
    }

    const countBadge = document.getElementById('mcs-filter-count-badge');
    if (countBadge) countBadge.textContent = `${filtered.length} kịch bản`;

    // Check all state for visible rows
    const checkAll = document.getElementById('mcs-check-all');
    if (checkAll) {
      checkAll.checked = filtered.length > 0 && filtered.every(t => this.tempScopeSelectedIds.has(t.id));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted)">
            <div style="font-size:24px; margin-bottom:6px">🔍</div>
            Không tìm thấy kịch bản nào phù hợp với bộ lọc hiện tại.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(tc => {
      const isChecked = this.tempScopeSelectedIds.has(tc.id);
      const summary = typeof getTcPriorExecutionSummary === 'function' 
        ? getTcPriorExecutionSummary(tc.id, this.activeScopeCycleId, p.id)
        : {};

      let histBadge = '<span class="badge badge-draft" style="font-size:10.5px">⚪ Chưa chạy</span>';
      if (summary.lastStatus === 'FAIL' || summary.hadFailure) {
        histBadge = `<span class="badge badge-fail" style="font-size:10.5px" title="Lỗi ghi nhận ở ${summary.lastCycleName || 'đợt trước'}">❌ Từng Lỗi (${summary.lastCycleCode || 'Prior'})</span>`;
      } else if (summary.lastStatus === 'PASS') {
        histBadge = `<span class="badge badge-pass" style="font-size:10.5px">✅ Đã PASS (${summary.lastCycleCode || 'Prior'})</span>`;
      }

      let prioBadge = `<span class="badge badge-outline">${tc.priority || 'P2'}</span>`;
      if (tc.priority === 'P1') prioBadge = `<span class="badge badge-fail" style="background:rgba(220,38,38,0.1); color:#dc2626; border-color:rgba(220,38,38,0.3); font-weight:800">P1 Critical</span>`;
      else if (tc.priority === 'P2') prioBadge = `<span class="badge badge-draft" style="color:#d97706; border-color:rgba(217,119,6,0.3); font-weight:800">P2 High</span>`;
      else if (tc.priority === 'P3') prioBadge = `<span class="badge badge-info" style="font-weight:700">P3 Medium</span>`;

      const statusInCycle = isChecked
        ? '<span class="badge badge-pass" style="font-size:10.5px; background:rgba(22,163,74,0.1); color:#16a34a; border-color:rgba(22,163,74,0.3); font-weight:700">🎯 Trong đợt</span>'
        : '<span class="badge badge-draft" style="font-size:10.5px; color:var(--text-muted)">⚪ Bỏ qua</span>';

      return `
        <tr style="${isChecked ? 'background:rgba(37,99,235,0.05);' : ''}">
          <td style="text-align:center">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="LeadSettings.toggleTcScope('${tc.id}', this.checked)" style="cursor:pointer" />
          </td>
          <td style="text-align:center">
            <span class="tc-code-link">${tc.id}</span>
          </td>
          <td style="text-align:center">
            <span class="badge badge-outline" style="font-size:10.5px; font-weight:700">[${tc.module || '-'}]</span>
          </td>
          <td style="text-align:center">${prioBadge}</td>
          <td>
            <div style="font-weight:700; color:var(--text-primary); line-height:1.3">${escapeHtml(tc.title || '')}</div>
            ${tc.expected ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap">Mục tiêu: ${escapeHtml(tc.expected)}</div>` : ''}
          </td>
          <td style="text-align:center">
            <span class="badge badge-outline" style="font-size:10.5px">${tc.suite || 'FUNCTIONAL'}</span>
          </td>
          <td style="text-align:center">${histBadge}</td>
          <td style="text-align:center">${statusInCycle}</td>
        </tr>
      `;
    }).join('');
  },

  toggleTcScope(tcId, isChecked) {
    if (isChecked) {
      this.tempScopeSelectedIds.add(tcId);
    } else {
      this.tempScopeSelectedIds.delete(tcId);
    }
    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  toggleCurrentViewTcs(isChecked) {
    const p = getActiveProject();
    if (!p) return;
    const q = (document.getElementById('mcs-search')?.value || '').toLowerCase().trim();
    const prioFilter = document.getElementById('mcs-filter-prio')?.value || '';
    const histFilter = document.getElementById('mcs-filter-history')?.value || '';
    const suiteFilter = document.getElementById('mcs-filter-suite')?.value || '';
    const modId = this.selectedScopeModuleId;

    const all = this.currentCycleVersionTcs || [];
    const filtered = all.filter(tc => {
      if (modId && tc.module !== modId) return false;
      if (prioFilter && tc.priority !== prioFilter) return false;
      if (suiteFilter && (tc.suite || '').toUpperCase() !== suiteFilter) return false;
      if (histFilter) {
        const summary = typeof getTcPriorExecutionSummary === 'function' ? getTcPriorExecutionSummary(tc.id, this.activeScopeCycleId, p.id) : {};
        if (histFilter === 'FAIL' && !(summary.lastStatus === 'FAIL' || summary.hadFailure)) return false;
        if (histFilter === 'PASS' && summary.lastStatus !== 'PASS') return false;
        if (histFilter === 'UNTESTED' && summary.lastStatus !== 'UNTESTED') return false;
      }
      if (q) {
        const idMatch = (tc.id || '').toLowerCase().includes(q);
        const titleMatch = (tc.title || '').toLowerCase().includes(q);
        const modMatch = (tc.module || '').toLowerCase().includes(q);
        if (!idMatch && !titleMatch && !modMatch) return false;
      }
      return true;
    });

    filtered.forEach(tc => {
      if (isChecked) this.tempScopeSelectedIds.add(tc.id);
      else this.tempScopeSelectedIds.delete(tc.id);
    });

    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  applyScopePreset(presetType) {
    const p = getActiveProject();
    if (!p) return;
    const all = this.currentCycleVersionTcs || [];

    if (presetType === 'ALL') {
      this.tempScopeSelectedIds = new Set(all.map(t => t.id));
      showToast(`⚡ Đã chọn toàn bộ ${all.length} kịch bản của phiên bản!`, 'info');
    } else if (presetType === 'FAILED') {
      const failed = all.filter(t => {
        const summary = typeof getTcPriorExecutionSummary === 'function' ? getTcPriorExecutionSummary(t.id, this.activeScopeCycleId, p.id) : {};
        const s = ((state.results || {})[t.id]?.status || '').toLowerCase();
        return summary.lastStatus === 'FAIL' || summary.hadFailure || s === 'fail' || s === 'failed';
      });
      this.tempScopeSelectedIds = new Set(failed.map(t => t.id));
      showToast(`🔥 Đã lọc chọn ${failed.length} kịch bản Thất bại (Cần Re-test)!`, 'info');
    } else if (presetType === 'HIGH_PRIO') {
      const high = all.filter(t => t.priority === 'P1' || t.priority === 'P2' || t.priority === 'Critical' || t.priority === 'High');
      this.tempScopeSelectedIds = new Set(high.map(t => t.id));
      showToast(`⭐ Đã lọc chọn ${high.length} kịch bản Trọng yếu (P1/P2)!`, 'info');
    } else if (presetType === 'SMOKE') {
      let smoke = all.filter(t => (t.suite || '').toUpperCase() === 'SMOKE' || (t.type || '').toLowerCase().includes('smoke'));
      if (smoke.length === 0) {
        smoke = all.filter(t => t.priority === 'P1');
      }
      this.tempScopeSelectedIds = new Set(smoke.map(t => t.id));
      showToast(`💨 Đã chọn ${smoke.length} kịch bản Smoke Suite!`, 'info');
    } else if (presetType === 'NOT_RUN') {
      const notRun = all.filter(t => {
        const summary = typeof getTcPriorExecutionSummary === 'function' ? getTcPriorExecutionSummary(t.id, this.activeScopeCycleId, p.id) : {};
        return summary.lastStatus === 'UNTESTED' && (!state.results || !state.results[t.id] || state.results[t.id].status === 'Not Run');
      });
      this.tempScopeSelectedIds = new Set(notRun.map(t => t.id));
      showToast(`⏳ Đã lọc chọn ${notRun.length} kịch bản Chưa chạy!`, 'info');
    } else if (presetType === 'NONE') {
      this.tempScopeSelectedIds.clear();
      showToast('❌ Đã bỏ chọn toàn bộ kịch bản!', 'info');
    }

    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  handleScopeFilterChange() {
    this.renderScopeTcTable();
  },

  resetScopeFilters() {
    const searchInput = document.getElementById('mcs-search');
    if (searchInput) searchInput.value = '';
    const prioFilter = document.getElementById('mcs-filter-prio');
    if (prioFilter) prioFilter.value = '';
    const histFilter = document.getElementById('mcs-filter-history');
    if (histFilter) histFilter.value = '';
    const suiteFilter = document.getElementById('mcs-filter-suite');
    if (suiteFilter) suiteFilter.value = '';
    this.selectedScopeModuleId = '';
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  confirmSaveCycleScope() {
    if (!this.activeScopeCycleId) return;

    const selectedList = Array.from(this.tempScopeSelectedIds);
    const ok = saveCycleScope(this.activeScopeCycleId, selectedList, 'CUSTOM');

    if (ok) {
      closeModal('modal-cycle-scope');
      showToast(`✅ Đã lưu phạm vi ${selectedList.length} kịch bản cho đợt kiểm thử!`, 'success');
      this.renderCycles();
    } else {
      showToast('❌ Lưu phạm vi kiểm thử thất bại!', 'error');
    }
  },

  // ==================== 6. IMPORT VERSION (EXCEL / JSON) ====================
  openImportVersionModal() {
    document.getElementById('miv-version').value = '';
    document.getElementById('miv-label').value = '';
    document.getElementById('miv-date').value = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    document.getElementById('miv-changelog').value = '';
    document.getElementById('miv-file-name').textContent = '';
    document.getElementById('miv-file-input').value = '';

    const previewBox = document.getElementById('miv-preview-box');
    if (previewBox) previewBox.style.display = 'none';

    const submitBtn = document.getElementById('miv-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    this.importedTcs = [];
    openModal('modal-import-version');
  },

  handleVersionFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    document.getElementById('miv-file-name').textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    const previewBox = document.getElementById('miv-preview-box');
    const previewContent = document.getElementById('miv-preview-content');
    const submitBtn = document.getElementById('miv-submit-btn');

    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');

    if (isJson) {
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          let rawTcs = Array.isArray(parsed) ? parsed : (parsed.testCases || []);
          if (!rawTcs || rawTcs.length === 0) {
            previewBox.style.display = 'block';
            previewContent.innerHTML = '<span style="color:#dc2626">⚠️ File JSON không chứa mảng kịch bản kiểm thử hợp lệ!</span>';
            submitBtn.disabled = true;
            return;
          }
          this.importedTcs = rawTcs.map((t, idx) => ({
            id: t.id || `TC-${idx + 1}`,
            module: t.module || 'M01',
            title: t.title || t.name || `Kịch bản ${idx + 1}`,
            priority: t.priority || 'P2',
            type: t.type || 'Chức năng',
            suite: t.suite || 'REGRESSION',
            steps: t.steps || '',
            expected: t.expected || ''
          }));
          const mods = new Set(this.importedTcs.map(t => t.module));
          previewBox.style.display = 'block';
          previewContent.innerHTML = `✅ Đã phân tích thành công: <strong>${this.importedTcs.length}</strong> kịch bản thuộc <strong>${mods.size}</strong> phân hệ. Sẵn sàng tạo phiên bản!`;
          submitBtn.disabled = false;
        } catch (err) {
          previewBox.style.display = 'block';
          previewContent.innerHTML = `<span style="color:#dc2626">⚠️ Lỗi cú pháp JSON: ${err.message}</span>`;
          submitBtn.disabled = true;
        }
      };
      reader.readAsText(file);
    } else {
      // Excel (.xlsx, .xls)
      reader.onload = (ev) => {
        try {
          if (typeof XLSX === 'undefined') {
            throw new Error('Thư viện XLSX chưa được tải!');
          }
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(sheet);

          if (!rows || rows.length === 0) {
            previewBox.style.display = 'block';
            previewContent.innerHTML = '<span style="color:#dc2626">⚠️ Bảng tính không chứa dữ liệu dòng nào!</span>';
            submitBtn.disabled = true;
            return;
          }

          this.importedTcs = rows.map((r, idx) => {
            const id = r['Mã kịch bản'] || r['Mã bài'] || r['Mã'] || r['ID'] || r['id'] || `TC-${idx + 1}`;
            const module = r['Phân hệ'] || r['Module'] || r['Mã phân hệ'] || r['module'] || 'M01';
            const title = r['Tên kịch bản'] || r['Tiêu đề'] || r['Tên bài'] || r['Title'] || r['title'] || `Kịch bản kiểm thử ${idx + 1}`;
            const priority = r['Mức ưu tiên'] || r['Ưu tiên'] || r['Priority'] || r['priority'] || 'P2';
            const steps = r['Các bước thực hiện'] || r['Các bước'] || r['Steps'] || r['steps'] || '';
            const expected = r['Kết quả mong đợi'] || r['Kết quả'] || r['Expected'] || r['expected'] || '';
            const type = r['Loại kiểm thử'] || r['Loại'] || r['Type'] || 'Chức năng';
            const suite = r['Suite'] || r['Loại suite'] || 'REGRESSION';

            return { id, module, title, priority, steps, expected, type, suite };
          });

          const mods = new Set(this.importedTcs.map(t => t.module));
          previewBox.style.display = 'block';
          previewContent.innerHTML = `✅ Đã phân tích bảng tính: <strong>${this.importedTcs.length}</strong> kịch bản thuộc <strong>${mods.size}</strong> phân hệ. Sẵn sàng tạo phiên bản!`;
          submitBtn.disabled = false;
        } catch (err) {
          previewBox.style.display = 'block';
          previewContent.innerHTML = `<span style="color:#dc2626">⚠️ Lỗi đọc file Excel: ${err.message}</span>`;
          submitBtn.disabled = true;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  },

  confirmImportVersion() {
    const p = getActiveProject();
    if (!p) return;

    const version = (document.getElementById('miv-version').value || '').trim();
    const label = (document.getElementById('miv-label').value || '').trim() || version;
    const targetDate = document.getElementById('miv-date').value;
    const status = document.getElementById('miv-status').value;
    const changelog = (document.getElementById('miv-changelog').value || '').trim() || `Nhập ${this.importedTcs?.length || 0} kịch bản từ file ngoại vi`;

    if (!version) {
      showToast('⚠️ Vui lòng nhập mã phiên bản mới (VD: v2.2)!', 'error');
      return;
    }

    if (!p.versions) p.versions = [];
    if (p.versions.some(v => v.version === version)) {
      showToast(`⚠️ Phiên bản [${version}] đã tồn tại trong dự án!`, 'error');
      return;
    }

    if (!this.importedTcs || this.importedTcs.length === 0) {
      showToast('⚠️ Không có kịch bản nào được phát hiện để nhập!', 'error');
      return;
    }

    // Gắn tag version cho toàn bộ kịch bản nhập
    const taggedTcs = this.importedTcs.map(tc => ({
      ...tc,
      version,
      projectId: p.id,
      isCustom: true
    }));

    // Bổ sung các module mới nếu chưa có trong dự án
    if (!p.modules) p.modules = [];
    const existingModIds = new Set(p.modules.map(m => m.id));
    taggedTcs.forEach(tc => {
      if (tc.module && !existingModIds.has(tc.module)) {
        p.modules.push({
          id: tc.module,
          name: `Phân hệ ${tc.module}`,
          desc: `Tự động trích xuất từ kịch bản phiên bản ${version}`
        });
        existingModIds.add(tc.module);
      }
    });

    p.versions.push({
      version,
      label,
      status,
      targetDate: targetDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      changelog
    });

    if (!p.testCases) p.testCases = [];
    p.testCases.push(...taggedTcs);

    if (status === 'ACTIVE') {
      p.activeVersion = version;
      state.activeVersion = version;
    }

    saveCoreState();
    if (typeof syncProjectsToLanServer === 'function') {
      syncProjectsToLanServer();
    }

    closeModal('modal-import-version');
    showToast(`🎉 Đã nhập thành công phiên bản [${version}] với ${taggedTcs.length} kịch bản!`, 'success');
    this.renderVersions();
    this.renderCycles();
    this.renderModules();
    LeadContext.renderCompactProjectBar();
  },

  // ==================== 7. CLONE VERSION ====================
  openCloneVersionModal() {
    const p = getActiveProject();
    if (!p) return;

    const sourceSelect = document.getElementById('mcv-source-version');
    if (!sourceSelect) return;

    const versions = p.versions || [{ version: p.activeVersion || 'v1.0' }];
    sourceSelect.innerHTML = versions.map(v => `
      <option value="${v.version}" ${v.version === p.activeVersion ? 'selected' : ''}>
        ${v.version} — ${v.label || 'Phiên bản'} (${getTestCasesForVersion(p.id, v.version).length} kịch bản)
      </option>
    `).join('');

    document.getElementById('mcv-new-version').value = `${p.activeVersion || 'v2.0'}-Patch1`;
    document.getElementById('mcv-new-label').value = `Bản kế thừa từ ${p.activeVersion || 'v2.0'}`;
    document.getElementById('mcv-changelog').value = '';
    this.handleCloneSourceChange();
    openModal('modal-clone-version');
  },

  handleCloneSourceChange() {
    const p = getActiveProject();
    if (!p) return;
    const srcVer = document.getElementById('mcv-source-version')?.value;
    const count = getTestCasesForVersion(p.id, srcVer).length;
    const info = document.getElementById('mcv-source-info');
    if (info) {
      info.textContent = `📦 Phiên bản nguồn hiện có ${count} kịch bản kiểm thử sẵn sàng kế thừa.`;
    }
  },

  confirmCloneVersion() {
    const p = getActiveProject();
    if (!p) return;

    const srcVer = document.getElementById('mcv-source-version')?.value;
    const newVer = (document.getElementById('mcv-new-version')?.value || '').trim();
    const newLabel = (document.getElementById('mcv-new-label')?.value || '').trim() || newVer;
    const changelog = (document.getElementById('mcv-changelog')?.value || '').trim();

    if (!newVer) {
      showToast('⚠️ Vui lòng nhập mã phiên bản mới!', 'error');
      return;
    }

    if ((p.versions || []).some(v => v.version === newVer)) {
      showToast(`⚠️ Mã phiên bản [${newVer}] đã tồn tại trong dự án!`, 'error');
      return;
    }

    const ok = cloneVersionTestCases(p.id, srcVer, newVer, newLabel, changelog);
    if (ok) {
      closeModal('modal-clone-version');
      showToast(`🎉 Kế thừa thành công! Đã tạo phiên bản [${newVer}]`, 'success');
      this.renderVersions();
      this.renderCycles();
      this.renderModules();
      LeadContext.renderCompactProjectBar();
    } else {
      showToast('❌ Thao tác kế thừa phiên bản thất bại!', 'error');
    }
  }
};
