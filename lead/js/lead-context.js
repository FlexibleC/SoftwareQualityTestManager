/**
 * LEAD MODULE: PROJECT CONTEXT & NAVIGATION
 * Quản trị ngữ cảnh làm việc của Quản Trị Viên Dự Án (Project Lead)
 */

const LeadContext = {
  init() {
    this.resolveActiveProject();
    this.renderUserInfo();
    this.renderProjectHeader();
    this.bindProjectSwitcher();
  },

  resolveActiveProject() {
    const available = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();
    const params = new URLSearchParams(window.location.search);
    const paramPrjId = params.get('projectId');
    
    if (paramPrjId && available.some(p => p.id === paramPrjId)) {
      state.activeProjectId = paramPrjId;
      sessionStorage.setItem('smartvms_active_project_id', paramPrjId);
    } else {
      const savedId = sessionStorage.getItem('smartvms_active_project_id') || localStorage.getItem('smartvms_active_project_id');
      if (savedId && available.some(p => p.id === savedId)) {
        state.activeProjectId = savedId;
      } else if (available.length > 0) {
        state.activeProjectId = available[0].id;
      }
    }

    if (!state.activeProjectId && available.length > 0) {
      state.activeProjectId = available[0].id;
    }
  },

  renderUserInfo() {
    const u = getCurrentUser();
    const nameEl = document.getElementById('lead-user-name');
    const roleEl = document.getElementById('lead-user-role');
    const avatarEl = document.getElementById('lead-user-avatar') || document.querySelector('.vms-user-avatar');

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

  renderProjectHeader() {
    const hero = document.getElementById('lead-project-hero');
    if (!hero) return;

    const p = getActiveProject();
    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();
    const u = getCurrentUser();

    if (!p) {
      hero.innerHTML = `
        <div style="padding:28px 20px; text-align:center; width:100%">
          <div style="font-size:36px; margin-bottom:8px">🏢</div>
          <h3 style="margin:0 0 6px 0; color:var(--text-primary)">Chưa chọn dự án nào</h3>
          <p style="color:var(--text-muted); font-size:13px; margin:0 0 16px 0">
            Hiện tại bạn chưa được phân bổ vào dự án nào hoặc chưa có dự án sẵn sàng.
          </p>
          ${u && u.role === 'admin' ? '<a href="../admin/index.html" class="btn btn-primary btn-sm">⬅ Về cổng quản trị hệ thống</a>' : ''}
        </div>
      `;
      return;
    }

    const tcsCount = (p.testCases || []).length;
    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : [];
    const cyclesCount = cycles.length;
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : [];

    hero.innerHTML = `
      <div class="lead-project-info-wrap">
        <div class="lead-project-cube">
          ${(p.code || 'PRJ').substring(0, 3)}
        </div>
        <div>
          <div class="lead-project-tagline">
            <span>👑</span> Không gian điều hành dự án
          </div>
          <h1 class="lead-project-heading">${p.name}</h1>
          <div class="lead-project-meta-strip">
            <span>Mã: <strong>${p.code || 'PRJ'}</strong></span>
            <span>•</span>
            <span class="badge badge-info" style="font-size:10.5px">Phiên bản: ${p.activeVersion || 'v1.0'}</span>
            <span>•</span>
            <span>Thư viện: <strong>${tcsCount}</strong> kịch bản</span>
            <span>•</span>
            <span>Chu kỳ: <strong>${cyclesCount}</strong> đợt test</span>
            <span>•</span>
            <span>Nhân sự: <strong>${members.length}</strong> người</span>
          </div>
        </div>
      </div>

      <div class="lead-project-tools">
        <div style="display:flex; align-items:center; gap:8px">
          <span style="font-size:12px; color:var(--text-muted); font-weight:600">Đổi dự án:</span>
          <select class="lead-project-select" onchange="LeadContext.switchProject(this.value)">
            ${projects.map(proj => `
              <option value="${proj.id}" ${proj.id === p.id ? 'selected' : ''}>
                [${proj.code}] ${proj.name}
              </option>
            `).join('')}
          </select>
        </div>
        ${u && u.role === 'admin' ? `
          <a href="../admin/index.html" class="btn btn-outline btn-sm" title="Về cổng quản trị cấp cao hệ thống">
            🛡️ Cổng Super Admin
          </a>
        ` : ''}
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
