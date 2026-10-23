/**
 * LEAD MODULE: PORTFOLIO HUB (TẦNG 1: QUẢN TRỊ ĐA DỰ ÁN)
 * Trung tâm điều hành, đối soát & giám sát danh mục các dự án Leader phụ trách
 */

const LeadPortfolio = {
  viewMode: 'cards', // 'cards' | 'table'

  init() {
    this.renderUserInfo();
    this.renderPortfolioKpis();
    this.renderProjectsView();
    this.renderResourceAllocation();
  },

  renderUserInfo() {
    const u = getCurrentUser();
    const nameEl = document.getElementById('lead-user-name');
    const roleEl = document.getElementById('lead-user-role');
    const avatarEl = document.getElementById('lead-user-avatar');

    if (nameEl && u) nameEl.textContent = u.name || u.username;
    if (roleEl && u) {
      roleEl.textContent = (u.role === 'admin') 
        ? 'Quản trị viên cấp cao' 
        : (u.roleTitle || 'Quản trị viên dự án');
    }
    if (avatarEl && u) {
      const char = (u.name || u.username || 'L').trim().charAt(0).toUpperCase();
      avatarEl.textContent = char;
      avatarEl.style.background = (u.role === 'admin') ? '#2563eb' : '#d97706';
    }
  },

  /**
   * Tính toán và hiển thị 5 chỉ số tổng hợp danh mục cấp cao
   */
  renderPortfolioKpis() {
    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();
    const totalProjects = projects.length;

    let totalTcs = 0;
    let totalCycles = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDefects = 0;

    projects.forEach(p => {
      const tcs = p.testCases || [];
      totalTcs += tcs.length;

      const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : [];
      totalCycles += cycles.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS').length;

      const results = state.results || {};
      Object.keys(results).forEach(k => {
        const r = results[k];
        if (r && r.projectId === p.id) {
          const st = (r.status || '').toUpperCase();
          if (st === 'PASS') totalPassed++;
          else if (st === 'FAIL') totalFailed++;
        }
      });

      const defects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
      totalDefects += defects.filter(d => d.defectStatus !== 'Closed').length;
    });

    const passRate = totalTcs > 0 ? Math.round((totalPassed / totalTcs) * 100) : 0;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpi-portfolio-projects', totalProjects);
    setVal('kpi-portfolio-tcs', totalTcs.toLocaleString());
    setVal('kpi-portfolio-cycles', totalCycles);
    setVal('kpi-portfolio-passrate', `${passRate}%`);
    setVal('kpi-portfolio-defects', totalDefects);
  },

  /**
   * Chuyển đổi giữa chế độ xem Thẻ (Cards) và Bảng (Table)
   */
  switchViewMode(mode) {
    this.viewMode = mode;
    const btnCards = document.getElementById('btn-view-cards');
    const btnTable = document.getElementById('btn-view-table');

    if (btnCards) {
      btnCards.className = mode === 'cards' ? 'btn-lead-action btn-lead-primary' : 'btn-lead-action btn-lead-outline';
    }
    if (btnTable) {
      btnTable.className = mode === 'table' ? 'btn-lead-action btn-lead-primary' : 'btn-lead-action btn-lead-outline';
    }

    this.renderProjectsView();
  },

  /**
   * Hiển thị danh sách dự án dạng Thẻ hoặc Bảng
   */
  renderProjectsView() {
    const container = document.getElementById('lead-portfolio-projects-container');
    if (!container) return;

    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();

    if (!projects || projects.length === 0) {
      container.innerHTML = `
        <div style="padding:48px 24px; text-align:center; background:var(--bg-card); border:1.5px dashed var(--border); border-radius:16px">
          <div style="font-size:40px; margin-bottom:12px">🏢</div>
          <h3 style="margin:0 0 6px 0; color:var(--text-primary); font-size:16px; font-weight:800">Bạn chưa được phân bổ dự án nào</h3>
          <p style="color:var(--text-muted); font-size:13px; margin:0">
            Vui lòng liên hệ Quản trị viên cấp cao (Super Admin) để được phân quyền phụ trách dự án.
          </p>
        </div>
      `;
      return;
    }

    if (this.viewMode === 'table') {
      this.renderProjectsTable(container, projects);
    } else {
      this.renderProjectsCards(container, projects);
    }
  },

  /**
   * Render Lưới thẻ dự án (Cards View)
   */
  renderProjectsCards(container, projects) {
    container.innerHTML = `
      <div class="lead-portfolio-grid">
        ${projects.map(p => {
          const tcs = p.testCases || [];
          const totalTcs = tcs.length;
          const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : [];
          const activeCycles = cycles.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS');
          const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : [];
          const defects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
          const openDefects = defects.filter(d => d.defectStatus !== 'Closed').length;

          // Đếm kết quả
          let pass = 0;
          let fail = 0;
          const results = state.results || {};
          Object.keys(results).forEach(k => {
            const r = results[k];
            if (r && r.projectId === p.id) {
              const st = (r.status || '').toUpperCase();
              if (st === 'PASS') pass++;
              else if (st === 'FAIL') fail++;
            }
          });

          const passPercent = totalTcs > 0 ? Math.round((pass / totalTcs) * 100) : 0;
          const failPercent = totalTcs > 0 ? Math.round((fail / totalTcs) * 100) : 0;
          const untestedPercent = Math.max(0, 100 - passPercent - failPercent);

          // Tính điểm sức khỏe
          const health = typeof calculateProjectHealthMetrics === 'function' 
            ? calculateProjectHealthMetrics(p) 
            : { score: 100, label: 'Khởi tạo', color: '#16a34a' };

          return `
            <div class="lead-portfolio-card">
              <div>
                <div class="lead-portfolio-card-head">
                  <div class="lead-portfolio-card-brand">
                    <div class="lead-portfolio-cube">
                      ${(p.code || 'PRJ').substring(0, 3)}
                    </div>
                    <div>
                      <h4 class="lead-portfolio-card-title">${escapeHtml(p.name)}</h4>
                      <div class="lead-portfolio-card-meta">
                        <span class="badge badge-info" style="font-size:10.5px">Mã: ${escapeHtml(p.code || 'PRJ')}</span>
                        <span>Phiên bản: <strong>${escapeHtml(p.activeVersion || (p.versions && p.versions[0]?.version) || 'Chưa thiết lập')}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span class="badge" style="background:rgba(22,163,74,0.1); color:${health.color || '#16a34a'}; border:1px solid ${health.color || '#16a34a'}; font-size:11px; font-weight:800">
                      ● ${health.score}/100 (${health.label})
                    </span>
                  </div>
                </div>

                <!-- Thanh tiến độ kiểm thử -->
                <div class="lead-portfolio-progress-wrap" style="margin-top:16px">
                  <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin-bottom:6px">
                    <span>Tiến độ thực thi kiểm thử</span>
                    <span style="color:#16a34a">${pass} / ${totalTcs} bài (${passPercent}%)</span>
                  </div>
                  <div class="lead-portfolio-progress-bar">
                    <div style="width:${passPercent}%; background:#16a34a" title="Đạt: ${pass} bài"></div>
                    <div style="width:${failPercent}%; background:#dc2626" title="Lỗi: ${fail} bài"></div>
                    <div style="width:${untestedPercent}%; background:#e2e8f0" title="Chưa kiểm thử"></div>
                  </div>
                </div>

                <!-- Thống kê 3 ô cốt lõi -->
                <div class="lead-portfolio-stat-grid" style="margin-top:14px">
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val" style="color:#2563eb">${(p.versions || []).length || 1}</div>
                    <div class="lead-portfolio-stat-lbl">Phiên bản (Ver)</div>
                  </div>
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val">${totalTcs}</div>
                    <div class="lead-portfolio-stat-lbl">Kịch bản chuẩn</div>
                  </div>
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val" style="color:#7c3aed">${cycles.length}</div>
                    <div class="lead-portfolio-stat-lbl">Đợt test (${activeCycles.length} mở)</div>
                  </div>
                </div>
              </div>

              <!-- Nút hành động vào không gian riêng của dự án -->
              <div style="margin-top:14px">
                <a href="project.html?projectId=${encodeURIComponent(p.id)}" class="btn-enter-workspace">
                  <span>🚀 Vào không gian dự án</span>
                  <span>➔</span>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Render Bảng đối soát đa dự án (Table View)
   */
  renderProjectsTable(container, projects) {
    container.innerHTML = `
      <div class="lead-matrix-card">
        <table class="lead-matrix-table">
          <thead>
            <tr>
              <th>Mã DA</th>
              <th>Tên Dự Án</th>
              <th>Phiên Bản</th>
              <th style="text-align:center">Kịch Bản</th>
              <th style="text-align:center">Đợt Test</th>
              <th style="text-align:center">Nhân Sự</th>
              <th style="text-align:center">Đạt (%)</th>
              <th style="text-align:center">Lỗi Mở</th>
              <th style="text-align:center">Sức Khỏe</th>
              <th style="text-align:right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => {
              const tcs = p.testCases || [];
              const totalTcs = tcs.length;
              const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : [];
              const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : [];
              const defects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
              const openDefects = defects.filter(d => d.defectStatus !== 'Closed').length;

              let pass = 0;
              const results = state.results || {};
              Object.keys(results).forEach(k => {
                const r = results[k];
                if (r && r.projectId === p.id && (r.status || '').toUpperCase() === 'PASS') pass++;
              });
              const passPercent = totalTcs > 0 ? Math.round((pass / totalTcs) * 100) : 0;

              const health = typeof calculateProjectHealthMetrics === 'function' 
                ? calculateProjectHealthMetrics(p) 
                : { score: 100, label: 'Khởi tạo', color: '#16a34a' };

              return `
                <tr>
                  <td>
                    <span class="badge badge-info" style="font-weight:800; font-size:11px">${escapeHtml(p.code || 'PRJ')}</span>
                  </td>
                  <td>
                    <div style="font-weight:800; color:var(--text-primary); font-size:14px">${escapeHtml(p.name)}</div>
                  </td>
                  <td>
                    <span class="badge badge-draft" style="font-size:11px">${escapeHtml(p.activeVersion || (p.versions && p.versions[0]?.version) || 'Chưa có')}</span>
                  </td>
                  <td style="text-align:center; font-weight:700">${totalTcs}</td>
                  <td style="text-align:center; font-weight:700">${cycles.length}</td>
                  <td style="text-align:center; font-weight:700">${members.length}</td>
                  <td style="text-align:center">
                    <strong style="color:#16a34a">${passPercent}%</strong>
                  </td>
                  <td style="text-align:center">
                    <span style="font-weight:800; color:${openDefects > 0 ? '#dc2626' : '#16a34a'}">
                      ${openDefects}
                    </span>
                  </td>
                  <td style="text-align:center">
                    <span class="badge" style="background:rgba(22,163,74,0.1); color:${health.color || '#16a34a'}; border:1px solid ${health.color || '#16a34a'}; font-size:11px; font-weight:800">
                      ${health.score}/100
                    </span>
                  </td>
                  <td style="text-align:right">
                    <a href="project.html?projectId=${encodeURIComponent(p.id)}" class="btn-lead-action btn-lead-primary" style="padding:6px 14px; font-size:12px">
                      Vào dự án ➔
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Giám sát phân bổ nhân sự (Tester/Dev) trên các dự án Leader quản lý
   */
  renderResourceAllocation() {
    const container = document.getElementById('lead-portfolio-resources-list');
    if (!container) return;

    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();
    const users = getUsers();

    // Thu thập danh sách nhân sự tham gia vào các dự án của Leader
    const relevantUsersMap = {};

    projects.forEach(p => {
      const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : [];
      members.forEach(m => {
        if (!relevantUsersMap[m.username]) {
          const userObj = users.find(u => u.username === m.username) || m;
          relevantUsersMap[m.username] = {
            ...userObj,
            projectRoles: {},
            assignedCount: 0
          };
        }
        relevantUsersMap[m.username].projectRoles[p.id] = {
          projectCode: p.code,
          projectName: p.name,
          role: m.projectRole,
          title: m.title
        };
      });
    });

    // Đếm số bài test được giao cho từng nhân sự
    (state.assignments || []).forEach(a => {
      if (relevantUsersMap[a.assigneeUsername]) {
        relevantUsersMap[a.assigneeUsername].assignedCount++;
      }
    });

    const membersList = Object.values(relevantUsersMap);

    if (membersList.length === 0) {
      container.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px">
          Chưa có nhân sự nào được phân bổ vào các dự án của bạn.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px">
        ${membersList.map(m => {
          const pCodes = Object.values(m.projectRoles).map(r => r.projectCode).join(', ');
          const roleBadge = (m.role === 'admin' || m.role === 'project_lead')
            ? '<span class="badge badge-p1">👑 Trưởng dự án</span>'
            : (m.role === 'developer' || m.role === 'dev')
              ? '<span class="badge" style="background:rgba(139,92,246,0.1); color:#7c3aed; border:1px solid rgba(139,92,246,0.3)">💻 Lập trình viên</span>'
              : '<span class="badge badge-info">🧪 Kiểm thử viên</span>';

          return `
            <div style="padding:14px 16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; display:flex; align-items:center; justify-content:space-between">
              <div style="display:flex; align-items:center; gap:12px">
                <div class="user-avatar-circle" style="width:38px; height:38px; border-radius:50%; background:var(--primary-subtle); color:var(--primary); font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center">
                  ${(m.name || m.username || 'U').substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <div style="font-weight:800; color:var(--text-primary); font-size:13.5px">${escapeHtml(m.name || m.username)}</div>
                  <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px">
                    Dự án: <strong>${escapeHtml(pCodes || 'Chưa gán')}</strong>
                  </div>
                </div>
              </div>
              <div style="text-align:right">
                <div>${roleBadge}</div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:4px">
                  Giao: <strong>${m.assignedCount}</strong> bài test
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};

// Export toàn cục để Cloud-Sync và Realtime có thể gọi re-render
if (typeof window !== 'undefined') {
  window.LeadPortfolio = LeadPortfolio;
}
