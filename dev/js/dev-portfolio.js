/**
 * DEVELOPER MODULE: PORTFOLIO HUB LOGIC (dev-portfolio.js)
 * TẦNG 0: Bàn điều hành danh mục dự án phụ trách của Lập Trình Viên
 */

const DevPortfolio = {
  viewMode: 'table', // 'table' | 'cards'

  init() {
    DevContext.init(0);
    this.renderKPIs();
    this.renderUrgentBanner();
    this.renderProjects();
  },

  switchViewMode(mode) {
    this.viewMode = mode;
    const btnTable = document.getElementById('btn-view-table');
    const btnCards = document.getElementById('btn-view-cards');
    if (btnTable && btnCards) {
      if (mode === 'table') {
        btnTable.className = 'btn btn-primary btn-sm';
        btnCards.className = 'btn btn-outline btn-sm';
      } else {
        btnTable.className = 'btn btn-outline btn-sm';
        btnCards.className = 'btn btn-primary btn-sm';
      }
    }
    this.renderProjects();
  },

  renderKPIs() {
    const user = getCurrentUser();
    const myProjects = DevContext.getAssignedProjectsForDev(user);

    let totalBugs = 0;
    let blockerCount = 0;
    let reopenedCount = 0;
    let fixedCount = 0;

    myProjects.forEach(p => {
      const defects = DevContext.getAllDefectsForContext(p.id);
      defects.forEach(d => {
        totalBugs++;
        if (d.severity === 'Blocker' || d.severity === 'Critical') blockerCount++;
        if (d.defectStatus === 'Reopened') reopenedCount++;
        if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') fixedCount++;
      });
    });

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('dev-kpi-projects', myProjects.length);
    setVal('dev-kpi-total-bugs', totalBugs);
    setVal('dev-kpi-blocker', blockerCount);
    setVal('dev-kpi-reopened', reopenedCount);
    setVal('dev-kpi-fixed', fixedCount);
  },

  renderUrgentBanner() {
    const container = document.getElementById('dev-urgent-banner-wrap');
    if (!container) return;

    const user = getCurrentUser();
    const myProjects = DevContext.getAssignedProjectsForDev(user);

    let urgentBugs = [];
    myProjects.forEach(p => {
      const defects = DevContext.getAllDefectsForContext(p.id);
      defects.forEach(d => {
        if (d.defectStatus === 'Reopened' || d.severity === 'Blocker') {
          urgentBugs.push({ ...d, projectName: p.name });
        }
      });
    });

    if (urgentBugs.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="dev-urgent-banner">
        <div class="dev-urgent-left">
          <div class="dev-urgent-icon">🔥</div>
          <div>
            <div class="dev-urgent-title">Cảnh báo: Có ${urgentBugs.length} sự cố khẩn cấp mức tê liệt hoặc lỗi tái phát cần xử lý ngay!</div>
            <div class="dev-urgent-desc">Các lỗi này đang chặn quy trình kiểm thử hoặc bị Tester trả về do bản vá chưa triệt để. Vui lòng ưu tiên điều tra trước.</div>
          </div>
        </div>
        <div>
          <a href="project.html?projectId=${urgentBugs[0].projectId}" class="btn btn-sm" style="background:#dc2626; color:#fff; font-weight:700">
            Xem ngay tại ${escapeHtml(urgentBugs[0].projectName)} ➔
          </a>
        </div>
      </div>
    `;
  },

  renderProjects() {
    const container = document.getElementById('dev-portfolio-container');
    if (!container) return;

    const user = getCurrentUser();
    const myProjects = DevContext.getAssignedProjectsForDev(user);
    const kw = (document.getElementById('dev-search-input')?.value || '').trim().toLowerCase();

    const filtered = myProjects.filter(p => {
      if (!kw) return true;
      return (p.name || '').toLowerCase().includes(kw) || (p.code || '').toLowerCase().includes(kw);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:48px 24px; color:var(--text-muted)">
          <div style="font-size:36px; margin-bottom:12px">🏢</div>
          <div style="font-size:15px; font-weight:700; color:var(--text-primary)">Không tìm thấy dự án nào</div>
          <p style="font-size:13px; margin-top:4px">Bạn chưa được phân bổ vào dự án nào hoặc từ khóa tìm kiếm không khớp.</p>
        </div>
      `;
      return;
    }

    if (this.viewMode === 'table') {
      this.renderTableView(container, filtered);
    } else {
      this.renderCardView(container, filtered);
    }
  },

  renderTableView(container, projects) {
    const rows = projects.map(p => {
      const defects = DevContext.getAllDefectsForContext(p.id);
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

      // Progress percentages
      const pFixed = total > 0 ? (fixedCount / total * 100) : 0;
      const pWip = total > 0 ? (wipCount / total * 100) : 0;
      const pNew = total > 0 ? (newCount / total * 100) : 0;
      const pReopened = total > 0 ? (reopenedCount / total * 100) : 0;

      const leadMember = (p.members || []).find(m => m.projectRole === 'lead' || m.project_role === 'lead' || m.username === p.lead || m.username === 'lead');
      const leadObj = (state.users || []).find(u => u.username === p.lead || u.role === 'project_lead');
      const leadName = leadMember ? leadMember.name : (p.leadName || (leadObj ? leadObj.name : (p.lead || 'Chưa gán')));

      return `
        <tr>
          <td>
            <span class="badge" style="background:#0f172a; color:#38bdf8; font-family:monospace; font-weight:800; font-size:11px">
              ${escapeHtml(p.code || p.id)}
            </span>
          </td>
          <td>
            <div style="font-weight:700; font-size:13px; color:var(--text-primary)">${escapeHtml(p.name)}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px">
              👑 Trưởng dự án: <strong>${escapeHtml(leadName)}</strong>
            </div>
          </td>
          <td>
            <span class="badge" style="background:rgba(2, 132, 199, 0.12); color:#0284c7; font-weight:700">
              📦 ${escapeHtml(p.activeVersion || 'v1.0')}
            </span>
          </td>
          <td style="min-width:200px">
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px">
              <span style="color:#7c3aed">Đã fix: ${fixedCount}</span>
              <span style="color:#f59e0b">Đang sửa: ${wipCount}</span>
              <span style="color:#dc2626">Mới/Tái phát: ${newCount + reopenedCount}</span>
            </div>
            <div class="dev-progress-track" title="Tỷ lệ khắc phục lỗi dự án">
              <div class="dev-seg-fixed" style="width:${pFixed}%"></div>
              <div class="dev-seg-wip" style="width:${pWip}%"></div>
              <div class="dev-seg-new" style="width:${pNew}%"></div>
              <div class="dev-seg-reopened" style="width:${pReopened}%"></div>
            </div>
          </td>
          <td style="text-align:center">
            <strong style="font-size:14px; color:var(--text-primary)">${total}</strong>
          </td>
          <td style="text-align:center">
            ${blockerCount > 0 
              ? `<span class="sev-badge sev-critical">🔴 ${blockerCount}</span>` 
              : `<span style="color:var(--text-muted); font-size:11px">—</span>`}
          </td>
          <td style="text-align:center">
            ${reopenedCount > 0 
              ? `<span class="st-badge st-reopened">🔥 ${reopenedCount}</span>` 
              : `<span style="color:var(--text-muted); font-size:11px">—</span>`}
          </td>
          <td style="text-align:center">
            <a href="project.html?projectId=${p.id}" class="btn btn-primary btn-xs" style="white-space:nowrap">
              🚀 Vào dự án ➔
            </a>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="card" style="padding:0; overflow:hidden">
        <div class="table-responsive">
          <table class="report-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:110px">Mã dự án</th>
                <th>Tên dự án & Trưởng dự án</th>
                <th style="width:110px">Phiên bản</th>
                <th>Phân bổ tiến độ lỗi</th>
                <th style="width:80px; text-align:center">Tổng bug</th>
                <th style="width:100px; text-align:center">Blocker</th>
                <th style="width:110px; text-align:center">Tái phát</th>
                <th style="width:130px; text-align:center">Thao tác</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderCardView(container, projects) {
    const cards = projects.map(p => {
      const defects = DevContext.getAllDefectsForContext(p.id);
      const total = defects.length;
      let fixedCount = 0;
      let blockerCount = 0;
      let reopenedCount = 0;

      defects.forEach(d => {
        if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') fixedCount++;
        if (d.severity === 'Blocker' || d.severity === 'Critical') blockerCount++;
        if (d.defectStatus === 'Reopened') reopenedCount++;
      });

      return `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-left:4px solid #0284c7">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
              <span class="badge" style="background:#0f172a; color:#38bdf8; font-family:monospace; font-weight:800; font-size:11px">
                ${escapeHtml(p.code || p.id)}
              </span>
              <span class="badge" style="background:rgba(2,132,199,0.12); color:#0284c7; font-weight:700">
                📦 ${escapeHtml(p.activeVersion || 'v1.0')}
              </span>
            </div>
            <h3 style="font-size:15px; font-weight:800; color:var(--text-primary); margin:0 0 6px 0">
              ${escapeHtml(p.name)}
            </h3>
            <p style="font-size:12px; color:var(--text-muted); margin:0 0 12px 0; line-height:1.4">
              ${escapeHtml(p.description || 'Không có mô tả chi tiết')}
            </p>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; background:var(--bg-body); padding:10px; border-radius:6px; margin-bottom:12px; text-align:center">
              <div>
                <div style="font-size:16px; font-weight:800; color:var(--text-primary)">${total}</div>
                <div style="font-size:10px; color:var(--text-muted); font-weight:700">TỔNG BUG</div>
              </div>
              <div>
                <div style="font-size:16px; font-weight:800; color:#dc2626">${blockerCount}</div>
                <div style="font-size:10px; color:#dc2626; font-weight:700">BLOCKER</div>
              </div>
              <div>
                <div style="font-size:16px; font-weight:800; color:#b91c1c">${reopenedCount}</div>
                <div style="font-size:10px; color:#b91c1c; font-weight:700">TÁI PHÁT</div>
              </div>
            </div>
          </div>
          <div>
            <a href="project.html?projectId=${p.id}" class="btn btn-primary btn-block" style="text-align:center">
              🚀 Vào không gian dự án ➔
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
  }
};

if (typeof window !== 'undefined') {
  window.DevPortfolio = DevPortfolio;
}
