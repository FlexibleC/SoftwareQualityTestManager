/* Auto-generated Test Catalog Wrapper for SmartVMS Test Manager */
var _global = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
_global.SMARTVMS_DEFAULT_CATALOG = {
  "schema": "https://smartvms.local/schemas/test-catalog-v4.json",
  "title": "SmartVMS Local SingleSite 2026 — Danh mục Kịch bản Kiểm thử Chuẩn hóa",
  "standardCompliance": [
    "ISO 9001:2015 Clause 7.5 & 8.5.2",
    "ISO/IEC/IEEE 29119-3:2021",
    "ISO/IEC 25010:2023"
  ],
  "version": "3.4.0",
  "exportedAt": "2026-10-17T00:59:52.510Z",
  "totalTestCases": 214,
  "totalModules": 12,
  "modules": [
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
      "name": "Thiết bị Ngoại vi, DeviceService & Quản lý Phần cứng",
      "short": "Thiết bị Ngoại vi"
    },
    {
      "id": "M12",
      "name": "Dịch vụ Nền tảng, Desktop Kiosk, Toàn vẹn & Chịu lỗi",
      "short": "Dịch vụ nền & NFR"
    }
  ],
  "testCases": [
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
      "name": "Xử lý xung đột phiên trạm: Phát hiện trạm đang có phiên mở dở dang và Ép Đăng Xuất Phiên Cũ",
      "platform": "Giao diện Web Trực ban",
      "testData": "Tài khoản cán bộ nhận ca: \"Nv001a1\".",
      "steps": [
        "1. Tại trang /staff.html, đăng nhập vào tài khoản trạm đang có phiên trực mở dở dang hoặc đang đăng nhập ở một thiết bị khác.",
        "2. Quan sát hộp cảnh báo màu hồng viền đỏ \"CẢNH BÁO: TÀI KHOẢN ĐANG HOẠT ĐỘNG\" cùng nút hành động màu đỏ \"Ép Đăng Xuất Phiên Cũ\".",
        "3. Nhấn nút \"Ép Đăng Xuất Phiên Cũ\"."
      ],
      "expected": [
        "Hệ thống gửi request đăng nhập kèm forceLogout = true tới API /station/auth/login.",
        "Phiên làm việc ở thiết bị trước bị ngắt kết nối ngay lập tức, quyền kiểm soát ca trực được chuyển sang thiết bị này.",
        "Hệ thống mở giao diện Mở ca trực (StartShiftModal) để cán bộ chụp ảnh hoặc quẹt CCCD vào ca chính quy."
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
        "Header trạm cập nhật họ tên nhân viên và hiển thị chấm xanh lá chỉ báo ca trực đang hoạt động."
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
      "name": "Bảo đảm an ninh trạm: Bỏ nút Đăng xuất dở dang khi đang trong ca — Bắt buộc thực hiện \"Rời ca\" để bàn giao ca trực",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Trạm gác đang trong ca trực hoạt động (ShiftSession đang Active).",
      "steps": [
        "1. Quan sát thanh Header trạm gác (/staff.html) khi cán bộ đang trong ca trực.",
        "2. Kiểm tra các nút tác vụ điều hướng trên Header (chỉ có icon Cài đặt trạm và nút màu đỏ \"Rời ca\", hoàn toàn không tồn tại nút \"Đăng xuất\" thoát dở dang ca trực).",
        "3. Thử tìm kiếm tính năng Đăng xuất tùy tiện khi ca trực chưa được kết thúc/bàn giao."
      ],
      "expected": [
        "Giao diện trạm tuân thủ đúng nguyên tắc an ninh trạm gác: Không hiển thị nút \"Đăng xuất\" khi đang trong ca trực để ngăn chặn cán bộ thoát ứng dụng mà chưa bàn giao ca.",
        "Mọi trường hợp muốn kết thúc phiên làm việc bắt buộc phải nhấn nút \"Rời ca\" (TC-AUTH-012) để xác thực ảnh/CCCD và đóng ShiftSession chính quy."
      ],
      "testData": "Kiểm tra thanh Header giao diện Trực ban khi ca trực đang hoạt động."
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
      "id": "TC-AUTH-015",
      "module": "M01",
      "priority": "P3",
      "name": "Xem Hồ sơ Cá nhân Cán bộ Trực ban & Cấu hình Trạm trực (StaffSettingsModal)",
      "platform": "Giao diện Web Trực ban",
      "steps": [
        "1. Nhấp vào ảnh đại diện hoặc tên cán bộ trên thanh Header hoặc nhấn vào icon Cài đặt trạm.",
        "2. Quan sát thông tin cán bộ hiển thị trong StaffSettingsModal: Mã cán bộ, Họ tên, Phòng ban, Trạm trực.",
        "3. Thử bật/tắt công tắc Âm thanh thông báo (Sound effects) và lựa chọn Camera mặc định của trạm.",
        "4. Nhấn Lưu cấu hình và đóng modal."
      ],
      "expected": [
        "StaffSettingsModal hiển thị chính xác toàn bộ hồ sơ của cán bộ đang trực ban.",
        "Cấu hình âm thanh và camera mặc định được lưu vào localStorage của trình duyệt và áp dụng ngay lập tức."
      ],
      "precondition": "Cán bộ trực ban đã đăng nhập vào ca trực trên giao diện trạm (/staff.html).",
      "testData": "Tài khoản cán bộ trực ban: Nv001a1 (Nguyễn Văn Huy) thuộc Trạm Cổng chính."
    },
    {
      "id": "TC-AUTH-016",
      "module": "M01",
      "priority": "P2",
      "name": "Xử lý Lỗi Quyền Truy cập Camera Trình duyệt bị Từ chối (PermissionDenied) khi Mở ca & Hướng dẫn Cấp lại Quyền",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Trình duyệt đang chặn quyền truy cập Webcam đối với domain https://smartvms.local.",
      "steps": [
        "1. Truy cập trang /staff.html và đăng nhập bằng mã cán bộ Nv001a1.",
        "2. Khi modal chụp ảnh vào ca trực (StartShiftModal) mở ra, người dùng nhấn \"Block / Chặn\" quyền camera trên trình duyệt.",
        "3. Quan sát thông báo lỗi và banner hướng dẫn hiển thị trên màn hình."
      ],
      "expected": [
        "StartShiftModal bắt ngoại lệ NotAllowedError / PermissionDenied, không bị crash trắng trang.",
        "Giao diện hiển thị thông báo hướng dẫn rõ ràng: \"Quyền truy cập Camera bị từ chối. Vui lòng kiểm tra quyền Camera trong Cài đặt Windows (Privacy & security > Camera) hoặc quyền của trình duyệt.\""
      ],
      "testData": "Trạng thái quyền camera: navigator.permissions query('camera') = 'denied'."
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
        "1. Tại phần Cấp thẻ, chọn loại thẻ \"Thẻ khách thường\".",
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
        "1. Tại phần Cấp thẻ, chọn loại thẻ \"Không cấp thẻ\".",
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
        "2. Nhập số CCCD \"001099000111\".",
        "3. Quan sát thông báo kiểm tra ràng buộc chéo (Cross-visit constraint)."
      ],
      "expected": [
        "Hệ thống hiển thị cảnh báo đỏ ngay dưới ô nhập CCCD: \"Số CCCD \\\"001099000111\\\" của Trưởng đoàn hiện đang trong đơn vị (thuộc lượt khác) chưa Check-Out!\".",
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
      "testData": "Nhập mã thẻ an ninh định danh: \"CARD-001\" (hoặc quét thẻ RFID).",
      "steps": [
        "1. Mở modal Check-in khách mới.",
        "2. Nhập thông tin khách, tại ô Mã thẻ định danh, nhập \"CARD-001\" (hoặc quét thẻ RFID).",
        "3. Nhấn nút \"Check-in\"."
      ],
      "expected": [
        "Hệ thống phát hiện mã thẻ đang thuộc về một lượt khách khác đang ở trạng thái Inside.",
        "Giao diện cảnh báo chặn Check-in: \"Mã thẻ định danh \\\"CARD-001\\\" của Trưởng đoàn hiện đang được sử dụng ở lượt khác chưa Check-Out!\".",
        "Hệ thống không cho phép lưu và ngăn chặn việc cấp trùng thẻ cho 2 lượt khách đồng thời."
      ],
      "precondition": "Mã thẻ \"CARD-001\" đang được cấp cho 1 lượt khách khác (Khách chính hoặc người đi cùng) đang ở bên trong cơ quan (chưa Check-Out)."
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
        "Hệ thống cảnh báo: \"Xe biển số \\\"30H-999.88\\\" hiện đang trong đơn vị (thuộc lượt khác) chưa Check-Out!\".",
        "Nút Check-in bị chặn cho tới khi sửa lại biển số xe hợp lệ."
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
      "id": "TC-CKIN-016",
      "module": "M02",
      "priority": "P1",
      "name": "Chặn cấp phát lại Thẻ đang báo mất khi Check-In tại cổng (Khách chính & Người đi cùng)",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Hệ thống có thẻ an ninh '#901' (hoặc mã bất kỳ) đang trong tình trạng báo mất chưa thu hồi (của khách chính, người đi cùng hoặc đoàn vô danh).",
      "testData": "Tại form Check-in cổng: Nhập Tên khách: \"Lê Văn Thắng\", CCCD: \"001099000888\", SĐT: \"0987654321\", Ô Mã thẻ an ninh nhập = \"901\" (hoặc \"#901\").",
      "steps": [
        "1. Trên Dashboard Trực ban (/staff.html), nhấn nút \"+ Check-in khách mới\".",
        "2. Điền đầy đủ thông tin cá nhân khách viếng thăm (Họ tên, CCCD, SĐT, Cơ quan, Người đón, Mục đích).",
        "3. Tại ô \"Mã thẻ an ninh\", nhập số thẻ đang trong trạng thái báo mất: 901 (hoặc #901).",
        "4. Nhấn nút \"Check-in\"."
      ],
      "expected": [
        "Hệ thống từ chối thực hiện lệnh Check-In, API /station/visits/checkin trả về cảnh báo lỗi nghiệp vụ.",
        "Hiển thị thông báo rõ ràng trên màn hình: \"Thẻ số 901 đang báo mất bởi khách [Tên khách] (Lượt ngày DD/MM/YYYY). Cần làm thủ tục thu hồi trước khi cấp phát.\"",
        "Lượt khách không được tạo vào CSDL với thẻ báo mất này, bảo đảm an toàn kho thẻ kiểm soát cổng."
      ]
    },
    {
      "id": "TC-CKIN-017",
      "module": "M02",
      "priority": "P2",
      "name": "Thao tác Chụp ảnh Chân dung trong CheckInCameraModal: Xem trước Live Preview, Đổi Camera & Chụp lại",
      "platform": "Giao diện Web Trực ban",
      "precondition": "CheckInModal đang mở; máy tính có kết nối ít nhất 1 Webcam USB.",
      "steps": [
        "1. Trong form Check-in, nhấp vào vùng ảnh chân dung hoặc nút \"Chụp ảnh camera\".",
        "2. Hộp thoại CheckInCameraModal mở ra hiển thị luồng video live preview từ webcam.",
        "3. Nếu máy có nhiều camera, thử chọn camera khác từ danh sách thả xuống.",
        "4. Nhấn nút \"Chụp ảnh\" (Snapshot) -> Xem trước ảnh vừa chụp -> Thử nhấn \"Chụp lại\" nếu chưa ưng ý.",
        "5. Nhấn \"Xác nhận sử dụng ảnh\" để đưa ảnh vào form Check-in."
      ],
      "expected": [
        "Luồng live preview hiển thị mượt mà không bị giật lag với độ phân giải chuẩn (720p).",
        "Ảnh chụp được nén dạng Base64 JPEG chuẩn, gán chính xác vào khung ảnh đại diện của khách chính."
      ],
      "testData": "Webcam chuẩn USB Video Class (UVC); độ phân giải ideal: 1280x720."
    },
    {
      "id": "TC-CKIN-018",
      "module": "M02",
      "priority": "P3",
      "name": "Thao tác Quản lý Đa ảnh trong MultiShotCameraModal: Thêm mới, Xóa từng ảnh, Xem trước & Giới hạn số lượng ảnh",
      "platform": "Giao diện Web Trực ban",
      "precondition": "CheckInModal đang mở; cần chụp nhiều ảnh giấy tờ tùy thân hoặc tài sản mang vào.",
      "steps": [
        "1. Trong form Check-in, nhấn nút \"Chụp ảnh bổ sung (Giấy tờ / Tài sản)\".",
        "2. Hộp thoại MultiShotCameraModal mở lên: chụp liên tiếp 3 ảnh (vd: mặt trước CMT, mặt sau CMT, giấy giới thiệu).",
        "3. Thử nhấp vào biểu tượng thùng rác trên 1 ảnh thu nhỏ để xóa ảnh chụp lỗi.",
        "4. Nhấn \"Hoàn thành & Lưu danh sách ảnh\" để chốt danh sách ảnh chụp."
      ],
      "expected": [
        "MultiShotCameraModal hiển thị thanh cuộn danh sách ảnh đã chụp với số đếm trực quan (vd: 2/5 ảnh).",
        "Các ảnh đã xóa bị loại bỏ hoàn toàn khỏi mảng state `visitorAdditionalPhotos`, các ảnh còn lại được lưu đầy đủ."
      ],
      "testData": "Chụp liên tiếp 3 ảnh tài liệu tùy thân; kiểm tra mảng visitorAdditionalPhotos có đúng 2 phần tử sau khi xóa 1 ảnh."
    },
    {
      "id": "TC-COMP-001",
      "module": "M03",
      "priority": "P1",
      "name": "Tạo đoàn Check-in ban đầu: Thêm nhiều Người đi cùng có danh tính",
      "platform": "Giao diện Web Trực ban",
      "testData": "Tab Người đi cùng: Thêm \"Lê Thị Bích\", CCCD: \"001188000222\", SĐT: \"0988111222\", Nữ.",
      "steps": [
        "1. Tại form Check-in, chuyển sang tab \"2. KHÁCH CÓ KHAI BÁO THÔNG TIN\".",
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
        "1. Tại tab \"3. KHÁCH ĐOÀN KHÔNG KHAI BÁO THÔNG TIN\", nhập số lượng khách vô danh: 10.",
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
      "testData": "Đoàn 5 khách vô danh: Cấp 3 thẻ thường + 2 thẻ định danh (\"CARD-A01\", \"CARD-A02\").",
      "steps": [
        "1. Tại modal Check-in đoàn, ở phần cấp thẻ cho 5 khách vô danh, nhập số lượng Thẻ thường = 3.",
        "2. Nhập/quét danh sách 2 mã thẻ định danh RFID: \"CARD-A01\", \"CARD-A02\".",
        "3. Kiểm tra tổng số thẻ cấp cho đoàn vô danh = 5 thẻ, sau đó nhấn \"Lưu Check-in\"."
      ],
      "expected": [
        "Hệ thống lưu trữ thành công vào CSDL: AnonymousCardCount = 3, AnonymousIdentityCardNumbers = [\"CARD-A01\", \"CARD-A02\"].",
        "Tổng số thẻ an ninh đoàn vô danh đang giữ được tính toán chuẩn xác (3 thẻ thường + 2 thẻ định danh = 5 thẻ).",
        "Trực ban theo dõi được danh sách chi tiết từng thẻ được phân bổ cho đoàn vô danh trong modal Chi tiết lượt khách."
      ],
      "precondition": "Khai báo đoàn khách gồm 1 Trưởng đoàn và 5 khách vô danh đi cùng (Tổng 6 người)."
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
      "name": "Nghiệp vụ Cấp bổ sung thẻ thiếu (Tab \"4. CẤP BỔ SUNG THẺ\" trong SupplementalCheckInModal)",
      "platform": "Giao diện Web Trực ban",
      "testData": "SupplementalCheckInModal (tab missing_cards): Cấp bù mã thẻ định danh cho thành viên còn thiếu.",
      "steps": [
        "1. Mở SupplementalCheckInModal, chọn tab \"4. CẤP BỔ SUNG THẺ\".",
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
        "1. Trong modal Check-in hoặc modal Bổ sung, chọn tùy chọn lưu trú \"Qua đêm\" (thay cho mặc định \"Trong ngày\").",
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
      "id": "TC-COMP-015",
      "module": "M03",
      "priority": "P1",
      "name": "Cơ chế Sticky Scan Target: Bật chế độ quét CCCD/VNeID đổ trực tiếp vào Người đi cùng cụ thể",
      "platform": "Giao diện Web Trực ban & Thiết bị",
      "precondition": "Form Check-in đoàn đang mở và đã thêm ít nhất 2 dòng Người đi cùng.",
      "steps": [
        "1. Trên dòng của Người đi cùng số 2, nhấp vào nút icon \"Quét CCCD cho người này\" (Sticky target).",
        "2. Quan sát trạng thái chỉ báo (badge màu xanh nhấp nháy hoặc thông báo đang chờ dữ liệu người đi cùng 2).",
        "3. Đặt thẻ CCCD gắn chip của người đi cùng 2 lên đầu đọc thẻ hoặc quét mã QR VNeID.",
        "4. Kiểm tra dữ liệu được đổ vào đâu."
      ],
      "expected": [
        "State `companionScanTarget` kích hoạt chính xác cho index của người đi cùng 2.",
        "Toàn bộ dữ liệu đọc từ chip CCCD (Họ tên, CCCD, ngày sinh, ảnh đại diện) được gán CHÍNH XÁC vào dòng Người đi cùng số 2, KHÔNG ĐÈ lên thông tin Khách chính."
      ],
      "testData": "Khách chính: \"Nguyễn Văn A\"; Người đi cùng 2: Thẻ CCCD của \"Trần Thị B\"."
    },
    {
      "id": "TC-COMP-016",
      "module": "M03",
      "priority": "P2",
      "name": "Thiết lập Chế độ Phương tiện (Vehicle Mode) cho từng Người đi cùng: MAIN, WALK, OWN",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Form Check-in đoàn có 1 xe ô tô của đoàn và có từ 2 thành viên trở lên.",
      "steps": [
        "1. Khai báo xe ô tô biển số 30A-999.99 cho Trưởng đoàn (Khách chính).",
        "2. Tại Người đi cùng 1: chọn chế độ phương tiện là \"MAIN\" (Đi cùng xe khách chính).",
        "3. Tại Người đi cùng 2: chọn chế độ phương tiện là \"WALK\" (Đi bộ vào cơ quan).",
        "4. Tại Người đi cùng 3: chọn chế độ phương tiện là \"OWN\" (Tự lái xe riêng) -> Nhập biển số xe máy 29V1-123.45 cho người này.",
        "5. Hoàn tất Check-in đoàn và kiểm tra danh sách phương tiện được lưu."
      ],
      "expected": [
        "Hệ thống tự động liên kết Người đi cùng 1 với xe ô tô chính.",
        "Người đi cùng 2 không có phương tiện liên kết.",
        "Hệ thống tự động tạo thêm bản ghi Phương tiện mới liên kết với Người đi cùng 3 trong CSDL."
      ],
      "testData": "Đoàn 4 người với 2 phương tiện (1 ô tô chung, 1 xe máy riêng của thành viên 3)."
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
      "precondition": "Đoàn khách vô danh được cấp đồng thời 3 thẻ thường và 2 thẻ định danh RFID (\"CARD-A01\", \"CARD-A02\"). Cả đoàn làm thủ tục Check-out ra về cùng lúc.",
      "testData": "CheckOutModal đoàn: Thu hồi đủ 3 thẻ thường (nhập ô Thu hồi = 3) và tích chọn hoàn trả cả 2 mã thẻ định danh \"CARD-A01\", \"CARD-A02\".",
      "steps": [
        "1. Mở CheckOutModal trên dòng đoàn khách vô danh.",
        "2. Tại phần Thẻ thường của đoàn vô danh: Nhập số lượng thẻ thu hồi = 3.",
        "3. Tại phần Danh sách thẻ định danh của đoàn vô danh: Tích chọn cả 2 mã \"CARD-A01\" và \"CARD-A02\" vào danh sách hoàn trả.",
        "4. Nhấn \"Xác nhận Checkout\"."
      ],
      "expected": [
        "Hệ thống cập nhật thành công: AnonymousCardReturnedCount = 3 và ReturnedAnonymousIdentityCardNumbers lưu đủ [\"CARD-A01\", \"CARD-A02\"].",
        "Toàn bộ thẻ đoàn vô danh được ghi nhận hoàn trả đầy đủ, không phát sinh nợ thẻ hay báo mất.",
        "Các mã thẻ \"CARD-A01\" và \"CARD-A02\" được giải phóng trạng thái active, sẵn sàng để cấp phát cho lượt khách mới."
      ]
    },
    {
      "id": "TC-COUT-007",
      "module": "M04",
      "priority": "P1",
      "name": "Chính sách Cấm Nợ Thẻ Định Danh khi Check-out (ALLOW_LATE_CARD_RETURN_NAMED = false)",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Hệ thống bật chính sách cấm nợ thẻ: allowLateCardReturnNamed = false. Lượt khách có thẻ định danh (\"CARD-001\") đang làm thủ tục Check-out.",
      "testData": "CheckOutModal: Thẻ \"CARD-001\" của khách. Quan sát trạng thái các nút thao tác thẻ [Trả thẻ] / [Nợ thẻ] / [Báo mất].",
      "steps": [
        "1. Mở CheckOutModal trên dòng khách đang giữ thẻ định danh \"CARD-001\".",
        "2. Quan sát badge chính sách hiển thị trên header modal: \"Thẻ định danh: Bắt buộc thu hồi\".",
        "3. Quan sát nút \"Nợ thẻ (DEBT)\" ở dòng thẻ \"CARD-001\": Nút bị vô hiệu hóa (disabled, khóa mờ).",
        "4. Thử rê chuột vào nút \"Nợ thẻ\": Hệ thống hiển thị tooltip giải thích \"Chính sách hệ thống không cho phép nợ thẻ định danh khi ra cổng\".",
        "5. Kiểm tra các lựa chọn hợp lệ: Trực ban chỉ có thể chọn \"Trả thẻ (RETURN)\" hoặc nếu khách làm mất thẻ thì chọn \"Báo mất thẻ (LOST)\"."
      ],
      "expected": [
        "Hệ thống tuân thủ nghiêm ngặt chính sách cấm nợ thẻ định danh: Không cho phép trực ban chọn Nợ thẻ khi khách check-out ra khỏi đơn vị.",
        "Nếu khách không thể giao nộp thẻ, trực ban bắt buộc phải chuyển sang nghiệp vụ \"Báo mất thẻ (LOST)\" và ghi rõ lý do mất.",
        "Ngăn chặn triệt để tình trạng thất thoát thẻ định danh mà không có người chịu trách nhiệm."
      ]
    },
    {
      "id": "TC-COUT-008",
      "module": "M04",
      "priority": "P1",
      "name": "Nghiệp vụ Báo Mất Thẻ khi Checkout: Ghi nhận cờ isCardLost và Transaction LostCard",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Đoàn khách đang ở trong đơn vị, được cấp thẻ an ninh có số '#901'. Khách làm mất thẻ trong khuôn viên trước khi ra cổng.",
      "testData": "Lượt khách VST-001, Khách chính giữ thẻ '#901'. CheckOutModal: Chọn trạng thái thẻ \"Báo mất thẻ (LOST)\", nhập lý do mất: \"Khách làm rơi trong quá trình công tác tại đơn vị\".",
      "steps": [
        "1. Trên Dashboard Trực ban, nhấp nút \"Checkout\" trên dòng lượt khách VST-001.",
        "2. Tại CheckOutModal, ở dòng thẻ '#901' của Khách chính (hoặc Người đi cùng), chuyển trạng thái sang \"Báo mất thẻ (LOST)\".",
        "3. Nhập lý do mất thẻ: \"Khách làm rơi trong quá trình công tác tại đơn vị\".",
        "4. Nhấn nút \"Xác nhận Checkout\"."
      ],
      "expected": [
        "API /station/visits/checkout xử lý thành công, cho phép đoàn hoàn tất thủ tục ra cổng.",
        "CSDL ghi nhận IsCardLost = true, IsCardReturned = false, LostAt = Now, LostNote = \"Khách làm rơi...\".",
        "Hệ thống tự động sinh 1 bản ghi VisitTransaction với ActionType = LostCard (4), EntityType = MainVisitor (1), CardNumber = \"901\".",
        "Lượt khách hiển thị huy hiệu \"Chờ thu thẻ\" (hoặc ghi nhận hoàn tất thu hồi khi áp dụng chính sách cho phép ra)."
      ]
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
      "name": "Nghiệp vụ THU HỒI THẺ MẤT: Tra cứu theo Mã số thẻ (Tab 1 RecoverLostCardModal)",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Thẻ '#901' hoặc '#803' đã bị báo mất trước đó. Người nhặt được mang trả lại bốt gác an ninh.",
      "testData": "RecoverLostCardModal -> Tab \"Thẻ định danh (Identity)\": Nhập mã thẻ \"901\" (hoặc \"#901\"), Ghi chú: \"Bảo vệ nhặt được tại sảnh tòa nhà\".",
      "steps": [
        "1. Nhấn nút \"Thu hồi thẻ mất\" trên thanh công cụ Header (hoặc nút \"Thu hồi thẻ mất\" trong modal Chi tiết lượt khách).",
        "2. Tại Tab 1 \"Thẻ định danh (Identity)\", nhập mã thẻ \"901\" (hoặc quét thẻ RFID), nhấn nút \"Tra cứu\".",
        "3. Quan sát khung kết quả tra cứu hiển thị thông tin hồ sơ liên quan.",
        "4. Nhập ghi chú thu hồi thẻ: \"Bảo vệ nhặt được tại sảnh tòa nhà\".",
        "5. Nhấn nút \"Thu hồi thẻ này\"."
      ],
      "expected": [
        "Hệ thống gọi API /station/cards/lookup-lost (hoặc /admin/cards/lookup-lost) trả về chính xác: Tên khách làm mất, Số CCCD, Trạm báo mất, Thời gian mất.",
        "Khi bấm \"Thu hồi thẻ này\", hệ thống gọi API /station/visits/{id}/recover-cards (hoặc /admin/visits/{id}/recover-cards) thành công.",
        "CSDL cập nhật IsCardLost = false, IsCardReturned = true; Sinh bản ghi VisitTransaction với ActionType = RecoverLostCard (5).",
        "Thẻ 901 được giải phóng hoàn toàn khỏi danh sách thẻ mất và sẵn sàng để cấp phát lại cho khách mới."
      ]
    },
    {
      "id": "TC-COUT-011",
      "module": "M04",
      "priority": "P2",
      "name": "Nghiệp vụ THU HỒI THẺ MẤT: Thu hồi Thẻ Thường qua Danh Sách Đoàn Mất (Tab 2 RecoverLostCardModal - Đã sửa lỗi 404)",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Hệ thống có lượt khách đoàn vô danh đang báo mất thẻ thường (AnonymousCardLostCount > 0).",
      "testData": "RecoverLostCardModal -> Tab \"Thẻ khách thường (Regular)\": Chọn đoàn khách từ danh sách dropdown, Số lượng thu hồi: 1 (hoặc 2 thẻ), Ghi chú: \"Khách gửi bưu điện trả lại thẻ\".",
      "steps": [
        "1. Mở modal \"Thu hồi thẻ mất (RecoverLostCardModal)\" từ Header hoặc modal Chi tiết.",
        "2. Chuyển sang Tab 2 \"Thẻ khách thường (Regular)\".",
        "3. Quan sát dropdown \"Chọn đoàn khách báo mất thẻ\": Hệ thống tự động gọi API /station/cards/lost-regular-visits (hoặc /admin/cards/lost-regular-visits) tải danh sách.",
        "4. Chọn đoàn khách trong dropdown (hiển thị rõ tên khách, ngày giờ vào/ra, số lượng thẻ đang báo mất).",
        "5. Nhập số lượng thẻ tìm thấy thu hồi: 1 (hoặc tối đa bằng số thẻ đang mất).",
        "6. Nhập ghi chú thu hồi và nhấn nút \"Xác nhận thu hồi thẻ\"."
      ],
      "expected": [
        "Dropdown tải danh sách các đoàn báo mất thẻ thường thành công, không gặp lỗi HTTP 404.",
        "Gọi API /station/visits/{id}/recover-cards thành công với regularCardCount.",
        "CSDL cập nhật: AnonymousCardLostCount giảm tương ứng, AnonymousCardReturnedCount tăng tương ứng.",
        "Sinh bản ghi VisitTransaction với ActionType = RecoverLostCard (5), CardType = \"regular\", Quantity = số thẻ thu hồi."
      ]
    },
    {
      "id": "TC-COUT-012",
      "module": "M04",
      "priority": "P1",
      "name": "Kiểm tra Tính Toàn Vẹn & Nhất Quán Dữ Liệu Xuyên Suốt sau khi Thu Hồi Thẻ Mất (E2E Consistency)",
      "platform": "Web Trực ban, Chi tiết lượt khách, Báo cáo & Check-in",
      "precondition": "Một lượt khách đã hoàn tất thủ tục thu hồi thẻ mất (thẻ định danh '#901' hoặc thẻ thường của đoàn) thông qua RecoverLostCardModal.",
      "testData": "Kiểm tra dữ liệu đối soát tại 4 vị trí: Dashboard Trực ban, Modal Chi tiết (VisitDetailsModal), Báo cáo Thẻ mất (LostCardsReportModal), và Form Check-in mới.",
      "steps": [
        "1. Tại Dashboard Trực ban: Tìm dòng lượt khách vừa được thu hồi thẻ mất, kiểm tra badge trạng thái thẻ và cột ghi chú.",
        "2. Mở modal Chi tiết lượt khách (VisitDetailsModal): Mở tab \"Sổ đối soát thẻ\", kiểm tra dòng thẻ vừa thu hồi hiển thị trạng thái \"ĐÃ THU HỒI\" (màu xanh).",
        "3. Chuyển sang tab \"Dòng thời gian (Timeline)\" của lượt khách: Kiểm tra sự kiện \"Thu hồi thẻ mất (RecoverLostCard)\" được ghi nhận chuẩn xác với thời gian, cán bộ và ghi chú thu hồi.",
        "4. Vào Trung tâm Báo cáo -> Báo cáo Thẻ mất (LostCardsReportModal): Kiểm tra thẻ vừa thu hồi đã được cập nhật trạng thái \"Đã thu hồi\" và không còn nằm trong bộ lọc thẻ đang mất.",
        "5. Mở modal Check-in cho một khách mới: Nhập mã thẻ an ninh vừa được thu hồi ('#901') và xác nhận Check-in."
      ],
      "expected": [
        "1. Dashboard: Huy hiệu cảnh báo \"Chờ thu thẻ\" hoặc \"Mất thẻ\" chuyển sang trạng thái xanh an toàn (\"Đã thu đủ thẻ\").",
        "2. Sổ đối soát thẻ & Timeline: Bản ghi giao dịch RecoverLostCard được lưu trữ nguyên vẹn, minh bạch dữ liệu kiểm toán.",
        "3. Báo cáo Thẻ mất: Dữ liệu đồng bộ tức thì, số lượng thẻ mất còn lại trên toàn đơn vị giảm tương ứng.",
        "4. Check-in mới: Hệ thống cho phép cấp phát thẻ '#901' bình thường mà KHÔNG bị chặn lỗi \"Thẻ đang ở trạng thái BÁO MẤT\"."
      ]
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
      "priority": "P1",
      "name": "Xử lý Sự cố Thẻ An ninh Đột xuất giữa chừng qua CardIncidentModal: Báo mất thẻ khẩn cấp cho khách đang bên trong",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Khách đang ở bên trong cơ quan (Inside) đến trạm gác báo bị rơi mất thẻ an ninh.",
      "steps": [
        "1. Tại dòng của khách trên Dashboard, nhấp vào nút menu Tiện ích hoặc nút Sự cố thẻ.",
        "2. Hộp thoại CardIncidentModal mở ra: tại tab \"Khách có thông tin\" (hoặc \"Khách đoàn\"), tìm dòng thẻ cần báo mất.",
        "3. Tích chọn \"Báo mất thẻ này\", nhập lý do mất thẻ (vd: \"Khách làm rơi thẻ tại hành lang\").",
        "4. Nhấn nút \"Xác nhận Báo mất & Cấp thay thế (Khách có thông tin)\"."
      ],
      "expected": [
        "Hệ thống cập nhật ngay lập tức cờ `isCardLost = true` cho thẻ của khách.",
        "Tạo bản ghi kiểm toán VisitTransaction với ActionType = LostCard.",
        "Trạng thái thẻ trên Dashboard chuyển sang màu đỏ \"Mất thẻ\", thẻ bị khóa để chống người lạ nhặt được sử dụng."
      ],
      "testData": "Mã thẻ an ninh định danh cần báo mất: \"THE-VIP-099\"."
    },
    {
      "id": "TC-COUT-017",
      "module": "M04",
      "priority": "P1",
      "name": "Check-out Báo Mất Thẻ Thường Cấp Chung cho Đoàn Vô Danh",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Đoàn khách vô danh gồm 5 người được cấp 5 thẻ thường (không số). Lúc ra cổng, đoàn chỉ trả 3 thẻ, làm mất 2 thẻ.",
      "testData": "CheckOutModal đoàn vô danh: Tổng phát: 5 thẻ. Ô \"Thu hồi thẻ thường\": nhập 3. Ô \"Báo mất thẻ thường\": nhập 2.",
      "steps": [
        "1. Nhấn Checkout trên dòng đoàn khách vô danh đã phát 5 thẻ thường.",
        "2. Tại CheckOutModal, ô số thẻ thường thu hồi nhập = 3.",
        "3. Tại ô số thẻ thường báo mất, nhập = 2.",
        "4. Nhấn nút xác nhận Check-out (Xác nhận Check-out...)."
      ],
      "expected": [
        "Gọi API /station/visits/checkout thành công.",
        "CSDL ghi nhận AnonymousCardReturnedCount = 3, AnonymousCardLostCount = 2, số thẻ nợ còn lại = 0 (5 - 3 - 2 = 0).",
        "Tự động sinh 2 bản ghi VisitTransaction: 1 giao dịch ReturnCard (Qty=3) và 1 giao dịch LostCard (Qty=2, CardType='regular').",
        "Đoàn khách hoàn tất Checkout mà không bị chặn do nợ thẻ."
      ]
    },
    {
      "id": "TC-COUT-018",
      "module": "M04",
      "priority": "P1",
      "name": "Check-out Báo Mất Thẻ An Ninh Định Danh của Đoàn Vô Danh (Bảo toàn danh sách gốc)",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Đoàn khách vô danh được cấp 3 thẻ định danh có số: '#801', '#802', '#803'. Đoàn trả 2 thẻ #801, #802 và làm mất thẻ #803.",
      "testData": "CheckOutModal: Danh sách thẻ RFID: Tích chọn trả #801, #802; Tích chọn báo mất thẻ #803.",
      "steps": [
        "1. Mở CheckOutModal của đoàn khách vô danh.",
        "2. Tại danh sách Thẻ an ninh có số của đoàn: tích chọn thu hồi cho thẻ #801 và #802.",
        "3. Tích chọn trạng thái Báo mất cho thẻ #803.",
        "4. Nhấn nút xác nhận Check-out thu hồi / báo mất thẻ."
      ],
      "expected": [
        "API xử lý thành công. Mảng gốc AnonymousIdentityCardNumbers vẫn giữ nguyên vẹn [\"801\", \"802\", \"803\"] (không bị xóa phần tử).",
        "CSDL ghi nhận ReturnedAnonymousIdentityCardNumbers = [\"801\", \"802\"], LostAnonymousIdentityCardNumbers = [\"803\"].",
        "Số thẻ nợ được tính chính xác bằng 0 (các thẻ đã phát đều đã được trả hoặc ghi nhận mất).",
        "Sinh 2 bản ghi VisitTransaction: ReturnCard cho 801, 802 và LostCard cho 803."
      ]
    },
    {
      "id": "TC-COUT-019",
      "module": "M04",
      "priority": "P2",
      "name": "Đổi và Thay thế Thẻ An ninh bị Hỏng Chip / Gãy Thẻ qua CardIncidentModal mà không gián đoạn lượt khách",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Khách đang ở bên trong cơ quan nhưng thẻ an ninh bị hỏng không quét qua được cửa kiểm soát nội bộ.",
      "steps": [
        "1. Mở CardIncidentModal cho lượt khách cần đổi thẻ.",
        "2. Tại tab \"Khách có thông tin\", tích chọn \"Báo mất thẻ này\", bật tùy chọn cấp thẻ thay thế và nhập mã thẻ mới (vd: THE-VIP-105).",
        "3. Nhấn \"Xác nhận Báo mất & Cấp thay thế (Khách có thông tin)\"."
      ],
      "expected": [
        "Thẻ cũ được ghi nhận trạng thái thu hồi/mất do hỏng hóc.",
        "Thẻ mới được gán ngay vào lượt khách hiện tại; khách tiếp tục cuộc thăm với thẻ mới mà không cần check-out tạo lại lượt mới.",
        "Tạo bản ghi giao dịch VisitTransaction tương ứng cho thẻ cũ và thẻ mới."
      ],
      "testData": "Thẻ cũ bị hỏng: THE-VIP-088; Thẻ mới thay thế: THE-VIP-105."
    },
    {
      "id": "TC-COUT-020",
      "module": "M04",
      "priority": "P2",
      "name": "Thu hồi Thẻ Mất / Thẻ Nợ (Recover Lost/Debt Card) qua RecoverLostCardModal khi khách quay lại nộp trả thẻ từ đợt trước",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Khách có lượt thăm đã check-out từ hôm trước nhưng đang ở trạng thái Nợ thẻ (isCardReturned = false, isCardLost = false).",
      "steps": [
        "1. Khách mang thẻ an ninh nợ đến trạm gác để hoàn trả sau ca trực.",
        "2. Cán bộ trực ban mở RecoverLostCardModal từ menu Tiện ích trạm gác hoặc từ huy hiệu cảnh báo thẻ nợ trên Dashboard.",
        "3. Chọn đợt viếng thăm tương ứng và tích chọn các thẻ cần thu hồi về kho, nhập ghi chú thu hồi.",
        "4. Nhấn nút \"Xác Nhận Thu Hồi Về Kho\"."
      ],
      "expected": [
        "Lượt khách được giải phóng khỏi trạng thái Nợ thẻ / Mất thẻ.",
        "Mã thẻ an ninh được hoàn trả về kho thẻ sẵn sàng cấp phát cho lượt khách tiếp theo.",
        "Hiển thị thông báo thành công: \"Đã thu hồi thành công [N] thẻ về kho cấp phát!\".",
        "Sinh bản ghi giao dịch VisitTransaction với ActionType = RecoverLostCard."
      ],
      "testData": "Mã thẻ nợ cần hoàn trả: \"THE-012\"; Lượt khách tương ứng đã check-out ngày hôm qua."
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
      "name": "Chế độ hiển thị thống kê tổng quan trên Dashboard (Stats View Mode: Ẩn / Tinh gọn / Chi tiết)",
      "platform": "Giao diện Web Trực ban",
      "steps": [
        "1. Trên thanh công cụ Dashboard Trực ban (/staff.html), tại cụm nút chuyển chế độ thống kê, lần lượt nhấp chọn: \"Hiện chi tiết\", \"Hiện tinh gọn (Compact)\", và \"Ẩn thống kê (Hidden)\".",
        "2. Quan sát sự thay đổi kích thước và bố cục của 4 khối thẻ thống kê (Khách bên trong, Vào trong ca, Ra trong ca, Thẻ an ninh).",
        "3. Nhấn F5 tải lại trang để kiểm tra tính năng ghi nhớ trạng thái."
      ],
      "expected": [
        "Khối thống kê thay đổi kích thước mượt mà hoặc ẩn hoàn toàn để tối đa hóa không gian hiển thị bảng danh sách khách.",
        "Trạng thái được lưu tự động vào localStorage (key: \"smartvms_stats_view_mode\"), được khôi phục chính xác sau khi F5."
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
        "2. Chọn \"Sổ sách ngoại lệ\" hoặc \"Trực ban cổng\"."
      ],
      "expected": [
        "Chọn \"Sổ sách ngoại lệ\" chỉ hiển thị các lượt khách do nhân viên DataEntry tạo ra (có huy hiệu tím \"Sổ sách ngoại lệ\").",
        "Chọn \"Trực ban cổng\" chỉ hiển thị khách vào qua cổng trực tiếp."
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
        "1. Nhấp nút \"Tiện ích\" (SlidersHorizontal) trên thanh công cụ bên cạnh nút Check-in.",
        "2. Quan sát danh sách các mục chức năng trong menu dropdown mở ra."
      ],
      "expected": [
        "Menu dropdown mở ra chứa gọn gàng 5 mục tiện ích: 1. Tra cứu hồ sơ nâng cao (Ctrl+Shift+K), 2. Chế độ xem bảng (Thu gọn/Chi tiết), 3. Cài đặt màu sắc (DisplaySettingsModal), 4. Thu hồi thẻ mất (RecoverLostCardModal), 5. Làm mới danh sách (RefreshCw).",
        "Menu đóng mượt mà khi nhấp chọn một mục hoặc click ra ngoài (Click Outside)."
      ],
      "precondition": "Thanh công cụ Dashboard Trực ban.",
      "testData": "Nhấp icon SlidersHorizontal để mở menu gom nhóm Tiện ích."
    },
    {
      "id": "TC-DASH-015",
      "module": "M05",
      "priority": "P2",
      "name": "Cập nhật Thông tin Cuộc thăm Đang diễn ra qua UpdateVisitModal từ Bảng điều khiển Trực ban",
      "platform": "Giao diện Web Trực ban",
      "testData": "Cập nhật cán bộ tiếp đón từ \"Đ/c Trần Văn Nam\" sang \"Đ/c Lê Thị Mai - Phòng Kế hoạch\".",
      "steps": [
        "1. Tại bảng danh sách khách đang ở bên trong (Inside), tìm lượt khách cần sửa đổi.",
        "2. Nhấp nút thao tác \"Cập nhật\" (biểu tượng chiếc bút) trên dòng của khách.",
        "3. Hộp thoại UpdateVisitModal mở lên: sửa đổi Phòng ban đến làm việc, Cán bộ tiếp đón hoặc SĐT liên hệ.",
        "4. Nhấn \"Lưu thay đổi\" và quan sát dòng dữ liệu trên bảng Dashboard."
      ],
      "expected": [
        "Hệ thống gửi request POST /station/visits/update và nhận phản hồi thành công.",
        "Bản ghi lượt khách trên Dashboard cập nhật tức thì thông tin mới mà không làm thay đổi trạng thái Check-in của khách."
      ],
      "precondition": "Có ít nhất 1 lượt khách đang ở trạng thái Inside trong ca trực hiện tại."
    },
    {
      "id": "TC-DASH-016",
      "module": "M05",
      "priority": "P3",
      "name": "Tùy biến Giao diện Trực ban qua DisplaySettingsModal: Đổi Theme Color, Active Row Highlight Color & Opacity Slider",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Đang ở giao diện Trực ban (/staff.html).",
      "steps": [
        "1. Nhấp vào icon Bánh răng / Cài đặt hiển thị trên thanh công cụ bảng danh sách.",
        "2. Hộp thoại DisplaySettingsModal mở lên: chọn màu chủ đạo mới từ bảng màu (vd: màu Xanh ngọc #0d9488).",
        "3. Chọn màu highlight cho dòng đang chọn (Active Row Color, vd: #f59e0b).",
        "4. Kéo thanh trượt độ trong suốt (Active Row Opacity) từ 15% lên 30%.",
        "5. Nhấn \"Lưu cài đặt\"."
      ],
      "expected": [
        "Toàn bộ các nút bấm chính, tiêu đề bảng đổi sang màu chủ đạo mới.",
        "Dòng được nhấp chọn trên bảng Dashboard hiển thị màu highlight nổi bật với đúng độ mờ đục đã chọn.",
        "Cấu hình được lưu vào localStorage (`Local_themeColor`, `Local_activeRowColor`, `Local_activeRowOpacity`) và bảo toàn sau khi tải lại trang."
      ],
      "testData": "Theme Color: #0d9488; Active Row Color: #f59e0b; Opacity: 30%."
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
      "priority": "P2",
      "name": "Tra cứu & Đối soát Thẻ An ninh Toàn đoàn qua Modal Chuyên dụng (Sổ đối soát thẻ)",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Lượt khách (hoặc đoàn khách) có cấp phát cả thẻ định danh, thẻ người đi cùng và thẻ thường của đoàn vô danh.",
      "testData": "Modal Chi tiết lượt khách (VisitDetailsModal) -> Khối \"Thẻ an ninh\" -> Nút \"Xem sổ đối soát thẻ ↗\".",
      "steps": [
        "1. Mở modal Chi tiết lượt khách (VisitDetailsModal) của một đoàn khách.",
        "2. Tại Khối Thẻ an ninh, quan sát các thẻ KPI tóm tắt (Tổng phát, Đã thu hồi, Còn nợ, Đang báo mất).",
        "3. Nhấn nút \"Xem sổ đối soát thẻ ↗\".",
        "4. Cửa sổ con độc lập \"Sổ Theo Dõi & Đối Soát Thẻ An Ninh Toàn Đoàn\" mở ra.",
        "5. Kiểm tra bảng danh sách chi tiết: STT, Mã thẻ, Loại thẻ, Đối tượng được giao, Tiến độ, Tình trạng thu hồi và Cột thao tác nghiệp vụ."
      ],
      "expected": [
        "1. Modal Sổ đối soát thẻ hiển thị đầy đủ, rõ ràng toàn bộ danh mục thẻ an ninh đã cấp cho đoàn khách.",
        "2. Phân loại chuẩn xác từng dòng: Thẻ Trưởng đoàn, Thẻ người đi cùng, Thẻ định danh đoàn vô danh, Thẻ thường đoàn vô danh.",
        "3. Banner cảnh báo phía trên hiển thị chính xác số thẻ còn nợ hoặc thông báo màu xanh \"✓ Đã thu hồi đủ\" nếu không còn nợ thẻ.",
        "4. Cột Thao tác cung cấp nút \"Báo mất thẻ\" cho các thẻ còn đang giữ, hỗ trợ xử lý sự cố trực tiếp mà không cần chờ đến lúc check-out."
      ]
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
        "1. Trong VisitDetailsModal, chuyển sang Tab \"🕒 Nhật ký Ra/Vào chi tiết\" (TIMELINE)."
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
        "1. Trong VisitDetailsModal, chuyển sang Tab \"👥 Danh sách thành viên lượt khách\" (MEMBERS)."
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
      "id": "TC-VDET-013",
      "module": "M06",
      "priority": "P3",
      "name": "Thao tác Xem và Quản lý Bộ sưu tập Ảnh trong VisitPhotoGalleryModal kết hợp công cụ ZoomableImage",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Lượt khách có nhiều ảnh (ảnh chân dung, ảnh giấy tờ, ảnh xe lúc vào, ảnh lúc ra).",
      "steps": [
        "1. Trong VisitDetailsModal, chuyển sang Tab Thư viện ảnh (Photos) hoặc nhấp nút \"Xem tất cả ảnh\".",
        "2. Hộp thoại VisitPhotoGalleryModal mở lên hiển thị dạng lưới (Grid) toàn bộ ảnh liên quan đến lượt khách.",
        "3. Nhấp đúp chuột vào 1 ảnh bất kỳ để kích hoạt chế độ xem toàn màn hình qua ZoomableImage.",
        "4. Thử xoay ảnh theo chiều kim đồng hồ, phóng to 200%, kéo rê chuột để đọc thông tin mờ.",
        "5. Nhấn phím Escape hoặc nút đóng để quay lại modal chi tiết."
      ],
      "expected": [
        "Thư viện ảnh phân loại rõ ràng các nhóm ảnh: Ảnh check-in, Ảnh giấy tờ, Ảnh phương tiện, Ảnh check-out.",
        "Công cụ ZoomableImage hiển thị sắc nét, xoay và phóng to không bị méo tỷ lệ ảnh."
      ],
      "testData": "Lượt khách có tối thiểu 4 ảnh thuộc các giai đoạn khác nhau của cuộc thăm."
    },
    {
      "id": "TC-VDET-014",
      "module": "M06",
      "priority": "P4",
      "name": "Phóng to, Thu nhỏ và Soi chi tiết Ảnh bằng công cụ ZoomableImage trong Thư viện ảnh lượt thăm",
      "platform": "Giao diện Web Trực ban & Admin",
      "steps": [
        "1. Mở modal VisitDetailsModal của một lượt khách có ảnh giấy tờ tùy thân hoặc biển số xe.",
        "2. Chuyển sang Tab Thư viện ảnh (Photos) hoặc nhấp vào ảnh thu nhỏ trong Tab Tổng quan.",
        "3. Sử dụng con lăn chuột hoặc nút công cụ Zoom (+) / (-) để phóng to, thu nhỏ và kéo rê ảnh (Pan) để soi chi tiết.",
        "4. Thử nút xoay ảnh 90 độ và nút đặt lại kích thước ban đầu (Reset zoom)."
      ],
      "expected": [
        "Công cụ ZoomableImage phản hồi mượt mà với con lăn chuột và cử chỉ kéo rê chuột.",
        "Độ phân giải ảnh sắc nét, hiển thị rõ ràng từng chi tiết số CCCD, nét chữ trên giấy tờ hoặc ký tự biển số xe."
      ],
      "precondition": "Lượt khách có lưu ảnh chân dung, ảnh chụp giấy tờ hoặc ảnh phương tiện trong CSDL.",
      "testData": "Ảnh chụp mặt trước thẻ CCCD hoặc ảnh biển số xe ô tô/xe máy độ phân giải cao."
    },
    {
      "id": "TC-VDET-015",
      "module": "M06",
      "priority": "P1",
      "name": "Báo mất Thẻ An Ninh Giữa Chừng trong Sổ Đối Soát Thẻ (VisitDetailsModal)",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Đoàn khách đang ở bên trong khuôn viên (chưa check-out). Khách làm rơi thẻ an ninh trong phòng họp và báo trực ban.",
      "testData": "VisitDetailsModal của đoàn khách -> Khối Kiểm soát thẻ -> Bấm \"Xem sổ đối soát thẻ ↗\" -> Dòng thẻ đang nợ -> Bấm \"Báo mất\" -> Nhập lý do: \"Khách báo rơi thẻ tại tầng 3 phòng hội thảo\".",
      "steps": [
        "1. Trên Dashboard Trực ban, nhấp vào dòng lượt khách đang ở trong đơn vị để mở VisitDetailsModal.",
        "2. Chuyển sang Tab \"💳 Quản lý Thẻ & Sự cố\".",
        "3. Trong bảng đối soát chi tiết, tìm dòng thẻ cần báo mất, nhấp nút \"Báo mất thẻ này\" hoặc mở CardIncidentModal.",
        "4. Nhập lý do mất thẻ và xác nhận báo mất."
      ],
      "expected": [
        "Hệ thống ghi nhận trạng thái thẻ chuyển sang Báo mất thành công.",
        "Tab \"🕒 Nhật ký Ra/Vào chi tiết\" tự động ghi nhận sự kiện Báo mất thẻ an ninh kèm lý do và trạm tiếp nhận."
      ]
    },
    {
      "id": "TC-VDET-016",
      "module": "M06",
      "priority": "P1",
      "name": "Thu hồi Thẻ Mất Nhanh Trực Tiếp từ Sổ Đối Soát Thẻ (VisitDetailsModal)",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Lượt khách có thẻ đang ở trạng thái \"❌ Đã báo mất\".",
      "testData": "Tại bảng Sổ theo dõi & Đối soát thẻ trong VisitDetailsModal: Nhấp nút \"Thu hồi\" màu xanh lá tại cột Thao tác của dòng thẻ báo mất.",
      "steps": [
        "1. Mở VisitDetailsModal của lượt khách có thẻ bị báo mất.",
        "2. Nhấp nút \"Xem sổ đối soát thẻ ↗\" (hoặc nút \"Thu hồi thẻ mất\" tại khối Thống kê thẻ).",
        "3. Tìm dòng thẻ có trạng thái \"❌ Đã báo mất\", nhấp nút \"Thu hồi\" màu xanh lá.",
        "4. Modal RecoverLostCardModal tự động bật lên với thông tin lượt thăm đã được chọn sẵn.",
        "5. Nhập ghi chú và nhấn \"Thu hồi thẻ này\" (hoặc \"Xác nhận thu hồi thẻ\")."
      ],
      "expected": [
        "Modal RecoverLostCardModal mở ra ngay lập tức với đúng ngữ cảnh của lượt khách.",
        "Thực hiện thu hồi thành công, thẻ đổi trạng thái thành \"✓ Đã thu hồi\".",
        "Bộ đếm thẻ mất giảm xuống, bộ đếm đã thu hồi tăng lên, sổ đối soát cập nhật tức thì."
      ]
    },
    {
      "id": "TC-VDET-017",
      "module": "M06",
      "priority": "P2",
      "name": "Kiểm tra Tính toàn vẹn Audit Trail trong VisitDetailsModal: Hiển thị đúng Nguồn, Cán bộ tạo, Vị trí và IP",
      "platform": "Giao diện Web Trực ban & Admin",
      "precondition": "Có hồ sơ lượt khách được tạo từ Trạm gác và hồ sơ lượt khách được tạo từ Nhập liệu Sổ sách (DataEntry).",
      "steps": [
        "1. Mở VisitDetailsModal của lượt khách tạo từ Trạm gác -> Xem khối thông tin \"Nguồn gốc & Kiểm toán\" tại Tab Tổng quan.",
        "2. Quan sát các trường: Nguồn tạo (Trực ban cổng gác), Người tạo (Tên cán bộ), Trạm tạo, Địa chỉ IP.",
        "3. Mở VisitDetailsModal của lượt khách tạo từ Sổ sách ngoại lệ (DataEntry) -> Xem khối thông tin kiểm toán.",
        "4. Quan sát các trường: Nguồn tạo (Nhập liệu Sổ sách ngoại lệ), Người tạo (nhaplieu), Vị trí khởi tạo, Địa chỉ IP."
      ],
      "expected": [
        "Thông tin kiểm toán hiển thị minh bạch 100%, không bị nhầm lẫn giữa lượt khách trực tiếp và lượt khách hồi tố sổ sách.",
        "Địa chỉ IP và thời gian ghi nhận Database hiển thị chuẩn xác hỗ trợ công tác thanh tra bảo mật."
      ],
      "testData": "Lượt 1: CreatedByType = 0 (StationStaff); Lượt 2: CreatedByType = 1 (DataEntry)."
    },
    {
      "id": "TC-VDET-018",
      "module": "M06",
      "priority": "P2",
      "name": "Check-out Phương tiện Độc lập trực tiếp từ Tab Phương tiện trong VisitDetailsModal",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Đoàn khách đang ở bên trong cơ quan có gửi 1 xe ô tô và 1 xe máy; tài xế xe ô tô cần ra cổng trước.",
      "steps": [
        "1. Mở VisitDetailsModal của đoàn khách.",
        "2. Chuyển sang Tab Phương tiện (Vehicles) -> Tìm dòng xe ô tô cần check-out.",
        "3. Nhấp nút \"Cho xe này ra\" (Check-out xe) ngay trên dòng của xe trong modal.",
        "4. Xác nhận hộp thoại cho xe ra và chụp ảnh đối soát xe rời bãi."
      ],
      "expected": [
        "API POST /station/visits/vehicle-checkout được gọi thành công.",
        "Chiếc xe ô tô được cập nhật CheckOutTime và trạng thái chuyển sang \"Đã rời bãi\", trong khi khách và chiếc xe máy còn lại vẫn duy trì trạng thái Inside an toàn."
      ],
      "testData": "Biển số xe ô tô cần check-out trước: 29A-888.88 thuộc đoàn khách đang thăm."
    },
    {
      "id": "TC-DENT-001",
      "module": "M07",
      "priority": "P1",
      "name": "Đăng nhập Phân hệ Sổ sách Ngoại lệ qua DataEntryLoginScreen (/dataentry.html)",
      "platform": "Phân hệ Sổ sách DataEntry",
      "testData": "Truy cập /dataentry.html, đăng nhập: \"nhaplieu\" / \"123456\".",
      "steps": [
        "1. Mở trình duyệt, truy cập trực tiếp địa chỉ: https://smartvms.local/dataentry.html.",
        "2. Giao diện DataEntryLoginScreen hiển thị tiêu đề \"SmartVMS - Cổng Nhập Liệu Sổ Sách & Ngoại Lệ\" cùng biểu tượng sổ tay và form đăng nhập.",
        "3. Nhập Tên đăng nhập: \"nhaplieu\" và Mật khẩu: \"123456\". Thử nhấp icon con mắt để ẩn/hiện mật khẩu.",
        "4. Nhấn nút \"Đăng nhập\" (hoặc nhấn phím Enter)."
      ],
      "expected": [
        "Hệ thống xác thực qua API POST /admin/auth/login, lưu token Local_admin_token vào localStorage.",
        "Giao diện tự động chuyển thẳng vào DataEntryDashboard mà không bị gián đoạn hay bắt tải lại trang.",
        "Header hiển thị chính xác tên người dùng \"nhaplieu\", nhãn quyền tím \"DataEntry\", nút \"Nhập hồ sơ mới (F1)\", nút \"Hướng dẫn (F3)\" và đồng hồ thời gian thực."
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
      "name": "Form Nhập sổ sách ngoại lệ (DataEntryModal): Nhập hồi tố ngày giờ quá khứ & Đổi vị trí làm việc",
      "platform": "Phân hệ Sổ sách DataEntry",
      "testData": "Giờ vào: 08:30 ngày 01/10/2026, Họ tên: \"Phạm Văn Đoàn\", CCCD: \"001099000555\".",
      "steps": [
        "1. Tại giao diện DataEntry (/dataentry.html), nhấn nút \"Nhập hồ sơ mới (F1)\" (hoặc phím F1).",
        "2. Hộp thoại DataEntryModal mở lên: chọn ngày giờ vào trong quá khứ (Backdate, ví dụ: 08:30 ngày hôm qua).",
        "3. Chọn Trạm tiếp đón và Cán bộ trực tiếp nhận từ sổ ghi chép.",
        "4. Điền đầy đủ các trường thông tin bắt buộc có dấu sao đỏ (*).",
        "5. Nhấn nút \"Lưu hồ sơ sổ sách (Ctrl+S)\"."
      ],
      "expected": [
        "Hệ thống cho phép lưu ngày giờ quá khứ hợp lệ, gán đúng trạm và cán bộ trực của thời điểm đó.",
        "Bản ghi hồ sơ sổ sách được lưu vào SQLite với Status = 1 (nếu chưa checkout) hoặc Status = 2 (nếu đã checkout).",
        "Dữ liệu đồng bộ tức thì lên bảng danh sách của DataEntryDashboard và hiển thị huy hiệu tím \"Sổ sách ngoại lệ\"."
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
        "1. Trong DataEntryModal, tại khối trạng thái lượt khách, chuyển nút toggle sang \"✓ Đã ra về\" (TRẠNG THÁI: ĐÃ RA VỀ (CHECK-OUT)).",
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
      "name": "Nhập dữ liệu hồi tố Lượt khách có Thẻ mất: Kiểm toán Transaction toàn vẹn",
      "platform": "Phân hệ Sổ sách DataEntry",
      "precondition": "Truy cập phân hệ /dataentry.html.",
      "testData": "Nhập 1 lượt khách từ sổ giấy có thẻ chính báo mất và đoàn vô danh có 2 thẻ thường báo mất.",
      "steps": [
        "1. Mở trang Nhập ngoại lệ /dataentry.html.",
        "2. Nhập thông tin đoàn khách (Khách chính, người đi cùng, đoàn vô danh), chọn giờ vào và bật tùy chọn \"Đã check-out\", chọn giờ ra.",
        "3. Đánh dấu trạng thái thẻ: Thẻ chính chọn \"Mất thẻ\", Đoàn vô danh: phát 5 thẻ thường, thu hồi 3 thẻ, báo mất 2 thẻ.",
        "4. Nhấn nút \"Lưu hồ sơ sổ sách\"."
      ],
      "expected": [
        "Lưu thành công vào SQLite qua ManualEntryController.",
        "Hệ thống sinh đầy đủ các bản ghi VisitTransaction (IssueCard, ReturnCard, LostCard) cho cả thẻ định danh và thẻ thường của đoàn vô danh.",
        "Báo cáo Thẻ mất (LostCardsReportModal) và Sổ đối soát hiển thị đầy đủ bản ghi này kèm dấu kiểm toán IP, địa điểm và người nhập."
      ]
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
      "name": "Cẩm nang Quy trình & Sổ tay Nghiệp vụ Nhập liệu Ngoại lệ (DataEntryGuideModal - Phím tắt F3)",
      "platform": "Phân hệ Sổ sách DataEntry",
      "steps": [
        "1. Tại Header của giao diện DataEntry, nhấp vào nút \"Hướng dẫn (F3)\" (hoặc nhấn phím F3 trên bàn phím).",
        "2. Hộp thoại DataEntryGuideModal mở lên hiển thị cẩm nang nghiệp vụ trực quan.",
        "3. Duyệt qua các thẻ quy trình: Quy định nhập sổ hồi tố, Xử lý khách nợ thẻ/mất thẻ trên sổ trực, Đối soát số liệu sổ sách cuối ngày.",
        "4. Nhấn phím Escape hoặc nút đóng để quay lại màn hình làm việc."
      ],
      "expected": [
        "DataEntryGuideModal hiển thị tài liệu nghiệp vụ chuẩn hóa, trình bày khoa học, có hướng dẫn từng bước rõ ràng.",
        "Phím tắt F3 mở modal nhanh chóng từ bất kỳ vị trí nào trên Dashboard DataEntry."
      ],
      "precondition": "Giao diện DataEntry đang mở.",
      "testData": "Nhấp tab \"Hướng dẫn\" (hoặc nhấn phím F3) để mở DataEntryGuideTab."
    },
    {
      "id": "TC-DENT-016",
      "module": "M07",
      "priority": "P2",
      "name": "Bộ lọc Nguồn & Người tạo cuộc viếng thăm dạng Popover trên Dashboard DataEntry",
      "platform": "Phân hệ Sổ sách DataEntry",
      "steps": [
        "1. Tại thanh công cụ lọc của Dashboard DataEntry, nhấp vào nút dropdown \"Nguồn & Người tạo\".",
        "2. Hộp thoại Popover mở ra với thiết kế chuẩn hóa đồng bộ giao diện Staff.",
        "3. Tích chọn hoặc bỏ chọn các tùy chọn Nguồn: \"Trực ban cổng (Staff)\" và \"Sổ sách ngoại lệ (DataEntry)\".",
        "4. Chọn lọc theo tài khoản tạo cụ thể trong danh sách dropdown cán bộ.",
        "5. Quan sát danh sách lượt khách trên bảng làm mới thời gian thực."
      ],
      "expected": [
        "Bảng danh sách lọc chính xác theo trường createdByType và createdByName.",
        "Popover đóng mượt mà khi nhấp chuột ra ngoài vùng lọc (Click Outside handler).",
        "Nút bấm bộ lọc cập nhật nhãn tóm tắt phản ánh đúng trạng thái lọc hiện tại."
      ],
      "precondition": "Dashboard DataEntry đang hiển thị danh sách lượt khách.",
      "testData": "Dropdown originFilter: Chọn lọc \"Chỉ Trạm gác\" hoặc \"Chỉ tài khoản nhaplieu\"."
    },
    {
      "id": "TC-DENT-017",
      "module": "M07",
      "priority": "P1",
      "name": "Validation Chặn Nhập Giờ Check-out trước Giờ Check-in hoặc Ngày Giờ Tương lai trong DataEntryModal",
      "platform": "Phân hệ Sổ sách DataEntry",
      "precondition": "Form DataEntryModal đang mở với chế độ \"Nhập cả Check-in và Check-out\".",
      "steps": [
        "1. Nhập thời gian Check-in là 10:00 ngày hôm qua.",
        "2. Cố tình nhập thời gian Check-out là 08:00 ngày hôm qua (Check-out trước Check-in).",
        "3. Thử nhấn nút \"Lưu hồ sơ sổ sách\".",
        "4. Đổi thời gian Check-in hoặc Check-out thành một ngày trong tương lai (vd: ngày mai) -> Nhấn Lưu."
      ],
      "expected": [
        "Hệ thống chặn lại ngay lập tức tại giao diện client và hiển thị cảnh báo: \"Thời gian Check-out không được sớm hơn thời gian Check-in!\".",
        "Hệ thống chặn thời gian tương lai, không cho phép lưu hồ sơ với thời điểm chưa xảy ra.",
        "Không có request sai lệch nào được gửi lên server."
      ],
      "testData": "Check-in: 2026-10-10 10:00; Check-out không hợp lệ: 2026-10-10 08:00."
    },
    {
      "id": "TC-DENT-018",
      "module": "M07",
      "priority": "P3",
      "name": "Xem Nhanh Tóm Tắt Hồ Sơ Sổ Sách qua DataEntryDetailModal (Thao tác Nhấp đúp chuột dòng)",
      "platform": "Phân hệ Sổ sách DataEntry",
      "precondition": "Nhân viên nhập liệu đang ở giao diện Dashboard DataEntry (/dataentry.html).",
      "steps": [
        "1. Tại bảng danh sách hồ sơ sổ sách đã nhập trên DataEntryDashboard, nhấp đúp chuột vào một dòng bất kỳ.",
        "2. Hộp thoại xem nhanh DataEntryDetailModal tự động mở lên.",
        "3. Quan sát các khối thông tin: Khách đại diện, Thông tin tiếp đón, Trạng thái ra/vào, Thẻ an ninh, Phương tiện và Dấu vết kiểm toán.",
        "4. Thử nhấp nút \"Mở chi tiết chuyên sâu (Timeline)\" để liên thông sang VisitDetailsModal."
      ],
      "expected": [
        "DataEntryDetailModal nạp nhanh tóm tắt hồ sơ mà không cần tải lại toàn bộ dữ liệu.",
        "Hiển thị đầy đủ thông tin kiểm toán: Tài khoản nhập (nhaplieu), Thời điểm nhập thực tế, Vị trí phòng ban và IP máy trạm.",
        "Nút liên thông mở VisitDetailsModal mượt mà, giữ nguyên ngữ cảnh lượt khách đã chọn."
      ],
      "testData": "Phím tắt F3 mở cẩm nang nghiệp vụ; nhấp đúp dòng mở DataEntryDetailModal."
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
      "id": "TC-ADMN-018",
      "module": "M08",
      "priority": "P1",
      "name": "Thêm mới và Phân quyền Tài khoản Quản trị & Nhập liệu qua AdminUserModal (SystemAdmin vs DataEntry)",
      "platform": "Giao diện Quản trị Admin",
      "precondition": "Đăng nhập Admin thành công; mở Hub Danh mục -> Tab Quản lý Tài khoản (AccountsTab).",
      "steps": [
        "1. Nhấn nút \"+ Thêm tài khoản mới\" -> Hộp thoại AdminUserModal mở lên.",
        "2. Nhập Tên đăng nhập (vd: nhaplieu_ca2), Họ tên đầy đủ, Mật khẩu ban đầu.",
        "3. Lựa chọn vai trò (Role): chọn \"Nhân viên Nhập liệu Sổ sách (DataEntry)\".",
        "4. Nhấn \"Lưu tài khoản\".",
        "5. Đăng xuất và đăng nhập thử bằng tài khoản vừa tạo."
      ],
      "expected": [
        "Tài khoản mới được tạo thành công trong bảng LocalAdminUsers với Role = 1 (DataEntry).",
        "Khi đăng nhập bằng tài khoản này, hệ thống tự động chuyển hướng đúng sang giao diện /dataentry.html và chặn truy cập vào các trang cấu hình Admin."
      ],
      "testData": "Username: nhaplieu_ca2; Password: Password@123; Role: DataEntry."
    },
    {
      "id": "TC-ADMN-019",
      "module": "M08",
      "priority": "P2",
      "name": "Đổi Mật khẩu Tài khoản Cá nhân qua ChangePasswordModal và Reset Mật khẩu Người dùng qua ChangeUserPasswordModal",
      "platform": "Giao diện Quản trị Admin",
      "precondition": "Đăng nhập quyền Admin; đang ở trang quản trị.",
      "steps": [
        "1. Nhấp vào tên Admin trên góc phải Header -> Chọn \"Đổi mật khẩu\" -> ChangePasswordModal mở ra.",
        "2. Nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới -> Nhấn \"Cập nhật mật khẩu cá nhân\".",
        "3. Vào Tab Quản lý Tài khoản -> Tại dòng của user \"nhaplieu\", nhấp vào icon Chìa khóa (Reset mật khẩu).",
        "4. Hộp thoại ChangeUserPasswordModal mở ra: nhập mật khẩu mới áp đặt cho user hoặc chọn reset về mặc định.",
        "5. Nhấn \"Xác nhận đổi mật khẩu cho người dùng\"."
      ],
      "expected": [
        "ChangePasswordModal xác thực mật khẩu cũ và mã hóa salt/hash mật khẩu mới an toàn.",
        "ChangeUserPasswordModal cho phép quản trị viên cấp lại mật khẩu cho cấp dưới khi bị quên mật khẩu mà không cần biết mật khẩu cũ."
      ],
      "testData": "Admin password mới: Admin@2026!; User nhaplieu reset về: 123456."
    },
    {
      "id": "TC-ADMN-020",
      "module": "M08",
      "priority": "P1",
      "name": "Báo cáo Chuyên đề Thẻ Mất & Thất lạc Toàn diện trong Quản trị Admin (LostCardsReportModal): Lọc & Xuất Excel",
      "platform": "Giao diện Quản trị Admin",
      "precondition": "Admin -> Tab Trung tâm Báo cáo (ReportsTab) đang mở.",
      "steps": [
        "1. Nhấn nút nổi bật \"Báo cáo Thẻ Mất & Thất lạc\" trên thanh công cụ báo cáo.",
        "2. Modal chuyên đề LostCardsReportModal mở lên: quan sát 3 thẻ chỉ số thống kê (Tổng thẻ mất, Thẻ định danh mất, Thẻ thường mất).",
        "3. Lọc danh sách thẻ mất theo Trạm gác (Cổng chính / Trạm B) hoặc theo khoảng thời gian sự cố.",
        "4. Nhấn nút \"Xuất Excel Báo cáo Thẻ Mất\" và mở file tải về kiểm tra."
      ],
      "expected": [
        "LostCardsReportModal truy vấn API /admin/cards/lost-identity-cards và lost-regular-visits hiển thị chi tiết danh tính từng người làm mất thẻ.",
        "File Excel xuất ra có tiêu đề chuẩn hóa, format viền bảng và cột thông tin phục vụ công tác bồi thường/hủy thẻ tài sản."
      ],
      "testData": "Lọc thẻ mất phát sinh trong 30 ngày gần nhất của Trạm Cổng chính."
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
      "name": "Báo cáo Chuyên đề Thẻ Mất & Thất lạc Toàn diện (LostCardsReportModal)",
      "platform": "Giao diện Quản trị Admin",
      "precondition": "Trong đơn vị có phát sinh các trường hợp báo mất thẻ an ninh (từ Check-out cổng, từ Sổ đối soát thẻ hoặc từ DataEntry).",
      "testData": "ReportsTab -> Nhấp nút \"Báo cáo Thẻ mất\" -> Lọc theo khoảng ngày hoặc từ khóa.",
      "steps": [
        "1. Tại ReportsTab của Quản trị Admin (/admin.html), nhấn nút \"Báo cáo Thẻ mất\".",
        "2. Modal LostCardsReportModal mở ra.",
        "3. Quan sát danh sách tổng hợp các thẻ an ninh thất lạc trên toàn hệ thống.",
        "4. Thử tìm kiếm theo Mã thẻ, Tên khách hoặc Lọc theo trạng thái \"Chưa thu hồi\" / \"Đã thu hồi\"."
      ],
      "expected": [
        "Liệt kê chính xác toàn bộ thẻ định danh và thẻ thường đang bị báo mất trên toàn hệ thống.",
        "Hiển thị chi tiết: Mã thẻ, Loại thẻ, Họ tên khách, Số CCCD, SĐT, Cơ quan, Trạm gác tiếp nhận, Cán bộ ghi nhận, Thời gian báo mất, Trạng thái (Chưa thu hồi / Đã thu hồi).",
        "Cho phép xuất báo cáo chuyên đề thẻ mất ra Excel hoặc PDF chuẩn tiếng Việt có dấu."
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
      "id": "TC-REPT-014",
      "module": "M09",
      "priority": "P2",
      "name": "Báo cáo Đối soát Kiểm toán Hồ sơ Nhập liệu Sổ sách Ngoại lệ (Audit Entry Report): Xuất file Excel và PDF",
      "platform": "Giao diện Quản trị Admin",
      "precondition": "Admin -> Hub Giám sát -> Tab Đối soát Ngoại lệ (AuditEntryTab) đang mở.",
      "steps": [
        "1. Thiết lập bộ lọc thời gian đối soát hồ sơ sổ sách trong tuần vừa qua.",
        "2. Quan sát bảng đối soát hiển thị các hồ sơ có CreatedByType = DataEntry kèm tên người nhập và địa chỉ IP.",
        "3. Nhấn nút \"Xuất Excel Đối soát Sổ sách\" -> Kiểm tra file .xlsx.",
        "4. Nhấn nút \"Xuất PDF Biên bản Đối soát\" -> Kiểm tra bản in PDF."
      ],
      "expected": [
        "File Excel và PDF hiển thị rõ ràng 2 cột mốc thời gian: \"Thời điểm ghi nhận thực tế\" (CreatedAt) và \"Thời điểm sự kiện trên sổ sách\" (CheckInTime).",
        "Biên bản đối soát có phần ký nhận của Trưởng ban chỉ huy và Cán bộ trực ban đối soát."
      ],
      "testData": "Báo cáo đối soát cho tài khoản nhaplieu với 15 hồ sơ sổ sách đã nhập trong tuần."
    },
    {
      "id": "TC-REPT-015",
      "module": "M09",
      "priority": "P2",
      "name": "Kiểm thử Tính Toàn vẹn Phông chữ Tiếng Việt Unicode UTF-8 khi Xuất PDF Báo cáo qua jsPDF và fontBase64",
      "platform": "Giao diện Quản trị Admin",
      "precondition": "Báo cáo có chứa các bản ghi tên khách và địa chỉ có đầy đủ dấu tiếng Việt phức tạp (ắ, ằ, ẳ, ẵ, ặ, ơ, ờ, ở, ỡ, ợ, ư, ừ, ử, ữ, ự, ê, ế, ề, ể, ễ, ệ).",
      "steps": [
        "1. Thực hiện xuất báo cáo PDF lịch sử lượt khách từ ReportsTab.",
        "2. Mở file PDF bằng trình xem Adobe Acrobat Reader hoặc Microsoft Edge.",
        "3. Soi kỹ các trường Họ tên, Mục đích làm việc, Địa chỉ thường trú và Cán bộ tiếp đón."
      ],
      "expected": [
        "Thư viện jsPDF kết hợp bộ phông nhúng Base64 (fontBase64.ts) hiển thị tiếng Việt hoàn hảo 100%.",
        "Tuyệt đối không bị lỗi font (toán tử ô vuông, ký tự rác hỏi chấm ? hay mất dấu tiếng Việt)."
      ],
      "testData": "Khách hàng: \"Nguyễn Đắc Triệu Khương\", Địa chỉ: \"Xã Thường Thắng, Huyện Hiệp Hòa, Tỉnh Bắc Giang\"."
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
      "id": "TC-SETT-016",
      "module": "M10",
      "priority": "P1",
      "name": "Kiểm tra Cơ chế Tự động Sao lưu Dự phòng An toàn (Safety Pre-Restore Backup) trước khi Khôi phục CSDL",
      "platform": "Giao diện Quản trị Admin & C# Backend",
      "precondition": "Admin -> Hub Cài đặt -> Tab Sao lưu CSDL (BackupTab) đang mở.",
      "steps": [
        "1. Chọn 1 bản sao lưu cũ trong danh sách và nhấn nút \"Khôi phục (Restore)\".",
        "2. Hộp thoại cảnh báo rủi ro an toàn mở lên yêu cầu xác nhận.",
        "3. Nhấn \"Đồng ý Khôi phục\".",
        "4. Quan sát log hệ thống và thư mục C:\\SmartVMSLocalData\\backups."
      ],
      "expected": [
        "Trước khi ghi đè CSDL, Backend API tự động kích hoạt tạo 1 bản backup an toàn với tiền tố `backup_pre_restore_YYYYMMDD_HHmmss.db`.",
        "Nếu quá trình restore gặp sự cố, dữ liệu hiện tại vẫn được bảo toàn nguyên vẹn trong bản sao lưu dự phòng an toàn này."
      ],
      "testData": "Bản backup dùng để restore: backup_manual_20261001.db; Kiểm tra sinh file backup_pre_restore_*.db."
    },
    {
      "id": "TC-SETT-017",
      "module": "M10",
      "priority": "P2",
      "name": "Cấu hình Kết nối Máy trạm Khách trong Mạng LAN qua Cai_Dat_May_Khach.bat và Tự động Phân giải mDNS / SSL",
      "platform": "Cấu hình Mạng & Máy trạm Khách",
      "precondition": "Máy chủ SmartVMS đang chạy trong mạng LAN; máy trạm khách cùng lớp mạng LAN nội bộ.",
      "testData": "Chạy file Cai_Dat_May_Khach.bat với quyền Administrator trên máy khách.",
      "steps": [
        "1. Sao chép thư mục hoặc file Cai_Dat_May_Khach.bat và SmartVMS_Client_Certificate.cer sang máy tính khách trong mạng LAN.",
        "2. Nhấp chuột phải vào Cai_Dat_May_Khach.bat chọn \"Run as administrator\".",
        "3. Quan sát script tự động dò tìm máy chủ qua giao thức mDNS smartvms.local, hoặc cho phép người dùng nhập IP máy chủ nếu mạng chặn multicast.",
        "4. Script tự động ánh xạ file hosts của Windows (ví dụ: 192.168.1.100 smartvms.local) và cài đặt chứng chỉ SSL vào Trusted Root Certification Authorities.",
        "5. Mở trình duyệt Chrome/Edge trên máy khách, truy cập https://smartvms.local/staff.html."
      ],
      "expected": [
        "Trình duyệt truy cập thành công qua giao thức HTTPS với biểu tượng ổ khóa xanh bảo mật, không xuất hiện cảnh báo \"Your connection is not private\" (NET::ERR_CERT_AUTHORITY_INVALID).",
        "Trình duyệt tự động cấp quyền truy cập Camera/Webcam mượt mà không bị chặn, máy khách hoạt động trơn tru như máy chủ cục bộ."
      ]
    },
    {
      "id": "TC-DEVC-001",
      "module": "M11",
      "priority": "P1",
      "name": "Kết nối DeviceService qua WebSocket (ws://127.0.0.1:6026/ws) & Kiểm tra REST API Health Check",
      "platform": "Thiết bị & Dịch vụ Nền",
      "steps": [
        "1. Khởi động dịch vụ Windows Service SmartVMSLocalDeviceService (lắng nghe cổng 6026).",
        "2. Mở trình duyệt gọi REST API GET http://127.0.0.1:6026/health và http://127.0.0.1:6026/health/detail.",
        "3. Mở giao diện trạm gác (/staff.html), kiểm tra kết nối WebSocket hai kênh (channel=id và channel=qr)."
      ],
      "expected": [
        "REST API /health trả về JSON trạng thái Healthy của SmartVMS.Local.DeviceService.",
        "REST API /health/detail cung cấp chi tiết tình trạng kết nối phần cứng và cấu hình cổng QR.",
        "Trình duyệt thiết lập kết nối WebSocket ổn định tới ws://127.0.0.1:6026/ws?channel=id và ?channel=qr; Trạng thái thiết bị trên giao diện hiển thị Online, không có banner cảnh báo lỗi."
      ],
      "precondition": "Dịch vụ SmartVMS.Local.DeviceService đang chạy trên máy trạm tại cổng TCP 6026.",
      "testData": "WebSocket URL: ws://127.0.0.1:6026/ws?channel=id và ?channel=qr; REST API: http://127.0.0.1:6026/health."
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
      "priority": "P1",
      "name": "Tự động Phân giải & Điều phối Cổng COM giữa QR CCCD tích hợp và Máy quét QR VNeID ngoài (IntegratedQrPortResolver)",
      "platform": "Dịch vụ Thiết bị DeviceService",
      "steps": [
        "1. Cắm cả 2 module quét mã QR (QR tích hợp đầu đọc EA09N/W3 và máy quét QR VNeID độc lập GM72) vào máy trạm.",
        "2. Khởi động SmartVMSLocalDeviceService, kiểm tra log khởi tạo và gọi GET http://127.0.0.1:6026/health/detail.",
        "3. Quét mã QR trên thẻ CCCD tại khe đọc tích hợp và quét mã QR trên ứng dụng VNeID từ điện thoại tại máy quét ngoài."
      ],
      "expected": [
        "Thuật toán IntegratedQrPortResolver tự động phân tích USB Topology gần anchor AIOT PCSC để chỉ định đúng cổng COM cho QR tích hợp và COM cho QR ngoài.",
        "API /health/detail hiển thị method phân giải chính xác (ví dụ TopologyAnchorMatched hoặc TopologySingleComFallback).",
        "Dữ liệu từ hai máy quét được phân luồng độc lập qua WebSocket channel=id và channel=qr, không bị xung đột hay nuốt mã quét."
      ],
      "precondition": "DeviceService kết nối máy trạm có tích hợp module QR trong đầu đọc CCCD và máy quét QR ngoài.",
      "testData": "Đầu đọc CCCD EA09N/W3 kèm module QR tích hợp (AC90/3003) và Máy quét QR VNeID ngoài GM72 (9901/0303)."
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
      "id": "TC-DEVC-014",
      "module": "M11",
      "priority": "P1",
      "name": "Cấu hình Hồ sơ Thiết bị Đọc Chip CCCD (W3, EA09N, EA09/W4 LAN) và Gửi Lệnh Hot Reload qua REST API /config/device-profile",
      "platform": "Giao diện Quản trị Admin & DeviceService",
      "precondition": "DeviceService đang chạy; Admin đang ở Tab Cài đặt Thiết bị (SettingsDevicePanel).",
      "steps": [
        "1. Trong SettingsDevicePanel, thay đổi Hồ sơ thiết bị từ \"W3\" sang \"EA09N\" (hoặc EA09/W4 LAN).",
        "2. Nhập URL SocketIO máy chủ nếu cấu hình đọc qua mạng LAN.",
        "3. Nhấn nút \"Áp dụng & Tải lại phần cứng (Hot Reload)\".",
        "4. Quan sát log của DeviceService và gọi GET http://127.0.0.1:6026/health/detail để kiểm tra."
      ],
      "expected": [
        "Admin UI gửi request POST tới http://127.0.0.1:6026/config/device-profile thành công.",
        "DeviceService ghi cấu hình mới vào `C:\\SmartVMSLocalData\\device-settings.json` và tự động nạp lại phần cứng mà không cần khởi động lại Windows Service."
      ],
      "testData": "DeviceProfile: \"EA09N\"; SocketIOUrl: \"http://192.168.1.100:8080\"."
    },
    {
      "id": "TC-DEVC-015",
      "module": "M11",
      "priority": "P2",
      "name": "Xử lý Tranh chấp Cổng COM và Chống Tràn Buffer khi Quét Mã QR VNeID Tốc độ Cao",
      "platform": "Dịch vụ Thiết bị DeviceService (QrScannerDevice)",
      "precondition": "Máy quét mã QR 2D GM72 kết nối cổng COM nối tiếp USB với tốc độ 115200 bps.",
      "steps": [
        "1. Đưa liên tiếp 3 mã QR VNeID khác nhau qua máy quét với tần suất nhanh (dưới 0.5 giây/lần).",
        "2. Quan sát log QrScannerDevice và thông điệp truyền qua WebSocket channel=qr.",
        "3. Kiểm tra dữ liệu hiển thị trên giao diện web."
      ],
      "expected": [
        "DeviceService xử lý chuỗi ký tự qua bộ đệm dòng (Line buffer) chuẩn xác theo ký tự kết thúc (CR/LF).",
        "Không bị dính chuỗi giữa 2 lần quét liên tiếp, không bị tràn buffer COM và không bỏ sót lượt quét."
      ],
      "testData": "Quét 3 chuỗi mã QR VNeID định dạng 12 số CCCD|9 số CMND|Họ tên|Ngày sinh|Giới tính|Địa chỉ|Ngày cấp."
    },
    {
      "id": "TC-DEVC-016",
      "module": "M11",
      "priority": "P2",
      "name": "Kiểm tra Đọc Thẻ An Ninh Mifare qua PCSC IsoReader APDU FF CA 00 00 00 và Bàn phím HID Wedge",
      "platform": "Dịch vụ Thiết bị DeviceService (CardReader)",
      "precondition": "Đầu đọc thẻ thông minh PCSC hoặc đầu đọc thẻ RFID cổng USB cắm vào máy trạm.",
      "steps": [
        "1. Khởi động SmartCardReader trong DeviceService.",
        "2. Chạm thẻ an ninh Mifare Classic / Ultralight 13.56 MHz vào vùng đọc.",
        "3. Quan sát log nhận diện lệnh APDU CLA=0xFF INS=0xCA P1=0x00 P2=0x00.",
        "4. Kiểm tra mã UID đọc được và thông điệp gửi qua WebSocket tới client."
      ],
      "expected": [
        "SmartCardReader bắt sự kiện CardInserted, gửi lệnh APDU đọc UID thành công.",
        "Mã UID (vd: A1B2C3D4) được đẩy trực tiếp về Web UI qua sự kiện CardData hoặc điền tự động vào trường Mã thẻ."
      ],
      "testData": "Thẻ Mifare 1K; UID 4-byte hoặc 7-byte hexa chuẩn ISO 14443 Type A."
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
      "name": "Ứng dụng Desktop Trạm Gác Kiosk (SmartVMS.Local.StationApp WebView2) & Cơ chế Ngăn tắt khi chưa Rời ca",
      "platform": "Ứng dụng Desktop Windows WPF (StationApp)",
      "steps": [
        "1. Khởi chạy ứng dụng SmartVMS.Local.StationApp.exe từ Shortcut Desktop hoặc thư mục cài đặt.",
        "2. Kiểm tra giao diện Kiosk toàn màn hình, WebView2 tự động cấp quyền Webcam/Camera cho trang trạm gác.",
        "3. Đăng nhập tài khoản trạm (vd: Nv001a1) và thực hiện chụp ảnh vào ca trực.",
        "4. Thử nhấn nút đóng ứng dụng (X) hoặc bấm Alt+F4 khi ca trực vẫn đang mở và tài khoản đang đăng nhập.",
        "5. Thực hiện Rời ca (kết ca) đóng ca trực, sau đó thực hiện đóng ứng dụng."
      ],
      "expected": [
        "StationApp khởi động ở chế độ Kiosk chuẩn, tự động cấp quyền camera không bị trình duyệt chặn prompt.",
        "Khi cán bộ đang trong ca trực, sự kiện Closing chặn lại và hiển thị cảnh báo: \"Bạn đang trong ca trực. Vui lòng hoàn tất Rời ca trước khi thoát ứng dụng.\"",
        "Sau khi đã Rời ca thành công (localStorage không còn phiên làm việc), ứng dụng đóng an toàn."
      ],
      "precondition": "Máy trạm đã cài đặt SmartVMS.Local.StationApp và Microsoft Edge WebView2 Runtime.",
      "testData": "Tài khoản nhân viên trực ban: Nv001a1; URL Kiosk: https://smartvms.local/staff.html."
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
    },
    {
      "id": "TC-BKGD-014",
      "module": "M12",
      "priority": "P1",
      "name": "Kiểm tra Cơ chế Miễn trừ Đóng tự động đối với Khách Lưu Trú Qua Đêm / Nhiều Ngày (isMultiDayVisit = true) trong AutoCheckOutHostedService",
      "platform": "Dịch vụ Ngầm C# Backend (AutoCheckOutHostedService)",
      "precondition": "Có 2 lượt khách vào ngày hôm trước: Khách A không có cờ lưu trú qua đêm (`isMultiDayVisit = false`), Khách B có cờ lưu trú qua đêm (`isMultiDayVisit = true`); Cấu hình AutoCheckoutSameDayVisits = true.",
      "steps": [
        "1. Để hệ thống chạy qua 00:00 ngày hôm sau hoặc kích hoạt tiến trình AutoCheckOutHostedService.",
        "2. Kiểm tra trạng thái của Khách A trong Database.",
        "3. Kiểm tra trạng thái của Khách B trong Database."
      ],
      "expected": [
        "Khách A tự động chuyển sang `Status = CheckedOut` với `IsAutoCheckedOut = true` và `CheckOutTime = 23:59:59` ngày vào.",
        "Khách B VẪN DUY TRÌ `Status = Inside`, không bị đóng tự động, bảo đảm tính toàn vẹn nghiệp vụ khách công tác qua đêm."
      ],
      "testData": "Khách A: CheckInTime = 2026-10-10, isMultiDayVisit = 0; Khách B: CheckInTime = 2026-10-10, isMultiDayVisit = 1."
    },
    {
      "id": "TC-BKGD-015",
      "module": "M12",
      "priority": "P1",
      "name": "Kiểm tra Cơ chế Tự động Chuyển hướng HTTP cổng 80 sang HTTPS cổng 443 (Redirect 302) và Tính Hợp lệ của Chứng chỉ SSL 10 năm",
      "platform": "Dịch vụ Backend Kestrel & Mạng Cục bộ",
      "precondition": "Dịch vụ SmartVMSLocalBackend đang chạy trên máy tính.",
      "steps": [
        "1. Mở trình duyệt, nhập vào thanh địa chỉ: `http://smartvms.local` (giao thức HTTP cổng 80).",
        "2. Quan sát phản hồi của server trên tab Network của trình duyệt Developer Tools.",
        "3. Kiểm tra biểu tượng ổ khóa xanh bảo mật trên thanh địa chỉ HTTPS.",
        "4. Nhấp vào ổ khóa xem chi tiết chứng chỉ số SSL."
      ],
      "expected": [
        "Server Kestrel phản hồi mã HTTP 302 Redirect chuyển hướng ngay sang `https://smartvms.local/staff.html`.",
        "Chứng chỉ SSL hiển thị trạng thái hợp lệ (\"Certificate is valid\"), được cấp cho smartvms.local, thời hạn 10 năm, nằm trong Trusted Root Authorities."
      ],
      "testData": "URL thử nghiệm: http://smartvms.local và http://smartvms.local:80/admin.html."
    },
    {
      "id": "TC-SEC-INJECT-01",
      "module": "M05",
      "priority": "P1",
      "name": "Kiểm thử an ninh: Phòng chống tấn công SQL Injection & XSS tại ô tìm kiếm tra cứu khách và AdvancedSearchModal",
      "platform": "Giao diện Web Trực ban",
      "type": "Bảo mật",
      "suite": "SECURITY_FRAUD",
      "testData": "Payload: admin' OR '1'='1 hoặc script tag độc hại.",
      "precondition": "Đang ở giao diện Trực ban cổng (/staff.html); hệ thống đang kết nối SQLite API.",
      "steps": [
        "1. Tại giao diện Trực ban (/staff.html), nhập chuỗi tấn công SQL Injection (vd: ' OR '1'='1 --) hoặc mã XSS (vd: <script>alert(1)</script>) vào ô Tìm kiếm thông minh trên thanh công cụ.",
        "2. Mở Cửa sổ Tra cứu Hồ sơ Lịch sử Độc lập (AdvancedSearchModal qua tổ hợp phím Ctrl + Shift + K).",
        "3. Nhập các chuỗi payload khai thác vào các trường Họ tên, Số CCCD, Biển số xe, Cán bộ đón -> Nhấn \"Tìm kiếm\".",
        "4. Quan sát phản hồi trên giao diện và tab Network của trình duyệt."
      ],
      "expected": [
        "Hệ thống tự động khử độc (Sanitize/Escape) đầu vào, câu lệnh Entity Framework Core sử dụng Parameterized Query an toàn.",
        "Giao diện React escape chuỗi ký tự tự động, không thực thi mã JavaScript độc hại và không hiển thị lỗi cú pháp CSDL SQLite.",
        "Danh sách trả về 0 kết quả phù hợp hoặc thông báo không tìm thấy hồ sơ an toàn, không rò rỉ bất kỳ thông tin nhạy cảm nào."
      ]
    },
    {
      "id": "TC-DASH-017",
      "module": "M05",
      "priority": "P2",
      "name": "Cửa sổ Thống kê Chi tiết Toàn diện qua DetailedStatsModal: 5 Tab Chuyên sâu & Danh sách Cán bộ Trực ban trong Ca",
      "platform": "Giao diện Web Trực ban",
      "precondition": "Cán bộ trực ban đang trong ca trực tại /staff.html; hệ thống có dữ liệu khách, xe và thẻ an ninh trong ca.",
      "testData": "Nhấp vào bất kỳ thẻ chỉ số KPI nào trên Dashboard (Khách bên trong, Vào trong ca, Ra trong ca, Thẻ an ninh) hoặc nút xem thống kê chi tiết.",
      "steps": [
        "1. Trên Dashboard Trực ban (/staff.html), nhấp chuột vào một trong 4 thẻ chỉ số thống kê (hoặc thẻ \"Thẻ an ninh\").",
        "2. Quan sát hộp thoại DetailedStatsModal mở lên dạng modal toàn màn hình chuyên nghiệp với 5 tab chức năng: \"Lượt khách (visits)\", \"Quân số (people)\", \"Phương tiện (vehicles)\", \"Thẻ An ninh (cards)\", \"Cơ quan / Đơn vị (organizations)\".",
        "3. Chuyển sang tab \"Thẻ An ninh\": Kiểm tra hiển thị đầy đủ Dual Metrics (Thẻ Định danh RFID vs Thẻ Thường cấp chung, Thẻ đang mượn, Thẻ mất, Thẻ nợ).",
        "4. Chuyển sang tab \"Cơ quan / Đơn vị\": Kiểm tra bảng tổng hợp gộp cơ quan và danh sách khách chi tiết tương ứng.",
        "5. Tại góc trên, nhấp nút \"Xem cán bộ trực ban trong ca\" -> Quan sát popup danh sách cán bộ đang trực.",
        "6. Nhấn phím Escape: Kiểm tra popup cán bộ đóng trước; nhấn Escape lần nữa để đóng DetailedStatsModal."
      ],
      "expected": [
        "DetailedStatsModal nạp dữ liệu tức thì qua bộ tính toán detailedStatsCalculator, giao diện đẹp mắt, tương thích hoàn hảo Dark/Light mode.",
        "Tab Thẻ an ninh phân định rõ ràng giữa Thẻ định danh RFID và Thẻ thường theo đúng quy tắc kiểm soát cổng 2026.",
        "Popup cán bộ trực ban hiển thị chính xác họ tên, mã cán bộ và thời gian vào ca.",
        "Phím Escape hoạt động phân tầng thông minh: đóng modal con trước, đóng modal cha sau."
      ]
    },
    {
      "id": "TC-PERF-RUSH-01",
      "module": "M02",
      "priority": "P1",
      "name": "Kiểm thử tải đồng thời giờ cao điểm: 50 lượt check-in khách liên tiếp trong 2 phút",
      "platform": "Hệ thống Kiosk Trạm gác & Server API",
      "type": "Hiệu năng",
      "suite": "PERF_STRESS",
      "testData": "50 khách lẻ và phương tiện dồn dập vào cổng giờ đầu buổi sáng.",
      "precondition": "2 làn vào hoạt động, cơ sở dữ liệu đã có 100,000 bản ghi lịch sử.",
      "steps": [
        "1. Giả lập gửi 50 request check-in liên tục với tần suất 1 request mỗi 2.4 giây.",
        "2. Đo thời gian phản hồi (Response time) từ lúc quẹt thẻ/quét CCCD đến khi cấp mã QR/phát thẻ.",
        "3. Giám sát CPU/RAM máy trạm Kiosk và Server."
      ],
      "expected": [
        "Thời gian phản hồi trung bình (Avg Latency) < 1.2 giây/lượt, không vượt quá 2 giây.",
        "CPU server không vượt quá 75%, không xảy ra hiện tượng deadlock hoặc nghẽn hàng đợi (Queue Timeout).",
        "100% (50/50) giao dịch check-in được ghi nhận thành công và đầy đủ thông tin."
      ]
    },
    {
      "id": "TC-RES-OFFLINE-01",
      "module": "M12",
      "priority": "P1",
      "name": "Kiểm thử Chịu lỗi Mất mạng Internet WAN: Hệ thống Cục bộ Hoạt động Độc lập Ngoại tuyến 100% với CSDL SQLite WAL",
      "platform": "Ứng dụng Trạm gác Kiosk Standalone",
      "type": "Độ tin cậy",
      "suite": "FAILOVER_OFFLINE",
      "testData": "Ngắt kết nối mạng cáp mạng LAN/Wi-Fi tại trạm gác trong 30 phút.",
      "precondition": "Trạm gác đang trong ca trực hoạt động bình thường.",
      "steps": [
        "1. Ngắt kết nối Internet WAN trên máy chủ/máy trạm (rút cáp Internet ngoài hoặc tắt card mạng WAN).",
        "2. Truy cập hệ thống tại https://smartvms.local/staff.html (hoặc qua ứng dụng Kiosk StationApp).",
        "3. Thực hiện quy trình mở ca trực bằng Webcam/CCCD, tiếp đón khách quét chip CCCD/VNeID, cấp phát thẻ an ninh RFID và đăng ký phương tiện.",
        "4. Thực hiện check-out khách, thu hồi thẻ và xuất báo cáo nội bộ.",
        "5. Kiểm tra tính toàn vẹn dữ liệu và thời gian phản hồi."
      ],
      "expected": [
        "Hệ thống hoạt động trơn tru 100%, không phát sinh bất kỳ lỗi kết nối hay phụ thuộc dịch vụ đám mây bên ngoài.",
        "Cơ sở dữ liệu SQLite cục bộ ở chế độ Write-Ahead Logging (WAL) ghi nhận tức thời mọi giao dịch với độ trễ < 50ms.",
        "Cán bộ trực ban cấp phát thẻ an ninh và vận hành trạm gác hoàn toàn bình thường khi mất kết nối Internet diện rộng."
      ]
    },
    {
      "id": "TC-HW-ANPR-01",
      "module": "M11",
      "priority": "P2",
      "name": "Kiểm thử Tích hợp Camera Chụp ảnh Phương tiện & Nhận diện Biển số Xe (ANPR Vehicle OCR)",
      "platform": "Hệ thống Camera Trực ban & Engine OCR Biển số",
      "type": "Tích hợp",
      "suite": "INTEGRATION_HW",
      "testData": "Xe ô tô bật đèn pha chiếu thẳng vào ống kính camera lúc 20h00.",
      "precondition": "Camera nhận diện biển số ANPR lắp đặt tại làn xe vào.",
      "steps": [
        "1. Tại tab Phương tiện trên form Check-in (/staff.html) hoặc trong modal Chi tiết, kích hoạt camera chụp ảnh phương tiện và nhận diện biển số xe.",
        "2. Cho xe ô tô hoặc xe máy tiến vào vùng camera, chụp ảnh biển số xe trong điều kiện ban đêm hoặc ngược sáng đèn xe.",
        "3. Kiểm tra tính năng nhận diện chuỗi ký tự biển số xe (OCR) và ảnh lưu trữ đính kèm."
      ],
      "expected": [
        "Camera chụp ảnh rõ nét biển số xe và đầu xe, tự động xử lý độ tương phản tránh lóa sáng đèn pha.",
        "Engine OCR nhận diện chính xác ít nhất 92% chuỗi ký tự biển số chuẩn Việt Nam, tự động điền vào trường Biển số xe.",
        "Ảnh chụp phương tiện được lưu trữ trong CSDL SQLite và hiển thị trên Dashboard để đối soát lúc check-out."
      ]
    },
    {
      "id": "TC-NEG-BOUNDARY-01",
      "module": "M07",
      "priority": "P2",
      "name": "Kiểm thử ngoại lệ giá trị biên: Nhập họ tên 500 ký tự và số CCCD chứa ký tự đặc biệt",
      "platform": "Giao diện Nhập liệu Sổ sách DataEntry",
      "type": "Ngoại lệ",
      "suite": "REGRESSION",
      "testData": "Họ tên 500 ký tự A..., CCCD chứa ký tự đặc biệt.",
      "precondition": "Mở form Đăng ký khách ngoại lệ.",
      "steps": [
        "1. Dán chuỗi họ tên 500 ký tự vào ô Họ và tên.",
        "2. Nhập số CCCD chứa ký tự đặc biệt vào ô Căn cước công dân.",
        "3. Nhấn Lưu bản ghi."
      ],
      "expected": [
        "Hệ thống tự động cắt ngắn hoặc chặn trường họ tên tối đa 100 ký tự, hiển thị cảnh báo đỏ.",
        "Trường CCCD báo lỗi: Số CCCD chỉ được chứa 12 chữ số hợp lệ theo quy định Bộ Công An.",
        "Không xảy ra lỗi Server 500 hoặc vỡ khung giao diện."
      ]
    },
    {
      "id": "TC-DENT-019",
      "module": "M07",
      "priority": "P1",
      "name": "Validation Dấu sao đỏ (*) và Viền đỏ Cảnh báo Các trường Bắt buộc Nhập kèm Khối Cảnh báo Tổng hợp ở Dưới cùng trong DataEntryModal",
      "platform": "Phân hệ Sổ sách DataEntry",
      "precondition": "DataEntryModal đang mở trên màn hình (nhấn F1 từ /dataentry.html).",
      "testData": "Cố tình để trống các trường bắt buộc hoặc xóa trắng thông tin Họ tên, CCCD.",
      "steps": [
        "1. Mở DataEntryModal (F1). Quan sát các nhãn trường thông tin tại Tab 1 (Bối cảnh & Khách đại diện).",
        "2. Kiểm tra sự hiện diện của dấu sao đỏ (*) trên các trường bắt buộc: \"Họ và tên khách đại diện *\", \"Số CCCD / Hộ chiếu *\", \"Cơ quan / Đơn vị khách *\", \"Cán bộ tiếp đón *\", \"Mục đích công tác *\", \"Thời gian vào (Check-in) *\".",
        "3. Thêm phương tiện cho khách chính -> Kiểm tra nhãn trường Số điện thoại tự động chuyển thành \"* (có xe)\" bắt buộc nhập.",
        "4. Cố tình để trống trường Họ và tên hoặc Số CCCD -> Quan sát ô nhập liệu tự động hiển thị viền đỏ 2px (border-rose-500) và dòng cảnh báo lỗi đỏ ngay dưới ô.",
        "5. Cuộn xuống dưới cùng của form (ngay phía trên thanh Footer) -> Quan sát Khối cảnh báo lỗi đỏ tổng hợp (bg-rose-50 border-rose-300): \"Cần khắc phục [N] điểm trước khi lưu:\" cùng danh sách chi tiết các điểm cần sửa.",
        "6. Nút \"Lưu hồ sơ sổ sách (Ctrl+S)\" chuyển sang trạng thái disabled (màu xám nhạt, cursor-not-allowed) và không thể bấm lưu khi còn lỗi."
      ],
      "expected": [
        "Tất cả các trường bắt buộc đều có dấu sao đỏ và viền đỏ cảnh báo khi để trống.",
        "Khối thông báo lỗi đỏ được đặt ở DƯỚI CÙNG của form theo đúng yêu cầu thiết kế giao diện chuẩn, không chèn che khuất nội dung phía trên.",
        "Hệ thống chặn submit tuyệt đối (canSubmit = false) cho đến khi người dùng điền đầy đủ và chính xác tất cả thông tin bắt buộc."
      ]
    },
    {
      "id": "TC-DENT-020",
      "module": "M07",
      "priority": "P2",
      "name": "Tìm kiếm Thông minh Tự động lọc & Popover 5 Nhóm Đối tượng trên Dashboard DataEntry (Đồng bộ Giao diện Staff)",
      "platform": "Phân hệ Sổ sách DataEntry",
      "precondition": "Người dùng đã đăng nhập vào /dataentry.html và có danh sách hồ sơ khách trên Dashboard.",
      "testData": "Từ khóa tìm kiếm: biển số xe, tên khách hoặc mã thẻ an ninh.",
      "steps": [
        "1. Trên thanh công cụ Dashboard DataEntry, nhấn tổ hợp phím Ctrl + K để focus nhanh vào ô Tìm kiếm thông minh.",
        "2. Gõ từ khóa tìm kiếm (ví dụ tên khách \"Nam\" hoặc biển số \"30A\"). Quan sát bảng danh sách phía dưới.",
        "3. Nhấp vào biểu tượng Popover lọc nhóm đối tượng (bên cạnh ô tìm kiếm) để mở menu 5 nhóm: Khách chính, Người đi cùng, Phương tiện, Thẻ an ninh, Cơ quan / Cán bộ tiếp đón.",
        "4. Quan sát các huy hiệu đếm số lượng bản ghi khớp (Badge count) thời gian thực trên từng nhóm.",
        "5. Thử bấm \"Bỏ chọn tất cả\" rồi chỉ tích chọn nhóm \"Phương tiện\"."
      ],
      "expected": [
        "Hệ thống tự động lọc danh sách tức thời ngay khi gõ phím mà không cần nhấn phím Enter.",
        "Popover 5 nhóm hoạt động mượt mà, hiển thị chuẩn xác số lượng khớp và lọc chính xác theo đối tượng đã chọn, đồng bộ hoàn toàn với trải nghiệm trên giao diện Trực ban Staff."
      ]
    },
    {
      "id": "TC-DENT-021",
      "module": "M07",
      "priority": "P2",
      "name": "Hiển thị Có điều kiện Nút Xử lý Sự cố Thẻ trên Dashboard DataEntry: Ẩn nút đối với Lượt khách Đã Checkout không có Thẻ",
      "platform": "Phân hệ Sổ sách DataEntry",
      "precondition": "Dashboard DataEntry có các lượt khách với các trạng thái khác nhau: Khách đang bên trong có thẻ, Khách đã check-out không dùng thẻ, và Khách đã check-out nhưng có thẻ báo mất.",
      "testData": "Đối chiếu các dòng lượt khách trên bảng danh sách DataEntry.",
      "steps": [
        "1. Tìm lượt khách A: Trạng thái Đã ra về (isCheckedOut = true), không được cấp thẻ an ninh (CardType = 'none' hoặc không có sự cố thẻ tồn đọng).",
        "2. Quan sát cột Thao tác (Hành động) của dòng lượt khách A: Kiểm tra xem nút \"Xử lý sự cố thẻ\" (icon CreditCard / AlertTriangle) có hiển thị hay không.",
        "3. Tìm lượt khách B: Đang ở bên trong (!isCheckedOut) và có cấp thẻ an ninh.",
        "4. Tìm lượt khách C: Đã ra về nhưng có sự cố thẻ tồn đọng (hasActiveIncident = true: có thẻ báo mất chưa tìm thấy hoặc thiếu cấp bù)."
      ],
      "expected": [
        "Dòng lượt khách A: Nút \"Xử lý sự cố thẻ\" được ẨN HOÀN TOÀN, không gây hiểu lầm hoặc thao tác thừa cho nhân viên nhập liệu.",
        "Dòng lượt khách B: Nút \"Xử lý sự cố thẻ\" hiển thị bình thường với màu vàng hổ phách (amber-50).",
        "Dòng lượt khách C: Nút hiển thị màu đỏ nhấp nháy (rose-50, animate-pulse) kèm số thẻ chưa thu hồi trên badge góc để cảnh báo cán bộ xử lý."
      ]
    }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = _global.SMARTVMS_DEFAULT_CATALOG;
