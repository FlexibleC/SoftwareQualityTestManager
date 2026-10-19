/**
 * LEAD MODULE: PROJECT CONTEXT & NAVIGATION
 * Quản trị ngữ cảnh làm việc của Quản Trị Viên Dự Án (Project Lead)
 */

const LeadContext = {
  init() {
    this.resolveActiveProject();
    this.renderProjectHeader();
    this.bindProjectSwitcher();
    this.renderUserInfo();
  },

  resolveActiveProject() {
    const params = new URLSearchParams(window.location.search);
    const paramPrjId = params.get('projectId');
    
    if (paramPrjId) {
      state.activeProjectId = paramPrjId;
      sessionStorage.setItem('smartvms_active_project_id', paramPrjId);
    } else {
      const savedId = sessionStorage.getItem('smartvms_active_project_id') || localStorage.getItem('smartvms_active_project_id');
      if (savedId && (state.projects || []).some(p => p.id === savedId)) {
        state.activeProjectId = savedId;
      }
    }

    if (!state.activeProjectId && state.projects && state.projects.length > 0) {
      state.activeProjectId = state.projects[0].id;
    }
  },

  renderUserInfo() {
    const u = getCurrentUser();
    const nameEl = document.getElementById('lead-user-name');
    const roleEl = document.getElementById('lead-user-role');
    if (nameEl && u) nameEl.textContent = u.name || u.username;
    if (roleEl && u) roleEl.textContent = u.roleTitle || 'Quản trị viên Dự án';
  },

  renderProjectHeader() {
    const hero = document.getElementById('lead-project-hero');
    if (!hero) return;

    const p = getActiveProject();
    const projects = getAllProjects();

    if (!p) {
      hero.innerHTML = `
        <div style="padding:24px; text-align:center; width:100%">
          <div style="font-size:36px; margin-bottom:8px">🏢</div>
          <h3 style="margin:0 0 6px 0; color:var(--text-primary)">Chưa chọn dự án nào</h3>
          <p style="color:var(--text-muted); font-size:13px; margin:0 0 16px 0">Vui lòng khởi tạo dự án trên Cổng Quản Trị Hệ Thống hoặc chọn một dự án có sẵn.</p>
          <a href="../admin/index.html" class="btn btn-primary btn-sm">⬅ Về Cổng Quản Trị Cấp Cao</a>
        </div>
      `;
      return;
    }

    const tcsCount = (p.testCases || []).length;
    const cyclesCount = (p.testCycles || []).length;
    const members = getProjectMembers(p.id);

    hero.innerHTML = `
      <div class="lead-project-info-wrap">
        <div class="lead-project-cube">
          ${(p.code || 'PRJ').substring(0, 3)}
        </div>
        <div>
          <div class="lead-project-tagline">
            <span>👑</span> KHÔNG GIAN ĐIỀU HÀNH DỰ ÁN
          </div>
          <h1 class="lead-project-heading">${p.name}</h1>
          <div class="lead-project-meta-strip">
            <span>Mã: <strong>${p.code || 'PRJ'}</strong></span>
            <span>•</span>
            <span class="badge badge-info" style="font-size:10.5px">Phiên bản: ${p.activeVersion || 'v1.0'}</span>
            <span>•</span>
            <span>Thư viện: <strong>${tcsCount}</strong> Kịch bản</span>
            <span>•</span>
            <span>Chu kỳ: <strong>${cyclesCount}</strong> Đợt test</span>
            <span>•</span>
            <span>Nhân sự: <strong>${members.length}</strong> Người</span>
          </div>
        </div>
      </div>

      <div class="lead-project-tools">
        <div style="display:flex; align-items:center; gap:6px">
          <span style="font-size:12px; color:var(--text-muted); font-weight:700">Đổi dự án:</span>
          <select class="lead-project-select" onchange="LeadContext.switchProject(this.value)">
            ${projects.map(proj => `
              <option value="${proj.id}" ${proj.id === p.id ? 'selected' : ''}>
                [${proj.code}] ${proj.name}
              </option>
            `).join('')}
          </select>
        </div>
        <a href="../admin/index.html" class="btn btn-outline btn-sm" title="Về Cổng Quản Trị Cấp Cao Hệ Thống">
          🛡️ Cổng Super Admin
        </a>
      </div>
    `;
  },

  switchProject(newProjectId) {
    if (!newProjectId || newProjectId === state.activeProjectId) return;
    state.activeProjectId = newProjectId;
    sessionStorage.setItem('smartvms_active_project_id', newProjectId);
    saveCoreState();
    
    const curPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = curPage + '?projectId=' + encodeURIComponent(newProjectId);
  },

  bindProjectSwitcher() {
    const selects = document.querySelectorAll('#lead-project-select');
    selects.forEach(sel => {
      if (sel && state.activeProjectId) {
        sel.value = state.activeProjectId;
      }
    });
  }
};
