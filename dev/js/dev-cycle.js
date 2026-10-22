/**
 * DEVELOPER MODULE: DEFECT INVESTIGATION STUDIO & KANBAN (dev-cycle.js)
 * TẦNG 3: Bàn điều tra, Kanban & Bàn giao bản vá kỹ thuật
 * Chuẩn: ISO/IEC/IEEE 29119-3:2021 & IEEE 1044 Anomaly Resolution
 */

const DevCycle = {
  viewMode: 'kanban', // 'kanban' | 'table'
  activeDefectId: null,

  init() {
    DevContext.init(3);
    this.renderCycleStrip();
    this.populateModuleFilter();
    this.renderDefects();
  },

  switchViewMode(mode) {
    this.viewMode = mode;
    const btnKanban = document.getElementById('btn-mode-kanban');
    const btnTable = document.getElementById('btn-mode-table');
    if (btnKanban && btnTable) {
      if (mode === 'kanban') {
        btnKanban.className = 'btn btn-primary btn-sm';
        btnTable.className = 'btn btn-outline btn-sm';
      } else {
        btnKanban.className = 'btn btn-outline btn-sm';
        btnTable.className = 'btn btn-primary btn-sm';
      }
    }
    this.renderDefects();
  },

  renderCycleStrip() {
    const prj = DevContext.getActiveProject();
    const ver = state.activeVersion || 'v1.0';
    const cycle = DevContext.getActiveCycleObj();
    if (!prj || !cycle) return;

    const codeEl = document.getElementById('cycle-strip-code');
    const nameEl = document.getElementById('cycle-strip-name');
    const metaEl = document.getElementById('cycle-strip-meta');

    if (codeEl) codeEl.textContent = cycle.id;
    if (nameEl) nameEl.textContent = cycle.name || 'Đợt kiểm thử tác nghiệp';
    if (metaEl) {
      metaEl.textContent = `Dự án: ${prj.name} • Phiên bản: ${ver} • Phạm vi: ${cycle.scope || 'Chính thức'} • Thời hạn: ${cycle.endDate || cycle.dueDate || 'Đang diễn ra'}`;
    }
  },

  populateModuleFilter() {
    const sel = document.getElementById('cycle-filter-module');
    if (!sel) return;
    const prj = DevContext.getActiveProject();
    const mods = prj?.modules || [];
    sel.innerHTML = '<option value="">Tất cả phân hệ</option>';
    mods.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `[${m.id}] ${m.name}`;
      sel.appendChild(opt);
    });
  },

  getFilteredDefects() {
    const prj = DevContext.getActiveProject();
    const ver = state.activeVersion;
    const cycle = DevContext.getActiveCycleObj();
    if (!prj) return [];

    let defects = DevContext.getAllDefectsForContext(prj.id, ver, cycle?.id);

    const kw = (document.getElementById('cycle-filter-search')?.value || '').trim().toLowerCase();
    const sev = document.getElementById('cycle-filter-severity')?.value || '';
    const mod = document.getElementById('cycle-filter-module')?.value || '';
    const reopenedOnly = document.getElementById('cycle-filter-reopened')?.checked;

    return defects.filter(d => {
      if (reopenedOnly && d.defectStatus !== 'Reopened') return false;
      if (sev && d.severity !== sev) return false;
      if (mod && d.module !== mod) return false;
      if (kw) {
        const m1 = (d.code || '').toLowerCase().includes(kw);
        const m2 = (d.title || '').toLowerCase().includes(kw);
        const m3 = (d.failReason || '').toLowerCase().includes(kw);
        const m4 = (d.module || '').toLowerCase().includes(kw);
        if (!m1 && !m2 && !m3 && !m4) return false;
      }
      return true;
    });
  },

  renderDefects() {
    const defects = this.getFilteredDefects();
    const container = document.getElementById('dev-cycle-content-container');
    if (!container) return;

    if (this.viewMode === 'kanban') {
      this.renderKanbanView(container, defects);
    } else {
      this.renderTableView(container, defects);
    }
  },

  renderKanbanView(container, defects) {
    // 5 Columns
    const cols = {
      'New': { title: '🔴 Tiếp nhận mới', items: [] },
      'In Progress': { title: '🟡 Đang sửa mã nguồn', items: [] },
      'Need Info': { title: '❓ Cần làm rõ thông tin', items: [] },
      'Fixed': { title: '🟣 Đã có bản vá chờ kiểm tra lại', items: [] },
      'Closed': { title: '🟢 Đã nghiệm thu đóng lỗi', items: [] }
    };

    defects.forEach(d => {
      if (d.defectStatus === 'Reopened') {
        // Reopened puts at the very top of New column with pulsing flag
        cols['New'].items.unshift(d);
      } else if (d.defectStatus === 'In Progress') {
        cols['In Progress'].items.push(d);
      } else if (d.defectStatus === 'Need Info' || d.defectStatus === 'Cannot Reproduce') {
        cols['Need Info'].items.push(d);
      } else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') {
        cols['Fixed'].items.push(d);
      } else if (d.defectStatus === 'Closed') {
        cols['Closed'].items.push(d);
      } else {
        cols['New'].items.push(d);
      }
    });

    let boardHtml = `<div class="dev-kanban-board">`;

    Object.keys(cols).forEach(k => {
      const col = cols[k];
      const count = col.items.length;
      let badgeBg = 'var(--border)';
      let badgeColor = 'var(--text-primary)';
      if (k === 'New') { badgeBg = '#fee2e2'; badgeColor = '#dc2626'; }
      else if (k === 'In Progress') { badgeBg = '#fef3c7'; badgeColor = '#b45309'; }
      else if (k === 'Need Info') { badgeBg = '#cffafe'; badgeColor = '#0e7490'; }
      else if (k === 'Fixed') { badgeBg = '#f3e8ff'; badgeColor = '#7c3aed'; }
      else if (k === 'Closed') { badgeBg = '#ecfdf5'; badgeColor = '#047857'; }

      boardHtml += `
        <div class="dev-kanban-col">
          <div class="dev-kanban-col-header">
            <span>${col.title}</span>
            <span class="dev-kanban-count" style="background:${badgeBg}; color:${badgeColor}">${count}</span>
          </div>
          <div class="dev-kanban-cards-wrap">
            ${col.items.length === 0 ? `<div style="text-align:center; padding:24px 10px; color:var(--text-muted); font-size:11.5px">Không có lỗi</div>` : ''}
            ${col.items.map(d => this.renderKanbanCard(d)).join('')}
          </div>
        </div>
      `;
    });

    boardHtml += `</div>`;
    container.innerHTML = boardHtml;
  },

  renderKanbanCard(d) {
    let sevClass = 'sev-critical';
    if (d.severity === 'Blocker') sevClass = 'sev-blocker';
    else if (d.severity === 'High') sevClass = 'sev-high';
    else if (d.severity === 'Medium') sevClass = 'sev-medium';
    else if (d.severity === 'Low') sevClass = 'sev-low';

    const isReopened = (d.defectStatus === 'Reopened');

    return `
      <div class="dev-kanban-card ${isReopened ? 'reopened-flag' : ''}" onclick="DevCycle.openInvestigationModal('${escapeHtml(d.id)}')">
        <div class="dev-kanban-card-top">
          <span class="dev-kanban-tcid">${escapeHtml(d.code)}</span>
          <span class="sev-badge ${sevClass}">${escapeHtml(d.severity)}</span>
        </div>
        <div class="dev-kanban-title">
          ${isReopened ? '<span style="color:#dc2626; font-weight:800">🔥 [TÁI PHÁT]</span> ' : ''}
          ${escapeHtml(d.title)}
        </div>
        <div class="dev-kanban-desc">
          <strong>Lỗi:</strong> ${escapeHtml(d.failReason)}
        </div>
        <div class="dev-kanban-footer">
          <span class="badge" style="background:rgba(2,132,199,0.12); color:#0284c7; font-size:9.5px">${escapeHtml(d.module)}</span>
          <span>👤 ${escapeHtml(d.tester)}</span>
        </div>
      </div>
    `;
  },

  renderTableView(container, defects) {
    if (defects.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:36px; color:var(--text-muted)">
          <div style="font-size:32px; margin-bottom:8px">🎉</div>
          <div style="font-weight:700; color:var(--text-primary)">Không có lỗi nào phù hợp với bộ lọc</div>
        </div>
      `;
      return;
    }

    const rows = defects.map(d => {
      let sevClass = 'sev-critical';
      if (d.severity === 'Blocker') sevClass = 'sev-blocker';
      else if (d.severity === 'High') sevClass = 'sev-high';
      else if (d.severity === 'Medium') sevClass = 'sev-medium';
      else if (d.severity === 'Low') sevClass = 'sev-low';

      let stBadge = '<span class="st-badge st-new">🔴 New</span>';
      if (d.defectStatus === 'In Progress') stBadge = '<span class="st-badge st-wip">🟡 Đang sửa</span>';
      else if (d.defectStatus === 'Need Info') stBadge = '<span class="st-badge st-needinfo">❓ Cần làm rõ</span>';
      else if (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved') stBadge = '<span class="st-badge st-fixed">🟣 Đã sửa chờ kiểm tra lại</span>';
      else if (d.defectStatus === 'Reopened') stBadge = '<span class="st-badge st-reopened">🔥 Reopened</span>';
      else if (d.defectStatus === 'Closed') stBadge = '<span class="st-badge st-closed">🟢 Đã đóng</span>';

      return `
        <tr ${d.defectStatus === 'Reopened' ? 'style="background:rgba(239, 68, 68, 0.04)"' : ''}>
          <td>
            <strong style="color:#0284c7; font-family:monospace; font-size:12px">${escapeHtml(d.code)}</strong>
            ${d.isAdhoc ? '<div style="font-size:9.5px; color:#f59e0b; font-weight:700">Sự cố ngoài KB</div>' : ''}
          </td>
          <td>
            <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700">${escapeHtml(d.module)}</span>
          </td>
          <td>
            <div style="font-weight:700; color:var(--text-primary); font-size:12.5px">${escapeHtml(d.title)}</div>
            <div style="font-size:11.5px; color:#dc2626; margin-top:2px; line-height:1.4"><strong>Lỗi:</strong> ${escapeHtml(d.failReason)}</div>
            ${d.fixVersion ? `<div style="font-size:11px; color:#7c3aed; margin-top:2px"><strong>Bản vá:</strong> ${escapeHtml(d.fixVersion)} (${escapeHtml(d.commitHash || 'PR')})</div>` : ''}
          </td>
          <td style="text-align:center"><span class="sev-badge ${sevClass}">${escapeHtml(d.severity)}</span></td>
          <td style="text-align:center">${stBadge}</td>
          <td style="font-size:12px">${escapeHtml(d.tester)}</td>
          <td style="text-align:center">
            <button type="button" class="btn btn-primary btn-xs" onclick="DevCycle.openInvestigationModal('${escapeHtml(d.id)}')">
              🔍 Điều tra & Vá
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="card" style="padding:0; overflow:hidden">
        <div class="table-responsive">
          <table class="report-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:110px">Mã lỗi</th>
                <th style="width:90px">Phân hệ</th>
                <th>Tiêu đề & Nội dung sự cố</th>
                <th style="width:110px; text-align:center">Mức nghiêm trọng</th>
                <th style="width:140px; text-align:center">Trạng thái</th>
                <th style="width:130px">Người phát hiện</th>
                <th style="width:120px; text-align:center">Thao tác</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * MỞ BÀN ĐIỀU TRA & BÀN GIAO BẢN VÁ (INVESTIGATION MODAL)
   */
  openInvestigationModal(defectId) {
    this.activeDefectId = defectId;
    const defects = this.getFilteredDefects();
    const d = defects.find(x => x.id === defectId);
    if (!d) {
      showToast('⚠️ Không tìm thấy thông tin sự cố!', 'error');
      return;
    }

    document.getElementById('diag-modal-tcid').textContent = d.code;
    document.getElementById('diag-modal-title').textContent = d.title;
    document.getElementById('diag-modal-module').textContent = d.module;
    document.getElementById('diag-modal-tester').textContent = d.tester;
    document.getElementById('diag-modal-severity').textContent = d.severity;
    document.getElementById('diag-modal-status').textContent = d.defectStatus;

    // Actual vs Expected
    document.getElementById('diag-modal-actual').textContent = d.failReason || 'Quan sát thấy sai lệch so với tiêu chuẩn.';
    document.getElementById('diag-modal-expected').textContent = d.expectedResult || 'Tính năng thực hiện trơn tru theo đúng đặc tả.';

    // Steps to reproduce
    document.getElementById('diag-modal-steps').textContent = d.stepsToReproduce || '1. Đăng nhập hệ thống\n2. Truy cập phân hệ\n3. Thực hiện kịch bản kiểm thử.';

    // Branch pill
    const branchName = `fix/${d.projectId}-${d.code.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const branchPill = document.getElementById('diag-git-branch-pill');
    if (branchPill) {
      branchPill.textContent = `git checkout -b ${branchName}`;
      branchPill.onclick = () => {
        navigator.clipboard.writeText(`git checkout -b ${branchName}`);
        showToast(`📋 Đã sao chép lệnh tạo nhánh: git checkout -b ${branchName}`, 'success');
      };
    }

    // Resolution Form Inputs
    document.getElementById('bug-modal-status').value = d.defectStatus === 'Reopened' ? 'In Progress' : (d.defectStatus || 'In Progress');
    document.getElementById('bug-modal-fix-version').value = d.fixVersion || `${d.version || state.activeVersion || 'v1.0'}-patch1`;
    document.getElementById('bug-modal-commit').value = d.commitHash || '';
    document.getElementById('bug-modal-rca-category').value = d.defectCategory || 'Logic Backend API';
    document.getElementById('bug-modal-rca-desc').value = d.rca || '';
    document.getElementById('bug-modal-notes').value = d.devNotes || '';

    // Evidences Gallery
    const evidenceBox = document.getElementById('diag-modal-evidences');
    if (evidenceBox) {
      if (!d.evidences || d.evidences.length === 0) {
        evidenceBox.innerHTML = `<span style="font-size:12px; color:var(--text-muted)">Không có tệp bằng chứng đính kèm.</span>`;
      } else {
        evidenceBox.innerHTML = d.evidences.map((ev, idx) => {
          const url = ev.url || ev;
          return `
            <div class="diag-thumb-card" onclick="DevCycle.openLightbox('${url}', '${escapeHtml(d.code)} - Ảnh ${idx+1}')">
              <img src="${url}" alt="Evidence ${idx+1}" />
              <span class="thumb-badge">Ảnh ${idx+1}</span>
            </div>
          `;
        }).join('');
      }
    }

    openModal('modal-dev-defect');
  },

  openLightbox(url, title) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    if (modal && img) {
      img.src = url;
      if (titleEl) titleEl.textContent = title || 'Ảnh chụp bằng chứng lỗi';
      modal.classList.add('active');
    }
  },

  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('active');
  },

  /**
   * BÁO KHÔNG TÁI HIỆN ĐƯỢC (CANNOT REPRODUCE)
   */
  requestMoreInfo() {
    const tcId = this.activeDefectId;
    if (!tcId) return;

    const note = prompt('Nhập lý do không tái hiện được hoặc yêu cầu Tester bổ sung log/video:', 'Không tái hiện được lỗi trên môi trường local. Đề nghị Tester quay video thao tác hoặc gửi log mạng.');
    if (!note) return;

    this.saveStatusDirect(tcId, 'Need Info', {
      devNotes: `❓ [Yêu cầu làm rõ]: ${note}`
    });

    closeModal('modal-dev-defect');
    showToast(`❓ Đã chuyển trạng thái sang [Need Info] và gửi yêu cầu phản hồi sang Tester!`, 'info');
  },

  /**
   * LƯU BẢN VÁ & BÀN GIAO SANG TESTER
   */
  savePatchResolution() {
    const tcId = this.activeDefectId;
    if (!tcId) return;

    const status = document.getElementById('bug-modal-status').value;
    const fixVersion = document.getElementById('bug-modal-fix-version').value.trim();
    const commitHash = document.getElementById('bug-modal-commit').value.trim();
    const rcaCat = document.getElementById('bug-modal-rca-category').value;
    const rcaDesc = document.getElementById('bug-modal-rca-desc').value.trim();
    const notes = document.getElementById('bug-modal-notes').value.trim();

    // Validation
    if (status === 'Fixed' || status === 'Resolved') {
      if (!fixVersion) {
        showToast('⚠️ Vui lòng nhập Phiên bản vá lỗi!', 'error');
        document.getElementById('bug-modal-fix-version')?.focus();
        return;
      }
      if (!commitHash) {
        showToast('⚠️ Vui lòng nhập Mã Commit Git hoặc Pull Request để đối soát!', 'error');
        document.getElementById('bug-modal-commit')?.focus();
        return;
      }
    }

    this.saveStatusDirect(tcId, status, {
      fixVersion: fixVersion,
      commitHash: commitHash,
      defectCategory: rcaCat,
      rca: rcaDesc,
      devNotes: notes
    });

    closeModal('modal-dev-defect');

    if (status === 'Fixed' || status === 'Resolved') {
      showToast(`🟣 Đã bàn giao bản vá [${tcId}] sang Bàn làm việc của Tester để Re-test!`, 'success');
    } else {
      showToast(`✅ Đã cập nhật trạng thái [${tcId}] thành công!`, 'success');
    }
  },

  saveStatusDirect(tcId, status, extraFields = {}) {
    const prjId = state.activeProjectId;
    const res = (typeof getResultForTc === 'function') 
      ? getResultForTc(tcId, prjId) 
      : (state.results ? state.results[tcId] : null);

    if (res) {
      res.defectStatus = status;
      Object.assign(res, extraFields);

      // Audit comment
      if (status === 'Fixed' || status === 'Resolved') {
        if (!state.comments) state.comments = {};
        if (!state.comments[tcId]) state.comments[tcId] = [];
        state.comments[tcId].push({
          author: getCurrentUser()?.name || getCurrentUser()?.username || 'Lập trình viên',
          role: 'Developer',
          text: `🔧 [Dev Resolution]: Đã nộp bản vá ${extraFields.fixVersion || ''} (${extraFields.commitHash || ''}). RCA: ${extraFields.rca || 'Đã sửa code logic'}. Ghi chú: ${extraFields.devNotes || 'Chờ Tester re-test.'}`,
          time: new Date().toISOString()
        });
      }

      if (typeof setResultForTc === 'function') {
        setResultForTc(tcId, res, prjId);
      } else {
        state.results[tcId] = res;
      }
    }

    // Check if adhoc defect
    if (state.adhocDefects) {
      const ad = state.adhocDefects.find(x => x.id === tcId);
      if (ad) {
        ad.defectStatus = status;
        Object.assign(ad, extraFields);
      }
    }

    saveCoreState();

    if (typeof window.syncResultToCloud === 'function') {
      window.syncResultToCloud(tcId);
    }

    this.renderDefects();
  }
};
