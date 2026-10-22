/**
 * DEVELOPER MODULE: PROJECT SPACE LOGIC (dev-project.js)
 * TẦNG 1: Không gian dự án của Lập Trình Viên
 */

const DevProject = {
  init() {
    DevContext.init(1);
    const prj = DevContext.getActiveProject();
    if (!prj) {
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = `
          <div class="card" style="text-align:center; padding:60px 20px; max-width:600px; margin:40px auto; border:2px dashed var(--border)">
            <div style="font-size:48px; margin-bottom:12px">🏢</div>
            <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px">Chưa có dự án nào trong hệ thống</h3>
            <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px">Hệ thống đã được làm sạch cơ sở dữ liệu (0 dự án). Vui lòng quay lại màn hình danh mục hoặc liên hệ Quản trị viên để tạo dự án mới.</p>
            <a href="index.html" class="btn btn-primary" style="font-weight:700">Quay lại Trang chính</a>
          </div>
        `;
      }
      return;
    }
    this.renderHero();
    this.renderKPIs();
    this.renderVersions();
    this.renderModuleHotspots();
  },

  renderHero() {
    const prj = DevContext.getActiveProject();
    if (!prj) return;

    const nameEl = document.getElementById('prj-hero-name');
    const codeEl = document.getElementById('prj-hero-code');
    const descEl = document.getElementById('prj-hero-desc');
    const leadEl = document.getElementById('prj-hero-lead');

    if (nameEl) nameEl.textContent = prj.name;
    if (codeEl) codeEl.textContent = prj.code || prj.id;
    if (descEl) descEl.textContent = prj.description || 'Dự án đang trong giai đoạn phát triển và kiểm thử định kỳ.';

    const leadMember = (prj.members || []).find(m => m.projectRole === 'lead' || m.project_role === 'lead' || m.username === prj.lead || m.username === 'lead');
    const leadObj = (state.users || []).find(u => u.username === prj.lead || u.role === 'project_lead');
    if (leadEl) leadEl.textContent = leadMember ? leadMember.name : (prj.leadName || (leadObj ? leadObj.name : (prj.lead || 'Chưa gán')));
  },

  renderKPIs() {
    const prj = DevContext.getActiveProject();
    if (!prj) return;

    const defects = DevContext.getAllDefectsForContext(prj.id);
    const versions = DevContext.getAssignedVersionsForDev(prj.id);

    const total = defects.length;
    let fixedCount = 0;
    let reopenedCount = 0;

    defects.forEach(d => {
      if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved' || d.defectStatus === 'Closed') {
        fixedCount++;
      }
      if (d.defectStatus === 'Reopened') reopenedCount++;
    });

    const fixRate = total > 0 ? Math.round((fixedCount / total) * 100) : 0;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpi-prj-versions', versions.length);
    setVal('kpi-prj-total-bugs', total);
    setVal('kpi-prj-fix-rate', `${fixRate}%`);
    setVal('kpi-prj-reopened', reopenedCount);
  },

  renderVersions() {
    const container = document.getElementById('dev-versions-container');
    if (!container) return;

    const prj = DevContext.getActiveProject();
    if (!prj) return;

    const versions = DevContext.getAssignedVersionsForDev(prj.id);

    if (versions.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:36px; color:var(--text-muted)">
          <div style="font-size:32px; margin-bottom:8px">📦</div>
          <div style="font-weight:700; color:var(--text-primary)">Chưa có phiên bản nào ghi nhận lỗi</div>
          <p style="font-size:12px; margin-top:4px">Tất cả các phiên bản của dự án này đang hoạt động tốt hoặc chưa phát sinh sự cố.</p>
        </div>
      `;
      return;
    }

    const cards = versions.map(vObj => {
      const vStr = vObj.version || vObj;
      const defects = DevContext.getAllDefectsForContext(prj.id, vStr);
      const total = defects.length;

      let newCount = 0;
      let wipCount = 0;
      let reopenedCount = 0;
      let fixedCount = 0;
      let blockerCount = 0;

      defects.forEach(d => {
        if (d.defectStatus === 'New') newCount++;
        else if (d.defectStatus === 'In Progress') wipCount++;
        else if (d.defectStatus === 'Reopened') reopenedCount++;
        else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') fixedCount++;
        if (d.severity === 'Blocker' || d.severity === 'Critical') blockerCount++;
      });

      const pFixed = total > 0 ? (fixedCount / total * 100) : 0;
      const pWip = total > 0 ? (wipCount / total * 100) : 0;
      const pNew = total > 0 ? (newCount / total * 100) : 0;
      const pReopened = total > 0 ? (reopenedCount / total * 100) : 0;

      return `
        <div class="card" style="border-left:4px solid #0284c7; display:flex; flex-direction:column; justify-content:space-between">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
              <span class="badge" style="background:#0f172a; color:#38bdf8; font-family:monospace; font-weight:800; font-size:12px">
                📦 Phiên bản: ${escapeHtml(vStr)}
              </span>
              ${vObj.isCurrent || vStr === prj.activeVersion 
                ? '<span class="badge badge-info" style="font-size:10.5px">🟢 Đang hoạt động</span>' 
                : '<span class="badge" style="background:var(--bg-body); font-size:10px">Kế hoạch</span>'}
            </div>

            <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px">
              ${escapeHtml(vObj.label || 'Phiên bản phần mềm chính thức')}
            </div>

            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; background:var(--bg-body); padding:10px 8px; border-radius:6px; margin-bottom:12px; text-align:center">
              <div>
                <div style="font-size:15px; font-weight:800; color:var(--text-primary)">${total}</div>
                <div style="font-size:9.5px; color:var(--text-muted); font-weight:700">TỔNG</div>
              </div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#dc2626">${blockerCount}</div>
                <div style="font-size:9.5px; color:#dc2626; font-weight:700">BLOCKER</div>
              </div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#f59e0b">${wipCount}</div>
                <div style="font-size:9.5px; color:#f59e0b; font-weight:700">ĐANG SỬA</div>
              </div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#7c3aed">${fixedCount}</div>
                <div style="font-size:9.5px; color:#7c3aed; font-weight:700">ĐÃ FIX</div>
              </div>
            </div>

            <div style="margin-bottom:14px">
              <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:3px">
                <span style="color:var(--text-muted)">Tiến độ vá lỗi</span>
                <span style="color:#7c3aed">${Math.round(pFixed)}%</span>
              </div>
              <div class="dev-progress-track">
                <div class="dev-seg-fixed" style="width:${pFixed}%"></div>
                <div class="dev-seg-wip" style="width:${pWip}%"></div>
                <div class="dev-seg-new" style="width:${pNew}%"></div>
                <div class="dev-seg-reopened" style="width:${pReopened}%"></div>
              </div>
            </div>
          </div>

          <div>
            <a href="version.html?projectId=${prj.id}&version=${encodeURIComponent(vStr)}" class="btn btn-primary btn-block" style="text-align:center">
              📦 Vào không gian phiên bản ➔
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px">
        ${cards}
      </div>
    `;
  },

  renderModuleHotspots() {
    const container = document.getElementById('dev-module-hotspots-body');
    if (!container) return;

    const prj = DevContext.getActiveProject();
    if (!prj) return;

    const defects = DevContext.getAllDefectsForContext(prj.id);
    const mods = prj.modules || [];

    // Group defects by module
    const modCount = {};
    const modBlocker = {};
    const modReopened = {};

    defects.forEach(d => {
      const m = d.module || 'OTHER';
      modCount[m] = (modCount[m] || 0) + 1;
      if (d.severity === 'Blocker' || d.severity === 'Critical') {
        modBlocker[m] = (modBlocker[m] || 0) + 1;
      }
      if (d.defectStatus === 'Reopened') {
        modReopened[m] = (modReopened[m] || 0) + 1;
      }
    });

    const rows = mods.map(m => {
      const cnt = modCount[m.id] || 0;
      const blk = modBlocker[m.id] || 0;
      const re = modReopened[m.id] || 0;

      let statusBadge = '<span class="badge badge-pass" style="font-size:10.5px">Ổn định</span>';
      if (blk > 0 || re > 0) {
        statusBadge = '<span class="badge" style="background:#fee2e2; color:#dc2626; font-weight:800; font-size:10.5px">⚠️ Cần tái cấu trúc</span>';
      } else if (cnt > 3) {
        statusBadge = '<span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700; font-size:10.5px">Nhiều lỗi</span>';
      }

      return `
        <tr>
          <td>
            <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-family:monospace">
              ${escapeHtml(m.id)}
            </span>
          </td>
          <td>
            <strong style="color:var(--text-primary); font-size:12.5px">${escapeHtml(m.name)}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px">${escapeHtml(m.short || '')}</div>
          </td>
          <td style="text-align:center"><strong style="font-size:13px">${cnt}</strong></td>
          <td style="text-align:center">${blk > 0 ? `<span style="color:#dc2626; font-weight:800">🔴 ${blk}</span>` : '—'}</td>
          <td style="text-align:center">${re > 0 ? `<span style="color:#b91c1c; font-weight:800">🔥 ${re}</span>` : '—'}</td>
          <td style="text-align:center">${statusBadge}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = rows || `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted)">Không có dữ liệu phân hệ</td></tr>`;
  }
};
