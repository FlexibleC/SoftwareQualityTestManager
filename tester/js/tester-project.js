/**
 * TESTER MODULE: PROJECT WORKSPACE (TẦNG 1) - tester-project.js
 * Không gian làm việc cá nhân của Tester trong phạm vi một Dự án cụ thể
 */

const TesterProject = {
  activeTab: 'overview', // 'overview' | 'defects'

  init() {
    TesterContext.init(1);
    this.renderProjectHeader();
    this.renderProjectKpis();
    this.renderVersionsAndCycles();
    this.renderDefectsLogbook();
  },

  renderProjectHeader() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('prj-hero-code', `[${curPrj.code || 'PRJ'}]`);
    setEl('prj-hero-name', curPrj.name || 'Không gian dự án');
    setEl('prj-hero-desc', curPrj.description || 'Dự án kiểm thử phần mềm chuyên nghiệp.');
    setEl('prj-hero-lead', curPrj.leader || 'Hoàng Hải Đăng (Project Lead)');

    const countMembers = (curPrj.members && curPrj.members.length) || 1;
    setEl('prj-hero-members', `${countMembers} nhân sự`);
  },

  renderProjectKpis() {
    const pStats = TesterContext.getProjectStats(state.activeProjectId);

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // QUY TẮC PHÂN TẦNG: Tổng số bài dự án = Tổng số bài của tất cả các phiên bản của dự án
    setEl('kpi-prj-total', pStats.total);
    setEl('kpi-prj-passrate', `${pStats.passRate}%`);
    setEl('kpi-prj-fail', pStats.fail);
    setEl('kpi-prj-retests', pStats.retest);

    const retestBanner = document.getElementById('tester-prj-retest-alert');
    if (retestBanner) {
      if (pStats.retest > 0) {
        retestBanner.style.display = 'flex';
        setEl('prj-retest-count', pStats.retest);
      } else {
        retestBanner.style.display = 'none';
      }
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    const tabOverview = document.getElementById('tab-btn-overview');
    const tabDefects = document.getElementById('tab-btn-defects');
    const paneOverview = document.getElementById('pane-overview');
    const paneDefects = document.getElementById('pane-defects');

    if (tabOverview) tabOverview.className = tab === 'overview' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    if (tabDefects) tabDefects.className = tab === 'defects' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    if (paneOverview) paneOverview.style.display = tab === 'overview' ? 'block' : 'none';
    if (paneDefects) paneDefects.style.display = tab === 'defects' ? 'block' : 'none';
  },

  renderVersionsAndCycles() {
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    // CHỈ HIỂN THỊ CÁC PHIÊN BẢN CÓ ĐỢT KIỂM THỬ ĐƯỢC GIAO CHO TESTER NÀY
    const versions = TesterContext.getAssignedVersionsForTester(curPrj.id);
    const container = document.getElementById('versions-cycles-container');
    if (!container) return;

    if (versions.length === 0) {
      container.innerHTML = `
        <div style="padding:30px; text-align:center; background:var(--bg-card); border-radius:8px; border:1px dashed var(--border)">
          <p style="color:var(--text-muted); font-size:13px">Bạn chưa có bài kiểm thử nào được phân công trong các phiên bản của dự án này.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = versions.map(vObj => {
      const vStr = vObj.version || vObj;
      const vLabel = vObj.label || '';
      const isCur = vStr === curPrj.activeVersion;
      // QUY TẮC PHÂN TẦNG: Tổng số bài phiên bản = Tổng số bài của tất cả các đợt kiểm thử thuộc phiên bản đó
      const vStats = TesterContext.getVersionStats(curPrj.id, vStr);
      const cycles = TesterContext.getAssignedCyclesForTester(curPrj.id, vStr);

      return `
        <div class="card" style="margin-bottom:18px; padding:0; overflow:hidden">
          <div style="padding:14px 18px; background:var(--bg-surface); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
              <span style="font-size:18px">📦</span>
              <div>
                <strong style="font-size:15px; color:var(--text-primary)">Phiên bản: ${escapeHtml(vStr)}</strong>
                ${vLabel ? `<span style="font-size:12px; color:var(--text-muted); margin-left:6px">— ${escapeHtml(vLabel)}</span>` : ''}
                ${isCur ? '<span class="badge" style="background:#059669; color:#fff; font-size:10px; margin-left:8px">★ Đang chạy</span>' : ''}
              </div>
              <span class="badge" style="background:rgba(13,148,136,0.1); color:#0d9488; border:1px solid rgba(13,148,136,0.3); font-weight:700; font-size:10.5px">
                📊 ${vStats.total} bài (${vStats.passRate}% đạt) • ${cycles.length} đợt test
              </span>
            </div>
            <a href="version.html?projectId=${encodeURIComponent(curPrj.id)}&version=${encodeURIComponent(vStr)}" class="btn btn-outline btn-xs" style="color:#0d9488; border-color:#0d9488; font-weight:700">
              Khám phá phiên bản này ➔
            </a>
          </div>

          <div style="padding:16px 18px">
            <div style="font-size:11.5px; font-weight:700; color:var(--text-muted); margin-bottom:10px; letter-spacing:0.2px">
              🎯 Các đợt kiểm thử được giao cho bạn (${cycles.length} đợt):
            </div>

            ${cycles.length === 0 ? `
              <div style="font-size:12px; color:var(--text-muted); font-style:italic; padding:8px 0">
                Bạn chưa có bài kiểm thử nào được phân công trong các đợt kiểm thử của phiên bản này.
              </div>
            ` : `
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:12px">
                ${cycles.map(cyc => {
                  const cStats = TesterContext.getCycleStats(curPrj.id, cyc.id);

                  return `
                    <div style="background:var(--bg-body); border:1.5px solid var(--border); border-radius:8px; padding:12px 14px; display:flex; flex-direction:column; justify-content:space-between">
                      <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                          <span class="badge" style="background:#f1f5f9; color:#334155; font-family:monospace; font-weight:800; font-size:10.5px">
                            ${escapeHtml(cyc.code || cyc.id)}
                          </span>
                          <span class="badge ${cyc.status === 'ACTIVE' ? 'badge-pass' : 'badge-outline'}" style="font-size:10px">
                            ${cyc.status === 'ACTIVE' ? '🟢 Đang mở' : '🔒 Đã đóng'}
                          </span>
                        </div>
                        <h4 style="margin:0 0 4px 0; font-size:13.5px; font-weight:700; color:var(--text-primary)">
                          ${escapeHtml(cyc.name)}
                        </h4>
                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:10px">
                          Loại: <strong>${escapeHtml(cyc.suite || 'Hồi quy')}</strong> • Hạn: <strong>${escapeHtml(cyc.endDate || cyc.dueDate || 'Chưa đặt')}</strong>
                        </div>
                      </div>

                      <div style="padding-top:10px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center">
                        <div style="font-size:11.5px">
                          <span style="color:var(--text-secondary)">Bài của bạn:</span> <strong style="color:#0d9488">${cStats.total}</strong> bài
                          ${cStats.total > 0 ? `(${cStats.passRate}% đạt)` : ''}
                        </div>
                        <a href="cycle.html?projectId=${encodeURIComponent(curPrj.id)}&version=${encodeURIComponent(vStr)}&cycleId=${encodeURIComponent(cyc.id)}" class="btn btn-primary btn-xs" style="background:#0d9488; border-color:#0f766e; font-weight:700">
                          Vào studio test ➔
                        </a>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  renderDefectsLogbook() {
    const user = getCurrentUser();
    const myUsername = user?.username || 'tester';
    const curPrj = (state.projects || []).find(p => p.id === state.activeProjectId);
    if (!curPrj) return;

    const tbody = document.getElementById('defects-logbook-tbody');
    if (!tbody) return;

    // Filter defects logged by this tester in this project
    const allDefects = (state.defects || []).filter(d => {
      if (d.projectId && d.projectId !== curPrj.id) return false;
      return d.reporter === myUsername || d.reporter === user?.name;
    });

    if (allDefects.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted); font-size:12.5px">
            Chưa có lỗi nào được bạn báo cáo trong dự án này.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = allDefects.map(d => {
      const isResolved = d.status === 'Resolved' || d.status === 'Fixed';
      const statusBadge = isResolved
        ? '<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #d8b4fe; font-weight:800">🔄 Đã sửa - Chờ Re-test</span>'
        : d.status === 'Closed'
        ? '<span class="badge badge-pass">✅ Đã nghiệm thu đóng</span>'
        : '<span class="badge badge-fail">❌ Đang xử lý</span>';

      return `
        <tr>
          <td><span class="matrix-cycle-code" style="color:#dc2626; border-color:rgba(220,38,38,0.3)">[${escapeHtml(d.id)}]</span></td>
          <td><span class="tc-badge-id">${escapeHtml(d.tcId || 'Ad-hoc')}</span></td>
          <td><strong>${escapeHtml(d.title || d.summary)}</strong></td>
          <td style="text-align:center"><span class="badge badge-fail" style="font-size:10.5px">${escapeHtml(d.severity || 'Major')}</span></td>
          <td style="text-align:center">${statusBadge}</td>
          <td style="font-size:11.5px; color:var(--text-muted)">${new Date(d.createdAt || Date.now()).toLocaleDateString('vi-VN')}</td>
          <td style="text-align:center">
            ${isResolved && d.tcId ? `
              <a href="cycle.html?projectId=${encodeURIComponent(curPrj.id)}&tcId=${encodeURIComponent(d.tcId)}" class="btn btn-sm" style="background:#7c3aed; color:#fff; font-size:11px; font-weight:700">
                🔄 Re-test ngay
              </a>
            ` : `
              <span style="font-size:11px; color:var(--text-muted)">Đang theo dõi</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }
};

window.TesterProject = TesterProject;
