/**
 * LEAD MODULE: TEST CYCLE WORKSPACE (TẦNG 3: KHÔNG GIAN ĐỢT KIỂM THỬ)
 * Chuẩn hóa 4 Tab Điều Hành Tác Chiến Chuẩn Enterprise (Jira Xray / TestRail):
 * 1. Tổng quan & Sức khỏe đợt test (Cycle Health & Progress Overview)
 * 2. Quản trị kịch bản & Thực thi (Test Execution Workstation)
 * 3. Quản trị nhân sự & Điều phối (Tester Workload & Smart Dispatch)
 * 4. Cài đặt & Tiêu chuẩn hoàn thành đợt (Cycle Settings & Exit Criteria)
 */

const LeadCycle = {
  projectId: '',
  version: '',
  cycleId: '',
  activeTab: 'overview',

  // Tab 2: Execution Workstation
  selectedTreeModuleId: '',
  activePreset: 'ALL',
  batchSelectedTcIds: new Set(),

  // Tab 3: Staffing Workstation
  staffingActiveSubTab: 'roster',
  staffingSelectedTcIds: new Set(),
  staffingSelectedModuleId: '',
  staffingModFilterPreset: 'ALL',
  staffingModSearchTerm: '',

  // Modals state (Scope)
  tempScopeSelectedIds: new Set(),
  selectedScopeModuleId: '',

  init() {
    this.resolveCycleContext();
    this.renderCycleHeaderStrip();
    this.renderCycleOverview();
    this.renderModuleTree();
    this.renderExecutionTable();
    this.renderStaffingOverview();
    this.populateCycleSettings();

    // Khởi tạo tab từ URL tham số ?tab=overview|testcases|staffing|settings
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get('tab') || 'overview';
    this.switchCycleTab(initialTab);
  },

  resolveCycleContext() {
    const p = getActiveProject();
    if (!p) return;
    this.projectId = p.id;

    const params = new URLSearchParams(window.location.search);
    const urlVer = params.get('version');
    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    
    if (urlVer && versions.some(v => (v.version || v) === urlVer)) {
      this.version = urlVer;
    } else {
      this.version = p.activeVersion || (versions[0]?.version) || 'v1.0';
    }

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.version) : [];
    const urlCycleId = params.get('cycleId');

    if (urlCycleId && cycles.some(c => c.id === urlCycleId)) {
      this.cycleId = urlCycleId;
    } else if (state.activeCycleId && cycles.some(c => c.id === state.activeCycleId)) {
      this.cycleId = state.activeCycleId;
    } else if (cycles.length > 0) {
      this.cycleId = (cycles.find(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS') || cycles[0]).id;
    } else {
      this.cycleId = '';
    }

    state.activeCycleId = this.cycleId;

    // Sync URL params without page reload
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const curUrl = new URL(window.location.href);
      curUrl.searchParams.set('projectId', this.projectId);
      curUrl.searchParams.set('version', this.version);
      curUrl.searchParams.set('cycleId', this.cycleId);
      window.history.replaceState(null, '', curUrl.toString());
    }
  },

  getCurrentCycle() {
    return typeof getCycleById === 'function' ? getCycleById(this.cycleId) : null;
  },

  // ==================== TẦNG 3 TAB CONTROLLER ====================
  switchCycleTab(tabKey) {
    const validTabs = ['overview', 'testcases', 'staffing', 'settings'];
    const activeKey = validTabs.includes(tabKey) ? tabKey : 'overview';
    this.activeTab = activeKey;

    // 1. Toggle Panes
    validTabs.forEach(t => {
      const pane = document.getElementById(`tab-pane-c-${t}`);
      if (pane) {
        pane.style.display = (t === activeKey) ? 'block' : 'none';
      }
    });

    // 2. Toggle Subnav Buttons
    const buttons = {
      overview: document.getElementById('btn-subnav-c-overview'),
      testcases: document.getElementById('btn-subnav-c-testcases'),
      staffing: document.getElementById('btn-subnav-c-staffing'),
      settings: document.getElementById('btn-subnav-c-settings')
    };

    Object.entries(buttons).forEach(([key, btn]) => {
      if (btn) {
        if (key === activeKey) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    // 3. Update URL without reload
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const curUrl = new URL(window.location.href);
      curUrl.searchParams.set('tab', activeKey);
      window.history.replaceState(null, '', curUrl.toString());
    }

    // 4. Trigger specific re-renders
    if (activeKey === 'overview') {
      this.renderCycleOverview();
    } else if (activeKey === 'testcases') {
      this.renderModuleTree();
      this.renderExecutionTable();
    } else if (activeKey === 'staffing') {
      this.renderStaffingOverview();
    } else if (activeKey === 'settings') {
      this.populateCycleSettings();
    }
  },

  // ==================== HEADER STRIP ====================
  renderCycleHeaderStrip() {
    const c = this.getCurrentCycle();
    if (!c) {
      const codeEl = document.getElementById('c-strip-code');
      if (codeEl) codeEl.textContent = '--';
      const nameEl = document.getElementById('c-strip-name');
      if (nameEl) nameEl.textContent = 'Chưa có đợt kiểm thử nào';
      const statusEl = document.getElementById('c-strip-status');
      if (statusEl) {
        statusEl.textContent = '⚪ CHƯA TẠO';
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(100,116,139,0.12)';
        statusEl.style.color = '#64748b';
      }
      const metaEl = document.getElementById('c-strip-meta');
      if (metaEl) {
        metaEl.innerHTML = `Vui lòng tạo đợt kiểm thử mới cho phiên bản <strong>${escapeHtml(this.version)}</strong> để kích hoạt tác chiến.`;
      }
      return;
    }

    const codeEl = document.getElementById('c-strip-code');
    if (codeEl) codeEl.textContent = c.code || c.id;

    const nameEl = document.getElementById('c-strip-name');
    if (nameEl) nameEl.textContent = c.name || `Đợt kiểm thử ${c.id}`;

    const statusEl = document.getElementById('c-strip-status');
    if (statusEl) {
      const st = (c.status || 'ACTIVE').toUpperCase();
      statusEl.textContent = st === 'ACTIVE' ? '🟢 ACTIVE' : (st === 'COMPLETED' ? '🔒 COMPLETED' : st);
      statusEl.className = `badge ${st === 'ACTIVE' ? 'badge-pass' : 'badge-outline'}`;
    }

    const suiteEl = document.getElementById('c-strip-suite');
    if (suiteEl) suiteEl.textContent = c.suite || c.targetSuite || 'REGRESSION';

    const verEl = document.getElementById('c-strip-ver');
    if (verEl) verEl.textContent = this.version;

    const metaEl = document.getElementById('c-strip-meta');
    if (metaEl) {
      const sDate = c.startDate || 'N/A';
      const eDate = c.endDate || 'N/A';
      const qg = c.exitCriteria || { minPassRate: 90 };
      metaEl.innerHTML = `📅 Thời hạn: <strong>${sDate} ➔ ${eDate}</strong> • Phiên bản: <strong>${this.version}</strong> • Mục tiêu tỷ lệ đạt: <strong>≥ ${qg.minPassRate || 90}%</strong>`;
    }
  },

  // ==================== TAB 1: OVERVIEW & HEALTH ====================
  renderCycleOverview() {
    const p = getActiveProject();
    if (!p) return;

    const c = this.getCurrentCycle();
    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    if (!c) {
      setEl('c-kpi-pass-val', '--');
      setEl('c-kpi-pass-sub', 'Chưa có đợt kiểm thử');
      setEl('c-kpi-burn-val', '0%');
      setEl('c-kpi-burn-sub', '0 / 0 bài đã chạy');
      setEl('c-kpi-defects-val', '0 lỗi');
      setEl('c-kpi-defects-sub', 'Không có lỗi ghi nhận');
      setEl('c-kpi-blocked-val', '0 bài');
      setEl('c-kpi-blocked-sub', 'Không có điểm nghẽn');
      return;
    }

    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const totalTcs = cycleTcs.length;

    let passCount = 0, failCount = 0, blockedCount = 0, untestedCount = 0;
    let p1Total = 0, p1Passed = 0;

    cycleTcs.forEach(tc => {
      const prio = (tc.priority || 'P2').toUpperCase();
      if (prio === 'P1') p1Total++;

      const res = typeof getResultForTc === 'function' ? getResultForTc(tc.id, p.id) : (state.results || {})[tc.id];
      const st = (res?.status || 'UNTESTED').toUpperCase();

      if (st === 'PASS' || st === 'PASSED') {
        passCount++;
        if (prio === 'P1') p1Passed++;
      } else if (st === 'FAIL' || st === 'FAILED') {
        failCount++;
      } else if (st === 'BLOCKED') {
        blockedCount++;
      } else {
        untestedCount++;
      }
    });

    const executedCount = passCount + failCount + blockedCount;
    const burnRate = totalTcs > 0 ? Math.round((executedCount / totalTcs) * 100) : 0;
    const passRate = executedCount > 0 ? Math.round((passCount / executedCount) * 1000) / 10 : 0;

    // Lỗi phát sinh trong đợt
    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
    const cycleDefects = allDefects.filter(d => (d.cycleId === this.cycleId || !d.cycleId) && (d.defectStatus !== 'Closed'));
    
    let p1Bugs = 0, p2Bugs = 0, p3Bugs = 0;
    cycleDefects.forEach(d => {
      const sev = (d.severity || d.priority || 'P3').toUpperCase();
      if (sev === 'P1' || sev === 'BLOCKER') p1Bugs++;
      else if (sev === 'P2' || sev === 'CRITICAL') p2Bugs++;
      else p3Bugs++;
    });

    // 1. Điền 4 KPI cốt lõi
    const targetPass = c?.exitCriteria?.minPassRate ?? 90;
    if (totalTcs === 0) {
      setEl('c-kpi-pass-val', '--');
      setEl('c-kpi-pass-sub', `Mục tiêu: ≥ ${targetPass}% (Chưa nạp kịch bản vào đợt)`);
      setEl('c-kpi-burn-val', '0%');
      setEl('c-kpi-burn-sub', '0 / 0 bài đã chạy (Chưa có kịch bản)');
    } else {
      setEl('c-kpi-pass-val', `${passRate}%`);
      setEl('c-kpi-pass-sub', passRate >= targetPass ? `🟢 Đã đạt chuẩn (mục tiêu ≥ ${targetPass}%)` : `Mục tiêu: ≥ ${targetPass}% (thiếu ${(targetPass - passRate).toFixed(1)}%)`);
      setEl('c-kpi-burn-val', `${burnRate}%`);
      setEl('c-kpi-burn-sub', `${executedCount} / ${totalTcs} bài đã chạy (${untestedCount} chưa kiểm thử)`);
    }

    setEl('c-kpi-defects-val', `${cycleDefects.length} lỗi`);
    setEl('c-kpi-defects-sub', `${p1Bugs} lỗi nghiêm trọng P1 • ${p2Bugs} lỗi mức cao P2 • ${p3Bugs} lỗi trung bình P3`);

    setEl('c-kpi-blocked-val', `${blockedCount} bài`);
    setEl('c-kpi-blocked-sub', blockedCount === 0 ? '🟢 Không có điểm nghẽn kỹ thuật' : '⚠️ Cần tháo gỡ điểm nghẽn để tiếp tục kiểm thử');

    // 2. Thanh phân bổ 4 màu
    const pctPass = totalTcs > 0 ? Math.round((passCount / totalTcs) * 100) : 0;
    const pctFail = totalTcs > 0 ? Math.round((failCount / totalTcs) * 100) : 0;
    const pctBlock = totalTcs > 0 ? Math.round((blockedCount / totalTcs) * 100) : 0;
    const pctUntest = totalTcs > 0 ? Math.max(0, 100 - pctPass - pctFail - pctBlock) : 0;

    const barPass = document.getElementById('c-bar-pass');
    if (barPass) { barPass.style.width = `${pctPass}%`; barPass.title = `Đạt: ${passCount} bài`; }
    const barFail = document.getElementById('c-bar-fail');
    if (barFail) { barFail.style.width = `${pctFail}%`; barFail.title = `Không đạt: ${failCount} bài`; }
    const barBlock = document.getElementById('c-bar-block');
    if (barBlock) { barBlock.style.width = `${pctBlock}%`; barBlock.title = `Bị nghẽn: ${blockedCount} bài`; }
    const barUntest = document.getElementById('c-bar-untest');
    if (barUntest) { barUntest.style.width = `${pctUntest}%`; barUntest.title = `Chưa kiểm thử: ${untestedCount} bài`; }

    setEl('c-count-pass', `${passCount} (${pctPass}%)`);
    setEl('c-count-fail', `${failCount} (${pctFail}%)`);
    setEl('c-count-block', `${blockedCount} (${pctBlock}%)`);
    setEl('c-count-untest', `${untestedCount} (${pctUntest}%)`);

    const p1Coverage = p1Total > 0 ? Math.round((p1Passed / p1Total) * 100) : 100;
    setEl('c-summary-p1-cov', `Độ bao phủ P1: ${p1Passed}/${p1Total} bài (${p1Coverage}%)`);

    // 3. Bảng phân rã theo phân hệ
    this.renderModuleBreakdown(cycleTcs);

    // 4. Radar lỗi nghiêm trọng
    this.renderCriticalDefectRadar(cycleDefects);
  },

  // Lấy danh sách các phân hệ thực tế có kịch bản thuộc phạm vi đợt kiểm thử
  getActiveCycleModules() {
    const p = getActiveProject();
    const modules = typeof getModules === 'function' ? getModules(this.version, p?.id) : (p?.modules || []);
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];

    const activeModMap = new Map();
    cycleTcs.forEach(t => {
      const mId = t.moduleId || t.module;
      if (mId && !activeModMap.has(mId)) {
        const found = modules.find(m => m.id === mId);
        activeModMap.set(mId, {
          id: mId,
          name: found?.name || t.moduleName || t.module || mId
        });
      }
    });

    // Giữ nguyên thứ tự theo danh mục modules gốc nếu có
    const activeModules = modules.filter(m => activeModMap.has(m.id));
    // Bổ sung các phân hệ có trong test case nhưng chưa khai báo trong modules
    activeModMap.forEach((val, key) => {
      if (!activeModules.some(m => m.id === key)) {
        activeModules.push(val);
      }
    });

    return { activeModules, cycleTcs, allModules: modules };
  },

  renderModuleBreakdown(cycleTcs) {
    const tbody = document.getElementById('c-module-breakdown-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    const { activeModules } = this.getActiveCycleModules();
    const countBadge = document.getElementById('c-modules-count');
    if (countBadge) countBadge.textContent = `${activeModules.length} phân hệ`;

    if (activeModules.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-muted)">Đợt kiểm thử chưa có kịch bản thuộc phân hệ nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = activeModules.map(m => {
      const modTcs = cycleTcs.filter(t => (t.moduleId || t.module) === m.id);
      const total = modTcs.length;
      if (total === 0) return '';

      let pass = 0, fail = 0;
      modTcs.forEach(t => {
        const r = typeof getResultForTc === 'function' ? getResultForTc(t.id, p.id) : (state.results || {})[t.id];
        const st = (r?.status || '').toUpperCase();
        if (st === 'PASS' || st === 'PASSED') pass++;
        else if (st === 'FAIL' || st === 'FAILED') fail++;
      });

      const executed = pass + fail;
      const rate = executed > 0 ? Math.round((pass / executed) * 100) : 0;

      return `
        <tr>
          <td>
            <div style="font-weight:700; font-size:13px; color:var(--text-primary)">[${escapeHtml(m.id)}] ${escapeHtml(m.name || '')}</div>
          </td>
          <td style="text-align:center; font-weight:700">${total} bài</td>
          <td style="text-align:center">${executed}/${total}</td>
          <td>
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:2px">
              <span style="color:#16a34a">${rate}%</span>
              <span style="color:var(--text-muted)">${pass}/${executed}</span>
            </div>
            <div style="height:6px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex">
              <div style="width:${rate}%; background:#16a34a"></div>
            </div>
          </td>
          <td style="text-align:center">
            ${fail > 0 ? `<span class="badge badge-fail" style="font-size:10px">${fail} lỗi</span>` : `<span style="color:var(--text-muted); font-size:11px">0</span>`}
          </td>
          <td style="text-align:center">
            <button type="button" class="btn btn-outline btn-xs" onclick="LeadCycle.filterByModuleFromOverview('${m.id}')" title="Lọc kịch bản phân hệ này">
              🔍 Lọc
            </button>
          </td>
        </tr>
      `;
    }).filter(Boolean).join('');
  },

  renderCriticalDefectRadar(cycleDefects) {
    const listEl = document.getElementById('c-critical-bugs-list');
    const badgeEl = document.getElementById('c-open-bugs-badge');
    if (!listEl) return;

    const criticals = cycleDefects.filter(d => {
      const sev = (d.severity || d.priority || '').toUpperCase();
      return sev === 'P1' || sev === 'BLOCKER' || sev === 'P2' || sev === 'CRITICAL';
    });

    if (badgeEl) badgeEl.textContent = `${criticals.length} lỗi P1/P2`;

    if (criticals.length === 0) {
      listEl.innerHTML = `
        <div style="padding:14px; background:rgba(22,163,74,0.06); border:1px solid rgba(22,163,74,0.2); border-radius:8px; text-align:center; color:#16a34a; font-size:12.5px; font-weight:700">
          🟢 Xuất sắc! Hiện không có lỗi nghiêm trọng P1 hoặc lỗi mức cao P2 nào cản trở đợt kiểm thử.
        </div>
      `;
      return;
    }

    listEl.innerHTML = criticals.slice(0, 5).map(bug => {
      const sev = (bug.severity || bug.priority || 'P2').toUpperCase();
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; font-size:12px">
          <div style="display:flex; align-items:center; gap:8px; overflow:hidden">
            <span class="badge ${sev === 'P1' || sev === 'BLOCKER' ? 'badge-fail' : 'badge-p2'}" style="font-size:10px">${sev}</span>
            <span style="font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:260px">${escapeHtml(bug.title || bug.desc || bug.id)}</span>
          </div>
          <span style="font-size:11px; color:#dc2626; font-weight:700; white-space:nowrap">${escapeHtml(bug.defectStatus || 'Open')}</span>
        </div>
      `;
    }).join('');
  },

  filterByModuleFromOverview(modId) {
    this.selectedTreeModuleId = modId;
    this.activePreset = 'ALL';
    this.switchCycleTab('testcases');
  },

  filterByResultStatus(status) {
    this.switchCycleTab('testcases');
    const statusSelect = document.getElementById('c-filter-status');
    if (statusSelect) statusSelect.value = status;
    this.onFilterChange();
  },

  filterByPreset(presetKey) {
    this.activePreset = presetKey;
    this.switchCycleTab('testcases');
    
    // Update active preset button highlight
    const presetBtns = ['all', 'failed', 'blocked', 'untested', 'p1'];
    presetBtns.forEach(p => {
      const btn = document.getElementById(`c-preset-${p}`);
      if (btn) {
        if (p.toUpperCase() === presetKey.toUpperCase() || (presetKey === 'FAILED_RECENT' && p === 'failed')) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    this.renderExecutionTable();
  },

  // ==================== TAB 2: TESTCASES & EXECUTION WORKSTATION ====================
  renderModuleTree() {
    const treeEl = document.getElementById('c-module-tree-list');
    if (!treeEl) return;

    const p = getActiveProject();
    const { activeModules, cycleTcs } = this.getActiveCycleModules();

    // Cập nhật số đếm trên các Presets
    let failedCount = 0, blockedCount = 0, untestedCount = 0, p1Count = 0;
    cycleTcs.forEach(t => {
      const r = typeof getResultForTc === 'function' ? getResultForTc(t.id, p?.id) : (state.results || {})[t.id];
      const st = (r?.status || 'UNTESTED').toUpperCase();
      if (st === 'FAIL' || st === 'FAILED') failedCount++;
      else if (st === 'BLOCKED') blockedCount++;
      else if (st === 'UNTESTED' || !r) untestedCount++;

      if ((t.priority || '').toUpperCase() === 'P1') p1Count++;
    });

    const setBadge = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setBadge('c-badge-all-count', cycleTcs.length);
    setBadge('c-badge-failed-count', failedCount);
    setBadge('c-badge-blocked-count', blockedCount);
    setBadge('c-badge-untested-count', untestedCount);
    setBadge('c-badge-p1-count', p1Count);

    // Bỏ chọn nếu phân hệ đã chọn trước đó không còn thuộc phạm vi đợt kiểm thử
    if (this.selectedTreeModuleId && !activeModules.some(m => m.id === this.selectedTreeModuleId)) {
      this.selectedTreeModuleId = '';
    }

    if (activeModules.length === 0) {
      treeEl.innerHTML = `
        <div style="text-align:center; padding:16px 8px; color:var(--text-muted); font-size:11.5px">
          Đợt chưa có kịch bản nào được giao.
        </div>
      `;
      return;
    }

    // Render tree modules (chỉ hiển thị các phân hệ có kịch bản trong phạm vi đợt kiểm thử)
    treeEl.innerHTML = activeModules.map(m => {
      const modTcs = cycleTcs.filter(t => (t.moduleId || t.module) === m.id);
      const isSelected = this.selectedTreeModuleId === m.id;
      return `
        <button type="button" class="cycle-tree-item ${isSelected ? 'active' : ''}" onclick="LeadCycle.selectTreeModule('${m.id}')" title="Lọc kịch bản phân hệ [${m.id}] ${escapeHtml(m.name || m.id)}">
          <div style="display:flex; align-items:center; gap:6px; overflow:hidden">
            <span>📁</span>
            <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${escapeHtml(m.name || m.id)}</span>
          </div>
          <span class="badge badge-nr" style="font-size:10px">${modTcs.length}</span>
        </button>
      `;
    }).join('');
  },

  selectTreeModule(modId) {
    if (this.selectedTreeModuleId === modId) {
      this.selectedTreeModuleId = ''; // unselect to show all
    } else {
      this.selectedTreeModuleId = modId;
    }
    this.renderModuleTree();
    this.renderExecutionTable();
  },

  getFilteredExecutionTcs() {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const p = getActiveProject();

    const searchTerm = (document.getElementById('c-filter-search')?.value || '').trim().toLowerCase();
    const prioFilter = document.getElementById('c-filter-priority')?.value || '';
    const testerFilter = document.getElementById('c-filter-tester')?.value || '';
    const statusFilter = document.getElementById('c-filter-status')?.value || '';

    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgMap = new Map();
    assignments.forEach(a => {
      if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
      asgMap.get(a.tcId).push(a);
    });

    return cycleTcs.filter(tc => {
      // 1. Module filter
      if (this.selectedTreeModuleId && (tc.moduleId || tc.module) !== this.selectedTreeModuleId) {
        return false;
      }

      const res = typeof getResultForTc === 'function' ? getResultForTc(tc.id, p?.id) : (state.results || {})[tc.id];
      const st = (res?.status || 'UNTESTED').toUpperCase();
      const prio = (tc.priority || 'P2').toUpperCase();

      // 2. Preset filter
      if (this.activePreset === 'FAILED' && st !== 'FAIL' && st !== 'FAILED') return false;
      if (this.activePreset === 'BLOCKED' && st !== 'BLOCKED') return false;
      if (this.activePreset === 'UNTESTED' && st !== 'UNTESTED' && res) return false;
      if (this.activePreset === 'P1' && prio !== 'P1') return false;

      // 3. Search filter
      if (searchTerm) {
        const idMatch = (tc.id || '').toLowerCase().includes(searchTerm);
        const nameMatch = (tc.name || tc.title || '').toLowerCase().includes(searchTerm);
        const objMatch = (tc.objective || tc.notes || '').toLowerCase().includes(searchTerm);
        if (!idMatch && !nameMatch && !objMatch) return false;
      }

      // 4. Priority filter
      if (prioFilter && prio !== prioFilter) return false;

      // 5. Status filter
      if (statusFilter && st !== statusFilter) return false;

      // 6. Tester filter (Multi-Assignee aware)
      const asgs = asgMap.get(tc.id) || [];
      if (testerFilter === '__UNASSIGNED__' && asgs.length > 0) return false;
      if (testerFilter && testerFilter !== '__UNASSIGNED__' && !asgs.some(a => a.assigneeUsername === testerFilter)) return false;

      return true;
    });
  },

  renderExecutionTable() {
    const tbody = document.getElementById('c-exec-tbody');
    if (!tbody) return;

    const filtered = this.getFilteredExecutionTcs();
    const p = getActiveProject();

    // Populate tester filter options if not yet populated
    const testerSelect = document.getElementById('c-filter-tester');
    if (testerSelect && testerSelect.options.length <= 2) {
      const allUsers = typeof getUsers === 'function' ? getUsers() : [];
      let activeTesters = allUsers.filter(u => u.role === 'tester' && u.status !== 'LOCKED');
      if (activeTesters.length === 0) activeTesters = allUsers.filter(u => u.status !== 'LOCKED');
      testerSelect.innerHTML = `<option value="">-- Người kiểm thử --</option><option value="__UNASSIGNED__">⚪ Chưa phân công</option>` +
        activeTesters.map(u => `<option value="${u.username}">${escapeHtml(u.name)} (${escapeHtml((u.roleTitle || 'Kỹ sư kiểm thử').replace(/\s*\([^)]*\)/g, ''))})</option>`).join('');
    }

    const countEl = document.getElementById('c-table-shown-count');
    if (countEl) countEl.textContent = filtered.length;

    const selCountEl = document.getElementById('c-selected-tcs-count');
    if (selCountEl) selCountEl.textContent = this.batchSelectedTcIds.size;

    const checkAllBox = document.getElementById('c-check-all-tcs');
    if (checkAllBox) {
      checkAllBox.checked = filtered.length > 0 && filtered.every(t => this.batchSelectedTcIds.has(t.id));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted)">
            <div style="font-size:24px; margin-bottom:6px">🔍</div>
            <div style="font-weight:700">Không tìm thấy kịch bản nào khớp với bộ lọc hiện tại.</div>
            <div style="font-size:12px; margin-top:2px">Thử đặt lại bộ lọc hoặc chọn mục khác trên Cây phân hệ.</div>
          </td>
        </tr>
      `;
      return;
    }

    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgMap = new Map();
    assignments.forEach(a => {
      if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
      asgMap.get(a.tcId).push(a);
    });

    const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

    tbody.innerHTML = filtered.map(tc => {
      const isChecked = this.batchSelectedTcIds.has(tc.id);
      const res = typeof getResultForTc === 'function' ? getResultForTc(tc.id, p?.id) : (state.results || {})[tc.id];
      const st = (res?.status || 'Untested').toUpperCase();
      const asgs = asgMap.get(tc.id) || [];

      // Pill class
      let pillClass = 'pill-untested';
      let pillText = '⚪ Chưa kiểm thử';
      if (st === 'PASS' || st === 'PASSED') { pillClass = 'pill-pass'; pillText = '🟢 Đạt'; }
      else if (st === 'FAIL' || st === 'FAILED') { pillClass = 'pill-fail'; pillText = '🔴 Không đạt'; }
      else if (st === 'BLOCKED') { pillClass = 'pill-blocked'; pillText = '🟡 Bị nghẽn'; }

      // Priority badge
      const prio = (tc.priority || 'P2').toUpperCase();
      let prioBadge = `<span class="badge badge-info" style="font-size:10.5px">${prio}</span>`;
      if (prio === 'P1') prioBadge = `<span class="badge badge-fail" style="font-size:10.5px; font-weight:800">P1</span>`;
      else if (prio === 'P2') prioBadge = `<span class="badge badge-p2" style="font-size:10.5px; font-weight:800">P2</span>`;

      // Multi-Assignee rendering
      let testerHtml = '';
      if (asgs.length === 0) {
        testerHtml = `
          <button type="button" class="btn btn-outline btn-xs" onclick="LeadCycle.openTcConfigModal('${tc.id}')" style="color:var(--text-muted); font-size:11px">
            + Giao việc
          </button>
        `;
      } else if (asgs.length === 1) {
        const a = asgs[0];
        const initial = (a.assigneeName || a.assigneeUsername || 'T').charAt(0).toUpperCase();
        testerHtml = `
          <div class="cycle-assignee-stack" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Phân công: ${escapeHtml(a.assigneeName)} • Nhấp để mở bảng cấu hình">
            <span class="avatar-sm" style="background:#2563eb">${initial}</span>
            <span style="font-size:11.5px; font-weight:700; color:var(--text-primary); max-width:105px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(a.assigneeName || a.assigneeUsername)}</span>
          </div>
        `;
      } else {
        const names = asgs.map(a => a.assigneeName || a.assigneeUsername).join(', ');
        testerHtml = `
          <div class="cycle-assignee-stack" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Đã giao cho ${asgs.length} kỹ sư: ${escapeHtml(names)} • Nhấp để xem chi tiết hoặc thêm bớt">
            <div class="avatar-stack">
              ${asgs.slice(0, 3).map((a, idx) => {
                const bg = colors[idx % colors.length];
                const initial = (a.assigneeName || a.assigneeUsername || 'T').charAt(0).toUpperCase();
                return `<span class="avatar-sm" style="background:${bg}" title="${escapeHtml(a.assigneeName)}">${initial}</span>`;
              }).join('')}
            </div>
            <span class="badge badge-info" style="font-size:10px; font-weight:800">👥 ${asgs.length} người</span>
          </div>
        `;
      }

      return `
        <tr style="${isChecked ? 'background:rgba(37,99,235,0.04)' : ''}">
          <td style="text-align:center">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="LeadCycle.toggleSelectTc('${tc.id}', this.checked)" style="cursor:pointer" />
          </td>
          <td style="text-align:center; font-family:monospace; font-weight:700">
            <a href="javascript:void(0)" onclick="LeadCycle.openTcConfigModal('${tc.id}')" style="color:#2563eb; text-decoration:none" title="Nhấp để cấu hình kịch bản và phân công kỹ sư">
              ${escapeHtml(tc.id)}
            </a>
          </td>
          <td style="text-align:center">
            <span class="badge badge-nr" style="font-size:10px">${escapeHtml(tc.moduleId || tc.module || 'M01')}</span>
          </td>
          <td style="text-align:center">${prioBadge}</td>
          <td>
            <div style="font-weight:600; color:var(--text-primary); font-size:12.5px; margin-bottom:2px">
              ${escapeHtml(tc.name || tc.title || '')}
            </div>
            <div style="font-size:11px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:420px">
              ${escapeHtml(tc.objective || tc.notes || '')}
            </div>
          </td>
          <td style="text-align:center">
            ${testerHtml}
          </td>
          <td style="text-align:center">
            <div class="cycle-exec-pill ${pillClass}" onclick="LeadCycle.cycleNextResultStatus('${tc.id}', '${st}')" title="Nhấp để chuyển nhanh trạng thái kết quả">
              ${pillText}
            </div>
          </td>
          <td style="text-align:center">
            ${st === 'FAIL' || st === 'FAILED' ? `
              <span class="badge badge-fail" style="font-size:10px; cursor:pointer" onclick="LeadCycle.openLogDefectModal('${tc.id}')">
                🐛 Lỗi #0${tc.id.replace(/\D/g, '') || '1'}
              </span>
            ` : `<span style="color:var(--text-muted); font-size:11px">--</span>`}
          </td>
          <td style="text-align:center">
            <button type="button" class="btn btn-outline btn-xs" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Cấu hình kịch bản và phân công kỹ sư thực hiện">
              ⚙️ Cấu hình
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleSelectAllCurrentView(isChecked) {
    const filtered = this.getFilteredExecutionTcs();
    filtered.forEach(tc => {
      if (isChecked) this.batchSelectedTcIds.add(tc.id);
      else this.batchSelectedTcIds.delete(tc.id);
    });
    this.renderExecutionTable();
  },

  toggleSelectTc(tcId, isChecked) {
    if (isChecked) this.batchSelectedTcIds.add(tcId);
    else this.batchSelectedTcIds.delete(tcId);
    this.renderExecutionTable();
  },

  cycleNextResultStatus(tcId, curStatus) {
    let next = 'Pass';
    if (curStatus === 'PASS' || curStatus === 'PASSED') next = 'Fail';
    else if (curStatus === 'FAIL' || curStatus === 'FAILED') next = 'Blocked';
    else if (curStatus === 'BLOCKED') next = 'Untested';
    else next = 'Pass';

    this.updateTcResult(tcId, next);
  },

  updateTcResult(tcId, status) {
    const p = getActiveProject();
    if (!p) return;

    if (typeof setResultForTc === 'function') {
      setResultForTc(tcId, {
        status: status,
        cycleId: this.cycleId,
        tester: getCurrentUser().name || 'Lead',
        runAt: new Date().toISOString()
      }, p.id);
    } else {
      if (!state.results) state.results = {};
      state.results[tcId] = {
        status: status,
        cycleId: this.cycleId,
        tester: getCurrentUser().name || 'Lead',
        runAt: new Date().toISOString()
      };
      saveCoreState();
    }

    showToast(`✅ Đã cập nhật kết quả: [${tcId}] ➔ ${status}`, 'info');
    this.renderExecutionTable();
    this.renderCycleOverview();
  },

  batchSetResult(status) {
    if (this.batchSelectedTcIds.size === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất 1 kịch bản để cập nhật hàng loạt!', 'warning');
      return;
    }

    const p = getActiveProject();
    if (!p) return;

    this.batchSelectedTcIds.forEach(tcId => {
      if (typeof setResultForTc === 'function') {
        setResultForTc(tcId, {
          status: status,
          cycleId: this.cycleId,
          tester: getCurrentUser().name || 'Lead',
          runAt: new Date().toISOString()
        }, p.id);
      } else {
        if (!state.results) state.results = {};
        state.results[tcId] = {
          status: status,
          cycleId: this.cycleId,
          tester: getCurrentUser().name || 'Lead',
          runAt: new Date().toISOString()
        };
      }
    });

    saveCoreState();
    showToast(`✅ Đã cập nhật kết quả ${status} cho ${this.batchSelectedTcIds.size} kịch bản!`, 'success');
    this.batchSelectedTcIds.clear();
    this.renderExecutionTable();
    this.renderCycleOverview();
  },

  onFilterChange() {
    this.renderExecutionTable();
  },

  resetFilters() {
    const s = document.getElementById('c-filter-search'); if (s) s.value = '';
    const p = document.getElementById('c-filter-priority'); if (p) p.value = '';
    const t = document.getElementById('c-filter-tester'); if (t) t.value = '';
    const st = document.getElementById('c-filter-status'); if (st) st.value = '';
    this.selectedTreeModuleId = '';
    this.activePreset = 'ALL';
    this.renderModuleTree();
    this.renderExecutionTable();
  },

  exportCycleExcel() {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const p = getActiveProject();
    if (!cycleTcs.length || typeof XLSX === 'undefined') {
      showToast('⚠️ Không có dữ liệu để xuất Excel!', 'warning');
      return;
    }

    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgMap = new Map();
    assignments.forEach(a => {
      if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
      asgMap.get(a.tcId).push(a);
    });

    const rows = cycleTcs.map(t => {
      const r = typeof getResultForTc === 'function' ? getResultForTc(t.id, p?.id) : (state.results || {})[t.id];
      const asgs = asgMap.get(t.id) || [];
      const testersStr = asgs.length > 0 ? asgs.map(a => `${a.assigneeName || a.assigneeUsername} (${a.roleInTest || 'Tester'})`).join('; ') : 'Chưa giao';
      return {
        'Mã kịch bản': t.id,
        'Phân hệ': t.moduleId || t.module || '',
        'Mức ưu tiên': t.priority || 'P2',
        'Tiêu đề kịch bản': t.name || t.title || '',
        'Mục tiêu kiểm thử': t.objective || '',
        'Kỹ sư đảm nhận': testersStr,
        'Trạng thái kết quả': r?.status || 'Chưa kiểm thử',
        'Thời điểm chạy': r?.runAt || '',
        'Ghi chú': r?.notes || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cycle_Execution');
    XLSX.writeFile(wb, `${p?.code || 'PROJECT'}_${this.cycleId}_Execution.xlsx`);
    showToast('📥 Đã xuất dữ liệu đợt kiểm thử sang Excel!', 'success');
  },

  // ==================== TAB 3: STAFFING & ROSTER (ENTERPRISE 2 SUB-TABS WORKSTATION) ====================
  renderStaffingOverview() {
    this.populateStaffingControls();
    this.populateQuickDispatchTesters();
    this.renderStaffingKPIs();
    this.renderStaffingRoster();
    this.renderStaffingModuleTree();
    this.renderStaffingTcTable();
  },

  switchStaffingSubTab(subTabKey) {
    this.staffingActiveSubTab = subTabKey;
    const isRoster = subTabKey === 'roster';
    const rosterPane = document.getElementById('subpane-staffing-roster');
    const dispatchPane = document.getElementById('subpane-staffing-dispatch');
    if (rosterPane) rosterPane.style.display = isRoster ? 'block' : 'none';
    if (dispatchPane) dispatchPane.style.display = isRoster ? 'none' : 'block';

    const btnRoster = document.getElementById('btn-staffing-subtab-roster');
    const btnDispatch = document.getElementById('btn-staffing-subtab-dispatch');
    if (btnRoster) {
      btnRoster.className = isRoster ? 'btn btn-sm active' : 'btn btn-sm btn-ghost';
    }
    if (btnDispatch) {
      btnDispatch.className = !isRoster ? 'btn btn-sm active' : 'btn btn-sm btn-ghost';
    }

    this.populateStaffingControls();
    if (isRoster) {
      this.renderStaffingKPIs();
      this.renderStaffingRoster();
    } else {
      this.populateQuickDispatchTesters();
      this.renderStaffingModuleTree();
      this.renderStaffingTcTable();
    }
  },

  // Lấy danh sách kiểm thử viên thực tế được phân bổ cho đợt kiểm thử này
  // Căn cứ vào cấu hình nhân sự đã giao ở Không gian Phiên bản / Kịch bản test
  getCycleParticipants() {
    const c = this.getCurrentCycle();
    const allUsers = typeof getUsers === 'function' ? getUsers() : (state.users || DEFAULT_SYSTEM_USERS);

    // 1. Nếu đợt kiểm thử đã được cấu hình danh sách nhân sự tham gia:
    if (c && Array.isArray(c.assignedTesters) && c.assignedTesters.length > 0) {
      const set = new Set(c.assignedTesters);
      const matched = allUsers.filter(u => set.has(u.username) && u.status !== 'LOCKED');
      if (matched.length > 0) return matched;
    }
    if (c && Array.isArray(c.testerUsernames) && c.testerUsernames.length > 0) {
      const set = new Set(c.testerUsernames);
      const matched = allUsers.filter(u => set.has(u.username) && u.status !== 'LOCKED');
      if (matched.length > 0) return matched;
    }

    // 2. Fallback: Lấy các kiểm thử viên thuộc dự án
    const p = this.getCurrentProject();
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p?.id) : (p?.members || []);
    const memberTesters = members.filter(m => m.projectRole === 'tester');
    if (memberTesters.length > 0) {
      const pSet = new Set(memberTesters.map(m => m.username));
      const matched = allUsers.filter(u => pSet.has(u.username) && u.status !== 'LOCKED');
      if (matched.length > 0) return matched;
    }

    // 3. Fallback: Testers hệ thống
    return allUsers.filter(u => u.role === 'tester' && u.status !== 'LOCKED');
  },

  // Lấy danh sách lập trình viên phụ trách (Developers) được phân bổ cho đợt kiểm thử
  getCycleDevelopers() {
    const c = this.getCurrentCycle();
    const allUsers = typeof getUsers === 'function' ? getUsers() : (state.users || DEFAULT_SYSTEM_USERS);

    if (c && Array.isArray(c.assignedDevs) && c.assignedDevs.length > 0) {
      const set = new Set(c.assignedDevs);
      const matched = allUsers.filter(u => set.has(u.username) && u.status !== 'LOCKED');
      if (matched.length > 0) return matched;
    }
    if (c && Array.isArray(c.devUsernames) && c.devUsernames.length > 0) {
      const set = new Set(c.devUsernames);
      const matched = allUsers.filter(u => set.has(u.username) && u.status !== 'LOCKED');
      if (matched.length > 0) return matched;
    }

    // Fallback: Lấy các lập trình viên thuộc dự án
    const p = this.getCurrentProject();
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p?.id) : (p?.members || []);
    const memberDevs = members.filter(m => m.projectRole === 'dev' || m.projectRole === 'developer');
    if (memberDevs.length > 0) {
      const pSet = new Set(memberDevs.map(m => m.username));
      const matched = allUsers.filter(u => pSet.has(u.username) && u.status !== 'LOCKED');
      if (matched.length > 0) return matched;
    }

    return allUsers.filter(u => (u.role === 'dev' || u.role === 'developer') && u.status !== 'LOCKED');
  },

  populateQuickDispatchTesters() {
    const selectEl = document.getElementById('c-quick-tester-select');
    if (!selectEl) return;
    const testers = this.getCycleParticipants();

    const currentVal = selectEl.value;
    selectEl.innerHTML = `<option value="">-- Chọn kỹ sư phụ trách --</option>` +
      testers.map(u => `<option value="${u.username}">${escapeHtml(u.name || u.username)} (${escapeHtml((u.roleTitle || 'Kỹ sư kiểm thử').replace(/\s*\([^)]*\)/g, ''))})</option>`).join('');

    if (currentVal && testers.some(u => u.username === currentVal)) {
      selectEl.value = currentVal;
    }
  },

  validateAssignmentDates(startDate, dueDate) {
    const c = this.getCurrentCycle();
    const cycleStart = c?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = c?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const formatDateVN = (dStr) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dStr;
    };

    if (!startDate || !dueDate) {
      showToast('⚠️ Vui lòng nhập đầy đủ ngày bắt đầu và hạn chót giao việc!', 'warning');
      return false;
    }

    if (startDate > dueDate) {
      showToast(`⚠️ Ngày bắt đầu (${formatDateVN(startDate)}) không thể sau hạn chót (${formatDateVN(dueDate)})!`, 'error');
      return false;
    }

    if (startDate < cycleStart) {
      showToast(`⚠️ Ngày bắt đầu (${formatDateVN(startDate)}) nằm ngoài phạm vi đợt kiểm thử! (Đợt kiểm thử bắt đầu từ ngày ${formatDateVN(cycleStart)})`, 'error');
      return false;
    }

    if (dueDate > cycleEnd) {
      showToast(`⚠️ Hạn chót (${formatDateVN(dueDate)}) vượt quá thời gian kết thúc đợt kiểm thử! (Đợt kiểm thử kết thúc vào ngày ${formatDateVN(cycleEnd)})`, 'error');
      return false;
    }

    return true;
  },

  populateStaffingControls() {
    const c = this.getCurrentCycle();
    const cycleStart = c?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = c?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const formatDateVN = (dStr) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dStr;
    };

    // 1. Badge trên thanh Quick Dispatch (Sub-tab 2)
    const badgeEl = document.getElementById('c-quick-cycle-date-badge');
    if (badgeEl) {
      badgeEl.textContent = `📅 Đợt: ${formatDateVN(cycleStart)} → ${formatDateVN(cycleEnd)}`;
      badgeEl.title = `Khoảng thời gian hiệu lực của đợt kiểm thử: Từ ngày ${formatDateVN(cycleStart)} đến ngày ${formatDateVN(cycleEnd)}`;
    }

    // 2. Badge trên Header Subnav Tab 3
    const staffBadgeEl = document.getElementById('c-staffing-cycle-date-badge');
    if (staffBadgeEl) {
      staffBadgeEl.textContent = `📅 Thời hạn đợt: ${formatDateVN(cycleStart)} ➔ ${formatDateVN(cycleEnd)}`;
      staffBadgeEl.title = `Khoảng thời gian hiệu lực kiểm thử của đợt: Từ ngày ${formatDateVN(cycleStart)} đến ngày ${formatDateVN(cycleEnd)}`;
    }

    // 3. Ràng buộc min/max trên thanh Quick Dispatch
    const quickStart = document.getElementById('c-quick-start-date');
    if (quickStart) {
      quickStart.min = cycleStart;
      quickStart.max = cycleEnd;
      if (!quickStart.value || quickStart.value < cycleStart || quickStart.value > cycleEnd) {
        quickStart.value = cycleStart;
      }
    }

    const quickDue = document.getElementById('c-quick-due-date');
    if (quickDue) {
      quickDue.min = cycleStart;
      quickDue.max = cycleEnd;
      if (!quickDue.value || quickDue.value < cycleStart || quickDue.value > cycleEnd) {
        quickDue.value = cycleEnd;
      }
    }

    // 4. Ràng buộc modal Auto-Balance
    const abwStart = document.getElementById('abw-start-date');
    if (abwStart) {
      abwStart.min = cycleStart;
      abwStart.max = cycleEnd;
      if (!abwStart.value || abwStart.value < cycleStart || abwStart.value > cycleEnd) abwStart.value = cycleStart;
    }
    const abwDue = document.getElementById('abw-due-date');
    if (abwDue) {
      abwDue.min = cycleStart;
      abwDue.max = cycleEnd;
      if (!abwDue.value || abwDue.value < cycleStart || abwDue.value > cycleEnd) abwDue.value = cycleEnd;
    }

    // 5. Ràng buộc modal Giao Nhiều Người (Batch Assign)
    const mbStart = document.getElementById('mb-start-date');
    if (mbStart) {
      mbStart.min = cycleStart;
      mbStart.max = cycleEnd;
      if (!mbStart.value || mbStart.value < cycleStart || mbStart.value > cycleEnd) mbStart.value = cycleStart;
    }
    const mbDue = document.getElementById('mb-due-date');
    if (mbDue) {
      mbDue.min = cycleStart;
      mbDue.max = cycleEnd;
      if (!mbDue.value || mbDue.value < cycleStart || mbDue.value > cycleEnd) mbDue.value = cycleEnd;
    }

    // 6. Ràng buộc modal Module Matrix
    const mmmDue = document.getElementById('mmm-global-due-date');
    if (mmmDue) {
      mmmDue.min = cycleStart;
      mmmDue.max = cycleEnd;
      if (!mmmDue.value || mmmDue.value < cycleStart || mmmDue.value > cycleEnd) mmmDue.value = cycleEnd;
    }
  },

  renderStaffingKPIs() {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgTcIds = new Set(assignments.map(a => a.tcId));

    const totalTcs = cycleTcs.length;
    const assignedTcs = cycleTcs.filter(t => asgTcIds.has(t.id)).length;
    const unassignedTcs = Math.max(0, totalTcs - assignedTcs);
    const assignPct = totalTcs > 0 ? Math.round((assignedTcs / totalTcs) * 100) : 0;

    const testers = this.getCycleParticipants();

    const totalEl = document.getElementById('c-alloc-total-tcs');
    if (totalEl) totalEl.textContent = `${totalTcs} bài`;

    const asgEl = document.getElementById('c-alloc-assigned-tcs');
    if (asgEl) asgEl.textContent = `${assignedTcs} (${assignPct}%)`;

    const unasgEl = document.getElementById('c-alloc-unassigned-tcs');
    if (unasgEl) unasgEl.textContent = `${unassignedTcs} bài`;

    const testerEl = document.getElementById('c-alloc-testers-count');
    if (testerEl) testerEl.textContent = `${testers.length} kỹ sư`;
  },

  renderStaffingModuleTree() {
    const listEl = document.getElementById('c-alloc-modules-list');
    if (!listEl) return;

    const p = getActiveProject();
    const { activeModules, cycleTcs } = this.getActiveCycleModules();
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgTcIds = new Set(assignments.map(a => a.tcId));

    const modCountBadge = document.getElementById('c-alloc-mod-count');
    if (modCountBadge) modCountBadge.textContent = `${activeModules.length} phân hệ`;

    if (this.staffingSelectedModuleId && !activeModules.some(m => m.id === this.staffingSelectedModuleId)) {
      this.staffingSelectedModuleId = '';
    }

    // Calculate stats per active module
    const modStats = activeModules.map(m => {
      const modTcs = cycleTcs.filter(t => (t.moduleId || t.module) === m.id);
      const total = modTcs.length;
      const assigned = modTcs.filter(t => asgTcIds.has(t.id)).length;
      const unassigned = total - assigned;
      const pct = total > 0 ? Math.round((assigned / total) * 100) : 0;
      return { module: m, total, assigned, unassigned, pct };
    });

    // Total stats for "Tất cả"
    const grandTotal = cycleTcs.length;
    const grandAssigned = cycleTcs.filter(t => asgTcIds.has(t.id)).length;
    const grandPct = grandTotal > 0 ? Math.round((grandAssigned / grandTotal) * 100) : 0;

    // Filter modules by search & preset
    const search = (this.staffingModSearchTerm || '').toLowerCase();
    const filteredStats = modStats.filter(item => {
      const m = item.module;
      const matchSearch = !search || m.id.toLowerCase().includes(search) || (m.name || '').toLowerCase().includes(search);
      if (!matchSearch) return false;

      if (this.staffingModFilterPreset === 'UNASSIGNED') return item.unassigned > 0;
      if (this.staffingModFilterPreset === 'COMPLETED') return item.total > 0 && item.unassigned === 0;
      return true;
    });

    const isAllSelected = !this.staffingSelectedModuleId;

    let html = `
      <div class="mod-alloc-item ${isAllSelected ? 'active' : ''}" onclick="LeadCycle.selectStaffingModule('')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
          <span style="font-weight:800; font-size:12.5px; color:var(--text-primary)">🌐 Tất cả phân hệ</span>
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary)">${grandAssigned}/${grandTotal} bài</span>
        </div>
        <div style="height:5px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex">
          <div style="width:${grandPct}%; background:${grandPct === 100 ? '#16a34a' : '#2563eb'}"></div>
        </div>
      </div>
    `;

    if (filteredStats.length === 0) {
      html += `
        <div style="text-align:center; padding:16px 8px; color:var(--text-muted); font-size:11.5px">
          ${activeModules.length === 0 ? 'Đợt chưa có kịch bản nào thuộc phân hệ.' : 'Không tìm thấy phân hệ phù hợp.'}
        </div>
      `;
    } else {
      html += filteredStats.map(item => {
        const m = item.module;
        const isSelected = this.staffingSelectedModuleId === m.id;
        const barColor = item.pct === 100 ? '#16a34a' : (item.pct > 0 ? '#2563eb' : 'var(--border)');

        return `
          <div class="mod-alloc-item ${isSelected ? 'active' : ''}" onclick="LeadCycle.selectStaffingModule('${m.id}')" title="Nhấp để lọc danh sách kịch bản phân hệ [${m.id}] ${escapeHtml(m.name)}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:3px">
              <div style="font-size:12px; font-weight:700; color:var(--text-primary); line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px">
                <span style="font-family:monospace; color:#2563eb; font-weight:800">[${m.id}]</span> ${escapeHtml(m.name)}
              </div>
              <span style="font-size:10.5px; font-weight:700; color:${item.unassigned > 0 ? '#d97706' : '#16a34a'}">
                ${item.pct}%
              </span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:var(--text-muted); margin-bottom:3px">
              <span>Đã giao: <strong>${item.assigned}/${item.total}</strong></span>
              ${item.unassigned > 0 ? `<span style="color:#d97706; font-weight:700">Còn ${item.unassigned}</span>` : `<span style="color:#16a34a">🟢 Đủ</span>`}
            </div>
            <div style="height:4px; border-radius:2px; background:var(--bg-body); overflow:hidden; display:flex">
              <div style="width:${item.pct}%; background:${barColor}"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    listEl.innerHTML = html;
  },

  filterStaffingModulesList() {
    this.staffingModSearchTerm = (document.getElementById('c-alloc-mod-search')?.value || '').trim();
    this.renderStaffingModuleTree();
  },

  setStaffingModFilterPreset(preset) {
    this.staffingModFilterPreset = preset;
    const presets = ['all', 'unassigned', 'completed'];
    presets.forEach(p => {
      const btn = document.getElementById(`btn-modfilter-${p}`);
      if (btn) {
        if (p.toUpperCase() === preset.toUpperCase()) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    this.renderStaffingModuleTree();
  },

  selectStaffingModule(modId) {
    this.staffingSelectedModuleId = modId;
    this.renderStaffingModuleTree();
    this.renderStaffingTcTable();
  },

  renderStaffingTcTable() {
    const tbody = document.getElementById('c-staffing-tc-tbody');
    if (!tbody) return;

    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const p = getActiveProject();
    const modules = typeof getModules === 'function' ? getModules(this.version, p?.id) : (p?.modules || []);

    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgMap = new Map();
    assignments.forEach(a => {
      if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
      asgMap.get(a.tcId).push(a);
    });

    // 1. Module slicing
    let filtered = cycleTcs;
    if (this.staffingSelectedModuleId) {
      filtered = filtered.filter(t => (t.moduleId || t.module) === this.staffingSelectedModuleId);
    }

    // 2. Keyword Search
    const search = (document.getElementById('c-asg-filter-search')?.value || '').trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(t =>
        (t.id || '').toLowerCase().includes(search) ||
        (t.name || t.title || '').toLowerCase().includes(search) ||
        (t.moduleId || t.module || '').toLowerCase().includes(search)
      );
    }

    // 3. Priority filter
    const prioFilter = document.getElementById('c-asg-filter-prio')?.value || '';
    if (prioFilter) {
      filtered = filtered.filter(t => (t.priority || 'P2').toUpperCase() === prioFilter.toUpperCase());
    }

    // 4. Status filter
    const statusFilter = document.getElementById('c-asg-filter-status')?.value || '';
    if (statusFilter === 'UNASSIGNED') {
      filtered = filtered.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0);
    } else if (statusFilter === 'ASSIGNED') {
      filtered = filtered.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0);
    } else if (statusFilter === 'MULTI') {
      filtered = filtered.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length >= 2);
    }

    // Update Header Counter & Label
    const countEl = document.getElementById('c-asg-selected-count');
    if (countEl) countEl.textContent = this.staffingSelectedTcIds.size;

    const shownEl = document.getElementById('c-asg-shown-count');
    if (shownEl) shownEl.textContent = filtered.length;

    const modLabelEl = document.getElementById('c-asg-current-mod-label');
    if (modLabelEl) {
      if (this.staffingSelectedModuleId) {
        const activeMod = modules.find(m => m.id === this.staffingSelectedModuleId);
        modLabelEl.textContent = `(Phân hệ: [${this.staffingSelectedModuleId}] ${activeMod?.name || ''})`;
      } else {
        modLabelEl.textContent = '(Tất cả phân hệ)';
      }
    }

    const checkAll = document.getElementById('c-asg-check-all');
    if (checkAll) {
      checkAll.checked = filtered.length > 0 && filtered.every(t => this.staffingSelectedTcIds.has(t.id));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px 16px; color:var(--text-muted)">
            <div style="font-size:28px; margin-bottom:8px">🔍</div>
            <div style="font-weight:700; font-size:13px">Không có kịch bản kiểm thử nào thỏa mãn bộ lọc hiện tại.</div>
            <div style="font-size:11.5px; margin-top:4px">Thử chọn lại phân hệ khác hoặc xóa bớt tiêu chí tìm kiếm.</div>
          </td>
        </tr>
      `;
      return;
    }

    const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

    tbody.innerHTML = filtered.map(tc => {
      const isChecked = this.staffingSelectedTcIds.has(tc.id);
      const asgs = asgMap.get(tc.id) || [];
      const prio = (tc.priority || 'P2').toUpperCase();

      let asgBadgeHtml = '';
      if (asgs.length === 0) {
        asgBadgeHtml = `<span class="badge badge-outline" style="font-size:11px; cursor:pointer" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Chưa có kỹ sư phụ trách • Nhấp để gán">⚪ Chưa giao</span>`;
      } else if (asgs.length === 1) {
        const a = asgs[0];
        const initial = (a.assigneeName || a.assigneeUsername || 'T').charAt(0).toUpperCase();
        asgBadgeHtml = `
          <div class="cycle-assignee-stack" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Phân công: ${escapeHtml(a.assigneeName || a.assigneeUsername)} • Nhấp để xem / thêm">
            <span class="avatar-sm" style="background:#2563eb">${initial}</span>
            <span style="font-size:11.5px; font-weight:700; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(a.assigneeName || a.assigneeUsername)}</span>
          </div>
        `;
      } else {
        const names = asgs.map(a => a.assigneeName || a.assigneeUsername).join(', ');
        asgBadgeHtml = `
          <div class="cycle-assignee-stack" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Đã giao cho ${asgs.length} kỹ sư: ${escapeHtml(names)}">
            <div class="avatar-stack">
              ${asgs.slice(0, 3).map((a, idx) => {
                const bg = colors[idx % colors.length];
                const initial = (a.assigneeName || a.assigneeUsername || 'T').charAt(0).toUpperCase();
                return `<span class="avatar-sm" style="background:${bg}" title="${escapeHtml(a.assigneeName || a.assigneeUsername)}">${initial}</span>`;
              }).join('')}
            </div>
            <span class="badge badge-info" style="font-size:10px; font-weight:800">👥 ${asgs.length} người</span>
          </div>
        `;
      }

      let dueText = '<span style="color:var(--text-muted)">--</span>';
      if (asgs.length === 1) {
        const s = asgs[0].startDate ? asgs[0].startDate.split('-').slice(1).reverse().join('/') : '';
        const d = asgs[0].dueDate ? asgs[0].dueDate.split('-').slice(1).reverse().join('/') : '--';
        dueText = s ? `<span style="font-size:11px; font-weight:700; color:var(--text-secondary)">${s} ➔ ${d}</span>` : `<span style="font-size:11px; font-weight:700; color:var(--text-secondary)">${d}</span>`;
      } else if (asgs.length > 1) {
        const dueDates = asgs.map(a => a.dueDate).filter(Boolean);
        const d = dueDates.length ? dueDates[0].split('-').slice(1).reverse().join('/') : '--';
        dueText = `<span style="font-size:11px; font-weight:700; color:var(--text-secondary)">${d}</span> <span style="font-size:10px; color:var(--text-muted)">(${asgs.length} ng)</span>`;
      }

      return `
        <tr style="${isChecked ? 'background:rgba(37,99,235,0.05)' : ''}">
          <td style="text-align:center">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="LeadCycle.toggleSelectStaffingTc('${tc.id}', this.checked)" style="cursor:pointer" />
          </td>
          <td style="text-align:center; font-family:monospace; font-weight:700">
            <a href="javascript:void(0)" onclick="LeadCycle.openTcConfigModal('${tc.id}')" style="color:#2563eb; text-decoration:none" title="Xem chi tiết và cấu hình phân công kỹ sư">
              ${escapeHtml(tc.id)}
            </a>
          </td>
          <td style="text-align:center">
            <span class="badge badge-nr" style="font-size:10px">${escapeHtml(tc.moduleId || tc.module || 'M01')}</span>
          </td>
          <td style="text-align:center">
            <span class="badge ${prio === 'P1' ? 'badge-fail' : (prio === 'P2' ? 'badge-p2' : 'badge-info')}" style="font-size:10px">${prio}</span>
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-primary); font-size:12px; line-height:1.3">${escapeHtml(tc.name || tc.title || '')}</div>
          </td>
          <td style="text-align:center">
            ${asgBadgeHtml}
          </td>
          <td style="text-align:center; font-size:11.5px; color:var(--text-muted)">
            ${dueText}
          </td>
          <td style="text-align:center">
            <button type="button" class="btn btn-outline btn-xs" onclick="LeadCycle.openTcConfigModal('${tc.id}')" title="Cấu hình và phân công kịch bản">
              ⚙️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleSelectAllStaffingTcs(isChecked) {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    let filtered = cycleTcs;
    if (this.staffingSelectedModuleId) {
      filtered = filtered.filter(t => (t.moduleId || t.module) === this.staffingSelectedModuleId);
    }

    const search = (document.getElementById('c-asg-filter-search')?.value || '').trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(t =>
        (t.id || '').toLowerCase().includes(search) ||
        (t.name || t.title || '').toLowerCase().includes(search) ||
        (t.moduleId || t.module || '').toLowerCase().includes(search)
      );
    }

    const prioFilter = document.getElementById('c-asg-filter-prio')?.value || '';
    if (prioFilter) {
      filtered = filtered.filter(t => (t.priority || 'P2').toUpperCase() === prioFilter.toUpperCase());
    }

    const statusFilter = document.getElementById('c-asg-filter-status')?.value || '';
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgMap = new Map();
    assignments.forEach(a => {
      if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
      asgMap.get(a.tcId).push(a);
    });

    if (statusFilter === 'UNASSIGNED') {
      filtered = filtered.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0);
    } else if (statusFilter === 'ASSIGNED') {
      filtered = filtered.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0);
    } else if (statusFilter === 'MULTI') {
      filtered = filtered.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length >= 2);
    }

    filtered.forEach(t => {
      if (isChecked) this.staffingSelectedTcIds.add(t.id);
      else this.staffingSelectedTcIds.delete(t.id);
    });

    this.renderStaffingTcTable();
  },

  toggleSelectStaffingTc(tcId, isChecked) {
    if (isChecked) this.staffingSelectedTcIds.add(tcId);
    else this.staffingSelectedTcIds.delete(tcId);
    this.renderStaffingTcTable();
  },

  selectTcsPreset(preset) {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgIds = new Set(assignments.map(a => a.tcId));

    this.staffingSelectedTcIds.clear();

    let targetTcs = cycleTcs;
    if (this.staffingSelectedModuleId) {
      targetTcs = targetTcs.filter(t => (t.moduleId || t.module) === this.staffingSelectedModuleId);
    }

    if (preset === 'ALL') {
      targetTcs.forEach(t => this.staffingSelectedTcIds.add(t.id));
      showToast(`☑️ Đã chọn tất cả ${targetTcs.length} kịch bản trong tầm nhìn!`, 'info');
    } else if (preset === 'UNASSIGNED') {
      targetTcs.forEach(t => {
        if (!asgIds.has(t.id)) this.staffingSelectedTcIds.add(t.id);
      });
      showToast(`⚪ Đã chọn ${this.staffingSelectedTcIds.size} kịch bản chưa giao!`, 'info');
    } else if (preset === 'FAILED') {
      targetTcs.forEach(t => {
        const r = typeof getResultForTc === 'function' ? getResultForTc(t.id, this.projectId) : (state.results || {})[t.id];
        const st = (r?.status || '').toUpperCase();
        if (st === 'FAIL' || st === 'FAILED') this.staffingSelectedTcIds.add(t.id);
      });
      showToast(`🔴 Đã chọn ${this.staffingSelectedTcIds.size} kịch bản bị lỗi để kiểm thử lại!`, 'info');
    } else {
      showToast('⬜ Đã bỏ chọn tất cả!', 'info');
    }

    this.renderStaffingTcTable();
  },

  dispatchQuickSelected() {
    if (this.staffingSelectedTcIds.size === 0) {
      showToast('⚠️ Vui lòng tích chọn ít nhất 1 kịch bản trong bảng để giao việc!', 'warning');
      return;
    }

    const testerSel = document.getElementById('c-quick-tester-select');
    const username = testerSel?.value;
    if (!username) {
      showToast('⚠️ Vui lòng chọn kỹ sư phụ trách trên thanh công cụ!', 'warning');
      return;
    }
    const testerName = testerSel?.options[testerSel.selectedIndex]?.text || username;

    const roleInTest = 'PRIMARY'; // Theo Phương án 1: mặc định Kỹ sư chính trên thanh nhanh
    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const startDate = document.getElementById('c-quick-start-date')?.value || cycleStart;
    const dueDate = document.getElementById('c-quick-due-date')?.value || cycleEnd;

    // RÀNG BUỘC CHẶT CHẼ: Kiểm soát không cho phép ngày bắt đầu/kết thúc vượt ra ngoài phạm vi đợt test
    if (!this.validateAssignmentDates(startDate, dueDate)) return;

    if (!state.assignments) state.assignments = [];

    let count = 0;
    this.staffingSelectedTcIds.forEach(tcId => {
      let existing = state.assignments.find(a =>
        a.projectId === this.projectId &&
        a.tcId === tcId &&
        (a.cycleId === this.cycleId || !a.cycleId) &&
        a.assigneeUsername === username
      );

      if (existing) {
        existing.roleInTest = roleInTest;
        existing.startDate = startDate;
        existing.dueDate = dueDate;
      } else {
        state.assignments.push({
          id: `asg-${Date.now()}-${tcId}-${username}-${Math.floor(Math.random() * 1000)}`,
          projectId: this.projectId,
          cycleId: this.cycleId,
          cycleName: curCycle?.name || this.cycleId,
          tcId,
          assigneeUsername: username,
          assigneeName: testerName,
          assignedBy: getCurrentUser().name || 'QA Lead',
          roleInTest,
          platform: 'ALL',
          startDate,
          dueDate,
          status: 'WIP',
          assignedAt: new Date().toISOString()
        });
      }
      count++;
    });

    const formatDateVN = (dStr) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dStr;
    };

    saveCoreState();
    showToast(`🚀 Đã phân công thành công ${count} kịch bản cho ${testerName} (${formatDateVN(startDate)} ➔ ${formatDateVN(dueDate)})!`, 'success');
    this.staffingSelectedTcIds.clear();

    this.renderStaffingKPIs();
    this.renderStaffingModuleTree();
    this.renderStaffingTcTable();
    this.renderStaffingRoster();
    this.renderExecutionTable();
  },

  assignToTesterFromRoster(username) {
    this.switchStaffingSubTab('dispatch');
    const sel = document.getElementById('c-quick-tester-select');
    if (sel) sel.value = username;
    const allUsers = typeof getUsers === 'function' ? getUsers() : [];
    const u = allUsers.find(x => x.username === username);
    showToast(`🎯 Đã chọn kỹ sư ${u?.name || username}. Hãy tích chọn kịch bản và bấm "👉 Gán Ngay"!`, 'info');
  },

  batchRevokeStaffingTcs() {
    if (this.staffingSelectedTcIds.size === 0) {
      showToast('⚠️ Vui lòng tích chọn các kịch bản cần thu hồi phân công!', 'warning');
      return;
    }

    const count = this.staffingSelectedTcIds.size;
    if (!confirm(`Bạn có chắc chắn muốn thu hồi phân công của ${count} kịch bản đang chọn trong đợt test này không?`)) {
      return;
    }

    state.assignments = (state.assignments || []).filter(a =>
      !(a.projectId === this.projectId && (a.cycleId === this.cycleId || !a.cycleId) && this.staffingSelectedTcIds.has(a.tcId))
    );

    saveCoreState();
    showToast(`🗑️ Đã thu hồi phân công của ${count} kịch bản!`, 'info');
    this.staffingSelectedTcIds.clear();

    this.renderStaffingOverview();
    this.renderExecutionTable();
  },

  // ==================== BATCH MULTI-ASSIGNEE MODAL ====================
  openBatchAssignModal() {
    // Check which set of selected TCs to use
    let targetIds = this.staffingSelectedTcIds;
    if (this.activeTab === 'testcases' && this.batchSelectedTcIds.size > 0) {
      targetIds = this.batchSelectedTcIds;
    }

    if (!targetIds || targetIds.size === 0) {
      showToast('⚠️ Vui lòng tích chọn ít nhất 1 kịch bản để giao!', 'warning');
      return;
    }

    const countEl = document.getElementById('mb-selected-count');
    if (countEl) countEl.textContent = targetIds.size;

    const testers = this.getCycleParticipants();

    const checklistEl = document.getElementById('mb-testers-checklist');
    if (checklistEl) {
      checklistEl.innerHTML = testers.map(u => `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:4px 6px; border-radius:4px" onmouseover="this.style.background='var(--bg-body)'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" class="mb-tester-cb" value="${u.username}" data-name="${escapeHtml(u.name || u.username)}" style="cursor:pointer" />
          <span style="font-weight:700; color:var(--text-primary)">${escapeHtml(u.name || u.username)}</span>
          <span style="font-size:11px; color:var(--text-muted)">(${escapeHtml((u.roleTitle || 'Kỹ sư kiểm thử').replace(/\s*\([^)]*\)/g, ''))})</span>
        </label>
      `).join('');
    }

    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const sDate = document.getElementById('mb-start-date');
    if (sDate) {
      sDate.min = cycleStart;
      sDate.max = cycleEnd;
      if (!sDate.value || sDate.value < cycleStart || sDate.value > cycleEnd) sDate.value = cycleStart;
    }
    const dDate = document.getElementById('mb-due-date');
    if (dDate) {
      dDate.min = cycleStart;
      dDate.max = cycleEnd;
      if (!dDate.value || dDate.value < cycleStart || dDate.value > cycleEnd) dDate.value = cycleEnd;
    }

    openModal('modal-batch-assign-tcs');
  },

  confirmBatchAssign() {
    let targetIds = this.staffingSelectedTcIds;
    if (this.activeTab === 'testcases' && this.batchSelectedTcIds.size > 0) {
      targetIds = this.batchSelectedTcIds;
    }

    if (!targetIds || targetIds.size === 0) {
      showToast('⚠️ Không có kịch bản nào được chọn!', 'error');
      return;
    }

    const checkedBoxes = Array.from(document.querySelectorAll('.mb-tester-cb:checked'));
    if (checkedBoxes.length === 0) {
      showToast('⚠️ Vui lòng tích chọn ít nhất 1 kỹ sư phụ trách!', 'warning');
      return;
    }

    const roleInTest = document.getElementById('mb-role-select')?.value || 'PRIMARY';
    const platform = document.getElementById('mb-platform-select')?.value || 'ALL';
    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const startDate = document.getElementById('mb-start-date')?.value || cycleStart;
    const dueDate = document.getElementById('mb-due-date')?.value || cycleEnd;
    const notes = document.getElementById('mb-notes')?.value || '';

    // RÀNG BUỘC CHẶT CHẼ: Kiểm soát không cho phép ngày bắt đầu/kết thúc vượt ra ngoài phạm vi đợt test
    if (!this.validateAssignmentDates(startDate, dueDate)) return;

    if (!state.assignments) state.assignments = [];

    let totalCreated = 0;
    checkedBoxes.forEach(cb => {
      const username = cb.value;
      const testerName = cb.getAttribute('data-name') || username;

      targetIds.forEach(tcId => {
        let existing = state.assignments.find(a =>
          a.projectId === this.projectId &&
          a.tcId === tcId &&
          (a.cycleId === this.cycleId || !a.cycleId) &&
          a.assigneeUsername === username
        );

        if (existing) {
          existing.roleInTest = roleInTest;
          existing.platform = platform;
          existing.startDate = startDate;
          existing.dueDate = dueDate;
          if (notes) existing.notes = notes;
        } else {
          state.assignments.push({
            id: `asg-${Date.now()}-${tcId}-${username}-${Math.floor(Math.random() * 1000)}`,
            projectId: this.projectId,
            cycleId: this.cycleId,
            cycleName: curCycle?.name || this.cycleId,
            tcId,
            assigneeUsername: username,
            assigneeName: testerName,
            assignedBy: getCurrentUser().name || 'QA Lead',
            roleInTest,
            platform,
            startDate,
            dueDate,
            notes,
            status: 'WIP',
            assignedAt: new Date().toISOString()
          });
        }
        totalCreated++;
      });
    });

    saveCoreState();
    closeModal('modal-batch-assign-tcs');
    showToast(`🚀 Đã phân công thành công cho ${checkedBoxes.length} kỹ sư (${targetIds.size} bài)!`, 'success');

    this.staffingSelectedTcIds.clear();
    this.batchSelectedTcIds.clear();

    this.renderStaffingOverview();
    this.renderExecutionTable();
  },

  // ==================== MASTER STRATEGY: MODULE OWNERSHIP MATRIX ====================
  openModuleMatrixModal() {
    const p = getActiveProject();
    const { activeModules, cycleTcs } = this.getActiveCycleModules();
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgTcIds = new Set(assignments.map(a => a.tcId));

    const testers = this.getCycleParticipants();

    const totalEl = document.getElementById('mmm-total-modules-count');
    if (totalEl) totalEl.textContent = activeModules.length;

    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const globalDue = document.getElementById('mmm-global-due-date');
    if (globalDue) {
      globalDue.min = cycleStart;
      globalDue.max = cycleEnd;
      if (!globalDue.value || globalDue.value < cycleStart || globalDue.value > cycleEnd) globalDue.value = cycleEnd;
    }

    const tbody = document.getElementById('mmm-modules-tbody');
    if (!tbody) return;

    if (activeModules.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted)">Đợt kiểm thử hiện tại chưa có kịch bản thuộc phân hệ nào.</td></tr>`;
      openModal('modal-module-matrix-dispatch');
      return;
    }

    const testerOptionsHtml = testers.map(u => `<option value="${u.username}">${escapeHtml(u.name || u.username)} (${escapeHtml((u.roleTitle || 'Kỹ sư kiểm thử').replace(/\s*\([^)]*\)/g, ''))})</option>`).join('');

    tbody.innerHTML = activeModules.map(m => {
      const modTcs = cycleTcs.filter(t => (t.moduleId || t.module) === m.id);
      const total = modTcs.length;
      const unassigned = modTcs.filter(t => !asgTcIds.has(t.id)).length;

      // Detect if there's already an existing primary tester for this module
      let curPrimary = '';
      if (modTcs.length > 0) {
        const firstTcAsgs = assignments.filter(a => a.tcId === modTcs[0].id && a.roleInTest === 'PRIMARY');
        if (firstTcAsgs.length > 0) curPrimary = firstTcAsgs[0].assigneeUsername;
      }

      return `
        <tr id="mmm-row-${m.id}">
          <td style="text-align:center; font-family:monospace; font-weight:700; color:#2563eb">[${m.id}]</td>
          <td>
            <div style="font-weight:700; font-size:12.5px; color:var(--text-primary)">${escapeHtml(m.name)}</div>
            <div style="font-size:11px; color:var(--text-muted)">${modTcs.length} kịch bản trong phạm vi đợt</div>
          </td>
          <td style="text-align:center; font-weight:800">${total} bài</td>
          <td style="text-align:center">
            <span id="mmm-unasg-${m.id}" class="badge ${unassigned > 0 ? 'badge-fail' : 'badge-success'}" style="font-size:11px">
              ${unassigned > 0 ? `Còn ${unassigned}` : '🟢 Đã đủ'}
            </span>
          </td>
          <td>
            <select id="mmm-lead-${m.id}" class="form-control" style="font-size:12px; padding:4px 8px">
              <option value="">-- Chọn kỹ sư chủ trì --</option>
              ${testers.map(u => `<option value="${u.username}" ${u.username === curPrimary ? 'selected' : ''}>${escapeHtml(u.name || u.username)}</option>`).join('')}
            </select>
          </td>
          <td>
            <select id="mmm-cross-${m.id}" class="form-control" style="font-size:12px; padding:4px 8px">
              <option value="">-- Không chọn --</option>
              ${testerOptionsHtml}
            </select>
          </td>
          <td style="text-align:center">
            <input type="date" id="mmm-due-${m.id}" class="form-control" value="${cycleEnd}" min="${cycleStart}" max="${cycleEnd}" style="font-size:11.5px; padding:3px 6px" />
          </td>
          <td style="text-align:center">
            <button type="button" class="btn btn-outline btn-xs" onclick="LeadCycle.saveModuleMatrixRow('${m.id}')" style="font-weight:700; color:#2563eb; border-color:#93c5fd">
              💾 Lưu
            </button>
          </td>
        </tr>
      `;
    }).join('');

    openModal('modal-module-matrix-dispatch');
  },

  applyGlobalDueDateToMatrix() {
    const val = document.getElementById('mmm-global-due-date')?.value;
    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    if (!val) {
      showToast('⚠️ Vui lòng chọn ngày hạn chót chung trước!', 'warning');
      return;
    }
    if (val < cycleStart || val > cycleEnd) {
      showToast(`⚠️ Hạn chót (${val}) nằm ngoài phạm vi đợt kiểm thử (${cycleStart} ➔ ${cycleEnd})!`, 'error');
      return;
    }
    const inputs = document.querySelectorAll('input[id^="mmm-due-"]');
    inputs.forEach(inp => { inp.value = val; });
    showToast(`📅 Đã áp dụng hạn chót ${val} cho tất cả các dòng phân hệ!`, 'info');
  },

  saveModuleMatrixRow(modId) {
    const leadSel = document.getElementById(`mmm-lead-${modId}`);
    const leadUsername = leadSel?.value;
    if (!leadUsername) {
      showToast('⚠️ Vui lòng chọn kỹ sư chủ trì cho phân hệ này!', 'warning');
      return;
    }
    const leadName = leadSel?.options[leadSel.selectedIndex]?.text || leadUsername;

    const crossSel = document.getElementById(`mmm-cross-${modId}`);
    const crossUsername = crossSel?.value;
    const crossName = crossSel?.options[crossSel.selectedIndex]?.text || crossUsername;

    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const dueDate = document.getElementById(`mmm-due-${modId}`)?.value || cycleEnd;

    // RÀNG BUỘC CHẶT CHẼ: Kiểm soát không cho phép ngày bắt đầu/kết thúc vượt ra ngoài phạm vi đợt test
    if (!this.validateAssignmentDates(cycleStart, dueDate)) return;

    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const modTcs = cycleTcs.filter(t => (t.moduleId || t.module) === modId);

    if (modTcs.length === 0) {
      showToast('ℹ️ Phân hệ này không có kịch bản nào trong đợt kiểm thử.', 'info');
      return;
    }

    if (!state.assignments) state.assignments = [];

    modTcs.forEach(tc => {
      // 1. Primary assignee
      let exPrimary = state.assignments.find(a => a.projectId === this.projectId && a.tcId === tc.id && (a.cycleId === this.cycleId || !a.cycleId) && a.assigneeUsername === leadUsername);
      if (exPrimary) {
        exPrimary.roleInTest = 'PRIMARY';
        exPrimary.startDate = cycleStart;
        exPrimary.dueDate = dueDate;
      } else {
        state.assignments.push({
          id: `asg-${Date.now()}-${tc.id}-${leadUsername}-${Math.floor(Math.random() * 1000)}`,
          projectId: this.projectId,
          cycleId: this.cycleId,
          cycleName: curCycle?.name || this.cycleId,
          tcId: tc.id,
          assigneeUsername: leadUsername,
          assigneeName: leadName,
          assignedBy: getCurrentUser().name || 'QA Lead (Matrix)',
          roleInTest: 'PRIMARY',
          platform: 'ALL',
          startDate: cycleStart,
          dueDate,
          status: 'WIP',
          assignedAt: new Date().toISOString()
        });
      }

      // 2. Cross-check assignee if specified and different
      if (crossUsername && crossUsername !== leadUsername) {
        let exCross = state.assignments.find(a => a.projectId === this.projectId && a.tcId === tc.id && (a.cycleId === this.cycleId || !a.cycleId) && a.assigneeUsername === crossUsername);
        if (exCross) {
          exCross.roleInTest = 'CROSS_CHECK';
          exCross.startDate = cycleStart;
          exCross.dueDate = dueDate;
        } else {
          state.assignments.push({
            id: `asg-${Date.now()}-${tc.id}-${crossUsername}-${Math.floor(Math.random() * 1000)}`,
            projectId: this.projectId,
            cycleId: this.cycleId,
            cycleName: curCycle?.name || this.cycleId,
            tcId: tc.id,
            assigneeUsername: crossUsername,
            assigneeName: crossName,
            assignedBy: getCurrentUser().name || 'QA Lead (Matrix Cross)',
            roleInTest: 'CROSS_CHECK',
            platform: 'ALL',
            startDate: cycleStart,
            dueDate,
            status: 'WIP',
            assignedAt: new Date().toISOString()
          });
        }
      }
    });

    saveCoreState();

    // Update row badge
    const unasgBadge = document.getElementById(`mmm-unasg-${modId}`);
    if (unasgBadge) {
      unasgBadge.className = 'badge badge-success';
      unasgBadge.textContent = '🟢 Đã đủ';
    }

    showToast(`✅ Đã giao trọn gói ${modTcs.length} bài phân hệ [${modId}] cho ${leadName}!`, 'success');
    this.renderStaffingOverview();
  },

  saveAllModuleMatrixAssignments() {
    const p = getActiveProject();
    const { activeModules, cycleTcs } = this.getActiveCycleModules();
    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    // RÀNG BUỘC CHẶT CHẼ: Kiểm tra hợp lệ thời hạn tất cả các phân hệ trước khi lưu
    for (const m of activeModules) {
      const leadSel = document.getElementById(`mmm-lead-${m.id}`);
      if (leadSel?.value) {
        const dueDate = document.getElementById(`mmm-due-${m.id}`)?.value || cycleEnd;
        if (!this.validateAssignmentDates(cycleStart, dueDate)) return;
      }
    }

    if (!state.assignments) state.assignments = [];

    let countAssignedMods = 0;
    let countAssignedTcs = 0;

    activeModules.forEach(m => {
      const leadSel = document.getElementById(`mmm-lead-${m.id}`);
      const leadUsername = leadSel?.value;
      if (!leadUsername) return; // Skip unassigned rows

      const leadName = leadSel?.options[leadSel.selectedIndex]?.text || leadUsername;
      const crossSel = document.getElementById(`mmm-cross-${m.id}`);
      const crossUsername = crossSel?.value;
      const crossName = crossSel?.options[crossSel.selectedIndex]?.text || crossUsername;

      const dueDate = document.getElementById(`mmm-due-${m.id}`)?.value || cycleEnd;
      const modTcs = cycleTcs.filter(t => (t.moduleId || t.module) === m.id);

      modTcs.forEach(tc => {
        let exPrimary = state.assignments.find(a => a.projectId === this.projectId && a.tcId === tc.id && (a.cycleId === this.cycleId || !a.cycleId) && a.assigneeUsername === leadUsername);
        if (exPrimary) {
          exPrimary.roleInTest = 'PRIMARY';
          exPrimary.startDate = cycleStart;
          exPrimary.dueDate = dueDate;
        } else {
          state.assignments.push({
            id: `asg-${Date.now()}-${tc.id}-${leadUsername}-${Math.floor(Math.random() * 1000)}`,
            projectId: this.projectId,
            cycleId: this.cycleId,
            cycleName: curCycle?.name || this.cycleId,
            tcId: tc.id,
            assigneeUsername: leadUsername,
            assigneeName: leadName,
            assignedBy: getCurrentUser().name || 'QA Lead (Batch Matrix)',
            roleInTest: 'PRIMARY',
            platform: 'ALL',
            startDate: cycleStart,
            dueDate,
            status: 'WIP',
            assignedAt: new Date().toISOString()
          });
        }

        if (crossUsername && crossUsername !== leadUsername) {
          let exCross = state.assignments.find(a => a.projectId === this.projectId && a.tcId === tc.id && (a.cycleId === this.cycleId || !a.cycleId) && a.assigneeUsername === crossUsername);
          if (exCross) {
            exCross.roleInTest = 'CROSS_CHECK';
            exCross.startDate = cycleStart;
            exCross.dueDate = dueDate;
          } else {
            state.assignments.push({
              id: `asg-${Date.now()}-${tc.id}-${crossUsername}-${Math.floor(Math.random() * 1000)}`,
              projectId: this.projectId,
              cycleId: this.cycleId,
              cycleName: curCycle?.name || this.cycleId,
              tcId: tc.id,
              assigneeUsername: crossUsername,
              assigneeName: crossName,
              assignedBy: getCurrentUser().name || 'QA Lead (Batch Matrix Cross)',
              roleInTest: 'CROSS_CHECK',
              platform: 'ALL',
              startDate: cycleStart,
              dueDate,
              status: 'WIP',
              assignedAt: new Date().toISOString()
            });
          }
        }
        countAssignedTcs++;
      });

      countAssignedMods++;
    });

    if (countAssignedMods === 0) {
      showToast('⚠️ Bạn chưa chọn kỹ sư chủ trì cho phân hệ nào!', 'warning');
      return;
    }

    saveCoreState();
    closeModal('modal-module-matrix-dispatch');
    showToast(`🎉 Đã giao trọn gói ${countAssignedMods} phân hệ (${countAssignedTcs} kịch bản) thành công!`, 'success');

    this.renderStaffingOverview();
    this.renderExecutionTable();
  },

  // ==================== MASTER STRATEGY: SMART AUTO-BALANCE WIZARD ====================
  openAutoBalanceWizard() {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgTcIds = new Set(assignments.map(a => a.tcId));
    const unassigned = cycleTcs.filter(t => !asgTcIds.has(t.id));

    const unasgCountEl = document.getElementById('abw-unassigned-count');
    if (unasgCountEl) unasgCountEl.textContent = unassigned.length;

    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const sDate = document.getElementById('abw-start-date');
    if (sDate) {
      sDate.min = cycleStart;
      sDate.max = cycleEnd;
      if (!sDate.value || sDate.value < cycleStart || sDate.value > cycleEnd) sDate.value = cycleStart;
    }
    const dDate = document.getElementById('abw-due-date');
    if (dDate) {
      dDate.min = cycleStart;
      dDate.max = cycleEnd;
      if (!dDate.value || dDate.value < cycleStart || dDate.value > cycleEnd) dDate.value = cycleEnd;
    }

    this.updateAutoBalancePreview();
    openModal('modal-autobalance-wizard');
  },

  updateAutoBalancePreview() {
    const tbody = document.getElementById('abw-preview-tbody');
    if (!tbody) return;

    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgTcIds = new Set(assignments.map(a => a.tcId));
    const unassigned = cycleTcs.filter(t => !asgTcIds.has(t.id));

    const testers = this.getCycleParticipants();

    if (testers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:#dc2626">Dự án chưa có kiểm thử viên nào!</td></tr>`;
      return;
    }

    const strategy = document.querySelector('input[name="abw-strategy"]:checked')?.value || 'ROUND_ROBIN';

    // Simulate assignment simulation
    const simCounts = {};
    testers.forEach(u => {
      const cur = assignments.filter(a => a.assigneeUsername === u.username).length;
      simCounts[u.username] = { current: cur, added: 0 };
    });

    if (strategy === 'ROUND_ROBIN') {
      // Sort testers by current load ascending, then round robin
      const sorted = [...testers].sort((a, b) => simCounts[a.username].current - simCounts[b.username].current);
      unassigned.forEach((tc, idx) => {
        const u = sorted[idx % sorted.length];
        simCounts[u.username].added++;
      });
    } else if (strategy === 'MODULE_AFFINITY') {
      // Group unassigned by module
      const modGroups = {};
      unassigned.forEach(tc => {
        const mid = tc.moduleId || tc.module || 'GEN';
        if (!modGroups[mid]) modGroups[mid] = [];
        modGroups[mid].push(tc);
      });

      // Assign each module group to tester with lowest current + added
      Object.values(modGroups).forEach(group => {
        let bestTester = testers[0];
        let minLoad = simCounts[bestTester.username].current + simCounts[bestTester.username].added;
        testers.forEach(u => {
          const load = simCounts[u.username].current + simCounts[u.username].added;
          if (load < minLoad) {
            minLoad = load;
            bestTester = u;
          }
        });
        simCounts[bestTester.username].added += group.length;
      });
    } else if (strategy === 'DUAL_CRITICAL') {
      const sorted = [...testers].sort((a, b) => simCounts[a.username].current - simCounts[b.username].current);
      unassigned.forEach((tc, idx) => {
        const isP1 = (tc.priority || 'P2').toUpperCase() === 'P1';
        const primary = sorted[idx % sorted.length];
        simCounts[primary.username].added++;

        if (isP1 && sorted.length > 1) {
          const secondary = sorted[(idx + 1) % sorted.length];
          simCounts[secondary.username].added++;
        }
      });
    }

    const totalAfterAll = Object.values(simCounts).reduce((acc, c) => acc + c.current + c.added, 0);
    const avgAfter = Math.round(totalAfterAll / testers.length);

    tbody.innerHTML = testers.map(u => {
      const cur = simCounts[u.username].current;
      const add = simCounts[u.username].added;
      const total = cur + add;
      const ratio = avgAfter > 0 ? Math.round((total / avgAfter) * 100) : 100;

      let badge = `<span class="badge badge-success" style="font-size:10px">🟢 Cân đối (${ratio}%)</span>`;
      if (ratio > 115) badge = `<span class="badge badge-fail" style="font-size:10px">🔴 Cao (${ratio}%)</span>`;
      else if (ratio < 80) badge = `<span class="badge badge-info" style="font-size:10px">🟠 Thấp (${ratio}%)</span>`;

      return `
        <tr>
          <td>
            <div style="font-weight:700; font-size:12.5px; color:var(--text-primary)">${escapeHtml(u.name || u.username)}</div>
            <div style="font-size:10.5px; color:var(--text-muted)">@${escapeHtml(u.username)} • ${escapeHtml((u.roleTitle || 'Kỹ sư kiểm thử').replace(/\s*\([^)]*\)/g, ''))}</div>
          </td>
          <td style="text-align:center; font-weight:600">${cur} bài</td>
          <td style="text-align:center; font-weight:800; color:#2563eb">+${add} bài</td>
          <td style="text-align:center; font-weight:800; font-size:13px">${total} bài</td>
          <td style="text-align:center">${badge}</td>
        </tr>
      `;
    }).join('');
  },

  applyAutoBalancePlan() {
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const asgTcIds = new Set(assignments.map(a => a.tcId));
    const unassigned = cycleTcs.filter(t => !asgTcIds.has(t.id));

    if (unassigned.length === 0) {
      showToast('ℹ️ Toàn bộ kịch bản trong đợt đã được phân công đầy đủ!', 'info');
      closeModal('modal-autobalance-wizard');
      return;
    }

    const testers = this.getCycleParticipants();

    if (testers.length === 0) {
      showToast('⚠️ Dự án chưa có kỹ sư kiểm thử nào!', 'error');
      return;
    }

    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const strategy = document.querySelector('input[name="abw-strategy"]:checked')?.value || 'ROUND_ROBIN';
    const startDate = document.getElementById('abw-start-date')?.value || cycleStart;
    const dueDate = document.getElementById('abw-due-date')?.value || cycleEnd;

    // RÀNG BUỘC CHẶT CHẼ: Kiểm soát không cho phép ngày bắt đầu/kết thúc vượt ra ngoài phạm vi đợt test
    if (!this.validateAssignmentDates(startDate, dueDate)) return;

    if (!state.assignments) state.assignments = [];

    // Track active loads
    const currentLoads = {};
    testers.forEach(u => {
      currentLoads[u.username] = assignments.filter(a => a.assigneeUsername === u.username).length;
    });

    let assignedRecordsCount = 0;

    if (strategy === 'ROUND_ROBIN') {
      const sortedTesters = [...testers].sort((a, b) => currentLoads[a.username] - currentLoads[b.username]);
      unassigned.forEach((tc, idx) => {
        const u = sortedTesters[idx % sortedTesters.length];
        state.assignments.push({
          id: `asg-${Date.now()}-${tc.id}-${u.username}-${Math.floor(Math.random() * 1000)}`,
          projectId: this.projectId,
          cycleId: this.cycleId,
          cycleName: curCycle?.name || this.cycleId,
          tcId: tc.id,
          assigneeUsername: u.username,
          assigneeName: u.name || u.username,
          assignedBy: getCurrentUser().name || 'QA Lead (Auto-Balance)',
          roleInTest: 'PRIMARY',
          platform: 'ALL',
          startDate,
          dueDate,
          status: 'WIP',
          assignedAt: new Date().toISOString()
        });
        currentLoads[u.username]++;
        assignedRecordsCount++;
      });
    } else if (strategy === 'MODULE_AFFINITY') {
      const modGroups = {};
      unassigned.forEach(tc => {
        const mid = tc.moduleId || tc.module || 'GEN';
        if (!modGroups[mid]) modGroups[mid] = [];
        modGroups[mid].push(tc);
      });

      Object.values(modGroups).forEach(group => {
        let bestTester = testers[0];
        let minLoad = currentLoads[bestTester.username];
        testers.forEach(u => {
          if (currentLoads[u.username] < minLoad) {
            minLoad = currentLoads[u.username];
            bestTester = u;
          }
        });

        group.forEach(tc => {
          state.assignments.push({
            id: `asg-${Date.now()}-${tc.id}-${bestTester.username}-${Math.floor(Math.random() * 1000)}`,
            projectId: this.projectId,
            cycleId: this.cycleId,
            cycleName: curCycle?.name || this.cycleId,
            tcId: tc.id,
            assigneeUsername: bestTester.username,
            assigneeName: bestTester.name || bestTester.username,
            assignedBy: getCurrentUser().name || 'QA Lead (Module-Grouping)',
            roleInTest: 'PRIMARY',
            platform: 'ALL',
            startDate,
            dueDate,
            status: 'WIP',
            assignedAt: new Date().toISOString()
          });
          currentLoads[bestTester.username]++;
          assignedRecordsCount++;
        });
      });
    } else if (strategy === 'DUAL_CRITICAL') {
      const sortedTesters = [...testers].sort((a, b) => currentLoads[a.username] - currentLoads[b.username]);
      unassigned.forEach((tc, idx) => {
        const isP1 = (tc.priority || 'P2').toUpperCase() === 'P1';
        const primary = sortedTesters[idx % sortedTesters.length];

        state.assignments.push({
          id: `asg-${Date.now()}-${tc.id}-${primary.username}-${Math.floor(Math.random() * 1000)}`,
          projectId: this.projectId,
          cycleId: this.cycleId,
          cycleName: curCycle?.name || this.cycleId,
          tcId: tc.id,
          assigneeUsername: primary.username,
          assigneeName: primary.name || primary.username,
          assignedBy: getCurrentUser().name || 'QA Lead (Auto Dual P1)',
          roleInTest: 'PRIMARY',
          platform: 'ALL',
          startDate,
          dueDate,
          status: 'WIP',
          assignedAt: new Date().toISOString()
        });
        currentLoads[primary.username]++;
        assignedRecordsCount++;

        if (isP1 && sortedTesters.length > 1) {
          const secondary = sortedTesters[(idx + 1) % sortedTesters.length];
          state.assignments.push({
            id: `asg-${Date.now()}-${tc.id}-${secondary.username}-${Math.floor(Math.random() * 1000)}`,
            projectId: this.projectId,
            cycleId: this.cycleId,
            cycleName: curCycle?.name || this.cycleId,
            tcId: tc.id,
            assigneeUsername: secondary.username,
            assigneeName: secondary.name || secondary.username,
            assignedBy: getCurrentUser().name || 'QA Lead (Auto Dual Cross)',
            roleInTest: 'CROSS_CHECK',
            platform: 'ALL',
            startDate,
            dueDate,
            status: 'WIP',
            assignedAt: new Date().toISOString()
          });
          currentLoads[secondary.username]++;
          assignedRecordsCount++;
        }
      });
    }

    saveCoreState();
    closeModal('modal-autobalance-wizard');
    showToast(`🎯 Phân bổ tự động hoàn tất! Đã tạo ${assignedRecordsCount} lượt phân công cho ${unassigned.length} bài.`, 'success');

    this.renderStaffingOverview();
    this.renderExecutionTable();
  },

  // ==================== SECTION 3: ROSTER MONITORING TABLE ====================
  renderStaffingRoster() {
    const tbody = document.getElementById('c-roster-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const testers = this.getCycleParticipants();

    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p?.id) : [];

    const totalCycleTcs = cycleTcs.length || 1;
    const avgPerTester = Math.round(totalCycleTcs / Math.max(1, testers.length));

    if (testers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:18px; color:var(--text-muted)">Chưa có kỹ sư kiểm thử nào trong dự án.</td></tr>`;
      return;
    }

    tbody.innerHTML = testers.map(u => {
      const userAsgs = assignments.filter(a => a.assigneeUsername === u.username);
      const assignedCount = userAsgs.length;

      let executed = 0, passed = 0;
      userAsgs.forEach(a => {
        const r = typeof getResultForTc === 'function' ? getResultForTc(a.tcId, p?.id) : (state.results || {})[a.tcId];
        const st = (r?.status || '').toUpperCase();
        if (st && st !== 'UNTESTED') executed++;
        if (st === 'PASS' || st === 'PASSED') passed++;
      });

      const userBugs = allDefects.filter(d => (d.reportedBy === u.username || d.tester === u.username) && (d.cycleId === this.cycleId || !d.cycleId)).length;
      const completionRate = assignedCount > 0 ? Math.round((executed / assignedCount) * 100) : 0;

      const workloadRatio = avgPerTester > 0 ? Math.round((assignedCount / avgPerTester) * 100) : 100;
      let badgeClass = 'cycle-roster-normal';
      let badgeText = `🟢 Cân bằng (${workloadRatio}%)`;
      if (workloadRatio > 115) {
        badgeClass = 'cycle-roster-overload';
        badgeText = `🔴 Quá tải (${workloadRatio}%)`;
      } else if (workloadRatio < 70 && assignedCount > 0) {
        badgeClass = 'cycle-roster-warning';
        badgeText = `🟠 Tải thấp (${workloadRatio}%)`;
      } else if (assignedCount === 0) {
        badgeClass = 'cycle-roster-warning';
        badgeText = `⚪ Chưa có việc`;
      }

      return `
        <tr>
          <td>
            <div style="font-weight:800; font-size:13.5px; color:var(--text-primary)">${escapeHtml(u.name || u.username)}</div>
            <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(u.username)}</div>
          </td>
          <td style="text-align:center">
            <span class="badge badge-info" style="font-size:10.5px">${escapeHtml((u.roleTitle || 'Kỹ sư kiểm thử').replace(/\s*\([^)]*\)/g, ''))}</span>
          </td>
          <td style="text-align:center; font-weight:800">${assignedCount} bài</td>
          <td style="text-align:center">${executed}/${assignedCount}</td>
          <td>
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:2px">
              <span style="color:#16a34a">${completionRate}%</span>
              <span style="color:var(--text-muted)">${executed} bài</span>
            </div>
            <div style="height:6px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex">
              <div style="width:${completionRate}%; background:#16a34a"></div>
            </div>
          </td>
          <td style="text-align:center; font-weight:800; color:#dc2626">${userBugs} lỗi</td>
          <td style="text-align:center">
            <span class="cycle-roster-badge ${badgeClass}">${badgeText}</span>
          </td>
          <td style="text-align:center">
            <div style="display:flex; justify-content:center; gap:6px">
              <button type="button" class="btn btn-primary btn-xs" onclick="LeadCycle.assignToTesterFromRoster('${u.username}')" style="font-weight:700" title="Giao thêm kịch bản cho kỹ sư này">
                👉 Giao bài
              </button>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadCycle.filterStaffingByTester('${u.username}')" title="Xem các bài đang phụ trách ở màn hình thực thi">
                🔍 Xem bài
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterStaffingByTester(username) {
    const testerSelect = document.getElementById('c-filter-tester');
    if (testerSelect) testerSelect.value = username;
    this.switchCycleTab('testcases');
    this.onFilterChange();
  },

  // ==================== TAB 4: SETTINGS & EXIT CRITERIA ====================
  populateCycleSettings() {
    const c = this.getCurrentCycle();
    if (!c) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? '';
    };

    setVal('cset-code', c.code || c.id);
    setVal('cset-name', c.name || `Đợt kiểm thử ${c.id}`);
    setVal('cset-suite', c.suite || c.targetSuite || 'REGRESSION');
    setVal('cset-status', c.status || 'ACTIVE');
    setVal('cset-start-date', c.startDate || new Date().toISOString().slice(0, 10));
    setVal('cset-end-date', c.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setVal('cset-desc', c.desc || c.objectives || '');

    const qg = c.exitCriteria || { minPassRate: 90, maxP1: 0, maxP2: 2 };
    setVal('cset-exit-pass', qg.minPassRate ?? 90);
    setVal('cset-exit-p1', qg.maxP1 ?? 0);
    setVal('cset-exit-p2', qg.maxP2 ?? 2);

    // Badges in header
    const codeBadge = document.getElementById('c-settings-code-badge');
    if (codeBadge) codeBadge.textContent = c.code || c.id;
    const stBadge = document.getElementById('c-settings-status-badge');
    if (stBadge) stBadge.textContent = c.status || 'ACTIVE';

    // Scope summary
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const p = getActiveProject();
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.version) : [];
    const scopeSummary = document.getElementById('cset-scope-summary');
    if (scopeSummary) scopeSummary.textContent = `${cycleTcs.length} / ${verTcs.length} bài`;

    this.evalExitCriteriaUI();
  },

  evalExitCriteriaUI() {
    const p = getActiveProject();
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    const totalTcs = cycleTcs.length || 1;

    let passCount = 0, failCount = 0, blockedCount = 0;
    cycleTcs.forEach(tc => {
      const r = typeof getResultForTc === 'function' ? getResultForTc(tc.id, p?.id) : (state.results || {})[tc.id];
      const st = (r?.status || '').toUpperCase();
      if (st === 'PASS' || st === 'PASSED') passCount++;
      else if (st === 'FAIL' || st === 'FAILED') failCount++;
      else if (st === 'BLOCKED') blockedCount++;
    });

    const executed = passCount + failCount + blockedCount;
    const curPassRate = executed > 0 ? Math.round((passCount / executed) * 1000) / 10 : 0;

    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p?.id) : [];
    const cycleDefects = allDefects.filter(d => (d.cycleId === this.cycleId || !d.cycleId) && (d.defectStatus !== 'Closed'));
    
    let curP1 = 0, curP2 = 0;
    cycleDefects.forEach(d => {
      const sev = (d.severity || d.priority || 'P3').toUpperCase();
      if (sev === 'P1' || sev === 'BLOCKER') curP1++;
      else if (sev === 'P2' || sev === 'CRITICAL') curP2++;
    });

    const targetPass = parseFloat(document.getElementById('cset-exit-pass')?.value || '90');
    const targetP1 = parseInt(document.getElementById('cset-exit-p1')?.value || '0', 10);
    const targetP2 = parseInt(document.getElementById('cset-exit-p2')?.value || '2', 10);

    const passOk = curPassRate >= targetPass;
    const p1Ok = curP1 <= targetP1;
    const p2Ok = curP2 <= targetP2;

    const elPass = document.getElementById('cset-eval-pass');
    if (elPass) {
      elPass.className = `badge ${passOk ? 'badge-pass' : 'badge-fail'}`;
      elPass.textContent = passOk ? `Đạt: ${curPassRate}%` : `Hiện tại: ${curPassRate}%`;
    }

    const elP1 = document.getElementById('cset-eval-p1');
    if (elP1) {
      elP1.className = `badge ${p1Ok ? 'badge-pass' : 'badge-fail'}`;
      elP1.textContent = p1Ok ? `Đạt: ${curP1} lỗi` : `Vượt trần: ${curP1} lỗi`;
    }

    const elP2 = document.getElementById('cset-eval-p2');
    if (elP2) {
      elP2.className = `badge ${p2Ok ? 'badge-pass' : 'badge-fail'}`;
      elP2.textContent = p2Ok ? `Đạt: ${curP2} lỗi` : `Vượt trần: ${curP2} lỗi`;
    }

    const overallBadge = document.getElementById('cset-exit-status-badge');
    if (overallBadge) {
      if (passOk && p1Ok && p2Ok) {
        overallBadge.innerHTML = `<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:11px">🟢 ĐỦ ĐIỀU KIỆN ĐÓNG ĐỢT</span>`;
      } else {
        overallBadge.innerHTML = `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:800; font-size:11px">⚠️ CHƯA ĐỦ ĐIỀU KIỆN ĐÓNG ĐỢT</span>`;
      }
    }
  },

  saveCycleSettings() {
    const p = getActiveProject();
    if (!p) return;

    const code = (document.getElementById('cset-code')?.value || '').trim();
    const name = (document.getElementById('cset-name')?.value || '').trim();
    const suite = document.getElementById('cset-suite')?.value || 'REGRESSION';
    const status = document.getElementById('cset-status')?.value || 'ACTIVE';
    const startDate = document.getElementById('cset-start-date')?.value || '';
    const endDate = document.getElementById('cset-end-date')?.value || '';
    const desc = (document.getElementById('cset-desc')?.value || '').trim();

    const minPassRate = parseFloat(document.getElementById('cset-exit-pass')?.value || '90');
    const maxP1 = parseInt(document.getElementById('cset-exit-p1')?.value || '0', 10);
    const maxP2 = parseInt(document.getElementById('cset-exit-p2')?.value || '2', 10);

    if (!code || !name) {
      showToast('⚠️ Vui lòng điền Mã và Tên đợt test!', 'error');
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      showToast(`⚠️ Ngày bắt đầu đợt test (${startDate}) không thể sau hạn chót đóng đợt (${endDate})!`, 'error');
      return;
    }

    if (!p.testCycles) p.testCycles = [];
    let c = p.testCycles.find(x => x.id === this.cycleId);
    if (!c) {
      c = { id: this.cycleId, projectId: p.id, version: this.version };
      p.testCycles.push(c);
    }

    c.code = code;
    c.name = name;
    c.suite = suite;
    c.status = status;
    c.startDate = startDate;
    c.endDate = endDate;
    c.desc = desc;
    c.exitCriteria = { minPassRate, maxP1, maxP2 };

    saveCoreState();
    showToast('✅ Đã lưu cấu hình đợt test & tiêu chuẩn hoàn thành!', 'success');
    this.populateStaffingControls();
    this.renderCycleHeaderStrip();
    this.renderCycleOverview();
    LeadContext.renderCompactProjectBar();
  },

  toggleLockCycle() {
    const curStatus = document.getElementById('cset-status')?.value || 'ACTIVE';
    const nextStatus = (curStatus === 'COMPLETED' || curStatus === 'PAUSED') ? 'ACTIVE' : 'COMPLETED';
    const select = document.getElementById('cset-status');
    if (select) select.value = nextStatus;
    this.saveCycleSettings();
    showToast(nextStatus === 'COMPLETED' ? '🔒 Đã đóng băng kết quả đợt test!' : '🟢 Đã mở lại trạng thái kiểm thử tích cực!', 'info');
  },

  openCloneModal() {
    const c = this.getCurrentCycle();
    const srcEl = document.getElementById('mcc-source-display');
    if (srcEl) srcEl.value = `${c?.code || c?.id} — ${c?.name}`;
    const codeEl = document.getElementById('mcc-new-code');
    if (codeEl) codeEl.value = `ROUND-${parseInt((c?.code || '').replace(/\D/g, '') || '1', 10) + 1}`;
    const nameEl = document.getElementById('mcc-new-name');
    if (nameEl) nameEl.value = `Đợt tiếp theo — Re-test sau sửa lỗi`;
    openModal('modal-clone-cycle');
  },

  confirmCloneCycle() {
    const p = getActiveProject();
    if (!p) return;

    const newCode = (document.getElementById('mcc-new-code')?.value || '').trim();
    const newName = (document.getElementById('mcc-new-name')?.value || '').trim();
    const newSuite = document.getElementById('mcc-new-suite')?.value || 'REGRESSION';
    const scopeOpt = document.querySelector('input[name="mcc-scope-opt"]:checked')?.value || 'all';
    const copyStaff = document.getElementById('mcc-copy-staff')?.checked;

    if (!newCode || !newName) {
      showToast('⚠️ Vui lòng nhập Mã và Tên đợt test mới!', 'error');
      return;
    }

    const curCycle = this.getCurrentCycle();
    const newId = `CYC-${Date.now().toString().slice(-6)}`;

    // Build scope
    let newScope = [];
    if (scopeOpt === 'failed_only') {
      const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
      cycleTcs.forEach(t => {
        const r = typeof getResultForTc === 'function' ? getResultForTc(t.id, p.id) : (state.results || {})[t.id];
        const st = (r?.status || '').toUpperCase();
        if (st === 'FAIL' || st === 'FAILED') newScope.push(t.id);
      });
      if (newScope.length === 0) newScope = curCycle?.scopeTcIds || [];
    } else {
      newScope = curCycle?.scopeTcIds || [];
    }

    const newCycleObj = {
      id: newId,
      projectId: p.id,
      version: this.version,
      code: newCode,
      name: newName,
      suite: newSuite,
      status: 'ACTIVE',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      scopeTcIds: newScope,
      testCaseIds: newScope,
      exitCriteria: { minPassRate: 90, maxP1: 0, maxP2: 2 }
    };

    if (!p.testCycles) p.testCycles = [];
    p.testCycles.push(newCycleObj);

    if (copyStaff) {
      const assignments = (state.assignments || []).filter(a => a.projectId === p.id && a.cycleId === this.cycleId);
      assignments.forEach(a => {
        if (newScope.includes(a.tcId)) {
          state.assignments.push({
            ...a,
            id: `asg-${Date.now()}-${a.tcId}`,
            cycleId: newId,
            cycleName: newName,
            status: 'WIP'
          });
        }
      });
    }

    saveCoreState();
    closeModal('modal-clone-cycle');
    showToast(`🚀 Đã nhân bản thành công đợt test mới [${newCode}]!`, 'success');

    // Chuyển sang đợt mới
    window.location.href = `cycle.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.version)}&cycleId=${encodeURIComponent(newId)}`;
  },

  deleteCycle() {
    const p = getActiveProject();
    if (!p) return;

    const cycId = this.cycleId;
    const curCycle = this.getCurrentCycle();
    const cycleName = curCycle ? (curCycle.name || curCycle.id) : cycId;

    const executeDelete = () => {
      try {
        if (typeof deleteTestCycle === 'function') {
          deleteTestCycle(cycId);
        } else {
          p.testCycles = (p.testCycles || []).filter(c => c.id !== cycId);
          state.assignments = (state.assignments || []).filter(a => a.cycleId !== cycId);
          saveCoreState();
          if (window.pushCyclesToCloud) window.pushCyclesToCloud(state.testCycles);
        }

        showToast('🗑️ Đã xóa đợt test thành công!', 'success');
        setTimeout(() => {
          window.location.href = `version.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.version)}&tab=cycles`;
        }, 300);
      } catch (err) {
        showToast(`❌ Lỗi khi xóa đợt test: ${err.message}`, 'error');
      }
    };

    const scopeCount = (curCycle?.scopeTcIds || curCycle?.testCaseIds || []).length;
    const assignedTesters = (curCycle?.assignedTesters || []).length;
    const assignedDevs = (curCycle?.assignedDevs || []).length;

    if (typeof showConfirmDeleteModal === 'function') {
      showConfirmDeleteModal({
        title: 'XÁC NHẬN XÓA ĐỢT KIỂM THỬ',
        subtitle: 'Thao tác cấp cao • Loại bỏ đợt test khỏi không gian chiến dịch',
        itemBadge: '🎯 ĐỢT KIỂM THỬ',
        itemName: cycleName,
        projectTitle: `${p.name || p.code || 'Dự án'} • Phiên bản [${this.version}]`,
        impactStats: [
          { label: 'Kịch bản trong đợt', value: scopeCount > 0 ? `${scopeCount} bài` : 'Toàn bộ', icon: '📄', color: '#2563eb' },
          { label: 'Kỹ sư thực thi', value: (assignedTesters + assignedDevs) > 0 ? `${assignedTesters + assignedDevs} người` : '0 người', icon: '👥', color: '#8b5cf6' },
          { label: 'Tiến độ & Kết quả', value: 'Dọn dẹp', icon: '⚡', color: '#ef4444' },
          { label: 'Database Cloud', value: 'Đồng bộ xóa', icon: '☁️', color: '#16a34a' }
        ],
        warningText: `Cảnh báo: Toàn bộ phân công và kết quả thực thi của đợt test [${cycleName}] sẽ bị xóa vĩnh viễn khỏi hệ thống và cơ sở dữ liệu Cloud.\n\nThao tác này không thể hoàn tác!`,
        confirmText: '🗑️ Xác nhận xóa vĩnh viễn',
        onConfirm: executeDelete
      });
    } else {
      if (confirm(`⚠️ Bạn có chắc chắn muốn xóa đợt test [${cycleName}]? Toàn bộ phân công của đợt này sẽ bị xóa!`)) {
        executeDelete();
      }
    }
  },

  // ==================== MODAL: SCOPE WORKSTATION ====================
  openScopeModal() {
    const p = getActiveProject();
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.version) : [];
    const curCycle = this.getCurrentCycle();

    const currentScope = Array.isArray(curCycle?.scopeTcIds)
      ? curCycle.scopeTcIds
      : (Array.isArray(curCycle?.testCaseIds) ? curCycle.testCaseIds : []);
    this.tempScopeSelectedIds = new Set(currentScope);
    this.selectedScopeModuleId = '';

    this.renderScopeSidebar();
    this.renderScopeTable();
    openModal('modal-cycle-scope');
  },

  renderScopeSidebar() {
    const listEl = document.getElementById('mcs-module-list');
    if (!listEl) return;

    const p = getActiveProject();
    const modules = typeof getModules === 'function' ? getModules(this.version, p?.id) : (p?.modules || []);
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.version) : [];

    const isAllActive = !this.selectedScopeModuleId;
    let html = `
      <div class="mcs-module-item ${isAllActive ? 'active' : ''}" onclick="LeadCycle.selectScopeModule('')">
        <div style="font-weight:700; font-size:12.5px">📦 Tất Cả Kịch Bản</div>
        <div style="font-size:11px; color:var(--text-muted)">${this.tempScopeSelectedIds.size} / ${verTcs.length} đã chọn</div>
      </div>
    `;

    modules.forEach(m => {
      const modTcs = verTcs.filter(t => (t.moduleId || t.module) === m.id);
      const selectedInMod = modTcs.filter(t => this.tempScopeSelectedIds.has(t.id)).length;
      const isActive = this.selectedScopeModuleId === m.id;

      html += `
        <div class="mcs-module-item ${isActive ? 'active' : ''}" onclick="LeadCycle.selectScopeModule('${m.id}')">
          <div style="font-weight:700; font-size:12.5px">[${escapeHtml(m.id)}] ${escapeHtml(m.name || '')}</div>
          <div style="font-size:11px; color:var(--text-muted)">${selectedInMod} / ${modTcs.length} kịch bản</div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  },

  selectScopeModule(modId) {
    this.selectedScopeModuleId = modId;
    this.renderScopeSidebar();
    this.renderScopeTable();
  },

  renderScopeTable() {
    const tbody = document.getElementById('mcs-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.version) : [];

    let targetTcs = verTcs;
    if (this.selectedScopeModuleId) {
      targetTcs = targetTcs.filter(t => (t.moduleId || t.module) === this.selectedScopeModuleId);
    }

    const footerCount = document.getElementById('mcs-footer-count');
    if (footerCount) footerCount.textContent = this.tempScopeSelectedIds.size;

    const checkAll = document.getElementById('mcs-check-all');
    if (checkAll) {
      checkAll.checked = targetTcs.length > 0 && targetTcs.every(t => this.tempScopeSelectedIds.has(t.id));
    }

    tbody.innerHTML = targetTcs.map(tc => {
      const isChecked = this.tempScopeSelectedIds.has(tc.id);
      const prio = (tc.priority || 'P2').toUpperCase();

      return `
        <tr style="${isChecked ? 'background:rgba(37,99,235,0.04)' : ''}">
          <td style="text-align:center">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="LeadCycle.toggleScopeTc('${tc.id}', this.checked)" style="cursor:pointer" />
          </td>
          <td style="text-align:center; font-family:monospace; font-weight:700">${escapeHtml(tc.id)}</td>
          <td style="text-align:center"><span class="badge badge-nr" style="font-size:10px">${escapeHtml(tc.moduleId || tc.module || 'M01')}</span></td>
          <td style="text-align:center"><span class="badge ${prio === 'P1' ? 'badge-fail' : 'badge-info'}" style="font-size:10px">${prio}</span></td>
          <td><div style="font-weight:600; font-size:12.5px">${escapeHtml(tc.name || tc.title || '')}</div></td>
          <td style="text-align:center">
            <span class="badge ${isChecked ? 'badge-pass' : 'badge-outline'}" style="font-size:10px">
              ${isChecked ? '✅ Trong đợt' : 'Bỏ qua'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleScopeTc(tcId, isChecked) {
    if (isChecked) this.tempScopeSelectedIds.add(tcId);
    else this.tempScopeSelectedIds.delete(tcId);
    this.renderScopeSidebar();
    this.renderScopeTable();
  },

  toggleScopeSelectAllCurrent(isChecked) {
    const p = getActiveProject();
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.version) : [];
    let targetTcs = verTcs;
    if (this.selectedScopeModuleId) {
      targetTcs = targetTcs.filter(t => (t.moduleId || t.module) === this.selectedScopeModuleId);
    }
    targetTcs.forEach(t => {
      if (isChecked) this.tempScopeSelectedIds.add(t.id);
      else this.tempScopeSelectedIds.delete(t.id);
    });
    this.renderScopeSidebar();
    this.renderScopeTable();
  },

  applyScopePreset(preset) {
    const p = getActiveProject();
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.version) : [];

    if (preset === 'all') {
      verTcs.forEach(t => this.tempScopeSelectedIds.add(t.id));
    } else if (preset === 'none') {
      this.tempScopeSelectedIds.clear();
    } else if (preset === 'failed') {
      this.tempScopeSelectedIds.clear();
      verTcs.forEach(t => {
        const r = typeof getResultForTc === 'function' ? getResultForTc(t.id, p?.id) : (state.results || {})[t.id];
        const st = (r?.status || '').toUpperCase();
        if (st === 'FAIL' || st === 'FAILED') this.tempScopeSelectedIds.add(t.id);
      });
    } else if (preset === 'p1_p2') {
      this.tempScopeSelectedIds.clear();
      verTcs.forEach(t => {
        const prio = (t.priority || '').toUpperCase();
        if (prio === 'P1' || prio === 'P2') this.tempScopeSelectedIds.add(t.id);
      });
    }

    this.renderScopeSidebar();
    this.renderScopeTable();
  },

  confirmSaveScope() {
    const selectedIds = Array.from(this.tempScopeSelectedIds);
    if (typeof saveCycleScope === 'function') {
      saveCycleScope(this.cycleId, selectedIds, 'CUSTOM');
    }

    closeModal('modal-cycle-scope');
    showToast(`✅ Đã lưu cấu hình phạm vi (${selectedIds.length} kịch bản) cho đợt test!`, 'success');
    this.renderCycleOverview();
    this.renderModuleTree();
    this.renderExecutionTable();
    this.renderStaffingRoster();
    this.renderStaffingTcTable();
    this.populateCycleSettings();
  },

  activeConfigTcId: null,

  getTestCaseById(tcId) {
    const p = getActiveProject();
    const cycleTcs = typeof getTestCasesForCycle === 'function' ? getTestCasesForCycle(this.cycleId) : [];
    let tc = cycleTcs.find(t => t.id === tcId);
    if (!tc && typeof getTestCasesForVersion === 'function') {
      const verTcs = getTestCasesForVersion(p?.id, this.version);
      tc = verTcs.find(t => t.id === tcId);
    }
    if (!tc && p?.testCases) {
      tc = p.testCases.find(t => t.id === tcId);
    }
    if (!tc && typeof window.OPENQAS_ENTERPRISE_MANIFEST !== 'undefined') {
      const prj = (window.OPENQAS_ENTERPRISE_MANIFEST.projects || []).find(x => x.id === this.projectId);
      if (prj?.testCases) {
        tc = prj.testCases.find(t => t.id === tcId);
      }
    }
    return tc;
  },

  openTcDetailModal(tcId) {
    this.openTcConfigModal(tcId);
  },

  openTcConfigModal(tcId) {
    this.activeConfigTcId = tcId;
    const tc = this.getTestCaseById(tcId);
    const p = getActiveProject();

    // 1. Điền thông tin kịch bản
    const idBadge = document.getElementById('mtc-id-badge');
    if (idBadge) idBadge.textContent = tcId;

    const modBadge = document.getElementById('mtc-module-badge');
    if (modBadge) modBadge.textContent = tc ? (tc.moduleId || tc.module || 'M01') : 'M01';

    const nameInput = document.getElementById('mtc-name');
    if (nameInput) nameInput.value = tc?.name || tc?.title || '';

    const prioSelect = document.getElementById('mtc-priority');
    if (prioSelect) prioSelect.value = (tc?.priority || 'P2').toUpperCase();

    const estSelect = document.getElementById('mtc-estimate');
    if (estSelect) estSelect.value = tc?.estimatedTime || '30m';

    const objInput = document.getElementById('mtc-objective');
    if (objInput) objInput.value = tc?.objective || tc?.notes || '';

    const preInput = document.getElementById('mtc-preconditions');
    if (preInput) preInput.value = tc?.precondition || tc?.preconditions || '';

    const stepsInput = document.getElementById('mtc-steps');
    if (stepsInput) {
      if (Array.isArray(tc?.steps)) stepsInput.value = tc.steps.join('\n');
      else stepsInput.value = tc?.steps || '';
    }

    const expInput = document.getElementById('mtc-expected');
    if (expInput) {
      if (Array.isArray(tc?.expected)) expInput.value = tc.expected.join('\n');
      else expInput.value = tc?.expected || tc?.expectedResult || '';
    }

    // Kết quả kiểm thử hiện tại
    const res = typeof getResultForTc === 'function' ? getResultForTc(tcId, p?.id) : (state.results || {})[tcId];
    const st = (res?.status || 'UNTESTED').toUpperCase();
    const stBadge = document.getElementById('mtc-status-badge');
    if (stBadge) {
      stBadge.className = `cycle-exec-pill ${st === 'PASS' || st === 'PASSED' ? 'pill-pass' : (st === 'FAIL' || st === 'FAILED' ? 'pill-fail' : (st === 'BLOCKED' ? 'pill-blocked' : 'pill-untested'))}`;
      stBadge.textContent = st === 'PASS' || st === 'PASSED' ? '🟢 Đạt' : (st === 'FAIL' || st === 'FAILED' ? '🔴 Không đạt' : (st === 'BLOCKED' ? '🟡 Bị nghẽn' : '⚪ Chưa kiểm thử'));
    }

    // 2. Điền form thêm kỹ sư mới
    const testerSelect = document.getElementById('mtc-new-tester-select');
    if (testerSelect) {
      const activeTesters = this.getCycleParticipants();
      
      const allAsgs = (state.assignments || []).filter(a => a.projectId === this.projectId && (!a.cycleId || a.cycleId === this.cycleId));
      testerSelect.innerHTML = activeTesters.map(u => {
        const cnt = allAsgs.filter(a => a.assigneeUsername === u.username).length;
        return `<option value="${u.username}">${u.name} (@${u.username} • Đang nhận ${cnt} bài)</option>`;
      }).join('');
    }

    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const sDate = document.getElementById('mtc-new-start-date');
    if (sDate) {
      sDate.min = cycleStart;
      sDate.max = cycleEnd;
      if (!sDate.value || sDate.value < cycleStart || sDate.value > cycleEnd) sDate.value = cycleStart;
    }
    const dDate = document.getElementById('mtc-new-due-date');
    if (dDate) {
      dDate.min = cycleStart;
      dDate.max = cycleEnd;
      if (!dDate.value || dDate.value < cycleStart || dDate.value > cycleEnd) dDate.value = cycleEnd;
    }
    const notesInput = document.getElementById('mtc-new-notes');
    if (notesInput) notesInput.value = '';

    // 3. Render danh sách các tester đang được giao bài này
    this.renderTcAssigneesList(tcId);

    openModal('modal-config-testcase');
  },

  renderTcAssigneesList(tcId) {
    const listEl = document.getElementById('mtc-assignees-list');
    const countEl = document.getElementById('mtc-assignees-count');
    if (!listEl) return;

    const assignments = (state.assignments || []).filter(a => a.projectId === this.projectId && a.tcId === tcId && (a.cycleId === this.cycleId || !a.cycleId));
    if (countEl) countEl.textContent = assignments.length;

    if (assignments.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:24px; border:1px dashed var(--border); border-radius:10px; background:var(--bg-surface); color:var(--text-muted)">
          <div style="font-size:24px; margin-bottom:6px">⚪</div>
          <div style="font-weight:700">Kịch bản này chưa được phân công cho kỹ sư nào trong đợt kiểm thử.</div>
          <div style="font-size:11.5px; margin-top:2px">Sử dụng biểu mẫu bên dưới để phân công kỹ sư chính, kiểm thử chéo hoặc chuyên viên UAT.</div>
        </div>
      `;
      return;
    }

    const roleBadges = {
      'PRIMARY': { label: '🔵 Kỹ sư chính', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
      'CROSS_CHECK': { label: '🟣 Kiểm thử chéo', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
      'DEVICE_PLATFORM': { label: '🟠 Thiết bị và nền tảng', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      'UAT_ACCEPTANCE': { label: '🟢 Chuyên viên UAT', color: '#059669', bg: 'rgba(5,150,105,0.1)' }
    };

    const platformLabels = {
      'ALL': '🌐 Mọi nền tảng',
      'WEB_CHROME': '🖥️ Web Chrome',
      'WEB_FIREFOX': '🦊 Web Firefox',
      'APP_ANDROID': '📱 Ứng dụng Android',
      'APP_IOS': '🍎 Ứng dụng iOS',
      'HARDWARE_IOT': '📟 Thiết bị IoT'
    };

    const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

    listEl.innerHTML = assignments.map((a, idx) => {
      const rb = roleBadges[a.roleInTest] || roleBadges['PRIMARY'];
      const pLabel = platformLabels[a.platform] || platformLabels['ALL'];
      const bg = colors[idx % colors.length];
      const initial = (a.assigneeName || a.assigneeUsername || 'T').charAt(0).toUpperCase();

      return `
        <div class="tc-assignee-card">
          <div style="display:flex; align-items:center; gap:12px; overflow:hidden">
            <span class="avatar-sm" style="width:34px; height:34px; font-size:14px; background:${bg}; flex-shrink:0">
              ${initial}
            </span>
            <div style="overflow:hidden">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
                <span style="font-weight:800; font-size:13.5px; color:var(--text-primary)">${escapeHtml(a.assigneeName || a.assigneeUsername)}</span>
                <span style="font-size:11px; padding:2px 7px; border-radius:4px; font-weight:800; color:${rb.color}; background:${rb.bg}; border:1px solid ${rb.color}33">
                  ${rb.label}
                </span>
                <span style="font-size:11px; padding:2px 7px; border-radius:4px; font-weight:700; color:var(--text-secondary); background:var(--bg-surface); border:1px solid var(--border)">
                  ${pLabel}
                </span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; font-size:11.5px; color:var(--text-muted); margin-top:3px; flex-wrap:wrap">
                <span>📅 Thời hạn: <strong>${a.startDate || '--'} ➔ ${a.dueDate || '--'}</strong></span>
                <span>• Giao bởi: <strong>${escapeHtml(a.assignedBy || 'Lead')}</strong></span>
                ${a.notes ? `<span>• 📝 <em>${escapeHtml(a.notes)}</em></span>` : ''}
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; margin-left:12px">
            <button type="button" class="btn btn-outline btn-xs" style="color:#dc2626; border-color:rgba(220,38,38,0.3)" onclick="LeadCycle.removeAssigneeFromTc('${a.id}')" title="Thu hồi phân công của kỹ sư này">
              ❌ Thu hồi
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  addAssigneeToTc() {
    const tcId = this.activeConfigTcId;
    if (!tcId) return;

    const testerSelect = document.getElementById('mtc-new-tester-select');
    const username = testerSelect?.value;
    const testerName = testerSelect?.options[testerSelect.selectedIndex]?.text?.split(' (@')[0] || username;

    const role = document.getElementById('mtc-new-role-select')?.value || 'PRIMARY';
    const platform = document.getElementById('mtc-new-platform-select')?.value || 'ALL';
    const curCycle = this.getCurrentCycle();
    const cycleStart = curCycle?.startDate || new Date().toISOString().slice(0, 10);
    const cycleEnd = curCycle?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const sDate = document.getElementById('mtc-new-start-date')?.value || cycleStart;
    const dDate = document.getElementById('mtc-new-due-date')?.value || cycleEnd;
    const notes = (document.getElementById('mtc-new-notes')?.value || '').trim();

    if (!username) {
      showToast('⚠️ Vui lòng chọn kỹ sư kiểm thử!', 'error');
      return;
    }

    // RÀNG BUỘC CHẶT CHẼ: Kiểm soát không cho phép ngày bắt đầu/kết thúc vượt ra ngoài phạm vi đợt test
    if (!this.validateAssignmentDates(sDate, dDate)) return;

    if (!state.assignments) state.assignments = [];

    // Check duplicate
    const exists = state.assignments.some(a => a.projectId === this.projectId && a.tcId === tcId && (a.cycleId === this.cycleId || !a.cycleId) && a.assigneeUsername === username && a.roleInTest === role && a.platform === platform);
    if (exists) {
      showToast(`⚠️ Kỹ sư ${testerName} đã được phân công vai trò và nền tảng này cho kịch bản!`, 'warning');
      return;
    }

    const newAsg = {
      id: `asg-${Date.now()}-${tcId}-${username}-${Math.floor(Math.random()*1000)}`,
      projectId: this.projectId,
      cycleId: this.cycleId,
      cycleName: curCycle?.name || this.cycleId,
      tcId: tcId,
      assigneeUsername: username,
      assigneeName: testerName,
      assignedBy: getCurrentUser().name || 'Lead',
      roleInTest: role,
      platform: platform,
      startDate: sDate,
      dueDate: dDate,
      status: 'WIP',
      notes: notes,
      assignedAt: new Date().toISOString()
    };

    state.assignments.push(newAsg);
    saveCoreState();

    showToast(`👥 Đã phân công thành công kịch bản [${tcId}] cho ${testerName}!`, 'success');

    // Reset notes input
    const nInput = document.getElementById('mtc-new-notes');
    if (nInput) nInput.value = '';

    this.renderTcAssigneesList(tcId);
    this.renderExecutionTable();
    this.renderStaffingRoster();
    this.renderStaffingTcTable();
  },

  removeAssigneeFromTc(asgId) {
    if (!asgId || !state.assignments) return;
    if (!confirm('⚠️ Bạn có chắc chắn muốn thu hồi phân công này?')) return;

    state.assignments = state.assignments.filter(a => a.id !== asgId);
    saveCoreState();

    showToast('🗑️ Đã thu hồi phân công của kỹ sư!', 'info');
    if (this.activeConfigTcId) {
      this.renderTcAssigneesList(this.activeConfigTcId);
    }
    this.renderExecutionTable();
    this.renderStaffingRoster();
    this.renderStaffingTcTable();
  },

  saveTcSpecs() {
    const tcId = this.activeConfigTcId;
    if (!tcId) return;

    const name = (document.getElementById('mtc-name')?.value || '').trim();
    const prio = document.getElementById('mtc-priority')?.value || 'P2';
    const est = document.getElementById('mtc-estimate')?.value || '30m';
    const obj = (document.getElementById('mtc-objective')?.value || '').trim();
    const pre = (document.getElementById('mtc-preconditions')?.value || '').trim();
    const stepsText = (document.getElementById('mtc-steps')?.value || '').trim();
    const expText = (document.getElementById('mtc-expected')?.value || '').trim();

    if (!name) {
      showToast('⚠️ Tên kịch bản không được để trống!', 'error');
      return;
    }

    const p = getActiveProject();
    if (!p) return;
    if (!p.testCases) p.testCases = [];

    let tc = p.testCases.find(t => t.id === tcId);
    if (!tc) {
      const orig = this.getTestCaseById(tcId);
      tc = orig ? JSON.parse(JSON.stringify(orig)) : { id: tcId };
      p.testCases.push(tc);
    }

    tc.name = name;
    tc.title = name;
    tc.priority = prio;
    tc.estimatedTime = est;
    tc.objective = obj;
    tc.notes = obj;
    tc.precondition = pre;
    tc.preconditions = pre;
    tc.steps = stepsText ? stepsText.split('\n').filter(Boolean) : [];
    tc.expected = expText ? expText.split('\n').filter(Boolean) : [];

    saveCoreState();
    showToast(`✅ Đã lưu cập nhật đặc tả cho kịch bản [${tcId}]!`, 'success');
    this.renderExecutionTable();
    this.renderStaffingTcTable();
  },

  openLogDefectModal(tcId) {
    showToast(`🐛 Báo lỗi cho kịch bản [${tcId}]`, 'info');
  }
};

// Export toàn cục
if (typeof window !== 'undefined') {
  window.LeadCycle = LeadCycle;
}
