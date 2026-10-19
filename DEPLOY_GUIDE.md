# 🚀 HƯỚNG DẪN TRIỂN KHAI SMARTVMS TEST MANAGER LÊN ONLINE
## Kết hợp GitHub + Vercel + Supabase (Realtime Database)

Tài liệu này hướng dẫn chi tiết từng bước để đưa hệ thống **SmartVMS Test Manager** lên môi trường Internet, cho phép:
- **Tất cả thành viên trong nhóm** (Sếp, QA, Tester trạm gác) truy cập test online bất cứ lúc nào qua tên miền bảo mật HTTPS (miễn phí 100%).
- **Dữ liệu kiểm thử đồng bộ tức thì theo thời gian thực (Realtime)**: Một tester bấm Pass/Fail ở máy trạm, Dashboard của người quản lý tự động nhảy số theo giây mà không cần F5.

---

### BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU CLOUD TRÊN SUPABASE (30 giây)

1. Truy cập [https://supabase.com](https://supabase.com) và bấm **Start your project** (Đăng nhập bằng tài khoản GitHub hoặc Google).
2. Bấm **New Project**:
   - **Name**: `smartvms-test-manager`
   - **Database Password**: Đặt mật khẩu an toàn và lưu lại.
   - **Region**: Chọn `Singapore` (để tốc độ tải từ Việt Nam nhanh nhất).
   - Bấm **Create new project** (chờ khoảng 1-2 phút để Supabase tạo database).
3. Sau khi tạo xong, tại thanh menu bên trái, chọn **SQL Editor** (biểu tượng `>_`):
   - Mở file `supabase_schema.sql` trong thư mục này.
   - Copy toàn bộ nội dung file và dán vào ô SQL Editor.
   - Bấm nút **Run** (màu xanh lá).
   - Kết quả hiển thị: *`Database Schema SmartVMS Test Manager đã khởi tạo thành công!`*.
4. Lấy thông tin kết nối API:
   - Vào menu bên trái: **Project Settings** (biểu tượng bánh răng) > **API**.
   - Copy 2 thông tin sau:
     - **Project URL**: Ví dụ `https://xyzabcdefghijklm.supabase.co`
     - **Project API Keys (anon public)**: Một chuỗi dài bắt đầu bằng `eyJhbGciOi...`

---

### BƯỚC 2: TẠO REPOSITORY VÀ ĐẨY CODE LÊN GITHUB

1. Truy cập [https://github.com/new](https://github.com/new) để tạo repository mới:
   - **Repository name**: `smartvms-test-manager`
   - **Visibility**: Chọn **Public** hoặc **Private** tùy nhu cầu.
   - Không cần tích chọn *"Add a README"* (vì chúng ta đã có sẵn).
   - Bấm **Create repository**.

2. Mở Terminal / PowerShell tại thư mục `SmartVMS_TestManager` trên máy tính và chạy các lệnh sau (thay `YOUR_GITHUB_USERNAME` bằng tài khoản GitHub của bạn):

```bash
git init
git add .
git commit -m "feat: initial commit SmartVMS Test Manager with Supabase Realtime"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/smartvms-test-manager.git
git push -u origin main
```

---

### BƯỚC 3: DEPLOY FRONTEND MIỄN PHÍ LÊN VERCEL (1 click)

1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản **GitHub**.
2. Trên màn hình Dashboard của Vercel, bấm nút **Add New...** > chọn **Project**.
3. Tại danh sách repository GitHub, tìm `smartvms-test-manager` và bấm **Import**.
4. Cấu hình Project:
   - **Project Name**: `smartvms-test-manager` (hoặc để mặc định).
   - **Framework Preset**: Chọn `Other`.
   - **Root Directory**: `./` (để mặc định).
   - Bấm nút **Deploy** (màu xanh).
5. Sau khoảng 20 giây, Vercel sẽ thông báo **Congratulations!** kèm theo link website chính thức, ví dụ:
   👉 **`https://smartvms-test-manager.vercel.app`**

---

### BƯỚC 4: KẾT NỐI ONLINE & BẮT ĐẦU TEST THỜI GIAN THỰC

1. Mở đường link Vercel vừa tạo trên trình duyệt (hoặc trên điện thoại/máy tính bảng).
2. Đăng nhập với tài khoản:
   - **Tài khoản**: `admin`
   - **Mật khẩu**: `123` (hoặc `admin123`)
3. Vào tab **Cài đặt** (Settings), kéo xuống mục **⚡ Kết nối Supabase Cloud**:
   - Dán **Project URL** và **Anon Key** đã lấy ở Bước 1.
   - Tích chọn *"Tự động đồng bộ lên Cloud khi Test & Lắng nghe Realtime"*.
   - Bấm nút **💾 Lưu & Kết nối Supabase**.
4. Quan sát góc trên cùng bên phải Header:
   - Đèn báo chuyển sang **`🟢 Cloud: Realtime`** -> Hệ thống đã kết nối trực tiếp với đám mây!
5. Bấm nút **"🔄 Đẩy lên Cloud (Push)"** lần đầu tiên để đẩy toàn bộ 167 Test Cases và các kết quả test hiện có lên database.

---

### TÍNH NĂNG VƯỢT TRỘI TRÊN PHIÊN BẢN v3.0:
- 🏃 **Quản lý Đợt Test Độc lập (Test Cycles)**: Tạo Đợt 1 (174 TC toàn diện), Đợt 2 (Smart Retest — chỉ kiểm tra 50 ca lỗi, tự động kế thừa các ca đã Pass), Đợt 3 (Nghiệm thu).
- 📸 **Đính kèm Ảnh Bằng chứng siêu tốc**: Chụp màn hình rồi bấm **`Ctrl + V`** để dán ảnh trực tiếp, hoặc kéo thả file ảnh; có Lightbox phóng to và xoay ảnh 90°.
- 💬 **Thảo luận & Phản hồi 2 chiều (Discussion Feed)**: Trao đổi thời gian thực giữa Tester, Dev và QA Lead ngay trên từng test case (hỗ trợ ghi chú commit fix lỗi).
- 🐞 **Vòng đời Lỗi Chuẩn hóa (Defect Lifecycle)**: Đúng chuẩn *Test -> Lỗi -> Gán Dev -> Dev báo Đã sửa -> Tester Retest Pass (Đóng lỗi) / Reopen*.
- ⚡ **Realtime Multi-tester**: Tester A chấm Pass/Fail ở trạm gác, màn hình của Quản lý và Dev ở phòng họp tự nhảy kết quả tức thì không cần F5.
- 📱 **Responsive mọi thiết bị**: Sử dụng mượt mà trên iPhone, Android, iPad, Laptop.
- 🛡️ **Offline-First**: Nếu mạng WiFi bị chập chờn, kết quả vẫn lưu an toàn trên máy, khi có mạng lại tự động đồng bộ lên Supabase Cloud.
- 🔄 **Tự động cập nhật**: Mỗi khi bạn sửa code và push lên GitHub, Vercel sẽ tự động build và cập nhật bản mới nhất sau 10 giây.
