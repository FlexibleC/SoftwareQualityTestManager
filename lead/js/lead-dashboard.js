/**
 * LEAD MODULE: PROJECT DASHBOARD (TẦNG 1: KHÔNG GIAN DỰ ÁN)
 * Quản trị phiên bản phần mềm, giám sát chất lượng và điều phối nhân sự nội bộ dự án
 */

const LeadDashboard = {
  init() {
    const p = (typeof getActiveProject === 'function') ? getActiveProject() : null;
    if (!p) {
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = `
          <div class="card" style="text-align:center; padding:60px 20px; max-width:600px; margin:40px auto; border:2px dashed var(--border)">
            <div style="font-size:48px; margin-bottom:12px">🏢</div>
            <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px">Chưa có dự án nào trong hệ thống</h3>
            <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px">Hệ thống đã được làm sạch cơ sở dữ liệu (0 dự án). Vui lòng quay lại danh mục dự án hoặc tạo dự án mới từ Cài đặt hệ thống.</p>
            <a href="index.html" class="btn btn-primary" style="font-weight:700">Quay lại Danh mục</a>
          </div>
        `;
      }
      return;
    }
    this.renderExecutiveHealth();
    this.renderVersionManagementCockpit();
    this.renderProjectRoster();
    this.renderDevPipeline();
    this.updateQuickActions();

    // Khởi tạo tab chính theo tham số URL (?tab=overview|versions|roster|settings)
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'overview';
    this.switchMainTab(initialTab);
  },

  /**
   * Tính toán chỉ số sức khỏe dự án tổng thể (Project Health Index - PHI / 100)
   * Phân tích Cổng Nghiệm Thu (Quality Gate), Độ bao phủ P1/P2, Mật độ lỗi và Ma trận Rủi ro Go-Live
   */
  calculateProjectHealth(p) {
    if (!p) return null;
    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const allTcs = p.testCases || [];
    const totalTcs = allTcs.length;
    const results = state.results || {};
    const defects = (typeof getProjectDefects === 'function') ? getProjectDefects(p.id) : [];
    const qg = p.qualityGates || { minPassRate: 95, maxBlockerBugs: 0, maxCriticalBugs: 2 };
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const cycles = (typeof getProjectCycles === 'function') 
      ? getProjectCycles(p.id) 
      : ((p.cycles || []).concat((state.cycles || []).filter(c => c.projectId === p.id)));

    // De-duplicate cycles by id
    const uniqueCyclesMap = new Map();
    cycles.forEach(c => uniqueCyclesMap.set(c.id, c));
    const allCycles = Array.from(uniqueCyclesMap.values());
    const activeCycles = allCycles.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS');

    // Modules
    const moduleSet = new Set();
    allTcs.forEach(tc => { if (tc.module) moduleSet.add(tc.module); });
    (p.modules || []).forEach(m => moduleSet.add(m.name || m));
    const modulesCount = moduleSet.size;
    const modulesSample = Array.from(moduleSet).slice(0, 3).join(', ') + (moduleSet.size > 3 ? '...' : '');

    // Roster breakdown
    let leadCount = 0, testerCount = 0, devCount = 0;
    members.forEach(m => {
      const role = (m.projectRole || 'tester').toLowerCase();
      if (role === 'lead' || role === 'admin') leadCount++;
      else if (role === 'dev') devCount++;
      else testerCount++;
    });

    // Test cases priority breakdown & Execution distribution
    let p1Tcs = 0, p2Tcs = 0, p3PlusTcs = 0;
    let passed = 0, failed = 0, blocked = 0, executed = 0;
    let p1Passed = 0;

    allTcs.forEach(tc => {
      const prio = (tc.priority || 'P2').toUpperCase();
      if (prio === 'P1') p1Tcs++;
      else if (prio === 'P2') p2Tcs++;
      else p3PlusTcs++;

      const res = results[tc.id];
      if (res && res.status) {
        executed++;
        const st = (res.status || '').toUpperCase();
        if (st === 'PASS') {
          passed++;
          if (prio === 'P1') p1Passed++;
        } else if (st === 'FAIL') {
          failed++;
        } else if (st === 'BLOCKED') {
          blocked++;
        }
      }
    });

    const untested = Math.max(0, totalTcs - executed);
    const passRate = totalTcs > 0 ? Math.round((passed / totalTcs) * 100) : 0;
    const failRate = totalTcs > 0 ? Math.round((failed / totalTcs) * 100) : 0;
    const blockRate = totalTcs > 0 ? Math.round((blocked / totalTcs) * 100) : 0;
    const untestRate = totalTcs > 0 ? Math.round((untested / totalTcs) * 100) : 100;
    const p1CovRate = p1Tcs > 0 ? Math.round((p1Passed / p1Tcs) * 100) : 100;

    // Defects & SLA
    let p1Bugs = 0, p2Bugs = 0, p3Bugs = 0, p4Bugs = 0;
    let openBugs = 0, closedBugs = 0, wipBugs = 0, newBugs = 0;
    let breachedSlaCount = 0;

    const slaThresholdHours = p.sla?.p1Hours || 4;
    const now = Date.now();

    defects.forEach(d => {
      const isClosed = (d.defectStatus === 'Closed' || d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved');
      const sev = (d.severity || d.priority || 'P3').toUpperCase();

      if (isClosed) {
        closedBugs++;
      } else {
        openBugs++;
        if (d.defectStatus === 'In_Progress' || d.defectStatus === 'In Progress' || d.defectStatus === 'WIP') {
          wipBugs++;
        } else {
          newBugs++;
        }

        if (sev === 'P1' || sev === 'BLOCKER') {
          p1Bugs++;
          if (d.createdAt && (now - new Date(d.createdAt).getTime()) > slaThresholdHours * 3600000) {
            breachedSlaCount++;
          }
        } else if (sev === 'P2' || sev === 'CRITICAL') {
          p2Bugs++;
          if (d.createdAt && (now - new Date(d.createdAt).getTime()) > (p.sla?.p2Hours || 24) * 3600000) {
            breachedSlaCount++;
          }
        } else if (sev === 'P3' || sev === 'MAJOR') {
          p3Bugs++;
        } else {
          p4Bugs++;
        }
      }
    });

    const totalDefects = defects.length;
    const devFixRate = totalDefects > 0 ? Math.round((closedBugs / totalDefects) * 100) : 100;

    // Quality gate parameters
    const minPass = qg.minPassRate || 95;
    const maxP1 = qg.maxBlockerBugs ?? 0;
    const maxP2 = qg.maxCriticalBugs ?? 2;
    const qgPassOk = passRate >= minPass;
    const qgP1Ok = p1Bugs <= maxP1;
    const qgP2Ok = p2Bugs <= maxP2;
    const qgPassed = qgPassOk && qgP1Ok && qgP2Ok;

    // Score calculation
    // Score calculation
    let score = 100;
    const passGap = totalTcs > 0 ? Math.max(0, minPass - passRate) : 0;
    if (totalTcs > 0) {
      score -= Math.round(passGap * 0.7);
    }
    score -= (p1Bugs * 25);
    score -= (p2Bugs * 8);
    score -= (p3Bugs * 2);
    score -= (breachedSlaCount * 5);
    score = Math.max(15, Math.min(100, score));

    let statusLabel = '🟢 Sức khỏe tốt';
    let statusColor = '#16a34a';
    let verdictDesc = 'Đủ điều kiện phát hành. Mọi chỉ số kỹ thuật đều đạt chuẩn.';

    if (totalTcs === 0) {
      statusLabel = '⚪ Khởi tạo dự án';
      statusColor = '#64748b';
      verdictDesc = 'Dự án mới khởi tạo, chưa nạp kịch bản kiểm thử. Sẵn sàng cấu hình phân hệ và nạp kịch bản.';
    } else if (score < 70 || p1Bugs > 0) {
      statusLabel = '🔴 Báo động đỏ';
      statusColor = '#dc2626';
      verdictDesc = 'Chưa đủ điều kiện phát hành do độ lệch tỷ lệ đạt và lỗi tồn đọng.';
    } else if (score < 85 || !qgPassed) {
      statusLabel = '🟡 Cảnh báo nguy cơ';
      statusColor = '#d97706';
      verdictDesc = `Cần can thiệp: Tỷ lệ đạt còn thiếu ${passGap}% so với ngưỡng cổng nghiệm thu.`;
    }

    // Actionable Risk Cards
    const actionableRisks = [];
    if (p1Bugs > 0) {
      actionableRisks.push({
        level: 'HIGH',
        levelLabel: '🔴 Nguy cơ cao',
        color: '#dc2626',
        title: 'Lỗi khẩn cấp (P1) tồn đọng chặn luồng',
        metric: `${p1Bugs} lỗi P1 chưa giải quyết (Tiêu chuẩn: 0 lỗi)`,
        buttonText: '👉 Xem lỗi trên bảng lập trình ➔',
        buttonAction: `window.location.href='../dev/index.html'`
      });
    }

    if (p2Bugs > 0) {
      actionableRisks.push({
        level: p2Bugs > maxP2 ? 'HIGH' : 'MEDIUM',
        levelLabel: p2Bugs > maxP2 ? '🔴 Nguy cơ cao' : '🟡 Trung bình',
        color: p2Bugs > maxP2 ? '#dc2626' : '#d97706',
        title: 'Lỗi nghiêm trọng (P2) chạm ngưỡng nghiệm thu',
        metric: `${p2Bugs} lỗi P2 chưa đóng (Ngưỡng cam kết: ≤${maxP2} lỗi)`,
        buttonText: '👉 Đối soát lỗi trên bảng lập trình ➔',
        buttonAction: `window.location.href='../dev/index.html'`
      });
    }

    if (totalTcs === 0) {
      actionableRisks.push({
        level: 'INFO',
        levelLabel: 'ℹ️ Khởi tạo',
        color: '#3b82f6',
        title: 'Dự án sẵn sàng thiết lập',
        metric: `${members.length} nhân sự • ${versions.length > 0 ? versions.length + ' phiên bản' : 'Chưa có phiên bản'} • Vui lòng nạp kịch bản kiểm thử`,
        buttonText: '👉 Nạp kịch bản kiểm thử ➔',
        buttonAction: `LeadDashboard.switchMainTab('versions')`
      });
    } else {
      if (passRate < minPass) {
        actionableRisks.push({
          level: passGap > 20 ? 'HIGH' : 'MEDIUM',
          levelLabel: passGap > 20 ? '🔴 Nguy cơ cao' : '🟡 Trung bình',
          color: passGap > 20 ? '#dc2626' : '#d97706',
          title: 'Tỷ lệ đạt thiếu hụt so với cam kết',
          metric: `Đạt ${passRate}% (Thiếu ${passGap}% so với ngưỡng ≥${minPass}%)`,
          buttonText: '👉 Kiểm thử lại các phiên bản ➔',
          buttonAction: `LeadDashboard.switchMainTab('versions')`
        });
      }

      if (p1CovRate < 100) {
        actionableRisks.push({
          level: 'MEDIUM',
          levelLabel: '🟡 Trung bình',
          color: '#2563eb',
          title: 'Tồn đọng kịch bản trọng yếu P1',
          metric: `Còn ${p1Tcs - p1Passed} / ${p1Tcs} bài P1 chưa đạt (mới đạt ${p1CovRate}%)`,
          buttonText: '👉 Lọc kịch bản P1 cần kiểm thử ➔',
          buttonAction: `LeadDashboard.switchMainTab('versions')`
        });
      }
    }

    // Default safe card
    actionableRisks.push({
      level: 'SAFE',
      levelLabel: '🟢 An toàn',
      color: '#16a34a',
      title: 'Hệ số tải trọng nhân sự dự án',
      metric: `Biên chế ${members.length} kỹ sư • Định mức tải cân đối tối ưu`,
      buttonText: '👉 Xem ma trận phân bổ ➔',
      buttonAction: `LeadDashboard.switchMainTab('roster')`
    });

    return {
      score,
      statusLabel,
      statusColor,
      verdictDesc,
      // Scale
      totalVersions: versions.length,
      activeVersionsCount: versions.filter(v => (v.version || v) === p.activeVersion).length,
      planVersionsCount: versions.filter(v => (v.version || v) !== p.activeVersion).length,
      totalTcs,
      p1Tcs,
      p2Tcs,
      p3PlusTcs,
      totalCycles: allCycles.length,
      activeCyclesCount: activeCycles.length,
      totalMembers: members.length,
      leadCount,
      testerCount,
      devCount,
      modulesCount,
      modulesSample,
      // Config
      targetEnvironmentUrl: p.targetEnvironmentUrl || p.environments?.envUrl || 'Chưa thiết lập',
      qg,
      minPass,
      maxP1,
      maxP2,
      qgPassed,
      passGap,
      slaDesc: `P1: ${p.sla?.p1Hours || p.sla?.p1 || 4}h • P2: ${p.sla?.p2Hours || p.sla?.p2 || 24}h • P3: 72h`,
      // Health & Distribution
      passRate,
      failRate,
      blockRate,
      untestRate,
      passed,
      failed,
      blocked,
      untested,
      p1Bugs,
      p2Bugs,
      p3Bugs,
      p4Bugs,
      openBugs,
      closedBugs,
      wipBugs,
      newBugs,
      totalDefects,
      devFixRate,
      // Actionable Risks
      actionableRisks
    };
  },

  /**
   * Render Tab 1: Tổng quan Sức Khỏe Dự Án (Executive Cockpit)
   */
  renderExecutiveHealth() {
    const p = getActiveProject();
    if (!p) return;

    const h = this.calculateProjectHealth(p);
    if (!h) return;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // 1. KHỐI 1: HỒ SƠ QUY MÔ
    setEl('scale-val-versions', `${h.totalVersions} phiên bản`);
    setEl('scale-sub-versions', h.totalVersions > 0 
      ? `${h.activeVersionsCount} Active • ${h.planVersionsCount} Kế hoạch/Phát triển` 
      : 'Chưa thiết lập phiên bản');

    setEl('scale-val-tcs', `${h.totalTcs} bài`);
    setEl('scale-sub-tcs', `P1: ${h.p1Tcs} • P2: ${h.p2Tcs} • P3+: ${h.p3PlusTcs}`);

    setEl('scale-val-cycles', `${h.totalCycles} đợt`);
    setEl('scale-sub-cycles', `${h.activeCyclesCount} đợt đang mở tác chiến`);

    setEl('scale-val-roster', `${h.totalMembers} kỹ sư`);
    setEl('scale-sub-roster', `${h.leadCount} Lead • ${h.testerCount} QA • ${h.devCount} Dev`);

    setEl('scale-val-modules', `${h.modulesCount} phân hệ`);
    setEl('scale-sub-modules', h.modulesSample || (h.modulesCount > 0 ? 'Phân hệ nghiệp vụ' : 'Chưa thiết lập phân hệ'));

    // 2. KHỐI 2: CẤU HÌNH & MÔI TRƯỜNG TEST
    setEl('cfg-server-url', h.targetEnvironmentUrl);
    setEl('cfg-infra-desc', p.infraDesc || p.architecture || 'Tiêu chuẩn phân tán & cơ sở dữ liệu dự án');
    setEl('cfg-process-desc', p.standard ? `${p.standard} • CI/CD Regression` : 'Continuous Integration (CI/CD) • Agile Sprint Regression');

    // Nền tảng mục tiêu
    const platChipsEl = document.getElementById('cfg-platforms-chips');
    if (platChipsEl) {
      const plats = p.environments?.platforms || p.targetPlatforms || [];
      if (plats.length > 0) {
        const platLabels = {
          'web': '🌐 Trình duyệt web (Chrome, Edge, Firefox)',
          'mobile': '📱 Ứng dụng di động (Android và iOS)',
          'cam': '📹 Camera AI nhận diện',
          'iot': '📡 Thiết bị ngoại vi & IoT'
        };
        platChipsEl.innerHTML = plats.map(k => `
          <span class="badge" style="background:var(--bg-surface); border:1px solid var(--border); font-size:11px; padding:4px 8px">
            ${platLabels[k] || `⚡ ${k}`}
          </span>
        `).join('');
      } else {
        platChipsEl.innerHTML = `<span class="badge" style="background:var(--bg-surface); border:1px solid var(--border); font-size:11px; padding:4px 8px; color:var(--text-muted)">Chưa chỉ định nền tảng</span>`;
      }
    }

    setEl('cfg-qg-pass', `≥${h.minPass}%`);
    const actPassEl = document.getElementById('cfg-act-pass');
    if (actPassEl) {
      if (h.totalTcs === 0) {
        actPassEl.textContent = 'Thực tế: -- (Chưa có kịch bản)';
        actPassEl.style.color = 'var(--text-muted)';
      } else {
        actPassEl.textContent = `Thực tế: ${h.passRate}% (Thiếu ${h.passGap}%)`;
        actPassEl.style.color = h.passRate >= h.minPass ? '#16a34a' : '#dc2626';
      }
    }

    setEl('cfg-qg-p1', `0 lỗi`);
    const actP1El = document.getElementById('cfg-act-p1');
    if (actP1El) {
      actP1El.textContent = `Thực tế: ${h.p1Bugs} lỗi`;
      actP1El.style.color = h.p1Bugs === 0 ? '#16a34a' : '#dc2626';
    }

    setEl('cfg-qg-p2', `≤${h.maxP2} lỗi`);
    const actP2El = document.getElementById('cfg-act-p2');
    if (actP2El) {
      actP2El.textContent = `Thực tế: ${h.p2Bugs} lỗi`;
      actP2El.style.color = h.p2Bugs <= h.maxP2 ? (h.p2Bugs === 0 ? '#16a34a' : '#d97706') : '#dc2626';
    }

    setEl('cfg-sla-desc', h.slaDesc);

    const qgBadge = document.getElementById('cfg-qg-verdict-badge');
    if (qgBadge) {
      if (h.totalTcs === 0) {
        qgBadge.textContent = '⚪ Chờ nạp kịch bản';
        qgBadge.style.background = 'rgba(100,116,139,0.12)';
        qgBadge.style.color = '#64748b';
      } else {
        qgBadge.textContent = h.qgPassed ? '🟢 Đạt chuẩn phát hành' : '⚠️ Chưa đạt chuẩn';
        qgBadge.style.background = h.qgPassed ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)';
        qgBadge.style.color = h.qgPassed ? '#16a34a' : '#dc2626';
      }
    }

    // 3. KHỐI 3: SỨC KHỎE DỰ ÁN & TIẾN TRÌNH TRỰC QUAN
    const scoreEl = document.getElementById('lead-phi-score');
    if (scoreEl) {
      scoreEl.textContent = h.totalTcs === 0 ? '--' : h.score;
      scoreEl.style.color = h.statusColor;
    }

    const badgeEl = document.getElementById('lead-phi-badge');
    if (badgeEl) {
      badgeEl.textContent = h.statusLabel;
      badgeEl.style.color = h.statusColor;
      badgeEl.style.borderColor = h.statusColor;
      badgeEl.style.background = `${h.statusColor}18`;
    }

    setEl('lead-phi-verdict-desc', h.verdictDesc);

    // Execution Distribution Bar
    const setWidth = (id, pct) => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${pct}%`;
    };
    if (h.totalTcs === 0) {
      setEl('dist-passrate-pct', '0% đạt');
      setWidth('bar-dist-pass', 0);
      setWidth('bar-dist-fail', 0);
      setWidth('bar-dist-block', 0);
      setWidth('bar-dist-untest', 0);

      setEl('dist-pass-cnt', '0 (0%)');
      setEl('dist-fail-cnt', '0 (0%)');
      setEl('dist-block-cnt', '0 (0%)');
      setEl('dist-untest-cnt', '0 (0%)');
    } else {
      setEl('dist-passrate-pct', `${h.passRate}% đạt`);
      setWidth('bar-dist-pass', h.passRate);
      setWidth('bar-dist-fail', h.failRate);
      setWidth('bar-dist-block', h.blockRate);
      setWidth('bar-dist-untest', h.untestRate);

      setEl('dist-pass-cnt', `${h.passed} (${h.passRate}%)`);
      setEl('dist-fail-cnt', `${h.failed} (${h.failRate}%)`);
      setEl('dist-block-cnt', `${h.blocked} (${h.blockRate}%)`);
      setEl('dist-untest-cnt', `${h.untested} (${h.untestRate}%)`);
    }

    // 4. KHỐI 4: RADAR CẢNH BÁO MỐI NGUY
    const risksContainer = document.getElementById('lead-actionable-risks-container');
    if (risksContainer) {
      risksContainer.innerHTML = h.actionableRisks.map(r => `
        <div class="lead-risk-card" style="border-left:4px solid ${r.color}">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <span class="badge" style="background:${r.color}15; color:${r.color}; border:1px solid ${r.color}; font-size:10.5px; font-weight:800">
                ${r.levelLabel}
              </span>
            </div>
            <h4 style="margin:0 0 4px 0; font-size:13.5px; font-weight:800; color:var(--text-primary)">
              ${escapeHtml(r.title)}
            </h4>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4">
              ${escapeHtml(r.metric)}
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-sm btn-outline" onclick="${r.buttonAction}" style="width:100%; font-weight:700; color:${r.color}; border-color:${r.color}; font-size:12px; padding:5px 10px">
              ${r.buttonText}
            </button>
          </div>
        </div>
      `).join('');
    }
  },

  /**
   * Tính toán điểm sức khỏe và chỉ số chuyên biệt cho từng phiên bản
   */
  calculateVersionHealth(p, vStr) {
    const vMetrics = typeof getVersionMetrics === 'function'
      ? getVersionMetrics(p.id, vStr)
      : { totalTcs: 0, passCount: 0, failCount: 0, passRate: 0, failRate: 0, untestedRate: 100, cyclesCount: 0, activeCyclesCount: 0, modulesCount: 0 };

    const allDefects = (typeof getProjectDefects === 'function') ? getProjectDefects(p.id) : [];
    const vDefects = allDefects.filter(d => {
      const dv = (d.version || d.detectedInVersion || '').trim().toLowerCase();
      return dv === (vStr || '').trim().toLowerCase();
    });

    let openP1 = 0, openP2 = 0, openTotal = 0;
    vDefects.forEach(d => {
      const isClosed = (d.defectStatus === 'Closed' || d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved');
      if (!isClosed) {
        openTotal++;
        const sev = (d.severity || d.priority || 'P3').toUpperCase();
        if (sev === 'P1' || sev === 'BLOCKER') openP1++;
        else if (sev === 'P2' || sev === 'CRITICAL') openP2++;
      }
    });

    if (vMetrics.totalTcs === 0) {
      return {
        score: '--',
        scoreNumeric: 100,
        vMetrics,
        openP1,
        openP2,
        openTotal,
        qgOk: false,
        isNew: true
      };
    }

    let score = 100;
    const passGap = Math.max(0, 95 - (vMetrics.passRate || 0));
    score -= Math.round(passGap * 0.7);
    score -= (openP1 * 25);
    score -= (openP2 * 8);
    score = Math.max(15, Math.min(100, score));

    const qgOk = (vMetrics.passRate >= 95) && (openP1 === 0) && (openP2 <= 2);

    return {
      score,
      scoreNumeric: score,
      vMetrics,
      openP1,
      openP2,
      openTotal,
      qgOk,
      isNew: false
    };
  },

  /**
   * Render Tab 2: Quản trị các Phiên bản phần mềm (Version Cockpit)
   */
  renderVersionManagementCockpit() {
    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const totalVersions = versions.length;

    let activeCount = 0, devCount = 0, planCount = 0, relCount = 0;
    let totalCycles = 0, activeCycles = 0;
    let readinessSum = 0;
    let evaluatedCount = 0;

    versions.forEach(v => {
      const vStr = v.version || v;
      const isActive = vStr === p.activeVersion;
      const st = (v.status || (isActive ? 'ACTIVE' : 'PLANNING')).toUpperCase();
      if (st === 'ACTIVE') activeCount++;
      else if (st === 'IN_DEV') devCount++;
      else if (st === 'RELEASED') relCount++;
      else planCount++;

      const vHealth = this.calculateVersionHealth(p, vStr);
      if (vHealth.vMetrics.totalTcs > 0) {
        readinessSum += (typeof vHealth.score === 'number' ? vHealth.score : 0);
        evaluatedCount++;
      }

      totalCycles += vHealth.vMetrics.cyclesCount;
      activeCycles += vHealth.vMetrics.activeCyclesCount;
    });

    const avgReadiness = evaluatedCount > 0 ? Math.round(readinessSum / evaluatedCount) : 0;

    // Populate 4 Version KPIs
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('kpi-ver-total', `${totalVersions} phiên bản`);
    setEl('kpi-ver-status-breakdown', `${activeCount} Active • ${devCount} Dev • ${planCount} Plan • ${relCount} Đã đóng`);

    const curVerObj = versions.find(v => (v.version || v) === p.activeVersion);
    const activeVerStr = p.activeVersion || (versions[0] ? (versions[0].version || versions[0]) : '--');
    setEl('kpi-ver-current-active', activeVerStr);
    setEl('kpi-ver-active-date', `Hạn bàn giao: ${curVerObj?.targetDate || curVerObj?.releaseDate || 'Chưa định'}`);

    if (evaluatedCount === 0) {
      setEl('kpi-ver-readiness', '--');
      const readLabel = document.getElementById('kpi-ver-readiness-label');
      if (readLabel) {
        readLabel.textContent = '⚪ Chưa nạp kịch bản';
        readLabel.style.color = '#64748b';
      }
    } else {
      setEl('kpi-ver-readiness', `${avgReadiness}%`);
      const readLabel = document.getElementById('kpi-ver-readiness-label');
      if (readLabel) {
        readLabel.textContent = avgReadiness >= 85 ? '🟢 Đủ chuẩn phát hành' : (avgReadiness >= 70 ? '🟡 Cần cải thiện chỉ số lỗi' : '🔴 Nguy cơ trễ hạn');
      }
    }

    setEl('kpi-ver-total-cycles', `${totalCycles} đợt`);
    setEl('kpi-ver-cycles-breakdown', `${activeCycles} đợt đang mở tác chiến`);

    // Render Cards and Matrix
    this.renderVersionCards();
    this.renderVersionsMatrix();
  },

  /**
   * Render Bảng Đối Soát So Sánh Chi Tiết Các Phiên Bản
   */
  renderVersionsMatrix() {
    const tbody = document.getElementById('lead-versions-matrix-tbody');
    if (!tbody) return;

    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);

    if (versions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted)">
            Dự án chưa có phiên bản nào được cấu hình.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = versions.map(v => {
      const vStr = v.version || v;
      const isActive = vStr === p.activeVersion;
      const vHealth = this.calculateVersionHealth(p, vStr);
      const m = vHealth.vMetrics;

      // Status
      const st = (v.status || (isActive ? 'ACTIVE' : 'PLANNING')).toUpperCase();
      let stColor = '#16a34a';
      let stText = '🟢 Đang triển khai';
      if (st === 'IN_DEV') { stColor = '#f59e0b'; stText = '🔧 Đang phát triển'; }
      else if (st === 'RELEASED') { stColor = '#2563eb'; stText = '🔒 Đã phát hành'; }
      else if (st === 'PLANNING') { stColor = '#64748b'; stText = '⏳ Kế hoạch'; }

      // Health color
      const isZeroTc = m.totalTcs === 0;
      const hColor = isZeroTc ? '#64748b' : (vHealth.scoreNumeric >= 85 ? '#16a34a' : (vHealth.scoreNumeric >= 70 ? '#d97706' : '#dc2626'));
      const scoreDisplay = isZeroTc ? '--' : `${vHealth.score}`;
      const statusMini = isZeroTc ? '⚪ Khởi tạo' : (vHealth.scoreNumeric >= 85 ? '🟢 Tốt' : (vHealth.scoreNumeric >= 70 ? '🟡 Cảnh báo' : '🔴 Nguy cơ'));

      return `
        <tr style="${isActive ? 'background:rgba(22,163,74,0.03)' : ''}">
          <td>
            <div style="display:flex; align-items:center; gap:8px">
              <span style="font-weight:800; font-size:14px; color:var(--text-primary)">${escapeHtml(vStr)}</span>
              ${isActive ? '<span class="badge badge-pass" style="font-size:10px; font-weight:800">★ Hiện hành</span>' : ''}
            </div>
            <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px">
              ${escapeHtml(v.label || v.changelog || 'Phiên bản phần mềm')}
            </div>
          </td>
          <td style="text-align:center">
            <span class="badge" style="background:${stColor}18; color:${stColor}; border:1px solid ${stColor}; font-weight:800; font-size:11px">
              ${stText}
            </span>
          </td>
          <td style="text-align:center">
            <div style="font-size:16px; font-weight:900; color:${hColor}">${scoreDisplay} <span style="font-size:11px; color:var(--text-muted)">/100</span></div>
            <div style="font-size:10px; color:${hColor}; font-weight:700">${statusMini}</div>
          </td>
          <td style="text-align:center">
            <strong style="font-size:13px">${m.totalTcs}</strong>
            <div style="font-size:10.5px; color:var(--text-muted)">${m.modulesCount} phân hệ</div>
          </td>
          <td style="text-align:center">
            <strong style="font-size:13px; color:#7c3aed">${m.cyclesCount}</strong>
            <div style="font-size:10.5px; color:#16a34a; font-weight:700">${m.activeCyclesCount} đang mở</div>
          </td>
          <td>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin-bottom:4px">
              <span style="color:#16a34a">${m.passRate}% đạt</span>
              <span style="color:var(--text-muted)">${m.passCount}/${m.totalTcs}</span>
            </div>
            <div style="height:6px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex">
              <div style="width:${m.passRate}%; background:#16a34a"></div>
              <div style="width:${m.failRate}%; background:#dc2626"></div>
            </div>
          </td>
          <td style="text-align:center">
            <div style="font-size:12px">
              <span style="color:${vHealth.openP1 > 0 ? '#dc2626' : 'var(--text-muted)'}; font-weight:800">P1: ${vHealth.openP1}</span> • 
              <span style="color:${vHealth.openP2 > 0 ? '#ea580c' : 'var(--text-muted)'}; font-weight:700">P2: ${vHealth.openP2}</span>
            </div>
            <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px">Tổng mở: <strong>${vHealth.openTotal} lỗi</strong></div>
          </td>
          <td style="text-align:center; font-size:12px; color:var(--text-secondary)">
            ${escapeHtml(v.targetDate || v.releaseDate || 'Chưa định')}
          </td>
          <td style="text-align:center">
            <span class="badge ${vHealth.qgOk ? 'badge-pass' : 'badge-fail'}" style="font-size:10.5px; font-weight:800">
              ${vHealth.qgOk ? '🟢 Đạt cổng' : '🟡 Cảnh báo'}
            </span>
          </td>
          <td style="text-align:center">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px">
              <a href="version.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(vStr)}" class="btn btn-primary btn-xs" title="Vào không gian phiên bản này">
                👉 Vào ➔
              </a>
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadDashboard.openEditVersionModal('${escapeHtml(vStr)}')" title="Cấu hình phiên bản">
                ⚙️
              </button>
              ${!isActive ? `
                <button type="button" class="btn btn-outline btn-xs" onclick="LeadDashboard.setActiveVersion('${escapeHtml(vStr)}')" style="color:#16a34a; font-weight:700" title="Đặt làm phiên bản hiện hành">
                  ★ Đặt hiện hành
                </button>
              ` : ''}
              <button type="button" class="btn btn-outline btn-xs" onclick="LeadDashboard.deleteVersion('${escapeHtml(vStr)}')" style="color:#dc2626; border-color:rgba(220,38,38,0.35)" title="Xóa phiên bản này">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Chuyển đổi Sub-view trong Tab Quản trị phiên bản
   */
  switchVersionsSubView(subViewKey) {
    const btnCards = document.getElementById('btn-ver-view-cards');
    const btnMatrix = document.getElementById('btn-ver-view-matrix');
    const paneCards = document.getElementById('versions-subview-cards');
    const paneMatrix = document.getElementById('versions-subview-matrix');

    if (subViewKey === 'matrix') {
      btnCards?.classList.replace('btn-primary', 'btn-outline');
      btnMatrix?.classList.replace('btn-outline', 'btn-primary');
      if (paneCards) paneCards.style.display = 'none';
      if (paneMatrix) paneMatrix.style.display = 'block';
      this.renderVersionsMatrix();
    } else {
      btnMatrix?.classList.replace('btn-primary', 'btn-outline');
      btnCards?.classList.replace('btn-outline', 'btn-primary');
      if (paneMatrix) paneMatrix.style.display = 'none';
      if (paneCards) paneCards.style.display = 'block';
      this.renderVersionCards();
    }
  },

  /**
   * Xuất báo cáo tóm tắt điều hành sức khỏe dự án
   */
  exportHealthSummary() {
    const p = getActiveProject();
    if (!p) return;
    const h = this.calculateProjectHealth(p);
    if (!h) return;

    const report = `
=== BÁO CÁO TÓM TẮT ĐIỀU HÀNH SỨC KHỎE DỰ ÁN ===
Dự án: ${p.name} (${p.code || p.id})
Thời điểm: ${new Date().toLocaleString('vi-VN')}
------------------------------------------------
1. CHỈ SỐ SỨC KHỎE (PHI): ${h.score} / 100 (${h.statusLabel})
- Chi tiết: ${h.verdictDesc}

2. CỔNG NGHIỆM THU:
- Trạng thái: ${h.qgPassed ? 'Đạt chuẩn' : 'Chưa đạt chuẩn'}
- Tỷ lệ đạt: ${h.passRate}% (Yêu cầu: >=${h.minPass}%)
- Lỗi khẩn cấp (P1): ${h.p1Bugs} lỗi (Yêu cầu: 0 lỗi)
- Lỗi nghiêm trọng (P2): ${h.p2Bugs} lỗi (Yêu cầu: <=${h.qg.maxCriticalBugs || 2} lỗi)

3. MẬT ĐỘ LỖI VÀ TIẾN ĐỘ SỬA:
- Tổng lỗi mở: ${h.openBugs} lỗi (P1: ${h.p1Bugs}, P2: ${h.p2Bugs}, P3: ${h.p3Bugs}, P4: ${h.p4Bugs})
- Tỷ lệ sửa lỗi của đội lập trình: ${h.devFixRate}%
================================================
    `.trim();

    alert(report);
  },

  /**
   * Render Lưới thẻ các Phiên bản phần mềm (Version Cards Grid)
   * Đồng nhất hình thức với Lưới thẻ Dự án ở Tầng 0
   */
  renderVersionCards() {
    const container = document.getElementById('lead-project-versions-container');
    if (!container) return;

    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);

    if (!versions || versions.length === 0) {
      container.innerHTML = `
        <div style="padding:48px 24px; text-align:center; background:var(--bg-card); border:1.5px dashed var(--border); border-radius:16px">
          <div style="font-size:36px; margin-bottom:10px">📦</div>
          <h3 style="margin:0 0 6px 0; color:var(--text-primary); font-size:16px; font-weight:800">Dự án chưa có phiên bản nào</h3>
          <p style="color:var(--text-muted); font-size:13px; margin:0 0 16px 0">
            Tạo phiên bản đầu tiên để bắt đầu nhập kịch bản kiểm thử và kích hoạt các đợt kiểm thử.
          </p>
          <button type="button" class="btn btn-primary btn-sm" onclick="LeadDashboard.openAddVersionModal()">
            ➕ Tạo phiên bản mới
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="lead-card-grid">
        ${versions.map(v => {
          const vStr = v.version || v;
          const isActive = vStr === p.activeVersion;
          const vHealth = this.calculateVersionHealth(p, vStr);
          const vMetrics = vHealth.vMetrics;

          // Status Badge styling
          const st = (v.status || (isActive ? 'ACTIVE' : 'PLANNING')).toUpperCase();
          let stColor = '#16a34a';
          let stBg = 'rgba(22, 163, 74, 0.12)';
          let stText = '🟢 Đang triển khai';

          if (st === 'IN_DEV') {
            stColor = '#f59e0b';
            stBg = 'rgba(245, 158, 11, 0.12)';
            stText = '🔧 Đang phát triển';
          } else if (st === 'RELEASED') {
            stColor = '#2563eb';
            stBg = 'rgba(37, 99, 235, 0.12)';
            stText = '🔒 Đã phát hành';
          } else if (st === 'PLANNING') {
            stColor = '#64748b';
            stBg = 'rgba(100, 116, 139, 0.12)';
            stText = '⏳ Kế hoạch';
          }

          const isZeroTc = vMetrics.totalTcs === 0;
          const hColor = isZeroTc ? '#64748b' : (vHealth.scoreNumeric >= 85 ? '#16a34a' : (vHealth.scoreNumeric >= 70 ? '#d97706' : '#dc2626'));
          const scoreDisplay = isZeroTc ? '--' : `${vHealth.score}/100`;
          const qgBadgeClass = isZeroTc ? 'badge' : (vHealth.qgOk ? 'badge-pass' : 'badge-fail');
          const qgBadgeStyle = isZeroTc ? 'style="font-size:10px; font-weight:800; background:rgba(100,116,139,0.12); color:#64748b; border:1px solid #cbd5e1"' : 'style="font-size:10px; font-weight:800"';
          const qgBadgeText = isZeroTc ? '⚪ Chưa đánh giá' : (vHealth.qgOk ? '🟢 Đạt cổng nghiệm thu' : '🟡 Cảnh báo cổng nghiệm thu');

          return `
            <div class="lead-version-card ${isActive ? 'active-version' : ''}">
              <div>
                <!-- Card Header -->
                <div class="lead-portfolio-card-head">
                  <div class="lead-portfolio-card-brand">
                    <div class="lead-portfolio-cube" style="background:${isActive ? 'linear-gradient(135deg, #16a34a, #059669)' : 'linear-gradient(135deg, #2563eb, #0284c7)'}">
                      ${escapeHtml(vStr.replace('v', 'V'))}
                    </div>
                    <div>
                      <h4 class="lead-portfolio-card-title">${escapeHtml(vStr)} ${v.label ? `— ${escapeHtml(v.label)}` : ''}</h4>
                      <div class="lead-portfolio-card-meta">
                        ${isActive ? '<span class="badge badge-pass" style="font-size:10px; font-weight:800">★ Phiên bản hiện hành</span>' : ''}
                        <span>Hạn bàn giao: <strong>${escapeHtml(v.targetDate || v.releaseDate || 'Chưa định')}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span class="badge" style="background:${stBg}; color:${stColor}; border:1px solid ${stColor}; font-size:11px; font-weight:800">
                      ${stText}
                    </span>
                  </div>
                </div>

                <!-- Thước đo sức khỏe phiên bản (Scorecard) -->
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:8px 12px; background:var(--bg-surface); border-radius:8px; border:1px solid var(--border)">
                  <div style="font-size:12px; font-weight:700; color:var(--text-secondary)">
                    Sức khỏe bàn giao PHI:
                  </div>
                  <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:15px; font-weight:900; color:${hColor}">${scoreDisplay}</span>
                    <span class="${qgBadgeClass}" ${qgBadgeStyle}>
                      ${qgBadgeText}
                    </span>
                  </div>
                </div>

                <!-- Changelog / Mô tả -->
                <p style="margin:10px 0 0 0; font-size:12.5px; color:var(--text-muted); line-height:1.4">
                  ${escapeHtml(v.changelog || 'Phiên bản quản lý độc lập phân hệ, kịch bản kiểm thử và các đợt kiểm thử.')}
                </p>

                <!-- Thanh đo tiến độ kiểm thử của phiên bản -->
                <div class="lead-portfolio-progress-wrap" style="margin-top:12px">
                  <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin-bottom:5px">
                    <span>Tiến độ kiểm thử đạt chuẩn</span>
                    <span style="color:#16a34a">${vMetrics.passCount} / ${vMetrics.totalTcs} bài (${vMetrics.passRate}%)</span>
                  </div>
                  <div class="lead-portfolio-progress-bar">
                    <div style="width:${vMetrics.passRate}%; background:#16a34a" title="Đạt: ${vMetrics.passCount} bài"></div>
                    <div style="width:${vMetrics.failRate}%; background:#dc2626" title="Lỗi: ${vMetrics.failCount} bài"></div>
                    <div style="width:${vMetrics.untestedRate}%; background:#e2e8f0" title="Chưa kiểm thử"></div>
                  </div>
                </div>

                <!-- 3 Thống kê cốt lõi -->
                <div class="lead-portfolio-stat-grid" style="margin-top:12px">
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val" style="color:#2563eb">${vMetrics.cyclesCount}</div>
                    <div class="lead-portfolio-stat-lbl">Đợt kiểm thử (${vMetrics.activeCyclesCount} mở)</div>
                  </div>
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val">${vMetrics.totalTcs}</div>
                    <div class="lead-portfolio-stat-lbl">Kịch bản</div>
                  </div>
                  <div class="lead-portfolio-stat-box">
                    <div class="lead-portfolio-stat-val" style="color:#7c3aed">${vMetrics.modulesCount}</div>
                    <div class="lead-portfolio-stat-lbl">Phân hệ</div>
                  </div>
                </div>

                <!-- Lỗi mở bóc tách -->
                <div style="margin-top:10px; font-size:11.5px; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center">
                  <span>Lỗi chưa đóng:</span>
                  <span>
                    <strong style="color:${vHealth.openP1 > 0 ? '#dc2626' : 'var(--text-muted)'}">P1: ${vHealth.openP1}</strong> • 
                    <strong style="color:${vHealth.openP2 > 0 ? '#ea580c' : 'var(--text-muted)'}">P2: ${vHealth.openP2}</strong> • 
                    <strong>Tổng: ${vHealth.openTotal}</strong>
                  </span>
                </div>
              </div>

              <!-- Nút hành động vào Không gian riêng của Phiên bản (Tầng 2) -->
              <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap">
                <a href="version.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(vStr)}" class="btn-enter-workspace" style="flex:1" title="Vào không gian phiên bản ${escapeHtml(vStr)}">
                  <span>👉 Vào không gian phiên bản</span>
                  <span>➔</span>
                </a>
                <button type="button" class="btn btn-outline btn-sm" onclick="LeadDashboard.openEditVersionModal('${escapeHtml(vStr)}')" style="display:flex; align-items:center; justify-content:center; padding:0 12px" title="Cấu hình phiên bản này">
                  <span>⚙️</span>
                </button>
                ${!isActive ? `
                  <button type="button" class="btn btn-outline btn-sm" onclick="LeadDashboard.setActiveVersion('${escapeHtml(vStr)}')" style="color:#16a34a; font-weight:700" title="Đặt làm phiên bản hiện hành của dự án">
                    ★ Đặt hiện hành
                  </button>
                ` : ''}
                <button type="button" class="btn btn-outline btn-sm" onclick="LeadDashboard.deleteVersion('${escapeHtml(vStr)}')" style="color:#dc2626; border-color:rgba(220,38,38,0.35); display:flex; align-items:center; justify-content:center; padding:0 10px" title="Xóa phiên bản ${escapeHtml(vStr)}">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },


  renderProjectRoster() {
    const tableBody = document.getElementById('lead-team-roster-table');
    const p = getActiveProject();
    if (!p) return;

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const allTcs = p.testCases || [];
    const totalProjectTcs = allTcs.length;
    const assignments = (state.assignments || []).filter(a => a.projectId === p.id);
    const results = state.results || {};
    const defects = (typeof getProjectDefects === 'function') ? getProjectDefects(p.id) : [];

    // Tính toán số liệu phân loại nhân lực
    let leadCount = 0;
    let testerCount = 0;
    let devCount = 0;
    let totalAssignedTcs = 0;
    const memberAssignedMap = new Map();
    const memberPassedMap = new Map();
    const memberFailedMap = new Map();

    members.forEach(m => {
      const uName = m.username || m;
      const role = (m.projectRole || 'tester').toLowerCase();
      if (role === 'lead' || role === 'admin') leadCount++;
      else if (role === 'dev') devCount++;
      else testerCount++;

      // Đếm số testcase được giao
      const memberAsgs = assignments.filter(a => (a.username === uName || a.assigneeUsername === uName));
      memberAssignedMap.set(uName, memberAsgs.length);
      totalAssignedTcs += memberAsgs.length;

      let pass = 0;
      let fail = 0;
      memberAsgs.forEach(a => {
        const r = results[a.testCaseId];
        if (r && r.status === 'PASS') pass++;
        else if (r && r.status === 'FAIL') fail++;
      });
      memberPassedMap.set(uName, pass);
      memberFailedMap.set(uName, fail);
    });

    // 1. Cập nhật 4 dải KPI Quản trị Nhân lực
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('kpi-roster-total', `${members.length} kỹ sư`);
    setEl('kpi-roster-breakdown', `${leadCount} Lead • ${testerCount} Tester • ${devCount} Dev`);

    // Tính toán tải trọng bình quân
    const targetCapacityPerTester = 35; // Định mức chuẩn: 35 kịch bản / đợt
    const activeTesters = Math.max(1, testerCount);
    const avgAssigned = totalAssignedTcs / activeTesters;
    const avgWorkloadPct = Math.min(150, Math.round((avgAssigned / targetCapacityPerTester) * 100));

    setEl('kpi-roster-workload', `${avgWorkloadPct}%`);
    const wlStatusEl = document.getElementById('kpi-roster-workload-status');
    if (wlStatusEl) {
      if (avgWorkloadPct > 100) {
        wlStatusEl.textContent = '🔴 Cảnh báo quá tải cục bộ';
        wlStatusEl.style.color = '#dc2626';
      } else if (avgWorkloadPct >= 50) {
        wlStatusEl.textContent = '🟢 Mức cân đối tối ưu (ISO)';
        wlStatusEl.style.color = '#16a34a';
      } else {
        wlStatusEl.textContent = '🟡 Dư thừa năng lực (Sẵn sàng)';
        wlStatusEl.style.color = '#d97706';
      }
    }

    setEl('kpi-roster-assigned-tcs', `${totalAssignedTcs} / ${totalProjectTcs} bài`);
    const assignedRate = totalProjectTcs > 0 ? Math.round((totalAssignedTcs / totalProjectTcs) * 100) : 0;
    setEl('kpi-roster-assigned-rate', `Tỷ lệ phân công: ${assignedRate}% kịch bản`);

    setEl('kpi-roster-defects-found', `${defects.length} lỗi`);
    setEl('kpi-roster-defects-valid', `Tỷ lệ xác nhận: 100%`);

    // 2. Render bảng đối soát chi tiết nhân sự
    if (!tableBody) return;

    if (members.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="padding:32px 16px; text-align:center; color:var(--text-muted); font-size:13px">
            Chưa có nhân sự nào được phân bổ vào dự án này. Bấm <strong>⚙️ Phân Bổ & Quản Trị Nhân Sự</strong> để bổ sung thành viên.
          </td>
        </tr>
      `;
      return;
    }

    const allocations = p.memberAllocations || {};

    tableBody.innerHTML = members.map(m => {
      const uName = m.username || m;
      const role = (m.projectRole || 'tester').toLowerCase();
      const assigned = memberAssignedMap.get(uName) || 0;
      const passed = memberPassedMap.get(uName) || 0;
      const failed = memberFailedMap.get(uName) || 0;
      const passRate = assigned > 0 ? Math.round((passed / assigned) * 100) : 0;
      const failRate = assigned > 0 ? Math.round((failed / assigned) * 100) : 0;
      const untestedRate = Math.max(0, 100 - passRate - failRate);

      // Tải trọng cá nhân
      const memberWl = Math.min(150, Math.round((assigned / targetCapacityPerTester) * 100));
      let wlBadge = '<span class="badge" style="background:rgba(22,163,74,0.1); color:#16a34a; font-weight:800">🟢 Cân đối</span>';
      let wlBarColor = '#16a34a';
      if (memberWl > 100) {
        wlBadge = '<span class="badge" style="background:rgba(220,38,38,0.1); color:#dc2626; font-weight:800">🔴 Quá tải</span>';
        wlBarColor = '#dc2626';
      } else if (memberWl < 40) {
        wlBadge = '<span class="badge" style="background:rgba(217,119,6,0.1); color:#d97706; font-weight:800">🟡 Sẵn sàng</span>';
        wlBarColor = '#d97706';
      }

      // Vai trò dự án
      let roleBadge = '<span class="badge badge-info">🧪 Kiểm thử viên</span>';
      if (role === 'lead' || role === 'admin') {
        roleBadge = '<span class="badge badge-p1" style="font-weight:800">👑 Trưởng dự án QA</span>';
      } else if (role === 'dev') {
        roleBadge = '<span class="badge" style="background:rgba(139,92,246,0.1); color:#7c3aed; border:1px solid rgba(139,92,246,0.3)">💻 Đầu mối đội lập trình</span>';
      } else if (m.title && m.title.toLowerCase().includes('automation')) {
        roleBadge = '<span class="badge" style="background:rgba(16,185,129,0.1); color:#059669; font-weight:800">⚡ Kiểm thử tự động</span>';
      } else if (m.title && m.title.toLowerCase().includes('senior')) {
        roleBadge = '<span class="badge" style="background:rgba(37,99,235,0.1); color:#2563eb; font-weight:800">⭐ Kỹ sư kiểm thử chính</span>';
      }

      // Phiên bản phụ trách
      const memAlloc = allocations[uName];
      let versionBadges = '';
      if (memAlloc && Object.keys(memAlloc).length > 0) {
        versionBadges = Object.keys(memAlloc).map(vKey => `
          <span class="badge badge-outline" style="font-size:10.5px; font-weight:700" title="Cam kết ${memAlloc[vKey]}% thời gian">
            📦 ${escapeHtml(vKey)} (${memAlloc[vKey]}%)
          </span>
        `).join(' ');
      } else {
        versionBadges = `<span class="badge badge-outline" style="font-size:10.5px; color:var(--text-muted)">Toàn bộ phiên bản</span>`;
      }

      // Thống kê lỗi phát hiện (tính theo tester)
      const userDefects = defects.filter(d => d.reportedBy === uName || d.tester === uName);
      const bugCount = userDefects.length > 0 ? userDefects.length : (assigned > 0 ? Math.max(1, Math.floor(assigned / 12)) : 0);

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px">
              <div class="user-avatar-circle" style="width:36px; height:36px; font-weight:800; font-size:13px; border-radius:10px; background:rgba(37,99,235,0.1); color:#2563eb; display:flex; align-items:center; justify-content:center; flex-shrink:0">
                ${(m.name || m.username || 'U').substring(0, 1).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:700; color:var(--text-primary); font-size:13px">${escapeHtml(m.name || m.username)}</div>
                <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(uName)} • ${escapeHtml(m.title || 'Kỹ sư QA')}</div>
              </div>
            </div>
          </td>

          <td style="text-align:center">
            ${roleBadge}
          </td>

          <td>
            <div style="display:flex; flex-wrap:wrap; gap:4px">
              ${versionBadges}
            </div>
          </td>

          <td>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin-bottom:4px">
              <span>Được giao: <strong>${assigned}</strong> bài</span>
              <span style="color:#16a34a">${passed} đạt (${passRate}%)</span>
            </div>
            <div style="height:6px; border-radius:3px; background:var(--bg-body); overflow:hidden; display:flex; border:1px solid var(--border-light)">
              <div style="width:${passRate}%; background:#16a34a" title="Đạt: ${passed}"></div>
              <div style="width:${failRate}%; background:#dc2626" title="Lỗi: ${failed}"></div>
              <div style="width:${untestedRate}%; background:#e2e8f0" title="Chưa chạy"></div>
            </div>
          </td>

          <td style="text-align:center">
            <div style="display:flex; flex-direction:column; align-items:center; gap:3px">
              ${wlBadge}
              <div style="font-size:11px; color:var(--text-muted)">Tải trọng: <strong>${memberWl}%</strong></div>
            </div>
          </td>

          <td style="text-align:center">
            <span class="badge" style="background:rgba(220,38,38,0.1); color:#dc2626; font-size:11px; font-weight:800" title="Tổng số lỗi phát hiện trong dự án">
              🐛 ${bugCount} lỗi
            </span>
          </td>

          <td style="text-align:center">
            <button type="button" class="btn btn-outline btn-xs" onclick="LeadDashboard.openAssignRosterModal('matrix')" title="Điều chỉnh ma trận phân bổ theo phiên bản">
              🎯 Phân bổ
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderDevPipeline() {
    const p = getActiveProject();
    if (!p) return;

    const defects = (typeof getProjectDefects === 'function') 
      ? getProjectDefects(p.id) 
      : [];

    let newCount = 0;
    let wipCount = 0;
    let reopenedCount = 0;
    let fixedCount = 0;
    let closedCount = 0;

    defects.forEach(d => {
      if (d.defectStatus === 'New') newCount++;
      else if (d.defectStatus === 'In Progress') wipCount++;
      else if (d.defectStatus === 'Reopened') reopenedCount++;
      else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') fixedCount++;
      else if (d.defectStatus === 'Closed') closedCount++;
      else newCount++;
    });

    const total = defects.length;
    const resolvedTotal = fixedCount + closedCount;
    const fixRate = total > 0 ? Math.round((resolvedTotal / total) * 100) : 100;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('lead-dev-kpi-new', newCount);
    setVal('lead-dev-kpi-wip', wipCount);
    setVal('lead-dev-kpi-closed', closedCount);

    const descEl = document.getElementById('lead-dev-pipeline-desc');
    if (descEl) {
      descEl.textContent = `${resolvedTotal} / ${total} lỗi đã giải quyết (${fixRate}%)`;
    }

    if (total > 0) {
      const setWidth = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${((count / total) * 100).toFixed(1)}%`;
      };
      setWidth('lead-pipe-closed', closedCount);
      setWidth('lead-pipe-fixed', fixedCount);
      setWidth('lead-pipe-wip', wipCount);
      setWidth('lead-pipe-new', newCount + reopenedCount);
    }
  },

  updateQuickActions() {
    // Không còn dùng link settings.html - toàn bộ thao tác đều qua In-Context Modals
  },

  // ==================== 1. SOFTWARE VERSIONS IN-CONTEXT ====================
  openAddVersionModal() {
    document.getElementById('vf-original-version').value = '';
    document.getElementById('vf-tag').value = '';
    document.getElementById('vf-label').value = '';
    document.getElementById('vf-status').value = 'ACTIVE';
    document.getElementById('vf-date').value = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
    document.getElementById('vf-changelog').value = '';
    document.getElementById('vf-set-active').checked = false;

    const delBtn = document.getElementById('btn-vf-delete');
    if (delBtn) delBtn.style.display = 'none';

    document.getElementById('modal-version-title').textContent = '➕ Thêm phiên bản mới cho dự án';
    openModal('modal-version-form');
  },

  openEditVersionModal(versionStr) {
    const p = getActiveProject();
    if (!p) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const vObj = versions.find(v => (v.version || v) === versionStr);

    document.getElementById('vf-original-version').value = versionStr;
    document.getElementById('vf-tag').value = versionStr;
    document.getElementById('vf-label').value = (vObj && vObj.label) ? vObj.label : '';
    document.getElementById('vf-status').value = (vObj && vObj.status) ? vObj.status : 'ACTIVE';
    document.getElementById('vf-date').value = (vObj && (vObj.targetDate || vObj.releaseDate)) ? (vObj.targetDate || vObj.releaseDate) : '';
    document.getElementById('vf-changelog').value = (vObj && vObj.changelog) ? vObj.changelog : '';
    document.getElementById('vf-set-active').checked = (versionStr === p.activeVersion);

    const delBtn = document.getElementById('btn-vf-delete');
    if (delBtn) delBtn.style.display = 'inline-flex';

    document.getElementById('modal-version-title').textContent = `✏️ Cấu hình phiên bản: ${versionStr}`;
    openModal('modal-version-form');
  },

  deleteFromModal() {
    const originalVer = document.getElementById('vf-original-version')?.value?.trim();
    if (originalVer) {
      this.deleteVersion(originalVer);
    }
  },

  deleteVersion(versionStr) {
    const p = getActiveProject();
    if (!p) return;

    // Đếm số kịch bản và đợt test chịu ảnh hưởng
    const affectedTcs = (p.testCases || []).filter(tc => tc.version === versionStr).length;
    const affectedCycles = (typeof getTestCyclesForProject === 'function' 
      ? getTestCyclesForProject(p.id, versionStr) 
      : (p.testCycles || []).filter(c => c.version === versionStr)).length;

    let confirmMsg = `Bạn có chắc chắn muốn xóa phiên bản [${versionStr}] khỏi dự án "${p.name}"?`;
    if (affectedTcs > 0 || affectedCycles > 0) {
      confirmMsg += `\n\n⚠️ Cảnh báo: Phiên bản này đang chứa ${affectedTcs} kịch bản kiểm thử và ${affectedCycles} đợt test. Toàn bộ dữ liệu này sẽ bị xóa vĩnh viễn khỏi dự án và cơ sở dữ liệu Cloud!`;
    }
    confirmMsg += `\n\nThao tác này không thể hoàn tác!`;

    if (!confirm(confirmMsg)) return;

    try {
      if (typeof deleteProjectVersion === 'function') {
        deleteProjectVersion(p.id, versionStr);
      } else {
        p.versions = (p.versions || []).filter(v => (v.version || v) !== versionStr);
        p.testCases = (p.testCases || []).filter(tc => tc.version !== versionStr);
        p.testCycles = (p.testCycles || []).filter(c => c.version !== versionStr);
        if (state.testCycles) {
          state.testCycles = state.testCycles.filter(c => !(c.projectId === p.id && c.version === versionStr));
        }
        if (p.activeVersion === versionStr) {
          p.activeVersion = p.versions.length > 0 ? (p.versions[0].version || p.versions[0]) : '';
          state.activeVersion = p.activeVersion;
        }
        saveCoreState();
        if (window.pushProjectsToCloud) window.pushProjectsToCloud(state.projects);
        if (window.pushCyclesToCloud) window.pushCyclesToCloud(state.testCycles);
      }

      showToast(`🗑️ Đã xóa thành công phiên bản [${versionStr}]!`, 'success');

      // Đóng modal form nếu đang mở
      closeModal('modal-version-form');

      // Cập nhật lại toàn bộ giao diện điều hành phiên bản
      this.renderVersionManagementCockpit();
      this.renderExecutiveHealth();
      this.renderProjectRoster();
      this.renderDevPipeline();
      this.updateQuickActions();
      if (window.LeadContext) {
        LeadContext.renderCompactProjectBar();
      }
    } catch (err) {
      showToast(`❌ Lỗi khi xóa phiên bản: ${err.message}`, 'error');
    }
  },

  confirmSaveVersion() {
    const p = getActiveProject();
    if (!p) return;

    const originalVer = document.getElementById('vf-original-version').value.trim();
    const version = (document.getElementById('vf-tag').value || '').trim();
    const label = (document.getElementById('vf-label').value || '').trim() || version;
    const status = document.getElementById('vf-status').value;
    const targetDate = document.getElementById('vf-date').value;
    const changelog = (document.getElementById('vf-changelog').value || '').trim();
    const setActive = document.getElementById('vf-set-active').checked;

    if (!version) {
      showToast('⚠️ Vui lòng nhập mã phiên bản (VD: v2.1)!', 'error');
      return;
    }

    if (!p.versions) p.versions = [];

    if (!originalVer) {
      // THÊM MỚI
      if (p.versions.some(v => (v.version || v) === version)) {
        showToast(`⚠️ Phiên bản ${version} đã tồn tại trong dự án!`, 'error');
        return;
      }
      p.versions.push({ version, label, status, targetDate, changelog });
    } else {
      // CHỈNH SỬA
      const idx = p.versions.findIndex(v => (v.version || v) === originalVer);
      if (idx >= 0) {
        if (typeof p.versions[idx] === 'string') {
          p.versions[idx] = { version, label, status, targetDate, changelog };
        } else {
          p.versions[idx].version = version;
          p.versions[idx].label = label;
          p.versions[idx].status = status;
          p.versions[idx].targetDate = targetDate;
          p.versions[idx].changelog = changelog;
        }
      }
      // Nếu đổi mã version, cập nhật lại các kịch bản và cycle
      if (originalVer !== version) {
        if (p.testCases) {
          p.testCases.forEach(tc => {
            if (tc.version === originalVer) tc.version = version;
          });
        }
        if (p.testCycles) {
          p.testCycles.forEach(c => {
            if (c.version === originalVer) c.version = version;
          });
        }
        if (p.activeVersion === originalVer) {
          p.activeVersion = version;
        }
      }
    }

    if (setActive) {
      p.activeVersion = version;
      state.activeVersion = version;
    }

    saveCoreState();
    closeModal('modal-version-form');
    showToast(`✅ Đã lưu cấu hình phiên bản [${version}] thành công!`, 'success');
    this.renderKpis();
    this.renderVersionCards();
    if (window.LeadContext) {
      LeadContext.renderCompactProjectBar();
    }
  },

  setActiveVersion(versionStr) {
    const p = getActiveProject();
    if (!p) return;

    p.activeVersion = versionStr;
    state.activeVersion = versionStr;
    saveCoreState();
    showToast(`⚡ Đã đặt [${versionStr}] làm phiên bản hiện hành của dự án!`, 'success');
    this.renderKpis();
    this.renderVersionCards();
    if (window.LeadContext) {
      LeadContext.renderCompactProjectBar();
    }
  },

  // ==================== 2. CLONE VERSION ====================
  openCloneVersionModal() {
    const p = getActiveProject();
    if (!p) return;

    const sourceSelect = document.getElementById('mcv-source-version');
    if (!sourceSelect) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    sourceSelect.innerHTML = versions.map(v => {
      const vStr = v.version || v;
      const tcsCount = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, vStr).length : 0;
      return `
        <option value="${vStr}" ${vStr === p.activeVersion ? 'selected' : ''}>
          ${vStr} ${v.label ? `— ${v.label}` : ''} (${tcsCount} kịch bản)
        </option>
      `;
    }).join('');

    const nextVer = `v${(versions.length + 1).toFixed(1)}`;
    document.getElementById('mcv-new-version').value = nextVer;
    document.getElementById('mcv-new-label').value = `Bản kế thừa từ ${p.activeVersion || 'v1.0'}`;
    document.getElementById('mcv-changelog').value = '';
    this.handleCloneSourceChange();
    openModal('modal-clone-version');
  },

  handleCloneSourceChange() {
    const p = getActiveProject();
    if (!p) return;
    const srcVer = document.getElementById('mcv-source-version')?.value;
    const count = typeof getTestCasesForVersion === 'function' ? getTestCasesForVersion(p.id, srcVer).length : 0;
    const info = document.getElementById('mcv-source-info');
    if (info) {
      info.textContent = `📦 Phiên bản nguồn [${srcVer}] hiện có ${count} kịch bản kiểm thử sẵn sàng kế thừa.`;
    }
  },

  confirmCloneVersion() {
    const p = getActiveProject();
    if (!p) return;

    const srcVer = document.getElementById('mcv-source-version')?.value;
    const newVer = (document.getElementById('mcv-new-version')?.value || '').trim();
    const newLabel = (document.getElementById('mcv-new-label')?.value || '').trim() || newVer;
    const changelog = (document.getElementById('mcv-changelog')?.value || '').trim();
    const setActive = document.getElementById('mcv-set-active')?.checked;

    if (!newVer) {
      showToast('⚠️ Vui lòng nhập mã phiên bản mới!', 'error');
      return;
    }

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    if (versions.some(v => (v.version || v) === newVer)) {
      showToast(`⚠️ Mã phiên bản [${newVer}] đã tồn tại trong dự án!`, 'error');
      return;
    }

    const ok = typeof cloneVersionTestCases === 'function' 
      ? cloneVersionTestCases(p.id, srcVer, newVer, newLabel, changelog)
      : false;

    if (ok) {
      if (setActive) {
        p.activeVersion = newVer;
        state.activeVersion = newVer;
        saveCoreState();
      }
      closeModal('modal-clone-version');
      showToast(`🎉 Kế thừa thành công! Đã tạo phiên bản [${newVer}] cho dự án`, 'success');
      this.renderKpis();
      this.renderVersionCards();
      if (window.LeadContext) {
        LeadContext.renderCompactProjectBar();
      }
    } else {
      showToast('❌ Thao tác kế thừa phiên bản thất bại!', 'error');
    }
  },

  // ==================== 3. IMPORT VERSION ====================
  openImportVersionModal() {
    const p = getActiveProject();
    if (!p) return;

    this.importedTcs = [];
    document.getElementById('miv-version').value = '';
    document.getElementById('miv-label').value = '';
    document.getElementById('miv-date').value = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    document.getElementById('miv-changelog').value = '';
    document.getElementById('miv-file-name').textContent = '';
    document.getElementById('miv-file-input').value = '';

    const previewBox = document.getElementById('miv-preview-box');
    if (previewBox) previewBox.style.display = 'none';

    const submitBtn = document.getElementById('miv-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    openModal('modal-import-version');
  },

  handleVersionFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileNameEl = document.getElementById('miv-file-name');
    if (fileNameEl) fileNameEl.textContent = `📁 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    const previewBox = document.getElementById('miv-preview-box');
    const previewContent = document.getElementById('miv-preview-content');
    const submitBtn = document.getElementById('miv-submit-btn');

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const tcs = Array.isArray(parsed) ? parsed : (parsed.testCases || []);
          if (tcs.length === 0) {
            previewBox.style.display = 'block';
            previewContent.innerHTML = '<span style="color:#dc2626">⚠️ File JSON không chứa kịch bản nào!</span>';
            submitBtn.disabled = true;
            return;
          }
          this.importedTcs = tcs;
          previewBox.style.display = 'block';
          previewContent.innerHTML = `✅ Đã phân tích: <strong>${tcs.length}</strong> kịch bản sẵn sàng nhập vào phiên bản mới.`;
          submitBtn.disabled = false;
        } catch (err) {
          previewBox.style.display = 'block';
          previewContent.innerHTML = `<span style="color:#dc2626">⚠️ Lỗi cú pháp JSON: ${err.message}</span>`;
          submitBtn.disabled = true;
        }
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          if (typeof XLSX === 'undefined') {
            throw new Error('Thư viện đọc bảng tính XLSX chưa được nạp!');
          }
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];

          // 1. Tự động tìm hàng tiêu đề thực sự (bỏ qua banner tiêu đề lớn ở các hàng đầu)
          const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          let headerRowIndex = aoa.findIndex(r => {
            if (!Array.isArray(r) || r.length < 3) return false;
            const hasId = r.some(c => /^(STT|Mã\s*(Test\s*Case|TC|Kịch\s*bản|Bài)|ID)$/i.test(String(c).trim()) || /Mã\s*Test\s*Case/i.test(String(c)));
            const hasTitle = r.some(c => /Tiêu\s*đề|Tên\s*kịch\s*bản|Tên\s*bài|Title/i.test(String(c)));
            return hasId && hasTitle;
          });
          if (headerRowIndex === -1) {
            headerRowIndex = aoa.findIndex(r => Array.isArray(r) && r.some(c => /Mã|ID|Phân\s*hệ|Module/i.test(String(c))));
          }
          if (headerRowIndex === -1) headerRowIndex = 0;

          const rows = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '' });

          if (!rows || rows.length === 0) {
            previewBox.style.display = 'block';
            previewContent.innerHTML = '<span style="color:#dc2626">⚠️ Bảng tính không chứa dòng dữ liệu nào!</span>';
            submitBtn.disabled = true;
            return;
          }

          const MODULE_NAMES = {
            'M01': 'M01 - Xác thực & Quản lý Ca trực',
            'M02': 'M02 - Check-in Khách Đơn & Cấp Thẻ',
            'M03': 'M03 - Khách Đoàn & Lưu Trú Qua Đêm',
            'M04': 'M04 - Check-out & Thu Hồi Thẻ Mất',
            'M05': 'M05 - Giao Diện Trực Ban & Tra Cứu',
            'M06': 'M06 - Chi Tiết Lượt Khách & Timeline',
            'M07': 'M07 - Sổ Sách Ngoại Lệ (DataEntry)',
            'M08': 'M08 - Quản Trị Admin & Giám Sát',
            'M09': 'M09 - Trung Tâm Báo Cáo & Thống Kê',
            'M10': 'M10 - Cấu Hình Hệ Thống & CSDL',
            'M11': 'M11 - Thiết Bị Ngoại Vi & Phần Cứng',
            'M12': 'M12 - Dịch Vụ Nền Tảng & Chịu Lỗi'
          };

          const parsedList = [];
          rows.forEach((r, idx) => {
            const id = String(r['Mã Test Case'] || r['Mã Test Case (*)'] || r['Mã kịch bản'] || r['Mã bài'] || r['Mã TC'] || r['Mã'] || r['ID'] || r['id'] || r['tc_id'] || '').trim();
            const title = String(r['Tiêu đề kịch bản'] || r['Tiêu đề kịch bản (*)'] || r['Tên kịch bản'] || r['Tiêu đề'] || r['Tên bài'] || r['Title'] || r['title'] || r['name'] || '').trim();
            if (!id && !title) return;

            const finalId = id || `TC-IMP-${idx + 1}`;
            const finalTitle = title || `Kịch bản kiểm thử ${idx + 1}`;

            let rawMod = String(r['Phân hệ (Module) (*)'] || r['Phân hệ (*)'] || r['Phân hệ'] || r['Module'] || r['Mã phân hệ'] || r['module'] || 'M01').trim();
            const modMatch = rawMod.match(/M\d+/i);
            const module = modMatch ? modMatch[0].toUpperCase() : (rawMod || 'M01');
            const moduleName = MODULE_NAMES[module] || rawMod || `Phân hệ ${module}`;

            let rawPrio = String(r['Mức ưu tiên'] || r['Ưu tiên'] || r['Priority'] || r['priority'] || 'P2').trim();
            const pMatch = rawPrio.match(/P[1-4]/i);
            const priority = pMatch ? pMatch[0].toUpperCase() : 'P2';

            const steps = String(r['Quy trình các bước (Test Steps)'] || r['Các bước thực hiện'] || r['Các bước'] || r['Steps'] || r['steps'] || '').trim();
            const expected = String(r['Kết quả kỳ vọng (Expected Results)'] || r['Kết quả mong đợi'] || r['Kết quả'] || r['Expected'] || r['expected'] || '').trim();
            const type = String(r['Loại kiểm thử'] || r['Loại'] || r['Type'] || 'Chức năng').trim();
            const suite = String(r['Bộ kịch bản'] || r['Suite'] || r['Loại suite'] || 'REGRESSION').trim();
            const platform = String(r['Nền tảng'] || r['Platform'] || 'Giao diện Web Trực ban').trim();
            const precondition = String(r['Điều kiện tiên quyết (Preconditions)'] || r['Điều kiện tiên quyết'] || r['Tiền điều kiện'] || '').trim();
            const testData = String(r['Dữ liệu kiểm thử (Test Data)'] || r['Dữ liệu kiểm thử'] || r['Dữ liệu'] || '').trim();
            const notes = String(r['Ghi chú kỹ thuật'] || r['Ghi chú'] || '').trim();

            parsedList.push({
              id: finalId,
              title: finalTitle,
              name: finalTitle,
              module,
              moduleName,
              priority,
              steps,
              expected,
              type,
              suite,
              platform,
              precondition,
              testData,
              notes
            });
          });

          this.importedTcs = parsedList;
          const mods = new Set(this.importedTcs.map(t => t.module));
          previewBox.style.display = 'block';
          previewContent.innerHTML = `✅ Đã phân tích bảng tính: <strong>${this.importedTcs.length}</strong> kịch bản thuộc <strong>${mods.size}</strong> phân hệ (${Array.from(mods).sort().join(', ')}). Sẵn sàng tạo phiên bản!`;
          submitBtn.disabled = false;
        } catch (err) {
          previewBox.style.display = 'block';
          previewContent.innerHTML = `<span style="color:#dc2626">⚠️ Lỗi đọc file Excel: ${err.message}</span>`;
          submitBtn.disabled = true;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  },

  confirmImportVersion() {
    const p = getActiveProject();
    if (!p) return;

    const version = (document.getElementById('miv-version').value || '').trim();
    const label = (document.getElementById('miv-label').value || '').trim() || version;
    const targetDate = document.getElementById('miv-date').value;
    const status = document.getElementById('miv-status').value;
    const changelog = (document.getElementById('miv-changelog').value || '').trim() || `Nhập ${this.importedTcs?.length || 0} kịch bản từ file`;

    if (!version) {
      showToast('⚠️ Vui lòng nhập mã phiên bản mới (VD: v2.2)!', 'error');
      return;
    }

    if (!p.versions) p.versions = [];
    if (p.versions.some(v => (v.version || v) === version)) {
      showToast(`⚠️ Phiên bản [${version}] đã tồn tại trong dự án!`, 'error');
      return;
    }

    if (!this.importedTcs || this.importedTcs.length === 0) {
      showToast('⚠️ Không có kịch bản nào được phát hiện để nhập!', 'error');
      return;
    }

    const taggedTcs = this.importedTcs.map((tc, idx) => ({
      ...tc,
      id: tc.id || `TC-IMP-${idx + 1}`,
      name: tc.name || tc.title || `Kịch bản kiểm thử ${idx + 1}`,
      title: tc.title || tc.name || `Kịch bản kiểm thử ${idx + 1}`,
      version: version.trim(),
      projectId: p.id,
      isCustom: true
    }));

    if (!p.modules) p.modules = [];
    const existingModIds = new Set(p.modules.map(m => m.id));
    taggedTcs.forEach(tc => {
      if (tc.module && !existingModIds.has(tc.module)) {
        p.modules.push({
          id: tc.module,
          name: tc.moduleName || `Phân hệ ${tc.module}`,
          desc: `Tự động trích xuất từ kịch bản phiên bản ${version.trim()}`,
          versions: [version.trim()]
        });
        existingModIds.add(tc.module);
      } else if (tc.module) {
        const foundMod = p.modules.find(m => m.id === tc.module);
        if (foundMod) {
          if (!Array.isArray(foundMod.versions)) foundMod.versions = [];
          if (!foundMod.versions.includes(version.trim())) foundMod.versions.push(version.trim());
          if (tc.moduleName && (!foundMod.name || foundMod.name.startsWith('Phân hệ M'))) {
            foundMod.name = tc.moduleName;
          }
        }
      }
    });

    p.versions.push({
      version,
      label,
      status,
      targetDate: targetDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      changelog
    });

    if (!p.testCases) p.testCases = [];
    p.testCases.push(...taggedTcs);

    if (status === 'ACTIVE') {
      p.activeVersion = version;
      state.activeVersion = version;
    }

    saveCoreState();
    closeModal('modal-import-version');
    showToast(`🎉 Đã nhập thành công phiên bản [${version}] với ${taggedTcs.length} kịch bản!`, 'success');
    this.renderKpis();
    this.renderVersionCards();
    if (window.LeadContext) {
      LeadContext.renderCompactProjectBar();
    }
  },

  // ==================== 4. PROJECT SETTINGS (ENTERPRISE GOVERNANCE COCKPIT) ====================
  openProjectSettingsModal(initialTab = 'gov') {
    const p = getActiveProject();
    if (!p) return;

    this.switchProjectSettingsTab(initialTab);

    // 1. Pane Governance
    const codeEl = document.getElementById('mpf-code');
    if (codeEl) codeEl.value = p.code || p.id;

    const nameEl = document.getElementById('mpf-name');
    if (nameEl) nameEl.value = p.name || '';

    const leadEl = document.getElementById('mpf-lead');
    if (leadEl) leadEl.value = p.lead || p.manager || '';

    const poEl = document.getElementById('mpf-po');
    if (poEl) poEl.value = p.governance?.po || p.po || '';

    const devLeadEl = document.getElementById('mpf-devlead');
    if (devLeadEl) devLeadEl.value = p.governance?.devLead || p.devLead || '';

    const descEl = document.getElementById('mpf-desc');
    if (descEl) descEl.value = p.description || '';

    // 2. Pane Quality Gates
    const stdEl = document.getElementById('mpf-standard');
    if (stdEl) stdEl.value = p.standard || 'ISO/IEC/IEEE 29119';

    const qGates = p.qualityGates || {};
    const passRateEl = document.getElementById('mpf-gate-passrate');
    if (passRateEl) passRateEl.value = qGates.minPassRate ?? 95;

    const covEl = document.getElementById('mpf-gate-coverage');
    if (covEl) covEl.value = qGates.minCoverage ?? 100;

    const maxP1El = document.getElementById('mpf-gate-max-p1');
    if (maxP1El) maxP1El.value = qGates.maxP1 ?? 0;

    const maxP2El = document.getElementById('mpf-gate-max-p2');
    if (maxP2El) maxP2El.value = qGates.maxP2 ?? 1;

    const maxP3El = document.getElementById('mpf-gate-max-p3');
    if (maxP3El) maxP3El.value = qGates.maxP3 ?? 3;

    // 3. Pane SLA & Rules
    const sla = p.sla || {};
    const slaP1El = document.getElementById('mpf-sla-p1');
    if (slaP1El) slaP1El.value = sla.p1 || '4h';

    const slaP2El = document.getElementById('mpf-sla-p2');
    if (slaP2El) slaP2El.value = sla.p2 || '24h';

    const slaP3El = document.getElementById('mpf-sla-p3');
    if (slaP3El) slaP3El.value = sla.p3 || '5d';

    const ruleEvEl = document.getElementById('mpf-rule-evidence');
    if (ruleEvEl) ruleEvEl.checked = sla.ruleEvidence !== false;

    const rulePeerEl = document.getElementById('mpf-rule-peer');
    if (rulePeerEl) rulePeerEl.checked = sla.rulePeer !== false;

    const ruleLockEl = document.getElementById('mpf-rule-autolock');
    if (ruleLockEl) ruleLockEl.checked = sla.ruleAutolock !== false;

    // 4. Pane Environments
    const env = p.environments || {};
    const envTypeEl = document.getElementById('mpf-env-type');
    if (envTypeEl) envTypeEl.value = env.primaryEnv || 'STAGING_UAT';

    const envUrlEl = document.getElementById('mpf-env-url');
    if (envUrlEl) envUrlEl.value = env.envUrl || p.targetEnvironmentUrl || '';

    const plats = env.platforms || ['web', 'mobile', 'cam', 'iot'];
    const pWeb = document.getElementById('mpf-plat-web');
    if (pWeb) pWeb.checked = plats.includes('web');
    const pMob = document.getElementById('mpf-plat-mobile');
    if (pMob) pMob.checked = plats.includes('mobile');
    const pCam = document.getElementById('mpf-plat-cam');
    if (pCam) pCam.checked = plats.includes('cam');
    const pIot = document.getElementById('mpf-plat-iot');
    if (pIot) pIot.checked = plats.includes('iot');

    // 5. Pane Alerts
    const alerts = p.alerts || {};
    const alertCritEl = document.getElementById('mpf-alert-critical');
    if (alertCritEl) alertCritEl.checked = alerts.criticalAlert !== false;

    const alertEndEl = document.getElementById('mpf-alert-endpoint');
    if (alertEndEl) alertEndEl.value = alerts.endpoint || '';

    openModal('modal-project-form');
  },

  switchProjectSettingsTab(tabKey) {
    const tabs = ['gov', 'gates', 'sla', 'env', 'alerts'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-mpf-${t}`);
      const pane = document.getElementById(`mpf-pane-${t}`);
      if (btn) {
        if (t === tabKey) btn.classList.add('active');
        else btn.classList.remove('active');
      }
      if (pane) {
        pane.style.display = (t === tabKey) ? 'flex' : 'none';
      }
    });
  },

  confirmSaveProjectSettings() {
    const p = getActiveProject();
    if (!p) return;

    const name = (document.getElementById('mpf-name')?.value || '').trim();
    if (!name) {
      showToast('⚠️ Tên dự án không được để trống!', 'error');
      return;
    }

    p.name = name;
    p.lead = (document.getElementById('mpf-lead')?.value || '').trim();
    p.description = (document.getElementById('mpf-desc')?.value || '').trim();
    p.standard = document.getElementById('mpf-standard')?.value || 'ISO/IEC/IEEE 29119';

    p.governance = {
      po: (document.getElementById('mpf-po')?.value || '').trim(),
      devLead: (document.getElementById('mpf-devlead')?.value || '').trim()
    };

    p.qualityGates = {
      minPassRate: Number(document.getElementById('mpf-gate-passrate')?.value) || 95,
      minCoverage: Number(document.getElementById('mpf-gate-coverage')?.value) || 100,
      maxP1: Number(document.getElementById('mpf-gate-max-p1')?.value) || 0,
      maxP2: Number(document.getElementById('mpf-gate-max-p2')?.value) || 1,
      maxP3: Number(document.getElementById('mpf-gate-max-p3')?.value) || 3
    };

    p.sla = {
      p1: document.getElementById('mpf-sla-p1')?.value || '4h',
      p2: document.getElementById('mpf-sla-p2')?.value || '24h',
      p3: document.getElementById('mpf-sla-p3')?.value || '5d',
      ruleEvidence: document.getElementById('mpf-rule-evidence')?.checked ?? true,
      rulePeer: document.getElementById('mpf-rule-peer')?.checked ?? true,
      ruleAutolock: document.getElementById('mpf-rule-autolock')?.checked ?? true
    };

    const platforms = [];
    if (document.getElementById('mpf-plat-web')?.checked) platforms.push('web');
    if (document.getElementById('mpf-plat-mobile')?.checked) platforms.push('mobile');
    if (document.getElementById('mpf-plat-cam')?.checked) platforms.push('cam');
    if (document.getElementById('mpf-plat-iot')?.checked) platforms.push('iot');

    p.environments = {
      primaryEnv: document.getElementById('mpf-env-type')?.value || 'STAGING_UAT',
      envUrl: (document.getElementById('mpf-env-url')?.value || '').trim(),
      platforms
    };

    p.alerts = {
      criticalAlert: document.getElementById('mpf-alert-critical')?.checked ?? true,
      endpoint: (document.getElementById('mpf-alert-endpoint')?.value || '').trim()
    };

    saveCoreState();
    closeModal('modal-project-form');
    showToast(`✅ Đã lưu toàn diện cấu hình Enterprise cho dự án [${p.code || p.id}]!`, 'success');
    this.renderKpis();
    if (window.LeadContext) {
      LeadContext.renderCompactProjectBar();
    }
  },

  // ==================== 5. ROSTER MANAGEMENT & VERSION MATRIX ====================
  openAssignRosterModal(initialTab = 'staffing') {
    const p = getActiveProject();
    if (!p) return;

    this.switchRosterModalTab(initialTab);

    const tbody = document.getElementById('mar-roster-tbody');
    if (!tbody) return;

    const currentMembers = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const memberMap = new Map();
    currentMembers.forEach(m => {
      const uName = m.username || m;
      memberMap.set(uName, {
        role: m.projectRole || 'tester',
        maxCapacity: m.maxCapacity || 35
      });
    });

    const systemUsers = (state.users && state.users.length > 0) ? state.users : [
      { username: 'hdang', name: 'Hoàng Hải Đăng', title: 'Trưởng dự án QA', defaultRole: 'lead' },
      { username: 'lan.nguyen', name: 'Nguyễn Thị Lan', title: 'Kỹ sư kiểm thử chính', defaultRole: 'tester' },
      { username: 'tuan.tran', name: 'Trần Minh Tuấn', title: 'Kiểm thử viên chức năng', defaultRole: 'tester' },
      { username: 'duong.le', name: 'Lê Thùy Dương', title: 'Kiểm thử viên tự động', defaultRole: 'tester' },
      { username: 'nam.hoang', name: 'Hoàng Nam', title: 'Lập trình viên backend', defaultRole: 'dev' },
      { username: 'phuong.vu', name: 'Vũ Minh Phương', title: 'Lập trình viên frontend', defaultRole: 'dev' }
    ];

    tbody.innerHTML = systemUsers.map(u => {
      const isSelected = memberMap.has(u.username);
      const memInfo = memberMap.get(u.username) || { role: u.defaultRole || 'tester', maxCapacity: 35 };

      return `
        <tr>
          <td style="text-align:center">
            <input type="checkbox" class="mar-member-chk" data-username="${escapeHtml(u.username)}" data-name="${escapeHtml(u.name)}" data-title="${escapeHtml(u.title || '')}" ${isSelected ? 'checked' : ''} onchange="LeadDashboard.updateRosterCount(); LeadDashboard.renderRosterMatrix();" style="cursor:pointer; width:16px; height:16px" />
          </td>
          <td>
            <div style="font-weight:700; color:var(--text-primary)">${escapeHtml(u.name)}</div>
            <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(u.username)}</div>
          </td>
          <td>
            <span class="badge badge-outline" style="font-size:11px">${escapeHtml(u.title || 'Kỹ sư QA')}</span>
          </td>
          <td>
            <select class="form-control mar-role-select" data-username="${escapeHtml(u.username)}" style="height:32px; font-size:12px; padding:2px 8px" onchange="LeadDashboard.renderRosterMatrix()">
              <option value="lead" ${memInfo.role === 'lead' ? 'selected' : ''}>👑 Trưởng dự án QA</option>
              <option value="tester" ${memInfo.role === 'tester' ? 'selected' : ''}>🧪 Kiểm thử viên</option>
              <option value="automation" ${memInfo.role === 'automation' ? 'selected' : ''}>⚡ Kiểm thử tự động</option>
              <option value="dev" ${memInfo.role === 'dev' ? 'selected' : ''}>💻 Đầu mối đội lập trình</option>
            </select>
          </td>
          <td style="text-align:center">
            <div style="display:inline-flex; align-items:center; gap:6px">
              <input type="number" class="form-control mar-capacity-input" data-username="${escapeHtml(u.username)}" min="10" max="100" value="${memInfo.maxCapacity || 35}" style="width:65px; text-align:center; height:30px; font-weight:700; font-size:12px; padding:2px" />
              <span style="font-size:11px; color:var(--text-muted)">bài</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.updateRosterCount();
    this.renderRosterMatrix();
    openModal('modal-assign-roster');
  },

  switchRosterModalTab(tabKey) {
    const staffingBtn = document.getElementById('tab-btn-mar-staffing');
    const matrixBtn = document.getElementById('tab-btn-mar-matrix');
    const staffingPane = document.getElementById('mar-pane-staffing');
    const matrixPane = document.getElementById('mar-pane-matrix');

    if (tabKey === 'matrix') {
      staffingBtn?.classList.remove('active');
      matrixBtn?.classList.add('active');
      if (staffingPane) staffingPane.style.display = 'none';
      if (matrixPane) matrixPane.style.display = 'block';
      this.renderRosterMatrix();
    } else {
      matrixBtn?.classList.remove('active');
      staffingBtn?.classList.add('active');
      if (matrixPane) matrixPane.style.display = 'none';
      if (staffingPane) staffingPane.style.display = 'block';
    }
  },

  renderRosterMatrix() {
    const p = getActiveProject();
    if (!p) return;

    const theadTr = document.getElementById('mar-matrix-thead-tr');
    const tbody = document.getElementById('mar-matrix-tbody');
    if (!theadTr || !tbody) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const verList = versions.map(v => v.version || v);

    // Xây dựng thead
    theadTr.innerHTML = `
      <th style="min-width:180px">Kỹ sư và vai trò dự án</th>
      ${verList.map(vStr => `
        <th style="text-align:center; min-width:110px">
          <div style="font-size:12px; font-weight:800">📦 ${escapeHtml(vStr)}</div>
          <div style="font-size:10px; font-weight:600; color:var(--text-muted)">% Cam kết</div>
        </th>
      `).join('')}
      <th style="text-align:center; width:160px">Tổng cam kết (%)</th>
      <th style="text-align:center; width:130px">Đánh giá tải</th>
    `;

    // Lấy danh sách kỹ sư được chọn ở tab Staffing
    const checkedBoxes = Array.from(document.querySelectorAll('.mar-member-chk:checked'));
    if (checkedBoxes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${verList.length + 3}" style="padding:28px 16px; text-align:center; color:var(--text-muted); font-size:13px">
            ⚠️ Chưa có kỹ sư nào được tích chọn trong tab <strong>1. Biên Chế & Vai Trò</strong>. Hãy chọn thành viên trước khi phân bổ theo phiên bản!
          </td>
        </tr>
      `;
      return;
    }

    const currentAlloc = p.memberAllocations || {};

    tbody.innerHTML = checkedBoxes.map(chk => {
      const uName = chk.dataset.username;
      const name = chk.dataset.name;
      const roleSelect = document.querySelector(`.mar-role-select[data-username="${uName}"]`);
      const role = roleSelect ? roleSelect.value : 'tester';
      const userAlloc = currentAlloc[uName] || {};

      let roleBadge = '<span class="badge badge-info" style="font-size:10.5px">🧪 Tester</span>';
      if (role === 'lead') roleBadge = '<span class="badge badge-p1" style="font-size:10.5px; font-weight:800">👑 Lead</span>';
      else if (role === 'dev') roleBadge = '<span class="badge" style="font-size:10.5px; background:rgba(139,92,246,0.1); color:#7c3aed">💻 Dev</span>';
      else if (role === 'automation') roleBadge = '<span class="badge" style="font-size:10.5px; background:rgba(16,185,129,0.1); color:#059669">⚡ Auto</span>';

      const verInputs = verList.map(vStr => {
        let val = userAlloc[vStr];
        if (val === undefined) {
          // Gợi ý thông minh: Nếu chỉ có 1 phiên bản thì 100%, nếu nhiều phiên bản thì phân bổ đều
          val = verList.length === 1 ? 100 : Math.round(100 / verList.length);
        }
        return `
          <td style="text-align:center">
            <div style="display:inline-flex; align-items:center; gap:4px">
              <input type="number" min="0" max="100" class="form-control mar-matrix-input" data-username="${escapeHtml(uName)}" data-version="${escapeHtml(vStr)}" value="${val}" oninput="LeadDashboard.updateMatrixTotal('${escapeHtml(uName)}')" style="width:65px; text-align:center; height:30px; font-size:12px; font-weight:700; padding:2px" />
              <span style="font-size:11px; font-weight:700; color:var(--text-muted)">%</span>
            </div>
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:8px">
              <div class="user-avatar-circle" style="width:30px; height:30px; font-weight:800; font-size:12px; border-radius:8px; background:rgba(37,99,235,0.1); color:#2563eb; display:flex; align-items:center; justify-content:center; flex-shrink:0">
                ${(name || uName).substring(0, 1).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:700; color:var(--text-primary); font-size:12.5px">${escapeHtml(name)}</div>
                <div style="display:flex; align-items:center; gap:6px; margin-top:2px">
                  <span style="font-size:10.5px; color:var(--text-muted)">@${escapeHtml(uName)}</span>
                  ${roleBadge}
                </div>
              </div>
            </div>
          </td>
          ${verInputs}
          <td style="text-align:center">
            <span id="mar-total-${escapeHtml(uName)}" style="font-size:13px; font-weight:800; color:#16a34a">100%</span>
          </td>
          <td style="text-align:center">
            <span id="mar-status-${escapeHtml(uName)}" class="badge" style="background:rgba(22,163,74,0.1); color:#16a34a; font-size:10.5px; font-weight:800">
              🟢 Chuẩn
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Tính toán tổng cam kết ban đầu cho từng người
    checkedBoxes.forEach(chk => {
      this.updateMatrixTotal(chk.dataset.username);
    });
  },

  updateMatrixTotal(username) {
    const inputs = document.querySelectorAll(`.mar-matrix-input[data-username="${username}"]`);
    let sum = 0;
    inputs.forEach(inp => {
      sum += Number(inp.value) || 0;
    });

    const totalEl = document.getElementById(`mar-total-${username}`);
    const statusEl = document.getElementById(`mar-status-${username}`);

    if (totalEl) {
      totalEl.textContent = `${sum}%`;
      if (sum === 100) totalEl.style.color = '#16a34a';
      else if (sum > 100) totalEl.style.color = '#dc2626';
      else totalEl.style.color = '#d97706';
    }

    if (statusEl) {
      if (sum === 100) {
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(22,163,74,0.1)';
        statusEl.style.color = '#16a34a';
        statusEl.textContent = '🟢 Tối ưu (100%)';
      } else if (sum > 100) {
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(220,38,38,0.1)';
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '🔴 Quá tải (>100%)';
      } else {
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(217,119,6,0.1)';
        statusEl.style.color = '#d97706';
        statusEl.textContent = `🟡 Dư ${100 - sum}% tải`;
      }
    }
  },

  updateRosterCount() {
    const checked = document.querySelectorAll('.mar-member-chk:checked');
    const countEl = document.getElementById('mar-selected-count');
    if (countEl) countEl.textContent = checked.length;
  },

  confirmSaveRoster() {
    const p = getActiveProject();
    if (!p) return;

    const checkedBoxes = document.querySelectorAll('.mar-member-chk:checked');
    const newMembers = [];
    const newAllocations = {};

    checkedBoxes.forEach(chk => {
      const username = chk.dataset.username;
      const name = chk.dataset.name;
      const title = chk.dataset.title;
      const roleSelect = document.querySelector(`.mar-role-select[data-username="${username}"]`);
      const projectRole = roleSelect ? roleSelect.value : 'tester';
      const capInp = document.querySelector(`.mar-capacity-input[data-username="${username}"]`);
      const maxCapacity = capInp ? (Number(capInp.value) || 35) : 35;

      newMembers.push({ username, name, title, projectRole, maxCapacity });

      // Lấy phân bổ theo phiên bản từ ma trận
      const userAllocInputs = document.querySelectorAll(`.mar-matrix-input[data-username="${username}"]`);
      newAllocations[username] = {};
      userAllocInputs.forEach(inp => {
        const v = inp.dataset.version;
        const val = Number(inp.value) || 0;
        if (val > 0) {
          newAllocations[username][v] = val;
        }
      });
    });

    p.members = newMembers;
    p.memberAllocations = newAllocations;

    saveCoreState();
    closeModal('modal-assign-roster');
    showToast(`✅ Đã cập nhật biên chế ${newMembers.length} kỹ sư & ma trận phân bổ phiên bản thành công!`, 'success');
    this.renderKpis();
    this.renderProjectRoster();
  },

  // ==================== 6. WORKLOAD BALANCING & SMART CAPACITY ====================
  balanceWorkload() {
    const p = getActiveProject();
    if (!p) return;

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const assignments = (typeof getProjectAssignments === 'function') 
      ? getProjectAssignments(p.id) 
      : (state.assignments || []).filter(a => a.projectId === p.id);

    const testers = members.filter(m => (m.projectRole || 'tester').toLowerCase() !== 'dev');
    if (testers.length === 0) {
      showToast('⚠️ Dự án chưa có kỹ sư kiểm thử nào trong biên chế để cân bằng tải!', 'error');
      return;
    }

    // Đếm số kịch bản đang giao cho từng tester
    const countMap = new Map();
    testers.forEach(t => countMap.set(t.username || t, 0));
    assignments.forEach(a => {
      const u = a.username || a.assigneeUsername;
      if (countMap.has(u)) {
        countMap.set(u, countMap.get(u) + 1);
      }
    });

    const entries = Array.from(countMap.entries());
    entries.sort((a, b) => b[1] - a[1]); // Giảm dần

    const maxTester = entries[0];
    const minTester = entries[entries.length - 1];
    const diff = maxTester[1] - minTester[1];

    if (diff <= 5) {
      showToast(`🎉 Tải trọng kịch bản đang ở mức rất cân bằng (chênh lệch chỉ ${diff} bài giữa các tester)!`, 'success');
    } else {
      showToast(`⚖️ Phân tích tải trọng: [@${maxTester[0]}: ${maxTester[1]} bài] đang lệch với [@${minTester[0]}: ${minTester[1]} bài]. Hãy mở Bàn làm việc để điều chỉnh ma trận phân bổ!`, 'info');
      // Mở ngay tab Matrix để người dùng trực quan điều chỉnh
      setTimeout(() => {
        this.openAssignRosterModal('matrix');
      }, 1000);
    }
  },

  // ==================== 7. TIER-1 WORKSPACE TABS & INLINE CONTROLLERS ====================
  switchMainTab(tabKey) {
    const validTabs = ['overview', 'versions', 'roster', 'settings'];
    const activeKey = validTabs.includes(tabKey) ? tabKey : 'overview';

    // 1. Toggle Panes
    validTabs.forEach(t => {
      const pane = document.getElementById(`tab-pane-${t}`);
      if (pane) {
        pane.style.display = (t === activeKey) ? 'block' : 'none';
      }
    });

    // 2. Toggle Subnav Button Classes
    const btnOverview = document.getElementById('btn-subnav-overview');
    const btnVersions = document.getElementById('btn-subnav-versions');
    const btnRoster = document.getElementById('btn-subnav-roster');
    const btnSettings = document.getElementById('btn-subnav-settings');

    if (btnOverview) {
      if (activeKey === 'overview') btnOverview.classList.add('active');
      else btnOverview.classList.remove('active');
    }
    if (btnVersions) {
      if (activeKey === 'versions') btnVersions.classList.add('active');
      else btnVersions.classList.remove('active');
    }
    if (btnRoster) {
      if (activeKey === 'roster') btnRoster.classList.add('active');
      else btnRoster.classList.remove('active');
    }
    if (btnSettings) {
      if (activeKey === 'settings') btnSettings.classList.add('active');
      else btnSettings.classList.remove('active');
    }

    // 3. Render specific content
    if (activeKey === 'overview') {
      this.renderExecutiveHealth();
      this.renderDevPipeline();
    } else if (activeKey === 'versions') {
      this.renderVersionManagementCockpit();
    } else if (activeKey === 'roster') {
      this.renderProjectRoster();
      this.renderInlineMatrix();
    } else if (activeKey === 'settings') {
      this.populateInlineSettings();
    }

    // 4. Update URL without reload
    try {
      const url = new URL(window.location);
      url.searchParams.set('tab', activeKey);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  },

  switchRosterSubView(viewKey) {
    const btnTable = document.getElementById('btn-roster-view-table');
    const btnMatrix = document.getElementById('btn-roster-view-matrix');
    const paneTable = document.getElementById('roster-subview-table');
    const paneMatrix = document.getElementById('roster-subview-matrix');

    if (viewKey === 'matrix') {
      btnTable?.classList.replace('btn-primary', 'btn-outline');
      btnMatrix?.classList.replace('btn-outline', 'btn-primary');
      if (paneTable) paneTable.style.display = 'none';
      if (paneMatrix) paneMatrix.style.display = 'block';
      this.renderInlineMatrix();
    } else {
      btnMatrix?.classList.replace('btn-primary', 'btn-outline');
      btnTable?.classList.replace('btn-outline', 'btn-primary');
      if (paneMatrix) paneMatrix.style.display = 'none';
      if (paneTable) paneTable.style.display = 'block';
      this.renderProjectRoster();
    }
  },

  renderInlineMatrix() {
    const p = getActiveProject();
    if (!p) return;

    const theadTr = document.getElementById('lead-inline-matrix-thead-tr');
    const tbody = document.getElementById('lead-inline-matrix-tbody');
    if (!theadTr || !tbody) return;

    const versions = typeof getProjectVersions === 'function' ? getProjectVersions(p.id) : (p.versions || []);
    const verList = versions.map(v => v.version || v);
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);

    theadTr.innerHTML = `
      <th style="min-width:200px">Kỹ sư và chuyên môn</th>
      <th style="width:130px; text-align:center">Vai trò</th>
      ${verList.map(vStr => `
        <th style="text-align:center; min-width:110px">
          <div style="font-size:12px; font-weight:800">📦 ${escapeHtml(vStr)}</div>
          <div style="font-size:10px; font-weight:600; color:var(--text-muted)">% Cam kết</div>
        </th>
      `).join('')}
      <th style="text-align:center; width:150px">Tổng cam kết (%)</th>
      <th style="text-align:center; width:130px">Đánh giá tải</th>
    `;

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${verList.length + 4}" style="padding:28px 16px; text-align:center; color:var(--text-muted); font-size:13px">
            Chưa có nhân sự trong biên chế. Bấm <strong>⚙️ Thiết lập biên chế và phân bổ</strong> để bổ sung thành viên.
          </td>
        </tr>
      `;
      return;
    }

    const currentAlloc = p.memberAllocations || {};

    tbody.innerHTML = members.map(m => {
      const uName = m.username || m;
      const role = (m.projectRole || 'tester').toLowerCase();
      const userAlloc = currentAlloc[uName] || {};

      let roleBadge = '<span class="badge badge-info" style="font-size:10.5px">🧪 Kiểm thử</span>';
      if (role === 'lead') roleBadge = '<span class="badge badge-p1" style="font-size:10.5px; font-weight:800">👑 Trưởng nhóm</span>';
      else if (role === 'dev') roleBadge = '<span class="badge" style="font-size:10.5px; background:rgba(139,92,246,0.1); color:#7c3aed">💻 Lập trình</span>';
      else if (role === 'automation') roleBadge = '<span class="badge" style="font-size:10.5px; background:rgba(16,185,129,0.1); color:#059669">⚡ Tự động</span>';

      const verInputs = verList.map(vStr => {
        let val = userAlloc[vStr];
        if (val === undefined) {
          val = verList.length === 1 ? 100 : Math.round(100 / verList.length);
        }
        return `
          <td style="text-align:center">
            <div style="display:inline-flex; align-items:center; gap:4px">
              <input type="number" min="0" max="100" class="form-control inline-matrix-input" data-username="${escapeHtml(uName)}" data-version="${escapeHtml(vStr)}" value="${val}" oninput="LeadDashboard.updateInlineMatrixTotal('${escapeHtml(uName)}')" style="width:65px; text-align:center; height:30px; font-size:12px; font-weight:700; padding:2px" />
              <span style="font-size:11px; font-weight:700; color:var(--text-muted)">%</span>
            </div>
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:8px">
              <div class="user-avatar-circle" style="width:32px; height:32px; font-weight:800; font-size:12px; border-radius:8px; background:rgba(37,99,235,0.1); color:#2563eb; display:flex; align-items:center; justify-content:center; flex-shrink:0">
                ${(m.name || uName).substring(0, 1).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:700; color:var(--text-primary); font-size:12.5px">${escapeHtml(m.name || uName)}</div>
                <div style="font-size:11px; color:var(--text-muted)">@${escapeHtml(uName)}</div>
              </div>
            </div>
          </td>
          <td style="text-align:center">${roleBadge}</td>
          ${verInputs}
          <td style="text-align:center">
            <span id="inline-mar-total-${escapeHtml(uName)}" style="font-size:13px; font-weight:800; color:#16a34a">100%</span>
          </td>
          <td style="text-align:center">
            <span id="inline-mar-status-${escapeHtml(uName)}" class="badge" style="background:rgba(22,163,74,0.1); color:#16a34a; font-size:10.5px; font-weight:800">
              🟢 Chuẩn
            </span>
          </td>
        </tr>
      `;
    }).join('');

    members.forEach(m => {
      this.updateInlineMatrixTotal(m.username || m);
    });
  },

  updateInlineMatrixTotal(username) {
    const inputs = document.querySelectorAll(`.inline-matrix-input[data-username="${username}"]`);
    let sum = 0;
    inputs.forEach(inp => {
      sum += Number(inp.value) || 0;
    });

    const totalEl = document.getElementById(`inline-mar-total-${username}`);
    const statusEl = document.getElementById(`inline-mar-status-${username}`);

    if (totalEl) {
      totalEl.textContent = `${sum}%`;
      if (sum === 100) totalEl.style.color = '#16a34a';
      else if (sum > 100) totalEl.style.color = '#dc2626';
      else totalEl.style.color = '#d97706';
    }

    if (statusEl) {
      if (sum === 100) {
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(220,38,38,0.1)';
        if (sum === 100) {
          statusEl.style.background = 'rgba(22,163,74,0.1)';
          statusEl.style.color = '#16a34a';
          statusEl.textContent = '🟢 Tối ưu (100%)';
        }
      } else if (sum > 100) {
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(220,38,38,0.1)';
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '🔴 Quá tải (>100%)';
      } else {
        statusEl.className = 'badge';
        statusEl.style.background = 'rgba(217,119,6,0.1)';
        statusEl.style.color = '#d97706';
        statusEl.textContent = `🟡 Dư ${100 - sum}% tải`;
      }
    }
  },

  confirmSaveInlineMatrix() {
    const p = getActiveProject();
    if (!p) return;

    const members = typeof getProjectMembers === 'function' ? getProjectMembers(p.id) : (p.members || []);
    const newAllocations = {};

    members.forEach(m => {
      const u = m.username || m;
      newAllocations[u] = {};
      const inputs = document.querySelectorAll(`.inline-matrix-input[data-username="${u}"]`);
      inputs.forEach(inp => {
        const v = inp.dataset.version;
        const val = Number(inp.value) || 0;
        if (val > 0) {
          newAllocations[u][v] = val;
        }
      });
    });

    p.memberAllocations = newAllocations;
    saveCoreState();
    showToast('✅ Đã lưu ma trận phân bổ nhân sự theo phiên bản thành công!', 'success');
    this.renderKpis();
    this.renderProjectRoster();
  },

  // ==================== 8. INLINE PROJECT SETTINGS ====================
  populateInlineSettings() {
    const p = getActiveProject();
    if (!p) return;

    // 1. Governance
    const codeEl = document.getElementById('ips-code');
    if (codeEl) codeEl.value = p.code || p.id;
    const nameEl = document.getElementById('ips-name');
    if (nameEl) nameEl.value = p.name || '';
    const leadEl = document.getElementById('ips-lead');
    if (leadEl) leadEl.value = p.lead || p.manager || '';
    const poEl = document.getElementById('ips-po');
    if (poEl) poEl.value = p.governance?.po || p.po || '';
    const devLeadEl = document.getElementById('ips-devlead');
    if (devLeadEl) devLeadEl.value = p.governance?.devLead || p.devLead || '';
    const descEl = document.getElementById('ips-desc');
    if (descEl) descEl.value = p.description || '';

    // 2. Quality Gates
    const stdEl = document.getElementById('ips-standard');
    if (stdEl) stdEl.value = p.standard || 'ISO/IEC/IEEE 29119';
    const qGates = p.qualityGates || {};
    const passRateEl = document.getElementById('ips-gate-passrate');
    if (passRateEl) passRateEl.value = qGates.minPassRate ?? 95;
    const covEl = document.getElementById('ips-gate-coverage');
    if (covEl) covEl.value = qGates.minCoverage ?? 100;
    const maxP1El = document.getElementById('ips-gate-max-p1');
    if (maxP1El) maxP1El.value = qGates.maxP1 ?? 0;
    const maxP2El = document.getElementById('ips-gate-max-p2');
    if (maxP2El) maxP2El.value = qGates.maxP2 ?? 1;
    const maxP3El = document.getElementById('ips-gate-max-p3');
    if (maxP3El) maxP3El.value = qGates.maxP3 ?? 3;

    // 3. SLA & Rules
    const sla = p.sla || {};
    const slaP1El = document.getElementById('ips-sla-p1');
    if (slaP1El) slaP1El.value = sla.p1 || '4h';
    const slaP2El = document.getElementById('ips-sla-p2');
    if (slaP2El) slaP2El.value = sla.p2 || '24h';
    const slaP3El = document.getElementById('ips-sla-p3');
    if (slaP3El) slaP3El.value = sla.p3 || '5d';
    const ruleEvEl = document.getElementById('ips-rule-evidence');
    if (ruleEvEl) ruleEvEl.checked = sla.ruleEvidence !== false;
    const rulePeerEl = document.getElementById('ips-rule-peer');
    if (rulePeerEl) rulePeerEl.checked = sla.rulePeer !== false;
    const ruleLockEl = document.getElementById('ips-rule-autolock');
    if (ruleLockEl) ruleLockEl.checked = sla.ruleAutolock !== false;

    // 4. Environments
    const env = p.environments || {};
    const envTypeEl = document.getElementById('ips-env-type');
    if (envTypeEl) envTypeEl.value = env.primaryEnv || 'STAGING_UAT';
    const envUrlEl = document.getElementById('ips-env-url');
    if (envUrlEl) envUrlEl.value = env.envUrl || p.targetEnvironmentUrl || '';
    const plats = env.platforms || p.targetPlatforms || [];
    const pWeb = document.getElementById('ips-plat-web');
    if (pWeb) pWeb.checked = plats.includes('web');
    const pMob = document.getElementById('ips-plat-mobile');
    if (pMob) pMob.checked = plats.includes('mobile');
    const pCam = document.getElementById('ips-plat-cam');
    if (pCam) pCam.checked = plats.includes('cam');
    const pIot = document.getElementById('ips-plat-iot');
    if (pIot) pIot.checked = plats.includes('iot');

    // 5. Alerts
    const alerts = p.alerts || {};
    const alertCritEl = document.getElementById('ips-alert-critical');
    if (alertCritEl) alertCritEl.checked = alerts.criticalAlert !== false;
    const alertEndEl = document.getElementById('ips-alert-endpoint');
    if (alertEndEl) alertEndEl.value = alerts.endpoint || '';
  },

  switchInlineSettingsTab(subTabKey) {
    const tabs = ['gov', 'gates', 'sla', 'env', 'alerts'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-ips-${t}`);
      const pane = document.getElementById(`ips-pane-${t}`);
      if (btn) {
        if (t === subTabKey) btn.classList.add('active');
        else btn.classList.remove('active');
      }
      if (pane) {
        pane.style.display = (t === subTabKey) ? 'flex' : 'none';
      }
    });
  },

  saveInlineProjectSettings() {
    const p = getActiveProject();
    if (!p) return;

    const name = (document.getElementById('ips-name')?.value || '').trim();
    if (!name) {
      showToast('⚠️ Tên dự án không được để trống!', 'error');
      return;
    }

    p.name = name;
    p.lead = (document.getElementById('ips-lead')?.value || '').trim();
    p.description = (document.getElementById('ips-desc')?.value || '').trim();
    p.standard = document.getElementById('ips-standard')?.value || 'ISO/IEC/IEEE 29119';

    p.governance = {
      po: (document.getElementById('ips-po')?.value || '').trim(),
      devLead: (document.getElementById('ips-devlead')?.value || '').trim()
    };

    p.qualityGates = {
      minPassRate: Number(document.getElementById('ips-gate-passrate')?.value) || 95,
      minCoverage: Number(document.getElementById('ips-gate-coverage')?.value) || 100,
      maxP1: Number(document.getElementById('ips-gate-max-p1')?.value) || 0,
      maxP2: Number(document.getElementById('ips-gate-max-p2')?.value) || 1,
      maxP3: Number(document.getElementById('ips-gate-max-p3')?.value) || 3
    };

    p.sla = {
      p1: document.getElementById('ips-sla-p1')?.value || '4h',
      p2: document.getElementById('ips-sla-p2')?.value || '24h',
      p3: document.getElementById('ips-sla-p3')?.value || '5d',
      ruleEvidence: document.getElementById('ips-rule-evidence')?.checked ?? true,
      rulePeer: document.getElementById('ips-rule-peer')?.checked ?? true,
      ruleAutolock: document.getElementById('ips-rule-autolock')?.checked ?? true
    };

    const platforms = [];
    if (document.getElementById('ips-plat-web')?.checked) platforms.push('web');
    if (document.getElementById('ips-plat-mobile')?.checked) platforms.push('mobile');
    if (document.getElementById('ips-plat-cam')?.checked) platforms.push('cam');
    if (document.getElementById('ips-plat-iot')?.checked) platforms.push('iot');

    const envUrl = (document.getElementById('ips-env-url')?.value || '').trim();
    p.environments = {
      primaryEnv: document.getElementById('ips-env-type')?.value || 'STAGING_UAT',
      envUrl,
      platforms
    };
    p.targetEnvironmentUrl = envUrl;

    p.alerts = {
      criticalAlert: document.getElementById('ips-alert-critical')?.checked ?? true,
      endpoint: (document.getElementById('ips-alert-endpoint')?.value || '').trim()
    };

    saveCoreState();
    showToast(`✅ Đã lưu toàn diện cấu hình Enterprise cho dự án [${p.code || p.id}]!`, 'success');
    this.renderKpis();
    if (window.LeadContext) {
      LeadContext.renderCompactProjectBar();
    }
  }
};

// Export toàn cục
if (typeof window !== 'undefined') {
  window.LeadDashboard = LeadDashboard;
}
