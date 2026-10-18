/**
 * SMARTVMS QA HUB - CLOUD SYNC & REALTIME COLLABORATION MODULE
 * Standard: ISO/IEC/IEEE 29119-3 Audit Trail & Distributed Multi-Tester Sync
 * Backend: Supabase PostgreSQL Cloud + Supabase Realtime Channels
 * Hosting: Vercel Cloud (Online Internet) & Local LAN Kestrel/Node Server
 */

(function (window) {
  'use strict';

  const CLOUD_STORAGE_KEY = 'smartvms_supabase_config';
  const DEFAULT_SB_URL = 'https://ilutfoarcrqxsgoapkct.supabase.co';
  const DEFAULT_SB_KEY = 'sb_publishable_GiS2f75ruddsLkZhoHsq7g__LO1Qp-C';
  const DEFAULT_RUN_ID = 'run_001';

  // State Cloud Sync
  const cloudState = {
    client: null,
    channel: null,
    status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'error' | 'offline'
    lastSyncTime: null,
    cloudRecordCount: 0,
    config: {
      url: DEFAULT_SB_URL,
      anonKey: DEFAULT_SB_KEY,
      autoSync: true,
      realtime: true
    },
    offlineQueue: []
  };

  // 1. Tải cấu hình từ localStorage
  function loadCloudConfig() {
    try {
      const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        cloudState.config.url = (parsed.url || DEFAULT_SB_URL).replace(/\/+$/, '').trim();
        cloudState.config.anonKey = (parsed.anonKey || DEFAULT_SB_KEY).trim();
        cloudState.config.autoSync = parsed.autoSync !== false;
        cloudState.config.realtime = parsed.realtime !== false;
      }
    } catch (e) {
      console.warn('Lỗi đọc cấu hình Cloud:', e);
    }
  }

  function saveCloudConfig(url, key, autoSync, realtime) {
    cloudState.config.url = (url || DEFAULT_SB_URL).replace(/\/+$/, '').trim();
    cloudState.config.anonKey = (key || DEFAULT_SB_KEY).trim();
    cloudState.config.autoSync = autoSync !== false;
    cloudState.config.realtime = realtime !== false;
    try {
      localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(cloudState.config));
    } catch (e) {
      console.error('Lỗi lưu cấu hình Cloud:', e);
    }
  }

  // 2. Tự nạp SDK Supabase JS nếu trang chưa nhúng CDN
  function ensureSupabaseSdkLoaded() {
    return new Promise((resolve) => {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        return resolve(true);
      }
      // Inject CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        resolve(typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function');
      };
      script.onerror = () => {
        console.warn('Không thể tải Supabase JS SDK từ CDN jsdelivr. Vui lòng kiểm tra kết nối mạng.');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  // 3. Khởi tạo Client Supabase & Kết nối
  async function initCloudSync(silent = true) {
    loadCloudConfig();
    updateCloudStatusUI('connecting', 'Đang nối Cloud...');

    const sdkOk = await ensureSupabaseSdkLoaded();
    if (!sdkOk) {
      updateCloudStatusUI('error', 'Chưa có SDK Supabase');
      if (!silent && window.showToast) {
        window.showToast('⚠️ Không thể tải thư viện Supabase SDK từ mạng Internet!', 'error');
      }
      return false;
    }

    try {
      cloudState.client = window.supabase.createClient(cloudState.config.url, cloudState.config.anonKey, {
        auth: { persistSession: false }
      });

      // Kiểm tra Ping tới bảng test_results
      const { count, error } = await cloudState.client
        .from('test_results')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Supabase query error:', error);
        updateCloudStatusUI('error', 'Lỗi truy vấn Cloud');
        if (!silent && window.showToast) {
          window.showToast(`❌ Lỗi kết nối Supabase Cloud: ${error.message}`, 'error');
        }
        return false;
      }

      cloudState.cloudRecordCount = count || 0;
      updateCloudStatusUI('connected', `Cloud: Realtime (${cloudState.cloudRecordCount})`);

      // Lắng nghe Realtime
      if (cloudState.config.realtime) {
        subscribeRealtimeChanges();
      }

      // 1. Kéo trạng thái Dự án (Projects), Đợt test (Cycles), Phân công (Assignments) từ Database Cloud
      await pullCloudProjectState({ silent: true });

      // 2. Kéo danh mục kịch bản từ Database Cloud về (Database là Single Source of Truth)
      await pullCloudCatalog({ silent: true });

      // 3. Kéo dữ liệu Cloud mới nhất về (Auto-Pull)
      if (cloudState.config.autoSync) {
        await pullCloudResults({ silent: true });
      }

      // Xử lý hàng đợi Offline nếu có
      flushOfflineQueue();

      if (!silent && window.showToast) {
        window.showToast(`⚡ Đã kết nối Supabase Cloud thành công! (${cloudState.cloudRecordCount} kết quả)`, 'success');
      }

      return true;
    } catch (err) {
      console.error('Lỗi khởi tạo Supabase Cloud:', err);
      updateCloudStatusUI('error', 'Lỗi khởi tạo');
      if (!silent && window.showToast) {
        window.showToast(`❌ Lỗi kết nối Cloud: ${err.message}`, 'error');
      }
      return false;
    }
  }

  // 4. Lắng nghe Realtime qua Supabase WebSocket Channel
  function subscribeRealtimeChanges() {
    if (!cloudState.client) return;
    if (cloudState.channel) {
      try {
        cloudState.client.removeChannel(cloudState.channel);
      } catch (e) {}
    }

    try {
      cloudState.channel = cloudState.client
        .channel('public:smartvms_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'test_results' }, (payload) => {
          handleRealtimeResultChange(payload);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'test_comments' }, (payload) => {
          handleRealtimeCommentChange(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'test_cases_custom' }, () => {
          pullCloudCatalog({ silent: true });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'test_sessions' }, () => {
          pullCloudProjectState({ silent: true }).then(() => {
            triggerUiRefresh();
          });
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ [Cloud Realtime] Đã kết nối kênh thời gian thực: test_sessions, test_results, test_comments & test_cases_custom');
          }
        });
    } catch (err) {
      console.warn('Lỗi đăng ký Realtime Channel:', err);
    }
  }

  // Xử lý thay đổi kết quả từ Realtime
  function handleRealtimeResultChange(payload) {
    const { eventType, new: newRec, old: oldRec } = payload;
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (!newRec || !newRec.tc_id) return;

      const validTcIds = new Set((window.state?.projects?.[0]?.testCases || []).map(t => t.id));
      if (validTcIds.size > 0 && !validTcIds.has(newRec.tc_id)) return;

      const tcId = newRec.tc_id;
      const cur = window.state?.results ? window.state.results[tcId] : null;

      // Tránh lặp vô hạn nếu chính máy này vừa cập nhật cùng thời điểm
      if (cur && cur.status === newRec.status && cur.runAt === newRec.run_at) {
        return;
      }

      const mapped = mapCloudRecordToLocal(newRec);

      if (!window.state) window.state = {};
      if (!window.state.results) window.state.results = {};
      window.state.results[tcId] = mapped;

      // Cập nhật vào active cycle nếu có
      const curCycleId = window.state.activeCycleId || 'CYC-SMARTVMS-01';
      if (!window.state.cycleResults) window.state.cycleResults = {};
      if (!window.state.cycleResults[curCycleId]) window.state.cycleResults[curCycleId] = {};
      window.state.cycleResults[curCycleId][tcId] = JSON.parse(JSON.stringify(mapped));

      // Cập nhật phân công (assignments)
      if (Array.isArray(window.state.assignments)) {
        window.state.assignments.forEach((asg) => {
          if (asg.tcId === tcId) {
            asg.status = mapped.status;
            asg.executedAt = mapped.runAt;
          }
        });
      }

      // Lưu lại local cache
      if (typeof window.saveCoreState === 'function') {
        window.saveCoreState();
      }

      // Báo UI Realtime
      triggerUiRefresh(tcId, mapped);

      const statusBadgeTxt = mapped.status === 'Pass' ? '✅ ĐẠT' : (mapped.status === 'Fail' ? '❌ LỖI' : mapped.status);
      if (window.showToast) {
        window.showToast(`⚡ [Realtime] ${newRec.tester || 'Tester'} vừa chấm [${tcId}]: ${statusBadgeTxt}`, 'info');
      }

      // Cập nhật đếm số bản ghi trên Cloud
      cloudState.cloudRecordCount = Math.max(cloudState.cloudRecordCount, Object.keys(window.state.results).length);
      updateCloudStatusCountUI();
    } else if (eventType === 'DELETE') {
      if (oldRec && oldRec.tc_id && window.state?.results?.[oldRec.tc_id]) {
        delete window.state.results[oldRec.tc_id];
        if (typeof window.saveCoreState === 'function') window.saveCoreState();
        triggerUiRefresh(oldRec.tc_id, null);
      }
    }
  }

  // Xử lý trao đổi bình luận thời gian thực
  function handleRealtimeCommentChange(payload) {
    const newComment = payload.new;
    if (!newComment || !newComment.tc_id) return;
    if (!window.state) window.state = {};
    if (!window.state.comments) window.state.comments = {};
    if (!window.state.comments[newComment.tc_id]) window.state.comments[newComment.tc_id] = [];

    const existing = window.state.comments[newComment.tc_id];
    if (!existing.some(c => c.time === newComment.created_at && c.text === newComment.content)) {
      existing.push({
        author: newComment.user_name,
        role: newComment.user_role,
        text: newComment.content,
        time: newComment.created_at,
        attachmentUrl: newComment.attachment_url || null
      });
      if (typeof window.saveCoreState === 'function') window.saveCoreState();
      // Nếu đang mở đúng bài test thì vẽ lại tab trao đổi
      if (window.currentSelectedTcId === newComment.tc_id && typeof window.renderExecDiscussionList === 'function') {
        window.renderExecDiscussionList(newComment.tc_id);
      }
      if (window.showToast) {
        window.showToast(`💬 [Thảo luận] ${newComment.user_name} vừa bình luận tại [${newComment.tc_id}]`, 'info');
      }
    }
  }

  // 5. Kéo dữ liệu từ Cloud về máy (Pull from Supabase)
  async function pullCloudResults(opts = {}) {
    if (!cloudState.client) {
      const ok = await initCloudSync(true);
      if (!ok) {
        if (!opts.silent && window.showToast) {
          window.showToast('⚠️ Không thể kết nối Supabase Cloud để kéo dữ liệu!', 'error');
        }
        return false;
      }
    }

    if (!opts.silent && window.showToast) {
      window.showToast('⏳ Đang đồng bộ kết quả mới nhất từ Supabase Cloud...', 'info');
    }

    try {
      const { data: records, error } = await cloudState.client
        .from('test_results')
        .select('*');

      if (error) {
        console.error('Lỗi pull từ Supabase:', error);
        if (!opts.silent && window.showToast) {
          window.showToast(`❌ Lỗi kéo dữ liệu: ${error.message}`, 'error');
        }
        return false;
      }

      if (!window.state) window.state = {};
      if (!window.state.results) window.state.results = {};
      const curCycleId = window.state.activeCycleId || 'CYC-SMARTVMS-01';
      if (!window.state.cycleResults) window.state.cycleResults = {};
      if (!window.state.cycleResults[curCycleId]) window.state.cycleResults[curCycleId] = {};

      let syncedCount = 0;
      if (Array.isArray(records)) {
        const validTcIds = new Set((window.state?.projects?.[0]?.testCases || []).map(t => t.id));
        records.forEach((rec) => {
          if (!rec.tc_id) return;
          if (validTcIds.size > 0 && !validTcIds.has(rec.tc_id)) return;
          const mapped = mapCloudRecordToLocal(rec);
          window.state.results[rec.tc_id] = mapped;
          window.state.cycleResults[curCycleId][rec.tc_id] = JSON.parse(JSON.stringify(mapped));

          // Sync sang assignments
          if (Array.isArray(window.state.assignments)) {
            window.state.assignments.forEach((asg) => {
              if (asg.tcId === rec.tc_id) {
                asg.status = mapped.status;
                asg.executedAt = mapped.runAt;
              }
            });
          }
          syncedCount++;
        });
      }

      // Kéo luôn bình luận test_comments nếu có
      try {
        const { data: commentsData } = await cloudState.client
          .from('test_comments')
          .select('*')
          .order('created_at', { ascending: true });

        if (Array.isArray(commentsData)) {
          if (!window.state.comments) window.state.comments = {};
          commentsData.forEach((cm) => {
            if (!cm.tc_id) return;
            if (!window.state.comments[cm.tc_id]) window.state.comments[cm.tc_id] = [];
            const list = window.state.comments[cm.tc_id];
            if (!list.some(c => c.time === cm.created_at && c.text === cm.content)) {
              list.push({
                author: cm.user_name,
                role: cm.user_role,
                text: cm.content,
                time: cm.created_at,
                attachmentUrl: cm.attachment_url || null
              });
            }
          });
        }
      } catch (errCm) {
        console.warn('Lỗi đọc test_comments:', errCm);
      }

      cloudState.lastSyncTime = new Date();
      cloudState.cloudRecordCount = syncedCount;

      if (typeof window.saveCoreState === 'function') {
        window.saveCoreState();
      }

      updateCloudStatusUI('connected', `Cloud: Realtime (${syncedCount})`);
      triggerUiRefresh();

      if (!opts.silent && window.showToast) {
        window.showToast(`✅ Đã đồng bộ thành công ${syncedCount} kết quả từ Supabase Cloud!`, 'success');
      }

      return true;
    } catch (e) {
      console.error('Lỗi ngoại lệ khi pull dữ liệu:', e);
      if (!opts.silent && window.showToast) {
        window.showToast(`❌ Lỗi đồng bộ: ${e.message}`, 'error');
      }
      return false;
    }
  }

  // 5a. Kéo trạng thái Dự án (Projects), Đợt test (Cycles), Phân công (Assignments) từ Database Cloud
  async function pullCloudProjectState(opts = {}) {
    if (!cloudState.client) return false;
    try {
      const { data: sessionRows, error } = await cloudState.client
        .from('test_sessions')
        .select('*');

      if (!window.state) window.state = {};

      if (error || !Array.isArray(sessionRows) || sessionRows.length === 0) {
        window.state.projects = [];
        window.state.activeProjectId = null;
        window.state.testCycles = [];
        window.state.assignments = [];
        console.log('⚡ [Cloud Database] Không có dự án nào trên Supabase Cloud (0 Dự án).');
        return true;
      }

      // 1. Phục hồi projects
      const prjRow = sessionRows.find(r => r.id === 'system_projects');
      if (prjRow && prjRow.notes) {
        try {
          const parsed = JSON.parse(prjRow.notes);
          window.state.projects = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          window.state.projects = [];
        }
      } else {
        window.state.projects = [];
      }

      if (window.state.projects.length > 0) {
        if (!window.state.activeProjectId || !window.state.projects.some(p => p.id === window.state.activeProjectId)) {
          window.state.activeProjectId = window.state.projects[0].id;
        }
      } else {
        window.state.activeProjectId = null;
      }

      // 2. Phục hồi test cycles
      const cycleRow = sessionRows.find(r => r.id === 'system_cycles');
      if (cycleRow && cycleRow.notes) {
        try {
          const parsedCycles = JSON.parse(cycleRow.notes);
          window.state.testCycles = Array.isArray(parsedCycles) ? parsedCycles : [];
        } catch (e) {
          window.state.testCycles = [];
        }
      } else {
        window.state.testCycles = [];
      }

      // 3. Phục hồi assignments
      const asgRow = sessionRows.find(r => r.id === 'system_assignments');
      if (asgRow && asgRow.notes) {
        try {
          const parsedAsgs = JSON.parse(asgRow.notes);
          window.state.assignments = Array.isArray(parsedAsgs) ? parsedAsgs : [];
        } catch (e) {
          window.state.assignments = [];
        }
      } else {
        window.state.assignments = [];
      }

      console.log(`⚡ [Cloud Database] Đã tải ${window.state.projects.length} dự án từ Supabase Cloud.`);
      return true;
    } catch (err) {
      console.warn('Lỗi pullCloudProjectState:', err);
      return false;
    }
  }

  // 5a-2. Đẩy danh mục dự án lên Supabase Cloud
  async function pushProjectsToCloud(projects) {
    if (!cloudState.client) return false;
    try {
      if (!Array.isArray(projects) || projects.length === 0) {
        await cloudState.client.from('test_sessions').delete().eq('id', 'system_projects');
        console.log('⚡ [Cloud Database] Đã xóa danh mục dự án trên Cloud (0 Dự án).');
        return true;
      }
      const payload = {
        id: 'system_projects',
        name: 'System Projects Catalog',
        owner: window.state?.currentUser?.username || 'admin',
        version: 'v2.0',
        notes: JSON.stringify(projects),
        updated_at: new Date().toISOString()
      };
      const { error } = await cloudState.client.from('test_sessions').upsert(payload, { onConflict: 'id' });
      if (!error) {
        console.log(`⚡ [Cloud Database] Đã đồng bộ ${projects.length} dự án lên Supabase Cloud.`);
      }
      return !error;
    } catch (e) {
      console.error('Lỗi ngoại lệ pushProjectsToCloud:', e);
      return false;
    }
  }

  // 5a-3. Đẩy danh mục đợt test lên Supabase Cloud
  async function pushCyclesToCloud(cycles) {
    if (!cloudState.client) return false;
    try {
      if (!Array.isArray(cycles) || cycles.length === 0) {
        await cloudState.client.from('test_sessions').delete().eq('id', 'system_cycles');
        return true;
      }
      const payload = {
        id: 'system_cycles',
        name: 'System Test Cycles',
        owner: window.state?.currentUser?.username || 'admin',
        version: 'v2.0',
        notes: JSON.stringify(cycles),
        updated_at: new Date().toISOString()
      };
      await cloudState.client.from('test_sessions').upsert(payload, { onConflict: 'id' });
      return true;
    } catch (e) {
      return false;
    }
  }

  // 5a-4. Đẩy danh mục phân công lên Supabase Cloud
  async function pushAssignmentsToCloud(assignments) {
    if (!cloudState.client) return false;
    try {
      if (!Array.isArray(assignments) || assignments.length === 0) {
        await cloudState.client.from('test_sessions').delete().eq('id', 'system_assignments');
        return true;
      }
      const payload = {
        id: 'system_assignments',
        name: 'System Assignments',
        owner: window.state?.currentUser?.username || 'admin',
        version: 'v2.0',
        notes: JSON.stringify(assignments),
        updated_at: new Date().toISOString()
      };
      await cloudState.client.from('test_sessions').upsert(payload, { onConflict: 'id' });
      return true;
    } catch (e) {
      return false;
    }
  }

  // 5b. Kéo toàn bộ danh mục kịch bản từ Cloud về (Database là Single Source of Truth)
  async function pullCloudCatalog(opts = {}) {
    if (!cloudState.client) return false;
    try {
      const { data: dbTcs, error } = await cloudState.client
        .from('test_cases_custom')
        .select('*')
        .order('tc_id', { ascending: true });

      if (error) {
        console.warn('Lỗi query test_cases_custom từ Cloud:', error);
        return false;
      }

      if (!window.state) window.state = {};
      if (!window.state.projects) window.state.projects = [];

      if (dbTcs && dbTcs.length > 0) {
        const mapped = dbTcs.map(mapCloudTestCaseToLocal);
        const modIds = [...new Set(mapped.map(t => t.module || 'M01'))].sort();
        const defaultModules = modIds.map(mId => ({
          id: mId,
          name: `Phân hệ ${mId}`,
          versions: ['v1.0', 'v1.0.0']
        }));

        if (!window.state.projects || window.state.projects.length === 0) {
          window.state.projects = [{
            id: 'PRJ-SMARTVMS',
            code: 'SMARTVMS',
            name: 'SmartVMS Local SingleSite 2026',
            domain: 'Quản lý Khách & Ra vào',
            lead: 'Nguyễn Văn Huy (QA Lead)',
            standards: ['ISO 9001:2015', 'ISO/IEC/IEEE 29119', 'ISO/IEC 25010'],
            activeVersion: 'v1.0.0',
            versions: [{ version: 'v1.0.0', label: 'v1.0.0-Base', status: 'IN_QA' }],
            modules: defaultModules,
            testCases: mapped
          }];
          window.state.activeProjectId = 'PRJ-SMARTVMS';
        } else {
          window.state.projects[0].testCases = mapped;
          if (!window.state.projects[0].modules || window.state.projects[0].modules.length === 0) {
            window.state.projects[0].modules = defaultModules;
          }
        }
        window.state.isCustomCatalog = true;
        window.state.isCleanProjectState = false;
        window.state.catalogSource = 'Supabase Cloud Database';
        console.log(`⚡ [Database Sync] Đã đồng bộ ${mapped.length} kịch bản từ Cloud Database về trình duyệt.`);
      } else {
        // Database Cloud sạch sẽ (0 kịch bản): Đảm bảo trình duyệt cũng sạch sẽ 100%
        if (window.state.projects.length > 0) {
          window.state.projects.forEach(p => p.testCases = []);
        }
        window.state.isCustomCatalog = true;
        window.state.isCleanProjectState = true;
        window.state.results = {};
        window.state.cycleResults = {};
        window.state.assignments = [];
        console.log('⚡ [Database Sync] Database Cloud đang ở trạng thái sạch (0 kịch bản). Trình duyệt đã đồng bộ về 0.');
      }

      if (typeof window.saveCoreState === 'function') {
        window.saveCoreState();
      }
      triggerUiRefresh();
      return true;
    } catch (err) {
      console.warn('Lỗi ngoại lệ pullCloudCatalog:', err);
      return false;
    }
  }

  // 5c. Đẩy toàn bộ danh mục kịch bản lên Cloud Database
  async function pushCatalogToCloud(tcs) {
    if (!cloudState.client || !Array.isArray(tcs)) return false;
    try {
      // 1. Xóa toàn bộ kịch bản cũ trên test_cases_custom
      await cloudState.client.from('test_cases_custom').delete().neq('tc_id', '___NONE___');

      // 2. Insert theo batch 50 kịch bản
      if (tcs.length > 0) {
        const records = tcs.map(mapLocalTestCaseToCloud);
        const batchSize = 50;
        for (let i = 0; i < records.length; i += batchSize) {
          const chunk = records.slice(i, i + batchSize);
          const { error } = await cloudState.client.from('test_cases_custom').insert(chunk);
          if (error) {
            console.error('Lỗi đẩy kịch bản lên Cloud:', error);
            throw error;
          }
        }
        console.log(`⚡ [Database Sync] Đã lưu thành công ${tcs.length} kịch bản vào Supabase Cloud.`);
      }
      return true;
    } catch (err) {
      console.error('Lỗi khi đẩy kịch bản lên Supabase Cloud:', err);
      return false;
    }
  }

  // 6. Đẩy toàn bộ kết quả lên Supabase Cloud (Push All)
  async function pushAllResultsToCloud(opts = {}) {
    if (!cloudState.client) {
      const ok = await initCloudSync(true);
      if (!ok) {
        if (!opts.silent && window.showToast) {
          window.showToast('⚠️ Chưa kết nối được Supabase Cloud để đẩy dữ liệu!', 'error');
        }
        return false;
      }
    }

    const results = window.state?.results || {};
    const tcIds = Object.keys(results);

    if (tcIds.length === 0) {
      if (!opts.silent && window.showToast) {
        window.showToast('ℹ️ Chưa có kết quả test nào trên máy để đẩy lên Cloud.', 'info');
      }
      return true;
    }

    if (!opts.silent && window.showToast) {
      window.showToast(`⏳ Đang đẩy ${tcIds.length} kết quả lên Supabase Cloud...`, 'info');
    }

    try {
      const rows = tcIds.map((tcId) => {
        const r = results[tcId];
        return mapLocalRecordToCloud(tcId, r);
      });

      // Gửi theo từng batch 50 bản ghi để tối ưu băng thông
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await cloudState.client.from('test_results').upsert(batch, {
          onConflict: 'run_id,tc_id'
        });
        if (error) {
          throw error;
        }
      }

      cloudState.lastSyncTime = new Date();
      cloudState.cloudRecordCount = rows.length;
      updateCloudStatusUI('connected', `Cloud: Realtime (${rows.length})`);

      if (!opts.silent && window.showToast) {
        window.showToast(`✅ Đã đẩy thành công ${rows.length} kết quả lên Supabase Cloud!`, 'success');
      }

      return true;
    } catch (err) {
      console.error('Lỗi đẩy dữ liệu lên Supabase:', err);
      if (!opts.silent && window.showToast) {
        window.showToast(`❌ Lỗi đẩy dữ liệu: ${err.message}`, 'error');
      }
      return false;
    }
  }

  // 7. Đồng bộ tức thời 1 kết quả bài test lên Cloud & LAN Server (Được gọi khi Tester chấm Pass/Fail)
  async function syncResultToCloud(tcId) {
    if (!tcId || !window.state?.results?.[tcId]) return;
    const r = window.state.results[tcId];
    const payload = mapLocalRecordToCloud(tcId, r);

    // Đồng bộ tức thì tới máy chủ LAN nếu đang chạy web server nội bộ
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcId, record: r })
      }).catch(() => {});
    }

    // Nếu chưa có client, thêm vào offline queue và thử kết nối
    if (!cloudState.client) {
      cloudState.offlineQueue.push(payload);
      initCloudSync(true);
      return;
    }

    try {
      const { error } = await cloudState.client.from('test_results').upsert(payload, {
        onConflict: 'run_id,tc_id'
      });
      if (error) {
        console.warn(`Lỗi lưu [${tcId}] lên Cloud:`, error);
        cloudState.offlineQueue.push(payload);
        updateCloudStatusUI('error', 'Lưu Cloud lỗi (Lưu máy OK)');
      } else {
        cloudState.lastSyncTime = new Date();
        updateCloudStatusUI('connected', `Cloud: Realtime`);
      }
    } catch (e) {
      console.warn('Lỗi mạng khi đẩy kết quả, đưa vào queue:', e);
      cloudState.offlineQueue.push(payload);
      updateCloudStatusUI('offline', 'Ngoại tuyến (Lưu máy)');
    }
  }

  // 8. Đẩy thảo luận bình luận lên Supabase
  async function syncCommentToCloud(tcId, commentText) {
    if (!tcId || !commentText || !cloudState.client) return;
    const u = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
    const author = u ? u.name : 'Người kiểm thử';
    const role = u ? (u.roleTitle || u.role) : 'Tester';

    try {
      const payload = {
        run_id: DEFAULT_RUN_ID,
        tc_id: tcId,
        user_name: author,
        user_role: role,
        content: commentText.trim(),
        created_at: new Date().toISOString()
      };
      await cloudState.client.from('test_comments').insert(payload);
    } catch (e) {
      console.warn('Lỗi gửi comment lên Cloud:', e);
    }
  }

  // Đẩy hàng đợi offline bù khi có mạng
  async function flushOfflineQueue() {
    if (!cloudState.client || cloudState.offlineQueue.length === 0) return;
    const queue = [...cloudState.offlineQueue];
    cloudState.offlineQueue = [];
    try {
      const { error } = await cloudState.client.from('test_results').upsert(queue, {
        onConflict: 'run_id,tc_id'
      });
      if (!error) {
        console.log(`⚡ [Offline Sync] Đã đồng bộ bù ${queue.length} bản ghi tồn đọng lên Supabase!`);
      } else {
        cloudState.offlineQueue = queue;
      }
    } catch (e) {
      cloudState.offlineQueue = queue;
    }
  }

  // ================================================================
  // HELPERS: DATA MAPPING GIỮA LOCAL STATE & POSTGRESQL CLOUD
  // ================================================================
  function mapLocalRecordToCloud(tcId, r) {
    // Database schema: CHECK (status IN ('Not Run', 'Pass', 'Fail', 'Skip', 'Inherited Pass'))
    let cloudStatus = 'Pass';
    const s = (r.status || 'Pass').trim();
    if (s === 'Pass' || s === 'PASSED') cloudStatus = 'Pass';
    else if (s === 'Fail' || s === 'FAILED') cloudStatus = 'Fail';
    else if (s === 'Skip') cloudStatus = 'Skip';
    else if (s === 'Blocked') cloudStatus = 'Fail'; // Map 'Blocked' sang 'Fail' để thỏa mãn constraint DB
    else if (s === 'Inherited Pass') cloudStatus = 'Inherited Pass';
    else cloudStatus = 'Not Run';

    let defectStatus = r.defectStatus || 'None';
    if (s === 'Blocked') defectStatus = 'Blocked';

    // Tổng hợp note & actualResult
    let noteCombined = r.note || '';
    if (r.actualResult && !noteCombined.includes(r.actualResult)) {
      noteCombined = noteCombined ? `[Thực tế]: ${r.actualResult} | ${noteCombined}` : `[Thực tế]: ${r.actualResult}`;
    }

    const curCycle = (typeof window.getActiveCycle === 'function') ? window.getActiveCycle() : null;

    return {
      run_id: (curCycle && curCycle.code) ? curCycle.code.toLowerCase().replace('-', '_') : DEFAULT_RUN_ID,
      tc_id: tcId,
      status: cloudStatus,
      tester: r.tester || (window.state?.currentUser?.name || 'Tester'),
      assigned_to: r.assignedTo || null,
      run_at: r.runAt || new Date().toISOString(),
      defect_status: defectStatus,
      severity: r.severity || null,
      assigned_dev: r.assignedDev || null,
      fix_version: r.fixVersion || null,
      fail_reason: r.failReason || null,
      note: noteCombined || null,
      evidences: Array.isArray(r.evidences) ? r.evidences : (Array.isArray(window.state?.evidences?.[tcId]) ? window.state.evidences[tcId] : []),
      updated_at: new Date().toISOString()
    };
  }

  function mapCloudRecordToLocal(rec) {
    let localStatus = rec.status || 'Not Run';
    if (rec.defect_status === 'Blocked') {
      localStatus = 'Blocked';
    }

    let actualResult = '';
    let noteClean = rec.note || '';
    if (noteClean.startsWith('[Thực tế]:')) {
      const parts = noteClean.split('|');
      actualResult = parts[0].replace('[Thực tế]:', '').trim();
      noteClean = parts.slice(1).join('|').trim();
    }

    return {
      status: localStatus,
      tester: rec.tester || 'Tester',
      runAt: rec.run_at || rec.updated_at || new Date().toISOString(),
      actualResult: actualResult,
      failReason: rec.fail_reason || '',
      note: noteClean,
      severity: rec.severity || '',
      assignedDev: rec.assigned_dev || '',
      fixVersion: rec.fix_version || '',
      defectStatus: rec.defect_status || (rec.status === 'Fail' ? 'New' : 'None'),
      evidences: Array.isArray(rec.evidences) ? rec.evidences : [],
      cycleId: 'CYC-SMARTVMS-01',
      cycleName: 'Đợt 1 — Kiểm thử toàn diện SmartVMS v2.0'
    };
  }

  function mapLocalTestCaseToCloud(tc) {
    return {
      tc_id: tc.id,
      module: tc.module || 'M01',
      priority: tc.priority || 'P2',
      platform: tc.platform || 'Giao diện Web Trực ban',
      name: tc.name || tc.title || tc.id,
      test_data: tc.testData || '',
      precondition: tc.precondition || '',
      steps: Array.isArray(tc.steps) ? tc.steps : (tc.steps ? [tc.steps] : []),
      expected: Array.isArray(tc.expected) ? tc.expected : (tc.expected ? [tc.expected] : []),
      notes: tc.notes || '',
      is_custom: true,
      updated_at: new Date().toISOString()
    };
  }

  function mapCloudTestCaseToLocal(rec) {
    return {
      id: rec.tc_id,
      module: rec.module,
      priority: rec.priority || 'P2',
      platform: rec.platform,
      name: rec.name,
      title: rec.name,
      testData: rec.test_data || '',
      precondition: rec.precondition || '',
      steps: Array.isArray(rec.steps) ? rec.steps : [],
      expected: Array.isArray(rec.expected) ? rec.expected : [],
      notes: rec.notes || '',
      isCustom: true
    };
  }

  // ================================================================
  // GIAO DIỆN & TIỆN ÍCH UI CLOUD SYNC
  // ================================================================
  function updateCloudStatusUI(status, label) {
    cloudState.status = status;
    const dot = document.getElementById('cloud-status-dot');
    const text = document.getElementById('cloud-status-text');

    if (dot) {
      if (status === 'connected') {
        dot.style.background = '#10b981';
        dot.style.boxShadow = '0 0 8px #10b981';
      } else if (status === 'connecting') {
        dot.style.background = '#f59e0b';
        dot.style.boxShadow = '0 0 8px #f59e0b';
      } else if (status === 'error' || status === 'offline') {
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 8px #ef4444';
      } else {
        dot.style.background = '#94a3b8';
        dot.style.boxShadow = 'none';
      }
    }

    if (text) {
      text.textContent = label || (status === 'connected' ? 'Cloud: Realtime' : (status === 'connecting' ? 'Cloud: Đang nối...' : 'Cloud: Ngoại tuyến'));
    }
  }

  function updateCloudStatusCountUI() {
    const text = document.getElementById('cloud-status-text');
    if (text && cloudState.status === 'connected') {
      text.textContent = `Cloud: Realtime (${cloudState.cloudRecordCount})`;
    }
  }

  // Tự động gắn Cloud Widget vào thanh Topbar của trang hiện tại
  function injectCloudWidgetToTopbar() {
    if (document.getElementById('cloud-sync-widget')) return;

    const topbarRight = document.querySelector('.vms-topbar-right') || document.querySelector('.header-right') || document.querySelector('.login-topbar');
    if (!topbarRight) return;

    const widget = document.createElement('div');
    widget.id = 'cloud-sync-widget';
    widget.title = 'Bấm để quản lý đồng bộ Supabase Cloud & Mạng';
    widget.style.cssText = 'display:inline-flex; align-items:center; gap:6px; background:var(--bg-card, #ffffff); padding:3px 10px; border-radius:20px; border:1px solid var(--border, #cbd5e1); font-size:11.5px; font-weight:700; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.06); transition:all 0.2s; margin-right:4px;';
    widget.innerHTML = `
      <span id="cloud-status-dot" style="width:8px; height:8px; border-radius:50%; background:#f59e0b; box-shadow:0 0 6px #f59e0b; transition:all 0.3s"></span>
      <span id="cloud-status-text" style="color:var(--text-primary, #0f172a)">Cloud: Đang nối...</span>
      <button type="button" id="btn-cloud-quick-sync" title="Đồng bộ 2 chiều tức thì" style="border:none; background:none; cursor:pointer; font-size:12px; padding:0 2px; color:var(--primary, #2563eb)">🔄</button>
    `;

    widget.addEventListener('click', (e) => {
      if (e.target.id === 'btn-cloud-quick-sync') {
        e.stopPropagation();
        pullCloudResults({ silent: false });
      } else {
        openCloudManagerModal();
      }
    });

    // Chèn vào vị trí đầu tiên của topbar-right
    topbarRight.insertBefore(widget, topbarRight.firstChild);

    // Gắn modal vào body nếu chưa có
    injectCloudManagerModal();
  }

  // Modal Trung Tâm Quản Lý Cloud & Mạng
  function injectCloudManagerModal() {
    if (document.getElementById('modal-cloud-manager')) return;

    const modal = document.createElement('div');
    modal.id = 'modal-cloud-manager';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:99999; align-items:center; justify-content:center; padding:16px;';
    modal.innerHTML = `
      <div class="modal-dialog" style="background:var(--bg-card, #fff); border-radius:12px; max-width:620px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.25); overflow:hidden; border:1px solid var(--border, #e2e8f0); animation:fadeIn 0.2s">
        <div style="background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center">
          <div style="display:flex; align-items:center; gap:10px">
            <span style="font-size:22px">⚡</span>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:800">Trung Tâm Đồng Bộ Đám Mây & Mạng (Cloud & Realtime)</h3>
              <div style="font-size:11.5px; opacity:0.9">Đồng bộ kết quả test đa máy, realtime multi-tester theo ISO/IEC/IEEE 29119-3</div>
            </div>
          </div>
          <button type="button" onclick="window.closeCloudManagerModal()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer">&times;</button>
        </div>

        <div style="padding:20px; max-height:75vh; overflow-y:auto; font-size:13px; color:var(--text-primary, #1e293b)">
          
          <!-- Hộp trạng thái hiện tại -->
          <div style="background:var(--bg-surface, #f8fafc); border:1.5px solid var(--border, #e2e8f0); border-radius:8px; padding:12px 16px; margin-bottom:16px">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <span style="font-weight:700">Trạng thái kết nối Cloud:</span>
              <span id="modal-cloud-pill" class="badge" style="background:#dcfce7; color:#15803d; font-weight:800; padding:3px 10px; border-radius:12px">🟢 Đang hoạt động Realtime</span>
            </div>
            <div style="font-size:12px; color:var(--text-muted, #64748b); line-height:1.6">
              <div>• <strong>Cơ sở dữ liệu:</strong> Supabase PostgreSQL (Singapore Region - Siêu tốc)</div>
              <div>• <strong>Dữ liệu trên Cloud:</strong> <span id="modal-cloud-count" style="font-weight:700; color:var(--primary, #2563eb)">Đang đọc...</span> kết quả kiểm thử</div>
              <div>• <strong>Cơ chế đồng bộ:</strong> Tự động đẩy kết quả khi Tester chấm Pass/Fail, tự động kéo và nhận thông báo Realtime không cần F5.</div>
            </div>
          </div>

          <!-- Nút hành động đồng bộ -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px">
            <button type="button" class="btn btn-primary" onclick="window.triggerCloudPullManual()" style="display:flex; align-items:center; justify-content:center; gap:8px; padding:10px">
              <span>⬇️</span>
              <span><strong>Kéo dữ liệu từ Cloud (Pull)</strong><br><small style="font-size:10.5px; opacity:0.85">Nạp toàn bộ kết quả của nhóm về máy</small></span>
            </button>
            <button type="button" class="btn btn-outline" onclick="window.triggerCloudPushManual()" style="display:flex; align-items:center; justify-content:center; gap:8px; padding:10px">
              <span>⬆️</span>
              <span><strong>Đẩy kết quả lên Cloud (Push)</strong><br><small style="font-size:10.5px; opacity:0.85">Đồng bộ tất cả bài test lên máy chủ</small></span>
            </button>
          </div>

          <!-- Kênh truy cập Mạng -->
          <div style="border-top:1px solid var(--border, #e2e8f0); padding-top:14px; margin-bottom:14px">
            <h4 style="margin:0 0 10px 0; font-size:13.5px; font-weight:800; color:var(--text-primary, #0f172a)">🌐 Các Kênh Truy Cập Trên Môi Trường Mạng</h4>
            
            <!-- Kênh 1: Internet Vercel -->
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center">
              <div>
                <strong style="color:#166534">🌍 Online Internet (Vercel HTTPS):</strong>
                <div style="font-size:12px; font-family:monospace; color:#15803d; margin-top:2px">https://smartvms-test-manager.vercel.app</div>
              </div>
              <a href="https://smartvms-test-manager.vercel.app" target="_blank" class="btn btn-xs btn-primary" style="text-decoration:none">Mở Link ↗</a>
            </div>

            <!-- Kênh 2: Mạng LAN -->
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center">
              <div>
                <strong style="color:#1e40af">🏢 Mạng Nội Bộ (LAN Intranet Server):</strong>
                <div style="font-size:12px; font-family:monospace; color:#1d4ed8; margin-top:2px">http://192.168.1.58:8080 (hoặc qua Start-LAN-Server.bat)</div>
              </div>
              <button type="button" class="btn btn-xs btn-outline" onclick="navigator.clipboard.writeText('http://192.168.1.58:8080'); window.showToast('📋 Đã chép link mạng LAN vào Clipboard!', 'info');">Chép Link</button>
            </div>
          </div>

          <!-- Chi tiết cấu hình Supabase (Collapsible) -->
          <details style="margin-top:12px; border:1px solid var(--border, #e2e8f0); border-radius:6px; padding:8px 12px; background:var(--bg-surface, #f8fafc)">
            <summary style="font-weight:700; cursor:pointer; font-size:12px; color:var(--text-muted, #64748b)">⚙️ Tùy biến Endpoint Supabase (Nâng cao)</summary>
            <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px">
              <div>
                <label style="font-size:11px; font-weight:700">Project URL:</label>
                <input type="text" id="modal-cfg-sb-url" style="width:100%; padding:6px 10px; font-size:12px; border-radius:4px; border:1px solid #cbd5e1" value="${cloudState.config.url}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700">Anon Public Key:</label>
                <input type="password" id="modal-cfg-sb-key" style="width:100%; padding:6px 10px; font-size:12px; border-radius:4px; border:1px solid #cbd5e1" value="${cloudState.config.anonKey}" />
              </div>
              <div style="text-align:right; margin-top:4px">
                <button type="button" class="btn btn-xs btn-primary" onclick="window.saveCustomSupabaseConfig()">💾 Lưu & Kết nối lại</button>
              </div>
            </div>
          </details>

        </div>

        <div style="background:var(--bg-surface, #f8fafc); border-top:1px solid var(--border, #e2e8f0); padding:12px 20px; display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:11.5px; color:var(--text-muted, #64748b)">💡 Dữ liệu luôn được lưu đồng thời trên Cloud & Trình duyệt.</span>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.closeCloudManagerModal()">Đóng</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  function openCloudManagerModal() {
    const modal = document.getElementById('modal-cloud-manager');
    if (!modal) {
      injectCloudManagerModal();
    }
    const m = document.getElementById('modal-cloud-manager');
    if (m) {
      m.style.display = 'flex';
      const pill = document.getElementById('modal-cloud-pill');
      const countEl = document.getElementById('modal-cloud-count');
      if (pill) {
        if (cloudState.status === 'connected') {
          pill.className = 'badge badge-pass';
          pill.textContent = '🟢 Đã kết nối Realtime';
        } else if (cloudState.status === 'connecting') {
          pill.className = 'badge badge-skip';
          pill.textContent = '🟡 Đang kết nối...';
        } else {
          pill.className = 'badge badge-fail';
          pill.textContent = '🔴 Lỗi / Ngoại tuyến';
        }
      }
      if (countEl) {
        countEl.textContent = cloudState.cloudRecordCount || Object.keys(window.state?.results || {}).length;
      }
    }
  }

  function closeCloudManagerModal() {
    const m = document.getElementById('modal-cloud-manager');
    if (m) m.style.display = 'none';
  }

  // Refresh UI tất cả các trang khi có dữ liệu mới đồng bộ
  function triggerUiRefresh(tcId, record) {
    try {
      // 1. Tester Workspace (Việc của tôi)
      if (typeof window.renderMyTasks === 'function') {
        window.renderMyTasks();
      }
      if (typeof window.renderSummaryMatrix === 'function') {
        window.renderSummaryMatrix();
      }

      // 2. Reports (Báo cáo tiến độ cá nhân & Quản trị)
      if (typeof window.initReportsModule === 'function') {
        window.initReportsModule();
      }

      // 3. Admin Assignments (Giao việc)
      if (typeof window.renderAssignmentsTable === 'function') {
        window.renderAssignmentsTable();
      }

      // 4. Admin Testcases (Danh mục kịch bản)
      if (typeof window.renderTestcasesTable === 'function') {
        window.renderTestcasesTable();
      }

      // 5. Execution Studio (Phòng thi hành test)
      if (typeof window.filterExecList === 'function') {
        window.filterExecList();
      }
      if (tcId && window.currentSelectedTcId === tcId && typeof window.selectExecTc === 'function') {
        window.selectExecTc(tcId);
      }

      // 6. Developer Defect Tracker
      if (typeof window.renderDefectList === 'function') {
        window.renderDefectList();
      }

      // 7. Dashboard KPI Admin
      const dashPass = document.getElementById('dash-pass');
      const dashFail = document.getElementById('dash-fail');
      const dashBlocked = document.getElementById('dash-blocked');
      const dashTotal = document.getElementById('dash-total');
      const dashAsg = document.getElementById('dash-asg');
      if (dashTotal) {
        const curTcs = window.state?.projects?.[0]?.testCases || [];
        dashTotal.textContent = curTcs.length;
      }
      if (dashAsg) {
        const curAsgs = window.state?.assignments || [];
        dashAsg.textContent = curAsgs.length;
      }
      if (dashPass && dashFail && window.state?.results) {
        let pass = 0, fail = 0, blk = 0;
        Object.values(window.state.results).forEach(r => {
          const s = (r.status || '').toUpperCase();
          if (s === 'PASS' || s === 'PASSED') pass++;
          else if (s === 'FAIL' || s === 'FAILED') fail++;
          else if (s === 'BLOCKED') blk++;
        });
        dashPass.textContent = pass;
        dashFail.textContent = fail;
        if (dashBlocked) dashBlocked.textContent = blk;
      }

      // 8. Dispatch custom event cho bất kỳ component nào lắng nghe
      window.dispatchEvent(new CustomEvent('smartvms:cloud-synced', {
        detail: { tcId, record }
      }));
    } catch (e) {
      console.warn('Lỗi refresh UI sau sync:', e);
    }
  }

  // 9. Xóa trắng toàn bộ dữ liệu trên Supabase Cloud
  async function wipeCloudProjectData() {
    if (!cloudState.client) {
      console.warn('Supabase Cloud client chưa khởi tạo.');
      return { success: false, error: 'Chưa kết nối Cloud' };
    }
    try {
      // Xóa toàn bộ kết quả test trên bảng test_results
      await cloudState.client.from('test_results').delete().neq('tc_id', '___NONE___');
      // Xóa toàn bộ trao đổi bình luận trên bảng test_comments
      await cloudState.client.from('test_comments').delete().neq('tc_id', '___NONE___');
      // Xóa toàn bộ test cases tùy chỉnh trên bảng test_cases_custom
      await cloudState.client.from('test_cases_custom').delete().neq('tc_id', '___NONE___');
      // Xóa toàn bộ dự án, đợt test, phân công trên bảng test_sessions
      await cloudState.client.from('test_sessions').delete().neq('id', '___NONE___');
      // Xóa toàn bộ đợt kiểm thử trên bảng test_runs
      await cloudState.client.from('test_runs').delete().neq('id', '___NONE___');
      // Xóa toàn bộ danh mục test_modules
      await cloudState.client.from('test_modules').delete().neq('id', '___NONE___');

      cloudState.cloudRecordCount = 0;
      updateCloudStatusCountUI();
      console.log('⚡ [Cloud] Đã làm sạch toàn bộ dữ liệu dự án trên Supabase Cloud (0 dự án, 0 kết quả).');
      return { success: true };
    } catch (err) {
      console.error('Lỗi khi xóa dữ liệu trên Supabase Cloud:', err);
      return { success: false, error: err.message };
    }
  }

  // Khởi động khi DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    injectCloudWidgetToTopbar();
    initCloudSync(true);
  });

  // Export toàn cục
  window.initCloudSync = initCloudSync;
  window.pullCloudProjectState = pullCloudProjectState;
  window.pushProjectsToCloud = pushProjectsToCloud;
  window.pushCyclesToCloud = pushCyclesToCloud;
  window.pushAssignmentsToCloud = pushAssignmentsToCloud;
  window.pullCloudResults = pullCloudResults;
  window.pushAllResultsToCloud = pushAllResultsToCloud;
  window.pullCloudCatalog = pullCloudCatalog;
  window.pushCatalogToCloud = pushCatalogToCloud;
  window.syncResultToCloud = syncResultToCloud;
  window.syncCommentToCloud = syncCommentToCloud;
  window.wipeCloudProjectData = wipeCloudProjectData;
  window.openCloudManagerModal = openCloudManagerModal;
  window.closeCloudManagerModal = closeCloudManagerModal;
  window.triggerCloudPullManual = () => pullCloudResults({ silent: false });
  window.triggerCloudPushManual = () => pushAllResultsToCloud({ silent: false });
  window.saveCustomSupabaseConfig = () => {
    const u = document.getElementById('modal-cfg-sb-url')?.value;
    const k = document.getElementById('modal-cfg-sb-key')?.value;
    saveCloudConfig(u, k, true, true);
    initCloudSync(false);
  };

})(window);

