/**
 * LEAD MODULE: PROJECT CONTEXT & COMPACT NAVIGATION (TẦNG 2)
 * Quản trị ngữ cảnh làm việc khép kín của từng dự án
 */

const LeadContext = {
  activeTab: 'project', // 'project' | 'testcases' | 'assignments' | 'reports' | 'settings'

  init(currentTab = '') {
    this.detectCurrentTab(currentTab);
    this.resolveActiveProject();
    this.renderUserInfo();
    this.renderCompactProjectBar();
  },

  detectCurrentTab(tabHint) {
    if (tabHint) {
      this.activeTab = tabHint;
      return;
    }
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('testcases')) this.activeTab = 'testcases';
    else if (path.includes('assignments')) this.activeTab = 'assignments';
    else if (path.includes('reports')) this.activeTab = 'reports';
    else if (path.includes('settings')) this.activeTab = 'settings';
    else this.activeTab = 'project';
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
   * Render Thanh điều hướng dự án tinh gọn (Compact Project Navigation Bar)
   */
  renderCompactProjectBar() {
    const container = document.getElementById('lead-compact-bar') || document.getElementById('lead-project-hero');
    if (!container) return;

    const p = getActiveProject();
    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();

    if (!p) {
      container.innerHTML = `
        <div style="padding:16px 24px; display:flex; align-items:center; justify-content:space-between">
          <div style="display:flex; align-items:center; gap:12px">
            <a href="index.html" class="btn-back-hub">⬅ Về danh mục dự án</a>
            <span style="color:var(--text-muted); font-size:13px">Chưa chọn dự án nào</span>
          </div>
        </div>
      `;
      return;
    }

    const tId = encodeURIComponent(p.id);

    container.className = 'lead-compact-bar';
    container.innerHTML = `
      <div class="lead-compact-bar-inner">
        <!-- Vùng bên trái: Nút quay lại danh mục + Tên dự án -->
        <div class="lead-compact-left">
          <a href="index.html" class="btn-back-hub" title="Quay về Trung tâm điều hành danh mục dự án">
            <span>⬅</span>
            <span>Danh mục dự án</span>
          </a>

          <div class="lead-compact-breadcrumb">
            <div class="lead-compact-cube">
              ${(p.code || 'PRJ').substring(0, 3)}
            </div>
            <div class="lead-compact-title-wrap">
              <h2 class="lead-compact-title">${escapeHtml(p.name)}</h2>
              <div class="lead-compact-meta">
                <span>Mã: <strong>${escapeHtml(p.code || 'PRJ')}</strong></span>
                <span>•</span>
                <span class="badge badge-info" style="font-size:10.5px">Phiên bản: ${escapeHtml(p.activeVersion || 'v1.0')}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vùng giữa: 5 Tabs phân hệ khép kín của dự án -->
        <nav class="lead-project-tabs" role="navigation">
          <a href="project.html?projectId=${tId}" class="lead-project-tab ${this.activeTab === 'project' ? 'active' : ''}">
            <span>📊</span>
            <span>Tổng quan</span>
          </a>
          <a href="testcases.html?projectId=${tId}" class="lead-project-tab ${this.activeTab === 'testcases' ? 'active' : ''}">
            <span>📋</span>
            <span>Kịch bản kiểm thử</span>
          </a>
          <a href="assignments.html?projectId=${tId}" class="lead-project-tab ${this.activeTab === 'assignments' ? 'active' : ''}">
            <span>📌</span>
            <span>Điều phối & giao việc</span>
          </a>
          <a href="reports.html?projectId=${tId}" class="lead-project-tab ${this.activeTab === 'reports' ? 'active' : ''}">
            <span>📈</span>
            <span>Báo cáo chất lượng</span>
          </a>
          <a href="settings.html?projectId=${tId}" class="lead-project-tab ${this.activeTab === 'settings' ? 'active' : ''}">
            <span>⚙️</span>
            <span>Cài đặt dự án</span>
          </a>
        </nav>

        <!-- Vùng bên phải: Dropdown đổi nhanh sang dự án khác -->
        <div class="lead-quick-switcher">
          <span style="font-size:12px; color:var(--text-muted); font-weight:700">Đổi DA:</span>
          <select class="lead-quick-select" onchange="LeadContext.switchProject(this.value)">
            ${projects.map(proj => `
              <option value="${proj.id}" ${proj.id === p.id ? 'selected' : ''}>
                [${proj.code}] ${proj.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  },

  switchProject(newProjectId) {
    if (!newProjectId) return;
    state.activeProjectId = newProjectId;
    sessionStorage.setItem('smartvms_active_project_id', newProjectId);
    saveCoreState();
    
    // Giữ nguyên trang con hiện tại khi chuyển dự án
    const curPage = window.location.pathname.split('/').pop() || 'project.html';
    const targetPage = curPage.includes('index.html') ? 'project.html' : curPage;
    window.location.href = targetPage + '?projectId=' + encodeURIComponent(newProjectId);
  }
};
