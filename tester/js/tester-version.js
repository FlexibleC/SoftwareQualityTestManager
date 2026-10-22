/**
 * TESTER MODULE: VERSION WORKSPACE (TẦNG 2) - tester-version.js
 * Không gian làm việc cá nhân của Tester trong phạm vi một Phiên bản cụ thể
 */

const TesterVersion = {
  init() {
    TesterContext.init(2);
    this.renderVersionHeader();
    this.renderVersionKpis();
    this.renderCyclesGrid();
    this.renderModulesBreakdown();
  },

  renderVersionHeader() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const versions = TesterContext.getAssignedVersionsForTester(curPrj.id);
    const curVer = versions.some(v => (v.version || v) === state.activeVersion) 
      ? state.activeVersion 
      : (versions[0]?.version || versions[0] || state.activeVersion);
    state.activeVersion = curVer;
    const vObj = versions.find(v => (v.version || v) === curVer) || { version: curVer };

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('ver-hero-name', `Phiên bản: ${vObj.version || curVer}`);
    setEl('ver-hero-label', vObj.label ? `— ${vObj.label}` : '');
    setEl('ver-hero-status', vObj.version === curPrj.activeVersion ? '🟢 Đang hoạt động' : '📦 Lưu trữ / Kế hoạch');
    setEl('ver-hero-prj-name', `Thuộc dự án: ${curPrj.name} [${curPrj.code || 'PRJ'}]`);
  },

  renderVersionKpis() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const curVer = state.activeVersion;
    // QUY TẮC PHÂN TẦNG: Tổng số bài phiên bản = Tổng số bài của tất cả các đợt kiểm thử thuộc phiên bản đó
    const vStats = TesterContext.getVersionStats(curPrj.id, curVer);

    const myTcs = TesterContext.getMyAssignedTasks(curPrj.id, null, curVer);
    const modsSet = new Set();
    myTcs.forEach(tc => {
      if (tc.module) modsSet.add(tc.module);
    });

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('kpi-ver-tasks', vStats.total);
    setEl('kpi-ver-passrate', `${vStats.passRate}%`);
    setEl('kpi-ver-modules', modsSet.size);
    setEl('kpi-ver-retests', vStats.retest);
  },

  renderCyclesGrid() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const curVer = state.activeVersion;
    const cycles = TesterContext.getAssignedCyclesForTester(curPrj.id, curVer);
    const container = document.getElementById('version-cycles-grid');
    if (!container) return;

    if (cycles.length === 0) {
      container.innerHTML = `
        <div style="padding:30px; text-align:center; background:var(--bg-card); border-radius:8px; border:1px dashed var(--border)">
          <p style="color:var(--text-muted); font-size:13px">Bạn chưa có bài kiểm thử nào được phân công trong các đợt kiểm thử của phiên bản này.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = cycles.map(cyc => {
      const cStats = TesterContext.getCycleStats(curPrj.id, cyc.id);
      const passWidth = cStats.total > 0 ? (cStats.pass / cStats.total) * 100 : 0;

      return `
        <div class="card" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between; border-left:4px solid #0d9488">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
              <span class="badge" style="background:#f1f5f9; color:#334155; font-family:monospace; font-weight:800; font-size:11px">
                ${escapeHtml(cyc.code || cyc.id)}
              </span>
              <span class="badge ${cyc.status === 'ACTIVE' ? 'badge-pass' : 'badge-outline'}" style="font-size:10.5px">
                ${cyc.status === 'ACTIVE' ? '🟢 Đang mở' : '🔒 Đã đóng'}
              </span>
            </div>

            <h3 style="margin:0 0 6px 0; font-size:15px; font-weight:700; color:var(--text-primary)">
              ${escapeHtml(cyc.name)}
            </h3>

            <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:12px; line-height:1.5">
              Loại: <strong>${escapeHtml(cyc.suite || 'Hồi quy')}</strong> • Mục tiêu: <strong>≥ ${escapeHtml(cyc.targetPassRate || 90)}%</strong><br/>
              Thời hạn: <strong>${escapeHtml(cyc.endDate || cyc.dueDate || 'Chưa đặt')}</strong>
            </div>

            <div style="background:var(--bg-body); padding:10px 12px; border-radius:6px; border:1px solid var(--border); margin-bottom:12px">
              <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px">
                <span>Nhiệm vụ được giao:</span>
                <strong style="color:#0d9488">${cStats.total} bài</strong>
              </div>
              <div class="matrix-progress-track" style="width:100%; height:6px; margin-bottom:4px">
                <div class="matrix-seg-pass" style="width:${passWidth}%"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted)">
                <span>Đạt: <strong style="color:#16a34a">${cStats.pass}</strong></span>
                <span>Lỗi: <strong style="color:#dc2626">${cStats.fail}</strong></span>
                <span>Tỷ lệ: <strong>${cStats.passRate}%</strong></span>
              </div>
            </div>
          </div>

          <a href="cycle.html?projectId=${encodeURIComponent(curPrj.id)}&version=${encodeURIComponent(curVer)}&cycleId=${encodeURIComponent(cyc.id)}" class="btn btn-primary btn-sm" style="background:#0d9488; border-color:#0f766e; font-weight:700; width:100%; justify-content:center">
            🎯 Vào studio kiểm thử ➔
          </a>
        </div>
      `;
    }).join('');
  },

  renderModulesBreakdown() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const curVer = state.activeVersion;
    const allMods = typeof getModules === 'function' ? getModules(curVer, curPrj.id) : (curPrj.modules || []);
    const tbody = document.getElementById('version-modules-tbody');
    if (!tbody) return;

    const myTcs = TesterContext.getMyAssignedTasks(curPrj.id, null, curVer);

    // NGUYÊN TẮC: CHỈ HIỂN THỊ CÁC PHÂN HỆ ĐƯỢC GIAO TEST CASE CHO TESTER NÀY
    const assignedMods = allMods.filter(m => myTcs.some(t => t.module === m.id));

    if (assignedMods.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted); font-size:12.5px">
            Bạn chưa có bài kiểm thử nào được phân công trong các phân hệ của phiên bản này.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = assignedMods.map(m => {
      const modTcs = myTcs.filter(t => t.module === m.id);
      let mPass = 0, mFail = 0;
      modTcs.forEach(t => {
        const cycleId = t.cycleId;
        const r = (state.cycleResults && cycleId && state.cycleResults[cycleId] && state.cycleResults[cycleId][t.id])
               || (state.results && (state.results[`${curPrj.id}__${t.id}`] || state.results[t.id])) || {};
        const s = (r.status || '').toUpperCase();
        if (s === 'PASS' || s === 'PASSED') mPass++;
        else if (s === 'FAIL' || s === 'FAILED') mFail++;
      });
      const mRate = modTcs.length > 0 ? Math.round((mPass / modTcs.length) * 100) : 0;

      return `
        <tr>
          <td><span class="tc-badge-id">[${escapeHtml(m.id)}]</span></td>
          <td><strong>${escapeHtml(m.name)}</strong></td>
          <td style="text-align:center"><strong style="color:#0d9488">${modTcs.length}</strong> bài</td>
          <td style="text-align:center"><span style="color:#16a34a; font-weight:700">${mPass}</span></td>
          <td style="text-align:center"><span style="color:#dc2626; font-weight:700">${mFail}</span></td>
          <td style="text-align:center">
            <span class="badge ${mRate >= 90 ? 'badge-pass' : 'badge-outline'}" style="font-weight:700">
              ${mRate}%
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
};

window.TesterVersion = TesterVersion;
