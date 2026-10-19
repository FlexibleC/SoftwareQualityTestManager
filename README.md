# Hệ Thống Kiểm Thử & Quản Lý Chất Lượng Phần Mềm
> **Software Quality & Test Management System (SQTM) — Phiên Bản 3.0**  
> Nền tảng Doanh nghiệp Độc lập Quản lý Chất lượng & Điều hành Kiểm thử Đa Dự Án (Multi-Project Enterprise QA Platform)

---

## 🌟 Tuyên Ngôn & Điểm Khác Biệt Cốt Lõi

1. **Độc Lập Tuyệt Đối Đa Dự Án (Multi-Project Sandbox Isolation):**
   - Hệ thống không gắn cứng với bất kỳ sản phẩm phần mềm đơn lẻ nào. Mỗi dự án (ERP, CRM, VMS, Mobile App, Web App, IoT...) là một không gian độc lập khép kín có phiên bản phần mềm, kịch bản kiểm thử, chu kỳ test và đội ngũ nhân sự riêng biệt.
2. **Nguyên Tắc "No Testcases in Code" & Kiến Trúc Database-First:**
   - Tuyệt đối không hardcode kịch bản kiểm thử vào mã nguồn.
   - Toàn bộ dữ liệu được quản lý động từ Cơ sở dữ liệu Cloud tập trung (Supabase PostgreSQL) hoặc nạp qua tệp bảng tính Excel chuẩn hóa (`.xlsx`).
3. **Phân Định Tuyệt Đối 2 Không Gian Quản Trị:**
   - **`admin/` — Cổng Quản Trị Cấp Cao Hệ Thống (Global Enterprise Console):** Dành cho Super Admin điều hành danh mục dự án, hồ bơi nhân sự toàn hệ thống, ma trận phân bổ kỹ sư, cấu hình Supabase Cloud và sao lưu/phục hồi toàn CSDL.
   - **`lead/` — Không Gian Quản Trị Viên Dự Án (Project Lead Workspace):** Dành cho Quản trị viên dự án điều hành chuyên sâu: Kịch bản kiểm thử, Chu kỳ test (Cycles), Giao việc phân công cho Tester dự án, Báo cáo tiến độ & Ký nghiệm thu chuẩn ISO.
4. **Hồ Bơi Nhân Sự Dùng Chung & Ma Trận Điều Phối (Staffing Matrix):**
   - Nhân sự kỹ thuật (Lead, Tester, Dev) là tài nguyên dùng chung toàn hệ sinh thái do Super Admin điều phối vào từng dự án cụ thể.
5. **Chuẩn Mực Quốc Tế Áp Dụng:**
   - Tuân thủ quy trình kiểm thử và tài liệu theo **ISO/IEC/IEEE 29119-3:2021**.
   - Thẩm định 8 đặc tính đo lường chất lượng phần mềm theo **ISO/IEC 25010:2023** (Tính phù hợp chức năng, Hiệu năng, Độ tin cậy, Bảo mật, Tính khả dụng...).
6. **Vận Hành Đa Nền Tảng:**
   - Chạy trực tuyến trên Cloud Realtime (Vercel + Supabase).
   - Chạy mạng nội bộ cơ quan (LAN Web Server tích hợp qua `server.js`).
   - Chạy cục bộ không cần cài đặt phần mềm phụ trợ.

---

## 📂 Bản Đồ Cấu Trúc Mã Nguồn

```text
SoftwareQualityTestManager/
├── index.html                       # Cổng Xác Thực & Đăng Nhập Tập Trung (4 Cấp Vai Trò)
├── server.js                        # Máy chủ Web Server chạy mạng LAN / Intranet (Node.js)
├── Open-TestManager.bat             # Kịch bản khởi chạy ứng dụng nhanh
├── Start-LAN-Server.bat             # Kịch bản khởi chạy máy chủ LAN cổng 8080
├── package.json                     # Thông tin gói & script npm
├── vercel.json                      # Cấu hình triển khai Cloud Vercel
├── supabase_schema.sql              # Cấu trúc CSDL PostgreSQL Supabase Realtime
├── NHAT_KY_YEU_CAU_HE_THONG_KIEM_THU.md # Nhật ký yêu cầu & thiết kế kiến trúc chuẩn mực
│
├── admin/                           # Không gian Cổng Quản Trị Cấp Cao Hệ Thống (Super Admin)
│   ├── index.html                   # Trung tâm điều hành: Danh mục dự án, Hồ bơi nhân sự, Ma trận phân bổ
│   ├── settings.html                # Cài đặt nền tảng: Cloud Supabase & Sao lưu CSDL hệ thống
│   ├── css/admin-console.css        # Giao diện Super Admin (Tone Xanh Navy 🛡️)
│   └── js/                          # Modular JS: admin-portfolio.js, admin-personnel.js, admin-staffing.js
│
├── lead/                            # Không gian Quản Trị Viên Dự Án (Project Lead Workspace)
│   ├── index.html                   # Dashboard dự án: Hero banner, KPI, Đợt test, Roster dự án
│   ├── testcases.html               # Thư viện kịch bản kiểm thử độc lập (Import/Export Excel)
│   ├── assignments.html             # Điều phối & Giao việc cho Tester dự án (2 Tab Dispatch)
│   ├── reports.html                 # Báo cáo chất lượng, phân tích lỗi, biểu đồ & biên bản nghiệm thu
│   ├── settings.html                # Cài đặt nội bộ dự án: Phiên bản, Đợt test (Cycles), Modules
│   ├── css/lead-theme.css           # Giao diện Project Lead (Tone Vàng Hổ Phách 👑)
│   └── js/                          # Modular JS: lead-context.js, lead-dashboard.js, lead-settings.js
│
├── tester/                          # Không gian Làm việc của Kiểm Thử Viên (Tester Workbench)
├── dev/                             # Không gian Xử lý Lỗi của Lập Trình Viên (Developer Defect Tracker)
├── shared/                          # Thư mục mã nguồn dùng chung (base.css, core.js, cloud-sync.js, vendor)
└── data/                            # Mẫu tệp Excel và tệp cấu hình khởi tạo ban đầu
```

---

## 🌐 Hướng Dẫn Vận Hành Hệ Thống

### 1. Truy cập Trực tuyến Đám Mây (Cloud Realtime)
- **Địa chỉ:** 👉 **`https://smartvms-test-manager.vercel.app`**
- Hỗ trợ mọi thiết bị (PC, Laptop, Tablet, Mobile) có kết nối Internet với mã hóa bảo mật SSL/HTTPS.

### 2. Vận hành Mạng Nội Bộ (LAN Intranet Server)
- Nhấp đúp vào **`Start-LAN-Server.bat`** trên máy chủ nội bộ.
- Trình duyệt tự động mở `http://localhost:8080`.
- Các máy trạm khác trong mạng cơ quan truy cập qua địa chỉ IP máy chủ (VD: `http://192.168.1.58:8080`).

### 3. Vận hành Cục bộ Trực tiếp
- Nhấp đúp vào **`Open-TestManager.bat`** để chọn môi trường truy cập mong muốn.

---

## 🔑 Tài Khoản Đăng Nhập Mặc Định

| Vai Trò Phân Quyền | Tài Khoản | Mật Khẩu | Không Gian Làm Việc |
| :--- | :---: | :---: | :--- |
| **🛡️ Quản trị viên Cấp cao (Super Admin)** | `admin` | `123` | Cổng Quản Trị Hệ Thống (`admin/index.html`) |
| **👑 Quản trị viên Dự án (Project Lead)** | `lead` | `123` | Không Gian Quản Trị Dự Án (`lead/index.html`) |
| **🧪 Kiểm thử viên (Tester)** | `tester` | `123` | Bàn Làm Việc Kiểm Thử (`tester/index.html`) |
| **💻 Lập trình viên (Developer)** | `dev` | `123` | Bảng Theo Dõi Khắc Phục Lỗi (`dev/index.html`) |

---

*Xem chi tiết toàn bộ lịch sử yêu cầu và nguyên tắc chỉ đạo tại tệp [NHAT_KY_YEU_CAU_HE_THONG_KIEM_THU.md](NHAT_KY_YEU_CAU_HE_THONG_KIEM_THU.md).*
