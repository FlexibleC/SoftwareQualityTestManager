/**
 * ADMIN MODULE: PORTFOLIO MANAGEMENT
 * Quản trị Cấp Cao Danh Mục Dự Án (Global Enterprise Console)
 * Quản lý vòng đời dự án: Tạo mới, Xem tổng quan KPI, Phân bổ và Vào Không Gian Dự Án
 */

const AdminPortfolio = {
  /**
   * Khởi tạo và kết nối sự kiện cho Quản lý Danh mục Dự án
   */
  init() {
    this.renderPortfolioGrid();
    this.renderPortfolioSummaryStats();
  },

  /**
   * Tính toán và hiển thị các số liệu thống kê tổng hợp toàn hệ thống
   */
  renderPortfolioSummaryStats() {
    const projects = getAllProjects();
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status !== 'ARCHIVED').length;
    
    let totalTcs = 0;
    let totalAssigned = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    projects.forEach(p => {
      const tcs = p.testCases || [];
      totalTcs += tcs.length;
    });

    const totalStaff = (state.users && state.users.length > 0) ? state.users.length : DEFAULT_SYSTEM_USERS.length;

    const elTotalProjects = document.getElementById('stat-global-projects');
    const elActiveProjects = document.getElementById('stat-active-projects');
    const elTotalStaff = document.getElementById('stat-global-staff');
    const elTotalTcs = document.getElementById('stat-global-tcs');

    if (elTotalProjects) elTotalProjects.textContent = totalProjects;
    if (elActiveProjects) elActiveProjects.textContent = activeProjects;
    if (elTotalStaff) elTotalStaff.textContent = totalStaff;
    if (elTotalTcs) elTotalTcs.textContent = totalTcs;
  },

  /**
   * Render lưới thẻ các dự án độc lập (Portfolio Cards Grid)
   */
  renderPortfolioGrid() {
    const container = document.getElementById('portfolio-grid-container');
    if (!container) return;

    const projects = getAllProjects();

    if (!projects || projects.length === 0) {
      container.innerHTML = `
        <div class="portfolio-empty-state">
          <div class="empty-icon">🏢</div>
          <h3>Chưa có dự án nào trong hệ thống</h3>
          <p>Bắt đầu bằng việc khởi tạo dự án đầu tiên để cấu hình phân hệ và phân bổ nhân sự kiểm thử.</p>
          <button type="button" class="btn btn-primary" onclick="AdminPortfolio.openCreateProjectModal()">
            ➕ Khởi Tạo Dự Án Mới
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(p => {
      const tcsCount = (p.testCases || []).length;
      const cyclesCount = (p.testCycles || []).length;
      const members = getProjectMembers(p.id);
      const membersCount = members.length;
      
      const lead = members.find(m => m.projectRole === 'lead' || m.projectRole === 'admin') || { name: 'Chưa chỉ định' };
      const testers = members.filter(m => m.projectRole === 'tester');
      const devs = members.filter(m => m.projectRole === 'dev');

      const isCurrentActive = state.activeProjectId === p.id;
      const statusBadge = p.status === 'ARCHIVED' 
        ? '<span class="badge badge-draft">Đã lưu trữ</span>' 
        : '<span class="badge badge-pass">Đang kiểm thử</span>';

      return `
        <div class="project-portfolio-card ${isCurrentActive ? 'active-working' : ''}">
          <div class="portfolio-card-header">
            <div class="project-identity">
              <div class="project-avatar">${(p.code || p.name || 'P').substring(0, 2).toUpperCase()}</div>
              <div>
                <h3 class="project-card-title" title="${p.name}">${p.name}</h3>
                <div class="project-code-row">
                  <span class="project-code-tag">${p.code || 'PRJ'}</span>
                  ${statusBadge}
                  <span class="project-ver-tag">Ver: ${p.activeVersion || 'v1.0'}</span>
                </div>
              </div>
            </div>
          </div>

          <p class="project-card-desc">
            ${p.desc || 'Hệ thống phần mềm độc lập được quản lý theo tiêu chuẩn thẩm định chất lượng.'}
          </p>

          <!-- Core Metric Badges -->
          <div class="portfolio-metrics-row">
            <div class="metric-pill" title="Tổng số kịch bản kiểm thử của dự án">
              <span class="metric-label">Kịch bản:</span>
              <span class="metric-val"><strong>${tcsCount}</strong> TCs</span>
            </div>
            <div class="metric-pill" title="Số vòng/đợt kiểm thử độc lập">
              <span class="metric-label">Đợt test:</span>
              <span class="metric-val"><strong>${cyclesCount}</strong> Chu kỳ</span>
            </div>
            <div class="metric-pill" title="Số nhân sự được phân bổ vào dự án">
              <span class="metric-label">Nhân sự:</span>
              <span class="metric-val"><strong>${membersCount}</strong> Người</span>
            </div>
          </div>

          <!-- Staffing Info -->
          <div class="project-staff-summary">
            <div class="staff-role-line">
              <span class="role-lbl">👑 Quản trị dự án:</span>
              <span class="role-val">${lead.name || lead.username || 'Chưa chỉ định'}</span>
            </div>
            <div class="staff-role-line">
              <span class="role-lbl">🧪 Kiểm thử viên:</span>
              <span class="role-val">${testers.length > 0 ? testers.map(t => t.name || t.username).join(', ') : 'Chưa phân bổ'}</span>
            </div>
            <div class="staff-role-line">
              <span class="role-lbl">💻 Kỹ sư phần mềm:</span>
              <span class="role-val">${devs.length > 0 ? devs.map(d => d.name || d.username).join(', ') : 'Chưa phân bổ'}</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="portfolio-card-actions">
            <button 
              type="button" 
              class="btn btn-primary btn-sm btn-enter-workspace" 
              onclick="AdminPortfolio.enterWorkspace('${p.id}')"
              title="Vào không gian làm việc chuyên biệt của dự án này"
            >
              🚀 Vào Không Gian Dự Án ➔
            </button>
            <div class="sub-actions">
              <button 
                type="button" 
                class="btn btn-outline btn-xs" 
                onclick="AdminStaffing.openStaffingModal('${p.id}')"
                title="Phân bổ nhân sự cho dự án này"
              >
                👥 Phân bổ
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-xs" 
                onclick="AdminPortfolio.openEditProjectModal('${p.id}')"
                title="Cấu hình thông tin dự án"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Điều hướng vào không gian làm việc khép kín của Dự án
   */
  enterWorkspace(projectId) {
    sessionStorage.setItem('smartvms_active_project_id', projectId);
    window.location.href = `../lead/index.html?projectId=${encodeURIComponent(projectId)}`;
  },

  /**
   * Mở modal thêm dự án mới
   */
  openCreateProjectModal() {
    const modal = document.getElementById('modal-create-project');
    if (modal) {
      document.getElementById('form-create-project')?.reset();
      modal.classList.add('active');
    }
  },

  /**
   * Đóng modal thêm dự án
   */
  closeCreateProjectModal() {
    const modal = document.getElementById('modal-create-project');
    if (modal) modal.classList.remove('active');
  },

  /**
   * Lưu dự án mới vào hệ thống
   */
  handleCreateProjectSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-prj-name').value.trim();
    const code = document.getElementById('new-prj-code').value.trim().toUpperCase();
    const desc = document.getElementById('new-prj-desc').value.trim();
    const version = document.getElementById('new-prj-version').value.trim() || 'v1.0';

    if (!name || !code) {
      showToast('⚠️ Vui lòng nhập đầy đủ Tên dự án và Mã dự án!', 'warning');
      return;
    }

    if (!state.projects) state.projects = [];

    // Kiểm tra trùng mã dự án
    if (state.projects.some(p => p.code === code)) {
      showToast(`⚠️ Mã dự án "${code}" đã tồn tại! Vui lòng chọn mã khác.`, 'danger');
      return;
    }

    const newProject = {
      id: 'PRJ_' + Date.now(),
      code,
      name,
      desc,
      activeVersion: version,
      versions: [
        { code: version, label: `${version} - Khởi tạo`, isCurrent: true, targetDate: '', changelog: 'Phiên bản ban đầu' }
      ],
      modules: [],
      testCases: [],
      testCycles: [
        {
          id: 'CYC-' + code + '-01',
          code: 'CYC-01',
          name: 'Đợt 1 — Khảo sát & Kiểm thử chức năng',
          version: version,
          type: 'SMOKE',
          scope: 'ALL',
          status: 'IN_PROGRESS',
          startDate: new Date().toISOString().slice(0, 10),
          endDate: ''
        }
      ],
      members: [
        {
          username: state.currentUser?.username || 'admin',
          name: state.currentUser?.name || 'Quản trị viên',
          projectRole: 'lead',
          title: 'Quản trị Dự án',
          assignedAt: new Date().toISOString()
        }
      ],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    state.projects.push(newProject);
    state.activeProjectId = newProject.id;
    saveCoreState();

    this.closeCreateProjectModal();
    this.init();
    showToast(`✅ Đã khởi tạo dự án "${name}" thành công!`, 'success');
  },

  /**
   * Mở modal chỉnh sửa dự án
   */
  openEditProjectModal(projectId) {
    const p = (state.projects || []).find(pr => pr.id === projectId);
    if (!p) return;

    document.getElementById('edit-prj-id').value = p.id;
    document.getElementById('edit-prj-name').value = p.name || '';
    document.getElementById('edit-prj-code').value = p.code || '';
    document.getElementById('edit-prj-desc').value = p.desc || '';
    document.getElementById('edit-prj-version').value = p.activeVersion || 'v1.0';
    document.getElementById('edit-prj-status').value = p.status || 'ACTIVE';

    document.getElementById('modal-edit-project')?.classList.add('active');
  },

  closeEditProjectModal() {
    document.getElementById('modal-edit-project')?.classList.remove('active');
  },

  handleEditProjectSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-prj-id').value;
    const p = (state.projects || []).find(pr => pr.id === id);
    if (!p) return;

    p.name = document.getElementById('edit-prj-name').value.trim();
    p.code = document.getElementById('edit-prj-code').value.trim().toUpperCase();
    p.desc = document.getElementById('edit-prj-desc').value.trim();
    p.activeVersion = document.getElementById('edit-prj-version').value.trim();
    p.status = document.getElementById('edit-prj-status').value;

    saveCoreState();
    this.closeEditProjectModal();
    this.init();
    showToast(`✅ Cập nhật thông tin dự án "${p.name}" thành công!`, 'success');
  }
};
