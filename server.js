/**
 * SMARTVMS TEST MANAGER - LAN & INTRANET HTTP WEB SERVER
 * Pure Node.js Web Server (Zero dependencies required)
 * Tự động phục vụ hệ thống test trong mạng LAN cơ quan và in mã QR / địa chỉ IP
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
  '.txt': 'text/plain; charset=utf-8'
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
  // CORS Headers để hỗ trợ gọi API mượt mà
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ENDPOINTS: Đồng bộ hóa nội bộ (LAN Mode) & Nạp Catalog động
  if (req.url.startsWith('/api/catalog')) {
    const catalogPath = path.join(ROOT_DIR, 'data', 'smartvms_test_catalog.json');
    const catalogJsPath = path.join(ROOT_DIR, 'data', 'smartvms_test_catalog.js');
    if (req.method === 'GET') {
      fs.readFile(catalogPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(data);
        }
      });
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const tcs = parsed.testCases || parsed;
          const fullCatalog = {
            schema: "https://smartvms.local/schemas/test-catalog-v4.json",
            title: "SmartVMS Local SingleSite 2026 — Danh mục Kịch bản Kiểm thử Chuẩn hóa",
            version: "3.5.0",
            exportedAt: new Date().toISOString(),
            totalTestCases: tcs.length,
            modules: parsed.modules || [
              { id: "M01", name: "Xác thực, Phân quyền & Quản lý Ca trực", short: "Auth & Ca trực" },
              { id: "M02", name: "Check-in Khách Đơn & Cấp phát Thẻ", short: "Check-in Khách" },
              { id: "M03", name: "Khách Đoàn, Người đi cùng & Lưu trú Qua đêm", short: "Đoàn & Đi cùng" },
              { id: "M04", name: "Check-out, Quản lý Phương tiện & Thu hồi Thẻ mất", short: "Check-out & Thẻ" },
              { id: "M05", name: "Giao diện Trực ban Cải tiến & Tra cứu Nâng cao", short: "Trực ban & Tra cứu" },
              { id: "M06", name: "Chi tiết Lượt khách & Dòng thời gian Timeline", short: "Chi tiết & Timeline" },
              { id: "M07", name: "Phân hệ Sổ sách Ngoại lệ - DataEntry", short: "Sổ sách DataEntry" },
              { id: "M08", name: "Quản trị Admin & Giám sát Vận hành", short: "Admin & Giám sát" },
              { id: "M09", name: "Trung tâm Báo cáo, Thống kê & Báo cáo Thẻ mất", short: "Báo cáo & Thống kê" },
              { id: "M10", name: "Cấu hình Hệ thống, Bốt trực & Đổi mật khẩu", short: "Cấu hình & Đổi pass" },
              { id: "M11", name: "Tích hợp Thiết bị Ngoại vi & Camera", short: "Thiết bị Ngoại vi" },
              { id: "M12", name: "Độ tin cậy & Tự phục hồi Offline/LAN", short: "Tin cậy & Offline" }
            ],
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

  // API ĐỒNG BỘ KẾT QUẢ TEST REALTIME TRONG MẠNG LAN
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

  // Phân tích URL và xử lý query string
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
              <p>Đường dẫn <code>${escapeHtml(safePath)}</code> không tồn tại trên hệ thống SmartVMS Test Manager.</p>
              <a href="/" style="color:#2563eb">Quay lại Trang Chủ</a>
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
  console.log('🚀 SMARTVMS TEST MANAGER - MÁY CHỦ MẠNG LAN ĐANG HOẠT ĐỘNG');
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

  console.log(`\n• Truy cập Online Internet toàn cầu (Vercel HTTPS):`);
  console.log(`  👉 https://smartvms-test-manager.vercel.app`);

  console.log(`\n• Cơ sở dữ liệu đám mây: Supabase PostgreSQL (Singapore Realtime)`);
  console.log('----------------------------------------------------------------');
  console.log('Nhấn Ctrl + C để dừng máy chủ bất cứ lúc nào.\n');
});
