/**
 * LEAD MODULE: VERSION WORKSPACE (TẦNG 2: KHÔNG GIAN PHIÊN BẢN TEST)
 * Chuẩn hóa Executive Release Cockpit theo đúng chuẩn hệ thống quốc tế (Jira Xray / TestRail):
 * 1. Tổng quan & Sức khỏe phiên bản (4 Core KPIs, 4-color distribution, Go-Live Blockers, Active Cycles)
 * 2. Quản trị vòng đời đợt kiểm thử (Cycle Lifecycle Cockpit - Cards & Matrix view, Lock, Clone, Scope)
 * 3. Kịch bản & Phân hệ (2-Pane Module Tree Explorer & Batch Dispatch Workstation)
 * 4. Quản trị nhân sự & Điều phối đợt test (Cycle Staffing Center & 4 Smart Dispatch Tools)
 * 5. Cài đặt & Tiêu chuẩn nghiệm thu phiên bản (6 Nhóm Tham Số Phát Hành Enterprise)
 */

const LeadVersion = {
  currentVersion: '',
  activeTab: 'overview',
  
  // Tab 2: Cycles management
  cyclesSubView: 'cards',
  
  // Tab 3: Module Tree & Test Cases
  selectedTreeModuleId: '',
  batchSelectedTcIds: new Set(),
  
  // Tab 4: Cycle Staffing
  activeRosterCycleId: '',
  
  // Modals state
  activeScopeCycleId: null,
  selectedScopeModuleId: '',
  currentCycleVersionTcs: [],
  tempScopeSelectedIds: new Set(),

  init() {
    this.resolveCurrentVersion();
    this.renderVersionHeader();
    this.renderVersionOverview();
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderModuleTree();
    this.renderScopeTestCases();
    this.populateRosterCycleSelect();
    this.renderVersionRoster();
    this.populateVersionSettings();

    // Khởi tạo tab từ URL tham số ?tab=overview|cycles|scope|roster|settings
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get('tab') || 'overview';
    this.switchVersionTab(initialTab);
  },

  resolveCurrentVersion() {
    const p = getActiveProject();
    if (!p) return;

    const params = new URLSearchParams(window.location.search);
    const urlVer = params.get('version');
    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);

    if (urlVer && versions.some(v => (v.version || v) === urlVer)) {
      this.currentVersion = urlVer;
    } else {
      this.currentVersion = p.activeVersion || (versions[0]?.version) || 'v2.0';
    }

    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      if (urlVer !== this.currentVersion) {
        const curUrl = new URL(window.location.href);
        curUrl.searchParams.set('version', this.currentVersion);
        window.history.replaceState(null, '', curUrl.toString());
      }
    }
  },

  // ==================== TẦNG 2 TAB CONTROLLER ====================
  switchVersionTab(tabKey) {
    const validTabs = ['overview', 'cycles', 'scope', 'roster', 'settings'];
    const activeKey = validTabs.includes(tabKey) ? tabKey : 'overview';
    this.activeTab = activeKey;

    // 1. Toggle Panes
    validTabs.forEach(t => {
      const pane = document.getElementById(`tab-pane-v-${t}`);
      if (pane) {
        pane.style.display = (t === activeKey) ? 'block' : 'none';
      }
    });

    // 2. Toggle Subnav Buttons
    const buttons = {
      overview: document.getElementById('btn-subnav-v-overview'),
      cycles: document.getElementById('btn-subnav-v-cycles'),
      scope: document.getElementById('btn-subnav-v-scope'),
      roster: document.getElementById('btn-subnav-v-roster'),
      settings: document.getElementById('btn-subnav-v-settings')
    };

    Object.entries(buttons).forEach(([key, btn]) => {
      if (btn) {
        if (key === activeKey) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    // 3. Update URL without page reload
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const curUrl = new URL(window.location.href);
      curUrl.searchParams.set('tab', activeKey);
      window.history.replaceState(null, '', curUrl.toString());
    }

    // 4. Trigger specific re-renders
    if (activeKey === 'overview') {
      this.renderVersionOverview();
    } else if (activeKey === 'cycles') {
      this.renderCycleCards();
      this.renderCyclesMatrix();
    } else if (activeKey === 'scope') {
      this.renderModuleTree();
      this.renderScopeTestCases();
    } else if (activeKey === 'roster') {
      this.renderVersionWorkforceKPIs();
      this.renderStaffingMatrix();
      this.renderPerCycleComparisonTable();
      this.populateRosterCycleSelect();
      this.renderVersionStaffRoster();
    } else if (activeKey === 'settings') {
      this.populateVersionSettings();
    }
  },

  // ==================== MASTER BANNER & HEADER ====================
  renderVersionHeader() {
    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const vObj = versions.find(v => (v.version || v) === this.currentVersion) || { version: this.currentVersion };

    const titleEl = document.getElementById('v-banner-title');
    if (titleEl) titleEl.textContent = `Phiên bản ${this.currentVersion}`;

    const labelEl = document.getElementById('v-banner-label');
    if (labelEl) labelEl.textContent = vObj.label || vObj.changelog || `Bản phát hành chuẩn hóa ${this.currentVersion}`;

    const dateEl = document.getElementById('v-banner-date');
    if (dateEl) dateEl.textContent = vObj.targetDate || vObj.releaseDate || '15/11/2026';

    const buildEl = document.getElementById('v-banner-build');
    if (buildEl) buildEl.textContent = `Build #${p.code || 'VMS'}-${this.currentVersion}`;

    const statusEl = document.getElementById('v-banner-status');
    if (statusEl) {
      const st = (vObj.status || (this.currentVersion === p.activeVersion ? 'ACTIVE' : 'PLANNING')).toUpperCase();
      if (st === 'ACTIVE') {
        statusEl.className = 'badge';
        statusEl.style.cssText = 'background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:11px';
        statusEl.textContent = '🟢 Đang triển khai';
      } else if (st === 'RELEASED') {
        statusEl.className = 'badge';
        statusEl.style.cssText = 'background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe; font-weight:800; font-size:11px';
        statusEl.textContent = '🔒 Đã phát hành';
      } else if (st === 'CODE_FREEZE') {
        statusEl.className = 'badge';
        statusEl.style.cssText = 'background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:800; font-size:11px';
        statusEl.textContent = '❄️ Đóng băng mã nguồn';
      } else {
        statusEl.className = 'badge';
        statusEl.style.cssText = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:800; font-size:11px';
        statusEl.textContent = '⏳ Kế hoạch';
      }
    }
  },

  // ==================== TAB 1: EXECUTIVE RELEASE COCKPIT ====================
  renderVersionOverview() {
    const p = getActiveProject();
    if (!p) return;

    const vStr = this.currentVersion;
    const vMetrics = typeof getVersionMetrics === 'function'
      ? getVersionMetrics(p.id, vStr)
      : { totalTcs: 0, passCount: 0, failCount: 0, blockedCount: 0, untestedCount: 0, passRate: 0, failRate: 0, untestedRate: 100, cyclesCount: 0, activeCyclesCount: 0, modulesCount: 0 };

    const vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, vStr) : [];
    const totalTcs = vTcs.length || vMetrics.totalTcs || 0;

    // Đợt kiểm thử
    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, vStr) : [];
    const activeCycles = cycles.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS');

    // Phân rã mức ưu tiên P1/P2/P3+
    let p1Tcs = 0, p2Tcs = 0, p3PlusTcs = 0;
    let p1Passed = 0;

    vTcs.forEach(tc => {
      const prio = (tc.priority || 'P2').toUpperCase();
      if (prio === 'P1') p1Tcs++;
      else if (prio === 'P2') p2Tcs++;
      else p3PlusTcs++;

      if (cycles.length > 0) {
        const res = typeof getTestResultForVersion === 'function'
          ? getTestResultForVersion(p.id, vStr, tc.id)
          : null;
        if (res && (res.status || '').toUpperCase() === 'PASS') {
          if (prio === 'P1') p1Passed++;
        }
      }
    });

    // Lỗi thuộc phiên bản
    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
    const vDefects = allDefects.filter(d => {
      const dv = (d.version || d.detectedInVersion || '').trim().toLowerCase();
      return dv === (vStr || '').trim().toLowerCase();
    });

    let p1Bugs = 0, p2Bugs = 0, p3Bugs = 0, p4Bugs = 0;
    let openBugs = 0, closedBugs = 0;

    vDefects.forEach(d => {
      const isClosed = (d.defectStatus === 'Closed' || d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved');
      const sev = (d.severity || d.priority || 'P3').toUpperCase();

      if (isClosed) {
        closedBugs++;
      } else {
        openBugs++;
        if (sev === 'P1' || sev === 'BLOCKER') p1Bugs++;
        else if (sev === 'P2' || sev === 'CRITICAL') p2Bugs++;
        else if (sev === 'P3' || sev === 'MAJOR') p3Bugs++;
        else p4Bugs++;
      }
    });

    // Quality Gate
    const qg = p.qualityGates || { minPassRate: 95, maxBlockerBugs: 0, maxCriticalBugs: 2 };
    const minPass = qg.minPassRate || 95;
    const maxP1 = qg.maxBlockerBugs ?? 0;
    const maxP2 = qg.maxCriticalBugs ?? 2;

    // Tính chỉ số từ dữ liệu thực — không dùng fallback số cứng
    const passCount = vMetrics.passCount || 0;
    const failCount = vMetrics.failCount || 0;
    const blockCount = vMetrics.blockedCount || 0;
    const executedCount = passCount + failCount + blockCount;
    const passRate = totalTcs > 0 ? Math.round((passCount / totalTcs) * 1000) / 10 : 0;
    const passGap = Math.max(0, Math.round((minPass - passRate) * 10) / 10);
    const execRate = totalTcs > 0 ? Math.round((executedCount / totalTcs) * 100) : 0;
    const untestCount = Math.max(0, totalTcs - executedCount);

    // Helper gán text
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const subEl = document.getElementById('v-overview-version-subtitle');
    if (subEl) subEl.textContent = `Thống kê toàn diện trạng thái kiểm thử của phiên bản ${vStr} trên tất cả các đợt tác chiến`;

    // 1. Điền 4 KPI cốt lõi
    if (totalTcs === 0) {
      setEl('v-kpi-pass-val', '--');
      setEl('v-kpi-pass-sub', `Mục tiêu: ≥ ${minPass}% (Chưa nạp kịch bản)`);
      setEl('v-kpi-exec-val', '0%');
      setEl('v-kpi-exec-sub', 'Chưa có kịch bản trong phiên bản này');
    } else if (cycles.length === 0) {
      setEl('v-kpi-pass-val', '--');
      setEl('v-kpi-pass-sub', `Mục tiêu: ≥ ${minPass}% (Chưa kích hoạt đợt kiểm thử)`);
      setEl('v-kpi-exec-val', '0%');
      setEl('v-kpi-exec-sub', `0 / ${totalTcs} bài đã chạy (${totalTcs} chưa kiểm thử)`);
    } else {
      setEl('v-kpi-pass-val', `${passRate}%`);
      setEl('v-kpi-pass-sub', passGap > 0 ? `Mục tiêu: ≥ ${minPass}% (Thiếu ${passGap}%)` : `🟢 Đã vượt chuẩn cổng nghiệm thu (≥ ${minPass}%)`);
      setEl('v-kpi-exec-val', `${execRate}%`);
      setEl('v-kpi-exec-sub', `${executedCount} / ${totalTcs} bài đã chạy (${untestCount} chưa kiểm thử)`);
    }

    setEl('v-kpi-bugs-val', p1Bugs > 0 ? `${p1Bugs} lỗi P1` : (p2Bugs > 0 ? `${p2Bugs} lỗi P2` : '0 lỗi P1/P2'));
    setEl('v-kpi-bugs-sub', `${p1Bugs} lỗi P1 • ${p2Bugs} lỗi P2 (${p2Bugs <= maxP2 ? 'Trong trần cam kết' : 'Vượt trần cam kết'})`);

    setEl('v-kpi-cycles-val', `${cycles.length} đợt (${activeCycles.length} đang chạy)`);
    setEl('v-kpi-cycles-sub', activeCycles.length > 0 ? activeCycles.map(c => c.name || c.id).join(' • ') : 'Chưa có đợt kiểm thử đang kích hoạt');

    // 2. Điền thanh đo 4 màu & 4 khối kết quả
    const p1Coverage = p1Tcs > 0 ? Math.round((p1Passed / p1Tcs) * 100) : 0;
    setEl('v-summary-p1-cov', `Độ bao phủ P1: ${p1Passed}/${p1Tcs} bài (${p1Coverage}%)`);

    const passPct = totalTcs > 0 ? Math.round((passCount / totalTcs) * 100) : 0;
    const failPct = totalTcs > 0 ? Math.round((failCount / totalTcs) * 100) : 0;
    const blockPct = totalTcs > 0 ? Math.round((blockCount / totalTcs) * 100) : 0;
    const untestPct = totalTcs > 0 ? Math.max(0, 100 - passPct - failPct - blockPct) : 0;

    const setBar = (id, pct, title) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.width = `${pct}%`;
        if (title) el.title = title;
      }
    };
    setBar('v-bar-pass', passPct, `Đạt: ${passCount} bài (${passPct}%)`);
    setBar('v-bar-fail', failPct, `Không đạt: ${failCount} bài (${failPct}%)`);
    setBar('v-bar-block', blockPct, `Bị nghẽn: ${blockCount} bài (${blockPct}%)`);
    setBar('v-bar-untest', untestPct, `Chưa kiểm thử: ${untestCount} bài (${untestPct}%)`);

    setEl('v-stat-pass', `${passCount} (${passPct}%)`);
    setEl('v-stat-fail', `${failCount} (${failPct}%)`);
    setEl('v-stat-block', `${blockCount} (${blockPct}%)`);
    setEl('v-stat-untest', `${untestCount} (${untestPct}%)`);

    // 3. Tóm tắt nhanh các đợt test đang chạy (Active Cycles Quick View)
    const activeCyclesContainer = document.getElementById('v-overview-active-cycles-container');
    if (activeCyclesContainer) {
      if (activeCycles.length === 0) {
        activeCyclesContainer.innerHTML = `
          <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:12.5px; background:var(--bg-surface); border-radius:8px">
            Hiện không có đợt test nào đang trong trạng thái ACTIVE. 
            <button type="button" class="btn btn-outline btn-xs" style="margin-left:8px" onclick="LeadVersion.switchVersionTab('cycles')">Xem danh sách đợt test ➔</button>
          </div>
        `;
      } else {
        activeCyclesContainer.innerHTML = activeCycles.map(c => {
          const cMetrics = typeof getCycleMetrics === 'function' ? getCycleMetrics(c.id) : { totalTcs: 0, assignedCount: 0, passCount: 0, passRate: 0, assignees: [] };
          const baseLink = `projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(vStr)}&cycleId=${encodeURIComponent(c.id)}`;
          return `
            <div style="padding:12px 16px; background:var(--bg-surface); border:1px solid var(--border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">
              <div style="display:flex; align-items:center; gap:12px">
                <div style="width:36px; height:36px; border-radius:8px; background:#2563eb; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px">
                  ${escapeHtml(c.code || c.id.slice(-2))}
                </div>
                <div>
                  <div style="font-weight:800; font-size:13.5px; color:var(--text-primary)">
                    ${escapeHtml(c.name || c.id)}
                  </div>
                  <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px">
                    Phạm vi: <strong>${cMetrics.totalTcs} bài</strong> • Đã giao: <strong>${cMetrics.assignedCount} bài</strong> • Nhân sự: <strong>${cMetrics.assignees.length} kỹ sư</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:16px">
                <div style="width:160px">
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px">
                    <span style="color:#16a34a">${cMetrics.passRate}% đạt</span>
                    <span style="color:var(--text-muted)">${cMetrics.passCount}/${cMetrics.totalTcs}</span>
                  </div>
                  <div style="height:6px; border-radius:3px; background:var(--bg-card); overflow:hidden; display:flex">
                    <div style="width:${cMetrics.passRate}%; background:#16a34a"></div>
                  </div>
                </div>

                <div style="display:flex; gap:6px">
                  <a href="cycle.html?${baseLink}" class="btn btn-primary btn-xs" style="font-weight:700">
                    🚀 Tác chiến
                  </a>
                  <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openCycleStaffingModal('${c.id}')" title="Phân bổ nhân sự cho đợt này">
                    👥 Nhân sự
                  </button>
                  <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openCycleScopeModal('${c.id}')" title="Cấu hình kịch bản">
                    🎯 Phạm vi
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 4. Cập nhật các element động trong mục điểm nghẽn và badge count
    const tcCountBadge = document.getElementById('v-overview-tc-count-badge');
    if (tcCountBadge) tcCountBadge.textContent = totalTcs > 0 ? `(${totalTcs} kịch bản)` : '(0 kịch bản)';

    // Điểm nghẽn P2/P1 bugs
    const p2Status = document.getElementById('v-bn-p2-status');
    const p2Title = document.getElementById('v-bn-p2-title');
    const p2Desc = document.getElementById('v-bn-p2-desc');
    if (p2Status) {
      if (p2Bugs > 0) {
        p2Status.textContent = `${p2Bugs <= maxP2 ? `Chạm trần cam kết (${p2Bugs}/${maxP2})` : `Vượt trần cam kết (${p2Bugs}/${maxP2})`}`;
      } else {
        p2Status.textContent = 'Không có lỗi P2 đang mở';
      }
    }
    if (p2Title) {
      p2Title.textContent = p2Bugs > 0
        ? `${p2Bugs} lỗi nghiêm trọng P2 chưa đóng`
        : p1Bugs > 0 ? `${p1Bugs} lỗi P1 cần xử lý khẩn cấp` : 'Không có lỗi P1/P2 đang mở';
    }
    if (p2Desc) {
      if (p1Bugs > 0 || p2Bugs > 0) {
        p2Desc.textContent = `Hiện có ${p1Bugs} lỗi P1 và ${p2Bugs} lỗi P2 cần đội ngũ kỹ thuật tập trung xử lý.`;
      } else {
        p2Desc.textContent = 'Hệ thống chưa ghi nhận lỗi nghiêm trọng nào chặn tiến độ nghiệm thu.';
      }
    }

    // Điểm nghẽn P1 coverage
    const p1Status = document.getElementById('v-bn-p1-status');
    const p1Title = document.getElementById('v-bn-p1-title');
    const p1Desc = document.getElementById('v-bn-p1-desc');
    const p1NotPassed = Math.max(0, p1Tcs - p1Passed);
    if (p1Status) {
      p1Status.textContent = p1NotPassed > 0 ? `Còn ${p1NotPassed} bài P1 chưa đạt` : (p1Tcs > 0 ? '✅ Tất cả P1 đã đạt' : 'Chưa có kịch bản P1');
    }
    if (p1Title) {
      if (p1Tcs === 0) {
        p1Title.textContent = 'Chưa có kịch bản trọng yếu P1';
      } else if (p1NotPassed > 0) {
        p1Title.textContent = 'Tồn đọng kịch bản trọng yếu P1';
      } else {
        p1Title.textContent = '100% kịch bản P1 đã đạt chuẩn';
      }
    }
    if (p1Desc) {
      if (p1Tcs === 0) {
        p1Desc.textContent = 'Hãy tạo kịch bản kiểm thử và phân loại P1 cho các chức năng trọng yếu.';
      } else if (p1NotPassed > 0) {
        p1Desc.textContent = `Tiêu chuẩn cổng nghiệm thu yêu cầu 100% kịch bản P1 phải đạt (hiện còn ${p1NotPassed} bài).`;
      } else {
        p1Desc.textContent = 'Toàn bộ các kịch bản kiểm thử mức P1 đã được xác minh đạt chuẩn an toàn.';
      }
    }

    // Điểm nghẽn tiến độ đợt kiểm thử
    const cycleDeadline = document.getElementById('v-bn-cycle-deadline');
    const cycleTitle = document.getElementById('v-bn-cycle-title');
    const cycleDesc = document.getElementById('v-bn-cycle-desc');
    if (activeCycles.length > 0) {
      const firstActive = activeCycles[0];
      const firstMets = typeof getCycleMetrics === 'function' ? getCycleMetrics(firstActive.id) : null;
      const cycleTotal = firstMets ? firstMets.totalTcs : 0;
      const unrunCount = firstMets ? Math.max(0, firstMets.totalTcs - firstMets.passCount - firstMets.failCount - firstMets.blockedCount) : 0;

      if (cycleDeadline) {
        cycleDeadline.textContent = firstActive.endDate ? `Hạn chót ${firstActive.endDate}` : (firstActive.timeRange || 'Đang diễn ra');
      }
      if (cycleTitle) {
        if (cycleTotal === 0) {
          cycleTitle.textContent = `${firstActive.name || 'Đợt kiểm thử'} — Chưa có kịch bản`;
        } else if (unrunCount > 0) {
          cycleTitle.textContent = `${firstActive.name || 'Đợt đang chạy'} còn ${unrunCount} bài chưa chạy`;
        } else {
          cycleTitle.textContent = `${firstActive.name || 'Đợt đang chạy'} — Đã hoàn thành 100%`;
        }
      }
      if (cycleDesc) {
        if (cycleTotal === 0) {
          cycleDesc.textContent = 'Đợt kiểm thử đã được kích hoạt nhưng chưa được gán kịch bản kiểm thử vào phạm vi.';
        } else if (unrunCount > 0) {
          cycleDesc.textContent = `Tiến độ thực thi đạt ${firstMets.passRate}%. Cần tiếp tục chạy ${unrunCount} kịch bản để hoàn tất.`;
        } else {
          cycleDesc.textContent = 'Toàn bộ các bài test trong phạm vi đợt này đã được thực thi hoàn tất.';
        }
      }
    } else {
      if (cycleDeadline) cycleDeadline.textContent = 'Chưa có đợt';
      if (cycleTitle) cycleTitle.textContent = 'Chưa có đợt kiểm thử đang hoạt động';
      if (cycleDesc) cycleDesc.textContent = 'Tạo đợt kiểm thử mới để bắt đầu phân công nhân sự và tác chiến.';
    }
  },

  // ==================== TAB 2: QUẢN TRỊ ĐỢT KIỂM THỬ (TEST CYCLES) ====================
  filterCycles() {
    this.renderCycleCards();
    this.renderCyclesMatrix();
  },

  getFilteredCycles() {
    const p = getActiveProject();
    if (!p) return [];

    let cycles = typeof getTestCyclesForProject === 'function' 
      ? getTestCyclesForProject(p.id, this.currentVersion) 
      : [];

    const suiteFilter = document.getElementById('v-cycles-filter-suite')?.value || '';
    const statusFilter = document.getElementById('v-cycles-filter-status')?.value || '';

    if (suiteFilter) {
      cycles = cycles.filter(c => (c.suite || '').toUpperCase() === suiteFilter.toUpperCase());
    }
    if (statusFilter) {
      cycles = cycles.filter(c => {
        const st = (c.status || 'PLANNED').toUpperCase();
        if (statusFilter === 'ACTIVE') return st === 'ACTIVE' || st === 'IN_PROGRESS';
        return st === statusFilter;
      });
    }

    const badge = document.getElementById('v-cycles-count-badge');
    if (badge) badge.textContent = `${cycles.length} đợt kiểm thử`;

    return cycles;
  },

  renderCycleCards() {
    const container = document.getElementById('lead-version-cycles-container');
    if (!container) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = this.getFilteredCycles();

    if (!cycles || cycles.length === 0) {
      container.innerHTML = `
        <div style="padding:48px 24px; text-align:center; background:var(--bg-card); border:1.5px dashed var(--border); border-radius:16px">
          <div style="font-size:36px; margin-bottom:10px">🎯</div>
          <h3 style="margin:0 0 6px 0; color:var(--text-primary); font-size:16px; font-weight:800">
            Không tìm thấy đợt kiểm thử nào phù hợp
          </h3>
          <p style="color:var(--text-muted); font-size:13px; margin:0 0 16px 0">
            Tạo đợt kiểm thử mới để bắt đầu khoanh vùng phạm vi kịch bản và phân công kiểm thử viên.
          </p>
          <button type="button" class="btn btn-primary btn-sm" onclick="LeadVersion.openAddCycleModal()">
            ➕ Tạo đợt kiểm thử mới
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="lead-card-grid">
        ${cycles.map(cyc => {
          const isActive = cyc.status === 'ACTIVE' || cyc.status === 'IN_PROGRESS';
          const isPaused = cyc.status === 'PAUSED';
          const isClosed = cyc.status === 'CLOSED' || cyc.status === 'COMPLETED';

          const cMetrics = typeof getCycleMetrics === 'function' 
            ? getCycleMetrics(cyc.id) 
            : { totalTcs: 0, assignedCount: 0, assignedRate: 0, passCount: 0, failCount: 0, passRate: 0, failRate: 0, untestedRate: 100, assignees: [] };

          let stColor = '#16a34a';
          let stBg = 'rgba(22, 163, 74, 0.12)';
          let stText = '🟢 Đang diễn ra';

          if (isClosed) {
            stColor = '#475569';
            stBg = 'rgba(71, 85, 105, 0.12)';
            stText = '🔒 Đã đóng';
          } else if (isPaused) {
            stColor = '#d97706';
            stBg = 'rgba(217, 119, 6, 0.12)';
            stText = '⏸️ Tạm dừng';
          } else if (cyc.status === 'PLANNED') {
            stColor = '#2563eb';
            stBg = 'rgba(37, 99, 235, 0.12)';
            stText = '⏳ Kế hoạch';
          }

          const baseLink = `projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}&cycleId=${encodeURIComponent(cyc.id)}`;

          return `
            <div class="lead-cycle-card ${isActive ? 'active-cycle' : ''}">
              <div>
                <!-- Card Header -->
                <div class="lead-portfolio-card-head">
                  <div class="lead-portfolio-card-brand">
                    <div class="lead-portfolio-cube" style="background:${isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #64748b, #475569)'}">
                      ${escapeHtml(cyc.code || cyc.id.slice(-2))}
                    </div>
                    <div>
                      <h4 class="lead-portfolio-card-title">${escapeHtml(cyc.name || cyc.id)}</h4>
                      <div class="lead-portfolio-card-meta">
                        <span class="badge badge-info" style="font-size:10.5px; font-weight:800">${escapeHtml(cyc.suite || cyc.code || 'CYCLE')}</span>
                        <span>Thời hạn: <strong>${escapeHtml(cyc.startDate || 'N/A')} ➔ ${escapeHtml(cyc.endDate || 'N/A')}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:6px">
                    <span class="badge" style="background:${stBg}; color:${stColor}; border:1px solid ${stColor}; font-size:10.5px; font-weight:800">
                      ${stText}
                    </span>
                    <button type="button" class="btn btn-outline btn-xs" style="padding:2px 6px" onclick="LeadVersion.openEditCycleModal('${cyc.id}')" title="Sửa thông tin đợt kiểm thử">
                      ✏️
                    </button>
                    <button type="button" class="btn btn-outline btn-xs" style="padding:2px 6px; color:#dc2626; border-color:rgba(220,38,38,0.3)" onclick="LeadVersion.deleteCycle('${cyc.id}')" title="Xóa đợt kiểm thử">
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Mô tả đợt kiểm thử -->
                <p style="margin:12px 0 0 0; font-size:12.5px; color:var(--text-muted); line-height:1.4">
                  ${escapeHtml(cyc.description || 'Đợt kiểm thử tác chiến: giao việc theo phân hệ và đo lường chất lượng.')}
                </p>

                <!-- Thanh đo tiến độ thực thi của đợt kiểm thử -->
                <div class="lead-portfolio-progress-wrap" style="margin-top:14px">
                  <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin-bottom:6px">
                    <span>Tiến độ thực thi đợt kiểm thử</span>
                    <span style="color:#16a34a">${cMetrics.passCount} / ${cMetrics.totalTcs} bài (${cMetrics.passRate}%)</span>
                  </div>
                  <div class="lead-portfolio-progress-bar">
                    <div style="width:${cMetrics.passRate}%; background:#16a34a" title="Đạt: ${cMetrics.passCount} bài"></div>
                    <div style="width:${cMetrics.failRate}%; background:#dc2626" title="Không đạt: ${cMetrics.failCount} bài"></div>
                    <div style="width:${cMetrics.untestedRate}%; background:#e2e8f0" title="Chưa kiểm thử"></div>
                  </div>
                </div>

                <!-- 3 Thống kê cốt lõi -->
                <div class="lead-portfolio-stat-grid" style="margin-top:14px">
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val">${cMetrics.totalTcs}</div>
                    <div class="lead-portfolio-stat-lbl">Phạm vi kịch bản</div>
                  </div>
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val" style="color:#2563eb">${cMetrics.assignedCount}</div>
                    <div class="lead-portfolio-stat-lbl">Đã giao (${cMetrics.assignedRate}%)</div>
                  </div>
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val" style="color:#7c3aed; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="Testers: ${cMetrics.assignees.join(', ')} | Devs: ${(cyc.assignedDevs || cyc.devUsernames || []).join(', ')}">
                      ${cMetrics.assignees.length} Tester • ${(cyc.assignedDevs || cyc.devUsernames || []).length} Dev
                    </div>
                    <div class="lead-portfolio-stat-lbl">Nhân sự thực thi</div>
                  </div>
                </div>
              </div>

              <!-- Thanh hành động tác chiến & Quản trị -->
              <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px">
                <a href="cycle.html?${baseLink}" class="btn-enter-workspace" title="Vào tác chiến điều phối đợt kiểm thử">
                  <span>🚀 Vào tác chiến đợt kiểm thử</span>
                  <span>➔</span>
                </a>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:6px">
                  <button type="button" class="btn btn-outline btn-xs" style="text-align:center; padding:7px 4px; font-weight:700" onclick="LeadVersion.openCycleStaffingModal('${cyc.id}')" title="Phân bổ kỹ sư cho đợt kiểm thử">
                    👥 Nhân sự
                  </button>
                  <button type="button" class="btn btn-outline btn-xs" style="text-align:center; padding:7px 4px; font-weight:700; color:var(--primary)" onclick="LeadVersion.openCycleScopeModal('${cyc.id}')" title="Cấu hình danh mục kịch bản">
                    🎯 Phạm vi
                  </button>
                  <button type="button" class="btn btn-outline btn-xs" style="text-align:center; padding:7px 4px; font-weight:700" onclick="LeadVersion.openCloneCycleModal('${cyc.id}')" title="Nhân bản đợt kiểm thử">
                    📑 Nhân bản
                  </button>
                  <button type="button" class="btn btn-outline btn-xs" style="text-align:center; padding:7px 4px; font-weight:700; color:${isActive ? '#d97706' : '#16a34a'}" onclick="LeadVersion.toggleCycleLock('${cyc.id}')" title="${isActive ? 'Tạm dừng đợt kiểm thử' : 'Kích hoạt đợt kiểm thử'}">
                    ${isActive ? '⏸️ Khóa' : '▶️ Mở'}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderCyclesMatrix() {
    const tbody = document.getElementById('v-cycles-matrix-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = this.getFilteredCycles();

    if (cycles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-muted)">Không tìm thấy đợt kiểm thử nào phù hợp bộ lọc.</td></tr>`;
      return;
    }

    tbody.innerHTML = cycles.map(c => {
      const cMetrics = typeof getCycleMetrics === 'function' ? getCycleMetrics(c.id) : { totalTcs: 0, assignedCount: 0, passCount: 0, passRate: 0, assignees: [] };
      const baseLink = `projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}&cycleId=${encodeURIComponent(c.id)}`;
      const isActive = c.status === 'ACTIVE' || c.status === 'IN_PROGRESS';

      let statusBadgeText = '⏳ Kế hoạch';
      if (isActive) statusBadgeText = '🟢 Đang diễn ra';
      else if (c.status === 'CLOSED' || c.status === 'COMPLETED') statusBadgeText = '🔒 Đã đóng';
      else if (c.status === 'PAUSED') statusBadgeText = '⏸️ Tạm dừng';

      return `
        <tr>
          <td>
            <div style="font-weight:800; font-size:13.5px; color:var(--text-primary)">${escapeHtml(c.name || c.id)}</div>
            <div style="font-size:11px; color:var(--text-muted)">Mã: ${escapeHtml(c.code || c.id)}</div>
          </td>
          <td style="text-align:center">
            <span class="badge badge-info" style="font-size:10.5px">${escapeHtml(c.suite || 'REGRESSION')}</span>
          </td>
          <td style="text-align:center">
            <span class="badge ${isActive ? 'badge-pass' : ''}" style="font-size:10.5px">
              ${statusBadgeText}
            </span>
          </td>
          <td style="text-align:center; font-size:11.5px; color:var(--text-muted)">
            ${escapeHtml(c.startDate || 'N/A')} ➔ ${escapeHtml(c.endDate || 'N/A')}
          </td>
          <td style="text-align:center; font-weight:800">
            ${cMetrics.totalTcs} bài
          </td>
          <td style="text-align:center">
            ${cMetrics.assignedCount} bài (${cMetrics.assignedRate || 0}%)
          </td>
          <td>
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:3px">
              <span style="color:#16a34a">${cMetrics.passRate}% đạt</span>
              <span style="color:var(--text-muted)">${cMetrics.passCount}/${cMetrics.totalTcs}</span>
            </div>
            <div style="height:6px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex">
              <div style="width:${cMetrics.passRate}%; background:#16a34a"></div>
            </div>
          </td>
          <td style="text-align:center; font-size:12px; color:var(--text-secondary)">
            <span title="Testers: ${cMetrics.assignees.join(', ')}">${cMetrics.assignees.length} Tester</span>
            <span style="color:var(--text-muted)"> • </span>
            <span style="color:#0284c7; font-weight:700" title="Developers: ${(c.assignedDevs || c.devUsernames || []).join(', ')}">${(c.assignedDevs || c.devUsernames || []).length} Dev</span>
          </td>
          <td style="text-align:center">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px">
              <a href="cycle.html?${baseLink}" class="btn btn-primary btn-xs" title="Vào tác chiến đợt kiểm thử">🚀 Tác chiến</a>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openCycleStaffingModal('${c.id}')" title="Phân bổ nhân sự">👥</button>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openCycleScopeModal('${c.id}')" title="Cấu hình phạm vi">🎯</button>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openCloneCycleModal('${c.id}')" title="Nhân bản">📑</button>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openEditCycleModal('${c.id}')" title="Sửa">✏️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  switchCyclesSubView(subViewKey) {
    this.cyclesSubView = subViewKey;
    const btnCards = document.getElementById('btn-v-cycles-view-cards');
    const btnMatrix = document.getElementById('btn-v-cycles-view-matrix');
    const paneCards = document.getElementById('v-cycles-subview-cards');
    const paneMatrix = document.getElementById('v-cycles-subview-matrix');

    if (subViewKey === 'matrix') {
      btnCards?.classList.replace('btn-primary', 'btn-outline');
      btnMatrix?.classList.replace('btn-outline', 'btn-primary');
      if (paneCards) paneCards.style.display = 'none';
      if (paneMatrix) paneMatrix.style.display = 'block';
      this.renderCyclesMatrix();
    } else {
      btnMatrix?.classList.replace('btn-primary', 'btn-outline');
      btnCards?.classList.replace('btn-outline', 'btn-primary');
      if (paneMatrix) paneMatrix.style.display = 'none';
      if (paneCards) paneCards.style.display = 'block';
      this.renderCycleCards();
    }
  },

  toggleCycleLock(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId);
    if (!c) return;

    const isCurrentlyActive = c.status === 'ACTIVE' || c.status === 'IN_PROGRESS';
    c.status = isCurrentlyActive ? 'PAUSED' : 'ACTIVE';

    if (state.testCycles) {
      const cs = state.testCycles.find(x => x.id === cycleId);
      if (cs) cs.status = c.status;
    }

    saveCoreState();
    showToast(`Đã ${c.status === 'ACTIVE' ? 'kích hoạt' : 'tạm dừng'} đợt kiểm thử [${c.name}]!`, 'info');
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderVersionOverview();
  },

  openCloneCycleModal(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId);
    if (!c) return;

    document.getElementById('mcc-source-id').value = c.id;
    document.getElementById('mcc-source-name').value = `${c.name} (${c.code || c.id})`;
    document.getElementById('mcc-target-code').value = `ROUND-${cycles.length + 1}`;
    document.getElementById('mcc-target-name').value = `Đợt ${cycles.length + 1} — Kiểm thử ${c.suite || 'Hồi quy'} (Bản sao từ ${c.code || 'đợt trước'})`;
    document.getElementById('mcc-target-suite').value = c.suite || 'REGRESSION';

    openModal('modal-clone-cycle');
  },

  confirmCloneCycle() {
    const p = getActiveProject();
    if (!p) return;

    const sourceId = document.getElementById('mcc-source-id').value;
    const code = (document.getElementById('mcc-target-code').value || '').trim();
    const name = (document.getElementById('mcc-target-name').value || '').trim();
    const suite = document.getElementById('mcc-target-suite').value || 'REGRESSION';

    const optScope = document.getElementById('mcc-opt-scope')?.checked ?? true;
    const optFailedOnly = document.getElementById('mcc-opt-failed-only')?.checked ?? false;
    const optStaff = document.getElementById('mcc-opt-staff')?.checked ?? true;

    if (!code || !name) {
      showToast('⚠️ Vui lòng nhập mã và tên đợt kiểm thử mới!', 'error');
      return;
    }

    const sourceCycle = (p.testCycles || []).find(c => c.id === sourceId);
    if (!sourceCycle) return;

    const cleanPrj = (p.code || p.id || 'PRJ').replace('PRJ-', '').toUpperCase();
    const cleanVer = this.currentVersion.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const newCycleId = `CYC-${cleanPrj}-${cleanVer}-${Date.now().toString().slice(-4)}`;

    // Tính toán scope
    let newScopeIds = [];
    if (optScope) {
      let baseScope = Array.isArray(sourceCycle.scopeTcIds) ? [...sourceCycle.scopeTcIds] : [];
      if (baseScope.length === 0) {
        const vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
        baseScope = vTcs.map(t => t.id);
      }

      if (optFailedOnly) {
        const results = state.results || {};
        newScopeIds = baseScope.filter(tcId => {
          const res = results[tcId];
          return res && (res.status || '').toUpperCase().includes('FAIL');
        });
      } else {
        newScopeIds = baseScope;
      }
    }

    const newCycle = {
      id: newCycleId,
      projectId: p.id,
      code,
      name,
      version: this.currentVersion,
      suite,
      status: 'ACTIVE',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      description: `Đợt kiểm thử nhân bản từ [${sourceCycle.name}]. Phạm vi: ${newScopeIds.length} kịch bản.`,
      scopeTcIds: newScopeIds
    };

    if (!p.testCycles) p.testCycles = [];
    p.testCycles.push(newCycle);
    if (!state.testCycles) state.testCycles = [];
    state.testCycles.push(newCycle);

    // Kế thừa phân công nhân sự nếu chọn
    if (optStaff && state.assignments) {
      const sourceAsgs = state.assignments.filter(a => a.cycleId === sourceId || a.projectId === p.id);
      const uniqueAssignees = new Map();
      sourceAsgs.forEach(a => {
        if (!uniqueAssignees.has(a.assigneeUsername || a.username)) {
          uniqueAssignees.set(a.assigneeUsername || a.username, a);
        }
      });

      // Tự động chia bài trong newScopeIds cho các tester này
      const testers = Array.from(uniqueAssignees.keys());
      if (testers.length > 0 && newScopeIds.length > 0) {
        newScopeIds.forEach((tcId, idx) => {
          const targetTester = testers[idx % testers.length];
          state.assignments.push({
            id: `ASG-${Date.now()}-${idx}`,
            projectId: p.id,
            version: this.currentVersion,
            cycleId: newCycleId,
            testCaseId: tcId,
            assigneeUsername: targetTester,
            username: targetTester,
            status: 'ASSIGNED',
            assignedDate: new Date().toISOString()
          });
        });
      }
    }

    saveCoreState();
    closeModal('modal-clone-cycle');
    showToast(`🎉 Đã nhân bản thành công đợt kiểm thử [${name}]!`, 'success');
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderVersionOverview();
  },

  // ==================== TAB 3: KỊCH BẢN & PHÂN HỆ (MODULE TREE EXPLORER) ====================
  renderModuleTree() {
    const treeContainer = document.getElementById('v-scope-modules-tree');
    if (!treeContainer) return;

    const p = getActiveProject();
    if (!p) return;

    const vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
    const results = state.results || {};

    const modMap = new Map();
    vTcs.forEach(tc => {
      const mId = tc.moduleId || tc.module || 'M01';
      const mName = tc.moduleName || tc.module || mId;
      if (!modMap.has(mId)) {
        modMap.set(mId, { id: mId, name: mName, total: 0, passed: 0, failed: 0 });
      }
      const item = modMap.get(mId);
      item.total++;

      const res = results[tc.id];
      if (res) {
        const st = (res.status || '').toUpperCase();
        if (st === 'PASS') item.passed++;
        else if (st === 'FAIL') item.failed++;
      }
    });

    const modules = Array.from(modMap.values());
    const totalTcs = vTcs.length;

    let treeHtml = `
      <div class="v-tree-item ${this.selectedTreeModuleId === '' ? 'active' : ''}" onclick="LeadVersion.selectTreeModule('')">
        <div style="display:flex; align-items:center; gap:8px">
          <span>📦</span>
          <span style="font-weight:700; font-size:12.5px">Tất Cả Kịch Bản</span>
        </div>
        <span class="badge badge-info" style="font-size:10px">${totalTcs}</span>
      </div>
    `;

    modules.forEach(m => {
      const isSel = this.selectedTreeModuleId === m.id;
      treeHtml += `
        <div class="v-tree-item ${isSel ? 'active' : ''}" onclick="LeadVersion.selectTreeModule('${escapeHtml(m.id)}')">
          <div style="display:flex; align-items:center; gap:8px; overflow:hidden">
            <span style="font-size:13px">📁</span>
            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
              <span style="font-weight:700; font-size:12px; color:var(--text-primary)">${escapeHtml(m.id)}</span>
              <span style="font-size:11.5px; color:var(--text-secondary); margin-left:4px">${escapeHtml(m.name)}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0">
            ${m.failed > 0 ? `<span class="badge badge-fail" style="font-size:9.5px; padding:1px 5px">${m.failed}F</span>` : ''}
            <span class="badge badge-info" style="font-size:10px">${m.total}</span>
          </div>
        </div>
      `;
    });

    treeContainer.innerHTML = treeHtml;
  },

  filterModuleTree() {
    const q = (document.getElementById('v-module-search')?.value || '').toLowerCase().trim();
    const items = document.querySelectorAll('#v-scope-modules-tree .v-tree-item');
    items.forEach(it => {
      const txt = it.textContent.toLowerCase();
      it.style.display = (!q || txt.includes(q)) ? 'flex' : 'none';
    });
  },

  selectTreeModule(moduleId) {
    this.selectedTreeModuleId = moduleId;
    this.renderModuleTree();

    const titleEl = document.getElementById('v-scope-selected-module-title');
    if (titleEl) {
      if (!moduleId) {
        titleEl.textContent = '📦 Tất Cả Kịch Bản';
      } else {
        const p = getActiveProject();
        const vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.currentVersion) : [];
        const found = vTcs.find(t => (t.moduleId || t.module) === moduleId);
        titleEl.textContent = `📁 Phân Hệ ${moduleId}: ${found?.moduleName || moduleId}`;
      }
    }

    this.renderScopeTestCases();
  },

  renderScopeTestCases() {
    const tbody = document.getElementById('v-scope-tcs-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    if (!p) return;

    let vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];

    // Lọc theo module trên cây nếu có chọn
    if (this.selectedTreeModuleId) {
      vTcs = vTcs.filter(t => (t.moduleId || t.module) === this.selectedTreeModuleId);
    }

    const countEl = document.getElementById('v-scope-selected-count');
    if (countEl) countEl.textContent = `${vTcs.length} Kịch bản`;

    const q = (document.getElementById('v-scope-search')?.value || '').toLowerCase().trim();
    const prio = document.getElementById('v-scope-filter-prio')?.value || '';
    const st = document.getElementById('v-scope-filter-status')?.value || '';

    const results = state.results || {};

    let filtered = vTcs.filter(tc => {
      const matchQ = !q || (tc.id || '').toLowerCase().includes(q) || (tc.title || '').toLowerCase().includes(q) || (tc.name || '').toLowerCase().includes(q);
      const matchPrio = !prio || (tc.priority || '').toUpperCase() === prio.toUpperCase();
      const res = results[tc.id];
      const curStatus = (res?.status || 'UNTESTED').toUpperCase();
      const matchStatus = !st || curStatus === st;
      return matchQ && matchPrio && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted)">Không tìm thấy kịch bản nào phù hợp.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(tc => {
      const isChecked = this.batchSelectedTcIds.has(tc.id);
      const res = results[tc.id];
      const statusStr = (res?.status || 'UNTESTED').toUpperCase();

      let stBadge = '<span class="badge" style="background:#f1f5f9; color:#64748b; font-size:10.5px">⚪ Chưa kiểm thử</span>';
      if (statusStr === 'PASS') stBadge = '<span class="badge badge-pass" style="font-size:10.5px">🟢 Đạt</span>';
      else if (statusStr === 'FAIL') stBadge = '<span class="badge badge-fail" style="font-size:10.5px">🔴 Không đạt</span>';
      else if (statusStr === 'BLOCKED') stBadge = '<span class="badge" style="background:#fef3c7; color:#b45309; font-size:10.5px">🟡 Bị nghẽn</span>';

      const prioVal = (tc.priority || 'P2').toUpperCase();
      let prioBadge = `<span class="badge badge-info" style="font-size:10.5px">${prioVal}</span>`;
      if (prioVal === 'P1') prioBadge = `<span class="badge badge-fail" style="font-size:10.5px; font-weight:800">P1 - Khẩn cấp</span>`;
      else if (prioVal === 'P2') prioBadge = `<span class="badge" style="background:#ffedd5; color:#c2410c; font-size:10.5px; font-weight:800">P2 - Cao</span>`;

      return `
        <tr style="background:${isChecked ? 'rgba(37,99,235,0.04)' : 'transparent'}">
          <td style="text-align:center">
            <input type="checkbox" class="v-scope-tc-cb" value="${escapeHtml(tc.id)}" ${isChecked ? 'checked' : ''} onchange="LeadVersion.onTestCaseCheckChange(this)" style="cursor:pointer" />
          </td>
          <td style="font-weight:800; color:#2563eb; font-size:12px">${escapeHtml(tc.id)}</td>
          <td>
            <div style="font-weight:700; color:var(--text-primary); font-size:13px">${escapeHtml(tc.title || tc.name || '')}</div>
            <div style="font-size:11px; color:var(--text-muted); line-height:1.3">${escapeHtml(tc.description || '')}</div>
          </td>
          <td>
            <span class="badge badge-info" style="font-size:10.5px">${escapeHtml(tc.module || tc.moduleId || 'M01')}</span>
          </td>
          <td style="text-align:center">${prioBadge}</td>
          <td style="text-align:center; font-size:11.5px; color:var(--text-secondary)">
            ${escapeHtml(tc.cycle || 'Toàn bản')}
          </td>
          <td style="text-align:center">${stBadge}</td>
          <td style="text-align:center">
            <div style="display:flex; align-items:center; justify-content:center; gap:4px">
              <a href="testcases.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}&tcId=${encodeURIComponent(tc.id)}" class="btn btn-outline btn-xs" title="Xem chi tiết kịch bản">
                👁️ Xem
              </a>
              <button type="button" class="btn btn-outline btn-xs" style="color:#dc2626; border-color:rgba(220,38,38,0.3)" onclick="LeadVersion.deleteTestCase('${escapeHtml(tc.id)}')" title="Xóa kịch bản kiểm thử">
                🗑️ Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterScopeTestCases() {
    this.renderScopeTestCases();
  },

  filterP1Scope() {
    this.switchVersionTab('scope');
    const prioSelect = document.getElementById('v-scope-filter-prio');
    if (prioSelect) prioSelect.value = 'P1';
    this.renderScopeTestCases();
  },

  // Batch Selection Handlers
  onTestCaseCheckChange(input) {
    if (input.checked) {
      this.batchSelectedTcIds.add(input.value);
    } else {
      this.batchSelectedTcIds.delete(input.value);
    }
    this.updateBatchBar();
  },

  toggleCheckAllTestCases(isChecked) {
    const cbs = document.querySelectorAll('.v-scope-tc-cb');
    cbs.forEach(cb => {
      cb.checked = isChecked;
      if (isChecked) this.batchSelectedTcIds.add(cb.value);
      else this.batchSelectedTcIds.delete(cb.value);
    });
    this.updateBatchBar();
  },

  updateBatchBar() {
    const bar = document.getElementById('v-scope-batch-bar');
    const countEl = document.getElementById('v-scope-batch-count');
    const sz = this.batchSelectedTcIds.size;

    if (bar && countEl) {
      if (sz > 0) {
        bar.style.display = 'flex';
        countEl.textContent = `Đã chọn ${sz} kịch bản kiểm thử`;
      } else {
        bar.style.display = 'none';
      }
    }
  },

  clearBatchSelection() {
    this.batchSelectedTcIds.clear();
    const masterCb = document.getElementById('v-scope-check-all');
    if (masterCb) masterCb.checked = false;
    this.renderScopeTestCases();
    this.updateBatchBar();
  },

  /**
   * Xóa một kịch bản kiểm thử khỏi phiên bản & dự án
   */
  deleteTestCase(tcId) {
    if (!tcId) return;
    const p = getActiveProject();
    if (!p) return;

    const tc = (p.testCases || []).find(t => t.id === tcId);
    const tcTitle = tc ? (tc.title || tc.name || tc.id) : tcId;

    if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn kịch bản [${tcId}] — "${tcTitle}" khỏi dự án?\n\nToàn bộ phân công và kết quả liên quan đến kịch bản này cũng sẽ được dọn dẹp sạch sẽ.`)) {
      return;
    }

    // 1. Xóa khỏi p.testCases
    p.testCases = (p.testCases || []).filter(t => t.id !== tcId);

    // 2. Dọn dẹp phân công liên quan
    if (Array.isArray(state.assignments)) {
      state.assignments = state.assignments.filter(a => a.tcId !== tcId);
    }

    // 3. Dọn dẹp kết quả liên quan
    if (state.results && state.results[tcId]) {
      delete state.results[tcId];
    }
    if (state.cycleResults) {
      Object.keys(state.cycleResults).forEach(key => {
        if (key.startsWith(`${tcId}_`) || key.includes(`_${tcId}_`)) {
          delete state.cycleResults[key];
        }
      });
    }

    // 4. Dọn dẹp khỏi phạm vi các đợt test
    (p.testCycles || []).forEach(c => {
      if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => id !== tcId);
      if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => id !== tcId);
    });
    (state.testCycles || []).forEach(c => {
      if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => id !== tcId);
      if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => id !== tcId);
    });

    this.batchSelectedTcIds.delete(tcId);

    // 5. Lưu trạng thái bền vững và đồng bộ lên server & cloud
    saveCoreState();
    if (typeof syncProjectsToLanServer === 'function') {
      syncProjectsToLanServer(state.projects);
    }
    if (typeof pushProjectsToCloud === 'function') {
      pushProjectsToCloud(state.projects);
    }

    showToast(`🗑️ Đã xóa thành công kịch bản [${tcId}]!`, 'success');

    // 6. Cập nhật lại giao diện
    this.renderScopeTestCases();
    this.renderModuleTree();
    this.renderVersionOverview();
    this.updateBatchBar();
  },

  /**
   * Xóa hàng loạt kịch bản kiểm thử đã chọn
   */
  batchDeleteTestCases() {
    const ids = Array.from(this.batchSelectedTcIds);
    if (ids.length === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất một kịch bản để xóa!', 'warning');
      return;
    }

    const p = getActiveProject();
    if (!p) return;

    if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn ${ids.length} kịch bản đã chọn khỏi dự án?\n\nThao tác này sẽ dọn dẹp toàn bộ dữ liệu phân công và kết quả liên quan.`)) {
      return;
    }

    const idSet = new Set(ids);

    // 1. Xóa khỏi p.testCases
    p.testCases = (p.testCases || []).filter(t => !idSet.has(t.id));

    // 2. Dọn dẹp phân công
    if (Array.isArray(state.assignments)) {
      state.assignments = state.assignments.filter(a => !idSet.has(a.tcId));
    }

    // 3. Dọn dẹp kết quả
    if (state.results) {
      ids.forEach(id => delete state.results[id]);
    }
    if (state.cycleResults) {
      Object.keys(state.cycleResults).forEach(key => {
        ids.forEach(id => {
          if (key.startsWith(`${id}_`) || key.includes(`_${id}_`)) {
            delete state.cycleResults[key];
          }
        });
      });
    }

    // 4. Dọn dẹp phạm vi đợt test
    (p.testCycles || []).forEach(c => {
      if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => !idSet.has(id));
      if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => !idSet.has(id));
    });
    (state.testCycles || []).forEach(c => {
      if (Array.isArray(c.scopeTcIds)) c.scopeTcIds = c.scopeTcIds.filter(id => !idSet.has(id));
      if (Array.isArray(c.testCaseIds)) c.testCaseIds = c.testCaseIds.filter(id => !idSet.has(id));
    });

    this.clearBatchSelection();

    saveCoreState();
    if (typeof syncProjectsToLanServer === 'function') {
      syncProjectsToLanServer(state.projects);
    }
    if (typeof pushProjectsToCloud === 'function') {
      pushProjectsToCloud(state.projects);
    }

    showToast(`🗑️ Đã xóa thành công ${ids.length} kịch bản kiểm thử!`, 'success');

    this.renderScopeTestCases();
    this.renderModuleTree();
    this.renderVersionOverview();
  },

  openBatchAssignCycleModal() {
    if (this.batchSelectedTcIds.size === 0) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const select = document.getElementById('mbac-target-cycle');
    if (select) {
      select.innerHTML = cycles.map(c => `
        <option value="${c.id}">${escapeHtml(c.name)} (${c.code || c.id})</option>
      `).join('');
    }

    const info = document.getElementById('mbac-count-info');
    if (info) info.textContent = `Đang chọn ${this.batchSelectedTcIds.size} kịch bản kiểm thử để đưa vào đợt test.`;

    openModal('modal-batch-assign-cycle');
  },

  confirmBatchAssignCycle() {
    const cycleId = document.getElementById('mbac-target-cycle')?.value;
    if (!cycleId) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId);
    if (!c) return;

    if (!Array.isArray(c.scopeTcIds)) c.scopeTcIds = [];
    const addedCount = [];
    this.batchSelectedTcIds.forEach(id => {
      if (!c.scopeTcIds.includes(id)) {
        c.scopeTcIds.push(id);
        addedCount.push(id);
      }
    });

    saveCoreState();
    closeModal('modal-batch-assign-cycle');
    showToast(`✅ Đã thêm ${addedCount.length} kịch bản vào đợt kiểm thử [${c.name}]!`, 'success');
    this.clearBatchSelection();
    this.renderCycleCards();
    this.renderCyclesMatrix();
  },

  openBatchAssignTesterModal() {
    if (this.batchSelectedTcIds.size === 0) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);

    const cycleSelect = document.getElementById('mbat-target-cycle');
    if (cycleSelect) {
      cycleSelect.innerHTML = cycles.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }

    const testerSelect = document.getElementById('mbat-target-tester');
    if (testerSelect) {
      testerSelect.innerHTML = members.map(m => `<option value="${m.username}">${escapeHtml(m.name || m.username)} (@${m.username})</option>`).join('');
    }

    const info = document.getElementById('mbat-count-info');
    if (info) info.textContent = `Đang chọn ${this.batchSelectedTcIds.size} kịch bản để phân công trực tiếp.`;

    openModal('modal-batch-assign-tester');
  },

  confirmBatchAssignTester() {
    const cycleId = document.getElementById('mbat-target-cycle')?.value;
    const tester = document.getElementById('mbat-target-tester')?.value;
    if (!cycleId || !tester) return;

    const p = getActiveProject();
    if (!p) return;

    if (!state.assignments) state.assignments = [];

    this.batchSelectedTcIds.forEach(tcId => {
      // Xóa assignment cũ của bài này trong cycle nếu có
      state.assignments = state.assignments.filter(a => !(a.cycleId === cycleId && a.testCaseId === tcId));
      state.assignments.push({
        id: `ASG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        projectId: p.id,
        version: this.currentVersion,
        cycleId,
        testCaseId: tcId,
        assigneeUsername: tester,
        username: tester,
        status: 'ASSIGNED',
        assignedDate: new Date().toISOString()
      });
    });

    saveCoreState();
    closeModal('modal-batch-assign-tester');
    showToast(`✅ Đã phân công ${this.batchSelectedTcIds.size} kịch bản cho kỹ sư @${tester}!`, 'success');
    this.clearBatchSelection();
    this.renderVersionRoster();
  },

  // ==================== TAB 4: QUẢN TRỊ NHÂN SỰ & ĐIỀU PHỐI ĐỢT TEST (CYCLE STAFFING CENTER) ====================
  // ==================== TAB 4: QUẢN TRỊ NHÂN LỰC PHIÊN BẢN (VERSION WORKFORCE & STAFFING COMMAND CENTER) ====================

  // Phân khu 1: KPI Cockpit — Sức khỏe & Tải trọng nhân lực toàn phiên bản
  renderVersionWorkforceKPIs() {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const verTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : (p.testCases || []);
    const allTesters = this.getProjectTestersList();
    const allDevs = this.getProjectDevsList();
    const assignments = (state.assignments || []).filter(a => a.projectId === p.id && cycles.some(c => c.id === a.cycleId));

    // 1. Headcount & Huy động
    const activeTesterSet = new Set();
    const activeDevSet = new Set();
    cycles.forEach(c => {
      (c.assignedTesters || c.testerUsernames || []).forEach(u => activeTesterSet.add(u));
      (c.assignedDevs || c.devUsernames || []).forEach(u => activeDevSet.add(u));
    });
    assignments.forEach(a => {
      if (a.assigneeUsername) activeTesterSet.add(a.assigneeUsername);
    });

    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
    const verDefects = allDefects.filter(d => (d.version || d.detectedInVersion || '').trim().toLowerCase() === (this.currentVersion || '').trim().toLowerCase());
    verDefects.forEach(d => {
      if (d.assignedDev) activeDevSet.add(d.assignedDev);
    });

    const totalStaffPool = allTesters.length + allDevs.length;
    const mobilizedStaff = activeTesterSet.size + activeDevSet.size;
    const mobRate = totalStaffPool > 0 ? Math.round((mobilizedStaff / totalStaffPool) * 100) : 0;

    const elHead = document.getElementById('v-wf-kpi-headcount');
    if (elHead) elHead.textContent = `${activeTesterSet.size} Tester • ${activeDevSet.size} Dev`;
    const elHeadSub = document.getElementById('v-wf-kpi-headcount-sub');
    if (elHeadSub) elHeadSub.textContent = `Huy động: ${mobRate}% nhân lực dự án (${mobilizedStaff}/${totalStaffPool})`;

    // 2. Phạm vi kịch bản & Đã giao
    const assignedTcIds = new Set(assignments.map(a => a.testCaseId || a.tcId).filter(Boolean));
    const totalTcs = verTcs.length;
    const assignedCount = verTcs.filter(t => assignedTcIds.has(t.id)).length;
    const assignedPct = totalTcs > 0 ? Math.round((assignedCount / totalTcs) * 100) : 0;
    const unassignedCount = Math.max(0, totalTcs - assignedCount);

    const elWork = document.getElementById('v-wf-kpi-workload');
    if (elWork) elWork.textContent = `${assignedCount} / ${totalTcs} bài (${assignedPct}%)`;
    const elWorkSub = document.getElementById('v-wf-kpi-workload-sub');
    if (elWorkSub) elWorkSub.textContent = unassignedCount === 0 ? '🟢 100% kịch bản đã có người phụ trách' : `Còn tồn: ${unassignedCount} bài chưa giao`;

    // 3. Cân bằng tải trọng
    const avgLoad = activeTesterSet.size > 0 ? Math.round(assignedCount / activeTesterSet.size) : 0;
    let overloadedCount = 0;
    let idleCount = 0;
    allTesters.forEach(u => {
      const userAsgCount = assignments.filter(a => (a.assigneeUsername === u.username || a.username === u.username)).length;
      if (userAsgCount === 0) idleCount++;
      else if (avgLoad > 0 && userAsgCount > avgLoad * 1.25) overloadedCount++;
    });

    const elBal = document.getElementById('v-wf-kpi-balance');
    if (elBal) elBal.textContent = `~${avgLoad} bài / Tester`;
    const elBalSub = document.getElementById('v-wf-kpi-balance-sub');
    if (elBalSub) {
      if (overloadedCount === 0 && idleCount === 0) {
        elBalSub.textContent = '🟢 Tải trọng phân bổ rất cân bằng';
      } else {
        elBalSub.textContent = `${overloadedCount} quá tải • ${idleCount} chưa có việc`;
      }
    }

    // 4. Vận tốc & Đóng góp chất lượng
    const allResults = state.results || {};
    let executedTcs = 0;
    verTcs.forEach(t => {
      const res = allResults[t.id];
      if (res && res.status && res.status.toUpperCase() !== 'UNTESTED') executedTcs++;
    });
    const execRate = totalTcs > 0 ? Math.round((executedTcs / totalTcs) * 100) : 0;
    const closedDefects = verDefects.filter(d => ['Closed', 'Fixed', 'Resolved'].includes(d.defectStatus)).length;

    const elVel = document.getElementById('v-wf-kpi-velocity');
    if (elVel) elVel.textContent = `${execRate}% hoàn thành (${executedTcs}/${totalTcs})`;
    const elVelSub = document.getElementById('v-wf-kpi-velocity-sub');
    if (elVelSub) elVelSub.textContent = `${verDefects.length} lỗi phát hiện • ${closedDefects} đã sửa`;
  },

  // Phân khu 2: Ma trận phân bổ nhân sự xuyên đợt kiểm thử (Cross-Cycle Staffing Matrix)
  renderStaffingMatrix() {
    const thead = document.getElementById('v-staffing-matrix-thead');
    const tbody = document.getElementById('v-staffing-matrix-tbody');
    if (!thead || !tbody) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const allTesters = this.getProjectTestersList();
    const allDevs = this.getProjectDevsList();
    const assignments = (state.assignments || []).filter(a => a.projectId === p.id);
    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];

    // Header Ma trận
    let headHtml = `
      <tr>
        <th style="min-width:220px">Thành viên & Chức danh</th>
    `;
    cycles.forEach(c => {
      headHtml += `
        <th style="text-align:center; min-width:140px">
          <div>${escapeHtml(c.name || c.id)}</div>
          <div style="font-size:10px; font-weight:600; color:var(--text-muted)">(${escapeHtml(c.code || c.id)})</div>
        </th>
      `;
    });
    headHtml += `
        <th style="text-align:center; min-width:120px">Tổng bài đã giao</th>
        <th style="text-align:center; min-width:120px">Đánh giá tải</th>
      </tr>
    `;
    thead.innerHTML = headHtml;

    // Body Ma trận
    let bodyHtml = '';

    // KHỐI 1: TESTERS
    bodyHtml += `
      <tr style="background:rgba(37,99,235,0.06); border-top:1.5px solid rgba(37,99,235,0.2)">
        <td colspan="${cycles.length + 3}" style="padding:8px 14px; font-weight:800; color:#2563eb; font-size:12px">
          👥 1. ĐỘI NGŨ KIỂM THỬ VIÊN (TESTERS — THỰC THI KỊCH BẢN) (${allTesters.length} kỹ sư)
        </td>
      </tr>
    `;

    if (allTesters.length === 0) {
      bodyHtml += `<tr><td colspan="${cycles.length + 3}" style="text-align:center; padding:12px; color:var(--text-muted); font-size:12px">Chưa có kiểm thử viên nào trong dự án.</td></tr>`;
    } else {
      allTesters.forEach(u => {
        const userAsgs = assignments.filter(a => (a.assigneeUsername === u.username || a.username === u.username) && cycles.some(c => c.id === a.cycleId));
        const totalUserTcs = userAsgs.length;

        bodyHtml += `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px">
                <div style="width:32px; height:32px; border-radius:50%; background:#2563eb; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12.5px; flex-shrink:0">
                  ${(u.name || u.username || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style="font-weight:700; font-size:13px; color:var(--text-primary)">${escapeHtml(u.name || u.username)}</div>
                  <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(u.username)} • ${escapeHtml((u.roleTitle || 'Tester').replace(/\s*\([^)]*\)/g, ''))}</div>
                </div>
              </div>
            </td>
        `;

        cycles.forEach(c => {
          const isAssigned = (c.assignedTesters || c.testerUsernames || []).includes(u.username);
          const cAsgCount = assignments.filter(a => a.cycleId === c.id && (a.assigneeUsername === u.username || a.username === u.username)).length;

          bodyHtml += `
            <td style="text-align:center; vertical-align:middle; background:${isAssigned ? 'rgba(37,99,235,0.02)' : 'transparent'}">
              <label style="cursor:pointer; display:inline-flex; flex-direction:column; align-items:center; gap:3px" title="Bật/Tắt phân bổ @${u.username} vào đợt [${c.name || c.id}]">
                <input type="checkbox" ${isAssigned ? 'checked' : ''} onchange="LeadVersion.toggleMatrixStaffing('${c.id}', '${u.username}', 'tester', this.checked)" style="width:16px; height:16px; cursor:pointer" />
                ${isAssigned ? `
                  <span class="badge ${cAsgCount > 0 ? 'badge-pass' : 'badge-outline'}" style="font-size:10px; font-weight:700">
                    ${cAsgCount > 0 ? `${cAsgCount} bài` : 'Đã gán'}
                  </span>
                ` : `
                  <span style="font-size:11px; color:var(--text-muted)">⚪</span>
                `}
              </label>
            </td>
          `;
        });

        // Đánh giá tải
        let loadBadge = `<span class="badge badge-outline" style="font-size:10.5px">⚪ Chưa giao</span>`;
        if (totalUserTcs > 50) {
          loadBadge = `<span class="badge badge-fail" style="font-size:10.5px">🔴 Tải cao</span>`;
        } else if (totalUserTcs > 0) {
          loadBadge = `<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-size:10.5px">🟢 Cân bằng</span>`;
        }

        bodyHtml += `
            <td style="text-align:center; font-weight:800; font-size:13px; color:#2563eb">
              ${totalUserTcs} bài
            </td>
            <td style="text-align:center">
              ${loadBadge}
            </td>
          </tr>
        `;
      });
    }

    // KHỐI 2: DEVELOPERS
    bodyHtml += `
      <tr style="background:rgba(16,185,129,0.06); border-top:1.5px solid rgba(16,185,129,0.2)">
        <td colspan="${cycles.length + 3}" style="padding:8px 14px; font-weight:800; color:#10b981; font-size:12px">
          💻 2. LẬP TRÌNH VIÊN PHỤ TRÁCH (DEVELOPERS — TRỰC CHIẾN KHẮC PHỤC LỖI) (${allDevs.length} kỹ sư)
        </td>
      </tr>
    `;

    if (allDevs.length === 0) {
      bodyHtml += `<tr><td colspan="${cycles.length + 3}" style="text-align:center; padding:12px; color:var(--text-muted); font-size:12px">Chưa có lập trình viên nào trong dự án.</td></tr>`;
    } else {
      allDevs.forEach(u => {
        const devCyclesCount = cycles.filter(c => (c.assignedDevs || c.devUsernames || []).includes(u.username)).length;

        bodyHtml += `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px">
                <div style="width:32px; height:32px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12.5px; flex-shrink:0">
                  ${(u.name || u.username || 'D').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style="font-weight:700; font-size:13px; color:var(--text-primary)">${escapeHtml(u.name || u.username)}</div>
                  <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(u.username)} • ${escapeHtml((u.roleTitle || 'Developer').replace(/\s*\([^)]*\)/g, ''))}</div>
                </div>
              </div>
            </td>
        `;

        cycles.forEach(c => {
          const isDevAssigned = (c.assignedDevs || c.devUsernames || []).includes(u.username);
          bodyHtml += `
            <td style="text-align:center; vertical-align:middle; background:${isDevAssigned ? 'rgba(16,185,129,0.02)' : 'transparent'}">
              <label style="cursor:pointer; display:inline-flex; flex-direction:column; align-items:center; gap:3px" title="Bật/Tắt phân bổ @${u.username} trực chiến sửa lỗi đợt [${c.name || c.id}]">
                <input type="checkbox" ${isDevAssigned ? 'checked' : ''} onchange="LeadVersion.toggleMatrixStaffing('${c.id}', '${u.username}', 'dev', this.checked)" style="width:16px; height:16px; cursor:pointer" />
                ${isDevAssigned ? `
                  <span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-size:9.5px; font-weight:700">
                    💻 Trực chiến
                  </span>
                ` : `
                  <span style="font-size:11px; color:var(--text-muted)">⚪</span>
                `}
              </label>
            </td>
          `;
        });

        bodyHtml += `
            <td style="text-align:center; font-weight:700; font-size:12.5px; color:#10b981">
              ${devCyclesCount} / ${cycles.length} đợt
            </td>
            <td style="text-align:center">
              <span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #86efac; font-size:10.5px">
                ${devCyclesCount > 0 ? '🟢 Sẵn sàng trực' : '⚪ Chưa gán'}
              </span>
            </td>
          </tr>
        `;
      });
    }

    tbody.innerHTML = bodyHtml;

    // Cập nhật badges
    const badgeCyc = document.getElementById('v-matrix-cycles-count-badge');
    if (badgeCyc) badgeCyc.textContent = `${cycles.length} đợt test`;
    const badgeStaff = document.getElementById('v-matrix-staff-count-badge');
    if (badgeStaff) badgeStaff.textContent = `${allTesters.length} Tester • ${allDevs.length} Dev`;
  },

  // Thao tác bật/tắt nhanh phân bổ trực tiếp trên ma trận
  toggleMatrixStaffing(cycleId, username, role, isChecked) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId) || (typeof getCycleById === 'function' ? getCycleById(cycleId) : null);
    if (!c) return;

    if (role === 'tester') {
      let testers = Array.isArray(c.assignedTesters) ? [...c.assignedTesters] : (Array.isArray(c.testerUsernames) ? [...c.testerUsernames] : []);
      if (isChecked) {
        if (!testers.includes(username)) testers.push(username);
      } else {
        testers = testers.filter(u => u !== username);
      }
      c.assignedTesters = testers;
      c.testerUsernames = testers;
    } else {
      let devs = Array.isArray(c.assignedDevs) ? [...c.assignedDevs] : (Array.isArray(c.devUsernames) ? [...c.devUsernames] : []);
      if (isChecked) {
        if (!devs.includes(username)) devs.push(username);
      } else {
        devs = devs.filter(u => u !== username);
      }
      c.assignedDevs = devs;
      c.devUsernames = devs;
    }

    if (typeof saveCycleStaffing === 'function') {
      saveCycleStaffing(cycleId, c.assignedTesters, c.assignedDevs);
    }

    showToast(`✅ Đã ${isChecked ? 'phân bổ' : 'hủy phân bổ'} @${username} cho đợt [${c.code || c.id}]!`, 'success');
    this.renderStaffingMatrix();
    this.renderPerCycleComparisonTable();
    this.renderVersionWorkforceKPIs();
    this.renderCycleCards();
    this.renderCyclesMatrix();
  },

  // Phân khu 3: Bảng so sánh và thống kê hiệu quả sử dụng nhân sự tại các đợt test
  renderPerCycleComparisonTable() {
    const tbody = document.getElementById('v-cycle-comparison-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];

    if (cycles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--text-muted)">Chưa có đợt kiểm thử nào trong phiên bản này.</td></tr>`;
      return;
    }

    tbody.innerHTML = cycles.map(c => {
      const cMetrics = typeof getCycleMetrics === 'function' ? getCycleMetrics(c.id) : { totalTcs: 0, assignedCount: 0, assignedRate: 0, passCount: 0, passRate: 0, assignees: [], assignedDevs: [] };
      const isActive = c.status === 'ACTIVE' || c.status === 'IN_PROGRESS';
      const isClosed = c.status === 'CLOSED' || c.status === 'COMPLETED';
      const isPaused = c.status === 'PAUSED';

      let stBadge = '<span class="badge" style="background:#f1f5f9; color:#475569; font-size:10.5px">⏳ Kế hoạch</span>';
      if (isActive) stBadge = '<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-size:10.5px">🟢 Đang diễn ra</span>';
      else if (isClosed) stBadge = '<span class="badge" style="background:#f1f5f9; color:#64748b; font-size:10.5px">🔒 Đã đóng</span>';
      else if (isPaused) stBadge = '<span class="badge" style="background:#fef3c7; color:#b45309; font-size:10.5px">⏸️ Tạm dừng</span>';

      const cycleBugs = allDefects.filter(d => d.cycleId === c.id);
      const testersCount = cMetrics.assignees.length;
      const devsCount = (c.assignedDevs || c.devUsernames || []).length;
      const avgLoad = testersCount > 0 ? Math.round(cMetrics.assignedCount / testersCount) : 0;

      const baseLink = `projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}&cycleId=${encodeURIComponent(c.id)}`;

      return `
        <tr>
          <td>
            <div style="font-weight:800; font-size:13.5px; color:var(--text-primary)">${escapeHtml(c.name || c.id)}</div>
            <div style="font-size:11px; color:var(--text-muted)">Mã: <strong>${escapeHtml(c.code || c.id)}</strong> • Loại: ${escapeHtml(c.suite || 'REGRESSION')}</div>
          </td>
          <td style="text-align:center">${stBadge}</td>
          <td style="text-align:center; font-size:11.5px; color:var(--text-secondary)">
            ${escapeHtml(c.startDate || 'N/A')} ➔ ${escapeHtml(c.endDate || 'N/A')}
          </td>
          <td style="text-align:center">
            <span style="font-weight:700; color:#2563eb" title="Testers: ${cMetrics.assignees.join(', ')}">${testersCount} Tester</span>
            <span style="color:var(--text-muted)"> • </span>
            <span style="font-weight:700; color:#10b981" title="Devs: ${(c.assignedDevs || []).join(', ')}">${devsCount} Dev</span>
          </td>
          <td style="text-align:center; font-weight:800">${cMetrics.totalTcs} bài</td>
          <td style="text-align:center">
            <span style="font-weight:700">${cMetrics.assignedCount} bài</span>
            <span style="font-size:11px; color:var(--text-muted)">(${cMetrics.assignedRate}%)</span>
          </td>
          <td>
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:3px">
              <span style="color:#16a34a">${cMetrics.passRate}% đạt</span>
              <span style="color:var(--text-muted)">${cMetrics.passCount}/${cMetrics.totalTcs}</span>
            </div>
            <div style="height:6px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex">
              <div style="width:${cMetrics.passRate}%; background:#16a34a"></div>
            </div>
          </td>
          <td style="text-align:center; font-weight:800; color:#dc2626">
            ${cycleBugs.length} lỗi
          </td>
          <td style="text-align:center; font-weight:700; color:#7c3aed">
            ~${avgLoad} bài/người
          </td>
          <td style="text-align:center">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px">
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openCycleStaffingModal('${c.id}')" title="Phân bổ nhân sự chuyên biệt cho đợt này">
                👥 Phân bổ
              </button>
              <a href="cycle.html?${baseLink}&tab=staffing" class="btn btn-primary btn-xs" title="Vào bàn điều phối đợt kiểm thử">
                🚀 Tác chiến
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Phân khu 4: Bảng theo dõi năng suất & tải trọng cá nhân toàn phiên bản
  populateRosterCycleSelect() {
    const select = document.getElementById('v-roster-cycle-select');
    if (!select) return;

    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    
    let optionsHtml = `<option value="ALL" ${(!this.activeRosterCycleId || this.activeRosterCycleId === 'ALL') ? 'selected' : ''}>🌐 Tất cả các đợt kiểm thử (Toàn phiên bản)</option>`;
    cycles.forEach(c => {
      optionsHtml += `
        <option value="${c.id}" ${c.id === this.activeRosterCycleId ? 'selected' : ''}>
          🎯 ${escapeHtml(c.name)} (${c.code || c.id})
        </option>
      `;
    });
    select.innerHTML = optionsHtml;
  },

  onRosterCycleChange() {
    const select = document.getElementById('v-roster-cycle-select');
    if (select) {
      this.activeRosterCycleId = select.value;
      this.renderVersionStaffRoster();
    }
  },

  goToStaffingForCycle(cycleId) {
    this.activeRosterCycleId = cycleId;
    this.switchVersionTab('roster');
    const select = document.getElementById('v-roster-cycle-select');
    if (select) select.value = cycleId;
    this.renderVersionRoster();
  },

  renderVersionRoster() {
    this.renderVersionWorkforceKPIs();
    this.renderStaffingMatrix();
    this.renderPerCycleComparisonTable();
    this.populateRosterCycleSelect();
    this.renderVersionStaffRoster();
  },

  renderVersionStaffRoster() {
    const tbody = document.getElementById('v-roster-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    if (!p) return;

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const filterCycleId = this.activeRosterCycleId || 'ALL';

    const curCycle = filterCycleId !== 'ALL' ? cycles.find(c => c.id === filterCycleId) : null;
    const cycleName = curCycle ? curCycle.name : 'Toàn bộ phiên bản';

    // Update Heading
    const headEl = document.getElementById('v-roster-table-heading');
    if (headEl) headEl.textContent = `🏅 Bảng theo dõi năng suất, đóng góp chất lượng & tải trọng cá nhân — ${cycleName}`;

    // Lọc assignments theo cycle hoặc lấy toàn phiên bản
    const asgs = (state.assignments || []).filter(a => {
      if (a.projectId !== p.id) return false;
      if (filterCycleId !== 'ALL') return a.cycleId === filterCycleId;
      return cycles.some(c => c.id === a.cycleId);
    });

    const allResults = state.results || {};
    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--text-muted)">Chưa có nhân sự nào trong dự án.</td></tr>`;
      return;
    }

    const totalAssignedInScope = asgs.length;
    const avgLoad = members.length > 0 ? Math.round(totalAssignedInScope / members.length) : 0;

    tbody.innerHTML = members.map(m => {
      const isDev = m.projectRole === 'dev' || m.projectRole === 'developer';
      const isLead = m.projectRole === 'lead';
      const userAsgs = asgs.filter(a => (a.assigneeUsername === m.username || a.username === m.username));
      const totalAssigned = userAsgs.length;

      // Tính kết quả thực tế
      let userPassed = 0, userFailed = 0, userBlocked = 0;
      userAsgs.forEach(a => {
        const tcId = a.testCaseId || a.tcId;
        const res = tcId ? allResults[tcId] : null;
        if (res) {
          const st = (res.status || '').toUpperCase();
          if (st === 'PASS') userPassed++;
          else if (st === 'FAIL') userFailed++;
          else if (st === 'BLOCKED') userBlocked++;
        }
      });
      const userExecuted = userPassed + userFailed + userBlocked;
      const passPct = userExecuted > 0 ? Math.round((userPassed / userExecuted) * 100) : 0;

      // Đóng góp Defect: Nếu là tester: số bug tìm thấy; nếu là dev: số bug đã sửa
      let defectText = '';
      if (isDev) {
        const devFixed = allDefects.filter(d => d.assignedDev === m.username && ['Fixed', 'Closed', 'Resolved'].includes(d.defectStatus)).length;
        const devTotal = allDefects.filter(d => d.assignedDev === m.username).length;
        defectText = `<span style="color:#10b981; font-weight:700">Đã sửa: ${devFixed}/${devTotal} bug</span>`;
      } else {
        defectText = `<span style="color:#dc2626; font-weight:700">Báo cáo: ${userFailed} lỗi</span>`;
      }

      // Các đợt tham gia
      const memberCycles = cycles.filter(c => {
        if (isDev) return (c.assignedDevs || c.devUsernames || []).includes(m.username);
        return (c.assignedTesters || c.testerUsernames || []).includes(m.username) || userAsgs.some(a => a.cycleId === c.id);
      });
      const cyclesBadges = memberCycles.length > 0
        ? memberCycles.map(c => `<span class="badge badge-info" style="font-size:9.5px; margin:1px">${escapeHtml(c.code || c.id)}</span>`).join('')
        : '<span style="font-size:11px; color:var(--text-muted)">Chưa tham gia</span>';

      // Phân hệ nghiệp vụ đảm nhận
      const assignedModSet = new Set(userAsgs.map(a => a.assignedModule).filter(Boolean));
      const assignedMods = assignedModSet.size > 0 ? Array.from(assignedModSet).join(', ') : '—';

      // Đánh giá tải trọng
      let loadStatus;
      if (isDev) {
        loadStatus = memberCycles.length > 0
          ? `<span class="badge" style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:800">💻 Trực chiến ${memberCycles.length} đợt</span>`
          : `<span class="badge badge-outline" style="font-size:10px">⚪ Dự bị</span>`;
      } else {
        if (totalAssigned === 0) {
          loadStatus = '<span class="badge" style="background:#f1f5f9; color:#64748b; font-size:10px; font-weight:800">⚪ Chưa có việc</span>';
        } else if (avgLoad > 0 && totalAssigned > avgLoad * 1.3) {
          loadStatus = `<span class="badge badge-fail" style="font-size:10px; font-weight:800">🔴 Quá tải</span>`;
        } else if (avgLoad > 0 && totalAssigned < avgLoad * 0.6) {
          loadStatus = `<span class="badge badge-info" style="font-size:10px; font-weight:800">🟡 Dưới tải</span>`;
        } else {
          loadStatus = `<span class="badge" style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:800">🟢 Cân bằng</span>`;
        }
      }

      const roleBadge = isLead
        ? '<span class="badge badge-primary" style="font-size:10px">Chủ trì (Lead)</span>'
        : (isDev ? '<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-size:10px">Lập trình viên</span>' : '<span class="badge badge-info" style="font-size:10px">Kiểm thử viên</span>');

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px">
              <div style="width:34px; height:34px; border-radius:50%; background:${isDev ? '#10b981' : (isLead ? '#7c3aed' : '#2563eb')}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; flex-shrink:0">
                ${(m.name || m.username || 'T').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:800; font-size:13px; color:var(--text-primary)">${escapeHtml(m.name || m.username)}</div>
                <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(m.username)}</div>
              </div>
            </div>
          </td>
          <td style="text-align:center">${roleBadge}</td>
          <td style="text-align:center">${cyclesBadges}</td>
          <td style="font-size:12px; font-weight:600; color:var(--text-secondary)">${assignedMods}</td>
          <td style="text-align:center; font-weight:800; font-size:13px; color:#2563eb">${totalAssigned} bài</td>
          <td style="text-align:center; font-size:12px">
            ${userExecuted}/${totalAssigned}
            <span style="font-size:10.5px; color:var(--text-muted)">(${totalAssigned > 0 ? Math.round((userExecuted / totalAssigned) * 100) : 0}%)</span>
          </td>
          <td style="text-align:center; font-weight:800; color:#16a34a">${passPct}%</td>
          <td style="text-align:center; font-size:12px">${defectText}</td>
          <td style="text-align:center">${loadStatus}</td>
          <td style="text-align:center">
            <div style="display:flex; gap:6px; justify-content:center">
              ${isDev ? `
                <a href="../dev/index.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}" class="btn btn-outline btn-xs" title="Xem không gian Dev">
                  💻 Cổng Dev
                </a>
              ` : `
                <a href="cycle.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}&cycleId=${encodeURIComponent(filterCycleId !== 'ALL' ? filterCycleId : (cycles[0]?.id || ''))}&tester=${encodeURIComponent(m.username)}&tab=staffing" class="btn btn-outline btn-xs" title="Xem bảng phân việc cá nhân">
                  👉 Xem việc
                </a>
                <button type="button" class="btn btn-outline btn-xs" onclick="LeadVersion.openAssignByModuleModal('${m.username}')" title="Gán thêm phân hệ cho kỹ sư này">
                  ➕ Phân hệ
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Công cụ 5: Cân bằng tải phiên bản tự động
  autoBalanceVersionStaffing() {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const allTesters = this.getProjectTestersList();
    const assignments = (state.assignments || []).filter(a => a.projectId === p.id && cycles.some(c => c.id === a.cycleId));

    if (allTesters.length <= 1) {
      showToast('ℹ️ Phiên bản chỉ có 1 kiểm thử viên, tải trọng đã tối ưu.', 'info');
      return;
    }

    const loads = allTesters.map(u => ({
      username: u.username,
      name: u.name || u.username,
      count: assignments.filter(a => (a.assigneeUsername === u.username || a.username === u.username)).length
    }));

    const total = assignments.length;
    const avg = Math.round(total / allTesters.length);
    const max = Math.max(...loads.map(l => l.count));
    const min = Math.min(...loads.map(l => l.count));

    if (max - min <= 5) {
      showToast('✅ Tải trọng kịch bản giữa các kỹ sư trong phiên bản hiện tại rất cân bằng!', 'success');
      return;
    }

    if (confirm(`Hệ thống phát hiện chênh lệch tải trọng (${max} bài so với ${min} bài, trung bình ~${avg} bài/người). Bạn có muốn tự động san sẻ bớt kịch bản giữa các kỹ sư không?`)) {
      this.autoDistributeEvenly();
    }
  },

  // Công cụ 6: Xuất báo cáo nhân lực toàn phiên bản ra Excel
  exportVersionStaffingExcel() {
    const p = getActiveProject();
    if (!p || typeof XLSX === 'undefined') {
      showToast('⚠️ Không thể xuất file Excel vào lúc này!', 'error');
      return;
    }

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const assignments = (state.assignments || []).filter(a => a.projectId === p.id && cycles.some(c => c.id === a.cycleId));

    // Sheet 1: Tổng hợp nhân sự
    const staffRows = members.map(m => {
      const userAsgs = assignments.filter(a => (a.assigneeUsername === m.username || a.username === m.username));
      return {
        'Họ và tên': m.name || m.username,
        'Username': m.username,
        'Vai trò dự án': m.projectRole || 'tester',
        'Tổng số bài được giao': userAsgs.length,
        'Các đợt tham gia': cycles.filter(c => (c.assignedTesters || []).includes(m.username) || (c.assignedDevs || []).includes(m.username)).map(c => c.name || c.id).join(', ')
      };
    });

    // Sheet 2: Danh sách các đợt test
    const cycleRows = cycles.map(c => {
      const cMetrics = typeof getCycleMetrics === 'function' ? getCycleMetrics(c.id) : { totalTcs: 0, assignedCount: 0, passCount: 0 };
      return {
        'Mã đợt': c.code || c.id,
        'Tên đợt test': c.name || c.id,
        'Loại đợt': c.suite || 'REGRESSION',
        'Trạng thái': c.status || 'PLANNED',
        'Thời gian': `${c.startDate || ''} đến ${c.endDate || ''}`,
        'Số Tester': (c.assignedTesters || []).length,
        'Số Dev trực chiến': (c.assignedDevs || []).length,
        'Phạm vi kịch bản': cMetrics.totalTcs,
        'Đã giao việc': cMetrics.assignedCount,
        'Đã đạt': cMetrics.passCount
      };
    });

    const wb = XLSX.utils.book_new();
    const wsStaff = XLSX.utils.json_to_sheet(staffRows);
    const wsCycles = XLSX.utils.json_to_sheet(cycleRows);

    XLSX.utils.book_append_sheet(wb, wsStaff, 'Nhan_Su_Phien_Ban');
    XLSX.utils.book_append_sheet(wb, wsCycles, 'Cac_Dot_Kiem_Thu');

    XLSX.writeFile(wb, `${p.code || 'PRJ'}_${this.currentVersion}_Bao_Cao_Nhan_Luc.xlsx`);
    showToast('📥 Đã xuất báo cáo nhân lực phiên bản ra file Excel thành công!', 'success');
  },

  // 4 Smart Dispatch Tools Implementation:
  // Tool 1: Assign Tester to Cycle
  openAssignTesterToCycleModal() {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const curCycle = cycles.find(c => c.id === this.activeRosterCycleId) || cycles[0];

    const cycleDisplay = document.getElementById('mact-cycle-display');
    const cycleIdInput = document.getElementById('mact-cycle-id');
    if (cycleDisplay && curCycle) cycleDisplay.textContent = `${curCycle.name} (${curCycle.code || curCycle.id})`;
    if (cycleIdInput && curCycle) cycleIdInput.value = curCycle.id;

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const testerSelect = document.getElementById('mact-tester-select');
    if (testerSelect) {
      testerSelect.innerHTML = members.map(m => `
        <option value="${m.username}">${escapeHtml(m.name || m.username)} (@${m.username})</option>
      `).join('');
    }

    const modSelect = document.getElementById('mact-module-select');
    if (modSelect) {
      // Đọc module từ dữ liệu dự án thực — không hardcode
      const vTcsForMod = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
      const modMapForSelect = new Map();
      vTcsForMod.forEach(tc => {
        const mId = tc.moduleId || tc.module || '';
        const mName = tc.moduleName || tc.module || mId;
        if (mId && !modMapForSelect.has(mId)) modMapForSelect.set(mId, mName);
      });
      // Fallback sang p.modules nếu test cases chưa có module
      if (modMapForSelect.size === 0 && Array.isArray(p.modules)) {
        p.modules.forEach(m => {
          const mId = m.id || m;
          const mName = m.name || mId;
          if (mId) modMapForSelect.set(mId, mName);
        });
      }
      const modOptions = modMapForSelect.size > 0
        ? Array.from(modMapForSelect.entries()).map(([id, name]) =>
            `<option value="${escapeHtml(id)}">${escapeHtml(id)}: ${escapeHtml(name)}</option>`
          ).join('')
        : '<option value="ALL">— Chưa có phân hệ nào —</option>';
      modSelect.innerHTML = `<option value="ALL">📦 Toàn bộ phân hệ</option>${modOptions}`;
    }

    openModal('modal-assign-cycle-tester');
  },

  confirmAssignTesterToCycle() {
    const cycleId = document.getElementById('mact-cycle-id')?.value;
    const tester = document.getElementById('mact-tester-select')?.value;
    const role = document.getElementById('mact-role-select')?.value || 'Senior Tester';
    const mod = document.getElementById('mact-module-select')?.value || 'ALL';
    const quota = parseInt(document.getElementById('mact-quota')?.value || '25', 10);

    const p = getActiveProject();
    if (!p || !tester) return;

    // Lấy kịch bản thuộc phân hệ chỉ định
    const allTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
    let candidates = allTcs;
    if (mod !== 'ALL') {
      candidates = candidates.filter(t => (t.moduleId || t.module) === mod);
    }

    if (!state.assignments) state.assignments = [];
    const assignedIds = new Set(state.assignments.filter(a => a.cycleId === cycleId).map(a => a.testCaseId));
    const available = candidates.filter(t => !assignedIds.has(t.id));

    const toAssign = available.slice(0, quota);
    toAssign.forEach(t => {
      state.assignments.push({
        id: `ASG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        projectId: p.id,
        version: this.currentVersion,
        cycleId: cycleId || 'ROUND-1',
        testCaseId: t.id,
        assigneeUsername: tester,
        username: tester,
        roleInCycle: role,
        status: 'ASSIGNED',
        assignedDate: new Date().toISOString()
      });
    });

    saveCoreState();
    closeModal('modal-assign-cycle-tester');
    showToast(`✅ Đã chỉ định @${tester} vào đợt kiểm thử với vai trò [${role}] và giao ${toAssign.length} kịch bản!`, 'success');
    this.renderVersionRoster();
  },

  // Tool 2: Auto distribute evenly
  autoDistributeEvenly() {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const curCycle = cycles.find(c => c.id === this.activeRosterCycleId) || cycles[0];
    if (!curCycle) return;

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    if (members.length === 0) {
      showToast('⚠️ Dự án chưa có kỹ sư kiểm thử nào!', 'error');
      return;
    }

    const allTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
    let scopeTcs = allTcs;
    if (Array.isArray(curCycle.scopeTcIds) && curCycle.scopeTcIds.length > 0) {
      scopeTcs = allTcs.filter(t => curCycle.scopeTcIds.includes(t.id));
    }

    if (!state.assignments) state.assignments = [];
    const alreadyAssigned = new Set(state.assignments.filter(a => a.cycleId === curCycle.id).map(a => a.testCaseId));
    const unassigned = scopeTcs.filter(t => !alreadyAssigned.has(t.id));

    if (unassigned.length === 0) {
      showToast('ℹ️ Toàn bộ kịch bản trong đợt kiểm thử này đã được phân công đầy đủ!', 'info');
      return;
    }

    unassigned.forEach((t, i) => {
      const targetMember = members[i % members.length];
      state.assignments.push({
        id: `ASG-${Date.now()}-${i}`,
        projectId: p.id,
        version: this.currentVersion,
        cycleId: curCycle.id,
        testCaseId: t.id,
        assigneeUsername: targetMember.username,
        username: targetMember.username,
        status: 'ASSIGNED',
        assignedDate: new Date().toISOString()
      });
    });

    saveCoreState();
    showToast(`⚡ Đã tự động chia đều ${unassigned.length} kịch bản cho ${members.length} kỹ sư trong đợt!`, 'success');
    this.renderVersionRoster();
  },

  // Tool 3: Assign by Module
  openAssignByModuleModal(targetUsername) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const curCycle = cycles.find(c => c.id === this.activeRosterCycleId) || cycles[0];

    const cycleDisp = document.getElementById('mabm-cycle-display');
    const cycleIdInput = document.getElementById('mabm-cycle-id');
    if (cycleDisp && curCycle) cycleDisp.textContent = `${curCycle.name} (${curCycle.code || curCycle.id})`;
    if (cycleIdInput && curCycle) cycleIdInput.value = curCycle.id;

    const modSelect = document.getElementById('mabm-module-select');
    if (modSelect) {
      // Đọc module từ dữ liệu dự án thực — không hardcode
      const vTcsForMod = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
      const modMapForSelect = new Map();
      vTcsForMod.forEach(tc => {
        const mId = tc.moduleId || tc.module || '';
        const mName = tc.moduleName || tc.module || mId;
        if (mId && !modMapForSelect.has(mId)) modMapForSelect.set(mId, mName);
      });
      if (modMapForSelect.size === 0 && Array.isArray(p.modules)) {
        p.modules.forEach(m => {
          const mId = m.id || m;
          const mName = m.name || mId;
          if (mId) modMapForSelect.set(mId, mName);
        });
      }
      const modOptions = modMapForSelect.size > 0
        ? Array.from(modMapForSelect.entries()).map(([id, name]) =>
            `<option value="${escapeHtml(id)}">${escapeHtml(id)}: ${escapeHtml(name)}</option>`
          ).join('')
        : '<option value="">— Chưa có phân hệ nào —</option>';
      modSelect.innerHTML = modOptions;
    }

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const testerSelect = document.getElementById('mabm-tester-select');
    if (testerSelect) {
      testerSelect.innerHTML = members.map(m => `
        <option value="${m.username}" ${m.username === targetUsername ? 'selected' : ''}>
          ${escapeHtml(m.name || m.username)} (@${m.username})
        </option>
      `).join('');
    }

    this.onModuleAssignSelectChange();
    openModal('modal-assign-by-module');
  },

  onModuleAssignSelectChange() {
    const modId = document.getElementById('mabm-module-select')?.value;
    const info = document.getElementById('mabm-module-info');
    if (!info || !modId) return;

    const p = getActiveProject();
    const vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p?.id, this.currentVersion) : [];
    const count = vTcs.filter(t => (t.moduleId || t.module) === modId).length;
    info.textContent = `Phân hệ [${modId}] có ${count} kịch bản kiểm thử sẵn sàng được phân công.`;
  },

  confirmAssignByModule() {
    const cycleId = document.getElementById('mabm-cycle-id')?.value;
    const modId = document.getElementById('mabm-module-select')?.value;
    const tester = document.getElementById('mabm-tester-select')?.value;

    const p = getActiveProject();
    if (!p || !modId || !tester) return;

    const allTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
    const modTcs = allTcs.filter(t => (t.moduleId || t.module) === modId);

    if (!state.assignments) state.assignments = [];

    modTcs.forEach(t => {
      // Reassign to target tester
      state.assignments = state.assignments.filter(a => !(a.cycleId === cycleId && a.testCaseId === t.id));
      state.assignments.push({
        id: `ASG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        projectId: p.id,
        version: this.currentVersion,
        cycleId: cycleId || 'ROUND-1',
        testCaseId: t.id,
        assigneeUsername: tester,
        username: tester,
        assignedModule: modId,
        status: 'ASSIGNED',
        assignedDate: new Date().toISOString()
      });
    });

    saveCoreState();
    closeModal('modal-assign-by-module');
    showToast(`🎯 Đã phân công toàn bộ ${modTcs.length} kịch bản của phân hệ [${modId}] cho kỹ sư @${tester}!`, 'success');
    this.renderVersionRoster();
  },

  // Tool 4: Gather failed test cases for retest
  assignFailedForRetest() {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const curCycle = cycles.find(c => c.id === this.activeRosterCycleId) || cycles[0];
    if (!curCycle) return;

    const allTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
    const results = state.results || {};

    const failedTcs = allTcs.filter(t => {
      const res = results[t.id];
      return res && (res.status || '').toUpperCase().includes('FAIL');
    });

    if (failedTcs.length === 0) {
      showToast('ℹ️ Phiên bản không có kịch bản nào bị lỗi cần kiểm thử lại!', 'info');
      return;
    }

    // Đảm bảo các bài này có trong scope của cycle
    if (!Array.isArray(curCycle.scopeTcIds)) curCycle.scopeTcIds = [];
    failedTcs.forEach(t => {
      if (!curCycle.scopeTcIds.includes(t.id)) curCycle.scopeTcIds.push(t.id);
    });

    // Giao cho các tester
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    if (!state.assignments) state.assignments = [];

    failedTcs.forEach((t, i) => {
      const assignedTester = members.length > 0 ? members[i % members.length].username : 'tester1';
      state.assignments = state.assignments.filter(a => !(a.cycleId === curCycle.id && a.testCaseId === t.id));
      state.assignments.push({
        id: `ASG-RETEST-${Date.now()}-${i}`,
        projectId: p.id,
        version: this.currentVersion,
        cycleId: curCycle.id,
        testCaseId: t.id,
        assigneeUsername: assignedTester,
        username: assignedTester,
        taskType: 'RETEST',
        status: 'ASSIGNED',
        assignedDate: new Date().toISOString()
      });
    });

    saveCoreState();
    showToast(`⚠️ Đã gom ${failedTcs.length} kịch bản từng không đạt và phân công kiểm thử lại trong đợt [${curCycle.name}]!`, 'success');
    this.renderVersionRoster();
  },



  toggleFreezeVersion() {
    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    let vObj = versions.find(v => (v.version || v) === this.currentVersion);
    if (!vObj) return;

    const curSt = (vObj.status || 'ACTIVE').toUpperCase();
    const newSt = curSt === 'CODE_FREEZE' ? 'ACTIVE' : 'CODE_FREEZE';
    vObj.status = newSt;

    saveCoreState();
    showToast(`Đã chuyển trạng thái phiên bản sang: [${newSt}]!`, 'info');
    this.renderVersionHeader();
    this.populateVersionSettings();
  },


  // ==================== SMART BASELINE INHERITANCE ====================
  inheritBaseline() {
    const p = getActiveProject();
    if (!p) return;

    if (typeof inheritBaselineTestCases === 'function') {
      inheritBaselineTestCases(p.id, this.currentVersion);
    }

    // Đếm số kịch bản thực sau khi kế thừa thay vì hardcode
    const inheritedTcs = typeof getTestCasesForVersion === 'function'
      ? getTestCasesForVersion(p.id, this.currentVersion)
      : [];
    showToast(`🎉 Đã kế thừa thành công ${inheritedTcs.length > 0 ? inheritedTcs.length : 'toàn bộ'} kịch bản chuẩn vào phiên bản ${this.currentVersion}!`, 'success');
    this.renderVersionOverview();
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderModuleTree();
    this.renderScopeTestCases();
    this.renderVersionRoster();
  },

  getProjectTestersList() {
    const p = getActiveProject();
    const allUsers = typeof getUsers === 'function' ? getUsers() : (state.users || DEFAULT_SYSTEM_USERS);
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p?.id) : (p?.members || []);
    const memberTesters = members.filter(m => m.projectRole === 'tester');
    if (memberTesters.length > 0) {
      const set = new Set(memberTesters.map(m => m.username));
      const list = allUsers.filter(u => set.has(u.username) && u.status !== 'LOCKED');
      if (list.length > 0) return list;
    }
    // Fallback nếu project.members chưa có role tester: lấy testers hệ thống
    return allUsers.filter(u => u.role === 'tester' && u.status !== 'LOCKED');
  },

  getProjectDevsList() {
    const p = getActiveProject();
    const allUsers = typeof getUsers === 'function' ? getUsers() : (state.users || DEFAULT_SYSTEM_USERS);
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p?.id) : (p?.members || []);
    const memberDevs = members.filter(m => m.projectRole === 'dev' || m.projectRole === 'developer');
    if (memberDevs.length > 0) {
      const set = new Set(memberDevs.map(m => m.username));
      const list = allUsers.filter(u => set.has(u.username) && u.status !== 'LOCKED');
      if (list.length > 0) return list;
    }
    // Fallback nếu project.members chưa có role dev: lấy developers hệ thống
    return allUsers.filter(u => (u.role === 'dev' || u.role === 'developer') && u.status !== 'LOCKED');
  },

  renderFormTestersCheckboxes(selectedUsernames = []) {
    const container = document.getElementById('cf-testers-list');
    if (!container) return;
    const testers = this.getProjectTestersList();
    const selSet = new Set(selectedUsernames);

    if (testers.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:12px">Chưa có kiểm thử viên nào trong dự án.</div>`;
      this.updateFormTestersBadge();
      return;
    }

    container.innerHTML = testers.map(u => {
      const isChecked = selSet.has(u.username);
      return `
        <label style="display:flex; align-items:center; gap:10px; padding:6px 8px; border-radius:6px; background:${isChecked ? 'rgba(37,99,235,0.06)' : 'transparent'}; cursor:pointer; font-size:12.5px; transition:all 0.15s ease">
          <input type="checkbox" class="cf-tester-checkbox" value="${escapeHtml(u.username)}" ${isChecked ? 'checked' : ''} onchange="LeadVersion.onFormTesterCheckboxChange()" style="width:16px; height:16px; cursor:pointer" />
          <div style="width:24px; height:24px; border-radius:50%; background:#2563eb; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px">
            ${(u.name || u.username).slice(0, 1).toUpperCase()}
          </div>
          <div style="flex:1">
            <strong>${escapeHtml(u.name || u.username)}</strong>
            <span style="color:var(--text-muted); font-size:11px">(@${escapeHtml(u.username)})</span>
          </div>
          <span class="badge badge-outline" style="font-size:10px">${escapeHtml((u.roleTitle || 'Tester').replace(/\s*\([^)]*\)/g, ''))}</span>
        </label>
      `;
    }).join('');
    this.updateFormTestersBadge();
  },

  onFormTesterCheckboxChange() {
    this.updateFormTestersBadge();
  },

  updateFormTestersBadge() {
    const checkboxes = document.querySelectorAll('.cf-tester-checkbox');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    const badge = document.getElementById('cf-testers-count-badge');
    if (badge) badge.textContent = `${checked.length} đã chọn`;
  },

  toggleAllFormTesters(select) {
    const checkboxes = document.querySelectorAll('.cf-tester-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = select;
      const lbl = cb.closest('label');
      if (lbl) lbl.style.background = select ? 'rgba(37,99,235,0.06)' : 'transparent';
    });
    this.updateFormTestersBadge();
  },

  getSelectedFormTesters() {
    const checkboxes = document.querySelectorAll('.cf-tester-checkbox');
    return Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  },

  renderFormDevsCheckboxes(selectedUsernames = []) {
    const container = document.getElementById('cf-devs-list');
    if (!container) return;
    const devs = this.getProjectDevsList();
    const selSet = new Set(selectedUsernames);

    if (devs.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:12px">Chưa có lập trình viên nào trong dự án.</div>`;
      this.updateFormDevsBadge();
      return;
    }

    container.innerHTML = devs.map(u => {
      const isChecked = selSet.has(u.username);
      return `
        <label style="display:flex; align-items:center; gap:10px; padding:6px 8px; border-radius:6px; background:${isChecked ? 'rgba(2,132,199,0.08)' : 'transparent'}; cursor:pointer; font-size:12.5px; transition:all 0.15s ease">
          <input type="checkbox" class="cf-dev-checkbox" value="${escapeHtml(u.username)}" ${isChecked ? 'checked' : ''} onchange="LeadVersion.onFormDevCheckboxChange()" style="width:16px; height:16px; cursor:pointer" />
          <div style="width:24px; height:24px; border-radius:50%; background:#0284c7; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px">
            ${(u.name || u.username).slice(0, 1).toUpperCase()}
          </div>
          <div style="flex:1">
            <strong>${escapeHtml(u.name || u.username)}</strong>
            <span style="color:var(--text-muted); font-size:11px">(@${escapeHtml(u.username)})</span>
          </div>
          <span class="badge badge-outline" style="font-size:10px; color:#0284c7; border-color:rgba(2,132,199,0.3)">${escapeHtml((u.roleTitle || 'Developer').replace(/\s*\([^)]*\)/g, ''))}</span>
        </label>
      `;
    }).join('');
    this.updateFormDevsBadge();
  },

  onFormDevCheckboxChange() {
    this.updateFormDevsBadge();
  },

  updateFormDevsBadge() {
    const checkboxes = document.querySelectorAll('.cf-dev-checkbox');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    const badge = document.getElementById('cf-devs-count-badge');
    if (badge) badge.textContent = `${checked.length} đã chọn`;
  },

  toggleAllFormDevs(select) {
    const checkboxes = document.querySelectorAll('.cf-dev-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = select;
      const lbl = cb.closest('label');
      if (lbl) lbl.style.background = select ? 'rgba(2,132,199,0.08)' : 'transparent';
    });
    this.updateFormDevsBadge();
  },

  getSelectedFormDevs() {
    const checkboxes = document.querySelectorAll('.cf-dev-checkbox');
    return Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  },

  // ==================== MODAL ĐỢT TEST (FORM & SCOPE) ====================
  openAddCycleModal() {
    const p = getActiveProject();
    if (!p) return;

    document.getElementById('cf-id').value = '';
    const existing = (typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : []);
    document.getElementById('cf-code').value = `ROUND-${existing.length + 1}`;
    document.getElementById('cf-name').value = `Đợt ${existing.length + 1} — Kiểm thử ${this.currentVersion}`;
    document.getElementById('cf-description').value = '';
    document.getElementById('cf-start-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('cf-end-date').value = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    document.getElementById('cf-version').value = this.currentVersion;
    const dispEl = document.getElementById('cf-version-display');
    if (dispEl) dispEl.textContent = this.currentVersion;

    // Mặc định chọn tất cả kiểm thử viên & lập trình viên dự án khi tạo mới
    const testers = this.getProjectTestersList();
    this.renderFormTestersCheckboxes(testers.map(u => u.username));

    const devs = this.getProjectDevsList();
    this.renderFormDevsCheckboxes(devs.map(u => u.username));

    document.getElementById('modal-cycle-title').textContent = `➕ Thêm Đợt Kiểm Thử Cho Phiên Bản ${this.currentVersion}`;
    openModal('modal-cycle-form');
  },

  openEditCycleModal(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const c = typeof getCycleById === 'function' ? getCycleById(cycleId) : null;
    if (!c) return;

    document.getElementById('cf-id').value = c.id;
    document.getElementById('cf-code').value = c.code || c.id;
    document.getElementById('cf-name').value = c.name;
    document.getElementById('cf-description').value = c.description || '';
    document.getElementById('cf-start-date').value = c.startDate || '';
    document.getElementById('cf-end-date').value = c.endDate || '';
    if (document.getElementById('cf-suite')) document.getElementById('cf-suite').value = c.suite || 'REGRESSION';
    if (document.getElementById('cf-status')) document.getElementById('cf-status').value = c.status || 'ACTIVE';

    document.getElementById('cf-version').value = c.version || this.currentVersion;
    const dispEl = document.getElementById('cf-version-display');
    if (dispEl) dispEl.textContent = c.version || this.currentVersion;

    // Đổ danh sách kiểm thử viên đã phân bổ
    const currentAssignedTesters = Array.isArray(c.assignedTesters) && c.assignedTesters.length > 0
      ? c.assignedTesters
      : (Array.isArray(c.testerUsernames) && c.testerUsernames.length > 0 ? c.testerUsernames : this.getProjectTestersList().map(u => u.username));
    this.renderFormTestersCheckboxes(currentAssignedTesters);

    // Đổ danh sách lập trình viên phụ trách
    const currentAssignedDevs = Array.isArray(c.assignedDevs) && c.assignedDevs.length > 0
      ? c.assignedDevs
      : (Array.isArray(c.devUsernames) && c.devUsernames.length > 0 ? c.devUsernames : this.getProjectDevsList().map(u => u.username));
    this.renderFormDevsCheckboxes(currentAssignedDevs);

    document.getElementById('modal-cycle-title').textContent = `✏️ Chỉnh Sửa Đợt Kiểm Thử: ${c.code || c.id}`;
    openModal('modal-cycle-form');
  },

  confirmSaveCycle() {
    const p = getActiveProject();
    if (!p) return;

    const id = document.getElementById('cf-id').value;
    const code = (document.getElementById('cf-code').value || '').trim();
    const name = (document.getElementById('cf-name').value || '').trim();
    const version = document.getElementById('cf-version').value || this.currentVersion;
    const suite = document.getElementById('cf-suite').value;
    const status = document.getElementById('cf-status').value;
    const startDate = document.getElementById('cf-start-date').value;
    const endDate = document.getElementById('cf-end-date').value;
    const description = (document.getElementById('cf-description').value || '').trim();
    const assignedTesters = this.getSelectedFormTesters();
    const assignedDevs = this.getSelectedFormDevs();

    if (!code || !name) {
      showToast('⚠️ Vui lòng nhập Mã và Tên đợt kiểm thử!', 'error');
      return;
    }

    if (!p.testCycles) p.testCycles = [];
    if (!state.testCycles) state.testCycles = [];

    if (id) {
      const c = p.testCycles.find(x => x.id === id);
      if (c) {
        c.code = code;
        c.name = name;
        c.version = version;
        c.suite = suite;
        c.status = status;
        c.startDate = startDate;
        c.endDate = endDate;
        c.description = description;
        c.assignedTesters = assignedTesters;
        c.testerUsernames = assignedTesters;
        c.assignedDevs = assignedDevs;
        c.devUsernames = assignedDevs;
      }
      const cs = state.testCycles.find(x => x.id === id);
      if (cs) {
        cs.code = code;
        cs.name = name;
        cs.version = version;
        cs.suite = suite;
        cs.status = status;
        cs.startDate = startDate;
        cs.endDate = endDate;
        cs.description = description;
        cs.assignedTesters = assignedTesters;
        cs.testerUsernames = assignedTesters;
        cs.assignedDevs = assignedDevs;
        cs.devUsernames = assignedDevs;
      }
      showToast(`✅ Đã cập nhật đợt kiểm thử [${code}]!`, 'success');
    } else {
      const cleanPrj = (p.code || p.id || 'PRJ').replace('PRJ-', '').toUpperCase();
      const cleanVer = version.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const newId = `CYC-${cleanPrj}-${cleanVer}-${Date.now().toString().slice(-4)}`;
      const newCycleObj = {
        id: newId,
        projectId: p.id,
        code,
        name,
        version,
        suite,
        status,
        startDate,
        endDate,
        description,
        scopeTcIds: [],
        assignedTesters,
        testerUsernames: assignedTesters,
        assignedDevs,
        devUsernames: assignedDevs
      };
      p.testCycles.push(newCycleObj);
      state.testCycles.push(newCycleObj);
      showToast(`🎉 Đã tạo đợt kiểm thử mới [${name}] cho phiên bản ${version}!`, 'success');
    }

    saveCoreState();
    if (typeof window !== 'undefined' && window.pushCyclesToCloud && typeof window.pushCyclesToCloud === 'function' && state.testCycles) {
      window.pushCyclesToCloud(state.testCycles);
    }
    closeModal('modal-cycle-form');
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderVersionOverview();
    if (typeof LeadContext !== 'undefined' && LeadContext.renderCompactProjectBar) {
      LeadContext.renderCompactProjectBar();
    }
  },

  // ==================== DEDICATED CYCLE STAFFING MODAL ====================
  openCycleStaffingModal(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId) || (typeof getCycleById === 'function' ? getCycleById(cycleId) : null);
    if (!c) {
      showToast('⚠️ Không tìm thấy đợt kiểm thử!', 'error');
      return;
    }

    this.activeStaffingCycleId = cycleId;

    const cycleIdInput = document.getElementById('mcs-staff-cycle-id');
    if (cycleIdInput) cycleIdInput.value = cycleId;

    const titleEl = document.getElementById('mcs-staff-title');
    if (titleEl) titleEl.textContent = `👥 Phân Bổ Nhân Sự Đợt: ${c.name} (${c.code || c.id})`;

    const subEl = document.getElementById('mcs-staff-subtitle');
    if (subEl) subEl.textContent = `Chỉ định danh sách kỹ sư kiểm thử thực thi & lập trình viên trực chiến sửa lỗi cho [${c.name}].`;

    const nameEl = document.getElementById('mcs-staff-cycle-name');
    if (nameEl) nameEl.textContent = `${c.name} (${c.code || c.id})`;

    // 1. Danh sách Testers
    const testers = this.getProjectTestersList();
    const testerContainer = document.getElementById('mcs-staff-testers-list');
    
    let currentAssignedTesters = Array.isArray(c.assignedTesters) && c.assignedTesters.length > 0 
      ? c.assignedTesters 
      : (Array.isArray(c.testerUsernames) ? c.testerUsernames : []);
    
    if (currentAssignedTesters.length === 0) {
      currentAssignedTesters = testers.map(u => u.username);
    }
    const testerSelSet = new Set(currentAssignedTesters);

    if (testerContainer) {
      if (testers.length === 0) {
        testerContainer.innerHTML = `<div style="text-align:center; padding:14px; color:var(--text-muted); font-size:12.5px">Chưa có kiểm thử viên nào trong dự án.</div>`;
      } else {
        testerContainer.innerHTML = testers.map(u => {
          const isChecked = testerSelSet.has(u.username);
          const userAsgs = (state.assignments || []).filter(a => a.cycleId === cycleId && (a.assigneeUsername === u.username || a.username === u.username));
          return `
            <label style="display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; border:1px solid ${isChecked ? 'rgba(37,99,235,0.3)' : 'var(--border)'}; background:${isChecked ? 'rgba(37,99,235,0.04)' : 'var(--bg-card)'}; cursor:pointer; transition:all 0.15s ease">
              <input type="checkbox" class="mcs-staff-checkbox" value="${escapeHtml(u.username)}" ${isChecked ? 'checked' : ''} onchange="LeadVersion.onStaffCheckboxChange(this)" style="width:18px; height:18px; cursor:pointer" />
              <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0">
                ${(u.name || u.username).slice(0, 1).toUpperCase()}
              </div>
              <div style="flex:1">
                <div style="font-size:13px; font-weight:700; color:var(--text-primary)">
                  ${escapeHtml(u.name || u.username)}
                  <span style="font-weight:400; color:var(--text-muted); font-size:11.5px">(@${escapeHtml(u.username)})</span>
                </div>
                <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px">
                  ${escapeHtml(u.roleTitle || 'Kiểm thử viên')} • Email: ${escapeHtml(u.email || 'N/A')}
                </div>
              </div>
              <div style="text-align:right">
                <span class="badge ${isChecked ? 'badge-pass' : 'badge-outline'}" style="font-size:11px">
                  ${isChecked ? '✅ Tham gia đợt' : '⚪ Không tham gia'}
                </span>
                ${userAsgs.length > 0 ? `<div style="font-size:10.5px; color:#2563eb; font-weight:700; margin-top:3px">Đã giao ${userAsgs.length} bài</div>` : ''}
              </div>
            </label>
          `;
        }).join('');
      }
    }

    // 2. Danh sách Developers
    const devs = this.getProjectDevsList();
    const devContainer = document.getElementById('mcs-staff-devs-list');
    
    let currentAssignedDevs = Array.isArray(c.assignedDevs) && c.assignedDevs.length > 0 
      ? c.assignedDevs 
      : (Array.isArray(c.devUsernames) ? c.devUsernames : []);
    
    if (currentAssignedDevs.length === 0) {
      currentAssignedDevs = devs.map(u => u.username);
    }
    const devSelSet = new Set(currentAssignedDevs);

    if (devContainer) {
      if (devs.length === 0) {
        devContainer.innerHTML = `<div style="text-align:center; padding:14px; color:var(--text-muted); font-size:12.5px">Chưa có lập trình viên nào trong dự án.</div>`;
      } else {
        devContainer.innerHTML = devs.map(u => {
          const isChecked = devSelSet.has(u.username);
          return `
            <label style="display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; border:1px solid ${isChecked ? 'rgba(16,185,129,0.3)' : 'var(--border)'}; background:${isChecked ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)'}; cursor:pointer; transition:all 0.15s ease">
              <input type="checkbox" class="mcs-staff-dev-checkbox" value="${escapeHtml(u.username)}" ${isChecked ? 'checked' : ''} onchange="LeadVersion.onStaffDevCheckboxChange(this)" style="width:18px; height:18px; cursor:pointer" />
              <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0">
                ${(u.name || u.username).slice(0, 1).toUpperCase()}
              </div>
              <div style="flex:1">
                <div style="font-size:13px; font-weight:700; color:var(--text-primary)">
                  ${escapeHtml(u.name || u.username)}
                  <span style="font-weight:400; color:var(--text-muted); font-size:11.5px">(@${escapeHtml(u.username)})</span>
                </div>
                <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px">
                  ${escapeHtml(u.roleTitle || 'Lập trình viên')} • Email: ${escapeHtml(u.email || 'N/A')}
                </div>
              </div>
              <div style="text-align:right">
                <span class="badge ${isChecked ? 'badge-pass' : 'badge-outline'}" style="font-size:11px">
                  ${isChecked ? '💻 Trực chiến' : '⚪ Không phân bổ'}
                </span>
              </div>
            </label>
          `;
        }).join('');
      }
    }

    this.updateStaffSummaryBadge();
    openModal('modal-cycle-staffing');
  },

  onStaffCheckboxChange(cb) {
    const lbl = cb.closest('label');
    if (lbl) {
      lbl.style.border = cb.checked ? '1px solid rgba(37,99,235,0.3)' : '1px solid var(--border)';
      lbl.style.background = cb.checked ? 'rgba(37,99,235,0.04)' : 'var(--bg-card)';
      const badge = lbl.querySelector('.badge');
      if (badge) {
        badge.className = `badge ${cb.checked ? 'badge-pass' : 'badge-outline'}`;
        badge.textContent = cb.checked ? '✅ Tham gia đợt' : '⚪ Không tham gia';
      }
    }
    this.updateStaffSummaryBadge();
  },

  onStaffDevCheckboxChange(cb) {
    const lbl = cb.closest('label');
    if (lbl) {
      lbl.style.border = cb.checked ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)';
      lbl.style.background = cb.checked ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)';
      const badge = lbl.querySelector('.badge');
      if (badge) {
        badge.className = `badge ${cb.checked ? 'badge-pass' : 'badge-outline'}`;
        badge.textContent = cb.checked ? '💻 Trực chiến' : '⚪ Không phân bổ';
      }
    }
    this.updateStaffSummaryBadge();
  },

  updateStaffSummaryBadge() {
    const testerCbs = document.querySelectorAll('.mcs-staff-checkbox');
    const checkedTesters = Array.from(testerCbs).filter(cb => cb.checked);
    const devCbs = document.querySelectorAll('.mcs-staff-dev-checkbox');
    const checkedDevs = Array.from(devCbs).filter(cb => cb.checked);

    const testerBadge = document.getElementById('mcs-staff-testers-badge');
    if (testerBadge) testerBadge.textContent = `${checkedTesters.length} đã chọn`;

    const devBadge = document.getElementById('mcs-staff-devs-badge');
    if (devBadge) devBadge.textContent = `${checkedDevs.length} đã chọn`;

    const summary = document.getElementById('mcs-staff-selected-summary');
    if (summary) summary.textContent = `Đã chọn: ${checkedTesters.length} Tester • ${checkedDevs.length} Dev tham gia đợt này`;
  },

  toggleAllStaffModalTesters(select) {
    const cbs = document.querySelectorAll('.mcs-staff-checkbox');
    cbs.forEach(cb => {
      cb.checked = select;
      this.onStaffCheckboxChange(cb);
    });
  },

  toggleAllStaffModalDevs(select) {
    const cbs = document.querySelectorAll('.mcs-staff-dev-checkbox');
    cbs.forEach(cb => {
      cb.checked = select;
      this.onStaffDevCheckboxChange(cb);
    });
  },

  confirmSaveCycleStaffing() {
    const cycleId = this.activeStaffingCycleId || document.getElementById('mcs-staff-cycle-id')?.value;
    if (!cycleId) return;

    const testerCbs = document.querySelectorAll('.mcs-staff-checkbox');
    const selectedTesters = Array.from(testerCbs).filter(cb => cb.checked).map(cb => cb.value);

    const devCbs = document.querySelectorAll('.mcs-staff-dev-checkbox');
    const selectedDevs = Array.from(devCbs).filter(cb => cb.checked).map(cb => cb.value);

    if (typeof saveCycleStaffing === 'function') {
      saveCycleStaffing(cycleId, selectedTesters, selectedDevs);
    }

    closeModal('modal-cycle-staffing');
    showToast(`✅ Đã phân bổ ${selectedTesters.length} Tester và ${selectedDevs.length} Dev tham gia đợt kiểm thử!`, 'success');
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderVersionOverview();
    if (typeof LeadContext !== 'undefined' && LeadContext.renderCompactProjectBar) {
      LeadContext.renderCompactProjectBar();
    }
  },

  deleteCycle(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId) || (typeof getCycleById === 'function' ? getCycleById(cycleId) : null);
    const cycleName = c ? (c.name || c.id) : cycleId;
    const scopeCount = (c?.scopeTcIds || c?.testCaseIds || []).length;
    const assignedTesters = (c?.assignedTesters || []).length;
    const assignedDevs = (c?.assignedDevs || []).length;

    const self = this;
    const executeDelete = () => {
      try {
        if (typeof deleteTestCycle === 'function') {
          deleteTestCycle(cycleId);
        } else {
          p.testCycles = (p.testCycles || []).filter(item => item.id !== cycleId);
          if (state.testCycles) {
            state.testCycles = state.testCycles.filter(item => item.id !== cycleId);
          }
          if (Array.isArray(state.assignments)) {
            state.assignments = state.assignments.filter(a => a.cycleId !== cycleId);
          }
          saveCoreState();
          if (window.pushCyclesToCloud) window.pushCyclesToCloud(state.testCycles);
        }

        showToast(`🗑️ Đã xóa thành công đợt kiểm thử [${cycleName}]!`, 'success');
        self.renderCycleCards();
        self.renderCyclesMatrix();
        self.renderVersionOverview();
        if (typeof LeadContext !== 'undefined' && LeadContext.renderCompactProjectBar) {
          LeadContext.renderCompactProjectBar();
        }
      } catch (err) {
        showToast(`❌ Lỗi khi xóa đợt kiểm thử: ${err.message}`, 'error');
      }
    };

    if (typeof showConfirmDeleteModal === 'function') {
      showConfirmDeleteModal({
        title: 'XÁC NHẬN XÓA ĐỢT KIỂM THỬ',
        subtitle: 'Thao tác cấp cao • Loại bỏ đợt test khỏi không gian phiên bản',
        itemBadge: '🎯 ĐỢT KIỂM THỬ',
        itemName: cycleName,
        projectTitle: `${p.name || p.code || 'Dự án'} • Phiên bản [${this.currentVersion}]`,
        impactStats: [
          { label: 'Kịch bản trong đợt', value: scopeCount > 0 ? `${scopeCount} bài` : 'Toàn bộ', icon: '📄', color: '#2563eb' },
          { label: 'Kỹ sư thực thi', value: (assignedTesters + assignedDevs) > 0 ? `${assignedTesters + assignedDevs} người` : '0 người', icon: '👥', color: '#8b5cf6' },
          { label: 'Tiến độ & Kết quả', value: 'Dọn dẹp', icon: '⚡', color: '#ef4444' },
          { label: 'Database Cloud', value: 'Đồng bộ xóa', icon: '☁️', color: '#16a34a' }
        ],
        warningText: `Cảnh báo: Toàn bộ phạm vi kiểm thử, phân công nhân sự và kết quả thực thi của đợt [${cycleName}] sẽ bị xóa vĩnh viễn khỏi phiên bản [${this.currentVersion}] và cơ sở dữ liệu Cloud.\n\nThao tác này không thể hoàn tác!`,
        confirmText: '🗑️ Xác nhận xóa vĩnh viễn',
        onConfirm: executeDelete
      });
    } else {
      if (confirm(`Bạn có chắc chắn muốn xóa đợt kiểm thử [${cycleName}] khỏi phiên bản?`)) {
        executeDelete();
      }
    }
  },

  // Modal Scope Workstation
  openCycleScopeModal(cycleId) {
    const p = getActiveProject();
    if (!p) return;

    const cycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, this.currentVersion) : (p.testCycles || []);
    const c = cycles.find(x => x.id === cycleId) || (typeof getCycleById === 'function' ? getCycleById(cycleId) : null);
    if (!c) {
      showToast('⚠️ Không tìm thấy đợt kiểm thử!', 'error');
      return;
    }

    this.activeScopeCycleId = cycleId;
    this.selectedScopeModuleId = '';
    const cycleVer = c.version || this.currentVersion || 'v2.0';
    this.currentCycleVersionTcs = typeof getTestCasesForVersion === 'function' 
      ? getTestCasesForVersion(p.id, cycleVer) 
      : (p.testCases || []);

    if (Array.isArray(c.scopeTcIds) && c.scopeTcIds.length > 0) {
      this.tempScopeSelectedIds = new Set(c.scopeTcIds);
    } else if (Array.isArray(c.testCaseIds) && c.testCaseIds.length > 0) {
      this.tempScopeSelectedIds = new Set(c.testCaseIds);
    } else {
      this.tempScopeSelectedIds = new Set(this.currentCycleVersionTcs.map(t => t.id));
    }

    const titleEl = document.getElementById('mcs-title');
    if (titleEl) titleEl.textContent = `🎯 Cấu Hình Danh Mục Kịch Bản: ${c.name} (${c.code || c.id})`;
    const subEl = document.getElementById('mcs-subtitle');
    if (subEl) subEl.textContent = `Đợt test thuộc phiên bản [${cycleVer}] — Tổng kho phiên bản: ${this.currentCycleVersionTcs.length} kịch bản`;
    const verBadge = document.getElementById('mcs-version-badge');
    if (verBadge) verBadge.textContent = cycleVer;
    const typeBadge = document.getElementById('mcs-cycle-type-badge');
    if (typeBadge) typeBadge.textContent = c.suite || 'REGRESSION';

    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
    openModal('modal-cycle-scope');
  },

  updateScopeKpiAndCounters() {
    const all = this.currentCycleVersionTcs || [];
    const totalTcs = all.length;
    const selectedTcs = this.tempScopeSelectedIds.size;
    const percent = totalTcs > 0 ? Math.round((selectedTcs / totalTcs) * 100) : 0;

    let failedCount = 0;
    let highPrioCount = 0;

    all.forEach(t => {
      const isFail = ((state.results || {})[t.id]?.status || '').toLowerCase().includes('fail');
      if (isFail) failedCount++;
      if (t.priority === 'P1' || t.priority === 'P2') highPrioCount++;
    });

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('mcs-kpi-total', totalTcs);
    setEl('mcs-kpi-selected', `${selectedTcs} (${percent}%)`);
    setEl('mcs-kpi-failed', failedCount);
    setEl('mcs-kpi-high-prio', highPrioCount);
    setEl('mcs-footer-count', selectedTcs);
  },

  renderScopeSidebar() {
    const listEl = document.getElementById('mcs-modules-list');
    if (!listEl) return;

    const all = this.currentCycleVersionTcs || [];
    const modMap = new Map();

    all.forEach(tc => {
      const mId = tc.moduleId || tc.module || 'OTHER';
      const mName = tc.moduleName || tc.module || mId;
      if (!modMap.has(mId)) {
        modMap.set(mId, { id: mId, name: mName, total: 0, selected: 0 });
      }
      const item = modMap.get(mId);
      item.total++;
      if (this.tempScopeSelectedIds.has(tc.id)) {
        item.selected++;
      }
    });

    const totalSelected = this.tempScopeSelectedIds.size;
    const totalAll = all.length;

    let html = `
      <div class="mcs-module-item ${this.selectedScopeModuleId === '' ? 'active' : ''}" onclick="LeadVersion.selectScopeModule('')">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-weight:700">📦 Tất Cả Kịch Bản</span>
          <span class="badge ${totalSelected === totalAll ? 'badge-pass' : 'badge-info'}" style="font-size:10.5px">
            ${totalSelected}/${totalAll}
          </span>
        </div>
      </div>
    `;

    modMap.forEach((m) => {
      const isAct = this.selectedScopeModuleId === m.id;
      const isFull = m.selected === m.total && m.total > 0;
      html += `
        <div class="mcs-module-item ${isAct ? 'active' : ''}" onclick="LeadVersion.selectScopeModule('${escapeHtml(m.id)}')">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <span style="font-size:12.5px; font-weight:600">${escapeHtml(m.name)}</span>
            <span class="badge ${isFull ? 'badge-pass' : 'badge-info'}" style="font-size:10px">
              ${m.selected}/${m.total}
            </span>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  },

  selectScopeModule(modId) {
    this.selectedScopeModuleId = modId;
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  renderScopeTcTable() {
    const tbody = document.getElementById('mcs-tbody');
    if (!tbody) return;

    let tcs = this.currentCycleVersionTcs || [];
    if (this.selectedScopeModuleId) {
      tcs = tcs.filter(t => (t.moduleId || t.module) === this.selectedScopeModuleId);
    }

    const q = (document.getElementById('mcs-search')?.value || '').toLowerCase().trim();
    const prio = document.getElementById('mcs-filter-prio')?.value || '';
    const hist = document.getElementById('mcs-filter-history')?.value || '';

    if (q) {
      tcs = tcs.filter(t => (t.id || '').toLowerCase().includes(q) || (t.title || '').toLowerCase().includes(q) || (t.name || '').toLowerCase().includes(q));
    }
    if (prio) {
      tcs = tcs.filter(t => (t.priority || '').toUpperCase() === prio.toUpperCase());
    }
    if (hist) {
      tcs = tcs.filter(t => {
        const st = ((state.results || {})[t.id]?.status || 'UNTESTED').toUpperCase();
        if (hist === 'FAIL') return st.includes('FAIL');
        if (hist === 'PASS') return st.includes('PASS');
        if (hist === 'UNTESTED') return st.includes('UNTEST') || !st;
        return true;
      });
    }

    const countBadge = document.getElementById('mcs-filter-count-badge');
    if (countBadge) countBadge.textContent = `${tcs.length} kịch bản`;

    if (tcs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted)">Không tìm thấy kịch bản nào phù hợp bộ lọc.</td></tr>`;
      return;
    }

    tbody.innerHTML = tcs.map(tc => {
      const isChecked = this.tempScopeSelectedIds.has(tc.id);
      const res = (state.results || {})[tc.id];
      const st = (res?.status || 'UNTESTED').toUpperCase();

      let stBadge = '<span class="badge" style="background:#f1f5f9; color:#64748b; font-size:10px">⚪ Chưa kiểm thử</span>';
      if (st.includes('PASS')) stBadge = '<span class="badge badge-pass" style="font-size:10px">🟢 Đạt</span>';
      else if (st.includes('FAIL')) stBadge = '<span class="badge badge-fail" style="font-size:10px">🔴 Không đạt</span>';

      return `
        <tr style="background:${isChecked ? 'rgba(37,99,235,0.03)' : 'transparent'}">
          <td style="text-align:center">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="LeadVersion.toggleTcInScope('${escapeHtml(tc.id)}', this.checked)" style="width:16px; height:16px; cursor:pointer" />
          </td>
          <td style="font-weight:700; color:#2563eb; font-size:12px; text-align:center">${escapeHtml(tc.id)}</td>
          <td style="text-align:center">
            <span class="badge badge-info" style="font-size:10.5px">${escapeHtml(tc.module || tc.moduleId || 'M01')}</span>
          </td>
          <td style="text-align:center">
            <span class="badge ${tc.priority === 'P1' ? 'badge-fail' : 'badge-info'}" style="font-size:10px">${escapeHtml(tc.priority || 'P2')}</span>
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-primary); font-size:12.5px">${escapeHtml(tc.title || tc.name || '')}</div>
          </td>
          <td style="text-align:center; font-size:11.5px; color:var(--text-muted)">
            ${escapeHtml(tc.suite || 'REGRESSION')}
          </td>
          <td style="text-align:center">${stBadge}</td>
          <td style="text-align:center">
            <span class="badge ${isChecked ? 'badge-pass' : 'badge-outline'}" style="font-size:10px">
              ${isChecked ? '✅ Đã chọn' : 'Bỏ qua'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleTcInScope(tcId, isChecked) {
    if (isChecked) {
      this.tempScopeSelectedIds.add(tcId);
    } else {
      this.tempScopeSelectedIds.delete(tcId);
    }
    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
  },

  toggleCurrentViewTcs(isChecked) {
    let tcs = this.currentCycleVersionTcs || [];
    if (this.selectedScopeModuleId) {
      tcs = tcs.filter(t => (t.moduleId || t.module) === this.selectedScopeModuleId);
    }
    tcs.forEach(t => {
      if (isChecked) this.tempScopeSelectedIds.add(t.id);
      else this.tempScopeSelectedIds.delete(t.id);
    });
    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  applyScopePreset(presetKey) {
    const all = this.currentCycleVersionTcs || [];
    if (presetKey === 'all') {
      this.tempScopeSelectedIds = new Set(all.map(t => t.id));
    } else if (presetKey === 'none') {
      this.tempScopeSelectedIds.clear();
    } else if (presetKey === 'failed') {
      this.tempScopeSelectedIds.clear();
      all.forEach(t => {
        const isFail = ((state.results || {})[t.id]?.status || '').toLowerCase().includes('fail');
        if (isFail) this.tempScopeSelectedIds.add(t.id);
      });
    } else if (presetKey === 'p1_p2') {
      this.tempScopeSelectedIds.clear();
      all.forEach(t => {
        if (t.priority === 'P1' || t.priority === 'P2') this.tempScopeSelectedIds.add(t.id);
      });
    } else if (presetKey === 'smoke') {
      this.tempScopeSelectedIds.clear();
      all.forEach(t => {
        if (t.priority === 'P1' || (t.type || '').toLowerCase().includes('smoke')) {
          this.tempScopeSelectedIds.add(t.id);
        }
      });
    }
    this.updateScopeKpiAndCounters();
    this.renderScopeSidebar();
    this.renderScopeTcTable();
  },

  filterScopeTable() {
    this.renderScopeTcTable();
  },

  resetScopeFilters() {
    const search = document.getElementById('mcs-search');
    if (search) search.value = '';
    const prio = document.getElementById('mcs-filter-prio');
    if (prio) prio.value = '';
    const hist = document.getElementById('mcs-filter-history');
    if (hist) hist.value = '';
    this.renderScopeTcTable();
  },

  confirmSaveCycleScope() {
    if (!this.activeScopeCycleId) return;
    const selectedArray = Array.from(this.tempScopeSelectedIds);

    if (typeof saveCycleScope === 'function') {
      saveCycleScope(this.activeScopeCycleId, selectedArray, 'CUSTOM');
    }

    closeModal('modal-cycle-scope');
    showToast(`✅ Đã lưu cấu hình phạm vi (${selectedArray.length} kịch bản) cho đợt test!`, 'success');
    this.renderCycleCards();
    this.renderCyclesMatrix();
    this.renderVersionOverview();
    LeadContext.renderCompactProjectBar();
  },

  // Modal Module
  openAddModuleModal() {
    document.getElementById('new-mod-id').value = '';
    document.getElementById('new-mod-name').value = '';
    document.getElementById('new-mod-desc').value = '';
    openModal('modal-add-module');
  },

  confirmAddModule() {
    const p = getActiveProject();
    if (!p) return;

    const id = (document.getElementById('new-mod-id').value || '').trim();
    const name = (document.getElementById('new-mod-name').value || '').trim();
    const desc = (document.getElementById('new-mod-desc').value || '').trim();

    if (!id || !name) {
      showToast('⚠️ Vui lòng nhập Mã và Tên phân hệ!', 'error');
      return;
    }

    if (!p.modules) p.modules = [];
    if (p.modules.some(m => m.id === id)) {
      showToast(`⚠️ Mã phân hệ [${id}] đã tồn tại trong dự án!`, 'error');
      return;
    }

    p.modules.push({ id, name, desc });
    saveCoreState();
    closeModal('modal-add-module');
    showToast(`✅ Đã thêm phân hệ [${id}] ${name} thành công!`, 'success');
    this.renderModuleTree();
    this.renderVersionOverview();
  },

  openAddTestCaseModal() {
    const p = getActiveProject();
    if (!p) return;
    window.location.href = `testcases.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(this.currentVersion)}&action=new`;
  },

  openEditVersionModal() {
    this.switchVersionTab('settings');
  },

  // ==================== TAB 5: CÀI ĐẶT & CHUẨN NGHIỆM THU PHIÊN BẢN ====================
  populateVersionSettings() {
    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const vObj = versions.find(v => (v.version || v) === this.currentVersion) || { version: this.currentVersion };

    const tagEl = document.getElementById('vset-tag');
    if (tagEl) tagEl.value = this.currentVersion;

    const labelEl = document.getElementById('vset-label');
    if (labelEl) labelEl.value = vObj.label || vObj.name || `Phiên bản ${this.currentVersion}`;

    const relTypeEl = document.getElementById('vset-release-type');
    if (relTypeEl) relTypeEl.value = vObj.releaseType || 'MAJOR';

    const statusVal = vObj.status || (this.currentVersion === p.activeVersion ? 'ACTIVE' : 'PLANNING');
    this.setLifecycleStatus(statusVal, false);

    // Badges in Header
    const tagBadge = document.getElementById('v-settings-tag-badge');
    if (tagBadge) tagBadge.textContent = this.currentVersion;

    // Dates
    const startEl = document.getElementById('vset-start-date');
    if (startEl) startEl.value = vObj.startDate || p.startDate || '';

    const freezeEl = document.getElementById('vset-freeze-date');
    if (freezeEl) freezeEl.value = vObj.freezeDate || '';

    const targetEl = document.getElementById('vset-target-date');
    if (targetEl) targetEl.value = vObj.targetDate || vObj.releaseDate || p.endDate || '';

    // Quality Gate
    const qg = vObj.qualityGate || p.qualityGates || {};
    const passInput = document.getElementById('vset-qg-pass');
    if (passInput) passInput.value = qg.minPassRate ?? 95;

    const p1Input = document.getElementById('vset-qg-p1');
    if (p1Input) p1Input.value = qg.maxP1 ?? (qg.maxBlockerBugs ?? 0);

    const p2Input = document.getElementById('vset-qg-p2');
    if (p2Input) p2Input.value = qg.maxP2 ?? (qg.maxCriticalBugs ?? 2);

    const p3Input = document.getElementById('vset-qg-p3');
    if (p3Input) p3Input.value = qg.maxP3 ?? (qg.maxMajorBugs ?? 5);

    // Release Notes
    const notesEl = document.getElementById('vset-changelog');
    if (notesEl) {
      notesEl.value = vObj.changelog || vObj.releaseNotes || '';
    }

    // Environment & Devices
    const envUrlEl = document.getElementById('vset-env-url');
    if (envUrlEl) envUrlEl.value = vObj.stagingUrl || p.targetEnvironmentUrl || '';

    const envBuildEl = document.getElementById('vset-env-build');
    if (envBuildEl) envBuildEl.value = vObj.gitBranch || (this.currentVersion ? `release/${this.currentVersion}` : '');

    // Platforms
    const platforms = vObj.targetPlatforms || ['web-chrome', 'web-firefox', 'mobile-android', 'mobile-ios', 'ai-camera', 'rfid'];
    ['web-chrome', 'web-firefox', 'mobile-android', 'mobile-ios', 'ai-camera', 'rfid'].forEach(key => {
      const cb = document.getElementById(`vset-dev-${key}`);
      const chip = document.getElementById(`chip-dev-${key}`);
      const isActive = platforms.includes(key);
      if (cb) cb.checked = isActive;
      if (chip) {
        if (isActive) chip.classList.add('active');
        else chip.classList.remove('active');
      }
    });

    // SLA
    const sla = vObj.sla || {};
    const slaP1 = document.getElementById('vset-sla-p1');
    if (slaP1) slaP1.value = sla.p1Hours ?? 4;
    const slaP2 = document.getElementById('vset-sla-p2');
    if (slaP2) slaP2.value = sla.p2Hours ?? 24;
    const slaP3 = document.getElementById('vset-sla-p3');
    if (slaP3) slaP3.value = sla.p3Hours ?? 72;

    // Evaluate Quality Gate UI
    this.evalQualityGateUI();
  },

  setLifecycleStatus(st, markDirty = true) {
    const hiddenInput = document.getElementById('vset-status');
    if (hiddenInput) hiddenInput.value = st;

    // Cập nhật các nút stepper
    const stepperWrap = document.getElementById('vset-stepper-wrap');
    if (stepperWrap) {
      stepperWrap.querySelectorAll('.vset-step-btn').forEach(btn => {
        if (btn.getAttribute('data-status') === st) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Cập nhật badge trên header tab 5
    const statusBadge = document.getElementById('v-settings-status-badge');
    if (statusBadge) {
      statusBadge.textContent = st;
      if (st === 'ACTIVE') {
        statusBadge.style.cssText = 'background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:11px';
      } else if (st === 'RELEASED') {
        statusBadge.style.cssText = 'background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe; font-weight:800; font-size:11px';
      } else if (st === 'CODE_FREEZE') {
        statusBadge.style.cssText = 'background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:800; font-size:11px';
      } else {
        statusBadge.style.cssText = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:800; font-size:11px';
      }
    }

    if (markDirty) {
      showToast(`🔄 Đã chuyển trạng thái phiên bản sang: ${st}`, 'info');
    }
  },

  togglePlatformChip(checkboxId, chipElement) {
    const cb = document.getElementById(checkboxId);
    if (!cb) return;
    cb.checked = !cb.checked;
    if (cb.checked) {
      chipElement.classList.add('active');
    } else {
      chipElement.classList.remove('active');
    }
  },

  insertReleaseNotesTemplate(templateType) {
    const notesEl = document.getElementById('vset-changelog');
    if (!notesEl) return;
    let snippet = '';
    if (templateType === 'features') {
      snippet = '\n\n### 🚀 Tính năng mới và cải tiến:\n- [MOD-01] Hoàn thiện các phân hệ giao diện và nghiệp vụ cốt lõi\n- [MOD-02] Tối ưu hóa hiệu năng xử lý tác vụ đồng thời và truy xuất dữ liệu\n- [MOD-03] Bổ sung báo cáo đối soát và bảng điều khiển trực quan';
    } else if (templateType === 'bugfix') {
      snippet = '\n\n### 🔧 Các lỗi đã khắc phục:\n- [BUG-001] Khắc phục lỗi tương thích hiển thị trên các môi trường trình duyệt\n- [BUG-002] Tối ưu hóa thời gian phản hồi API khi chịu tải cao';
    } else if (templateType === 'scope') {
      snippet = '\n\n### 🎯 Trọng tâm nghiệm thu và cấu hình kiểm thử:\n- Kiểm thử tích hợp toàn diện các phân hệ chức năng chính\n- Đảm bảo thời gian đáp ứng hệ thống dưới 500ms cho các thao tác chuẩn\n- Kiểm tra tính toàn vẹn dữ liệu và bảo mật quyền truy cập';
    }
    notesEl.value = (notesEl.value ? notesEl.value + snippet : snippet.trim());
    notesEl.focus();
    showToast('📝 Đã chèn mẫu ghi chú phát hành!', 'info');
  },

  testEnvUrl() {
    const url = (document.getElementById('vset-env-url')?.value || '').trim();
    if (!url) {
      showToast('⚠️ Vui lòng nhập URL môi trường kiểm thử!', 'warning');
      return;
    }
    window.open(url, '_blank');
  },

  evalQualityGateUI() {
    const p = getActiveProject();
    if (!p) return;

    // Lấy thông số hiện tại từ overview calculations
    const vMetrics = typeof getVersionMetrics === 'function' ? getVersionMetrics(p.id, this.currentVersion) : {};
    const vTcs = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, this.currentVersion) : [];
    const totalTcs = vTcs.length || (vMetrics.totalTcs || 0);
    const passCount = vMetrics.passCount || 0;
    const curPassRate = totalTcs > 0 ? (vMetrics.passRate ?? Math.round((passCount / totalTcs) * 1000) / 10) : 0;

    const allDefects = typeof getProjectDefects === 'function' ? getProjectDefects(p.id) : [];
    const vDefects = allDefects.filter(d => {
      const dv = (d.version || d.detectedInVersion || '').trim().toLowerCase();
      return dv === (this.currentVersion || '').trim().toLowerCase();
    });
    
    let curP1 = 0, curP2 = 0, curP3 = 0;
    vDefects.forEach(d => {
      const isClosed = (d.defectStatus === 'Closed' || d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved');
      if (!isClosed) {
        const sev = (d.severity || d.priority || 'P3').toUpperCase();
        if (sev === 'P1' || sev === 'BLOCKER') curP1++;
        else if (sev === 'P2' || sev === 'CRITICAL') curP2++;
        else if (sev === 'P3' || sev === 'MAJOR') curP3++;
      }
    });

    // Lấy target từ input
    const targetPass = parseFloat(document.getElementById('vset-qg-pass')?.value || '95');
    const targetP1 = parseInt(document.getElementById('vset-qg-p1')?.value || '0', 10);
    const targetP2 = parseInt(document.getElementById('vset-qg-p2')?.value || '2', 10);
    const targetP3 = parseInt(document.getElementById('vset-qg-p3')?.value || '5', 10);

    const passOk = totalTcs > 0 && curPassRate >= targetPass;
    const p1Ok = curP1 <= targetP1;
    const p2Ok = curP2 <= targetP2;
    const p3Ok = curP3 <= targetP3;

    // Update rule badges
    const elPass = document.getElementById('vset-eval-pass');
    if (elPass) {
      if (totalTcs === 0) {
        elPass.className = 'badge';
        elPass.style.background = 'rgba(100,116,139,0.12)';
        elPass.style.color = '#64748b';
        elPass.textContent = 'Chờ nạp kịch bản (0)';
      } else {
        elPass.className = `badge ${passOk ? 'badge-pass' : 'badge-fail'}`;
        elPass.textContent = passOk ? `Đạt: ${curPassRate}%` : `Hiện tại: ${curPassRate}%`;
      }
    }

    const elP1 = document.getElementById('vset-eval-p1');
    if (elP1) {
      elP1.className = `badge ${p1Ok ? 'badge-pass' : 'badge-fail'}`;
      elP1.textContent = p1Ok ? `Đạt: ${curP1} lỗi` : `Vượt trần: ${curP1} lỗi`;
    }

    const elP2 = document.getElementById('vset-eval-p2');
    if (elP2) {
      elP2.className = `badge ${p2Ok ? 'badge-pass' : 'badge-fail'}`;
      elP2.textContent = p2Ok ? `Đạt: ${curP2} lỗi` : `Vượt trần: ${curP2} lỗi`;
    }

    const elP3 = document.getElementById('vset-eval-p3');
    if (elP3) {
      elP3.className = `badge ${p3Ok ? 'badge-pass' : 'badge-fail'}`;
      elP3.textContent = p3Ok ? `Đạt: ${curP3} lỗi` : `Vượt trần: ${curP3} lỗi`;
    }

    // Overall Gate Status
    const overallEl = document.getElementById('vset-qg-overall-badge');
    if (overallEl) {
      if (totalTcs === 0) {
        overallEl.innerHTML = `<span class="badge" style="background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1; font-weight:800; font-size:11px">⚪ Khởi tạo (Chờ nạp kịch bản)</span>`;
      } else if (passOk && p1Ok && p2Ok && p3Ok) {
        overallEl.innerHTML = `<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:11px">🟢 Đủ điều kiện nghiệm thu</span>`;
      } else {
        overallEl.innerHTML = `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:800; font-size:11px">⚠️ Chưa đủ điều kiện nghiệm thu</span>`;
      }
    }
  },

  saveVersionSettings() {
    const p = getActiveProject();
    if (!p) {
      showToast('⚠️ Không tìm thấy thông tin dự án hiện tại!', 'error');
      return;
    }

    const tag = (document.getElementById('vset-tag')?.value || '').trim();
    const label = (document.getElementById('vset-label')?.value || '').trim();
    const releaseType = document.getElementById('vset-release-type')?.value || 'MAJOR';
    const status = document.getElementById('vset-status')?.value || 'ACTIVE';
    const startDate = document.getElementById('vset-start-date')?.value || '';
    const freezeDate = document.getElementById('vset-freeze-date')?.value || '';
    const targetDate = document.getElementById('vset-target-date')?.value || '';
    const changelog = (document.getElementById('vset-changelog')?.value || '').trim();
    const stagingUrl = (document.getElementById('vset-env-url')?.value || '').trim();
    const gitBranch = (document.getElementById('vset-env-build')?.value || '').trim();

    if (!tag || !label) {
      showToast('⚠️ Vui lòng điền mã phiên bản và tên phát hành!', 'error');
      return;
    }

    // Target Platforms
    const targetPlatforms = [];
    ['web-chrome', 'web-firefox', 'mobile-android', 'mobile-ios', 'ai-camera', 'rfid'].forEach(key => {
      const cb = document.getElementById(`vset-dev-${key}`);
      if (cb && cb.checked) targetPlatforms.push(key);
    });

    // Quality Gate
    const minPassRate = parseFloat(document.getElementById('vset-qg-pass')?.value || '95');
    const maxP1 = parseInt(document.getElementById('vset-qg-p1')?.value || '0', 10);
    const maxP2 = parseInt(document.getElementById('vset-qg-p2')?.value || '2', 10);
    const maxP3 = parseInt(document.getElementById('vset-qg-p3')?.value || '5', 10);

    // SLA
    const p1Hours = parseInt(document.getElementById('vset-sla-p1')?.value || '4', 10);
    const p2Hours = parseInt(document.getElementById('vset-sla-p2')?.value || '24', 10);
    const p3Hours = parseInt(document.getElementById('vset-sla-p3')?.value || '72', 10);

    if (!p.versions) p.versions = [];
    let vObj = p.versions.find(v => (v.version || v) === this.currentVersion);
    if (!vObj) {
      vObj = { version: this.currentVersion };
      p.versions.push(vObj);
    } else if (typeof vObj === 'string') {
      const idx = p.versions.indexOf(vObj);
      vObj = { version: this.currentVersion };
      p.versions[idx] = vObj;
    }

    // Assign fields
    vObj.version = tag;
    vObj.label = label;
    vObj.releaseType = releaseType;
    vObj.status = status;
    vObj.startDate = startDate;
    vObj.freezeDate = freezeDate;
    vObj.targetDate = targetDate;
    vObj.releaseDate = targetDate;
    vObj.changelog = changelog;
    vObj.releaseNotes = changelog;
    vObj.stagingUrl = stagingUrl;
    vObj.gitBranch = gitBranch;
    vObj.targetPlatforms = targetPlatforms;
    vObj.qualityGate = { minPassRate, maxP1, maxP2, maxP3 };
    vObj.sla = { p1Hours, p2Hours, p3Hours };

    if (status === 'ACTIVE') {
      p.activeVersion = tag;
    }

    saveCoreState();
    showToast('✅ Đã lưu cấu hình phiên bản và tiêu chuẩn nghiệm thu thành công!', 'success');

    // Update Header and UI
    this.renderVersionHeader();
    this.renderVersionOverview();
    LeadContext.renderCompactProjectBar();
  },

  confirmSaveVersion() {
    // Sync from Modal 4 if opened
    const p = getActiveProject();
    if (!p) return;
    const tag = document.getElementById('ve-tag')?.value;
    const label = document.getElementById('ve-label')?.value;
    const status = document.getElementById('ve-status')?.value;
    const date = document.getElementById('ve-date')?.value;
    const changelog = document.getElementById('ve-changelog')?.value;

    if (tag && p.versions) {
      let vObj = p.versions.find(v => (v.version || v) === tag);
      if (vObj) {
        if (typeof vObj === 'object') {
          if (label) vObj.label = label;
          if (status) vObj.status = status;
          if (date) { vObj.targetDate = date; vObj.releaseDate = date; }
          if (changelog) { vObj.changelog = changelog; vObj.releaseNotes = changelog; }
        }
        if (status === 'ACTIVE') p.activeVersion = tag;
        saveCoreState();
      }
    }
    closeModal('modal-version-edit');
    showToast('✅ Đã cập nhật thông tin phiên bản!', 'success');
    this.renderVersionHeader();
    this.renderVersionOverview();
    LeadContext.renderCompactProjectBar();
  },

  toggleFreezeVersion() {
    const curStatus = document.getElementById('vset-status')?.value || 'ACTIVE';
    const nextStatus = (curStatus === 'CODE_FREEZE') ? 'ACTIVE' : 'CODE_FREEZE';
    this.setLifecycleStatus(nextStatus);
    showToast(nextStatus === 'CODE_FREEZE' ? '❄️ Đã đóng băng mã nguồn phiên bản!' : '🟢 Đã mở lại trạng thái kiểm thử tích cực!', 'info');
  },

  deleteCurrentVersion() {
    const p = getActiveProject();
    if (!p) return;

    const verTag = this.currentVersion;
    const normVer = (verTag || '').trim().toLowerCase();
    const affectedTcs = (p.testCases || []).filter(tc => ((tc.version || '')).trim().toLowerCase() === normVer).length;
    const allCycles = typeof getTestCyclesForProject === 'function' ? getTestCyclesForProject(p.id, verTag) : (p.testCycles || []);
    const affectedCycles = allCycles.filter(c => ((c.version || '')).trim().toLowerCase() === normVer).length;

    const executeDelete = () => {
      try {
        if (typeof deleteProjectVersion === 'function') {
          deleteProjectVersion(p.id, verTag);
        } else {
          p.versions = (p.versions || []).filter(v => ((v.version || v) || '').trim().toLowerCase() !== normVer);
          p.testCases = (p.testCases || []).filter(tc => ((tc.version || '')).trim().toLowerCase() !== normVer);
          p.testCycles = (p.testCycles || []).filter(c => ((c.version || '')).trim().toLowerCase() !== normVer);
          if (state.testCycles) {
            state.testCycles = state.testCycles.filter(c => !(c.projectId === p.id && ((c.version || '')).trim().toLowerCase() === normVer));
          }
          if (p.activeVersion === verTag) {
            p.activeVersion = p.versions[0]?.version || p.versions[0] || '';
          }
          saveCoreState();
          if (window.pushProjectsToCloud) window.pushProjectsToCloud(state.projects);
          if (window.pushCyclesToCloud) window.pushCyclesToCloud(state.testCycles);
        }

        showToast(`🗑️ Đã xóa thành công phiên bản [${verTag}]!`, 'success');
        setTimeout(() => {
          window.location.href = `project.html?projectId=${encodeURIComponent(p.id)}&tab=versions`;
        }, 400);
      } catch (err) {
        showToast(`❌ Lỗi khi xóa phiên bản: ${err.message}`, 'error');
      }
    };

    if (typeof showConfirmDeleteModal === 'function') {
      showConfirmDeleteModal({
        title: 'XÁC NHẬN XÓA PHIÊN BẢN',
        subtitle: 'Thao tác cấp cao • Loại bỏ phiên bản khỏi không gian dự án',
        itemBadge: '📦 PHIÊN BẢN TEST',
        itemName: `Phiên bản [${verTag}]`,
        projectTitle: p.name || p.code || 'Dự án hiện tại',
        impactStats: [
          { label: 'Kịch bản kiểm thử', value: affectedTcs > 0 ? `${affectedTcs} bài` : '0 bài', icon: '📄', color: '#2563eb' },
          { label: 'Đợt test liên quan', value: affectedCycles > 0 ? `${affectedCycles} đợt` : '0 đợt', icon: '🎯', color: '#d97706' },
          { label: 'Phân công & Kết quả', value: 'Dọn dẹp', icon: '👥', color: '#8b5cf6' },
          { label: 'Database Cloud', value: 'Đồng bộ xóa', icon: '☁️', color: '#16a34a' }
        ],
        warningText: `Cảnh báo: Toàn bộ ${affectedTcs > 0 ? affectedTcs + ' kịch bản kiểm thử, ' : ''}${affectedCycles > 0 ? affectedCycles + ' đợt test và ' : ''}cấu hình của phiên bản [${verTag}] sẽ bị xóa vĩnh viễn khỏi dự án và cơ sở dữ liệu Cloud.\n\nThao tác này không thể hoàn tác!`,
        confirmText: '🗑️ Xác nhận xóa vĩnh viễn',
        onConfirm: executeDelete
      });
    } else {
      if (confirm(`⚠️ Bạn có chắc chắn muốn xóa phiên bản [${verTag}] khỏi dự án? Hành động này không thể hoàn tác!`)) {
        executeDelete();
      }
    }
  },

  updateLinks() {
    // Modular in-context navigation
  }
};

// Export toàn cục
if (typeof window !== 'undefined') {
  window.LeadVersion = LeadVersion;
}
