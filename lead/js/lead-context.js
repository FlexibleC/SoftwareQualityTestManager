/**
 * LEAD MODULE: PROJECT CONTEXT & COMPACT NAVIGATION (TẦNG 2)
 * Quản trị ngữ cảnh làm việc khép kín của từng dự án
 * Thiết kế 2 dải chuẩn Enterprise: Không gian thoáng đãng, không bị co cụm chữ
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
   * Render Thanh ngữ cảnh dự án 2 dải đẳng cấp Enterprise
   */
  renderCompactProjectBar() {
    const container = document.getElementById('lead-compact-bar') || document.getElementById('lead-project-hero');
    if (!container) return;

    const p = getActiveProject();
    const projects = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();

    if (!p) {
      container.className = 'lead-project-scope-header';
      container.innerHTML = `
        <div class="lead-scope-inner">
          <div class="lead-scope-left">
            <a href="index.html" class="btn-back-hub">⬅ Về danh mục dự án</a>
            <span style="color:var(--text-muted); font-size:13px; font-weight:600">Chưa chọn dự án nào</span>
          </div>
        </div>
      `;
      return;
    }

    const tId = encodeURIComponent(p.id);

    container.className = '';
    container.innerHTML = `
      <!-- Dải 1: Định danh dự án & Điều hướng cấp cao -->
      <div class="lead-project-scope-header">
        <div class="lead-scope-inner">
          <div class="lead-scope-left">
            <a href="index.html" class="btn-back-hub" title="Quay về Trung tâm điều hành danh mục dự án">
              <span>⬅</span>
              <span>Danh mục dự án</span>
            </a>

            <div class="lead-scope-divider"></div>

            <div class="lead-scope-cube">
              ${(p.code || 'PRJ').substring(0, 3)}
            </div>

            <div class="lead-scope-info">
              <div class="lead-scope-title-row">
                <h2 class="lead-scope-title">${escapeHtml(p.name)}</h2>
                <span class="badge badge-info" style="font-size:11px; font-weight:800">Mã: ${escapeHtml(p.code || 'PRJ')}</span>
                <span class="badge badge-pass" style="font-size:11px; font-weight:800">Phiên bản: ${escapeHtml(p.activeVersion || 'v1.0')}</span>
              </div>
            </div>
          </div>

          <div class="lead-scope-right">
            <div class="lead-switcher-wrap">
              <span class="lead-switcher-lbl">Đổi dự án khác:</span>
              <select class="lead-quick-select" onchange="LeadContext.switchProject(this.value)">
                ${projects.map(proj => `
                  <option value="${proj.id}" ${proj.id === p.id ? 'selected' : ''}>
                    [${proj.code}] ${proj.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Dải 2: 5 Tab phân hệ khép kín nội bộ dự án -->
      <nav class="lead-project-subnav" role="navigation">
        <div class="lead-subnav-inner">
          <a href="project.html?projectId=${tId}" class="lead-subnav-tab ${this.activeTab === 'project' ? 'active' : ''}">
            <span style="font-size:15px">📊</span>
            <span>Tổng quan dự án</span>
          </a>
          <a href="testcases.html?projectId=${tId}" class="lead-subnav-tab ${this.activeTab === 'testcases' ? 'active' : ''}">
            <span style="font-size:15px">📋</span>
            <span>Kịch bản kiểm thử</span>
          </a>
          <a href="assignments.html?projectId=${tId}" class="lead-subnav-tab ${this.activeTab === 'assignments' ? 'active' : ''}">
            <span style="font-size:15px">📌</span>
            <span>Kế hoạch & Giao việc</span>
          </a>
          <a href="reports.html?projectId=${tId}" class="lead-subnav-tab ${this.activeTab === 'reports' ? 'active' : ''}">
            <span style="font-size:15px">📈</span>
            <span>Báo cáo chất lượng</span>
          </a>
          <a href="settings.html?projectId=${tId}" class="lead-subnav-tab ${this.activeTab === 'settings' ? 'active' : ''}">
            <span style="font-size:15px">⚙️</span>
            <span>Cài đặt dự án</span>
          </a>
        </div>
      </nav>
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
