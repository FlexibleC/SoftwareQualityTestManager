/**
 * DEVELOPER MODULE: VERSION SPACE LOGIC (dev-version.js)
 * TẦNG 2: Không gian phiên bản phần mềm của Lập Trình Viên
 */

const DevVersion = {
  init() {
    DevContext.init(2);
    this.renderHero();
    this.renderKPIs();
    this.renderCycles();
    this.renderVersionModules();
  },

  renderHero() {
    const prj = DevContext.getActiveProject();
    const ver = state.activeVersion || 'v1.0';
    if (!prj) return;

    const nameEl = document.getElementById('ver-hero-name');
    const prjEl = document.getElementById('ver-hero-prj-name');
    const statusEl = document.getElementById('ver-hero-status');

    if (nameEl) nameEl.textContent = `Phiên bản: ${ver}`;
    if (prjEl) prjEl.textContent = `Thuộc dự án: ${prj.name} (${prj.code || prj.id})`;

    const vObj = DevContext.getActiveVersionObj();
    if (statusEl) {
      if (vObj?.isCurrent || ver === prj.activeVersion) {
        statusEl.className = 'badge badge-info';
        statusEl.textContent = '🟢 Đang hoạt động';
      } else {
        statusEl.className = 'badge';
        statusEl.style.background = 'var(--bg-body)';
        statusEl.textContent = 'Kế hoạch phát hành';
      }
    }
  },

  renderKPIs() {
    const prj = DevContext.getActiveProject();
    const ver = state.activeVersion || 'v1.0';
    if (!prj) return;

    const defects = DevContext.getAllDefectsForContext(prj.id, ver);
    const cycles = DevContext.getAssignedCyclesForDev(prj.id, ver);

    let blockerCount = 0;
    let pendingCount = 0;

    defects.forEach(d => {
      if (d.severity === 'Blocker' || d.severity === 'Critical') blockerCount++;
      if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') pendingCount++;
    });

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpi-ver-cycles', cycles.length);
    setVal('kpi-ver-total-bugs', defects.length);
    setVal('kpi-ver-blocker', blockerCount);
    setVal('kpi-ver-pending', pendingCount);
  },

  renderCycles() {
    const container = document.getElementById('dev-cycles-container');
    if (!container) return;

    const prj = DevContext.getActiveProject();
    const ver = state.activeVersion || 'v1.0';
    if (!prj) return;

    const cycles = DevContext.getAssignedCyclesForDev(prj.id, ver);

    if (cycles.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:36px; color:var(--text-muted)">
          <div style="font-size:32px; margin-bottom:8px">🎯</div>
          <div style="font-weight:700; color:var(--text-primary)">Chưa có đợt kiểm thử nào được ghi nhận</div>
          <p style="font-size:12px; margin-top:4px">Phiên bản này hiện chưa có đợt kiểm thử tác nghiệp hoặc không có lỗi phát sinh.</p>
        </div>
      `;
      return;
    }

    const cards = cycles.map(c => {
      const defects = DevContext.getAllDefectsForContext(prj.id, ver, c.id);
      const total = defects.length;

      let newCount = 0;
      let wipCount = 0;
      let reopenedCount = 0;
      let fixedCount = 0;
      let blockerCount = 0;

      defects.forEach(d => {
        if (d.defectStatus === 'New') newCount++;
        else if (d.defectStatus === 'In Progress') wipCount++;
        else if (d.defectStatus === 'Reopened') reopenedCount++;
        else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') fixedCount++;
        if (d.severity === 'Blocker' || d.severity === 'Critical') blockerCount++;
      });

      const pFixed = total > 0 ? (fixedCount / total * 100) : 0;
      const pWip = total > 0 ? (wipCount / total * 100) : 0;
      const pNew = total > 0 ? (newCount / total * 100) : 0;
      const pReopened = total > 0 ? (reopenedCount / total * 100) : 0;

      return `
        <div class="card" style="border-left:4px solid #0284c7; display:flex; flex-direction:column; justify-content:space-between">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
              <span class="badge" style="background:#0f172a; color:#38bdf8; font-family:monospace; font-weight:800; font-size:11px">
                🎯 ${escapeHtml(c.id)}
              </span>
              <span class="badge badge-info" style="font-size:10px">
                ${escapeHtml(c.scope || c.type || 'Chính thức')}
              </span>
            </div>

            <h3 style="font-size:15px; font-weight:800; color:var(--text-primary); margin:0 0 6px 0">
              ${escapeHtml(c.name)}
            </h3>

            <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:12px">
              📅 Thời hạn: <strong>${c.endDate || c.dueDate || 'Đang diễn ra'}</strong>
            </div>

            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; background:var(--bg-body); padding:10px 8px; border-radius:6px; margin-bottom:12px; text-align:center">
              <div>
                <div style="font-size:15px; font-weight:800; color:var(--text-primary)">${total}</div>
                <div style="font-size:9.5px; color:var(--text-muted); font-weight:700">TỔNG BUG</div>
              </div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#dc2626">${blockerCount}</div>
                <div style="font-size:9.5px; color:#dc2626; font-weight:700">BLOCKER</div>
              </div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#b91c1c">${reopenedCount}</div>
                <div style="font-size:9.5px; color:#b91c1c; font-weight:700">TÁI PHÁT</div>
              </div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#7c3aed">${fixedCount}</div>
                <div style="font-size:9.5px; color:#7c3aed; font-weight:700">ĐÃ FIX</div>
              </div>
            </div>

            <div style="margin-bottom:14px">
              <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:3px">
                <span style="color:var(--text-muted)">Tiến độ xử lý lỗi đợt test</span>
                <span style="color:#7c3aed">${Math.round(pFixed)}%</span>
              </div>
              <div class="dev-progress-track">
                <div class="dev-seg-fixed" style="width:${pFixed}%"></div>
                <div class="dev-seg-wip" style="width:${pWip}%"></div>
                <div class="dev-seg-new" style="width:${pNew}%"></div>
                <div class="dev-seg-reopened" style="width:${pReopened}%"></div>
              </div>
            </div>
          </div>

          <div>
            <a href="cycle.html?projectId=${prj.id}&version=${encodeURIComponent(ver)}&cycleId=${c.id}" class="btn btn-primary btn-block" style="text-align:center">
              🎯 Vào bàn xử lý lỗi đợt test ➔
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px">
        ${cards}
      </div>
    `;
  },

  renderVersionModules() {
    const tbody = document.getElementById('dev-version-modules-body');
    if (!tbody) return;

    const prj = DevContext.getActiveProject();
    const ver = state.activeVersion || 'v1.0';
    if (!prj) return;

    const defects = DevContext.getAllDefectsForContext(prj.id, ver);
    const mods = prj.modules || [];

    const modMap = {};
    defects.forEach(d => {
      const mId = d.module || 'OTHER';
      if (!modMap[mId]) {
        modMap[mId] = { total: 0, new: 0, wip: 0, fixed: 0, reopened: 0, blocker: 0 };
      }
      modMap[mId].total++;
      if (d.defectStatus === 'New') modMap[mId].new++;
      else if (d.defectStatus === 'In Progress') modMap[mId].wip++;
      else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') modMap[mId].fixed++;
      else if (d.defectStatus === 'Reopened') modMap[mId].reopened++;
      if (d.severity === 'Blocker' || d.severity === 'Critical') modMap[mId].blocker++;
    });

    const activeMods = mods.filter(m => (modMap[m.id]?.total || 0) > 0);

    if (activeMods.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted)">Phiên bản này hiện không có phân hệ nào ghi nhận lỗi.</td></tr>`;
      return;
    }

    tbody.innerHTML = activeMods.map(m => {
      const st = modMap[m.id] || { total: 0, new: 0, wip: 0, fixed: 0, reopened: 0, blocker: 0 };
      return `
        <tr>
          <td>
            <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-family:monospace">
              ${escapeHtml(m.id)}
            </span>
          </td>
          <td>
            <strong style="color:var(--text-primary); font-size:12.5px">${escapeHtml(m.name)}</strong>
          </td>
          <td style="text-align:center"><strong style="font-size:13px">${st.total}</strong></td>
          <td style="text-align:center">${st.blocker > 0 ? `<span style="color:#dc2626; font-weight:800">🔴 ${st.blocker}</span>` : '—'}</td>
          <td style="text-align:center"><span style="color:#f59e0b; font-weight:700">${st.wip}</span></td>
          <td style="text-align:center"><span style="color:#7c3aed; font-weight:700">${st.fixed}</span></td>
          <td style="text-align:center">${st.reopened > 0 ? `<span class="st-badge st-reopened">🔥 ${st.reopened}</span>` : '—'}</td>
        </tr>
      `;
    }).join('');
  }
};
