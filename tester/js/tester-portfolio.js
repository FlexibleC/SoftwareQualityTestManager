/**
 * TESTER MODULE: PORTFOLIO HUB (TẦNG 0) - tester-portfolio.js
 * Bàn điều hành tác nghiệp kiểm thử cá nhân (Tester Daily Action Center)
 * Tuân thủ nghiêm ngặt nguyên tắc:
 * 1. Chỉ hiển thị dự án & kịch bản được phân công đích danh cho Tester.
 * 2. Mặc định hiển thị danh mục dự án ở dạng bảng (Table view).
 * 3. Chuẩn hóa ngữ pháp tiếng Việt: Sử dụng Sentence case (viết hoa chữ cái đầu và danh từ riêng).
 */

const TesterPortfolio = {
  viewMode: 'table', // Mặc định hiển thị dạng bảng theo yêu cầu

  init() {
    TesterContext.init(0);
    this.renderPortfolioKpis();
    this.renderNotificationBell();
    this.renderProjectsView();
    this.renderPriorityQueue();
    this.bindGlobalEvents();
  },

  /**
   * Tính toán 4 chỉ số tác nghiệp cốt lõi và thực chất cho Tester:
   * 1. Khối lượng bài cần test (Bao nhiêu bài còn phải test / Tổng số bài giao)
   * 2. Thời gian còn lại tối đa (Hạn chót đợt test gần nhất & Nỗ lực ước tính)
   * 3. Kịch bản khẩn cấp P1 chưa đạt (Blocker / Critical cần test trước)
   * 4. Số bài lỗi Dev đã sửa đang chờ kiểm thử lại (Re-test nghiệm thu đóng lỗi)
   */
  renderPortfolioKpis() {
    const user = getCurrentUser();
    const myProjects = TesterContext.getAssignedProjectsForTester(user);

    let totalAssignedTcs = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalRetests = 0;
    let totalP1Pending = 0;
    let remainingTasks = 0;
    let earliestDueDate = null;

    // Quét qua các dự án được giao - Sử dụng chỉ số phân tầng cấp Dự án
    myProjects.forEach(p => {
      const pStats = TesterContext.getProjectStats(p.id);
      totalAssignedTcs += pStats.total;
      totalPassed += pStats.pass;
      totalFailed += pStats.fail;
      totalRetests += pStats.retest;
      totalP1Pending += pStats.p1;
      remainingTasks += (pStats.total - pStats.pass);

      // Tìm đợt kiểm thử đang hoạt động trong các phiên bản được giao cho Tester
      const assignedVers = TesterContext.getAssignedVersionsForTester(p.id);
      const activeVer = (assignedVers.find(v => (v.version || v) === p.activeVersion) || assignedVers[0])?.version 
                     || (assignedVers[0] && (assignedVers[0].version || assignedVers[0]))
                     || p.activeVersion || 'v1.0';
      const myCycles = TesterContext.getAssignedCyclesForTester(p.id, activeVer);
      myCycles.forEach(c => {
        const rawDate = c.endDate || c.dueDate;
        if (rawDate) {
          const d = this.parseDate(rawDate);
          if (d && (!earliestDueDate || d < earliestDueDate)) {
            earliestDueDate = d;
          }
        }
      });
    });

    // Ước tính nỗ lực thực thi (~5 phút / bài test)
    const avgMinutesPerTc = 5;
    const estTotalMinutes = remainingTasks * avgMinutesPerTc;
    let estTimeStr = '~0 giờ';
    if (estTotalMinutes > 0) {
      const hours = Math.floor(estTotalMinutes / 60);
      const mins = estTotalMinutes % 60;
      if (hours > 0) {
        estTimeStr = mins > 0 ? `~${hours}h ${mins}p` : `~${hours} giờ`;
      } else {
        estTimeStr = `~${mins} phút`;
      }
    }

    const pRate = totalAssignedTcs > 0 ? Math.round((totalPassed / totalAssignedTcs) * 100) : 0;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // Thẻ 1: Khối lượng bài cần test
    setVal('kpi-tasks-val', `${remainingTasks} / ${totalAssignedTcs} bài`);
    setVal('kpi-tasks-sub', `Đã đạt ${totalPassed}/${totalAssignedTcs} bài (${pRate}%) • Còn ${remainingTasks} bài chưa đạt`);

    // Thẻ 2: Thời gian còn lại tối đa & Hạn chót đợt test
    let deadlineMain = 'Không thời hạn';
    let deadlineSub = 'Đợt kiểm thử không đặt thời hạn';
    if (earliestDueDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((earliestDueDate - now) / (1000 * 60 * 60 * 24));
      const formattedDate = earliestDueDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (diffDays < 0) {
        deadlineMain = `Quá hạn ${Math.abs(diffDays)} ngày`;
        deadlineSub = `Hạn chót: ${formattedDate} • Nỗ lực ước tính: ${estTimeStr}`;
      } else if (diffDays === 0) {
        deadlineMain = `Hôm nay là hạn chót`;
        deadlineSub = `Hạn chót: ${formattedDate} • Nỗ lực ước tính: ${estTimeStr}`;
      } else {
        deadlineMain = `Còn ${diffDays} ngày`;
        deadlineSub = `Hạn chót: ${formattedDate} • Nỗ lực ước tính: ${estTimeStr}`;
      }
    }
    setVal('kpi-deadline-val', deadlineMain);
    setVal('kpi-deadline-sub', deadlineSub);

    // Thẻ 3: Kịch bản khẩn cấp (P1)
    setVal('kpi-p1-val', `${totalP1Pending} bài P1`);
    setVal('kpi-p1-sub', totalP1Pending > 0 ? 'Mức Blocker / Critical cần chạy trước' : 'Toàn bộ kịch bản P1 đã hoàn thành');

    // Thẻ 4: Chờ kiểm thử lại (Re-test)
    setVal('kpi-retest-val', `${totalRetests} bài re-test`);
    setVal('kpi-retest-sub', totalRetests > 0 ? 'Developer đã sửa xong • Cần đóng lỗi' : 'Không có lỗi nào đang chờ nghiệm thu');
  },

  parseDate(str) {
    if (!str) return null;
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(str);
  },

  switchViewMode(mode) {
    this.viewMode = mode;
    const btnTable = document.getElementById('btn-view-table');
    const btnCards = document.getElementById('btn-view-cards');
    if (btnTable) {
      btnTable.className = mode === 'table' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    }
    if (btnCards) {
      btnCards.className = mode === 'cards' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    }
    this.renderProjectsView();
  },

  /**
   * Render danh mục các dự án Tester được giao
   */
  renderProjectsView() {
    const user = getCurrentUser();
    const myProjects = TesterContext.getAssignedProjectsForTester(user);
    const container = document.getElementById('tester-projects-container');
    if (!container) return;

    if (myProjects.length === 0) {
      container.innerHTML = `
        <div style="padding:40px; text-align:center; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border)">
          <div style="font-size:32px; margin-bottom:10px">🔒</div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary)">Chưa được phân bổ vào dự án nào</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-top:4px">
            Bạn chưa được Project Lead giao bài kiểm thử nào trong hệ thống.
          </p>
        </div>
      `;
      return;
    }

    if (this.viewMode === 'cards') {
      this.renderCardsView(myProjects, container);
    } else {
      this.renderTableView(myProjects, container);
    }
  },

  /**
   * Render danh mục dự án Dạng Bảng Chi Tiết (Table View - Mặc định)
   * Sử dụng Sentence case và thanh tiến độ đa phân đoạn 4 màu
   */
  renderTableView(projects, container) {
    container.innerHTML = `
      <div class="card" style="padding:0; overflow:hidden">
        <div style="overflow-x:auto">
          <table class="summary-matrix-table" style="width:100%">
            <thead>
              <tr>
                <th style="width:120px">Mã dự án</th>
                <th>Tên dự án & đợt kiểm thử</th>
                <th style="width:110px; text-align:center">Phiên bản</th>
                <th style="width:150px">Hạn chót đợt</th>
                <th style="width:120px; text-align:center">Bài được giao</th>
                <th style="width:230px">Tiến độ thực thi</th>
                <th style="width:140px; text-align:center">Điểm nóng</th>
                <th style="width:170px; text-align:center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => {
                // QUY TẮC PHÂN TẦNG: Tổng số bài dự án = Tổng số bài của tất cả phiên bản = Tổng số bài của tất cả các đợt
                const pStats = TesterContext.getProjectStats(p.id);
                const pTotal = pStats.total;
                const pPass = pStats.pass;
                const pFail = pStats.fail;
                const pBlock = pStats.block;
                const pUntested = pStats.untested;
                const pRetest = pStats.retest;
                const pP1 = pStats.p1;
                const pRate = pStats.passRate;

                const passW = pTotal > 0 ? (pPass / pTotal) * 100 : 0;
                const failW = pTotal > 0 ? (pFail / pTotal) * 100 : 0;
                const blockW = pTotal > 0 ? (pBlock / pTotal) * 100 : 0;
                const untestedW = pTotal > 0 ? (pUntested / pTotal) * 100 : 0;

                const assignedVers = TesterContext.getAssignedVersionsForTester(p.id);
                const activeVer = (assignedVers.find(v => (v.version || v) === p.activeVersion) || assignedVers[0])?.version 
                               || (assignedVers[0] && (assignedVers[0].version || assignedVers[0]))
                               || p.activeVersion || 'v1.0';
                const myCycles = TesterContext.getAssignedCyclesForTester(p.id, activeVer);
                const activeCycle = myCycles.find(c => c.status === 'ACTIVE') || myCycles[0] || null;

                // Xác định hạn chót đợt test
                const rawDate = activeCycle?.endDate || activeCycle?.dueDate || (p.versions?.find(v => v.version === activeVer)?.targetDate);
                let deadlineFormatted = 'Chưa đặt';
                let deadlineSub = '';
                if (rawDate) {
                  const d = this.parseDate(rawDate);
                  if (d) {
                    deadlineFormatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const now = new Date(); now.setHours(0, 0, 0, 0);
                    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                      deadlineSub = `<div style="font-size:10.5px; color:#dc2626; font-weight:700">⚠️ Quá hạn ${Math.abs(diffDays)} ngày</div>`;
                    } else if (diffDays === 0) {
                      deadlineSub = `<div style="font-size:10.5px; color:#ea580c; font-weight:700">🔥 Hạn hôm nay</div>`;
                    } else {
                      deadlineSub = `<div style="font-size:10.5px; color:#0d9488; font-weight:600">Còn ${diffDays} ngày</div>`;
                    }
                  } else {
                    deadlineFormatted = rawDate;
                  }
                }

                const studioUrl = activeCycle 
                  ? `cycle.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(activeCycle.version || activeVer)}&cycleId=${encodeURIComponent(activeCycle.id)}`
                  : `project.html?projectId=${encodeURIComponent(p.id)}`;

                return `
                  <tr>
                    <td>
                      <span class="matrix-cycle-code" style="color:#0d9488; border-color:rgba(13,148,136,0.3); font-weight:800; font-family:monospace; padding:3px 6px; border-radius:4px; background:rgba(13,148,136,0.08)">
                        [${escapeHtml(p.code || 'PRJ')}]
                      </span>
                    </td>
                    <td>
                      <strong style="font-size:13.5px; color:var(--text-primary)">${escapeHtml(p.name)}</strong>
                      <div style="font-size:11px; color:var(--text-muted); margin-top:3px; display:flex; align-items:center; gap:4px">
                        <span>🎯</span>
                        <span>${escapeHtml(activeCycle ? activeCycle.name : 'Đợt kiểm thử chính')}</span>
                      </div>
                    </td>
                    <td style="text-align:center">
                      <span class="badge badge-info" style="font-weight:700; font-size:11px">📦 ${escapeHtml(activeCycle?.version || activeVer)}</span>
                    </td>
                    <td>
                      <div style="font-size:12px; font-weight:700; color:var(--text-primary)">${deadlineFormatted}</div>
                      ${deadlineSub}
                    </td>
                    <td style="text-align:center">
                      <strong style="color:#0d9488; font-size:14px">${pTotal}</strong> <span style="font-size:11.5px; color:var(--text-muted)">bài</span>
                    </td>
                    <td>
                      <div style="font-size:11.5px; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center">
                        <span style="font-weight:600; color:var(--text-secondary)">${pPass}/${pTotal} đạt</span>
                        <strong style="color:#0d9488; font-size:12.5px">${pRate}%</strong>
                      </div>
                      <div class="matrix-progress-track" title="Đạt: ${pPass} | Lỗi: ${pFail} | Chặn: ${pBlock} | Chưa chạy: ${pUntested}">
                        <div class="matrix-seg-pass" style="width:${passW}%"></div>
                        <div class="matrix-seg-fail" style="width:${failW}%"></div>
                        <div class="matrix-seg-block" style="width:${blockW}%"></div>
                        <div class="matrix-seg-untested" style="width:${untestedW}%"></div>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:4px">
                        <span style="color:#16a34a; font-weight:600">✓ ${pPass} đạt</span>
                        <span style="color:#dc2626; font-weight:600">✗ ${pFail} lỗi</span>
                        <span style="color:#d97706; font-weight:600">⛔ ${pBlock} chặn</span>
                        <span style="color:var(--text-muted); font-weight:600">○ ${pUntested} chưa chạy</span>
                      </div>
                    </td>
                    <td style="text-align:center">
                      <div style="display:inline-flex; flex-direction:column; gap:4px; align-items:center">
                        ${pRetest > 0 ? `<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #d8b4fe; font-weight:700; font-size:10.5px; white-space:nowrap">🔄 ${pRetest} re-test</span>` : ''}
                        ${pP1 > 0 ? `<span class="badge badge-fail" style="font-weight:700; font-size:10.5px; white-space:nowrap">🚨 ${pP1} P1</span>` : ''}
                        ${pRetest === 0 && pP1 === 0 ? '<span style="color:#16a34a; font-size:11px; font-weight:700">✓ Ổn định</span>' : ''}
                      </div>
                    </td>
                    <td style="text-align:center">
                      <a href="${studioUrl}" class="btn btn-primary btn-sm" style="background:#0d9488; border-color:#0f766e; font-weight:700; font-size:11.5px; padding:6px 14px; white-space:nowrap; text-decoration:none">
                        Vào studio test ➔
                      </a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Render danh mục dự án Dạng Thẻ (Cards View)
   */
  renderCardsView(projects, container) {
    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(420px, 1fr)); gap:18px">
        ${projects.map(p => {
          // QUY TẮC PHÂN TẦNG: Tổng số bài dự án = Tổng số bài của tất cả phiên bản = Tổng số bài của tất cả các đợt
          const pStats = TesterContext.getProjectStats(p.id);
          const pTotal = pStats.total;
          const pPass = pStats.pass;
          const pFail = pStats.fail;
          const pBlock = pStats.block;
          const pUntested = pStats.untested;
          const pRetest = pStats.retest;
          const pP1 = pStats.p1;
          const pRate = pStats.passRate;

          const passW = pTotal > 0 ? (pPass / pTotal) * 100 : 0;
          const failW = pTotal > 0 ? (pFail / pTotal) * 100 : 0;
          const blockW = pTotal > 0 ? (pBlock / pTotal) * 100 : 0;
          const untestedW = pTotal > 0 ? (pUntested / pTotal) * 100 : 0;

          const remaining = pTotal - pPass;
          const estHours = Math.round((remaining * 5) / 60 * 10) / 10;

          const assignedVers = TesterContext.getAssignedVersionsForTester(p.id);
          const activeVer = (assignedVers.find(v => (v.version || v) === p.activeVersion) || assignedVers[0])?.version 
                         || (assignedVers[0] && (assignedVers[0].version || assignedVers[0]))
                         || p.activeVersion || 'v1.0';
          const myCycles = TesterContext.getAssignedCyclesForTester(p.id, activeVer);
          const activeCycle = myCycles.find(c => c.status === 'ACTIVE') || myCycles[0] || null;

          // Xác định hạn chót
          const rawDate = activeCycle?.endDate || activeCycle?.dueDate || (p.versions?.find(v => v.version === activeVer)?.targetDate);
          let deadlineFormatted = 'Chưa đặt';
          if (rawDate) {
            const d = this.parseDate(rawDate);
            deadlineFormatted = d ? d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : rawDate;
          }

          const studioUrl = activeCycle 
            ? `cycle.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(activeCycle.version || activeVer)}&cycleId=${encodeURIComponent(activeCycle.id)}`
            : `project.html?projectId=${encodeURIComponent(p.id)}`;

          return `
            <div class="tester-project-card" style="border-top:4px solid #0d9488">
              <div>
                <!-- Card Header -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px">
                  <div>
                    <span class="badge" style="background:rgba(13,148,136,0.12); color:#0d9488; font-family:monospace; font-weight:800; font-size:11px">
                      [${escapeHtml(p.code || 'PRJ')}]
                    </span>
                    <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin:6px 0 2px 0">
                      ${escapeHtml(p.name)}
                    </h3>
                    <div style="font-size:11.5px; color:var(--text-muted)">
                      📦 Phiên bản: <strong>${escapeHtml(activeCycle?.version || activeVer)}</strong> • 🎯 Đợt: <strong>${escapeHtml(activeCycle ? activeCycle.name : 'Đợt kiểm thử')}</strong>
                    </div>
                  </div>
                  <span class="badge ${activeCycle?.status === 'ACTIVE' ? 'badge-pass' : 'badge-info'}" style="font-size:10.5px">
                    ${activeCycle?.status === 'ACTIVE' ? '🟢 Đang mở' : '📦 Đang chạy'}
                  </span>
                </div>

                <!-- Time & Deadline Strip -->
                <div style="background:var(--bg-body); padding:8px 12px; border-radius:6px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:11.5px">
                  <div>
                    📅 Hạn chót: <strong style="color:var(--text-primary)">${deadlineFormatted}</strong>
                  </div>
                  <div style="color:#0d9488; font-weight:600">
                    ⏱️ Ước tính còn: ~${estHours} giờ
                  </div>
                </div>

                <!-- 4-Color Progress Bar -->
                <div style="margin-bottom:14px">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:12px">
                    <span style="font-weight:600; color:var(--text-secondary)">Tiến độ của bạn: <strong>${pPass}/${pTotal} đạt</strong></span>
                    <strong style="color:#0d9488; font-size:13px">${pRate}%</strong>
                  </div>

                  <div style="height:10px; border-radius:5px; background:var(--bg-surface); overflow:hidden; display:flex; border:1px solid var(--border-light)">
                    <div style="width:${passW}%; background:#16a34a" title="Pass: ${pPass} bài"></div>
                    <div style="width:${failW}%; background:#dc2626" title="Fail: ${pFail} bài"></div>
                    <div style="width:${blockW}%; background:#d97706" title="Blocked: ${pBlock} bài"></div>
                    <div style="width:${untestedW}%; background:#cbd5e1" title="Chưa chạy: ${pUntested} bài"></div>
                  </div>

                  <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:6px">
                    <span>🟢 Đạt: <strong>${pPass}</strong></span>
                    <span>🔴 Lỗi: <strong>${pFail}</strong></span>
                    <span>🟡 Chặn: <strong>${pBlock}</strong></span>
                    <span>⚪ Chưa chạy: <strong>${pUntested}</strong></span>
                  </div>
                </div>

                <!-- Alert Tags for this project -->
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px">
                  ${pRetest > 0 ? `<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #d8b4fe; font-weight:700">🔄 ${pRetest} bài cần re-test ngay</span>` : ''}
                  ${pP1 > 0 ? `<span class="badge" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-weight:700">🚨 ${pP1} bài P1 chưa đạt</span>` : ''}
                  ${pRetest === 0 && pP1 === 0 ? `<span class="badge badge-pass" style="font-size:10.5px">✓ Không có điểm nghẽn P1</span>` : ''}
                </div>
              </div>

              <!-- Action Link -->
              <div style="padding-top:14px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
                <a href="project.html?projectId=${encodeURIComponent(p.id)}" style="font-size:12px; color:var(--text-muted); text-decoration:none; font-weight:600">
                  ⚙️ Xem hồ sơ dự án
                </a>
                <a href="${studioUrl}" class="btn btn-primary btn-sm" style="background:#0d9488; border-color:#0f766e; font-weight:700; padding:6px 14px">
                  🚀 Vào studio thực thi (${remaining} bài còn) ➔
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Bảng hàng đợi ưu tiên cần xử lý ngay hôm nay
   * Gom tất cả các bài cần re-test và các bài P1 chưa đạt của tất cả các dự án được giao
   */
  renderPriorityQueue() {
    const user = getCurrentUser();
    const myProjects = TesterContext.getAssignedProjectsForTester(user);
    const container = document.getElementById('priority-queue-tbody');
    const badgeEl = document.getElementById('priority-queue-count');
    if (!container) return;

    const urgentTasks = [];

    myProjects.forEach(p => {
      const myTcs = TesterContext.getMyAssignedTasks(p.id, null);
      const assignedVers = TesterContext.getAssignedVersionsForTester(p.id);
      const activeVer = (assignedVers.find(v => (v.version || v) === p.activeVersion) || assignedVers[0])?.version 
                     || (assignedVers[0] && (assignedVers[0].version || assignedVers[0]))
                     || p.activeVersion || 'v1.0';
      const myCycles = TesterContext.getAssignedCyclesForTester(p.id, activeVer);
      const curCycle = myCycles.find(c => c.status === 'ACTIVE') || myCycles[0] || null;

      myTcs.forEach(tc => {
        const cycleId = tc.cycleId || curCycle?.id;
        const r = (state.cycleResults && cycleId && state.cycleResults[cycleId] && state.cycleResults[cycleId][tc.id])
               || (state.results && (state.results[`${p.id}__${tc.id}`] || state.results[tc.id])) || {};
        const s = (r.status || 'Not Run').toUpperCase();
        const prio = (tc.priority || 'P2').toUpperCase();

        const isRetest = (s === 'FAIL' || s === 'FAILED') && (r.defectStatus === 'Fixed' || r.defectStatus === 'Resolved' || r.isResolvedByDev);
        const isP1Pending = prio === 'P1' && s !== 'PASS' && s !== 'PASSED';

        if (isRetest || isP1Pending) {
          const itemCycle = (tc.cycleId && p.testCycles?.find(cy => cy.id === tc.cycleId)) || curCycle;
          urgentTasks.push({
            project: p,
            cycle: itemCycle,
            version: tc.version || activeVer,
            tc: tc,
            isRetest: isRetest,
            isP1: isP1Pending,
            status: s,
            result: r
          });
        }
      });
    });

    if (badgeEl) badgeEl.textContent = `${urgentTasks.length} bài`;

    if (urgentTasks.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted); font-size:12.5px">
            <span style="font-size:22px; display:block; margin-bottom:6px">🎉</span>
            Tuyệt vời! Hiện tại bạn không có bài kiểm thử P1 nào bị tồn đọng và không có bài nào cần re-test gấp.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = urgentTasks.map(item => {
      const tc = item.tc;
      const p = item.project;
      const c = item.cycle;
      const studioUrl = `cycle.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(c?.version || item.version)}&cycleId=${encodeURIComponent(c ? c.id : '')}&tcId=${encodeURIComponent(tc.id)}`;

      const statusTag = item.isRetest
        ? `<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #d8b4fe; font-weight:700; font-size:11px">🔄 Dev đã sửa (Chờ re-test)</span>`
        : `<span class="badge badge-fail" style="font-weight:700; font-size:11px">🚨 P1 Critical chưa đạt (${item.status})</span>`;

      return `
        <tr>
          <td><span class="matrix-cycle-code">[${escapeHtml(p.code || 'PRJ')}]</span></td>
          <td><span class="tc-badge-id">[${escapeHtml(tc.id)}]</span></td>
          <td>
            <strong>${escapeHtml(tc.name || tc.title || '')}</strong>
            <div style="font-size:11px; color:var(--text-muted)">Phân hệ: [${escapeHtml(tc.module || 'M01')}] • Đợt: ${escapeHtml(c ? c.name : 'Đợt test')}</div>
          </td>
          <td style="text-align:center">
            <span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-weight:700; font-size:11px">P1 Critical</span>
          </td>
          <td>${statusTag}</td>
          <td style="text-align:center">
            <a href="${studioUrl}" class="btn btn-sm" style="${item.isRetest ? 'background:#7c3aed; color:#fff' : 'background:#0d9488; color:#fff'}; font-weight:700; font-size:11px; padding:5px 12px">
              ${item.isRetest ? '🔄 Re-test ngay ➔' : '▶️ Chạy bài này ➔'}
            </a>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Quản lý Biểu tượng Chuông Thông báo trên Header
   * Gom toàn bộ các bài Dev đã sửa xong cần Re-test
   */
  renderNotificationBell() {
    const user = getCurrentUser();
    const myProjects = TesterContext.getAssignedProjectsForTester(user);
    const badgeEl = document.getElementById('tester-notif-badge');
    const countHeaderEl = document.getElementById('notif-header-count');
    const listEl = document.getElementById('tester-notif-list');

    const retestItems = [];

    myProjects.forEach(p => {
      const myTcs = TesterContext.getMyAssignedTasks(p.id, null);
      const assignedVers = TesterContext.getAssignedVersionsForTester(p.id);
      const activeVer = (assignedVers.find(v => (v.version || v) === p.activeVersion) || assignedVers[0])?.version 
                     || (assignedVers[0] && (assignedVers[0].version || assignedVers[0]))
                     || p.activeVersion || 'v1.0';
      const myCycles = TesterContext.getAssignedCyclesForTester(p.id, activeVer);
      const curCycle = myCycles.find(c => c.status === 'ACTIVE') || myCycles[0] || null;

      myTcs.forEach(tc => {
        const cycleId = tc.cycleId || curCycle?.id;
        const r = (state.cycleResults && cycleId && state.cycleResults[cycleId] && state.cycleResults[cycleId][tc.id])
               || (state.results && (state.results[`${p.id}__${tc.id}`] || state.results[tc.id])) || {};
        const s = (r.status || 'Not Run').toUpperCase();
        const isRetest = (s === 'FAIL' || s === 'FAILED') && (r.defectStatus === 'Fixed' || r.defectStatus === 'Resolved' || r.isResolvedByDev);

        if (isRetest) {
          const itemCycle = (tc.cycleId && p.testCycles?.find(cy => cy.id === tc.cycleId)) || curCycle;
          retestItems.push({
            project: p,
            cycle: itemCycle,
            version: tc.version || activeVer,
            tc: tc,
            result: r
          });
        }
      });
    });

    if (badgeEl) {
      if (retestItems.length > 0) {
        badgeEl.textContent = retestItems.length;
        badgeEl.style.display = 'flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    if (countHeaderEl) {
      countHeaderEl.textContent = `${retestItems.length} bài chờ re-test`;
    }

    if (listEl) {
      if (retestItems.length === 0) {
        listEl.innerHTML = `
          <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:12px">
            <span style="font-size:24px; display:block; margin-bottom:6px">🎉</span>
            Tuyệt vời! Hiện không có thông báo lỗi nào đang chờ bạn re-test.
          </div>
        `;
        return;
      }

      listEl.innerHTML = retestItems.map(item => {
        const p = item.project;
        const tc = item.tc;
        const r = item.result;
        const devName = r.assignedDev || 'Developer';
        const devNotes = r.devNotes || 'Đã sửa xong lỗi và chuyển sang Tester nghiệm thu.';

        return `
          <div class="tester-notif-item" onclick="TesterPortfolio.openNotifDetail('${escapeHtml(tc.id)}', '${escapeHtml(p.id)}')">
            <div class="tester-notif-item-icon">🔄</div>
            <div style="flex:1; min-width:0">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px">
                <span class="badge" style="background:rgba(13,148,136,0.12); color:#0d9488; font-family:monospace; font-weight:800; font-size:10px">
                  [${escapeHtml(p.code || 'PRJ')}]
                </span>
                <span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #d8b4fe; font-size:10px; font-weight:700">
                  Chờ re-test
                </span>
              </div>
              <div style="font-size:12.5px; font-weight:700; color:var(--text-primary); margin-bottom:3px; line-height:1.3">
                <span style="color:#7c3aed">[${escapeHtml(tc.id)}]</span> ${escapeHtml(tc.name || tc.title || '')}
              </div>
              <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">
                👨‍💻 <strong>${escapeHtml(devName)}:</strong> "${escapeHtml(devNotes)}"
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:#0d9488; font-weight:600">
                <span>🎯 ${escapeHtml(item.cycle ? item.cycle.name : 'Đợt test')}</span>
                <span style="color:#7c3aed; text-decoration:underline">Xem chi tiết & re-test ➔</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  toggleNotifDropdown(event) {
    if (event) event.stopPropagation();
    const dd = document.getElementById('tester-notif-dropdown');
    if (!dd) return;
    const isShown = dd.classList.contains('show');
    if (isShown) {
      dd.classList.remove('show');
    } else {
      dd.classList.add('show');
    }
  },

  closeNotifDropdown() {
    const dd = document.getElementById('tester-notif-dropdown');
    if (dd) dd.classList.remove('show');
  },

  openNotifDetail(tcId, projectId) {
    this.closeNotifDropdown();
    const user = getCurrentUser();
    const myProjects = TesterContext.getAssignedProjectsForTester(user);
    const p = myProjects.find(x => x.id === projectId) || (state.projects || []).find(x => x.id === projectId);
    if (!p) return;

    const myTcs = TesterContext.getMyAssignedTasks(p.id, null);
    const tc = myTcs.find(x => x.id === tcId) || (p.testCases || []).find(x => x.id === tcId);
    if (!tc) return;

    const assignedVers = TesterContext.getAssignedVersionsForTester(p.id);
    const activeVer = (assignedVers.find(v => (v.version || v) === p.activeVersion) || assignedVers[0])?.version 
                   || (assignedVers[0] && (assignedVers[0].version || assignedVers[0]))
                   || p.activeVersion || 'v1.0';
    const myCycles = TesterContext.getAssignedCyclesForTester(p.id, activeVer);
    const curCycle = (tc.cycleId && p.testCycles?.find(cy => cy.id === tc.cycleId)) || myCycles.find(c => c.status === 'ACTIVE') || myCycles[0] || null;
    const cycleId = tc.cycleId || curCycle?.id;
    const r = (state.cycleResults && cycleId && state.cycleResults[cycleId] && state.cycleResults[cycleId][tc.id])
           || (state.results && (state.results[`${p.id}__${tc.id}`] || state.results[tc.id])) || {};
    const devName = r.assignedDev || 'Lập trình viên phụ trách';
    const devNotes = r.devNotes || 'Đã kiểm tra mã nguồn, xử lý bản vá và kiểm thử đơn vị thành công. Kính chuyển Tester thực hiện nghiệm thu đóng lỗi.';
    const failReason = r.failReason || 'Ghi nhận lỗi trong phiên kiểm thử trước đó.';
    const runAt = r.runAt ? new Date(r.runAt).toLocaleString('vi-VN') : 'Gần đây';

    const studioUrl = `cycle.html?projectId=${encodeURIComponent(p.id)}&version=${encodeURIComponent(curCycle?.version || activeVer)}&cycleId=${encodeURIComponent(curCycle ? curCycle.id : '')}&tcId=${encodeURIComponent(tc.id)}`;

    const actionBtn = document.getElementById('btn-modal-retest-action');
    if (actionBtn) {
      actionBtn.href = studioUrl;
    }

    const bodyEl = document.getElementById('modal-notif-body');
    if (bodyEl) {
      const stepsHtml = (Array.isArray(tc.steps) && tc.steps.length > 0)
        ? tc.steps.map((st, i) => `<li style="margin-bottom:6px; font-size:12px; color:var(--text-secondary)">${escapeHtml(st)}</li>`).join('')
        : `<p style="font-size:12px; color:var(--text-muted)">Không có danh sách bước chi tiết.</p>`;

      const expHtml = (Array.isArray(tc.expected) && tc.expected.length > 0)
        ? tc.expected.map((ex, i) => `<li style="margin-bottom:6px; font-size:12px; color:var(--text-secondary)">${escapeHtml(ex)}</li>`).join('')
        : `<p style="font-size:12px; color:var(--text-muted)">${escapeHtml(tc.expected || 'Kết quả hoạt động đúng yêu cầu')}</p>`;

      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px">
          <!-- Banner tình trạng -->
          <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center">
            <div>
              <div style="font-size:11px; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:0.5px">Trạng thái xử lý</div>
              <div style="font-size:13.5px; font-weight:700; color:#5b21b6; margin-top:2px">
                🔄 Developer đã hoàn tất sửa lỗi — Đang chờ bạn re-test nghiệm thu
              </div>
            </div>
            <span class="badge" style="background:#7c3aed; color:#fff; font-weight:700; font-size:11px; padding:5px 12px">
              Cần nghiệm thu đóng lỗi
            </span>
          </div>

          <!-- Thông tin ngữ cảnh -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12.5px; background:var(--bg-surface); padding:14px; border-radius:8px; border:1px solid var(--border)">
            <div>
              <span style="color:var(--text-muted)">Dự án:</span>
              <div style="font-weight:700; color:var(--text-primary); margin-top:2px">
                [${escapeHtml(p.code || 'PRJ')}] ${escapeHtml(p.name)}
              </div>
            </div>
            <div>
              <span style="color:var(--text-muted)">Đợt kiểm thử:</span>
              <div style="font-weight:700; color:#0d9488; margin-top:2px">
                🎯 ${escapeHtml(curCycle ? curCycle.name : 'Đợt kiểm thử')}
              </div>
            </div>
            <div>
              <span style="color:var(--text-muted)">Mã & tiêu đề bài test:</span>
              <div style="font-weight:700; color:var(--text-primary); margin-top:2px">
                <span class="badge badge-info" style="font-family:monospace">[${escapeHtml(tc.id)}]</span> ${escapeHtml(tc.name || tc.title || '')}
              </div>
            </div>
            <div>
              <span style="color:var(--text-muted)">Mức ưu tiên & phân hệ:</span>
              <div style="font-weight:700; color:var(--text-primary); margin-top:2px">
                <span class="badge badge-fail">${escapeHtml(tc.priority || 'P1')} Critical</span> • Phân hệ: [${escapeHtml(tc.module || 'M01')}]
              </div>
            </div>
          </div>

          <!-- Nội dung lỗi phát hiện trước đó -->
          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px 16px">
            <div style="font-size:11.5px; font-weight:700; color:#dc2626; margin-bottom:4px">
              ⚠️ Lỗi phát hiện trước đó của bài kiểm thử:
            </div>
            <div style="font-size:12.5px; color:#991b1b; line-height:1.4">
              ${escapeHtml(failReason)}
            </div>
          </div>

          <!-- Phản hồi & ghi chú từ Developer -->
          <div style="background:rgba(13,148,136,0.06); border:1px solid rgba(13,148,136,0.25); border-radius:8px; padding:14px 16px">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <div style="font-size:11.5px; font-weight:700; color:#0d9488">
                👨‍💻 Phản hồi từ Developer: ${escapeHtml(devName)}
              </div>
              <span style="font-size:11px; color:var(--text-muted)">🕒 ${escapeHtml(runAt)}</span>
            </div>
            <div style="font-size:13px; color:var(--text-primary); font-style:italic; line-height:1.4; background:var(--bg-card); padding:10px 12px; border-radius:6px; border:1px solid var(--border)">
              "${escapeHtml(devNotes)}"
            </div>
          </div>

          <!-- Các bước thực hiện & Kết quả kỳ vọng để Re-test -->
          <div style="border:1px solid var(--border); border-radius:8px; padding:14px; background:var(--bg-card)">
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:700; color:var(--text-primary)">
              📋 Quy trình các bước thực thi để kiểm thử nghiệm thu:
            </h4>
            <ol style="margin:0 0 12px 18px; padding:0">
              ${stepsHtml}
            </ol>
            <h4 style="margin:0 0 6px 0; font-size:12.5px; font-weight:700; color:var(--text-primary)">
              🎯 Kết quả kỳ vọng đạt chuẩn (Pass):
            </h4>
            <ul style="margin:0 0 0 18px; padding:0">
              ${expHtml}
            </ul>
          </div>
        </div>
      `;
    }

    const modal = document.getElementById('modal-notif-detail');
    if (modal) {
      modal.style.display = 'flex';
    }
  },

  closeNotifDetail() {
    const modal = document.getElementById('modal-notif-detail');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#tester-notif-wrapper')) {
        this.closeNotifDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeNotifDetail();
        this.closeNotifDropdown();
      }
    });
  }
};

window.TesterPortfolio = TesterPortfolio;
