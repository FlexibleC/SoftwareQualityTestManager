/**
 * TESTER MODULE: CYCLE WORKSPACE & FASTTRACK STUDIO (TẦNG 3) - tester-cycle.js
 * Bàn thực thi kịch bản kiểm thử Dual-Pane FastTrack Studio
 * Tiêu chuẩn: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010:2023 | IEEE 829 Defect Logging
 */

const TesterCycle = {
  currentTcId: null,
  currentFilteredTcs: [],
  timerInterval: null,
  timerSeconds: 0,
  timerRunning: false,
  stepOutcomes: {}, // { [stepIndex]: 'PASS' | 'FAIL' | 'BLOCKED' }
  activeQuickTab: 'all', // 'all' | 'pending' | 'today' | 'retest' | 'fail'
  sessionStartTime: Date.now(),
  sessionTestedTcIds: new Set(),
  stepEditMode: false,
  showExtraNotes: false,

  init() {
    TesterContext.init(3);
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) {
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = `
          <div class="card" style="text-align:center; padding:60px 20px; max-width:600px; margin:40px auto; border:2px dashed var(--border)">
            <div style="font-size:48px; margin-bottom:12px">🧪</div>
            <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px">Chưa có dự án nào trong hệ thống</h3>
            <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px">Hệ thống đã được làm sạch cơ sở dữ liệu (0 dự án). Vui lòng quay lại danh mục dự án hoặc chờ phân công dự án mới.</p>
            <a href="index.html" class="btn btn-primary" style="font-weight:700">Quay lại Trang chính</a>
          </div>
        `;
      }
      return;
    }
    this.renderCycleHeader();
    this.setupListeners();
    this.populateFilters();
    this.filterAndRenderQueue();

    // Check query param for initial TC selection
    const params = new URLSearchParams(window.location.search);
    const tcParam = params.get('tcId') || params.get('tc');
    if (tcParam) {
      this.selectTestCase(tcParam);
    } else if (this.currentFilteredTcs.length > 0) {
      this.selectTestCase(this.currentFilteredTcs[0].id);
    }
  },

  renderCycleHeader() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const curVer = state.activeVersion;
    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(curPrj.id, curVer) : [];
    const curCycle = (state.activeCycleId && cycles.find(c => c.id === state.activeCycleId)) || cycles[0];

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    if (curCycle) {
      setEl('cycle-strip-code', curCycle.code || curCycle.id);
      setEl('cycle-strip-name', curCycle.name || 'Đợt kiểm thử tác nghiệp');
      setEl('cycle-strip-status', curCycle.status === 'ACTIVE' ? '🟢 Đang diễn ra' : '🔒 Đã đóng');
      setEl('cycle-strip-suite', curCycle.suite || 'Hồi quy');
      setEl('cycle-strip-meta', `📅 Thời hạn: ${curCycle.dueDate || 'Chưa đặt'} • Phiên bản: ${curVer} • Mục tiêu đạt: ≥ ${curCycle.targetPassRate || 90}%`);
    } else {
      setEl('cycle-strip-code', 'ALL-CYCLES');
      setEl('cycle-strip-name', 'Tất cả các đợt kiểm thử được giao');
    }

    this.renderCycleKpis(curPrj.id, curCycle?.id);
  },

  renderCycleKpis(projectId, cycleId) {
    const myTcs = TesterContext.getMyAssignedTasks(projectId, cycleId);
    const todayStr = new Date().toISOString().slice(0, 10);

    let pPass = 0, pFail = 0, pBlock = 0, pRetest = 0, pPending = 0;
    let todayCount = 0, todayPass = 0, todayFail = 0;

    myTcs.forEach(tc => {
      const r = (state.cycleResults && cycleId && state.cycleResults[cycleId] && state.cycleResults[cycleId][tc.id])
             || (state.results && state.results[tc.id]) || {};
      const s = (r.status || '').toUpperCase();

      if (s === 'PASS' || s === 'PASSED') pPass++;
      else if (s === 'FAIL' || s === 'FAILED') {
        pFail++;
        if (r.defectStatus === 'Fixed' || r.defectStatus === 'Resolved' || r.isResolvedByDev) {
          pRetest++;
        }
      } else if (s === 'BLOCKED') {
        pBlock++;
      } else {
        pPending++;
      }

      // Check if executed today or in current browser session
      const isToday = (r.runAt && r.runAt.startsWith(todayStr)) || this.sessionTestedTcIds.has(tc.id);
      if (isToday) {
        todayCount++;
        if (s === 'PASS' || s === 'PASSED') todayPass++;
        else if (s === 'FAIL' || s === 'FAILED') todayFail++;
      }
    });

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // Lifetime Cycle KPIs
    setEl('kpi-cycle-total', myTcs.length);
    setEl('kpi-cycle-pass', pPass);
    setEl('kpi-cycle-fail', pFail);
    setEl('kpi-cycle-blocked', pBlock);
    setEl('kpi-cycle-retest', pRetest);
    setEl('kpi-cycle-pending', pPending);

    // Today's Session Tracker & Velocity
    setEl('kpi-today-count', todayCount);
    setEl('kpi-today-pass', todayPass);
    setEl('kpi-today-fail', todayFail);

    const elapsedHours = Math.max(0.08, (Date.now() - this.sessionStartTime) / 3600000);
    const velocity = todayCount > 0 ? Math.max(1, Math.round(todayCount / elapsedHours)) : 0;
    setEl('kpi-today-velocity', todayCount > 0 ? `~${velocity} bài/giờ` : 'Chưa ghi nhận');

    // Quick Filter Tab Badges
    setEl('tab-cnt-all', myTcs.length);
    setEl('tab-cnt-pending', pPending);
    setEl('tab-cnt-today', todayCount);
    setEl('tab-cnt-retest', pRetest);
    setEl('tab-cnt-fail', pFail);
  },

  setQuickTab(tabKey) {
    this.activeQuickTab = tabKey;
    ['all', 'pending', 'today', 'retest', 'fail'].forEach(k => {
      const btn = document.getElementById(`tab-${k}`);
      if (btn) {
        if (k === tabKey) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    this.filterAndRenderQueue();
  },

  setupListeners() {
    // Clipboard paste listener for screenshots
    window.removeEventListener('paste', this.handleClipboardPaste);
    window.addEventListener('paste', (e) => this.handleClipboardPaste(e));

    // Keyboard shortcuts
    window.removeEventListener('keydown', this.handleKeydown);
    window.addEventListener('keydown', (e) => this.handleKeydown(e));
  },

  populateFilters() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const modSel = document.getElementById('filter-module');
    if (modSel) {
      const myTcs = TesterContext.getMyAssignedTasks(curPrj.id, state.activeCycleId);
      const assignedModIds = new Set(myTcs.map(t => t.module).filter(Boolean));
      const allMods = typeof getModules === 'function' ? getModules(state.activeVersion, curPrj.id) : (curPrj.modules || []);
      const mods = allMods.filter(m => assignedModIds.has(m.id));
      modSel.innerHTML = '<option value="">Tất cả phân hệ</option>' +
        mods.map(m => `<option value="${m.id}">[${m.id}] ${m.name}</option>`).join('');
    }
  },

  filterAndRenderQueue() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const myTcs = TesterContext.getMyAssignedTasks(curPrj.id, state.activeCycleId);
    const q = (document.getElementById('queue-search')?.value || '').toLowerCase().trim();
    const mod = document.getElementById('filter-module')?.value || '';
    const prio = document.getElementById('filter-priority')?.value || '';
    const todayStr = new Date().toISOString().slice(0, 10);
    const curCycleId = state.activeCycleId;

    this.currentFilteredTcs = myTcs.filter(tc => {
      if (mod && tc.module !== mod) return false;
      if (prio && tc.priority !== prio) return false;

      const r = (state.cycleResults && curCycleId && state.cycleResults[curCycleId] && state.cycleResults[curCycleId][tc.id])
             || (state.results && state.results[tc.id]) || {};
      const s = (r.status || 'Not Run').toUpperCase();
      const isRetest = (s === 'FAIL' || s === 'FAILED') && (r.defectStatus === 'Fixed' || r.defectStatus === 'Resolved' || r.isResolvedByDev);
      const isToday = (r.runAt && r.runAt.startsWith(todayStr)) || this.sessionTestedTcIds.has(tc.id);

      // Quick Tab Filtering
      if (this.activeQuickTab === 'pending') {
        if (s !== 'NOT RUN') return false;
      } else if (this.activeQuickTab === 'today') {
        if (!isToday) return false;
      } else if (this.activeQuickTab === 'retest') {
        if (!isRetest) return false;
      } else if (this.activeQuickTab === 'fail') {
        if (s !== 'FAIL' && s !== 'FAILED') return false;
      }

      if (q) {
        const matchId = (tc.id || '').toLowerCase().includes(q);
        const matchName = (tc.name || tc.title || '').toLowerCase().includes(q);
        if (!matchId && !matchName) return false;
      }

      return true;
    });

    const queueEl = document.getElementById('studio-queue-list');
    const badgeEl = document.getElementById('queue-count-badge');
    if (badgeEl) badgeEl.textContent = `${this.currentFilteredTcs.length} bài`;

    if (!queueEl) return;

    if (this.currentFilteredTcs.length === 0) {
      queueEl.innerHTML = `
        <div style="padding:28px 16px; text-align:center; color:var(--text-muted); font-size:12px">
          <div style="font-size:24px; margin-bottom:6px">🔍</div>
          <div>Không tìm thấy kịch bản nào phù hợp bộ lọc.</div>
        </div>
      `;
      return;
    }

    queueEl.innerHTML = this.currentFilteredTcs.map(tc => {
      const isSelected = tc.id === this.currentTcId;
      const r = (state.cycleResults && curCycleId && state.cycleResults[curCycleId] && state.cycleResults[curCycleId][tc.id])
             || (state.results && state.results[tc.id]) || {};
      const s = r.status || 'Not Run';
      const isRetest = (s === 'Fail' || s === 'FAILED') && (r.defectStatus === 'Fixed' || r.defectStatus === 'Resolved' || r.isResolvedByDev);
      const isToday = (r.runAt && r.runAt.startsWith(todayStr)) || this.sessionTestedTcIds.has(tc.id);

      return `
        <div class="queue-item ${isSelected ? 'selected' : ''}" onclick="TesterCycle.selectTestCase('${tc.id}')">
          <div class="queue-item-top">
            <span class="queue-item-id">[${tc.id}]</span>
            <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap">
              ${isToday ? '<span class="badge" style="background:rgba(13,148,136,0.15); color:#0d9488; font-size:9px; font-weight:800; border:1px solid rgba(13,148,136,0.3)">⚡ Hôm nay</span>' : ''}
              ${isRetest ? '<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #d8b4fe; font-size:9.5px; font-weight:800">🔄 Re-test</span>' : ''}
              ${this.getStatusBadgeMini(s)}
              <span class="badge badge-outline" style="font-size:9.5px; padding:1px 5px">${tc.priority || 'P2'}</span>
            </div>
          </div>
          <div class="queue-item-title">${escapeHtml(tc.name || tc.title || '')}</div>
          <div style="margin-top:4px; font-size:11px; color:var(--text-muted)">
            Phân hệ: <strong>${escapeHtml(tc.module || 'M01')}</strong> • ${escapeHtml(tc.type || 'Chức năng')}
          </div>
        </div>
      `;
    }).join('');
  },

  selectTestCase(tcId) {
    this.currentTcId = tcId;
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    const tc = (curPrj?.testCases || (typeof getAllTcs === 'function' ? getAllTcs(undefined, curPrj?.id) : [])).find(t => t.id === tcId);
    if (!tc) return;

    // Reset temporary edit and notes toggles when selecting a new test case
    this.stepEditMode = false;
    this.showExtraNotes = false;

    // Highlight in list
    document.querySelectorAll('.queue-item').forEach(el => el.classList.remove('selected'));
    const allQueueItems = document.querySelectorAll('.queue-item');
    allQueueItems.forEach(el => {
      if (el.querySelector('.queue-item-id')?.textContent.includes(tcId)) {
        el.classList.add('selected');
      }
    });

    this.renderConsoleDetail(tc);
    this.startTimer();
  },

  toggleStepEditMode(enable) {
    this.stepEditMode = typeof enable === 'boolean' ? enable : !this.stepEditMode;
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    const tc = (curPrj?.testCases || (typeof getAllTcs === 'function' ? getAllTcs(undefined, curPrj?.id) : [])).find(t => t.id === this.currentTcId);
    if (tc) this.renderConsoleDetail(tc);
  },

  toggleExtraNotes() {
    this.showExtraNotes = !this.showExtraNotes;
    const box = document.getElementById('extra-notes-box');
    const btn = document.getElementById('btn-toggle-notes');
    if (box) box.style.display = this.showExtraNotes ? 'block' : 'none';
    if (btn) btn.textContent = this.showExtraNotes ? '▲ Thu gọn ghi chú' : '📝 Thêm ghi chú / Bằng chứng (Tùy chọn)';
  },

  renderConsoleDetail(tc) {
    const consoleCard = document.getElementById('studio-console-card');
    if (!consoleCard) return;

    const curCycleId = state.activeCycleId;
    const r = (state.cycleResults && curCycleId && state.cycleResults[curCycleId] && state.cycleResults[curCycleId][tc.id])
           || (state.results && state.results[tc.id]) || {};

    const isAlreadyPassed = (r.status || '').toUpperCase() === 'PASS' || (r.status || '').toUpperCase() === 'PASSED';
    const draftStatus = r.status || 'Pass';
    const stepsArray = Array.isArray(tc.steps) ? tc.steps : (tc.steps ? [tc.steps] : []);
    const expectedArray = Array.isArray(tc.expected) ? tc.expected : (tc.expected ? [tc.expected] : []);
    const evidences = (state.evidences && state.evidences[tc.id]) || [];

    // Reset step outcomes
    this.stepOutcomes = {};
    stepsArray.forEach((_, idx) => {
      this.stepOutcomes[idx] = (draftStatus === 'Pass' || isAlreadyPassed) ? 'PASS' : 'UNTESTED';
    });

    consoleCard.innerHTML = `
      <!-- TOPBAR: Title & Metadata -->
      <div class="console-topbar">
        <div class="console-header-row1">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
            <span class="console-tc-id-pill">[${tc.id}]</span>
            <span class="badge badge-outline" style="font-weight:800">${tc.priority || 'P2'}</span>
            <span class="badge badge-info">${escapeHtml(tc.module || 'M01')}</span>
            <span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1">🎯 ${escapeHtml(tc.type || 'Chức năng')}</span>
            ${tc.reqId ? `<span class="badge" style="background:#fef3c7; color:#92400e">📌 ${escapeHtml(tc.reqId)}</span>` : ''}
          </div>

          <div style="display:flex; align-items:center; gap:8px">
            <!-- Timer Badge -->
            <div class="tester-timer-pill" title="Thời gian kiểm thử kịch bản này">
              <span>⏱️</span>
              <span id="exec-timer-display">00:00</span>
              <button type="button" class="timer-btn" onclick="TesterCycle.toggleTimer()" title="Tạm dừng / Tiếp tục">⏯</button>
              <button type="button" class="timer-btn" onclick="TesterCycle.resetTimer()" title="Đặt lại">↺</button>
            </div>

            <!-- Prev / Next Nav -->
            <button type="button" class="btn btn-outline btn-xs" onclick="TesterCycle.navigateTc(-1)" title="Bài trước (Alt+P)">← Trước</button>
            <button type="button" class="btn btn-outline btn-xs" onclick="TesterCycle.navigateTc(1)" title="Bài tiếp (Alt+N)">Sau →</button>
            
            <!-- Save Buttons -->
            <button type="button" class="btn btn-primary btn-xs" onclick="TesterCycle.saveExecution(false)" style="background:#0d9488; border-color:#0f766e; font-weight:800" title="Lưu kết quả (Ctrl+S)">
              💾 Lưu kết quả
            </button>
            <button type="button" class="btn btn-outline btn-xs" onclick="TesterCycle.saveExecution(true)" title="Lưu & qua bài kế tiếp (Ctrl+Enter)">
              Lưu & Tiếp ➔
            </button>
          </div>
        </div>

        <h2 class="console-title">${escapeHtml(tc.name || tc.title || '')}</h2>
      </div>

      <!-- OUTCOME SELECTION ACTION BAR -->
      <div class="console-action-bar">
        <div class="outcome-btn-group">
          <span style="font-size:11.5px; font-weight:800; color:var(--text-muted); margin-right:4px">KẾT QUẢ:</span>
          <button type="button" id="btn-outcome-pass" class="btn-outcome outcome-pass ${draftStatus === 'Pass' ? 'active' : ''}" onclick="TesterCycle.setOutcome('Pass')">
            ✅ Đạt (Pass) [P]
          </button>
          <button type="button" id="btn-outcome-fail" class="btn-outcome outcome-fail ${draftStatus === 'Fail' ? 'active' : ''}" onclick="TesterCycle.setOutcome('Fail')">
            ❌ Lỗi (Fail) [F]
          </button>
          <button type="button" id="btn-outcome-blocked" class="btn-outcome outcome-blocked ${draftStatus === 'Blocked' ? 'active' : ''}" onclick="TesterCycle.setOutcome('Blocked')">
            ⛔ Chặn (Blocked) [B]
          </button>
          <button type="button" id="btn-outcome-skip" class="btn-outcome outcome-skip ${draftStatus === 'Skip' ? 'active' : ''}" onclick="TesterCycle.setOutcome('Skip')">
            ⏭ Bỏ qua
          </button>
          <button type="button" id="btn-outcome-wip" class="btn-outcome outcome-wip ${draftStatus === 'In Progress' ? 'active' : ''}" onclick="TesterCycle.setOutcome('In Progress')">
            ⏳ Đang test
          </button>
        </div>

        <div style="font-size:11.5px; color:var(--text-muted)">
          💡 Phím tắt: <strong>P</strong> (Đạt) | <strong>F</strong> (Lỗi) | <strong>B</strong> (Chặn) | <strong>Ctrl+S</strong> (Lưu)
        </div>
      </div>

      <!-- CONSOLE BODY -->
      <div class="console-body">
        
        <!-- COMPACT META STRIP: Preconditions & Test Data (Clean 2-Column) -->
        <div class="console-meta-strip">
          <div class="meta-strip-item">
            <div class="meta-strip-label">⚙️ Tiền điều kiện (Precondition)</div>
            <div style="color:var(--text-secondary); line-height:1.4">
              ${escapeHtml(tc.precondition || 'Môi trường sẵn sàng, tài khoản được phân quyền hợp lệ theo kịch bản.')}
            </div>
          </div>

          <div class="meta-strip-item">
            <div class="meta-strip-label">
              <span>📊 Dữ liệu kiểm thử (Inputs)</span>
              ${tc.testData ? `<button type="button" class="btn btn-outline btn-xs" style="padding:1px 6px; font-size:10px" onclick="navigator.clipboard.writeText('${escapeHtml(tc.testData).replace(/'/g, "\\'")}'); showToast('📋 Đã chép dữ liệu!', 'info')">📋 Chép</button>` : ''}
            </div>
            <div style="font-family:monospace; color:var(--text-primary); line-height:1.4; word-break:break-all">
              ${escapeHtml(tc.testData || 'Sử dụng dữ liệu tài khoản/thiết bị chuẩn hệ thống.')}
            </div>
          </div>
        </div>

        <!-- STEP-BY-STEP CHECKLIST PAIRED WITH EXPECTED BEHAVIOR (ISO 29119-3) -->
        <div class="step-checklist-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px">
            <div style="display:flex; align-items:center; gap:8px">
              <strong style="font-size:13px; color:var(--text-primary)">📋 Các bước thực hiện & Kết quả kỳ vọng</strong>
              ${(isAlreadyPassed && !this.stepEditMode) ? `<span class="badge badge-pass" style="font-size:10.5px">✓ Đã đạt toàn bộ (${stepsArray.length}/${stepsArray.length} bước)</span>` : ''}
            </div>

            <div>
              ${(isAlreadyPassed && !this.stepEditMode) ? `
                <button type="button" class="btn btn-outline btn-xs" onclick="TesterCycle.toggleStepEditMode(true)" style="font-size:11px" title="Đánh giá chi tiết từng bước riêng lẻ">
                  ✏️ Đánh giá lại từng bước
                </button>
              ` : `
                <div style="display:flex; align-items:center; gap:6px">
                  <button type="button" class="btn btn-outline btn-xs" onclick="TesterCycle.passAllSteps()" style="color:#16a34a; border-color:#16a34a; font-weight:700">
                    ⚡ Đạt tất cả các bước
                  </button>
                  ${this.stepEditMode ? `
                    <button type="button" class="btn btn-primary btn-xs" onclick="TesterCycle.toggleStepEditMode(false)" style="background:#0d9488; font-size:11px">
                      Xong
                    </button>
                  ` : ''}
                </div>
              `}
            </div>
          </div>

          <div id="steps-list-container">
            ${stepsArray.map((step, idx) => {
              const cleanStep = step.replace(/^[0-9]+\.\s*/, '');
              const expectedText = expectedArray[idx] || (expectedArray.length === 1 && idx === 0 ? expectedArray[0] : (expectedArray.length > 0 ? expectedArray[Math.min(idx, expectedArray.length - 1)] : ''));
              const isStepPassed = (isAlreadyPassed && !this.stepEditMode) || this.stepOutcomes[idx] === 'PASS';
              const isStepFailed = this.stepOutcomes[idx] === 'FAIL';
              const isStepBlocked = this.stepOutcomes[idx] === 'BLOCKED';

              // If already passed and not in manual step edit mode, render peaceful clean completion
              if (isAlreadyPassed && !this.stepEditMode) {
                return `
                  <div class="step-row-interactive step-passed" id="step-row-${idx}">
                    <div class="step-circle passed">✓</div>
                    <div style="flex:1; min-width:0">
                      <div class="step-text">${escapeHtml(cleanStep)}</div>
                      ${expectedText ? `<div class="step-expected">↳ Kỳ vọng: ${escapeHtml(expectedText)}</div>` : ''}
                    </div>
                    <div class="step-status-tag">✓ Đã đạt</div>
                  </div>
                `;
              }

              // Otherwise render interactive evaluation buttons
              return `
                <div class="step-row-interactive ${isStepPassed ? 'step-passed' : ''}" id="step-row-${idx}">
                  <div class="step-circle ${isStepPassed ? 'passed' : (isStepFailed ? 'failed' : '')}">
                    ${isStepPassed ? '✓' : idx + 1}
                  </div>
                  <div style="flex:1; min-width:0">
                    <div class="step-text">${escapeHtml(cleanStep)}</div>
                    ${expectedText ? `<div class="step-expected">↳ Kỳ vọng: ${escapeHtml(expectedText)}</div>` : ''}
                  </div>
                  <div class="step-mini-actions">
                    <button type="button" class="step-btn-mini pass ${isStepPassed ? 'active' : ''}" id="step-btn-pass-${idx}" onclick="TesterCycle.setStepStatus(${idx}, 'PASS')">Đạt</button>
                    <button type="button" class="step-btn-mini fail ${isStepFailed ? 'active' : ''}" id="step-btn-fail-${idx}" onclick="TesterCycle.setStepStatus(${idx}, 'FAIL')">Lỗi</button>
                    <button type="button" class="step-btn-mini block ${isStepBlocked ? 'active' : ''}" id="step-btn-block-${idx}" onclick="TesterCycle.setStepStatus(${idx}, 'BLOCKED')">Chặn</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- PASS CONFIRMATION BANNER (When Pass: Zero Clutter, Clean & Peaceful) -->
        <div id="pass-confirmed-banner" class="pass-confirmed-banner" style="display:${(draftStatus === 'Pass') ? 'flex' : 'none'}">
          <div style="display:flex; align-items:center; gap:10px">
            <span style="font-size:20px">✅</span>
            <div>
              <div style="font-size:12.5px; font-weight:800; color:#15803d">Kịch bản đã đạt tiêu chuẩn chất lượng (ISO 29119-3)</div>
              <div style="font-size:11px; color:#166534">Toàn bộ các bước kiểm thử hợp lệ, hệ thống phản hồi đúng như kỳ vọng thiết kế.</div>
            </div>
          </div>
          <button type="button" id="btn-toggle-notes" class="btn btn-outline btn-xs" onclick="TesterCycle.toggleExtraNotes()" style="color:#15803d; border-color:#86efac; font-size:11px">
            ${(this.showExtraNotes || r.actualResult || evidences.length > 0) ? '▲ Thu gọn ghi chú' : '📝 Thêm ghi chú / Bằng chứng (Tùy chọn)'}
          </button>
        </div>

        <!-- COLLAPSABLE EXTRA NOTES & EVIDENCE FOR PASSED TEST CASES -->
        <div id="extra-notes-box" style="display:${(draftStatus === 'Pass' && (this.showExtraNotes || r.actualResult || evidences.length > 0)) || (draftStatus !== 'Pass' && draftStatus !== 'Fail' && draftStatus !== 'Blocked') ? 'block' : 'none'}; margin-bottom:14px">
          <div style="margin-bottom:12px">
            <label style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px">
              👁️ Ghi nhận thực tế quan sát được (Tùy chọn)
            </label>
            <textarea id="exec-actual-result-optional" rows="2" class="form-input" style="width:100%; font-size:12px; padding:8px 10px; border-radius:6px; border:1px solid var(--border)" placeholder="Ghi nhận hành vi thực tế quan sát được trên hệ thống (nếu cần)...">${escapeHtml(r.actualResult || '')}</textarea>
          </div>

          <div style="background:var(--bg-surface); padding:10px 14px; border-radius:8px; border:1px solid var(--border)">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <span style="font-size:11.5px; font-weight:700; color:var(--text-primary)">📸 Bằng chứng ảnh chụp đính kèm</span>
              <label class="btn btn-outline btn-xs" style="cursor:pointer">
                Tải ảnh lên <input type="file" accept="image/*" style="display:none" onchange="TesterCycle.handleFileUpload(this)" />
              </label>
            </div>
            <div class="evidence-gallery" id="evidence-gallery-container-optional">
              ${evidences.map((ev, idx) => `
                <div class="evidence-thumb-card" onclick="TesterCycle.openLightbox('${ev.dataUrl}')">
                  <img src="${ev.dataUrl}" alt="Evidence ${idx + 1}" />
                  <button type="button" class="evidence-thumb-del" onclick="event.stopPropagation(); TesterCycle.deleteEvidence(${idx})">&times;</button>
                </div>
              `).join('')}
              ${evidences.length === 0 ? '<div style="font-size:11px; color:var(--text-muted); font-style:italic">Chưa có ảnh bằng chứng. Nhấn Ctrl+V để dán ảnh chụp màn hình ngay.</div>' : ''}
            </div>
          </div>
        </div>

        <!-- INLINE DEFECT REPORT FORM (Expands Automatically on Fail / Blocked) -->
        <div id="inline-defect-box" class="tester-defect-box ${draftStatus === 'Fail' || draftStatus === 'Blocked' ? 'show' : ''}">
          <div class="defect-box-title">
            <span>🐞 Báo cáo lỗi cho developer (Chuẩn IEEE 829 & ISO 29119-3 Defect)</span>
            <span class="badge badge-fail" id="defect-severity-badge">${escapeHtml(r.severity || 'Critical')}</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:2px">Phân loại lỗi</label>
              <select id="defect-category" class="form-select" style="width:100%; font-size:11.5px; height:32px">
                <option value="Logic nghiệp vụ" ${r.defectCategory === 'Logic nghiệp vụ' ? 'selected' : ''}>Nghiệp vụ / Sai quy trình</option>
                <option value="Giao diện UI" ${r.defectCategory === 'Giao diện UI' ? 'selected' : ''}>Giao diện UI / Lỗi hiển thị</option>
                <option value="Thiếu chức năng" ${r.defectCategory === 'Thiếu chức năng' ? 'selected' : ''}>Thiếu tính năng / Chưa hoàn thiện</option>
                <option value="Backend 500 / Exception" ${r.defectCategory === 'Backend 500 / Exception' ? 'selected' : ''}>Backend 500 / Exception / Crash</option>
                <option value="Hiệu năng / Timeout" ${r.defectCategory === 'Hiệu năng / Timeout' ? 'selected' : ''}>Hiệu năng / Quá tải / Timeout</option>
              </select>
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:2px">Mức độ nghiêm trọng</label>
              <select id="defect-severity" class="form-select" style="width:100%; font-size:11.5px; height:32px" onchange="document.getElementById('defect-severity-badge').textContent = this.value">
                <option value="Critical" ${r.severity === 'Critical' ? 'selected' : ''}>🔴 Critical (Nghiêm trọng)</option>
                <option value="Blocker" ${r.severity === 'Blocker' ? 'selected' : ''}>⛔ Blocker (Chặn đứng)</option>
                <option value="Major" ${r.severity === 'Major' ? 'selected' : ''}>🟠 Major (Lớn)</option>
                <option value="Minor" ${r.severity === 'Minor' ? 'selected' : ''}>🟢 Minor (Nhỏ / UI)</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom:10px">
            <label style="font-size:11px; font-weight:700; color:#dc2626; display:block; margin-bottom:2px">Mô tả lỗi chi tiết / Các bước tái hiện (Bắt buộc) *</label>
            <input type="text" id="defect-fail-reason" class="form-input" style="width:100%; font-size:12px; height:34px; border-color:#f87171" placeholder="VD: Bấm nút Lưu hệ thống báo lỗi 500, dữ liệu không được ghi vào CSDL..." value="${escapeHtml(r.failReason || '')}" />
          </div>

          <!-- Actual Result in Defect Box -->
          <div style="margin-bottom:10px">
            <label style="font-size:11px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:2px">Kết quả thực tế quan sát được (Actual Result)</label>
            <textarea id="exec-actual-result-defect" rows="2" class="form-input" style="width:100%; font-size:12px; padding:6px 10px; border-radius:6px; border:1px solid var(--border)" placeholder="Hành vi thực tế quan sát được trên màn hình...">${escapeHtml(r.actualResult || '')}</textarea>
          </div>

          <!-- Evidence Gallery in Defect Box -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <span style="font-size:11.5px; font-weight:700; color:#dc2626">📸 Bằng chứng ảnh chụp lỗi (Nhấn Ctrl+V để dán ảnh)</span>
              <label class="btn btn-outline btn-xs" style="cursor:pointer">
                Tải ảnh lên <input type="file" accept="image/*" style="display:none" onchange="TesterCycle.handleFileUpload(this)" />
              </label>
            </div>
            <div class="evidence-gallery" id="evidence-gallery-container-defect">
              ${evidences.map((ev, idx) => `
                <div class="evidence-thumb-card" onclick="TesterCycle.openLightbox('${ev.dataUrl}')">
                  <img src="${ev.dataUrl}" alt="Evidence ${idx + 1}" />
                  <button type="button" class="evidence-thumb-del" onclick="event.stopPropagation(); TesterCycle.deleteEvidence(${idx})">&times;</button>
                </div>
              `).join('')}
              ${evidences.length === 0 ? '<div style="font-size:11px; color:var(--text-muted); font-style:italic">Chưa có ảnh chụp lỗi. Dán ảnh chụp màn hình bằng phím tắt Ctrl+V.</div>' : ''}
            </div>
          </div>
        </div>

      </div>
    `;
  },

  setOutcome(status) {
    const btnPass = document.getElementById('btn-outcome-pass');
    const btnFail = document.getElementById('btn-outcome-fail');
    const btnBlock = document.getElementById('btn-outcome-blocked');
    const btnSkip = document.getElementById('btn-outcome-skip');
    const btnWip = document.getElementById('btn-outcome-wip');
    const defectBox = document.getElementById('inline-defect-box');
    const passBanner = document.getElementById('pass-confirmed-banner');
    const extraNotes = document.getElementById('extra-notes-box');

    [btnPass, btnFail, btnBlock, btnSkip, btnWip].forEach(b => b?.classList.remove('active'));

    if (status === 'Pass') {
      btnPass?.classList.add('active');
      this.passAllSteps();
      if (passBanner) passBanner.style.display = 'flex';
      if (defectBox) defectBox.classList.remove('show');
    } else if (status === 'Fail') {
      btnFail?.classList.add('active');
      if (passBanner) passBanner.style.display = 'none';
      if (defectBox) {
        defectBox.classList.add('show');
        setTimeout(() => document.getElementById('defect-fail-reason')?.focus(), 50);
      }
      if (extraNotes) extraNotes.style.display = 'none';
    } else if (status === 'Blocked') {
      btnBlock?.classList.add('active');
      if (passBanner) passBanner.style.display = 'none';
      if (defectBox) defectBox.classList.add('show');
      if (extraNotes) extraNotes.style.display = 'none';
    } else if (status === 'Skip') {
      btnSkip?.classList.add('active');
      if (passBanner) passBanner.style.display = 'none';
      if (defectBox) defectBox.classList.remove('show');
    } else if (status === 'In Progress') {
      btnWip?.classList.add('active');
      if (passBanner) passBanner.style.display = 'none';
      if (defectBox) defectBox.classList.remove('show');
    }
  },

  setStepStatus(stepIdx, status) {
    this.stepOutcomes[stepIdx] = status;
    const btnPass = document.getElementById(`step-btn-pass-${stepIdx}`);
    const btnFail = document.getElementById(`step-btn-fail-${stepIdx}`);
    const btnBlock = document.getElementById(`step-btn-block-${stepIdx}`);
    const rowEl = document.getElementById(`step-row-${stepIdx}`);
    const circleEl = rowEl?.querySelector('.step-circle');

    [btnPass, btnFail, btnBlock].forEach(b => b?.classList.remove('active'));

    if (status === 'PASS') {
      btnPass?.classList.add('active');
      rowEl?.classList.add('step-passed');
      if (circleEl) {
        circleEl.className = 'step-circle passed';
        circleEl.textContent = '✓';
      }
    } else if (status === 'FAIL') {
      btnFail?.classList.add('active');
      rowEl?.classList.remove('step-passed');
      if (circleEl) {
        circleEl.className = 'step-circle failed';
        circleEl.textContent = `${stepIdx + 1}`;
      }
      this.setOutcome('Fail');
      const failReasonInput = document.getElementById('defect-fail-reason');
      if (failReasonInput && !failReasonInput.value) {
        failReasonInput.value = `Lỗi phát sinh tại bước ${stepIdx + 1}: `;
        failReasonInput.focus();
      }
    } else if (status === 'BLOCKED') {
      btnBlock?.classList.add('active');
      rowEl?.classList.remove('step-passed');
      if (circleEl) {
        circleEl.className = 'step-circle';
        circleEl.textContent = `${stepIdx + 1}`;
      }
      this.setOutcome('Blocked');
    }
  },

  passAllSteps() {
    Object.keys(this.stepOutcomes).forEach(idx => {
      this.setStepStatus(Number(idx), 'PASS');
    });
  },

  startTimer() {
    this.resetTimer();
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timerRunning) {
        this.timerSeconds++;
        const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
        const secs = String(this.timerSeconds % 60).padStart(2, '0');
        const display = document.getElementById('exec-timer-display');
        if (display) display.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  },

  toggleTimer() {
    this.timerRunning = !this.timerRunning;
  },

  resetTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerSeconds = 0;
    this.timerRunning = false;
    const display = document.getElementById('exec-timer-display');
    if (display) display.textContent = '00:00';
  },

  handleClipboardPaste(e) {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          this.addEvidence(event.target.result);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  },

  handleFileUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.addEvidence(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  addEvidence(dataUrl) {
    if (!this.currentTcId) return;
    if (!state.evidences) state.evidences = {};
    if (!state.evidences[this.currentTcId]) state.evidences[this.currentTcId] = [];

    state.evidences[this.currentTcId].push({
      dataUrl,
      createdAt: new Date().toISOString()
    });

    if (typeof saveCoreState === 'function') saveCoreState();
    this.renderEvidencesGallery();
    if (typeof showToast === 'function') showToast('📸 Đã dán ảnh bằng chứng thành công!', 'success');
  },

  renderEvidencesGallery() {
    if (!this.currentTcId) return;
    const galleries = [
      document.getElementById('evidence-gallery-container'),
      document.getElementById('evidence-gallery-container-optional'),
      document.getElementById('evidence-gallery-container-defect')
    ].filter(Boolean);

    const evidences = (state.evidences && state.evidences[this.currentTcId]) || [];

    galleries.forEach(gallery => {
      gallery.innerHTML = evidences.map((ev, idx) => `
        <div class="evidence-thumb-card" onclick="TesterCycle.openLightbox('${ev.dataUrl}')">
          <img src="${ev.dataUrl}" alt="Evidence ${idx + 1}" />
          <button type="button" class="evidence-thumb-del" onclick="event.stopPropagation(); TesterCycle.deleteEvidence(${idx})">&times;</button>
        </div>
      `).join('') || '<div style="font-size:11px; color:var(--text-muted); font-style:italic">Chưa có ảnh bằng chứng nào. Nhấn Ctrl+V để dán ảnh chụp màn hình ngay.</div>';
    });
  },

  openLightbox(dataUrl) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
      img.src = dataUrl;
      modal.style.display = 'flex';
    }
  },

  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.style.display = 'none';
  },

  handleKeydown(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const isEditing = tag === 'input' || tag === 'textarea' || tag === 'select';

    // Global save: Ctrl + S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      this.saveExecution(false);
      return;
    }

    // Save & Next: Ctrl + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.saveExecution(true);
      return;
    }

    // Prev: Alt + P
    if (e.altKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      this.navigateTc(-1);
      return;
    }

    // Next: Alt + N
    if (e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      this.navigateTc(1);
      return;
    }

    // Hotkeys when not editing
    if (!isEditing) {
      if (e.key.toLowerCase() === 'p') {
        this.setOutcome('Pass');
      } else if (e.key.toLowerCase() === 'f') {
        this.setOutcome('Fail');
      } else if (e.key.toLowerCase() === 'b') {
        this.setOutcome('Blocked');
      }
    }
  },

  navigateTc(offset) {
    if (this.currentFilteredTcs.length === 0) return;
    const curIdx = this.currentFilteredTcs.findIndex(t => t.id === this.currentTcId);
    let nextIdx = curIdx + offset;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= this.currentFilteredTcs.length) nextIdx = this.currentFilteredTcs.length - 1;
    this.selectTestCase(this.currentFilteredTcs[nextIdx].id);
  },

  saveExecution(nextAfterSave = false) {
    if (!this.currentTcId) return;

    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    const tc = (curPrj?.testCases || (typeof getAllTcs === 'function' ? getAllTcs(undefined, curPrj?.id) : [])).find(t => t.id === this.currentTcId);
    if (!tc) return;

    // Detect outcome
    let status = 'Pass';
    if (document.getElementById('btn-outcome-fail')?.classList.contains('active')) status = 'Fail';
    else if (document.getElementById('btn-outcome-blocked')?.classList.contains('active')) status = 'Blocked';
    else if (document.getElementById('btn-outcome-skip')?.classList.contains('active')) status = 'Skip';
    else if (document.getElementById('btn-outcome-wip')?.classList.contains('active')) status = 'In Progress';

    const actualResult = document.getElementById('exec-actual-result-defect')?.value
                      || document.getElementById('exec-actual-result-optional')?.value
                      || document.getElementById('exec-actual-result')?.value
                      || '';
    const failReason = document.getElementById('defect-fail-reason')?.value || '';
    const category = document.getElementById('defect-category')?.value || 'Logic nghiệp vụ';
    const severity = document.getElementById('defect-severity')?.value || 'Critical';

    if (status === 'Fail' && !failReason.trim()) {
      if (typeof showToast === 'function') showToast('⚠️ Vui lòng nhập lý do thất bại / mô tả lỗi phát hiện!', 'warning');
      document.getElementById('defect-fail-reason')?.focus();
      return;
    }

    const curUser = getCurrentUser();
    const cycleId = state.activeCycleId;

    const resultRecord = {
      projectId: curPrj.id,
      cycleId: cycleId,
      tcId: tc.id,
      status: status,
      actualResult: actualResult,
      failReason: status === 'Fail' ? failReason : '',
      defectCategory: status === 'Fail' ? category : '',
      severity: status === 'Fail' ? severity : '',
      durationSeconds: this.timerSeconds,
      tester: curUser?.name || curUser?.username || 'Kiểm thử viên',
      runAt: new Date().toISOString()
    };

    // Save to global results
    if (!state.results) state.results = {};
    state.results[tc.id] = resultRecord;

    // Save to cycle-specific results (ISO 29119-3 run isolation)
    if (!state.cycleResults) state.cycleResults = {};
    if (cycleId) {
      if (!state.cycleResults[cycleId]) state.cycleResults[cycleId] = {};
      state.cycleResults[cycleId][tc.id] = resultRecord;
    }

    // If Fail, log into state.defects
    if (status === 'Fail') {
      if (!state.defects) state.defects = [];
      const defectId = `DEF-${tc.id}-${Date.now().toString().slice(-4)}`;
      state.defects.push({
        id: defectId,
        projectId: curPrj.id,
        cycleId: cycleId,
        tcId: tc.id,
        title: failReason,
        summary: failReason,
        category: category,
        severity: severity,
        status: 'Open',
        reporter: curUser?.name || curUser?.username || 'tester',
        createdAt: new Date().toISOString()
      });
    }

    // Save audit log
    if (!state.executionLogs) state.executionLogs = [];
    state.executionLogs.unshift({
      ...resultRecord,
      id: `LOG-${Date.now()}`
    });

    // Mark as tested in today's active session
    this.sessionTestedTcIds.add(tc.id);
    this.stepEditMode = false;
    this.showExtraNotes = false;

    if (typeof saveCoreState === 'function') saveCoreState();
    if (typeof showToast === 'function') showToast(`💾 Đã lưu kết quả [${tc.id}]: ${status}!`, 'success');

    this.renderCycleKpis(curPrj.id, cycleId);
    this.filterAndRenderQueue();

    if (nextAfterSave) {
      this.navigateTc(1);
    } else {
      this.renderConsoleDetail(tc);
    }
  },

  getStatusBadgeMini(status) {
    const s = (status || '').toUpperCase();
    if (s === 'PASS' || s === 'PASSED') {
      return '<span class="badge badge-pass" style="font-size:9.5px; padding:1px 5px">✅ Đạt</span>';
    }
    if (s === 'FAIL' || s === 'FAILED') {
      return '<span class="badge badge-fail" style="font-size:9.5px; padding:1px 5px">❌ Lỗi</span>';
    }
    if (s === 'BLOCKED') {
      return '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-size:9.5px; padding:1px 5px">⛔ Chặn</span>';
    }
    if (s === 'SKIP') {
      return '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-size:9.5px; padding:1px 5px">⏭ Bỏ qua</span>';
    }
    return '<span class="badge badge-outline" style="font-size:9.5px; padding:1px 5px">⚪ Chưa chạy</span>';
  }
};

window.TesterCycle = TesterCycle;
