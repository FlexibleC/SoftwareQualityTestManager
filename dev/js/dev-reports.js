/**
 * DEVELOPER MODULE: TECHNICAL QUALITY REPORTS LOGIC (dev-reports.js)
 * Chuẩn: ISO/IEC/IEEE 29119-3:2021 & IEEE 1044 Root Cause Analysis
 */

let rcaChartInstance = null;
let mttrChartInstance = null;

const DevReports = {
  init() {
    DevContext.init(0);
    this.populateProjectSelect();
    this.renderReports();
  },

  populateProjectSelect() {
    const sel = document.getElementById('report-project-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">Tất cả dự án bạn tham gia</option>';
    const user = getCurrentUser();
    const projects = DevContext.getAssignedProjectsForDev(user);
    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === state.activeProjectId) opt.selected = true;
      sel.appendChild(opt);
    });
  },

  onProjectChange() {
    const sel = document.getElementById('report-project-select');
    state.activeProjectId = sel.value || (state.projects && state.projects[0] ? state.projects[0].id : null);
    this.renderReports();
  },

  renderReports() {
    const selPrjId = document.getElementById('report-project-select')?.value || null;
    let defects = [];

    if (selPrjId) {
      defects = DevContext.getAllDefectsForContext(selPrjId);
    } else {
      const user = getCurrentUser();
      const myProjects = DevContext.getAssignedProjectsForDev(user);
      myProjects.forEach(p => {
        defects = defects.concat(DevContext.getAllDefectsForContext(p.id));
      });
    }

    const total = defects.length;
    let fixedCount = 0;
    let reopenedCount = 0;
    let blockerCount = 0;
    let totalResolveHours = 0;
    let resolvedCount = 0;

    const rcaCategories = {
      'Logic Backend API': 0,
      'Giao diện Frontend': 0,
      'Thiết bị phần cứng Barie/Camera': 0,
      'CSDL & Migration': 0,
      'Hiệu năng / Quá tải': 0,
      'Yêu cầu đặc tả mơ hồ': 0,
      'Khác / Chưa phân loại': 0
    };

    defects.forEach(d => {
      const isResolved = (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved' || d.defectStatus === 'Closed');
      if (isResolved) {
        fixedCount++;
        let hours = 0;
        if (d.runAt && d.resolvedAt) {
          hours = (new Date(d.resolvedAt).getTime() - new Date(d.runAt).getTime()) / (1000 * 3600);
        } else if (d.hoursSpent) {
          hours = Number(d.hoursSpent);
        }
        if (hours > 0) {
          totalResolveHours += hours;
          resolvedCount++;
        }
      }
      if (d.defectStatus === 'Reopened') reopenedCount++;
      if (d.severity === 'Blocker' || d.severity === 'Critical') blockerCount++;

      const cat = d.defectCategory || 'Khác / Chưa phân loại';
      if (rcaCategories[cat] !== undefined) {
        rcaCategories[cat]++;
      } else {
        rcaCategories['Khác / Chưa phân loại']++;
      }
    });

    const fixRate = total > 0 ? Math.round((fixedCount / total) * 100) : 0;
    const reopenRate = total > 0 ? Math.round((reopenedCount / total) * 100) : 0;
    const avgMttrStr = resolvedCount > 0 
      ? `${(totalResolveHours / resolvedCount).toFixed(1)} giờ` 
      : (total > 0 ? 'Đang xử lý' : '—');

    // Set KPIs
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpi-rep-total', total);
    setVal('kpi-rep-fixrate', `${fixRate}%`);
    setVal('kpi-rep-reopenrate', `${reopenRate}%`);
    setVal('kpi-rep-blocker', blockerCount);
    setVal('kpi-rep-mttr', avgMttrStr);

    this.renderRCAChart(rcaCategories, total);
    this.renderMTTRChart(defects);
    this.renderDefectTable(defects);
  },

  renderRCAChart(rcaData, totalDefects = 0) {
    const canvas = document.getElementById('chart-rca-doughnut');
    if (!canvas) return;

    if (rcaChartInstance) {
      rcaChartInstance.destroy();
    }

    if (!totalDefects || totalDefects === 0) {
      rcaChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Chưa có dữ liệu lỗi'],
          datasets: [{
            data: [1],
            backgroundColor: ['rgba(148, 163, 184, 0.2)'],
            borderWidth: 1,
            borderColor: '#334155'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                font: { size: 11, family: 'Inter', weight: 600 },
                color: '#94a3b8'
              }
            },
            tooltip: {
              callbacks: {
                label: () => 'Chưa phát sinh lỗi trong cơ sở dữ liệu'
              }
            }
          }
        }
      });
      return;
    }

    const labels = Object.keys(rcaData);
    const data = Object.values(rcaData);

    const colors = [
      '#0284c7', // Logic Backend
      '#06b6d4', // Frontend
      '#f59e0b', // Hardware
      '#8b5cf6', // DB
      '#ec4899', // Performance
      '#64748b', // Req
      '#94a3b8'  // Other
    ];

    rcaChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 1.5,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { size: 11, family: 'Inter', weight: 600 },
              color: '#94a3b8'
            }
          }
        }
      }
    });
  },

  renderMTTRChart(defects = []) {
    const canvas = document.getElementById('chart-mttr-bar');
    if (!canvas) return;

    if (mttrChartInstance) {
      mttrChartInstance.destroy();
    }

    const sevBuckets = {
      'Blocker': { totalHours: 0, count: 0, sla: 4.0 },
      'Critical': { totalHours: 0, count: 0, sla: 24.0 },
      'High': { totalHours: 0, count: 0, sla: 48.0 },
      'Medium': { totalHours: 0, count: 0, sla: 72.0 },
      'Low': { totalHours: 0, count: 0, sla: 96.0 }
    };

    defects.forEach(d => {
      let sevKey = 'Medium';
      if (d.severity === 'Blocker') sevKey = 'Blocker';
      else if (d.severity === 'Critical') sevKey = 'Critical';
      else if (d.severity === 'High') sevKey = 'High';
      else if (d.severity === 'Medium') sevKey = 'Medium';
      else if (d.severity === 'Low') sevKey = 'Low';

      const isResolved = (d.defectStatus === 'Fixed' || d.defectStatus === 'Resolved' || d.defectStatus === 'Closed');
      if (isResolved) {
        let hours = 0;
        if (d.runAt && d.resolvedAt) {
          hours = (new Date(d.resolvedAt).getTime() - new Date(d.runAt).getTime()) / (1000 * 3600);
        } else if (d.hoursSpent) {
          hours = Number(d.hoursSpent);
        }
        if (hours > 0) {
          sevBuckets[sevKey].totalHours += hours;
          sevBuckets[sevKey].count++;
        }
      }
    });

    const hasAnyResolved = Object.values(sevBuckets).some(b => b.count > 0);
    const actualData = [
      sevBuckets['Blocker'].count > 0 ? Number((sevBuckets['Blocker'].totalHours / sevBuckets['Blocker'].count).toFixed(1)) : 0,
      sevBuckets['Critical'].count > 0 ? Number((sevBuckets['Critical'].totalHours / sevBuckets['Critical'].count).toFixed(1)) : 0,
      sevBuckets['High'].count > 0 ? Number((sevBuckets['High'].totalHours / sevBuckets['High'].count).toFixed(1)) : 0,
      sevBuckets['Medium'].count > 0 ? Number((sevBuckets['Medium'].totalHours / sevBuckets['Medium'].count).toFixed(1)) : 0,
      sevBuckets['Low'].count > 0 ? Number((sevBuckets['Low'].totalHours / sevBuckets['Low'].count).toFixed(1)) : 0
    ];

    const slaData = hasAnyResolved || defects.length > 0 
      ? [4.0, 24.0, 48.0, 72.0, 96.0] 
      : [0, 0, 0, 0, 0];

    mttrChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Blocker', 'Critical', 'High / Major', 'Medium', 'Low / Minor'],
        datasets: [
          {
            label: 'Thời gian khắc phục bình quân thực tế (giờ)',
            data: actualData,
            backgroundColor: '#0284c7',
            borderRadius: 4
          },
          {
            label: 'Mục tiêu cam kết chất lượng (giờ)',
            data: slaData,
            backgroundColor: 'rgba(148, 163, 184, 0.4)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11, family: 'Inter', weight: 600 },
              color: '#94a3b8'
            }
          }
        }
      }
    });
  },

  renderDefectTable(defects) {
    const tbody = document.getElementById('tbl-reports-defects-body');
    if (!tbody) return;

    if (defects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted)">Không có lỗi nào để phân tích.</td></tr>`;
      return;
    }

    tbody.innerHTML = defects.slice(0, 50).map(d => {
      let sevClass = 'sev-critical';
      if (d.severity === 'Blocker') sevClass = 'sev-blocker';
      else if (d.severity === 'High') sevClass = 'sev-high';
      else if (d.severity === 'Medium') sevClass = 'sev-medium';
      else if (d.severity === 'Low') sevClass = 'sev-low';

      return `
        <tr>
          <td><strong style="font-family:monospace; color:#0284c7">${escapeHtml(d.code)}</strong></td>
          <td><span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700">${escapeHtml(d.module)}</span></td>
          <td>
            <div style="font-weight:700; color:var(--text-primary); font-size:12px">${escapeHtml(d.title)}</div>
            <div style="font-size:11px; color:#dc2626; margin-top:2px">${escapeHtml(d.failReason)}</div>
          </td>
          <td><span class="sev-badge ${sevClass}">${escapeHtml(d.severity)}</span></td>
          <td><span class="badge" style="background:rgba(2,132,199,0.12); color:#0284c7; font-size:10.5px">${escapeHtml(d.defectCategory || 'Logic Backend API')}</span></td>
          <td style="font-size:11.5px; font-family:monospace">${escapeHtml(d.fixVersion || 'Chưa gán')}</td>
          <td style="font-size:11.5px; font-family:monospace">${escapeHtml(d.commitHash || '—')}</td>
        </tr>
      `;
    }).join('');
  }
};
