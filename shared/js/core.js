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
    roleTitle: 'Quản trị viên Dự án (Project Lead)',
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
    roleTitle: 'Kiểm thử viên 1 (Tester)',
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
    roleTitle: 'Kiểm thử viên 2 (Tester)',
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
    roleTitle: 'Kiểm thử viên 3 (Tester)',
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
    roleTitle: 'Lập trình viên (Developer)',
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

  // 2. Khôi phục Active Project ID
  try {
    const savedActiveId = localStorage.getItem(SQTM_ACTIVE_PRJ_STORAGE_KEY) || 
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

  // 4. Nếu đang chạy qua HTTP Server LAN, tự động gọi ngầm để đồng bộ từ máy chủ LAN
  if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    fetchProjectsFromLanServer();
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

    // 3. Quét từng thành viên trong p.members để cập nhật vào assignedProjects của user
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
 * Tự động đảm bảo mỗi dự án luôn có ít nhất một đợt test mặc định để sẵn sàng phân công công việc
 */
function ensureDefaultTestCyclesForProjects() {
  if (!state.projects || !Array.isArray(state.projects)) return;
  if (!state.testCycles) state.testCycles = [];

  state.projects.forEach(p => {
    const pCycles = state.testCycles.filter(c => c.projectId === p.id);
    if (pCycles.length === 0) {
      const ver = p.activeVersion || 'v1.0';
      const defaultCycle = {
        id: `CYC-${(p.id || 'PRJ').replace('PRJ-', '')}-01`,
        projectId: p.id,
        code: 'ROUND-1',
        name: `Đợt 1 — Kiểm thử phát hành (${ver})`,
        version: ver,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: 'ACTIVE',
        targetSuite: 'REGRESSION',
        description: 'Đợt kiểm thử tích hợp ban đầu'
      };
      state.testCycles.push(defaultCycle);
    }
  });
}

/**
 * Lưu trạng thái bền vững (LocalStorage + SessionStorage + LAN Server + Cloud)
 */
function saveCoreState() {
  try {
    // 1. Lưu danh mục dự án bền vững vào LocalStorage & SessionStorage
    if (state.projects) {
      const prjJson = JSON.stringify(state.projects);
      localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, prjJson);
      sessionStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, prjJson);
      sessionStorage.setItem('smartvms_session_projects', prjJson);
    }
    if (state.activeProjectId) {
      localStorage.setItem(SQTM_ACTIVE_PRJ_STORAGE_KEY, state.activeProjectId);
      sessionStorage.setItem(SQTM_ACTIVE_PRJ_STORAGE_KEY, state.activeProjectId);
      sessionStorage.setItem('smartvms_active_project_id', state.activeProjectId);
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
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(appPayload));

    // 6. Nếu đang chạy mạng LAN, đồng bộ lên máy chủ Node.js (/api/projects)
    if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      syncProjectsToLanServer(state.projects);
    }

    // 7. Nếu có kết nối Supabase Cloud, đồng bộ lên Cloud Database
    if (typeof window !== 'undefined' && window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
      window.pushProjectsToCloud(state.projects);
    }
    if (typeof window !== 'undefined' && window.pushUsersToCloud && typeof window.pushUsersToCloud === 'function') {
      window.pushUsersToCloud(state.users);
    }
    if (typeof window !== 'undefined' && window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
      window.pushCyclesToCloud(state.testCycles);
    }
  } catch (e) {
    console.warn('Lỗi saveCoreState:', e);
  }
}

/**
 * Đồng bộ danh mục dự án lên máy chủ LAN Node.js (lưu file data/projects_state.json)
 */
function syncProjectsToLanServer(projects) {
  if (!projects || !Array.isArray(projects)) return;
  try {
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects })
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Nạp danh mục dự án từ máy chủ LAN Node.js khi khởi động
 */
function fetchProjectsFromLanServer() {
  try {
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const serverProjects = Array.isArray(data) ? data : (data.projects || []);
        if (serverProjects.length > 0) {
          let hasChange = false;
          if (!state.projects || state.projects.length === 0) {
            state.projects = serverProjects;
            hasChange = true;
          } else {
            // Đối soát và gộp dự án từ server nếu client chưa có
            serverProjects.forEach(sp => {
              const idx = state.projects.findIndex(p => p.id === sp.id || p.code === sp.code);
              if (idx === -1) {
                state.projects.push(sp);
                hasChange = true;
              }
            });
          }
          if (hasChange) {
            if (!state.activeProjectId && state.projects.length > 0) {
              state.activeProjectId = state.projects[0].id;
            }
            try {
              localStorage.setItem(SQTM_PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
            } catch (e) {}
            // Cập nhật lại UI nếu hàm tương ứng tồn tại trên trang
            if (typeof AdminPortfolio !== 'undefined' && typeof AdminPortfolio.init === 'function') {
              AdminPortfolio.init();
            }
            if (typeof LeadContext !== 'undefined' && typeof LeadContext.init === 'function') {
              LeadContext.init();
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
    tcs = tcs.filter(tc => {
      if (!tc.version) {
        const mod = (p.modules || []).find(m => m.id === tc.module);
        if (mod && mod.versions && mod.versions.length > 0) {
          return mod.versions.some(v => v === version || v.startsWith(version) || version.startsWith(v));
        }
        return true;
      }
      return tc.version === version || tc.version.startsWith(version) || version.startsWith(tc.version);
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
    mods = mods.filter(m => {
      if (!m.versions || m.versions.length === 0) return true;
      return m.versions.some(v => v === version || v.startsWith(version) || version.startsWith(v));
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
    const isSameProject = res.projectId === pId || key.startsWith(pId + '__') || (tcMap[res.tcId || key] !== undefined);
    if (!isSameProject) return;

    const actualTcId = res.tcId || key.replace(/^[A-Za-z0-9_-]+__/, '');
    if (seenTcIds.has(actualTcId)) return;

    if (res.status === 'Fail' || res.status === 'FAILED' || res.status === 'Blocked' || res.failReason || (res.defectStatus && res.defectStatus !== 'None')) {
      seenTcIds.add(actualTcId);
      const tc = tcMap[actualTcId] || { title: actualTcId, name: actualTcId, module: 'M01', priority: 'P2' };
      defects.push({
        projectId: pId,
        projectName: p.name,
        tcId: actualTcId,
        module: tc.module || 'M01',
        tcTitle: tc.name || tc.title || actualTcId,
        failReason: res.failReason || 'Phát hiện lỗi trong quá trình thực thi kiểm thử',
        severity: res.severity || 'Critical',
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
    'SMOKE': '⚡ Smoke Test (Khởi động)',
    'REGRESSION': '🔄 Regression (Hồi quy chuẩn)',
    'INTEGRATION_HW': '🔌 Tích hợp Thiết bị & Ngoại vi',
    'SECURITY_FRAUD': '🛡️ Bảo mật & Chống gian lận',
    'PERF_STRESS': '⏱️ Tải cao điểm & Hiệu năng',
    'FAILOVER_OFFLINE': '📶 Ngoại tuyến & Chịu lỗi'
  };
  return map[suite] || suite || 'Hồi quy chuẩn';
}

// ================================================================
// TEST CYCLES & MULTI-ROUND ARCHITECTURE (ISO/IEC/IEEE 29119-2/3)
// ================================================================
function getTestCyclesForProject(projectId, version) {
  const pId = projectId || state.activeProjectId;
  let list = (state.testCycles || []).filter(c => c.projectId === pId);
  if (version) {
    list = list.filter(c => {
      if (!c.version) return false;
      return c.version === version || c.version.startsWith(version) || version.startsWith(c.version);
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
  return cycles.find(c => c.status === 'ACTIVE') || cycles[0];
}

function setActiveCycle(cycleId) {
  if (!cycleId) return;
  state.activeCycleId = cycleId;
  saveCoreState();
}

function getCycleById(cycleId) {
  return (state.testCycles || []).find(c => c.id === cycleId) || null;
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
    description: cycleData.description || 'Đợt kiểm thử mới tạo'
  };
  
  state.testCycles.push(newCycle);
  state.activeCycleId = newCycle.id;
  saveCoreState();
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

  saveCoreState();
  return cycle;
}

function deleteTestCycle(cycleId) {
  if (!state.testCycles) return false;
  const cycle = state.testCycles.find(c => c.id === cycleId);
  if (!cycle) return false;

  const projectCycles = getTestCyclesForProject(cycle.projectId);
  if (projectCycles.length <= 1) {
    throw new Error('Không thể xóa đợt kiểm thử duy nhất của dự án! Mỗi dự án phải có tối thiểu một đợt test.');
  }

  state.testCycles = state.testCycles.filter(c => c.id !== cycleId);

  // Nếu đợt bị xóa đang là đợt kích hoạt, tự động chọn đợt khác
  if (state.activeCycleId === cycleId) {
    const remaining = getTestCyclesForProject(cycle.projectId);
    const nextActive = remaining.find(c => c.status === 'ACTIVE') || remaining[0];
    state.activeCycleId = nextActive ? nextActive.id : null;
  }

  saveCoreState();
  return true;
}

/**
 * Lấy danh sách các Test Case thuộc phạm vi đợt kiểm thử cụ thể (Test Cycle Scope)
 */
function getTestCasesForCycle(cycleId) {
  const cycle = getCycleById(cycleId);
  if (!cycle) return [];
  const p = (state.projects || []).find(pr => pr.id === cycle.projectId) || getActiveProject();
  if (!p) return [];
  const allTcs = getAllTcs(cycle.version, p.id);

  if (Array.isArray(cycle.testCaseIds) && cycle.testCaseIds.length > 0) {
    const idSet = new Set(cycle.testCaseIds);
    return allTcs.filter(t => idSet.has(t.id));
  }

  // Fallback theo targetSuite nếu chưa cấu hình testCaseIds tường minh
  if (cycle.targetSuite === 'SMOKE') {
    const p1s = allTcs.filter(t => t.priority === 'P1');
    return p1s.length > 0 ? p1s : allTcs;
  }
  if (cycle.targetSuite === 'REGRESSION') {
    const p12 = allTcs.filter(t => t.priority === 'P1' || t.priority === 'P2');
    return p12.length > 0 ? p12 : allTcs;
  }
  return allTcs;
}

/**
 * Cấu hình danh mục Test Cases cụ thể cho một Đợt kiểm thử
 */
function setCycleTestCases(cycleId, testCaseIds) {
  const cycle = getCycleById(cycleId);
  if (!cycle) return null;
  cycle.testCaseIds = Array.isArray(testCaseIds) ? testCaseIds : [];
  saveCoreState();
  return cycle;
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
  const cycle = (state.testCycles || []).find(c => c.id === (cycleId || state.activeCycleId)) || getActiveCycle(prj?.id);
  const curVer = cycle?.version || prj?.activeVersion || 'v1.0';
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

function addProject(projData) {
  if (!state.projects) state.projects = [];
  const code = (projData.code || '').trim().toUpperCase();
  const projId = 'PRJ-' + code;
  if (state.projects.some(p => p.id === projId || p.code === code)) {
    throw new Error(`Mã dự án "${code}" đã tồn tại trên hệ thống!`);
  }
  const initVer = projData.activeVersion || 'v1.0';
  const newProj = {
    id: projId,
    code: code,
    name: projData.name || `Dự án ${code}`,
    domain: projData.domain || 'Hệ thống phần mềm',
    desc: projData.desc || '',
    lead: projData.lead || 'QA Lead',
    leadUsername: projData.leadUsername || projData.lead || 'lead',
    standards: projData.standards || ['ISO/IEC 25010', 'ISO/IEC/IEEE 29119'],
    activeVersion: initVer,
    versions: [
      {
        version: initVer,
        label: `${initVer}`,
        status: 'IN_QA',
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        changelog: 'Phiên bản khởi tạo ban đầu'
      }
    ],
    modules: [],
    testCases: [],
    members: []
  };
  state.projects.push(newProj);
  state.activeProjectId = projId;
  saveCoreState();
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects);
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
  saveCoreState();
  if (window.pushProjectsToCloud && typeof window.pushProjectsToCloud === 'function') {
    window.pushProjectsToCloud(state.projects);
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
    assignedProjects: userData.assignedProjects || ['PRJ-SMARTVMS'],
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
  if (el) el.classList.add('active');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
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
  if (p === 'P1') return '<span class="badge badge-p1">🔴 P1 Critical</span>';
  if (p === 'P2') return '<span class="badge badge-p2">🟠 P2 Important</span>';
  if (p === 'P3') return '<span class="badge badge-p3">🟡 P3 Medium</span>';
  return '<span class="badge badge-p4">🟢 P4 Low</span>';
}

function statusBadge(status) {
  const s = status || 'Not Run';
  if (s === 'Pass' || s === 'PASSED') return '<span class="badge badge-pass">✅ Đã Đạt</span>';
  if (s === 'Fail' || s === 'FAILED') return '<span class="badge badge-fail">❌ Bị Lỗi</span>';
  if (s === 'Blocked' || s === 'BLOCKED') return '<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #f87171">⛔ Bị chặn</span>';
  if (s === 'Skip') return '<span class="badge badge-skip">⏭ Bỏ qua</span>';
  if (s === 'In Progress' || s === 'WIP') return '<span class="badge" style="background:#e0e7ff;color:#3730a3">⏳ Đang làm</span>';
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

if (typeof window !== 'undefined') {
  window.syncUserProjectsWithMembers = syncUserProjectsWithMembers;
  window.getAllUsers = getAllUsers;
  window.getUsers = getUsers;
  window.assignStaffToProject = assignStaffToProject;
  window.saveCoreState = saveCoreState;
}

// Initialize on script load
initCoreState();
