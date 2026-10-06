/* ============================================================
   SmartVMS Test Manager — Application Logic
   Version 3.0 | 174 Test Cases | 12 Modules (SmartVMS Local 2026)
   ============================================================ */

'use strict';

// ================================================================
// DATA: 12 MODULES — SMARTVMS LOCAL 2026 CHUẨN HÓA
// ================================================================
const DEFAULT_MODULES = [
  {
    "id": "M01",
    "name": "Xác thực, Phân quyền & Quản lý Ca trực",
    "short": "Auth & Ca trực"
  },
  {
    "id": "M02",
    "name": "Check-in Khách Đơn & Cấp phát Thẻ",
    "short": "Check-in Khách"
  },
  {
    "id": "M03",
    "name": "Khách Đoàn, Người đi cùng & Lưu trú Qua đêm",
    "short": "Đoàn & Đi cùng"
  },
  {
    "id": "M04",
    "name": "Check-out, Quản lý Phương tiện & Thu hồi Thẻ mất",
    "short": "Check-out & Thẻ"
  },
  {
    "id": "M05",
    "name": "Giao diện Trực ban Cải tiến & Tra cứu Nâng cao",
    "short": "Trực ban & Tra cứu"
  },
  {
    "id": "M06",
    "name": "Chi tiết Lượt khách & Dòng thời gian Timeline",
    "short": "Chi tiết & Timeline"
  },
  {
    "id": "M07",
    "name": "Phân hệ Sổ sách Ngoại lệ - DataEntry",
    "short": "Sổ sách DataEntry"
  },
  {
    "id": "M08",
    "name": "Quản trị Admin & Giám sát Vận hành",
    "short": "Admin & Giám sát"
  },
  {
    "id": "M09",
    "name": "Trung tâm Báo cáo, Thống kê & Báo cáo Thẻ mất",
    "short": "Báo cáo & Thống kê"
  },
  {
    "id": "M10",
    "name": "Cấu hình Hệ thống, Trạm gác & Sao lưu CSDL",
    "short": "Cấu hình & Backup"
  },
  {
    "id": "M11",
    "name": "Thiết bị Ngoại vi, DeviceService & Tương tác Cổng",
    "short": "Thiết bị & Barie"
  },
  {
    "id": "M12",
    "name": "Dịch vụ Ngầm, Tính toàn vẹn, Bản quyền & Chịu lỗi",
    "short": "Dịch vụ ngầm & NFR"
  }
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
  {
    "id": "TC-AUTH-001",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập Trạm gác hợp lệ bằng tài khoản trạm (Không mật khẩu)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tên đăng nhập: \"Nv001a1\" (không cần mật khẩu).",
    "precondition": "Backend API đang chạy; Cán bộ \"NV001\" (Nguyễn Văn Huy) có trạng thái kích hoạt trong CSDL.",
    "steps": [
      "1. Truy cập trang web Trạm gác (/staff.html).",
      "2. Nhập Tên đăng nhập trạm (vd: Nv001a1), nhấn Đăng nhập (hệ thống trạm không yêu cầu mật khẩu)."
    ],
    "expected": [
      "Hệ thống tự động chuẩn hóa chữ thường, xác thực thành công và lưu Token đăng nhập trạm.",
      "Nếu trạm chưa có ca trực nào đang mở, popup \"Xác nhận chụp ảnh vào ca\" sẽ tự động hiện lên."
    ]
  },
  {
    "id": "TC-AUTH-002",
    "module": "M01",
    "priority": "P4",
    "name": "Đăng nhập trạm không phân biệt hoa/thường",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhập xen kẽ hoa thường: \"NV001A1\", \"nv001a1\", hoặc \"Nv001a1\".",
    "steps": [
      "1. Nhập username xen kẽ chữ hoa chữ thường.",
      "2. Nhấn nút Đăng nhập."
    ],
    "expected": [
      "Hệ thống tự động chuẩn hóa chữ thường và đăng nhập thành công, không phát sinh lỗi."
    ],
    "precondition": "Trang đăng nhập trạm (/staff.html) đang mở."
  },
  {
    "id": "TC-AUTH-003",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập trạm thất bại: Tên tài khoản không tồn tại",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tên đăng nhập không tồn tại: \"khongtontai999\".",
    "steps": [
      "1. Nhập tài khoản không tồn tại trong hệ thống.",
      "2. Nhấn Đăng nhập."
    ],
    "expected": [
      "Hệ thống chặn lại và hiển thị thông báo: \"User không hợp lệ hoặc nhân viên chưa được kích hoạt.\""
    ],
    "precondition": "Trang đăng nhập trạm (/staff.html) đang mở."
  },
  {
    "id": "TC-AUTH-004",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập trạm thất bại: Tài khoản bị khóa (Inactive)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tên đăng nhập của nhân viên bị khóa.",
    "steps": [
      "1. Nhập tài khoản nhân viên đã bị vô hiệu hóa.",
      "2. Nhấn Đăng nhập."
    ],
    "expected": [
      "Hệ thống từ chối đăng nhập, hiển thị thông báo: \"User không hợp lệ hoặc nhân viên chưa được kích hoạt.\""
    ],
    "precondition": "Tài khoản nhân viên đã bị tắt cờ IsActive (Inactive) trong Admin Staff Management."
  },
  {
    "id": "TC-AUTH-005",
    "module": "M01",
    "priority": "P2",
    "name": "Xử lý xung đột phiên trạm: Phát hiện trạm đang có phiên mở dở dang",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tài khoản cán bộ nhận ca: \"Nv001a1\".",
    "steps": [
      "1. Đăng nhập vào trạm đang có phiên trực chưa được đóng hoàn tất.",
      "2. Quan sát nút hành động hiển thị trên màn hình đăng nhập."
    ],
    "expected": [
      "Hệ thống hiển thị nút màu đỏ \"Ép Bắt Đầu Ca Mới\".",
      "Khi nhân viên nhấn nút này, hệ thống tự động đóng phiên cũ và khởi tạo ca trực mới cho nhân viên."
    ],
    "precondition": "Trạm gác \"STATION_A\" đang có 1 ca trực dở dang chưa được đóng bởi phiên trước."
  },
  {
    "id": "TC-AUTH-006",
    "module": "M01",
    "priority": "P1",
    "name": "Mở ca trực bằng Camera (Webcam): Live Preview & Lưu ảnh chứng thực",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhân viên trực ban đứng trước ống kính camera.",
    "precondition": "Thiết bị Webcam đã kết nối máy trạm; Trực ban đã đăng nhập hợp lệ và popup mở ca hiện lên.",
    "steps": [
      "1. Tại popup \"Xác nhận chụp ảnh vào ca\", cấp quyền truy cập Camera nếu trình duyệt yêu cầu.",
      "2. Quan sát khung hình camera trực tiếp (Live Preview) hiển thị rõ nét khuôn mặt nhân viên.",
      "3. Nhấn nút \"Vào ca\" (biểu tượng Camera)."
    ],
    "expected": [
      "Hệ thống chụp lại khung hình webcam, tải ảnh lên thư mục /uploads/shifts/... làm bằng chứng mở ca.",
      "ShiftSession mới được tạo trong CSDL, popup tự động đóng và chuyển thẳng vào Dashboard làm việc.",
      "Header trạm cập nhật họ tên nhân viên và hiển thị chấm xanh lá \"Đang trong ca trực\"."
    ]
  },
  {
    "id": "TC-AUTH-007",
    "module": "M01",
    "priority": "P3",
    "name": "Lựa chọn thiết bị Camera khi mở ca (Đa camera)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Dropdown chọn thiết bị Camera trong popup mở ca.",
    "steps": [
      "1. Tại popup Mở ca trực, quan sát dropdown danh sách camera khả dụng.",
      "2. Nhấp chọn camera khác trong danh sách dropdown."
    ],
    "expected": [
      "Khung Live Preview chuyển đổi nguồn video sang camera vừa chọn mượt mà, không bị treo trình duyệt."
    ],
    "precondition": "Máy tính trạm gắn từ 2 Webcam trở lên (ví dụ Webcam tích hợp và Webcam USB ngoài)."
  },
  {
    "id": "TC-AUTH-008",
    "module": "M01",
    "priority": "P3",
    "name": "Hủy mở ca trực (Hủy chụp ảnh vào ca)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Khi popup \"Xác nhận chụp ảnh vào ca\" hiển thị, nhấn nút \"Hủy bỏ\"."
    ],
    "expected": [
      "Hệ thống hủy phiên đăng nhập trạm, giải phóng luồng camera và quay lại màn hình Đăng nhập ban đầu."
    ],
    "precondition": "Popup \"Xác nhận chụp ảnh vào ca\" đang hiển thị.",
    "testData": "Nhấp nút \"Hủy bỏ\" hoặc biểu tượng đóng ✕."
  },
  {
    "id": "TC-AUTH-009",
    "module": "M01",
    "priority": "P2",
    "name": "Mở ca trực dự phòng bằng thẻ CCCD gắn chip (Khi Camera hỏng)",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "testData": "Thẻ CCCD chip số \"026088008100\" đặt lên đầu đọc.",
    "precondition": "Camera trạm bị hỏng; Cờ \"AllowCccdShiftAuth\" được bật; Cán bộ NV001 có số CCCD \"026088008100\" trong hồ sơ.",
    "steps": [
      "1. Tại popup Mở ca, nhấn liên kết \"Dùng CCCD thay Camera\".",
      "2. Chuyển sang giao diện xác thực CCCD, đặt thẻ CCCD lên đầu đọc chip.",
      "3. Hệ thống hiển thị số CCCD và thông tin đọc được, nhấn \"Xác nhận vào ca\"."
    ],
    "expected": [
      "Hệ thống đối soát số CCCD đọc được với hồ sơ nhân viên trong CSDL.",
      "Khớp số CCCD -> Mở ca thành công, popup đóng lại và chuyển vào Dashboard trạm gác."
    ]
  },
  {
    "id": "TC-AUTH-010",
    "module": "M01",
    "priority": "P1",
    "name": "Từ chối mở ca bằng thẻ CCCD của người khác",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "testData": "Thẻ CCCD mang số \"001099000888\" (không khớp hồ sơ).",
    "steps": [
      "1. Chọn mở ca bằng CCCD dự phòng.",
      "2. Quẹt thẻ CCCD không trùng với số CCCD lưu trong hồ sơ tài khoản đang đăng nhập."
    ],
    "expected": [
      "Hệ thống từ chối mở ca và báo lỗi: \"Số CCCD không khớp với hồ sơ nhân viên trong hệ thống.\""
    ],
    "precondition": "Cán bộ đăng nhập là NV001 (\"026088008100\"); Sử dụng thẻ CCCD người khác quẹt mở ca."
  },
  {
    "id": "TC-AUTH-011",
    "module": "M01",
    "priority": "P2",
    "name": "Tách biệt nghiệp vụ: \"Đăng xuất\" (thoát UI) vs \"Rời ca\" (kết thúc ca trực)",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Trạm gác đang trong ca trực hoạt động (ShiftSession đang Active).",
    "steps": [
      "1. Nhấp nút \"Đăng xuất\" trên thanh Header (nút bên cạnh nút Rời ca màu đỏ).",
      "2. Kiểm tra thông báo và trạng thái phiên trực trên hệ thống."
    ],
    "expected": [
      "Hệ thống xóa token phiên giao diện và quay về màn hình Login.",
      "Ca trực (ShiftSession) vẫn tiếp tục DUY TRÌ chạy ngầm, không bị đóng để bàn giao ca tạm thời."
    ],
    "testData": "Nhấp nút \"Đăng xuất\" (thoát giao diện, ca trực vẫn giữ nguyên)."
  },
  {
    "id": "TC-AUTH-012",
    "module": "M01",
    "priority": "P1",
    "name": "Kết thúc ca trực (\"Rời ca\"): Chụp ảnh bàn giao và đóng ShiftSession",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Trạm gác đang trong ca trực hoạt động; Hết giờ ca trực cần bàn giao ca.",
    "steps": [
      "1. Nhấp nút màu đỏ \"Rời ca\" trên thanh Header.",
      "2. Popup \"Xác nhận rời ca trực\" hiển thị live webcam.",
      "3. Nhấn nút \"Rời ca\" để xác nhận chụp ảnh kết thúc phiên trực."
    ],
    "expected": [
      "Hệ thống chụp ảnh kết thúc ca, gọi API /station/shift-sessions/end.",
      "ShiftSession cập nhật thời gian ra EndTime, chuyển trạng thái Ended.",
      "Màn hình tự động quay về trang Đăng nhập trạm."
    ],
    "testData": "Nhấp nút \"Rời ca\" (EndShiftModal) -> chụp ảnh webcam xác nhận kết thúc ca."
  },
  {
    "id": "TC-AUTH-013",
    "module": "M01",
    "priority": "P3",
    "name": "Khôi phục ca trực sau Reload (F5) hoặc mở lại trình duyệt",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Trạm gác đang trong ca trực hợp lệ.",
    "steps": [
      "1. Đang làm việc trên Dashboard trạm, nhấn phím F5 hoặc đóng tab và mở lại URL /staff.html."
    ],
    "expected": [
      "Hệ thống tự động đọc token lưu trong localStorage, gọi /station/auth/status và /station/shift-sessions/active.",
      "Hiển thị thẳng vào Dashboard làm việc, không bắt đăng nhập hay mở ca lại."
    ],
    "testData": "Nhấn phím F5 hoặc đóng tab và mở lại URL /staff.html."
  },
  {
    "id": "TC-AUTH-014",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập Phân hệ Quản trị Admin: Yêu cầu Mật khẩu & Xử lý xung đột phiên",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Tài khoản Admin: \"admin\", Mật khẩu: \"admin123\".",
    "steps": [
      "1. Truy cập /admin.html (hoặc /staff.html?login_as=admin).",
      "2. Nhập tên tài khoản và mật khẩu admin.",
      "3. Thử nhấp biểu tượng mắt kính để ẩn/hiện mật khẩu, sau đó nhấn Đăng nhập."
    ],
    "expected": [
      "Hệ thống xác thực mật khẩu qua thuật toán băm bảo mật.",
      "Nếu phát hiện tài khoản đang đăng nhập nơi khác, cung cấp nút \"Ép Đăng Xuất Phiên Cũ\".",
      "Đăng nhập thành công chuyển hướng vào trang Quản trị Admin với đầy đủ menu sidebar."
    ],
    "precondition": "Trang Quản trị Admin (/index.html hoặc /admin.html) đang mở."
  },
  {
    "id": "TC-CKIN-001",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in Khách đi bộ cơ bản: Nhập thủ công đầy đủ thông tin",
    "platform": "Giao diện Web Trực ban",
    "testData": "Họ tên: \"Trần Văn An\", CCCD: \"001099000111\", SĐT: \"0912345678\", Mục đích: \"Liên hệ công tác\", Cán bộ đón: \"Đ/c Trần Hưng\", Phòng ban: \"Ban Quản lý\".",
    "precondition": "Ca trực trạm gác đang mở; Modal Check-in đang hiển thị.",
    "steps": [
      "1. Trên Dashboard trạm, nhấn nút \"+ Check-in khách mới\".",
      "2. Điền đầy đủ Họ tên, Số CCCD, Số điện thoại, Cơ quan, Người đón, Mục đích.",
      "3. Chọn Không dùng xe cộ.",
      "4. Nhấn nút \"Check-in\"."
    ],
    "expected": [
      "Gọi API /station/visits/checkin thành công, lưu bản ghi Visit vào CSDL SQLite.",
      "Modal tự đóng, Dashboard cập nhật ngay dòng khách Nguyễn Văn An với trạng thái \"Trong đơn vị\".",
      "Bộ đếm quân số inside trên header tăng lên 1."
    ]
  },
  {
    "id": "TC-CKIN-002",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in tự động bằng đọc thẻ CCCD gắn chip qua DeviceService",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "testData": "Thẻ CCCD gắn chip vật lý chuẩn BCA.",
    "steps": [
      "1. Mở modal Check-in.",
      "2. Đặt thẻ CCCD gắn chip lên đầu đọc thẻ PCSC.",
      "3. Quan sát các trường trên form Check-in."
    ],
    "expected": [
      "DeviceService đọc chip và đẩy dữ liệu qua WebSocket.",
      "Form tự động điền: Họ tên, Số CCCD 12 số, Ngày sinh, Giới tính, Quê quán, Địa chỉ thường trú.",
      "Hiển thị huy hiệu xác thực chip màu xanh lá bảo đảm tính pháp lý."
    ],
    "precondition": "DeviceService WebSocket online; Đầu đọc chip PCSC/NFC đã cắm thẻ CCCD gắn chip."
  },
  {
    "id": "TC-CKIN-003",
    "module": "M02",
    "priority": "P2",
    "name": "Check-in tự động bằng quét mã QR thẻ CCCD qua máy quét 2D",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "testData": "Mã QR trên mặt thẻ CCCD (chuỗi chuẩn BCA phân tách bởi dấu gạch đứng |).",
    "steps": [
      "1. Mở modal Check-in.",
      "2. Đưa vùng mã QR trên thẻ CCCD qua luồng sáng của máy quét 2D."
    ],
    "expected": [
      "Máy quét bíp và gửi chuỗi QR chuẩn Bộ Công An vào ứng dụng.",
      "Hệ thống tự động giải mã chuỗi chuẩn, bóc tách chính xác Số CCCD, CMND cũ, Họ tên, Ngày sinh, Giới tính, Địa chỉ."
    ],
    "precondition": "Máy quét mã QR 2D đã kết nối cổng USB máy trạm."
  },
  {
    "id": "TC-CKIN-004",
    "module": "M02",
    "priority": "P1",
    "name": "Chụp ảnh chân dung khách chính trực tiếp qua Webcam khi Check-in",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Mở modal Check-in, nhấp vào khung camera chân dung.",
      "2. Hướng camera về phía khách, nhấn nút Chụp ảnh."
    ],
    "expected": [
      "Ảnh chân dung hiển thị ngay trong khung avatar của form Check-in.",
      "Sau khi lưu lượt khách, ảnh đại diện xuất hiện rõ ràng trên bảng danh sách của Dashboard."
    ],
    "precondition": "Webcam trạm gác hoạt động; Modal Check-in đang mở.",
    "testData": "Khách đứng trước ống kính; Nhấp nút chụp ảnh chân dung."
  },
  {
    "id": "TC-CKIN-005",
    "module": "M02",
    "priority": "P3",
    "name": "Chụp đa ảnh bổ sung (Giấy tờ tùy thân, tài sản) bằng Multi-shot camera modal",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại form Check-in, nhấn biểu tượng Camera chụp đa ảnh bổ sung.",
      "2. Chụp mặt trước CCCD, mặt sau CCCD và giấy giới thiệu công tác.",
      "3. Nhấn \"Hoàn tất\"."
    ],
    "expected": [
      "Danh sách các ảnh chụp thêm hiển thị dưới dạng carousel thu nhỏ trong form Check-in.",
      "Các đường dẫn ảnh được lưu vào trường AdditionalPhotoPaths trong CSDL."
    ],
    "precondition": "Modal Check-in đang mở; Khách có mang theo giấy giới thiệu hoặc tài sản cần lưu ảnh.",
    "testData": "MultiShotCameraModal: Chụp 2 ảnh giấy tờ tùy thân bổ sung."
  },
  {
    "id": "TC-CKIN-006",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in cấp Thẻ Định Danh (RFID / Mã thẻ an ninh cụ thể)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Chọn loại thẻ: \"Thẻ định danh (Identity)\", Mã thẻ: \"CARD-001\".",
    "steps": [
      "1. Tại phần Cấp thẻ an ninh trên form Check-in, chọn loại thẻ \"Thẻ định danh (Identity)\".",
      "2. Nhập mã thẻ \"CARD-8801\" (hoặc quẹt thẻ qua đầu đọc RFID).",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Lượt khách lưu trường CardNumber = \"CARD-8801\", IsCardIssued = true, CardType = \"identity\".",
      "Trên bảng Dashboard hiển thị thông tin thẻ phát \"1\", trạng thái \"Giữ 1 thẻ\"."
    ],
    "precondition": "Kho thẻ an ninh trạm có sẵn thẻ RFID chưa được cấp phát."
  },
  {
    "id": "TC-CKIN-007",
    "module": "M02",
    "priority": "P2",
    "name": "Check-in cấp Thẻ Thường (Cấp chung đếm số lượng không nhập mã)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại phần Cấp thẻ, chọn loại thẻ \"Thẻ thường (Regular)\".",
      "2. Không cần nhập mã số thẻ.",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Lượt khách lưu trường CardType = \"regular\", IsCardIssued = true, CardNumber = null.",
      "Dashboard ghi nhận đã phát 1 thẻ thường, tính vào số lượng thẻ cần thu hồi lúc ra về."
    ],
    "precondition": "Modal Check-in đang mở.",
    "testData": "Chọn loại thẻ: \"Thẻ thường (Regular)\" (hệ thống tăng bộ đếm số lượng, không cần nhập mã)."
  },
  {
    "id": "TC-CKIN-008",
    "module": "M02",
    "priority": "P2",
    "name": "Check-in không cấp thẻ an ninh (Khu vực mở / Sảnh tiếp dân)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại phần Cấp thẻ, chọn loại thẻ \"Không cấp thẻ (None)\".",
      "2. Hoàn tất Check-in."
    ],
    "expected": [
      "Lưu lượt khách với CardType = \"none\", IsCardIssued = false.",
      "Cột thẻ trên Dashboard hiển thị \"Đã thu đủ thẻ\" (không nợ thẻ)."
    ],
    "precondition": "Khu vực tiếp dân mở hoặc sảnh cơ quan không yêu cầu thẻ an ninh.",
    "testData": "Chọn loại thẻ: \"Không cấp thẻ\"."
  },
  {
    "id": "TC-CKIN-009",
    "module": "M02",
    "priority": "P2",
    "name": "Check-in có Phương tiện: Đăng ký loại xe từ danh mục chuẩn hóa",
    "platform": "Giao diện Web Trực ban",
    "testData": "Loại xe: \"Ô tô 4 chỗ\", Biển số xe: \"30A-999.88\", Chủ xe: \"Khách đại diện\".",
    "steps": [
      "1. Chuyển sang tab Phương tiện trên form Check-in.",
      "2. Chọn loại xe từ danh mục chuẩn (STANDARD_VEHICLE_TYPES: Ô tô, Xe máy, Xe tải...).",
      "3. Nhập Biển số xe \"30H-999.88\", chủ xe gán cho khách chính.",
      "4. Hoàn tất Check-in."
    ],
    "expected": [
      "Bản ghi Vehicle được tạo liên kết với Visit, lưu PlateNumber = \"30H-999.88\", Type = \"Ô tô 7 chỗ\".",
      "Dashboard hiển thị thẻ biển số \"30H-999.88 (Ô tô 7 chỗ)\", đếm \"Xe: Đăng ký 1 — Còn bên trong: 1\"."
    ],
    "precondition": "Khách di chuyển bằng phương tiện cơ giới vào cơ quan."
  },
  {
    "id": "TC-CKIN-010",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Chặn trùng CCCD: Khách có số CCCD đang ở bên trong",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhập số CCCD: \"001099000111\" để Check-in thêm lượt mới.",
    "steps": [
      "1. Mở modal Check-in khách mới.",
      "2. Nhập số CCCD \"001099000001\".",
      "3. Quan sát thông báo kiểm tra ràng buộc chéo (Cross-visit constraint)."
    ],
    "expected": [
      "Hệ thống hiển thị cảnh báo đỏ ngay dưới ô nhập CCCD: \"Số CCCD này hiện đang có 1 lượt khách ở trong đơn vị chưa Checkout.\"",
      "Nút Check-in bị chặn, không cho phép gửi trùng lặp."
    ],
    "precondition": "Khách mang số CCCD \"001099000111\" đang ở bên trong cơ quan (chưa Checkout)."
  },
  {
    "id": "TC-CKIN-011",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Chặn trùng Thẻ An Ninh: Mã thẻ đang cấp cho lượt khác chưa trả",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhập mã thẻ an ninh: \"CARD-001\".",
    "steps": [
      "1. Mở modal Check-in, nhập mã thẻ \"CARD-8801\"."
    ],
    "expected": [
      "Hệ thống phát hiện mã thẻ đang active trong danh sách thẻ chưa trả.",
      "Hiển thị cảnh báo lỗi: \"Mã thẻ này đang được sử dụng bởi khách khác bên trong đơn vị.\""
    ],
    "precondition": "Mã thẻ \"CARD-001\" đang được cấp cho 1 lượt khách khác đang inside chưa thu hồi."
  },
  {
    "id": "TC-CKIN-012",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Chặn trùng Biển số xe: Phương tiện đang ở bên trong cơ quan",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhập biển số xe: \"30A-999.88\" (hoặc \"30A99988\").",
    "steps": [
      "1. Mở modal Check-in, thêm phương tiện với biển số \"30H-999.88\"."
    ],
    "expected": [
      "Hệ thống cảnh báo: \"Biển số xe 30H-999.88 hiện đang ở trong đơn vị chưa Checkout.\""
    ],
    "precondition": "Xe biển số \"30A-999.88\" đang gửi lại bên trong cơ quan chưa checkout."
  },
  {
    "id": "TC-CKIN-013",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Bỏ trống các trường bắt buộc",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Mở modal Check-in và bấm trực tiếp nút \"Check-in\" khi chưa điền thông tin."
    ],
    "expected": [
      "Hệ thống chặn submit, hiển thị tóm tắt lỗi các trường còn thiếu (Họ tên, CCCD, Mục đích, Người đón)."
    ],
    "precondition": "Modal Check-in đang mở.",
    "testData": "Để trống Họ tên, CCCD, Mục đích hoặc Cán bộ tiếp đón rồi nhấn Check-in."
  },
  {
    "id": "TC-CKIN-014",
    "module": "M02",
    "priority": "P3",
    "name": "Tự động Upsert gợi ý Khách quen khi nhập số CCCD cũ",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhập đúng số CCCD đã từng vào: hệ thống tự động điền Họ tên, SĐT, Đơn vị công tác.",
    "steps": [
      "1. Mở modal Check-in, gõ số CCCD cũ.",
      "2. Rời tiêu điểm (blur) khỏi ô nhập CCCD."
    ],
    "expected": [
      "Hệ thống tự động tra cứu và điền sẵn Họ tên, Số điện thoại và Cơ quan của khách từ lịch sử.",
      "Tiết kiệm thời gian gõ phím cho nhân viên trực ban."
    ],
    "precondition": "Khách đã từng đến cơ quan và thông tin đã được lưu trong bảng Visitors."
  },
  {
    "id": "TC-CKIN-015",
    "module": "M02",
    "priority": "P4",
    "name": "Chụp ảnh phương tiện (Biển số xe và đầu xe) khi Check-in",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại tab Phương tiện, nhấp nút chụp ảnh phương tiện.",
      "2. Chụp biển số và đầu xe ô tô."
    ],
    "expected": [
      "Ảnh xe được đính kèm vào phương tiện, lưu vào CSDL làm cơ sở đối soát lúc xe ra."
    ],
    "precondition": "Khách Check-in có đăng ký phương tiện.",
    "testData": "Chụp ảnh webcam đầu xe và biển số xe khi check-in."
  },
  {
    "id": "TC-COMP-001",
    "module": "M03",
    "priority": "P1",
    "name": "Tạo đoàn Check-in ban đầu: Thêm nhiều Người đi cùng có danh tính",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tab Người đi cùng: Thêm \"Lê Thị Bích\", CCCD: \"001188000222\", SĐT: \"0988111222\", Nữ.",
    "steps": [
      "1. Tại form Check-in, chuyển sang tab \"Người đi cùng (Companions)\".",
      "2. Nhấn nút \"+ Thêm người đi cùng\".",
      "3. Điền Họ tên, Số CCCD, SĐT, Giới tính cho từng người đi cùng.",
      "4. Hoàn tất Check-in."
    ],
    "expected": [
      "Lưu lượt thăm với TotalGuests = 3, InsideGuests = 3.",
      "Bảng danh sách Dashboard hiển thị huy hiệu \"3/3 khách\".",
      "Xem chi tiết hiển thị đầy đủ danh sách 2 người đi cùng."
    ],
    "precondition": "Modal Check-in đang mở; Đoàn khách có từ 2 người trở lên."
  },
  {
    "id": "TC-COMP-002",
    "module": "M03",
    "priority": "P2",
    "name": "Đọc Chip CCCD hoặc Quét QR độc lập cho từng Người đi cùng",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "steps": [
      "1. Tại tab Người đi cùng, chọn thành viên thứ 2.",
      "2. Nhấn nút \"Quét chip\" (hoặc \"Quét QR\") dành riêng cho thành viên này.",
      "3. Đặt thẻ CCCD của thành viên lên đầu đọc."
    ],
    "expected": [
      "Thông tin cá nhân của thành viên thứ 2 được điền chính xác, không ghi đè vào thông tin của Trưởng đoàn."
    ],
    "precondition": "Người đi cùng có mang theo thẻ CCCD gắn chip hoặc mã QR.",
    "testData": "Nhấp biểu tượng Quét chip / QR riêng tại dòng của Người đi cùng."
  },
  {
    "id": "TC-COMP-003",
    "module": "M03",
    "priority": "P3",
    "name": "Chụp ảnh chân dung và giấy tờ riêng cho từng Người đi cùng",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại mục của Người đi cùng, nhấn nút Camera chụp ảnh chân dung.",
      "2. Nhấn Multi-shot chụp ảnh giấy tờ của người đi cùng."
    ],
    "expected": [
      "Ảnh của người đi cùng được lưu riêng biệt vào trường PhotoPath / DocumentPhoto của đối tượng AccompanyingPerson."
    ],
    "precondition": "Đoàn khách yêu cầu nhận diện hình ảnh từng thành viên.",
    "testData": "MultiShotCameraModal: Chụp ảnh chân dung riêng cho Người đi cùng."
  },
  {
    "id": "TC-COMP-004",
    "module": "M03",
    "priority": "P2",
    "name": "Cấp phát thẻ linh hoạt cho từng Người đi cùng",
    "platform": "Giao diện Web Trực ban",
    "testData": "Người 1: Thẻ định danh \"CARD-002\", Người 2: Thẻ thường, Người 3: Không cấp thẻ.",
    "steps": [
      "1. Thiết lập thẻ cho Trưởng đoàn và từng người đi cùng theo các cấu hình khác nhau.",
      "2. Hoàn tất Check-in."
    ],
    "expected": [
      "Hệ thống tính tổng số thẻ phát = 3 (2 thẻ định danh + 1 thẻ thường).",
      "Dashboard hiển thị chính xác: \"Thẻ: Phát 3 — Thu 0 | Đang giữ: 3\"."
    ],
    "precondition": "Thành viên trong đoàn nhận các loại thẻ khác nhau theo vị trí làm việc."
  },
  {
    "id": "TC-COMP-005",
    "module": "M03",
    "priority": "P2",
    "name": "Khai báo Đoàn vô danh (Số lượng khách đi cùng không cần khai báo tên)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tab Khách vô danh: Nhập số lượng khách vô danh = 5.",
    "steps": [
      "1. Tại tab \"Đoàn vô danh (Anonymous)\", nhập số lượng khách vô danh: 10.",
      "2. Không cần điền tên hay CCCD của 10 người này.",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Hệ thống lưu TotalGuests = 11 (1 trưởng đoàn + 10 vô danh).",
      "Dashboard hiển thị \"11/11 khách\"."
    ],
    "precondition": "Đoàn công nhân thi công hoặc đoàn du khách đông người không kiểm soát từng danh tính."
  },
  {
    "id": "TC-COMP-006",
    "module": "M03",
    "priority": "P2",
    "name": "Cấp phát thẻ cho Đoàn vô danh: Thẻ thường và Danh sách thẻ RFID",
    "platform": "Giao diện Web Trực ban",
    "testData": "Cấp 3 thẻ thường + 2 thẻ định danh (\"CARD-003\", \"CARD-004\").",
    "steps": [
      "1. Nhập số lượng thẻ thường cho đoàn vô danh: 10.",
      "2. Nhập thêm danh sách mã thẻ RFID định danh: \"CARD-A1\", \"CARD-A2\".",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "CSDL lưu AnonymousCardCount = 10, AnonymousIdentityCardNumbers = [\"CARD-A1\", \"CARD-A2\"].",
      "Tổng số thẻ an ninh đoàn đang giữ được tính toán chuẩn xác."
    ],
    "precondition": "Khai báo khách vô danh = 5 người."
  },
  {
    "id": "TC-COMP-007",
    "module": "M03",
    "priority": "P2",
    "name": "Đăng ký nhiều Phương tiện cho đoàn: Gán chủ xe linh hoạt",
    "platform": "Giao diện Web Trực ban",
    "testData": "Xe 1: \"29B-123.45\" (Xe 16 chỗ), Xe 2: \"29A-678.90\" (Ô tô 4 chỗ); Gán chủ xe tương ứng.",
    "steps": [
      "1. Thêm 2 phương tiện trong tab Xe cộ.",
      "2. Gán xe 1 cho Trưởng đoàn, xe 2 cho Đoàn vô danh.",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Tạo 2 bản ghi Vehicle với OwnerType tương ứng (MAIN và ANONYMOUSGROUP).",
      "Dashboard hiển thị đầy đủ cả 2 biển số xe trên dòng lượt khách."
    ],
    "precondition": "Đoàn đi nhiều xe khác nhau."
  },
  {
    "id": "TC-COMP-008",
    "module": "M03",
    "priority": "P1",
    "name": "Bổ sung Người đi cùng vào đoàn đang ở bên trong qua SupplementalCheckInModal",
    "platform": "Giao diện Web Trực ban",
    "testData": "SupplementalCheckInModal (tab companions): Thêm \"Phạm Văn C\", CCCD: \"001199000333\".",
    "steps": [
      "1. Trên dòng lượt khách đang inside, nhấn nút \"Thêm\" (hoặc mở Chi tiết -> Bổ sung).",
      "2. Modal \"SupplementalCheckInModal\" mở ra.",
      "3. Chuyển sang tab Người đi cùng, thêm 2 thành viên mới kèm CCCD và thẻ an ninh.",
      "4. Nhấn nút \"Xác nhận bổ sung\"."
    ],
    "expected": [
      "Gọi API /station/visits/accompanying-persons thành công.",
      "Quân số inside tăng thêm 2 người, tổng số khách tăng tương ứng.",
      "Lịch sử dòng thời gian Timeline ghi nhận đợt bổ sung mới."
    ],
    "precondition": "Đoàn khách đang ở bên trong (Inside); Có thêm thành viên đến sau muốn vào đoàn."
  },
  {
    "id": "TC-COMP-009",
    "module": "M03",
    "priority": "P2",
    "name": "Bổ sung Phương tiện vào đoàn đang ở bên trong qua SupplementalCheckInModal",
    "platform": "Giao diện Web Trực ban",
    "testData": "SupplementalCheckInModal (tab vehicles): Thêm xe \"29C-555.66\" (Xe tải).",
    "steps": [
      "1. Mở SupplementalCheckInModal của lượt khách đang inside.",
      "2. Tại tab Xe cộ, thêm 1 xe ô tô tải biển số \"29C-123.45\".",
      "3. Nhấn Xác nhận bổ sung."
    ],
    "expected": [
      "Phương tiện mới được gắn vào Visit, số lượng xe của lượt khách tăng lên, hiển thị biển số mới trên Dashboard."
    ],
    "precondition": "Đoàn khách đang ở bên trong; Có thêm xe chở vật tư của đoàn đến bổ sung."
  },
  {
    "id": "TC-COMP-010",
    "module": "M03",
    "priority": "P3",
    "name": "Nghiệp vụ Cấp bù thẻ thiếu (Tab missing_cards trong SupplementalCheckInModal)",
    "platform": "Giao diện Web Trực ban",
    "testData": "SupplementalCheckInModal (tab missing_cards): Cấp bù mã thẻ định danh cho thành viên còn thiếu.",
    "steps": [
      "1. Mở SupplementalCheckInModal, chọn tab \"Cấp bù thẻ thiếu (missing_cards)\".",
      "2. Chọn thành viên đang thiếu thẻ, nhập mã thẻ mới cấp bù.",
      "3. Xác nhận cập nhật."
    ],
    "expected": [
      "Hệ thống cập nhật thành viên sang trạng thái IsCardIssued = true kèm mã thẻ mới.",
      "Bộ đếm thẻ đang giữ của lượt khách tăng lên chính xác."
    ],
    "precondition": "Đoàn khách ban đầu chưa được cấp đủ thẻ (ví dụ hết thẻ tạm thời lúc check-in)."
  },
  {
    "id": "TC-COMP-011",
    "module": "M03",
    "priority": "P1",
    "name": "Cờ Khách Lưu Trú Qua Đêm / Nhiều Ngày (isMultiDayVisit)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trong modal Check-in hoặc modal Bổ sung, bật công tắc \"Lưu trú qua đêm / Nhiều ngày (isMultiDayVisit)\".",
      "2. Xác nhận lưu."
    ],
    "expected": [
      "CSDL cập nhật IsMultiDayVisit = true.",
      "Background Service Auto Checkout khi quét cuối ngày sẽ BỎ QUA lượt khách này, không tự động đóng ca khách."
    ],
    "precondition": "Khách đến làm việc dự án kéo dài qua đêm hoặc nhiều ngày liên tục.",
    "testData": "Tích chọn cờ \"Lưu trú qua đêm / nhiều ngày (isMultiDayVisit)\"."
  },
  {
    "id": "TC-COMP-012",
    "module": "M03",
    "priority": "P1",
    "name": "Validation Chặn trùng lặp nội bộ đoàn",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhập Người đi cùng có cùng số CCCD hoặc cùng mã thẻ với Trưởng đoàn (hoặc với người đi cùng khác trong đoàn)."
    ],
    "expected": [
      "Hệ thống báo lỗi trùng lặp nội bộ trong đoàn và chặn thao tác gửi dữ liệu."
    ],
    "precondition": "Đang nhập danh sách Người đi cùng trong modal Check-in.",
    "testData": "Nhập trùng số CCCD \"001099000111\" của Trưởng đoàn cho Người đi cùng."
  },
  {
    "id": "TC-COMP-013",
    "module": "M03",
    "priority": "P1",
    "name": "Validation Chặn trùng lặp với lượt khách khác đang inside toàn trạm khi bổ sung",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Khi bổ sung thành viên hoặc xe cộ, nhập CCCD/Biển xe/Mã thẻ đang được sử dụng ở 1 lượt khách khác."
    ],
    "expected": [
      "Hệ thống kiểm tra ràng buộc chéo và báo lỗi trùng lặp, bảo đảm tính duy nhất của mã thẻ và phương tiện bên trong cơ quan."
    ],
    "precondition": "Đang thực hiện bổ sung thành viên qua SupplementalCheckInModal.",
    "testData": "Nhập CCCD của một người đang ở trong cơ quan thuộc một đoàn khác."
  },
  {
    "id": "TC-COMP-014",
    "module": "M03",
    "priority": "P4",
    "name": "Lưu vết lịch sử đợt bổ sung thành viên",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Thực hiện bổ sung thành viên lần 1, sau đó bổ sung tiếp lần 2.",
      "2. Mở tab Timeline trong VisitDetailsModal để kiểm tra."
    ],
    "expected": [
      "Hiển thị rõ các sự kiện \"ADD\" (Bổ sung) riêng biệt kèm đợt (Batch), thời gian, tên trạm và tên cán bộ thực hiện."
    ],
    "precondition": "Đã hoàn tất một đợt bổ sung thành viên/xe qua SupplementalCheckInModal.",
    "testData": "Quan sát dòng thời gian Timeline của lượt khách."
  },
  {
    "id": "TC-COUT-001",
    "module": "M04",
    "priority": "P1",
    "name": "Check-out Toàn bộ đoàn: Thu hồi tất cả thẻ và đóng lượt khách",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Đoàn khách làm việc xong, toàn bộ thành viên và phương tiện cùng ra về.",
    "steps": [
      "1. Nhấn nút \"Checkout\" trên dòng lượt khách.",
      "2. Modal CheckOutModal mở ra.",
      "3. Tích chọn thu hồi tất cả thẻ định danh, thẻ thường và xác nhận xe ra về.",
      "4. Nhấn nút \"Xác nhận Checkout\"."
    ],
    "expected": [
      "Gọi API /station/visits/checkout thành công.",
      "Lượt khách chuyển trạng thái Status = 2 (Đã ra), ghi nhận CheckOutTime.",
      "Quân số inside giảm về 0, toàn bộ thẻ được thu hồi về kho."
    ],
    "testData": "CheckOutModal: Nhấp nút \"Chọn tất cả\" -> Thu hồi toàn bộ thẻ -> Xác nhận Checkout."
  },
  {
    "id": "TC-COUT-002",
    "module": "M04",
    "priority": "P1",
    "name": "Check-out Từng phần: Một số thành viên về trước, người khác ở lại",
    "platform": "Giao diện Web Trực ban",
    "testData": "CheckOutModal: Bỏ chọn trưởng đoàn (mainStillIn = true), chỉ tích chọn Người đi cùng về trước.",
    "steps": [
      "1. Mở CheckOutModal.",
      "2. Chỉ tích chọn 2 người cần checkout, bỏ tích Trưởng đoàn và các thành viên còn lại.",
      "3. Thu hồi thẻ của 2 người về trước.",
      "4. Xác nhận Checkout."
    ],
    "expected": [
      "Hệ thống cập nhật CheckOutTime cho 2 thành viên được chọn, thu hồi thẻ của họ.",
      "Lượt khách VẪN GIỮ trạng thái \"Trong đơn vị\", quân số inside hiển thị \"3/5 khách\"."
    ],
    "precondition": "Đoàn khách có một số người về trước, trưởng đoàn hoặc người khác ở lại làm việc tiếp."
  },
  {
    "id": "TC-COUT-003",
    "module": "M04",
    "priority": "P2",
    "name": "Check-out Xe riêng độc lập: Xe ra trước người (hoặc người ra xe ở lại)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Thực hiện Checkout riêng cho phương tiện qua API /visits/vehicle-checkout.",
    "steps": [
      "1. Mở CheckOutModal, checkout toàn bộ người nhưng BỎ TÍCH ô xe ô tô (hoặc ngược lại: checkout xe riêng từ modal Chi tiết).",
      "2. Xác nhận."
    ],
    "expected": [
      "Người đã ra về nhưng xe vẫn còn trong bãi.",
      "Dashboard hiển thị huy hiệu màu cam nhấp nháy: \"Chờ checkout xe\", lượt khách chưa bị đóng hoàn toàn."
    ],
    "precondition": "Xe của khách ra về trước, hoặc khách về bằng phương tiện công cộng để xe lại bãi gửi."
  },
  {
    "id": "TC-COUT-004",
    "module": "M04",
    "priority": "P1",
    "name": "Thu hồi Thẻ Định Danh (RFID / Mã thẻ cụ thể) khi Checkout",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại CheckOutModal, quẹt thẻ RFID hoặc tích chọn mã thẻ của người checkout.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Cập nhật IsCardReturned = true cho mã thẻ đó, mã thẻ được giải phóng để cấp cho lượt khách mới."
    ],
    "precondition": "Khách được cấp Thẻ định danh \"CARD-001\" khi check-in; Khách trả thẻ tại bốt gác.",
    "testData": "CheckOutModal: Trạng thái thẻ khách đại diện chọn \"Trả thẻ (RETURN)\"."
  },
  {
    "id": "TC-COUT-005",
    "module": "M04",
    "priority": "P2",
    "name": "Thu hồi Thẻ Thường (Đếm số lượng): Cho phép trả đủ hoặc trả 1 phần",
    "platform": "Giao diện Web Trực ban",
    "testData": "CheckOutModal: Ô số thẻ thu hồi nhập = 3 (cho phép nợ thẻ theo cấu hình).",
    "steps": [
      "1. Tại ô số lượng thẻ thường thu hồi, nhập 3 / 5 thẻ.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Hệ thống cập nhật AnonymousCardReturnedCount = 3.",
      "Dashboard hiển thị: \"Thẻ: Phát 5 — Thu 3 | Đang giữ: 2\"."
    ],
    "precondition": "Đoàn mượn 5 thẻ thường; Lúc về trả 3 thẻ, nợ lại 2 thẻ để người sau mang ra."
  },
  {
    "id": "TC-COUT-006",
    "module": "M04",
    "priority": "P2",
    "name": "Thu hồi Thẻ của Đoàn vô danh (Cả thẻ thường và thẻ RFID danh sách)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại CheckOutModal của đoàn vô danh, tích chọn các mã thẻ RFID trả lại và số lượng thẻ thường trả lại.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Danh sách returnedAnonymousIdentityCardNumbers được cập nhật trong CSDL, thẻ được hoàn trả kho an ninh."
    ],
    "precondition": "Đoàn vô danh có cả thẻ thường và danh sách thẻ RFID.",
    "testData": "CheckOutModal: Thu hồi đầy đủ số lượng thẻ thường và tích trả các thẻ RFID."
  },
  {
    "id": "TC-COUT-007",
    "module": "M04",
    "priority": "P1",
    "name": "Cảnh báo khi Checkout còn nợ thẻ",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Bỏ tích ô thu hồi thẻ nhưng vẫn nhấn nút Checkout."
    ],
    "expected": [
      "Hệ thống hiển thị hộp thoại cảnh báo: \"Lượt khách còn nợ thẻ an ninh. Bạn có muốn báo mất thẻ hay xác nhận khách nợ thẻ không?\""
    ],
    "precondition": "Hệ thống cấu hình ALLOW_LATE_CARD_RETURN_NAMED = false (chặn nợ thẻ).",
    "testData": "CheckOutModal: Chưa thu hồi thẻ mà nhấn Checkout."
  },
  {
    "id": "TC-COUT-008",
    "module": "M04",
    "priority": "P1",
    "name": "Nghiệp vụ Báo Mất Thẻ khi Checkout: Ghi nhận cờ isCardLost",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Khi khách làm mất thẻ, chọn tùy chọn \"Báo mất thẻ\".",
      "2. Nhập lý do mất thẻ: \"Khách làm rơi trong quá trình công tác\".",
      "3. Xác nhận Checkout."
    ],
    "expected": [
      "CSDL ghi nhận IsCardLost = true, LostAt = Now, LostNote = lý do.",
      "Lượt khách hiển thị huy hiệu \"Chờ thu thẻ\", được đưa vào danh sách Báo cáo Thẻ mất."
    ],
    "precondition": "Khách làm rơi mất thẻ an ninh trong quá trình di chuyển trong đơn vị.",
    "testData": "CheckOutModal: Chọn trạng thái thẻ \"Báo mất thẻ (LOST)\", nhập lý do mất thẻ."
  },
  {
    "id": "TC-COUT-009",
    "module": "M04",
    "priority": "P3",
    "name": "Chụp ảnh Webcam tại thời điểm Check-out làm bằng chứng bàn giao",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại CheckOutModal, nhấn nút chụp ảnh camera lúc khách ra về.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Ảnh checkout được lưu vào CSDL, hiển thị đối sánh trong modal Chi tiết lượt khách."
    ],
    "precondition": "Modal Check-out đang mở; Bốt gác có camera giám sát lối ra.",
    "testData": "Nhấp chụp ảnh webcam bàn giao thẻ và ra về."
  },
  {
    "id": "TC-COUT-010",
    "module": "M04",
    "priority": "P1",
    "name": "Nghiệp vụ THU HỒI THẺ MẤT: Tra cứu theo Mã số thẻ (RecoverLostCardModal)",
    "platform": "Giao diện Web Trực ban & Admin",
    "testData": "RecoverLostCardModal (tab Identity): Nhập mã thẻ \"CARD-001\" -> Tra cứu.",
    "steps": [
      "1. Mở modal \"Thu hồi thẻ mất (RecoverLostCardModal)\" từ menu Tiện ích hoặc modal Chi tiết.",
      "2. Chọn tab \"Thẻ định danh (Identity)\".",
      "3. Nhập mã thẻ đã báo mất, nhấn nút \"Tra cứu\"."
    ],
    "expected": [
      "Hệ thống tra cứu API /station/cards/lookup-lost (hoặc /admin/cards/lookup-lost).",
      "Hiển thị chính xác thông tin: Tên khách làm mất, CCCD, Ngày giờ báo mất, Trạm tiếp nhận."
    ],
    "precondition": "Thẻ \"CARD-001\" bị báo mất hôm trước nay được tìm thấy và mang trả lại bốt gác."
  },
  {
    "id": "TC-COUT-011",
    "module": "M04",
    "priority": "P2",
    "name": "Nghiệp vụ THU HỒI THẺ MẤT: Thu hồi theo Hồ sơ lượt khách đang nợ thẻ",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Trong RecoverLostCardModal, chọn tab \"Thẻ thường (Regular)\".",
      "2. Chọn lượt khách đang nợ thẻ từ danh sách dropdown.",
      "3. Nhập số lượng thẻ thu hồi, nhập ghi chú: \"Thu hồi thẻ khách gửi lại bảo vệ\".",
      "4. Nhấn nút \"Xác nhận thu hồi thẻ\"."
    ],
    "expected": [
      "Hệ thống gọi API /visits/{id}/recover-cards thành công.",
      "Bộ đếm thẻ nợ giảm xuống, thẻ được hoàn trả về kho khả dụng."
    ],
    "precondition": "Lượt khách đang có nợ thẻ thường trong danh sách nợ thẻ.",
    "testData": "RecoverLostCardModal (tab Regular): Chọn lượt khách nợ thẻ, nhập số lượng thẻ thu hồi = 2."
  },
  {
    "id": "TC-COUT-012",
    "module": "M04",
    "priority": "P1",
    "name": "Hoàn tất thu hồi thẻ mất: Cập nhật isCardLost = false, isCardReturned = true",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Sau khi xác nhận thu hồi thẻ mất, kiểm tra lại trạng thái lượt khách trên Dashboard và Báo cáo."
    ],
    "expected": [
      "Huy hiệu \"Chờ thu thẻ\" biến mất, lượt khách chuyển sang trạng thái hoàn tất thu đủ thẻ.",
      "Thẻ mất được gạch khỏi danh sách thất lạc trong Báo cáo Thẻ mất."
    ],
    "precondition": "Đã hoàn tất lệnh thu hồi thẻ mất qua API /visits/{id}/recover-cards.",
    "testData": "Quan sát trạng thái thẻ trong kho an ninh và lịch sử lượt khách."
  },
  {
    "id": "TC-COUT-013",
    "module": "M04",
    "priority": "P4",
    "name": "Xử lý lượt khách hết người nhưng xe còn bên trong",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Quan sát dòng lượt khách có insideGuests = 0 nhưng xe chưa checkout."
    ],
    "expected": [
      "Cột Trạng thái hiển thị huy hiệu viền cam: \"Chờ checkout xe\".",
      "Nút \"Checkout\" vẫn hiển thị để nhân viên cho xe ra khi chủ xe quay lại lấy."
    ],
    "precondition": "Đoàn khách đã checkout hết người nhưng xe tải của đoàn gửi lại qua đêm.",
    "testData": "Quan sát cột Trạng thái của dòng lượt khách trên Dashboard Trực ban."
  },
  {
    "id": "TC-COUT-014",
    "module": "M04",
    "priority": "P4",
    "name": "Xử lý lượt khách hết người nhưng thẻ còn nợ",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Quan sát dòng lượt khách có insideGuests = 0 nhưng còn giữ thẻ chưa thu."
    ],
    "expected": [
      "Cột Trạng thái hiển thị huy hiệu viền vàng: \"Chờ thu thẻ\".",
      "Nút \"Checkout\" vẫn hiển thị để nhân viên thu hồi thẻ khi khách gửi trả."
    ],
    "precondition": "Đoàn khách đã checkout hết người nhưng còn nợ thẻ an ninh chưa trả.",
    "testData": "Quan sát cột Trạng thái của dòng lượt khách trên Dashboard Trực ban."
  },
  {
    "id": "TC-COUT-015",
    "module": "M04",
    "priority": "P1",
    "name": "Tự động đóng hoàn toàn lượt khách khi quân số inside = 0, tất cả xe và thẻ đã xong",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Thu hồi chiếc thẻ cuối cùng hoặc cho chiếc xe cuối cùng ra về."
    ],
    "expected": [
      "Hệ thống tự động chuyển trạng thái lượt khách thành \"Đã ra\" (Status = 2).",
      "Không còn hiển thị nút Thêm / Checkout trên dòng này."
    ],
    "precondition": "Toàn bộ quân số, xe và thẻ của lượt khách đã được thu hồi và checkout đầy đủ.",
    "testData": "Thu hồi chiếc thẻ cuối cùng hoặc checkout chiếc xe cuối cùng."
  },
  {
    "id": "TC-COUT-016",
    "module": "M04",
    "priority": "P2",
    "name": "Cập nhật Thông tin Lượt khách Đang Thăm (UpdateVisitModal)",
    "platform": "Giao diện Web Trực ban",
    "testData": "UpdateVisitModal: Đổi mã thẻ, cập nhật biển số xe, tích chọn isMultiDayVisit -> Lưu cập nhật.",
    "steps": [
      "1. Tại danh sách khách đang ở trong (Inside), nhấp nút Cập nhật (hoặc icon Edit) để mở UpdateVisitModal.",
      "2. Chỉnh sửa mã thẻ khách đại diện hoặc điều chỉnh số thẻ cấp chung.",
      "3. Cập nhật mã thẻ của từng Người đi cùng trong danh sách.",
      "4. Đổi thông tin phương tiện (Biển số xe, Loại phương tiện) hoặc bật/tắt cờ Lưu trú nhiều ngày (isMultiDayVisit).",
      "5. Nhấn \"Lưu cập nhật\"."
    ],
    "expected": [
      "Hệ thống gọi API POST /api/station/visits/update với payload hợp lệ.",
      "Dữ liệu thẻ, phương tiện và cờ lưu trú được cập nhật ngay lập tức trên giao diện Trực ban mà không cần check-out/check-in lại."
    ],
    "precondition": "Khách đang ở bên trong; Khách đổi xe, đổi thẻ hoặc xin lưu trú qua đêm sau khi đã check-in."
  },
  {
    "id": "TC-DASH-001",
    "module": "M05",
    "priority": "P4",
    "name": "Header Trực ban hiển thị Realtime Live Clock tiếng Việt",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Quan sát thanh Header trạm gác (/staff.html)."
    ],
    "expected": [
      "Hiển thị chính xác Tên hệ thống, Tên trạm gác (MapPin), Thứ trong tuần, Ngày/tháng/năm và Giờ:phút:giây nhảy đều đặn từng giây.",
      "Avatar nhân viên có chấm xanh lá biểu thị trạng thái đang trong ca trực."
    ],
    "precondition": "Giao diện Trực ban (/staff.html) đang mở trên trình duyệt.",
    "testData": "Quan sát thanh Header phía trên cùng của màn hình."
  },
  {
    "id": "TC-DASH-002",
    "module": "M05",
    "priority": "P1",
    "name": "Live Search đa đối tượng thông minh: Lọc tức thì danh sách khách",
    "platform": "Giao diện Web Trực ban",
    "testData": "Ô Live Search: Gõ từ khóa \"30A\", \"Trần Văn An\", \"001099\", hoặc \"CARD\".",
    "steps": [
      "1. Nhấp vào ô tìm kiếm nhanh trên Dashboard trạm.",
      "2. Gõ từ khóa tìm kiếm bất kỳ."
    ],
    "expected": [
      "Bảng danh sách lập tức lọc theo thời gian thực (Live Filter).",
      "Khớp với cả Tên khách, Số CCCD, Biển số xe, Mã thẻ an ninh, Cán bộ tiếp đón hoặc Mục đích làm việc."
    ],
    "precondition": "Bảng danh sách khách có nhiều bản ghi với các thông tin đa dạng."
  },
  {
    "id": "TC-DASH-003",
    "module": "M05",
    "priority": "P3",
    "name": "Phím tắt toàn cục Ctrl + K focus nhanh ô tìm kiếm",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Đang ở bất kỳ vị trí nào trên Dashboard, nhấn tổ hợp phím Ctrl + K (hoặc Cmd + K trên macOS)."
    ],
    "expected": [
      "Con trỏ chuột tự động focus vào ô tìm kiếm nhanh và bôi đen toàn bộ từ khóa hiện có để gõ mới ngay lập tức."
    ],
    "precondition": "Đang thao tác chuột ở bất kỳ vị trí nào trên Dashboard Trực ban.",
    "testData": "Nhấn tổ hợp phím tắt Ctrl + K (hoặc Cmd + K)."
  },
  {
    "id": "TC-DASH-004",
    "module": "M05",
    "priority": "P2",
    "name": "Popover Lọc theo 5 nhóm đối tượng (Multi-Category Search Filter)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhập từ khóa vào ô tìm kiếm.",
      "2. Nhấn nút \"Chọn đối tượng\" (hoặc nút bộ lọc hiện ra bên cạnh ô tìm kiếm)."
    ],
    "expected": [
      "Popover hiển thị 5 nhóm đối tượng: Khách & Người đi cùng, Biển số & Phương tiện, Thẻ an ninh, Cán bộ & Phòng ban, Cơ quan & Mục đích.",
      "Cho phép tích chọn lọc trên từng nhóm mong muốn."
    ],
    "precondition": "Đang nhập từ khóa tìm kiếm trên Dashboard.",
    "testData": "Nhấp nút \"Chọn đối tượng\" để mở Popover lọc 5 nhóm."
  },
  {
    "id": "TC-DASH-005",
    "module": "M05",
    "priority": "P3",
    "name": "Bộ đếm kết quả khớp thời gian thực (Match counter badges) trong Popover",
    "platform": "Giao diện Web Trực ban",
    "testData": "Mở Popover lọc đối tượng và quan sát các huy hiệu đếm kết quả.",
    "steps": [
      "1. Gõ từ khóa và mở Popover lọc đối tượng."
    ],
    "expected": [
      "Mỗi nhóm đối tượng hiển thị huy hiệu đếm số lượng bản ghi khớp (vd: \"2 khớp\", \"5 khớp\").",
      "Người dùng dễ dàng biết từ khóa xuất hiện ở nhóm đối tượng nào."
    ],
    "precondition": "Từ khóa tìm kiếm khớp với cả tên khách và biển số xe."
  },
  {
    "id": "TC-DASH-006",
    "module": "M05",
    "priority": "P3",
    "name": "Nút Chọn tất cả / Bỏ chọn tất cả nhóm đối tượng tìm kiếm",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trong Popover lọc đối tượng, nhấn nút \"Bỏ chọn tất cả\", sau đó nhấn \"Chọn tất cả\"."
    ],
    "expected": [
      "Tất cả 5 nhóm đối tượng tự động đổi trạng thái checkbox tương ứng, danh sách kết quả cập nhật ngay lập tức."
    ],
    "precondition": "Popover lọc 5 nhóm đối tượng đang mở.",
    "testData": "Nhấp nút \"Bỏ chọn tất cả\", sau đó nhấp \"Chọn tất cả\"."
  },
  {
    "id": "TC-DASH-007",
    "module": "M05",
    "priority": "P1",
    "name": "Cửa sổ Tra cứu Hồ sơ Lịch sử Độc lập (AdvancedSearchModal - Phím tắt Ctrl + Shift + K)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhấn tổ hợp phím Ctrl + Shift + K (hoặc mở từ menu Tiện ích -> Tra cứu hồ sơ nâng cao)."
    ],
    "expected": [
      "Cửa sổ AdvancedSearchModal mở ra với giao diện tra cứu chuyên sâu độc lập, không phụ thuộc vào bộ lọc của Dashboard."
    ],
    "precondition": "Đang ở màn hình Trực ban (/staff.html).",
    "testData": "Nhấn tổ hợp phím tắt Ctrl + Shift + K để mở AdvancedSearchModal."
  },
  {
    "id": "TC-DASH-008",
    "module": "M05",
    "priority": "P2",
    "name": "Tra cứu chuyên sâu đa tiêu chí trong AdvancedSearchModal",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trong AdvancedSearchModal, nhập Họ tên, chọn trạng thái \"Nợ thẻ (debt_card)\", chọn khoảng ngày.",
      "2. Nhấn nút \"Tìm kiếm\"."
    ],
    "expected": [
      "Gọi API tra cứu và trả về danh sách hồ sơ khớp chính xác.",
      "Có nút \"Chi tiết\" để mở xem hồ sơ trực tiếp từ kết quả tìm kiếm."
    ],
    "precondition": "Cửa sổ AdvancedSearchModal đang mở.",
    "testData": "Nhập đồng thời: Tên khách \"An\", Trạng thái \"Đang bên trong\", Khoảng ngày \"7 ngày qua\"."
  },
  {
    "id": "TC-DASH-009",
    "module": "M05",
    "priority": "P3",
    "name": "Chế độ hiển thị thống kê tổng quan (Stats View Mode: Ẩn / Tinh gọn / Chi tiết)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trên khối thống kê Dashboard, chuyển đổi qua lại giữa 3 chế độ: \"Hiện chi tiết\", \"Hiện tinh gọn\", và \"Ẩn thống kê\".",
      "2. Nhấn F5 tải lại trang."
    ],
    "expected": [
      "Khối thống kê thay đổi kích thước hoặc ẩn đi để tối đa hóa không gian bảng danh sách khách.",
      "Trạng thái được ghi nhớ vào localStorage (smartvms_stats_view_mode), không bị mất khi F5."
    ],
    "precondition": "Thanh công cụ Dashboard có nút chuyển chế độ thống kê (Stats View Mode).",
    "testData": "Chuyển đổi lần lượt giữa: \"Ẩn\", \"Tinh gọn (Compact)\", \"Chi tiết (Detailed)\"."
  },
  {
    "id": "TC-DASH-010",
    "module": "M05",
    "priority": "P3",
    "name": "Chế độ bảng danh sách khách (Table View Mode: Thu gọn Compact vs Chi tiết Detailed)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Mở menu Tiện ích, chuyển Chế độ xem bảng sang \"Thu gọn\".",
      "2. Quan sát bảng danh sách khách."
    ],
    "expected": [
      "Bảng ẩn avatar ảnh, giảm padding dòng, tăng số lượng lượt khách hiển thị trên màn hình.",
      "Chuyển về \"Chi tiết\" hiển thị lại ảnh avatar và các thông tin mở rộng."
    ],
    "precondition": "Thanh công cụ Dashboard có nút chuyển chế độ bảng (Table Mode).",
    "testData": "Chuyển đổi giữa: \"Thu gọn (Compact)\" và \"Chi tiết (Detailed)\"."
  },
  {
    "id": "TC-DASH-011",
    "module": "M05",
    "priority": "P3",
    "name": "Tùy biến Màu sắc và Độ trong suốt hàng (DisplaySettingsModal)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Mở menu Tiện ích -> \"Cài đặt màu sắc\".",
      "2. Chọn màu hàng đang active, chỉnh thanh trượt độ mờ (Opacity), chọn màu hàng đã ra.",
      "3. Nhấn \"Lưu cấu hình\"."
    ],
    "expected": [
      "Bảng danh sách khách đổi màu nền và vạch viền chỉ thị đúng theo bảng màu vừa cấu hình."
    ],
    "precondition": "Nhấp menu Tiện ích -> chọn \"Cài đặt giao diện (DisplaySettingsModal)\".",
    "testData": "Chọn màu nền hàng khách đang ở trong (#1e56e3) và điều chỉnh độ trong suốt (0.15)."
  },
  {
    "id": "TC-DASH-012",
    "module": "M05",
    "priority": "P2",
    "name": "Bộ lọc nguồn dữ liệu (Source Filter: Tất cả / Trực ban cổng / Sổ sách ngoại lệ)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhấp dropdown bộ lọc Nguồn dữ liệu trên toolbar.",
      "2. Chọn \"Sổ sách ngoại lệ (dataentry)\"."
    ],
    "expected": [
      "Bảng chỉ hiển thị các lượt khách do nhân viên DataEntry tạo ra (có huy hiệu tím \"Sổ sách ngoại lệ\").",
      "Chọn \"Trực ban cổng (staff)\" chỉ hiển thị khách vào qua cổng trực tiếp."
    ],
    "precondition": "Hệ thống có cả dữ liệu từ trạm gác và dữ liệu từ sổ sách DataEntry.",
    "testData": "Dropdown Nguồn: Chọn lọc \"Chỉ Trực ban cổng\" hoặc \"Chỉ Sổ sách ngoại lệ\"."
  },
  {
    "id": "TC-DASH-013",
    "module": "M05",
    "priority": "P3",
    "name": "Bộ lọc thời gian: Lọc nhanh và Khoảng ngày chặn tương lai",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Chọn mốc thời gian nhanh: \"Hôm nay\", \"7 ngày qua\", \"Tuần này\", \"Tháng này\".",
      "2. Chọn khoảng ngày tùy chọn, thử chọn ngày mai (tương lai)."
    ],
    "expected": [
      "Hàm clampDateInputToToday tự động chặn không cho chọn ngày vượt quá hôm nay.",
      "Bảng dữ liệu làm mới chính xác theo khoảng ngày đã chọn."
    ],
    "precondition": "Bộ lọc thời gian trên Dashboard Trực ban.",
    "testData": "Thử nhập ngày đến ở tương lai (vượt quá ngày hôm nay)."
  },
  {
    "id": "TC-DASH-014",
    "module": "M05",
    "priority": "P4",
    "name": "Menu gom nhóm Tiện ích & Tùy chọn (SlidersHorizontal dropdown)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhấp nút \"Tiện ích\" trên toolbar bên cạnh nút Check-in."
    ],
    "expected": [
      "Menu dropdown mở ra chứa gọn gàng 4 mục: Tra cứu hồ sơ nâng cao, Chế độ xem bảng, Cài đặt màu sắc, Thu hồi thẻ mất."
    ],
    "precondition": "Thanh công cụ Dashboard Trực ban.",
    "testData": "Nhấp icon SlidersHorizontal để mở menu gom nhóm Tiện ích."
  },
  {
    "id": "TC-VDET-001",
    "module": "M06",
    "priority": "P1",
    "name": "Mở xem Chi tiết lượt khách (VisitDetailsModal)",
    "platform": "Giao diện Web Trực ban, Admin & DataEntry",
    "steps": [
      "1. Nhấn nút \"Chi tiết\" (biểu tượng con mắt) trên bất kỳ dòng lượt khách nào."
    ],
    "expected": [
      "Modal VisitDetailsModal mở ra với 3 tab: TỔNG QUAN (Overview), DÒNG THỜI GIAN (Timeline), THÀNH VIÊN (Members)."
    ],
    "precondition": "Danh sách khách có ít nhất 1 bản ghi lượt thăm.",
    "testData": "Nhấp nút \"Chi tiết\" (Eye icon) trên dòng lượt khách."
  },
  {
    "id": "TC-VDET-002",
    "module": "M06",
    "priority": "P2",
    "name": "Tab Tổng quan (Overview): Thẻ KPI tóm tắt đầy đủ chỉ số",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Quan sát Tab Tổng quan của VisitDetailsModal."
    ],
    "expected": [
      "Hiển thị thông tin Khách đại diện, Cán bộ tiếp đón, Mục đích, Cơ quan.",
      "5 Thẻ KPI: Quân số hiện tại, Thẻ định danh đang giữ, Thẻ thường đang giữ, Phương tiện, Thẻ mất."
    ],
    "precondition": "VisitDetailsModal đang mở.",
    "testData": "Quan sát tab Tổng quan (Overview): Thẻ KPI quân số, xe, thẻ, người đón."
  },
  {
    "id": "TC-VDET-003",
    "module": "M06",
    "priority": "P4",
    "name": "Cửa sổ con xem nhanh Quân số chi tiết từ Tab Tổng quan",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Tại Tab Tổng quan, nhấp vào Thẻ KPI Quân số (hoặc nút xem chi tiết quân số)."
    ],
    "expected": [
      "Cửa sổ con mở ra liệt kê danh sách từng người, giờ vào, giờ ra và trạng thái cụ thể."
    ],
    "precondition": "Đoàn khách có cả Người đi cùng và khách vô danh.",
    "testData": "Tại tab Overview, nhấp vào thẻ Quân số để mở popover chi tiết."
  },
  {
    "id": "TC-VDET-004",
    "module": "M06",
    "priority": "P4",
    "name": "Cửa sổ con xem nhanh Thẻ an ninh & Thẻ thường từ Tab Tổng quan",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấp vào Thẻ KPI Thẻ định danh hoặc Thẻ thường."
    ],
    "expected": [
      "Cửa sổ con mở ra hiển thị bảng danh sách các mã thẻ đã cấp, người đang giữ, trạng thái đã thu hồi hay đang nợ."
    ],
    "precondition": "Lượt khách được cấp cả thẻ định danh và thẻ thường.",
    "testData": "Tại tab Overview, nhấp vào thẻ Thẻ an ninh để mở popover chi tiết."
  },
  {
    "id": "TC-VDET-005",
    "module": "M06",
    "priority": "P2",
    "name": "Cửa sổ con xem nhanh Phương tiện & Checkout từng xe trực tiếp",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấp vào Thẻ KPI Phương tiện.",
      "2. Trong danh sách xe, chọn 1 xe đang ở bên trong và nhấn nút \"Checkout xe này\"."
    ],
    "expected": [
      "Hệ thống gọi API /visits/vehicle-checkout, cập nhật giờ ra riêng cho xe đó ngay lập tức mà không ảnh hưởng tới người."
    ],
    "precondition": "Đoàn khách có từ 2 phương tiện trở lên.",
    "testData": "Tại tab Overview, nhấp vào thẻ Phương tiện -> Nhấp Checkout 1 xe cụ thể."
  },
  {
    "id": "TC-VDET-006",
    "module": "M06",
    "priority": "P1",
    "name": "Tab Dòng thời gian (Timeline): Hiển thị chuỗi sự kiện CHECK_IN, ADD, CHECK_OUT, RECOVER_CARD",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Chuyển sang Tab \"DÒNG THỜI GIAN (Timeline)\"."
    ],
    "expected": [
      "Hiển thị chuỗi các mốc sự kiện theo chiều thời gian.",
      "Mỗi sự kiện có badge phân loại, thời gian thực hiện, cổng trạm và cán bộ thực thi."
    ],
    "precondition": "Lượt khách đã trải qua nhiều sự kiện: Check-in, Bổ sung người, Checkout xe.",
    "testData": "Chuyển sang tab Dòng thời gian (Timeline)."
  },
  {
    "id": "TC-VDET-007",
    "module": "M06",
    "priority": "P3",
    "name": "Đổi chiều sắp xếp Timeline: Mới nhất trước vs Cũ nhất trước",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Tại Tab Timeline, nhấn nút chuyển đổi thứ tự sắp xếp."
    ],
    "expected": [
      "Danh sách sự kiện đảo chiều sắp xếp Newest First <-> Oldest First tức thì."
    ],
    "precondition": "Tab Timeline đang hiển thị chuỗi sự kiện.",
    "testData": "Nhấp nút đổi chiều sắp xếp (Mới nhất trước <-> Cũ nhất trước)."
  },
  {
    "id": "TC-VDET-008",
    "module": "M06",
    "priority": "P3",
    "name": "Thu gọn / Mở rộng chi tiết từng đợt sự kiện Timeline",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấp vào tiêu đề của một đợt sự kiện để đóng/mở chi tiết."
    ],
    "expected": [
      "Mở rộng xem chi tiết danh sách người vào/ra, xe vào/ra và thẻ thu hồi trong đợt đó."
    ],
    "precondition": "Tab Timeline có các đợt sự kiện chi tiết.",
    "testData": "Nhấp nút Thu gọn / Mở rộng chi tiết từng đợt sự kiện."
  },
  {
    "id": "TC-VDET-009",
    "module": "M06",
    "priority": "P2",
    "name": "Tab Thành viên (Members): Danh sách toàn diện thành viên trong đoàn",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Chuyển sang Tab \"THÀNH VIÊN (Members)\"."
    ],
    "expected": [
      "Liệt kê đầy đủ Trưởng đoàn, Người đi cùng có danh tính và Khách vô danh.",
      "Hiển thị rõ ảnh chân dung, CCCD, mã thẻ đang giữ và trạng thái Vào/Ra."
    ],
    "precondition": "Lượt khách là đoàn đông người.",
    "testData": "Chuyển sang tab Thành viên (Members)."
  },
  {
    "id": "TC-VDET-010",
    "module": "M06",
    "priority": "P3",
    "name": "Thư viện Đa Ảnh Lượt thăm (VisitPhotoGalleryModal + ZoomableImage)",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấn nút \"Thư viện ảnh\" trong modal Chi tiết.",
      "2. Nhấp vào một ảnh để xem ở chế độ phóng to."
    ],
    "expected": [
      "VisitPhotoGalleryModal mở ra hiển thị lưới tất cả ảnh (Chân dung, Giấy tờ, Xe cộ, Checkout).",
      "ZoomableImage cho phép phóng to, thu nhỏ và di chuyển xem chi tiết nét ảnh."
    ],
    "precondition": "Lượt khách có nhiều ảnh chụp: chân dung, giấy tờ, xe, checkout.",
    "testData": "Trong VisitDetailsModal, nhấp nút \"Thư viện ảnh (VisitPhotoGalleryModal)\"."
  },
  {
    "id": "TC-VDET-011",
    "module": "M06",
    "priority": "P2",
    "name": "Nút hành động nhanh liên thông từ modal Chi tiết",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Trong modal Chi tiết, nhấn nút \"Bổ sung người\", \"Checkout\", hoặc \"Thu hồi thẻ mất\"."
    ],
    "expected": [
      "Mở modal thao tác tương ứng với lượt khách đã được chọn sẵn, không cần tìm lại trên bảng."
    ],
    "precondition": "VisitDetailsModal đang mở cho lượt khách đang ở trong.",
    "testData": "Nhấp các nút hành động nhanh: \"Bổ sung người\", \"Checkout\", hoặc \"Thu hồi thẻ\"."
  },
  {
    "id": "TC-VDET-012",
    "module": "M06",
    "priority": "P4",
    "name": "Đóng modal Chi tiết bằng phím Escape hoặc nút đóng ✕",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấn phím Escape trên bàn phím hoặc nhấp nút ✕."
    ],
    "expected": [
      "Modal đóng mượt mà, phục hồi lại vị trí scroll của bảng dữ liệu phía dưới."
    ],
    "precondition": "VisitDetailsModal đang mở.",
    "testData": "Nhấn phím Escape trên bàn phím hoặc nhấp nút ✕."
  },
  {
    "id": "TC-UIUX-013",
    "module": "M06",
    "priority": "P3",
    "name": "Xem Hồ sơ Cá nhân Cán bộ Trực ban Đang trực (StaffSettingsModal)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhấp vào tên hoặc avatar cán bộ trực ban trên thanh Header trạm gác.",
      "2. Quan sát thông tin trong StaffSettingsModal."
    ],
    "expected": [
      "StaffSettingsModal mở ra hiển thị đầy đủ: Ảnh thẻ đại diện, Mã nhân viên, Họ tên, Ngày sinh, Số CCCD, Điện thoại, Bộ phận và Chức vụ.",
      "Đóng modal an toàn bằng nút đóng hoặc nhấp ra ngoài."
    ],
    "precondition": "Cán bộ đang trong ca trực hợp lệ; Header trạm gác hiển thị tên cán bộ.",
    "testData": "Nhấp vào avatar hoặc tên cán bộ trên Header trạm gác."
  },
  {
    "id": "TC-UIUX-014",
    "module": "M06",
    "priority": "P4",
    "name": "Phóng to, Thu nhỏ và Soi chi tiết Ảnh bằng công cụ ZoomableImage",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Mở Thư viện ảnh của một lượt khách bất kỳ (VisitPhotoGalleryModal).",
      "2. Nhấp vào bất kỳ ảnh nào (Ảnh thẻ CCCD, ảnh biển số xe, ảnh chân dung).",
      "3. Sử dụng con lăn chuột hoặc nút công cụ để phóng to (Zoom in), thu nhỏ (Zoom out), kéo rê (Pan) và xoay ảnh."
    ],
    "expected": [
      "Công cụ ZoomableImage phản hồi mượt mà, cho phép cán bộ an ninh phóng to tối đa để soi rõ các ký tự trên giấy tờ tùy thân hoặc biển số xe."
    ],
    "precondition": "Thư viện ảnh VisitPhotoGalleryModal đang mở.",
    "testData": "Nhấp vào 1 ảnh bất kỳ -> Dùng con lăn chuột phóng to (zoom), kéo rê (pan) để soi chi tiết."
  },
  {
    "id": "TC-DENT-001",
    "module": "M07",
    "priority": "P1",
    "name": "Đăng nhập Phân hệ Sổ sách Ngoại lệ (/dataentry.html)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "testData": "Truy cập /dataentry.html, đăng nhập: \"nhaplieu\" / \"123456\".",
    "steps": [
      "1. Đăng nhập tài khoản nhaplieu tại form đăng nhập.",
      "2. Hệ thống tự động chuyển hướng sang trang /dataentry.html."
    ],
    "expected": [
      "Giao diện chuyên biệt của Phân hệ Nhập liệu Sổ sách Ngoại lệ hiển thị.",
      "Header hiển thị rõ tên nhân viên nhập liệu, địa điểm và các nút phím tắt F1, F3."
    ],
    "precondition": "Tài khoản \"nhaplieu\" tồn tại trong CSDL với vai trò DataEntry."
  },
  {
    "id": "TC-DENT-002",
    "module": "M07",
    "priority": "P3",
    "name": "Thao tác Phím tắt toàn cục trong DataEntry: F1, F3, Escape",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Nhấn phím F1 -> Modal \"DataEntryModal\" mở ra.",
      "2. Nhấn Escape -> Modal đóng lại.",
      "3. Nhấn phím F3 -> Modal Hướng dẫn quy trình mở ra."
    ],
    "expected": [
      "Các phím tắt hoạt động nhạy bén, ngăn chặn hành vi mặc định của trình duyệt (F1 help, F3 find)."
    ],
    "precondition": "Đang ở giao diện Dashboard DataEntry.",
    "testData": "Nhấn phím F1 (mở form nhập), Escape (đóng), F3 (mở hướng dẫn)."
  },
  {
    "id": "TC-DENT-003",
    "module": "M07",
    "priority": "P1",
    "name": "Form Nhập sổ sách ngoại lệ (DataEntryModal): Nhập hồi tố ngày giờ quá khứ",
    "platform": "Phân hệ Sổ sách DataEntry",
    "testData": "Giờ vào: 08:30 ngày 01/10/2026, Họ tên: \"Phạm Văn Đoàn\", CCCD: \"001099000555\".",
    "steps": [
      "1. Mở DataEntryModal (F1).",
      "2. Chọn ngày giờ vào trong quá khứ (Backdate).",
      "3. Chọn Trạm tiếp đón và Cán bộ trực tiếp nhận từ sổ ghi chép."
    ],
    "expected": [
      "Hệ thống cho phép lưu ngày giờ quá khứ hợp lệ, gán đúng trạm và cán bộ trực của thời điểm đó."
    ],
    "precondition": "DataEntryModal (F1) đang mở; Cần nhập hồ sơ khách từ sổ giấy tuần trước."
  },
  {
    "id": "TC-DENT-004",
    "module": "M07",
    "priority": "P1",
    "name": "Nhập đồng thời cả Check-in và Check-out (Khách đã vào và ra trong quá khứ)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "testData": "Tích chọn \"Đã check-out\", nhập Giờ ra: 11:30 ngày 01/10/2026.",
    "steps": [
      "1. Bật tùy chọn \"Đã hoàn tất Check-out (Khách đã ra về)\".",
      "2. Nhập giờ ra, chọn trạm ra và trạng thái thẻ (Đã trả / Nợ thẻ / Mất thẻ).",
      "3. Nhấn nút \"Lưu hồ sơ sổ sách\"."
    ],
    "expected": [
      "Lưu lượt khách với Status = 2 (Đã ra), CheckInTime và CheckOutTime đầy đủ.",
      "Không làm tăng quân số inside hiện tại của cơ quan."
    ],
    "precondition": "Khách trong sổ giấy đã vào và đã ra về trong quá khứ."
  },
  {
    "id": "TC-DENT-005",
    "module": "M07",
    "priority": "P1",
    "name": "Nhập chỉ Check-in (Khách vào qua đường ngoại lệ đang ở bên trong)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Tắt tùy chọn \"Đã hoàn tất Check-out\".",
      "2. Nhập giờ vào thực tế của khách.",
      "3. Nhấn Lưu hồ sơ."
    ],
    "expected": [
      "Lượt khách được tạo với Status = 1 (Trong đơn vị).",
      "Quân số Inside toàn hệ thống cập nhật tăng lên, trạm gác và admin đều nhìn thấy."
    ],
    "precondition": "Khách vào cơ quan qua đường ngoại lệ hiện vẫn đang ở bên trong.",
    "testData": "Bỏ tích \"Đã check-out\", chỉ nhập giờ vào."
  },
  {
    "id": "TC-DENT-006",
    "module": "M07",
    "priority": "P2",
    "name": "Nhập đoàn đông người, người đi cùng và nhiều phương tiện từ sổ trực",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Trong DataEntryModal, thêm 3 người đi cùng, 10 khách vô danh và 2 xe ô tô.",
      "2. Lưu hồ sơ."
    ],
    "expected": [
      "Tạo đầy đủ cấu trúc đoàn, thành viên và phương tiện trong CSDL SQLite."
    ],
    "precondition": "Sổ trực ghi nhận đoàn công tác 5 người và 2 ô tô.",
    "testData": "DataEntryModal: Nhập trưởng đoàn, thêm Người đi cùng và 2 xe cơ giới."
  },
  {
    "id": "TC-DENT-007",
    "module": "M07",
    "priority": "P1",
    "name": "Đóng dấu kiểm toán tự động (Audit Trail: createdByType = 1)",
    "platform": "Phân hệ Sổ sách DataEntry & Backend API",
    "steps": [
      "1. Tạo 1 hồ sơ từ trang /dataentry.html.",
      "2. Kiểm tra bản ghi trong CSDL hoặc qua API /admin/visits?createdByType=1."
    ],
    "expected": [
      "Bản ghi có CreatedByType = 1 (DataEntry), CreatedByName = \"nhaplieu\", CreatedLocation = phòng nhập, CreatedIpAddress = IP máy trạm."
    ],
    "precondition": "Tài khoản nhaplieu vừa tạo thành công một bản ghi sổ sách ngoại lệ.",
    "testData": "Kiểm tra bản ghi trong bảng VisitTransactions và Visits trong CSDL."
  },
  {
    "id": "TC-DENT-008",
    "module": "M07",
    "priority": "P2",
    "name": "Dashboard Sổ sách ngoại lệ: Thống kê và Bộ lọc chuyên sâu",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Sử dụng bộ lọc Trạng thái (Tất cả / Trong đơn vị / Đã ra), Lọc người nhập, Lọc thời gian trên DataEntryDashboard."
    ],
    "expected": [
      "Bảng danh sách lọc chính xác, hiển thị đầy đủ thông tin xuất xứ sổ sách."
    ],
    "precondition": "Dashboard DataEntry có nhiều bản ghi hồ sơ ngoại lệ.",
    "testData": "Sử dụng bộ lọc trạng thái (Inside / Outside) và bộ lọc thời gian."
  },
  {
    "id": "TC-DENT-009",
    "module": "M07",
    "priority": "P2",
    "name": "Bổ sung người đi cùng sổ sách qua DataEntrySupplementalModal",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Trên hồ sơ sổ sách đang inside, nhấn nút \"Thêm\".",
      "2. Thêm người đi cùng và phương tiện bổ sung."
    ],
    "expected": [
      "Cập nhật bổ sung thành công, gắn nhãn do tài khoản DataEntry thực hiện."
    ],
    "precondition": "Hồ sơ sổ sách đang ở trạng thái Inside; Cần bổ sung thành viên.",
    "testData": "Nhấp nút \"Bổ sung\" -> DataEntrySupplementalModal."
  },
  {
    "id": "TC-DENT-010",
    "module": "M07",
    "priority": "P2",
    "name": "Checkout sổ sách qua DataEntryCheckOutModal",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Trên hồ sơ sổ sách đang inside, nhấn nút \"Checkout\".",
      "2. Xác nhận thời gian ra và tình trạng thẻ."
    ],
    "expected": [
      "Hồ sơ chuyển trạng thái CheckedOut thành công từ giao diện DataEntry."
    ],
    "precondition": "Hồ sơ sổ sách đang ở trạng thái Inside; Khách làm thủ tục rời khỏi đơn vị.",
    "testData": "Nhấp nút \"Checkout\" -> DataEntryCheckOutModal."
  },
  {
    "id": "TC-DENT-011",
    "module": "M07",
    "priority": "P2",
    "name": "Thu hồi thẻ mất từ giao diện DataEntry",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Mở RecoverLostCardModal từ giao diện DataEntry.",
      "2. Tra cứu và hoàn tất thu hồi thẻ mất phát sinh từ hồ sơ sổ sách."
    ],
    "expected": [
      "Thẻ mất được thu hồi thành công, cập nhật kho thẻ dùng chung của đơn vị."
    ],
    "precondition": "Hồ sơ sổ sách có nợ thẻ an ninh.",
    "testData": "Nhấp nút \"Thu hồi thẻ mất\" trên thanh công cụ DataEntry."
  },
  {
    "id": "TC-DENT-012",
    "module": "M07",
    "priority": "P3",
    "name": "Xuất báo cáo Excel danh sách hồ sơ sổ sách đã nhập để đối soát",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Nhấn nút \"Xuất Excel\" trên Dashboard DataEntry."
    ],
    "expected": [
      "Tải về file Excel chứa toàn bộ danh sách hồ sơ sổ sách kèm người nhập, thời gian và địa điểm."
    ],
    "precondition": "Dashboard DataEntry đang hiển thị danh sách hồ sơ.",
    "testData": "Nhấp nút \"Xuất Excel\" trên Dashboard DataEntry."
  },
  {
    "id": "TC-DENT-013",
    "module": "M07",
    "priority": "P2",
    "name": "Xem chi tiết lượt khách sổ sách qua modal VisitDetailsModal",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Nhấn nút \"Chi tiết\" trên một dòng hồ sơ DataEntry."
    ],
    "expected": [
      "Mở VisitDetailsModal hiển thị đầy đủ thông tin, timeline và thành viên đồng bộ như trạm gác."
    ],
    "precondition": "Dashboard DataEntry đang hiển thị danh sách hồ sơ.",
    "testData": "Nhấp nút \"Chi tiết\" trên 1 dòng hồ sơ DataEntry."
  },
  {
    "id": "TC-DENT-014",
    "module": "M07",
    "priority": "P4",
    "name": "Kiểm tra ping phiên làm việc DataEntry định kỳ",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Đăng nhập tài khoản nhaplieu trên máy 1.",
      "2. Đăng nhập tài khoản nhaplieu trên máy 2 để chiếm phiên.",
      "3. Quan sát máy 1 sau 10 giây."
    ],
    "expected": [
      "Máy 1 ping API /admin/auth/status trả về 401 Unauthorized.",
      "Hệ thống bật thông báo phiên hết hạn và tự động chuyển về trang đăng nhập."
    ],
    "precondition": "Đang mở phiên làm việc DataEntry trên máy 1.",
    "testData": "Đăng nhập cùng tài khoản nhaplieu trên máy 2 để chiếm phiên; Quan sát máy 1."
  },
  {
    "id": "TC-DENT-015",
    "module": "M07",
    "priority": "P3",
    "name": "Sổ tay Quy trình & Hướng dẫn Nghiệp vụ Nhập liệu Ngoại lệ (DataEntryGuideTab)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Tại giao diện DataEntry, nhấp vào tab \"Hướng dẫn\" (hoặc nhấn phím tắt F3).",
      "2. Đọc các mục quy trình: Quy định nhập sổ hồi tố, xử lý khách nợ thẻ, đối soát sổ sách cuối ngày."
    ],
    "expected": [
      "DataEntryGuideTab hiển thị nội dung trực quan, có các ví dụ thực tế và quy chuẩn nhập liệu được định dạng rõ ràng."
    ],
    "precondition": "Giao diện DataEntry đang mở.",
    "testData": "Nhấp tab \"Hướng dẫn\" (hoặc nhấn phím F3) để mở DataEntryGuideTab."
  },
  {
    "id": "TC-DENT-016",
    "module": "M07",
    "priority": "P2",
    "name": "Bộ lọc Gộp Nguồn và Người tạo cuộc viếng thăm (originFilter)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Tại Dashboard DataEntry, chọn dropdown \"Nguồn & Người tạo\" (originFilter).",
      "2. Chọn lọc \"Tất cả\", \"Chỉ trạm gác trực tiếp\", hoặc \"Tài khoản nhập liệu cụ thể (nhaplieu)\".",
      "3. Quan sát danh sách lượt khách hiển thị."
    ],
    "expected": [
      "Bảng danh sách lọc chính xác theo trường createdByType và createdBy, hiển thị đúng các hồ sơ tương ứng."
    ],
    "precondition": "Dashboard DataEntry đang hiển thị danh sách lượt khách.",
    "testData": "Dropdown originFilter: Chọn lọc \"Chỉ Trạm gác\" hoặc \"Chỉ tài khoản nhaplieu\"."
  },
  {
    "id": "TC-ADMN-001",
    "module": "M08",
    "priority": "P4",
    "name": "Giao diện Quản trị Admin mới: Sidebar thu gọn/mở rộng & Trạng thái Online",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Đăng nhập trang Admin (/index.html hoặc /admin.html).",
      "2. Nhấn nút thu gọn Sidebar (ChevronLeft) rồi mở rộng lại (ChevronRight)."
    ],
    "expected": [
      "Sidebar thu nhỏ mượt mà sang dạng icon (w-18) và mở rộng (w-64).",
      "Footer hiển thị chỉ thị Online với hiệu ứng pulsing xanh lá và đồng hồ thời gian thực."
    ],
    "precondition": "Đăng nhập trang Quản trị Admin (/index.html hoặc /admin.html) thành công.",
    "testData": "Nhấp nút thu gọn Sidebar (ChevronLeft) rồi mở rộng lại (ChevronRight)."
  },
  {
    "id": "TC-ADMN-002",
    "module": "M08",
    "priority": "P1",
    "name": "Hub Giám sát - Lịch sử Lượt thăm (HistoryTab): Master-Detail tra cứu siêu tốc",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào tab Giám sát & Tra cứu -> chọn sub-tab \"Lịch sử lượt thăm\".",
      "2. Tìm kiếm theo tên khách, lọc theo khoảng ngày, lọc trạng thái."
    ],
    "expected": [
      "Bảng lịch sử Master-Detail tải nhanh chóng, phân trang mượt mà.",
      "Nhấp xem chi tiết mở modal VisitDetailsModal đầy đủ dữ liệu."
    ],
    "precondition": "Hub Giám sát -> Tab \"Lịch sử Lượt thăm (HistoryTab)\" đang mở.",
    "testData": "Nhập từ khóa tra cứu \"An\", chọn lọc ngày trong tuần."
  },
  {
    "id": "TC-ADMN-003",
    "module": "M08",
    "priority": "P1",
    "name": "Hub Giám sát - Giám sát Ca trực (ShiftsTab): Xem ảnh webcam vào/ra ca",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào tab Giám sát & Tra cứu -> chọn sub-tab \"Giám sát ca trực\".",
      "2. Quan sát danh sách các ca trực của các trạm gác.",
      "3. Nhấp xem ảnh mở ca và ảnh kết thúc ca."
    ],
    "expected": [
      "Hiển thị rõ ràng: Tên trạm, Cán bộ trực, Giờ bắt đầu, Giờ kết thúc, Thời lượng ca trực.",
      "Ảnh chụp webcam lúc vào ca và ra ca hiển thị rõ nét, chứng minh cán bộ có mặt thực tế tại trạm."
    ],
    "precondition": "Cán bộ trực ban đã mở và đóng ca trực kèm ảnh webcam.",
    "testData": "Hub Giám sát -> Tab \"Giám sát Ca trực (ShiftsTab)\": Xem ảnh vào/ra ca."
  },
  {
    "id": "TC-ADMN-004",
    "module": "M08",
    "priority": "P1",
    "name": "Hub Giám sát - Đối soát Ngoại lệ (AuditEntryTab): Kiểm tra hồ sơ do DataEntry tạo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào tab Giám sát & Tra cứu -> chọn sub-tab \"Đối soát ngoại lệ\".",
      "2. Quan sát danh sách các bản ghi có CreatedByType = 1."
    ],
    "expected": [
      "Bảng hiển thị chi tiết: Người nhập (nhaplieu), Thời gian tạo, Địa chỉ IP, Vị trí máy trạm, Thông tin khách.",
      "Giúp cán bộ thanh tra phát hiện các sai lệch hoặc gian lận trong việc nhập khống hồ sơ sổ sách."
    ],
    "precondition": "Nhân viên nhập liệu đã tạo các bản ghi ngoại lệ qua DataEntry.",
    "testData": "Hub Giám sát -> Tab \"Đối soát Ngoại lệ (AuditEntryTab)\": Kiểm tra dấu vết kiểm toán."
  },
  {
    "id": "TC-ADMN-005",
    "module": "M08",
    "priority": "P2",
    "name": "Xuất Báo cáo Đối soát Ngoại lệ ra file Excel và PDF",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại AuditEntryTab, nhấn nút \"Xuất Excel\" và \"Xuất PDF\"."
    ],
    "expected": [
      "Xuất thành công file báo cáo đối soát có tiêu đề \"Báo cáo Đối soát Hồ sơ Nhập liệu Sổ sách Ngoại lệ\" kèm metadata ngày giờ lọc."
    ],
    "precondition": "Tab AuditEntryTab đang hiển thị danh sách hồ sơ đối soát.",
    "testData": "Nhấp nút \"Xuất Excel\" và \"Xuất PDF\"."
  },
  {
    "id": "TC-ADMN-006",
    "module": "M08",
    "priority": "P1",
    "name": "Hub Danh mục - Quản lý Cán bộ Trực ban (StaffManagement): Thêm, sửa, đổi phòng ban",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào tab Quản lý tài khoản -> chọn \"Tài khoản Cán bộ Trực ban\".",
      "2. Thêm mới nhân viên trạm: Nhập Họ tên, Mã nhân viên (Nv002), CCCD, Số điện thoại, Phòng ban.",
      "3. Nhấn Lưu."
    ],
    "expected": [
      "Nhân viên mới được thêm vào danh sách, có thể dùng tài khoản này để đăng nhập tại trạm gác."
    ],
    "precondition": "Hub Danh mục -> Tab \"Cán bộ Trực ban (StaffManagement)\" đang mở.",
    "testData": "Thêm mới nhân viên: Mã \"NV004\", Họ tên \"Đỗ Minh Đức\", Tên đăng nhập \"Nv004a4\"."
  },
  {
    "id": "TC-ADMN-007",
    "module": "M08",
    "priority": "P2",
    "name": "Cấp quyền Dự phòng dùng CCCD mở ca (AllowCccdShiftAuth) cho cán bộ trạm",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Mở sửa thông tin nhân viên trong StaffManagement.",
      "2. Bật cờ \"Cho phép dùng CCCD mở ca (AllowCccdShiftAuth)\".",
      "3. Lưu thay đổi."
    ],
    "expected": [
      "Nhân viên này khi đăng nhập tại trạm sẽ có quyền dùng CCCD mở ca thay cho webcam."
    ],
    "precondition": "Form hồ sơ nhân viên trong StaffManagement đang mở.",
    "testData": "Tích chọn cờ \"Cho phép dùng CCCD mở ca dự phòng (AllowCccdShiftAuth)\"."
  },
  {
    "id": "TC-ADMN-008",
    "module": "M08",
    "priority": "P3",
    "name": "Tải lên Ảnh thẻ đại diện cho cán bộ trực ban (Upload Avatar Photo)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại form nhân viên, nhấp tải ảnh chân dung từ máy tính lên.",
      "2. Lưu hồ sơ."
    ],
    "expected": [
      "Ảnh thẻ được tải lên thư mục /uploads/staff/..., hiển thị trên Header trạm gác khi nhân viên trực."
    ],
    "precondition": "Form hồ sơ nhân viên trong StaffManagement đang mở.",
    "testData": "Tải lên file ảnh thẻ chân dung (avatar.jpg) từ máy tính cá nhân."
  },
  {
    "id": "TC-ADMN-009",
    "module": "M08",
    "priority": "P4",
    "name": "Nhập danh sách cán bộ hàng loạt từ file Excel (Import Staff Excel)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút \"Import Excel\" trong StaffManagement.",
      "2. Chọn file Excel danh sách nhân sự mẫu.",
      "3. Xác nhận import."
    ],
    "expected": [
      "Hệ thống đọc dữ liệu file Excel và thêm hàng loạt nhân viên vào hệ thống, hiển thị báo cáo số dòng thành công."
    ],
    "precondition": "Có file Excel danh sách cán bộ theo mẫu chuẩn.",
    "testData": "Nhấp nút \"Import Excel\" trong StaffManagement -> Chọn file Excel -> Thực hiện."
  },
  {
    "id": "TC-ADMN-010",
    "module": "M08",
    "priority": "P2",
    "name": "Xóa hàng loạt nhân sự đã nghỉ việc (Bulk Delete Staff)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tích chọn nhiều nhân viên trong danh mục.",
      "2. Nhấn nút \"Xóa đã chọn\", xác nhận trong hộp thoại bảo vệ."
    ],
    "expected": [
      "Các tài khoản nhân viên được xóa hoặc chuyển trạng thái không hoạt động an toàn."
    ],
    "precondition": "Danh sách nhân viên có các nhân sự đã điều chuyển công tác.",
    "testData": "Tích chọn nhiều nhân viên -> Nhấn nút \"Xóa đã chọn\" (Bulk Delete)."
  },
  {
    "id": "TC-ADMN-011",
    "module": "M08",
    "priority": "P1",
    "name": "Hub Danh mục - Quản lý Tài khoản Quản trị & Nhập liệu (AccountsTab)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào tab Quản lý tài khoản -> chọn \"Tài khoản Quản trị & Nhập liệu\".",
      "2. Thêm mới tài khoản: Tên đăng nhập, Mật khẩu, Vai trò (Admin hoặc DataEntry)."
    ],
    "expected": [
      "Tạo tài khoản thành công với mật khẩu băm an toàn."
    ],
    "precondition": "Hub Danh mục -> Tab \"Tài khoản Quản trị & Nhập liệu (AccountsTab)\" đang mở.",
    "testData": "Thêm mới user: Username \"nhaplieu2\", Role \"DataEntry\", Password \"123456\"."
  },
  {
    "id": "TC-ADMN-012",
    "module": "M08",
    "priority": "P1",
    "name": "Đổi mật khẩu tài khoản Admin và Đổi mật khẩu / Reset mật khẩu cho user khác",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút \"Đổi mật khẩu\" trên thanh topbar hoặc trong danh sách tài khoản.",
      "2. Nhập mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới."
    ],
    "expected": [
      "Đổi mật khẩu thành công, lần đăng nhập sau phải dùng mật khẩu mới."
    ],
    "precondition": "Đang đăng nhập tài khoản Admin.",
    "testData": "Nhấp \"Đổi mật khẩu\" trên Topbar hoặc Reset mật khẩu cho user khác."
  },
  {
    "id": "TC-ADMN-013",
    "module": "M08",
    "priority": "P1",
    "name": "Phân quyền vai trò DataEntry: Chặn truy cập cấu hình hệ thống và backup",
    "platform": "Giao diện Quản trị Admin & API",
    "testData": "Thử gọi API /admin/backup hoặc truy cập menu Cài đặt hệ thống.",
    "steps": [
      "1. Dùng token tài khoản DataEntry gọi API /admin/backup hoặc truy cập menu Cài đặt hệ thống."
    ],
    "expected": [
      "Hệ thống ẩn menu cấu hình hoặc phản hồi 403 Forbidden: Tài khoản DataEntry chỉ có quyền xem và nhập liệu."
    ],
    "precondition": "Đăng nhập tài khoản vai trò DataEntry."
  },
  {
    "id": "TC-ADMN-014",
    "module": "M08",
    "priority": "P2",
    "name": "Khóa (Deactivate) tài khoản người dùng",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tắt công tắc kích hoạt (IsActive) của một tài khoản.",
      "2. Thử dùng tài khoản đó đăng nhập."
    ],
    "expected": [
      "Hệ thống từ chối đăng nhập với thông báo tài khoản bị khóa."
    ],
    "precondition": "Tab AccountsTab đang mở.",
    "testData": "Tắt công tắc kích hoạt (IsActive = false) của một tài khoản."
  },
  {
    "id": "TC-ADMN-015",
    "module": "M08",
    "priority": "P1",
    "name": "Cưỡng bức Check-out từ Phân hệ Quản trị Admin (InsideTab - handleForceCheckout)",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Admin InsideTab: Nhấp \"Cưỡng bức Check-out\" cho lượt khách -> Xác nhận.",
    "steps": [
      "1. Truy cập tab \"Khách trong đơn vị\" (InsideTab) trên Admin.",
      "2. Tìm lượt khách cần đóng cưỡng bức, nhấp nút \"Cưỡng bức Check-out\".",
      "3. Xác nhận trong hộp thoại bảo vệ: \"Admin cưỡng bức check-out từ trang Giám sát\"."
    ],
    "expected": [
      "Hệ thống gọi API POST /admin/visits/{id}/checkout ghi nhận checkOutTime hiện tại và ghi chú cưỡng bức của Admin.",
      "Lượt khách được đóng trạng thái thành công, danh sách bên trong cập nhật thời gian thực."
    ],
    "precondition": "Khách đã rời khỏi đơn vị nhưng trạm gác quên checkout hoặc trường hợp khẩn cấp."
  },
  {
    "id": "TC-ADMN-016",
    "module": "M08",
    "priority": "P2",
    "name": "Quản lý Danh mục Cổng & Trạm Trực ban (StationsTab)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Truy cập tab \"Cổng & Trạm\" (StationsTab) thuộc Hub Danh mục.",
      "2. Xem danh sách toàn bộ các cổng trạm trong đơn vị.",
      "3. Nhấp \"Sửa\" một trạm: đổi tên trạm, đổi vị trí địa lý hoặc bật/tắt kích hoạt (isActive).",
      "4. Nhấn \"Lưu thay đổi\"."
    ],
    "expected": [
      "Hệ thống gọi API PUT /admin/stations/{id} thành công.",
      "Tên và thông tin trạm cập nhật tức thì trên toàn bộ hệ thống."
    ],
    "precondition": "Hub Danh mục -> Tab \"Cổng & Trạm Trực ban (StationsTab)\" đang mở.",
    "testData": "Sửa tên trạm \"STATION_A\" thành \"Cổng số 1 - Trực ban\", cập nhật vị trí -> Lưu."
  },
  {
    "id": "TC-ADMN-017",
    "module": "M08",
    "priority": "P3",
    "name": "Giám sát Tình trạng Kết nối Phần cứng Ngoại vi Thời gian thực (Hardware Status)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại Dashboard Admin, quan sát card Giám sát Phần cứng (Hardware Status).",
      "2. Nhấp xem chi tiết modal Trạng thái Thiết bị (showHardwareModal)."
    ],
    "expected": [
      "Hệ thống truy vấn API GET /admin/system/hardware-status, phản ánh chính xác trạng thái Online/Offline của: Đầu đọc chip CCCD, Đầu đọc thẻ RFID, Máy quét mã QR 2D và Camera."
    ],
    "precondition": "Admin DashboardTab đang mở.",
    "testData": "Quan sát card \"Hardware Status\" và nhấp mở modal chi tiết trạng thái thiết bị."
  },
  {
    "id": "TC-REPT-001",
    "module": "M09",
    "priority": "P1",
    "name": "Trung tâm Báo cáo (ReportsTab): Chu kỳ hành chính chuẩn Việt Nam",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào tab Báo cáo & Phân tích.",
      "2. Lần lượt chọn các chu kỳ: \"Hôm nay\", \"Hôm qua\", \"Tuần này\", \"Tháng này\", \"Quý này\", \"Cả năm\"."
    ],
    "expected": [
      "Hệ thống tự động tính toán chính xác ngày bắt đầu và ngày kết thúc tương ứng chu kỳ hành chính Việt Nam.",
      "Dữ liệu báo cáo cập nhật đồng bộ."
    ],
    "precondition": "Admin -> Tab Trung tâm Báo cáo (ReportsTab) đang mở.",
    "testData": "Dropdown chu kỳ: Chọn lần lượt \"Hôm nay\", \"Hôm qua\", \"Tuần này\", \"Tháng này\", \"Quý này\", \"Năm nay\"."
  },
  {
    "id": "TC-REPT-002",
    "module": "M09",
    "priority": "P2",
    "name": "Lọc theo Khoảng ngày tùy chọn và Lọc theo Nhiều ngày rời rạc (discrete_dates)",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Chọn chế độ \"Nhiều ngày rời rạc (discrete_dates)\": Chọn ngày 02/09 và ngày 30/04.",
    "steps": [
      "1. Chuyển chế độ lọc ngày sang \"Chọn nhiều ngày rời rạc (discrete_dates)\".",
      "2. Thêm từng ngày vào danh sách lọc.",
      "3. Áp dụng."
    ],
    "expected": [
      "Báo cáo lọc chính xác các lượt khách ra/vào đúng trong 3 ngày đã chọn, bỏ qua các ngày xen giữa."
    ],
    "precondition": "ReportsTab đang mở; Cần báo cáo cho các ngày lễ hội rời rạc."
  },
  {
    "id": "TC-REPT-003",
    "module": "M09",
    "priority": "P2",
    "name": "Lọc đa chiều: Cán bộ trực ban, Nguồn (Trực ban vs Sổ sách), Trạng thái thẻ, Phương tiện",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Kết hợp lọc theo Cán bộ trực ban cụ thể.",
      "2. Lọc nguồn: Chỉ xem lượt khách từ \"Trực ban cổng\" hoặc \"Sổ sách ngoại lệ\".",
      "3. Lọc trạng thái thẻ: \"Thẻ đã trả\", \"Thẻ đang nợ\", \"Thẻ báo mất\"."
    ],
    "expected": [
      "Bộ lọc đa chiều kết hợp chuẩn xác, đáp ứng yêu cầu thanh tra kiểm tra chuyên sâu."
    ],
    "precondition": "ReportsTab đang mở.",
    "testData": "Lọc kết hợp: Nguồn \"Sổ sách\", Trạng thái thẻ \"Nợ thẻ\", Phương tiện \"Có xe\"."
  },
  {
    "id": "TC-REPT-004",
    "module": "M09",
    "priority": "P1",
    "name": "Báo cáo Chuyên đề Thẻ Mất (LostCardsReportModal)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại ReportsTab, nhấn nút \"Báo cáo Thẻ mất\".",
      "2. Modal LostCardsReportModal mở ra."
    ],
    "expected": [
      "Hiển thị danh sách tổng hợp toàn bộ các thẻ an ninh đang bị báo mất trên toàn hệ thống.",
      "Liệt kê chi tiết: Mã thẻ, Họ tên khách làm mất, CCCD, SĐT, Trạm tiếp nhận, Thời gian mất, Trạng thái thu hồi."
    ],
    "precondition": "Trong đơn vị có các trường hợp báo mất thẻ an ninh.",
    "testData": "Nhấp nút \"Báo cáo Thẻ mất\" để mở LostCardsReportModal."
  },
  {
    "id": "TC-REPT-005",
    "module": "M09",
    "priority": "P1",
    "name": "Xuất Báo cáo Lịch sử ra file Excel chuyên nghiệp (ExcelJS)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút \"Xuất Excel\" trong ReportsTab."
    ],
    "expected": [
      "File Excel (.xlsx) được tạo với thư viện ExcelJS.",
      "Bảng tính có tiêu đề cơ quan, ngày lập báo cáo, khung viền bảng, định dạng căn giữa ngày giờ, tự động co giãn cột."
    ],
    "precondition": "Bảng báo cáo đang hiển thị kết quả lọc.",
    "testData": "Nhấp nút \"Xuất Excel\" (sử dụng thư viện ExcelJS định dạng bảng biểu chuyên nghiệp)."
  },
  {
    "id": "TC-REPT-006",
    "module": "M09",
    "priority": "P1",
    "name": "Xuất Báo cáo Lịch sử ra file PDF in ấn chuẩn tiếng Việt có dấu (jsPDF + fontBase64)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút \"Xuất PDF\" trong ReportsTab."
    ],
    "expected": [
      "Tạo file PDF in ấn trực tiếp bằng jsPDF + autoTable.",
      "Nhúng font chữ tiếng Việt fontBase64, hiển thị hoàn toàn chuẩn xác không bị lỗi font chữ có dấu."
    ],
    "precondition": "Bảng báo cáo đang hiển thị kết quả lọc.",
    "testData": "Nhấp nút \"Xuất PDF\" (sử dụng jsPDF + fontBase64 tiếng Việt có dấu)."
  },
  {
    "id": "TC-REPT-007",
    "module": "M09",
    "priority": "P2",
    "name": "Xuất Báo cáo Thẻ mất ra Excel phục vụ công tác thanh tra tài sản",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Trong modal Báo cáo Thẻ mất, nhấn nút \"Xuất Excel\"."
    ],
    "expected": [
      "Tải về file Excel danh sách chi tiết các thẻ an ninh thất lạc để bàn giao cho bộ phận quản trị cơ sở vật chất."
    ],
    "precondition": "Modal LostCardsReportModal đang mở.",
    "testData": "Nhấp nút \"Xuất Excel\" trong modal Báo cáo thẻ mất."
  },
  {
    "id": "TC-REPT-008",
    "module": "M09",
    "priority": "P3",
    "name": "Dashboard Admin đồ thị thống kê lưu lượng khách",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Xem Bảng điều khiển (DashboardTab) trên trang Admin."
    ],
    "expected": [
      "Hiển thị đồ thị trực quan: Phân bố lưu lượng khách theo khung giờ trong ngày, tỷ lệ phương tiện xe ô tô/xe máy, tỷ lệ hoàn trả thẻ."
    ],
    "precondition": "Admin DashboardTab đang mở.",
    "testData": "Quan sát đồ thị Bar chart lưu lượng khách theo giờ và Doughnut chart cơ cấu xe."
  },
  {
    "id": "TC-REPT-009",
    "module": "M09",
    "priority": "P4",
    "name": "Xuất báo cáo danh sách ca trực ra Excel phục vụ chấm công",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại ShiftsTab, nhấn nút xuất file danh sách ca trực."
    ],
    "expected": [
      "File Excel xuất ra chứa chi tiết thời lượng từng ca trực, cán bộ trực để phòng tổ chức cán bộ đối soát chấm công."
    ],
    "precondition": "Hub Giám sát -> Tab ShiftsTab đang mở.",
    "testData": "Nhấp nút \"Xuất Excel\" danh sách ca trực."
  },
  {
    "id": "TC-REPT-010",
    "module": "M09",
    "priority": "P3",
    "name": "Khả năng lọc tìm kiếm từ khóa kết hợp trong Trung tâm Báo cáo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhập từ khóa kết hợp trong ô tìm kiếm của ReportsTab."
    ],
    "expected": [
      "Dữ liệu báo cáo lọc tức thì theo từ khóa nhập vào."
    ],
    "precondition": "ReportsTab đang mở.",
    "testData": "Ô tìm kiếm từ khóa báo cáo: Gõ \"Bộ Công An\", \"30A-999\"."
  },
  {
    "id": "TC-REPT-011",
    "module": "M09",
    "priority": "P2",
    "name": "Mở xem chi tiết bất kỳ lượt khách nào trực tiếp từ bảng Báo cáo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấp nút xem chi tiết trên một dòng trong bảng Báo cáo."
    ],
    "expected": [
      "Mở VisitDetailsModal của lượt khách đó với đầy đủ 3 tab Tổng quan, Timeline và Thành viên."
    ],
    "precondition": "ReportsTab đang hiển thị danh sách kết quả.",
    "testData": "Nhấp nút \"Chi tiết\" trên một dòng báo cáo bất kỳ."
  },
  {
    "id": "TC-REPT-012",
    "module": "M09",
    "priority": "P4",
    "name": "Kiểm tra định dạng chuẩn tên file xuất báo cáo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Xuất file và kiểm tra tên file được tải về máy tính."
    ],
    "expected": [
      "Tên file tuân thủ quy tắc chuẩn: \"SmartVMS_BaoCao_LichSu_[NgayLapp].xlsx\" hoặc \"SmartVMS_TheMat_[Ngay].xlsx\"."
    ],
    "precondition": "Thực hiện xuất báo cáo ra file Excel hoặc PDF.",
    "testData": "Quan sát tên file tải về trong thư mục Downloads của trình duyệt."
  },
  {
    "id": "TC-REPT-013",
    "module": "M09",
    "priority": "P3",
    "name": "Đóng/mở khối bộ lọc báo cáo (Filter Collapse toggle) để tăng không gian xem bảng",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút thu gọn bộ lọc trên đầu trang ReportsTab."
    ],
    "expected": [
      "Khối bộ lọc thu gọn lại, bảng dữ liệu mở rộng tối đa màn hình."
    ],
    "precondition": "ReportsTab đang mở với khối bộ lọc chiếm nhiều diện tích.",
    "testData": "Nhấp nút \"Thu gọn bộ lọc\" (Filter Collapse toggle)."
  },
  {
    "id": "TC-SETT-001",
    "module": "M10",
    "priority": "P3",
    "name": "Cấu hình Vận hành (SettingsOperationPanel): Tên hệ thống & Cổng trực mặc định",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào Trung tâm Cài đặt -> Cấu hình Vận hành & Thiết bị.",
      "2. Đổi tên hệ thống thành \"CỔNG KIỂM SOÁT AN NINH ĐƠN VỊ X\".",
      "3. Lưu cấu hình."
    ],
    "expected": [
      "Lưu thành công. Tiêu đề trên Header của trạm gác và admin tự động cập nhật tên mới."
    ],
    "precondition": "Trung tâm Cài đặt -> Tab \"Vận hành & Nghiệp vụ (SettingsOperationPanel)\" đang mở.",
    "testData": "Đổi tên hệ thống hiển thị: \"Hệ thống Quản lý Khách Ra Vào Cổng An Ninh\", Mã trạm: \"STATION_A\"."
  },
  {
    "id": "TC-SETT-002",
    "module": "M10",
    "priority": "P3",
    "name": "Cấu hình Giới hạn Thời gian lưu trú cảnh báo",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Cấu hình thời gian lưu trú tối đa cảnh báo = 12 giờ.",
    "steps": [
      "1. Thiết lập thời gian lưu trú cảnh báo = 8 giờ.",
      "2. Lưu cài đặt."
    ],
    "expected": [
      "Khi khách ở trong cơ quan quá 8 giờ, hệ thống đánh dấu cảnh báo màu cam trên Dashboard."
    ],
    "precondition": "SettingsOperationPanel đang mở."
  },
  {
    "id": "TC-SETT-003",
    "module": "M10",
    "priority": "P3",
    "name": "Cấu hình Chính sách Thẻ an ninh",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Thiết lập quy định thẻ an ninh (bắt buộc cấp thẻ hoặc tùy chọn)."
    ],
    "expected": [
      "Giao diện Check-in tuân thủ chính sách thẻ đã được thiết lập."
    ],
    "precondition": "SettingsOperationPanel đang mở.",
    "testData": "Bật CHECKOUT_DEFAULT_SELECT_ALL = true, ALLOW_LATE_CARD_RETURN_NAMED = true."
  },
  {
    "id": "TC-SETT-004",
    "module": "M10",
    "priority": "P1",
    "name": "Trung tâm Sao lưu CSDL (BackupTab): Thực hiện Sao lưu thủ công",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào Trung tâm Cài đặt -> chọn tab \"Dữ liệu & Sao lưu CSDL\".",
      "2. Nhấn nút \"Tạo bản sao lưu ngay\"."
    ],
    "expected": [
      "Gọi API /admin/backup, hệ thống C# sao chép CSDL SQLite sang file sao lưu .bak có gắn mốc thời gian.",
      "File sao lưu xuất hiện ngay trên bảng danh sách lịch sử sao lưu."
    ],
    "precondition": "Trung tâm Cài đặt -> Tab \"Dữ liệu & Sao lưu CSDL (BackupTab)\" đang mở.",
    "testData": "Nhấp nút \"Tạo bản sao lưu ngay\"."
  },
  {
    "id": "TC-SETT-005",
    "module": "M10",
    "priority": "P2",
    "name": "Tải file sao lưu (Download Backup) về máy tính cá nhân",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại danh sách các bản backup, nhấn biểu tượng Tải về cạnh bản sao lưu vừa tạo."
    ],
    "expected": [
      "Trình duyệt tải file CSDL .bak về máy tính của quản trị viên an toàn."
    ],
    "precondition": "Danh sách lịch sử sao lưu có ít nhất 1 file .bak.",
    "testData": "Nhấp biểu tượng Tải về (Download) cạnh bản sao lưu."
  },
  {
    "id": "TC-SETT-006",
    "module": "M10",
    "priority": "P1",
    "name": "Khôi phục Dữ liệu (Restore Database) từ bản sao lưu",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Chọn 1 bản sao lưu trong danh sách.",
      "2. Nhấn nút \"Khôi phục dữ liệu\", xác nhận cảnh báo an toàn."
    ],
    "expected": [
      "Hệ thống C# tự động tạo 1 bản backup dự phòng trước khi khôi phục, sau đó nạp lại CSDL.",
      "Toàn bộ dữ liệu được hoàn nguyên về đúng thời điểm của bản sao lưu."
    ],
    "precondition": "Quản trị viên có file sao lưu hợp lệ cần phục hồi CSDL.",
    "testData": "Nhấp nút \"Khôi phục dữ liệu\" -> Chọn file backup -> Xác nhận cảnh báo."
  },
  {
    "id": "TC-SETT-007",
    "module": "M10",
    "priority": "P2",
    "name": "Cấu hình Lịch Tự động Sao lưu (Auto Backup định kỳ)",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Bật công tắc Tự động sao lưu, đặt chu kỳ = 24 giờ, số bản lưu tối đa = 30 bản.",
    "steps": [
      "1. Bật công tắc Auto Backup, đặt giờ sao lưu tự động và số bản tối đa.",
      "2. Lưu cài đặt."
    ],
    "expected": [
      "Hệ thống lưu cấu hình vào CSDL. Background Service tự động chạy theo lịch đã đặt."
    ],
    "precondition": "Tab BackupTab đang mở."
  },
  {
    "id": "TC-SETT-008",
    "module": "M10",
    "priority": "P3",
    "name": "Quản lý Bản sao lưu cũ: Xem dung lượng và Xóa bản backup",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Kiểm tra dung lượng từng bản sao lưu trong danh sách.",
      "2. Nhấn biểu tượng Thùng rác để xóa bản sao lưu cũ không còn dùng."
    ],
    "expected": [
      "File backup bị xóa khỏi ổ cứng máy chủ, danh sách cập nhật ngay lập tức."
    ],
    "precondition": "Danh sách backup có các bản sao lưu cũ không còn nhu cầu sử dụng.",
    "testData": "Nhấp biểu tượng Thùng rác (Xóa) cạnh bản sao lưu cũ -> Xác nhận."
  },
  {
    "id": "TC-SETT-009",
    "module": "M10",
    "priority": "P4",
    "name": "Kiểm tra và cấu hình đường dẫn thư mục lưu trữ sao lưu",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Kiểm tra cấu hình đường dẫn thư mục lưu trữ backup trên máy chủ qua API /admin/browse-folder."
    ],
    "expected": [
      "Đường dẫn hợp lệ và có quyền ghi trên ổ đĩa máy chủ Windows."
    ],
    "precondition": "Tab BackupTab đang mở.",
    "testData": "Cấu hình đường dẫn thư mục lưu trữ: \"C:\\SmartVMSLocalData\\backups\"."
  },
  {
    "id": "TC-SETT-010",
    "module": "M10",
    "priority": "P1",
    "name": "Hộp thoại cảnh báo xác nhận an toàn trước khi khôi phục CSDL",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút Khôi phục dữ liệu."
    ],
    "expected": [
      "Hộp thoại cảnh báo hiển thị rõ ràng rủi ro ghi đè dữ liệu, yêu cầu quản trị viên xác nhận rõ ràng mới thực thi."
    ],
    "precondition": "Nhấp nút \"Khôi phục dữ liệu\" trên giao diện Backup.",
    "testData": "Quan sát hộp thoại cảnh báo rủi ro ghi đè dữ liệu."
  },
  {
    "id": "TC-SETT-011",
    "module": "M10",
    "priority": "P2",
    "name": "Tự động tạo bản backup dự phòng trước khi thực hiện restore",
    "platform": "API / Backend C#",
    "steps": [
      "1. Thực hiện lệnh restore qua API /admin/restore."
    ],
    "expected": [
      "Backend C# tự động tạo một file \"pre_restore_backup_...\" trước khi ghi đè CSDL, đảm bảo có thể rollback nếu cần."
    ],
    "precondition": "Thực hiện lệnh khôi phục CSDL qua API /admin/restore.",
    "testData": "Kiểm tra thư mục backups xem có file \"pre_restore_backup_...\" được tự động sinh ra không."
  },
  {
    "id": "TC-SETT-012",
    "module": "M10",
    "priority": "P4",
    "name": "Kiểm tra dung lượng CSDL và trạng thái kết nối SQLite",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Quan sát card thông tin dung lượng file SQLite trong BackupTab."
    ],
    "expected": [
      "Hiển thị chính xác kích thước file CSDL (vd: 15.4 MB) và trạng thái kết nối SQLite bình thường."
    ],
    "precondition": "Tab BackupTab đang mở.",
    "testData": "Quan sát card thông tin dung lượng file SQLite và trạng thái kết nối."
  },
  {
    "id": "TC-SETT-013",
    "module": "M10",
    "priority": "P2",
    "name": "Cấu hình Hồ sơ Thiết bị Đọc thẻ (Device Profiles: W3, EA09N, EA09/W4 LAN)",
    "platform": "Giao diện Quản trị Admin (SettingsDevicePanel)",
    "steps": [
      "1. Truy cập Trung tâm Cài đặt -> tab \"Thiết bị ngoại vi\".",
      "2. Chọn 1 trong 3 mẫu hồ sơ thiết bị: W3 (USB HID), EA09N (Serial COM), hoặc EA09_W4_SOCKETIO (LAN Socket.io).",
      "3. Cấu hình Socket.IO URL và LAN Domain Name (mặc định: smartvms).",
      "4. Nhấn \"Lưu cấu hình\"."
    ],
    "expected": [
      "Hệ thống gọi API PUT /admin/device-profile lưu cấu hình thành công.",
      "Thông số thiết bị được đồng bộ tới trạm gác và DeviceService."
    ],
    "precondition": "Trung tâm Cài đặt -> Tab \"Thiết bị ngoại vi (SettingsDevicePanel)\" đang mở.",
    "testData": "Chọn hồ sơ: W3 (USB HID), EA09N (Serial COM), hoặc EA09_W4_SOCKETIO (LAN Socket.io); Cấu hình Socket.IO URL."
  },
  {
    "id": "TC-SETT-014",
    "module": "M10",
    "priority": "P3",
    "name": "Duyệt Thư mục Lưu trữ Máy chủ & Giám sát Dung lượng Ổ đĩa (Browse Folder & Disk Space)",
    "platform": "Giao diện Quản trị Admin (SettingsBackupPanel)",
    "steps": [
      "1. Tại tab Sao lưu, nhấp nút \"Duyệt thư mục\" (FolderOpen) tại ô Thư mục sao lưu hoặc Thư mục ảnh ca trực.",
      "2. Quan sát thanh dung lượng ổ cứng (Drive Total GB, Used GB, Free percent)."
    ],
    "expected": [
      "Hệ thống truy vấn API GET /admin/browse-folder trả về danh sách thư mục hợp lệ trên hệ thống tập tin máy chủ Windows.",
      "Dung lượng ổ cứng cập nhật chính xác theo thực tế phần cứng."
    ],
    "precondition": "Tab BackupTab đang mở.",
    "testData": "Nhấp nút \"Duyệt thư mục\" (FolderOpen) -> Quan sát thanh % dung lượng ổ đĩa máy chủ."
  },
  {
    "id": "TC-SETT-015",
    "module": "M10",
    "priority": "P2",
    "name": "Cập nhật Tên miền Đơn vị và Tự động cấp mới Chứng chỉ SSL (SystemAdmin UpdateDomain)",
    "platform": "API / Quản trị Hệ thống",
    "testData": "Gửi request POST /api/SystemAdmin/update-domain với payload {\"domain\": \"smartvms.lan\"}.",
    "steps": [
      "1. Gửi request POST /api/SystemAdmin/update-domain với payload {\"domain\": \"smartvms.local\"}.",
      "2. Quan sát log hệ thống và trạng thái dịch vụ."
    ],
    "expected": [
      "Hệ thống ghi nhận tên miền mới vào appsettings.json, tự động chạy lệnh tái tạo chứng chỉ SSL cục bộ và restart Kestrel an toàn."
    ],
    "precondition": "Đơn vị thay đổi tên miền nội bộ hoặc IP máy chủ."
  },
  {
    "id": "TC-DEVC-001",
    "module": "M11",
    "priority": "P1",
    "name": "Kết nối DeviceService qua WebSocket (ws://localhost:6025/ws)",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Khởi động SmartVMS.Local.DeviceService.",
      "2. Mở trang Web trạm gác /staff.html."
    ],
    "expected": [
      "Trình duyệt thiết lập kết nối WebSocket tới ws://localhost:6025/ws.",
      "Trạng thái thiết bị hiển thị Online, không có banner lỗi cảnh báo."
    ],
    "precondition": "Dịch vụ SmartVMS.Local.DeviceService đang chạy trên máy trạm.",
    "testData": "Kết nối WebSocket từ web app tới ws://localhost:6025/ws."
  },
  {
    "id": "TC-DEVC-002",
    "module": "M11",
    "priority": "P1",
    "name": "Đọc thẻ CCCD gắn chip qua đầu đọc PCSC / NFC",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Đặt thẻ CCCD gắn chip lên đầu đọc thẻ.",
      "2. DeviceService phát hiện thẻ và đọc dữ liệu qua chuẩn vnMRTD."
    ],
    "expected": [
      "Dữ liệu thẻ được đẩy qua WebSocket trong vòng dưới 2 giây.",
      "Giao diện web tự động hiển thị thông tin công dân và ảnh chụp trên chip."
    ],
    "precondition": "Đầu đọc thẻ CCCD PCSC/NFC đã cắm vào máy tính.",
    "testData": "Đặt thẻ CCCD gắn chip lên đầu đọc."
  },
  {
    "id": "TC-DEVC-003",
    "module": "M11",
    "priority": "P2",
    "name": "Quét mã QR thẻ CCCD qua máy quét 2D kết nối USB",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Quét mã QR trên thẻ CCCD."
    ],
    "expected": [
      "Máy quét đọc mã thành công, ứng dụng web tự động phân giải chuỗi ký tự thành các trường thông tin tương ứng."
    ],
    "precondition": "Máy quét mã QR 2D đã kết nối cổng USB.",
    "testData": "Đưa mã QR trên thẻ CCCD vào vùng quét của máy quét 2D."
  },
  {
    "id": "TC-DEVC-004",
    "module": "M11",
    "priority": "P1",
    "name": "Đọc Thẻ An Ninh qua đầu đọc RFID (NFC/Mifare)",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Quẹt thẻ an ninh qua đầu đọc RFID khi đang ở ô nhập mã thẻ."
    ],
    "expected": [
      "Mã thẻ RFID (UID) tự động điền vào ô mã thẻ trên form Check-in / Checkout / Thu hồi."
    ],
    "precondition": "Đầu đọc thẻ RFID Mifare/NFC 13.56MHz đã kết nối.",
    "testData": "Quẹt thẻ an ninh RFID lên đầu đọc."
  },
  {
    "id": "TC-DEVC-005",
    "module": "M11",
    "priority": "P2",
    "name": "Điều khiển Đóng/Mở Barie / Cổng Barrier tự động qua Rơ-le",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Thực hiện Check-in hoặc Checkout thành công cho lượt khách có phương tiện."
    ],
    "expected": [
      "DeviceService gửi tín hiệu điều khiển qua cổng COM/Relay kích mở barie cho xe qua cổng.",
      "Sau khoảng trễ quy định, tín hiệu đóng barie được gửi an toàn."
    ],
    "precondition": "Bộ điều khiển rơ-le cổng Barie kết nối qua cổng COM/Relay.",
    "testData": "Kích hoạt lệnh mở Barie khi Check-in xe hợp lệ."
  },
  {
    "id": "TC-DEVC-006",
    "module": "M11",
    "priority": "P1",
    "name": "Xử lý Ngắt kết nối DeviceService: Chuyển Offline & Không làm tắc cổng",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Tắt tiến trình DeviceService.",
      "2. Quan sát giao diện trạm gác."
    ],
    "expected": [
      "Hiển thị thông báo trạng thái Thiết bị Offline.",
      "Phần mềm VẪN CHO PHÉP nhân viên nhập thủ công bình thường, không làm gián đoạn hay tắc nghẽn cổng gác."
    ],
    "precondition": "DeviceService bị tắt hoặc rút cáp phần cứng trong khi trạm gác đang làm việc.",
    "testData": "Chuyển sang chế độ nhập liệu thủ công (Manual Fallback)."
  },
  {
    "id": "TC-DEVC-007",
    "module": "M11",
    "priority": "P2",
    "name": "Tự động Tái kết nối WebSocket (Auto-reconnect)",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Sau khi DeviceService bị ngắt, bật lại tiến trình DeviceService."
    ],
    "expected": [
      "Trình duyệt tự động thăm dò và tái kết nối lại WebSocket thành công trong vòng 5 giây mà không cần nhân viên nhấn F5."
    ],
    "precondition": "DeviceService bị gián đoạn kết nối tạm thời rồi khởi động lại.",
    "testData": "Quan sát cơ chế tự động tái kết nối WebSocket của Web UI sau 3 giây."
  },
  {
    "id": "TC-DEVC-008",
    "module": "M11",
    "priority": "P4",
    "name": "Cấu hình thiết bị trong DeviceService (Cổng COM, Baudrate, IP)",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Kiểm tra cấu hình trong file appsettings.json của DeviceService."
    ],
    "expected": [
      "Cấu hình thông số cổng COM, tốc độ truyền Baudrate và địa chỉ reader linh hoạt, dễ dàng thay đổi theo phần cứng thực tế."
    ],
    "precondition": "Mở file cấu hình appsettings.json của DeviceService.",
    "testData": "Cấu hình cổng COM, tốc độ Baudrate = 115200, Timeout đọc chip = 2000ms."
  },
  {
    "id": "TC-DEVC-009",
    "module": "M11",
    "priority": "P3",
    "name": "Kiểm tra thời gian đọc thẻ CCCD gắn chip dưới 2 giây",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Đặt thẻ CCCD và đo thời gian từ khi chạm thẻ đến khi dữ liệu hiển thị trên web."
    ],
    "expected": [
      "Thời gian phản hồi đạt dưới 2.0 giây, bảo đảm tốc độ lưu thông nhanh tại cổng trực ban."
    ],
    "precondition": "Đầu đọc chip CCCD PCSC đang hoạt động tốt.",
    "testData": "Bấm giờ từ thời điểm chạm thẻ CCCD đến khi form hiển thị đủ dữ liệu (dưới 2 giây)."
  },
  {
    "id": "TC-DEVC-010",
    "module": "M11",
    "priority": "P4",
    "name": "Báo lỗi đọc thẻ khi thẻ đặt lệch hoặc rút ra quá sớm",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Đặt thẻ CCCD và lập tức rút ra trong khi đầu đọc đang truyền dữ liệu."
    ],
    "expected": [
      "DeviceService bắt ngoại lệ CardCommunicationException, gửi thông báo \"Thẻ bị ngắt quãng, vui lòng giữ nguyên thẻ trên đầu đọc\", không crash service."
    ],
    "precondition": "Đang đặt thẻ CCCD lên đầu đọc.",
    "testData": "Rút thẻ ra đột ngột trong khi đầu đọc đang truyền dữ liệu."
  },
  {
    "id": "TC-DEVC-011",
    "module": "M11",
    "priority": "P4",
    "name": "Cấu hình thiết bị Webcam trong Device Settings của trạm",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Vào cài đặt thiết bị của trạm gác, chọn camera mặc định cho mở ca và chụp ảnh khách."
    ],
    "expected": [
      "Cấu hình được lưu và áp dụng đúng webcam đã chọn."
    ],
    "precondition": "Trạm gác có webcam USB.",
    "testData": "Cài đặt thiết bị Webcam mặc định trong cấu hình trạm gác."
  },
  {
    "id": "TC-DEVC-012",
    "module": "M11",
    "priority": "P3",
    "name": "Cảnh báo sự cố thiết bị ngoại vi qua banner DeviceErrorBanner",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Rút cáp USB đầu đọc thẻ khi đang làm việc."
    ],
    "expected": [
      "Hiển thị dải cảnh báo DeviceErrorBanner màu vàng cam thông báo cụ thể thiết bị mất kết nối."
    ],
    "precondition": "Trực ban đang mở giao diện /staff.html; Rút cáp USB đầu đọc thẻ.",
    "testData": "Quan sát dải banner DeviceErrorBanner trên đầu trang."
  },
  {
    "id": "TC-DEVC-013",
    "module": "M11",
    "priority": "P1",
    "name": "Giải mã Chuyên sâu Dữ liệu Chip CCCD DG13 (vnMRTD Decoder Engine)",
    "platform": "Dịch vụ Thiết bị DeviceService (vnMRTD)",
    "testData": "Thư viện vnMRTD (DecodeDG13.cs): Giải mã nhóm dữ liệu ASN.1 DG13.",
    "steps": [
      "1. Đặt thẻ CCCD lên đầu đọc chip tiếp xúc hoặc contactless.",
      "2. Quan sát log DeviceService và gói tin giải mã nhóm dữ liệu DG13 (DecodeDG13.cs)."
    ],
    "expected": [
      "Thư viện vnMRTD giải mã chính xác ASN.1 DG13: Họ tên tiếng Việt có dấu đầy đủ, Ngày sinh, Giới tính, Quê quán, Nơi thường trú, Dân tộc, Tôn giáo, Đặc điểm nhận dạng, Ngày cấp và Số CMND cũ 9 số.",
      "Gói tin JSON trả về client đầy đủ không bị lỗi font hay mất ký tự."
    ],
    "precondition": "Thẻ CCCD gắn chip vật lý chuẩn Bộ Công An đặt trên đầu đọc."
  },
  {
    "id": "TC-BKGD-001",
    "module": "M12",
    "priority": "P1",
    "name": "Dịch vụ Tự động Đóng Lượt thăm quá hạn (Auto Checkout Service)",
    "platform": "Dịch vụ Ngầm C# Backend",
    "steps": [
      "1. Tạo lượt khách không có cờ isMultiDayVisit.",
      "2. Chạy Auto Checkout Service (hoặc đổi thời gian quá hạn)."
    ],
    "expected": [
      "Background Worker tự động quét và checkout lượt khách tồn đọng, cập nhật ghi chú tự động đóng, không để dồn khách ảo sang ngày hôm sau."
    ],
    "precondition": "Có lượt khách chưa checkout và không có cờ isMultiDayVisit tồn đọng qua đêm.",
    "testData": "Dịch vụ AutoCheckoutBackgroundService chạy định kỳ quét lượt khách quá hạn."
  },
  {
    "id": "TC-BKGD-002",
    "module": "M12",
    "priority": "P1",
    "name": "Cơ chế Chống Trùng lặp Lệnh qua ClientCommandId (Idempotency)",
    "platform": "Dịch vụ Ngầm C# Backend & Web",
    "steps": [
      "1. Giả lập mạng chập chờn, nhấn nút Check-in liên tiếp nhiều lần với cùng 1 ClientCommandId."
    ],
    "expected": [
      "Hệ thống backend kiểm tra ClientCommandId đã xử lý, trả về kết quả thành công của lệnh đầu tiên, KHÔNG TẠO 2 lượt khách trùng lặp trong CSDL."
    ],
    "precondition": "Mạng chập chờn; Người dùng nhấp liên tục 3 lần nút Check-in.",
    "testData": "Cả 3 request gửi đi đều mang cùng 1 mã ClientCommandId (GUID)."
  },
  {
    "id": "TC-BKGD-003",
    "module": "M12",
    "priority": "P1",
    "name": "Hệ thống Bản quyền Phần mềm (License System): Machine Fingerprint",
    "platform": "Hệ thống Standalone",
    "steps": [
      "1. Kiểm tra xác thực license dựa trên Hardware Fingerprint (CPU ID, Motherboard UUID, MAC Address)."
    ],
    "expected": [
      "Hệ thống chạy bình thường khi có khóa bản quyền hợp lệ khớp với phần cứng máy tính.",
      "Nếu sao chép sang máy khác mà không có license, phần mềm thông báo yêu cầu kích hoạt bản quyền."
    ],
    "precondition": "Hệ thống bản quyền phần mềm SmartVMS.",
    "testData": "Thuật toán Machine Fingerprint tạo mã định danh máy chủ từ CPU ID và Mainboard UUID."
  },
  {
    "id": "TC-BKGD-004",
    "module": "M12",
    "priority": "P1",
    "name": "Hoạt động Độc lập Ngoại tuyến 100% (Offline Standalone)",
    "platform": "Hệ thống Standalone",
    "steps": [
      "1. Rút hoàn toàn dây mạng Internet WAN (chỉ để mạng LAN nội bộ hoặc localhost).",
      "2. Thực hiện toàn bộ quy trình: Đăng nhập, Mở ca, Check-in, Bổ sung, Checkout, Xuất báo cáo, Backup."
    ],
    "expected": [
      "Toàn bộ các tính năng hoạt động mượt mà 100%, không phát sinh bất kỳ lỗi kết nối mạng nào."
    ],
    "precondition": "Ngắt hoàn toàn kết nối Internet (rút dây mạng WAN hoặc tắt Wi-Fi).",
    "testData": "Thực hiện đầy đủ quy trình: Đăng nhập trạm, Check-in, Cấp thẻ, Checkout, Xuất báo cáo."
  },
  {
    "id": "TC-BKGD-005",
    "module": "M12",
    "priority": "P1",
    "name": "Khả năng Chịu lỗi Mất điện đột ngột: CSDL SQLite WAL bảo toàn dữ liệu",
    "platform": "Hệ thống Standalone",
    "steps": [
      "1. Thực hiện Check-in liên tục đồng thời tắt nóng tiến trình hoặc mất điện đột ngột.",
      "2. Mở lại ứng dụng."
    ],
    "expected": [
      "CSDL SQLite với chế độ Write-Ahead Logging (WAL) tự động phục hồi tính nhất quán, không bị lỗi corrupt database."
    ],
    "precondition": "CSDL SQLite hoạt động ở chế độ Write-Ahead Logging (WAL mode).",
    "testData": "Mô phỏng mất điện đột ngột trong khi hệ thống đang ghi dữ liệu vào CSDL."
  },
  {
    "id": "TC-BKGD-006",
    "module": "M12",
    "priority": "P3",
    "name": "Hiệu năng Tìm kiếm và Xử lý dưới tải (5,000+ lượt khách)",
    "platform": "Giao diện Web UI & API",
    "steps": [
      "1. CSDL chứa 5,000 bản ghi lượt khách.",
      "2. Thực hiện tìm kiếm và lọc dữ liệu trên Dashboard và Báo cáo."
    ],
    "expected": [
      "Thời gian phản hồi hiển thị kết quả đạt dưới 100ms, không có hiện tượng giật lag giao diện."
    ],
    "precondition": "CSDL có trên 5,000 lượt khách đã lưu.",
    "testData": "Thực hiện tìm kiếm Live Search, xuất báo cáo Excel toàn bộ dữ liệu."
  },
  {
    "id": "TC-BKGD-007",
    "module": "M12",
    "priority": "P1",
    "name": "Bảo mật phân quyền API: Endpoint /admin/* chặn truy cập khi thiếu token",
    "platform": "API Backend",
    "steps": [
      "1. Dùng Postman hoặc curl gọi các API /admin/users, /admin/backup mà không gửi kèm token."
    ],
    "expected": [
      "Backend phản hồi ngay lập tức 401 Unauthorized, không để lộ dữ liệu quản trị."
    ],
    "precondition": "Client không có header X-Admin-Token hợp lệ.",
    "testData": "Gửi request GET /admin/users hoặc POST /admin/backup."
  },
  {
    "id": "TC-BKGD-008",
    "module": "M12",
    "priority": "P2",
    "name": "Phòng chống XSS và SQL Injection trên các trường nhập liệu",
    "platform": "Giao diện Web UI & API",
    "testData": "Nhập chuỗi độc hại: `<script>alert(1)</script>` hoặc `' OR 1=1 --`.",
    "steps": [
      "1. Nhập các chuỗi tấn công vào trường Họ tên, Mục đích, Biển số xe."
    ],
    "expected": [
      "Entity Framework Core tham số hóa câu lệnh an toàn (Parametrized Queries), React tự động escape ký tự HTML, không bị thực thi mã độc."
    ],
    "precondition": "Các trường nhập liệu trên form Check-in, Tìm kiếm, Đăng nhập."
  },
  {
    "id": "TC-BKGD-009",
    "module": "M12",
    "priority": "P4",
    "name": "Cơ chế tự động dọn dẹp file tạm và ảnh rác định kỳ",
    "platform": "Dịch vụ Ngầm C# Backend",
    "steps": [
      "1. Kiểm tra thư mục tạm /temp và /uploads."
    ],
    "expected": [
      "Hệ thống tự động xóa các file tạm sinh ra trong quá trình xuất báo cáo sau khi hoàn tất."
    ],
    "precondition": "Thư mục /temp chứa các file ảnh tạm sinh ra trong quá trình xuất báo cáo.",
    "testData": "Dịch vụ ngầm tự động dọn dẹp file tạm theo định kỳ."
  },
  {
    "id": "TC-BKGD-010",
    "module": "M12",
    "priority": "P2",
    "name": "Cơ chế khóa CSDL SQLite (DB Lock) và tự động thử lại khi có xung đột ghi",
    "platform": "Dịch vụ Ngầm C# Backend",
    "steps": [
      "1. Giả lập nhiều tiến trình cùng ghi vào CSDL SQLite đồng thời."
    ],
    "expected": [
      "EF Core có cơ chế RetryOnFailure tự động chờ và thử lại, không ném lỗi SQLite busy/locked ra màn hình người dùng."
    ],
    "precondition": "Nhiều tiến trình ghi CSDL đồng thời (Trực ban + DataEntry + AutoCheckout).",
    "testData": "EF Core cơ chế RetryOnFailure tự động thử lại khi gặp xung đột khóa file SQLite."
  },
  {
    "id": "TC-BKGD-011",
    "module": "M12",
    "priority": "P4",
    "name": "Kiểm tra rò rỉ bộ nhớ (Memory Leak) khi ứng dụng chạy liên tục nhiều ngày",
    "platform": "Giao diện Web UI & DeviceService",
    "steps": [
      "1. Giữ ứng dụng trạm gác mở liên tục trên trình duyệt trong môi trường thử nghiệm tải."
    ],
    "expected": [
      "Mức tiêu thụ RAM của tab Chrome/Edge duy trì ổn định dưới 500MB, không tăng vọt không kiểm soát."
    ],
    "precondition": "Tab Web UI trạm gác mở liên tục nhiều ngày trong môi trường kiểm thử tải.",
    "testData": "Đo mức tiêu thụ RAM qua Task Manager của Windows sau 48 giờ chạy liên tục."
  },
  {
    "id": "TC-BKGD-012",
    "module": "M12",
    "priority": "P4",
    "name": "Ghi nhật ký lỗi hệ thống (Error Logging): File log hàng ngày",
    "platform": "Dịch vụ Ngầm C# Backend",
    "steps": [
      "1. Kiểm tra thư mục Logs của ứng dụng Backend C#."
    ],
    "expected": [
      "Mỗi ngày tự động sinh file log (vd: log-20261006.txt) ghi nhận đầy đủ stack trace các ngoại lệ nếu có để phục vụ bảo trì."
    ],
    "precondition": "Hệ thống Backend C# .NET đang chạy.",
    "testData": "Kiểm tra thư mục /Logs trên ổ đĩa máy chủ."
  },
  {
    "id": "TC-BKGD-013",
    "module": "M12",
    "priority": "P2",
    "name": "Khởi chạy & Giám sát Dịch vụ qua Bảng điều khiển Desktop WPF (SmartVMS ControlPanel)",
    "platform": "Ứng dụng Desktop Windows WPF (ControlPanel)",
    "steps": [
      "1. Khởi chạy ứng dụng SmartVMS.Local.ControlPanel.exe.",
      "2. Quan sát cửa sổ StartupSplashWindow và MainWindow.",
      "3. Kiểm tra trạng thái các dịch vụ: Backend API, DeviceService, Web UI.",
      "4. Thu nhỏ ứng dụng xuống khay hệ thống (System Tray), nhấp đúp để mở lại.",
      "5. Nhấp nút \"Mở giao diện Trạm gác\" hoặc \"Mở giao diện Admin\"."
    ],
    "expected": [
      "ControlPanel hiển thị trực quan trạng thái xanh (Running) của toàn bộ các tiến trình con.",
      "Thu nhỏ xuống System Tray hoạt động ổn định, mở đúng URL cục bộ trên trình duyệt mặc định."
    ],
    "precondition": "Môi trường Windows Desktop.",
    "testData": "Khởi chạy SmartVMS.Local.ControlPanel.exe -> Kiểm tra System Tray và khởi động dịch vụ."
  }
];

const USERS = [
  { username: 'admin', password: '123', role: 'admin', name: 'Quản trị viên (QA Lead)' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Quản trị viên (QA Lead)' },
  { username: 'tester', password: '123', role: 'tester', name: 'Nguyễn Văn Nam (Tester)' },
  { username: 'dev', password: '123', role: 'developer', name: 'Trần Quốc Tuấn (Developer)' }
];

// ================================================================
// STATE
// ================================================================
let state = {
  modules: [],       // Configurable modules: [ { id, name, short } ]
  customTcs: [],     // User-added test cases: [ { id, module, priority, name, precondition, steps, expected, notes, isCustom: true, createdAt } ]
  overrides: {},     // Hiệu đính Test Cases chuẩn: { [tcId]: { name, priority, platform, testData, precondition, steps, expected, notes, updatedAt } }
  currentRunId: 'run_001',
  runs: [
    {
      id: 'run_001',
      name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện',
      targetVersion: 'v2.0',
      scopeType: 'ALL',
      status: 'ACTIVE',
      createdBy: 'QA Lead',
      createdAt: '2026-10-06T00:00:00.000Z'
    }
  ],
  runResults: {},    // { [runId]: { [tcId]: { status, tester, runAt, note, failReason, defectStatus, severity, assignedDev, fixVersion, evidences: [] } } }
  comments: {},      // { [tcId]: [ { id, runId, tcId, author, role, content, createdAt } ] }
  results: {},       // Active run results pointer: { tcId: { status, tester, runAt, note, failReason, defectStatus, severity, assignedDev, fixVersion, evidences: [] } }
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
  if (!state.runResults) state.runResults = {};
  if (!state.runResults[state.currentRunId]) state.runResults[state.currentRunId] = {};
  state.runResults[state.currentRunId] = state.results; // Đồng bộ pointer kết quả đợt hiện tại

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentRunId: state.currentRunId,
    runs: state.runs || [],
    runResults: state.runResults || {},
    comments: state.comments || {},
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
      state.currentRunId = s.currentRunId || 'run_001';
      state.runs = Array.isArray(s.runs) && s.runs.length > 0 ? s.runs : [
        { id: 'run_001', name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện', targetVersion: 'v2.0', scopeType: 'ALL', status: 'ACTIVE', createdBy: 'QA Lead', createdAt: '2026-10-06T00:00:00.000Z' }
      ];
      state.runResults = (s.runResults && typeof s.runResults === 'object') ? s.runResults : {};
      state.comments = (s.comments && typeof s.comments === 'object') ? s.comments : {};

      // Khôi phục kết quả đợt đầu nếu là dữ liệu phiên bản cũ
      if (!state.runResults['run_001'] || Object.keys(state.runResults['run_001']).length === 0) {
        if (s.results && Object.keys(s.results).length > 0) {
          state.runResults['run_001'] = s.results;
        } else {
          state.runResults['run_001'] = {};
        }
      }
      state.results = state.runResults[state.currentRunId] || {};

      state.session = s.session || null;
      state.customTcs = Array.isArray(s.customTcs) ? s.customTcs : [];
      state.overrides = (s.overrides && typeof s.overrides === 'object') ? s.overrides : {};
      const isOutdated = !Array.isArray(s.modules) || s.modules.length === 0 || s.modules.length !== DEFAULT_MODULES.length || DEFAULT_MODULES.some(dm => !s.modules.some(m => m.id === dm.id));
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
      roleEl.textContent = 'QA Lead (Admin)';
      roleEl.style.background = 'rgba(239, 68, 68, 0.1)';
      roleEl.style.color = '#ef4444';
      roleEl.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      document.body.classList.remove('role-tester', 'role-developer');
    } else if (state.currentUser.role === 'developer') {
      roleEl.textContent = 'Developer';
      roleEl.style.background = 'rgba(249, 115, 22, 0.1)';
      roleEl.style.color = '#ea580c';
      roleEl.style.borderColor = 'rgba(249, 115, 22, 0.2)';
      document.body.classList.add('role-developer');
      document.body.classList.remove('role-tester');
    } else {
      roleEl.textContent = 'Tester';
      roleEl.style.background = 'rgba(59, 130, 246, 0.1)';
      roleEl.style.color = '#3b82f6';
      roleEl.style.borderColor = 'rgba(59, 130, 246, 0.2)';
      document.body.classList.add('role-tester');
      document.body.classList.remove('role-developer');
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
  if (status === 'Inherited Pass') {
    return `<span class="badge-inherited" title="Kế thừa kết quả Đạt từ Đợt kiểm thử trước">🌿 Kế thừa Pass</span>`;
  }
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
  const p4 = all.filter(t=>t.priority==='P4');
  const pData = [p1,p2,p3,p4].map(arr => {
    let pass=0,fail=0,notrun=0;
    arr.forEach(tc=>{ const r=state.results[tc.id]; const st=r?.status||'Not Run'; if(st==='Pass')pass++;else if(st==='Fail')fail++;else notrun++; });
    return {pass,fail,notrun};
  });
  const tc = getThemeChartColors();
  state.charts.priority = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['🔴 P1 (Critical)','🟠 P2 (Important)','🟡 P3 (Medium)','🟢 P4 (Low)'],
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
  const comments = (state.comments && state.comments[tcId]) || [];
  const evidences = r.evidences || [];

  const isFailed = r.status === 'Fail' || (r.defectStatus && r.defectStatus !== 'None');

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

    <!-- Kết quả thực tế -->
    <div>
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">🎯 Kết quả thực tế đợt này</div>
      <div class="status-selector" id="status-sel-${tcId}">
        ${['Pass','Fail','Skip','In Progress'].map(s => {
          const cls = s.replace(' ','');
          const active = r.status === s ? 'active' : '';
          return `<button class="btn btn-${cls.toLowerCase()} ${active}" onclick="setStatus('${tcId}','${s}')">${s==='Pass'?'✅':s==='Fail'?'❌':s==='Skip'?'⏭':'🔄'} ${s}</button>`;
        }).join('')}
      </div>
    </div>

    <div class="exec-form">
      <div class="form-row-2">
        <div class="form-group">
          <label>Người thực hiện test</label>
          <input type="text" id="ef-tester" value="${r.tester || (state.currentUser ? state.currentUser.name : '')}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>Thời điểm thực thi</label>
          <input type="text" value="${r.runAt ? new Date(r.runAt).toLocaleString('vi-VN') : 'Chưa chạy'}" readonly style="background:#f1f5f9; color:#64748b; cursor:not-allowed" />
        </div>
      </div>

      <div class="form-group">
        <label>Lý do lỗi (khi Fail)</label>
        <input type="text" id="ef-fail" placeholder="Mô tả ngắn gọn lỗi thực tế gặp phải..." value="${r.failReason||''}" onchange="updateTcField('${tcId}','failReason',this.value)" />
      </div>

      <!-- VÒNG ĐỜI LỖI (DEFECT LIFECYCLE) NẾU CÓ LỖI -->
      ${isFailed ? `
      <div class="defect-box">
        <div class="defect-box-title">
          <span>🐞 Vòng Đời Lỗi (Defect Tracking Lifecycle)</span>
          <span class="status-badge" style="background:#fee2e2;color:#dc2626">${r.defectStatus || 'New'}</span>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label>Mức độ nghiêm trọng (Severity)</label>
            <select id="ef-sev" onchange="updateTcField('${tcId}','severity',this.value)">
              <option value="Blocker" ${r.severity==='Blocker'?'selected':''}>🔴 Blocker (Chặn đứng)</option>
              <option value="Critical" ${r.severity==='Critical'||!r.severity?'selected':''}>🟠 Critical (Nghiêm trọng)</option>
              <option value="Major" ${r.severity==='Major'?'selected':''}>🟡 Major (Lớn)</option>
              <option value="Minor" ${r.severity==='Minor'?'selected':''}>🟢 Minor (Nhẹ / Giao diện)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Lập trình viên phụ trách (Assigned Dev)</label>
            <input type="text" id="ef-dev" placeholder="VD: Trần Quốc Tuấn" value="${r.assignedDev||'Trần Quốc Tuấn (Dev)'}" onchange="updateTcField('${tcId}','assignedDev',this.value)" />
          </div>
          <div class="form-group">
            <label>Bản build sửa lỗi (Fix Version)</label>
            <input type="text" id="ef-fixver" placeholder="VD: v2.1.2-build.8" value="${r.fixVersion||''}" onchange="updateTcField('${tcId}','fixVersion',this.value)" />
          </div>
        </div>

        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:8px">Chuyển trạng thái xử lý:</div>
        <div class="defect-actions-bar">
          <button class="btn-defect btn-defect-inprog" onclick="updateDefectStatus('${tcId}', 'In Progress')">👨‍💻 Dev: Đang sửa</button>
          <button class="btn-defect btn-defect-resolved" onclick="updateDefectStatus('${tcId}', 'Resolved')">🔧 Dev: Đã sửa (Chờ Retest)</button>
          <button class="btn-defect btn-defect-retest-ok" onclick="updateDefectStatus('${tcId}', 'Retest Passed')">✅ Tester: Retest Pass (Đóng lỗi)</button>
          <button class="btn-defect btn-defect-reopen" onclick="updateDefectStatus('${tcId}', 'Reopened')">🔄 Tester: Retest Fail (Mở lại)</button>
        </div>
      </div>` : ''}

      <!-- BẰNG CHỨNG HÌNH ẢNH (EVIDENCES & SCREENSHOTS) -->
      <div class="evidence-section">
        <div class="evidence-section-title">
          <span>📸 Bằng chứng kiểm thử & Ảnh chụp màn hình</span>
          <span style="font-size:11px;color:var(--accent-light);font-weight:normal">${evidences.length} ảnh đính kèm</span>
        </div>

        <div class="evidence-dropzone" id="dz-${tcId}" onclick="document.getElementById('ev-file-${tcId}').click()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="event.preventDefault();this.classList.remove('dragover');handleEvidenceUpload('${tcId}', event.dataTransfer.files)">
          <div class="dz-icon">📸</div>
          <div><strong>Kéo thả ảnh vào đây</strong> hoặc nhấn để chọn file</div>
          <div class="dz-hint">💡 Hoặc chỉ cần chụp màn hình rồi bấm <strong>Ctrl + V</strong> để dán ảnh trực tiếp siêu tốc!</div>
          <input type="file" id="ev-file-${tcId}" accept="image/*" multiple style="display:none" onchange="handleEvidenceUpload('${tcId}', this.files)" />
        </div>

        ${evidences.length > 0 ? `
        <div class="evidence-grid">
          ${evidences.map(ev => `
            <div class="evidence-card" title="${ev.name}">
              <img src="${ev.url}" onclick="openLightbox('${ev.url}', '${ev.name}')" alt="Screenshot" />
              <button class="evidence-delete" onclick="removeEvidence('${tcId}', '${ev.id}')" title="Xóa ảnh">✕</button>
              <div class="evidence-caption">${ev.name}</div>
            </div>
          `).join('')}
        </div>` : ''}
      </div>

      <!-- TRAO ĐỔI THẢO LUẬN 2 CHIỀU (QA - DEV DISCUSSION) -->
      <div class="comments-section">
        <div class="comments-header">
          <span>💬 Thảo luận & Phản hồi kỹ thuật (${comments.length})</span>
          <span style="font-size:11px;color:var(--text-muted);font-weight:normal">Phản hồi giữa Tester, Dev và QA Lead</span>
        </div>

        <div class="comment-feed" id="comment-feed-${tcId}">
          ${comments.length === 0 ? `<div style="font-size:12px;color:var(--text-muted);font-style:italic;padding:8px 0">Chưa có trao đổi nào. Hãy để lại ghi chú hoặc phản hồi cho đội ngũ phát triển.</div>` :
            comments.map(c => {
              const roleClass = c.role === 'developer' ? 'role-tag-dev' : c.role === 'admin' ? 'role-tag-lead' : 'role-tag-tester';
              const roleName = c.role === 'developer' ? 'Developer' : c.role === 'admin' ? 'QA Lead' : 'Tester';
              return `<div class="comment-item">
                <div class="comment-meta">
                  <div class="comment-author">
                    <span>${c.author || 'Thành viên'}</span>
                    <span class="comment-role-tag ${roleClass}">${roleName}</span>
                  </div>
                  <div class="comment-time">${new Date(c.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'})} · ${new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="comment-body">${c.content}</div>
              </div>`;
            }).join('')
          }
        </div>

        <div class="comment-input-box">
          <textarea id="comment-input-${tcId}" placeholder="Nhập bình luận, phản hồi commit fix, yêu cầu kiểm tra lại..."></textarea>
          <button class="btn btn-primary" onclick="addComment('${tcId}')" style="height:58px;padding:0 16px">Gửi 💬</button>
        </div>
      </div>

      <div class="form-group" style="margin-top:14px">
        <label>Ghi chú kỹ thuật bổ sung</label>
        <textarea id="ef-note" placeholder="Ghi chú, môi trường test, lưu ý bổ sung..." onchange="updateTcField('${tcId}','note',this.value)">${r.note||''}</textarea>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
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
  
  if (status === 'Fail') {
    if (!state.results[tcId].defectStatus || state.results[tcId].defectStatus === 'None') {
      state.results[tcId].defectStatus = 'New';
    }
  } else if (status === 'Pass' && state.results[tcId].defectStatus && state.results[tcId].defectStatus !== 'None') {
    state.results[tcId].defectStatus = 'Retest Passed';
  }

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
      run_id: state.currentRunId || 'run_001',
      tc_id: tcId,
      status: r.status,
      tester: r.tester || (state.currentUser ? state.currentUser.name : 'Unknown'),
      run_at: r.runAt || new Date().toISOString(),
      defect_status: r.defectStatus || 'None',
      severity: r.severity || null,
      assigned_dev: r.assignedDev || null,
      fix_version: r.fixVersion || null,
      fail_reason: r.failReason || null,
      note: r.note || null,
      evidences: r.evidences || [],
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
  if (!confirm('⚠️ Bạn có chắc chắn muốn khôi phục danh mục Module về 12 Module mặc định ban đầu chuẩn SmartVMS Local 2026?')) return;
  state.modules = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  saveState();
  populateModuleSelects();
  showToast('🔄 Đã khôi phục 12 Module mặc định chuẩn SmartVMS Local 2026', 'success');

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
  updateRunSelectorUI();
  updateSessionDisplay();
  applyAuth(); // Apply login state
  navigate('dashboard');
  const all = getAllTcs();
  console.log(`✅ SmartVMS Test Manager v3.0 loaded | ${all.length} Test Cases | Đợt hiện tại: ${state.currentRunId}`);
});

// ================================================================
// MULTI-RUN / TEST CYCLES MANAGEMENT LOGIC
// ================================================================
function updateRunSelectorUI() {
  const sel = document.getElementById('header-run-select');
  if (!sel) return;
  sel.innerHTML = (state.runs || []).map(r => 
    `<option value="${r.id}" ${r.id === state.currentRunId ? 'selected' : ''}>${r.name} (${r.targetVersion || 'v2.0'})</option>`
  ).join('');
}

function switchTestRun(runId) {
  if (!state.runResults) state.runResults = {};
  if (!state.runResults[runId]) state.runResults[runId] = {};
  state.currentRunId = runId;
  state.results = state.runResults[runId];
  saveState();
  updateRunSelectorUI();
  applyFilters();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  
  const currentRun = (state.runs || []).find(r => r.id === runId);
  showToast(`🏃 Đã chuyển sang: ${currentRun ? currentRun.name : runId}`, 'info');
}

function openNewRunModal() {
  const nextNum = (state.runs || []).length + 1;
  document.getElementById('new-run-name').value = `Đợt ${nextNum} — Retest bản vá v2.${nextNum - 1}`;
  document.getElementById('new-run-version').value = `v2.${nextNum - 1}.0`;
  document.getElementById('new-run-owner').value = state.currentUser ? state.currentUser.name : 'QA Lead';
  document.getElementById('new-run-scope').value = 'SMART_RETEST';
  document.getElementById('new-run-notes').value = '';
  handleRunScopeChange('SMART_RETEST');
  openModal('modal-run-create');
}

function handleRunScopeChange(scope) {
  const hint = document.getElementById('new-run-scope-hint');
  if (!hint) return;
  if (scope === 'SMART_RETEST') {
    hint.innerHTML = '💡 <strong>Smart Retest:</strong> Tự động lọc các ca Fail/Skip của đợt trước để đưa vào đợt mới. Các ca đã Pass được giữ nguyên trạng thái kế thừa (Inherited Pass), giúp tester chỉ tập trung vào các ca lỗi!';
  } else if (scope === 'SELECTIVE_P1') {
    hint.innerHTML = '💡 <strong>Selective Regression:</strong> Retest toàn bộ các ca lỗi + Toàn bộ các ca mức P1 (Critical) của toàn hệ thống để đảm bảo không bị lỗi dây chuyền.';
  } else {
    hint.innerHTML = '💡 <strong>Milestone Re-run:</strong> Đưa toàn bộ 100% test cases về trạng thái "Chưa chạy" để nghiệm thu toàn diện từ đầu. Kết quả các đợt trước vẫn được lưu nguyên vẹn.';
  }
}

function confirmCreateNewRun() {
  const name = document.getElementById('new-run-name').value.trim();
  const version = document.getElementById('new-run-version').value.trim();
  const owner = document.getElementById('new-run-owner').value.trim();
  const scope = document.getElementById('new-run-scope').value;
  const notes = document.getElementById('new-run-notes').value.trim();
  
  if (!name || !version) {
    showToast('⚠️ Vui lòng nhập Tên đợt kiểm thử và Phiên bản phần mềm!', 'error');
    return;
  }
  
  const parentRunId = state.currentRunId;
  const parentResults = state.runResults[parentRunId] || state.results || {};
  const newRunId = 'run_' + Date.now();
  const allTcs = getAllTcs();
  const newResults = {};
  
  let inheritedCount = 0;
  let retestCount = 0;
  
  allTcs.forEach(tc => {
    const prev = parentResults[tc.id];
    const prevStatus = prev ? prev.status : 'Not Run';
    
    if (scope === 'SMART_RETEST') {
      if (prevStatus === 'Pass' || prevStatus === 'Inherited Pass') {
        newResults[tc.id] = {
          status: 'Inherited Pass',
          tester: prev.tester || 'Inherited',
          runAt: prev.runAt,
          note: `[Kế thừa Pass từ ${state.runs.find(r=>r.id===parentRunId)?.name || 'Đợt trước'}]`
        };
        inheritedCount++;
      } else {
        newResults[tc.id] = {
          status: 'Not Run',
          tester: '',
          defectStatus: prev?.defectStatus || (prevStatus === 'Fail' ? 'Ready for Retest' : 'None'),
          severity: prev?.severity,
          assignedDev: prev?.assignedDev,
          failReason: prev?.failReason || '',
          note: prev?.failReason ? `Lỗi đợt trước: ${prev.failReason}` : ''
        };
        retestCount++;
      }
    } else if (scope === 'SELECTIVE_P1') {
      if ((prevStatus === 'Pass' || prevStatus === 'Inherited Pass') && tc.priority !== 'P1') {
        newResults[tc.id] = {
          status: 'Inherited Pass',
          tester: prev.tester || 'Inherited',
          runAt: prev.runAt
        };
        inheritedCount++;
      } else {
        newResults[tc.id] = { status: 'Not Run', tester: '', failReason: prev?.failReason || '' };
        retestCount++;
      }
    } else {
      newResults[tc.id] = { status: 'Not Run', tester: '' };
      retestCount++;
    }
  });
  
  const newRunObj = {
    id: newRunId,
    name,
    targetVersion: version,
    scopeType: scope,
    status: 'ACTIVE',
    parentRunId,
    createdBy: owner,
    notes,
    createdAt: new Date().toISOString()
  };
  
  if (!state.runs) state.runs = [];
  state.runs.push(newRunObj);
  if (!state.runResults) state.runResults = {};
  state.runResults[newRunId] = newResults;
  state.currentRunId = newRunId;
  state.results = newResults;
  
  saveState();
  closeModal('modal-run-create');
  updateRunSelectorUI();
  applyFilters();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
  if (document.getElementById('page-execute').classList.contains('active')) filterExecList();
  if (document.getElementById('page-report').classList.contains('active')) renderReport();
  
  syncRunToSupabase(newRunObj);
  
  showToast(`🚀 Đã khởi tạo ${name}! Kế thừa ${inheritedCount} ca Pass, cần kiểm thử ${retestCount} ca.`, 'success');
}

async function syncRunToSupabase(run) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('test_runs').upsert({
      id: run.id,
      name: run.name,
      target_version: run.targetVersion,
      scope_type: run.scopeType,
      status: run.status,
      parent_run_id: run.parentRunId,
      created_by: run.createdBy,
      notes: run.notes
    });
  } catch(e) {
    console.error('Lỗi sync run to Supabase:', e);
  }
}

// ================================================================
// EVIDENCE UPLOAD & LIGHTBOX LOGIC
// ================================================================
let currentLightboxRotation = 0;
let currentLightboxSrc = '';

function openLightbox(src, caption) {
  const modal = document.getElementById('modal-lightbox');
  const img = document.getElementById('lightbox-img');
  if (!modal || !img) return;
  currentLightboxSrc = src;
  currentLightboxRotation = 0;
  img.src = src;
  img.style.transform = 'rotate(0deg)';
  modal.classList.add('open');
}

function closeLightbox() {
  const modal = document.getElementById('modal-lightbox');
  if (modal) modal.classList.remove('open');
}

function rotateLightboxImg() {
  currentLightboxRotation = (currentLightboxRotation + 90) % 360;
  const img = document.getElementById('lightbox-img');
  if (img) img.style.transform = `rotate(${currentLightboxRotation}deg)`;
}

function openLightboxOriginal() {
  if (currentLightboxSrc) window.open(currentLightboxSrc, '_blank');
}

function handleEvidenceUpload(tcId, files) {
  if (!files || !files.length) return;
  if (!state.results[tcId]) state.results[tcId] = { status: 'Not Run' };
  const r = state.results[tcId];
  if (!r.evidences) r.evidences = [];
  
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WebP)!', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = e => {
      compressImage(e.target.result, 1280, 0.82, (compressedDataUrl) => {
        const evidence = {
          id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          url: compressedDataUrl,
          uploadedBy: state.currentUser ? state.currentUser.name : 'Tester',
          createdAt: new Date().toISOString()
        };
        r.evidences.push(evidence);
        saveState();
        renderExecDetail(tcId);
        syncSingleResultToSupabase(tcId);
        showToast(`📸 Đã đính kèm ảnh: ${file.name}`, 'success');
      });
    };
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl, maxDim, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL('image/webp', quality);
    callback(compressed);
  };
  img.src = dataUrl;
}

function removeEvidence(tcId, evId) {
  const r = state.results[tcId];
  if (!r || !r.evidences) return;
  r.evidences = r.evidences.filter(ev => ev.id !== evId);
  saveState();
  renderExecDetail(tcId);
  syncSingleResultToSupabase(tcId);
  showToast('🗑️ Đã xóa ảnh bằng chứng', 'info');
}

// Lắng nghe sự kiện paste ảnh từ Clipboard (Ctrl + V)
window.addEventListener('paste', e => {
  if (!document.getElementById('page-execute')?.classList.contains('active')) return;
  const tcId = state.selectedTcId;
  if (!tcId) return;
  
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (blob) {
        handleEvidenceUpload(tcId, [blob]);
        showToast('📋 Đã nhận ảnh chụp màn hình từ Clipboard (Ctrl+V)!', 'success');
        break;
      }
    }
  }
});

// ================================================================
// DISCUSSION COMMENTS & FEEDBACK LOGIC
// ================================================================
function addComment(tcId) {
  const input = document.getElementById(`comment-input-${tcId}`);
  if (!input) return;
  const content = input.value.trim();
  if (!content) return;
  
  if (!state.comments) state.comments = {};
  if (!state.comments[tcId]) state.comments[tcId] = [];
  
  const user = state.currentUser || { name: 'Tester', role: 'tester' };
  const comment = {
    id: 'cm_' + Date.now(),
    runId: state.currentRunId,
    tcId,
    author: user.name,
    role: user.role,
    content,
    createdAt: new Date().toISOString()
  };
  
  state.comments[tcId].push(comment);
  input.value = '';
  saveState();
  renderExecDetail(tcId);
  syncCommentToSupabase(comment);
  showToast('💬 Đã gửi bình luận phản hồi', 'success');
}

async function syncCommentToSupabase(comment) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('test_comments').insert({
      run_id: comment.runId,
      tc_id: comment.tcId,
      user_name: comment.author,
      user_role: comment.role,
      content: comment.content,
      created_at: comment.createdAt
    });
  } catch(e) {
    console.error('Lỗi sync comment to Supabase:', e);
  }
}

// ================================================================
// DEFECT LIFECYCLE WORKFLOW LOGIC
// ================================================================
function updateDefectStatus(tcId, newDefectStatus) {
  if (!state.results[tcId]) state.results[tcId] = { status: 'Fail' };
  state.results[tcId].defectStatus = newDefectStatus;
  
  const devEl = document.getElementById('ef-dev');
  if (devEl) state.results[tcId].assignedDev = devEl.value.trim();
  const sevEl = document.getElementById('ef-sev');
  if (sevEl) state.results[tcId].severity = sevEl.value;
  const fixEl = document.getElementById('ef-fixver');
  if (fixEl) state.results[tcId].fixVersion = fixEl.value.trim();
  
  if (newDefectStatus === 'Retest Passed') {
    state.results[tcId].status = 'Pass';
    showToast(`✅ [Retest Passed] Đóng lỗi ${tcId}! Chuyển trạng thái sang PASS.`, 'success');
  } else if (newDefectStatus === 'Reopened') {
    state.results[tcId].status = 'Fail';
    showToast(`🔄 [Reopened] Mở lại lỗi ${tcId}! Đã chuyển lại cho Developer.`, 'error');
  } else {
    showToast(`⚡ Cập nhật vòng đời lỗi ${tcId}: ${newDefectStatus}`, 'info');
  }
  
  saveState();
  renderExecDetail(tcId);
  filterExecList();
  syncSingleResultToSupabase(tcId);
}
