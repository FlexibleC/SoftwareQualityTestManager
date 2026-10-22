/**
 * SEED ENTERPRISE PROJECTS & TEST DATA
 * Tạo dữ liệu mẫu chuẩn Enterprise cho SmartVMS, SmartParking, SmartAccess
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const vmsCatalog = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'SmartVMS_157_KichBan_ChuanHoa.json'), 'utf8'));
const parkCatalog = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'smartparking_test_catalog.json'), 'utf8'));
const accessCatalog = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'smartaccess_test_catalog.json'), 'utf8'));

const projects = [
  {
    id: 'PRJ-SMARTVMS',
    code: 'SMARTVMS',
    name: 'SmartVMS — Quản lý Khách & Ra vào',
    domain: 'An ninh Trụ sở & Cơ quan Hành chính',
    desc: 'Hệ thống quản lý khách ra vào, quét CCCD gắn chip và kiểm soát an ninh trụ sở tòa nhà.',
    lead: 'Hoàng Hải Đăng',
    leadUsername: 'lead',
    leadUsernames: ['lead', 'admin'],
    activeVersion: 'v2.0',
    standards: ['ISO 9001:2015', 'ISO/IEC/IEEE 29119', 'ISO/IEC 25010:2023'],
    versions: [
      { version: 'v2.0', label: 'v2.0-SingleSite 2026', status: 'ACTIVE', targetDate: '2026-11-30', changelog: 'Phiên bản triển khai chuẩn hóa 157 kịch bản E2E' },
      { version: 'v2.1', label: 'v2.1-Cloud MultiSite', status: 'IN_DEV', targetDate: '2026-12-30', changelog: 'Đồng bộ đám mây đa điểm' },
      { version: 'v1.5', label: 'v1.5-Legacy Standalone', status: 'RELEASED', targetDate: '2025-11-20', changelog: 'Phiên bản nghiệm thu đợt 1' }
    ],
    members: [
      { username: 'lead', name: 'Hoàng Hải Đăng', projectRole: 'lead', title: 'Quản trị viên dự án' },
      { username: 'tester', name: 'Nguyễn Văn Nam', projectRole: 'tester', title: 'Kiểm thử viên chính' },
      { username: 'tester2', name: 'Trần Thị Lan', projectRole: 'tester', title: 'Kiểm thử viên' },
      { username: 'dev', name: 'Trần Quốc Tuấn', projectRole: 'dev', title: 'Lập trình viên backend' }
    ],
    modules: vmsCatalog.modules || [],
    testCases: vmsCatalog.testCases || []
  },
  {
    id: 'PRJ-SMARTPARK',
    code: 'SMARTPARK',
    name: 'SmartParking — Quản lý Bãi xe & Nhận diện Biển số ANPR',
    domain: 'Giao thông Thông minh (ITS & Smart Parking)',
    desc: 'Kiểm soát bãi đỗ xe thông minh, tự động nhận diện biển số xe ANPR và điều khiển barie tốc độ cao.',
    lead: 'Hoàng Hải Đăng',
    leadUsername: 'lead',
    leadUsernames: ['lead', 'admin'],
    activeVersion: 'v1.2.0',
    standards: ['ISO 9001:2015', 'TCVN 13607:2023', 'ISO/IEC 25010'],
    versions: [
      { version: 'v1.2.0', label: 'v1.2.0-ANPR AutoBarrier', status: 'ACTIVE', targetDate: '2026-11-20', changelog: 'Tích hợp camera nhận diện biển số LPR' },
      { version: 'v1.0.0', label: 'v1.0.0-Base RFID', status: 'RELEASED', targetDate: '2026-03-15', changelog: 'Bản quẹt thẻ tầm gần' }
    ],
    members: [
      { username: 'lead', name: 'Hoàng Hải Đăng', projectRole: 'lead', title: 'Quản trị viên dự án' },
      { username: 'tester', name: 'Nguyễn Văn Nam', projectRole: 'tester', title: 'Kiểm thử viên' },
      { username: 'tester3', name: 'Lê Hoàng Minh', projectRole: 'tester', title: 'Kiểm thử viên' },
      { username: 'dev', name: 'Trần Quốc Tuấn', projectRole: 'dev', title: 'Lập trình viên' }
    ],
    modules: parkCatalog.modules || [],
    testCases: parkCatalog.testCases || []
  },
  {
    id: 'PRJ-SMARTACCESS',
    code: 'SMARTACCESS',
    name: 'SmartAccess — Kiểm soát Cửa Phân tầng & Thang máy',
    domain: 'Tự động hóa Tòa nhà (BMS & Access Control)',
    desc: 'Hệ thống kiểm soát cửa ra vào bảo mật cao, tích hợp sinh trắc học FaceID và điều khiển phân tầng thang máy.',
    lead: 'Hoàng Hải Đăng',
    leadUsername: 'lead',
    leadUsernames: ['lead', 'admin'],
    activeVersion: 'v1.0.0',
    standards: ['ISO 9001:2015', 'ISO/IEC 25010'],
    versions: [
      { version: 'v1.0.0', label: 'v1.0.0-Access & Elevator', status: 'ACTIVE', targetDate: '2026-11-25', changelog: 'Kiểm soát cửa phân tầng' }
    ],
    members: [
      { username: 'lead', name: 'Hoàng Hải Đăng', projectRole: 'lead', title: 'Quản trị viên dự án' },
      { username: 'tester2', name: 'Trần Thị Lan', projectRole: 'tester', title: 'Kiểm thử viên' },
      { username: 'dev', name: 'Trần Quốc Tuấn', projectRole: 'dev', title: 'Lập trình viên' }
    ],
    modules: accessCatalog.modules || [],
    testCases: accessCatalog.testCases || []
  }
];

// Test Cycles chuẩn hóa theo từng phiên bản (Không trùng lặp, không gán chéo)
const testCycles = [
  {
    id: 'CYC-SMARTVMS-01',
    name: 'Đợt 1 — Khảo sát Kiểm thử Toàn diện E2E',
    projectId: 'PRJ-SMARTVMS',
    version: 'v2.0',
    scopeType: 'ALL',
    status: 'ACTIVE',
    startDate: '2026-10-10',
    endDate: '2026-11-15',
    description: 'Thực thi 157 kịch bản kiểm thử E2E liên thông'
  },
  {
    id: 'CYC-SMARTVMS-02',
    name: 'Đợt 2 — Hồi quy & Nghiệm thu Trọng yếu',
    projectId: 'PRJ-SMARTVMS',
    version: 'v2.0',
    scopeType: 'FAILED_ONLY',
    status: 'ACTIVE',
    startDate: '2026-10-25',
    endDate: '2026-11-30',
    description: 'Tái kiểm thử các lỗi trọng yếu và nghiệm thu phiên bản v2.0'
  },
  {
    id: 'CYC-SMARTPARK-01',
    name: 'Đợt 1 — Thử nghiệm Nhận diện Biển số & Barie',
    projectId: 'PRJ-SMARTPARK',
    version: 'v1.2.0',
    scopeType: 'ALL',
    status: 'ACTIVE',
    startDate: '2026-10-12',
    endDate: '2026-11-20',
    description: 'Kiểm tra độ trễ nhận diện LPR và đóng mở barie tự động'
  },
  {
    id: 'CYC-SMARTPARK-V100-01',
    name: 'Đợt 1 — Kiểm thử Quẹt thẻ RFID Cơ sở',
    projectId: 'PRJ-SMARTPARK',
    version: 'v1.0.0',
    scopeType: 'ALL',
    status: 'CLOSED',
    startDate: '2026-02-10',
    endDate: '2026-03-10',
    description: 'Nghiệm thu tính năng đọc thẻ tầm gần và barie đóng mở cơ bản'
  },
  {
    id: 'CYC-SMARTACCESS-01',
    name: 'Đợt 1 — Thử nghiệm Quẹt thẻ & Phân tầng Thang máy',
    projectId: 'PRJ-SMARTACCESS',
    version: 'v1.0.0',
    scopeType: 'ALL',
    status: 'ACTIVE',
    startDate: '2026-10-15',
    endDate: '2026-11-25',
    description: 'Kiểm tra tích hợp phân tầng thang máy qua rơ-le điều khiển'
  }
];

// Danh sách phân công và kết quả thực thi
const assignments = [];
const results = {};
const cycleResults = {
  'CYC-SMARTVMS-01': {},
  'CYC-SMARTVMS-02': {},
  'CYC-SMARTPARK-01': {},
  'CYC-SMARTPARK-V100-01': {},
  'CYC-SMARTACCESS-01': {}
};

// 1. Phân công cho SmartVMS - Đợt 1 (v2.0)
const vmsTcs = vmsCatalog.testCases || [];
vmsTcs.forEach((tc, idx) => {
  const isAssigned = idx < 95; // 95 bài được giao trong đợt 1
  if (isAssigned) {
    const assignee = idx % 2 === 0 ? 'tester' : 'tester2';
    const assigneeName = idx % 2 === 0 ? 'Nguyễn Văn Nam' : 'Trần Thị Lan';
    assignments.push({
      id: `asg-vms-${idx + 1}`,
      projectId: 'PRJ-SMARTVMS',
      tcId: tc.id,
      assigneeUsername: assignee,
      assigneeName: assigneeName,
      cycleId: 'CYC-SMARTVMS-01',
      version: 'v2.0',
      priority: tc.priority || 'P2',
      module: tc.module,
      status: idx < 65 ? (idx % 8 === 0 ? 'FAIL' : 'PASS') : 'NOT_RUN',
      startDate: '2026-10-12',
      dueDate: '2026-10-28',
      createdAt: '2026-10-12'
    });

    if (idx < 65) {
      const isFail = idx % 8 === 0;
      const compoundKey = `PRJ-SMARTVMS__${tc.id}`;
      const resItem = {
        projectId: 'PRJ-SMARTVMS',
        tcId: tc.id,
        status: isFail ? 'Fail' : 'Pass',
        failReason: isFail ? `Lỗi kiểm thử: Dữ liệu phản hồi không đúng tại bước kiểm thử ${tc.id}` : '',
        severity: isFail ? (idx % 16 === 0 ? 'Critical' : 'Major') : '',
        defectStatus: isFail ? (idx % 24 === 0 ? 'Reopened' : (idx % 16 === 0 ? 'Fixed' : 'In Progress')) : 'None',
        assignedDev: isFail ? 'Trần Quốc Tuấn' : '',
        tester: assigneeName,
        runAt: '2026-10-15T09:30:00.000Z',
        cycleId: 'CYC-SMARTVMS-01',
        devNotes: isFail ? 'Đã tiếp nhận và đang tiến hành kiểm tra mã nguồn' : ''
      };
      results[compoundKey] = resItem;
      results[tc.id] = resItem;
      cycleResults['CYC-SMARTVMS-01'][tc.id] = resItem;
    }
  }
});

// 2. Phân công cho SmartVMS - Đợt 2 (v2.0: Hồi quy & Nghiệm thu trọng yếu)
// Gồm 12 bài giao cho Tester Nam (tái kiểm thử các lỗi và kịch bản trọng yếu)
const vmsRound2TcIds = [
  'TC-AUTH-001', 'TC-CKIN-003', 'TC-GRP-002', 'TC-GRP-010',
  'TC-COUT-007', 'TC-DASH-007', 'TC-DASH-013', 'TC-VDET-002',
  'TC-DENT-001', 'TC-DENT-003', 'TC-DENT-005', 'TC-DENT-007'
];
vmsRound2TcIds.forEach((tcId, idx) => {
  const origTc = vmsTcs.find(t => t.id === tcId) || { module: 'M01', priority: 'P1' };
  assignments.push({
    id: `asg-vms-r2-${idx + 1}`,
    projectId: 'PRJ-SMARTVMS',
    tcId: tcId,
    assigneeUsername: 'tester',
    assigneeName: 'Nguyễn Văn Nam',
    cycleId: 'CYC-SMARTVMS-02',
    version: 'v2.0',
    priority: origTc.priority || 'P1',
    module: origTc.module || 'M01',
    status: idx < 3 ? 'PASS' : 'NOT_RUN',
    startDate: '2026-10-25',
    dueDate: '2026-11-20',
    createdAt: '2026-10-25'
  });
  if (idx < 3) {
    const rItem = {
      projectId: 'PRJ-SMARTVMS',
      tcId: tcId,
      status: 'Pass',
      failReason: '',
      severity: '',
      defectStatus: 'Closed',
      assignedDev: 'Trần Quốc Tuấn',
      tester: 'Nguyễn Văn Nam',
      runAt: '2026-10-26T14:20:00.000Z',
      cycleId: 'CYC-SMARTVMS-02',
      devNotes: 'Tester đã xác nhận lỗi khắc phục thành công'
    };
    cycleResults['CYC-SMARTVMS-02'][tcId] = rItem;
  }
});

// 3. Phân công cho SmartParking - Phiên bản v1.2.0 (Đợt 1: 3 bài giao cho Tester Nam)
const parkV120Tcs = [
  { id: 'TC-PARK-001', module: 'PK01', priority: 'P1', status: 'PASS', defStatus: 'None' },
  { id: 'TC-PARK-003', module: 'PK02', priority: 'P1', status: 'FAIL', defStatus: 'Fixed' },
  { id: 'TC-PARK-004', module: 'PK02', priority: 'P1', status: 'NOT_RUN', defStatus: 'None' }
];
parkV120Tcs.forEach((item, idx) => {
  assignments.push({
    id: `asg-park-v120-${idx + 1}`,
    projectId: 'PRJ-SMARTPARK',
    tcId: item.id,
    assigneeUsername: 'tester',
    assigneeName: 'Nguyễn Văn Nam',
    cycleId: 'CYC-SMARTPARK-01',
    version: 'v1.2.0',
    priority: item.priority,
    module: item.module,
    status: item.status,
    startDate: '2026-10-12',
    dueDate: '2026-11-20',
    createdAt: '2026-10-12'
  });
  if (item.status !== 'NOT_RUN') {
    const isFail = item.status === 'FAIL';
    const compoundKey = `PRJ-SMARTPARK__${item.id}`;
    const pRes = {
      projectId: 'PRJ-SMARTPARK',
      tcId: item.id,
      status: isFail ? 'Fail' : 'Pass',
      failReason: isFail ? 'Camera chụp chậm 1.2s dẫn tới xe dừng đột ngột' : '',
      severity: isFail ? 'Critical' : '',
      defectStatus: item.defStatus,
      assignedDev: isFail ? 'Trần Quốc Tuấn' : '',
      tester: 'Nguyễn Văn Nam',
      runAt: '2026-10-16T10:00:00.000Z',
      cycleId: 'CYC-SMARTPARK-01',
      devNotes: isFail ? 'Đã tối ưu luồng buffer OpenCV, đề nghị tester re-test' : ''
    };
    results[compoundKey] = pRes;
    results[item.id] = pRes;
    cycleResults['CYC-SMARTPARK-01'][item.id] = pRes;
  }
});

// 4. Phân công cho SmartParking - Phiên bản v1.0.0 (Đợt 1: 2 bài giao cho Tester Nam)
const parkV100Tcs = [
  { id: 'TC-PARK-001', module: 'PK01', priority: 'P1', status: 'PASS' },
  { id: 'TC-PARK-002', module: 'PK01', priority: 'P2', status: 'PASS' }
];
parkV100Tcs.forEach((item, idx) => {
  assignments.push({
    id: `asg-park-v100-${idx + 1}`,
    projectId: 'PRJ-SMARTPARK',
    tcId: item.id,
    assigneeUsername: 'tester',
    assigneeName: 'Nguyễn Văn Nam',
    cycleId: 'CYC-SMARTPARK-V100-01',
    version: 'v1.0.0',
    priority: item.priority,
    module: item.module,
    status: item.status,
    startDate: '2026-02-10',
    dueDate: '2026-03-10',
    createdAt: '2026-02-10'
  });
  const compoundKey = `PRJ-SMARTPARK__${item.id}__V100`;
  const pRes = {
    projectId: 'PRJ-SMARTPARK',
    tcId: item.id,
    status: 'Pass',
    failReason: '',
    severity: '',
    defectStatus: 'None',
    assignedDev: '',
    tester: 'Nguyễn Văn Nam',
    runAt: '2026-02-20T08:30:00.000Z',
    cycleId: 'CYC-SMARTPARK-V100-01',
    devNotes: ''
  };
  results[compoundKey] = pRes;
  cycleResults['CYC-SMARTPARK-V100-01'][item.id] = pRes;
});

// 5. Phân công cho SmartAccess - Phiên bản v1.0.0 (Đợt 1: 2 bài giao cho Tester Nam)
const accessV100Tcs = [
  { id: 'TC-ACC-001', module: 'AC01', priority: 'P1', status: 'PASS' },
  { id: 'TC-ACC-002', module: 'AC03', priority: 'P1', status: 'NOT_RUN' }
];
accessV100Tcs.forEach((item, idx) => {
  assignments.push({
    id: `asg-acc-v100-${idx + 1}`,
    projectId: 'PRJ-SMARTACCESS',
    tcId: item.id,
    assigneeUsername: 'tester',
    assigneeName: 'Nguyễn Văn Nam',
    cycleId: 'CYC-SMARTACCESS-01',
    version: 'v1.0.0',
    priority: item.priority,
    module: item.module,
    status: item.status,
    startDate: '2026-10-15',
    dueDate: '2026-11-25',
    createdAt: '2026-10-15'
  });
  if (item.status === 'PASS') {
    const compoundKey = `PRJ-SMARTACCESS__${item.id}`;
    const aRes = {
      projectId: 'PRJ-SMARTACCESS',
      tcId: item.id,
      status: 'Pass',
      failReason: '',
      severity: '',
      defectStatus: 'None',
      assignedDev: '',
      tester: 'Nguyễn Văn Nam',
      runAt: '2026-10-18T10:00:00.000Z',
      cycleId: 'CYC-SMARTACCESS-01',
      devNotes: ''
    };
    results[compoundKey] = aRes;
    results[item.id] = aRes;
    cycleResults['CYC-SMARTACCESS-01'][item.id] = aRes;
  }
});

// Ghi file JSON cho server.js
const statePayload = {
  updatedAt: new Date().toISOString(),
  totalProjects: projects.length,
  projects: projects,
  testCycles: testCycles,
  assignments: assignments,
  results: results,
  cycleResults: cycleResults
};

fs.writeFileSync(
  path.join(rootDir, 'data', 'projects_state.json'),
  JSON.stringify(statePayload, null, 2),
  'utf8'
);

// Ghi file JS cho client
const manifestContent = `/* Enterprise Projects Manifest for SmartVMS Platform - Dynamic Database-First Mode */
window.OPENQAS_ENTERPRISE_MANIFEST = ${JSON.stringify({
  activeProjectId: 'PRJ-SMARTVMS',
  projects: projects,
  testCycles: testCycles,
  assignments: assignments,
  results: results,
  cycleResults: cycleResults
}, null, 2)};
`;

fs.writeFileSync(
  path.join(rootDir, 'data', 'enterprise_projects_manifest.js'),
  manifestContent,
  'utf8'
);

console.log('Seeded successfully:', projects.length, 'projects with 157 test cases,', testCycles.length, 'cycles,', assignments.length, 'assignments,', Object.keys(results).length, 'results.');
