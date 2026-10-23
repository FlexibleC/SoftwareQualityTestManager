-- ================================================================
-- HỆ THỐNG KIỂM THỬ SQTM - KÍCH HOẠT CHẾ ĐỘ CHUYỂN TIẾP (TRANSITIONAL RLS)
-- Giải quyết triệt để lỗi 401 Unauthorized trên trình duyệt web hiện tại
-- Chạy đoạn mã này trong Supabase SQL Editor (mất 2 giây)
-- ================================================================

DO $$
BEGIN
    -- 1. BẢNG test_sessions: Cho phép Trình duyệt lưu trạng thái đồng bộ
    DROP POLICY IF EXISTS "Allow anon read test_sessions" ON public.test_sessions;
    DROP POLICY IF EXISTS "Allow anon all on test_sessions" ON public.test_sessions;
    CREATE POLICY "Allow anon all on test_sessions" ON public.test_sessions
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 2. BẢNG test_results: Cho phép Tester chấm điểm Pass/Fail trực tiếp
    DROP POLICY IF EXISTS "Allow anon read test_results" ON public.test_results;
    DROP POLICY IF EXISTS "Allow anon all on test_results" ON public.test_results;
    CREATE POLICY "Allow anon all on test_results" ON public.test_results
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 3. BẢNG test_comments: Cho phép trao đổi thảo luận giữa QA và Dev
    DROP POLICY IF EXISTS "Allow anon read test_comments" ON public.test_comments;
    DROP POLICY IF EXISTS "Allow anon all on test_comments" ON public.test_comments;
    CREATE POLICY "Allow anon all on test_comments" ON public.test_comments
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 4. BẢNG test_cases_custom: Cho phép lưu trữ kịch bản kiểm thử
    DROP POLICY IF EXISTS "Allow anon read test_cases_custom" ON public.test_cases_custom;
    DROP POLICY IF EXISTS "Allow anon all on test_cases_custom" ON public.test_cases_custom;
    CREATE POLICY "Allow anon all on test_cases_custom" ON public.test_cases_custom
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 5. BẢNG projects: Cho phép tạo và cập nhật danh mục dự án
    DROP POLICY IF EXISTS "Allow anon read projects" ON public.projects;
    DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
    CREATE POLICY "Allow anon all on projects" ON public.projects
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 6. BẢNG project_members: Cho phép phân bổ nhân sự
    DROP POLICY IF EXISTS "Allow anon read project_members" ON public.project_members;
    DROP POLICY IF EXISTS "Allow anon all on project_members" ON public.project_members;
    CREATE POLICY "Allow anon all on project_members" ON public.project_members
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 7. BẢNG test_runs: Cho phép tạo đợt test
    DROP POLICY IF EXISTS "Allow anon read test_runs" ON public.test_runs;
    DROP POLICY IF EXISTS "Allow anon all on test_runs" ON public.test_runs;
    CREATE POLICY "Allow anon all on test_runs" ON public.test_runs
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 8. BẢNG test_modules: Cho phép quản lý phân hệ
    DROP POLICY IF EXISTS "Allow anon read test_modules" ON public.test_modules;
    DROP POLICY IF EXISTS "Allow anon all on test_modules" ON public.test_modules;
    CREATE POLICY "Allow anon all on test_modules" ON public.test_modules
        FOR ALL TO anon USING (true) WITH CHECK (true);

    -- 9. BẢNG app_users: VẪN ĐƯỢC KHÓA BẢO MẬT TUYỆT ĐỐI (Chỉ Backend mới được truy cập)
    DROP POLICY IF EXISTS "Allow anon all on app_users" ON public.app_users;
    DROP POLICY IF EXISTS "Deny anon access on app_users" ON public.app_users;
    CREATE POLICY "Deny anon access on app_users" ON public.app_users
        FOR ALL TO anon USING (false) WITH CHECK (false);
END $$;

-- Thông báo hoàn thành
SELECT '✅ Đã kích hoạt chế độ đồng bộ chuyển tiếp thành công! Website không còn bị lỗi 401.' AS result;
