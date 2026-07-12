/* =========================================================================
   ASSETFLOW — api.js
   Thin fetch() wrapper around the Express backend. Include this BEFORE
   app.js in index.html:
     <script src="api.js"></script>
     <script src="app.js"></script>
   ========================================================================= */

// Change this if your backend runs somewhere else (different port/host).
const API_BASE = 'http://localhost:5000/api';

/**
 * Core request helper. Every call:
 *  - logs the method + URL to the console so you can SEE it firing
 *  - throws a real Error with the server's message on non-2xx responses
 *  - returns parsed JSON (or null for 204/empty bodies)
 */
async function request(method, path, body) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  console.log(`[api] ${method} ${url}`, body || '');

  let res;
  try {
    res = await fetch(url, opts);
  } catch (networkErr) {
    // This fires if the backend isn't running, wrong port, or CORS is blocking it
    console.error(`[api] network error on ${method} ${url}:`, networkErr);
    throw new Error(`Could not reach the server at ${API_BASE}. Is the backend running?`);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    console.error(`[api] ${method} ${url} → ${res.status}:`, message);
    throw new Error(message);
  }

  console.log(`[api] ${method} ${url} → ${res.status}`, data);
  return data;
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const put = (path, body) => request('PUT', path, body);
const patch = (path, body) => request('PATCH', path, body);
const del = (path) => request('DELETE', path);

/* ============================== Named endpoints ============================== */
const Api = {
  // Roles
  getRoles: () => get('/roles'),

  // Departments
  getDepartments: () => get('/departments'),
  createDepartment: (data) => post('/departments', data),
  updateDepartment: (id, data) => put(`/departments/${id}`, data),
  deleteDepartment: (id) => del(`/departments/${id}`),

  // Employees
  getEmployees: () => get('/employees'),
  getEmployee: (id) => get(`/employees/${id}`),
  createEmployee: (data) => post('/employees', data),
  updateEmployee: (id, data) => put(`/employees/${id}`, data),
  updateEmployeeRole: (id, role_id, actor) => patch(`/employees/${id}/role`, { role_id, actor }),

  // Categories
  getCategories: () => get('/categories'),
  createCategory: (data) => post('/categories', data),

  // Assets
  getAssets: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs}` : '';
    return get(`/assets${suffix}`);
  },
  getAsset: (id) => get(`/assets/${id}`),
  createAsset: (data) => post('/assets', data),
  updateAsset: (id, data) => put(`/assets/${id}`, data),
  deleteAsset: (id) => del(`/assets/${id}`),

  // Allocation & transfer
  getAllocations: () => get('/allocations'),
  allocateAsset: (data) => post('/allocations', data),
  returnAsset: (data) => post('/allocations/return', data),
  getTransfers: () => get('/transfers'),
  getPendingTransfers: () => get('/transfers/pending'),
  requestTransfer: (data) => post('/transfers', data),
  approveTransfer: (id, actor) => patch(`/transfers/${id}/approve`, { actor }),
  rejectTransfer: (id) => patch(`/transfers/${id}/reject`),

  // Booking
  getBookableAssets: () => get('/bookings/bookable-assets'),
  getBookingsForDay: (assetId, date) => get(`/bookings?assetId=${assetId}&date=${date}`),
  createBooking: (data) => post('/bookings', data),
  cancelBooking: (id) => patch(`/bookings/${id}/cancel`),

  // Maintenance
  getMaintenance: () => get('/maintenance'),
  createMaintenance: (data) => post('/maintenance', data),
  updateMaintenanceStatus: (id, status, technician, actor) =>
    patch(`/maintenance/${id}/status`, { status, technician, actor }),

  // Audit
  getAuditCycles: () => get('/audit/cycles'),
  getAuditCycle: (id) => get(`/audit/cycles/${id}`),
  createAuditCycle: (data) => post('/audit/cycles', data),
  setAuditItemVerification: (itemId, verification) =>
    patch(`/audit/items/${itemId}`, { verification }),
  closeAuditCycle: (id, actor) => patch(`/audit/cycles/${id}/close`, { actor }),

  // Notifications & activity log
  getNotifications: () => get('/notifications'),
  markNotificationsRead: () => patch('/notifications/read-all'),
  getActivityLog: () => get('/activity-log'),

  // Dashboard & reports
  getDashboard: () => get('/dashboard'),
  getReports: () => get('/reports'),
};