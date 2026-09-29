/* ============================================================
   SmartVMS Test Manager — Application Logic
   Version 2.0 | 167 Test Cases | 10 Modules (SmartVMS Local v2.0)
   ============================================================ */

'use strict';

// ================================================================
// DATA: 10 MODULES — SMARTVMS LOCAL v2.0
// ================================================================
const DEFAULT_MODULES = [
  { id: 'M01', name: 'Xác thực & Ca trực', short: 'Auth & Ca trực' },
  { id: 'M02', name: 'Check-in Khách Đơn', short: 'Check-in' },
  { id: 'M03', name: 'Khách Đoàn & Người đi cùng', short: 'Đoàn & Đi cùng' },
  { id: 'M04', name: 'Check-out & Quản lý Thẻ', short: 'Check-out & Thẻ' },
  { id: 'M05', name: 'Quản trị Admin & Nhân sự', short: 'Admin & Nhân sự' },
  { id: 'M06', name: 'Báo cáo, Thống kê & Xuất file', short: 'Báo cáo & Thống kê' },
  { id: 'M07', name: 'Bảo trì Dữ liệu & Auto Backup', short: 'Backup & Restore' },
  { id: 'M08', name: 'Thiết bị Ngoại vi & DeviceService', short: 'Thiết bị & Cổng' },
  { id: 'M09', name: 'Cấu hình Mạng, Hệ thống & Giao diện', short: 'Mạng & Giao diện' },
  { id: 'M10', name: 'Phi chức năng, Độ ổn định & Chịu lỗi', short: 'Phi chức năng' },
];

function getModules() {
  if (!state.modules || !Array.isArray(state.modules) || state.modules.length === 0) {
    state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  }
  return state.modules;
}

// Backward-compatibility proxy for MODULES
try {
  Object.defineProperty(window, 'MODULES', {
    get: () => getModules(),
    configurable: true
  });
} catch(e) {}

const ALL_TCS = [
  // ==========================================
  // M01: Đăng nhập & Ca trực (Auth & Shift)
  // ==========================================
  { id:'TC-AUTH-001', module:'M01', priority:'P1', name:'Đăng nhập hợp lệ bằng tài khoản trạm (Không mật khẩu)',
    platform: 'Giao diện Web UI',
    testData: 'Tài khoản nhân viên trạm: Nv001a1 (hoặc NV001)',
    precondition:'Nhân viên đang Active trong hệ thống',
    steps:['1. Mở trang Web trạm gác (/staff.html).','2. Nhập Tên đăng nhập trạm (vd: Nv001a1), nhấn Đăng nhập (hệ thống trạm không yêu cầu mật khẩu).'],
    expected:['Hệ thống xác thực thành công, lưu Token đăng nhập.','Nếu chưa có ca trực nào, popup Yêu cầu mở ca trực (Chụp ảnh webcam hoặc quét CCCD) sẽ hiện lên.'] },
  { id:'TC-AUTH-002', module:'M01', priority:'P2', name:'Đăng nhập trạm không phân biệt hoa/thường',
    platform: 'Giao diện Web UI',
    testData: 'Nhập "NV001A1" hoặc "nv001a1"',
    steps:['1. Nhập username xen kẽ chữ hoa chữ thường.','2. Nhấn Đăng nhập.'],
    expected:['Hệ thống tự động chuẩn hóa chữ thường và đăng nhập thành công, không báo lỗi.'] },
  { id:'TC-AUTH-003', module:'M01', priority:'P1', name:'Đăng nhập trạm thất bại: Tên tài khoản không tồn tại',
    platform: 'Giao diện Web UI',
    testData: 'Tài khoản không có thật: "khongtontai"',
    steps:['1. Nhập tài khoản không tồn tại.','2. Nhấn Đăng nhập.'],
    expected:['Hệ thống chặn lại, báo lỗi: "User không hợp lệ hoặc nhân viên chưa được kích hoạt."'] },
  { id:'TC-AUTH-004', module:'M01', priority:'P1', name:'Đăng nhập thất bại: Tài khoản bị khóa (Inactive)',
    platform: 'Giao diện Web UI',
    testData: 'Tài khoản nhân viên đã bị Admin tắt kích hoạt (IsActive = false)',
    steps:['1. Nhập tài khoản bị khóa.','2. Nhấn Đăng nhập.'],
    expected:['Hệ thống từ chối đăng nhập, thông báo: "User không hợp lệ hoặc nhân viên chưa được kích hoạt."'] },
  { id:'TC-AUTH-005', module:'M01', priority:'P1', name:'Mở ca trực bằng Camera (Webcam)',
    platform: 'Giao diện Web UI',
    testData: 'Webcam PC đang hoạt động',
    precondition:'Đã qua bước Đăng nhập tài khoản trạm. Trạm được cấu hình "Bắt buộc chụp ảnh Camera".',
    steps:['1. Tại popup "Xác nhận chụp ảnh vào ca", cấp quyền Camera nếu trình duyệt yêu cầu.',
           '2. Quan sát khung hình camera trực tiếp (Live Preview) hiển thị rõ khuôn mặt nhân viên.',
           '3. Nhấn nút "Vào ca" (biểu tượng Camera).'],
    expected:['Hệ thống chụp lại ảnh từ camera, lưu vào CSDL làm bằng chứng mở ca trực.',
              'Mở ca thành công, popup tự đóng và màn hình chuyển vào Dashboard làm việc của trạm gác.',
              'Header cập nhật tên nhân viên và chấm trạng thái màu xanh lá "Đang trong ca trực".'] },
  { id:'TC-AUTH-006', module:'M01', priority:'P1', name:'Hủy mở ca trực (Hủy chụp ảnh)',
    platform: 'Giao diện Web UI',
    steps:['1. Khi popup "Xác nhận chụp ảnh vào ca" hiện lên, nhấn nút "Hủy bỏ".'],
    expected:['Hệ thống hủy phiên đăng nhập trạm ngay lập tức, chuyển hướng quay lại màn hình Đăng nhập.'] },
  { id:'TC-AUTH-007', module:'M01', priority:'P1', name:'Mở ca trực bằng Thẻ CCCD (Khi Camera hỏng)',
    platform: 'Thiết bị & Cổng gác',
    testData: 'Thẻ CCCD gắn chip của nhân viên Nv001a1 (Khớp CCCD + Họ tên + Giới tính)',
    precondition:'Admin bật cờ "Cho phép dùng CCCD mở ca (AllowCccdShiftAuth)" cho nhân viên này.',
    steps:['1. Tại popup Mở ca, chuyển sang tab "Dùng CCCD thay Camera".',
           '2. Nhấn nút "Bắt đầu đọc thẻ CCCD" (hoặc quẹt thẻ CCCD gắn chip của nhân viên vào đầu đọc).',
           '3. Hệ thống hiển thị số CCCD và thông tin đọc được, nhấn nút "Xác nhận vào ca".'],
    expected:['Đọc thẻ thành công. Đối soát số CCCD trùng khớp với hồ sơ nhân viên trong hệ thống.',
              'Mở ca thành công, popup đóng lại và chuyển tới Dashboard trạm gác.'] },
  { id:'TC-AUTH-008', module:'M01', priority:'P2', name:'Từ chối mở ca bằng CCCD người khác',
    platform: 'Thiết bị & Cổng gác',
    testData: 'Quẹt thẻ CCCD của người khác không khớp với nhân viên đang đăng nhập',
    steps:['1. Đăng nhập Nv001a1, chọn Dùng CCCD thay thế.','2. Quẹt thẻ CCCD của người khác.'],
    expected:['Hệ thống từ chối mở ca, báo lỗi: "Số CCCD không khớp với hồ sơ nhân viên trong hệ thống."'] },
  { id:'TC-AUTH-009', module:'M01', priority:'P2', name:'Khôi phục ca trực sau khi Reload (F5)',
    platform: 'Giao diện Web UI',
    precondition:'Nhân viên đang trong ca trực.',
    steps:['1. Nhấn F5 refresh lại trang Web.'],
    expected:['Vào thẳng Dashboard, không bắt đăng nhập hay chụp ảnh lại.'] },
  { id:'TC-AUTH-010', module:'M01', priority:'P1', name:'Kết thúc ca trực (Đăng xuất)',
    platform: 'Giao diện Web UI',
    steps:['1. Trên thanh Header trạm gác, nhấn nút màu đỏ "Rời ca" (biểu tượng LogOut).',
           '2. Popup "Xác nhận rời ca trực" hiện lên hiển thị khung hình camera trực tiếp.',
           '3. Nhìn thẳng vào camera và nhấn nút "Rời ca" (màu đỏ) để chụp ảnh và kết ca.'],
    expected:['Hệ thống chụp ảnh kết ca, gọi API ghi nhận chính xác thời điểm kết thúc ca trực.',
              'Popup đóng lại và chuyển hướng về màn hình Đăng nhập trạm.'] },

  // ==========================================
  // M02: Khách Đơn & Check-in (Check-in)
  // ==========================================
  { id:'TC-CHECKIN-001', module:'M02', priority:'P1', name:'Đón Khách đi bộ cơ bản',
    platform: 'Giao diện Web UI',
    testData: 'Tên: "Khách VIP", CCCD: "0310...", Lý do: "Gặp IT"',
    precondition:'Trạm gác đang trong ca trực.',
    steps:['1. Trên giao diện Dashboard trạm gác, nhấn nút "+ Check-in khách mới" (màu xanh lá) để mở phiếu đăng ký.',
           '2. Tại modal "Phiếu đăng ký khách ra/vào", nhập Họ tên khách, Số CCCD/Định danh, Mục đích vào (Lý do).',
           '3. Giữ mặc định phương tiện Đi bộ, không phát thẻ, nhấn nút "Hoàn thành Check-In (1 khách, 0 thẻ)".'],
    expected:['Hệ thống xác thực hợp lệ, lưu lượt thăm vào CSDL, modal tự đóng lại.',
              'Bảng "Danh sách lượt khách ra vào đơn vị" (tab Đang trong đơn vị) lập tức xuất hiện dòng khách mới.',
              'Thẻ thống kê "Tổng khách trong đơn vị" tăng thêm 1.'] },
  { id:'TC-CHECKIN-002', module:'M02', priority:'P1', name:'Chặn Check-in trùng lặp (Duplicate)',
    platform: 'Giao diện Web UI',
    testData: 'Nhập lại đúng số CCCD vừa check-in ở bước trước',
    steps:['1. Nhập CCCD của khách ĐANG Ở TRONG.','2. Nhấn Check-in.'],
    expected:['Hệ thống báo lỗi "Khách có số CCCD này đang ở trong đơn vị".'] },
  { id:'TC-CHECKIN-003', module:'M02', priority:'P1', name:'Check-in phát Thẻ Định Danh (RFID/Mã vạch)',
    platform: 'Thiết bị & Cổng gác',
    testData: 'Mã thẻ "TAG-001"',
    steps:['1. Nhấn nút "+ Check-in khách mới", điền thông tin cá nhân khách.',
           '2. Tại mục "Thẻ vào ra", chọn loại thẻ Định danh và quét hoặc nhập mã thẻ (vd: "TAG-001").',
           '3. Nhấn nút "Hoàn thành Check-In (1 khách, 1 thẻ)".'],
    expected:['Check-in thành công. Trên bảng danh sách khách Đang trong đơn vị, cột Thẻ hiển thị nhãn mã thẻ "TAG-001".'] },
  { id:'TC-CHECKIN-004', module:'M02', priority:'P1', name:'Check-in phát Thẻ Cấp Chung (Số lượng đếm)',
    platform: 'Giao diện Web UI',
    testData: 'Số lượng thẻ: 3',
    steps:['1. Nhấn nút "+ Check-in khách mới", điền thông tin khách.',
           '2. Tại mục "Thẻ vào ra", chọn loại Thẻ cấp chung và nhập số lượng thẻ phát (vd: 3).',
           '3. Nhấn nút "Hoàn thành Check-In (1 khách, 3 thẻ)".'],
    expected:['Check-in thành công. Chi tiết lượt thăm ghi nhận 3 thẻ cấp chung.'] },
  { id:'TC-CHECKIN-005', module:'M02', priority:'P1', name:'Check-in có Xe Cộ (Ô tô/Xe máy)',
    platform: 'Giao diện Web UI',
    testData: 'Biển số: "29A-12345", Loại: "Ô tô"',
    steps:['1. Nhấn nút "+ Check-in khách mới", điền thông tin khách.',
           '2. Tại mục Phương tiện, chọn loại xe (Ô tô/Xe máy) và nhập Biển số xe (vd: "29A-12345").',
           '3. Nhấn nút "Hoàn thành Check-In".'],
    expected:['Check-in thành công. Cột Biển số xe trên bảng khách Đang trong đơn vị hiển thị "29A-12345".'] },
  { id:'TC-CHECKIN-006', module:'M02', priority:'P2', name:'Tự động Upsert (Gợi ý) Khách cũ',
    platform: 'Giao diện Web UI',
    testData: 'Nhập CCCD của 1 khách đã từng ra vào hôm qua',
    steps:['1. Tại form Check-in, chỉ gõ số CCCD.','2. Nhấn Tab hoặc click ra ngoài.'],
    expected:['Form tự động "kéo" Tên, Số ĐT, Công ty cũ của khách này và điền sẵn, giúp tiết kiệm thời gian.'] },
  { id:'TC-CHECKIN-007', module:'M02', priority:'P2', name:'Check-in chụp Đa Ảnh Đính Kèm',
    platform: 'Giao diện Web UI',
    testData: 'Camera tài liệu (Document Camera)',
    steps:['1. Trong modal Check-in, nhấn nút "Chụp ảnh đính kèm" để mở popup MultiShotCameraModal.',
           '2. Chụp lần lượt các ảnh (Mặt trước CCCD, Mặt sau, Giấy giới thiệu) bằng cách nhấn nút chụp ảnh trên popup camera.',
           '3. Kiểm tra các ảnh thu nhỏ trong dải gallery bên dưới, nhấn nút "Xong" để lưu ảnh vào phiếu đăng ký.',
           '4. Nhấn nút "Hoàn thành Check-In".'],
    expected:['Toàn bộ các ảnh chụp được resize tối ưu và tải lên server thành công.',
              'Khi mở modal "Chi tiết" lượt thăm, gallery ảnh hiển thị đầy đủ các hình ảnh đã chụp.'] },
  { id:'TC-CHECKIN-008', module:'M02', priority:'P1', name:'Validation: Bỏ trống trường bắt buộc',
    platform: 'Giao diện Web UI',
    steps:['1. Mở modal "+ Check-in khách mới", để trống ô Họ tên hoặc Số CCCD/Định danh.',
           '2. Quan sát trạng thái nút submit và khu vực cảnh báo ở footer modal.'],
    expected:['Nút "Hoàn thành Check-In" bị vô hiệu hóa (disabled, không bấm được).',
              'Thanh footer modal hiển thị danh sách lỗi cảnh báo màu đỏ (Validation Summary) chỉ rõ các trường bắt buộc cần điền.'] },

  // ==========================================
  // M03: Khách Đoàn & Đi Cùng (Accompanying)
  // ==========================================
  { id:'TC-COMP-001', module:'M03', priority:'P1', name:'Tạo Đoàn: Thêm người đi cùng (có Tên tuổi)',
    platform: 'Giao diện Web UI',
    testData: 'Trưởng đoàn + 2 thành viên đi cùng',
    steps:['1. Nhấn "+ Check-in khách mới", nhập thông tin Trưởng đoàn.',
           '2. Nhấn nút "+ Thêm người đi cùng", nhập Họ tên và CCCD cho thành viên số 2 và số 3.',
           '3. Nhấn nút "Hoàn thành Check-In (3 khách, 0 thẻ)".'],
    expected:['Tạo đoàn thành công. Bảng Đang trong đơn vị hiển thị Trưởng đoàn kèm nhãn số lượng thành viên đi cùng là 2.'] },
  { id:'TC-COMP-002', module:'M03', priority:'P1', name:'Tạo Đoàn: Nhập nhanh Số lượng khách vô danh',
    platform: 'Giao diện Web UI',
    testData: 'Trưởng đoàn + Đoàn công nhân 15 người',
    steps:['1. Nhấn "+ Check-in khách mới", nhập thông tin Trưởng đoàn.',
           '2. Tại mục Khách đi cùng vô danh, nhập số lượng = 15.',
           '3. Nhấn nút "Hoàn thành Check-In (16 khách, 0 thẻ)".'],
    expected:['Tổng khách lượt thăm ghi nhận 16 người (1 Trưởng đoàn + 15 khách vô danh), không cần gõ từng tên.'] },
  { id:'TC-COMP-003', module:'M03', priority:'P1', name:'Sửa Đoàn đang Inside: Bổ sung thành viên',
    platform: 'Giao diện Web UI',
    testData: 'Chọn khách đoàn đang Inside',
    steps:['1. Tại bảng danh sách trạm gác, tìm lượt thăm của đoàn đang ở trạng thái Inside.',
           '2. Tại cột Thao tác, nhấn nút màu tím "Thêm" (biểu tượng icon Plus).',
           '3. Modal "Bổ sung thành viên & Phương tiện vào đơn vị" mở ra, nhấn "+ Thêm người đi cùng" và nhập thông tin thành viên mới.',
           '4. Nhấn nút "Lưu thông tin bổ sung".'],
    expected:['Hệ thống gọi API /station/visits/supplemental cập nhật trực tiếp vào lượt thăm hiện tại.',
              'Số lượng người trong đoàn tăng thêm 1, không tạo thêm lượt thăm rác.'] },
  { id:'TC-COMP-004', module:'M03', priority:'P2', name:'Sửa Đoàn đang Inside: Bổ sung Xe ô tô đi sau',
    platform: 'Giao diện Web UI',
    testData: 'Đoàn khách lúc sáng đi bộ vào, chiều mang xe vào',
    steps:['1. Tại dòng khách đang Inside, nhấn nút "Thêm" (icon Plus) để mở modal Bổ sung.',
           '2. Chuyển sang mục Phương tiện, thêm loại xe và nhập biển số xe vào sau.',
           '3. Nhấn nút "Lưu thông tin bổ sung".'],
    expected:['Phương tiện được gán bổ sung vào lượt thăm hiện tại thành công.'] },
  { id:'TC-COMP-005', module:'M03', priority:'P2', name:'Khách Lưu Trú Qua Đêm (Nhiều Ngày)',
    platform: 'Giao diện Web UI',
    steps:['1. Trong modal Check-in, tích chọn "Khách lưu trú dài ngày / qua đêm".','2. Nhấn nút "Hoàn thành Check-In".'],
    expected:['Khách được gắn cờ IsMultiDayVisit. Khách này sẽ BỎ QUA quá trình Auto Check-out lúc nửa đêm của hệ thống.'] },

  // ==========================================
  // M04: Trả thẻ & Check-out (Check-out)
  // ==========================================
  { id:'TC-CHKOUT-001', module:'M04', priority:'P1', name:'Check-out Khách Đơn, không nợ thẻ',
    platform: 'Giao diện Web UI',
    steps:['1. Tại bảng danh sách khách (tab Đang trong đơn vị), tìm lượt thăm cần check-out.',
           '2. Nhấn nút màu cam "Check-out" (biểu tượng LogOut) ở cột Thao tác.',
           '3. Modal "Phiếu xuất bến & Check-out" mở ra và đã tích chọn sẵn khách ra về.',
           '4. Nhấn nút "Xác nhận Check-out (1 người, 0 xe, 0 thẻ)".'],
    expected:['Check-out thành công. Khách biến mất khỏi tab "Đang trong đơn vị" và chuyển sang tab "Lịch sử ra vào" với trạng thái Đã ra (CheckedOut).',
              'Thời gian xuất bến được ghi nhận chính xác đến từng giây.'] },
  { id:'TC-CHKOUT-002', module:'M04', priority:'P1', name:'Check-out: Thu hồi Thẻ Định Danh',
    platform: 'Giao diện Web UI',
    testData: 'Khách đang cầm thẻ "TAG-001"',
    steps:['1. Nhấn nút "Check-out" trên dòng khách đang mượn thẻ TAG-001.',
           '2. Trong modal Check-out, tại mục danh sách thẻ, tích chọn thu hồi thẻ "TAG-001".',
           '3. Nhấn nút "Xác nhận Check-out (1 người, 0 xe, 1 thẻ)".'],
    expected:['Check-out thành công. Thẻ TAG-001 được thu hồi và hoàn trả về kho thẻ với trạng thái Sẵn sàng cấp (Available).'] },
  { id:'TC-CHKOUT-003', module:'M04', priority:'P1', name:'Báo lỗi: Quên không thu thẻ (Chặn Check-out)',
    platform: 'Giao diện Web UI',
    testData: 'Khách đang cầm thẻ, Chính sách hệ thống cấm nợ thẻ',
    steps:['1. Nhấn nút "Check-out" cho khách đang mượn thẻ.',
           '2. Trong modal Check-out, cố tình KHÔNG TÍCH thu lại thẻ và KHÔNG chọn báo mất thẻ.',
           '3. Nhấn nút "Xác nhận Check-out".'],
    expected:['Hệ thống chặn lại, hiển thị thông báo lỗi yêu cầu nhân viên phải xác nhận thu hồi thẻ hoặc đánh dấu nợ thẻ/mất thẻ trước khi cho khách ra.'] },
  { id:'TC-CHKOUT-004', module:'M04', priority:'P1', name:'Ngoại lệ: Báo Mất Thẻ / Chấp nhận Khách nợ thẻ',
    platform: 'Giao diện Web UI',
    steps:['1. Trong modal Check-out, tại mục xử lý thẻ, tích chọn "Báo Mất / Chưa trả thẻ".',
           '2. Nhập lý do vào ô Ghi chú Check-out: "Khách để quên ở nhà, cam kết trả sau".',
           '3. Nhấn nút "Xác nhận Check-out".'],
    expected:['Hệ thống cho phép check-out, trạng thái lượt thăm ghi nhận Đã ra (Có nợ thẻ), mã thẻ chuyển sang trạng thái Lost/Debt.'] },
  { id:'TC-CHKOUT-005', module:'M04', priority:'P2', name:'Check-out Xe Ra Trước (Người ở lại)',
    platform: 'Giao diện Web UI',
    testData: 'Khách có xe',
    steps:['1. Nhấn nút "Check-out" của đoàn có xe ô tô.',
           '2. Trong modal Check-out, tích chọn Xe ra khỏi cổng, BỎ CHỌN người ra về.',
           '3. Nhấn nút "Xác nhận Check-out (0 người, 1 xe, 0 thẻ)".'],
    expected:['Ghi nhận thời gian xuất bến của xe. Lượt thăm và thành viên trong đoàn vẫn duy trì trạng thái Đang trong đơn vị (Inside).'] },
  { id:'TC-CHKOUT-006', module:'M04', priority:'P2', name:'Check-out Từng Phần Đoàn (Vài người về trước)',
    platform: 'Giao diện Web UI',
    testData: 'Đoàn có Trưởng đoàn + 2 người đi cùng',
    steps:['1. Mở popup Check-out trên dòng khách đoàn.','2. Bỏ tích Trưởng đoàn, chỉ tích chọn người đi cùng ra về.','3. Nhấn nút "Xác nhận Check-out".'],
    expected:['Chỉ người đi cùng số 1 có giờ ra. Toàn bộ lượt thăm (Visit) vẫn ở trạng thái Inside.'] },
  { id:'TC-CHKOUT-007', module:'M04', priority:'P1', name:'Đóng Lượt thăm hoàn toàn (Tự động chuyển CheckedOut)',
    platform: 'Giao diện Web UI',
    testData: 'Lượt thăm phức tạp đang Check-out lắt nhắt',
    steps:['1. Mở modal Check-out, tích chọn nốt toàn bộ thành viên, xe và thẻ còn lại của lượt thăm.',
           '2. Nhấn nút "Xác nhận Check-out".'],
    expected:['Hệ thống kiểm tra không còn thành viên hoặc xe nào sót lại bên trong, lượt thăm tự động chuyển sang trạng thái Đã ra hoàn toàn (CheckedOut).'] },
  { id:'TC-CHKOUT-008', module:'M04', priority:'P2', name:'Trả 1 phần Thẻ Vô Danh',
    platform: 'Giao diện Web UI',
    testData: 'Khách mượn 10 thẻ vô danh',
    steps:['1. Nhấn nút Check-out trên dòng khách mượn thẻ cấp chung.','2. Tại mục Thẻ cấp chung, nhập số thẻ trả = 4 (nợ lại 6 thẻ).','3. Nhấn nút "Xác nhận Check-out".'],
    expected:['Hệ thống cho phép. Khách ghi nợ 6 thẻ vô danh.'] },

  // ==========================================
  // M05: Quản trị Tài khoản & Admin (Settings)
  // ==========================================
  { id:'TC-ADMIN-001', module:'M05', priority:'P1', name:'Quản trị viên (Admin) Đăng nhập Hệ thống Admin',
    platform: 'Giao diện Quản trị',
    testData: 'Tài khoản mặc định: admin / admin123 (hoặc dataentry / data123)',
    steps:['1. Mở trang Quản trị (/index.html).','2. Nhập tài khoản mật khẩu admin (admin / admin123).','3. Nhấn Đăng nhập.'],
    expected:['Đăng nhập thành công, thấy được màn hình Dashboard Thống kê và Quản lý Hệ thống.'] },
  { id:'TC-ADMIN-002', module:'M05', priority:'P1', name:'Đổi mật khẩu tài khoản Admin',
    platform: 'Giao diện Quản trị',
    steps:['1. Vào tab Cài đặt / Quản lý tài khoản.','2. Chọn Đổi mật khẩu.','3. Nhập mk cũ "admin123", mk mới "123456".'],
    expected:['Đổi thành công. Lần đăng nhập Admin sau bắt buộc dùng mk mới. (LƯU Ý: TEST XONG ĐỔI LẠI "admin123" ĐỂ TIẾP TỤC TEST)'] },
  { id:'TC-STAFF-001', module:'M05', priority:'P1', name:'Thêm Nhân Viên Mới (Trạm gác)',
    platform: 'Giao diện Quản trị',
    testData: 'Tên: "Bảo vệ Mới", Username: "baove3", CCCD: "026088009999", SĐT: "0988123456", Giới tính: Nam, Phòng ban: "An Ninh"',
    steps:['1. Vào Cài đặt > Quản lý Tài khoản & Nhân viên.','2. Nhấn Thêm mới Nhân viên. Điền đủ Họ tên, Số CCCD, SĐT, Tên đăng nhập (không cần mật khẩu), Phòng ban, Chức vụ.','3. Nhấn Lưu.'],
    expected:['Thêm thành công. Mã nhân viên tự sinh (vd: NV000004). Tài khoản baove3 lập tức có thể dùng để đăng nhập mở ca ở trạm gác.'] },
  { id:'TC-STAFF-002', module:'M05', priority:'P2', name:'Cập nhật Quyền dùng CCCD thay Camera',
    platform: 'Giao diện Quản trị',
    testData: 'Chọn tài khoản baove3',
    steps:['1. Chỉnh sửa baove3.','2. Tích chọn "Cho phép đăng nhập bằng CCCD (Bỏ qua Camera)".','3. Lưu.'],
    expected:['Từ giờ baove3 có thể quẹt CCCD để mở ca theo kịch bản TC-AUTH-007.'] },
  { id:'TC-STAFF-003', module:'M05', priority:'P2', name:'Khóa (Deactivate) tài khoản nhân viên đã nghỉ',
    platform: 'Giao diện Quản trị',
    testData: 'Chọn tài khoản baove3',
    steps:['1. Sửa baove3, TẮT nút "Đang hoạt động (IsActive)".','2. Lưu.'],
    expected:['Tài khoản chuyển màu xám. Mọi nỗ lực login bằng baove3 sẽ bị chặn (như TC-AUTH-004).'] },
  { id:'TC-STAFF-004', module:'M05', priority:'P1', name:'Xóa hàng loạt (Bulk Delete) Nhân viên rác',
    platform: 'Giao diện Quản trị',
    steps:['1. Tích chọn nhiều nhân viên giả mạo.','2. Nhấn nút "Xóa các mục đã chọn".','3. Xác nhận Cảnh báo nguy hiểm.'],
    expected:['Hệ thống xóa sạch các nhân viên này khỏi DB (chỉ xóa được nếu họ chưa từng mở ca trực nào).'] },
  { id:'TC-STAFF-005', module:'M05', priority:'P2', name:'Import danh sách nhân viên từ Excel (Dự phòng)',
    platform: 'API / Postman',
    testData: 'Upload file Excel (hoặc gọi API /api/admin/staff/import)',
    steps:['1. Gửi request Import file Excel danh sách 50 nhân viên theo template mẫu.'],
    expected:['Hệ thống tự động Insert hàng loạt 50 nhân viên. Báo lỗi những dòng sai định dạng.'] },

  // ==========================================
  // M06: Báo Cáo, Thống Kê & Xuất File (Report & Export)
  // ==========================================
  { id:'TC-RPT-001', module:'M06', priority:'P1', name:'Dashboard Admin: Thống kê Khách Đang Trong Đơn Vị (Inside)',
    platform: 'Giao diện Quản trị',
    steps:['1. Vào tab Dashboard Admin.','2. Gọi API /api/admin/dashboard/inside.'],
    expected:['Hiển thị chính xác tổng số Khách, Đoàn, và Phương tiện ĐANG Ở TRONG thời điểm hiện tại.'] },
  { id:'TC-RPT-002', module:'M06', priority:'P1', name:'Tra cứu Lịch sử (Tìm kiếm đa năng)',
    platform: 'Giao diện Quản trị',
    testData: 'Gõ từ khóa: "Tuấn" hoặc "29A-"',
    steps:['1. Vào tab Lịch sử (History).','2. Nhập từ khóa vào ô tìm kiếm.','3. Nhấn Enter (Lọc).'],
    expected:['Hệ thống fetch API /api/admin/visits?search=...','Danh sách lọc ngay lập tức ra các lượt thăm có Tên, CCCD hoặc Biển số xe chứa từ khóa.'] },
  { id:'TC-RPT-003', module:'M06', priority:'P1', name:'Lọc Lịch sử theo Thời gian (Date Range)',
    platform: 'Giao diện Quản trị',
    testData: 'Chọn Từ ngày 01/01 đến 15/01',
    steps:['1. Chọn bộ lọc Date Picker.','2. Áp dụng.'],
    expected:['Chỉ hiển thị các lượt thăm phát sinh trong khoảng thời gian này.'] },
  { id:'TC-RPT-004', module:'M06', priority:'P2', name:'Lọc Lịch sử theo Trạng thái & Thẻ nợ',
    platform: 'Giao diện Quản trị',
    testData: 'Filter: "Chưa trả thẻ" / "Đã báo mất"',
    steps:['1. Mở bộ lọc nâng cao, chọn mục Khách Nợ Thẻ.','2. Áp dụng.'],
    expected:['Hiển thị đúng những khách CheckedOut nhưng vẫn còn giữ thẻ (hoặc làm mất).'] },
  { id:'TC-RPT-005', module:'M06', priority:'P1', name:'Xem Chi tiết Lượt thăm trong Lịch sử',
    platform: 'Giao diện Quản trị',
    steps:['1. Click vào 1 dòng lượt thăm trong Lịch sử.','2. Modal Chi tiết mở ra.'],
    expected:['Hiển thị ĐẦY ĐỦ: Tên khách, Giờ vào/ra, Người bảo vệ duyệt, Toàn bộ Ảnh đính kèm đã chụp, Biển số xe.'] },
  { id:'TC-RPT-006', module:'M06', priority:'P1', name:'Xuất file Báo Cáo Lịch Sử ra Excel (.xlsx)',
    platform: 'Giao diện Quản trị',
    steps:['1. Đặt các bộ lọc (VD: Hôm nay).','2. Nhấn nút "Xuất Excel" (Export).','3. Đợi tiến trình tải xuống.'],
    expected:['File Excel tải về thành công (Gọi API /api/admin/visits/export).','Mở file không bị lỗi Font, dữ liệu khớp 100% với danh sách trên Web.'] },

  // ==========================================
  // M07: Bảo Trì Dữ Liệu & Auto Backup (Backup)
  // ==========================================
  { id:'TC-BCK-001', module:'M07', priority:'P1', name:'Sao lưu Cơ sở dữ liệu Thủ công (Manual Backup)',
    platform: 'Giao diện Quản trị',
    steps:['1. Vào tab Cài đặt > Backup & Restore.','2. Nhấn "Tạo bản sao lưu ngay".'],
    expected:['Gọi API /api/admin/backup. Hệ thống thông báo thành công. Một file backup hiển thị ở danh sách bên dưới.'] },
  { id:'TC-BCK-002', module:'M07', priority:'P2', name:'Tải file Backup về máy cá nhân (Download)',
    platform: 'Giao diện Quản trị',
    testData: 'Có sẵn file trong danh sách backup',
    steps:['1. Tìm dòng backup vừa tạo, nhấn nút "Tải xuống" (Download).'],
    expected:['Gọi API /api/admin/backup/file/{name}. Trình duyệt tải về file .db an toàn.'] },
  { id:'TC-BCK-003', module:'M07', priority:'P1', name:'Phục hồi dữ liệu từ file (Restore)',
    platform: 'Giao diện Quản trị',
    steps:['1. Nhấn nút "Khôi phục dữ liệu".','2. Chọn file .db từ máy tính.','3. Xác nhận ghi đè.'],
    expected:['Gọi API /api/admin/restore.','Hệ thống ngắt kết nối tạm thời, ghi đè DB, khởi động lại service nội bộ, F5 lại trang Web dữ liệu cũ hiện ra nguyên vẹn.'] },
  { id:'TC-BCK-004', module:'M07', priority:'P2', name:'Xem trạng thái & lịch sử Auto Backup',
    platform: 'Giao diện Quản trị',
    steps:['1. Truy cập tab Backup.','2. Xem bảng Lịch sử tự động.'],
    expected:['Bảng gọi API /api/admin/backup/history liệt kê các mốc sao lưu tự động hàng ngày.'] },
  { id:'TC-BCK-005', module:'M07', priority:'P3', name:'Xóa thủ công bản Backup cũ',
    platform: 'Giao diện Quản trị',
    steps:['1. Chọn 1 bản backup cũ, nhấn icon Xóa (Thùng rác).','2. Xác nhận.'],
    expected:['Gọi API /api/admin/backup/{name} (DELETE). File bị xóa khỏi ổ cứng máy chủ.'] },
  { id:'TC-BCK-006', module:'M07', priority:'P2', name:'Thay đổi cấu hình Auto Backup (Cron/Interval)',
    platform: 'Giao diện Quản trị',
    testData: 'Chỉnh thời gian tự động sao lưu = 1 ngày/lần',
    steps:['1. Tại mục Cấu hình Backup, đổi tham số Interval.','2. Nhấn Lưu cài đặt.'],
    expected:['Gọi API /api/admin/backup/settings. Hệ thống nhận lệnh và hẹn giờ tiến trình Background chạy theo cấu hình mới.'] },

  // ==========================================
  // M08: Thiết bị Ngoại vi (Device Service)
  // ==========================================
  { id:'TC-DEV-001', module:'M08', priority:'P1', name:'Thay đổi Cấu hình Camera trong Admin',
    platform: 'Giao diện Quản trị',
    testData: 'Chọn loại Camera = "IP Camera", nhập URL RTSP',
    steps:['1. Vào Cài đặt Thiết bị.','2. Cập nhật Device Profile cho Trạm 1.','3. Đổi cấu hình nguồn Video. Lưu lại.'],
    expected:['Gọi API /api/admin/device-profile. Hệ thống ghi đè file cấu hình thiết bị trạm. (Lưu ý: Yêu cầu Refresh App trạm gác để nhận diện).'] },
  { id:'TC-DEV-002', module:'M08', priority:'P2', name:'Test tính năng: Tắt bắt buộc chụp ảnh (No Camera Zone)',
    platform: 'Giao diện Quản trị',
    steps:['1. Trong Cấu hình Thiết bị trạm, TẮT cờ "RequireCameraForCheckin" (Bắt buộc có ảnh).','2. Qua cổng gác thực hiện Check-in một khách.'],
    expected:['Hệ thống cho phép Check-in ngay lập tức, KHÔNG mở Popup yêu cầu chụp ảnh nữa.'] },
  { id:'TC-DEV-003', module:'M08', priority:'P2', name:'Cấu hình cổng giao tiếp Đầu đọc thẻ (COM Port)',
    platform: 'Giao diện Quản trị',
    testData: 'Đổi cổng COM3 -> COM4',
    steps:['1. Cập nhật mục RFID Reader sang COM4.','2. Lưu lại.'],
    expected:['DeviceService tự động khởi động lại module CardReader để lắng nghe trên cổng COM mới (hoặc cần restart service).'] },

  // ==========================================
  // M09: Thiết lập Giao diện & Mạng lưới (Control Panel)
  // ==========================================
  { id:'TC-NET-001', module:'M09', priority:'P2', name:'Thiết lập Đăng nhập từ xa (Domain / SSL)',
    platform: 'API / Postman',
    testData: 'Gọi API cập nhật Domain',
    steps:['1. Sử dụng SystemAdmin gọi API POST /api/system/update-domain với thông tin "my-smartvms.local"'],
    expected:['Hệ thống phản hồi 200 OK.','Kích hoạt các script hệ thống để tạo chứng chỉ SSL (Local) và cấu hình lại web server.'] },
  { id:'TC-NET-002', module:'M09', priority:'P3', name:'Lấy cấu hình chung (Public Config) không cần Auth',
    platform: 'API / Postman',
    steps:['1. Gọi GET /api/station/config mà không cần Bearer token.'],
    expected:['Nhận được JSON chứa version, Tên trạm, Trạng thái kết nối DB để UI load giao diện cơ bản ban đầu.'] },
  { id:'TC-NET-003', module:'M09', priority:'P2', name:'Thiết lập giao diện hiển thị bảng (Display Settings Modal)',
    platform: 'Giao diện Web UI',
    steps:['1. Tại trạm gác, nhấn icon Bánh răng Cài đặt.','2. Bật/Tắt các cột trong bảng (Ẩn cột Tên Công Ty).','3. Lưu.'],
    expected:['Bảng Đang trong đơn vị lập tức cập nhật, ẩn đi cột Tên Công ty. Thiết lập lưu vào LocalStorage/DB để nhớ cho lần sau.'] },

  // ==========================================
  // M10: Phi chức năng, Ổn định & Chịu lỗi (Reliability)
  // ==========================================
  { id:'TC-STB-001', module:'M10', priority:'P1', name:'Offline-First: Ngắt kết nối Mạng Internet WAN',
    platform: 'Môi trường Mạng',
    testData: 'Rút dây mạng Internet, giữ nguyên dây LAN cục bộ',
    steps:['1. Rút cáp quang/cáp mạng Internet khỏi trạm gác (hoặc tắt WiFi router ra ngoài).','2. Thực hiện Check-in 3 khách.'],
    expected:['Hệ thống VẪN HOẠT ĐỘNG hoàn toàn bình thường, rất nhanh. (Do C# Server và React App chạy cục bộ trên máy trạm).'] },
  { id:'TC-STB-002', module:'M10', priority:'P1', name:'Chống Spam Click / Race Condition',
    platform: 'Giao diện Web UI',
    testData: 'Màn check-in khách',
    steps:['1. Điền đủ thông tin khách.','2. Nhấn nút Check-in LIÊN TỤC (click 10-20 lần cực nhanh) hoặc dùng AutoClick.'],
    expected:['Hệ thống chỉ gửi đi 1 request hoặc server chỉ xử lý 1 request nhờ cơ chế block UI (loading) hoặc Idempotent Token. KHÔNG TẠO RA 20 LƯỢT THĂM TRÙNG NHAU.'] },
  { id:'TC-STB-003', module:'M10', priority:'P1', name:'Bảo toàn dữ liệu khi Crash (Mất điện / Tắt Server nóng)',
    platform: 'Phần cứng',
    testData: 'Đang lưu file',
    steps:['1. Trong lúc phần mềm đang xử lý lưu khách (vòng quay loading).','2. Tắt nóng tiến trình C# (End Task) hoặc Rút điện máy tính.','3. Khởi động lại.'],
    expected:['Database SQLite sử dụng Write-Ahead Logging (WAL). Nếu ghi chưa xong sẽ rollback an toàn. Database không bị hỏng (Corrupted). Khởi động lên vẫn truy cập bình thường.'] },
  { id:'TC-STB-004', module:'M10', priority:'P1', name:'Tự động ép Check-out khách tồn đọng qua đêm (Auto Check-out Service)',
    platform: 'Hệ thống (Background)',
    testData: 'Cấu hình SystemSetting: AutoCheckoutSameDayVisits="true", 1 khách thường (IsMultiDayVisit=false) Inside',
    steps:['1. Chỉnh giờ hệ thống sang ngày hôm sau hoặc chờ AutoCheckOutHostedService chạy (chu kỳ 10 phút).','2. Quan sát log hệ thống và trạng thái lượt thăm.'],
    expected:['Service nền tự động quét, set CheckOutTime về 23:59:59 của ngày check-in, IsAutoCheckedOut=true, Status=CheckedOut. Khách có IsMultiDayVisit=true được giữ nguyên trong đơn vị.'] },
  { id:'TC-STB-005', module:'M10', priority:'P3', name:'Giao diện Responsive / Phân giải màn hình',
    platform: 'Giao diện Web UI',
    testData: 'Máy trạm có màn hình độ phân giải thấp (1366x768)',
    steps:['1. Thu nhỏ cửa sổ trình duyệt xuống kích thước 1366x768.','2. Cuộn bảng, mở modal.'],
    expected:['Giao diện co giãn tốt, không bị vỡ bố cục, nút Check-in không bị lấp mất khỏi màn hình.'] },
  // ==========================================
  // [BỔ SUNG] 90 TEST CASES MỞ RỘNG (EDGE CASES & NEGATIVE TESTS)
  // ==========================================
  // M01 EXTENSIONS
  { id:'TC-AUTH-011', module:'M01', priority:'P2', name:'Login Session Timeout', platform:'Giao diện Web UI', testData:'Đăng nhập thành công, treo máy 24h', steps:['1. Đăng nhập.','2. Để nguyên màn hình không thao tác qua ngày hôm sau.','3. Click 1 nút bất kỳ.'], expected:['Hệ thống báo "Phiên đăng nhập hết hạn". Đẩy về màn hình Login.'] },
  { id:'TC-AUTH-012', module:'M01', priority:'P3', name:'Đăng nhập đồng thời trên 2 thiết bị (Chặn đa phiên & Ép đăng nhập)', platform:'Giao diện Web UI', testData:'Dùng cùng 1 tài khoản bảo vệ login trên 2 thiết bị khác nhau', steps:['1. Nhân viên login và mở ca ở máy A.','2. Đăng nhập tài khoản đó ở máy B.'], expected:['Máy B nhận cảnh báo mã ALREADY_ACTIVE ("Tài khoản đang có phiên trực tại trạm..."). Máy B hiển thị nút "Ép Bắt Đầu Ca Mới" (ForceLogin). Khi ép vào, phiên ở máy A bị vô hiệu hóa do LastLoginAt cập nhật.'] },
  { id:'TC-AUTH-013', module:'M01', priority:'P2', name:'Quét CCCD mở ca: Bụi bẩn trên thẻ', platform:'Thiết bị & Cổng gác', testData:'Dán 1 lớp băng keo đục mờ lên chip', steps:['1. Quét thẻ CCCD bị mờ/bẩn.'], expected:['Hệ thống timeout và báo lỗi "Không thể đọc chip, vui lòng lau sạch thẻ".'] },
  { id:'TC-AUTH-014', module:'M01', priority:'P3', name:'Mở ca: Camera bị ngắt kết nối đột ngột',
    platform: 'Giao diện Web UI',
    testData: 'Rút cáp USB webcam',
    steps:['1. Popup chụp ảnh Mở ca hiện lên, rút cáp USB camera khỏi máy tính.',
           '2. Quan sát khung hình camera và thử nhấn nút "Vào ca".'],
    expected:['Khung hình camera báo mất tín hiệu, nút "Vào ca" bị vô hiệu hóa hoặc hệ thống hiển thị thông báo lỗi yêu cầu kết nối lại camera.'] },
  { id:'TC-AUTH-015', module:'M01', priority:'P2', name:'Check trạng thái Ca trực trên Dashboard',
    platform: 'Giao diện Web UI',
    steps:['1. Đăng nhập và mở ca trực thành công vào Dashboard.',
           '2. Quan sát thông tin nhân sự trên thanh Header.'],
    expected:['Header hiển thị tên nhân viên, avatar có viền và chấm tròn màu xanh lá (Đang trong ca trực), đi kèm nút màu đỏ "Rời ca".'] },
  { id:'TC-AUTH-016', module:'M01', priority:'P3', name:'Bypass Login bằng URL direct', platform:'Giao diện Web UI', steps:['1. Chưa đăng nhập.','2. Gõ thẳng URL /dashboard vào trình duyệt.'], expected:['Bị chặn lại và redirect về /login.'] },
  { id:'TC-AUTH-017', module:'M01', priority:'P2', name:'Logout khi mất mạng', platform:'Giao diện Web UI', steps:['1. Ngắt mạng LAN.','2. Bấm Kết ca.'], expected:['Báo lỗi "Không thể kết nối máy chủ, chưa thể kết ca".'] },
  { id:'TC-AUTH-018', module:'M01', priority:'P2', name:'SQL Injection trên form Login', platform:'Giao diện Web UI', testData:'Username: "admin\' OR \'1\'=\'1"', steps:['1. Nhập username injection.','2. Login.'], expected:['Báo lỗi sai tài khoản. Không bị hack.'] },
  { id:'TC-AUTH-019', module:'M01', priority:'P2', name:'XSS trên form Login', platform:'Giao diện Web UI', testData:'Username: "<script>alert(1)</script>"', steps:['1. Nhập username XSS.','2. Login.'], expected:['Không alert, báo lỗi sai tài khoản.'] },
  { id:'TC-AUTH-020', module:'M01', priority:'P3', name:'Bảo vệ Anti-Spam đăng nhập trạm gác', platform:'Giao diện Web UI', steps:['1. Spam click nút Đăng nhập liên tục nhiều lần.','2. Thử liên tiếp nhiều username không tồn tại.'], expected:['Frontend debounce nút bấm (trạng thái busy), ngăn submit dồn dập. Backend trả về 400 rõ ràng, không gây treo service C#.'] },

  // M02 EXTENSIONS
  { id:'TC-CHECKIN-009', module:'M02', priority:'P2', name:'Check-in Khách: SĐT chứa ký tự chữ', platform:'Giao diện Web UI', testData:'SĐT: "090abc1234"', steps:['1. Nhập SĐT chứa chữ.'], expected:['Form báo lỗi format SĐT.'] },
  { id:'TC-CHECKIN-010', module:'M02', priority:'P2', name:'Check-in Khách: Tên chứa ký tự đặc biệt', platform:'Giao diện Web UI', testData:'Tên: "Nguyễn @#$"', steps:['1. Nhập tên có ký tự lạ.','2. Check-in.'], expected:['Báo lỗi tên không hợp lệ.'] },
  { id:'TC-CHECKIN-011', module:'M02', priority:'P3', name:'Check-in: Biển số xe quá dài', platform:'Giao diện Web UI', testData:'Biển số: "29A-123.4567890123"', steps:['1. Nhập biển số siêu dài.'], expected:['Bị chặn ở max-length của textbox.'] },
  { id:'TC-CHECKIN-012', module:'M02', priority:'P1', name:'Phát thẻ định danh: Mã thẻ không tồn tại', platform:'Thiết bị & Cổng gác', testData:'Quét thẻ rác không có trong DB hệ thống', steps:['1. Gắn mã thẻ rác cho khách.','2. Check-in.'], expected:['Báo lỗi "Mã thẻ này chưa được đăng ký trong hệ thống".'] },
  { id:'TC-CHECKIN-013', module:'M02', priority:'P1', name:'Phát thẻ định danh: Thẻ ĐANG ĐƯỢC SỬ DỤNG', platform:'Thiết bị & Cổng gác', testData:'Thẻ TAG-001 đang được 1 khách khác mượn chưa trả', steps:['1. Quét thẻ TAG-001 cho khách mới.','2. Check-in.'], expected:['Báo lỗi "Thẻ này đang được sử dụng bởi khách khác".'] },
  { id:'TC-CHECKIN-014', module:'M02', priority:'P2', name:'Check-in: Ảnh CMND upload quá dung lượng (10MB)', platform:'Giao diện Web UI', testData:'File JPG 15MB', steps:['1. Upload file 15MB.'], expected:['Báo lỗi "File quá lớn, tối đa 5MB".'] },
  { id:'TC-CHECKIN-015', module:'M02', priority:'P3', name:'Check-in: Upload file không phải ảnh', platform:'Giao diện Web UI', testData:'File .exe hoặc .pdf', steps:['1. Upload file .exe.'], expected:['Báo lỗi "Chỉ chấp nhận định dạng hình ảnh".'] },
  { id:'TC-CHECKIN-016', module:'M02', priority:'P2', name:'Upsert: Sửa thông tin khách cũ', platform:'Giao diện Web UI', testData:'CCCD cũ, nhưng đổi Số ĐT mới', steps:['1. Nhập CCCD cũ, tự điền data.','2. Đổi Số ĐT.','3. Check-in.'], expected:['Lưu khách thành công, DB cập nhật SĐT mới cho khách này.'] },
  { id:'TC-CHECKIN-017', module:'M02', priority:'P3', name:'Gõ phím Enter để Check-in', platform:'Giao diện Web UI', steps:['1. Điền form xong, nhấn phím Enter trên bàn phím.'], expected:['Tương đương click nút Check-in, form submit thành công.'] },
  { id:'TC-CHECKIN-018', module:'M02', priority:'P3', name:'Tab index trên form', platform:'Giao diện Web UI', steps:['1. Nhấn phím Tab liên tục.'], expected:['Con trỏ nhảy đúng thứ tự từ trên xuống dưới, không bị loạn.'] },

  // M03 EXTENSIONS
  { id:'TC-COMP-006', module:'M03', priority:'P2', name:'Người đi cùng: Xóa người vừa thêm (trước khi lưu)', platform:'Giao diện Web UI', steps:['1. Click Thêm người.','2. Click icon Thùng rác xóa dòng người đó.','3. Check-in.'], expected:['Người đó không được lưu vào hệ thống.'] },
  { id:'TC-COMP-007', module:'M03', priority:'P3', name:'Người đi cùng: Nhập trùng CCCD với trưởng đoàn', platform:'Giao diện Web UI', testData:'CCCD người đi cùng = CCCD trưởng đoàn', steps:['1. Nhập trùng CCCD.','2. Check-in.'], expected:['Báo lỗi "CCCD người đi cùng trùng với trưởng đoàn".'] },
  { id:'TC-COMP-008', module:'M03', priority:'P3', name:'Số lượng thẻ vô danh > Số lượng người vô danh', platform:'Giao diện Web UI', testData:'Khách vô danh 2 người, Phát 5 thẻ vô danh', steps:['1. Nhập sl khách 2, sl thẻ 5.','2. Check-in.'], expected:['Vẫn cho phép (Khách 2 người có thể cầm nhiều thẻ cho xe cộ/đồ đạc).'] },
  { id:'TC-COMP-009', module:'M03', priority:'P2', name:'Cập nhật đoàn: Xóa bớt xe ô tô', platform:'Giao diện Web UI', steps:['1. Chọn khách đoàn Inside đang có xe.','2. Xóa biển số xe. Lưu.'], expected:['Xe bị gỡ khỏi lượt thăm.'] },
  { id:'TC-COMP-010', module:'M03', priority:'P2', name:'Cập nhật đoàn: Đổi thẻ định danh khác', platform:'Giao diện Web UI', testData:'Đổi từ thẻ TAG-001 sang TAG-002', steps:['1. Chọn khách Inside, sửa thẻ định danh.','2. Lưu.'], expected:['TAG-001 được giải phóng, TAG-002 bị gắn vào khách.'] },
  { id:'TC-COMP-011', module:'M03', priority:'P1', name:'Nhóm Khách 100 người', platform:'Giao diện Web UI', testData:'Thêm 100 dòng người đi cùng', steps:['1. Bấm thêm người liên tục 100 lần. Điền data.','2. Check-in.'], expected:['Lưu thành công, không crash UI, performance vẫn chấp nhận được.'] },
  { id:'TC-COMP-012', module:'M03', priority:'P3', name:'Mở 2 tab Check-in cho cùng 1 CCCD', platform:'Giao diện Web UI', steps:['1. Mở 2 tab browser.','2. Điền cùng 1 khách vào cả 2 tab.','3. Bấm Check-in tab 1.','4. Bấm Check-in tab 2.'], expected:['Tab 1 thành công. Tab 2 báo lỗi "Khách đã ở trong đơn vị".'] },
  { id:'TC-COMP-013', module:'M03', priority:'P2', name:'Check-out người trong đoàn đang có nợ thẻ', platform:'Giao diện Web UI', steps:['1. Check-out trưởng đoàn nhưng KHÔNG thu thẻ.','2. Chấp nhận nợ thẻ.'], expected:['Người đó ra về, Trạng thái lượt thăm = Mất thẻ 1 phần.'] },
  { id:'TC-COMP-014', module:'M03', priority:'P3', name:'Sửa tên người đi cùng', platform:'Giao diện Web UI', steps:['1. Cập nhật khách đoàn Inside.','2. Đổi tên người đi cùng từ A -> B. Lưu.'], expected:['Cập nhật thành công. Tên trong DB đổi thành B.'] },
  { id:'TC-COMP-015', module:'M03', priority:'P3', name:'Thêm khách vô danh số lượng âm', platform:'Giao diện Web UI', testData:'Nhập số lượng = -5', steps:['1. Điền -5 vào ô vô danh.'], expected:['Form chặn không cho nhập số âm.'] },

  // M04 EXTENSIONS
  { id:'TC-CHKOUT-009', module:'M04', priority:'P1', name:'Check-out tinh gọn cho Khách đi bộ không giữ thẻ',
    platform: 'Giao diện Web UI',
    testData: 'Khách đi bộ một mình, không mượn thẻ, không có xe',
    steps:['1. Tại danh sách Đang trong đơn vị, nhấn nút "Check-out" trên dòng khách.',
           '2. Modal Check-out mở ra với lựa chọn người ra đã được chọn sẵn theo mặc định.',
           '3. Nhân viên nhấn nút "Xác nhận Check-out (1 người, 0 xe, 0 thẻ)" (hoặc nhấn phím Enter) để hoàn tất ngay.'],
    expected:['Check-out hoàn tất nhanh gọn chỉ với 2 thao tác click chuột, đảm bảo vừa đối chiếu chính xác vừa tối ưu tốc độ xuất bến cho nhân viên trạm gác.'] },
  { id:'TC-CHKOUT-010', module:'M04', priority:'P1', name:'Check-out bằng cách Quét Thẻ', platform:'Thiết bị & Cổng gác', testData:'Khách đang giữ thẻ TAG-001', steps:['1. Trạm gác đang ở màn hình chờ.','2. Khách đặt thẻ TAG-001 lên đầu đọc.'], expected:['Hệ thống tự động tìm lượt thăm của thẻ TAG-001, tự động Check-out và Thu hồi thẻ luôn.'] },
  { id:'TC-CHKOUT-011', module:'M04', priority:'P2', name:'Quét thẻ Check-out: Thẻ rác', platform:'Thiết bị & Cổng gác', testData:'Thẻ không có ai đang mượn', steps:['1. Quét thẻ rác lên đầu đọc.'], expected:['Hệ thống báo "Thẻ này không có người sử dụng hiện tại".'] },
  { id:'TC-CHKOUT-012', module:'M04', priority:'P2', name:'Báo mất thẻ nhưng Ghi chú trống', platform:'Giao diện Web UI', steps:['1. Nhấn nút Check-out.','2. Chọn trạng thái Mất thẻ nhưng để trống ô Ghi chú.','3. Nhấn nút "Xác nhận Check-out".'], expected:['Form báo lỗi "Bắt buộc nhập lý do làm mất thẻ".'] },
  { id:'TC-CHKOUT-013', module:'M04', priority:'P2', name:'Hoàn trả lại thẻ đã mất (Khách mang trả sau)', platform:'Giao diện Web UI', testData:'Khách làm mất thẻ, hôm sau mang đến trả', steps:['1. Vào tab Quản lý Thẻ (nếu có) hoặc Lịch sử.','2. Tìm lượt thăm cũ, chọn "Hoàn trả thẻ".'], expected:['Trạng thái thẻ từ Lost -> Available.'] },
  { id:'TC-CHKOUT-014', module:'M04', priority:'P3', name:'Check-out khách nhiều ngày (Đã qua nửa đêm)', platform:'Giao diện Web UI', testData:'Khách lưu trú 3 ngày', steps:['1. Ngày thứ 3, bấm Check-out khách này.'], expected:['Check-out thành công, thời gian lưu trú tính bằng tổng (ví dụ 72 tiếng).'] },
  { id:'TC-CHKOUT-015', module:'M04', priority:'P3', name:'Check-out: Trả dư thẻ đếm', platform:'Giao diện Web UI', testData:'Mượn 3 thẻ vô danh, nhập trả 5 thẻ', steps:['1. Bấm Check-out.','2. Trả số lượng thẻ = 5.'], expected:['Báo lỗi "Số thẻ trả không thể lớn hơn số thẻ đang mượn (3)".'] },
  { id:'TC-CHKOUT-016', module:'M04', priority:'P2', name:'Check-out: Đối chiếu hồ sơ xuất bến & Lưu thời gian ra',
    platform: 'Giao diện Web UI',
    testData: 'Lượt thăm có ảnh vào cổng',
    steps:['1. Mở modal "Phiếu xuất bến & Check-out" của lượt thăm.',
           '2. Đối chiếu khuôn mặt khách thực tế với ảnh chân dung lúc vào hiển thị trên phiếu.',
           '3. Nhấn nút "Xác nhận Check-out".'],
    expected:['Hệ thống ghi nhận chính xác thời gian xuất bến (CheckOutTime), thông tin nhân viên ca trực thực hiện check-out được lưu vào hồ sơ lượt thăm phục vụ tra cứu.'] },
  { id:'TC-CHKOUT-017', module:'M04', priority:'P3', name:'Check-out đoàn > 100 người', platform:'Giao diện Web UI', steps:['1. Check-out đoàn 100 người.'], expected:['Xử lý mượt mà, DB cập nhật status 100 dòng nhanh chóng.'] },
  { id:'TC-CHKOUT-018', module:'M04', priority:'P3', name:'Auto Check-out (Cronjob trigger manual)', platform:'API / Postman', steps:['1. Gọi API trigger auto check-out.'], expected:['Quét sạch khách không lưu trú qua đêm ra khỏi Inside.'] },

  // M05 EXTENSIONS
  { id:'TC-ADMIN-003', module:'M05', priority:'P2', name:'Quyền hạn: Nhân viên không thể vào trang Admin', platform:'Giao diện Web UI', testData:'Login bằng tài khoản bảo vệ', steps:['1. Gõ URL /admin'], expected:['Bị chặn lại, thông báo "Access Denied / Không có quyền".'] },
  { id:'TC-STAFF-006', module:'M05', priority:'P2', name:'Thêm nhân viên trùng Username', platform:'Giao diện Quản trị', testData:'Tạo user "admin"', steps:['1. Tạo nhân viên username "admin".'], expected:['Báo lỗi "Username đã tồn tại".'] },
  { id:'TC-STAFF-007', module:'M05', priority:'P3', name:'Đổi mật khẩu: Pass cũ sai', platform:'Giao diện Quản trị', steps:['1. Nhập pass cũ sai, pass mới đúng.'], expected:['Báo lỗi mật khẩu hiện tại không đúng.'] },
  { id:'TC-STAFF-008', module:'M05', priority:'P3', name:'Đổi mật khẩu: Pass mới quá ngắn', platform:'Giao diện Quản trị', testData:'Pass mới = "12"', steps:['1. Nhập pass mới 2 ký tự.'], expected:['Báo lỗi yêu cầu độ dài tối thiểu (nếu có cấu hình).'] },
  { id:'TC-STAFF-009', module:'M05', priority:'P2', name:'Import Excel Nhân sự: Định dạng sai (Chứa text ở cột số)', platform:'Giao diện Quản trị', steps:['1. Upload file Excel bị hỏng format.'], expected:['API trả về lỗi chi tiết dòng nào bị sai.'] },
  { id:'TC-STAFF-010', module:'M05', priority:'P3', name:'Xóa nhân viên ĐANG TRONG CA', platform:'Giao diện Quản trị', steps:['1. Tìm nhân viên đang làm việc, nhấn Xóa.'], expected:['Báo lỗi "Không thể xóa nhân viên đang trong ca trực".'] },
  { id:'TC-STAFF-011', module:'M05', priority:'P2', name:'Tạo Quản trị viên (LocalAdminUser) phân quyền SystemAdmin', platform:'Giao diện Quản trị', steps:['1. Vào Cài đặt > Quản lý Quản trị viên (Local Admin Users).','2. Thêm mới user, chọn Role = SystemAdmin, đặt mật khẩu.','3. Đăng nhập bằng user mới.'], expected:['User mới đăng nhập thành công và có toàn quyền quản trị hệ thống, backup dữ liệu và cấu hình thiết bị.'] },
  { id:'TC-STAFF-012', module:'M05', priority:'P3', name:'Upload Avatar nhân viên', platform:'Giao diện Quản trị', steps:['1. Chọn nhân viên, upload file ảnh avatar.'], expected:['Ảnh hiển thị trên Dashboard khi nhân viên này login.'] },
  { id:'TC-STAFF-013', module:'M05', priority:'P3', name:'Sắp xếp danh sách nhân sự', platform:'Giao diện Quản trị', steps:['1. Click vào tiêu đề cột "Tên".'], expected:['Bảng sort A-Z, Z-A đúng.'] },
  { id:'TC-STAFF-014', module:'M05', priority:'P3', name:'Phân trang (Pagination) Nhân sự', platform:'Giao diện Quản trị', steps:['1. Có 50 nhân viên. Chuyển sang trang 2.'], expected:['Hiển thị danh sách trang 2 chuẩn.'] },

  // M06 EXTENSIONS
  { id:'TC-RPT-007', module:'M06', priority:'P1', name:'Dashboard Admin: Biểu đồ theo ngày', platform:'Giao diện Quản trị', steps:['1. Xem biểu đồ lượng khách 7 ngày qua.'], expected:['Data render đúng, không bị NaN.'] },
  { id:'TC-RPT-008', module:'M06', priority:'P2', name:'Export Excel: Khi không có dữ liệu', platform:'Giao diện Quản trị', testData:'Chọn ngày lễ không có ai', steps:['1. Bấm Export.'], expected:['Tải về file Excel chỉ có Header, không lỗi server.'] },
  { id:'TC-RPT-009', module:'M06', priority:'P2', name:'Export Excel: File name chứa ngày tháng', platform:'Giao diện Quản trị', steps:['1. Bấm Export.'], expected:['File tên dạng: Report_Visits_20261010.xlsx'] },
  { id:'TC-RPT-010', module:'M06', priority:'P1', name:'Thống kê theo Công ty/Phòng ban', platform:'Giao diện Quản trị', steps:['1. Chọn tab Thống Kê Nâng Cao.'], expected:['Thống kê ra biểu đồ công ty nào có khách tới thăm nhiều nhất.'] },
  { id:'TC-RPT-011', module:'M06', priority:'P3', name:'Tìm kiếm Unicode (Dấu tiếng Việt)', platform:'Giao diện Quản trị', testData:'Gõ "Nguyễn"', steps:['1. Tìm kiếm chữ có dấu.'], expected:['Lọc ra "Nguyễn", "nguyễn" chính xác.'] },
  { id:'TC-RPT-012', module:'M06', priority:'P3', name:'Tìm kiếm Ký tự đặc biệt (SQL Injection)', platform:'Giao diện Quản trị', testData:'Gõ "%_%"', steps:['1. Tìm kiếm ký tự wildcard.'], expected:['Xử lý escape đúng, không văng lỗi DB.'] },
  { id:'TC-RPT-013', module:'M06', priority:'P2', name:'Xem chi tiết lượt thăm đã XÓA (Soft delete)', platform:'Giao diện Quản trị', steps:['1. Bật cờ "Xem các bản ghi đã xóa".','2. Click xem chi tiết.'], expected:['Vẫn xem được lịch sử.'] },
  { id:'TC-RPT-014', module:'M06', priority:'P3', name:'Xem hình ảnh đính kèm to ra (Zoom)', platform:'Giao diện Quản trị', steps:['1. Click vào ảnh trong chi tiết lượt thăm.'], expected:['Mở modal zoom ảnh to ra.'] },
  { id:'TC-RPT-015', module:'M06', priority:'P3', name:'In Phím tắt (Ctrl+P) trên bảng Lịch sử', platform:'Giao diện Quản trị', steps:['1. Nhấn Ctrl+P trình duyệt.'], expected:['Bản in CSS Ẩn bớt menu, chỉ in danh sách (nếu có hỗ trợ).'] },
  { id:'TC-RPT-016', module:'M06', priority:'P2', name:'Lịch sử Ca Trực (Shift Sessions)', platform:'Giao diện Quản trị', steps:['1. Vào Quản lý Ca Trực.'], expected:['Liệt kê đầy đủ bảo vệ nào trực từ mấy giờ, ảnh lúc vào, lúc ra.'] },

  // M07 EXTENSIONS
  { id:'TC-BCK-007', module:'M07', priority:'P1', name:'Restore từ file không hợp lệ', platform:'Giao diện Quản trị', testData:'Upload file txt giả danh .db', steps:['1. Bấm Restore.','2. Upload file txt.'], expected:['Hệ thống kiểm tra magic byte hoặc SQLite format, từ chối file, không làm hỏng DB thật.'] },
  { id:'TC-BCK-008', module:'M07', priority:'P2', name:'Auto Backup: Hết dung lượng ổ cứng', platform:'Hệ thống (Background)', testData:'Giả lập ổ cứng đầy', steps:['1. Chờ tới giờ backup.'], expected:['Ghi log lỗi "Out of space", hệ thống chính không bị sập.'] },
  { id:'TC-BCK-009', module:'M07', priority:'P2', name:'Cấu hình Retention Policy (Giữ file 30 ngày)', platform:'Giao diện Quản trị', steps:['1. Đặt cấu hình xóa backup cũ sau 30 ngày.'], expected:['Các file backup ngày 31 tự động bị xóa khỏi ổ cứng.'] },
  { id:'TC-BCK-010', module:'M07', priority:'P3', name:'Restore DB có version mới hơn/cũ hơn', platform:'Giao diện Quản trị', steps:['1. Restore file DB tạo từ phần mềm v1.0 vào phần mềm v2.0.'], expected:['Phần mềm tự động chạy Migration script để nâng cấp CSDL cũ lên chuẩn mới sau khi restore xong.'] },
  { id:'TC-BCK-011', module:'M07', priority:'P3', name:'Download Backup khi đang bị lock', platform:'Giao diện Quản trị', steps:['1. Bấm Download đúng lúc auto-backup đang ghi file.'], expected:['Chờ ghi xong rồi mới stream download, hoặc báo lỗi file đang bị khóa.'] },
  { id:'TC-BCK-012', module:'M07', priority:'P2', name:'Xem dung lượng file backup trên UI', platform:'Giao diện Quản trị', steps:['1. Vào danh sách backup.'], expected:['Hiển thị Size (VD: 5.2 MB) và thời gian tạo chính xác.'] },
  { id:'TC-BCK-013', module:'M07', priority:'P2', name:'Download toàn bộ ảnh đính kèm (Zip)', platform:'Giao diện Quản trị', steps:['1. Nhấn nút Tải toàn bộ Ảnh (nếu có hỗ trợ).'], expected:['Tải về file Zip chứa thư mục Uploads.'] },
  { id:'TC-BCK-014', module:'M07', priority:'P3', name:'Phục hồi qua mạng LAN chậm', platform:'Giao diện Quản trị', steps:['1. Upload file DB 100MB qua WiFi yếu.'], expected:['Upload thành công, có thanh tiến trình.'] },
  { id:'TC-BCK-015', module:'M07', priority:'P3', name:'Không có quyền Restore', platform:'Giao diện Quản trị', testData:'Login bằng staff mạo quyền', steps:['1. Gọi API POST /restore.'], expected:['403 Forbidden.'] },
  { id:'TC-BCK-016', module:'M07', priority:'P3', name:'Xóa tất cả backup cùng lúc', platform:'Giao diện Quản trị', steps:['1. Bấm nút Delete All (Nếu có).'], expected:['Cảnh báo nguy hiểm. Nếu xóa, DB hiện tại vẫn nguyên vẹn.'] },

  // M08 EXTENSIONS
  { id:'TC-DEV-004', module:'M08', priority:'P2', name:'Ngắt kết nối Đầu đọc thẻ giữa chừng', platform:'Thiết bị & Cổng gác', steps:['1. Đang mở form check-in.','2. Rút dây đầu đọc thẻ RFID.'], expected:['DeviceService báo lỗi Disconnected ở góc màn hình UI. Cắm lại tự nhận lại.'] },
  { id:'TC-DEV-005', module:'M08', priority:'P2', name:'Quét CCCD bằng app VNeID (QR Code)', platform:'Thiết bị & Cổng gác', testData:'Sử dụng máy quét 2D/QR Code quét VNeID', steps:['1. Quét mã QR VNeID thay vì thẻ chip cứng.'], expected:['Hệ thống phân giải mã QR và trích xuất đúng thông tin cá nhân. (Tùy tính năng có hỗ trợ không).'] },
  { id:'TC-DEV-006', module:'M08', priority:'P3', name:'Cấu hình IP Camera: Sai mật khẩu luồng RTSP', platform:'Giao diện Quản trị', steps:['1. Đổi profile, nhập sai pass camera.'], expected:['Khung hình camera trên trạm gác báo "RTSP Auth Failed" hoặc hiển thị màn hình đen.'] },
  { id:'TC-DEV-007', module:'M08', priority:'P2', name:'Điều khiển Barrier Mở tự động', platform:'Thiết bị & Cổng gác', steps:['1. Check-in thành công.','2. Bật cờ "Auto Open Barrier".'], expected:['Thiết bị rơ-le (Relay) kích hoạt mở cổng Barrier sau khi check-in thành công.'] },
  { id:'TC-DEV-008', module:'M08', priority:'P3', name:'Mở Barrier thủ công trên Web', platform:'Giao diện Web UI', steps:['1. Nhấn nút "Mở Barrier" trên Dashboard.'], expected:['Gửi lệnh Relay -> Cổng gác mở. Ghi log hành động thủ công.'] },
  { id:'TC-DEV-009', module:'M08', priority:'P3', name:'Đầu đọc thẻ chập chờn (Spam quét liên tục)', platform:'Thiết bị & Cổng gác', steps:['1. Giữ thẻ RFID liên tục trên đầu đọc.'], expected:['Driver có cơ chế Debounce (Antipassback), chỉ phát ra 1 event quét thẻ duy nhất mỗi 3 giây, không bị dội bom UI.'] },
  { id:'TC-DEV-010', module:'M08', priority:'P2', name:'Cấu hình thiết bị trạm con qua API', platform:'API / Postman', steps:['1. Gọi GET /api/admin/settings để xem.','2. PUT sửa cấu hình trạm.'], expected:['Lưu DB, Broadcast qua Websocket/SignalR để trạm tự restart dịch vụ thiết bị.'] },
  { id:'TC-DEV-011', module:'M08', priority:'P3', name:'Webcam USB 4K (Dung lượng ảnh lớn)', platform:'Thiết bị & Cổng gác', steps:['1. Gắn webcam 4K.','2. Mở ca.'], expected:['Hệ thống tự nén (compress/resize) xuống chuẩn 720p trước khi lưu DB để tiết kiệm dung lượng.'] },
  { id:'TC-DEV-012', module:'M08', priority:'P3', name:'Chụp ảnh ban đêm (Low light)', platform:'Thiết bị & Cổng gác', steps:['1. Che tối camera.','2. Mở ca.'], expected:['Chụp thành công, có cảnh báo "Ảnh tối" nếu có AI check, hoặc vẫn lưu bình thường.'] },
  { id:'TC-DEV-013', module:'M08', priority:'P3', name:'Không tìm thấy thiết bị RFID COM port', platform:'Thiết bị & Cổng gác', steps:['1. Cấu hình COM9 (Không tồn tại).','2. Khởi động app.'], expected:['Báo lỗi cấu hình thiết bị "Port COM9 not found".'] },

  // M09 EXTENSIONS
  { id:'TC-NET-004', module:'M09', priority:'P1', name:'Chứng chỉ SSL: Hết hạn (Tự động gia hạn)', platform:'Control Panel', steps:['1. Đổi lịch máy tính tới ngày chứng chỉ tự cấp (Self-signed) hết hạn.'], expected:['Script FixDomain.bat / Create-LocalSSL.ps1 tự động chạy lại (hoặc yêu cầu admin click) để cấp mới.'] },
  { id:'TC-NET-005', module:'M09', priority:'P2', name:'Xung đột cổng (Port Conflict) 80/443', platform:'Control Panel', testData:'Bật Skype/XAMPP chiếm port 443', steps:['1. Bật XAMPP.','2. Bật SmartVMS.'], expected:['SmartVMS Control Panel hiện cảnh báo đỏ: "Cổng 443 đang bị chiếm dụng bởi phần mềm khác".'] },
  { id:'TC-NET-006', module:'M09', priority:'P2', name:'Cập nhật Domain: Tên miền chứa ký tự cấm', platform:'Control Panel', testData:'Domain: "my_smartvms*.*"', steps:['1. Dùng SystemAdmin đổi domain sai.'], expected:['Báo lỗi Regex tên miền không hợp lệ.'] },
  { id:'TC-NET-007', module:'M09', priority:'P2', name:'Hiển thị Settings: Reset về mặc định', platform:'Giao diện Web UI', steps:['1. Thay đổi bung bét các cột trong bảng Dashboard.','2. Nhấn "Khôi phục mặc định".'], expected:['Bảng quay về trạng thái chuẩn như lúc cài đặt.'] },
  { id:'TC-NET-008', module:'M09', priority:'P3', name:'Thiết lập Chế độ Dark Mode (Nếu có)', platform:'Giao diện Web UI', steps:['1. Bật công tắc Nền Tối.'], expected:['Giao diện chuyển màu tối, dễ nhìn ban đêm.'] },
  { id:'TC-NET-009', module:'M09', priority:'P3', name:'Clear Local Storage (Xóa Cache Trình Duyệt)', platform:'Giao diện Web UI', steps:['1. Mở F12 -> Xóa LocalStorage.','2. F5.'], expected:['Bị văng ra màn hình đăng nhập (Mất Token). Các settings hiển thị bị reset.'] },
  { id:'TC-NET-010', module:'M09', priority:'P3', name:'Truy cập qua IP LAN từ thiết bị di động (Tablet/Phone)', platform:'Giao diện Web UI', steps:['1. Dùng iPad kết nối cùng Wifi, gõ địa chỉ https://IP_MAY_CHU/'], expected:['Vào được giao diện trạm gác, có cảnh báo chứng chỉ (Bấm Continue). UI Responsive tương thích màn hình chạm.'] },
  { id:'TC-NET-011', module:'M09', priority:'P3', name:'Cấu hình Logo công ty/Tiêu đề Web', platform:'Giao diện Quản trị', steps:['1. Upload logo mới, nhập Tên nhà máy.','2. F5.'], expected:['Giao diện trạm gác thay đổi theo Logo của nhà máy khách hàng.'] },

  // M10 EXTENSIONS
  { id:'TC-STB-006', module:'M10', priority:'P1', name:'DB Lock: SQLite database is locked', platform:'Phi chức năng', testData:'Giả lập truy vấn chậm 10 giây khóa bảng', steps:['1. Viết script lock DB.','2. Cùng lúc thực hiện Check-in.'], expected:['Entity Framework Core có cơ chế RetryOnFailure, chờ DB mở khóa rồi lưu, không ném exception văng app.'] },
  { id:'TC-STB-007', module:'M10', priority:'P2', name:'Memory Leak: Để Web chạy liên tục 7 ngày', platform:'Phi chức năng', steps:['1. Bật máy trạm 7 ngày liên tiếp không tắt tab.'], expected:['RAM của trình duyệt không tăng vọt quá 1GB. Mượt mà.'] },
  { id:'TC-STB-008', module:'M10', priority:'P2', name:'Ổ cứng máy tính Full 100%', platform:'Phi chức năng', steps:['1. Chép file đầy ổ C.','2. Bấm Check-in.'], expected:['Hệ thống C# catch IOException "Disk full", báo lỗi rõ ràng lên UI "Không đủ dung lượng ổ đĩa", không crash ngầm.'] },
  { id:'TC-STB-009', module:'M10', priority:'P3', name:'Đồng hồ máy tính chạy sai', platform:'Môi trường Windows', testData:'Đổi lùi lại 5 năm (Năm 2021)', steps:['1. Đổi năm.','2. Check-in.'], expected:['Check-in thành công với ngày bị sai, NHƯNG HTTPS SSL có thể bị trình duyệt chặn "Chứng chỉ chưa có hiệu lực".'] },
  { id:'TC-STB-010', module:'M10', priority:'P2', name:'Tắt đột ngột C# API Service trong Task Manager', platform:'Môi trường Windows', steps:['1. End Task "SmartVMS.Local.Api.exe".','2. Trên Web, bấm Check-in.'], expected:['Giao diện Web quay Loading 1 lúc rồi báo "Lỗi kết nối máy chủ / Server Offline".'] },
  { id:'TC-STB-011', module:'M10', priority:'P1', name:'Nhấn nút Back (Trở lại) trên trình duyệt khi đang xử lý POST', platform:'Giao diện Web UI', steps:['1. Bấm Check-in.','2. Đang có Loading, lập tức bấm Back trên Browser.'], expected:['Request đã đẩy đi thì DB vẫn lưu thành công ở Background. UI không bị hỏng state.'] },
  { id:'TC-STB-012', module:'M10', priority:'P2', name:'Bật nhiều Tab Web Admin cùng lúc', platform:'Giao diện Quản trị', steps:['1. Mở 10 tab Admin, đồng loạt F5.'], expected:['DB xử lý tốt các truy vấn READ concurrent, không bị thắt cổ chai.'] },
  { id:'TC-STB-013', module:'M10', priority:'P3', name:'Lấy Log Lỗi (Error Logging)', platform:'Control Panel', steps:['1. Vào thư mục Logs của ứng dụng C#.'], expected:['Mỗi ngày sinh ra 1 file txt log (VD: log-20261010.txt) chứa chi tiết các StackTrace lỗi nếu có.'] },

  // ==========================================
  // [BỔ SUNG SMARTVMS LOCAL v2.0]: 10 TEST CASES MỚI
  // ==========================================
  { id:'TC-AUTH-021', module:'M01', priority:'P1', name:'Tính năng Ép Bắt Đầu Ca Mới (Force Login khi treo ca trạm cũ)',
    platform: 'Giao diện Web UI',
    testData: 'Tài khoản nhân viên đang có ca Active ở trạm khác hoặc máy bị mất điện',
    steps:['1. Nhập username bảo vệ. Bấm Đăng nhập.','2. Hệ thống cảnh báo ALREADY_ACTIVE và xuất hiện nút "Ép Bắt Đầu Ca Mới".','3. Nhấn "Ép Bắt Đầu Ca Mới".'],
    expected:['Hệ thống gọi API /station/auth/login với cờ ForceLogin=true. Mở thành công popup chụp ảnh mở ca. Ca trực cũ được chuyển sang kết thúc an toàn.'] },
  { id:'TC-CARD-001', module:'M02', priority:'P1', name:'Check-in phát Thẻ định danh cho nhóm ẩn danh (AnonymousIdentityCards)',
    platform: 'Thiết bị & Cổng gác',
    testData: 'Đoàn công nhân 5 người vô danh, phát 5 thẻ an ninh định danh',
    steps:['1. Trong modal Check-in, nhập thông tin Trưởng đoàn.','2. Nhập số khách đi cùng vô danh = 5.','3. Quét lần lượt 5 mã thẻ định danh vào danh sách thẻ nhóm vô danh.','4. Nhấn nút "Hoàn thành Check-In (6 khách, 5 thẻ)".'],
    expected:['Check-in thành công. Hệ thống lưu mảng AnonymousIdentityCardNumbers dạng JSON, hiển thị đầy đủ 5 thẻ trên chi tiết lượt thăm.'] },
  { id:'TC-SUPP-001', module:'M03', priority:'P1', name:'Bổ sung Người và Phương tiện cho đoàn Inside (Trạm gác)',
    platform: 'Giao diện Web UI',
    testData: 'Lượt thăm đang ở trạng thái Inside',
    steps:['1. Tại bảng "Danh sách lượt khách ra vào đơn vị" (tab Đang trong đơn vị), nhấn nút "Thêm" (icon Plus) trên dòng khách.',
           '2. Modal Bổ sung mở ra, điền thông tin người đi cùng có CCCD và nhập thêm biển số xe ô tô.',
           '3. Nhấn nút "Lưu thông tin bổ sung".'],
    expected:['Hệ thống gọi API /station/visits/supplemental lưu thành công, số lượng người và xe của lượt thăm được cập nhật tức thì.'] },
  { id:'TC-CARD-002', module:'M04', priority:'P1', name:'Check-out thu hồi từng thẻ định danh của nhóm ẩn danh',
    platform: 'Giao diện Web UI',
    testData: 'Khách nhóm vô danh đang cầm 5 thẻ định danh',
    steps:['1. Mở popup Check-out của khách.','2. Tích chọn thu hồi 3 trong số 5 thẻ định danh. 2 thẻ còn lại chọn Nợ/Mất thẻ.','3. Nhấn Xác nhận Check-out.'],
    expected:['Hệ thống ghi nhận ReturnedAnonymousIdentities chính xác 3 mã thẻ đã trả, các thẻ còn lại ghi nợ/mất đúng cấu hình.'] },
  { id:'TC-SUPP-002', module:'M05', priority:'P1', name:'Admin bổ sung người và xe cho lượt thăm Inside (Admin Supplemental)',
    platform: 'Giao diện Quản trị',
    testData: 'Lượt thăm đang ở trạng thái Inside',
    steps:['1. Vào tab Đang Ở Trong trên giao diện Admin.','2. Nhấn nút Bổ sung (Supplemental).','3. Điền thêm thành viên và phương tiện, nhấn Xác nhận.'],
    expected:['Gọi API /admin/visits/{id}/supplemental thành công. Dữ liệu lượt thăm được cập nhật tức thì trên cả trang Admin và trạm gác.'] },
  { id:'TC-MAN-001', module:'M05', priority:'P1', name:'Nhập liệu thủ công (Manual Entry) lượt thăm trong quá khứ',
    platform: 'Giao diện Quản trị',
    testData: 'Khách VIP đã vào sáng nay nhưng bảo vệ quên không check-in',
    steps:['1. Vào tab Nhập Thủ Công (Manual Entry) trên trang Admin.','2. Nhập thông tin Khách, chọn ngày giờ vào trong quá khứ (Backdate).','3. Chọn Trạm tiếp đón và Nhân viên trực. Nhấn Lưu.'],
    expected:['Gọi API /admin/visits/manual thành công. Tạo mới lượt thăm với CreatedByType = ManualAdmin, lưu thông tin CreatedByAdminId chính xác.'] },
  { id:'TC-MAN-002', module:'M05', priority:'P1', name:'Nhập thủ công lượt thăm có nhiều Người đi cùng và Phương tiện',
    platform: 'Giao diện Quản trị',
    steps:['1. Tại form Nhập Thủ Công, thêm 2 người đi cùng và 1 xe ô tô.','2. Điền giờ vào và giờ ra nếu khách đã ra về.','3. Nhấn Lưu lượt thăm.'],
    expected:['Lưu thành công. Tất cả người đi cùng và phương tiện đều có giờ vào/giờ ra khớp với thời gian khai báo thủ công.'] },
  { id:'TC-MAN-003', module:'M05', priority:'P2', name:'Tự động tạo Ca trực ảo (Virtual Shift Session) khi nhập thủ công',
    platform: 'API / Backend',
    steps:['1. Admin nhập thủ công lượt thăm vào khung giờ không có ca trực nào đang mở.'],
    expected:['Hệ thống C# tự động khởi tạo 1 ShiftSession ảo (Virtual Session) khép kín với Status = Ended để đảm bảo toàn vẹn khóa ngoại CSDL.'] },
  { id:'TC-ROLE-001', module:'M05', priority:'P1', name:'Phân quyền Quản trị: Tài khoản DataEntry bị giới hạn quyền',
    platform: 'Giao diện Quản trị',
    testData: 'Tài khoản dataentry / data123 (Role = DataEntry)',
    steps:['1. Đăng nhập bằng tài khoản dataentry.','2. Kiểm tra các menu và nút chức năng.'],
    expected:['Đăng nhập thành công. Tài khoản chỉ được xem và nhập liệu. Không được truy cập tab Cài đặt tài khoản, cấu hình hệ thống và Backup.'] },
  { id:'TC-ROLE-002', module:'M05', priority:'P1', name:'Chặn quyền Backup & Restore đối với tài khoản vai trò DataEntry',
    platform: 'API / Postman',
    testData: 'Sử dụng token của tài khoản dataentry',
    steps:['1. Cố tình gọi API POST /admin/backup hoặc POST /admin/restore.'],
    expected:['Hệ thống phản hồi 403 Forbidden hoặc từ chối thực thi: chỉ tài khoản SystemAdmin mới có quyền sao lưu phục hồi dữ liệu.'] }
];

// ================================================================
// USERS (Hardcoded for Client-side Auth)
// ================================================================
const USERS = [
  { username: 'admin', password: '123', role: 'admin', name: 'Quản trị viên' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Quản trị viên' },
  { username: 'tester', password: '123', role: 'tester', name: 'Tester thường' }
];

// ================================================================
// STATE
// ================================================================
let state = {
  modules: [],       // Configurable modules: [ { id, name, short } ]
  customTcs: [],     // User-added test cases: [ { id, module, priority, name, precondition, steps, expected, notes, isCustom: true, createdAt } ]
  overrides: {},     // Hiệu đính Test Cases chuẩn: { [tcId]: { name, priority, platform, testData, precondition, steps, expected, notes, updatedAt } }
  results: {},       // { tcId: { status, tester, runAt, note, failReason } }
  session: null,     // { name, owner, version, notes, createdAt }
  filters: { module: '', priority: '', status: '', type: '', search: '' },
  execFilters: { module: '', status: '', search: '' },
  selectedTcId: null,
  charts: {},
  currentUser: null
};

// ================================================================
// LOCALSTORAGE
// ================================================================
const STORAGE_KEY = 'smartvms_test_manager_v1';

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    results: state.results,
    session: state.session,
    customTcs: state.customTcs || [],
    modules: state.modules || [],
    overrides: state.overrides || {},
    currentUser: state.currentUser
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      state.results = s.results || {};
      state.session = s.session || null;
      state.customTcs = Array.isArray(s.customTcs) ? s.customTcs : [];
      state.overrides = (s.overrides && typeof s.overrides === 'object') ? s.overrides : {};
      // Tự động đồng bộ chuẩn hóa danh mục 10 Module nếu phát hiện cache cũ bị lỗi
      const isOutdated = !Array.isArray(s.modules) || s.modules.length === 0 ||
        s.modules.some(m => m.id === 'M11') ||
        !s.modules.some(m => m.id === 'M10') ||
        s.modules.some(m => m.id === 'M06' && m.name.includes('Backup'));
      state.modules = isOutdated ? JSON.parse(JSON.stringify(DEFAULT_MODULES)) : s.modules;
      state.currentUser = s.currentUser || null;
    } else {
      state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
    }
  } catch(e) {
    console.error('Load state error', e);
    state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  }
}

// ================================================================
// AUTHENTICATION LOGIC
// ================================================================
function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();
  
  const user = USERS.find(x => x.username === u && x.password === p);
  if (!user) {
    alert('Sai tên đăng nhập hoặc mật khẩu!');
    return;
  }
  
  state.currentUser = { username: user.username, role: user.role, name: user.name };
  saveState();
  applyAuth();
}

function handleLogout() {
  state.currentUser = null;
  saveState();
  applyAuth();
}

function applyAuth() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app');
  
  if (!state.currentUser) {
    loginScreen.style.display = 'flex';
    appContainer.style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
  } else {
    loginScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    
    // Set user info
    document.getElementById('current-user-name').textContent = state.currentUser.name;
    const roleEl = document.getElementById('current-user-role');
    if (state.currentUser.role === 'admin') {
      roleEl.textContent = 'Admin';
      roleEl.style.background = 'rgba(239, 68, 68, 0.1)';
      roleEl.style.color = '#ef4444';
      roleEl.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      document.body.classList.remove('role-tester');
    } else {
      roleEl.textContent = 'Tester';
      roleEl.style.background = 'rgba(59, 130, 246, 0.1)';
      roleEl.style.color = '#3b82f6';
      roleEl.style.borderColor = 'rgba(59, 130, 246, 0.2)';
      document.body.classList.add('role-tester');
    }
    
    // Redirect if they are a tester trying to access settings
    const activePage = document.querySelector('.page.active');
    if (state.currentUser.role === 'tester' && activePage && activePage.id === 'page-settings') {
      navigate('dashboard');
    }
  }
}

// ================================================================
// DATA ACCESS HELPERS
// ================================================================
function getAllTcs() {
  const overrides = state.overrides || {};
  const builtins = ALL_TCS.map(tc => {
    if (overrides[tc.id]) {
      return { ...tc, ...overrides[tc.id], isOverridden: true };
    }
    return tc;
  });
  return [...builtins, ...(state.customTcs || [])];
}

function isCustomTc(id) {
  return (state.customTcs || []).some(t => t.id === id);
}

function isOverriddenTc(id) {
  return Boolean(state.overrides && state.overrides[id]);
}

function resetBuiltinTc(tcId) {
  if (!state.overrides || !state.overrides[tcId]) return;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn khôi phục nội dung Test Case "${tcId}" về nguyên bản chuẩn ban đầu của hệ thống?`)) return;
  delete state.overrides[tcId];
  saveState();
  showToast(`🔄 Đã khôi phục Test Case ${tcId} về nội dung chuẩn gốc ban đầu`, 'info');
  applyFilters();
  if (document.getElementById('page-execute').classList.contains('active')) {
    renderExecutePage();
  }
}

// ================================================================
// NAVIGATION
// ================================================================
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  const titles = { dashboard:'Dashboard', testcases:'Test Cases', execute:'Thực thi Test', report:'Báo cáo', settings:'Cài đặt' };
  document.getElementById('breadcrumb').textContent = titles[page] || page;
  if (page === 'dashboard') renderDashboard();
  else if (page === 'testcases') renderTestCases();
  else if (page === 'execute') renderExecutePage();
  else if (page === 'report') renderReport();
  else if (page === 'settings') renderSettings();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ================================================================
// COMPUTED STATS
// ================================================================
function getStats() {
  const all = getAllTcs();
  const total = all.length;
  let pass = 0, fail = 0, skip = 0, wip = 0;
  all.forEach(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    if (s === 'Pass') pass++;
    else if (s === 'Fail') fail++;
    else if (s === 'Skip') skip++;
    else if (s === 'In Progress') wip++;
  });
  const pending = total - pass - fail - skip - wip;
  const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
  const runCount = pass + fail + skip;
  const completeRate = total > 0 ? Math.round((runCount / total) * 100) : 0;
  return { total, pass, fail, skip, wip, pending, passRate, completeRate };
}

function getModuleStats() {
  const all = getAllTcs();
  return getModules().map(mod => {
    const tcs = all.filter(tc => tc.module === mod.id);
    let pass = 0, fail = 0, skip = 0, wip = 0;
    tcs.forEach(tc => {
      const r = state.results[tc.id];
      const s = r ? r.status : 'Not Run';
      if (s === 'Pass') pass++;
      else if (s === 'Fail') fail++;
      else if (s === 'Skip') skip++;
      else if (s === 'In Progress') wip++;
    });
    const total = tcs.length;
    const pending = total - pass - fail - skip - wip;
    const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { ...mod, total, pass, fail, skip, wip, pending, passRate };
  });
}

function populateModuleSelects() {
  const mods = getModules();

  // 1. Filter in Test Cases: #filter-module
  const filterMod = document.getElementById('filter-module');
  if (filterMod) {
    const currentVal = filterMod.value;
    filterMod.innerHTML = '<option value="">Tất cả modules</option>' +
      mods.map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (mods.some(m => m.id === currentVal)) filterMod.value = currentVal;
    else filterMod.value = '';
  }

  // 2. Filter in Execute Page: #exec-filter-module
  const execMod = document.getElementById('exec-filter-module');
  if (execMod) {
    const currentVal = execMod.value;
    execMod.innerHTML = '<option value="">Tất cả modules</option>' +
      mods.map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (mods.some(m => m.id === currentVal)) execMod.value = currentVal;
    else execMod.value = '';
  }

  // 3. Select in Add/Edit TC Modal: #tc-form-module
  const formMod = document.getElementById('tc-form-module');
  if (formMod) {
    const currentVal = formMod.value;
    formMod.innerHTML = mods.map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (mods.some(m => m.id === currentVal)) formMod.value = currentVal;
    else if (mods.length > 0) formMod.value = mods[0].id;
  }
}

// ================================================================
// STATUS / PRIORITY HELPERS
// ================================================================
function statusBadge(status) {
  const map = { 'Pass':'✅ Pass', 'Fail':'❌ Fail', 'Skip':'⏭ Skip', 'Not Run':'⏳ Chưa chạy', 'In Progress':'🔄 Đang chạy' };
  const cls = (status || 'Not Run').replace(' ', '-');
  return `<span class="status-badge status-${cls}">${map[status || 'Not Run'] || status}</span>`;
}

function priorityBadge(p) {
  const map = { P1:'🔴 P1', P2:'🟠 P2', P3:'🟡 P3', P4:'🟢 P4' };
  return `<span class="priority-badge priority-${p}">${map[p] || p}</span>`;
}

function getModuleName(id) {
  return getModules().find(m => m.id === id)?.name || id;
}
function getModuleShort(id) {
  return getModules().find(m => m.id === id)?.short || id;
}

// ================================================================
// DASHBOARD
// ================================================================
function renderDashboard() {
  const s = getStats();
  document.getElementById('stat-total').textContent = s.total;
  document.getElementById('stat-pass').textContent = s.pass;
  document.getElementById('stat-fail').textContent = s.fail;
  document.getElementById('stat-skip').textContent = s.skip;
  document.getElementById('stat-pending').textContent = s.pending + s.wip;
  document.getElementById('stat-progress').textContent = s.passRate + '%';
  document.getElementById('badge-total').textContent = s.total;
  document.getElementById('main-progress-bar').style.width = s.completeRate + '%';
  document.getElementById('overall-pct').textContent = s.completeRate + '% hoàn thành';

  // Module Summary Table
  const mStats = getModuleStats();
  const tbody = document.getElementById('module-summary-body');
  tbody.innerHTML = mStats.map(m => `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td><strong>${m.total}</strong></td>
      <td style="color:#4ade80">${m.pass}</td>
      <td style="color:#f87171">${m.fail}</td>
      <td style="color:#fbbf24">${m.skip}</td>
      <td style="color:#64748b">${m.pending}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="mini-progress" style="flex:1">
            <div class="mini-progress-bar" style="width:${m.passRate}%"></div>
          </div>
          <span style="font-size:11px;color:var(--text-secondary);white-space:nowrap">${m.passRate}%</span>
        </div>
      </td>
    </tr>`).join('');

  // Recent executions
  // Recent executions
  const recentEl = document.getElementById('recent-executions');
  const recent = Object.entries(state.results)
    .filter(([,r]) => r.runAt)
    .sort((a,b) => new Date(b[1].runAt) - new Date(a[1].runAt))
    .slice(0, 8);
  if (recent.length === 0) {
    recentEl.innerHTML = '<div class="empty-state">Chưa có kết quả test nào. Hãy bắt đầu thực thi test!</div>';
  } else {
    recentEl.innerHTML = recent.map(([id, r]) => {
      const tc = getAllTcs().find(t => t.id === id);
      return `<div class="recent-item">
        ${statusBadge(r.status)}
        <div class="recent-meta">
          <div class="recent-name"><span style="color:var(--accent-light);font-family:monospace">${id}</span> — ${tc?.name || ''}</div>
          <div class="recent-time">${r.tester ? 'Người test: ' + r.tester + ' · ' : ''}${r.runAt ? new Date(r.runAt).toLocaleString('vi-VN') : ''}</div>
        </div>
        <span class="module-tag">${getModuleShort(tc?.module)}</span>
      </div>`;
    }).join('');
  }

  // Charts
  renderModuleChart(mStats);
  renderPriorityChart(s);
}

function getThemeChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    legendColor: isDark ? '#94a3b8' : '#475569',
    tickColor: isDark ? '#64748b' : '#64748b',
    gridColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    pieBorderColor: isDark ? '#1a1f2e' : '#ffffff',
  };
}

function renderModuleChart(mStats) {
  const ctx = document.getElementById('chartModule').getContext('2d');
  if (state.charts.module) state.charts.module.destroy();
  const tc = getThemeChartColors();
  state.charts.module = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mStats.map(m => m.short),
      datasets: [
        { label:'Pass', data: mStats.map(m => m.pass), backgroundColor: 'rgba(34,197,94,0.85)', borderRadius: 4 },
        { label:'Fail', data: mStats.map(m => m.fail), backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 4 },
        { label:'Skip', data: mStats.map(m => m.skip), backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 4 },
        { label:'Chưa chạy', data: mStats.map(m => m.pending), backgroundColor: 'rgba(148,163,184,0.35)', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc.legendColor, font: { family:'Inter', size:11 } } } },
      scales: {
        x: { stacked: true, grid: { color: tc.gridColor }, ticks: { color: tc.tickColor, font:{size:10} } },
        y: { stacked: true, grid: { color: tc.gridColor }, ticks: { color: tc.tickColor } }
      }
    }
  });
}

function renderPriorityChart(s) {
  const ctx = document.getElementById('chartPriority').getContext('2d');
  if (state.charts.priority) state.charts.priority.destroy();
  const all = getAllTcs();
  const p1 = all.filter(t=>t.priority==='P1');
  const p2 = all.filter(t=>t.priority==='P2');
  const p3 = all.filter(t=>t.priority==='P3');
  const pData = [p1,p2,p3].map(arr => {
    let pass=0,fail=0,notrun=0;
    arr.forEach(tc=>{ const r=state.results[tc.id]; const st=r?.status||'Not Run'; if(st==='Pass')pass++;else if(st==='Fail')fail++;else notrun++; });
    return {pass,fail,notrun};
  });
  const tc = getThemeChartColors();
  state.charts.priority = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['🔴 P1 (Critical)','🟠 P2 (Important)','🟡 P3 (Medium)'],
      datasets: [
        { label:'Pass', data: pData.map(d=>d.pass), backgroundColor:'rgba(34,197,94,0.85)', borderRadius:4 },
        { label:'Fail', data: pData.map(d=>d.fail), backgroundColor:'rgba(239,68,68,0.85)', borderRadius:4 },
        { label:'Chưa chạy', data: pData.map(d=>d.notrun), backgroundColor:'rgba(148,163,184,0.35)', borderRadius:4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc.legendColor, font:{family:'Inter',size:11} } } },
      scales: {
        x: { stacked:true, grid:{color: tc.gridColor}, ticks:{color: tc.tickColor, font:{size:11}} },
        y: { stacked:true, grid:{color: tc.gridColor}, ticks:{color: tc.tickColor} }
      }
    }
  });
}

// ================================================================
// TEST CASES PAGE
// ================================================================
function renderTestCases() {
  const modSelect = document.getElementById('filter-module');
  if (modSelect && modSelect.options.length <= 1) {
    populateModuleSelects();
  }
  applyFilters();
}

function applyFilters() {
  const mod = document.getElementById('filter-module').value;
  const pri = document.getElementById('filter-priority').value;
  const sts = document.getElementById('filter-status').value;
  const type = document.getElementById('filter-type')?.value || '';
  const srch = (document.getElementById('filter-search').value || '').toLowerCase().trim();
  state.filters = { module: mod, priority: pri, status: sts, type: type, search: srch };
  const all = getAllTcs();
  const filtered = all.filter(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    const isCustom = isCustomTc(tc.id);
    if (mod && tc.module !== mod) return false;
    if (pri && tc.priority !== pri) return false;
    if (sts && s !== sts) return false;
    if (type === 'builtin' && isCustom) return false;
    if (type === 'custom' && !isCustom) return false;
    if (srch && !tc.id.toLowerCase().includes(srch) && !tc.name.toLowerCase().includes(srch) && !(tc.precondition||'').toLowerCase().includes(srch)) return false;
    return true;
  });
  const customCount = (state.customTcs || []).length;
  document.getElementById('tc-count').innerHTML = `Hiển thị <strong>${filtered.length}</strong> / <strong>${all.length}</strong> test cases <span style="color:var(--text-muted);font-size:12px;margin-left:8px">(Gốc: ${ALL_TCS.length} · Tùy chỉnh: ${customCount})</span>`;
  const sub = document.getElementById('tc-page-subtitle');
  if (sub) sub.textContent = `Quản lý toàn bộ ${all.length} test cases (${ALL_TCS.length} chuẩn mực + ${customCount} tùy chỉnh)`;
  const tbody = document.getElementById('tc-table-body');
  tbody.innerHTML = filtered.map(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    const isCustom = isCustomTc(tc.id);
    const isOverridden = isOverriddenTc(tc.id);
    let typeBadge = '';
    if (isCustom) {
      typeBadge = `<span class="badge-custom">✨ Tùy chỉnh</span>`;
    } else if (isOverridden) {
      typeBadge = `<span class="badge-custom" style="background:rgba(245, 158, 11, 0.15);color:#d97706;border:1px solid rgba(245, 158, 11, 0.3)" title="Đã hiệu đính so với bản chuẩn gốc">✏️ Đã hiệu đính</span>`;
    } else {
      typeBadge = `<span class="badge-builtin">📦 Chuẩn gốc</span>`;
    }

    const actions = isCustom ? `
      <div class="action-btn-group">
        <button class="action-btn" onclick="openTcDetail('${tc.id}')" title="Xem chi tiết">🔍</button>
        <button class="action-btn run" onclick="quickNavigateExec('${tc.id}')" title="Thực thi test">▶</button>
        <button class="action-btn edit" onclick="openEditTcModal('${tc.id}')" title="Chỉnh sửa">✏️</button>
        <button class="action-btn clone" onclick="openCloneTcModal('${tc.id}')" title="Nhân bản">📋</button>
        <button class="action-btn delete" onclick="deleteCustomTc('${tc.id}')" title="Xóa">🗑️</button>
      </div>` : `
      <div class="action-btn-group">
        <button class="action-btn" onclick="openTcDetail('${tc.id}')" title="Xem chi tiết">🔍</button>
        <button class="action-btn run" onclick="quickNavigateExec('${tc.id}')" title="Thực thi test">▶</button>
        <button class="action-btn edit" onclick="openEditTcModal('${tc.id}')" title="Hiệu đính nội dung Test Case này">✏️</button>
        ${isOverridden ? `<button class="action-btn reset" onclick="resetBuiltinTc('${tc.id}')" title="Khôi phục nguyên bản gốc" style="color:#d97706">🔄</button>` : ''}
        <button class="action-btn clone" onclick="openCloneTcModal('${tc.id}')" title="Nhân bản test case này">📋</button>
      </div>`;
    return `<tr>
      <td class="tc-code">${tc.id}</td>
      <td>${priorityBadge(tc.priority)}</td>
      <td><span class="module-tag">${getModuleShort(tc.module)}</span></td>
      <td class="tc-name">${tc.name}</td>
      <td>${typeBadge}</td>
      <td>${statusBadge(s)}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${r?.tester || '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r?.runAt ? new Date(r.runAt).toLocaleDateString('vi-VN') : '—'}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

function resetFilters() {
  document.getElementById('filter-module').value = '';
  document.getElementById('filter-priority').value = '';
  document.getElementById('filter-status').value = '';
  if (document.getElementById('filter-type')) document.getElementById('filter-type').value = '';
  document.getElementById('filter-search').value = '';
  applyFilters();
}

function quickNavigateExec(tcId) {
  state.selectedTcId = tcId;
  navigate('execute');
  setTimeout(() => selectExecTc(tcId), 100);
}

// ================================================================
// TC DETAIL MODAL
// ================================================================
function openTcDetail(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const r = state.results[tcId];
  const isCustom = isCustomTc(tcId);
  document.getElementById('modal-tc-title').textContent = tc.id + ' — ' + tc.name;
  document.getElementById('modal-tc-body').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
      ${priorityBadge(tc.priority)}
      <span class="module-tag">${getModuleName(tc.module)}</span>
      ${isCustom ? '<span class="badge-custom">✨ Tùy chỉnh</span>' : '<span class="badge-builtin">📦 Bộ chuẩn gốc</span>'}
      ${statusBadge(r?.status || 'Not Run')}
      ${tc.platform ? `<span style="font-size:12px;color:#4338ca;font-weight:600;padding:4px 8px;background:#e0e7ff;border-radius:4px">💻 ${tc.platform}</span>` : ''}
    </div>
    ${tc.testData ? `<div class="modal-section" style="background:#f1f5f9;padding:12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:16px">
      <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px">Dữ liệu đầu vào (Test Data)</div>
      <div style="font-family:monospace;font-size:13px;color:#0f172a;white-space:pre-wrap;word-break:break-word">${tc.testData}</div>
    </div>` : ''}
    ${tc.precondition ? `<div class="modal-section">
      <div class="modal-section-title">⚙️ Điều kiện tiên quyết</div>
      <div class="modal-section-content">${tc.precondition}</div>
    </div>` : ''}
    ${tc.steps ? `<div class="modal-section">
      <div class="modal-section-title">📝 Các bước thực hiện</div>
      <div class="modal-section-content"><ul>${tc.steps.map(s=>`<li>${s}</li>`).join('')}</ul></div>
    </div>` : ''}
    <div class="modal-section">
      <div class="modal-section-title">✅ Kết quả mong đợi</div>
      <div class="modal-section-content"><ul>${(tc.expected||[]).map(e=>`<li>${e}</li>`).join('')}</ul></div>
    </div>
    ${tc.notes ? `<div class="modal-section">
      <div class="modal-section-title">📌 Ghi chú</div>
      <div class="modal-section-content">${tc.notes}</div>
    </div>` : ''}
    ${r ? `<div class="modal-section" style="border:1px solid var(--border);border-radius:8px;padding:12px">
      <div class="modal-section-title">📊 Kết quả thực thi</div>
      <div style="font-size:13px;display:grid;gap:6px">
        <div><strong>Trạng thái:</strong> ${statusBadge(r.status)}</div>
        ${r.tester ? `<div><strong>Người test:</strong> ${r.tester}</div>` : ''}
        ${r.runAt ? `<div><strong>Ngày chạy:</strong> ${new Date(r.runAt).toLocaleString('vi-VN')}</div>` : ''}
        ${r.failReason ? `<div><strong>Lý do lỗi:</strong> <span style="color:#f87171">${r.failReason}</span></div>` : ''}
        ${r.note ? `<div><strong>Ghi chú:</strong> ${r.note}</div>` : ''}
      </div>
    </div>` : ''}
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closeModal('modal-tc');quickNavigateExec('${tcId}')">▶ Thực thi TC này</button>
      <button class="btn btn-outline" onclick="closeModal('modal-tc');openCloneTcModal('${tcId}')">📋 Nhân bản</button>
      <button class="btn btn-outline" onclick="closeModal('modal-tc');openEditTcModal('${tcId}')">✏️ ${isCustom ? 'Sửa' : 'Hiệu đính'}</button>
      ${isOverriddenTc(tcId) ? `<button class="btn btn-outline" onclick="closeModal('modal-tc');resetBuiltinTc('${tcId}')" style="color:#d97706">🔄 Khôi phục gốc</button>` : ''}
      <button class="btn btn-outline" onclick="closeModal('modal-tc')">Đóng</button>
    </div>`;
  openModal('modal-tc');
}

// ================================================================
// EXECUTE PAGE
// ================================================================
function renderExecutePage() {
  const modSelect = document.getElementById('exec-filter-module');
  if (modSelect && modSelect.options.length <= 1) {
    populateModuleSelects();
  }
  filterExecList();
  if (state.selectedTcId) selectExecTc(state.selectedTcId);
}

function filterExecList() {
  const srch = (document.getElementById('exec-search').value || '').toLowerCase().trim();
  const mod = document.getElementById('exec-filter-module').value;
  const sts = document.getElementById('exec-filter-status').value;
  const all = getAllTcs();
  const filtered = all.filter(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    if (mod && tc.module !== mod) return false;
    if (sts && s !== sts) return false;
    if (srch && !tc.id.toLowerCase().includes(srch) && !tc.name.toLowerCase().includes(srch)) return false;
    return true;
  });
  const el = document.getElementById('exec-tc-list');
  el.innerHTML = filtered.map(tc => {
    const r = state.results[tc.id];
    const s = r ? r.status : 'Not Run';
    const cls = (s).replace(' ','-');
    const isCustom = isCustomTc(tc.id);
    return `<div class="exec-tc-item ${state.selectedTcId===tc.id?'selected':''}" onclick="selectExecTc('${tc.id}')">
      <div class="exec-tc-item-code">${tc.id}</div>
      <div class="exec-tc-item-name">${tc.name}</div>
      <div class="exec-tc-item-meta">
        ${priorityBadge(tc.priority)}
        ${isCustom ? '<span class="badge-custom" style="font-size:10px;padding:1px 6px">✨ Tùy chỉnh</span>' : ''}
        <span class="status-badge status-${cls}" style="font-size:10.5px;padding:2px 7px">${s}</span>
      </div>
    </div>`;
  }).join('');
}

function selectExecTc(tcId) {
  state.selectedTcId = tcId;
  document.querySelectorAll('.exec-tc-item').forEach(el => el.classList.remove('selected'));
  const items = document.querySelectorAll('.exec-tc-item');
  items.forEach(el => { if (el.querySelector('.exec-tc-item-code')?.textContent === tcId) el.classList.add('selected'); });
  renderExecDetail(tcId);
}

function renderExecDetail(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const r = state.results[tcId] || {};
  const isCustom = isCustomTc(tcId);
  const card = document.getElementById('exec-detail-card');
  card.innerHTML = `<div class="exec-detail">
    <div class="exec-tc-header">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div class="exec-tc-header-code">${tc.id}</div>
        ${isCustom ? '<span class="badge-custom">✨ Test Case Tùy chỉnh</span>' : '<span class="badge-builtin">📦 Bộ chuẩn gốc</span>'}
      </div>
      <div class="exec-tc-header-name">${tc.name}</div>
      <div class="exec-tc-header-module">${getModuleName(tc.module)} · ${priorityBadge(tc.priority)} ${tc.platform ? `· <span style="color:#4338ca;font-weight:600">💻 ${tc.platform}</span>` : ''}</div>
    </div>
    ${tc.testData ? `<div class="exec-section" style="background:#f1f5f9;padding:12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:16px">
      <div style="font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px">Dữ liệu đầu vào (Test Data)</div>
      <div style="font-family:monospace;font-size:13px;color:#0f172a;white-space:pre-wrap;word-break:break-word">${tc.testData}</div>
    </div>` : ''}
    ${tc.precondition ? `<div class="exec-section">
      <div class="exec-section-title">⚙️ Điều kiện tiên quyết</div>
      <div class="exec-section-content">${tc.precondition}</div>
    </div>` : ''}
    ${tc.steps ? `<div class="exec-section">
      <div class="exec-section-title">📝 Các bước thực hiện</div>
      <div class="exec-section-content"><ul>${tc.steps.map(s=>`<li>${s}</li>`).join('')}</ul></div>
    </div>` : ''}
    <div class="exec-section">
      <div class="exec-section-title">✅ Kết quả mong đợi</div>
      <div class="exec-section-content"><ul>${(tc.expected||[]).map(e=>`<li>${e}</li>`).join('')}</ul></div>
    </div>
    ${tc.notes ? `<div class="exec-section">
      <div class="exec-section-title">📌 Ghi chú kỹ thuật</div>
      <div class="exec-section-content">${tc.notes}</div>
    </div>` : ''}
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">🎯 Kết quả thực tế</div>
      <div class="status-selector" id="status-sel-${tcId}">
        ${['Pass','Fail','Skip','In Progress'].map(s => {
          const cls = s.replace(' ','');
          const active = r.status === s ? 'active' : '';
          return `<button class="btn btn-${cls.toLowerCase()} ${active}" onclick="setStatus('${tcId}','${s}')">${s==='Pass'?'✅':s==='Fail'?'❌':s==='Skip'?'⏭':'🔄'} ${s}</button>`;
        }).join('')}
      </div>
    </div>
    <div class="exec-form">
      <div class="form-group">
        <label>Người thực hiện test</label>
        <input type="text" id="ef-tester" value="${r.tester || (state.currentUser ? state.currentUser.name : '')}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed" />
      </div>
      <div class="form-group">
        <label>Lý do lỗi (khi Fail)</label>
        <input type="text" id="ef-fail" placeholder="Mô tả lỗi thực tế gặp phải..." value="${r.failReason||''}" onchange="updateTcField('${tcId}','failReason',this.value)" />
      </div>
      <div class="form-group">
        <label>Ghi chú thêm</label>
        <textarea id="ef-note" placeholder="Ghi chú, môi trường test, screenshot path..." onchange="updateTcField('${tcId}','note',this.value)">${r.note||''}</textarea>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-outline" onclick="prevTc('${tcId}')">← TC trước</button>
        <button class="btn btn-outline" onclick="nextTc('${tcId}')">TC tiếp →</button>
        <button class="btn btn-outline" onclick="openEditTcModal('${tcId}')">✏️ ${isCustom ? 'Sửa TC này' : 'Hiệu đính TC này'}</button>
        ${isOverriddenTc(tcId) ? `<button class="btn btn-outline" onclick="resetBuiltinTc('${tcId}')" style="color:#d97706">🔄 Khôi phục gốc</button>` : ''}
        <button class="btn btn-outline" onclick="openCloneTcModal('${tcId}')">📋 Nhân bản</button>
      </div>
    </div>
  </div>`;
}

function setStatus(tcId, status) {
  const failEl = document.getElementById('ef-fail');
  if (status === 'Fail' && (!failEl || !failEl.value.trim())) {
    showToast('⚠️ Vui lòng nhập lý do lỗi trước khi đánh Fail!', 'error');
    if (failEl) failEl.focus();
    return;
  }
  
  if (!state.results[tcId]) state.results[tcId] = {};
  state.results[tcId].status = status;
  state.results[tcId].runAt = new Date().toISOString();
  
  const testerEl = document.getElementById('ef-tester');
  if (testerEl && testerEl.value) state.results[tcId].tester = testerEl.value;
  
  if (failEl) state.results[tcId].failReason = failEl.value;
  const noteEl = document.getElementById('ef-note');
  if (noteEl) state.results[tcId].note = noteEl.value;
  
  saveState();
  renderExecDetail(tcId);
  filterExecList();
  syncSingleResultToSupabase(tcId);
  showToast(`${status === 'Pass' ? '✅' : status === 'Fail' ? '❌' : '⏭'} ${tcId}: ${status}`, status === 'Pass' ? 'success' : status === 'Fail' ? 'error' : 'info');
}

function updateTcField(tcId, field, value) {
  if (!state.results[tcId]) state.results[tcId] = { status: 'Not Run' };
  state.results[tcId][field] = value;
  saveState();
}

function prevTc(currentId) {
  const all = getAllTcs();
  const idx = all.findIndex(t => t.id === currentId);
  if (idx > 0) { selectExecTc(all[idx-1].id); filterExecList(); }
}
function nextTc(currentId) {
  const all = getAllTcs();
  const idx = all.findIndex(t => t.id === currentId);
  if (idx < all.length - 1) { selectExecTc(all[idx+1].id); filterExecList(); }
}

// ================================================================
// REPORT PAGE
// ================================================================
function renderReport() {
  document.getElementById('rpt-date').textContent = new Date().toLocaleDateString('vi-VN');
  document.getElementById('rpt-session').textContent = state.session?.name || 'Chưa có phiên';
  document.getElementById('rpt-owner').textContent = state.session?.owner || 'QA Team';

  const s = getStats();
  const statsHtml = `
    <div class="stat-card stat-total"><div class="stat-icon">📋</div><div class="stat-body"><div class="stat-value">${s.total}</div><div class="stat-label">Tổng TC</div></div></div>
    <div class="stat-card stat-pass"><div class="stat-icon">✅</div><div class="stat-body"><div class="stat-value" style="color:#4ade80">${s.pass}</div><div class="stat-label">Passed</div></div></div>
    <div class="stat-card stat-fail"><div class="stat-icon">❌</div><div class="stat-body"><div class="stat-value" style="color:#f87171">${s.fail}</div><div class="stat-label">Failed</div></div></div>
    <div class="stat-card stat-skip"><div class="stat-icon">⏭️</div><div class="stat-body"><div class="stat-value" style="color:#fbbf24">${s.skip}</div><div class="stat-label">Skipped</div></div></div>
    <div class="stat-card stat-pending"><div class="stat-icon">⏳</div><div class="stat-body"><div class="stat-value" style="color:#64748b">${s.pending}</div><div class="stat-label">Chưa chạy</div></div></div>
    <div class="stat-card stat-progress"><div class="stat-icon">🎯</div><div class="stat-body"><div class="stat-value" style="color:#60a5fa">${s.passRate}%</div><div class="stat-label">Pass Rate</div></div></div>`;
  document.getElementById('report-stats-grid').innerHTML = statsHtml;

  // Charts
  renderReportPieChart(s);
  renderReportBarChart();

  // Fail table
  const fails = getAllTcs().filter(tc => state.results[tc.id]?.status === 'Fail');
  document.getElementById('fail-count-badge').textContent = fails.length;
  document.getElementById('fail-table-body').innerHTML = fails.length ? fails.map(tc => {
    const r = state.results[tc.id];
    return `<tr>
      <td class="tc-code">${tc.id}</td>
      <td><span class="module-tag">${getModuleShort(tc.module)}</span></td>
      <td>${tc.name}</td>
      <td style="color:#f87171;font-size:12px">${r.failReason || '—'}</td>
      <td style="font-size:12px">${r.tester || '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.runAt ? new Date(r.runAt).toLocaleDateString('vi-VN') : '—'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" class="empty-state">Không có TC nào bị Fail 🎉</td></tr>';

  // Module report
  const mStats = getModuleStats();
  document.getElementById('report-module-body').innerHTML = mStats.map(m => {
    const ran = m.pass + m.fail + m.skip;
    const passRate = m.total > 0 ? Math.round((m.pass/m.total)*100) : 0;
    let badge = '<span style="color:#64748b">⏳ Chưa bắt đầu</span>';
    if (ran > 0 && ran < m.total) badge = '<span style="color:#60a5fa">🔄 Đang chạy</span>';
    else if (ran === m.total && m.fail === 0) badge = '<span style="color:#4ade80">✅ Hoàn thành</span>';
    else if (ran === m.total) badge = '<span style="color:#f87171">⚠️ Có lỗi</span>';
    return `<tr>
      <td><strong>${m.name}</strong></td>
      <td>${m.total}</td>
      <td style="color:#4ade80">${m.pass}</td>
      <td style="color:#f87171">${m.fail}</td>
      <td style="color:#fbbf24">${m.skip}</td>
      <td style="color:#64748b">${m.pending}</td>
      <td class="pass-rate-cell">${passRate}%</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
}

function renderReportPieChart(s) {
  const ctx = document.getElementById('chartReportPie').getContext('2d');
  if (state.charts.pie) state.charts.pie.destroy();
  const tc = getThemeChartColors();
  state.charts.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pass','Fail','Skip','Chưa chạy'],
      datasets: [{ data: [s.pass,s.fail,s.skip,s.pending],
        backgroundColor: ['rgba(34,197,94,0.85)','rgba(239,68,68,0.85)','rgba(245,158,11,0.85)','rgba(100,116,139,0.4)'],
        borderWidth: 2, borderColor: tc.pieBorderColor, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position:'bottom', labels:{color: tc.legendColor, font:{family:'Inter',size:12}, padding:16} } }
    }
  });
}

function renderReportBarChart() {
  const ctx = document.getElementById('chartReportBar').getContext('2d');
  if (state.charts.bar) state.charts.bar.destroy();
  const mStats = getModuleStats();
  const tc = getThemeChartColors();
  state.charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mStats.map(m => m.short),
      datasets: [
        { label:'Pass', data:mStats.map(m=>m.pass), backgroundColor:'rgba(34,197,94,0.8)', borderRadius:4 },
        { label:'Fail', data:mStats.map(m=>m.fail), backgroundColor:'rgba(239,68,68,0.8)', borderRadius:4 },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{labels:{color: tc.legendColor, font:{family:'Inter',size:11}}}},
      scales:{
        x:{grid:{color: tc.gridColor}, ticks:{color: tc.tickColor, font:{size:10}}},
        y:{grid:{color: tc.gridColor}, ticks:{color: tc.tickColor}}
      }
    }
  });
}

// ================================================================
// SETTINGS PAGE
// ================================================================
function renderSettings() {
  // Điền cấu hình Supabase
  loadSupabaseConfig();
  const sbUrlEl = document.getElementById('sb-url');
  const sbKeyEl = document.getElementById('sb-anon-key');
  const sbAutoEl = document.getElementById('sb-auto-sync');
  if (sbUrlEl) sbUrlEl.value = supabaseConfig.url || '';
  if (sbKeyEl) sbKeyEl.value = supabaseConfig.anonKey || '';
  if (sbAutoEl) sbAutoEl.checked = supabaseConfig.autoSync !== false;
  updateSupabaseStatusUI(supabaseConfig.status);

  if (state.session) {
    document.getElementById('set-session-name').value = state.session.name || '';
    document.getElementById('set-owner').value = state.session.owner || '';
    document.getElementById('set-version').value = state.session.version || 'SmartVMS Local v2.0';
    document.getElementById('set-notes').value = state.session.notes || '';
  }

  // Storage stats
  const all = getAllTcs();
  const totalTcs = all.length;
  const customCount = (state.customTcs || []).length;
  const ran = Object.keys(state.results).length;
  const mods = getModules();
  const dataSize = (new Blob([JSON.stringify({ results: state.results, session: state.session, customTcs: state.customTcs, modules: state.modules })]).size / 1024).toFixed(1);
  document.getElementById('storage-stats').innerHTML = `<div class="storage-info">
    <div class="storage-row"><span>Tổng modules:</span><span class="storage-val">${mods.length}</span></div>
    <div class="storage-row"><span>Tổng test cases:</span><span class="storage-val">${totalTcs}</span></div>
    <div class="storage-row"><span>Test cases chuẩn gốc:</span><span class="storage-val">${ALL_TCS.length}</span></div>
    <div class="storage-row"><span>Test cases tùy chỉnh:</span><span class="storage-val" style="color:#c084fc">${customCount}</span></div>
    <div class="storage-row"><span>Đã thực thi:</span><span class="storage-val">${ran}</span></div>
    <div class="storage-row"><span>Còn lại:</span><span class="storage-val">${totalTcs - ran}</span></div>
    <div class="storage-row"><span>Dung lượng dữ liệu:</span><span class="storage-val">${dataSize} KB</span></div>
    <div class="storage-row"><span>Phiên hiện tại:</span><span class="storage-val">${state.session?.name || 'Chưa có'}</span></div>
  </div>`;

  renderSettingsModules();
}

function saveSettings() {
  state.session = {
    ...state.session,
    name: document.getElementById('set-session-name').value,
    owner: document.getElementById('set-owner').value,
    version: document.getElementById('set-version').value,
    notes: document.getElementById('set-notes').value,
  };
  saveState();
  updateSessionDisplay();
  showToast('✅ Đã lưu cài đặt', 'success');
  renderSettings();
}

function updateSessionDisplay() {
  const el = document.getElementById('session-name');
  if (state.session?.name) {
    el.textContent = state.session.name;
    document.querySelector('.dot').className = 'dot dot-green';
  } else {
    el.textContent = 'Chưa có phiên test';
  }
}

// ================================================================
// SESSION MODAL
// ================================================================
function openNewSessionModal() { openModal('modal-session'); }

function createNewSession() {
  const name = document.getElementById('new-session-name').value.trim();
  const owner = document.getElementById('new-session-owner').value.trim();
  const version = document.getElementById('new-session-version').value.trim();
  if (!name || !owner) { showToast('⚠️ Vui lòng điền Tên phiên và Người phụ trách', 'error'); return; }
  state.session = { name, owner, version, notes: '', createdAt: new Date().toISOString() };
  saveState();
  updateSessionDisplay();
  closeModal('modal-session');
  showToast(`✅ Đã tạo phiên: ${name}`, 'success');
}

// ================================================================
// CUSTOM TEST CASE CRUD OPERATIONS
// ================================================================
function generateNextCustomTcId(modId) {
  const customList = state.customTcs || [];
  let prefix = 'TC-CUSTOM-';
  if (modId) {
    prefix = `TC-${modId}-C`;
  }
  let maxNum = 0;
  const re = new RegExp(`^${prefix}(\\d+)$`, 'i');
  customList.forEach(t => {
    const m = t.id.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

function openAddTcModal(defaultModule) {
  const modSelect = document.getElementById('tc-form-module');
  if (modSelect) {
    modSelect.innerHTML = getModules().map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    if (defaultModule) modSelect.value = defaultModule;
    modSelect.onchange = () => {
      if (document.getElementById('tc-form-mode').value === 'add') {
        document.getElementById('tc-form-id').value = generateNextCustomTcId(modSelect.value);
      }
    };
  }
  const selMod = defaultModule || (getModules()[0]?.id || 'M01');
  document.getElementById('modal-tc-form-title').textContent = '➕ Thêm Test Case mới';
  document.getElementById('tc-form-mode').value = 'add';
  document.getElementById('tc-form-orig-id').value = '';
  document.getElementById('tc-form-id').value = generateNextCustomTcId(selMod);
  document.getElementById('tc-form-id').disabled = false;
  document.getElementById('tc-form-priority').value = 'P2';
  document.getElementById('tc-form-platform').value = 'Giao diện Web UI';
  document.getElementById('tc-form-testdata').value = '';
  document.getElementById('tc-form-name').value = '';
  document.getElementById('tc-form-precondition').value = '';
  document.getElementById('tc-form-steps').value = '';
  document.getElementById('tc-form-expected').value = '';
  document.getElementById('tc-form-notes').value = '';
  openModal('modal-tc-form');
}

function openEditTcModal(tcId) {
  const all = getAllTcs();
  const tc = all.find(t => t.id === tcId);
  if (!tc) {
    showToast('⚠️ Không tìm thấy Test Case để chỉnh sửa!', 'error');
    return;
  }
  const isCustom = isCustomTc(tcId);
  const modSelect = document.getElementById('tc-form-module');
  if (modSelect) {
    modSelect.innerHTML = getModules().map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    modSelect.value = tc.module;
    modSelect.onchange = null;
    modSelect.disabled = !isCustom; // Test case chuẩn giữ nguyên module để đảm bảo cấu trúc ID
  }
  document.getElementById('modal-tc-form-title').textContent = isCustom
    ? `✏️ Chỉnh sửa: ${tc.id}`
    : `✏️ Hiệu đính Test Case Chuẩn: ${tc.id}`;
  document.getElementById('tc-form-mode').value = isCustom ? 'edit' : 'override';
  document.getElementById('tc-form-orig-id').value = tc.id;
  document.getElementById('tc-form-id').value = tc.id;
  document.getElementById('tc-form-id').disabled = true;
  document.getElementById('tc-form-priority').value = tc.priority || 'P2';
  document.getElementById('tc-form-platform').value = tc.platform || 'Giao diện Web UI';
  document.getElementById('tc-form-testdata').value = tc.testData || '';
  document.getElementById('tc-form-name').value = tc.name || '';
  document.getElementById('tc-form-precondition').value = tc.precondition || '';
  document.getElementById('tc-form-steps').value = Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || '');
  document.getElementById('tc-form-expected').value = Array.isArray(tc.expected) ? tc.expected.join('\n') : (tc.expected || '');
  document.getElementById('tc-form-notes').value = tc.notes || '';
  openModal('modal-tc-form');
}

function openCloneTcModal(tcId) {
  const tc = getAllTcs().find(t => t.id === tcId);
  if (!tc) return;
  const modSelect = document.getElementById('tc-form-module');
  if (modSelect) {
    modSelect.innerHTML = getModules().map(m => `<option value="${m.id}">${m.id} - ${m.name}</option>`).join('');
    modSelect.value = tc.module;
    modSelect.onchange = null;
  }
  document.getElementById('modal-tc-form-title').textContent = `📋 Nhân bản từ ${tc.id}`;
  document.getElementById('tc-form-mode').value = 'add';
  document.getElementById('tc-form-orig-id').value = '';
  document.getElementById('tc-form-id').value = `${tc.id}-COPY`;
  document.getElementById('tc-form-id').disabled = false;
  document.getElementById('tc-form-priority').value = tc.priority || 'P2';
  document.getElementById('tc-form-platform').value = tc.platform || 'Giao diện Web UI';
  document.getElementById('tc-form-testdata').value = tc.testData || '';
  document.getElementById('tc-form-name').value = `[Copy] ${tc.name || ''}`;
  document.getElementById('tc-form-precondition').value = tc.precondition || '';
  document.getElementById('tc-form-steps').value = Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || '');
  document.getElementById('tc-form-expected').value = Array.isArray(tc.expected) ? tc.expected.join('\n') : (tc.expected || '');
  document.getElementById('tc-form-notes').value = tc.notes ? `${tc.notes} (Nhân bản từ ${tc.id})` : `Nhân bản từ ${tc.id}`;
  openModal('modal-tc-form');
}

function saveTcForm() {
  const mode = document.getElementById('tc-form-mode').value;
  const origId = document.getElementById('tc-form-orig-id').value;
  const id = document.getElementById('tc-form-id').value.trim().toUpperCase();
  const mod = document.getElementById('tc-form-module').value;
  const pri = document.getElementById('tc-form-priority').value;
  const platform = document.getElementById('tc-form-platform').value;
  const testData = document.getElementById('tc-form-testdata').value.trim();
  const name = document.getElementById('tc-form-name').value.trim();
  const precondition = document.getElementById('tc-form-precondition').value.trim();
  const stepsRaw = document.getElementById('tc-form-steps').value.trim();
  const expectedRaw = document.getElementById('tc-form-expected').value.trim();
  const notes = document.getElementById('tc-form-notes').value.trim();

  if (!id) {
    showToast('⚠️ Vui lòng nhập Mã Test Case', 'error');
    document.getElementById('tc-form-id').focus();
    return;
  }
  if (!name) {
    showToast('⚠️ Vui lòng nhập Tên / Mục tiêu Test Case', 'error');
    document.getElementById('tc-form-name').focus();
    return;
  }
  if (!expectedRaw) {
    showToast('⚠️ Vui lòng nhập Kết quả mong đợi', 'error');
    document.getElementById('tc-form-expected').focus();
    return;
  }

  const steps = stepsRaw ? stepsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const expected = expectedRaw.split('\n').map(e => e.trim()).filter(Boolean);

  if (mode === 'add') {
    const all = getAllTcs();
    if (all.some(t => t.id.toLowerCase() === id.toLowerCase())) {
      showToast(`⚠️ Mã "${id}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
      document.getElementById('tc-form-id').focus();
      return;
    }
    const newTc = {
      id,
      module: mod,
      priority: pri,
      platform,
      testData: testData || undefined,
      name,
      precondition: precondition || undefined,
      steps: steps.length ? steps : undefined,
      expected,
      notes: notes || undefined,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    state.customTcs.push(newTc);
    saveState();
    closeModal('modal-tc-form');
    showToast(`✅ Đã thêm mới Test Case: ${id}`, 'success');
  } else if (mode === 'edit') {
    const idx = state.customTcs.findIndex(t => t.id === origId);
    if (idx === -1) {
      showToast('❌ Không tìm thấy test case để cập nhật', 'error');
      return;
    }
    state.customTcs[idx] = {
      ...state.customTcs[idx],
      module: mod,
      priority: pri,
      platform,
      testData: testData || undefined,
      name,
      precondition: precondition || undefined,
      steps: steps.length ? steps : undefined,
      expected,
      notes: notes || undefined,
      updatedAt: new Date().toISOString()
    };
    saveState();
    closeModal('modal-tc-form');
    showToast(`✅ Đã cập nhật Test Case: ${origId}`, 'success');
  } else if (mode === 'override') {
    if (!state.overrides) state.overrides = {};
    state.overrides[origId] = {
      name,
      priority: pri,
      platform,
      testData: testData || undefined,
      precondition: precondition || undefined,
      steps: steps.length ? steps : undefined,
      expected,
      notes: notes || undefined,
      updatedAt: new Date().toISOString()
    };
    saveState();
    closeModal('modal-tc-form');
    showToast(`✅ Đã hiệu đính Test Case chuẩn: ${origId}`, 'success');
  }

  const stats = getStats();
  const badgeTotal = document.getElementById('badge-total');
  if (badgeTotal) badgeTotal.textContent = stats.total;

  applyFilters();
  if (document.getElementById('page-execute').classList.contains('active')) {
    filterExecList();
  }
}

function deleteCustomTc(tcId) {
  if (!isCustomTc(tcId)) {
    showToast('⚠️ Không thể xóa các test case gốc chuẩn mực!', 'error');
    return;
  }
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa Test Case "${tcId}"?\nKết quả thực thi của test case này (nếu có) cũng sẽ bị xóa.`)) {
    return;
  }
  state.customTcs = state.customTcs.filter(t => t.id !== tcId);
  if (state.results[tcId]) {
    delete state.results[tcId];
  }
  if (state.selectedTcId === tcId) {
    state.selectedTcId = null;
  }
  saveState();
  showToast(`🗑️ Đã xóa Test Case: ${tcId}`, 'info');

  const stats = getStats();
  const badgeTotal = document.getElementById('badge-total');
  if (badgeTotal) badgeTotal.textContent = stats.total;

  applyFilters();
  if (document.getElementById('page-execute').classList.contains('active')) {
    filterExecList();
  }
}


// ================================================================
// SUPABASE CLOUD & REALTIME COLLABORATION MODULE
// ================================================================
const STORAGE_SB_KEY = 'smartvms_supabase_config';
let supabaseClient = null;
let realtimeChannel = null;

let supabaseConfig = {
  url: '',
  anonKey: '',
  autoSync: true,
  status: 'disconnected' // 'disconnected' | 'connecting' | 'connected' | 'error'
};

function loadSupabaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_SB_KEY);
    if (raw) {
      const cfg = JSON.parse(raw);
      supabaseConfig.url = cfg.url || '';
      supabaseConfig.anonKey = cfg.anonKey || '';
      supabaseConfig.autoSync = cfg.autoSync !== false;
    }
  } catch(e) {
    console.error('Lỗi đọc cấu hình Supabase:', e);
  }
}

function saveSupabaseConfigToStorage() {
  localStorage.setItem(STORAGE_SB_KEY, JSON.stringify({
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey,
    autoSync: supabaseConfig.autoSync
  }));
}

function updateSupabaseStatusUI(status, label) {
  supabaseConfig.status = status;
  const dot = document.getElementById('cloud-dot');
  const text = document.getElementById('cloud-status-text');
  const pill = document.getElementById('supabase-status-pill');

  if (dot) {
    dot.className = `cloud-dot ${status}`;
  }
  if (text) {
    if (status === 'connected') text.textContent = 'Cloud: Realtime';
    else if (status === 'connecting') text.textContent = 'Cloud: Đang nối...';
    else if (status === 'error') text.textContent = 'Cloud: Lỗi kết nối';
    else text.textContent = 'Cloud: Cục bộ';
  }
  if (pill) {
    if (status === 'connected') {
      pill.className = 'badge badge-pass';
      pill.textContent = '🟢 Đã kết nối Realtime';
    } else if (status === 'connecting') {
      pill.className = 'badge badge-skip';
      pill.textContent = '🟡 Đang kết nối...';
    } else if (status === 'error') {
      pill.className = 'badge badge-fail';
      pill.textContent = '🔴 Lỗi kết nối';
    } else {
      pill.className = 'badge badge-nr';
      pill.textContent = '⚪ Chưa kết nối';
    }
  }
}

async function initSupabase(silent = false) {
  loadSupabaseConfig();
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    updateSupabaseStatusUI('disconnected');
    return;
  }

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.warn('Supabase JS SDK chưa được tải.');
    updateSupabaseStatusUI('error');
    return;
  }

  try {
    updateSupabaseStatusUI('connecting');
    supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false }
    });

    // Test query xem có kết nối được database không
    const { count, error } = await supabaseClient
      .from('test_results')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase query error:', error);
      updateSupabaseStatusUI('error');
      if (!silent) showToast(`❌ Lỗi kết nối Supabase: ${error.message}`, 'error');
      return;
    }

    updateSupabaseStatusUI('connected');
    if (!silent) showToast('⚡ Đã kết nối Supabase Cloud thành công!', 'success');

    // Khởi tạo Realtime Listener
    setupRealtimeSubscription();

    // Tự động kéo dữ liệu mới nhất từ cloud về nếu autoSync bật
    if (supabaseConfig.autoSync) {
      pullSupabaseToLocal({ silent: true });
    }
  } catch (err) {
    console.error('Supabase init error:', err);
    updateSupabaseStatusUI('error');
    if (!silent) showToast(`❌ Lỗi khởi tạo Supabase: ${err.message}`, 'error');
  }
}

function setupRealtimeSubscription() {
  if (!supabaseClient) return;
  if (realtimeChannel) {
    try { supabaseClient.removeChannel(realtimeChannel); } catch(e) {}
  }

  realtimeChannel = supabaseClient
    .channel('public:test_results:changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'test_results' }, payload => {
      handleRealtimePayload(payload);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Realtime Channel Subscribed: public:test_results');
      }
    });
}

function handleRealtimePayload(payload) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  if (eventType === 'INSERT' || eventType === 'UPDATE') {
    if (!newRecord || !newRecord.tc_id) return;
    
    // Kiểm tra xem có khác biệt với local không
    const cur = state.results[newRecord.tc_id];
    if (cur && cur.status === newRecord.status && cur.runAt === newRecord.run_at) {
      return; // Bản ghi do chính máy này vừa cập nhật
    }

    state.results[newRecord.tc_id] = {
      status: newRecord.status,
      tester: newRecord.tester,
      runAt: newRecord.run_at,
      failReason: newRecord.fail_reason || '',
      note: newRecord.note || ''
    };
    saveState();

    // Cập nhật giao diện nếu đang ở các trang tương ứng
    applyFilters();
    if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
    if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
    if (document.getElementById('page-report').classList.contains('active')) renderReport();

    showToast(`⚡ [Realtime] ${newRecord.tester || 'Tester'} vừa cập nhật ${newRecord.tc_id}: ${newRecord.status}`, 'info');
  } else if (eventType === 'DELETE') {
    if (oldRecord && oldRecord.tc_id && state.results[oldRecord.tc_id]) {
      delete state.results[oldRecord.tc_id];
      saveState();
      applyFilters();
    }
  }
}

async function saveAndConnectSupabase() {
  const urlEl = document.getElementById('sb-url');
  const keyEl = document.getElementById('sb-anon-key');
  const autoEl = document.getElementById('sb-auto-sync');

  const url = urlEl ? urlEl.value.trim() : '';
  const anonKey = keyEl ? keyEl.value.trim() : '';
  const autoSync = autoEl ? autoEl.checked : true;

  if (!url || !anonKey) {
    showToast('⚠️ Vui lòng nhập đầy đủ Project URL và Anon Key!', 'error');
    return;
  }

  supabaseConfig.url = url;
  supabaseConfig.anonKey = anonKey;
  supabaseConfig.autoSync = autoSync;
  saveSupabaseConfigToStorage();

  await initSupabase(false);
}

function disconnectSupabase() {
  if (realtimeChannel && supabaseClient) {
    try { supabaseClient.removeChannel(realtimeChannel); } catch(e) {}
  }
  supabaseClient = null;
  realtimeChannel = null;
  supabaseConfig.url = '';
  supabaseConfig.anonKey = '';
  supabaseConfig.status = 'disconnected';
  localStorage.removeItem(STORAGE_SB_KEY);

  const urlEl = document.getElementById('sb-url');
  const keyEl = document.getElementById('sb-anon-key');
  if (urlEl) urlEl.value = '';
  if (keyEl) keyEl.value = '';

  updateSupabaseStatusUI('disconnected');
  showToast('🔌 Đã ngắt kết nối Supabase Cloud', 'info');
}

async function syncSingleResultToSupabase(tcId) {
  if (!supabaseClient || !supabaseConfig.autoSync) return;
  const r = state.results[tcId];
  if (!r) return;

  try {
    const payload = {
      tc_id: tcId,
      status: r.status,
      tester: r.tester || (state.currentUser ? state.currentUser.name : 'Unknown'),
      run_at: r.runAt || new Date().toISOString(),
      fail_reason: r.failReason || null,
      note: r.note || null,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from('test_results').upsert(payload);
    if (error) console.error('Lỗi đồng bộ kết quả lên Supabase:', error);
  } catch(e) {
    console.error('Sync error:', e);
  }
}

async function pushLocalToSupabase() {
  if (!supabaseClient) {
    showToast('⚠️ Chưa kết nối Supabase Cloud! Vui lòng lưu cấu hình trước.', 'error');
    return;
  }

  const tcIds = Object.keys(state.results);
  if (tcIds.length === 0) {
    showToast('ℹ️ Chưa có kết quả test cục bộ nào để đẩy lên Cloud.', 'info');
    return;
  }

  showToast('⏳ Đang đẩy kết quả lên Supabase Cloud...', 'info');

  try {
    const rows = tcIds.map(id => ({
      tc_id: id,
      status: state.results[id].status,
      tester: state.results[id].tester || 'Tester',
      run_at: state.results[id].runAt || new Date().toISOString(),
      fail_reason: state.results[id].failReason || null,
      note: state.results[id].note || null,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient.from('test_results').upsert(rows);
    if (error) {
      showToast(`❌ Lỗi đẩy dữ liệu: ${error.message}`, 'error');
      return;
    }

    // Đẩy cả các test case tùy chỉnh và hiệu đính nếu có
    const allCustom = [...(state.customTcs || [])];
    const overrides = state.overrides || {};
    Object.keys(overrides).forEach(oid => {
      const tc = getAllTcs().find(t => t.id === oid);
      if (tc) allCustom.push({ ...tc, is_overridden: true });
    });

    if (allCustom.length > 0) {
      const customRows = allCustom.map(t => ({
        tc_id: t.id,
        module: t.module,
        priority: t.priority,
        platform: t.platform,
        name: t.name,
        test_data: t.testData || null,
        precondition: t.precondition || null,
        steps: t.steps || null,
        expected: t.expected || null,
        notes: t.notes || null,
        is_custom: Boolean(t.isCustom),
        is_overridden: Boolean(t.isOverridden),
        updated_at: new Date().toISOString()
      }));
      await supabaseClient.from('test_cases_custom').upsert(customRows);
    }

    showToast(`✅ Đã đẩy thành công ${rows.length} kết quả test lên Supabase Cloud!`, 'success');
  } catch(e) {
    showToast(`❌ Lỗi đẩy dữ liệu: ${e.message}`, 'error');
  }
}

async function pullSupabaseToLocal(opts = {}) {
  if (!supabaseClient) {
    if (!opts.silent) showToast('⚠️ Chưa kết nối Supabase Cloud!', 'error');
    return;
  }

  if (!opts.silent) showToast('⏳ Đang kéo dữ liệu từ Supabase Cloud về máy...', 'info');

  try {
    const { data: results, error } = await supabaseClient
      .from('test_results')
      .select('*');

    if (error) {
      if (!opts.silent) showToast(`❌ Lỗi kéo dữ liệu: ${error.message}`, 'error');
      return;
    }

    let count = 0;
    if (Array.isArray(results)) {
      results.forEach(r => {
        state.results[r.tc_id] = {
          status: r.status,
          tester: r.tester,
          runAt: r.run_at,
          failReason: r.fail_reason || '',
          note: r.note || ''
        };
        count++;
      });
    }

    // Kéo test cases tùy chỉnh / hiệu đính
    const { data: customData } = await supabaseClient
      .from('test_cases_custom')
      .select('*');

    if (Array.isArray(customData) && customData.length > 0) {
      if (!state.overrides) state.overrides = {};
      customData.forEach(c => {
        if (c.is_overridden) {
          state.overrides[c.tc_id] = {
            name: c.name,
            priority: c.priority,
            platform: c.platform,
            testData: c.test_data,
            precondition: c.precondition,
            steps: c.steps,
            expected: c.expected,
            notes: c.notes,
            updatedAt: c.updated_at
          };
        } else if (c.is_custom) {
          if (!state.customTcs.some(t => t.id === c.tc_id)) {
            state.customTcs.push({
              id: c.tc_id,
              module: c.module,
              priority: c.priority,
              platform: c.platform,
              name: c.name,
              testData: c.test_data,
              precondition: c.precondition,
              steps: c.steps,
              expected: c.expected,
              notes: c.notes,
              isCustom: true,
              createdAt: c.created_at
            });
          }
        }
      });
    }

    saveState();
    applyFilters();
    if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
    if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
    if (document.getElementById('page-report').classList.contains('active')) renderReport();
    if (document.getElementById('page-settings').classList.contains('active')) renderSettings();

    if (!opts.silent) showToast(`✅ Đã tải về ${count} kết quả test từ Supabase Cloud!`, 'success');
  } catch(e) {
    if (!opts.silent) showToast(`❌ Lỗi tải dữ liệu: ${e.message}`, 'error');
  }
}


// ================================================================
// EXPORT / IMPORT / RESET
// ================================================================
function exportReport() {
  const s = getStats();
  const mStats = getModuleStats();
  const allTcs = getAllTcs();
  const now = new Date().toLocaleString('vi-VN');
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo cáo Kiểm thử — SmartVMS Local</title>
<style>
body{font-family:Arial,sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:20px}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:28px;border-radius:12px;margin-bottom:24px}
h1{margin:0;font-size:22px} .sub{opacity:0.85;font-size:13px;margin-top:4px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:24px}
.stat{background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center}
.stat-v{font-size:28px;font-weight:800} .stat-l{font-size:12px;color:#64748b;margin-top:2px}
.pass{color:#16a34a} .fail{color:#dc2626} .skip{color:#d97706} .pending{color:#64748b}
table{width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
th{background:#f1f5f9;padding:10px 14px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:#475569}
td{padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:13px}
tr:last-child td{border:none}
.badge{padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}
.badge-pass{background:#dcfce7;color:#16a34a} .badge-fail{background:#fee2e2;color:#dc2626}
.badge-skip{background:#fef3c7;color:#d97706} .badge-nr{background:#f1f5f9;color:#64748b}
h2{font-size:16px;margin:24px 0 12px;color:#1e293b}
</style></head><body>
<div class="header">
  <h1>📋 Báo cáo Kiểm thử — SmartVMS Local</h1>
  <div class="sub">Phiên: ${state.session?.name || 'N/A'} · Người phụ trách: ${state.session?.owner || 'QA Team'} · Ngày: ${now}</div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-v">${s.total}</div><div class="stat-l">Tổng TC</div></div>
  <div class="stat"><div class="stat-v pass">${s.pass}</div><div class="stat-l">Passed</div></div>
  <div class="stat"><div class="stat-v fail">${s.fail}</div><div class="stat-l">Failed</div></div>
  <div class="stat"><div class="stat-v skip">${s.skip}</div><div class="stat-l">Skipped</div></div>
  <div class="stat"><div class="stat-v pending">${s.pending}</div><div class="stat-l">Chưa chạy</div></div>
  <div class="stat"><div class="stat-v" style="color:#4f46e5">${s.passRate}%</div><div class="stat-l">Pass Rate</div></div>
</div>
<h2>Kết quả theo Module</h2>
<table><thead><tr><th>Module</th><th>Tổng</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Chưa chạy</th><th>Pass Rate</th></tr></thead>
<tbody>${mStats.map(m=>`<tr><td><strong>${m.name}</strong></td><td>${m.total}</td><td class="pass">${m.pass}</td><td class="fail">${m.fail}</td><td class="skip">${m.skip}</td><td class="pending">${m.pending}</td><td><strong>${m.passRate}%</strong></td></tr>`).join('')}</tbody>
</table>
<h2>Tất cả Test Cases (${allTcs.length})</h2>
<table><thead><tr><th>Mã TC</th><th>Module</th><th>Ưu tiên</th><th>Phân loại</th><th>Tên</th><th>Trạng thái</th><th>Người test</th><th>Ngày chạy</th><th>Lý do lỗi</th></tr></thead>
<tbody>${allTcs.map(tc=>{
  const r=state.results[tc.id];
  const st=r?.status||'Not Run';
  const cls=st==='Pass'?'badge-pass':st==='Fail'?'badge-fail':st==='Skip'?'badge-skip':'badge-nr';
  const isCust = isCustomTc(tc.id);
  const typeLabel = isCust ? '<span style="color:#7c3aed;font-weight:bold">Tùy chỉnh</span>' : '<span style="color:#64748b">Chuẩn</span>';
  return `<tr><td style="font-family:monospace;font-size:11px">${tc.id}</td><td>${getModuleShort(tc.module)}</td><td>${tc.priority}</td><td>${typeLabel}</td><td>${tc.name}</td><td><span class="badge ${cls}">${st}</span></td><td>${r?.tester||'—'}</td><td>${r?.runAt?new Date(r.runAt).toLocaleDateString('vi-VN'):'—'}</td><td style="color:#dc2626">${r?.failReason||'—'}</td></tr>`
}).join('')}</tbody>
</table>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartVMS_TestReport_${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  showToast('✅ Đã xuất báo cáo HTML', 'success');
}

function printReport() { window.print(); }

function exportData() {
  const data = {
    session: state.session,
    results: state.results,
    customTcs: state.customTcs || [],
    modules: state.modules || [],
    overrides: state.overrides || {},
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SmartVMS_TestData_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showToast('✅ Đã xuất dữ liệu JSON (kèm Test Cases & Modules tùy chỉnh)', 'success');
}

function importData(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.results) { state.results = data.results; }
      if (data.session) { state.session = data.session; updateSessionDisplay(); }
      if (data.customTcs && Array.isArray(data.customTcs)) { state.customTcs = data.customTcs; }
      if (data.overrides && typeof data.overrides === 'object') { state.overrides = data.overrides; }
      if (data.modules && Array.isArray(data.modules) && data.modules.length > 0) { state.modules = data.modules; }
      saveState();
      populateModuleSelects();
      showToast('✅ Đã import dữ liệu thành công', 'success');
      renderSettings();
    } catch { showToast('❌ File JSON không hợp lệ', 'error'); }
  };
  reader.readAsText(file);
  evt.target.value = '';
}

function resetResults() {
  if (!confirm('⚠️ Bạn chắc chắn muốn xóa toàn bộ kết quả test? Hành động này không thể hoàn tác.')) return;
  state.results = {};
  saveState();
  showToast('🗑 Đã reset toàn bộ kết quả test', 'info');
  renderSettings();
}

// ================================================================
// MODAL HELPERS
// ================================================================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ================================================================
// TOAST
// ================================================================
function showToast(msg, type='info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// ================================================================
// THEME MANAGEMENT (LIGHT / DARK)
// ================================================================
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('smartvms_theme', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '🌙 Tối' : '☀️ Sáng';
    btn.setAttribute('title', theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối');
  }
  // Re-render charts with updated theme palette if active
  const s = getStats();
  const mStats = getModuleStats();
  if (state.charts.module && document.getElementById('chartModule')) renderModuleChart(mStats);
  if (state.charts.priority && document.getElementById('chartPriority')) renderPriorityChart(s);
  if (state.charts.pie && document.getElementById('chartReportPie')) renderReportPieChart(s);
  if (state.charts.bar && document.getElementById('chartReportBar')) renderReportBarChart();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  showToast(`🎨 Đã đổi sang ${next === 'light' ? 'Giao diện Nền Sáng' : 'Giao diện Nền Tối'}`, 'info');
}

function initTheme() {
  const saved = localStorage.getItem('smartvms_theme') || 'light';
  setTheme(saved);
}

// ================================================================
// MODULE MANAGEMENT CRUD OPERATIONS
// ================================================================
function renderSettingsModules() {
  const tbody = document.getElementById('modules-settings-tbody');
  if (!tbody) return;
  const mods = getModules();
  const allTcs = getAllTcs();
  const countEl = document.getElementById('module-count');
  if (countEl) countEl.textContent = mods.length;

  tbody.innerHTML = mods.map(m => {
    const count = allTcs.filter(t => t.module === m.id).length;
    return `<tr>
      <td><span class="module-badge">${m.id}</span></td>
      <td><strong>${m.name}</strong></td>
      <td><span style="color:var(--text-secondary);font-size:12.5px">${m.short}</span></td>
      <td style="text-align:center"><span class="module-tc-count">${count} TC</span></td>
      <td style="text-align:center">
        <div class="action-btn-group" style="justify-content:center">
          <button class="action-btn edit" onclick="openEditModuleModal('${m.id}')" title="Sửa module">✏️</button>
          <button class="action-btn delete" onclick="deleteModule('${m.id}')" title="Xóa module">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function generateNextModuleId() {
  const mods = getModules();
  let maxNum = 0;
  mods.forEach(m => {
    const match = m.id.match(/^M(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  return `M${String(maxNum + 1).padStart(2, '0')}`;
}

function openAddModuleModal() {
  document.getElementById('modal-module-title').textContent = '➕ Thêm Module mới';
  document.getElementById('module-form-mode').value = 'add';
  const idInput = document.getElementById('module-form-id');
  idInput.value = generateNextModuleId();
  idInput.disabled = false;
  document.getElementById('module-form-name').value = '';
  document.getElementById('module-form-short').value = '';
  openModal('modal-module-form');
}

function openEditModuleModal(modId) {
  const mod = getModules().find(m => m.id === modId);
  if (!mod) return;
  document.getElementById('modal-module-title').textContent = `✏️ Chỉnh sửa Module: ${mod.id}`;
  document.getElementById('module-form-mode').value = 'edit';
  const idInput = document.getElementById('module-form-id');
  idInput.value = mod.id;
  idInput.disabled = true;
  document.getElementById('module-form-name').value = mod.name;
  document.getElementById('module-form-short').value = mod.short;
  openModal('modal-module-form');
}

function saveModuleForm() {
  const mode = document.getElementById('module-form-mode').value;
  const id = document.getElementById('module-form-id').value.trim();
  const name = document.getElementById('module-form-name').value.trim();
  const short = document.getElementById('module-form-short').value.trim();

  if (!id || !name || !short) {
    showToast('⚠️ Vui lòng điền đầy đủ Mã, Tên và Tên viết tắt của Module!', 'error');
    return;
  }

  const mods = getModules();

  if (mode === 'add') {
    if (mods.some(m => m.id.toLowerCase() === id.toLowerCase())) {
      showToast(`⚠️ Mã Module "${id}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
      return;
    }
    mods.push({ id, name, short });
    showToast(`✅ Đã thêm Module mới: ${id} - ${name}`, 'success');
  } else {
    const idx = mods.findIndex(m => m.id === id);
    if (idx !== -1) {
      mods[idx].name = name;
      mods[idx].short = short;
      showToast(`✅ Đã cập nhật Module: ${id}`, 'success');
    }
  }

  saveState();
  closeModal('modal-module-form');
  populateModuleSelects();

  // Re-render views
  renderSettings();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases').classList.contains('active')) renderTestCases();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  if (document.getElementById('page-execute').classList.contains('active')) renderExecutePage();
}

function deleteModule(modId) {
  const allTcs = getAllTcs();
  const linkedCount = allTcs.filter(t => t.module === modId).length;
  if (linkedCount > 0) {
    showToast(`⚠️ Không thể xóa module "${modId}" vì đang có ${linkedCount} Test Cases liên kết! Vui lòng chuyển hoặc xóa các Test Cases này trước.`, 'error');
    return;
  }

  const mod = getModules().find(m => m.id === modId);
  const modName = mod ? `${mod.id} - ${mod.name}` : modId;
  if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa Module "${modName}"?`)) return;

  state.modules = getModules().filter(m => m.id !== modId);
  saveState();
  populateModuleSelects();
  showToast(`🗑️ Đã xóa Module: ${modId}`, 'info');

  renderSettings();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases').classList.contains('active')) renderTestCases();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  if (document.getElementById('page-execute').classList.contains('active')) renderExecutePage();
}

function resetModulesToDefault() {
  if (!confirm('⚠️ Bạn có chắc chắn muốn khôi phục danh mục Module về 10 Module mặc định ban đầu?')) return;
  state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  saveState();
  populateModuleSelects();
  showToast('🔄 Đã khôi phục 10 Module mặc định chuẩn SmartVMS v2.0', 'success');

  renderSettings();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-testcases').classList.contains('active')) renderTestCases();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  if (document.getElementById('page-execute').classList.contains('active')) renderExecutePage();
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadState();
  initSupabase(true);
  populateModuleSelects();
  updateSessionDisplay();
  applyAuth(); // Apply login state
  navigate('dashboard');
  const all = getAllTcs();
  console.log(`✅ SmartVMS Test Manager loaded | ${all.length} Test Cases (${ALL_TCS.length} Chuẩn + ${state.customTcs.length} Tùy chỉnh) | ${getModules().length} Modules`);
});
