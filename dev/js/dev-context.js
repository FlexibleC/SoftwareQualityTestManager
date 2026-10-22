/**
 * DEVELOPER MODULE: UNIVERSAL HIERARCHY CONTEXT & STRICT ISOLATION (dev-context.js)
 * Quản trị ngữ cảnh làm việc phân tầng khép kín của Lập Trình Viên (Developer)
 * Hỗ trợ Universal Breadcrumb 4 Tầng:
 *   Tầng 0: Bàn điều hành danh mục dự án phụ trách (Portfolio Hub)
 *   Tầng 1: Không gian dự án của Developer (Project Space)
 *   Tầng 2: Không gian phiên bản phần mềm (Version Space)
 *   Tầng 3: Bàn điều tra, Kanban & Bàn giao bản vá kỹ thuật (Defect Studio / Cycle)
 */

const DevContext = {
  activeTier: 0, // 0: Portfolio, 1: Project, 2: Version, 3: Cycle

  init(tierHint = null) {
    if (typeof initCoreState === 'function') {
      initCoreState();
    }
    this.ensureDevUser();
    this.detectTier(tierHint);
    this.resolveContext();
    this.renderUserInfo();
    this.renderBreadcrumbTopbar();
    this.bindGlobalEvents();
  },

  ensureDevUser() {
    if (!state.currentUser || (state.currentUser.role !== 'developer' && state.currentUser.role !== 'admin' && state.currentUser.username !== 'dev')) {
      const users = typeof getUsers === 'function' ? getUsers() : (state.users || []);
      const defaultDev = users.find(u => u.username === 'dev' || u.role === 'developer') || users[0] || {
        username: 'dev',
        name: 'Lập trình viên',
        role: 'developer',
        title: 'Kỹ sư phần mềm'
      };
      state.currentUser = defaultDev;
      if (typeof saveCoreState === 'function') saveCoreState();
    }
  },

  detectTier(tierHint) {
    if (tierHint !== null) {
      this.activeTier = tierHint;
      return;
    }
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('cycle.html')) this.activeTier = 3;
    else if (path.includes('version.html')) this.activeTier = 2;
    else if (path.includes('project.html')) this.activeTier = 1;
    else this.activeTier = 0;
  },

  /**
   * Lấy danh sách Dự án mà Dev này ĐƯỢC PHÂN BỔ THAM GIA hoặc CÓ BUG CẦN XỬ LÝ.
   */
  getAssignedProjectsForDev(user) {
    const u = user || getCurrentUser();
    const curUsername = u?.username || 'dev';
    const all = state.projects || [];

    const myProjects = all.filter(p => {
      // 1. Phân bổ chính thức trong thành viên dự án
      if (p.members && Array.isArray(p.members)) {
        if (p.members.some(m => m.username === curUsername || (u && u.role === 'developer' && (m.projectRole === 'dev' || m.project_role === 'dev' || m.username === 'dev')))) {
          return true;
        }
      }
      // 2. Có trong mảng assignedProjects của user
      if (Array.isArray(u?.assignedProjects) && u.assignedProjects.includes(p.id)) {
        return true;
      }
      // 3. Có bug được phân công trực tiếp
      const defects = this.getAllDefectsForContext(p.id);
      if (defects.some(d => d.assignedDev === curUsername || !d.assignedDev || d.assignedDev === 'dev')) {
        return true;
      }
      return false;
    });

    return myProjects.length > 0 ? myProjects : all;
  },

  /**
   * Lấy danh sách Phiên bản (Versions) của Dự án mà Dev có lỗi cần xử lý hoặc đang hoạt động.
   */
  getAssignedVersionsForDev(projectId) {
    const p = (state.projects || []).find(x => x.id === projectId);
    if (!p) return [];

    const allVersions = typeof getProjectVersions === 'function' 
      ? getProjectVersions(p.id) 
      : (p.versions || []);

    const allDefects = this.getAllDefectsForContext(projectId);

    return allVersions.filter(vObj => {
      const vStr = vObj.version || vObj;
      // Có bug thuộc version này hoặc version đang active
      const hasDefects = allDefects.some(d => d.version === vStr || (!d.version && vStr === (p.activeVersion || 'v1.0')));
      return hasDefects || vObj.isCurrent || vStr === p.activeVersion;
    });
  },

  /**
   * Lấy danh sách Đợt kiểm thử (Test Cycles) thuộc Phiên bản mà Dev cần xử lý bug.
   */
  getAssignedCyclesForDev(projectId, version) {
    const p = (state.projects || []).find(x => x.id === projectId);
    if (!p) return [];

    const allCycles = typeof getTestCyclesForProject === 'function' 
      ? getTestCyclesForProject(p.id, version) 
      : (p.testCycles || []);

    const curUser = state.currentUser || getCurrentUser();
    const curUsername = curUser?.username || 'dev';

    return allCycles.filter(c => {
      if (version && c.version) {
        const matchesVer = c.version === version || c.version.startsWith(version) || version.startsWith(c.version);
        if (!matchesVer) return false;
      }
      // Nếu đợt kiểm thử đã cấu hình danh sách lập trình viên phụ trách
      const cycleDevs = Array.isArray(c.assignedDevs) && c.assignedDevs.length > 0
        ? c.assignedDevs
        : (Array.isArray(c.devUsernames) ? c.devUsernames : []);
      if (cycleDevs.length > 0) {
        return cycleDevs.includes(curUsername) || curUser?.role === 'admin';
      }
      return true;
    });
  },

  /**
   * TỔNG HỢP TOÀN BỘ DEFECTS TỪ 2 NGUỒN:
   * 1. Test case Fail / Defect tracking trong state.results
   * 2. Lỗi đột xuất ngoài kịch bản trong state.adhocDefects
   */
  getAllDefectsForContext(projectId = null, version = null, cycleId = null) {
    const pId = projectId || state.activeProjectId;
    const allTcs = typeof getAllTcs === 'function' ? getAllTcs() : [];
    const tcMap = {};
    allTcs.forEach(t => { tcMap[t.id] = t; });

    const p = (state.projects || []).find(x => x.id === pId);
    const activeVer = p?.activeVersion || 'v1.0';

    const defects = [];

    // Nguồn 1: Test Results có Fail hoặc defectStatus
    const resMap = state.results || {};
    Object.keys(resMap).forEach(tcId => {
      const r = resMap[tcId];
      if (!r) return;

      // Filter by project
      if (r.projectId && pId && r.projectId !== pId) return;

      const isFailed = (r.status === 'Fail' || r.status === 'FAILED' || r.failReason);
      const hasDefect = (r.defectStatus && r.defectStatus !== 'None');

      if (isFailed || hasDefect) {
        const tc = tcMap[tcId] || { title: tcId, module: 'M01', priority: 'P2' };
        const dVersion = r.version || activeVer;
        const dCycleId = r.cycleId || 'ROUND-1';

        // Version & Cycle Filter
        if (version && dVersion !== version) return;
        if (cycleId && dCycleId !== cycleId) return;

        defects.push({
          id: tcId,
          code: tcId,
          title: tc.title || tc.name || tcId,
          module: tc.module || 'M01',
          projectId: r.projectId || pId,
          version: dVersion,
          cycleId: dCycleId,
          severity: r.severity || 'Critical',
          priority: tc.priority || 'P2',
          defectStatus: r.defectStatus || 'New',
          failReason: r.failReason || 'Phát hiện lỗi khi thực thi kịch bản kiểm thử',
          expectedResult: tc.expected || 'Tính năng thực thi theo đúng đặc tả kỹ thuật',
          stepsToReproduce: tc.steps || 'Thực hiện theo các bước của kịch bản kiểm thử.',
          tester: r.tester || 'Kiểm thử viên',
          assignedDev: r.assignedDev || 'dev',
          runAt: r.runAt || new Date().toISOString(),
          fixVersion: r.fixVersion || '',
          commitHash: r.commitHash || '',
          defectCategory: r.defectCategory || 'Logic Backend API',
          rca: r.rca || '',
          devNotes: r.devNotes || '',
          evidences: r.evidences || (r.screenshot ? [{ url: r.screenshot, name: 'Evidence' }] : []),
          isAdhoc: false
        });
      }
    });

    // Nguồn 2: Sự cố ngoài kịch bản (state.adhocDefects)
    const adhocList = state.adhocDefects || [];
    adhocList.forEach(ad => {
      if (pId && ad.projectId && ad.projectId !== pId) return;

      const adVer = ad.version || activeVer;
      const adCycle = ad.cycleId || 'ROUND-1';

      if (version && adVer !== version) return;
      if (cycleId && adCycle !== cycleId) return;

      // Avoid duplicate if tcId already exists
      if (!defects.some(d => d.id === ad.id)) {
        let mappedSev = 'Critical';
        if (ad.severity?.includes('Blocker')) mappedSev = 'Blocker';
        else if (ad.severity?.includes('Critical')) mappedSev = 'Critical';
        else if (ad.severity?.includes('Major')) mappedSev = 'High';
        else mappedSev = 'Medium';

        defects.push({
          id: ad.id,
          code: ad.id,
          title: ad.title || 'Sự cố phát sinh ngoài kịch bản',
          module: ad.module || 'M01',
          projectId: ad.projectId || pId,
          version: adVer,
          cycleId: adCycle,
          severity: mappedSev,
          priority: ad.priority || 'P2',
          defectStatus: ad.defectStatus || 'New',
          failReason: ad.actualResult || ad.title,
          expectedResult: ad.expectedResult || 'Hệ thống vận hành ổn định',
          stepsToReproduce: ad.stepsToReproduce || '',
          tester: ad.reporter || 'Kiểm thử viên',
          assignedDev: ad.assignedDev || 'dev',
          runAt: ad.createdAt || new Date().toISOString(),
          fixVersion: ad.fixVersion || '',
          commitHash: ad.commitHash || '',
          defectCategory: ad.defectCategory || 'Khác / Sự cố đột xuất',
          rca: ad.rca || '',
          devNotes: ad.devNotes || '',
          evidences: (ad.evidences || []).map((e, idx) => typeof e === 'string' ? { url: e, name: `Evidence ${idx+1}` } : e),
          isAdhoc: true
        });
      }
    });

    return defects;
  },

  resolveContext() {
    const user = getCurrentUser();
    const myProjects = this.getAssignedProjectsForDev(user);

    const params = new URLSearchParams(window.location.search);
    const paramPrjId = params.get('projectId');

    // 1. Resolve Project
    if (paramPrjId && myProjects.some(p => p.id === paramPrjId)) {
      state.activeProjectId = paramPrjId;
    } else if (!state.activeProjectId || !myProjects.some(p => p.id === state.activeProjectId)) {
      state.activeProjectId = myProjects[0]?.id || (state.projects && state.projects[0]?.id) || null;
    }

    const prj = this.getActiveProject();

    // 2. Resolve Version
    const paramVer = params.get('version');
    const myVersions = this.getAssignedVersionsForDev(state.activeProjectId);
    const validVerStrs = myVersions.map(v => v.version || v);

    if (paramVer && validVerStrs.includes(paramVer)) {
      state.activeVersion = paramVer;
    } else if (validVerStrs.length > 0) {
      if (!state.activeVersion || !validVerStrs.includes(state.activeVersion)) {
        state.activeVersion = validVerStrs[0];
      }
    } else {
      state.activeVersion = prj?.activeVersion || 'v1.0';
    }

    // 3. Resolve Cycle
    const paramCycle = params.get('cycleId');
    const myCycles = this.getAssignedCyclesForDev(state.activeProjectId, state.activeVersion);

    if (paramCycle && myCycles.some(c => c.id === paramCycle)) {
      state.activeCycleId = paramCycle;
    } else if (myCycles.length > 0) {
      state.activeCycleId = myCycles[0].id;
    } else {
      state.activeCycleId = 'ROUND-1';
    }
  },

  getActiveProject() {
    return (state.projects || []).find(p => p.id === state.activeProjectId) || (state.projects ? state.projects[0] : null);
  },

  getActiveVersionObj() {
    const p = this.getActiveProject();
    if (!p) return null;
    const vStr = state.activeVersion;
    const all = p.versions || [];
    return all.find(x => (x.version || x) === vStr) || { version: vStr, label: vStr, isCurrent: true };
  },

  getActiveCycleObj() {
    const p = this.getActiveProject();
    if (!p) return null;
    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id) : (p.testCycles || []);
    return cycles.find(c => c.id === state.activeCycleId) || { id: state.activeCycleId, name: 'Đợt kiểm thử tác nghiệp' };
  },

  renderUserInfo() {
    const u = getCurrentUser() || {};
    const nameEl = document.getElementById('dev-user-name');
    const avatarEl = document.getElementById('dev-user-avatar');
    if (nameEl) nameEl.textContent = u.name || u.username || 'Lập trình viên';
    if (avatarEl) avatarEl.textContent = (u.name || u.username || 'D').charAt(0).toUpperCase();
  },

  /**
   * RENDER UNIVERSAL BREADCRUMB 4 TẦNG
   */
  renderBreadcrumbTopbar() {
    const container = document.getElementById('dev-breadcrumb-container');
    if (!container) return;

    const prj = this.getActiveProject();
    const ver = state.activeVersion || 'v1.0';
    const cycle = this.getActiveCycleObj();

    const user = getCurrentUser();
    const myProjects = this.getAssignedProjectsForDev(user);
    const myVersions = this.getAssignedVersionsForDev(state.activeProjectId);
    const myCycles = this.getAssignedCyclesForDev(state.activeProjectId, state.activeVersion);

    let html = `<nav class="dev-breadcrumb-nav" aria-label="Phân cấp không gian làm việc">`;

    // TẦNG 0: Bàn Điều Hành Danh Mục
    const isTier0Active = (this.activeTier === 0);
    html += `
      <div class="dev-bc-item">
        <a href="index.html" class="dev-bc-btn ${isTier0Active ? 'active-tier' : ''}" title="Trở về Bàn điều hành danh mục">
          <span>💻 Bàn điều hành</span>
        </a>
      </div>
    `;

    // TẦNG 1: Không Gian Dự Án
    if (this.activeTier >= 1 && prj) {
      const isTier1Active = (this.activeTier === 1);
      html += `<span class="dev-bc-sep">/</span>`;
      html += `
        <div class="dev-bc-item">
          <button type="button" class="dev-bc-btn ${isTier1Active ? 'active-tier' : ''}" onclick="DevContext.toggleMenu('bc-menu-prj')">
            <span>🏢 ${escapeHtml(prj.name)}</span>
            <span class="dev-bc-arrow">▼</span>
          </button>
          <div class="dev-bc-menu" id="bc-menu-prj">
            <div class="dev-bc-menu-header">Dự án bạn tham gia</div>
            ${myProjects.map(p => `
              <a href="project.html?projectId=${p.id}" class="dev-bc-menu-item ${p.id === prj.id ? 'selected' : ''}">
                <span>${escapeHtml(p.name)}</span>
                <span style="font-size:10.5px; opacity:0.8">${escapeHtml(p.code || '')}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // TẦNG 2: Không Gian Phiên Bản
    if (this.activeTier >= 2 && prj) {
      const isTier2Active = (this.activeTier === 2);
      html += `<span class="dev-bc-sep">/</span>`;
      html += `
        <div class="dev-bc-item">
          <button type="button" class="dev-bc-btn ${isTier2Active ? 'active-tier' : ''}" onclick="DevContext.toggleMenu('bc-menu-ver')">
            <span>📦 ${escapeHtml(ver)}</span>
            <span class="dev-bc-arrow">▼</span>
          </button>
          <div class="dev-bc-menu" id="bc-menu-ver">
            <div class="dev-bc-menu-header">Phiên bản có lỗi cần xử lý</div>
            ${myVersions.map(vObj => {
              const vStr = vObj.version || vObj;
              return `
                <a href="version.html?projectId=${prj.id}&version=${encodeURIComponent(vStr)}" class="dev-bc-menu-item ${vStr === ver ? 'selected' : ''}">
                  <span>${escapeHtml(vStr)}</span>
                  ${vObj.isCurrent ? '<span style="font-size:9.5px; color:#38bdf8">Active</span>' : ''}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // TẦNG 3: Bàn Điều Tra & Kanban Đợt Test
    if (this.activeTier >= 3 && prj && cycle) {
      html += `<span class="dev-bc-sep">/</span>`;
      html += `
        <div class="dev-bc-item">
          <button type="button" class="dev-bc-btn active-tier" onclick="DevContext.toggleMenu('bc-menu-cycle')">
            <span>🎯 ${escapeHtml(cycle.name || cycle.id)}</span>
            <span class="dev-bc-arrow">▼</span>
          </button>
          <div class="dev-bc-menu" id="bc-menu-cycle">
            <div class="dev-bc-menu-header">Đợt kiểm thử phát sinh lỗi</div>
            ${myCycles.map(c => `
              <a href="cycle.html?projectId=${prj.id}&version=${encodeURIComponent(ver)}&cycleId=${c.id}" class="dev-bc-menu-item ${c.id === cycle.id ? 'selected' : ''}">
                <span>${escapeHtml(c.name)}</span>
                <span style="font-size:10px; opacity:0.8">${c.scope || ''}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += `</nav>`;
    container.innerHTML = html;
  },

  toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const isShown = menu.classList.contains('show');
    document.querySelectorAll('.dev-bc-menu').forEach(m => m.classList.remove('show'));
    if (!isShown) menu.classList.add('show');
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dev-bc-item')) {
        document.querySelectorAll('.dev-bc-menu').forEach(m => m.classList.remove('show'));
      }
    });
  }
};
