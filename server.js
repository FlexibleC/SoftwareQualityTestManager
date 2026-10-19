/**
 * SOFTWARE QUALITY & TEST MANAGEMENT SYSTEM (SQTM) - LAN & INTRANET HTTP WEB SERVER
 * Pure Node.js Web Server (Zero dependencies required)
 * Tự động phục vụ hệ thống test trong mạng LAN cơ quan và in địa chỉ IP kết nối
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Tìm các địa chỉ IPv4 mạng LAN của máy
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  // CORS Headers để hỗ trợ gọi API mượt mà từ mọi nguồn LAN
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API QUẢN LÝ DANH MỤC DỰ ÁN BỀN VỮNG (Multi-Project Database on Disk)
  if (req.url.startsWith('/api/projects')) {
    const projectsPath = path.join(ROOT_DIR, 'data', 'projects_state.json');
    if (req.method === 'GET') {
      if (fs.existsSync(projectsPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        fs.createReadStream(projectsPath).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ projects: [], updatedAt: new Date().toISOString() }));
      }
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const projectsList = Array.isArray(parsed) ? parsed : (parsed.projects || []);
          const statePayload = {
            updatedAt: new Date().toISOString(),
            totalProjects: projectsList.length,
            projects: projectsList
          };
          if (!fs.existsSync(path.join(ROOT_DIR, 'data'))) {
            fs.mkdirSync(path.join(ROOT_DIR, 'data'), { recursive: true });
          }
          fs.writeFileSync(projectsPath, JSON.stringify(statePayload, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, count: projectsList.length }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // 2. API ENDPOINTS: Đồng bộ hóa nội bộ (LAN Mode) & Nạp Catalog động
  if (req.url.startsWith('/api/catalog')) {
    const catalogPath = path.join(ROOT_DIR, 'data', 'smartvms_test_catalog.json');
    const catalogJsPath = path.join(ROOT_DIR, 'data', 'smartvms_test_catalog.js');
    if (req.method === 'GET') {
      if (fs.existsSync(catalogPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        fs.createReadStream(catalogPath).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ modules: [], testCases: [] }));
      }
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const tcs = parsed.testCases || parsed;
          const fullCatalog = {
            schema: "https://sqtm.local/schemas/test-catalog-v4.json",
            title: parsed.title || "Software Quality & Test Management System — Test Catalog",
            version: parsed.version || "3.0.0",
            exportedAt: new Date().toISOString(),
            totalTestCases: tcs.length,
            modules: parsed.modules || [],
            testCases: tcs
          };

          fs.writeFileSync(catalogPath, JSON.stringify(fullCatalog, null, 2), 'utf8');
          fs.writeFileSync(catalogJsPath, 'window.SMARTVMS_DEFAULT_CATALOG = ' + JSON.stringify(fullCatalog, null, 2) + ';', 'utf8');

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, count: tcs.length }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // 3. API ĐỒNG BỘ KẾT QUẢ TEST REALTIME TRONG MẠNG LAN
  if (req.url.startsWith('/api/sync')) {
    const syncPath = path.join(ROOT_DIR, 'data', 'lan_sync_state.json');
    if (req.method === 'GET') {
      if (fs.existsSync(syncPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        fs.createReadStream(syncPath).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ results: {}, updatedAt: new Date().toISOString() }));
      }
      return;
    } else if (req.method === 'DELETE') {
      const current = { results: {}, updatedAt: new Date().toISOString() };
      fs.writeFileSync(syncPath, JSON.stringify(current, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, count: 0 }));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          let current = { results: {}, updatedAt: new Date().toISOString() };
          if (fs.existsSync(syncPath)) {
            try { current = JSON.parse(fs.readFileSync(syncPath, 'utf8')); } catch(e){}
          }
          if (payload.tcId && payload.record) {
            current.results[payload.tcId] = payload.record;
            current.updatedAt = new Date().toISOString();
          } else if (payload.results) {
            current.results = { ...current.results, ...payload.results };
            current.updatedAt = new Date().toISOString();
          }
          fs.writeFileSync(syncPath, JSON.stringify(current, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, count: Object.keys(current.results).length }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // 4. PHỤC VỤ CÁC TỆP TĨNH (STATIC FILES)
  let safePath = req.url.split('?')[0].split('#')[0];
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, decodeURIComponent(safePath));

  // Kiểm tra nếu là thư mục thì tìm index.html bên trong
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        if (readErr.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <div style="font-family:sans-serif; text-align:center; padding:50px">
              <h2>404 - Không tìm thấy trang</h2>
              <p>Đường dẫn <code>${escapeHtml(safePath)}</code> không tồn tại trên Hệ thống Kiểm Thử & Quản Lý Chất Lượng Phần Mềm (SQTM).</p>
              <a href="/" style="color:#2563eb; font-weight:700">Quay lại Cổng Đăng Nhập</a>
            </div>
          `);
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Lỗi máy chủ nội bộ: ${readErr.code}`);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, must-revalidate'
        });
        res.end(content);
      }
    });
  });
});

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('\n================================================================');
  console.log('🚀 HỆ THỐNG KIỂM THỬ & QUẢN LÝ CHẤT LƯỢNG PHẦN MỀM (SQTM v3.0)');
  console.log('   MÁY CHỦ MẠNG LAN / INTRANET ĐANG HOẠT ĐỘNG (PORT ' + PORT + ')');
  console.log('================================================================');
  console.log(`\n• Truy cập trên máy này:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`  👉 http://127.0.0.1:${PORT}`);

  if (ips.length > 0) {
    console.log(`\n• Cho các máy tính khác / điện thoại trong cùng mạng WiFi / LAN:`);
    ips.forEach(ip => {
      console.log(`  👉 http://${ip}:${PORT}`);
    });
  }

  console.log(`\n• Cơ sở dữ liệu đám mây: Supabase PostgreSQL Realtime`);
  console.log('----------------------------------------------------------------');
  console.log('Nhấn Ctrl + C để dừng máy chủ bất cứ lúc nào.\n');
});
