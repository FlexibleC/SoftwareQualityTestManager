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
      if (typeof window.XLSX !== 'undefined') return resolve(true);
      const script = document.createElement('script');
      script.src = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/tester/') || window.location.pathname.includes('/dev/')
        ? '../shared/js/vendor/xlsx.full.min.js'
        : 'shared/js/vendor/xlsx.full.min.js';
      script.onload = () => resolve(typeof window.XLSX !== 'undefined');
      script.onerror = () => {
        const cdn = document.createElement('script');
        cdn.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        cdn.onload = () => resolve(typeof window.XLSX !== 'undefined');
        cdn.onerror = () => resolve(false);
        document.head.appendChild(cdn);
      };
      document.head.appendChild(script);
    });
  }

  // Ensure ExcelJS is available for rich formatting
  function ensureExcelJsLoaded() {
    return new Promise((resolve) => {
      if (typeof window.ExcelJS !== 'undefined') return resolve(true);
      const script = document.createElement('script');
      script.src = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/tester/') || window.location.pathname.includes('/dev/')
        ? '../shared/js/vendor/exceljs.min.js'
        : 'shared/js/vendor/exceljs.min.js';
      script.onload = () => resolve(typeof window.ExcelJS !== 'undefined');
      script.onerror = () => {
        const cdn = document.createElement('script');
        cdn.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
        cdn.onload = () => resolve(typeof window.ExcelJS !== 'undefined');
        cdn.onerror = () => resolve(false);
        document.head.appendChild(cdn);
      };
      document.head.appendChild(script);
    });
  }

  const MODULE_DISPLAY_NAMES = {
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

  const PRIORITY_COLOR_MAP = {
    'P1': { bg: 'FFFEE2E2', text: 'FFDC2626', label: '🔴 P1 - Critical' },
    'P2': { bg: 'FFFFEDD5', text: 'FFEA580C', label: '🟠 P2 - Important' },
    'P3': { bg: 'FFFEF3C7', text: 'FFD97706', label: '🟡 P3 - Medium' },
    'P4': { bg: 'FFF1F5F9', text: 'FF475569', label: '🟢 P4 - Low' }
  };

  const STATUS_COLOR_MAP = {
    'Pass': { bg: 'FFDCFCE7', text: 'FF16A34A', label: '✅ ĐẠT (Pass)' },
    'Fail': { bg: 'FFFEE2E2', text: 'FFDC2626', label: '❌ LỖI (Fail)' },
    'Skip': { bg: 'FFFEF3C7', text: 'FFD97706', label: '⏭ BỎ QUA (Skip)' },
    'Not Run': { bg: 'FFF1F5F9', text: 'FF64748B', label: '⏳ Chưa chạy' }
  };

  // 1. TẢI FILE MẪU EXCEL CHUẨN ĐẸP (.xlsx)
  async function downloadExcelTemplate() {
    // Nếu chạy qua Web HTTP, ưu tiên tải file mẫu đã tạo sẵn trên server
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const candidates = [
        { url: '../data/SmartVMS_157_KichBan_ChuaTest.xlsx', name: 'SmartVMS_157_KichBan_ChuaTest.xlsx' },
        { url: 'data/SmartVMS_157_KichBan_ChuaTest.xlsx', name: 'SmartVMS_157_KichBan_ChuaTest.xlsx' },
        { url: '../data/SmartVMS_157_KichBan_ChuanHoa.xlsx', name: 'SmartVMS_157_KichBan_ChuanHoa.xlsx' },
        { url: 'data/SmartVMS_157_KichBan_ChuanHoa.xlsx', name: 'SmartVMS_157_KichBan_ChuanHoa.xlsx' },
        { url: '../data/SmartVMS_Mau_KichBan_KiemThu.xlsx', name: 'SmartVMS_157_KichBan_ChuaTest.xlsx' },
        { url: 'data/SmartVMS_Mau_KichBan_KiemThu.xlsx', name: 'SmartVMS_157_KichBan_ChuaTest.xlsx' }
      ];

      for (const item of candidates) {
        try {
          const res = await fetch(item.url);
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (window.showToast) window.showToast('📑 Đã tải file 157 kịch bản kiểm thử chuẩn hóa (.xlsx)!', 'success');
            return;
          }
        } catch (e) {}
      }
    }

    // Nếu chạy file:/// hoặc fetch không được, xuất bằng ExcelJS
    await exportCatalogToExcel({ isTemplateOnly: true });
  }

  // 2. XUẤT TOÀN BỘ KỊCH BẢN HIỆN TẠI RA FILE EXCEL ĐẸP, CHUYÊN NGHIỆP (.xlsx)
  async function exportCatalogToExcel(opts = {}) {
    const isTpl = opts.isTemplateOnly === true;
    const ok = await ensureExcelJsLoaded();
    if (!ok || typeof window.ExcelJS === 'undefined') {
      // Fallback to basic XLSX if ExcelJS fails to load
      return exportCatalogToExcelFallback(isTpl);
    }

    const tcs = isTpl
      ? [
          {
            id: 'TC-AUTH-001', module: 'M01', name: 'Đăng nhập Trạm gác hợp lệ bằng tài khoản trạm (Không mật khẩu)',
            priority: 'P1', type: 'Chức năng', suite: 'SMOKE', platform: 'Giao diện Web Trực ban',
            precondition: 'Hệ thống SmartVMS Local hoạt động. Trạm gác B01 đã kích hoạt.', testData: 'Tên trạm: "B01"',
            steps: ['1. Mở trang đăng nhập trạm (/staff.html)', '2. Nhập mã bốt: B01 và bấm Đăng nhập'],
            expected: ['• Tự động chuẩn hóa chữ hoa B01', '• Mở ca trực thành công và lưu Token'],
            notes: 'Không yêu cầu mật khẩu'
          },
          {
            id: 'TC-CKIN-001', module: 'M02', name: 'Tiếp đón khách đơn có quét thẻ CCCD gắn chip',
            priority: 'P1', type: 'Chức năng', suite: 'REGRESSION', platform: 'Giao diện Web Trực ban',
            precondition: 'Thiết bị đọc thẻ CCCD kết nối online.', testData: 'Thẻ CCCD thử nghiệm hợp lệ',
            steps: ['1. Đặt thẻ CCCD lên máy đọc', '2. Bấm Đọc thẻ CCCD', '3. Mục đích vào làm việc mặc định là "Liên hệ công việc."', '4. Bấm Check-in'],
            expected: ['• Điền tự động thông tin khách và ảnh CCCD', '• Tạo lượt viếng thăm hợp lệ'],
            notes: 'Mục đích mặc định: Liên hệ công việc.'
          }
        ]
      : ((typeof window.getAllTcs === 'function') ? window.getAllTcs() : (window.state?.projects?.[0]?.testCases || []));

    if (!tcs || tcs.length === 0) {
      alert('Chưa có kịch bản kiểm thử nào trong hệ thống để xuất.');
      return;
    }

    const results = window.state?.results || {};
    const FONT_NAME = 'Segoe UI';

    const wb = new window.ExcelJS.Workbook();
    wb.creator = 'SmartVMS QA Automation Hub';
    wb.created = new Date();

    // Sheet 1: Kịch bản kiểm thử
    const sheetTitle = isTpl ? 'Mau_KichBan' : '📋 Danh Mục Kịch Bản';
    const ws = wb.addWorksheet(sheetTitle, {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 4, showGridLines: true }],
      properties: { tabColor: { argb: 'FF2563EB' } }
    });

    // Row 1: Banner Header
    ws.mergeCells('A1:N1');
    const r1 = ws.getCell('A1');
    r1.value = isTpl
      ? '📑 SMARTVMS LOCAL SINGLESITE — FILE MẪU NHẬP LIỆU KỊCH BẢN KIỂM THỬ (ISO 29119-3)'
      : `🎯 SMARTVMS LOCAL SINGLESITE 2026 — DANH MỤC KỊCH BẢN KIỂM THỬ CHUẨN HÓA (${tcs.length} TCs)`;
    r1.font = { name: FONT_NAME, size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    r1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.getRow(1).height = 36;

    // Row 2: Subtitle
    ws.mergeCells('A2:N2');
    const r2 = ws.getCell('A2');
    r2.value = '📋 Tiêu chuẩn: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010 | Đơn vị: SmartVMS QA Hub | Ngày xuất: ' + new Date().toLocaleDateString('vi-VN');
    r2.font = { name: FONT_NAME, size: 10, color: { argb: 'FFE2E8F0' } };
    r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    r2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.getRow(2).height = 24;

    // Row 3: Spacer
    ws.getRow(3).height = 8;

    // Row 4: Column Headers
    const headers = [
      'STT', 'Mã Test Case (*)', 'Phân hệ (Module) (*)', 'Tiêu đề kịch bản (*)',
      'Mức ưu tiên', 'Loại kiểm thử', 'Bộ kịch bản', 'Nền tảng',
      'Điều kiện tiên quyết (Preconditions)', 'Dữ liệu kiểm thử (Test Data)',
      'Quy trình các bước (Test Steps)', 'Kết quả kỳ vọng (Expected Results)',
      'Trạng thái Test', 'Ghi chú kỹ thuật'
    ];

    const hRow = ws.getRow(4);
    hRow.height = 30;
    headers.forEach((h, idx) => {
      const cell = hRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: FONT_NAME, size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.alignment = {
        vertical: 'middle',
        horizontal: [1, 2, 5, 6, 7, 8, 13].includes(idx + 1) ? 'center' : 'left',
        wrapText: true
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        left: { style: 'thin', color: { argb: 'FF3B82F6' } },
        right: { style: 'thin', color: { argb: 'FF3B82F6' } }
      };
    });

    ws.autoFilter = { from: 'A4', to: 'N4' };

    // Border template for data cells
    const cellBorder = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };

    // Populate Rows
    tcs.forEach((tc, idx) => {
      const rowIdx = idx + 5;
      const row = ws.getRow(rowIdx);
      const isOdd = idx % 2 === 1;
      const baseBg = isOdd ? 'FFF8FAFC' : 'FFFFFFFF';

      let stepsText = Array.isArray(tc.steps) ? tc.steps.join('\n') : String(tc.steps || '');
      let expectedText = Array.isArray(tc.expected) ? tc.expected.join('\n') : String(tc.expected || '');

      const res = results[tc.id];
      const curStatus = res ? res.status : (tc.status || 'Not Run');
      const prioKey = (tc.priority || 'P2').trim().toUpperCase();
      const prioCfg = PRIORITY_COLOR_MAP[prioKey] || PRIORITY_COLOR_MAP['P2'];
      const statCfg = STATUS_COLOR_MAP[curStatus] || STATUS_COLOR_MAP['Pass'];
      const modName = MODULE_DISPLAY_NAMES[tc.module] || tc.module || 'M01';

      row.getCell(1).value = idx + 1;
      row.getCell(2).value = tc.id;
      row.getCell(3).value = modName;
      row.getCell(4).value = tc.name || tc.title || '';
      row.getCell(5).value = prioCfg.label;
      row.getCell(6).value = tc.type || 'Chức năng';
      row.getCell(7).value = tc.suite || 'REGRESSION';
      row.getCell(8).value = tc.platform || 'Giao diện Web Trực ban';
      row.getCell(9).value = tc.precondition || '';
      row.getCell(10).value = tc.testData || '';
      row.getCell(11).value = stepsText;
      row.getCell(12).value = expectedText;
      row.getCell(13).value = statCfg.label;
      row.getCell(14).value = tc.notes || '';

      const stepLines = (stepsText.match(/\n/g) || []).length + 1;
      const expLines = (expectedText.match(/\n/g) || []).length + 1;
      row.height = Math.min(Math.max(Math.max(stepLines, expLines) * 18, 40), 160);

      for (let c = 1; c <= 14; c++) {
        const cell = row.getCell(c);
        cell.border = cellBorder;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseBg } };

        if (c === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: FONT_NAME, size: 9.5, bold: true, color: { argb: 'FF64748B' } };
        } else if (c === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
        } else if (c === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          cell.font = { name: FONT_NAME, size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
        } else if (c === 4) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FF0F172A' } };
        } else if (c === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: prioCfg.bg } };
          cell.font = { name: FONT_NAME, size: 9, bold: true, color: { argb: prioCfg.text } };
        } else if ([6, 7, 8].includes(c)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.font = { name: FONT_NAME, size: 9, color: { argb: 'FF334155' } };
        } else if (c === 9 || c === 10) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.font = { name: c === 10 ? 'Consolas' : FONT_NAME, size: 9, color: { argb: 'FF334155' } };
        } else if (c === 11) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FF0F172A' } };
        } else if (c === 12) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FF15803D' } };
        } else if (c === 13) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statCfg.bg } };
          cell.font = { name: FONT_NAME, size: 9.5, bold: true, color: { argb: statCfg.text } };
        } else if (c === 14) {
          cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
          cell.font = { name: FONT_NAME, size: 9, italic: true, color: { argb: 'FF64748B' } };
        }
      }
    });

    ws.columns = [
      { key: 'stt', width: 7 },
      { key: 'id', width: 16 },
      { key: 'module', width: 34 },
      { key: 'title', width: 44 },
      { key: 'priority', width: 17 },
      { key: 'type', width: 16 },
      { key: 'suite', width: 17 },
      { key: 'platform', width: 22 },
      { key: 'precondition', width: 38 },
      { key: 'testData', width: 34 },
      { key: 'steps', width: 62 },
      { key: 'expected', width: 62 },
      { key: 'status', width: 18 },
      { key: 'notes', width: 32 }
    ];

    // Download in browser
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isTpl
      ? 'SmartVMS_Mau_KichBan_KiemThu.xlsx'
      : `SmartVMS_KichBan_KiemThu_${tcs.length}TCs_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast(`📊 Đã xuất thành công ${tcs.length} kịch bản sang file Excel chuẩn đẹp!`, 'success');
    }
  }

  // Fallback function using basic XLSX if ExcelJS is unavailable
  function exportCatalogToExcelFallback(isTpl) {
    const tcs = (typeof window.getAllTcs === 'function') ? window.getAllTcs() : (window.state?.projects?.[0]?.testCases || []);
    const results = window.state?.results || {};
    const rows = tcs.map((t, idx) => ({
      'STT': idx + 1,
      'Mã Test Case (*)': t.id,
      'Phân hệ (*)': t.module || 'M01',
      'Tiêu đề kịch bản (*)': t.name || t.title || '',
      'Mức ưu tiên': t.priority || 'P2',
      'Loại kiểm thử': t.type || 'Chức năng',
      'Bộ kịch bản': t.suite || 'REGRESSION',
      'Nền tảng': t.platform || 'Web Trực ban',
      'Mã SRS': t.reqId || '',
      'Điều kiện tiên quyết': t.precondition || '',
      'Dữ liệu kiểm thử': t.testData || '',
      'Các bước thực hiện': Array.isArray(t.steps) ? t.steps.join('\n') : (t.steps || ''),
      'Kết quả kỳ vọng': Array.isArray(t.expected) ? t.expected.join('\n') : (t.expected || ''),
      'Ghi chú': t.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhMuc_KichBan');
    XLSX.writeFile(wb, `SmartVMS_KichBan_KiemThu_${tcs.length}TCs.xlsx`);
  }

  // 3. NẠP KỊCH BẢN TỪ FILE EXCEL (.xlsx / .xls) VỚI TỰ ĐỘNG PHÁT HIỆN DÒNG TIÊU ĐỀ
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

        // Tự động tìm vị trí hàng tiêu đề (bỏ qua banner tiêu đề lớn ở các dòng đầu)
        const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        let headerRowIndex = aoa.findIndex(r => Array.isArray(r) && r.some(c => /Mã\s*(Test\s*Case|TC)|ID/i.test(String(c))));
        if (headerRowIndex === -1) headerRowIndex = 0;

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: '' });

        if (!rawRows || rawRows.length === 0) {
          alert('File Excel không có dữ liệu kịch bản!');
          return;
        }

        const parsedTcs = [];
        rawRows.forEach((row) => {
          const id = String(row['Mã Test Case'] || row['Mã Test Case (*)'] || row['Mã TC'] || row['ID'] || row['id'] || row['tc_id'] || '').trim();
          const title = String(row['Tiêu đề kịch bản'] || row['Tiêu đề kịch bản (*)'] || row['Tên kịch bản'] || row['Tiêu đề'] || row['Title'] || row['name'] || '').trim();
          if (!id || !title) return;

          let module = String(row['Phân hệ'] || row['Phân hệ (*)'] || row['Phân hệ (Module) (*)'] || row['Module'] || 'M01').trim();
          const modMatch = module.match(/M\d+/i);
          if (modMatch) module = modMatch[0].toUpperCase();

          let priority = String(row['Mức ưu tiên'] || row['Ưu tiên'] || row['Priority'] || 'P2').trim();
          const pMatch = priority.match(/P[1-4]/i);
          if (pMatch) priority = pMatch[0].toUpperCase();

          const type = String(row['Loại kiểm thử'] || row['Loại'] || row['Type'] || 'Chức năng').trim();
          const suite = String(row['Bộ kịch bản'] || row['Bộ'] || row['Suite'] || 'REGRESSION').trim();
          const platform = String(row['Nền tảng'] || row['Platform'] || 'Giao diện Web Trực ban').trim();
          const reqId = String(row['Mã SRS'] || row['SRS'] || '').trim();
          const precondition = String(row['Điều kiện tiên quyết'] || row['Điều kiện tiên quyết (Preconditions)'] || row['Tiền điều kiện'] || '').trim();
          const testData = String(row['Dữ liệu kiểm thử'] || row['Dữ liệu kiểm thử (Test Data)'] || row['Dữ liệu'] || '').trim();
          const notes = String(row['Ghi chú'] || row['Ghi chú kỹ thuật'] || '').trim();

          const rawSteps = String(row['Quy trình các bước (Test Steps)'] || row['Các bước thực hiện'] || row['Steps'] || '').trim();
          const steps = rawSteps ? rawSteps.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : ['1. Thực hiện kiểm thử theo quy trình chuẩn.'];

          const rawExpected = String(row['Kết quả kỳ vọng (Expected Results)'] || row['Kết quả kỳ vọng'] || row['Expected'] || '').trim();
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

        const existingCount = window.state?.projects?.[0]?.testCases?.length || 0;
        if (existingCount > 0 && typeof window.confirm === 'function') {
          const confirmMsg = `📊 Tìm thấy ${parsedTcs.length} kịch bản kiểm thử hợp lệ trong file Excel [${file.name}].\n\nBạn có muốn nạp vào hệ thống để thay thế toàn bộ danh mục kịch bản hiện tại?`;
          if (!confirm(confirmMsg)) {
            fileInput.value = '';
            return;
          }
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

        const existingCount = window.state?.projects?.[0]?.testCases?.length || 0;
        if (existingCount > 0 && typeof window.confirm === 'function') {
          if (!confirm(`Tìm thấy ${validTcs.length} kịch bản kiểm thử từ tệp JSON. Bạn có muốn nạp vào hệ thống?`)) {
            fileInput.value = '';
            return;
          }
        }

        applyImportedCatalog(validTcs, `JSON: ${file.name}`);
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

    const modIds = [...new Set(newTcs.map(t => t.module || 'M01'))].sort();
    const defaultModules = modIds.map(mId => ({
      id: mId,
      name: MODULE_DISPLAY_NAMES[mId] || `Phân hệ ${mId}`,
      versions: ['v1.0', 'v1.0.0']
    }));

    if (!window.state.projects || window.state.projects.length === 0) {
      const cleanFileName = sourceName.replace(/^(Excel|JSON):\s*/i, '').replace(/\.[^/.]+$/, '').trim() || 'SmartVMS SingleSite';
      const cleanCode = 'PRJ-SMARTVMS';
      const newProj = {
        id: cleanCode,
        code: 'SMARTVMS',
        name: cleanFileName.includes('SmartVMS') ? cleanFileName : 'SmartVMS Local SingleSite 2026',
        domain: 'Quản lý Khách & Ra vào',
        lead: window.state?.currentUser?.name || 'Nguyễn Văn Huy (QA Lead)',
        standards: ['ISO 9001:2015', 'ISO/IEC/IEEE 29119', 'ISO/IEC 25010'],
        activeVersion: 'v1.0.0',
        versions: [{ version: 'v1.0.0', label: 'v1.0.0-Base', status: 'IN_QA' }],
        modules: defaultModules,
        testCases: newTcs
      };
      window.state.projects = [newProj];
      window.state.activeProjectId = newProj.id;
      if (window.pushProjectsToCloud) window.pushProjectsToCloud(window.state.projects);
    } else {
      const prj = window.state.projects.find(p => p.id === window.state.activeProjectId) || window.state.projects[0];
      prj.testCases = newTcs;
      if (!prj.modules || prj.modules.length === 0) {
        prj.modules = defaultModules;
      }
      if (window.pushProjectsToCloud) window.pushProjectsToCloud(window.state.projects);
    }

    // Đánh dấu rõ ràng là danh mục do người dùng nạp (không dùng nạp đè bằng file code cứng)
    window.state.isCleanProjectState = false;
    window.state.isCustomCatalog = true;
    window.state.catalogSource = sourceName;
    window.state.catalogUpdatedAt = new Date().toISOString();

    // Cập nhật Test Cycle
    const allIds = newTcs.map(t => t.id);
    const curPId = window.state.activeProjectId || 'PRJ-NEW';
    if (!window.state.testCycles || window.state.testCycles.length === 0) {
      window.state.testCycles = [{
        id: `CYC-${curPId.replace('PRJ-', '')}-01`,
        code: 'DOT-1',
        name: `Đợt 1 — ${sourceName}`,
        projectId: curPId,
        version: 'v1.0',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: 'ACTIVE',
        targetSuite: 'REGRESSION',
        testCaseIds: allIds,
        description: `Đợt kiểm thử nạp từ ${sourceName} (${newTcs.length} ca kiểm thử)`
      }];
      window.state.activeCycleId = window.state.testCycles[0].id;
    } else {
      window.state.testCycles[0].testCaseIds = allIds;
    }
    if (window.pushCyclesToCloud) window.pushCyclesToCloud(window.state.testCycles);

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

    // Tự động lưu và đồng bộ toàn bộ kịch bản lên Supabase Cloud Database (Single Source of Truth)
    if (window.pushCatalogToCloud && typeof window.pushCatalogToCloud === 'function') {
      window.pushCatalogToCloud(newTcs);
    }

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
      if (typeof window.initTestcasesModule === 'function') window.initTestcasesModule();
      if (typeof window.renderTestcasesTable === 'function') window.renderTestcasesTable();
      if (typeof window.renderMyTasks === 'function') window.renderMyTasks();
      if (typeof window.renderSummaryMatrix === 'function') window.renderSummaryMatrix();
      if (typeof window.initReportsModule === 'function') window.initReportsModule();
      if (typeof window.renderAssignmentsTable === 'function') window.renderAssignmentsTable();
      if (typeof window.filterExecList === 'function') window.filterExecList();
      if (typeof window.renderDefectList === 'function') window.renderDefectList();
      if (typeof window.renderAdminOverview === 'function') window.renderAdminOverview();
      if (typeof window.renderProjectsTab === 'function') window.renderProjectsTab();
      window.dispatchEvent(new CustomEvent('smartvms:catalog-updated'));
    } catch (e) {
      console.warn('Lỗi refresh UI:', e);
    }
  }

  // 7. XÓA TRẮNG TOÀN BỘ CÁC DỰ ÁN VÀ DỮ LIỆU (WIPE ALL PROJECTS & DATA)
  async function wipeProjectData(skipConfirm = false) {
    if (!skipConfirm) {
      const ok = confirm(
        '⚠️ CẢNH BÁO: BẠN CÓ CHẮC CHẮN MUỐN XÓA TRẮNG TOÀN BỘ CÁC DỰ ÁN?\n\n' +
        '• Toàn bộ danh mục Dự án sẽ bị xóa sạch về 0 (sẵn sàng tạo dự án từ đầu).\n' +
        '• Toàn bộ kịch bản kiểm thử (Test Cases) sẽ được xóa sạch về 0.\n' +
        '• Toàn bộ kết quả chấm (Pass, Fail, Skip, Bằng chứng ảnh) sẽ bị xóa.\n' +
        '• Toàn bộ phân công kiểm thử và lịch sử sẽ được làm sạch.\n' +
        '• Cơ sở dữ liệu Supabase Cloud cũng sẽ được đồng bộ làm sạch 100%.\n\n' +
        'Hệ thống sẽ chuyển về trạng thái sạch (0 dự án, 0 kịch bản) để bạn tạo dự án mới từ đầu.\n\n' +
        'Nhấn OK để xóa trắng ngay bây giờ.'
      );
      if (!ok) return false;
    }

    if (!window.state) window.state = {};
    window.state.projects = [];
    window.state.activeProjectId = null;
    window.state.isCleanProjectState = true;
    window.state.isCustomCatalog = true;
    window.state.catalogSource = 'Clean Slate (Xóa trắng)';
    window.state.catalogUpdatedAt = new Date().toISOString();

    window.state.results = {};
    window.state.cycleResults = {};
    window.state.assignments = [];
    window.state.executionLogs = [];
    window.state.adhocDefects = [];
    window.state.comments = {};
    window.state.testCycles = [];

    // Xóa sạch localStorage trình duyệt (giữ lại người dùng smartvms_system_users_v3)
    try {
      localStorage.removeItem('smartvms_qa_hub_state_v3');
      localStorage.setItem('sqtm_enterprise_projects_v3', '[]');
      localStorage.removeItem('sqtm_active_project_id_v3');
      localStorage.setItem('smartvms_test_cycles_v3', '[]');
      localStorage.removeItem('smartvms_session_projects');
      localStorage.removeItem('smartvms_active_project_id');
      localStorage.removeItem('smartvms_adhoc_defects_v3');
      sessionStorage.setItem('sqtm_enterprise_projects_v3', '[]');
      sessionStorage.removeItem('sqtm_active_project_id_v3');
      sessionStorage.setItem('smartvms_test_cycles_v3', '[]');
      sessionStorage.removeItem('smartvms_session_projects');
      sessionStorage.removeItem('smartvms_active_project_id');
    } catch (e) {}

    // Lưu Core State
    if (typeof window.saveCoreState === 'function') {
      window.saveCoreState();
    }

    // Làm sạch Cloud Database 100%
    if (window.wipeCloudProjectData && typeof window.wipeCloudProjectData === 'function') {
      try {
        await window.wipeCloudProjectData();
      } catch (err) {
        console.warn('Lỗi làm sạch Cloud Supabase:', err);
      }
    }

    // Gửi catalog rỗng lên server LAN nếu đang chạy
    saveCatalogToLanServer([]);
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      fetch('/api/sync', { method: 'DELETE' }).catch(() => {});
    }

    // Refresh UI mọi trang đang mở
    refreshAllActiveScreens();

    const msg = '🧹 ĐÃ XÓA TRẮNG TOÀN BỘ CÁC DỰ ÁN VÀ DỮ LIỆU!\nHệ thống và Database Cloud hiện đã sạch 100% (0 dự án, 0 kịch bản, 0 kết quả). Bạn có thể tạo dự án mới từ đầu ngay bây giờ.';
    if (!skipConfirm) alert(msg);
    if (window.showToast) window.showToast(msg, 'success');
    return true;
  }

  // Export toàn cục
  window.downloadExcelTemplate = downloadExcelTemplate;
  window.exportCatalogToExcel = exportCatalogToExcel;
  window.importCatalogFromExcel = importCatalogFromExcel;
  window.importCatalogFromJson = importCatalogFromJson;
  window.importCatalogJson = importCatalogFromJson;
  window.exportCatalogJson = exportCatalogJson;
  window.deleteSkippedTestCases = deleteSkippedTestCases;
  window.wipeProjectData = wipeProjectData;

})(window);

