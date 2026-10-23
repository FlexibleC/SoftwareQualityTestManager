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

  // 0. API XÁC THỰC VÀ BẢO MẬT (Authentication & Session Guard)
  if (req.url.startsWith('/api/auth/login')) {
    const loginHandler = require('./api/auth/login');
    return loginHandler(req, res);
  }
  if (req.url.startsWith('/api/auth/me')) {
    const meHandler = require('./api/auth/me');
    return meHandler(req, res);
  }

  // 1. API QUẢN LÝ DANH MỤC DỰ ÁN BỀN VỮNG (Multi-Project Database & Cloud Sync)
  if (req.url.startsWith('/api/projects')) {
    const projectsHandler = require('./api/projects');
    return projectsHandler(req, res);
  }

  // 2. API ENDPOINTS: Đồng bộ hóa nội bộ & Nạp Catalog kịch bản kiểm thử
  if (req.url.startsWith('/api/catalog')) {
    const catalogHandler = require('./api/catalog');
    return catalogHandler(req, res);
  }

  // 3. API ĐỒNG BỘ KẾT QUẢ TEST REALTIME
  if (req.url.startsWith('/api/sync')) {
    const syncHandler = require('./api/sync');
    return syncHandler(req, res);
  }

  // 4. API LƯU TRỮ TRẠNG THÁI HỆ THỐNG (Assignments, Cycles, Defects)
  if (req.url.startsWith('/api/state')) {
    const stateHandler = require('./api/state');
    return stateHandler(req, res);
  }

  // 5. PHỤC VỤ CÁC TỆP TĨNH (STATIC FILES)
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
