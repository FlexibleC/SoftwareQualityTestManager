/**
 * SOFTWARE QUALITY & TEST MANAGEMENT SYSTEM (SQTM v3.0)
 * MODULE: ADMIN EXECUTIVE QUALITY ANALYTICS & PORTFOLIO HEALTH ENGINE
 * Tiêu chuẩn: ISO/IEC/IEEE 29119-3:2021 & ISO/IEC 25010:2023
 */

const AdminAnalytics = {
  /**
   * Tính toán sức khỏe chi tiết của một dự án đơn lẻ
   */
  calculateProjectHealth(project) {
    if (!project) return null;
    const pId = project.id;
    const tcs = project.testCases || [];
    const totalTcs = tcs.length;

    // Lấy danh sách kết quả kiểm thử thuộc dự án này
    let passed = 0;
    let failed = 0;
    let blocked = 0;
    let notRun = 0;
    let skipped = 0;

    tcs.forEach(tc => {
      const res = getResultForTc(tc.id, pId);
      if (!res || !res.status || res.status === 'Not Run') {
        notRun++;
      } else if (res.status === 'Pass' || res.status === 'PASSED') {
        passed++;
      } else if (res.status === 'Fail' || res.status === 'FAILED') {
        failed++;
      } else if (res.status === 'Blocked' || res.status === 'BLOCKED') {
        blocked++;
      } else if (res.status === 'Skip' || res.status === 'SKIP') {
        skipped++;
      } else {
        notRun++;
      }
    });

    const executed = passed + failed + blocked + skipped;
    const progressPercent = totalTcs > 0 ? Math.round((executed / totalTcs) * 100) : 0;
    const passRatePercent = executed > 0 ? Math.round((passed / executed) * 100) : 0;

    // Lấy danh sách lỗi (Defects) của dự án
    const defects = typeof getProjectDefects === 'function' ? getProjectDefects(pId) : [];
    
    // Đếm lỗi theo trạng thái và mức độ
    let openBlockers = 0;
    let openCriticals = 0;
    let openMajors = 0;
    let openMinors = 0;
    let fixedAwaitingRetest = 0;
    let closedDefects = 0;

    defects.forEach(d => {
      const st = d.defectStatus || 'New';
      const isOpen = st !== 'Closed' && st !== 'Resolved' && st !== 'Retest Passed';
      const isFixed = st === 'Fixed' || st === 'Resolved';

      if (isFixed) fixedAwaitingRetest++;
      if (st === 'Closed' || st === 'Retest Passed') closedDefects++;

      if (isOpen) {
        const sev = (d.severity || 'Critical').toUpperCase();
        if (sev === 'BLOCKER') openBlockers++;
        else if (sev === 'CRITICAL') openCriticals++;
        else if (sev === 'MAJOR') openMajors++;
        else openMinors++;
      }
    });

    // Kiểm tra nhân sự phụ trách
    const members = typeof getProjectMembers === 'function' ? getProjectMembers(pId) : (project.members || []);
    const leadMember = members.find(m => m.projectRole === 'lead' || m.projectRole === 'admin') || { name: 'Chưa chỉ định' };
    const testerMembers = members.filter(m => m.projectRole === 'tester');
    const devMembers = members.filter(m => m.projectRole === 'dev');
    const hasTester = testerMembers.length > 0;

    // THUẬT TOÁN ĐÁNH GIÁ SỨC KHỎE (HEALTH SCORE)
    let healthStatus = 'GOOD'; // 'GOOD' (🟢) | 'WARNING' (🟡) | 'CRITICAL' (🔴)
    let healthReasons = [];

    if (totalTcs === 0) {
      healthStatus = 'WARNING';
      healthReasons.push('Chưa nạp kịch bản kiểm thử nào (0 TCs).');
    } else if (!hasTester) {
      healthStatus = 'CRITICAL';
      healthReasons.push('Chưa được Super Admin phân bổ Tester vào dự án.');
    } else if (openBlockers > 0) {
      healthStatus = 'CRITICAL';
      healthReasons.push(`Có ${openBlockers} lỗi Blocker nghiêm trọng đang chặn kiểm thử.`);
    } else if (openCriticals > 1) {
      healthStatus = 'CRITICAL';
      healthReasons.push(`Có ${openCriticals} lỗi Critical chưa được giải quyết.`);
    } else if (executed > 0 && (failed / executed) > 0.20) {
      healthStatus = 'CRITICAL';
      healthReasons.push(`Tỷ lệ lỗi quá cao (${Math.round((failed / executed) * 100)}% thất bại).`);
    } else if (openCriticals === 1 || openMajors > 2) {
      healthStatus = 'WARNING';
      healthReasons.push('Còn lỗi Critical hoặc nhiều lỗi Major chưa đóng.');
    } else if (progressPercent < 50 && totalTcs > 20) {
      healthStatus = 'WARNING';
      healthReasons.push(`Tiến độ thực thi còn chậm (${progressPercent}%).`);
    } else if (passRatePercent < 85 && executed > 0) {
      healthStatus = 'WARNING';
      healthReasons.push(`Tỷ lệ đạt chưa đạt chuẩn 85% (${passRatePercent}% Pass).`);
    } else {
      healthStatus = 'GOOD';
      healthReasons.push('Chất lượng kiểm thử ổn định, không có lỗi nghiêm trọng.');
    }

    // CỔNG ĐÁNH GIÁ PHÁT HÀNH (RELEASE READINESS GATE)
    let releaseGate = 'IN_PROGRESS'; // 'GO' | 'NO_GO' | 'IN_PROGRESS'
    if (totalTcs > 0 && progressPercent >= 90 && passRatePercent >= 90 && openBlockers === 0 && openCriticals === 0) {
      releaseGate = 'GO';
    } else if (openBlockers > 0 || (executed > 10 && passRatePercent < 75)) {
      releaseGate = 'NO_GO';
    } else {
      releaseGate = 'IN_PROGRESS';
    }

    // TÍNH ĐIỂM SỨC KHỎE (HEALTH SCORE / 100)
    let score = 100;
    if (healthStatus === 'CRITICAL') {
      score = Math.max(25, Math.min(59, Math.round((passRatePercent || 0) * 0.5)));
    } else if (healthStatus === 'WARNING') {
      score = Math.max(60, Math.min(79, Math.round(passRatePercent || 70)));
    } else {
      score = Math.max(80, Math.min(100, passRatePercent || 95));
    }

    const goLiveGate = {
      decision: releaseGate,
      criteria: {
        noCriticalDefects: openBlockers === 0 && openCriticals === 0,
        passRateAcceptable: passRatePercent >= 90,
        executionCoverageAcceptable: progressPercent >= 95,
        noReopenedDefects: (defects.filter(d => d.defectStatus === 'Reopened').length === 0)
      },
      failedReasons: healthReasons
    };

    return {
      projectId: pId,
      code: project.code || 'PRJ',
      name: project.name || 'Dự án',
      activeVersion: project.activeVersion || 'v1.0',
      totalTcs,
      executed,
      passed,
      failed,
      blocked,
      skipped,
      notRun,
      progressPercent,
      passRatePercent,
      openBlockers,
      openCriticals,
      openMajors,
      openMinors,
      fixedAwaitingRetest,
      closedDefects,
      totalDefects: defects.length,
      leadName: leadMember.name,
      testerCount: testerMembers.length,
      devCount: devMembers.length,
      healthStatus,
      healthReasons,
      score,
      releaseGate,
      goLiveGate,
      status: project.status || 'ACTIVE'
    };
  },

  /**
   * Tính toán toàn bộ chỉ số vĩ mô cho toàn bộ hệ sinh thái danh mục
   */
  getExecutivePortfolioMetrics() {
    const projects = typeof getAllProjects === 'function' ? getAllProjects() : (state.projects || []);
    const projectSummaries = projects.map(p => this.calculateProjectHealth(p)).filter(Boolean);

    let totalProjects = projects.length;
    let activeProjects = 0;
    let healthGoodCount = 0;
    let healthWarningCount = 0;
    let healthCriticalCount = 0;

    let totalTcs = 0;
    let totalExecuted = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalBlocked = 0;
    let totalOpenBlockers = 0;
    let totalOpenCriticals = 0;
    let totalAwaitingRetest = 0;
    let readyToGoLiveCount = 0;

    projectSummaries.forEach(ps => {
      if (ps.status !== 'ARCHIVED') activeProjects++;
      if (ps.healthStatus === 'GOOD') healthGoodCount++;
      else if (ps.healthStatus === 'WARNING') healthWarningCount++;
      else if (ps.healthStatus === 'CRITICAL') healthCriticalCount++;

      if (ps.releaseGate === 'GO') readyToGoLiveCount++;

      totalTcs += ps.totalTcs;
      totalExecuted += ps.executed;
      totalPassed += ps.passed;
      totalFailed += ps.failed;
      totalBlocked += ps.blocked;
      totalOpenBlockers += ps.openBlockers;
      totalOpenCriticals += ps.openCriticals;
      totalAwaitingRetest += ps.fixedAwaitingRetest;
    });

    const avgPassRate = totalExecuted > 0 ? Math.round((totalPassed / totalExecuted) * 100) : 0;
    const avgProgress = totalTcs > 0 ? Math.round((totalExecuted / totalTcs) * 100) : 0;

    // DANH SÁCH CẢNH BÁO RỦI RO NÓNG (URGENT RISK WATCHLIST)
    const urgentRiskWatchlist = [];

    projectSummaries.forEach(ps => {
      if (ps.openBlockers > 0) {
        urgentRiskWatchlist.push({
          type: 'BLOCKER',
          severity: 'DANGER',
          projectId: ps.projectId,
          projectName: ps.name,
          message: `Dự án [${ps.code}] phát hiện ${ps.openBlockers} lỗi BLOCKER đang chặn tiến độ kiểm thử!`
        });
      }
      if (ps.totalTcs > 0 && ps.testerCount === 0) {
        urgentRiskWatchlist.push({
          type: 'NO_TESTER',
          severity: 'WARNING',
          projectId: ps.projectId,
          projectName: ps.name,
          message: `Dự án [${ps.code}] có ${ps.totalTcs} kịch bản nhưng chưa được Super Admin phân bổ Tester phụ trách.`
        });
      }
      if (ps.fixedAwaitingRetest > 2) {
        urgentRiskWatchlist.push({
          type: 'AWAIT_RETEST',
          severity: 'INFO',
          projectId: ps.projectId,
          projectName: ps.name,
          message: `Dự án [${ps.code}] có ${ps.fixedAwaitingRetest} lỗi đã được Dev sửa xong, đang chờ Tester kiểm thử lại (Re-test).`
        });
      }
    });

    const totalStaff = (state.users && state.users.length > 0) ? state.users.length : DEFAULT_SYSTEM_USERS.length;

    return {
      totalProjects,
      activeProjects,
      healthGoodCount,
      healthWarningCount,
      healthCriticalCount,
      readyToGoLiveCount,
      totalTcs,
      totalExecuted,
      totalPassed,
      totalFailed,
      totalBlocked,
      totalOpenBlockers,
      totalOpenCriticals,
      totalAwaitingRetest,
      avgPassRate,
      avgProgress,
      totalStaff,
      projectSummaries,
      urgentRiskWatchlist
    };
  },

  /**
   * Tính toán ma trận cân bằng tải nhân lực (Resource Workload Heatmap)
   */
  getStaffWorkloadMetrics() {
    const allUsers = (state.users && state.users.length > 0) ? state.users : DEFAULT_SYSTEM_USERS;
    const assignments = state.assignments || [];
    const projects = state.projects || [];

    const staffList = allUsers.map(user => {
      const username = user.username;
      
      // Đếm số dự án mà user là thành viên
      const userProjects = projects.filter(p => {
        const mems = p.members || [];
        return mems.some(m => m.username === username);
      });

      // Đếm số kịch bản được phân công
      const myAsgs = assignments.filter(a => a.assigneeUsername === username || (username === 'tester' && !a.assigneeUsername));
      const totalTasks = myAsgs.length;
      const completedTasks = myAsgs.filter(a => a.status && a.status !== 'Not Run').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Phân loại tải trọng
      let loadStatus = 'BALANCED'; // 'OVERLOADED' (🔴) | 'BALANCED' (🟢) | 'UNDERUTILIZED' (⚪)
      if (totalTasks > 100 || userProjects.length >= 4) {
        loadStatus = 'OVERLOADED';
      } else if (totalTasks < 25 && userProjects.length <= 1) {
        loadStatus = 'UNDERUTILIZED';
      } else {
        loadStatus = 'BALANCED';
      }

      return {
        id: user.id,
        username,
        name: user.name,
        role: user.role,
        roleTitle: user.roleTitle || user.role,
        projectCount: userProjects.length,
        projects: userProjects.map(p => ({ id: p.id, code: p.code, name: p.name })),
        totalTasks,
        completedTasks,
        completionRate,
        loadStatus
      };
    });

    return staffList;
  }
};

// Export toàn cục
if (typeof window !== 'undefined') {
  window.AdminAnalytics = AdminAnalytics;
}
