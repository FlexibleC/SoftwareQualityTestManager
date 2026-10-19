/**
 * ADMIN MODULE: PROJECT WORKSPACE CONTEXT BAR
 * Quản trị Ngữ cảnh Làm việc Khép kín Trong Dự Án (Project-Scoped Context)
 * Đảm bảo người dùng luôn biết rõ đang làm việc trong dự án nào và có lối thoát về Cổng Cấp Cao
 */

const AdminProjectContext = {
  init() {
    this.resolveActiveProject();
    this.renderContextBar();
    this.bindProjectSwitchers();
  },

  /**
   * Đồng bộ ID dự án từ Query Param (?projectId=...) hoặc LocalStorage
   */
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

    // Nếu vẫn chưa có dự án active nhưng có danh sách dự án
    if (!state.activeProjectId && state.projects && state.projects.length > 0) {
      state.activeProjectId = state.projects[0].id;
    }
  },

  /**
   * Render thanh thông tin ngữ cảnh dự án nổi bật ngay dưới Topbar
   */
  renderContextBar() {
    let bar = document.getElementById('project-workspace-context-bar');
    if (!bar) {
      // Tự động chèn thanh ngữ cảnh vào trước thẻ main nếu chưa có
      const main = document.querySelector('main');
      if (!main) return;
      bar = document.createElement('div');
      bar.id = 'project-workspace-context-bar';
      bar.className = 'project-workspace-context-bar';
      main.parentNode.insertBefore(bar, main);
    }

    const p = getActiveProject();
    const projects = getAllProjects();

    if (!p) {
      bar.innerHTML = `
        <div class="context-bar-inner warning-state">
          <div class="context-bar-left">
            <span class="context-icon">⚠️</span>
            <div>
              <strong>Chưa chọn không gian dự án làm việc</strong>
              <div style="font-size:11.5px; opacity:0.85">Hãy quay lại Cổng Quản Trị Hệ Thống để chọn một dự án cụ thể.</div>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-xs" onclick="exitProjectWorkspace('index.html')">
            ⬅ Về Cổng Quản Trị Hệ Thống
          </button>
        </div>
      `;
      return;
    }

    const tcsCount = (p.testCases || []).length;
    const members = getProjectMembers(p.id);

    bar.innerHTML = `
      <div class="context-bar-inner">
        <div class="context-bar-left">
          <div class="context-badge-cube">${(p.code || 'PRJ').substring(0, 3)}</div>
          <div>
            <div class="context-prj-title-row">
              <span class="context-tag-scope">KHÔNG GIAN LÀM VIỆC DỰ ÁN</span>
              <h2 class="context-prj-name">${p.name}</h2>
              <span class="badge badge-info" style="font-size:10.5px">Phiên bản: ${p.activeVersion || 'v1.0'}</span>
            </div>
            <div class="context-meta-line">
              Mã: <strong>${p.code}</strong> • Thư viện: <strong>${tcsCount}</strong> Kịch bản • Nhân sự phụ trách: <strong>${members.length}</strong> thành viên
            </div>
          </div>
        </div>

        <div class="context-bar-right">
          <div class="quick-prj-switch">
            <span style="font-size:11.5px; color:var(--text-muted); font-weight:600">Đổi dự án:</span>
            <select class="context-select" onchange="AdminProjectContext.switchWorkspace(this.value)">
              ${projects.map(proj => `
                <option value="${proj.id}" ${proj.id === p.id ? 'selected' : ''}>
                  [${proj.code}] ${proj.name}
                </option>
              `).join('')}
            </select>
          </div>
          <button 
            type="button" 
            class="btn btn-outline btn-sm btn-return-console" 
            onclick="exitProjectWorkspace('index.html')"
            title="Quay lại Cổng Quản Trị Cấp Cao Hệ Thống"
          >
            ⬅ Cổng Hệ Thống
          </button>
        </div>
      </div>
    `;
  },

  switchWorkspace(newProjectId) {
    if (!newProjectId || newProjectId === state.activeProjectId) return;
    enterProjectWorkspace(newProjectId, window.location.pathname.split('/').pop() || 'testcases.html');
  },

  bindProjectSwitchers() {
    // Tự động đồng bộ các select cũ nếu có
    const selects = document.querySelectorAll('#dash-project-select, #asg-project-select, #tc-project-select');
    selects.forEach(sel => {
      if (sel && state.activeProjectId) {
        sel.value = state.activeProjectId;
      }
    });
  }
};
