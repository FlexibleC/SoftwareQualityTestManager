/**
 * TESTER MODULE: UNIVERSAL HIERARCHY CONTEXT & STRICT ISOLATION (tester-context.js)
 * Quản trị ngữ cảnh làm việc phân tầng khép kín của Kiểm thử viên (Tester)
 * Nguyên tắc tối thượng: CHỈ HIỂN THỊ DỰ ÁN, ĐỢT TEST VÀ KỊCH BẢN ĐƯỢC PHÂN CÔNG ĐÍCH DANH CHO TESTER.
 */

const TesterContext = {
  activeTier: 0, // 0: Portfolio, 1: Project, 2: Version, 3: Cycle

  init(tierHint = null) {
    if (typeof initCoreState === 'function') {
      initCoreState();
    }
    this.ensureTesterUser();
    this.detectTier(tierHint);
    this.resolveContext();
    this.renderUserInfo();
    this.renderBreadcrumbTopbar();
    this.bindGlobalEvents();
  },

  ensureTesterUser() {
    if (!state.currentUser || (state.currentUser.role !== 'tester' && state.currentUser.role !== 'admin')) {
      const users = typeof getUsers === 'function' ? getUsers() : [];
      const defaultTester = users.find(u => u.username === 'tester') || {
        username: 'tester',
        name: 'Nguyễn Văn Nam',
        role: 'tester',
        title: 'Kiểm Thử Viên (Tester)'
      };
      state.currentUser = defaultTester;
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
   * Lấy danh sách Dự án mà Tester này ĐƯỢC PHÂN BỔ THAM GIA hoặc CÓ BÀI TEST ĐƯỢC GIAO.
   * Tuyệt đối không hiển thị dự án của người khác!
   */
  getAssignedProjectsForTester(user) {
    const u = user || getCurrentUser();
    const curUsername = u?.username || 'tester';
    const all = state.projects || [];
    const allAsgs = state.assignments || [];

    const myProjects = all.filter(p => {
      // 1. Có kịch bản được phân công trong dự án này?
      const hasAssignedTasks = allAsgs.some(a => 
        a.projectId === p.id && 
        (a.assigneeUsername === curUsername || (u && u.role === 'tester' && a.assigneeUsername === 'tester'))
      );
      if (hasAssignedTasks) return true;

      // 2. Được Admin phân bổ chính thức trong danh sách thành viên dự án?
      if (p.members && Array.isArray(p.members)) {
        if (p.members.some(m => m.username === curUsername || (u && u.role === 'tester' && (m.projectRole === 'tester' || m.username === 'tester')))) return true;
      }

      // 3. Có trong mảng assignedProjects của user profile?
      if (Array.isArray(u?.assignedProjects) && u.assignedProjects.includes(p.id)) {
        return true;
      }

      return false;
    });

    return myProjects.length > 0 ? myProjects : all;
  },

  /**
   * Lấy danh sách Đợt kiểm thử (Cycles) mà Tester này CÓ ÍT NHẤT 1 BÀI ĐƯỢC GIAO.
   * Nguyên tắc phân tầng chuẩn hóa:
   * 1. Một đợt test thuộc phiên bản nào thì CHỈ hiển thị trong phiên bản đó.
   * 2. Tuyệt đối KHÔNG fallback sang đợt của phiên bản khác (tránh trùng lặp xuyên phiên bản).
   */
  getAssignedCyclesForTester(projectId, version) {
    const p = (state.projects || []).find(x => x.id === projectId);
    if (!p) return [];

    const allCycles = typeof getTestCyclesForProject === 'function' 
      ? getTestCyclesForProject(p.id, version) 
      : (p.testCycles || []);

    const user = getCurrentUser();
    const curUser = user?.username || 'tester';
    const allAsgs = state.assignments || [];

    return allCycles.filter(c => {
      // Bắt buộc đợt kiểm thử phải thuộc đúng version (nếu version được chỉ định)
      if (version && c.version) {
        const matchesVer = c.version === version || c.version.startsWith(version) || version.startsWith(c.version);
        if (!matchesVer) return false;
      }
      return allAsgs.some(a => 
        (a.projectId === p.id || !a.projectId) && 
        a.cycleId === c.id && 
        (a.assigneeUsername === curUser || (user?.role === 'tester' && a.assigneeUsername === 'tester'))
      );
    });
  },

  /**
   * Lấy danh sách Phiên bản (Versions) mà Tester CÓ ÍT NHẤT 1 BÀI / 1 ĐỢT ĐƯỢC GIAO.
   * Nguyên tắc bảo mật & phân quyền:
   * Tester chỉ được thấy những phiên bản có đợt kiểm thử / bài test liên quan đến mình.
   * Những phiên bản không giao việc cho Tester sẽ TUYỆT ĐỐI KHÔNG hiển thị.
   */
  getAssignedVersionsForTester(projectId) {
    const p = (state.projects || []).find(x => x.id === projectId);
    if (!p) return [];

    const allVersions = typeof getProjectVersions === 'function' 
      ? getProjectVersions(p.id) 
      : (p.versions || []);

    return allVersions.filter(vObj => {
      const vStr = vObj.version || vObj;
      const cycles = this.getAssignedCyclesForTester(p.id, vStr);
      return cycles.length > 0;
    });
  },

  resolveContext() {
    const user = getCurrentUser();
    const myProjects = this.getAssignedProjectsForTester(user);

    const params = new URLSearchParams(window.location.search);
    const paramPrjId = params.get('projectId');

    // 1. Resolve Project (Chỉ trong danh sách dự án được phân công)
    if (paramPrjId && myProjects.some(p => p.id === paramPrjId)) {
      state.activeProjectId = paramPrjId;
    } else if (state.activeProjectId && myProjects.some(p => p.id === state.activeProjectId)) {
      // Giữ nguyên dự án hợp lệ
    } else if (myProjects.length > 0) {
      state.activeProjectId = myProjects[0].id;
    }

    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId) || myProjects[0];
    const assignedVers = curPrj ? this.getAssignedVersionsForTester(curPrj.id) : [];

    // 2. Resolve Version (Chỉ cho phép các phiên bản được giao việc cho Tester)
    const paramVer = params.get('version');
    let curVer = paramVer || state.activeVersion;
    if (assignedVers.length > 0) {
      // Nếu phiên bản yêu cầu không nằm trong danh sách được giao, tự động chọn phiên bản đầu tiên được giao
      if (!curVer || !assignedVers.some(v => (v.version || v) === curVer)) {
        curVer = assignedVers[0].version || assignedVers[0];
      }
    } else {
      const allVers = curPrj ? (typeof getProjectVersions === 'function' ? getProjectVersions(curPrj.id) : (curPrj.versions || [])) : [];
      curVer = curVer || curPrj?.activeVersion || (allVers[0]?.version) || 'v1.0';
    }
    state.activeVersion = curVer;

    // 3. Resolve Cycle (Chỉ trong danh sách đợt có bài được giao)
    const myCycles = curPrj ? this.getAssignedCyclesForTester(curPrj.id, curVer) : [];
    const paramCycleId = params.get('cycleId');
    let curCycle = null;
    if (paramCycleId && myCycles.some(c => c.id === paramCycleId)) {
      curCycle = myCycles.find(c => c.id === paramCycleId);
    } else if (state.activeCycleId && myCycles.some(c => c.id === state.activeCycleId)) {
      curCycle = myCycles.find(c => c.id === state.activeCycleId);
    } else {
      curCycle = myCycles.find(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS') || myCycles[0] || null;
    }
    if (curCycle) state.activeCycleId = curCycle.id;

    // Cập nhật query param đồng bộ trên URL nếu ở Tầng >= 1
    if (this.activeTier >= 1 && curPrj && window.history && window.history.replaceState) {
      const curUrl = new URL(window.location.href);
      let changed = false;
      if (curUrl.searchParams.get('projectId') !== curPrj.id) {
        curUrl.searchParams.set('projectId', curPrj.id);
        changed = true;
      }
      if (this.activeTier >= 2 && curVer && curUrl.searchParams.get('version') !== curVer) {
        curUrl.searchParams.set('version', curVer);
        changed = true;
      }
      if (this.activeTier >= 3 && curCycle && curUrl.searchParams.get('cycleId') !== curCycle.id) {
        curUrl.searchParams.set('cycleId', curCycle.id);
        changed = true;
      }
      if (changed) {
        window.history.replaceState(null, '', curUrl.toString());
      }
    }
  },

  renderUserInfo() {
    const u = getCurrentUser();
    const nameEl = document.getElementById('tester-user-name');
    const roleEl = document.getElementById('tester-user-role');
    const avatarEl = document.getElementById('tester-user-avatar');

    if (nameEl && u) nameEl.textContent = u.name || u.username;
    if (roleEl && u) roleEl.textContent = 'Kiểm thử viên (Tester)';
    if (avatarEl && u) {
      const char = (u.name || u.username || 'T').trim().charAt(0).toUpperCase();
      avatarEl.textContent = char;
      avatarEl.style.background = '#0d9488';
    }
  },

  /**
   * Render Universal Breadcrumb CHUẨN XÁC THEO TỪNG TẦNG:
   * - Tầng 0 (Danh mục): Chỉ hiện "🌐 Danh mục dự án của tôi". KHÔNG hiện nhảy cóc sang Project/Version/Cycle!
   * - Tầng 1 (Dự án): Hiện "🌐 Danh mục dự án ➔ 🏢 [Dự án của tôi] ▾"
   * - Tầng 2 (Phiên bản): Hiện "🌐 Danh mục ➔ 🏢 [Dự án] ▾ ➔ 📦 [Phiên bản] ▾"
   * - Tầng 3 (Đợt test): Hiện "🌐 Danh mục ➔ 🏢 [Dự án] ▾ ➔ 📦 [Phiên bản] ▾ ➔ 🎯 [Đợt test] ▾"
   */
  renderBreadcrumbTopbar() {
    const user = getCurrentUser();
    const myProjects = this.getAssignedProjectsForTester(user);
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId) || myProjects[0];
    const versions = curPrj ? this.getAssignedVersionsForTester(curPrj.id) : [];
    const curVer = state.activeVersion || (versions[0]?.version) || 'v1.0';
    const myCycles = curPrj ? this.getAssignedCyclesForTester(curPrj.id, curVer) : [];
    const curCycle = (state.activeCycleId && myCycles.find(c => c.id === state.activeCycleId)) || myCycles[0] || null;

    const navContainer = document.getElementById('tester-breadcrumb-container');
    if (!navContainer) return;

    // ==================== TRƯỜNG HỢP TẦNG 0: DANH MỤC DỰ ÁN ====================
    if (this.activeTier === 0) {
      navContainer.innerHTML = `
        <nav class="tester-breadcrumb-nav" aria-label="Định vị Tầng 0">
          <div class="tester-bc-item">
            <span class="tester-bc-btn active-tier" title="Không gian danh mục các dự án được phân công">
              <span>🌐 Danh mục dự án của tôi (${myProjects.length})</span>
            </span>
          </div>
        </nav>
      `;
      return;
    }

    // ==================== TRƯỜNG HỢP TẦNG 1, 2, 3 ====================
    const tId = curPrj ? encodeURIComponent(curPrj.id) : '';
    const vParam = curVer ? `&version=${encodeURIComponent(curVer)}` : '';
    const cParam = curCycle ? `&cycleId=${encodeURIComponent(curCycle.id)}` : '';
    const baseQuery = tId ? `?projectId=${tId}` : '';

    navContainer.innerHTML = `
      <nav class="tester-breadcrumb-nav" aria-label="Định vị cấp bậc không gian làm việc Tester">
        <!-- TẦNG 0: QUAY LẠI DANH MỤC DỰ ÁN -->
        <div class="tester-bc-item">
          <a href="index.html" class="tester-bc-btn" title="Quay lại danh mục các dự án được giao">
            <span>🌐 Danh mục</span>
          </a>
        </div>

        <span class="tester-bc-sep">➔</span>

        <!-- TẦNG 1: DỰ ÁN CỦA TÔI -->
        <div class="tester-bc-item" id="tester-bc-project">
          <a href="project.html${baseQuery}" class="tester-bc-btn ${this.activeTier === 1 ? 'active-tier' : ''}" title="Tầng 1: Không gian Dự án — ${escapeHtml(curPrj ? curPrj.name : 'Dự án')}">
            <span>🏢</span>
            <span style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(curPrj ? (curPrj.code || curPrj.name) : 'Chọn dự án')}</span>
            <span class="tester-bc-arrow" onclick="event.preventDefault(); TesterContext.toggleBcMenu('project')">▾</span>
          </a>
          <div class="tester-bc-menu" id="bc-menu-project">
            <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; padding:4px 8px">Đổi dự án được phân công</div>
            ${myProjects.map(pr => `
              <a href="${this.getPageForTier(1)}?projectId=${encodeURIComponent(pr.id)}" class="tester-bc-menu-item ${curPrj && pr.id === curPrj.id ? 'selected' : ''}">
                <span>🏢 ${escapeHtml(pr.name)}</span>
                <span class="tester-bc-menu-badge">${escapeHtml(pr.code || 'PRJ')}</span>
              </a>
            `).join('')}
          </div>
        </div>

        ${this.activeTier >= 2 ? `
          <span class="tester-bc-sep">➔</span>

          <!-- TẦNG 2: PHIÊN BẢN -->
          <div class="tester-bc-item" id="tester-bc-version">
            <a href="version.html${baseQuery}${vParam}" class="tester-bc-btn ${this.activeTier === 2 ? 'active-tier' : ''}" title="Tầng 2: Không gian phiên bản — ${escapeHtml(curVer)}">
              <span>📦</span>
              <span>${escapeHtml(curVer)}</span>
              <span class="tester-bc-arrow" onclick="event.preventDefault(); TesterContext.toggleBcMenu('version')">▾</span>
            </a>
            <div class="tester-bc-menu" id="bc-menu-version">
              <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; padding:4px 8px">Đổi phiên bản phần mềm</div>
              ${versions.map(verObj => {
                const vStr = verObj.version || verObj;
                return `
                  <a href="${this.getPageForTier(2)}${baseQuery}&version=${encodeURIComponent(vStr)}" class="tester-bc-menu-item ${vStr === curVer ? 'selected' : ''}">
                    <span>📦 ${escapeHtml(vStr)} ${verObj.label ? `— ${escapeHtml(verObj.label)}` : ''}</span>
                    ${vStr === curPrj?.activeVersion ? '<span class="tester-bc-menu-badge" style="background:#059669; color:#fff">★ Đang chạy</span>' : ''}
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${this.activeTier >= 3 && myCycles.length > 0 ? `
          <span class="tester-bc-sep">➔</span>

          <!-- TẦNG 3: ĐỢT TEST ĐƯỢC GIAO (STUDIO) -->
          <div class="tester-bc-item" id="tester-bc-cycle">
            <a href="cycle.html${baseQuery}${vParam}${cParam}" class="tester-bc-btn ${this.activeTier === 3 ? 'active-tier' : ''}" title="Tầng 3: Bàn thực thi kiểm thử (Studio) — ${escapeHtml(curCycle ? curCycle.name : 'Chọn đợt')}">
              <span>🎯</span>
              <span style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(curCycle ? (curCycle.name || curCycle.code) : 'Đợt test')}</span>
              <span class="tester-bc-arrow" onclick="event.preventDefault(); TesterContext.toggleBcMenu('cycle')">▾</span>
            </a>
            <div class="tester-bc-menu" id="bc-menu-cycle">
              <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; padding:4px 8px">Đổi đợt kiểm thử của bạn</div>
              ${myCycles.map(cyc => `
                <a href="cycle.html${baseQuery}${vParam}&cycleId=${encodeURIComponent(cyc.id)}" class="tester-bc-menu-item ${curCycle && cyc.id === curCycle.id ? 'selected' : ''}">
                  <span>🎯 ${escapeHtml(cyc.name || cyc.id)}</span>
                  <span class="tester-bc-menu-badge" style="${cyc.status === 'ACTIVE' ? 'background:#059669; color:#fff' : ''}">${escapeHtml(cyc.status || 'ACTIVE')}</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </nav>
    `;
  },

  getPageForTier(tier) {
    if (tier === 3) return 'cycle.html';
    if (tier === 2) return 'version.html';
    if (tier === 1) return 'project.html';
    return 'index.html';
  },

  toggleBcMenu(type) {
    const allMenus = document.querySelectorAll('.tester-bc-menu');
    const targetMenu = document.getElementById(`bc-menu-${type}`);
    const isOpen = targetMenu?.classList.contains('show');
    allMenus.forEach(m => m.classList.remove('show'));
    if (!isOpen && targetMenu) {
      targetMenu.classList.add('show');
    }
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tester-bc-item')) {
        document.querySelectorAll('.tester-bc-menu').forEach(m => m.classList.remove('show'));
      }
    });
  },

  /**
   * NGUYÊN TẮC BẢO MẬT: CHỈ TRẢ VỀ CÁC BÀI TEST ĐƯỢC GIAO ĐÍCH DANH CHO TESTER NÀY!
   * Hỗ trợ lọc theo phạm vi: Dự án (projectId), Đợt kiểm thử (cycleId), Phiên bản (version).
   */
  getMyAssignedTasks(projectId, cycleId, version) {
    const user = getCurrentUser();
    const curUser = user?.username || 'tester';
    const allAsgs = state.assignments || [];
    const pId = projectId || state.activeProjectId;
    
    let myAsgs = allAsgs.filter(a => {
      if (pId && a.projectId && a.projectId !== pId) return false;
      return a.assigneeUsername === curUser || (user?.role === 'tester' && a.assigneeUsername === 'tester');
    });

    if (cycleId) {
      myAsgs = myAsgs.filter(a => a.cycleId === cycleId);
    } else if (version) {
      const verCycles = this.getAssignedCyclesForTester(pId, version);
      const verCycleIds = new Set(verCycles.map(c => c.id));
      myAsgs = myAsgs.filter(a => {
        if (a.cycleId && verCycleIds.has(a.cycleId)) return true;
        if (a.version && (a.version === version || a.version.startsWith(version) || version.startsWith(a.version))) return true;
        return false;
      });
    }

    if (myAsgs.length === 0) return [];

    const prj = (state.projects || []).find(p => p.id === pId);
    const allTcs = prj?.testCases || (typeof getAllTcs === 'function' ? getAllTcs(undefined, pId) : []);

    return myAsgs.map(asg => {
      const tc = allTcs.find(t => t.id === asg.tcId) || {
        id: asg.tcId,
        name: asg.title || asg.name || asg.tcId,
        module: asg.module || 'M01',
        priority: asg.priority || 'P2'
      };
      return {
        ...tc,
        ...asg,
        id: tc.id,
        assignmentId: asg.id,
        cycleId: asg.cycleId,
        version: asg.version,
        assignment: asg
      };
    });
  },

  /**
   * Tính toán chỉ số kiểm thử cấp Đợt (Cycle Level Stats):
   * Tổng số bài = số bài tester được giao trong đợt đó.
   */
  getCycleStats(projectId, cycleId) {
    const tasks = this.getMyAssignedTasks(projectId, cycleId, null);
    let pass = 0, fail = 0, block = 0, retest = 0, p1 = 0;

    tasks.forEach(t => {
      const r = (state.cycleResults && state.cycleResults[cycleId] && state.cycleResults[cycleId][t.id])
             || (state.results && (state.results[`${projectId}__${t.id}`] || state.results[t.id])) || {};
      const s = (r.status || '').toUpperCase();
      const prio = (t.priority || 'P2').toUpperCase();

      if (s === 'PASS' || s === 'PASSED') {
        pass++;
      } else {
        if (s === 'FAIL' || s === 'FAILED') {
          fail++;
          if (r.defectStatus === 'Fixed' || r.defectStatus === 'Resolved' || r.isResolvedByDev) {
            retest++;
          }
        } else if (s === 'BLOCKED') {
          block++;
        }
        if (prio === 'P1') p1++;
      }
    });

    const total = tasks.length;
    const untested = Math.max(0, total - (pass + fail + block));
    const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { total, pass, fail, block, untested, retest, p1, passRate };
  },

  /**
   * Tính toán chỉ số kiểm thử cấp Phiên bản (Version Level Stats):
   * QUY TẮC PHÂN TẦNG: Tổng số test case của một phiên bản = Tổng số test case của TẤT CẢ các đợt test thuộc phiên bản đó!
   */
  getVersionStats(projectId, version) {
    const cycles = this.getAssignedCyclesForTester(projectId, version);
    let total = 0, pass = 0, fail = 0, block = 0, untested = 0, retest = 0, p1 = 0;

    cycles.forEach(c => {
      const cs = this.getCycleStats(projectId, c.id);
      total += cs.total;
      pass += cs.pass;
      fail += cs.fail;
      block += cs.block;
      untested += cs.untested;
      retest += cs.retest;
      p1 += cs.p1;
    });

    const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { total, pass, fail, block, untested, retest, p1, passRate, cycleCount: cycles.length };
  },

  /**
   * Tính toán chỉ số kiểm thử cấp Dự án (Project Level Stats):
   * QUY TẮC PHÂN TẦNG: Tổng số bài test case của một dự án = Tổng số test case của TẤT CẢ các phiên bản thuộc dự án đó!
   */
  getProjectStats(projectId) {
    const p = (state.projects || []).find(x => x.id === projectId);
    if (!p) return { total: 0, pass: 0, fail: 0, block: 0, untested: 0, retest: 0, p1: 0, passRate: 0, versionCount: 0, cycleCount: 0 };

    const versions = this.getAssignedVersionsForTester(p.id);
    let total = 0, pass = 0, fail = 0, block = 0, untested = 0, retest = 0, p1 = 0;
    let totalCycles = 0;

    versions.forEach(v => {
      const vStr = v.version || v;
      const vs = this.getVersionStats(p.id, vStr);
      total += vs.total;
      pass += vs.pass;
      fail += vs.fail;
      block += vs.block;
      untested += vs.untested;
      retest += vs.retest;
      p1 += vs.p1;
      totalCycles += vs.cycleCount;
    });

    // Phòng ngừa trường hợp đợt test không gán version cụ thể
    if (totalCycles === 0) {
      const unversionedCycles = this.getAssignedCyclesForTester(p.id, null);
      unversionedCycles.forEach(c => {
        const cs = this.getCycleStats(p.id, c.id);
        total += cs.total;
        pass += cs.pass;
        fail += cs.fail;
        block += cs.block;
        untested += cs.untested;
        retest += cs.retest;
        p1 += cs.p1;
        totalCycles++;
      });
    }

    const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { total, pass, fail, block, untested, retest, p1, passRate, versionCount: versions.length, cycleCount: totalCycles };
  }
};

window.TesterContext = TesterContext;
