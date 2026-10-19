/**
 * SMARTVMS QA HUB - EXECUTION MODULE (JS) - STUDIO DUAL-PANE EDITION
 * Standard Compliance: ISO 9001:2015 Clause 7.5 & 8.5.2 | ISO/IEC/IEEE 29119-3:2021 | ISO/IEC 25010:2023
 * Interactive Dual-Column Studio, Quick Pass-All, 1-Click Copy, Keyboard-Driven Workstation, Clipboard Paste (Ctrl+V)
 */

let currentSelectedTcId = null;
let currentExecSubtab = 'steps';
let execDraftStatus = null;
let currentFilteredTcList = [];
let clipboardListenerRegistered = false;
let keydownListenerRegistered = false;

function initExecutionModule() {
  initCoreState();
  const p = getActiveProject();
  if (!p) return;

  // Populate module filter
  // Populate module filter (Scoped to Tester's assigned modules)
  const modFilter = document.getElementById('exec-filter-module');
  if (modFilter) {
    const user = getCurrentUser();
    const mods = getAccessibleModulesForUser(user, state.activeProjectId);
    modFilter.innerHTML = `<option value="">Tất cả phân hệ (${mods.length} Phân hệ được giao)</option>` +
      mods.map(m => `<option value="${m.id}">[${m.id}] ${m.name}</option>`).join('');
  }

  // Populate cycle selector & breadcrumb
  populateExecCycleSelect();
  renderExecHierarchyBreadcrumb(null);

  // Register Global Clipboard Paste Listener (Ctrl + V for Instant Screenshot Upload)
  if (!clipboardListenerRegistered) {
    window.addEventListener('paste', handleGlobalClipboardPaste);
    clipboardListenerRegistered = true;
  }

  // Register Global Keyboard Shortcuts (Ctrl+S, Ctrl+Enter, Alt+P, Alt+N)
  if (!keydownListenerRegistered) {
    window.addEventListener('keydown', handleGlobalKeydown);
    keydownListenerRegistered = true;
  }

  filterExecList();

  // Auto select first TC or check URL param ?tc=TC-AUTH-001
  const params = new URLSearchParams(window.location.search);
  const tcParam = params.get('tc');
  if (tcParam) {
    if (!getAllTcs().some(t => t.id === tcParam)) {
      const found = (state.projects || []).find(p => (p.testCases || []).some(t => t.id === tcParam));
      if (found) {
        state.activeProjectId = found.id;
        saveCoreState();
        filterExecList();
      }
    }
    selectExecTc(tcParam);
  } else if (currentFilteredTcList.length > 0) {
    selectExecTc(currentFilteredTcList[0].id);
  }
}

function populateExecCycleSelect() {
  const sel = document.getElementById('exec-cycle-select');
  if (!sel) return;
  const cycles = getTestCyclesForProject(state.activeProjectId);
  const activeCycle = getActiveCycle(state.activeProjectId);
  sel.innerHTML = cycles.map(c => `
    <option value="${c.id}" ${c.id === activeCycle?.id ? 'selected' : ''}>
      ${c.status === 'ACTIVE' ? '🟢' : c.status === 'CLOSED' ? '🔒' : '⏳'} ${c.name} (${c.version})
    </option>
  `).join('');
}

function switchExecCycle(cycleId) {
  setActiveCycle(cycleId);
  const curTc = getAllTcs().find(t => t.id === currentSelectedTcId);
  renderExecHierarchyBreadcrumb(curTc);
  if (curTc) renderExecDetail(curTc);
  const cycle = getCycleById(cycleId);
  showToast(`🎯 Đã chuyển sang đợt test: ${cycle?.name || cycleId}`, 'info');
}

function renderExecHierarchyBreadcrumb(tc) {
  const el = document.getElementById('exec-hierarchy-breadcrumb');
  if (!el) return;
  const curCycle = getActiveCycle(state.activeProjectId);
  const ctx = getHierarchyContext(state.activeProjectId, curCycle?.id, tc?.id);
  el.innerHTML = ctx.breadcrumbHtml;
}

function filterExecList() {
  const q = (document.getElementById('exec-search')?.value || '').toLowerCase().trim();
  const mod = document.getElementById('exec-filter-module')?.value || '';
  const status = document.getElementById('exec-filter-status')?.value || '';
  const prio = document.getElementById('exec-filter-priority')?.value || '';
  const type = document.getElementById('exec-filter-type')?.value || '';
  const suite = document.getElementById('exec-filter-suite')?.value || '';

  const user = getCurrentUser();
  const baseTcs = getAccessibleTcsForUser(user, state.activeProjectId);
  currentFilteredTcList = baseTcs.filter(tc => {
    if (mod && tc.module !== mod) return false;
    if (prio && tc.priority !== prio) return false;
    const r = state.results[tc.id] || {};
    const tcStatus = r.status || 'Not Run';
    if (status && tcStatus !== status) return false;
    if (type) {
      const tcType = tc.type || 'Chức năng';
      if (!tcType.toLowerCase().includes(type.toLowerCase())) return false;
    }
    if (suite) {
      const tcSuite = tc.suite || 'REGRESSION';
      if (tcSuite !== suite) return false;
    }
    if (q) {
      const matchId = (tc.id || '').toLowerCase().includes(q);
      const matchName = (tc.name || tc.title || '').toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  renderExecTcList(currentFilteredTcList);
}

function statusMiniIcon(status) {
  const s = (status || '').toUpperCase();
  if (s === 'PASS' || s === 'PASSED') return '✅';
  if (s === 'FAIL' || s === 'FAILED') return '❌';
  if (s === 'BLOCKED') return '⛔';
  if (s === 'SKIP') return '⏭';
  if (s === 'WIP' || s === 'IN PROGRESS') return '⏳';
  return '⚪';
}

function renderExecTcList(tcs) {
  const listEl = document.getElementById('exec-tc-list');
  if (!listEl) return;

  if (tcs.length === 0) {
    listEl.innerHTML = `
      <div style="padding:28px 16px; text-align:center; color:var(--text-muted); font-size:12px">
        <div style="font-size:26px; margin-bottom:8px">🔒</div>
        <div style="font-weight:700; color:var(--text-primary); font-size:13px">Không có kịch bản được phân công</div>
        <div style="font-size:11px; margin-top:4px; line-height:1.4">Chỉ hiển thị các kịch bản được Lead giao cho tài khoản <strong>${escapeHtml(getCurrentUser().name)}</strong>.</div>
      </div>`;
    return;
  }

  listEl.innerHTML = tcs.map(tc => {
    const isSelected = tc.id === currentSelectedTcId;
    const r = state.results[tc.id] || {};
    const s = r.status || 'Not Run';
    const prio = tc.priority || 'P2';

    return `
      <div class="exec-tc-item ${isSelected ? 'selected' : ''}" onclick="selectExecTc('${tc.id}')" title="${escapeHtml(tc.name || tc.title)}">
        <div class="exec-tc-item-top">
          <span class="exec-tc-item-code">${tc.id}</span>
          <span class="exec-tc-prio-mini prio-${prio.toLowerCase()}">${prio}</span>
          <span class="exec-tc-status-mini status-${s.toLowerCase().replace(/\s+/g, '-')}">${statusMiniIcon(s)} ${s}</span>
        </div>
        <div class="exec-tc-item-name">${escapeHtml(tc.name || tc.title)}</div>
        <div style="margin-top:4px; display:flex; align-items:center; gap:4px; flex-wrap:wrap">
          ${getTestTypeBadge(tc.type)}
        </div>
      </div>
    `;
  }).join('');
}

function selectExecTc(tcId) {
  currentSelectedTcId = tcId;
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;

  // Update selection style in left list
  document.querySelectorAll('.exec-tc-item').forEach(el => el.classList.remove('selected'));
  const allItems = document.querySelectorAll('.exec-tc-item');
  allItems.forEach(el => {
    if (el.querySelector('.exec-tc-item-code')?.textContent.trim() === tcId) {
      el.classList.add('selected');
    }
  });

  renderExecDetail(tc);
}

function renderExecDetail(tc) {
  const container = document.getElementById('exec-detail-card');
  if (!container) return;

  renderExecHierarchyBreadcrumb(tc);

  const curCycle = getActiveCycle(state.activeProjectId);
  // Ưu tiên đọc kết quả của đợt test hiện tại nếu có
  const cycleRes = (state.cycleResults && curCycle && state.cycleResults[curCycle.id]) ? state.cycleResults[curCycle.id][tc.id] : null;
  const r = cycleRes || state.results[tc.id] || {};
  execDraftStatus = r.status || 'Pass';
  const comments = state.comments[tc.id] || [];
  const evidences = state.evidences[tc.id] || [];

  const modName = getModuleName(tc.module);
  const stepsArray = (tc.steps && Array.isArray(tc.steps)) ? tc.steps : (tc.steps ? [tc.steps] : []);
  const expectedArray = (tc.expected && Array.isArray(tc.expected)) ? tc.expected : (tc.expected ? [tc.expected] : []);

  container.innerHTML = `
    <!-- Top Fixed Info Bar (Compact 2-Row Design) -->
    <div class="exec-card-header">
      <!-- Row 1: ID, Badges, Quick Nav & Primary Save Actions -->
      <div class="exec-header-row1">
        <div class="exec-header-tags">
          <span class="exec-header-code-pill">[${tc.id}]</span>
          ${priorityBadge(tc.priority)}
          <span class="badge badge-nr" style="font-size:11px">${modName}</span>
          ${getTestTypeBadge(tc.type)}
          <span class="badge" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-size:11px">🎯 ${getTestSuiteLabel(tc.suite)}</span>
          ${tc.platform ? `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:11px">💻 ${tc.platform}</span>` : ''}
          ${tc.reqId ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-size:11px">📌 SRS: ${tc.reqId}</span>` : ''}
        </div>
        <div class="exec-header-actions">
          <div style="display:inline-flex; gap:4px">
            <button type="button" class="btn btn-outline btn-xs" onclick="navigateExecTc(-1)" title="Bài trước (Alt + P)">← Trước</button>
            <button type="button" class="btn btn-outline btn-xs" onclick="navigateExecTc(1)" title="Bài tiếp (Alt + N)">Sau →</button>
          </div>
          <button type="button" class="btn btn-primary btn-xs" onclick="saveExecResult('${tc.id}', false)" title="Lưu kết quả (Ctrl + S)" style="font-weight:700">💾 Lưu kết quả</button>
          <button type="button" class="btn btn-outline btn-xs" onclick="saveExecResult('${tc.id}', true)" title="Lưu & qua bài kế (Ctrl + Enter)">Lưu & Tiếp →</button>
          <button type="button" class="btn btn-outline btn-xs btn-adhoc-trigger" onclick="openAdhocDefectModal('${tc.module}')" title="Phát hiện lỗi không có trong kịch bản này" style="padding:4px 10px">🐞 Báo Lỗi Ngoài Kịch Bản</button>
        </div>
      </div>

      <!-- Row 2: Title & Segmented Outcome Control -->
      <div class="exec-header-row2">
        <h2 class="exec-header-title" title="${escapeHtml(tc.name || tc.title)}">${escapeHtml(tc.name || tc.title)}</h2>
        
        <!-- Segmented Outcome Selector (Pass, Fail, Blocked, Skip, In Progress) -->
        <div class="segmented-outcome-bar">
          <button type="button" class="btn-outcome outcome-pass ${execDraftStatus === 'Pass' ? 'active' : ''}" onclick="setExecDraftStatus('${tc.id}', 'Pass')">✅ Pass</button>
          <button type="button" class="btn-outcome outcome-fail ${execDraftStatus === 'Fail' ? 'active' : ''}" onclick="setExecDraftStatus('${tc.id}', 'Fail')">❌ Fail</button>
          <button type="button" class="btn-outcome outcome-blocked ${execDraftStatus === 'Blocked' ? 'active' : ''}" onclick="setExecDraftStatus('${tc.id}', 'Blocked')">⛔ Bị chặn</button>
          <button type="button" class="btn-outcome outcome-skip ${execDraftStatus === 'Skip' ? 'active' : ''}" onclick="setExecDraftStatus('${tc.id}', 'Skip')">⏭ Bỏ qua</button>
          <button type="button" class="btn-outcome outcome-inprog ${execDraftStatus === 'In Progress' ? 'active' : ''}" onclick="setExecDraftStatus('${tc.id}', 'In Progress')">⏳ Đang test</button>
        </div>
      </div>

      <!-- Integrated Subtabs -->
      <div class="exec-header-tabs-row">
        <button type="button" class="exec-tab-pill ${currentExecSubtab === 'steps' ? 'active' : ''}" data-subtab="steps" onclick="switchExecTab('steps')">
          📋 1. Studio Tác Nghiệp (${stepsArray.length} bước)
        </button>
        <button type="button" class="exec-tab-pill ${currentExecSubtab === 'defect' ? 'active' : ''}" data-subtab="defect" onclick="switchExecTab('defect')">
          🎯 2. Đánh Giá & Báo Cáo Lỗi ISO 29119-3
        </button>
        <button type="button" class="exec-tab-pill ${currentExecSubtab === 'evidence' ? 'active' : ''}" data-subtab="evidence" onclick="switchExecTab('evidence')">
          📸 3. Bằng Chứng Ảnh (${evidences.length})
        </button>
        <button type="button" class="exec-tab-pill ${currentExecSubtab === 'discuss' ? 'active' : ''}" data-subtab="discuss" onclick="switchExecTab('discuss')">
          💬 4. Trao Đổi QA & Dev (${comments.length})
        </button>
      </div>
    </div>

    <!-- Scrollable Subtab Panes -->
    <div class="exec-tab-body">
      <!-- PANE 1: DUAL-PANE STUDIO WORKSPACE -->
      <div class="exec-subtab-pane ${currentExecSubtab === 'steps' ? 'active' : ''}" id="exec-pane-steps">
        <div class="exec-studio-grid">
          <!-- LEFT COLUMN: ĐẶC TẢ & DỮ LIỆU ĐỐI SOÁT (Spec & Data Panel - 42%) -->
          <div class="studio-col-left">
            <!-- Card 1: Tiền điều kiện & Dữ liệu test -->
            <div class="studio-panel-card">
              <div class="studio-panel-header">
                <span>📋 Thông Tin Chuẩn Bị & Dữ Liệu</span>
              </div>
              <div class="studio-panel-body">
                ${tc.precondition ? `
                  <div class="studio-info-group">
                    <label class="studio-label">⚙️ Điều kiện tiên quyết:</label>
                    <div class="studio-precondition-val">${escapeHtml(tc.precondition)}</div>
                  </div>
                ` : ''}

                ${tc.testData ? `
                  <div class="studio-info-group" style="margin-top:8px">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
                      <label class="studio-label">📊 Dữ liệu đầu vào (Inputs - ISO 29119-3):</label>
                      <button type="button" class="btn-copy-chip" onclick="copyTestData('${escapeHtml(tc.testData).replace(/'/g, "\\'")}')" title="Sao chép dữ liệu test vào Clipboard">📋 Copy</button>
                    </div>
                    <div class="studio-testdata-code">${escapeHtml(tc.testData)}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Card 2: Tiêu chí kỳ vọng nghiệm thu (Expected Results) -->
            <div class="studio-panel-card" style="margin-top:12px">
              <div class="studio-panel-header" style="color:#15803d">
                <span>🎯 Kết Quả Kỳ Vọng (Expected Results)</span>
                <span class="badge" style="background:#dcfce7; color:#15803d; font-size:10px">${expectedArray.length} tiêu chí</span>
              </div>
              <div class="studio-panel-body" style="padding:10px 12px">
                ${expectedArray.length > 0 ? expectedArray.map((e, idx) => `
                  <div class="expected-item-card">
                    <div class="expected-badge">✓ ${idx + 1}</div>
                    <div class="expected-item-text">${escapeHtml(e)}</div>
                  </div>
                `).join('') : `
                  <div class="expected-item-card">
                    <div class="expected-badge">✓ 1</div>
                    <div class="expected-item-text">${escapeHtml(tc.expected || 'Thực hiện thành công theo thiết kế.')}</div>
                  </div>
                `}
              </div>
            </div>

            <!-- Card 3: Lịch Sử Đối Soát Qua Các Đợt Kiểm Thử (Multi-Cycle History - ISO 29119-3) -->
            ${(() => {
              const history = getTestCaseCycleHistory(tc.id, state.activeProjectId);
              return `
                <div class="studio-panel-card cycle-history-card" style="margin-top:12px">
                  <div class="studio-panel-header" style="color:#0284c7">
                    <div style="display:flex; align-items:center; gap:6px">
                      <span>🔄 Lịch Sử Đối Soát Qua Các Đợt Test</span>
                      <span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:10px">${history.length} Đợt kiểm thử</span>
                    </div>
                  </div>
                  <div class="studio-panel-body" style="padding:10px 12px">
                    <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px">
                      Theo dõi kết quả thực thi và lịch sử sửa lỗi qua các đợt kiểm thử:
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px">
                      ${history.map(h => {
                        const isCur = curCycle && curCycle.id === h.cycleId;
                        const itemRes = h.result;
                        const s = itemRes?.status || 'Not Run';
                        return `
                          <div class="cycle-timeline-row ${isCur ? 'active-cycle' : ''}">
                            <div style="display:flex; justify-content:space-between; align-items:center">
                              <div style="display:flex; align-items:center; gap:6px">
                                <span style="font-weight:700; font-size:11.5px; color:${isCur ? 'var(--primary)' : 'var(--text-primary)'}">${escapeHtml(h.cycleName)}</span>
                                <span class="badge" style="font-size:9.5px; background:#f1f5f9; color:#475569">${h.version}</span>
                                ${isCur ? '<span class="badge badge-pass" style="font-size:9px">🎯 Đợt đang test</span>' : getTestCycleStatusBadge(h.cycleStatus)}
                              </div>
                              <div>
                                ${statusBadge(s)}
                              </div>
                            </div>
                            ${itemRes ? `
                              <div style="margin-top:4px; font-size:11px; color:var(--text-secondary); border-top:1px dashed #e2e8f0; padding-top:4px">
                                <div style="display:flex; justify-content:space-between">
                                  <span>👤 Tester: <strong>${escapeHtml(itemRes.tester || 'N/A')}</strong></span>
                                  <span style="color:var(--text-muted)">🕒 ${new Date(itemRes.runAt).toLocaleString('vi-VN')}</span>
                                </div>
                                ${itemRes.failReason ? `<div style="color:#dc2626; margin-top:2px; font-weight:600">❌ Lỗi: ${escapeHtml(itemRes.failReason)}</div>` : ''}
                                ${itemRes.actualResult ? `<div style="color:var(--text-muted); margin-top:2px">👁️ Thực tế: ${escapeHtml(itemRes.actualResult)}</div>` : ''}
                              </div>
                            ` : `
                              <div style="margin-top:3px; font-size:10.5px; color:var(--text-muted); font-style:italic">
                                ⚪ Chưa có kết quả thực thi trong đợt này.
                              </div>
                            `}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>
              `;
            })()}
          </div>

          <!-- RIGHT COLUMN: TÁC NGHIỆP THỰC THI & GHI NHẬN KẾT QUẢ (Execution & Outcome Panel - 58%) -->
          <div class="studio-col-right">
            <!-- Card 1: Checklist từng bước thực hiện -->
            <div class="studio-panel-card">
              <div class="studio-panel-header">
                <div style="display:flex; align-items:center; gap:8px">
                  <span>📝 Checklist Từng Bước (${stepsArray.length})</span>
                  <span style="font-size:10px; color:var(--text-muted); font-weight:normal">Đánh dấu theo ISO 29119</span>
                </div>
                <button type="button" class="btn-pass-all" onclick="passAllSteps(${stepsArray.length})" title="Đánh dấu đạt tất cả các bước">⚡ Đạt tất cả bước</button>
              </div>
              <div class="studio-panel-body">
                ${stepsArray.length > 0 ? stepsArray.map((s, idx) => `
                  <div class="step-interactive-row" onclick="toggleStepChk(${idx})">
                    <input type="checkbox" id="step-chk-${idx}" class="step-chk" onclick="event.stopPropagation(); checkAllStepsStatus(${stepsArray.length})" />
                    <div class="step-circle-num">${idx + 1}</div>
                    <div class="step-interactive-desc">${escapeHtml(s.replace(/^[0-9]+\.\s*/, ''))}</div>
                  </div>
                `).join('') : `
                  <div class="step-interactive-row">
                    <div class="step-circle-num">1</div>
                    <div class="step-interactive-desc">${escapeHtml(tc.description || tc.name)}</div>
                  </div>
                `}
              </div>
            </div>

            <!-- Card 2: Ghi nhận thực tế quan sát được (Actual Result) -->
            <div class="studio-panel-card" style="margin-top:12px">
              <div class="studio-panel-header">
                <span>👁️ Kết Quả Thực Tế & Ghi Nhận Lỗi</span>
              </div>
              <div class="studio-panel-body">
                <textarea id="exec-actual-result-main" rows="2" class="studio-actual-textarea" placeholder="Nhập kết quả thực tế quan sát được (VD: Xác thực thành công, token lưu trong sessionStorage)..." oninput="syncActualResult(this.value)">${escapeHtml(r.actualResult || '')}</textarea>
                
                <!-- Quick Defect Inline Panel: Tự động mở rộng khi chọn Fail hoặc Blocked -->
                <div id="exec-quick-defect-box" class="quick-defect-box ${execDraftStatus === 'Fail' || execDraftStatus === 'Blocked' ? 'show' : ''}">
                  <div class="quick-defect-title">
                    <span>🐞 Báo Cáo Lỗi Cho Developer (ISO 29119-3 Defect)</span>
                    <span class="badge badge-fail" style="font-size:10px">${r.severity || 'Critical'}</span>
                  </div>
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px">
                    <div>
                      <label style="font-size:10.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:2px">Phân loại lỗi</label>
                      <select id="quick-defect-category" class="form-select-sm" onchange="syncDefectFields()">
                        <option value="Thiếu chức năng / Chưa làm" ${r.defectCategory === 'Thiếu chức năng / Chưa làm' ? 'selected' : ''}>⚠️ Thiếu chức năng / Chưa làm (Missing Feature)</option>
                        <option value="Sai lệch đặc tả SRS" ${r.defectCategory === 'Sai lệch đặc tả SRS' ? 'selected' : ''}>📄 Sai lệch đặc tả / Ngoài phạm vi (SRS Deviation)</option>
                        <option value="Logic nghiệp vụ" ${r.defectCategory === 'Logic nghiệp vụ' || !r.defectCategory ? 'selected' : ''}>Nghiệp vụ / Sai quy trình</option>
                        <option value="Giao diện UI" ${r.defectCategory === 'Giao diện UI' ? 'selected' : ''}>Giao diện UI / Hiển thị</option>
                        <option value="Thiết bị ngoại vi" ${r.defectCategory === 'Thiết bị ngoại vi' ? 'selected' : ''}>Thiết bị Barie / Camera / Đầu đọc</option>
                        <option value="Backend 500 / Crash" ${r.defectCategory === 'Backend 500 / Crash' ? 'selected' : ''}>Backend 500 / Exception / Crash</option>
                        <option value="Hiệu năng / Timeout" ${r.defectCategory === 'Hiệu năng / Timeout' ? 'selected' : ''}>Hiệu năng / Quá tải / Timeout</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size:10.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:2px">Mức độ nghiêm trọng</label>
                      <select id="quick-defect-severity" class="form-select-sm" onchange="syncDefectFields()">
                        <option value="Critical" ${r.severity === 'Critical' ? 'selected' : ''}>🔴 Critical (Nghiêm trọng)</option>
                        <option value="Blocker" ${r.severity === 'Blocker' ? 'selected' : ''}>⛔ Blocker (Chặn đứng)</option>
                        <option value="Major" ${r.severity === 'Major' ? 'selected' : ''}>🟠 Major (Lớn)</option>
                        <option value="Minor" ${r.severity === 'Minor' ? 'selected' : ''}>🟢 Minor (Nhỏ / UI)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style="font-size:10.5px; font-weight:700; color:#dc2626; display:block; margin-bottom:2px">Lý do thất bại / Mô tả lỗi phát hiện (Bắt buộc nếu Fail) *</label>
                    <input type="text" id="quick-fail-reason" class="form-input-sm" placeholder="VD: Hệ thống chưa có nút 'Quét Barcode' theo đặc tả SRS-AUTH-001..." value="${escapeHtml(r.failReason || '')}" oninput="syncDefectFields()" />
                  </div>
                </div>

                <!-- Quick Skip Inline Panel: Tự động mở rộng khi chọn Skip -->
                <div id="exec-quick-skip-box" class="quick-skip-box ${execDraftStatus === 'Skip' ? 'show' : ''}">
                  <div class="quick-skip-title">
                    <span>⏭️ Lý Do Bỏ Qua / Chưa Kiểm Thử (Skip / Out of Scope)</span>
                    <span class="badge badge-skip" style="font-size:10px">ISO 29119-3</span>
                  </div>
                  <div>
                    <input type="text" id="quick-skip-reason" class="form-input-sm" placeholder="VD: Tính năng nằm ngoài phạm vi v2.0 hoặc kịch bản không còn áp dụng..." value="${escapeHtml(r.skipReason || (r.status === 'Skip' ? r.actualResult || '' : ''))}" oninput="syncSkipReason(this.value)" />
                    <div style="margin-top:5px; font-size:10.5px; color:var(--text-muted)">
                      <span>💡 Gợi ý nhanh:</span>
                      <span class="skip-suggestion-chip" onclick="applyQuickSkipReason('Tính năng chưa phát triển trong v2.0 (Nằm ngoài phạm vi / Out of Scope)')">📌 Ngoài phạm vi (Out of Scope)</span>
                      <span class="skip-suggestion-chip" onclick="applyQuickSkipReason('Kịch bản lỗi thời / Tính năng đã bị hủy bỏ theo yêu cầu mới')">⚠️ Kịch bản lỗi thời</span>
                      <span class="skip-suggestion-chip" onclick="applyQuickSkipReason('Môi trường kiểm thử hiện tại chưa lắp đặt thiết bị phần cứng')">🔌 Thiếu thiết bị test</span>
                    </div>
                  </div>
                </div>

                <!-- Quick Evidence Dropzone / Paste Area -->
                <div class="quick-evidence-dropzone" onclick="document.getElementById('quick-evidence-file-input').click()">
                  <input type="file" id="quick-evidence-file-input" accept="image/*" style="display:none" onchange="handleQuickEvidenceUpload(event, '${tc.id}')" />
                  <div style="font-size:11.5px; color:var(--primary); font-weight:700">📸 Dán ảnh chụp màn hình bằng chứng (Ctrl + V) hoặc click tải ảnh</div>
                  <div style="font-size:10px; color:var(--text-muted); margin-top:2px">Hỗ trợ dán ảnh nhanh từ Snipping Tool / Clipboard</div>
                </div>
                <div id="quick-evidence-preview" class="quick-evidence-preview-row">
                  ${evidences.map(ev => `
                    <img src="${ev.url}" class="quick-thumb-item" title="${escapeHtml(ev.caption)}" onclick="openLightbox('${ev.url}', 'Bằng chứng [${tc.id}] - ${escapeHtml(ev.caption)}')" />
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PANE 2: ĐÁNH GIÁ & BÁO CÁO LỖI CHI TIẾT (ISO 29119-3 DEFECT REPORT) -->
      <div class="exec-subtab-pane ${currentExecSubtab === 'defect' ? 'active' : ''}" id="exec-pane-defect">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px">
          <div class="form-group">
            <label>Người thực thi kiểm thử (Tester)</label>
            <input type="text" value="${r.tester || getCurrentUser().name}" readonly style="background:var(--bg-surface); color:var(--text-muted)" />
          </div>
          <div class="form-group">
            <label>Phân loại lỗi kỹ thuật (Defect Category)</label>
            <select id="exec-defect-category" onchange="syncDefectFields()">
              <option value="Thiếu chức năng / Chưa làm" ${r.defectCategory === 'Thiếu chức năng / Chưa làm' ? 'selected' : ''}>⚠️ Thiếu chức năng / Chưa làm (Missing Feature)</option>
              <option value="Sai lệch đặc tả SRS" ${r.defectCategory === 'Sai lệch đặc tả SRS' ? 'selected' : ''}>📄 Sai lệch đặc tả / Ngoài phạm vi (SRS Deviation)</option>
              <option value="Logic nghiệp vụ" ${r.defectCategory === 'Logic nghiệp vụ' || !r.defectCategory ? 'selected' : ''}>Nghiệp vụ / Sai quy trình</option>
              <option value="Giao diện UI" ${r.defectCategory === 'Giao diện UI' ? 'selected' : ''}>Giao diện UI / Hiển thị</option>
              <option value="Thiết bị ngoại vi" ${r.defectCategory === 'Thiết bị ngoại vi' ? 'selected' : ''}>Thiết bị Barie / Camera / Đầu đọc</option>
              <option value="Backend 500 / Crash" ${r.defectCategory === 'Backend 500 / Crash' ? 'selected' : ''}>Backend 500 / Exception / Crash</option>
              <option value="Hiệu năng / Timeout" ${r.defectCategory === 'Hiệu năng / Timeout' ? 'selected' : ''}>Hiệu năng / Quá tải / Timeout</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:12px">
          <label style="color:var(--primary); font-weight:700">Kết quả thực tế quan sát được (Actual Result - ISO 29119-3) *</label>
          <textarea id="exec-actual-result" rows="2" placeholder="Ghi nhận hành vi thực tế quan sát được khi kiểm thử..." oninput="syncActualResult(this.value)">${escapeHtml(r.actualResult || '')}</textarea>
        </div>

        <div class="form-group" style="margin-bottom:12px">
          <label style="color:#dc2626; font-weight:700">Lý do thất bại / Mô tả lỗi phát hiện (Bắt buộc nếu Fail) *</label>
          <input type="text" id="exec-fail-reason" placeholder="VD: Hệ thống phản hồi 500 khi quét CCCD gắn chip..." value="${escapeHtml(r.failReason || '')}" oninput="syncDefectFields()" />
        </div>

        <!-- Defect Lifecycle & Root Cause Box -->
        <div class="defect-box" style="border:1.5px solid #cbd5e1; border-radius:8px; padding:14px; background:var(--bg-card); margin-bottom:14px">
          <div class="defect-box-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
            <span style="font-weight:800; font-size:13px">🐞 Vòng Đời Lỗi (Defect Lifecycle - ISO 29119-3)</span>
            <span class="badge ${r.status === 'Fail' ? 'badge-fail' : (r.status === 'Blocked' ? 'badge-fail' : 'badge-nr')}">${r.defectStatus || (r.status === 'Fail' ? 'New' : 'None')}</span>
          </div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:10px">
            <div class="form-group">
              <label>Mức độ nghiêm trọng (Severity)</label>
              <select id="exec-severity" onchange="syncDefectFields()">
                <option value="Blocker" ${r.severity === 'Blocker' ? 'selected' : ''}>⛔ Blocker (Chặn đứng)</option>
                <option value="Critical" ${r.severity === 'Critical' ? 'selected' : ''}>🔴 Critical (Nghiêm trọng)</option>
                <option value="Major" ${r.severity === 'Major' ? 'selected' : ''}>🟠 Major (Lớn)</option>
                <option value="Minor" ${r.severity === 'Minor' ? 'selected' : ''}>🟢 Minor (Nhỏ / UI)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Lập trình viên phụ trách (Assigned Dev)</label>
              <input type="text" id="exec-assigned-dev" value="${r.assignedDev || 'Trần Quốc Tuấn (Dev)'}" />
            </div>
            <div class="form-group">
              <label>Bản vá dự kiến (Fix Version)</label>
              <input type="text" id="exec-fix-version" placeholder="VD: v2.0.1" value="${r.fixVersion || 'v2.0.1'}" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom:10px">
            <label>Phân tích nguyên nhân gốc rễ (Root Cause Analysis - RCA)</label>
            <input type="text" id="exec-rca" placeholder="Nguyên nhân sơ bộ: Lỗi parsing chuỗi CCCD / Ngắt kết nối socket barie..." value="${r.rca || ''}" />
          </div>

          <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-top:8px">Chuyển trạng thái vòng đời lỗi:</div>
          <div class="defect-actions-bar" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px">
            <button type="button" class="btn-defect" onclick="updateDefectLifecycle('${tc.id}', 'In Progress')">👨‍💻 Dev: Đang sửa</button>
            <button type="button" class="btn-defect" onclick="updateDefectLifecycle('${tc.id}', 'Resolved')">🔧 Dev: Đã sửa</button>
            <button type="button" class="btn-defect" onclick="updateDefectLifecycle('${tc.id}', 'Retest Passed')">✅ Tester: Retest Đạt</button>
            <button type="button" class="btn-defect" onclick="updateDefectLifecycle('${tc.id}', 'Reopened')">🔄 Tester: Mở lại</button>
            <button type="button" class="btn-defect" onclick="updateDefectLifecycle('${tc.id}', 'Closed')">🏁 Đóng Bug</button>
          </div>
        </div>

        <div class="form-group">
          <label>Ghi chú thực thi bổ sung (Môi trường, payload, cổng kết nối)</label>
          <textarea id="exec-notes" rows="2" placeholder="Ghi chú thêm về trường hợp kiểm thử...">${r.note || ''}</textarea>
        </div>
      </div>

      <!-- PANE 3: BẰNG CHỨNG ẢNH & CLIPBOARD PASTE -->
      <div class="exec-subtab-pane ${currentExecSubtab === 'evidence' ? 'active' : ''}" id="exec-pane-evidence">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px">
          <div>
            <h4 style="margin:0; font-size:14px; font-weight:700">Ảnh chụp màn hình & Bằng chứng kiểm thử (Evidence)</h4>
            <span style="font-size:11.5px; color:var(--text-muted)">💡 <strong>Mẹo chuyên nghiệp:</strong> Bạn có thể nhấn <strong>Ctrl + V</strong> ở bất kỳ đâu trên màn hình để dán ảnh trực tiếp từ Clipboard!</span>
          </div>
          <label class="btn btn-primary btn-sm" style="cursor:pointer; margin:0">
            📷 Tải ảnh từ máy
            <input type="file" accept="image/*" style="display:none" onchange="handleEvidenceUpload('${tc.id}', this)" />
          </label>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:12px">
          ${evidences.length > 0 ? evidences.map((ev, i) => `
            <div style="border:1px solid var(--border); border-radius:8px; overflow:hidden; background:var(--bg-card); box-shadow:var(--shadow-sm)">
              <img src="${ev.url}" alt="Evidence ${i+1}" style="width:100%; height:140px; object-fit:cover; cursor:pointer" onclick="openLightbox('${ev.url}', 'Bằng chứng [${tc.id}] - ${ev.caption}')" />
              <div style="padding:8px 10px; font-size:11px; display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface)">
                <span style="font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${ev.caption}">${ev.caption || 'Ảnh ' + (i+1)}</span>
                <button type="button" style="color:#ef4444; border:none; background:none; cursor:pointer; font-weight:800; font-size:14px" onclick="deleteEvidence('${tc.id}', ${i})" title="Xóa ảnh">✕</button>
              </div>
            </div>
          `).join('') : `
            <div style="grid-column: 1/-1; padding:36px 20px; text-align:center; color:var(--text-muted); font-size:12.5px; background:var(--bg-surface); border:2px dashed var(--border); border-radius:8px">
              <div style="font-size:28px; margin-bottom:8px">📸</div>
              <div>Chưa có ảnh chụp bằng chứng nào.</div>
              <div style="font-size:11.5px; color:var(--primary); margin-top:4px">Chụp ảnh màn hình rồi bấm <strong>Ctrl + V</strong> hoặc bấm nút "Tải ảnh từ máy".</div>
            </div>
          `}
        </div>
      </div>

      <!-- PANE 4: TRAO ĐỔI QA & DEV -->
      <div class="exec-subtab-pane ${currentExecSubtab === 'discuss' ? 'active' : ''}" id="exec-pane-discuss">
        <div style="margin-bottom:16px; max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:10px">
          ${comments.length > 0 ? comments.map(c => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:8px; padding:10px 14px">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
                <strong style="color:var(--primary); font-size:12px">👤 ${c.author} <span style="font-size:10.5px; color:var(--text-muted)">(${c.role})</span></strong>
                <span style="font-size:10.5px; color:var(--text-muted)">${new Date(c.time).toLocaleString('vi-VN')}</span>
              </div>
              <div style="font-size:12.5px; color:var(--text-primary); line-height:1.5">${c.text}</div>
            </div>
          `).join('') : `
            <div style="padding:28px; text-align:center; color:var(--text-muted); font-size:12px; background:var(--bg-surface); border-radius:8px">
              💬 Chưa có phản hồi kỹ thuật nào về kịch bản này. Nhập trao đổi bên dưới để gửi cho Dev hoặc QA Lead.
            </div>
          `}
        </div>

        <div style="display:flex; gap:8px">
          <input type="text" id="exec-discuss-input" placeholder="Nhập trao đổi kỹ thuật, commit hash hoặc kết quả phản hồi..." style="flex:1" onkeydown="if(event.key==='Enter') sendExecComment('${tc.id}')" />
          <button type="button" class="btn btn-primary" onclick="sendExecComment('${tc.id}')">Gửi</button>
        </div>
      </div>
    </div>
  `;
}

function setExecDraftStatus(tcId, status) {
  execDraftStatus = status;
  const container = document.getElementById('exec-detail-card');
  if (container) {
    container.querySelectorAll('.btn-outcome').forEach(b => b.classList.remove('active'));
    const btn = container.querySelector(`.btn-outcome.outcome-${status.toLowerCase().replace(/\s+/g, '')}`);
    if (btn) btn.classList.add('active');

    // Toggle quick defect panel
    const defectBox = document.getElementById('exec-quick-defect-box');
    if (defectBox) {
      defectBox.classList.toggle('show', status === 'Fail' || status === 'Blocked');
    }
    // Toggle quick skip panel
    const skipBox = document.getElementById('exec-quick-skip-box');
    if (skipBox) {
      skipBox.classList.toggle('show', status === 'Skip');
    }
  }
}

function syncSkipReason(val) {
  const actualMain = document.getElementById('exec-actual-result-main');
  const actualSec = document.getElementById('exec-actual-result');
  if (execDraftStatus === 'Skip') {
    if (actualMain && !actualMain.value.trim()) actualMain.value = val;
    if (actualSec && !actualSec.value.trim()) actualSec.value = val;
  }
}

function applyQuickSkipReason(val) {
  const inp = document.getElementById('quick-skip-reason');
  if (inp) {
    inp.value = val;
    const actualMain = document.getElementById('exec-actual-result-main');
    const actualSec = document.getElementById('exec-actual-result');
    if (actualMain) actualMain.value = val;
    if (actualSec) actualSec.value = val;
    showToast(`⏭️ Đã chọn lý do: ${val}`, 'info');
  }
}

function switchExecTab(subtab) {
  currentExecSubtab = subtab;
  document.querySelectorAll('.exec-tab-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
  });
  document.querySelectorAll('.exec-subtab-pane').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`exec-pane-${subtab}`);
  if (target) target.classList.add('active');
}

// 1-Click Copy Test Data
function copyTestData(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Đã sao chép dữ liệu test vào Clipboard!', 'info');
  }).catch(() => {
    showToast('⚠️ Không thể sao chép tự động!', 'error');
  });
}

// Pass All Steps 1-Click Action
function passAllSteps(count) {
  for (let i = 0; i < count; i++) {
    const chk = document.getElementById(`step-chk-${i}`);
    if (chk) {
      chk.checked = true;
      const row = chk.closest('.step-interactive-row');
      if (row) row.classList.add('completed');
    }
  }
  setExecDraftStatus(currentSelectedTcId, 'Pass');
  showToast('⚡ Đã tích Đạt toàn bộ các bước kiểm thử!', 'success');
}

// Toggle Step Checkbox when clicking row
function toggleStepChk(idx) {
  const chk = document.getElementById(`step-chk-${idx}`);
  if (!chk) return;
  chk.checked = !chk.checked;
  const row = chk.closest('.step-interactive-row');
  if (row) row.classList.toggle('completed', chk.checked);
}

function checkAllStepsStatus(count) {
  for (let i = 0; i < count; i++) {
    const chk = document.getElementById(`step-chk-${i}`);
    if (chk) {
      const row = chk.closest('.step-interactive-row');
      if (row) row.classList.toggle('completed', chk.checked);
    }
  }
}

function syncActualResult(val) {
  const other = document.getElementById('exec-actual-result');
  if (other && other !== document.activeElement) other.value = val;
}

function syncDefectFields() {
  const qCat = document.getElementById('quick-defect-category');
  const dCat = document.getElementById('exec-defect-category');
  if (qCat && dCat) {
    if (document.activeElement === qCat) dCat.value = qCat.value;
    else if (document.activeElement === dCat) qCat.value = dCat.value;
  }

  const qSev = document.getElementById('quick-defect-severity');
  const dSev = document.getElementById('exec-severity');
  if (qSev && dSev) {
    if (document.activeElement === qSev) dSev.value = qSev.value;
    else if (document.activeElement === dSev) qSev.value = qSev.value;
  }

  const qReason = document.getElementById('quick-fail-reason');
  const dReason = document.getElementById('exec-fail-reason');
  if (qReason && dReason) {
    if (document.activeElement === qReason) dReason.value = qReason.value;
    else if (document.activeElement === dReason) qReason.value = dReason.value;
  }
}

function saveExecResult(tcId, andNext = false) {
  const actualResult = (document.getElementById('exec-actual-result-main')?.value || document.getElementById('exec-actual-result')?.value || '').trim();
  const failReason = (document.getElementById('quick-fail-reason')?.value || document.getElementById('exec-fail-reason')?.value || '').trim();
  const defectCategory = document.getElementById('quick-defect-category')?.value || document.getElementById('exec-defect-category')?.value || 'Logic nghiệp vụ';
  const rca = document.getElementById('exec-rca')?.value.trim() || '';
  const fixVersion = document.getElementById('exec-fix-version')?.value.trim() || 'v2.0.1';
  const note = document.getElementById('exec-notes')?.value.trim() || '';
  const severity = document.getElementById('quick-defect-severity')?.value || document.getElementById('exec-severity')?.value || 'Critical';
  const assignedDev = document.getElementById('exec-assigned-dev')?.value || 'Trần Quốc Tuấn (Dev)';

  if ((execDraftStatus === 'Fail') && !failReason) {
    showToast('⚠️ Vui lòng nhập Lý do thất bại / Lỗi phát hiện khi chọn trạng thái Fail!', 'error');
    const targetInput = document.getElementById('quick-fail-reason') || document.getElementById('exec-fail-reason');
    targetInput?.focus();
    return;
  }

  const user = getCurrentUser();

  const prevResult = (typeof getResultForTc === 'function') 
    ? getResultForTc(tcId, state.activeProjectId) 
    : (state.results ? state.results[tcId] : null);
  const prevDefectStatus = prevResult?.defectStatus || 'None';

  let finalDefectStatus = 'None';
  let defectToastMsg = '';

  if (execDraftStatus === 'Fail') {
    if (prevDefectStatus === 'Fixed' || prevDefectStatus === 'Resolved') {
      finalDefectStatus = 'Reopened';
      defectToastMsg = `⚠️ Re-test Thất bại! Lỗi [${tcId}] chưa được khắc phục triệt để và đã tự động mở lại [Reopened]`;
    } else {
      finalDefectStatus = (prevDefectStatus && prevDefectStatus !== 'None') ? prevDefectStatus : 'New';
    }
  } else if (execDraftStatus === 'Blocked') {
    finalDefectStatus = 'Blocked';
  } else if (execDraftStatus === 'Pass') {
    if (['Fixed', 'Resolved', 'Reopened', 'Open', 'New', 'In Progress'].includes(prevDefectStatus)) {
      finalDefectStatus = 'Closed';
      defectToastMsg = `🎉 Re-test Thành công! Lỗi [${tcId}] đã được nghiệm thu và chính thức chuyển sang [Closed]`;
    } else {
      finalDefectStatus = 'None';
    }
  }

  const skipReason = (document.getElementById('quick-skip-reason')?.value || '').trim();

  const curCycle = getActiveCycle(state.activeProjectId);

  const resultRecord = {
    status: execDraftStatus || 'Pass',
    tester: user.name,
    runAt: new Date().toISOString(),
    actualResult: (execDraftStatus === 'Skip' && !actualResult && skipReason) ? skipReason : actualResult,
    failReason: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? failReason : '',
    skipReason: (execDraftStatus === 'Skip') ? (skipReason || actualResult) : '',
    defectCategory,
    rca,
    fixVersion,
    note,
    severity: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? severity : '',
    assignedDev: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? assignedDev : '',
    defectStatus: finalDefectStatus,
    cycleId: curCycle ? curCycle.id : 'CYC-GENERIC',
    cycleName: curCycle ? curCycle.name : 'Đợt kiểm thử tổng thể',
    projectId: state.activeProjectId || ''
  };

  if (typeof setResultForTc === 'function') {
    setResultForTc(tcId, resultRecord, state.activeProjectId);
  } else {
    state.results[tcId] = resultRecord;
  }

  // Lưu riêng biệt theo Đợt kiểm thử (ISO 29119-3 Multi-Cycle Architecture)
  if (curCycle) {
    if (!state.cycleResults) state.cycleResults = {};
    if (!state.cycleResults[curCycle.id]) state.cycleResults[curCycle.id] = {};
    state.cycleResults[curCycle.id][tcId] = JSON.parse(JSON.stringify(resultRecord));
  }

  // Cập nhật trạng thái phân công (Assignment) nếu có
  if (state.assignments) {
    state.assignments.forEach(asg => {
      if (asg.tcId === tcId && (!asg.cycleId || (curCycle && asg.cycleId === curCycle.id))) {
        asg.status = execDraftStatus;
        asg.executedAt = resultRecord.runAt;
      }
    });
  }

  // Record audit execution log (ISO/IEC/IEEE 29119-3 Clause 7)
  const tcItem = getAllTcs().find(t => t.id === tcId);
  recordExecutionLog({
    sessionId: state.session?.id || 'SES-202610-01',
    sessionName: state.session?.name || 'Sprint 1 - Regression Test',
    cycleId: curCycle ? curCycle.id : 'CYC-GENERIC',
    cycleName: curCycle ? curCycle.name : 'Đợt kiểm thử tổng thể',
    tcId,
    tcName: tcItem ? (tcItem.name || tcItem.title) : tcId,
    module: tcItem ? tcItem.module : 'M01',
    testerUsername: user.username,
    testerName: user.name,
    status: execDraftStatus || 'Pass',
    actualResult: (execDraftStatus === 'Skip' && !actualResult && skipReason) ? skipReason : actualResult,
    failReason: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? failReason : '',
    skipReason: (execDraftStatus === 'Skip') ? (skipReason || actualResult) : '',
    defectCategory: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? defectCategory : '',
    severity: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? severity : '',
    assignedDev: (execDraftStatus === 'Fail' || execDraftStatus === 'Blocked') ? assignedDev : '',
    evidenceCount: (state.evidences[tcId] || []).length
  });

  saveCoreState();
  if (typeof window.syncResultToCloud === 'function') {
    window.syncResultToCloud(tcId);
  }
  if (defectToastMsg) {
    showToast(defectToastMsg, finalDefectStatus === 'Closed' ? 'success' : 'warning');
  } else {
    showToast(`✅ Đã lưu kết quả [${tcId}] vào ${curCycle?.name || 'Đợt kiểm thử'}: ${execDraftStatus}`, 'success');
  }

  // Update left list
  filterExecList();

  if (andNext) {
    navigateExecTc(1);
  } else {
    const tc = getAllTcs().find(t => t.id === tcId);
    if (tc) renderExecDetail(tc);
  }
}

function navigateExecTc(direction) {
  const listToUse = currentFilteredTcList.length > 0 ? currentFilteredTcList : getAllTcs();
  if (listToUse.length === 0) return;
  const curIdx = listToUse.findIndex(t => t.id === currentSelectedTcId);
  let nextIdx = curIdx + direction;
  if (nextIdx < 0) nextIdx = listToUse.length - 1;
  if (nextIdx >= listToUse.length) nextIdx = 0;
  selectExecTc(listToUse[nextIdx].id);
}

function updateDefectLifecycle(tcId, newDefectStatus) {
  if (!state.results[tcId]) {
    state.results[tcId] = { status: 'Fail', tester: getCurrentUser().name, runAt: new Date().toISOString() };
  }
  state.results[tcId].defectStatus = newDefectStatus;
  saveCoreState();
  if (typeof window.syncResultToCloud === 'function') {
    window.syncResultToCloud(tcId);
  }
  showToast(`🐞 Cập nhật trạng thái lỗi: ${newDefectStatus}`, 'info');
  const tc = getAllTcs().find(t => t.id === tcId);
  if (tc) renderExecDetail(tc);
}

function handleEvidenceUpload(tcId, input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!state.evidences[tcId]) state.evidences[tcId] = [];
    state.evidences[tcId].push({
      url: e.target.result,
      caption: file.name,
      uploadedAt: new Date().toISOString()
    });
    saveCoreState();
    if (typeof window.syncResultToCloud === 'function') {
      window.syncResultToCloud(tcId);
    }
    showToast('📸 Đã đính kèm ảnh bằng chứng!', 'success');
    const tc = getAllTcs().find(t => t.id === tcId);
    if (tc) renderExecDetail(tc);
  };
  reader.readAsDataURL(file);
}

function handleQuickEvidenceUpload(event, tcId) {
  const input = event.target;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!state.evidences[tcId]) state.evidences[tcId] = [];
    state.evidences[tcId].push({
      url: e.target.result,
      caption: file.name,
      uploadedAt: new Date().toISOString()
    });
    saveCoreState();
    if (typeof window.syncResultToCloud === 'function') {
      window.syncResultToCloud(tcId);
    }
    showToast('📸 Đã đính kèm ảnh bằng chứng!', 'success');
    renderQuickEvidencePreview(tcId);
  };
  reader.readAsDataURL(file);
}

function renderQuickEvidencePreview(tcId) {
  const container = document.getElementById('quick-evidence-preview');
  if (!container) return;
  const evs = state.evidences[tcId] || [];
  container.innerHTML = evs.map((ev, i) => `
    <img src="${ev.url}" class="quick-thumb-item" title="${escapeHtml(ev.caption)}" onclick="openLightbox('${ev.url}', 'Bằng chứng [${tcId}] - ${escapeHtml(ev.caption)}')" />
  `).join('');
}

// Clipboard Paste Handler (Ctrl + V for direct screenshot pasting)
function handleGlobalClipboardPaste(e) {
  if (!currentSelectedTcId) return;
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = function(event) {
        if (!state.evidences[currentSelectedTcId]) state.evidences[currentSelectedTcId] = [];
        state.evidences[currentSelectedTcId].push({
          url: event.target.result,
          caption: `Ảnh chụp nhanh ${new Date().toLocaleTimeString('vi-VN')}`,
          uploadedAt: new Date().toISOString()
        });
        saveCoreState();
        showToast(`📸 Đã dán ảnh chụp màn hình vào [${currentSelectedTcId}]!`, 'success');
        renderQuickEvidencePreview(currentSelectedTcId);
      };
      reader.readAsDataURL(blob);
      break;
    }
  }
}

// Global Keyboard Shortcuts
function handleGlobalKeydown(e) {
  // If typing in input or textarea, only catch Ctrl+S / Ctrl+Enter
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

  // Ctrl + S: Save result
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (currentSelectedTcId) saveExecResult(currentSelectedTcId, false);
    return;
  }

  // Ctrl + Enter: Save and next
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (currentSelectedTcId) saveExecResult(currentSelectedTcId, true);
    return;
  }

  // Alt + P / Alt + Left Arrow: Previous
  if (e.altKey && (e.key.toLowerCase() === 'p' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    navigateExecTc(-1);
    return;
  }

  // Alt + N / Alt + Right Arrow: Next
  if (e.altKey && (e.key.toLowerCase() === 'n' || e.key === 'ArrowRight')) {
    e.preventDefault();
    navigateExecTc(1);
    return;
  }
}

function deleteEvidence(tcId, index) {
  if (state.evidences[tcId]) {
    state.evidences[tcId].splice(index, 1);
    saveCoreState();
    if (typeof window.syncResultToCloud === 'function') {
      window.syncResultToCloud(tcId);
    }
    showToast('🗑 Đã xóa ảnh bằng chứng!', 'info');
    const tc = getAllTcs().find(t => t.id === tcId);
    if (tc) renderExecDetail(tc);
  }
}

function sendExecComment(tcId) {
  const input = document.getElementById('exec-discuss-input');
  if (!input || !input.value.trim()) return;

  const user = getCurrentUser();
  if (!state.comments[tcId]) state.comments[tcId] = [];

  state.comments[tcId].push({
    author: user.name,
    role: user.role === 'admin' ? 'QA Lead' : user.role === 'dev' ? 'Dev' : 'Tester',
    time: new Date().toISOString(),
    text: input.value.trim()
  });

  const commentText = input.value.trim();
  saveCoreState();
  if (typeof window.syncCommentToCloud === 'function') {
    window.syncCommentToCloud(tcId, commentText);
  }
  input.value = '';
  showToast('💬 Đã gửi trao đổi kỹ thuật!', 'success');
  const tc = getAllTcs().find(t => t.id === tcId);
  if (tc) renderExecDetail(tc);
}

function openLightbox(url, title = 'Ảnh chụp bằng chứng lỗi') {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const t = document.getElementById('lightbox-title');
  if (!modal || !img) return;
  img.src = url;
  if (t) t.textContent = title;
  modal.classList.add('show');
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('show');
}
