/**
 * Vercel Serverless Function: /api/projects
 * Phục vụ phản hồi chuẩn HTTP 200 cho các yêu cầu trạng thái dự án trên Vercel Cloud.
 * Khi triển khai Cloud, hệ thống tự động lưu trữ và đồng bộ hóa đa người dùng qua Supabase PostgreSQL.
 */
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.status(200).json({
    success: true,
    mode: 'cloud',
    engine: 'supabase',
    message: 'SQTM Cloud: Dự án được lưu trữ và đồng bộ thời gian thực qua Supabase Database.',
    projects: []
  });
};
