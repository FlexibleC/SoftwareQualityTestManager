/**
 * SQTM BACKEND SUPABASE ADMIN CLIENT (ZERO-DEPENDENCY)
 * Sử dụng native Node.js fetch() gọi thẳng Supabase PostgREST API
 * Vận hành ở tầng Máy chủ với Service Role / Private Access
 */

// Tự động nạp cấu hình từ tệp .env nếu tồn tại
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (e) {}

const DEFAULT_SB_URL = 'https://ilutfoarcrqxsgoapkct.supabase.co';
const DEFAULT_SB_KEY = 'sb_publishable_GiS2f75ruddsLkZhoHsq7g__LO1Qp-C';

const SUPABASE_URL = (process.env.SUPABASE_URL || DEFAULT_SB_URL).replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SB_KEY;

function getHeaders(extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation',
    ...extraHeaders
  };
}

/**
 * Truy vấn bảng trong Supabase
 * @param {string} table - Tên bảng (VD: 'app_users', 'projects')
 * @param {string} queryString - Query chuỗi PostgREST (VD: '?select=*&username=eq.admin')
 */
async function query(table, queryString = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${queryString}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Query Error [${res.status}]: ${errorText}`);
  }

  return await res.json();
}

/**
 * Thêm mới bản ghi vào bảng
 */
async function insert(table, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Insert Error [${res.status}]: ${errorText}`);
  }

  return await res.json();
}

/**
 * Thêm mới hoặc cập nhật bản ghi (Upsert)
 */
async function upsert(table, data, onConflict = 'id') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`;
  const headers = getHeaders();
  headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Upsert Error [${res.status}]: ${errorText}`);
  }

  return await res.json();
}

/**
 * Cập nhật bản ghi theo điều kiện query
 */
async function update(table, queryString, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${queryString}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Update Error [${res.status}]: ${errorText}`);
  }

  return await res.json();
}

/**
 * Xóa bản ghi theo điều kiện query
 */
async function remove(table, queryString) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${queryString}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Delete Error [${res.status}]: ${errorText}`);
  }

  return await res.json();
}

module.exports = {
  SUPABASE_URL,
  query,
  insert,
  upsert,
  update,
  remove
};
