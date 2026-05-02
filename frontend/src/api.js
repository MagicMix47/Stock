const base = '/api';

const getToken = () => localStorage.getItem('auth_token');
export const setToken = (token) => localStorage.setItem('auth_token', token);
export const clearToken = () => localStorage.removeItem('auth_token');
export const isAuthenticated = () => !!getToken();

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    return;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const login = async ({ username, password }) => {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
};

export const fetchPortfolio = () => request('/holdings');
export const addHolding = (body) => request('/holdings', { method: 'POST', body: JSON.stringify(body) });
export const updateHolding = (id, body) => request(`/holdings/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteHolding = (id) => request(`/holdings/${id}`, { method: 'DELETE' });
