const fs = require('fs');
const path = require('path');
const cp = require('child_process');

let ExcelJS;
try {
  ExcelJS = require('exceljs');
} catch (e) {
  try {
    ExcelJS = require('D:/DevSoft/SmartVMS-LocalSinglesite/Web/node_modules/exceljs');
  } catch (err) {
    console.warn('Vui lòng cài đặt exceljs (npm i exceljs) để chạy script xuất file Excel.');
  }
}

// 1. Extract the full 214 test case catalog from git history
console.log('Reading 214 test cases from git history...');
const rawGitData = cp.execSync('git show da31ebe:data/smartvms_test_catalog.json', {
  maxBuffer: 15 * 1024 * 1024,
  encoding: 'utf8'
});
const catalog = JSON.parse(rawGitData);
const allTcs = catalog.testCases;

// Module Dictionary
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

// 157 Active Test Cases distribution across 12 modules
const MODULE_ACTIVE_LIMITS = {
  'M01': 14,
  'M02': 17,
  'M03': 14,
  'M04': 13,
  'M05': 13,
  'M06': 13,
  'M07': 18,
  'M08': 16,
  'M09': 13,
  'M10': 13,
  'M11': 7,
  'M12': 6
};

// Filter exactly 157 active test cases
const activeTcs = [];
const skippedTcs = [];
const countsByMod = {};

allTcs.forEach(tc => {
  const mod = tc.module || 'M01';
  countsByMod[mod] = (countsByMod[mod] || 0) + 1;
  const limit = MODULE_ACTIVE_LIMITS[mod] || 999;
  if (countsByMod[mod] <= limit) {
    activeTcs.push({
      ...tc,
      // Đảm bảo trạng thái chưa test
      status: 'Not Run',
      actualResult: '',
      failReason: '',
      isCustom: true
    });
  } else {
    skippedTcs.push(tc);
  }
});

console.log(`Đã trích xuất thành công: ${activeTcs.length} kịch bản chuẩn (chưa test), loại bỏ ${skippedTcs.length} ca cũ.`);

// Typography & Styles
const FONT_NAME = 'Segoe UI';

const BORDER_THIN = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};

const BORDER_HEADER = {
  top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
  left: { style: 'thin', color: { argb: 'FF3B82F6' } },
  bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
  right: { style: 'thin', color: { argb: 'FF3B82F6' } }
};

const PRIORITY_STYLES = {
  'P1': { bg: 'FFFEE2E2', text: 'FFDC2626', label: '🔴 P1 - Critical' },
  'P2': { bg: 'FFFFEDD5', text: 'FFEA580C', label: '🟠 P2 - Important' },
  'P3': { bg: 'FFFEF3C7', text: 'FFD97706', label: '🟡 P3 - Medium' },
  'P4': { bg: 'FFF1F5F9', text: 'FF475569', label: '🟢 P4 - Low' }
};

async function generateExcel() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SmartVMS QA Hub - Deep Research Team';
  wb.lastModifiedBy = 'Admin QA Lead';
  wb.created = new Date();
  wb.modified = new Date();

  // =========================================================================
  // SHEET 1: DANH MỤC 157 KỊCH BẢN CHUẨN HÓA (CHƯA TEST)
  // (Sheet đầu tiên để bộ đọc Excel của trang Web nạp trực tiếp)
  // =========================================================================
  const ws1 = wb.addWorksheet('Kịch Bản Kiểm Thử (157 TCs)', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 4, showGridLines: true }],
    properties: { tabColor: { argb: 'FF2563EB' } }
  });

  // Row 1: Banner Header
  ws1.mergeCells('A1:N1');
  const r1 = ws1.getCell('A1');
  r1.value = '🎯 SMARTVMS LOCAL SINGLESITE 2026 — DANH MỤC 157 KỊCH BẢN KIỂM THỬ CHUẨN HÓA (CHƯA KIỂM THỬ)';
  r1.font = { name: FONT_NAME, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  r1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws1.getRow(1).height = 36;

  // Row 2: Subtitle Metadata
  ws1.mergeCells('A2:N2');
  const r2 = ws1.getCell('A2');
  r2.value = '📋 Chuẩn mực: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010 | Quy mô: 12 Phân hệ | Tổng số: 157 Kịch bản | Trạng thái ban đầu: ⏳ Chưa chạy (100% Sẵn sàng kiểm thử)';
  r2.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FFE2E8F0' } };
  r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  r2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws1.getRow(2).height = 24;

  // Row 3: Spacer
  ws1.getRow(3).height = 8;

  // Row 4: Column Headers
  const headers = [
    'STT',
    'Mã Test Case (*)',
    'Phân hệ (Module) (*)',
    'Tiêu đề kịch bản (*)',
    'Mức ưu tiên',
    'Loại kiểm thử',
    'Bộ kịch bản',
    'Nền tảng',
    'Điều kiện tiên quyết (Preconditions)',
    'Dữ liệu kiểm thử (Test Data)',
    'Quy trình các bước (Test Steps)',
    'Kết quả kỳ vọng (Expected Results)',
    'Trạng thái Test',
    'Ghi chú kỹ thuật'
  ];

  const headerRow = ws1.getRow(4);
  headerRow.height = 30;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: [1, 2, 5, 6, 7, 8, 13].includes(idx + 1) ? 'center' : 'left',
      wrapText: true
    };
    cell.border = BORDER_HEADER;
  });

  ws1.autoFilter = { from: 'A4', to: 'N4' };

  // Data Rows
  activeTcs.forEach((tc, idx) => {
    const rowIdx = idx + 5;
    const row = ws1.getRow(rowIdx);
    const isOdd = idx % 2 === 1;
    const baseBg = isOdd ? 'FFF8FAFC' : 'FFFFFFFF';

    // Steps formatting
    let stepsText = '';
    if (Array.isArray(tc.steps)) {
      stepsText = tc.steps.map((s, i) => {
        const clean = s.replace(/^\d+[\.\)]\s*/, '').trim();
        return `${i + 1}. ${clean}`;
      }).join('\n');
    } else {
      stepsText = String(tc.steps || '');
    }

    // Expected formatting
    let expectedText = '';
    if (Array.isArray(tc.expected)) {
      expectedText = tc.expected.map(e => {
        const clean = e.replace(/^[•\-\*]\s*/, '').trim();
        return `• ${clean}`;
      }).join('\n');
    } else {
      expectedText = String(tc.expected || '');
    }

    const modName = MODULE_NAMES[tc.module] || `${tc.module} - Phân hệ chung`;
    const prioKey = (tc.priority || 'P2').trim().toUpperCase();
    const prioCfg = PRIORITY_STYLES[prioKey] || PRIORITY_STYLES['P2'];

    // Values
    row.getCell(1).value = idx + 1;
    row.getCell(2).value = tc.id;
    row.getCell(3).value = modName;
    row.getCell(4).value = tc.name || tc.title || '';
    row.getCell(5).value = prioCfg.label;
    row.getCell(6).value = tc.type || 'Chức năng';
    row.getCell(7).value = tc.suite || 'REGRESSION';
    row.getCell(8).value = tc.platform || 'Giao diện Web Trực ban';
    row.getCell(9).value = tc.precondition || 'Môi trường SmartVMS Local hoạt động ổn định.';
    row.getCell(10).value = tc.testData || 'Sử dụng dữ liệu mẫu kiểm thử nội bộ.';
    row.getCell(11).value = stepsText;
    row.getCell(12).value = expectedText;
    row.getCell(13).value = '⏳ Chưa chạy'; // 100% UNTESTED
    row.getCell(14).value = tc.notes || '';

    // Estimate row height
    const stepLines = (stepsText.match(/\n/g) || []).length + 1;
    const expLines = (expectedText.match(/\n/g) || []).length + 1;
    const maxLines = Math.max(stepLines, expLines, 2);
    row.height = Math.min(Math.max(maxLines * 18, 40), 160);

    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.border = BORDER_THIN;
      cell.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FF1E293B' } };
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
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.font = { name: FONT_NAME, size: 9.5, bold: true, color: { argb: 'FF64748B' } };
      } else if (c === 14) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        cell.font = { name: FONT_NAME, size: 9, italic: true, color: { argb: 'FF64748B' } };
      }
    }
  });

  ws1.columns = [
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

  // =========================================================================
  // SHEET 2: BẢNG TỔNG HỢP 12 PHÂN HỆ
  // =========================================================================
  const ws2 = wb.addWorksheet('📊 Tổng Hợp 12 Phân Hệ', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF10B981' } }
  });

  ws2.mergeCells('A1:F1');
  const ws2R1 = ws2.getCell('A1');
  ws2R1.value = '📊 BẢNG TỔNG HỢP 157 KỊCH BẢN CHUẨN HÓA THEO 12 PHÂN HỆ NGHIỆP VỤ';
  ws2R1.font = { name: FONT_NAME, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  ws2R1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
  ws2R1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws2.getRow(1).height = 36;

  ws2.mergeCells('A2:F2');
  const ws2R2 = ws2.getCell('A2');
  ws2R2.value = 'Tổng số: 157 kịch bản | 12 Phân hệ hoàn chỉnh | Trạng thái: Chưa kiểm thử (Not Run 157/157 - 100%)';
  ws2R2.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FFD1FAE5' } };
  ws2R2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
  ws2R2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws2.getRow(2).height = 24;

  ws2.getRow(3).height = 8;

  const hNames = ['Mã Phân Hệ', 'Tên Phân Hệ Nghiệp Vụ', 'Tổng Kịch Bản Chuẩn', 'Mức Ưu Tiên P1 (Critical)', 'Mức Ưu Tiên P2 / P3 / P4', 'Trạng Thái'];
  const ws2HRow = ws2.getRow(4);
  ws2HRow.height = 28;
  hNames.forEach((n, i) => {
    const cell = ws2HRow.getCell(i + 1);
    cell.value = n;
    cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
    cell.alignment = { vertical: 'middle', horizontal: i === 1 ? 'left' : 'center' };
    cell.border = BORDER_HEADER;
  });

  let totalP1 = 0;
  let totalOther = 0;

  Object.keys(MODULE_NAMES).forEach((modKey, idx) => {
    const rowIdx = idx + 5;
    const row = ws2.getRow(rowIdx);
    const modTcs = activeTcs.filter(t => t.module === modKey);
    const p1Count = modTcs.filter(t => t.priority === 'P1').length;
    const otherCount = modTcs.length - p1Count;
    totalP1 += p1Count;
    totalOther += otherCount;

    row.getCell(1).value = modKey;
    row.getCell(2).value = MODULE_NAMES[modKey];
    row.getCell(3).value = modTcs.length;
    row.getCell(4).value = p1Count;
    row.getCell(5).value = otherCount;
    row.getCell(6).value = '⏳ Chưa chạy (0/' + modTcs.length + ')';

    row.height = 24;

    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c);
      cell.border = BORDER_THIN;
      cell.font = { name: FONT_NAME, size: 9.5 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 1 ? 'FFF0FDF4' : 'FFFFFFFF' } };
      if (c === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF065F46' } };
      } else if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: FONT_NAME, size: 9.5, bold: true };
      } else if ([3, 4, 5].includes(c)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: FONT_NAME, size: 9.5, bold: c === 3 };
      } else if (c === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: FONT_NAME, size: 9, bold: true, color: { argb: 'FF64748B' } };
      }
    }
  });

  // Total Summary Row
  const totalRowIdx = Object.keys(MODULE_NAMES).length + 5;
  const totRow = ws2.getRow(totalRowIdx);
  totRow.height = 28;
  totRow.getCell(1).value = 'TỔNG CỘNG';
  totRow.getCell(2).value = 'Toàn bộ 12 Phân hệ SmartVMS Local SingleSite';
  totRow.getCell(3).value = activeTcs.length;
  totRow.getCell(4).value = totalP1;
  totRow.getCell(5).value = totalOther;
  totRow.getCell(6).value = '⏳ Chưa chạy (0/157)';

  for (let c = 1; c <= 6; c++) {
    const cell = totRow.getCell(c);
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF065F46' } },
      bottom: { style: 'double', color: { argb: 'FF065F46' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FF065F46' } };
    cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center', indent: c === 2 ? 1 : 0 };
  }

  ws2.columns = [
    { key: 'code', width: 14 },
    { key: 'name', width: 42 },
    { key: 'count', width: 22 },
    { key: 'p1', width: 24 },
    { key: 'other', width: 24 },
    { key: 'status', width: 24 }
  ];

  // =========================================================================
  // SHEET 3: HƯỚNG DẪN IMPORT VÀO HỆ THỐNG
  // =========================================================================
  const ws3 = wb.addWorksheet('📖 Hướng Dẫn Import', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF8B5CF6' } }
  });

  ws3.mergeCells('A1:E1');
  const ws3R1 = ws3.getCell('A1');
  ws3R1.value = '📖 HƯỚNG DẪN NẠP FILE EXCEL VÀO HỆ THỐNG SOFTWARE QUALITY TEST MANAGER';
  ws3R1.font = { name: FONT_NAME, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3R1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
  ws3R1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws3.getRow(1).height = 36;

  const guideSteps = [
    { stt: 'Bước 1', title: 'Truy cập Hệ thống Online', detail: 'Mở trình duyệt truy cập: https://softwarequalitytestmanager.vercel.app/lead/testcases' },
    { stt: 'Bước 2', title: 'Chọn Nạp File Excel', detail: 'Tại góc trên bên phải trang Kịch bản, bấm nút màu xanh "📗 Nhập Excel (.xlsx)" hoặc "Nhập Kịch Bản Từ Excel (.xlsx)".' },
    { stt: 'Bước 3', title: 'Chọn file kịch bản', detail: 'Chọn tệp tin "SmartVMS_157_KichBan_ChuaTest.xlsx" trên máy tính của bạn.' },
    { stt: 'Bước 4', title: 'Xác nhận Nạp', detail: 'Hộp thoại xác nhận sẽ hiển thị: "Tìm thấy 157 kịch bản kiểm thử hợp lệ trong file Excel. Bạn có muốn nạp vào hệ thống?". Chọn "OK" / "Đồng ý".' },
    { stt: 'Bước 5', title: 'Tự động Lưu CSDL Cloud', detail: 'Hệ thống tự động khởi tạo dự án mới, nạp đầy đủ 157 kịch bản và lưu trực tiếp lên cơ sở dữ liệu Supabase Cloud. Toàn bộ các trình duyệt khác sẽ tự động nhận diện dữ liệu mới tức thì.' }
  ];

  guideSteps.forEach((g, idx) => {
    const rowIdx = idx + 3;
    const row = ws3.getRow(rowIdx);
    row.getCell(1).value = g.stt;
    row.getCell(2).value = g.title;
    row.getCell(3).value = g.detail;
    row.height = 30;

    for (let c = 1; c <= 3; c++) {
      const cell = row.getCell(c);
      cell.border = BORDER_THIN;
      cell.font = { name: FONT_NAME, size: 9.5 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 1 ? 'FFF5F3FF' : 'FFFFFFFF' } };
      if (c === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: FONT_NAME, size: 9.5, bold: true, color: { argb: 'FF6D28D9' } };
      } else if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: FONT_NAME, size: 9.5, bold: true, color: { argb: 'FF1E1B4B' } };
      } else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      }
    }
  });

  ws3.columns = [
    { key: 'stt', width: 12 },
    { key: 'title', width: 28 },
    { key: 'detail', width: 85 }
  ];

  // Save paths
  const outPath1 = path.join(__dirname, '../data/SmartVMS_157_KichBan_ChuaTest.xlsx');
  const outPathArtifact = 'C:/Users/admin/.gemini/antigravity-ide/brain/ce2d1662-9c0d-40c3-830b-5787ed2c8600/SmartVMS_157_KichBan_ChuaTest.xlsx';

  await wb.xlsx.writeFile(outPath1);
  console.log(`✅ File Excel đã lưu tại: ${outPath1}`);

  try {
    await wb.xlsx.writeFile(outPathArtifact);
    console.log(`✅ File Excel đã copy vào artifact: ${outPathArtifact}`);
  } catch (e) {
    console.warn('Không thể copy vào artifact:', e.message);
  }

  // =========================================================================
  // TẠO THÊM FILE JSON ĐỂ NGƯỜI DÙNG CÓ THỂ NẠP BẰNG NÚT "NẠP JSON"
  // =========================================================================
  const jsonCatalog = {
    schema: 'https://smartvms.local/schemas/test-catalog-v4.json',
    title: 'SmartVMS Local SingleSite 2026 — 157 Kịch Bản Kiểm Thử Chuẩn Hóa (Chưa Test)',
    version: '4.0.0-Clean',
    totalTestCases: activeTcs.length,
    activeTestCases: activeTcs.length,
    skippedTestCases: 0,
    exportedAt: new Date().toISOString(),
    status: 'NOT_TESTED',
    modules: catalog.modules || [],
    testCases: activeTcs
  };

  const jsonOutPath1 = path.join(__dirname, '../data/SmartVMS_157_KichBan_ChuaTest.json');
  const jsonOutArtifact = 'C:/Users/admin/.gemini/antigravity-ide/brain/ce2d1662-9c0d-40c3-830b-5787ed2c8600/SmartVMS_157_KichBan_ChuaTest.json';

  fs.writeFileSync(jsonOutPath1, JSON.stringify(jsonCatalog, null, 2), 'utf8');
  console.log(`✅ File JSON đã lưu tại: ${jsonOutPath1}`);

  try {
    fs.writeFileSync(jsonOutArtifact, JSON.stringify(jsonCatalog, null, 2), 'utf8');
    console.log(`✅ File JSON đã copy vào artifact: ${jsonOutArtifact}`);
  } catch (e) {}

  console.log('🎉 Hoàn thành xuất file 157 kịch bản chuẩn chưa test!');
}

generateExcel().catch(console.error);
