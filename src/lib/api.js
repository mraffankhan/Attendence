const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${baseURL}${endpoint}`, config);
  
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || 'API Error');
    error.response = { data };
    throw error;
  }

  return { data };
};

export default {
  get: (endpoint, options) => customFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => customFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => customFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => customFetch(endpoint, { ...options, method: 'DELETE' }),
};
