/* ============================================================
   SmartVMS Test Manager — Application Logic
   Version 3.4 | 214 Test Cases Chuẩn hóa Thực tế | 12 Modules (SmartVMS Local SingleSite 2026)
   ============================================================ */

'use strict';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ================================================================
// DATA: 12 MODULES — SMARTVMS LOCAL 2026 CHUẨN HÓA
// ================================================================
// ================================================================
// DATA LAYER: NẠP TỪ TỆP DỮ LIỆU ĐỘC LẬP (CHUẨN ISO 29119-3)
// Không gắn cứng test cases trong mã nguồn ứng dụng!
// Dữ liệu kịch bản được quản lý tại: data/smartvms_test_catalog.json
// ================================================================
const _catalog = (typeof window !== 'undefined' && window.SMARTVMS_DEFAULT_CATALOG) || { modules: [], testCases: [] };
const DEFAULT_MODULES = _catalog.modules || [];

function getModules() {
  if (!state.modules || !Array.isArray(state.modules) || state.modules.length === 0) {
    state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  }
  return state.modules;
}

try {
  Object.defineProperty(window, 'MODULES', {
    get: () => getModules(),
    configurable: true
  });
} catch(e) {}

// ALL_TCS được nạp linh hoạt từ tệp catalog hoặc do người dùng import vào
let ALL_TCS = JSON.parse(JSON.stringify(_catalog.testCases || []));

const USERS = [
  { username: 'admin', password: '123', role: 'admin', name: 'Quản trị viên (QA Lead)' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Quản trị viên (QA Lead)' },
  { username: 'tester', password: '123', role: 'tester', name: 'Nguyễn Văn Nam (Tester)' },
  { username: 'dev', password: '123', role: 'developer', name: 'Trần Quốc Tuấn (Developer)' }
];

// ================================================================
// STATE
// ================================================================
let state = {
  projects: [],
  currentProjectId: 'PRJ-SMARTVMS',
  currentProjectVersion: 'v2.0',

  modules: [],       // Configurable modules: [ { id, name, short } ]
  customTcs: [],     // User-added test cases: [ { id, module, priority, name, precondition, steps, expected, notes, isCustom: true, createdAt } ]
  overrides: {},     // Hiệu đính Test Cases chuẩn: { [tcId]: { name, priority, platform, testData, precondition, steps, expected, notes, updatedAt } }
  currentRunId: 'run_001',
  runs: [
    {
      id: 'run_001',
      name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện',
      targetVersion: 'v2.0',
      scopeType: 'ALL',
      status: 'ACTIVE',
      createdBy: 'QA Lead',
      createdAt: '2026-10-06T00:00:00.000Z'
    }
  ],
  runResults: {},    // { [runId]: { [tcId]: { status, tester, runAt, note, failReason, defectStatus, severity, assignedDev, fixVersion, evidences: [] } } }
  comments: {},      // { [tcId]: [ { id, runId, tcId, author, role, content, createdAt } ] }
  results: {},       // Active run results pointer: { tcId: { status, tester, runAt, note, failReason, defectStatus, severity, assignedDev, fixVersion, evidences: [] } }
  session: null,     // { name, owner, version, notes, createdAt }
  filters: { module: '', priority: '', status: '', type: '', search: '' },
  execFilters: { module: '', status: '', search: '' },
  selectedTcId: null,
  charts: {},
  currentUser: null
};

// ================================================================
// LOCALSTORAGE
// ================================================================
const STORAGE_KEY = 'openqas_enterprise_v4_state';

try {
  if (localStorage.getItem('smartvms_fresh_clean_init_2026') !== 'true') {
    localStorage.removeItem('openqas_projects_list');
    localStorage.removeItem('openqas_assignments_list');
    localStorage.removeItem('openqas_active_project_id');
    localStorage.removeItem('smartvms_test_state');
    localStorage.removeItem('smartvms_imported_catalog');
    localStorage.removeItem('openqas_enterprise_v4_state');
    localStorage.setItem('smartvms_fresh_clean_init_2026', 'true');
  }
} catch(e) {}


function saveState() {
  if (!state.runResults) state.runResults = {};
  if (!state.runResults[state.currentRunId]) state.runResults[state.currentRunId] = {};
  state.runResults[state.currentRunId] = state.results; // Đồng bộ pointer kết quả đợt hiện tại

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentRunId: state.currentRunId,
    runs: state.runs || [],
    runResults: state.runResults || {},
    comments: state.comments || {},
    results: state.results,
    session: state.session,
    customTcs: state.customTcs || [],
    modules: state.modules || [],
    overrides: state.overrides || {},
    currentUser: state.currentUser
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      state.currentRunId = s.currentRunId || 'run_001';
      state.runs = Array.isArray(s.runs) && s.runs.length > 0 ? s.runs : [
        { id: 'run_001', name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện', targetVersion: 'v2.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'QA Lead', createdAt: '2026-10-06T00:00:00.000Z' }
      ];
      state.runResults = (s.runResults && typeof s.runResults === 'object') ? s.runResults : {};
      state.comments = (s.comments && typeof s.comments === 'object') ? s.comments : {};

      // Khôi phục kết quả đợt đầu nếu là dữ liệu phiên bản cũ
      if (!state.runResults['run_001'] || Object.keys(state.runResults['run_001']).length === 0) {
        if (s.results && Object.keys(s.results).length > 0) {
          state.runResults['run_001'] = s.results;
        } else {
          state.runResults['run_001'] = {};
        }
      }
      state.results = state.runResults[state.currentRunId] || {};

      state.session = s.session || null;
      state.customTcs = Array.isArray(s.customTcs) ? s.customTcs : [];
      state.overrides = (s.overrides && typeof s.overrides === 'object') ? s.overrides : {};
      const isOutdated = !Array.isArray(s.modules) || s.modules.length === 0 || s.modules.length !== DEFAULT_MODULES.length || DEFAULT_MODULES.some(dm => !s.modules.some(m => m.id === dm.id && m.name === dm.name && m.short === dm.short));
      state.modules = isOutdated ? JSON.parse(JSON.stringify(DEFAULT_MODULES)) : s.modules;
      // Khôi phục danh mục đã nhập nếu có
      const savedCatalog = localStorage.getItem('smartvms_imported_catalog');
      if (savedCatalog) {
        try {
          const c = JSON.parse(savedCatalog);
          if (Array.isArray(c.testCases) && c.testCases.length > 0) {
            ALL_TCS = c.testCases;
            if (Array.isArray(c.modules) && c.modules.length > 0) {
              state.modules = c.modules;
            }
          }
        } catch(e) {}
      }

      state.currentUser = s.currentUser || null;
    } else {
      state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
    }
  } catch(e) {
    console.error('Load state error', e);
    state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  }
}

// ================================================================
// AUTHENTICATION LOGIC
// ================================================================
function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();
  
  initUsersList();
  const allUsers = [...(state.usersList || []), ...USERS];
  const user = allUsers.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
  if (user && user.status === 'LOCKED') {
    alert('Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Quản trị viên!');
    return;
  }

  if (!user) {
    alert('Sai tên đăng nhập hoặc mật khẩu!');
    return;
  }
  
  state.currentUser = { username: user.username, role: user.role, name: user.name };
  saveState();
  applyAuth();
  updateMyTasksBadge();
  if (user.role === 'tester') {
    navigate('mytasks');
  } else if (user.role === 'developer') {
    navigate('dev-bugs');
  } else {
    navigate('dashboard');
  }
}

function handleLogout() {
  state.currentUser = null;
  saveState();
  applyAuth();
}

function applyAuth() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app');
  
  if (!state.currentUser) {
    loginScreen.style.display = 'flex';
    appContainer.style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    return;
  }
  
  loginScreen.style.display = 'none';
  appContainer.style.display = 'flex';
  
  // Set user info trên header
  const nameEl = document.getElementById('current-user-name');
  if (nameEl) nameEl.textContent = state.currentUser.name;
  const roleEl = document.getElementById('current-user-role');
  
  // Cập nhật class body cho RBAC
  document.body.classList.remove('role-admin', 'role-tester', 'role-developer');
  
  const avatarEl = document.getElementById('current-user-avatar');
  if (avatarEl) {
    const letter = (state.currentUser.name || state.currentUser.username || 'A').charAt(0).toUpperCase();
    avatarEl.textContent = letter;
  }

  if (state.currentUser.role === 'admin') {
    if (roleEl) {
      roleEl.textContent = 'QA Lead';
      roleEl.className = 'vms-user-role role-admin';
    }
    document.body.classList.add('role-admin');
  } else if (state.currentUser.role === 'developer') {
    if (roleEl) {
      roleEl.textContent = 'Dev';
      roleEl.className = 'vms-user-role role-developer';
    }
    document.body.classList.add('role-developer');
  } else {
    if (roleEl) {
      roleEl.textContent = 'Tester';
      roleEl.className = 'vms-user-role role-tester';
    }
    document.body.classList.add('role-tester');
  }
  
  // Điều hướng RBAC thông minh: Phân quyền thống kê chi tiết về các giao diện chuyên biệt
  // - Tester: chuyên tâm vào "Việc của tôi" (mytasks)
  // - Dev: chuyên tâm vào "Kịch bản lỗi" (report) hoặc "Thực thi"
  // - Admin: vào Dashboard tổng quan hoặc trang quản trị
  if (state.currentUser.role === 'tester') {
    const adminPages = ['page-dashboard', 'page-projects', 'page-users', 'page-assignments', 'page-settings', 'page-evaluation', 'page-dev-bugs'];
    const activePage = document.querySelector('.page.active');
    if (!activePage || adminPages.includes(activePage.id)) {
      navigate('mytasks');
    }
  } else if (state.currentUser.role === 'developer') {
    const nonDevPages = ['page-dashboard', 'page-projects', 'page-users', 'page-assignments', 'page-settings', 'page-evaluation', 'page-mytasks'];
    const activePage = document.querySelector('.page.active');
    if (!activePage || nonDevPages.includes(activePage.id)) {
      navigate('dev-bugs');
    }
  } else {
    // Admin (QA Lead)
    const activePage = document.querySelector('.page.active');
    if (!activePage || activePage.id === 'page-mytasks' || activePage.id === 'page-dev-bugs') {
      navigate('dashboard');
    }
  }
}

// ================================================================
// DATA ACCESS HELPERS
// ================================================================
function getAllTcs() {
  const overrides = state.overrides || {};
  const builtins = ALL_TCS.map(tc => {
    if (overrides[tc.id]) {
      return { ...tc, ...overrides[tc.id], isOverridden: true };
    }
    return tc;
  });
  return [...builtins, ...(state.customTcs || [])];
}

function isCustomTc(id) {
  return (state.customTcs || []).some(t => t.id === id);
}

function isOverriddenTc(id) {
  return Boolean(state.overrides && state.overrides[id]);
}

function resetBuiltinTc(tcId) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền khôi phục Test Case gốc!', 'error');
    return;
  }
  if (!state.overrides || !state.overrides[tcId]) return;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn khôi phục nội dung Test Case "${tcId}" về nguyên bản chuẩn ban đầu của hệ thống?`)) return;
  delete state.overrides[tcId];
  saveState();
  showToast(`🔄 Đã khôi phục Test Case ${tcId} về nội dung chuẩn gốc ban đầu`, 'info');
  applyFilters();
  if (document.getElementById('page-execute').classList.contains('active')) {
    renderExecutePage();
  }
}

// ================================================================
// NAVIGATION
// ================================================================
function navigate(page) {
  const role = state.currentUser ? state.currentUser.role : 'guest';
  const adminOnlyPages = ['projects', 'users', 'assignments', 'settings', 'evaluation', 'dashboard'];
  
  if (role === 'tester' && adminOnlyPages.includes(page)) {
    showToast('⚠️ Quyền hạn Tester: Bạn không có quyền truy cập trang quản trị này!', 'error');
    navigate('mytasks');
    return;
  }
  
  if (role === 'developer' && ['projects', 'users', 'assignments', 'settings', 'evaluation', 'dashboard'].includes(page)) {
    showToast('⚠️ Quyền hạn Developer: Vui lòng tập trung tại Trung tâm Xử lý Lỗi!', 'info');
    navigate('dev-bugs');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) targetPage.classList.add('active');
  const targetNav = document.querySelector(`[data-page="${page}"]`);
  if (targetNav) targetNav.classList.add('active');

  const titles = { 
    dashboard:'Dashboard', 
    testcases:'Test Cases', 
    execute:'Thực thi Test', 
    report:'Báo cáo', 
    settings:'Cài đặt',
    projects: 'Danh sách Dự án',
    evaluation: 'Đánh giá ISO 25010',
    users: 'Quản lý Nhân sự',
    assignments: 'Giao việc & Hạn chót',
    mytasks: 'Việc của tôi',
    'dev-bugs': 'Trung tâm Xử lý Lỗi'
  };
  const bEl = document.getElementById('breadcrumb');
  if (bEl) bEl.textContent = titles[page] || page;

  if (page === 'dashboard') renderDashboard();
  else if (page === 'testcases') renderTestCases();
  else if (page === 'execute') renderExecutePage();
  else if (page === 'report') { renderReport(); renderAnalyticsPage(); }
  else if (page === 'settings') renderSettings();
  else if (page === 'projects') renderProjectsPage();
  else if (page === 'evaluation') renderEvaluationPage();
  else if (page === 'users') renderUsersPage();
  else if (page === 'assignments') renderAssignmentsPage();
  else if (page === 'mytasks') renderMyTasksPage();
  else if (page === 'dev-bugs') renderDevBugsPage();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ================================================================
// COMPUTED STATS
// ================================================================
function getStats() {
  const all = getAllTcs();
  const total = all.length;
  let pass = 0, fail = 0, skip = 0, wip = 0;
  all.forEach(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    if (s === 'Pass') pass++;
    else if (s === 'Fail') fail++;
    else if (s === 'Skip') skip++;
    else if (s === 'In Progress') wip++;
  });
  const pending = total - pass - fail - skip - wip;
  const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
  const runCount = pass + fail + skip;
  const completeRate = total > 0 ? Math.round((runCount / total) * 100) : 0;
  return { total, pass, fail, skip, wip, pending, passRate, completeRate };
}

function getModuleStats() {
  const all = getAllTcs();
  return getModules().map(mod => {
    const tcs = all.filter(tc => tc.module === mod.id);
    let pass = 0, fail = 0, skip = 0, wip = 0;
    tcs.forEach(tc => {
      const r = state.results[tc.id];
      const s = r ? r.status : 'Not Run';
      if (s === 'Pass') pass++;
      else if (s === 'Fail') fail++;
      else if (s === 'Skip') skip++;
      else if (s === 'In Progress') wip++;
    });
    const total = tcs.length;
    const pending = total - pass - fail - skip - wip;
    const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { ...mod, total, pass, fail, skip, wip, pending, passRate };
  });
}

function populateModuleSelects() {
  const mods = getModules();

  // 1. Filter in Test Cases: #filter-module
  const filterMod = document.getElementById('filter-module');
  if (filterMod) {
    const currentVal = filterMod.value;
    filterMod.innerHTML = '<option value="">Tất cả modules</option>' +
      mods.map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (mods.some(m => m.id === currentVal)) filterMod.value = currentVal;
    else filterMod.value = '';
  }

  // 2. Filter in Execute Page: #exec-filter-module
  const execMod = document.getElementById('exec-filter-module');
  if (execMod) {
    const currentVal = execMod.value;
    execMod.innerHTML = '<option value="">Tất cả modules</option>' +
      mods.map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (mods.some(m => m.id === currentVal)) execMod.value = currentVal;
    else execMod.value = '';
  }

  // 3. Select in Add/Edit TC Modal: #tc-form-module
  const formMod = document.getElementById('tc-form-module');
  if (formMod) {
    const currentVal = formMod.value;
    formMod.innerHTML = mods.map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (mods.some(m => m.id === currentVal)) formMod.value = currentVal;
    else if (mods.length > 0) formMod.value = mods[0].id;
  }
}

// ================================================================
// STATUS / PRIORITY HELPERS
// ================================================================
function statusBadge(status) {
  if (status === 'Inherited Pass') {
    return `<span class="badge-inherited" title="Kế thừa kết quả Đạt từ Đợt kiểm thử trước">🌿 Kế thừa Pass</span>`;
  }
  const map = { 'Pass':'✅ Pass', 'Fail':'❌ Fail', 'Skip':'⏭ Skip', 'Not Run':'⏳ Chưa chạy', 'In Progress':'🔄 Đang chạy' };
  const cls = (status || 'Not Run').replace(' ', '-');
  return `<span class="status-badge status-${cls}">${map[status || 'Not Run'] || status}</span>`;
}

function priorityBadge(p) {
  const map = { P1:'🔴 P1', P2:'🟠 P2', P3:'🟡 P3', P4:'🟢 P4' };
  return `<span class="priority-badge priority-${p}">${map[p] || p}</span>`;
}

function getModuleName(id) {
  return getModules().find(m => m.id === id)?.name || id;
}
function getModuleShort(id) {
  return getModules().find(m => m.id === id)?.short || id;
}

// ================================================================
// DASHBOARD
// ================================================================
function renderDashboard() {
  initAssignments();
  initUsersList();
  const s = getStats();
  const curProj = getActiveProject();

  // 1. Thống kê cấp Doanh nghiệp
  const allProjs = state.projects || [];
  const activeProjs = allProjs.filter(p => p.versions && p.versions.some(v => v.status === 'IN_QA'));
  const totalStaff = (state.usersList || []).length;
  let totalCompanyTcs = 0;
  let totalCompanyMods = 0;
  allProjs.forEach(p => {
    totalCompanyTcs += (p.testCases || []).length;
    totalCompanyMods += (p.modules || []).length;
  });

  const entProjEl = document.getElementById('ent-stat-projects');
  if (entProjEl) entProjEl.textContent = allProjs.length;
  const entActProjEl = document.getElementById('ent-stat-active-proj');
  if (entActProjEl) entActProjEl.textContent = (activeProjs.length || allProjs.length) + ' đang test';
  const entStaffEl = document.getElementById('ent-stat-staff');
  if (entStaffEl) entStaffEl.textContent = totalStaff + ' người';
  const entTcsEl = document.getElementById('ent-stat-tcs');
  if (entTcsEl) entTcsEl.textContent = totalCompanyTcs + ' kịch bản';
  const entModsEl = document.getElementById('ent-stat-mods');
  if (entModsEl) entModsEl.textContent = totalCompanyMods + ' phân hệ';

  // 2. Bốn chỉ số cốt lõi của Dự án đang chọn
  const statTotal = document.getElementById('stat-total');
  if (statTotal) statTotal.textContent = s.total;
  const statPass = document.getElementById('stat-pass');
  if (statPass) statPass.textContent = s.pass;
  const statFail = document.getElementById('stat-fail');
  if (statFail) statFail.textContent = s.fail;

  // Tính số bài quá hạn của dự án này
  const tasks = (state.assignments || []).filter(t => t.projectId === state.currentProjectId);
  let overdueCount = 0;
  tasks.forEach(t => {
    const ds = getTaskDeadlineStatus(t);
    if (t.status !== 'DONE' && t.status !== 'PASSED' && ds.isOverdue) overdueCount++;
  });
  const statOverdueDash = document.getElementById('stat-overdue-dash');
  if (statOverdueDash) statOverdueDash.textContent = overdueCount + ' bài';

  const projNameEl = document.getElementById('dash-active-proj-name');
  if (projNameEl) projNameEl.textContent = curProj ? curProj.name : 'Dự án hiện hành';

  const badgeTotal = document.getElementById('badge-total');
  if (badgeTotal) badgeTotal.textContent = s.total;
  const mainBar = document.getElementById('main-progress-bar');
  if (mainBar) mainBar.style.width = s.completeRate + '%';
  const overallPct = document.getElementById('overall-pct');
  if (overallPct) overallPct.textContent = s.completeRate + '% hoàn thành';

  // 3. Bảng tiến độ theo Phân hệ (100% Bề Ngang)
  const mStats = getModuleStats();
  const tbody = document.getElementById('module-summary-body');
  if (tbody) {
    if (mStats.length === 0 || (!state.projects || state.projects.length === 0)) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 48px 16px; color:var(--text-muted)">
            <div style="font-size:36px; margin-bottom:8px">🏢</div>
            <div style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:4px">
              Hệ thống chưa có kịch bản hoặc dự án nào
            </div>
            <div style="font-size:13px; margin-bottom:16px">
              Hệ thống đang ở trạng thái Trắng (Fresh Clean State). Bạn có thể tự import file danh mục kịch bản (JSON/Excel) hoặc tạo dự án mới để bắt đầu.
            </div>
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap">
              <button class="btn btn-primary" onclick="openImportModal()">📥 Nhập Kịch Bản (JSON / Excel)</button>
              <button class="btn btn-outline" onclick="openCreateProjectModal()">🏢 Thêm Dự Án Mới</button>
              <button class="btn btn-outline" onclick="loadSampleDemoProjects()" style="border-color:var(--accent); color:var(--accent)">⚡ Nạp Mẫu SmartVMS (204 Demo)</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = mStats.map(m => {
      let statusTag = '<span class="badge badge-nr">Chưa test</span>';
      if (m.fail > 0) {
        statusTag = '<span class="badge badge-fail">⚠️ ' + m.fail + ' lỗi</span>';
      } else if (m.passRate === 100) {
        statusTag = '<span class="badge badge-pass">✓ Đạt 100%</span>';
      } else if (m.pass > 0) {
        statusTag = '<span class="badge badge-p1">Đang test</span>';
      }

      return `
        <tr class="table-row-hover" onclick="drillDownToTestCases(undefined, '${m.id}')" title="Bấm xem ${m.total} kịch bản của phân hệ ${m.name}" style="cursor:pointer">
          <td><strong style="color:var(--accent)">${m.id}</strong></td>
          <td><strong>${m.name}</strong></td>
          <td style="text-align:center"><strong>${m.total}</strong></td>
          <td style="text-align:center; color:#16a34a; font-weight:700">${m.pass}</td>
          <td style="text-align:center; color:#dc2626; font-weight:700">${m.fail > 0 ? m.fail : '0'}</td>
          <td style="text-align:center; color:var(--text-muted)">${m.pending}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px">
              <div class="mini-progress" style="flex:1; height:6px; background:var(--border); border-radius:3px; overflow:hidden">
                <div class="mini-progress-bar" style="width:${m.passRate}%; height:100%; background:${m.passRate >= 80 ? '#16a34a' : '#2563eb'}"></div>
              </div>
              <span style="font-size:11px; font-weight:600; width:30px; text-align:right">${m.passRate}%</span>
            </div>
          </td>
          <td style="text-align:center">${statusTag}</td>
        </tr>
      `;
      }).join('');
    }
  }

  // 4. Bảng Sự vụ chân trang - Nửa trái: Lỗi mới nhất
  const bugsEl = document.getElementById('dash-recent-bugs');
  if (bugsEl) {
    const failedTcs = getAllTcs().filter(tc => state.results[tc.id]?.status === 'Fail').slice(0, 5);
    if (failedTcs.length === 0) {
      bugsEl.innerHTML = '<div style="color:#16a34a; font-size:12.5px; padding:12px; text-align:center">🎉 Hiện tại không có bài test nào bị Lỗi!</div>';
    } else {
      bugsEl.innerHTML = failedTcs.map(tc => {
        const r = state.results[tc.id] || {};
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid var(--border); font-size:12px">
            <div>
              <strong class="clickable-badge" onclick="jumpToExecuteCase('${tc.id}')" style="color:#dc2626" title="Bấm sang màn hình sửa lỗi">${tc.id} ↗</strong>
              <span style="margin-left:6px; color:var(--text-primary)">${tc.name}</span>
            </div>
            <span style="font-size:11px; color:var(--text-muted)">${r.tester || 'Tester'}</span>
          </div>
        `;
      }).join('');
    }
  }

  // 5. Bảng Sự vụ chân trang - Nửa phải: Tiến độ các Tester
  const testersEl = document.getElementById('dash-testers-progress');
  if (testersEl) {
    const testers = (state.usersList || []).filter(u => u.role === 'tester');
    const allTasks = state.assignments || [];
    testersEl.innerHTML = testers.map(u => {
      const myTasks = allTasks.filter(t => t.assigneeUsername === u.username);
      const done = myTasks.filter(t => t.status === 'DONE' || t.status === 'PASSED').length;
      const pct = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-bottom:1px solid var(--border); font-size:12px">
          <div>
            <strong class="clickable-badge" onclick="jumpToUserAssignments('${u.username}')" title="Bấm xem việc được giao">${u.name}</strong>
            <span style="font-size:11px; color:var(--text-muted); margin-left:4px">(${done}/${myTasks.length} bài)</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px">
            <div style="width:70px; height:5px; background:var(--border); border-radius:3px; overflow:hidden">
              <div style="width:${pct}%; height:100%; background:#16a34a"></div>
            </div>
            <span style="font-size:11px; font-weight:600">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function getThemeChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    legendColor: isDark ? '#94a3b8' : '#475569',
    tickColor: isDark ? '#64748b' : '#64748b',
    gridColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    pieBorderColor: isDark ? '#1a1f2e' : '#ffffff',
  };
}

function renderModuleChart(mStats) {
  const ctx = document.getElementById('chartModule').getContext('2d');
  if (state.charts.module) state.charts.module.destroy();
  const tc = getThemeChartColors();
  state.charts.module = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mStats.map(m => m.short),
      datasets: [
        { label:'Pass', data: mStats.map(m => m.pass), backgroundColor: 'rgba(34,197,94,0.85)', borderRadius: 4 },
        { label:'Fail', data: mStats.map(m => m.fail), backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 4 },
        { label:'Skip', data: mStats.map(m => m.skip), backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 4 },
        { label:'Chưa chạy', data: mStats.map(m => m.pending), backgroundColor: 'rgba(148,163,184,0.35)', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc.legendColor, font: { family:'Inter', size:11 } } } },
      scales: {
        x: { stacked: true, grid: { color: tc.gridColor }, ticks: { color: tc.tickColor, font:{size:10} } },
        y: { stacked: true, grid: { color: tc.gridColor }, ticks: { color: tc.tickColor } }
      }
    }
  });
}

function renderPriorityChart(s) {
  const ctx = document.getElementById('chartPriority').getContext('2d');
  if (state.charts.priority) state.charts.priority.destroy();
  const all = getAllTcs();
  const p1 = all.filter(t=>t.priority==='P1');
  const p2 = all.filter(t=>t.priority==='P2');
  const p3 = all.filter(t=>t.priority==='P3');
  const p4 = all.filter(t=>t.priority==='P4');
  const pData = [p1,p2,p3,p4].map(arr => {
    let pass=0,fail=0,notrun=0;
    arr.forEach(tc=>{ const r=state.results[tc.id]; const st=r?.status||'Not Run'; if(st==='Pass')pass++;else if(st==='Fail')fail++;else notrun++; });
    return {pass,fail,notrun};
  });
  const tc = getThemeChartColors();
  state.charts.priority = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['🔴 P1 (Critical)','🟠 P2 (Important)','🟡 P3 (Medium)','🟢 P4 (Low)'],
      datasets: [
        { label:'Pass', data: pData.map(d=>d.pass), backgroundColor:'rgba(34,197,94,0.85)', borderRadius:4 },
        { label:'Fail', data: pData.map(d=>d.fail), backgroundColor:'rgba(239,68,68,0.85)', borderRadius:4 },
        { label:'Chưa chạy', data: pData.map(d=>d.notrun), backgroundColor:'rgba(148,163,184,0.35)', borderRadius:4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc.legendColor, font:{family:'Inter',size:11} } } },
      scales: {
        x: { stacked:true, grid:{color: tc.gridColor}, ticks:{color: tc.tickColor, font:{size:11}} },
        y: { stacked:true, grid:{color: tc.gridColor}, ticks:{color: tc.tickColor} }
      }
    }
  });
}

// ================================================================
// TEST CASES PAGE
// ================================================================
function renderTestCases() {
  const modSelect = document.getElementById('filter-module');
  if (modSelect && modSelect.options.length <= 1) {
    populateModuleSelects();
  }
  applyFilters();
}

function applyFilters() {
  const mod = document.getElementById('filter-module').value;
  const pri = document.getElementById('filter-priority').value;
  const sts = document.getElementById('filter-status').value;
  const type = document.getElementById('filter-type')?.value || '';
  const srch = (document.getElementById('filter-search').value || '').toLowerCase().trim();
  state.filters = { module: mod, priority: pri, status: sts, type: type, search: srch };
  const all = getAllTcs();
  const filtered = all.filter(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    const isCustom = isCustomTc(tc.id);
    if (mod && tc.module !== mod) return false;
    if (pri && tc.priority !== pri) return false;
    if (sts && s !== sts) return false;
    if (type === 'builtin' && isCustom) return false;
    if (type === 'custom' && !isCustom) return false;
    if (srch && !tc.id.toLowerCase().includes(srch) && !tc.name.toLowerCase().includes(srch) && !(tc.precondition||'').toLowerCase().includes(srch)) return false;
    return true;
  });
  const customCount = (state.customTcs || []).length;
  document.getElementById('tc-count').innerHTML = `Hiển thị <strong>${filtered.length}</strong> / <strong>${all.length}</strong> test cases <span style="color:var(--text-muted);font-size:12px;margin-left:8px">(Gốc: ${ALL_TCS.length} · Tùy chỉnh: ${customCount})</span>`;
  const sub = document.getElementById('tc-page-subtitle');
  if (sub) sub.textContent = `Quản lý toàn bộ ${all.length} test cases (${ALL_TCS.length} chuẩn mực + ${customCount} tùy chỉnh)`;
  const tbody = document.getElementById('tc-table-body');
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding: 48px 16px; color:var(--text-muted)">
          <div style="font-size:36px; margin-bottom:8px">📋</div>
          <div style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:4px">
            ${all.length === 0 ? 'Chưa có Kịch bản Kiểm thử nào trong Hệ thống' : 'Không tìm thấy kịch bản phù hợp với bộ lọc'}
          </div>
          <div style="font-size:13px; margin-bottom:16px">
            ${all.length === 0 ? 'Hệ thống đang ở trạng thái Trắng (Fresh Clean State). Bạn có thể import danh mục từ file JSON/Excel hoặc tạo kịch bản mới.' : 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bỏ chọn các điều kiện lọc.'}
          </div>
          ${all.length === 0 ? `
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap">
              <button class="btn btn-primary" onclick="openImportModal()">📥 Nhập Kịch Bản (JSON / Excel)</button>
              <button class="btn btn-outline" onclick="openAddTcModal()">➕ Thêm Kịch Bản Mới</button>
              <button class="btn btn-outline" onclick="loadSampleDemoProjects()" style="border-color:var(--accent); color:var(--accent)">⚡ Nạp Mẫu SmartVMS (204 Demo)</button>
            </div>
          ` : ''}
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = filtered.map(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    const isCustom = isCustomTc(tc.id);
    const isOverridden = isOverriddenTc(tc.id);
    let typeBadge = '';
    if (isCustom) {
      typeBadge = `<span class="badge-custom">✨ Tùy chỉnh</span>`;
    } else if (isOverridden) {
      typeBadge = `<span class="badge-custom" style="background:rgba(245, 158, 11, 0.15);color:#d97706;border:1px solid rgba(245, 158, 11, 0.3)" title="Đã hiệu đính so với bản chuẩn gốc">✏️ Đã hiệu đính</span>`;
    } else {
      typeBadge = `<span class="badge-builtin">📦 Chuẩn gốc</span>`;
    }

    const actions = isCustom ? `
      <div class="action-btn-group">
        <button class="action-btn" onclick="openTcDetail('${tc.id}')" title="Xem chi tiết">🔍</button>
        <button class="action-btn run" onclick="quickNavigateExec('${tc.id}')" title="Thực thi test">▶</button>
        <button class="action-btn edit admin-only" onclick="openEditTcModal('${tc.id}')" title="Chỉnh sửa">✏️</button>
        <button class="action-btn clone admin-only" onclick="openCloneTcModal('${tc.id}')" title="Nhân bản">📋</button>
        <button class="action-btn delete admin-only" onclick="deleteCustomTc('${tc.id}')" title="Xóa">🗑️</button>
      </div>` : `
      <div class="action-btn-group">
        <button class="action-btn" onclick="openTcDetail('${tc.id}')" title="Xem chi tiết">🔍</button>
        <button class="action-btn run" onclick="quickNavigateExec('${tc.id}')" title="Thực thi test">▶</button>
        <button class="action-btn edit admin-only" onclick="openEditTcModal('${tc.id}')" title="Hiệu đính nội dung Test Case này">✏️</button>
        ${isOverridden ? `<button class="action-btn reset admin-only" onclick="resetBuiltinTc('${tc.id}')" title="Khôi phục nguyên bản gốc" style="color:#d97706">🔄</button>` : ''}
        <button class="action-btn clone admin-only" onclick="openCloneTcModal('${tc.id}')" title="Nhân bản test case này">📋</button>
      </div>`;
    const expText = Array.isArray(tc.expected) ? tc.expected.join('; ') : (tc.expected || '');
    const descTooltip = escapeHtml((tc.description || tc.name || '') + (expText ? ' | Kết quả kỳ vọng: ' + expText : ''));
    return `<tr>
      <td class="tc-code">
        <strong class="clickable-badge" onclick="openTcDetail('${tc.id}')" title="Bấm xem chi tiết kịch bản">${tc.id}</strong>
      </td>
      <td>${priorityBadge(tc.priority)}</td>
      <td><span class="module-tag" onclick="drillDownToTestCases(undefined, '${tc.module}')" style="cursor:pointer" title="Lọc theo phân hệ này">${getModuleShort(tc.module)}</span></td>
      <td class="tc-name">
        <span onclick="openTcDetail('${tc.id}')" style="cursor:pointer">${tc.name}</span>
        <span class="info-hint" title="${descTooltip}">ⓘ</span>
      </td>
      <td>${typeBadge}</td>
      <td>${statusBadge(s)}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${r?.tester || '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r?.runAt ? new Date(r.runAt).toLocaleDateString('vi-VN') : '—'}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

function resetFilters() {
  document.getElementById('filter-module').value = '';
  document.getElementById('filter-priority').value = '';
  document.getElementById('filter-status').value = '';
  if (document.getElementById('filter-type')) document.getElementById('filter-type').value = '';
  document.getElementById('filter-search').value = '';
  applyFilters();
}

function quickNavigateExec(tcId) {
  state.selectedTcId = tcId;
  navigate('execute');
  setTimeout(() => selectExecTc(tcId), 100);
}

// ================================================================
// TC DETAIL MODAL
// ================================================================
function openTcDetail(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const r = state.results[tcId];
  const isCustom = isCustomTc(tcId);
  document.getElementById('modal-tc-title').textContent = tc.id + ' — ' + tc.name;
  document.getElementById('modal-tc-body').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
      ${priorityBadge(tc.priority)}
      <span class="module-tag">${getModuleName(tc.module)}</span>
      ${isCustom ? '<span class="badge-custom">✨ Tùy chỉnh</span>' : '<span class="badge-builtin">📦 Bộ chuẩn gốc</span>'}
      ${statusBadge(r?.status || 'Not Run')}
      ${tc.platform ? `<span style="font-size:12px;color:#4338ca;font-weight:600;padding:4px 8px;background:#e0e7ff;border-radius:4px">💻 ${tc.platform}</span>` : ''}
    </div>
    ${tc.testData ? `<div class="modal-section" style="background:#f1f5f9;padding:12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:16px">
      <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px">Dữ liệu đầu vào (Test Data)</div>
      <div style="font-family:monospace;font-size:13px;color:#0f172a;white-space:pre-wrap;word-break:break-word">${tc.testData}</div>
    </div>` : ''}
    ${tc.precondition ? `<div class="modal-section">
      <div class="modal-section-title">⚙️ Điều kiện tiên quyết</div>
      <div class="modal-section-content">${tc.precondition}</div>
    </div>` : ''}
    ${tc.steps ? `<div class="modal-section">
      <div class="modal-section-title">📝 Các bước thực hiện</div>
      <div class="modal-section-content"><ul>${tc.steps.map(s=>`<li>${s}</li>`).join('')}</ul></div>
    </div>` : ''}
    <div class="modal-section">
      <div class="modal-section-title">✅ Kết quả mong đợi</div>
      <div class="modal-section-content"><ul>${(tc.expected||[]).map(e=>`<li>${e}</li>`).join('')}</ul></div>
    </div>
    ${tc.notes ? `<div class="modal-section">
      <div class="modal-section-title">📌 Ghi chú</div>
      <div class="modal-section-content">${tc.notes}</div>
    </div>` : ''}
    ${r ? `<div class="modal-section" style="border:1px solid var(--border);border-radius:8px;padding:12px">
      <div class="modal-section-title">📊 Kết quả thực thi</div>
      <div style="font-size:13px;display:grid;gap:6px">
        <div><strong>Trạng thái:</strong> ${statusBadge(r.status)}</div>
        ${r.tester ? `<div><strong>Người test:</strong> ${r.tester}</div>` : ''}
        ${r.runAt ? `<div><strong>Ngày chạy:</strong> ${new Date(r.runAt).toLocaleString('vi-VN')}</div>` : ''}
        ${r.failReason ? `<div><strong>Lý do lỗi:</strong> <span style="color:#f87171">${r.failReason}</span></div>` : ''}
        ${r.note ? `<div><strong>Ghi chú:</strong> ${r.note}</div>` : ''}
      </div>
    </div>` : ''}
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closeModal('modal-tc');quickNavigateExec('${tcId}')">▶ Thực thi TC này</button>
      <button class="btn btn-outline admin-only" onclick="closeModal('modal-tc');openCloneTcModal('${tcId}')">📋 Nhân bản</button>
      <button class="btn btn-outline admin-only" onclick="closeModal('modal-tc');openEditTcModal('${tcId}')">✏️ ${isCustom ? 'Sửa' : 'Hiệu đính'}</button>
      ${isOverriddenTc(tcId) ? `<button class="btn btn-outline admin-only" onclick="closeModal('modal-tc');resetBuiltinTc('${tcId}')" style="color:#d97706">🔄 Khôi phục gốc</button>` : ''}
      <button class="btn btn-outline" onclick="closeModal('modal-tc')">Đóng</button>
    </div>`;
  openModal('modal-tc');
}

// ================================================================
// EXECUTE PAGE
// ================================================================
function renderExecutePage() {
  const modSelect = document.getElementById('exec-filter-module');
  if (modSelect && modSelect.options.length <= 1) {
    populateModuleSelects();
  }
  filterExecList();
  if (state.selectedTcId) selectExecTc(state.selectedTcId);
}

function filterExecList() {
  const srch = (document.getElementById('exec-search').value || '').toLowerCase().trim();
  const mod = document.getElementById('exec-filter-module').value;
  const sts = document.getElementById('exec-filter-status').value;
  const all = getAllTcs();
  const filtered = all.filter(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    if (mod && tc.module !== mod) return false;
    if (sts && s !== sts) return false;
    if (srch && !tc.id.toLowerCase().includes(srch) && !tc.name.toLowerCase().includes(srch)) return false;
    return true;
  });
  const el = document.getElementById('exec-tc-list');
  el.innerHTML = filtered.map(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    const cls = (s).replace(' ','-');
    const isCustom = isCustomTc(tc.id);
    return `<div class="exec-tc-item ${state.selectedTcId===tc.id?'selected':''}" onclick="selectExecTc('${tc.id}')">
      <div class="exec-tc-item-code">${tc.id}</div>
      <div class="exec-tc-item-name">${tc.name}</div>
      <div class="exec-tc-item-meta">
        ${priorityBadge(tc.priority)}
        ${isCustom ? '<span class="badge-custom" style="font-size:10px;padding:1px 6px">✨ Tùy chỉnh</span>' : ''}
        <span class="status-badge status-${cls}" style="font-size:10.5px;padding:2px 7px">${s}</span>
      </div>
    </div>`;
  }).join('');
}

function selectExecTc(tcId) {
  state.selectedTcId = tcId;
  document.querySelectorAll('.exec-tc-item').forEach(el => el.classList.remove('selected'));
  const items = document.querySelectorAll('.exec-tc-item');
  items.forEach(el => { if (el.querySelector('.exec-tc-item-code')?.textContent === tcId) el.classList.add('selected'); });
  renderExecDetail(tcId);
}

function switchExecTab(tcId, subtab) {
  state.execActiveSubtab = subtab;
  const card = document.getElementById('exec-detail-card');
  if (!card) return;
  card.querySelectorAll('.exec-subtab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
  });
  card.querySelectorAll('.exec-subtab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.getAttribute('data-subtab') === subtab);
  });
}

function switchSettingsTab(subtab) {
  state.settingsActiveTab = subtab;
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
  });
  document.querySelectorAll('.settings-tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-pane-${subtab}`);
  });
}

function openModulesSettingTab() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền quản lý danh mục Modules!', 'error');
    return;
  }
  navigate('settings');
  switchSettingsTab('settings-modules');
}

function renderExecDetail(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const r = state.results[tcId] || {};
  const isCustom = isCustomTc(tcId);
  const card = document.getElementById('exec-detail-card');
  const comments = (state.comments && state.comments[tcId]) || [];
  const evidences = r.evidences || [];

  if (state.execDraftTcId !== tcId) {
    state.execDraftTcId = tcId;
    state.execDraftStatus = r.status || '';
  }
  const draftStatus = state.execDraftStatus || r.status || '';

  const isFailed = draftStatus === 'Fail' || r.status === 'Fail' || (r.defectStatus && r.defectStatus !== 'None');
  const currentSubtab = state.execActiveSubtab || 'steps';

  card.innerHTML = `<div class="exec-detail-container">
    <!-- STICKY TOP HEADER -->
    <div class="exec-card-header">
      <div class="exec-top-info">
        <div class="exec-top-id-row">
          <div class="exec-id-tags">
            <span class="exec-tc-header-code">${tc.id}</span>
            ${isCustom ? '<span class="badge-custom">✨ Tùy chỉnh</span>' : '<span class="badge-builtin">📦 Chuẩn gốc</span>'}
            ${priorityBadge(tc.priority)}
            <span class="exec-top-module">📁 ${getModuleName(tc.module)}</span>
            ${tc.platform ? `<span class="exec-top-platform">💻 ${tc.platform}</span>` : ''}
          </div>
          <div class="exec-top-actions">
            <button class="btn btn-outline btn-xs" onclick="prevTc('${tcId}')" title="Test case trước (Phím tắt: Alt + ←)">← Trước</button>
            <button class="btn btn-outline btn-xs" onclick="nextTc('${tcId}')" title="Test case tiếp theo (Phím tắt: Alt + →)">Tiếp →</button>
            <button class="btn btn-outline btn-xs admin-only" onclick="openEditTcModal('${tcId}')" title="Sửa nội dung test case">✏️ Sửa</button>
            ${isOverriddenTc(tcId) ? `<button class="btn btn-outline btn-xs admin-only" onclick="resetBuiltinTc('${tcId}')" style="color:#d97706" title="Khôi phục nguyên bản">🔄 Gốc</button>` : ''}
            <button class="btn btn-outline btn-xs admin-only" onclick="openCloneTcModal('${tcId}')" title="Nhân bản test case này">📋 Nhân bản</button>
          </div>
        </div>
        <h2 class="exec-tc-header-name">${tc.name}</h2>
      </div>

      <!-- EVALUATION & CONFIRMATION TOOLBAR -->
      <div class="exec-action-toolbar">
        <div class="exec-status-group">
          <span class="toolbar-label">1. Chọn kết quả:</span>
          <div class="status-selector-compact" id="status-sel-${tcId}">
            <button type="button" class="btn-stat btn-stat-pass ${draftStatus==='Pass'?'active':''}" onclick="selectDraftStatus('${tcId}','Pass')" title="Chọn Pass (Bấm 'Xác nhận & Lưu' để gửi lên hệ thống)">
              ✅ Pass
            </button>
            <button type="button" class="btn-stat btn-stat-fail ${draftStatus==='Fail'?'active':''}" onclick="selectDraftStatus('${tcId}','Fail')" title="Chọn Fail (Chuyển sang Tab 2 để điền lý do lỗi)">
              ❌ Fail
            </button>
            <button type="button" class="btn-stat btn-stat-skip ${draftStatus==='Skip'?'active':''}" onclick="selectDraftStatus('${tcId}','Skip')" title="Chọn Bỏ qua (Skip)">
              ⏭ Skip
            </button>
            <button type="button" class="btn-stat btn-stat-inprog ${draftStatus==='In Progress'?'active':''}" onclick="selectDraftStatus('${tcId}','In Progress')" title="Chọn Đang test">
              🔄 Đang test
            </button>
          </div>
        </div>

        <div class="exec-confirm-group">
          <button type="button" class="btn btn-primary btn-confirm-save" onclick="confirmSaveTestResult('${tcId}')" title="Xác nhận kết quả đánh giá và đồng bộ lên hệ thống">
            💾 Xác nhận & Lưu
          </button>
          <button type="button" class="btn btn-outline btn-save-next" onclick="confirmSaveTestResult('${tcId}', true)" title="Lưu và chuyển ngay sang test case tiếp theo">
            Lưu & Tiếp →
          </button>
        </div>

        <div class="exec-meta-info">
          <span class="exec-saved-status-badge">
            Đã lưu: <strong class="status-badge status-${(r.status||'Not Run').replace(' ','-')}">${r.status || 'Chưa chạy'}</strong>
          </span>
          <span>👤 <strong>${r.tester || (state.currentUser ? state.currentUser.name : 'Tester')}</strong></span>
          <span>⏱️ ${r.runAt ? new Date(r.runAt).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'}) : 'Chưa lưu'}</span>
        </div>
      </div>

      <!-- SUB-TABS NAVIGATION -->
      <div class="exec-subtabs-nav">
        <button class="exec-subtab-btn ${currentSubtab==='steps'?'active':''}" data-subtab="steps" onclick="switchExecTab('${tcId}','steps')">
          📋 1. Kịch bản & Các bước
        </button>
        <button class="exec-subtab-btn ${currentSubtab==='defect'?'active':''}" data-subtab="defect" onclick="switchExecTab('${tcId}','defect')">
          🎯 2. Đánh giá & Báo cáo kết quả ${isFailed ? `<span class="tab-defect-badge">🐞 ${r.defectStatus||'Lỗi'}</span>` : ''}
        </button>
        <button class="exec-subtab-btn ${currentSubtab==='evidence'?'active':''}" data-subtab="evidence" onclick="switchExecTab('${tcId}','evidence')">
          📸 3. Bằng chứng ảnh <span class="tab-count-badge">${evidences.length}</span>
        </button>
        <button class="exec-subtab-btn ${currentSubtab==='discuss'?'active':''}" data-subtab="discuss" onclick="switchExecTab('${tcId}','discuss')">
          💬 4. Trao đổi QA & Dev (Độc lập) <span class="tab-count-badge">${comments.length}</span>
        </button>
      </div>
    </div>

    <!-- SCROLLABLE SUB-TAB BODY -->
    <div class="exec-tab-body">
      <!-- PANE 1: KỊCH BẢN & CÁC BƯỚC -->
      <div class="exec-subtab-pane ${currentSubtab==='steps'?'active':''}" data-subtab="steps">
        ${tc.testData ? `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px 14px;">
          <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Dữ liệu đầu vào (Test Data)</div>
          <div style="font-family:monospace;font-size:13px;color:#0f172a;white-space:pre-wrap;word-break:break-word">${tc.testData}</div>
        </div>` : ''}

        ${tc.precondition ? `
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px 14px;">
          <div style="font-size:11.5px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">⚙️ Điều kiện tiên quyết (Precondition)</div>
          <div style="font-size:13px;color:#0c4a6e;line-height:1.5">${tc.precondition}</div>
        </div>` : ''}

        ${tc.steps && tc.steps.length ? `
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">📝 Các bước thực hiện (${tc.steps.length} bước)</div>
          <div>
            ${tc.steps.map((s, idx) => `
              <div class="step-card">
                <div class="step-num">${idx + 1}</div>
                <div class="step-desc">${s}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${tc.expected && tc.expected.length ? `
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">✅ Kết quả mong đợi</div>
          <div>
            ${tc.expected.map(e => `
              <div class="expected-card">
                <span class="expected-icon">✅</span>
                <div class="expected-text">${e}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${tc.notes ? `
        <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; padding:12px 14px;">
          <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">📌 Ghi chú kỹ thuật gốc</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">${tc.notes}</div>
        </div>` : ''}
      </div>

      <!-- PANE 2: KẾT QUẢ & LỖI (DEFECT) -->
      <div class="exec-subtab-pane ${currentSubtab==='defect'?'active':''}" data-subtab="defect">
        <div class="exec-draft-alert ${draftStatus==='Fail'?'alert-fail':draftStatus==='Pass'?'alert-pass':''}" id="draft-alert-${tcId}">
          <div>
            <span>Đang chọn kết quả: </span>
            <strong id="draft-status-label-${tcId}">${draftStatus==='Pass'?'✅ Pass':draftStatus==='Fail'?'❌ Fail':draftStatus==='Skip'?'⏭ Skip':draftStatus==='In Progress'?'🔄 Đang test':'⏳ Chưa chọn kết quả'}</strong>
          </div>
          <div style="font-size:12px;opacity:0.9">
            💡 Thiết lập thông tin xong, hãy bấm <strong>"Xác nhận & Lưu"</strong> để gửi lên hệ thống.
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label>Người thực hiện test</label>
            <input type="text" id="ef-tester" value="${r.tester || (state.currentUser ? state.currentUser.name : '')}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label>Thời điểm thực thi</label>
            <input type="text" value="${r.runAt ? new Date(r.runAt).toLocaleString('vi-VN') : 'Chưa lưu lên hệ thống'}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed" />
          </div>
        </div>

        <div class="form-group">
          <label style="font-weight:600; color:#dc2626">Lý do thất bại / Lỗi phát hiện (bắt buộc khi chọn Fail) *</label>
          <input type="text" id="ef-fail" placeholder="Mô tả ngắn gọn lỗi thực tế gặp phải (bắt buộc khi đánh Fail)..." value="${r.failReason||''}" oninput="updateTcField('${tcId}','failReason',this.value)" />
        </div>

        <div class="form-group">
          <label>Ghi chú thực thi bổ sung (Môi trường, Account, Payload...)</label>
          <textarea id="ef-note" rows="2" placeholder="Ghi chú thêm về ca test này..." oninput="updateTcField('${tcId}','note',this.value)">${r.note||''}</textarea>
        </div>

        <!-- DEFECT LIFECYCLE BOX -->
        <div class="defect-box" style="margin-top:4px;">
          <div class="defect-box-title">
            <span>🐞 Vòng Đời Lỗi (Defect Tracking Lifecycle)</span>
            <span class="status-badge" style="background:#fee2e2;color:#dc2626">${r.defectStatus || (isFailed ? 'New' : 'Chưa có lỗi')}</span>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label>Mức độ nghiêm trọng (Severity)</label>
              <select id="ef-sev" onchange="updateTcField('${tcId}','severity',this.value)">
                <option value="Blocker" ${r.severity==='Blocker'?'selected':''}>🔴 Blocker (Chặn đứng)</option>
                <option value="Critical" ${r.severity==='Critical'||!r.severity?'selected':''}>🟠 Critical (Nghiêm trọng)</option>
                <option value="Major" ${r.severity==='Major'?'selected':''}>🟡 Major (Lớn)</option>
                <option value="Minor" ${r.severity==='Minor'?'selected':''}>🟢 Minor (Nhẹ / Giao diện)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Lập trình viên phụ trách (Assigned Dev)</label>
              <input type="text" id="ef-dev" placeholder="VD: Trần Quốc Tuấn (Dev)" value="${r.assignedDev||'Trần Quốc Tuấn (Dev)'}" oninput="updateTcField('${tcId}','assignedDev',this.value)" />
            </div>
            <div class="form-group">
              <label>Bản build sửa lỗi (Fix Version)</label>
              <input type="text" id="ef-fixver" placeholder="VD: v2.1.2-build.8" value="${r.fixVersion||''}" oninput="updateTcField('${tcId}','fixVersion',this.value)" />
            </div>
          </div>

          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:8px">Chuyển trạng thái xử lý lỗi:</div>
          <div class="defect-actions-bar">
            <button class="btn-defect btn-defect-inprog" onclick="updateDefectStatus('${tcId}', 'In Progress')">👨‍💻 Dev: Đang sửa</button>
            <button class="btn-defect btn-defect-resolved" onclick="updateDefectStatus('${tcId}', 'Resolved')">🔧 Dev: Đã sửa (Chờ Retest)</button>
            <button class="btn-defect btn-defect-retest-ok" onclick="updateDefectStatus('${tcId}', 'Retest Passed')">✅ Tester: Retest Pass (Đóng lỗi)</button>
            <button class="btn-defect btn-defect-reopen" onclick="updateDefectStatus('${tcId}', 'Retest Fail')">🔄 Tester: Retest Fail (Mở lại)</button>
          </div>
        </div>

        <!-- FORM BOTTOM CONFIRMATION BAR -->
        <div class="exec-pane-submit-bar">
          <div class="submit-bar-left">
            <span>Kết quả sẽ lưu: <strong id="submit-bar-status-${tcId}" style="color:var(--accent)">${draftStatus || 'Chưa chọn'}</strong></span>
          </div>
          <div class="submit-bar-right">
            <button type="button" class="btn btn-primary btn-confirm-save" onclick="confirmSaveTestResult('${tcId}')" style="padding:8px 18px;font-size:13.5px">
              💾 Xác nhận & Lưu kết quả kiểm thử
            </button>
            <button type="button" class="btn btn-outline btn-save-next" onclick="confirmSaveTestResult('${tcId}', true)" style="padding:8px 14px;font-size:13.5px">
              💾 Lưu & Sang test case kế tiếp →
            </button>
          </div>
        </div>
      </div>

      <!-- PANE 3: BẰNG CHỨNG ẢNH & CHỤP MÀN HÌNH -->
      <div class="exec-subtab-pane ${currentSubtab==='evidence'?'active':''}" data-subtab="evidence">
        <div class="evidence-section" style="margin-top:0">
          <div class="evidence-section-title">
            <span>📸 Bằng chứng kiểm thử & Ảnh chụp màn hình</span>
            <span style="font-size:12px;color:var(--accent-light);font-weight:bold">${evidences.length} ảnh đính kèm</span>
          </div>

          <!-- CÔNG CỤ CHỤP MÀN HÌNH -->
          <div class="evidence-btn-group">
            <button type="button" class="btn btn-primary btn-sm" onclick="startScreenSnip('${tcId}')" title="Khoanh vùng một phần màn hình máy tính để chụp ảnh lỗi">
              ✂️ Chụp một phần màn hình (Snip Tool)
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="captureFullScreen('${tcId}')" title="Chụp toàn bộ cửa sổ hoặc màn hình">
              🖥️ Chụp toàn màn hình
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('ev-file-${tcId}').click()" title="Chọn tệp ảnh từ máy">
              📁 Tải file ảnh
            </button>
          </div>

          <div class="evidence-dropzone" id="dz-${tcId}" onclick="document.getElementById('ev-file-${tcId}').click()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="event.preventDefault();this.classList.remove('dragover');handleEvidenceUpload('${tcId}', event.dataTransfer.files)">
            <div class="dz-icon">📸</div>
            <div><strong>Kéo thả ảnh vào đây</strong> hoặc bấm chọn file</div>
            <div class="dz-hint">💡 Có thể dùng nút <strong>✂️ Chụp một phần màn hình</strong> ở trên, hoặc bấm <strong>Ctrl + V</strong> để dán ảnh trực tiếp từ Clipboard!</div>
            <input type="file" id="ev-file-${tcId}" accept="image/*" multiple style="display:none" onchange="handleEvidenceUpload('${tcId}', this.files)" />
          </div>

          ${evidences.length > 0 ? `
          <div class="evidence-grid" style="margin-top:14px">
            ${evidences.map(ev => `
              <div class="evidence-card" title="${ev.name}">
                <img src="${ev.url}" onclick="openLightbox('${ev.url}', '${ev.name}')" alt="Screenshot" />
                <button class="evidence-delete" onclick="removeEvidence('${tcId}', '${ev.id}')" title="Xóa ảnh">✕</button>
                <div class="evidence-caption">${ev.name}</div>
              </div>
            `).join('')}
          </div>` : ''}
        </div>
      </div>

      <!-- PANE 4: TRAO ĐỔI THẢO LUẬN QA & DEV (ĐỘC LẬP) -->
      <div class="exec-subtab-pane ${currentSubtab==='discuss'?'active':''}" data-subtab="discuss">
        <div class="comments-section" style="margin-top:0">
          <div class="comments-independent-notice">
            <div class="notice-icon">💬</div>
            <div class="notice-body">
              <div class="notice-title">Kênh trao đổi 2 chiều độc lập (Tester ⇄ Dev ⇄ QA Lead)</div>
              <div class="notice-desc">
                Khu vực này hoạt động <strong>hoàn toàn độc lập</strong> với việc chấm điểm Pass/Fail của test case. Tester, Dev và QA Lead có thể trao đổi log lỗi, commit hash, đặt câu hỏi làm rõ theo thời gian thực mà <strong>không làm thay đổi hay ghi đè</strong> lên trạng thái kiểm thử hiện tại.
              </div>
            </div>
          </div>

          <div class="comments-header">
            <span>💬 Thảo luận & Phản hồi kỹ thuật (${comments.length})</span>
            <span style="font-size:11.5px;color:var(--text-muted);font-weight:normal">Gửi và cập nhật realtime</span>
          </div>

          <div class="comment-feed" id="comment-feed-${tcId}">
            ${comments.length === 0 ? `<div style="font-size:12.5px;color:var(--text-muted);font-style:italic;padding:12px 0">Chưa có trao đổi nào. Hãy để lại ghi chú, commit hash hoặc câu hỏi cho Dev.</div>` :
              comments.map(c => {
                const roleClass = c.role === 'developer' ? 'role-tag-dev' : c.role === 'admin' ? 'role-tag-lead' : 'role-tag-tester';
                const roleName = c.role === 'developer' ? 'Developer' : c.role === 'admin' ? 'QA Lead' : 'Tester';
                return `<div class="comment-item">
                  <div class="comment-meta">
                    <div class="comment-author">
                      <span>${c.author || 'Thành viên'}</span>
                      <span class="comment-role-tag ${roleClass}">${roleName}</span>
                    </div>
                    <div class="comment-time">${new Date(c.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'})} · ${new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div class="comment-body">${c.content}</div>
                </div>`;
              }).join('')
            }
          </div>

          <div class="comment-input-box">
            <textarea id="comment-input-${tcId}" placeholder="Nhập bình luận, phản hồi commit fix, yêu cầu kiểm tra lại... (Bấm Ctrl + Enter để gửi nhanh)" onkeydown="if(event.ctrlKey && event.key==='Enter'){ addComment('${tcId}'); }"></textarea>
            <button class="btn btn-primary" onclick="addComment('${tcId}')" style="height:58px;padding:0 16px">Gửi 💬</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function selectDraftStatus(tcId, status) {
  if (state.currentUser && state.currentUser.role === 'developer') {
    showToast('⚠️ Developer không trực tiếp duyệt Pass/Fail. Vui lòng cập nhật trạng thái xử lý lỗi (Defect Lifecycle: Đang sửa / Đã sửa) và để Tester nghiệm thu!', 'info');
    return;
  }
  
  state.execDraftStatus = status;

  // Cập nhật class active cho các nút trạng thái trên toolbar
  const selEl = document.getElementById(`status-sel-${tcId}`);
  if (selEl) {
    selEl.querySelectorAll('.btn-stat').forEach(b => b.classList.remove('active'));
    const btnCls = status === 'In Progress' ? 'inprog' : status.toLowerCase();
    const btn = selEl.querySelector(`.btn-stat-${btnCls}`);
    if (btn) btn.classList.add('active');
  }

  // Cập nhật nhãn trạng thái draft ở pane 2 nếu đang mở
  const labelEl = document.getElementById(`draft-status-label-${tcId}`);
  if (labelEl) {
    labelEl.textContent = status === 'Pass' ? '✅ Pass' : status === 'Fail' ? '❌ Fail' : status === 'Skip' ? '⏭ Skip' : '🔄 Đang test';
  }
  const submitBarStatus = document.getElementById(`submit-bar-status-${tcId}`);
  if (submitBarStatus) {
    submitBarStatus.textContent = status;
  }
  const alertEl = document.getElementById(`draft-alert-${tcId}`);
  if (alertEl) {
    alertEl.className = `exec-draft-alert ${status === 'Fail' ? 'alert-fail' : status === 'Pass' ? 'alert-pass' : ''}`;
  }

  // Khi chọn Fail: Tự động chuyển sang Subtab 2 và focus vào ô Lý do lỗi
  if (status === 'Fail') {
    switchExecTab(tcId, 'defect');
    setTimeout(() => {
      const failEl = document.getElementById('ef-fail');
      if (failEl) {
        failEl.focus();
        failEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
    showToast('❌ Đã chọn Fail! Vui lòng nhập lý do lỗi và bấm "Xác nhận & Lưu".', 'info');
  } else if (status === 'Pass') {
    showToast('✅ Đã chọn Pass! Hãy bấm "Xác nhận & Lưu" để gửi lên hệ thống.', 'info');
  } else if (status === 'Skip') {
    showToast('⏭ Đã chọn Skip! Bấm "Xác nhận & Lưu" để nộp kết quả.', 'info');
  } else if (status === 'In Progress') {
    showToast('🔄 Đã chọn Đang test! Bấm "Xác nhận & Lưu" để cập nhật.', 'info');
  }
}

function confirmSaveTestResult(tcId, andNext = false) {
  if (state.currentUser && state.currentUser.role === 'developer') {
    showToast('⚠️ Developer không trực tiếp duyệt Pass/Fail. Vui lòng cập nhật trạng thái xử lý lỗi (Defect Lifecycle: Đang sửa / Đã sửa) và để Tester nghiệm thu!', 'info');
    return;
  }

  const status = state.execDraftStatus || (state.results[tcId] && state.results[tcId].status);
  if (!status || status === 'Not Run') {
    showToast('⚠️ Vui lòng chọn kết quả đánh giá (Pass, Fail, Skip hoặc Đang test) trước khi Lưu!', 'error');
    return;
  }

  const failEl = document.getElementById('ef-fail');
  const failReason = failEl ? failEl.value.trim() : ((state.results[tcId] && state.results[tcId].failReason) || '').trim();

  if (status === 'Fail' && !failReason) {
    switchExecTab(tcId, 'defect');
    showToast('⚠️ Bắt buộc phải nhập Lý do thất bại / Lỗi phát hiện khi đánh giá Fail!', 'error');
    setTimeout(() => {
      const targetEl = document.getElementById('ef-fail');
      if (targetEl) targetEl.focus();
    }, 60);
    return;
  }

  if (!state.results[tcId]) state.results[tcId] = {};
  state.results[tcId].status = status;
  state.results[tcId].runAt = new Date().toISOString();
  state.results[tcId].tester = (state.currentUser && state.currentUser.name) || 'Tester';

  if (failEl) state.results[tcId].failReason = failReason;
  const noteEl = document.getElementById('ef-note');
  if (noteEl) state.results[tcId].note = noteEl.value.trim();

  const sevEl = document.getElementById('ef-sev');
  if (sevEl) state.results[tcId].severity = sevEl.value;
  const devEl = document.getElementById('ef-dev');
  if (devEl) state.results[tcId].assignedDev = devEl.value.trim();
  const fixEl = document.getElementById('ef-fixver');
  if (fixEl) state.results[tcId].fixVersion = fixEl.value.trim();

  if (status === 'Fail') {
    if (!state.results[tcId].defectStatus || state.results[tcId].defectStatus === 'None') {
      state.results[tcId].defectStatus = 'New';
    }
  } else if (status === 'Pass' && state.results[tcId].defectStatus && state.results[tcId].defectStatus !== 'None') {
    state.results[tcId].defectStatus = 'Retest Passed';
  }

  saveState();
  renderExecDetail(tcId);
  filterExecList();
  syncSingleResultToSupabase(tcId);

  const statEmoji = status === 'Pass' ? '✅' : status === 'Fail' ? '❌' : status === 'Skip' ? '⏭' : '🔄';
  showToast(`${statEmoji} Đã xác nhận & lưu kết quả ${tcId}: [${status}] lên hệ thống!`, status === 'Pass' ? 'success' : status === 'Fail' ? 'error' : 'info');

  if (andNext) {
    setTimeout(() => {
      nextTc(tcId);
    }, 200);
  }
}

function setStatus(tcId, status) {
  selectDraftStatus(tcId, status);
}

function updateTcField(tcId, field, value) {
  if (!state.results[tcId]) state.results[tcId] = { status: 'Not Run' };
  state.results[tcId][field] = value;
  saveState();
}

function prevTc(currentId) {
  const all = getAllTcs();
  const idx = all.findIndex(t => t.id === currentId);
  if (idx > 0) { selectExecTc(all[idx-1].id); filterExecList(); }
}
function nextTc(currentId) {
  const all = getAllTcs();
  const idx = all.findIndex(t => t.id === currentId);
  if (idx < all.length - 1) { selectExecTc(all[idx+1].id); filterExecList(); }
}

// ================================================================
// REPORT PAGE
// ================================================================
function renderReport() {
  document.getElementById('rpt-date').textContent = new Date().toLocaleDateString('vi-VN');
  document.getElementById('rpt-session').textContent = state.session?.name || 'Chưa có phiên';
  document.getElementById('rpt-owner').textContent = state.session?.owner || 'QA Team';

  const s = getStats();
  const statsHtml = `
    <div class="stat-card stat-total"><div class="stat-icon">📋</div><div class="stat-body"><div class="stat-value">${s.total}</div><div class="stat-label">Tổng TC</div></div></div>
    <div class="stat-card stat-pass"><div class="stat-icon">✅</div><div class="stat-body"><div class="stat-value" style="color:#4ade80">${s.pass}</div><div class="stat-label">Passed</div></div></div>
    <div class="stat-card stat-fail clickable-stat" onclick="jumpToOverdueAssignments()" title="Bấm để lọc các bài ĐANG QUÁ HẠN"><div class="stat-icon">❌</div><div class="stat-body"><div class="stat-value" style="color:#f87171">${s.fail}</div><div class="stat-label">Failed</div></div></div>
    <div class="stat-card stat-skip"><div class="stat-icon">⏭️</div><div class="stat-body"><div class="stat-value" style="color:#fbbf24">${s.skip}</div><div class="stat-label">Skipped</div></div></div>
    <div class="stat-card stat-pending"><div class="stat-icon">⏳</div><div class="stat-body"><div class="stat-value" style="color:#64748b">${s.pending}</div><div class="stat-label">Chưa chạy</div></div></div>
    <div class="stat-card stat-progress"><div class="stat-icon">🎯</div><div class="stat-body"><div class="stat-value" style="color:#60a5fa">${s.passRate}%</div><div class="stat-label">Pass Rate</div></div></div>`;
  document.getElementById('report-stats-grid').innerHTML = statsHtml;

  // Charts
  renderReportPieChart(s);
  renderReportBarChart();

  // Fail table
  const fails = getAllTcs().filter(tc => state.results[tc.id]?.status === 'Fail');
  document.getElementById('fail-count-badge').textContent = fails.length;
  document.getElementById('fail-table-body').innerHTML = fails.length ? fails.map(tc => {
    const r = state.results[tc.id];
    return `<tr>
      <td class="tc-code">${tc.id}</td>
      <td><span class="module-tag">${getModuleShort(tc.module)}</span></td>
      <td>${tc.name}</td>
      <td style="color:#f87171;font-size:12px">${r.failReason || '—'}</td>
      <td style="font-size:12px">${r.tester || '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.runAt ? new Date(r.runAt).toLocaleDateString('vi-VN') : '—'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" class="empty-state">Không có TC nào bị Fail 🎉</td></tr>';

  // Module report
  const mStats = getModuleStats();
  document.getElementById('report-module-body').innerHTML = mStats.map(m => {
    const ran = m.pass + m.fail + m.skip;
    const passRate = m.total > 0 ? Math.round((m.pass/m.total)*100) : 0;
    let badge = '<span style="color:#64748b">⏳ Chưa bắt đầu</span>';
    if (ran > 0 && ran < m.total) badge = '<span style="color:#60a5fa">🔄 Đang chạy</span>';
    else if (ran === m.total && m.fail === 0) badge = '<span style="color:#4ade80">✅ Hoàn thành</span>';
    else if (ran === m.total) badge = '<span style="color:#f87171">⚠️ Có lỗi</span>';
    return `<tr>
      <td><strong>${m.name}</strong></td>
      <td>${m.total}</td>
      <td style="color:#4ade80">${m.pass}</td>
      <td style="color:#f87171">${m.fail}</td>
      <td style="color:#fbbf24">${m.skip}</td>
      <td style="color:#64748b">${m.pending}</td>
      <td class="pass-rate-cell">${passRate}%</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
}

function renderReportPieChart(s) {
  const ctx = document.getElementById('chartReportPie').getContext('2d');
  if (state.charts.pie) state.charts.pie.destroy();
  const tc = getThemeChartColors();
  state.charts.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pass','Fail','Skip','Chưa chạy'],
      datasets: [{ data: [s.pass,s.fail,s.skip,s.pending],
        backgroundColor: ['rgba(34,197,94,0.85)','rgba(239,68,68,0.85)','rgba(245,158,11,0.85)','rgba(100,116,139,0.4)'],
        borderWidth: 2, borderColor: tc.pieBorderColor, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position:'bottom', labels:{color: tc.legendColor, font:{family:'Inter',size:12}, padding:16} } }
    }
  });
}

function renderReportBarChart() {
  const ctx = document.getElementById('chartReportBar').getContext('2d');
  if (state.charts.bar) state.charts.bar.destroy();
  const mStats = getModuleStats();
  const tc = getThemeChartColors();
  state.charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mStats.map(m => m.short),
      datasets: [
        { label:'Pass', data:mStats.map(m=>m.pass), backgroundColor:'rgba(34,197,94,0.8)', borderRadius:4 },
        { label:'Fail', data:mStats.map(m=>m.fail), backgroundColor:'rgba(239,68,68,0.8)', borderRadius:4 },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{labels:{color: tc.legendColor, font:{family:'Inter',size:11}}}},
      scales:{
        x:{grid:{color: tc.gridColor}, ticks:{color: tc.tickColor, font:{size:10}}},
        y:{grid:{color: tc.gridColor}, ticks:{color: tc.tickColor}}
      }
    }
  });
}

// ================================================================
// SETTINGS PAGE
// ================================================================
function renderSettings() {
  const statTcs = document.getElementById('catalog-stat-tcs');
  if (statTcs) statTcs.textContent = getAllTcs().length;
  const statMods = document.getElementById('catalog-stat-mods');
  if (statMods) statMods.textContent = getModules().length;

  // Điền cấu hình Supabase
  loadSupabaseConfig();
  const sbUrlEl = document.getElementById('sb-url');
  const sbKeyEl = document.getElementById('sb-anon-key');
  const sbAutoEl = document.getElementById('sb-auto-sync');
  if (sbUrlEl) sbUrlEl.value = supabaseConfig.url || '';
  if (sbKeyEl) sbKeyEl.value = supabaseConfig.anonKey || '';
  if (sbAutoEl) sbAutoEl.checked = supabaseConfig.autoSync !== false;
  updateSupabaseStatusUI(supabaseConfig.status);

  if (state.session) {
    document.getElementById('set-session-name').value = state.session.name || '';
    document.getElementById('set-owner').value = state.session.owner || '';
    document.getElementById('set-version').value = state.session.version || 'SmartVMS Local v2.0';
    document.getElementById('set-notes').value = state.session.notes || '';
  }

  // Storage stats
  const all = getAllTcs();
  const totalTcs = all.length;
  const customCount = (state.customTcs || []).length;
  const ran = Object.keys(state.results).length;
  const mods = getModules();
  const dataSize = (new Blob([JSON.stringify({ results: state.results, session: state.session, customTcs: state.customTcs, modules: state.modules })]).size / 1024).toFixed(1);
  document.getElementById('storage-stats').innerHTML = `<div class="storage-info">
    <div class="storage-row"><span>Tổng modules:</span><span class="storage-val">${mods.length}</span></div>
    <div class="storage-row"><span>Tổng test cases:</span><span class="storage-val">${totalTcs}</span></div>
    <div class="storage-row"><span>Test cases chuẩn gốc:</span><span class="storage-val">${ALL_TCS.length}</span></div>
    <div class="storage-row"><span>Test cases tùy chỉnh:</span><span class="storage-val" style="color:#c084fc">${customCount}</span></div>
    <div class="storage-row"><span>Đã thực thi:</span><span class="storage-val">${ran}</span></div>
    <div class="storage-row"><span>Còn lại:</span><span class="storage-val">${totalTcs - ran}</span></div>
    <div class="storage-row"><span>Dung lượng dữ liệu:</span><span class="storage-val">${dataSize} KB</span></div>
    <div class="storage-row"><span>Phiên hiện tại:</span><span class="storage-val">${state.session?.name || 'Chưa có'}</span></div>
  </div>`;

  renderSettingsModules();
  switchSettingsTab(state.settingsActiveTab || 'settings-session');
}

function saveSettings() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền lưu Cài đặt hệ thống!', 'error');
    return;
  }
  state.session = {
    ...state.session,
    name: document.getElementById('set-session-name').value,
    owner: document.getElementById('set-owner').value,
    version: document.getElementById('set-version').value,
    notes: document.getElementById('set-notes').value,
  };
  saveState();
  updateSessionDisplay();
  showToast('✅ Đã lưu cài đặt', 'success');
  renderSettings();
}

function updateSessionDisplay() {
  const el = document.getElementById('session-name');
  if (state.session?.name) {
    el.textContent = state.session.name;
    document.querySelector('.dot').className = 'dot dot-green';
  } else {
    el.textContent = 'Chưa có phiên test';
  }
}

// ================================================================
// SESSION MODAL
// ================================================================
function openNewSessionModal() { 
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền tạo phiên test!', 'error');
    return;
  }
  openModal('modal-session'); 
}

function createNewSession() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền tạo phiên test!', 'error');
    return;
  }
  const name = document.getElementById('new-session-name').value.trim();
  const owner = document.getElementById('new-session-owner').value.trim();
  const version = document.getElementById('new-session-version').value.trim();
  if (!name || !owner) { showToast('⚠️ Vui lòng điền Tên phiên và Người phụ trách', 'error'); return; }
  state.session = { name, owner, version, notes: '', createdAt: new Date().toISOString() };
  saveState();
  updateSessionDisplay();
  closeModal('modal-session');
  showToast(`✅ Đã tạo phiên: ${name}`, 'success');
}

// ================================================================
// CUSTOM TEST CASE CRUD OPERATIONS
// ================================================================
function generateNextCustomTcId(modId) {
  const customList = state.customTcs || [];
  let prefix = 'TC-CUSTOM-';
  if (modId) {
    prefix = `TC-${modId}-C`;
  }
  let maxNum = 0;
  const re = new RegExp(`^${prefix}(\\d+)$`, 'i');
  customList.forEach(t => {
    const m = t.id.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

function openAddTcModal(defaultModule) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền tạo Test Case mới!', 'error');
    return;
  }
  const modSelect = document.getElementById('tc-form-module');
  if (modSelect) {
    modSelect.innerHTML = getModules().map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (defaultModule) modSelect.value = defaultModule;
    modSelect.onchange = () => {
      if (document.getElementById('tc-form-mode').value === 'add') {
        document.getElementById('tc-form-id').value = generateNextCustomTcId(modSelect.value);
      }
    };
  }
  const selMod = defaultModule || (getModules()[0]?.id || 'M01');
  document.getElementById('modal-tc-form-title').textContent = '➕ Thêm Test Case mới';
  document.getElementById('tc-form-mode').value = 'add';
  document.getElementById('tc-form-orig-id').value = '';
  document.getElementById('tc-form-id').value = generateNextCustomTcId(selMod);
  document.getElementById('tc-form-id').disabled = false;
  document.getElementById('tc-form-priority').value = 'P2';
  document.getElementById('tc-form-platform').value = 'Giao diện Web UI';
  document.getElementById('tc-form-testdata').value = '';
  document.getElementById('tc-form-name').value = '';
  document.getElementById('tc-form-precondition').value = '';
  document.getElementById('tc-form-steps').value = '';
  document.getElementById('tc-form-expected').value = '';
  document.getElementById('tc-form-notes').value = '';
  openModal('modal-tc-form');
}

function openEditTcModal(tcId) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền chỉnh sửa Test Case!', 'error');
    return;
  }
  const all = getAllTcs();
  const tc = all.find(t => t.id === tcId);
  if (!tc) {
    showToast('⚠️ Không tìm thấy Test Case để chỉnh sửa!', 'error');
    return;
  }
  const isCustom = isCustomTc(tcId);
  const modSelect = document.getElementById('tc-form-module');
  if (modSelect) {
    modSelect.innerHTML = getModules().map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    modSelect.value = tc.module;
    modSelect.onchange = null;
    modSelect.disabled = !isCustom; // Test case chuẩn giữ nguyên module để đảm bảo cấu trúc ID
  }
  document.getElementById('modal-tc-form-title').textContent = isCustom
    ? `✏️ Chỉnh sửa: ${tc.id}`
    : `✏️ Hiệu đính Test Case Chuẩn: ${tc.id}`;
  document.getElementById('tc-form-mode').value = isCustom ? 'edit' : 'override';
  document.getElementById('tc-form-orig-id').value = tc.id;
  document.getElementById('tc-form-id').value = tc.id;
  document.getElementById('tc-form-id').disabled = true;
  document.getElementById('tc-form-priority').value = tc.priority || 'P2';
  document.getElementById('tc-form-platform').value = tc.platform || 'Giao diện Web UI';
  document.getElementById('tc-form-testdata').value = tc.testData || '';
  document.getElementById('tc-form-name').value = tc.name || '';
  document.getElementById('tc-form-precondition').value = tc.precondition || '';
  document.getElementById('tc-form-steps').value = Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || '');
  document.getElementById('tc-form-expected').value = Array.isArray(tc.expected) ? tc.expected.join('\n') : (tc.expected || '');
  document.getElementById('tc-form-notes').value = tc.notes || '';
  openModal('modal-tc-form');
}

function openCloneTcModal(tcId) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền nhân bản Test Case!', 'error');
    return;
  }
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const modSelect = document.getElementById('tc-form-module');
  if (modSelect) {
    modSelect.innerHTML = getModules().map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    modSelect.value = tc.module;
    modSelect.onchange = null;
  }
  document.getElementById('modal-tc-form-title').textContent = `📋 Nhân bản từ ${tc.id}`;
  document.getElementById('tc-form-mode').value = 'add';
  document.getElementById('tc-form-orig-id').value = '';
  document.getElementById('tc-form-id').value = `${tc.id}-COPY`;
  document.getElementById('tc-form-id').disabled = false;
  document.getElementById('tc-form-priority').value = tc.priority || 'P2';
  document.getElementById('tc-form-platform').value = tc.platform || 'Giao diện Web UI';
  document.getElementById('tc-form-testdata').value = tc.testData || '';
  document.getElementById('tc-form-name').value = `[Copy] ${tc.name || ''}`;
  document.getElementById('tc-form-precondition').value = tc.precondition || '';
  document.getElementById('tc-form-steps').value = Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || '');
  document.getElementById('tc-form-expected').value = Array.isArray(tc.expected) ? tc.expected.join('\n') : (tc.expected || '');
  document.getElementById('tc-form-notes').value = tc.notes ? `${tc.notes} (Nhân bản từ ${tc.id})` : `Nhân bản từ ${tc.id}`;
  openModal('modal-tc-form');
}

function saveTcForm() {
  const mode = document.getElementById('tc-form-mode').value;
  const origId = document.getElementById('tc-form-orig-id').value;
  const id = document.getElementById('tc-form-id').value.trim().toUpperCase();
  const mod = document.getElementById('tc-form-module').value;
  const pri = document.getElementById('tc-form-priority').value;
  const platform = document.getElementById('tc-form-platform').value;
  const testData = document.getElementById('tc-form-testdata').value.trim();
  const name = document.getElementById('tc-form-name').value.trim();
  const precondition = document.getElementById('tc-form-precondition').value.trim();
  const stepsRaw = document.getElementById('tc-form-steps').value.trim();
  const expectedRaw = document.getElementById('tc-form-expected').value.trim();
  const notes = document.getElementById('tc-form-notes').value.trim();

  if (!id) {
    showToast('⚠️ Vui lòng nhập Mã Test Case', 'error');
    document.getElementById('tc-form-id').focus();
    return;
  }
  if (!name) {
    showToast('⚠️ Vui lòng nhập Tên / Mục tiêu Test Case', 'error');
    document.getElementById('tc-form-name').focus();
    return;
  }
  if (!expectedRaw) {
    showToast('⚠️ Vui lòng nhập Kết quả mong đợi', 'error');
    document.getElementById('tc-form-expected').focus();
    return;
  }

  const steps = stepsRaw ? stepsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const expected = expectedRaw.split('\n').map(e => e.trim()).filter(Boolean);

  if (mode === 'add') {
    const all = getAllTcs();
    if (all.some(t => t.id.toLowerCase() === id.toLowerCase())) {
      showToast(`⚠️ Mã "${id}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
      document.getElementById('tc-form-id').focus();
      return;
    }
    const newTc = {
      id,
      module: mod,
      priority: pri,
      platform,
      testData: testData || undefined,
      name,
      precondition: precondition || undefined,
      steps: steps.length ? steps : undefined,
      expected,
      notes: notes || undefined,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    state.customTcs.push(newTc);
    saveState();
    closeModal('modal-tc-form');
    showToast(`✅ Đã thêm mới Test Case: ${id}`, 'success');
  } else if (mode === 'edit') {
    const idx = state.customTcs.findIndex(t => t.id === origId);
    if (idx === -1) {
      showToast('❌ Không tìm thấy test case để cập nhật', 'error');
      return;
    }
    state.customTcs[idx] = {
      ...state.customTcs[idx],
      module: mod,
      priority: pri,
      platform,
      testData: testData || undefined,
      name,
      precondition: precondition || undefined,
      steps: steps.length ? steps : undefined,
      expected,
      notes: notes || undefined,
      updatedAt: new Date().toISOString()
    };
    saveState();
    closeModal('modal-tc-form');
    showToast(`✅ Đã cập nhật Test Case: ${origId}`, 'success');
  } else if (mode === 'override') {
    if (!state.overrides) state.overrides = {};
    state.overrides[origId] = {
      name,
      priority: pri,
      platform,
      testData: testData || undefined,
      precondition: precondition || undefined,
      steps: steps.length ? steps : undefined,
      expected,
      notes: notes || undefined,
      updatedAt: new Date().toISOString()
    };
    saveState();
    closeModal('modal-tc-form');
    showToast(`✅ Đã hiệu đính Test Case chuẩn: ${origId}`, 'success');
  }

  const stats = getStats();
  const badgeTotal = document.getElementById('badge-total');
  if (badgeTotal) badgeTotal.textContent = stats.total;

  applyFilters();
  if (document.getElementById('page-execute').classList.contains('active')) {
    filterExecList();
  }
}

function deleteCustomTc(tcId) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền xóa Test Case!', 'error');
    return;
  }
  if (!isCustomTc(tcId)) {
    showToast('⚠️ Không thể xóa các test case gốc chuẩn mực!', 'error');
    return;
  }
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa Test Case "${tcId}"?\nKết quả thực thi của test case này (nếu có) cũng sẽ bị xóa.`)) {
    return;
  }
  state.customTcs = state.customTcs.filter(t => t.id !== tcId);
  if (state.results[tcId]) {
    delete state.results[tcId];
  }
  if (state.selectedTcId === tcId) {
    state.selectedTcId = null;
  }
  saveState();
  showToast(`🗑️ Đã xóa Test Case: ${tcId}`, 'info');

  const stats = getStats();
  const badgeTotal = document.getElementById('badge-total');
  if (badgeTotal) badgeTotal.textContent = stats.total;

  applyFilters();
  if (document.getElementById('page-execute').classList.contains('active')) {
    filterExecList();
  }
}


// ================================================================
// SUPABASE CLOUD & REALTIME COLLABORATION MODULE
// ================================================================
const STORAGE_SB_KEY = 'smartvms_supabase_config';
const DEFAULT_SUPABASE_URL = 'https://ilutfoarcrqxsgoapkct.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_GiS2f75ruddsLkZhoHsq7g__LO1Qp-C';

function cleanSupabaseUrl(url) {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '').trim();
}

let supabaseClient = null;
let realtimeChannel = null;

let supabaseConfig = {
  url: DEFAULT_SUPABASE_URL,
  anonKey: DEFAULT_SUPABASE_KEY,
  autoSync: true,
  status: 'disconnected' // 'disconnected' | 'connecting' | 'connected' | 'error'
};

function loadSupabaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_SB_KEY);
    if (raw) {
      const cfg = JSON.parse(raw);
      supabaseConfig.url = cleanSupabaseUrl(cfg.url || DEFAULT_SUPABASE_URL);
      supabaseConfig.anonKey = (cfg.anonKey || DEFAULT_SUPABASE_KEY).trim();
      supabaseConfig.autoSync = cfg.autoSync !== false;
    } else {
      supabaseConfig.url = DEFAULT_SUPABASE_URL;
      supabaseConfig.anonKey = DEFAULT_SUPABASE_KEY;
      supabaseConfig.autoSync = true;
    }
  } catch(e) {
    console.error('Lỗi đọc cấu hình Supabase:', e);
    supabaseConfig.url = DEFAULT_SUPABASE_URL;
    supabaseConfig.anonKey = DEFAULT_SUPABASE_KEY;
  }
}

function saveSupabaseConfigToStorage() {
  localStorage.setItem(STORAGE_SB_KEY, JSON.stringify({
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey,
    autoSync: supabaseConfig.autoSync
  }));
}

function updateSupabaseStatusUI(status, label) {
  supabaseConfig.status = status;
  const dot = document.getElementById('cloud-dot');
  const text = document.getElementById('cloud-status-text');
  const pill = document.getElementById('supabase-status-pill');

  if (dot) {
    dot.className = `cloud-dot ${status}`;
  }
  if (text) {
    if (status === 'connected') text.textContent = 'Cloud: Realtime';
    else if (status === 'connecting') text.textContent = 'Cloud: Đang nối...';
    else if (status === 'error') text.textContent = 'Cloud: Lỗi kết nối';
    else text.textContent = 'Cloud: Cục bộ';
  }
  if (pill) {
    if (status === 'connected') {
      pill.className = 'badge badge-pass';
      pill.textContent = '🟢 Đã kết nối Realtime';
    } else if (status === 'connecting') {
      pill.className = 'badge badge-skip';
      pill.textContent = '🟡 Đang kết nối...';
    } else if (status === 'error') {
      pill.className = 'badge badge-fail';
      pill.textContent = '🔴 Lỗi kết nối';
    } else {
      pill.className = 'badge badge-nr';
      pill.textContent = '⚪ Chưa kết nối';
    }
  }

  const tabBadge = document.getElementById('sb-status-badge-tab');
  if (tabBadge) {
    if (status === 'connected') {
      tabBadge.className = 'badge badge-pass';
      tabBadge.textContent = '🟢 Đã kết nối';
    } else if (status === 'connecting') {
      tabBadge.className = 'badge badge-skip';
      tabBadge.textContent = '🟡 Đang nối...';
    } else if (status === 'error') {
      tabBadge.className = 'badge badge-fail';
      tabBadge.textContent = '🔴 Lỗi kết nối';
    } else {
      tabBadge.className = 'badge badge-nr';
      tabBadge.textContent = '⚪ Chưa kết nối';
    }
  }
}

async function initSupabase(silent = false) {
  loadSupabaseConfig();
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    updateSupabaseStatusUI('disconnected');
    return;
  }

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.warn('Supabase JS SDK chưa được tải.');
    updateSupabaseStatusUI('error');
    return;
  }

  try {
    updateSupabaseStatusUI('connecting');
    supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false }
    });

    // Test query xem có kết nối được database không
    const { count, error } = await supabaseClient
      .from('test_results')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase query error:', error);
      updateSupabaseStatusUI('error');
      if (!silent) showToast(`❌ Lỗi kết nối Supabase: ${error.message}`, 'error');
      return;
    }

    updateSupabaseStatusUI('connected');
    if (!silent) showToast('⚡ Đã kết nối Supabase Cloud thành công!', 'success');

    // Khởi tạo Realtime Listener
    setupRealtimeSubscription();

    // Tự động kéo dữ liệu mới nhất từ cloud về nếu autoSync bật
    if (supabaseConfig.autoSync) {
      pullSupabaseToLocal({ silent: true });
    }
  } catch (err) {
    console.error('Supabase init error:', err);
    updateSupabaseStatusUI('error');
    if (!silent) showToast(`❌ Lỗi khởi tạo Supabase: ${err.message}`, 'error');
  }
}

function setupRealtimeSubscription() {
  if (!supabaseClient) return;
  if (realtimeChannel) {
    try { supabaseClient.removeChannel(realtimeChannel); } catch(e) {}
  }

  realtimeChannel = supabaseClient
    .channel('public:test_results:changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'test_results' }, payload => {
      handleRealtimePayload(payload);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Realtime Channel Subscribed: public:test_results');
      }
    });
}

function handleRealtimePayload(payload) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  if (eventType === 'INSERT' || eventType === 'UPDATE') {
    if (!newRecord || !newRecord.tc_id) return;
    
    // Kiểm tra xem có khác biệt với local không
    const cur = state.results[newRecord.tc_id];
    if (cur && cur.status === newRecord.status && cur.runAt === newRecord.run_at) {
      return; // Bản ghi do chính máy này vừa cập nhật
    }

    state.results[newRecord.tc_id] = {
      status: newRecord.status,
      tester: newRecord.tester,
      runAt: newRecord.run_at,
      defectStatus: newRecord.defect_status || 'None',
      severity: newRecord.severity || null,
      assignedDev: newRecord.assigned_dev || null,
      fixVersion: newRecord.fix_version || null,
      failReason: newRecord.fail_reason || '',
      note: newRecord.note || '',
      evidences: Array.isArray(newRecord.evidences) ? newRecord.evidences : []
    };
    saveState();

    // Cập nhật giao diện nếu đang ở các trang tương ứng
    applyFilters();
    if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
    if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
    if (document.getElementById('page-report').classList.contains('active')) renderReport();

    showToast(`⚡ [Realtime] ${newRecord.tester || 'Tester'} vừa cập nhật ${newRecord.tc_id}: ${newRecord.status}`, 'info');
  } else if (eventType === 'DELETE') {
    if (oldRecord && oldRecord.tc_id && state.results[oldRecord.tc_id]) {
      delete state.results[oldRecord.tc_id];
      saveState();
      applyFilters();
    }
  }
}

async function saveAndConnectSupabase() {
  const urlEl = document.getElementById('sb-url');
  const keyEl = document.getElementById('sb-anon-key');
  const autoEl = document.getElementById('sb-auto-sync');

  const url = cleanSupabaseUrl(urlEl ? urlEl.value.trim() : '');
  const anonKey = keyEl ? keyEl.value.trim() : '';
  const autoSync = autoEl ? autoEl.checked : true;

  if (!url || !anonKey) {
    showToast('⚠️ Vui lòng nhập đầy đủ Project URL và Anon Key!', 'error');
    return;
  }

  supabaseConfig.url = url;
  supabaseConfig.anonKey = anonKey;
  supabaseConfig.autoSync = autoSync;
  saveSupabaseConfigToStorage();

  await initSupabase(false);
}

function disconnectSupabase() {
  if (realtimeChannel && supabaseClient) {
    try { supabaseClient.removeChannel(realtimeChannel); } catch(e) {}
  }
  supabaseClient = null;
  realtimeChannel = null;
  supabaseConfig.url = '';
  supabaseConfig.anonKey = '';
  supabaseConfig.status = 'disconnected';
  localStorage.removeItem(STORAGE_SB_KEY);

  const urlEl = document.getElementById('sb-url');
  const keyEl = document.getElementById('sb-anon-key');
  if (urlEl) urlEl.value = '';
  if (keyEl) keyEl.value = '';

  updateSupabaseStatusUI('disconnected');
  showToast('🔌 Đã ngắt kết nối Supabase Cloud', 'info');
}

async function syncSingleResultToSupabase(tcId) {
  if (!supabaseClient || !supabaseConfig.autoSync) return;
  const r = state.results[tcId];
  if (!r) return;

  try {
    const payload = {
      run_id: state.currentRunId || 'run_001',
      tc_id: tcId,
      status: r.status,
      tester: r.tester || (state.currentUser ? state.currentUser.name : 'Unknown'),
      run_at: r.runAt || new Date().toISOString(),
      defect_status: r.defectStatus || 'None',
      severity: r.severity || null,
      assigned_dev: r.assignedDev || null,
      fix_version: r.fixVersion || null,
      fail_reason: r.failReason || null,
      note: r.note || null,
      evidences: r.evidences || [],
      updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from('test_results').upsert(payload);
    if (error) console.error('Lỗi đồng bộ kết quả lên Supabase:', error);
  } catch(e) {
    console.error('Sync error:', e);
  }
}

async function pushLocalToSupabase() {
  if (!supabaseClient) {
    showToast('⚠️ Chưa kết nối Supabase Cloud! Vui lòng lưu cấu hình trước.', 'error');
    return;
  }

  const tcIds = Object.keys(state.results);
  if (tcIds.length === 0) {
    showToast('ℹ️ Chưa có kết quả test cục bộ nào để đẩy lên Cloud.', 'info');
    return;
  }

  showToast('⏳ Đang đẩy kết quả lên Supabase Cloud...', 'info');

  try {
    const rows = tcIds.map(id => ({
      run_id: state.currentRunId || 'run_001',
      tc_id: id,
      status: state.results[id].status,
      tester: state.results[id].tester || 'Tester',
      run_at: state.results[id].runAt || new Date().toISOString(),
      defect_status: state.results[id].defectStatus || 'None',
      severity: state.results[id].severity || null,
      assigned_dev: state.results[id].assignedDev || null,
      fix_version: state.results[id].fixVersion || null,
      fail_reason: state.results[id].failReason || null,
      note: state.results[id].note || null,
      evidences: state.results[id].evidences || [],
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient.from('test_results').upsert(rows);
    if (error) {
      showToast(`❌ Lỗi đẩy dữ liệu: ${error.message}`, 'error');
      return;
    }

    // Đẩy cả các test case tùy chỉnh và hiệu đính nếu có
    const allCustom = [...(state.customTcs || [])];
    const overrides = state.overrides || {};
    Object.keys(overrides).forEach(oid => {
      const tc = getAllTcs().find(t => t.id === oid);
      if (tc) allCustom.push({ ...tc, is_overridden: true });
    });

    if (allCustom.length > 0) {
      const customRows = allCustom.map(t => ({
        tc_id: t.id,
        module: t.module,
        priority: t.priority,
        platform: t.platform,
        name: t.name,
        test_data: t.testData || null,
        precondition: t.precondition || null,
        steps: t.steps || null,
        expected: t.expected || null,
        notes: t.notes || null,
        is_custom: Boolean(t.isCustom),
        is_overridden: Boolean(t.isOverridden),
        updated_at: new Date().toISOString()
      }));
      await supabaseClient.from('test_cases_custom').upsert(customRows);
    }

    showToast(`✅ Đã đẩy thành công ${rows.length} kết quả test lên Supabase Cloud!`, 'success');
  } catch(e) {
    showToast(`❌ Lỗi đẩy dữ liệu: ${e.message}`, 'error');
  }
}

async function pullSupabaseToLocal(opts = {}) {
  if (!supabaseClient) {
    if (!opts.silent) showToast('⚠️ Chưa kết nối Supabase Cloud!', 'error');
    return;
  }

  if (!opts.silent) showToast('⏳ Đang kéo dữ liệu từ Supabase Cloud về máy...', 'info');

  try {
    const { data: results, error } = await supabaseClient
      .from('test_results')
      .select('*');

    if (error) {
      if (!opts.silent) showToast(`❌ Lỗi kéo dữ liệu: ${error.message}`, 'error');
      return;
    }

    let count = 0;
    if (Array.isArray(results)) {
      results.forEach(r => {
        state.results[r.tc_id] = {
          status: r.status,
          tester: r.tester,
          runAt: r.run_at,
          defectStatus: r.defect_status || 'None',
          severity: r.severity || null,
          assignedDev: r.assigned_dev || null,
          fixVersion: r.fix_version || null,
          failReason: r.fail_reason || '',
          note: r.note || '',
          evidences: Array.isArray(r.evidences) ? r.evidences : []
        };
        count++;
      });
    }

    // Kéo test cases tùy chỉnh / hiệu đính
    const { data: customData } = await supabaseClient
      .from('test_cases_custom')
      .select('*');

    if (Array.isArray(customData) && customData.length > 0) {
      if (!state.overrides) state.overrides = {};
      customData.forEach(c => {
        if (c.is_overridden) {
          state.overrides[c.tc_id] = {
            name: c.name,
            priority: c.priority,
            platform: c.platform,
            testData: c.test_data,
            precondition: c.precondition,
            steps: c.steps,
            expected: c.expected,
            notes: c.notes,
            updatedAt: c.updated_at
          };
        } else if (c.is_custom) {
          if (!state.customTcs.some(t => t.id === c.tc_id)) {
            state.customTcs.push({
              id: c.tc_id,
              module: c.module,
              priority: c.priority,
              platform: c.platform,
              name: c.name,
              testData: c.test_data,
              precondition: c.precondition,
              steps: c.steps,
              expected: c.expected,
              notes: c.notes,
              isCustom: true,
              createdAt: c.created_at
            });
          }
        }
      });
    }

    saveState();
    applyFilters();
    if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
    if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
    if (document.getElementById('page-report').classList.contains('active')) renderReport();
    if (document.getElementById('page-settings').classList.contains('active')) renderSettings();

    if (!opts.silent) showToast(`✅ Đã tải về ${count} kết quả test từ Supabase Cloud!`, 'success');
  } catch(e) {
    if (!opts.silent) showToast(`❌ Lỗi tải dữ liệu: ${e.message}`, 'error');
  }
}


// ================================================================
// EXPORT / IMPORT / RESET
// ================================================================
function exportReport() {
  const s = getStats();
  const mStats = getModuleStats();
  const allTcs = getAllTcs();
  const now = new Date().toLocaleString('vi-VN');
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo cáo Kiểm thử — SmartVMS Local</title>
<style>
body{font-family:Arial,sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:20px}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:28px;border-radius:12px;margin-bottom:24px}
h1{margin:0;font-size:22px} .sub{opacity:0.85;font-size:13px;margin-top:4px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:24px}
.stat{background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center}
.stat-v{font-size:28px;font-weight:800} .stat-l{font-size:12px;color:#64748b;margin-top:2px}
.pass{color:#16a34a} .fail{color:#dc2626} .skip{color:#d97706} .pending{color:#64748b}
table{width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
th{background:#f1f5f9;padding:10px 14px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:#475569}
td{padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:13px}
tr:last-child td{border:none}
.badge{padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}
.badge-pass{background:#dcfce7;color:#16a34a} .badge-fail{background:#fee2e2;color:#dc2626}
.badge-skip{background:#fef3c7;color:#d97706} .badge-nr{background:#f1f5f9;color:#64748b}
h2{font-size:16px;margin:24px 0 12px;color:#1e293b}
</style></head><body>
<div class="header">
  <h1>📋 Báo cáo Kiểm thử — SmartVMS Local</h1>
  <div class="sub">Phiên: ${state.session?.name || 'N/A'} · Người phụ trách: ${state.session?.owner || 'QA Team'} · Ngày: ${now}</div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-v">${s.total}</div><div class="stat-l">Tổng TC</div></div>
  <div class="stat"><div class="stat-v pass">${s.pass}</div><div class="stat-l">Passed</div></div>
  <div class="stat"><div class="stat-v fail">${s.fail}</div><div class="stat-l">Failed</div></div>
  <div class="stat"><div class="stat-v skip">${s.skip}</div><div class="stat-l">Skipped</div></div>
  <div class="stat"><div class="stat-v pending">${s.pending}</div><div class="stat-l">Chưa chạy</div></div>
  <div class="stat"><div class="stat-v" style="color:#4f46e5">${s.passRate}%</div><div class="stat-l">Pass Rate</div></div>
</div>
<h2>Kết quả theo Module</h2>
<table><thead><tr><th>Module</th><th>Tổng</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Chưa chạy</th><th>Pass Rate</th></tr></thead>
<tbody>${mStats.map(m=>`<tr><td><strong>${m.name}</strong></td><td>${m.total}</td><td class="pass">${m.pass}</td><td class="fail">${m.fail}</td><td class="skip">${m.skip}</td><td class="pending">${m.pending}</td><td><strong>${m.passRate}%</strong></td></tr>`).join('')}</tbody>
</table>
<h2>Tất cả Test Cases (${allTcs.length})</h2>
<table><thead><tr><th>Mã TC</th><th>Module</th><th>Ưu tiên</th><th>Phân loại</th><th>Tên</th><th>Trạng thái</th><th>Người test</th><th>Ngày chạy</th><th>Lý do lỗi</th></tr></thead>
<tbody>${allTcs.map(tc=>{
  const r=state.results[tc.id];
  const st=r?.status||'Not Run';
  const cls=st==='Pass'?'badge-pass':st==='Fail'?'badge-fail':st==='Skip'?'badge-skip':'badge-nr';
  const isCust = isCustomTc(tc.id);
  const typeLabel = isCust ? '<span style="color:#7c3aed;font-weight:bold">Tùy chỉnh</span>' : '<span style="color:#64748b">Chuẩn</span>';
  return `<tr><td style="font-family:monospace;font-size:11px">${tc.id}</td><td>${getModuleShort(tc.module)}</td><td>${tc.priority}</td><td>${typeLabel}</td><td>${tc.name}</td><td><span class="badge ${cls}">${st}</span></td><td>${r?.tester||'—'}</td><td>${r?.runAt?new Date(r.runAt).toLocaleDateString('vi-VN'):'—'}</td><td style="color:#dc2626">${r?.failReason||'—'}</td></tr>`
}).join('')}</tbody>
</table>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartVMS_TestReport_${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  showToast('✅ Đã xuất báo cáo HTML', 'success');
}

function printReport() { window.print(); }

function exportData() {
  const data = {
    session: state.session,
    results: state.results,
    customTcs: state.customTcs || [],
    modules: state.modules || [],
    overrides: state.overrides || {},
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartVMS_TestData_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showToast('✅ Đã xuất dữ liệu JSON (kèm Test Cases & Modules tùy chỉnh)', 'success');
}

function importData(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.results) { state.results = data.results; }
      if (data.session) { state.session = data.session; updateSessionDisplay(); }
      if (data.customTcs && Array.isArray(data.customTcs)) { state.customTcs = data.customTcs; }
      if (data.overrides && typeof data.overrides === 'object') { state.overrides = data.overrides; }
      if (data.modules && Array.isArray(data.modules) && data.modules.length > 0) { state.modules = data.modules; }
      saveState();
      populateModuleSelects();
      showToast('✅ Đã import dữ liệu thành công', 'success');
      renderSettings();
    } catch { showToast('❌ File JSON không hợp lệ', 'error'); }
  };
  reader.readAsText(file);
  evt.target.value = '';
}

function resetResults() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền reset kết quả kiểm thử!', 'error');
    return;
  }
  if (!confirm('⚠️ Bạn chắc chắn muốn xóa toàn bộ kết quả test? Hành động này không thể hoàn tác.')) return;
  state.results = {};
  saveState();
  showToast('🗑 Đã reset toàn bộ kết quả test', 'info');
  renderSettings();
}

// ================================================================
// MODAL HELPERS
// ================================================================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ================================================================
// TOAST
// ================================================================
function showToast(msg, type='info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// ================================================================
// THEME MANAGEMENT (LIGHT / DARK)
// ================================================================
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('smartvms_theme_v2', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '🌙 Tối' : '☀️ Sáng';
    btn.setAttribute('title', theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  showToast(`🎨 Đã đổi sang ${next === 'light' ? 'Giao diện Nền Sáng' : 'Giao diện Nền Tối'}`, 'info');
}

function initTheme() {
  // Mặc định giao diện Sáng Clean Enterprise dịu mắt theo chuẩn doanh nghiệp
  const saved = localStorage.getItem('smartvms_theme_v2') || 'light';
  setTheme(saved);
}

// ================================================================
// MODULE MANAGEMENT CRUD OPERATIONS
// ================================================================
function renderSettingsModules() {
  const tbody = document.getElementById('modules-settings-tbody');
  if (!tbody) return;
  const mods = getModules();
  const allTcs = getAllTcs();
  const countEl = document.getElementById('module-count');
  if (countEl) countEl.textContent = mods.length;
  const badgeEl = document.getElementById('module-count-badge');
  if (badgeEl) badgeEl.textContent = mods.length;

  tbody.innerHTML = mods.map(m => {
    const count = allTcs.filter(t => t.module === m.id).length;
    return `<tr>
      <td><span class="module-badge">${m.id}</span></td>
      <td><strong>${m.name}</strong></td>
      <td><span style="color:var(--text-secondary);font-size:12.5px">${m.short}</span></td>
      <td style="text-align:center"><span class="module-tc-count">${count} TC</span></td>
      <td style="text-align:center">
        <div class="action-btn-group" style="justify-content:center">
          <button class="action-btn edit" onclick="openEditModuleModal('${m.id}')" title="Sửa module">✏️</button>
          <button class="action-btn delete" onclick="deleteModule('${m.id}')" title="Xóa module">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function generateNextModuleId() {
  const mods = getModules();
  let maxNum = 0;
  mods.forEach(m => {
    const match = m.id.match(/^M(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  return `M${String(maxNum + 1).padStart(2, '0')}`;
}

function openAddModuleModal() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền thêm Module!', 'error');
    return;
  }
  document.getElementById('modal-module-title').textContent = '➕ Thêm Module mới';
  document.getElementById('module-form-mode').value = 'add';
  const idInput = document.getElementById('module-form-id');
  idInput.value = generateNextModuleId();
  idInput.disabled = false;
  document.getElementById('module-form-name').value = '';
  document.getElementById('module-form-short').value = '';
  openModal('modal-module-form');
}

function openEditModuleModal(modId) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền chỉnh sửa Module!', 'error');
    return;
  }
  const mod = getModules().find(m => m.id === modId);
  if (!mod) return;
  document.getElementById('modal-module-title').textContent = `✏️ Chỉnh sửa Module: ${mod.id}`;
  document.getElementById('module-form-mode').value = 'edit';
  const idInput = document.getElementById('module-form-id');
  idInput.value = mod.id;
  idInput.disabled = true;
  document.getElementById('module-form-name').value = mod.name;
  document.getElementById('module-form-short').value = mod.short;
  openModal('modal-module-form');
}

function saveModuleForm() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền lưu Module!', 'error');
    return;
  }
  const mode = document.getElementById('module-form-mode').value;
  const id = document.getElementById('module-form-id').value.trim();
  const name = document.getElementById('module-form-name').value.trim();
  const short = document.getElementById('module-form-short').value.trim();

  if (!id || !name || !short) {
    showToast('⚠️ Vui lòng điền đầy đủ Mã, Tên và Tên viết tắt của Module!', 'error');
    return;
  }

  const mods = getModules();

  if (mode === 'add') {
    if (mods.some(m => m.id.toLowerCase() === id.toLowerCase())) {
      showToast(`⚠️ Mã Module "${id}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
      return;
    }
    mods.push({ id, name, short });
    showToast(`✅ Đã thêm Module mới: ${id} - ${name}`, 'success');
  } else {
    const idx = mods.findIndex(m => m.id === id);
    if (idx !== -1) {
      mods[idx].name = name;
      mods[idx].short = short;
      showToast(`✅ Đã cập nhật Module: ${id}`, 'success');
    }
  }

  saveState();
  closeModal('modal-module-form');
  populateModuleSelects();

  // Re-render views
  renderSettings();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases').classList.contains('active')) renderTestCases();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  if (document.getElementById('page-execute').classList.contains('active')) renderExecutePage();
}

function deleteModule(modId) {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền xóa Module!', 'error');
    return;
  }
  const allTcs = getAllTcs();
  const linkedCount = allTcs.filter(t => t.module === modId).length;
  if (linkedCount > 0) {
    showToast(`⚠️ Không thể xóa module "${modId}" vì đang có ${linkedCount} Test Cases liên kết! Vui lòng chuyển hoặc xóa các Test Cases này trước.`, 'error');
    return;
  }

  const mod = getModules().find(m => m.id === modId);
  const modName = mod ? `${mod.id} - ${mod.name}` : modId;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa Module "${modName}"?`)) return;

  state.modules = getModules().filter(m => m.id !== modId);
  saveState();
  populateModuleSelects();
  showToast(`🗑️ Đã xóa Module: ${modId}`, 'info');

  renderSettings();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases').classList.contains('active')) renderTestCases();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  if (document.getElementById('page-execute').classList.contains('active')) renderExecutePage();
}

function resetModulesToDefault() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền khôi phục danh mục Module!', 'error');
    return;
  }
  if (!confirm('⚠️ Bạn có chắc chắn muốn khôi phục danh mục Module về 12 Module mặc định ban đầu chuẩn SmartVMS Local 2026?')) return;
  state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  saveState();
  populateModuleSelects();
  showToast('🔄 Đã khôi phục 12 Module mặc định chuẩn SmartVMS Local 2026', 'success');

  renderSettings();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases').classList.contains('active')) renderTestCases();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  if (document.getElementById('page-execute').classList.contains('active')) renderExecutePage();
}

// ================================================================
// REAL-TIME SYSTEM CLOCK (HEADER TIME DISPLAY)
// ================================================================
function initRealtimeClock() {
  function updateClock() {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const dateEl = document.getElementById('clock-date');
    const timeEl = document.getElementById('clock-time');
    if (dateEl) dateEl.textContent = `${dayName}, ${dd}/${mm}/${yyyy}`;
    if (timeEl) timeEl.textContent = `${hh}:${min}:${ss}`;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRealtimeClock();      // Đồng hồ thời gian thực chuẩn xác từng giây trên Header
  initEnterpriseProjects(); // Khởi tạo CSDL Đa Dự án từ Manifest / CSDL lưu trữ
  initUsersList();          // Khởi tạo Danh sách Nhân sự từ CSDL lưu trữ
  initAssignments();        // Khởi tạo Phân bổ Công việc từ CSDL lưu trữ
  loadState();              // Khởi tạo Kết quả & Đợt test từ CSDL lưu trữ
  initSupabase(true);       // Kết nối đồng bộ Cloud Supabase
  populateModuleSelects();
  updateRunSelectorUI();
  updateSessionDisplay();
  applyAuth();              // Phân quyền RBAC
  navigate('dashboard');
  const all = getAllTcs();
  console.log(`✅ SmartVMS Test Manager v3.0 loaded | ${all.length} Test Cases | Đợt hiện tại: ${state.currentRunId}`);
});

// ================================================================
// MULTI-RUN / TEST CYCLES MANAGEMENT LOGIC
// ================================================================
function updateRunSelectorUI() {
  const sel = document.getElementById('header-run-select');
  if (!sel) return;
  sel.innerHTML = (state.runs || []).map(r => 
    `<option value="${r.id}" ${r.id === state.currentRunId ? 'selected' : ''}>${r.name} (${r.targetVersion || 'v2.0'})</option>`
  ).join('');
}

function switchTestRun(runId) {
  if (!state.runResults) state.runResults = {};
  if (!state.runResults[runId]) state.runResults[runId] = {};
  state.currentRunId = runId;
  state.results = state.runResults[runId];
  saveState();
  updateRunSelectorUI();
  applyFilters();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  
  const currentRun = (state.runs || []).find(r => r.id === runId);
  showToast(`🏃 Đã chuyển sang: ${currentRun ? currentRun.name : runId}`, 'info');
}

function openNewRunModal() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền tạo Đợt test mới!', 'error');
    return;
  }
  const nextNum = (state.runs || []).length + 1;
  document.getElementById('new-run-name').value = `Đợt ${nextNum} — Retest bản vá v2.${nextNum - 1}`;
  document.getElementById('new-run-version').value = `v2.${nextNum - 1}.0`;
  document.getElementById('new-run-owner').value = state.currentUser ? state.currentUser.name : 'QA Lead';
  document.getElementById('new-run-scope').value = 'SMART_RETEST';
  document.getElementById('new-run-notes').value = '';
  handleRunScopeChange('SMART_RETEST');
  openModal('modal-run-create');
}

function handleRunScopeChange(scope) {
  const hint = document.getElementById('new-run-scope-hint');
  if (!hint) return;
  if (scope === 'SMART_RETEST') {
    hint.innerHTML = '💡 <strong>Smart Retest:</strong> Tự động lọc các ca Fail/Skip của đợt trước để đưa vào đợt mới. Các ca đã Pass được giữ nguyên trạng thái kế thừa (Inherited Pass), giúp tester chỉ tập trung vào các ca lỗi!';
  } else if (scope === 'SELECTIVE_P1') {
    hint.innerHTML = '💡 <strong>Selective Regression:</strong> Retest toàn bộ các ca lỗi + Toàn bộ các ca mức P1 (Critical) của toàn hệ thống để đảm bảo không bị lỗi dây chuyền.';
  } else {
    hint.innerHTML = '💡 <strong>Milestone Re-run:</strong> Đưa toàn bộ 100% test cases về trạng thái "Chưa chạy" để nghiệm thu toàn diện từ đầu. Kết quả các đợt trước vẫn được lưu nguyên vẹn.';
  }
}

function confirmCreateNewRun() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền tạo Đợt test mới!', 'error');
    return;
  }
  const name = document.getElementById('new-run-name').value.trim();
  const version = document.getElementById('new-run-version').value.trim();
  const owner = document.getElementById('new-run-owner').value.trim();
  const scope = document.getElementById('new-run-scope').value;
  const notes = document.getElementById('new-run-notes').value.trim();
  
  if (!name || !version) {
    showToast('⚠️ Vui lòng nhập Tên đợt kiểm thử và Phiên bản phần mềm!', 'error');
    return;
  }
  
  const parentRunId = state.currentRunId;
  const parentResults = state.runResults[parentRunId] || state.results || {};
  const newRunId = 'run_' + Date.now();
  const allTcs = getAllTcs();
  const newResults = {};
  
  let inheritedCount = 0;
  let retestCount = 0;
  
  allTcs.forEach(tc => {
    const prev = parentResults[tc.id];
    const prevStatus = prev ? prev.status : 'Not Run';
    
    if (scope === 'SMART_RETEST') {
      if (prevStatus === 'Pass' || prevStatus === 'Inherited Pass') {
        newResults[tc.id] = {
          status: 'Inherited Pass',
          tester: prev.tester || 'Inherited',
          runAt: prev.runAt,
          note: `[Kế thừa Pass từ ${state.runs.find(r=>r.id===parentRunId)?.name || 'Đợt trước'}]`
        };
        inheritedCount++;
      } else {
        newResults[tc.id] = {
          status: 'Not Run',
          tester: '',
          defectStatus: prev?.defectStatus || (prevStatus === 'Fail' ? 'Ready for Retest' : 'None'),
          severity: prev?.severity,
          assignedDev: prev?.assignedDev,
          failReason: prev?.failReason || '',
          note: prev?.failReason ? `Lỗi đợt trước: ${prev.failReason}` : ''
        };
        retestCount++;
      }
    } else if (scope === 'SELECTIVE_P1') {
      if ((prevStatus === 'Pass' || prevStatus === 'Inherited Pass') && tc.priority !== 'P1') {
        newResults[tc.id] = {
          status: 'Inherited Pass',
          tester: prev.tester || 'Inherited',
          runAt: prev.runAt
        };
        inheritedCount++;
      } else {
        newResults[tc.id] = { status: 'Not Run', tester: '', failReason: prev?.failReason || '' };
        retestCount++;
      }
    } else {
      newResults[tc.id] = { status: 'Not Run', tester: '' };
      retestCount++;
    }
  });
  
  const newRunObj = {
    id: newRunId,
    name,
    targetVersion: version,
    scopeType: scope,
    status: 'ACTIVE',
    parentRunId,
    createdBy: owner,
    notes,
    createdAt: new Date().toISOString()
  };
  
  if (!state.runs) state.runs = [];
  state.runs.push(newRunObj);
  if (!state.runResults) state.runResults = {};
  state.runResults[newRunId] = newResults;
  state.currentRunId = newRunId;
  state.results = newResults;
  
  saveState();
  closeModal('modal-run-create');
  updateRunSelectorUI();
  applyFilters();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  
  syncRunToSupabase(newRunObj);
  
  showToast(`🚀 Đã khởi tạo ${name}! Kế thừa ${inheritedCount} ca Pass, cần kiểm thử ${retestCount} ca.`, 'success');
}

async function syncRunToSupabase(run) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('test_runs').upsert({
      id: run.id,
      name: run.name,
      target_version: run.targetVersion,
      scope_type: run.scopeType,
      status: run.status,
      parent_run_id: run.parentRunId,
      created_by: run.createdBy,
      notes: run.notes
    });
  } catch(e) {
    console.error('Lỗi sync run to Supabase:', e);
  }
}

// ================================================================
// EVIDENCE UPLOAD & LIGHTBOX LOGIC
// ================================================================
let currentLightboxRotation = 0;
let currentLightboxSrc = '';

function openLightbox(src, caption) {
  const modal = document.getElementById('modal-lightbox');
  const img = document.getElementById('lightbox-img');
  if (!modal || !img) return;
  currentLightboxSrc = src;
  currentLightboxRotation = 0;
  img.src = src;
  img.style.transform = 'rotate(0deg)';
  modal.classList.add('open');
}

function closeLightbox() {
  const modal = document.getElementById('modal-lightbox');
  if (modal) modal.classList.remove('open');
}

function rotateLightboxImg() {
  currentLightboxRotation = (currentLightboxRotation + 90) % 360;
  const img = document.getElementById('lightbox-img');
  if (img) img.style.transform = `rotate(${currentLightboxRotation}deg)`;
}

function openLightboxOriginal() {
  if (currentLightboxSrc) window.open(currentLightboxSrc, '_blank');
}

function handleEvidenceUpload(tcId, files) {
  if (!files || !files.length) return;
  if (!state.results[tcId]) state.results[tcId] = { status: 'Not Run' };
  const r = state.results[tcId];
  if (!r.evidences) r.evidences = [];
  
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WebP)!', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = e => {
      compressImage(e.target.result, 1280, 0.82, (compressedDataUrl) => {
        const evidence = {
          id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          url: compressedDataUrl,
          uploadedBy: state.currentUser ? state.currentUser.name : 'Tester',
          createdAt: new Date().toISOString()
        };
        r.evidences.push(evidence);
        state.execActiveSubtab = 'evidence';
        saveState();
        renderExecDetail(tcId);
        syncSingleResultToSupabase(tcId);
        showToast(`📸 Đã đính kèm ảnh: ${file.name}`, 'success');
      });
    };
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl, maxDim, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL('image/webp', quality);
    callback(compressed);
  };
  img.src = dataUrl;
}

function removeEvidence(tcId, evId) {
  const r = state.results[tcId];
  if (!r || !r.evidences) return;
  r.evidences = r.evidences.filter(ev => ev.id !== evId);
  saveState();
  renderExecDetail(tcId);
  syncSingleResultToSupabase(tcId);
  showToast('🗑️ Đã xóa ảnh bằng chứng', 'info');
}

// Lắng nghe sự kiện paste ảnh từ Clipboard (Ctrl + V)
window.addEventListener('paste', e => {
  if (!document.getElementById('page-execute')?.classList.contains('active')) return;
  const tcId = state.selectedTcId;
  if (!tcId) return;
  
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (blob) {
        handleEvidenceUpload(tcId, [blob]);
        showToast('📋 Đã nhận ảnh chụp màn hình từ Clipboard (Ctrl+V)!', 'success');
        break;
      }
    }
  }
});

// ================================================================
// DISCUSSION COMMENTS & FEEDBACK LOGIC
// ================================================================
function addComment(tcId) {
  const input = document.getElementById(`comment-input-${tcId}`);
  if (!input) return;
  const content = input.value.trim();
  if (!content) return;
  
  if (!state.comments) state.comments = {};
  if (!state.comments[tcId]) state.comments[tcId] = [];
  
  const user = state.currentUser || { name: 'Tester', role: 'tester' };
  const comment = {
    id: 'cm_' + Date.now(),
    runId: state.currentRunId,
    tcId,
    author: user.name,
    role: user.role,
    content,
    createdAt: new Date().toISOString()
  };
  
  state.comments[tcId].push(comment);
  input.value = '';
  saveState();
  renderExecDetail(tcId);
  syncCommentToSupabase(comment);
  showToast('💬 Đã gửi bình luận phản hồi', 'success');
}

async function syncCommentToSupabase(comment) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('test_comments').insert({
      run_id: comment.runId,
      tc_id: comment.tcId,
      user_name: comment.author,
      user_role: comment.role,
      content: comment.content,
      created_at: comment.createdAt
    });
  } catch(e) {
    console.error('Lỗi sync comment to Supabase:', e);
  }
}

// ================================================================
// DEFECT LIFECYCLE WORKFLOW LOGIC
// ================================================================
function updateDefectStatus(tcId, newDefectStatus) {
  const userRole = state.currentUser ? state.currentUser.role : 'tester';
  if (userRole === 'developer' && (newDefectStatus === 'Retest Passed' || newDefectStatus === 'Retest Fail' || newDefectStatus === 'Reopened')) {
    showToast('⚠️ Quyền hạn: Chỉ Tester hoặc QA Lead mới có quyền nghiệm thu (Retest Pass / Reopen) để đóng hoặc mở lại lỗi!', 'error');
    return;
  }
  if (!state.results[tcId]) state.results[tcId] = { status: 'Fail' };
  state.results[tcId].defectStatus = newDefectStatus;
  
  const devEl = document.getElementById('ef-dev');
  if (devEl) state.results[tcId].assignedDev = devEl.value.trim();
  const sevEl = document.getElementById('ef-sev');
  if (sevEl) state.results[tcId].severity = sevEl.value;
  const fixEl = document.getElementById('ef-fixver');
  if (fixEl) state.results[tcId].fixVersion = fixEl.value.trim();
  
  if (newDefectStatus === 'Retest Passed') {
    state.results[tcId].status = 'Pass';
    showToast(`✅ [Retest Passed] Đóng lỗi ${tcId}! Chuyển trạng thái sang PASS.`, 'success');
  } else if (newDefectStatus === 'Reopened') {
    state.results[tcId].status = 'Fail';
    showToast(`🔄 [Reopened] Mở lại lỗi ${tcId}! Đã chuyển lại cho Developer.`, 'error');
  } else {
    showToast(`⚡ Cập nhật vòng đời lỗi ${tcId}: ${newDefectStatus}`, 'info');
  }
  
  saveState();
  renderExecDetail(tcId);
  filterExecList();
  syncSingleResultToSupabase(tcId);
}

// ================================================================
// INTERACTIVE SCREEN SNIP / REGION CROP ENGINE
// ================================================================
let activeSnipTcId = null;
let activeSnipStream = null;
let fullSnipImage = null; // Canvas storing captured frame
let snipStartX = 0, snipStartY = 0;
let snipCurrentX = 0, snipCurrentY = 0;
let isSnipDragging = false;

async function startScreenSnip(tcId) {
  activeSnipTcId = tcId;
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    showToast('⚠️ Trình duyệt chưa hỗ trợ Screen Capture API. Bạn có thể nhấn Windows + Shift + S rồi bấm Ctrl + V để dán ảnh!', 'error');
    return;
  }
  
  try {
    showToast('⏳ Vui lòng chọn Màn hình hoặc Cửa sổ cần chụp trong hộp thoại...', 'info');
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always', displaySurface: 'monitor' },
      audio: false
    });
    activeSnipStream = stream;
    
    // Create temporary video element to grab frame
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        setTimeout(resolve, 300); // 300ms delay to ensure video paints
      };
    });
    
    // Create offscreen canvas for full frame
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = video.videoWidth || window.innerWidth;
    offscreenCanvas.height = video.videoHeight || window.innerHeight;
    const offCtx = offscreenCanvas.getContext('2d');
    offCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    fullSnipImage = offscreenCanvas;
    
    // Stop stream immediately
    stream.getTracks().forEach(t => t.stop());
    activeSnipStream = null;
    
    // Launch Snipping Overlay
    openSnipOverlay();
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      showToast('ℹ️ Bạn đã hủy thao tác chụp màn hình.', 'info');
    } else {
      console.error('Lỗi chụp màn hình:', err);
      showToast(`❌ Không thể chụp màn hình: ${err.message}`, 'error');
    }
    cancelScreenSnip();
  }
}

function openSnipOverlay() {
  const overlay = document.getElementById('screen-snip-overlay');
  const canvas = document.getElementById('snip-canvas');
  if (!overlay || !canvas || !fullSnipImage) return;
  
  overlay.classList.add('active');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  drawSnipCanvasState(null);
  
  // Attach event listeners
  canvas.onmousedown = handleSnipMouseDown;
  window.onmousemove = handleSnipMouseMove;
  window.onmouseup = handleSnipMouseUp;
  window.addEventListener('keydown', handleSnipKeyDown);
}

function handleSnipKeyDown(e) {
  if (e.key === 'Escape') {
    cancelScreenSnip();
  }
}

function handleSnipMouseDown(e) {
  isSnipDragging = true;
  snipStartX = e.clientX;
  snipStartY = e.clientY;
  snipCurrentX = e.clientX;
  snipCurrentY = e.clientY;
}

function handleSnipMouseMove(e) {
  if (!isSnipDragging) return;
  snipCurrentX = e.clientX;
  snipCurrentY = e.clientY;
  
  const rect = getSnipRect();
  drawSnipCanvasState(rect);
}

function getSnipRect() {
  const x = Math.min(snipStartX, snipCurrentX);
  const y = Math.min(snipStartY, snipCurrentY);
  const w = Math.abs(snipCurrentX - snipStartX);
  const h = Math.abs(snipCurrentY - snipStartY);
  return { x, y, w, h };
}

function drawSnipCanvasState(rect) {
  const canvas = document.getElementById('snip-canvas');
  if (!canvas || !fullSnipImage) return;
  const ctx = canvas.getContext('2d');
  
  // 1. Draw full background image scaled to window
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fullSnipImage, 0, 0, canvas.width, canvas.height);
  
  // 2. Dim background with dark mask
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 3. If dragging selection rect, clear the crop area and draw border
  if (rect && rect.w > 2 && rect.h > 2) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.drawImage(fullSnipImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Draw cyan dashed selection border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    
    // Draw dimensions label badge
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    const text = `${Math.round(rect.w)} × ${Math.round(rect.h)} px`;
    ctx.font = '12px Inter, sans-serif';
    const textW = ctx.measureText(text).width;
    const badgeX = rect.x;
    const badgeY = rect.y > 26 ? rect.y - 24 : rect.y + rect.h + 6;
    ctx.fillRect(badgeX, badgeY, textW + 12, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(text, badgeX + 6, badgeY + 14);
  }
}

function handleSnipMouseUp(e) {
  if (!isSnipDragging) return;
  isSnipDragging = false;
  
  const rect = getSnipRect();
  if (rect.w > 15 && rect.h > 15) {
    finalizeCrop(rect);
  }
}

function finalizeCrop(rect) {
  if (!fullSnipImage || !activeSnipTcId) {
    cancelScreenSnip();
    return;
  }
  
  const canvas = document.getElementById('snip-canvas');
  const scaleX = fullSnipImage.width / canvas.width;
  const scaleY = fullSnipImage.height / canvas.height;
  
  const origX = Math.round(rect.x * scaleX);
  const origY = Math.round(rect.y * scaleY);
  const origW = Math.round(rect.w * scaleX);
  const origH = Math.round(rect.h * scaleY);
  
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = origW;
  cropCanvas.height = origH;
  const cropCtx = cropCanvas.getContext('2d');
  
  cropCtx.drawImage(
    fullSnipImage,
    origX, origY, origW, origH,
    0, 0, origW, origH
  );
  
  const croppedDataUrl = cropCanvas.toDataURL('image/webp', 0.88);
  const tcId = activeSnipTcId;
  
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const fileName = `snip_${timeStr}_${Math.round(origW)}x${Math.round(origH)}.webp`;
  
  if (!state.results[tcId]) state.results[tcId] = { status: 'Not Run' };
  if (!state.results[tcId].evidences) state.results[tcId].evidences = [];
  
  state.results[tcId].evidences.push({
    id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: fileName,
    url: croppedDataUrl,
    uploadedBy: state.currentUser ? state.currentUser.name : 'Tester',
    createdAt: now.toISOString()
  });
  
  state.execActiveSubtab = 'evidence';
  saveState();
  cancelScreenSnip();
  renderExecDetail(tcId);
  syncSingleResultToSupabase(tcId);
  showToast(`✂️ Đã chụp và đính kèm vùng màn hình (${Math.round(origW)} × ${Math.round(origH)} px)!`, 'success');
}

function cancelScreenSnip() {
  const overlay = document.getElementById('screen-snip-overlay');
  if (overlay) overlay.classList.remove('active');
  
  if (activeSnipStream) {
    activeSnipStream.getTracks().forEach(t => t.stop());
    activeSnipStream = null;
  }
  
  fullSnipImage = null;
  activeSnipTcId = null;
  isSnipDragging = false;
  
  window.removeEventListener('keydown', handleSnipKeyDown);
  window.onmousemove = null;
  window.onmouseup = null;
}

async function captureFullScreen(tcId) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    showToast('⚠️ Trình duyệt chưa hỗ trợ Screen Capture API. Bạn có thể nhấn Windows + Shift + S rồi bấm Ctrl + V để dán ảnh!', 'error');
    return;
  }
  
  try {
    showToast('⏳ Vui lòng chọn Màn hình/Cửa sổ cần chụp...', 'info');
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: false
    });
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        setTimeout(resolve, 300);
      };
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    stream.getTracks().forEach(t => t.stop());
    
    const fullDataUrl = canvas.toDataURL('image/webp', 0.85);
    const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const fileName = `fullscreen_${timeStr}.webp`;
    
    if (!state.results[tcId]) state.results[tcId] = { status: 'Not Run' };
    if (!state.results[tcId].evidences) state.results[tcId].evidences = [];
    
    state.results[tcId].evidences.push({
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: fileName,
      url: fullDataUrl,
      uploadedBy: state.currentUser ? state.currentUser.name : 'Tester',
      createdAt: new Date().toISOString()
    });
    
    state.execActiveSubtab = 'evidence';
    saveState();
    renderExecDetail(tcId);
    syncSingleResultToSupabase(tcId);
    showToast('🖥️ Đã chụp toàn bộ màn hình/cửa sổ thành công!', 'success');
  } catch (err) {
    if (err.name !== 'NotAllowedError') {
      console.error('Lỗi chụp toàn màn hình:', err);
      showToast(`❌ Không thể chụp: ${err.message}`, 'error');
    }
  }
}


// ================================================================
// CATALOG IMPORT / EXPORT LOGIC (CHUẨN ISO 29119-3 & ISO 9001)
// Tách biệt hoàn toàn Dữ liệu Kịch bản (Testware) khỏi Mã nguồn
// ================================================================
let pendingImportData = null;

function triggerImportCatalog() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền nhập tệp kịch bản kiểm thử!', 'error');
    return;
  }
  const fileInput = document.getElementById('catalog-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

function handleCatalogFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  
  if (!file.name.toLowerCase().endsWith('.json')) {
    showToast('⚠️ Vui lòng chọn tệp định dạng .json!', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      processImportedCatalog(data, file.name);
    } catch(err) {
      showToast('❌ Lỗi cú pháp JSON trong tệp: ' + err.message, 'error');
    }
  };
  reader.readAsText(file, 'utf-8');
}

function processImportedCatalog(data, fileName) {
  // Support both schema formats: { testCases: [...] } or { tcs: [...] } or direct array [...]
  const tcs = Array.isArray(data) ? data : (data.testCases || data.tcs || []);
  const modules = Array.isArray(data.modules) ? data.modules : [];
  
  if (!Array.isArray(tcs) || tcs.length === 0) {
    showToast('⚠️ Tệp JSON không chứa danh sách kịch bản kiểm thử hợp lệ (không tìm thấy mảng testCases hoặc tcs)!', 'error');
    return;
  }
  
  // Validate schema of first item
  const sample = tcs[0];
  if (!sample.id || !sample.name || !sample.module) {
    showToast('⚠️ Cấu trúc Test Case không chuẩn: Cần có tối thiểu các trường id, name, module!', 'error');
    return;
  }
  
  pendingImportData = {
    fileName,
    version: data.version || 'Tùy chỉnh',
    modules,
    tcs,
    compliance: data.standardCompliance || ['ISO/IEC/IEEE 29119-3:2021']
  };
  
  // Update Preview Modal UI
  const nameEl = document.getElementById('import-file-name');
  if (nameEl) nameEl.textContent = fileName;
  const tcEl = document.getElementById('import-tc-count');
  if (tcEl) tcEl.textContent = tcs.length;
  const modEl = document.getElementById('import-mod-count');
  if (modEl) modEl.textContent = modules.length || 'Tự động trích xuất';
  const verEl = document.getElementById('import-version');
  if (verEl) verEl.textContent = pendingImportData.version;
  
  // Count priorities
  const p1 = tcs.filter(t => t.priority === 'P1').length;
  const p2 = tcs.filter(t => t.priority === 'P2').length;
  const p3 = tcs.filter(t => t.priority === 'P3').length;
  const p4 = tcs.filter(t => t.priority === 'P4').length;
  const priEl = document.getElementById('import-priority-breakdown');
  if (priEl) priEl.textContent = `P1 (Critical): ${p1} · P2: ${p2} · P3: ${p3} · P4: ${p4}`;
  
  openModal('modal-import-preview');
}

function confirmImportCatalog() {
  if (!pendingImportData) return;
  const mode = document.querySelector('input[name="import-mode"]:checked')?.value || 'merge';
  
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền nhập kịch bản!', 'error');
    return;
  }
  
  if (pendingImportData.modules && pendingImportData.modules.length > 0) {
    state.modules = JSON.parse(JSON.stringify(pendingImportData.modules));
    populateModuleSelects();
  }
  
  if (mode === 'replace') {
    ALL_TCS = JSON.parse(JSON.stringify(pendingImportData.tcs));
    state.customTcs = [];
    state.overrides = {};
    showToast(`✅ Đã thay thế sạch: Nạp ${ALL_TCS.length} kịch bản từ tệp "${pendingImportData.fileName}"`, 'success');
  } else {
    // Merge: update ALL_TCS or append new ones
    const existingMap = new Map(ALL_TCS.map(t => [t.id, t]));
    let updatedCount = 0;
    let addedCount = 0;
    pendingImportData.tcs.forEach(newTc => {
      if (existingMap.has(newTc.id)) {
        Object.assign(existingMap.get(newTc.id), newTc);
        updatedCount++;
      } else {
        ALL_TCS.push(newTc);
        existingMap.set(newTc.id, newTc);
        addedCount++;
      }
    });
    showToast(`✅ Hợp nhất kịch bản thành công: Cập nhật ${updatedCount} ca · Thêm mới ${addedCount} ca!`, 'success');
  }
  
  closeModal('modal-import-preview');
  saveState();
  applyFilters();
  if (document.getElementById('page-dashboard')?.classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases')?.classList.contains('active')) renderTestCases();
  if (document.getElementById('page-execute')?.classList.contains('active')) filterExecList();
  if (document.getElementById('page-report')?.classList.contains('active')) renderReport();
  if (document.getElementById('page-settings')?.classList.contains('active')) renderSettings();
  
  // Lưu vào localStorage để duy trì sau khi tải lại trang
  localStorage.setItem('smartvms_imported_catalog', JSON.stringify({
    version: pendingImportData.version,
    updatedAt: new Date().toISOString(),
    modules: state.modules,
    testCases: ALL_TCS
  }));
}

function exportCatalogJson() {
  const allTcs = getAllTcs();
  const catalog = {
    schema: 'https://smartvms.local/schemas/test-catalog-v4.json',
    title: 'SmartVMS Local SingleSite 2026 — Danh mục Kịch bản Kiểm thử Chuẩn hóa',
    standardCompliance: [
      'ISO 9001:2015 Clause 7.5 (Documented Information) & 8.5.2 (Traceability)',
      'ISO/IEC/IEEE 29119-3:2021 (Test Documentation)',
      'ISO/IEC 25010:2023 (Systems and Software Quality)'
    ],
    version: '3.4.0',
    exportedAt: new Date().toISOString(),
    exportedBy: state.currentUser ? state.currentUser.name : 'QA Team',
    totalTestCases: allTcs.length,
    totalModules: getModules().length,
    modules: getModules(),
    testCases: allTcs
  };
  
  const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smartvms_test_catalog_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`📤 Đã xuất thành công tệp danh mục: ${a.download}`, 'success');
}

function resetToFactoryCatalog() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead (Admin) mới có quyền khôi phục tệp catalog gốc!', 'error');
    return;
  }
  if (!confirm('⚠️ Bạn có chắc chắn muốn khôi phục danh mục kịch bản về nguyên bản tệp data/smartvms_test_catalog.json (204 ca chuẩn gốc)?')) return;
  
  localStorage.removeItem('smartvms_imported_catalog');
  const cat = (typeof window !== 'undefined' && window.SMARTVMS_DEFAULT_CATALOG) || { modules: [], testCases: [] };
  ALL_TCS = JSON.parse(JSON.stringify(cat.testCases || []));
  state.modules = JSON.parse(JSON.stringify(cat.modules || []));
  state.overrides = {};
  state.customTcs = [];
  saveState();
  populateModuleSelects();
  applyFilters();
  if (document.getElementById('page-dashboard')?.classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases')?.classList.contains('active')) renderTestCases();
  if (document.getElementById('page-settings')?.classList.contains('active')) renderSettings();
  showToast('🔄 Đã khôi phục thành công danh mục kịch bản từ tệp chuẩn gốc!', 'success');
}

// Drag & drop listener
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('catalog-drop-zone');
  if (!dropZone) return;
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = 'var(--accent-light)';
      dropZone.style.background = 'rgba(59, 130, 246, 0.08)';
    });
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = 'var(--border-color)';
      dropZone.style.background = 'rgba(59, 130, 246, 0.03)';
    });
  });
  
  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      handleCatalogFileSelect({ target: { files } });
    }
  });
});


// ================================================================
// ENTERPRISE MULTI-PROJECT & MULTI-VERSION ARCHITECTURE (ISO 29119-2)
// Quản lý Danh mục Dự án Phần mềm Doanh nghiệp & Chuẩn SQuaRE ISO 25010
// ================================================================
const ENTERPRISE_MANIFEST = (typeof window !== 'undefined' && window.OPENQAS_ENTERPRISE_MANIFEST) || {
  activeProjectId: 'PRJ-SMARTVMS',
  projects: []
};

function initEnterpriseProjects() {
  const savedProjects = localStorage.getItem('openqas_projects_list');
  if (savedProjects) {
    try {
      state.projects = JSON.parse(savedProjects);
    } catch(e) {}
  }
  
  // Default to empty array for manual import / creation if no stored projects
  if (!state.projects) {
    state.projects = [];
  }
  
  if (false && (!state.projects || state.projects.length === 0)) {
    // Khởi tạo 3 dự án tiêu biểu mặc định
    const vmsCatalog = (typeof window !== 'undefined' && window.SMARTVMS_DEFAULT_CATALOG) || { modules: [], testCases: [] };
    const parkCatalog = (ENTERPRISE_MANIFEST.catalogs && ENTERPRISE_MANIFEST.catalogs['PRJ-SMARTPARK']) || { modules: [], testCases: [] };
    const accessCatalog = (ENTERPRISE_MANIFEST.catalogs && ENTERPRISE_MANIFEST.catalogs['PRJ-SMARTACCESS']) || { modules: [], testCases: [] };

    state.projects = [
      {
        id: 'PRJ-SMARTVMS',
        code: 'SMARTVMS',
        name: 'SmartVMS — Quản lý Khách & Ra vào',
        domain: 'An ninh Trụ sở & Cơ quan Hành chính',
        lead: 'Nguyễn Văn Huy (Project Manager)',
        standards: ['ISO 9001:2015', 'ISO/IEC/IEEE 29119', 'ISO/IEC 25010:2023'],
        activeVersion: 'v2.0',
        versions: [
          { version: 'v2.0', label: 'v2.0-SingleSite 2026', status: 'IN_QA', targetDate: '2026-10-30', changelog: 'Phiên bản Offline Standalone cho trụ sở đơn lẻ (204 TCs, 12 Modules)' },
          { version: 'v2.1', label: 'v2.1-MultiSite Cloud Sync', status: 'IN_DEV', targetDate: '2026-12-15', changelog: 'Đồng bộ tập trung đa trạm gác qua Cloud API' },
          { version: 'v1.5', label: 'v1.5-Legacy Standalone', status: 'RELEASED', targetDate: '2025-11-20', changelog: 'Phiên bản bàn giao đợt 1' }
        ],
        modules: vmsCatalog.modules || [],
        testCases: vmsCatalog.testCases || [],
        runs: [
          { id: 'run_001', name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện', targetVersion: 'v2.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'QA Lead', createdAt: '2026-10-06T00:00:00.000Z' }
        ],
        runResults: {}
      },
      {
        id: 'PRJ-SMARTPARK',
        code: 'SMARTPARK',
        name: 'SmartParking — Quản lý Bãi xe & Nhận diện Biển số ANPR',
        domain: 'Giao thông Thông minh (ITS & Smart Parking)',
        lead: 'Trần Quốc Tuấn (Technical Lead)',
        standards: ['ISO 9001:2015', 'TCVN 13607:2023', 'ISO/IEC 25010'],
        activeVersion: 'v1.2.0',
        versions: [
          { version: 'v1.2.0', label: 'v1.2.0-ANPR AutoBarrier', status: 'IN_QA', targetDate: '2026-11-10', changelog: 'Tích hợp nhận diện biển số tự động LPR và barie tốc độ cao' },
          { version: 'v1.0.0', label: 'v1.0.0-Base RFID', status: 'RELEASED', targetDate: '2026-03-15', changelog: 'Phiên bản quẹt thẻ RFID thông thường' }
        ],
        modules: parkCatalog.modules || [],
        testCases: parkCatalog.testCases || [],
        runs: [
          { id: 'run_park_01', name: 'Đợt 1 — Thử nghiệm Làn vào & Barie', targetVersion: 'v1.2.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'Trần Quốc Tuấn', createdAt: '2026-10-10T00:00:00.000Z' }
        ],
        runResults: {}
      },
      {
        id: 'PRJ-SMARTACCESS',
        code: 'SMARTACCESS',
        name: 'SmartAccess — Kiểm soát Cửa Phân tầng & Thang máy',
        domain: 'Tự động hóa Tòa nhà (BMS & Access Control)',
        lead: 'Lê Hoàng Minh (Lead QA)',
        standards: ['ISO 9001:2015', 'ISO/IEC 25010'],
        activeVersion: 'v1.0.0',
        versions: [
          { version: 'v1.0.0', label: 'v1.0.0-Access & Elevator', status: 'IN_QA', targetDate: '2026-11-25', changelog: 'Tích hợp FaceID và điều khiển phân tầng thang máy' }
        ],
        modules: accessCatalog.modules || [],
        testCases: accessCatalog.testCases || [],
        runs: [
          { id: 'run_acc_01', name: 'Đợt 1 — Kiểm tra Nhận diện FaceID & PCCC', targetVersion: 'v1.0.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'Lê Hoàng Minh', createdAt: '2026-10-12T00:00:00.000Z' }
        ],
        runResults: {}
      }
    ];
    saveEnterpriseProjects();
  }

  // Khôi phục dự án hiện hành
  const savedActiveProj = localStorage.getItem('openqas_active_project_id');
  if (savedActiveProj && state.projects.some(p => p.id === savedActiveProj)) {
    state.currentProjectId = savedActiveProj;
  } else {
    state.currentProjectId = 'PRJ-SMARTVMS';
  }

  // Luôn đảm bảo nạp đầy đủ danh mục kịch bản từ tệp CSDL chuẩn vào từng dự án nếu đang rỗng
  const vmsCatalogData = (typeof window !== 'undefined' && window.SMARTVMS_DEFAULT_CATALOG) || { modules: [], testCases: [] };
  (state.projects || []).forEach(p => {
    if (p.id === 'PRJ-SMARTVMS') {
      if (!p.testCases || p.testCases.length === 0) {
        p.modules = vmsCatalogData.modules || [];
        p.testCases = vmsCatalogData.testCases || [];
      }
    } else if (typeof ENTERPRISE_MANIFEST !== 'undefined' && ENTERPRISE_MANIFEST.catalogs && ENTERPRISE_MANIFEST.catalogs[p.id]) {
      const cat = ENTERPRISE_MANIFEST.catalogs[p.id];
      if (!p.testCases || p.testCases.length === 0) {
        p.modules = cat.modules || [];
        p.testCases = cat.testCases || [];
      }
    }
  });
  saveEnterpriseProjects();

  syncActiveProjectContext();
}

function saveEnterpriseProjects() {
  localStorage.setItem('openqas_projects_list', JSON.stringify(state.projects));
  localStorage.setItem('openqas_active_project_id', state.currentProjectId);
}

function getActiveProject() {
  if (!state.projects || state.projects.length === 0) return null;
  return state.projects.find(p => p.id === state.currentProjectId) || state.projects[0] || null;
}

function syncActiveProjectContext() {
  const p = getActiveProject();
  if (!p) {
    state.currentProjectId = null;
    state.currentProjectVersion = '';
    state.modules = [];
    ALL_TCS = [];
    state.runs = [];
    state.runResults = {};
    state.results = {};
    populateProjectSelectors();
    populateModuleSelects();
    updateRunSelectorUI();
    return;
  }

  state.currentProjectVersion = p.activeVersion || (p.versions[0] ? p.versions[0].version : 'v1.0');
  state.modules = p.modules || [];
  ALL_TCS = p.testCases || [];
  state.runs = p.runs || [
    { id: 'run_001', name: 'Đợt 1 — Khảo sát Kiểm thử', targetVersion: state.currentProjectVersion, scopeType: 'ALL', status: 'ACTIVE', createdBy: 'QA Lead', createdAt: new Date().toISOString() }
  ];
  state.runResults = p.runResults || {};
  state.currentRunId = state.runs[0] ? state.runs[0].id : 'run_001';
  if (!state.runResults[state.currentRunId]) state.runResults[state.currentRunId] = {};
  state.results = state.runResults[state.currentRunId];

  populateProjectSelectors();
  populateModuleSelects();
  updateRunSelectorUI();
}

function populateProjectSelectors() {
  const projSel = document.getElementById('header-project-select');
  const topbarProjSel = document.getElementById('topbar-project-select');
  const opts = (!state.projects || state.projects.length === 0) 
    ? '<option value="">(Chưa có dự án)</option>' 
    : state.projects.map(p =>
        `<option value="${p.id}" ${p.id === state.currentProjectId ? 'selected' : ''}>${p.name}</option>`
      ).join('');

  if (projSel) projSel.innerHTML = opts;
  if (topbarProjSel) topbarProjSel.innerHTML = opts;

  const verSel = document.getElementById('header-version-select');
  const p = getActiveProject();
  if (verSel && p) {
    verSel.innerHTML = (p.versions || []).map(v =>
      `<option value="${v.version}" ${v.version === state.currentProjectVersion ? 'selected' : ''}>${v.label || v.version} (${v.status})</option>`
    ).join('');
  }
}

function switchProject(projectId) {
  if (!state.projects.some(p => p.id === projectId)) return;
  state.currentProjectId = projectId;
  syncActiveProjectContext();
  saveEnterpriseProjects();
  saveState();

  const p = getActiveProject();
  showToast(`👉 Đã chuyển sang dự án: ${p.name}`, 'info');

  applyFilters();
  if (document.getElementById('page-dashboard')?.classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases')?.classList.contains('active')) renderTestCases();
  if (document.getElementById('page-execute')?.classList.contains('active')) filterExecList();
  if (document.getElementById('page-report')?.classList.contains('active')) renderReport();
  if (document.getElementById('page-projects')?.classList.contains('active')) renderProjectsPage();
  if (document.getElementById('page-evaluation')?.classList.contains('active')) renderEvaluationPage();
}

function switchProjectVersion(version) {
  const p = getActiveProject();
  if (!p) return;
  p.activeVersion = version;
  state.currentProjectVersion = version;
  saveEnterpriseProjects();
  populateProjectSelectors();
  showToast(`📦 Đã chuyển sang bản: ${version}`, 'info');

  if (document.getElementById('page-dashboard')?.classList.contains('active')) renderDashboard();
  if (document.getElementById('page-projects')?.classList.contains('active')) renderProjectsPage();
  if (document.getElementById('page-evaluation')?.classList.contains('active')) renderEvaluationPage();
}

function renderProjectsPage() {
  const grid = document.getElementById('projects-card-grid');
  if (!grid) return;

  if (!state.projects || state.projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state card" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; border: 2px dashed var(--border);">
        <div style="font-size: 48px; margin-bottom: 12px;">🏢</div>
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Chưa có Dự án nào trong Hệ thống</h3>
        <p style="color: var(--text-muted); font-size: 14px; max-width: 520px; margin: 0 auto 20px; line-height:1.6">
          Hệ thống đang ở trạng thái Trắng (Fresh Clean State). Bạn có thể bấm tạo dự án mới hoặc nhập file danh mục kịch bản kiểm thử (JSON/Excel).
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="openCreateProjectModal()">➕ Thêm Dự án Mới</button>
          <button class="btn btn-outline" onclick="openImportModal()">📥 Nhập Kịch Bản (JSON / Excel)</button>
          <button class="btn btn-outline" onclick="loadSampleDemoProjects()" style="border-color:var(--accent); color:var(--accent)">⚡ Nạp Mẫu SmartVMS (204 TCs Demo)</button>
        </div>
      </div>
    `;
    const tbody = document.getElementById('project-versions-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted)">Chưa có dữ liệu dự án</td></tr>';
    return;
  }

  grid.innerHTML = state.projects.map(p => {
    const isCurrent = p.id === state.currentProjectId;
    const tcCount = (p.testCases || []).length;
    const modCount = (p.modules || []).length;
    const verCount = (p.versions || []).length;
    
    // Calculate pass rate
    const pResults = (p.runResults && p.runs && p.runs[0] && p.runResults[p.runs[0].id]) || {};
    let passed = 0;
    Object.values(pResults).forEach(r => { if (r.status === 'Pass') passed++; });
    const pct = tcCount > 0 ? Math.round((passed / tcCount) * 100) : 0;

    return `
      <div class="card" style="border: 2px solid ${isCurrent ? 'var(--accent-light)' : 'var(--border-color)'}; box-shadow: ${isCurrent ? '0 8px 24px rgba(37,99,235,0.15)' : 'none'}; position:relative; overflow:hidden">
        ${isCurrent ? '<div style="position:absolute; top:0; right:0; background:var(--accent); color:white; font-size:10px; font-weight:700; padding:3px 12px; border-bottom-left-radius:8px">ĐANG CHỌN</div>' : ''}
        <div style="font-size:12px; font-weight:700; color:var(--accent-light); margin-bottom:4px">${p.code}</div>
        <h3 style="font-size:17px; font-weight:700; margin-bottom:6px">${p.name}</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px; min-height:36px">${p.domain}</p>
        
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; background:rgba(0,0,0,0.03); border-radius:8px; padding:10px; margin-bottom:14px; text-align:center">
          <div><div style="font-weight:700; font-size:15px">${tcCount}</div><div style="font-size:11px; color:var(--text-muted)">Kịch bản</div></div>
          <div><div style="font-weight:700; font-size:15px">${modCount}</div><div style="font-size:11px; color:var(--text-muted)">Phân hệ</div></div>
          <div><div style="font-weight:700; font-size:15px">${verCount}</div><div style="font-size:11px; color:var(--text-muted)">Phiên bản</div></div>
        </div>

        <div style="margin-bottom:14px">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px">
            <span>Tiến độ kiểm thử (${p.activeVersion}):</span>
            <strong>${pct}%</strong>
          </div>
          <div class="progress-bar-wrapper" style="height:6px"><div class="progress-bar" style="width:${pct}%; background:${pct >= 80 ? '#10b981' : '#3b82f6'}"></div></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; pt-10">
          <div style="font-size:11px; color:var(--text-muted)">PM: ${p.lead.split('(')[0]}</div>
          ${isCurrent ? 
            '<button class="btn btn-sm btn-outline" disabled style="color:#10b981; border-color:#10b981">✓ Dự án hiện tại</button>' : 
            `<button class="btn btn-sm btn-primary" onclick="switchProject('${p.id}')">👉 Chọn Dự Án Này</button>`
          }
        </div>
      </div>
    `;
  }).join('');

  // Render versions table
  const p = getActiveProject();
  if (p) {
    const titleEl = document.getElementById('active-proj-versions-title');
    if (titleEl) titleEl.textContent = `📦 Quản lý Phiên bản Phần mềm: ${p.name}`;
    const descEl = document.getElementById('active-proj-standards-desc');
    if (descEl) descEl.textContent = `Lĩnh vực: ${p.domain} · Tiêu chuẩn: ${(p.standards || []).join(' · ')}`;

    const tbody = document.getElementById('project-versions-table-body');
    if (tbody) {
      tbody.innerHTML = (p.versions || []).map(v => {
        const isVerActive = v.version === state.currentProjectVersion;
        return `
          <tr style="${isVerActive ? 'background:rgba(59,130,246,0.05); font-weight:600' : ''}">
            <td><code style="font-size:13px">${v.version}</code></td>
            <td>${v.label || v.version}</td>
            <td><span class="badge ${v.status === 'RELEASED' ? 'badge-pass' : v.status === 'IN_QA' ? 'badge-p1' : 'badge-nr'}">${v.status}</span></td>
            <td>${v.targetDate || 'Chưa định'}</td>
            <td style="font-size:13px; color:var(--text-muted)">${v.changelog || 'Không có ghi chú'}</td>
            <td>
              ${isVerActive ? 
                '<span style="color:#10b981; font-size:12px">● Đang kiểm thử</span>' : 
                `<button class="btn btn-sm btn-outline" onclick="switchProjectVersion('${v.version}')">Kích hoạt</button>`
              }
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function openCreateProjectModal() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead / Admin mới có quyền tạo Dự Án mới!', 'error');
    return;
  }
  document.getElementById('new-proj-code').value = '';
  document.getElementById('new-proj-name').value = '';
  document.getElementById('new-proj-domain').value = '';
  document.getElementById('new-proj-lead').value = state.currentUser ? state.currentUser.name : 'QA Lead';
  document.getElementById('new-proj-init-ver').value = 'v1.0.0';
  openModal('modal-project-create');
}

function confirmCreateProject() {
  const code = document.getElementById('new-proj-code').value.trim().toUpperCase();
  const name = document.getElementById('new-proj-name').value.trim();
  const domain = document.getElementById('new-proj-domain').value.trim() || 'Hệ thống Phần mềm Ứng dụng';
  const lead = document.getElementById('new-proj-lead').value.trim() || 'QA Lead';
  const initVer = document.getElementById('new-proj-init-ver').value.trim() || 'v1.0.0';
  const standards = document.getElementById('new-proj-standards').value.split(',').map(s => s.trim());

  if (!code || !name) {
    showToast('⚠️ Vui lòng nhập đầy đủ Mã Dự án và Tên Dự án!', 'error');
    return;
  }

  const projId = 'PRJ-' + code;
  if (state.projects.some(p => p.id === projId)) {
    showToast('⚠️ Mã Dự án đã tồn tại trong danh mục!', 'error');
    return;
  }

  const newProject = {
    id: projId,
    code,
    name,
    domain,
    lead,
    standards,
    activeVersion: initVer,
    versions: [
      { version: initVer, label: `${initVer} — Khởi tạo Dự án`, status: 'IN_QA', targetDate: new Date(Date.now() + 30*86400000).toISOString().slice(0,10), changelog: 'Phiên bản đầu tiên được tạo lập trên hệ thống OpenQAS' }
    ],
    modules: [
      { id: code.slice(0,2) + '01', name: 'Phân hệ Nghiệp vụ Cốt lõi', short: 'Cốt lõi' }
    ],
    testCases: [
      {
        id: `TC-${code.slice(0,4)}-001`,
        module: code.slice(0,2) + '01',
        priority: 'P1',
        name: `Kiểm tra khởi động và xác thực hệ thống ${name}`,
        platform: 'Nền tảng ứng dụng',
        testData: 'Tài khoản quản trị viên',
        precondition: 'Dịch vụ hệ thống đang kích hoạt',
        steps: ['1. Truy cập vào ứng dụng.', '2. Đăng nhập hệ thống.'],
        expected: ['Đăng nhập thành công, tải màn hình chính.']
      }
    ],
    runs: [
      { id: 'run_init_' + Date.now(), name: 'Đợt 1 — Kiểm thử Khởi tạo', targetVersion: initVer, scopeType: 'ALL', status: 'ACTIVE', createdBy: lead, createdAt: new Date().toISOString() }
    ],
    runResults: {}
  };

  state.projects.push(newProject);
  saveEnterpriseProjects();
  closeModal('modal-project-create');
  switchProject(projId);
  showToast(`✅ Đã thêm dự án mới: ${name}!`, 'success');
}

function openCreateVersionModal() {
  if (state.currentUser && state.currentUser.role !== 'admin') {
    showToast('⚠️ Quyền hạn bị từ chối: Chỉ QA Lead / Admin mới có quyền thêm phiên bản phần mềm!', 'error');
    return;
  }
  document.getElementById('new-ver-tag').value = '';
  document.getElementById('new-ver-label').value = '';
  document.getElementById('new-ver-date').value = new Date(Date.now() + 15*86400000).toISOString().slice(0,10);
  document.getElementById('new-ver-changelog').value = '';
  openModal('modal-version-create');
}

function confirmCreateVersion() {
  const tag = document.getElementById('new-ver-tag').value.trim();
  const label = document.getElementById('new-ver-label').value.trim() || tag;
  const status = document.getElementById('new-ver-status').value;
  const date = document.getElementById('new-ver-date').value;
  const changelog = document.getElementById('new-ver-changelog').value.trim();

  if (!tag) {
    showToast('⚠️ Vui lòng nhập Mã phiên bản (Tag)!', 'error');
    return;
  }

  const p = getActiveProject();
  if (!p) return;
  if (!p.versions) p.versions = [];

  if (p.versions.some(v => v.version === tag)) {
    showToast(`⚠️ Phiên bản "${tag}" đã tồn tại trong dự án này!`, 'error');
    return;
  }

  p.versions.push({
    version: tag,
    label,
    status,
    targetDate: date,
    changelog
  });

  saveEnterpriseProjects();
  closeModal('modal-version-create');
  switchProjectVersion(tag);
  showToast(`✅ Đã thêm bản: ${label}`, 'success');
}

function renderEvaluationPage() {
  const p = getActiveProject();
  if (!p) return;

  const badgeEl = document.getElementById('eval-proj-badge');
  if (badgeEl) badgeEl.textContent = `Dự án: ${p.code}`;
  const nameEl = document.getElementById('eval-proj-name');
  if (nameEl) nameEl.textContent = `${p.name} (${state.currentProjectVersion})`;
  const metaEl = document.getElementById('eval-proj-meta');
  if (metaEl) metaEl.textContent = `Trưởng dự án: ${p.lead} · Lĩnh vực: ${p.domain} · Tiêu chuẩn: ${(p.standards || []).join(' · ')}`;

  // Calculate scores
  const allTcs = getAllTcs();
  let passed = 0;
  let failed = 0;
  let p1Passed = 0;
  let p1Total = 0;

  allTcs.forEach(tc => {
    if (tc.priority === 'P1') p1Total++;
    const r = state.results[tc.id];
    if (r && r.status === 'Pass') {
      passed++;
      if (tc.priority === 'P1') p1Passed++;
    } else if (r && r.status === 'Fail') {
      failed++;
    }
  });

  const total = allTcs.length;
  const passRate = total > 0 ? (passed / total) * 100 : 0;
  const p1Rate = p1Total > 0 ? (p1Passed / p1Total) * 100 : 100;
  
  // Readiness score formula (ISO 25010 weighted)
  // 60% functional pass rate + 40% P1 critical clearance
  const readiness = Math.round((passRate * 0.6) + (p1Rate * 0.4));

  const scoreEl = document.getElementById('eval-readiness-score');
  if (scoreEl) scoreEl.textContent = readiness + '%';

  const statusEl = document.getElementById('eval-readiness-status');
  if (statusEl) {
    if (readiness >= 90 && failed === 0) {
      statusEl.textContent = '🟢 ĐỦ ĐIỀU KIỆN NGHIỆM THU PHÁT HÀNH';
      statusEl.style.color = '#10b981';
    } else if (readiness >= 75) {
      statusEl.textContent = '🟡 CẦN KHẮC PHỤC CÁC LỖI TỒN ĐỌNG TRƯỚC PHÁT HÀNH';
      statusEl.style.color = '#f59e0b';
    } else {
      statusEl.textContent = '🔴 CHƯA ĐỦ ĐIỀU KIỆN NGHIỆM THU';
      statusEl.style.color = '#ef4444';
    }
  }

  // Update bars
  const funcBar = document.getElementById('eval-bar-func');
  if (funcBar) funcBar.style.width = Math.min(100, Math.round(passRate)) + '%';
  const funcPct = document.getElementById('eval-pct-func');
  if (funcPct) funcPct.textContent = Math.round(passRate) + '%';
}

function exportEvaluationCertificate() {
  const p = getActiveProject();
  if (!p) return;
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const allTcs = getAllTcs();
  let passed = 0;
  allTcs.forEach(t => { if (state.results[t.id]?.status === 'Pass') passed++; });
  const pct = allTcs.length > 0 ? Math.round((passed / allTcs.length) * 100) : 0;

  const w = window.open('', '_blank');
  w.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Phiếu Đánh Giá Chất Lượng Phần Mềm — ${p.code}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        .cert-border { border: 4px double #3b82f6; padding: 30px; border-radius: 12px; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
        .logo { font-size: 28px; font-weight: 800; color: #2563eb; }
        h1 { font-size: 22px; text-transform: uppercase; margin: 10px 0; color: #0f172a; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
        .meta-table td.label { font-weight: 600; background: #f8fafc; width: 30%; }
        .score-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
        .score-val { font-size: 32px; font-weight: 800; color: #10b981; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
        .sig-block { width: 40%; }
        .sig-space { height: 70px; }
      </style>
    </head>
    <body>
      <div class="cert-border">
        <div class="header">
          <div class="logo">Hệ thống Quản lý Kiểm thử & Đánh giá Chất lượng Phần mềm</div>
          <div style="font-size:14px; color:#475569">BỘ PHẬN ĐẢM BẢO CHẤT LƯỢNG PHẦN MỀM</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px">Tuân thủ tiêu chuẩn: ISO 9001:2015 · ISO/IEC/IEEE 29119-2 · ISO/IEC 25010:2023</div>
          <h1>PHIẾU ĐÁNH GIÁ CHẤT LƯỢNG PHẦN MỀM</h1>
          <div>Số hiệu: CERT-${p.code}-${new Date().getFullYear()}-01 · Ngày lập: ${dateStr}</div>
        </div>

        <table class="meta-table">
          <tr><td class="label">Hệ thống Phần mềm:</td><td><strong>${p.name}</strong></td></tr>
          <tr><td class="label">Mã Dự án:</td><td>${p.code}</td></tr>
          <tr><td class="label">Phiên bản Thử nghiệm:</td><td><strong>${state.currentProjectVersion}</strong></td></tr>
          <tr><td class="label">Lĩnh vực / Miền nghiệp vụ:</td><td>${p.domain}</td></tr>
          <tr><td class="label">Trưởng Dự án (PM / QA Lead):</td><td>${p.lead}</td></tr>
          <tr><td class="label">Quy mô Kịch bản Thử nghiệm:</td><td>${allTcs.length} Test Cases (Phân bổ trên ${getModules().length} Phân hệ)</td></tr>
          <tr><td class="label">Tiêu chí Đóng Kiểm thử (Exit Criteria):</td><td>Đạt 100% kịch bản P1 (Critical), Không tồn đọng Blocker Bug</td></tr>
        </table>

        <div class="score-box">
          <div style="font-weight:600; font-size:13px; color:#166534">Mức độ hoàn thành để bàn giao</div>
          <div class="score-val">${pct}%</div>
          <div style="font-size:13px; font-weight:600; color:#166534">KẾT LUẬN: ĐẠT YÊU CẦU KIỂM TRA ĐỂ BÀN GIAO</div>
        </div>

        <div class="signatures">
          <div class="sig-block">
            <strong>ĐẠI DIỆN ĐỘI NGŨ KIỂM THỬ (QA LEAD)</strong>
            <div class="sig-space"></div>
            <div><strong>${state.currentUser ? state.currentUser.name : 'QA Team'}</strong></div>
          </div>
          <div class="sig-block">
            <strong>TRƯỞNG DỰ ÁN PHẦN MỀM (PROJECT MANAGER)</strong>
            <div class="sig-space"></div>
            <div><strong>${p.lead.split('(')[0]}</strong></div>
          </div>
        </div>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  w.document.close();
}


// ================================================================
// PHÂN HỆ QUẢN TRỊ NHÂN SỰ & PHÂN CÔNG THEO DỰ ÁN (USER MANAGEMENT)
// ================================================================
const DEFAULT_USERS_DATA = [
  {
    id: 'usr_001',
    username: 'admin',
    password: '123',
    name: 'Nguyễn Văn Huy (Quản lý dự án)',
    role: 'admin',
    roleTitle: 'Quản lý Hệ thống & Dự án (Admin/PM)',
    email: 'huy.nv@smartvms.local',
    assignedProjects: ['PRJ-SMARTVMS', 'PRJ-SMARTPARK', 'PRJ-SMARTACCESS'],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  },
  {
    id: 'usr_002',
    username: 'tester',
    password: '123',
    name: 'Nguyễn Văn Nam (Người kiểm tra 1)',
    role: 'tester',
    roleTitle: 'Người kiểm tra (Tester)',
    email: 'nam.nv@smartvms.local',
    assignedProjects: ['PRJ-SMARTVMS', 'PRJ-SMARTPARK'],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  },
  {
    id: 'usr_003',
    username: 'tester2',
    password: '123',
    name: 'Trần Thị Lan (Người kiểm tra 2)',
    role: 'tester',
    roleTitle: 'Người kiểm tra (Tester)',
    email: 'lan.tt@smartvms.local',
    assignedProjects: ['PRJ-SMARTVMS'],
    status: 'ACTIVE',
    createdAt: '2026-10-05'
  },
  {
    id: 'usr_004',
    username: 'tester3',
    password: '123',
    name: 'Lê Hoàng Minh (Người kiểm tra 3)',
    role: 'tester',
    roleTitle: 'Người kiểm tra (Tester)',
    email: 'minh.lh@smartvms.local',
    assignedProjects: ['PRJ-SMARTACCESS'],
    status: 'ACTIVE',
    createdAt: '2026-10-08'
  },
  {
    id: 'usr_005',
    username: 'dev',
    password: '123',
    name: 'Trần Quốc Tuấn (Lập trình viên)',
    role: 'developer',
    roleTitle: 'Lập trình viên (Developer)',
    email: 'tuan.tq@smartvms.local',
    assignedProjects: ['PRJ-SMARTVMS', 'PRJ-SMARTPARK', 'PRJ-SMARTACCESS'],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  }
];

function initUsersList() {
  const saved = localStorage.getItem('openqas_users_list');
  if (saved) {
    try {
      state.usersList = JSON.parse(saved);
    } catch(e) {}
  }
  if (!state.usersList || state.usersList.length === 0) {
    state.usersList = JSON.parse(JSON.stringify(DEFAULT_USERS_DATA));
    saveUsersList();
  }
}

function saveUsersList() {
  localStorage.setItem('openqas_users_list', JSON.stringify(state.usersList));
}

let selectedUserRoleFilter = '';

function filterUsersByRole(role) {
  selectedUserRoleFilter = role;
  renderUsersPage();
}

function renderUsersPage() {
  initUsersList();
  initAssignments();
  const allUsers = state.usersList || [];

  // Update Stats
  const statTotal = document.getElementById('usr-stat-total');
  if (statTotal) statTotal.textContent = allUsers.length;
  const statAdmin = document.getElementById('usr-stat-admin');
  if (statAdmin) statAdmin.textContent = allUsers.filter(u => u.role === 'admin').length;
  const statTester = document.getElementById('usr-stat-tester');
  if (statTester) statTester.textContent = allUsers.filter(u => u.role === 'tester').length;
  const statDev = document.getElementById('usr-stat-dev');
  if (statDev) statDev.textContent = allUsers.filter(u => u.role === 'developer').length;

  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  const users = selectedUserRoleFilter ? allUsers.filter(u => u.role === selectedUserRoleFilter) : allUsers;
  const projMap = new Map((state.projects || []).map(p => [p.id, p.code]));
  const tasks = state.assignments || [];

  tbody.innerHTML = users.map(u => {
    const isLocked = u.status === 'LOCKED';
    const roleBadge = u.role === 'admin' ? 
      '<span class="badge badge-p1">👑 Quản lý (Admin/PM)</span>' : 
      u.role === 'tester' ? 
      '<span class="badge badge-pass">🧪 Người kiểm tra (Tester)</span>' : 
      '<span class="badge badge-nr">💻 Lập trình viên (Dev)</span>';

    const projBadges = (u.assignedProjects || []).map(pid => 
      `<span class="module-tag" style="margin-right:4px; font-size:11px">${projMap.get(pid) || pid}</span>`
    ).join('') || '<span style="color:var(--text-muted); font-size:12px">Chưa gán</span>';

    const userTasks = tasks.filter(t => t.assigneeUsername === u.username);
    const activeTasks = userTasks.filter(t => t.status !== 'DONE' && t.status !== 'PASSED');
    const taskCol = u.role === 'tester' ? 
      `<strong class="clickable-badge" onclick="jumpToUserAssignments('${u.username}')" title="Bấm xem các bài giao cho nhân sự này">${activeTasks.length} bài đang làm</strong> (${userTasks.length} tổng)` : 
      `<span style="color:var(--text-muted); font-size:12px">—</span>`;

    return `
      <tr style="${isLocked ? 'opacity:0.6; background:rgba(0,0,0,0.02)' : ''}">
        <td>
          <strong>${u.name}</strong>
          <div style="font-size:11.5px; color:var(--text-muted)">${u.email || ''}</div>
        </td>
        <td><code>${u.username}</code></td>
        <td>${roleBadge}</td>
        <td>${projBadges}</td>
        <td>${taskCol}</td>
        <td>
          ${isLocked ? 
            '<span class="badge badge-fail">🔒 Tạm khóa</span>' : 
            '<span class="badge badge-pass">● Hoạt động</span>'}
        </td>
        <td>
          <div style="display:flex; gap:4px">
            <button class="btn btn-sm btn-outline admin-only" onclick="openEditUserModal('${u.id}')">✏️ Sửa</button>
            ${u.role === 'tester' ? `<button class="btn btn-sm btn-outline admin-only" onclick="jumpToUserAssignments('${u.username}')" title="Xem việc đã giao">📋 Việc</button>` : ''}
            ${u.username !== 'admin' ? `
              <button class="btn btn-sm ${isLocked ? 'btn-primary' : 'btn-danger'} admin-only" onclick="toggleLockUser('${u.id}')">
                ${isLocked ? '🔓' : '🔒'}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateUserModal() {
  document.getElementById('user-modal-title').textContent = '👥 Thêm Nhân viên Mới';
  document.getElementById('uf-user-id').value = '';
  document.getElementById('uf-name').value = '';
  document.getElementById('uf-username').value = '';
  document.getElementById('uf-username').removeAttribute('readonly');
  document.getElementById('uf-password').value = '123';
  document.getElementById('uf-role').value = 'tester';
  document.getElementById('uf-email').value = '';

  renderUserProjectCheckboxes([]);
  openModal('modal-user-form');
}

function openEditUserModal(userId) {
  initUsersList();
  const u = state.usersList.find(x => x.id === userId);
  if (!u) return;

  document.getElementById('user-modal-title').textContent = '✏️ Chỉnh sửa Thông tin Nhân sự';
  document.getElementById('uf-user-id').value = u.id;
  document.getElementById('uf-name').value = u.name;
  document.getElementById('uf-username').value = u.username;
  document.getElementById('uf-username').setAttribute('readonly', 'true');
  document.getElementById('uf-password').value = u.password;
  document.getElementById('uf-role').value = u.role;
  document.getElementById('uf-email').value = u.email || '';

  renderUserProjectCheckboxes(u.assignedProjects || []);
  openModal('modal-user-form');
}

function renderUserProjectCheckboxes(selectedProjectIds) {
  const container = document.getElementById('uf-projects-checkboxes');
  if (!container) return;

  container.innerHTML = (state.projects || []).map(p => {
    const isChecked = selectedProjectIds.includes(p.id);
    return `
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px">
        <input type="checkbox" name="uf-proj" value="${p.id}" ${isChecked ? 'checked' : ''} />
        <span><strong>${p.code}</strong> — ${p.name}</span>
      </label>
    `;
  }).join('');
}

function confirmSaveUser() {
  const id = document.getElementById('uf-user-id').value;
  const name = document.getElementById('uf-name').value.trim();
  const username = document.getElementById('uf-username').value.trim();
  const password = document.getElementById('uf-password').value.trim();
  const role = document.getElementById('uf-role').value;
  const email = document.getElementById('uf-email').value.trim();

  if (!name || !username || !password) {
    showToast('⚠️ Vui lòng nhập đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!', 'error');
    return;
  }

  const selectedProjects = Array.from(document.querySelectorAll('input[name="uf-proj"]:checked')).map(cb => cb.value);

  initUsersList();

  if (id) {
    // Edit
    const u = state.usersList.find(x => x.id === id);
    if (u) {
      u.name = name;
      u.password = password;
      u.role = role;
      u.email = email;
      u.assignedProjects = selectedProjects;
    }
    showToast(`✅ Đã cập nhật nhân sự: ${name}`, 'success');
  } else {
    // Add new
    if (state.usersList.some(x => x.username.toLowerCase() === username.toLowerCase())) {
      showToast('⚠️ Tên đăng nhập đã tồn tại trong hệ thống!', 'error');
      return;
    }
    state.usersList.push({
      id: 'usr_' + Date.now(),
      username,
      password,
      name,
      role,
      roleTitle: role === 'admin' ? 'Quản lý (Admin/PM)' : role === 'tester' ? 'Người kiểm tra' : 'Lập trình viên',
      email,
      assignedProjects: selectedProjects,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10)
    });
    showToast(`🎉 Đã thêm thành công nhân sự mới: ${name}`, 'success');
  }

  saveUsersList();
  closeModal('modal-user-form');
  renderUsersPage();
}

function toggleLockUser(userId) {
  initUsersList();
  const u = state.usersList.find(x => x.id === userId);
  if (!u) return;

  u.status = u.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
  saveUsersList();
  showToast(`${u.status === 'LOCKED' ? '🔒 Đã khóa tài khoản' : '🔓 Đã mở khóa tài khoản'} ${u.username}`, 'info');
  renderUsersPage();
}

// ================================================================
// PHÂN HỆ GIAO VIỆC & HẠN CHÓT (TASK ASSIGNMENT & SCHEDULING)
// ================================================================
const DEFAULT_ASSIGNMENTS_DATA = [];

function initAssignments() {
  const saved = localStorage.getItem('openqas_assignments_list');
  if (saved) {
    try {
      state.assignments = JSON.parse(saved);
    } catch(e) {}
  }
  if (!state.assignments) {
    state.assignments = [];
  }
}

function saveAssignments() {
  localStorage.setItem('openqas_assignments_list', JSON.stringify(state.assignments));
}

function getTaskDeadlineStatus(task) {
  if (task.status === 'DONE' || task.status === 'PASSED') {
    return { label: '✅ Đã Đạt', badgeClass: 'badge-pass', isOverdue: false };
  }
  if (task.status === 'FAILED') {
    return { label: '❌ Bị Lỗi', badgeClass: 'badge-fail', isOverdue: false };
  }
  
  if (!task.dueDate) {
    return { label: '⏳ Chưa có hạn', badgeClass: 'badge-nr', isOverdue: false };
  }

  const now = new Date();
  const due = new Date(task.dueDate + 'T23:59:59');
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `⚠️ Quá hạn ${Math.abs(diffDays)} ngày`, badgeClass: 'badge-fail', isOverdue: true, diffDays };
  } else if (diffDays === 0) {
    return { label: '⏰ Đến hạn hôm nay', badgeClass: 'badge-p1', isOverdue: false, diffDays };
  } else {
    return { label: `⏳ Còn ${diffDays} ngày`, badgeClass: 'badge-nr', isOverdue: false, diffDays };
  }
}

// ================================================================
// UNIFIED ENTERPRISE ASSIGNMENT & DISPATCH COMMAND CENTER
// ================================================================

const ARCH_LAYERS = [
  {
    id: 'LAYER_CORE',
    name: 'Tầng Xác Thực, Bảo Mật & Quản Trị Hệ Thống',
    badge: 'Core & Security',
    badgeColor: '#2563eb',
    desc: 'Quản trị phân quyền, phiên trực ban, cấu hình trạm gác và an ninh nền tảng',
    moduleIds: ['M01', 'M08', 'M10']
  },
  {
    id: 'LAYER_BIZ',
    name: 'Tầng Nghiệp Vụ Khách & Vận Hành Trạm Gác',
    badge: 'Operations & Kiosk',
    badgeColor: '#059669',
    desc: 'Luồng check-in khách đơn, đoàn khách, thẻ xe, thu hồi thẻ và giao diện trạm',
    moduleIds: ['M02', 'M03', 'M04', 'M05']
  },
  {
    id: 'LAYER_DATA',
    name: 'Tầng Dữ Liệu Lịch Sử, Ngoại Lệ & Báo Cáo',
    badge: 'Analytics & Audit',
    badgeColor: '#d97706',
    desc: 'Dòng thời gian timeline, sổ sách ngoại lệ DataEntry, báo cáo thống kê & ISO',
    moduleIds: ['M06', 'M07', 'M09']
  },
  {
    id: 'LAYER_HARDWARE',
    name: 'Tầng Thiết Bị Ngoại Vi & Nền Tảng Chịu Lỗi',
    badge: 'Hardware & NFR',
    badgeColor: '#7c3aed',
    desc: 'Đầu đọc CCCD chip, thẻ RFID, máy quét QR, DeviceService và khả năng chạy offline',
    moduleIds: ['M11', 'M12']
  }
];

let treeSelectedTcIds = new Set();

function switchAsgMainTab(tabName) {
  state.asgCurrentTab = tabName;

  const btnOverview = document.getElementById('asg-tab-btn-overview');
  const btnDetail = document.getElementById('asg-tab-btn-detail');
  const paneOverview = document.getElementById('asg-tab-content-overview');
  const paneDetail = document.getElementById('asg-tab-content-detail');

  if (btnOverview) btnOverview.classList.toggle('active', tabName === 'overview');
  if (btnDetail) btnDetail.classList.toggle('active', tabName === 'detail');

  if (paneOverview) paneOverview.style.display = tabName === 'overview' ? 'block' : 'none';
  if (paneDetail) paneDetail.style.display = tabName === 'detail' ? 'block' : 'none';

  if (tabName === 'overview') {
    renderAsgOverviewTab();
  } else if (tabName === 'detail') {
    renderAsgDetailTab();
  }
}

function handleAsgProjectChange(projectId) {
  state.currentProjectId = projectId;
  syncActiveProjectContext();
  treeSelectedTcIds.clear();
  renderAssignmentsPage();
}

function renderAssignmentsPage() {
  initAssignments();
  initUsersList();

  const p = getActiveProject();
  if (!p) return;

  // Populate Project Selector
  const projSel = document.getElementById('asg-project-selector');
  if (projSel) {
    projSel.innerHTML = (state.projects || []).map(prj =>
      `<option value="${prj.id}" ${prj.id === p.id ? 'selected' : ''}>📂 ${prj.name} (${(prj.testCases || []).length} bài)</option>`
    ).join('');
  }

  if (!state.asgCurrentTab) {
    state.asgCurrentTab = 'overview';
  }

  switchAsgMainTab(state.asgCurrentTab);
}

// ================================================================
// TAB 1: THỐNG KÊ TỔNG QUAN PHÂN BỔ (MA TRẬN NHÂN SỰ)
// ================================================================
function renderAsgOverviewTab() {
  const p = getActiveProject();
  if (!p) return;

  const allTcs = p.testCases || [];
  const projectModules = p.modules || [];
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id);

  // Map assignments by tcId
  const asgMap = new Map();
  assignments.forEach(a => asgMap.set(a.tcId, a));

  let doneCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  let assignedCount = 0;

  allTcs.forEach(tc => {
    const asg = asgMap.get(tc.id);
    if (asg) {
      assignedCount++;
      const ds = getTaskDeadlineStatus(asg);
      if (asg.status === 'DONE' || asg.status === 'PASSED') {
        doneCount++;
      } else {
        pendingCount++;
        if (ds.isOverdue) overdueCount++;
      }
    }
  });

  const unassignedCount = Math.max(0, allTcs.length - assignedCount);
  const assignedPct = allTcs.length > 0 ? Math.round((assignedCount / allTcs.length) * 100) : 0;

  // Update Top Metric Cards
  const statTotal = document.getElementById('asg-stat-total');
  if (statTotal) statTotal.textContent = allTcs.length;
  const statTotalDesc = document.getElementById('asg-stat-total-desc');
  if (statTotalDesc) statTotalDesc.textContent = `${projectModules.length} Phân hệ nghiệp vụ`;

  const statAssigned = document.getElementById('asg-stat-assigned');
  if (statAssigned) statAssigned.textContent = assignedCount;
  const statAssignedDesc = document.getElementById('asg-stat-assigned-desc');
  if (statAssignedDesc) statAssignedDesc.textContent = `${assignedPct}% khối lượng dự án`;

  const statUnassigned = document.getElementById('asg-stat-unassigned');
  if (statUnassigned) statUnassigned.textContent = unassignedCount;

  const statPending = document.getElementById('asg-stat-pending');
  if (statPending) statPending.textContent = pendingCount;

  const statOverdue = document.getElementById('asg-stat-overdue');
  if (statOverdue) statOverdue.textContent = overdueCount;

  // Render Workload Matrix
  const tbody = document.getElementById('asg-workload-tbody');
  if (!tbody) return;

  const testers = (state.usersList || []).filter(u => u.role === 'tester');

  if (testers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted)">
          Chưa có Tester nào trong hệ thống. Vui lòng thêm Tester tại mục <strong>Quản lý Nhân sự</strong>.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = testers.map(u => {
    const userAssignments = assignments.filter(a => a.assigneeUsername === u.username);
    const userTcCount = userAssignments.length;
    const userPct = allTcs.length > 0 ? ((userTcCount / allTcs.length) * 100).toFixed(1) : '0.0';

    const modBreakdown = [];
    projectModules.forEach(m => {
      const modTotal = allTcs.filter(tc => tc.module === m.id).length;
      if (modTotal === 0) return;
      const userModCount = userAssignments.filter(a => {
        if (a.module === m.id) return true;
        const tc = allTcs.find(t => t.id === a.tcId);
        return tc && tc.module === m.id;
      }).length;

      if (userModCount > 0) {
        const modPct = Math.round((userModCount / modTotal) * 100);
        modBreakdown.push({
          id: m.id,
          name: m.name,
          count: userModCount,
          total: modTotal,
          pct: modPct
        });
      }
    });

    const modCount = modBreakdown.length;

    let chipsHtml = '';
    if (modBreakdown.length === 0) {
      chipsHtml = `<span style="font-size:12px; color:var(--text-muted); font-style:italic">Chưa được phân công phân hệ nào</span>`;
    } else {
      chipsHtml = modBreakdown.map(b => {
        let chipBg = 'rgba(37, 99, 235, 0.08)';
        let chipColor = '#2563eb';
        let chipBorder = 'rgba(37, 99, 235, 0.25)';
        if (b.pct === 100) {
          chipBg = 'rgba(16, 185, 129, 0.1)';
          chipColor = '#059669';
          chipBorder = 'rgba(16, 185, 129, 0.3)';
        } else if (b.pct >= 50) {
          chipBg = 'rgba(59, 130, 246, 0.1)';
          chipColor = '#1d4ed8';
          chipBorder = 'rgba(59, 130, 246, 0.3)';
        }
        return `
          <span class="asg-mod-chip" style="background:${chipBg}; color:${chipColor}; border-color:${chipBorder}" title="${b.name}: ${b.count}/${b.total} kịch bản (${b.pct}%)">
            <strong>${b.id}:</strong> ${b.count}/${b.total} <span style="font-weight:700">(${b.pct}%)</span>
          </span>
        `;
      }).join('');
    }

    let statusBadge = '';
    if (userTcCount === 0) {
      statusBadge = `<span class="badge" style="background:#f1f5f9; color:#64748b; font-weight:700">🟢 Đang rảnh (0 việc)</span>`;
    } else if (userTcCount > 40) {
      statusBadge = `<span class="badge badge-fail" style="font-weight:800; animation:pulse 2s infinite">🔴 Quá tải (${userTcCount} bài)</span>`;
    } else if (userTcCount >= 20) {
      statusBadge = `<span class="badge badge-p2" style="font-weight:700">🟠 Tải cao (${userTcCount} bài)</span>`;
    } else {
      statusBadge = `<span class="badge badge-pass" style="font-weight:700">🟢 Cân bằng (${userTcCount} bài)</span>`;
    }

    const barWidth = Math.min(100, Math.round(Number(userPct)));
    const barColor = userTcCount > 40 ? '#ef4444' : userTcCount >= 20 ? '#f59e0b' : '#10b981';

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:8px">
            <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #3b82f6, #1d4ed8); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px">
              ${u.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:800; font-size:13px; color:var(--text-primary)">${u.name}</div>
              <div style="font-size:11px; color:var(--text-muted)">@${u.username}</div>
            </div>
          </div>
        </td>
        <td style="font-weight:800; font-size:13.5px; color:#2563eb">
          ${userTcCount} <span style="font-size:11px; font-weight:500; color:var(--text-muted)">/ ${allTcs.length}</span>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:8px">
            <div class="progress-bar-wrapper" style="flex:1; height:7px; background:var(--border)">
              <div class="progress-bar" style="width:${barWidth}%; background:${barColor}"></div>
            </div>
            <strong style="font-size:12px; width:45px; text-align:right">${userPct}%</strong>
          </div>
        </td>
        <td style="font-weight:700; font-size:12.5px; text-align:center">
          ${modCount} <span style="font-size:11px; font-weight:500; color:var(--text-muted)">/ ${projectModules.length}</span>
        </td>
        <td>
          ${modCount === 0 ? `<span style="color:var(--text-muted); font-size:12px">Chưa nhận phân hệ nào</span>` : `
            <div style="display:flex; align-items:center; gap:8px">
              <span style="font-size:12px; font-weight:700; color:#2563eb">${modCount}/${projectModules.length} Phân hệ</span>
              <button type="button" class="btn btn-xs btn-outline" onclick="openTesterWorkloadModal('${u.username}')" style="font-size:11px; padding:2px 8px; font-weight:700" title="Mở chi tiết các phân hệ đã giao">
                📊 Xem chi tiết (${modCount})
              </button>
            </div>
          `}
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex; gap:4px">
            <button type="button" class="btn btn-xs btn-primary" onclick="jumpToDetailForTester('${u.username}')" title="Chuyển sang Tab 2 để điều phối kịch bản cho Tester này" style="font-weight:700; white-space:nowrap">
              👉 Điều phối
            </button>
            ${userTcCount > 0 ? `
              <button type="button" class="btn btn-xs btn-outline admin-only" onclick="revokeAllTesterAssignments('${u.username}')" title="Thu hồi toàn bộ kịch bản đã giao cho Tester này" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.3)">
                🗑️ Thu hồi
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function jumpToDetailForTester(username) {
  state.asgTargetAssignee = username;
  switchAsgMainTab('detail');
  const sel = document.getElementById('detail-assignee');
  if (sel) {
    sel.value = username;
    onDetailAssigneeChange(username);
  }
}

// ================================================================
// TAB 2: CẤU HÌNH GIAO VIỆC CHI TIẾT (TỐI GIẢN & MASTER-DETAIL 1 HÀNG)
// ================================================================
function renderAsgDetailTab() {
  const p = getActiveProject();
  if (!p) return;

  const testers = (state.usersList || []).filter(u => u.role === 'tester');
  const assigneeSel = document.getElementById('detail-assignee');

  if (assigneeSel) {
    if (testers.length === 0) {
      assigneeSel.innerHTML = `<option value="">-- Chưa có Tester nào --</option>`;
    } else {
      const prevVal = state.asgTargetAssignee || assigneeSel.value;
      assigneeSel.innerHTML = testers.map(u => {
        const myTasksCount = (state.assignments || []).filter(a => a.projectId === p.id && a.assigneeUsername === u.username && a.status !== 'DONE' && a.status !== 'PASSED').length;
        return `<option value="${u.username}" ${prevVal === u.username ? 'selected' : ''}>👤 ${u.name} (${myTasksCount} việc đang làm)</option>`;
      }).join('');
      if (prevVal && testers.some(u => u.username === prevVal)) {
        assigneeSel.value = prevVal;
      }
    }
  }

  // Set default dates if empty
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const startDateEl = document.getElementById('detail-start-date');
  const dueDateEl = document.getElementById('detail-due-date');
  if (startDateEl && !startDateEl.value) startDateEl.value = today;
  if (dueDateEl && !dueDateEl.value) dueDateEl.value = due;

  const currentTesterUsername = assigneeSel ? assigneeSel.value : '';
  renderTesterCurrentWorkload(currentTesterUsername);

  // Set default active module
  const projectModules = p.modules || [];
  if (!state.asgActiveModuleId || !projectModules.some(m => m.id === state.asgActiveModuleId)) {
    state.asgActiveModuleId = projectModules.length > 0 ? projectModules[0].id : '';
  }

  renderAsgModuleList();
  renderAsgTcTable();
  updateDetailDockSummary();
}

function onDetailAssigneeChange(username) {
  state.asgTargetAssignee = username;
  renderTesterCurrentWorkload(username);
  updateDetailDockSummary();
}

function renderTesterCurrentWorkload(username) {
  const p = getActiveProject();
  const statusContainer = document.getElementById('detail-user-inline-status');
  const btnViewWorkload = document.getElementById('detail-btn-view-workload');
  const btnRevokeUser = document.getElementById('detail-btn-revoke-user');
  if (!p) return;

  const allTcs = p.testCases || [];
  const projectModules = p.modules || [];
  const user = (state.usersList || []).find(u => u.username === username);

  if (!user) {
    if (statusContainer) statusContainer.innerHTML = '';
    if (btnViewWorkload) btnViewWorkload.style.display = 'none';
    if (btnRevokeUser) btnRevokeUser.style.display = 'none';
    return;
  }

  const userAssignments = (state.assignments || []).filter(a => a.projectId === p.id && a.assigneeUsername === username);
  const userTcCount = userAssignments.length;
  const userPct = allTcs.length > 0 ? ((userTcCount / allTcs.length) * 100).toFixed(1) : '0.0';

  const modBreakdown = [];
  projectModules.forEach(m => {
    const modTotal = allTcs.filter(tc => tc.module === m.id).length;
    if (modTotal === 0) return;
    const count = userAssignments.filter(a => {
      if (a.module === m.id) return true;
      const tc = allTcs.find(t => t.id === a.tcId);
      return tc && tc.module === m.id;
    }).length;

    if (count > 0) {
      modBreakdown.push({
        id: m.id,
        name: m.name,
        count,
        total: modTotal,
        pct: Math.round((count / modTotal) * 100)
      });
    }
  });

  if (statusContainer) {
    if (userTcCount === 0) {
      statusContainer.innerHTML = `<span class="badge" style="background:#f1f5f9; color:#64748b; font-weight:700">🟢 Đang rảnh (0 việc)</span>`;
    } else if (userTcCount > 40) {
      statusContainer.innerHTML = `<span class="badge badge-fail" style="font-weight:800">🔴 Quá tải: <strong>${userTcCount}</strong>/${allTcs.length} bài (${userPct}%)</span>`;
    } else if (userTcCount >= 20) {
      statusContainer.innerHTML = `<span class="badge badge-p2" style="font-weight:700">🟠 Tải cao: <strong>${userTcCount}</strong>/${allTcs.length} bài (${userPct}%)</span>`;
    } else {
      statusContainer.innerHTML = `<span class="badge badge-pass" style="font-weight:700">🟢 Cân bằng: <strong>${userTcCount}</strong>/${allTcs.length} bài (${userPct}%)</span>`;
    }
  }

  if (btnViewWorkload) {
    btnViewWorkload.style.display = 'inline-flex';
    btnViewWorkload.innerHTML = `📊 Chi tiết (${modBreakdown.length} phân hệ)`;
    btnViewWorkload.title = `Xem chi tiết phân bổ ${modBreakdown.length} phân hệ của ${user.name}`;
  }

  if (btnRevokeUser) {
    btnRevokeUser.style.display = userTcCount > 0 ? 'inline-flex' : 'none';
    btnRevokeUser.title = `Thu hồi toàn bộ ${userTcCount} kịch bản của ${user.name}`;
  }
}

function openTesterWorkloadModal(targetUsername) {
  const p = getActiveProject();
  if (!p) return;

  const username = targetUsername || state.asgTargetAssignee || document.getElementById('detail-assignee')?.value;
  const user = (state.usersList || []).find(u => u.username === username);
  if (!user) {
    showToast('⚠️ Vui lòng chọn Kiểm thử viên!', 'error');
    return;
  }

  const allTcs = p.testCases || [];
  const projectModules = p.modules || [];
  const userAssignments = (state.assignments || []).filter(a => a.projectId === p.id && a.assigneeUsername === username);
  const userTcCount = userAssignments.length;
  const userPct = allTcs.length > 0 ? ((userTcCount / allTcs.length) * 100).toFixed(1) : '0.0';

  const modBreakdown = [];
  projectModules.forEach(m => {
    const modTotal = allTcs.filter(tc => tc.module === m.id).length;
    if (modTotal === 0) return;
    const count = userAssignments.filter(a => {
      if (a.module === m.id) return true;
      const tc = allTcs.find(t => t.id === a.tcId);
      return tc && tc.module === m.id;
    }).length;

    if (count > 0) {
      modBreakdown.push({
        id: m.id,
        name: m.name,
        count,
        total: modTotal,
        pct: Math.round((count / modTotal) * 100)
      });
    }
  });

  const titleEl = document.getElementById('modal-tester-workload-title');
  if (titleEl) {
    titleEl.innerHTML = `📊 Phân Bổ Công Việc: <span style="color:#2563eb">${user.name}</span> <span style="font-size:12px; color:var(--text-muted); font-weight:normal">(@${user.username})</span>`;
  }

  const bodyEl = document.getElementById('modal-tester-workload-body');
  if (bodyEl) {
    let statusText = '🟢 Tải cân bằng';
    if (userTcCount === 0) statusText = '🟢 Đang rảnh (0 việc)';
    else if (userTcCount > 40) statusText = '🔴 Quá tải (khối lượng lớn)';
    else if (userTcCount >= 20) statusText = '🟠 Tải cao';

    bodyEl.innerHTML = `
      <div style="background:var(--bg-surface); border:1.5px solid var(--border); border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
        <div>
          <span style="font-size:13px; font-weight:700">Tổng kịch bản nhận:</span>
          <strong style="color:#2563eb; font-size:15px; margin-left:4px">${userTcCount} / ${allTcs.length}</strong>
          <span style="font-size:12px; color:var(--text-muted)">(${userPct}%)</span>
        </div>
        <div>
          <span style="font-size:13px; font-weight:700">Tham gia:</span>
          <strong style="margin-left:4px">${modBreakdown.length} / ${projectModules.length}</strong>
          <span style="font-size:12px; color:var(--text-muted)">Phân hệ</span>
        </div>
        <div>
          <span class="badge ${userTcCount>40?'badge-fail':userTcCount>=20?'badge-p2':'badge-pass'}" style="font-size:12px; font-weight:800">${statusText}</span>
        </div>
      </div>

      <h4 style="font-size:13px; font-weight:800; margin:0 0 8px 0; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.3px">
        Chi Tiết ${modBreakdown.length} Phân Hệ Đang Phụ Trách
      </h4>

      ${modBreakdown.length === 0 ? `
        <div style="text-align:center; padding:32px; color:var(--text-muted); font-size:13px">
          🟢 Kiểm thử viên hiện đang rảnh rỗi (chưa được giao kịch bản nào).
        </div>
      ` : `
        <div class="table-responsive" style="max-height:360px; overflow-y:auto; border:1px solid var(--border); border-radius:8px; margin:0">
          <table class="data-table" style="margin:0; font-size:12px">
            <thead>
              <tr style="background:rgba(0,0,0,0.02)">
                <th style="width:75px">Mã PH</th>
                <th>Tên Phân Hệ Nghiệp Vụ</th>
                <th style="width:105px; text-align:center">Số bài nhận</th>
                <th style="width:90px; text-align:center">Tỷ lệ (%)</th>
                <th style="width:120px">Tiến độ phân bổ</th>
              </tr>
            </thead>
            <tbody>
              ${modBreakdown.map(b => `
                <tr>
                  <td><span class="badge badge-outline" style="font-family:monospace; font-weight:800; color:#2563eb">[${b.id}]</span></td>
                  <td style="font-weight:700">${b.name}</td>
                  <td style="text-align:center; font-weight:800">${b.count} / ${b.total}</td>
                  <td style="text-align:center">
                    <span class="badge ${b.pct===100?'badge-pass':'badge-nr'}" style="font-size:10.5px">${b.pct}%</span>
                  </td>
                  <td>
                    <div class="progress-bar-wrapper" style="height:5px; background:var(--border)">
                      <div class="progress-bar" style="width:${b.pct}%; background:${b.pct===100?'#10b981':b.pct<40?'#f59e0b':'#2563eb'}"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;
  }

  const footerLeftEl = document.getElementById('modal-tester-workload-footer-left');
  if (footerLeftEl) {
    if (userTcCount > 0) {
      footerLeftEl.innerHTML = `
        <button type="button" class="btn btn-outline admin-only" onclick="revokeAllTesterAssignments('${user.username}'); closeModal('modal-tester-workload');" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.4); font-size:12px">
          🗑️ Thu hồi toàn bộ ${userTcCount} kịch bản của ${user.name.split('(')[0].trim()}
        </button>
      `;
    } else {
      footerLeftEl.innerHTML = '';
    }
  }

  openModal('modal-tester-workload');
}

function revokeCurrentSelectedTester() {
  const username = document.getElementById('detail-assignee')?.value;
  if (!username) return;
  revokeAllTesterAssignments(username);
}

function renderAsgModuleList() {
  const p = getActiveProject();
  const listEl = document.getElementById('detail-modules-list');
  if (!p || !listEl) return;

  const allTcs = p.testCases || [];
  const projectModules = p.modules || [];
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id);
  const asgMap = new Map();
  assignments.forEach(a => asgMap.set(a.tcId, a));

  const totalModBadge = document.getElementById('detail-mod-total-badge');
  if (totalModBadge) totalModBadge.textContent = `${projectModules.length} Phân hệ`;

  listEl.innerHTML = projectModules.map(m => {
    const modTcs = allTcs.filter(tc => tc.module === m.id);
    const modTotal = modTcs.length;
    const modAssigned = modTcs.filter(tc => asgMap.has(tc.id)).length;
    const selectedInMod = modTcs.filter(tc => treeSelectedTcIds.has(tc.id)).length;
    const isAllSelected = modTotal > 0 && selectedInMod === modTotal;
    const isActive = m.id === state.asgActiveModuleId;
    const pct = modTotal > 0 ? Math.round((modAssigned / modTotal) * 100) : 0;

    return `
      <li class="asg-mod-item ${isActive ? 'active' : ''}" onclick="selectModuleInDetail('${m.id}')" title="[${m.id}] ${m.name}: ${modAssigned}/${modTotal} bài (${pct}%)">
        <input type="checkbox"
          id="mod-chk-${m.id}"
          ${isAllSelected ? 'checked' : ''}
          onchange="toggleModuleSelection('${m.id}', this.checked)"
          onclick="event.stopPropagation()"
          style="width:15px; height:15px; cursor:pointer; flex-shrink:0"
          title="Chọn / Bỏ chọn toàn bộ ${modTotal} bài của phân hệ [${m.id}]"
        />
        <div class="asg-mod-content-row">
          <span class="asg-mod-title-text">
            <strong style="color:#2563eb">[${m.id}]</strong> ${m.name}
          </span>
          <span class="asg-mod-count-badge">${modTotal}</span>
          <div class="asg-mod-mini-progress" title="Đã giao: ${modAssigned}/${modTotal} (${pct}%)">
            <div class="asg-mod-mini-progress-fill" style="width:${pct}%; background:${pct===100?'#10b981':pct<40?'#f59e0b':'#2563eb'}"></div>
          </div>
        </div>
      </li>
    `;
  }).join('');

  // Set indeterminate state on checkboxes
  projectModules.forEach(m => {
    const modTcs = allTcs.filter(tc => tc.module === m.id);
    const selectedCount = modTcs.filter(tc => treeSelectedTcIds.has(tc.id)).length;
    const chk = document.getElementById(`mod-chk-${m.id}`);
    if (chk) {
      chk.indeterminate = (selectedCount > 0 && selectedCount < modTcs.length);
    }
  });
}

function selectModuleInDetail(moduleId) {
  state.asgActiveModuleId = moduleId;
  renderAsgModuleList();
  renderAsgTcTable();
}

function renderAsgTcTable() {
  const p = getActiveProject();
  const panelHead = document.getElementById('detail-panel-head');
  const tbody = document.getElementById('detail-tc-tbody');
  if (!p || !tbody) return;

  const projectModules = p.modules || [];
  if (projectModules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px">Chưa có phân hệ nào.</td></tr>`;
    return;
  }

  const currMod = projectModules.find(m => m.id === state.asgActiveModuleId) || projectModules[0];
  const allTcs = p.testCases || [];
  const modAllTcs = allTcs.filter(tc => tc.module === currMod.id);

  const assignments = (state.assignments || []).filter(a => a.projectId === p.id);
  const asgMap = new Map();
  assignments.forEach(a => asgMap.set(a.tcId, a));

  const modAssigned = modAllTcs.filter(tc => asgMap.has(tc.id)).length;
  const modUnassigned = modAllTcs.length - modAssigned;

  // Filter test cases
  const prioFilter = document.getElementById('detail-filter-prio')?.value || '';
  const statusFilter = document.getElementById('detail-filter-status')?.value || '';
  const searchFilter = (document.getElementById('detail-filter-search')?.value || '').toLowerCase().trim();

  const visibleTcs = modAllTcs.filter(tc => {
    if (prioFilter && tc.priority !== prioFilter) return false;
    const isAssigned = asgMap.has(tc.id);
    if (statusFilter === 'UNASSIGNED' && isAssigned) return false;
    if (statusFilter === 'ASSIGNED' && !isAssigned) return false;
    if (searchFilter) {
      const matchId = (tc.id || '').toLowerCase().includes(searchFilter);
      const matchName = (tc.name || '').toLowerCase().includes(searchFilter);
      const matchDesc = (tc.description || '').toLowerCase().includes(searchFilter);
      if (!matchId && !matchName && !matchDesc) return false;
    }
    return true;
  });

  const selectedInVisible = visibleTcs.filter(tc => treeSelectedTcIds.has(tc.id)).length;
  const isAllVisibleSelected = visibleTcs.length > 0 && selectedInVisible === visibleTcs.length;
  const isIndeterminate = selectedInVisible > 0 && selectedInVisible < visibleTcs.length;

  if (panelHead) {
    panelHead.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px">
        <span class="badge badge-outline" style="font-family:monospace; font-weight:800; font-size:12.5px; color:#2563eb">[${currMod.id}]</span>
        <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--text-primary)">${currMod.name}</h3>
        <span class="badge badge-nr" style="font-size:11px">${modAllTcs.length} bài (${modAssigned} đã giao / ${modUnassigned} chưa giao)</span>
      </div>

      <div style="display:flex; align-items:center; gap:6px">
        <button type="button" class="btn btn-xs btn-outline" onclick="batchSelectInActiveModule('ALL')" style="font-weight:700">
          ☑️ Chọn tất cả (${visibleTcs.length})
        </button>
        <button type="button" class="btn btn-xs btn-outline" onclick="batchSelectInActiveModule('NONE')" style="font-weight:700">
          ⬜ Bỏ chọn
        </button>
      </div>
    `;
  }

  // Update check all header in the table
  const checkAllActive = document.getElementById('detail-check-all-active');
  if (checkAllActive) {
    checkAllActive.checked = isAllVisibleSelected;
    checkAllActive.indeterminate = isIndeterminate;
  }

  if (visibleTcs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted)">
          🔍 Không có kịch bản nào phù hợp với bộ lọc trong phân hệ [${currMod.id}].
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = visibleTcs.map(tc => {
    const isChecked = treeSelectedTcIds.has(tc.id);
    const asg = asgMap.get(tc.id);

    let prioBadge = `<span class="badge badge-nr" style="font-size:10.5px; padding:2px 5px">${tc.priority || 'P3'}</span>`;
    if (tc.priority === 'P1') prioBadge = `<span class="badge badge-p1" style="font-weight:800; font-size:10.5px; padding:2px 5px">🔴 P1</span>`;
    else if (tc.priority === 'P2') prioBadge = `<span class="badge badge-p2" style="font-size:10.5px; padding:2px 5px">🟠 P2</span>`;
    else if (tc.priority === 'P3') prioBadge = `<span class="badge badge-p3" style="font-size:10.5px; padding:2px 5px">🟡 P3</span>`;
    else if (tc.priority === 'P4') prioBadge = `<span class="badge badge-p4" style="font-size:10.5px; padding:2px 5px">🟢 P4</span>`;

    let assigneeHtml = '';
    let statusHtml = '';
    let dateHtml = '<span style="color:var(--text-muted); font-size:11px">--</span>';
    let actionHtml = '';

    if (!asg) {
      assigneeHtml = `<span class="badge" style="background:rgba(245, 158, 11, 0.1); color:#b45309; font-size:11px; padding:2px 8px">⚪ Chưa giao</span>`;
      statusHtml = `<span class="badge badge-nr" style="font-size:11px; color:var(--text-muted); padding:2px 8px">⚪ Chưa giao</span>`;
      actionHtml = `<button type="button" class="btn-tc-action btn-tc-assign admin-only" onclick="quickAssignSingleTcToCurrent('${tc.id}')" title="Gán ngay kịch bản này cho Tester đang chọn">+ Giao</button>`;
    } else {
      const ds = getTaskDeadlineStatus(asg);
      const shortName = asg.assigneeName.split('(')[0].trim();
      assigneeHtml = `
        <span class="tc-assignee-tag" title="Phân công: ${asg.assigneeName} (${asg.assigneeUsername || ''})">
          👤 <strong>${shortName}</strong>
        </span>
      `;

      if (asg.status === 'PASSED') {
        statusHtml = `<span class="badge badge-pass" style="font-weight:700; font-size:11px; padding:2px 8px">✅ Đã Đạt</span>`;
      } else if (asg.status === 'FAILED') {
        statusHtml = `<span class="badge badge-fail" style="font-weight:700; font-size:11px; padding:2px 8px">❌ Bị Lỗi</span>`;
      } else if (asg.status === 'BLOCKED') {
        statusHtml = `<span class="badge badge-p2" style="font-weight:700; font-size:11px; padding:2px 8px">🚫 Bị nghẽn</span>`;
      } else {
        statusHtml = `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-size:11px; padding:2px 8px">⏳ Đang làm</span>`;
      }

      const sDate = asg.startDate || '2026-10-14';
      const dDate = asg.dueDate || '--';
      dateHtml = `
        <span style="font-size:11px; font-weight:600; color:var(--text-primary); font-family:monospace" title="Bắt đầu: ${sDate} — Kết thúc: ${dDate} (${ds.label})">
          ${sDate} ➔ ${dDate}
        </span>
      `;
      actionHtml = `<button type="button" class="btn-tc-action btn-tc-cancel admin-only" onclick="cancelAssignmentForTc('${tc.id}')" title="Hủy phân công kịch bản này">✕ Hủy</button>`;
    }

    return `
      <tr class="${isChecked ? 'selected-row' : ''}">
        <td style="text-align:center">
          <input type="checkbox"
            data-tcid="${tc.id}"
            data-modid="${currMod.id}"
            ${isChecked ? 'checked' : ''}
            onchange="toggleTcSelection('${tc.id}', '${currMod.id}', this.checked)"
            style="width:15px; height:15px; cursor:pointer"
          />
        </td>
        <td style="text-align:center; overflow:visible">
          <span class="tc-code-link" onclick="openAsgTcDetail('${tc.id}')" title="Nhấp để xem bản mô tả chi tiết kịch bản">[${tc.id}]</span>
        </td>
        <td style="text-align:center">${prioBadge}</td>
        <td>
          <div class="tc-name-link" onclick="openAsgTcDetail('${tc.id}')" title="[${tc.id}] ${tc.name} — Nhấp để xem mô tả chi tiết">${tc.name}</div>
        </td>
        <td>${assigneeHtml}</td>
        <td style="text-align:center">${statusHtml}</td>
        <td style="text-align:center">${dateHtml}</td>
        <td style="text-align:center">
          <div style="display:flex; align-items:center; justify-content:center; gap:4px">
            <button type="button" class="btn-tc-action btn-tc-inspect" onclick="openAsgTcDetail('${tc.id}')" title="Xem bản mô tả chi tiết kịch bản">👁️</button>
            ${actionHtml}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAsgTcDetail(tcId) {
  const p = getActiveProject();
  if (!p) return;
  const tc = (p.testCases || []).find(t => t.id === tcId);
  if (!tc) return;

  const projectModules = p.modules || [];
  const mod = projectModules.find(m => m.id === tc.module);
  const modName = mod ? `[${mod.id}] ${mod.name}` : (tc.module || 'M01');

  const assignments = (state.assignments || []).filter(a => a.projectId === p.id);
  const asg = assignments.find(a => a.tcId === tcId);

  const titleEl = document.getElementById('modal-asg-tc-title');
  const subEl = document.getElementById('modal-asg-tc-subtitle');
  const bodyEl = document.getElementById('modal-asg-tc-body');
  const footerLeftEl = document.getElementById('modal-asg-tc-footer-left');

  if (titleEl) {
    titleEl.innerHTML = `<span style="color:#2563eb; font-family:monospace">[${tc.id}]</span> ${tc.name}`;
  }
  if (subEl) {
    subEl.textContent = `Phân hệ: ${modName} • Mức ưu tiên: ${tc.priority || 'P3'} • Tiêu chuẩn ISO/IEC/IEEE 29119`;
  }

  let prioBadgeHtml = `<span class="badge badge-nr">${tc.priority || 'P3'}</span>`;
  if (tc.priority === 'P1') prioBadgeHtml = `<span class="badge badge-p1" style="font-weight:800">🔴 P1 Critical</span>`;
  else if (tc.priority === 'P2') prioBadgeHtml = `<span class="badge badge-p2">🟠 P2 Important</span>`;
  else if (tc.priority === 'P3') prioBadgeHtml = `<span class="badge badge-p3">🟡 P3 Medium</span>`;
  else if (tc.priority === 'P4') prioBadgeHtml = `<span class="badge badge-p4">🟢 P4 Low</span>`;

  let asgSectionHtml = '';
  if (asg) {
    const ds = getTaskDeadlineStatus(asg);
    asgSectionHtml = `
      <div class="asg-tc-detail-box" style="border-left:4px solid #2563eb; background:rgba(37, 99, 235, 0.04)">
        <div class="asg-tc-detail-box-title" style="color:#2563eb">
          <span>👥 Tình Trạng Điều Phối & Phân Công Nhân Sự</span>
          <span class="badge ${asg.status==='PASSED'?'badge-pass':asg.status==='FAILED'?'badge-fail':'badge-nr'}">
            ${asg.status==='PASSED'?'Đã Đạt':asg.status==='FAILED'?'Bị Lỗi':'Đang tiến hành'}
          </span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px; font-size:12.5px; margin-top:8px">
          <div>
            <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700">Người thực hiện:</span><br/>
            <strong style="color:#2563eb; font-size:13.5px">👤 ${asg.assigneeName}</strong> <span style="font-size:11px; color:var(--text-muted)">(@${asg.assigneeUsername})</span>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700">Thời hạn kiểm thử:</span><br/>
            <strong>${asg.startDate || 'Hôm nay'} ➔ ${asg.dueDate}</strong> <span class="badge ${ds.badgeClass}" style="margin-left:4px">${ds.label}</span>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700">Người giao việc:</span><br/>
            <span>${asg.assignedBy || 'Admin QA'} (${asg.assignedAt ? asg.assignedAt.slice(0,10) : 'vừa xong'})</span>
          </div>
        </div>
        ${asg.notes ? `
          <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); font-size:12px; color:var(--text-primary)">
            <strong>📝 Ghi chú chỉ đạo:</strong> ${asg.notes}
          </div>
        ` : ''}
      </div>
    `;
  } else {
    asgSectionHtml = `
      <div class="asg-tc-detail-box" style="border-left:4px solid #f59e0b; background:rgba(245, 158, 11, 0.04)">
        <div class="asg-tc-detail-box-title" style="color:#d97706">
          <span>⚪ Tình Trạng Phân Công: Chưa Giao Việc</span>
        </div>
        <div style="font-size:12.5px; color:var(--text-muted)">
          Kịch bản kiểm thử này chưa được phân bổ cho Tester nào. Bạn có thể bấm nút "Giao ngay cho Tester đang chọn" ở góc dưới để phân công trực tiếp.
        </div>
      </div>
    `;
  }

  const expFormatted = Array.isArray(tc.expected) ? tc.expected.join('<br/>') : (tc.expected || 'Chưa định nghĩa kết quả kỳ vọng.');
  const stepsList = tc.steps && Array.isArray(tc.steps) && tc.steps.length > 0
    ? tc.steps.map((s, idx) => `<div style="padding:4px 0; border-bottom:1px dashed var(--border-light)"><strong>Bước ${idx+1}:</strong> ${s}</div>`).join('')
    : (tc.description ? `<div>${tc.description}</div>` : `<div style="color:var(--text-muted)">Thực hiện theo quy trình chuẩn của phân hệ ${modName}.</div>`);

  if (bodyEl) {
    bodyEl.innerHTML = `
      <!-- Status Pill Row -->
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px">
        <span class="badge badge-outline" style="font-family:monospace; font-weight:800; font-size:12px; color:#2563eb">[${tc.id}]</span>
        ${prioBadgeHtml}
        <span class="badge badge-nr">${modName}</span>
        ${tc.platform ? `<span class="badge" style="background:#e0e7ff; color:#3730a3">💻 ${tc.platform}</span>` : ''}
      </div>

      <!-- Assignment Status Box -->
      ${asgSectionHtml}

      <!-- Objective & Description Box -->
      <div class="asg-tc-detail-box">
        <div class="asg-tc-detail-box-title">
          <span>🎯 Mục Tiêu & Nhiệm Vụ Kiểm Thử</span>
        </div>
        <div style="font-size:13px; line-height:1.5; color:var(--text-primary); font-weight:600">
          ${tc.name}
        </div>
        ${tc.description && tc.description !== tc.name ? `
          <div style="font-size:12.5px; line-height:1.5; color:var(--text-muted); margin-top:6px">
            ${tc.description}
          </div>
        ` : ''}
      </div>

      <!-- Precondition & Test Data Row -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px">
        <div class="asg-tc-detail-box">
          <div class="asg-tc-detail-box-title">
            <span>⚙️ Điều Kiện Tiên Quyết (Preconditions)</span>
          </div>
          <div style="font-size:12px; line-height:1.4; color:var(--text-primary)">
            ${tc.precondition || 'Môi trường hệ thống sẵn sàng, cơ sở dữ liệu đã đồng bộ, cán bộ đã đăng nhập ca trực hợp lệ.'}
          </div>
        </div>

        <div class="asg-tc-detail-box">
          <div class="asg-tc-detail-box-title">
            <span>📊 Dữ Liệu Thử Nghiệm (Test Data)</span>
          </div>
          <div style="font-size:12px; line-height:1.4; color:var(--text-primary); font-family:monospace">
            ${tc.testData || 'Sử dụng dữ liệu khách mẫu, số thẻ RFID chuẩn, CCCD gắn chip hợp lệ.'}
          </div>
        </div>
      </div>

      <!-- Test Steps -->
      <div class="asg-tc-detail-box">
        <div class="asg-tc-detail-box-title">
          <span>📝 Các Bước Thực Hiện Kiểm Thử</span>
        </div>
        <div style="font-size:12px; line-height:1.5; color:var(--text-primary)">
          ${stepsList}
        </div>
      </div>

      <!-- Expected Outcome Box -->
      <div class="asg-tc-detail-box" style="border:1.5px solid #86efac; background:rgba(34, 197, 94, 0.05)">
        <div class="asg-tc-detail-box-title" style="color:#15803d">
          <span>✅ Kết Quả Kỳ Vọng Của Hệ Thống (Expected Results)</span>
        </div>
        <div style="font-size:12.5px; line-height:1.5; color:#166534; font-weight:600">
          ${expFormatted}
        </div>
      </div>
    `;
  }

  if (footerLeftEl) {
    if (asg) {
      footerLeftEl.innerHTML = `
        <button type="button" class="btn btn-outline admin-only" onclick="cancelAssignmentForTc('${tc.id}'); closeModal('modal-asg-tc-detail');" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.4); font-size:12px; font-weight:700">
          🗑️ Hủy phân công kịch bản này
        </button>
      `;
    } else {
      const targetSel = document.getElementById('detail-assignee');
      const targetUser = targetSel ? targetSel.options[targetSel.selectedIndex]?.text : 'Tester';
      footerLeftEl.innerHTML = `
        <button type="button" class="btn btn-primary" onclick="quickAssignSingleTcToCurrent('${tc.id}'); closeModal('modal-asg-tc-detail');" style="font-weight:700; font-size:12px">
          🚀 Giao ngay cho ${targetUser.split('(')[0].trim()}
        </button>
      `;
    }
  }

  openModal('modal-asg-tc-detail');
}

function quickAssignSingleTcToCurrent(tcId) {
  const p = getActiveProject();
  if (!p) return;
  const username = document.getElementById('detail-assignee')?.value;
  const dueDate = document.getElementById('detail-due-date')?.value;
  if (!username || !dueDate) {
    showToast('⚠️ Vui lòng chọn Tester và Hạn chót trước khi giao việc!', 'error');
    return;
  }
  treeSelectedTcIds.clear();
  treeSelectedTcIds.add(tcId);
  confirmDetailedDispatch();
}

function toggleModuleSelection(moduleId, isChecked) {
  const p = getActiveProject();
  if (!p) return;
  const modTcs = (p.testCases || []).filter(tc => tc.module === moduleId);
  modTcs.forEach(tc => {
    if (isChecked) treeSelectedTcIds.add(tc.id);
    else treeSelectedTcIds.delete(tc.id);
  });
  renderAsgModuleList();
  if (state.asgActiveModuleId === moduleId) {
    renderAsgTcTable();
  }
  updateDetailDockSummary();
}

function toggleSelectAllActiveModule(isChecked) {
  if (state.asgActiveModuleId) {
    toggleModuleSelection(state.asgActiveModuleId, isChecked);
  }
}

function toggleTcSelection(tcId, moduleId, isChecked) {
  if (isChecked) treeSelectedTcIds.add(tcId);
  else treeSelectedTcIds.delete(tcId);
  renderAsgModuleList();
  renderAsgTcTable();
  updateDetailDockSummary();
}

function batchSelectInActiveModule(type) {
  const p = getActiveProject();
  if (!p) return;
  const allTcs = p.testCases || [];
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id);
  const asgMap = new Map();
  assignments.forEach(a => asgMap.set(a.tcId, a));

  const currModTcs = allTcs.filter(tc => tc.module === state.asgActiveModuleId);

  if (type === 'NONE') {
    treeSelectedTcIds.clear();
  } else if (type === 'ALL') {
    currModTcs.forEach(tc => treeSelectedTcIds.add(tc.id));
  } else if (type === 'P1') {
    currModTcs.forEach(tc => {
      if (tc.priority === 'P1') treeSelectedTcIds.add(tc.id);
    });
  } else if (type === 'UNASSIGNED') {
    currModTcs.forEach(tc => {
      if (!asgMap.has(tc.id)) treeSelectedTcIds.add(tc.id);
    });
  } else if (type === 'ALL_PROJECT') {
    allTcs.forEach(tc => treeSelectedTcIds.add(tc.id));
  }

  renderAsgModuleList();
  renderAsgTcTable();
  updateDetailDockSummary();
}

function updateDetailDockSummary() {
  const p = getActiveProject();
  const count = treeSelectedTcIds.size;
  const badge = document.getElementById('detail-selection-badge');
  const btn = document.getElementById('detail-submit-btn');

  if (!p) return;

  let wholeModCount = 0;
  let partialModCount = 0;

  (p.modules || []).forEach(m => {
    const modTcs = (p.testCases || []).filter(tc => tc.module === m.id);
    if (modTcs.length === 0) return;
    const selectedCount = modTcs.filter(tc => treeSelectedTcIds.has(tc.id)).length;
    if (selectedCount === modTcs.length) {
      wholeModCount++;
    } else if (selectedCount > 0) {
      partialModCount += selectedCount;
    }
  });

  if (badge) {
    if (count === 0) {
      badge.textContent = `0 kịch bản đã chọn`;
      badge.className = 'badge badge-outline';
    } else {
      let desc = '';
      if (wholeModCount > 0 && partialModCount > 0) {
        desc = `Đã chọn: ${wholeModCount} Phân hệ trọn vẹn + ${partialModCount} kịch bản lẻ (Tổng ${count} bài)`;
      } else if (wholeModCount > 0) {
        desc = `Đã chọn: ${wholeModCount} Phân hệ trọn vẹn (Tổng ${count} bài)`;
      } else {
        desc = `Đã chọn: ${count} kịch bản lẻ`;
      }
      badge.textContent = desc;
      badge.className = 'badge badge-pass';
    }
  }

  if (btn) {
    const assigneeVal = document.getElementById('detail-assignee')?.value;
    const user = (state.usersList || []).find(u => u.username === assigneeVal);
    const shortName = user ? user.name.split('(')[0].trim() : 'Tester';

    if (count > 0) {
      btn.innerHTML = `🚀 Giao (${count}) Kịch Bản Cho [${shortName}]`;
      btn.removeAttribute('disabled');
      btn.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.4)';
    } else {
      btn.innerHTML = `🚀 Giao Kịch Bản Đang Chọn`;
      btn.setAttribute('disabled', 'true');
      btn.style.boxShadow = 'none';
    }
  }
}

function confirmDetailedDispatch() {
  const p = getActiveProject();
  if (!p) return;

  const username = document.getElementById('detail-assignee')?.value;
  const startDate = document.getElementById('detail-start-date')?.value;
  const dueDate = document.getElementById('detail-due-date')?.value;
  const notes = document.getElementById('detail-notes')?.value.trim();

  if (!username || !dueDate) {
    showToast('⚠️ Vui lòng chọn Tester và Hạn chót hoàn thành!', 'error');
    return;
  }

  if (treeSelectedTcIds.size === 0) {
    showToast('⚠️ Vui lòng tích chọn ít nhất 1 kịch bản hoặc phân hệ để giao việc!', 'error');
    return;
  }

  const user = (state.usersList || []).find(u => u.username === username);
  const userName = user ? user.name : username;

  initAssignments();

  let count = 0;
  treeSelectedTcIds.forEach(tcId => {
    const tc = (p.testCases || []).find(t => t.id === tcId);
    const existingIndex = state.assignments.findIndex(a => a.projectId === p.id && a.tcId === tcId);
    if (existingIndex >= 0) {
      state.assignments[existingIndex].assigneeUsername = username;
      state.assignments[existingIndex].assigneeName = userName;
      state.assignments[existingIndex].dueDate = dueDate;
      if (startDate) state.assignments[existingIndex].startDate = startDate;
      if (notes) state.assignments[existingIndex].notes = notes;
      state.assignments[existingIndex].status = 'PENDING';
    } else {
      state.assignments.unshift({
        id: 'asg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        projectId: p.id,
        version: p.activeVersion || 'v1.0',
        tcId,
        assigneeUsername: username,
        assigneeName: userName,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        dueDate,
        status: 'PENDING',
        notes: notes || (tc ? `Kiểm thử kịch bản ${tc.id}: ${tc.name}` : ''),
        priority: tc ? tc.priority : 'P2',
        module: tc ? tc.module : (state.asgActiveModuleId || 'M01'),
        assignedBy: state.currentUser ? state.currentUser.name : 'Admin',
        assignedAt: new Date().toISOString()
      });
    }
    count++;
  });

  saveAssignments();
  treeSelectedTcIds.clear();
  renderAsgDetailTab();
  updateMyTasksBadge();
  showToast(`🎉 Đã giao thành công ${count} kịch bản cho ${userName}!`, 'success');
}

function quickAssignSingleTc(tcId, testerUsername) {
  if (!testerUsername) return;
  const p = getActiveProject();
  if (!p) return;

  const user = (state.usersList || []).find(u => u.username === testerUsername);
  const tc = (p.testCases || []).find(t => t.id === tcId);
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  initAssignments();
  const existingIndex = state.assignments.findIndex(a => a.projectId === p.id && a.tcId === tcId);
  if (existingIndex >= 0) {
    state.assignments[existingIndex].assigneeUsername = testerUsername;
    state.assignments[existingIndex].assigneeName = user ? user.name : testerUsername;
    state.assignments[existingIndex].status = 'PENDING';
  } else {
    state.assignments.unshift({
      id: 'asg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      projectId: p.id,
      version: p.activeVersion || 'v1.0',
      tcId,
      assigneeUsername: testerUsername,
      assigneeName: user ? user.name : testerUsername,
      startDate: today,
      dueDate,
      status: 'PENDING',
      notes: tc ? `Kiểm thử kịch bản ${tc.id}: ${tc.name}` : '',
      priority: tc ? tc.priority : 'P2',
      module: tc ? tc.module : 'M01',
      assignedBy: state.currentUser ? state.currentUser.name : 'Admin',
      assignedAt: new Date().toISOString()
    });
  }

  saveAssignments();
  if (state.asgCurrentTab === 'detail') {
    renderAsgDetailTab();
  } else {
    renderAsgOverviewTab();
  }
  updateMyTasksBadge();
  showToast(`✅ Đã gán bài test [${tcId}] cho ${user ? user.name : testerUsername}!`, 'success');
}

function cancelAssignmentForTc(tcId) {
  const p = getActiveProject();
  if (!p) return;
  if (!confirm(`Bạn có chắc chắn muốn hủy phân công kịch bản ${tcId}?`)) return;

  initAssignments();
  state.assignments = state.assignments.filter(a => !(a.projectId === p.id && a.tcId === tcId));
  saveAssignments();
  treeSelectedTcIds.delete(tcId);
  if (state.asgCurrentTab === 'detail') {
    renderAsgDetailTab();
  } else {
    renderAsgOverviewTab();
  }
  updateMyTasksBadge();
  showToast(`🗑️ Đã hủy phân công kịch bản [${tcId}]!`, 'info');
}

function revokeAllTesterAssignments(username) {
  const p = getActiveProject();
  if (!p) return;
  const user = (state.usersList || []).find(u => u.username === username);
  const name = user ? user.name : username;
  if (!confirm(`Bạn có chắc chắn muốn THU HỒI TOÀN BỘ kịch bản đã giao cho [${name}] trong dự án này?`)) return;

  initAssignments();
  state.assignments = state.assignments.filter(a => !(a.projectId === p.id && a.assigneeUsername === username));
  saveAssignments();
  if (state.asgCurrentTab === 'detail') {
    renderAsgDetailTab();
  } else {
    renderAsgOverviewTab();
  }
  updateMyTasksBadge();
  showToast(`🗑️ Đã thu hồi toàn bộ kịch bản của ${name}!`, 'info');
}

function filterAssignmentsStatus(status) {
  switchAsgMainTab('overview');
}

function deleteAssignment(taskId) {
  if (!confirm('Bạn có chắc chắn muốn hủy giao việc này?')) return;
  initAssignments();
  state.assignments = state.assignments.filter(a => a.id !== taskId);
  saveAssignments();
  if (state.asgCurrentTab === 'detail') {
    renderAsgDetailTab();
  } else {
    renderAsgOverviewTab();
  }
  updateMyTasksBadge();
  showToast('🗑️ Đã hủy giao việc thành công!', 'info');
}

function openAssignTaskModal(preSelectedModuleId = '') {
  navigate('assignments');
  switchAsgMainTab('detail');
  if (preSelectedModuleId) {
    selectModuleInDetail(preSelectedModuleId);
  }
}

function openBulkAssignModal(preSelectedModuleId = '') {
  navigate('assignments');
  switchAsgMainTab('detail');
  if (preSelectedModuleId) {
    toggleModuleSelection(preSelectedModuleId, true);
    selectModuleInDetail(preSelectedModuleId);
  }
}

// ================================================================
// GÓC NHÌN "VIỆC CỦA TÔI" (MY TASKS FOR TESTERS)
// ================================================================
function updateMyTasksBadge() {
  const badge = document.getElementById('badge-mytasks');
  if (!badge) return;
  // QA Lead (Admin) and Dev never do testing tasks, so hide badge
  if (!state.currentUser || state.currentUser.role !== 'tester') {
    badge.textContent = '0';
    badge.style.display = 'none';
    return;
  }
  const username = state.currentUser.username;
  initAssignments();
  const myPending = (state.assignments || []).filter(a => 
    a.assigneeUsername === username && 
    a.status !== 'DONE' && a.status !== 'PASSED'
  );
  badge.textContent = myPending.length;
  badge.style.display = myPending.length > 0 ? 'inline-block' : 'none';
}

function renderMyTasksPage() {
  initAssignments();
  const username = state.currentUser ? state.currentUser.username : '';
  const isSuper = state.currentUser && state.currentUser.role === 'admin';

  if (isSuper) {
    // Admin is QA Lead: show clear guidance that Admin oversees instead of executing individual test cases
    const container = document.getElementById('mytasks-card-container');
    if (container) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding: 48px 24px; border: 2px dashed var(--border);">
          <div style="font-size:48px; margin-bottom:12px;">👑</div>
          <h3 style="font-size:18px; font-weight:700; margin-bottom:8px;">Không gian của Kiểm thử viên (Tester Workspace)</h3>
          <p style="color:var(--text-muted); font-size:14px; max-width:560px; margin:0 auto 20px; line-height:1.6">
            Bạn đang đăng nhập với vai trò <strong>Quản lý QA (QA Lead / Admin)</strong>. Tài khoản Quản lý không trực tiếp thực thi kịch bản kiểm thử lẻ mà có nhiệm vụ giám sát tổng quan, phân công và nghiệm thu kịch bản của các Tester.
          </p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap">
            <button class="btn btn-primary" onclick="navigate('assignments')">📌 Đến mục Giao việc & Hạn chót</button>
            <button class="btn btn-outline" onclick="navigate('dashboard')">📊 Về Dashboard Doanh nghiệp</button>
          </div>
        </div>
      `;
    }
    const statPending = document.getElementById('mytask-stat-pending');
    if (statPending) statPending.textContent = '0';
    const statDone = document.getElementById('mytask-stat-done');
    if (statDone) statDone.textContent = '0';
    const statOverdue = document.getElementById('mytask-stat-overdue');
    if (statOverdue) statOverdue.textContent = '0';
    return;
  }

  const subEl = document.getElementById('mytasks-user-subtitle');
  if (subEl) subEl.textContent = `Đang đăng nhập: ${state.currentUser ? state.currentUser.name : 'Tester'} (${username})`;

  // Filter My Tasks
  const filterProj = document.getElementById('mytask-filter-project')?.value || '';
  const filterDl = document.getElementById('mytask-filter-deadline')?.value || '';

  // Populate projects filter for my tasks
  const projSel = document.getElementById('mytask-filter-project');
  if (projSel && projSel.options.length <= 1) {
    (state.projects || []).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      projSel.appendChild(opt);
    });
  }

  const allMyTasks = (state.assignments || []).filter(a => a.assigneeUsername === username);

  // Update Stats
  let doneCount = 0;
  let remainCount = 0;
  let overdueCount = 0;

  allMyTasks.forEach(t => {
    const ds = getTaskDeadlineStatus(t);
    if (t.status === 'DONE' || t.status === 'PASSED' || t.status === 'FAILED') {
      doneCount++;
    } else {
      remainCount++;
      if (ds.isOverdue) overdueCount++;
    }
  });

  const statTotal = document.getElementById('mytask-stat-total');
  if (statTotal) statTotal.textContent = allMyTasks.length;
  const statDone = document.getElementById('mytask-stat-done');
  if (statDone) statDone.textContent = doneCount;
  const statRemain = document.getElementById('mytask-stat-remain');
  if (statRemain) statRemain.textContent = remainCount;
  const statOverdue = document.getElementById('mytask-stat-overdue');
  if (statOverdue) statOverdue.textContent = overdueCount;

  const displayTasks = allMyTasks.filter(t => {
    if (filterProj && t.projectId !== filterProj) return false;
    const ds = getTaskDeadlineStatus(t);
    if (filterDl === 'OVERDUE' && !ds.isOverdue) return false;
    if (filterDl === 'PENDING' && (t.status === 'DONE' || t.status === 'PASSED')) return false;
    if (filterDl === 'DONE' && t.status !== 'DONE' && t.status !== 'PASSED') return false;
    return true;
  });

  const tbody = document.getElementById('mytasks-table-body');
  if (!tbody) return;

  const projMap = new Map((state.projects || []).map(p => [p.id, p]));

  if (displayTasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted)">🎉 Bạn không có bài kiểm tra nào cần làm trong mục này!</td></tr>';
    return;
  }

  currentTaskQueue = displayTasks;
  tbody.innerHTML = displayTasks.map((t, idx) => {
    const p = projMap.get(t.projectId);
    const ds = getTaskDeadlineStatus(t);
    const allTcs = (p && p.testCases) || getAllTcs();
    const tc = allTcs.find(x => x.id === t.tcId);
    const tcTitle = tc ? tc.name : t.tcId;
    const priority = tc ? tc.priority : 'P2';
    const isDone = t.status === 'DONE' || t.status === 'PASSED';

    return `
      <tr style="${ds.isOverdue && !isDone ? 'background:rgba(239, 68, 68, 0.05)' : ''}">
        <td><strong class="clickable-badge" onclick="jumpToTestCase('${t.tcId}', '${t.projectId}')" title="Bấm để xem kịch bản">${t.tcId} 🔗</strong></td>
        <td><span class="module-tag" style="font-size:11px">${p ? p.code : t.projectId}</span></td>
        <td>
          <div style="font-weight:600; font-size:13px">${tcTitle}</div>
          <div style="font-size:11px; color:var(--text-muted)">📝 ${t.notes || 'Không có ghi chú'}</div>
        </td>
        <td><span class="badge badge-${priority.toLowerCase()}">${priority}</span></td>
        <td>
          <div><strong>${t.dueDate || 'Chưa định'}</strong></div>
          <span class="badge ${ds.badgeClass}" style="font-size:10px">${ds.label}</span>
        </td>
        <td>
          <span class="badge ${t.status === 'PASSED' ? 'badge-pass' : t.status === 'FAILED' ? 'badge-fail' : 'badge-nr'}">
            ${t.status === 'PASSED' ? '✅ Đã Đạt' : t.status === 'FAILED' ? '❌ Bị Lỗi' : '⏳ Chưa kiểm tra'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="currentTaskIndex = ${idx}; openQuickTestModal('${t.tcId}', '${t.id}', '${t.projectId}')">
            ${isDone ? '🔄 Kiểm tra lại' : '▶️ Kiểm tra ngay'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openQuickTestModal(tcId, taskId, projectId) {
  const p = (state.projects || []).find(x => x.id === projectId) || getActiveProject();
  const allTcs = (p && p.testCases) || getAllTcs();
  const tc = allTcs.find(x => x.id === tcId);

  document.getElementById('qe-tc-id').value = tcId;
  document.getElementById('qe-task-id').value = taskId;
  document.getElementById('qe-title').textContent = `Kiểm tra: [${tcId}] ${tc ? tc.name : ''}`;

  const infoBox = document.getElementById('qe-info-box');
  if (infoBox && tc) {
    infoBox.innerHTML = `
      <div style="margin-bottom:6px"><strong>Mục đích:</strong> ${tc.name}</div>
      <div style="margin-bottom:6px"><strong>Điều kiện cần:</strong> ${tc.precondition || 'Không có'}</div>
      <div style="margin-bottom:6px"><strong>Các bước làm:</strong></div>
      <ol style="margin:0; padding-left:18px; line-height:1.5">
        ${(tc.steps || []).map(s => `<li>${s}</li>`).join('')}
      </ol>
      <div style="margin-top:6px; color:#10b981"><strong>Kết quả mong đợi:</strong> ${Array.isArray(tc.expected) ? tc.expected.join('; ') : tc.expected}</div>
    `;
  }

  // Current result if any
  const r = state.results[tcId];
  if (r) {
    const radio = document.querySelector(`input[name="qe-status"][value="${r.status}"]`);
    if (radio) radio.checked = true;
    document.getElementById('qe-notes').value = r.notes || '';
  } else {
    document.querySelector('input[name="qe-status"][value="Pass"]').checked = true;
    document.getElementById('qe-notes').value = '';
  }

  openModal('modal-quick-exec');
}

function confirmQuickExecution() {
  const tcId = document.getElementById('qe-tc-id').value;
  const taskId = document.getElementById('qe-task-id').value;
  const status = document.querySelector('input[name="qe-status"]:checked')?.value || 'Pass';
  const notes = document.getElementById('qe-notes').value.trim();

  if (!tcId) return;

  // 1. Update Project results
  if (!state.results[tcId]) state.results[tcId] = {};
  state.results[tcId].status = status;
  state.results[tcId].tester = state.currentUser ? state.currentUser.name : 'Tester';
  state.results[tcId].notes = notes;
  state.results[tcId].runAt = new Date().toISOString();

  // 2. Update Assignment Task status
  initAssignments();
  const task = state.assignments.find(a => a.id === taskId || (a.tcId === tcId && a.assigneeUsername === state.currentUser?.username));
  if (task) {
    task.status = status === 'Pass' ? 'PASSED' : status === 'Fail' ? 'FAILED' : 'SKIPPED';
    saveAssignments();
  }

  saveState();
  closeModal('modal-quick-exec');
  renderMyTasksPage();
  updateMyTasksBadge();
  showToast(`✅ Đã lưu kết quả bài test ${tcId}: ${status.toUpperCase()}!`, 'success');
  // Auto advance to next task if in queue
  if (currentTaskQueue && currentTaskIndex >= 0 && currentTaskIndex < currentTaskQueue.length - 1) {
    openNextQuickTask();
  }
}

// ================================================================
// HỆ THỐNG THỐNG KÊ & BÁO CÁO 4 CHIỀU (ANALYTICS & REPORTING)
// ================================================================
function switchReportTab(subtab) {
  document.querySelectorAll('#page-report .settings-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
  });
  document.querySelectorAll('#page-report .settings-tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-pane-${subtab}`);
  });
}

function renderAnalyticsPage() {
  initAssignments();
  initUsersList();

  // 1. Pane 1: Theo Dự án
  const rptProjBody = document.getElementById('rpt-projects-summary-body');
  if (rptProjBody) {
    rptProjBody.innerHTML = (state.projects || []).map(p => {
      const allTcs = p.testCases || [];
      const pResults = (p.runResults && p.runs && p.runs[0] && p.runResults[p.runs[0].id]) || (p.id === state.currentProjectId ? state.results : {});
      let passed = 0;
      let failed = 0;
      allTcs.forEach(tc => {
        const r = pResults[tc.id];
        if (r && r.status === 'Pass') passed++;
        else if (r && r.status === 'Fail') failed++;
      });
      const untested = allTcs.length - passed - failed;
      const pct = allTcs.length > 0 ? Math.round((passed / allTcs.length) * 100) : 0;

      return `
        <tr>
          <td><strong>${p.name}</strong> <span class="module-tag">${p.code}</span></td>
          <td><code>${p.activeVersion}</code></td>
          <td><strong>${allTcs.length}</strong></td>
          <td style="color:#10b981; font-weight:700">${passed}</td>
          <td style="color:#ef4444; font-weight:700">${failed}</td>
          <td style="color:var(--text-muted)">${untested}</td>
          <td style="width:160px">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px"><span>${pct}%</span></div>
            <div class="progress-bar-wrapper" style="height:6px"><div class="progress-bar" style="width:${pct}%; background:${pct >= 80 ? '#10b981' : '#3b82f6'}"></div></div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Pane 2: Theo Tester
  const rptTesterBody = document.getElementById('rpt-testers-summary-body');
  if (rptTesterBody) {
    const testers = (state.usersList || []).filter(u => u.role === 'tester');
    const tasks = state.assignments || [];

    rptTesterBody.innerHTML = testers.map(u => {
      const myTasks = tasks.filter(t => t.assigneeUsername === u.username);
      let done = 0;
      let overdue = 0;
      let bugs = 0;

      myTasks.forEach(t => {
        const ds = getTaskDeadlineStatus(t);
        if (t.status === 'DONE' || t.status === 'PASSED') done++;
        else if (t.status === 'FAILED') { done++; bugs++; }
        else if (ds.isOverdue) overdue++;
      });

      const remain = myTasks.length - done;
      const pct = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;

      return `
        <tr>
          <td>
            <strong>${u.name}</strong>
            <div style="font-size:12px; color:var(--text-muted)">@${u.username}</div>
          </td>
          <td><strong>${myTasks.length}</strong> bài</td>
          <td style="color:#10b981; font-weight:700">${done}</td>
          <td style="color:var(--text-muted)">${remain}</td>
          <td style="color:${overdue > 0 ? '#ef4444' : 'var(--text-muted)'}; font-weight:${overdue > 0 ? '700' : 'normal'}">
            ${overdue > 0 ? `<span class="clickable-badge" onclick="jumpToOverdueAssignments('${u.username}')" title="Bấm xem các bài trễ hạn">⚠️ ${overdue}</span>` : '0'}
          </td>
          <td style="color:#ef4444; font-weight:700">${bugs}</td>
          <td style="width:160px">
            <div style="font-size:12px; margin-bottom:4px">${pct}%</div>
            <div class="progress-bar-wrapper" style="height:6px"><div class="progress-bar" style="width:${pct}%; background:#10b981"></div></div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 3. Pane 3: Theo Kịch bản bị lỗi
  const rptFailedBody = document.getElementById('rpt-failed-tcs-body');
  if (rptFailedBody) {
    const failedList = [];
    (state.projects || []).forEach(p => {
      const pResults = (p.id === state.currentProjectId ? state.results : (p.runResults && p.runs && p.runs[0] && p.runResults[p.runs[0].id])) || {};
      (p.testCases || []).forEach(tc => {
        const r = pResults[tc.id];
        if (r && r.status === 'Fail') {
          failedList.push({
            project: p.code,
            tcId: tc.id,
            name: tc.name,
            reason: r.notes || r.failReason || 'Chưa ghi chú cụ thể',
            tester: r.tester || 'Tester',
            runAt: r.runAt ? new Date(r.runAt).toLocaleDateString('vi-VN') : 'Mới đây'
          });
        }
      });
    });

    if (failedList.length === 0) {
      rptFailedBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#10b981">🎉 Hiện tại không có bài test nào bị LỖI (Fail)!</td></tr>';
    } else {
      rptFailedBody.innerHTML = failedList.map(f => `
        <tr>
          <td><strong class="clickable-badge" style="color:#ef4444" onclick="jumpToExecuteCase('${f.tcId}', '${f.project}')" title="Bấm để mở kiểm tra/sửa lỗi">${f.tcId} ↗</strong></td>
          <td><span class="module-tag">${f.project}</span></td>
          <td><strong>${f.name}</strong></td>
          <td style="color:#ef4444">${f.reason}</td>
          <td>${f.tester}</td>
          <td>${f.runAt}</td>
        </tr>
      `).join('');
    }
  }

  // 4. Pane 4: Theo Tiến độ & Hạn chót
  const rptDeadlinesBody = document.getElementById('rpt-deadlines-body');
  if (rptDeadlinesBody) {
    const sortedTasks = [...(state.assignments || [])].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
    rptDeadlinesBody.innerHTML = sortedTasks.map(t => {
      const ds = getTaskDeadlineStatus(t);
      const isDone = t.status === 'DONE' || t.status === 'PASSED';
      return `
        <tr style="${ds.isOverdue && !isDone ? 'background:rgba(239, 68, 68, 0.05)' : ''}">
          <td><strong>${t.tcId}</strong></td>
          <td><span class="module-tag">${t.projectId}</span></td>
          <td>${t.assigneeName.split('(')[0]}</td>
          <td><strong>${t.dueDate || 'Chưa định'}</strong></td>
          <td><span class="badge ${ds.badgeClass}">${ds.label}</span></td>
          <td>
            <span class="badge ${isDone ? 'badge-pass' : ds.isOverdue ? 'badge-fail' : 'badge-nr'}">
              ${isDone ? 'Đã xong' : ds.isOverdue ? 'TRỄ HẠN' : 'Đang làm'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
}


// ================================================================
// TƯƠNG TÁC LIỀN MẠCH GIỮA CÁC MODULE (SEAMLESS WORKFLOWS)
// ================================================================

// 1. Drill-down từ Dashboard sang Test Cases
function drillDownToTestCases(statusFilter, moduleFilter) {
  navigate('testcases');
  const statusSel = document.getElementById('filter-status');
  if (statusSel && statusFilter !== undefined) {
    statusSel.value = statusFilter;
  }
  const modSel = document.getElementById('filter-module');
  if (modSel && moduleFilter !== undefined) {
    modSel.value = moduleFilter;
  }
  applyFilters();
}

// 2. Chuyển sang xem kịch bản cụ thể bên tab Test Cases
function jumpToTestCase(tcId, projectId) {
  if (projectId && projectId !== state.currentProjectId) {
    switchProject(projectId);
  }
  navigate('testcases');
  const searchInput = document.getElementById('filter-search');
  if (searchInput) {
    searchInput.value = tcId;
    applyFilters();
  }
}

// 3. Chuyển sang thực thi trực tiếp bài test bên tab Execute
function jumpToExecuteCase(tcId, projectId) {
  if (projectId && projectId !== state.currentProjectId) {
    switchProject(projectId);
  }
  navigate('execute');
  selectTcForExec(tcId);
}

// 4. Lọc việc của nhân viên bên tab Giao việc
function jumpToUserAssignments(username, projectId) {
  navigate('assignments');
  const testerSel = document.getElementById('asg-filter-tester');
  if (testerSel) testerSel.value = username;
  const projSel = document.getElementById('asg-filter-project');
  if (projSel && projectId) projSel.value = projectId;
  renderAssignmentsPage();
}

// 5. Lọc các bài quá hạn bên tab Giao việc
function jumpToOverdueAssignments(username) {
  navigate('assignments');
  const statusSel = document.getElementById('asg-filter-status');
  if (statusSel) statusSel.value = 'OVERDUE';
  if (username) {
    const testerSel = document.getElementById('asg-filter-tester');
    if (testerSel) testerSel.value = username;
  }
  renderAssignmentsPage();
}

// 6. Làm tiếp bài tiếp theo ngay trong popup Kiểm tra nhanh
let currentTaskQueue = [];
let currentTaskIndex = -1;

function openNextQuickTask() {
  if (!currentTaskQueue || currentTaskQueue.length === 0) {
    closeModal('modal-quick-exec');
    return;
  }
  currentTaskIndex++;
  if (currentTaskIndex >= currentTaskQueue.length) {
    closeModal('modal-quick-exec');
    showToast('🎉 Bạn đã kiểm tra hết danh sách bài được giao!', 'success');
    renderMyTasksPage();
    return;
  }
  const nextTask = currentTaskQueue[currentTaskIndex];
  openQuickTestModal(nextTask.tcId, nextTask.id, nextTask.projectId);
}


function filterAssignmentsStatus(status) {
  const statusSel = document.getElementById('asg-filter-status');
  if (statusSel) {
    statusSel.value = status;
    renderAssignmentsPage();
  }
}

function filterMyTasksDeadline(status) {
  const deadSel = document.getElementById('mytask-filter-deadline');
  if (deadSel) {
    deadSel.value = status;
    renderMyTasksPage();
  }
}


// ================================================================
// SYSTEM DATA MANAGEMENT: FRESH START & DEMO DATA
// ================================================================
function loadSampleDemoProjects() {
  const vmsCatalog = (typeof window !== 'undefined' && window.SMARTVMS_DEFAULT_CATALOG) || { modules: [], testCases: [] };
  const parkCatalog = (typeof ENTERPRISE_MANIFEST !== 'undefined' && ENTERPRISE_MANIFEST.catalogs && ENTERPRISE_MANIFEST.catalogs['PRJ-SMARTPARK']) || { modules: [], testCases: [] };

  state.projects = [
    {
      id: 'PRJ-SMARTVMS',
      code: 'SMARTVMS',
      name: 'SmartVMS — Quản lý Khách & Ra vào',
      domain: 'An ninh Trụ sở & Cơ quan Hành chính',
      lead: 'Nguyễn Văn Huy (Project Manager)',
      standards: ['ISO 9001:2015', 'ISO/IEC/IEEE 29119', 'ISO/IEC 25010:2023'],
      activeVersion: 'v2.0',
      versions: [
        { version: 'v2.0', label: 'v2.0-SingleSite 2026', status: 'IN_QA', targetDate: '2026-10-30', changelog: 'Phiên bản Offline Standalone cho trụ sở đơn lẻ (204 TCs, 12 Modules)' },
        { version: 'v2.1', label: 'v2.1-MultiSite Cloud Sync', status: 'IN_DEV', targetDate: '2026-12-15', changelog: 'Đồng bộ tập trung đa trạm gác qua Cloud API' }
      ],
      modules: vmsCatalog.modules || [],
      testCases: vmsCatalog.testCases || [],
      runs: [
        { id: 'run_001', name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện', targetVersion: 'v2.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'QA Lead', createdAt: new Date().toISOString() }
      ],
      runResults: {}
    },
    {
      id: 'PRJ-SMARTPARK',
      code: 'SMARTPARK',
      name: 'SmartParking — Quản lý Bãi xe & ANPR',
      domain: 'Giao thông Thông minh (ITS & Smart Parking)',
      lead: 'Trần Quốc Tuấn (Technical Lead)',
      standards: ['ISO 9001:2015', 'TCVN 13607:2023', 'ISO/IEC 25010'],
      activeVersion: 'v1.2.0',
      versions: [
        { version: 'v1.2.0', label: 'v1.2.0-ANPR AutoBarrier', status: 'IN_QA', targetDate: '2026-11-10', changelog: 'Tích hợp nhận diện biển số tự động LPR' }
      ],
      modules: parkCatalog.modules || [],
      testCases: parkCatalog.testCases || [],
      runs: [
        { id: 'run_park_01', name: 'Đợt 1 — Thử nghiệm Làn vào & Barie', targetVersion: 'v1.2.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'Trần Quốc Tuấn', createdAt: new Date().toISOString() }
      ],
      runResults: {}
    }
  ];
  state.currentProjectId = 'PRJ-SMARTVMS';
  saveEnterpriseProjects();
  syncActiveProjectContext();

  // Tạo phân công kiểm thử mẫu cho các Tester và Lead theo dõi đôn đốc
  const now = new Date();
  const dOverdue = new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const dSoon = new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const dLater = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

  state.assignments = [
    { id: 'asg-01', projectId: 'PRJ-SMARTVMS', tcId: 'TC-AUTH-001', assigneeUsername: 'tester', assigneeName: 'Nguyễn Văn Huy (Tester)', assignedBy: 'Admin', startDate: now.toISOString().slice(0, 10), dueDate: dSoon, status: 'PASSED', priority: 'P1', module: 'M01', notes: 'Kiểm tra đăng nhập hợp lệ', createdAt: now.toISOString() },
    { id: 'asg-02', projectId: 'PRJ-SMARTVMS', tcId: 'TC-AUTH-002', assigneeUsername: 'tester', assigneeName: 'Nguyễn Văn Huy (Tester)', assignedBy: 'Admin', startDate: now.toISOString().slice(0, 10), dueDate: dSoon, status: 'PENDING', priority: 'P1', module: 'M01', notes: 'Kiểm tra phân biệt hoa thường', createdAt: now.toISOString() },
    { id: 'asg-03', projectId: 'PRJ-SMARTVMS', tcId: 'TC-CCCD-001', assigneeUsername: 'tester', assigneeName: 'Nguyễn Văn Huy (Tester)', assignedBy: 'Admin', startDate: dOverdue, dueDate: dOverdue, status: 'FAILED', priority: 'P1', module: 'M02', notes: 'Kiểm tra quét CCCD gắn chip liên tục', createdAt: now.toISOString() },
    { id: 'asg-04', projectId: 'PRJ-SMARTVMS', tcId: 'TC-CCCD-002', assigneeUsername: 'tester', assigneeName: 'Nguyễn Văn Huy (Tester)', assignedBy: 'Admin', startDate: now.toISOString().slice(0, 10), dueDate: dLater, status: 'PENDING', priority: 'P2', module: 'M02', notes: 'Check-in thủ công khi mất CCCD', createdAt: now.toISOString() },
    { id: 'asg-05', projectId: 'PRJ-SMARTVMS', tcId: 'TC-GRP-001', assigneeUsername: 'tester_nam', assigneeName: 'Nguyễn Văn Nam (Tester)', assignedBy: 'Admin', startDate: now.toISOString().slice(0, 10), dueDate: dLater, status: 'PENDING', priority: 'P2', module: 'M03', notes: 'Check-in đoàn khách 5 người', createdAt: now.toISOString() },
    { id: 'asg-06', projectId: 'PRJ-SMARTVMS', tcId: 'TC-STATION-001', assigneeUsername: 'tester_lan', assigneeName: 'Trần Thị Lan (Tester)', assignedBy: 'Admin', startDate: now.toISOString().slice(0, 10), dueDate: dLater, status: 'PENDING', priority: 'P1', module: 'M04', notes: 'Kiểm tra thu hồi thẻ khi check-out', createdAt: now.toISOString() }
  ];
  saveAssignments();

  // Kết quả kiểm tra mẫu cho Đợt 1
  state.results = {
    'TC-AUTH-001': { status: 'Pass', tester: 'tester', runAt: now.toISOString(), note: 'Đăng nhập phân quyền admin và trạm gác thành công, token hợp lệ.' },
    'TC-CCCD-001': {
      status: 'Fail',
      tester: 'tester',
      testedAt: now.toISOString(),
      notes: 'Lỗi thiết bị: Quét CCCD chip lần 2 liên tiếp khi chưa rút thẻ cũ làm DeviceService bị treo 10 giây.',
      bugStatus: 'OPEN',
      evidences: [
        { name: 'loi_doc_cccd.png', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180"><rect width="300" height="180" fill="%23fee2e2"/><text x="20" y="90" fill="%23dc2626" font-size="14" font-family="sans-serif">Lỗi Đọc CCCD Chip Timeout</text></svg>' }
      ]
    }
  };
  saveState();

  showToast('⚡ Đã nạp thành công 204 kịch bản kiểm thử mẫu của SmartVMS!', 'success');
  navigate(state.currentUser?.role === 'tester' ? 'mytasks' : (state.currentUser?.role === 'developer' ? 'dev-bugs' : 'dashboard'));
}

function resetToFreshState(confirmFirst = true) {
  if (confirmFirst && !confirm('⚠️ Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu để đưa hệ thống về trạng thái TRẮNG (Fresh Clean State)?')) {
    return;
  }
  localStorage.removeItem('openqas_projects_list');
  localStorage.removeItem('openqas_assignments_list');
  localStorage.removeItem('openqas_active_project_id');
  localStorage.removeItem('smartvms_test_state');
  localStorage.removeItem('smartvms_imported_catalog');
  localStorage.removeItem('openqas_users_list');

  state.projects = [];
  state.currentProjectId = null;
  state.currentProjectVersion = '';
  state.modules = [];
  ALL_TCS = [];
  state.customTcs = [];
  state.overrides = {};
  state.runs = [];
  state.runResults = {};
  state.results = {};
  state.assignments = [];

  saveEnterpriseProjects();
  saveAssignments();
  saveState();

  showToast('✨ Hệ thống đã được đưa về trạng thái Trắng hoàn toàn!', 'success');
  setTimeout(() => {
    window.location.reload();
  }, 400);
}

// ================================================================
// DEVELOPER BUG HUB LOGIC
// ================================================================
function renderDevBugsPage() {
  const allTcs = getAllTcs();
  const filterStatus = document.getElementById('dev-bug-filter-status')?.value || '';
  const filterPriority = document.getElementById('dev-bug-filter-priority')?.value || '';
  const filterModule = document.getElementById('dev-bug-filter-module')?.value || '';
  const searchQuery = (document.getElementById('dev-bug-search-input')?.value || '').trim().toLowerCase();

  // Populate module select if needed
  const modSel = document.getElementById('dev-bug-filter-module');
  if (modSel && modSel.options.length <= 1) {
    const mods = getModules();
    mods.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.id} - ${m.name}`;
      modSel.appendChild(opt);
    });
  }

  // Failing test cases
  const failingTcs = allTcs.filter(tc => {
    const r = state.results[tc.id];
    return r && r.status === 'Fail';
  });

  // Calculate Bug KPIs
  let totalBugs = failingTcs.length;
  let p1Bugs = 0;
  let inDevBugs = 0;
  let resolvedBugs = 0;

  failingTcs.forEach(tc => {
    const r = state.results[tc.id] || {};
    const bStatus = r.bugStatus || 'OPEN';
    if (tc.priority === 'P1') p1Bugs++;
    if (bStatus === 'IN_DEV') inDevBugs++;
    else if (bStatus === 'RESOLVED') resolvedBugs++;
  });

  const statTotal = document.getElementById('dev-stat-total-bugs');
  if (statTotal) statTotal.textContent = totalBugs;
  const statP1 = document.getElementById('dev-stat-p1-bugs');
  if (statP1) statP1.textContent = p1Bugs;
  const statInDev = document.getElementById('dev-stat-in-dev');
  if (statInDev) statInDev.textContent = inDevBugs;
  const statResolved = document.getElementById('dev-stat-resolved');
  if (statResolved) statResolved.textContent = resolvedBugs;

  // Update dev badge
  const pendingFixCount = totalBugs - resolvedBugs;
  const badgeDev = document.getElementById('badge-dev-bugs');
  if (badgeDev) {
    badgeDev.textContent = pendingFixCount;
    badgeDev.style.display = pendingFixCount > 0 ? 'inline-block' : 'none';
  }

  // Filter list
  const filtered = failingTcs.filter(tc => {
    const r = state.results[tc.id] || {};
    const bStatus = r.bugStatus || 'OPEN';
    if (filterStatus && bStatus !== filterStatus) return false;
    if (filterPriority && tc.priority !== filterPriority) return false;
    if (filterModule && tc.module !== filterModule) return false;
    if (searchQuery) {
      const matchId = tc.id.toLowerCase().includes(searchQuery);
      const matchName = (tc.name || '').toLowerCase().includes(searchQuery);
      const matchNotes = (r.notes || '').toLowerCase().includes(searchQuery);
      if (!matchId && !matchName && !matchNotes) return false;
    }
    return true;
  });

  const tbody = document.getElementById('dev-bugs-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 48px 16px; color:var(--text-muted)">
          <div style="font-size:36px; margin-bottom:8px">🎉</div>
          <div style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:4px">
            ${totalBugs === 0 ? 'Không có kịch bản nào bị lỗi!' : 'Không có kịch bản nào phù hợp với bộ lọc hiện tại'}
          </div>
          <div style="font-size:13px">
            ${totalBugs === 0 ? 'Toàn bộ các bài test đang Đạt (Pass) hoặc Chưa chạy (Not Run).' : 'Thử xóa các bộ lọc để xem lại toàn bộ danh sách.'}
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(tc => {
    const r = state.results[tc.id] || {};
    const bStatus = r.bugStatus || 'OPEN';
    
    // Status Badge
    let statusBadge = '<span class="badge badge-fail" style="font-size:11px">🔴 Cần xử lý</span>';
    if (bStatus === 'IN_DEV') {
      statusBadge = '<span class="badge badge-p1" style="font-size:11px">🛠️ Đang sửa</span>';
    } else if (bStatus === 'RESOLVED') {
      statusBadge = '<span class="badge badge-pass" style="font-size:11px">✅ Đã sửa xong</span>';
    }

    // Evidence thumbnails
    let evidenceHtml = '<span style="color:var(--text-muted); font-size:12px">Không có ảnh</span>';
    if (r.evidences && r.evidences.length > 0) {
      evidenceHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap">
          ${r.evidences.slice(0, 2).map((ev, idx) => `
            <img src="${escapeHtml(ev.url)}" alt="${escapeHtml(ev.name || 'Bằng chứng')}" 
                 onclick="openLightbox(this.src, '${tc.id}')"
                 title="Bấm để xem ảnh lớn"
                 style="width:36px; height:36px; object-fit:cover; border-radius:4px; border:1px solid var(--border); cursor:pointer; transition:transform 0.15s"
                 onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
          `).join('')}
          ${r.evidences.length > 2 ? `<span style="font-size:11px; align-self:center; color:var(--accent); font-weight:700">+${r.evidences.length - 2}</span>` : ''}
        </div>
      `;
    }

    // Fix Notes Display (if resolved)
    let fixDetailHtml = '';
    if (bStatus === 'RESOLVED' && (r.fixVersion || r.fixNotes)) {
      fixDetailHtml = `
        <div style="margin-top:6px; padding:6px 10px; background:var(--success-bg); border-left:3px solid var(--success); border-radius:4px; font-size:12px; color:var(--text-secondary)">
          <strong>Fix bản ${r.fixVersion || ''}</strong> ${r.fixCommit ? `<code>(${r.fixCommit})</code>` : ''}: 
          <span>${r.fixNotes || 'Đã sửa'}</span>
        </div>
      `;
    }

    return `
      <tr>
        <td>
          <strong style="color:var(--accent); font-family:var(--font-mono); font-size:13px">${tc.id}</strong>
        </td>
        <td>
          <span class="module-tag" style="margin-bottom:4px; display:inline-block">${tc.module}</span>
          <div><span class="badge badge-${tc.priority ? tc.priority.toLowerCase() : 'p3'}">${tc.priority}</span></div>
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-primary); margin-bottom:4px">${tc.name}</div>
          <div style="font-size:12.5px; color:var(--danger); background:var(--danger-bg); padding:6px 8px; border-radius:4px; border-left:3px solid var(--danger); line-height:1.4">
            <strong>Lỗi thực tế:</strong> ${r.notes || 'Tester không để lại ghi chú chi tiết'}
          </div>
          ${fixDetailHtml}
        </td>
        <td>${evidenceHtml}</td>
        <td>
          <div style="font-weight:600; font-size:12.5px">${r.tester || 'Tester'}</div>
          <div style="font-size:11px; color:var(--text-muted)">${r.testedAt ? new Date(r.testedAt).toLocaleDateString('vi-VN') : ''}</div>
        </td>
        <td>${statusBadge}</td>
        <td style="text-align:right">
          <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" onclick="reproduceBug('${tc.id}')" title="Chuyển đến màn hình Thực thi để xem các bước tái hiện và thử nghiệm">
              ▶️ Tái hiện
            </button>
            ${bStatus !== 'IN_DEV' && bStatus !== 'RESOLVED' ? `
              <button class="btn btn-sm btn-outline" onclick="markBugInProgress('${tc.id}')" style="color:var(--warning); border-color:var(--warning)" title="Tiếp nhận sửa lỗi này">
                🛠️ Nhận sửa
              </button>
            ` : ''}
            ${bStatus !== 'RESOLVED' ? `
              <button class="btn btn-sm btn-primary" onclick="openDevResolveBugModal('${tc.id}')" title="Khai báo phiên bản và mã commit đã khắc phục xong">
                ✅ Báo đã sửa
              </button>
            ` : `
              <button class="btn btn-sm btn-outline" onclick="openDevResolveBugModal('${tc.id}')" title="Cập nhật lại thông tin bản vá">
                ✏️ Sửa ghi chú
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function markBugInProgress(tcId) {
  if (!state.results[tcId]) {
    state.results[tcId] = { status: 'Fail' };
  }
  state.results[tcId].bugStatus = 'IN_DEV';
  saveState();
  renderDevBugsPage();
  showToast(`🛠️ Đã chuyển ${tcId} sang trạng thái Đang xử lý`, 'info');
}

function reproduceBug(tcId) {
  state.selectedTcId = tcId;
  navigate('execute');
  renderExecDetail(tcId);
  showToast(`▶️ Đang mở kịch bản ${tcId} để tái hiện thử nghiệm`, 'info');
}

function openDevResolveBugModal(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const r = state.results[tcId] || {};
  
  document.getElementById('dev-res-tc-id').value = tcId;
  const infoEl = document.getElementById('dev-res-tc-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <strong>${tc.id}</strong>: ${tc.name}
      <div style="color:var(--danger); margin-top:4px; font-size:12px"><strong>Lỗi:</strong> ${r.notes || 'Không có mô tả'}</div>
    `;
  }
  document.getElementById('dev-res-version').value = r.fixVersion || (state.currentProjectVersion ? state.currentProjectVersion + '-patch' : 'v2.0.1-patch');
  document.getElementById('dev-res-commit').value = r.fixCommit || '';
  document.getElementById('dev-res-notes').value = r.fixNotes || '';
  
  openModal('modal-dev-resolve-bug');
}

function confirmDevResolveBug() {
  const tcId = document.getElementById('dev-res-tc-id').value;
  const version = document.getElementById('dev-res-version').value.trim();
  const commit = document.getElementById('dev-res-commit').value.trim();
  const notes = document.getElementById('dev-res-notes').value.trim();
  
  if (!version) {
    alert('Vui lòng nhập Phiên bản khắc phục lỗi!');
    return;
  }
  if (!notes) {
    alert('Vui lòng nhập Ghi chú giải pháp sửa lỗi!');
    return;
  }
  
  if (!state.results[tcId]) {
    state.results[tcId] = { status: 'Fail' };
  }
  
  state.results[tcId].bugStatus = 'RESOLVED';
  state.results[tcId].fixVersion = version;
  state.results[tcId].fixCommit = commit;
  state.results[tcId].fixNotes = notes;
  state.results[tcId].fixedBy = state.currentUser ? state.currentUser.name : 'Developer';
  state.results[tcId].fixedAt = new Date().toISOString();
  
  saveState();
  closeModal('modal-dev-resolve-bug');
  renderDevBugsPage();
  showToast(`🎉 Đã đánh dấu sửa xong kịch bản ${tcId}! Đã thông báo cho Tester.`, 'success');
}

function openLightbox(imgUrl, title) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  if (modal && img) {
    img.src = imgUrl;
    if (titleEl) titleEl.textContent = title || 'Ảnh chụp bằng chứng lỗi';
    modal.classList.add('active');
  }
}

function closeLightbox(e) {
  if (e && e.target && e.target.id === 'lightbox-img') return;
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('active');
}
