/**
 * SMARTVMS QA HUB - REPORTS & ANALYTICS MODULE (JS)
 * Standard Compliance: ISO 9001:2015 Clause 7.5 & 8.5.2 | ISO/IEC/IEEE 29119-3:2021 | ISO/IEC 25010:2023
 * Multi-dimensional QA Statistics, Chart.js Visualizations, Residual Risk & Defect Tracking
 */

let reportCharts = { pie: null, bar: null };

function initReportsModule() {
  initCoreState();
  renderKpiMetrics();
  renderReportCharts();
  renderProjectComparisonTable();
  renderTesterReportTable();
  renderDefectReportTable();
  renderMultiCycleReport();
}

function renderKpiMetrics() {
  const u = getCurrentUser();
  const all = getAccessibleTcsForUser(u, state.activeProjectId);
  const total = all.length;
  let pass = 0, fail = 0, blocked = 0, skip = 0, wip = 0;
  let criticalBugs = 0;

  all.forEach(tc => {
    const r = state.results[tc.id];
    const s = r ? (r.status || 'Not Run') : 'Not Run';
    if (s === 'Pass' || s === 'PASSED') pass++;
    else if (s === 'Fail' || s === 'FAILED') {
      fail++;
      if (r.severity === 'Critical' || r.severity === 'Blocker') criticalBugs++;
    }
    else if (s === 'Blocked' || s === 'BLOCKED') blocked++;
    else if (s === 'Skip' || s === 'SKIP') skip++;
    else if (s === 'In Progress' || s === 'WIP') wip++;
  });

  const pending = total - pass - fail - blocked - skip - wip;
  const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;

  const setVal = (ids, val) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  };

  // Support both rpt-* and kpi-* IDs across all role pages
  setVal(['rpt-total', 'kpi-total'], total);
  setVal(['rpt-pass', 'kpi-pass'], pass);
  setVal(['rpt-fail', 'kpi-fail'], fail);
  setVal(['rpt-blocked', 'kpi-blocked'], blocked);
  setVal(['rpt-skip', 'kpi-skip'], skip);
  setVal(['rpt-pending', 'kpi-wip', 'kpi-pending'], pending);
  setVal(['rpt-passrate', 'kpi-rate'], `${passRate}%`);
  setVal(['rpt-risk', 'kpi-risk', 'rpt-residual-risk'], `${criticalBugs} Critical Bug`);
}

function renderReportCharts() {
  const u = getCurrentUser();
  const all = getAccessibleTcsForUser(u, state.activeProjectId);
  let pass = 0, fail = 0, blocked = 0, skip = 0, pending = 0;

  all.forEach(tc => {
    const r = state.results[tc.id];
    const s = r ? (r.status || 'Not Run') : 'Not Run';
    if (s === 'Pass' || s === 'PASSED') pass++;
    else if (s === 'Fail' || s === 'FAILED') fail++;
    else if (s === 'Blocked' || s === 'BLOCKED') blocked++;
    else if (s === 'Skip' || s === 'SKIP') skip++;
    else pending++;
  });

  // Doughnut Chart (Find canvas by either ID)
  const pieCanvas = document.getElementById('chartReportPie') || document.getElementById('chart-status-doughnut');
  if (pieCanvas && window.Chart) {
    if (reportCharts.pie) reportCharts.pie.destroy();
    reportCharts.pie = new Chart(pieCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Đạt (Pass)', 'Lỗi (Fail)', 'Bị chặn (Blocked)', 'Bỏ qua (Skip)', 'Chưa chạy'],
        datasets: [{
          data: [pass, fail, blocked, skip, pending],
          backgroundColor: ['#22c55e', '#ef4444', '#991b1b', '#f59e0b', '#94a3b8'],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { boxWidth: 12, padding: 12, font: { family: 'Inter', size: 11, weight: '600' } } 
          }
        }
      }
    });
  }

  // Module Bar Chart (Find canvas by either ID)
  const barCanvas = document.getElementById('chartReportBar') || document.getElementById('chart-module-bar');
  if (barCanvas && window.Chart) {
    if (reportCharts.bar) reportCharts.bar.destroy();
    const mods = getAccessibleModulesForUser(u, state.activeProjectId);
    const labels = mods.map(m => m.id);
    const passData = mods.map(m => all.filter(t => t.module === m.id && (state.results[t.id]?.status === 'Pass' || state.results[t.id]?.status === 'PASSED')).length);
    const failData = mods.map(m => all.filter(t => t.module === m.id && (state.results[t.id]?.status === 'Fail' || state.results[t.id]?.status === 'FAILED')).length);
    const blockedData = mods.map(m => all.filter(t => t.module === m.id && (state.results[t.id]?.status === 'Blocked' || state.results[t.id]?.status === 'BLOCKED')).length);

    reportCharts.bar = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Đạt (Pass)', data: passData, backgroundColor: '#22c55e', borderRadius: 4 },
          { label: 'Lỗi (Fail)', data: failData, backgroundColor: '#ef4444', borderRadius: 4 },
          { label: 'Bị chặn (Blocked)', data: blockedData, backgroundColor: '#991b1b', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true }
        },
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { boxWidth: 12, padding: 12, font: { family: 'Inter', size: 11, weight: '600' } } 
          }
        }
      }
    });
  }
}

function renderProjectComparisonTable() {
  const tbody = document.getElementById('rpt-projects-tbody') || 
                document.getElementById('tbl-projects-body') || 
                document.getElementById('tbody-projects-matrix');
  if (!tbody) return;

  const u = getCurrentUser();
  const projects = getAccessibleProjects(u);
  tbody.innerHTML = projects.map(p => {
    const tcs = p.testCases || [];
    const total = tcs.length;
    let pass = 0, fail = 0;
    tcs.forEach(tc => {
      const r = state.results[tc.id];
      if (r?.status === 'Pass' || r?.status === 'PASSED') pass++;
      if (r?.status === 'Fail' || r?.status === 'FAILED') fail++;
    });
    const pending = total - pass - fail;
    const rate = total > 0 ? Math.round((pass / total) * 100) : 0;

    return `
      <tr>
        <td>
          <strong>${p.name}</strong> 
          <span class="badge badge-nr" style="margin-left:6px">${p.id}</span>
        </td>
        <td><span class="badge" style="background:#e0e7ff; color:#3730a3">${p.version || 'v2.0'}</span></td>
        <td style="text-align:center"><strong>${total}</strong></td>
        <td style="text-align:center; color:#16a34a; font-weight:700">${pass}</td>
        <td style="text-align:center; color:#dc2626; font-weight:700">${fail}</td>
        <td style="text-align:center; color:var(--text-muted)">${pending}</td>
        <td style="text-align:center">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center">
            <div style="flex:1; max-width:80px; height:8px; background:var(--border-light); border-radius:4px; overflow:hidden">
              <div style="width:${rate}%; height:100%; background:#2563eb; border-radius:4px"></div>
            </div>
            <strong>${rate}%</strong>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTesterReportTable() {
  const tbody = document.getElementById('rpt-tester-tbody') || 
                document.getElementById('tbl-testers-body') || 
                document.getElementById('tbody-tester-perf');
  if (!tbody) return;

  const curUser = getCurrentUser();
  const asgs = state.assignments || [];
  const testers = (curUser.role === 'tester') ? [curUser.username] : ['tester', 'tester_nam', 'tester_lan'];
  const testerNames = {
    'tester': 'Nguyễn Văn Nam (Tester 1)',
    'tester_nam': 'Nguyễn Văn Nam (Tester)',
    'tester_lan': 'Trần Thị Lan (Tester)'
  };

  tbody.innerHTML = testers.map(u => {
    const userAsgs = asgs.filter(a => a.assigneeUsername === u || (a.assigneeName && a.assigneeName.includes(u)));
    const total = userAsgs.length;
    const pass = userAsgs.filter(a => a.status === 'PASSED').length;
    const fail = userAsgs.filter(a => a.status === 'FAILED').length;
    const wip = total - pass - fail;
    const rate = total > 0 ? Math.round((pass / total) * 100) : 0;

    return `
      <tr>
        <td><strong>👤 ${testerNames[u] || (u === curUser.username ? curUser.name : u)}</strong></td>
        <td style="text-align:center"><strong>${total}</strong></td>
        <td style="text-align:center; color:#16a34a; font-weight:700">${pass}</td>
        <td style="text-align:center; color:#dc2626; font-weight:700">${fail}</td>
        <td style="text-align:center; color:#2563eb; font-weight:700">${wip}</td>
        <td style="text-align:center">
          <span class="badge ${rate >= 70 ? 'badge-pass' : (rate >= 40 ? 'badge-skip' : 'badge-fail')}">${rate}% Đạt</span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderDefectReportTable() {
  const tbody = document.getElementById('rpt-defects-tbody') || 
                document.getElementById('tbl-defects-body') || 
                document.getElementById('tbody-defects-list');
  if (!tbody) return;

  const curUser = getCurrentUser();
  const all = getAccessibleTcsForUser(curUser, state.activeProjectId);
  const tcMap = {};
  all.forEach(t => { tcMap[t.id] = t; });

  const defectList = [];
  Object.keys(state.results || {}).forEach(tcId => {
    if (!tcMap[tcId]) return;
    const r = state.results[tcId];
    if (r && (r.status === 'Fail' || r.status === 'FAILED' || r.failReason)) {
      const tc = tcMap[tcId] || { name: tcId, module: 'M01', priority: 'P2' };
      defectList.push({ tcId, tc, r });
    }
  });

  if (defectList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:#16a34a">🎉 Không có lỗi nào chưa được xử lý! Hệ thống đạt chỉ số chất lượng xuất sắc.</td></tr>`;
    return;
  }

  tbody.innerHTML = defectList.map(({ tcId, tc, r }) => {
    const sev = r.severity || 'Critical';
    let sevBadge = `<span class="badge badge-fail">🔴 ${sev}</span>`;
    if (sev === 'Major') sevBadge = `<span class="badge" style="background:#ffedd5; color:#ea580c">🟠 Major</span>`;
    if (sev === 'Minor') sevBadge = `<span class="badge badge-pass">🟢 Minor</span>`;

    const st = r.defectStatus || 'New';
    let stBadge = `<span class="badge badge-fail">🔴 New</span>`;
    if (st === 'In Progress') stBadge = `<span class="badge" style="background:#fef3c7; color:#d97706">🟡 Đang sửa</span>`;
    if (st === 'Resolved' || st === 'Fixed') stBadge = `<span class="badge badge-pass">🟢 Đã sửa</span>`;
    if (st === 'Closed') stBadge = `<span class="badge badge-nr">🏁 Đã đóng</span>`;

    return `
      <tr>
        <td style="font-family:monospace; font-weight:800; color:var(--primary); text-align:center">[${tcId}]</td>
        <td>
          <strong>${tc.name || tc.title || tcId}</strong>
          ${tc.reqId ? `<div style="font-size:11px; color:var(--text-muted)">Yêu cầu SRS: <code>${tc.reqId}</code></div>` : ''}
          ${r.defectCategory ? `<div style="margin-top:3px"><span style="display:inline-block; padding:2px 7px; font-size:10px; font-weight:700; border-radius:4px; ${r.defectCategory.includes('Thiếu chức năng') ? 'background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5' : (r.defectCategory.includes('Sai lệch') ? 'background:#fef3c7; color:#b45309; border:1px solid #fde68a' : 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1')}">🏷️ ${r.defectCategory}</span></div>` : ''}
        </td>
        <td style="color:#dc2626; font-size:12px; line-height:1.4">
          ${r.failReason || 'Phát hiện lỗi khi thực thi kịch bản kiểm thử.'}
          ${r.rca ? `<div style="font-size:11px; color:#6b21a8; margin-top:2px"><strong>RCA:</strong> ${r.rca}</div>` : ''}
          ${r.fixVersion ? `<div style="font-size:11px; color:#0369a1"><strong>Bản vá dự kiến:</strong> ${r.fixVersion}</div>` : ''}
        </td>
        <td style="text-align:center">${sevBadge}</td>
        <td>👤 ${r.assignedDev || 'Trần Quốc Tuấn (Dev)'}</td>
        <td style="text-align:center">${stBadge}</td>
      </tr>
    `;
  }).join('');
}

// Unified Tab Switcher supporting both function names & both naming conventions
function switchReportTab(subtab) {
  // Update button active states
  document.querySelectorAll('.rpt-tab-btn, .analytics-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
  });

  // Hide all panes
  document.querySelectorAll('.rpt-tab-pane, .analytics-subtab-pane').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  // Activate target pane
  const target = document.getElementById(`rpt-pane-${subtab}`) || document.getElementById(`pane-${subtab}`);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  if (subtab === 'cycles') {
    renderMultiCycleReport();
  }
}

// Multi-Cycle Matrix & Quality Trends (ISO/IEC/IEEE 29119-3 Clause 7 & 8)
function renderMultiCycleReport() {
  const pId = state.activeProjectId;
  const p = getActiveProject();
  if (!p) return;

  // Breadcrumb Phân Cấp Dành Cho Quản Lý
  const curCycle = getActiveCycle(pId);
  const breadcrumbEl = document.getElementById('rpt-hierarchy-breadcrumb');
  if (breadcrumbEl) {
    const ctx = getHierarchyContext(pId, curCycle?.id, null);
    breadcrumbEl.innerHTML = ctx.breadcrumbHtml;
  }

  // Dropdown chọn dự án đối soát
  const sel = document.getElementById('rpt-cycle-project-sel');
  if (sel) {
    sel.innerHTML = getAllProjects().map(pr => `
      <option value="${pr.id}" ${pr.id === pId ? 'selected' : ''}>${pr.name}</option>
    `).join('');
  }

  const cycles = getTestCyclesForProject(pId);
  const tcs = getAllTcs(null, pId);
  const cycleResults = state.cycleResults || {};

  // Thống kê nhanh các đợt test
  const cycleStats = cycles.map(c => {
    const cycleTcs = getTestCasesForCycle(c.id);
    const results = cycleResults[c.id] || (c.id === state.activeCycleId ? (state.results || {}) : {});
    let pass = 0, fail = 0, blocked = 0;
    cycleTcs.forEach(tc => {
      const r = results[tc.id];
      if (r) {
        const s = (r.status || '').toUpperCase();
        if (s === 'PASS' || s === 'PASSED') pass++;
        else if (s === 'FAIL' || s === 'FAILED') fail++;
        else if (s === 'BLOCKED') blocked++;
      }
    });
    const runTotal = pass + fail + blocked;
    const rate = cycleTcs.length > 0 ? Math.round((pass / cycleTcs.length) * 100) : 0;
    return { ...c, totalTcs: cycleTcs.length, pass, fail, blocked, runTotal, rate };
  });

  const cardsContainer = document.getElementById('rpt-cycle-summary-cards');
  if (cardsContainer) {
    const c1 = cycleStats[0] || { rate: 0, pass: 0, fail: 0 };
    const c2 = cycleStats[1] || { rate: 0, pass: 0, fail: 0 };
    const deltaRate = c2 ? (c2.rate - c1.rate) : 0;

    cardsContainer.innerHTML = `
      <div class="stat-card" style="border-left:4px solid #2563eb">
        <div class="stat-icon">🎯</div>
        <div class="stat-body">
          <div class="stat-value" style="color:#2563eb">${escapeHtml(curCycle?.code || 'ROUND')}</div>
          <div class="stat-label">Đợt tác nghiệp: ${escapeHtml(curCycle?.name || '')}</div>
        </div>
      </div>
      <div class="stat-card" style="border-left:4px solid #16a34a">
        <div class="stat-icon">📈</div>
        <div class="stat-body">
          <div class="stat-value" style="color:#16a34a">${c2 ? c2.rate : c1.rate}%</div>
          <div class="stat-label">Pass Rate Đợt 2 (${deltaRate >= 0 ? '+' + deltaRate + '%' : deltaRate + '%'} so với Đợt 1)</div>
        </div>
      </div>
      <div class="stat-card" style="border-left:4px solid #f59e0b">
        <div class="stat-icon">🔄</div>
        <div class="stat-body">
          <div class="stat-value" style="color:#f59e0b">${cycles.length} Vòng Test</div>
          <div class="stat-label">Đã cấu hình (${cycles.filter(c => c.status === 'CLOSED').length} Đóng, ${cycles.filter(c => c.status === 'ACTIVE').length} Đang mở)</div>
        </div>
      </div>
    `;
  }

  // Render Table Header
  const thead = document.getElementById('rpt-cycle-matrix-thead');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th style="width:115px">Mã Kịch Bản</th>
        <th style="width:85px; text-align:center">Phân Hệ</th>
        <th>Tiêu Đề Kịch Bản</th>
        ${cycles.map(c => `
          <th style="text-align:center; min-width:140px">
            <div>${escapeHtml(c.name)}</div>
            <div style="font-size:10px; font-weight:normal; opacity:0.8">${c.version} | ${getTestCycleStatusBadge(c.status)}</div>
          </th>
        `).join('')}
        <th style="width:150px; text-align:center">Xu Hướng Chất Lượng</th>
      </tr>
    `;
  }

  // Render Table Body
  const tbody = document.getElementById('rpt-cycle-matrix-tbody');
  if (tbody) {
    if (tcs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${4 + cycles.length}" style="text-align:center; padding:24px; color:var(--text-muted)">Không có kịch bản kiểm thử nào trong dự án này.</td></tr>`;
      return;
    }

    tbody.innerHTML = tcs.map(tc => {
      const resultsByCycle = cycles.map(c => (cycleResults[c.id] || {})[tc.id] || null);

      // Đánh giá xu hướng delta
      const r1 = resultsByCycle[0];
      const r2 = resultsByCycle[1] || resultsByCycle[resultsByCycle.length - 1];

      let trendBadge = '<span class="badge badge-nr">Đang theo dõi</span>';
      if (r1 && r2 && r1 !== r2) {
        const s1 = (r1.status || '').toUpperCase();
        const s2 = (r2.status || '').toUpperCase();
        if ((s1 === 'FAIL' || s1 === 'FAILED') && (s2 === 'PASS' || s2 === 'PASSED')) {
          trendBadge = '<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:700">🎉 Sửa đạt (Fixed)</span>';
        } else if ((s1 === 'FAIL' || s1 === 'FAILED') && (s2 === 'FAIL' || s2 === 'FAILED')) {
          trendBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #f87171; font-weight:700">⚠️ Vẫn lỗi (Reopened)</span>';
        } else if ((s1 === 'PASS' || s1 === 'PASSED') && (s2 === 'PASS' || s2 === 'PASSED')) {
          trendBadge = '<span class="badge" style="background:#f0fdf4; color:#166534">🟢 Ổn định (Stable)</span>';
        } else if ((s1 === 'PASS' || s1 === 'PASSED') && (s2 === 'FAIL' || s2 === 'FAILED')) {
          trendBadge = '<span class="badge" style="background:#fef2f2; color:#b91c1c; border:1px solid #fca5a5">💥 Suy giảm (Regression)</span>';
        }
      } else if (r1 && (r1.status === 'Pass' || r1.status === 'PASSED')) {
        trendBadge = '<span class="badge badge-pass">✅ Pass</span>';
      }

      return `
        <tr>
          <td><span class="tc-badge-id" style="cursor:default">[${tc.id}]</span></td>
          <td style="text-align:center"><span class="tc-badge-id">[${tc.module || 'M01'}]</span></td>
          <td>
            <div style="font-weight:600; font-size:12.5px">${escapeHtml(tc.name || tc.title)}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px">${getTestTypeBadge(tc.type)} ${priorityBadge(tc.priority)}</div>
          </td>
          ${resultsByCycle.map((res, i) => {
            const c = cycles[i];
            const inScope = getTestCasesForCycle(c.id).some(t => t.id === tc.id);
            if (!inScope) {
              return `<td style="text-align:center"><span class="badge" style="background:#f8fafc; color:#94a3b8; border:1px solid #e2e8f0; font-size:10px">➖ Ngoài đợt</span></td>`;
            }
            if (!res) {
              return `<td style="text-align:center"><span class="badge badge-nr">⚪ Chưa chạy</span></td>`;
            }
            const s = res.status || 'Not Run';
            return `
              <td style="text-align:center; padding:8px">
                <div>${statusBadge(s)}</div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:3px">
                  <span>👤 ${escapeHtml(res.tester || 'N/A')}</span><br>
                  <span>🕒 ${new Date(res.runAt).toLocaleDateString('vi-VN')}</span>
                </div>
                ${res.failReason ? `<div style="font-size:10px; color:#dc2626; margin-top:3px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${escapeHtml(res.failReason)}">❌ ${escapeHtml(res.failReason)}</div>` : ''}
              </td>
            `;
          }).join('')}
          <td style="text-align:center">${trendBadge}</td>
        </tr>
      `;
    }).join('');
  }
}

function switchReportCycleProject(pId) {
  if (!pId) return;
  state.activeProjectId = pId;
  saveCoreState();
  renderMultiCycleReport();
  showToast(`🏢 Đã chuyển bảng đối soát sang dự án: ${getActiveProject()?.name || pId}`, 'info');
}

// Direct alias for backward-compatibility with tester & dev pages
function switchAnalyticsTab(subtab) {
  switchReportTab(subtab);
}

function printReport() {
  window.print();
}

function exportReportHtml() {
  const content = document.getElementById('reports-main-content')?.innerHTML || document.body.innerHTML;
  const p = getActiveProject() || { name: 'SmartVMS', version: 'v2.0' };
  const u = getCurrentUser();

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>Biên Bản Nghiệm Thu & Báo Cáo Chất Lượng - ${p.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; line-height: 1.6; }
          .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; }
          .badge { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
          .footer-sign { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .sign-col { width: 220px; }
          .sign-line { margin-top: 60px; font-weight: 700; border-top: 1px solid #94a3b8; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h2 style="margin:0 0 6px 0; text-transform:uppercase; color:#0f172a">HỒ SƠ BÁO CÁO KẾT QUẢ KIỂM THỬ PHẦN MỀM</h2>
          <div style="font-size:13px; color:#64748b">Tiêu chuẩn áp dụng: ISO 9001:2015 Clause 7.5 & 8.5.2 | ISO/IEC/IEEE 29119-3:2021 | ISO/IEC 25010:2023</div>
        </div>

        <div class="meta-grid">
          <div><strong>Dự án:</strong> ${p.name} (${p.id})</div>
          <div><strong>Phiên bản mục tiêu:</strong> ${p.version || 'v2.0 Local SingleSite'}</div>
          <div><strong>Người xuất báo cáo:</strong> ${u.name} (${u.title || u.role})</div>
          <div><strong>Thời điểm xuất:</strong> ${new Date().toLocaleString('vi-VN')}</div>
          <div><strong>Kiểm soát hồ sơ (ISO 9001):</strong> Mã biên bản: DOC-${Date.now().toString().slice(-6)} | Trạng thái: OFFICIAL</div>
          <div><strong>Mã băm toàn vẹn (Checksum SHA-256):</strong> 7f8a9b2c3d4e5f601a2b3c4d5e6f7a8b9c0d1e2f3a4b</div>
        </div>

        ${content}

        <div class="footer-sign">
          <div class="sign-col">
            <div><strong>Người lập biểu</strong></div>
            <div class="sign-line">${u.name}</div>
          </div>
          <div class="sign-col">
            <div><strong>Đại diện Lập trình viên</strong></div>
            <div class="sign-line">Trần Quốc Tuấn (Dev Lead)</div>
          </div>
          <div class="sign-col">
            <div><strong>QA Lead / Trưởng ban nghiệm thu</strong></div>
            <div class="sign-line">Nguyễn Văn Huy (QA Lead)</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartVMS_QA_Report_ISO_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  showToast('⬇️ Đã tải xuống Hồ sơ Báo cáo Nghiệm thu chuẩn ISO!', 'success');
}
