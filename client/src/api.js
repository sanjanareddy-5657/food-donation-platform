const BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
