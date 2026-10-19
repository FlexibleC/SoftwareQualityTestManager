/**
 * LEAD MODULE: PROJECT DASHBOARD
 * Bảng Điều Hành & Giám Sát Tiến Độ Kiểm Thử Nội Bộ Dự Án
 * Hỗ trợ chế độ quản trị đa dự án (Multi-project Leadership)
 */

const LeadDashboard = {
  init() {
    this.renderMultiProjectsOverview();
    this.renderKpis();
    this.renderActiveCycles();
    this.renderProjectRoster();
    this.renderDevPipeline();
  },

  /**
   * Hiển thị danh sách các dự án mà Leader phụ trách (Multi-project Cards)
   */
  renderMultiProjectsOverview() {
    const container = document.getElementById('lead-multiprojects-container');
    if (!container) return;

    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();
    const activePrj = getActiveProject();

    if (!projects || projects.length === 0) {
      container.innerHTML = `
        <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:13px">
          Bạn chưa được phân bổ phụ trách dự án nào. Vui lòng liên hệ Quản trị viên cấp cao.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="lead-multiprojects-section">
        <div class="lead-multiprojects-header">
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:700; color:var(--text-primary)">
              🏢 Danh sách dự án phụ trách (${projects.length} dự án)
            </h3>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px">
              Nhấp vào thẻ dự án để chuyển nhanh không gian điều hành và xem tiến độ chi tiết
            </div>
          </div>
        </div>

        <div class="lead-multiprojects-grid">
          ${projects.map(p => {
            const isActive = activePrj && activePrj.id === p.id;
            const tcsCount = (p.testCases || []).length;
            const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : [];
            const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : [];
            const defects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
            const openDefects = defects.filter(d => d.defectStatus !== 'Closed').length;

            // Đếm kết quả bài test trong dự án này
            let passCount = 0;
            let failCount = 0;
            const results = state.results || {};
            Object.keys(results).forEach(k => {
              const r = results[k];
              if (r && r.projectId === p.id) {
                if (r.status === 'PASS') passCount++;
                else if (r.status === 'FAIL') failCount++;
              }
            });

            const percentPass = tcsCount > 0 ? Math.round((passCount / tcsCount) * 100) : 0;

            return `
              <div class="lead-project-card ${isActive ? 'active' : ''}" onclick="LeadContext.switchProject('${p.id}')">
                <div class="lead-project-card-header">
                  <div>
                    <h4 class="lead-project-card-title">${escapeHtml(p.name)}</h4>
                    <div class="lead-project-card-meta">
                      <span class="badge badge-info" style="font-size:10.5px">Mã: ${escapeHtml(p.code || 'PRJ')}</span>
                      <span>Phiên bản: <strong>${escapeHtml(p.activeVersion || 'v1.0')}</strong></span>
                    </div>
                  </div>
                  <div>
                    ${isActive 
                      ? '<span class="badge badge-pass" style="font-size:10.5px">🟢 Đang điều hành</span>' 
                      : '<span class="badge badge-draft" style="font-size:10.5px">Xem dự án</span>'}
                  </div>
                </div>

                <div class="lead-project-card-stats">
                  <div class="lead-stat-item">
                    <div class="lead-stat-val">${tcsCount}</div>
                    <div class="lead-stat-lbl">Kịch bản</div>
                  </div>
                  <div class="lead-stat-item">
                    <div class="lead-stat-val" style="color:#16a34a">${passCount} (${percentPass}%)</div>
                    <div class="lead-stat-lbl">Đạt kiểm thử</div>
                  </div>
                  <div class="lead-stat-item">
                    <div class="lead-stat-val" style="color:${openDefects > 0 ? '#dc2626' : '#16a34a'}">
                      ${openDefects}
                    </div>
                    <div class="lead-stat-lbl">Lỗi chưa đóng</div>
                  </div>
                </div>

                <div class="lead-card-footer">
                  <span style="color:var(--text-muted)">
                    Đợt test: <strong>${cycles.length}</strong> • Nhân sự: <strong>${members.length}</strong> người
                  </span>
                  <span style="font-weight:700; color:var(--primary)">
                    ${isActive ? 'Đang mở' : 'Chuyển sang ➔'}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderKpis() {
    const p = getActiveProject();
    if (!p) return;

    const tcs = p.testCases || [];
    const totalTcs = tcs.length;

    let passed = 0;
    let failed = 0;
    let blocked = 0;

    const results = state.results || {};
    Object.keys(results).forEach(k => {
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

    let cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : [];

    if (cycles.length === 0) {
      if (typeof ensureDefaultTestCyclesForProjects === 'function') {
        ensureDefaultTestCyclesForProjects();
        cycles = getTestCyclesForProject(p.id);
      }
    }

    if (cycles.length === 0) {
      container.innerHTML = `
        <div style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:13px">
          Chưa có đợt kiểm thử nào được cấu hình cho dự án này.
          <div style="margin-top:10px">
            <a href="settings.html" class="btn btn-primary btn-xs">➕ Thêm đợt kiểm thử mới</a>
          </div>
        </div>
      `;
      return;
    }

    const tcs = p.testCases || [];
    const totalTcs = tcs.length || 1;

    container.innerHTML = cycles.map(c => {
      const isRunning = c.status === 'ACTIVE' || c.status === 'IN_PROGRESS';
      const statusBadge = isRunning 
        ? '<span class="badge badge-pass">Đang thực hiện</span>' 
        : '<span class="badge badge-draft">Đã hoàn thành</span>';

      // Tính kết quả thực tế cho đợt test
      let pass = 0;
      let fail = 0;
      const results = state.results || {};
      Object.keys(results).forEach(k => {
        const r = results[k];
        if (r && r.projectId === p.id && (!r.cycleId || r.cycleId === c.id)) {
          if (r.status === 'PASS') pass++;
          else if (r.status === 'FAIL') fail++;
        }
      });

      const passPercent = Math.min(100, Math.round((pass / totalTcs) * 100));
      const failPercent = Math.min(100 - passPercent, Math.round((fail / totalTcs) * 100));
      const untestedPercent = Math.max(0, 100 - passPercent - failPercent);

      return `
        <div class="cycle-track-card" style="margin-bottom:12px; padding:14px 16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px">
          <div class="cycle-track-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <div>
              <span class="badge badge-info" style="font-size:11px; margin-right:6px">${escapeHtml(c.code || 'ROUND')}</span>
              <strong class="cycle-track-title">${escapeHtml(c.name)}</strong>
              <span style="font-size:11.5px; color:var(--text-muted); margin-left:8px">
                Phiên bản: <strong>${escapeHtml(c.version || p.activeVersion || 'v1.0')}</strong>
              </span>
            </div>
            <div>${statusBadge}</div>
          </div>

          <div class="progress-bar-wrap" style="height:8px; border-radius:4px; display:flex; overflow:hidden; background:var(--bg-body); border:1px solid var(--border-light)">
            <div class="progress-pass" style="width:${passPercent}%; background:#16a34a" title="Đạt: ${pass} bài (${passPercent}%)"></div>
            <div class="progress-fail" style="width:${failPercent}%; background:#dc2626" title="Lỗi: ${fail} bài (${failPercent}%)"></div>
            <div class="progress-untested" style="width:${untestedPercent}%; background:#cbd5e1" title="Chưa kiểm thử: ${untestedPercent}%"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-muted); margin-top:8px">
            <div>
              Đạt: <strong style="color:#16a34a">${pass}</strong> • 
              Lỗi: <strong style="color:#dc2626">${fail}</strong> • 
              Tổng: <strong>${totalTcs}</strong> bài
            </div>
            <a href="assignments.html" style="color:var(--primary); font-weight:700; text-decoration:none">
              Điều phối bài test cho đợt này ➔
            </a>
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

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : [];

    if (members.length === 0) {
      container.innerHTML = `
        <div style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:13px">
          Chưa có nhân sự nào được phân bổ vào dự án này.
        </div>
      `;
      return;
    }

    container.innerHTML = members.map(m => {
      const roleBadge = (m.projectRole === 'lead' || m.projectRole === 'admin')
        ? '<span class="badge badge-p1">👑 Trưởng dự án</span>'
        : (m.projectRole === 'dev' 
          ? '<span class="badge" style="background:rgba(139,92,246,0.1); color:#7c3aed; border:1px solid rgba(139,92,246,0.3)">💻 Lập trình viên</span>'
          : '<span class="badge badge-info">🧪 Kiểm thử viên</span>');

      const assignedCount = (state.assignments || []).filter(a => a.projectId === p.id && a.assigneeUsername === m.username).length;

      return `
        <div class="tester-roster-card" style="padding:12px 14px">
          <div style="display:flex; align-items:center; gap:10px">
            <div class="user-avatar-circle" style="width:34px; height:34px; font-weight:800; font-size:12px; border-radius:50%; background:var(--primary-subtle); color:var(--primary); display:flex; align-items:center; justify-content:center">
              ${(m.name || m.username || 'U').substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:700; color:var(--text-primary); font-size:13px">${escapeHtml(m.name || m.username)}</div>
              <div style="font-size:11px; color:var(--text-muted)">${escapeHtml(m.title || 'Thành viên')}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div>${roleBadge}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:3px">
              Được giao: <strong>${assignedCount}</strong> bài
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
      descEl.textContent = `${resolvedTotal} / ${total} lỗi đã giải quyết (${fixRate}%)`;
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
          🎉 Dự án hiện không có lỗi tồn đọng chưa được giải quyết.
        </div>
      `;
      return;
    }

    const priorityDefects = [...defects].sort((a, b) => {
      const score = d => (d.defectStatus === 'Reopened' ? 4 : (d.severity === 'Critical' ? 3 : (d.defectStatus === 'New' ? 2 : 1)));
      return score(b) - score(a);
    }).slice(0, 5);

    hotContainer.innerHTML = `
      <div style="font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:8px">
        🔥 Các lỗi trọng yếu cần chú ý & đôn đốc lập trình viên:
      </div>
      <div style="display:flex; flex-direction:column; gap:6px">
        ${priorityDefects.map(d => {
          let stColor = '#dc2626';
          let stText = 'Mới ghi nhận';
          if (d.defectStatus === 'In Progress') { stColor = '#f59e0b'; stText = 'Đang sửa'; }
          else if (d.defectStatus === 'Reopened') { stColor = '#b91c1c'; stText = '⚠️ Tái phát (Reopened)'; }
          else if (d.defectStatus === 'Fixed') { stColor = '#7c3aed'; stText = 'Đã sửa, chờ kiểm thử lại'; }
          else if (d.defectStatus === 'Closed') { stColor = '#16a34a'; stText = 'Đã đóng'; }

          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border-light); border-radius:6px; font-size:12px">
              <div style="display:flex; align-items:center; gap:8px">
                <strong style="color:var(--primary); font-family:monospace">[${escapeHtml(d.tcId)}]</strong>
                <span style="font-weight:600; color:var(--text-primary)">${escapeHtml(d.tcTitle)}</span>
                <span style="font-size:10.5px; padding:1px 6px; border-radius:4px; font-weight:700; background:rgba(220,38,38,0.1); color:#dc2626">${escapeHtml(d.severity || 'Normal')}</span>
              </div>
              <div style="display:flex; align-items:center; gap:12px">
                <span style="font-size:11px; color:var(--text-muted)">Phụ trách: <strong>${escapeHtml(d.assignedDev || 'Chưa gán')}</strong></span>
                <span style="font-weight:700; color:${stColor}; font-size:11px">${stText}</span>
                <a href="../dev/index.html" class="btn btn-outline btn-xs" style="padding:2px 8px; font-size:10.5px">Xem chi tiết ➔</a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
