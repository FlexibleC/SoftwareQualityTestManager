/* ============================================================
   SmartVMS Test Manager — Application Logic
   Version 3.0 | 161 Test Cases | 12 Modules (SmartVMS Local 2026)
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
    "testData": "Tài khoản nhân viên trạm: Nv001a1 (hoặc NV001)",
    "precondition": "Nhân viên đang kích hoạt (Active) trong CSDL",
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
    "priority": "P2",
    "name": "Đăng nhập trạm không phân biệt hoa/thường",
    "platform": "Giao diện Web Trực ban",
    "testData": "Nhập \"NV001A1\", \"nv001a1\" hoặc \"Nv001A1\"",
    "steps": [
      "1. Nhập username xen kẽ chữ hoa chữ thường.",
      "2. Nhấn nút Đăng nhập."
    ],
    "expected": [
      "Hệ thống tự động chuẩn hóa chữ thường và đăng nhập thành công, không phát sinh lỗi."
    ]
  },
  {
    "id": "TC-AUTH-003",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập trạm thất bại: Tên tài khoản không tồn tại",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tài khoản không tồn tại: \"khongtontai\"",
    "steps": [
      "1. Nhập tài khoản không tồn tại trong hệ thống.",
      "2. Nhấn Đăng nhập."
    ],
    "expected": [
      "Hệ thống chặn lại và hiển thị thông báo: \"User không hợp lệ hoặc nhân viên chưa được kích hoạt.\""
    ]
  },
  {
    "id": "TC-AUTH-004",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập trạm thất bại: Tài khoản bị khóa (Inactive)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Tài khoản nhân viên đã bị tắt kích hoạt (IsActive = false)",
    "steps": [
      "1. Nhập tài khoản nhân viên đã bị vô hiệu hóa.",
      "2. Nhấn Đăng nhập."
    ],
    "expected": [
      "Hệ thống từ chối đăng nhập, hiển thị thông báo: \"User không hợp lệ hoặc nhân viên chưa được kích hoạt.\""
    ]
  },
  {
    "id": "TC-AUTH-005",
    "module": "M01",
    "priority": "P1",
    "name": "Xử lý xung đột phiên trạm: Phát hiện trạm đang có phiên mở dở dang",
    "platform": "Giao diện Web Trực ban",
    "testData": "Trạm đang được giữ bởi phiên trực trước đó hoặc tài khoản khác",
    "steps": [
      "1. Đăng nhập vào trạm đang có phiên trực chưa được đóng hoàn tất.",
      "2. Quan sát nút hành động hiển thị trên màn hình đăng nhập."
    ],
    "expected": [
      "Hệ thống hiển thị nút màu đỏ \"Ép Bắt Đầu Ca Mới\".",
      "Khi nhân viên nhấn nút này, hệ thống tự động đóng phiên cũ và khởi tạo ca trực mới cho nhân viên."
    ]
  },
  {
    "id": "TC-AUTH-006",
    "module": "M01",
    "priority": "P1",
    "name": "Mở ca trực bằng Camera (Webcam): Live Preview & Lưu ảnh chứng thực",
    "platform": "Giao diện Web Trực ban",
    "testData": "Webcam PC đang hoạt động bình thường",
    "precondition": "Đã hoàn tất bước nhập tài khoản trạm. Trạm bật cờ bắt buộc chụp ảnh mở ca.",
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
    "priority": "P2",
    "name": "Lựa chọn thiết bị Camera khi mở ca (Đa camera)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Máy tính trạm gắn cả Webcam tích hợp và Camera USB ngoài",
    "steps": [
      "1. Tại popup Mở ca trực, quan sát dropdown danh sách camera khả dụng.",
      "2. Nhấp chọn camera khác trong danh sách dropdown."
    ],
    "expected": [
      "Khung Live Preview chuyển đổi nguồn video sang camera vừa chọn mượt mà, không bị treo trình duyệt."
    ]
  },
  {
    "id": "TC-AUTH-008",
    "module": "M01",
    "priority": "P2",
    "name": "Hủy mở ca trực (Hủy chụp ảnh vào ca)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Khi popup \"Xác nhận chụp ảnh vào ca\" hiển thị, nhấn nút \"Hủy bỏ\"."
    ],
    "expected": [
      "Hệ thống hủy phiên đăng nhập trạm, giải phóng luồng camera và quay lại màn hình Đăng nhập ban đầu."
    ]
  },
  {
    "id": "TC-AUTH-009",
    "module": "M01",
    "priority": "P1",
    "name": "Mở ca trực dự phòng bằng thẻ CCCD gắn chip (Khi Camera hỏng)",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "testData": "Thẻ CCCD của nhân viên đăng nhập, tài khoản có quyền AllowCccdShiftAuth",
    "precondition": "Admin đã kích hoạt quyền \"Cho phép dùng CCCD mở ca (AllowCccdShiftAuth)\" cho nhân viên này.",
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
    "testData": "Quẹt thẻ CCCD của công dân khác không trùng hồ sơ nhân viên",
    "steps": [
      "1. Chọn mở ca bằng CCCD dự phòng.",
      "2. Quẹt thẻ CCCD không trùng với số CCCD lưu trong hồ sơ tài khoản đang đăng nhập."
    ],
    "expected": [
      "Hệ thống từ chối mở ca và báo lỗi: \"Số CCCD không khớp với hồ sơ nhân viên trong hệ thống.\""
    ]
  },
  {
    "id": "TC-AUTH-011",
    "module": "M01",
    "priority": "P1",
    "name": "Tách biệt nghiệp vụ: \"Đăng xuất\" (thoát UI) vs \"Rời ca\" (kết thúc ca trực)",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Nhân viên đang trong ca trực.",
    "steps": [
      "1. Nhấp nút \"Đăng xuất\" trên thanh Header (nút bên cạnh nút Rời ca màu đỏ).",
      "2. Kiểm tra thông báo và trạng thái phiên trực trên hệ thống."
    ],
    "expected": [
      "Hệ thống xóa token phiên giao diện và quay về màn hình Login.",
      "Ca trực (ShiftSession) vẫn tiếp tục DUY TRÌ chạy ngầm, không bị đóng để bàn giao ca tạm thời."
    ]
  },
  {
    "id": "TC-AUTH-012",
    "module": "M01",
    "priority": "P1",
    "name": "Kết thúc ca trực (\"Rời ca\"): Chụp ảnh bàn giao và đóng ShiftSession",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Nhân viên đang trong ca trực.",
    "steps": [
      "1. Nhấp nút màu đỏ \"Rời ca\" trên thanh Header.",
      "2. Popup \"Xác nhận rời ca trực\" hiển thị live webcam.",
      "3. Nhấn nút \"Rời ca\" để xác nhận chụp ảnh kết thúc phiên trực."
    ],
    "expected": [
      "Hệ thống chụp ảnh kết thúc ca, gọi API /station/shift-sessions/end.",
      "ShiftSession cập nhật thời gian ra EndTime, chuyển trạng thái Ended.",
      "Màn hình tự động quay về trang Đăng nhập trạm."
    ]
  },
  {
    "id": "TC-AUTH-013",
    "module": "M01",
    "priority": "P2",
    "name": "Khôi phục ca trực sau Reload (F5) hoặc mở lại trình duyệt",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Nhân viên đang trong ca trực.",
    "steps": [
      "1. Đang làm việc trên Dashboard trạm, nhấn phím F5 hoặc đóng tab và mở lại URL /staff.html."
    ],
    "expected": [
      "Hệ thống tự động đọc token lưu trong localStorage, gọi /station/auth/status và /station/shift-sessions/active.",
      "Hiển thị thẳng vào Dashboard làm việc, không bắt đăng nhập hay mở ca lại."
    ]
  },
  {
    "id": "TC-AUTH-014",
    "module": "M01",
    "priority": "P1",
    "name": "Đăng nhập Phân hệ Quản trị Admin: Yêu cầu Mật khẩu & Xử lý xung đột phiên",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Tài khoản: admin, Mật khẩu: 123456 (hoặc tài khoản quản trị hợp lệ)",
    "steps": [
      "1. Truy cập /admin.html (hoặc /staff.html?login_as=admin).",
      "2. Nhập tên tài khoản và mật khẩu admin.",
      "3. Thử nhấp biểu tượng mắt kính để ẩn/hiện mật khẩu, sau đó nhấn Đăng nhập."
    ],
    "expected": [
      "Hệ thống xác thực mật khẩu qua thuật toán băm bảo mật.",
      "Nếu phát hiện tài khoản đang đăng nhập nơi khác, cung cấp nút \"Ép Đăng Xuất Phiên Cũ\".",
      "Đăng nhập thành công chuyển hướng vào trang Quản trị Admin với đầy đủ menu sidebar."
    ]
  },
  {
    "id": "TC-CKIN-001",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in Khách đi bộ cơ bản: Nhập thủ công đầy đủ thông tin",
    "platform": "Giao diện Web Trực ban",
    "testData": "Họ tên: Nguyễn Văn An, CCCD: 001099000001, SĐT: 0988111222, Cơ quan: Cty ABC, Cán bộ tiếp: Đồng chí Nam, Mục đích: Làm việc chuyên môn",
    "precondition": "Nhân viên đã mở ca trực tại trạm gác.",
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
    "testData": "Thẻ CCCD gắn chip thật, DeviceService đang chạy WebSocket ws://localhost:6025/ws",
    "steps": [
      "1. Mở modal Check-in.",
      "2. Đặt thẻ CCCD gắn chip lên đầu đọc thẻ PCSC.",
      "3. Quan sát các trường trên form Check-in."
    ],
    "expected": [
      "DeviceService đọc chip và đẩy dữ liệu qua WebSocket.",
      "Form tự động điền: Họ tên, Số CCCD 12 số, Ngày sinh, Giới tính, Quê quán, Địa chỉ thường trú.",
      "Hiển thị huy hiệu xác thực chip màu xanh lá bảo đảm tính pháp lý."
    ]
  },
  {
    "id": "TC-CKIN-003",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in tự động bằng quét mã QR thẻ CCCD qua máy quét 2D",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "testData": "Máy quét mã vạch 2D kết nối cổng USB HID",
    "steps": [
      "1. Mở modal Check-in.",
      "2. Đưa vùng mã QR trên thẻ CCCD qua luồng sáng của máy quét 2D."
    ],
    "expected": [
      "Máy quét bíp và gửi chuỗi QR chuẩn Bộ Công An vào ứng dụng.",
      "Hệ thống tự động giải mã chuỗi chuẩn, bóc tách chính xác Số CCCD, CMND cũ, Họ tên, Ngày sinh, Giới tính, Địa chỉ."
    ]
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
    ]
  },
  {
    "id": "TC-CKIN-005",
    "module": "M02",
    "priority": "P2",
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
    ]
  },
  {
    "id": "TC-CKIN-006",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in cấp Thẻ Định Danh (RFID / Mã thẻ an ninh cụ thể)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Mã thẻ định danh: \"CARD-8801\"",
    "steps": [
      "1. Tại phần Cấp thẻ an ninh trên form Check-in, chọn loại thẻ \"Thẻ định danh (Identity)\".",
      "2. Nhập mã thẻ \"CARD-8801\" (hoặc quẹt thẻ qua đầu đọc RFID).",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Lượt khách lưu trường CardNumber = \"CARD-8801\", IsCardIssued = true, CardType = \"identity\".",
      "Trên bảng Dashboard hiển thị thông tin thẻ phát \"1\", trạng thái \"Giữ 1 thẻ\"."
    ]
  },
  {
    "id": "TC-CKIN-007",
    "module": "M02",
    "priority": "P1",
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
    ]
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
    ]
  },
  {
    "id": "TC-CKIN-009",
    "module": "M02",
    "priority": "P1",
    "name": "Check-in có Phương tiện: Đăng ký loại xe từ danh mục chuẩn hóa",
    "platform": "Giao diện Web Trực ban",
    "testData": "Loại xe: \"Ô tô 7 chỗ\", Biển số: \"30H-999.88\"",
    "steps": [
      "1. Chuyển sang tab Phương tiện trên form Check-in.",
      "2. Chọn loại xe từ danh mục chuẩn (STANDARD_VEHICLE_TYPES: Ô tô, Xe máy, Xe tải...).",
      "3. Nhập Biển số xe \"30H-999.88\", chủ xe gán cho khách chính.",
      "4. Hoàn tất Check-in."
    ],
    "expected": [
      "Bản ghi Vehicle được tạo liên kết với Visit, lưu PlateNumber = \"30H-999.88\", Type = \"Ô tô 7 chỗ\".",
      "Dashboard hiển thị thẻ biển số \"30H-999.88 (Ô tô 7 chỗ)\", đếm \"Xe: Đăng ký 1 — Còn bên trong: 1\"."
    ]
  },
  {
    "id": "TC-CKIN-010",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Chặn trùng CCCD: Khách có số CCCD đang ở bên trong",
    "platform": "Giao diện Web Trực ban",
    "testData": "Số CCCD \"001099000001\" của khách đang ở trong cơ quan",
    "steps": [
      "1. Mở modal Check-in khách mới.",
      "2. Nhập số CCCD \"001099000001\".",
      "3. Quan sát thông báo kiểm tra ràng buộc chéo (Cross-visit constraint)."
    ],
    "expected": [
      "Hệ thống hiển thị cảnh báo đỏ ngay dưới ô nhập CCCD: \"Số CCCD này hiện đang có 1 lượt khách ở trong đơn vị chưa Checkout.\"",
      "Nút Check-in bị chặn, không cho phép gửi trùng lặp."
    ]
  },
  {
    "id": "TC-CKIN-011",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Chặn trùng Thẻ An Ninh: Mã thẻ đang cấp cho lượt khác chưa trả",
    "platform": "Giao diện Web Trực ban",
    "testData": "Mã thẻ \"CARD-8801\" đang được khách khác giữ",
    "steps": [
      "1. Mở modal Check-in, nhập mã thẻ \"CARD-8801\"."
    ],
    "expected": [
      "Hệ thống phát hiện mã thẻ đang active trong danh sách thẻ chưa trả.",
      "Hiển thị cảnh báo lỗi: \"Mã thẻ này đang được sử dụng bởi khách khác bên trong đơn vị.\""
    ]
  },
  {
    "id": "TC-CKIN-012",
    "module": "M02",
    "priority": "P1",
    "name": "Validation Chặn trùng Biển số xe: Phương tiện đang ở bên trong cơ quan",
    "platform": "Giao diện Web Trực ban",
    "testData": "Biển số xe \"30H-999.88\" đang trong đơn vị chưa ra",
    "steps": [
      "1. Mở modal Check-in, thêm phương tiện với biển số \"30H-999.88\"."
    ],
    "expected": [
      "Hệ thống cảnh báo: \"Biển số xe 30H-999.88 hiện đang ở trong đơn vị chưa Checkout.\""
    ]
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
    ]
  },
  {
    "id": "TC-CKIN-014",
    "module": "M02",
    "priority": "P2",
    "name": "Tự động Upsert gợi ý Khách quen khi nhập số CCCD cũ",
    "platform": "Giao diện Web Trực ban",
    "testData": "Số CCCD của khách đã từng đến làm việc tuần trước",
    "steps": [
      "1. Mở modal Check-in, gõ số CCCD cũ.",
      "2. Rời tiêu điểm (blur) khỏi ô nhập CCCD."
    ],
    "expected": [
      "Hệ thống tự động tra cứu và điền sẵn Họ tên, Số điện thoại và Cơ quan của khách từ lịch sử.",
      "Tiết kiệm thời gian gõ phím cho nhân viên trực ban."
    ]
  },
  {
    "id": "TC-CKIN-015",
    "module": "M02",
    "priority": "P2",
    "name": "Chụp ảnh phương tiện (Biển số xe và đầu xe) khi Check-in",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại tab Phương tiện, nhấp nút chụp ảnh phương tiện.",
      "2. Chụp biển số và đầu xe ô tô."
    ],
    "expected": [
      "Ảnh xe được đính kèm vào phương tiện, lưu vào CSDL làm cơ sở đối soát lúc xe ra."
    ]
  },
  {
    "id": "TC-COMP-001",
    "module": "M03",
    "priority": "P1",
    "name": "Tạo đoàn Check-in ban đầu: Thêm nhiều Người đi cùng có danh tính",
    "platform": "Giao diện Web Trực ban",
    "testData": "Trưởng đoàn + 2 người đi cùng (Trần Thị B, Lê Văn C)",
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
    ]
  },
  {
    "id": "TC-COMP-002",
    "module": "M03",
    "priority": "P1",
    "name": "Đọc Chip CCCD hoặc Quét QR độc lập cho từng Người đi cùng",
    "platform": "Giao diện Web Trực ban & Thiết bị",
    "steps": [
      "1. Tại tab Người đi cùng, chọn thành viên thứ 2.",
      "2. Nhấn nút \"Quét chip\" (hoặc \"Quét QR\") dành riêng cho thành viên này.",
      "3. Đặt thẻ CCCD của thành viên lên đầu đọc."
    ],
    "expected": [
      "Thông tin cá nhân của thành viên thứ 2 được điền chính xác, không ghi đè vào thông tin của Trưởng đoàn."
    ]
  },
  {
    "id": "TC-COMP-003",
    "module": "M03",
    "priority": "P2",
    "name": "Chụp ảnh chân dung và giấy tờ riêng cho từng Người đi cùng",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại mục của Người đi cùng, nhấn nút Camera chụp ảnh chân dung.",
      "2. Nhấn Multi-shot chụp ảnh giấy tờ của người đi cùng."
    ],
    "expected": [
      "Ảnh của người đi cùng được lưu riêng biệt vào trường PhotoPath / DocumentPhoto của đối tượng AccompanyingPerson."
    ]
  },
  {
    "id": "TC-COMP-004",
    "module": "M03",
    "priority": "P1",
    "name": "Cấp phát thẻ linh hoạt cho từng Người đi cùng",
    "platform": "Giao diện Web Trực ban",
    "testData": "Người 1 nhận thẻ định danh \"CARD-101\", Người 2 nhận thẻ thường, Trưởng đoàn nhận thẻ định danh \"CARD-100\"",
    "steps": [
      "1. Thiết lập thẻ cho Trưởng đoàn và từng người đi cùng theo các cấu hình khác nhau.",
      "2. Hoàn tất Check-in."
    ],
    "expected": [
      "Hệ thống tính tổng số thẻ phát = 3 (2 thẻ định danh + 1 thẻ thường).",
      "Dashboard hiển thị chính xác: \"Thẻ: Phát 3 — Thu 0 | Đang giữ: 3\"."
    ]
  },
  {
    "id": "TC-COMP-005",
    "module": "M03",
    "priority": "P1",
    "name": "Khai báo Đoàn vô danh (Số lượng khách đi cùng không cần khai báo tên)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Đoàn công nhân xây dựng 10 người vô danh + 1 Trưởng đoàn",
    "steps": [
      "1. Tại tab \"Đoàn vô danh (Anonymous)\", nhập số lượng khách vô danh: 10.",
      "2. Không cần điền tên hay CCCD của 10 người này.",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Hệ thống lưu TotalGuests = 11 (1 trưởng đoàn + 10 vô danh).",
      "Dashboard hiển thị \"11/11 khách\"."
    ]
  },
  {
    "id": "TC-COMP-006",
    "module": "M03",
    "priority": "P1",
    "name": "Cấp phát thẻ cho Đoàn vô danh: Thẻ thường và Danh sách thẻ RFID",
    "platform": "Giao diện Web Trực ban",
    "testData": "Cấp 10 thẻ thường và thêm 2 thẻ định danh RFID cho khách trong đoàn vô danh",
    "steps": [
      "1. Nhập số lượng thẻ thường cho đoàn vô danh: 10.",
      "2. Nhập thêm danh sách mã thẻ RFID định danh: \"CARD-A1\", \"CARD-A2\".",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "CSDL lưu AnonymousCardCount = 10, AnonymousIdentityCardNumbers = [\"CARD-A1\", \"CARD-A2\"].",
      "Tổng số thẻ an ninh đoàn đang giữ được tính toán chuẩn xác."
    ]
  },
  {
    "id": "TC-COMP-007",
    "module": "M03",
    "priority": "P2",
    "name": "Đăng ký nhiều Phương tiện cho đoàn: Gán chủ xe linh hoạt",
    "platform": "Giao diện Web Trực ban",
    "testData": "1 xe khách 29 chỗ (chủ xe: Đoàn) + 1 xe ô tô 4 chỗ (chủ xe: Trưởng đoàn)",
    "steps": [
      "1. Thêm 2 phương tiện trong tab Xe cộ.",
      "2. Gán xe 1 cho Trưởng đoàn, xe 2 cho Đoàn vô danh.",
      "3. Hoàn tất Check-in."
    ],
    "expected": [
      "Tạo 2 bản ghi Vehicle với OwnerType tương ứng (MAIN và ANONYMOUSGROUP).",
      "Dashboard hiển thị đầy đủ cả 2 biển số xe trên dòng lượt khách."
    ]
  },
  {
    "id": "TC-COMP-008",
    "module": "M03",
    "priority": "P1",
    "name": "Bổ sung Người đi cùng vào đoàn đang ở bên trong qua SupplementalCheckInModal",
    "platform": "Giao diện Web Trực ban",
    "testData": "Lượt khách đang inside, có thêm 2 thành viên đến muộn",
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
    ]
  },
  {
    "id": "TC-COMP-009",
    "module": "M03",
    "priority": "P2",
    "name": "Bổ sung Phương tiện vào đoàn đang ở bên trong qua SupplementalCheckInModal",
    "platform": "Giao diện Web Trực ban",
    "testData": "Xe ô tô chở vật tư đến sau tham gia vào đoàn",
    "steps": [
      "1. Mở SupplementalCheckInModal của lượt khách đang inside.",
      "2. Tại tab Xe cộ, thêm 1 xe ô tô tải biển số \"29C-123.45\".",
      "3. Nhấn Xác nhận bổ sung."
    ],
    "expected": [
      "Phương tiện mới được gắn vào Visit, số lượng xe của lượt khách tăng lên, hiển thị biển số mới trên Dashboard."
    ]
  },
  {
    "id": "TC-COMP-010",
    "module": "M03",
    "priority": "P1",
    "name": "Nghiệp vụ Cấp bù thẻ thiếu (Tab missing_cards trong SupplementalCheckInModal)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Thành viên lúc Check-in chưa được nhận thẻ, nay phát bù",
    "steps": [
      "1. Mở SupplementalCheckInModal, chọn tab \"Cấp bù thẻ thiếu (missing_cards)\".",
      "2. Chọn thành viên đang thiếu thẻ, nhập mã thẻ mới cấp bù.",
      "3. Xác nhận cập nhật."
    ],
    "expected": [
      "Hệ thống cập nhật thành viên sang trạng thái IsCardIssued = true kèm mã thẻ mới.",
      "Bộ đếm thẻ đang giữ của lượt khách tăng lên chính xác."
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-COMP-014",
    "module": "M03",
    "priority": "P2",
    "name": "Lưu vết lịch sử đợt bổ sung thành viên",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Thực hiện bổ sung thành viên lần 1, sau đó bổ sung tiếp lần 2.",
      "2. Mở tab Timeline trong VisitDetailsModal để kiểm tra."
    ],
    "expected": [
      "Hiển thị rõ các sự kiện \"ADD\" (Bổ sung) riêng biệt kèm đợt (Batch), thời gian, tên trạm và tên cán bộ thực hiện."
    ]
  },
  {
    "id": "TC-COUT-001",
    "module": "M04",
    "priority": "P1",
    "name": "Check-out Toàn bộ đoàn: Thu hồi tất cả thẻ và đóng lượt khách",
    "platform": "Giao diện Web Trực ban",
    "precondition": "Lượt khách đang inside, đã có thẻ và phương tiện.",
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
    ]
  },
  {
    "id": "TC-COUT-002",
    "module": "M04",
    "priority": "P1",
    "name": "Check-out Từng phần: Một số thành viên về trước, người khác ở lại",
    "platform": "Giao diện Web Trực ban",
    "testData": "Đoàn 5 người, 2 người về trước, 3 người ở lại làm việc",
    "steps": [
      "1. Mở CheckOutModal.",
      "2. Chỉ tích chọn 2 người cần checkout, bỏ tích Trưởng đoàn và các thành viên còn lại.",
      "3. Thu hồi thẻ của 2 người về trước.",
      "4. Xác nhận Checkout."
    ],
    "expected": [
      "Hệ thống cập nhật CheckOutTime cho 2 thành viên được chọn, thu hồi thẻ của họ.",
      "Lượt khách VẪN GIỮ trạng thái \"Trong đơn vị\", quân số inside hiển thị \"3/5 khách\"."
    ]
  },
  {
    "id": "TC-COUT-003",
    "module": "M04",
    "priority": "P1",
    "name": "Check-out Xe riêng độc lập: Xe ra trước người (hoặc người ra xe ở lại)",
    "platform": "Giao diện Web Trực ban",
    "testData": "Khách gửi xe ô tô trong bãi qua đêm, người đi taxi về trước",
    "steps": [
      "1. Mở CheckOutModal, checkout toàn bộ người nhưng BỎ TÍCH ô xe ô tô (hoặc ngược lại: checkout xe riêng từ modal Chi tiết).",
      "2. Xác nhận."
    ],
    "expected": [
      "Người đã ra về nhưng xe vẫn còn trong bãi.",
      "Dashboard hiển thị huy hiệu màu cam nhấp nháy: \"Chờ checkout xe\", lượt khách chưa bị đóng hoàn toàn."
    ]
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
    ]
  },
  {
    "id": "TC-COUT-005",
    "module": "M04",
    "priority": "P1",
    "name": "Thu hồi Thẻ Thường (Đếm số lượng): Cho phép trả đủ hoặc trả 1 phần",
    "platform": "Giao diện Web Trực ban",
    "testData": "Đoàn giữ 5 thẻ thường, lúc về chỉ trả 3 thẻ",
    "steps": [
      "1. Tại ô số lượng thẻ thường thu hồi, nhập 3 / 5 thẻ.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Hệ thống cập nhật AnonymousCardReturnedCount = 3.",
      "Dashboard hiển thị: \"Thẻ: Phát 5 — Thu 3 | Đang giữ: 2\"."
    ]
  },
  {
    "id": "TC-COUT-006",
    "module": "M04",
    "priority": "P1",
    "name": "Thu hồi Thẻ của Đoàn vô danh (Cả thẻ thường và thẻ RFID danh sách)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại CheckOutModal của đoàn vô danh, tích chọn các mã thẻ RFID trả lại và số lượng thẻ thường trả lại.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Danh sách returnedAnonymousIdentityCardNumbers được cập nhật trong CSDL, thẻ được hoàn trả kho an ninh."
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-COUT-009",
    "module": "M04",
    "priority": "P2",
    "name": "Chụp ảnh Webcam tại thời điểm Check-out làm bằng chứng bàn giao",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Tại CheckOutModal, nhấn nút chụp ảnh camera lúc khách ra về.",
      "2. Xác nhận Checkout."
    ],
    "expected": [
      "Ảnh checkout được lưu vào CSDL, hiển thị đối sánh trong modal Chi tiết lượt khách."
    ]
  },
  {
    "id": "TC-COUT-010",
    "module": "M04",
    "priority": "P1",
    "name": "Nghiệp vụ THU HỒI THẺ MẤT: Tra cứu theo Mã số thẻ (RecoverLostCardModal)",
    "platform": "Giao diện Web Trực ban & Admin",
    "testData": "Thẻ an ninh đã bị báo mất hôm qua được tìm thấy",
    "steps": [
      "1. Mở modal \"Thu hồi thẻ mất (RecoverLostCardModal)\" từ menu Tiện ích hoặc modal Chi tiết.",
      "2. Chọn tab \"Thẻ định danh (Identity)\".",
      "3. Nhập mã thẻ đã báo mất, nhấn nút \"Tra cứu\"."
    ],
    "expected": [
      "Hệ thống tra cứu API /station/cards/lookup-lost (hoặc /admin/cards/lookup-lost).",
      "Hiển thị chính xác thông tin: Tên khách làm mất, CCCD, Ngày giờ báo mất, Trạm tiếp nhận."
    ]
  },
  {
    "id": "TC-COUT-011",
    "module": "M04",
    "priority": "P1",
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
    ]
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
    ]
  },
  {
    "id": "TC-COUT-013",
    "module": "M04",
    "priority": "P2",
    "name": "Xử lý lượt khách hết người nhưng xe còn bên trong",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Quan sát dòng lượt khách có insideGuests = 0 nhưng xe chưa checkout."
    ],
    "expected": [
      "Cột Trạng thái hiển thị huy hiệu viền cam: \"Chờ checkout xe\".",
      "Nút \"Checkout\" vẫn hiển thị để nhân viên cho xe ra khi chủ xe quay lại lấy."
    ]
  },
  {
    "id": "TC-COUT-014",
    "module": "M04",
    "priority": "P2",
    "name": "Xử lý lượt khách hết người nhưng thẻ còn nợ",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Quan sát dòng lượt khách có insideGuests = 0 nhưng còn giữ thẻ chưa thu."
    ],
    "expected": [
      "Cột Trạng thái hiển thị huy hiệu viền vàng: \"Chờ thu thẻ\".",
      "Nút \"Checkout\" vẫn hiển thị để nhân viên thu hồi thẻ khi khách gửi trả."
    ]
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
    ]
  },
  {
    "id": "TC-DASH-001",
    "module": "M05",
    "priority": "P2",
    "name": "Header Trực ban hiển thị Realtime Live Clock tiếng Việt",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Quan sát thanh Header trạm gác (/staff.html)."
    ],
    "expected": [
      "Hiển thị chính xác Tên hệ thống, Tên trạm gác (MapPin), Thứ trong tuần, Ngày/tháng/năm và Giờ:phút:giây nhảy đều đặn từng giây.",
      "Avatar nhân viên có chấm xanh lá biểu thị trạng thái đang trong ca trực."
    ]
  },
  {
    "id": "TC-DASH-002",
    "module": "M05",
    "priority": "P1",
    "name": "Live Search đa đối tượng thông minh: Lọc tức thì danh sách khách",
    "platform": "Giao diện Web Trực ban",
    "testData": "Gõ từ khóa: \"30H\", \"An\", \"001099\", \"CARD\", \"Huy\"",
    "steps": [
      "1. Nhấp vào ô tìm kiếm nhanh trên Dashboard trạm.",
      "2. Gõ từ khóa tìm kiếm bất kỳ."
    ],
    "expected": [
      "Bảng danh sách lập tức lọc theo thời gian thực (Live Filter).",
      "Khớp với cả Tên khách, Số CCCD, Biển số xe, Mã thẻ an ninh, Cán bộ tiếp đón hoặc Mục đích làm việc."
    ]
  },
  {
    "id": "TC-DASH-003",
    "module": "M05",
    "priority": "P2",
    "name": "Phím tắt toàn cục Ctrl + K focus nhanh ô tìm kiếm",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Đang ở bất kỳ vị trí nào trên Dashboard, nhấn tổ hợp phím Ctrl + K (hoặc Cmd + K trên macOS)."
    ],
    "expected": [
      "Con trỏ chuột tự động focus vào ô tìm kiếm nhanh và bôi đen toàn bộ từ khóa hiện có để gõ mới ngay lập tức."
    ]
  },
  {
    "id": "TC-DASH-004",
    "module": "M05",
    "priority": "P1",
    "name": "Popover Lọc theo 5 nhóm đối tượng (Multi-Category Search Filter)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhập từ khóa vào ô tìm kiếm.",
      "2. Nhấn nút \"Chọn đối tượng\" (hoặc nút bộ lọc hiện ra bên cạnh ô tìm kiếm)."
    ],
    "expected": [
      "Popover hiển thị 5 nhóm đối tượng: Khách & Người đi cùng, Biển số & Phương tiện, Thẻ an ninh, Cán bộ & Phòng ban, Cơ quan & Mục đích.",
      "Cho phép tích chọn lọc trên từng nhóm mong muốn."
    ]
  },
  {
    "id": "TC-DASH-005",
    "module": "M05",
    "priority": "P2",
    "name": "Bộ đếm kết quả khớp thời gian thực (Match counter badges) trong Popover",
    "platform": "Giao diện Web Trực ban",
    "testData": "Gõ từ khóa có trong cả biển xe và tên khách",
    "steps": [
      "1. Gõ từ khóa và mở Popover lọc đối tượng."
    ],
    "expected": [
      "Mỗi nhóm đối tượng hiển thị huy hiệu đếm số lượng bản ghi khớp (vd: \"2 khớp\", \"5 khớp\").",
      "Người dùng dễ dàng biết từ khóa xuất hiện ở nhóm đối tượng nào."
    ]
  },
  {
    "id": "TC-DASH-006",
    "module": "M05",
    "priority": "P2",
    "name": "Nút Chọn tất cả / Bỏ chọn tất cả nhóm đối tượng tìm kiếm",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trong Popover lọc đối tượng, nhấn nút \"Bỏ chọn tất cả\", sau đó nhấn \"Chọn tất cả\"."
    ],
    "expected": [
      "Tất cả 5 nhóm đối tượng tự động đổi trạng thái checkbox tương ứng, danh sách kết quả cập nhật ngay lập tức."
    ]
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
    ]
  },
  {
    "id": "TC-DASH-008",
    "module": "M05",
    "priority": "P1",
    "name": "Tra cứu chuyên sâu đa tiêu chí trong AdvancedSearchModal",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trong AdvancedSearchModal, nhập Họ tên, chọn trạng thái \"Nợ thẻ (debt_card)\", chọn khoảng ngày.",
      "2. Nhấn nút \"Tìm kiếm\"."
    ],
    "expected": [
      "Gọi API tra cứu và trả về danh sách hồ sơ khớp chính xác.",
      "Có nút \"Chi tiết\" để mở xem hồ sơ trực tiếp từ kết quả tìm kiếm."
    ]
  },
  {
    "id": "TC-DASH-009",
    "module": "M05",
    "priority": "P2",
    "name": "Chế độ hiển thị thống kê tổng quan (Stats View Mode: Ẩn / Tinh gọn / Chi tiết)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Trên khối thống kê Dashboard, chuyển đổi qua lại giữa 3 chế độ: \"Hiện chi tiết\", \"Hiện tinh gọn\", và \"Ẩn thống kê\".",
      "2. Nhấn F5 tải lại trang."
    ],
    "expected": [
      "Khối thống kê thay đổi kích thước hoặc ẩn đi để tối đa hóa không gian bảng danh sách khách.",
      "Trạng thái được ghi nhớ vào localStorage (smartvms_stats_view_mode), không bị mất khi F5."
    ]
  },
  {
    "id": "TC-DASH-010",
    "module": "M05",
    "priority": "P2",
    "name": "Chế độ bảng danh sách khách (Table View Mode: Thu gọn Compact vs Chi tiết Detailed)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Mở menu Tiện ích, chuyển Chế độ xem bảng sang \"Thu gọn\".",
      "2. Quan sát bảng danh sách khách."
    ],
    "expected": [
      "Bảng ẩn avatar ảnh, giảm padding dòng, tăng số lượng lượt khách hiển thị trên màn hình.",
      "Chuyển về \"Chi tiết\" hiển thị lại ảnh avatar và các thông tin mở rộng."
    ]
  },
  {
    "id": "TC-DASH-011",
    "module": "M05",
    "priority": "P2",
    "name": "Tùy biến Màu sắc và Độ trong suốt hàng (DisplaySettingsModal)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Mở menu Tiện ích -> \"Cài đặt màu sắc\".",
      "2. Chọn màu hàng đang active, chỉnh thanh trượt độ mờ (Opacity), chọn màu hàng đã ra.",
      "3. Nhấn \"Lưu cấu hình\"."
    ],
    "expected": [
      "Bảng danh sách khách đổi màu nền và vạch viền chỉ thị đúng theo bảng màu vừa cấu hình."
    ]
  },
  {
    "id": "TC-DASH-012",
    "module": "M05",
    "priority": "P1",
    "name": "Bộ lọc nguồn dữ liệu (Source Filter: Tất cả / Trực ban cổng / Sổ sách ngoại lệ)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhấp dropdown bộ lọc Nguồn dữ liệu trên toolbar.",
      "2. Chọn \"Sổ sách ngoại lệ (dataentry)\"."
    ],
    "expected": [
      "Bảng chỉ hiển thị các lượt khách do nhân viên DataEntry tạo ra (có huy hiệu tím \"Sổ sách ngoại lệ\").",
      "Chọn \"Trực ban cổng (staff)\" chỉ hiển thị khách vào qua cổng trực tiếp."
    ]
  },
  {
    "id": "TC-DASH-013",
    "module": "M05",
    "priority": "P1",
    "name": "Bộ lọc thời gian: Lọc nhanh và Khoảng ngày chặn tương lai",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Chọn mốc thời gian nhanh: \"Hôm nay\", \"7 ngày qua\", \"Tuần này\", \"Tháng này\".",
      "2. Chọn khoảng ngày tùy chọn, thử chọn ngày mai (tương lai)."
    ],
    "expected": [
      "Hàm clampDateInputToToday tự động chặn không cho chọn ngày vượt quá hôm nay.",
      "Bảng dữ liệu làm mới chính xác theo khoảng ngày đã chọn."
    ]
  },
  {
    "id": "TC-DASH-014",
    "module": "M05",
    "priority": "P2",
    "name": "Menu gom nhóm Tiện ích & Tùy chọn (SlidersHorizontal dropdown)",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Nhấp nút \"Tiện ích\" trên toolbar bên cạnh nút Check-in."
    ],
    "expected": [
      "Menu dropdown mở ra chứa gọn gàng 4 mục: Tra cứu hồ sơ nâng cao, Chế độ xem bảng, Cài đặt màu sắc, Thu hồi thẻ mất."
    ]
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
    ]
  },
  {
    "id": "TC-VDET-002",
    "module": "M06",
    "priority": "P1",
    "name": "Tab Tổng quan (Overview): Thẻ KPI tóm tắt đầy đủ chỉ số",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Quan sát Tab Tổng quan của VisitDetailsModal."
    ],
    "expected": [
      "Hiển thị thông tin Khách đại diện, Cán bộ tiếp đón, Mục đích, Cơ quan.",
      "5 Thẻ KPI: Quân số hiện tại, Thẻ định danh đang giữ, Thẻ thường đang giữ, Phương tiện, Thẻ mất."
    ]
  },
  {
    "id": "TC-VDET-003",
    "module": "M06",
    "priority": "P2",
    "name": "Cửa sổ con xem nhanh Quân số chi tiết từ Tab Tổng quan",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Tại Tab Tổng quan, nhấp vào Thẻ KPI Quân số (hoặc nút xem chi tiết quân số)."
    ],
    "expected": [
      "Cửa sổ con mở ra liệt kê danh sách từng người, giờ vào, giờ ra và trạng thái cụ thể."
    ]
  },
  {
    "id": "TC-VDET-004",
    "module": "M06",
    "priority": "P2",
    "name": "Cửa sổ con xem nhanh Thẻ an ninh & Thẻ thường từ Tab Tổng quan",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấp vào Thẻ KPI Thẻ định danh hoặc Thẻ thường."
    ],
    "expected": [
      "Cửa sổ con mở ra hiển thị bảng danh sách các mã thẻ đã cấp, người đang giữ, trạng thái đã thu hồi hay đang nợ."
    ]
  },
  {
    "id": "TC-VDET-005",
    "module": "M06",
    "priority": "P1",
    "name": "Cửa sổ con xem nhanh Phương tiện & Checkout từng xe trực tiếp",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấp vào Thẻ KPI Phương tiện.",
      "2. Trong danh sách xe, chọn 1 xe đang ở bên trong và nhấn nút \"Checkout xe này\"."
    ],
    "expected": [
      "Hệ thống gọi API /visits/vehicle-checkout, cập nhật giờ ra riêng cho xe đó ngay lập tức mà không ảnh hưởng tới người."
    ]
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
    ]
  },
  {
    "id": "TC-VDET-007",
    "module": "M06",
    "priority": "P2",
    "name": "Đổi chiều sắp xếp Timeline: Mới nhất trước vs Cũ nhất trước",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Tại Tab Timeline, nhấn nút chuyển đổi thứ tự sắp xếp."
    ],
    "expected": [
      "Danh sách sự kiện đảo chiều sắp xếp Newest First <-> Oldest First tức thì."
    ]
  },
  {
    "id": "TC-VDET-008",
    "module": "M06",
    "priority": "P2",
    "name": "Thu gọn / Mở rộng chi tiết từng đợt sự kiện Timeline",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấp vào tiêu đề của một đợt sự kiện để đóng/mở chi tiết."
    ],
    "expected": [
      "Mở rộng xem chi tiết danh sách người vào/ra, xe vào/ra và thẻ thu hồi trong đợt đó."
    ]
  },
  {
    "id": "TC-VDET-009",
    "module": "M06",
    "priority": "P1",
    "name": "Tab Thành viên (Members): Danh sách toàn diện thành viên trong đoàn",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Chuyển sang Tab \"THÀNH VIÊN (Members)\"."
    ],
    "expected": [
      "Liệt kê đầy đủ Trưởng đoàn, Người đi cùng có danh tính và Khách vô danh.",
      "Hiển thị rõ ảnh chân dung, CCCD, mã thẻ đang giữ và trạng thái Vào/Ra."
    ]
  },
  {
    "id": "TC-VDET-010",
    "module": "M06",
    "priority": "P2",
    "name": "Thư viện Đa Ảnh Lượt thăm (VisitPhotoGalleryModal + ZoomableImage)",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấn nút \"Thư viện ảnh\" trong modal Chi tiết.",
      "2. Nhấp vào một ảnh để xem ở chế độ phóng to."
    ],
    "expected": [
      "VisitPhotoGalleryModal mở ra hiển thị lưới tất cả ảnh (Chân dung, Giấy tờ, Xe cộ, Checkout).",
      "ZoomableImage cho phép phóng to, thu nhỏ và di chuyển xem chi tiết nét ảnh."
    ]
  },
  {
    "id": "TC-VDET-011",
    "module": "M06",
    "priority": "P1",
    "name": "Nút hành động nhanh liên thông từ modal Chi tiết",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Trong modal Chi tiết, nhấn nút \"Bổ sung người\", \"Checkout\", hoặc \"Thu hồi thẻ mất\"."
    ],
    "expected": [
      "Mở modal thao tác tương ứng với lượt khách đã được chọn sẵn, không cần tìm lại trên bảng."
    ]
  },
  {
    "id": "TC-VDET-012",
    "module": "M06",
    "priority": "P2",
    "name": "Đóng modal Chi tiết bằng phím Escape hoặc nút đóng ✕",
    "platform": "Giao diện Web Trực ban & Admin",
    "steps": [
      "1. Nhấn phím Escape trên bàn phím hoặc nhấp nút ✕."
    ],
    "expected": [
      "Modal đóng mượt mà, phục hồi lại vị trí scroll của bảng dữ liệu phía dưới."
    ]
  },
  {
    "id": "TC-DENT-001",
    "module": "M07",
    "priority": "P1",
    "name": "Đăng nhập Phân hệ Sổ sách Ngoại lệ (/dataentry.html)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "testData": "Tài khoản: nhaplieu, Mật khẩu: 123456 (Role: DataEntry)",
    "steps": [
      "1. Đăng nhập tài khoản nhaplieu tại form đăng nhập.",
      "2. Hệ thống tự động chuyển hướng sang trang /dataentry.html."
    ],
    "expected": [
      "Giao diện chuyên biệt của Phân hệ Nhập liệu Sổ sách Ngoại lệ hiển thị.",
      "Header hiển thị rõ tên nhân viên nhập liệu, địa điểm và các nút phím tắt F1, F3."
    ]
  },
  {
    "id": "TC-DENT-002",
    "module": "M07",
    "priority": "P2",
    "name": "Thao tác Phím tắt toàn cục trong DataEntry: F1, F3, Escape",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Nhấn phím F1 -> Modal \"DataEntryModal\" mở ra.",
      "2. Nhấn Escape -> Modal đóng lại.",
      "3. Nhấn phím F3 -> Modal Hướng dẫn quy trình mở ra."
    ],
    "expected": [
      "Các phím tắt hoạt động nhạy bén, ngăn chặn hành vi mặc định của trình duyệt (F1 help, F3 find)."
    ]
  },
  {
    "id": "TC-DENT-003",
    "module": "M07",
    "priority": "P1",
    "name": "Form Nhập sổ sách ngoại lệ (DataEntryModal): Nhập hồi tố ngày giờ quá khứ",
    "platform": "Phân hệ Sổ sách DataEntry",
    "testData": "Hồ sơ khách từ sổ giấy tuần trước: Giờ vào 08:30 ngày 01/10/2026",
    "steps": [
      "1. Mở DataEntryModal (F1).",
      "2. Chọn ngày giờ vào trong quá khứ (Backdate).",
      "3. Chọn Trạm tiếp đón và Cán bộ trực tiếp nhận từ sổ ghi chép."
    ],
    "expected": [
      "Hệ thống cho phép lưu ngày giờ quá khứ hợp lệ, gán đúng trạm và cán bộ trực của thời điểm đó."
    ]
  },
  {
    "id": "TC-DENT-004",
    "module": "M07",
    "priority": "P1",
    "name": "Nhập đồng thời cả Check-in và Check-out (Khách đã vào và ra trong quá khứ)",
    "platform": "Phân hệ Sổ sách DataEntry",
    "testData": "Giờ vào 09:00, Giờ ra 11:30 ngày 02/10/2026",
    "steps": [
      "1. Bật tùy chọn \"Đã hoàn tất Check-out (Khách đã ra về)\".",
      "2. Nhập giờ ra, chọn trạm ra và trạng thái thẻ (Đã trả / Nợ thẻ / Mất thẻ).",
      "3. Nhấn nút \"Lưu hồ sơ sổ sách\"."
    ],
    "expected": [
      "Lưu lượt khách với Status = 2 (Đã ra), CheckInTime và CheckOutTime đầy đủ.",
      "Không làm tăng quân số inside hiện tại của cơ quan."
    ]
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
    ]
  },
  {
    "id": "TC-DENT-006",
    "module": "M07",
    "priority": "P1",
    "name": "Nhập đoàn đông người, người đi cùng và nhiều phương tiện từ sổ trực",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Trong DataEntryModal, thêm 3 người đi cùng, 10 khách vô danh và 2 xe ô tô.",
      "2. Lưu hồ sơ."
    ],
    "expected": [
      "Tạo đầy đủ cấu trúc đoàn, thành viên và phương tiện trong CSDL SQLite."
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-DENT-009",
    "module": "M07",
    "priority": "P1",
    "name": "Bổ sung người đi cùng sổ sách qua DataEntrySupplementalModal",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Trên hồ sơ sổ sách đang inside, nhấn nút \"Thêm\".",
      "2. Thêm người đi cùng và phương tiện bổ sung."
    ],
    "expected": [
      "Cập nhật bổ sung thành công, gắn nhãn do tài khoản DataEntry thực hiện."
    ]
  },
  {
    "id": "TC-DENT-010",
    "module": "M07",
    "priority": "P1",
    "name": "Checkout sổ sách qua DataEntryCheckOutModal",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Trên hồ sơ sổ sách đang inside, nhấn nút \"Checkout\".",
      "2. Xác nhận thời gian ra và tình trạng thẻ."
    ],
    "expected": [
      "Hồ sơ chuyển trạng thái CheckedOut thành công từ giao diện DataEntry."
    ]
  },
  {
    "id": "TC-DENT-011",
    "module": "M07",
    "priority": "P1",
    "name": "Thu hồi thẻ mất từ giao diện DataEntry",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Mở RecoverLostCardModal từ giao diện DataEntry.",
      "2. Tra cứu và hoàn tất thu hồi thẻ mất phát sinh từ hồ sơ sổ sách."
    ],
    "expected": [
      "Thẻ mất được thu hồi thành công, cập nhật kho thẻ dùng chung của đơn vị."
    ]
  },
  {
    "id": "TC-DENT-012",
    "module": "M07",
    "priority": "P2",
    "name": "Xuất báo cáo Excel danh sách hồ sơ sổ sách đã nhập để đối soát",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Nhấn nút \"Xuất Excel\" trên Dashboard DataEntry."
    ],
    "expected": [
      "Tải về file Excel chứa toàn bộ danh sách hồ sơ sổ sách kèm người nhập, thời gian và địa điểm."
    ]
  },
  {
    "id": "TC-DENT-013",
    "module": "M07",
    "priority": "P1",
    "name": "Xem chi tiết lượt khách sổ sách qua modal VisitDetailsModal",
    "platform": "Phân hệ Sổ sách DataEntry",
    "steps": [
      "1. Nhấn nút \"Chi tiết\" trên một dòng hồ sơ DataEntry."
    ],
    "expected": [
      "Mở VisitDetailsModal hiển thị đầy đủ thông tin, timeline và thành viên đồng bộ như trạm gác."
    ]
  },
  {
    "id": "TC-DENT-014",
    "module": "M07",
    "priority": "P1",
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
    ]
  },
  {
    "id": "TC-ADMN-001",
    "module": "M08",
    "priority": "P2",
    "name": "Giao diện Quản trị Admin mới: Sidebar thu gọn/mở rộng & Trạng thái Online",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Đăng nhập trang Admin (/index.html hoặc /admin.html).",
      "2. Nhấn nút thu gọn Sidebar (ChevronLeft) rồi mở rộng lại (ChevronRight)."
    ],
    "expected": [
      "Sidebar thu nhỏ mượt mà sang dạng icon (w-18) và mở rộng (w-64).",
      "Footer hiển thị chỉ thị Online với hiệu ứng pulsing xanh lá và đồng hồ thời gian thực."
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-ADMN-008",
    "module": "M08",
    "priority": "P2",
    "name": "Tải lên Ảnh thẻ đại diện cho cán bộ trực ban (Upload Avatar Photo)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại form nhân viên, nhấp tải ảnh chân dung từ máy tính lên.",
      "2. Lưu hồ sơ."
    ],
    "expected": [
      "Ảnh thẻ được tải lên thư mục /uploads/staff/..., hiển thị trên Header trạm gác khi nhân viên trực."
    ]
  },
  {
    "id": "TC-ADMN-009",
    "module": "M08",
    "priority": "P2",
    "name": "Nhập danh sách cán bộ hàng loạt từ file Excel (Import Staff Excel)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút \"Import Excel\" trong StaffManagement.",
      "2. Chọn file Excel danh sách nhân sự mẫu.",
      "3. Xác nhận import."
    ],
    "expected": [
      "Hệ thống đọc dữ liệu file Excel và thêm hàng loạt nhân viên vào hệ thống, hiển thị báo cáo số dòng thành công."
    ]
  },
  {
    "id": "TC-ADMN-010",
    "module": "M08",
    "priority": "P1",
    "name": "Xóa hàng loạt nhân sự đã nghỉ việc (Bulk Delete Staff)",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tích chọn nhiều nhân viên trong danh mục.",
      "2. Nhấn nút \"Xóa đã chọn\", xác nhận trong hộp thoại bảo vệ."
    ],
    "expected": [
      "Các tài khoản nhân viên được xóa hoặc chuyển trạng thái không hoạt động an toàn."
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-ADMN-013",
    "module": "M08",
    "priority": "P1",
    "name": "Phân quyền vai trò DataEntry: Chặn truy cập cấu hình hệ thống và backup",
    "platform": "Giao diện Quản trị Admin & API",
    "testData": "Tài khoản role DataEntry",
    "steps": [
      "1. Dùng token tài khoản DataEntry gọi API /admin/backup hoặc truy cập menu Cài đặt hệ thống."
    ],
    "expected": [
      "Hệ thống ẩn menu cấu hình hoặc phản hồi 403 Forbidden: Tài khoản DataEntry chỉ có quyền xem và nhập liệu."
    ]
  },
  {
    "id": "TC-ADMN-014",
    "module": "M08",
    "priority": "P1",
    "name": "Khóa (Deactivate) tài khoản người dùng",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tắt công tắc kích hoạt (IsActive) của một tài khoản.",
      "2. Thử dùng tài khoản đó đăng nhập."
    ],
    "expected": [
      "Hệ thống từ chối đăng nhập với thông báo tài khoản bị khóa."
    ]
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
    ]
  },
  {
    "id": "TC-REPT-002",
    "module": "M09",
    "priority": "P1",
    "name": "Lọc theo Khoảng ngày tùy chọn và Lọc theo Nhiều ngày rời rạc (discrete_dates)",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Chọn 3 ngày ngắt quãng: 01/10/2026, 05/10/2026, 12/10/2026",
    "steps": [
      "1. Chuyển chế độ lọc ngày sang \"Chọn nhiều ngày rời rạc (discrete_dates)\".",
      "2. Thêm từng ngày vào danh sách lọc.",
      "3. Áp dụng."
    ],
    "expected": [
      "Báo cáo lọc chính xác các lượt khách ra/vào đúng trong 3 ngày đã chọn, bỏ qua các ngày xen giữa."
    ]
  },
  {
    "id": "TC-REPT-003",
    "module": "M09",
    "priority": "P1",
    "name": "Lọc đa chiều: Cán bộ trực ban, Nguồn (Trực ban vs Sổ sách), Trạng thái thẻ, Phương tiện",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Kết hợp lọc theo Cán bộ trực ban cụ thể.",
      "2. Lọc nguồn: Chỉ xem lượt khách từ \"Trực ban cổng\" hoặc \"Sổ sách ngoại lệ\".",
      "3. Lọc trạng thái thẻ: \"Thẻ đã trả\", \"Thẻ đang nợ\", \"Thẻ báo mất\"."
    ],
    "expected": [
      "Bộ lọc đa chiều kết hợp chuẩn xác, đáp ứng yêu cầu thanh tra kiểm tra chuyên sâu."
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-REPT-007",
    "module": "M09",
    "priority": "P1",
    "name": "Xuất Báo cáo Thẻ mất ra Excel phục vụ công tác thanh tra tài sản",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Trong modal Báo cáo Thẻ mất, nhấn nút \"Xuất Excel\"."
    ],
    "expected": [
      "Tải về file Excel danh sách chi tiết các thẻ an ninh thất lạc để bàn giao cho bộ phận quản trị cơ sở vật chất."
    ]
  },
  {
    "id": "TC-REPT-008",
    "module": "M09",
    "priority": "P2",
    "name": "Dashboard Admin đồ thị thống kê lưu lượng khách",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Xem Bảng điều khiển (DashboardTab) trên trang Admin."
    ],
    "expected": [
      "Hiển thị đồ thị trực quan: Phân bố lưu lượng khách theo khung giờ trong ngày, tỷ lệ phương tiện xe ô tô/xe máy, tỷ lệ hoàn trả thẻ."
    ]
  },
  {
    "id": "TC-REPT-009",
    "module": "M09",
    "priority": "P2",
    "name": "Xuất báo cáo danh sách ca trực ra Excel phục vụ chấm công",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại ShiftsTab, nhấn nút xuất file danh sách ca trực."
    ],
    "expected": [
      "File Excel xuất ra chứa chi tiết thời lượng từng ca trực, cán bộ trực để phòng tổ chức cán bộ đối soát chấm công."
    ]
  },
  {
    "id": "TC-REPT-010",
    "module": "M09",
    "priority": "P2",
    "name": "Khả năng lọc tìm kiếm từ khóa kết hợp trong Trung tâm Báo cáo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhập từ khóa kết hợp trong ô tìm kiếm của ReportsTab."
    ],
    "expected": [
      "Dữ liệu báo cáo lọc tức thì theo từ khóa nhập vào."
    ]
  },
  {
    "id": "TC-REPT-011",
    "module": "M09",
    "priority": "P1",
    "name": "Mở xem chi tiết bất kỳ lượt khách nào trực tiếp từ bảng Báo cáo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấp nút xem chi tiết trên một dòng trong bảng Báo cáo."
    ],
    "expected": [
      "Mở VisitDetailsModal của lượt khách đó với đầy đủ 3 tab Tổng quan, Timeline và Thành viên."
    ]
  },
  {
    "id": "TC-REPT-012",
    "module": "M09",
    "priority": "P2",
    "name": "Kiểm tra định dạng chuẩn tên file xuất báo cáo",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Xuất file và kiểm tra tên file được tải về máy tính."
    ],
    "expected": [
      "Tên file tuân thủ quy tắc chuẩn: \"SmartVMS_BaoCao_LichSu_[NgayLapp].xlsx\" hoặc \"SmartVMS_TheMat_[Ngay].xlsx\"."
    ]
  },
  {
    "id": "TC-REPT-013",
    "module": "M09",
    "priority": "P2",
    "name": "Đóng/mở khối bộ lọc báo cáo (Filter Collapse toggle) để tăng không gian xem bảng",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Nhấn nút thu gọn bộ lọc trên đầu trang ReportsTab."
    ],
    "expected": [
      "Khối bộ lọc thu gọn lại, bảng dữ liệu mở rộng tối đa màn hình."
    ]
  },
  {
    "id": "TC-SETT-001",
    "module": "M10",
    "priority": "P2",
    "name": "Cấu hình Vận hành (SettingsOperationPanel): Tên hệ thống & Cổng trực mặc định",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Vào Trung tâm Cài đặt -> Cấu hình Vận hành & Thiết bị.",
      "2. Đổi tên hệ thống thành \"CỔNG KIỂM SOÁT AN NINH ĐƠN VỊ X\".",
      "3. Lưu cấu hình."
    ],
    "expected": [
      "Lưu thành công. Tiêu đề trên Header của trạm gác và admin tự động cập nhật tên mới."
    ]
  },
  {
    "id": "TC-SETT-002",
    "module": "M10",
    "priority": "P2",
    "name": "Cấu hình Giới hạn Thời gian lưu trú cảnh báo",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Đặt giới hạn: 8 giờ",
    "steps": [
      "1. Thiết lập thời gian lưu trú cảnh báo = 8 giờ.",
      "2. Lưu cài đặt."
    ],
    "expected": [
      "Khi khách ở trong cơ quan quá 8 giờ, hệ thống đánh dấu cảnh báo màu cam trên Dashboard."
    ]
  },
  {
    "id": "TC-SETT-003",
    "module": "M10",
    "priority": "P2",
    "name": "Cấu hình Chính sách Thẻ an ninh",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Thiết lập quy định thẻ an ninh (bắt buộc cấp thẻ hoặc tùy chọn)."
    ],
    "expected": [
      "Giao diện Check-in tuân thủ chính sách thẻ đã được thiết lập."
    ]
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
    ]
  },
  {
    "id": "TC-SETT-005",
    "module": "M10",
    "priority": "P1",
    "name": "Tải file sao lưu (Download Backup) về máy tính cá nhân",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Tại danh sách các bản backup, nhấn biểu tượng Tải về cạnh bản sao lưu vừa tạo."
    ],
    "expected": [
      "Trình duyệt tải file CSDL .bak về máy tính của quản trị viên an toàn."
    ]
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
    ]
  },
  {
    "id": "TC-SETT-007",
    "module": "M10",
    "priority": "P1",
    "name": "Cấu hình Lịch Tự động Sao lưu (Auto Backup định kỳ)",
    "platform": "Giao diện Quản trị Admin",
    "testData": "Bật Auto Backup hàng ngày lúc 23:00, lưu tối đa 30 bản",
    "steps": [
      "1. Bật công tắc Auto Backup, đặt giờ sao lưu tự động và số bản tối đa.",
      "2. Lưu cài đặt."
    ],
    "expected": [
      "Hệ thống lưu cấu hình vào CSDL. Background Service tự động chạy theo lịch đã đặt."
    ]
  },
  {
    "id": "TC-SETT-008",
    "module": "M10",
    "priority": "P2",
    "name": "Quản lý Bản sao lưu cũ: Xem dung lượng và Xóa bản backup",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Kiểm tra dung lượng từng bản sao lưu trong danh sách.",
      "2. Nhấn biểu tượng Thùng rác để xóa bản sao lưu cũ không còn dùng."
    ],
    "expected": [
      "File backup bị xóa khỏi ổ cứng máy chủ, danh sách cập nhật ngay lập tức."
    ]
  },
  {
    "id": "TC-SETT-009",
    "module": "M10",
    "priority": "P2",
    "name": "Kiểm tra và cấu hình đường dẫn thư mục lưu trữ sao lưu",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Kiểm tra cấu hình đường dẫn thư mục lưu trữ backup trên máy chủ qua API /admin/browse-folder."
    ],
    "expected": [
      "Đường dẫn hợp lệ và có quyền ghi trên ổ đĩa máy chủ Windows."
    ]
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
    ]
  },
  {
    "id": "TC-SETT-011",
    "module": "M10",
    "priority": "P1",
    "name": "Tự động tạo bản backup dự phòng trước khi thực hiện restore",
    "platform": "API / Backend C#",
    "steps": [
      "1. Thực hiện lệnh restore qua API /admin/restore."
    ],
    "expected": [
      "Backend C# tự động tạo một file \"pre_restore_backup_...\" trước khi ghi đè CSDL, đảm bảo có thể rollback nếu cần."
    ]
  },
  {
    "id": "TC-SETT-012",
    "module": "M10",
    "priority": "P2",
    "name": "Kiểm tra dung lượng CSDL và trạng thái kết nối SQLite",
    "platform": "Giao diện Quản trị Admin",
    "steps": [
      "1. Quan sát card thông tin dung lượng file SQLite trong BackupTab."
    ],
    "expected": [
      "Hiển thị chính xác kích thước file CSDL (vd: 15.4 MB) và trạng thái kết nối SQLite bình thường."
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-DEVC-003",
    "module": "M11",
    "priority": "P1",
    "name": "Quét mã QR thẻ CCCD qua máy quét 2D kết nối USB",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Quét mã QR trên thẻ CCCD."
    ],
    "expected": [
      "Máy quét đọc mã thành công, ứng dụng web tự động phân giải chuỗi ký tự thành các trường thông tin tương ứng."
    ]
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
    ]
  },
  {
    "id": "TC-DEVC-005",
    "module": "M11",
    "priority": "P1",
    "name": "Điều khiển Đóng/Mở Barie / Cổng Barrier tự động qua Rơ-le",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Thực hiện Check-in hoặc Checkout thành công cho lượt khách có phương tiện."
    ],
    "expected": [
      "DeviceService gửi tín hiệu điều khiển qua cổng COM/Relay kích mở barie cho xe qua cổng.",
      "Sau khoảng trễ quy định, tín hiệu đóng barie được gửi an toàn."
    ]
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
    ]
  },
  {
    "id": "TC-DEVC-007",
    "module": "M11",
    "priority": "P1",
    "name": "Tự động Tái kết nối WebSocket (Auto-reconnect)",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Sau khi DeviceService bị ngắt, bật lại tiến trình DeviceService."
    ],
    "expected": [
      "Trình duyệt tự động thăm dò và tái kết nối lại WebSocket thành công trong vòng 5 giây mà không cần nhân viên nhấn F5."
    ]
  },
  {
    "id": "TC-DEVC-008",
    "module": "M11",
    "priority": "P2",
    "name": "Cấu hình thiết bị trong DeviceService (Cổng COM, Baudrate, IP)",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Kiểm tra cấu hình trong file appsettings.json của DeviceService."
    ],
    "expected": [
      "Cấu hình thông số cổng COM, tốc độ truyền Baudrate và địa chỉ reader linh hoạt, dễ dàng thay đổi theo phần cứng thực tế."
    ]
  },
  {
    "id": "TC-DEVC-009",
    "module": "M11",
    "priority": "P2",
    "name": "Kiểm tra thời gian đọc thẻ CCCD gắn chip dưới 2 giây",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Đặt thẻ CCCD và đo thời gian từ khi chạm thẻ đến khi dữ liệu hiển thị trên web."
    ],
    "expected": [
      "Thời gian phản hồi đạt dưới 2.0 giây, bảo đảm tốc độ lưu thông nhanh tại cổng trực ban."
    ]
  },
  {
    "id": "TC-DEVC-010",
    "module": "M11",
    "priority": "P2",
    "name": "Báo lỗi đọc thẻ khi thẻ đặt lệch hoặc rút ra quá sớm",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Đặt thẻ CCCD và lập tức rút ra trong khi đầu đọc đang truyền dữ liệu."
    ],
    "expected": [
      "DeviceService bắt ngoại lệ CardCommunicationException, gửi thông báo \"Thẻ bị ngắt quãng, vui lòng giữ nguyên thẻ trên đầu đọc\", không crash service."
    ]
  },
  {
    "id": "TC-DEVC-011",
    "module": "M11",
    "priority": "P2",
    "name": "Cấu hình thiết bị Webcam trong Device Settings của trạm",
    "platform": "Thiết bị & Cổng gác",
    "steps": [
      "1. Vào cài đặt thiết bị của trạm gác, chọn camera mặc định cho mở ca và chụp ảnh khách."
    ],
    "expected": [
      "Cấu hình được lưu và áp dụng đúng webcam đã chọn."
    ]
  },
  {
    "id": "TC-DEVC-012",
    "module": "M11",
    "priority": "P2",
    "name": "Cảnh báo sự cố thiết bị ngoại vi qua banner DeviceErrorBanner",
    "platform": "Giao diện Web Trực ban",
    "steps": [
      "1. Rút cáp USB đầu đọc thẻ khi đang làm việc."
    ],
    "expected": [
      "Hiển thị dải cảnh báo DeviceErrorBanner màu vàng cam thông báo cụ thể thiết bị mất kết nối."
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "TC-BKGD-006",
    "module": "M12",
    "priority": "P2",
    "name": "Hiệu năng Tìm kiếm và Xử lý dưới tải (5,000+ lượt khách)",
    "platform": "Giao diện Web UI & API",
    "steps": [
      "1. CSDL chứa 5,000 bản ghi lượt khách.",
      "2. Thực hiện tìm kiếm và lọc dữ liệu trên Dashboard và Báo cáo."
    ],
    "expected": [
      "Thời gian phản hồi hiển thị kết quả đạt dưới 100ms, không có hiện tượng giật lag giao diện."
    ]
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
    ]
  },
  {
    "id": "TC-BKGD-008",
    "module": "M12",
    "priority": "P1",
    "name": "Phòng chống XSS và SQL Injection trên các trường nhập liệu",
    "platform": "Giao diện Web UI & API",
    "testData": "Chuỗi nhập: <script>alert(\"xss\")</script> và ' OR 1=1 --",
    "steps": [
      "1. Nhập các chuỗi tấn công vào trường Họ tên, Mục đích, Biển số xe."
    ],
    "expected": [
      "Entity Framework Core tham số hóa câu lệnh an toàn (Parametrized Queries), React tự động escape ký tự HTML, không bị thực thi mã độc."
    ]
  },
  {
    "id": "TC-BKGD-009",
    "module": "M12",
    "priority": "P2",
    "name": "Cơ chế tự động dọn dẹp file tạm và ảnh rác định kỳ",
    "platform": "Dịch vụ Ngầm C# Backend",
    "steps": [
      "1. Kiểm tra thư mục tạm /temp và /uploads."
    ],
    "expected": [
      "Hệ thống tự động xóa các file tạm sinh ra trong quá trình xuất báo cáo sau khi hoàn tất."
    ]
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
    ]
  },
  {
    "id": "TC-BKGD-011",
    "module": "M12",
    "priority": "P2",
    "name": "Kiểm tra rò rỉ bộ nhớ (Memory Leak) khi ứng dụng chạy liên tục nhiều ngày",
    "platform": "Giao diện Web UI & DeviceService",
    "steps": [
      "1. Giữ ứng dụng trạm gác mở liên tục trên trình duyệt trong môi trường thử nghiệm tải."
    ],
    "expected": [
      "Mức tiêu thụ RAM của tab Chrome/Edge duy trì ổn định dưới 500MB, không tăng vọt không kiểm soát."
    ]
  },
  {
    "id": "TC-BKGD-012",
    "module": "M12",
    "priority": "P2",
    "name": "Ghi nhật ký lỗi hệ thống (Error Logging): File log hàng ngày",
    "platform": "Dịch vụ Ngầm C# Backend",
    "steps": [
      "1. Kiểm tra thư mục Logs của ứng dụng Backend C#."
    ],
    "expected": [
      "Mỗi ngày tự động sinh file log (vd: log-20261006.txt) ghi nhận đầy đủ stack trace các ngoại lệ nếu có để phục vụ bảo trì."
    ]
  }
];

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
  updateSessionDisplay();
  applyAuth(); // Apply login state
  navigate('dashboard');
  const all = getAllTcs();
  console.log(`✅ SmartVMS Test Manager loaded | ${all.length} Test Cases (${ALL_TCS.length} Chuẩn + ${state.customTcs.length} Tùy chỉnh) | ${getModules().length} Modules`);
});
