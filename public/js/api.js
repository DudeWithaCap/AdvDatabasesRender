const API_BASE = '';

function getToken() {
  try { return localStorage.getItem('token'); } catch (_) { return null; }
}

function setToken(token) {
  try { localStorage.setItem('token', token); } catch (_) {}
}

function clearToken() {
  try { localStorage.removeItem('token'); } catch (_) {}
}

function getUserRole() {
  try { return localStorage.getItem('userRole'); } catch (_) { return null; }
}

function setUserRole(role) {
  try { if (role) localStorage.setItem('userRole', role); else localStorage.removeItem('userRole'); } catch (_) {}
}

function clearUserRole() {
  try { localStorage.removeItem('userRole'); } catch (_) {}
}

function isLoggedIn() {
  return !!getToken();
}

function isAnalyst() {
  return getUserRole() === 'Analyst';
}

function logout() {
  clearToken();
  clearUserRole();
  window.location.href = '/login.html';
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function fetchWithTimeout(url, options, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout. Is the server running?')), timeout)
    )
  ]);
}

async function fetchApi(path, options = {}) {
  const url = API_BASE + path;
  const config = {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  };
  let res;
  try {
    res = await fetchWithTimeout(url, config);
  } catch (err) {
    if (err.message.includes('timeout')) throw err;
    throw new Error('Network error. Is the server running at ' + window.location.origin + '?');
  }
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearToken();
    clearUserRole();
    window.location.replace('/login.html');
    throw new Error('Session expired');
  }

  if (res.status === 403) {
    window.location.replace('/dashboard.html');
    throw new Error(data.error || 'Access denied');
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

async function login(email, password) {
  const data = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  if (data.user && data.user.role) setUserRole(data.user.role);
  return data;
}

async function signup(email, password, name) {
  const data = await fetchApi('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
  setToken(data.token);
  if (data.user && data.user.role) setUserRole(data.user.role);
  return data;
}

async function getCategories() {
  return fetchApi('/api/categories');
}

async function getProducts() {
  return fetchApi('/api/products');
}
async function getProduct(id) {
  return fetchApi(`/api/products/${id}`);
}
async function updateProduct(id, body) {
  return fetchApi(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}
async function deleteProduct(id) {
  return fetchApi(`/api/products/${id}`, { method: 'DELETE' });
}

async function createProduct(body) {
  return fetchApi('/api/products', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function getOrders() {
  return fetchApi('/api/orders');
}
async function updateOrderStatus(id, status) {
  return fetchApi(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}
async function deleteOrder(id) {
  return fetchApi(`/api/orders/${id}`, { method: 'DELETE' });
}

async function getSalesByCategory() {
  return fetchApi('/api/analytics/sales-by-category');
}
async function getTopProducts(limit = 5) {
  return fetchApi(`/api/analytics/top-products?limit=${limit}`);
}
async function getSummary() {
  return fetchApi('/api/analytics/summary');
}

async function getLowStock(threshold = 5) {
  return fetchApi(`/api/inventory/low-stock?threshold=${threshold}`);
}
async function bulkRestock(items) {
  return fetchApi('/api/inventory/bulk-restock', {
    method: 'PUT',
    body: JSON.stringify({ items })
  });
}
