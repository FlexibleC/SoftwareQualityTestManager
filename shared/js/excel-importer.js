/**
 * SMARTVMS QA HUB - EXCEL & JSON CATALOG IMPORT/EXPORT MODULE
 * Standard: ISO/IEC/IEEE 29119-3:2021 & ISO 9001:2015 8.5.2
 * Supports importing & exporting test cases via Excel (.xlsx, .xls) and JSON (.json)
 * Enables dynamic test case catalog management without hardcoding in source code.
 */

(function (window) {
  'use strict';

  // Ensure XLSX is available (from vendor or CDN)
  function ensureXlsxLoaded() {
    return new Promise((resolve) => {
      if (typeof window.XLSX !== 'undefined') {
        return resolve(true);
      }
      // Try local vendor first, then CDN fallback
      const script = document.createElement('script');
      script.src = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/tester/') || window.location.pathname.includes('/dev/')
        ? '../shared/js/vendor/xlsx.full.min.js'
        : 'shared/js/vendor/xlsx.full.min.js';

      script.onload = () => {
        if (typeof window.XLSX !== 'undefined') return resolve(true);
        loadCdnXlsx(resolve);
      };
      script.onerror = () => loadCdnXlsx(resolve);
      document.head.appendChild(script);
    });
  }

  function loadCdnXlsx(resolve) {
    const cdn = document.createElement('script');
    cdn.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    cdn.onload = () => resolve(typeof window.XLSX !== 'undefined');
    cdn.onerror = () => resolve(false);
    document.head.appendChild(cdn);
  }

  // 1. TẢI FILE MẪU EXCEL CHUẨN (.xlsx)
  async function downloadExcelTemplate() {
    const ok = await ensureXlsxLoaded();
    if (!ok) {
      alert('Không thể tải thư viện xử lý Excel. Vui lòng kiểm tra lại kết nối mạng.');
      return;
    }

    const templateRows = [
      {
        'Mã Test Case (*)': 'TC-AUTH-001',
        'Phân hệ (*)': 'M01',
        'Tiêu đề kịch bản (*)': 'Đăng nhập Trạm gác hợp lệ bằng tài khoản trạm (Không mật khẩu)',
        'Mức ưu tiên': 'P1',
        'Loại kiểm thử': 'Chức năng',
        'Bộ kịch bản': 'SMOKE',
        'Nền tảng': 'Web Trực ban',
        'Mã SRS': 'SRS-AUTH-01',
        'Điều kiện tiên quyết': 'Hệ thống SmartVMS Local SingleSite đang hoạt động. Trạm gác B01 đã được tạo và kích hoạt.',
        'Dữ liệu kiểm thử': 'Station Code = B01',
        'Các bước thực hiện': '1. Mở trình duyệt Web tại http://smartvms.local/station\n2. Nhập mã trạm: b01\n3. Bấm Đăng nhập vào bốt trực',
        'Kết quả kỳ vọng': '• Tự động chuẩn hóa chữ thường thành chữ hoa B01\n• Xác thực thành công vào Dashboard\n• Lưu Token ca trực hợp lệ',
        'Ghi chú': 'Không phân biệt chữ hoa, chữ thường'
      },
      {
        'Mã Test Case (*)': 'TC-AUTH-002',
        'Phân hệ (*)': 'M01',
        'Tiêu đề kịch bản (*)': 'Đăng nhập với mã trạm không tồn tại trong CSDL',
        'Mức ưu tiên': 'P2',
        'Loại kiểm thử': 'Ngoại lệ',
        'Bộ kịch bản': 'REGRESSION',
        'Nền tảng': 'Web Trực ban',
        'Mã SRS': 'SRS-AUTH-02',
        'Điều kiện tiên quyết': 'Trực ban mở giao diện đăng nhập.',
        'Dữ liệu kiểm thử': 'Station Code = B999',
        'Các bước thực hiện': '1. Nhập mã trạm: B999\n2. Bấm Đăng nhập',
        'Kết quả kỳ vọng': '• Hiển thị thông báo lỗi: Mã trạm không tồn tại\n• Chặn truy cập vào hệ thống',
        'Ghi chú': 'Kiểm tra thông báo thân thiện với người dùng'
      },
      {
        'Mã Test Case (*)': 'TC-CKIN-001',
        'Phân hệ (*)': 'M02',
        'Tiêu đề kịch bản (*)': 'Tiếp đón khách đơn có quét thẻ CCCD gắn chip',
        'Mức ưu tiên': 'P1',
        'Loại kiểm thử': 'Chức năng',
        'Bộ kịch bản': 'REGRESSION',
        'Nền tảng': 'Web Trực ban',
        'Mã SRS': 'SRS-CKIN-01',
        'Điều kiện tiên quyết': 'Thiết bị đọc thẻ CCCD W3/EA09N kết nối online.',
        'Dữ liệu kiểm thử': 'Thẻ CCCD thử nghiệm hợp lệ',
        'Các bước thực hiện': '1. Đặt thẻ CCCD lên máy đọc\n2. Bấm Đọc thẻ CCCD\n3. Nhập Mục đích: Liên hệ công việc.\n4. Bấm Check-in',
        'Kết quả kỳ vọng': '• Điền tự động Họ tên, CCCD, Ảnh chân dung\n• Mục đích mặc định là Liên hệ công việc.\n• Tạo lượt viếng thăm thành công',
        'Ghi chú': 'Mục đích vào làm việc mặc định là Liên hệ công việc.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);

    // Căn chỉnh độ rộng cột Excel
    ws['!cols'] = [
      { wch: 18 }, // Mã
      { wch: 12 }, // Phân hệ
      { wch: 45 }, // Tiêu đề
      { wch: 14 }, // Ưu tiên
      { wch: 16 }, // Loại
      { wch: 14 }, // Bộ
      { wch: 16 }, // Nền tảng
      { wch: 14 }, // SRS
      { wch: 40 }, // Tiền điều kiện
      { wch: 30 }, // Dữ liệu
      { wch: 45 }, // Các bước
      { wch: 45 }, // Kết quả kỳ vọng
      { wch: 30 }  // Ghi chú
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhMuc_KichBan');

    XLSX.writeFile(wb, 'SmartVMS_Mau_KichBan_KiemThu.xlsx');
    if (window.showToast) window.showToast('📑 Đã tải file mẫu Excel kịch bản kiểm thử (.xlsx)!', 'success');
  }

  // 2. XUẤT TOÀN BỘ KỊCH BẢN HIỆN TẠI RA FILE EXCEL (.xlsx)
  async function exportCatalogToExcel() {
    const ok = await ensureXlsxLoaded();
    if (!ok) {
      alert('Không thể tải thư viện xử lý Excel.');
      return;
    }

    const tcs = (typeof window.getAllTcs === 'function') ? window.getAllTcs() : (window.state?.projects?.[0]?.testCases || []);
    if (!tcs || tcs.length === 0) {
      alert('Chưa có kịch bản kiểm thử nào trong hệ thống để xuất.');
      return;
    }

    const results = window.state?.results || {};

    const rows = tcs.map((t, idx) => {
      const res = results[t.id];
      const statusText = res ? res.status : (t.status || 'Not Run');
      const stepsText = Array.isArray(t.steps) ? t.steps.join('\n') : (t.steps || '');
      const expectedText = Array.isArray(t.expected) ? t.expected.join('\n') : (t.expected || '');

      return {
        'STT': idx + 1,
        'Mã Test Case': t.id,
        'Phân hệ': t.module || 'M01',
        'Tiêu đề kịch bản': t.name || t.title || '',
        'Mức ưu tiên': t.priority || 'P2',
        'Loại kiểm thử': t.type || 'Chức năng',
        'Bộ kịch bản': t.suite || 'REGRESSION',
        'Nền tảng': t.platform || 'Web Trực ban',
        'Mã SRS': t.reqId || '',
        'Điều kiện tiên quyết': t.precondition || '',
        'Dữ liệu kiểm thử': t.testData || '',
        'Các bước thực hiện': stepsText,
        'Kết quả kỳ vọng': expectedText,
        'Ghi chú': t.notes || '',
        'Trạng thái Test hiện tại': statusText,
        'Người test gần nhất': res?.tester || '',
        'Thời gian test': res?.runAt ? new Date(res.runAt).toLocaleString('vi-VN') : ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 18 }, // Mã
      { wch: 12 }, // Phân hệ
      { wch: 45 }, // Tiêu đề
      { wch: 14 }, // Ưu tiên
      { wch: 16 }, // Loại
      { wch: 14 }, // Bộ
      { wch: 16 }, // Nền tảng
      { wch: 14 }, // SRS
      { wch: 40 }, // Tiền điều kiện
      { wch: 30 }, // Dữ liệu
      { wch: 50 }, // Các bước
      { wch: 50 }, // Kết quả kỳ vọng
      { wch: 30 }, // Ghi chú
      { wch: 18 }, // Trạng thái
      { wch: 22 }, // Người test
      { wch: 20 }  // Ngày test
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TestCases');

    const fileName = `SmartVMS_KichBan_KiemThu_${tcs.length}TCs_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    if (window.showToast) window.showToast(`📊 Đã xuất thành công ${tcs.length} kịch bản sang file Excel [${fileName}]!`, 'success');
  }

  // 3. NẠP KỊCH BẢN TỪ FILE EXCEL (.xlsx / .xls)
  async function importCatalogFromExcel(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) return;
    const ok = await ensureXlsxLoaded();
    if (!ok) {
      alert('Không thể tải thư viện xử lý Excel.');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          alert('File Excel không có dữ liệu kịch bản!');
          return;
        }

        const parsedTcs = [];
        rawRows.forEach((row, idx) => {
          // Dynamic Header resolution (both VN and EN supported)
          const id = String(row['Mã Test Case'] || row['Mã Test Case (*)'] || row['Mã TC'] || row['ID'] || row['id'] || row['tc_id'] || '').trim();
          const title = String(row['Tiêu đề kịch bản'] || row['Tiêu đề kịch bản (*)'] || row['Tên kịch bản'] || row['Tiêu đề'] || row['Title'] || row['name'] || '').trim();
          if (!id || !title) return; // Skip invalid row

          const module = String(row['Phân hệ'] || row['Phân hệ (*)'] || row['Module'] || row['module'] || 'M01').trim().toUpperCase();
          const priority = String(row['Mức ưu tiên'] || row['Ưu tiên'] || row['Priority'] || row['priority'] || 'P2').trim();
          const type = String(row['Loại kiểm thử'] || row['Loại'] || row['Type'] || row['type'] || 'Chức năng').trim();
          const suite = String(row['Bộ kịch bản'] || row['Bộ'] || row['Suite'] || row['suite'] || 'REGRESSION').trim();
          const platform = String(row['Nền tảng'] || row['Platform'] || row['platform'] || 'Web Trực ban').trim();
          const reqId = String(row['Mã SRS'] || row['SRS'] || row['reqId'] || '').trim();
          const precondition = String(row['Điều kiện tiên quyết'] || row['Tiền điều kiện'] || row['Precondition'] || '').trim();
          const testData = String(row['Dữ liệu kiểm thử'] || row['Dữ liệu'] || row['Test Data'] || '').trim();
          const notes = String(row['Ghi chú'] || row['Notes'] || row['note'] || '').trim();

          // Split steps and expected lines
          const rawSteps = String(row['Các bước thực hiện'] || row['Quy trình'] || row['Steps'] || row['steps'] || '').trim();
          const steps = rawSteps ? rawSteps.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : ['1. Thực hiện kiểm thử theo quy trình chuẩn.'];

          const rawExpected = String(row['Kết quả kỳ vọng'] || row['Kỳ vọng'] || row['Expected'] || row['expected'] || '').trim();
          const expected = rawExpected ? rawExpected.split(/\r?\n/).map(s => s.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean) : ['Hệ thống đáp ứng đúng yêu cầu thiết kế.'];

          parsedTcs.push({
            id,
            module,
            name: title,
            title,
            priority,
            type,
            suite,
            platform,
            reqId,
            precondition,
            testData,
            steps,
            expected,
            notes,
            isCustom: true
          });
        });

        if (parsedTcs.length === 0) {
          alert('Không tìm thấy dòng kịch bản hợp lệ nào trong file Excel!\nVui lòng tải file mẫu để xem định dạng chuẩn.');
          return;
        }

        const confirmMsg = `📊 Tìm thấy ${parsedTcs.length} kịch bản kiểm thử hợp lệ trong file Excel [${file.name}].\n\nBạn có muốn nạp vào hệ thống để thay thế toàn bộ danh mục kịch bản hiện tại?`;
        if (!confirm(confirmMsg)) {
          fileInput.value = '';
          return;
        }

        applyImportedCatalog(parsedTcs, `Excel: ${file.name}`);
        fileInput.value = '';
      } catch (err) {
        console.error('Lỗi đọc Excel:', err);
        alert('❌ Có lỗi xảy ra khi đọc file Excel: ' + err.message);
        fileInput.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // 4. NẠP KỊCH BẢN TỪ FILE JSON (.json)
  function importCatalogFromJson(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        const importedTcs = data.testCases || (Array.isArray(data) ? data : null);
        if (!importedTcs || !Array.isArray(importedTcs) || importedTcs.length === 0) {
          alert('⚠️ Định dạng tệp JSON không hợp lệ hoặc rỗng!');
          return;
        }

        const validTcs = importedTcs.map(t => ({
          ...t,
          id: t.id || t.tc_id,
          name: t.name || t.title || t.id,
          title: t.title || t.name || t.id,
          module: t.module || 'M01',
          priority: t.priority || 'P2',
          type: t.type || 'Chức năng',
          suite: t.suite || 'REGRESSION',
          steps: Array.isArray(t.steps) ? t.steps : (t.steps ? [t.steps] : []),
          expected: Array.isArray(t.expected) ? t.expected : (t.expected ? [t.expected] : [])
        })).filter(t => t.id && t.name);

        if (confirm(`Tìm thấy ${validTcs.length} kịch bản kiểm thử từ tệp JSON. Bạn có muốn nạp vào hệ thống?`)) {
          applyImportedCatalog(validTcs, `JSON: ${file.name}`);
        }
        fileInput.value = '';
      } catch (err) {
        alert('❌ Lỗi khi đọc file JSON: ' + err.message);
        fileInput.value = '';
      }
    };

    reader.readAsText(file);
  }

  // 5. HÀM ÁP DỤNG DANH MỤC VÀO STATE, CYCLES & ĐỒNG BỘ
  function applyImportedCatalog(newTcs, sourceName = 'Imported') {
    if (!window.state) window.state = {};
    if (!window.state.projects || window.state.projects.length === 0) {
      window.state.projects = [{ id: 'PRJ-SMARTVMS', name: 'SmartVMS — Quản lý Khách & Ra vào', code: 'SMARTVMS' }];
    }

    const prj = window.state.projects[0];
    prj.testCases = newTcs;

    // Đánh dấu rõ ràng là danh mục do người dùng nạp (không dùng nạp đè bằng file code cứng)
    window.state.isCustomCatalog = true;
    window.state.catalogSource = sourceName;
    window.state.catalogUpdatedAt = new Date().toISOString();

    // Cập nhật Test Cycle
    const allIds = newTcs.map(t => t.id);
    if (!window.state.testCycles || window.state.testCycles.length === 0) {
      window.state.testCycles = [{
        id: 'CYC-SMARTVMS-01',
        code: 'DOT-1',
        name: 'Đợt 1 — Kịch bản Chuẩn hóa Vận hành',
        projectId: 'PRJ-SMARTVMS',
        version: 'v2.0',
        status: 'ACTIVE',
        targetSuite: 'REGRESSION',
        testCaseIds: allIds,
        description: `Kiểm thử toàn diện ${newTcs.length} kịch bản`
      }];
    } else {
      window.state.testCycles[0].testCaseIds = allIds;
    }
    window.state.activeCycleId = 'CYC-SMARTVMS-01';

    // Cập nhật ma trận phân công
    const today = new Date().toISOString().slice(0, 10);
    window.state.assignments = newTcs.map((tc, idx) => {
      const curRes = window.state.results?.[tc.id];
      const curStatus = curRes ? curRes.status : 'Not Run';
      return {
        id: `asg-${String(idx + 1).padStart(3, '0')}`,
        cycleId: 'CYC-SMARTVMS-01',
        projectId: 'PRJ-SMARTVMS',
        tcId: tc.id,
        assigneeUsername: 'tester',
        assigneeName: 'Nguyễn Văn Nam (Tester)',
        assignedBy: 'Nguyễn Văn Huy (QA Lead)',
        startDate: today,
        dueDate: '2026-10-30',
        status: curStatus === 'Pass' ? 'PASSED' : (curStatus === 'Fail' ? 'FAILED' : 'Not Run'),
        priority: tc.priority || 'P2',
        module: tc.module || 'M01',
        assignedAt: new Date().toISOString()
      };
    });

    // Lưu Core State
    if (typeof window.saveCoreState === 'function') {
      window.saveCoreState();
    }

    // Tự động đẩy lên server LAN nếu đang chạy Node server
    saveCatalogToLanServer(newTcs);

    // Refresh UI mọi trang đang mở
    refreshAllActiveScreens();

    if (window.showToast) {
      window.showToast(`✅ Đã nạp thành công ${newTcs.length} kịch bản vào hệ thống từ ${sourceName}!`, 'success');
    }
  }

  // 5b. XUẤT TOÀN BỘ KỊCH BẢN HIỆN TẠI RA FILE JSON (.json)
  function exportCatalogJson() {
    const tcs = (typeof window.getAllTcs === 'function') ? window.getAllTcs() : (window.state?.projects?.[0]?.testCases || []);
    if (!tcs || tcs.length === 0) {
      alert('Chưa có kịch bản kiểm thử nào trong hệ thống để xuất.');
      return;
    }
    const exportData = {
      schema: "https://smartvms.local/schemas/test-catalog-v4.json",
      title: "SmartVMS Local SingleSite 2026 — Danh mục Kịch bản Kiểm thử Chuẩn hóa",
      standardCompliance: [
        "ISO 9001:2015 Clause 7.5 & 8.5.2",
        "ISO/IEC/IEEE 29119-3:2021",
        "ISO/IEC 25010:2023"
      ],
      exportedAt: new Date().toISOString(),
      totalTestCases: tcs.length,
      modules: window.state?.projects?.[0]?.modules || [],
      testCases: tcs
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartVMS_KichBan_KiemThu_${tcs.length}TCs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast(`💾 Đã xuất ${tcs.length} kịch bản sang file JSON!`, 'success');
  }

  // 6. XÓA BỎ DỨT ĐIỂM CÁC TEST CASE BỎ QUA (SKIP)
  async function deleteSkippedTestCases() {
    const results = window.state?.results || {};
    const skippedIds = Object.keys(results).filter(tcId => {
      const s = String(results[tcId]?.status || '').trim().toLowerCase();
      return s === 'skip' || s === 'bỏ qua' || s === 'skipped';
    });

    const prjTcs = window.state?.projects?.[0]?.testCases || [];
    prjTcs.forEach(t => {
      const s = String(t.status || '').trim().toLowerCase();
      if ((s === 'skip' || s === 'bỏ qua' || s === 'skipped') && !skippedIds.includes(t.id)) {
        skippedIds.push(t.id);
      }
    });

    if (skippedIds.length === 0) {
      alert('Không tìm thấy kịch bản nào đang ở trạng thái Bỏ qua (Skip) trong hệ thống.');
      return;
    }

    const confirmMsg = `⚠️ PHÁT HIỆN ${skippedIds.length} TEST CASE ĐANG BỎ QUA (SKIP):\n\nCác kịch bản này không còn phù hợp với hệ thống SmartVMS Local hiện tại.\n\nBạn có chắc chắn muốn XÓA BỎ VĨNH VIỄN toàn bộ ${skippedIds.length} ca này khỏi danh mục kịch bản và báo cáo?`;
    if (!confirm(confirmMsg)) return;

    const prj = window.state?.projects?.[0];
    if (prj && Array.isArray(prj.testCases)) {
      prj.testCases = prj.testCases.filter(t => !skippedIds.includes(t.id));
    }

    // Cập nhật cycle testCaseIds
    if (window.state?.testCycles?.[0]?.testCaseIds) {
      window.state.testCycles[0].testCaseIds = window.state.testCycles[0].testCaseIds.filter(id => !skippedIds.includes(id));
    }

    // Cập nhật assignments
    if (Array.isArray(window.state?.assignments)) {
      window.state.assignments = window.state.assignments.filter(a => !skippedIds.includes(a.tcId));
    }

    // Xóa khỏi results
    skippedIds.forEach(id => {
      delete window.state.results[id];
      if (window.state.cycleResults) {
        Object.keys(window.state.cycleResults).forEach(cId => {
          delete window.state.cycleResults[cId]?.[id];
        });
      }
    });

    window.state.isCustomCatalog = true;

    // Xóa khỏi Supabase Database nếu có client
    if (window.supabaseClient || window.cloudState?.client) {
      const client = window.supabaseClient || window.cloudState?.client;
      try {
        await client.from('test_results').delete().in('tc_id', skippedIds);
        console.log(`⚡ [Supabase Cloud] Đã xóa ${skippedIds.length} bản ghi Skip khỏi Cloud database.`);
      } catch (err) {
        console.warn('Lỗi xóa Skip trên Supabase:', err);
      }
    }

    // Lưu Core State
    if (typeof window.saveCoreState === 'function') {
      window.saveCoreState();
    }

    // Tự động lưu ra LAN server
    if (prj?.testCases) {
      saveCatalogToLanServer(prj.testCases);
    }

    refreshAllActiveScreens();

    const remainingCount = prj?.testCases?.length || 0;
    const msg = `🗑️ Đã xóa bỏ thành công ${skippedIds.length} kịch bản Bỏ qua! Hệ thống còn lại ${remainingCount} kịch bản chuẩn hóa thực tế.`;
    alert(msg);
    if (window.showToast) window.showToast(msg, 'success');
  }

  // Helper gửi catalog lên server LAN nội bộ
  function saveCatalogToLanServer(tcs) {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCases: tcs })
      }).then(res => res.json())
        .then(data => console.log('⚡ [LAN Server] Đã lưu danh mục kịch bản vào tệp dữ liệu máy chủ:', data))
        .catch(() => {});
    }
  }

  // Helper refresh tất cả các màn hình đang mở
  function refreshAllActiveScreens() {
    try {
      if (typeof window.renderTestcasesTable === 'function') window.renderTestcasesTable();
      if (typeof window.renderMyTasks === 'function') window.renderMyTasks();
      if (typeof window.renderSummaryMatrix === 'function') window.renderSummaryMatrix();
      if (typeof window.initReportsModule === 'function') window.initReportsModule();
      if (typeof window.renderAssignmentsTable === 'function') window.renderAssignmentsTable();
      if (typeof window.filterExecList === 'function') window.filterExecList();
      if (typeof window.renderDefectList === 'function') window.renderDefectList();
      window.dispatchEvent(new CustomEvent('smartvms:catalog-updated'));
    } catch (e) {
      console.warn('Lỗi refresh UI:', e);
    }
  }

  // Export toàn cục
  window.downloadExcelTemplate = downloadExcelTemplate;
  window.exportCatalogToExcel = exportCatalogToExcel;
  window.importCatalogFromExcel = importCatalogFromExcel;
  window.importCatalogFromJson = importCatalogFromJson;
  window.importCatalogJson = importCatalogFromJson;
  window.exportCatalogJson = exportCatalogJson;
  window.deleteSkippedTestCases = deleteSkippedTestCases;

})(window);
