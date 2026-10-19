/**
 * ADMIN MODULE: PERSONNEL MANAGEMENT
 * Quản lý Hồ Bơi Nhân Sự Toàn Hệ Thống (Global Personnel Pool)
 * Quản lý danh bạ kỹ sư, trạng thái hoạt động và giám sát tải dự án
 */

const AdminPersonnel = {
  currentFilterRole: 'ALL',
  searchQuery: '',

  init() {
    this.renderPersonnelTable();
  },

  getAllStaff() {
    return (state.users && state.users.length > 0) ? state.users : DEFAULT_SYSTEM_USERS;
  },

  renderPersonnelTable() {
    const tbody = document.getElementById('personnel-table-tbody');
    if (!tbody) return;

    let staff = this.getAllStaff();

    // Lọc theo vai trò
    if (this.currentFilterRole !== 'ALL') {
      staff = staff.filter(u => u.role === this.currentFilterRole);
    }

    // Tìm kiếm theo tên / email / username
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      staff = staff.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }

    if (staff.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted)">
            Không tìm thấy nhân sự phù hợp với bộ lọc hiện tại.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = staff.map((u, idx) => {
      // Đếm số lượng dự án nhân sự này đang tham gia
      const projects = getAllProjects();
      const joinedProjects = projects.filter(p => {
        const members = getProjectMembers(p.id);
        return members.some(m => m.username === u.username);
      });

      const roleBadge = this.getRoleBadge(u.role);
      const statusBadge = u.status === 'LOCKED' || u.status === 'INACTIVE'
        ? '<span class="badge badge-fail">Tạm khóa</span>'
        : '<span class="badge badge-pass">Đang hoạt động</span>';

      return `
        <tr>
          <td style="text-align:center; font-weight:700; color:var(--text-muted)">${idx + 1}</td>
          <td>
            <div style="display:flex; align-items:center; gap:10px">
              <div class="user-avatar-circle">${(u.name || u.username || 'U').substring(0, 1).toUpperCase()}</div>
              <div>
                <strong style="color:var(--text-primary); font-size:13px">${u.name || u.username}</strong>
                <div style="font-size:11px; color:var(--text-muted); font-family:monospace">@${u.username}</div>
              </div>
            </div>
          </td>
          <td>${u.email || '—'}</td>
          <td style="text-align:center">${roleBadge}</td>
          <td>
            <div style="display:flex; flex-wrap:wrap; gap:4px">
              ${joinedProjects.length > 0 
                ? joinedProjects.map(jp => `<span class="badge badge-info" style="font-size:10.5px">${jp.code || jp.name}</span>`).join('') 
                : '<span style="font-size:11px; color:var(--text-muted)">Chưa phân bổ</span>'}
            </div>
          </td>
          <td style="text-align:center">${statusBadge}</td>
          <td style="text-align:center">
            <div style="display:flex; justify-content:center; gap:6px">
              <button 
                type="button" 
                class="btn btn-outline btn-xs" 
                onclick="AdminPersonnel.openEditModal('${u.username}')"
                title="Chỉnh sửa thông tin"
              >
                ✏️ Sửa
              </button>
              <button 
                type="button" 
                class="btn btn-outline btn-xs" 
                onclick="AdminPersonnel.toggleStatus('${u.username}')"
                title="${u.status === 'LOCKED' ? 'Kích hoạt lại' : 'Khóa tài khoản'}"
              >
                ${u.status === 'LOCKED' ? '🔓 Mở' : '🔒 Khóa'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getRoleBadge(role) {
    if (role === 'admin') return '<span class="badge badge-p1">👑 Quản lý (Admin)</span>';
    if (role === 'tester') return '<span class="badge badge-info">🧪 Kiểm thử viên</span>';
    if (role === 'developer') return '<span class="badge" style="background:rgba(139,92,246,0.1); color:#7c3aed; border:1px solid rgba(139,92,246,0.3)">💻 Lập trình viên</span>';
    return `<span class="badge badge-draft">${role || 'Thành viên'}</span>`;
  },

  filterByRole(role) {
    this.currentFilterRole = role;
    document.querySelectorAll('.personnel-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });
    this.renderPersonnelTable();
  },

  search(val) {
    this.searchQuery = val.trim();
    this.renderPersonnelTable();
  },

  openAddModal() {
    const modal = document.getElementById('modal-add-personnel');
    if (modal) {
      document.getElementById('form-add-personnel')?.reset();
      modal.classList.add('active');
    }
  },

  closeAddModal() {
    document.getElementById('modal-add-personnel')?.classList.remove('active');
  },

  handleAddSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('new-usr-username').value.trim().toLowerCase();
    const name = document.getElementById('new-usr-name').value.trim();
    const email = document.getElementById('new-usr-email').value.trim();
    const password = document.getElementById('new-usr-password').value || '123';
    const role = document.getElementById('new-usr-role').value;

    if (!username || !name) {
      showToast('⚠️ Vui lòng nhập Tên đăng nhập và Họ tên!', 'warning');
      return;
    }

    if (!state.users) state.users = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));

    if (state.users.some(u => u.username.toLowerCase() === username)) {
      showToast(`⚠️ Tài khoản "${username}" đã tồn tại trên hệ thống!`, 'danger');
      return;
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username,
      name,
      email: email || `${username}@smartvms.local`,
      password,
      role,
      roleTitle: role === 'admin' ? 'Quản lý (Admin)' : (role === 'developer' ? 'Kỹ sư Phần mềm' : 'Kiểm thử viên'),
      assignedProjects: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    state.users.push(newUser);
    saveCoreState();

    this.closeAddModal();
    this.renderPersonnelTable();
    AdminPortfolio.renderPortfolioSummaryStats();
    showToast(`✅ Đã thêm nhân sự "${name}" vào Hồ bơi toàn hệ thống!`, 'success');
  },

  openEditModal(username) {
    const user = this.getAllStaff().find(u => u.username === username);
    if (!user) return;

    document.getElementById('edit-usr-username').value = user.username;
    document.getElementById('edit-usr-name').value = user.name || '';
    document.getElementById('edit-usr-email').value = user.email || '';
    document.getElementById('edit-usr-role').value = user.role || 'tester';
    document.getElementById('edit-usr-status').value = user.status || 'ACTIVE';

    document.getElementById('modal-edit-personnel')?.classList.add('active');
  },

  closeEditModal() {
    document.getElementById('modal-edit-personnel')?.classList.remove('active');
  },

  handleEditSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('edit-usr-username').value;
    const user = this.getAllStaff().find(u => u.username === username);
    if (!user) return;

    user.name = document.getElementById('edit-usr-name').value.trim();
    user.email = document.getElementById('edit-usr-email').value.trim();
    user.role = document.getElementById('edit-usr-role').value;
    user.status = document.getElementById('edit-usr-status').value;

    saveCoreState();
    this.closeEditModal();
    this.renderPersonnelTable();
    showToast(`✅ Cập nhật thông tin nhân sự "${user.name}" thành công!`, 'success');
  },

  toggleStatus(username) {
    const user = this.getAllStaff().find(u => u.username === username);
    if (!user) return;

    user.status = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    saveCoreState();
    this.renderPersonnelTable();
    showToast(`Đã ${user.status === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản [${username}]`, 'info');
  }
};
