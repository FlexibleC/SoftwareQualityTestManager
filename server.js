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
