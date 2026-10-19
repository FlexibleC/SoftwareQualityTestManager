/**
 * ADMIN MODULE: STAFFING ALLOCATION MATRIX
 * Ma Trận Phân Bổ Nhân Sự Vào Từng Dự Án Cụ Thể
 * Kết nối giữa Hồ bơi Nhân sự Toàn hệ thống (Global Pool) và Không gian Từng Dự Án
 */

const AdminStaffing = {
  activeProjectId: null,

  init() {
    this.populateProjectSelector();
  },

  populateProjectSelector() {
    const sel = document.getElementById('staffing-project-select');
    if (!sel) return;

    const projects = getAllProjects();
    if (projects.length === 0) {
      sel.innerHTML = '<option value="">(Chưa có dự án nào)</option>';
      return;
    }

    sel.innerHTML = projects.map(p => `
      <option value="${p.id}" ${p.id === this.activeProjectId ? 'selected' : ''}>
        [${p.code || 'PRJ'}] ${p.name}
      </option>
    `).join('');

    if (!this.activeProjectId && projects.length > 0) {
      this.activeProjectId = projects[0].id;
    }

    this.renderStaffingMatrix();
  },

  onProjectChange(projectId) {
    this.activeProjectId = projectId;
    this.renderStaffingMatrix();
  },

  renderStaffingMatrix() {
    const container = document.getElementById('staffing-matrix-container');
    if (!container) return;

    const p = (state.projects || []).find(pr => pr.id === this.activeProjectId);
    if (!p) {
      container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted)">Vui lòng chọn một dự án để xem và phân bổ nhân sự.</div>';
      return;
    }

    const members = getProjectMembers(p.id);
    const allStaff = (state.users && state.users.length > 0) ? state.users : DEFAULT_SYSTEM_USERS;

    // Danh sách các nhân sự chưa được phân bổ vào dự án này
    const memberUsernames = new Set(members.map(m => m.username));
    const availableStaff = allStaff.filter(u => !memberUsernames.has(u.username) && u.status !== 'LOCKED');

    container.innerHTML = `
      <div class="staffing-panel-wrap">
        <!-- Panel Header -->
        <div class="staffing-header-bar">
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-primary)">
              👥 Nhân Sự Phụ Trách Dự Án: <span style="color:var(--primary)">${p.name}</span>
            </h3>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px">
              Mã dự án: <strong>${p.code}</strong> • Hiện có <strong>${members.length}</strong> nhân sự được phân quyền vào không gian này
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="AdminStaffing.openQuickAssignModal('${p.id}')">
            ➕ Phân Bổ Thêm Nhân Sự
          </button>
        </div>

        <!-- Members Table -->
        <table class="asg-tc-table" style="margin-top:16px; table-layout:auto">
          <thead>
            <tr>
              <th style="width:50px; text-align:center">#</th>
              <th style="width:240px">Nhân Sự (Họ tên & Tài khoản)</th>
              <th style="width:160px; text-align:center">Vai Trò Trong Dự Án</th>
              <th style="width:200px">Chức Danh Đảm Nhận</th>
              <th style="width:140px; text-align:center">Ngày Phân Bổ</th>
              <th style="width:120px; text-align:center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            ${members.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; padding:28px; color:var(--text-muted)">
                  Chưa có nhân sự nào được phân bổ vào dự án này. Nhấn "Phân Bổ Thêm Nhân Sự" để bắt đầu gán quyền.
                </td>
              </tr>
            ` : members.map((m, idx) => {
              const u = allStaff.find(usr => usr.username === m.username);
              const roleBadge = this.getProjectRoleBadge(m.projectRole);

              return `
                <tr>
                  <td style="text-align:center; font-weight:700; color:var(--text-muted)">${idx + 1}</td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px">
                      <div class="user-avatar-circle" style="width:28px; height:28px; font-size:11px">
                        ${(m.name || m.username || 'U').substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <strong style="color:var(--text-primary); font-size:12.5px">${m.name || (u ? u.name : m.username)}</strong>
                        <div style="font-size:11px; color:var(--text-muted); font-family:monospace">@${m.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align:center">${roleBadge}</td>
                  <td>
                    <span style="font-size:12px; font-weight:600; color:var(--text-secondary)">
                      ${m.title || 'Thành viên dự án'}
                    </span>
                  </td>
                  <td style="text-align:center; font-size:11.5px; color:var(--text-muted)">
                    ${m.assignedAt ? m.assignedAt.slice(0, 10) : '—'}
                  </td>
                  <td style="text-align:center">
                    <button 
                      type="button" 
                      class="btn btn-outline btn-xs" 
                      style="color:var(--danger); border-color:var(--danger-light)"
                      onclick="AdminStaffing.handleRemoveMember('${p.id}', '${m.username}')"
                      title="Rút nhân sự khỏi dự án này"
                    >
                      ✕ Rút quyền
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  getProjectRoleBadge(role) {
    if (role === 'lead' || role === 'admin') return '<span class="badge badge-p1">👑 Quản Trị Dự Án</span>';
    if (role === 'dev') return '<span class="badge" style="background:rgba(139,92,246,0.1); color:#7c3aed; border:1px solid rgba(139,92,246,0.3)">💻 Lập Trình Viên</span>';
    return '<span class="badge badge-info">🧪 Kiểm Thử Viên</span>';
  },

  openStaffingModal(projectId) {
    this.activeProjectId = projectId;
    const sel = document.getElementById('staffing-project-select');
    if (sel) sel.value = projectId;
    this.renderStaffingMatrix();
    this.openQuickAssignModal(projectId);
  },

  openQuickAssignModal(projectId) {
    const p = (state.projects || []).find(pr => pr.id === projectId);
    if (!p) return;

    const allStaff = (state.users && state.users.length > 0) ? state.users : DEFAULT_SYSTEM_USERS;
    const members = getProjectMembers(projectId);
    const memberUsernames = new Set(members.map(m => m.username));
    const available = allStaff.filter(u => !memberUsernames.has(u.username) && u.status !== 'LOCKED');

    const selectEl = document.getElementById('assign-staff-username');
    if (selectEl) {
      if (available.length === 0) {
        selectEl.innerHTML = '<option value="">(Tất cả nhân sự đã được phân bổ vào dự án này)</option>';
      } else {
        selectEl.innerHTML = available.map(u => `
          <option value="${u.username}">
            ${u.name} (@${u.username} - ${u.roleTitle || u.role})
          </option>
        `).join('');
      }
    }

    const titleEl = document.getElementById('modal-assign-project-name');
    if (titleEl) titleEl.textContent = p.name;

    document.getElementById('modal-assign-staff')?.classList.add('active');
  },

  closeQuickAssignModal() {
    document.getElementById('modal-assign-staff')?.classList.remove('active');
  },

  handleAssignSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('assign-staff-username').value;
    const projectRole = document.getElementById('assign-staff-role').value;
    const customTitle = document.getElementById('assign-staff-title').value.trim();

    if (!username) {
      showToast('⚠️ Vui lòng chọn một nhân sự từ danh sách!', 'warning');
      return;
    }

    const success = assignUserToProject(this.activeProjectId, username, projectRole, customTitle);
    if (success) {
      this.closeQuickAssignModal();
      this.renderStaffingMatrix();
      AdminPortfolio.renderPortfolioGrid();
      AdminPersonnel.renderPersonnelTable();
      showToast(`✅ Đã phân bổ nhân sự [@${username}] vào dự án thành công!`, 'success');
    }
  },

  handleRemoveMember(projectId, username) {
    if (!confirm(`Bạn có chắc muốn rút nhân sự [@${username}] khỏi dự án này không?`)) return;
    
    const success = removeUserFromProject(projectId, username);
    if (success) {
      this.renderStaffingMatrix();
      AdminPortfolio.renderPortfolioGrid();
      AdminPersonnel.renderPersonnelTable();
      showToast(`Đã rút nhân sự [@${username}] khỏi dự án.`, 'info');
    }
  }
};
