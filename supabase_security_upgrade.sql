-- ================================================================
-- HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM (SQTM v3.0)
-- BẢN NÂNG CẤP AN NINH CƠ SỞ DỮ LIỆU & QUẢN TRỊ TÀI KHOẢN (SECURITY UPGRADE)
-- Mục tiêu: Khóa chặn hoàn toàn lỗ hổng Anon RLS và tạo bảng app_users
-- ================================================================

-- 1. TẠO BẢNG QUẢN LÝ NGƯỜI DÙNG TẬP TRUNG (Centralized App Users)
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'project_lead', 'lead', 'tester', 'developer')),
    role_title TEXT,
    email TEXT,
    assigned_projects JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Khởi tạo trigger cập nhật thời gian updated_at cho app_users
DROP TRIGGER IF EXISTS tr_app_users_updated_at ON public.app_users;
CREATE TRIGGER tr_app_users_updated_at
    BEFORE UPDATE ON public.app_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. SEED CÁC TÀI KHOẢN MẶC ĐỊNH (Mật khẩu '123' mã hóa SHA-256: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3)
INSERT INTO public.app_users (id, username, password_hash, name, role, role_title, email, assigned_projects, status)
VALUES
    ('usr_001', 'admin', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Nguyễn Văn Huy', 'admin', 'Quản trị viên Cấp cao (Super Admin)', 'huy.nv@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_006', 'lead', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Hoàng Hải Đăng', 'project_lead', 'Quản trị viên dự án (QA Lead)', 'dang.hh@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_002', 'tester', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Nguyễn Văn Nam', 'tester', 'Kiểm thử viên 1', 'nam.nv@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_003', 'tester2', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Trần Thị Lan', 'tester', 'Kiểm thử viên 2', 'lan.tt@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_004', 'tester3', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Lê Hoàng Minh', 'tester', 'Kiểm thử viên 3', 'minh.lh@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_005', 'dev', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Trần Quốc Tuấn', 'developer', 'Lập trình viên (Developer)', 'tuan.tq@smartvms.local', '[]'::jsonb, 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 3. KHÓA CHẶT ROW LEVEL SECURITY (RLS) - XÓA BỎ CHÍNH SÁCH "ALLOW ANON ALL"
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_modules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- 3.1. Xóa các chính sách mở toang cho Anonymous trước đây
    DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
    DROP POLICY IF EXISTS "Allow anon all on project_members" ON public.project_members;
    DROP POLICY IF EXISTS "Allow anon all on test_runs" ON public.test_runs;
    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    DROP POLICY IF EXISTS "Allow anon all on test_comments" ON public.test_comments;
    DROP POLICY IF EXISTS "Allow anon all on test_cases_custom" ON public.test_cases_custom;
    DROP POLICY IF EXISTS "Allow anon all on test_sessions" ON public.test_sessions;
    DROP POLICY IF EXISTS "Allow anon all on test_modules" ON public.test_modules;
    DROP POLICY IF EXISTS "Allow anon all on app_users" ON public.app_users;

    -- 3.2. BẢNG app_users: TUYỆT ĐỐI KHÔNG CHO ANON ĐỌC/GHI (Chỉ Backend Service Role được truy cập)
    DROP POLICY IF EXISTS "Deny anon access on app_users" ON public.app_users;
    CREATE POLICY "Deny anon access on app_users" ON public.app_users
        FOR ALL TO anon USING (false) WITH CHECK (false);

    -- 3.3. BẢNG projects: Cho phép Anon CHỈ ĐỌC (SELECT), CẤM ghi/xóa trực tiếp
    DROP POLICY IF EXISTS "Allow anon read projects" ON public.projects;
    CREATE POLICY "Allow anon read projects" ON public.projects
        FOR SELECT TO anon USING (true);

    -- 3.4. BẢNG test_runs: Cho phép Anon CHỈ ĐỌC (SELECT)
    DROP POLICY IF EXISTS "Allow anon read test_runs" ON public.test_runs;
    CREATE POLICY "Allow anon read test_runs" ON public.test_runs
        FOR SELECT TO anon USING (true);

    -- 3.5. BẢNG test_modules: Cho phép Anon CHỈ ĐỌC (SELECT)
    DROP POLICY IF EXISTS "Allow anon read test_modules" ON public.test_modules;
    CREATE POLICY "Allow anon read test_modules" ON public.test_modules
        FOR SELECT TO anon USING (true);

    -- 3.6. BẢNG test_cases_custom: Cho phép Anon CHỈ ĐỌC (SELECT)
    DROP POLICY IF EXISTS "Allow anon read test_cases_custom" ON public.test_cases_custom;
    CREATE POLICY "Allow anon read test_cases_custom" ON public.test_cases_custom
        FOR SELECT TO anon USING (true);

    -- 3.7. BẢNG test_results & comments: Chỉ đọc (Mọi thao tác ghi phải qua Backend API)
    DROP POLICY IF EXISTS "Allow anon read test_results" ON public.test_results;
    CREATE POLICY "Allow anon read test_results" ON public.test_results
        FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "Allow anon read test_comments" ON public.test_comments;
    CREATE POLICY "Allow anon read test_comments" ON public.test_comments
        FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "Allow anon read project_members" ON public.project_members;
    CREATE POLICY "Allow anon read project_members" ON public.project_members
        FOR SELECT TO anon USING (true);
END $$;

-- Thông báo hoàn thành
SELECT '✅ Đã nâng cấp an ninh Supabase Database thành công! Anonymous đã bị tước quyền ghi/xóa.' AS result;
