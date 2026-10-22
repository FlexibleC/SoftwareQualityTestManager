/**
 * Vercel Serverless Function: /api/catalog
 * Phục vụ phản hồi chuẩn HTTP 200 cho danh mục kịch bản kiểm thử trên Vercel Cloud.
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
    message: 'SQTM Cloud: Danh mục kịch bản được lưu trữ tập trung tại Supabase Cloud.',
    modules: [],
    testCases: []
  });
};
