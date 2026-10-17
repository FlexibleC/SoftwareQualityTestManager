/**
 * SMARTVMS QA HUB - AD-HOC DEFECT / INCIDENT REPORTING SYSTEM
 * Standard: ISO/IEC/IEEE 29119-3:2021 Clause 8 & ISO 9001:2015 Clause 8.7
 */

let adhocUploadedEvidences = [];

function ensureAdhocModalDOM() {
  if (document.getElementById('modal-adhoc-defect')) return;

  const modalHtml = `
    <div class="modal-overlay" id="modal-adhoc-defect" onclick="closeModal('modal-adhoc-defect')">
      <div class="modal-dialog adhoc-modal-dialog" onclick="event.stopPropagation()">
        <div class="adhoc-modal-header">
          <h3>
            <span>🐞 Báo Cáo Sự Cố / Lỗi Ngoài Kịch Bản</span>
            <span class="adhoc-badge-iso">ISO 29119-3 Clause 8</span>
          </h3>
          <button class="modal-close" onclick="closeModal('modal-adhoc-defect')">&times;</button>
        </div>

        <div class="modal-body" style="padding:16px 20px; overflow-y:auto; flex:1">
          <div class="adhoc-callout">
            <strong>💡 Quy trình tiếp nhận sự cố:</strong> Khi phát hiện tính năng chưa có trong tài liệu/hệ thống hoặc lỗi không thuộc bất kỳ Test Case nào đã giao, hãy lập phiếu báo cáo dưới đây. Hệ thống sẽ cấp mã <strong>INC-...</strong> và gửi trực tiếp đến <strong>Admin & QA Lead</strong> để thẩm định tạo Test Case chính thức hoặc giao Developer xử lý.
          </div>

          <form id="adhoc-defect-form" onsubmit="event.preventDefault(); submitAdhocDefect();">
            <div class="adhoc-grid-3" style="margin-bottom:12px">
              <div class="form-group">
                <label style="font-size:12px; font-weight:700">Dự án áp dụng *</label>
                <select id="adhoc-project" onchange="onAdhocProjectChange()" class="form-control" style="font-size:12px"></select>
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700">Phân hệ liên quan *</label>
                <select id="adhoc-module" class="form-control" style="font-size:12px"></select>
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700">Mã phiếu dự kiến</label>
                <input type="text" id="adhoc-preview-id" readonly style="font-family:monospace; font-weight:700; background:rgba(0,0,0,0.04); font-size:12px" />
              </div>
            </div>

            <div class="adhoc-grid-3" style="margin-bottom:12px">
              <div class="form-group">
                <label style="font-size:12px; font-weight:700">Phân loại lỗi phát sinh (ISO 25010) *</label>
                <select id="adhoc-type" class="form-control" style="font-size:12px; font-weight:600">
                  <option value="MISSING_FEATURE">⚠️ Tính năng chưa có / Thiếu trong đặc tả (Gap)</option>
                  <option value="CRASH">💥 Treo / Crash hệ thống đột ngột</option>
                  <option value="LOGIC">🧠 Sai lệch Logic / Nghiệp vụ</option>
                  <option value="UI_UX">🎨 Lỗi Giao diện & Trải nghiệm (UI/UX)</option>
                  <option value="SECURITY">🔒 Lỗ hổng Bảo mật & Phân quyền</option>
                  <option value="HARDWARE">📷 Xung đột Thiết bị (Camera ANPR, Barrier, Đầu đọc)</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700">Mức độ nghiêm trọng (Severity) *</label>
                <select id="adhoc-severity" class="form-control" style="font-size:12px">
                  <option value="S1-Blocker">🔴 S1 - Blocker (Tê liệt)</option>
                  <option value="S2-Critical" selected>🟠 S2 - Critical (Nghiêm trọng)</option>
                  <option value="S3-Major">🟡 S3 - Major (Lớn)</option>
                  <option value="S4-Minor">🟢 S4 - Minor (Nhỏ)</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700">Mức ưu tiên (Priority) *</label>
                <select id="adhoc-priority" class="form-control" style="font-size:12px">
                  <option value="P1">🔴 P1 - Rất khẩn cấp</option>
                  <option value="P2" selected>🟠 P2 - Khẩn cấp</option>
                  <option value="P3">🟡 P3 - Bình thường</option>
                  <option value="P4">🟢 P4 - Thấp</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label style="font-size:12px; font-weight:700">Tiêu đề tóm tắt lỗi phát sinh *</label>
              <input type="text" id="adhoc-title" class="form-control" placeholder="VD: Thiếu tính năng ép thu hồi phiên trạm gác khi cán bộ nghỉ đột xuất" required style="font-size:13px; font-weight:600" />
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label style="font-size:12px; font-weight:700">Các bước tái hiện (Steps to Reproduce) *</label>
              <textarea id="adhoc-steps" class="form-control" rows="3" placeholder="1. Thao tác bước 1...&#10;2. Thao tác bước 2...&#10;3. Sự cố xảy ra khi..." required style="font-size:12px; line-height:1.4"></textarea>
            </div>

            <div class="adhoc-grid-2" style="margin-bottom:12px">
              <div class="form-group">
                <label style="font-size:12px; font-weight:700; color:#dc2626">Kết quả thực tế quan sát được (Actual Result) *</label>
                <textarea id="adhoc-actual" class="form-control" rows="2" placeholder="Mô tả hiện tượng sai lệch hoặc thiếu sót hệ thống..." required style="font-size:12px"></textarea>
              </div>
              <div class="form-group">
                <label style="font-size:12px; font-weight:700; color:#16a34a">Kết quả kỳ vọng (Expected Behavior / Tiêu chuẩn) *</label>
                <textarea id="adhoc-expected" class="form-control" rows="2" placeholder="Hệ thống cần phải xử lý như thế nào theo chuẩn nghiệp vụ..." required style="font-size:12px"></textarea>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label style="font-size:12px; font-weight:700">Môi trường & Thiết bị phát hiện (Environment)</label>
              <input type="text" id="adhoc-env" class="form-control" value="Web Trực ban, Edge/Chrome, Camera IP Hikvision / Đầu đọc Mifare" style="font-size:12px" />
            </div>

            <div class="form-group" style="margin-bottom:12px">
              <label style="font-size:12px; font-weight:700">Đính kèm ảnh bằng chứng / Logs</label>
              <div style="display:flex; align-items:center; gap:10px">
                <input type="file" id="adhoc-file-input" accept="image/*" multiple style="display:none" onchange="handleAdhocFiles(this)" />
                <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('adhoc-file-input').click()">📁 Chọn File Ảnh</button>
                <span style="font-size:11px; color:var(--text-muted)">(Hoặc nhấn Ctrl + V để dán trực tiếp ảnh từ Clipboard)</span>
              </div>
              <div class="adhoc-preview-container" id="adhoc-preview-box"></div>
            </div>

            <div style="background:var(--bg-surface); padding:10px 14px; border-radius:6px; border:1px solid var(--border-light); margin-bottom:12px">
              <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; cursor:pointer; margin:0">
                <input type="checkbox" id="adhoc-suggest-tc" checked style="width:16px; height:16px; accent-color:#ea580c" />
                <span>☑️ Đề xuất Admin & QA Lead thẩm định chuyển lỗi này thành Test Case chính thức mới</span>
              </label>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:14px">
              <button type="button" class="btn btn-outline" onclick="closeModal('modal-adhoc-defect')">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary" style="background:linear-gradient(135deg, #ea580c 0%, #c2410c 100%); border:none; padding:8px 20px; font-weight:700">
                📤 Gửi Báo Cáo Lên Admin & QA Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Paste listener for clipboard images
  const modalEl = document.getElementById('modal-adhoc-defect');
  modalEl.addEventListener('paste', function(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function(event) {
          addAdhocEvidence(event.target.result);
        };
        reader.readAsDataURL(blob);
      }
    }
  });
}

function openAdhocDefectModal(defaultModule) {
  ensureAdhocModalDOM();
  adhocUploadedEvidences = [];
  renderAdhocPreviews();

  // Populate projects
  const u = getCurrentUser();
  const prjs = getAccessibleProjects(u);
  const prjSelect = document.getElementById('adhoc-project');
  if (prjSelect) {
    prjSelect.innerHTML = '';
    prjs.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === state.activeProjectId) opt.selected = true;
      prjSelect.appendChild(opt);
    });
  }

  // Populate modules
  populateAdhocModules(defaultModule);

  // Set preview ID
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String((state.adhocDefects || []).length + 1).padStart(3, '0');
  const prevEl = document.getElementById('adhoc-preview-id');
  if (prevEl) prevEl.value = `INC-${dateStr}-${seq}`;

  // Reset form inputs
  const form = document.getElementById('adhoc-defect-form');
  if (form) {
    document.getElementById('adhoc-title').value = '';
    document.getElementById('adhoc-steps').value = '';
    document.getElementById('adhoc-actual').value = '';
    document.getElementById('adhoc-expected').value = '';
    document.getElementById('adhoc-type').value = 'MISSING_FEATURE';
    document.getElementById('adhoc-severity').value = 'S2-Critical';
    document.getElementById('adhoc-priority').value = 'P2';
    document.getElementById('adhoc-suggest-tc').checked = true;
  }

  openModal('modal-adhoc-defect');
}

function onAdhocProjectChange() {
  const pId = document.getElementById('adhoc-project').value;
  populateAdhocModules(null, pId);
}

function populateAdhocModules(defaultModule, projectId) {
  const modSelect = document.getElementById('adhoc-module');
  if (!modSelect) return;
  modSelect.innerHTML = '';

  const p = (state.projects || []).find(prj => prj.id === (projectId || state.activeProjectId)) || getActiveProject();
  const mods = p ? (p.modules || []) : [];

  mods.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `[${m.id}] ${m.name}`;
    if (defaultModule && m.id === defaultModule) opt.selected = true;
    modSelect.appendChild(opt);
  });

  const optOther = document.createElement('option');
  optOther.value = 'OTHER';
  optOther.textContent = '➕ Phân hệ mới / Ngoài phạm vi';
  modSelect.appendChild(optOther);
}

function handleAdhocFiles(input) {
  if (!input.files || input.files.length === 0) return;
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      addAdhocEvidence(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function addAdhocEvidence(base64Str) {
  adhocUploadedEvidences.push(base64Str);
  renderAdhocPreviews();
}

function removeAdhocEvidence(idx) {
  adhocUploadedEvidences.splice(idx, 1);
  renderAdhocPreviews();
}

function renderAdhocPreviews() {
  const box = document.getElementById('adhoc-preview-box');
  if (!box) return;
  box.innerHTML = '';
  adhocUploadedEvidences.forEach((src, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'adhoc-thumb-wrap';
    thumb.innerHTML = `
      <img src="${src}" alt="Evidence" />
      <button type="button" class="adhoc-thumb-remove" onclick="removeAdhocEvidence(${idx})">&times;</button>
    `;
    box.appendChild(thumb);
  });
}

function submitAdhocDefect() {
  const title = document.getElementById('adhoc-title').value.trim();
  const steps = document.getElementById('adhoc-steps').value.trim();
  const actual = document.getElementById('adhoc-actual').value.trim();
  const expected = document.getElementById('adhoc-expected').value.trim();

  if (!title) {
    showToast('⚠️ Vui lòng nhập tiêu đề tóm tắt lỗi!', 'warning');
    return;
  }
  if (!steps) {
    showToast('⚠️ Vui lòng nhập các bước tái hiện!', 'warning');
    return;
  }
  if (!actual) {
    showToast('⚠️ Vui lòng nhập kết quả thực tế quan sát được!', 'warning');
    return;
  }

  const payload = {
    projectId: document.getElementById('adhoc-project').value,
    module: document.getElementById('adhoc-module').value,
    title: title,
    defectType: document.getElementById('adhoc-type').value,
    severity: document.getElementById('adhoc-severity').value,
    priority: document.getElementById('adhoc-priority').value,
    stepsToReproduce: steps,
    actualResult: actual,
    expectedResult: expected,
    environment: document.getElementById('adhoc-env').value.trim(),
    evidences: [...adhocUploadedEvidences],
    suggestConvertToTc: document.getElementById('adhoc-suggest-tc').checked
  };

  const newDefect = recordAdhocDefect(payload);
  closeModal('modal-adhoc-defect');

  showToast(`✅ Đã gửi Phiếu sự cố ${newDefect.id} thành công lên Admin & QA Lead!`, 'success');

  // Callback to refresh views if present
  if (typeof renderMyTasks === 'function') renderMyTasks();
  if (typeof renderHistoryTable === 'function') renderHistoryTable();
  if (typeof renderAdminAdhocSection === 'function') renderAdminAdhocSection();
}

// ================================================================
// ADMIN INTEGRATION: CONVERT AD-HOC DEFECT TO FORMAL TEST CASE
// ================================================================
function convertAdhocToTcModal(incidentId) {
  const defect = (state.adhocDefects || []).find(d => d.id === incidentId);
  if (!defect) {
    showToast('Không tìm thấy phiếu sự cố!', 'error');
    return;
  }

  // Pre-fill Admin Test Case Form
  if (typeof openAddTcModal === 'function') {
    openAddTcModal();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('tc-form-name', defect.title);
    setVal('tc-form-module', defect.module === 'OTHER' ? 'M01' : defect.module);
    setVal('tc-form-priority', defect.priority || 'P2');
    setVal('tc-form-type', defect.defectType === 'SECURITY' ? 'Bảo mật' : 'Chức năng');
    setVal('tc-form-steps', defect.stepsToReproduce);
    setVal('tc-form-expected', defect.expectedResult);
    setVal('tc-form-testdata', `Môi trường: ${defect.environment}`);
    setVal('tc-form-notes', `[Chuyển đổi từ Sự cố ngoài kịch bản ${defect.id}] Phát hiện bởi ${defect.reporterName} ngày ${defect.reportedAt.slice(0, 10)}.`);

    // Mark status
    updateAdhocDefectStatus(defect.id, 'CONVERTED_TO_TC', { convertedTcId: 'PENDING_SAVE' });
    showToast(`💡 Đã nạp thông tin sự cố ${defect.id} vào biểu mẫu kịch bản mới! Vui lòng lưu để hoàn tất.`, 'info');
  } else {
    showToast('Tính năng chuyển đổi kịch bản chỉ khả dụng trong cổng Admin!', 'warning');
  }
}

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  ensureAdhocModalDOM();
});
