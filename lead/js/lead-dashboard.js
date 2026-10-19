/**
 * LEAD MODULE: PROJECT DASHBOARD
 * Bảng Điều Hành & Giám Sát Tiến Độ Kiểm Thử Nội Bộ Dự Án
 */

const LeadDashboard = {
  init() {
    this.renderKpis();
    this.renderActiveCycles();
    this.renderProjectRoster();
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
  }
};
