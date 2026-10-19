-- ================================================================
-- SmartVMS Test Manager — Supabase Database Schema (PostgreSQL)
-- Phiên bản: v3.0 | Hỗ trợ Quản lý Đợt Test (Test Cycles), Bằng chứng Ảnh,
-- Thảo luận 2 Chiều (QA - Dev) & Vòng Đời Lỗi Chuẩn Hóa
-- ================================================================

-- 1. BẢNG CÁC ĐỢT KIỂM THỬ (Test Runs / Test Cycles)
CREATE TABLE IF NOT EXISTS public.test_runs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_version TEXT DEFAULT 'v2.0',
    scope_type TEXT DEFAULT 'ALL' CHECK (scope_type IN ('ALL', 'SMART_RETEST', 'SELECTIVE_P1', 'FULL_RERUN', 'CUSTOM')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
    parent_run_id TEXT,
    created_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm đợt test mặc định đầu tiên nếu chưa có
INSERT INTO public.test_runs (id, name, target_version, scope_type, status, created_by, notes)
VALUES ('run_001', 'Đợt 1 — Khảo sát Kiểm thử Toàn diện', 'v2.0', 'ALL', 'ACTIVE', 'QA Team', 'Đợt kiểm thử baseline toàn bộ 174 test cases')
ON CONFLICT (id) DO NOTHING;

-- 2. BẢNG KẾT QUẢ KIỂM THỬ MỞ RỘNG (Test Results per Run)
CREATE TABLE IF NOT EXISTS public.test_results (
    run_id TEXT NOT NULL DEFAULT 'run_001',
    tc_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Not Run', 'Pass', 'Fail', 'Skip', 'Inherited Pass')),
    tester TEXT,
    assigned_to TEXT,
    run_at TIMESTAMPTZ,
    
    -- Vòng đời quản lý lỗi (Defect Lifecycle)
    defect_status TEXT DEFAULT 'None' CHECK (defect_status IN ('None', 'New', 'Assigned', 'In Progress', 'Resolved', 'Retest Passed', 'Reopened')),
    severity TEXT CHECK (severity IN ('Blocker', 'Critical', 'Major', 'Minor')),
    assigned_dev TEXT,
    fix_version TEXT,
    fail_reason TEXT,
    note TEXT,
    evidences JSONB DEFAULT '[]'::jsonb, -- Mảng ảnh: [{ id, url, name, uploaded_by, created_at }]
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (run_id, tc_id)
);

-- 3. BẢNG THẢO LUẬN & PHẢN HỒI 2 CHIỀU (QA - Dev Comments)
CREATE TABLE IF NOT EXISTS public.test_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id TEXT NOT NULL DEFAULT 'run_001',
    tc_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL, -- 'Tester', 'Developer', 'QA Lead', 'Admin'
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG TEST CASES TÙY CHỈNH & HIỆU ĐÍNH (Custom & Overridden Test Cases)
CREATE TABLE IF NOT EXISTS public.test_cases_custom (
    tc_id TEXT PRIMARY KEY,
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

-- 5. BẢNG PHIÊN KIỂM THỬ (Legacy session support)
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id TEXT PRIMARY KEY DEFAULT 'current',
    name TEXT NOT NULL,
    owner TEXT,
    version TEXT DEFAULT 'SmartVMS Local v3.0',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG DANH MỤC MODULES (Custom Modules)
CREATE TABLE IF NOT EXISTS public.test_modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_modules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on test_runs" ON public.test_runs;
    CREATE POLICY "Allow anon all on test_runs" ON public.test_runs
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    CREATE POLICY "Allow anon all on test_results" ON public.test_results
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on test_comments" ON public.test_comments;
    CREATE POLICY "Allow anon all on test_comments" ON public.test_comments
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on test_cases_custom" ON public.test_cases_custom;
    CREATE POLICY "Allow anon all on test_cases_custom" ON public.test_cases_custom
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on test_sessions" ON public.test_sessions;
    CREATE POLICY "Allow anon all on test_sessions" ON public.test_sessions
        FOR ALL TO anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on test_modules" ON public.test_modules;
    CREATE POLICY "Allow anon all on test_modules" ON public.test_modules
        FOR ALL TO anon USING (true) WITH CHECK (true);
END $$;

-- ================================================================
-- KÍCH HOẠT SUPABASE REALTIME
-- ================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_runs;
    EXCEPTION WHEN duplicate_object THEN END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;
    EXCEPTION WHEN duplicate_object THEN END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_comments;
    EXCEPTION WHEN duplicate_object THEN END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_cases_custom;
    EXCEPTION WHEN duplicate_object THEN END;
END $$;

-- ================================================================
-- TỰ ĐỘNG CẬP NHẬT CỘT updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_test_runs_updated_at ON public.test_runs;
CREATE TRIGGER tr_test_runs_updated_at
    BEFORE UPDATE ON public.test_runs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_test_results_updated_at ON public.test_results;
CREATE TRIGGER tr_test_results_updated_at
    BEFORE UPDATE ON public.test_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Thông báo hoàn thành
SELECT 'Database Schema SmartVMS Test Manager v3.0 đã khởi tạo thành công!' AS result;
