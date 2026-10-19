/**
 * LEAD MODULE: PROJECT DASHBOARD
 * Bảng Điều Hành & Giám Sát Tiến Độ Kiểm Thử Nội Bộ Dự Án
 */

const LeadDashboard = {
  init() {
    this.renderKpis();
    this.renderActiveCycles();
    this.renderProjectRoster();
    this.renderDevPipeline();
  },

  renderKpis() {
    const p = getActiveProject();
    if (!p) return;

    const tcs = p.testCases || [];
    const totalTcs = tcs.length;

    // Tính toán kết quả thực thi trong dự án
    let passed = 0;
    let failed = 0;
    let blocked = 0;

    const results = state.results || {};
    Object.keys(results).forEach(k => {
      // Key format: runId_tcId hoặc tcId
      const res = results[k];
      if (res && res.projectId === p.id) {
        if (res.status === 'PASS') passed++;
        else if (res.status === 'FAIL') failed++;
        else if (res.status === 'BLOCKED') blocked++;
      }
    });

    const assignments = (state.assignments || []).filter(a => a.projectId === p.id);

    const elTotal = document.getElementById('lead-kpi-total-tcs');
    const elPass = document.getElementById('lead-kpi-pass');
    const elFail = document.getElementById('lead-kpi-fail');
    const elAsg = document.getElementById('lead-kpi-assigned');

    if (elTotal) elTotal.textContent = totalTcs;
    if (elPass) elPass.textContent = passed;
    if (elFail) elFail.textContent = failed;
    if (elAsg) elAsg.textContent = assignments.length;
  },

  renderActiveCycles() {
    const container = document.getElementById('lead-cycles-progress-list');
    if (!container) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = p.testCycles || [];

    if (cycles.length === 0) {
      container.innerHTML = `
        <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:13px">
          Chưa có đợt kiểm thử nào được cấu hình cho dự án này.
          <div style="margin-top:8px">
            <a href="settings.html" class="btn btn-outline btn-xs">➕ Cấu hình Đợt Test</a>
          </div>
        </div>
      `;
      return;
    }

    const tcs = p.testCases || [];
    const totalTcs = tcs.length || 1;

    container.innerHTML = cycles.map(c => {
      const isRunning = c.status === 'IN_PROGRESS' || !c.status;
      const statusBadge = isRunning 
        ? '<span class="badge badge-pass">Đang chạy</span>' 
        : '<span class="badge badge-draft">Hoàn thành</span>';

      return `
        <div class="cycle-track-card">
          <div class="cycle-track-header">
            <div>
              <span class="badge badge-info" style="font-size:11px; margin-right:6px">${c.code || 'CYC'}</span>
              <strong class="cycle-track-title">${c.name}</strong>
              <span style="font-size:11.5px; color:var(--text-muted); margin-left:8px">Phiên bản: ${c.version || p.activeVersion || 'v1.0'}</span>
            </div>
            <div>${statusBadge}</div>
          </div>

          <div class="progress-bar-wrap">
            <div class="progress-pass" style="width:40%" title="Đạt: 40%"></div>
            <div class="progress-fail" style="width:10%" title="Lỗi: 10%"></div>
            <div class="progress-untested" style="width:50%" title="Chưa test: 50%"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-muted)">
            <div>Loại kiểm thử: <strong>${c.type || 'FUNCTIONAL'}</strong> • Phạm vi: <strong>${c.scope || 'ALL'}</strong></div>
            <a href="assignments.html" style="color:var(--primary); font-weight:700; text-decoration:none">Điều phối kịch bản đợt này ➔</a>
          </div>
        </div>
      `;
    }).join('');
  },

  renderProjectRoster() {
    const container = document.getElementById('lead-team-roster-list');
    if (!container) return;

    const p = getActiveProject();
    if (!p) return;

    const members = getProjectMembers(p.id);

    if (members.length === 0) {
      container.innerHTML = `
        <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:13px">
          Chưa có nhân sự nào được phân bổ vào dự án này.
          <div style="margin-top:8px">
            <a href="../admin/index.html" class="btn btn-outline btn-xs">👥 Phân bổ nhân sự từ Cổng Cấp Cao</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = members.map(m => {
      const roleBadge = m.projectRole === 'lead' || m.projectRole === 'admin'
        ? '<span class="badge badge-p1">👑 Quản Trị Dự Án</span>'
        : (m.projectRole === 'dev' 
          ? '<span class="badge" style="background:rgba(139,92,246,0.1); color:#7c3aed; border:1px solid rgba(139,92,246,0.3)">💻 Lập Trình Viên</span>'
          : '<span class="badge badge-info">🧪 Kiểm Thử Viên</span>');

      // Đếm số kịch bản được giao trong dự án này
      const assignedCount = (state.assignments || []).filter(a => a.projectId === p.id && a.assigneeUsername === m.username).length;

      return `
        <div class="tester-roster-card">
          <div style="display:flex; align-items:center; gap:10px">
            <div class="user-avatar-circle" style="width:34px; height:34px; font-weight:800; font-size:12px">
              ${(m.name || m.username || 'U').substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:700; color:var(--text-primary); font-size:13px">${m.name || m.username}</div>
              <div style="font-size:11px; color:var(--text-muted)">${m.title || 'Thành viên dự án'}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div>${roleBadge}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:3px">
              Được giao: <strong>${assignedCount}</strong> TCs
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderDevPipeline() {
    const p = getActiveProject();
    if (!p) return;

    const defects = (typeof getProjectDefects === 'function') 
      ? getProjectDefects(p.id) 
      : [];

    let newCount = 0;
    let wipCount = 0;
    let reopenedCount = 0;
    let fixedCount = 0;
    let closedCount = 0;

    defects.forEach(d => {
      if (d.defectStatus === 'New') newCount++;
      else if (d.defectStatus === 'In Progress') wipCount++;
      else if (d.defectStatus === 'Reopened') reopenedCount++;
      else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') fixedCount++;
      else if (d.defectStatus === 'Closed') closedCount++;
      else newCount++;
    });

    const total = defects.length;
    const resolvedTotal = fixedCount + closedCount;
    const fixRate = total > 0 ? Math.round((resolvedTotal / total) * 100) : 100;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('lead-dev-kpi-new', newCount);
    setVal('lead-dev-kpi-wip', wipCount);
    setVal('lead-dev-kpi-reopened', reopenedCount);
    setVal('lead-dev-kpi-fixed', fixedCount);
    setVal('lead-dev-kpi-closed', closedCount);
    setVal('lead-dev-kpi-fixrate', `${fixRate}%`);

    const descEl = document.getElementById('lead-dev-pipeline-desc');
    if (descEl) {
      descEl.textContent = `${resolvedTotal} / ${total} lỗi đã được giải quyết (${fixRate}%)`;
    }

    if (total > 0) {
      const setWidth = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${((count / total) * 100).toFixed(1)}%`;
      };
      setWidth('lead-pipe-closed', closedCount);
      setWidth('lead-pipe-fixed', fixedCount);
      setWidth('lead-pipe-wip', wipCount);
      setWidth('lead-pipe-reopened', reopenedCount);
      setWidth('lead-pipe-new', newCount);
    }

    const hotContainer = document.getElementById('lead-dev-hot-defects');
    if (!hotContainer) return;

    if (total === 0) {
      hotContainer.innerHTML = `
        <div style="padding:14px; text-align:center; color:var(--text-muted); font-size:12px; background:var(--bg-body); border-radius:6px">
          🎉 Tuyệt vời! Hiện tại dự án không có lỗi nào chưa được xử lý.
        </div>
      `;
      return;
    }

    // Ưu tiên hiển thị lỗi Reopened, Critical và New
    const priorityDefects = [...defects].sort((a, b) => {
      const score = d => (d.defectStatus === 'Reopened' ? 4 : (d.severity === 'Critical' ? 3 : (d.defectStatus === 'New' ? 2 : 1)));
      return score(b) - score(a);
    }).slice(0, 5);

    hotContainer.innerHTML = `
      <div style="font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:8px">
        🔥 Các lỗi trọng yếu cần chú ý & đôn đốc xử lý:
      </div>
      <div style="display:flex; flex-direction:column; gap:6px">
        ${priorityDefects.map(d => {
          let stColor = '#dc2626';
          let stText = 'New';
          if (d.defectStatus === 'In Progress') { stColor = '#f59e0b'; stText = 'Đang sửa'; }
          else if (d.defectStatus === 'Reopened') { stColor = '#b91c1c'; stText = '⚠️ Reopened'; }
          else if (d.defectStatus === 'Fixed') { stColor = '#7c3aed'; stText = 'Chờ Re-test'; }
          else if (d.defectStatus === 'Closed') { stColor = '#16a34a'; stText = 'Closed'; }

          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border-light); border-radius:6px; font-size:12px">
              <div style="display:flex; align-items:center; gap:8px">
                <strong style="color:var(--primary); font-family:monospace">[${escapeHtml(d.tcId)}]</strong>
                <span style="font-weight:600; color:var(--text-primary)">${escapeHtml(d.tcTitle)}</span>
                <span style="font-size:10.5px; padding:1px 6px; border-radius:4px; font-weight:700; background:rgba(220,38,38,0.1); color:#dc2626">${escapeHtml(d.severity)}</span>
              </div>
              <div style="display:flex; align-items:center; gap:12px">
                <span style="font-size:11px; color:var(--text-muted)">Gán: <strong>${escapeHtml(d.assignedDev || 'Chưa gán')}</strong></span>
                <span style="font-weight:700; color:${stColor}; font-size:11px">${stText}</span>
                <a href="../dev/index.html" class="btn btn-outline btn-xs" style="padding:2px 8px; font-size:10.5px">Chi tiết ➔</a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
