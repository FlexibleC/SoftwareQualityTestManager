/**
 * Vercel Serverless Function: /api/sync
 * Phục vụ phản hồi chuẩn HTTP 200 cho các yêu cầu đồng bộ kết quả kiểm thử trên Vercel Cloud.
 */
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.status(200).json({
    success: true,
    mode: 'cloud',
    engine: 'supabase',
    message: 'SQTM Cloud: Kết quả kiểm thử được đồng bộ qua kênh Supabase Realtime test_results.'
  });
};
