/**
 * SMARTVMS QA HUB - ASSIGNMENT MODULE (JS)
 * 2-Tab Task Allocation: Workload Matrix & Master-Detail Dispatch
 * Fully synchronized with Test Cycle Scopes, Prior Execution History & Defect Re-test Filtering.
 */

let asgCurrentTab = 'detail';
let asgSelectedModuleId = ''; // '' means [Tất cả phân hệ], or 'M01', 'M02', etc.
let asgSelectedTcIds = new Set();
let asgSelectedVersion = '';  // Active version filter for cycle cascade

// Filter states
let asgFilterSearch = '';
let asgFilterStatus = '';     // '', 'UNASSIGNED', 'ASSIGNED'
let asgFilterTester = '';     // '', username, or '__UNASSIGNED__'
let asgFilterHistory = '';    // '', 'FAIL', 'PASS', 'UNTESTED'
let asgFilterPriority = '';   // '', 'P1', 'P2', 'P3', 'P4'

function initAssignmentModule() {
  initCoreState();
  const p = getActiveProject();
  if (!p) return;

  // Initialize dates
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const sDateEl = document.getElementById('detail-start-date');
  const dDateEl = document.getElementById('detail-due-date');
  if (sDateEl && !sDateEl.value) sDateEl.value = today;
  if (dDateEl && !dDateEl.value) dDateEl.value = due;

  // Populate tester dropdown
  const testerSel = document.getElementById('detail-assignee');
  if (testerSel) {
    const allUsers = typeof getUsers === 'function' ? getUsers() : [];
    let activeTesters = allUsers.filter(u => u.role === 'tester' && u.status !== 'LOCKED');
    if (activeTesters.length === 0) activeTesters = allUsers.filter(u => u.status !== 'LOCKED');
    testerSel.innerHTML = activeTesters.map(u => `<option value="${u.username}">${u.name} (${u.roleTitle || u.role})</option>`).join('');
  }

  // Check URL parameters for deep-linking
  const urlParams = new URLSearchParams(window.location.search);
  const urlCycleId = urlParams.get('cycleId');
  const urlVersion = urlParams.get('version');

  // Set default selected version from project
  asgSelectedVersion = p.activeVersion || (p.versions && p.versions[0]?.version) || '';

  if (urlCycleId) {
    const cycleObj = typeof getCycleById === 'function' ? getCycleById(urlCycleId) : null;
    if (cycleObj) {
      state.activeCycleId = cycleObj.id;
      asgSelectedVersion = cycleObj.version || asgSelectedVersion;
    }
  } else if (urlVersion) {
    asgSelectedVersion = urlVersion;
  }

  // Populate Tier 1: Projects
  populateAsgProjectSelector(p.id);

  // Populate Tier 2: Versions
  populateAsgVersionSelector(p.id);

  // Populate Tier 3: Test Cycles
  populateAsgCycleSelector(p.id, asgSelectedVersion);

  updateAsgHierarchyBreadcrumb();
  populateAsgTesterFilter();
  renderAsgOverviewTab();
  renderAsgDetailTab();
}

function populateAsgTesterFilter() {
  const testerFilter = document.getElementById('asg-filter-tester');
  if (!testerFilter) return;

  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const cycleTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id && (!cycleId || !a.cycleId || a.cycleId === cycleId));
  const asgMap = new Map();
  assignments.forEach(a => {
    if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
    asgMap.get(a.tcId).push(a);
  });

  const totalTcs = cycleTcs.length;
  const assignedCount = cycleTcs.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0).length;
  const unassignedCount = Math.max(0, totalTcs - assignedCount);

  const allUsers = typeof getUsers === 'function' ? getUsers() : [];
  let activeTesters = allUsers.filter(u => u.role === 'tester' && u.status !== 'LOCKED');
  if (activeTesters.length === 0) activeTesters = allUsers.filter(u => u.status !== 'LOCKED');

  let opts = `
    <option value="">👤 Nhân sự: Tất cả</option>
    <option value="__UNASSIGNED__" ${asgFilterTester === '__UNASSIGNED__' ? 'selected' : ''}>⚪ Chưa phân công (${unassignedCount} bài)</option>
  `;

  opts += activeTesters.map(u => {
    const userCount = cycleTcs.filter(t => {
      const list = asgMap.get(t.id) || [];
      return list.some(a => a.assigneeUsername === u.username);
    }).length;
    return `<option value="${u.username}" ${asgFilterTester === u.username ? 'selected' : ''}>👤 ${u.name} (${userCount} bài)</option>`;
  }).join('');

  testerFilter.innerHTML = opts;
  testerFilter.value = asgFilterTester || '';
}

function populateAsgProjectSelector(activeId) {
  const prjSel = document.getElementById('asg-project-selector');
  if (!prjSel) return;
  const isLead = (window.location.pathname || '').toLowerCase().includes('/lead/');
  const projects = isLead ? (typeof getLeaderProjects === 'function' ? getLeaderProjects() : getAllProjects()) : (typeof getAccessibleProjects === 'function' ? getAccessibleProjects() : getAllProjects());
  
  if (projects.length > 0 && !projects.some(pr => pr.id === activeId)) {
    activeId = projects[0].id;
    state.activeProjectId = activeId;
  }

  prjSel.innerHTML = projects.map(pr => `
    <option value="${pr.id}" ${pr.id === activeId ? 'selected' : ''}>
      ${escapeHtml(pr.name)} (${(pr.testCases || []).length} bài)
    </option>
  `).join('');
  prjSel.value = activeId;
}

function populateAsgVersionSelector(projectId) {
  const verSel = document.getElementById('asg-version-selector');
  if (!verSel) return;
  const p = (state.projects || []).find(x => x.id === projectId) || getActiveProject();
  if (!p) return;

  const versions = (Array.isArray(p.versions) && p.versions.length > 0)
    ? p.versions
    : [{ version: p.activeVersion || 'v1.0', label: p.activeVersion || 'v1.0' }];

  if (!asgSelectedVersion || (!versions.some(v => v.version === asgSelectedVersion) && asgSelectedVersion !== '')) {
    asgSelectedVersion = p.activeVersion || versions[0]?.version || 'v1.0';
  }

  let options = versions.map(v => `
    <option value="${escapeHtml(v.version)}" ${v.version === asgSelectedVersion ? 'selected' : ''}>
      ${escapeHtml(v.version)} ${v.label ? `— ${escapeHtml(v.label)}` : ''} ${v.version === p.activeVersion ? '★' : ''}
    </option>
  `).join('');

  options = `<option value="">-- Tất cả phiên bản --</option>` + options;
  verSel.innerHTML = options;
  verSel.value = asgSelectedVersion;
}

function populateAsgCycleSelector(projectId, version) {
  const cycleSel = document.getElementById('detail-cycle');
  if (!cycleSel) return;
  let cycles = getTestCyclesForProject(projectId, version);

  if (cycles.length === 0 && version) {
    // Nếu lọc theo phiên bản mà không có, fallback lấy tất cả các đợt test của dự án
    cycles = getTestCyclesForProject(projectId);
  }

  if (cycles.length === 0) {
    cycleSel.innerHTML = `<option value="">(Chưa có đợt test cho phiên bản này)</option>`;
    state.activeCycleId = '';
    return;
  }

  let currentActiveId = state.activeCycleId;
  let activeCycle = cycles.find(c => c.id === currentActiveId) || cycles.find(c => c.status === 'ACTIVE') || cycles[0];
  state.activeCycleId = activeCycle.id;

  cycleSel.innerHTML = cycles.map(c => `
    <option value="${c.id}" ${c.id === activeCycle.id ? 'selected' : ''}>
      ${c.status === 'ACTIVE' ? '🟢' : c.status === 'CLOSED' ? '🔒' : '⏳'} ${escapeHtml(c.name)} (${c.version})
    </option>
  `).join('');
  cycleSel.value = activeCycle.id;
}

function handleAsgProjectChange(projectId) {
  if (!projectId) return;
  setActiveProject(projectId);
  if (typeof LeadContext !== 'undefined' && typeof LeadContext.switchProject === 'function') {
    LeadContext.switchProject(projectId);
    return;
  }
  const p = getActiveProject();
  asgSelectedVersion = p?.activeVersion || (p?.versions && p.versions[0]?.version) || '';
  populateAsgVersionSelector(projectId);
  populateAsgCycleSelector(projectId, asgSelectedVersion);
  asgSelectedTcIds.clear();
  asgSelectedModuleId = '';
  updateAsgHierarchyBreadcrumb();
  renderAsgOverviewTab();
  renderAsgDetailTab();
}

function handleAsgVersionChange(version) {
  asgSelectedVersion = version;
  const p = getActiveProject();
  populateAsgCycleSelector(p.id, version);
  asgSelectedTcIds.clear();
  updateAsgHierarchyBreadcrumb();
  renderAsgOverviewTab();
  renderAsgDetailTab();
}

function handleAsgCycleChange(cycleId) {
  if (!cycleId) return;
  setActiveCycle(cycleId);
  asgSelectedTcIds.clear();
  updateAsgHierarchyBreadcrumb();
  renderAsgOverviewTab();
  renderAsgDetailTab();
}

function updateAsgHierarchyBreadcrumb() {
  const el = document.getElementById('asg-hierarchy-breadcrumb');
  const topBadge = document.getElementById('asg-top-context-badge');
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const ctx = getHierarchyContext(state.activeProjectId, cycleId, null);
  if (el) el.innerHTML = ctx.breadcrumbHtml;
  if (topBadge) {
    topBadge.textContent = `${ctx.project?.code || 'PRJ'} • ${ctx.version} • ${ctx.cycle?.code || 'CYC'}`;
  }
}

function switchAsgMainTab(tabName) {
  asgCurrentTab = tabName;
  const btnOverview = document.getElementById('asg-tab-btn-overview');
  const btnDetail = document.getElementById('asg-tab-btn-detail');
  const paneOverview = document.getElementById('asg-tab-content-overview');
  const paneDetail = document.getElementById('asg-tab-content-detail');
  const topDispatch = document.getElementById('asg-tab-dispatch-actions');

  if (btnOverview) btnOverview.classList.toggle('active', tabName === 'overview');
  if (btnDetail) btnDetail.classList.toggle('active', tabName === 'detail');
  if (paneOverview) paneOverview.style.display = tabName === 'overview' ? 'block' : 'none';
  if (paneDetail) paneDetail.style.display = tabName === 'detail' ? 'block' : 'none';
  if (topDispatch) topDispatch.style.display = tabName === 'detail' ? 'flex' : 'none';

  if (tabName === 'overview') renderAsgOverviewTab();
  else renderAsgDetailTab();
}

function renderAsgOverviewTab() {
  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const allTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id && (!cycleId || !a.cycleId || a.cycleId === cycleId));
  const assignedTcIds = new Set(assignments.map(a => a.tcId));

  const total = allTcs.length;
  const assigned = assignedTcIds.size;
  const unassigned = Math.max(0, total - assigned);

  const setT = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setT('asg-stat-total', total);
  setT('asg-stat-assigned', assigned);
  setT('asg-stat-unassigned', unassigned);

  // Render tester workload rows
  const tbody = document.getElementById('asg-workload-tbody');
  if (!tbody) return;

  const allUsers = typeof getUsers === 'function' ? getUsers() : [];
  let testers = allUsers.filter(u => u.role === 'tester');
  if (testers.length === 0) testers = allUsers;

  tbody.innerHTML = testers.map(u => {
    const userAsgs = assignments.filter(a => a.assigneeUsername === u.username);
    const count = userAsgs.length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const isOver = count > u.max;

    return `
      <tr>
        <td><strong>👤 ${u.name}</strong></td>
        <td style="text-align:center"><strong>${count}</strong> bài</td>
        <td style="text-align:center"><strong>${pct}%</strong> đợt test</td>
        <td style="text-align:center">
          <span class="badge ${isOver ? 'badge-fail' : 'badge-pass'}">${isOver ? '🔴 Quá tải' : '🟢 Bình thường'}</span>
        </td>
        <td style="text-align:center">
          <button type="button" class="btn btn-primary btn-xs" onclick="jumpToDetailForTester('${u.username}')">⚙️ Phân bổ bài</button>
        </td>
      </tr>
    `;
  }).join('');
}

function jumpToDetailForTester(username) {
  const sel = document.getElementById('detail-assignee');
  if (sel) sel.value = username;

  // Luôn reset phân hệ về '' ([Tất cả phân hệ]) để toàn bộ kịch bản đã giao đều hiển thị đầy đủ
  asgSelectedModuleId = '';

  const p = getActiveProject();
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const assignments = (state.assignments || []).filter(a => (!p || a.projectId === p.id) && (!cycleId || !a.cycleId || a.cycleId === cycleId));
  const userAsgs = assignments.filter(a => a.assigneeUsername === username);

  if (userAsgs.length > 0) {
    asgFilterTester = username;
  } else {
    asgFilterTester = '__UNASSIGNED__';
  }

  // Reset checkbox đã chọn
  asgSelectedTcIds.clear();

  const testerFilter = document.getElementById('asg-filter-tester');
  if (testerFilter) testerFilter.value = asgFilterTester;

  switchAsgMainTab('detail');
}

function clearAsgTesterFilter() {
  asgFilterTester = '';
  const testerFilter = document.getElementById('asg-filter-tester');
  if (testerFilter) testerFilter.value = '';
  renderAsgDetailTab();
}

function filterByUnassignedForAssignee(username) {
  if (username) {
    const sel = document.getElementById('detail-assignee');
    if (sel) sel.value = username;
  }
  asgFilterTester = '__UNASSIGNED__';
  const testerFilter = document.getElementById('asg-filter-tester');
  if (testerFilter) testerFilter.value = '__UNASSIGNED__';
  renderAsgDetailTab();
}

function renderAsgDetailTab() {
  const p = getActiveProject();
  if (!p) {
    const list = document.getElementById('asg-module-list');
    if (list) list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted)">Chưa có dự án nào</div>';
    const tbody = document.getElementById('asg-tc-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted)">Chưa có dự án nào trong hệ thống</td></tr>';
    return;
  }

  // Đồng bộ danh sách tester trong dropdown bộ lọc
  populateAsgTesterFilter();

  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const cycleTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);
  const modules = getModules(curVer, p.id);
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id && (!cycleId || !a.cycleId || a.cycleId === cycleId));
  const asgMap = new Map();
  assignments.forEach(a => {
    if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
    asgMap.get(a.tcId).push(a);
  });

  // Validate active module selection
  if (asgSelectedModuleId && asgSelectedModuleId !== '' && !modules.some(m => m.id === asgSelectedModuleId)) {
    asgSelectedModuleId = '';
  }

  // 1. Calculate & Render KPI Strip for Current Cycle
  const totalTcs = cycleTcs.length;
  const assignedCount = cycleTcs.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0).length;
  const unassignedCount = Math.max(0, totalTcs - assignedCount);
  const assignedPct = totalTcs > 0 ? Math.round((assignedCount / totalTcs) * 100) : 0;

  let priorFailCount = 0;
  let priorPassCount = 0;
  let priorUntestedCount = 0;

  cycleTcs.forEach(t => {
    const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
    if (s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure) priorFailCount++;
    else if (s.lastStatus === 'PASS') priorPassCount++;
    else priorUntestedCount++;
  });

  // 1. Update Sleek Stats Ribbon (ISO 29119 Allocation & Defect Metrics)
  const selBadge = document.getElementById('asg-selected-count-badge');
  if (selBadge) selBadge.textContent = `${asgSelectedTcIds.size} / ${totalTcs}`;

  const asgBadge = document.getElementById('asg-stat-assigned-badge');
  if (asgBadge) asgBadge.textContent = `${assignedCount} (${assignedPct}%)`;

  const failBadge = document.getElementById('asg-stat-fail-badge');
  if (failBadge) failBadge.textContent = `${priorFailCount} lỗi cần Re-test`;

  const passBadge = document.getElementById('asg-stat-pass-badge');
  if (passBadge) passBadge.textContent = `${priorPassCount} đã Pass`;

  const unassignedBadge = document.getElementById('asg-stat-unassigned-badge');
  if (unassignedBadge) unassignedBadge.textContent = `${unassignedCount} chưa giao`;

  // 2. Render Left Modules List
  const modUl = document.getElementById('detail-modules-list');
  if (modUl) {
    const isAllModSelected = asgSelectedModuleId === '';
    const allModChecked = totalTcs > 0 && cycleTcs.every(t => asgSelectedTcIds.has(t.id));

    let allBadgeLabel = `${assignedCount}/${totalTcs}`;
    let allSubLabel = 'Toàn bộ kịch bản đợt test';
    let filterTesterObj = null;

    if (asgFilterTester && asgFilterTester !== '__UNASSIGNED__') {
      filterTesterObj = (typeof getUsers === 'function' ? getUsers() : []).find(u => u.username === asgFilterTester);
      const testerTotal = cycleTcs.filter(t => {
        const list = asgMap.get(t.id) || [];
        return list.some(a => a.assigneeUsername === asgFilterTester);
      }).length;
      allBadgeLabel = `${testerTotal} bài`;
      allSubLabel = `Kịch bản của ${filterTesterObj ? filterTesterObj.name : asgFilterTester}`;
    } else if (asgFilterTester === '__UNASSIGNED__') {
      allBadgeLabel = `${unassignedCount} bài`;
      allSubLabel = 'Kịch bản chưa phân công';
    }

    let modulesHtml = `
      <li class="asg-mod-item ${isAllModSelected ? 'active' : ''}" onclick="selectModuleInTree('')">
        <div style="display:flex; align-items:flex-start; gap:8px; flex:1; min-width:0; padding-right:8px">
          <input type="checkbox" ${allModChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleModuleSelection('', this.checked)" style="cursor:pointer; margin-top:3px" title="Chọn toàn bộ kịch bản đợt test" />
          <div style="display:flex; flex-direction:column; min-width:0">
            <span style="font-size:12.5px; font-weight:700; color:var(--text-primary)">📁 [Tất cả phân hệ]</span>
            <span style="font-size:11px; color:var(--text-muted)">${allSubLabel}</span>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0">
          <span class="badge ${asgFilterTester ? 'badge-pass' : (totalTcs > 0 ? 'badge-nr' : '')}" style="font-size:10.5px; font-weight:700">${allBadgeLabel}</span>
          ${priorFailCount > 0 ? `<span class="asg-mod-bug-badge">⚠️ ${priorFailCount} lỗi</span>` : ''}
        </div>
      </li>
    `;

    modulesHtml += modules.map(m => {
      const modTcs = cycleTcs.filter(t => t.module === m.id);
      const modAssigned = modTcs.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0).length;
      const isSelectedMod = m.id === asgSelectedModuleId;
      const allModSelected = modTcs.length > 0 && modTcs.every(t => asgSelectedTcIds.has(t.id));
      
      const modBugs = modTcs.filter(t => {
        const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
        return s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure;
      }).length;

      let modBadgeText = `${modAssigned}/${modTcs.length}`;
      let modBadgeClass = modTcs.length > 0 ? 'badge-nr' : '';

      if (asgFilterTester && asgFilterTester !== '__UNASSIGNED__') {
        const modTesterCount = modTcs.filter(t => {
          const list = asgMap.get(t.id) || [];
          return list.some(a => a.assigneeUsername === asgFilterTester);
        }).length;
        modBadgeText = `${modTesterCount}/${modTcs.length}`;
        modBadgeClass = modTesterCount > 0 ? 'badge-pass' : '';
      } else if (asgFilterTester === '__UNASSIGNED__') {
        const modUnassignedCount = modTcs.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0).length;
        modBadgeText = `${modUnassignedCount}/${modTcs.length}`;
        modBadgeClass = modUnassignedCount > 0 ? 'badge-fail' : '';
      }

      return `
        <li class="asg-mod-item ${isSelectedMod ? 'active' : ''}" onclick="selectModuleInTree('${m.id}')">
          <div style="display:flex; align-items:flex-start; gap:8px; flex:1; min-width:0; padding-right:8px">
            <input type="checkbox" ${allModSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleModuleSelection('${m.id}', this.checked)" style="cursor:pointer; margin-top:3px" title="Chọn tất cả kịch bản phân hệ này" />
            <div style="display:flex; flex-direction:column; min-width:0">
              <span style="font-family:monospace; font-weight:800; color:var(--primary); font-size:11px">[${m.id}]</span>
              <span style="font-size:12px; font-weight:600; color:var(--text-primary); line-height:1.35">${escapeHtml(m.name)}</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0">
            <span class="badge ${modBadgeClass}" style="font-size:10.5px; font-weight:700">${modBadgeText}</span>
            ${modBugs > 0 ? `<span class="asg-mod-bug-badge">⚠️ ${modBugs} lỗi</span>` : ''}
          </div>
        </li>
      `;
    }).join('');

    modUl.innerHTML = modulesHtml;
  }

  // 3. Render Right Test Cases Table
  renderAsgTcTable();
}

function selectModuleInTree(modId) {
  asgSelectedModuleId = modId;
  renderAsgDetailTab();
}

function toggleModuleSelection(modId, isChecked) {
  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const cycleTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);
  
  const targetTcs = modId === '' ? cycleTcs : cycleTcs.filter(t => t.module === modId);
  targetTcs.forEach(t => {
    if (isChecked) asgSelectedTcIds.add(t.id);
    else asgSelectedTcIds.delete(t.id);
  });
  renderAsgDetailTab();
}

function handleAsgFilterChange() {
  asgFilterSearch = (document.getElementById('asg-filter-search')?.value || '').trim();
  asgFilterStatus = document.getElementById('asg-filter-status')?.value || '';
  asgFilterTester = document.getElementById('asg-filter-tester')?.value || '';
  asgFilterHistory = document.getElementById('asg-filter-history')?.value || '';
  asgFilterPriority = document.getElementById('asg-filter-priority')?.value || '';
  renderAsgDetailTab();
}

function resetAsgFilters() {
  const searchEl = document.getElementById('asg-filter-search');
  const statusEl = document.getElementById('asg-filter-status');
  const testerEl = document.getElementById('asg-filter-tester');
  const histEl = document.getElementById('asg-filter-history');
  const prioEl = document.getElementById('asg-filter-priority');
  if (searchEl) searchEl.value = '';
  if (statusEl) statusEl.value = '';
  if (testerEl) testerEl.value = '';
  if (histEl) histEl.value = '';
  if (prioEl) prioEl.value = '';

  asgFilterSearch = '';
  asgFilterStatus = '';
  asgFilterTester = '';
  asgFilterHistory = '';
  asgFilterPriority = '';
  renderAsgDetailTab();
}

function applyAsgPreset(type) {
  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const cycleTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id && (!cycleId || !a.cycleId || a.cycleId === cycleId));
  const assignedTcIds = new Set(assignments.map(a => a.tcId));

  if (type === 'FAILED_RECENT') {
    asgSelectedTcIds.clear();
    let count = 0;
    cycleTcs.forEach(t => {
      const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
      if (s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure) {
        asgSelectedTcIds.add(t.id);
        count++;
      }
    });
    showToast(`⚠️ Đã chọn ${count} kịch bản từng bị Lỗi ở đợt trước để giao Re-test!`, 'info');
  } else if (type === 'UNASSIGNED') {
    asgSelectedTcIds.clear();
    let count = 0;
    cycleTcs.forEach(t => {
      if (!assignedTcIds.has(t.id)) {
        asgSelectedTcIds.add(t.id);
        count++;
      }
    });
    showToast(`⚪ Đã chọn ${count} kịch bản chưa được phân công!`, 'info');
  } else if (type === 'ALL') {
    cycleTcs.forEach(t => asgSelectedTcIds.add(t.id));
    showToast(`⚡ Đã chọn tất cả ${cycleTcs.length} kịch bản của đợt test!`, 'info');
  } else if (type === 'NONE') {
    asgSelectedTcIds.clear();
    showToast(`✕ Đã bỏ chọn tất cả kịch bản!`, 'info');
  }

  renderAsgDetailTab();
}

function renderAsgTcTable() {
  const tbody = document.getElementById('detail-tc-tbody');
  const panelHead = document.getElementById('detail-panel-head');
  if (!tbody) return;

  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const cycleTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);
  const modules = getModules(curVer, p.id);
  const assignments = (state.assignments || []).filter(a => a.projectId === p.id && (!cycleId || !a.cycleId || a.cycleId === cycleId));
  const asgMap = new Map();
  assignments.forEach(a => {
    if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
    asgMap.get(a.tcId).push(a);
  });

  // Determine target scope (Module or All)
  let targetTcs = cycleTcs;
  let activeTitle = 'Tất Cả Các Phân Hệ Nghiệp Vụ';
  let activeBadge = '[ALL]';

  if (asgSelectedModuleId) {
    const currMod = modules.find(m => m.id === asgSelectedModuleId);
    if (currMod) {
      targetTcs = cycleTcs.filter(t => t.module === currMod.id);
      activeTitle = currMod.name;
      activeBadge = `[${currMod.id}]`;
    }
  }

  // Multi-dimensional filtering
  let filteredTcs = targetTcs;

  if (asgFilterSearch) {
    const term = asgFilterSearch.toLowerCase();
    filteredTcs = filteredTcs.filter(t => 
      (t.id || '').toLowerCase().includes(term) || 
      (t.name || t.title || '').toLowerCase().includes(term) || 
      (t.objective || '').toLowerCase().includes(term) ||
      (t.module || '').toLowerCase().includes(term)
    );
  }

  if (asgFilterStatus === 'UNASSIGNED') {
    filteredTcs = filteredTcs.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0);
  } else if (asgFilterStatus === 'ASSIGNED') {
    filteredTcs = filteredTcs.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0);
  }

  if (asgFilterTester === '__UNASSIGNED__') {
    filteredTcs = filteredTcs.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0);
  } else if (asgFilterTester) {
    filteredTcs = filteredTcs.filter(t => {
      const list = asgMap.get(t.id) || [];
      return list.some(a => a.assigneeUsername === asgFilterTester);
    });
  }

  if (asgFilterHistory === 'FAIL') {
    filteredTcs = filteredTcs.filter(t => {
      const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
      return s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure;
    });
  } else if (asgFilterHistory === 'PASS') {
    filteredTcs = filteredTcs.filter(t => {
      const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
      return s.lastStatus === 'PASS';
    });
  } else if (asgFilterHistory === 'UNTESTED') {
    filteredTcs = filteredTcs.filter(t => {
      const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
      return s.lastStatus === 'UNTESTED' && !s.hadFailure;
    });
  }

  if (asgFilterPriority) {
    filteredTcs = filteredTcs.filter(t => t.priority === asgFilterPriority);
  }

  // Update counter badges
  const filterBadgeEl = document.getElementById('asg-filter-count-badge');
  if (filterBadgeEl) {
    filterBadgeEl.textContent = `Đang hiển thị: ${filteredTcs.length} / ${targetTcs.length} kịch bản`;
  }

  const selectedCountBadge = document.getElementById('asg-selected-count-badge');
  if (selectedCountBadge) {
    selectedCountBadge.textContent = `${asgSelectedTcIds.size} / ${cycleTcs.length}`;
  }

  // Panel Header
  if (panelHead) {
    let testerBadgeBanner = '';
    if (asgFilterTester && asgFilterTester !== '__UNASSIGNED__') {
      const u = (typeof getUsers === 'function' ? getUsers() : []).find(x => x.username === asgFilterTester);
      const testerName = u ? u.name : asgFilterTester;
      testerBadgeBanner = `
        <div style="display:flex; align-items:center; gap:6px; background:#eff6ff; border:1px solid #bfdbfe; padding:2px 8px; border-radius:6px; font-size:11.5px; color:#1e40af">
          <span>👁️ Đang hiển thị bài của: <strong>👤 ${escapeHtml(testerName)}</strong></span>
          <button type="button" class="btn btn-outline btn-xs" style="padding:1px 6px; font-size:10.5px; background:#fff" onclick="filterByUnassignedForAssignee('${asgFilterTester}')" title="Xem kịch bản chưa giao để giao thêm">➕ Xem bài chưa giao</button>
          <button type="button" class="btn btn-outline btn-xs" style="padding:1px 6px; font-size:10.5px; background:#fff" onclick="clearAsgTesterFilter()" title="Xem tất cả bài đợt test">✕ Xem tất cả</button>
        </div>
      `;
    } else if (asgFilterTester === '__UNASSIGNED__') {
      testerBadgeBanner = `
        <div style="display:flex; align-items:center; gap:6px; background:#fef3c7; border:1px solid #fde68a; padding:2px 8px; border-radius:6px; font-size:11.5px; color:#92400e">
          <span>⚪ Đang lọc: <strong>Kịch bản CHƯA GIAO VIỆC</strong></span>
          <button type="button" class="btn btn-outline btn-xs" style="padding:1px 6px; font-size:10.5px; background:#fff" onclick="clearAsgTesterFilter()">✕ Xem tất cả</button>
        </div>
      `;
    }

    panelHead.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
        <span class="badge badge-nr" style="font-family:monospace; font-weight:800; color:var(--primary)">${activeBadge}</span>
        <strong style="font-size:13.5px">${activeTitle}</strong>
        <span style="font-size:11.5px; color:var(--text-muted)">(${filteredTcs.length} kịch bản)</span>
        ${testerBadgeBanner}
      </div>
      <div style="display:flex; gap:6px">
        <button type="button" class="btn btn-outline btn-xs" onclick="batchSelectCurrentMod(true)">☑️ Chọn tất cả (${filteredTcs.length})</button>
        <button type="button" class="btn btn-outline btn-xs" onclick="batchSelectCurrentMod(false)">⬜ Bỏ chọn</button>
      </div>
    `;
  }

  const selectAllBox = document.getElementById('asg-mod-select-all');
  if (selectAllBox) {
    selectAllBox.checked = filteredTcs.length > 0 && filteredTcs.every(t => asgSelectedTcIds.has(t.id));
  }

  if (filteredTcs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:36px; color:var(--text-muted)">
          <div style="font-size:26px; margin-bottom:8px">🔍</div>
          <div style="font-weight:700">Không tìm thấy kịch bản nào khớp với bộ lọc hiện tại.</div>
          <div style="font-size:12px; margin-top:4px">Thử bấm "Đặt lại lọc" hoặc chọn phân hệ khác.</div>
        </td>
      </tr>
    `;
    return;
  }

function renderCompactPriorityBadge(priority) {
  const p = (priority || 'P3').toUpperCase();
  if (p === 'P1') return '<span class="badge badge-p1" style="font-size:10.5px; font-weight:800; padding:2px 6px" title="Ưu tiên P1 (Khẩn cấp)">P1</span>';
  if (p === 'P2') return '<span class="badge badge-p2" style="font-size:10.5px; font-weight:800; padding:2px 6px" title="Ưu tiên P2 (Quan trọng)">P2</span>';
  if (p === 'P3') return '<span class="badge badge-p3" style="font-size:10.5px; font-weight:800; padding:2px 6px" title="Ưu tiên P3 (Trung bình)">P3</span>';
  return '<span class="badge badge-p4" style="font-size:10.5px; font-weight:800; padding:2px 6px" title="Ưu tiên P4 (Thấp)">P4</span>';
}

  tbody.innerHTML = filteredTcs.map(tc => {
    const isChecked = asgSelectedTcIds.has(tc.id);
    const asgList = asgMap.get(tc.id) || [];
    const summary = getTcPriorExecutionSummary(tc.id, cycleId, p.id);

    // Prior Round Execution Summary Column
    let priorHistoryHtml = '';
    if (summary.lastStatus === 'FAIL' || summary.hadFailure) {
      priorHistoryHtml = `
        <div class="asg-history-badge" title="${escapeHtml(summary.lastFailReason || 'Lỗi ở đợt kiểm thử trước')}">
          <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap">
            <span class="asg-history-fail" style="font-size:11px; font-weight:800">[${summary.lastCycleCode || 'R1'}] ❌ FAIL</span>
            <span class="asg-mod-bug-badge" style="font-size:10px; padding:1px 5px">⚠️ Cần Re-test</span>
          </div>
          ${summary.lastFailReason ? `<div style="font-size:10.5px; color:#b91c1c; line-height:1.3; margin-top:2px; word-break:break-word">${escapeHtml(summary.lastFailReason)}</div>` : ''}
          ${summary.lastTester ? `<div style="font-size:10px; color:var(--text-muted); margin-top:2px">Tester trước: ${escapeHtml(summary.lastTester)}</div>` : ''}
        </div>
      `;
    } else if (summary.lastStatus === 'PASS') {
      priorHistoryHtml = `
        <div class="asg-history-badge">
          <span class="asg-history-pass" style="font-size:11px; font-weight:800">[${summary.lastCycleCode || 'R1'}] ✅ PASS</span>
          <span style="font-size:10px; color:#15803d; margin-top:1px">Đạt ở round trước</span>
        </div>
      `;
    } else {
      priorHistoryHtml = `
        <div class="asg-history-badge">
          <span class="asg-history-untested" style="font-size:11px">⚪ Chưa từng test</span>
          <span style="font-size:10px; color:var(--text-muted)">Kịch bản mới</span>
        </div>
      `;
    }

    // Assignee and Status Columns
    let assigneeHtml = '<span class="badge badge-nr" style="color:#b45309; background:#fef3c7; font-size:10.5px; padding:2px 6px">⚪ Chưa giao</span>';
    let statusHtml = '<span class="badge badge-nr" style="font-size:10.5px; padding:2px 6px">⚪ Chưa giao</span>';
    let dateHtml = '<span style="color:var(--text-muted); font-size:11px">--</span>';
    let actionHtml = `<button type="button" class="btn-tc-action btn-tc-assign" onclick="quickAssignSingle('${tc.id}')" style="padding:2px 7px; font-size:11px" title="Giao kịch bản này cho tester đang chọn">+ Giao</button>`;

    if (asgList.length > 0) {
      assigneeHtml = `
        <div style="display:flex; flex-direction:column; gap:4px">
          ${asgList.map(a => {
            const shortName = escapeHtml(a.assigneeName.split('(')[0].trim());
            return `
              <div class="tc-assignee-tag" style="display:inline-flex; align-items:center; justify-content:space-between; gap:4px; font-size:11px; padding:2px 6px; max-width:145px" title="${escapeHtml(a.assigneeName)}">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap">👤 ${shortName}</span>
                <button type="button" onclick="event.stopPropagation(); cancelTcAsg('${tc.id}', '${a.assigneeUsername}')" style="border:none; background:transparent; color:#ef4444; cursor:pointer; font-size:11px; padding:0 2px; line-height:1" title="Hủy phân công của ${shortName}">✕</button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      statusHtml = `
        <div style="display:flex; flex-direction:column; gap:4px; align-items:center">
          ${asgList.map(a => {
            if (a.status === 'PASSED') return '<span class="badge badge-pass" style="font-size:10px; padding:1px 5px">✅ Đạt</span>';
            if (a.status === 'FAILED') return '<span class="badge badge-fail" style="font-size:10px; padding:1px 5px">❌ Lỗi</span>';
            if (a.status === 'BLOCKED' || a.status === 'Blocked') return '<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #f87171;font-size:10px; padding:1px 5px">⛔ Bị chặn</span>';
            return '<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:10px; padding:1px 5px">⏳ Đang làm</span>';
          }).join('')}
        </div>
      `;

      if (asgList.length === 1) {
        const asg = asgList[0];
        const sPart = asg.startDate ? asg.startDate.slice(5).replace('-', '/') : '';
        const dPart = asg.dueDate ? asg.dueDate.slice(5).replace('-', '/') : '';
        const dateText = sPart && dPart ? `${sPart} ➔ ${dPart}` : (dPart ? `Hạn: ${dPart}` : '--');
        dateHtml = `<span style="font-family:monospace; font-size:10.5px; font-weight:700" title="Bắt đầu: ${asg.startDate || '--'} | Hạn chót: ${asg.dueDate || '--'}">📅 ${dateText}</span>`;
      } else {
        dateHtml = `
          <div style="display:flex; flex-direction:column; gap:4px; align-items:center">
            ${asgList.map(a => {
              const dPart = a.dueDate ? a.dueDate.slice(5).replace('-', '/') : '--';
              return `<span style="font-family:monospace; font-size:10px; font-weight:600" title="${escapeHtml(a.assigneeName)} - Hạn: ${a.dueDate || '--'}">📅 ${dPart}</span>`;
            }).join('')}
          </div>
        `;
      }

      actionHtml = `
        <div style="display:flex; gap:3px; justify-content:center">
          <button type="button" class="btn-tc-action btn-tc-assign" onclick="quickAssignSingle('${tc.id}')" style="padding:2px 5px; font-size:10.5px" title="Giao thêm kịch bản này cho tester khác">+ Thêm</button>
          <button type="button" class="btn-tc-action btn-tc-cancel" onclick="cancelTcAsg('${tc.id}')" style="padding:2px 5px; font-size:10.5px" title="Hủy toàn bộ phân công của bài này">✕ Hết</button>
        </div>
      `;
    }

    return `
      <tr class="${isChecked ? 'selected-row' : ''}">
        <td style="text-align:center">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTcCheckbox('${tc.id}', this.checked)" style="cursor:pointer" />
        </td>
        <td style="text-align:center; white-space:nowrap">
          <span class="tc-code-link" onclick="openAsgTcDetail('${tc.id}')" style="font-size:11px; font-weight:700">[${tc.id}]</span>
        </td>
        <td style="text-align:center; white-space:nowrap">
          <span style="font-family:monospace; font-weight:700; font-size:11px; color:var(--text-muted)">[${tc.module}]</span>
        </td>
        <td style="text-align:center; white-space:nowrap">${renderCompactPriorityBadge(tc.priority)}</td>
        <td style="word-break:break-word">
          <div class="tc-name-link" onclick="openAsgTcDetail('${tc.id}')" title="${escapeHtml(tc.name || tc.title)}" style="font-size:12px; font-weight:600; line-height:1.35">${escapeHtml(tc.name || tc.title)}</div>
          ${tc.objective ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px; line-height:1.25" title="${escapeHtml(tc.objective)}">${escapeHtml(tc.objective)}</div>` : ''}
        </td>
        <td>${priorHistoryHtml}</td>
        <td>${assigneeHtml}</td>
        <td style="text-align:center">${statusHtml}</td>
        <td style="text-align:center; white-space:nowrap">${dateHtml}</td>
        <td style="text-align:center; white-space:nowrap">
          <div style="display:flex; align-items:center; justify-content:center; gap:4px">
            <button type="button" class="btn-tc-action btn-tc-inspect" onclick="openAsgTcDetail('${tc.id}')" style="padding:2px 5px; font-size:11px" title="Xem chi tiết">👁️</button>
            ${actionHtml}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleTcCheckbox(tcId, isChecked) {
  if (isChecked) asgSelectedTcIds.add(tcId);
  else asgSelectedTcIds.delete(tcId);
  renderAsgTcTable();
}

function batchSelectCurrentMod(select) {
  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const cycleTcs = cycleId ? getTestCasesForCycle(cycleId) : getAllTcs(curVer, p.id);

  let targetTcs = cycleTcs;
  if (asgSelectedModuleId) {
    targetTcs = targetTcs.filter(t => t.module === asgSelectedModuleId);
  }

  // Also respect active search/history/status/tester filters if any
  if (asgFilterSearch || asgFilterStatus || asgFilterTester || asgFilterHistory || asgFilterPriority) {
    const assignments = (state.assignments || []).filter(a => a.projectId === p.id && (!cycleId || !a.cycleId || a.cycleId === cycleId));
    const asgMap = new Map();
    assignments.forEach(a => {
      if (!asgMap.has(a.tcId)) asgMap.set(a.tcId, []);
      asgMap.get(a.tcId).push(a);
    });

    if (asgFilterSearch) {
      const term = asgFilterSearch.toLowerCase();
      targetTcs = targetTcs.filter(t => (t.id || '').toLowerCase().includes(term) || (t.name || t.title || '').toLowerCase().includes(term) || (t.objective || '').toLowerCase().includes(term));
    }
    if (asgFilterStatus === 'UNASSIGNED') {
      targetTcs = targetTcs.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0);
    } else if (asgFilterStatus === 'ASSIGNED') {
      targetTcs = targetTcs.filter(t => asgMap.has(t.id) && asgMap.get(t.id).length > 0);
    }
    if (asgFilterTester === '__UNASSIGNED__') {
      targetTcs = targetTcs.filter(t => !asgMap.has(t.id) || asgMap.get(t.id).length === 0);
    } else if (asgFilterTester) {
      targetTcs = targetTcs.filter(t => {
        const list = asgMap.get(t.id) || [];
        return list.some(a => a.assigneeUsername === asgFilterTester);
      });
    }
    if (asgFilterHistory === 'FAIL') {
      targetTcs = targetTcs.filter(t => {
        const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
        return s.lastStatus === 'FAIL' || s.lastStatus === 'BLOCKED' || s.hadFailure;
      });
    } else if (asgFilterHistory === 'PASS') {
      targetTcs = targetTcs.filter(t => {
        const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
        return s.lastStatus === 'PASS';
      });
    } else if (asgFilterHistory === 'UNTESTED') {
      targetTcs = targetTcs.filter(t => {
        const s = getTcPriorExecutionSummary(t.id, cycleId, p.id);
        return s.lastStatus === 'UNTESTED' && !s.hadFailure;
      });
    }
    if (asgFilterPriority) {
      targetTcs = targetTcs.filter(t => t.priority === asgFilterPriority);
    }
  }

  targetTcs.forEach(t => {
    if (select) asgSelectedTcIds.add(t.id);
    else asgSelectedTcIds.delete(t.id);
  });
  renderAsgDetailTab();
}

function confirmBatchDispatch() {
  if (asgSelectedTcIds.size === 0) {
    showToast('⚠️ Vui lòng chọn ít nhất 1 kịch bản để giao!', 'error');
    return;
  }
  const testerSel = document.getElementById('detail-assignee');
  const cycleSel = document.getElementById('detail-cycle');
  const sDate = document.getElementById('detail-start-date')?.value || new Date().toISOString().slice(0, 10);
  const dDate = document.getElementById('detail-due-date')?.value || new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const username = testerSel.value;
  const testerName = testerSel.options[testerSel.selectedIndex]?.text || username;

  const p = getActiveProject();
  if (!p) return;

  const cycleId = cycleSel ? cycleSel.value : (getActiveCycle(p.id)?.id || 'CYC-SMARTVMS-01');
  const curCycle = getCycleById(cycleId);

  let assignedCount = 0;
  asgSelectedTcIds.forEach(tcId => {
    // Tìm phân công của CHÍNH TESTER NÀY cho testcase trong đợt test hiện tại (không ghi đè người khác!)
    const existing = state.assignments.find(a => 
      a.projectId === p.id && 
      a.tcId === tcId && 
      (a.cycleId === cycleId || !a.cycleId) && 
      a.assigneeUsername === username
    );

    if (existing) {
      existing.cycleId = cycleId;
      existing.cycleName = curCycle ? curCycle.name : 'Đợt kiểm thử';
      existing.assigneeName = testerName;
      existing.startDate = sDate;
      existing.dueDate = dDate;
      existing.status = existing.status || 'WIP';
    } else {
      state.assignments.push({
        id: `asg-${Date.now()}-${tcId}-${username}`,
        projectId: p.id,
        cycleId: cycleId,
        cycleName: curCycle ? curCycle.name : 'Đợt kiểm thử',
        tcId,
        assigneeUsername: username,
        assigneeName: testerName,
        assignedBy: getCurrentUser().name,
        startDate: sDate,
        dueDate: dDate,
        status: 'WIP',
        assignedAt: new Date().toISOString()
      });
    }
    assignedCount++;
  });

  saveCoreState();
  asgSelectedTcIds.clear();
  showToast(`🚀 Đã giao ${assignedCount} kịch bản cho ${testerName} thuộc đợt: ${curCycle?.name || cycleId}!`, 'success');
  renderAsgDetailTab();
}

function quickAssignSingle(tcId) {
  asgSelectedTcIds.clear();
  asgSelectedTcIds.add(tcId);
  confirmBatchDispatch();
}

function cancelTcAsg(tcId, username) {
  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;

  if (username) {
    // Chỉ hủy phân công cho nhân sự cụ thể được chọn
    state.assignments = state.assignments.filter(a => !(a.projectId === p.id && a.tcId === tcId && (a.cycleId === cycleId || !a.cycleId) && a.assigneeUsername === username));
    showToast(`✕ Đã hủy phân công kịch bản [${tcId}] của nhân sự ${username}`, 'info');
  } else {
    // Hủy toàn bộ phân công của kịch bản này trong đợt test
    state.assignments = state.assignments.filter(a => !(a.projectId === p.id && a.tcId === tcId && (a.cycleId === cycleId || !a.cycleId)));
    showToast(`✕ Đã hủy toàn bộ phân công kịch bản [${tcId}] trong đợt test`, 'info');
  }
  saveCoreState();
  renderAsgDetailTab();
}

function openAsgTcDetail(tcId) {
  const p = getActiveProject();
  if (!p) return;
  const cycleId = document.getElementById('detail-cycle')?.value || state.activeCycleId;
  const cycle = getCycleById(cycleId);
  const curVer = cycle?.version || p.activeVersion || 'v1.0';
  const allTcs = getAllTcs(curVer, p.id);
  const tc = allTcs.find(t => t.id === tcId) || (p.testCases || []).find(t => t.id === tcId);
  if (!tc) return;

  const tcAsgs = (state.assignments || []).filter(a => a.projectId === p.id && a.tcId === tcId && (a.cycleId === cycleId || !a.cycleId));
  const res = state.results ? state.results[tcId] : null;
  const summary = getTcPriorExecutionSummary(tc.id, cycleId, p.id);
  const title = document.getElementById('modal-asg-tc-title');
  const body = document.getElementById('modal-asg-tc-body');

  const reqId = tc.reqId || `SRS-SMARTVMS-${tc.module || 'M01'}`;
  const platform = tc.platform || 'Desktop / Web Client';
  const type = tc.type || 'Kiểm thử chức năng (Functional)';
  const version = tc.version || curVer;

  if (title) {
    title.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%; padding-right:24px">
        <span><strong style="color:var(--primary); font-family:monospace">[${tc.id}]</strong> ${escapeHtml(tc.name || tc.title)}</span>
        <button type="button" class="btn btn-outline btn-xs" onclick="navigator.clipboard.writeText('${tc.id}'); showToast('📋 Đã chép mã kịch bản!', 'info')">📋 Chép mã</button>
      </div>
    `;
  }

  // Steps
  let stepsHtml = '';
  if (Array.isArray(tc.steps) && tc.steps.length > 0) {
    stepsHtml = tc.steps.map((s, idx) => `
      <div style="display:flex; gap:8px; margin-bottom:6px; font-size:12px; background:var(--bg-body); padding:6px 10px; border-radius:4px">
        <span style="font-weight:700; color:var(--primary); min-width:20px">${idx + 1}.</span>
        <span>${escapeHtml(s)}</span>
      </div>
    `).join('');
  } else if (typeof tc.steps === 'string') {
    stepsHtml = `<div style="font-size:12px; line-height:1.5; background:var(--bg-body); padding:8px 10px; border-radius:4px">${escapeHtml(tc.steps)}</div>`;
  } else {
    stepsHtml = `<div style="font-size:12px; color:var(--text-muted)">Chưa cập nhật các bước thực hiện chi tiết.</div>`;
  }

  // Prior rounds execution status
  let priorStatusHtml = '';
  if (summary.lastStatus === 'FAIL' || summary.hadFailure) {
    priorStatusHtml = `
      <div style="background:#fff1f2; padding:10px 14px; border-radius:6px; border:1px solid #fecdd3; margin-bottom:12px; font-size:12px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
          <strong style="color:#b91c1c">⚠️ Kết quả ở đợt kiểm thử trước: [${summary.lastCycleCode || 'ROUND-1'}]</strong>
          <span class="badge badge-fail">❌ BỊ LỖI (CẦN RE-TEST)</span>
        </div>
        ${summary.lastFailReason ? `<div style="margin-top:4px; color:#b91c1c"><strong>Nguyên nhân lỗi:</strong> ${escapeHtml(summary.lastFailReason)}</div>` : ''}
        ${summary.lastActualResult ? `<div style="margin-top:4px; font-size:11.5px; color:var(--text-secondary)"><strong>Kết quả thực tế ghi nhận:</strong> ${escapeHtml(summary.lastActualResult)}</div>` : ''}
        ${summary.lastTester ? `<div style="margin-top:4px; font-size:11px; color:var(--text-muted)">Người kiểm thử trước: <strong>${escapeHtml(summary.lastTester)}</strong> lúc ${summary.lastRunAt || '--'}</div>` : ''}
      </div>
    `;
  } else if (summary.lastStatus === 'PASS') {
    priorStatusHtml = `
      <div style="background:#f0fdf4; padding:10px 14px; border-radius:6px; border:1px solid #bbf7d0; margin-bottom:12px; font-size:12px">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <strong style="color:#15803d">✅ Kết quả ở đợt kiểm thử trước: [${summary.lastCycleCode || 'ROUND-1'}]</strong>
          <span class="badge badge-pass">PASS (ĐẠT)</span>
        </div>
      </div>
    `;
  }

  // Current execution result
  let execStatusHtml = '';
  if (res) {
    let statBadge = statusBadge(res.status);
    execStatusHtml = `
      <div style="background:var(--bg-surface); padding:10px 14px; border-radius:6px; border:1px solid var(--border); margin-bottom:12px; font-size:12px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
          <strong>Trạng thái thực thi đợt hiện tại:</strong>
          <span>${statBadge}</span>
        </div>
        ${res.actualResult ? `<div style="margin-top:4px"><strong>Kết quả thực tế:</strong> ${escapeHtml(res.actualResult)}</div>` : ''}
        ${res.failReason ? `<div style="margin-top:4px; color:#dc2626"><strong>Lý do lỗi:</strong> ${escapeHtml(res.failReason)}</div>` : ''}
      </div>
    `;
  }

  if (body) {
    body.innerHTML = `
      <!-- ISO Metadata Banner -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; background:var(--bg-surface); padding:12px; border-radius:8px; border:1px solid var(--border); margin-bottom:12px; font-size:12px">
        <div><span style="color:var(--text-muted)">Phân hệ:</span> <strong>${getModuleName(tc.module)}</strong></div>
        <div><span style="color:var(--text-muted)">Mã SRS (Traceability):</span> <strong style="color:var(--primary); font-family:monospace">${reqId}</strong></div>
        <div><span style="color:var(--text-muted)">Nền tảng:</span> <strong>${escapeHtml(platform)}</strong></div>
        <div><span style="color:var(--text-muted)">Loại kiểm thử:</span> <strong>${escapeHtml(type)}</strong></div>
        <div><span style="color:var(--text-muted)">Mức ưu tiên:</span> ${priorityBadge(tc.priority)}</div>
        <div><span style="color:var(--text-muted)">Phiên bản mục tiêu:</span> <strong>${escapeHtml(version)}</strong></div>
      </div>

      <!-- Assignment Status Bar -->
      <div style="background:var(--bg-surface); padding:10px 14px; border-radius:6px; border:1px solid var(--border); margin-bottom:12px; font-size:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
          <strong>Phân công trong đợt [${cycle?.code || cycleId}]:</strong> 
          ${tcAsgs.length > 0 ? tcAsgs.map(a => `
            <span style="display:inline-flex; align-items:center; gap:4px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:2px 8px; font-size:11.5px">
              👤 <strong>${escapeHtml(a.assigneeName.split('(')[0].trim())}</strong> (Hạn: ${a.dueDate || '--'})
              <button type="button" onclick="cancelTcAsg('${tc.id}', '${a.assigneeUsername}'); closeModal('modal-asg-tc-detail')" style="border:none; background:transparent; color:#ef4444; cursor:pointer; font-size:11px" title="Hủy phân công người này">✕</button>
            </span>
          `).join('') : '<span style="color:#d97706">⚪ Chưa phân công nhân sự nào</span>'}
        </div>
        <div style="display:flex; gap:6px">
          <button type="button" class="btn btn-primary btn-xs" onclick="quickAssignSingle('${tc.id}'); closeModal('modal-asg-tc-detail')">⚡ Giao cho Tester đang chọn ở trên</button>
          ${tcAsgs.length > 0 ? `<button type="button" class="btn btn-outline btn-xs" style="color:#dc2626" onclick="cancelTcAsg('${tc.id}'); closeModal('modal-asg-tc-detail')">✕ Hủy tất cả</button>` : ''}
        </div>
      </div>

      ${priorStatusHtml}
      ${execStatusHtml}

      <!-- Precondition & Test Data -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px; font-size:12px">
        <div style="background:var(--bg-body); padding:10px 12px; border-radius:6px; border:1px solid var(--border)">
          <div style="font-weight:700; margin-bottom:4px; color:var(--text-primary)">Tiền điều kiện (Precondition):</div>
          <div style="color:var(--text-secondary)">${escapeHtml(tc.precondition || 'Môi trường sẵn sàng, tài khoản phân quyền hợp lệ.')}</div>
        </div>
        <div style="background:var(--bg-body); padding:10px 12px; border-radius:6px; border:1px solid var(--border)">
          <div style="font-weight:700; margin-bottom:4px; color:var(--text-primary)">Dữ liệu kiểm thử (Test Data):</div>
          <div style="color:var(--text-secondary); font-family:monospace">${escapeHtml(tc.testData || 'Sử dụng dữ liệu mẫu hệ thống SmartVMS.')}</div>
        </div>
      </div>

      <!-- Test Steps -->
      <div style="margin-bottom:12px">
        <div style="font-weight:700; font-size:12.5px; margin-bottom:6px; color:var(--text-primary)">Các bước thực hiện (Test Steps - ISO 29119-3):</div>
        ${stepsHtml}
      </div>

      <!-- Expected Result -->
      <div style="background:rgba(34,197,94,0.08); padding:12px 14px; border-radius:8px; border:1px solid #86efac; color:#15803d; margin-bottom:12px">
        <div style="font-weight:700; font-size:12.5px; margin-bottom:4px">🎯 Kết quả kỳ vọng (Expected Result):</div>
        <div style="font-size:12px; line-height:1.5">${Array.isArray(tc.expected) ? tc.expected.map(e => `• ${escapeHtml(e)}`).join('<br/>') : escapeHtml(tc.expected || 'Hệ thống vận hành chính xác theo đặc tả kỹ thuật')}</div>
      </div>

      ${tc.notes ? `
        <div style="font-size:11.5px; color:var(--text-muted); background:var(--bg-body); padding:8px 12px; border-radius:6px; border:1px dashed var(--border)">
          <strong>Ghi chú kỹ thuật:</strong> ${escapeHtml(tc.notes)}
        </div>
      ` : ''}
    `;
  }
  openModal('modal-asg-tc-detail');
}
