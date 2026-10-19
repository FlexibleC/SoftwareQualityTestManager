const fs = require('fs');
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

console.log('🚀 Bắt đầu khởi tạo bộ 157 kịch bản kiểm thử chuẩn hóa Frontend E2E (Vét cạn & Liên thông)...');

// ============================================================================
// HỆ SINH THÁI DỮ LIỆU THỐNG NHẤT (MASTER GOLDEN TEST DATASET)
// ============================================================================
const HOST_OFFICERS = [
  { name: 'Trần Quốc Tuấn', dept: 'Phòng Kỹ thuật & CNTT', room: 'P.302 Nhà A', role: 'Trưởng phòng' },
  { name: 'Lê Thị Mai', dept: 'Phòng Tài chính - Kế toán', room: 'P.205 Nhà B', role: 'Phó phòng' },
  { name: 'Phạm Hùng Cường', dept: 'Phòng Hành chính - Quản trị', room: 'P.101 Nhà A', role: 'Trưởng phòng' },
  { name: 'Hoàng Bích Ngọc', dept: 'Ban Quản lý Tòa nhà & Dự án', room: 'P.401 Nhà C', role: 'Chuyên viên' }
];

const STATIONS = [
  { id: 1, name: 'Trạm Gác Cổng Chính 01', staffUser: 'Nv001a1', staffName: 'Nguyễn Văn Huy', staffCode: 'NV001' },
  { id: 2, name: 'Trạm Gác Cổng Phụ 02', staffUser: 'Nv002a2', staffName: 'Hoàng Thế Thủy', staffCode: 'NV002' },
  { id: 3, name: 'Trạm Gác Cổng Hậu 03', staffUser: 'Nv003a3', staffName: 'Lê Văn Liêm', staffCode: 'NV003' }
];

// 12 Phân hệ chuẩn
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

// ============================================================================
// DANH MỤC CHI TIẾT 157 KỊCH BẢN (100% FRONTEND BLACKBOX & VÉT CẠN)
// ============================================================================
const testCases = [];

// Helper thêm test case
function addTC(id, module, priority, name, platform, testData, precondition, steps, expected, notes, layer) {
  testCases.push({
    id,
    module,
    priority,
    name,
    title: name,
    platform: platform || 'Giao diện Web Trực ban',
    type: layer === 'T3' ? 'Ngoại lệ' : (layer === 'T2' ? 'Biên & Định dạng' : (layer === 'T4' ? 'Liên thông' : 'Chức năng')),
    suite: priority === 'P1' ? 'SMOKE' : 'REGRESSION',
    precondition,
    testData,
    steps,
    expected,
    notes: notes || '',
    layer: layer || 'T1',
    status: 'Not Run',
    isCustom: true
  });
}

// ----------------------------------------------------------------------------
// MODULE M01: XÁC THỰC, PHÂN QUYỀN & QUẢN LÝ CA TRỰC (14 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-AUTH-001', 'M01', 'P1',
  'Đăng nhập Trực ban hợp lệ bằng mã cán bộ Nv001a1 và mở ca trực đầu ngày',
  'Giao diện Web Trực ban (/staff.html)',
  'Tài khoản: "Nv001a1" (Không cần nhập mật khẩu, tự động nhận diện)',
  'Trình duyệt mở trang /staff.html; Trạm Cổng Chính 01 chưa có ca trực nào đang mở; Camera webcam hoạt động bình thường.',
  [
    '1. Tại ô "Tên đăng nhập / Mã cán bộ", nhập "Nv001a1".',
    '2. Nhấp nút màu xanh "Đăng Nhập".',
    '3. Hệ thống tự động bật popup "Mở Ca Trực Mới (Start Shift)".',
    '4. Kiểm tra thông tin hiển thị trên popup: Tên cán bộ "Nguyễn Văn Huy", Trạm "Cổng Chính 01", Giờ mở ca.',
    '5. Nhấp nút "Chụp ảnh chân dung cán bộ trực" qua webcam.',
    '6. Kiểm tra danh sách thẻ bàn giao đầu ca (thẻ sẵn sàng từ THE-101 đến THE-150).',
    '7. Nhấp nút "Bắt đầu ca trực".'
  ],
  [
    'Toast thông báo màu xanh góc màn hình: "Mở ca trực thành công cho cán bộ Nguyễn Văn Huy!".',
    'Popup đóng lại, giao diện chuyển vào màn hình Dashboard Trực ban.',
    'Header hiển thị rõ: "Cán bộ trực: Nguyễn Văn Huy (NV001)", "Trạm: Cổng Chính 01", đồng hồ ca trực đếm thời gian thực.',
    'Khay thẻ an ninh hiển thị đầy đủ 50 thẻ ở trạng thái màu trắng "Sẵn sàng".'
  ],
  'Happy Path: Mở ca trực chuẩn mực đầu ca', 'T1'
);

addTC(
  'TC-AUTH-002', 'M01', 'P2',
  'Đăng nhập không phân biệt chữ hoa, chữ thường và tự động cắt khoảng trắng thừa',
  'Giao diện Web Trực ban (/staff.html)',
  'Tài khoản nhập thử: "  nV001A1  " (có khoảng trắng thừa đầu cuối, chữ hoa chữ thường lẫn lộn)',
  'Đang ở màn hình đăng nhập /staff.html.',
  [
    '1. Nhấp chuột vào ô nhập tài khoản.',
    '2. Nhập chuỗi "  nV001A1  ".',
    '3. Nhấp nút "Đăng Nhập".'
  ],
  [
    'Hệ thống tự động cắt khoảng trắng và chuẩn hóa về mã "nv001a1".',
    'Giao diện nhận diện đúng cán bộ Nguyễn Văn Huy và mở tiếp popup ca trực, không báo lỗi tài khoản không hợp lệ.'
  ],
  'Boundary: Kiểm tra chuẩn hóa chuỗi ký tự đăng nhập', 'T2'
);

addTC(
  'TC-AUTH-003', 'M01', 'P1',
  'Chặn đăng nhập khi nhập mã cán bộ không tồn tại trong danh bạ',
  'Giao diện Web Trực ban (/staff.html)',
  'Tài khoản nhập: "NV99999"',
  'Đang ở màn hình đăng nhập /staff.html.',
  [
    '1. Nhập mã tài khoản "NV99999".',
    '2. Nhấp nút "Đăng Nhập".'
  ],
  [
    'Xuất hiện khung cảnh báo màu đỏ ngay dưới ô nhập liệu: "Mã tài khoản cán bộ không tồn tại trên hệ thống!".',
    'Giao diện rung nhẹ (shake animation) cảnh báo lỗi, con trỏ chuột tự động focus lại vào ô tài khoản để nhập lại.'
  ],
  'Negative: Kiểm tra tài khoản không tồn tại', 'T3'
);

addTC(
  'TC-AUTH-004', 'M01', 'P1',
  'Chặn đăng nhập khi tài khoản cán bộ đang bị Admin khóa (Inactive)',
  'Giao diện Web Trực ban (/staff.html)',
  'Tài khoản: "Nv004a4" (Cán bộ Lê Hoàng Minh đã bị Admin đặt trạng thái Khóa trong danh mục nhân sự)',
  'Tài khoản Nv004a4 có trạng thái Inactive trên hệ thống.',
  [
    '1. Nhập mã tài khoản "Nv004a4".',
    '2. Nhấp nút "Đăng Nhập".'
  ],
  [
    'Banner màu đỏ hiển thị thông báo: "Tài khoản cán bộ này đã bị tạm khóa hoặc ngừng công tác. Vui lòng liên hệ Admin!".',
    'Hệ thống không cho phép mở ca trực.'
  ],
  'Security: Chặn tài khoản bị vô hiệu hóa', 'T3'
);

addTC(
  'TC-AUTH-005', 'M01', 'P1',
  'Cảnh báo xung đột khi đăng nhập vào trạm gác đang có cán bộ khác đang mở ca',
  'Giao diện Web Trực ban (/staff.html)',
  'Cán bộ A (Nguyễn Văn Huy) đang trong ca trực tại Cổng Chính; Cán bộ B (Hoàng Thế Thủy - "Nv002a2") đăng nhập vào máy cùng trạm',
  'Trạm Cổng Chính đang có ca trực của Nv001a1 chưa đóng ca.',
  [
    '1. Cán bộ B nhập mã "Nv002a2", nhấp nút "Đăng Nhập".',
    '2. Quan sát thông báo trên màn hình.'
  ],
  [
    'Popup cảnh báo xung đột phiên trực bật lên: "Trạm Gác Cổng Chính 01 hiện đang có ca trực mở dở dang của cán bộ Nguyễn Văn Huy từ lúc 07:00!".',
    'Cung cấp 2 lựa chọn rõ ràng: "Tiếp quản ca trực (Ghi đè ca)" hoặc "Quay lại để cán bộ cũ bàn giao ca".'
  ],
  'Exception: Xử lý xung đột phiên trạm gác', 'T3'
);

addTC(
  'TC-AUTH-006', 'M01', 'P2',
  'Mở ca trực dự phòng bằng cách quẹt thẻ CCCD gắn chip của cán bộ trực',
  'Giao diện Web Trực ban (/staff.html)',
  'Thẻ CCCD chip của cán bộ Nguyễn Văn Huy (Số CCCD: "001085001234")',
  'Máy tính có gắn đầu đọc chip CCCD; Cán bộ đã được liên kết số CCCD trong danh mục nhân sự.',
  [
    '1. Tại màn hình đăng nhập, không gõ bàn phím.',
    '2. Đặt thẻ CCCD của cán bộ trực vào khe cắm đầu đọc chip.',
    '3. Nhấp nút "Đăng nhập bằng thẻ CCCD".'
  ],
  [
    'Đầu đọc kêu bíp nhẹ, hệ thống đọc mã chip và tự động xác thực thành công cán bộ Nguyễn Văn Huy.',
    'Giao diện chuyển thẳng vào popup mở ca trực.'
  ],
  'Hardware Integration: Xác thực ca trực qua thẻ chip CCCD', 'T2'
);

addTC(
  'TC-AUTH-007', 'M01', 'P2',
  'Tùy chọn thiết bị Camera khi máy trạm gắn nhiều camera (Camera cổng vào / Camera mặt)',
  'Giao diện Web Trực ban (/staff.html)',
  'Dropdown thiết bị: Chọn "Webcam Full HD 1080p"',
  'Máy tính trạm gắn 2 camera USB.',
  [
    '1. Trên popup mở ca trực, nhấp vào biểu tượng bánh răng cài đặt camera.',
    '2. Nhấp mở dropdown "Chọn Camera chụp ảnh cán bộ".',
    '3. Chọn camera "Webcam Full HD 1080p".',
    '4. Nhấp nút "Chụp thử ảnh kiểm tra".'
  ],
  [
    'Khung Live Preview chuyển đổi tức thì sang khung hình của camera vừa chọn.',
    'Ảnh chụp thử hiển thị sắc nét, nút "Sử dụng ảnh này" sáng lên.'
  ],
  'Device Selection: Cấu hình camera trước khi mở ca', 'T2'
);

addTC(
  'TC-AUTH-008', 'M01', 'P1',
  'Đóng ca trực cuối ngày và tổng kết bàn giao số lượng khách, số lượng thẻ',
  'Giao diện Web Trực ban (/staff.html)',
  'Ca trực đã xử lý đón tiếp 1 lượt khách cá nhân và 1 đoàn khách thi công',
  'Ca trực đang mở; Các lượt khách trong ca đã hoàn tất.',
  [
    '1. Trên thanh Topbar trạm gác, nhấp nút màu đỏ "Kết thúc ca trực".',
    '2. Modal "Bàn Giao & Đóng Ca Trực (End Shift)" hiển thị.',
    '3. Kiểm tra bảng thống kê tự động: Tổng lượt vào trong ca (2 lượt), Tổng lượt ra (2 lượt), Khách còn tồn trong ca (0 người).',
    '4. Kiểm tra kiểm đếm thẻ: Tổng thẻ sẵn sàng (50/50 thẻ), Thẻ mất/nợ (0 thẻ).',
    '5. Nhấp nút "Chụp ảnh cán bộ bàn giao rời ca".',
    '6. Nhập ghi chú bàn giao: "Bàn giao trạm cổng chính sạch sẽ, đầy đủ thiết bị và 50 thẻ".',
    '7. Nhấp nút "Xác nhận đóng ca trực".'
  ],
  [
    'Toast thông báo: "Đã đóng ca trực thành công. Biên bản bàn giao ca đã được lưu trữ!".',
    'Hệ thống tự động đăng xuất và quay về màn hình đăng nhập ban đầu.',
    'Trên giao diện Admin (/admin.html -> Quản lý ca trực), xuất hiện dòng ca trực vừa đóng với đầy đủ chỉ số thống kê và ảnh chụp rời ca.'
  ],
  'Lifecycle: Đóng ca trực và bàn giao dữ liệu', 'T4'
);

addTC(
  'TC-AUTH-009', 'M01', 'P2',
  'Chặn đóng ca trực khi còn khách chưa check-out mà không có lý do giải trình',
  'Giao diện Web Trực ban (/staff.html)',
  'Trạm đang có 1 khách lưu trú qua đêm Đặng Quốc Khánh chưa ra cổng',
  'Ca trực đang mở; Quân số đang có mặt hiển thị: "1 người".',
  [
    '1. Nhấp nút "Kết thúc ca trực".',
    '2. Quan sát cảnh báo trên modal đóng ca.'
  ],
  [
    'Modal hiển thị huy hiệu màu vàng cảnh báo: "Cảnh báo: Hiện còn 1 khách đang ở trong cơ quan chưa Check-out!".',
    'Bắt buộc cán bộ trực phải tích chọn xác nhận: "Bàn giao theo dõi khách lưu trú qua đêm cho ca trực tiếp theo" mới cho phép bấm nút đóng ca.'
  ],
  'Boundary: Kiểm soát quân số tồn khi đóng ca', 'T2'
);

addTC(
  'TC-AUTH-010', 'M01', 'P2',
  'Chức năng Khóa màn hình tạm thời (Lock Station) khi cán bộ rời vị trí đi tuần tra',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấn nút "Khóa trạm" trên Topbar',
  'Ca trực đang hoạt động bình thường.',
  [
    '1. Nhấp nút hình ổ khóa "Khóa trạm tạm thời" trên Topbar.',
    '2. Quan sát giao diện bị che mờ toàn bộ.',
    '3. Thử nhấp chuột vào các nút Check-in, Check-out.',
    '4. Nhập mã tài khoản "Nv001a1" vào ô mở khóa, bấm "Mở khóa".'
  ],
  [
    'Màn hình hiển thị lớp phủ bảo vệ màu xám đen: "Trạm đang tạm khóa bởi cán bộ Nguyễn Văn Huy. Vui lòng nhập mã để tiếp tục".',
    'Không thể nhấp vào bất kỳ nút nghiệp vụ nào bên dưới.',
    'Sau khi nhập đúng mã, màn hình mở khóa tức thì, giữ nguyên toàn bộ trạng thái công việc đang làm dở.'
  ],
  'Security: Bảo vệ màn hình trạm gác khi vắng mặt', 'T1'
);

addTC(
  'TC-AUTH-011', 'M01', 'P2',
  'Khôi phục phiên làm việc sau khi trình duyệt bị F5 (Reload) hoặc mất điện đột ngột',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấn phím F5 trên bàn phím khi đang mở ca trực',
  'Ca trực đang hoạt động, có 2 khách đang trong đơn vị.',
  [
    '1. Nhấn phím F5 hoặc nút Reload trên thanh địa chỉ trình duyệt Chrome/Edge.',
    '2. Quan sát trang web tải lại.'
  ],
  [
    'Trang web tải lại và tự động khôi phục đúng ca trực của cán bộ Nguyễn Văn Huy mà không bắt đăng nhập lại từ đầu.',
    'Danh sách khách đang có mặt và quân số giữ nguyên vẹn 100%.'
  ],
  'Resilience: Khả năng tự phục hồi trạng thái sau Reload', 'T1'
);

addTC(
  'TC-AUTH-012', 'M01', 'P3',
  'Đổi giao diện Dark Mode / Light Mode trên thanh Topbar trực ban',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp nút biểu tượng Mặt trăng / Mặt trời',
  'Đang ở Dashboard trực ban.',
  [
    '1. Nhấp vào nút icon Mặt trăng trên góc phải Topbar.',
    '2. Quan sát màu nền toàn bộ màn hình chuyển sang nền đen xám hiện đại (Dark Mode).',
    '3. Nhấp lại vào icon Mặt trời để quay về Light Mode.'
  ],
  [
    'Giao diện chuyển đổi êm mượt (transition 0.2s), các badge trạng thái, chữ và bảng dữ liệu vẫn tương phản rõ nét, dễ đọc.',
    'Trạng thái giao diện được ghi nhớ, khi mở tab mới không bị quay về mặc định.'
  ],
  'UI/UX: Trải nghiệm người dùng trực ban đêm', 'T1'
);

addTC(
  'TC-AUTH-013', 'M01', 'P1',
  'Đăng nhập giao diện Quản trị Admin với tài khoản admin / admin123',
  'Giao diện Web Admin (/admin.html)',
  'Tên đăng nhập: "admin" | Mật khẩu: "admin123"',
  'Truy cập đường dẫn https://smartvms.local/admin.html.',
  [
    '1. Tại ô Tên đăng nhập, nhập "admin".',
    '2. Tại ô Mật khẩu, nhập "admin123".',
    '3. Nhấp nút "Đăng Nhập Quản Trị".'
  ],
  [
    'Toast xanh: "Đăng nhập quyền Quản trị viên thành công!".',
    'Chuyển thẳng vào Trung tâm Điều hành Admin (/admin.html), hiển thị đầy đủ 9 tab chức năng quản trị cấp cao.'
  ],
  'Happy Path: Đăng nhập quyền Admin', 'T1'
);

addTC(
  'TC-AUTH-014', 'M01', 'P2',
  'Chặn đăng nhập Admin khi nhập sai mật khẩu quá 5 lần liên tiếp',
  'Giao diện Web Admin (/admin.html)',
  'Nhập "admin" với mật khẩu sai "sai123" lặp lại 5 lần',
  'Màn hình đăng nhập Admin.',
  [
    '1. Nhập "admin" và mật khẩu sai "111111", bấm Đăng nhập.',
    '2. Lặp lại thao tác 5 lần liên tục.'
  ],
  [
    'Tại lần thứ 5, hệ thống hiển thị thông báo khóa tạm thời: "Bạn đã nhập sai mật khẩu 5 lần. Vui lòng chờ 60 giây trước khi thử lại!".',
    'Nút Đăng nhập bị vô hiệu hóa (disabled) kèm đồng hồ đếm ngược 60s.'
  ],
  'Security: Chống dò quét mật khẩu Brute-force', 'T3'
);

console.log('✅ Đã tạo xong 14 kịch bản Module M01');

// ----------------------------------------------------------------------------
// MODULE M02: CHECK-IN KHÁCH ĐƠN & CẤP THẺ AN NINH (17 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-CKIN-001', 'M02', 'P1',
  'Check-in khách đơn đi ô tô bằng quét CCCD chip tự động điền form, kiểm tra mục đích mặc định "Liên hệ công việc." và cấp thẻ THE-101',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-01: Họ tên "Nguyễn Văn An" | CCCD chip "001099012345" | Ngày sinh "15/08/1990" | Quê quán "Cầu Giấy, Hà Nội" | SĐT "0912.345.678" | Cơ quan "Công ty CP Công nghệ An ninh Thăng Long" | Cán bộ tiếp "Trần Quốc Tuấn (Phòng CNTT)" | Mục đích: "Liên hệ công việc." | Xe ô tô "29A-123.45" | Thẻ cấp "THE-101"',
  'Ca trực đang mở tại Cổng 01; Đầu đọc CCCD và Webcam hiển thị chấm xanh kết nối; Thẻ THE-101 ở trạng thái sẵn sàng.',
  [
    '1. Tại màn hình Dashboard Trực ban, nhấp nút màu xanh "+ Tiếp Đón Khách Mới".',
    '2. Đặt thẻ CCCD vào đầu đọc chip (hoặc nhấp nút "Quét Thẻ CCCD").',
    '3. Kiểm tra các trường tự động điền: Họ tên, Số CCCD, Ngày sinh, Giới tính, Quê quán và ảnh thẻ CCCD.',
    '4. Nhập Số điện thoại "0912.345.678" và Cơ quan "Công ty CP Công nghệ An ninh Thăng Long".',
    '5. Kiểm tra trường "Mục đích vào làm việc": Xác nhận trường này đã có sẵn giá trị mặc định là "Liên hệ công việc.". Không cần gõ lại.',
    '6. Tại ô "Cán bộ tiếp đón", nhấp chọn "Trần Quốc Tuấn (Phòng Kỹ thuật & CNTT)".',
    '7. Tại mục Phương tiện, nhấp chọn radio "Ô tô", nhập biển số "29A-123.45" và nhấp nút "Chụp ảnh phương tiện".',
    '8. Tại ô "Mã thẻ an ninh", chọn thẻ "THE-101" (hoặc quẹt thẻ vào đầu đọc quẹt thẻ).',
    '9. Nhấp nút "Chụp ảnh chân dung khách" qua webcam trực ban.',
    '10. Nhấp nút màu xanh "Hoàn tất Check-in & Cấp thẻ".'
  ],
  [
    'Toast thông báo góc trên màn hình hiển thị màu xanh: "Check-in thành công khách Nguyễn Văn An - Thẻ THE-101!".',
    'Modal Check-in tự động đóng lại, giao diện quay về Dashboard trực ban.',
    'Bảng "Khách Đang Có Mặt Trong Cơ Quan" xuất hiện ngay 1 dòng mới với đầy đủ thông tin: Ảnh khách, Họ tên "Nguyễn Văn An", CCCD "001099012345", Xe "29A-123.45", Cán bộ tiếp "Trần Quốc Tuấn", Thẻ "THE-101", Trạng thái badge xanh "Trong đơn vị".',
    'Chỉ số "Quân số đang có mặt" trên thanh Topbar tăng thêm +1 người (từ 0 lên 1).',
    'Thẻ "THE-101" trong khay thẻ chuyển sang trạng thái màu xanh "Đang sử dụng".'
  ],
  'Happy Path: Quy trình Check-in khách cá nhân chuẩn mực (Hồ sơ HS-01)', 'T1'
);

addTC(
  'TC-CKIN-002', 'M02', 'P1',
  'Check-in bằng quét mã QR trên ứng dụng VNeID mức 2 tự động trích xuất chuỗi định danh',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách mở mã QR căn cước trên app VNeID điện thoại; Máy quét QR 2D đang sẵn sàng',
  'Modal Check-in đang mở; Máy quét QR kết nối cổng COM.',
  [
    '1. Khách đưa màn hình điện thoại có mã QR VNeID trước mắt đọc máy quét.',
    '2. Máy quét phát tiếng bíp xác nhận.',
    '3. Quan sát các ô nhập liệu trên form Check-in.'
  ],
  [
    'Hệ thống tự động phân tích chuỗi QR chuẩn Bộ Công An, điền chính xác Họ tên, Số CCCD, Ngày sinh, Địa chỉ thường trú vào form.',
    'Huy hiệu "Đã xác thực qua VNeID" màu xanh lá cây hiện lên bên cạnh tên khách.'
  ],
  'Hardware Integration: Quét mã QR VNeID điện tử', 'T1'
);

addTC(
  'TC-CKIN-003', 'M02', 'P1',
  'Check-in thủ công cho khách nước ngoài sử dụng Hộ chiếu (Passport)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hộ chiếu số: "B98765432" | Họ tên: "Johnathan Smith" | Quốc tịch: "Hoa Kỳ" | SĐT: "0901.999.888" | Cơ quan: "Tập đoàn Công nghệ Intel" | Cán bộ tiếp: "Trần Quốc Tuấn" | Mục đích: "Liên hệ công việc." | Đi bộ | Thẻ cấp: "THE-103"',
  'Modal Check-in đang mở; Khách xuất trình Hộ chiếu giấy.',
  [
    '1. Tại dropdown "Loại giấy tờ", chọn "Hộ chiếu (Passport)".',
    '2. Nhập số Hộ chiếu "B98765432".',
    '3. Nhập Họ tên "Johnathan Smith", Quốc tịch "Hoa Kỳ".',
    '4. Nhập SĐT "0901.999.888", Cơ quan "Tập đoàn Công nghệ Intel".',
    '5. Xác nhận mục đích mặc định "Liên hệ công việc.", chọn Cán bộ đón "Trần Quốc Tuấn".',
    '6. Chọn phương tiện "Đi bộ", cấp thẻ "THE-103", chụp ảnh chân dung webcam.',
    '7. Nhấp nút "Hoàn tất Check-in & Cấp thẻ".'
  ],
  [
    'Check-in thành công khách Johnathan Smith, thẻ THE-103.',
    'Dòng khách hiển thị trên Dashboard có cờ biểu tượng hộ chiếu và quốc tịch Hoa Kỳ.'
  ],
  'Boundary: Tiếp đón khách nước ngoài dùng Passport', 'T2'
);

addTC(
  'TC-CKIN-004', 'M02', 'P1',
  'Check-in khách đi xe máy Honda biển 5 số và cấp thẻ an ninh THE-102 (Hồ sơ sự cố thẻ mất HS-02)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-02: Họ tên "Trần Thị Bích" | CCCD chip "038198005678" | SĐT "0983.112.233" | Cơ quan "Sở Tài nguyên và Môi trường Hà Nội" | Cán bộ tiếp "Lê Thị Mai (Phòng Kế toán)" | Mục đích: "Liên hệ công việc." | Xe máy Honda "29B1-888.99" | Thẻ cấp "THE-102"',
  'Modal Check-in đang mở; Thẻ THE-102 sẵn sàng.',
  [
    '1. Quét chip CCCD hoặc nhập tay Họ tên "Trần Thị Bích", CCCD "038198005678".',
    '2. Nhập SĐT "0983.112.233", Cơ quan "Sở Tài nguyên và Môi trường Hà Nội".',
    '3. Kiểm tra mục đích "Liên hệ công việc.", chọn Cán bộ "Lê Thị Mai".',
    '4. Chọn phương tiện "Xe máy", nhập biển số "29B1-888.99", bấm chụp ảnh biển số xe máy.',
    '5. Chọn cấp thẻ "THE-102", chụp ảnh chân dung khách.',
    '6. Nhấp nút "Hoàn tất Check-in & Cấp thẻ".'
  ],
  [
    'Check-in thành công khách Trần Thị Bích - Thẻ THE-102.',
    'Dòng khách xuất hiện trên Dashboard với biểu tượng xe máy 29B1-888.99 và cán bộ tiếp đón Lê Thị Mai.',
    'Quân số bên trong tăng lên.'
  ],
  'Golden Thread B: Khởi tạo hồ sơ khách HS-02 phục vụ chuỗi sự cố thẻ', 'T1'
);

addTC(
  'TC-CKIN-005', 'M02', 'P1',
  'Chặn Check-in khi số CCCD của khách trùng với khách đang ở trong cơ quan chưa Check-out',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhập số CCCD "001099012345" (Số CCCD của khách Nguyễn Văn An HS-01 đang ở trong đơn vị)',
  'Khách Nguyễn Văn An đang có trạng thái "Trong đơn vị" tại Dashboard.',
  [
    '1. Nhấp nút "+ Tiếp Đón Khách Mới".',
    '2. Nhập hoặc quét số CCCD "001099012345".',
    '3. Nhấp chuột ra ngoài ô CCCD (blur event).'
  ],
  [
    'Khung viền ô CCCD đổi sang màu đỏ rực, biểu tượng cảnh báo tam giác vàng xuất hiện.',
    'Thông báo lỗi chặn hiển thị rõ ràng: "Số CCCD 001099012345 hiện đang có mặt trong cơ quan (Lượt vào lúc 08:30) chưa Check-out!".',
    'Nút "Hoàn tất Check-in" bị vô hiệu hóa (disabled), không cho phép tạo thêm lượt trùng.'
  ],
  'Negative: Chống trùng lặp số CCCD đang ở trong cơ quan', 'T3'
);

addTC(
  'TC-CKIN-006', 'M02', 'P1',
  'Chặn Check-in khi biển số xe trùng với phương tiện đang gửi trong bãi chưa ra',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhập biển số xe ô tô "29A-123.45" (Xe của khách Nguyễn Văn An đang gửi trong bãi)',
  'Ô tô 29A-123.45 đang trong trạng thái ở trong đơn vị.',
  [
    '1. Tại form Check-in khách mới, chọn loại xe "Ô tô".',
    '2. Nhập biển số "29A-123.45".',
    '3. Nhấp chuột ra ngoài.'
  ],
  [
    'Hệ thống báo lỗi đỏ: "Biển số xe 29A-123.45 hiện đang trong bãi đỗ cơ quan thuộc lượt khách Nguyễn Văn An chưa Check-out!".',
    'Chặn không cho phép lưu nếu không thay đổi biển số xe.'
  ],
  'Negative: Chống trùng lặp biển số xe trong bãi', 'T3'
);

addTC(
  'TC-CKIN-007', 'M02', 'P1',
  'Chặn Check-in khi chọn mã thẻ an ninh đang được cấp cho người khác chưa thu hồi',
  'Giao diện Web Trực ban (/staff.html)',
  'Chọn mã thẻ "THE-101" (Thẻ đang được cấp cho khách Nguyễn Văn An)',
  'Thẻ THE-101 đang có trạng thái In-use.',
  [
    '1. Tại form Check-in khách mới, tại ô Thẻ an ninh, gõ "THE-101".',
    '2. Quan sát phản hồi của form.'
  ],
  [
    'Dropdown hiển thị thẻ THE-101 có huy hiệu màu đỏ: "[ĐANG DÙNG - Khách: Nguyễn Văn An]".',
    'Nếu cố tình gõ THE-101, hệ thống hiển thị thông báo lỗi: "Mã thẻ THE-101 đang được cấp phát cho lượt khách khác chưa thu hồi!".',
    'Chặn lưu check-in.'
  ],
  'Negative: Chống cấp trùng thẻ an ninh', 'T3'
);

addTC(
  'TC-CKIN-008', 'M02', 'P1',
  'Cảnh báo khi chọn mã thẻ an ninh đang nằm trong danh sách "Báo Mất (Khóa)"',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhập mã thẻ an ninh "THE-102" (Thẻ đã bị báo mất trước đó)',
  'Thẻ THE-102 có trạng thái LOST trong CSDL.',
  [
    '1. Tại ô Mã thẻ an ninh, gõ "THE-102".',
    '2. Quan sát cảnh báo bật lên.'
  ],
  [
    'Popup cảnh báo màu cam hiện lên: "Thẻ THE-102 hiện đang ở trạng thái BÁO MẤT (Lượt khách Trần Thị Bích đánh rơi ngày hôm trước)!".',
    'Cung cấp nút bấm: "Kích hoạt lại thẻ về trạng thái Sẵn sàng" hoặc "Chọn mã thẻ khác".'
  ],
  'Exception: Xử lý thẻ báo mất khi cấp phát', 'T3'
);

addTC(
  'TC-CKIN-009', 'M02', 'P2',
  'Bắt buộc nhập Số điện thoại liên hệ khi khách có đăng ký phương tiện (xe máy/ô tô)',
  'Giao diện Web Trực ban (/staff.html)',
  'Chọn có phương tiện Ô tô "30H-999.88" nhưng xóa trắng ô Số điện thoại',
  'Modal Check-in đang mở.',
  [
    '1. Điền Họ tên "Phạm Văn Bình", CCCD "001099008877".',
    '2. Chọn phương tiện "Ô tô", nhập biển số "30H-999.88".',
    '3. Để trống ô "Số điện thoại".',
    '4. Nhấp nút "Hoàn tất Check-in".'
  ],
  [
    'Hệ thống chặn không cho lưu, cuộn màn hình đến ô Số điện thoại.',
    'Dòng thông báo màu đỏ hiển thị: "Khách có đăng ký phương tiện nên bắt buộc phải nhập Số điện thoại liên hệ dời xe khi cần!".'
  ],
  'Validation: Ràng buộc số điện thoại khi có xe', 'T2'
);

addTC(
  'TC-CKIN-010', 'M02', 'P2',
  'Tự động nhận diện và định dạng các loại biển số xe đặc biệt (Biển xanh cơ quan nhà nước 80B, Xe quân sự biển đỏ, Biển vàng kinh doanh)',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhập lần lượt: "80b-1234", "tm-12-34", "29e-012.34"',
  'Modal Check-in đang mở.',
  [
    '1. Chọn Ô tô, nhập "80b-1234", quan sát hiển thị.',
    '2. Đổi biển số thành "tm-12-34".',
    '3. Đổi biển số thành "29e-012.34".'
  ],
  [
    'Biển "80b-1234" tự động chuyển thành chữ hoa "80B-1234" kèm tag màu xanh dương: "[Xe Cơ Quan Nhà Nước]".',
    'Biển "tm-12-34" chuyển thành chữ hoa "TM-12-34" kèm tag màu đỏ: "[Xe Quân Sự]".',
    'Biển "29e-012.34" chuyển thành chữ hoa "29E-012.34" kèm tag màu vàng: "[Xe Vận Tải]".'
  ],
  'Boundary: Nhận diện biển số đặc biệt toàn diện', 'T2'
);

addTC(
  'TC-CKIN-011', 'M02', 'P2',
  'Vét cạn xử lý họ tên có ký tự chữ đệm rất dài (50 ký tự) không làm vỡ giao diện',
  'Giao diện Web Trực ban (/staff.html)',
  'Họ tên: "Công Tằng Tôn Nữ Nguyễn Thị Hoàng Bích Thảo Nguyên Trang"',
  'Modal Check-in đang mở.',
  [
    '1. Nhập họ tên dài 50 ký tự vào ô Họ và tên.',
    '2. Hoàn tất các trường thông tin hợp lệ khác và bấm Check-in.',
    '3. Quan sát dòng hiển thị trên bảng Dashboard.'
  ],
  [
    'Tên hiển thị tự động xuống dòng gọn gàng, không bị tràn viền (overflow), không vỡ layout bảng.',
    'Khi rê chuột vào tên, tooltip hiển thị đầy đủ trọn vẹn 50 ký tự.'
  ],
  'Boundary: Xử lý chuỗi tên dài', 'T2'
);

addTC(
  'TC-CKIN-012', 'M02', 'P2',
  'Hỗ trợ khách đi xe đạp hoặc xe máy điện không có biển số',
  'Giao diện Web Trực ban (/staff.html)',
  'Chọn phương tiện "Xe đạp" (Không có biển số xe)',
  'Modal Check-in đang mở.',
  [
    '1. Tại dropdown Loại phương tiện, chọn "Xe đạp".',
    '2. Quan sát ô Biển số xe.'
  ],
  [
    'Ô Biển số xe tự động chuyển sang trạng thái mờ (disabled) với nội dung: "[Không yêu cầu biển số]".',
    'Nút chụp ảnh phương tiện vẫn hoạt động để chụp lại hình dáng xe đạp gửi trong bãi.',
    'Hệ thống cho phép lưu check-in hợp lệ.'
  ],
  'Boundary: Phương tiện không biển số', 'T2'
);

addTC(
  'TC-CKIN-013', 'M02', 'P3',
  'Chụp ảnh bổ sung giấy tờ công văn / Giấy giới thiệu công tác của khách',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách có Giấy giới thiệu số 12/GGT-BQL',
  'Modal Check-in đang mở.',
  [
    '1. Nhấp vào nút "Chụp ảnh tài liệu / Giấy giới thiệu đi kèm".',
    '2. Đưa giấy giới thiệu trước webcam, nhấp "Chụp".',
    '3. Kiểm tra ảnh thu nhỏ (thumbnail) đính kèm trên form.'
  ],
  [
    'Ảnh giấy giới thiệu hiển thị rõ nét dạng thumbnail kèm nút xem phóng to và nút xóa chụp lại.',
    'Sau khi check-in, ảnh giấy tờ được lưu trữ cùng hồ sơ lượt khách.'
  ],
  'Feature: Đính kèm ảnh giấy giới thiệu', 'T1'
);

addTC(
  'TC-CKIN-014', 'M02', 'P2',
  'Tự động xóa trắng form Check-in khi bấm nút "Làm mới / Hủy"',
  'Giao diện Web Trực ban (/staff.html)',
  'Đã điền dở dang thông tin nhưng khách đổi ý không vào',
  'Form Check-in đang có dữ liệu nhập dở.',
  [
    '1. Nhấp nút "Làm mới form (Reset)".',
    '2. Xác nhận popup "Bạn có muốn xóa dữ liệu đang nhập?".'
  ],
  [
    'Toàn bộ các ô nhập liệu được xóa trắng sạch sẽ, camera webcam tắt chế độ chụp.',
    'Trường "Mục đích vào làm việc" tự động thiết lập lại giá trị mặc định "Liên hệ công việc.". Form sẵn sàng cho lượt tiếp theo.'
  ],
  'UX: Reset form về trạng thái ban đầu', 'T1'
);

addTC(
  'TC-CKIN-015', 'M02', 'P1',
  'Sử dụng phím tắt F2 để mở nhanh cửa sổ Check-in và phím ESC để đóng',
  'Giao diện Web Trực ban (/staff.html)',
  'Bàn phím máy tính trạm gác',
  'Đang ở Dashboard trực ban, không mở modal nào.',
  [
    '1. Nhấn phím F2 trên bàn phím.',
    '2. Nhấn phím ESC trên bàn phím.'
  ],
  [
    'Khi bấm F2: Modal Check-in bật mở ngay lập tức, con trỏ tự động nhảy vào ô quét CCCD.',
    'Khi bấm ESC: Modal đóng lại êm ái, trả về Dashboard.'
  ],
  'Kiosk UX: Phím tắt thao tác nhanh cho bảo vệ', 'T1'
);

addTC(
  'TC-CKIN-016', 'M02', 'P2',
  'Check-in khách sử dụng CMND 9 số cũ kèm cảnh báo nhắc nhở đổi CCCD gắn chip',
  'Giao diện Web Trực ban (/staff.html)',
  'Số CMND: "012345678" (9 chữ số) | Họ tên: "Hoàng Văn Tuấn"',
  'Khách xuất trình CMND 9 số cũ.',
  [
    '1. Nhập số CMND 9 chữ số "012345678".',
    '2. Nhập các thông tin bắt buộc còn lại, bấm Check-in.'
  ],
  [
    'Hệ thống chấp nhận CMND 9 số hợp lệ, hiển thị thông báo nhắc nhở nhỏ màu vàng: "[CMND 9 số cũ - Khuyến nghị đổi CCCD chip]".',
    'Check-in hoàn tất thành công.'
  ],
  'Legacy Support: Hỗ trợ CMND 9 số', 'T2'
);

addTC(
  'TC-CKIN-017', 'M02', 'P1',
  'In phiếu đón tiếp ra máy in nhiệt Pos / Kiosk (Khổ giấy 80mm) sau khi Check-in thành công',
  'Giao diện Web Trực ban (/staff.html)',
  'Tích chọn "Tự động in phiếu khách sau khi Check-in"',
  'Máy in nhiệt khổ K80 kết nối cổng USB.',
  [
    '1. Hoàn tất Check-in cho khách.',
    '2. Quan sát lệnh in xuất ra.'
  ],
  [
    'Máy in nhiệt cắt giấy tự động in ra phiếu đón tiếp khổ K80 gồm: Mã QR lượt vào, Họ tên, Biển số xe, Cán bộ tiếp đón, Giờ vào cổng và Mã thẻ an ninh được cấp.'
  ],
  'Hardware Integration: In phiếu khách qua máy in nhiệt', 'T1'
);

console.log('✅ Đã tạo xong 17 kịch bản Module M02');

// Tiếp tục xây dựng các module M03 đến M12...

// ----------------------------------------------------------------------------
// MODULE M03: KHÁCH ĐOÀN, NGƯỜI ĐI CÙNG & LƯU TRÚ QUA ĐÊM (14 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-GRP-001', 'M03', 'P1',
  'Check-in đoàn nhà thầu thi công 5 người đi xe tải 29C-678.90, cấp đồng thời dải 5 thẻ THE-201 đến THE-205 (Hồ sơ HS-03)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-03: Trưởng đoàn "Lê Hoàng Minh" (CCCD "026095007890", SĐT "0904.556.677") + 4 người đi cùng (Nguyễn Văn Thợ 1, Trần Văn Thợ 2, Lê Văn Thợ 3, Phạm Văn Thợ 4) | Đơn vị "Tổng công ty Xây dựng Vinaconex" | Xe tải thi công "29C-678.90" | Cán bộ đón "Phạm Hùng Cường (Hành chính)" | Mục đích: "Liên hệ công việc." | Dải thẻ "THE-201" đến "THE-205"',
  'Modal Check-in đoàn đang mở; Dải thẻ THE-201..THE-205 sẵn sàng.',
  [
    '1. Tại Dashboard, nhấp nút "+ Check-in Khách Đoàn / Lưu Trú".',
    '2. Điền thông tin Trưởng đoàn Lê Hoàng Minh và phương tiện Xe tải 29C-678.90.',
    '3. Chuyển sang tab "Thành viên đi cùng": Bấm "+ Thêm thành viên" nhập đủ tên và CCCD cho 4 người đi cùng.',
    '4. Tại ô cấp thẻ, chọn dải thẻ liên tiếp từ "THE-201" đến "THE-205". Hệ thống tự gán mỗi người 1 mã thẻ.',
    '5. Bấm "Chụp ảnh cả đoàn" qua webcam trạm.',
    '6. Nhấp nút "Hoàn tất Check-in Toàn Đoàn".'
  ],
  [
    'Toast xanh: "Check-in thành công đoàn khách Vinaconex (5 người, 5 thẻ, Xe tải 29C-678.90)!".',
    'Dashboard hiển thị 1 dòng đại diện đoàn kèm badge "Đoàn 5 người", nhấp mở rộng thấy danh sách 5 thành viên và 5 thẻ.',
    'Quân số bên trong tăng +5 người.'
  ],
  'Golden Thread C: Khởi tạo hồ sơ khách đoàn HS-03 phục vụ chuỗi check-out nhiều đợt', 'T1'
);

addTC(
  'TC-GRP-002', 'M03', 'P2',
  'Check-in đoàn khách khai báo dạng số lượng vô danh (Trưởng đoàn + 10 công nhân không khai báo tên từng người)',
  'Giao diện Web Trực ban (/staff.html)',
  'Trưởng đoàn có CCCD chip; 10 công nhân thời vụ đi cùng xe 16 chỗ "29B-555.66"',
  'Modal Check-in đoàn đang mở.',
  [
    '1. Nhập thông tin Trưởng đoàn đầy đủ.',
    '2. Tại ô "Số lượng người đi cùng không định danh", nhập số "10".',
    '3. Chọn cấp 1 thẻ Trưởng đoàn THE-206 và cấp 10 thẻ thường THE-210 đến THE-219.',
    '4. Nhấp "Hoàn tất Check-in".'
  ],
  [
    'Hệ thống lưu thành công lượt đoàn 11 người.',
    'Dashboard ghi nhận quân số tăng +11 người, quản lý đủ 11 thẻ an ninh cấp phát.'
  ],
  'Boundary: Khai báo số lượng đoàn vô danh', 'T2'
);

addTC(
  'TC-GRP-003', 'M03', 'P1',
  'Đăng ký khách lưu trú qua đêm tại phòng máy chủ đến 06:00 sáng hôm sau (Hồ sơ HS-04)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-04: Kỹ sư "Đặng Quốc Khánh" (CCCD "001088009988", SĐT "0977.889.900") | Cơ quan "Tập đoàn Viettel" | Cán bộ tiếp "Trần Quốc Tuấn" | Mục đích: "Liên hệ công việc." | Đi bộ | Thẻ cấp "THE-901" | Tích chọn "Lưu trú qua đêm" đến "06:00 ngày hôm sau"',
  'Modal Check-in đang mở; Thẻ THE-901 sẵn sàng.',
  [
    '1. Nhập thông tin kỹ sư Đặng Quốc Khánh, mục đích "Liên hệ công việc.", cán bộ đón "Trần Quốc Tuấn".',
    '2. Tích chọn checkbox "Khách lưu trú qua đêm".',
    '3. Ô ngày giờ rời đi dự kiến hiện ra: Chọn thời gian "06:00" ngày hôm sau.',
    '4. Nhập lý do: "Trực xử lý sự cố nâng cấp mạng lõi máy chủ".',
    '5. Cấp thẻ qua đêm màu tím "THE-901", bấm Hoàn tất Check-in.'
  ],
  [
    'Check-in thành công khách Đặng Quốc Khánh.',
    'Dòng khách trên Dashboard có biểu tượng Mặt trăng màu tím và nhãn: "[LƯU TRÚ QUA ĐÊM - Hạn: 06:00 ngày mai]".'
  ],
  'Golden Thread D: Khởi tạo hồ sơ khách lưu trú qua đêm HS-04', 'T1'
);

addTC(
  'TC-GRP-004', 'M03', 'P1',
  'Đoàn đi nhiều phương tiện: 1 ô tô 7 chỗ và 2 xe máy đi kèm',
  'Giao diện Web Trực ban (/staff.html)',
  'Đoàn gồm 1 ô tô "30F-123.45" và 2 xe máy "29V1-111.22", "29V2-333.44"',
  'Modal Check-in đoàn.',
  [
    '1. Tại mục Phương tiện, bấm "+ Thêm phương tiện 1": Nhập Ô tô 30F-123.45.',
    '2. Bấm "+ Thêm phương tiện 2": Nhập Xe máy 29V1-111.22.',
    '3. Bấm "+ Thêm phương tiện 3": Nhập Xe máy 29V2-333.44.',
    '4. Gán từng xe cho từng thành viên trong đoàn lái xe, bấm Hoàn tất.'
  ],
  [
    'Lượt đoàn lưu trữ thành công cả 3 phương tiện.',
    'Bảng giám sát hiển thị đầy đủ thông tin đối soát 3 xe trong bãi.'
  ],
  'Multi-vehicle: Đoàn đi nhiều phương tiện', 'T2'
);

addTC(
  'TC-GRP-005', 'M03', 'P2',
  'Chặn check-in đoàn khi có 2 thành viên trong đoàn trùng số CCCD với nhau',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhập thành viên 1 và thành viên 2 cùng mang số CCCD "001095006677"',
  'Tab Người đi cùng đang mở.',
  [
    '1. Nhập thành viên 1 có CCCD "001095006677".',
    '2. Nhập thành viên 2 có cùng số CCCD "001095006677".',
    '3. Nhấp nút "Hoàn tất".'
  ],
  [
    'Hệ thống báo lỗi đỏ: "Phát hiện số CCCD 001095006677 bị nhập trùng lặp giữa thành viên 1 và thành viên 2!".',
    'Chặn không cho phép lưu đoàn.'
  ],
  'Negative: Chống trùng CCCD nội bộ đoàn', 'T3'
);

addTC(
  'TC-GRP-006', 'M03', 'P2',
  'Tự động kiểm tra dải thẻ cấp phát có đủ số lượng sẵn sàng trong khay không',
  'Giao diện Web Trực ban (/staff.html)',
  'Đoàn 10 người nhưng chỉ còn 5 thẻ trống trong kho',
  'Kho thẻ còn ít hơn số lượng thành viên đoàn.',
  [
    '1. Nhập đoàn 10 người.',
    '2. Nhấp chọn cấp dải thẻ.'
  ],
  [
    'Hệ thống cảnh báo màu vàng: "Số lượng thẻ sẵn sàng trong kho không đủ cho đoàn 10 người (Hiện chỉ còn 5 thẻ trống)! Vui lòng bổ sung thẻ hoặc chuyển sang cấp thẻ chung".'
  ],
  'Boundary: Cảnh báo thiếu thẻ cấp phát', 'T2'
);

addTC(
  'TC-GRP-007', 'M03', 'P2',
  'Đăng ký khách lưu trú dài ngày (3 ngày) phục vụ dự án chuyển giao công nghệ',
  'Giao diện Web Trực ban (/staff.html)',
  'Thời gian dự kiến: 3 ngày liên tục',
  'Modal Check-in lưu trú.',
  [
    '1. Tích chọn "Lưu trú qua đêm".',
    '2. Tại ô Hạn rời đi, chọn ngày sau 3 ngày lúc 18:00.',
    '3. Nhập căn cứ công văn phê duyệt số "125/CV-BQP".',
    '4. Hoàn tất check-in.'
  ],
  [
    'Lưu thành công lượt lưu trú dài ngày, ghi nhận số công văn phê duyệt.',
    'Hệ thống tự động đồng bộ sang lịch công tác của phòng Hành chính.'
  ],
  'Boundary: Lưu trú nhiều ngày', 'T2'
);

addTC(
  'TC-GRP-008', 'M03', 'P2',
  'Chỉnh sửa danh sách người đi cùng khi đoàn đang ở trong cơ quan (Thêm người phát sinh)',
  'Giao diện Web Trực ban (/staff.html)',
  'Đoàn Vinaconex có thêm 1 thợ điện đến sau nhập đoàn',
  'Đoàn đang trong trạng thái "Trong đơn vị".',
  [
    '1. Trên dòng đoàn khách Vinaconex, nhấp nút "Bổ sung thành viên".',
    '2. Nhập thông tin thợ điện đến sau: "Ngô Văn Thợ 5", CCCD "026095009988".',
    '3. Cấp thẻ bổ sung "THE-206", nhấp "Lưu bổ sung".'
  ],
  [
    'Toast xanh: "Đã bổ sung thành viên Ngô Văn Thợ 5 vào đoàn Vinaconex!".',
    'Quân số đoàn tăng từ 5 lên 6 người, tổng quân số cơ quan tăng thêm 1.'
  ],
  'Dynamic Update: Bổ sung thành viên đoàn phát sinh', 'T1'
);

addTC(
  'TC-GRP-009', 'M03', 'P3',
  'Xóa bớt thành viên khỏi đoàn khi nhập nhầm trước khi bấm lưu',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhập nhầm thành viên thứ 3',
  'Modal Check-in đoàn đang mở.',
  [
    '1. Tại dòng thành viên thứ 3, nhấp vào biểu tượng thùng rác màu đỏ.',
    '2. Quan sát bảng thành viên.'
  ],
  [
    'Thành viên thứ 3 biến mất ngay lập tức, số lượng người và số thẻ tự động giảm trừ tương ứng.'
  ],
  'UX: Xóa thành viên nhập nhầm', 'T1'
);

addTC(
  'TC-GRP-010', 'M03', 'P1',
  'Đón tiếp đoàn khách VIP ngoại giao có xe biển xanh hộ tống',
  'Giao diện Web Trực ban (/staff.html)',
  'Đoàn 3 người | Xe biển xanh "80A-5678" | Cán bộ tiếp: Lãnh đạo cơ quan',
  'Modal Check-in đoàn.',
  [
    '1. Chọn chế độ khách "Đoàn Ngoại Giao / VIP".',
    '2. Nhập xe biển xanh 80A-5678, cấp 3 thẻ VIP THE-001..THE-003.',
    '3. Nhấp Hoàn tất.'
  ],
  [
    'Lượt đoàn được gán huy hiệu ngôi sao vàng VIP, thông báo chuông reo đón tiếp VIP trên máy Admin.'
  ],
  'Special Case: Tiếp đón đoàn VIP', 'T1'
);

addTC(
  'TC-GRP-011', 'M03', 'P2',
  'Kiểm tra định dạng ngày giờ lưu trú qua đêm không được chọn thời điểm trong quá khứ',
  'Giao diện Web Trực ban (/staff.html)',
  'Chọn ngày giờ dự kiến là thời điểm 2 tiếng trước',
  'Modal Check-in lưu trú.',
  [
    '1. Tích chọn lưu trú qua đêm.',
    '2. Chọn ngày giờ rời đi ở thời điểm quá khứ so với hiện tại.',
    '3. Bấm Check-in.'
  ],
  [
    'Hệ thống báo lỗi: "Thời gian rời đi dự kiến phải sau thời điểm hiện tại!".',
    'Chặn không cho lưu.'
  ],
  'Validation: Kiểm tra thời gian logic', 'T2'
);

addTC(
  'TC-GRP-012', 'M03', 'P2',
  'Cấp phát thẻ từ xa cho đoàn xe qua cổng Barrier tự động',
  'Giao diện Web Trực ban (/staff.html)',
  'Xe tải qua cổng số 2 tự động quét biển',
  'Trạm cổng phụ số 2.',
  [
    '1. Đăng ký thông tin xe tải cho đoàn.',
    '2. Nhấp nút "Mở Barrier cho xe vào".'
  ],
  [
    'Lệnh mở Barrier gửi thành công, giao diện ghi nhận xe đã qua cổng an toàn.'
  ],
  'Barrier Integration: Mở cổng barrier cho đoàn', 'T1'
);

addTC(
  'TC-GRP-013', 'M03', 'P2',
  'Chặn check-in đoàn khi Trưởng đoàn để trống số điện thoại mà đoàn có xe ô tô',
  'Giao diện Web Trực ban (/staff.html)',
  'Đoàn có xe ô tô tải nhưng Trưởng đoàn không nhập SĐT',
  'Modal Check-in đoàn.',
  [
    '1. Khai báo xe tải 29C-678.90.',
    '2. Xóa trắng số điện thoại của Trưởng đoàn.',
    '3. Bấm Check-in.'
  ],
  [
    'Hệ thống chặn: "Đoàn có phương tiện ô tô bắt buộc Trưởng đoàn hoặc lái xe phải có Số điện thoại liên hệ!".'
  ],
  'Validation: Ràng buộc SĐT trưởng đoàn có xe', 'T2'
);

addTC(
  'TC-GRP-014', 'M03', 'P3',
  'In danh sách thẻ cấp phát của cả đoàn ra giấy A4/A5 để đối chiếu',
  'Giao diện Web Trực ban (/staff.html)',
  'Bấm nút "In phiếu bàn giao đoàn"',
  'Đoàn Vinaconex đã check-in thành công.',
  [
    '1. Nhấp nút "In danh sách đoàn".',
    '2. Kiểm tra bản in xem trước.'
  ],
  [
    'Bản in hiển thị bảng danh sách 5 thành viên kèm mã thẻ, chữ ký người nhận thẻ và nội quy cơ quan.'
  ],
  'Printing: Phiếu bàn giao đoàn', 'T1'
);

console.log('✅ Đã tạo xong 14 kịch bản Module M03');

// ----------------------------------------------------------------------------
// MODULE M04: CHECK-OUT, QUẢN LÝ PHƯƠNG TIỆN & THU HỒI THẺ (13 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-COUT-001', 'M04', 'P1',
  'Check-out chuẩn cho khách đơn Nguyễn Văn An: Đối soát ảnh xe lúc vào/ra và thu hồi thẻ THE-101 (Hồ sơ HS-01)',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách Nguyễn Văn An (Hồ sơ HS-01, Ô tô 29A-123.45, Thẻ THE-101) ra về',
  'Khách đang có mặt trong cơ quan; Modal CheckOutModal mở.',
  [
    '1. Tại ô tìm kiếm nhanh, gõ "29A-123.45" hoặc quẹt thẻ "THE-101" vào đầu đọc.',
    '2. Modal CheckOutModal bật mở: Đối soát ảnh chụp xe lúc vào và ảnh camera trực tiếp lúc ra.',
    '3. Xác nhận thu hồi thẻ an ninh "THE-101".',
    '4. Nhấp nút màu xanh "Xác nhận Check-out cho khách ra".'
  ],
  [
    'Toast xanh: "Check-out thành công cho khách Nguyễn Văn An (Ô tô 29A-123.45, Thẻ THE-101)!".',
    'Dòng khách biến mất khỏi bảng "Khách Đang Có Mặt", quân số Topbar giảm -1.',
    'Thẻ THE-101 trở về trạng thái màu trắng "Sẵn sàng" trong khay thẻ.',
    'Lịch sử ra vào ghi nhận thời gian ra và ảnh chụp lúc ra.'
  ],
  'Golden Thread A: Hoàn tất chuỗi vòng đời khách cá nhân HS-01', 'T1'
);

addTC(
  'TC-COUT-004', 'M04', 'P1',
  'Check-out cho khách làm mất thẻ an ninh THE-102: Lập biên bản sự cố mất thẻ và nộp tiền phạt đền bù 50.000đ (Hồ sơ HS-02)',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách Trần Thị Bích (Hồ sơ HS-02, Xe máy 29B1-888.99, Thẻ THE-102 bị mất) ra về',
  'Khách đang ở trong cơ quan; Khách báo làm mất thẻ.',
  [
    '1. Tìm kiếm khách theo biển số "29B1-888.99", nhấp nút "Check-out".',
    '2. Tại mục Thu hồi thẻ, tích chọn "Khách báo mất thẻ an ninh".',
    '3. Modal "Lập Biên Bản Sự Cố Mất Thẻ" tự động hiện ra: Chọn lý do "Làm rơi mất thẻ", nhập số tiền bồi hoàn "50,000 VNĐ", số biên bản "BB-202610-001".',
    '4. Nhấp nút "Xác nhận Lập Biên Bản & Thu tiền đền bù".',
    '5. Nhấp nút "Xác nhận Check-out cho khách ra".'
  ],
  [
    'Toast thông báo: "Đã Check-out cho khách Trần Thị Bích (Ghi nhận mất thẻ THE-102, Biên bản BB-202610-001)!".',
    'Dòng khách chuyển khỏi bảng đang có mặt, quân số giảm -1.',
    'Mã thẻ THE-102 chuyển sang trạng thái màu đỏ: "BÁO MẤT (KHÓA)", không cho phép cấp cho lượt khác.',
    'Hồ sơ sự cố mất thẻ được chuyển sang mục Báo cáo sự cố Admin.'
  ],
  'Golden Thread B: Quy trình xử lý sự cố mất thẻ khách HS-02', 'T3'
);

addTC(
  'TC-COUT-006', 'M04', 'P1',
  'Check-out từng phần cho đoàn Vinaconex: 2 thợ ra về trước thu 2 thẻ THE-204, THE-205; 3 người và xe tải ở lại (Hồ sơ HS-03)',
  'Giao diện Web Trực ban (/staff.html)',
  'Đoàn HS-03 có 2 thợ (Nguyễn Văn Thợ 3, Phạm Văn Thợ 4) ra về trước',
  'Đoàn 5 người đang có mặt.',
  [
    '1. Trên dòng đoàn Vinaconex, nhấp nút "Check-out Từng Phần (Partial Check-out)".',
    '2. Tích chọn 2 thành viên ra trước: "Nguyễn Văn Thợ 3 (THE-204)" và "Phạm Văn Thợ 4 (THE-205)".',
    '3. Xác nhận phương tiện xe tải 29C-678.90 vẫn ở lại cùng Trưởng đoàn.',
    '4. Nhấp nút "Xác nhận Check-out 2 thành viên".'
  ],
  [
    'Hệ thống thu hồi 2 thẻ THE-204 và THE-205 về kho sẵn sàng.',
    'Bảng giám sát cập nhật đoàn Vinaconex còn lại 3 người, quân số toàn cơ quan giảm 2.',
    'Lịch sử ghi nhận giờ ra riêng cho 2 thành viên ra trước.'
  ],
  'Golden Thread C: Check-out từng phần của đoàn khách', 'T1'
);

addTC(
  'TC-COUT-007', 'M04', 'P1',
  'Check-out toàn bộ đoàn Vinaconex: Thu hồi nốt 3 thẻ THE-201..THE-203 và cho xe tải 29C-678.90 rời cổng (Hồ sơ HS-03)',
  'Giao diện Web Trực ban (/staff.html)',
  '3 người còn lại cùng Trưởng đoàn Lê Hoàng Minh và xe tải ra về',
  'Đoàn đang còn 3 người trong đơn vị.',
  [
    '1. Nhấp nút "Check-out Toàn Đoàn".',
    '2. Thu hồi toàn bộ 3 thẻ THE-201, THE-202, THE-203.',
    '3. Đối soát ảnh xe tải lúc vào và chụp ảnh xe tải lúc ra cổng.',
    '4. Nhấp nút "Hoàn tất Check-out Đóng Đoàn".'
  ],
  [
    'Toàn bộ đoàn đóng hoàn tất, quân số giảm nốt 3 người.',
    'Toàn bộ 5 thẻ của đoàn đã được thu hồi đầy đủ 100% về kho thẻ.',
    'Lượt đoàn chuyển sang trạng thái "Đã ra về hoàn toàn".'
  ],
  'Golden Thread C: Đóng toàn bộ lượt đoàn khách', 'T1'
);

addTC(
  'TC-COUT-008', 'M04', 'P2',
  'Xử lý trường hợp Nợ thẻ an ninh khi khách vội ra cổng quên mang theo thẻ',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách để quên thẻ trên phòng làm việc, xin nợ thẻ mang trả sau',
  'Modal Check-out đang mở.',
  [
    '1. Tại ô thu hồi thẻ, tích chọn "Khách nợ thẻ (Trả sau)".',
    '2. Nhập hạn cam kết trả thẻ: "Trước 17:00 chiều nay".',
    '3. Nhập số điện thoại cam kết, nhấp "Xác nhận Check-out Nợ Thẻ".'
  ],
  [
    'Khách được check-out cho ra cổng, nhưng thẻ chuyển sang màu cam "NỢ THẺ (CHƯA THU HỒI)".',
    'Hệ thống ghi nhận 1 bản ghi nợ thẻ vào sổ theo dõi nợ thẻ.'
  ],
  'Boundary: Nghiệp vụ nợ thẻ an ninh', 'T2'
);

addTC(
  'TC-COUT-011', 'M04', 'P2',
  'Khôi phục thẻ an ninh đã báo mất THE-102 sau khi khách tìm thấy mang đến trả lại',
  'Giao diện Web Trực ban (/staff.html)',
  'Thẻ THE-102 đang bị khóa; Khách mang thẻ đến nộp lại',
  'Thẻ THE-102 đang ở trạng thái BÁO MẤT.',
  [
    '1. Nhấp nút "Khôi phục thẻ mất (Recover Lost Card)".',
    '2. Quẹt thẻ hoặc nhập mã "THE-102".',
    '3. Hệ thống tìm thấy thông tin biên bản mất thẻ BB-202610-001 của khách Trần Thị Bích.',
    '4. Nhấp nút "Xác nhận đã tìm thấy thẻ & Mở khóa thẻ về kho".'
  ],
  [
    'Toast xanh: "Đã mở khóa thẻ THE-102 thành công! Thẻ đã trở lại trạng thái SẴN SÀNG cấp phát!".',
    'Biên bản mất thẻ cập nhật trạng thái "Đã thu hồi lại thẻ".',
    'Khay thẻ hiển thị THE-102 màu trắng sẵn sàng.'
  ],
  'Golden Thread B: Khôi phục thẻ mất về kho thẻ', 'T4'
);

addTC(
  'TC-COUT-002', 'M04', 'P2',
  'Cảnh báo khi biển số xe lúc ra không khớp với biển số xe đăng ký lúc vào',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách vào xe "29A-123.45" nhưng camera cổng ra phát hiện xe "30E-999.99"',
  'Modal Check-out đang mở.',
  [
    '1. Camera nhận diện biển số cổng ra đọc được "30E-999.99".',
    '2. Đối soát với biển số lúc vào "29A-123.45".'
  ],
  [
    'Cảnh báo đỏ nhấp nháy: "Cảnh báo sai lệch phương tiện: Biển số lúc ra 30E-999.99 khác biển số đăng ký lúc vào 29A-123.45!".',
    'Yêu cầu trực ban kiểm tra thực tế đối soát trước khi bấm xác nhận.'
  ],
  'Security: Cảnh báo tráo đổi phương tiện', 'T3'
);

addTC(
  'TC-COUT-003', 'M04', 'P2',
  'Check-out nhanh bằng cách quẹt thẻ an ninh trực tiếp vào đầu đọc quẹt thẻ',
  'Giao diện Web Trực ban (/staff.html)',
  'Quẹt thẻ an ninh vào đầu đọc NFC tại bàn trực ban',
  'Dashboard trực ban đang mở.',
  [
    '1. Cầm thẻ an ninh quẹt vào đầu đọc.',
    '2. Đầu đọc phát tiếng bíp.'
  ],
  [
    'Hệ thống tự động nhận diện đúng mã thẻ, tự bật ngay modal CheckOutModal của đúng khách đó mà trực ban không cần gõ bàn phím tìm kiếm.'
  ],
  'Speed UX: Quẹt thẻ tự động mở modal ra', 'T1'
);

addTC(
  'TC-COUT-005', 'M04', 'P2',
  'Xử lý thẻ bị gãy hỏng chip khi khách hoàn trả tại cổng ra',
  'Giao diện Web Trực ban (/staff.html)',
  'Thẻ bị nứt vỡ không đọc được chip',
  'Modal Check-out.',
  [
    '1. Tích chọn "Thẻ bị hư hỏng vật lý".',
    '2. Nhập lý do: "Thẻ bị gãy đôi chip do chèn ép".',
    '3. Bấm xác nhận.'
  ],
  [
    'Thẻ được thu hồi nhưng chuyển trạng thái sang "HỎNG (HỦY THẺ)", không đưa về khay cấp phát.',
    'Cập nhật sổ theo dõi hao hụt thẻ an ninh.'
  ],
  'Boundary: Thẻ bị hư hỏng', 'T2'
);

addTC(
  'TC-COUT-009', 'M04', 'P2',
  'Hủy thao tác Check-out khi bấm nhầm và giữ nguyên trạng thái khách đang có mặt',
  'Giao diện Web Trực ban (/staff.html)',
  'Bấm nhầm nút Check-out',
  'Modal Check-out đang mở.',
  [
    '1. Nhấp nút "Hủy bỏ / Đóng".'
  ],
  [
    'Modal đóng lại, khách vẫn giữ nguyên trạng thái "Trong đơn vị", quân số không đổi.'
  ],
  'UX: Hủy thao tác an toàn', 'T1'
);

addTC(
  'TC-COUT-010', 'M04', 'P1',
  'Check-out cho khách trực kỹ thuật lưu trú qua đêm Đặng Quốc Khánh lúc 06:00 sáng hôm sau (Hồ sơ HS-04)',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách Đặng Quốc Khánh (Thẻ qua đêm THE-901) hoàn thành công việc ra về',
  'Khách đang có mặt với nhãn Lưu trú qua đêm.',
  [
    '1. Tìm khách Đặng Quốc Khánh, bấm Check-out.',
    '2. Thu hồi thẻ qua đêm THE-901.',
    '3. Xác nhận hoàn tất công việc trực đêm, bấm Check-out.'
  ],
  [
    'Check-out thành công, nhãn Lưu trú qua đêm đóng lại.',
    'Thẻ THE-901 hoàn về khay thẻ qua đêm.',
    'Hệ thống ghi nhận thời gian lưu trú trọn vẹn 10 tiếng qua đêm.'
  ],
  'Golden Thread D: Hoàn tất chuỗi khách lưu trú qua đêm HS-04', 'T4'
);

addTC(
  'TC-COUT-012', 'M04', 'P3',
  'Xuất biên bản đối soát phương tiện ra về dạng tệp hình ảnh để lưu trữ',
  'Giao diện Web Trực ban (/staff.html)',
  'Bấm nút "Xuất ảnh đối soát vào - ra"',
  'Modal Check-out đã hoàn tất.',
  [
    '1. Nhấp nút "Tải ảnh đối soát".'
  ],
  [
    'Tải về tệp ảnh ghép 2 khung hình: Ảnh xe vào cổng và Ảnh xe ra cổng kèm dấu thời gian đóng dấu điện tử.'
  ],
  'Feature: Lưu trữ ảnh đối soát', 'T1'
);

addTC(
  'TC-COUT-013', 'M04', 'P3',
  'Tự động đồng bộ số lượng thẻ sẵn sàng trên khay thẻ sau mỗi lượt Check-out',
  'Giao diện Web Trực ban (/staff.html)',
  'Sau khi thu hồi thẻ',
  'Dashboard trực ban.',
  [
    '1. Quan sát khay thẻ an ninh góc màn hình sau khi thu hồi thẻ.'
  ],
  [
    'Số lượng thẻ sẵn sàng tự động nhảy tăng lên tức thì mà không cần bấm F5.'
  ],
  'Realtime Sync: Cập nhật khay thẻ thời gian thực', 'T1'
);

console.log('✅ Đã tạo xong 13 kịch bản Module M04');

// ----------------------------------------------------------------------------
// MODULE M05: GIAO DIỆN TRỰC BAN & TRA CỨU NÂNG CAO (13 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-DASH-001', 'M05', 'P1',
  'Tra cứu nhanh tức thời theo biển số xe 29A-123.45 trên thanh tìm kiếm Dashboard (Hồ sơ HS-01)',
  'Giao diện Web Trực ban (/staff.html)',
  'Từ khóa tìm kiếm: "29A-123.45" (hoặc chỉ gõ "123.45")',
  'Dashboard trực ban đang hiển thị danh sách khách có mặt.',
  [
    '1. Nhấp chuột vào ô tìm kiếm nhanh trên đầu bảng Dashboard.',
    '2. Gõ "123.45".',
    '3. Quan sát kết quả lọc tức thì.'
  ],
  [
    'Bảng lọc ngay lập tức còn đúng 1 dòng khách Nguyễn Văn An (Xe 29A-123.45, Thẻ THE-101), các dòng khách khác được ẩn đi.',
    'Từ khóa "123.45" được đánh dấu nổi bật (highlight vàng).'
  ],
  'Golden Thread A: Tra cứu nhanh phương tiện khách HS-01', 'T1'
);

addTC(
  'TC-DASH-002', 'M05', 'P1',
  'Mở modal Tra cứu Nâng cao (AdvancedSearchModal) và lọc đa tiêu chí theo khoảng ngày, theo cơ quan và theo trạng thái',
  'Giao diện Web Trực ban (/staff.html)',
  'Khoảng ngày: "Hôm nay" | Cơ quan: "Thăng Long" | Trạng thái: "Trong đơn vị"',
  'Giao diện Trực ban.',
  [
    '1. Nhấp nút "Tra cứu nâng cao" (hoặc bấm phím F3).',
    '2. Modal AdvancedSearchModal mở ra.',
    '3. Chọn Khoảng ngày: "Hôm nay".',
    '4. Tại ô Cơ quan, gõ "Thăng Long".',
    '5. Tại dropdown Trạng thái, chọn "Đang trong đơn vị".',
    '6. Nhấp nút "Tìm kiếm".'
  ],
  [
    'Bảng kết quả trả về chính xác hồ sơ khách Nguyễn Văn An của Công ty An ninh Thăng Long.',
    'Hiển thị tổng số: "Tìm thấy 1 kết quả phù hợp".'
  ],
  'Golden Thread A: Tra cứu nâng cao đa tiêu chí', 'T4'
);

addTC(
  'TC-DASH-003', 'M05', 'P2',
  'Tra cứu khách theo 4 số cuối của thẻ CCCD gắn chip (vd: "2345")',
  'Giao diện Web Trực ban (/staff.html)',
  'Từ khóa: "2345"',
  'Dashboard trực ban.',
  [
    '1. Gõ "2345" vào ô tìm kiếm.',
    '2. Quan sát kết quả.'
  ],
  [
    'Hệ thống tìm kiếm mờ (fuzzy search), hiển thị khách Nguyễn Văn An có CCCD 001099012345.'
  ],
  'Boundary: Tìm kiếm mờ theo đuôi CCCD', 'T2'
);

addTC(
  'TC-DASH-004', 'M05', 'P2',
  'Xem ảnh phóng to Lightbox khi nhấp vào ảnh đại diện của khách trên bảng',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp chuột vào ảnh chân dung khách Nguyễn Văn An',
  'Bảng khách có mặt đang hiển thị.',
  [
    '1. Nhấp chuột trực tiếp vào ảnh tròn đại diện của khách Nguyễn Văn An.',
    '2. Quan sát cửa sổ phóng to Lightbox.'
  ],
  [
    'Cửa sổ Lightbox bật lên giữa màn hình, ảnh phóng to sắc nét HD kèm thông tin Họ tên và Giờ chụp.',
    'Nhấp ra ngoài hoặc bấm dấu X để đóng Lightbox.'
  ],
  'UX: Phóng to ảnh đại diện', 'T1'
);

addTC(
  'TC-DASH-005', 'M05', 'P2',
  'Lọc danh sách khách theo Cán bộ tiếp đón: Chọn "Trần Quốc Tuấn (Phòng CNTT)"',
  'Giao diện Web Trực ban (/staff.html)',
  'Dropdown lọc: "Trần Quốc Tuấn"',
  'Bảng khách có mặt.',
  [
    '1. Tại thanh bộ lọc trên bảng, mở dropdown "Lọc theo cán bộ đón".',
    '2. Chọn "Trần Quốc Tuấn (Phòng Kỹ thuật & CNTT)".'
  ],
  [
    'Bảng chỉ hiển thị các khách đang làm việc với ông Trần Quốc Tuấn (Nguyễn Văn An, Đặng Quốc Khánh).'
  ],
  'Filter: Lọc theo cán bộ tiếp đón', 'T1'
);

addTC(
  'TC-DASH-006', 'M05', 'P2',
  'Lọc danh sách theo loại phương tiện: Chỉ hiển thị khách đi Ô tô',
  'Giao diện Web Trực ban (/staff.html)',
  'Chọn filter tab: "Ô tô"',
  'Bảng khách có mặt.',
  [
    '1. Nhấp vào tab lọc phương tiện "Ô tô".'
  ],
  [
    'Danh sách chỉ hiển thị các lượt khách có đăng ký xe ô tô, đếm tổng số xe ô tô đang trong bãi.'
  ],
  'Filter: Phân loại theo xe', 'T1'
);

addTC(
  'TC-DASH-007', 'M05', 'P3',
  'Thông báo khi tìm kiếm không có kết quả phù hợp',
  'Giao diện Web Trực ban (/staff.html)',
  'Từ khóa: "KHACH_KHONG_TON_TAI_999"',
  'Bảng trực ban.',
  [
    '1. Gõ từ khóa không tồn tại vào ô tìm kiếm.'
  ],
  [
    'Bảng hiển thị hình minh họa trống kèm thông báo thân thiện: "Không tìm thấy lượt khách nào phù hợp với từ khóa!".',
    'Có nút "Xóa bộ lọc" để quay về toàn bộ danh sách.'
  ],
  'Boundary: Không tìm thấy kết quả', 'T2'
);

addTC(
  'TC-DASH-008', 'M05', 'P1',
  'Hiển thị cảnh báo màu đỏ thời gian thực khi khách ở lại cơ quan quá 8 tiếng trong ngày',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách vào từ 07:00 sáng đến 16:00 chiều chưa ra',
  'Dashboard trực ban.',
  [
    '1. Quan sát cột "Thời gian ở lại" của khách lưu lại lâu.'
  ],
  [
    'Thời gian ở lại chuyển sang màu đỏ kèm biểu tượng đồng hồ cảnh báo: "[Quá 8 tiếng - Cần liên hệ kiểm tra]".'
  ],
  'Business Rule: Cảnh báo thời gian lưu trú trong ngày', 'T3'
);

addTC(
  'TC-DASH-009', 'M05', 'P2',
  'Sắp xếp bảng danh sách khách theo Cột: Sắp xếp theo Giờ vào (Mới nhất / Cũ nhất)',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp chuột vào tiêu đề cột "Giờ vào"',
  'Bảng trực ban.',
  [
    '1. Nhấp chuột vào tiêu đề cột "Giờ vào".',
    '2. Nhấp lần 2 để đổi chiều sắp xếp.'
  ],
  [
    'Mũi tên sắp xếp đổi chiều, danh sách đảo thứ tự lượt khách mới vào nhất lên đầu hoặc xuống cuối chính xác.'
  ],
  'UX: Sắp xếp dữ liệu theo cột', 'T1'
);

addTC(
  'TC-DASH-010', 'M05', 'P2',
  'Xuất danh sách khách đang có mặt ra file Excel nhanh từ giao diện Trực ban',
  'Giao diện Web Trực ban (/staff.html)',
  'Bấm nút "Xuất Excel danh sách có mặt"',
  'Bảng trực ban có khách.',
  [
    '1. Nhấp nút "Xuất Excel" trên thanh công cụ bảng.'
  ],
  [
    'Trình duyệt tải về file `DanhSach_KhachDangCoMat_[Ngay].xlsx` chứa đúng danh sách các khách đang có mặt.'
  ],
  'Export: Xuất file danh sách trực ban', 'T1'
);

addTC(
  'TC-DASH-011', 'M05', 'P3',
  'Chuyển đổi phân trang (Pagination) khi số lượng khách có mặt vượt quá 20 người',
  'Giao diện Web Trực ban (/staff.html)',
  'Chọn hiển thị 10 dòng / trang, bấm Trang 2',
  'Danh sách có trên 20 khách.',
  [
    '1. Chọn dropdown "10 dòng/trang".',
    '2. Nhấp nút trang "2".'
  ],
  [
    'Bảng chuyển sang hiển thị các khách từ số 11 đến 20, chỉ số phân trang cập nhật "Hiển thị 11 - 20 trên tổng số X".'
  ],
  'Pagination: Phân trang danh sách', 'T2'
);

addTC(
  'TC-DASH-012', 'M05', 'P2',
  'Tự động ẩn/hiện cột thông tin trên bảng theo tùy chọn của cán bộ trực',
  'Giao diện Web Trực ban (/staff.html)',
  'Tắt hiển thị cột "Quê quán", bật cột "Số điện thoại"',
  'Nút cài đặt hiển thị cột.',
  [
    '1. Nhấp nút icon bánh răng "Cài đặt cột hiển thị".',
    '2. Bỏ tích ô "Quê quán", tích ô "Số điện thoại".',
    '3. Bấm Áp dụng.'
  ],
  [
    'Cột Quê quán ẩn đi, cột Số điện thoại xuất hiện ngay trên bảng.'
  ],
  'UX: Tùy biến cột hiển thị', 'T2'
);

addTC(
  'TC-DASH-013', 'M05', 'P1',
  'Xem thống kê tổng quan nhanh trong ca trực (Modal DetailedStatsModal)',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp nút "Thống kê ca trực" trên Topbar',
  'Dashboard trực ban.',
  [
    '1. Nhấp nút "Thống kê ca trực".',
    '2. Xem biểu đồ số lượng khách theo từng khung giờ trong ngày.'
  ],
  [
    'Modal hiển thị biểu đồ trực quan lượt khách theo giờ cao điểm (08:00 - 09:30 sáng, 13:30 - 14:30 chiều).'
  ],
  'Analytics: Báo cáo nhanh ca trực', 'T1'
);

console.log('✅ Đã tạo xong 13 kịch bản Module M05');

// ----------------------------------------------------------------------------
// MODULE M06: CHI TIẾT LƯỢT KHÁCH & DÒNG THỜI GIAN TIMELINE (13 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-VDET-001', 'M06', 'P1',
  'Xem chi tiết toàn diện lượt khách Nguyễn Văn An trên VisitDetailsModal: Đối soát toàn bộ ảnh, timeline và thông tin xe (Hồ sơ HS-01)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-01: Khách Nguyễn Văn An (Mã lượt: VIS-202610-001)',
  'Lượt khách Nguyễn Văn An đã hoàn tất Check-in hoặc Check-out.',
  [
    '1. Trên dòng khách Nguyễn Văn An, nhấp nút màu xanh "Xem Chi Tiết".',
    '2. Modal VisitDetailsModal mở ra: Quan sát thẻ định danh thông tin khách (Họ tên, CCCD chip, SĐT, Cơ quan).',
    '3. Kiểm tra mục Phương tiện: Hiển thị đúng Ô tô 29A-123.45 kèm ảnh xe.',
    '4. Kiểm tra mục Tiếp đón: Cán bộ Trần Quốc Tuấn, Mục đích "Liên hệ công việc.". Mã thẻ "THE-101".',
    '5. Kiểm tra Dòng thời gian Timeline: Điểm danh chính xác mốc giờ vào, mốc giờ ra và cán bộ xử lý.'
  ],
  [
    'Modal hiển thị đầy đủ 100% dữ liệu đã nhập từ lúc check-in đến check-out, không bị khuyết thiếu bất kỳ trường nào.',
    'Timeline hiển thị trực quan dạng trục thời gian dọc có icon và mốc thời gian chi tiết từng giây.'
  ],
  'Golden Thread A: Kiểm tra tính toàn vẹn hồ sơ chi tiết khách HS-01', 'T4'
);

addTC(
  'TC-VDET-002', 'M06', 'P1',
  'Xem thư viện ảnh (Photo Gallery) của lượt khách gồm ảnh mặt webcam, ảnh xe ô tô và ảnh thẻ chip CCCD',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp tab "Bộ sưu tập ảnh (Photos)" trong VisitDetailsModal',
  'Modal chi tiết đang mở.',
  [
    '1. Tại modal chi tiết, nhấp tab "Thư viện ảnh".',
    '2. Nhấp vào ảnh xe ô tô 29A-123.45.',
    '3. Sử dụng con lăn chuột để zoom phóng to ảnh.'
  ],
  [
    'Ảnh hiển thị sắc nét, chức năng zoom in/out và kéo rê ảnh (pan) hoạt động mượt mà để soi rõ biển số xe.'
  ],
  'Feature: Soi ảnh chi tiết trong thư viện', 'T1'
);

addTC(
  'TC-VDET-003', 'M06', 'P1',
  'Kiểm tra Timeline ghi nhận sự cố mất thẻ và biên bản bồi hoàn của khách Trần Thị Bích (Hồ sơ HS-02)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-02: Khách Trần Thị Bích',
  'Khách đã check-out kèm báo mất thẻ.',
  [
    '1. Mở chi tiết lượt khách Trần Thị Bích.',
    '2. Cuộn đến mốc thời gian Check-out trên Timeline.'
  ],
  [
    'Timeline có 1 mốc sự kiện màu đỏ: "SỰ CỐ: Báo mất thẻ an ninh THE-102. Lập biên bản BB-202610-001 (Đền bù 50,000 VNĐ)".',
    'Có liên kết nhấp mở xem nội dung chi tiết biên bản mất thẻ.'
  ],
  'Golden Thread B: Ghi nhận sự cố mất thẻ trên Timeline', 'T4'
);

addTC(
  'TC-VDET-004', 'M06', 'P2',
  'Cập nhật bổ sung ghi chú vào lượt khách đang diễn ra (UpdateVisitModal)',
  'Giao diện Web Trực ban (/staff.html)',
  'Ghi chú bổ sung: "Khách chuyển sang làm việc tại Phòng Hội thảo tầng 2"',
  'Modal chi tiết khách đang mở.',
  [
    '1. Nhấp nút "Cập nhật thông tin / Ghi chú".',
    '2. Nhập nội dung: "Khách chuyển sang làm việc tại Phòng Hội thảo tầng 2".',
    '3. Nhấp "Lưu ghi chú".'
  ],
  [
    'Timeline ghi nhận thêm 1 mốc: "[Ghi chú bổ sung lúc 10:15]: Khách chuyển sang làm việc tại Phòng Hội thảo tầng 2".'
  ],
  'Feature: Cập nhật ghi chú thời gian thực', 'T1'
);

addTC(
  'TC-VDET-005', 'M06', 'P2',
  'Xem chi tiết danh sách 5 thành viên của đoàn khách Vinaconex trong VisitDetailsModal (Hồ sơ HS-03)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-03: Đoàn Vinaconex',
  'Modal chi tiết đoàn.',
  [
    '1. Mở chi tiết lượt đoàn Vinaconex.',
    '2. Nhấp tab "Danh sách đoàn (5 người)".'
  ],
  [
    'Bảng danh sách 5 thành viên hiện ra đầy đủ: Trưởng đoàn và 4 thợ, kèm mã thẻ riêng của từng người và mốc giờ ra riêng của 2 thợ ra trước.'
  ],
  'Golden Thread C: Chi tiết thành viên đoàn khách', 'T4'
);

addTC(
  'TC-VDET-006', 'M06', 'P2',
  'In Phiếu thông tin chi tiết lượt khách ra máy in văn phòng (Khổ A4/A5)',
  'Giao diện Web Trực ban (/staff.html)',
  'Bấm nút "In phiếu chi tiết (Print)"',
  'Modal chi tiết đang mở.',
  [
    '1. Nhấp nút "In phiếu chi tiết" góc trên modal.',
    '2. Kiểm tra cửa sổ xem trước in của trình duyệt.'
  ],
  [
    'Bản in hiển thị mẫu Phiếu Vào/Ra cơ quan chuẩn chỉ, có quốc huy/logo, đầy đủ ảnh đối soát 2 chiều và thông tin pháp lý.'
  ],
  'Printing: In phiếu chi tiết lượt khách', 'T1'
);

addTC(
  'TC-VDET-007', 'M06', 'P2',
  'Xem chi tiết lượt khách lưu trú qua đêm Đặng Quốc Khánh kèm thông tin công văn phê duyệt (Hồ sơ HS-04)',
  'Giao diện Web Trực ban (/staff.html)',
  'Hồ sơ HS-04',
  'Khách lưu trú qua đêm.',
  [
    '1. Mở chi tiết lượt khách Đặng Quốc Khánh.',
    '2. Kiểm tra phần thông tin lưu trú.'
  ],
  [
    'Hiển thị rõ: Giờ vào, Giờ dự kiến rời đi, Cán bộ bảo lãnh Trần Quốc Tuấn, Phòng trực máy chủ, Thẻ qua đêm THE-901.'
  ],
  'Golden Thread D: Chi tiết khách lưu trú qua đêm', 'T1'
);

addTC(
  'TC-VDET-008', 'M06', 'P3',
  'Tải về máy tính ảnh chân dung gốc độ phân giải cao của khách',
  'Giao diện Web Trực ban (/staff.html)',
  'Bấm nút "Tải ảnh về máy"',
  'Thư viện ảnh lượt khách.',
  [
    '1. Nhấp nút "Tải ảnh" dưới chân dung khách.'
  ],
  [
    'Trình duyệt tải về tệp ảnh định dạng JPG/PNG sắc nét nguyên bản.'
  ],
  'Feature: Tải ảnh gốc', 'T1'
);

addTC(
  'TC-VDET-009', 'M06', 'P3',
  'Sao chép nhanh mã số CCCD và Biển số xe vào Clipboard chỉ bằng 1 cú nhấp',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp icon Copy bên cạnh số CCCD',
  'Modal chi tiết.',
  [
    '1. Nhấp vào icon Copy cạnh số CCCD "001099012345".',
    '2. Dán vào Notepad kiểm tra.'
  ],
  [
    'Hệ thống hiện tooltip nhỏ: "Đã sao chép!", dán ra đúng chuẩn chuỗi số "001099012345".'
  ],
  'UX: Copy nhanh dữ liệu', 'T1'
);

addTC(
  'TC-VDET-010', 'M06', 'P2',
  'Hiển thị thông tin Cán bộ tiếp nhận đã xác nhận đón tiếp trên Timeline',
  'Giao diện Web Trực ban (/staff.html)',
  'Lượt khách có cán bộ tiếp nhận xác nhận qua điện thoại',
  'Modal chi tiết.',
  [
    '1. Quan sát mốc "Tiếp đón" trên Timeline.'
  ],
  [
    'Timeline ghi nhận: "Cán bộ Trần Quốc Tuấn đã tiếp nhận khách lúc 08:35 tại Phòng 302 Nhà A".'
  ],
  'Workflow: Mốc tiếp đón trên Timeline', 'T1'
);

addTC(
  'TC-VDET-011', 'M06', 'P2',
  'Kiểm tra định dạng thời lượng lưu trú được tính toán chuẩn xác (vd: "1 giờ 25 phút")',
  'Giao diện Web Trực ban (/staff.html)',
  'Khách vào lúc 08:30, ra lúc 09:55',
  'Lượt khách đã check-out.',
  [
    '1. Mở chi tiết lượt khách đã ra về.',
    '2. Quan sát trường "Thời lượng lưu trú".'
  ],
  [
    'Thời lượng hiển thị chuẩn tiếng Việt thân thiện: "1 giờ 25 phút" (không hiển thị dạng số thô thập phân hay mili-giây).'
  ],
  'UX: Định dạng thời lượng thân thiện', 'T1'
);

addTC(
  'TC-VDET-012', 'M06', 'P3',
  'Đóng nhanh Modal chi tiết bằng phím ESC hoặc nhấp ra ngoài vùng phủ (Backdrop click)',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấn ESC trên bàn phím',
  'Modal VisitDetailsModal đang mở.',
  [
    '1. Nhấn phím ESC trên bàn phím.'
  ],
  [
    'Modal đóng ngay lập tức, không bị đơ giật.'
  ],
  'UX: Đóng modal thuận tiện', 'T1'
);

addTC(
  'TC-VDET-013', 'M06', 'P2',
  'Đối soát ảnh xe vào và ảnh xe ra đặt cạnh nhau (Side-by-Side Comparison)',
  'Giao diện Web Trực ban (/staff.html)',
  'Nhấp xem mục "Đối soát phương tiện"',
  'Khách đi ô tô đã check-out.',
  [
    '1. Mở mục đối soát xe trong modal chi tiết.'
  ],
  [
    'Hai khung ảnh lúc vào và lúc ra đặt song song cạnh nhau, làm nổi bật biển số xe để người dùng dễ dàng so sánh bằng mắt.'
  ],
  'Feature: Đối soát ảnh song song', 'T1'
);

console.log('✅ Đã tạo xong 13 kịch bản Module M06');

// ----------------------------------------------------------------------------
// MODULE M07: PHÂN HỆ SỔ SÁCH NGOẠI LỆ - DATAENTRY (18 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-DENT-001', 'M07', 'P1',
  'Đăng nhập giao diện Sổ sách ngoại lệ (/dataentry.html) bằng tài khoản nhaplieu / 123456',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Tài khoản: "nhaplieu" | Mật khẩu: "123456"',
  'Truy cập /dataentry.html.',
  [
    '1. Nhập tài khoản "nhaplieu".',
    '2. Nhập mật khẩu "123456".',
    '3. Nhấp "Đăng Nhập".'
  ],
  [
    'Đăng nhập thành công vào Trung tâm Nhập liệu & Sổ sách ngoại lệ.',
    'Hiển thị thanh menu chuyên biệt: Đăng ký trước lịch hẹn, Sổ ghi ngoại lệ, Hậu kiểm sổ sách.'
  ],
  'Happy Path: Đăng nhập phân hệ DataEntry', 'T1'
);

addTC(
  'TC-DENT-002', 'M07', 'P1',
  'Đăng ký trước lịch hẹn đón tiếp (Pre-registration) cho khách Vũ Đình Toàn (Hồ sơ HS-05)',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Hồ sơ HS-05: Khách "Vũ Đình Toàn" | CCCD "031092003344" | SĐT "0936.445.566" | Cơ quan "Công ty Dịch vụ Vệ sinh Hoàn Mỹ" | Ngày hẹn: Ngày mai lúc 09:00 | Cán bộ tiếp đón: "Hoàng Bích Ngọc" | Mục đích: "Liên hệ công việc." | Xe máy "29X5-678.12"',
  'Giao diện DataEntry đang mở.',
  [
    '1. Nhấp tab "Đăng Ký Trước Lịch Hẹn (Pre-registration)".',
    '2. Nhấp nút "+ Tạo Lịch Hẹn Mới".',
    '3. Nhập đầy đủ thông tin khách Vũ Đình Toàn theo hồ sơ HS-05.',
    '4. Kiểm tra mục đích mặc định hiển thị "Liên hệ công việc.". Chọn ngày giờ hẹn ngày mai.',
    '5. Nhấp nút "Lưu & Phát Hành Lịch Hẹn".'
  ],
  [
    'Toast xanh: "Tạo lịch hẹn thành công cho khách Vũ Đình Toàn. Mã hẹn: PRE-202610-001!".',
    'Lịch hẹn xuất hiện trên bảng danh sách chờ tiếp đón của trạm gác Cổng 01.'
  ],
  'Golden Thread E: Đăng ký trước lịch hẹn HS-05', 'T1'
);

addTC(
  'TC-DENT-003', 'M07', 'P1',
  'Trạm gác kích hoạt tiếp đón 1 chạm từ lịch hẹn đăng ký trước của khách Vũ Đình Toàn',
  'Giao diện Web Trực ban (/staff.html)',
  'Lịch hẹn PRE-202610-001 có sẵn trên trạm gác',
  'Khách Vũ Đình Toàn đến cổng.',
  [
    '1. Trực ban mở tab "Lịch hẹn hôm nay".',
    '2. Thấy tên khách Vũ Đình Toàn, nhấp nút màu xanh "Tiếp đón ngay".',
    '3. Modal Check-in tự động điền 100% thông tin đã đăng ký trước mà không cần nhập lại.',
    '4. Cấp thẻ THE-105, bấm Hoàn tất.'
  ],
  [
    'Check-in hoàn tất trong 5 giây, khách vào cơ quan nhanh chóng không phải chờ đợi.'
  ],
  'Golden Thread E: Kích hoạt tiếp đón từ lịch hẹn', 'T4'
);

addTC(
  'TC-DENT-004', 'M07', 'P2',
  'Ghi sổ ngoại lệ cho khách quên mang toàn bộ giấy tờ tùy thân có cán bộ cơ quan bảo lãnh',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Khách: "Lê Minh Tuấn" | Không có giấy tờ | Cán bộ bảo lãnh: "Phạm Hùng Cường (Trưởng phòng Hành chính)" | Lý do: "Đến xử lý công văn khẩn cấp"',
  'Tab Ghi sổ ngoại lệ.',
  [
    '1. Nhấp "+ Tạo Bản Ghi Sổ Ngoại Lệ".',
    '2. Nhập họ tên khách "Lê Minh Tuấn", tích chọn "Không có giấy tờ tùy thân (Cán bộ bảo lãnh)".',
    '3. Chọn cán bộ bảo lãnh "Phạm Hùng Cường".',
    '4. Chụp ảnh chân dung khách bằng camera bàn tiếp dân.',
    '5. Nhấp "Lưu sổ ngoại lệ & Cấp thẻ tạm".'
  ],
  [
    'Hệ thống lưu thành công bản ghi ngoại lệ với nhãn màu cam: "[SỔ NGOẠI LỆ - BẢO LÃNH]".',
    'Yêu cầu chuyển sang hàng đợi hậu kiểm.'
  ],
  'Exception: Ghi sổ khách được bảo lãnh', 'T3'
);

addTC(
  'TC-DENT-005', 'M07', 'P1',
  'Quy trình Hậu kiểm (Audit Entry): Trưởng ca duyệt hoặc từ chối bản ghi sổ ngoại lệ',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Bản ghi ngoại lệ của khách Lê Minh Tuấn đang chờ duyệt',
  'Tab Hậu kiểm sổ sách (Audit Entry).',
  [
    '1. Nhấp tab "Hậu kiểm & Phê duyệt (Audit Entry)".',
    '2. Thấy bản ghi của khách Lê Minh Tuấn, nhấp "Xem chi tiết đối soát".',
    '3. Kiểm tra ảnh chụp, lý do bảo lãnh của Trưởng phòng Hành chính.',
    '4. Nhấp nút màu xanh "Phê Duyệt Hợp Lệ".'
  ],
  [
    'Trạng thái bản ghi chuyển sang màu xanh: "ĐÃ HẬU KIỂM (APPROVED)".',
    'Lưu vết người phê duyệt và thời gian duyệt.'
  ],
  'Audit Flow: Hậu kiểm sổ sách', 'T4'
);

addTC(
  'TC-DENT-006', 'M07', 'P2',
  'Nhập liệu hàng loạt (Batch Import) danh sách 20 khách tham dự Hội thảo từ file Excel',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'File Excel chứa 20 dòng danh sách đại biểu hội thảo',
  'Tab Đăng ký trước lịch hẹn.',
  [
    '1. Nhấp nút "Nhập danh sách từ Excel".',
    '2. Chọn file `DanhSach_DaiBieu_HoiThao.xlsx`.',
    '3. Kiểm tra bảng xem trước (Preview) 20 dòng đại biểu.',
    '4. Nhấp "Xác nhận Nhập 20 bản ghi".'
  ],
  [
    'Toast xanh: "Đã nhập thành công 20 lịch hẹn đại biểu hội thảo vào hệ thống!".',
    'Toàn bộ 20 đại biểu sẵn sàng để trạm gác đón tiếp hàng loạt.'
  ],
  'Batch Processing: Nhập liệu đoàn hội thảo từ Excel', 'T2'
);

addTC(
  'TC-DENT-007', 'M07', 'P2',
  'Chặn tạo lịch hẹn khi ngày hẹn được chọn ở thời điểm trong quá khứ',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Chọn ngày hẹn là ngày hôm qua',
  'Form tạo lịch hẹn.',
  [
    '1. Tại ô Ngày hẹn, chọn ngày hôm qua.',
    '2. Nhấp nút "Lưu".'
  ],
  [
    'Báo lỗi đỏ: "Ngày hẹn đón tiếp không được chọn thời điểm trong quá khứ!".',
    'Chặn lưu.'
  ],
  'Validation: Kiểm tra ngày hẹn', 'T2'
);

addTC(
  'TC-DENT-008', 'M07', 'P2',
  'Hủy lịch hẹn đã đăng ký trước khi khách thông báo hoãn lịch công tác',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Lịch hẹn PRE-202610-001',
  'Danh sách lịch hẹn.',
  [
    '1. Trên dòng lịch hẹn, nhấp nút "Hủy lịch hẹn".',
    '2. Nhập lý do: "Đối tác hoãn lịch công tác sang tuần sau".',
    '3. Bấm xác nhận.'
  ],
  [
    'Trạng thái lịch hẹn chuyển sang màu xám "ĐÃ HỦY".',
    'Trạm gác không còn hiển thị lịch hẹn này.'
  ],
  'Feature: Hủy lịch hẹn', 'T1'
);

addTC(
  'TC-DENT-009', 'M07', 'P3',
  'Tìm kiếm lịch hẹn theo Số điện thoại hoặc Mã lịch hẹn',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Từ khóa: "0936.445.566"',
  'Bảng danh sách lịch hẹn.',
  [
    '1. Gõ SĐT "0936.445.566" vào ô tìm kiếm.',
    '2. Quan sát kết quả lọc.'
  ],
  [
    'Tìm thấy chính xác lịch hẹn của khách Vũ Đình Toàn.'
  ],
  'Filter: Tìm kiếm lịch hẹn', 'T1'
);

addTC(
  'TC-DENT-010', 'M07', 'P2',
  'Gửi email thông báo tự động cho cán bộ tiếp đón khi lịch hẹn được tạo thành công',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Tạo lịch hẹn gặp ông Trần Quốc Tuấn',
  'Tạo lịch hẹn mới.',
  [
    '1. Hoàn tất tạo lịch hẹn.',
    '2. Quan sát thông báo hệ thống.'
  ],
  [
    'Toast xanh: "Lịch hẹn đã tạo thành công và đã gửi thông báo đến email tuan.tq@smartvms.local!".'
  ],
  'Notification: Báo cán bộ đón tiếp', 'T1'
);

addTC(
  'TC-DENT-011', 'M07', 'P2',
  'Cảnh báo khi nhập trùng lặp số CCCD giữa 2 lịch hẹn trong cùng một khung giờ',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Nhập trùng CCCD cho 2 lịch hẹn lúc 09:00',
  'Form tạo lịch hẹn.',
  [
    '1. Tạo lịch hẹn 2 có cùng CCCD với lịch hẹn 1 trong cùng ngày giờ.',
    '2. Bấm Lưu.'
  ],
  [
    'Hệ thống cảnh báo: "Khách có CCCD này đã có lịch hẹn lúc 09:00 cùng ngày!".'
  ],
  'Boundary: Chống trùng lịch hẹn', 'T2'
);

addTC(
  'TC-DENT-012', 'M07', 'P2',
  'Xuất danh sách đăng ký trước ra file Excel theo ngày để trạm gác in bản giấy',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Bấm nút "Xuất danh sách lịch hẹn hôm nay"',
  'Bảng lịch hẹn.',
  [
    '1. Nhấp nút "Xuất Excel".'
  ],
  [
    'Tải về file Excel chứa đầy đủ danh sách khách hẹn trước trong ngày.'
  ],
  'Export: Xuất file lịch hẹn', 'T1'
);

addTC(
  'TC-DENT-013', 'M07', 'P3',
  'Chỉnh sửa thông tin lịch hẹn đã tạo (Đổi giờ hẹn hoặc đổi cán bộ tiếp đón)',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Đổi giờ từ 09:00 sang 10:30',
  'Bảng lịch hẹn.',
  [
    '1. Nhấp icon Cây bút "Chỉnh sửa" trên dòng lịch hẹn.',
    '2. Đổi giờ hẹn thành 10:30, bấm Lưu.'
  ],
  [
    'Lịch hẹn cập nhật giờ mới 10:30 thành công.'
  ],
  'Feature: Sửa lịch hẹn', 'T1'
);

addTC(
  'TC-DENT-014', 'M07', 'P2',
  'Ghi sổ sách ngoại lệ trường hợp khẩn cấp: Đội cứu hộ / Cứu hỏa / Cấp cứu vào cổng',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Chọn phân loại "Trường hợp khẩn cấp (Emergency)"',
  'Form sổ ngoại lệ.',
  [
    '1. Chọn loại "Khẩn cấp: Xe Cứu hỏa / Cấp cứu 115".',
    '2. Nhập biển số xe cấp cứu "29A-001.15", bấm "Mở cổng khẩn cấp".'
  ],
  [
    'Hệ thống cho phép lưu 1 chạm tức thì không bắt buộc nhập CCCD, ghi nhận giờ vào phục vụ cứu nạn.'
  ],
  'Emergency: Tiếp đón xe cứu thương/cứu hỏa khẩn cấp', 'T3'
);

addTC(
  'TC-DENT-015', 'M07', 'P2',
  'Khóa sổ sách ngoại lệ sau 24h và không cho phép chỉnh sửa dữ liệu đã duyệt',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Bản ghi sổ sách ngày hôm trước đã được duyệt',
  'Bảng hậu kiểm.',
  [
    '1. Thử bấm nút Sửa trên bản ghi ngày hôm trước đã duyệt.'
  ],
  [
    'Nút sửa bị khóa (disabled) kèm icon ổ khóa: "Bản ghi đã chốt sổ, không thể chỉnh sửa!".'
  ],
  'Integrity: Đảm bảo toàn vẹn sổ sách', 'T3'
);

addTC(
  'TC-DENT-016', 'M07', 'P3',
  'Lọc danh bạ cơ quan và tự động gợi ý (Autocomplete) khi gõ tên doanh nghiệp đối tác',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Gõ từ khóa "Thăng Long"',
  'Ô nhập Cơ quan.',
  [
    '1. Gõ "Thăng".',
    '2. Quan sát danh sách gợi ý xổ xuống.'
  ],
  [
    'Gợi ý hiện ra "Công ty CP Công nghệ An ninh Thăng Long", nhấp chọn điền tự động.'
  ],
  'Autocomplete: Gợi ý tên cơ quan', 'T1'
);

addTC(
  'TC-DENT-017', 'M07', 'P3',
  'Đính kèm file scan hợp đồng hoặc công văn phê duyệt (.pdf) vào lịch hẹn',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Đính kèm file `CongVan_123.pdf`',
  'Form lịch hẹn.',
  [
    '1. Nhấp nút "Đính kèm tệp PDF công văn".',
    '2. Chọn file PDF, bấm Lưu.'
  ],
  [
    'File PDF được gắn kèm lịch hẹn, có nút nhấp xem trước trực tiếp trên trình duyệt.'
  ],
  'Attachment: Đính kèm file PDF', 'T1'
);

addTC(
  'TC-DENT-018', 'M07', 'P1',
  'Đối soát giữa số lượng đăng ký trước và số lượng khách thực tế đã đến cổng',
  'Giao diện Sổ sách DataEntry (/dataentry.html)',
  'Tab Thống kê đối soát lịch hẹn',
  'Bảng thống kê DataEntry.',
  [
    '1. Mở tab Thống kê đối soát.',
    '2. Quan sát tỷ lệ khách đến hẹn.'
  ],
  [
    'Bảng thể hiện rõ: Số lịch hẹn đã tạo (5), Số khách đã đến đón tiếp thành công (4), Số lịch hẹn vắng mặt/hủy (1).'
  ],
  'Analytics: Báo cáo đối soát lịch hẹn', 'T1'
);

console.log('✅ Đã tạo xong 18 kịch bản Module M07');

// ----------------------------------------------------------------------------
// MODULE M08: QUẢN TRỊ ADMIN & GIÁM SÁT VẬN HÀNH (16 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-ADMN-001', 'M08', 'P1',
  'Giám sát thời gian thực quân số khách và phương tiện đang có mặt trên Dashboard Admin (/admin.html)',
  'Giao diện Web Admin (/admin.html)',
  'Quan sát thẻ KPI tổng thể và biểu đồ giám sát thời gian thực',
  'Đã đăng nhập Admin; Trạm gác đang có khách hoạt động.',
  [
    '1. Trên menu Admin, nhấp tab "Tổng quan (Dashboard)".',
    '2. Quan sát 4 thẻ KPI cốt lõi: Tổng khách trong ngày, Quân số đang bên trong, Số xe ô tô trong bãi, Sự cố mất thẻ.',
    '3. Kiểm tra số liệu khớp 100% với số liệu trên màn hình Trực ban.'
  ],
  [
    'Số liệu hiển thị chính xác thời gian thực, tự động cập nhật khi có khách vào/ra mà không cần tải lại trang.'
  ],
  'Dashboard: Giám sát KPI tổng thể', 'T1'
);

addTC(
  'TC-ADMN-002', 'M08', 'P1',
  'Tab "Khách Đang Bên Trong" (InsideTab): Giám sát chi tiết toàn bộ khách đang có mặt trên tất cả các trạm gác',
  'Giao diện Web Admin (/admin.html)',
  'Nhấp tab "Khách Đang Bên Trong (InsideTab)"',
  'Admin portal.',
  [
    '1. Nhấp tab "Khách Đang Bên Trong".',
    '2. Xem bảng tổng hợp khách từ Cổng 01, Cổng 02, Cổng 03 tập trung về 1 màn hình.'
  ],
  [
    'Hiển thị đầy đủ danh sách khách đang có mặt trên toàn cơ quan, phân biệt rõ khách vào từ cổng nào và cán bộ nào đang đón tiếp.'
  ],
  'Inside Monitoring: Giám sát tập trung đa cổng', 'T1'
);

addTC(
  'TC-ADMN-003', 'M08', 'P1',
  'Tab "Lịch Sử Ra Vào" (HistoryTab): Tra cứu đối soát toàn bộ lịch sử lượt khách từ trước đến nay',
  'Giao diện Web Admin (/admin.html)',
  'Tìm kiếm hồ sơ khách Nguyễn Văn An (HS-01)',
  'Admin portal.',
  [
    '1. Nhấp tab "Lịch sử ra vào (HistoryTab)".',
    '2. Gõ "Nguyễn Văn An" vào ô tìm kiếm.',
    '3. Nhấp xem chi tiết.'
  ],
  [
    'Bảng trả về đúng lượt vào của khách Nguyễn Văn An, đầy đủ thời gian vào/ra, ảnh xe, ảnh mặt và cán bộ tiếp đón.'
  ],
  'Golden Thread A: Đối soát lịch sử khách HS-01', 'T4'
);

addTC(
  'TC-ADMN-004', 'M08', 'P1',
  'Quản lý Danh mục Thẻ An ninh & Cấu hình dải thẻ cho từng trạm gác',
  'Giao diện Web Admin (/admin.html)',
  'Cấu hình dải thẻ Cổng 1 từ THE-101 đến THE-150',
  'Tab Cài đặt thẻ an ninh.',
  [
    '1. Nhấp mục "Quản lý Thẻ An Ninh".',
    '2. Nhấp "+ Thêm dải thẻ mới".',
    '3. Nhập tiền tố "THE-", dải từ 101 đến 150, gán cho "Trạm Cổng 01".',
    '4. Nhấp "Lưu cấu hình".'
  ],
  [
    '50 thẻ được tạo tự động và hiển thị sẵn sàng trên trạm Cổng 01.'
  ],
  'Configuration: Quản lý dải thẻ an ninh', 'T1'
);

addTC(
  'TC-ADMN-005', 'M08', 'P1',
  'Quản lý Danh sách Người dùng & Phân quyền tài khoản (AccountsTab): Tạo tài khoản bảo vệ mới',
  'Giao diện Web Admin (/admin.html)',
  'Tài khoản mới: "Nv005a5" | Tên: "Vũ Văn Cường" | Quyền: "Nhân viên Trực ban (Staff)" | Trạm: "Cổng 02"',
  'Tab Quản lý người dùng.',
  [
    '1. Nhấp tab "Người dùng & Phân quyền (AccountsTab)".',
    '2. Nhấp "+ Thêm Người Dùng Mới".',
    '3. Nhập mã tài khoản "Nv005a5", họ tên "Vũ Văn Cường", quyền "Trực ban", gán trạm Cổng 2.',
    '4. Nhấp "Lưu Người Dùng".'
  ],
  [
    'Toast xanh: "Đã tạo tài khoản Nv005a5 thành công!".',
    'Tài khoản mới xuất hiện trên bảng và có thể đăng nhập ngay tại trạm Cổng 2.'
  ],
  'RBAC: Tạo người dùng và phân quyền', 'T1'
);

addTC(
  'TC-ADMN-006', 'M08', 'P1',
  'Khóa tài khoản người dùng ngay lập tức khi cán bộ nghỉ việc (Chuyển sang Inactive)',
  'Giao diện Web Admin (/admin.html)',
  'Khóa tài khoản "Nv005a5"',
  'Danh sách tài khoản.',
  [
    '1. Trên dòng tài khoản Nv005a5, nhấp nút gạt trạng thái sang "Khóa (Inactive)".',
    '2. Xác nhận hộp thoại.'
  ],
  [
    'Huy hiệu đổi sang màu xám "KHÓA". Cán bộ này ngay lập tức bị từ chối đăng nhập tại trạm gác.'
  ],
  'Security: Khóa tài khoản nhân sự', 'T3'
);

addTC(
  'TC-ADMN-007', 'M08', 'P1',
  'Đổi mật khẩu tài khoản Quản trị Admin với xác thực mật khẩu cũ',
  'Giao diện Web Admin (/admin.html)',
  'Mật khẩu cũ: "admin123" | Mật khẩu mới: "Admin@2026Secure!"',
  'Cài đặt tài khoản admin.',
  [
    '1. Nhấp vào tên Admin góc trên Topbar, chọn "Đổi mật khẩu".',
    '2. Nhập mật khẩu cũ "admin123".',
    '3. Nhập mật khẩu mới "Admin@2026Secure!", nhập lại mật khẩu mới.',
    '4. Nhấp "Lưu Mật Khẩu Mới".'
  ],
  [
    'Toast xanh: "Đổi mật khẩu Admin thành công! Vui lòng ghi nhớ mật khẩu mới!".'
  ],
  'Security: Đổi mật khẩu quản trị', 'T1'
);

addTC(
  'TC-ADMN-008', 'M08', 'P1',
  'Quản lý danh sách Thẻ báo mất và xem lại biên bản đền bù của khách Trần Thị Bích (Hồ sơ HS-02)',
  'Giao diện Web Admin (/admin.html)',
  'Mở modal LostCardsReportModal',
  'Thẻ THE-102 đang ở trạng thái báo mất.',
  [
    '1. Tại menu Admin, nhấp mục "Quản lý Thẻ Mất & Sự Cố".',
    '2. Modal LostCardsReportModal mở ra: Xem danh sách thẻ đang bị khóa.',
    '3. Tìm thấy thẻ THE-102 của khách Trần Thị Bích kèm số biên bản BB-202610-001.'
  ],
  [
    'Bảng thể hiện đầy đủ thông tin: Mã thẻ THE-102, Người làm mất Trần Thị Bích, Ngày giờ mất, Cán bộ lập biên bản Nguyễn Văn Huy, Số tiền phạt 50.000 VNĐ.'
  ],
  'Golden Thread B: Quản trị thẻ mất HS-02 trên Admin', 'T4'
);

addTC(
  'TC-ADMN-009', 'M08', 'P2',
  'Quản lý Danh mục Trạm gác (StationsTab): Thêm Trạm Gác Cổng Số 4',
  'Giao diện Web Admin (/admin.html)',
  'Mã trạm: "STATION_04" | Tên: "Trạm Gác Cổng Kỹ Thuật 04"',
  'Tab Quản lý trạm gác.',
  [
    '1. Nhấp tab "Quản lý Trạm Gác (StationsTab)".',
    '2. Nhấp "+ Thêm Trạm Mới".',
    '3. Nhập mã "STATION_04", tên "Trạm Gác Cổng Kỹ Thuật 04", bấm Lưu.'
  ],
  [
    'Trạm số 4 được khởi tạo thành công, xuất hiện trên sơ đồ điều hành.'
  ],
  'Configuration: Danh mục trạm gác', 'T1'
);

addTC(
  'TC-ADMN-010', 'M08', 'P2',
  'Giám sát lịch sử ca trực của toàn bộ nhân viên bảo vệ (ShiftsTab)',
  'Giao diện Web Admin (/admin.html)',
  'Xem danh sách ca trực ngày hôm nay',
  'Tab Quản lý ca trực.',
  [
    '1. Nhấp tab "Giám sát Ca Trực (ShiftsTab)".',
    '2. Xem bảng lịch sử ca: Ca của Nguyễn Văn Huy (Cổng 1), Ca của Hoàng Thế Thủy (Cổng 2).'
  ],
  [
    'Hiển thị rõ: Giờ mở ca, Giờ đóng ca, Ảnh chân dung lúc mở/đóng, Số lượt khách xử lý trong ca, Biên bản bàn giao ca.'
  ],
  'Audit: Giám sát ca trực bảo vệ', 'T1'
);

addTC(
  'TC-ADMN-011', 'M08', 'P2',
  'Quản lý Danh mục Phòng ban & Cán bộ tiếp đón nội bộ cơ quan',
  'Giao diện Web Admin (/admin.html)',
  'Thêm cán bộ mới: "Đặng Thị Hồng" - Phòng Tài chính Kế toán',
  'Tab Danh bạ cơ quan.',
  [
    '1. Nhấp mục "Danh bạ Cán bộ Tiếp đón".',
    '2. Nhấp "+ Thêm Cán Bộ Tiếp".',
    '3. Nhập tên "Đặng Thị Hồng", phòng "Tài chính - Kế toán", SĐT nội bộ "206", bấm Lưu.'
  ],
  [
    'Cán bộ mới lập tức xuất hiện trong dropdown chọn người tiếp đón tại trạm gác.'
  ],
  'Configuration: Cập nhật danh bạ nội bộ', 'T1'
);

addTC(
  'TC-ADMN-012', 'M08', 'P2',
  'Cưỡng chế đóng ca trực từ xa khi cán bộ trực quên đóng ca và đã rời khỏi cơ quan',
  'Giao diện Web Admin (/admin.html)',
  'Ca trực mở từ hôm trước chưa đóng của Nv003a3',
  'Tab ShiftsTab.',
  [
    '1. Thấy ca trực của Nv003a3 mở quá 24h.',
    '2. Nhấp nút màu đỏ "Cưỡng chế đóng ca (Force Close)".',
    '3. Nhập lý do: "Admin đóng ca cưỡng chế do cán bộ nghỉ đột xuất", bấm Xác nhận.'
  ],
  [
    'Ca trực được đóng an toàn, giải phóng trạm gác để ca mới mở tiếp.'
  ],
  'Admin Override: Cưỡng chế đóng ca trực', 'T3'
);

addTC(
  'TC-ADMN-013', 'M08', 'P2',
  'Chặn tạo trùng mã trạm gác hoặc trùng tên đăng nhập người dùng',
  'Giao diện Web Admin (/admin.html)',
  'Tạo người dùng mới có username "admin" đã tồn tại',
  'Form thêm người dùng.',
  [
    '1. Nhập username "admin".',
    '2. Bấm Lưu.'
  ],
  [
    'Hệ thống báo lỗi đỏ: "Tên đăng nhập admin đã tồn tại trong hệ thống!".',
    'Chặn không cho tạo.'
  ],
  'Validation: Chống trùng username', 'T3'
);

addTC(
  'TC-ADMN-014', 'M08', 'P3',
  'Xem biểu đồ tròn phân tích tỷ lệ khách ra vào theo mục đích công tác',
  'Giao diện Web Admin (/admin.html)',
  'Dashboard biểu đồ Admin',
  'Dashboard tab.',
  [
    '1. Quan sát biểu đồ Doughnut "Tỷ lệ theo mục đích".'
  ],
  [
    'Biểu đồ thể hiện trực quan: 75% Liên hệ công việc, 15% Thi công sửa chữa, 10% Giao nhận văn thư.'
  ],
  'Charts: Biểu đồ thống kê mục đích', 'T1'
);

addTC(
  'TC-ADMN-015', 'M08', 'P3',
  'Nhật ký kiểm toán hệ thống (Audit Log): Theo dõi hành vi đăng nhập và thao tác của Admin',
  'Giao diện Web Admin (/admin.html)',
  'Tab Nhật ký kiểm toán (Audit Logs)',
  'Admin portal.',
  [
    '1. Nhấp tab "Nhật ký kiểm toán".',
    '2. Xem các dòng ghi nhận hành vi.'
  ],
  [
    'Ghi nhận chuẩn xác: "Admin vừa đổi mật khẩu lúc 11:00", "Admin vừa tạo người dùng Nv005a5 lúc 11:15" kèm IP máy trạm.'
  ],
  'Security: Nhật ký kiểm toán Admin', 'T1'
);

addTC(
  'TC-ADMN-016', 'M08', 'P2',
  'Bật/Tắt chế độ cảnh báo âm thanh khi phát hiện sự cố thẻ hoặc khách quá hạn',
  'Giao diện Web Admin (/admin.html)',
  'Tùy chọn "Âm thanh cảnh báo"',
  'Cài đặt hệ thống.',
  [
    '1. Gạt công tắc "Bật âm thanh cảnh báo sự cố".',
    '2. Nhấp nút "Nghe thử âm thanh".'
  ],
  [
    'Loa máy tính phát chuông cảnh báo rõ ràng, cài đặt được lưu trữ thành công.'
  ],
  'Settings: Cảnh báo âm thanh', 'T1'
);

console.log('✅ Đã tạo xong 16 kịch bản Module M08');

// ----------------------------------------------------------------------------
// MODULE M09: TRUNG TÂM BÁO CÁO, THỐNG KÊ & BÁO CÁO THẺ MẤT (13 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-REPT-001', 'M09', 'P1',
  'Xuất Báo cáo Tổng hợp Lượt khách ra vào trong ngày ra file Excel cao cấp (.xlsx) có đầy đủ dữ liệu khách Nguyễn Văn An (HS-01)',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Chọn khoảng thời gian: "Hôm nay" | Trạm: "Tất cả các trạm"',
  'Hồ sơ HS-01 đã check-in và check-out trong ngày.',
  [
    '1. Tại menu Admin, nhấp tab "Báo Cáo & Thống Kê (ReportsTab)".',
    '2. Chọn kỳ báo cáo: "Hôm nay".',
    '3. Nhấp nút màu xanh "Xuất Báo Cáo Excel (.xlsx)".',
    '4. Mở file Excel vừa tải về máy kiểm tra.'
  ],
  [
    'File Excel định dạng chuẩn ISO 29119-3: Có dòng tiêu đề, logo cơ quan, bảng dữ liệu chứa chính xác dòng của khách Nguyễn Văn An (Ô tô 29A-123.45, Cán bộ tiếp Trần Quốc Tuấn, Giờ vào, Giờ ra, Thời lượng 1h25p, Thẻ THE-101).',
    'Các cột số liệu có màu sắc badge đẹp mắt, tự động tính tổng quân số cuối bảng.'
  ],
  'Golden Thread A: Xuất báo cáo Excel tổng hợp', 'T4'
);

addTC(
  'TC-REPT-002', 'M09', 'P1',
  'Xuất Báo cáo Sự Cố Thẻ Mất và Tiền bồi hoàn ra file PDF có chữ ký số (Hồ sơ HS-02)',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Chọn phân loại: "Báo cáo Sự cố Thẻ Mất"',
  'Sự cố mất thẻ của khách Trần Thị Bích đã ghi nhận.',
  [
    '1. Tại dropdown Loại báo cáo, chọn "Báo cáo Sự cố & Mất Thẻ An Ninh".',
    '2. Nhấp nút "Xuất Báo Cáo PDF".',
    '3. Kiểm tra file PDF vừa tải về.'
  ],
  [
    'File PDF hiển thị trang trọng khổ A4: Danh sách thẻ báo mất gồm thẻ THE-102 của khách Trần Thị Bích, Biên bản BB-202610-001, Tiền bồi hoàn 50.000 VNĐ, có khung chữ ký số của Trưởng ca trực và Kế toán cơ quan.'
  ],
  'Golden Thread B: Báo cáo sự cố thẻ mất ra PDF', 'T4'
);

addTC(
  'TC-REPT-003', 'M09', 'P1',
  'Báo cáo Thống kê Lượt khách Lưu trú qua đêm theo tháng (Hồ sơ HS-04)',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Lọc loại khách: "Lưu trú qua đêm" | Kỳ báo cáo: "Tháng hiện tại"',
  'Khách Đặng Quốc Khánh đã hoàn tất lưu trú qua đêm.',
  [
    '1. Tại bộ lọc phân loại khách, chọn "Khách Lưu Trú Qua Đêm".',
    '2. Chọn tháng hiện tại, bấm "Xem thống kê".'
  ],
  [
    'Bảng hiển thị chi tiết các lượt trực đêm: Khách Đặng Quốc Khánh (Viettel), trực phòng máy chủ, thẻ THE-901, thời gian 10 tiếng qua đêm.'
  ],
  'Golden Thread D: Báo cáo khách lưu trú qua đêm', 'T4'
);

addTC(
  'TC-REPT-004', 'M09', 'P2',
  'Biểu đồ Doughnut thống kê phân bổ lượt khách theo từng Phòng ban trong cơ quan',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Xem biểu đồ phân bổ phòng ban',
  'Reports tab.',
  [
    '1. Cuộn đến khu vực biểu đồ phân tích phòng ban.',
    '2. Rê chuột vào từng lát cắt biểu đồ Doughnut.'
  ],
  [
    'Lát cắt nổi bật hiển thị tooltip: "Phòng Kỹ thuật & CNTT: 45%", "Phòng Tài chính - Kế toán: 30%", "Phòng Hành chính: 25%".'
  ],
  'Charts: Biểu đồ phòng ban', 'T1'
);

addTC(
  'TC-REPT-005', 'M09', 'P2',
  'Biểu đồ Cột (Bar Chart) so sánh lưu lượng phương tiện Ô tô vs Xe máy vào cơ quan',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Xem biểu đồ phương tiện',
  'Reports tab.',
  [
    '1. Nhấp tab "Thống kê Phương Tiện".'
  ],
  [
    'Biểu đồ cột so sánh trực quan cột màu xanh (Ô tô) và cột màu cam (Xe máy) theo từng ngày trong tuần.'
  ],
  'Charts: Biểu đồ phương tiện', 'T1'
);

addTC(
  'TC-REPT-006', 'M09', 'P2',
  'Lọc báo cáo theo Trạm gác cụ thể: Chỉ xem số liệu của Trạm Gác Cổng Chính 01',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Dropdown Trạm gác: Chọn "Trạm Cổng Chính 01"',
  'Reports tab.',
  [
    '1. Chọn trạm "Cổng Chính 01".',
    '2. Bấm "Cập nhật dữ liệu".'
  ],
  [
    'Báo cáo tự động lọc loại trừ các lượt khách của cổng 2 và cổng 3, chỉ hiển thị số liệu cổng 1.'
  ],
  'Filter: Lọc báo cáo theo trạm', 'T1'
);

addTC(
  'TC-REPT-007', 'M09', 'P2',
  'Báo cáo Giờ cao điểm (Peak Hours Analysis): Xác định khung giờ đông khách nhất',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Xem phân tích giờ cao điểm',
  'Reports tab.',
  [
    '1. Nhấp tab "Giờ cao điểm".'
  ],
  [
    'Hệ thống tự động tô màu nhiệt (Heatmap) khung giờ 08:00 - 09:00 sáng có mật độ khách vào đông nhất.'
  ],
  'Analytics: Phân tích khung giờ cao điểm', 'T1'
);

addTC(
  'TC-REPT-008', 'M09', 'P3',
  'Tùy chọn ẩn thông tin nhạy cảm (Số CCCD, SĐT) khi xuất báo cáo gửi đối tác bên ngoài',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Tích chọn "Che mờ số CCCD và SĐT (Masking: 0010****2345)"',
  'Cài đặt xuất báo cáo.',
  [
    '1. Tích chọn "Bảo vệ thông tin cá nhân (Masking)".',
    '2. Bấm xuất file Excel.'
  ],
  [
    'File Excel xuất ra các số CCCD tự động được che 4 số giữa (`0010****2345`), tuân thủ nghị định bảo vệ dữ liệu cá nhân.'
  ],
  'Privacy: Che mờ dữ liệu cá nhân', 'T3'
);

addTC(
  'TC-REPT-009', 'M09', 'P2',
  'Báo cáo Tỷ lệ nợ thẻ và tỷ lệ thu hồi thẻ an ninh',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Xem tỷ lệ thu hồi thẻ',
  'Reports tab.',
  [
    '1. Mở báo cáo quản lý thẻ an ninh.'
  ],
  [
    'Hiển thị chỉ số KPI: Tỷ lệ thu hồi thẻ đạt 98%, Tỷ lệ thẻ mất 1%, Tỷ lệ nợ thẻ 1%.'
  ],
  'KPI: Tỷ lệ thu hồi thẻ', 'T1'
);

addTC(
  'TC-REPT-010', 'M09', 'P3',
  'Lưu cấu hình bộ lọc báo cáo yêu thích để sử dụng lại cho lần sau',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Bấm "Lưu bộ lọc này làm mặc định"',
  'Reports tab.',
  [
    '1. Thiết lập bộ lọc thường dùng, bấm "Lưu bộ lọc".',
    '2. Tải lại trang kiểm tra.'
  ],
  [
    'Bộ lọc được giữ nguyên khi truy cập lại.'
  ],
  'UX: Ghi nhớ bộ lọc báo cáo', 'T1'
);

addTC(
  'TC-REPT-011', 'M09', 'P2',
  'In báo cáo trực tiếp ra máy in khổ giấy A4 ngang (Landscape) không bị cắt lề',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Bấm nút "In báo cáo (Print Landscape)"',
  'Reports tab.',
  [
    '1. Nhấp nút "In Báo Cáo".',
    '2. Chọn chế độ in Khổ ngang (Landscape).'
  ],
  [
    'Bảng báo cáo vừa khít trang in A4 ngang, đường nét sắc sảo, không bị mất cột.'
  ],
  'Printing: In báo cáo khổ ngang', 'T1'
);

addTC(
  'TC-REPT-012', 'M09', 'P3',
  'Thông báo khi khoảng ngày chọn để xuất báo cáo không có bất kỳ lượt khách nào',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Chọn khoảng ngày tương lai chưa tới',
  'Reports tab.',
  [
    '1. Chọn từ ngày mai đến tuần sau.',
    '2. Bấm "Xem báo cáo".'
  ],
  [
    'Hiển thị thông báo: "Không có dữ liệu lượt khách nào trong khoảng thời gian đã chọn!". Nút xuất Excel mờ đi.'
  ],
  'Boundary: Không có dữ liệu báo cáo', 'T2'
);

addTC(
  'TC-REPT-013', 'M09', 'P1',
  'Tự động đồng bộ số liệu báo cáo khi có trạm gác vừa thực hiện Check-out',
  'Giao diện Web Admin (/admin.html -> ReportsTab)',
  'Cổng 1 vừa check-out 1 khách',
  'Màn hình Báo cáo Admin đang mở.',
  [
    '1. Đang xem báo cáo, trạm cổng 1 check-out khách.',
    '2. Quan sát số liệu báo cáo.'
  ],
  [
    'Số liệu tổng lượt ra trong ngày tự động nhảy tăng thêm 1 mà không cần tải lại trang.'
  ],
  'Realtime Sync: Đồng bộ báo cáo tự động', 'T4'
);

console.log('✅ Đã tạo xong 13 kịch bản Module M09');

// ----------------------------------------------------------------------------
// MODULE M10: CẤU HÌNH HỆ THỐNG, TRẠM GÁC & SAO LƯU CSDL (13 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-CONF-001', 'M10', 'P1',
  'Sao lưu cơ sở dữ liệu SQLite tức thời ra file backup (.db / .bak) từ giao diện Admin',
  'Giao diện Web Admin (/admin.html -> BackupTab)',
  'Bấm nút "Tạo Bản Sao Lưu Tức Thời (Backup Now)"',
  'Đã đăng nhập Admin; Tab BackupTab đang mở.',
  [
    '1. Tại menu Admin, nhấp tab "Sao Lưu & Phục Hồi CSDL (BackupTab)".',
    '2. Nhập ghi chú bản sao lưu: "Sao lưu định kỳ trước khi nâng cấp hệ thống".',
    '3. Nhấp nút màu xanh "Tạo Bản Sao Lưu Ngay".'
  ],
  [
    'Tiến trình sao lưu chạy (progress bar 100%), toast xanh thông báo: "Sao lưu CSDL thành công!".',
    'Bảng danh sách các bản sao lưu xuất hiện 1 dòng mới: Tên file `smartvms_backup_[Ngay_Gio].db`, Dung lượng file (vd: 15.4 MB), Thời gian tạo và nút Tải Về.'
  ],
  'Backup: Tạo bản sao lưu CSDL', 'T1'
);

addTC(
  'TC-CONF-002', 'M10', 'P1',
  'Tải tệp sao lưu CSDL (.db) về máy tính cá nhân để lưu trữ an toàn',
  'Giao diện Web Admin (/admin.html -> BackupTab)',
  'Nhấp nút "Tải Về (Download)" trên bản sao lưu',
  'Danh sách bản sao lưu có sẵn.',
  [
    '1. Nhấp nút icon Tải về trên bản sao lưu mới nhất.',
    '2. Kiểm tra thư mục Downloads trên máy tính.'
  ],
  [
    'Tệp tin sao lưu được tải về nguyên vẹn 100%, có thể kiểm tra dung lượng khớp hoàn toàn với hệ thống.'
  ],
  'Backup: Tải file sao lưu về máy', 'T1'
);

addTC(
  'TC-CONF-003', 'M10', 'P1',
  'Phục hồi cơ sở dữ liệu từ file backup đã chọn và kiểm tra tính toàn vẹn dữ liệu',
  'Giao diện Web Admin (/admin.html -> BackupTab)',
  'Chọn file backup `smartvms_backup_clean.db` để phục hồi',
  'Tab BackupTab.',
  [
    '1. Nhấp nút "Phục Hồi CSDL Từ File (Restore)".',
    '2. Chọn tệp sao lưu hợp lệ.',
    '3. Hộp thoại cảnh báo bảo mật bật lên: "Cảnh báo: Phục hồi CSDL sẽ ghi đè dữ liệu hiện tại. Bạn có chắc chắn?".',
    '4. Nhập mật khẩu xác thực của Admin, bấm "Xác nhận Phục hồi".'
  ],
  [
    'Hệ thống thực hiện nạp lại CSDL, thông báo: "Phục hồi CSDL thành công! Hệ thống tự động làm mới giao diện".',
    'Toàn bộ danh mục và lịch sử được phục hồi nguyên vẹn.'
  ],
  'Restore: Phục hồi dữ liệu an toàn', 'T3'
);

addTC(
  'TC-CONF-004', 'M10', 'P2',
  'Cấu hình thông tin cơ quan: Tên cơ quan, Địa chỉ trụ sở, Đường dây nóng (Hotline)',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Tên cơ quan: "TRỤ SỞ CƠ QUAN BỘ BAN NGÀNH" | Địa chỉ: "Số 01 Đường Lê Duẩn, Hà Nội" | Hotline: "1900.6868"',
  'Tab Cài đặt chung.',
  [
    '1. Nhập Tên cơ quan, Địa chỉ, Hotline vào các ô cấu hình.',
    '2. Bấm "Lưu Cấu Hình Cơ Quan".'
  ],
  [
    'Toast xanh: "Cập nhật thông tin cơ quan thành công!".',
    'Tiêu đề trên Topbar và trên phiếu in khách lập tức đổi sang tên cơ quan mới vừa lưu.'
  ],
  'Settings: Cấu hình thông tin trụ sở', 'T1'
);

addTC(
  'TC-CONF-005', 'M10', 'P2',
  'Tải lên Logo cơ quan mới định dạng PNG trong suốt (Transparent Logo)',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Chọn file `logo_coquan.png` dung lượng 500KB',
  'Tab Cài đặt giao diện.',
  [
    '1. Nhấp "Thay đổi Logo cơ quan".',
    '2. Chọn file PNG, bấm Tải lên.'
  ],
  [
    'Logo mới hiển thị sắc nét trên góc trái Topbar và tự động xuất hiện trên đầu các phiếu in đón tiếp.'
  ],
  'Settings: Tùy biến logo cơ quan', 'T1'
);

addTC(
  'TC-CONF-006', 'M10', 'P2',
  'Thiết lập thời gian ca trực mặc định (Ca 1: 06:00 - 14:00, Ca 2: 14:00 - 22:00, Ca đêm: 22:00 - 06:00)',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Cấu hình 3 ca trực trong ngày',
  'Cài đặt ca trực.',
  [
    '1. Thiết lập giờ bắt đầu và kết thúc của 3 ca trực.',
    '2. Bấm Lưu.'
  ],
  [
    'Hệ thống tự động nhắc nhở bàn giao ca khi đến mốc chuyển ca trực.'
  ],
  'Configuration: Cấu hình ca trực', 'T1'
);

addTC(
  'TC-CONF-007', 'M10', 'P3',
  'Chặn phục hồi CSDL khi tệp tin tải lên bị sai định dạng hoặc bị hỏng (Corrupted File)',
  'Giao diện Web Admin (/admin.html -> BackupTab)',
  'Chọn thử file văn bản `tailieu.txt` đổi tên thành `fake.db`',
  'Tab BackupTab.',
  [
    '1. Chọn file không đúng định dạng SQLite.',
    '2. Bấm Phục hồi.'
  ],
  [
    'Hệ thống kiểm tra chữ ký file (magic header) và từ chối phục hồi: "Lỗi: Tệp tin không phải là cơ sở dữ liệu SQLite hợp lệ!".',
    'CSDL hiện tại được bảo vệ an toàn 100% không bị ảnh hưởng.'
  ],
  'Security: Chống nạp file CSDL hỏng', 'T3'
);

addTC(
  'TC-CONF-008', 'M10', 'P2',
  'Cấu hình tự động dọn dẹp các bản sao lưu cũ quá 30 ngày để tiết kiệm dung lượng ổ đĩa',
  'Giao diện Web Admin (/admin.html -> BackupTab)',
  'Tùy chọn "Tự động xóa bản sao lưu cũ quá 30 ngày"',
  'Cài đặt sao lưu.',
  [
    '1. Bật tính năng tự động dọn dẹp, đặt thời hạn 30 ngày.',
    '2. Bấm Lưu.'
  ],
  [
    'Hệ thống lưu lịch dọn dẹp tự động định kỳ ngầm.'
  ],
  'Maintenance: Dọn dẹp dung lượng tự động', 'T1'
);

addTC(
  'TC-CONF-009', 'M10', 'P2',
  'Thiết lập mức phạt đền bù thẻ mất mặc định (50.000 VNĐ / thẻ)',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Số tiền: "50,000 VNĐ"',
  'Cài đặt quy chế thẻ.',
  [
    '1. Tại ô "Mức đền bù mất thẻ", nhập "50000".',
    '2. Bấm Lưu.'
  ],
  [
    'Khi trạm gác lập biên bản mất thẻ, số tiền 50.000 VNĐ tự động được điền mặc định trên form.'
  ],
  'Settings: Quy chế thẻ mất', 'T1'
);

addTC(
  'TC-CONF-010', 'M10', 'P3',
  'Kiểm tra dung lượng cơ sở dữ liệu hiện tại và tổng số bản ghi đã lưu trữ',
  'Giao diện Web Admin (/admin.html -> BackupTab)',
  'Xem thẻ "Thông tin CSDL"',
  'Tab BackupTab.',
  [
    '1. Quan sát thẻ Thông số kỹ thuật CSDL.'
  ],
  [
    'Hiển thị trực quan: Dung lượng SQLite (vd: 12.8 MB), Tổng số lượt khách (157), Số ảnh lưu trữ (314 ảnh), Trạng thái toàn vẹn (Healthy 100%).'
  ],
  'Diagnostic: Kiểm tra sức khỏe CSDL', 'T1'
);

addTC(
  'TC-CONF-011', 'M10', 'P2',
  'Cấu hình đồng bộ dữ liệu đám mây Supabase Cloud Realtime từ giao diện Cài đặt',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Nhập URL và Anon Key của Supabase Cloud',
  'Tab Đồng bộ đám mây.',
  [
    '1. Mở mục "Cấu hình Supabase Cloud".',
    '2. Nhập URL và Key hợp lệ, bấm "Kiểm tra kết nối".'
  ],
  [
    'Biểu tượng kết nối chuyển sang màu xanh lá: "Kết nối Supabase Cloud Realtime thành công!".'
  ],
  'Cloud Sync: Cấu hình kết nối đám mây', 'T1'
);

addTC(
  'TC-CONF-012', 'M10', 'P2',
  'Khôi phục toàn bộ cài đặt hệ thống về nguyên bản ban đầu (Factory Reset) có bảo vệ',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Nút "Khôi phục cài đặt gốc"',
  'Khu vực nguy hiểm (Danger Zone).',
  [
    '1. Nhấp nút màu đỏ "Khôi phục cài đặt gốc".',
    '2. Nhập cụm từ xác nhận "RESET_HE_THONG_2026" và mật khẩu Admin.'
  ],
  [
    'Hệ thống làm sạch dữ liệu an toàn và đưa các cấu hình về mặc định ban đầu.'
  ],
  'Maintenance: Khôi phục mặc định', 'T3'
);

addTC(
  'TC-CONF-013', 'M10', 'P3',
  'Xuất toàn bộ cấu hình hệ thống ra file JSON để sao chép sang máy trạm khác',
  'Giao diện Web Admin (/admin.html -> SettingsTab)',
  'Bấm nút "Xuất cấu hình (.json)"',
  'Cài đặt hệ thống.',
  [
    '1. Nhấp nút "Xuất cấu hình JSON".'
  ],
  [
    'Tải về file `smartvms_config.json` chứa danh mục phòng ban, trạm gác và dải thẻ để nạp nhanh sang máy khác.'
  ],
  'Portability: Di chuyển cấu hình', 'T1'
);

console.log('✅ Đã tạo xong 13 kịch bản Module M10');

// ----------------------------------------------------------------------------
// MODULE M11: THIẾT BỊ NGOẠI VI, DEVICESERVICE & QUẢN LÝ PHẦN CỨNG (7 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-DEVC-001', 'M11', 'P1',
  'Nhận diện trạng thái kết nối đầu đọc thẻ CCCD gắn chip (Hiển thị icon chấm xanh trên Topbar)',
  'Giao diện Web Trực ban (/staff.html)',
  'Đầu đọc CCCD kết nối cổng USB / COM',
  'Cắm đầu đọc thẻ vào máy tính.',
  [
    '1. Cắm cáp USB đầu đọc thẻ vào máy tính.',
    '2. Quan sát biểu tượng trạng thái thiết bị trên góc Topbar.'
  ],
  [
    'Biểu tượng Thẻ chip chuyển sang màu xanh lá cây, tooltip hiển thị: "Đầu đọc CCCD Chip: Đã kết nối sẵn sàng (COM3 - W3 Reader)".'
  ],
  'Hardware Detection: Nhận diện đầu đọc CCCD', 'T1'
);

addTC(
  'TC-DEVC-002', 'M11', 'P1',
  'Cảnh báo trực quan khi đầu đọc CCCD bị rút dây hoặc mất kết nối (Icon đổi sang màu đỏ nhấp nháy)',
  'Giao diện Web Trực ban (/staff.html)',
  'Rút cáp USB đầu đọc thẻ ra khỏi máy tính',
  'Đầu đọc đang kết nối.',
  [
    '1. Rút cáp USB đầu đọc thẻ ra khỏi cổng máy tính.',
    '2. Quan sát phản hồi trên giao diện.'
  ],
  [
    'Icon thẻ chip đổi sang màu đỏ kèm thông báo cảnh báo: "Mất kết nối đầu đọc CCCD! Vui lòng kiểm tra lại dây cáp hoặc chuyển sang nhập tay!".',
    'Form Check-in tự động chuyển chế độ ưu tiên sang nhập tay không làm gián đoạn công việc.'
  ],
  'Hardware Disconnect: Xử lý rút cáp thiết bị', 'T3'
);

addTC(
  'TC-DEVC-003', 'M11', 'P1',
  'Tự động kết nối lại thiết bị (Auto-reconnect) khi cắm lại cáp USB mà không cần khởi động lại phần mềm',
  'Giao diện Web Trực ban (/staff.html)',
  'Cắm lại cáp USB đầu đọc thẻ',
  'Đang ở trạng thái mất kết nối.',
  [
    '1. Cắm lại cáp USB vào máy tính.',
    '2. Chờ 3 giây, không bấm F5.'
  ],
  [
    'Hệ thống tự động quét cổng và kết nối lại thành công, icon chuyển lại màu xanh sẵn sàng hoạt động.'
  ],
  'Auto-recovery: Tự động phục hồi kết nối thiết bị', 'T1'
);

addTC(
  'TC-DEVC-004', 'M11', 'P2',
  'Kiểm tra kết nối và nhận diện luồng quét của Máy quét mã QR 2D',
  'Giao diện Web Trực ban (/staff.html)',
  'Máy quét mã QR 2D cắm cổng USB',
  'Giao diện Trực ban.',
  [
    '1. Quét thử 1 mã QR bất kỳ vào máy quét.',
    '2. Quan sát icon QR trên màn hình.'
  ],
  [
    'Icon QR nhấp nháy nhận tín hiệu và phát tiếng bíp xác nhận kết nối chuẩn.'
  ],
  'QR Scanner: Kiểm tra máy quét QR', 'T1'
);

addTC(
  'TC-DEVC-005', 'M11', 'P2',
  'Xử lý tự động cấp quyền Webcam trên trình duyệt HTTPS không bị popup chặn camera',
  'Giao diện Web Trực ban (https://smartvms.local/staff.html)',
  'Trình duyệt Chrome / Edge truy cập qua HTTPS',
  'Cài đặt chứng chỉ SSL SmartVMS.',
  [
    '1. Mở chức năng chụp ảnh camera.',
    '2. Quan sát khung hình live camera.'
  ],
  [
    'Khung hình camera mở ngay lập tức, có ổ khóa bảo mật xanh trên thanh địa chỉ, không xuất hiện popup cảnh báo bảo mật chặn camera của trình duyệt.'
  ],
  'Camera Permissions: Quyền webcam trên HTTPS', 'T1'
);

addTC(
  'TC-DEVC-006', 'M11', 'P2',
  'Kiểm tra đọc thẻ CCCD bị xước chip bằng cách nhập mã CAN 6 số trên giao diện',
  'Giao diện Web Trực ban (/staff.html)',
  'Thẻ CCCD xước bề mặt chip; Mã CAN: "123456" in góc phải thẻ',
  'Đầu đọc báo lỗi đọc chip.',
  [
    '1. Đặt thẻ xước chip vào đầu đọc, hệ thống báo không đọc được chip.',
    '2. Popup nhập mã CAN hiện ra: Nhập 6 số "123456", bấm "Đọc lại qua mã CAN".'
  ],
  [
    'Hệ thống dùng mã CAN mở khóa đọc thành công chip và điền dữ liệu vào form.'
  ],
  'Edge Case: Xử lý chip xước qua mã CAN', 'T2'
);

addTC(
  'TC-DEVC-007', 'M11', 'P3',
  'Kiểm tra ứng dụng SmartVMS Control Panel quản lý bật / tắt 2 dịch vụ ngầm (Services)',
  'Ứng dụng Desktop Control Panel',
  'Mở ứng dụng SmartVMS Control Panel trên màn hình Desktop',
  'Hệ thống cài đặt SmartVMS.',
  [
    '1. Bấm nút "Restart Services" trên Control Panel.',
    '2. Quan sát đèn báo trạng thái của 2 dịch vụ SmartVMSLocalBackend và SmartVMSLocalDeviceService.'
  ],
  [
    '2 dịch vụ khởi động lại thành công trong vòng 5 giây, đèn chuyển sang màu xanh "Running".'
  ],
  'Desktop App: Bảng điều khiển dịch vụ', 'T1'
);

console.log('✅ Đã tạo xong 7 kịch bản Module M11');

// ----------------------------------------------------------------------------
// MODULE M12: DỊCH VỤ NỀN TẢNG, DESKTOP KIOSK & CHỊU LỖI (6 Test Cases)
// ----------------------------------------------------------------------------
addTC(
  'TC-BKGD-001', 'M12', 'P1',
  'Kiểm tra ứng dụng trạm gác Kiosk StationApp chạy toàn màn hình và khóa phím nóng thoát ứng dụng',
  'Ứng dụng Kiosk Desktop (SmartVMS StationApp)',
  'Khởi động StationApp từ Desktop',
  'Máy tính trạm gác.',
  [
    '1. Nhấp đúp biểu tượng "SmartVMS Giao diện Trạm Gác".',
    '2. Ứng dụng mở tràn toàn màn hình (Fullscreen Kiosk).',
    '3. Thử nhấn phím Windows, phím F11.'
  ],
  [
    'Giao diện hiển thị chuyên nghiệp không lộ thanh công cụ Windows, nhân viên bảo vệ chỉ thao tác trong phạm vi phần mềm trạm gác.'
  ],
  'Kiosk Mode: Chế độ toàn màn hình', 'T1'
);

addTC(
  'TC-BKGD-002', 'M12', 'P1',
  'Khả năng hoạt động Offline 100% khi ngắt kết nối mạng Internet (Local SingleSite Standalone)',
  'Toàn bộ hệ thống SmartVMS Local',
  'Rút hoàn toàn dây mạng Internet của máy tính',
  'Hệ thống đang hoạt động.',
  [
    '1. Rút dây mạng LAN/Internet ra khỏi máy tính.',
    '2. Thực hiện đầy đủ quy trình: Đăng nhập trạm, Check-in khách Nguyễn Văn An, Check-out, In phiếu.'
  ],
  [
    'Mọi chức năng hoạt động trơn tru 100% không có độ trễ, không phụ thuộc vào Internet bên ngoài.'
  ],
  'Offline First: Hoạt động độc lập không mạng', 'T1'
);

addTC(
  'TC-BKGD-003', 'M12', 'P2',
  'Hiệu năng phản hồi của giao diện: Tốc độ mở modal và tìm kiếm tức thời dưới 0.3 giây',
  'Giao diện Web Trực ban',
  'Gõ tìm kiếm và bấm mở modal Check-in',
  'CSDL có sẵn trên 1,000 lượt khách.',
  [
    '1. Gõ tìm kiếm biển số xe.',
    '2. Bấm mở modal Check-in.'
  ],
  [
    'Giao diện phản hồi tức thì, thời gian mở modal và lọc bảng dưới 300ms, không có hiện tượng đơ giật hình.'
  ],
  'Performance: Tốc độ phản hồi giao diện', 'T2'
);

addTC(
  'TC-BKGD-004', 'M12', 'P2',
  'Tự động khởi động lại dịch vụ Backend khi bị tắt đột ngột (Self-healing Service)',
  'Dịch vụ Windows Services',
  'Mở Task Manager kết thúc tiến trình SmartVMSLocalBackend',
  'Windows Services đang chạy.',
  [
    '1. Mở Task Manager, tìm tiến trình Backend và bấm End Task.',
    '2. Chờ 5 giây kiểm tra lại.'
  ],
  [
    'Dịch vụ Windows Service tự động kích hoạt lại tiến trình ngay lập tức, trang web kết nối lại bình thường.'
  ],
  'Reliability: Cơ chế tự hồi sinh dịch vụ', 'T2'
);

addTC(
  'TC-BKGD-005', 'M12', 'P2',
  'Chuyển hướng tự động từ HTTP (Cổng 80) sang HTTPS (Cổng 443) an toàn',
  'Trình duyệt Web',
  'Gõ địa chỉ: "http://smartvms.local" (Giao thức HTTP cổng 80)',
  'Trình duyệt mở.',
  [
    '1. Gõ "http://smartvms.local" và nhấn Enter.'
  ],
  [
    'Trình duyệt tự động chuyển hướng ngay sang "https://smartvms.local", có biểu tượng ổ khóa bảo mật HTTPS.'
  ],
  'Security: Tự động chuyển hướng HTTPS', 'T1'
);

addTC(
  'TC-BKGD-006', 'M12', 'P1',
  'Hiệu năng tải cao: Tìm kiếm và lọc mượt mà khi CSDL có trên 5,000 lượt khách ra vào',
  'Giao diện Web Trực ban & Admin',
  'CSDL đã tích lũy 5,000 bản ghi lịch sử',
  'Bảng lịch sử và Dashboard.',
  [
    '1. Mở bảng Lịch sử ra vào 5,000 lượt khách.',
    '2. Lọc theo tên "Nguyễn Văn An".'
  ],
  [
    'Kết quả trả về chính xác trong vòng dưới 0.5 giây, bảng cuộn mượt mà không bị treo trình duyệt.'
  ],
  'Scalability: Chịu tải CSDL lớn', 'T2'
);

console.log('✅ Đã tạo xong 6 kịch bản Module M12');
console.log(`🎉 TỔNG CỘNG ĐÃ KHỞI TẠO HOÀN TẤT: ${testCases.length} KỊCH BẢN KIỂM THỬ CHUẨN HÓA!`);

// ============================================================================
// XUẤT RA FILE EXCEL CAO CẤP (.XLSX) VÀ FILE JSON CHUẨN
// ============================================================================
async function buildOutputs() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SmartVMS QA Hub - Senior Test Architecture Team';
  wb.lastModifiedBy = 'Admin QA Lead';
  wb.created = new Date();
  wb.modified = new Date();

  // Typography & Styling
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

  // --------------------------------------------------------------------------
  // SHEET 1: 157 KỊCH BẢN CHUẨN HÓA (CHƯA TEST - READY TO IMPORT)
  // --------------------------------------------------------------------------
  const ws1 = wb.addWorksheet('Kịch Bản Kiểm Thử (157 TCs)', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 4, showGridLines: true }],
    properties: { tabColor: { argb: 'FF2563EB' } }
  });

  // Banner Row 1
  ws1.mergeCells('A1:N1');
  const r1 = ws1.getCell('A1');
  r1.value = '🎯 SMARTVMS LOCAL SINGLESITE 2026 — DANH MỤC 157 KỊCH BẢN KIỂM THỬ CHUẨN HÓA (ISO/IEC/IEEE 29119-3)';
  r1.font = { name: FONT_NAME, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  r1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws1.getRow(1).height = 36;

  // Metadata Row 2
  ws1.mergeCells('A2:N2');
  const r2 = ws1.getCell('A2');
  r2.value = '📋 Tiêu chuẩn: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010 | Quy mô: 12 Phân hệ | Vét cạn toàn bộ dữ liệu nhập liệu UI | Trạng thái: ⏳ Chưa chạy (100% Not Run) | QA Lead: Nguyễn Văn Huy';
  r2.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FFE2E8F0' } };
  r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  r2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws1.getRow(2).height = 24;

  ws1.getRow(3).height = 8;

  // Header Row 4
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

  // Data rows
  testCases.forEach((tc, idx) => {
    const rowIdx = idx + 5;
    const row = ws1.getRow(rowIdx);
    const isOdd = idx % 2 === 1;
    const baseBg = isOdd ? 'FFF8FAFC' : 'FFFFFFFF';

    const stepsText = Array.isArray(tc.steps) ? tc.steps.join('\n') : String(tc.steps || '');
    const expText = Array.isArray(tc.expected) ? tc.expected.map(e => `• ${e.replace(/^[•\-\*]\s*/, '')}`).join('\n') : String(tc.expected || '');
    const modName = MODULE_NAMES[tc.module] || tc.module;
    const prioCfg = PRIORITY_STYLES[tc.priority] || PRIORITY_STYLES['P2'];

    row.getCell(1).value = idx + 1;
    row.getCell(2).value = tc.id;
    row.getCell(3).value = modName;
    row.getCell(4).value = tc.name;
    row.getCell(5).value = prioCfg.label;
    row.getCell(6).value = tc.type;
    row.getCell(7).value = tc.suite;
    row.getCell(8).value = tc.platform;
    row.getCell(9).value = tc.precondition;
    row.getCell(10).value = tc.testData;
    row.getCell(11).value = stepsText;
    row.getCell(12).value = expText;
    row.getCell(13).value = '⏳ Chưa chạy';
    row.getCell(14).value = tc.notes;

    // Row height calculation
    const stepLines = (stepsText.match(/\n/g) || []).length + 1;
    const expLines = (expText.match(/\n/g) || []).length + 1;
    const maxLines = Math.max(stepLines, expLines, 2);
    row.height = Math.min(Math.max(maxLines * 18, 42), 170);

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
    { key: 'title', width: 48 },
    { key: 'priority', width: 17 },
    { key: 'type', width: 18 },
    { key: 'suite', width: 16 },
    { key: 'platform', width: 22 },
    { key: 'precondition', width: 38 },
    { key: 'testData', width: 44 },
    { key: 'steps', width: 65 },
    { key: 'expected', width: 65 },
    { key: 'status', width: 18 },
    { key: 'notes', width: 32 }
  ];

  // --------------------------------------------------------------------------
  // SHEET 2: BẢNG TỔNG HỢP 12 PHÂN HỆ & 4 TẦNG KIỂM THỬ
  // --------------------------------------------------------------------------
  const ws2 = wb.addWorksheet('📊 Bảng Tổng Hợp 12 Phân Hệ', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF10B981' } }
  });

  ws2.mergeCells('A1:G1');
  const ws2R1 = ws2.getCell('A1');
  ws2R1.value = '📊 BẢNG TỔNG HỢP CHI TIẾT 157 KỊCH BẢN KIỂM THỬ THEO 12 PHÂN HỆ & 4 TẦNG CHIỀU SÂU';
  ws2R1.font = { name: FONT_NAME, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  ws2R1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
  ws2R1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws2.getRow(1).height = 36;

  ws2.mergeCells('A2:G2');
  const ws2R2 = ws2.getCell('A2');
  ws2R2.value = 'Quy mô: 12 Phân hệ | Vét cạn 100% dữ liệu nhập liệu thực tế | Trạng thái: Chưa kiểm thử (Not Run 157/157 - 100%)';
  ws2R2.font = { name: FONT_NAME, size: 9.5, color: { argb: 'FFD1FAE5' } };
  ws2R2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
  ws2R2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws2.getRow(2).height = 24;

  ws2.getRow(3).height = 8;

  const hNames = ['Mã Phân Hệ', 'Tên Phân Hệ Nghiệp Vụ', 'Tổng Kịch Bản', 'Tầng 1 (Happy)', 'Tầng 2 (Biên/Định dạng)', 'Tầng 3 (Ngoại lệ/Lỗi)', 'Tầng 4 (Liên thông)'];
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

  let tT1 = 0, tT2 = 0, tT3 = 0, tT4 = 0;

  Object.keys(MODULE_NAMES).forEach((modKey, idx) => {
    const rowIdx = idx + 5;
    const row = ws2.getRow(rowIdx);
    const modTcs = testCases.filter(t => t.module === modKey);
    const cT1 = modTcs.filter(t => t.layer === 'T1').length;
    const cT2 = modTcs.filter(t => t.layer === 'T2').length;
    const cT3 = modTcs.filter(t => t.layer === 'T3').length;
    const cT4 = modTcs.filter(t => t.layer === 'T4').length;

    tT1 += cT1; tT2 += cT2; tT3 += cT3; tT4 += cT4;

    row.getCell(1).value = modKey;
    row.getCell(2).value = MODULE_NAMES[modKey];
    row.getCell(3).value = modTcs.length;
    row.getCell(4).value = cT1;
    row.getCell(5).value = cT2;
    row.getCell(6).value = cT3;
    row.getCell(7).value = cT4;

    row.height = 24;

    for (let c = 1; c <= 7; c++) {
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
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: FONT_NAME, size: 9.5, bold: c === 3 };
      }
    }
  });

  // Total summary row
  const totRowIdx = Object.keys(MODULE_NAMES).length + 5;
  const totRow = ws2.getRow(totRowIdx);
  totRow.height = 28;
  totRow.getCell(1).value = 'TỔNG CỘNG';
  totRow.getCell(2).value = 'Toàn bộ 12 Phân hệ SmartVMS Local SingleSite';
  totRow.getCell(3).value = testCases.length;
  totRow.getCell(4).value = tT1;
  totRow.getCell(5).value = tT2;
  totRow.getCell(6).value = tT3;
  totRow.getCell(7).value = tT4;

  for (let c = 1; c <= 7; c++) {
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
    { key: 'name', width: 44 },
    { key: 'count', width: 18 },
    { key: 't1', width: 18 },
    { key: 't2', width: 24 },
    { key: 't3', width: 24 },
    { key: 't4', width: 22 }
  ];

  // --------------------------------------------------------------------------
  // SHEET 3: HƯỚNG DẪN & MASTER GOLDEN DATASET
  // --------------------------------------------------------------------------
  const ws3 = wb.addWorksheet('📖 Hồ Sơ Dữ Liệu Thực Nghiệm', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF8B5CF6' } }
  });

  ws3.mergeCells('A1:E1');
  const ws3R1 = ws3.getCell('A1');
  ws3R1.value = '📖 BỘ HỒ SƠ DỮ LIỆU THỰC NGHIỆM THỐNG NHẤT (MASTER GOLDEN TEST DATASET)';
  ws3R1.font = { name: FONT_NAME, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  ws3R1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
  ws3R1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws3.getRow(1).height = 36;

  const goldenRows = [
    { code: 'HS-01', name: 'Nguyễn Văn An', cccd: '001099012345', phone: '0912.345.678', veh: 'Ô tô 29A-123.45', host: 'Trần Quốc Tuấn (CNTT)', card: 'THE-101', role: 'Khách đối tác công nghệ, check-in ô tô con, đối soát chuẩn mực xuyên suốt 12 phân hệ.' },
    { code: 'HS-02', name: 'Trần Thị Bích', cccd: '038198005678', phone: '0983.112.233', veh: 'Xe máy 29B1-888.99', host: 'Lê Thị Mai (Kế toán)', card: 'THE-102', role: 'Khách đối tác nhà nước, check-in xe máy, báo mất thẻ khi ra về, lập biên bản đền bù 50k, khôi phục thẻ.' },
    { code: 'HS-03', name: 'Lê Hoàng Minh (Đoàn 5 người)', cccd: '026095007890', phone: '0904.556.677', veh: 'Xe tải 29C-678.90', host: 'Phạm Hùng Cường (Hành chính)', card: 'THE-201..THE-205', role: 'Đoàn nhà thầu thi công Vinaconex, check-in đoàn 5 người, check-out từng phần (2 người ra trước, 3 người ra sau).' },
    { code: 'HS-04', name: 'Đặng Quốc Khánh', cccd: '001088009988', phone: '0977.889.900', veh: 'Đi bộ', host: 'Trần Quốc Tuấn (CNTT)', card: 'THE-901', role: 'Kỹ sư Viettel trực đêm phòng máy chủ, lưu trú qua đêm đến 06:00 sáng hôm sau, cảnh báo quá hạn ca trực.' },
    { code: 'HS-05', name: 'Vũ Đình Toàn', cccd: '031092003344', phone: '0936.445.566', veh: 'Xe máy 29X5-678.12', host: 'Hoàng Bích Ngọc (Tòa nhà)', card: 'THE-105', role: 'Khách đăng ký trước lịch hẹn qua DataEntry M07, kích hoạt tiếp đón nhanh 1 chạm tại trạm gác Cổng 01.' }
  ];

  const ws3HRow = ws3.getRow(3);
  ws3HRow.height = 28;
  const ws3Headers = ['Mã HS', 'Họ Và Tên Khách', 'Số CCCD Chip', 'Số Điện Thoại', 'Phương Tiện', 'Cán Bộ Tiếp Đón', 'Mã Thẻ Cấp', 'Nghiệp Vụ Liên Thông Xuyên Suốt'];
  ws3Headers.forEach((h, i) => {
    const cell = ws3HRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6D28D9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_HEADER;
  });

  goldenRows.forEach((g, idx) => {
    const rowIdx = idx + 4;
    const row = ws3.getRow(rowIdx);
    row.getCell(1).value = g.code;
    row.getCell(2).value = g.name;
    row.getCell(3).value = g.cccd;
    row.getCell(4).value = g.phone;
    row.getCell(5).value = g.veh;
    row.getCell(6).value = g.host;
    row.getCell(7).value = g.card;
    row.getCell(8).value = g.role;
    row.height = 36;

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.border = BORDER_THIN;
      cell.font = { name: FONT_NAME, size: 9.5 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 1 ? 'FFF5F3FF' : 'FFFFFFFF' } };
      if (c === 1 || c === 3 || c === 4 || c === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF4C1D95' } };
      } else if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: FONT_NAME, size: 9.5, bold: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    }
  });

  ws3.columns = [
    { key: 'code', width: 12 },
    { key: 'name', width: 28 },
    { key: 'cccd', width: 18 },
    { key: 'phone', width: 16 },
    { key: 'veh', width: 22 },
    { key: 'host', width: 26 },
    { key: 'card', width: 20 },
    { key: 'role', width: 60 }
  ];

  // Save Excel files
  const outExcel1 = path.join(__dirname, '../data/SmartVMS_157_KichBan_ChuanHoa.xlsx');
  const outExcel2 = path.join(__dirname, '../data/SmartVMS_157_KichBan_ChuaTest.xlsx');
  const outExcelArtifact = 'C:/Users/admin/.gemini/antigravity-ide/brain/ce2d1662-9c0d-40c3-830b-5787ed2c8600/SmartVMS_157_KichBan_ChuanHoa.xlsx';

  await wb.xlsx.writeFile(outExcel1);
  await wb.xlsx.writeFile(outExcel2);
  try { await wb.xlsx.writeFile(outExcelArtifact); } catch (e) {}

  console.log(`✅ Đã xuất tệp Excel thành công: ${outExcel1}`);

  // Save JSON files
  const jsonCatalog = {
    schema: 'https://smartvms.local/schemas/test-catalog-v5.json',
    title: 'SmartVMS Local SingleSite 2026 — 157 Kịch Bản Kiểm Thử Chuẩn Hóa Frontend E2E (Vét Cạn & Liên Thông)',
    standardCompliance: [
      'ISO 9001:2015 Clause 7.5 & 8.5.2',
      'ISO/IEC/IEEE 29119-3:2021',
      'ISO/IEC 25010:2023'
    ],
    version: '5.0.0-Exhaustive-Frontend',
    totalTestCases: testCases.length,
    activeTestCases: testCases.length,
    skippedTestCases: 0,
    exportedAt: new Date().toISOString(),
    status: 'NOT_TESTED',
    modules: Object.keys(MODULE_NAMES).map(k => ({ id: k, name: MODULE_NAMES[k] })),
    goldenDataset: goldenRows,
    testCases: testCases
  };

  const outJson1 = path.join(__dirname, '../data/SmartVMS_157_KichBan_ChuanHoa.json');
  const outJson2 = path.join(__dirname, '../data/SmartVMS_157_KichBan_ChuaTest.json');
  const outJsonArtifact = 'C:/Users/admin/.gemini/antigravity-ide/brain/ce2d1662-9c0d-40c3-830b-5787ed2c8600/SmartVMS_157_KichBan_ChuanHoa.json';

  fs.writeFileSync(outJson1, JSON.stringify(jsonCatalog, null, 2), 'utf8');
  fs.writeFileSync(outJson2, JSON.stringify(jsonCatalog, null, 2), 'utf8');
  try { fs.writeFileSync(outJsonArtifact, JSON.stringify(jsonCatalog, null, 2), 'utf8'); } catch (e) {}

  console.log(`✅ Đã xuất tệp JSON thành công: ${outJson1}`);
  console.log('🎉 TOÀN BỘ 157 KỊCH BẢN ĐÃ ĐƯỢC XÂY DỰNG HOÀN THIỆN ĐẠT CHUẨN 100%!');
}

buildOutputs().catch(console.error);
