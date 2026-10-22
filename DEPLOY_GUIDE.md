# 🚀 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG (SQTM)
## Kết hợp GitHub + Vercel Cloud + Supabase PostgreSQL Realtime

Tài liệu này hướng dẫn chi tiết từng bước để đưa hệ thống **Kiểm Thử & Quản Lý Chất Lượng Phần Mềm (Software Quality & Test Management System — SQTM v3.0)** lên môi trường Internet, cho phép:
- **Tất cả các bộ phận** (Super Admin, Project Lead, QA/Tester, Developer) truy cập làm việc online bất cứ lúc nào qua giao thức HTTPS bảo mật.
- **Dữ liệu kiểm thử đồng bộ thời gian thực (Realtime)**: Tester ghi nhận kết quả tại hiện trường, Dashboard của Lead và Admin tự động cập nhật ngay lập tức mà không cần tải lại trang.
- **Hỗ trợ đa dự án độc lập**: Tạo mới, cấu hình kịch bản và phân bổ nhân sự cho nhiều dự án song song.

---

### BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU CLOUD TRÊN SUPABASE (1 phút)

1. Truy cập [https://supabase.com](https://supabase.com) và bấm **Start your project** (Đăng nhập bằng tài khoản GitHub hoặc Google).
2. Bấm **New Project**:
   - **Name**: `software-quality-test-manager` (hoặc tên tùy chọn)
   - **Database Password**: Đặt mật khẩu an toàn và lưu lại.
   - **Region**: Chọn `Singapore` (để tốc độ tải từ Việt Nam đạt tối ưu).
   - Bấm **Create new project** (chờ khoảng 1-2 phút để Supabase tạo database).
3. Sau khi tạo xong, tại thanh menu bên trái, chọn **SQL Editor** (biểu tượng `>_`):
   - Mở tệp `supabase_schema.sql` trong thư mục dự án.
   - Copy toàn bộ nội dung tệp và dán vào ô SQL Editor.
   - Bấm nút **Run** (màu xanh lá).
   - Kết quả hiển thị: *`Database Schema SQTM v3.0 (Multi-Project Enterprise) đã khởi tạo thành công!`*.
4. Lấy thông tin kết nối API:
   - Vào menu bên trái: **Project Settings** (biểu tượng bánh răng) > **API**.
   - Copy 2 thông tin sau:
     - **Project URL**: Ví dụ `https://xyzabcdefghijklm.supabase.co`
     - **Project API Keys (anon public)**: Một chuỗi dài bắt đầu bằng `eyJhbGciOi...`
5. Dán 2 thông tin này vào trang **Cài Đặt Hệ Thống & CSDL Đám Mây** (`admin/settings.html`) trên giao diện Super Admin để kết nối.

---

### BƯỚC 2: TẠO REPOSITORY VÀ ĐẨY MÃ NGUỒN LÊN GITHUB

1. Truy cập [https://github.com/new](https://github.com/new) để tạo repository mới:
   - **Repository name**: `software-quality-test-manager`
   - **Visibility**: Chọn **Private** hoặc **Public** tùy nhu cầu doanh nghiệp.
   - Không cần tích chọn *"Add a README"* (vì dự án đã có sẵn).
   - Bấm **Create repository**.

2. Mở Terminal / PowerShell tại thư mục `SoftwareQualityTestManager` trên máy tính và chạy các lệnh sau (thay `YOUR_GITHUB_USERNAME` bằng tài khoản GitHub của bạn):

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/software-quality-test-manager.git
git branch -M main
git push -u origin main
```

---

### BƯỚC 3: TRIỂN KHAI FRONTEND MIỄN PHÍ LÊN VERCEL (1 click)

1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản **GitHub**.
2. Trên màn hình Dashboard của Vercel, bấm nút **Add New...** > chọn **Project**.
3. Tại danh sách repository GitHub, tìm `software-quality-test-manager` và bấm **Import**.
4. Cấu hình Project:
   - **Project Name**: `SoftwareQualityTestManager` (hoặc `software-quality-test-manager`)
   - **Framework Preset**: Chọn `Other`.
   - **Root Directory**: `./` (để mặc định).
5. Bấm nút **Deploy**.
6. Chờ khoảng 20-30 giây, Vercel sẽ cấp một tên miền HTTPS chính thức (ví dụ: `https://softwarequalitytestmanager.vercel.app`).

---

### BƯỚC 4: VẬN HÀNH TRÊN MẠNG NỘI BỘ (LAN / INTRANET)

Nếu cần vận hành trong mạng cơ quan không có kết nối Internet hoặc cần bảo mật tuyệt đối:
1. Nhấp đúp vào tệp **`Start-LAN-Server.bat`**.
2. Máy chủ Node.js sẽ tự động khởi động trên cổng `8080` và in danh sách địa chỉ IP mạng nội bộ.
3. Các máy trạm khác chỉ cần mở trình duyệt và truy cập: `http://<IP-MÁY-CHỦ>:8080`.
4. Mọi dữ liệu dự án tạo mới sẽ tự động lưu bền vững vào tệp `data/projects_state.json` trên ổ cứng máy chủ.
