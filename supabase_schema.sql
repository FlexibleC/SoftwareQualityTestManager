-- ================================================================
-- SmartVMS Test Manager — Supabase Database Schema (PostgreSQL)
-- Phiên bản: v2.0 | Hỗ trợ Realtime Sync đa người dùng
-- Hướng dẫn: Copy toàn bộ nội dung file này và Paste vào SQL Editor
-- trên Supabase Dashboard (https://supabase.com/dashboard) rồi bấm RUN.
-- ================================================================

-- 1. BẢNG KẾT QUẢ KIỂM THỬ (Test Results)
CREATE TABLE IF NOT EXISTS public.test_results (
    tc_id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('Pass', 'Fail', 'Skip', 'Not Run')),
    tester TEXT,
    run_at TIMESTAMPTZ,
    fail_reason TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG TEST CASES TÙY CHỈNH & HIỆU ĐÍNH (Custom & Overridden Test Cases)
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

-- 3. BẢNG PHIÊN KIỂM THỬ (Test Sessions)
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id TEXT PRIMARY KEY DEFAULT 'current',
    name TEXT NOT NULL,
    owner TEXT,
    version TEXT DEFAULT 'SmartVMS Local v2.0',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG DANH MỤC MODULES (Custom Modules)
CREATE TABLE IF NOT EXISTS public.test_modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Cho phép truy cập đọc/ghi an toàn bằng Supabase Public Anon Key
-- ================================================================

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_modules ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép mọi client có Anon Key được SELECT, INSERT, UPDATE, DELETE
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    CREATE POLICY "Allow anon all on test_results" ON public.test_results
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
-- KÍCH HOẠT SUPABASE REALTIME (Tự động đồng bộ thay đổi giữa các máy)
-- ================================================================
DO $$
BEGIN
    -- Thêm các bảng vào danh sách broadcast Realtime của Supabase
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;
    EXCEPTION WHEN duplicate_object THEN
        -- Bỏ qua nếu bảng đã có trong publication
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_cases_custom;
    EXCEPTION WHEN duplicate_object THEN
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.test_sessions;
    EXCEPTION WHEN duplicate_object THEN
    END;
END $$;

-- ================================================================
-- TỰ ĐỘNG CẬP NHẬT CỘT updated_at KHI CÓ THAY ĐỔI
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_test_results_updated_at ON public.test_results;
CREATE TRIGGER tr_test_results_updated_at
    BEFORE UPDATE ON public.test_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_test_cases_updated_at ON public.test_cases_custom;
CREATE TRIGGER tr_test_cases_updated_at
    BEFORE UPDATE ON public.test_cases_custom
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_test_sessions_updated_at ON public.test_sessions;
CREATE TRIGGER tr_test_sessions_updated_at
    BEFORE UPDATE ON public.test_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Thông báo hoàn thành
SELECT 'Database Schema SmartVMS Test Manager đã khởi tạo thành công!' AS result;
