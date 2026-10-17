# SmartVMS Test Manager v3.4
> Nền tảng Quản lý & Thực thi Kiểm thử Trực tuyến & Cục bộ chuyên nghiệp cho Hệ thống SmartVMS Local 2026

## 🌟 Tính Năng Nổi Bật
- **214 Test Cases Chuẩn Hóa**: Khớp 100% từng nút bấm, màn hình và quy trình thực tế mới nhất của SmartVMS Local 2026 (12 Modules từ M01 đến M12), bao phủ trọn vẹn toàn bộ các kịch bản bình thường và ngoại lệ.
- **Phản Ánh Nghiệp Vụ Mới Nhất**:
  - Giao diện Trực ban mới: Live Search đa đối tượng (5 nhóm, đếm kết quả, Ctrl+K), Tra cứu nâng cao độc lập (`AdvancedSearchModal`, Ctrl+Shift+K), Chế độ xem thống kê (Ẩn/Tinh gọn/Chi tiết), Chế độ bảng (Thu gọn/Chi tiết), Cài đặt màu hàng (`DisplaySettingsModal`).
  - Phân hệ Sổ sách Ngoại lệ (`DataEntry` - `/dataentry.html`): Nhập hồi tố từ sổ giấy, phím tắt F1/F3, tự động đóng dấu kiểm toán IP/địa điểm/người nhập.
  - Quản trị Admin Hubs: Monitoring (`HistoryTab`, `ShiftsTab`, `AuditEntryTab`), Directory (`StaffManagement`, `AccountsTab`), Settings (`SettingsOperationPanel`, `BackupTab`), Reports (`ReportsTab` với ExcelJS, PDF tiếng Việt có dấu, `LostCardsReportModal`).
  - **Quy trình Xử lý Thẻ mất & Thu hồi Thẻ mất Toàn diện**:
    + Chặn cấp phát lại thẻ đang báo mất khi Check-In cổng (`TC-CKIN-016`).
    + Check-Out báo mất thẻ an ninh định danh và thẻ thường đoàn vô danh (`TC-COUT-008`, `TC-COUT-017`, `TC-COUT-018`).
    + Tra cứu và thu hồi thẻ định danh qua mã số thẻ (`TC-COUT-010` - Tab 1).
    + Thu hồi thẻ thường đoàn qua danh sách đoàn báo mất (`TC-COUT-011` - Tab 2, khắc phục triệt để lỗi 404).
    + Báo mất thẻ và thu hồi thẻ giữa chừng trực tiếp trong Sổ theo dõi & Đối soát thẻ (`TC-VDET-015`, `TC-VDET-016`).
    + Nhập liệu sổ sách ngoại lệ ghi nhận thẻ mất sinh transaction toàn vẹn (`TC-DENT-008`).
    + Báo cáo chuyên đề thẻ mất & thất lạc toàn diện (`TC-REPT-004`).
  - Dòng thời gian Timeline (`VisitDetailsModal`): Xem chuỗi sự kiện CHECK_IN, ADD, CHECK_OUT, RECOVER_CARD, các cửa sổ con chi tiết quân số, thẻ, phương tiện.
- **Hỗ trợ Hiệu đính Trực tiếp (Override & Reset)**: Cho phép tester chỉnh sửa nội dung bất kỳ test case nào ngay trên giao diện Web, có nút khôi phục nguyên bản gốc.
- **Lưu trữ Cục bộ & Supabase Realtime Cloud Sync**: Hoạt động 100% ngoại tuyến (Offline) bằng LocalStorage, đồng thời hỗ trợ đồng bộ đám mây PostgreSQL thời gian thực khi kết nối Internet.
- **Báo cáo chuyên nghiệp**: Xuất báo cáo HTML độc lập, xuất dữ liệu JSON, in trực tiếp.
- **Giao diện hiện đại**: Hỗ trợ Dark Mode & Light Mode, đồ thị tiến độ Chart.js theo Module & Priority.

## 🚀 Danh Mục 12 Modules Chuẩn Hóa
1. **M01**: Xác thực, Phân quyền & Quản lý Ca trực (Auth & Shift)
2. **M02**: Check-in Khách Đơn & Cấp phát Thẻ (Single Visitor)
3. **M03**: Khách Đoàn, Người đi cùng & Lưu trú Qua đêm (Group & Accompanying)
4. **M04**: Check-out, Quản lý Phương tiện & Thu hồi Thẻ mất (Checkout, Vehicles & Lost Cards)
5. **M05**: Giao diện Trực ban Cải tiến & Tra cứu Nâng cao (Station Dashboard & Live Search)
6. **M06**: Chi tiết Lượt khách & Dòng thời gian Timeline (Visit Details & Timeline Master)
7. **M07**: Phân hệ Sổ sách Ngoại lệ - DataEntry (DataEntry Subsystem)
8. **M08**: Quản trị Admin & Giám sát Vận hành (Admin UI, Monitoring & Accounts)
9. **M09**: Trung tâm Báo cáo, Thống kê & Báo cáo Thẻ mất (Reports Hub & Analytics)
10. **M10**: Cấu hình Hệ thống, Trạm gác & Sao lưu CSDL (Settings & Backup)
11. **M11**: Thiết bị Ngoại vi, DeviceService & Tương tác Cổng (Peripherals & Barrier)
12. **M12**: Dịch vụ Ngầm, Tính toàn vẹn, Bản quyền & Chịu lỗi (Background Services & NFR)

## 🌐 Hướng Dẫn Truy Cập Hệ Thống Trên Môi Trường Mạng

### 1. Truy cập Online Internet (Vercel HTTPS - Khuyên Dùng)
- **Địa chỉ truy cập**: 👉 **`https://smartvms-test-manager.vercel.app`**
- **Đặc điểm**:
  - Truy cập được từ bất kỳ thiết bị nào (Laptop, Máy tính để bàn, Điện thoại di động, iPad) ở bất cứ đâu có Internet.
  - Sử dụng kết nối bảo mật HTTPS miễn phí và ổn định 100%.
  - Tự động đồng bộ kết quả kiểm thử tức thì giữa các thành viên qua **Supabase Cloud (PostgreSQL Singapore)** theo thời gian thực (Realtime WebSocket).

### 2. Truy cập Mạng Nội Bộ (LAN Intranet Server)
- **Khởi động**: Nhấp đúp vào file **`Start-LAN-Server.bat`** trên máy tính chủ.
- **Địa chỉ truy cập trong mạng cơ quan**:
  - Trên máy chủ: `http://localhost:8080`
  - Trên các máy trạm / điện thoại cùng mạng WiFi/LAN: 👉 **`http://192.168.1.58:8080`** (hoặc địa chỉ IP máy chủ hiển thị trên màn hình console).

### 3. Khởi động nhanh từ máy tính cá nhân
- Nhấp đúp vào **`Open-TestManager.bat`** để chọn 1 trong 3 chế độ (Online Internet, LAN Server hoặc Cục bộ).

---

## 🔑 Tài Khoản Sử Dụng Mặc Định
- **QA Lead / Quản trị viên (Admin)**: `admin` / `123`
- **Kiểm thử viên (Tester 1)**: `tester` / `123`
- **Kiểm thử viên (Tester 2)**: `tester2` / `123`
- **Kỹ sư lập trình (Developer)**: `dev` / `123`

---

## ⚡ Cơ Chế Lưu Trữ Đám Mây Tập Trung (Cloud-First & Offline-First)
- **Giải quyết triệt để vấn đề chỉ lưu trên trình duyệt của 1 máy**:
  - Trước đây, kết quả kiểm thử chỉ lưu trong `localStorage` của trình duyệt đang mở.
  - Hiện tại, hệ thống đã tích hợp **Supabase Cloud Realtime**:
    + Mỗi khi tester bấm "Pass", "Fail", "Skip" hay cập nhật Defect, dữ liệu lập tức được đẩy lên CSDL Cloud tập trung.
    + Khi người quản trị hay các tester khác mở hệ thống (dù ở máy tính hay điện thoại khác), toàn bộ kết quả kiểm thử, tỷ lệ đạt/lỗi KPI và bằng chứng ảnh đều được nạp đầy đủ và đồng bộ thời gian thực.
    + Cơ chế **Offline-First**: Nếu mất kết nối mạng, kết quả vẫn lưu an toàn trên trình duyệt và tự động đồng bộ bù (flush queue) ngay khi có mạng trở lại.

