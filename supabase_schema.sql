-- ================================================================
-- HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM (SQTM)
-- Supabase Database Schema (PostgreSQL) — Phiên bản 3.0.0
-- Kiến trúc Đa Dự Án Độc Lập Khép Kín (Multi-Project Enterprise QA Platform)
-- Chuẩn hóa: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010:2023
-- ================================================================

-- 1. BẢNG DANH MỤC CÁC DỰ ÁN ĐỘC LẬP (Enterprise Projects Portfolio)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    active_version TEXT DEFAULT 'v1.0',
    versions JSONB DEFAULT '[]'::jsonb,        -- Mảng các phiên bản: [{ code, label, isCurrent, targetDate, changelog }]
    modules JSONB DEFAULT '[]'::jsonb,         -- Mảng phân hệ nghiệp vụ: [{ id, name, short, orderIndex }]
    test_cycles JSONB DEFAULT '[]'::jsonb,     -- Mảng đợt test: [{ id, code, name, version, type, scope, status, startDate, endDate }]
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG MA TRẬN PHÂN BỔ NHÂN SỰ VÀO DỰ ÁN (Staffing Allocation Matrix)
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

-- 3. BẢNG CÁC ĐỢT KIỂM THỬ (Test Runs / Test Cycles)
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

-- Thêm cột project_id nếu bảng test_runs đã tồn tại từ trước
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_runs' AND column_name='project_id') THEN
        ALTER TABLE public.test_runs ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. BẢNG KẾT QUẢ KIỂM THỬ MỞ RỘNG (Test Results per Run)
CREATE TABLE IF NOT EXISTS public.test_results (
    run_id TEXT NOT NULL DEFAULT 'run_001',
    tc_id TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
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

-- Thêm cột project_id nếu bảng test_results đã tồn tại từ trước
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='project_id') THEN
        ALTER TABLE public.test_results ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. BẢNG THẢO LUẬN & PHẢN HỒI 2 CHIỀU (QA - Dev Comments)
CREATE TABLE IF NOT EXISTS public.test_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL DEFAULT 'run_001',
    tc_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL, -- 'Tester', 'Developer', 'QA Lead', 'Admin'
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm cột project_id nếu bảng test_comments đã tồn tại từ trước
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_comments' AND column_name='project_id') THEN
        ALTER TABLE public.test_comments ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. BẢNG TEST CASES TÙY CHỈNH & HIỆU ĐÍNH (Custom & Overridden Test Cases)
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

-- Thêm cột project_id nếu bảng test_cases_custom đã tồn tại từ trước
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_cases_custom' AND column_name='project_id') THEN
        ALTER TABLE public.test_cases_custom ADD COLUMN project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. BẢNG PHIÊN KIỂM THỬ (Sessions)
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

-- 8. BẢNG DANH MỤC PHÂN HỆ NGHIỆP VỤ (Modules)
CREATE TABLE IF NOT EXISTS public.test_modules (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

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
    -- RLS cho projects
    DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
    CREATE POLICY "Allow anon all on projects" ON public.projects
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho project_members
    DROP POLICY IF EXISTS "Allow anon all on project_members" ON public.project_members;
    CREATE POLICY "Allow anon all on project_members" ON public.project_members
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho test_runs
    DROP POLICY IF EXISTS "Allow anon all on test_runs" ON public.test_runs;
    CREATE POLICY "Allow anon all on test_runs" ON public.test_runs
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho test_results
    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    CREATE POLICY "Allow anon all on test_results" ON public.test_results
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho test_comments
    DROP POLICY IF EXISTS "Allow anon all on test_comments" ON public.test_comments;
    CREATE POLICY "Allow anon all on test_comments" ON public.test_comments
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho test_cases_custom
    DROP POLICY IF EXISTS "Allow anon all on test_cases_custom" ON public.test_cases_custom;
    CREATE POLICY "Allow anon all on test_cases_custom" ON public.test_cases_custom
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho test_sessions
    DROP POLICY IF EXISTS "Allow anon all on test_sessions" ON public.test_sessions;
    CREATE POLICY "Allow anon all on test_sessions" ON public.test_sessions
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- RLS cho test_modules
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
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    EXCEPTION WHEN duplicate_object THEN END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
    EXCEPTION WHEN duplicate_object THEN END;

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

-- Thông báo hoàn thành
SELECT 'Database Schema SQTM v3.0 (Multi-Project Enterprise) đã khởi tạo thành công!' AS result;
