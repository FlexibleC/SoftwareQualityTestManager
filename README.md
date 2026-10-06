# SmartVMS Test Manager v3.0
> Nền tảng Quản lý & Thực thi Kiểm thử Trực tuyến & Cục bộ chuyên nghiệp cho Hệ thống SmartVMS Local 2026

## 🌟 Tính Năng Nổi Bật
- **161 Test Cases Chuẩn Hóa**: Khớp 100% từng nút bấm, màn hình và quy trình thực tế mới nhất của SmartVMS Local 2026 (12 Modules từ M01 đến M12).
- **Phản Ánh Nghiệp Vụ Mới Nhất**:
  - Giao diện Trực ban mới: Live Search đa đối tượng (5 nhóm, đếm kết quả, Ctrl+K), Tra cứu nâng cao độc lập (`AdvancedSearchModal`, Ctrl+Shift+K), Chế độ xem thống kê (Ẩn/Tinh gọn/Chi tiết), Chế độ bảng (Thu gọn/Chi tiết), Cài đặt màu hàng (`DisplaySettingsModal`).
  - Phân hệ Sổ sách Ngoại lệ (`DataEntry` - `/dataentry.html`): Nhập hồi tố từ sổ giấy, phím tắt F1/F3, tự động đóng dấu kiểm toán IP/địa điểm/người nhập.
  - Quản trị Admin Hubs: Monitoring (`HistoryTab`, `ShiftsTab`, `AuditEntryTab`), Directory (`StaffManagement`, `AccountsTab`), Settings (`SettingsOperationPanel`, `BackupTab`), Reports (`ReportsTab` với ExcelJS, PDF tiếng Việt có dấu, `LostCardsReportModal`).
  - Quy trình Xử lý Thẻ mất & Thu hồi Thẻ mất (`RecoverLostCardModal`): Tra cứu và thu hồi thẻ mất vào kho an ninh.
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

## 🛠️ Hướng Dẫn Sử Dụng Nhanh
- **Khởi động cục bộ tức thì**: Nhấp đúp vào file `Open-TestManager.bat` tại thư mục dự án để mở ngay trên trình duyệt Chrome/Edge.
- **Tài khoản đăng nhập demo**:
  - Quản trị viên: `admin` / `123` (hoặc `admin123`)
  - Tester thực thi: `tester` / `123`
