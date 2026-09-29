# SmartVMS Test Manager v2.0
> Nền tảng Quản lý & Thực thi Kiểm thử Trực tuyến chuyên nghiệp cho Hệ thống SmartVMS Local v2.0

## 🌟 Tính Năng Nổi Bật
- **167 Test Cases Chuẩn Hóa**: Khớp 100% từng nút bấm, màn hình và quy trình của SmartVMS Local v2.0 (10 Modules từ M01 đến M10).
- **Hỗ trợ Hiệu đính Trực tiếp (Override & Reset)**: Cho phép tester chỉnh sửa nội dung bất kỳ test case nào ngay trên giao diện Web, có nút khôi phục nguyên bản gốc.
- **Supabase Realtime Cloud Sync**: Lưu trữ kết quả test tập trung trên đám mây PostgreSQL, tự động đồng bộ thời gian thực giữa nhiều tester.
- **Vercel & GitHub CI/CD**: Deploy online nhanh chóng, chạy 24/7 với domain HTTPS miễn phí.
- **Báo cáo chuyên nghiệp**: Xuất báo cáo HTML độc lập, xuất dữ liệu JSON, in trực tiếp.
- **Giao diện hiện đại**: Hỗ trợ Dark Mode & Light Mode, đồ thị tiến độ Chart.js.

## 🚀 Hướng Dẫn Triển Khai
Xem chi tiết các bước triển khai kết hợp GitHub + Vercel + Supabase tại [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md).

## 🛠️ Cấu Trúc Thư Mục
```
SmartVMS_TestManager/
├── index.html            # Giao diện chính Single Page Application
├── app.js                # Toàn bộ logic ứng dụng & Supabase Realtime client
├── style.css             # Hệ thống thiết kế CSS (Light & Dark Theme)
├── supabase_schema.sql   # Script SQL tạo Database & RLS & Realtime trên Supabase
├── vercel.json           # Cấu hình routing & security headers cho Vercel
├── package.json          # Metadata dự án
├── .gitignore            # Danh sách loại trừ file rác
└── DEPLOY_GUIDE.md       # Hướng dẫn chi tiết triển khai lên Online
```
