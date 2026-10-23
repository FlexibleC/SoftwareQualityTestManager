/**
 * SOFTWARE QUALITY & TEST MANAGEMENT SYSTEM (SQTM) - CORE MODULE
 * Central State Management, Multi-Project Persistence, RBAC & Shared Utilities
 * Chuẩn hóa: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010:2023
 */

const STATE_STORAGE_KEY = 'sqtm_qa_state_v3';
const SQTM_PROJECTS_STORAGE_KEY = 'sqtm_enterprise_projects_v3';
const SQTM_ACTIVE_PRJ_STORAGE_KEY = 'sqtm_active_project_id_v3';

const DEFAULT_SYSTEM_USERS = [
  {
    id: 'usr_001',
    username: 'admin',
    password: '123',
    name: 'Nguyễn Văn Huy',
    role: 'admin',
    roleTitle: 'Quản trị viên Cấp cao (Super Admin)',
    email: 'huy.nv@smartvms.local',
    assignedProjects: [],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  },
  {
    id: 'usr_006',
    username: 'lead',
    password: '123',
    name: 'Hoàng Hải Đăng',
    role: 'project_lead',
    roleTitle: 'Quản trị viên dự án',
    email: 'dang.hh@smartvms.local',
    assignedProjects: [],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  },
  {
    id: 'usr_002',
    username: 'tester',
    password: '123',
    name: 'Nguyễn Văn Nam',
    role: 'tester',
    roleTitle: 'Kiểm thử viên 1',
    email: 'nam.nv@smartvms.local',
    assignedProjects: [],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  },
  {
    id: 'usr_003',
    username: 'tester2',
    password: '123',
    name: 'Trần Thị Lan',
    role: 'tester',
    roleTitle: 'Kiểm thử viên 2',
    email: 'lan.tt@smartvms.local',
    assignedProjects: [],
    status: 'ACTIVE',
    createdAt: '2026-10-05'
  },
  {
    id: 'usr_004',
    username: 'tester3',
    password: '123',
    name: 'Lê Hoàng Minh',
    role: 'tester',
    roleTitle: 'Kiểm thử viên 3',
    email: 'minh.lh@smartvms.local',
    assignedProjects: [],
    status: 'ACTIVE',
    createdAt: '2026-10-08'
  },
  {
    id: 'usr_005',
    username: 'dev',
    password: '123',
    name: 'Trần Quốc Tuấn',
    role: 'developer',
    roleTitle: 'Lập trình viên',
    email: 'tuan.tq@smartvms.local',
    assignedProjects: [],
    status: 'ACTIVE',
    createdAt: '2026-10-01'
  }
];

// Default Application State
let state = {
  projects: [],
  activeProjectId: null,
  currentUser: { username: 'admin', name: 'Nguyễn Văn Huy', role: 'admin', title: 'QA Lead' },
  users: [],
  assignments: [],
  results: {},
  comments: {},
  evidences: {},
  executionLogs: [],
  adhocDefects: [],
  session: {
    id: 'SES-202610-01',
    name: 'Sprint 1 - Regression Test',
    owner: 'Nguyễn Văn Huy (QA Lead)',
    version: 'v1.0',
    notes: 'Kiểm thử toàn diện các phân hệ nghiệp vụ',
    startedAt: '2026-10-10'
  },
  theme: 'light'
};

// ================================================================
// STATE PERSISTENCE & INITIALIZATION

// ================================================================
// STATE PERSISTENCE & INITIALIZATION (RESILIENT MULTI-TIER ARCHITECTURE)
// ================================================================
function initCoreState(force = false) {
  if (!force && state.projects && state.projects.length > 0) {
    return;
  }

  state.projects = [];
  state.activeProjectId = null;

  // 1. Khôi phục danh mục dự án bền vững từ LocalStorage / SessionStorage
  try {
    const rawPrjs = localStorage.getItem(SQTM_PROJECTS_STORAGE_KEY) || 
                    sessionStorage.getItem(SQTM_PROJECTS_STORAGE_KEY) || 
                    sessionStorage.getItem('smartvms_session_projects');
    if (rawPrjs) {
      const parsed = JSON.parse(rawPrjs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.projects = parsed;
        // Đảm bảo đồng bộ ngược lại vào LocalStorage
        try { localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, rawPrjs); } catch(e){}
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc dự án từ Storage:', e);
  }

  // 1b. Fallback tự động nạp từ Manifest khởi tạo ban đầu nếu Storage chưa có dữ liệu
  if ((!state.projects || state.projects.length === 0) && typeof window !== 'undefined' && window.OPENQAS_ENTERPRISE_MANIFEST) {
    const m = window.OPENQAS_ENTERPRISE_MANIFEST;
    if (Array.isArray(m.projects) && m.projects.length > 0) {
      state.projects = JSON.parse(JSON.stringify(m.projects));
      try {
        localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
      } catch (e) {}
    }
  }

  // 2. Khôi phục Active Project ID
  try {
    const savedActiveId = localStorage.getItem(SQTM_ACTIVE_PRJ_STORAGE_KEY) || 
                          localStorage.getItem('smartvms_active_project_id') ||
                          sessionStorage.getItem(SQTM_ACTIVE_PRJ_STORAGE_KEY) || 
                          sessionStorage.getItem('smartvms_active_project_id');
    if (savedActiveId && state.projects.some(p => p.id === savedActiveId)) {
      state.activeProjectId = savedActiveId;
    } else if (state.projects.length > 0) {
      state.activeProjectId = state.projects[0].id;
    }
  } catch (e) {}

  // 3. Khôi phục trạng thái nhiệm vụ, kết quả và lỗi
  try {
    const rawState = localStorage.getItem(STATE_STORAGE_KEY) || sessionStorage.getItem(STATE_STORAGE_KEY);
    if (rawState) {
      const parsedState = JSON.parse(rawState);
      if (parsedState.assignments) state.assignments = parsedState.assignments;
      if (parsedState.results) state.results = parsedState.results;
      if (parsedState.cycleResults) state.cycleResults = parsedState.cycleResults;
      if (parsedState.comments) state.comments = parsedState.comments;
      if (parsedState.evidences) state.evidences = parsedState.evidences;
      if (parsedState.executionLogs) state.executionLogs = parsedState.executionLogs;
      if (parsedState.adhocDefects) state.adhocDefects = parsedState.adhocDefects;
      if (Array.isArray(parsedState.testCycles) && parsedState.testCycles.length > 0) {
        state.testCycles = parsedState.testCycles;
      }
    }
  } catch (e) {}

  // 3b. Fallback khôi phục assignments, results, testCycles từ Manifest nếu trống hoặc thiếu
  if (typeof window !== 'undefined' && window.OPENQAS_ENTERPRISE_MANIFEST) {
    const m = window.OPENQAS_ENTERPRISE_MANIFEST;
    if ((!state.assignments || state.assignments.length === 0 || state.assignments.length < (m.assignments || []).length) && Array.isArray(m.assignments) && m.assignments.length > 0) {
      state.assignments = JSON.parse(JSON.stringify(m.assignments));
    }
    if ((!state.results || Object.keys(state.results).length === 0) && m.results && Object.keys(m.results).length > 0) {
      state.results = JSON.parse(JSON.stringify(m.results));
    }
    if ((!state.testCycles || state.testCycles.length === 0 || state.testCycles.length < (m.testCycles || []).length) && Array.isArray(m.testCycles) && m.testCycles.length > 0) {
      state.testCycles = JSON.parse(JSON.stringify(m.testCycles));
    }
    if ((!state.cycleResults || Object.keys(state.cycleResults).length === 0) && m.cycleResults) {
      state.cycleResults = JSON.parse(JSON.stringify(m.cycleResults));
    }
  }

  // Khôi phục các đợt test bền vững từ storage
  if (!state.testCycles || state.testCycles.length === 0) {
    try {
      const rawCycles = localStorage.getItem('smartvms_test_cycles_v3') || sessionStorage.getItem('smartvms_test_cycles_v3');
      if (rawCycles) {
        const parsedCycles = JSON.parse(rawCycles);
        if (Array.isArray(parsedCycles)) {
          state.testCycles = parsedCycles;
        }
      }
    } catch (e) {}
  }
  if (!state.testCycles || !Array.isArray(state.testCycles)) {
    state.testCycles = [];
  }

  // Tự động đảm bảo mỗi dự án luôn có sẵn ít nhất một đợt test mặc định để phân công công việc
  ensureDefaultTestCyclesForProjects();
  cleanOrphanAssignments();

  state.isCleanProjectState = state.projects.length === 0;

  // Cấu hình tài khoản người dùng hệ thống (RBAC) với cơ chế lưu bền vững
  const savedUsersRaw = localStorage.getItem('smartvms_system_users_v3') || sessionStorage.getItem('smartvms_system_users_v3');
  if (savedUsersRaw) {
    try {
      const parsedUsers = JSON.parse(savedUsersRaw);
      if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
        state.users = parsedUsers;
      } else {
        state.users = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
      }
    } catch (e) {
      state.users = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
    }
  } else {
    state.users = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
  }

  // Chuẩn hóa loại bỏ hậu tố tiếng Anh trong ngoặc khỏi chức danh người dùng
  if (Array.isArray(state.users)) {
    state.users.forEach(u => {
      if (u.roleTitle) {
        u.roleTitle = u.roleTitle.replace(/\s*\([^)]*\)/g, '').replace(/Dự án/g, 'dự án').trim();
      }
    });
  }

  // Tự động đồng bộ hai chiều giữa project.members (từ Cloud) và user.assignedProjects
  syncUserProjectsWithMembers();

  // Khôi phục phiên người dùng đã đăng nhập (Session-First)
  let savedUser = null;
  try {
    const rawUser = sessionStorage.getItem('smartvms_current_user') || localStorage.getItem('smartvms_current_user');
    if (rawUser) {
      savedUser = JSON.parse(rawUser);
    }
  } catch (e) {}

  const allUsers = state.users || DEFAULT_SYSTEM_USERS;
  if (savedUser && savedUser.username) {
    const matched = allUsers.find(u => u.username.toLowerCase() === savedUser.username.toLowerCase());
    state.currentUser = matched || savedUser;
  } else {
    state.currentUser = null;
  }

  // Phân quyền ngữ cảnh người dùng theo thư mục giao diện nếu chưa có phiên hoặc cần fallback phù hợp
  const currentPath = (window.location.pathname || '').toLowerCase();
  if (currentPath.includes('/lead/')) {
    if (!state.currentUser || (state.currentUser.role !== 'project_lead' && state.currentUser.role !== 'admin')) {
      state.currentUser = allUsers.find(u => u.role === 'project_lead' || u.username === 'lead') || allUsers.find(u => u.username === 'lead');
    }
  } else if (currentPath.includes('/tester/')) {
    if (!state.currentUser || (state.currentUser.role !== 'tester' && state.currentUser.role !== 'admin')) {
      state.currentUser = allUsers.find(u => u.role === 'tester') || allUsers.find(u => u.username === 'tester');
    }
  } else if (currentPath.includes('/dev/')) {
    if (!state.currentUser || (state.currentUser.role !== 'developer' && state.currentUser.role !== 'admin')) {
      state.currentUser = allUsers.find(u => u.role === 'developer') || allUsers.find(u => u.username === 'dev');
    }
  } else if (currentPath.includes('/admin/')) {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      state.currentUser = allUsers.find(u => u.role === 'admin') || allUsers[0];
    }
  }

  // Khôi phục giao diện Dark/Light
  const savedTheme = localStorage.getItem('smartvms_theme') || state.theme || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 4. Nếu đang chạy qua HTTP Server LAN hoặc Vercel, tự động gọi ngầm để đồng bộ và cấp token
  if (typeof window !== 'undefined' && isLanServerAvailable()) {
    ensureAuthToken();
    fetchProjectsFromLanServer();
    fetchFullStateFromLanServer();
  }
}

/**
 * Tự động đồng bộ hai chiều giữa project.members (lưu trên Cloud) và user.assignedProjects
 */
function syncUserProjectsWithMembers() {
  if (!state.projects || !Array.isArray(state.projects)) return;
  if (!state.users || !Array.isArray(state.users)) return;

  state.projects.forEach(p => {
    if (!p.members) p.members = [];

    // 1. Đồng bộ Trưởng dự án chính
    if (p.leadUsername) {
      const lu = state.users.find(u => u.username === p.leadUsername);
      if (lu) {
        if (!lu.assignedProjects) lu.assignedProjects = [];
        if (!lu.assignedProjects.includes(p.id)) lu.assignedProjects.push(p.id);
      }
      if (!p.members.some(m => m.username === p.leadUsername)) {
        p.members.push({
          username: p.leadUsername,
          name: lu ? lu.name : p.leadUsername,
          projectRole: 'lead',
          title: (lu && lu.role === 'admin') ? 'Quản trị viên cấp cao' : 'Trưởng dự án'
        });
      }
    }

    // 2. Đồng bộ danh sách nhiều Leader (nếu có)
    if (Array.isArray(p.leadUsernames)) {
      p.leadUsernames.forEach(un => {
        const lu = state.users.find(u => u.username === un);
        if (lu) {
          if (!lu.assignedProjects) lu.assignedProjects = [];
          if (!lu.assignedProjects.includes(p.id)) lu.assignedProjects.push(p.id);
        }
        if (!p.members.some(m => m.username === un)) {
          p.members.push({
            username: un,
            name: lu ? lu.name : un,
            projectRole: 'lead',
            title: (lu && lu.role === 'admin') ? 'Quản trị viên cấp cao' : 'Trưởng dự án'
          });
        }
      });
    }

    // 3. Đảm bảo dự án luôn có đủ thành phần nhân sự nòng cốt (Lead, Tester, Dev)
    if (!p.members.some(m => m.username === 'dev')) {
      const devObj = state.users.find(u => u.username === 'dev');
      p.members.push({
        username: 'dev',
        name: devObj ? devObj.name : 'Trần Quốc Tuấn',
        projectRole: 'dev',
        title: 'Lập trình viên'
      });
    }
    if (!p.members.some(m => m.username === 'tester')) {
      const testerObj = state.users.find(u => u.username === 'tester');
      p.members.push({
        username: 'tester',
        name: testerObj ? testerObj.name : 'Nguyễn Văn Nam',
        projectRole: 'tester',
        title: 'Kiểm thử viên'
      });
    }

    // 4. Quét từng thành viên trong p.members để cập nhật vào assignedProjects của user
    p.members.forEach(m => {
      const u = state.users.find(usr => usr.username === m.username);
      if (u) {
        if (!u.assignedProjects) u.assignedProjects = [];
        if (!u.assignedProjects.includes(p.id)) {
          u.assignedProjects.push(p.id);
        }
      }
    });

    // 4. Quét từng user: nếu u.assignedProjects có p.id thì bổ sung vào p.members nếu chưa có
    state.users.forEach(u => {
      if (u.assignedProjects && u.assignedProjects.includes(p.id)) {
        if (!p.members.some(m => m.username === u.username)) {
          let role = 'tester';
          let title = 'Kiểm thử viên';
          if (u.role === 'admin' || u.role === 'project_lead') {
            role = 'lead';
            title = (u.role === 'admin') ? 'Quản trị viên cấp cao' : 'Trưởng dự án';
          } else if (u.role === 'developer' || u.role === 'dev') {
            role = 'dev';
            title = 'Lập trình viên';
          }
          p.members.push({
            username: u.username,
            name: u.name || u.username,
            projectRole: role,
            title: title
          });
        }
      }
    });
  });
}

/**
/**
 * Đồng bộ danh sách các đợt test thực tế từ p.testCycles sang state.testCycles (Không tự ý sinh đợt test giả lập)
 */
function ensureDefaultTestCyclesForProjects() {
  if (!state.projects || !Array.isArray(state.projects)) return;
  if (!state.testCycles) state.testCycles = [];

  const validCycleIds = new Set();
  state.projects.forEach(p => {
    if (!p.testCycles) p.testCycles = [];

    // Chỉ nạp các cycle người dùng đã thực sự tạo từ p.testCycles sang state.testCycles
    p.testCycles.forEach(pc => {
      validCycleIds.add(pc.id);
      if (!state.testCycles.some(sc => sc.id === pc.id)) {
        state.testCycles.push({ ...pc, projectId: pc.projectId || p.id });
      }
    });
  });

  // Loại bỏ triệt để các đợt test mồ côi khỏi state.testCycles nếu dự án hiện tại không chứa chúng
  state.testCycles = state.testCycles.filter(c => c && c.id && validCycleIds.has(c.id));
}

/**
 * Loại bỏ triệt để các phân công nhiệm vụ và kết quả test mồ côi (Orphan Assignment Integrity)
 * Đảm bảo:
 * 1. Nếu hệ thống rỗng (0 dự án), state.assignments = [].
 * 2. Nếu một dự án có 0 kịch bản test (mới tạo hoặc trống), không được phép có bất kỳ phân công nào cho dự án đó.
 * 3. Nếu dự án đã bị xóa, toàn bộ phân công của dự án đó bị loại bỏ hoàn toàn.
 */
function cleanOrphanAssignments() {
  if (!state.projects || !Array.isArray(state.projects) || state.projects.length === 0) {
    state.assignments = [];
    try {
      localStorage.removeItem('smartvms_system_assignments_v3');
      sessionStorage.removeItem('smartvms_system_assignments_v3');
      const raw = localStorage.getItem(STATE_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        p.assignments = [];
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(p));
      }
    } catch (e) {}
    return;
  }

  const validProjects = new Set(state.projects.map(p => p.id));
  const validTcSet = new Set();
  state.projects.forEach(p => {
    const pTcs = Array.isArray(p.testCases) ? p.testCases : [];
    pTcs.forEach(tc => {
      if (tc && tc.id) {
        validTcSet.add(`${p.id}__${tc.id}`);
        validTcSet.add(tc.id);
      }
    });
  });

  const beforeCount = (state.assignments || []).length;
  if (Array.isArray(state.assignments)) {
    state.assignments = state.assignments.filter(a => {
      if (!a) return false;
      const tcId = a.tcId || a.testCaseId;
      if (!tcId) return false;
      if (a.projectId && !validProjects.has(a.projectId)) return false;
      const prj = state.projects.find(p => p.id === a.projectId);
      if (prj) {
        const prjTcs = Array.isArray(prj.testCases) ? prj.testCases : [];
        if (prjTcs.length === 0) return false;
        return prjTcs.some(tc => tc.id === tcId);
      }
      return validTcSet.has(tcId) || (a.projectId && validTcSet.has(`${a.projectId}__${tcId}`));
    });
  }

  // Nếu có bài bị thanh lọc, lưu ngay lập tức vào LocalStorage để dọn sạch rác
  if ((state.assignments || []).length !== beforeCount) {
    try {
      const rawState = localStorage.getItem(STATE_STORAGE_KEY);
      if (rawState) {
        const parsed = JSON.parse(rawState);
        parsed.assignments = state.assignments;
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(parsed));
      }
      localStorage.setItem('smartvms_system_assignments_v3', JSON.stringify(state.assignments));
      sessionStorage.setItem('smartvms_system_assignments_v3', JSON.stringify(state.assignments));
    } catch (e) {}
  }
}
if (typeof window !== 'undefined') {
  window.cleanOrphanAssignments = cleanOrphanAssignments;
}

/**
 * Lấy danh sách phân công nhiệm vụ hợp lệ thực tế của một dự án (chỉ tính kịch bản có thật)
 */
function getProjectAssignments(projectId) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return [];
  const allTcs = Array.isArray(p.testCases) ? p.testCases : [];
  if (allTcs.length === 0) return [];
  const validTcIds = new Set(allTcs.map(t => t.id));
  return (state.assignments || []).filter(a => a.projectId === pId && validTcIds.has(a.tcId || a.testCaseId));
}
if (typeof window !== 'undefined') {
  window.getProjectAssignments = getProjectAssignments;
}

/**
 * Lưu trạng thái bền vững (LocalStorage + SessionStorage + LAN Server + Cloud)
 */
function saveCoreState(opts = {}) {
  try {
    cleanOrphanAssignments();
    // Đồng bộ hai chiều giữa p.testCycles và state.testCycles trước khi lưu
    if (!state.testCycles) state.testCycles = [];
    const validCycleIds = new Set();
    (state.projects || []).forEach(p => {
      if (Array.isArray(p.testCycles)) {
        p.testCycles.forEach(c => {
          validCycleIds.add(c.id);
          const idx = state.testCycles.findIndex(x => x.id === c.id);
          const fullCycle = { ...c, projectId: c.projectId || p.id };
          if (idx >= 0) {
            state.testCycles[idx] = { ...state.testCycles[idx], ...fullCycle };
          } else {
            state.testCycles.push(fullCycle);
          }
        });
      }
    });
    // Loại bỏ các đợt test mồ côi
    state.testCycles = state.testCycles.filter(c => c && c.id && validCycleIds.has(c.id));

    // 1. Lưu danh mục dự án bền vững vào LocalStorage & SessionStorage
    if (state.projects) {
      const prjJson = JSON.stringify(state.projects);
      localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, prjJson);
      sessionStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, prjJson);
      sessionStorage.setItem('smartvms_session_projects', prjJson);
    }
    if (state.activeProjectId) {
      localStorage.setItem(SQTM_ACTIVE_PRJ_STORAGE_KEY, state.activeProjectId);
      localStorage.setItem('smartvms_active_project_id', state.activeProjectId);
      sessionStorage.setItem(SQTM_ACTIVE_PRJ_STORAGE_KEY, state.activeProjectId);
      sessionStorage.setItem('smartvms_active_project_id', state.activeProjectId);
    } else {
      localStorage.removeItem(SQTM_ACTIVE_PRJ_STORAGE_KEY);
      localStorage.removeItem('smartvms_active_project_id');
      sessionStorage.removeItem(SQTM_ACTIVE_PRJ_STORAGE_KEY);
      sessionStorage.removeItem('smartvms_active_project_id');
    }

    // 2. Lưu danh mục tài khoản người dùng và phân quyền vào LocalStorage & SessionStorage
    if (state.users && Array.isArray(state.users)) {
      const usersJson = JSON.stringify(state.users);
      localStorage.setItem('smartvms_system_users_v3', usersJson);
      sessionStorage.setItem('smartvms_system_users_v3', usersJson);
    }

    // 3. Lưu phiên đăng nhập người dùng hiện tại
    if (state.currentUser) {
      const curUserJson = JSON.stringify(state.currentUser);
      localStorage.setItem('smartvms_current_user', curUserJson);
      sessionStorage.setItem('smartvms_current_user', curUserJson);
    }

    // 4. Lưu danh sách các đợt test (Test Cycles) bền vững
    if (state.testCycles && Array.isArray(state.testCycles)) {
      const cyclesJson = JSON.stringify(state.testCycles);
      localStorage.setItem('smartvms_test_cycles_v3', cyclesJson);
      sessionStorage.setItem('smartvms_test_cycles_v3', cyclesJson);
    }

    // 5. Lưu trạng thái công việc và kết quả
    const appPayload = {
      assignments: state.assignments || [],
      results: state.results || {},
      cycleResults: state.cycleResults || {},
      comments: state.comments || {},
      evidences: state.evidences || {},
      executionLogs: state.executionLogs || [],
      adhocDefects: state.adhocDefects || [],
      testCycles: state.testCycles || []
    };

    // Bọc cơ chế lưu LocalStorage chống lỗi QuotaExceededError khi dữ liệu vượt 5MB
    try {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(appPayload));
    } catch (quotaErr) {
      console.warn('⚠️ [SQTM Storage] LocalStorage trình duyệt đã chạm hạn mức (QuotaExceededError). Dữ liệu được ưu tiên đồng bộ lên Backend Server.');
      try {
        // Chỉ lưu bản snapshot thu gọn để tránh crash giao diện
        const compactPayload = {
          assignments: (state.assignments || []).slice(0, 500),
          testCycles: state.testCycles || []
        };
        sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(compactPayload));
      } catch (e2) {}
    }

    // 6. Gom luồng đồng bộ ngầm (Debounced Asynchronous Background Sync - 600ms)
    // Giúp giao diện phản hồi tức thì 0ms, gom bão request dồn dập thành 1 batch duy nhất
    if (!opts.skipSync) {
      scheduleBackgroundSync(600);
    }

    // 7. Phát sóng tức thì cho các tab khác cùng trình duyệt (Local-First Intra-Browser Sync - 1ms)
    if (!opts.skipBroadcast && typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('sqtm_local_sync');
        bc.postMessage({ type: 'CORE_STATE_SAVED', timestamp: Date.now() });
        bc.close();
      } catch (e) {}
    }
  } catch (e) {
    console.warn('Lỗi saveCoreState:', e);
  }
}

let _bgSyncTimer = null;
let _isBgSyncRunning = false;

/**
 * Gom luồng đồng bộ ngầm không chặn giao diện (Debounced Asynchronous Background Sync)
 * Giúp người dùng click/chấm bài phản hồi 0ms trên màn hình.
 * Dữ liệu đồng bộ lên Cloud/Backend sau khi người dùng dừng thao tác 600ms.
 */
function scheduleBackgroundSync(delayMs = 600) {
  if (typeof window === 'undefined') return;
  if (_bgSyncTimer) clearTimeout(_bgSyncTimer);

  _bgSyncTimer = setTimeout(async () => {
    _bgSyncTimer = null;
    if (_isBgSyncRunning) return;
    _isBgSyncRunning = true;
    try {
      const appPayload = {
        assignments: state.assignments || [],
        results: state.results || {},
        cycleResults: state.cycleResults || {},
        comments: state.comments || {},
        evidences: state.evidences || {},
        executionLogs: state.executionLogs || [],
        adhocDefects: state.adhocDefects || [],
        testCycles: state.testCycles || []
      };

      // 1. Đồng bộ lên máy chủ Backend API (/api/projects & /api/state)
      if (isLanServerAvailable()) {
        syncProjectsToLanServer(state.projects);
        syncFullStateToLanServer(appPayload);
      }

      // 2. Đồng bộ ngầm lên Supabase Cloud Database (chạy song song)
      const tasks = [];
      if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
        tasks.push(Promise.resolve(window.pushProjectsToCloud(state.projects)));
      }
      if (window.pushUsersToCloud && typeof window.pushUsersToCloud === 'function') {
        tasks.push(Promise.resolve(window.pushUsersToCloud(state.users)));
      }
      if (window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
        tasks.push(Promise.resolve(window.pushCyclesToCloud(state.testCycles)));
      }
      if (window.pushAssignmentsToCloud && typeof window.pushAssignmentsToCloud === 'function' && state.assignments) {
        tasks.push(Promise.resolve(window.pushAssignmentsToCloud(state.assignments)));
      }
      if (tasks.length > 0) {
        await Promise.allSettled(tasks);
      }
    } catch (err) {
      console.warn('Lỗi background sync:', err);
    } finally {
      _isBgSyncRunning = false;
    }
  }, delayMs);
}
if (typeof window !== 'undefined') {
  window.scheduleBackgroundSync = scheduleBackgroundSync;
}

/**
 * Lấy Token xác thực JWT từ phiên làm việc
 */
function getAuthToken() {
  try {
    return sessionStorage.getItem('sqtm_auth_token') || localStorage.getItem('sqtm_auth_token') || '';
  } catch (e) {
    return '';
  }
}
if (typeof window !== 'undefined') {
  window.getAuthToken = getAuthToken;
}

/**
 * Kiểm tra xem môi trường hiện tại có hỗ trợ máy chủ Backend (/api/*) hay không.
 * Hỗ trợ đồng bộ trên cả LAN Node.js Server và Vercel Cloud Serverless API.
 */
function isLanServerAvailable() {
  if (typeof window === 'undefined' || !window.location) return false;
  if (window.__sqtmBackendApiAvailable === false) return false;
  if (window.location.protocol === 'file:') return false;
  return true;
}
if (typeof window !== 'undefined') {
  window.isLanServerAvailable = isLanServerAvailable;
}

let _isAuthenticatingToken = false;
async function ensureAuthToken() {
  if (typeof window === 'undefined') return;
  if (_isAuthenticatingToken) return;
  if (getAuthToken()) return;
  const cur = state.currentUser;
  if (!cur || !cur.username) return;

  _isAuthenticatingToken = true;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cur.username, password: cur.password || '123' })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) {
        sessionStorage.setItem('sqtm_auth_token', data.token);
        localStorage.setItem('sqtm_auth_token', data.token);
      }
    }
  } catch (e) {
  } finally {
    _isAuthenticatingToken = false;
  }
}
if (typeof window !== 'undefined') {
  window.ensureAuthToken = ensureAuthToken;
}

/**
 * Đồng bộ danh mục dự án lên Backend Server có đính kèm JWT Bearer Token & User Context
 */
function syncProjectsToLanServer(projects) {
  if (!isLanServerAvailable()) return;
  if (!projects || !Array.isArray(projects)) return;
  try {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (state.currentUser) {
      headers['X-User-Info'] = encodeURIComponent(JSON.stringify(state.currentUser));
    } else if (!token) {
      ensureAuthToken();
      return;
    }

    fetch('/api/projects', {
      method: 'POST',
      headers,
      body: JSON.stringify({ projects })
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Đồng bộ toàn bộ trạng thái công việc lên Backend Server có đính kèm JWT Bearer Token & User Context
 */
function syncFullStateToLanServer(payload) {
  if (!isLanServerAvailable()) return;
  if (!payload) return;
  try {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (state.currentUser) {
      headers['X-User-Info'] = encodeURIComponent(JSON.stringify(state.currentUser));
    } else if (!token) {
      ensureAuthToken();
      return;
    }

    fetch('/api/state', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Nạp toàn bộ trạng thái kiểm thử bền vững từ máy chủ LAN Node.js khi khởi động
 */
function fetchFullStateFromLanServer() {
  if (!isLanServerAvailable()) return;
  try {
    fetch('/api/state')
      .then(res => {
        if (!res.ok) {
          window.__sqtmLanServerAvailable = false;
          return null;
        }
        window.__sqtmLanServerAvailable = true;
        return res.json();
      })
      .then(data => {
        if (!data) return;
        let changed = false;
        if (data.results && Object.keys(data.results).length > 0) {
          if (!state.results || Object.keys(state.results).length === 0) {
            state.results = data.results;
            changed = true;
          }
        }
        if (data.cycleResults && Object.keys(data.cycleResults).length > 0) {
          if (!state.cycleResults || Object.keys(state.cycleResults).length === 0) {
            state.cycleResults = data.cycleResults;
            changed = true;
          }
        }
        if (Array.isArray(data.assignments) && data.assignments.length > 0) {
          if (!state.assignments || state.assignments.length === 0) {
            state.assignments = data.assignments;
            changed = true;
          }
        }
        if (Array.isArray(data.testCycles) && data.testCycles.length > 0) {
          if (!state.testCycles || state.testCycles.length === 0) {
            state.testCycles = data.testCycles;
            changed = true;
          }
        }
        if (changed) {
          try {
            const appPayload = {
              assignments: state.assignments || [],
              results: state.results || {},
              cycleResults: state.cycleResults || {},
              comments: state.comments || {},
              evidences: state.evidences || {},
              executionLogs: state.executionLogs || [],
              adhocDefects: state.adhocDefects || [],
              testCycles: state.testCycles || []
            };
            localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(appPayload));
          } catch(e) {}
        }
      })
      .catch(() => {
        window.__sqtmLanServerAvailable = false;
      });
  } catch(e) {}
}

/**
 * Nạp danh mục dự án từ máy chủ LAN Node.js khi khởi động
 */
function fetchProjectsFromLanServer() {
  if (!isLanServerAvailable()) return;
  try {
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) {
          window.__sqtmLanServerAvailable = false;
          return null;
        }
        window.__sqtmLanServerAvailable = true;
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const serverProjects = Array.isArray(data) ? data : (data.projects || []);

        // Nếu nguồn dữ liệu là Database (Single Source of Truth), đồng bộ trực tiếp danh sách (kể cả khi rỗng [])
        if (data.source === 'database') {
          state.projects = serverProjects;
          if (!state.projects.some(p => p.id === state.activeProjectId)) {
            state.activeProjectId = state.projects.length > 0 ? state.projects[0].id : null;
          }
          ensureDefaultTestCyclesForProjects();
          saveCoreState();
          try {
            localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
          } catch (e) {}

          if (typeof renderProjectsTab === 'function') {
            try { renderProjectsTab(); } catch(e){}
          }
          if (typeof AdminPortfolio !== 'undefined' && typeof AdminPortfolio.init === 'function') {
            try { AdminPortfolio.init(); } catch(e){}
          }
          if (typeof LeadPortfolio !== 'undefined' && typeof LeadPortfolio.init === 'function') {
            try { LeadPortfolio.init(); } catch(e){}
          }
          return;
        }

        if (serverProjects.length > 0) {
          let hasChange = false;
          if (!state.projects || state.projects.length === 0) {
            state.projects = serverProjects;
            hasChange = true;
          } else {
            // Đối soát và gộp dự án từ server nếu client chưa có hoặc cập nhật từ server
            serverProjects.forEach(sp => {
              const idx = state.projects.findIndex(p => p.id === sp.id || p.code === sp.code);
              if (idx === -1) {
                state.projects.push(sp);
                hasChange = true;
              } else {
                // Đồng bộ cập nhật từ Server Disk vào Local Project
                const lp = state.projects[idx];
                state.projects[idx] = {
                  ...lp,
                  ...sp,
                  testCycles: sp.testCycles || [],
                  testCases: sp.testCases || [],
                  modules: sp.modules || []
                };
                hasChange = true;
              }
            });
          }
          if (hasChange) {
            ensureDefaultTestCyclesForProjects();
            saveCoreState();
            if (!state.activeProjectId && state.projects.length > 0) {
              state.activeProjectId = state.projects[0].id;
            }
            try {
              localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
            } catch (e) {}
            // Cập nhật lại UI nếu hàm tương ứng tồn tại trên trang
            if (typeof renderProjectsTab === 'function') {
              try { renderProjectsTab(); } catch(e){}
            }
            if (typeof AdminPortfolio !== 'undefined' && typeof AdminPortfolio.init === 'function') {
              try { AdminPortfolio.init(); } catch(e){}
            }
            if (typeof LeadPortfolio !== 'undefined' && typeof LeadPortfolio.init === 'function') {
              try { LeadPortfolio.init(); } catch(e){}
            }
            if (typeof LeadContext !== 'undefined' && typeof LeadContext.init === 'function') {
              try { LeadContext.init(); } catch(e){}
            }
            if (typeof LeadDashboard !== 'undefined' && typeof LeadDashboard.init === 'function') {
              try { LeadDashboard.init(); } catch(e){}
            }
            if (typeof DevPortfolio !== 'undefined' && typeof DevPortfolio.init === 'function') {
              try { DevPortfolio.init(); } catch(e){}
            }
            if (typeof DevReports !== 'undefined' && typeof DevReports.init === 'function') {
              try { DevReports.init(); } catch(e){}
            }
            if (typeof DevContext !== 'undefined' && typeof DevContext.init === 'function') {
              try { DevContext.init(); } catch(e){}
            }
            if (typeof TesterPortfolio !== 'undefined' && typeof TesterPortfolio.init === 'function') {
              try { TesterPortfolio.init(); } catch(e){}
            }
            if (typeof TesterContext !== 'undefined' && typeof TesterContext.init === 'function') {
              try { TesterContext.init(); } catch(e){}
            }
          }
        }
      })
      .catch(() => {});
  } catch (e) {}
}

function seedDefaultTestCycles() {}
function ensureMultiVersionTestCycles() {}
function seedDefaultCycleResults() {}
function seedDefaultAssignments() {}
function seedDefaultResults() {}
function seedDefaultExecutionLogs() {}
function seedDefaultAdhocDefects() {}

// ================================================================
// PROJECT & TESTCASE SELECTORS (WITH RBAC ACCESS CONTROL)
// ================================================================
function getActiveProject() {
  if (!state.projects || state.projects.length === 0) return null;
  return state.projects.find(p => p.id === state.activeProjectId) || state.projects[0];
}

function getAllProjects() {
  return state.projects || [];
}

/**
 * Lấy danh sách các Dự án mà Trưởng Dự Án (Project Lead) phụ trách.
 * - Admin: Toàn bộ dự án trong hệ thống
 * - Leader: Các dự án mà Leader này được phân bổ (leadUsername, leadUsernames, member lead, hoặc user.assignedProjects)
 */
function getLeaderProjects(user) {
  const all = getAllProjects();
  const u = user || getCurrentUser();
  if (!u || u.role === 'admin') return all;

  const myProjects = all.filter(p => {
    if (p.leadUsername === u.username) return true;
    if (Array.isArray(p.leadUsernames) && p.leadUsernames.includes(u.username)) return true;
    if (Array.isArray(p.members) && p.members.some(m => m.username === u.username)) return true;
    if (Array.isArray(u.assignedProjects) && u.assignedProjects.includes(p.id)) return true;
    return false;
  });

  return myProjects.length > 0 ? myProjects : all;
}

/**
 * Lấy danh sách các Dự án mà User có quyền truy cập theo vai trò.
 * - Admin: Toàn bộ dự án trong hệ thống
 * - Leader: Các dự án Leader phụ trách
 * - Tester: Các dự án mà Tester có bài được phân công hoặc là thành viên
 * - Dev: Các dự án Dev được phân công
 */
function getAccessibleProjects(user) {
  const all = getAllProjects();
  const u = user || getCurrentUser();
  if (!u || u.role === 'admin') return all;

  if (u.role === 'project_lead' || u.username === 'lead') {
    return getLeaderProjects(u);
  }

  // Đối với Tester / Developer:
  const assignedPrjIds = new Set();
  (state.assignments || []).forEach(a => {
    if (a.assigneeUsername === u.username || (u.role === 'tester' && a.assigneeUsername === 'tester')) {
      if (a.projectId) assignedPrjIds.add(a.projectId);
    }
  });

  all.forEach(p => {
    if (p.members && Array.isArray(p.members)) {
      if (p.members.some(m => m.username === u.username)) {
        assignedPrjIds.add(p.id);
      }
    }
    if (Array.isArray(u.assignedProjects) && u.assignedProjects.includes(p.id)) {
      assignedPrjIds.add(p.id);
    }
  });

  let accessible = all.filter(p => assignedPrjIds.has(p.id));
  return accessible.length > 0 ? accessible : (all.length > 0 ? [all[0]] : []);
}

/**
 * Lấy danh sách thành viên được phân bổ vào dự án
 */
function getProjectMembers(projectId) {
  const p = (state.projects || []).find(pr => pr.id === projectId);
  if (!p) return [];
  if (!p.members) p.members = [];
  return p.members;
}

/**
 * Phân bổ người dùng từ hồ bơi nhân sự vào một dự án cụ thể
 */
function assignUserToProject(projectId, username, projectRole, title) {
  const p = (state.projects || []).find(pr => pr.id === projectId);
  if (!p) return false;
  if (!p.members) p.members = [];
  
  const existingIdx = p.members.findIndex(m => m.username === username);
  const user = (state.users || DEFAULT_SYSTEM_USERS).find(u => u.username === username);
  const memberObj = {
    username,
    name: user ? user.name : username,
    projectRole: projectRole || 'tester',
    title: title || (projectRole === 'lead' ? 'Quản trị Dự án' : (projectRole === 'dev' ? 'Kỹ sư Phần mềm' : 'Kiểm thử viên')),
    assignedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    p.members[existingIdx] = memberObj;
  } else {
    p.members.push(memberObj);
  }
  saveCoreState();
  return true;
}

/**
 * Rút người dùng khỏi dự án
 */
function removeUserFromProject(projectId, username) {
  const p = (state.projects || []).find(pr => pr.id === projectId);
  if (!p || !p.members) return false;
  p.members = p.members.filter(m => m.username !== username);
  saveCoreState();
  return true;
}

/**
 * Vào không gian làm việc chuyên biệt của Dự án
 */
function enterProjectWorkspace(projectId, targetUrl = '') {
  state.activeProjectId = projectId;
  sessionStorage.setItem('smartvms_active_project_id', projectId);
  saveCoreState();
  const currentPath = (window.location.pathname || '').toLowerCase();
  let dest = targetUrl;
  if (!dest) {
    if (currentPath.includes('/admin/')) {
      dest = '../lead/index.html';
    } else {
      dest = 'index.html';
    }
  }
  const sep = dest.includes('?') ? '&' : '?';
  window.location.href = dest + sep + 'projectId=' + encodeURIComponent(projectId);
}

/**
 * Rời không gian dự án, quay lại Cổng Quản Trị Cấp Cao Hệ Thống
 */
function exitProjectWorkspace(targetUrl = 'index.html') {
  window.location.href = targetUrl;
}

function getAllTcs(version, projectId) {
  const p = projectId ? (state.projects || []).find(pr => pr.id === projectId) : getActiveProject();
  if (!p) return [];
  let tcs = p.testCases || [];
  if (version) {
    const normTarget = (version || '').trim().toLowerCase();
    tcs = tcs.filter(tc => {
      const tcVer = (tc.version || '').trim().toLowerCase();
      if (tcVer) {
        return tcVer === normTarget;
      }
      // Hỗ trợ tương thích ngược: Chỉ nhận nếu dự án có đúng 1 phiên bản duy nhất
      const vers = p.versions || [];
      if (vers.length === 1 && (vers[0].version || vers[0] || '').trim().toLowerCase() === normTarget) {
        return true;
      }
      return false;
    });
  }
  return tcs;
}

/**
 * Lấy danh sách Kịch bản kiểm thử (Test Cases) của dự án mà User có quyền xem/thực thi.
 * - Admin, Project Lead: Toàn bộ kịch bản dự án
 * - Tester: Chỉ các kịch bản được phân công đích danh trong state.assignments
 */
function getAccessibleTcsForUser(user, projectId, version) {
  const p = projectId ? (state.projects || []).find(pr => pr.id === projectId) : getActiveProject();
  if (!p) return [];
  const allTcs = getAllTcs(version, p.id);
  const u = user || getCurrentUser();
  const isTesterPortal = (window.location.pathname || '').toLowerCase().includes('/tester/');
  if (!isTesterPortal && (!u || u.role === 'admin' || u.role === 'project_lead')) return allTcs;

  const myAssignedTcIds = new Set(
    (state.assignments || [])
      .filter(a => a.projectId === p.id && (a.assigneeUsername === u.username || a.assigneeUsername === 'tester'))
      .map(a => a.tcId)
  );

  return allTcs.filter(tc => myAssignedTcIds.has(tc.id));
}

function getModules(version, projectId) {
  const p = projectId ? (state.projects || []).find(pr => pr.id === projectId) : getActiveProject();
  if (!p) return [];
  let mods = p.modules || [];
  if (version) {
    const normTarget = (version || '').trim().toLowerCase();
    // Lấy danh sách module thực sự có kịch bản thuộc phiên bản này
    const vTcs = getTestCasesForVersion(p.id, version);
    const activeModIds = new Set(vTcs.map(t => t.moduleId || t.module).filter(Boolean));

    mods = mods.filter(m => {
      // 1. Phân hệ có kịch bản thuộc phiên bản này
      if (activeModIds.has(m.id)) return true;
      // 2. Phân hệ được gắn tag m.versions chỉ định rõ phiên bản này
      if (Array.isArray(m.versions) && m.versions.length > 0) {
        return m.versions.some(v => (v || '').trim().toLowerCase() === normTarget);
      }
      // Hỗ trợ tương thích ngược: Chỉ tự động nhận nếu dự án chỉ có đúng 1 phiên bản duy nhất
      const vers = p.versions || [];
      if (vers.length === 1 && (vers[0].version || vers[0] || '').trim().toLowerCase() === normTarget) {
        return true;
      }
      return false;
    });
  }
  return mods;
}

function getTestCasesForModule(moduleId, version, projectId) {
  const tcs = getAllTcs(version, projectId);
  return tcs.filter(t => t.module === moduleId);
}

/**
 * Lấy danh sách Phân hệ (Modules) mà User có bài test được phân công.
 */
function getAccessibleModulesForUser(user, projectId) {
  const u = user || getCurrentUser();
  const isTesterPortal = (window.location.pathname || '').toLowerCase().includes('/tester/');
  if (!isTesterPortal && (!u || u.role === 'admin' || u.role === 'project_lead')) return getModules(undefined, projectId);

  const tcs = getAccessibleTcsForUser(u, projectId);
  const modIds = new Set(tcs.map(t => t.module));
  const p = projectId ? (state.projects || []).find(pr => pr.id === projectId) : getActiveProject();
  if (!p) return [];
  return (p.modules || []).filter(m => modIds.has(m.id));
}

function getModuleName(modId) {
  const mods = getModules();
  const m = mods.find(mod => mod.id === modId);
  return m ? `[${m.id}] ${m.name}` : modId;
}

/**
 * Ghi nhật ký thực thi (Execution Audit Log - ISO/IEC/IEEE 29119-3 Clause 7)
 */
function recordExecutionLog(logData) {
  if (!state.executionLogs) state.executionLogs = [];
  const curCycle = getActiveCycle(state.activeProjectId);
  const logEntry = {
    id: 'LOG-' + Date.now(),
    cycleId: logData.cycleId || curCycle?.id || 'CYC-SMARTVMS-02',
    cycleName: logData.cycleName || curCycle?.name || 'Đợt 2 — Re-test sửa lỗi & Kiểm thử Hồi quy',
    sessionId: state.session?.id || 'SES-CURRENT',
    sessionName: state.session?.name || 'Sprint 1 - Regression Test',
    projectId: state.activeProjectId,
    executedAt: new Date().toISOString(),
    ...logData
  };
  state.executionLogs.unshift(logEntry);
  if (state.executionLogs.length > 500) state.executionLogs.pop();
  saveCoreState();
  return logEntry;
}

/**
 * Lấy danh sách nhật ký thực thi đã lọc
 */
function getTesterExecutionLogs(username, projectId) {
  const logs = state.executionLogs || [];
  return logs.filter(log => {
    if (username && log.testerUsername !== username) return false;
    if (projectId && log.projectId !== projectId) return false;
    return true;
  });
}

// ================================================================
// MULTI-PROJECT RESULT & DEFECT ISOLATION ENGINE
// Khóa kết hợp: [projectId]__[tcId] giúp cô lập tuyệt đối dữ liệu giữa các dự án
// ================================================================
function makeResultKey(tcId, projectId) {
  const pId = projectId || state.activeProjectId || 'PRJ_DEFAULT';
  return `${pId}__${tcId}`;
}

function getResultForTc(tcId, projectId) {
  if (!state.results) state.results = {};
  const pId = projectId || state.activeProjectId;
  if (pId) {
    const compoundKey = `${pId}__${tcId}`;
    if (state.results[compoundKey]) return state.results[compoundKey];
  }
  for (const k of Object.keys(state.results)) {
    const res = state.results[k];
    if (res && (res.tcId === tcId || k === tcId)) {
      if (!pId || !res.projectId || res.projectId === pId) return res;
    }
  }
  return state.results[tcId] || null;
}

function setResultForTc(tcId, resultRecord, projectId) {
  if (!state.results) state.results = {};
  const pId = projectId || state.activeProjectId || (getActiveProject()?.id) || 'PRJ_DEFAULT';
  const compoundKey = `${pId}__${tcId}`;
  
  resultRecord.projectId = pId;
  resultRecord.tcId = tcId;
  state.results[compoundKey] = resultRecord;
  // Đồng thời lưu vào key phẳng nếu chưa có để tương thích ngược code cũ
  state.results[tcId] = resultRecord;
  saveCoreState();
  return resultRecord;
}

/**
 * Lấy danh sách toàn bộ lỗi (Defects) của một dự án cụ thể
 */
function getProjectDefects(projectId) {
  const pId = projectId || state.activeProjectId;
  if (!pId) return [];
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return [];

  const tcMap = {};
  (p.testCases || []).forEach(t => { tcMap[t.id] = t; });

  const defects = [];
  const seenTcIds = new Set();

  Object.keys(state.results || {}).forEach(key => {
    const res = state.results[key];
    if (!res) return;
    
    // Kiểm tra xem record có thuộc dự án này không
    // Tuyệt đối không lấy defect nếu record rõ ràng thuộc dự án khác
    if (res.projectId && res.projectId !== pId) return;

    // Phải khớp projectId hoặc key bắt đầu bằng `${pId}__`
    const isExplicitProject = res.projectId === pId || key.startsWith(pId + '__');
    const actualTcId = res.tcId || key.replace(/^[A-Za-z0-9_-]+__/, '');
    const tc = tcMap[actualTcId];
    if (!tc) return; // Kịch bản phải thuộc dự án này!

    // Lấy danh sách đợt test hợp lệ của dự án này
    const projectCycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(pId) : (p.testCycles || []);
    const projectCycleIds = new Set(projectCycles.map(c => c.id));

    // Nếu không có explicit projectId, bắt buộc res.cycleId phải thuộc về một đợt test của dự án này
    if (!isExplicitProject && (!res.cycleId || !projectCycleIds.has(res.cycleId))) {
      return;
    }

    // Nếu dự án chưa có bất kỳ đợt test nào, không thể có lỗi từ thực thi kiểm thử!
    if (projectCycles.length === 0 && !res.cycleId) {
      return;
    }

    if (seenTcIds.has(actualTcId)) return;

    if (res.status === 'Fail' || res.status === 'FAILED' || res.status === 'Blocked' || res.failReason || (res.defectStatus && res.defectStatus !== 'None')) {
      seenTcIds.add(actualTcId);
      defects.push({
        projectId: pId,
        projectName: p.name,
        tcId: actualTcId,
        module: tc.module || 'M01',
        tcTitle: tc.name || tc.title || actualTcId,
        failReason: res.failReason || 'Phát hiện lỗi trong quá trình thực thi kiểm thử',
        severity: res.severity || tc.severity || 'Critical',
        priority: res.priority || tc.priority || 'P2',
        version: res.version || res.targetVersion || res.detectedInVersion || tc.version || p.activeVersion || '',
        detectedInVersion: res.detectedInVersion || res.version || tc.version || p.activeVersion || '',
        defectStatus: res.defectStatus || 'New',
        tester: res.tester || 'Kiểm thử viên',
        assignedDev: res.assignedDev || '',
        fixVersion: res.fixVersion || '',
        commitHash: res.commitHash || '',
        runAt: res.runAt,
        devNotes: res.devNotes || '',
        cycleId: res.cycleId || '',
        cycleName: res.cycleName || ''
      });
    }
  });

  // Đồng thời liên thông cả các lỗi phát sinh ngoài kịch bản (Ad-hoc defects) của dự án này
  const adhocList = state.adhocDefects || [];
  adhocList.forEach(ad => {
    if ((ad.projectId === pId || (!ad.projectId && pId === state.activeProjectId)) && !seenTcIds.has(ad.id)) {
      seenTcIds.add(ad.id);
      defects.push({
        projectId: pId,
        projectName: p.name,
        tcId: ad.id,
        module: ad.module || 'M01',
        tcTitle: `[Ngoài KB] ${ad.title}`,
        failReason: ad.actualResult || ad.stepsToReproduce || ad.title,
        severity: ad.severity ? ad.severity.replace(/^[SP][0-9]-/, '') : 'Critical',
        priority: ad.priority ? ad.priority.slice(0, 2) : 'P2',
        version: ad.version || p.activeVersion || '',
        detectedInVersion: ad.detectedInVersion || ad.version || p.activeVersion || '',
        defectStatus: ad.status === 'RESOLVED' ? 'Resolved' : (ad.status === 'CLOSED' ? 'Closed' : (ad.status || 'New')),
        tester: ad.reporterName || 'Kiểm thử viên',
        assignedDev: ad.assignedDev || '',
        fixVersion: ad.fixVersion || '',
        commitHash: ad.commitHash || '',
        runAt: ad.reportedAt,
        devNotes: ad.devNotes || '',
        cycleId: '',
        cycleName: 'Ngoài kịch bản (Ad-hoc)',
        isAdhoc: true
      });
    }
  });

  return defects;
}

// ================================================================
// AD-HOC DEFECT / INCIDENT REPORTING (ISO/IEC/IEEE 29119-3 Clause 8)
// ================================================================
function getDefectTypeLabel(type) {
  const map = {
    'MISSING_FEATURE': 'Thiếu tính năng / Chưa có trong đặc tả',
    'CRASH': 'Treo / Crash hệ thống',
    'LOGIC': 'Sai lệch Logic / Tính toán',
    'UI_UX': 'Lỗi Giao diện & Trải nghiệm',
    'SECURITY': 'Lỗ hổng Bảo mật & Phân quyền',
    'HARDWARE': 'Xung đột Thiết bị ngoại vi (Camera/Reader)'
  };
  return map[type] || type || 'Lỗi phát sinh ngoài kịch bản';
}

function recordAdhocDefect(defectData) {
  if (!state.adhocDefects) state.adhocDefects = [];
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(state.adhocDefects.length + 1).padStart(3, '0');
  const defectId = `INC-${dateStr}-${seq}`;

  const u = getCurrentUser();
  const newDefect = {
    id: defectId,
    projectId: defectData.projectId || state.activeProjectId,
    module: defectData.module || 'M01',
    title: defectData.title || 'Lỗi phát sinh ngoài kịch bản',
    defectType: defectData.defectType || 'MISSING_FEATURE',
    severity: defectData.severity || 'S2-Critical',
    priority: defectData.priority || 'P2-High',
    stepsToReproduce: defectData.stepsToReproduce || '',
    actualResult: defectData.actualResult || '',
    expectedResult: defectData.expectedResult || '',
    environment: defectData.environment || 'Web Browser',
    evidences: defectData.evidences || [],
    reporterUsername: u ? u.username : 'tester',
    reporterName: u ? u.name : 'Nguyễn Văn Nam (Tester)',
    reportedAt: now.toISOString(),
    suggestConvertToTc: defectData.suggestConvertToTc !== false,
    status: 'PENDING_REVIEW', // 'PENDING_REVIEW' | 'CONVERTED_TO_TC' | 'ASSIGNED_DEV' | 'RESOLVED' | 'REJECTED'
    assignedDev: defectData.assignedDev || '',
    convertedTcId: ''
  };

  state.adhocDefects.unshift(newDefect);

  // Tự động đồng bộ sang Nhật ký thực thi (Execution Audit Trail)
  recordExecutionLog({
    tcId: defectId,
    tcName: `[LỖI NGOÀI KỊCH BẢN] ${newDefect.title}`,
    module: newDefect.module,
    testerUsername: newDefect.reporterUsername,
    testerName: newDefect.reporterName,
    status: 'Fail',
    actualResult: newDefect.actualResult,
    failReason: `[Phát sinh ngoài kịch bản: ${getDefectTypeLabel(newDefect.defectType)}] ${newDefect.title}`,
    defectCategory: getDefectTypeLabel(newDefect.defectType),
    severity: newDefect.severity,
    assignedDev: newDefect.assignedDev,
    evidenceCount: newDefect.evidences ? newDefect.evidences.length : 0,
    isAdhoc: true
  });

  saveCoreState();
  return newDefect;
}

function getAdhocDefects(projectId) {
  const all = state.adhocDefects || [];
  const pId = projectId || state.activeProjectId;
  return all.filter(d => !pId || d.projectId === pId);
}

function updateAdhocDefectStatus(defectId, newStatus, extraData = {}) {
  const defect = (state.adhocDefects || []).find(d => d.id === defectId);
  if (!defect) return null;
  defect.status = newStatus;
  if (extraData.assignedDev) defect.assignedDev = extraData.assignedDev;
  if (extraData.convertedTcId) defect.convertedTcId = extraData.convertedTcId;
  saveCoreState();
  return defect;
}

// ================================================================
// TEST CLASSIFICATION & TEST SUITES (ISO/IEC 25010 & ISO 29119-2)
// ================================================================
function classifyTestCase(t) {
  if (t.type && t.suite && t.type !== 'Chức năng') return { type: t.type, suite: t.suite };
  const n = (t.name + ' ' + (t.precondition||'') + ' ' + (t.testData||'') + ' ' + (t.steps||[]).join(' ')).toLowerCase();
  
  if (t.module === 'M11' || n.includes('camera') || n.includes('barie') || n.includes('barrier') || n.includes('rfid') || n.includes('mifare') || n.includes('cccd') || n.includes('đầu đọc') || n.includes('máy in') || n.includes('ngoại vi') || n.includes('phần cứng') || n.includes('deviceservice')) {
    if (n.includes('hỏng') || n.includes('mất kết nối') || n.includes('rút cáp') || n.includes('chịu lỗi') || n.includes('offline') || n.includes('cúp điện')) {
      return { type: 'Độ tin cậy', suite: 'FAILOVER_OFFLINE' };
    }
    return { type: 'Tích hợp', suite: 'INTEGRATION_HW' };
  }
  if (t.module === 'M12' || n.includes('chịu lỗi') || n.includes('offline') || n.includes('mất mạng') || n.includes('ngoại tuyến') || n.includes('đồng bộ') || n.includes('khôi phục') || n.includes('toàn vẹn')) {
    return { type: 'Độ tin cậy', suite: 'FAILOVER_OFFLINE' };
  }
  if (n.includes('bảo mật') || n.includes('phân quyền') || n.includes('khóa') || n.includes('mật khẩu') || n.includes('mạo danh') || n.includes('từ chối') || n.includes('trái phép') || n.includes('gian lận') || n.includes('thẻ mất') || n.includes('vượt quyền')) {
    return { type: 'Bảo mật', suite: 'SECURITY_FRAUD' };
  }
  if (n.includes('hiệu năng') || n.includes('tải') || n.includes('cao điểm') || n.includes('độ trễ') || n.includes('tốc độ') || n.includes('đồng thời') || n.includes('hàng loạt')) {
    return { type: 'Hiệu năng', suite: 'PERF_STRESS' };
  }
  if (n.includes('thất bại') || n.includes('lỗi') || n.includes('sai') || n.includes('không hợp lệ') || n.includes('trùng lặp') || n.includes('xung đột') || n.includes('giới hạn') || n.includes('rỗng') || n.includes('quá hạn') || n.includes('quá số') || n.includes('ngoại lệ')) {
    return { type: 'Ngoại lệ', suite: 'REGRESSION' };
  }
  return { type: 'Chức năng', suite: t.priority === 'P1' ? 'SMOKE' : 'REGRESSION' };
}

function getTestTypeBadge(type) {
  const t = (type || 'Chức năng').trim();
  if (t.includes('Bảo mật') || t.includes('Security')) return '<span class="badge" style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca; font-size:10.5px">🛡️ Bảo mật</span>';
  if (t.includes('Hiệu năng') || t.includes('Performance') || t.includes('Stress')) return '<span class="badge" style="background:#fefce8; color:#854d0e; border:1px solid #fef08a; font-size:10.5px">⏱️ Hiệu năng</span>';
  if (t.includes('Tích hợp') || t.includes('Integration') || t.includes('Ngoại vi')) return '<span class="badge" style="background:#f5f3ff; color:#5b21b6; border:1px solid #ddd6fe; font-size:10.5px">🔌 Tích hợp</span>';
  if (t.includes('Ngoại lệ') || t.includes('Negative') || t.includes('Biên')) return '<span class="badge" style="background:#fff7ed; color:#9a3412; border:1px solid #fed7aa; font-size:10.5px">⚡ Ngoại lệ</span>';
  if (t.includes('Độ tin cậy') || t.includes('Chịu lỗi') || t.includes('Offline') || t.includes('Ngoại tuyến')) return '<span class="badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:10.5px">📶 Chịu lỗi</span>';
  return '<span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:10.5px">📋 Chức năng</span>';
}

function getTestSuiteLabel(suite) {
  const map = {
    'SMOKE': '⚡ Kiểm thử Smoke',
    'REGRESSION': '🔄 Kiểm thử hồi quy',
    'ACCEPTANCE': '📋 Nghiệm thu UAT',
    'INTEGRATION_HW': '🔌 Tích hợp thiết bị và ngoại vi',
    'SECURITY_FRAUD': '🛡️ Bảo mật và chống gian lận',
    'PERF_STRESS': '⏱️ Tải cao điểm và hiệu năng',
    'FAILOVER_OFFLINE': '📶 Ngoại tuyến và chịu lỗi'
  };
  return map[suite] || suite || 'Kiểm thử hồi quy';
}

// ================================================================
// TEST CYCLES & MULTI-ROUND ARCHITECTURE (ISO/IEC/IEEE 29119-2/3)
// ================================================================
function getTestCyclesForProject(projectId, version) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return [];

  // Nguồn chân lý duy nhất cho danh mục đợt test của dự án là p.testCycles
  const projectCycles = Array.isArray(p.testCycles) ? p.testCycles : [];
  let list = projectCycles.map(c => ({ ...c, projectId: c.projectId || pId }));
  if (version) {
    const normTarget = (version || '').trim().toLowerCase();
    list = list.filter(c => {
      if (!c.version) return false;
      return (c.version || '').trim().toLowerCase() === normTarget;
    });
  }
  return list;
}

function getActiveCycle(projectId, version) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  const v = version || p?.activeVersion;
  const cycles = getTestCyclesForProject(pId, v);
  if (cycles.length === 0) {
    const all = getTestCyclesForProject(pId);
    return all[0] || null;
  }
  if (state.activeCycleId) {
    const found = cycles.find(c => c.id === state.activeCycleId);
    if (found) return found;
  }
  return cycles.find(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS') || cycles[0];
}

function setActiveCycle(cycleId) {
  if (!cycleId) return;
  state.activeCycleId = cycleId;
  saveCoreState();
}

function getCycleById(cycleId) {
  if (!cycleId) return null;
  const p = getActiveProject();
  if (p && Array.isArray(p.testCycles)) {
    const found = p.testCycles.find(c => c.id === cycleId);
    if (found) return found;
  }
  return (state.testCycles || []).find(c => c.id === cycleId) || null;
}

/**
 * Lấy danh mục Kịch bản thuộc về một Phiên bản cụ thể
 * Đảm bảo nguyên tắc cô lập phiên bản tuyệt đối (Strict Version Isolation)
 */
function getTestCasesForVersion(projectId, version) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return [];

  const allTcs = Array.isArray(p.testCases) ? p.testCases : [];

  const targetVer = (version || p.activeVersion || '').trim().toLowerCase();
  if (!targetVer) return allTcs;

  // 1. Kiểm tra xem có kịch bản nào được gán đích danh cho phiên bản này không
  const specificTcs = allTcs.filter(tc => (tc.version || '').trim().toLowerCase() === targetVer);
  if (specificTcs.length > 0) {
    return specificTcs;
  }

  // 2. Tương thích ngược: Nếu dự án CHỈ CÓ ĐÚNG 1 phiên bản duy nhất và các kịch bản chưa có tag version
  const versions = Array.isArray(p.versions) ? p.versions : [];
  if (versions.length === 1) {
    const onlyVer = (versions[0].version || versions[0] || '').trim().toLowerCase();
    if (onlyVer === targetVer) {
      return allTcs.filter(tc => !tc.version || (tc.version || '').trim().toLowerCase() === targetVer);
    }
  }

  // 3. Với dự án đa phiên bản: Nếu phiên bản chưa có kịch bản thì TRẢ VỀ RỖNG [] (0 kịch bản).
  // Tuyệt đối không tự ý kế thừa hoặc lấy kịch bản của phiên bản khác đổ vào phiên bản này.
  return [];
}

/**
 * Kế thừa toàn bộ kịch bản chuẩn của dự án cho một phiên bản cụ thể
 */
function inheritBaselineTestCases(projectId, targetVersion) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p || !targetVersion) return false;

  const baseline = (Array.isArray(p.testCases) && p.testCases.length > 0)
    ? p.testCases
    : ((window.SMARTVMS_DEFAULT_CATALOG && Array.isArray(window.SMARTVMS_DEFAULT_CATALOG.testCases))
        ? window.SMARTVMS_DEFAULT_CATALOG.testCases
        : []);

  if (!p.testCases) p.testCases = [];
  
  // Đảm bảo các kịch bản của dự án được cập nhật
  let addedCount = 0;
  baseline.forEach(btc => {
    const exists = p.testCases.some(tc => tc.id === btc.id && (tc.version === targetVersion || !tc.version));
    if (!exists) {
      const cloned = JSON.parse(JSON.stringify(btc));
      cloned.version = targetVersion;
      p.testCases.push(cloned);
      addedCount++;
    }
  });

  saveCoreState();
  if (typeof syncProjectsToLanServer === 'function') {
    syncProjectsToLanServer();
  }

  return true;
}

/**
 * Lấy danh mục Kịch bản nằm trong Phạm vi kiểm thử đã cấu hình của một Đợt test (Cycle Scope)
 */
function getTestCasesForCycle(cycleId) {
  if (!cycleId) return [];
  const c = getCycleById(cycleId);
  const p = (c && c.projectId ? (state.projects || []).find(pr => pr.id === c.projectId) : null) || getActiveProject();
  if (!p) return [];

  const targetVer = c?.version || p.activeVersion;
  const versionTcs = getTestCasesForVersion(p.id, targetVer);

  if (!c) return [];

  // Hỗ trợ cả 2 trường tên thuộc tính scopeTcIds và testCaseIds
  // QUY TẮC CỐT LÕI: KHÔNG ĐƯỢC PHÉP TỰ ĐỘNG GÁN TEST CASE CHO ĐỢT TEST.
  // Đợt test chỉ chứa đúng những kịch bản người dùng đã chủ động chọn.
  // Nếu chưa cấu hình hoặc danh sách rỗng, trả về mảng rỗng [] (0 kịch bản).
  const chosenIds = Array.isArray(c.scopeTcIds)
    ? c.scopeTcIds
    : (Array.isArray(c.testCaseIds) ? c.testCaseIds : null);

  if (chosenIds !== null && Array.isArray(chosenIds)) {
    if (chosenIds.length === 0) return [];
    const scopeSet = new Set(chosenIds);
    return versionTcs.filter(tc => scopeSet.has(tc.id));
  }

  // Mặc định ban đầu chưa cấu hình phạm vi: 0 kịch bản
  return [];
}

/**
 * Lưu cấu hình Danh mục Kịch bản cho Đợt test (Save Cycle Scope)
 */
function saveCycleScope(cycleId, scopeTcIds, scopeType = 'CUSTOM') {
  if (!cycleId) return false;

  const validIds = Array.from(new Set(scopeTcIds || []));

  // 1. Cập nhật trong state.testCycles
  if (!state.testCycles) state.testCycles = [];
  let cState = state.testCycles.find(x => x.id === cycleId);
  if (cState) {
    cState.scopeTcIds = validIds;
    cState.testCaseIds = validIds;
    cState.scopeType = scopeType;
  }

  // 2. Cập nhật trong project.testCycles
  const p = getActiveProject();
  if (p) {
    if (!p.testCycles) p.testCycles = [];
    let cProj = p.testCycles.find(x => x.id === cycleId);
    if (cProj) {
      cProj.scopeTcIds = validIds;
      cProj.testCaseIds = validIds;
      cProj.scopeType = scopeType;
    } else if (cState) {
      p.testCycles.push(JSON.parse(JSON.stringify(cState)));
    }
  }

  saveCoreState();
  if (typeof syncProjectsToLanServer === 'function') {
    syncProjectsToLanServer();
  }

  window.dispatchEvent(new CustomEvent('cycle-scope-updated', {
    detail: { cycleId, count: validIds.length }
  }));

  return true;
}

/**
 * Lưu cấu hình Phân bổ Nhân sự (Kiểm thử viên) cho Đợt test (Save Cycle Staffing Allocation)
 * Tuân thủ nguyên tắc: Cấu hình nhân sự tham gia đợt kiểm thử tại Không gian Phiên bản / Kịch bản,
 * sau đó tại Đợt kiểm thử sẽ căn cứ vào danh sách nhân sự này để phân bổ testcase.
 */
function saveCycleStaffing(cycleId, assignedTesters, assignedDevs = []) {
  if (!cycleId) return false;

  const validTesters = Array.from(new Set(Array.isArray(assignedTesters) ? assignedTesters.filter(Boolean) : []));
  const validDevs = Array.from(new Set(Array.isArray(assignedDevs) ? assignedDevs.filter(Boolean) : []));

  // 1. Cập nhật trong state.testCycles
  if (!state.testCycles) state.testCycles = [];
  let cState = state.testCycles.find(x => x.id === cycleId);
  if (cState) {
    cState.assignedTesters = validTesters;
    cState.testerUsernames = validTesters;
    cState.assignedDevs = validDevs;
    cState.devUsernames = validDevs;
  }

  // 2. Cập nhật trong project.testCycles
  const p = getActiveProject();
  if (p) {
    if (!p.testCycles) p.testCycles = [];
    let cProj = p.testCycles.find(x => x.id === cycleId);
    if (cProj) {
      cProj.assignedTesters = validTesters;
      cProj.testerUsernames = validTesters;
      cProj.assignedDevs = validDevs;
      cProj.devUsernames = validDevs;
    } else if (cState) {
      p.testCycles.push(JSON.parse(JSON.stringify(cState)));
    }
  }

  saveCoreState();
  if (typeof syncProjectsToLanServer === 'function') {
    syncProjectsToLanServer();
  }
  if (typeof window !== 'undefined' && window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
    window.pushCyclesToCloud(state.testCycles);
  }

  window.dispatchEvent(new CustomEvent('cycle-staffing-updated', {
    detail: { cycleId, testers: validTesters, devs: validDevs, count: validTesters.length, devCount: validDevs.length }
  }));

  return true;
}

/**
 * Lấy danh sách các Phiên bản của Dự án
 */
function getProjectVersions(projectId) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return [];
  if (Array.isArray(p.versions)) {
    return p.versions;
  }
  return [];
}

/**
 * Lấy kết quả kiểm thử thực tế của một kịch bản theo đúng Ngữ cảnh Phiên bản & Dự án
 * Đảm bảo nguyên tắc cô lập phiên bản & dự án tuyệt đối (Strict Context Isolation)
 */
function getTestResultForVersion(projectId, versionTag, tcId) {
  if (!projectId || !versionTag || !tcId) return null;
  const pId = projectId;
  const normVer = String(versionTag).trim().toLowerCase();
  
  // 1. Lấy danh sách các đợt test thực tế thuộc phiên bản này
  const cycles = typeof getTestCyclesForProject === 'function' 
    ? getTestCyclesForProject(pId, versionTag) 
    : [];
  if (!cycles || cycles.length === 0) {
    // Nếu phiên bản chưa có đợt test nào, kịch bản chưa thể có kết quả chạy!
    return null;
  }
  const cycleIds = new Set(cycles.map(c => c.id));

  // 2. Ưu tiên kiểm tra trong state.cycleResults (lưu kết quả theo từng đợt test)
  if (state.cycleResults) {
    for (const cId of cycleIds) {
      if (state.cycleResults[cId] && state.cycleResults[cId][tcId]) {
        return state.cycleResults[cId][tcId];
      }
    }
  }

  // 3. Kiểm tra trong state.results nhưng phải thẩm tra nghiêm ngặt xuất xứ record
  const scopedKey = `${pId}__${tcId}`;
  const res = state.results ? (state.results[scopedKey] || state.results[tcId]) : null;
  if (res) {
    // Nếu record có gắn projectId, bắt buộc phải trùng khớp pId
    if (res.projectId && res.projectId !== pId) return null;
    
    // Nếu record có gắn cycleId, bắt buộc phải thuộc một đợt test của phiên bản này
    if (res.cycleId) {
      return cycleIds.has(res.cycleId) ? res : null;
    }
    
    // Nếu record có gắn version, bắt buộc phải trùng khớp versionTag
    const resVer = (res.version || res.targetVersion || '').trim().toLowerCase();
    if (resVer && resVer === normVer) {
      return res;
    }
  }

  return null;
}

/**
 * Tính toán 4 chỉ số cốt lõi cho một Phiên bản
 */
function getVersionMetrics(projectId, version) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return { totalTcs: 0, modulesCount: 0, cyclesCount: 0, activeCyclesCount: 0, passCount: 0, failCount: 0, untestedCount: 0, passRate: 0, failRate: 0, untestedRate: 0 };

  const targetVer = version || p.activeVersion;
  const vTcs = getTestCasesForVersion(p.id, targetVer);
  const totalTcs = vTcs.length;

  const modulesSet = new Set();
  vTcs.forEach(tc => {
    if (tc.moduleId) modulesSet.add(tc.moduleId);
    else if (tc.module) modulesSet.add(tc.module);
  });
  const modulesCount = modulesSet.size;

  const cycles = getTestCyclesForProject(p.id, targetVer);
  const cyclesCount = cycles.length;
  const activeCyclesCount = cycles.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS').length;

  let passCount = 0;
  let failCount = 0;
  let blockedCount = 0;

  // CHỈ TÍNH KẾT QUẢ KHI PHIÊN BẢN ĐÃ CÓ ÍT NHẤT 1 ĐỢT TEST (cyclesCount > 0)
  if (cyclesCount > 0) {
    vTcs.forEach(tc => {
      const r = getTestResultForVersion(p.id, targetVer, tc.id);
      if (r) {
        const st = (r.status || '').toUpperCase();
        if (st === 'PASS') passCount++;
        else if (st === 'FAIL') failCount++;
        else if (st === 'BLOCKED') blockedCount++;
      }
    });
  }

  const passRate = totalTcs > 0 ? Math.round((passCount / totalTcs) * 100) : 0;
  const failRate = totalTcs > 0 ? Math.round((failCount / totalTcs) * 100) : 0;
  const untestedCount = Math.max(0, totalTcs - passCount - failCount - blockedCount);
  const untestedRate = totalTcs > 0 ? (cyclesCount === 0 ? 100 : Math.max(0, 100 - passRate - failRate)) : 100;

  return {
    version: targetVer,
    totalTcs,
    modulesCount,
    cyclesCount,
    activeCyclesCount,
    passCount,
    failCount,
    blockedCount,
    untestedCount,
    passRate,
    failRate,
    untestedRate
  };
}

/**
 * Tính toán 4 chỉ số cốt lõi cho một Đợt kiểm thử (Test Cycle)
 */
function getCycleMetrics(cycleId) {
  const c = getCycleById(cycleId);
  if (!c) return { totalTcs: 0, assignedCount: 0, assignedRate: 0, passCount: 0, failCount: 0, blockedCount: 0, untestedCount: 0, passRate: 0, failRate: 0, untestedRate: 0, assignees: [] };

  const scopeTcs = getTestCasesForCycle(c.id);
  const totalTcs = scopeTcs.length;

  // Lấy phân công thuộc đợt này - CHỈ SO KHỚP CHÍNH XÁC cycleId, tuyệt đối không vơ đũa phân công không có cycleId
  const asgs = (state.assignments || []).filter(a => a.cycleId === c.id);
  const assignedTcIds = new Set(asgs.map(a => a.tcId || a.testCaseId));
  // Chỉ tính phân công cho những kịch bản THỰC TẾ nằm trong phạm vi đợt test
  const assignedCount = scopeTcs.filter(tc => assignedTcIds.has(tc.id)).length;
  const assignedRate = totalTcs > 0 ? Math.round((assignedCount / totalTcs) * 100) : 0;

  // Tester usernames đã được giao bài thực tế trong phạm vi đợt test
  const validTcIdsSet = new Set(scopeTcs.map(t => t.id));
  const assigneesWithWork = Array.from(new Set(
    asgs.filter(a => validTcIdsSet.has(a.tcId || a.testCaseId))
        .map(a => a.username || a.assignee || a.assigneeUsername)
        .filter(Boolean)
  ));
  
  // Tester được phân bổ tham gia đợt (từ cấu hình đợt test)
  const assignedTesters = (Array.isArray(c.assignedTesters) && c.assignedTesters.length > 0)
    ? c.assignedTesters
    : (Array.isArray(c.testerUsernames) && c.testerUsernames.length > 0 ? c.testerUsernames : assigneesWithWork);

  let passCount = 0;
  let failCount = 0;
  let blockedCount = 0;
  const results = state.results || {};
  scopeTcs.forEach(tc => {
    const r = results[tc.id];
    if (r) {
      const st = (r.status || '').toUpperCase();
      if (st === 'PASS') passCount++;
      else if (st === 'FAIL') failCount++;
      else if (st === 'BLOCKED') blockedCount++;
    }
  });

  const passRate = totalTcs > 0 ? Math.round((passCount / totalTcs) * 100) : 0;
  const failRate = totalTcs > 0 ? Math.round((failCount / totalTcs) * 100) : 0;
  const untestedCount = Math.max(0, totalTcs - passCount - failCount - blockedCount);
  const untestedRate = totalTcs > 0 ? Math.max(0, 100 - passRate - failRate) : 0;

  // Devs phụ trách đợt test
  const assignedDevs = (Array.isArray(c.assignedDevs) && c.assignedDevs.length > 0)
    ? c.assignedDevs
    : (Array.isArray(c.devUsernames) && c.devUsernames.length > 0 ? c.devUsernames : []);

  return {
    cycle: c,
    totalTcs,
    assignedCount,
    assignedRate,
    assignees: assignedTesters,
    activeAssignees: assigneesWithWork,
    assignedTesters,
    assignedTestersCount: assignedTesters.length,
    assignedDevs,
    assignedDevsCount: assignedDevs.length,
    passCount,
    failCount,
    blockedCount,
    untestedCount,
    passRate,
    failRate,
    untestedRate
  };
}

/**
 * Kế thừa / Sao chép toàn bộ kịch bản từ Phiên bản nguồn sang Phiên bản mới
 */
function cloneVersionTestCases(projectId, sourceVersion, newVersion, newLabel, changelog) {
  const pId = projectId || state.activeProjectId;
  const p = (state.projects || []).find(x => x.id === pId) || getActiveProject();
  if (!p) return false;

  const sourceTcs = getTestCasesForVersion(p.id, sourceVersion);

  // Tạo bản sao các kịch bản với tag version mới
  const clonedTcs = sourceTcs.map(tc => {
    return {
      ...tc,
      version: newVersion,
      isCustom: true
    };
  });

  if (!p.versions) p.versions = [];
  p.versions.push({
    version: newVersion,
    label: newLabel || newVersion,
    status: 'ACTIVE',
    targetDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    changelog: changelog || `Kế thừa ${sourceTcs.length} kịch bản từ phiên bản ${sourceVersion}`
  });

  if (!p.testCases) p.testCases = [];
  p.testCases.push(...clonedTcs);

  p.activeVersion = newVersion;
  state.activeVersion = newVersion;

  saveCoreState();
  if (typeof syncProjectsToLanServer === 'function') {
    syncProjectsToLanServer();
  }

  return true;
}

/**
 * Lấy danh sách các Đợt Test mà Tester THỰC SỰ có kịch bản/nhiệm vụ được phân công.
 * Phục vụ chuẩn hóa hiển thị phân cấp theo yêu cầu người dùng:
 * Chỉ những đợt test có phân công việc mới hiển thị lên cho Tester.
 */
function getAssignedCyclesForTester(user, projectId, version) {
  const u = user || getCurrentUser();
  const pId = projectId || state.activeProjectId;
  const allCycles = getTestCyclesForProject(pId, version);
  
  // Lấy các cycleId mà Tester này có việc trong assignments
  const assignedCycleMap = {}; // cycleId -> count
  (state.assignments || []).forEach(a => {
    if ((!a.projectId || a.projectId === pId) && (a.assigneeUsername === u.username || a.assigneeUsername === 'tester')) {
      if (a.cycleId) {
        assignedCycleMap[a.cycleId] = (assignedCycleMap[a.cycleId] || 0) + 1;
      }
    }
  });

  return allCycles
    .filter(c => !!assignedCycleMap[c.id])
    .map(c => ({
      ...c,
      assignedTaskCount: assignedCycleMap[c.id] || 0
    }));
}

function addTestCycle(cycleData) {
  if (!state.testCycles) state.testCycles = [];
  const pId = cycleData.projectId || state.activeProjectId;
  const projectCycles = getTestCyclesForProject(pId);
  const nextSeq = projectCycles.length + 1;
  const code = cycleData.code || `ROUND-${nextSeq}`;
  const id = `CYC-${pId.replace('PRJ-', '')}-${String(nextSeq).padStart(2, '0')}`;
  
  const assignedTesters = Array.isArray(cycleData.assignedTesters)
    ? Array.from(new Set(cycleData.assignedTesters.filter(Boolean)))
    : (Array.isArray(cycleData.testerUsernames) ? Array.from(new Set(cycleData.testerUsernames.filter(Boolean))) : []);

  const assignedDevs = Array.isArray(cycleData.assignedDevs)
    ? Array.from(new Set(cycleData.assignedDevs.filter(Boolean)))
    : (Array.isArray(cycleData.devUsernames) ? Array.from(new Set(cycleData.devUsernames.filter(Boolean))) : []);

  const newCycle = {
    id,
    projectId: pId,
    code,
    name: cycleData.name || `Đợt ${nextSeq} — Kiểm thử ${code}`,
    version: cycleData.version || 'v2.0.0',
    startDate: cycleData.startDate || new Date().toISOString().slice(0, 10),
    endDate: cycleData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: cycleData.status || 'ACTIVE',
    targetSuite: cycleData.targetSuite || 'REGRESSION',
    description: cycleData.description || 'Đợt kiểm thử mới tạo',
    assignedTesters,
    testerUsernames: assignedTesters,
    assignedDevs,
    devUsernames: assignedDevs
  };
  
  state.testCycles.push(newCycle);
  state.activeCycleId = newCycle.id;
  saveCoreState();
  if (typeof window !== 'undefined' && window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
    window.pushCyclesToCloud(state.testCycles);
  }
  return newCycle;
}

function updateTestCycle(cycleId, updatedData) {
  if (!state.testCycles) return null;
  const cycle = state.testCycles.find(c => c.id === cycleId);
  if (!cycle) return null;

  if (updatedData.name !== undefined) cycle.name = updatedData.name.trim();
  if (updatedData.code !== undefined) cycle.code = updatedData.code.trim().toUpperCase();
  if (updatedData.version !== undefined) cycle.version = updatedData.version.trim();
  if (updatedData.startDate !== undefined) cycle.startDate = updatedData.startDate;
  if (updatedData.endDate !== undefined) cycle.endDate = updatedData.endDate;
  if (updatedData.status !== undefined) cycle.status = updatedData.status;
  if (updatedData.targetSuite !== undefined) cycle.targetSuite = updatedData.targetSuite;
  if (updatedData.description !== undefined) cycle.description = updatedData.description.trim();
  if (updatedData.assignedTesters !== undefined) {
    const list = Array.isArray(updatedData.assignedTesters) ? Array.from(new Set(updatedData.assignedTesters.filter(Boolean))) : [];
    cycle.assignedTesters = list;
    cycle.testerUsernames = list;
  }
  if (updatedData.assignedDevs !== undefined) {
    const dList = Array.isArray(updatedData.assignedDevs) ? Array.from(new Set(updatedData.assignedDevs.filter(Boolean))) : [];
    cycle.assignedDevs = dList;
    cycle.devUsernames = dList;
  }

  saveCoreState();
  if (typeof window !== 'undefined' && window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
    window.pushCyclesToCloud(state.testCycles);
  }
  return cycle;
}

/**
 * Hộp thoại Xác Nhận Xóa Chuyên Nghiệp (Enterprise Danger Confirm Modal)
 * Thay thế hoàn toàn window.confirm() nguyên thủy để không bao giờ bị trình duyệt chặn,
 * giao diện trực quan chuẩn quốc tế với cảnh báo rủi ro dữ liệu rõ ràng.
 */
/**
 * Hộp thoại Xác Nhận Xóa Chuyên Nghiệp (Enterprise Danger Confirm Modal)
 * Thay thế hoàn toàn window.confirm() nguyên thủy để không bao giờ bị trình duyệt chặn,
 * giao diện trực quan chuẩn quốc tế với bảng lượng hóa tác động dữ liệu (Impact Analysis).
 */
function showConfirmDeleteModal(options) {
  const {
    title = 'Xác nhận xóa dữ liệu',
    subtitle = 'Thao tác quản trị cấp cao • Tác động trực tiếp lên dự án và Cloud',
    itemBadge = '⚠️ DỮ LIỆU KIỂM THỬ',
    itemName = '',
    projectTitle = '',
    impactStats = [],
    warningText = 'Hành động này sẽ xóa dữ liệu vĩnh viễn và không thể hoàn tác.',
    confirmText = '🗑️ Xác nhận xóa vĩnh viễn',
    onConfirm = null
  } = options || {};

  let modalEl = document.getElementById('modal-sqtm-confirm-delete');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'modal-sqtm-confirm-delete';
    modalEl.className = 'modal sqtm-confirm-modal';
    modalEl.style.zIndex = '99999';
    document.body.appendChild(modalEl);
  } else {
    modalEl.className = 'modal sqtm-confirm-modal';
  }

  // Render các chỉ số lượng hóa tác động (Impact Stats)
  let impactHtml = '';
  if (Array.isArray(impactStats) && impactStats.length > 0) {
    impactHtml = `
      <div style="margin-top:2px">
        <div style="font-size:11.5px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px">
          📊 Lượng hóa tác động dữ liệu:
        </div>
        <div class="sqtm-impact-grid">
          ${impactStats.map(stat => `
            <div class="sqtm-impact-item">
              <span class="sqtm-impact-val" style="color:${stat.color || 'var(--text-primary)'}">
                ${stat.icon ? `<span>${stat.icon}</span>` : ''}
                <span>${escapeHtml(String(stat.value))}</span>
              </span>
              <span class="sqtm-impact-lbl">${escapeHtml(stat.label)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  modalEl.innerHTML = `
    <div class="modal-box">
      <!-- Header -->
      <div class="modal-header" style="border-bottom:1px solid var(--border); padding:16px 22px; display:flex; align-items:center; justify-content:space-between">
        <div style="display:flex; align-items:center; gap:12px">
          <div class="sqtm-danger-badge">
            🗑️
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#ef4444; letter-spacing:0.3px">
              ${escapeHtml(title)}
            </h3>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px">
              ${escapeHtml(subtitle)}
            </div>
          </div>
        </div>
        <button type="button" class="btn-close" id="btn-sqtm-confirm-close" title="Đóng">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body" style="padding:20px 22px; display:flex; flex-direction:column; gap:14px">
        <!-- Target Item Card -->
        <div class="sqtm-target-card">
          <div class="sqtm-target-tag">
            <span>🔴</span>
            <span>${escapeHtml(itemBadge)}</span>
          </div>
          <div class="sqtm-target-name">
            ${escapeHtml(itemName)}
          </div>
          ${projectTitle ? `
            <div class="sqtm-target-sub">
              Thuộc dự án: <strong>${escapeHtml(projectTitle)}</strong>
            </div>
          ` : ''}
        </div>

        <!-- Impact Dashboard Grid -->
        ${impactHtml}

        <!-- Danger Alert Banner -->
        <div class="sqtm-danger-alert-box">
          <div style="font-size:16px; flex-shrink:0">⚠️</div>
          <div>
            ${warningText.replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer" style="padding:14px 22px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-surface)">
        <button type="button" class="btn btn-outline btn-sm" id="btn-sqtm-confirm-cancel" style="padding:9px 18px; font-weight:700">
          Hủy bỏ
        </button>
        <button type="button" class="btn btn-sm btn-danger-confirm" id="btn-sqtm-confirm-submit">
          ${escapeHtml(confirmText)}
        </button>
      </div>
    </div>
  `;

  // Hiển thị modal
  modalEl.classList.add('active');
  modalEl.style.display = 'flex';

  const closeFn = () => {
    modalEl.classList.remove('active');
    modalEl.style.display = 'none';
  };

  document.getElementById('btn-sqtm-confirm-close').onclick = closeFn;
  document.getElementById('btn-sqtm-confirm-cancel').onclick = closeFn;

  document.getElementById('btn-sqtm-confirm-submit').onclick = async function() {
    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Đang xóa & đồng bộ Cloud...</span>';
    try {
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
      closeFn();
    } catch (err) {
      console.error('Lỗi khi thực hiện xác nhận xóa:', err);
      btn.disabled = false;
      btn.innerHTML = escapeHtml(confirmText);
      if (typeof showToast === 'function') {
        showToast(`❌ Lỗi khi xóa: ${err.message}`, 'error');
      } else {
        alert(`❌ Lỗi: ${err.message}`);
      }
    }
  };
}
if (typeof window !== 'undefined') {
  window.showConfirmDeleteModal = showConfirmDeleteModal;
}

function deleteTestCycle(cycleId) {
  if (!state.testCycles) state.testCycles = [];
  const cycle = state.testCycles.find(c => c.id === cycleId);
  const projId = cycle ? cycle.projectId : state.activeProjectId;
  
  // Xóa khỏi state.testCycles
  state.testCycles = state.testCycles.filter(c => c.id !== cycleId);

  // Xóa khỏi p.testCycles
  const p = (state.projects || []).find(x => 
    x.id === projId || 
    x.code === projId ||
    (x.id && (projId || '').replace(/-/g, ' ').toLowerCase() === x.id.replace(/-/g, ' ').toLowerCase())
  ) || getActiveProject();

  if (p && Array.isArray(p.testCycles)) {
    p.testCycles = p.testCycles.filter(c => c.id !== cycleId);
  }

  // Xóa phân công liên quan
  if (Array.isArray(state.assignments)) {
    state.assignments = state.assignments.filter(a => a.cycleId !== cycleId);
  }

  // Cập nhật đợt kích hoạt
  const remaining = projId ? getTestCyclesForProject(projId) : [];
  if (state.activeCycleId === cycleId) {
    const nextActive = remaining.find(c => c.status === 'ACTIVE') || remaining[0];
    state.activeCycleId = nextActive ? nextActive.id : null;
  }

  saveCoreState();
  if (window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function') {
    window.pushCyclesToCloud(state.testCycles);
  }
  return true;
}

/**
 * Cấu hình danh mục Test Cases cụ thể cho một Đợt kiểm thử
 */
function setCycleTestCases(cycleId, testCaseIds) {
  saveCycleScope(cycleId, testCaseIds, 'CUSTOM');
  return getCycleById(cycleId);
}

/**
 * Tính toán số liệu thống kê thực thi thực tế của một Đợt kiểm thử
 */
function getCycleExecutionStats(cycleId) {
  const cycle = getCycleById(cycleId);
  if (!cycle) return { total: 0, passed: 0, failed: 0, pending: 0, passRate: 0 };
  const cycleTcs = getTestCasesForCycle(cycleId);
  const total = cycleTcs.length;
  if (total === 0) return { total: 0, passed: 0, failed: 0, pending: 0, passRate: 0 };

  const cycleResults = (state.cycleResults || {})[cycleId] || {};
  let passed = 0;
  let failed = 0;
  let pending = 0;

  cycleTcs.forEach(tc => {
    const res = cycleResults[tc.id] || (cycleId === state.activeCycleId ? (state.results || {})[tc.id] : null);
    if (res && res.status === 'Pass') passed++;
    else if (res && (res.status === 'Fail' || res.status === 'Blocked')) failed++;
    else pending++;
  });

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  return { total, passed, failed, pending, passRate };
}

function toggleTestCycleStatus(cycleId) {
  const cycle = getCycleById(cycleId);
  if (!cycle) return null;
  cycle.status = cycle.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
  saveCoreState();
  return cycle;
}

function getTestCaseCycleHistory(tcId, projectId) {
  const pId = projectId || state.activeProjectId;
  const cycles = getTestCyclesForProject(pId);
  const cycleResults = state.cycleResults || {};
  return cycles.map(c => {
    const res = (cycleResults[c.id] || {})[tcId] || null;
    return {
      cycleId: c.id,
      cycleCode: c.code,
      cycleName: c.name,
      version: c.version,
      cycleStatus: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      result: res
    };
  });
}

/**
 * Tổng hợp thông tin lịch sử thực thi của Test Case ở các đợt test trước
 * Được dùng chung giữa Cấu hình đợt test, Giao việc Tester và Báo cáo
 */
function getTcPriorExecutionSummary(tcId, currentCycleId, projectId) {
  const pId = projectId || state.activeProjectId;
  const history = typeof getTestCaseCycleHistory === 'function' ? getTestCaseCycleHistory(tcId, pId) : [];
  const cycleResults = state.cycleResults || {};

  // Lọc các đợt test trước hoặc khác đợt hiện tại có ghi nhận kết quả
  const priorRuns = history.filter(h => h.cycleId !== currentCycleId && h.result && h.result.status);

  let lastStatus = 'UNTESTED';
  let lastCycleCode = '';
  let lastCycleName = '';
  let lastFailReason = '';
  let lastActualResult = '';
  let lastRunAt = '';
  let lastTester = '';

  if (priorRuns.length > 0) {
    const latestPrior = priorRuns[priorRuns.length - 1];
    const s = (latestPrior.result.status || '').toUpperCase();
    lastCycleCode = latestPrior.cycleCode || latestPrior.cycleId;
    lastCycleName = latestPrior.cycleName || lastCycleCode;
    lastFailReason = latestPrior.result.failReason || '';
    lastActualResult = latestPrior.result.actualResult || '';
    lastRunAt = latestPrior.result.runAt || '';
    lastTester = latestPrior.result.tester || '';
    if (s === 'FAIL' || s === 'FAILED') lastStatus = 'FAIL';
    else if (s === 'BLOCKED') lastStatus = 'BLOCKED';
    else if (s === 'PASS' || s === 'PASSED') lastStatus = 'PASS';
  }

  // Đánh dấu nếu từng có bất kỳ đợt nào bị lỗi
  const hadFailure = priorRuns.some(h => {
    const s = (h.result?.status || '').toUpperCase();
    return s === 'FAIL' || s === 'FAILED' || s === 'BLOCKED';
  });

  return {
    lastStatus,
    lastCycleCode,
    lastCycleName,
    lastFailReason,
    lastActualResult,
    lastRunAt,
    lastTester,
    hadFailure,
    priorRunsCount: priorRuns.length,
    currentRun: (cycleResults[currentCycleId] || {})[tcId] || null
  };
}

function getHierarchyContext(projectId, cycleId, tcId) {
  const prj = (state.projects || []).find(p => p.id === (projectId || state.activeProjectId)) || getActiveProject();
  const pVersions = prj ? (typeof getProjectVersions === 'function' ? getProjectVersions(prj.id) : (prj.versions || [])) : [];
  const curVer = cycle?.version || prj?.activeVersion || (pVersions[0]?.version || pVersions[0]) || '';
  const tc = tcId ? getAllTcs(curVer, prj?.id).find(t => t.id === tcId) : null;
  const mod = tc ? getModules(curVer, prj?.id).find(m => m.id === tc.module) : null;
  
  return {
    project: prj,
    cycle: cycle,
    version: curVer,
    module: mod,
    testCase: tc,
    breadcrumbHtml: `
      <div class="hierarchy-breadcrumb">
        <span class="hb-item hb-prj" title="Dự án phần mềm">🏢 <strong>${escapeHtml(prj?.name || 'Dự án')}</strong></span>
        <span class="hb-sep">➔</span>
        <span class="hb-item hb-ver" style="background:rgba(59,130,246,0.08); color:#2563eb; border:1px solid rgba(59,130,246,0.3); padding:2px 8px; border-radius:4px; font-size:11px" title="Phiên bản phần mềm">📦 <strong>${escapeHtml(curVer)}</strong></span>
        <span class="hb-sep">➔</span>
        <span class="hb-item hb-cycle" title="Đợt kiểm thử">🎯 <strong>${escapeHtml(cycle?.name || 'Đợt kiểm thử')}</strong></span>
        ${mod ? `
          <span class="hb-sep">➔</span>
          <span class="hb-item hb-mod" title="Phân hệ nghiệp vụ">📁 <strong>[${mod.id}] ${escapeHtml(mod.name)}</strong></span>
        ` : ''}
        ${tc ? `
          <span class="hb-sep">➔</span>
          <span class="hb-item hb-tc" title="Kịch bản kiểm thử">🏷️ <strong style="color:var(--primary); font-family:monospace">[${tc.id}]</strong> ${escapeHtml(tc.name || tc.title)}</span>
        ` : ''}
      </div>
    `
  };
}

function getTestCycleStatusBadge(status) {
  const s = (status || 'ACTIVE').toUpperCase();
  if (s === 'ACTIVE') return '<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-size:10.5px">🟢 Đang mở</span>';
  if (s === 'CLOSED') return '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-size:10.5px">🔒 Đã đóng</span>';
  if (s === 'PLANNED' || s === 'DRAFT') return '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:10.5px">⏳ Kế hoạch</span>';
  return `<span class="badge" style="font-size:10.5px">${status}</span>`;
}

function switchProject(newProjId) {
  if (!newProjId) return;
  state.activeProjectId = newProjId;
  const projectCycles = getTestCyclesForProject(newProjId);
  if (projectCycles && projectCycles.length > 0) {
    const act = projectCycles.find(c => c.status === 'ACTIVE') || projectCycles[0];
    state.activeCycleId = act ? act.id : null;
  }
  saveCoreState();
  showToast(`✅ Đã chuyển sang dự án: ${getActiveProject()?.name || newProjId}`, 'success');
  window.location.reload();
}

/**
 * Cập nhật ngữ cảnh dự án đang kích hoạt (Tương thích ngược & chuyển đổi an toàn)
 */
function setActiveProject(projectId) {
  if (!projectId) return;
  state.activeProjectId = projectId;
  try {
    localStorage.setItem(SQTM_ACTIVE_PRJ_STORAGE_KEY, projectId);
    sessionStorage.setItem(SQTM_ACTIVE_PRJ_STORAGE_KEY, projectId);
    sessionStorage.setItem('smartvms_active_project_id', projectId);
  } catch (e) {}
  const projectCycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(projectId) : [];
  if (projectCycles && projectCycles.length > 0) {
    const act = projectCycles.find(c => c.status === 'ACTIVE') || projectCycles[0];
    state.activeCycleId = act ? act.id : null;
  }
  saveCoreState();
}

function addProject(projData) {
  if (!state.projects) state.projects = [];
  const code = (projData.code || '').trim().toUpperCase();
  const projId = 'PRJ-' + code;
  if (state.projects.some(p => p.id === projId || p.code === code)) {
    throw new Error(`Mã dự án "${code}" đã tồn tại trên hệ thống!`);
  }
  const initVer = (projData.activeVersion || '').trim();
  const leadUn = projData.leadUsername || projData.lead || 'lead';
  const leadObj = (state.users || []).find(u => u.username === leadUn);
  const devObj = (state.users || []).find(u => u.username === 'dev');
  const testerObj = (state.users || []).find(u => u.username === 'tester');

  const defaultMembers = [
    {
      username: leadUn,
      name: leadObj ? leadObj.name : 'Hoàng Hải Đăng',
      projectRole: 'lead',
      title: (leadObj && leadObj.role === 'admin') ? 'Quản trị viên cấp cao' : 'Trưởng dự án'
    },
    {
      username: 'dev',
      name: devObj ? devObj.name : 'Trần Quốc Tuấn',
      projectRole: 'dev',
      title: 'Lập trình viên'
    },
    {
      username: 'tester',
      name: testerObj ? testerObj.name : 'Nguyễn Văn Nam',
      projectRole: 'tester',
      title: 'Kiểm thử viên'
    }
  ];

  const newProj = {
    id: projId,
    code: code,
    name: projData.name || `Dự án ${code}`,
    domain: projData.domain || 'Hệ thống phần mềm',
    desc: projData.desc || '',
    lead: projData.lead || 'QA Lead',
    leadUsername: leadUn,
    standards: projData.standards || ['ISO/IEC 25010', 'ISO/IEC/IEEE 29119'],
    activeVersion: initVer || '',
    versions: Array.isArray(projData.versions) && projData.versions.length > 0
      ? projData.versions
      : (initVer ? [
          {
            version: initVer,
            label: `${initVer}`,
            status: 'IN_QA',
            targetDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            changelog: 'Phiên bản khởi tạo ban đầu'
          }
        ] : []),
    modules: [],
    testCases: [],
    testCycles: [],
    members: defaultMembers
  };
  state.projects.push(newProj);
  state.activeProjectId = projId;

  // Tự động phân bổ vào assignedProjects của users và tạo đợt test mặc định
  syncUserProjectsWithMembers();
  ensureDefaultTestCyclesForProjects();

  saveCoreState();
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects);
  }
  if (window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
    window.pushCyclesToCloud(state.testCycles);
  }
  if (window.pushUsersToCloud && typeof window.pushUsersToCloud === 'function' && state.users) {
    window.pushUsersToCloud(state.users);
  }
  return newProj;
}

function updateProject(projId, updatedData) {
  const p = (state.projects || []).find(x => x.id === projId);
  if (!p) throw new Error('Không tìm thấy dự án!');
  if (updatedData.name) p.name = updatedData.name.trim();
  if (updatedData.code) p.code = updatedData.code.trim().toUpperCase();
  if (updatedData.domain !== undefined) p.domain = updatedData.domain.trim();
  if (updatedData.desc !== undefined) p.desc = updatedData.desc.trim();
  if (updatedData.lead) p.lead = updatedData.lead.trim();
  if (updatedData.leadUsername) p.leadUsername = updatedData.leadUsername.trim();
  if (updatedData.standards) p.standards = updatedData.standards;
  if (updatedData.activeVersion) p.activeVersion = updatedData.activeVersion;
  saveCoreState();
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects);
  }
  return p;
}

/**
 * Phân bổ toàn diện nhân sự (Leader, Testers, Devs) cho một dự án cụ thể
 */
function assignStaffToProject(projectId, { leadUsername, leadUsernames, testerUsernames, devUsernames }) {
  const p = (state.projects || []).find(x => x.id === projectId);
  if (!p) throw new Error('Không tìm thấy dự án!');

  const allUsers = typeof getAllUsers === 'function' ? getAllUsers() : (state.users || []);

  // Hỗ trợ chọn một hoặc nhiều Leader / Quản trị viên phụ trách
  let selectedLeads = [];
  if (Array.isArray(leadUsernames) && leadUsernames.length > 0) {
    selectedLeads = leadUsernames.filter(Boolean);
  } else if (leadUsername) {
    selectedLeads = [leadUsername];
  }

  p.leadUsernames = selectedLeads;
  p.leadUsername = selectedLeads[0] || leadUsername || '';
  p.lead = selectedLeads.map(un => {
    const u = allUsers.find(x => x.username === un);
    return u ? u.name : un;
  }).join(', ') || (allUsers.find(u => u.username === p.leadUsername)?.name) || 'Chưa chỉ định';

  const selectedTesters = Array.isArray(testerUsernames) ? testerUsernames : [];
  const selectedDevs = Array.isArray(devUsernames) ? devUsernames : [];

  allUsers.forEach(u => {
    if (!u.assignedProjects) u.assignedProjects = [];

    // Nếu là Leader hoặc Admin
    if (u.role === 'project_lead' || u.role === 'admin') {
      if (selectedLeads.includes(u.username)) {
        if (!u.assignedProjects.includes(p.id)) u.assignedProjects.push(p.id);
      } else {
        u.assignedProjects = u.assignedProjects.filter(id => id !== p.id);
      }
    }

    // Cập nhật Tester
    if (u.role === 'tester') {
      if (selectedTesters.includes(u.username)) {
        if (!u.assignedProjects.includes(p.id)) u.assignedProjects.push(p.id);
      } else {
        u.assignedProjects = u.assignedProjects.filter(id => id !== p.id);
      }
    }

    // Cập nhật Developer
    if (u.role === 'developer' || u.role === 'dev') {
      if (selectedDevs.includes(u.username)) {
        if (!u.assignedProjects.includes(p.id)) u.assignedProjects.push(p.id);
      } else {
        u.assignedProjects = u.assignedProjects.filter(id => id !== p.id);
      }
    }
  });

  // Đồng bộ sang p.members
  p.members = [];
  selectedLeads.forEach(un => {
    const lu = allUsers.find(u => u.username === un);
    p.members.push({
      username: un,
      name: lu ? lu.name : un,
      projectRole: 'lead',
      title: (lu && lu.role === 'admin') ? 'Quản trị viên cấp cao' : 'Trưởng dự án'
    });
  });

  selectedTesters.forEach(un => {
    const tu = allUsers.find(u => u.username === un);
    p.members.push({
      username: un,
      name: tu ? tu.name : un,
      projectRole: 'tester',
      title: 'Kiểm thử viên'
    });
  });

  selectedDevs.forEach(un => {
    const du = allUsers.find(u => u.username === un);
    p.members.push({
      username: un,
      name: du ? du.name : un,
      projectRole: 'dev',
      title: 'Lập trình viên'
    });
  });

  saveCoreState();
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects);
  }
  if (window.pushUsersToCloud && typeof window.pushUsersToCloud === 'function') {
    window.pushUsersToCloud(state.users);
  }
  return p;
}

function deleteProject(projId) {
  if (!state.projects || state.projects.length === 0) {
    throw new Error('Không có dự án nào để xóa!');
  }
  const idx = state.projects.findIndex(p => p.id === projId);
  if (idx === -1) throw new Error('Không tìm thấy dự án cần xóa!');
  const deleted = state.projects.splice(idx, 1)[0];
  if (state.activeProjectId === projId) {
    state.activeProjectId = state.projects.length > 0 ? state.projects[0].id : null;
  }

  // 0. Cascade delete toàn bộ assignments, cycles, results và user project assignments liên quan
  if (Array.isArray(state.assignments)) {
    state.assignments = state.assignments.filter(a => a.projectId !== projId);
  }
  if (Array.isArray(state.testCycles)) {
    state.testCycles = state.testCycles.filter(c => c.projectId !== projId);
  }
  if (state.results) {
    Object.keys(state.results).forEach(k => {
      if (k.startsWith(`${projId}__`)) delete state.results[k];
    });
  }
  if (state.cycleResults) {
    const cycleIds = new Set((state.testCycles || []).filter(c => c.projectId === projId).map(c => c.id));
    cycleIds.forEach(cId => {
      delete state.cycleResults[cId];
    });
  }
  if (Array.isArray(state.users)) {
    state.users.forEach(u => {
      if (Array.isArray(u.assignedProjects)) {
        u.assignedProjects = u.assignedProjects.filter(pid => pid !== projId);
      }
    });
  }

  saveCoreState();

  // 1. Gọi Backend API DELETE để xóa vĩnh viễn khỏi Database và bộ nhớ đệm máy chủ
  if (typeof window !== 'undefined' && isLanServerAvailable()) {
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (state.currentUser) {
        headers['X-User-Info'] = encodeURIComponent(JSON.stringify(state.currentUser));
      }
      fetch(`/api/projects?id=${encodeURIComponent(projId)}`, {
        method: 'DELETE',
        headers
      }).catch(err => console.warn('Lỗi gọi API xóa dự án:', err));
    } catch (e) {}
  }

  // 2. Đồng bộ danh sách mới lên Cloud (force = true để lưu kể cả khi danh sách rỗng 0 dự án)
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects, true);
  }
  if (window.pushAssignmentsToCloud && typeof window.pushAssignmentsToCloud === 'function') {
    window.pushAssignmentsToCloud(state.assignments || [], true);
  }
  if (window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function') {
    window.pushCyclesToCloud(state.testCycles || [], true);
  }
  if (window.pushUsersToCloud && typeof window.pushUsersToCloud === 'function') {
    window.pushUsersToCloud(state.users || [], true);
  }

  // 3. Xóa qua client Supabase trực tiếp nếu có
  if (window.supabaseClient) {
    window.supabaseClient.from('projects').delete().eq('id', projId).catch(() => {});
  }

  return deleted;
}

function addProjectVersion(projId, verData) {
  const p = (state.projects || []).find(x => x.id === projId);
  if (!p) throw new Error('Không tìm thấy dự án!');
  if (!p.versions) p.versions = [];
  if (p.versions.some(v => v.version === verData.version)) {
    throw new Error(`Phiên bản ${verData.version} đã tồn tại trong dự án!`);
  }
  const newVer = {
    version: verData.version,
    label: verData.label || verData.version,
    status: verData.status || 'IN_QA',
    targetDate: verData.targetDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    changelog: verData.changelog || 'Phiên bản bổ sung'
  };
  p.versions.push(newVer);
  saveCoreState();
  return newVer;
}

function setProjectActiveVersion(projId, versionTag) {
  const p = (state.projects || []).find(x => x.id === projId);
  if (!p) throw new Error('Không tìm thấy dự án!');
  p.activeVersion = versionTag;
  saveCoreState();
  return p;
}

function deleteProjectVersion(projId, versionTag) {
  const p = (state.projects || []).find(x => 
    x.id === projId || 
    x.code === projId ||
    (x.id && (projId || '').replace(/-/g, ' ').toLowerCase() === x.id.replace(/-/g, ' ').toLowerCase())
  ) || getActiveProject();
  if (!p) throw new Error('Không tìm thấy dự án!');
  if (!p.versions || p.versions.length === 0) {
    throw new Error('Dự án không có phiên bản nào để xóa!');
  }
  const normTag = (versionTag || '').trim().toLowerCase();
  const idx = p.versions.findIndex(v => ((v.version || v) || '').trim().toLowerCase() === normTag);
  if (idx === -1) {
    throw new Error(`Không tìm thấy phiên bản "${versionTag}" trong dự án!`);
  }
  const removed = p.versions.splice(idx, 1)[0];

  // Dọn dẹp kịch bản kiểm thử gắn với phiên bản này (so khớp không phân biệt hoa thường)
  if (Array.isArray(p.testCases)) {
    p.testCases = p.testCases.filter(tc => ((tc.version || '')).trim().toLowerCase() !== normTag);
  }

  // Dọn dẹp các đợt kiểm thử gắn với phiên bản này
  if (Array.isArray(p.testCycles)) {
    p.testCycles = p.testCycles.filter(c => ((c.version || '')).trim().toLowerCase() !== normTag);
  }
  if (Array.isArray(state.testCycles)) {
    state.testCycles = state.testCycles.filter(c => !(c.projectId === projId && ((c.version || '')).trim().toLowerCase() === normTag));
  }

  // Nếu dự án đã xóa hết toàn bộ các phiên bản (p.versions.length === 0)
  // Toàn bộ kịch bản, phân hệ, đợt test tồn đọng mồ côi phải được xóa sạch hoàn toàn!
  if (p.versions.length === 0) {
    p.testCases = [];
    p.modules = [];
    p.testCycles = [];
    p.activeVersion = '';
  } else {
    // Dọn dẹp các test case mồ côi không thuộc bất kỳ phiên bản nào còn tồn tại
    const validVerSet = new Set(p.versions.map(v => ((v.version || v) || '').trim().toLowerCase()));
    if (Array.isArray(p.testCases)) {
      p.testCases = p.testCases.filter(tc => validVerSet.has(((tc.version || '')).trim().toLowerCase()));
    }
    // Dọn dẹp phân hệ mồ côi không còn phiên bản nào
    if (Array.isArray(p.modules)) {
      p.modules = p.modules.filter(m => {
        if (!m.versions || !Array.isArray(m.versions) || m.versions.length === 0) {
          return (p.testCases || []).some(tc => (tc.module === m.id || tc.module === m.name || tc.moduleName === m.name));
        }
        m.versions = m.versions.filter(v => validVerSet.has(((v.version || v) || '').trim().toLowerCase()));
        return m.versions.length > 0;
      });
    }
  }

  // Nếu phiên bản bị xóa là phiên bản hiện hành (activeVersion), chuyển sang phiên bản còn lại hoặc rỗng
  if (((p.activeVersion || '')).trim().toLowerCase() === normTag || !p.activeVersion) {
    p.activeVersion = p.versions.length > 0 ? (p.versions[0].version || p.versions[0]) : '';
    if (state.activeProjectId === projId) {
      state.activeVersion = p.activeVersion;
    }
  }

  saveCoreState();
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects);
  }
  if (window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
    window.pushCyclesToCloud(state.testCycles);
  }
  return removed;
}

// ================================================================
// USER MANAGEMENT & ROLE FUNCTIONS
// ================================================================
function getUsers() {
  if (!state.users || state.users.length === 0) {
    const saved = localStorage.getItem('smartvms_system_users_v3');
    if (saved) {
      try {
        state.users = JSON.parse(saved);
      } catch (e) {
        state.users = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
      }
    } else {
      state.users = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
    }
  }
  if (typeof syncUserProjectsWithMembers === 'function') {
    syncUserProjectsWithMembers();
  }
  return state.users;
}

function getAllUsers() {
  return getUsers();
}

function getUserById(userId) {
  return getUsers().find(u => u.id === userId);
}

function addUser(userData) {
  const users = getUsers();
  const username = (userData.username || '').trim().toLowerCase();
  if (!username) throw new Error('Tên đăng nhập không được để trống!');
  if (users.some(u => u.username.toLowerCase() === username)) {
    throw new Error(`Tên đăng nhập "${username}" đã tồn tại!`);
  }
  const role = userData.role || 'tester';
  const roleTitleMap = {
    admin: 'Quản trị viên (QA Lead)',
    tester: 'Kiểm thử viên (Tester)',
    developer: 'Lập trình viên (Developer)'
  };
  const newUser = {
    id: 'usr_' + Date.now(),
    username: username,
    password: userData.password || '123',
    name: (userData.name || username).trim(),
    role: role,
    roleTitle: roleTitleMap[role] || 'Thành viên',
    email: (userData.email || '').trim(),
    assignedProjects: Array.isArray(userData.assignedProjects) ? userData.assignedProjects : [],
    status: 'ACTIVE',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  users.push(newUser);
  state.users = users;
  saveCoreState();
  return newUser;
}

function updateUser(userId, updatedData) {
  const users = getUsers();
  const u = users.find(x => x.id === userId);
  if (!u) throw new Error('Không tìm thấy người dùng!');
  if (updatedData.name) u.name = updatedData.name.trim();
  if (updatedData.email !== undefined) u.email = updatedData.email.trim();
  if (updatedData.role) {
    u.role = updatedData.role;
    const roleTitleMap = {
      admin: 'Quản trị viên (QA Lead)',
      tester: 'Kiểm thử viên (Tester)',
      developer: 'Lập trình viên (Developer)'
    };
    u.roleTitle = roleTitleMap[u.role] || u.role;
  }
  if (updatedData.assignedProjects) u.assignedProjects = updatedData.assignedProjects;
  if (updatedData.password) u.password = updatedData.password.trim();
  saveCoreState();
  return u;
}

function toggleUserLock(userId) {
  const users = getUsers();
  const u = users.find(x => x.id === userId);
  if (!u) throw new Error('Không tìm thấy người dùng!');
  if (u.username === 'admin') {
    throw new Error('Không thể khóa tài khoản Quản trị viên cấp cao (Admin)!');
  }
  u.status = (u.status === 'LOCKED') ? 'ACTIVE' : 'LOCKED';
  saveCoreState();
  return u;
}

function resetUserPassword(userId, newPassword) {
  const users = getUsers();
  const u = users.find(x => x.id === userId);
  if (!u) throw new Error('Không tìm thấy người dùng!');
  u.password = (newPassword || '123').trim();
  saveCoreState();
  return u;
}

function deleteUser(userId) {
  const users = getUsers();
  const u = users.find(x => x.id === userId);
  if (!u) throw new Error('Không tìm thấy người dùng!');
  if (u.username === 'admin' || (state.currentUser && state.currentUser.username === u.username)) {
    throw new Error('Không thể xóa tài khoản Quản trị viên hoặc tài khoản đang đăng nhập!');
  }
  const idx = users.findIndex(x => x.id === userId);
  const deleted = users.splice(idx, 1)[0];
  state.users = users;
  saveCoreState();
  return deleted;
}

// ================================================================
// AUTHENTICATION & ROLE MANAGEMENT
// ================================================================
function getCurrentUser() {
  const users = getUsers();
  if (state.currentUser) {
    const matched = users.find(u => u.username.toLowerCase() === state.currentUser.username.toLowerCase());
    if (matched) return matched;
    return state.currentUser;
  }

  // Thử đọc từ sessionStorage / localStorage nếu state chưa kịp gán
  try {
    const rawUser = sessionStorage.getItem('smartvms_current_user') || localStorage.getItem('smartvms_current_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && parsed.username) {
        const matched = users.find(u => u.username.toLowerCase() === parsed.username.toLowerCase());
        state.currentUser = matched || parsed;
        return state.currentUser;
      }
    }
  } catch (e) {}

  // Fallback theo URL ngữ cảnh
  const path = typeof window !== 'undefined' ? (window.location.pathname || '').toLowerCase() : '';
  if (path.includes('/lead/')) {
    const leadUser = users.find(u => u.role === 'project_lead' || u.username === 'lead');
    if (leadUser) return leadUser;
  }
  if (path.includes('/tester/')) {
    const tUser = users.find(u => u.role === 'tester' || u.username === 'tester');
    if (tUser) return tUser;
  }
  if (path.includes('/dev/')) {
    const dUser = users.find(u => u.role === 'developer' || u.username === 'dev');
    if (dUser) return dUser;
  }

  return users.find(u => u.role === 'admin') || users[0] || { username: 'admin', name: 'Nguyễn Văn Huy', role: 'admin', roleTitle: 'Quản trị viên Cấp cao' };
}

function switchRole(roleTarget) {
  const users = getUsers();
  let user = users.find(u => u.role === roleTarget || u.username === roleTarget);
  if (!user) user = users[0];
  state.currentUser = user;
  saveCoreState();
  
  // Navigate to appropriate role home
  if (user.role === 'admin') {
    window.location.href = '../admin/index.html';
  } else if (user.role === 'tester') {
    window.location.href = '../tester/index.html';
  } else if (user.role === 'developer') {
    window.location.href = '../dev/index.html';
  } else if (user.role === 'project_lead' || user.username === 'lead') {
    window.location.href = '../lead/index.html';
  }
}

function handleLogout() {
  state.currentUser = null;
  try {
    sessionStorage.removeItem('smartvms_current_user');
    localStorage.removeItem('smartvms_current_user');
  } catch (e) {}
  saveCoreState();
  window.location.href = '../index.html';
}

// ================================================================
// UI HELPERS: TOAST, MODAL, LIGHTBOX, THEME
// ================================================================
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast active ${type}`;
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.add('active');
    el.classList.add('open');
  }
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.remove('active');
    el.classList.remove('open');
  }
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('smartvms_theme', next);
  state.theme = next;
  saveCoreState();
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function updateRealtimeClock() {
  const clock = document.getElementById('clock-time');
  if (clock) {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('vi-VN', { hour12: false });
  }
}
setInterval(updateRealtimeClock, 1000);

// Badges
function priorityBadge(prio) {
  const p = (prio || 'P3').toUpperCase();
  if (p === 'P1' || p === 'CRITICAL') return '<span class="badge badge-p1">🔴 Khẩn cấp (P1)</span>';
  if (p === 'P2' || p === 'HIGH') return '<span class="badge badge-p2">🟠 Cao (P2)</span>';
  if (p === 'P3' || p === 'MEDIUM') return '<span class="badge badge-p3">🟡 Trung bình (P3)</span>';
  return '<span class="badge badge-p4">🟢 Thấp (P4)</span>';
}

function statusBadge(status) {
  const s = status || 'Not Run';
  if (s === 'Pass' || s === 'PASSED') return '<span class="badge badge-pass">✅ Đạt</span>';
  if (s === 'Fail' || s === 'FAILED') return '<span class="badge badge-fail">❌ Không đạt</span>';
  if (s === 'Blocked' || s === 'BLOCKED') return '<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #f87171">⛔ Bị nghẽn</span>';
  if (s === 'Skip') return '<span class="badge badge-skip">⏭ Bỏ qua</span>';
  if (s === 'In Progress' || s === 'WIP') return '<span class="badge" style="background:#e0e7ff;color:#3730a3">⏳ Đang thực hiện</span>';
  return '<span class="badge badge-nr">⚪ Chưa chạy</span>';
}

// ISO 9001 / ISO 29119 Test Case Helpers
function isCustomTc(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  return !!(tc && tc.isCustom);
}

function isOverriddenTc(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  return !!(tc && tc.isOverridden);
}

function resetBuiltinTc(tcId) {
  const catalog = window.SMARTVMS_DEFAULT_CATALOG || window.SMARTVMS_TEST_CATALOG;
  if (!catalog || !catalog.testCases) {
    showToast('⚠️ Không tìm thấy tệp catalog chuẩn để khôi phục!', 'error');
    return false;
  }
  const orig = catalog.testCases.find(t => t.id === tcId);
  if (!orig) {
    showToast(`⚠️ Không tìm thấy kịch bản chuẩn gốc của [${tcId}]!`, 'error');
    return false;
  }
  const p = getActiveProject();
  if (!p) return false;
  const idx = (p.testCases || []).findIndex(t => t.id === tcId);
  if (idx !== -1) {
    p.testCases[idx] = JSON.parse(JSON.stringify(orig));
    if (!p.testCases[idx].title) p.testCases[idx].title = p.testCases[idx].name;
    if (!p.testCases[idx].name) p.testCases[idx].name = p.testCases[idx].title;
    saveCoreState();
    showToast(`🔄 Đã khôi phục kịch bản chuẩn [${tcId}] về nguyên bản gốc!`, 'success');
    return true;
  }
  return false;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lightbox
function openLightbox(src, title) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const t = document.getElementById('lightbox-title');
  if (modal && img) {
    img.src = src;
    if (t) t.textContent = title || 'Ảnh chụp bằng chứng lỗi';
    modal.classList.add('active');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Lấy ngữ cảnh cấp bậc 4 tầng hoàn chỉnh (4-Tier Hierarchy Context)
 */
function getHierarchyContext() {
  const p = getActiveProject();
  const versions = p ? getProjectVersions(p.id) : [];

  const params = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlVer = params.get('version');
  let currentVer = '';
  if (versions.length > 0) {
    currentVer = urlVer || state.activeVersion || p?.activeVersion || (versions[0]?.version || versions[0]) || '';
    if (!versions.some(v => (v.version || v) === currentVer)) {
      currentVer = versions[0].version || versions[0];
    }
  }

  const cycles = p ? getTestCyclesForProject(p.id, currentVer) : [];

  const urlCycleId = params.get('cycleId');
  let currentCycle = null;
  if (urlCycleId && cycles.some(c => c.id === urlCycleId)) {
    currentCycle = cycles.find(c => c.id === urlCycleId);
  } else if (state.activeCycleId && cycles.some(c => c.id === state.activeCycleId)) {
    currentCycle = cycles.find(c => c.id === state.activeCycleId);
  } else {
    currentCycle = cycles.find(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS') || cycles[0] || null;
  }

  let currentTier = 1;
  const path = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
  if (path.includes('index.html') || path.endsWith('/lead/') || path.endsWith('/lead')) {
    currentTier = 0;
  } else if (path.includes('version.html')) {
    currentTier = 2;
  } else if (path.includes('assignments.html') || path.includes('testcases.html') || path.includes('reports.html') || path.includes('cycle.html')) {
    currentTier = 3;
  } else if (path.includes('project.html')) {
    currentTier = 1;
  }

  return {
    tier: currentTier,
    project: p,
    projects: typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects(),
    version: currentVer,
    versions: versions,
    cycle: currentCycle,
    cycles: cycles
  };
}

if (typeof window !== 'undefined') {
  window.state = state;
  window.syncUserProjectsWithMembers = syncUserProjectsWithMembers;
  window.getAllUsers = getAllUsers;
  window.getUsers = getUsers;
  window.getCurrentUser = getCurrentUser;
  window.getAllProjects = getAllProjects;
  window.getLeaderProjects = getLeaderProjects;
  window.getAccessibleProjects = getAccessibleProjects;
  window.initCoreState = initCoreState;
  window.assignStaffToProject = assignStaffToProject;
  window.saveCoreState = saveCoreState;
  window.getTestCyclesForProject = getTestCyclesForProject;
  window.getActiveCycle = getActiveCycle;
  window.getCycleById = getCycleById;
  window.deleteTestCycle = deleteTestCycle;
  window.deleteProject = deleteProject;
  window.getTestCasesForCycle = getTestCasesForCycle;
  window.getTestCasesForVersion = getTestCasesForVersion;
  window.saveCycleScope = saveCycleScope;
  window.saveCycleStaffing = saveCycleStaffing;
  window.addProjectVersion = addProjectVersion;
  window.deleteProjectVersion = deleteProjectVersion;
  window.getProjectVersions = getProjectVersions;
  window.getVersionMetrics = getVersionMetrics;
  window.getCycleMetrics = getCycleMetrics;
  window.getHierarchyContext = getHierarchyContext;
  window.inheritBaselineTestCases = inheritBaselineTestCases;
}

// Initialize on script load
initCoreState();
