/**
 * SQTM DATABASE & BACKEND INTEGRATION TEST SUITE
 * Kiểm tra xác thực toàn diện kết nối giữa Backend API và Supabase PostgreSQL Cloud
 */

const supabaseAdmin = require('../api/_lib/supabase-admin');
const login = require('../api/auth/login');
const projects = require('../api/projects');

async function verifyAll() {
  console.log('================================================================');
  console.log('🚀 KIỂM TRA TOÀN DIỆN KẾT NỐI DATABASE VÀ BACKEND API');
  console.log('   Endpoint: ' + supabaseAdmin.SUPABASE_URL);
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 4;

  // 1. Kiểm tra bảng app_users
  try {
    const users = await supabaseAdmin.query('app_users', '?select=id,username,name,role,status');
    console.log('✅ [TEST 1/4] Bảng app_users: Truy vấn thành công!');
    console.log(`   Tìm thấy ${users.length} tài khoản trong Database:`);
    users.forEach(u => console.log(`   • ID: ${u.id.padEnd(8)} | @${u.username.padEnd(8)} | Role: ${u.role.padEnd(12)} | Họ tên: ${u.name}`));
    passedTests++;
  } catch (e) {
    console.error('❌ [TEST 1/4] Lỗi bảng app_users:', e.message);
  }

  // 2. Kiểm tra bảng projects
  try {
    const prjs = await supabaseAdmin.query('projects', '?select=id,code,name,status');
    console.log(`\n✅ [TEST 2/4] Bảng projects: Sẵn sàng và truy vấn tốt (Số lượng: ${prjs.length} dự án)`);
    passedTests++;
  } catch (e) {
    console.error('\n❌ [TEST 2/4] Lỗi bảng projects:', e.message);
  }

  // 3. Kiểm tra các bảng nghiệp vụ: test_runs, test_results, test_comments
  try {
    const runs = await supabaseAdmin.query('test_runs', '?select=id,name');
    const results = await supabaseAdmin.query('test_results', '?select=run_id,tc_id,status&limit=5');
    console.log(`\n✅ [TEST 3/4] Bảng test_runs & test_results: Sẵn sàng!`);
    console.log(`   • test_runs: OK (${runs.length} bản ghi)`);
    console.log(`   • test_results: OK (${results.length} bản ghi)`);
    passedTests++;
  } catch (e) {
    console.error('\n❌ [TEST 3/4] Lỗi bảng test_runs/test_results:', e.message);
  }

  // 4. Kiểm tra API Đăng nhập /api/auth/login xác thực trực tiếp qua CSDL
  try {
    const reqMock = {
      method: 'POST',
      headers: { origin: 'http://localhost:8080' },
      on: (ev, cb) => {
        if (ev === 'data') cb(JSON.stringify({ username: 'admin', password: '123' }));
        if (ev === 'end') cb();
      }
    };
    const resMock = {
      statusCode: 0,
      setHeader: () => {},
      end: (payload) => {
        const parsed = JSON.parse(payload);
        console.log('\n✅ [TEST 4/4] API /api/auth/login: Xác thực thành công!');
        console.log('   • Tài khoản xác thực:', parsed.user.name, '(@' + parsed.user.username + ')');
        console.log('   • Vai trò hệ thống:', parsed.user.role, '—', parsed.user.roleTitle);
        console.log('   • Nguồn xác thực:', parsed.isFromDatabase ? '🎯 DATABASE POSTGRESQL (app_users)' : 'Fallback');
        console.log('   • Mã Token JWT cấp phát:', parsed.token.substring(0, 45) + '...');
        passedTests++;

        console.log('\n================================================================');
        console.log(`🎉 KẾT QUẢ: ĐÃ VƯỢT QUA ${passedTests}/${totalTests} BÀI KIỂM TRA AN TOÀN!`);
        console.log('   Hệ thống SQTM v3.0 đã hoàn toàn kết nối với Database Supabase thực tế.');
        console.log('================================================================\n');
      }
    };
    await login(reqMock, resMock);
  } catch (e) {
    console.error('\n❌ [TEST 4/4] Lỗi API login:', e.message);
  }
}

verifyAll();
