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
    this.renderVersions();
    this.renderCycles();
    this.renderModules();
    this.renderTeamRoster();
  },

  switchTab(tabKey) {
    this.currentTab = tabKey;
    document.querySelectorAll('.lead-settings-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });
    document.querySelectorAll('.lead-settings-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `lead-pane-${tabKey}`);
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

    tbody.innerHTML = versions.map(v => {
      const isActive = v.version === p.activeVersion;
      const statusBadge = v.status === 'ACTIVE' 
        ? '<span class="badge badge-pass">Đang phát hành</span>' 
        : '<span class="badge badge-draft">Kế hoạch</span>';

      return `
        <tr style="${isActive ? 'background:rgba(217,119,6,0.06); font-weight:600' : ''}">
          <td style="font-family:monospace; font-weight:800; color:var(--text-primary)">
            ${v.version} ${isActive ? '<span class="badge badge-info" style="font-size:10px; margin-left:4px">● Hiện hành</span>' : ''}
          </td>
          <td><strong>${v.label || v.version}</strong></td>
          <td style="text-align:center">${statusBadge}</td>
          <td style="text-align:center; font-size:12px; color:var(--text-muted)">${v.targetDate || 'Chưa đặt'}</td>
          <td style="font-size:12px; color:var(--text-secondary)">${v.changelog || 'Chưa có ghi chú'}</td>
          <td style="text-align:center">
            ${!isActive ? `
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadSettings.activateVersion('${v.version}')" title="Kích hoạt phiên bản này cho dự án">
                ⚡ Kích hoạt
              </button>
            ` : '<span style="font-size:11px; color:#16a34a; font-weight:700">✓ Đang dùng</span>'}
          </td>
        </tr>
      `;
    }).join('');
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
    LeadContext.renderProjectHeader();
  },

  activateVersion(ver) {
    const p = getActiveProject();
    if (!p) return;
    p.activeVersion = ver;
    saveCoreState();
    showToast(`⚡ Đã kích hoạt phiên bản [${ver}] cho dự án ${p.name}!`, 'success');
    this.renderVersions();
    this.renderCycles();
    LeadContext.renderProjectHeader();
  },

  // ==================== 2. TEST CYCLES ====================
  renderCycles() {
    const p = getActiveProject();
    if (!p) return;

    const tbody = document.getElementById('lead-cycles-tbody');
    if (!tbody) return;

    const cycles = p.testCycles || [];
    const tcs = p.testCases || [];

    if (cycles.length === 0) {
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

      const scopeCount = Array.isArray(c.testCaseIds) && c.testCaseIds.length > 0 ? c.testCaseIds.length : tcs.length;

      return `
        <tr>
          <td style="font-family:monospace; font-weight:800; text-align:center; color:var(--primary)">
            ${c.code || c.id}
          </td>
          <td>
            <strong>${c.name}</strong>
            <div style="font-size:11.5px; color:var(--text-muted)">${c.description || 'Chưa có mô tả'}</div>
          </td>
          <td style="text-align:center"><span class="badge badge-outline">${c.version || p.activeVersion || 'v1.0'}</span></td>
          <td style="text-align:center"><span class="badge badge-info">${c.suite || c.type || 'FUNCTIONAL'}</span></td>
          <td style="text-align:center">
            <span class="badge" style="background:rgba(37,99,235,0.08); color:#2563eb; font-weight:700">
              🎯 ${scopeCount} bài
            </span>
          </td>
          <td style="text-align:center; font-size:12px; color:var(--text-muted)">
            ${c.startDate || 'Bắt đầu'} ➔ ${c.endDate || 'Hạn chót'}
          </td>
          <td style="text-align:center">${statusBadge}</td>
          <td style="text-align:center">
            <div style="display:flex; justify-content:center; gap:6px">
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadSettings.openEditCycleModal('${c.id}')" title="Sửa thông tin đợt test">
                ✏️
              </button>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadSettings.openCycleScopeModal('${c.id}')" title="Chọn danh mục kịch bản cho đợt test này">
                🎯 Kịch bản
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

    const c = (p.testCycles || []).find(x => x.id === cycleId);
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

    if (id) {
      // Edit
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
      showToast(`✅ Đã cập nhật đợt kiểm thử [${code}]!`, 'success');
    } else {
      // Add
      const newId = `CYC-${Date.now()}`;
      p.testCycles.push({
        id: newId,
        code,
        name,
        version,
        suite,
        status,
        startDate,
        endDate,
        description,
        testCaseIds: []
      });
      showToast(`✅ Đã khởi tạo đợt kiểm thử [${code}]!`, 'success');
    }

    saveCoreState();
    closeModal('modal-cycle-form');
    this.renderCycles();
    LeadContext.renderProjectHeader();
  },

  deleteCycle(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    if (!confirm('Bạn có chắc chắn muốn xóa đợt kiểm thử này khỏi dự án?')) return;

    p.testCycles = (p.testCycles || []).filter(c => c.id !== cycleId);
    saveCoreState();
    showToast('🗑️ Đã xóa đợt kiểm thử!', 'info');
    this.renderCycles();
    LeadContext.renderProjectHeader();
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

  // ==================== CYCLE SCOPE SELECTION ====================
  openCycleScopeModal(cycleId) {
    if (typeof openCycleScopeModal === 'function') {
      openCycleScopeModal(cycleId);
    } else {
      showToast(`🎯 Chức năng cấu hình phạm vi đợt test [${cycleId}]`, 'info');
    }
  }
};
