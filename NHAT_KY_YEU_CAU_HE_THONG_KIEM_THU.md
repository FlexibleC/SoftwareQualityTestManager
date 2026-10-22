# NHẬT KÝ YÊU CẦU & THIẾT KẾ KIẾN TRÚC
## HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM
### (Software Quality & Test Management System — SQTM)

> **Trạng thái tài liệu:** Tài liệu chính thức ghi nhận nhật ký yêu cầu, nguyên tắc chỉ đạo và thiết kế kiến trúc hệ thống  
> **Phiên bản:** 3.0.0 (Tách thành dự án độc lập đa dự án)  
> **Ngày cập nhật:** 19/10/2026  
> **Đối tượng áp dụng:** Ban Quản Trị Hệ Thống (Super Admin), Quản Trị Viên Dự Án (Project Lead), Đội ngũ Kiểm thử (QA/Tester), Kỹ sư Lập trình (Developer)

---

## MỤC LỤC
1. [Tuyên Ngôn Định Vị & Tính Độc Lập Của Hệ Thống](#1-tuyên-ngôn-định-vị--tính-độc-lập-của-hệ-thống)
2. [Nhật Ký Các Quan Điểm Chỉ Đạo & Yêu Cầu Cốt Lõi Của Người Dùng](#2-nhật-ký-các-quan-điểm-chỉ-đạo--yêu-cầu-cốt-lõi-của-người-dùng)
   - [2.1. Chuẩn hóa Tên gọi & Bộ Nhận diện Thương hiệu](#21-chuẩn-hóa-tên-gọi--bộ-nhận-diện-thương-hiệu)
   - [2.2. Nguyên tắc "No Testcases in Code" & Kiến trúc Database-First](#22-nguyên-tắc-no-testcases-in-code--kiến-trúc-database-first)
   - [2.3. Cổng Đăng Nhập Trực Quan, Chuẩn Doanh Nghiệp (4 Cấp Vai Trò)](#23-cổng-đăng-nhập-trực-quan-chuẩn-doanh-nghiệp-4-cấp-vai-trò)
   - [2.4. Kiến Trúc Không Gian Đa Dự Án Độc Lập Khép Kín (Multi-Project Isolation)](#24-kiến-trúc-không-gian-đa-dự-án-độc-lập-khép-kín-multi-project-isolation)
   - [2.5. Hồ Bơi Nhân Sự Toàn Hệ Thống & Ma Trận Phân Bổ (Staffing Matrix)](#25-hồ-bơi-nhân-sự-toàn-hệ-thống--ma-trận-phân-bổ-staffing-matrix)
   - [2.6. Tách Biệt Tuyệt Đối Giữa Admin Hệ Thống và Quản Trị Dự Án](#26-tách-biệt-tuyệt-đối-giữa-admin-hệ-thống-và-quản-trị-dự-án)
   - [2.7. Độc Lập Mã Nguồn Từng Tài Khoản & Triệt Để Module Hóa](#27-độc-lập-mã-nguồn-từng-tài-khoản--triệt-để-module-hóa)
   - [2.8. Tách Thành Dự Án Phần Mềm Độc Lập Hoàn Toàn](#28-tách-thành-dự-án-phần-mềm-độc-lập-hoàn-toàn)
3. [Bản Đồ Kiến Trúc & Cấu Trúc Thư Mục Dự Án Độc Lập](#3-bản-đồ-kiến-trúc--cấu-trúc-thư-mục-dự-án-độc-lập)
4. [Ma Trận Phân Quyền Vai Trò Người Dùng (RBAC Matrix)](#4-ma-trận-phân-quyền-vai-trò-người-dùng-rbac-matrix)
5. [Quy Chuẩn Tiêu Chuẩn Quốc Tế Áp Dụng (ISO Standards)](#5-quy-chuẩn-tiêu-chuẩn-quốc-tế-áp-dụng-iso-standards)
6. [Kế Hoạch Phát Triển & Các Nội Dung Trao Đổi Tiếp Theo (Roadmap)](#6-kế-hoạch-phát-triển--các-nội-dung-trao-đổi-tiếp-theo-roadmap)

---

## 1. TUYÊN NGÔN ĐỊNH VỊ & TÍNH ĐỘC LẬP CỦA HỆ THỐNG

- **Tên chính thức:** **Hệ thống Kiểm thử & Quản lý Chất lượng Phần mềm**  
- **Tên quốc tế:** *Software Quality & Test Management System (SQTM)*  
- **Định vị nghiệp vụ:** Đây là một **sản phẩm phần mềm độc lập hoàn chỉnh**, không phụ thuộc, không gán cứng vào bất kỳ ứng dụng đơn lẻ nào (như SmartVMS trước đây). Hệ thống được thiết kế dưới dạng nền tảng quản trị chất lượng phần mềm doanh nghiệp cấp cao (Enterprise QA Hub), có khả năng quản lý danh mục không giới hạn các dự án phần mềm khác nhau (ERP, CRM, VMS, Mobile App, Web App, IoT, nhúng...).
- **Giá trị cốt lõi:**
  1. *Tính độc lập tuyệt đối giữa các dự án:* Mỗi dự án là một hộp cát (Sandbox) riêng biệt về dữ liệu, kịch bản, phiên bản, chu kỳ kiểm thử và đội ngũ nhân sự.
  2. *Tính minh bạch & tuân thủ tiêu chuẩn chất lượng:* Tích hợp quy trình kiểm thử theo **ISO/IEC/IEEE 29119** và mô hình 8 đặc tính đo lường chất lượng phần mềm theo **ISO/IEC 25010**.
  3. *Tự do về hạ tầng vận hành:* Chạy mượt mà trên môi trường Web Server mạng nội bộ (LAN / Intranet), Máy trạm đơn lẻ (Offline Standalone), hoặc Đám mây thời gian thực (Supabase PostgreSQL + Vercel Cloud).

---

## 2. NHẬT KÝ CÁC QUAN ĐIỂM CHỈ ĐẠO & YÊU CẦU CỐT LÕI CỦA NGƯỜI DÙNG

Dưới đây là nhật ký ghi lại chi tiết các quan điểm, nguyên tắc chỉ đạo của Người sử dụng qua các giai đoạn xây dựng hệ thống:

### 2.1. Chuẩn hóa Tên gọi & Bộ Nhận diện Thương hiệu
> *"Tên của hệ thống là 'Hệ thống kiểm thử & Quản lý chất lượng phần mềm' chứ không phải là 'SmartVMS Test Manager' -> Đề nghị bạn sửa lại cho tôi -> theo đó cũng phải đề xuất màu sắc, nền, hoa văn,... tương ứng tương thích cho tôi"*

- **Quy định triển khai:**
  - Loại bỏ hoàn toàn thương hiệu đơn lẻ "SmartVMS Test Manager" ở tất cả tiêu đề trang, thanh tiêu đề (`title`), nhãn giao diện và tài liệu hướng dẫn.
  - Bộ nhận diện trực quan:
    - Biểu tượng Khiên An Toàn & Chất Lượng (`🛡️`) đại diện cho Cổng Quản Trị Cấp Cao Hệ Thống.
    - Biểu tượng Vương Miện Quản Trị (`👑`) đại diện cho Không Gian Điều Hành Của Quản Trị Viên Dự Án.
    - Màu sắc thương hiệu: Kết hợp dải màu Doanh nghiệp Cấp cao (Deep Navy Blue `#0f172a`, Enterprise Blue `#1d4ed8`, Warm Amber/Gold `#d97706`).
    - Nền giao diện phẳng, hoa văn tinh tế, tương thích mượt mà hai chế độ Sáng / Tối (Dark / Light Mode).

### 2.2. Nguyên tắc "No Testcases in Code" & Kiến trúc Database-First
> *"Tôi đã nói rất nhiều lần là không được phép đưa test case vào code -> các nút ấn như tải 157 test case đề nghị hủy bỏ đi cho tôi. Theo quan điểm này đề nghị bạn tiếp tục thực hiện"*

- **Quy định triển khai:**
  - **TUYỆT ĐỐI CẤM:** Không được hardcode bất kỳ testcase, số lượng testcase (như 157 TCs), hay dữ liệu kiểm thử giả lập nào vào trong mã nguồn JS/HTML.
  - Hủy bỏ toàn bộ các nút ấn sinh testcase mẫu cứng trong code.
  - **Kiến trúc Database-First:**
    - Cơ sở dữ liệu đám mây tập trung (Supabase PostgreSQL) hoặc máy chủ nội bộ là nguồn dữ liệu duy nhất và chuẩn mực.
    - Khi khởi tạo một dự án mới, dự án ở trạng thái sạch tinh (`0 kịch bản`).
    - Toàn bộ danh mục kịch bản kiểm thử phải được nạp vào hệ thống thông qua hai kênh chuẩn:
      1. Kênh nạp tệp bảng tính Excel chuẩn hóa (`.xlsx`) do người dùng biên soạn.
      2. Kênh biên soạn trực tiếp trên giao diện thông qua Form chuẩn ISO 29119.
    - Trình duyệt chỉ là client hiển thị, không lưu trữ dữ liệu dự án cố định trong `LocalStorage` để tránh lệch pha dữ liệu giữa các máy trạm khác nhau.

### 2.3. Cổng Đăng Nhập Trực Quan, Chuẩn Doanh Nghiệp (4 Cấp Vai Trò)
> *"Ảnh đính kèm là giao diện đăng nhập test manager mới nhất -> rất xấu và không chuyên nghiệp -> Đề nghị bạn phân tích lại sau đó cho tôi bản đề xuất về giao diện đăng nhập mới đơn giản, chuyên nghiệp, không bao gồm nhiều chữ rườm rà mà phải thật trực quan, trực tiếp -> Phải đúng theo giao diện đăng nhập hệ thống của các hệ thống"*
> *"Ảnh đính kèm là giao diện đăng nhập -> Tôi không thấy đăng nhập cho account quản trị dự án?"*

- **Quy định triển khai:**
  - Thiết kế thẻ đăng nhập trung tâm (Center Card) tối giản, hiện đại, không văn bản tiếp thị rườm rà.
  - Tích hợp thanh điều khiển chọn vai trò 4 cấp (Segmented Role Switcher) phân minh rõ ràng:
    1. **Admin HT (`admin`)**: Quản trị viên Cấp cao Hệ thống.
    2. **Quản trị DA (`lead`)**: Quản trị viên Dự án (Project Lead / QA Lead).
    3. **Tester (`tester`)**: Kiểm thử viên phụ trách thực thi kịch bản.
    4. **Developer (`dev`)**: Kỹ sư phần mềm tiếp nhận lỗi và khắc phục.
  - Khi người dùng nhấp chọn tab vai trò, form tự động hỗ trợ điền mẫu tương ứng và chuyển tiếp đúng router khi đăng nhập.

### 2.4. Kiến Trúc Không Gian Đa Dự Án Độc Lập Khép Kín (Multi-Project Isolation)
> *"Quan điểm của tôi về hệ thống kiểm thử và quản lý chất lượng này như sau: Mỗi dự án là một cá thể độc lập có không gian và cấu hình, vận hành riêng biệt không liên quan gì đến nhau. Toàn bộ phần cấu hình, quản trị liên quan đến dự án đó phải vào trong dự án đó để làm việc -> Có quản trị dự án, dev và tester riêng"*

- **Quy định triển khai:**
  - Mỗi dự án phần mềm (Project) được lưu trữ với ID, Mã dự án, Tên dự án, Mô tả phạm vi, Danh mục phiên bản (`versions`), Danh mục đợt kiểm thử (`testCycles`), Danh mục phân hệ (`modules`), Thư viện kịch bản (`testCases`), và Danh sách nhân sự phụ trách (`members`).
  - Toàn bộ cấu hình và vận hành nghiệp vụ của dự án nào phải được thực hiện khép kín bên trong không gian của dự án đó (qua cổng `/lead/`).
  - Dữ liệu giữa các dự án hoàn toàn độc lập: Kịch bản của Dự án A không xuất hiện ở Dự án B; Đợt test của Dự án A không ảnh hưởng đến tiến độ của Dự án B.

### 2.5. Hồ Bơi Nhân Sự Toàn Hệ Thống & Ma Trận Phân Bổ (Staffing Matrix)
> *"Nhân sự quản trị dự án, nhân sự tester và nhân sự dev là nhân sự chung của cả hệ thống, sau đó được phân bổ cho từng dự án bởi admin."*

- **Quy định triển khai:**
  - **Hồ bơi nhân sự tập trung (Global Personnel Pool):** Toàn bộ kỹ sư (Admin, Project Lead, Tester, Developer) được khai báo và quản trị tập trung tại Cổng Quản Trị Cấp Cao Hệ Thống (`admin/`).
  - **Ma trận điều phối & phân bổ (Staffing Allocation Matrix):** Super Admin thực hiện điều động kỹ sư từ hồ bơi hệ thống vào từng dự án cụ thể. Một kỹ sư có thể tham gia một hoặc nhiều dự án tùy theo năng lực và phân công.
  - **Quyền hạn của Quản trị dự án:** Quản trị viên dự án (Project Lead) chỉ có quyền giao việc và điều phối kịch bản cho các Tester đã được Admin phê duyệt phân bổ vào dự án của mình; không được tự ý thêm nhân sự ngoài danh bạ hệ thống.

### 2.6. Tách Biệt Tuyệt Đối Giữa Admin Hệ Thống và Quản Trị Dự Án
> *"Hệ thống Giao diện chung của toàn bộ hệ thống phải là giao diện được thiết kế để quản trị cấp cao các dự án, nhân sự,…. Hệ thống giao diện theo dự án thì phải được thiết kế chuyên biệt hóa cho các nghiệp vụ cụ thể của dự án"*
> *"Giao diện quản trị dự án và giao diện admin quản trị hệ thống phải là hai giao diện hoàn toàn khác nhau -> Đề nghị bạn xem lại cho tôi"*

- **Quy định triển khai:**
  - Hai giao diện này được tách thành hai không gian vật lý và thư mục hoàn toàn khác biệt:
    1. **`admin/` — Cổng Quản Trị Cấp Cao Hệ Thống (Global Enterprise Console):**
       - Người dùng: **Quản trị viên Cấp cao (Super Admin — Nguyễn Văn Huy)**.
       - Tông màu: Xanh dương đậm / Slate Navy, biểu tượng Khiên 🛡️.
       - Nghiệp vụ duy nhất: Quản trị danh mục dự án độc lập, Quản trị hồ bơi nhân sự toàn hệ thống, Ma trận điều phối kỹ sư vào dự án, Cấu hình đồng bộ Supabase Cloud, Sao lưu / Phục hồi toàn bộ CSDL hệ thống.
       - **TUYỆT ĐỐI KHÔNG** chứa các trang kịch bản kiểm thử chi tiết, không giao việc kịch bản test, không cấu hình đợt test hay module nội bộ của từng dự án.
       - Trên mỗi thẻ dự án có nút hành động: *"🚀 Vào Không Gian Dự Án ➔"* để dẫn trực tiếp sang giao diện Quản Trị Dự Án.
    2. **`lead/` — Không Gian Quản Trị Viên Dự Án (Project Lead Workspace):**
       - Người dùng: **Quản trị viên Dự án (Project Lead — Hoàng Hải Đăng)**.
       - Tông màu: Vàng Hổ Phách / Cam Đồng, biểu tượng Vương miện 👑.
       - Nghiệp vụ khép kín trong dự án: Bảng điều hành tổng quan dự án (KPI, tiến độ đợt test, đội ngũ nhân sự), Thư viện kịch bản kiểm thử dự án, Điều phối giao việc cho Tester dự án, Báo cáo chất lượng & nghiệm thu ISO 25010, Cấu hình nội bộ dự án (Phiên bản, Đợt test, Phân hệ nghiệp vụ).

### 2.7. Độc Lập Mã Nguồn Từng Tài Khoản & Triệt Để Module Hóa
> *"Quan điểm của tôi về xây giao diện như thế này. Mỗi tài khoản sẽ có hệ thống code riêng cho giao diện của tài khoản đó, chỉ những phần thật sự chung và không ảnh hưởng nhiều mới đưa vào làm code chung. Trong giao diện của từng account triệt để vận dụng quan điểm module hóa, đưa thành các file nhỏ có thể để clear và dễ nâng cấp bảo trì. Theo quan điểm chỉ đạo trên đề nghị bạn thực hiện theo kế hoạch bạn đã vạch ra cho tôi"*

- **Quy định triển khai:**
  - Cấu trúc thư mục mã nguồn chia theo 4 vai trò độc lập:
    - `admin/`: Mã nguồn giao diện và logic riêng cho Super Admin (`admin-portfolio.js`, `admin-personnel.js`, `admin-staffing.js`, `admin-console.css`).
    - `lead/`: Mã nguồn giao diện và logic riêng cho Project Lead (`lead-context.js`, `lead-dashboard.js`, `lead-settings.js`, `lead-theme.css`).
    - `tester/`: Mã nguồn giao diện thực thi kịch bản và ghi nhận kết quả kiểm thử của Tester.
    - `dev/`: Mã nguồn giao diện theo dõi và xử lý lỗi phần mềm của Developer.
  - Thư mục dùng chung `shared/` chỉ chứa những thành phần thực sự dùng chung không ảnh hưởng nghiệp vụ riêng: `base.css`, `core.js` (State persistence & Auth), `cloud-sync.js` (Supabase Realtime Sync), thư viện bên thứ 3 (`xlsx.full.min.js`, `exceljs.min.js`).

### 2.8. Tách Thành Dự Án Phần Mềm Độc Lập Hoàn Toàn
> *"Tôi nhận thấy rằng Hệ thống test đang xây dựng là một hệ thống độc lập không còn liên quan gì nhiều đến hệ thống smartvms nữa -> Đề nghị bạn tạo thành một project mới hoàn toàn cho tôi. Trong project đó đề nghị có bản ghi nhật ký những yêu cầu về xây dựng hệ thống test cho tôi để tiếp tục làm việc và trao đổi"*

- **Quy định triển khai:**
  - Tách toàn bộ hệ sinh thái kiểm thử ra khỏi kho lưu trữ `SmartVMS-LocalSinglesite` thành một kho dự án độc lập đặt tại:
    `d:\DevSoft\SoftwareQualityTestManager`
  - Khởi tạo kho lưu trữ Git độc lập cho dự án mới.
  - Chuẩn hóa định danh `package.json`, kịch bản khởi chạy `Open-TestManager.bat`, `Start-LAN-Server.bat` và tài liệu hướng dẫn độc lập.
  - Thiết lập tài liệu này (`NHAT_KY_YEU_CAU_HE_THONG_KIEM_THU.md`) làm tài liệu quy chuẩn duy nhất phục vụ việc tiếp tục trao đổi, nâng cấp và mở rộng tính năng.

### 2.9. Chuẩn Hóa Bàn Điều Hành & Kiến Trúc Phân Tầng Cho Kiểm Thử Viên (Tester Workspace)
- Quy chuẩn Bàn điều hành Tester phân tầng 4 cấp khép kín:
  - Tầng 0: `tester/index.html` — Bàn điều hành danh mục dự án Tester tham gia (Portfolio Hub).
  - Tầng 1: `tester/project.html` — Không gian dự án cá nhân Tester (các phiên bản được giao).
  - Tầng 2: `tester/version.html` — Không gian phiên bản cá nhân Tester (phân hệ & đợt test được giao).
  - Tầng 3: `tester/cycle.html` — Bàn thực thi FastTrack Studio Workstation (chấm điểm Pass/Fail, Timer, Step Checklist, Inline Defect).
  - Tích hợp chuông thông báo re-test thông minh trên Header và Universal Breadcrumb 4 Tầng.

### 2.10. Đồng Bộ Kiến Trúc Phân Tầng 4 Cấp Khép Kín Cho Phân Hệ Lập Trình Viên (Developer Workspace Hierarchy)
> *"Hiện tại hệ thống đang thiết kế thành các không gian làm việc độc lập, phân tầng. Mỗi không gian làm việc có đầy đủ các thuộc tính của riêng nó (tham khảo trong phần thiết kế của Quản trị dự án) -> Như vậy thì trên giao diện của dev có phải đồng bộ không hay là thiết kế khác đi đọc lập như bạn đang đề xuất -> Đề nghị bạn đánh giá nghiêm túc vấn đề này cho tôi"*
> *"triển khai theo lộ trình cho tôi"*

- **Quy định triển khai:**
  1. **Nguyên tắc đồng bộ phân tầng xuyên suốt hệ thống:**
     - Phân hệ Developer tuyệt đối không được thiết kế phẳng hoặc cắt rời thành công cụ đơn lẻ. Developer phải tuân thủ nghiêm ngặt mô hình phân tầng 4 cấp khép kín đồng bộ với Project Lead và Tester:
       - **TẦNG 0 (`dev/index.html`):** Bàn điều hành danh mục dự án phụ trách của Developer (Portfolio Hub). Hiển thị các dự án Dev được phân bổ, tổng tồn đọng lỗi, lỗi Blocker/Critical, lỗi Reopened, thanh phân bổ tiến độ lỗi 4 màu (Đã fix/Đóng, Đang sửa, Mới, Reopened) và bộ chuyển đổi 2 chế độ (Bảng chi tiết / Dạng thẻ).
       - **TẦNG 1 (`dev/project.html`):** Không gian dự án của Developer (Project Space). Quản lý danh mục các phiên bản có lỗi của dự án, tỷ lệ sửa lỗi thành công và bản đồ nhiệt phân hệ nghiệp vụ (Module Defect Hotspots).
       - **TẦNG 2 (`dev/version.html`):** Không gian phiên bản của Developer (Version Space). Quản lý danh mục các đợt kiểm thử (Test Cycles) có lỗi thuộc phiên bản và phân rã lỗi theo từng phân hệ chức năng.
       - **TẦNG 3 (`dev/cycle.html`):** Bàn điều tra, Kanban & Bàn giao bản vá kỹ thuật (Defect Investigation Studio / Kanban). Tích hợp Bảng Kanban 5 cột (`Tiếp nhận mới`, `Đang sửa`, `Cần làm rõ / Không tái hiện`, `Đã có bản vá`, `Đã đóng`), Bàn chẩn đoán lỗi (kết quả thực tế vs kỳ vọng, các bước tái hiện, ảnh chụp phóng to Lightbox), lệnh tạo nhánh Git tự động (`git checkout -b fix/...`), và Hộp thoại bàn giao bản vá chuẩn ISO 29119-3 & IEEE 1044 (Fix Version, Commit Hash, RCA Category).
       - **Báo cáo kỹ thuật (`dev/reports.html`):** Đo lường các chỉ số chất lượng mã nguồn thực chất: Thời gian khắc phục bình quân (MTTR), Tỷ lệ lỗi tái phát (Reopen Rate), Phân bổ nguyên nhân gốc rễ (Root Cause Analysis - RCA theo IEEE 1044).
  2. **Chuẩn hóa nhận diện & Module hóa mã nguồn độc lập:**
     - Tách riêng toàn bộ mã nguồn vào `dev/css/dev-theme.css` (tông màu Xanh Slate Navy & Electric Cyan 💻) và `dev/js/` (`dev-context.js`, `dev-portfolio.js`, `dev-project.js`, `dev-version.js`, `dev-cycle.js`, `dev-reports.js`).
     - Tích hợp thanh **Universal Breadcrumb 4 Tầng** đồng bộ, cho phép chuyển đổi dự án, phiên bản, đợt kiểm thử linh hoạt qua menu thả xuống.

---

## 3. BẢN ĐỒ KIẾN TRÚC & CẤU TRÚC THƯ MỤC DỰ ÁN ĐỘC LẬP

Cấu trúc thư mục của dự án độc lập `SoftwareQualityTestManager`:

```text
d:\DevSoft\SoftwareQualityTestManager/
│
├── index.html                       # Cổng Xác Thực & Đăng Nhập Tập Trung Doanh Nghiệp (4 Cấp Vai Trò)
├── server.js                        # Máy chủ Web Server chạy mạng nội bộ LAN / Intranet (Zero Dependency)
├── Open-TestManager.bat             # Kịch bản khởi chạy ứng dụng nhanh trên Desktop máy trạm
├── Start-LAN-Server.bat             # Kịch bản khởi chạy máy chủ phục vụ kiểm thử qua mạng LAN cơ quan
├── package.json                     # Thông tin gói phần mềm & kịch bản vận hành
├── vercel.json                      # Cấu hình triển khai tự động lên hạ tầng đám mây Vercel Cloud
├── supabase_schema.sql              # Cấu trúc CSDL PostgreSQL tập trung cho Supabase Cloud Realtime
├── NHAT_KY_YEU_CAU_HE_THONG_KIEM_THU.md # Nhật ký yêu cầu & kiến trúc chuẩn mực (Tài liệu này)
├── README.md                        # Giới thiệu tổng quan & Hướng dẫn bắt đầu nhanh
│
├── admin/                           # KHÔNG GIAN CỔNG QUẢN TRỊ CẤP CAO HỆ THỐNG (SUPER ADMIN)
│   ├── index.html                   # Trung tâm điều hành cấp cao: Danh mục dự án, Nhân sự, Phân bổ
│   ├── settings.html                # Cài đặt nền tảng: Supabase Cloud, Sao lưu / Phục hồi toàn CSDL
│   ├── css/
│   │   └── admin-console.css        # Hệ thống giao diện điều hành Enterprise cấp cao (Tone Xanh Navy 🛡️)
│   └── js/
│       ├── admin-portfolio.js       # Module quản lý danh mục các dự án độc lập toàn hệ thống
│       ├── admin-personnel.js       # Module quản lý hồ bơi nhân sự dùng chung toàn hệ thống
│       └── admin-staffing.js        # Module ma trận phân bổ kỹ sư vào các dự án độc lập
│
├── lead/                            # KHÔNG GIAN QUẢN TRỊ VIÊN DỰ ÁN (PROJECT LEAD WORKSPACE)
│   ├── index.html                   # Dashboard điều hành dự án: Hero banner, KPI, Đợt test, Roster dự án
│   ├── testcases.html               # Thư viện kịch bản kiểm thử độc lập của dự án (Import/Export Excel)
│   ├── assignments.html             # Điều phối & Giao việc cho các Tester thuộc dự án (2 Tab Dispatch)
│   ├── reports.html                 # Báo cáo chất lượng, phân tích lỗi, biểu đồ và xuất biên bản nghiệm thu
│   ├── settings.html                # Cài đặt nội bộ dự án: Phiên bản (Versions), Đợt test (Cycles), Modules
│   ├── css/
│   │   └── lead-theme.css           # Giao diện Quản trị viên dự án chuyên biệt (Tone Vàng Hổ Phách 👑)
│   └── js/
│       ├── lead-context.js          # Module quản trị ngữ cảnh dự án hiện hành, thanh banner & bộ chuyển dự án
│       ├── lead-dashboard.js        # Module tính toán KPI, tiến độ đợt test và danh sách nhân sự dự án
│       └── lead-settings.js         # Module quản trị cấu hình nội bộ dự án (CRUD Versions, Cycles, Modules)
│
├── tester/                          # KHÔNG GIAN LÀM VIỆC CỦA KIỂM THỬ VIÊN (TESTER STUDIO & WORKSPACES)
│   ├── index.html                   # TẦNG 0: Danh mục các dự án Tester được phân bổ tham gia
│   ├── project.html                 # TẦNG 1: Không gian Dự án của Tester (Tiến độ, KPI & Sổ tay lỗi cá nhân)
│   ├── version.html                 # TẦNG 2: Không gian Phiên bản của Tester (Phân hệ & Các đợt test)
│   ├── cycle.html                   # TẦNG 3: BÀN THỰC THI STUDIO (Dual-Pane FastTrack, Timer, Step Checklist, Inline Defect)
│   ├── execution.html               # Forwarder chuyển tiếp sang cycle.html (Bảo toàn tham số URL)
│   ├── history.html                 # Nhật ký kiểm toán lịch sử thực thi kịch bản (Execution Logs - ISO 29119-3)
│   ├── reports.html                 # Báo cáo kết quả và tiến độ cá nhân của Tester
│   ├── css/
│   │   └── tester-theme.css         # Hệ thống giao diện Tester Enterprise cấp cao (Tone Xanh Ngọc / Emerald 🧪)
│   └── js/
│       ├── tester-context.js        # Module đồng bộ Universal Breadcrumb 4 Tầng & Quản trị ngữ cảnh
│       ├── tester-portfolio.js      # Logic điều phối danh mục dự án Tester được phân công (Tầng 0)
│       ├── tester-project.js        # Logic điều hành không gian dự án cá nhân Tester (Tầng 1)
│       ├── tester-version.js        # Logic điều hành không gian phiên bản cá nhân Tester (Tầng 2)
│       └── tester-cycle.js          # Logic Bàn thực thi FastTrack Studio Workstation (Tầng 3)
│
├── dev/                             # KHÔNG GIAN CỦA KỸ SƯ LẬP TRÌNH (DEVELOPER WORKBENCH & DEFECT TRACKER)
│   ├── index.html                   # TẦNG 0: Bàn điều hành danh mục dự án phụ trách của Developer (Portfolio Hub)
│   ├── project.html                 # TẦNG 1: Không gian Dự án của Developer (Các phiên bản & Heatmap lỗi)
│   ├── version.html                 # TẦNG 2: Không gian Phiên bản của Developer (Phân hệ & Đợt test có lỗi)
│   ├── cycle.html                   # TẦNG 3: Bàn điều tra, Kanban & Bàn giao bản vá kỹ thuật (Defect Studio)
│   ├── execution.html               # Forwarder chuyển tiếp sang cycle.html (Bảo toàn tham số URL)
│   ├── reports.html                 # Báo cáo chất lượng kỹ thuật (MTTR, Reopen Rate, RCA IEEE 1044)
│   ├── css/
│   │   └── dev-theme.css            # Hệ thống giao diện Developer Enterprise (Tone Slate Navy / Cyan 💻)
│   └── js/
│       ├── dev-context.js           # Quản lý Universal Breadcrumb 4 Tầng & Ngữ cảnh phân bổ dự án
│       ├── dev-portfolio.js         # Logic điều phối danh mục dự án cá nhân của Dev (Tầng 0)
│       ├── dev-project.js           # Logic điều hành không gian dự án của Dev (Tầng 1)
│       ├── dev-version.js           # Logic điều hành không gian phiên bản của Dev (Tầng 2)
│       ├── dev-cycle.js             # Logic Bàn điều tra lỗi, Kanban & Bàn giao bản vá (Tầng 3)
│       └── dev-reports.js           # Logic tính toán biểu đồ MTTR, Reopen Rate, RCA
│
├── shared/                          # THƯ MỤC CHỨA CÁC THÀNH PHẦN DÙNG CHUNG KHÔNG ẢNH HƯỞNG NGHIỆP VỤ
│   ├── css/
│   │   ├── base.css                 # Hệ thống CSS cơ sở, tokens màu sắc, kiểu chữ Inter, Dark/Light mode
│   │   ├── testcases.css            # Định dạng bảng biểu hiển thị kịch bản kiểm thử
│   │   ├── assignment.css           # Định dạng bảng điều phối phân công công việc
│   │   ├── reports.css              # Định dạng báo cáo và biểu đồ chất lượng
│   │   └── settings.css             # Định dạng bảng biểu cấu hình chung
│   └── js/
│       ├── core.js                  # Lõi quản lý trạng thái tập trung, phân quyền RBAC và chuyển đổi ngữ cảnh
│       ├── cloud-sync.js            # Module đồng bộ thời gian thực 2 chiều với Supabase PostgreSQL Cloud
│       ├── testcases.js             # Logic nghiệp vụ xử lý kịch bản kiểm thử dùng chung
│       ├── assignment.js            # Logic nghiệp vụ ma trận giao việc kiểm thử
│       ├── reports.js               # Logic nghiệp vụ đo lường, tính toán chỉ số chất lượng & biểu đồ Chart.js
│       ├── excel-importer.js        # Module phân tích cú pháp và nạp dữ liệu từ tệp Excel chuẩn
│       └── vendor/                  # Các thư viện độc lập hỗ trợ: `xlsx.full.min.js`, `exceljs.min.js`
│
└── data/                            # THƯ MỤC CHỨA DỮ LIỆU KHỞI TẠO & MẪU IMPORT/EXPORT
    ├── enterprise_projects_manifest.js # Tệp danh mục các dự án khởi tạo ban đầu
    ├── SmartVMS_Mau_KichBan_KiemThu.xlsx # Mẫu tệp Excel chuẩn hóa để người dùng nhập kịch bản
    └── SmartVMS_157_KichBan_ChuaTest.xlsx # Tệp Excel chứa bộ kịch bản nghiệp vụ chuẩn để nạp động
```

---

## 4. MA TRẬN PHÂN QUYỀN VAI TRÒ NGƯỜI DÙNG (RBAC MATRIX)

Hệ thống thiết lập 4 cấp vai trò rõ ràng, đảm bảo nguyên tắc bảo mật và phân quyền trách nhiệm:

| Tính Năng / Nghiệp Vụ | 🛡️ Super Admin | 👑 Project Lead | 🧪 Tester | 💻 Developer |
| :--- | :---: | :---: | :---: | :---: |
| **Quản trị Danh mục Dự án (Thêm/Sửa/Đóng dự án)** | ✅ Toàn quyền | ❌ | ❌ | ❌ |
| **Quản lý Hồ bơi Nhân sự Hệ thống (Thêm/Sửa/Khóa user)** | ✅ Toàn quyền | ❌ | ❌ | ❌ |
| **Điều phối / Phân bổ Nhân sự vào Dự án** | ✅ Toàn quyền | ❌ | ❌ | ❌ |
| **Cấu hình Supabase Cloud & Sao lưu toàn CSDL** | ✅ Toàn quyền | ❌ | ❌ | ❌ |
| **Truy cập Không Gian Dự Án (Project Workspace)** | ✅ (Hỗ trợ) | ✅ Toàn quyền | ❌ | ❌ |
| **Quản lý Kịch bản Kiểm thử Dự án (Tạo/Sửa/Excel)** | ❌ | ✅ Toàn quyền | 👁️ (Xem bài giao) | 👁️ (Xem đối soát) |
| **Quản lý Phiên bản Phần mềm Dự án (Versions)** | ❌ | ✅ Toàn quyền | ❌ | ❌ |
| **Quản lý Các Đợt Kiểm Thử Dự Án (Test Cycles)** | ❌ | ✅ Toàn quyền | ❌ | ❌ |
| **Quản lý Phân Hệ Nghiệp Vụ Dự Án (Modules)** | ❌ | ✅ Toàn quyền | ❌ | ❌ |
| **Điều phối & Giao việc Testcase cho Tester Dự án** | ❌ | ✅ Toàn quyền | ❌ | ❌ |
| **Xem Báo Cáo Chất Lượng & Ký Nghiệm Thu ISO** | 👁️ (Toàn cảnh) | ✅ Toàn quyền | 👁️ (Cá nhân) | 👁️ (Bug report) |
| **Thực thi Kịch bản Kiểm thử (Đạt/Lỗi/Chặn)** | ❌ | ❌ | ✅ Toàn quyền | ❌ |
| **Cập nhật Bằng chứng & Nhật ký Thực thi** | ❌ | ❌ | ✅ Toàn quyền | ❌ |
| **Xem Sổ Theo Dõi Lỗi (Defects) & Cập nhật sửa lỗi** | 👁️ (Giám sát) | ✅ (Duyệt đóng) | 👁️ (Báo lỗi) | ✅ (Xác nhận sửa) |

---

## 5. QUY CHUẨN TIÊU CHUẨN QUỐC TẾ ÁP DỤNG (ISO STANDARDS)

Hệ thống được thiết kế đáp ứng chặt chẽ các tiêu chuẩn kỹ thuật phần mềm quốc tế:

### 5.1. Tiêu Chuẩn ISO/IEC/IEEE 29119-3:2021 (Testing Process & Documentation)
- **Cấu trúc Đợt Kiểm Thử (Test Cycles):** Mỗi dự án được phân chia thành các vòng kiểm thử độc lập (Test Cycles) có mã đợt, loại kiểm thử (`Smoke`, `Regression`, `Sanity`, `Acceptance/UAT`), phạm vi kịch bản (`Scope`), ngày bắt đầu và hạn hoàn thành rõ ràng.
- **Kịch bản kiểm thử chuẩn hóa (Test Specification):** Mỗi kịch bản bao gồm Mã kịch bản, Phân hệ nghiệp vụ, Tên tóm tắt, Tiền điều kiện (`Pre-conditions`), Các bước thực hiện (`Test Steps`), Kết quả mong đợi (`Expected Results`), Dữ liệu kiểm thử (`Test Data`) và Mức độ ưu tiên (`Critical/High/Medium/Low`).
- **Nhật ký kiểm toán thực thi (Execution Audit Logs):** Ghi nhận đầy đủ thời điểm thực thi, người thực hiện, chu kỳ thực thi, trạng thái kết quả và bằng chứng đính kèm (Screenshots/Logs).

### 5.2. Tiêu Chuẩn ISO/IEC 25010:2023 (Software Product Quality Model)
Báo cáo chất lượng của hệ thống đo lường và thẩm định phần mềm dựa trên 8 đặc tính chất lượng cốt lõi:
1. **Tính phù hợp chức năng (Functional Suitability):** Độ đầy đủ chức năng, độ đúng đắn và tính thỏa đáng của các ca kiểm thử nghiệp vụ.
2. **Hiệu năng (Performance Efficiency):** Hành vi thời gian phản hồi và khả năng đáp ứng tải cao điểm.
3. **Tính tương thích (Compatibility):** Khả năng cùng tồn tại và khả năng tương tác với các hệ thống/thiết bị phần cứng ngoại vi.
4. **Tính khả dụng (Usability):** Tính dễ học, tính dễ vận hành và khả năng bảo vệ người dùng khỏi lỗi thao tác.
5. **Độ tin cậy (Reliability):** Mức độ hoàn thiện, khả năng chịu lỗi và khả năng phục hồi sau sự cố.
6. **Bảo mật (Security):** Tính bảo mật dữ liệu, tính toàn vẹn, tính không thể chối bỏ trách nhiệm và tính xác thực người dùng.
7. **Tính bảo trì (Maintainability):** Tính module hóa, khả năng tái sử dụng và khả năng kiểm thử được của mã nguồn.
8. **Tính di động (Portability):** Khả năng thích ứng và khả năng thay thế trên các môi trường triển khai khác nhau.

---

## 6. KẾ HOẠCH PHÁT TRIỂN & CÁC NỘI DUNG TRAO ĐỔI TIẾP THEO (ROADMAP)

Dưới đây là các định hướng chiến lược để tiếp tục thảo luận, trao đổi và triển khai trong các giai đoạn tiếp theo:

1. **Giai đoạn 1 (Hoàn thành — Hiện tại):**
   - Tách thành dự án độc lập `d:\DevSoft\SoftwareQualityTestManager`.
   - Phân định triệt để hai không gian giao diện: Admin Hệ Thống (`admin/`) và Quản Trị Dự Án (`lead/`).
   - Hoàn thiện cổng đăng nhập 4 vai trò, cơ chế Database-First và nạp động Excel.

2. **Giai đoạn 2 (Đề xuất tiếp theo — Tích hợp Kiểm thử Tự động & CI/CD):**
   - Xây dựng API Webhook tiếp nhận kết quả kiểm thử tự động từ Playwright, Cypress, Selenium, Postman/Newman.
   - Cho phép kích hoạt các đợt kiểm thử hồi quy tự động khi có bản Build mới từ GitHub / GitLab CI/CD pipeline.

3. **Giai đoạn 3 (Đề xuất tiếp theo — Đồng bộ Quản lý Lỗi 2 Chiều):**
   - Kết nối 2 chiều với các hệ thống Issue Tracking phổ biến (Jira, GitLab Issues, Redmine).
   - Khi Tester bấm "Ghi nhận Lỗi (Fail)" trên màn hình thực thi, hệ thống tự động đồng bộ Bug ticket sang Jira cho Developer và ngược lại.

4. **Giai đoạn 4 (Đề xuất tiếp theo — Xuất Hồ Sơ Thẩm Định & Nghiệm Thu Chất Lượng Chính Thức):**
   - Tự động xuất file Biên bản Nghiệm thu Kỹ thuật (QA Sign-off Report) định dạng PDF/Word có chữ ký số và con dấu số điện tử.
   - Bảng ma trận truy vết yêu cầu (Requirement Traceability Matrix - RTM) phục vụ việc nghiệm thu dự án phần mềm với các cơ quan kiểm toán độc lập.

---

*Tài liệu được khởi tạo và duy trì bởi Trợ Lý AI Antigravity theo chỉ đạo trực tiếp của Người sử dụng.*
