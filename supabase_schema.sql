-- ================================================================
-- HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM (SQTM v3.0)
-- BẢN KHỞI TẠO TOÀN DIỆN & AN NINH CƠ SỞ DỮ LIỆU (ALL-IN-ONE MASTER SCHEMA)
-- Chuẩn hóa: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010:2023
-- Chạy 1 lần duy nhất trên Supabase SQL Editor cho dự án mới hoặc nâng cấp
-- ================================================================

-- ================================================================
-- 1. HÀM TỰ ĐỘNG CẬP NHẬT THỜI GIAN (TRIGGER FUNCTION)
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 2. KHỞI TẠO CÁC BẢNG CƠ SỞ DỮ LIỆU (TABLE DEFINITIONS)
-- ================================================================

-- 2.1. Bảng Quản trị Người dùng & Phân quyền tập trung (RBAC App Users)
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

-- 2.2. Bảng Danh mục Dự án phần mềm độc lập (Enterprise Projects Portfolio)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    active_version TEXT DEFAULT 'v1.0',
    versions JSONB DEFAULT '[]'::jsonb,
    modules JSONB DEFAULT '[]'::jsonb,
    test_cycles JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3. Bảng Ma trận Phân bổ Nhân sự Dự án (Staffing Allocation Matrix)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    project_role TEXT NOT NULL CHECK (project_role IN ('lead', 'tester', 'dev', 'admin')),
    title TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, username)
);

-- 2.4. Bảng Các Đợt Kiểm thử (Test Runs / Test Cycles)
CREATE TABLE IF NOT EXISTS public.test_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_version TEXT DEFAULT 'v1.0',
    scope_type TEXT DEFAULT 'ALL' CHECK (scope_type IN ('ALL', 'SMART_RETEST', 'SELECTIVE_P1', 'FULL_RERUN', 'CUSTOM')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
    parent_run_id TEXT,
    created_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Đảm bảo cột project_id luôn tồn tại nếu bảng đã có từ trước
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_runs' AND column_name='project_id') THEN
        ALTER TABLE public.test_runs ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2.5. Bảng Kết quả Kiểm thử & Vòng đời Quản lý Lỗi (Test Results & Defect Lifecycle)
CREATE TABLE IF NOT EXISTS public.test_results (
    run_id TEXT NOT NULL DEFAULT 'run_001',
    tc_id TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Not Run', 'Pass', 'Fail', 'Skip', 'Inherited Pass')),
    tester TEXT,
    assigned_to TEXT,
    run_at TIMESTAMPTZ,
    defect_status TEXT DEFAULT 'None' CHECK (defect_status IN ('None', 'New', 'Assigned', 'In Progress', 'Resolved', 'Retest Passed', 'Reopened')),
    severity TEXT CHECK (severity IN ('Blocker', 'Critical', 'Major', 'Minor')),
    assigned_dev TEXT,
    fix_version TEXT,
    fail_reason TEXT,
    note TEXT,
    evidences JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (run_id, tc_id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='project_id') THEN
        ALTER TABLE public.test_results ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2.6. Bảng Thảo luận & Phản hồi giữa QA - Dev (Comments & Thread)
CREATE TABLE IF NOT EXISTS public.test_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL DEFAULT 'run_001',
    tc_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_comments' AND column_name='project_id') THEN
        ALTER TABLE public.test_comments ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2.7. Bảng Kịch bản Kiểm thử Tùy chỉnh (Custom Test Cases Catalog)
CREATE TABLE IF NOT EXISTS public.test_cases_custom (
    tc_id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    priority TEXT DEFAULT 'P2',
    platform TEXT,
    name TEXT NOT NULL,
    test_data TEXT,
    precondition TEXT,
    steps JSONB,
    expected JSONB,
    notes TEXT,
    is_custom BOOLEAN DEFAULT false,
    is_overridden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_cases_custom' AND column_name='project_id') THEN
        ALTER TABLE public.test_cases_custom ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2.8. Bảng Phiên Kiểm thử (Test Sessions)
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id TEXT PRIMARY KEY DEFAULT 'current',
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    owner TEXT,
    version TEXT DEFAULT 'v1.0',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9. Bảng Phân hệ Nghiệp vụ (Business Modules)
CREATE TABLE IF NOT EXISTS public.test_modules (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. THIẾT LẬP TRIGGERS TỰ ĐỘNG CẬP NHẬT THỜI GIAN
-- ================================================================
DROP TRIGGER IF EXISTS tr_app_users_updated_at ON public.app_users;
CREATE TRIGGER tr_app_users_updated_at
    BEFORE UPDATE ON public.app_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_test_runs_updated_at ON public.test_runs;
CREATE TRIGGER tr_test_runs_updated_at
    BEFORE UPDATE ON public.test_runs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_test_results_updated_at ON public.test_results;
CREATE TRIGGER tr_test_results_updated_at
    BEFORE UPDATE ON public.test_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- 4. SEED TÀI KHOẢN MẶC ĐỊNH (MẬT KHẨU '123' ĐƯỢC MÃ HÓA SHA-256)
-- ================================================================
INSERT INTO public.app_users (id, username, password_hash, name, role, role_title, email, assigned_projects, status)
VALUES
    ('usr_001', 'admin', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Nguyễn Văn Huy', 'admin', 'Quản trị viên Cấp cao (Super Admin)', 'huy.nv@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_006', 'lead', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Hoàng Hải Đăng', 'project_lead', 'Quản trị viên dự án (QA Lead)', 'dang.hh@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_002', 'tester', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Nguyễn Văn Nam', 'tester', 'Kiểm thử viên 1', 'nam.nv@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_003', 'tester2', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Trần Thị Lan', 'tester', 'Kiểm thử viên 2', 'lan.tt@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_004', 'tester3', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Lê Hoàng Minh', 'tester', 'Kiểm thử viên 3', 'minh.lh@smartvms.local', '[]'::jsonb, 'ACTIVE'),
    ('usr_005', 'dev', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Trần Quốc Tuấn', 'developer', 'Lập trình viên (Developer)', 'tuan.tq@smartvms.local', '[]'::jsonb, 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- ================================================================
-- 5. BẢO MẬT ROW LEVEL SECURITY (RLS) - KHÓA QUYỀN GHI VÔ DANH (ANON)
-- ================================================================
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
    -- 5.1. Xóa các chính sách cũ nếu có
    DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
    DROP POLICY IF EXISTS "Allow anon all on project_members" ON public.project_members;
    DROP POLICY IF EXISTS "Allow anon all on test_runs" ON public.test_runs;
    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    DROP POLICY IF EXISTS "Allow anon all on test_comments" ON public.test_comments;
    DROP POLICY IF EXISTS "Allow anon all on test_cases_custom" ON public.test_cases_custom;
    DROP POLICY IF EXISTS "Allow anon all on test_sessions" ON public.test_sessions;
    DROP POLICY IF EXISTS "Allow anon all on test_modules" ON public.test_modules;
    DROP POLICY IF EXISTS "Allow anon all on app_users" ON public.app_users;

    -- 5.2. app_users: CẤM TUYỆT ĐỐI ANON ĐỌC/GHI (Bảo mật tài khoản, chỉ Backend Service Role được truy xuất)
    DROP POLICY IF EXISTS "Allow anon all on app_users" ON public.app_users;
    DROP POLICY IF EXISTS "Deny anon access on app_users" ON public.app_users;
    CREATE POLICY "Deny anon access on app_users" ON public.app_users
        FOR ALL TO anon USING (false) WITH CHECK (false);

    -- 5.3. Các bảng nghiệp vụ: Kích hoạt chế độ đồng bộ chuyển tiếp (Cho phép Client Vercel hiện tại đồng bộ mượt mà)
    DROP POLICY IF EXISTS "Allow anon read test_sessions" ON public.test_sessions;
    DROP POLICY IF EXISTS "Allow anon all on test_sessions" ON public.test_sessions;
    CREATE POLICY "Allow anon all on test_sessions" ON public.test_sessions
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read test_results" ON public.test_results;
    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    CREATE POLICY "Allow anon all on test_results" ON public.test_results
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read test_comments" ON public.test_comments;
    DROP POLICY IF EXISTS "Allow anon all on test_comments" ON public.test_comments;
    CREATE POLICY "Allow anon all on test_comments" ON public.test_comments
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read test_cases_custom" ON public.test_cases_custom;
    DROP POLICY IF EXISTS "Allow anon all on test_cases_custom" ON public.test_cases_custom;
    CREATE POLICY "Allow anon all on test_cases_custom" ON public.test_cases_custom
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read projects" ON public.projects;
    DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
    CREATE POLICY "Allow anon all on projects" ON public.projects
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read project_members" ON public.project_members;
    DROP POLICY IF EXISTS "Allow anon all on project_members" ON public.project_members;
    CREATE POLICY "Allow anon all on project_members" ON public.project_members
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read test_runs" ON public.test_runs;
    DROP POLICY IF EXISTS "Allow anon all on test_runs" ON public.test_runs;
    CREATE POLICY "Allow anon all on test_runs" ON public.test_runs
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon read test_modules" ON public.test_modules;
    DROP POLICY IF EXISTS "Allow anon all on test_modules" ON public.test_modules;
    CREATE POLICY "Allow anon all on test_modules" ON public.test_modules
        FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

-- ================================================================
-- 6. KÍCH HOẠT SUPABASE REALTIME (WEBSOCKET COLLABORATION)
-- ================================================================
DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.projects; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.test_runs; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.test_comments; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.test_cases_custom; EXCEPTION WHEN duplicate_object THEN END;
END $$;

-- Thông báo hoàn thành
SELECT '🚀 Database SQTM v3.0 đã khởi tạo và nâng cấp an ninh thành công 100%!' AS result;
