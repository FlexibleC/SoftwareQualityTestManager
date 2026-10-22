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
    if (path.includes('cycle')) this.activeTab = 'cycle';
    else if (path.includes('testcases')) this.activeTab = 'testcases';
    else if (path.includes('assignments')) this.activeTab = 'assignments';
    else if (path.includes('reports')) this.activeTab = 'reports';
    else if (path.includes('version')) this.activeTab = 'version';
    else if (path.includes('settings')) this.activeTab = 'settings';
    else this.activeTab = 'project';
  },

  resolveActiveProject() {
    const available = typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects();
    const params = new URLSearchParams(window.location.search);
    const paramPrjId = params.get('projectId');
    
    if (paramPrjId && available.some(p => p.id === paramPrjId)) {
      state.activeProjectId = paramPrjId;
      try {
        sessionStorage.setItem('smartvms_active_project_id', paramPrjId);
        localStorage.setItem('sqtm_active_project_id_v3', paramPrjId);
      } catch (e) {}
    } else {
      const savedId = sessionStorage.getItem('smartvms_active_project_id') || localStorage.getItem('sqtm_active_project_id_v3');
      if (savedId && available.some(p => p.id === savedId)) {
        state.activeProjectId = savedId;
      } else if (available.length > 0) {
        state.activeProjectId = available[0].id;
      }
    }

    if (!state.activeProjectId && available.length > 0) {
      state.activeProjectId = available[0].id;
    }

    // Đảm bảo URL luôn giữ đúng query param ?projectId=...
    if (state.activeProjectId && typeof window !== 'undefined' && window.history && window.history.replaceState) {
      if (paramPrjId !== state.activeProjectId) {
        const curUrl = new URL(window.location.href);
        curUrl.searchParams.set('projectId', state.activeProjectId);
        window.history.replaceState(null, '', curUrl.toString());
      }
    }
  },

  renderUserInfo() {
    const u = getCurrentUser();
    const nameEl = document.getElementById('lead-user-name');
    const roleEl = document.getElementById('lead-user-role');
    const avatarEl = document.getElementById('lead-user-avatar');

    if (nameEl && u) nameEl.textContent = u.name || u.username;
    if (roleEl && u) {
      let roleText = (u.role === 'admin') 
        ? 'Quản trị viên cấp cao' 
        : (u.roleTitle || 'Quản trị viên dự án');
      roleText = roleText.replace(/\s*\([^)]*\)/g, '').replace(/Dự án/g, 'dự án').trim();
      roleEl.textContent = roleText;
    }
    if (avatarEl && u) {
      const char = (u.name || u.username || 'L').trim().charAt(0).toUpperCase();
      avatarEl.textContent = char;
      avatarEl.style.background = (u.role === 'admin') ? '#2563eb' : '#d97706';
    }
  },

  renderProjectHeader() {
    this.renderCompactProjectBar();
  },

  /**
   * Render Header Hợp Nhất (Universal 4-Tier Hierarchical Breadcrumb) trên Topbar
   * và Dải Subnav Tabs tương ứng với từng tầng
   */
  renderCompactProjectBar() {
    const ctx = typeof getHierarchyContext === 'function' ? getHierarchyContext() : null;
    let p = ctx?.project || getActiveProject();
    const projects = ctx?.projects || (typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects());

    if (!p && projects.length > 0) {
      p = projects[0];
      state.activeProjectId = p.id;
    }

    const curVer = ctx?.version || p?.activeVersion || 'v1.0';
    const versions = ctx?.versions || (typeof getProjectVersions === 'function' ? getProjectVersions(p?.id) : []);
    const curCycle = ctx?.cycle || (typeof getActiveCycle === 'function' ? getActiveCycle(p?.id, curVer) : null);
    const cycles = ctx?.cycles || (typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p?.id, curVer) : []);

    const tId = p ? encodeURIComponent(p.id) : '';
    const vParam = curVer ? `&version=${encodeURIComponent(curVer)}` : '';
    const cParam = curCycle ? `&cycleId=${encodeURIComponent(curCycle.id)}` : '';
    const baseQuery = tId ? `?projectId=${tId}` : '';

    // 1. TÍCH HỢP HIERARCHICAL BREADCRUMB 4 TẦNG LÊN TOPBAR CHÍNH
    const topbar = document.querySelector('.lead-topbar');
    if (topbar && p) {
      let leftArea = topbar.querySelector('.lead-topbar-left');
      if (!leftArea) {
        const brandWrap = topbar.querySelector('.lead-brand-wrap');
        const parentDiv = brandWrap ? brandWrap.parentElement : null;
        if (parentDiv) {
          parentDiv.className = 'lead-topbar-left';
          leftArea = parentDiv;
        }
      }

      if (leftArea) {
        leftArea.innerHTML = `
          <a href="index.html" class="lead-brand-wrap" title="Hệ thống Quản lý Chất lượng SQTM">
            <div class="lead-brand-badge">👑</div>
            <div>
              <h2 class="lead-brand-title">Hệ thống QLCL</h2>
              <span class="lead-brand-subtitle">Test Leader</span>
            </div>
          </a>

          <div class="lead-header-divider"></div>

          <!-- UNIVERSAL 4-TIER HIERARCHICAL BREADCRUMB -->
          <nav class="lead-breadcrumb-nav" aria-label="Định vị cấp bậc không gian làm việc">
            
            <!-- TẦNG 0: DANH MỤC HỆ THỐNG -->
            <div class="lead-bc-item">
              <a href="index.html" class="lead-bc-btn ${ctx?.tier === 0 ? 'active-tier' : ''}" title="Tầng 0: Không gian Hệ thống / Danh mục Dự án">
                <span>🌐 Danh mục dự án</span>
              </a>
            </div>

            <span class="lead-bc-sep">➔</span>

            <!-- TẦNG 1: DỰ ÁN -->
            <div class="lead-bc-item" id="bc-item-project">
              <a href="project.html${baseQuery}" class="lead-bc-btn ${ctx?.tier === 1 ? 'active-tier' : ''}" title="Tầng 1: Không gian Dự án — ${escapeHtml(p.name)}">
                <span>🏢</span>
                <span style="max-width:130px; overflow:hidden; text-overflow:ellipsis">${escapeHtml(p.code || p.name)}</span>
                <span class="lead-bc-arrow" onclick="event.preventDefault(); LeadContext.toggleBcMenu('project')">▾</span>
              </a>
              <div class="lead-bc-menu" id="bc-menu-project">
                <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; padding:4px 8px">Đổi dự án phụ trách</div>
                ${projects.map(pr => `
                  <a href="project.html?projectId=${encodeURIComponent(pr.id)}" class="lead-bc-menu-item ${pr.id === p.id ? 'selected' : ''}">
                    <span>🏢 ${escapeHtml(pr.name)}</span>
                    <span class="lead-bc-menu-badge">${escapeHtml(pr.code || 'PRJ')}</span>
                  </a>
                `).join('')}
              </div>
            </div>

            <span class="lead-bc-sep">➔</span>

            <!-- TẦNG 2: PHIÊN BẢN -->
            <div class="lead-bc-item" id="bc-item-version">
              <a href="version.html${baseQuery}${vParam}" class="lead-bc-btn ${ctx?.tier === 2 ? 'active-tier' : ''}" title="Tầng 2: Không gian phiên bản — ${escapeHtml(curVer)}">
                <span>📦</span>
                <span>${escapeHtml(curVer)}</span>
                <span class="lead-bc-arrow" onclick="event.preventDefault(); LeadContext.toggleBcMenu('version')">▾</span>
              </a>
              <div class="lead-bc-menu" id="bc-menu-version">
                <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; padding:4px 8px">Đổi phiên bản phần mềm</div>
                ${versions.map(verObj => {
                  const vStr = verObj.version || verObj;
                  return `
                    <a href="version.html${baseQuery}&version=${encodeURIComponent(vStr)}" class="lead-bc-menu-item ${vStr === curVer ? 'selected' : ''}">
                      <span>📦 ${escapeHtml(vStr)} ${verObj.label ? `— ${escapeHtml(verObj.label)}` : ''}</span>
                      ${vStr === p.activeVersion ? '<span class="lead-bc-menu-badge" style="background:#16a34a; color:#fff">★ Đang chạy</span>' : ''}
                    </a>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- TẦNG 3: ĐỢT TEST (NẾU CÓ ĐỢT HOẶC Ở TẦNG 3) -->
            ${cycles.length > 0 ? `
              <span class="lead-bc-sep">➔</span>
              <div class="lead-bc-item" id="bc-item-cycle">
                <a href="cycle.html${baseQuery}${vParam}${cParam}" class="lead-bc-btn ${ctx?.tier === 3 ? 'active-tier' : ''}" title="Tầng 3: Không gian tác chiến đợt kiểm thử — ${escapeHtml(curCycle ? curCycle.name : 'Chọn đợt')}">
                  <span>🎯</span>
                  <span style="max-width:130px; overflow:hidden; text-overflow:ellipsis">${escapeHtml(curCycle ? (curCycle.code || curCycle.name) : 'Đợt kiểm thử')}</span>
                  <span class="lead-bc-arrow" onclick="event.preventDefault(); LeadContext.toggleBcMenu('cycle')">▾</span>
                </a>
                <div class="lead-bc-menu" id="bc-menu-cycle">
                  <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; padding:4px 8px">Đổi đợt kiểm thử</div>
                  ${cycles.map(cyc => `
                    <a href="cycle.html${baseQuery}${vParam}&cycleId=${encodeURIComponent(cyc.id)}" class="lead-bc-menu-item ${curCycle && cyc.id === curCycle.id ? 'selected' : ''}">
                      <span>🎯 ${escapeHtml(cyc.name || cyc.id)}</span>
                      <span class="lead-bc-menu-badge" style="${cyc.status === 'ACTIVE' ? 'background:#16a34a; color:#fff' : ''}">${escapeHtml(cyc.status || 'PLANNED')}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </nav>
        `;
      }
    }

    // 2. RENDER SUBNAV TABS TƯƠNG ỨNG TỪNG TẦNG
    const container = document.getElementById('lead-compact-bar') || document.getElementById('lead-project-hero');
    if (container) {
      container.className = '';
      
      let navTabsHtml = '';
      const currentTier = ctx?.tier ?? 1;

      if (currentTier === 1) {
        // TẦNG 1: DỰ ÁN (Chuẩn hóa tinh gọn theo Lựa chọn A: Phiên bản, Nhân sự, Cài đặt)
        const activeTab = new URLSearchParams(window.location.search).get('tab') || 'overview';
        navTabsHtml = `
          <button type="button" id="btn-subnav-overview" onclick="if(window.LeadDashboard && LeadDashboard.switchMainTab){LeadDashboard.switchMainTab('overview');}else{window.location.href='project.html${baseQuery}&tab=overview';}" class="lead-subnav-tab ${activeTab === 'overview' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">🏢</span>
            <span>Tổng quan dự án</span>
          </button>
          <button type="button" id="btn-subnav-versions" onclick="if(window.LeadDashboard && LeadDashboard.switchMainTab){LeadDashboard.switchMainTab('versions');}else{window.location.href='project.html${baseQuery}&tab=versions';}" class="lead-subnav-tab ${activeTab === 'versions' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">📦</span>
            <span>Quản trị các phiên bản</span>
          </button>
          <button type="button" id="btn-subnav-roster" onclick="if(window.LeadDashboard && LeadDashboard.switchMainTab){LeadDashboard.switchMainTab('roster');}else{window.location.href='project.html${baseQuery}&tab=roster';}" class="lead-subnav-tab ${activeTab === 'roster' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">👥</span>
            <span>Quản trị nhân sự dự án</span>
          </button>
          <button type="button" id="btn-subnav-settings" onclick="if(window.LeadDashboard && LeadDashboard.switchMainTab){LeadDashboard.switchMainTab('settings');}else{window.location.href='project.html${baseQuery}&tab=settings';}" class="lead-subnav-tab ${activeTab === 'settings' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">⚙️</span>
            <span>Cài đặt cấu hình dự án</span>
          </button>
        `;
      } else if (currentTier === 2) {
        // TẦNG 2: PHIÊN BẢN (Chuẩn hóa 5 Tab Điều Hành Release Chuyên Nghiệp)
        const activeTab = new URLSearchParams(window.location.search).get('tab') || 'overview';
        navTabsHtml = `
          <a href="project.html${baseQuery}" class="lead-subnav-tab" style="color:#2563eb; font-weight:700">
            <span style="font-size:14px">⬅</span>
            <span>Về không gian dự án</span>
          </a>
          <button type="button" id="btn-subnav-v-overview" onclick="if(window.LeadVersion && LeadVersion.switchVersionTab){LeadVersion.switchVersionTab('overview');}else{window.location.href='version.html${baseQuery}${vParam}&tab=overview';}" class="lead-subnav-tab ${activeTab === 'overview' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">🏢</span>
            <span>1. Tổng quan và sức khỏe</span>
          </button>
          <button type="button" id="btn-subnav-v-cycles" onclick="if(window.LeadVersion && LeadVersion.switchVersionTab){LeadVersion.switchVersionTab('cycles');}else{window.location.href='version.html${baseQuery}${vParam}&tab=cycles';}" class="lead-subnav-tab ${activeTab === 'cycles' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">🎯</span>
            <span>2. Đợt kiểm thử</span>
          </button>
          <button type="button" id="btn-subnav-v-scope" onclick="if(window.LeadVersion && LeadVersion.switchVersionTab){LeadVersion.switchVersionTab('scope');}else{window.location.href='version.html${baseQuery}${vParam}&tab=scope';}" class="lead-subnav-tab ${activeTab === 'scope' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">📋</span>
            <span>3. Kịch bản và phân hệ</span>
          </button>
          <button type="button" id="btn-subnav-v-roster" onclick="if(window.LeadVersion && LeadVersion.switchVersionTab){LeadVersion.switchVersionTab('roster');}else{window.location.href='version.html${baseQuery}${vParam}&tab=roster';}" class="lead-subnav-tab ${activeTab === 'roster' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">👥</span>
            <span>4. Nhân sự phiên bản</span>
          </button>
          <button type="button" id="btn-subnav-v-settings" onclick="if(window.LeadVersion && LeadVersion.switchVersionTab){LeadVersion.switchVersionTab('settings');}else{window.location.href='version.html${baseQuery}${vParam}&tab=settings';}" class="lead-subnav-tab ${activeTab === 'settings' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">⚙️</span>
            <span>5. Cài đặt và tiêu chuẩn nghiệm thu</span>
          </button>
        `;
      } else {
        // TẦNG 3: ĐỢT TEST (CHỈNH THỂ 4 TAB CHUẨN ENTERPRISE)
        const activeTab = new URLSearchParams(window.location.search).get('tab') || 'overview';
        navTabsHtml = `
          <a href="version.html${baseQuery}${vParam}" class="lead-subnav-tab" style="color:#2563eb; font-weight:700">
            <span style="font-size:14px">⬅</span>
            <span>Về không gian phiên bản (${escapeHtml(curVer)})</span>
          </a>
          <button type="button" id="btn-subnav-c-overview" onclick="if(window.LeadCycle && LeadCycle.switchCycleTab){LeadCycle.switchCycleTab('overview');}else{window.location.href='cycle.html${baseQuery}${vParam}${cParam}&tab=overview';}" class="lead-subnav-tab ${activeTab === 'overview' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">📊</span>
            <span>1. Tổng quan và sức khỏe</span>
          </button>
          <button type="button" id="btn-subnav-c-testcases" onclick="if(window.LeadCycle && LeadCycle.switchCycleTab){LeadCycle.switchCycleTab('testcases');}else{window.location.href='cycle.html${baseQuery}${vParam}${cParam}&tab=testcases';}" class="lead-subnav-tab ${activeTab === 'testcases' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">📋</span>
            <span>2. Kịch bản và thực thi</span>
          </button>
          <button type="button" id="btn-subnav-c-staffing" onclick="if(window.LeadCycle && LeadCycle.switchCycleTab){LeadCycle.switchCycleTab('staffing');}else{window.location.href='cycle.html${baseQuery}${vParam}${cParam}&tab=staffing';}" class="lead-subnav-tab ${activeTab === 'staffing' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">👥</span>
            <span>3. Nhân sự và điều phối</span>
          </button>
          <button type="button" id="btn-subnav-c-settings" onclick="if(window.LeadCycle && LeadCycle.switchCycleTab){LeadCycle.switchCycleTab('settings');}else{window.location.href='cycle.html${baseQuery}${vParam}${cParam}&tab=settings';}" class="lead-subnav-tab ${activeTab === 'settings' ? 'active' : ''}" style="background:none; border:none; cursor:pointer; font-family:inherit; color:inherit">
            <span style="font-size:15px">⚙️</span>
            <span>4. Cài đặt và tiêu chuẩn hoàn thành</span>
          </button>
        `;
      }

      container.innerHTML = `
        <nav class="lead-project-subnav" role="navigation">
          <div class="lead-subnav-inner">
            ${navTabsHtml}
          </div>
        </nav>
      `;
    }

    // Đăng ký sự kiện đóng dropdown breadcrumb khi click ra ngoài
    this.bindBreadcrumbEvents();
  },

  toggleBcMenu(type) {
    const menu = document.getElementById(`bc-menu-${type}`);
    if (!menu) return;
    const isShown = menu.classList.contains('show');
    document.querySelectorAll('.lead-bc-menu.show').forEach(m => m.classList.remove('show'));
    if (!isShown) menu.classList.add('show');
  },

  bindBreadcrumbEvents() {
    if (this._bcBound) return;
    this._bcBound = true;
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lead-bc-item')) {
        document.querySelectorAll('.lead-bc-menu.show').forEach(m => m.classList.remove('show'));
      }
    });
  }
};

// Export toàn cục
if (typeof window !== 'undefined') {
  window.LeadContext = LeadContext;
}
